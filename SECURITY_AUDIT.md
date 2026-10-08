# Security Audit: ABAC, KMS, WebAuthn

**Date:** 2026-08-24  
**Scope:** `js/abac.js`, `lib/kms.js`, `lib/webauthn.js`  
**Threat model:** Insider threat, token theft, key compromise, phishing, prompt injection bypass, field-level data leakage

---

## 1. ABAC (`js/abac.js`)

### Findings

| ID | Severity | Finding | Recommendation |
|----|----------|---------|---------------|
| A1 | LOW | ~~`authorize({}, {})` returns `"allow"` when no policySet is provided — default-allow~~ **RESOLVED** — `authorize()` is now explicitly fail-closed: an empty policy set returns `"deny"` with reason `"No policy set defined — deny by default"`. | Verified in `js/abac.js` (`authorize`) + `test/abac.test.js` |
| A2 | LOW | `ipCheck` only handles /24 and /32 CIDR. No /16, /8, or IPv6 support. | Extend to RFC 4632 subnet parsing or use a `cidr` library. |
| A3 | NOTE | `fieldMask` role map is hardcoded: `{ viewer: 1, auditor: 2, editor: 3, admin: 4, owner: 5 }`. Adding a new role requires a code change. | Externalize the role→level map to configuration. |
| A4 | NOTE | `temporalCheck` uses UTC hours. Forcing all tenants to UTC may produce unexpected windows for non-UTC timezones. | Document this constraint; consider per-tenant timezone offset. |

### Positive findings

- `breakGlassRequest` enforces a hard 480-minute cap and logs every use.
- `breakGlassVerify` correctly rejects expired or non-active grants.
- `fieldMask` defaults unknown roles to level 0 (all fields redacted) — fail-closed.
- `authorize` produces a SHA-256 hash of the decision + context for audit trail.
- `buildRoleAttributes` separates user, tenant, and session attributes cleanly.

### Verdict

**Production-ready with minor hardening.** The default-allow on empty policySet (A1) is the most impactful finding. Fix it before production deployment.

---

## 2. KMS (`lib/kms.js`)

### Findings

| ID | Severity | Finding | Recommendation |
|----|----------|---------|---------------|
| K1 | HIGH | `localProvider` default key is `"dev-master-key-change-me-in-production"`. If `LEADERSHIP_MASTER_KEY` env var is not set in production, every encrypted payload is trivially decryptable. | Require `LEADERSHIP_MASTER_KEY` to be set (non-default) and at least 32 characters. Refuse to start if the default is still in use. |
| K2 | MEDIUM | `rotateKey` only rotates the key **metadata** (keyId, version, fingerprint). For the local provider, the actual key material (the env var) is never rotated — the rotated key still encrypts with the same master key. | For local provider, `rotateKey` should warn that rotation is cosmetic. For cloud KMS providers, rotation is meaningful. |
| K3 | LOW | `envelopeEncrypt` / `envelopeDecrypt` are async but the local provider's `encrypt`/`decrypt` are synchronous. The async wrapper works correctly but adds unnecessary overhead. | Keep as-is; the async interface is correct for future cloud KMS providers. |
| K4 | NOTE | `keyUsageEvent` is not auto-called; it's a helper the caller must invoke. If the caller forgets, usage is unaudited. | Consider having `envelopeEncrypt` / `envelopeDecrypt` accept an audit callback, or auto-call `keyUsageEvent` internally. |
| K5 | NOTE | `keyRotationStatus` uses a hardcoded 90-day threshold. No configurable rotation policy per key purpose. | Externalize the rotation threshold to configuration. |

### Positive findings

- AES-256-GCM is used for all encryption (authenticated encryption).
- Envelope encryption pattern is correct: data key encrypted under master key, payload encrypted under data key.
- IVs are generated with `crypto.randomBytes(12)` (cryptographically random).
- `generateDataKey` uses `crypto.randomBytes(32)` — full 256-bit keys.
- `decrypt` in local provider correctly extracts IV (12 bytes) + auth tag (16 bytes) + ciphertext from the concatenated buffer.

