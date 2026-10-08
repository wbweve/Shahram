# Leadership Platform — Capability Report (as of 2026-10-07)

One-page briefing for another engineer/AI: what this app is, what it can do today, how it is built, how it is verified, and where its honest gaps are. All counts marked "live" were measured from the working tree; counts marked "matrix" come from the repo's own release docs (`CAPABILITY_COMPLETION_MATRIX.md`, `FEATURE-TRUTH-MATRIX.md`).

---

## 1. What the app is

A bilingual (Danish/English) **leadership operating system** covering engineering project leadership, personal/team leadership, Danish HR & public-sector personnel management, finance, risk & process safety, compliance, and executive governance. Design pillars:

- **Click-only UX** — no free-text input anywhere; every field is a dropdown, picker, or chip (curated vocabularies in `js/calc.js`). Tests assert `window.prompt` is never called.
- **Bilingual by structure, not translation** — DA/EN live as parallel data pairs (`{en, da}` twins, `t(en, da)`, `L(da, en)`), proper Danish pluralization (`js/da-plural.js`), and region-specific cultural guidance (Nordic vs Anglo-Saxon) throughout.
- **Honesty doctrine** (`docs/WORKING-BASE.md`) — computed values are never typed; an undecided state names its missing evidence instead of guessing; empty registers show calm onboarding states, never fabricated urgency. This doctrine is enforced by tests and drift gates.
- Runs as a **static browser app** (open `index.html`, works offline as a PWA) *and* as a **Node server** with durable persistence, RBAC, and a large HTTP API.

## 2. Tech stack & runtime

| Layer | Choice |
|---|---|
| Frontend | Vanilla JS (no framework, no build step), `index.html` + `css/styles.css` + `js/*`, light/dark, responsive, PWA (`sw.js`, `manifest.webmanifest`), admin console `control-center.html`, public intake form `public-form.html` |
| Backend | Node.js HTTP server (`server.js`, `lib/router.js`, 86 route files in `lib/routes/`) |
| Persistence | Default JSONL append-only files (`server-data/`), optional **PostgreSQL** (`LEADERSHIP_PERSISTENCE=postgres`, migrations in `db/migrations/`, tenant RLS) |
| Deploy | `Dockerfile` + `docker-compose.production.yml` (healthchecks, volumes), `deploy-production.sh` |
| API contract | OpenAPI 3.1 (`api-spec.yaml`, **419 paths live**; matrix cites ~470 endpoints), TypeScript SDK (`sdk.ts`, ~1965 lines), Postman collection |
| Tooling | 288 npm scripts (live), ESLint, Husky, Playwright E2E (chromium/firefox/webkit), GitHub Actions CI, Stryker mutation configs |

Source scale (live): **660 modules in `js/`**, 325 files in `lib/`, 879 test files in `test/`, 475 navigation views. (`merged-js.txt` in the repo root is a full source dump of all 2,128 JS files if you need the corpus.)

## 3. Architecture & data model

- **Registers + workspace blob** — typed domain registers (tasks, risks, goals, budgets, conflicts, …) in a validated workspace document; every save creates a **hash-chained revision** (`workspace-history.jsonl`), so tampering is detectable.
- **Event-driven cross-module wiring** (`src/eventBus.ts`, `src/crossModuleWiring.ts`, `src/caseRegistry.ts`) — one record fans out: creating a task propagates to Kanban, Gantt, RACI, WBS, risk, budget, TODO actions, alerts, cockpit. A unified case index auto-links related cases idempotently in both directions.
- **Ten-point completion standard** per capability: versioned schema, tenant-isolated persistence, field/role-aware authorization, provenance & freshness, durable events (correlation/causation/dedupe/replay), human-safe automation (approval gates, idempotency, rollback), audit evidence + retention/legal hold, restore/RTO/RPO evidence, adversarial + a11y + localization tests, documented limitations.
- **Multi-tenancy** — `lib/tenant-context.js`, RLS migrations, tenant-isolation verifier, per-tenant feature flags; roles `viewer`/`auditor`/`editor`/`admin` with record-, field-, and purpose-aware scoping (e.g. viewer reads redact sensitive registers).

## 4. Capability inventory

### Work management (Monday/ClickUp-style)
Projects, memberships, tasks & subtasks, dependencies, custom fields, saved views, comments, watchers, activity history, work-graph workload/capacity analysis, optimistic concurrency (typed 409 `revision_conflict`, smart three-way merge on sync conflicts), idempotency/rollback. Views: list/table, Kanban, timeline/Gantt, **interactive calendar with drag-reschedule**, milestones (first-class API), recurring tasks (occurrence engine with skip/reschedule exceptions), forms/intake with public share links, graph-backed dashboards, portfolios, templates, goals/OKRs, time tracking, notifications inbox with per-channel preferences (email/webhook/Web-Push), docs/wiki with revision history & restore, whiteboards (spatial editor, task links), per-project chat, import/export.

