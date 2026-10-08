# Public HTTPS deployment + Azure AD (Entra ID) SCIM provisioning

Entra's provisioning service can only reach a **publicly trusted HTTPS**
endpoint. This app supports three production shapes.

## Option T — Cloudflare Tunnel from your own machine (zero cloud bill)

The app stays on this machine; a `cloudflared` daemon keeps an outbound
tunnel to Cloudflare's edge, which serves real HTTPS on your hostname.
No open ports, free tier, EU data residency available in the CF zone.

One-time (interactive, needs your browser for the Cloudflare login):

```bash
node scripts/dev/go-live.cjs plan --hostname leadership.YOUR-DOMAIN.com --port 8001
# → writes %USERPROFILE%\leadership-production.env (KEEP PRIVATE) and
#   %USERPROFILE%\leadership-tunnel-config.yml

# hardened app launch (window 1) — anonymous admin locked, per-visitor
# rate-limit buckets from CF-Connecting-IP
cd <app> && set -a && source "$HOME/leadership-production.env" && set +a && node server.js

# tunnel (window 2)
cloudflared tunnel login
cloudflared tunnel create leadership        # → copy UUID into the config file
cloudflared tunnel route dns leadership leadership.YOUR-DOMAIN.com
cloudflared tunnel --config "$HOME/leadership-tunnel-config.yml" run leadership

# verify posture (window 3)
node scripts/dev/go-live.cjs check --url http://127.0.0.1:8001
# then from anywhere: https://leadership.YOUR-DOMAIN.com/api/health
```

Security posture when exposed this way (all verified by tests):
- `NODE_ENV=production` hard-disables loopback anonymous admin (boot refuses
  without `LEADERSHIP_TENANT_ID` and a ≥32-char `LEADERSHIP_MASTER_KEY`).
- `LEADERSHIP_TRUSTED_PROXY=127.0.0.1` makes the rate limiters trust
  `CF-Connecting-IP` (edge-set, cannot be spoofed through Cloudflare) —
  visitors get individual buckets instead of sharing the tunnel's.
- Register the Entra SCIM endpoint as `https://<host>/scim/v2`.

## Option A — reverse proxy (recommended for larger teams)

Keep the app on loopback; let nginx/caddy/IIS terminate TLS.

```bash
# run the app bound to loopback only
HOST=127.0.0.1 PORT=8001 node server.js
```

```nginx
server {
  listen 443 ssl;
  server_name leadership.example.gov;
  ssl_certificate     /etc/ssl/leadership.crt;
  ssl_certificate_key /etc/ssl/leadership.key;

  location / {
    proxy_pass         http://127.0.0.1:8001;
    proxy_set_header   Host $host;
    proxy_set_header   X-Forwarded-Proto https;
    proxy_http_version 1.1;
    proxy_buffering    off;          # SSE/realtime endpoints
    proxy_read_timeout 3600s;
  }
}
```

Start the app with `LEADERSHIP_TRUSTED_PROXY=1` (or the proxy's IP/CIDR) so
the rate limiters resolve real client IPs from the proxy's
`X-Forwarded-For` instead of collapsing everyone into one bucket. The app
talks to its own origin, so TLS termination at the proxy is fully
transparent to the client bundle.

## Option B — native TLS in the app

```bash
# PEM files
HTTPS_CERT=/etc/ssl/leadership.crt HTTPS_KEY=/etc/ssl/leadership.key \
HOST=0.0.0.0 PORT=443 node server.js

# or a PFX/PKCS#12 bundle (Windows/IIS export)
HTTPS_PFX=/certs/leadership.pfx HTTPS_PFX_PASS='********' \
HOST=0.0.0.0 PORT=443 node server.js
```

Bad cert paths abort boot with `tls_config_error` — fail fast, not half-secure.

## SCIM token lifetime & bearer rate limit (defaults are right for most)

| Env var | Default | Meaning |
|---|---|---|
| `SCIM_TOKEN_TTL_DAYS` | `90` | Bearer tokens expire after N days (re-issue in the app when Entra starts getting 401s). `0` disables expiry — not recommended. |
| `SCIM_RATE_LIMIT` | `300` | Requests/min per IP on `/scim/v2/*` (token-spray protection, audited when tripped). `0` disables. |

Expired/revoked tokens are rejected identically at the auth boundary; the
Settings → Organization card shows each token's expiry status in both languages.

## Connect Entra ID provisioning

1. App → Settings → **Organization** → select org → *SCIM-provisioning* card →
   **Issue token**. Copy the `scim_…` secret — it is shown **once**.
2. Entra admin center → *Enterprise applications* → *(your app)* →
   **Provisioning** → edit:
   - Tenant URL: `https://leadership.example.gov/scim/v2`
   - Secret token: the `scim_…` value
3. **Test connection** must report success, then enable provisioning:
   - Users: create/update/disable are full lifecycle (soft delete via
     `active=false`; local sessions die instantly).
   - **Groups**: assign Entra security groups; map each group to an app role
     via the group's `role` attribute (or encode `role:editor` in externalId).
     Role choices: `viewer | editor | admin | owner`.
4. Scope assignments → save.

## Boot at login (Windows autostart — reboot-proof go-live)

After `go-live.cjs plan` has produced the env + tunnel config and
`cloudflared tunnel login` + `create` + `route dns` are done once:

```bash
node scripts/dev/autostart-install.cjs install
# → %APPDATA%\…\Startup\leadership-app-start.cmd      (hardened env → node server.js)
# → %APPDATA%\…\Startup\leadership-tunnel-start.cmd   (waits for /api/health, then cloudflared)
```

Both run at every login, user-level (no admin rights, no services). Logs:
`%USERPROFILE%\leadership-app-service.log` and `…tunnel-service.log`.
Pre-flight the whole posture anytime with `node scripts/dev/go-live.cjs check`.
Remove with `node scripts/dev/autostart-install.cjs --remove`.

## Before you click "Test connection" in Entra

```bash
node scripts/dev/entra-readiness.cjs --host leadership.YOUR-DOMAIN.com --token scim_…
```

verifies, over the public hostname: publicly-trusted TLS (+ expiry), health
+ all 4 integrity chains, SCIM discovery and patch/filter advertisement,
garbage-bearer 401 (no echo), and — with the real token — a full create →
read → deactivate → delete SCIM lifecycle. All green = the Entra form below
will pass its test connection.

## Token hygiene

- Settings → SCIM-provisioning lists every token per org with a **prefix only**
  (`scim_35d7…`) — full secrets are never stored in plaintext-escaped views nor
  re-displayed.
- **Revoke** instantly breaks the IdP's credentials; provisioning will stop
  until a new token is issued and entered.
- All issue/revoke actions land in the tamper-evident audit ledger.

## Group → role model

| Entra group carries        | App effect                          |
|----------------------------|-------------------------------------|
| `role` attribute (PATCH/PUT/POST) | grants that role to all members |
| `externalId` containing `role:editor` | same, for Entra flows that don't send custom attrs |
| neither                    | defaults to `viewer`                |

Membership changes (user added/removed from a group) are picked up on the
next provisioning cycle as SCIM Group PATCH operations.
