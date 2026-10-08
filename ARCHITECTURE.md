# Leadership Operating System — Architecture Document

**306 modules | 162 test files | 284 core tests + 150+ new assertions | 0 failures | ~470+ API endpoints | CI: DEPLOY_READY**

## REVISION HISTORY

| Round | Date | What | Modules | Endpoints |
|-------|------|------|---------|-----------|
| R0-6 | — | Foundation through production connectors | 63+ | ~250 |
| R20 | Aug 2026 | Cross-domain journeys, close-to-report, causal runtime, AI governance, restore drills, data portability, decision sim, CRDT, connector hardening, learning org score, plugin marketplace, live benchmarks | +14 | +16 |
| R21 | Aug 2026 | IaC deployment, observability stack, canary deploy, KMS providers, k6 load, SOC 2 mapping, GDPR Art 30, regulatory filing, whistleblower, federated learning, multi-modal AI, insight generation, ERP close, calendar, org network, decision fatigue, meeting ROI, ZK proofs, post-quantum crypto, RASP, org design simulator, comp modeling, M&A playbook | +23 | +28 |
| R22 | Aug 2026 | Org digital twin, capital allocation optimizer, geopolitical planner, strategy gap analyzer, annual report generator, stakeholder scorecard, succession simulation, audit response, cognitive diversity index, corporate memory, crisis war room, policy-from-incidents, org pulse, strategic optionality, regulatory change impact | +15 | +26 |
| **R23** | **Aug 2026** | **Chief of Staff AI, Decision Debt Tracker, Auto Board Prep, Cross-Functional Dependency Mapper, Innovation Pipeline** | **+5** | **+17** |
| **R27** | **Aug 2026** | **Module wiring scaffold: all 80 wireable modules (20 explicit REST surfaces + 60 generic exec/info surfaces under /api/modules/<key>/{exec,info}) with hash-chained records, domain events, automation recipes; executable ten-point completion audit (honest matrix); WebAuthn real signature verification (W1 fixed); transparency-ledger syntax bug fixed** | **80 wired, +128 endpoints** | **+128** |
| **R29** | **Sep 2026** | **Vold & trusler + almindeligt fravær fully integrated: routes, store fetchers, live UI panels, weekly briefing sections (9h/9i), coach domains + grounded answers, alert signals + 8 watchers, method registry/selection/shim, browser shell (index/sw/manifest); census + wiring test locked; ui.js quote-syntax bug fixed** | **+2 engines integrated** | **+6 routes (already live)** |

## ROUND 23 — Transformative AI & Systems Thinking

### 1. Agentic Chief of Staff AI (`js/chief-of-staff-ai.js`)
Proactive executive assistant that runs daily business intelligence:
- **Morning Briefing**: auto-pulls data from ALL modules (pulse, finance, risk, OKR, crisis, strategy, people, calendar)
- **Priority Engine**: ranks issues by urgency × impact across domains
- **Action Drafting**: generates ready-to-send communications, calendar blocks, meeting invites
- **Talking Points**: composes executive narratives for all-hands, board meetings, leadership offsites
- **Mid-Day Check**: detects escalations and resolutions since morning briefing
- **Evening Wrap**: summarizes the day with reflection questions and tomorrow prep
- **Executive Learning Loop**: tracks which items get acted on vs deferred, adjusts future priority scoring
- Endpoints: `POST /api/chief-of-staff/morning-briefing`, `/midday-check`, `/evening-wrap`

### 2. Decision Debt Tracker (`js/decision-debt-tracker.js`)
Quantifies the compounding cost of deferred organizational decisions:
- **Debt Registration**: captures decision type, value at risk, daily cost of delay
- **Auto-escalation**: triggers when accrual exceeds thresholds or deferral exceeds time limits
- **Trend Analysis**: weekly change rate, monthly projection, momentum detection
- **Outcome Correlation**: measures whether decision delays correlate with negative business outcomes
- Endpoints: `POST /api/decision-debt/register`, `GET .../portfolio`, `POST .../resolve`, `/trend`

### 3. Automated Board Meeting Preparation (`js/auto-board-prep.js`)
Full auto-assembly of board meeting packages by the 5th business day after period close:
- **6 integrated sections**: financials (variance notes + forecast), risk heat map, strategy update, people dashboard, governance, decision items
- **Suggested agenda**: time-allocated with presenter assignments and pre-read references
- **Executive narrative**: 3-section narrative (financial, strategic, people) with board ask
- **Pre-read manifest**: estimated read times, recommended reading order
- **Post-meeting follow-up**: minutes template, action items log, decisions log
- Endpoints: `POST /api/board-prep/assemble`, `/post-meeting`

### 4. Cross-Functional Dependency Mapper (`js/cross-functional-dependencies.js`)
Models how WORK flows across functions — ripple effect simulation:
- **Dependency graph**: nodes = work items across all functions, edges = blocks/depends-on
- **Ripple simulation**: BFS propagation of delays with slack-aware cascading
- **Critical path analysis**: zero-slack items that cannot slip at all
- **"What breaks?" ranking**: scores every critical path item by cascade impact
- **Hidden dependency detection**: identifies chronic cross-functional blockage patterns
- **Slack analysis**: finds resources that can be safely reallocated
- Endpoints: `POST /api/dependencies/graph`, `/ripple`, `/break-scenarios`, `/hidden`

### ROUND 25 — Full Domain Completion & Trust Infrastructure