### Engineering project leadership
PM tasks, Kanban, Gantt, risk register (RPN = S×O×D with banding), FMEA, RACI, WBS, milestones with slip, budget & variance, **EVM** (BAC/PV/EV/AC → CPI/SPI/EAC/VAC), standups, retrospectives (multiple frameworks), sprint planning, resource planning, scope/charter, quality gates, communications plan, procurement, change log, lessons learned.

### Personal leadership
SMART goals (5-dimension scoring), GROW coaching (auto-generated questions per stage), 360° feedback (SBI/COIN/CEDAR/Radical Candor), emotional intelligence (4-pillar score), Eisenhower time matrix, habit tracker with streaks, personal OKRs, DISC, Belbin (9 roles), Johari window, reflection journal, values, energy audit, 5-level delegation planner.

### Team & people
Team roster, 1-on-1s (**two-way**: employees propose agenda items via append-only prep log), team health (Lencioni), conflict resolution (Thomas-Kilmann, Glasl, NVC, mediation, triage-gated phases model), meetings, performance reviews, 70-20-10 development, recognition (with fairness view: unrecognised 60+ days are named), psychological safety (Edmondson 7-item), culture canvas.

### Danish HR & public-sector personnel management (large, Danish-law aware)
MUS/APV/trivsel, 1-5-10 sickness-contact ladder, absence patterns → fraværssamtale → sygedagpenge rules (120 days / day 30 / 2-month notice), holiday & leave with statutory notice periods (3+2+3), recruitment + 30-60-90 onboarding, change management, pay negotiation, offboarding, leadership foundation (ledelsesgrundlag), competence/education plans, retention (JE-attest deadlines), FC/FR key figures + long-range analytics, leadership calendar, conflict mediation guide (triage→Glasl→NVC), team-development wheel (assessed Tuckman), suggestion system (forbedringsforslag with 14-day answer discipline), weekly briefing (ugebriefing), team panel with anonymous pulse, quarterly cooperation review (team-samarbejdsrapport), senior policy, formal reaction ladder (reaktionstrappen), job rotation (substitution + subsidy gates), violence/threat handling, solution-focused leadership (0-10 scale conversations), core quadrant (Ofman), IBIS rounds, distance/hybrid leadership (KN/LOA agreements).

### Daily practice layer
**Dagsledelse** — one read answering "what needs action TODAY" across all registers with priorities and click-through. **Auto-generated meeting agendas** — tavlemøde, personalemøde, driftsmøde, per-person 1:1, each item with its opening question; printable PDFs. **Leader's own mirror** (leder-rytme) — are you practicing the cadence you expect of the team. **Employee's own page** (medarbejdersiden) — her 1:1 cadence, her suggestions, her prepared prompts. Plus onboarding program, recognition log, shift-handover register, critical-spares coverage. Maintenance-as-leadership: RCM, TPM (honest OEE), 5S, RCA/5-why.

### Strategy & decision
SWOT (auto SO/WO/ST/WT), PESTLE, weighted decision matrix incl. RAPID, RICE/WSJF, OKR scorecard with auto progress, scenario planning + stress tests, stakeholder map (influence×interest → strategy), balanced scorecard, strategy map, Hoshin Kanri X-matrix, decision outcome ledger with **per-domain calibration scoring** (your decision "shine line"), decision-debt tracking, decision simulation, ethical decision framework.

### Finance
Double-entry ledger with guard, accounts payable/receivable, purchase orders, expenses, fixed assets, inventory, revenue recognition, intercompany eliminations, payroll, financial statements, close-to-report pipeline, FX consolidation, bank-feed connector (Danish BIK CSV incl. `1.250,75` decimals, sandbox OAuth fixture, HTTP), cost centers, tax filing, transfer pricing/BEPS, treasury, pricing optimizer, **period close with sealed certificate** (reopen only via audited path), forensic audit, ROI/NPV/IRR, break-even/burn rate, financial ratios, EVM integration.

