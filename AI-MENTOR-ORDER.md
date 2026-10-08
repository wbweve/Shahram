# The AI-mentor order — saved, and where each clause lives

This file is the durable record of the standing order for the AI in this
application. It was written so the requirement cannot drift out of the codebase
as a chat message: every clause names the implementation and the gate that
proves it. `scripts/check-matrix-evidence.mjs` verifies this file exists (it is
cited from `FEATURE-TRUTH-MATRIX.md`).

## The order (verbatim)

> The AI in the whole leadership application suppose to be there as a leadership
> mentor and problem solver for the users. It must guidance and recommend the
> most professional and correct solutions when the users register some new
> problem and challenge in the app. AI in the app must be active ALWAYS. It must
> navigate the users to fill the necessary charts and put information for the AI
> to solve any challenges and problems in leadership and management branch. The
> AI providers must solve everything in the application. The app must work like
> the user puts all information and inputs of the new challenge or situation and
> the AI generated application must solve them with the most up to date
> leadership and management science it has!!! Save the order and implement ALL
> you need to reach the ALL AI-capabilities in the application.

**One AI, not two.** There is no parallel "second AI": the mentor is a
capability of the existing coach engine (`js/coach.js`), the existing provider
layer (`lib/llm-inference.js` through `remoteCoachHook` in `server.js`) and the
existing tamper-evident answer log (`lib/coach.js`). A mentor answer can
therefore never contradict a coach answer, and there is only one place to keep
honest.

## Clause by clause

| Clause in the order | Where it is implemented | How it is proven |
|---|---|---|
| "leadership mentor and problem solver" | `js/coach.js` — `mentorSituations`, `mentorClassify`, `mentorIntake`, `mentorSolve`, `mentorGuidance`, `mentorCase`; `lib/coach.js` — `solveMentor` (injection guard → engine → provider → claim gate → answer log); routes `GET /api/coach/mentor/situations`, `/cases`, `POST /intake`, `/solve`, `/case` | `node test/coach.test.js` (63 checks: catalogue, classification, intake, governed solve, injection refusal, case round-trip, outcome follow-up, same answer chain) |
| "guidance and recommend the most professional and correct solutions" | Methods come **only** from the governed method registry via `mentorMethods` + `methodSelection` (a method that is not registered is reported as unregistered, never used as evidence); every numeric claim in a provider narrative is verified against the solution's own figures (`unsupportedFigures`) and the narrative is dropped with the disclosed reason when it invents one | `test/coach.test.js` ("every situation cites ONLY registered methods and real registers", "the solve never invents an owner, a measure or a review date", claim-gate checks); `test/llm-route-claim.test.js`; `test/ai-governance.test.js` |
| "AI in the app must be active ALWAYS" | `mentorStrip` + `renderMentorStripGuidance` in `js/ui.js` on every workspace view; `mentorGuidance` is never empty (an empty workspace is told to describe a challenge, never given fake urgency); the strip shows the live provider state from `GET /api/llm/status` | `test/coach-danish-ui.test.js` (always-on strip guidance + challenge starter), `test/view-render-integrity.test.js` (275 views, 0 console errors), `test/async-render-race.test.js` |
| "navigate the users to fill the necessary charts" | `mentorIntake` names the missing charts (with the register pre-fill it already has), each carries its target view (`situation.view`, `MENTOR_REGISTER_VIEWS`); `mentorNavButton` in `js/ui.js` renders a one-click hand-off on every missing chart, guidance row and no-data grounding fact; typed input is captured before navigating so the round trip loses nothing | `test/coach.test.js` ("every situation hands off to a real app view (no dead-end navigation)") — cross-checks the view ids against `js/ui.js`; `test/coach-danish-ui.test.js` (clicking a missing chart navigates; the described challenge survives the round trip) |
| "solve any challenges and problems in leadership and management branch" | 15 situations across 7 branches (performance & conduct, people, change, well-being/absence/safety, delivery & capacity, decision & mandate, self-leadership), each with its own chart set, methods, first moves and failure modes | `test/coach.test.js` ("mentor catalogue covers the leadership branches and is bilingual") |
| "the AI providers must solve everything" | The same provider chain as the coach with failover (OpenCode Zen/OpenRouter/Groq/Cerebras/OpenAI/Mistral/Ollama, or `LEADERSHIP_AI_ORCHESTRATOR_URL`), admin-registered encrypted keys (`/api/llm/credentials`), live health probe (`GET /api/llm/health`); the provider elaborates the grounded solution and the reply language is pinned per case (`coachMentorSystem`, `ANSWER LANGUAGE`) with a deterministic gate for drift (`languageDrift`) | `test/llm-http.test.js`, `test/llm-providers.test.js`, `test/llm-credentials-api.test.js`, plus the mock-provider checks in `test/coach.test.js` (prompt language, drift drop, term-of-art false positive) |
| "the user puts all information and inputs … and the AI solves them" | Flow: describe the challenge (strip, any view) → classify → guided intake charts (register-prefilled) → solve → save the case (`mentorCases`, cap 200, server-computed summary so a stored case cannot claim a solution it did not get) → reopen | `test/coach.test.js` (intake → solve → case → re-open → update in place), `test/coach-danish-ui.test.js` (the full jsdom journey incl. navigation) |
| "most up to date leadership and management science it has" | Grounding in the governed registry (`lib/method-registry.js` + the browser shim): evidence level, intended use, playbook (prepare/apply/observe/review), limitations, claim boundary, human-review requirement, prohibited uses, consent | `test/coach.test.js` ("the solve returns governed methods with playbook and claim boundary"), `test/method-registry-parity.test.js`, `test/ai-governance.test.js` |

