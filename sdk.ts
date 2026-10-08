// Auto-generated TypeScript SDK for Leadership OS API
// 410 endpoints across 143 domains
// Generated: 2026-08-24T16:02:41.900Z

export class LeadershipOSClient {
  private baseUrl: string;
  private token: string;

  constructor(opts: { baseUrl?: string; token?: string } = {}) {
    this.baseUrl = opts.baseUrl || "http://localhost:8001";
    this.token = opts.token || "";
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(`${res.status}: ${err.error || res.statusText}`);
    }

    return res.json();
  }

  // ─── abac ───

  async abac_abac_authorize(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/abac/authorize", body);
  }

  // ─── admin ───

  async admin_admin_elevate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/admin/elevate", body);
  }

  async admin_admin_elevations(): Promise<unknown> {
    return this.request("GET", "/api/admin/elevations");
  }

  // ─── ai ───

  async ai_ai_narrative(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ai/narrative", body);
  }

  async ai_ai_guard(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ai/guard", body);
  }

  async ai_ai_abstain(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ai/abstain", body);
  }

  async ai_ai_ground(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ai/ground", body);
  }

  // ─── ai-governance ───

  async aiGovernance_ai_governance_enforce(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ai-governance/enforce", body);
  }

  // ─── ai-training ───

  async aiTraining_ai_training_dataset(): Promise<unknown> {
    return this.request("GET", "/api/ai-training/dataset");
  }

  async aiTraining_ai_training_quality(): Promise<unknown> {
    return this.request("GET", "/api/ai-training/quality");
  }

  // ─── alerts ───

  async alerts_alerts_digest(): Promise<unknown> {
    return this.request("GET", "/api/alerts/digest");
  }

  async alerts_alerts_watchers(): Promise<unknown> {
    return this.request("GET", "/api/alerts/watchers");
  }

  async alerts_alerts_acknowledge(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/alerts/acknowledge", body);
  }

  async alerts_alerts(): Promise<unknown> {
    return this.request("GET", "/api/alerts");
  }

  // ─── analytics ───

  async analytics_analytics_usage(): Promise<unknown> {
    return this.request("GET", "/api/analytics/usage");
  }

  // ─── approvals ───

  async approvals_approvals(): Promise<unknown> {
    return this.request("GET", "/api/approvals");
  }

  async approvals_approvals(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/approvals", body);
  }

  // ─── attestation ───

  async attestation_attestation_export(): Promise<unknown> {
    return this.request("GET", "/api/attestation/export");
  }

  async attestation_attestation_export(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/attestation/export", body);
  }

  // ─── audit ───

  async audit_audit_search(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/audit/search", body);
  }

  async audit_audit_faceted(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/audit/faceted", body);
  }

  async audit_audit(): Promise<unknown> {
    return this.request("GET", "/api/audit");
  }

  async audit_audit(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/audit", body);
  }

  async audit_audit_evidence_package(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/audit/evidence-package", body);
  }

  async audit_audit_all_packages(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/audit/all-packages", body);
  }

  async audit_audit_verify_(): Promise<unknown> {
    return this.request("GET", "/api/audit/verify/");
  }

  // ─── auth ───

  async auth_auth_config(): Promise<unknown> {
    return this.request("GET", "/api/auth/config");
  }

  async auth_auth_register(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/register", body);
  }

  async auth_auth_login(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/login", body);
  }

  async auth_auth_2fa_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/2fa/verify", body);
  }

  async auth_auth_logout(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/logout", body);
  }

  async auth_auth_me(): Promise<unknown> {
    return this.request("GET", "/api/auth/me");
  }

  async auth_auth_2fa_setup(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/2fa/setup", body);
  }

  async auth_auth_2fa_enable(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/2fa/enable", body);
  }

  async auth_auth_2fa_disable(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/2fa/disable", body);
  }

  async auth_auth_change_password(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/change-password", body);
  }

  async auth_auth_users(): Promise<unknown> {
    return this.request("GET", "/api/auth/users");
  }

  async auth_auth_users_(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/auth/users/", body);
  }

  async auth_auth_integrity(): Promise<unknown> {
    return this.request("GET", "/api/auth/integrity");
  }

  // ─── automation ───

  async automation_automation(): Promise<unknown> {
    return this.request("GET", "/api/automation");
  }

  async automation_automation_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/automation/run", body);
  }

  async automation_automation_ack(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/automation/ack", body);
  }

  async automation_automation_evidence(): Promise<unknown> {
    return this.request("GET", "/api/automation/evidence");
  }

  async automation_automation_evidence(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/automation/evidence", body);
  }

  // ─── backup ───

  async backup_backup_manifest(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/backup/manifest", body);
  }

  async backup_backup_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/backup/verify", body);
  }

  async backup_backup_rto_rpo(): Promise<unknown> {
    return this.request("GET", "/api/backup/rto-rpo");
  }

  // ─── benchmarking ───

  async benchmarking_benchmarking(): Promise<unknown> {
    return this.request("GET", "/api/benchmarking");
  }

  // ─── benchmarks ───

  async benchmarks_benchmarks_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/benchmarks/run", body);
  }

  async benchmarks_benchmarks(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/benchmarks", body);
  }

  // ─── bias ───

  async bias_bias_audit(): Promise<unknown> {
    return this.request("GET", "/api/bias/audit");
  }

  // ─── board-pack ───

  async boardPack_board_pack(): Promise<unknown> {
    return this.request("GET", "/api/board-pack");
  }

  async boardPack_board_pack_exec_summary(): Promise<unknown> {
    return this.request("GET", "/api/board-pack/exec-summary");
  }

  // ─── board-prep ───

  async boardPrep_board_prep_assemble(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/board-prep/assemble", body);
  }

  async boardPrep_board_prep_post_meeting(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/board-prep/post-meeting", body);
  }

  // ─── calibration ───

  async calibration_calibration(): Promise<unknown> {
    return this.request("GET", "/api/calibration");
  }

  async calibration_calibration_record(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/calibration/record", body);
  }

  async calibration_calibration_roi(): Promise<unknown> {
    return this.request("GET", "/api/calibration/roi");
  }

  // ─── canonical-records ───

  async canonicalRecords_canonical_records(): Promise<unknown> {
    return this.request("GET", "/api/canonical-records");
  }

  async canonicalRecords_canonical_records(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/canonical-records", body);
  }

  // ─── capabilities ───

  async capabilities_capabilities_people_churn_risk(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/capabilities/people/churn-risk", body);
  }

  async capabilities_capabilities_trust_score(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/capabilities/trust/score", body);
  }

  async capabilities_capabilities_causal_propagate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/capabilities/causal/propagate", body);
  }

  // ─── causal ───

  async causal_causal_attribute(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/causal/attribute", body);
  }

  async causal_causal_report(): Promise<unknown> {
    return this.request("GET", "/api/causal/report");
  }

  async causal_causal_evaluate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/causal/evaluate", body);
  }

  // ─── chaos ───

  async chaos_chaos_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/chaos/run", body);
  }

  async chaos_chaos_health(): Promise<unknown> {
    return this.request("GET", "/api/chaos/health");
  }

  // ─── chief-of-staff ───

  async chiefOfStaff_chief_of_staff_morning_briefing(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/chief-of-staff/morning-briefing", body);
  }

  async chiefOfStaff_chief_of_staff_midday_check(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/chief-of-staff/midday-check", body);
  }

  async chiefOfStaff_chief_of_staff_evening_wrap(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/chief-of-staff/evening-wrap", body);
  }

  // ─── circuit-breaker ───

  async circuitBreaker_circuit_breaker_health(): Promise<unknown> {
    return this.request("GET", "/api/circuit-breaker/health");
  }

  async circuitBreaker_circuit_breaker_create(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/circuit-breaker/create", body);
  }

  // ─── close-to-report ───

  async closeToReport_close_to_report_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/close-to-report/run", body);
  }

  // ─── coach ───

  async coach_coach_ask(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/coach/ask", body);
  }

  async coach_coach_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/coach/verify", body);
  }

  async coach_coach_answers(): Promise<unknown> {
    return this.request("GET", "/api/coach/answers");
  }

  async coach_coach_answers_verify(): Promise<unknown> {
    return this.request("GET", "/api/coach/answers/verify");
  }

  // ─── cognitive-diversity ───

  async cognitiveDiversity_cognitive_diversity_team(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/cognitive-diversity/team", body);
  }

  async cognitiveDiversity_cognitive_diversity_org(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/cognitive-diversity/org", body);
  }

  async cognitiveDiversity_cognitive_diversity_hire_recommendation(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/cognitive-diversity/hire-recommendation", body);
  }

  // ─── collab ───

  async collab_collab_health(): Promise<unknown> {
    return this.request("GET", "/api/collab/health");
  }

  async collab_collab_edit(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/collab/edit", body);
  }

  // ─── compliance ───

  async compliance_compliance_scan(): Promise<unknown> {
    return this.request("GET", "/api/compliance/scan");
  }

  async compliance_compliance_package(): Promise<unknown> {
    return this.request("GET", "/api/compliance/package");
  }

  async compliance_compliance_calendar(): Promise<unknown> {
    return this.request("GET", "/api/compliance/calendar");
  }

  async compliance_compliance_obligations(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/compliance/obligations", body);
  }

  async compliance_compliance_obligations_submit(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/compliance/obligations/submit", body);
  }

  async compliance_compliance_soc2_iso(): Promise<unknown> {
    return this.request("GET", "/api/compliance/soc2-iso");
  }

  // ─── config ───

  async config_config(): Promise<unknown> {
    return this.request("GET", "/api/config");
  }

  // ─── conflict-warning ───

  async conflictWarning_conflict_warning(): Promise<unknown> {
    return this.request("GET", "/api/conflict-warning");
  }

  // ─── conflicts ───

  async conflicts_conflicts_outcome(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/conflicts/outcome", body);
  }

  async conflicts_conflicts_personal(): Promise<unknown> {
    return this.request("GET", "/api/conflicts/personal");
  }

  async conflicts_conflicts_personal(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/conflicts/personal", body);
  }

  // ─── connector ───

  async connector_connector_bank_import(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connector/bank-import", body);
  }

  // ─── connectors ───

  async connectors_connectors(): Promise<unknown> {
    return this.request("GET", "/api/connectors");
  }

  async connectors_connectors_config(): Promise<unknown> {
    return this.request("GET", "/api/connectors/config");
  }

  async connectors_connectors_config(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connectors/config", body);
  }

  async connectors_connectors_writeback(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connectors/writeback", body);
  }

  async connectors_connectors_checkpoint(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connectors/checkpoint", body);
  }

  async connectors_connectors_failure(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connectors/failure", body);
  }

  async connectors_connectors_dead_letter(): Promise<unknown> {
    return this.request("GET", "/api/connectors/dead-letter");
  }

  async connectors_connectors_retry_due(): Promise<unknown> {
    return this.request("GET", "/api/connectors/retry-due");
  }

  async connectors_connectors_replay(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/connectors/replay", body);
  }

  async connectors_connectors_health(): Promise<unknown> {
    return this.request("GET", "/api/connectors/health");
  }

  // ─── consent ───

  async consent_consent_banner(): Promise<unknown> {
    return this.request("GET", "/api/consent/banner");
  }

  async consent_consent_grant(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/consent/grant", body);
  }

  async consent_consent_compliance(): Promise<unknown> {
    return this.request("GET", "/api/consent/compliance");
  }

  // ─── consistency ───

  async consistency_consistency_scan(): Promise<unknown> {
    return this.request("GET", "/api/consistency/scan");
  }

  // ─── contracts ───

  async contracts_contracts(): Promise<unknown> {
    return this.request("GET", "/api/contracts");
  }

  // ─── control-center ───

  async controlCenter_control_center(): Promise<unknown> {
    return this.request("GET", "/api/control-center");
  }

  // ─── cost ───

  async cost_cost_allocate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/cost/allocate", body);
  }

  async cost_cost_budget_variance(): Promise<unknown> {
    return this.request("GET", "/api/cost/budget-variance");
  }

  // ─── crisis ───

  async crisis_crisis_activate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/crisis/activate", body);
  }

  async crisis_crisis_status(): Promise<unknown> {
    return this.request("GET", "/api/crisis/status");
  }

  async crisis_crisis_log(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/crisis/log", body);
  }

  async crisis_crisis_contain(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/crisis/contain", body);
  }

  async crisis_crisis_close(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/crisis/close", body);
  }

  // ─── crm ───

  async crm_crm_pipeline(): Promise<unknown> {
    return this.request("GET", "/api/crm/pipeline");
  }

  // ─── culture ───

  async culture_culture_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/culture/dashboard");
  }

  // ─── dark-launch ───

  async darkLaunch_dark_launch(): Promise<unknown> {
    return this.request("GET", "/api/dark-launch");
  }

  async darkLaunch_dark_launch(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dark-launch", body);
  }

  // ─── dashboard ───

  async dashboard_dashboard_roles(): Promise<unknown> {
    return this.request("GET", "/api/dashboard/roles");
  }

  async dashboard_dashboard_(): Promise<unknown> {
    return this.request("GET", "/api/dashboard/");
  }

  // ─── db ───

  async db_db_migration_test(): Promise<unknown> {
    return this.request("GET", "/api/db/migration-test");
  }

  async db_db_schema_validate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/db/schema-validate", body);
  }

  async db_db_pool_health(): Promise<unknown> {
    return this.request("GET", "/api/db/pool-health");
  }

  async db_db_pool_optimize(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/db/pool-optimize", body);
  }

  // ─── decision-debt ───

  async decisionDebt_decision_debt_register(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decision-debt/register", body);
  }

  async decisionDebt_decision_debt_portfolio(): Promise<unknown> {
    return this.request("GET", "/api/decision-debt/portfolio");
  }

  async decisionDebt_decision_debt_resolve(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decision-debt/resolve", body);
  }

  async decisionDebt_decision_debt_trend(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decision-debt/trend", body);
  }

  // ─── decisions ───

  async decisions_decisions_trace(): Promise<unknown> {
    return this.request("GET", "/api/decisions/trace");
  }

  async decisions_decisions_graph(): Promise<unknown> {
    return this.request("GET", "/api/decisions/graph");
  }

  async decisions_decisions_outcomes(): Promise<unknown> {
    return this.request("GET", "/api/decisions/outcomes");
  }

  async decisions_decisions_outcomes(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decisions/outcomes", body);
  }

  async decisions_decisions_outcomes_resolve(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decisions/outcomes/resolve", body);
  }

  async decisions_decisions_simulate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/decisions/simulate", body);
  }

  // ─── dependencies ───

  async dependencies_dependencies_graph(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dependencies/graph", body);
  }

  async dependencies_dependencies_ripple(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dependencies/ripple", body);
  }

  async dependencies_dependencies_break_scenarios(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dependencies/break-scenarios", body);
  }

  async dependencies_dependencies_hidden(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dependencies/hidden", body);
  }

  // ─── deploy ───

  async deploy_deploy_blue_green(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/deploy/blue-green", body);
  }

  async deploy_deploy_rollback(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/deploy/rollback", body);
  }

  // ─── digital-twin ───

  async digitalTwin_digital_twin(): Promise<unknown> {
    return this.request("GET", "/api/digital-twin");
  }

  async digitalTwin_digital_twin_propagate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/digital-twin/propagate", body);
  }

  async digitalTwin_digital_twin_counterfactual(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/digital-twin/counterfactual", body);
  }

  // ─── dpia ───

  async dpia_dpia(): Promise<unknown> {
    return this.request("GET", "/api/dpia");
  }

  async dpia_dpia(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dpia", body);
  }

  // ─── dr ───

  async dr_dr_simulate(): Promise<unknown> {
    return this.request("GET", "/api/dr/simulate");
  }

  async dr_dr_verify_backups(): Promise<unknown> {
    return this.request("GET", "/api/dr/verify-backups");
  }

  // ─── dsar ───

  async dsar_dsar_create(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/dsar/create", body);
  }

  async dsar_dsar_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/dsar/dashboard");
  }

  async dsar_dsar_compliance_report(): Promise<unknown> {
    return this.request("GET", "/api/dsar/compliance-report");
  }

  // ─── esg ───

  async esg_esg_disclosure_pack(): Promise<unknown> {
    return this.request("GET", "/api/esg/disclosure-pack");
  }

  async esg_esg_carbon(): Promise<unknown> {
    return this.request("GET", "/api/esg/carbon");
  }

  async esg_esg_dei(): Promise<unknown> {
    return this.request("GET", "/api/esg/dei");
  }

  // ─── events ───

  async events_events(): Promise<unknown> {
    return this.request("GET", "/api/events");
  }

  async events_events(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/events", body);
  }

  // ─── evidence ───

  async evidence_evidence_package(): Promise<unknown> {
    return this.request("GET", "/api/evidence/package");
  }

  // ─── experiments ───

  async experiments_experiments(): Promise<unknown> {
    return this.request("GET", "/api/experiments");
  }

  async experiments_experiments(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/experiments", body);
  }

  async experiments_experiments_assign(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/experiments/assign", body);
  }

  async experiments_experiments_outcome(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/experiments/outcome", body);
  }

  async experiments_experiments_analyze(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/experiments/analyze", body);
  }

  // ─── explainability ───

  async explainability_explainability_unified(): Promise<unknown> {
    return this.request("GET", "/api/explainability/unified");
  }

  async explainability_explainability_gaps(): Promise<unknown> {
    return this.request("GET", "/api/explainability/gaps");
  }

  // ─── feedback-360 ───

  async feedback-360_feedback_360(): Promise<unknown> {
    return this.request("GET", "/api/feedback-360");
  }

  async feedback-360_feedback_360_anonymize(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/feedback-360/anonymize", body);
  }

  // ─── finance ───

  async finance_finance_journal(): Promise<unknown> {
    return this.request("GET", "/api/finance/journal");
  }

  async finance_finance_journal(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/journal", body);
  }

  async finance_finance_period_close(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/period-close", body);
  }

  async finance_finance_verify_trial_balance(): Promise<unknown> {
    return this.request("GET", "/api/finance/verify-trial-balance");
  }

  async finance_finance_validate_entry(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/validate-entry", body);
  }

  async finance_finance_reconciliation_report(): Promise<unknown> {
    return this.request("GET", "/api/finance/reconciliation-report");
  }

  async finance_finance_reconcile_entry(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/reconcile-entry", body);
  }

  async finance_finance_three_way_match(): Promise<unknown> {
    return this.request("GET", "/api/finance/three-way-match");
  }

  async finance_finance_ledger_audit(): Promise<unknown> {
    return this.request("GET", "/api/finance/ledger-audit");
  }

  async finance_finance_period_close_double_entry(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/period-close-double-entry", body);
  }

  async finance_finance_operations(): Promise<unknown> {
    return this.request("GET", "/api/finance/operations");
  }

  async finance_finance_operations(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/operations", body);
  }

  async finance_finance_three_way_match(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/three-way-match", body);
  }

  async finance_finance_bank_feed(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/bank-feed", body);
  }

  async finance_finance_rates(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/rates", body);
  }

  async finance_finance_reconcile(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/reconcile", body);
  }

  async finance_finance_payment_instructions(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/payment-instructions", body);
  }

  async finance_finance_close(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/close", body);
  }

  async finance_finance_close_reopen(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/close/reopen", body);
  }

  async finance_finance_close_status(): Promise<unknown> {
    return this.request("GET", "/api/finance/close/status");
  }

  async finance_finance_ap(): Promise<unknown> {
    return this.request("GET", "/api/finance/ap");
  }

  async finance_finance_ap(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/ap", body);
  }

  async finance_finance_ar(): Promise<unknown> {
    return this.request("GET", "/api/finance/ar");
  }

  async finance_finance_payroll_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/finance/payroll/run", body);
  }

  async finance_finance_assets(): Promise<unknown> {
    return this.request("GET", "/api/finance/assets");
  }

  async finance_finance_inventory(): Promise<unknown> {
    return this.request("GET", "/api/finance/inventory");
  }

  // ─── financial-statements ───

  async financialStatements_financial_statements_pnl(): Promise<unknown> {
    return this.request("GET", "/api/financial-statements/pnl");
  }

  async financialStatements_financial_statements_balance_sheet(): Promise<unknown> {
    return this.request("GET", "/api/financial-statements/balance-sheet");
  }

  async financialStatements_financial_statements_cashflow(): Promise<unknown> {
    return this.request("GET", "/api/financial-statements/cashflow");
  }

  async financialStatements_financial_statements_full(): Promise<unknown> {
    return this.request("GET", "/api/financial-statements/full");
  }

  // ─── forecasts ───

  async forecasts_forecasts(): Promise<unknown> {
    return this.request("GET", "/api/forecasts");
  }

  async forecasts_forecasts(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/forecasts", body);
  }

  async forecasts_forecasts_actual(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/forecasts/actual", body);
  }

  // ─── forensic-audit ───

  async forensicAudit_forensic_audit(): Promise<unknown> {
    return this.request("GET", "/api/forensic-audit");
  }

  async forensicAudit_forensic_audit_report(): Promise<unknown> {
    return this.request("GET", "/api/forensic-audit/report");
  }

  async forensicAudit_forensic_audit_export(): Promise<unknown> {
    return this.request("GET", "/api/forensic-audit/export");
  }

  // ─── fraud ───

  async fraud_fraud_scan(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/fraud/scan", body);
  }

  async fraud_fraud_heat_map(): Promise<unknown> {
    return this.request("GET", "/api/fraud/heat-map");
  }

  // ─── fx ───

  async fx_fx_exposure(): Promise<unknown> {
    return this.request("GET", "/api/fx/exposure");
  }

  async fx_fx_consolidate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/fx/consolidate", body);
  }

  async fx_fx_rates(): Promise<unknown> {
    return this.request("GET", "/api/fx/rates");
  }

  // ─── geopolitical-risk ───

  async geopoliticalRisk_geopolitical_risk(): Promise<unknown> {
    return this.request("GET", "/api/geopolitical-risk");
  }

  async geopoliticalRisk_geopolitical_risk_supply_chain(): Promise<unknown> {
    return this.request("GET", "/api/geopolitical-risk/supply-chain");
  }

  // ─── governance ───

  async governance_governance(): Promise<unknown> {
    return this.request("GET", "/api/governance");
  }

  async governance_governance_decisions(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/governance/decisions", body);
  }

  async governance_governance_actions(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/governance/actions", body);
  }

  // ─── graph ───

  async graph_graph(): Promise<unknown> {
    return this.request("GET", "/api/graph");
  }

  // ─── graphql ───

  async graphql_graphql(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/graphql", body);
  }

  async graphql_graphql_schema(): Promise<unknown> {
    return this.request("GET", "/api/graphql/schema");
  }

  // ─── health ───

  async health_health(): Promise<unknown> {
    return this.request("GET", "/api/health");
  }

  // ─── incidents ───

  async incidents_incidents(): Promise<unknown> {
    return this.request("GET", "/api/incidents");
  }

  async incidents_incidents(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/incidents", body);
  }

  async incidents_incidents_action(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/incidents/action", body);
  }

  // ─── innovation ───

  async innovation_innovation_score(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/innovation/score", body);
  }

  async innovation_innovation_gate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/innovation/gate", body);
  }

  async innovation_innovation_portfolio(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/innovation/portfolio", body);
  }

  async innovation_innovation_auto_kill(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/innovation/auto-kill", body);
  }

  async innovation_innovation_zombies(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/innovation/zombies", body);
  }

  // ─── insights ───

  async insights_insights_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/insights/verify", body);
  }

  // ─── integrity ───

  async integrity_integrity(): Promise<unknown> {
    return this.request("GET", "/api/integrity");
  }

  async integrity_integrity(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/integrity", body);
  }

  // ─── jobs ───

  async jobs_jobs(): Promise<unknown> {
    return this.request("GET", "/api/jobs");
  }

  async jobs_jobs_claim(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/jobs/claim", body);
  }

  async jobs_jobs_renew(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/jobs/renew", body);
  }

  async jobs_jobs_release(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/jobs/release", body);
  }

  async jobs_jobs_complete(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/jobs/complete", body);
  }

  // ─── journeys ───

  async journeys_journeys_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/journeys/run", body);
  }

  async journeys_journeys_(): Promise<unknown> {
    return this.request("GET", "/api/journeys/");
  }

  // ─── k8s ───

  async k8s_k8s_deployment_plan(): Promise<unknown> {
    return this.request("GET", "/api/k8s/deployment-plan");
  }

  async k8s_k8s_validate(): Promise<unknown> {
    return this.request("GET", "/api/k8s/validate");
  }

  async k8s_k8s_cost_estimate(): Promise<unknown> {
    return this.request("GET", "/api/k8s/cost-estimate");
  }

  async k8s_k8s_readiness(): Promise<unknown> {
    return this.request("GET", "/api/k8s/readiness");
  }

  // ─── knowledge ───

  async knowledge_knowledge_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/knowledge/dashboard");
  }

  async knowledge_knowledge_bus_factor(): Promise<unknown> {
    return this.request("GET", "/api/knowledge/bus-factor");
  }

  async knowledge_knowledge_transfer_plan(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/knowledge/transfer-plan", body);
  }

  // ─── leadership-fingerprint ───

  async leadershipFingerprint_leadership_fingerprint(): Promise<unknown> {
    return this.request("GET", "/api/leadership-fingerprint");
  }

  async leadershipFingerprint_leadership_fingerprint_evidence(): Promise<unknown> {
    return this.request("GET", "/api/leadership-fingerprint/evidence");
  }

  // ─── learning ───

  async learning_learning_weekly(): Promise<unknown> {
    return this.request("GET", "/api/learning/weekly");
  }

  async learning_learning_experiments(): Promise<unknown> {
    return this.request("GET", "/api/learning/experiments");
  }

  async learning_learning_org_score(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/learning/org-score", body);
  }

  // ─── load-test ───

  async loadTest_load_test_plan(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/load-test/plan", body);
  }

  async loadTest_load_test_stress(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/load-test/stress", body);
  }

  // ─── longitudinal-sim ───

  async longitudinalSim_longitudinal_sim_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/longitudinal-sim/run", body);
  }

  async longitudinalSim_longitudinal_sim_compare(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/longitudinal-sim/compare", body);
  }

  async longitudinalSim_longitudinal_sim_stress_test(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/longitudinal-sim/stress-test", body);
  }

  // ─── market ───

  async market_market_quotes(): Promise<unknown> {
    return this.request("GET", "/api/market/quotes");
  }

  // ─── meetings ───

  async meetings_meetings_analyze(): Promise<unknown> {
    return this.request("GET", "/api/meetings/analyze");
  }

  // ─── memory ───

  async memory_memory_capture(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/memory/capture", body);
  }

  async memory_memory_search(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/memory/search", body);
  }

  async memory_memory_knowledge_map(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/memory/knowledge-map", body);
  }

  // ─── mentorship ───

  async mentorship_mentorship_match(): Promise<unknown> {
    return this.request("GET", "/api/mentorship/match");
  }

  async mentorship_mentorship_succession(): Promise<unknown> {
    return this.request("GET", "/api/mentorship/succession");
  }

  // ─── metrics ───

  async metrics_metrics(): Promise<unknown> {
    return this.request("GET", "/api/metrics");
  }

  // ─── ml ───

  async ml_ml_infer(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/ml/infer", body);
  }

  async ml_ml_models(): Promise<unknown> {
    return this.request("GET", "/api/ml/models");
  }

  // ─── mobile ───

  async mobile_mobile_config(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mobile/config", body);
  }

  async mobile_mobile_send(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mobile/send", body);
  }

  async mobile_mobile_register_device(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mobile/register-device", body);
  }

  // ─── models ───

  async models_models(): Promise<unknown> {
    return this.request("GET", "/api/models");
  }

  async models_models(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/models", body);
  }

  async models_models_validate(): Promise<unknown> {
    return this.request("GET", "/api/models/validate");
  }

  async models_models_drift(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/models/drift", body);
  }

  async models_models_fairness(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/models/fairness", body);
  }

  async models_models_train(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/models/train", body);
  }

  // ─── mq ───

  async mq_mq_publish(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mq/publish", body);
  }

  async mq_mq_health(): Promise<unknown> {
    return this.request("GET", "/api/mq/health");
  }

  async mq_mq_topics(): Promise<unknown> {
    return this.request("GET", "/api/mq/topics");
  }

  async mq_mq_pending(): Promise<unknown> {
    return this.request("GET", "/api/mq/pending");
  }

  async mq_mq_dead_letter(): Promise<unknown> {
    return this.request("GET", "/api/mq/dead-letter");
  }

  async mq_mq_claim(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mq/claim", body);
  }

  async mq_mq_ack(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mq/ack", body);
  }

  async mq_mq_fail(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mq/fail", body);
  }

  async mq_mq_replay(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/mq/replay", body);
  }

  // ─── multi-region ───

  async multiRegion_multi_region_topology(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/multi-region/topology", body);
  }

  async multiRegion_multi_region_failover(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/multi-region/failover", body);
  }

  async multiRegion_multi_region_residency(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/multi-region/residency", body);
  }

  // ─── narrative ───

  async narrative_narrative_ceo_letter(): Promise<unknown> {
    return this.request("GET", "/api/narrative/ceo-letter");
  }

  async narrative_narrative_qbr(): Promise<unknown> {
    return this.request("GET", "/api/narrative/qbr");
  }

  async narrative_narrative_board(): Promise<unknown> {
    return this.request("GET", "/api/narrative/board");
  }

  // ─── notary ───

  async notary_notary_anchor(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/notary/anchor", body);
  }

  // ─── observability ───

  async observability_observability_metrics_export(): Promise<unknown> {
    return this.request("GET", "/api/observability/metrics-export");
  }

  async observability_observability_slos(): Promise<unknown> {
    return this.request("GET", "/api/observability/slos");
  }

  async observability_observability_health_deep(): Promise<unknown> {
    return this.request("GET", "/api/observability/health-deep");
  }

  // ─── offline ───

  async offline_offline_sync(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/offline/sync", body);
  }

  async offline_offline_health(): Promise<unknown> {
    return this.request("GET", "/api/offline/health");
  }

  // ─── oidc ───

  async oidc_oidc_start(): Promise<unknown> {
    return this.request("GET", "/api/oidc/start");
  }

  async oidc_oidc_callback(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/oidc/callback", body);
  }

  // ─── okr ───

  async okr_okr_sync(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/okr/sync", body);
  }

  async okr_okr_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/okr/dashboard");
  }

  // ─── onboarding ───

  async onboarding_onboarding_generate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/onboarding/generate", body);
  }

  async onboarding_onboarding_templates(): Promise<unknown> {
    return this.request("GET", "/api/onboarding/templates");
  }

  // ─── openapi ───

  async openapi_openapi_spec(): Promise<unknown> {
    return this.request("GET", "/api/openapi/spec");
  }

  // ─── optionality ───

  async optionality_optionality_value(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/optionality/value", body);
  }

  async optionality_optionality_portfolio(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/optionality/portfolio", body);
  }

  async optionality_optionality_frontier(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/optionality/frontier", body);
  }

  // ─── outcomes ───

  async outcomes_outcomes(): Promise<unknown> {
    return this.request("GET", "/api/outcomes");
  }

  async outcomes_outcomes(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/outcomes", body);
  }

  async outcomes_outcomes_refresh(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/outcomes/refresh", body);
  }

  async outcomes_outcomes_apply_calibration(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/outcomes/apply-calibration", body);
  }

  // ─── people ───

  async people_people_index(): Promise<unknown> {
    return this.request("GET", "/api/people/index");
  }

  async people_people_resolve(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/people/resolve", body);
  }

  // ─── plugins ───

  async plugins_plugins_register(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/plugins/register", body);
  }

  async plugins_plugins_list(): Promise<unknown> {
    return this.request("GET", "/api/plugins/list");
  }

  async plugins_plugins_capabilities(): Promise<unknown> {
    return this.request("GET", "/api/plugins/capabilities");
  }

  // ─── policy ───

  async policy_policy(): Promise<unknown> {
    return this.request("GET", "/api/policy");
  }

  async policy_policy_evaluate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/policy/evaluate", body);
  }

  async policy_policy_recalibrate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/policy/recalibrate", body);
  }

  async policy_policy_from_incident(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/policy/from-incident", body);
  }

  async policy_policy_approve(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/policy/approve", body);
  }

  async policy_policy_effectiveness(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/policy/effectiveness", body);
  }

  // ─── portfolio ───

  async portfolio_portfolio_optimize(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/portfolio/optimize", body);
  }

  // ─── privacy ───

  async privacy_privacy_consent(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/privacy/consent", body);
  }

  async privacy_privacy_check(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/privacy/check", body);
  }

  // ─── production ───

  async production_production_hardening_report(): Promise<unknown> {
    return this.request("GET", "/api/production/hardening-report");
  }

  async production_production_headers(): Promise<unknown> {
    return this.request("GET", "/api/production/headers");
  }

  // ─── pulse ───

  async pulse_pulse_generate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/pulse/generate", body);
  }

  async pulse_pulse_health(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/pulse/health", body);
  }

  async pulse_pulse_burnout_warning(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/pulse/burnout-warning", body);
  }

  // ─── readiness ───

  async readiness_readiness(): Promise<unknown> {
    return this.request("GET", "/api/readiness");
  }

  // ─── realtime ───

  async realtime_realtime_sse(): Promise<unknown> {
    return this.request("GET", "/api/realtime/sse");
  }

  async realtime_realtime_health(): Promise<unknown> {
    return this.request("GET", "/api/realtime/health");
  }

  async realtime_realtime_ws_health(): Promise<unknown> {
    return this.request("GET", "/api/realtime/ws-health");
  }

  async realtime_realtime_ws_broadcast(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/realtime/ws-broadcast", body);
  }

  // ─── regression ───

  async regression_regression_check(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/regression/check", body);
  }

  async regression_regression_gate(): Promise<unknown> {
    return this.request("GET", "/api/regression/gate");
  }

  // ─── regulatory ───

  async regulatory_regulatory_assess(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/regulatory/assess", body);
  }

  async regulatory_regulatory_horizon_scan(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/regulatory/horizon-scan", body);
  }

  async regulatory_regulatory_escalate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/regulatory/escalate", body);
  }

  // ─── resources ───

  async resources_resources_utilization(): Promise<unknown> {
    return this.request("GET", "/api/resources/utilization");
  }

  // ─── restore ───

  async restore_restore_drill(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/restore/drill", body);
  }

  // ─── retention ───

  async retention_retention_policy(): Promise<unknown> {
    return this.request("GET", "/api/retention/policy");
  }

  async retention_retention_hold(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/retention/hold", body);
  }

  async retention_retention_purge(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/retention/purge", body);
  }

  // ─── risk ───

  async risk_risk_assessment(): Promise<unknown> {
    return this.request("GET", "/api/risk/assessment");
  }

  async risk_risk_portfolio(): Promise<unknown> {
    return this.request("GET", "/api/risk/portfolio");
  }

  // ─── roadmap ───

  async roadmap_roadmap(): Promise<unknown> {
    return this.request("GET", "/api/roadmap");
  }

  // ─── safeguarding ───

  async safeguarding_safeguarding(): Promise<unknown> {
    return this.request("GET", "/api/safeguarding");
  }

  async safeguarding_safeguarding(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/safeguarding", body);
  }

  // ─── schema ───

  async schema_schema_compatibility(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/schema/compatibility", body);
  }

  async schema_schema_registry(): Promise<unknown> {
    return this.request("GET", "/api/schema/registry");
  }

  // ─── sdk ───

  async sdk_sdk_typescript(): Promise<unknown> {
    return this.request("GET", "/api/sdk/typescript");
  }

  async sdk_sdk_python(): Promise<unknown> {
    return this.request("GET", "/api/sdk/python");
  }

  // ─── secrets ───

  async secrets_secrets_due(): Promise<unknown> {
    return this.request("GET", "/api/secrets/due");
  }

  async secrets_secrets_rotate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/secrets/rotate", body);
  }

  // ─── security ───

  async security_security_threat_model(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/security/threat-model", body);
  }

  async security_security_threat_matrix(): Promise<unknown> {
    return this.request("GET", "/api/security/threat-matrix");
  }

  async security_security_field_encrypt(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/security/field-encrypt", body);
  }

  async security_security_field_decrypt(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/security/field-decrypt", body);
  }

  async security_security_field_audit(): Promise<unknown> {
    return this.request("GET", "/api/security/field-audit");
  }

  async security_security_secrets_audit(): Promise<unknown> {
    return this.request("GET", "/api/security/secrets-audit");
  }

  async security_security_secrets_report(): Promise<unknown> {
    return this.request("GET", "/api/security/secrets-report");
  }

  async security_security_dependency_scan(): Promise<unknown> {
    return this.request("GET", "/api/security/dependency-scan");
  }

  async security_security_posture(): Promise<unknown> {
    return this.request("GET", "/api/security/posture");
  }

  async security_security_calibration_gaming(): Promise<unknown> {
    return this.request("GET", "/api/security/calibration-gaming");
  }

  async security_security_integrity_full(): Promise<unknown> {
    return this.request("GET", "/api/security/integrity-full");
  }

  // ─── sentiment ───

  async sentiment_sentiment_text(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/sentiment/text", body);
  }

  async sentiment_sentiment_org_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/sentiment/org-dashboard");
  }

  // ─── signatures ───

  async signatures_signatures_sign(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/signatures/sign", body);
  }

  async signatures_signatures_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/signatures/verify", body);
  }

  // ─── sla ───

  async sla_sla(): Promise<unknown> {
    return this.request("GET", "/api/sla");
  }

  // ─── succession ───

  async succession_succession_simulate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/succession/simulate", body);
  }

  async succession_succession_bus_factors(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/succession/bus-factors", body);
  }

  // ─── system-twin ───

  async systemTwin_system_twin(): Promise<unknown> {
    return this.request("GET", "/api/system-twin");
  }

  async systemTwin_system_twin_what_if(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/system-twin/what-if", body);
  }

  // ─── talent-marketplace ───

  async talentMarketplace_talent_marketplace_rank(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/talent-marketplace/rank", body);
  }

  async talentMarketplace_talent_marketplace_succession(): Promise<unknown> {
    return this.request("GET", "/api/talent-marketplace/succession");
  }

  // ─── tax ───

  async tax_tax_corporate(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/tax/corporate", body);
  }

  async tax_tax_vat(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/tax/vat", body);
  }

  async tax_tax_calendar(): Promise<unknown> {
    return this.request("GET", "/api/tax/calendar");
  }

  // ─── tenant ───

  async tenant_tenant_verify_isolation(): Promise<unknown> {
    return this.request("GET", "/api/tenant/verify-isolation");
  }

  async tenant_tenant_export(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/tenant/export", body);
  }

  // ─── tracing ───

  async tracing_tracing_spans(): Promise<unknown> {
    return this.request("GET", "/api/tracing/spans");
  }

  async tracing_tracing_summary(): Promise<unknown> {
    return this.request("GET", "/api/tracing/summary");
  }

  async tracing_tracing_start(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/tracing/start", body);
  }

  async tracing_tracing_propagation_health(): Promise<unknown> {
    return this.request("GET", "/api/tracing/propagation-health");
  }

  // ─── trend ───

  async trend_trend(): Promise<unknown> {
    return this.request("GET", "/api/trend");
  }

  // ─── triage ───

  async triage_triage(): Promise<unknown> {
    return this.request("GET", "/api/triage");
  }

  async triage_triage_briefing(): Promise<unknown> {
    return this.request("GET", "/api/triage/briefing");
  }

  async triage_triage_signals(): Promise<unknown> {
    return this.request("GET", "/api/triage/signals");
  }

  // ─── trust ───

  async trust_trust_anchor(): Promise<unknown> {
    return this.request("GET", "/api/trust/anchor");
  }

  async trust_trust_anchor_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/trust/anchor/verify", body);
  }

  // ─── vendors ───

  async vendors_vendors_portfolio(): Promise<unknown> {
    return this.request("GET", "/api/vendors/portfolio");
  }

  // ─── wargaming ───

  async wargaming_wargaming_run(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/wargaming/run", body);
  }

  async wargaming_wargaming_tabletop(): Promise<unknown> {
    return this.request("GET", "/api/wargaming/tabletop");
  }

  // ─── watchdog ───

  async watchdog_watchdog_status(): Promise<unknown> {
    return this.request("GET", "/api/watchdog/status");
  }

  async watchdog_watchdog_attest(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/watchdog/attest", body);
  }

  async watchdog_watchdog_verify(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/watchdog/verify", body);
  }

  // ─── webhooks ───

  async webhooks_webhooks_slack(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/webhooks/slack", body);
  }

  async webhooks_webhooks_health(): Promise<unknown> {
    return this.request("GET", "/api/webhooks/health");
  }

  async webhooks_webhooks(): Promise<unknown> {
    return this.request("GET", "/api/webhooks");
  }

  async webhooks_webhooks(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/webhooks", body);
  }

  async webhooks_webhooks_dispatch(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/webhooks/dispatch", body);
  }

  // ─── workforce ───

  async workforce_workforce_headcount(): Promise<unknown> {
    return this.request("GET", "/api/workforce/headcount");
  }

  async workforce_workforce_skill_gaps(): Promise<unknown> {
    return this.request("GET", "/api/workforce/skill-gaps");
  }

  async workforce_workforce_dashboard(): Promise<unknown> {
    return this.request("GET", "/api/workforce/dashboard");
  }

  // ─── workspace ───

  async workspace_workspace(): Promise<unknown> {
    return this.request("GET", "/api/workspace");
  }

  async workspace_workspace(body: unknown): Promise<unknown> {
    return this.request("PUT", "/api/workspace", body);
  }

  async workspace_workspace_history(): Promise<unknown> {
    return this.request("GET", "/api/workspace/history");
  }

  async workspace_workspace_restore(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/workspace/restore", body);
  }

  // ─── worm ───

  async worm_worm(): Promise<unknown> {
    return this.request("GET", "/api/worm");
  }

  async worm_worm(body: unknown): Promise<unknown> {
    return this.request("POST", "/api/worm", body);
  }

}

// Usage:
// const client = new LeadershipOSClient({ baseUrl: "https://leadership.example.com", token: "your-api-token" });
// const health = await client.health_health();
// const integrity = await client.integrity_integrity();