### Risk, process safety & resilience
Risk register/RPN/FMEA, bow-tie, risk appetite, Monte Carlo, COSO ERM/ISO 31000, heat maps, risk portfolio (systemic themes + RAROC-lite + vendor risk feed). **Process safety**: HAZID/HAZOP/LOPA/SIL verification (IEC 61508/61511 Route 1H+2L, HFT constraints), ATEX/Ex equipment marking compliance, QRA with UK-HSE tolerability, chemical register (GHS pictograms, H-statements, CAS/UN/ADR), PSSR startup gates, CAPEX FEL1→FID stage gates, life-saving rules, contractor prequalification, MOC, PTW. **Verification engines**: FTA/ETA (IEC 61025/62740, minimal cut sets, Fussell-Vesely importance), BIA (ISO 22301 MTPD/RTO/RPO), NIS2 (art. 23 24h/72h/1-month clocks), measurement quality (AIAG MSA GR&R, Cp/Cpk). Resilience: incident management with RCA, crisis war room, circuit breakers, chaos engineering, WORM storage, backup verification, DR/BCP with restore drills, multi-region, blue-green/canary deployment.

### Quality & qualification
DQ→FAT→SAT→IQ→OQ→PQ protocol phases with order validation, URS traceability (uncovered requirement blocks release), deviation management (closeout requires evidence, waivers require rationale), scaled sign-offs, all-or-nothing release verdict. Calibration & traceability (ISO/IEC 17025-style): instruments, certificates, traceable-to, uncertainty, as-found/as-left, expired-calibration twin-check against test runs.

### Compliance & governance
GDPR Art. 30 records, DPIA, DSAR, privacy redaction, whistleblower channel (confidential, purpose-bound), regulatory filing & change impact, compliance calendar (GDPR 72h, VAT, audit windows) with submission proof. ISO/IEC 27001:2022 **Statement of Applicability (all 93 Annex A controls)**, SOC 2 TSC (46/46 mapped), ISO 9001/14001/45001/50001/27001/31000/55001/22301/37001 element registers, Seveso III, OSHA PSM, CCPS RBPS, IEC 61511 SIS lifecycle. **EU AI Act readiness** (risk tiering, art. 5 screening, art. 4 literacy). Policy engine: declarative rules (finance thresholds, admin-role protection, automation default-deny) with explicit kill-switch, every decision returns matched rule + reason.

### Business operations
CRM, contracts, procurement, SLA manager, roadmap, resource management, vendor scorecards, benchmarking, portfolio optimizer, OKR automation, ESG reporting (ESRS S1), executive narrative, talent marketplace, knowledge management, channel management, supply-chain resilience, market intelligence, innovation pipeline, M&A playbook. **Sales management (Noratel)**: product catalog with deal drivers/standards, MEDDIC NQS qualification, 8-stage gated OEM pipeline, objection trainer, quote tracking (`NOR-YYYY-NNNN`), weighted forecast, win/loss analytics, customer register with health states.

### AI & intelligence
Multi-provider LLM layer (`lib/llm-inference.js`: OpenCode Zen/OpenRouter/Groq/Cerebras/OpenAI/Mistral/Ollama) with admin-registered **AES-256-GCM encrypted keys**, live provider health probes. AI mentor/coach answering grounded in live registers (Danish + English, deterministic where possible, 90-answer effectiveness measurement). Prompt-injection guard (multilingual — Danish + English, whole-request scanning), prompt isolation, DLP, abstention behavior, **claim-verified narratives** (every claim checked, unverified claims dropped or disclosed; degrades to deterministic engine without keys), model registry + drift monitoring, fairness auditor, explainability, RAG pipeline, AI red-teaming, federated learning, AI governance manifest gate (`/api/readiness` stays NOT_READY without hashed+HMAC-signed manifests).

### Trust, audit & attestation
SHA-256 **hash-chained audit** across audit/approvals/workspace-history/finance/decisions/automation-evidence. External chain anchoring (point-in-time notarization, third-party verifiable), **watchdog** with 0–100 Trust Score (chains 35/decisions 25/forecasts 20/calibration 20), daily signed attestation (tamper anywhere → FAIL), external notary export (honest 502 without a notary — never faked success), evidence packs with SHA-256 manifest (tamper = invalid), consistency verifier (same figure across modules must reconcile), retention & legal hold with dry-run purges, secrets rotation with fingerprints and old-credential-usage detection, forensic audit.