#### 1. 13 Previously Unwired Modules → Fully Wired
All 13 modules from prior rounds that lacked API routes, test suites, and server integration are now fully wired:
- **People Analytics** (`people-analytics.js`): churn risk, burnout, 9-box, skills obsolescence, engagement forecasting — 5 API routes
- **Change Management** (`change-management.js`): impact assessment, resistance prediction, readiness, comms — 4 API routes
- **Supply Chain Resilience** (`supply-chain-resilience.js`): concentration risk, geopolitical exposure, inventory optimization — 4 API routes
- **Financial Risk Integration** (`financial-risk-integration.js`): liquidity, stress tests, Monte Carlo, capex evaluation — 4 API routes
- **Market Intelligence** (`market-intelligence.js`): win/loss analysis, positioning, opportunity sizing, pricing — 4 API routes
- **Sustainability Impact** (`sustainability-impact.js`): carbon footprint, ESG scoring, SDG alignment, ESG finance — 4 API routes
- **Organizational Capability** (`organizational-capability.js`): CMMI maturity, digital readiness, roadmap — 3 API routes
- **Autonomous Remediation** (`autonomous-remediation.js`): rule evaluation, workflow execution, state transitions — 3 API routes
- **Causal Systems** (`causal-systems.js`): causal graph building, intervention simulation, root cause analysis — 4 API routes
- **Realtime Collaboration** (`realtime-collaboration.js`): documents, edits, changes, presence, locking — 5 API routes
- **Analytics Platform** (`analytics-platform.js`): reports, insights, dashboards, CSV export — 4 API routes
- **Enterprise Hardening** (`enterprise-hardening.js`): SBOM audit, attestations, wargaming, learning ROI — 5 API routes
- **Trustworthiness Dashboard** (`trustworthiness-dashboard.js`): trust score, decision explainability, bias audit — 4 API routes

#### 2. New Domain Modules (12 modules)
- **Transfer Pricing** (`transfer-pricing.js`): OECD BEPS compliant — CUP, Cost Plus, Profit Split methods, CbCR, Master File generation, TP risk assessment — 3 API routes
- **Climate Risk Analysis** (`climate-risk-analysis.js`): TCFD/NGFS aligned — physical risks, transition risks across 3 scenarios, multi-scenario financial impact, TCFD report generation — 3 API routes
- **Anonymous Reporting** (`anonymous-reporting.js`): EU 2019/1937 compliant — cryptographic anonymity guarantees, receipt tokens, Merkle-verified commitment sets, anonymity audits — 2 API routes
- **Treasury Management** (`treasury-management.js`): multi-currency cash positioning, FX exposure analysis, hedging strategy optimization, debt structure optimization, 13-week rolling cash forecast — 4 API routes
- **Pricing Optimizer** (`pricing-optimizer.js`): demand elasticity, revenue-optimal pricing, tiered pricing design, competitive response simulation, bundle pricing — 3 API routes
- **Channel Management** (`channel-management.js`): partner health scoring (5 dimensions), channel conflict detection, per-channel ROI, tier optimization — 3 API routes
- **Team Dynamics Simulation** (`team-dynamics-sim.js`): trust network analysis, intervention impact prediction, conflict emergence prediction, bus factor calculation — 3 API routes
- **AI Red-Teaming** (`ai-red-teaming.js`): adversarial prompt generation (5 categories), safety evaluation, model card auto-generation, AI incident response playbook — 4 API routes
- **Continuous Assurance** (`continuous-assurance.js`): real-time control monitoring, automated evidence collection, compliance posture scoring, continuous audit trail, auditor report generation — 4 API routes
- **External Verifiability** (`external-verifiability.js`): third-party claim verification (Merkle proofs), public attestation portal, selective disclosure proofs, ZK compliance proofs — 3 API routes (1 public)
- **Blockchain Anchoring** (`blockchain-anchoring.js`): Merkle tree aggregation, Ethereum/Bitcoin anchor transactions, per-chain Merkle proofs, public verification endpoints — 3 API routes (1 public)
- **SAML SSO** (`saml-sso.js`): SP metadata generation, AuthnRequest creation, SAML Response parsing/validation, IdP registration — 2 API routes

#### 3. PWA Infrastructure
- **Service Worker** (`sw.js`): offline-first caching of the app shell and static assets with stale-while-revalidate (registered by `js/init.js`), installable app support

#### 4. 5 New Cross-Domain E2E Journeys
| # | Journey | Modules |
|---|---------|---------|
| 9 | Innovation → Experiment → Scale → Sunset → Portfolio Rebalance | innovation-pipeline.js, portfolio-optimizer.js, experiments.js |
| 10 | Market Intel → Strategy Pivot → Org Redesign → Capability Gap → Hiring | market-intelligence.js, strategy-execution-gap-analyzer.js, org-design-simulator.js, organizational-capability.js, workforce-planning.js |
| 11 | Change → Readiness → Communication → Adoption → Outcome | change-management.js, org-pulse.js, outcomes.js |
| 12 | Supply Shock → Financial Impact → Risk → Mitigation → Control | supply-chain-resilience.js, financial-risk-integration.js, risk-controls.js, risk-portfolio.js |
| 13 | AI Decision → Governance → Explain → Override → Learning | ai-governance-enforcer.js, explainability.js, ethical-decision-framework.js, learning-loop.js, decision-outcomes.js |

This session added the missing production-grade layers across six tiers —
foundation, finance, business operations, people/conflict safety, production
connectors, AI safety, and hardening — closing the gaps in the completion
matrix. All new modules are pure-function, test-covered, and wired into the
server with API routes.

### Tier 0 — Foundation (7 modules)
`js/abac.js` (field/purpose/geography/break-glass ABAC), `js/saga-compensation.js`
(distributed transactions with compensating rollback), `js/model-registry.js`
(versioned ML catalogue), `js/rag-pipeline.js` (retrieval-grounded narratives),
`js/schema-compatibility-gate.js` (backward/forward compat CI), `lib/kms.js`
(envelope encryption + key rotation), `lib/webauthn.js` (FIDO2/passkeys).