## The three gaps the order's own matrix left open — now closed

The order was implemented in an earlier round, and `FEATURE-TRUTH-MATRIX.md`
recorded the residue honestly: *"Claim verification beyond numeric claims (no
semantic entailment check on prose), alerting when every provider dies (the
health probe must be pressed; nothing pages the admin), provider cost/rate
budget tracking"*. Each is now built, and each keeps the order's own discipline:
declare the boundary rather than round it up.

| Gap | Where it is implemented | How it is proven |
|---|---|---|
| The prose could invent an actor the registers never contained | `lib/coach.js` — `proseFindings`, `entailProse`, `PROFESSIONAL_VOCAB`; applied in `solveMentor` (after the figure and language gates, so the most specific reason wins) and in `ask` (one AI, one discipline); surfaced as the evaluation's own `entailment` rule (`MENTOR_EVAL_CHECKS`) so the provider comparison measures the path production runs | `test/mentor-entailment.test.js` (18 checks: the grounded solution passes its own gate; "Ansvarlig: lederen selv" and Danish terms of art are not mistaken for names; grounded roster names pass; an invented owner and an actor behind a contact verb are dropped with the name disclosed; a lone unknown capital OUTSIDE those slots is only noted — never a drop; the wire path proves the drop reaches the tamper-evident log while the deterministic solution is still delivered) |
| Nothing noticed when every provider died | `lib/llm-watchdog.js` (state machine) + `server.js` (`runProviderWatchdog`, `recordProviderProbe`, `deliverProviderAlert`, `startProviderWatchdog`); routes `GET /api/llm/watchdog` and `POST /api/llm/watchdog/probe`; the verdict rides on `GET /api/llm/status` and is rendered by the always-on mentor strip on every view (`js/ui.js` `bindMentorStrip`) and by the AI status view; `middleware/notifications.js` `buildProviderOutageNotice` | `test/llm-watchdog.test.js` (19 checks: transitions, the threshold, no false recovery when nothing answers below it, one page per outage, recovery with the outage window, flap rate-limiting, escalation never rate-limited, persistence, a corrupt state file cannot wedge the monitor) and `test/llm-watchdog-api.test.js` (15 checks over real HTTP: healthy → unverified → down with the alert → recovery, the alert on the audit chain, the meter, and the load-bearing distinction that a spent budget is NOT reported as an outage) |
| Spend was unbounded and unmeasured | `lib/llm-usage.js` (ledger + budget) wired into `lib/llm-inference.js` through `setUsageSink` (exact counts from the provider's own `usage` block or Ollama's eval counts; length-derived counts marked as `estimatedCalls`); enforced in `generate()` BEFORE the call; route `GET /api/llm/usage`; the budget line is rendered on the AI status view | `test/llm-usage.test.js` (18 checks: exact vs estimated recording, per-day isolation, estimated cost with unknown providers at zero, operator price override, malformed price table, warn threshold, the refusal-with-reason over a real HTTP provider, that no call is made once refused, that removing the limit restores answering, and that a corrupt ledger fails OPEN so budgeting can never silence the mentor) |