### Automation & operations
Durable job store + message queue + saga compensation, automation recipes (suggest → prepare → execute-with-approval), automation evidence chain (input snapshot + output), policy-gated defaults (risk/budget/approval actions always require a human), outbound webhooks (HMAC, backoff, idempotency, dead-letter), forecast→actual grading (MAPE + bias, bias-adjusted projections with disclosed adjustment), intervention experiments (deterministic A/B assignment, Welch's t-test, Bayesian Beta posterior, honest "inconclusive"), learning loops (policy recalibration from acks, weekly coaching brief), observability stack, SLO enforcement, IaC/K8s deployment modules, usage analytics (on-device only).

## 5. API & integration surface

- ~784 unique `/api/...` route patterns in `server.js` (live), **419 documented paths** in `api-spec.yaml` (live) with a conformance gate that boots the server and live-probes every documented route (silent spec drift fails CI).
- AuthN/Z: admin token or role-mapped bearer tokens (`LEADERSHIP_API_TOKENS`), **OIDC SSO** (authorization-code flow, RS256/ES256 ID-token verification, role derivation from group claims), **SAML SSO**, **WebAuthn with real ES256/RS256 signature verification**, SCIM provisioning, ABAC, delegated admin, digital signatures, KMS (production dev-key guard), field-level encryption, HMAC-signed backups/attestations.
- **15+ connectors** (Jira, GitHub, GitLab, Azure DevOps, Slack, Google Workspace, Salesforce, HubSpot, Xero, QuickBooks, NetSuite, SAP, BambooHR, Workday, Monday, ClickUp, …) with registry, worker, contract tests and hardening; imported records become canonical tasks.
- Printable PDFs for dossiers (SIL, NIS2, qualification protocols, daily cockpit, meeting agendas, cooperation review).

## 6. Tests & verification (how claims are kept honest)

- **879 test files** (live) incl. 284 core engine tests, 13 cross-domain journey E2E suites, 11+ browser journeys (jsdom/Playwright in jsonl **and** postgres modes), model-agreement differential tests (digital twin vs longitudinal sim).
- CI gates: coverage floor (50% lines / 35% functions / 45% branches), API conformance, golden eval baselines with drift detection, **DAST** (prompt injection, JSON smuggling, prototype pollution, path traversal, burst rate limits), i18n coverage pins (414 UI keys, 9 culture contexts, 85 glossary terms × 2 languages), gitleaks + CycloneDX SBOM + CodeQL, multi-browser Playwright.
- **Adversarial audit (2026-09-16)**: hostile-input drive found and closed 9 real defects (e.g. an English-only injection guard on a Danish-first platform, tenant header inconsistencies, raw runtime errors leaking to clients).
- The repo self-reports honestly: its own completion audit was corrected (2026-09-02) to **18 complete / 272 partial / 13 incomplete** once three audit points were made falsifiable — "partial" mostly means *evidence not produced*, not *broken*.

## 7. Known gaps (stated by the repo itself)

1. **Live vendor verification outstanding** — connectors, OIDC/SAML IdPs, and push channels are tested against mocks/fixtures; live OAuth/contract/webhook flows remain partial (`docs/WORK_MANAGEMENT_PARITY_MATRIX.md` is the canonical, conservative source).
2. **Shared-mode UI parity** — Kanban drag persistence, dependency-aware Gantt rescheduling, and full table configurability are partial in multi-user/postgres mode.
3. **Mobile clients** — no native app; mobile evidence unverified (PWA responsive only).
4. **AI governance partial** — multi-provider layer + guardrails exist, but production readiness gates (signed manifests, drift ops) are operational commitments.
5. **Deployment config items** (not code): reverse proxy/TLS termination, scheduled backup cron, alerting pipeline to notification channels, self-heal loop scheduler.
6. **Injection guard is lexical** — rephrased attempts in unmodelled idioms are misses, not blocks.
7. Realtime co-editing on whiteboards is whole-board save (a CRDT stack exists if wanted); chat lacks presence/threading.

## 8. Repository map

| Path | What |
|---|---|
| `index.html`, `css/`, `js/` | Browser app (660 modules: `ui.js` views, `store.js` state, `calc.js` engines, `i18n.js` DA/EN, per-domain engines) |
| `server.js`, `lib/`, `lib/routes/` | Node server, 86 route modules |
| `db/migrations/` | PostgreSQL schema (tenant RLS) |
| `control-center.html` | Governance admin console (Trust Score, queues, policy, evidence chains) |
| `api-spec.yaml`, `sdk.ts`, `postman-collection.json` | API contract + SDK |
| `test/` | 879 test files |
| `scripts/` | Build/drift gates, eval harnesses, audits, self-heal discovery |
| `CAPABILITY_COMPLETION_MATRIX.md`, `FEATURE-TRUTH-MATRIX.md` | Release-control inventories (this report's main sources) |
| `docs/WORKING-BASE.md` | The development doctrine (honesty rules, test contracts, bilingual structure) |
| `CHANGELOG.md` | Round-by-round history (currently rounds 62–65, Oct 2026) |
| `docker-compose.production.yml` | Production profile |

**Bottom line:** a very broad, deeply wired, bilingual leadership/operations platform with unusually strong auditability (hash chains, attestation, honest failure states) and test discipline, running today as a self-contained PWA + Node/Postgres server. Its soft spots are live third-party integrations, some shared-mode UI workflows, and mobile — everything else is implemented and covered by repository evidence.