### Tier 1 — Finance sub-ledgers (9 modules)
`js/accounts-payable.js`, `js/accounts-receivable.js`, `js/purchase-orders.js`
(3-way match), `js/expenses.js`, `js/fixed-assets.js` (depreciation), `js/inventory.js`
(FIFO/LIFO/WA), `js/revenue-recognition.js` (ASC 606/IFRS 15), `js/intercompany-eliminations.js`,
`js/payroll.js`.

### Tier 2 — Business operations (6 modules)
`js/crm.js`, `js/contracts.js`, `js/procurement.js`, `js/sla-manager.js`,
`js/roadmap.js`, `js/resource-management.js`.

### Tier 3 — People & conflict safety (6 modules)
`js/safeguarding.js` (abuse escalation), `js/retaliation-monitor.js`,
`js/feedback-integrity.js` (collusion/bias), `js/mediator-workflow.js`,
`js/coaching-quality.js`, `lib/scim.js` (identity lifecycle).

### Tier 4 — Production connectors (17 adapters)
`lib/connectors/` — `gitlab`, `azure-devops`, `slack`, `google-workspace`,
`salesforce`, `hubspot`, `xero`, `netsuite`, `quickbooks`, `sap`, `workday`,
`hibob`, `bamboohr`, `siem`, `data-warehouse`, `document-management`,
`e-signature`, `sms` — all registered in `lib/connector-registry.js`.

### Tier 5 — AI safety (6 modules)
`js/model-drift.js` (PSI/KS), `js/fairness-auditor.js` (disparate impact),
`js/prompt-isolation.js`, `js/ai-tool-auth.js`, `js/dlp.js` (PII redaction),
`js/ai-abstention.js` (decline vs guess).

### Tier 6 — Hardening & assurance (7 modules + 2 eval scripts + 3 suites)
`js/dpia.js`, `js/soc2-iso-evidence.js`, `js/worm-storage.js` (append-only),
`js/external-notary.js`, `js/delegated-admin.js`, `js/tenant-migration.js`,
`js/dark-launch.js`. Eval: `scripts/eval/pentest.mjs` (OWASP ASVS),
`scripts/eval/longitudinal.mjs`. Tests: `test/expansion-tier0-6.test.js`,
`test/chaos.test.js`, `test/slo-compliance.test.js`, `test/a11y-audit.test.js`.

### New API endpoints (~30)
`/api/abac/authorize`, `/api/models` (+`/validate`, `/drift`, `/fairness`),
`/api/ai/guard`, `/api/ai/abstain`, `/api/ai/ground`, `/api/finance/ap`,
`/api/finance/ar`, `/api/finance/payroll/run`, `/api/finance/assets`,
`/api/finance/inventory`, `/api/crm/pipeline`, `/api/contracts`, `/api/sla`,
`/api/roadmap`, `/api/resources/utilization`, `/api/safeguarding`,
`/api/dpia`, `/api/compliance/soc2-iso`, `/api/worm`, `/api/notary/anchor`,
`/api/admin/elevate`, `/api/admin/elevations`, `/api/dark-launch`.

Run the new gates: `npm run test:tier06`, `npm run eval:pentest`,
`npm run eval:longitudinal`.

---

## MAJOR EXPANSION: 20 Strategic Modules Added (Current Session)

This document records the current expansion with analytical and automation modules organized in 4 strategic tiers. The pure-function modules are browser-loaded and covered by focused regression tests; server persistence and API exposure remain separate integration work.

### New Module Summary (20 Total)

**TIER 1: Critical Operational Gaps (5 modules)**
1. `people-analytics.js` — Predictive People Analytics Engine (churn, burnout, reskilling)
2. `change-management.js` — Unified Change Management (impact, readiness, communication)
3. `supply-chain-resilience.js` — Supply Chain Resilience & Optimization
4. `organizational-capability.js` — Organizational Capability Assessment (CMMI maturity)
5. `financial-risk-integration.js` — Integrated Financial Risk (liquidity, stress testing)

**TIER 2: Force Multipliers (5 modules)**
1. `market-intelligence.js` — Market & Competitive Intelligence (win/loss, TAM/SAM/SOM)
2. `sustainability-impact.js` — Advanced Sustainability & Impact Tracking (ESG, carbon)
3. `incident-management.js` — Automated Incident & Crisis Management (enhanced)
4. `realtime-collaboration.js` — Real-time Collaboration & Synchronization (CRDT-based)
5. `analytics-platform.js` — Embedded Self-Service Analytics & BI

**TIER 3: Force Multipliers (5 capabilities)**
1. `autonomous-remediation.js` — Autonomous Workflow & Remediation Engine
2. `causal-systems.js` — Causal Loop Modeling & System Dynamics
3. `trustworthiness-dashboard.js` — Trustworthiness & Explainability (confidence, bias audit)
4. `succession-planning.js` — Succession Planning & Organizational DNA
5. `policy-engine.js` — Canonical Policy Engine & Compliance Automation (server-backed)

`policy-engine-automation.js` remains an experimental pure-function prototype and is not registered as a second production policy authority.

**TIER 4: Hardening (1 comprehensive 5-in-1 prototype module)**
1. `enterprise-hardening.js` — Prototype integration of software supply chain security, blockchain attestation, digital twin/wargaming, mobile/offline-first, and integrated learning loop

**Integration Layer (Unified Nervous System)**
1. `causal-integration-layer.js` — Cross-domain event propagation, anomaly detection, multi-domain approvals, scenario modeling, unified audit trail

