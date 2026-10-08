# PROACTIVE_AI_SPEC.md — The proactive mentor: the AI opens the case for you

The standing order (`AI-MENTOR-ORDER.md`) made the mentor always-on and
register-grounded. This spec closes the gap the order left implicit: the leader
must still open the case. A busy leader with five projects does not. So the
mentor now detects candidate situations from the live registers, prepares the
intake itself, and hands the leader a **one-tap review card** — the leader
confirms, they never type. The discipline of the existing chain is unchanged:
deterministic detection, governed solving, human decision.

## The design in one paragraph

A new deterministic module (`lib/proactive-mentor.js`) scans the active
workspace's registers for **signal clusters** (overdue + blocked tasks, open
conflicts, unresolved conduct issues, capacity gaps, active absences, stale
changes). Each cluster maps to exactly one governed mentor situation from
`js/coach.js`'s `MENTOR_SITUATIONS` — by ID, never by guessing. The same
`register-intake-bridge` the intake flow already uses pre-fills the charts and
generates the problem line, so a proposal carries citations to the registers it
came from. Proposals become **pre-filled mentor cases** in one human click;
solving runs **only** through the governed `solveMentor` chain (injection guard
→ method registry → claim gate → entailment guard → tamper-evident log). The
queue that delivers them is the existing automation queue: paused by
`LEADERSHIP_AUTOMATION_PAUSED`, idempotent, audited, kill-switchable — and the
proposed case is *proposed*, never solved or closed, by automation.

## The order this keeps (and the clause it extends)

| Clause | Where it is implemented | How it is proven |
|---|---|---|
| "The AI must be active ALWAYS" — now including initiating | `lib/proactive-mentor.js` — `detectSituations`, `buildProposal`, `proactiveProposals`, `createCaseFromProposal`; wired into the scheduler in `server.js` and read by the always-on mentor strip via `GET /api/mentor/proactive` | `test/proactive-mentor.test.js` (detection from seeded registers, citation-bearing prefill, idempotent proposals, no proposal when registers are empty, gate behaviour, create → governed solve → audit wiring) |
| "Navigate the users to fill the necessary charts" — inverted | The charts are pre-filled FROM the registers via `LCRegisterBridge.autoIntake`/`mergeAutoIntake`; `mentorIntake` recomputes progress server-side at creation, so a proposal never claims inputs it does not have | `test/proactive-mentor.test.js` (prefilled keys ⊆ situation charts; missing charts named honestly in the proposal) |
| One AI, not two | The proposal's *text* is deterministic template text (no new narrative surface); the optional elaboration is the SAME `solveMentor` the case view already calls — no parallel provider path, no second persona | `test/proactive-mentor.test.js` (a created case solved via `/api/coach/mentor/solve` logs through the tamper-evident answer log — one chain) |
| Human gate (roadmap non-negotiable) | Automation may CREATE a proposal and a draft case in state `open` with `origin: "proactive"`; it may never solve, close, or acknowledge on the leader's behalf. Acknowledgement stays a human act | `test/proactive-mentor.test.js` (auto-created case is `open`, unsolved, and carries `origin`; the queue does not call solve) |

## Directions B, D, E — what already exists, what this adds

| Direction | Status found in the codebase | This spec's action |
|---|---|---|
| B — One AI coherence | `lib/coach.js` governs `ask` and `solveMentor` (claim gate, entailment, answer log). Four narrative surfaces (`ai-briefing`, `proactive-push`, `predictive-navigator`, `automation-integration`) still call `ai-mentor.js`/`personalized-mentor.js` directly | Slice 1 now: the proactive layer adds ZERO new narrative paths — it reuses the strip and `solveMentor`. The full migration of the four surfaces is specified below ("Coherence backlog") and stays in `FEATURE-TRUTH-MATRIX.md` until done |
| D — Governance modes | Tiered model exists (`tier: auto`/`approve`, `requiresHumanApproval`, `automationControls.automationGate`, pause + kill switch, job hash chain) | The proactive queue rides the same gate: proposals are `tier: "auto"`, delivery is suppressed when paused or when the chain is invalid, and creation is idempotent per (situation, signal, day) |
| E — Local evidence | `lib/method-effectiveness.js` ranks methods by recorded outcomes and `solveMentor` already attaches `result.methodRanking` | The proposal card and the created case surface the ranking verbatim; no new scoring logic. The evidence line is template text built ONLY from the ranked records — never prose |