### The boundaries these three keep

- **The entailment guard is lexical over named actors, not full NLI.** It proves
  that no new person, team or supplier entered an owner slot or a contact verb.
  It cannot judge whether a paragraph's MEANING is entailed, so an ungrounded
  assertion that names nobody — a policy, a legal claim, a trend — still passes.
  It is deliberately asymmetric: dropping a valid narrative costs the leader a
  real answer, so only the unambiguous slots may block one.
- **Cost is an estimate, never a bill.** The shipped table is published list
  prices read 2026-08-01 and is overridable with `LEADERSHIP_LLM_PRICES`; an
  unpriced provider reports 0 rather than a guess.
- **A spent budget is not an outage**, and the watchdog proves it: the watchdog
  probes the PROVIDER, the budget refuses the APP's spend, and `test/llm-watchdog-api.test.js`
  pins the distinction so an operator never chases a dead key that isn't dead.
- **The page needs a channel.** Out-of-band alerting requires `SMTP_HOST` and
  `LEADERSHIP_NOTIFY_TO`; without them the alarm is in-app, on the audit chain
  and on webhooks, and the watchdog runs only while the process is up — it does
  not replace an external dead-man's-switch.

## Extensions beyond the order (built, and labelled as extensions)

These are not asked for by the order; they were named in an earlier round as
"beyond the order" and are now implemented, so they are recorded here rather
than left as vague future work.

