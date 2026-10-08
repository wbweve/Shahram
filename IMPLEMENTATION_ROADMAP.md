# Leadership OS Implementation Roadmap

This roadmap turns the platform's existing breadth into a production-grade, linked operating system. A capability is not complete when a pure function or screen exists; it is complete when it is persisted, authorized, integrated, observable, recoverable, and independently evaluated.

## Product Non-Negotiables

- Abstain or escalate when evidence is stale, contradictory, unauthorized, biased, or incomplete.
- Keep personal, employee, conflict, health-adjacent, and employer-governance data purpose-bound and need-to-know.
- Never let automation make irreversible consequential decisions without an explicit policy-approved human gate.
- Preserve source lineage, calculation version, actor, time, tenant, and correlation ID for every material result.
- Treat financial, employment, safety, legal, and compliance outputs as decision support, not professional advice.

## Phase 0: Contract and Security Foundation

**Goal:** Make every later module safe to connect.

Deliverables:

- Canonical versioned schemas for people, organizations, initiatives, projects, tasks, decisions, risks, controls, conflicts, finance records, evidence, and events.
- Schema registry with backward-compatibility checks, migrations, stable IDs, timestamps, tenant IDs, source IDs, and field-level provenance.
- Durable event bus with ordering, deduplication, replay, retry, dead-letter, correlation, and saga compensation.
- Fine-grained authorization: tenant, workspace, project, record, field, purpose, geography, and role.
- MFA/WebAuthn, session revocation, device management, SCIM lifecycle, step-up authentication, break-glass expiry, and authorization-decision logging.
- KMS/Vault-backed secrets, key rotation, encrypted backups, and field-level privacy controls.
- OpenTelemetry traces, structured audit context, SLOs, health checks, and request-to-job correlation.

Acceptance gates:

- Hostile cross-tenant and cross-field authorization tests pass.
- Every event can be replayed deterministically without duplicate business effects.
- Schema changes fail CI when compatibility is broken.
- A revoked user, expired session, and expired break-glass grant lose access immediately.

## Phase 1: Durable Automation Control Plane

**Goal:** Safely connect the modules.

Deliverables:

- Durable scheduler and worker queues.
- Idempotency keys, lease ownership, retry policy, dead-letter inspection, and replay.
- Automation modes: suggest, prepare, execute-with-approval, and execute.
- Preview, dry-run, simulation, expiration, rollback, blast-radius, rate, budget, and anomaly limits.
- Four-eyes approval for finance, HR, privacy, conflict, risk, and external write-back actions.
- Automation evidence containing input snapshot, policy decision, output, actor, and side effects.
- Notification routing with acknowledgement, escalation, quiet hours, and delivery proof.

Acceptance gates:

- Worker crashes do not duplicate a financial posting or external write-back.
- Kill switch stops new effects while preserving diagnostics and evidence.
- Every consequential action has a human-readable preview and policy reason.

## Phase 2: Finance and Business Control Plane

**Goal:** Make financial management operationally credible.

Deliverables:

- Accounts payable/receivable, purchase orders, expenses, invoices, accruals, fixed assets, depreciation, inventory, payroll interfaces, and revenue recognition.
- Multi-entity consolidation, eliminations, intercompany transactions, tax calendars, and statutory reporting adapters.
- Bank reconciliation exceptions, close checklist, controller sign-off, locked periods, restatements, and auditor workpapers.
- Source-to-statement lineage: bank or ERP source -> journal -> ledger -> statement -> board pack.
- CRM, sales pipeline, product roadmap, customer health, procurement, contract lifecycle, and service-level management.
- Strategy -> initiative -> project -> task -> cost -> outcome linkage.

Acceptance gates:

- Independently generated journals always balance.
- Reconciliation handles duplicates, reversals, partial matches, currency differences, and late-arriving data.
- Closed periods cannot be mutated without audited reopen and approval.
- Board and management reports reconcile to the same underlying ledger.

## Phase 3: People, Personal Leadership, and Conflict Safety

**Goal:** Make human data useful without making the app coercive or unsafe.

Deliverables:

- Purpose-bound data classes for personal coaching, employee development, performance, conflict, safeguarding, and governance.
- Consent, withdrawal, retention, participant visibility, legal hold, and need-to-know access.
- Mediator workflow, retaliation monitoring, safeguarding escalation, recurrence tracking, and confidential case partitioning.
- Competency framework, evidence-backed development plans, decision-rights delegation, team operating agreements, and succession readiness.
- Feedback anti-gaming controls, rater confidentiality, coaching quality review, and human-coach escalation.
- Explicit boundaries for medical, therapeutic, legal, and emergency situations.

Acceptance gates:

- Personal reflections cannot silently appear in employer evaluation or conflict cases.
- Every people score exposes evidence, uncertainty, freshness, missing data, and appeal path.
- Employment-impacting recommendations require human review and bias assessment.

## Phase 4: Risk, Resilience, and Crisis Operations

**Goal:** Prove that the organization can absorb and recover from shocks.

Deliverables:

- Enterprise risk taxonomy, appetite hierarchy, control ownership, control testing, exceptions, compensating controls, and expiry.
- Cyber, privacy, model, third-party, concentration, climate, geopolitical, and regulatory risk.
- Business impact analysis, dependency graph, continuity plans, crisis command center, and communication plans.
- Isolated restore environment, backup verification, recovery exercises, and dependency-aware RTO/RPO evidence.
- Incident lifecycle from detection through RCA, corrective action, closure, recurrence, and lessons learned.