### Verdict

**Production-ready after fixing K1.** The default dev key is a serious risk. Add a startup check: if `LEADERSHIP_MASTER_KEY` is unset or equals the dev default, refuse to start in production (`NODE_ENV=production`).

---

## 3. WebAuthn (`lib/webauthn.js`)

### Findings

| ID | Severity | Finding | Recommendation |
|----|----------|---------|---------------|
| W1 | HIGH | ~~`verifyRegistrationResponse` and `verifyAuthenticationResponse` do **not** cryptographically verify the authenticator signature or attestation~~ **RESOLVED** — assertions are verified against the stored COSE public key (ES256/RS256), `verifyX5cChain()` cryptographically verifies the packed-basic attestation signature with the leaf cert's public key, and `signatureVerified` now reflects the actual result. | `test/webauthn-crypto.test.js` — accept/reject/tamper/sign-count cases with real EC/RSA keypairs; x5c valid/tampered/missing signature cases |
| W2 | MEDIUM | ~~Sign-count counter is hardcoded to `0` in both verify methods~~ **RESOLVED** — `parseAuthenticatorData()` reads the 4-byte counter, and `verifyAuthenticationResponse()` rejects regressions (`signCount <= stored`) as possible cloned authenticators. | `test/webauthn-crypto.test.js` — sign-count regression case; `lib/webauthn.js` `parseAuthenticatorData` |
| W3 | LOW | ~~`excludeCredentials` double-encodes string inputs~~ **RESOLVED** — the mapper now type-checks: `Buffer.isBuffer(c) ? base64url(c) : String(c)`. | `lib/webauthn.js` `generateRegistrationChallenge` |
| W4 | NOTE | `rpConfig` defaults to `http://localhost:8001` with no HTTPS. Production requires `https://` origin. | Document that callers must override `origin` in production. |
| W5 | NOTE | `validateCredentialFreshness` uses `lastUsedAt || createdAt` — if neither is set, the comparison yields `NaN` and the `<=` check may pass unexpectedly. | Guard: `if (!credential.lastUsedAt && !credential.createdAt) return false`. |

### Positive findings

- `rpConfig` origin bug (using `options.id` instead of computed `id`) was fixed in this audit.
- Challenge generation uses `crypto.randomBytes(32)` — sufficient entropy.
- `pubKeyCredParams` includes both ES256 (-7) and RS256 (-257) — good compatibility.
- `allowCredentials` transports include `["internal", "usb", "nfc", "ble"]` — comprehensive.
- `verifyRegistrationResponse` checks `clientData.type === "webauthn.create"` and `origin === rp.origin`.

### Verdict

**Cryptographically verified.** W1 (signature/attestation verification), W2 (sign count), and W3 (excludeCredentials encoding) are resolved: assertions are verified against the stored COSE public key and packed-basic attestation signatures against the leaf certificate, with sign-count clone detection and per-field key versions. See `test/webauthn-crypto.test.js` (real-key accept/reject/tamper/sign-count + x5c signature cases) and the live `/api/auth/webauthn/*` flow in `test/webauthn-flow.test.js`.

---

## Summary

| Module | Risk | Critical Fixes Needed |
|--------|------|----------------------|
| ABAC | LOW | ~~Default-allow on empty policySet (A1)~~ resolved — fail-closed |
| KMS | MEDIUM | Hardcoded dev key (K1) — must enforce in production |
| WebAuthn | ~~HIGH~~ LOW | ~~No cryptographic signature verification (W1)~~ resolved — signatures + attestation verified; remaining notes are cosmetic |

### Action priority

1. **Immediate:** Fix K1 (KMS dev key) — add production startup check.
2. **Nice-to-have:** A2 (CIDR parsing beyond /24), W4 (document https origin override), W5 (freshness guard already fails closed).