| Extension | Where it is implemented | How it is proven |
|---|---|---|
| The AI budget is per identity, not per deployment | `lib/llm-usage.js` charges every provider call to a SCOPE CHAIN `user:<id> → tenant:<id> → global`, and a call is refused when ANY tier in its chain is over its own limit (`LEADERSHIP_LLM_USER_DAILY_*` / `LEADERSHIP_LLM_TENANT_DAILY_*` / the global pair); identity comes from the request scope `server.js` establishes, so no call site threads it through; a v1 deployment-wide ledger migrates to `global` instead of being discarded; `topScopes` answers "who burned the quota?" | `test/llm-usage-scope.test.js` (23 checks: chain, de-duplication, per-user cap protects colleagues, per-tenant cap protects other tenants, global still binds, unset tier is unlimited, v1 migration, cohort isolation) |
| A claim that names nobody is still a claim | `lib/coach.js` blocks a specific legal citation the grounded solution never made (`§ 12`, `Funktionærloven`, `Article 17`) and a formal obligation or entitlement where the ground asserts none — the two classes that name no actor but change what a leader does; a regime name (GDPR) and a generalisation stay disclosed notes, because punishing vocabulary or legitimate advice costs the leader more than it protects | `test/mentor-entailment.test.js` (9 further checks: citation novelty in both languages, same-paragraph pass, different-paragraph block, obligation class vs honest paraphrase, and the live wire path) |
| The remaining limits are auditable, not implied | `scripts/check-ai-operations.mjs` reads the environment as data and names every guarantee a deployment has switched off (provider, watchdog, a page that can leave the process, a usable monitor URL and a sane cadence, a daily budget tier, the PER-USER tier, a dated price table), each with the env var that fixes it; the report runs in `npm test`, `npm run check:ai-ops:strict` fails the build on the monitor/budget guarantees, and `scripts/dev/go-live.cjs check` runs it before letting a deployment go public | `test/ai-operations-audit.test.js` (15 checks incl. the CLI exit codes run with a scrubbed environment, so a developer machine's own keys cannot make the gate pass or fail) |
| Every role sees the truth about the AI, not only admins | the liveness verdict rides on the viewer-readable `/api/llm/status` and the always-on strip states it on every view (with the AI's own status kept as a SEPARATE element, so an ops problem never hides a working AI); the admin payload keeps the operator detail, the viewer payload never carries the ping URL or an error string | `test/deadman-strip-browser.test.js` (15 checks driving the real strip in jsdom against the real payload shape), `test/deadman-api.test.js` (the viewer token gets the verdict; `reason`/`lastError`/`alertLog` are absent) |
| The app proves it is alive — it cannot page about its own death | `lib/deadman.js` beats on a schedule to an external monitor check URL (`LEADERSHIP_DEADMAN_PING_URL`), so silence is what pages; it folds beats into `unconfigured` / `misconfigured` / `beating` / `ping_failing` / `overdue`, reports only transitions, measures the silence across a restart, and pages when the CHECK-IN itself stops landing (a dead switch that silently stopped reporting is worse than none) | `test/deadman.test.js` (27 checks: states, thresholds, late/missed beats, boot gap, flap protection, persistence, the HTTP client incl. timeout and 4xx), `test/deadman-api.test.js` (15 checks over real HTTP: boot check-in, forced beat, 404 monitor, recovery, and the honest "nothing is watching" states) |
| A solved case gets followed up, not just answered | `mentorOutcome` records which of the plan's measures were carried out and what changed; `mentorReview` names the cases whose measures still lack follow-up so the always-on strip nudges live cases; the printed one-page action plan carries owner, measure, review date and the evidence level of each method | `test/coach.test.js` (outcome recorded on the case, review names the unfollowed measures), `test/coach-danish-ui.test.js` (the outcome form posts the leader's own judgement incl. per-measure flags; the action plan renders) |
| The mentor states how current its science is | `js/method-registry.js` carries `EVIDENCE_AS_OF` (the date the evidence basis was last read) and a review interval, and `evidenceCurrency()` turns that into a disclosure the app prints: the date, the next review due, and whether the interval has lapsed — a dated registry says "current", a LAPSED one says **PAST the interval, re-read the registry** and never also claims currency, an undated one says the currency **cannot be asserted**, and `oldestEvidenceBasis()` makes the claim only as current as its OLDEST basis rather than averaging a late-read method away. It rides into the mentor answer and the printed action plan in both languages, and each cited method carries its own date | `test/method-evidence-currency.test.js` (16 checks: boundary arithmetic in calendar months, 31 Jan + 1 month, undated honesty, oldest-basis reduction, node/browser parity of the exact wording, and the solve carrying it in en + da) |
| "Active ALWAYS" is measured on every view, not asserted | `test/mentor-always-on-census.test.js` walks all 275 navigable views and requires the full always-on mentor (guidance line, situation picker with every situation, the one-sentence challenge starter, the chat input, the liveness chip); a view may omit it ONLY if it carries the mentor conversation itself, and that is PROVEN at skip time so a hand-written skip list cannot quietly grow; the learning page is no longer skipped, because that is where a leader lands when they do not know what to do next | `test/mentor-always-on-census.test.js` (3024 checks). It also drove two real fixes: an AI status placeholder that never resolved when the status request failed, and an unguarded `kpis` read in the advanced-verification hydration that threw inside a promise continuation |
| Which provider actually serves the app is measured, not assumed | `GET /api/llm/eval` (admin) runs the four mentor cases through every configured provider with PRODUCTION's own prompt and budget and scores them against the runtime contract (contract · language · no invented figure · method named · length) | `test/coach-danish-ui.test.js` (the comparison renders providers, scores, per-case rules and a sample answer), `test/admin-route-authorization.test.js` (the route is admin-gated). Live measurement 2026-09-15: groq 90%, openrouter 0% (HTTP 401), cerebras 0% (HTTP 402) |

## Found by the adversarial audit (2026-09-16) — nine defects, each now a test

`scripts/audit/` drives the app the way a hostile or broken client does. Full
findings and evidence are in the CHANGELOG; these are the ones that concern the
mentor itself:

| Defect | Fix | Test |
|---|---|---|
| The injection guard was **English-only** — every Danish attempt scored `none`, so it was not flagged, not declined, and reached the provider as an ordinary question | Danish patterns added, mirroring the English list; the object of the verb must be the ASSISTANT's rules | `test/injection-guard-multilingual.test.js` (17 Danish attempts caught, 608 strings of the app's own Danish never refused, 10 legitimate leadership phrasings untouched) |
| A payload hidden in a **chart value** bypassed the guard entirely (it read only `problem`) and was still sent to the provider | the whole request is scanned; the field that tripped it is disclosed, never its text | same file (chart bypass, en + da, plus benign chart values) |
| The refusal was **English-only**, so a Danish leader was refused in the wrong language | the refusal follows the leader's language in both the coach and the mentor | same file + `test/adversarial-regressions.test.js` |
| A non-string `problem` **threw** in `String()` and the raw runtime message reached the client; `mentorCase` stored `"[object Object]"` as the leader's own answer | one safe coercion for all free text; an object is not an answer, an empty chart is | `test/adversarial-regressions.test.js` |
| `mentorSolutionText()` **threw on a declined solution** (it has no `methods`), so any consumer of the exported renderer lost the answer | a declined solution carries the same iterable shape, and the renderer prints the refusal | `test/adversarial-regressions.test.js` |
| The tenant guard and the routes gave **two different answers** for the same organization (member org accepted via `x-org-id` but silently scoped to the home tenant; refused 403 via `x-tenant-id`), which locked the mentor routes for a member using the other header | one shared tenant resolver for the guard and the routes | `test/tenant-org-header-consistency.test.js` (17 checks, incl. cross-tenant read/write refusal on the mentor case store) |
| The strip's AI status stayed an unresolved "…" when the status call failed — the app looked like it was thinking while it had nothing to say | the strip says the status is unavailable and names the deterministic engine | `test/mentor-always-on-census.test.js` |
| A report section without its `kpis` block threw inside a promise continuation in the advanced-verification view | the block is read through a fallback | `test/view-render-integrity.test.js` + the census |