Acceptance gates:

- Restore drills recover usable data into an isolated environment.
- RTO/RPO claims are measured rather than declared.
- High-risk controls cannot be marked effective without current evidence.
- Crisis simulations produce assigned actions that flow into the ordinary work and risk registers.

## Phase 5: Integrations and Write-Back

**Goal:** Replace isolated fixtures with controlled system-of-record connectivity.

Priority connectors:

- Microsoft Graph and Teams
- Google Workspace
- Slack
- Jira, GitHub, GitLab, and Azure DevOps
- Business Central, NetSuite, SAP, Xero, and QuickBooks
- Salesforce and HubSpot
- Workday, HiBob, and BambooHR
- E-signature, document management, SIEM, data warehouse, email, SMS, and push providers

Every connector must provide OAuth rotation, least privilege, tenant isolation, checkpoints, replay, provenance, schema-drift detection, rate limits, webhook verification, conflict resolution, and policy-controlled write-back.

Acceptance gates:

- Connector outage, token expiry, duplication, replay, and vendor schema change are tested.
- Write-back is disabled by default and requires an explicit policy grant.
- Imported records remain traceable to the external source and sync attempt.

## Phase 6: AI and Decision Intelligence

**Goal:** Make predictions and narratives calibrated, bounded, and contestable.

Deliverables:

- Model registry with owner, version, training data, limitations, approval, and retirement status.
- Calibration, drift, subgroup fairness, harmful-error, abstention, and data-quality monitoring.
- Retrieval-grounded narratives with source references, freshness, claim verification, and refusal on unsupported claims.
- Tenant-separated model context, prompt-injection isolation, tool authorization, output validation, and data-loss prevention.
- Human override, appeal, incident, and model rollback workflows.
- Decision recommendations that show alternatives, assumptions, uncertainty, dissent, reversibility, and expected side effects.

Acceptance gates:

- Models abstain when evidence is insufficient.
- No unsupported claim reaches an executive, employee, financial, or compliance report.
- Model performance and fairness are evaluated continuously after deployment.

## Evaluation Program

Add independent gates for:

- Financial differential and reconciliation testing
- Authorization and tenant-isolation matrices
- Property-based invariants and mutation testing
- Connector replay, outage, duplication, and schema-drift testing
- Chaos testing for database, queue, network, clock, webhook, and dependency failures
- Backup restore and measured RTO/RPO drills
- Model calibration, fairness, drift, abstention, and subgroup performance
- LLM prompt injection, tool abuse, data exfiltration, claim grounding, and tenant leakage
- Conflict/privacy abuse cases and insider-threat simulations
- Accessibility, keyboard, screen-reader, localization, and mobile/offline workflows
- Longitudinal outcomes: decision quality, conflict recurrence, forecast accuracy, cash variance, retention, and control failures
- External penetration testing, DPIAs, SOC 2/ISO 27001 readiness, and independent audit review

## Definition of Done

A feature is production-ready only when all of the following are true:

1. It has a versioned schema and canonical identifier.
2. It is linked through the event and provenance model.
3. It has tenant- and purpose-aware authorization.
4. It has deterministic calculations or documented model behavior.
5. It has human-safe automation policy and rollback behavior.
6. It has audit, evidence, observability, and retention behavior.
7. It has unit, integration, adversarial, failure, and accessibility coverage appropriate to its risk.
8. It has a restore or recovery story.
9. It documents limitations, uncertainty, and escalation paths.
10. It has measurable post-release outcomes.

## Cross-Cutting Gate: Every Implemented Method Is Reachable and Wired

A recurring failure mode in wide platforms is **implemented-but-unreachable** capability: a calculator and renderer exist but nothing in the navigation links to them, or two registers overlap and drift apart. This roadmap treats reachability and de-duplication as a release gate:

- Every view in the navigation must render, carry a guide, and name its related modules (reciprocal wiring is enforced by `test/nav-wiring-integrity.test.js`).
- Every implemented renderer must be reachable from navigation or an in-app target — an audit of `VIEWS_RENDER` catches orphans (`test/leadership-views.test.js`).
- Every domain keeps **one canonical register** per concept; overlapping registers are merged with a server-side migration and legacy-data fallbacks (done for conflict cases: `conflicts` is the single register; the `conflictCases` view reads it).
- Every register propagates TODO actions into the modules it wires into (`todoWiringCoverage` = 0 gaps).

The August 2026 wiring pass wired **10 previously orphaned views** (resourceCapacity, changeImpact, crossProject, engagement, exportVerified, predictive, scenarioCompare, lessonsPrompts, capitalAllocation, portfolioOptimizer) into navigation with guides, related-module wiring, register mappings, and TODO rules — navigation now holds **183 views**, zero orphans, zero coverage gaps.

## Execution Order

1. Phase 0 contracts and security
2. Phase 1 automation control plane
3. Phase 2 finance and business controls
4. Phase 3 people and conflict safety
5. Phase 4 resilience and crisis operations
6. Phase 5 production integrations
7. Phase 6 AI and decision intelligence
8. External assurance and longitudinal outcome validation