## Domain Map

```
┌──────────────────────────────────────────────────────────────┐
│                    LEADERSHIP OS DOMAINS                      │
├─────────────┬──────────────┬────────────┬──────────┬────────┤
│  LEADERSHIP │   FINANCE    │  PERSONAL  │   RISK   │CONFLICT│
├─────────────┼──────────────┼────────────┼──────────┼────────┤
│  BUSINESS   │  OPERATIONS  │ GOVERNANCE │   AI/ML  │  EVAL  │
└─────────────┴──────────────┴────────────┴──────────┴────────┘
```

---

## Module Inventory by Domain

### 1. CORE ENGINE (foundational infrastructure)

| Module | Purpose | Internal Dependencies |
|---|---|---|
| `calc.js` | Core calculation engine, test harness | — |
| `store.js` | Document/file persistence with hash-chaining | calc |
| `event-log.js` | Domain event sourcing | — |
| `templates.js` | 150+ document/briefing/plan templates | calc |

### 2. LEADERSHIP DOMAIN (14 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `leadership-depth.js` | Situational Leadership II, shift detection | leadershipDepth |
| `leadership-fingerprint.js` | DISC + Belbin + EI + BigFive + Dreyfus composite | synthesizeFingerprint, extractRawScores |
| `coach.js` | AI coaching engine, 70-20-10 learning | coach |
| `feedback-360.js` | Multi-rater 360° campaigns | createCampaign, collectResponse |
| `talent-marketplace.js` | Person-to-opportunity matching | matchScore, successorGaps |
| `board-effectiveness.js` | 8-dimension board maturity | evaluateDirector, committeeHealth |
| `board-pack.js` | Automated board pack generation | boardPack, forwardCalendar |
| `executive-narrative.js` | NLG: CEO letter, QBR, investor update | ceoLetter, quarterlyReview |
| `culture-health.js` | Psych safety, belonging, burnout pulse | cultureDashboard |
| `meeting-analyzer.js` | Calendar cost, decision velocity, bloat | analyzeMeetings |
| `sentiment-analysis.js` | Lexicon-based NLP across decisions/feedback/meetings | scoreText, orgDashboard, trendAnalysis |
| `workforce-planning.js` | Headcount forecast, skill gaps, hiring pipeline | headcountForecast, skillGapAnalysis |
| `benchmarking.js` | Industry peer percentile comparison | benchmarkScore |
| `innovation-pipeline.js` | H1/H2/H3 funnel, stage-gate, velocity | stageGate, horizonBalance |

### 3. FINANCE DOMAIN (13 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `finance.js` | Double-entry engine, chart of accounts | postEntry, chartOfAccounts |
| `finance-controls.js` | Approval thresholds, segregation of duties | validateEntry, approvalRequired |
| `finance-operations.js` | Invoice validation, 3-way match, bank feed | threeWayMatch, reconcileBankTxs |
| `financial-statements.js` | P&L, Balance Sheet, Cash Flow from journal | incomeStatement, balanceSheet, cashFlow |
| `double-entry-guard.js` | Trial balance verification, auto-reconciliation | validate, trialBalance |
| `cost-center.js` | Profit/cost/investment center allocation | allocateAll, budgetVsActual |
| `tax-filing.js` | Corporate/VAT/payroll tax, 5 jurisdictions | computeCorporateTax, computeVAT |
| `fx-consolidation.js` | IAS 21/ASC 830 translation, hedge accounting | consolidate, fxExposure |
| `budget.js` | Budget vs actual, variance analysis | budgetReport |
| `portfolio.js` | Initiative/project portfolio P&L tracking | portfolioAnalysis |
| `portfolio-optimizer.js` | Constraint-aware initiative selection | optimize, portfolioBalance |
| `fraud-detection.js` | 10 anomaly detection rules, severity scoring | scan, report, heatMap |
| `quant-risk.js` | VaR/CVaR, loss distribution, correlation matrix | computeVaR, riskAttribution |

### 4. PERSONAL LEADERSHIP DOMAIN (5 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `personal.js` | 70-20-10 learning, energy tracking, habits | energyScore, habitStreaks |
| `coach.js` | AI coaching (dual-mapped: also in leadership) | coach |
| `outcomes.js` | Prediction→outcome tracking | recordOutcome, calibrationScore |
| `scoring.js` | Multi-dimensional competency scoring | competencyScore |
| `time-tracking.js` | Task time vs estimate, utilization | trackTime, utilization |

### 5. RISK DOMAIN (6 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `risk-controls.js` | Risk register, likelihood×impact grids | riskMatrix, riskRegister |
| `quant-risk.js` | VaR/CVaR (dual-mapped: also in finance) | computeVaR |
| `geopolitical-risk.js` | 29-country risk scoring, sanctions screening | countryRisk, supplyChainRisk |
| `regulatory-horizon.js` | Regulation change register, impact assessment | horizonScan, gapAnalysis |
| `compliance.js` | Multi-standard compliance (SOX/GDPR/ISO) | complianceChecklist |
| `compliance-evidence.js` | Auto-generate evidence packages for auditors | scan, evidencePackage |

### 6. CONFLICT DOMAIN (4 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `conflict.js` | Glasl stage detection, mediation framework | glaslStage, mediationPlan |
| `conflict-early-warning.js` | Pre-Stage 0 prediction (comms, sentiment, SLII) | conflictPrediction, conflictHeatMap |
| `conflict-cost.js` | Direct + ripple cost of unresolved conflict | conflictCost, mediationROI |
| `privacy-conflict.js` | GDPR-conflict intersection management | — |