Mentor effectiveness was measured, not assumed: 15 situations × 2 languages ×
3 intake levels = 90 answers, all deterministic, 15/15 distinct, most-similar
pair 0.019 Jaccard, 4–5 cited methods and 1,663–2,048 characters per answer.

## Boundaries that stay (honesty is part of the order)

- The mentor **proposes, humans decide** — a solution always states confidence,
  the charts still missing, the failure modes and whether human judgment is
  required; sensitive areas (personnel, health, safety) always require it.
- **No provider key = still working AI**: the deterministic, register-grounded
  solution is the whole answer and the app says so instead of pretending.
- **No surveillance**: contact discipline, absence and conflict registers judge
  the leader's practice, never track people's activity.
- **Injection attempts are declined, never forwarded** to a model
  (`injectionGuard` + `remote.skipped === "injection"`).

## Re-verify (all of it)

```bash
node test/coach.test.js && node test/coach-danish-ui.test.js && node server-test.js
node test/admin-route-authorization.test.js && node test/view-render-integrity.test.js
node test/mentor-entailment.test.js && node test/llm-watchdog.test.js
node test/llm-watchdog-api.test.js && node test/llm-usage.test.js
node test/llm-usage-scope.test.js && node test/deadman.test.js && node test/deadman-api.test.js
node test/deadman-strip-browser.test.js && node test/ai-operations-audit.test.js
node test/method-evidence-currency.test.js && node test/mentor-always-on-census.test.js
node test/injection-guard-multilingual.test.js && node test/tenant-org-header-consistency.test.js
node test/adversarial-regressions.test.js
# audit harnesses (report to a human; 0 findings expected)
node scripts/audit/mentor-effectiveness.mjs && node scripts/audit/hostile-probe.mjs
node scripts/audit/http-mentor-attack.mjs && node scripts/audit/mentor-tenant-isolation.mjs
node scripts/check-matrix-evidence.mjs && node scripts/check-test-census.mjs
npm run check:ai-ops          # report: what this deployment has switched off
npm run check:ai-ops:strict   # fails the build on an unmonitored/unbounded deployment
npx eslint js lib middleware server.js
```