## Data and flow

1. **Scan** — on the automation interval (`startAutomationScheduler`) and on
   demand (`GET /api/mentor/proactive?lang=da|en`), the server calls
   `proactiveProposals(activeProjectState, { lang })`.
2. **Match** — `detectSituations` returns `{ situationId, signals[], confidence }`
   pairs for the situation profiles it recognizes. Deterministic thresholds,
   listed in the module header and pinned by the test.
3. **Prepare** — `buildProposal` merges register auto-intake over the charts of
   the situation, generates the problem line, and computes honest progress with
   the engine's own `mentorIntake`.
4. **Deliver** — proposals are surfaced by the always-on mentor strip and the
   mentor panel; each card carries the pre-filled charts, the missing ones, and
   two buttons: **Create case** (one click, `origin: "proactive"`) and
   **Dismiss today** (per-day suppression, stored on the workspace, audited).
5. **Create** — `POST /api/mentor/proactive/create` re-runs `buildProposal`
   server-side (the client never posts case content), normalizes with the
   engine's `mentorCase`, stores it on the project, audits it, and returns the
   case. Solving is the leader's next click and goes through the existing
   `POST /api/coach/mentor/solve`.

## Boundaries kept

- **Detection is lexical/counting logic, not inference.** It can be wrong; it is
  therefore never more than a proposal with citations, and the leader's
  dismissal is respected for the day.
- **A proposal is not a case, and a case is not a solution.** The chain
  proposal → case → solution → outcome is unchanged; automation touches only
  the first link.
- **Sensitive situations (conflict, conduct, absence, trust) carry the same
  `sensitive: true` flag** as in the catalogue, and their proposals keep the
  catalogue's own cautionary wording rather than naming people.
- **No new provider spend.** Detection and delivery are deterministic; the only
  LLM touch is the solve the leader already initiates.

## Coherence (B — DONE, one AI everywhere)

The backlog is closed. Every server-side narrative surface now derives from
the governed mentor engine (`js/coach.js`) through **`lib/coach-gateway.js`**
(the one door), and the one remote-model sentence the app composes outside the
solve path lands on the tamper-evident answer log:

| Surface | Before | Now |
|---|---|---|
| `js/automation-integration.js` — dashboard guidance, `getMentorGuidance`, decision frameworks, 1:1 prep | `ai-mentor.js` heuristic catalogue | `coachGateway.situationalGuidance` / `governedDecisionFramework` / `governedOneOnOnePrep` (governed situation IDs `decision`, `mandate`, `performance`) |
| `js/predictive-navigator.js` — weekly-focus "Leadership Practice" | `ai-mentor.js` | governed items (`level` drives priority, open case gets the action) |
| `js/proactive-push.js` — mentor nudges + morning digest | `ai-mentor.js` | `coachGateway.nudgesFromSituationalGuidance` (push shape kept, `governed: true`) |
| `js/proactive-scheduler.js` — briefing `mentorGuidance` | `ai-mentor.js` | governed items |
| `js/voice-interface.js` — spoken mentor answers | `ai-mentor.js` | governed items (honest "no guidance right now" when the engine has none) |
| server `GET /api/ai/mentor/guidance`, `POST /api/ai/mentor/decision-support`, `POST /api/ai/mentor/1on1-prep` | `ai-mentor.js` | gateway (shared derivation with the hub routes) |
| server `GET /api/ai/briefing/daily` — LLM elaboration | grounded via `generateVerified` but unlogged | `coachGateway.logWithCoach(coachStore(), …)` → checksum-chained entry on the coach answer log with its verification outcome |