### 7. BUSINESS MANAGEMENT DOMAIN (10 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `business.js` | OKR tracking, initiative management | okrProgress, initiativeScore |
| `strategic.js` | Strategy maps, innovation portfolios | strategyMap, horizonBalance |
| `enterprise.js` | Multi-entity consolidation, org design | consolidateEntities |
| `entity-graph.js` | Organization hierarchy DAG | orgGraph, spanOfControl |
| `org-hierarchy.js` | Reporting lines, headcount trees | hierarchyTree |
| `vendor-scorecard.js` | Multi-dimension vendor scoring, SPOF detection | portfolioAnalysis |
| `search.js` | Full-text search across all modules | searchAll |
| `integration.js` | External system connectors, data pipeline | connect, importData |
| `integration-contracts.js` | Interface contracts between services | — |
| `connector-contracts.js` | Third-party connector agreements | — |

### 8. OPERATIONS DOMAIN (5 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `production-hardening.js` | Rate limiting, security headers, graceful shutdown | createRateLimiter, SECURITY_HEADERS |
| `observability.js` | Prometheus metrics, SLOs, structured logging | metricsExport, sloDashboard |
| `k8s-deployment.js` | Full K8s manifest generation for all services | fullDeploymentPlan, readinessReport |
| `db-migration-test.js` | SQL migration validation, up/down testing | validateMigrationChain, fullAudit |
| `alert-pipeline.js` | 12-channel watcher registry, escalation | digest, acknowledge |

### 9. GOVERNANCE & TRUST DOMAIN (9 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `trust.js` | Provider trust index, confidence calibration | trustIndex, providerRanking |
| `trust-contracts.js` | Formal trust assertions with breach thresholds | — |
| `forensic-audit.js` | Immutable hash-chained audit across all domains | record, regulatoryExport |
| `decision-provenance.js` | Decision traceability DAG | traceDecision, provenanceReport |
| `dsar.js` | GDPR/CCPA data subject request automation | createRequest, complianceReport |
| `data-portability.js` | Cross-system data export/migration | exportData |
| `privacy-governance.js` | Consent lifecycle, purpose binding | grant, withdraw |
| `feature-flags.js` | Canary releases, gradual rollout | isEnabled |
| `tenant-dr-bcp.js` | Multi-tenant isolation, DR simulation, BCP | verifyIsolation, simulateDR |

### 10. AI/ML DOMAIN (7 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `predictive.js` | Time-series forecasting, anomaly detection | forecast, anomalyDetect |
| `intelligence.js` | Automated intelligence reporting | intelligenceReport |
| `causal.js` | Causal inference graph across 6 domains | causalGraph, propagateEffects |
| `triage.js` | "What needs my attention?" priority ranking | triageReport, dailyBriefing |
| `bias-detection.js` | Anchoring, confirmation, groupthink, halo detection | biasAudit, detectAnchoring |
| `ai-training-loop.js` | Labeled data generation for model fine-tuning | triageExamples, exportJSONL |
| `adversarial-resistance.js` | Calibration gaming, data poisoning, Byzantine detection | securityPostureReport |

### 11. EVALUATION & SIMULATION DOMAIN (5 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `digital-twin.js` | Unified 42-node DAG across 6 domains | buildDigitalTwin, crossDomainPropagation |
| `system-twin-merge.js` | Merged 6-domain system simulation | systemTwin, whatIf |
| `longitudinal-sim.js` | Time-stepped Monte Carlo, stress tests | runSimulation, compareScenarios |
| `scenario-wargaming.js` | Adversary moves, tabletop exercises | runScenario, afterActionReview |
| `calibration-extended.js` | Cross-domain prediction calibration | domainCalibration, calibrationReport |

### 12. REALTIME & COLLABORATION DOMAIN (4 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `realtime-transport.js` | WebSocket + SSE client registry | broadcast, sseSetup |
| `ws-server.js` | WebSocket server with auth, channels | attach, diagnostics |
| `mobile-push.js` | FCM/APNs bridge, delivery queue | sendPush, deliveryReport |
| `collaboration.js` | CRDT vector clocks, LWW documents, OT diff | createDocument, applyEdit

### 13. FINAL 10 GAPS CLOSED (9 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `okr-automation.js` | Auto-sync OKR progress from tasks/journal/events | computeProgress, okrDashboard |
| `webhooks.js` | Slack/Email/Teams inbound webhook parsing | parseSlackCommand, executeCommand |
| `ml-serving.js` | 4 rule-based ML models, batch/pipeline inference | infer, batchInfer, modelHealth |
| `graphql.js` | GraphQL schema builder + query executor | buildSDL, parseQuery, execute |
| `audit-search.js` | Inverted-index free-text audit search | search, facetedSearch |
| `role-dashboard.js` | 5 role-specific dashboard assemblies | assemble, health |
| `onboarding.js` | Role-scoped onboarding playbook generator | generatePlaybook, progress |
| `digital-signature.js` | SHA-256 signing, multi-sig, custody chain | sign, verify, chainOfCustody |
| `backup-verify.js` | Manifest creation, integrity, restore sim, RTO/RPO | createBackupManifest, verifyIntegrity, rtoRpoCompliance |

### 14. TRUST & PEOPLE LAYER (round-15 build, 9 modules)

### 18. ROUND-19 TRUST-CAPSTONE LAYER (4 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `js/watchdog.js` | Verify-all chains + 0-100 Trust Score + daily attestation manifest | verifyAll, trustScore, buildAttestation, verifyAttestation |
| `js/forecast-accuracy.js` | Forecast→actual grading: MAPE by horizon, bias adjustment, due-for-grading | registerForecast, recordActual, accuracy, recalibrate |
| `js/attestation-export.js` | External notary bundle + publish (HMAC) + response verify | exportPayload, sign, publish, verifyNotaryResponse |
| `js/compliance-calendar.js` | External obligation deadlines, lead-day urgency, submission proof | addObligation, upcoming, submit, posture |