## Operating the AI layer (env)

| Variable | Default | What it does |
|---|---|---|
| `LEADERSHIP_AI_WATCHDOG` | `on` | `off` disables the background provider monitor |
| `LEADERSHIP_AI_WATCHDOG_INTERVAL_MS` | `900000` (15 min) | Probe cadence; minimum 60 s |
| `LEADERSHIP_AI_WATCHDOG_THRESHOLD` | `2` | Consecutive all-down probes before it is called an outage |
| `LEADERSHIP_NOTIFY_TO` + `SMTP_HOST` | unset | Where an outage page is emailed; without them the alarm is in-app/webhook only |
| `LEADERSHIP_LLM_DAILY_TOKEN_BUDGET` | `0` (unlimited) | Tokens per UTC day for the whole deployment before `generate()` refuses and the deterministic engine answers |
| `LEADERSHIP_LLM_DAILY_COST_BUDGET` | `0` (unlimited) | Estimated USD per UTC day for the whole deployment, same refusal path |
| `LEADERSHIP_LLM_USER_DAILY_TOKEN_BUDGET` / `..._USER_DAILY_COST_BUDGET` | `0` (unlimited) | Per USER per UTC day; set it so one runaway client is refused while colleagues keep working |
| `LEADERSHIP_LLM_TENANT_DAILY_TOKEN_BUDGET` / `..._TENANT_DAILY_COST_BUDGET` | `0` (unlimited) | Per TENANT per UTC day; set it so one tenant cannot spend the deployment's quota |
| `LEADERSHIP_DEADMAN` | `on` | `off` disables the outbound liveness check-ins |
| `LEADERSHIP_DEADMAN_PING_URL` | unset | The external monitor's check URL (healthchecks.io, Cronitor, Uptime Kuma, nagios). Unset = the app reports honestly that NOTHING outside it is watching |
| `LEADERSHIP_DEADMAN_INTERVAL_MS` | `300000` (5 min) | Check-in cadence; it must be shorter than the monitor's grace window or every quiet hour pages |
| `LEADERSHIP_DEADMAN_TIMEOUT_MS` | `10000` | Per-check-in timeout; a hung monitor is a failure, not a hang |
| `LEADERSHIP_DEADMAN_FAIL_THRESHOLD` | `2` | Consecutive failed check-ins before the switch is called broken |
| `LEADERSHIP_DEADMAN_OVERDUE_FACTOR` | `1` | Lateness (× interval) that counts as a missed beat — the app's own scheduler not firing on time |
| `LEADERSHIP_DEADMAN_MISSED_FACTOR` | `3` | Boot-gap (× interval) reported as a missed window after downtime |
| `LEADERSHIP_AI_OPERATIONS_REQUIRED` | unset | `1` makes `npm run check:ai-ops` (and any `go-live check`) fail on an unmet monitor/budget guarantee, so a production job demands coverage without changing its command line |
| `LEADERSHIP_LLM_BUDGET_WARN_PCT` | `80` | Advisory threshold so the operator is warned before the refusal |
| `LEADERSHIP_LLM_PRICES` | published list prices (2026-08-01) | JSON `{"provider":{"in":…,"out":…}}`, USD per 1M tokens — an estimate |
| `LEADERSHIP_LLM_USAGE_KEEP_DAYS` | `60` | Ledger retention |