`ai-mentor.js` itself stays exactly where it is: its micro-lessons,
frameworks and static reference data remain available (browser-loaded, still
served by tests), but **no server narrative is derived from it any more**.
Gate: `node test/one-ai-coherence.test.js` (23 checks, wired into `npm test`).
Regression find fixed on the way: `js/predictive-navigator.js` destructured
`{ LManagementNavigator }` from a direct export — every navigator call
crashed at runtime; now required directly.

## Increments shipped after the first round (2026-09-18, second batch)

### Increment 1 — the self-filling app (review tray) — DONE

`lib/review-tray.js`: producers submit DRAFT rows; the leader approves or
discards with one tap; ONLY approval writes a register, through the server's
own normalization (never the producer's raw shape). Idempotent per
(source, externalId); sensitive drafts redacted for viewer reads; drafts age
with a 14-day stale flag; every step audited.
Routes: `GET /api/review-tray` (viewer+), `POST /api/review-tray/submit`
(editor+), `/approve`, `/discard` (editor+, 409 on double-resolve).
Producer bridge: `draftsFromMeetingCapture` maps captured meeting items to
register targets (action→tasks, decision→decisions, risk→risks, conflict/
conduct→sensitive).

### Increment 3 — the Today cockpit — DONE

`lib/today-cockpit.js` + `GET /api/today` + nav view `today`: ONE ranked,
capped (8) list composed server-side from the governed sources — tray drafts →
proactive proposals → open cases (progress from the engine's own `mentorIntake`)
→ navigator priorities → due job-queue entries. Every item: a stated reason and
exactly ONE action. Explicit `counts` + `sources` so nothing hides or invents.

### Increment 4 — inbound channels become governed work — DONE

`lib/inbound-commands.js` + `POST /api/inbound/command`: email/Slack command
text ("approve R-12", "assign t7 to Mette") → parse (bracketed + loose forms) →
per-command RBAC (status = viewer, all mutations = editor; role from the
caller's identity resolution) → per-principal rate limit
(`LEADERSHIP_INBOUND_RATE_MAX`, 20/5 min default) → idempotency per
(principal, command, args, day) → execution via the existing email-commands
executor → persist + tamper-evident audit. Every refusal is structured and
audited (`insufficient_role`, `rate_limited`, `duplicate`, `no_writer`).

Gate for all three: `node test/proactive-surfaces.test.js` (24 checks, wired
into `npm test`).

## Third batch (2026-09-18): the loop closes on itself

- **Producer loop** (`lib/producer-loop.js`, `POST /api/producer/pass`): meeting capture
  and calendar 1:1s submit tray drafts unattended (scheduled pass each automation
  cycle). Meeting-action-sync gained a backward-compatible tray mode; the scheduled
  producer pass makes the review tray the single manual step.
- **Outcome flywheel**: every governed solve auto-queues an outcome-remeasurement job;
  measurements feed method-effectiveness, which feeds the mentor's method advice.
- **Anomaly signals**: `anomaly-detection` 2σ baselines merge into the proactive
  mentor's governed proposal stream (citations + one-tap create).
- **Portfolio cockpit** (`lib/portfolio-cockpit.js`, `GET /api/portfolio`): cross-project
  rollup — per project top signal + one action, exposure-ranked; rendered as a strip in
  the `today` view.
- The stranded v3-era `test/anomaly-detection.test.js` was rewritten to pin the module's
  real API (36 checks) and wired into `npm test` together with
  `test/zero-input-loop.test.js` (13 checks covering all four increments) — census 702/702.

## Fourth batch (2026-09-18): one brief, and it acts

- **One briefing engine** (`lib/briefing-engine.js`): a single composed brief shared by
  the cockpit, the digest and future consumers — actions → evidence → anomalies →
  navigator, deduped, capped, bilingual. The six legacy brief surfaces stay as lenses
  with pinned tests (consolidation is additive, not subtractive).
- **Digest that acts** (`lib/digest-delivery.js`, `POST /api/digest/send`): the SAME
  ranked items as `/api/today` via the shared gatherer, deep-linked so a reply flows
  into the governed inbound gateway; SMTP when configured, honest outbox when not,
  one per day, audited, behind the automation gate.
- Covered by `test/briefing-digest.test.js` (18 checks): includes the HTTP proof that
  digest actions ARE the screen's actions.

## Fifth batch (2026-09-18): the mentor remembers

- **Decision memory closed** (`lib/learning-loop.js`): a governed solve logs the
  decision to the journal + leader memory graph (ids stored on the case), and the
  re-measurement records the outcome back. The dormant memory infrastructure now
  grows with every case.
- **History citations**: proposals and cockpit reasons cite the leader's own
  recorded outcomes for the situation type — never invented, null when empty.
- **Weekly learning retrospective** (`GET /api/retro/weekly`, Monday digest
  section): decisions, method wins/losses, recurring patterns, stale
  relationships, lessons — all from recorded history, deterministic, bilingual.
- Covered by `test/learning-loop.test.js` (16 checks), including the HTTP
  round-trip: solve → decisionMemory ids on the case → outcome → journal.

## Sixth batch (2026-09-19): people intelligence

- **1:1 prep that remembers** (`lib/people-memory.js`): the automation engine's
  per-person prep is enriched from the leader's own memory — interaction history
  (last contact, tone) from the memory graph, crew check-in trends (morale and
  workload deltas, quiet weeks), cadence honesty ("last 1:1 was N days ago —
  your rhythm says M"), and what worked with THIS person before (method
  outcomes on their solved cases). Copy-on-write with a non-enumerable guard:
  re-enhancement can never duplicate topics. Every line cites its source.
- **The learning retrospective enters the UI** (`lib/learning-overview.js`,
  `GET /api/learning/overview`, nav view `learning`): the weekly retro composed
  verbatim, a per-person 1:1 checklist with cadence status, stale relationships
  sorted worst-first — each with one action (schedule the 1:1, log the
  interaction) wired to the existing governed endpoints.
- Covered by `test/people-intelligence.test.js` (12 checks), wired into `npm test`.

## Seventh batch (2026-09-19): one signal source, personal rhythms, fan-out

- **One brief-signals source** (`lib/brief-signals.js`, J): the register-signal
  derivations (overdue tasks, deadline windows, high risks, headline) exist ONCE;
  four brief lenses compose from them. The old vocabularies disagreed — the
  weekly brief's rpn>=150 outlier is harmonized to the codebase-wide >=100.
  `test/brief-signals.test.js` proves lens agreement on the same registers.
- **Per-person rhythm** (K): roster records declare `oneOnOneCadenceDays`; the
  cadence honesty cites the personal rhythm instead of a global limit.
- **Per-user digest fan-out** (K): every active admin/editor with an email
  receives the digest (legacy `LEADERSHIP_NOTIFY_TO` deduped in); one
  recipient's failure never blocks the others; per-address outcomes reported.
- **Debt retired** (L+M): the coverage-extras chain's three hidden failures
  fixed at the root (missing GSet primitives, missing `calculateMeetingCost`,
  a dead guide link), one real crash bug fixed (`intelligence-resilience`
  uncleared Promise.race timers — unhandled rejection killed the process after
  a green suite), and `test:coverage-extras` + `infrastructure.test.js` are now
  permanently wired into `npm test`.

## Eighth batch (2026-09-19): the conversational mentor joins the One-AI

The proactive surfaces remembered; the conversational ones were still stateless.

- **N — the ask path remembers.** `lib/coach.js::ask` appends a deterministic,
  cited memory section after the answer: your own history for the classified
  situation ("Case #2 of this type — method m-backlog improved 2/2 times" via
  the existing `historyCitation`), past similar cases filtered to that
  situation, and decisions still awaiting outcomes (injectable journal
  adapter). Failure-contained: memory can never break an answer. Composed
  before `appendAnswer`, so the answers-log checksum chain stays valid by
  construction.
- **O — 1:1 prep in the gateway remembers.** `governedOneOnOnePrep`
  (`lib/coach-gateway.js`, serving `/api/ai/mentor/1on1-prep`) gains a cited
  memory section via `people-memory.rememberPerson`: interaction history,
  check-in trend, the person's declared cadence ("your rhythm says 7"), and
  what worked with this person before. Injectable memory-graph adapter keeps
  tests hermetic.
- **Wiring debt paid.** `people-memory` had been built and lib-tested but had
  ZERO production callers — `lib/automation-engine.js::runMeetingPrep` now
  enhances prep, so the automation engine's per-person agendas carry memory
  topics too.
- **Proven** by `test/conversational-memory.test.js` (12 checks: own-history
  citation, situation-filtered past cases, containment on memory failure,
  checksum-chain validity, gateway + automation-engine memory topics, and one
  live-HTTP check exercising the full chain with memory intact). Wired into
  `npm test`.

## Ninth batch (2026-09-19): memory becomes visible, stalled cases resurface

The eighth batch taught the ask path to remember; this batch made the memory
**visible** and closed the silence gap:

- **Q — render the memory.** `/api/coach/ask` flat-appends the memory section
  into `result.answer`, so quick-ask technically showed it — but the
  *structured* block (own-record line, past-case badges, pending-decision
  titles) was served and dropped. `js/ui.js` gains a shared `mentorMemoryHtml`
  renderer + `splitMemoryAnswer` helper, used by all three HTML ask surfaces
  (quick-ask box, register-guide ask, coach panel). Bilingual, empty-safe, and
  the server contract is untouched — the split happens in the HTML renderers
  only. The memory-cited flat answer is already checksum-chained by N.
- **R — stalled cases resurface.** The memory only grows from recorded
  outcomes, and the weekly retro only covers decisions from *this* week — a
  case solved three weeks ago and never re-measured was silent forever.
  `lib/learning-overview.js` adds a stalled-cases section: solved ≥7 days,
  no outcome, not closed, sorted oldest-first with age; the learning view
  renders it with one action deep-linking to the mentor case view.

Proven by extensions to `test/conversational-memory.test.js` (split helpers,
render sites, fallback) and `test/people-intelligence.test.js` (stall logic:
only unmeasured non-closed cases surface, oldest first; HTTP surfacing).

## Tenth batch (2026-09-19): stalled cases reach the cockpit — and the inbox

R made stalled cases visible in the learning view; but the decisive fact is
that `gatherCockpitIngredients` feeds BOTH `/api/today` AND the daily digest.
A busy leader who never opens the learning view — the exact persona this app
serves — never learns their mentor memory is starving. So stalled cases
became a first-class cockpit kind, and ride the existing digest for free:

- **One derivation, exported.** `learning-overview.collectStalledCases(
  projects, { lang, today })` is now the single source of "solved ≥7 days,
  no outcome, not closed, oldest first" — consumed by the learning overview
  AND the cockpit gatherer. The surfaces can never disagree.
- **Cockpit kind `stalled-case`** (`lib/today-cockpit.js`): priority 3 —
  after open cases (a human decision waits) but before the navigator —
  bilingual reason citing the case's own age, ONE action (`solve-case`) that
  the digest deep-links to `#coach` via the existing `deepLinkFor` mapping.
  Only the OLDEST stalled case occupies the cockpit; the full list remains
  in the learning view. Counts expose the uncapped total.
- **Digest carry-over is automatic** — no new delivery code; proven by a
  carry-over assertion pinning the stalled item in the digest's actions
  section with the coach deep-link.

## Eleventh batch (2026-09-19): reply-to-record — the inbox closes the loop

The loop was visible (S) and reached the inbox (S) — but closing it still
required opening the app: find the case, fill the form. The inbound command
gateway had ten commands, none of them `outcome`. So:

- **ONE mutation core, two doors.** `lib/mentor-outcomes.js::
  recordMentorOutcome` now owns the entire mutation that used to live inline
  in the `/api/coach/mentor/outcome` route: the engine's own vocabulary
  normalization (never a parallel parser), plan-filtered steps (a case is
  never credited with a measure it never had), bounded 20-entry history,
  the governed status transition, method effectiveness, and the learning
  loop's journal + memory writes — every failure contained. The route
  delegates to it (auth + scoping stay at the door); a grep-guard in the
  suite pins that no inline mutation creeps back.
- **The eleventh command.** `outcome <caseId> <all|partly|none|unknown>
  <improved|unchanged|worse|too_early> [note]` — email bracket form and
  Slack loose form both parse it; the gateway grants it editor (like every
  mutating command) and its per-day idempotency means a mail retry cannot
  record twice.
- **The email teaches the path on the items it can close.** Digest stall
  items append "— or just reply: outcome <caseId> partly improved"
  (bilingual) with the case's own id; items without an id are never taught
  a fake command.

Proven by `test/mentor-outcomes.test.js` (15 checks: core vocabulary,
containment, gateway round-trip + duplicate refusal, digest teaching,
route parity) and extensions to `test/email-commands.test.js`.

## Twelfth batch (2026-09-22): the funnel is inverted, and trust is earned

The eleven batches before this one made the mentor proactive, remembering and
reply-driven. They left two structural problems that no further batch of the
same kind could fix:

**The funnel was hand-wired.** A module reached `/api/today` only if someone
edited `gatherCockpitIngredients` in `server.js`. Measured at the start of this
round: 884 modules in the app (293 `lib/`, 591 `js/`), **eight** hand-wired
cockpit sources, roughly **twenty** modules on the whole unattended path, and
**129 of 293 `lib/` modules with no caller anywhere in `lib/` or `js/`** —
reachable only through a route, waiting for a click a busy leader never makes.
Rounds 41–42 had added eighteen modules; every one of them was route-only.

**The tap count grew with the producers' quality.** The zero-input loop moved
the leader's work from typing to tapping, and the tray is strictly
one-draft-one-tap. `automationGate` is binary — paused, or propose-only — so
the 500th identical approval cost exactly as much as the first.

- **A — the detector contract** (`lib/signal-registry.js`). Modules DECLARE a
  detector; the cockpit reads the registry. Severity is EARNED, not declared:
  a `high` without a `basis` whose count meets its own threshold is demoted
  (`demoted_no_basis`), a detector may raise at most ONE high per pass
  (`demoted_detector_budget`), and it can never exceed the `maxSeverity` it
  registered with. Without that calibration, widening the funnel would not
  make the surface noisier — it would let the right six items be crowded out
  by detectors that all shout "high". A throwing detector is contained and
  NAMED in `errors`, never swallowed.
- **B — the pack** (`lib/detector-pack.js`). Six route-only modules now reach
  Today: decision debt, delivery certainty, workload rebalancing, conflict
  early warning (sensitive), project failure probability, predictive risk
  radar. The adapters are deliberately thin — they carry the module's own
  output and compute nothing — so the cockpit and the module's own view can
  never disagree. Found on the way: `project-failure-predictor` scores an
  EMPTY project at 45% failure probability, because "0% completion rate" is
  read as a high-severity velocity signal; the adapter now requires real
  register substance before it will carry that figure (absence of data is not
  evidence of trouble).
- **C — the autonomy ladder** (`lib/autonomy-ladder.js`). Per action class:
  L0 propose → L1 auto-file with a 24-hour undo → L2 act and report.
  **Promotion is always a human act** (`promote()` refuses `automation`,
  `system`, and a missing actor), levels are climbed one at a time, and the
  gate is the leader's own record (10 decisions / 95% / 5 clean for L1).
  **Demotion is automatic and immediate**: one rejection, undo, or edit drops
  a full level — trust is lost faster than earned, because a wrong auto-write
  costs the leader and an extra tap costs the machine. **Sensitive classes are
  pinned at L0 through every door** — the read, the tray's question, the
  proposal list, and a direct call with an admin actor.
- **D — the tray as ONE decision** (`lib/review-tray.js`, additive).
  `clusterDrafts` groups drafts the leader would judge identically;
  `approveCluster`/`discardCluster` resolve the group through the SAME
  per-draft `approveDraft` and the SAME writer. `autoFileDrafts` is the
  confidence lane and REQUIRES the project ledger — absence of state is never
  permission. `undoAutoFiled` removes the register row AND demotes the class.
  `autoFiledReport` is how the leader is told: an auto-file nobody is told
  about is indistinguishable from the app inventing data.
- **E — the planner** (`lib/day-planner.js`). Derives the REAL free windows
  from the calendar register and places the cockpit's already-ranked items
  into them, using the timeboxed autopilot's own minute estimates. It says NO
  out loud: every dropped item carries its reason and the first window it
  WOULD fit in. A sensitive conversation is never given a five-minute gap.
- **F — ambient capture on the schedule** (`lib/producer-registry.js`,
  `lib/ambient-producers.js`). Twenty `*ToTray` producers already existed in
  `lib/` and the scheduled pass called NONE of them. Producers now register
  and run on the same gated pass, each capped so a chatty source degrades
  itself rather than the tray. Found on the way: `stakeholderCommsToTray`
  requires `review-tray` directly and ignores an injected submit, so it filed
  drafts the pass reported as zero — the adapter now uses the module's own
  `draftComms` analysis and submits through the injected function, and the
  registry gained **bypass detection** so any future producer that dodges the
  cap is named rather than silently believed.
- **G — the mentor reads its own results** (`lib/outcome-inference.js`). The
  EFFECT is inferred from one countable metric per situation, measured at the
  solve date and today, with both numbers cited; the baseline is reconstructed
  from the rows' own timestamps rather than a stored snapshot, and a row that
  cannot be placed in time is counted as unmeasurable rather than quietly
  shrinking the denominator. **`carriedOut` is NEVER inferred** — the
  registers show that the overdue count fell, not whether the leader ran the
  plan — and recording requires a human actor.
- **H — across projects** (`lib/cross-project-detectors.js`, scope
  `portfolio`). The failures no single project can see: a person at 60% and
  70% is at 130%; a risk that is minor in three projects is systemic once; one
  decision blocking two projects; four milestones landing in the same week.
  Portfolio signals outrank project signals of equal severity, because a
  cross-project failure is the one the leader is structurally blind to.

Routes added: `GET /api/signals`, `GET|POST /api/autonomy(/promote|/demote)`,
`GET /api/review-tray/clusters`, `POST /api/review-tray/approve-cluster`,
`/discard-cluster`, `/undo`, `GET /api/review-tray/auto-filed`,
`GET /api/plan/day`, `GET /api/outcomes/inferred`, `POST /api/outcomes/confirm`.

One writer now serves all three tray paths (`writeRegisterRow` in `server.js`),
so a hand-approved row and an auto-filed row are identical in shape and a
future normalization cannot apply to one path and miss the other.

Gate: `node test/signal-autonomy-loop.test.js` (63 checks), wired into
`npm test`.

## Testing gate

`node test/proactive-mentor.test.js` follows the `test/automation.test.js`
pattern: it boots the real server on an ephemeral port, seeds a workspace with
known register defects, and asserts detection, prefill citations, honest
progress, gate behaviour (paused / invalid chain), idempotency, the create
flow (including the editor-role authorization and the server-side re-derive),
and that a created case solves through the governed chain with the answer
logged. It is wired into `npm test` next to the other mentor tests.