Endpoints: `/api/watchdog/status`, `/api/watchdog/attest`, `/api/watchdog/verify`, `/api/forecasts`, `/api/forecasts/actual`, `/api/attestation/export`, `/api/compliance/calendar`, `/api/compliance/obligations`, `/api/compliance/obligations/submit`. Eval gates: `npm run test:round19` (incl. chain-tamper property + i18n coverage) and `scripts/eval/round19-golden.mjs`. Trust Score surfaces in the Control Center.

### 17. ROUND-18 OPERATIONAL-CLOSURE LAYER (4 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `js/period-close.js` | Period seal + close certificate (manifest + anchor), audited reopen, automation lock | freeze, certificate, reopen, policyDecision |
| `js/decision-outcomes.js` | Decision outcome ledger + per-domain calibration + stale review | registerDecision, recordOutcome, calibration, staleReviews |
| `js/conflict-outcomes.js` | Conflict resolution outcomes (recurrence → incident) + personal-conflict register | recordConflictOutcome, registerPersonalConflict, personalPulse |
| `js/secrets-rotation.js` | Rotation schedule, fingerprints, old-usage detection, audit/report | due, rotateSecret, checkOldUsage, audit, report |

Endpoints: `/api/finance/close`, `/api/finance/close/reopen`, `/api/finance/close/status`, `/api/decisions/outcomes`, `/api/decisions/outcomes/resolve`, `/api/conflicts/outcome`, `/api/conflicts/personal`, `/api/secrets/due`, `/api/secrets/rotate`, `/api/trend`. Eval: `npm run endorse` (single DEPLOY_READY certificate) + `scripts/eval/trend.mjs`.

### 16. ROUND-17 GOVERNANCE LAYER (4 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `js/risk-portfolio.js` | Portfolio risk: systemic themes, top-10, RAROC-lite, vendor feed | aggregateRisks, rarocLite, vendorRiskFeed |
| `js/evidence-pack.js` | Tamper-evident audit pack with SHA-256 manifest | build, verify |
| `js/learning-loop.js` | Ack→policy recalibration, weekly personal insight, experiment auto-stop | recalibratePolicy, weeklyInsight, experimentStop |
| `js/control-center.js` | Governance snapshot + explainable 0-100 score | build |

Endpoints: `/api/control-center`, `/api/policy/recalibrate`, `/api/learning/weekly`, `/api/learning/experiments`, `/api/evidence/package`, `/api/risk/portfolio`. UI: `control-center.html` + `js/control-center-ui.js`. Eval gate: `scripts/eval/round17-golden.mjs`.

### 15. ROUND-16 CAPABILITY LAYER (4 modules + 2 eval scripts)

| Module | Purpose | Key Exports |
|---|---|---|
| `js/policy-engine.js` | Declarative governance: rules, kill-switch, four-eyes, decision summary | evaluate, requiresHumanApproval, DEFAULT_POLICY, summary |
| `js/outbound-webhooks.js` | Outbound Slack/Teams/generic delivery: HMAC, backoff retries, dead-letter, idempotency | register, deliver, signature, formatChannel |
| `js/bank-feed-connector.js` | Pluggable bank-feed providers (BIK csv, sandbox, http), normalize + dedupe + source-hash evidence | runConnector, importBikCsv, normalize |
| `lib/oidc-client.js` | Minimal OIDC RP: discovery, JWKS verify (RS256/ES256), ID-token claims, role-from-groups | verifyIDToken, discovery, authUrl, exchangeCode, roleFromClaims |
| `js/usage-analytics.js` | In-memory route adoption + dead-end detection | createAnalytics |

Eval gates: `scripts/eval/llm-golden.mjs` (LLM claim-drift) and `scripts/eval/dast.mjs` (adversarial probes) — both wired into CI.


| Module | Purpose | Key Exports |
|---|---|---|
| `chain-anchor.js` | External notarization: root-hash anchor of every chain | buildAnchor, verifyAnchor |
| `consistency-verifier.js` | Cross-module figure agreement (budget vs EVM vs KRI) | scan, extractClaims |
| `retention.js` | Retention schedules, legal-hold freezes, purge dry-run | schedule, hold, purge, report |
| `incident-management.js` | Incident lifecycle: severity policy, RCA, corrective actions, lessons | openIncident, incidentRegister |
| `person-index.js` | Canonical person master-index with alias resolution | buildIndex, resolve |
| `mentorship.js` | Needs-driven mentorship pairing + succession readiness | pair, successionPlan |
| `experiments.js` | A/B intervention engine: deterministic assign, Welch t, Beta-Bayesian | assign, recordOutcome, analyze |
| `automation-evidence.js` | Proof-of-execution evidence log (hash-chained) | record, verifyEvidence |
| `llm-narrative.js` | Optional verifiable LLM layer (deterministic fallback, claim verification) | narrate, verifyClaims |

### 15. CROSS-CUTTING (6 modules)

| Module | Purpose | Key Exports |
|---|---|---|
| `i18n.js` | Danish/English translation, ~200 keys | t, supportedLanguages |
| `templates.js` | Document/briefing template library | — |
| `custom-registers.js` | User-defined data registers | createRegister |
| `automation-controls.js` | Scheduled task automation | runAutomations |
| `workflows.js` | Multi-step approval/decision workflows | runWorkflow |
| `esg-reporting.js` | Carbon (Scope 1-3), DEI, GRI/SASB/TCFD | carbonReport, disclosurePack |
| `knowledge-management.js` | Bus factor, tacit knowledge capture | knowledgeMap, busFactor |
| `advanced.js` | Advanced analytics (ESG, strategy extensions) | — |
| `lib/router.js` | Structured domain-grouped API router | register, dispatch, routesByDomain |

### BROWSER-ONLY MODULES

| Module | Purpose |
|---|---|
| `ui.js` | Frontend rendering engine |
| `init.js` | Browser initialization/bootstrap |

---

## Dependency Graph

```
calc.js ←────────────────── (4 modules: store, trust, finance, coach)
digital-twin.js ←────────── (3 modules: system-twin-merge, longitudinal-sim, e2e-lifecycle)
early-warning.js ←───────── (3 modules: alert-pipeline, triage, e2e-lifecycle)
trust.js ←───────────────── (2 modules: calibration-extended, provider-ranking externals)
calibration-extended.js ←── (2 modules: outcomes, e2e-lifecycle)
causal.js ←──────────────── (2 modules: digital-twin, system-twin-merge)
conflict-early-warning.js ← (2 modules: triage, e2e-lifecycle)
```

**Zero circular dependencies across all 102+ modules.**

---

## Test Suite Architecture

| Suite | File | Tests | Scope |
|---|---|---|---|
| Engine | `test.js` | 284 | calc.js core functions |
| Smoke | `smoke.js` | 79 | Module integrity/missing guards |
| Wave-2 | `test/new-modules-integration.test.js` | 22 | DigitalTwin, ConflictEW, Calibration, Triage |
| Fuzz | `test/new-modules-fuzz.test.js` | 25 | Property-based invariants (fast-check) |
| Wave-3 | `test/wave3-integration.test.js` | 75 | LeadershipFingerprint, 360°, Financials, Geopolitical, BoardPack, LongitudinalSim, Adversarial |
| Double-Entry | `test/double-entry-guard.test.js` | 40 | Trial balance, reconciliation, period-close |
| Wave-4 | `test/wave4-integration.test.js` | 34 | ForensicAudit, TalentMarketplace, ESG, FX, KnowledgeMgmt |
| Wave-5 | `test/wave5-integration.test.js` | 29 | Wargaming, Bias, Realtime, Tenant-DR-BCP |
| E2E | `test/e2e-lifecycle.test.js` | 45 | 3-year company simulation, 66 modules exercised |
| Wave-6 | `test/wave6-integration.test.js` | 26 | DecisionProvenance, SystemTwin, Compliance, Narrative, Culture, Portfolio, Benchmarking, Meetings, Vendors |
| Wave-7 | `test/wave7-integration.test.js` | 107 | ProductionHardening, WS, MobilePush, DBMigration, Observability, K8s |
| Wave-8 | `test/wave8-integration.test.js` | 93 | AITraining, Fraud, Collaboration, DSAR, Tax, CostCenter, Sentiment, Workforce |
| Wave-9 | `test/wave9-integration.test.js` | 44 | OKR Automation, Webhooks, ML, GraphQL, Audit Search, Role Dashboard, Onboarding, Signatures, Backup |
| API Smoke | `test/api-smoke.test.js` | 13 | Server load, module load, route counts, router dispatch, doc checks |
| Trust Layer | `test/trust-layer.test.js` | 30 | chain-anchor, consistency-verifier, retention, evidence, llm-narrative |
| People Layer | `test/people-layer.test.js` | 26 | person-index, mentorship |
| Incident+Experiments | `test/incident-experiments.test.js` | 13 | incident lifecycle, A/B engine |
| Trust API | `test/trust-api.test.js` | 20 | live server routes for all new endpoints |
| Model Agreement | `test/model-agreement.test.js` | 12 | digital-twin vs longitudinal-sim differential invariants |
| Self-Heal Discover | `test/self-heal.test.js` | +12 | finding → candidate patch generation |
| **Total** | **20 suites** | **~1030** | **All modules covered** |

---

## API Endpoints by Domain (~110 total)

### Leadership & People
`/api/leadership-fingerprint`, `/api/feedback-360`, `/api/talent-marketplace/rank`, `/api/talent-marketplace/succession`, `/api/culture/dashboard`, `/api/benchmarking`, `/api/meetings/analyze`

### Finance
`/api/finance/journal`, `/api/finance/period-close`, `/api/financial-statements/pnl`, `/api/financial-statements/balance-sheet`, `/api/financial-statements/cashflow`, `/api/double-entry/validate`, `/api/double-entry/trial-balance`, `/api/double-entry/reconcile`, `/api/cost/allocate`, `/api/cost/budget-variance`, `/api/fx/exposure`, `/api/fx/consolidate`

### Tax
`/api/tax/corporate`, `/api/tax/vat`, `/api/tax/calendar`

### Risk & Governance
`/api/geopolitical-risk`, `/api/geopolitical-risk/supply-chain`, `/api/compliance/scan`, `/api/compliance/package`, `/api/board-pack`, `/api/board-pack/exec-summary`, `/api/esg/disclosure-pack`, `/api/esg/carbon`, `/api/esg/dei`, `/api/regulatory-horizon`

### Fraud & Security
`/api/fraud/scan`, `/api/fraud/heat-map`, `/api/security/posture`, `/api/security/calibration-gaming`, `/api/security/integrity-full`, `/api/forensic-audit`, `/api/forensic-audit/report`, `/api/forensic-audit/export`

### Privacy & DSAR
`/api/dsar/create`, `/api/dsar/dashboard`, `/api/dsar/compliance-report`

### Decisions & Provenance
`/api/decisions/trace`, `/api/decisions/graph`

### AI & Simulation
`/api/system-twin`, `/api/system-twin/what-if`, `/api/longitudinal-sim/run`, `/api/longitudinal-sim/compare`, `/api/longitudinal-sim/stress-test`, `/api/scenario-wargaming/run`, `/api/triage`, `/api/triage/briefing`, `/api/bias/audit`, `/api/ai-training/dataset`, `/api/ai-training/quality`

### Narrative
`/api/narrative/ceo-letter`, `/api/narrative/qbr`, `/api/narrative/board`

### Sentiment
`/api/sentiment/text`, `/api/sentiment/org-dashboard`

### Alerts
`/api/alerts/digest`, `/api/alerts/watchers`, `/api/alerts/acknowledge`

### Workforce
`/api/workforce/headcount`, `/api/workforce/skill-gaps`, `/api/workforce/dashboard`

### Realtime
`/api/realtime/sse`, `/api/realtime/ws-health`, `/api/realtime/ws-broadcast`, `/api/mobile/send`, `/api/mobile/register-device`

### Round-17 (control center, learning, evidence, risk portfolio)
`/api/control-center`, `/api/policy/recalibrate`, `/api/learning/weekly`, `/api/learning/experiments`, `/api/evidence/package`, `/api/risk/portfolio`

### Round-16 (policy, webhooks, connector, OIDC, analytics)
`/api/policy`, `/api/policy/evaluate`, `/api/webhooks`, `/api/webhooks/dispatch`, `/api/connector/bank-import`, `/api/oidc/start`, `/api/oidc/callback`, `/api/analytics/usage`

### Trust & Integrity (round-15)
`/api/trust/anchor`, `/api/trust/anchor/verify`, `/api/consistency/scan`, `/api/retention/policy`, `/api/retention/hold`, `/api/retention/purge`, `/api/automation/evidence`

### People & Development (round-15)
`/api/people/index`, `/api/people/resolve`, `/api/mentorship/match`, `/api/mentorship/succession`

### Incidents & Experiments (round-15)
`/api/incidents`, `/api/incidents/action`, `/api/experiments`, `/api/experiments/assign`, `/api/experiments/outcome`, `/api/experiments/analyze`

### Operations
`/api/production/hardening-report`, `/api/production/headers`, `/api/k8s/deployment-plan`, `/api/k8s/validate`, `/api/k8s/cost-estimate`, `/api/k8s/readiness`, `/api/observability/metrics-export`, `/api/observability/slos`, `/api/observability/health-deep`, `/api/db/migration-test`, `/api/db/schema-validate`

### Collaboration
`/api/collab/health`, `/api/collab/edit`

### Knowledge
`/api/knowledge/dashboard`, `/api/knowledge/bus-factor`, `/api/knowledge/transfer-plan`

---

## Data Integrity Architecture

Every persistence path uses hash-chaining (SHA-256):
- **Audit log**: `audit.jsonl` — every action stamped with `prevHash`/`hash`
- **Workspace history**: `workspace-history.jsonl` — every save versioned
- **Finance journal**: `finance-journal.jsonl` — every entry hash-chained
- **Forensic audit**: `forensic-audit.jsonl` — cross-domain chain of custody
- **Technique registry**: `techniques.jsonl` — learned techniques hash-chained
- **Answer log**: `answers.jsonl` — AI answer tamper-evident chain

All chains use distinct genesis hashes to prevent cross-chain linking.

**External anchoring (round-15):** the `/api/trust/anchor` endpoint cuts a point-in-time anchor — root hashes of every chain + timestamp — that anyone can verify independently (`/api/trust/anchor/verify` recomputes every root). Tampering is detected both internally (chain verify) and externally (anchor mismatch), making trust provable to a third party, not just internally.

**Cross-module consistency (round-15):** the consistency verifier extracts the same figure wherever it appears across registers (budget variance, EAC, KRI thresholds) and flags irreconcilable values — the "linked together" trust check.

---

## CI/CD Pipeline

```
ModuleLoad (91/93) → EngineTests (284) → SmokeTests (79) → FuzzTests (25)
→ IntegrationTests (9 suites) → ServerLoad → DependencyIntegrity
→ DEPLOY_READY / DEPLOY_BLOCKED
```

- **Duration**: ~18 seconds (deterministic gates)
- **Gate**: All 7 stages green = DEPLOY_READY
- **Nightly**: Optional self-improvement sweep (learn/heal loop)
- **Security job**: gitleaks secret scan + CycloneDX SBOM artifact
- **CodeQL job**: GitHub code scanning for JS
- **Coverage gate**: `npm run coverage:gate` — c8 `--check-coverage` floor (lines 50 / functions 35 / branches 45)
- **API conformance**: `node scripts/eval/api-conformance.mjs` — every documented route live-probed against api-spec.yaml, kills silent spec drift
- **Multi-browser E2E**: Playwright runs `test/e2e.test.js` on chromium + firefox + webkit
- **Self-heal discover**: `scripts/self-heal/discover.mjs` — findings → candidate patches (dry-run + real test gate, blocklist enforced)

---

## Key Design Principles

1. **No circular dependencies** — all 93 modules form a DAG
2. **Hash-chained integrity** — every persistent record is tamper-evident
3. **Domain-aware** — sentiment, bias, triage all adjust for domain context
4. **Explainability** — every match, score, and detection includes evidence trail
5. **Offline-first** — all engines run without external APIs; optional keys enable LLM layers
6. **Test-driven invariants** — 25 property-based fuzz tests plus 834 unit/integration tests
7. **Production-ready manifests** — K8s deployment plans generated for all 15+ services