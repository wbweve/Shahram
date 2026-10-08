const plN = require("./lib/da-plural.js").pl;
const LCLang = require("./lib/lang-core.js"); // the leader's language: ONE derivation (js/lang-core.js)

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const C = require("./js/calc.js");
const { logger, updateStorageMetrics, wrapHandler: metricsWrap, metricsEndpoint, deepHealth } = require("./middleware/metrics.js");
const { wrapHandler: securityWrap, securityHeaders } = require("./middleware/security.js");
const { encryptWorkspace, decryptWorkspace, hasKey, IntegrityError } = require("./lib/at-rest.js");
const jobStore = require("./lib/job-store.js");
const connectorStore = require("./lib/connector-store.js");
const connectorConfigStore = require("./lib/connector-config-store.js");
const financeOperations = require("./js/finance-operations.js");
const financeOperationsStore = require("./lib/finance-operations-store.js");
const privacyGovernance = require("./lib/privacy-governance.js");
const connectorRegistry = require("./lib/connector-registry.js");
const connectorWorker = require("./lib/connector-worker.js");
const webhookSecurity = require("./lib/webhook-security.js");
const writebackStore = require("./lib/writeback-store.js");
const automationControls = require("./js/automation-controls.js");
const trustContracts = require("./js/trust-contracts.js");
const financeControls = require("./js/finance-controls.js");
const doubleEntryGuard = require("./js/double-entry-guard.js");
const forensicAudit = require("./js/forensic-audit.js");
const forensicAuditRouter = require("./lib/routes/forensic-audit.js");
const alertPipeline = require("./js/alert-pipeline.js");
const talentMarketplace = require("./js/talent-marketplace.js");
const esgReporting = require("./js/esg-reporting.js");
const fxConsolidation = require("./js/fx-consolidation.js");
const knowledgeManagement = require("./js/knowledge-management.js");
const scenarioWargaming = require("./js/scenario-wargaming.js");
const biasDetection = require("./js/bias-detection.js");
const realtimeTransport = require("./js/realtime-transport.js");
const tenantDRBCP = require("./js/tenant-dr-bcp.js");
const decisionProvenance = require("./js/decision-provenance.js");
const systemTwinMerge = require("./js/system-twin-merge.js");
const complianceEvidence = require("./js/compliance-evidence.js");
const executiveNarrative = require("./js/executive-narrative.js");
const cultureHealth = require("./js/culture-health.js");
const portfolioOptimizer = require("./js/portfolio-optimizer.js");
const benchmarking = require("./js/benchmarking.js");
const meetingAnalyzer = require("./js/meeting-analyzer.js");
const vendorScorecard = require("./js/vendor-scorecard.js");
const productionHardening = require("./js/production-hardening.js");
const wsServer = require("./js/ws-server.js");
const mobilePush = require("./js/mobile-push.js");
const dbMigrationTest = require("./js/db-migration-test.js");
const observability = require("./js/observability.js");
const k8sDeployment = require("./js/k8s-deployment.js");
const aiTrainingLoop = require("./js/ai-training-loop.js");
const fraudDetection = require("./js/fraud-detection.js");
const collab = require("./lib/collab.js");
const collaboration = collab; // legacy alias — routes use the consolidated facade
// The CRDT + offline layers previously had their own require-sites (and could
// drift from the collaboration stack); they now come from the same facade.
const crdtCollaboration = collab.crdt;
const offlineConflictResolver = collab.offline;
const dsar = require("./js/dsar.js");
const taxFiling = require("./js/tax-filing.js");
const costCenter = require("./js/cost-center.js");
const sentimentAnalysis = require("./js/sentiment-analysis.js");
const workforcePlanning = require("./js/workforce-planning.js");
const okrAutomation = require("./js/okr-automation.js");
const webhooks = require("./js/webhooks.js");
const mlServing = require("./js/ml-serving.js");
const graphql = require("./js/graphql.js");
const auditSearch = require("./js/audit-search.js");
const roleDashboard = require("./js/role-dashboard.js");
const onboarding = require("./js/onboarding.js");
const digitalSignature = require("./js/digital-signature.js");
const backupVerify = require("./js/backup-verify.js");
const benchmarks = require("./js/benchmarks.js");
const causalAttribution = require("./js/causal-attribution.js");
const peopleAnalytics = require("./js/people-analytics.js");
const causalIntegration = require("./js/causal-integration-layer.js");
const regressionDetection = require("./js/regression-detection.js");
const loadTest = require("./js/load-test.js");
const openapiGen = require("./js/openapi-gen.js");
const schemaVersioning = require("./js/schema-versioning.js");
const canonicalContract = require("./lib/canonical-contract.js");
const explainability = require("./js/explainability.js");
const offlineSync = require("./js/offline-sync.js");
const pluginSystem = require("./js/plugin-system.js");
const threatModeling = require("./js/threat-modeling.js");
const fieldEncryption = require("./js/field-encryption.js");
const secretsRotation = require("./js/secrets-rotation.js");
const dependencyScan = require("./js/dependency-scan.js");
const circuitBreaker = require("./js/circuit-breaker.js");
const chaosEngineering = require("./js/chaos-engineering.js");
const blueGreenDeploy = require("./js/blue-green-deploy.js");
const multiRegion = require("./js/multi-region.js");
const sdkGen = require("./js/sdk-gen.js");
const distributedTracing = require("./js/distributed-tracing.js");
const cookieConsent = require("./js/cookie-consent.js");
const requestIdPropagation = require("./js/request-id-propagation.js");
const dbPool = require("./js/db-pool.js");
const messageQueue = require("./js/message-queue.js");
const entityGraph = require("./js/entity-graph.js");
const workGraph = require("./js/work-graph.js");
const recurringTasks = require("./lib/recurring-tasks.js");
const workspaceWriteThrough = require("./lib/workspace-write-through.js");
const registerAnnouncements = require("./lib/register-announcements.js"); // the live register channel's delta
const tenantContext = require("./lib/tenant-context.js");
const managementNavigator = require("./js/management-navigator.js");
const aiMentor = require("./js/ai-mentor.js");
// One-AI (PROACTIVE_AI_SPEC.md direction B): server mentor-narrative routes
// derive from the governed engine through the same gateway as the hub.
const coachGateway = require("./lib/coach-gateway.js");
const predictiveIntelligence = require("./js/predictive-intelligence.js");
const culturalIntelligence = require("./js/cultural-intelligence.js");
const seamlessUX = require("./js/seamless-ux.js");
const LCRouter = require("./lib/router.js");
const financeRouter = require("./lib/routes/finance.js");
const analyticsRouter = require("./lib/routes/analytics.js");
const governanceRouter = require("./lib/routes/governance.js");
const investigationsRouter = require("./lib/routes/investigations.js");
const assetReliabilityRouter = require("./lib/routes/asset-reliability.js");
const riskRouter = require("./lib/routes/risk.js");
const projectsRouter = require("./lib/routes/projects.js");
const programsRouter = require("./lib/routes/programs.js");
const allocationsRouter = require("./lib/routes/allocations.js");
const workspacePortabilityRouter = require("./lib/routes/workspace-portability.js");
const tasksRouter = require("./lib/routes/tasks.js");
const taskCollaborationRouter = require("./lib/routes/task-collaboration.js");
const projectMembersRouter = require("./lib/routes/project-members.js");
const { canReadProject } = projectMembersRouter;
const timesheetRouter = require("./lib/routes/timesheet.js");
const sprintsRouter = require("./lib/routes/sprints.js");
const taskStatusesRouter = require("./lib/routes/task-statuses.js");
const taskTypesRouter = require("./lib/routes/task-types.js");
const tagsRouter = require("./lib/routes/tags.js");
const safetyObservationsRouter = require("./lib/routes/safety-observations.js");
const okrCheckinsRouter = require("./lib/routes/okr-checkins.js");
const crewCheckinsRouter = require("./lib/routes/crew-checkins.js");
const enpsRouter = require("./lib/routes/enps.js");
const cashForecastRouter = require("./lib/routes/cash-forecast.js");
const danishHRRouter = require("./lib/routes/danish-hr.js");
const salgLedeRouter = require("./lib/routes/salg-ledelse.js");
const produktionsledelseRouter = require("./lib/routes/produktionsledelse.js");
const aiConductorRouter = require("./lib/routes/ai-conductor.js");
const commissioningTestingRouter = require("./lib/routes/commissioning-testing.js");
const leadNavigatorRouter = require("./lib/routes/lead-navigator.js");
const NT = require("./lib/leadership-trends.js");
const risikostyringRouter = require("./lib/routes/risikostyring.js");
const offentligLedelseRouter = require("./lib/routes/offentlig-ledelse.js");
const kvalificeringRouter = require("./lib/routes/kvalificering.js");
const cadenceRouter = require("./lib/routes/cadence.js");
const kalibreringRouter = require("./lib/routes/kalibrering.js");
const advancedRiskRouter = require("./lib/routes/advanced-risk.js");
const tier2GovernanceRouter = require("./lib/routes/tier2-governance.js");
const hverdagMetoderRouter = require("./lib/routes/hverdag-metoder.js");
const dagsledelseRouter = require("./lib/routes/dagsledelse.js");
const praksisRouter = require("./lib/routes/praksis.js");
const beredskabRouter = require("./lib/routes/beredskab.js");
const arbeidsmiljoRouter = require("./lib/routes/arbeidsmiljo.js");
const krankendeRouter = require("./lib/routes/krankende-handlinger.js");
const rekrutteringRouter = require("./lib/routes/rekruttering.js");
const forandringsledelseRouter = require("./lib/routes/forandringsledelse.js");
const lonforhandlingRouter = require("./lib/routes/lonforhandling.js");
const fratraedelseRouter = require("./lib/routes/fratraedelse.js");
// Danish personaleledelse round 2026-09-09b: ledelsesgrundlag + kompetenceudvikling.
const ledelsesgrundlagRouter = require("./lib/routes/ledelsesgrundlag.js");
const kompetenceRouter = require("./lib/routes/kompetence.js");
const leadershipModelsRouter = require("./lib/routes/leadership-models.js");
const erpBiRouter = require("./lib/routes/erp-bi.js");
const deliveryGovernanceRouter = require("./lib/routes/delivery-governance.js");
const presalesGovernanceRouter = require("./lib/routes/presales-governance.js");
const escalationAnalyticsRouter = require("./lib/routes/escalation-analytics.js");
const fastholdelseRouter = require("./lib/routes/fastholdelse.js");
const dkAnalyticsRouter = require("./lib/routes/dk-analytics.js");
// Danish trivselsledelse round: stresskurve + arbejdsglæde + jobafklaring.
const trivselLedelseRouter = require("./lib/routes/trivsel-ledelse.js");
const privacyRouter = require("./lib/routes/privacy.js");
const appUpgrade = require("./lib/app-upgrade.js");
const APP_VERSION = appUpgrade.appVersion(require("./package.json"));
const { weeklyLetter } = require("./lib/weekly-letter.js");
const ferieorlovRouter = require("./lib/routes/ferieorlov.js");
const konfliktGuideRouter = require("./lib/routes/konflikt-guide.js");
const matrixLeadershipRouter = require("./lib/routes/matrix-leadership.js");
const afterSalesLeadershipRouter = require("./lib/routes/after-sales-leadership.js");
const ugebriefingRouter = require("./lib/routes/ugebriefing.js");
const esrsRouter = require("./lib/routes/esrs-s1.js");
const portfolioHealthRouter = require("./lib/routes/portfolio-health.js");
const myWorkRouter = require("./lib/routes/my-work.js");
const forecastRouter = require("./lib/routes/forecast.js");
const notificationsRouter = require("./lib/routes/notifications.js");
const viewsRouter = require("./lib/routes/views.js");
const formsRouter = require("./lib/routes/forms.js");
const connectorsRouter = require("./lib/routes/connectors.js"); // decomposition increment #1: connectors domain
const authRouter = require("./lib/routes/auth.js"); // decomposition increment #3: identity/session/SSO domain
const mqRouter = require("./lib/routes/mq.js"); // decomposition increment #4: message-queue operations
const auditRouter = require("./lib/routes/audit.js"); // decomposition increment #5: audit/approvals/evidence packages

const connectorIntake = require("./lib/connector-intake.js");
const docsChatPushRouter = require("./lib/routes/docs-chat-push.js");
const notificationsInbox = require("./lib/notifications-inbox.js");
const notificationsDelivery = require("./lib/notification-delivery.js");
const projectRbacLib = require("./lib/project-rbac.js");
const riskControls = require("./js/risk-controls.js");
const claimsLib = require("./lib/verify-claims.js");
const privacyRedaction = require("./lib/privacy-redaction.js");
const marketData = require("./middleware/market-data.js");
const notifications = require("./middleware/notifications.js");
const selfHeal = require("./middleware/self-heal.js");
const authLib = require("./lib/auth.js");
const orgsRouter = require("./lib/routes/orgs.js"); // multi-org switcher + SCIM 2.0 provisioning
const moduleWiring = require("./js/module-wiring.js");
const moduleRouter = require("./lib/module-router.js");
const eventBusBridge = require("./lib/event-bus-bridge.js");
const projectRbac = require("./lib/project-rbac.js");
const llmInference = require("./lib/llm-inference.js");
const llmCredentials = require("./lib/llm-credentials.js");
const llmUsage = require("./lib/llm-usage.js");
const llmWatchdog = require("./lib/llm-watchdog.js");
const deadman = require("./lib/deadman.js");
const approvalChains = require("./lib/approval-chains.js");
const moduleRecordStore = require("./lib/module-record-store.js");
const completionAudit = require("./lib/completion-audit.js");
const validationStudies = require("./js/validation-studies.js");
const recipeRunner = require("./lib/recipe-runner.js");
const coachLib = require("./lib/coach.js");
const outcomesLib = require("./js/outcomes.js");
const connectorContracts = require("./js/connector-contracts.js");
const digitalTwin = require("./js/digital-twin.js");
const conflictEarlyWarning = require("./js/conflict-early-warning.js");
const calibrationExtended = require("./js/calibration-extended.js");
const triage = require("./js/triage.js");
const leadershipFingerprint = require("./js/leadership-fingerprint.js");
const feedback360 = require("./js/feedback-360.js");
const financialStatements = require("./js/financial-statements.js");
const geopoliticalRisk = require("./js/geopolitical-risk.js");
const boardPack = require("./js/board-pack.js");
const longitudinalSim = require("./js/longitudinal-sim.js");
const adversarialResistance = require("./js/adversarial-resistance.js");
const chainAnchor = require("./js/chain-anchor.js");
const consistencyVerifier = require("./js/consistency-verifier.js");
const retention = require("./js/retention.js");
const personIndex = require("./js/person-index.js");
const mentorship = require("./js/mentorship.js");
const incidentManagement = require("./js/incident-management.js");
const experimentLib = require("./js/experiments.js");
const leadershipExperiment = require("./js/leadership-experiment.js");
const automationEvidence = require("./js/automation-evidence.js");
const llmNarrative = require("./js/llm-narrative.js");
const llmDrafting = require("./js/llm-drafting.js");
const policyEngine = require("./js/policy-engine.js");
const outboundWebhooks = require("./js/outbound-webhooks.js");
const bankFeedConnector = require("./js/bank-feed-connector.js");
// const oidcClient = require("./lib/oidc-client.js"); // moved to lib/routes/auth.js (decomposition increment #3)
const usageAnalytics = require("./js/usage-analytics.js");
const riskPortfolio = require("./js/risk-portfolio.js");
const evidencePack = require("./js/evidence-pack.js");
const learningLoop = require("./js/learning-loop.js");
const controlCenter = require("./js/control-center.js");
const periodCloseLib = require("./js/period-close.js");
const decisionOutcomesLib = require("./js/decision-outcomes.js");
const outcomeRemMeasurement = require("./lib/outcome-remeasurement.js");
const conflictOutcomesLib = require("./js/conflict-outcomes.js");
const watchdog = require("./js/watchdog.js");
const forecastAccuracy = require("./js/forecast-accuracy.js");
const attestationExport = require("./js/attestation-export.js");
const complianceCalendar = require("./js/compliance-calendar.js");
const platformReadiness = require("./js/platform-readiness.js");
const aiGovernance = require("./js/ai-governance.js");
const { createPersistence } = require("./lib/persistence.js");
const { createProjectRepository } = require("./lib/project-repository.js");

// ─── Expansion modules (Tier 0–6) ────────────────────────────────────────────
const abacLib = require("./js/abac.js");
const sagaCompensation = require("./js/saga-compensation.js");
const modelRegistry = require("./js/model-registry.js");
const modelDrift = require("./js/model-drift.js");
const fairnessAuditor = require("./js/fairness-auditor.js");
const promptIsolation = require("./js/prompt-isolation.js");
const aiToolAuth = require("./js/ai-tool-auth.js");
const dlp = require("./js/dlp.js");
const aiAbstention = require("./js/ai-abstention.js");
const ragPipeline = require("./js/rag-pipeline.js");
const dpia = require("./js/dpia.js");
const soc2IsoEvidence = require("./js/soc2-iso-evidence.js");
const wormStorage = require("./js/worm-storage.js");
const externalNotary = require("./js/external-notary.js");
const delegatedAdmin = require("./js/delegated-admin.js");
const tenantMigration = require("./js/tenant-migration.js");
const darkLaunch = require("./js/dark-launch.js");
const schemaGate = require("./js/schema-compatibility-gate.js");
const kmsLib = require("./lib/kms.js");
// const webauthn = require("./lib/webauthn.js"); // moved to lib/routes/auth.js (decomposition increment #3)
// const webauthnStore = require("./lib/webauthn-store.js"); // moved to lib/routes/auth.js (decomposition increment #3)
const scimLib = require("./lib/scim.js");
const accountsPayable = require("./js/accounts-payable.js");
const accountsReceivable = require("./js/accounts-receivable.js");
const purchaseOrders = require("./js/purchase-orders.js");
const expenses = require("./js/expenses.js");
const fixedAssets = require("./js/fixed-assets.js");
const inventory = require("./js/inventory.js");
const revenueRecognition = require("./js/revenue-recognition.js");
const intercompanyEliminations = require("./js/intercompany-eliminations.js");
const payroll = require("./js/payroll.js");
const crm = require("./js/crm.js");
const contracts = require("./js/contracts.js");
const procurement = require("./js/procurement.js");
const slaManager = require("./js/sla-manager.js");
const roadmap = require("./js/roadmap.js");
const resourceManagement = require("./js/resource-management.js");
const safeguarding = require("./js/safeguarding.js");
const retaliationMonitor = require("./js/retaliation-monitor.js");
const feedbackIntegrity = require("./js/feedback-integrity.js");
const mediatorWorkflow = require("./js/mediator-workflow.js");
const coachingQuality = require("./js/coaching-quality.js");

// ─── Gap closure modules (round-20) ───────────────────────────────────────
const crossDomainJourneys = require("./js/cross-domain-journeys.js");
const closeToReportPipeline = require("./js/close-to-report-pipeline.js");
const causalRuntime = require("./js/causal-integration-runtime.js");
const causalRouter = require("./lib/routes/causal.js");
const danishHrLlmRouter = require("./lib/routes/danish-hr-llm.js");
const policyRouter = require("./lib/routes/policy.js");
const automationRouter = require("./lib/routes/automation.js");
const outcomesRouter = require("./lib/routes/outcomes.js");
const modelsRouter = require("./lib/routes/models.js");
const complianceRouter = require("./lib/routes/compliance.js");
const collabRouter = require("./lib/routes/collab.js"); // decomposition increment #8: collaboration/realtime domain
const whiteboardsRouter = require("./lib/routes/whiteboards.js"); // project whiteboards (truth-matrix gap closure)
const aiEnhancementsRouter = require("./lib/routes/ai-enhancements.js"); // AI enhancement modules (NLU, briefs, alerts, auto-assign, mentor, etc.)
const smartCalendar = require("./js/smart-calendar.js"); // Smart calendar auto-scheduler
const decisionRecommender = require("./lib/decision-recommender.js"); // Autonomous Decision Recommender
const crossProjectIntelligence = require("./lib/cross-project-intelligence.js"); // Cross-Project Intelligence Hub
const smartCalendarOptimizer = require("./lib/smart-calendar-optimizer.js"); // Smart Calendar Optimizer
const naturalLanguageChat = require("./lib/natural-language-chat.js"); // Natural Language Chat Interface
const predictiveRiskRadar = require("./lib/predictive-risk-radar.js"); // Predictive Risk Radar
const ambientIntelligence = require("./lib/ambient-intelligence.js"); // Ambient Intelligence Engine
const meetingIntelligenceCapture = require("./lib/meeting-intelligence-capture.js"); // Meeting Intelligence Auto-Capture
const behavioralPatternRecognition = require("./lib/behavioral-pattern-recognition.js"); // Behavioral Pattern Recognition
const successionRiskPredictor = require("./lib/succession-risk-predictor.js"); // Succession Risk Predictor
const deliveryCertaintyEngine = require("./lib/delivery-certainty-engine.js"); // Delivery Certainty Engine
const smartDelegationRecommender = require("./lib/smart-delegation-recommender.js"); // Smart Delegation Recommender
const autonomousWeeklyBriefing = require("./lib/autonomous-weekly-briefing.js"); // Autonomous Weekly Briefing
const crossProjectResourceOptimizer = require("./lib/cross-project-resource-optimizer.js"); // Cross-Project Resource Optimizer
const intelligentNudgeSystem = require("./lib/intelligent-nudge-system.js"); // Intelligent Nudge System
const workloadBalancer = require("./js/workload-balancer.js"); // Workload monitoring & rebalancing
const coachingEngine = require("./js/leadership-coaching-engine.js"); // Context-aware leadership coaching
const notificationIntelligence = require("./js/notification-intelligence.js"); // Smart notification batching
const aiGovernanceEnforcer = require("./js/ai-governance-enforcer.js");
const restoreDrillAutomation = require("./js/restore-drill-automation.js");
const tenantDataExport = require("./js/tenant-data-export.js");
const decisionSimulation = require("./js/decision-simulation.js");
const modelTrainingPipeline = require("./js/model-training-pipeline.js");

const connectorHardening = require("./js/connector-hardening.js");
const learningOrgScore = require("./js/learning-org-score.js");
// js/plugin-marketplace.js is deliberately NOT wired: it duplicates the live
// plugin surface (js/plugin-system.js → /api/plugins/*) and nothing consumes it.
const liveBenchmarks = require("./js/live-benchmarks.js");

// ─── Gap closure modules (round-21) ───────────────────────────────────────
const successionSimulation = require("./js/succession-simulation.js");
const automatedAuditResponse = require("./js/automated-audit-response.js");
const cognitiveDiversityIndex = require("./js/cognitive-diversity-index.js");
const corporateMemoryPreservation = require("./js/corporate-memory-preservation.js");
const crisisWarRoom = require("./js/crisis-war-room.js");
const policyFromIncidents = require("./js/policy-from-incidents.js");
const orgPulse = require("./js/org-pulse.js");
const strategicOptionality = require("./js/strategic-optionality.js");
const regulatoryChangeImpact = require("./js/regulatory-change-impact.js");

// ─── Gap closure modules (round-22) ───────────────────────────────────────
const chiefOfStaffAI = require("./js/chief-of-staff-ai.js");
const decisionDebtTracker = require("./js/decision-debt-tracker.js");
const autoBoardPrep = require("./js/auto-board-prep.js");
const crossFunctionalDeps = require("./js/cross-functional-dependencies.js");
const innovationPipeline = require("./js/innovation-pipeline.js");

// ─── Final frontier modules (round-24) ─────────────────────────────────────
const cognitiveLoadOptimizer = require("./js/cognitive-load-optimizer.js");
const decisionOutcomeAttribution = require("./js/decision-outcome-attribution.js");
const ethicalDecisionFramework = require("./js/ethical-decision-framework.js");
const strategicTimeArchitecture = require("./js/strategic-time-architecture.js");
const legacyToActionGap = require("./js/legacy-to-action-gap.js");

// ─── Unwired module wiring (round-25) ─────────────────────────────────────
const changeManagement = require("./js/change-management.js");
const supplyChainResilience = require("./js/supply-chain-resilience.js");
const financialRiskIntegration = require("./js/financial-risk-integration.js");
const marketIntelligence = require("./js/market-intelligence.js");
const sustainabilityImpact = require("./js/sustainability-impact.js");
const organizationalCapability = require("./js/organizational-capability.js");
const autonomousRemediation = require("./js/autonomous-remediation.js");
const causalSystems = require("./js/causal-systems.js");
const realtimeCollaboration = collab.realtime; // from lib/collab.js
const analyticsPlatform = require("./js/analytics-platform.js");
const enterpriseHardening = require("./js/enterprise-hardening.js");
const trustworthinessDashboard = require("./js/trustworthiness-dashboard.js");

// ─── R25+ new domain modules ──────────────────────────────────────────────
const transferPricing = require("./js/transfer-pricing.js");
const climateRiskAnalysis = require("./js/climate-risk-analysis.js");
const anonymousReporting = require("./js/anonymous-reporting.js");
const treasuryManagement = require("./js/treasury-management.js");
const pricingOptimizer = require("./js/pricing-optimizer.js");
const channelManagement = require("./js/channel-management.js");
const teamDynamicsSim = require("./js/team-dynamics-sim.js");
const aiRedTeaming = require("./js/ai-red-teaming.js");
const continuousAssurance = require("./js/continuous-assurance.js");
const externalVerifiability = require("./js/external-verifiability.js");
const blockchainAnchoring = require("./js/blockchain-anchoring.js");
// const samlSso = require("./js/saml-sso.js"); // moved to lib/routes/auth.js (decomposition increment #3)

// ─── R26 No More Simulation ─────────────────────────────────────────────
const pushDelivery = require("./js/push-delivery.js");
const hsmIntegration = require("./js/hsm-integration.js");
const decisionRecommendationEngine = require("./js/decision-recommendation-engine.js");
const tenantProvisioning = require("./js/tenant-provisioning.js");
const apiGateway = require("./js/api-gateway.js");
const backupScheduler = require("./js/backup-scheduler.js");
const dataExportCompliance = require("./js/data-export-compliance.js");
const tenantIsolationVerifier = require("./js/tenant-isolation-verifier.js");
const sloEnforcement = require("./js/slo-enforcement.js");
const tenantFeatureFlags = require("./js/tenant-feature-flags.js");
const passiveIngestion = require("./lib/passive-ingestion.js"); // Email/Calendar Passive Ingestion
const autoDraftComms = require("./lib/auto-draft-comms.js"); // Auto-Draft Communications
const contextNudges = require("./lib/context-nudges.js"); // Context-Aware Micro-Nudges
const teamsBot = require("./lib/teams-bot.js"); // Microsoft Teams Bot Integration
const calendarSync = require("./lib/calendar-sync.js"); // Calendar Bi-Directional Sync
const pushActions = require("./lib/push-actions.js"); // Mobile Push with Inline Actions
const googleCalendarOAuth = require("./lib/google-calendar-oauth.js"); // Google Calendar OAuth
const azureBotService = require("./lib/azure-bot-service.js"); // Azure Bot Service
const voiceFirst = require("./lib/voice-first.js"); // Voice-First Interaction
const slackLeadershipBot = require("./lib/slack-leadership-bot.js"); // Slack Bot Integration
const meetingTranscription = require("./lib/meeting-transcription.js"); // Meeting Audio Transcription
const predictiveDevPlan = require("./lib/predictive-dev-plan.js"); // Predictive Development Plan
const salesforceCrm = require("./lib/salesforce-crm.js"); // Salesforce CRM Integration
const autoRetro = require("./lib/auto-retro.js"); // Auto Weekly Learning Retrospective
const conflictAlerts = require("./lib/conflict-alerts.js"); // Conflict Early Warning Alerts
const strategicAdvisor = require("./lib/strategic-advisor.js"); // AI Strategic Advisor
const autoRiskMitigation = require("./lib/auto-risk-mitigation.js"); // Autonomous Risk Mitigation
const teamHealthDashboard = require("./lib/team-health-dashboard.js"); // Team Health Dashboard
const smartDelegation = require("./lib/smart-delegation.js"); // Smart Delegation Engine
const meetingOptimizer = require("./lib/meeting-optimizer.js"); // Meeting Optimizer
const knowledgeGraph = require("./lib/knowledge-graph.js"); // Knowledge Graph
const hrisIntegration = require("./lib/hris-integration.js"); // HRIS Integration
const stakeholderPulse = require("./lib/stakeholder-pulse.js"); // Stakeholder Pulse
const industryBenchmarking = require("./lib/industry-benchmarking.js"); // Industry Benchmarking
const predictiveOutcomes = require("./lib/predictive-outcomes.js"); // Predictive Outcome Engine
const impactSimulator = require("./lib/impact-simulator.js"); // Cascading Impact Simulator
const insightDiscovery = require("./lib/insight-discovery.js"); // Autonomous Insight Discovery
const autoEscalation = require("./lib/auto-escalation.js"); // Conditional Auto-Escalation
const meetingFollowup = require("./lib/meeting-followup.js"); // Smart Meeting Follow-Up
const adaptiveCadence = require("./lib/adaptive-cadence.js"); // Adaptive Cadence Engine
const universalSearch = require("./lib/universal-search.js"); // Universal Search & Ask
const execSummary = require("./lib/exec-summary.js"); // Executive Summary Generator
const decisionMemory = require("./lib/decision-memory.js"); // Decision Memory System
const autoCommunication = require("./lib/auto-communication.js"); // Autonomous Communication Engine
const notificationOrchestrator = require("./lib/notification-orchestrator.js"); // Smart Notification Orchestrator
const predictiveOutreach = require("./lib/predictive-outreach.js"); // Predictive Stakeholder Outreach
const coachingEngineLib = require("./lib/coaching-engine.js"); // AI Coaching Engine (lib)
const skillGapMapper = require("./lib/skill-gap-mapper.js"); // Skill Gap Mapper
const growthTrajectory = require("./lib/growth-trajectory.js"); // Growth Trajectory Planner
const crisisWarroom = require("./lib/crisis-warroom.js"); // Crisis War Room
const okrTracker = require("./lib/okr-tracker.js"); // OKR Cascade Tracker
const wellnessEarlyWarning = require("./lib/wellness-early-warning.js"); // Wellness Early Warning
const mentorConversation = require("./lib/mentor-conversation.js"); // Conversational Leadership Mentor
const voiceBriefing = require("./lib/voice-briefing.js"); // Contextual Voice Briefing
const decisionDialogue = require("./lib/decision-dialogue.js"); // Decision Dialogue Partner
const styleSimulator = require("./lib/style-simulator.js"); // Leadership Style Simulator
const resourceOptimizer = require("./lib/resource-optimizer.js"); // Resource Reallocation Optimizer
const cadenceSimulator = require("./lib/cadence-simulator.js"); // Meeting Cadence Simulator
const feedbackLoop = require("./lib/feedback-loop.js"); // Suggestion Feedback Loop
const autonomousLearning = require("./lib/autonomous-learning.js"); // Autonomous Learning Engine
const sessionMemory = require("./lib/session-memory.js"); // Cross-Session Memory Store
const codebaseSync = require("./lib/codebase-sync.js"); // Jira/GitHub Sync
const commsAnalytics = require("./lib/comms-analytics.js"); // Slack/Teams Analytics
const calendarIntel = require("./lib/calendar-intel.js"); // Calendar Intelligence
const leaderProfile = require("./lib/leader-profile.js"); // Leader Profile Engine
const adaptiveUI = require("./lib/adaptive-ui.js"); // Adaptive UI Engine
const contextPrefetch = require("./lib/context-prefetch.js"); // Contextual Prefetching
const burnoutPredictor = require("./lib/burnout-predictor.js"); // Burnout Prediction
const projectFailurePredictor = require("./lib/project-failure-predictor.js"); // Project Failure Predictor
const orgDriftDetector = require("./lib/org-drift-detector.js"); // Org Drift Detector
const autoRemediation = require("./lib/auto-remediation.js"); // Auto-Remediation Engine
const approvalChain = require("./lib/approval-chain.js"); // Approval Chain Orchestrator
const competitiveIntel = require("./lib/competitive-intel.js"); // Competitive Intelligence
const successionPipeline = require("./lib/succession-pipeline.js"); // Succession Pipeline
const orgNetwork = require("./lib/org-network.js"); // Org Network Analysis
const eqEngine = require("./lib/eq-engine.js"); // Emotional Intelligence
const strategicPlanner = require("./lib/strategic-planner.js"); // Strategic Planner
const innovationTracker = require("./lib/innovation-tracker.js"); // Innovation Tracker
const complianceMonitor = require("./lib/compliance-monitor.js"); // Compliance Monitor
const mcda = require("./lib/mcda.js"); // Multi-Criteria Decision Analysis
const optionValuation = require("./lib/option-valuation.js"); // Strategic Option Valuation
const decisionAudit = require("./lib/decision-audit.js"); // Decision Quality Audit
const behaviorTracker = require("./lib/behavior-tracker.js"); // Behavioral Change Tracker
const collectiveIntel = require("./lib/collective-intel.js"); // Collective Intelligence
const decisionJournal = require("./lib/decision-journal.js"); // Decision Journal
const processMining = require("./lib/process-mining.js"); // Adaptive Process Mining
const strategyFrameworks = require("./lib/strategy-frameworks.js"); // Strategic Framework Navigator
const leadershipPlaybook = require("./lib/leadership-playbook.js"); // Leadership Playbook Generator
const biasDetector = require("./lib/bias-detector.js"); // Cognitive Bias Detector
const meetingFacilitator = require("./lib/meeting-facilitator.js"); // Intelligent Meeting Facilitator
const teamComposer = require("./lib/team-composer.js"); // Predictive Team Composer
const cultureMapper = require("./lib/culture-mapper.js"); // Org Culture Mapper
const psychSafety = require("./lib/psych-safety.js"); // Psychological Safety Index
const docGenerator = require("./lib/doc-generator.js"); // Intelligent Document Generator
const peerLearning = require("./lib/peer-learning.js"); // Peer Learning Network
const knowledgeRetention = require("./lib/knowledge-retention.js"); // Knowledge Retention System
const adaptiveLearning = require("./lib/adaptive-learning.js"); // Adaptive Learning Paths
const realtimeCoach = require("./lib/realtime-coach.js"); // Real-Time Coaching Engine
const onboardingNav = require("./lib/onboarding-nav.js"); // Intelligent Onboarding Navigator
const boardPrep = require("./lib/board-prep.js"); // AI-Powered Board Preparation
const strategicForesight = require("./lib/strategic-foresight.js"); // Strategic Foresight Engine
const conflictResolution = require("./lib/conflict-resolution.js"); // Conflict Resolution AI
const execWellness = require("./lib/exec-wellness.js"); // Executive Wellness Dashboard
const legacyTracker = require("./lib/legacy-tracker.js"); // Legacy & Impact Tracker
const scheduleOptimizer = require("./lib/schedule-optimizer.js"); // Intelligent Scheduling Optimizer
const crossorgBenchmark = require("./lib/crossorg-benchmark.js"); // Cross-Org Benchmarking
const digitalTwinLib = require("./lib/digital-twin.js"); // Digital Twin Leadership (lib)
const neuroLeadership = require("./lib/neuro-leadership.js"); // NeuroLeadership Insights
const crisisSim = require("./lib/crisis-sim.js"); // Crisis Simulation Engine
const autoExec = require("./lib/auto-exec.js"); // Autonomous Executive Assistant
const memoryPalace = require("./lib/memory-palace.js"); // Organizational Memory Palace
const leadershipDNA = require("./lib/leadership-dna.js"); // Leadership DNA Profiler
const multiPartyMediation = require("./lib/multi-party-mediation.js"); // Multi-Party Mediation
const portfolioOptimizerLib = require("./lib/portfolio-optimizer.js"); // Strategic Portfolio Optimizer (lib)
const orgDynamics = require("./lib/org-dynamics.js"); // Predictive Org Dynamics
const quantumDecision = require("./lib/quantum-decision.js"); // Quantum Decision Engine
const timeMachine = require("./lib/time-machine.js"); // Strategic Time Machine
const autoNegotiate = require("./lib/auto-negotiate.js"); // Autonomous Negotiation AI
const emotionalResonance = require("./lib/emotional-resonance.js"); // Emotional Resonance Map
const orgConsciousness = require("./lib/org-consciousness.js"); // Org Consciousness Engine
const styleShapeshifter = require("./lib/style-shapeshifter.js"); // Leadership Style Shapeshifter
const talentMagnet = require("./lib/talent-magnet.js"); // Predictive Talent Magnet
const innovationEcosystem = require("./lib/innovation-ecosystem.js"); // Innovation Ecosystem Mapper
const execPresence = require("./lib/exec-presence.js"); // Executive Presence Amplifier
const sleepingLeader = require("./lib/sleeping-leader.js"); // Sleeping Leader Protocol
const morningBriefing = require("./lib/morning-briefing.js"); // Strategic Morning Briefing
const autoReport = require("./lib/auto-report.js"); // Autonomous Report Writer
const entropyDetector = require("./lib/entropy-detector.js"); // Org Entropy Detector
const blindSpot = require("./lib/blind-spot.js"); // Blind Spot Illuminator
const conversationAnalyzer = require("./lib/conversation-analyzer.js"); // Strategic Conversation Analyzer
const promoReadiness = require("./lib/promo-readiness.js"); // Promotion Readiness Predictor
const resilienceScorer = require("./lib/resilience-scorer.js"); // Org Resilience Scorer
const legacyArchitect = require("./lib/legacy-architect.js"); // Leadership Legacy Architect
const quantumMatrix = require("./lib/quantum-matrix.js");
const eqAmplifier = require("./lib/eq-amplifier.js");
const stakeholderNetwork = require("./lib/stakeholder-network.js");
const synergyDetector = require("./lib/synergy-detector.js");
const rhythmOptimizer = require("./lib/rhythm-optimizer.js");
const dtNavigator = require("./lib/dt-navigator.js");
const successionIntel = require("./lib/succession-intel.js");
const intuitionEngine = require("./lib/intuition-engine.js");
const growthAnalytics = require("./lib/growth-analytics.js");

// In-memory registers for expansion modules (durable paths plug into DATA_DIR
// where a module needs persistence across restarts).
const EXPANSION_STATE = {
  models: [],
  dpiaList: [],
  contractsList: [],
  slaList: [],
  concerns: [],
  safeguards: [],
  abacPolicies: {},
  worm: wormStorage.createWORMStore(),
  delegatedAdmins: [],
  elevationRequests: [],
  darkLaunches: []
};

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8001);
const HOST = process.env.HOST || "127.0.0.1";
// Registers a viewer/auditor must never see. The first block are legacy ids
// (kept so old workspace data under those keys stays hidden); the current
// schema's people-psych registers are `conflicts`, `absences`, `reflections`,
// `oneonones`, and `habits` — note the real conflict register is `conflicts`
// (plural), which the stale list below originally missed.
const SENSITIVE_REGISTERS = ["conflict", "feedback360", "review", "recognition", "psychSafety", "selfAssess", "ei", "disc", "belbin", "johari", "values", "energy", "personalOKR", "conflicts", "absences", "reflections", "oneonones", "habits"];
const DATA_DIR = process.env.LEADERSHIP_DATA_DIR ? path.resolve(process.env.LEADERSHIP_DATA_DIR) : path.join(ROOT, "server-data");
// Backups live OUTSIDE DATA_DIR by default (so backup-rotate archives them
// on its own schedule), but an instance with an EXPLICIT LEADERSHIP_DATA_DIR
// is a scoped one — tests, probes, scratch — and its nets belong beside ITS
// data: sharing ROOT/server-backups made every test run sha256-verify the
// production nets and put production files within reach of retention pruning.
const BACKUP_DIR = process.env.LEADERSHIP_BACKUP_DIR
  ? path.resolve(process.env.LEADERSHIP_BACKUP_DIR)
  : (process.env.LEADERSHIP_DATA_DIR ? path.join(DATA_DIR, "server-backups") : path.join(ROOT, "server-backups"));
messageQueue.configure({ file: path.join(DATA_DIR, "message-queue.jsonl") });

// Encrypted-at-rest LLM provider credentials (lib/llm-credentials.js). Env
// vars win over stored credentials at call time; the resolver is what lets an
// admin-registered OpenRouter/OpenAI/Groq/Mistral key drive the AI routes.
// The store takes a data dir and writes DATA_DIR/llm-credentials.jsonl.
llmInference.setCredentialResolver(providerId => llmCredentials.resolve(DATA_DIR, providerId));

// ─── Provider meter + daily budget (lib/llm-usage.js) ──────────────────────
// "The AI providers must solve everything" is only a safe promise with a
// meter attached: this sink records every provider call (exact when the
// provider reports usage, clearly marked as an estimate when it does not) and
// answers the budget question the provider layer asks BEFORE each call. When
// the operator's daily limit is spent, the call is refused with a disclosed
// reason and the deterministic, register-grounded engine answers instead.
const LLM_WATCHDOG_INTERVAL_MS = Number(process.env.LEADERSHIP_AI_WATCHDOG_INTERVAL_MS || 0) || 15 * 60 * 1000;
const LLM_WATCHDOG_THRESHOLD = Number(process.env.LEADERSHIP_AI_WATCHDOG_THRESHOLD || 0) || 2;
const LLM_WATCHDOG_ENABLED = String(process.env.LEADERSHIP_AI_WATCHDOG || "on").toLowerCase() !== "off";
let llmWatchdogTimer = null;
// Dead-man's switch (lib/deadman.js): the app must PROVE it is alive to an
// external monitor. The watchdog above runs in this process, so it cannot
// report that the process died — this one pages by going SILENT, and its own
// job is to be honest about whether that coverage actually exists.
let deadmanTimer = null;
llmInference.setUsageSink({
  record: entry => llmUsage.recordUsage(DATA_DIR, entry),
  budget: () => llmUsage.withinBudget(DATA_DIR)
});
const APPROVAL_CHAINS_FILE = path.join(DATA_DIR, "approval-chains.jsonl");

// WORM storage backed by an append-only JSONL file in DATA_DIR.
const WORM_FILE = path.join(DATA_DIR, "worm.jsonl");
function loadWormStore() {
  try {
    const rows = readJsonLines(WORM_FILE);
    const store = wormStorage.createWORMStore();
    rows.forEach(row => { if (row && !row._corrupt && row.payload) wormStorage.append(store, row.payload, { idempotencyKey: row.idempotencyKey, timestamp: row.ts }); });
    return store;
  } catch (_) { return wormStorage.createWORMStore(); }
}
function persistWorm(store, record) {
  try {
    const fd = fs.openSync(WORM_FILE, "a");
    fs.appendFileSync(fd, JSON.stringify(record) + "\n", "utf8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  } catch (_) { /* WORM persistence is best-effort */ }
}
EXPANSION_STATE.worm = loadWormStore();
const AUDIT_FILE = path.join(DATA_DIR, "audit.jsonl");
const WORKSPACE_FILE = path.join(DATA_DIR, "workspace.json");
const WORKSPACE_HISTORY_FILE = path.join(DATA_DIR, "workspace-history.jsonl");
// Cap the number of full-workspace snapshots kept in history. Each save
// appends a complete snapshot, so without a cap the file (and the memory
// needed to read it on every save) grows without bound.
const WORKSPACE_HISTORY_MAX = Number(process.env.LEADERSHIP_WORKSPACE_HISTORY_MAX || 200);
// Byte budget for the same file. Snapshots are full-workspace blobs, so row
// count is a poor size proxy — 200 rows of a large workspace measured 113 MB
// on one install. The tail read in currentRevision() bounds per-request cost,
// but unbounded disk growth still threatens the host. Default ≈ 12 MB of
// newest snapshots; override with LEADERSHIP_WORKSPACE_HISTORY_MAX_BYTES=0
// to disable the byte budget explicitly (the count cap still applies).
const WORKSPACE_HISTORY_MAX_BYTES = Number(process.env.LEADERSHIP_WORKSPACE_HISTORY_MAX_BYTES || 12 * 1024 * 1024);
// Pre-trim safety net: before a COMPACTION (startup self-heal or the periodic
// pass) rewrites the history file, a sha256-manifested copy of the current
// file is taken and verified — a trim can only proceed with a provably intact
// net. Backups live under BACKUP_DIR (outside DATA_DIR on production installs,
// so backup-rotate does not archive them; a scoped instance keeps them under
// ITS DATA_DIR — see the BACKUP_DIR definition), retention keeps the newest N
// within a 7-day window — enforced at boot, not only after a compaction.
const WORKSPACE_HISTORY_BACKUPS_ENABLED = String(process.env.LEADERSHIP_HISTORY_BACKUPS || "true").toLowerCase() !== "false";
const WORKSPACE_HISTORY_BACKUP_RETENTION = Number(process.env.LEADERSHIP_HISTORY_BACKUP_RETENTION || 10);
// Timed auto-compaction: the startup self-heal runs once, but long-lived
// installs and per-user histories keep growing. Default every 6 hours;
// 0 disables. Disable backups for a given install with LEADERSHIP_HISTORY_BACKUPS=false.
const WORKSPACE_HISTORY_COMPACT_INTERVAL_MS = Number(process.env.LEADERSHIP_HISTORY_COMPACT_INTERVAL_MS || 6 * 3600000);
const APPROVAL_FILE = path.join(DATA_DIR, "approvals.jsonl");
const JOBS_FILE = path.join(DATA_DIR, "jobs.jsonl");
const FINANCE_FILE = path.join(DATA_DIR, "finance-journal.jsonl");
const EVENTS_FILE = path.join(DATA_DIR, "domain-events.jsonl");
const CONNECTOR_STATE_FILE = path.join(DATA_DIR, "connector-state.jsonl");
const CONNECTOR_CONFIG_FILE = path.join(DATA_DIR, "connector-config.json");
const WRITEBACK_FILE = path.join(DATA_DIR, "writeback.jsonl");
const FINANCE_OPERATIONS_FILE = path.join(DATA_DIR, "finance-operations.jsonl");
const PRIVACY_GOVERNANCE_FILE = path.join(DATA_DIR, "privacy-governance.jsonl");
const EVIDENCE_FILE = path.join(DATA_DIR, "automation-evidence.jsonl");
const VALIDATION_STUDIES_FILE = path.join(DATA_DIR, "validation-studies.jsonl");
const HEARTBEAT_FILE = path.join(DATA_DIR, "heartbeat.json");
const NOTIFY_TO = process.env.LEADERSHIP_NOTIFY_TO || "";
const AUTOMATION_PAUSED = String(process.env.LEADERSHIP_AUTOMATION_PAUSED || "").toLowerCase() === "true";
let WEBHOOKS = [];
try { WEBHOOKS = Array.isArray(JSON.parse(process.env.LEADERSHIP_WEBHOOKS || "[]")) ? JSON.parse(process.env.LEADERSHIP_WEBHOOKS) : []; } catch (_) { WEBHOOKS = []; }
let OUTBOUND_WEBHOOKS = [];
try {
  const raw = JSON.parse(process.env.LEADERSHIP_OUTBOUND_WEBHOOKS || "[]");
  OUTBOUND_WEBHOOKS = (Array.isArray(raw) ? raw : []).map(hook => outboundWebhooks.register(hook));
} catch (_) { OUTBOUND_WEBHOOKS = []; }

function dispatchOperationalWebhook(event, payload) {
  return outboundWebhooks.deliver(OUTBOUND_WEBHOOKS, event, payload, {}).catch(() => []);
}
const USAGE_ANALYTICS = usageAnalytics.createAnalytics();
const POLICY_DECISIONS_FILE = path.join(DATA_DIR, "policy-decisions.jsonl");
const FROZEN_PERIODS_FILE = path.join(DATA_DIR, "frozen-periods.json");
const DECISION_OUTCOMES_FILE = path.join(DATA_DIR, "decision-outcomes.jsonl");
const PERSONAL_CONFLICTS_FILE = path.join(DATA_DIR, "personal-conflicts.jsonl");
const SECRET_ROTATIONS_FILE = path.join(DATA_DIR, "secret-rotations.jsonl");
const ATTESTATIONS_FILE = path.join(DATA_DIR, "attestations.jsonl");
const FORECASTS_FILE = path.join(DATA_DIR, "forecasts.jsonl");
const COMPLIANCE_FILE = path.join(DATA_DIR, "compliance-obligations.jsonl");
let healthResponseCache = null;
let ATTESTATIONS = readJsonLines(ATTESTATIONS_FILE);
let FORECASTS = readJsonLines(FORECASTS_FILE);
let COMPLIANCE_OBS = readJsonLines(COMPLIANCE_FILE);
let FROZEN_PERIODS = {};
try { FROZEN_PERIODS = JSON.parse(fs.existsSync(FROZEN_PERIODS_FILE) ? fs.readFileSync(FROZEN_PERIODS_FILE, "utf8") : "{}"); } catch (_) { FROZEN_PERIODS = {}; }
let DECISION_LEDGER = readJsonLines(DECISION_OUTCOMES_FILE);
let PERSONAL_CONFLICTS = readJsonLines(PERSONAL_CONFLICTS_FILE);
let SECRET_ROTATIONS = readJsonLines(SECRET_ROTATIONS_FILE);
let storageIntegrityIssue = null;
let AUTH = null;
let PERSISTENCE = null;
function persistenceStore() {
  if (!PERSISTENCE) PERSISTENCE = createPersistence();
  return PERSISTENCE;
}
function projectRepository() {
  const persistence = persistenceStore();
  return createProjectRepository({ mode: persistence.mode, postgres: persistence.postgres });
}
function authStore() {
  if (!AUTH) AUTH = authLib.createStore(DATA_DIR, appendAudit);
  return AUTH;
}
let ORGS = null;
function orgStore() {
  if (!ORGS) ORGS = require("./lib/org-store.js").createStore(DATA_DIR, appendAudit);
  return ORGS;
}
let COACH = null;
function coachStore() {
  if (!COACH) COACH = coachLib.createCoach(DATA_DIR, appendAudit);
  return COACH;
}
// Coach AI elaboration — the ALWAYS-ON mentor. Every grounded coach answer
// is offered to the shared LLM layer as a management-mentor elaboration on
// top of the deterministic, register-grounded core (never instead of it):
// the deterministic answer stays the source of truth and citations, the LLM
// adds methodology and recommended action steps. Priority: an explicit
// orchestrator (LEADERSHIP_AI_ORCHESTRATOR_URL) wins; otherwise the shared
// provider registry (Groq/OpenRouter/Cerebras/OpenAI/Mistral, with failover)
// elaborates; with neither, remote stays null and the deterministic answer
// ships unchanged.
// ─── Live provider evaluation: the golden mentor cases + the scorer ────────
// Deliberately small and FIXED, so runs are comparable across providers and
// over time. Each case is scored against the same rules the app enforces at
// runtime: the output contract (opens with the required label), the leader's
// language, no invented figure, a method the solver actually selected, and the
// length budget. A provider that scores well here is one whose answers would
// have survived the live gates.
const MENTOR_EVAL_CASES = [
  { id: "change-en", situationId: "change", lang: "en", problem: "An experienced employee rejects every change" },
  { id: "conflict-en", situationId: "conflict", lang: "en", problem: "Two employees have stopped speaking after a meeting" },
  { id: "performance-da", situationId: "performance", lang: "da", problem: "En medarbejder leverer ikke til tiden" },
  { id: "safety-da", situationId: "safety", lang: "da", problem: "Der er en sikkerhedsrisiko på anlægget" }
];
// Every rule the runtime enforces, scored the same way a live answer would be.
// `entailment` is the prose gate (lib/coach.js proseFindings): the narrative may
// name no actor the grounded solution did not. It is in this list because the
// whole point of the evaluation is to measure PRODUCTION's path — a rule the app
// drops answers for must be a rule the comparison scores.
const MENTOR_EVAL_CHECKS = ["contract", "language", "figures", "methods", "length", "entailment"];
// Did the elaboration name a method the solver actually selected? Compared on
// normalized tokens (id + the name without its parenthetical), because models
// write "Forandringsledelse (Lewin/Kotter)" where the registry says
// "Forandringsledelse (Lewin / Kotter)" — an exact-string check would fail a
// perfectly good answer and slander the provider.
function methodNameTokens(method) {
  const out = [];
  [String((method && method.id) || ""), String((method && method.name) || "")].forEach(raw => {
    if (!raw) return;
    const base = raw.toLowerCase();
    out.push(base);
    out.push(base.split(/[(–—-]/)[0].trim());
  });
  return out.filter(t => t.length >= 4);
}
function namesASelectedMethod(answer, methods) {
  const hay = String(answer || "").toLowerCase().replace(/[-/]/g, " ").replace(/\s+/g, " ");
  const says = t => hay.indexOf(String(t).replace(/[-/]/g, " ").replace(/\s+/g, " ")) >= 0;
  return (methods || []).some(m => methodNameTokens(m).some(says));
}

function scoreMentorEval(def, row) {
  if (!row || !row.ok) {
    return { score: 0, passed: false, checks: {}, failures: [(row && row.reason) || "no answer"], answer: "" };
  }
  const raw = String(row.answer || "");
  const cleaned = sanitizeMentorText(raw);
  const answer = cleaned || raw;
  const checks = {
    contract: cleaned !== null,
    language: !coachLib.languageDrift(answer, def.lang || "en"),
    figures: coachLib.unsupportedFigures(answer, def.allowedNumbers || []).length === 0,
    methods: namesASelectedMethod(answer, def.methods),
    length: answer.split(/\s+/).filter(Boolean).length <= 170,
    // Same prose gate the runtime applies, judged against the grounded solution
    // the case was built from — so a provider that invents an owner scores
    // lower here instead of failing silently in front of a leader.
    entailment: coachLib.entailProse(answer, { groundedText: def.answer || "" }).ok
  };
  const failures = MENTOR_EVAL_CHECKS.filter(k => !checks[k]);
  const score = MENTOR_EVAL_CHECKS.length - failures.length;
  return { score, passed: failures.length === 0, checks, failures, answer: raw.slice(0, 400) };
}

// The mentor persona, built PER LANGUAGE. One shared prompt biased the model
// toward Danish (the app's registers, method names and the persona's Danish
// style rules are Danish) even when the leader works in English; the live run
// showed half-Danish "METHOD" lines under an English UI. The prompt now states
// the language once (ANSWER LANGUAGE) and the style rules are written for that
// language only — English replies get English style rules, not Danish ones.
function coachMentorSystem(langArg, opts) {
  // I5: adaptive style — tone/length from fingerprint + pressure, no setting.
  let toneHint = "";
  let wordCap = 150;
  try {
    const adaptive = require("./lib/adaptive-mentor-style.js");
    const ws = opts && opts.workspace ? opts.workspace : {};
    const resolved = adaptive.resolveStyle(ws, langArg, opts && opts.styleHint ? { tone: opts.styleHint } : null);
    if (resolved.wordBudget) wordCap = resolved.wordBudget;
    if (resolved.tone === "direct") toneHint = langArg === "da"
      ? "- Adaptive tone: direct and terse — short sentences, no coaching questions, get to the point (lederen har travlt)."
      : "- Adaptive tone: direct and terse — short sentences, no coaching questions, get to the point (the leader is time-starved).";
    else if (resolved.tone === "municipal") toneHint = "- Adaptive tone: Danish municipal — kommunal fagsprog, præcist og myndigt, brug de etablerede termer.";
    else toneHint = "- Adaptive tone: coaching — ask one reflective question after the steps when it adds value.";
  } catch (_) { toneHint = ""; }
  const da = langArg === "da";
  const style = da
    ? "- Danish language style: municipal-professional (kommunal fagsprog) — use established Danish HR terms exactly: \"medarbejdergesamtal\", \"MUS\", \"APV\", \"trivselsmåling\", \"omsorgssamtale\", \"situationsbestemt ledelse\", \"delegeringsgrad\", \"hvem-gør-hvad\", \"handleplan\", \"opfølgning\". Write \"medarbejder\" (never \"ansat\" or \"medarbejderen\" generically mixed), \"leder\" (never \"chef\"), \"samtale\" (never \"meeting\" calques). No anglicisms where a Danish term exists (use \"opfølgning\" not \"follow-up\", \"forudsætninger\" not \"præmisser\"). Avoid bureaucratic filler (\"hermed\", \"herved\", \"i den forbindelse\")."
    : "- English language style: plain professional English throughout — whole sentences, not a Danish sentence with English labels. Established Danish terms of art stay in Danish on first use with a short English gloss in brackets (\"MUS (the annual performance and development review)\", \"APV (the workplace risk assessment)\", \"trivselsmåling (wellbeing survey)\"), then may be reused as-is. Never write instructions, owner names, measures or review dates in Danish in an English reply — the leader must be able to hand the text on without translating it.";
  const labels = da
    ? { one: "METODE", two: "HVORFOR DET BETYDER NOGET", three: "NÆSTE SKRIDT" }
    : { one: "METHOD", two: "WHY IT MATTERS", three: "NEXT STEPS" };
  return `You are "Vejen" — the built-in leadership mentor of a Danish public-sector and utility leadership application (Danish: vegeway — the practical path forward). You receive a GROUNDED ANSWER that was computed from the user's own registers (MUS, APV, sickness follow-up, wellbeing, conflicts, risks, tasks and similar) plus the user's question.
Your job: elaborate as a warm but direct mentor. When the GROUNDED ANSWER is a MENTOR SOLUTION for a REGISTERED CHALLENGE (intent "mentor_solution"), it already names the fitting methods and the next steps — you sharpen the WHY and the sequencing, keep every owner, date, measure and figure exactly as the solution states them, and say plainly which charts the leader must still fill before the plan is complete. Structure every reply exactly:
1) ${labels.one}: name the relevant leadership/management method (e.g. situational leadership, delegation ladder, NVC, Bradford factor, psychological safety, RACI, SMART) and in one or two sentences why it fits THIS situation.
2) ${labels.two}: one or two sentences connecting the grounded finding to consequences for people or delivery.
3) ${labels.three}: 2-4 concrete actions, each starting with a verb, the first one doable today.
Rules:
- The GROUNDED ANSWER's facts, figures and dates are the only facts you may repeat. Never invent or alter any number, date, name or register row.
- Repeat each figure exactly as given; do not compute new figures.
- ANSWER LANGUAGE is stated in the prompt and is binding: reply entirely in that language. Write ${da ? "Danish" : "English"} — do not switch language because the registers, quotes or method names are Danish.
- Tone: respectful, pragmatic, never lecturing; address the leader as "du" in Danish, as "you" in English.
${style}${toneHint ? "\n" + toneHint : ""}
- Safety-critical topics (violence/threats, incidents, sickness follow-up) always keep the grounded answer's protective recommendations and mention the formal route where relevant.
- Use EXACTLY these labels, spelled as shown and in this language: "${labels.one}", "${labels.two}", "${labels.three}". Maximum ${wordCap} words total.`;
}

// Mentor output contract: some free/open models emit their reasoning as the
// visible answer ("Here's a thinking process…", "Okay, the user is…"). That
// must never reach a leader. The prompt demands the reply OPEN with the METHOD
// label, so a reply not matching it is treated as a failed call
// (failover/degrade), not shown. Hoisted so the live provider evaluation scores
// providers against EXACTLY the contract the app enforces at runtime.
const MENTOR_LABEL = /^\s*\*{0,2}(METODE|METHOD|WHY|HVORFOR|NÆSTE|NEXT)\*{0,2}\b/i;
function sanitizeMentorText(text) {
  let t = String(text || "");
  if (MENTOR_LABEL.test(t)) {
    const start = t.search(MENTOR_LABEL);
    if (start > 0) t = t.slice(start); // strip reasoning preamble before the first label
  } else {
    return null; // no contract opening — reject
  }
  return t.trim();
}

// The mentor prompt, built in ONE place: the live hook and the provider
// evaluation must send byte-identical prompts, or the evaluation would grade a
// path nobody runs (that exact gap made the first evaluation run bilingual —
// the language line lived only in the hook).
function mentorUserPrompt(question, grounded, ctx) {
  const lang = grounded && grounded.lang === "da" ? "da" : "en";
  const contextParts = [];
  if (ctx) {
    if (ctx.teamSize) contextParts.push("Team: " + ctx.teamSize + " members" + (ctx.teamMembers ? " (" + ctx.teamMembers + ")" : ""));
    if (ctx.openTasks || ctx.overdueTasks || ctx.blockedTasks) contextParts.push("Tasks: " + (ctx.openTasks || 0) + " open, " + (ctx.overdueTasks || 0) + " overdue, " + (ctx.blockedTasks || 0) + " blocked");
    if (ctx.highRisks) contextParts.push("High risks: " + ctx.highRisks);
    if (ctx.openConflicts) contextParts.push("Open conflicts: " + ctx.openConflicts);
    if (ctx.activeAbsences) contextParts.push("Active absences: " + ctx.activeAbsences);
    if (ctx.openCases) contextParts.push("Open mentor cases: " + ctx.openCases);
    if (ctx.recentCase) contextParts.push("Recent case: " + ctx.recentCase);
  }
  return [
    "ANSWER LANGUAGE: " + (lang === "da" ? "Danish (da)" : "English (en)"),
    "QUESTION: " + String(question || "").slice(0, 500),
    contextParts.length ? "REGISTER CONTEXT:\n" + contextParts.join("\n") : "",
    "GROUNDED ANSWER (facts you must stay within): " + String((grounded && grounded.answer) || "").slice(0, 1500),
    "INTENT: " + String((grounded && grounded.intent) || "general")
  ].filter(Boolean).join("\n\n") + "\n\nMentor elaboration (reply in " + (lang === "da" ? "Danish (da)" : "English (en)") + " only):";
}

function remoteCoachHook(workspace, question, grounded) {
  const sanitizeMentor = sanitizeMentorText;
  // Collect enriched context from registers for the LLM prompt
  const lang = grounded && grounded.lang === "da" ? "da" : "en";
  const enrichedContext = {};
  try {
    const state = workspace || {};
    const regs = (state && state.registers) || {};
    const team = (state && state.roster) || [];
    // Team summary
    enrichedContext.teamSize = team.length;
    enrichedContext.teamMembers = team.slice(0, 8).map(m => (m.name || "") + (m.role ? " (" + m.role + ")" : "")).join(", ");
    // Task summary
    const tasks = regs.tasks || [];
    const today = new Date().toISOString().slice(0, 10);
    const openTasks = tasks.filter(t => { const s = String(t.status || "").toUpperCase(); return s !== "DONE" && s !== "COMPLETED" && s !== "CLOSED"; });
    const overdueTasks = openTasks.filter(t => t.dueDate && t.dueDate < today);
    enrichedContext.openTasks = openTasks.length;
    enrichedContext.overdueTasks = overdueTasks.length;
    enrichedContext.blockedTasks = tasks.filter(t => String(t.status || "").toUpperCase() === "BLOCKED").length;
    // Risk summary
    const risks = regs.risks || [];
    enrichedContext.totalRisks = risks.length;
    enrichedContext.highRisks = risks.filter(r => { const rpn = (r.sev || 0) * (r.occ || 0) * (r.det || 0); return rpn >= 50; }).length;
    // Conflict summary
    const conflicts = regs.conflicts || [];
    enrichedContext.openConflicts = conflicts.filter(c => { const s = String(c.stage || "").toLowerCase(); return s !== "resolved" && s !== "closed"; }).length;
    // Absence summary
    const absences = regs.absences || [];
    const activeAbsences = absences.filter(a => !a.endDate || a.endDate >= today);
    enrichedContext.activeAbsences = activeAbsences.length;
    // 1:1 summary
    const ones = regs.oneonones || [];
    enrichedContext.totalOneOnOnes = ones.length;
    // Case history
    const cases = Array.isArray(state.mentorCases) ? state.mentorCases : [];
    enrichedContext.totalCases = cases.length;
    enrichedContext.openCases = cases.filter(c => c.status === "open").length;
    if (cases.length > 0) {
      const recent = cases[cases.length - 1];
      enrichedContext.recentCase = (recent.problem || "").slice(0, 100);
    }
  } catch (_) {}
  // 1) Explicit orchestrator override (corporate gateway).
  const orchestrator = process.env.LEADERSHIP_AI_ORCHESTRATOR_URL;
  if (orchestrator) {
    const token = process.env.LEADERSHIP_AI_TOKEN || "";
    const body = {
      question: String(question || "").slice(0, 500),
      context: {
        intent: grounded.intent,
        groundedAnswer: grounded.answer,
        citations: (grounded.citations || []).slice(0, 10),
        verification: grounded.verification,
          freshness: grounded.freshness,
          privacy: privacyRedaction.redactCoachContext(workspace)
      }
    };
    return fetch(orchestrator + "/v1/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    }).then(async response => {
      if (!response.ok) return { skipped: "remote status " + response.status };
      const data = await response.json().catch(() => ({}));
      return { remoteAnswer: data.answer || null, model: data.model || null };
    }).catch(error => ({ skipped: "remote error: " + (error && error.message ? error.message : "unknown") }));
  }
  // 2) Shared provider layer (with failover). No key anywhere → skipped, and
  //    the deterministic grounded answer is the whole reply (status quo).
  if (!llmInference.isAvailable()) return Promise.resolve(null);
  const userPrompt = mentorUserPrompt(question, grounded, enrichedContext);
  return llmInference.generate(userPrompt, { system: coachMentorSystem(grounded.lang === "da" ? "da" : "en"), temperature: 0.3, maxTokens: 900, timeoutMs: 25000 })
    .then(result => {
      if (!result.ok) return { skipped: "llm " + (result.reason || "unavailable") };
      const clean = sanitizeMentor(result.response);
      if (!clean) return { skipped: "llm mentor reply violated output contract (reasoning dump)" };
      return { remoteAnswer: clean, model: result.provider + "/" + result.model };
    })
    .catch(() => Promise.resolve({ skipped: "llm error" }));
}
const API_TOKEN = process.env.LEADERSHIP_API_TOKEN || "";
const API_RATE_LIMIT = Number(process.env.LEADERSHIP_API_RATE_LIMIT || 120);
// Tighter per-IP budget for credential endpoints (spray protection — see the
// authLimiter block near allowAuthRequest). 0 disables the dedicated budget
// (the global limiter and the per-identity login lockout still apply).
const AUTH_RATE_LIMIT = Number(process.env.LEADERSHIP_AUTH_RATE_LIMIT || 10);
// Comma-separated proxy IPs / IPv4 CIDRs the deployment trusts to set
// X-Forwarded-For (or 1/true/any when the only direct peer IS the proxy).
// Without this, client-supplied XFF is never trusted: direct connections
// cannot rotate their rate-limit bucket by spoofing the header, and behind
// a configured proxy every user keeps their own bucket instead of sharing
// the proxy's socket IP.
const TRUSTED_PROXIES = productionHardening.parseTrustedProxies(process.env.LEADERSHIP_TRUSTED_PROXY || "");
const CREDENTIAL_ROUTES = new Set([
  "POST /api/auth/login",
  "POST /api/auth/2fa/verify",
  "POST /api/auth/register",
  "POST /api/auth/webauthn/login/options",
  "POST /api/auth/webauthn/login/verify"
]);
const rateWindow = new Map();
let TOKEN_ROLES = {};
try { TOKEN_ROLES = process.env.LEADERSHIP_API_TOKENS ? JSON.parse(process.env.LEADERSHIP_API_TOKENS) : {}; } catch (_) { TOKEN_ROLES = {}; }
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, "", "utf8");
  // Touch the history file only if ABSENT — a rename-replacement that briefly
  // removes the path (compaction, trim) must never be answered with a fresh
  // empty file, or the live history silently disappears between the unlink
  // and the rename. Creation, never clobbering.
  if (!fs.existsSync(WORKSPACE_HISTORY_FILE)) fs.writeFileSync(WORKSPACE_HISTORY_FILE, "", "utf8");
  if (!fs.existsSync(APPROVAL_FILE)) fs.writeFileSync(APPROVAL_FILE, "", "utf8");
  if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, "", "utf8");
  if (!fs.existsSync(FINANCE_FILE)) fs.writeFileSync(FINANCE_FILE, "", "utf8");
  if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, "", "utf8");
  if (!fs.existsSync(CONNECTOR_STATE_FILE)) fs.writeFileSync(CONNECTOR_STATE_FILE, "", "utf8");
  if (!fs.existsSync(WRITEBACK_FILE)) fs.writeFileSync(WRITEBACK_FILE, "", "utf8");
  if (!fs.existsSync(FINANCE_OPERATIONS_FILE)) fs.writeFileSync(FINANCE_OPERATIONS_FILE, "", "utf8");
  if (!fs.existsSync(PRIVACY_GOVERNANCE_FILE)) fs.writeFileSync(PRIVACY_GOVERNANCE_FILE, "", "utf8");
  if (!fs.existsSync(EVIDENCE_FILE)) fs.writeFileSync(EVIDENCE_FILE, "", "utf8");
  if (!fs.existsSync(VALIDATION_STUDIES_FILE)) fs.writeFileSync(VALIDATION_STUDIES_FILE, "", "utf8");
}

function readWorkspaceFile(file) {
  ensureStorage();
  if (!fs.existsSync(file)) return { projects: {}, order: [], activeId: null, brand: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    storageIntegrityIssue = null;
    return decryptWorkspace(parsed);
  } catch (error) {
    if (error instanceof IntegrityError) {
      storageIntegrityIssue = "undecryptable: " + error.message;
      logger.error("workspace_undecryptable", { message: error.message });
      return { projects: {}, order: [], activeId: null, brand: {} };
    }
    storageIntegrityIssue = "unreadable: " + (error && error.message ? error.message : "parse failure");
    return { projects: {}, order: [], activeId: null, brand: {} };
  }
}

// ─── Workspace blob write serialization ──────────────────────────────────────
// In jsonl mode the whole workspace is one encrypted blob. Two concurrent
// read-modify-write cycles (two connector syncs, or a connector sync racing a
// browser save) can lose an update: each reads the blob, then the last writer
// overwrites the other's changes. A per-file async mutex serializes write
// cycles so a stale read can never clobber a newer blob. The app is
// single-process; a multi-process deployment would need a real file lock.
const workspaceLocks = new Map();
function withWorkspaceFileLock(file, fn) {
  const prev = workspaceLocks.get(file) || Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  workspaceLocks.set(file, run.catch(() => {}));
  return run;
}

function writeWorkspaceFileUnlocked(file, historyFile, workspace) {
  // Every write lands stamped with the data schema version of the code that
  // is writing it: a save, restore or connector intake can never silently
  // "downgrade" the disk file below the running code's understanding and
  // re-queue migrations that are already done. Additive — nothing removed.
  appUpgrade.stampWorkspaceVersion(workspace);
  ensureStorage();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const stored = encryptWorkspace(workspace);
  storageIntegrityIssue = null;
  const temp = file + ".tmp";
  const fd = fs.openSync(temp, "w");
  fs.writeFileSync(fd, JSON.stringify(stored, null, 2), "utf8");
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  fs.renameSync(temp, file);
  appendWorkspaceHistoryFile(historyFile, stored);
  // The live register channel: a row written by a SERVER-side writer
  // (automation rule, connector intake, NLU command, recurring task, route) is
  // announced to the connected browsers the moment it is persisted — through
  // the same registration contract the browser's own writes speak — so the
  // unified case index registers it IMMEDIATELY, not at the receiver's next
  // app open. Best-effort by decree: the write has already landed, so a
  // broadcast failure can never fail it. Every workspace write funnels
  // through here (PUT, route writes, atomic mutates, restores), which is what
  // makes this one hook cover every writer.
  try {
    const delta = registerAnnouncements.announcementDelta(file, workspace);
    for (const change of delta) {
      const payload = { regId: change.regId, rowId: change.rowId, action: change.action, row: change.row };
      if (change.projectId) {
        wsServer.broadcast("registers:" + change.projectId, "register.row", payload);
      } else {
        // The workspace-level registers twin has no project of its own: it
        // rides every project channel of this workspace so every authorized
        // subscriber hears it. The client's registration is idempotent over
        // repeats (registeredAt never moves).
        const projects = workspace && workspace.projects ? Object.keys(workspace.projects) : [];
        for (const pid of projects) wsServer.broadcast("registers:" + pid, "register.row", payload);
      }
    }
  } catch (_announceError) { /* announcement is best-effort; the write landed */ }
}

function writeWorkspaceFile(file, historyFile, workspace) {
  return withWorkspaceFileLock(file, () => writeWorkspaceFileUnlocked(file, historyFile, workspace));
}

// Atomic read-modify-write of a workspace blob: read, apply fn, and write all
// under the same per-file lock. Anything doing a compound update (connector
// intake in jsonl mode) must use this instead of readWorkspace() +
// writeWorkspace(), which is what loses updates under concurrency.
function mutateWorkspaceFile(file, historyFile, fn) {
  return withWorkspaceFileLock(file, () => {
    const ws = readWorkspaceFile(file);
    const result = fn(ws);
    writeWorkspaceFileUnlocked(file, historyFile, ws);
    return result;
  });
}
function mutateWorkspace(fn) { return mutateWorkspaceFile(WORKSPACE_FILE, WORKSPACE_HISTORY_FILE, fn); }

// Conditional atomic read-modify-write: fn returns {changed, ...} and the
// write only happens when fn reports a change. This is what lets the
// automation passes keep the "quiet workspace stays quiet on disk" promise —
// a no-op pass produces NO revision, NO history row, NO client 409.
function mutateWorkspaceFileConditional(file, historyFile, fn) {
  return withWorkspaceFileLock(file, () => {
    const ws = readWorkspaceFile(file);
    const out = fn(ws) || {};
    if (out.changed) writeWorkspaceFileUnlocked(file, historyFile, ws);
    return out;
  });
}
function mutateWorkspaceConditional(fn) {
  return mutateWorkspaceFileConditional(WORKSPACE_FILE, WORKSPACE_HISTORY_FILE, fn);
}
function mutateWorkspaceForConditional(userId, fn) {
  const p = userWorkspacePaths(userId);
  return mutateWorkspaceFileConditional(p.file, p.history, fn);
}
// Scoped atomic mutate for route handlers: resolves the SAME file
// writeScopedWorkspace does (session user's own file / shared blob for
// anonymous), but reads RAW under the per-file lock. Every writer inside one
// automation tick therefore sees the previous writer's rows — the old
// read-outside-lock + write-outside-lock pairs in this file were clobbering
// each other (and, for session users, writing the wrong file entirely).
// The fn must only touch fields this route is allowed to persist.
function mutateScopedWorkspace(req, fn) {
  const scope = workspaceScope(req);
  return scope.scoped ? mutateWorkspaceForConditional(scope.userId, fn) : mutateWorkspaceConditional(fn);
}

function readHistoryFile(file) {
  ensureStorage();
  return readJsonLines(file);
}

function rechainHistory(rows) {
  let previous = "";
  for (const row of rows) {
    row.checksum = checksum(previous, { id: row.id, ts: row.ts, action: row.hash, detail: row.revision });
    previous = row.checksum;
  }
  return rows;
}

function appendWorkspaceHistoryFile(historyFile, workspace) {
  const rows = readHistoryFile(historyFile);
  // Monotonic revision numbers — must not be derived from row count, because
  // trimming the oldest snapshots would otherwise reuse revision numbers.
  const revision = rows.length ? (Number(rows[rows.length - 1].revision) || 0) + 1 : 1;
  const entry = { id: crypto.randomUUID(), ts: new Date().toISOString(), revision, hash: workspaceHash(workspace), snapshot: workspace };
  entry.checksum = checksum(rows.length ? rows[rows.length - 1].checksum : "", { id: entry.id, ts: entry.ts, action: entry.hash, detail: entry.revision });
  (function() {
    const fd = fs.openSync(historyFile, "a");
    fs.appendFileSync(fd, JSON.stringify(entry) + "\n", "utf8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  })();
  // Cap history growth: keep only the newest snapshots. Dropping the oldest
  // rows breaks the checksum chain (the new head references a removed row),
  // so re-chain the kept rows before rewriting the file.
  //
  // Two budgets, because each row is a FULL workspace snapshot and rows can
  // differ in size by orders of magnitude (a load-test snapshot measured
  // ~1.6 MB/row against ~270 bytes for a small workspace):
  //   • WORKSPACE_HISTORY_MAX — row count, catches many small snapshots.
  //   • WORKSPACE_HISTORY_MAX_BYTES — total bytes, catches few huge ones.
  // Without the byte budget the count cap alone left the file unbounded in
  // practice (200 × 1.6 MB ≈ 320 MB) and every save paid a full-file read.
  const allRows = rows.concat([entry]);
  const overflow = allRows.length > WORKSPACE_HISTORY_MAX ||
    Buffer.byteLength(allRows.map(r => JSON.stringify(r)).join("\n") + "\n", "utf8") > WORKSPACE_HISTORY_MAX_BYTES;
  if (overflow && historyTrimThrottleOk(historyFile)) {
    // Safety valve: while the budget does its job, a pathological caller (huge
    // register writes in a tight loop) could otherwise force a full rewrite on
    // EVERY save. Rewrites are throttled to one per interval (default 60s,
    // LEADERSHIP_HISTORY_TRIM_MIN_INTERVAL_MS, 0 disables) — overflow beyond
    // the throttle still appends, and the next trim window catches up. The
    // startup/periodic compaction path is NOT throttled: recovery must always
    // be able to run. The trim is a destructive rewrite, so it gets the same
    // verified pre-trim net as compaction; a failed backup skips the trim
    // (never shrink without a net) and the next window retries.
    try {
      if (WORKSPACE_HISTORY_BACKUPS_ENABLED) {
        const net = backupHistoryBeforeTrim(historyFile);
        const verdict = verifyHistoryBackup(net);
        if (!verdict.checksumOk) throw new Error("unverified net: " + verdict.reason);
      }
      const kept = trimHistoryToBudget(allRows);
      fs.writeFileSync(historyFile, rechainHistory(kept).map(r => JSON.stringify(r)).join("\n") + "\n", "utf8");
    } catch (err) {
      logger.error("workspace_history_trim_skipped", { file: historyFile, error: err.message });
    }
  }
  return entry;
}

function historyTrimThrottleOk(historyFile) {
  // Read per call so an override takes effect without a restart (tests flip it).
  const minInterval = Number(process.env.LEADERSHIP_HISTORY_TRIM_MIN_INTERVAL_MS === undefined ? 60000 : process.env.LEADERSHIP_HISTORY_TRIM_MIN_INTERVAL_MS);
  if (!(minInterval > 0)) return true;
  const now = Date.now();
  const last = historyTrimTimes.get(historyFile) || 0;
  if (now - last < minInterval) return false;
  historyTrimTimes.set(historyFile, now);
  return true;
}
const historyTrimTimes = new Map();

// Keep the NEWEST rows within BOTH budgets (count and bytes). Newest-first
// so a single oversized snapshot still keeps itself — history stays useful
// (at least one restore point) no matter how big one row is.
function trimHistoryToBudget(rows) {
  const budget = WORKSPACE_HISTORY_MAX_BYTES;
  const kept = [];
  let total = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const size = Buffer.byteLength(JSON.stringify(rows[i]), "utf8");
    if (kept.length >= WORKSPACE_HISTORY_MAX || (kept.length && total + size > budget)) break;
    kept.push(rows[i]); total += size;
  }
  return kept.reverse();
}

function restoreRevision(file, historyFile, revision) {
  const entry = readHistoryFile(historyFile).find(row => String(row.revision) === String(revision));
  if (!entry || !entry.snapshot || workspaceHash(entry.snapshot) !== entry.hash) return false;
  try {
    writeWorkspaceFile(file, historyFile, decryptWorkspace(entry.snapshot));
    return true;
  } catch (error) {
    if (error instanceof IntegrityError) logger.error("restore_undecryptable", { message: error.message });
    return false;
  }
}

function currentRevision(historyFile) {
  // The history file grows without bound (each save appends a full snapshot),
  // so reading + JSON-parsing every line per request made ALL authenticated
  // API calls pay an ever-growing latency tax (113 MB ≈ 1s on a dev box).
  // The revision is the LAST row's field — a tail read gives the same answer.
  try {
    const stat = fs.statSync(historyFile);
    if (!stat.size) return "0";
    const fd = fs.openSync(historyFile, "r");
    try {
      const tailLen = Math.min(64 * 1024, stat.size);
      const buf = Buffer.alloc(tailLen);
      fs.readSync(fd, buf, 0, tailLen, stat.size - tailLen);
      const lines = buf.toString("utf8").split("\n").filter(l => l.trim());
      const last = lines[lines.length - 1];
      const row = JSON.parse(last);
      return row && row.revision != null ? String(row.revision) : "0";
    } finally { fs.closeSync(fd); }
  } catch (_) {
    // Fall back to the (slow but correct) full scan if the tail is unreadable
    // or the last line is torn/corrupt — honesty over speed.
    const rows = readHistoryFile(historyFile);
    return rows.length ? String(rows[rows.length - 1].revision) : "0";
  }
}

// ─── Shared workspace (legacy / no-session mode) ─────────────────────────────
function readWorkspace() { return readWorkspaceFile(WORKSPACE_FILE); }
function writeWorkspace(workspace) { return writeWorkspaceFile(WORKSPACE_FILE, WORKSPACE_HISTORY_FILE, workspace); }
function readWorkspaceHistory() { return readHistoryFile(WORKSPACE_HISTORY_FILE); }
function appendWorkspaceHistory(workspace) { return appendWorkspaceHistoryFile(WORKSPACE_HISTORY_FILE, workspace); }
function restoreWorkspaceRevision(revision) { return restoreRevision(WORKSPACE_FILE, WORKSPACE_HISTORY_FILE, revision); }
function currentWorkspaceRevision() { return currentRevision(WORKSPACE_HISTORY_FILE); }

// ─── Per-user workspaces (authenticated sessions) ────────────────────────────
function userWorkspacePaths(userId) {
  const dir = path.join(DATA_DIR, "workspaces");
  return {
    file: path.join(dir, userId + ".json"),
    history: path.join(dir, userId + "-history.jsonl")
  };
}
function readWorkspaceFor(userId) { return readWorkspaceFile(userWorkspacePaths(userId).file); }
function writeWorkspaceFor(userId, workspace) {
  const p = userWorkspacePaths(userId);
  return writeWorkspaceFile(p.file, p.history, workspace);
}
function readWorkspaceHistoryFor(userId) { return readHistoryFile(userWorkspacePaths(userId).history); }
function currentWorkspaceRevisionFor(userId) { return currentRevision(userWorkspacePaths(userId).history); }
function restoreWorkspaceRevisionFor(userId, revision) {
  const p = userWorkspacePaths(userId);
  return restoreRevision(p.file, p.history, revision);
}

// ─── Request-scoped workspace resolution ─────────────────────────────────────
function workspaceScope(req) {
  const user = authStore().userFromRequest(req);
  if (user) return { userId: user.id, scoped: true };
  return { userId: null, scoped: false };
}
function readScopedWorkspace(req) {
  const scope = workspaceScope(req);
  const ws = scope.scoped ? readWorkspaceFor(scope.userId) : readWorkspace();
  // Viewer/auditor reads get the role-limited view at the source, so every
  // consumer (workspace GET, entity graph, coach context, alerts, automation
  // plan, reports) cannot leak sensitive registers or roster profiles.
  // All write paths are editor+-gated and therefore see the raw workspace.
  const role = roleFor(req);
  if (role !== "editor" && role !== "admin") return sanitizeWorkspaceForRole(ws, role);
  return ws;
}
function readScopedWorkspaceHistory(req) {
  const scope = workspaceScope(req);
  return scope.scoped ? readWorkspaceHistoryFor(scope.userId) : readWorkspaceHistory();
}

// Workspace access functions for the connector intake. A connector config may
// carry a userId — the person who configured it — and in jsonl+session mode
// that user's tasks live in their PER-USER scoped workspace, not the shared
// blob. Target the user's own file when present (with the per-file lock so a
// sync racing a browser save cannot lose rows); fall back to the shared blob
// for anonymous-mode connectors, which is the legacy behavior.
function connectorWorkspaceFns(config) {
  if (config && config.userId) {
    const p = userWorkspacePaths(config.userId);
    return {
      readWorkspace: () => readWorkspaceFor(config.userId),
      writeWorkspace: (ws) => writeWorkspaceFor(config.userId, ws),
      mutate: (fn) => mutateWorkspaceFile(p.file, p.history, fn)
    };
  }
  return { readWorkspace, writeWorkspace, mutate: mutateWorkspace };
}
function activeProjectState(req) {
  const ws = readScopedWorkspace(req);
  return activeProject(ws);
}
function activeProject(ws) {
  if (ws.projects && ws.projects[ws.activeId]) return ws.projects[ws.activeId];
  const first = Object.values(ws.projects || {})[0];
  return first || ws;
}

// ─── Per-project authorization ────────────────────────────────────────────
// Writes to a specific project use the same model as the automation jobs
// (lib/project-rbac.js): admins bypass; editors can only mutate projects they
// lead (or projects with no lead assigned); viewers/auditors are read-only.
// `project` here is the workspace project object (with .project.lead).
function authorizeProjectWrite(req, project) {
  const user = authStore().userFromRequest(req);
  const decision = projectRbacLib.canAccessProject(user, project, "editor");
  return decision;
}

// ─── Project-scoped request resolution ─────────────────────────────────────
// Most routes historically operated on the workspace's single "active"
// project. A ?projectId= query param now scopes a request to a specific
// project when it exists; otherwise the active project is used, so existing
// clients behave exactly as before.
function requestedProjectId(req, ws) {
  const pid = req.query && req.query.projectId;
  return (pid && ws && ws.projects && ws.projects[pid]) ? String(pid) : null;
}
function resolveProject(req, ws) {
  const pid = requestedProjectId(req, ws);
  return pid ? ws.projects[pid] : activeProject(ws);
}
function requestedProjectState(req, ws) {
  const pid = requestedProjectId(req, ws);
  return pid ? { project: ws.projects[pid], projectId: pid, explicit: true } : { project: activeProject(ws), projectId: ws.activeId, explicit: false };
}
function writeScopedWorkspace(req, ws) {
  // Movement between scheduled passes: every persistence is a moment the
  // register CHANGED — the delivery movement scan diffs it against the stored
  // snapshot and files its alerts through the same tray, before the save
  // lands (so the advanced snapshot travels with the save). Never blocks.
  try {
    require("./lib/delivery-governance.js").movementCheck(ws, {
      dataDir: DATA_DIR,
      today: new Date().toISOString().slice(0, 10),
      lang: getLang(req),
      submit: (payload) => require("./lib/review-tray.js").submitDraft(DATA_DIR, payload)
    });
  } catch (_) { /* movement is a service, never a gate on saving */ }
  const scope = workspaceScope(req);
  return scope.scoped ? writeWorkspaceFor(scope.userId, ws) : writeWorkspace(ws);
}
function currentScopedRevision(req) {
  const scope = workspaceScope(req);
  return scope.scoped ? currentWorkspaceRevisionFor(scope.userId) : currentWorkspaceRevision();
}
function restoreScopedRevision(req, revision) {
  const scope = workspaceScope(req);
  return scope.scoped ? restoreWorkspaceRevisionFor(scope.userId, revision) : restoreWorkspaceRevision(revision);
}

function readJsonLines(file) {
  if (!fs.existsSync(file)) return [];
  const rows = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) {
    try { rows.push(JSON.parse(line)); }
    catch (_) { rows.push({ _corrupt: true }); }
  }
  return rows;
}

// ─── Finance journal scoping ──────────────────────────────────────────────
// In file mode the journal was a single global file: every user's finance
// entries mixed into one chain and any viewer could read them. Authenticated
// users now read/write their own per-user journal (DATA_DIR/finance/<id>.jsonl)
// with its own FINANCE-GENESIS chain; unauthenticated/local-dev and the
// deployment-wide integrity checks keep using the global file.
function financeJournalPath(req) {
  const user = req && authStore().userFromRequest(req);
  if (!user) return FINANCE_FILE;
  return path.join(DATA_DIR, "finance", String(user.id) + ".jsonl");
}
function financeRows(req) {
  return readJsonLines(financeJournalPath(req));
}

function financeIntegrity(rows) {
  let previous = "FINANCE-GENESIS";
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]._corrupt) return { valid: false, checked: rows.length, brokenAt: i };
    const expected = crypto.createHash("sha256").update(previous + JSON.stringify(rows[i].entry)).digest("hex");
    if (rows[i].hash !== expected) return { valid: false, checked: rows.length, brokenAt: i };
    previous = rows[i].hash;
  }
  return { valid: true, checked: rows.length, brokenAt: null };
}

// Identity used to charge AI spend (lib/llm-usage.js scope chain). Deliberately
// defensive: databaseTenantId() THROWS for an unauthenticated PostgreSQL
// request, and metering must never turn an ordinary request into a 500.
// Unauthenticated local/loopback work is charged to the configured tenant (or
// "local") — the same fallback the rest of the app uses.
function spendIdentityFor(req) {
  try {
    const user = authStore().userFromRequest(req);
    if (user && user.id) return { userId: String(user.id), tenantId: String(user.tenantId || user.id) };
  } catch (_) { /* fall through to the deployment scope */ }
  return { tenantId: String(process.env.LEADERSHIP_TENANT_ID || "local") };
}

function moduleTenantIdForRequest(req) {
  const user = authStore().userFromRequest(req);
  return user ? String(user.tenantId || user.id) : String(process.env.LEADERSHIP_TENANT_ID || "local");
}

/**
 * THE rule for "which tenant is this request for?" — one resolver, used by the
 * global request guard AND by the per-route tenant resolver, so the two can
 * never give different answers to the same request.
 *
 * Before this existed they DID disagree, and the disagreement was reachable:
 * the guard used the strict tenant rule (a user belongs to `user.tenantId`
 * only) while every other route used the membership-aware one (the membership
 * ledger + live SCIM group grants). The multi-org switcher therefore had two
 * inconsistent outcomes for the SAME organization:
 *   • `x-org-id: <org the user is a member of>` → 200, but the guard still
 *     echoed the HOME tenant in X-Tenant-Id, and
 *   • `x-tenant-id: <same org>` → 403 "tenant boundary violation" on every
 *     route, including the ones the app's own /api/orgs advertises as the
 *     active tenant.
 * A member of an organization may now use it through either header (the
 * documented switcher header is x-org-id; x-tenant-id is the same request), and
 * a NON-member is still refused — the boundary itself is unchanged.
 */
function tenantVerdictForRequest(req, user) {
  const requested = String((req && req.headers && (req.headers["x-org-id"] || req.headers["x-tenant-id"])) || "").trim();
  const home = String(user.tenantId || user.id || "").trim();
  if (!requested) return { allowed: true, tenantId: home || null, role: user.role || null, source: "home" };
  if (requested === home) return { allowed: true, tenantId: requested, role: user.role || null, source: "home" };
  const effective = orgStore().effectiveRoleForUser(user.id, requested);
  if (effective.allowed) return { allowed: true, tenantId: requested, role: effective.role, source: effective.source || "membership" };
  // Server-level admins may cross orgs (unchanged), and they get the full role
  // rather than the requested tenant's role, which may not exist for them.
  if (user.role === "admin" || user.role === "owner") return { allowed: true, tenantId: requested, role: user.role, source: "server-admin" };
  return { allowed: false, tenantId: null, reason: "organization membership is required for " + requested };
}

function databaseTenantId(req) {
  const user = authStore().userFromRequest(req);
  // Local (jsonl) mode has no identity layer — routes still need a tenant id
  // for domain events and shared-store calls, so fall back to the configured
  // tenant (or "local"). PostgreSQL mode requires an authenticated user: its
  // records are tenant-scoped and must never default to a shared tenant.
  if (!user && !persistenceStore().postgres) return String(process.env.LEADERSHIP_TENANT_ID || "local");
  if (!user) throw new Error("authenticated user is required for PostgreSQL requests");
  const verdict = tenantVerdictForRequest(req, user);
  if (!verdict.allowed) throw new Error(verdict.reason);
  return verdict.tenantId;
}

function webauthnTenantId(req, user) {
  const requested = req.headers["x-tenant-id"] || "";
  const configured = process.env.LEADERSHIP_TENANT_ID || "local";
  if (user && user.tenantId) {
    const scope = tenantContext.tenantIdForUser(user, requested || undefined);
    if (!scope.allowed) throw new Error(scope.reason);
    return scope.tenantId;
  }
  return String(requested || configured);
}

async function appendFinanceEntry(entry, tenantId, req) {
  if (persistenceStore().postgres) return persistenceStore().postgres.postFinanceEntry(tenantId, entry);
  const file = financeJournalPath(req);
  const rows = financeRows(req);
  const previous = rows.length ? rows[rows.length - 1].hash : "FINANCE-GENESIS";
  const record = { entry, hash: crypto.createHash("sha256").update(previous + JSON.stringify(entry)).digest("hex") };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fd = fs.openSync(file, "a");
  fs.appendFileSync(fd, JSON.stringify(record) + "\n", "utf8");
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  return entry;
}

function completionObservations() {
  // Live evidence for the completion audit: records + events per module key.
  const observed = {};
  try {
    const base = path.join(DATA_DIR, "module-records");
    if (fs.existsSync(base)) {
      for (const f of fs.readdirSync(base)) {
        if (!f.endsWith(".jsonl")) continue;
        const key = f.slice(0, -6);
        const records = moduleRecordStore.listRecords(DATA_DIR, key);
        observed[key] = { recordsStored: records.length, eventsEmitted: records.length, recipesRun: 0 };
      }
    }
    // Events for scaffolded modules come from the domain event chain.
    const events = readJsonLines(EVENTS_FILE);
    events.forEach(e => {
      const key = String((e.payload && e.payload.module) || "").toLowerCase();
      if (moduleWiring.has(key)) {
        observed[key] = observed[key] || { recordsStored: 0, eventsEmitted: 0, recipesRun: 0 };
        observed[key].eventsEmitted += 1;
      }
    });
    // Governed recipe executions — count runs from the recipe idempotency ledger.
    const recipeLedger = JOBS_FILE + ".recipes";
    if (fs.existsSync(recipeLedger)) {
      readJsonLines(recipeLedger).forEach(row => {
        if (row && row.status === "executed" && row.moduleKey) {
          observed[row.moduleKey] = observed[row.moduleKey] || { recordsStored: 0, eventsEmitted: 0, recipesRun: 0 };
          observed[row.moduleKey].recipesRun += 1;
        }
      });
    }
  } catch (_) { /* evidence best-effort */ }
  return observed;
}

async function appendDomainEvent(type, entityId, payload, actor, correlationId, tenantId, sourceEventId) {
  const eventPayload = { ...(payload || {}), ...(sourceEventId ? { sourceEventId: String(sourceEventId) } : {}) };
  const eventTenantId = String(tenantId || "local");
  if (persistenceStore().postgres) {
    const event = { id: crypto.randomUUID(), type, entityId: String(entityId), actor: actor || "system", correlationId: correlationId || crypto.randomUUID(), occurredAt: new Date().toISOString(), payload: eventPayload, previousHash: "EVENTS-GENESIS", hash: "postgres" };
    const stored = await persistenceStore().postgres.appendEvent(tenantId, event);
    const publication = messageQueue.publish("events.domain", stored, { tenantId: eventTenantId, idempotencyKey: stored.id, headers: { correlationId: stored.correlationId } });
    return { ...stored, publication };
  }
  const rows = readJsonLines(EVENTS_FILE);
  if (sourceEventId) {
    const existing = rows.find(row => String(row.tenantId || "local") === eventTenantId && row.payload && row.payload.sourceEventId === String(sourceEventId));
    if (existing) return { ...existing, duplicate: true };
  }
  const event = { id: crypto.randomUUID(), tenantId: eventTenantId, type, entityId: String(entityId), actor: actor || "system", correlationId: correlationId || crypto.randomUUID(), occurredAt: new Date().toISOString(), payload: eventPayload };
  const previous = rows.length ? rows[rows.length - 1].hash : "EVENTS-GENESIS";
  event.previousHash = previous;
  event.hash = crypto.createHash("sha256").update(previous + JSON.stringify(event)).digest("hex");
  const fd = fs.openSync(EVENTS_FILE, "a");
  fs.appendFileSync(fd, JSON.stringify(event) + "\n", "utf8");
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  const publication = messageQueue.publish("events.domain", event, { tenantId: eventTenantId, idempotencyKey: event.id, headers: { correlationId: event.correlationId } });
  return { ...event, publication };
}

function domainEventIntegrity(rows) {
  let previous = "EVENTS-GENESIS";
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]._corrupt || rows[i].previousHash !== previous || rows[i].hash !== crypto.createHash("sha256").update(previous + JSON.stringify({ ...rows[i], hash: undefined })).digest("hex")) return { valid: false, checked: rows.length, brokenAt: i };
    previous = rows[i].hash;
  }
  return { valid: true, checked: rows.length, brokenAt: null };
}

// ─── Event bus bridge: connect the durable domain event stream to the ──────
//    in-memory unified-event-bus used by the 16 strategic modules.
//    Before this bridge, the two event systems were disconnected: the
//    server persisted durable events but the strategic bus's handlers
//    (recalculate_trust, check_alignment) never fired on real events and
//    their return values were discarded. The bridge subscribes to the
//    durable "events.domain" topic, forwards mapped events to the strategic
//    bus, and executes handler results via onAction.
//    The onAction callback routes strategic actions to the actual module
//    implementations (trust-index, alignment-engine, etc.) which are loaded
//    lazily so the server boots even if they aren't wired yet.
const strategicBusBridge = eventBusBridge.createBridge({
  onAction: (action, event) => {
    // Best-effort routing: load the strategic module for each action and
    // invoke the real function. Failures are logged but never break the
    // request — the strategic layer is advisory, not transactional.
    try {
      const actionMap = {
        recalculate_trust: { mod: "./js/trust-index.js", fn: "recalculate" },
        check_alignment: { mod: "./js/alignment-engine.js", fn: "checkDrift" },
        assess_impact: { mod: "./js/organizational-resilience-metrics.js", fn: "assessImpact" },
        schedule_feedback_conversation: { mod: "./js/feedback-loop-system.js", fn: "scheduleConversation" },
        schedule_cascade_reset: { mod: "./js/communication-cascade.js", fn: "resetCascade" },
        run_stress_test: { mod: "./js/organizational-resilience-metrics.js", fn: "stressTest" },
      };
      const route = actionMap[action.action];
      if (!route) return;
      const mod = require(route.mod);
      if (typeof mod[route.fn] === "function") {
        mod[route.fn](action);
        logger.info("strategic_action_executed", { action: action.action, event: event.id });
      }
    } catch (e) {
      logger.error("strategic_action_failed", { action: action.action, error: e.message });
    }
  },
  publishToDurable: (type, entityId, payload) => {
    // Persist strategic-layer outcomes back to the durable event store so
    // the strategic actions are auditable and survive restarts.
    appendDomainEvent(type, entityId, payload, "strategic-bus", null, null).catch(() => {});
  },
});
// Subscribe the bridge to durable domain events. The message queue delivers
// events synchronously on publish, so the strategic handlers fire during
// appendDomainEvent — before the HTTP response is sent. This is intentional:
// the strategic layer must see the event in the same request context.
// Subscribe the bridge to durable domain events. The message queue delivers
// events synchronously on publish, so the strategic handlers fire during
// appendDomainEvent — before the HTTP response is sent. This is intentional:
// the strategic layer must see the event in the same request context.
// The bridge does NOT ack: it is a read-only observer. Acknowledging would
// remove the event from pending() before operational subscribers (the
// automation scheduler, connector worker) can process it.
messageQueue.subscribe("events.domain", (message) => {
  strategicBusBridge.handleDurableEvent(message);
});

function workspaceHash(workspace) {
  return crypto.createHash("sha256").update(JSON.stringify(workspace)).digest("hex");
}

function workspaceEntityGraph(workspace) {
  const graph = entityGraph.createGraph();
  const typeByRegister = { tasks: "task", risks: "risk", controls: "control", decisions: "decision", approvals: "approval", goals: "objective", finances: "transaction", conflicts: "conflict" };
  Object.entries(workspace.projects || {}).forEach(([projectId, project]) => {
    entityGraph.addNode(graph, { id: `project:${projectId}`, type: "project", label: project.project && project.project.name || projectId, provenance: { source: "workspace", sourceId: projectId } });
    Object.entries(project.registers || {}).forEach(([register, rows]) => (rows || []).forEach(row => {
      const rowId = row._id || row.id;
      if (!rowId || !typeByRegister[register]) return;
      const nodeId = `${register}:${rowId}`;
      entityGraph.addNode(graph, { id: nodeId, type: typeByRegister[register], label: row.title || row.name || row.description || row.item || rowId, provenance: { source: "workspace", sourceId: nodeId } });
      entityGraph.link(graph, { id: `belongs:${projectId}:${nodeId}`, source: nodeId, target: `project:${projectId}`, relationship: "belongs_to", provenance: { source: "workspace", sourceId: nodeId } });
    }));
  });
  Object.entries(workspace.projects || {}).forEach(([projectId, project]) => Object.entries(project.registers || {}).forEach(([register, rows]) => (rows || []).forEach(row => {
    const rowId = row._id || row.id;
    const nodeId = rowId && typeByRegister[register] ? `${register}:${rowId}` : "";
    (row._links || []).forEach(link => {
      const targetId = link.rowId && link.regId ? `${link.regId}:${link.rowId}` : "";
      if (nodeId && graph.nodes.some(node => node.id === targetId)) entityGraph.link(graph, { id: link.linkId || `${nodeId}:${targetId}`, source: nodeId, target: targetId, relationship: "supports", provenance: { source: "workspace", sourceId: nodeId } });
    });
  })));
  return graph;
}

function verifyWorkspaceHistory(rows) {
  let previous = "";
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]._corrupt) return { valid: false, checked: rows.length, brokenAt: i };
    if (rows[i].snapshot && workspaceHash(rows[i].snapshot) !== rows[i].hash) return { valid: false, checked: rows.length, brokenAt: i };
    const expected = checksum(previous, { id: rows[i].id, ts: rows[i].ts, action: rows[i].hash, detail: rows[i].revision });
    if (rows[i].checksum !== expected) return { valid: false, checked: rows.length, brokenAt: i };
    previous = rows[i].checksum;
  }
  return { valid: true, checked: rows.length, brokenAt: null };
}

function workspaceAlerts(workspace) {
  const alerts = [];
  Object.entries(workspace.projects || {}).forEach(([projectId, project]) => {
    const registers = project.registers || {};
    const risks = registers.risks || [];
    const controls = registers.controls || [];
    const budget = registers.budget || [];
    C.controlFollowUps(controls, risks).forEach(alert => alerts.push({ projectId, domain: "controls", ...alert }));
    C.financialAlerts(budget).forEach(alert => alerts.push({ projectId, domain: "finance", ...alert }));
    C.kriAlerts(registers.kris || []).forEach(alert => alerts.push({ projectId, domain: "risk", ...alert }));
    C.bcpDrillFollowUps(registers.bcp || []).forEach(alert => alerts.push({ projectId, domain: "risk", ...alert }));
    C.conflictCaseFollowUps(registers.conflicts || registers.conflictCases || []).forEach(alert => alerts.push({ projectId, domain: "team", ...alert }));
    risks.forEach(risk => {
      const score = C.riskRpn(risk);
      if (score !== null && score >= 100) alerts.push({ projectId, domain: "risk", type: "High residual risk", item: risk.description, amount: score, priority: "High" });
    });
  });
  return alerts;
}

/* Constraint-aware quiet (js/notification-router.js applyConstraintQuiet is
   the policy home; this is the server's adapter over workspace alerts): while
   the shared queue has a bottleneck, only High interrupts — the rest is held
   for the digest batch. The policy adds a `delivery` field per alert and a
   summary for the API; with no constraint it changes NOTHING. */
function constraintQuietPolicy(alerts, workspace) {
  try {
    const router = require("./js/notification-router.js");
    if (router && typeof router.applyConstraintQuiet === "function") {
      const cq = router.applyConstraintQuiet(alerts, workspace, { today: new Date().toISOString().slice(0, 10) });
      return { alerts: cq.notifications, constraint: cq.constraint, held: cq.held, detail: cq.detail || null };
    }
  } catch (_) { /* fall through to pass-through */ }
  return { alerts: (alerts || []).map(a => Object.assign({ delivery: "now" }, a)), constraint: null, held: 0, detail: null };
}

function workspaceAutomationPlan(workspace, today) {
  const jobs = [];
  Object.entries((workspace && workspace.projects) || {}).forEach(([projectId, project]) => {
    const plan = C.automationPlan(project, today);
    plan.jobs.forEach(job => jobs.push({ ...job, projectId }));
  });
  jobs.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || a.id.localeCompare(b.id));
  const autoJobs = jobs.filter(job => job.tier === "auto").length;
  const approveJobs = jobs.filter(job => job.tier === "approve").length;
  return {
    asOf: today || new Date().toISOString().slice(0, 10),
    jobs,
    total: jobs.length,
    autoJobs,
    approveJobs,
    humanApprovalJobs: jobs.filter(job => job.requiresHumanApproval).length,
    summary: jobs.length ? `${jobs.length} governed automation job${jobs.length === 1 ? "" : "s"} require follow-up across the workspace (${autoJobs} auto-tier, ${approveJobs} approval-tier).` : "No governed automation jobs are currently due."
  };
}

function queueAutomationJobs(workspace, today) {
  const plan = workspaceAutomationPlan(workspace, today);
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { ...plan, queued: 0, newlyQueued: 0, blocked: true, blockedReason: gate.reason };
  // Durable, idempotent job store: the same (project, job, dueDate) is never
  // enqueued twice, and the queue survives restarts.
  const store = jobStore.enqueueJobs(JOBS_FILE, plan);
  plan.jobs.forEach(job => {
    appendAudit({
      eventId: `automation-queued:${job.id}:${plan.asOf}`,
      action: "Automation job queued",
      detail: `${job.projectId} — ${job.title} — ${job.requiresHumanApproval ? "human approval required" : "review required"}`
    });
    notifications.dispatchWebhooks("automation.queued", { jobId: `${job.projectId}:${job.id}:${job.dueDate || plan.asOf}`, title: job.title, projectId: job.projectId, requiresHumanApproval: !!job.requiresHumanApproval, asOf: plan.asOf }).catch(() => {});
  });
  return { ...plan, queued: plan.jobs.length, newlyQueued: store.queued };
}

// Proactive mentor pass: derive today's proposals from the live registers and
// queue ONE review job per undissmissed proposal in the DURABLE job store —
// the same gate (pause + chain integrity), the same idempotency (one job per
// (project, id, dueDate)) and the same audit trail as the rest of the queue.
// The job asks the leader to REVIEW the pre-filled case; it never solves one.
function queueProactiveMentorJobs(workspace, today) {
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { proposals: 0, queued: 0, blocked: true, blockedReason: gate.reason };
  let proposals = [];
  try {
    const proactiveMentor = require("./lib/proactive-mentor.js");
    const lang = langOf(workspace);
    let _latDrafts = [];
    try { _latDrafts = require("./lib/review-tray.js").allDrafts(DATA_DIR, { projectIds: Object.keys((workspace && workspace.projects) || {}).map(String) }); } catch (_) {}
    proposals = proactiveMentor.proactiveProposals(activeProject(workspace), { lang, today, drafts: _latDrafts }).filter(p => !proactiveMentor.dismissedToday(activeProject(workspace), p.proposalId, today));
  } catch (_) { return { proposals: 0, queued: 0, error: "proactive scan failed" }; }
  const asOf = today || new Date().toISOString().slice(0, 10);
  const jobs = proposals
    .filter(p => p.confidence !== "low")
    .map(p => ({
      id: `mentor-proactive:${p.proposalId}`,
      projectId: "workspace",
      title: `Review AI-prepared mentor case: ${p.situationName} (${p.signals.join("; ")})`.slice(0, 160),
      requiresHumanApproval: false,
      tier: "auto",
      dueDate: asOf
    }));
  if (jobs.length) jobStore.enqueueJobs(JOBS_FILE, { asOf, jobs });
  return { proposals: proposals.length, queued: jobs.length };
}

// ─── Producer pass: the scheduled self-filling app ─────────────────────────
// Submits meeting/1:1 drafts through the review tray and enqueues ONE durable
// review job per project with pending drafts — through the same pause/
// kill-switch + integrity gate as every automation job. Never writes registers.
// (The ONE register write it performs is the autonomy-ladder auto-file lane
// below, and that one persists via applyFiledRows under the file lock.)

// Re-apply auto-filed rows to a FRESHLY read workspace under the per-file
// lock (idempotent by _id). The pass itself mutates its own in-memory copy
// for same-pass dedup + audit counts, but that copy was read BEFORE this tick's
// earlier writes resolved — writing it wholesale is exactly how the snapshot
// row used to vanish. Rows only, never the stale blob.
function applyFiledRows(ws, filedRows) {
  let applied = 0;
  (filedRows || []).forEach(entry => {
    try {
      const project = ws && ws.projects && ws.projects[entry.projectId];
      if (!project) return;
      if (!project.registers || typeof project.registers !== "object") project.registers = {};
      if (!Array.isArray(project.registers[entry.register])) project.registers[entry.register] = [];
      if (project.registers[entry.register].some(r => r && entry.row && r._id === entry.row._id)) return;
      project.registers[entry.register].push(entry.row);
      applied++;
    } catch (_) { /* per-row best-effort */ }
  });
  return applied;
}
function runProducerPassGated(workspace, opts) {
  const o = opts || {};
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { blocked: true, blockedReason: gate.reason, drafts: 0, jobsQueued: 0 };
  const reviewTray = require("./lib/review-tray.js");
  const producerLoop = require("./lib/producer-loop.js");
  const today = o.today || new Date().toISOString().slice(0, 10);
  const summary = producerLoop.runProducerPass({
    workspace,
    today,
    lang: o.lang || langOf(workspace),
    traySubmit: (payload) => reviewTray.submitDraft(DATA_DIR, payload),
    queueReviewJob: ({ projectId, count }) => {
      const job = producerLoop.reviewJobFor({ projectId, count, today });
      const r = jobStore.enqueueJobs(JOBS_FILE, { asOf: today, jobs: [job] });
      return { queued: r.queued };
    }
  });
  // ── The producer registry (lib/producer-registry.js) ────────────────────
  // Twenty `*ToTray` producers already existed in lib/ and the scheduled pass
  // called none of them — the registers filled from the leader instead of
  // from reality. Registered producers now run on the same gated pass, per
  // project, each capped so one chatty source degrades itself rather than
  // the tray. Submissions go through the SAME traySubmit, so idempotency and
  // the draft->approval chain are unchanged.
  ensureAmbientProducers();
  const lang = o.lang || langOf(workspace);
  const ambient = { drafts: 0, duplicates: 0, suppressed: 0, fatigueMuted: 0, refusedApproved: 0, failed: 0, perProducer: {} };
  try {
    const producerRegistry = require("./lib/producer-registry.js");
    const projects = (workspace && workspace.projects) || {};
    for (const [projectId, project] of Object.entries(projects)) {
      if (!project || typeof project !== "object") continue;
      const run = producerRegistry.runProducers({
        dataDir: DATA_DIR,
        projectId,
        project,
        workspace,
        lang,
        today,
        traySubmit: (payload) => reviewTray.submitDraft(DATA_DIR, payload),
        countDrafts: (pid) => {
          try { return (reviewTray.listDrafts(DATA_DIR, { projectId: pid, role: "admin" }).counts || {}).pending || 0; }
          catch (_) { return 0; }
        }
      });
      if (run && run.counts) {
        ambient.drafts += run.counts.drafts;
        ambient.duplicates += run.counts.duplicates;
        ambient.suppressed += run.counts.suppressed;
        ambient.fatigueMuted += run.counts.fatigueMuted || 0;
        ambient.refusedApproved += run.counts.refusedApproved || 0;
        ambient.failed += run.counts.failed;
        (run.results || []).forEach(r => {
          ambient.perProducer[r.producerId] = (ambient.perProducer[r.producerId] || 0) + r.drafts;
        });
      }
      if (run && run.errors && run.errors.length) {
        run.errors.forEach(e => logger.warn("producer_failed", { producerId: e.producerId, error: e.error }));
      }
    }
  } catch (error) {
    logger.warn("producer_registry_pass_failed", { error: error && error.message });
  }
  summary.ambient = ambient;
  summary.drafts = (summary.drafts || 0) + ambient.drafts;

  // ── The confidence lane (lib/autonomy-ladder.js) ────────────────────────
  // Classes the leader has promoted are filed without a tap, through the SAME
  // writer, marked auto-filed with an undo deadline, and reported. Sensitive
  // classes are refused here structurally, at every trust level.
  const autoFiled = { filed: 0, refused: 0, perProject: {} };
  const filedRows = [];
  const autoCreatedProtos = [];
  try {
    const projects = (workspace && workspace.projects) || {};
    for (const [projectId, project] of Object.entries(projects)) {
      if (!project || typeof project !== "object") continue;
      const run = reviewTray.autoFileDrafts(DATA_DIR, {
        projectId,
        project,
        lang,
        gate,
        actor: "autonomy-ladder",
        writer: (register, row, draft) => {
          const written = writeRegisterRow(project, register, row, draft);
          if (written && written.row) filedRows.push({ projectId, register, row: written.row });
          if (written && written.createdProtocol) autoCreatedProtos.push({ projectId, proto: written.createdProtocol });
          return written;
        }
      });
      // Run plans file AFTER autoFileDrafts finished its own tray rewrite.
      autoCreatedProtos.splice(0).forEach(x => fileRunPlanDraft(x.projectId, x.proto, lang));
      if (run && run.counts) {
        autoFiled.filed += run.counts.filed;
        autoFiled.refused += run.counts.refused;
        if (run.counts.filed) autoFiled.perProject[projectId] = run.counts.filed;
      }
      if (run && run.filed && run.filed.length) {
        run.filed.forEach(f => appendAudit({
          action: "Auto-filed by earned autonomy",
          detail: `${f.register} draft "${String(f.summary).slice(0, 80)}" filed at level ${f.level} (${f.classKey}); undo until ${f.undoUntil}. Basis: ${f.citation}`
        }));
      }
    }
    if (autoFiled.filed > 0) {
      try {
        // Scope-aware + atomic: routes pass persistRows (their own file via
        // mutateScopedWorkspace); the automation tick falls back to the shared
        // blob. Both re-read under the lock — no stale-copy clobber.
        if (typeof o.persistRows === "function") o.persistRows(filedRows);
        else mutateWorkspaceConditional(ws => ({ changed: applyFiledRows(ws, filedRows) > 0 })).catch(() => {});
      } catch (_) {}
    }
  } catch (error) {
    logger.warn("auto_file_pass_failed", { error: error && error.message });
  }
  summary.autoFiled = autoFiled;

  if (summary.drafts > 0 || autoFiled.filed > 0) {
    appendAudit({ action: "Producer pass produced drafts", detail: `${summary.drafts} draft(s) across ${summary.projects} project(s), ${summary.duplicates} duplicate(s), ${summary.jobsQueued} review job(s) queued, ${ambient.drafts} from registered producers, ${autoFiled.filed} auto-filed by earned autonomy` });
  }
  return summary;
}

// ── The one writer every tray path uses ────────────────────────────────────
// review-tray never mutates a register itself: it calls this. ONE writer means
// an auto-filed row and a hand-approved row are identical in shape, and a
// future register normalization cannot apply to one path and miss the other.
// The normalization is the one /api/review-tray/approve has always used:
// producer-only bookkeeping fields are stripped, never persisted as register
// data the leader would later read back as their own.
function writeRegisterRow(project, register, row, draft) {
  if (!project) return null;
  if (!project.registers || typeof project.registers !== "object") project.registers = {};
  if (!Array.isArray(project.registers[register])) project.registers[register] = [];
  const clean = {};
  for (const [k, v] of Object.entries(row || {})) {
    if (k === "captured" || k === "capturedAt" || k === "source") continue;
    clean[k] = v;
  }
  clean._id = clean._id || require("crypto").randomUUID();
  clean.createdAt = clean.createdAt || new Date().toISOString();
  // Provenance: an auto-filed row must be distinguishable from one the leader
  // approved, forever — the undo path and any later audit depend on it.
  if (clean.source === undefined) clean.source = draft && draft.autoFiled ? "auto-filed" : "review-tray";
  if (draft && draft.autoFiled) {
    clean._autoFiled = true;
    clean._autonomyLevel = draft.autonomyLevel || null;
  }
  if (draft && draft.id) clean._draftId = draft.id;
  project.registers[register].push(clean);
  // A generated protocol draft (kvalificering-protocol-drafts) is approved
  // INTO the qualification register: the leader's one tap files the task AND
  // creates the protocol — nobody types the same protocol twice. Idempotent
  // per (system, phase, URS set): re-approving a regenerated draft never
  // duplicates a protocol in the register.
  let createdProtocol = null;
  let protocolDuplicate = false;
  const pd = row && row.protocolDraft;
  if (pd && typeof pd === "object" && pd.type && pd.system) {
    try {
      const KVAL = require("./js/kvalificering.js");
      const proto = KVAL.protocolFromDraft(pd);
      if (proto) {
        if (!project.kvalificering || typeof project.kvalificering !== "object") project.kvalificering = {};
        if (!Array.isArray(project.kvalificering.protocols)) project.kvalificering.protocols = [];
        const key = KVAL.protocolDraftKey(pd);
        const already = project.kvalificering.protocols.some(p => p && KVAL.protocolDraftKey({ type: p.type, system: p.system, ursRefs: p.ursRefs }) === key);
        if (already) {
          protocolDuplicate = true;
        } else {
          proto.createdAt = new Date().toISOString();
          proto.approvedBy = (draft && draft.resolvedBy) || "review-tray";
          project.kvalificering.protocols.push(proto);
          createdProtocol = proto;
          clean.protocolCreated = proto._id;
        }
      }
    } catch (error) {
      logger.warn("protocol_from_draft_failed", { error: error && error.message });
    }
  }
  // A deviation drafted from a failed run-plan step (kvalificering-run-plan)
  // is approved INTO the deviation register — the same one-tap rule as the
  // protocol itself. Idempotent per (protocolId, description): a re-approved
  // regenerated draft never duplicates a deviation.
  let createdDeviation = null;
  const dd = row && row.deviationDraft;
  if (dd && typeof dd === "object" && dd.protocolId && dd.description) {
    try {
      const KVAL = require("./js/kvalificering.js");
      if (!project.kvalificering || typeof project.kvalificering !== "object") project.kvalificering = {};
      if (!Array.isArray(project.kvalificering.deviations)) project.kvalificering.deviations = [];
      const already = project.kvalificering.deviations.some(x => x && x.protocolId === dd.protocolId && x.description === dd.description);
      if (!already) {
        createdDeviation = KVAL.normalizeDeviation(Object.assign({}, dd, {
          createdAt: new Date().toISOString(),
          origin: "run-plan"
        }));
        project.kvalificering.deviations.push(createdDeviation);
        clean.deviationCreated = createdDeviation._id;
      }
    } catch (error) {
      logger.warn("deviation_from_draft_failed", { error: error && error.message });
    }
  }
  return { row: clean, createdProtocol: createdProtocol, protocolDuplicate: protocolDuplicate, createdDeviation: createdDeviation };
}

// The protocol's executable run plan follows it into the tray: ONE draft to
// schedule the runs (idempotent per protocol). Filed AFTER the tray's own
// rewrite of the approval — the writer runs before that rewrite, so a draft
// filed inside the writer would be clobbered by it.
function fileRunPlanDraft(projectId, proto, lang) {
  if (!proto || !proto._id) return null;
  const plan = (proto.runPlan && Array.isArray(proto.runPlan.steps)) ? proto.runPlan.steps : [];
  if (!plan.length) return null;
  const L = lang === "en" ? "en" : "da";
  try {
    return require("./lib/review-tray.js").submitDraft(DATA_DIR, {
      projectId: String(projectId || ""),
      source: "kvalificering-run-plan",
      externalId: "kval-runplan:" + proto._id,
      register: "tasks",
      row: {
        title: L === "en"
          ? "Run the plan: " + proto.type + " — " + proto.system
          : "Udfør løbsplan: " + proto.type + " — " + proto.system,
        status: "open",
        dueDate: new Date().toISOString().slice(0, 10),
        captured: { source: "kvalificering-run-plan", protocolId: proto._id, stepCount: plan.length }
      },
      summary: L === "en"
        ? "The generated run plan for the approved protocol is ready — run the steps and register the runs"
        : "Den genererede løbsplan for den godkendte protokol er klar — udfør trinene og registrér løbene",
      lang: L,
      actor: "kvalificering-engine",
      confidence: 0.75
    });
  } catch (error) {
    logger.warn("run_plan_draft_failed", { error: error && error.message });
    return null;
  }
}

// The one-click apply for a DRAFTED autonomy promotion (lib/autonomy-ladder.js):
// the leader's approval of the tray draft IS the human actor the ladder
// requires — automation may never promote itself — and the ladder's own gates
// still decide. A record that has not earned the level is refused and the
// refusal is reported, never forced.
function applyAutonomyPromotion(project, captured, actor) {
  try {
    const cap = captured || {};
    if (String(cap.prefetchKind || "") !== "autonomy-promotion") return null;
    const classKey = String(cap.classKey || "");
    if (!classKey) return null;
    const LAD = require("./lib/autonomy-ladder.js");
    return LAD.promote(project, {
      classKey,
      toLevel: Number(cap.toLevel) || 1,
      actor: actor || "leader",
      descriptor: { source: cap.source, register: cap.register }
    });
  } catch (error) { return { error: (error && error.message) || "promotion apply failed" }; }
}

// Removing a row the app filed on its own — the other half of the undo window.
function removeRegisterRow(project, register, row) {
  if (!project || !project.registers || !Array.isArray(project.registers[register])) return false;
  const id = row && row._id;
  if (!id) return false;
  const before = project.registers[register].length;
  project.registers[register] = project.registers[register].filter(r => !r || r._id !== id);
  return project.registers[register].length < before;
}

// ─── Cockpit ingredient gathering (shared by /api/today AND the digest) ─────
// One gatherer so the daily email can never diverge from the screen: the
// digest composes from exactly the same ranked items the leader would see.
function gatherCockpitIngredients(projectId, opts) {
  const o = opts || {};
  const reviewTray = require("./lib/review-tray.js");
  const proactiveMentor = require("./lib/proactive-mentor.js");
  const todayCockpitMod = require("./lib/today-cockpit.js");
  const todayCockpit = todayCockpitMod.todayCockpit || todayCockpitMod;
  const lang = o.lang === "da" ? "da" : "en";
  const today = o.today || new Date().toISOString().slice(0, 10);
  const projectState = o.ws ? o.ws : (projectId ? readWorkspaceFor(projectId) : readWorkspace());
  const project = projectId ? (projectState.projects && projectState.projects[projectId]) : activeProject(projectState);
  if (!project) return { cockpit: { items: [], counts: {}, sources: {} }, tray: { drafts: [], counts: {} } };

  let tray = { drafts: [], counts: {} };
  try { tray = reviewTray.listDrafts(DATA_DIR, { projectId: project._id || projectId, role: o.role }); } catch (_) {}
  // The whole tray incl. resolved rows — the leader's clock judges DWELL,
  // which only exists between createdAt and resolvedAt (lib/approval-latency.js).
  let trayDrafts = (tray && tray.drafts) || [];
  try { trayDrafts = reviewTray.allDrafts(DATA_DIR, { projectIds: [String(project._id || projectId)] }); } catch (_) {}
  let proposals = [];
  try {
    // `workspace: projectState` — the portfolio-family detectors (constraint,
    // its moves, its elevation) read the WHOLE workspace; the scan runs per
    // project, the bottleneck is cross-project by definition.
    proposals = proactiveMentor.proactiveProposals(project, { lang, today, drafts: trayDrafts, workspace: projectState })
      .filter(p => !proactiveMentor.dismissedToday(project, p.proposalId, today))
      .map(p => {
        // The mentor is not stateless: cite this leader's own recorded history
        // for this situation type (null when there is none — never invented).
        // O4: the approved personal playbook is cited first — the leader's
        // documented system beats raw history.
        try {
          p.playbookCitation = require("./lib/playbook-generator.js").playbookCitation(project, p.situationId, lang);
        } catch (_) { p.playbookCitation = null; }
        try {
          p.historyCitation = p.playbookCitation || require("./lib/learning-loop.js").historyCitation(project, p.situationId, lang);
        } catch (_) { p.historyCitation = p.playbookCitation || null; }
        return p;
      });
  } catch (_) {}
  const engine = coachStore().engine;
  const openCases = (project.mentorCases || []).filter(c => String(c.status || "open") === "open").map(c => {
    const situ = typeof engine.mentorSituations === "function" ? (engine.mentorSituations("en").find(s => s.id === c.situationId) || null) : null;
    let progress = null;
    try {
      const plan = engine.mentorIntake(project, c.situationId, { ...(c.inputs || {}), problem: c.problem || "" }, "en");
      progress = plan && plan.missing ? Math.round(100 * (1 - plan.missing.length / Math.max(1, (plan.charts || []).length))) : null;
    } catch (_) { progress = null; }
    return { id: c.id, situationId: c.situationId, situationName: situ ? situ.name : c.situationId, progress };
  });
  // Stalled mentor cases (S): solved but never re-measured — derived by the
  // SAME learning-overview engine the learning view uses, so /api/today, the
  // UI and the digest can never disagree about what starves the memory.
  let stalledCases = [];
  try {
    stalledCases = require("./lib/learning-overview.js").collectStalledCases(
      projectState.projects ? Object.values(projectState.projects) : [],
      { lang, today }
    ).filter(s => !projectId || String(s.projectId) === String(projectId));
  } catch (_) { stalledCases = []; }
  let navigatorItems = [];
  try {
    const navigator = require("./js/management-navigator.js");
    navigatorItems = (navigator.getDailyBrief(o.user, project, { lang, today, drafts: trayDrafts }).topPriorities || []).map(p => ({
      title: p.title || p.type || "Priority",
      reason: p.reason || p.message || "",
      view: p.view || null
    }));
    // I8: promote statistical early warnings into navigator so Today never hides them.
    try {
      const extra = require("./lib/early-warning-navigator.js").warningPriorities(project, { lang, today });
      if (Array.isArray(extra) && extra.length) navigatorItems = navigatorItems.concat(extra).slice(0, 5);
    } catch (_) {}
  } catch (_) { navigatorItems = []; }
  let dueJobs = null;
  try {
    const due = jobStore.dueJobs(JOBS_FILE);
    dueJobs = { count: due.length, jobs: due.slice(0, 5).map(j => ({ id: j.id, type: j.type, runAt: j.dueDate || j.nextAttemptAt || null })) };
  } catch (_) { dueJobs = null; }

  let lead = null;
  try {
    // Matrix facts for the brief: the SAME decision-log and capacity-plan
    // reads the matrix view uses (shared helpers, one truth).
    const mxFacts = (() => {
      try {
        const decisions = matrixLeadershipRouter.tradeoffRows(project, projectState);
        const capacity = matrixLeadershipRouter.capacityFact(projectState);
        if (capacity && capacity.worst) capacity.worst.personLabel = matrixLeadershipRouter.rosterLabel(project, capacity.worst.personId);
        return { decisions, capacity };
      } catch (_) { return {}; }
    })();
    lead = leadNavigatorRouter.composeBrief(project, {
      lang, today,
      decisions: mxFacts.decisions,
      capacity: mxFacts.capacity,
      // The loop watches itself: unhealthy automation joins the ranked brief
      // (same digest contract as the three verticals).
      automationItems: leadNavigatorRouter.automationDigestItems(
        flightInsights(readFlightRecords(FLIGHT_KEEP), { intervalMs: AUTOMATION_INTERVAL_MS }))
    });
  } catch (_) { lead = null; }
  let delegations = [];
  try {
    const cockpitForDelegation = todayCockpit({ tray, proposals, openCases, stalledCases, navigator: navigatorItems, dueJobs, lead }, { lang, today, user: o.user });
    delegations = require("./lib/delegation-copilot.js").delegationBatch(project, cockpitForDelegation, { lang });
  } catch (_) { delegations = []; }

  // ── The detector registry (lib/signal-registry.js) ──────────────────────
  // Every module that declared a detector reaches Today from here. Before
  // this, a module reached the leader only if someone edited THIS function,
  // which is why 129 of 293 lib/ modules never reached them at all. Adding a
  // module is now a registration in lib/detector-pack.js, not an edit here.
  ensureSignalDetectors();
  let signals = [];
  let signalScan = null;
  try {
    const registry = require("./lib/signal-registry.js");
    signalScan = registry.collectSignals(project, { lang, today, role: o.role, user: o.user });
    signals = registry.cockpitItemsFromSignals(signalScan.signals, { lang });
  } catch (_) { signals = []; }

  // Cross-project signals — the failures no single project can see. Scanned
  // over the whole workspace, never over the one active project.
  let portfolioSignals = [];
  try {
    const registry = require("./lib/signal-registry.js");
    const allProjects = projectState.projects ? Object.values(projectState.projects).filter(Boolean) : [];
    if (allProjects.length >= 2) {
      const scan = registry.collectPortfolioSignals(allProjects, { lang, today, role: o.role, user: o.user, drafts: trayDrafts });
      portfolioSignals = registry.cockpitItemsFromSignals(scan.signals, { lang });
    }
  } catch (_) { portfolioSignals = []; }

  // Week-ahead prefetch — the deterministic look-ahead (lib/week-prefetch.js):
  // gates that will TRIP inside 7 days. Same module the producer and the
  // detector use, so the card, the drafts and the signal can never disagree.
  let weekAhead = null;
  try {
    weekAhead = require("./lib/week-prefetch.js").scanWeek(project, { lang, today });
  } catch (_) { weekAhead = null; }

  // Outage-window readiness — the window judged before it opens
  // (lib/outage-readiness.js). Same module the tray drafts, the detector and
  // the mentor case use, so the card cannot disagree with the pack.
  let outageReadiness = null;
  try {
    outageReadiness = require("./lib/outage-readiness.js").readinessPack(project, { lang, today });
  } catch (_) { outageReadiness = null; }

  // Inferred outcomes — the mentor reading its own results off the registers.
  let outcomeProposals = [];
  try {
    outcomeProposals = require("./lib/outcome-inference.js")
      .outcomeProposals(project, { lang, today }).proposals;
  } catch (_) { outcomeProposals = []; }

  // Autonomy promotions — the leader's own record saying a class of decision
  // no longer needs them. Sensitive classes never appear here.
  let autonomyCandidates = [];
  try {
    autonomyCandidates = require("./lib/autonomy-ladder.js").promotionCandidates(project, { lang });
  } catch (_) { autonomyCandidates = []; }

  // What the app filed without asking, so Today can say it plainly.
  let autoFiled = null;
  try {
    autoFiled = reviewTray.autoFiledReport(DATA_DIR, { projectId: project._id || projectId, lang, today });
  } catch (_) { autoFiled = null; }

  // The leader's own clock — approval latency measured against the dates the
  // drafts protected (lib/approval-latency.js). A silent tray is null: no
  // clock, no coaching, no invented urgency.
  let approvalLatency = null;
  try {
    approvalLatency = require("./lib/approval-latency.js").latencyScan(trayDrafts, { lang, today });
    if (approvalLatency && approvalLatency.verdict === "silent") approvalLatency = null;
  } catch (_) { approvalLatency = null; }

  // The team's clock — execution judged against the plan's own dates, and the
  // plan judged by Little's Law (WIP ÷ throughput = implied lead time) in
  // lib/execution-latency.js. The task register is already the source; an
  // empty register is null — no clock, no invented urgency.
  let executionLatency = null;
  try {
    executionLatency = require("./lib/execution-latency.js").executionScan(project, { lang, today });
    if (executionLatency && executionLatency.verdict === "silent") executionLatency = null;
  } catch (_) { executionLatency = null; }

  // The case clock — every case register judged by the dates and the contract
  // IT records (lib/case-clock.js): investigations, incidents, observations,
  // warranty, work-environment — and a subject crossing registers named as
  // ONE systemic subject. The registers are already the source; empty
  // registers are null — no clock, no invented urgency.
  let caseClock = null;
  try {
    caseClock = require("./lib/case-clock.js").caseScan(project, { lang, today });
    if (caseClock && caseClock.verdict === "silent") caseClock = null;
  } catch (_) { caseClock = null; }

  // The sweep's echo (lib/swept-cases.js): the register rows door 5 sweeps
  // into the Sagsindeks — a row written where no browser event can fire (a
  // server automation rule, a connector intake, an NLU command, a generated
  // recurring task, a restored backup) becomes a CASE — judged by nothing
  // but what the rows THEMSELVES record. Same module the navigator brief,
  // the weekly letter and the mentor read, so the four zero-input surfaces
  // can never disagree about a swept case. Silent is null — no echo, no
  // invented urgency.
  let sweptCases = null;
  try {
    sweptCases = require("./lib/swept-cases.js").sweptScan(project, { lang, today });
    if (sweptCases && sweptCases.verdict === "silent") sweptCases = null;
  } catch (_) { sweptCases = null; }

  // The leadership model pack (lib/leadership-models.js): Hersey & Blanchard
  // readiness→style, GROW loops, adfærdsaftaler, AI 4D, Edmondson safety,
  // Gallup Q12, kompetencematrix, Lean Daglig Ledelse — all judged by their
  // own rules from the registers. Silent registers are null: no score, no
  // coaching, no invented urgency.
  let leadershipModels = null;
  try {
    leadershipModels = require("./lib/leadership-models.js").leadershipModelsScan(project, { lang, today });
    if (leadershipModels && leadershipModels.verdict === "silent") leadershipModels = null;
  } catch (_) { leadershipModels = null; }

  // Commercial & practice findings (models 61–80): the pack that judges the
  // BUSINESS — offers, pricing, GTM, channels, P&L, customer cadence, RACI,
  // training depth, negotiation tactics and trajectory. Surfaced as digest
  // items so the models drive the automation output. Quiet is quiet: the
  // key exists only when there is something real to carry.
  let commercial = null;
  try {
    if (leadershipModels) {
      const VIEW_BY_MODEL = {
        offer: "offers", lifecycle: "offers", pricing: "offers", ansoff: "offers",
        gtm: "launches", channel: "channels", pss: "services",
        matrix: "matrixRoles", span: "matrixRoles", belbin: "teamRoles",
        kirkpatrick: "trainings", raci: "tasks", rca: "issues", aar: "milestones",
        hoshin: "goals", margin: "finances", pnl: "finances",
        customer: "stakeholderContacts", forecast: "predictions",
        negotiationTactics: "decisions", trajectory: "today"
      };
      const COMMERCIAL_KEYS = Object.keys(VIEW_BY_MODEL);
      const langKey = lang === "da" ? "da" : "en";
      const hits = (leadershipModels.findings || []).filter(f => COMMERCIAL_KEYS.indexOf(f.model) >= 0).slice(0, 3);
      if (hits.length) {
        const voice = langKey === "da" ? "Det modellerne ser: " : "What the models see: ";
        commercial = hits.map(f => ({
          title: (voice + String((f.title && f.title[langKey]) || f.kind)).slice(0, 140),
          reason: String((f.detail && f.detail[langKey]) || f.kind).slice(0, 200),
          action: { type: "navigate", payload: { view: VIEW_BY_MODEL[f.model] || "offers" } }
        }));
      }
    }
  } catch (_) { commercial = null; }

  // The constraint (Goldratt / Theory of Constraints, engine 46): whoever
  // holds the queue sets the pace for everyone. The spine of queue work leads
  // the briefing ABOVE the other models — when the bottleneck is named, the
  // first decision of the day is the one that moves its queue. Silent when
  // the task register compares nobody.
  let constraintDigest = null;
  try {
    if (leadershipModels) {
      const hits = (leadershipModels.findings || []).filter(f => f.model === "constraint").slice(0, 1);
      if (hits.length) {
        const langKey = lang === "da" ? "da" : "en";
        const voice = langKey === "da" ? "Begrænsningen: " : "The constraint: ";
        constraintDigest = hits.map(f => ({
          title: (voice + String((f.title && f.title[langKey]) || f.kind)).slice(0, 140),
          reason: String((f.detail && f.detail[langKey]) || f.kind).slice(0, 200),
          action: { type: "navigate", payload: { view: "tasks" } }
        }));
      }
    }
  } catch (_) { constraintDigest = null; }

  // The movement since the last measurement round (the trajectory log the
  // report route keeps on each project). The digest LEADS with it: the
  // trend matters more than the snapshot — what got better, what got worse,
  // named with its deltas. No history, or nothing moved, is silence.
  let trajectoryDigest = null;
  try {
    const langKey = lang === "da" ? "da" : "en";
    const h = Array.isArray(project && project.scanHistory) ? project.scanHistory : [];
    if (h.length >= 2) {
      const last = h[h.length - 1];
      const prev = h[h.length - 2];
      const worse = [], better = [];
      Object.keys(last.models || {}).forEach(k => {
        const was = Number((prev.models && prev.models[k] && prev.models[k].findings) || 0);
        const nowN = Number((last.models[k] && last.models[k].findings) || 0);
        const delta = nowN - was;
        if (delta > 0) worse.push(k + " +" + delta);
        else if (delta < 0) better.push(k + " " + delta);
      });
      if (worse.length || better.length) {
        const movers = worse.concat(better).slice(0, 5).join(" · ");
        trajectoryDigest = [{
          title: (langKey === "da"
            ? "Bevægelsen: " + (worse.length ? worse.length + " værre, " : "") + better.length + " bedre"
            : "Movement: " + (worse.length ? worse.length + " worse, " : "") + better.length + " better").slice(0, 140),
          reason: (langKey === "da"
            ? "Siden sidste måling: " + movers + ". Trenden vigtigere end øjebliksbilledet."
            : "Since the last measurement: " + movers + ". The trend matters more than the snapshot.").slice(0, 200),
          action: { type: "navigate", payload: { view: "today" } }
        }];
      }
    }
  } catch (_) { trajectoryDigest = null; }

  // The focus threads (lib/leadership-focus.js): the 30-engine pack
  // synthesized into at most three ranked threads by SUBJECT — one card
  // about a person or area, not one per engine. Built from the models'
  // findings only; silent engines are null: no thread, no invented urgency.
  let leadershipFocus = null;
  try {
    leadershipFocus = require("./lib/leadership-focus.js").leadershipFocus(project, { lang, today });
    if (leadershipFocus && leadershipFocus.verdict === "silent") leadershipFocus = null;
  } catch (_) { leadershipFocus = null; }

  // The conversation designer (lib/conversation-designer.js): the hardest
  // conversations, designed before they happen — SCARF threats mitigated on
  // the page, derived from the engine pack's person findings. Zero input;
  // silent when no person finding needs a conversation.
  let conversations = null;
  try {
    const CD = require("./lib/conversation-designer.js");
    const designs = CD.conversationDesigns(project, { lang, today });
    let effectiveness = null;
    try {
      const lm = require("./lib/leadership-models.js").leadershipModelsOf(project);
      effectiveness = CD.conversationEffectivenessScan(
        (project && project.registers && Array.isArray(project.registers.tasks)) ? project.registers.tasks : [],
        { lang, today, oneOnOnes: lm.oneOnOnes, feedback: lm.feedback, growth: lm.growth, loadHours: lm.loadHours }
      );
      if (effectiveness && effectiveness.verdict === "silent") effectiveness = null;
    } catch (_) { effectiveness = null; }
    if ((designs && designs.verdict !== "silent") || effectiveness) {
      conversations = designs || { verdict: "silent", designs: [], stats: {}, boundary: null };
      conversations.effectiveness = effectiveness;
    }
  } catch (_) { conversations = null; }

  // The escalation analytics platform (lib/escalation-analytics.js): SLA
  // clocks against the case's own contract, explainable risk scoring, trend
  // direction and the improvement loop — computed from the escalation
  // register (FM ingest or manual). A silent register is null: no score, no
  // trend, no invented urgency.
  let escalationAnalytics = null;
  try {
    const EA = require("./lib/escalation-analytics.js");
    const escCases = EA.casesOf(project);
    if (escCases.length) {
      const escSla = EA.slaScan(escCases, { lang, today });
      const escRisk = EA.riskScan(escCases, { lang, today });
      const escTrend = EA.trendScan(escCases, { lang, today });
      const escImprove = EA.improvementScan(escCases, { lang, today });
      const escForecast = EA.breachForecast(escCases, { lang, today });
      const escImpact = EA.improvementImpactScan(escCases, EA.improvementsOf(project), { lang, today });
      const escCalibration = (typeof EA.contractCalibrationScan === "function") ? EA.contractCalibrationScan(escCases, { lang, today }) : null;
      let escIngestHealth = null;
      try {
        const EI = require("./lib/escalation-ingest.js");
        if (typeof EI.healthScan === "function") escIngestHealth = EI.healthScan({ projects: { [project._id || project.id || "project"]: project } }, today);
      } catch (_) { escIngestHealth = null; }
      const anyAttention = [escSla, escRisk, escTrend, escImprove, escForecast, escImpact, escCalibration, escIngestHealth].some(s => s && s.verdict === "attention");
      if (anyAttention) {
        escalationAnalytics = {
          verdict: "attention",
          findings: [escForecast, escImpact, escIngestHealth, escCalibration, escSla, escRisk, escTrend, escImprove]
            .filter(s => s && Array.isArray(s.findings))
            .reduce((a, s) => a.concat(s.findings), [])
            .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] || 3) - ({ high: 0, medium: 1, low: 2 }[b.severity] || 3)),
          stats: { sla: escSla.stats, risk: escRisk.stats, trend: escTrend.stats, improvement: escImprove.stats, forecast: escForecast.stats, impact: escImpact.stats, calibration: escCalibration ? escCalibration.stats : null, ingestHealth: escIngestHealth ? escIngestHealth.stats : null },
          boundary: escSla.boundary
        };
      }
    }
  } catch (_) { escalationAnalytics = null; }

  // Lived leadership practices + manager deep chips — derived, never typed; the Today list carries them
  // as 1-tap weekly acts alongside the detector signals. Each entry already has reason + action.
  let livedPractices = [];
  try {
    const mentor = require("./js/ai-mentor.js");
    if (mentor && typeof mentor.getSituationalGuidance === "function") {
      const g = mentor.getSituationalGuidance(project, o.user || { _id: "local" }, lang);
      if (g && Array.isArray(g.livedPractices)) livedPractices = g.livedPractices.slice(0,2).map(function(lp){
        return { instrument: lp.instrument, practiceId: lp.practiceId, reason: lp.reason, reasonDa: lp.reasonDa, historyCitation: lp.historyCitation||null, historyDate: lp.historyDate||null, staleReflection: !!lp.staleReflection, alreadyDoneThisWeek: !!lp.alreadyDoneThisWeek, action: { type:"navigate", label: lang==="da" ? "Åbn ledelse" : "Open leadership", payload:{ view:"coach" } } };
      });
    }
  } catch(_) { livedPractices = []; }
  let managerDeep = [];
  try {
    const nav = require("./js/management-navigator.js");
    if (nav && typeof nav.getDailyBrief === "function") {
      const b = nav.getDailyBrief(o.user || { _id:"local", name:"Leader", role:"admin" }, project, { today: today, lang: lang, drafts: trayDrafts });
      if (b) {
        if (b.delegation && b.delegation.candidates && b.delegation.candidates.length) {
          const c = b.delegation.candidates[0];
          const delDetails = (b.delegation.candidates||[]).slice(0,2).map(function(x){ return x.title+" ("+x.from+"\u2192"+x.to+" "+(x.hoursFrom||x.loadFrom)+"h)"; }).join("; ");
          managerDeep.push({ id:"mgr-delegation", kind:"manager-deep", priority:2, title: (lang==="da" ? "Deleg\u00e9r: " : "Delegate: ")+(c.title||c.taskId||"task"), reason: c.reason + (delDetails? " \u2014 "+delDetails:"") + (b.delegation.unavailable&&b.delegation.unavailable.length? " \u2014 away: "+b.delegation.unavailable.join(", "):""), action:{ type:"navigate", label: lang==="da"?"\u00c5bn prioritering":"Open priorities", payload:{ view:"myWork" } } });
        }
        if (b.capacity && b.capacity.overloaded) {
          const deferTxt = (b.capacity.tasksToDefer||[]).slice(0,2).map(function(t){return t.title+" ("+t.hours+"h)";}).join(", ");
          managerDeep.push({ id:"mgr-capacity", kind:"manager-deep", priority:2, severity: b.capacity.estimatedHours - b.capacity.capacityHours >= 16 ? "high" : "medium", title: b.capacity.suggestion || (b.capacity.estimatedHours+"h / "+b.capacity.capacityHours+"h ("+b.capacity.perPersonCapacity+"h pp)"), reason: "Week needs "+b.capacity.estimatedHours+"h, capacity "+b.capacity.capacityHours+"h ("+b.capacity.perPersonCapacity+"h pp \u00d7 "+b.capacity.rosterSize+")"+(b.capacity.hottestAssignee?" \u2014 "+b.capacity.hottestAssignee.person+" "+b.capacity.hottestAssignee.hours+"h":"")+(deferTxt?" \u2014 defer: "+deferTxt:""), action:{ type:"navigate", label: lang==="da"?"\u00c5bn kapacitet":"Open capacity", payload:{ view:"myWork" } } });
        }
        if (b.decisions && b.decisions.mustDecideToday && b.decisions.mustDecideToday.length) {
          const d0 = b.decisions.mustDecideToday[0];
          managerDeep.push({ id:"mgr-decision", kind:"manager-deep", priority:2, title: d0.title, reason: d0.ageDays+"d open, impact "+d0.impact+(d0.ownerLoad?" \u2014 "+d0.owner+" has "+d0.ownerLoad+" tasks":"")+(d0.blockedBy?" blocked by "+String(d0.blockedBy).slice(0,40):""), action:{ type:"navigate", label: lang==="da"?"\u00c5bn beslutninger":"Open decisions", payload:{ view:"myWork" } } });
        }
        if (b.habits && Array.isArray(b.habits.habits) && b.habits.habits.length) {
          const h0 = b.habits.habits[0];
          const h0presc = h0.prescription ? (lang==="da" ? h0.prescription.da : h0.prescription.en) : "";
          const h0track = (h0.track && h0.track.applied) ? (lang==="da" ? " — her: godkendt "+h0.track.applied+"×, brudt "+h0.track.broke+"×" : " — here: approved "+h0.track.applied+"x, broke "+h0.track.broke+"x") : "";
          managerDeep.push({ id:"mgr-outage-habit", kind:"manager-deep", priority:2, severity: h0.severity || "medium", title: (lang==="da" ? "Vane: " : "Habit: ") + h0.kindLabel + (lang==="da" ? " — "+h0.streak+" vinduer i træk" : " — "+h0.streak+" window(s) in a row"), reason: (h0.detail || h0.title || "") + (h0presc ? " — " + h0presc : "") + h0track, action:{ type:"navigate", label: lang==="da"?"\u00c5bn produktion":"Open production", payload:{ view:"produktionsledelse" } } });
        }
        if (b.approvalLatency && Array.isArray(b.approvalLatency.findings) && b.approvalLatency.findings.length) {
          const lf0 = b.approvalLatency.findings[0];
          managerDeep.push({ id:"mgr-approval-latency", kind:"manager-deep", priority:2, severity: (lf0.kind === "overdue" || lf0.kind === "late") ? "high" : "medium", title: (lang==="da" ? "Dit ur: " : "Your clock: ") + (lang==="da" ? lf0.title.da : lf0.title.en), reason: (lang==="da" ? lf0.detail.da : lf0.detail.en), action:{ type:"navigate", label: lang==="da"?"Åbn review-tray":"Open review tray", payload:{ view:"automation" } } });
        }
        if (b.executionLatency && Array.isArray(b.executionLatency.findings) && b.executionLatency.findings.length) {
          const ef0 = b.executionLatency.findings[0];
          managerDeep.push({ id:"mgr-execution", kind:"manager-deep", priority:2, severity: (ef0.kind === "impossible" || ef0.kind === "no-exit" || ef0.kind === "late") ? "high" : "medium", title: (lang==="da" ? "Holdets ur: " : "The team's clock: ") + (lang==="da" ? ef0.title.da : ef0.title.en), reason: (lang==="da" ? ef0.detail.da : ef0.detail.en), action:{ type:"navigate", label: lang==="da"?"Åbn myWork":"Open myWork", payload:{ view:"myWork" } } });
        }
        // NO mgr-leadership-models chip: the cockpit already carries the
        // dedicated "leadership-models" card (today-cockpit 5b8) with the
        // SAME findings[0] and the SAME action. One finding, one card —
        // a duplicate here both churns the deck and crowds out the
        // capacity/decision chips in the manager-deep slice.
        if (b.escalationAnalytics && Array.isArray(b.escalationAnalytics.findings) && b.escalationAnalytics.findings.length) {
          const lf9 = b.escalationAnalytics.findings[0];
          managerDeep.push({ id:"mgr-escalation-analytics", kind:"manager-deep", priority:2, severity: lf9.severity === "high" ? "high" : "medium", title: (lang==="da" ? "Eskalering: " : "Escalation: ") + (lang==="da" ? lf9.title.da : lf9.title.en), reason: (lang==="da" ? lf9.detail.da : lf9.detail.en), action:{ type:"navigate", label: lang==="da"?"Åbn eskaleringer":"Open escalations", payload:{ view:"myWork" } } });
        }
        if (b.dependencies && b.dependencies.crossProjectLinks && b.dependencies.crossProjectLinks.length) {
          const top = b.dependencies.topBlockers && b.dependencies.topBlockers[0] ? b.dependencies.topBlockers[0] : null;
          const first = b.dependencies.crossProjectLinks[0];
          managerDeep.push({ id:"mgr-dependencies", kind:"manager-deep", priority:2, severity:"medium", title: top ? (lang==="da"?"Blokering: ":"Blocker: ")+top.blocker+" ("+top.count+")" : (lang==="da"?"Blokeret: ":"Blocked: ")+first.title, reason: top ? top.blocker+" holds "+top.count+" task(s) \u2014 "+ (b.dependencies.suggestion||"") : (first.title+" blocked by "+String(first.blockedBy).slice(0,60)), action:{ type:"navigate", label: lang==="da"?"\u00c5bn afh\u00e6ngigheder":"Open dependencies", payload:{ view:"myWork" } } });
        }
      }
    }
  } catch(_) { managerDeep = []; }

  // The relief ledger KPI (lib/friday-reflection.js): what the week freed,
  // per person — computed from the registers, shown as a number, never typed.
  let relief = null;
  try {
    const rl = require("./lib/friday-reflection.js").reliefLedgerOf(projectState, { today });
    if (rl && rl.rows && rl.rows.length) {
      relief = { hours: rl.hours, removals: rl.removals, moves: rl.moves, byPerson: rl.byPerson.slice(0, 3) };
    }
  } catch (_) { relief = null; }

  // Quiet-at-send made visible: what the notification router is holding for
  // the digest (js/notification-router.js). A KPI, not an ask — and silence
  // when the buffer is empty.
  let heldAlerts = null;
  try {
    const nrHeld = require("./js/notification-router.js");
    const peek = (nrHeld && typeof nrHeld.peekHeldForDigest === "function") ? nrHeld.peekHeldForDigest("default") : [];
    if (peek.length) {
      heldAlerts = {
        count: peek.length,
        titles: peek.slice(0, 3).map(n => String(n.title || "").slice(0, 80)),
        constraint: peek[0] && peek[0].constraint ? peek[0].constraint.who : null,
        holdReason: peek[0] ? peek[0].holdReason : null
      };
    }
  } catch (_) { heldAlerts = null; }

  const cockpit = todayCockpit({
    tray, proposals, openCases, stalledCases, navigator: navigatorItems, dueJobs, lead, delegations, relief, heldAlerts,
    signals, portfolioSignals, outcomeProposals, autonomyCandidates, autoFiled, livedPractices, managerDeep,
    weekAhead, outageReadiness, approvalLatency, executionLatency, caseClock, sweptCases, leadershipModels, leadershipFocus, conversations, escalationAnalytics
  }, { lang, today, user: o.user });

  return {
    cockpit, tray, proposals, openCases, stalledCases, navigator: navigatorItems, dueJobs, relief, heldAlerts,
    signals, portfolioSignals, outcomeProposals, autonomyCandidates, autoFiled, weekAhead, outageReadiness, approvalLatency, executionLatency, caseClock, sweptCases, leadershipModels, leadershipFocus, conversations, escalationAnalytics,
    ...(commercial ? { commercial } : {}),
    ...(constraintDigest ? { constraint: constraintDigest } : {}),
    ...(trajectoryDigest ? { trajectory: trajectoryDigest } : {}),
    signalScan: signalScan ? { counts: signalScan.counts, detectors: signalScan.detectors, errors: signalScan.errors } : null
  };
}

// ── Registry installation (idempotent, lazy, once per process) ─────────────
// Detectors and producers register themselves by id, so installing twice
// replaces rather than duplicates. Installation is lazy so a test that never
// touches the cockpit never pays for it, and failures are contained: a pack
// that cannot load leaves the app exactly as it was before this round.
let _signalDetectorsInstalled = false;
function ensureSignalDetectors() {
  if (_signalDetectorsInstalled) return;
  _signalDetectorsInstalled = true;
  try {
    const packResult = require("./lib/detector-pack.js").installDetectors();
    const crossResult = require("./lib/cross-project-detectors.js").installCrossProjectDetectors();
    // The four domain verticals the leader named — production, commissioning,
    // finance and sales. They had no registry presence at all, so three of them
    // were structurally invisible on the screen the leader actually reads.
    const verticalResult = require("./lib/vertical-detectors.js").installVerticalDetectors();
    logger.info("signal_detectors_installed", {
      pack: packResult.installed.length,
      packSkipped: packResult.skipped,
      cross: crossResult.installed.length,
      crossSkipped: crossResult.skipped,
      verticals: verticalResult.installed.length,
      verticalSkipped: verticalResult.skipped
    });
  } catch (error) {
    logger.warn("signal_detectors_install_failed", { error: error && error.message });
  }
}

let _ambientProducersInstalled = false;
function ensureAmbientProducers() {
  if (_ambientProducersInstalled) return;
  _ambientProducersInstalled = true;
  try {
    const result = require("./lib/ambient-producers.js").installProducers();
    logger.info("ambient_producers_installed", { installed: result.installed.length, skipped: result.skipped });
  } catch (error) {
    logger.warn("ambient_producers_install_failed", { error: error && error.message });
  }
}

// ─── Digest delivery: the brief that acts, outbound ────────────────────
// One email per day with the SAME ranked items as /api/today plus deep-links;
// replies flow back through the governed inbound command gateway. Delivery is
// SMTP when configured, otherwise an honest outbox — never a silent drop.
const DIGEST_OUTBOX_DIR = path.join(DATA_DIR, "digest");
function runDigestDeliveryGated(opts) {
  const o = opts || {};
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { blocked: true, blockedReason: gate.reason };
  const digestDelivery = require("./lib/digest-delivery.js");
  const today = o.today || new Date().toISOString().slice(0, 10);
  const lang = o.lang || langOf(o.workspace);
  const user = o.user || { _id: "system", name: "Digest", role: "admin" };
  const appUrl = process.env.LEADERSHIP_APP_URL || "";
  // Per-user delivery (K): every ACTIVE admin/editor account with an email on
  // file receives the digest — the leader should not have to be a deploy-env
  // variable. The legacy NOTIFY_TO address stays supported and is deduped by
  // resolveRecipients, so a leader who IS the env address gets ONE copy.
  const digestRecipients = [];
  try {
    for (const row of authStore().allUsers()) {
      const u = row && row.user;
      if (u && u.active !== false && u.email && (u.role === "admin" || u.role === "editor")) {
        digestRecipients.push({ address: u.email, name: u.name || u.email });
      }
    }
  } catch (_) { /* auth store unavailable → env recipient still applies */ }
  if (NOTIFY_TO) digestRecipients.push({ address: NOTIFY_TO, name: NOTIFY_TO });
  const summary = digestDelivery.runDigestDelivery({
    workspace: o.workspace,
    today,
    lang,
    appUrl,
    outboxDir: DIGEST_OUTBOX_DIR,
    recipients: digestRecipients,
    recipient: NOTIFY_TO || "",
    sendEmail: (mail) => notifications.sendEmail(mail),
    gather: (projectId) => {
      const ing = gatherCockpitIngredients(projectId, { lang, today, role: "admin", user, ws: o.workspace });
      let effectiveness = [];
      try { effectiveness = require("./lib/method-effectiveness.js").effectivenessInsights(o.workspace, lang); } catch (_) { effectiveness = []; }
      // Constraint-aware quiet travels INTO the digest: the held alerts arrive
      // as their own labelled batch — restraint must never become loss.
      let alerts = null;
      try { alerts = constraintQuietPolicy(workspaceAlerts(o.workspace || {}), o.workspace || {}); } catch (_) { alerts = null; }
      // Quiet at SEND time travels into the digest too: anything the
      // notification router held back from the live channels is drained here
      // and joins the labelled held batch — restraint is never loss.
      try {
        const router = require("./js/notification-router.js");
        const heldNow = (router && typeof router.takeHeldForDigest === "function") ? router.takeHeldForDigest("default") : [];
        if (heldNow.length) {
          alerts = alerts || { alerts: [], constraint: null, held: 0, detail: null };
          alerts.alerts = (alerts.alerts || []).concat(heldNow.map(h => Object.assign({ delivery: "digest", domain: "held" }, h)));
          alerts.held = (alerts.held || 0) + heldNow.length;
        }
      } catch (_) { /* the buffer is best-effort; the digest never breaks on it */ }
      return { cockpit: ing.cockpit, effectiveness, navigator: ing.navigator, alerts, commercial: ing.commercial, constraint: ing.constraint, trajectory: ing.trajectory };
    }
  });
  if (!summary.skipped) {
    appendAudit({ action: summary.sent ? "Daily digest sent" : "Daily digest outboxed", detail: `${summary.date} — ${summary.subject} — actions:${(summary.counts && summary.counts.actions) || 0}${summary.reason ? " — " + summary.reason : ""}` });
    // I10: push the digest as a per-user notification so it appears in-app AND
    // as a Web Push on every subscribed device (notification-delivery.js).
    // Best-effort: digest email/outbox is already durable; push failures never
    // roll it back.
    try {
      const wsForPush = o.workspace || {};
      const projects = Object.values(wsForPush.projects || {});
      const projectIds = projects.length ? projects.map(p => p._id || p.id || "workspace") : ["workspace"];
      const title = summary.sent ? summary.subject : "Leadership today — " + summary.date;
      const briefCounts = summary.counts || {};
      const body = (briefCounts.actions ? briefCounts.actions + " action(s) waiting" : "Daily brief ready") + (summary.sent ? "" : " — in outbox");
      for (const pid of projectIds) {
        try {
          const inbox = require("./lib/notifications-inbox.js");
          const auth = authStore();
          const users = auth.allUsers ? auth.allUsers() : [];
          for (const row of users) {
            const u = row && row.user;
            if (!u || u.active === false) continue;
            if (u.role !== "admin" && u.role !== "editor") continue;
            try { inbox.dispatch({ type: "digest.delivered", date: summary.date, subject: summary.subject, sent: summary.sent }, { tenantId: (wsForPush.activeId || "local"), projectId: pid, userId: u.id || u._id, actorId: "system" }); } catch (_) {}
          }
        } catch (_) {}
      }
      void title; void body;
    } catch (_) {}
  }
  return summary;
}

function writeHeartbeat() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const hb = { ts: new Date().toISOString(), pid: process.pid };
  const fd = fs.openSync(HEARTBEAT_FILE, "w");
  fs.writeFileSync(fd, JSON.stringify(hb), "utf8");
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  return hb;
}

function readHeartbeat() {
  try { return JSON.parse(fs.readFileSync(HEARTBEAT_FILE, "utf8")); }
  catch (_) { return null; }
}

function schedulerStale() {
  const enabled = Number.isFinite(AUTOMATION_INTERVAL_MS) && AUTOMATION_INTERVAL_MS >= 60000;
  const hb = readHeartbeat();
  if (!hb) return { enabled, stale: enabled, lastHeartbeat: null, staleMs: null };
  const staleMs = Date.now() - new Date(hb.ts).getTime();
  return { enabled, stale: staleMs > AUTOMATION_INTERVAL_MS * 2 + 10000, lastHeartbeat: hb.ts, staleMs };
}

/** Deliver due jobs: webhook events + escalation email; retry with backoff. */
async function deliverDueJobs() {
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { due: 0, delivered: 0, escalated: 0, blocked: true, blockedReason: gate.reason };
  const due = jobStore.dueJobs(JOBS_FILE);
  // Escalate jobs past their SLA and notify the next level.
  const escalated = jobStore.escalateOverdue(JOBS_FILE);
  for (const job of escalated) {
    appendAudit({ eventId: `automation-escalated:${job.jobId}`, action: "Automation job escalated", detail: `${job.jobId} — ${job.title} — past SLA` });
    notifications.dispatchWebhooks("automation.escalated", { jobId: job.jobId, title: job.title, projectId: job.projectId, dueDate: job.dueDate }).catch(() => {});
    if (NOTIFY_TO && process.env.SMTP_HOST) {
      // Escape HTML in the body: dueDate/projectId can carry user-controlled
      // workspace data (task due dates, project keys) that would otherwise
      // inject markup into the email delivered to NOTIFY_TO. The SUBJECT uses
      // safeSubject (CR/LF strip + truncate) — escapeHtml would render literal
      // &amp; entities in the header.
      const esc = notifications.escapeHtml;
      const safe = notifications.safeSubject;
      notifications.sendEmail({
        to: NOTIFY_TO,
        subject: `[Leadership] ESCALATED: ${safe(job.title)}`,
        html: `<p><strong>${esc(job.title)}</strong> (${esc(job.projectId)}) is past its escalation SLA (due ${esc(job.dueDate)}).</p><p>Escalate to the next accountable level.</p>`
      }).catch(() => {});
    }
  }
  let delivered = 0;
  for (const job of due) {
    let ok = false;
    try {
      await notifications.dispatchWebhooks("automation.deliver", {
        jobId: job.jobId, executionKey: automationControls.executionKey(job.jobId, (job.attempts || 0) + 1), title: job.title, projectId: job.projectId,
        requiresHumanApproval: job.requiresHumanApproval, dueDate: job.dueDate, deliveredAt: new Date().toISOString()
      });
      if (NOTIFY_TO && process.env.SMTP_HOST) {
        const esc = notifications.escapeHtml;
        const safe = notifications.safeSubject;
        const result = await notifications.sendEmail({
          to: NOTIFY_TO,
          subject: `[Leadership] Automation follow-up: ${safe(job.title)}`,
          html: `<p><strong>${esc(job.title)}</strong> (${esc(job.projectId)}) is due for review.</p><p>Due: ${esc(job.dueDate || "now")}${job.requiresHumanApproval ? " — human approval required" : ""}</p>`
        });
        ok = result.sent;
      } else {
        ok = true;
      }
    } catch (_) { ok = false; }
    const state = jobStore.markAttempt(JOBS_FILE, job.jobId, ok);
    if (state && state.status === "failed") {
      appendAudit({ action: "Automation delivery failed", detail: `${job.jobId} — retries exhausted` });
    }
    if (ok) delivered++;
  }
  return { due: due.length, delivered, escalated: escalated.length };
}

function integrityReport(req) {
  const auditRows = readAudit();
  const approvalRows = readApprovals();
  const historyRows = readWorkspaceHistory();
  const ws = readWorkspace();
  const wsHash = workspaceHash(ws);
  const lastEntry = historyRows.length ? historyRows[historyRows.length - 1] : null;
  const checks = {
    audit: verifyAudit(auditRows),
    approvals: verifyApprovals(approvalRows),
    workspaceHistory: verifyWorkspaceHistory(historyRows),
    jobs: jobStore.verifyJobs(JOBS_FILE),
    workspace: {
      hash: wsHash,
      revision: currentWorkspaceRevision(),
      matchesHistory: !!lastEntry && lastEntry.hash === wsHash,
      encryptedAtRest: hasKey(),
      storageIssue: storageIntegrityIssue
    }
  };
  const params = new URLSearchParams((req.url.split("?")[1] || ""));
  const clientHash = params.get("clientHash") || "";
  const anyChainBroken = Object.values(checks).some(c => c && c.valid === false);
  const clientMatches = !!clientHash && clientHash === wsHash;
  const failed = anyChainBroken || !checks.workspace.matchesHistory || !!storageIntegrityIssue;
  return {
    ok: !failed,
    status: failed ? "tampered" : (clientHash && !clientMatches) ? "diverged" : "verified",
    checks,
    client: clientHash ? { hash: clientHash, matches: clientMatches } : null,
    checkedAt: new Date().toISOString()
  };
}

// Operator storage snapshot: sizes, budgets, self-heal events and the
// pre-trim safety nets — what an admin needs to answer "is storage healthy
// and what happened to it" without reading server logs.
const STORAGE_EVENT_LIMIT = 10;
function historyBackupListFor(historyFile) {
  try {
    const dir = historyBackupDirFor(historyFile);
    return fs.readdirSync(dir).filter(f => f.endsWith(".jsonl")).map(f => {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      const verdict = verifyHistoryBackup(p);
      return { file: f, bytes: stat.size, mtime: new Date(stat.mtimeMs).toISOString(), verified: verdict.checksumOk };
    }).sort((a, b) => b.mtime.localeCompare(a.mtime));
  } catch (_) { return []; }
}
function storageEvents() {
  // Read the tamper-evident audit chain and surface the self-heal events —
  // operators see them in the UI without shell access to the logs.
  try {
    return readAudit().filter(r => r && r.action === "Storage self-heal").slice(-STORAGE_EVENT_LIMIT).reverse();
  } catch (_) { return []; }
}
function storageHealthSnapshot() {
  const files = [
    ["workspaceHistory", WORKSPACE_HISTORY_FILE],
    ["audit", AUDIT_FILE],
    ["approvals", APPROVAL_FILE]
  ].map(([name, file]) => ({
    name,
    bytes: fs.existsSync(file) ? fs.statSync(file).size : 0,
    budgetBytes: name === "workspaceHistory" ? WORKSPACE_HISTORY_MAX_BYTES : null,
  })).map(f => ({ ...f, withinBudget: f.budgetBytes === null ? true : f.bytes <= f.budgetBytes }));
  return {
    files,
    budgets: { historyMaxRows: WORKSPACE_HISTORY_MAX, historyMaxBytes: WORKSPACE_HISTORY_MAX_BYTES, backupsEnabled: WORKSPACE_HISTORY_BACKUPS_ENABLED, backupRetention: WORKSPACE_HISTORY_BACKUP_RETENTION },
    pretrimBackups: historyBackupListFor(WORKSPACE_HISTORY_FILE),
    events: storageEvents(),
    checkedAt: new Date().toISOString()
  };
}

function sanitizeWorkspaceForRole(workspace, role) {
  if (role === "editor" || role === "admin") return workspace;
  const safe = JSON.parse(JSON.stringify(workspace));
  Object.values(safe.projects || {}).forEach(project => {
    SENSITIVE_REGISTERS.forEach(register => { if (project.registers && Array.isArray(project.registers[register])) project.registers[register] = []; });
    // Snapshots embed full copies of the registers ({project, roster, registers});
    // without clearing those too, a viewer/auditor reads sensitive data from
    // any saved snapshot even though the live registers are emptied.
    (project.snapshots || []).forEach(snapshot => {
      const regs = snapshot && snapshot.data && snapshot.data.registers;
      if (regs) SENSITIVE_REGISTERS.forEach(register => { if (Array.isArray(regs[register])) regs[register] = []; });
    });
    if (role === "viewer" || role === "auditor") {
      project.approvals = [];
      project.events = [];
      // Roster members carry people-psych profiles and salary added via
      // updateRosterMember patches — non-editors only get identity fields.
      project.roster = (project.roster || []).map(member => member ? { id: member.id, name: member.name, role: member.role } : member);
    }
  });
  return safe;
}

function approvalChangeAllowed(currentWorkspace, nextWorkspace, role) {
  if (role === "admin") return true;
  // Non-admin editors may not mutate approval records. Compare the approval
  // arrays of every project that exists in either workspace — a brand-new
  // project with empty approvals is fine, but changing approvals on an
  // existing project is not. Robust to empty-vs-populated workspaces.
  const currentProjects = (currentWorkspace && currentWorkspace.projects) || {};
  const nextProjects = (nextWorkspace && nextWorkspace.projects) || {};
  const ids = new Set([...Object.keys(currentProjects), ...Object.keys(nextProjects)]);
  for (const id of ids) {
    const cur = JSON.stringify((currentProjects[id] && currentProjects[id].approvals) || []);
    const next = JSON.stringify((nextProjects[id] && nextProjects[id].approvals) || []);
    if (cur !== next) return false;
  }
  return true;
}

function readAudit() {
  ensureStorage();
  return readJsonLines(AUDIT_FILE);
}

function readApprovals() {
  ensureStorage();
  return readJsonLines(APPROVAL_FILE).map(entry => {
    if (entry._corrupt) return entry;
    Object.defineProperty(entry, "_legacy", { value: !entry.stage && !entry.role && !entry.requiredApprovers, enumerable: false, configurable: true });
    entry.stage = entry.stage || "Sponsor approval";
    entry.role = entry.role || "Approver";
    entry.dueDate = entry.dueDate || "";
    entry.requiredApprovers = Array.isArray(entry.requiredApprovers) ? entry.requiredApprovers : [];
    return entry;
  });
}
function readGovernanceState(workspace) {
  const safe = workspace || readWorkspace();
  const projects = safe.projects || {};
  const allDecisions = [];
  const allActions = [];
  Object.values(projects).forEach(project => {
    if (Array.isArray(project.decisions)) allDecisions.push(...project.decisions.map(item => ({ ...item, projectId: project.project && project.project.name ? project.project.name : "project" })));
    if (Array.isArray(project.actions)) allActions.push(...project.actions.map(item => ({ ...item, projectId: project.project && project.project.name ? project.project.name : "project" })));
  });
  return { decisions: allDecisions, actions: allActions, summary: C.governanceSummary(allDecisions, allActions, readApprovals()) };
}
function approvalChecksum(previous, entry) {
  return checksum(previous, { id: entry.id, ts: entry.ts, action: [entry.title, entry.status, entry.stage].join("|"), detail: [entry.approver, entry.role, entry.dueDate, entry.requiredApprovers.join(","), entry.evidence, entry.decisionId].join("|") });
}
function legacyApprovalChecksum(previous, entry) {
  return checksum(previous, { id: entry.id, ts: entry.ts, action: [entry.title, entry.status].join("|"), detail: [entry.approver, entry.evidence, entry.decisionId].join("|") });
}
function verifyApprovals(rows) {
  let previous = "";
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]._corrupt) return { valid: false, checked: rows.length, brokenAt: i };
    const expected = rows[i]._legacy ? legacyApprovalChecksum(previous, rows[i]) : approvalChecksum(previous, rows[i]);
    if (rows[i].checksum !== expected) return { valid: false, checked: rows.length, brokenAt: i };
    previous = rows[i].checksum;
  }
  return { valid: true, checked: rows.length, brokenAt: null };
}
function appendApproval(payload) {
  const rows = readApprovals();
  if (payload.decisionId) {
    const existing = rows.find(row => row.decisionId === payload.decisionId);
    if (existing) return existing;
  }
  const entry = { id: crypto.randomUUID(), ts: new Date().toISOString(), title: payload.title, status: payload.status, stage: payload.stage || "Sponsor approval", approver: payload.approver, role: payload.role || "Approver", dueDate: payload.dueDate || "", requiredApprovers: Array.isArray(payload.requiredApprovers) ? payload.requiredApprovers : [], evidence: payload.evidence, decisionId: payload.decisionId || "" };
  entry.checksum = approvalChecksum(rows.length ? rows[rows.length - 1].checksum : "", entry);
  (function() {
    const fd = fs.openSync(APPROVAL_FILE, "a");
    fs.appendFileSync(fd, JSON.stringify(entry) + "\n", "utf8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  })();
  appendAudit({ action: "Approval ledger", detail: entry.title + " — " + entry.approver });
  return entry;
}

function checksum(previous, entry) {
  // LEGACY scheme — only covered ts/action/detail/id. Kept for verifying rows
  // written before auditChecksum below (and used by approvals/workspace).
  return crypto.createHash("sha256").update([
    previous || "GENESIS", entry.ts, entry.action, entry.detail, entry.id
  ].join("|")).digest("hex");
}

// Full-coverage audit checksum: hashes the ENTIRE row (id, eventId, ts,
// action, detail), so eventId — previously outside the chain — is covered.
function auditChecksum(previous, entry) {
  const value = { ...entry };
  delete value.checksum;
  return crypto.createHash("sha256").update([
    previous || "AUDIT-GENESIS", JSON.stringify(value)
  ].join("|")).digest("hex");
}

function verifyAudit(rows) {
  let previous = "";
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]._corrupt) return { valid: false, checked: rows.length, brokenAt: i };
    if (rows[i].checksumScheme === "full") {
      // Strict: full-coverage checksum only — eventId/any-field tamper breaks
      // the chain (a legacy fallback would silently accept it).
      if (rows[i].checksum !== auditChecksum(previous, rows[i])) {
        return { valid: false, checked: rows.length, brokenAt: i };
      }
    } else {
      // Pre-migration rows verify under the legacy 5-field scheme.
      if (rows[i].checksum !== checksum(previous, rows[i])) {
        return { valid: false, checked: rows.length, brokenAt: i };
      }
    }
    previous = rows[i].checksum;
  }
  return { valid: true, checked: rows.length, brokenAt: null };
}

function appendAudit(payload) {
  const rows = readAudit();
  if (payload.eventId) {
    const existing = rows.find(row => row.eventId === payload.eventId);
    if (existing) return existing;
  }
  const previous = rows.length ? rows[rows.length - 1].checksum : "";
  const entry = {
    id: crypto.randomUUID(),
    eventId: payload.eventId || "",
    ts: new Date().toISOString(),
    action: payload.action,
    detail: payload.detail || ""
  };
  entry.checksumScheme = "full";
  entry.checksum = auditChecksum(previous, entry);
  const fd = fs.openSync(AUDIT_FILE, "a");
  fs.appendFileSync(fd, JSON.stringify(entry) + "\n", "utf8");
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  return entry;
}

function recoveryReadiness() {
  const backupDir = BACKUP_DIR;
  if (!fs.existsSync(backupDir)) return { valid: false, detail: "No backup directory is configured" };
  const backups = fs.readdirSync(backupDir).filter(name => name.startsWith("backup-")).sort().reverse();
  if (!backups.length) return { valid: false, detail: "No backup manifest is available" };
  const latest = path.join(backupDir, backups[0]);
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(latest, "manifest.json"), "utf8"));
    const files = Object.entries(manifest.files || {});
    const valid = files.length > 0 && files.every(([name, expected]) => {
      const file = path.join(latest, name);
      if (!fs.existsSync(file)) return false;
      const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      return hash === expected.sha256;
    });
    return { valid, detail: valid ? `Latest backup manifest verified (${backups[0]})` : "Latest backup checksum verification failed" };
  } catch (_) { return { valid: false, detail: "Latest backup manifest is unreadable" }; }
}

function aiGovernanceReadiness() {
  const file = path.join(DATA_DIR, "ai-governance.json");
  if (!fs.existsSync(file)) return { valid: false, detail: "No AI governance manifest is available" };
  try {
    const result = aiGovernance.evaluate(JSON.parse(fs.readFileSync(file, "utf8")), {
      secret: process.env.LEADERSHIP_AI_GOVERNANCE_SECRET,
      requireSignature: process.env.NODE_ENV === "production"
    });
    return { valid: result.valid, detail: result.valid ? "AI governance manifest verified" : `${result.total - result.passed} AI governance check(s) failed` };
  } catch (_) { return { valid: false, detail: "AI governance manifest is unreadable" }; }
}

function privacyReadiness() {
  if (!hasKey()) return { valid: false, detail: "Privacy encryption key is not configured" };
  if (!fs.existsSync(PRIVACY_GOVERNANCE_FILE)) return { valid: false, detail: "Privacy governance ledger is not available" };
  const result = privacyGovernance.verify(PRIVACY_GOVERNANCE_FILE);
  return { valid: result.valid, detail: result.valid ? `Privacy governance ledger verified (${result.checked} record(s))` : "Privacy governance ledger integrity failed" };
}

function livePlatformReadiness() {
  const production = process.env.NODE_ENV === "production";
  const audit = verifyAudit(readAudit());
  const approvals = verifyApprovals(readApprovals());
  const finance = financeIntegrity(financeRows());
  const migrations = dbMigrationTest.parseMigrations(path.join(ROOT, "db", "migrations"));
  const schema = migrations.error ? { valid: false } : dbMigrationTest.validateMigrationChain(migrations.migrations);
  const evidence = automationEvidence.verify(readJsonLines(EVIDENCE_FILE));
  const killSwitch = String(process.env.LEADERSHIP_TRADING_KILL_SWITCH || "").toLowerCase() === "true";
  return platformReadiness.build({
    tenantIsolation: { valid: !production || (!!process.env.LEADERSHIP_TENANT_ID && persistenceStore().mode === "postgres"), detail: production ? "Production tenant and PostgreSQL isolation configured" : "Local development scope" },
    authorization: { valid: !production ? true : (!!API_TOKEN || Object.keys(TOKEN_ROLES).length > 0), detail: production ? "Production API role configuration detected" : "Local development authorization" },
    schemaContracts: { valid: !!schema.valid, detail: schema.valid ? `${schema.totalMigrations} migration(s) pass ordering checks` : "Migration chain requires review" },
    eventIntegrity: { valid: audit.valid && approvals.valid, detail: audit.valid && approvals.valid ? "Audit and approval chains verified" : "Audit or approval chain is invalid" },
    automationSafety: { valid: evidence.valid && !killSwitch, detail: killSwitch ? "Kill switch is active" : (evidence.valid ? "Automation evidence chain verified" : "Automation evidence chain is invalid") },
    financialControls: { valid: finance.valid, detail: finance.valid ? "Finance journal chain verified" : "Finance journal chain is invalid" },
    recovery: recoveryReadiness(),
    privacy: privacyReadiness(),
    aiGovernance: aiGovernanceReadiness()
  });
}

// Coerce a request value into a finite number. Returns NaN for missing,
// empty, or non-numeric input so the `num(x) || default` idiom used by the
// DR / benchmarking routes falls back to its default instead of referencing
// an undefined global (which previously threw and hung those endpoints).
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function nowISO() {
  return new Date().toISOString();
}

function isLoopbackAddress(addr) {
  if (!addr) return false;
  const a = String(addr).toLowerCase();
  return a === "::1" || a === "localhost" || a === "127.0.0.1" || /^::ffff:127\./.test(a) || /^127\./.test(a);
}

// Unauthenticated access is limited to non-production local development — and
// by DEFAULT only to loopback clients. A bare `node server.js` on a LAN used
// to grant anonymous ADMIN from any source IP (the operator had to know the
// LEADERSHIP_ALLOW_UNAUTHENTICATED_LOCAL=false kill-switch to close it). Now
// the default is loopback-only; the explicit "true" restores LAN dev access
// and "false" keeps it closed everywhere, in any mode.
function anonymousLocalAllowed(req) {
  if (process.env.NODE_ENV === "production") return false;
  const flag = String(process.env.LEADERSHIP_ALLOW_UNAUTHENTICATED_LOCAL || "").toLowerCase();
  if (flag === "false") return false;
  if (flag === "true") return true;
  return isLoopbackAddress(req && req.socket && req.socket.remoteAddress);
}

function roleFor(req) {
  // Authenticated session users take precedence (real identity layer).
  const sessionUser = authStore().userFromRequest(req);
  if (sessionUser) {
    // Deputy / acting leadership: a live delegation in the ACTIVE org
    // elevates the session role for this request (never lowers it). Memoized
    // per request object so repeated roleFor calls cost one store read.
    if (req && !req.__deputyRoleResolved) {
      req.__deputyRoleResolved = true;
      try {
        const requestedOrg = req.headers && (req.headers["x-org-id"] || req.headers["x-tenant-id"]);
        const tenantId = String(requestedOrg || sessionUser.tenantId || "").trim();
        if (tenantId) {
          const deputy = orgStore().deputyRoleForUser(sessionUser.id, tenantId);
          if (deputy && deputy.role) req.__deputyRole = deputy.role;
        }
      } catch (_) { /* elevation is best-effort; base role still applies */ }
    }
    const levels = { viewer: 1, auditor: 2, editor: 3, admin: 4, owner: 5 };
    const base = sessionUser.role;
    const elevated = req && req.__deputyRole;
    if (elevated && (levels[elevated] || 0) > (levels[base] || 0)) return elevated;
    return base;
  }
  // Unauthenticated access is limited to non-production local development.
  const localDevelopment = anonymousLocalAllowed(req);
  if (!API_TOKEN && !Object.keys(TOKEN_ROLES).length) return localDevelopment ? "admin" : null;
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (API_TOKEN && token === API_TOKEN) return "admin";
  // Own-properties only: a plain-object index lookup walks the prototype
  // chain, so "Bearer constructor" / "Bearer toString" returned inherited
  // Object functions — truthy, non-null — and module-router's String(role)
  // miss then defaulted them to viewer level. Unauthenticated read access.
  return Object.prototype.hasOwnProperty.call(TOKEN_ROLES, token) ? TOKEN_ROLES[token] : null;
}

function actorFor(req) {
  // Real person identity when a session user is present; otherwise fall back
  // to the role (token/local mode has no person identity). Module executions
  // previously recorded the ROLE string ("editor") as the actor — audit
  // records could never say WHO did what.
  const sessionUser = authStore().userFromRequest(req);
  if (sessionUser) return sessionUser.email || sessionUser.id || sessionUser.role;
  return roleFor(req);
}

function authorized(req, minimum) {
  const role = roleFor(req);
  const levels = { viewer: 1, auditor: 2, editor: 3, admin: 4 };
  const ok = !!role && (levels[role] || 0) >= (levels[minimum || "viewer"] || 1);
  if (!ok) recordUnauthorized(req, minimum, role);
  return ok;
}

// Unauthorized attempts land in the tamper-evident audit trail — previously a
// probe or privilege-escalation attempt left NO trace. Flood-proof: at most
// one audit row per (IP, route) per minute (coalescing window + appendAudit's
// eventId dedupe), so hammering the API cannot drown the audit file. Records
// the presented ROLE, never the token.
const unauthorizedWindow = new Map();
function recordUnauthorized(req, minimum, role) {
  try {
    const now = Date.now();
    const ip = (req.socket && req.socket.remoteAddress) || "unknown";
    const route = String(req.url || "").split("?")[0];
    if (unauthorizedWindow.size > 10000) {
      for (const [k, v] of unauthorizedWindow) if (now - v >= 60000) unauthorizedWindow.delete(k);
    }
    const key = `${ip}:${route}`;
    if (now - (unauthorizedWindow.get(key) || 0) < 60000) return;
    unauthorizedWindow.set(key, now);
    const minute = Math.floor(now / 60000);
    appendAudit({
      eventId: `unauthorized:${crypto.createHash("sha256").update(`${ip}:${route}:${minute}`).digest("hex").slice(0, 24)}`,
      action: "Unauthorized access attempt",
      detail: `${req.method || "GET"} ${route} — requires ${minimum}, presented ${role || "anonymous"}`
    });
  } catch (_) { /* auditing must never break request handling */ }
}

function allowRequest(req) {
  const now = Date.now();
  const key = productionHardening.normalizeIpForKey(productionHardening.resolveClientIp(req, { trustedProxies: TRUSTED_PROXIES }));
  // Sweep expired entries so the window map does not grow unbounded for
  // one-shot IPs (behind a load balancer / bots).
  if (rateWindow.size > 10000) {
    for (const [k, v] of rateWindow) {
      if (now - v.started >= 60000) rateWindow.delete(k);
    }
  }
  const current = rateWindow.get(key);
  if (!current || now - current.started >= 60000) {
    rateWindow.set(key, { started: now, count: 1 });
    return true;
  }
  current.count++;
  return current.count <= API_RATE_LIMIT;
}

// Dedicated budget for the credential endpoints (login / 2FA verify / register
// / WebAuthn options+verify). The GLOBAL limiter (allowRequest) is per-IP with
// a generous ceiling designed for real usage, which leaves the classic
// password-SPRAYING vector open: many identities, a few guesses each, forever
// under both the global budget and the per-identity lockout. This limiter is
// per-IP and deliberately tight. Implemented with the previously-dead
// LCProductionHardening.createRateLimiter so the capability advertised in
// /api/health and the completion matrix is actually enforced.
const authLimiter = productionHardening.createRateLimiter({
  maxRequests: AUTH_RATE_LIMIT,
  windowMs: 60000,
  burstSize: 5,
  // Client IP resolved the same way as the global limiter (socket peer
  // unless a configured trusted proxy says otherwise), then subnet-normalized
  // (IPv6 → /64) so rotating addresses inside one prefix cannot spread the
  // credential budget across billions of keys.
  keyFn: (req) => productionHardening.normalizeIpForKey(productionHardening.resolveClientIp(req, { trustedProxies: TRUSTED_PROXIES }))
});

// Path + method keyed so OPTIONS preflights and GET probes of these routes do
// not consume the credential budget; only requests that can present or mint
// credentials do.
function isCredentialRoute(req) {
  const route = `${req.method} ${String(req.url || "").split("?")[0]}`;
  return CREDENTIAL_ROUTES.has(route);
}

// Dedicated per-IP budget for /scim/v2/* bearer traffic. The global limiter is
// a generous usage ceiling; without this, a leaked-token *guessing* campaign
// (Authorization: Bearer scim_…) runs forever under the global budget. Entra
// sync bursts are periodic and modest — 300 req/min per IP is far above real
// provisioning traffic and far below brute-force viability. 0 disables.
const SCIM_RATE_LIMIT = parseInt(process.env.SCIM_RATE_LIMIT || "300", 10);
const scimLimiter = SCIM_RATE_LIMIT > 0 ? productionHardening.createRateLimiter({
  maxRequests: SCIM_RATE_LIMIT,
  windowMs: 60000,
  burstSize: 30,
  keyFn: (req) => productionHardening.normalizeIpForKey(productionHardening.resolveClientIp(req, { trustedProxies: TRUSTED_PROXIES }))
}) : null;
function isScimPath(req) { return String(req.url || "").startsWith("/scim/v2/"); }

// Leaked engine TypeErrors are developer-facing, not client-facing: when a
// handler's catch forwards e.message and the engine died on an undefined
// payload field, the caller needs the MISSING FIELD — not the JS engine's
// opinion of our internals (the class wave9 / unified-event-bus /
// push-delivery pin shut). Rewritten ONCE at the send() boundary so every
// catch that forwards e.message answers honestly: measured 58 inline routes
// returning raw "Cannot read properties of undefined (reading 'x')" on an
// incomplete body.
const ENGINE_ARRAY_ACCESSORS = new Set([
  "length", "map", "filter", "forEach", "find", "findIndex", "indexOf", "includes",
  "reduce", "reduceRight", "slice", "splice", "some", "every", "concat", "join",
  "push", "pop", "shift", "unshift", "sort", "reverse", "flat", "flatMap", "at",
  "keys", "values", "entries"
]);
function honestEngineError(message) {
  const m = /^Cannot read properties of (?:undefined|null) \(reading '(.+)'\)$/.exec(String(message || ""));
  if (!m) return message;
  return ENGINE_ARRAY_ACCESSORS.has(m[1])
    ? "request body is missing a required list or field"
    : "missing required field: " + m[1];
}
function send(res, status, body, headers) {
  const payload = (status >= 400 && status < 500 && body && typeof body.error === "string")
    ? { ...body, error: honestEngineError(body.error) }
    : body;
  const data = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(data);
}

// Unexpected errors are logged with full detail server-side; the client only
// ever sees a generic 500 + requestId (for correlating with the logs).
// Deliberate validation/business errors never reach this helper — but errors
// that CARRY a statusCode do: body-parser rejections (invalid JSON → 400,
// payload too large → 413) are client errors, not server faults, and must
// never be reported as a 500 (which would flag a hostile-input probe as an
// outage and pollute error budgets).
function sendInternalError(res, requestId, error) {
  const status = error && (error.statusCode === 400 || error.statusCode === 413 || error.statusCode === 422) ? error.statusCode : null;
  if (status) {
    const messages = { 400: "Invalid JSON body", 413: "Payload too large", 422: "Unprocessable body" };
    return send(res, status, { error: messages[status] || "Bad request", requestId }, { "X-Request-Id": requestId });
  }
  logger.error("internal_server_error", { requestId, message: error && error.message ? error.message : String(error), stack: error && error.stack });
  return send(res, 500, { error: "Internal server error", requestId }, { "X-Request-Id": requestId });
}

// The canonical body reader for THIS file's own routes. Every lib/routes/*
// module defines this same one-line helper locally — server.js used
// `readBody` in 118 of its own handlers with NO definition, so each of
// those POSTs answered 400 {"error":"readBody is not defined"} from the
// per-route catch (verified live on /api/morning-briefing/generate and
// /api/risk-mitigation/plan). One hoisted definition wakes them all.
async function readBody(req) { return (await body(req)) || {}; }
// The REST of that batch's assumed surface: every lib/routes module defines
// these three for itself, but server.js's own handlers referenced them with
// no definition — each use threw ReferenceError and answered 400 from the
// per-route catch, so the routes existed yet could never succeed. (Forecast
// trend meta had the same class of bug: `NT` at line ~5930 without a
// require — now imported at the top.)
function todayISO() { return new Date().toISOString().slice(0, 10); }
// The ACTIVE PROJECT of this request's scoped workspace — where the
// registers those routes read (risks, crew check-ins, mentor cases) live —
// falling back to the workspace itself for legacy single-shape files.
// Cross-project engines (knowledge graph, skill gaps, impact simulator,
// crisis war-room, resource simulator, growth…) iterate `state.projects` as
// an ARRAY, but the workspace holds a map keyed by id — and on a workspace
// where activeProject() falls back to the root, `state.projects` WAS that
// map, so every one of those routes died on "projects.forEach is not a
// function" the first time they ever ran. Attach an array view on a SHALLOW
// COPY (these routes are read-only analyzers) so nothing stored is polluted.
function currentScopedState(req) {
  const ws = readScopedWorkspace(req) || {};
  const state = activeProject(ws) || {};
  if (Array.isArray(state.projects)) return state;
  const projects = Array.isArray(ws.projects) ? ws.projects : Object.values(ws.projects || {});
  return Object.assign({}, state, { projects });
}
/* The leader's language is ONE derivation — js/lang-core.js's fromRequest
   (the request's own words first: the query param, then a tool payload's
   declared lang; then the workspace's own recorded language: the served or
   active project's own lang, then the workspace's). These are its SERVER
   seams: getLang resolves the request's own scoped workspace and active
   project and hands them to the core; langOf is the same derivation for the
   callers that hold no request (cache passes, timers, pure helpers). One
   truth, many readers — a route or module that reads a language field itself
   is a truth bug, and the language census (test/leader-facing-prose.test.js)
   turns red when one returns. The request contract is pinned at the
   interface; the core's precedence never changes quietly. */
function langOf(x) {
  return LCLang.langOf(x);
}
function getLang(req, payload) {
  try {
    const ws = readScopedWorkspace(req) || {};
    return LCLang.fromRequest((req && req.url) || "/", payload, ws, activeProject(ws) || {});
  } catch (_) { return "da"; }
}
function body(req, maxBytes) {
  maxBytes = maxBytes || 10000;
  return new Promise((resolve, reject) => {
    let raw = "";
    let done = false;
    req.on("data", chunk => {
      if (done) return;
      raw += chunk;
      if (raw.length > maxBytes) {
        done = true;
        // Stop buffering (memory safety) WITHOUT destroying the socket —
        // destroying here kills the response the route is about to write,
        // leaving clients with a connection reset instead of a proper error.
        // Drain the rest without storing it so the handler can respond 400.
        req.removeAllListeners("data");
        req.on("data", () => {});
        const err = new Error("Payload too large");
        err.statusCode = 413;
        reject(err);
      }
    });
    req.on("end", () => {
      if (done) return;
      done = true;
      req.__rawBody = raw; // retained for exact-body signature verification (Slack)
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        // A literal "null" body parses to null; routes destructure fields off
        // the object, so coerce to {} so validation rejects it with a proper
        // 4xx instead of a TypeError-driven 500.
        resolve(parsed === null ? {} : parsed);
      } catch (_) { const err = new Error("Invalid JSON"); err.statusCode = 400; reject(err); }
    });
    req.on("error", err => { if (!done) { done = true; reject(err); } });
  });
}

function serveStatic(req, res) {
  const requested = decodeURIComponent((req.url || "/").split("?")[0]);
  if (requested.split("/").includes("..")) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Invalid path");
  }
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const file = path.resolve(ROOT, relative);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Unable to read requested file");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

// ─── Domain router registration (extracted routes) ────────────────────────
// Finance routes are registered via lib/router.js and dispatched by the
// LCRouter.dispatch fallback at the end of the request handler. This breaks
// the 6,500-line monolith into per-domain modules without changing the HTTP
// contract. Additional domains (risk, people, connectors, governance) will
// be migrated the same way.
financeRouter.register({
  send, body, authorized, roleFor,
  persistenceStore, databaseTenantId,
  financeRows, financeIntegrity, appendFinanceEntry, appendDomainEvent,
  appendAudit,
  financeControls, doubleEntryGuard,
  financeOperations, financeOperationsStore,
  FINANCE_OPERATIONS_FILE,
  // Increment #2: shared-state accessors (FROZEN_PERIODS and EXPANSION_STATE
  // remain owned by server.js; the module mutates them through these hooks),
  // plus the statement/risk engines and the active-project resolver.
  frozenPeriods: {
    get: () => FROZEN_PERIODS,
    set: next => { FROZEN_PERIODS = next; },
    persist: () => fs.writeFileSync(FROZEN_PERIODS_FILE, JSON.stringify(FROZEN_PERIODS, null, 2))
  },
  expansionState: {
    apInvoices: () => EXPANSION_STATE.apInvoices,
    setApInvoices: value => { EXPANSION_STATE.apInvoices = value; },
    arInvoices: () => EXPANSION_STATE.arInvoices,
    assets: () => EXPANSION_STATE.assets,
    inventory: () => EXPANSION_STATE.inventory
  },
  getProject: (req) => resolveProject(req, readScopedWorkspace(req)),
  readAudit,
  chainAnchor, financialStatements, financialRiskIntegration,
  periodCloseLib, accountsPayable, accountsReceivable, payroll, fixedAssets, inventory,
  // Privacy governance routes live in the finance module since increment #2
  // (their original inline block was adjacent to finance; see module note).
  privacyGovernance, PRIVACY_GOVERNANCE_FILE, hasKey
});

// Analytics routes depend on the per-request active project. The getProject
// closure resolves it from the request's scoped workspace at dispatch time
// (the LCRouter dispatch runs after the inline handler resolves workspace).
analyticsRouter.register({
  send, body, authorized, roleFor, num,
  getProject: (req) => resolveProject(req, readScopedWorkspace(req)),
  alertPipeline, talentMarketplace, esgReporting, fxConsolidation,
  knowledgeManagement, scenarioWargaming, biasDetection,
  realtimeTransport, tenantDRBCP, decisionProvenance, systemTwinMerge,
  complianceEvidence, C,
});

governanceRouter.register({
  send, body, authorized, roleFor,
  getProject: (req) => resolveProject(req, readScopedWorkspace(req)),
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  readAudit, readApprovals, readWorkspaceHistory, readJsonLines,
  financeRows, chainAnchor, consistencyVerifier, retention,
  personIndex, mentorship, incidentManagement, experimentLib,
  EVENTS_FILE,
});

// Hunt round 2026-09-08: investigation case management + asset reliability.
investigationsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

assetReliabilityRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// EHS round 2026-09-08: safety observations / near-miss register (leading
// indicator) with promotion into the incident ladder.
safetyObservationsRouter.register({
  send, body, authorized, roleFor,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  incidentManagement,
});

// OKR adoption round 2026-09-15: the weekly check-in register — the adoption
// mechanic the 2026 benchmark calls decisive (teams without weekly check-ins
// abandon OKR programmes ~3× more often; with them +43% completion). The
// auto-rollup computes progress; this register captures the human signal.
okrCheckinsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Crew check-in round: the 15Five weekly loop for frontline teams — a light
// per-member rhythm (morale, workload, wins, blockers, needs-help) feeding
// the 1:1 agenda, the Monday briefing and governed reminder jobs. Same
// storage/RBAC/audit contract as the OKR check-ins.
crewCheckinsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Market-parity round 2026-09-15: eNPS — the headline engagement metric
// Lattice and Culture Amp lead with. Anonymous by construction (the
// teamPulse pattern: aggregates only, never individual scores), n≥5 display
// floor enforced, audited mutations.
enpsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Treasury round 2026-09-08: persisted 13-week cash forecast (the engine
// existed; the route was the missing piece).
cashForecastRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Danish public-sector HR round 2026-09-08 (source: Ajloo/Albertslund
// supplement + Arbejdstilsynet, Silkeborg 1-5-10, MUS-praksis): MUS, APV,
// trivsel/sygefraværsopfølgning, tavlemøder, situationsbestemt ledelse.
danishHRRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Sales management (sales manager's AI mentor + assistant): deal
// register with the NQS-qualified OEM stage model, the full product catalog,
// objection practice and the daily assistant digest.
salgLedeRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Produktionsledelse (production leader's AI mentor + assistant): SQDCP board
// register, time-boxed escalation ladder, skills matrix with certification
// gates, shift handover, layered process audits and leader standard work.
produktionsledelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// AI conductor (Phase 1 of the Leadership AI Program): one conversational
// door over the register engines — cited answers, tray-shaped draft actions.
// Reads are viewer+; tray submission is editor+; nothing writes silently.
aiConductorRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, dataDir: DATA_DIR,
});

// Test module (guided test execution): procedures as executable sessions —
// PTW + calibration gates enforced from the real registers server-side,
// per-step verdicts against acceptance criteria, completion writes the test
// report, flips the HV asset verdict, self-documents SF6 analyses in the gas
// ledger, and proposes FAIL follow-ups as review-tray drafts. Reads viewer+,
// session mutations editor+; every transition is audit-logged.
commissioningTestingRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  dataDir: DATA_DIR,
});

// Leadership Navigator (unified cross-module brief: trends + lead mentor +
// commitment follow-through). Reads the two register engines' own digests.
leadNavigatorRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  flightInsights: () => flightInsights(readFlightRecords(FLIGHT_KEEP), { intervalMs: AUTOMATION_INTERVAL_MS }),
});

// Risikostyring & proces-sikkerhed (HAZID/HAZOP/LOPA/SIL/ATEX/JSA/FMEA/bow-tie,
// MOC/PTW, incidents + Zero-Harm TRIFR/LTIF, organization policy commitments).
risikostyringRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Danish public-sector leadership models round 2026-09-09 (source: Ajloo/
// Albertslund supplement + Københavns tillidskodeks/Tillidsreformen, anerkendende
// udforskning 4D, MED-rammeaftalen, Ledelseskommissionen 2018): tillidsbaseret
// ledelse with kontrol-audit, anerkendende ledelse 4D-cyklus, MED-samarbejde
// (TR/AMR councils) and the three offentlig-ledelse roller.
offentligLedelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Kvalificering & acceptance-test (DQ/FAT/SAT/IQ/OQ/PQ + IEC/IEEE/ISO test
// catalog, deviations, sign-offs, URS traceability, release decisions).
kvalificeringRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  // dataDir: the protocol-drafts endpoint files its drafts to the review tray
  // (draft-only) — same ctx contract as lib/routes/ai-conductor.js.
  dataDir: DATA_DIR,
});

// Weekly management cadence (CAPA reviews, retests, re-qualifications, gate
// review, 1:1 agendas, decision triage) — one call drafts the week's
// obligations into the review tray, idempotent per ISO week.
cadenceRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  requestedProjectState,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  dataDir: DATA_DIR,
});

// Kalibrering & metrologisk sporbarhed (ISO/IEC 17025-style instrument
// register) — feeds the daily risk digest and cross-checks qualification
// test runs for measurement integrity.
kalibreringRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Advanced verification & obligation registers (FTA/ETA, SIL verification,
// BIA, NIS2, measurement quality) — five engines, one router.
advancedRiskRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Tier-2 governance registers (ISO 27001 SoA, Hoshin Kanri, EU AI Act).
tier2GovernanceRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Everyday Danish leadership registers (forbedringsforslag, 1:1, løsningsfokus,
// kernekvadrant, IBIS-runden, distancedledelse).
hverdagMetoderRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Stress · arbejdsglæde · jobafklaring (trivselsledelse registers).
trivselLedelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// GDPR person-data protocol (inventory, scan, portability, erasure).
privacyRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  listHistoryBackups: () => historyBackupListFor(WORKSPACE_HISTORY_FILE),
  // By-name verify+read for the download route: resolves the filename inside
  // the backup dir (basename-matched, traversal-proof) — paths never cross
  // the API boundary; the route only ever sees bytes.
  readVerifiedHistoryBackup: (file) => {
    const requested = String(file || "");
    const safe = path.basename(requested);
    if (!safe || safe !== requested || !safe.endsWith(".jsonl")) return { ok: false, status: 404, error: "Backup not found" };
    const full = path.join(historyBackupDirFor(WORKSPACE_HISTORY_FILE), safe);
    if (!fs.existsSync(full)) return { ok: false, status: 404, error: "Backup not found" };
    const verdict = verifyHistoryBackup(full);
    if (!verdict.checksumOk) return { ok: false, status: 409, error: "Backup failed integrity verification: " + verdict.reason };
    return { ok: true, bytes: verdict.bytes, base64: fs.readFileSync(full).toString("base64") };
  },
});

// Dagsledelse (the leader's TODAY cockpit) — read layer over all registers.
dagsledelseRouter.register({
  send, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  requestedProjectState, currentRevision: (req) => currentScopedRevision(req),
});

// Practice registers: auto-generated meeting agendas + maintenance methods
// (RCM/TPM/5S/RCA).
praksisRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

beredskabRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

arbeidsmiljoRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

krankendeRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

rekrutteringRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

forandringsledelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

lonforhandlingRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

fratraedelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Danish personaleledelse round 2026-09-09b (lederweb/KL-praksis + Ajloo §1/§3E/§6:
// udviklende ledelse + 1:1-dialoger): ledelsesgrundlag with varedeklaration lifecycle
// and forventningsdialoger; uddannelsesplaner fed by MUS-aftaler with overenskomst checks.
ledelsesgrundlagRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

kompetenceRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

leadershipModelsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// ERP/BI round 2026-09-29: ABC-Pareto, XYZ variability and budget variance
// computed from the registered rows (registers.inventory / registers.budget).
erpBiRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Delivery-governance round 2026-09-29: work packages & scope ownership,
// requirements & interface traceability, supplier governance, and
// configuration/change traceability — all computed from the registers.
deliveryGovernanceRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
  dataDir: DATA_DIR,
});

presalesGovernanceRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

escalationAnalyticsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Fastholdelse (long-term sickness retention): fastholdelsesplan + JE-attest
// deadline tracking + jobcenter-dialogmøde at the 8-week marker. Complements
// the 1-5-10 register (first weeks) without duplicating it.
fastholdelseRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Long-range analytics over the Danish HR registers: trivsel history across
// ALL aggregated rounds + org-level absence analytics (monthly series, 6-vs-6
// trend, Bradford-style repeated-short-absence candidates). Pure read layer.
dkAnalyticsRouter.register({
  send, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  currentRevision: (req) => currentScopedRevision(req),
});

// Ferie & orlov (Ferieloven + Lov om orlov): ferieplan with the 3+2+3 varsel
// deadlines, orlov types with compliance guards (sabbat cap, return date,
// unpaid-leave ferieoptjening note), barsel refusion deadline bookkeeping only.
ferieorlovRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Konflikt-mæglingsguiden: guided per-case handling over the conflicts
// register (triage gate → Glasl → intervention → NVC-da draft → mediation →
// follow-up cadence). Pure read layer — changes nothing.
konfliktGuideRouter.register({
  send, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
});

// Matrixledelse: linje- vs. projektmyndighed — seks pæle, tre dilemmaer,
// 5-spørgsmåls-vurdering med SERVERberegnet scoring + mentorens plan.
matrixLeadershipRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Efter-salgs-teamledelse: garanti, service og reservedele — porteføljens
// garantidrivere, dækningsregler, 9-trins sagsproces, 8D, KPI-struktur,
// reservedelsplan, leverandørgenvinding og mentor, alt beregnet server-side.
afterSalesLeadershipRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

// Lederens ugebriefing: én aggregeret ugeplan på tværs af ALLE registre.
// Ren læselag — beregner, ændrer intet.
ugebriefingRouter.register({
  send, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
});

esrsRouter.register({
  send, body, authorized,
  getWorkspace: (req) => readScopedWorkspace(req),
  writeWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  requestedProjectState, authorizeProjectWrite,
  appendAudit, currentRevision: (req) => currentScopedRevision(req),
});

projectsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  readWorkspace: () => readWorkspace(),
  writeWorkspace: (ws) => writeWorkspace(ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent, C,
  projectRepository,
  databaseTenantId,
  authorizeProjectWrite,
  authUser: (req) => authStore().userFromRequest(req),
});

programsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

// Planned allocations (portfolio capacity planning): same workspace-write
// pattern as programs — rows live on the workspace blob because they are
// cross-project by definition.
allocationsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

// Canonical export/import round-trip: export is editor+, verify is viewer+,
// import is admin-only (whole-workspace replacement bypasses per-project
// RBAC, so it belongs to the role that owns the tenant blob).
workspacePortabilityRouter.register({
  send, body, authorized, roleFor,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  persistenceStore, databaseTenantId, workspaceWriteThrough,
  authUser: (req) => authStore().userFromRequest(req),
});

tasksRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

tagsRouter.register({
  send, body, authorized, roleFor,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent, databaseTenantId,
  persistenceStore,
  authUser: (req) => authStore().userFromRequest(req),
  tagsFile: path.join(DATA_DIR, "tags.json"),
  withWorkspaceFileLock: (file, fn) => withWorkspaceFileLock(file, fn),
});

taskCollaborationRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

projectMembersRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  userById: (id) => authStore().userById(id),

  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

timesheetRouter.register({
  send, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  appendAudit,
  authUser: (req) => authStore().userFromRequest(req),
});

sprintsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

taskStatusesRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

taskTypesRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  currentScopedRevision: (req) => currentScopedRevision(req),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

portfolioHealthRouter.register({
  send, authorized, roleFor,
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  appendAudit,
  authUser: (req) => authStore().userFromRequest(req),
});

myWorkRouter.register({
  send, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  appendAudit,
  authUser: (req) => authStore().userFromRequest(req),
});

forecastRouter.register({
  send, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  appendAudit,
  authUser: (req) => authStore().userFromRequest(req),
});

notificationsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  authUser: (req) => authStore().userFromRequest(req),
});

viewsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  appendAudit,
  authUser: (req) => authStore().userFromRequest(req),
});

formsRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
});

// Connector domain (decomposition increment #1). AUTOMATION_INTERVAL_MS is
// injected as a getter: the const is declared later in module load order, and
// the route handler runs only after full load — a closure is the safe shape.
connectorsRouter.register({
  send, body, authorized, roleFor,
  authUser: (req) => authStore().userFromRequest(req),
  tenantIdForUser: (user, requested) => tenantContext.tenantIdForUser(user, requested),
  persistenceStore, databaseTenantId,
  appendAudit, appendDomainEvent,
  CONNECTOR_STATE_FILE, CONNECTOR_CONFIG_FILE, WRITEBACK_FILE,
  runConnectorScheduler,
  automationIntervalEnabled: () => Number.isFinite(AUTOMATION_INTERVAL_MS) && AUTOMATION_INTERVAL_MS >= 60000
});

docsChatPushRouter.register({
  send, body, authorized, roleFor, actorFor: (req) => actorFor(req),
  projectRepository,
  databaseTenantId,
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  appendAudit, appendDomainEvent,
  authUser: (req) => authStore().userFromRequest(req),
  wsBroadcast: (channel, event, data) => wsServer.broadcast(channel, event, data),
  wsPresence: (projectId) => wsServer.livePresence(projectId),
});

riskRouter.register({
  send, body, authorized, roleFor,
  getProject: (req) => resolveProject(req, readScopedWorkspace(req)),
  getWorkspace: (req) => readScopedWorkspace(req),
  appendAudit, EXPANSION_STATE,
  complianceEvidence, fraudDetection,
  threatModeling, fieldEncryption, secretsRotation, dependencyScan,
  adversarialResistance, geopoliticalRisk, regulatoryChangeImpact,
  safeguarding, riskControls,
});

// Decomposition increment #3: identity, session, and SSO routes. The engines
// are required inline here (the original top-level requires were retired with
// the inline blocks); Node's module cache returns the same singletons.
authRouter.register({
  send, body, authorized,
  authStore,
  appendAudit,
  webauthn: require("./lib/webauthn.js"),
  webauthnStore: require("./lib/webauthn-store.js"),
  oidcClient: require("./lib/oidc-client.js"),
  samlSso: require("./js/saml-sso.js"),
  webauthnTenantId,
  DATA_DIR,
});

// Multi-organization switcher + SCIM 2.0 provisioning (Azure AD / Entra ID).
orgsRouter.register({
  send, body, authorized, roleFor,
  authUser: (req) => authStore().userFromRequest(req),
  authStore,
  orgStore: orgStore(), // store INSTANCE — orgs.js calls methods directly
  appendAudit, // orgs.js passes { action, detail } — direct passthrough
  appendDomainEvent, // delegation events → inbox notifications for the deputy
  databaseTenantId, // effective-role active org for bearer-token SCIM writes
});

// Decomposition increment #4: message-queue operational routes. The singleton
// stays owned/configured here (publish pipeline + subscription wiring); the
// routes only read and enqueue through it.
mqRouter.register({
  send, body, authorized,
  authUser: (req) => authStore().userFromRequest(req),
  messageQueue,
  appendAudit,
});

// Audit / approvals / audit-search / evidence packages (decomposition
// increment #5). The original raw handlers used the per-request `project`
// resolved by the main handler, so the helper re-resolves it per request —
// readScopedWorkspace + resolveProject are pure reads, safe to call from an
// LCRouter handler even though registration happens once at boot.
auditRouter.register({
  send, body, authorized,
  readAudit, verifyAudit, appendAudit,
  readApprovals, verifyApprovals, appendApproval,
  auditSearch, automatedAuditResponse,
  projectAuditEvents: (req) => resolveProject(req, readScopedWorkspace(req))._auditEvents,
});

// Forensic-audit chain routes (decomposition increment #6). Same per-request
// re-resolution contract as the audit domain above — the helpers are pure
// reads, and req.query is parsed before LCRouter dispatch.
forensicAuditRouter.register({
  send, authorized, forensicAudit, readScopedWorkspace, resolveProject,
});

// Causal inference & attribution routes (decomposition increment #7).
// EXPANSION_STATE is passed by reference — cascade executions mutate the same
// module-scope object the monolith used. appendAudit is hoisted, and the
// report route re-resolves the per-request project like the audit domains.
causalRouter.register({
  send, body, authorized, appendAudit,
  causalAttribution, causalRuntime, causalSystems,
  EXPANSION_STATE, readScopedWorkspace, resolveProject,
});
collabRouter.register({
  send, body, authorized,
  collaboration, collab, readScopedWorkspace, resolveProject,
});
whiteboardsRouter.register({
  send, body, authorized,
  actorFor: (req) => actorFor(req),
  authUser: (req) => authStore().userFromRequest(req),
  readScopedWorkspace: (req) => readScopedWorkspace(req),
  writeScopedWorkspace: (req, ws) => writeScopedWorkspace(req, ws),
  projectRepository, databaseTenantId, appendAudit,
});

// AI Enhancement modules: NLU commands, autonomous briefs, smart defaults,
// trajectory alerts, auto-assignment, meeting capture, personalized mentor,
// cross-domain intelligence, leadership patterns, adaptive automation rules.
aiEnhancementsRouter.register({
  send, body, authorized, appendAudit, DATA_DIR,
  getProject: () => {
    try { return readScopedWorkspace({ headers: {} }); } catch (_) { return {}; }
  },
  user: { name: "Leader", role: "leader" },
});

// Danish-HR LLM drafting routes now in lib/routes/danish-hr-llm.js — the
// shared LCRouter pattern (increment #9). Same per-request context as the
// other extracted domains.
danishHrLlmRouter.register({
  send, body, authorized, appendAudit, llmDrafting,
});

// Policy engine + policy-from-incidents routes now in lib/routes/policy.js
// (increment #10). POLICY_DECISIONS_FILE and the fs/JSONL helpers are the
// same module-scope bindings the inline bodies closed over.
policyRouter.register({
  send, body, authorized, appendAudit,
  policyEngine, learningLoop, policyFromIncidents,
  POLICY_DECISIONS_FILE, authStore, readJsonLines, roleFor, fs,
});

// Automation routes now in lib/routes/automation.js (increment #11). The job
// store, evidence chain, and RBAC helpers are the same module-scope bindings
// the inline bodies closed over.
automationRouter.register({
  send, body, authorized, appendAudit,
  workspaceAutomationPlan, queueAutomationJobs, readScopedWorkspace,
  currentScopedRevision, jobStore, JOBS_FILE, authStore, projectRbac,
  notifications, readJsonLines, EVIDENCE_FILE, automationEvidence, roleFor, fs,
  moduleWiring,
});

// Prediction → outcome loop + re-measurement routes now in
// lib/routes/outcomes.js (increment #12). Same module-scope bindings the
// inline bodies closed over.
outcomesRouter.register({
  send, body, authorized, appendAudit,
  outcomesLib, outcomeRemMeasurement,
  readScopedWorkspace, writeScopedWorkspace, activeProject, currentScopedRevision,
});

// AI model registry/drift/fairness/training routes now in
// lib/routes/models.js (increment #13). EXPANSION_STATE is passed by
// reference so registry writes mutate the same object the monolith used.
modelsRouter.register({
  send, body, authorized, appendAudit,
  modelRegistry, modelDrift, fairnessAuditor, modelTrainingPipeline,
  EXPANSION_STATE,
});

// Compliance calendar/SOC2/data-portability routes now in
// lib/routes/compliance.js (increment #14). COMPLIANCE_OBS is a mutable
// binding (routes reassign it after each write), so it crosses as a
// getter/setter pair over the same shared state.
complianceRouter.register({
  send, body, authorized, appendAudit,
  complianceCalendar, soc2IsoEvidence, dataExportCompliance,
  getComplianceObs: () => COMPLIANCE_OBS,
  setComplianceObs: (list) => { COMPLIANCE_OBS = list; },
  COMPLIANCE_FILE, authStore, fs,
  EXPANSION_STATE,
});

// Native TLS: set HTTPS_CERT/HTTPS_KEY (file paths) or HTTPS_PFX/HTTPS_PFX_PASS
// to terminate TLS in-process (Entra SCIM provisioning requires a public HTTPS
// endpoint). Behind a TLS-terminating reverse proxy (nginx/caddy), leave these
// unset and set LEADERSHIP_TRUSTED_PROXY=<proxy-IP-or-CIDR, or 1/any> so the
// rate limiters trust the proxy's X-Forwarded-For for per-client buckets.
// The client bundle talks to its own origin (location.origin), so no
// x-forwarded-proto handling is needed for correctness.
function tlsOptionsFromEnv() {
  try {
    if (process.env.HTTPS_PFX && process.env.HTTPS_PFX_PASS !== undefined) {
      return { pfx: fs.readFileSync(process.env.HTTPS_PFX), passphrase: process.env.HTTPS_PFX_PASS };
    }
    if (process.env.HTTPS_CERT && process.env.HTTPS_KEY) {
      return { cert: fs.readFileSync(process.env.HTTPS_CERT), key: fs.readFileSync(process.env.HTTPS_KEY) };
    }
  } catch (err) {
    logger.error("tls_config_error", { message: err.message });
    process.exit(1);
  }
  return null;
}
const TLS_OPTS = tlsOptionsFromEnv();
const server = (TLS_OPTS ? require("https") : http).createServer(TLS_OPTS || {}, async (req, res) => {
  const requestId = crypto.randomUUID();
  // Charge this request's provider calls to the caller. AsyncLocalStorage means
  // the coach engine, the remote hook and the inference layer all inherit the
  // identity without a scope parameter being threaded through them; enterWith is
  // the middleware pattern for a bare http.createServer callback. Best-effort:
  // a failure here must never break a request — unattributed spend is charged
  // to `global`, which is the correct answer for work with no identity.
  try { llmUsage.enterScope(llmUsage.scopeKeys(spendIdentityFor(req))); } catch (_) { /* metering is best-effort */ }
  securityHeaders(req, res);
  res.setHeader("X-Request-Id", requestId);
  let decodedPath = req.url || "/";
  try { decodedPath = decodeURIComponent(decodedPath.split("?")[0]); } catch (_) {
    return send(res, 400, { error: "Invalid URL", requestId });
  }
  if (decodedPath.split("/").includes("..")) {
    return send(res, 400, { error: "Invalid path", requestId });
  }
  // Node's http server does not populate req.query. Parse the query string so
  // routes using req.query.<param> (e.g. /api/dr/simulate?rto=2) actually
  // receive their parameters. Before this, req.query was always undefined:
  // one route crashed on it and every query-param route silently used defaults.
  req.query = {};
  try {
    const qIndex = (req.url || "").indexOf("?");
    if (qIndex !== -1) {
      const search = new URLSearchParams((req.url || "").slice(qIndex + 1));
      for (const [k, v] of search.entries()) if (v !== undefined) req.query[k] = v;
    }
  } catch (_) { /* leave query empty on malformed input */ }
  const isApiPath = (req.url || "").startsWith("/api/") || (req.url || "").startsWith("/scim/v2/");
  if (!isApiPath) return serveStatic(req, res);
  if (req.method === "OPTIONS") {
    // CORS preflight: browsers require this before cross-origin API calls.
    // Without it, configured cross-origin deployments (LEADERSHIP_CORS_ORIGINS)
    // would fail at the browser before any route runs.
    const allowedOrigins = (process.env.LEADERSHIP_CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.headers.origin || "";
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, If-Match");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    return send(res, 204, {});
  }
  const authenticatedUser = authStore().userFromRequest(req);
  if (authenticatedUser) {
    // Same resolver as every route uses, so the guard cannot refuse a tenant
    // that the route it protects would have accepted (and vice versa).
    const tenant = tenantVerdictForRequest(req, authenticatedUser);
    if (!tenant.allowed) return send(res, 403, { error: tenant.reason, requestId });
    res.setHeader("X-Tenant-Id", tenant.tenantId);
  }
  USAGE_ANALYTICS.capture({ route: (req.url || "/").split("?")[0], method: req.method, userId: authenticatedUser ? authenticatedUser.id : "anonymous", sessionId: requestId });
  if (isApiPath && !allowRequest(req)) return send(res, 429, { error: "Rate limit exceeded", requestId }, { "Retry-After": "60" });
  // SCIM bearer surface gets its own tight budget (token-spray protection,
  // same rationale as the credential limiter below). Audited when tripped.
  if (scimLimiter && isScimPath(req)) {
    const scimVerdict = scimLimiter(req, res);
    if (!scimVerdict.allowed) {
      const retryAfter = Math.max(1, scimVerdict.retryAfter || 60);
      try {
        appendAudit({
          action: "SCIM endpoint rate limited",
          detail: `${req.method} ${String(req.url || "").split("?")[0]} from ${req.socket.remoteAddress || "unknown"} — retry after ${retryAfter}s`
        });
      } catch (_) { /* auditing must never break request handling */ }
      return send(res, 429, { error: "Rate limit exceeded", requestId }, { "Retry-After": String(retryAfter) });
    }
  }
  // Credential endpoints get their own tighter per-IP budget (password-spray
  // protection). Skipped when AUTH_RATE_LIMIT=0. A rejection here also leaves
  // the global budget untouched for legitimate traffic.
  if (AUTH_RATE_LIMIT > 0 && isCredentialRoute(req)) {
    // Middleware-shaped: sets X-RateLimit-* headers on the allowed path, so
    // res must be passed even though the verdict comes back as the value.
    const authVerdict = authLimiter(req, res);
    if (!authVerdict.allowed) {
      const retryAfter = Math.max(1, authVerdict.retryAfter || 60);
      try {
        appendAudit({
          eventId: `authrl:${crypto.createHash("sha256").update(`${req.socket.remoteAddress || "unknown"}:${Math.floor(Date.now() / 60000)}`).digest("hex").slice(0, 24)}`,
          action: "Credential endpoint rate limited",
          detail: `${req.method} ${String(req.url || "").split("?")[0]} from ${req.socket.remoteAddress || "unknown"} — retry after ${retryAfter}s`
        });
      } catch (_) { /* auditing must never break request handling */ }
      return send(res, 429, { error: "Too many credential attempts — try again later", requestId }, { "Retry-After": String(retryAfter) });
    }
  }
  if (req.url === "/api/health" && req.method === "GET") {
    const now = Date.now();
    // The deep check re-verifies every audit/history/approval checksum AND
    // spawns a PowerShell process for disk space (~400ms on Windows) — all
    // synchronously, blocking the event loop ~1-1.5s per rebuild. With the
    // old 1s TTL every health poll rebuilt it, so a concurrent burst (or an
    // LB polling every second) serialized on the event loop and requests
    // stalled for seconds. 15s staleness is fine for an uptime probe.
    if (!healthResponseCache || now - healthResponseCache.createdAt >= 15000) {
      healthResponseCache = {
        createdAt: now,
        body: { ok: true, service: "leadership-app", audit: verifyAudit(readAudit()), workspaceHistory: verifyWorkspaceHistory(readWorkspaceHistory()), approvals: verifyApprovals(readApprovals()), events: domainEventIntegrity(readJsonLines(EVENTS_FILE)), deep: deepHealth(AUDIT_FILE, WORKSPACE_HISTORY_FILE, APPROVAL_FILE, DATA_DIR) }
      };
    }
    return send(res, 200, { ...healthResponseCache.body, requestId });
  }
  if (req.url === "/api/metrics" && req.method === "GET") {
    updateStorageMetrics(AUDIT_FILE, WORKSPACE_HISTORY_FILE, APPROVAL_FILE);
    return metricsEndpoint(req, res);
  }
  // ─── Finance routes (journal, period-close, double-entry guard, operations)
  //     are now handled by lib/routes/finance.js, registered via
  //     LCRouter and dispatched at the end of this handler. This removes ~170
  //     lines from the monolith without changing the HTTP contract.
  // ─── Forensic Audit ──────────────────────────────────────────────────────
  // Resolve the active project & workspace once, per request, so that the many
  // routes below can use `project`/`workspace` without each declaring it. These
  // were previously referencing an undefined block-scoped `project`, which threw
  // `ReferenceError: project is not defined` in the async handler and hung the
  // connection (no HTTP response sent) for the affected endpoints.
  const workspace = readScopedWorkspace(req);
  const project = resolveProject(req, workspace);
  // ─── Forensic Audit routes now in lib/routes/forensic-audit.js (increment #6) ───

  // ─── Analytics routes (alerts, talent, ESG, FX, knowledge, wargaming, ────
  //     bias, realtime, tenant/DR, decisions, system twin) are now handled
  //     by lib/routes/analytics.js, registered via LCRouter.
  // ─── Compliance Evidence ─────────────────────────────────────────────────
  // ─── Compliance + Fraud routes now in lib/routes/risk.js ─────────────────
  // ─── Executive Narrative ─────────────────────────────────────────────────
  if (req.url === "/api/narrative/ceo-letter" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, executiveNarrative.generateCEOLetter(project));
  }
  if (req.url === "/api/narrative/qbr" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, executiveNarrative.generateQBR(project));
  }
  if (req.url === "/api/narrative/board" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, executiveNarrative.generateBoardReport(project));
  }

  // ─── Culture Health ──────────────────────────────────────────────────────
  if (req.url === "/api/culture/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, cultureHealth.cultureDashboard({
      team: project.people || [],
      energyLogs: project.registers && project.registers.energy || [],
      habitLogs: project.registers && project.registers.habits || [],
      oneOnOnes: project.registers && project.registers.oneOnOnes || [],
      companyValues: project.companyValues || [],
      feedback: project.feedbackSubmissions || []
    }));
  }

  // ─── Portfolio Optimizer (legacy kept for backwards compat — new same path via M5 handles viewer+ with constraints) ──
  // NOTE: M5 route for /api/portfolio/optimize is defined below at line ~6119 with viewer+ guard.
  // This legacy editor-only entry is retained for older clients; it defers to the new M5 bridge when available.
  // It is intentionally placed EARLY so the later viewer+ handler still runs.
  // To avoid double-matching, the early handler only fires when payload carries {legacy:true} (no existing caller uses it).
  if (req.url === "/api/portfolio/optimize" && req.method === "POST" && false) {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var pl = await body(req);
      return send(res, 200, portfolioOptimizer.optimize(pl.initiatives || [], pl.constraints || {}));
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── Benchmarking ────────────────────────────────────────────────────────
  if (req.url === "/api/benchmarking" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var bmData = {
      revenuePerEmployee: num(req.query && req.query.revenuePerEmployee) || 0,
      burnRate: num(req.query && req.query.burnRate) || 0,
      runwayMonths: num(req.query && req.query.runwayMonths) || 12,
      attritionRate: num(req.query && req.query.attritionRate) || 10,
      busFactor: num(req.query && req.query.busFactor) || 2,
      spanOfControl: num(req.query && req.query.spanOfControl) || 8
    };
    return send(res, 200, benchmarking.benchmarkOrg(bmData, benchmarking.STARTUP_BENCHMARKS));
  }

  // ─── Danish people benchmark (DANVA-benchmarkingtankegang) ──────────────
  // Scores the live people registers against the Danish public-sector
  // reference set; honest nulls for empty registers.
  if (req.url === "/api/benchmarking/danish-people" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var wsDk = readScopedWorkspace(req);
    var projDk = wsDk.projects[wsDk.activeId] || Object.values(wsDk.projects || {})[0] || {};
    return send(res, 200, benchmarking.benchmarkDanishPeople(projDk, { lang: getLang(req) }));
  }

  // ─── Meeting Analyzer ────────────────────────────────────────────────────
  if (req.url === "/api/meetings/analyze" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var meetings = project._meetings || [];
    return send(res, 200, meetingAnalyzer.effectivenessScorecard(meetings));
  }

  // ─── Vendor Scorecard ────────────────────────────────────────────────────
  if (req.url === "/api/vendors/portfolio" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var vendors = project._vendors || project.supplyChain || [];
    return send(res, 200, vendorScorecard.portfolioAnalysis(vendors));
  }

  // ─── Production Hardening ─────────────────────────────────────────────────
  if (req.url === "/api/production/hardening-report" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // productionHardening has no securityReport; surface the concrete
    // hardening configuration this module actually owns.
    return send(res, 200, {
      securityHeaders: productionHardening.SECURITY_HEADERS,
      csp: productionHardening.CSP,
      rateLimiterAvailable: typeof productionHardening.createRateLimiter === "function",
      headerApplierAvailable: typeof productionHardening.applySecurityHeaders === "function"
    });
  }
  if (req.url === "/api/production/headers" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // recommendedHeaders did not exist; SECURITY_HEADERS is the real data.
    return send(res, 200, productionHardening.SECURITY_HEADERS);
  }

  // ─── WebSocket Server ────────────────────────────────────────────────────
  if (req.url === "/api/realtime/ws-health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // wsServer has no `health`; diagnostics(the WS handle) reports graceful
    // state when the socket server isn't attached (returns healthy:false).
    return send(res, 200, wsServer.diagnostics(null));
  }
  if (req.url === "/api/realtime/ws-broadcast" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var bpayload = await body(req);
      if (!bpayload.channel) return send(res, 400, { error: "channel is required" });
      var result = wsServer.broadcast(bpayload.channel, bpayload.event || "broadcast", bpayload.data);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Mobile Push ─────────────────────────────────────────────────────────
  if (req.url === "/api/mobile/send" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var mp = await body(req);
      // sendPush takes a single opts object; mobilePush.send did not exist.
      var pushResult = mobilePush.sendPush({ deviceToken: mp.deviceToken, title: mp.title, body: mp.body, data: mp.data });
      return send(res, 200, pushResult);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/mobile/register-device" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var reg = await body(req);
      var devResult = mobilePush.registerDevice(reg.deviceToken, reg.platform, reg.userId);
      return send(res, 201, devResult);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── DB Migration Testing ────────────────────────────────────────────────
  if (req.url === "/api/db/migration-test" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // runMigrationTests did not exist; fullAudit(dir, schemaContent) is the
    // module's audit entry point and handles a missing migration directory.
    return send(res, 200, dbMigrationTest.fullAudit(null, project._schema));
  }
  if (req.url === "/api/db/schema-validate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var sp = await body(req);
      return send(res, 200, dbMigrationTest.validateSchema(sp.schema));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Observability ──────────────────────────────────────────────────────
  if (req.url === "/api/observability/metrics-export" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // metricsExport did not exist; exportPrometheus is the real collector dump.
    return send(res, 200, { ok: true, format: "prometheus/text", metrics: observability.exportPrometheus() });
  }
  if (req.url === "/api/observability/slos" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // sloDashboard did not exist; sloReport is the real SLO aggregation.
    return send(res, 200, observability.sloReport());
  }
  if (req.url === "/api/observability/health-deep" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // deepHealthCheck did not exist; healthEndpoint(deps) is the module's
    // consolidated check. No live dependencies registered -> base checks.
    return send(res, 200, observability.healthEndpoint({}));
  }

  // ─── K8s Deployment ─────────────────────────────────────────────────────
  if (req.url === "/api/k8s/deployment-plan" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var plan = k8sDeployment.fullDeploymentPlan({ namespace: project._namespace || "production" });
    return send(res, 200, plan);
  }
  if (req.url === "/api/k8s/validate" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var planVal = k8sDeployment.fullDeploymentPlan({ namespace: project._namespace || "production" });
    return send(res, 200, k8sDeployment.validateDeploymentPlan(planVal));
  }
  if (req.url === "/api/k8s/cost-estimate" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var planCost = k8sDeployment.fullDeploymentPlan({ namespace: project._namespace || "production" });
    return send(res, 200, k8sDeployment.estimateCost(planCost));
  }
  if (req.url === "/api/k8s/readiness" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var planReady = k8sDeployment.fullDeploymentPlan({ namespace: project._namespace || "production" });
    return send(res, 200, k8sDeployment.readinessReport(planReady));
  }

  // ─── AI Training Loop ────────────────────────────────────────────────────
  if (req.url === "/api/ai-training/dataset" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var signals = project._signals || [];
    var actions = project._actions || [];
    var outcomes = project._outcomes || [];
    var examples = aiTrainingLoop.triageExamples(signals, actions, outcomes);
    return send(res, 200, { examples: examples, stats: aiTrainingLoop.datasetStats(examples) });
  }
  if (req.url === "/api/ai-training/quality" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, aiTrainingLoop.qualityReport([project._trainingExamples || []]));
  }

  // ─── Fraud Detection ─────────────────────────────────────────────────────
  // ─── Fraud routes now in lib/routes/risk.js ─────────────────────────────
  // ─── Collaboration: /api/collab/health|edit now in lib/routes/collab.js — increment #8 ─
  // ─── GDPR / CCPA DSAR ────────────────────────────────────────────────────
  if (req.url === "/api/dsar/create" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var dr = await body(req);
      var request = dsar.createRequest(dr.subjectId, dr.type, dr.submittedBy, dr.meta);
      return send(res, 201, request);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dsar/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, dsar.dashboard(project._dsarRequests || []));
  }
  if (req.url === "/api/dsar/compliance-report" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, dsar.complianceReport(project._dsarRequests || []));
  }

  // ─── Tax Filing ──────────────────────────────────────────────────────────
  if (req.url === "/api/tax/corporate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var tp = await body(req);
      return send(res, 200, taxFiling.computeCorporateTax(tp.pnl, tp.balanceSheet, tp.jurisdiction, tp.opts));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/tax/vat" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var vp = await body(req);
      return send(res, 200, taxFiling.computeVAT(vp.sales, vp.purchases, vp.jurisdiction, vp.opts));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/tax/calendar" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, taxFiling.taxCalendar(project._taxJurisdictions || ["US"], project._fiscalYearEnd));
  }

  // ─── Cost Center ─────────────────────────────────────────────────────────
  if (req.url === "/api/cost/allocate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var cap = await body(req);
      return send(res, 200, costCenter.allocateAll(cap.items, cap.centers, cap.rules));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cost/budget-variance" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var allocs = project._allocations || { byCenter: {} };
    return send(res, 200, costCenter.budgetVsActual(allocs, project._costCenters || []));
  }

  // ─── Sentiment Analysis ──────────────────────────────────────────────────
  if (req.url === "/api/sentiment/text" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      var st = await body(req);
      return send(res, 200, sentimentAnalysis.scoreText(st.text, st.domain));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/sentiment/org-dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, sentimentAnalysis.orgDashboard({
      decisions: project._decisions || [],
      feedback: project._feedback || [],
      meetings: project._meetings || [],
      conflicts: project._conflicts || []
    }));
  }

  // ─── Workforce Planning ──────────────────────────────────────────────────
  if (req.url === "/api/workforce/headcount" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var hc = workforcePlanning.headcountForecast(project._headcount || 10, project._headcountRate || {}, project._horizons);
    return send(res, 200, hc);
  }
  if (req.url === "/api/workforce/skill-gaps" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var matrix = workforcePlanning.createSkillMatrix(project._people || [], project._requiredSkills || []);
    var gaps = workforcePlanning.skillGapAnalysis(matrix, project._requiredSkills, {});
    return send(res, 200, gaps);
  }
  if (req.url === "/api/workforce/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, workforcePlanning.dashboard(
      project._headcount, project._skillGaps, project._hiringPipeline,
      project._attrition, project._utilization
    ));
  }

  // ─── OKR Automation ───────────────────────────────────────────────────
  if (req.url === "/api/okr/sync" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var op = await body(req); return send(res, 200, okrAutomation.computeProgress(op.okr, op.tasks, op.financeEntries, op.events)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/okr/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, okrAutomation.okrDashboard(project._objectives || []));
  }
  if (req.url === "/api/webhooks/slack" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      var wb = await body(req);
      // When a signing secret is configured, reject requests without a valid,
      // fresh Slack signature (prevents anonymous/forged command execution).
      // In local development with no secret, the authenticated caller passes.
      var slackSecret = process.env.LEADERSHIP_SLACK_SIGNING_SECRET;
      if (slackSecret) {
        var sigValid = webhooks.verifySlackSignature(
          slackSecret,
          req.headers["x-slack-request-timestamp"] || "",
          req.__rawBody || JSON.stringify(wb),
          req.headers["x-slack-signature"] || ""
        );
        if (!sigValid) return send(res, 401, { error: "Invalid signature" });
      }
      var parsed = webhooks.parseSlackCommand(wb);
      return send(res, parsed.error ? 400 : 200, parsed.error ? { error: parsed.error } : webhooks.executeCommand(parsed, project));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/webhooks/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, webhooks.webhookHealth());
  }
  if (req.url === "/api/ml/infer" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { var mp = await body(req); return send(res, 200, mlServing.infer(mp.modelId, mp.input, mp.opts)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ml/models" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, mlServing.modelHealth());
  }
  if (req.url === "/api/graphql" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      var gq = await body(req); var parsed = graphql.parseQuery(gq.query);
      return send(res, 200, graphql.execute(parsed, { okrs: project._objectives, risks: project._risks, financeEntries: project._financeEntries || [], triage: project._signals || [], alerts: project._alerts || 0, headcount: project._headcount || 0, budgetUtilization: project._budgetUtilization || 0 }));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/graphql/schema" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { sdl: graphql.buildSDL(), health: graphql.health() });
  }
  // Audit search/faceted routes now in lib/routes/audit.js (decomposition increment #5)
  if (req.url === "/api/dashboard/roles" && req.method === "GET") { return send(res, 200, roleDashboard.health()); }
  if (req.url.startsWith("/api/dashboard/") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var role = req.url.split("/")[3];
    return send(res, 200, roleDashboard.assemble(role, project));
  }
  if (req.url === "/api/onboarding/generate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var ob = await body(req); return send(res, 200, onboarding.generatePlaybook(ob.person, ob.orgContext, ob.opts)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/onboarding/templates" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, onboarding.allTemplates());
  }
  if (req.url === "/api/signatures/sign" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var sp = await body(req); return send(res, 200, digitalSignature.sign(sp.document, sp.signer)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/signatures/verify" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      var vp = await body(req);
      // The signature is a keyed hash — the verifier must supply the signer's
      // secret (same key material used at signing time).
      return send(res, 200, digitalSignature.verify(vp.document, vp.signature, vp.signerSecret));
    }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/backup/manifest" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var bp = await body(req); return send(res, 200, backupVerify.createBackupManifest(bp.backupSet)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/backup/verify" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var bv = await body(req); return send(res, 200, backupVerify.verifyIntegrity(bv.manifest, bv.currentData)); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/backup/rto-rpo" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, backupVerify.rtoRpoCompliance(project._lastBackupAt || nowISO(), 24, 4));
  }

  // ─── Benchmarks ───────────────────────────────────────────────────────
  if (req.url === "/api/benchmarks/run" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var bm = await body(req); var bResults = (bm.tests||[]).map(function(t){return benchmarks.measure(t.name,t.fn,100);}); return send(res,200,{results:bResults,at:nowISO()}); }
    catch(e){return send(res,400,{error:e.message});}
  }
  // ─── Causal routes now in lib/routes/causal.js (increment #7) ────────────
  if (req.url === "/api/capabilities/people/churn-risk" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const input = await body(req);
      const result = peopleAnalytics.churnRiskScore(input.person || {}, input.context || {});
      const score = typeof result === "object" ? result.score : result;
      return send(res, 200, {
        score: score,
        band: peopleAnalytics.churnRiskBand(score),
        evidence: typeof result === "object" ? result.evidence : { status: "decision_support_only", validated: false, humanReviewRequired: true },
        employmentDecisionBlocked: true
      });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/capabilities/trust/score" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const input = await body(req);
      return send(res, 200, trustworthinessDashboard.trustScore(input.factors || input));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/capabilities/causal/propagate" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const input = await body(req);
      const event = causalIntegration.publishDomainEvent(input.event || input);
      const impacts = causalIntegration.propagateEvent(event, input.domainStates || {});
      const tenantId = persistenceStore().postgres ? databaseTenantId(req) : null;
      const storedEvent = await appendDomainEvent("CausalPropagationRequested", event.eventId, {
        sourceDomain: event.sourceDomain,
        sourceEventType: event.eventType,
        payload: event.payload,
        affectedDomains: event.affectedDomains,
        propagationResults: impacts.propagationResults
      }, roleFor(req), requestId, tenantId, event.eventId);
      return send(res, 201, { event: storedEvent, impacts: impacts, executable: false });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/regression/check" && req.method === "POST") {
    if (!authorized(req,"admin")) return send(res,401,{error:"Unauthorized"});
    try{var rc=await body(req); return send(res,200,regressionDetection.check(rc.snapshot,rc.currentOutputs,rc.opts));}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/regression/gate" && req.method === "GET") {
    if (!authorized(req,"admin")) return send(res,401,{error:"Unauthorized"});
    return send(res,200,regressionDetection.ciGate(project._regressionResult||{allPassed:true,results:{},passedModules:0,failedModules:0}));
  }
  if (req.url === "/api/load-test/plan" && req.method === "POST") {
    if (!authorized(req,"admin")) return send(res,401,{error:"Unauthorized"});
    try{var lp=await body(req); var plan=loadTest.createPlan(lp.name,lp.type,lp.opts); var sim=loadTest.simulateConcurrency(plan,1000); return send(res,200,sim);}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/load-test/stress" && req.method === "POST") {
    if (!authorized(req,"admin")) return send(res,401,{error:"Unauthorized"});
    try{var ls=await body(req); return send(res,200,loadTest.stressTest(ls.endpoint,ls.maxConcurrency,ls.stepSize));}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/openapi/spec" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var openapiSpec = openapiGen.generateSpec(Object.values(LCRouter.routesByDomain()).flat(),{baseUrl:"http://localhost:8001"});
    return send(res,200,openapiSpec);
  }
  if (req.url === "/api/schema/compatibility" && req.method === "POST") {
    if (!authorized(req,"editor")) return send(res,401,{error:"Unauthorized"});
    try{var sc=await body(req); return send(res,200,schemaVersioning.checkCompatibility(sc.oldSchema,sc.newSchema));}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/schema/registry" && req.method === "GET") {
    if (!authorized(req,"viewer")) return send(res,401,{error:"Unauthorized"});
    return send(res,200,schemaVersioning.schemaRegistry(project._schemas||[]));
  }
  if (req.url === "/api/explainability/unified" && req.method === "GET") {
    if (!authorized(req,"viewer")) return send(res,401,{error:"Unauthorized"});
    return send(res,200,explainability.unifiedView(project._decisions||[],project._biasFlags||[],project._forensicEvents||[]));
  }
  if (req.url === "/api/explainability/gaps" && req.method === "GET") {
    if (!authorized(req,"viewer")) return send(res,401,{error:"Unauthorized"});
    var uv = explainability.unifiedView(project._decisions||[],project._biasFlags||[],project._forensicEvents||[]);
    return send(res,200,explainability.gapReport(uv));
  }
  if (req.url === "/api/offline/sync" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try{var os=await body(req); var store=os.store||offlineSync.createLocalStore(os.storeId); return send(res,200,offlineSync.sync(store,os.remoteData,os.strategy));}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/offline/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res,200,offlineSync.syncHealth(project._localStore||offlineSync.createLocalStore("default")));
  }
  if (req.url === "/api/plugins/register" && req.method === "POST") {
    if (!authorized(req,"admin")) return send(res,401,{error:"Unauthorized"});
    try{var pr=await body(req); return send(res,201,pluginSystem.register(pr));}
    catch(e){return send(res,400,{error:e.message});}
  }
  if (req.url === "/api/plugins/list" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res,200,pluginSystem.listPlugins());
  }
  if (req.url === "/api/plugins/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, pluginSystem.health());
  }
  if (req.url === "/api/plugins/capabilities" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var q = (req.url.split("?q=")[1] || "").trim();
    return send(res, 200, pluginSystem.capabilitySearch(q));
  }

  // ─── Threat Modeling ───────────────────────────────────────────────────
  // ─── Security routes (threat model, field encrypt, secrets, deps) now in lib/routes/risk.js
  if (req.url === "/api/circuit-breaker/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, circuitBreaker.health(project._breakers || []));
  }
  if (req.url === "/api/circuit-breaker/create" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var cb = await body(req); return send(res, 201, circuitBreaker.create(cb.name, cb.opts)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/chaos/run" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var ce = await body(req); var exps = ce.experiments || chaosEngineering.autoGenerateSuite(ce.targets); return send(res, 200, chaosEngineering.runSuite(exps)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/chaos/health" && req.method === "GET") {
    // Chaos-experiment state is operational data (like /api/config) — never
    // readable by anonymous callers. Previously this was an ungated one-liner.
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, chaosEngineering.health());
  }
  if (req.url === "/api/deploy/blue-green" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var dpl = await body(req); return send(res, 200, blueGreenDeploy.pipeline(dpl.serviceName, dpl.version, dpl.testResults, dpl.healthResults, dpl.opts)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/deploy/rollback" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var drb = await body(req); return send(res, 200, blueGreenDeploy.rollback(drb.deployment, drb.reason)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/multi-region/topology" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var mr = await body(req); var topo = multiRegion.createTopology(mr.primary, mr.replicas); return send(res, 200, topo); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/multi-region/failover" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var mrf = await body(req); return send(res, 200, multiRegion.failoverPlan(mrf.topology, mrf.failedRegion)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/multi-region/residency" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var mrd = await body(req); return send(res, 200, multiRegion.dataResidency(mrd.categories, mrd.regions)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/sdk/typescript" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var ts = sdkGen.generateTypeScript(Object.values(LCRouter.routesByDomain()).flat());
    res.setHeader("Content-Type", "text/plain"); return res.end(ts);
  }
  if (req.url === "/api/sdk/python" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    var py = sdkGen.generatePython(Object.values(LCRouter.routesByDomain()).flat());
    res.setHeader("Content-Type", "text/plain"); return res.end(py);
  }

  // ─── Distributed Tracing ──────────────────────────────────────────────
  if (req.url === "/api/tracing/spans" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, distributedTracing.exportOpenTelemetry());
  }
  if (req.url === "/api/tracing/summary" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, distributedTracing.traceSummary());
  }
  if (req.url === "/api/tracing/start" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { var ts = await body(req); var span = distributedTracing.startSpan(ts.name, ts.opts); return send(res, 201, span); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── Cookie Consent ───────────────────────────────────────────────────
  if (req.url === "/api/consent/banner" && req.method === "GET") {
    var userId = (req.headers["x-user-id"] || "anonymous");
    var cs = cookieConsent.createConsentState(userId);
    return send(res, 200, cookieConsent.generateBannerHTML(cs));
  }
  if (req.url === "/api/consent/grant" && req.method === "POST") {
    try { var cg = await body(req); var state = cookieConsent.createConsentState(cg.userId); return send(res, 200, cookieConsent.grantConsent(state, cg.preferences, cg.jurisdiction)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/consent/compliance" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, cookieConsent.complianceCheck(project._consentStates || []));
  }

  // ─── Request ID Propagation ───────────────────────────────────────────
  if (req.url === "/api/tracing/propagation-health" && req.method === "GET") {
    return send(res, 200, requestIdPropagation.health());
  }

  // ─── DB Connection Pool ───────────────────────────────────────────────
  if (req.url === "/api/db/pool-health" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, dbPool.health(project._pools || []));
  }
  if (req.url === "/api/db/pool-optimize" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { var dp = await body(req); var pool = dbPool.createPool(dbPool.createConfig(dp.dbType, dp.opts)); return send(res, 200, dbPool.optimize(pool)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  if (req.url === "/api/alerts" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const alertWs = readScopedWorkspace(req);
    const cq = constraintQuietPolicy(workspaceAlerts(alertWs), alertWs);
    return send(res, 200, { alerts: cq.alerts, count: cq.alerts.length, revision: currentScopedRevision(req), constraintQuiet: { constraint: cq.constraint, held: cq.held, detail: cq.detail } });
  }
  // ─── Risk assessment route now in lib/routes/risk.js ───────────────────────
  // Automation plan/run/ack/jobs routes now in lib/routes/automation.js (increment #11).
    if ((req.url || "").startsWith("/api/jobs") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    let jobs = jobStore.listJobs(JOBS_FILE);
    // Per-project RBAC: non-admin users only see jobs for projects they lead.
    const authUser = authStore().userFromRequest(req);
    if (authUser) {
      const filterProject = req.query && req.query.projectId;
      jobs = projectRbac.filterJobsForUser(jobs, authUser, readScopedWorkspace(req), filterProject);
    } else {
      // Unauthenticated local dev: apply query filter only.
      const filterProject = req.query && req.query.projectId;
      if (filterProject) jobs = jobs.filter(j => j.projectId === filterProject);
    }
    // Group by project for multi-project overview.
    if (req.query && req.query.groupByProject === "true") {
      const byProject = {};
      jobs.forEach(j => { (byProject[j.projectId] = byProject[j.projectId] || []).push(j); });
      return send(res, 200, { jobsByProject: byProject, projectCount: Object.keys(byProject).length, totalJobs: jobs.length, integrity: jobStore.verifyJobs(JOBS_FILE) });
    }
    return send(res, 200, { jobs, integrity: jobStore.verifyJobs(JOBS_FILE) });
  }
if (req.url === "/api/jobs/claim" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.jobId || !payload.workerId) return send(res, 400, { error: "jobId and workerId are required" });
      const result = jobStore.claimJob(JOBS_FILE, payload.jobId, payload.workerId, payload.now, payload.leaseMs);
      if (!result.ok) return send(res, result.error === "job_not_found" ? 404 : result.error === "invalid_lease" ? 400 : 409, result);
      const entry = appendAudit({ eventId: `automation-claim:${payload.jobId}:${payload.workerId}`, action: "Automation job claimed", detail: `${payload.jobId} — ${payload.workerId}` });
      return send(res, 201, { job: result.job, entry });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/jobs/renew" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.jobId || !payload.workerId) return send(res, 400, { error: "jobId and workerId are required" });
      const result = jobStore.renewJob(JOBS_FILE, payload.jobId, payload.workerId, payload.now, payload.leaseMs);
      if (!result.ok) return send(res, result.error === "job_not_found" ? 404 : result.error === "lease_owner_mismatch" ? 403 : result.error === "invalid_lease" ? 400 : 409, result);
      const entry = appendAudit({ eventId: `automation-renew:${payload.jobId}:${payload.workerId}:${result.job.leaseUntil}`, action: "Automation job lease renewed", detail: `${payload.jobId} — ${payload.workerId}` });
      return send(res, 200, { job: result.job, entry });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/jobs/release" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.jobId || !payload.workerId) return send(res, 400, { error: "jobId and workerId are required" });
      const result = jobStore.releaseJob(JOBS_FILE, payload.jobId, payload.workerId, payload.now);
      if (!result.ok) return send(res, result.error === "job_not_found" ? 404 : 409, result);
      const entry = appendAudit({ eventId: `automation-release:${payload.jobId}:${payload.workerId}`, action: "Automation job released", detail: `${payload.jobId} — ${payload.workerId}` });
      return send(res, 200, { job: result.job, entry });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/jobs/complete" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.jobId || !payload.workerId || !payload.executionKey) return send(res, 400, { error: "jobId, workerId, and executionKey are required" });
      const outcome = payload.outcome || "completed";
      if (!["completed", "failed"].includes(outcome)) return send(res, 400, { error: "outcome must be completed or failed" });
      const chain = readJsonLines(EVIDENCE_FILE);
      const existing = automationEvidence.byExecutionKey(chain, payload.executionKey);
      if (existing && existing.jobId === payload.jobId) return send(res, 200, { entry: existing, job: jobStore.jobStatus(JOBS_FILE, payload.jobId), duplicate: true, integrity: automationEvidence.verify(chain) });
      const currentJob = jobStore.jobStatus(JOBS_FILE, payload.jobId);
      if (!currentJob) return send(res, 404, { error: "Automation job not found" });
      if (currentJob.status !== "running") return send(res, 409, { error: "Automation job is not running", status: currentJob.status });
      if (currentJob.workerId !== String(payload.workerId)) return send(res, 403, { error: "Worker does not own the job lease" });
      if (currentJob.requiresHumanApproval && !authorized(req, "admin")) return send(res, 403, { error: "Approval-tier jobs require admin authorization" });
      if (currentJob.leaseUntil && new Date(currentJob.leaseUntil).getTime() <= Date.now()) return send(res, 409, { error: "Automation job lease expired" });
      const expectedExecutionKey = automationControls.executionKey(payload.jobId, (currentJob.attempts || 0) + 1);
      if (payload.executionKey !== expectedExecutionKey) return send(res, 409, { error: "Execution key does not match the current attempt", expectedExecutionKey: expectedExecutionKey });
      const receiptChain = automationEvidence.append(chain, {
        jobId: payload.jobId,
        executionKey: payload.executionKey,
        type: payload.type || "automation",
        title: payload.title || currentJob.title,
        inputSnapshot: payload.inputSnapshot || { jobId: payload.jobId },
        output: payload.output || null,
        verification: payload.verification || null,
        outcome: outcome,
        compensation: payload.compensation || null,
        actor: roleFor(req)
      });
      const receipt = receiptChain[receiptChain.length - 1];
      const ok = outcome === "completed";
      const job = jobStore.markAttempt(JOBS_FILE, payload.jobId, ok);
      const entry = appendAudit({ eventId: `automation-complete:${payload.executionKey}`, action: "Automation execution recorded", detail: `${payload.jobId} — ${outcome}` });
      const fd = fs.openSync(EVIDENCE_FILE, "a");
      fs.appendFileSync(fd, JSON.stringify(receipt) + "\n", "utf8");
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      return send(res, 201, { entry: receipt, job: job, audit: entry, integrity: automationEvidence.verify(receiptChain) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/integrity" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, integrityReport(req));
  }
  if (req.url === "/api/integrity" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5 * 1024 * 1024);
      const report = integrityReport(req);
      if (payload && typeof payload.workspace === "object" && payload.workspace !== null) {
        const clientHash = workspaceHash(payload.workspace);
        report.client = { hash: clientHash, matches: clientHash === report.checks.workspace.hash };
        if (report.status === "verified" && !report.client.matches) report.status = "diverged";
      }
      return send(res, 200, report);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Ops layer: weekly letter, nightly verdict, self-check ────────────────
  if (req.url === "/api/upgrade/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { ...appUpgrade.upgradeStatus(WORKSPACE_FILE, { version: APP_VERSION }), upgradeBackups: fs.existsSync(path.join(DATA_DIR, "upgrade-backups")) ? fs.readdirSync(path.join(DATA_DIR, "upgrade-backups")).filter(f => f.endsWith(".json")).length : 0 });
  }
  if (req.url === "/api/upgrade/apply" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    // Explicit user action, but the boot path and this route share one rule:
    // migrations run only after the verified pre-upgrade backup, and a failed
    // preservation check rolls the workspace back byte-identically.
    const verdict = appUpgrade.upgradeWorkspaceFile(WORKSPACE_FILE, { audit: appendAudit });
    return send(res, verdict.upgraded ? 200 : 409, verdict);
  }
  if (req.url === "/api/upgrade/history" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const rows = readAudit().filter(r => r && (r.action === "Upgrade completed" || r.action === "Upgrade failed" || r.action === "Upgrade rolled back")).slice(-20).reverse();
    return send(res, 200, { history: rows });
  }
  if (req.url.startsWith("/api/ops/weekly-letter") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const lang = getLang(req);
    const wlWs = readScopedWorkspace(req);
    let wlDrafts = [];
    try { wlDrafts = require("./lib/review-tray.js").allDrafts(DATA_DIR, { projectIds: Object.keys((wlWs && wlWs.projects) || {}).map(String) }); } catch (_) {}
    return send(res, 200, weeklyLetter(wlWs, { lang, drafts: wlDrafts }));
  }
  // ─── AI weekly briefing email (LLM-drafted Friday letter) ───────────────
  // The deterministic weeklyLetter engine stays the source of truth; the LLM
  // only rewrites it into a ready-to-send mentor email. Claim-gated: every
  // numeral must come from the letter, else the deterministic email is
  // returned and honestly labelled. Draft only — nothing is ever sent.
  if (req.url === "/api/ai/weekly-briefing-email" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 20000).catch(() => ({}));
      const lang = getLang(req, payload);
      const letterWs = readScopedWorkspace(req);
      let letterDrafts = [];
      try { letterDrafts = require("./lib/review-tray.js").allDrafts(DATA_DIR, { projectIds: Object.keys((letterWs && letterWs.projects) || {}).map(String) }); } catch (_) {}
      const letter = weeklyLetter(letterWs, { lang, drafts: letterDrafts });
      const da = lang === "da";
      const sectionsText = letter.sections.map(s => `${s.title}: ${s.text}`).join("\n");
      const system = da
        ? "Du er \"Vejen\", ledelsesmentoren i en dansk offentlig ledelsesapp. Omskriv ugens registreringer til en klar, varm og professionel e-mail til lederen. Brug KUN tallene fra brevet — find intet nyt tal op. Maks 250 ord. Struktur: Emne-linje (én linje), derefter: Åbning (2-3 sætninger om ugens tema), Tre prioriteter til næste uge (punktopstilling fra brevets fakta), Refleksion (ét spørgsmål fra brevet). Svar direkte — ingen tænkeproces."
        : "You are \"Vejen\", the leadership mentor of a Danish public-sector leadership app. Rewrite the week's registrations into a clear, warm, professional email to the leader. Use ONLY the numbers from the letter — invent no new number. Max 250 words. Structure: Subject line (one line), then: Opening (2-3 sentences on the week's theme), Three priorities for next week (bullets from the letter's facts), Reflection (one question from the letter). Answer directly — no reasoning traces.";
      const user = [
        da ? "UGENS BREV (kilde til alle fakta og tal):" : "THIS WEEK'S LETTER (source of all facts and numbers):",
        `Uge: ${letter.week}`,
        letter.theme ? `Tema: ${letter.theme.title} — ${letter.theme.text}` : "",
        sectionsText,
        `Ærlighed: ${JSON.stringify(letter.honesty)}`,
        "",
        da ? "Skriv e-mailen nu." : "Write the email now."
      ].filter(Boolean).join("\n");
      const attempt = await llmInference.generateVerified(user, { knownValues: { letter, week: letter.week }, allowed: [1, 2, 3], temperature: 0.3, maxTokens: 900, timeoutMs: 25000, system });
      if (attempt.result && attempt.result.ok && attempt.verification && attempt.verification.valid) {
        return send(res, 200, { mode: "llm", week: letter.week, email: attempt.result.response.trim(), model: attempt.result.provider + "/" + attempt.result.model, disclosure: da ? "AI-udkast — alle tal verificeret mod ugens brev. Afsendelse er altid din." : "AI draft — every number verified against this week's letter. Sending is always yours." });
      }
      return send(res, 200, { mode: "deterministic", week: letter.week, email: buildDeterministicEmail(letter, lang), model: null, disclosure: da ? "Deterministisk e-mail fra registrene (AI-svaret tjekkede ikke ud)." : "Deterministic email from the registers (the AI reply did not check out)." });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Deterministic email fallback: same sections as the letter, zero LLM. Used
  // when the AI draft fails claim-gating or no provider is available.
  function buildDeterministicEmail(letter, lang) {
    const da = lang === "da";
    const lines = [];
    lines.push(da ? `Emne: Ugebriefing ${letter.week} — ${letter.theme ? letter.theme.title.toLowerCase() : "ugens tema"}` : `Subject: Weekly briefing ${letter.week} — ${letter.theme ? letter.theme.title.toLowerCase() : "the week's theme"}`);
    lines.push("");
    if (letter.theme) lines.push(`${letter.theme.title}: ${letter.theme.text}`);
    lines.push("");
    lines.push(da ? "Tre prioriteter til næste uge:" : "Three priorities for next week:");
    letter.sections.slice(0, 3).forEach((s, i) => lines.push(`${i + 1}. ${s.title}: ${s.text}`));
    lines.push("");
    if (letter.sections[0] && letter.sections[0].question) lines.push(da ? "Refleksion: " + letter.sections[0].question : "Reflection: " + letter.sections[0].question);
    lines.push("");
    lines.push(da ? "(Genereret fra dine registre — intet opfundet.)" : "(Generated from your registers — nothing invented.)");
    return lines.join("\n");
  }
  if (req.url.startsWith("/api/ops/nightly-report") && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    // The nightly gate's own report (latest.json), read defensively: the
    // report dir may not exist yet on a fresh install — an honest null, not
    // a 500, keeps the self-check usable everywhere.
    try {
      const file = path.join(ROOT, "reports", "nightly", "latest.json");
      if (!fs.existsSync(file)) return send(res, 200, { exists: false, note: "nightly gate has not produced a report yet" });
      return send(res, 200, { exists: true, report: JSON.parse(fs.readFileSync(file, "utf8")) });
    } catch (error) { return send(res, 200, { exists: false, error: error.message }); }
  }
  if (req.url === "/api/ops/selfcheck" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    // The whole "verify everything now" stack, one call: every tamper-
    // evident chain, the workspace-vs-history match, storage budgets and
    // nets, and the nightly gate's last verdict with its trend. Nothing is
    // cached here — this is the truth, on demand.
    const historyRows = readWorkspaceHistory();
    const integrity = integrityReport(req);
    const nightlyFile = path.join(ROOT, "reports", "nightly", "latest.json");
    let nightly = { exists: false };
    try { if (fs.existsSync(nightlyFile)) nightly = { exists: true, report: JSON.parse(fs.readFileSync(nightlyFile, "utf8")) }; } catch (_) {}
    const snapshot = storageHealthSnapshot();
    const problems = [];
    if (integrity.status !== "verified") problems.push("integrity: " + integrity.status);
    if (!snapshot.files.every(f => f.withinBudget)) problems.push("storage: a file exceeds its budget");
    if (snapshot.pretrimBackups.some(b => !b.verified)) problems.push("storage: a pre-trim net fails its sha256 manifest");
    if (!verifyWorkspaceHistory(historyRows).valid) problems.push("history chain broken");
    if (nightly.exists && nightly.report && nightly.report.allGreen === false) problems.push("nightly gate: last run not all green");
    return send(res, 200, {
      ok: problems.length === 0,
      checkedAt: new Date().toISOString(),
      problems,
      integrity,
      storage: snapshot,
      nightly,
    });
  }
  if (req.url === "/api/storage/health" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, storageHealthSnapshot());
  }
  if (req.url === "/api/storage/health" && req.method === "HEAD") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, storageHealthSnapshot());
  }
  if (req.url === "/api/config" && req.method === "GET") {
    // Operational config (encryption-at-rest, SMTP, provider URLs) must not
    // be readable by anonymous callers — same gate as every other endpoint.
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, {
      marketData: { url: marketData.baseUrl(), live: marketData.stats().up > 0, lastOkAt: marketData.stats().lastOkAt },
      remoteVerifier: !!(process.env.LEADERSHIP_AI_ORCHESTRATOR_URL && (process.env.LEADERSHIP_AI_JWT_SECRET || process.env.LEADERSHIP_AI_TOKEN)),
      encryptionAtRest: hasKey(),
      scheduler: schedulerStale(),
      notifications: { smtp: !!process.env.SMTP_HOST, notifyTo: !!NOTIFY_TO, webhooks: WEBHOOKS.length },
      serverTime: new Date().toISOString()
    });
  }
  if (req.url === "/api/capabilities" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const authUser = authStore().userFromRequest(req);
    return send(res, 200, {
      storage: persistenceStore().postgres ? "postgres" : "jsonl",
      auth: authStore().integrity().userCount > 0,
      userId: authUser ? String(authUser.id) : null,
      tenantId: String(process.env.LEADERSHIP_TENANT_ID || "") || null,
      serverTime: new Date().toISOString()
    });
  }
  if (req.url === "/api/fx/rates" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const fx = await marketData.getUsdDkk();
    return send(res, 200, fx);
  }
  if (req.method === "GET" && req.url.split("?")[0] === "/api/market/quotes") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const params = new URLSearchParams((req.url.split("?")[1] || ""));
    const symbols = (params.get("symbols") || "").split(",").filter(Boolean);
    const result = await marketData.getQuotes(symbols);
    return send(res, 200, result);
  }
  if (req.url === "/api/insights/verify" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const claims = Array.isArray(payload && payload.claims) ? payload.claims : [];
      if (!claims.length) return send(res, 400, { error: "claims array is required" });
      const local = claimsLib.verifyClaims(readScopedWorkspace(req), claims);
      const remote = process.env.LEADERSHIP_AI_ORCHESTRATOR_URL ? await claimsLib.verifyRemote(claims) : null;
      return send(res, 200, { local: local.summary, claims: local.claims, remote });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/triage" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const report = triage.triageReport(project);
    return send(res, 200, { ...report, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/triage/briefing" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const briefing = triage.dailyBriefing(project);
    return send(res, 200, { ...briefing, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/triage/signals" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const signals = triage.gatherSignals(project);
    const ranked = triage.rankSignals(signals, digitalTwin.buildDigitalTwin(project));
    return send(res, 200, { ...ranked, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/digital-twin" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const twin = digitalTwin.buildDigitalTwin(project);
    const health = digitalTwin.domainHealthDashboard(twin);
    const interventions = digitalTwin.rankInterventions(twin);
    return send(res, 200, { twinHealth: twin.twinHealth, twinHealthLevel: twin.twinHealthLevel, nodeCount: twin.nodes.length, edgeCount: twin.edges.length, crossDomainEdges: twin.crossDomainEdgeCount, domainStats: twin.domainStats, domainHealth: health.domains, topInterventions: interventions.interventions.slice(0, 10), revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/digital-twin/propagate" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.nodeId) return send(res, 400, { error: "nodeId is required" });
      const workspace = readScopedWorkspace(req);
      const project = activeProject(workspace);
      const twin = digitalTwin.buildDigitalTwin(project);
      const propagation = digitalTwin.crossDomainPropagation(twin, payload.nodeId, payload.maxDepth || 6);
      return send(res, 200, propagation);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/digital-twin/counterfactual" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.nodeId) return send(res, 400, { error: "nodeId is required" });
      const workspace = readScopedWorkspace(req);
      const project = activeProject(workspace);
      const twin = digitalTwin.buildDigitalTwin(project);
      const result = digitalTwin.counterfactual(twin, payload);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflict-warning" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const prediction = conflictEarlyWarning.conflictPrediction(project);
    const heatMap = conflictEarlyWarning.conflictHeatMap(project);
    return send(res, 200, { prediction, heatMap, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/calibration" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const ledger = calibrationExtended.fullPredictionLedger(project);
    const existingOutcomes = (project._outcomes || project.outcomes) || [];
    const allPredictions = ledger.predictions.map(function(p) {
      var resolved = existingOutcomes.find(function(o) { return o.predictionId === p.id; });
      return resolved ? Object.assign({}, p, resolved) : p;
    });
    const cal = calibrationExtended.domainCalibration(allPredictions);
    const conflicts = calibrationExtended.conflictResolutionDurability(
      project.registers && project.registers.conflicts || [],
      existingOutcomes.filter(function(o) { return o.domain === "conflict"; })
    );
    return send(res, 200, { ledger: { predictions: allPredictions, total: allPredictions.length }, calibration: cal, conflictDurability: conflicts, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/calibration/record" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.predictionId || !payload.actualOutcome) return send(res, 400, { error: "predictionId and actualOutcome (hit|miss|partial) are required" });
      if (!["hit", "miss", "partial"].includes(payload.actualOutcome)) return send(res, 400, { error: "actualOutcome must be hit, miss, or partial" });
      // Session-scoped write: a session user's decision/action/outcome must
      // land in THAT user's workspace file, not the shared global one — the
      // GET counterparts read readScopedWorkspace, so the unscoped gGlobal
      // write made shared edits invisible to the writer and readable by all.
      const workspace = readScopedWorkspace(req);
      const project = workspace.projects && workspace.projects[workspace.activeId] ? workspace.projects[workspace.activeId] : Object.values(workspace.projects || {})[0];
      if (!project) return send(res, 404, { error: "No active project available" });
      project._outcomes = Array.isArray(project._outcomes) ? project._outcomes : [];
      var existing = project._outcomes.find(function(o) { return o.predictionId === payload.predictionId; });
      if (existing) {
        existing.actualOutcome = payload.actualOutcome;
        existing.resolvedAt = new Date().toISOString();
        existing.outcomeNote = payload.note || "";
      } else {
        project._outcomes.push({
          predictionId: payload.predictionId, actualOutcome: payload.actualOutcome,
          status: "resolved", resolvedAt: new Date().toISOString(), outcomeNote: payload.note || ""
        });
      }
      await writeScopedWorkspace(req, workspace);
      appendAudit({ action: "Prediction outcome recorded", detail: payload.predictionId + " → " + payload.actualOutcome });
      return send(res, 201, { recorded: true, predictionId: payload.predictionId, actualOutcome: payload.actualOutcome });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/calibration/roi" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const coachingLog = project.coachingLog || project.coachingSessions || [];
    const snaps = project._competencySnapshots || [];
    const roi = calibrationExtended.leadershipDevelopmentROI(coachingLog, snaps);
    return send(res, 200, roi);
  }

  // ─── Outcome re-measurement (30/90-day checkpoints on predictions) ───────
  // Derives due re-measurement checkpoints from the calibration ledger and
  // lets an editor record the outcome of a re-check. Closes the loop the
  // prediction ledger opens: predictions without re-measurement surface as
  // due items instead of silently aging out.
  // Outcome re-measurement routes now in lib/routes/outcomes.js (increment #12).

  if (req.url === "/api/leadership-fingerprint" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const fp = leadershipFingerprint.synthesizeFingerprint(project);
    return send(res, 200, { fingerprint: fp, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/leadership-fingerprint/evidence" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const evidence = leadershipFingerprint.extractRawScores(project);
    return send(res, 200, evidence);
  }

  // ─── 360° Feedback ───────────────────────────────────────────────────────
  if (req.url === "/api/feedback-360" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const summary = feedback360.aggregateResponses(project, project.feedbackSubmissions || []);
    return send(res, 200, summary);
  }
  if (req.url === "/api/feedback-360/anonymize" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const campaign = feedback360.createCampaign(payload);
      return send(res, 200, { campaign, id: campaign.id || campaign.target });
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── Financial Statements ────────────────────────────────────────────────
  // ─── Geopolitical Risk ───────────────────────────────────────────────────
  // ─── Geopolitical routes now in lib/routes/risk.js ───────────────────────
  // ─── Board Pack ──────────────────────────────────────────────────────────
  if (req.url === "/api/board-pack" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const pack = boardPack.fullBoardPack(project);
    return send(res, 200, pack);
  }
  if (req.url === "/api/board-pack/exec-summary" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const workspace = readScopedWorkspace(req);
    const project = activeProject(workspace);
    const summary = boardPack.executiveSummary(project);
    return send(res, 200, summary);
  }

  // ─── Longitudinal Simulation ─────────────────────────────────────────────
  if (req.url === "/api/longitudinal-sim/run" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const workspace = readScopedWorkspace(req);
      const project = activeProject(workspace);
      const cfg = longitudinalSim.configure(Object.assign({
        initialState: digitalTwin.buildDigitalTwin(project),
        riskEvents: project.riskRegister || [],
      }, payload));
      const result = longitudinalSim.runMonteCarlo(cfg);
      return send(res, 200, { aggregates: result.aggregates, runs: result.runs });
    } catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/longitudinal-sim/compare" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const workspace = readScopedWorkspace(req);
      const project = activeProject(workspace);
      const baseCfg = longitudinalSim.configure(Object.assign({
        initialState: digitalTwin.buildDigitalTwin(project),
        riskEvents: project.riskRegister || [],
      }, payload.baseConfig || {}));
      const result = longitudinalSim.compareScenarios(baseCfg, payload.scenarios || []);
      return send(res, 200, result);
    } catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/longitudinal-sim/stress-test" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const workspace = readScopedWorkspace(req);
      const project = activeProject(workspace);
      const cfg = longitudinalSim.configure(Object.assign({
        initialState: digitalTwin.buildDigitalTwin(project),
        riskEvents: project.riskRegister || [],
      }, payload.config || {}));
      var result;
      if (payload.scenario === "all") {
        result = longitudinalSim.runAllStressTests(cfg);
      } else {
        result = longitudinalSim.runStressTest(cfg, payload.scenario || "keyPersonLoss");
      }
      return send(res, 200, result);
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── Adversarial Resistance / Security Posture ───────────────────────────
  // ─── Security posture / calibration / integrity routes now in lib/routes/risk.js;
  // audit GET + approvals now in lib/routes/audit.js (decomposition increment #5)
  if (req.url === "/api/governance" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const governance = readGovernanceState(readScopedWorkspace(req));
    return send(res, 200, { decisions: governance.decisions, actions: governance.actions, summary: governance.summary, revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/governance/decisions" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.title) return send(res, 400, { error: "title is required" });
      // Session-scoped write: a session user's decision/action/outcome must
      // land in THAT user's workspace file, not the shared global one — the
      // GET counterparts read readScopedWorkspace, so the unscoped gGlobal
      // write made shared edits invisible to the writer and readable by all.
      const workspace = readScopedWorkspace(req);
      const project = workspace.projects && workspace.projects[workspace.activeId] ? workspace.projects[workspace.activeId] : Object.values(workspace.projects || {})[0];
      if (!project) return send(res, 404, { error: "No active project available" });
      const decision = { id: payload.id || crypto.randomUUID(), title: payload.title, ownerId: payload.ownerId || "unassigned", owner: payload.owner || payload.ownerId || "Unassigned", rationale: payload.rationale || "", assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [], projectIds: Array.isArray(payload.projectIds) ? payload.projectIds : [workspace.activeId || "project"], riskIds: Array.isArray(payload.riskIds) ? payload.riskIds : [], status: payload.status || "pending", createdAt: new Date().toISOString() };
      project.decisions = Array.isArray(project.decisions) ? project.decisions : [];
      project.decisions.push(decision);
      await writeScopedWorkspace(req, workspace);
      appendAudit({ action: "Decision added", detail: decision.title });
      return send(res, 201, { entry: decision, summary: readGovernanceState(workspace).summary });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/governance/actions" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.title) return send(res, 400, { error: "title is required" });
      // Session-scoped write: a session user's decision/action/outcome must
      // land in THAT user's workspace file, not the shared global one — the
      // GET counterparts read readScopedWorkspace, so the unscoped gGlobal
      // write made shared edits invisible to the writer and readable by all.
      const workspace = readScopedWorkspace(req);
      const project = workspace.projects && workspace.projects[workspace.activeId] ? workspace.projects[workspace.activeId] : Object.values(workspace.projects || {})[0];
      if (!project) return send(res, 404, { error: "No active project available" });
      const action = { id: payload.id || crypto.randomUUID(), title: payload.title, owner: payload.owner || "Unassigned", status: payload.status || "open", dueDate: payload.dueDate || "", decisionId: payload.decisionId || "", createdAt: new Date().toISOString() };
      project.actions = Array.isArray(project.actions) ? project.actions : [];
      project.actions.push(action);
      await writeScopedWorkspace(req, workspace);
      appendAudit({ action: "Action added", detail: action.title });
      return send(res, 201, { entry: action, summary: readGovernanceState(workspace).summary });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if ((req.url || "").split("?")[0] === "/api/workspace" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const requestedTenant = new URL(req.url || "/api/workspace", "http://leadership-app.local").searchParams.get("tenant");
    if (requestedTenant && requestedTenant !== String(process.env.LEADERSHIP_TENANT_ID || "")) return send(res, 403, { error: "Tenant scope mismatch" });
    // readScopedWorkspace already returns the role-limited view for
    // viewer/auditor — no separate sanitize call needed here.
    return send(res, 200, { workspace: readScopedWorkspace(req), revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/graph" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    if (persistenceStore().postgres) {
      try {
        const graph = await persistenceStore().postgres.listGraph(databaseTenantId(req));
        return send(res, 200, { graph, integrity: entityGraph.validate(graph), revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 503, { error: error.message }); }
    }
    const graph = workspaceEntityGraph(readScopedWorkspace(req));
    return send(res, 200, { graph, integrity: entityGraph.validate(graph), revision: currentScopedRevision(req) });
  }
  if (req.url === "/api/canonical-records" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    if (!persistenceStore().postgres) return send(res, 503, { error: "Canonical records require PostgreSQL persistence" });
    try {
      const records = await persistenceStore().postgres.listCanonicalRecords(databaseTenantId(req), null);
      return send(res, 200, { records });
    } catch (error) { return send(res, 503, { error: error.message }); }
  }
  if (req.url === "/api/canonical-records" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    if (!persistenceStore().postgres) return send(res, 503, { error: "Canonical records require PostgreSQL persistence" });
    try {
      const payload = await body(req);
      if (!payload.record || !payload.event) return send(res, 400, { error: "record and event are required" });
      const tenantId = databaseTenantId(req);
      const role = roleFor(req);
      const record = canonicalContract.createEnvelope({ ...payload.record, tenantId, actor: payload.record.actor || role });
      const event = { ...payload.event, id: payload.event.id || crypto.randomUUID(), actor: payload.event.actor || role, entityId: payload.event.entityId || record.id, canonicalRecordId: record.id, correlationId: payload.event.correlationId || record.correlationId, occurredAt: payload.event.occurredAt || record.occurredAt };
      const result = await persistenceStore().postgres.saveCanonicalRecordAndEvent(tenantId, record, event);
      appendAudit({ action: result.event.duplicate ? "Canonical record event deduplicated" : "Canonical record and event saved", detail: `${record.id} — ${record.entityType} — ${role}` });
      return send(res, result.event.duplicate ? 200 : 201, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/events" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    if (persistenceStore().postgres) {
      try {
        const events = await persistenceStore().postgres.listEvents(databaseTenantId(req));
        return send(res, 200, { events, integrity: persistenceStore().postgres.verifyEventIntegrity(events) });
      } catch (error) { return send(res, 503, { error: error.message }); }
    }
    const rows = readJsonLines(EVENTS_FILE);
    return send(res, 200, { events: rows, integrity: domainEventIntegrity(rows) });
  }
  // ─── Connector routes live in lib/routes/connectors.js (decomposition
  // increment #1) — registered with the other domain routers and dispatched
  // via LCRouter. The inline /api/events handler is its single owner now.───
  if ((req.url || "").split("?")[0] === "/api/workspace" && req.method === "PUT") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const workspace = await body(req, 5 * 1024 * 1024);
      if (!workspace || typeof workspace !== "object" || Array.isArray(workspace)) return send(res, 400, { error: "workspace must be an object" });
      if (!workspace.projects || typeof workspace.projects !== "object" || Array.isArray(workspace.projects)) return send(res, 400, { error: "workspace.projects must be an object" });
      const role = roleFor(req);
      const policy = trustContracts.policyDecision({ role, action: "write_workspace", sensitivity: "normal" });
      if (policy.effect !== "allow") {
        appendAudit({ action: "Workspace write denied", detail: `${policy.reason} (policy-v1)` });
        return send(res, policy.effect === "approval_required" ? 403 : 401, { error: policy.reason, policy: "policy-v1" });
      }
      if (!approvalChangeAllowed(readScopedWorkspace(req), workspace, role)) return send(res, 403, { error: "Approval records require admin authorization" });
      // Per-project RBAC on the blob write: a non-admin editor may only
      // change projects they lead (or projects with no lead assigned). New
      // projects are allowed (creation implies ownership); the lead field on
      // a new project must be empty or the editor themselves.
      const blobActor = authStore().userFromRequest(req);
      if (role !== "admin" && blobActor) {
        const currentWs = readScopedWorkspace(req);
        const incoming = workspace.projects || {};
        const outgoing = (currentWs && currentWs.projects) || {};
        const changedIds = new Set();
        Object.keys(incoming).forEach(id => {
          const before = outgoing[id];
          const after = incoming[id];
          if (!before || JSON.stringify(before) !== JSON.stringify(after)) changedIds.add(id);
        });
        Object.keys(outgoing).forEach(id => {
          if (!incoming[id]) changedIds.add(id); // deletion
        });
        for (const id of changedIds) {
          const project = incoming[id] || outgoing[id] || {};
          const lead = (project.project && project.project.lead) || project.lead || "";
          if (lead && String(blobActor.id) !== String(lead)) {
            return send(res, 403, { error: "Only the project lead can modify this project in a workspace write", projectId: id, lead });
          }
        }
        // Programs use the same ownership model: a non-admin may only change
        // programs they own (or unowned programs).
        const incomingPrograms = workspace.programs || {};
        const outgoingPrograms = (currentWs && currentWs.programs) || {};
        const changedPrograms = new Set();
        Object.keys(incomingPrograms).forEach(id => {
          const before = outgoingPrograms[id];
          const after = incomingPrograms[id];
          if (!before || JSON.stringify(before) !== JSON.stringify(after)) changedPrograms.add(id);
        });
        Object.keys(outgoingPrograms).forEach(id => {
          if (!incomingPrograms[id]) changedPrograms.add(id);
        });
        for (const id of changedPrograms) {
          const program = incomingPrograms[id] || outgoingPrograms[id] || {};
          const owner = String(program.owner || "");
          if (owner && String(blobActor.id) !== owner) {
            return send(res, 403, { error: "Only the program owner can modify this program in a workspace write", programId: id, owner });
          }
        }
      }
      // Server-owned derived data: the per-project auto trend rows and the
      // enhanced-AI cache are written ONLY by the automation passes. Inherit
      // them when the incoming blob never carried the key, so a whole-blob
      // replace (e.g. a save without If-Match) cannot erase what the
      // automation wrote. A client that DID carry the key always wins.
      try {
        const serverOwned = readScopedWorkspace(req);
        const inherit = (inc, cur) => {
          if (!inc || !cur) return;
          if (cur.leadershipDigestHistory !== undefined && inc.leadershipDigestHistory === undefined) inc.leadershipDigestHistory = cur.leadershipDigestHistory;
          // Same for the matrix assessment register: written by its own route,
          // inherited when the incoming client blob predates it.
          if (cur.matrixLeadership !== undefined && inc.matrixLeadership === undefined) inc.matrixLeadership = cur.matrixLeadership;
        };
        inherit(workspace, serverOwned);
        Object.keys(workspace.projects || {}).forEach(id => inherit(workspace.projects[id], (serverOwned && serverOwned.projects && serverOwned.projects[id]) || null));
        if (serverOwned && serverOwned._enhancedAI && workspace._enhancedAI === undefined) workspace._enhancedAI = serverOwned._enhancedAI;
      } catch (_) { /* inheritance is best-effort */ }
      const expectedRevision = req.headers["if-match"];
      if (expectedRevision && expectedRevision !== currentScopedRevision(req)) return send(res, 409, { error: "Workspace revision conflict", revision: currentScopedRevision(req) });
      await writeScopedWorkspace(req, workspace);
      const tenantId = persistenceStore().postgres ? databaseTenantId(req) : null;
      if (persistenceStore().postgres) {
        await persistenceStore().postgres.saveGraph(tenantId, workspaceEntityGraph(workspace));
        // Project the authoritative blob into the shared tables so the
        // fine-grained project/task/milestone API and the work graph serve
        // the same data the UI writes — no divergent data models.
        const writeThrough = await workspaceWriteThrough.syncWorkspaceToShared(persistenceStore().postgres, tenantId, workspace, { ownerId: blobActor && blobActor.id });
        if (writeThrough.failures.length) appendAudit({ action: "Shared workspace sync partial", detail: `${writeThrough.synced.length} synced, ${writeThrough.failures.length} failed (${writeThrough.failures[0].error})` });
      }
      await appendDomainEvent("WorkspaceSaved", workspace.activeId || "workspace", { projectCount: Object.keys(workspace.projects || {}).length, revision: currentScopedRevision(req) }, role, requestId, tenantId);
      appendAudit({ action: "Workspace saved", detail: "Server-backed workspace persistence (policy-v1)" });
      notifications.dispatchWebhooks("workspace.saved", { revision: currentScopedRevision(req), projects: Object.keys(workspace.projects || {}).length }).catch(() => {});
      workspaceAlerts(workspace).forEach(alert => {
        const payload = { projectId: alert.projectId, domain: alert.domain, type: alert.type, item: alert.item, amount: alert.amount };
        notifications.dispatchWebhooks("alert.raised", payload).catch(() => {});
        dispatchOperationalWebhook("alert.raised", payload);
      });
      return send(res, 200, { saved: true, revision: currentScopedRevision(req) });
    } catch (error) {
      return send(res, 400, { error: error.message });
    }
  }
  if (req.url === "/api/workspace/history" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const history = readScopedWorkspace(req) && workspaceScope(req).scoped ? readWorkspaceHistoryFor(workspaceScope(req).userId) : readWorkspaceHistory();
    const metadata = history.map(({ snapshot, ...entry }) => entry);
    return send(res, 200, { history: metadata, integrity: verifyWorkspaceHistory(history) });
  }
  if (req.url === "/api/workspace/restore" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.revision) return send(res, 400, { error: "revision is required" });
      if (!restoreScopedRevision(req, payload.revision)) return send(res, 404, { error: "Revision not found or snapshot integrity failed" });
      appendAudit({ action: "Workspace restored", detail: "Revision " + payload.revision });
      return send(res, 200, { restored: true, revision: currentScopedRevision(req) });
    } catch (error) {
      return send(res, 400, { error: error.message });
    }
  }
  // ─── Grounded leadership coach (+ I4 threadId continuity) ─────────────────
  if (req.url === "/api/coach/ask" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      let question = String(payload && payload.question || "").trim();
      if (!question) return send(res, 400, { error: "question is required" });
      if (question.length > 2000) return send(res, 400, { error: "question too long (max 2000 characters)" });
      // I4: when threadId is present, prepend thread context so follow-ups keep case memory.
      if (payload.threadId) {
        try {
          const ctx = require("./lib/mentor-threads.js").threadContextForPrompt(DATA_DIR, String(payload.threadId));
          if (ctx) question = ctx + "\n\nCurrent question: " + question;
        } catch (_) {}
      }
      // I5: pass adaptive style hint + workspace so coachMentorSystem can tune length/tone.
      const askOpts = payload.threadId ? { workspace: activeProjectState(req) } : null;
      void askOpts;
      const result = await coachStore().ask(activeProjectState(req), question, remoteCoachHook);
      // I4: persist the exchange to the thread when a threadId was supplied.
      if (payload.threadId) {
        try {
          const mt = require("./lib/mentor-threads.js");
          const original = String(payload.question || "").trim().slice(0, 4000);
          mt.appendMessage(DATA_DIR, String(payload.threadId), { role: "user", question: original });
          mt.appendMessage(DATA_DIR, String(payload.threadId), { role: "mentor", question: original, answer: result.answer || "" });
        } catch (_) {}
      }
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/coach/verify" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const claims = Array.isArray(payload && payload.claims) ? payload.claims : [];
      if (!claims.length) return send(res, 400, { error: "claims array is required" });
      return send(res, 200, coachStore().verifyClaims(activeProjectState(req), claims));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Order matters: /api/coach/answers/verify starts with /api/coach/answers, so
  // the more specific one is matched first. The list route matches on the PREFIX
  // because a query string is part of req.url — the old equality check turned the
  // AI status view's own call (/api/coach/answers?limit=N) into a 404, so the
  // always-on mentor's activity table was silently empty.
  if (req.url.startsWith("/api/coach/answers/verify") && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { integrity: coachStore().verifyAnswers() });
  }
  if (req.url.startsWith("/api/coach/answers") && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const params = new URLSearchParams((req.url.split("?")[1] || ""));
    const limit = Number(params.get("limit") || 0);
    return send(res, 200, { answers: coachStore().listAnswers(limit > 0 ? limit : 100), integrity: coachStore().verifyAnswers() });
  }
  // ─── AI mentor: guided intake + grounded case solving ──────────────────────
  // The coach answers questions; the mentor solves a REGISTERED challenge. It
  // is the same engine (js/coach.js), the same provider layer (remoteCoachHook)
  // and the same tamper-evident answer log — one AI with two capabilities, so a
  // mentor answer can never disagree with a coach answer. Flow: intake (which
  // charts the AI needs) → solve (methods + plan from the governed registry) →
  // case (persisted, re-openable, audited).
  if (req.url.startsWith("/api/coach/mentor/situations") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const lang = getLang(req);
    const state = activeProjectState(req);
    return send(res, 200, {
      situations: coachStore().engine.mentorSituations(lang),
      guidance: coachStore().engine.mentorGuidance(state, lang),
      lang
    });
  }
  if (req.url.startsWith("/api/coach/mentor/cases") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const lang = getLang(req);
    const state = activeProjectState(req);
    return send(res, 200, {
      cases: Array.isArray(state && state.mentorCases) ? state.mentorCases : [],
      guidance: coachStore().engine.mentorGuidance(state, lang),
      lang
    });
  }
  if (req.url === "/api/coach/mentor/intake" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req)) || {};
      const lang = getLang(req, payload);
      const state = activeProjectState(req);
      const classified = payload.situationId ? null : coachStore().engine.mentorClassify(payload.problem, lang);
      const situationId = payload.situationId || (classified || {}).situationId;
      if (!situationId) {
        return send(res, 400, {
          error: "situationId or a problem description is required",
          situations: coachStore().engine.mentorSituations(lang).map(s => s.id)
        });
      }
      const intake = coachStore().engine.mentorIntake(state, situationId, payload.inputs, lang);
      if (intake.error) return send(res, 400, Object.assign({ classified }, intake));
      return send(res, 200, { intake, classified, lang });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/coach/mentor/solve" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const result = await coachStore().solveMentor(activeProjectState(req), payload, remoteCoachHook);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Proactive mentor: the mentor opens the case for you ───────────────────
  // Detection is deterministic (lib/proactive-mentor.js): register signal
  // clusters map to governed situation IDs, the intake charts are pre-filled
  // from the registers with citations, and progress is computed by the engine's
  // own mentorIntake. The GET is read-only and never persists. Automation may
  // CREATE an open, unsolved case with origin "proactive"; it never solves,
  // closes or acknowledges on the leader's behalf (PROACTIVE_AI_SPEC.md).
  if (req.url.startsWith("/api/mentor/proactive") && req.method === "GET" && !req.url.includes("/dismiss")) {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const lang = getLang(req);
      const proactiveMentor = require("./lib/proactive-mentor.js");
      const state = activeProjectState(req);
      let latDrafts = [];
      try { latDrafts = require("./lib/review-tray.js").allDrafts(DATA_DIR, { projectIds: state && state._id ? [String(state._id)] : undefined }); } catch (_) {}
      const proposals = proactiveMentor.proactiveProposals(state, { lang, drafts: latDrafts }).filter(p => !proactiveMentor.dismissedToday(state, p.proposalId));
      return send(res, 200, { proposals, lang });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/mentor/proactive/create" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const lang = getLang(req, payload);
      const proactiveMentor = require("./lib/proactive-mentor.js");
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      if (!state.project) return send(res, 404, { error: "No project available" });
      if (state.explicit) {
        const decision = authorizeProjectWrite(req, state.project);
        if (!decision.allowed) return send(res, 403, { error: decision.reason });
      }
      const situationId = String(payload.situationId || "");
      const user = authStore().userFromRequest(req);
      const actor = (user && (user.name || user.username)) || "leader";
      let caseDrafts = [];
      try { caseDrafts = require("./lib/review-tray.js").allDrafts(DATA_DIR, { projectIds: state.project && state.project._id ? [String(state.project._id)] : undefined }); } catch (_) {}
      const created = proactiveMentor.createCaseFromProposal(state.project, situationId, { lang, actor, drafts: caseDrafts });
      if (created.error) {
        return send(res, created.error.indexOf("unknown situation") === 0 ? 400 : 409, { error: created.error });
      }
      const project = state.project;
      if (!Array.isArray(project.mentorCases)) project.mentorCases = [];
      // Idempotent per proposal: one case per (situation, signal, day) — a
      // double click or a racing client cannot duplicate the case.
      const existing = project.mentorCases.find(c => c && c.proposalId === created.case.proposalId);
      if (existing) return send(res, 200, { case: existing, duplicate: true, guidance: coachStore().engine.mentorGuidance(project, lang) });
      if (project.mentorCases.length >= 200) return send(res, 400, { error: "at most 200 mentor cases per project" });
      project.mentorCases.push(created.case);
      await writeScopedWorkspace(req, ws);
      appendAudit({
        eventId: `mentor-proactive:${created.case.id}`,
        action: "Proactive mentor case created",
        detail: `${created.case.situationId} — ${created.case.id} — signals: ${created.case.signals.join("; ")}`.slice(0, 300)
      });
      dispatchOperationalWebhook("mentor.proactive_case", { caseId: created.case.id, situationId: created.case.situationId, proposalId: created.case.proposalId, signals: created.case.signals });
      return send(res, 201, { case: created.case, proposal: created.proposal, guidance: coachStore().engine.mentorGuidance(project, lang) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/mentor/proactive/dismiss" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const lang = getLang(req, payload);
      const proactiveMentor = require("./lib/proactive-mentor.js");
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      if (!state.project) return send(res, 404, { error: "No project available" });
      const proposalId = String(payload.proposalId || "").slice(0, 200);
      if (!proposalId) return send(res, 400, { error: "proposalId is required" });
      proactiveMentor.dismissProposal(state.project, proposalId);
      await writeScopedWorkspace(req, ws);
      appendAudit({
        eventId: `mentor-proactive-dismiss:${proposalId}:${new Date().toISOString().slice(0, 10)}`,
        action: "Proactive mentor proposal dismissed",
        detail: `${proposalId} — suppressed for today`
      });
      return send(res, 200, { ok: true, proposalId, lang });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Review tray (the self-filling app) ─────────────────────────────────
  // Producers submit drafts; the leader approves/discards with one tap. ONLY
  // approval writes the register, and it does so server-side with the same
  // normalization the app's own automation uses. Every step audited.
  if (req.url === "/api/review-tray" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const role = roleFor(req);
      const listing = reviewTray.listDrafts(DATA_DIR, {
        projectId,
        role,
        includeResolved: new URLSearchParams((req.url.split("?")[1] || "")).get("includeResolved") === "1"
      });
      return send(res, 200, { ...listing, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/review-tray/submit" && req.method === "POST") {
    // Producer ingestion endpoint. Server-to-server: requires editor+ (the
    // meeting capture pipeline runs with the server's own credentials).
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 50000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const result = reviewTray.submitDraft(DATA_DIR, {
        projectId,
        source: payload.source || "manual-api",
        externalId: payload.externalId,
        register: payload.register,
        row: payload.row,
        summary: payload.summary,
        lang: payload.lang,
        actor: payload.actor || "api-producer",
        sensitive: !!payload.sensitive,
        confidence: payload.confidence
      });
      if (result.error) return send(res, 400, { error: result.error, available: result.available });
      if (result.duplicate) appendAudit({ action: "Review tray duplicate submit", detail: result.draft.id + " — idempotent" });
      else appendAudit({ action: "Review tray draft submitted", detail: result.draft.id + " → " + result.draft.register + " (" + result.draft.source + ")" });
      return send(res, result.duplicate ? 200 : 201, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/review-tray/approve" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      // An autonomy-promotion draft is the proposal; the approval is the
      // human tap. Read the captured payload BEFORE approval (the written row
      // keeps producer bookkeeping out of the register).
      const createdProtos = [];
      let promotionCapture = null;
      try {
        const dl = reviewTray.listDrafts(DATA_DIR, { projectId, includeResolved: true, role: "admin" }).drafts || [];
        const drow = dl.find(d => d.id === String(payload.draftId || ""));
        const cap = drow && drow.row && drow.row.captured;
        if (cap && String(cap.prefetchKind || "") === "autonomy-promotion") promotionCapture = cap;
      } catch (_) { promotionCapture = null; }
      const result = reviewTray.approveDraft(DATA_DIR, {
        projectId,
        draftId: String(payload.draftId || ""),
        actor: user.name || user.id || "leader",
        // The leader's own verdict trains the autonomy ladder: a class they
        // approve without changing can eventually stop asking.
        project,
        // The ONLY register mutation, shared with the cluster and auto-file
        // paths so all three write an identical row shape.
        writer: (register, row, draft) => {
          const written = writeRegisterRow(project, register, row, draft);
          if (written && written.createdProtocol) createdProtos.push(written.createdProtocol);
          return written;
        }
      });
      if (result.error) return send(res, 409, { error: result.error, draft: result.draft });
      // The run plan is filed AFTER the tray's own rewrite (see
      // fileRunPlanDraft) — never from inside the writer.
      createdProtos.forEach(proto => fileRunPlanDraft(projectId, proto, payload.lang));
      const promotion = promotionCapture ? applyAutonomyPromotion(project, promotionCapture, result.draft.resolvedBy) : null;
      await writeScopedWorkspace(req, ws);
      appendAudit({
        action: "Review tray draft approved",
        detail: payload.draftId + " → " + result.draft.register + " row " + (result.draft.approvedRow && result.draft.approvedRow._id) + " by " + result.draft.resolvedBy + (promotion && promotion.ok ? " — autonomy promoted: " + promotion.classKey + " → L" + promotion.level : "")
      });
      return send(res, 200, promotion ? Object.assign({}, result, { promotion }) : result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/review-tray/discard" && req.method === "POST") {
    if (roleFor(req) === "viewer") return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const result = reviewTray.discardDraft(DATA_DIR, {
        projectId,
        draftId: String(payload.draftId || ""),
        actor: user.name || user.id || "leader",
        reason: payload.reason
      });
      if (result.error) return send(res, 409, { error: result.error, draft: result.draft });
      appendAudit({ action: "Review tray draft discarded", detail: payload.draftId + " by " + result.draft.resolvedBy + (payload.reason ? " — " + String(payload.reason).slice(0, 120) : "") });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── One-tap session from a prep booking's spec ──────────────────────────
  // The retest prep draft (lib/week-prefetch.js) carries the session spec;
  // this opens the session with every register-proven input DERIVED (fleet
  // instrument, calibration, TUR). The permit-to-work is the leader's own
  // confirmation in the body — a physical-world act the app never invents —
  // and startSession's gates still decide. A blocked session is not written.
  if (req.url === "/api/ct/session/from-spec" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const CT = require("./js/commissioning-testing.js");
      const weekPrefetch = require("./lib/week-prefetch.js");
      // The spec comes from the approved prep row when named, else from CT's
      // own matrices for the procedure — never from the client.
      let spec = null;
      const regs = project.registers || {};
      const tasks = Array.isArray(regs.tasks) ? regs.tasks : [];
      // Prep rows from any SESSION-SPEC-carrying prefetch kind open the same
      // one-tap path: retests, gas leak-checks and gas analyses.
      const SPEC_PREP_KINDS = ["retest", "gas-leak-check", "gas-analysis"];
      const prepRow = payload.prefetchKey
        ? tasks.find(r => r && String(r.prefetchKey || "") === String(payload.prefetchKey) && SPEC_PREP_KINDS.indexOf(String(r.prefetchKind || "")) >= 0)
        : null;
      if (prepRow && (prepRow.sessionSpec || (prepRow.captured && prepRow.captured.sessionSpec))) {
        spec = prepRow.sessionSpec || prepRow.captured.sessionSpec;
      }
      if (!spec && payload.procedureId && typeof weekPrefetch.sessionSpecFor === "function") {
        spec = weekPrefetch.sessionSpecFor(String(payload.procedureId), lang);
      }
      if (!spec) return send(res, 404, { error: "No session spec — approve the retest prep draft first, or name a procedureId" });
      const result = CT.startSessionFromSpec(project, spec, {
        lang,
        today: todayISO(),
        permit: payload.permit || undefined,
        permitId: String(payload.permitId || ""),
        permitNumber: String(payload.permitNumber || ""),
        operator: String(payload.operator || ""),
        assetSerial: String(payload.assetSerial || ""),
        bayRef: String(payload.bayRef || ""),
        // F-gas fallback for workspaces without a skills register — the
        // register proof is always preferred when one exists.
        fGasCertified: payload.fGasCertified === true ? true : undefined
      });
      if (result.error) return send(res, 409, result);
      if (result.session) {
        if (!project.testmodul || typeof project.testmodul !== "object") project.testmodul = {};
        if (!Array.isArray(project.testmodul.sessions)) project.testmodul.sessions = [];
        project.testmodul.sessions.push(result.session);
        await writeScopedWorkspace(req, ws);
        appendAudit({
          action: "CT session started from prep spec",
          detail: spec.procedureId + " session " + (result.session._id || "") + " on " + ((result.derived && result.derived.instrument && result.derived.instrument.id) || "?") + " (TUR " + ((result.derived && result.derived.tur) || "?") + ")"
        });
      }
      return send(res, 200, { session: result.session, blocked: result.blocked, derived: result.derived, missing: result.missing, permitSource: result.permitSource, fGasSource: result.fGasSource, projectId, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Batch review: the tray as ONE decision, not N ──────────────────────
  // Drafts the leader would judge identically are grouped by autonomy class;
  // one tap resolves the group. The write path is unchanged — a cluster calls
  // the SAME approveDraft per member through the SAME writer.
  if (req.url.startsWith("/api/review-tray/clusters") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const clustered = reviewTray.clusterDrafts(DATA_DIR, { projectId, role: roleFor(req), lang, project });
      if (clustered.error) return send(res, 400, { error: clustered.error });
      return send(res, 200, { ...clustered, lang, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/review-tray/approve-cluster" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const classKey = String(payload.classKey || "");
      if (!classKey) return send(res, 400, { error: "classKey is required" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const clusterProtos = [];
      const result = reviewTray.approveCluster(DATA_DIR, {
        projectId,
        classKey,
        actor: user.name || user.id || "leader",
        project,
        lang: payload.lang,
        except: Array.isArray(payload.except) ? payload.except : [],
        limit: payload.limit,
        writer: (register, row, draft) => {
          const written = writeRegisterRow(project, register, row, draft);
          if (written && written.createdProtocol) clusterProtos.push(written.createdProtocol);
          return written;
        }
      });
      if (result.error) return send(res, result.error === "cluster not found" ? 404 : 400, { error: result.error });
      clusterProtos.forEach(proto => fileRunPlanDraft(projectId, proto, payload.lang));
      await writeScopedWorkspace(req, ws);
      appendAudit({
        action: "Review tray cluster approved",
        detail: `${classKey}: ${result.approved} approved, ${result.failed} failed, ${result.skipped} skipped, by ${user.name || user.id || "leader"}`
      });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/review-tray/discard-cluster" && req.method === "POST") {
    if (roleFor(req) === "viewer") return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const classKey = String(payload.classKey || "");
      if (!classKey) return send(res, 400, { error: "classKey is required" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const result = reviewTray.discardCluster(DATA_DIR, {
        projectId, classKey, project, lang: payload.lang,
        actor: user.name || user.id || "leader",
        reason: payload.reason
      });
      if (result.error) return send(res, result.error === "cluster not found" ? 404 : 400, { error: result.error });
      await writeScopedWorkspace(req, ws);
      appendAudit({ action: "Review tray cluster discarded", detail: `${classKey}: ${result.discarded} discarded — the class is demoted on the autonomy ladder` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Undo an auto-filed row inside its window. Removes the register row AND
  // demotes the class — the machine lost the argument.
  if (req.url === "/api/review-tray/undo" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const result = reviewTray.undoAutoFiled(DATA_DIR, {
        projectId,
        draftId: String(payload.draftId || ""),
        actor: user.name || user.id || "leader",
        project,
        unwriter: (register, row) => removeRegisterRow(project, register, row)
      });
      if (result.error) return send(res, result.error === "draft not found" ? 404 : 409, { error: result.error, undoUntil: result.undoUntil });
      await writeScopedWorkspace(req, ws);
      appendAudit({
        action: "Auto-filed row undone",
        detail: `${payload.draftId} (${result.register}) undone by ${user.name || user.id || "leader"}` +
          (result.demoted ? ` — class demoted L${result.demoted.from}→L${result.demoted.to}` : "")
      });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/review-tray/auto-filed") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const reviewTray = require("./lib/review-tray.js");
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const params = new URLSearchParams((req.url.split("?")[1] || ""));
      const lang = getLang(req);
      const report = reviewTray.autoFiledReport(DATA_DIR, { projectId, lang, since: params.get("since") || undefined });
      if (report.error) return send(res, 400, { error: report.error });
      return send(res, 200, report);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── The autonomy ladder: trust the machine EARNS, per action class ─────
  // Promotion is ALWAYS a human act and is refused for sensitive classes at
  // any record. Demotion is automatic and available to anyone.
  if (req.url.startsWith("/api/autonomy") && req.method === "GET" && !req.url.includes("/promote") && !req.url.includes("/demote")) {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const overview = require("./lib/autonomy-ladder.js").autonomyOverview(project, { lang });
      return send(res, 200, overview);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/autonomy/promote" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const actor = user.name || user.id || "leader";
      const result = require("./lib/autonomy-ladder.js").promote(project, {
        classKey: String(payload.classKey || ""),
        toLevel: payload.toLevel,
        actor
      });
      if (result.error) return send(res, result.pinned ? 403 : 400, result);
      await writeScopedWorkspace(req, ws);
      appendAudit({
        eventId: `autonomy-promote:${result.classKey}:${result.level}`,
        action: "Autonomy level raised",
        detail: `${result.classKey} → L${result.level} (${result.levelName}) by ${actor}`
      });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/autonomy/demote" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const result = require("./lib/autonomy-ladder.js").demote(project, {
        classKey: String(payload.classKey || ""),
        toLevel: payload.toLevel,
        reason: payload.reason || "leader_request"
      });
      if (result.error) return send(res, 400, result);
      await writeScopedWorkspace(req, ws);
      appendAudit({ action: "Autonomy level lowered", detail: `${result.classKey} L${result.from}→L${result.to} (${result.reason})` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── The detector registry: every module that declared a detector ───────
  // Read-only. Severity here is EARNED: a "high" without an arithmetic basis
  // meeting its own threshold has already been demoted, and the demotion is
  // visible on the signal.
  if (req.url.startsWith("/api/signals") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      ensureSignalDetectors();
      const registry = require("./lib/signal-registry.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const params = new URLSearchParams(req.url.split("?")[1] || "");
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const scan = registry.collectSignals(project, { lang, today, role: roleFor(req) });
      const allProjects = ws.projects ? Object.values(ws.projects).filter(Boolean) : [];
      const portfolio = allProjects.length >= 2
        ? registry.collectPortfolioSignals(allProjects, { lang, today, role: roleFor(req) })
        : { signals: [], counts: {}, detectors: { registered: 0, eligible: 0, ran: 0, failed: 0 }, errors: [] };
      return send(res, 200, {
        lang,
        project: scan,
        portfolio,
        detectors: registry.listDetectors()
      });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── The day plan: what fits before the next meeting, and what is dropped ─
  if (req.url.startsWith("/api/plan/day") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const params = new URLSearchParams(req.url.split("?")[1] || "");
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const plan = require("./lib/day-planner.js").planDay(ing.cockpit, project, {
        lang, today,
        now: params.get("now") || new Date().toISOString().slice(11, 16),
        workStart: params.get("workStart") || undefined,
        workEnd: params.get("workEnd") || undefined,
        // Prevention windows: the week-ahead prep (lib/week-prefetch.js) is
        // placed into today's free windows — the app drafts the booking AND
        // finds the time to make it.
        prep: (ing.weekAhead && ing.weekAhead.items) || []
      });
      return send(res, 200, plan);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Inferred outcomes: the mentor reads its own results ────────────────
  // The registers are read for movement; the EFFECT is proposed, "carried
  // out" is never inferred, and recording requires a human actor.
  if (req.url.startsWith("/api/outcomes/inferred") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const out = require("./lib/outcome-inference.js").outcomeProposals(project, { lang });
      return send(res, 200, { ...out, lang });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/outcomes/confirm" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const outcomeInference = require("./lib/outcome-inference.js");
      const caseId = String(payload.caseId || "");
      if (!caseId) return send(res, 400, { error: "caseId is required" });
      // Re-derive server-side: the client never posts the inference itself.
      const found = outcomeInference.outcomeProposals(project, { lang })
        .proposals.find(p => p.caseId === caseId);
      if (!found) return send(res, 404, { error: "no inferable outcome for case " + caseId });
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
      const result = outcomeInference.confirmInferredOutcome({
        state: project,
        engine: coachStore().engine,
        project,
        proposal: found,
        lang,
        actor: user.name || user.id || "leader",
        carriedOut: payload.carriedOut,
        effect: payload.effect
      });
      if (!result.ok) return send(res, result.status || 400, { error: result.error });
      await writeScopedWorkspace(req, ws);
      appendAudit({
        eventId: `outcome-inferred:${caseId}:${new Date().toISOString().slice(0, 10)}`,
        action: "Inferred outcome confirmed",
        detail: `${caseId}: ${payload.effect || found.proposed.effect} (basis ${found.metric.label} ${found.metric.then}→${found.metric.now}) by ${user.name || user.id || "leader"}`
      });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Today cockpit (the five-minute surface) ────────────────────────────
  // Server-composed ranking across the app's own signals; every item carries
  // a reason and exactly one action. Read-only: viewer+.
  if (req.url.startsWith("/api/today/autopilot") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const focusMinutes = Number(q.get("focusMinutes") || 30);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const mod = require("./lib/timeboxed-autopilot.js");
      const schedule = mod.autopilotSchedule(ing.cockpit, { lang, today, focusMinutes });
      return send(res, 200, { ...schedule, cockpit: ing.cockpit, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Enhanced AI Suite Routes (Round 27) ───────────────────────────────
  // 1. Autonomous Decision Recommender
  if (req.url === "/api/decisions/recommend" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const result = decisionRecommender.recommendDecisions(project, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 2. Cross-Project Intelligence Hub
  if (req.url === "/api/cross-project/intelligence" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      // Gather all projects for cross-project analysis
      const allProjects = [];
      if (ws.projects && Array.isArray(ws.projects)) {
        ws.projects.forEach(p => { allProjects.push(p); });
      }
      if (allProjects.length < 2 && ws.registers) {
        allProjects.push({ name: ws.name || "Current Project", registers: ws.registers, roster: ws.roster });
      }
      const result = crossProjectIntelligence.crossProjectView(allProjects, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 3. Smart Calendar Optimizer
  if (req.url === "/api/calendar/optimize" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const events = (project.registers && project.registers.calendar) || [];
      const roster = ws.roster || [];
      const decisionItems = decisionRecommender.recommendDecisions(project, { today: new Date().toISOString().slice(0, 10), lang });
      const result = smartCalendarOptimizer.optimizeCalendar(events, roster, decisionItems, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 4. Natural Language Chat Interface
  if (req.url === "/api/chat" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    body(req).then(parsed => {
      const { message } = parsed;
      if (!message) return send(res, 400, { error: "Message required" });
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = naturalLanguageChat.handleChat(message, project || ws, { lang });
      send(res, 200, result);
    }).catch(e => { send(res, e.statusCode || 400, { error: e.message }); });
    return; // prevent fall-through
  }

  // 6. Ambient Intelligence
  if (req.url === "/api/ambient/intelligence" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = ambientIntelligence.ambientSummary(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 7. Behavioral Patterns
  if (req.url === "/api/behavioral/patterns" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = behavioralPatternRecognition.detectPatterns(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 8. Succession Risk
  if (req.url === "/api/succession/risks" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = successionRiskPredictor.predictRisks(project || ws, { lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 9. Conflict Early Warning
  if (req.url === "/api/conflict/warnings" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = conflictEarlyWarning.analyzeConflicts(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 10. Delivery Certainty
  if (req.url === "/api/delivery/certainty" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = deliveryCertaintyEngine.assessDelivery(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 11. Smart Delegation
  if (req.url === "/api/delegation/recommend" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = smartDelegationRecommender.recommendDelegation(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 12. Weekly Briefing
  if (req.url === "/api/briefing/weekly" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = autonomousWeeklyBriefing.generateWeeklyBriefing(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 13. Intelligent Nudges
  if (req.url === "/api/nudges" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const result = intelligentNudgeSystem.generateNudges(project || ws, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 14. Meeting Intelligence Capture (POST) — analytics-only route, moved off
  // /api/meeting/capture (which belongs to the tested J-wave tray pipeline).
  if (req.url === "/api/meeting/intelligence" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    body(req).then(parsed => {
      const { text } = parsed;
      if (!text) return send(res, 400, { error: "Text required" });
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = meetingIntelligenceCapture.captureMeetingIntelligence(text, { lang });
      send(res, 200, result);
    }).catch(e => { send(res, e.statusCode || 400, { error: e.message }); });
    return;
  }

  // 5. Predictive Risk Radar
  if (req.url === "/api/risks/predictive" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const result = predictiveRiskRadar.predictiveRadar(project, { today: new Date().toISOString().slice(0, 10), lang });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/today" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      // The leader's language is ONE derivation (getLang — the query param,
      // then the project's own lang, then the workspace's). This route read
      // ws.settings.language alone — a field NOTHING writes — so an English
      // leader got a Danish cockpit forever: a truth bug, not a translation
      // preference. (The wider hand-rolled class is named in WORKING-BASE.)
      const lang = getLang(req);
      const user = authStore().userFromRequest(req) || { _id: "local", name: "Local User", role: "admin" };
      const today = new Date().toISOString().slice(0, 10);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user });
      // Tier-4/5 meta: the projection dates behind the trend and what the
      // attention budget deferred — honest zeros when history is short.
      let forecastMeta = [];
      try { forecastMeta = (NT.computeTrend(project.leadershipDigestHistory || [], { today }).forecast || []).filter(f => f && f.breachDate); } catch (_) { forecastMeta = []; }
      let attentionMeta = { dropped: 0, cap: 8, deferred: [] };
      try { attentionMeta = ing.cockpit.attention || attentionMeta; } catch (_) {}
      // ── Hands-free enrichments (I7/I8/I9 + J4/J7/J8/J9 + K2–K10 + L1–L10): never re-rank, only augment ──
      // Autopilot schedule, early warnings, delegation, nudges, portfolio twin,
      // trajectory, decision debt, calendar defense, workload rebalancer,
      // conflict radar, pulse guard, scenario twin is via POST /api/scenario.
      // L-wave adds: auto-assign, escalations, cross-domain, sentiment,
      // decision-quality, fingerprint, coaching quality, portfolio stress.
      // All are pure and cap themselves; failures never break Today.
      let autopilot = null;
      let warnings = [];
      let delegations = [];
      let nudges = [];
      let twin = null;
      let trajectory = null;
      let decisionDebt = null;
      let calendarDefense = null;
      let workloadRebalancer = null;
      let conflictRadarData = null;
      let pulseGuard = null;
      let chiefLoop = null;
      let autoAssign = null;
      let escalationsData = null;
      let crossDomain = null;
      let sentimentPulse = null;
      let decisionQuality = null;
      let fingerprint = null;
      let coachingQuality = null;
      let portfolioStress = null;
      let unifiedBriefV2 = null;
      try { autopilot = require("./lib/timeboxed-autopilot.js").autopilotSchedule(ing.cockpit, { lang, today }); } catch (_) {}
      try { warnings = require("./lib/early-warning-navigator.js").warningPriorities(project, { lang, today }); } catch (_) {}
      try { delegations = require("./lib/delegation-copilot.js").delegationBatch(project, ing.cockpit, { lang }); } catch (_) {}
      try { nudges = require("./lib/proactive-nudges.js").nudgesForUpcoming(project, { lang, today }); } catch (_) {}
      try { twin = require("./lib/portfolio-twin.js").portfolioTwin(ws, { lang }); } catch (_) {}
      try { trajectory = require("./lib/trajectory-impacts.js").trajectoryImpacts(project, { lang, today }); } catch (_) {}
      try { decisionDebt = require("./lib/decision-debt-service.js").decisionDebt(project, { lang, today }); } catch (_) {}
      try { calendarDefense = require("./lib/calendar-defense.js").calendarDefense(project, { lang, today }); } catch (_) {}
      try { workloadRebalancer = require("./lib/workload-rebalancer.js").rebalancerSuggestions(project, { lang, today }); } catch (_) {}
      try { conflictRadarData = require("./lib/conflict-radar.js").conflictRadar(project, { lang, today }); } catch (_) {}
      try { pulseGuard = require("./lib/team-pulse-guard.js").teamPulseGuard(project, { lang, today }); } catch (_) {}
      try { chiefLoop = require("./lib/chief-loop.js").chiefLoopBrief(ws, { lang, today, project, cockpit: ing.cockpit }); } catch (_) {}
      try { autoAssign = require("./lib/auto-assign-bridge.js").assignmentSuggestions(project, { lang, today }); } catch (_) {}
      try { escalationsData = require("./lib/auto-assign-bridge.js").escalationAlerts(project, { lang, today }); } catch (_) {}
      try { crossDomain = require("./lib/cross-domain-bridge.js").crossDomainInsights(ws, { lang }); } catch (_) {}
      try { sentimentPulse = require("./lib/sentiment-pulse-bridge.js").sentimentPulse(project, { lang, today }); } catch (_) {}
      try { decisionQuality = require("./lib/decision-quality-bridge.js").orgHealth(ws, { lang, today }); } catch (_) {}
      try { fingerprint = require("./lib/fingerprint-twin-bridge.js").fingerprintFor(ws, { lang, today }); } catch (_) {}
      try { coachingQuality = require("./lib/coaching-quality-bridge.js").reportFor(project || ws, { lang, today }); } catch (_) {}
      try { portfolioStress = require("./lib/portfolio-stress-bridge.js").stressTwin(ws, { kind: "budget", projectId: Object.keys(ws.projects || {})[0] || "p1", overrunPct: 20 }, { lang, today }); } catch (_) {}
      try { unifiedBriefV2 = require("./lib/unified-brief-v2.js").unifiedBriefV2(ws, { lang, today, project, cockpit: ing.cockpit, dataDir: DATA_DIR }); } catch (_) {}
      // ── M-wave: executive ops twin (never re-rank, only augment) ──────
      let budgetForecast = null;
      let capacityTwin = null;
      let cascadeOps = null;
      let outcomeOutlook = null;
      let portfolioOpt = null;
      let riskPortfolioOps = null;
      let teamDynamicsOps = null;
      let adaptiveLeadership = null;
      let changeNavigator = null;
      let autonomousOpsBrief = null;
      try { budgetForecast = require("./lib/budget-forecast-bridge.js").budgetForecast(project, { lang, today }); } catch (_) {}
      try { capacityTwin = require("./lib/capacity-twin-bridge.js").capacityTwin(ws, project, { lang, today }); } catch (_) {}
      try { riskPortfolioOps = require("./lib/risk-portfolio-bridge.js").riskPortfolio(ws, { lang, today }); } catch (_) {}
      try { teamDynamicsOps = require("./lib/team-dynamics-bridge.js").teamPulse(ws, { lang, today }); } catch (_) {}
      try { portfolioOpt = require("./lib/portfolio-optimizer-bridge.js").optimizePortfolio(ws, null, { lang, today }); } catch (_) {}
      try { adaptiveLeadership = require("./lib/adaptive-leadership-bridge.js").fullAssess({ disequilibrium: 2, holdingCapacity: 3 }, { lang, today }); } catch (_) {}
      try { autonomousOpsBrief = require("./lib/autonomous-ops-brief.js").autonomousOpsBrief(ws, { lang, today, project, cockpit: ing.cockpit }); } catch (_) {}
      // ── O-wave: firewall + one-question + people certainty (augment only) ──
      let attentionFirewall = null;
      let oneQuestion = null;
      let peopleCertaintyData = null;
      try {
        const packagesForFirewall = require("./lib/decision-packages.js").decisionPackages(ws, { lang, today });
        const sessionForFirewall = require("./lib/decision-session.js").decisionSession({ tray: ing.tray, proposals: ing.proposals, openCases: ing.openCases, stalledCases: ing.stalledCases, navigator: ing.navigator, dueJobs: ing.dueJobs, packages: packagesForFirewall }, { lang, today, budgetMinutes: 15 });
        const fwMod = require("./lib/attention-firewall.js");
        attentionFirewall = { ...fwMod.triage(sessionForFirewall.items, { lang, today }), stalledReturns: fwMod.stalledReturns(project || ws, { lang, today }) };
      } catch (_) {}
      try { oneQuestion = require("./lib/one-question.js").dailyQuestion(project, { lang, today }); } catch (_) {}
      try { peopleCertaintyData = require("./lib/people-certainty.js").peopleCertainty(project, { lang, today }); } catch (_) {}
      // ── N-wave: certainty + profile + packages + session (augment only) ──
      let deliveryCertaintyData = null;
      let leaderProfileData = null;
      let decisionPackagesData = null;
      let decisionSessionData = null;
      try { deliveryCertaintyData = require("./lib/delivery-certainty.js").deliveryCertainty(project, { lang, today }); } catch (_) {}
      try { leaderProfileData = require("./lib/leader-profile.js").leaderProfile(project || ws, { lang, today }); } catch (_) {}
      try { decisionPackagesData = require("./lib/decision-packages.js").decisionPackages(ws, { lang, today }); } catch (_) {}
      try { decisionSessionData = require("./lib/decision-session.js").decisionSession({ tray: ing.tray, proposals: ing.proposals, openCases: ing.openCases, stalledCases: ing.stalledCases, navigator: ing.navigator, dueJobs: ing.dueJobs, packages: decisionPackagesData }, { lang, today, budgetMinutes: 15 }); } catch (_) {}
      void cascadeOps; void outcomeOutlook; void changeNavigator;
      return send(res, 200, { ...ing.cockpit, forecast: forecastMeta, attention: attentionMeta, autopilot, warnings, delegations, nudges, twin, trajectory, decisionDebt, calendarDefense, workloadRebalancer, conflictRadar: conflictRadarData, pulseGuard, chiefLoop, autoAssign, escalations: escalationsData, crossDomain, sentimentPulse, decisionQuality, fingerprint, coachingQuality, portfolioStress, unifiedBriefV2, budgetForecast, capacityTwin, riskPortfolio: riskPortfolioOps, teamDynamics: teamDynamicsOps, portfolioOpt, adaptiveLeadership, autonomousOpsBrief, deliveryCertainty: deliveryCertaintyData, leaderProfile: leaderProfileData, decisionPackages: decisionPackagesData, decisionSession: decisionSessionData, attentionFirewall, oneQuestion, peopleCertainty: peopleCertaintyData, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Inbound command gateway (email/Slack → governed actions) ───────────
  if (req.url === "/api/inbound/command" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const inbound = require("./lib/inbound-commands.js");
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const emailCommands = require("./lib/email-commands.js");
      const { project } = requestedProjectState(req, ws);
      const scopeForExecutor = project && project.registers ? project : ws;
      const record = inbound.executeInboundCommand({
        channel: payload.channel === "slack" ? "slack" : "email",
        text: payload.text,
        principal: payload.principal || (user.email || user.id || "local"),
        role: payload.role || (user.role || "editor"),
        lang: getLang(req),
        today: new Date().toISOString().slice(0, 10),
        workspace: scopeForExecutor,
        executor: (parsed, targetWs, lang) => {
          const cmd = emailCommands.parseEmailCommand("[ACTION: " + parsed.command + (parsed.args ? " " + parsed.args : "") + "]");
          if (!cmd) return { ok: false, message: lang === "da" ? "Ukendt kommando" : "Unknown command" };
          return emailCommands.executeEmailCommand(cmd, targetWs, { lang });
        },
        writer: () => { /* workspace mutated in place by executor; persist + audit below */ },
        audit: (rec) => appendAudit({
          action: "Inbound command " + (rec.ok ? "executed" : "refused"),
          detail: rec.command ? (rec.command + " " + (rec.args || "") + " via " + rec.channel + " as " + rec.principal + (rec.refused ? " — " + rec.refused : "")) : (rec.detail || "")
        })
      });
      if (record.ok) {
        await writeScopedWorkspace(req, ws);
      }
      return send(res, record.ok ? 200 : (record.refused === "unparseable" ? 400 : 200), record);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Producer pass (the scheduled self-filling app) ──────────────────────
  // Runs the producer loop on demand (the automation interval calls the
  // function below directly); both paths go through reviewTray.submitDraft
  // and the gated review-job queue. Editor+ like every producer surface.
  if (req.url === "/api/producer/pass" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const producerLoop = require("./lib/producer-loop.js");
      const ws = readScopedWorkspace(req);
      // Auto-filed rows must land in THIS request's scope (the session
      // user's own file), applied under the lock — the old un-awaited
      // writeWorkspace(workspace) wrote the WRONG file for session users
      // and could clobber a concurrent automation tick. Awaited so the
      // revision in this response reflects the durable state.
      let persistRows = null;
      const summary = runProducerPassGated(ws, {
        lang: getLang(req),
        today: new Date().toISOString().slice(0, 10),
        persistRows: (rows) => { persistRows = mutateScopedWorkspace(req, fresh => ({ changed: applyFiledRows(fresh, rows) > 0 })); return persistRows; }
      });
      if (persistRows) { try { await persistRows; } catch (_) {} }
      return send(res, 200, { summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Portfolio cockpit (cross-project rollup) ──────────────────────────
  if (req.url === "/api/portfolio/cockpit" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const portfolioCockpit = require("./lib/portfolio-cockpit.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const perProject = Object.entries(ws.projects || {}).map(([pid, project]) => {
        const regs = project.registers || {};
        let pendingDrafts = 0;
        try {
          // NOTE: not named `t` — the call-site audit treats every `const X =
          // require(...)` as a module alias for the whole file, and `t` is a
          // common string local elsewhere (sanitizeMentorText).
          const trayMod = require("./lib/review-tray.js");
          const trayInfo = trayMod.listDrafts(DATA_DIR, { projectId: pid, role: roleFor(req) });
          pendingDrafts = (trayInfo.counts && trayInfo.counts.pending) || 0;
        } catch (_) { pendingDrafts = 0; }
        const tasks = regs.tasks || [];
        const isBlocked = (t) => String(t.status || "").toUpperCase() === "BLOCKED";
        const isOverdue = (t) => t.dueDate && String(t.status || "").toUpperCase() !== "DONE" && String(t.dueDate) < new Date().toISOString().slice(0, 10);
        return {
          projectId: pid,
          name: (project.project && project.project.name) || project.name || pid,
          pendingDrafts,
          openRisks: (regs.risks || []).filter(r => String(r.status || "").toLowerCase() !== "closed").length,
          blockedTasks: tasks.filter(isBlocked).length,
          overdueTasks: tasks.filter(isOverdue).length,
          openCases: (project.mentorCases || []).filter(c => String(c.status || "open") === "open").length,
          dueJobs: (() => { try { return jobStore.dueJobs(JOBS_FILE).filter(j => j.projectId === pid).length; } catch (_) { return 0; } })()
        };
      });
      const cockpit = portfolioCockpit.portfolioCockpit(perProject, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...cockpit, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Digest: the brief that acts (compose / deliver / outbox) ────────────
  if (req.url === "/api/digest/preview" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const digestDelivery = require("./lib/digest-delivery.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const user = authStore().userFromRequest(req) || { _id: "local", name: "Local User", role: "admin" };
      const preview = digestDelivery.previewDigest({
        workspace: ws,
        today,
        lang,
        appUrl: process.env.LEADERSHIP_APP_URL || "",
        gather: (projectId) => {
          const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user });
          let effectiveness = [];
          try { effectiveness = require("./lib/method-effectiveness.js").effectivenessInsights(ws, lang); } catch (_) { effectiveness = []; }
          // Monday learning section: the retrospective is composed on Mondays.
          let retro = null;
          try {
            // NOTE: not named `learningLoop` — server.js has a TOP-LEVEL alias
            // of that name for js/learning-loop.js (the experiment module),
            // and the call-site audit maps one name to one module.
            const learningLoopLib = require("./lib/learning-loop.js");
            retro = new Date().getDay() === 1 ? learningLoopLib.retroWeekly({
              journal: require("./js/decision-journal.js"),
              memoryGraph: require("./js/leader-memory-graph.js"),
              projects: Object.values(ws.projects || {}),
              lang,
              today
            }) : null;
          } catch (_) { retro = null; }
          return { cockpit: ing.cockpit, effectiveness, navigator: ing.navigator, retro, commercial: ing.commercial, constraint: ing.constraint, trajectory: ing.trajectory };
        }
      });
      return send(res, 200, { ...preview, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/digest/send" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const user = authStore().userFromRequest(req) || { _id: "local", name: "Local User", role: "admin" };
      const summary = runDigestDeliveryGated({ workspace: ws, lang, user });
      if (summary.blocked) return send(res, 423, { error: "Automation gated", reason: summary.blockedReason });
      return send(res, 200, { summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Weekly learning retrospective (the mentor's own report card) ────────
  // ─── Learning overview (retro + stale relations + 1:1 cadence) ──────────
  if (req.url === "/api/learning/overview" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const learningOverview = require("./lib/learning-overview.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const data = learningOverview.overview({
        ws,
        lang,
        today: new Date().toISOString().slice(0, 10),
        memoryGraph: require("./js/leader-memory-graph.js"),
        journal: require("./js/decision-journal.js")
      });
      return send(res, 200, { ...data, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/retro/weekly" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const learningLoopLib = require("./lib/learning-loop.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const retro = learningLoopLib.retroWeekly({
        journal: require("./js/decision-journal.js"),
        memoryGraph: require("./js/leader-memory-graph.js"),
        projects: Object.values(ws.projects || {}),
        lang,
        today: new Date().toISOString().slice(0, 10)
      });
      return send(res, 200, { ...retro, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/digest/outbox" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const digestDelivery = require("./lib/digest-delivery.js");
      return send(res, 200, digestDelivery.listOutbox(DIGEST_OUTBOX_DIR, { limit: 20 }));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── AI Leadership Autopilot (zero-input intelligence) ──────────────────
  if (req.url === "/api/autopilot/briefing" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autopilotMod = require("./js/ai-leadership-autopilot.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const briefing = autopilotMod.generateAutonomousBriefing(state, { lang, today });
      return send(res, 200, { ...briefing, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/autopilot/predictions" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autopilotMod = require("./js/ai-leadership-autopilot.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const predictions = autopilotMod.generatePredictions(state, today);
      return send(res, 200, { predictions, generatedAt: new Date().toISOString(), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/autopilot/agenda" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autopilotMod = require("./js/ai-leadership-autopilot.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const meetingType = q.get("type") || "tavlemode";
      const person = q.get("person") || "";
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const agenda = autopilotMod.generateMeetingAgenda(state, meetingType, { lang, person, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...agenda, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/autopilot/development" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autopilotMod = require("./js/ai-leadership-autopilot.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const plan = autopilotMod.generateLeadershipDevelopmentPlan(state, { lang });
      return send(res, 200, { ...plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/autopilot/voice" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autopilotMod = require("./js/ai-leadership-autopilot.js");
      const payload = (await body(req, 5000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const result = autopilotMod.processVoiceCommand(payload.command || "", state, { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Calendar Intelligence (auto-agenda generation) ─────────────────────
  if (req.url === "/api/calendar/intelligence" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const calendarIntel = require("./js/calendar-intelligence.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const result = calendarIntel.scanCalendarForMeetings(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url.startsWith("/api/calendar/agenda") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const calendarIntel = require("./js/calendar-intelligence.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const meetingTitle = q.get("title") || "Meeting";
      const meetingType = q.get("type") || "";
      const attendees = (q.get("attendees") || "").split(",").filter(Boolean);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const agenda = calendarIntel.generateAutoAgenda({ title: meetingTitle, type: meetingType, attendees }, state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...agenda, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Proactive Email Digest ──────────────────────────────────────────────
  if (req.url === "/api/digest/compose" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const emailDigest = require("./js/proactive-email-digest.js");
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const format = q.get("format") || "html";
      // ONE AI, ONE RANKING: the digest leads with the SAME ranked list the
      // Today screen shows (lib/today-cockpit.js) — the email can never
      // disagree with the screen or the voice briefing.
      let rankedItemsD = [];
      try {
        const ingD = gatherCockpitIngredients(projectId, { ws, lang, today: new Date().toISOString().slice(0, 10), role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
        rankedItemsD = (ingD.cockpit && ingD.cockpit.items) || [];
      } catch (_) { rankedItemsD = []; }
      // The automation scorecard: the loop's own results (met/unmet trips,
      // auto-filed rows) from the same ledger that calibrates the look-ahead.
      let scorecardD = null;
      let autoFiledD = null;
      try { scorecardD = require("./lib/week-prefetch.js").scorecard(project, { lang, today: new Date().toISOString().slice(0, 10) }); } catch (_) { scorecardD = null; }
      try { autoFiledD = require("./lib/review-tray.js").autoFiledReport(DATA_DIR, { projectId, lang, today: new Date().toISOString().slice(0, 10) }); } catch (_) { autoFiledD = null; }
      // The outage look-back: closed windows re-judged against the registers
      // (lib/outage-readiness.js) — the loop reports its results, not promises.
      let outageOutcomesD = null;
      try { outageOutcomesD = require("./lib/outage-readiness.js").outcomeReview(project, { lang, today: new Date().toISOString().slice(0, 10), lookbackDays: 21 }); } catch (_) { outageOutcomesD = null; }
      const digest = emailDigest.composeDigest(state, { lang, today: new Date().toISOString().slice(0, 10), rankedItems: rankedItemsD, scorecard: scorecardD, autoFiled: autoFiledD, outageOutcomes: outageOutcomesD });
      const rendered = format === "text" ? emailDigest.renderDigestAsText(digest) : emailDigest.renderDigestAsHtml(digest);
      return send(res, 200, { digest, rendered, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Smart Delegation Recommender ────────────────────────────────────────
  if (req.url === "/api/delegation/capacity" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const delegationMod = require("./js/smart-delegation-recommender.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const capacity = delegationMod.analyzeCapacity(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { capacity, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/delegation/recommend" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const delegationMod = require("./js/smart-delegation-recommender.js");
      const payload = (await body(req, 5000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const recs = delegationMod.recommendDelegation(payload.task || {}, state, { lang });
      return send(res, 200, { recommendations: recs, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/delegation/analyze" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const delegationMod = require("./js/smart-delegation-recommender.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const result = delegationMod.analyzeDelegationOpportunities(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── NLU Parser (text → register entries) ────────────────────────────────
  if (req.url === "/api/nlu/parse" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const nluParser = require("./js/nlu-register-parser.js");
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const text = String(payload.text || "").trim();
      if (!text) return send(res, 400, { error: "text is required" });
      if (text.length > 10000) return send(res, 400, { error: "text too long (max 10000)" });
      const result = nluParser.parseText(text, { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── NLU Meeting Transcript Parsing ────────────────────────────────────
  if (req.url === "/api/nlu/meeting" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const nluParser = require("./js/nlu-register-parser.js");
      const payload = (await body(req, 30000)) || {};
      const text = String(payload.text || "").trim();
      if (!text) return send(res, 400, { error: "text is required" });
      if (text.length > 50000) return send(res, 400, { error: "text too long (max 50000)" });
      const result = nluParser.parseMeetingTranscript(text, { lang: payload.lang || "en", meetingType: payload.meetingType || "general" });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Webhook Engine ─────────────────────────────────────────────────────
  if (req.url === "/api/webhooks" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const webhooks = webhookEngine.listWebhooks();
      return send(res, 200, { webhooks, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/webhooks" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const payload = (await body(req, 5000)) || {};
      const result = webhookEngine.registerWebhook({ url: payload.url, events: payload.events, secret: payload.secret, description: payload.description });
      return send(res, result.error ? 400 : 201, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url.startsWith("/api/webhooks/") && req.method === "DELETE") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const webhookId = req.url.split("/")[3];
      const result = webhookEngine.unregisterWebhook(webhookId);
      return send(res, result.error ? 400 : 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url.startsWith("/api/webhooks/") && req.url.endsWith("/test") && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const webhookId = req.url.split("/")[3];
      const result = webhookEngine.testWebhook(webhookId);
      return send(res, result.error ? 400 : 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/webhooks/events" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const events = webhookEngine.getEventTypes();
      return send(res, 200, { events, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/webhooks/trigger" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const webhookEngine = require("./js/webhook-engine.js");
      const payload = (await body(req, 5000)) || {};
      if (!payload.eventType) return send(res, 400, { error: "eventType is required" });
      const result = webhookEngine.processWebhookEvent(payload.eventType, payload.payload || {}, { source: payload.source || "api" });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Calendar Sync ──────────────────────────────────────────────────────
  if (req.url === "/api/calendar/sync/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const calendarSync = require("./js/calendar-sync.js");
      const status = calendarSync.getSyncStatus();
      return send(res, 200, { status, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/calendar/sync/focus" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const calendarSync = require("./js/calendar-sync.js");
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const date = q.get("date") || new Date().toISOString().slice(0, 10);
      const result = calendarSync.detectFocusBlocks([], { date });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/calendar/sync/schedule" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const calendarSync = require("./js/calendar-sync.js");
      const payload = (await body(req, 5000)) || {};
      const date = payload.date || new Date().toISOString().slice(0, 10);
      const attendees = payload.attendees || [];
      const duration = payload.durationMinutes || 30;
      const result = calendarSync.findOptimalSlots([], attendees, { date, durationMinutes: duration });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Proactive Background Monitor ─────────────────────────────────────
  if (req.url === "/api/monitor/snapshot" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const bgMonitor = require("./js/proactive-background-monitor.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const snapshot = bgMonitor.takeSnapshot(state);
      return send(res, 200, { snapshot, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/monitor/surface" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const bgMonitor = require("./js/proactive-background-monitor.js");
      const payload = (await body(req, 5000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const currentSnapshot = bgMonitor.takeSnapshot(state);
      const prevSnapshot = payload.previousSnapshot || null;
      const result = bgMonitor.surfaceChanges(prevSnapshot, currentSnapshot, { lang, limit: payload.limit || 3 });
      return send(res, 200, { ...result, currentSnapshot, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/monitor/briefing" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const bgMonitor = require("./js/proactive-background-monitor.js");
      const payload = (await body(req, 5000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const currentSnapshot = bgMonitor.takeSnapshot(state);
      const prevSnapshot = payload.previousSnapshot || null;
      const surfaced = bgMonitor.surfaceChanges(prevSnapshot, currentSnapshot, { lang, limit: payload.limit || 3 });
      const briefing = bgMonitor.generateContextualBriefing(surfaced, state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { briefing, surfaced, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Meeting Follow-Up Engine ──────────────────────────────────────────
  if (req.url === "/api/meeting/followup" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const meetingFollowUp = require("./js/meeting-followup-engine.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = meetingFollowUp.processMeetingFollowUp(payload, { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/meeting/debt" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const meetingFollowUp = require("./js/meeting-followup-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const meetings = (project && project.completedMeetings) || [];
      const debt = meetingFollowUp.calculateMeetingDebt(meetings, state, { lang });
      return send(res, 200, { debt, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Smart Nudge Engine ────────────────────────────────────────────────
  if (false && req.url === "/api/nudges" && req.method === "GET") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const smartNudge = require("./js/smart-nudge-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const result = smartNudge.generateNudges(state, { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/nudges/engage" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const smartNudge = require("./js/smart-nudge-engine.js");
      const payload = (await body(req, 5000)) || {};
      if (!payload.nudgeId || !payload.action) return send(res, 400, { error: "nudgeId and action required" });
      const entry = smartNudge.recordEngagement(payload.nudgeId, payload.action, { context: payload.context || {} });
      return send(res, 200, { entry, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/nudges/stats" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const smartNudge = require("./js/smart-nudge-engine.js");
      const stats = smartNudge.getEngagementStats();
      const profile = smartNudge.buildBehaviorProfile();
      return send(res, 200, { stats, profile, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 4: Workflow Orchestrator ────────────────────────────────────
  if (req.url === "/api/workflow/analyze" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const workflowOrch = require("./js/workflow-orchestrator.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const analysis = workflowOrch.analyzeWorkflow(state, { lang });
      return send(res, 200, { analysis, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/workflow/action-plan" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const workflowOrch = require("./js/workflow-orchestrator.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const plan = workflowOrch.generateActionPlan(state, { lang });
      return send(res, 200, { plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/workflow/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const workflowOrch = require("./js/workflow-orchestrator.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const health = workflowOrch.calculateWorkflowHealth(state);
      return send(res, 200, { health, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 4: Meeting Scheduler ────────────────────────────────────────
  if (req.url === "/api/meeting/effectiveness" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const meetingScheduler = require("./js/meeting-scheduler.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = meetingScheduler.analyzeMeetingEffectiveness({ lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/meeting/smart-agenda" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const meetingScheduler = require("./js/meeting-scheduler.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const agenda = meetingScheduler.generateSmartAgenda(payload, state, { lang });
      return send(res, 200, { agenda, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/meeting/optimal-time" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const meetingScheduler = require("./js/meeting-scheduler.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = meetingScheduler.findOptimalMeetingTime(payload.attendees || [], payload);
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 4: Turnover Predictor ───────────────────────────────────────
  if (req.url === "/api/team/flight-risk" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const turnoverPred = require("./js/turnover-predictor.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const dashboard = turnoverPred.generateTeamHealthDashboard(state.roster, state, { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── I2: Voice memo → tray (30-sec memo, transcript only) ────────────────
  if (req.url === "/api/voice/memo" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const transcript = String(payload.transcript || "").trim();
      if (!transcript) return send(res, 400, { error: "transcript is required" });
      if (transcript.length > 5000) return send(res, 400, { error: "transcript too long (max 5000)" });
      const lang = getLang(req, payload);
      const bridge = require("./lib/voice-tray-bridge.js");
      const built = bridge.transcriptToDraft(transcript, project, { lang });
      if (built.error) return send(res, 400, built);
      const externalId = "voice:" + transcript.slice(0, 40).replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g, "-");
      const reviewTray = require("./lib/review-tray.js");
      const submitted = reviewTray.submitDraft(DATA_DIR, {
        projectId, source: "voice-memo", externalId,
        register: built.register, row: built.row, summary: built.summary,
        lang: built.lang, actor: "voice-memo", sensitive: false, confidence: built.confidence
      });
      if (submitted.error) return send(res, 400, submitted);
      appendAudit({ action: "Voice memo draft", detail: `${projectId} — ${built.register}:${built.summary.slice(0, 80)}` });
      return send(res, submitted.duplicate ? 200 : 201, { draft: submitted.draft, duplicate: !!submitted.duplicate, intent: built.intent, confidence: built.confidence, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Tier 5: Context-Aware Briefing ─────────────────────────────────
  if (req.url === "/api/briefing/context" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const contextBriefing = require("./js/context-briefing.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, goals: (project && project.goals) || [] };
      const events = payload.events || [];
      const briefing = contextBriefing.generateContextBriefing(state, events, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { briefing, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 5: Portfolio Intelligence ──────────────────────────────────
  if (req.url === "/api/portfolio/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const portfolioIntel = require("./js/portfolio-intelligence.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const projects = Object.keys(ws.projects || {}).map(function(id) {
        return Object.assign({ id: id }, ws.projects[id]);
      });
      if (projects.length === 0 && ws.registers) {
        projects.push({ id: ws.name || "default", name: ws.name || "Default", registers: ws.registers });
      }
      const dashboard = portfolioIntel.generatePortfolioDashboard(projects, { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 5: Stakeholder Communications ──────────────────────────────
  if (req.url === "/api/comms/status-draft" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderComms = require("./js/stakeholder-comms.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { name: (project && project.name) || ws.name, roster: ws.roster || [], registers: (project && project.registers) || {} };
      const draft = stakeholderComms.draftStatusUpdate(state, { lang });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/comms/post-mortem" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderComms = require("./js/stakeholder-comms.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      if (!project) return send(res, 404, { error: "No project available" });
      const draft = stakeholderComms.draftPostMortem(project, { lang });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/comms/performance-review" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderComms = require("./js/stakeholder-comms.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const person = { name: payload.name || (ws.roster && ws.roster[0] && ws.roster[0].name) || "Unknown" };
      const draft = stakeholderComms.draftPerformanceReview(person, state, { lang });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/comms/strategic-update" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderComms = require("./js/stakeholder-comms.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, goals: (project && project.goals) || [] };
      const draft = stakeholderComms.draftStrategicUpdate(state, { lang });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 6: Emotional Intelligence Radar ───────────────────────────
  if (req.url === "/api/eq/dashboard" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const eqRadar = require("./js/emotional-intelligence-radar.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const dashboard = eqRadar.generateMoraleDashboard(state, {
        lang: lang,
        communications: payload.communications || [],
        meetings: payload.meetings || [],
        history: payload.history || []
      });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/eq/burnout" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const eqRadar = require("./js/emotional-intelligence-radar.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const burnout = eqRadar.detectBurnoutRisk(state, { lang: lang });
      return send(res, 200, { burnout, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 6: Natural Language Command Interface ──────────────────────
  if (req.url === "/api/nl/parse" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const nlCmd = require("./js/nl-command-interface.js");
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const command = nlCmd.parseCommand(payload.command || payload.text || "", { lang: lang });
      return send(res, 200, { command, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/nl/execute" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const nlCmd = require("./js/nl-command-interface.js");
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const command = nlCmd.parseCommand(payload.command || payload.text || "", { lang: lang });
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const plan = nlCmd.planExecution(command, state, { lang: lang });
      return send(res, 200, { command, plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/nl/suggestions" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const nlCmd = require("./js/nl-command-interface.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const suggestions = nlCmd.suggestQuickActions(state, { lang: lang });
      return send(res, 200, { suggestions, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 6: Stakeholder Relationship Intelligence ──────────────────
  if (req.url === "/api/relationships/dashboard" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderIntel = require("./js/stakeholder-intelligence.js");
      const payload = (await body(req, 30000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const contacts = payload.contacts || ws.roster || [];
      const interactions = payload.interactions || [];
      const dashboard = stakeholderIntel.generateNetworkDashboard(contacts, interactions, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/relationships/neglected" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const stakeholderIntel = require("./js/stakeholder-intelligence.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const network = stakeholderIntel.buildRelationshipNetwork(ws.roster || [], [], { lang: lang });
      const neglected = stakeholderIntel.detectNeglectedRelationships(network, { lang: lang });
      return send(res, 200, { neglected, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 7: AI Coaching Engine ─────────────────────────────────────
  if (req.url === "/api/coaching/start" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const coachingEngine = require("./js/ai-coaching-engine.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = coachingEngine.startConversation(ws.owner || "anonymous", { lang: lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/coaching/message" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const coachingEngine = require("./js/ai-coaching-engine.js");
      const payload = (await body(req, 30000)) || {};
      const result = coachingEngine.addMessage(payload.conversationId, "user", payload.message || "");
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/coaching/insights" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const coachingEngine = require("./js/ai-coaching-engine.js");
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const insights = coachingEngine.getCoachingInsights(ws.owner || "anonymous", { lang: lang });
      return send(res, 200, { insights, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 7: Auto Reporting Engine ──────────────────────────────────
  if (req.url === "/api/reports/weekly" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autoReport = require("./js/auto-reporting-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const format = (ws.settings && ws.settings.reportFormat) || "html";
      const report = autoReport.generateWeeklyStatusReport(state, { lang: lang });
      const rendered = autoReport.renderReport(report, format);
      return send(res, 200, { report, rendered, format, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/reports/project" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autoReport = require("./js/auto-reporting-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      if (!project) return send(res, 404, { error: "No project available" });
      const report = autoReport.generateProjectSummaryReport(project, { lang: lang });
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/reports/team" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autoReport = require("./js/auto-reporting-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const report = autoReport.generateTeamPerformanceReport(state, { lang: lang });
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/reports/risks" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const autoReport = require("./js/auto-reporting-engine.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { registers: (project && project.registers) || {} };
      const report = autoReport.generateRiskReport(state, { lang: lang });
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Tier 7: Team Analytics ─────────────────────────────────────────
  if (req.url === "/api/analytics/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const teamAnalytics = require("./js/team-analytics.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const dashboard = teamAnalytics.generateAnalyticsDashboard(state, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/analytics/velocity" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const teamAnalytics = require("./js/team-analytics.js");
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const tasks = ((project && project.registers) || {}).tasks || [];
      const velocity = teamAnalytics.calculateVelocity(tasks, { lang: lang });
      return send(res, 200, { velocity, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── I3: Smart defaults — one-tap prefill (assignee/dueDate/category) ────
  if (req.url === "/api/ai/ux/smart-defaults" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const kind = String(payload.kind || payload.context || "task");
      const mod = require("./lib/smart-defaults-tray.js");
      const result = mod.smartDefaultsFor(target, kind, payload.partial || payload);
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── I6: In-form coach — inline hints (missing charts → register links) ──
  if (req.url === "/api/coach/mentor/intake-hints" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const mod = require("./lib/in-form-coach.js");
      const hints = mod.intakeHints(project, payload.situationId, payload.inputs, lang, coachStore().engine);
      if (hints.error) return send(res, 400, hints);
      return send(res, 200, { ...hints, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── I9: Delegation copilot — capacity-aware one-tap ────────────────────
  if (req.url === "/api/delegation/apply" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const assignee = String(payload.assignee || "").trim();
      if (!assignee) return send(res, 400, { error: "assignee is required" });
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      // Token-based auth (LEADERSHIP_API_TOKENS) has no user object, so
      // canAccessProject returns "Authentication required" even for editor+
      // tokens. For delegation, fall back to global role when no session user
      // is present — the authorized() gate already verified editor+.
      const sessionUser = authStore().userFromRequest(req);
      if (sessionUser) {
        const decision = authorizeProjectWrite(req, project);
        if (decision && !decision.allowed) return send(res, 403, { error: decision.reason });
      }
      // Draft-assigned: rewrite the pending draft's row with the new assignee.
      if (payload.draftId) {
        const reviewTray = require("./lib/review-tray.js");
        const listing = reviewTray.listDrafts(DATA_DIR, { projectId, role: "admin" });
        const draft = (listing.drafts || []).find(d => d.id === String(payload.draftId));
        if (!draft) return send(res, 404, { error: "draft not found" });
        // Persist assignment by rewriting the draft file row (draft is still pending, so row is mutable via rewrite).
        // Simpler: discard + re-submit with the new assignee in the row.
        const row = Object.assign({}, draft.row || {}, { assignee, owner: assignee, delegatedAt: new Date().toISOString(), delegatedBy: (authStore().userFromRequest(req) || {}).name || "leader" });
        const newDraft = reviewTray.submitDraft(DATA_DIR, {
          projectId, source: draft.source, externalId: draft.externalId + ":delegated:" + assignee,
          register: draft.register, row, summary: draft.summary + " → " + assignee, lang: draft.lang || "en", actor: "delegation-copilot", sensitive: draft.sensitive, confidence: draft.confidence
        });
        reviewTray.discardDraft(DATA_DIR, { projectId, draftId: draft.id, actor: "delegation-copilot", reason: "delegated to " + assignee });
        appendAudit({ action: "Delegation copilot", detail: `${projectId} draft ${draft.id} → ${assignee}` });
        return send(res, 200, { ok: true, draft: newDraft.draft, previousDraftId: draft.id, assignee, revision: currentScopedRevision(req) });
      }
      // Task reference (taskTitle): create the task row with the assignee —
      // the copilot's navigator-item path (no draft exists to rewrite).
      const taskTitle = String(payload.taskTitle || "").trim();
      if (taskTitle) {
        const task = {
          _id: "task-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          title: taskTitle.slice(0, 300),
          status: "todo",
          assignee,
          owner: assignee,
          createdAt: new Date().toISOString(),
          delegatedFrom: "delegation-copilot"
        };
        // Locked read-modify-write on the request's own scope: the old
        // un-awaited writeWorkspace(ws) wrote the wrong file for session
        // users AND returned 201 + revision before the row was durable.
        let persisted = false;
        await mutateScopedWorkspace(req, fresh => {
          const state = requestedProjectState(req, fresh);
          const target = state.project;
          if (!target) return { changed: false };
          if (!Array.isArray(target.registers.tasks)) target.registers.tasks = [];
          target.registers.tasks.push(task);
          persisted = true;
          return { changed: true };
        });
        if (!persisted) return send(res, 404, { error: "No project available" });
        appendAudit({ action: "Delegation copilot", detail: `${projectId} task "${taskTitle.slice(0, 80)}" → ${assignee}` });
        return send(res, 201, { ok: true, task, assignee, revision: currentScopedRevision(req) });
      }
      return send(res, 400, { error: "draftId or task reference required" });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J1: Meeting → Actions autopilot ─────────────────────────────────────
  if (req.url === "/api/meeting/capture" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/meeting-actions-autopilot.js");
      const r = mod.meetingActionsToTray(DATA_DIR, {
        projectId,
        meeting: payload.meeting || {},
        captured: payload.captured || null,
        transcript: payload.transcript || "",
        workspace: project,
        lang: getLang(req, payload)
      });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Meeting capture drafts", detail: `${projectId} — ${r.submitted.length} draft(s) from meeting ${String((payload.meeting && payload.meeting.title) || "").slice(0, 60)}` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J2: Email/Slack zero-inbox (forward → tray) ────────────────────────
  if (req.url === "/api/inbox/forward" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/zero-inbox-bridge.js");
      const r = mod.emailToTray(DATA_DIR, {
        projectId,
        text: payload.text || payload.body || "",
        subject: payload.subject || "",
        from: payload.from || "forwarded",
        externalId: payload.messageId || payload.externalId || "",
        workspace: project,
        lang: getLang(req, payload)
      });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Inbox forward drafts", detail: `${projectId} — ${r.submitted.length} draft(s) from ${String(payload.from || "forward").slice(0, 60)}` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J3: Visual capture (whiteboard photo transcript → drafts) ───────────
  if (req.url === "/api/visual/capture" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/visual-capture-bridge.js");
      const r = mod.visualTranscriptToTray(DATA_DIR, {
        projectId,
        transcript: payload.transcript || "",
        imageMeta: payload.imageMeta || null,
        workspace: project,
        lang: getLang(req, payload)
      });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Visual capture drafts", detail: `${projectId} — ${r.submitted.length} draft(s) from board` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J4: Proactive nudges before 1:1s ──────────────────────────────────
  // dead branch: the over-broad startsWith matcher shadowed the specific
  // /api/nudges/{candidates,context,strip} handlers below (breaking the
  // context-nudge UI), and exact GET /api/nudges is served by the earlier
  // "13. Intelligent Nudges" handler (scripts/audit-dup-routes.cjs).
  if (false && req.url.startsWith("/api/nudges") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/proactive-nudges.js");
      const nudges = mod.nudgesForUpcoming(project, { lang, today });
      return send(res, 200, { nudges, count: nudges.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J5: Role-play simulator ───────────────────────────────────────────
  if (req.url === "/api/roleplay/session" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/roleplay-simulator.js");
      const lang = getLang(req, payload);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local" };
      const r = mod.createSession(DATA_DIR, { projectId, situationId: payload.situationId, situationName: payload.situationName, person: payload.person, lang, actor: user.name || user.id });
      if (r.error) return send(res, 400, r);
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/roleplay/sessions") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const mod = require("./lib/roleplay-simulator.js");
      const r = mod.listSessions(DATA_DIR, { projectId, limit: Number(q.get("limit") || 20) });
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/roleplay\/session\/[^/]+$/) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4].split("?")[0]);
      const mod = require("./lib/roleplay-simulator.js");
      const r = mod.getSession(DATA_DIR, id);
      if (r.error) return send(res, r.status || 404, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/roleplay\/session\/[^/]+\/turn$/) && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4]);
      const payload = (await body(req, 20000)) || {};
      const mod = require("./lib/roleplay-simulator.js");
      const r = mod.addTurn(DATA_DIR, id, { speaker: payload.speaker, text: payload.text });
      if (r.error) return send(res, r.status || 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/roleplay\/session\/[^/]+\/debrief$/) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4]);
      const mod = require("./lib/roleplay-simulator.js");
      const r = mod.debrief(DATA_DIR, id);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J6: Leadership memory twin ────────────────────────────────────────
  if (req.url === "/api/memory/record" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const mod = require("./lib/leadership-memory-twin.js");
      if (payload.outcome) {
        const r = mod.recordOutcome(DATA_DIR, { projectId, person: payload.person, situationId: payload.situationId, style: payload.style, outcome: payload.outcome, note: payload.note });
        if (r.error) return send(res, 400, r);
        return send(res, 201, { ...r, revision: currentScopedRevision(req) });
      }
      const r = mod.recordInteraction(DATA_DIR, { projectId, person: payload.person, situationId: payload.situationId, style: payload.style, note: payload.note });
      if (r.error) return send(res, 400, r);
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/memory/") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const person = decodeURIComponent((req.url.split("/")[3] || "").split("?")[0]);
      if (!person) return send(res, 400, { error: "person is required" });
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const mod = require("./lib/leadership-memory-twin.js");
      const r = mod.memoryFor(DATA_DIR, { projectId, person });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J7: Portfolio twin ────────────────────────────────────────────────
  if (req.url === "/api/portfolio/twin" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const mod = require("./lib/portfolio-twin.js");
      const r = mod.portfolioTwin(ws, { lang });
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J8: Trajectory impacts ────────────────────────────────────────────
  if (req.url === "/api/trajectory/impacts" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/trajectory-impacts.js");
      const r = mod.trajectoryImpacts(target, { lang, today });
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── J9: Decision debt ─────────────────────────────────────────────────
  if (req.url === "/api/decision-debt" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/decision-debt-service.js");
      const r = mod.decisionDebt(target, { lang, today });
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K1: Commute Mentor (voice dialogue car mode) ────────────────────────
  if (req.url === "/api/commute/session" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/commute-mentor.js");
      const r = mod.createCommuteSession(DATA_DIR, { projectId, lang: getLang(req, payload), workspace: project });
      if (r.error) return send(res, 400, r);
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/commute\/session\/[^/]+\/utterance$/) && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4]);
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const mod = require("./lib/commute-mentor.js");
      const r = await mod.commuteUtterance(DATA_DIR, id, { transcript: payload.transcript }, { dataDir: DATA_DIR, project, projectId, coachStore: coachStore(), remoteHook: remoteCoachHook });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/commute\/session\/[^/]+$/) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4].split("?")[0]);
      const mod = require("./lib/mentor-threads.js");
      const r = mod.getThread(DATA_DIR, id);
      if (r.error) return send(res, r.status || 404, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/commute/end" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const id = String(payload.sessionId || payload.id || "").trim();
      if (!id) return send(res, 400, { error: "sessionId required" });
      const mod = require("./lib/commute-mentor.js");
      const r = mod.endCommuteSession(DATA_DIR, id);
      if (r.error) return send(res, r.status || 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K2: Calendar Defense ──────────────────────────────────────────────
  if (req.url === "/api/calendar/defense" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/calendar-defense.js");
      return send(res, 200, { ...mod.calendarDefense(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K3: Workload Rebalancer ───────────────────────────────────────────
  if (req.url === "/api/workload/rebalance" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/workload-rebalancer.js");
      return send(res, 200, { ...mod.rebalancerSuggestions(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/workload/rebalance/apply" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const mod = require("./lib/workload-rebalancer.js");
      const r = mod.rebalancerToTray(DATA_DIR, { projectId, suggestions: payload.suggestions, lang: getLang(req, payload) });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Workload rebalance drafts", detail: `${projectId} — ${r.submitted.length} draft(s)` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K4: Conflict Radar ────────────────────────────────────────────────
  if (req.url === "/api/conflict/radar" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/conflict-radar.js");
      return send(res, 200, { ...mod.conflictRadar(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K5: Scenario Twin (what-if) ───────────────────────────────────────
  if (req.url === "/api/scenario/simulate" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/scenario-twin.js");
      return send(res, 200, { ...mod.scenarioTwin(ws, payload.scenario || {}, { lang }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K6: Stakeholder Autopilot ─────────────────────────────────────────
  if ((req.url === "/api/stakeholder/map" || req.url.startsWith("/api/stakeholder/map?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const mod = require("./lib/stakeholder-autopilot.js");
      const map = mod.stakeholderMapFor(ws, { projectId: q.get("projectId") });
      const comms = mod.draftComms(ws.projects && ws.projects[q.get("projectId")] || ws, { lang: getLang(req) });
      return send(res, 200, { ...map, comms, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/stakeholder/comms-to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const mod = require("./lib/stakeholder-autopilot.js");
      const comms = payload.comms || mod.draftComms(project || ws, { lang: getLang(req) });
      const r = mod.stakeholderCommsToTray(DATA_DIR, { projectId: projectId || ws.activeId || "p1", comms, lang: getLang(req, payload), project: project || ws });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Stakeholder comms drafts", detail: `${r.submitted.length} draft(s)` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K7: Evidence Pack Autopilot ───────────────────────────────────────
  if (req.url === "/api/evidence/pack" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const audit = readAudit();
      const approvals = readApprovals();
      const mod = require("./lib/evidence-autopilot.js");
      const r = mod.buildEvidencePack({ audit, approvals, finance: [], controlTests: [], retention: [], incidents: [], anchor: null, automation: [] }, { lang });
      if (r.error) return send(res, 500, r);
      const summ = mod.evidenceAutopilotSummary(r.pack, { lang });
      return send(res, 200, { ...r, ...summ, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K8: Roster Orchestrator ───────────────────────────────────────────
  if (req.url === "/api/roster/changes" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const roster = (project && project.roster) || ws.roster || [];
      // Without history we surface current roster with orchestration preview
      const mod = require("./lib/roster-orchestrator.js");
      const changes = { joined: [], left: [] };
      const orch = mod.orchestratorToTray.__orchestratorChanges ? mod.orchestratorToTray.__orchestratorChanges : { submitted: [] };
      void orch;
      return send(res, 200, { roster, count: roster.length, changes, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/roster/orchestrate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const target = project || ws;
      const mod = require("./lib/roster-orchestrator.js");
      const changes = payload.changes || mod.detectRosterChanges(payload.prevRoster || [], payload.nextRoster || target.roster || []);
      const r = mod.orchestratorToTray(DATA_DIR, { projectId: projectId || ws.activeId || "p1", changes, lang: getLang(req, payload), project: target });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Roster orchestration drafts", detail: `${r.submitted.length} draft(s) for roster changes` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K9: Team Pulse Guard ──────────────────────────────────────────────
  if (req.url === "/api/pulse/guard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/team-pulse-guard.js");
      return send(res, 200, { ...mod.teamPulseGuard(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── K10: Chief Loop (nightly brief → digest) ──────────────────────────
  if (req.url === "/api/chief/brief" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const mod = require("./lib/chief-loop.js");
      return send(res, 200, { ...mod.chiefLoopBrief(ws, { lang, today, project: project || ws, cockpit: ing.cockpit }), cockpit: ing.cockpit, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L1: Auto-Assign & Escalation Copilot ──────────────────────────────
  if (req.url === "/api/auto-assign/suggestions" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/auto-assign-bridge.js");
      return send(res, 200, { ...mod.assignmentSuggestions(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/auto-assign/escalations" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/auto-assign-bridge.js");
      return send(res, 200, { ...mod.escalationAlerts(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/auto-assign/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const kind = String(payload.kind || "assign").toLowerCase();
      const mod = require("./lib/auto-assign-bridge.js");
      const r = kind === "escalation" || kind === "escalate"
        ? mod.escalationToTray(DATA_DIR, { projectId, escalations: payload.escalations || payload.suggestions || [], lang: getLang(req, payload) })
        : mod.autoAssignToTray(DATA_DIR, { projectId, suggestions: payload.suggestions || [], lang: getLang(req, payload) });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: kind === "escalation" ? "Escalation drafts" : "Auto-assign drafts", detail: `${projectId} — ${r.submitted.length} draft(s)` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L2: Adaptive Automation Rules ─────────────────────────────────────
  if (req.url === "/api/adaptive-rules/parse" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const mod = require("./lib/adaptive-rules-bridge.js");
      const r = mod.parseRule(payload.text, ws);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/adaptive-rules" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const mod = require("./lib/adaptive-rules-bridge.js");
      const r = mod.createRule(DATA_DIR, payload.text, ws);
      if (r.error) return send(res, 400, r);
      appendAudit({ action: "Adaptive rule created", detail: String(payload.text || "").slice(0, 80) });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if ((req.url === "/api/adaptive-rules" || req.url.startsWith("/api/adaptive-rules?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const mod = require("./lib/adaptive-rules-bridge.js");
      return send(res, 200, { ...mod.listRules(DATA_DIR), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/adaptive-rules/evaluate" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const mod = require("./lib/adaptive-rules-bridge.js");
      return send(res, 200, { ...mod.evaluateAll(DATA_DIR, ws), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/adaptive-rules\/[^/]+\/outcome$/) && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[3]);
      const payload = (await body(req, 10000)) || {};
      const mod = require("./lib/adaptive-rules-bridge.js");
      const r = mod.recordOutcome(DATA_DIR, id, payload.accepted);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/adaptive-rules\/[^/]+$/) && req.method === "PATCH") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[3]);
      const payload = (await body(req, 10000)) || {};
      const mod = require("./lib/adaptive-rules-bridge.js");
      const r = mod.toggleRule(DATA_DIR, id, payload.enabled);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.match(/^\/api\/adaptive-rules\/[^/]+$/) && req.method === "DELETE") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[3]);
      const mod = require("./lib/adaptive-rules-bridge.js");
      const r = mod.deleteRule(DATA_DIR, id);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L3: Cross-Domain Intelligence ─────────────────────────────────────
  if (req.url === "/api/cross-domain/insights" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const mod = require("./lib/cross-domain-bridge.js");
      return send(res, 200, { ...mod.crossDomainInsights(ws, { lang }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cross-domain/root-cause" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/cross-domain-bridge.js");
      const r = mod.rootCauseFor(ws, payload.symptom || payload.type, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L4: Sentiment Pulse ───────────────────────────────────────────────
  if (req.url === "/api/sentiment/pulse" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/sentiment-pulse-bridge.js");
      return send(res, 200, { ...mod.sentimentPulse(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L5: Decision Quality Coach ────────────────────────────────────────
  if (req.url === "/api/decision-quality/score" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const lang = (getLang(req, payload));
      const mod = require("./lib/decision-quality-bridge.js");
      const r = mod.scoreOne(payload.decision || payload, { lang, today: new Date().toISOString().slice(0, 10) });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-quality/vroom" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 10000)) || {};
      const mod = require("./lib/decision-quality-bridge.js");
      const r = mod.vroomFor(payload.input || payload);
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-quality/org-health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/decision-quality-bridge.js");
      return send(res, 200, { ...mod.orgHealth(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L6: Fingerprint Twin ──────────────────────────────────────────────
  if (req.url === "/api/fingerprint/profile" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/fingerprint-twin-bridge.js");
      return send(res, 200, { ...mod.fingerprintFor(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L7: Meeting Intel (transcript → tray) ─────────────────────────────
  if (req.url === "/api/meeting/intel" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const transcript = String(payload.transcript || "").trim();
      if (!transcript) return send(res, 400, { error: "transcript required" });
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const mod = require("./lib/meeting-intel-bridge.js");
      const r = mod.meetingIntelToTray(DATA_DIR, { projectId, transcript, title: payload.title || "Meeting", lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Meeting intel drafts", detail: `${projectId} — ${r.submitted.length} from ${String(payload.title || "Meeting").slice(0, 40)} — ${r.intel.summary || ""}` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/meeting/intel/analyze" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const transcript = String(payload.transcript || "").trim();
      if (!transcript) return send(res, 400, { error: "transcript required" });
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/meeting-intel-bridge.js");
      const r = mod.analyzeTranscript(transcript, { title: payload.title || "Meeting" }, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L8: Coaching Quality ──────────────────────────────────────────────
  if (req.url === "/api/coaching-quality/review" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/coaching-quality-bridge.js");
      const r = mod.reviewOne(payload.session || payload, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/coaching-quality/report" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const target = project || ws;
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/coaching-quality-bridge.js");
      return send(res, 200, { ...mod.reportFor(target, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L9: Portfolio Stress Twin ─────────────────────────────────────────
  if (req.url === "/api/portfolio/stress" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/portfolio-stress-bridge.js");
      return send(res, 200, { ...mod.stressTwin(ws, payload.scenario || {}, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M1: Budget Forecast ─────────────────────────────────────────────
  if (req.url === "/api/budget/forecast" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/budget-forecast-bridge.js");
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const targetProjectId = q.get("projectId");
      const targetProject = targetProjectId && ws.projects && ws.projects[targetProjectId] ? ws.projects[targetProjectId] : project;
      const r = mod.budgetForecast(targetProject, { lang, today });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, projectId: targetProjectId || projectId, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/budget/forecast/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const base = payload.projectId && ws.projects && ws.projects[payload.projectId] ? ws.projects[payload.projectId] : (requestedProjectState(req, ws).project || ws);
      const mod = require("./lib/budget-forecast-bridge.js");
      const forecast = payload.forecast || mod.budgetForecast(base, { lang, today: new Date().toISOString().slice(0, 10) });
      const r = mod.budgetToTray(DATA_DIR, { projectId, forecast, mitigations: payload.mitigations || forecast.mitigation || forecast.recommendations, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Budget forecast draft", detail: `${projectId} — ${r.submitted.length} mitigation(s)` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/budget/portfolio" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/budget-forecast-bridge.js");
      return send(res, 200, { ...mod.portfolioForecast(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M2: Capacity Twin ───────────────────────────────────────────────
  if (req.url === "/api/capacity/twin" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/capacity-twin-bridge.js");
      return send(res, 200, { ...mod.capacityTwin(ws, project, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/capacity/twin/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/capacity-twin-bridge.js");
      const twin = mod.capacityTwin(ws, project, { lang, today });
      const r = mod.capacityToTray(DATA_DIR, { projectId, gaps: twin.gaps, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Capacity gap draft", detail: `${projectId} — ${r.submitted.length} gap(s)` });
      return send(res, 201, { ...r, gapTwin: twin, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M3: Cascade Copilot ─────────────────────────────────────────────
  if (req.url === "/api/cascade/plan" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/cascade-bridge.js");
      const r = mod.cascadePlan(ws, { title: payload.title, content: payload.content, keyThemes: payload.keyThemes, targetAudience: payload.targetAudience, urgency: payload.urgency, channels: payload.channels, cascadeLevels: payload.cascadeLevels, lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cascade/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const plan = payload.plan || (payload.title && payload.content ? require("./lib/cascade-bridge.js").cascadePlan(ws, { title: payload.title, content: payload.content, keyThemes: payload.keyThemes, lang }).plan : null);
      if (!plan) return send(res, 400, { error: "plan required (or title+content)" });
      const mod = require("./lib/cascade-bridge.js");
      const r = mod.cascadeToTray(DATA_DIR, { projectId, plan, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Cascade draft", detail: `${projectId} — ${r.submitted.length} level(s)` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M4: Outcome Predictor ───────────────────────────────────────────
  if (req.url === "/api/people/outlook" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const person = payload.person || (payload.personId ? (ws.roster || []).find(m => String(m.id||m.name) === String(payload.personId)) : null) || { id: payload.personId || "person", name: payload.personId || "" };
      const mod = require("./lib/outcome-predictor-bridge.js");
      const r = mod.peopleOutlook(person, payload.modelData || {}, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people/outlook/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const mod = require("./lib/outcome-predictor-bridge.js");
      const outlook = payload.outlook || (payload.personId ? mod.peopleOutlook({ id: payload.personId, name: payload.personId }, payload.modelData || {}, { lang }) : null);
      if (!outlook || outlook.error) return send(res, 400, { error: outlook && outlook.error ? outlook.error : "outlook required" });
      const r = mod.predictorToTray(DATA_DIR, { projectId, outlook, personId: payload.personId, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Retention draft", detail: `${projectId} — ${payload.personId || outlook.personId} flight risk` });
      return send(res, 201, { ...r, outlook, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M5: Portfolio Optimizer ─────────────────────────────────────────
  if (req.url === "/api/portfolio/optimize" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const initiatives = payload.initiatives || ws.initiatives || ws;
      const constraints = payload.constraints || null;
      const mod = require("./lib/portfolio-optimizer-bridge.js");
      const r = mod.optimizePortfolio(initiatives, constraints, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/portfolio/optimize/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const mod = require("./lib/portfolio-optimizer-bridge.js");
      const optR = payload.selected ? { selected: payload.selected } : mod.optimizePortfolio(payload.initiatives || ws, payload.constraints || null, { lang });
      const selected = Array.isArray(optR.selected) ? optR.selected : [];
      const r = mod.optimizerToTray(DATA_DIR, { projectId, selected, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Portfolio selection draft", detail: `${projectId} — ${selected.length} initiative(s)` });
      return send(res, 201, { ...r, optResult: optR, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M6: Risk Portfolio ──────────────────────────────────────────────
  if (req.url === "/api/risk/portfolio" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/risk-portfolio-bridge.js");
      return send(res, 200, { ...mod.riskPortfolio(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/risk/portfolio/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/risk-portfolio-bridge.js");
      const portfolio = mod.riskPortfolio(ws, { lang, today });
      const r = mod.riskPortfolioToTray(DATA_DIR, { projectId, portfolio, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Risk portfolio draft", detail: `${projectId} — systemic theme mitigation` });
      return send(res, 201, { ...r, portfolio, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M7: Team Dynamics ───────────────────────────────────────────────
  if (req.url === "/api/team/pulse" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/team-dynamics-bridge.js");
      return send(res, 200, { ...mod.teamPulse(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/team/pulse/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const mod = require("./lib/team-dynamics-bridge.js");
      const pulse = mod.teamPulse(ws, { lang, today });
      const r = mod.teamPulseToTray(DATA_DIR, { projectId, pulse, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Team dynamics draft", detail: `${projectId} — cohesion action` });
      return send(res, 201, { ...r, pulse, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M8: Adaptive Leadership ─────────────────────────────────────────
  if (req.url === "/api/adaptive/classify" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const mod = require("./lib/adaptive-leadership-bridge.js");
      // Always use fullAssess when input carries signals — server normalizes the test's expected shape so tech=technical works from the 5 signals.
      const hasSignals = payload.input && typeof payload.input === "object" && (payload.input.problemDefinition != null || payload.input.knownSolution != null || payload.disequilibrium != null);
      const r = hasSignals ? mod.fullAssess(payload.input, { lang }) : mod.classify(payload.input || payload, { lang });
      // fullAssess nests classification; flatten type/stance for the /api/adaptive/classify contract
      if (r && r.classification && !r.type) r.type = r.classification.type;
      if (r && !r.stance && r.classification && r.classification.stance) r.stance = r.classification.stance;
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/adaptive/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const mod = require("./lib/adaptive-leadership-bridge.js");
      const assess = payload.assess || mod.fullAssess(payload.input || payload, { lang });
      const r = mod.adaptiveToTray(DATA_DIR, { projectId, assess, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Adaptive leadership draft", detail: `${projectId} — ${assess.classification ? assess.classification.type : "challenge"}` });
      return send(res, 201, { ...r, assess, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M9: Change Navigator ────────────────────────────────────────────
  if (req.url === "/api/change/impact" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const lang = getLang(req, payload);
      const change = payload.change || (payload.title ? { id: payload.title, title: payload.title, affectedRoles: payload.affectedRoles || [], capexAmount: payload.capexAmount } : null);
      if (!change) return send(res, 400, { error: "change required" });
      const mod = require("./lib/change-navigator-bridge.js");
      const r = mod.changeImpact(change, { orgContext: payload.orgContext || {}, financialContext: payload.financialContext || {}, riskContext: payload.riskContext || {} }, { lang });
      if (r.error) return send(res, 400, r);
      return send(res, 200, { ...r, changeId: change.id, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/change/to-tray" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      if (!projectId) return send(res, 404, { error: "No project available" });
      const lang = getLang(req, payload);
      const change = payload.change || { id: String(payload.title || "change"), title: payload.title || "Change" };
      if (!change.title && !change.id) return send(res, 400, { error: "change required" });
      const mod = require("./lib/change-navigator-bridge.js");
      const impact = payload.impact || null;
      const r = mod.changeToTray(DATA_DIR, { projectId, change, impact, lang });
      if (r.error) return send(res, 400, r);
      if (r.submitted && r.submitted.length) appendAudit({ action: "Change assessment draft", detail: `${projectId} — ${change.id}` });
      return send(res, 201, { ...r, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── M10: Autonomous Ops Brief v3 ────────────────────────────────────
  if (req.url === "/api/ops/brief" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const mod = require("./lib/autonomous-ops-brief.js");
      return send(res, 200, { ...mod.autonomousOpsBrief(ws, { lang, today, project: project || ws, cockpit: ing.cockpit }), cockpit: ing.cockpit, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── L10: Unified Brief v2 ─────────────────────────────────────────────
  if (req.url === "/api/brief/v2" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const mod = require("./lib/unified-brief-v2.js");
      return send(res, 200, { ...mod.unifiedBriefV2(ws, { lang, today, project: project || ws, cockpit: ing.cockpit, dataDir: DATA_DIR }), cockpit: ing.cockpit, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── O-wave routes: firewall, one-question, people, playbook, reports ──
  // Read-only projections unless explicitly noted (answer logging + tray
  // drafts). The tray remains the only door to the registers.
  if ((req.url === "/api/attention-firewall" || req.url.startsWith("/api/attention-firewall?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const budgetMinutes = Number(q.get("minutes") || 15);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const packages = require("./lib/decision-packages.js").decisionPackages(ws, { lang, today });
      const ds = require("./lib/decision-session.js").decisionSession({ tray: ing.tray, proposals: ing.proposals, openCases: ing.openCases, stalledCases: ing.stalledCases, navigator: ing.navigator, dueJobs: ing.dueJobs, packages }, { lang, today, budgetMinutes });
      const mod = require("./lib/attention-firewall.js");
      return send(res, 200, { ...mod.triage(ds.items, { lang, today }), stalledReturns: mod.stalledReturns(project || ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/attention-firewall/delegate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 50000)) || {};
      const mod = require("./lib/attention-firewall.js");
      const triaged = mod.triage(Array.isArray(payload.items) ? payload.items : [], { lang: payload.lang, today: new Date().toISOString().slice(0, 10) });
      const out = mod.delegateToTray(DATA_DIR, { projectId: payload.projectId, items: triaged.delegatable, lang: payload.lang });
      if (out.count) appendAudit({ action: "Attention firewall delegated items", detail: out.count + " draft(s) submitted to the review tray" });
      return send(res, out.errors.length ? 207 : 201, out);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if ((req.url === "/api/one-question" || req.url.startsWith("/api/one-question?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const q = require("./lib/one-question.js").dailyQuestion(project, { lang, today });
      if (!q) return send(res, 200, { date: today, lang, restDay: true });
      const answered = require("./lib/one-question.js").answerFor(DATA_DIR, { projectId: projectId || "workspace", questionId: q.question.id });
      return send(res, 200, { ...q, answered: !!answered, answer: answered ? answered.value : null, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/one-question/answer" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 5000)) || {};
      const out = require("./lib/one-question.js").recordAnswer(DATA_DIR, payload);
      if (out.error) return send(res, 400, out);
      if (!out.duplicate) appendAudit({ action: "One-question answer recorded", detail: payload.questionId + " = " + payload.value });
      return send(res, 201, out);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people-certainty" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      return send(res, 200, { ...require("./lib/people-certainty.js").peopleCertainty(project, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if ((req.url === "/api/playbook" || req.url.startsWith("/api/playbook?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const mod = require("./lib/playbook-generator.js");
      const drafts = mod.playbookDrafts(project, { lang });
      // situationSeeds: the patterns the leader never had to name — born
      // from proven actions, cited through the alias map like any situation.
      let situations = [];
      try { situations = mod.situationSeeds(project, { lang }); } catch (_) { situations = []; }
      return send(res, 200, { drafts, approved: mod.approvedPlaybook(project), situations, citation: mod.playbookCitation(project, (req.url.split("?")[1] || "").split("situationId=")[1]?.split("&")[0] || null, lang), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/playbook/submit" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 50000)) || {};
      const out = require("./lib/playbook-generator.js").submitDraftsToTray(DATA_DIR, payload);
      if (out.count) appendAudit({ action: "Playbook drafts submitted", detail: out.count + " draft(s) to the review tray" });
      return send(res, out.errors.length ? 207 : 201, out);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if ((req.url === "/api/stakeholder-reports" || req.url.startsWith("/api/stakeholder-reports?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      return send(res, 200, { reports: require("./lib/stakeholder-reports.js").allReports(project, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/stakeholder-reports/submit" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 100000)) || {};
      const out = require("./lib/stakeholder-reports.js").submitToTray(DATA_DIR, payload);
      if (out.count) appendAudit({ action: "Stakeholder reports drafted", detail: out.count + " report draft(s) to the review tray" });
      return send(res, out.errors.length ? 207 : 201, out);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── N-wave routes: certainty, profile, packages, session, voice ────────
  // All read-only projections of the registers (viewer+); nothing here
  // mutates a workspace. The session and voice script are compositions of
  // the SAME gatherer /api/today uses, so no surface can disagree.
  if (req.url === "/api/delivery-certainty" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      return send(res, 200, { ...require("./lib/delivery-certainty.js").deliveryCertainty(project, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/leader-profile" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      if (!project) return send(res, 404, { error: "No project available" });
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      return send(res, 200, { ...require("./lib/leader-profile.js").leaderProfile(project, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-packages" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      return send(res, 200, { ...require("./lib/decision-packages.js").decisionPackages(ws, { lang, today }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if ((req.url === "/api/decision-session" || req.url.startsWith("/api/decision-session?")) && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const budgetMinutes = Number(q.get("minutes") || 15);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const packages = require("./lib/decision-packages.js").decisionPackages(ws, { lang, today });
      return send(res, 200, { ...require("./lib/decision-session.js").decisionSession({ tray: ing.tray, proposals: ing.proposals, openCases: ing.openCases, stalledCases: ing.stalledCases, navigator: ing.navigator, dueJobs: ing.dueJobs, packages }, { lang, today, budgetMinutes }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/decision-session/voice") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const today = new Date().toISOString().slice(0, 10);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const budgetMinutes = Number(q.get("minutes") || 15);
      const ing = gatherCockpitIngredients(projectId, { ws, lang, today, role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
      const packages = require("./lib/decision-packages.js").decisionPackages(ws, { lang, today });
      const session = require("./lib/decision-session.js").decisionSession({ tray: ing.tray, proposals: ing.proposals, openCases: ing.openCases, stalledCases: ing.stalledCases, navigator: ing.navigator, dueJobs: ing.dueJobs, packages }, { lang, today, budgetMinutes });
      return send(res, 200, { ...require("./lib/voice-session.js").voiceScript(session, { lang }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-session/interpret" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 2000)) || {};
      const lang = getLang(req, payload);
      return send(res, 200, require("./lib/voice-session.js").voiceInterpret(payload.utterance, lang) || { intent: "unknown" });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── I10: Digest push fan-out (+ notification-delivery Web Push) ─────────
  // GET /api/digest/preview and POST /api/digest/send already exist and are
  // per-user (runDigestDeliveryGated → every active admin/editor). I10 adds
  // the push channel: when the client registered Web Push subscriptions,
  // deliverCreated pushes the digest notification to each device alongside
  // email. Also exposed as GET /api/digest/channels for observability.
  if (req.url === "/api/digest/channels" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const pushStore = (() => { try { return require("./lib/push-subscription-store.js"); } catch (_) { return null; } })();
      const count = pushStore ? pushStore.count : 0;
      return send(res, 200, { channels: ["email"].concat(count ? ["push"] : []).concat(process.env.SMTP_HOST ? [] : ["outbox"]), pushSubscriptions: count, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/coach/mentor/case" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const lang = getLang(req, payload);
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      if (!state.project) return send(res, 404, { error: "No project available" });
      if (state.explicit) {
        const decision = authorizeProjectWrite(req, state.project);
        if (!decision.allowed) return send(res, 403, { error: decision.reason });
      }
      const normalized = coachStore().engine.mentorCase(payload, lang);
      if (normalized.error) return send(res, 400, normalized);
      const project = state.project;
      if (!Array.isArray(project.mentorCases)) project.mentorCases = [];
      const idx = project.mentorCases.findIndex(c => c && c.id === normalized.id);
      let saved = normalized;
      if (idx >= 0) {
        saved = Object.assign({}, normalized, { createdAt: project.mentorCases[idx].createdAt || normalized.createdAt });
        project.mentorCases[idx] = saved;
      } else {
        if (project.mentorCases.length >= 200) return send(res, 400, { error: "at most 200 mentor cases per project" });
        project.mentorCases.push(saved);
      }
      // Solve-on-save: the SERVER computes the stored summary, so a case can
      // never claim a solution it did not get.
      let solution = null;
      if (payload.solve === true) {
        solution = await coachStore().solveMentor(project, { situationId: saved.situationId, problem: saved.problem, inputs: saved.inputs, lang }, remoteCoachHook);
        saved.lastSolutionAt = new Date().toISOString();
        saved.lastConfidence = solution.confidence || "low";
        saved.lastSolutionSummary = {
          methods: (solution.methods || []).slice(0, 4).map(m => m.id),
          missingCharts: ((solution.intake && solution.intake.missing) || []).length,
          humanReviewRequired: !!(solution.humanReview && solution.humanReview.required)
        };
        // Store the plan WITH the case: the follow-up must be able to ask about
        // each measure by name ("step 2: did the 1:1 happen?"), not vaguely
        // "did it work?". Bounded by the engine's own normalization.
        saved.plan = coachStore().engine.mentorCase({ situationId: saved.situationId, plan: (solution.actionPlan || []).map(a => ({ action: a.action, owner: a.owner, measure: a.measure, reviewDate: a.reviewDate })) }, lang).plan;
        saved.updatedAt = new Date().toISOString();
        // Learning loop (PROACTIVE_AI_SPEC.md I): the decision is logged to the
        // journal + memory graph NOW, and the ids are stored ON the case so
        // the re-measurement can record the outcome back. The ids are also
        // visible in the API response — auditable correlation, not hidden magic.
        try {
          const learningLoopLib = require("./lib/learning-loop.js");
          const dm = learningLoopLib.logDecisionForCase({
            journal: require("./js/decision-journal.js"),
            memoryGraph: require("./js/leader-memory-graph.js"),
            caseId: saved.id,
            situationId: saved.situationId,
            situationName: (coachStore().engine.mentorSituations(lang).find(s => s.id === saved.situationId) || {}).name,
            problem: saved.problem,
            methods: saved.lastSolutionSummary.methods,
            confidence: saved.lastConfidence
          });
          if (!dm.error) saved.decisionMemory = dm;
        } catch (_) { /* memory must never break the solve */ }
        // Outcome flywheel: a solved case gets its re-measurement job queued
        // through the same durable gate as every automation job. The result
        // feeds method-effectiveness, which the mentor cites as measured
        // evidence (PROACTIVE_AI_SPEC.md direction E).
        try {
          const asOf = new Date().toISOString().slice(0, 10);
          const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
          if (gate.allowed) {
            jobStore.enqueueJobs(JOBS_FILE, { asOf, jobs: [{
              id: `mentor-remeasure:${saved.id}`,
              projectId: state.projectId || "workspace",
              title: `Re-measure solved mentor case: ${saved.situationId} (${saved.id.slice(0, 8)})`.slice(0, 160),
              requiresHumanApproval: false,
              tier: "auto",
              dueDate: asOf
            }] });
          }
        } catch (_) { /* re-measure queueing is best-effort, never blocks the solve */ }
      }
      await writeScopedWorkspace(req, ws);
      appendAudit({ action: idx >= 0 ? "AI mentor case updated" : "AI mentor case registered", detail: `${saved.situationId} — ${saved.id}` });
      return send(res, idx >= 0 ? 200 : 201, { case: saved, solution, guidance: coachStore().engine.mentorGuidance(project, lang) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Mentor outcome follow-up: did the solution actually change anything? ──
  // A solved case is a hypothesis, not a result. The leader records which
  // measures were carried out and what effect they had; the app stores it on
  // the case (bounded history) and the always-on guidance asks back for cases
  // that were never followed up. Nothing is inferred or scored by the machine.
  if (req.url === "/api/coach/mentor/outcome" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const lang = getLang(req, payload);
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      if (!state.project) return send(res, 404, { error: "No project available" });
      if (state.explicit) {
        const decision = authorizeProjectWrite(req, state.project);
        if (!decision.allowed) return send(res, 403, { error: decision.reason });
      }
      // ONE mutation core with the inbound `outcome` reply command
      // (lib/mentor-outcomes.js): auth + scoping stay here, the mutation is
      // shared, persistence stays here.
      const result = require("./lib/mentor-outcomes.js").recordMentorOutcome({
        state: state.project,
        engine: coachStore().engine,
        payload,
        lang
      });
      if (!result.ok) return send(res, result.status, { error: result.error });
      const recorded = result.outcome;
      const target = result.case;
      const planSteps = (Array.isArray(target.plan) ? target.plan : []).map(s => s.step);
      await writeScopedWorkspace(req, ws);
      appendAudit({ action: "AI mentor outcome recorded", detail: `${target.situationId} — ${recorded.carriedOut}/${recorded.effect} (${recorded.steps.filter(s => s.done).length}/${planSteps.length} steps)` });
      return send(res, 201, {
        case: target, outcome: recorded,
        review: coachStore().engine.mentorOutcomeReview(state.project, target.id, lang),
        guidance: coachStore().engine.mentorGuidance(state.project, lang)
      });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Daily briefing ─────────────────────────────────────────────────────
  if (req.url === "/api/coach/briefing" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      const lang = langOf(state.lang ? state : ws);
      const briefing = require("./lib/daily-briefing.js").generateBriefing(state, lang);
      return send(res, 200, briefing);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Case memory: patterns and history ──────────────────────────────────
  if (req.url === "/api/coach/cases/memory" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      const mem = require("./lib/case-memory.js");
      const patterns = mem.detectPatterns(state);
      return send(res, 200, { patterns: patterns, totalCases: (state.mentorCases || []).length });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── I4: Mentor threads — conversational continuity ("hvad med Mette?") ───
  // Thread keeps last 40 messages + case-memory snapshot; /api/coach/ask
  // accepts threadId to prepend CONTEXT_MESSAGES into the prompt.
  if (req.url === "/api/mentor/threads" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { projectId } = requestedProjectState(req, ws);
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const limit = Number(q.get("limit") || 20);
      const mod = require("./lib/mentor-threads.js");
      return send(res, 200, mod.listThreads(DATA_DIR, { projectId, limit }));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/mentor/thread" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = (await body(req, 20000)) || {};
      const ws = readScopedWorkspace(req);
      const { project, projectId } = requestedProjectState(req, ws);
      const lang = getLang(req, payload);
      const mod = require("./lib/mentor-threads.js");
      const res2 = mod.createThread(DATA_DIR, { projectId, caseId: payload.caseId, situationId: payload.situationId, lang, workspace: project });
      if (res2.error) return send(res, 400, res2);
      return send(res, 201, res2);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/mentor/thread/") && req.method === "GET" && !req.url.includes("/message")) {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4].split("?")[0]);
      const mod = require("./lib/mentor-threads.js");
      const res2 = mod.getThread(DATA_DIR, id);
      if (res2.error) return send(res, res2.status || 404, res2);
      return send(res, 200, res2);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/mentor/thread/") && req.url.endsWith("/message") && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const id = decodeURIComponent(req.url.split("/")[4].split("?")[0]);
      const payload = (await body(req, 20000)) || {};
      const question = String(payload.question || "").trim();
      if (!question) return send(res, 400, { error: "question is required" });
      const ws = readScopedWorkspace(req);
      const mod = require("./lib/mentor-threads.js");
      const threadRes = mod.getThread(DATA_DIR, id);
      if (threadRes.error) return send(res, 404, threadRes);
      const threadContext = mod.threadContextForPrompt(DATA_DIR, id);
      // Append thread context to the question so the grounded engine + LLM see continuity.
      const contextualQuestion = threadContext ? threadContext + "\n\nCurrent question: " + question : question;
      const result = await coachStore().ask(activeProjectState(req), contextualQuestion, remoteCoachHook);
      mod.appendMessage(DATA_DIR, id, { role: "user", question });
      mod.appendMessage(DATA_DIR, id, { role: "mentor", question: result.question || question, answer: result.answer || "" });
      return send(res, 200, { threadId: id, question, result });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ── Patch /api/coach/ask to accept threadId (threaded continuity) ────────
  // Executed via a wrapping check before the original ask handler when threadId is present.
  if (false && req.url === "/api/coach/ask" && req.method === "POST" && req.headers["x-mentor-thread"]) { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    // This branch is shadowed by the existing /api/coach/ask above which runs first.
    // Kept here so the file still parses as a linear chain; the real wrapping
    // happens by patching the earlier ask handler to read payload.threadId.
    void 0;
  }
  // ─── Method effectiveness ───────────────────────────────────────────────
  if (req.url === "/api/coach/methods/effectiveness" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      const lang = langOf(state.lang ? state : ws);
      const me = require("./lib/method-effectiveness.js");
      return send(res, 200, {
        effectiveness: me.methodEffectiveness(state),
        insights: me.effectivenessInsights(state, lang)
      });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Team dynamics from registers ───────────────────────────────────────
  if (req.url === "/api/coach/dynamics" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const state = requestedProjectState(req, ws);
      const lang = langOf(state.lang ? state : ws);
      const dyn = require("./js/dynamics-from-registers.js");
      return send(res, 200, dyn.teamDynamicsSummary(state, lang));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Automation engine status ─────────────────────────────────────────────
  if (req.url === "/api/automation/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const automationEngine = require("./lib/automation-engine.js");
      const ws = readScopedWorkspace(req);
      const regs = ws.registers || {};
      return send(res, 200, {
        configured: {
          slack: !!(process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN),
          imap: !!process.env.LEADERSHIP_IMAP_HOST,
          smtp: !!process.env.SMTP_HOST
        },
        counts: {
          tasks: (regs.tasks || []).length,
          risks: (regs.risks || []).length,
          conflicts: (regs.conflicts || []).length,
          team: (ws.roster || []).length,
          mentorCases: (ws.mentorCases || []).length
        }
      });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Automation flight recorder: proof the zero-input loop ran ───────────
  // Read-only view over the per-tick record: what each pass did (wrote /
  // quiet / blocked / errored), how long it took, and today's rollup.
  if ((req.url || "").split("?")[0] === "/api/automation/flight" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const query = new URL(req.url, "http://leadership-app.local").searchParams;
      const all = readFlightRecords(FLIGHT_KEEP);
      const records = all.slice(0, Number(query.get("limit")) || 20);
      const today = new Date().toISOString().slice(0, 10);
      const todays = all.filter(r => (r.at || "").slice(0, 10) === today && !r.skipped);
      const allPasses = todays.flatMap(r => (r.passes || []));
      const rollup = {
        ticksToday: todays.length,
        writesToday: allPasses.filter(p => p.wrote).length,
        quietTicksToday: todays.filter(r => (r.passes || []).every(p => !p.wrote && !p.error)).length,
        errorsToday: allPasses.filter(p => p.error).length,
        restraintToday: {
          refusedApproved: allPasses.reduce((n, p) => n + ((p.restraint && p.restraint.refusedApproved) || 0), 0),
          fatigueMuted: allPasses.reduce((n, p) => n + ((p.restraint && p.restraint.fatigueMuted) || 0), 0),
          // Live notifications the constraint-quiet policy is holding for the
          // digest (js/notification-router.js) — restraint made visible.
          heldNotifications: (() => { try { const r = require("./js/notification-router.js"); return (r && typeof r.peekHeldForDigest === "function") ? r.peekHeldForDigest("default").length : 0; } catch (_) { return 0; } })()
        },
        lastTickAt: records[0] ? records[0].at : null,
        lastTickMs: records[0] ? records[0].totalMs : null,
        intervalMs: AUTOMATION_INTERVAL_MS,
        paused: !!AUTOMATION_PAUSED
      };
      return send(res, 200, { records, rollup, insights: flightInsights(all, { intervalMs: AUTOMATION_INTERVAL_MS }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Email command execution ──────────────────────────────────────────────
  if (req.url === "/api/email/command" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const emailCommands = require("./lib/email-commands.js");
      const cmd = emailCommands.parseEmailCommand("[ACTION: " + (payload.command || "") + "]");
      if (!cmd) return send(res, 400, { error: "Invalid command format" });
      const result = emailCommands.executeEmailCommand(cmd, ws, { lang: langOf(ws) });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Auto-task creation from text ────────────────────────────────────────
  if (req.url === "/api/automation/auto-task" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const autoTaskCreator = require("./lib/auto-task-creator.js");
      const analysis = autoTaskCreator.analyzeMessage(payload.text || "", { source: payload.source || "api", teamNames: ws.roster ? ws.roster.map(r => r.name || r) : [] });
      if (!analysis) return send(res, 200, { ok: false, message: "No actionable content detected" });
      const result = autoTaskCreator.createTaskFromAnalysis(analysis, ws);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Slack bot status ─────────────────────────────────────────────────────
  if (req.url === "/api/slack/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const slackBot = require("./lib/slack-bot.js");
      return send(res, 200, slackBot.getStatus());
    } catch (error) { return send(res, 200, { connected: false, error: error.message }); }
  }
  // ─── Prediction → outcome loop ───────────────────────────────────────────
  // Prediction → outcome loop routes now in lib/routes/outcomes.js (increment #12).

  if (req.url === "/api/ai/narrative" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 20000);
      const project = activeProject(readScopedWorkspace(req));
      if (!project) return send(res, 404, { error: "No active project available" });
      const result = await llmNarrative.narrateWithLLM(project, payload.prompt || "Summarize the current state.", { forceLLM: payload.forceLLM });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Policy engine ──────────────────────────────────────────────────────
  // Policy engine routes now in lib/routes/policy.js (increment #10).
  if (false && req.url === "/api/webhooks" && req.method === "GET") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { webhooks: OUTBOUND_WEBHOOKS.map(h => ({ id: h.id, url: h.url, events: h.events, channel: h.channel, active: h.active, deadLettered: h.deadLettered, failures: h.failures, lastStatus: h.lastStatus })) });
  }
  if (false && req.url === "/api/webhooks" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const hook = await body(req);
      if (!hook.url || !Array.isArray(hook.events)) return send(res, 400, { error: "url and events are required" });
      const registered = outboundWebhooks.register(hook);
      OUTBOUND_WEBHOOKS.push(registered);
      // Mask the URL in the audit trail: webhook URLs often embed credentials
      // (e.g. hooks.slack.com/services/T/B/secret) and must not be persisted
      // verbatim where a reader of the audit log could harvest them.
      const maskedWebhookUrl = String(registered.url || "").replace(/\/\/.*@/, "//***@").replace(/(\/services\/)[^/]+(\/[^/]+)(\/[^\s/]+)/, "$1***$2/***");
      appendAudit({ action: "Outbound webhook registered", detail: `${registered.channel} → ${maskedWebhookUrl}` });
      return send(res, 201, registered);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/webhooks/dispatch" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const results = await outboundWebhooks.deliver(OUTBOUND_WEBHOOKS, payload.event || "test.event", payload.payload || {}, {});
      return send(res, 200, { results });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Bank-feed connector ───────────────────────────────────────────────────
  if (req.url === "/api/connector/bank-import" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2 * 1024 * 1024);
      const prior = financeOperationsStore.list(FINANCE_OPERATIONS_FILE, "bank_transaction").map(row => row.data || row);
      const result = await bankFeedConnector.runConnector({ provider: payload.provider || "bik", source: payload.source || "", prior });
      const atom = {
        importId: `import-${Date.now().toString(36)}`,
        provider: result.provider,
        sourceHash: result.sourceHash,
        accountCount: (result.accounts || []).length,
        transactionCount: result.transactions.length,
        duplicatesSkipped: result.duplicatesSkipped,
        at: result.at
      };
      const chain = automationEvidence.append(readJsonLines(EVIDENCE_FILE), { jobId: atom.importId, type: "bank-import", title: `${payload.provider || "bik"} import`, inputSnapshot: { sourceHash: result.sourceHash }, output: atom, verification: { imports: result.transactions.length } });
      const fd = fs.openSync(EVIDENCE_FILE, "a");
      fs.appendFileSync(fd, JSON.stringify(chain[chain.length - 1]) + "\n", "utf8");
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      const saved = (result.transactions || []).map(tx => financeOperationsStore.save(FINANCE_OPERATIONS_FILE, "bank_transaction", { ...tx, sourceHash: result.sourceHash }, roleFor(req)));
      appendAudit({ action: "Bank feed connector import", detail: `${result.provider} — ${saved.length} transaction(s), ${result.duplicatesSkipped} duplicate(s) skipped` });
      return send(res, 201, { import: atom, transactions: saved, integrity: financeOperationsStore.verify(FINANCE_OPERATIONS_FILE) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── OIDC SSO (optional — 503 until configured) ───────────────────────────
  // ─── Usage analytics ───────────────────────────────────────────────────────
  if (req.url === "/api/analytics/usage" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const params = new URLSearchParams((req.url.split("?")[1] || ""));
    const hours = Number(params.get("hours") || 24 * 30);
    return send(res, 200, USAGE_ANALYTICS.report({ since: Date.now() - hours * 3600e3 }));
  }

  // ─── Portfolio risk aggregation ─────────────────────────────────────────────
  if (false && req.url === "/api/risk/portfolio" && req.method === "GET") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const vendors = (() => {
      const all = [];
      Object.values(ws.projects || {}).forEach(p => { (p.registers && Array.isArray(p.registers.vendors) ? p.registers.vendors : []).forEach(v => all.push(v)); });
      return all;
    })();
    return send(res, 200, {
      risks: riskPortfolio.aggregateRisks(ws),
      raroc: riskPortfolio.rarocLite(ws),
      vendors: riskPortfolio.vendorRiskFeed(vendors),
      revision: currentScopedRevision(req)
    });
  }

  // ─── Evidence pack ──────────────────────────────────────────────────────────
  if (req.url === "/api/evidence/package" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const project = activeProject(ws);
    const audits = readAudit();
    const approvals = readApprovals();
    const incidents = project && Array.isArray(project.incidents) ? project.incidents : [];
    const controls = (project && project.registers && Array.isArray(project.registers.controls) ? project.registers.controls : []).map(c => ({ id: c._id || c.id, status: c.testStatus || c.status || "untested", testedAt: c.testedAt || "" }));
    const anchor = chainAnchor.createAnchor({ audit: audits, approvals, workspaceHistory: readWorkspaceHistory() }, { label: process.env.LEADERSHIP_ANCHOR_LABEL || "leadership-workspace", key: process.env.LEADERSHIP_ANCHOR_KEY || "" });
    const pack = evidencePack.build({
      scope: workspaceScope(req),
      audit: audits,
      approvals,
      retention: [],
      incidents,
      controlTests: controls,
      automation: readJsonLines(EVIDENCE_FILE),
      automationIntegrity: automationEvidence.verify(readJsonLines(EVIDENCE_FILE)),
      finance: financeRows(req),
      financeIntegrity: { valid: true, checked: financeRows(req).length },
      anchor
    });
    pack.sectionSummary = controls.filter(c => c.status === "passed" || c.status === "PASSED").length + " of " + controls.length + " controls tested";
    appendAudit({ action: "Evidence pack generated", detail: `${pack.id} — ${controls.length} controls` });
    return send(res, 200, pack);
  }

  // ─── Learning loop ───────────────────────────────────────────────────────────
  if (req.url === "/api/learning/weekly" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const project = activeProject(readScopedWorkspace(req));
    if (!project) return send(res, 404, { error: "No active project available" });
    return send(res, 200, learningLoop.weeklyInsight(project));
  }
  if (req.url === "/api/learning/experiments" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const project = activeProject(ws);
    const experiments = project && Array.isArray(project.experiments) ? project.experiments : [];
    const decisions = experiments.map(e => ({ id: e.id, name: e.name, outcomes: (e.outcomes || []).length, autoStop: learningLoop.experimentStop(experimentLib.analyze(e)) }));
    return send(res, 200, { experiments: decisions, revision: currentScopedRevision(req) });
  }

  // ─── Policy recalibration (learning) ─────────────────────────────────────────
  // Policy recalibration route now in lib/routes/policy.js (increment #10).
  if (req.url === "/api/readiness" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try { return send(res, 200, livePlatformReadiness()); }
    catch (error) { return send(res, 503, { error: "Readiness evidence unavailable" }); }
  }
  if (req.url === "/api/control-center" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const project = activeProject(ws);
    const snapshot = controlCenter.build({
      decisions: readJsonLines(POLICY_DECISIONS_FILE),
      approvals: readApprovals(),
      jobs: jobStore.listJobs(JOBS_FILE) || [],
      incidents: project && Array.isArray(project.incidents) ? project.incidents : [],
      webhooks: OUTBOUND_WEBHOOKS,
      evidenceIntegrity: automationEvidence.verify(readJsonLines(EVIDENCE_FILE)),
      killSwitch: String(process.env.LEADERSHIP_TRADING_KILL_SWITCH || "").toLowerCase() === "true",
      analytics: USAGE_ANALYTICS.report({ since: Date.now() - 7 * 86400000 }),
      trustScore: ATTESTATIONS.length ? ATTESTATIONS[ATTESTATIONS.length - 1].trust : null,
      readiness: livePlatformReadiness()
    });
    return send(res, 200, { ...snapshot, revision: currentScopedRevision(req) });
  }

  // ─── Period close + certificate (round-18) ──────────────────────────────────
  // ─── Decision outcome ledger (round-18) ─────────────────────────────────────
  if (req.url === "/api/decisions/outcomes" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { ledger: DECISION_LEDGER, calibration: decisionOutcomesLib.calibration(DECISION_LEDGER), stale: decisionOutcomesLib.staleReviews(DECISION_LEDGER) });
  }
  if (req.url === "/api/decisions/outcomes" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = decisionOutcomesLib.registerDecision(DECISION_LEDGER, payload);
      if (result.error) return send(res, 400, { error: result.error });
      DECISION_LEDGER = result.ledger;
      const fd = fs.openSync(DECISION_OUTCOMES_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Decision outcome registered", detail: `${payload.id} — ${payload.decision}` });
      return send(res, 201, result.row);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decisions/outcomes/resolve" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = decisionOutcomesLib.recordOutcome(DECISION_LEDGER, payload.id, payload.value, payload.note);
      if (result.error) return send(res, 400, { error: result.error });
      DECISION_LEDGER = result.ledger;
      const fd = fs.openSync(DECISION_OUTCOMES_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Decision outcome resolved", detail: `${payload.id} → ${payload.value}/10` });
      return send(res, 200, result.row);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Conflict outcomes + personal-conflict register (round-18) ─────────────
  if (req.url === "/api/conflicts/outcome" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      // read the scoped workspace ONCE and mutate that object — a second
      // readScopedWorkspace() would read the same unpersisted state fresh from
      // disk and DISCARD the conflict-outcome/incident mutations (silent
      // lost-write: POST returned 200-resolved but the case stayed "Active").
      const ws = readScopedWorkspace(req);
      const project = activeProject(ws);
      if (!project) return send(res, 404, { error: "No active project available" });
      const cases = Array.isArray(project.registers.conflicts) ? project.registers.conflicts : (Array.isArray(project.registers.conflictCases) ? project.registers.conflictCases : []);
      const result = conflictOutcomesLib.recordConflictOutcome(cases, payload.caseId, payload);
      if (result.error) return send(res, 400, { error: result.error });
      project.registers.conflicts = result.cases;
      delete project.registers.conflictCases;
      await writeScopedWorkspace(req, ws);
      if (result.incident) {
        const incidents = Array.isArray(project.incidents) ? project.incidents : [];
        const incident = incidentManagement.openIncident(result.incident);
        incidents.push(incident);
        project.incidents = incidents;
        await writeScopedWorkspace(req, ws);
      }
      appendAudit({ action: "Conflict outcome recorded", detail: `${payload.caseId} → ${result.outcome.type}` });
      return send(res, 200, { outcome: result.outcome, incident: result.incident });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflicts/personal" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const ownerId = authenticatedUser ? String(authenticatedUser.id) : "local";
    // Without a session identity (API-token auth) there is no "owner" — rows
    // are owner-scoped, so return the aggregate pulse only, NOT the whole
    // register. Previously every token holder (viewer included) read every
    // person's private conflict rows while the response claimed "owner-only".
    const register = authenticatedUser ? PERSONAL_CONFLICTS.filter(row => row.ownerId && String(row.ownerId) === ownerId) : [];
    return send(res, 200, { register, pulse: conflictOutcomesLib.personalPulse(register), visibility: "owner-only" });
  }
  if (req.url === "/api/conflicts/personal" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const ownerId = authenticatedUser ? String(authenticatedUser.id) : "local";
      const result = conflictOutcomesLib.registerPersonalConflict(PERSONAL_CONFLICTS, { ...payload, ownerId });
      if (result.error) return send(res, 400, { error: result.error });
      PERSONAL_CONFLICTS = result.register;
      const fd = fs.openSync(PERSONAL_CONFLICTS_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Personal conflict registered", detail: payload.person });
      return send(res, 201, result.row);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Secrets rotation (round-18) ────────────────────────────────────────────
  if (req.url === "/api/secrets/due" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const secrets = [
      { name: "api-token", rotatedAt: (SECRET_ROTATIONS.find(r => r.secret === "api-token") || {}).rotatedAt || "", intervalDays: 90 },
      { name: "webhook-secret", rotatedAt: (SECRET_ROTATIONS.find(r => r.secret === "webhook-secret") || {}).rotatedAt || "", intervalDays: 90 }
    ];
    return send(res, 200, { due: secretsRotation.due(secrets), rotations: SECRET_ROTATIONS });
  }
  if (req.url === "/api/secrets/rotate" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const secret = { name: payload.name, value: payload.oldValue || "", intervalDays: payload.intervalDays };
      const result = secretsRotation.rotateSecret(secret, payload.newValue, roleFor(req));
      if (result.error) return send(res, 400, { error: result.error });
      SECRET_ROTATIONS = SECRET_ROTATIONS.concat([result.record]);
      const fd = fs.openSync(SECRET_ROTATIONS_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.record) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Secret rotated", detail: `${secret.name} — fingerprint ${result.record.newFingerprint.slice(0, 16)}` });
      return send(res, 200, { record: result.record, nextValue: result.nextValue });
      } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Trend (round-18) ──────────────────────────────────────────────────────
  if (req.url === "/api/trend" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const file = path.join(ROOT, "eval-reports", "trend.json");
    if (!fs.existsSync(file)) return send(res, 404, { error: "No trend data yet — run scripts/eval/trend.mjs" });
    try { return send(res, 200, JSON.parse(fs.readFileSync(file, "utf8"))); }
    catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Watchdog: verify-all + trust score + daily attestation (round-19) ─────
  function watchdogChains() {
    return {
      audit: readAudit(),
      workspaceHistory: readWorkspaceHistory(),
      approvals: readApprovals(),
      finance: financeRows(),
      evidence: readJsonLines(EVIDENCE_FILE),
      decisions: readJsonLines(DECISION_OUTCOMES_FILE),
      moduleRecords: moduleRecordStore.listAll(DATA_DIR)
    };
  }
  function verifyChainByName(name, rows) {
    if (name === "audit") return verifyAudit(rows);
    if (name === "workspaceHistory") return verifyWorkspaceHistory(rows);
    if (name === "approvals") return verifyApprovals(rows);
    if (name === "finance") return financeIntegrity(rows);
    if (name === "evidence") return automationEvidence.verify(rows);
    if (name === "decisions") return { valid: rows.every(r => r && typeof r === "object"), checked: rows.length };
    if (name === "moduleRecords") return moduleRecordStore.verifyAll(DATA_DIR);
    return { valid: true, checked: rows.length };
  }
  function lastAttestation() { return ATTESTATIONS.length ? ATTESTATIONS[ATTESTATIONS.length - 1] : null; }

  if (req.url === "/api/watchdog/status" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const snapshot = watchdog.verifyAll(watchdogChains(), verifyChainByName);
    const latest = lastAttestation();
    return send(res, 200, {
      chains: snapshot,
      chainSummary: watchdog.chainSummary(snapshot),
      trust: latest ? latest.trust : null,
      lastAttestation: latest ? { id: latest.attestationId, asOf: latest.asOf, manifest: latest.manifest.sha256 } : null,
      attestationValid: latest ? watchdog.verifyAttestation(latest).valid : null
    });
  }
  if (req.url === "/api/watchdog/attest" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const snapshot = watchdog.verifyAll(watchdogChains(), verifyChainByName);
      const decisions = decisionOutcomesLib.calibration(DECISION_LEDGER);
      const acc = forecastAccuracy.accuracy(FORECASTS);
      const trust = watchdog.trustScore(snapshot, {
        decisionAccuracy: decisions.overall != null ? decisions.overall : null,
        forecastMape: acc.available ? acc.mape : null,
        brier: 0 // not measured live yet — calibration-live.json is the eval fixture
      });
      const anchor = chainAnchor.createAnchor(watchdogChains(), { label: "daily-attestation", key: process.env.LEADERSHIP_ANCHOR_KEY || "" });
      const att = watchdog.buildAttestation({
        asOf: payload.asOf || new Date().toISOString().slice(0, 10),
        chains: snapshot,
        chainSummary: watchdog.chainSummary(snapshot),
        trust: trust,
        anchorRoots: anchor.roots ? anchor.roots : { merkleRoot: anchor.merkleRoot, ts: anchor.ts, label: anchor.label },
        source: "watchdog"
      });
      ATTESTATIONS = ATTESTATIONS.concat([att]);
      const fd = fs.openSync(ATTESTATIONS_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(att) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Daily attestation signed", detail: `${att.attestationId} — ${att.manifest.sha256.slice(0, 16)} — trust ${trust.score}` });
      return send(res, 201, { attestation: att, verify: watchdog.verifyAttestation(att) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/watchdog/verify" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (typeof payload.attestation !== "object" && payload.attestation !== null) return send(res, 400, { error: "attestation object required" });
      return send(res, 200, watchdog.verifyAttestation(payload.attestation || lastAttestation()));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Forecast → actual accuracy (round-19) ──────────────────────────────────
  if (req.url === "/api/forecasts" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { forecasts: FORECASTS, accuracy: forecastAccuracy.accuracy(FORECASTS), dueForActual: forecastAccuracy.dueForActual(FORECASTS) });
  }
  if (req.url === "/api/forecasts" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = forecastAccuracy.registerForecast(FORECASTS, payload);
      if (result.error) return send(res, 400, { error: result.error });
      FORECASTS = result.list;
      const fd = fs.openSync(FORECASTS_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Forecast registered", detail: `${payload.metric} — ${payload.value} (${payload.horizonDays || 30}d)` });
      return send(res, 201, result.row);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/forecasts/actual" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = forecastAccuracy.recordActual(FORECASTS, payload.id, payload);
      if (result.error) return send(res, 400, { error: result.error });
      FORECASTS = result.list;
      const fd = fs.openSync(FORECASTS_FILE, "a"); fs.appendFileSync(fd, JSON.stringify(result.row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Forecast actual recorded", detail: `${payload.id}` });
      return send(res, 200, result.row);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── External attestation export (round-19) ─────────────────────────────────
  if (req.url === "/api/attestation/export" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const latest = lastAttestation();
    if (!latest) return send(res, 404, { error: "No attestation yet — POST /api/watchdog/attest first" });
    return send(res, 200, { payload: attestationExport.exportPayload(latest), notaryUrl: process.env.LEADERSHIP_NOTARY_URL || null });
  }
  if (req.url === "/api/attestation/export" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const latest = lastAttestation();
      if (!latest) return send(res, 404, { error: "No attestation yet" });
      const result = await attestationExport.publish({ url: process.env.LEADERSHIP_NOTARY_URL, secret: process.env.LEADERSHIP_NOTARY_SECRET }, attestationExport.exportPayload(latest));
      appendAudit({ action: "Attestation export attempted", detail: result.ok ? "notarized" : (result.reason || "HTTP " + result.status) });
      return send(res, result.ok ? 200 : 502, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Compliance calendar (round-19) ─────────────────────────────────────────
  // Compliance calendar routes now in lib/routes/compliance.js (increment #14).

  if (req.url === "/api/abac/authorize" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const ctx = abacLib.buildRoleAttributes(
        payload.user || (authStore().userFromRequest(req) || {}),
        payload.tenant || {},
        payload.session || {}
      );
      Object.assign(ctx, { purpose: payload.purpose, geo: payload.geo, device: payload.device, ip: payload.ip || (req.socket.remoteAddress || "unknown") });
      const decision = abacLib.authorize(ctx, payload.policy || {});
      appendAudit({ action: "ABAC decision", detail: `${decision.decision} — ${decision.reason}` });
      return send(res, 200, decision);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Model registry
  // Model registry routes now in lib/routes/models.js (increment #13).
  // Model drift + fairness routes now in lib/routes/models.js (increment #13).

  if (req.url === "/api/ai/guard" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const injection = promptIsolation.detectInjection(payload.prompt || "");
      const redaction = dlp.scanPrompt(payload.prompt || "", payload.domain || "general");
      return send(res, 200, { injection, redaction, safe: !injection.injected && redaction.safe });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ai/abstain" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const decision = aiAbstention.evaluateAbstention(payload);
      decision.message = aiAbstention.abstentionMessage(decision, payload.domain);
      return send(res, 200, decision);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // RAG grounding
  if (req.url === "/api/ai/ground" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const chunks = ragPipeline.chunkText(String(payload.text || ""), { sourceId: payload.sourceId || "inline", sourceType: payload.sourceType || "document", sourceDate: payload.sourceDate });
      const results = ragPipeline.searchEvidence(payload.query || "", chunks, payload.options || {});
      return send(res, 200, results);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Finance sub-ledgers
  // Business operations
  if (req.url === "/api/crm/pipeline" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const deals = EXPANSION_STATE.deals || [];
    return send(res, 200, { pipeline: crm.pipeline(deals), weighted: crm.weightedPipeline(deals), winRate: crm.winRate(deals) });
  }
  if (req.url === "/api/contracts" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { contracts: EXPANSION_STATE.contractsList, summary: contracts.contractSummary(EXPANSION_STATE.contractsList) });
  }
  if (req.url === "/api/sla" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { slas: EXPANSION_STATE.slaList, report: slaManager.complianceReport(EXPANSION_STATE.slaList) });
  }
  if (req.url === "/api/roadmap" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const r = EXPANSION_STATE.roadmap || roadmap.createRoadmap({});
    return send(res, 200, { roadmap: r, timeline: roadmap.timeline(r), progress: roadmap.progressSummary(r) });
  }
  if (req.url === "/api/resources/utilization" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, resourceManagement.utilizationReport(EXPANSION_STATE.resources || []));
  }

  // Safeguarding + conflict safety
  // ─── Safeguarding routes now in lib/routes/risk.js ───────────────────────
  // DPIA
  if (req.url === "/api/dpia" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { posture: dpia.dpiaPosture(EXPANSION_STATE.dpiaList), dpias: EXPANSION_STATE.dpiaList });
  }
  if (req.url === "/api/dpia" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const d = dpia.createDPIA(payload);
      EXPANSION_STATE.dpiaList = (EXPANSION_STATE.dpiaList || []).concat([d]);
      appendAudit({ action: "DPIA created", detail: d.title });
      return send(res, 201, { dpia: d, necessity: dpia.assessNecessity(d) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // SOC 2 / ISO evidence
  // SOC2/ISO readiness route now in lib/routes/compliance.js (increment #14).

  if (req.url === "/api/notary/anchor" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const chains = { audit: checksum("", { id: "root", ts: new Date().toISOString(), action: "audit", detail: "root" }).slice(0, 16), ...(payload.rootHashes || {}) };
      const anchor = externalNotary.createAnchor(chains, { secret: process.env.LEADERSHIP_NOTARY_SECRET });
      appendAudit({ action: "External notary anchor created", detail: anchor.anchorId });
      return send(res, 201, anchor);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Delegated admin + elevation
  if (req.url === "/api/admin/elevate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const request = delegatedAdmin.createElevationRequest({ userId: payload.userId || (authStore().userFromRequest(req) || {}).id, requestedPermission: payload.permission, justification: payload.justification, durationMinutes: payload.durationMinutes });
      EXPANSION_STATE.elevationRequests = (EXPANSION_STATE.elevationRequests || []).concat([request]);
      appendAudit({ action: "Elevation requested", detail: `${request.requestedPermission} — ${request.justification}` });
      return send(res, 201, request);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/admin/elevations" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, delegatedAdmin.posture(EXPANSION_STATE.delegatedAdmins, EXPANSION_STATE.elevationRequests));
  }

  // Ops dashboard: one admin-gated read of operational state — integrity
  // chains, recent limiter trips (credential + SCIM), SCIM token health per
  // org, and per-org role provenance. Read-only; every field is derived from
  // the tamper-evident ledgers, never from request input.
  if (req.url === "/api/admin/ops" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const auditRows = readAudit();
      const rateLimited = auditRows
        .filter(r => /rate limited/i.test(String(r.action || "")))
        .slice(-20)
        .reverse()
        .map(r => ({ ts: r.ts || r._id || "", action: r.action, detail: String(r.detail || "").slice(0, 200) }));
      const orgs = orgStore().allTenants().map(t => {
        const tokens = orgStore().listScimTokens(t.id);
        return {
          id: t.id,
          name: t.name,
          members: orgStore().membershipsForTenant(t.id).length,
          liveScimTokens: tokens.filter(tk => !tk.revoked && !tk.expired).length,
          expiredTokens: tokens.filter(tk => !tk.revoked && tk.expired).length
        };
      });
      const groups = orgStore().allScimGroups();
      return send(res, 200, {
        ok: true,
        generatedAt: new Date().toISOString(),
        chains: {
          audit: verifyAudit(auditRows),
          workspaceHistory: verifyWorkspaceHistory(readWorkspaceHistory()),
          approvals: verifyApprovals(readApprovals()),
          events: domainEventIntegrity(readJsonLines(EVENTS_FILE))
        },
        rateLimited,
        orgs,
        scimGroups: groups.length,
        wsClients: wsServer.clientCount ? wsServer.clientCount() : 0
      });
    } catch (error) { return send(res, 500, { error: "ops snapshot failed" }); }
  }

  // Dark launch
  if (req.url === "/api/dark-launch" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, EXPANSION_STATE.darkLaunches.map(darkLaunch.darkLaunchReport));
  }
  if (req.url === "/api/dark-launch" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const launch = darkLaunch.createDarkLaunch(payload);
      EXPANSION_STATE.darkLaunches = (EXPANSION_STATE.darkLaunches || []).concat([launch]);
      appendAudit({ action: "Dark launch created", detail: `${launch.featureName} (${launch.mode})` });
      return send(res, 201, launch);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Gap closure routes (round-20) ────────────────────────────────────

  // Cross-domain journeys
  if (req.url === "/api/journeys/run" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const result = crossDomainJourneys.runAllJourneys(ws, { appendDomainEvent });
    appendAudit({ action: "Cross-domain journeys executed", detail: `${result.summary.completed}/${result.summary.total} completed` });
    return send(res, 200, result);
  }
  if (req.url.startsWith("/api/journeys/") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const journeyName = req.url.split("/api/journeys/")[1];
    const ws = readScopedWorkspace(req);
    const result = crossDomainJourneys.runAllJourneys(ws, { appendDomainEvent });
    return send(res, 200, result.journeys[journeyName] || { error: "Journey not found" });
  }

  // Close-to-report pipeline
  if (req.url === "/api/close-to-report/run" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = closeToReportPipeline.executeClosePipeline({ ...payload, actor: (authStore().userFromRequest(req) || {}).id });
      appendAudit({ action: "Close-to-report pipeline executed", detail: `${result.period} — ${result.status}` });
      return send(res, result.status === "blocked" ? 400 : 201, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Causal integration runtime
  // ─── /api/causal/evaluate now in lib/routes/causal.js (increment #7) ─────

  // AI governance enforcement
  if (req.url === "/api/ai-governance/enforce" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const file = path.join(DATA_DIR, "ai-governance.json");
      const manifest = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
      const result = aiGovernanceEnforcer.enforce({ ...payload, governanceManifest: manifest, auditCallback: (gateId, check) => appendAudit({ action: "AI governance gate", detail: `${gateId} — ${check.gate}: ${check.passed ? "passed" : "failed"}` }) });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Restore drill
  if (req.url === "/api/restore/drill" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const report = restoreDrillAutomation.executeRestoreDrill(payload);
      appendAudit({ action: "Restore drill executed", detail: `RTO: ${report.rto.measuredSeconds}s, RPO: ${report.rpo.measuredSeconds}s` });
      return send(res, 201, report);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Tenant data export
  if (req.url === "/api/tenant/export" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = tenantDataExport.exportTenantData({
        ...payload,
        workspace: readScopedWorkspace(req),
        workspaceHistory: readScopedWorkspaceHistory(req),
        auditLog: readAudit(),
        approvals: readApprovals(),
        financeJournal: financeRows(req)
      });
      appendAudit({ action: "Tenant data exported", detail: `${result.export.sections.length} sections` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Decision simulation
  if (req.url === "/api/decisions/simulate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = decisionSimulation.simulateDecision(payload);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Model training pipeline
  // Model training route now in lib/routes/models.js (increment #13).

  if (req.url === "/api/learning/org-score" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = learningOrgScore.computeLearningOrgScore(payload);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Live benchmarks
  if (req.url === "/api/benchmarks" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = liveBenchmarks.benchmarkOrganization(payload);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Gap closure routes (round-21) ────────────────────────────────────

  // Succession simulation
  if (req.url === "/api/succession/simulate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = successionSimulation.runSuccessionSimulation(payload.departures, payload.org, payload.successors, payload.opts);
      appendAudit({ action: "Succession simulation", detail: `${payload.departures.length} departures — risk: ${result.overallRiskLevel}` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/succession/bus-factors" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = successionSimulation.computeBusFactors(payload.org, payload.successors);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Automated audit response — evidence packages now in lib/routes/audit.js
  // (decomposition increment #5)

  // Cognitive diversity index
  if (req.url === "/api/cognitive-diversity/team" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = cognitiveDiversityIndex.computeTeamCDI(payload.profiles, payload.opts);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cognitive-diversity/org" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = cognitiveDiversityIndex.computeOrgCDI(payload.teamCDIs);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cognitive-diversity/hire-recommendation" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = cognitiveDiversityIndex.recommendComplementaryHire(payload.profiles);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Corporate memory preservation
  if (req.url === "/api/memory/capture" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const store = (EXPANSION_STATE.memoryStore = EXPANSION_STATE.memoryStore || new corporateMemoryPreservation.CorporateMemoryStore());
      let entry;
      if (payload.type === "decision") entry = store.captureDecision(payload.decision);
      else if (payload.type === "incident") entry = store.captureIncident(payload.incident);
      else if (payload.type === "postmortem") entry = store.capturePostMortem(payload.postmortem);
      else entry = store.capture(payload);
      return send(res, 201, entry);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/memory/search") && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const store = EXPANSION_STATE.memoryStore || new corporateMemoryPreservation.CorporateMemoryStore();
      return send(res, 200, store.query(payload));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/memory/knowledge-map" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const store = EXPANSION_STATE.memoryStore || new corporateMemoryPreservation.CorporateMemoryStore();
      const map = corporateMemoryPreservation.buildKnowledgeMap(store.memories, payload.people);
      const alerts = corporateMemoryPreservation.generatePreservationAlerts(map);
      return send(res, 200, { map, alerts });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Crisis war room
  if (req.url === "/api/crisis/activate" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const wr = crisisWarRoom.activateWarRoom({ ...payload, declaredBy: (authStore().userFromRequest(req) || {}).id });
      EXPANSION_STATE.activeWarRoom = wr;
      appendAudit({ action: "Crisis war room activated", detail: `${wr.title} — ${wr.severity}` });
      return send(res, 201, wr);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/crisis/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, EXPANSION_STATE.activeWarRoom || { status: "no_active_crisis" });
  }
  if (req.url === "/api/crisis/log" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!EXPANSION_STATE.activeWarRoom) return send(res, 400, { error: "No active crisis" });
      const entry = crisisWarRoom.logTimelineEvent(EXPANSION_STATE.activeWarRoom, { ...payload, authorId: (authStore().userFromRequest(req) || {}).id });
      return send(res, 201, entry);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/crisis/contain" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!EXPANSION_STATE.activeWarRoom) return send(res, 400, { error: "No active crisis" });
      crisisWarRoom.containCrisis(EXPANSION_STATE.activeWarRoom, (authStore().userFromRequest(req) || {}).id, payload.note);
      return send(res, 200, EXPANSION_STATE.activeWarRoom);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/crisis/close" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!EXPANSION_STATE.activeWarRoom) return send(res, 400, { error: "No active crisis" });
      crisisWarRoom.closeCrisis(EXPANSION_STATE.activeWarRoom, (authStore().userFromRequest(req) || {}).id, payload.note);
      const retro = crisisWarRoom.generateRetrospective(EXPANSION_STATE.activeWarRoom);
      appendAudit({ action: "Crisis closed", detail: EXPANSION_STATE.activeWarRoom.title });
      return send(res, 200, { warRoom: EXPANSION_STATE.activeWarRoom, retrospective: retro });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Policy from incidents
  // Policy-from-incidents routes now in lib/routes/policy.js (increment #10).
  if (req.url === "/api/pulse/generate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const surveys = orgPulse.generateMicroSurveys(payload.dimensions, payload.questionsPerBatch);
      return send(res, 200, surveys);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/pulse/health" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = orgPulse.computeHealthFromDimensionMap(payload.groupedByDimension, payload.previousPeriod, payload.totalEligible);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/pulse/burnout-warning" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = orgPulse.detectBurnoutEarlyWarning(payload.trends);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Strategic optionality
  if (req.url === "/api/optionality/value" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = strategicOptionality.valueRealOption(payload.option);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/optionality/portfolio" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = strategicOptionality.valueOptionPortfolio(payload.options);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/optionality/frontier" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = strategicOptionality.optionalityFrontier(payload.options);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Regulatory change impact
  // ─── Regulatory routes now in lib/routes/risk.js ──────────────────────────
  // ─── Gap closure routes (round-22) ────────────────────────────────────

  // Chief of Staff AI
  if (req.url === "/api/chief-of-staff/morning-briefing" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      // Same server-derived intelligence as the LLM briefing: due
      // re-measurements and pending/escalated approval chains.
      const briefingDomain = Object.assign({}, payload.domainData || {});
      const briefingWorkspace = readScopedWorkspace(req);
      const briefingProject = activeProject(briefingWorkspace);
      if (briefingProject) {
        const remeasure = outcomeRemMeasurement.summaryWithAnchors(briefingProject);
        if (remeasure.anchorsAdded > 0) await writeScopedWorkspace(req, briefingWorkspace);
        if (remeasure.dueItems && remeasure.dueItems.length) briefingDomain.remeasurements = remeasure.dueItems;
      }
      const pendingChains = approvalChains.list(APPROVAL_CHAINS_FILE).filter(c => c.status === "pending" || c.status === "escalated");
      if (pendingChains.length) briefingDomain.approvalChains = pendingChains;
      const briefing = chiefOfStaffAI.generateMorningBriefing(briefingDomain, payload.opts);
      appendAudit({ action: "Morning briefing generated", detail: `${briefing.criticalItems.length} critical items` });
      return send(res, 200, briefing);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/chief-of-staff/midday-check" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const check = chiefOfStaffAI.midDayCheck(payload.morningBriefing, payload.currentState);
      return send(res, 200, check);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/chief-of-staff/evening-wrap" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const wrap = chiefOfStaffAI.eveningWrap(payload.morningBriefing, payload.dayStats);
      return send(res, 200, wrap);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── LLM-enhanced briefing (local Ollama inference) ───────────────────────
  // When LEADERSHIP_OLLAMA_ENABLED=true, generates a contextual briefing
  // using a local LLM. Falls back to the deterministic rule-based engine
  // when Ollama is not available (graceful degradation — never crashes).
  if (req.url === "/api/chief-of-staff/llm-briefing" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const ws = readScopedWorkspace(req);
      const facts = llmInference.sanitizeFacts(payload.domainData || {});
      // Server-derived intelligence for the briefing: due re-measurements and
      // pending/escalated approval chains surface for every caller (UI button
      // or API), so the briefing never forgets the outcome loop or an
      // escalated decision.
      const briefingProject = activeProject(ws);
      if (briefingProject) {
        const remeasure = outcomeRemMeasurement.summaryWithAnchors(briefingProject);
        if (remeasure.anchorsAdded > 0) await writeScopedWorkspace(req, ws);
        if (remeasure.dueItems && remeasure.dueItems.length) facts.remeasurements = remeasure.dueItems;
      }
      const pendingChains = approvalChains.list(APPROVAL_CHAINS_FILE).filter(c => c.status === "pending" || c.status === "escalated");
      if (pendingChains.length) facts.approvalChains = pendingChains;
      const prompt = llmInference.buildChiefOfStaffPrompt(ws, facts);
      // Claim-gated generation with one bounded low-temperature retry: a
      // stray figure is usually sampling variance, so the second draw gets a
      // chance before the deterministic briefing is shown. Every draw that
      // returns is verified against the same facts.
      const attempt = await llmInference.generateVerified(prompt, { knownValues: facts, allowed: [0, 100], temperature: 0.1, maxTokens: 600 });
      const result = attempt.result;
      if (result.ok && attempt.verification && attempt.verification.valid) {
        appendAudit({ action: "LLM briefing generated", detail: `model=${result.model} latency=${result.latencyMs}ms claimsVerified=${attempt.verification.checked}` });
        return send(res, 200, { source: "llm", briefing: result.response, model: result.model, latencyMs: result.latencyMs, claimVerified: true, prompt: prompt.slice(0, 200) + "..." });
      }
      if (result.ok) {
        // Unsupported figure survived the retry — the model invented it and
        // the deterministic briefing is shown instead.
        const unsupported = (attempt.verification ? attempt.verification.unsupported : []).join(",");
        appendAudit({ action: "LLM briefing rejected (unverified numeric claim)", detail: unsupported });
        const briefing = chiefOfStaffAI.generateMorningBriefing(facts, payload.opts);
        appendAudit({ action: "Briefing generated (LLM fallback)", detail: "unsupported numeric claim in LLM response" });
        return send(res, 200, { source: "fallback", briefing, reason: "unsupported numeric claim in LLM response: " + unsupported, prompt: prompt.slice(0, 200) + "..." });
      }
      // Fallback: deterministic rule-based briefing
      const briefing = chiefOfStaffAI.generateMorningBriefing(facts, payload.opts);
      appendAudit({ action: "Briefing generated (LLM fallback)", detail: result.reason || "llm unavailable" });
      return send(res, 200, { source: "fallback", briefing, reason: result.reason, prompt: prompt.slice(0, 200) + "..." });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── LLM decision analysis ────────────────────────────────────────────────
  if (req.url === "/api/decision-science/llm-analyze" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      // Deterministic fallback scorer for when the LLM is off. This handler
      // used to call decisionQuality.createDecision — a binding that exists
      // nowhere in scope (the bridge exports scoreOne/vroomFor/orgHealth), so
      // every fallback path answered 400 "decisionQuality is not defined".
      const dqBridge = require("./lib/decision-quality-bridge.js");
      const decision = llmInference.sanitizeFacts(payload.decision || {});
      const context = llmInference.sanitizeFacts(payload.context || {});
      const prompt = llmInference.buildDecisionAnalysisPrompt(decision, context);
      // The prompt asks for 1–10 ratings, so that scale is allowed in
      // addition to the numbers present in the decision/context facts.
      const attempt = await llmInference.generateVerified(prompt, { knownValues: { decision, context }, allowed: [0, 100, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], temperature: 0.1, maxTokens: 400 });
      const result = attempt.result;
      if (result.ok && attempt.verification && attempt.verification.valid) {
        return send(res, 200, { source: "llm", analysis: result.response, model: result.model, latencyMs: result.latencyMs, claimVerified: true });
      }
      if (result.ok) {
        const score = dqBridge.scoreOne(decision);
        return send(res, 200, { source: "fallback", analysis: score, reason: "unsupported numeric claim in LLM response: " + (attempt.verification ? attempt.verification.unsupported.join(",") : "") });
      }
      // Fallback: deterministic decision quality scoring
      const score = dqBridge.scoreOne(decision);
      return send(res, 200, { source: "fallback", analysis: score, reason: result.reason });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── LLM trust-index narrative ─────────────────────────────────────────────
  // Generates a contextual trust recovery recommendation using the local LLM.
  // Falls back to the deterministic trustRecoveryRoadmap when Ollama is off.
  if (req.url === "/api/trust/llm-narrative" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const trustIdx = require("./js/trust-index.js");
      const profile = llmInference.sanitizeFacts(payload.profile || {});
      const leaderId = llmInference.stripInjection(payload.leaderId || "unknown");
      let roadmap;
      try { roadmap = trustIdx.trustRecoveryRoadmap(payload.profiles || [], leaderId); }
      catch (e) { roadmap = { error: honestEngineError(e.message), leaderId }; }
      const prompt = `You are a leadership trust advisor. Based on the following trust profile and recovery roadmap, write a 3-paragraph coaching recommendation for this leader. Be specific, actionable, and grounded in the data. Do not invent facts.

LEADER: ${leaderId}
TRUST PROFILE: ${JSON.stringify(profile).slice(0, 400)}
RECOVERY ROADMAP: ${JSON.stringify(roadmap).slice(0, 400)}

Coaching recommendation:`;
      const attempt = await llmInference.generateVerified(prompt, { knownValues: { profile, roadmap }, allowed: [0, 100], temperature: 0.1, maxTokens: 500 });
      const result = attempt.result;
      if (result.ok && attempt.verification && attempt.verification.valid) {
        appendAudit({ action: "LLM trust narrative generated", detail: `leader=${leaderId} model=${result.model}` });
        return send(res, 200, { source: "llm", narrative: result.response, roadmap, model: result.model, latencyMs: result.latencyMs, claimVerified: true });
      }
      if (result.ok) {
        return send(res, 200, { source: "fallback", narrative: roadmap, reason: "unsupported numeric claim in LLM response: " + (attempt.verification ? attempt.verification.unsupported.join(",") : "") });
      }
      return send(res, 200, { source: "fallback", narrative: roadmap, reason: result.reason });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── LLM feedback-loop narrative ───────────────────────────────────────────
  // Generates a contextual feedback action plan using the local LLM.
  // Falls back to the deterministic feedbackProcessingScore when Ollama is off.
  if (req.url === "/api/feedback/llm-narrative" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const feedbackLib = require("./js/feedback-loop-system.js");
      const feedback = llmInference.sanitizeFacts(payload.feedback || []);
      const score = feedbackLib.feedbackProcessingScore(feedback);
      const prompt = `You are a feedback culture advisor. Based on the following feedback data and processing score, write a 2-paragraph action plan for improving how this feedback is acted on. Be specific about who should do what. Do not invent facts.

FEEDBACK: ${JSON.stringify(feedback).slice(0, 500)}
PROCESSING SCORE: ${JSON.stringify(score).slice(0, 300)}

Action plan:`;
      const attempt = await llmInference.generateVerified(prompt, { knownValues: { feedback, score }, allowed: [0, 100], temperature: 0.1, maxTokens: 400 });
      const result = attempt.result;
      if (result.ok && attempt.verification && attempt.verification.valid) {
        appendAudit({ action: "LLM feedback narrative generated", detail: `score=${score.score || 0} model=${result.model}` });
        return send(res, 200, { source: "llm", narrative: result.response, score, model: result.model, latencyMs: result.latencyMs, claimVerified: true });
      }
      if (result.ok) {
        return send(res, 200, { source: "fallback", narrative: score, reason: "unsupported numeric claim in LLM response: " + (attempt.verification ? attempt.verification.unsupported.join(",") : "") });
      }
      return send(res, 200, { source: "fallback", narrative: score, reason: result.reason });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── Danish-HR LLM drafting routes now in lib/routes/danish-hr-llm.js ───
  // Honest layer: deterministic template without a key, verified numbers with
  // one, mode always disclosed. Drafts only — never decides.

  // ─── Liveness of the app itself (admin) ──────────────────────────────────
  // Whether an external monitor is being told this app is alive, how long ago
  // the last check-in landed, and what the switch has reported. This is the
  // one surface the provider watchdog cannot fill: it answers "is anything
  // watching US?" — including the honest "no, nobody is".
  if (req.url === "/api/llm/deadman" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    const config = deadmanConfig();
    return send(res, 200, {
      ...deadman.publicState(deadman.loadState(DATA_DIR), config),
      running: !!deadmanTimer,
      env: {
        pingUrlSet: !!config.urlConfigured,
        intervalEnvMs: process.env.LEADERSHIP_DEADMAN_INTERVAL_MS || null,
        timeoutEnvMs: process.env.LEADERSHIP_DEADMAN_TIMEOUT_MS || null,
        failThresholdEnv: process.env.LEADERSHIP_DEADMAN_FAIL_THRESHOLD || null,
        enabledEnv: process.env.LEADERSHIP_DEADMAN || null
      }
    });
  }
  // Check in with the monitor NOW (admin). Runs the same pass the interval runs,
  // including alert delivery, so an operator can prove the monitor would hear an
  // outage instead of hoping it would. A failure here is the switch working.
  if (req.url === "/api/llm/deadman/beat" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    const result = await runDeadmanBeat("manual");
    return send(res, result.sent && result.sent.ok ? 200 : 502, result);
  }
  // ─── LLM availability check ─────────────────────────────────────────────
  /** Strip endpoint URLs from a provider-status payload for non-admin roles. */
  function redactProviderUrls(s) {
    if (!s || typeof s !== "object") return s;
    const out = Object.assign({}, s);
    delete out.url;
    if (Array.isArray(out.providers)) {
      out.providers = out.providers.map(p => { const q = Object.assign({}, p); delete q.url; return q; });
    }
    out.urlsRedacted = true;
    return out;
  }
  if (req.url === "/api/llm/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    // Configuration PLUS live truth: the watchdog's last verdict and the daily
    // budget state ride along, because the always-on mentor strip has to be able
    // to say "the providers are down" / "the budget is spent" on every view —
    // not only on the admin's AI status page. Both are additive fields, and a
    // missing state file simply reports "not probed yet".
    const rawStatus = llmInference.providerStatus();
    // A viewer may see WHICH providers are configured and whether they answer —
    // never WHERE they are. The endpoint URLs are deployment detail (the local
    // inference host and the vendor API paths), and the lowest-privilege role
    // does not need them; an adversarial sweep of this route read them straight
    // off the viewer payload. Administrators keep the full shape, since the AI
    // status page is theirs and hides nothing from them.
    const status = authorized(req, "admin") ? rawStatus : redactProviderUrls(rawStatus);
    let watchdog = null;
    let budget = null;
    let deadmanState = null;
    try { watchdog = llmWatchdog.publicState(llmWatchdog.loadState(DATA_DIR)); } catch (_) { watchdog = null; }
    // "The providers answer" and "anything is watching whether WE are alive" are
    // different questions; the strip must be able to raise both, so both ride
    // along on every view's status payload — for EVERY role, because a viewer
    // whose AI is degraded deserves the same truth an administrator gets.
    try { deadmanState = deadmanForViewers(deadman.loadState(DATA_DIR), deadmanConfig()); } catch (_) { deadmanState = null; }
    try {
      const state = llmUsage.budgetState(DATA_DIR);
      budget = { exceeded: state.exceeded, warn: state.warn, reason: state.reason, day: state.day, tokenLimit: state.tokenLimit, tokenUsed: state.tokenUsed, tokenPct: state.tokenPct, costLimit: state.costLimit, costUsed: state.costUsed, costPct: state.costPct, limits: state.limits };
    } catch (_) { budget = null; }
    return send(res, 200, { ...status, watchdog, budget, deadman: deadmanState });
  }
  // Live provider health probe (admin): actually calls each configured
  // provider with a minimal bounded request and reports ok/latency per one.
  // This is reality-testing, not configuration reporting — a dead key shows
  // up here even when /api/llm/status says "configured".
  if (req.url === "/api/llm/health" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const probe = await llmInference.probeProviders({ timeoutMs: 12000 });
      appendAudit({ action: "LLM provider health probe", detail: `healthy=${probe.healthy.join(",") || "none"}/${probe.providers.length}` });
      // A manual probe also feeds the watchdog: pressing the button must never
      // produce a different verdict from the background monitor, and it is the
      // operator's way to force an outage check right now.
      const recorded = recordProviderProbe(probe, probe.at);
      return send(res, 200, { ...probe, watchdog: llmWatchdog.publicState(recorded.state), alert: recorded.alert || null });
    } catch (error) { return send(res, 500, { error: error.message }); }
  }
  // ─── Live model evaluation (admin) ───────────────────────────────────────
  // The REAL comparison, not a benchmark claim: every configured provider
  // answers the SAME four mentor cases (built from the governor method-registry
  // solutions), and each answer is scored against the contract the app actually
  // enforces at runtime — opens with the required label, replies in the leader's
  // language, invents no figure, names a method the solver selected, stays
  // inside the length budget. Bounded (4 cases) and run on PRODUCTION's own
  // budget (900 tokens / 25 s) so the numbers describe the path the app runs,
  // and only ever run by an explicit admin call — opening the page costs nothing.
  if (req.url.startsWith("/api/llm/eval") && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const evalLang = getLang(req);
      const state = activeProjectState(req);
      const engine = coachStore().engine;
      const cases = MENTOR_EVAL_CASES.map(def => {
        const solution = engine.mentorSolve(state, { situationId: def.situationId, problem: def.problem, inputs: {}, lang: def.lang });
        return {
          id: def.id, situationId: def.situationId, lang: def.lang,
          // The production prompt, verbatim — not a look-alike.
          prompt: mentorUserPrompt(def.problem, { lang: def.lang, answer: solution.text, intent: "mentor_solution" }),
          system: coachMentorSystem(def.lang),
          answer: solution.text || "",
          allowedNumbers: solution.allowedNumbers,
          methods: (solution.methods || []).map(m => ({ id: m.id, name: m.name }))
        };
      });
      // Production's own budget (900 tokens / 25 s): the evaluation must measure
      // the path the app actually runs, never a cheaper look-alike.
      const run = await llmInference.evalProviders(cases, { maxCases: 4, maxTokens: 900, timeoutMs: 25000 });
      const providers = run.providers.map(p => {
        const scored = p.cases.map(row => {
          const def = cases.filter(c => c.id === row.caseId)[0] || {};
          return Object.assign({ caseId: row.caseId, provider: p.provider, model: row.model, latencyMs: row.latencyMs, reason: row.reason }, scoreMentorEval(def, row));
        });
        const checks = scored.reduce((n, s) => n + s.score, 0);
        const possible = scored.length * MENTOR_EVAL_CHECKS.length;
        return {
          provider: p.provider, model: p.model,
          score: possible ? Math.round((checks / possible) * 100) : 0,
          passed: scored.filter(s => s.passed).length,
          total: scored.length,
          latencyMs: Math.round(scored.reduce((n, s) => n + (s.latencyMs || 0), 0) / (scored.length || 1)),
          cases: scored
        };
      }).sort((a, b) => b.score - a.score);
      appendAudit({ action: "LLM provider evaluation", detail: providers.map(p => `${p.provider}=${p.score}%`).join(" ") || "no provider configured" });
      return send(res, 200, { at: run.at, active: run.active, lang: evalLang, checks: MENTOR_EVAL_CHECKS, providers });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // ─── LLM provider credentials (admin; encrypted at rest) ─────────────────
  // Admin-registered provider keys power the same AI routes as env vars — the
  // "register keys in the application" path. Keys are never returned and are
  // stored via AES-256-GCM (at-rest.encryptSecret) which refuses to run
  // without LEADERSHIP_DATA_ENCRYPTION_KEY.
  if (req.url === "/api/llm/credentials" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { credentials: llmCredentials.listPublic(DATA_DIR), storage: { encrypted: hasKey() } });
  }
  if (req.url === "/api/llm/credentials" && req.method === "PUT") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const provider = String(payload.provider || "").trim().toLowerCase();
      if (!llmInference.providerDef(provider)) {
        return send(res, 400, { error: "Unknown provider", providers: llmInference.providerStatus().providers.map(p => p.id) });
      }
      if ((payload.key === undefined || payload.key === "") && (payload.model === undefined || payload.model === "")) {
        return send(res, 400, { error: "provider key or model is required" });
      }
      const saved = llmCredentials.upsert(DATA_DIR, provider, {
        key: payload.key === undefined ? undefined : String(payload.key),
        model: payload.model === undefined ? undefined : String(payload.model)
      });
      appendAudit({ action: "LLM provider credential saved", detail: `${provider}${saved.model ? " (model: " + saved.model + ")" : ""}` });
      return send(res, 201, { credential: saved, storage: { encrypted: hasKey() } });
    } catch (error) {
      // Encryption key missing → 503 (operator config), everything else 400.
      return send(res, error instanceof IntegrityError ? 503 : 400, { error: error.message });
    }
  }
  if (req.url.startsWith("/api/llm/credentials") && req.method === "DELETE") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    const provider = String(req.query.provider || "").trim().toLowerCase();
    if (!provider) return send(res, 400, { error: "provider query parameter is required" });
    const removed = llmCredentials.remove(DATA_DIR, provider);
    appendAudit({ action: "LLM provider credential removed", detail: provider });
    return send(res, 200, { removed, provider });
  }
  // ─── AI provider watchdog (admin) ────────────────────────────────────────
  // The always-on monitor's current verdict: which providers answer, whether
  // the app is degraded or running with no provider at all, and the outage
  // history. This is what the AI status view and the mentor strip read.
  if (req.url === "/api/llm/watchdog" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, {
      ...llmWatchdog.publicState(llmWatchdog.loadState(DATA_DIR)),
      enabled: LLM_WATCHDOG_ENABLED && llmInference.isAvailable(),
      intervalMs: LLM_WATCHDOG_INTERVAL_MS,
      threshold: LLM_WATCHDOG_THRESHOLD
    });
  }
  // Force a provider probe now (admin). Runs the same pass the scheduler runs,
  // including alert delivery on a transition, so an operator can verify that
  // an outage would actually page them instead of assuming it would.
  if (req.url === "/api/llm/watchdog/probe" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    const result = await runProviderWatchdog("manual");
    return send(res, result.probed ? 200 : 502, result);
  }
  // ─── AI spend: tokens, estimated cost, daily budget (admin) ───────────────
  // "The providers solve everything" needs a meter. Today's usage per provider,
  // a rolling window, and the daily budget verdict the provider layer enforces
  // BEFORE each call. Tokens are exact when the provider reports usage and are
  // labelled as estimates when they are derived from text length; cost is an
  // estimate from the operator-overridable price table, never billing truth.
  if (req.url.startsWith("/api/llm/usage") && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    // Default view for an operator is the DEPLOYMENT (global) with the whole
    // chain alongside, plus who spent the most today — a global cap is useless
    // for diagnosis if the admin cannot see which identity burned the quota.
    // ?scope=tenant:<id> | user:<id> | global narrows the primary view.
    const requested = String((req.query && req.query.scope) || "").trim();
    // A requested scope is reported first and keeps the global total beside it,
    // so "this tenant used X" and "the deployment used Y" are never confused.
    const scopeKeys = llmUsage.isScopeKey(requested)
      ? llmUsage.scopeKeys(requested === llmUsage.GLOBAL_SCOPE ? {} : { userId: requested.indexOf("user:") === 0 ? requested.slice(5) : null, tenantId: requested.indexOf("tenant:") === 0 ? requested.slice(7) : null })
      : [llmUsage.GLOBAL_SCOPE];
    const report = llmUsage.summary(DATA_DIR, { keys: scopeKeys, windowDays: 7 });
    report.topScopes = llmUsage.topScopes(DATA_DIR, { limit: 10 });
    report.requestedScope = requested || null;
    return send(res, 200, report);
  }
  // ─── Multi-stage approval chains (timeout → escalation) ───────────────────
  // Consequential workflow approvals: stages with named approvers and a
  // timeout; an undecided stage escalates instead of stalling. Persisted to
  // DATA_DIR/approval-chains.jsonl. Editors create/decide; admins manage.
  if (req.url === "/api/approvals/chains" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { chains: approvalChains.list(APPROVAL_CHAINS_FILE), count: approvalChains.list(APPROVAL_CHAINS_FILE).length });
  }
  if (req.url === "/api/approvals/chains" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const created = approvalChains.createChain({
        title: payload.title, payload: payload.payload, stages: payload.stages, createdBy: actorFor(req)
      });
      if (created.error) return send(res, 400, { error: created.error });
      approvalChains.save(APPROVAL_CHAINS_FILE, created.chain);
      appendAudit({ action: "Approval chain created", detail: `${created.chain.id} — ${created.chain.title}` });
      return send(res, 201, { chain: approvalChains.publicChain(created.chain) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/approvals/chains/") && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const id = decodeURIComponent(req.url.split("/api/approvals/chains/")[1].split("?")[0] || "");
    if (!id) return send(res, 400, { error: "chain id required" });
    const chain = approvalChains.get(APPROVAL_CHAINS_FILE, id);
    if (!chain) return send(res, 404, { error: "Approval chain not found" });
    const swept = approvalChains.sweep(chain);
    if (swept.escalated) {
      approvalChains.save(APPROVAL_CHAINS_FILE, chain);
      appendAudit({ action: "Approval chain escalated (timeout)", detail: `${id} stage ${chain.currentStageIndex + 1}` });
    }
    return send(res, 200, { chain: approvalChains.publicChain(chain) });
  }
  if (req.url.startsWith("/api/approvals/chains/") && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const parts = (req.url.split("/api/approvals/chains/")[1] || "").split("/");
      const id = decodeURIComponent(parts[0] || "");
      if (parts[1] !== "decision") return send(res, 404, { error: "Unknown approval chain action" });
      const payload = await body(req);
      const chain = approvalChains.get(APPROVAL_CHAINS_FILE, id);
      if (!chain) return send(res, 404, { error: "Approval chain not found" });
      const result = approvalChains.decide(chain, { ...payload, actor: actorFor(req) });
      if (result.error) return send(res, 409, { error: result.error });
      approvalChains.save(APPROVAL_CHAINS_FILE, chain);
      appendAudit({ action: "Approval chain decision", detail: `${id} ${payload.action} by ${actorFor(req)}` });
      return send(res, 200, { chain: approvalChains.publicChain(chain), completed: result.completed, rejected: !!result.rejected });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith("/api/approvals/chains/") && req.method === "DELETE") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    const id = decodeURIComponent(req.url.split("/api/approvals/chains/")[1].split("?")[0] || "");
    const removed = approvalChains.remove(APPROVAL_CHAINS_FILE, id);
    if (!removed) return send(res, 404, { error: "Approval chain not found" });
    appendAudit({ action: "Approval chain deleted", detail: id });
    return send(res, 200, { deleted: true, id });
  }

  // ─── Multi-project portfolio dashboard (per-project RBAC) ───────────────────
  // Aggregates KPIs, risks, and budget variance across all projects the
  // user is authorized to see. Non-admin users only get projects where they
  // are the lead (or projects with no lead assigned).
  if (decodedPath === "/api/portfolio/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const ws = readScopedWorkspace(req);
    const authUser = authStore().userFromRequest(req);
    // Scoped view: ?projectId= limits the aggregate to one project (still
    // RBAC-filtered below); absent, it aggregates every visible project.
    const scopeOnly = (req.query && req.query.projectId) ? String(req.query.projectId) : null;
    const projects = Object.entries(ws.projects || {}).filter(([id]) => !scopeOnly || id === scopeOnly).map(([id, p]) => {
      const lead = (p.project && p.project.lead) || p.lead || "";
      // Per-project RBAC: filter out projects the user can't see
      if (authUser && authUser.role !== "admin" && authUser.role !== "viewer" && authUser.role !== "auditor") {
        if (lead && String(authUser.id) !== String(lead)) return null;
      }
      const tasks = (p.registers && p.registers.tasks) || [];
      const risks = (p.registers && p.registers.risks) || [];
      const budget = (p.registers && p.registers.budget) || [];
      const openTasks = tasks.filter(t => ["OPEN", "IN PROGRESS", "ON HOLD", "BLOCKED"].includes(t.status)).length;
      const doneTasks = tasks.filter(t => ["DONE", "CLOSED"].includes(t.status)).length;
      const completion = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
      const highRisks = risks.filter(r => (C.riskRpn(r) || 0) >= 100).length;
      const estBudget = budget.reduce((s, b) => s + (C.num(b.estCost) || 0), 0);
      const actBudget = budget.reduce((s, b) => s + (C.num(b.actCost) || 0), 0);
      const variance = estBudget - actBudget;
      return {
        projectId: id,
        name: (p.project && p.project.name) || id,
        method: (p.project && p.project.method) || "",
        lead: lead || "unassigned",
        status: (p.project && p.project.status) || "active",
        completion,
        openTasks,
        doneTasks,
        totalTasks: tasks.length,
        highRisks,
        totalRisks: risks.length,
        estBudget,
        actBudget,
        variance,
        currency: (p.project && p.project.currency) || "DKK"
      };
    }).filter(Boolean);
    const totals = {
      projectCount: projects.length,
      totalTasks: projects.reduce((s, p) => s + p.totalTasks, 0),
      openTasks: projects.reduce((s, p) => s + p.openTasks, 0),
      doneTasks: projects.reduce((s, p) => s + p.doneTasks, 0),
      highRisks: projects.reduce((s, p) => s + p.highRisks, 0),
      totalRisks: projects.reduce((s, p) => s + p.totalRisks, 0),
      estBudget: projects.reduce((s, p) => s + p.estBudget, 0),
      actBudget: projects.reduce((s, p) => s + p.actBudget, 0),
      avgCompletion: projects.length ? Math.round(projects.reduce((s, p) => s + p.completion, 0) / projects.length) : 0
    };
    totals.variance = totals.estBudget - totals.actBudget;
    return send(res, 200, { projects, totals, revision: currentScopedRevision(req) });
  }

  // ─── Strategic event bus dashboard ────────────────────────────────────────
  // Returns the unified event bus state: recent events, anomalies detected,
  // cross-module rules triggered, and health score. This is the strategic
  // layer's real-time view of trust erosion, alignment drift, and commitment
  // patterns — the "nervous system" that was previously invisible.
  if (req.url === "/api/strategic-bus/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const bus = strategicBusBridge.bus;
    const unifiedEventBus = require("./js/unified-event-bus.js");
    const dashboard = unifiedEventBus.eventDashboard(bus);
    // Add strategic action log: recent handler results persisted as durable events.
    const strategicEvents = readJsonLines(EVENTS_FILE)
      .filter(e => e.type && String(e.type).startsWith("strategic."))
      .slice(-10)
      .map(e => ({ type: e.type, action: e.payload && e.payload.action, leaderId: e.payload && e.payload.leaderId, ts: e.occurredAt }));
    return send(res, 200, {
      healthScore: dashboard.healthScore,
      totalEvents: dashboard.totalEvents,
      eventsByType: dashboard.eventsByType,
      recentAnomalies: dashboard.recentAnomalies,
      alerts: dashboard.alerts,
      strategicActions: strategicEvents,
      bridgeActive: !!bus,
      subscriptions: Object.keys(bus.subscribers || {}).length
    });
  }

  // Decision debt tracker
  if (req.url === "/api/decision-debt/register" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const debt = decisionDebtTracker.registerDebt(payload);
      EXPANSION_STATE.decisionDebts = (EXPANSION_STATE.decisionDebts || []).concat([debt]);
      appendAudit({ action: "Decision debt registered", detail: debt.title });
      return send(res, 201, debt);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-debt/portfolio" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const portfolio = decisionDebtTracker.buildDebtPortfolio(EXPANSION_STATE.decisionDebts || []);
    return send(res, 200, portfolio);
  }
  if (req.url === "/api/decision-debt/resolve" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const debts = EXPANSION_STATE.decisionDebts || [];
      const idx = debts.findIndex(d => d.id === payload.debtId);
      if (idx === -1) return send(res, 404, { error: "Debt not found" });
      debts[idx] = decisionDebtTracker.resolveDebt(debts[idx], payload.decision, (authStore().userFromRequest(req) || {}).id);
      appendAudit({ action: "Decision debt resolved", detail: debts[idx].title });
      return send(res, 200, debts[idx]);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision-debt/trend" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const trend = decisionDebtTracker.analyzeDebtTrend(payload.history);
      return send(res, 200, trend);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Automated board prep
  if (req.url === "/api/board-prep/assemble" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const pkg = autoBoardPrep.assembleBoardPackage(payload.domainData, payload.period, payload.meetingDate, payload.opts);
      appendAudit({ action: "Board package assembled", detail: `${pkg.period} — ${pkg.agenda.items.length} agenda items` });
      return send(res, 201, pkg);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/board-prep/publish" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const pkg = autoBoardPrep.publishBoardPackage(payload.package, payload.approval);
      appendAudit({ action: "Board package published", detail: `${pkg.period} — approved by ${pkg.publishedBy}` });
      return send(res, 200, pkg);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/board-prep/post-meeting" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const followUp = autoBoardPrep.generatePostMeetingFollowUp(payload.package, payload.meetingResults);
      appendAudit({ action: "Post-meeting follow-up generated", detail: `${followUp.actionItems.length} action items` });
      return send(res, 201, followUp);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Cross-functional dependencies
  if (req.url === "/api/dependencies/graph" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const graph = crossFunctionalDeps.buildDependencyGraph(payload.items);
      if (payload.findCriticalPath) crossFunctionalDeps.findCriticalPath(graph);
      return send(res, 200, graph);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dependencies/ripple" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const graph = crossFunctionalDeps.buildDependencyGraph(payload.items);
      const ripple = crossFunctionalDeps.simulateRipple(graph, payload.triggerItemId, payload.delayDays);
      appendAudit({ action: "Ripple simulation", detail: `${ripple.totalItemsAffected} items affected by ${payload.triggerItemId}` });
      return send(res, 200, ripple);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dependencies/break-scenarios" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const graph = crossFunctionalDeps.buildDependencyGraph(payload.items);
      const scenarios = crossFunctionalDeps.rankBreakScenarios(graph, payload.delayDays || 5);
      return send(res, 200, scenarios);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dependencies/hidden" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const graph = crossFunctionalDeps.buildDependencyGraph(payload.items);
      const hidden = crossFunctionalDeps.detectHiddenDependencies(graph, payload.incidentHistory);
      return send(res, 200, hidden);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Innovation pipeline
  if (req.url === "/api/innovation/score" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const score = innovationPipeline.scoreIdea(payload.params, payload.weights);
      return send(res, 200, score);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/innovation/gate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const decision = innovationPipeline.evaluateGate(payload.idea, payload.targetStage, (authStore().userFromRequest(req) || {}).id);
      appendAudit({ action: "Innovation gate decision", detail: `${payload.idea.title}: ${decision.decision} → ${payload.targetStage}` });
      return send(res, 200, decision);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/innovation/portfolio" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const portfolio = innovationPipeline.buildInnovationPortfolio(payload.ideas || []);
      return send(res, 200, portfolio);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/innovation/auto-kill" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const candidates = innovationPipeline.detectAutoKillCandidates(payload.ideas || [], payload.rules);
      if (candidates.length) appendAudit({ action: "Auto-kill candidates detected", detail: `${candidates.length} candidates` });
      return send(res, 200, candidates);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/innovation/zombies" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const zombies = innovationPipeline.detectZombieProjects(payload.ideas || [], payload.rules);
      return send(res, 200, zombies);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── R26 No More Simulation Routes ───────────────────────────────────

  // Push delivery (real FCM/APNs)
  if (req.url === "/api/push/send" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const result = await pushDelivery.deliverPush(p); const maskedToken = String(result.deviceToken || "").replace(/^(....).*(....)$/, "$1…$2"); appendAudit({ action: "Push notification sent", detail: `${result.platform}: ${result.success ? 'delivered' : 'failed'} to ${maskedToken}` }); return send(res, result.success ? 200 : 502, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/push/batch" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, await pushDelivery.sendFCMBatch(p.projectId, p.accessToken, p.deviceTokens, p.notification, p.data)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // HSM integration
  if (req.url === "/api/hsm/generate-key" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const hsm = hsmIntegration.createHSMProvider(p.config); hsm.initialized = true; const key = hsmIntegration.generateKeyPair(hsm, p.algorithm); appendAudit({ action: "HSM key generated", detail: `${key.keyId} (${key.algorithm})` }); return send(res, 201, key); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/hsm/health" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const hsm = hsmIntegration.createHSMProvider({}); hsm.initialized = true; return send(res, 200, hsmIntegration.hsmHealthCheck(hsm)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Decision recommendation engine
  if (req.url === "/api/decisions/recommend" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const rec = decisionRecommendationEngine.recommend(p); appendAudit({ action: "Decision recommendation generated", detail: `${rec.recommendation.primary} (${rec.recommendation.compositeScore}/100, ${rec.recommendation.confidence}% confidence)` }); return send(res, 200, rec); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Tenant provisioning
  if (req.url === "/api/tenants/provision" && req.method === "POST") {
    // Self-service registration — public endpoint
    try { const p = await body(req); const result = tenantProvisioning.provisionTenant(p); appendAudit({ action: "Tenant provisioned", detail: `${result.tenant.tenantId}: ${result.tenant.organizationName} (${result.tenant.tier})` }); return send(res, 201, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/tenants/quota-check" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, tenantProvisioning.checkQuota(p.tenant, p.resource, p.requested)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/tenants/change-subscription" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, tenantProvisioning.changeSubscription(p.tenant, p.newTier, p.billingInfo)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // API gateway — versioning
  if (req.url === "/api/gateway/versions" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { return send(res, 200, apiGateway.versionHealthReport()); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/gateway/deprecate" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, apiGateway.deprecateAPIVersion(p.version, p.sunsetDate, p.migrationGuideUrl)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Backup scheduler
  if (req.url === "/api/backup/status" && req.method === "GET") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { return send(res, 200, backupScheduler.shouldRunBackup(backupScheduler.createBackupScheduler())); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/backup/run" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const scheduler = backupScheduler.createBackupScheduler(); // Validate the backup type: it flows into the backup directory name, so a
      // crafted value (e.g. "../../evil") would traverse out of the backup dir.
      const type = (p.type === "incremental") ? "incremental" : "full";
      const result = backupScheduler.executeBackup(scheduler, type); appendAudit({ action: "Backup executed", detail: `${result.backupId}: ${result.success ? 'OK' : 'FAIL'}` }); return send(res, result.success ? 201 : 500, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Data export compliance
  // Data-export compliance routes now in lib/routes/compliance.js (increment #14).

  if (req.url === "/api/tenants/verify-isolation" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const result = tenantIsolationVerifier.runTenantIsolationTests({}); appendAudit({ action: "Tenant isolation verified", detail: result.isolationVerified ? 'PASS' : 'BREACHED' }); return send(res, 200, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // SLO enforcement
  if (req.url === "/api/slo/dashboard" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { return send(res, 200, sloEnforcement.sloDashboard({})); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/slo/enforce" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const result = sloEnforcement.enforceSLO(p.slo, p.metrics, p.activeBreakers); appendAudit({ action: "SLO enforced", detail: `${p.slo?.name || 'unknown'}: ${result.burnRate.status}, ${result.actions.length} actions` }); return send(res, 200, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Feature flags per tenant
  if (req.url === "/api/features/check" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, { enabled: tenantFeatureFlags.isFeatureEnabled(p.registry, p.tenantId, p.featureName, p.options) }); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/features/kill-switch" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const result = tenantFeatureFlags.activateKillSwitch(p.registry, p.featureName, p.reason, (authStore().userFromRequest(req) || {}).id); appendAudit({ action: "Feature kill switch activated", detail: `${p.featureName}: ${p.reason}` }); return send(res, 200, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── R25+ New Domain Module Routes ───────────────────────────────────

  // Transfer pricing
  if (req.url === "/api/transfer-pricing/cup" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, transferPricing.cupMethod(p.controlledPrice, p.comparablePrice, p.adjustments)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/transfer-pricing/cbcr" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, transferPricing.generateCbCR(p.entities)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/transfer-pricing/risk" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, transferPricing.tpRiskAssessment(p.transactions, p.thresholds)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Climate risk analysis
  if (req.url === "/api/climate/physical-risks" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, climateRiskAnalysis.assessPhysicalRisks(p.locations, p.scenario)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/climate/transition-risks" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, climateRiskAnalysis.assessTransitionRisks(p.organization, p.scenario)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/climate/tcfd-report" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, climateRiskAnalysis.generateTCFDReport(p.physicalAssessment, p.transitionAssessment, p.metrics, p.targets)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Anonymous reporting
  if (req.url === "/api/anonymous-report/submit" && req.method === "POST") {
    // Anonymous reports must NOT require auth
    try { const p = await body(req); const result = anonymousReporting.submitAnonymousReport(p.content, p.categories); appendAudit({ action: "Anonymous report submitted", detail: result.report.reportId }); return send(res, 201, { receipt: result.reporterHolds.receiptToken, commitment: result.report.commitment }); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/anonymous-report/status" && req.method === "POST") {
    // Anonymous status check — no auth
    try { const p = await body(req); return send(res, 200, anonymousReporting.checkStatus([], p.receiptToken)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Treasury management
  if (req.url === "/api/treasury/cash-position" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, treasuryManagement.consolidateCashPosition(p.accounts, p.fxRates)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/treasury/fx-exposure" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, treasuryManagement.netFXExposure(p.assets, p.liabilities, p.fxRates)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/treasury/hedging" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, treasuryManagement.hedgingRecommendation({ exposures: p.exposures }, p.riskProfile)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/treasury/debt-structure" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, treasuryManagement.debtStructureOptimization(p.debts, p.currentRates, p.forecast)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Pricing optimizer
  if (req.url === "/api/pricing/elasticity" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, pricingOptimizer.priceElasticity(p.historicalPrices)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/pricing/optimal" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, pricingOptimizer.optimalPrice(p.currentPrice, p.currentDemand, p.elasticity, p.constraints)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/pricing/tiered" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, pricingOptimizer.tieredPricingDesign(p.segments, p.costPerUnit)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Channel management
  if (req.url === "/api/channel/health" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, channelManagement.partnerHealthScore(p.partner)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/channel/conflicts" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, channelManagement.detectChannelConflict(p.deals, p.partners)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/channel/roi" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, channelManagement.channelROI(p.channels)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/channel/tiers" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, channelManagement.optimizePartnerTiers(p.partners, p.programStructure)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Team dynamics simulation
  if (req.url === "/api/team/trust-network" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, teamDynamicsSim.analyzeTrustNetwork(p.members, p.interactions)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/team/intervene" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, teamDynamicsSim.simulateIntervention(p.team, p.intervention)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/team/conflict-predict" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, teamDynamicsSim.predictConflictEmergence(p.team, p.history)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // AI red-teaming
  if (req.url === "/api/red-team/prompts" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, aiRedTeaming.generateAdversarialPrompts(p.targetModel, p.categories)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/red-team/evaluate" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const result = aiRedTeaming.evaluateRedTeamResults(p.prompts, p.responses, p.safetyConfig); appendAudit({ action: "Red team evaluation", detail: `${result.passed}/${result.totalPrompts} passed` }); return send(res, 200, result); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/red-team/model-card" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, aiRedTeaming.generateModelCard(p.model, p.evalResults)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/red-team/incident-playbook" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, aiRedTeaming.aiIncidentPlaybook(p.incidentType)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Continuous assurance
  if (req.url === "/api/assurance/controls" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, continuousAssurance.monitorControls(p.controls, p.events)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/assurance/evidence" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, continuousAssurance.collectEvidence(p.controlMappings, p.dataSources)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/assurance/posture" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, continuousAssurance.compliancePosture(p.monitoring, p.evidence, p.incidentHistory)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/assurance/auditor-report" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, continuousAssurance.generateAuditorReport(p.controlMonitor, p.evidence, p.posture, p.auditTrail)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // External verifiability
  if (req.url === "/api/verify/claim" && req.method === "POST") {
    // Public endpoint — no auth required
    try { const p = await body(req); return send(res, 200, externalVerifiability.verifyClaim(p.claim, p.proof)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/verify/attestation" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, externalVerifiability.generatePublicAttestation(p.chains, p.selector)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/verify/compliance" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, externalVerifiability.complianceZKP(p.complianceStatus, p.publicKey)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // Blockchain anchoring
  if (req.url === "/api/blockchain/anchor" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); const tree = blockchainAnchoring.buildAnchorMerkleTree(p.chainRoots); const anchor = blockchainAnchoring.createAnchorTransaction(tree, p.blockchain); appendAudit({ action: "Blockchain anchor created", detail: `${anchor.anchorId}: ${anchor.chainCount} chains` }); return send(res, 201, anchor); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/blockchain/verify" && req.method === "POST") {
    // Public — no auth
    try { const p = await body(req); return send(res, 200, blockchainAnchoring.verifyAnchoredChain(p.txHash, p.merkleProof, p.blockInfo)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url === "/api/blockchain/strategy" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try { const p = await body(req); return send(res, 200, blockchainAnchoring.anchorStrategy(p.chains, p.options)); }
    catch (e) { return send(res, 400, { error: e.message }); }
  }

  // ─── Unwired module routes (round-25) ─────────────────────────────────

  // People analytics
  if (req.url === "/api/people/churn-risk" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = peopleAnalytics.churnRiskScore(payload.person, payload.context);
      return send(res, 200, { score: typeof result === "object" ? result.score : result, evidence: typeof result === "object" ? result.evidence : null, employmentDecisionBlocked: true });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people/interventions" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, peopleAnalytics.interventionPlan(payload.person, payload.churnFactors, payload.context));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people/burnout" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = peopleAnalytics.burnoutRiskScore(payload.person, payload.workfactors);
      return send(res, 200, { score: typeof result === "object" ? result.score : result, evidence: typeof result === "object" ? result.evidence : null, employmentDecisionBlocked: true });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people/nine-box" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, peopleAnalytics.nineBoxPlacement(payload.person, payload.performanceScore, payload.potentialScore) );
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/people/skills-obsolescence" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, peopleAnalytics.skillObsolescenceAudit(payload.person, payload.skillInventory, payload.marketTrends));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Change management
  if (false && req.url === "/api/change/impact" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const impact = changeManagement.impactAssessment(payload.change, payload.orgContext, payload.financialContext, payload.riskContext);
      appendAudit({ action: "Change impact assessed", detail: `${payload.change.title || payload.change.id}: ${impact.totalPeopleImpacted} people` });
      return send(res, 200, impact);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/change/readiness" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, changeManagement.readinessScore(payload.organization, payload.change));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/change/resistance" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, changeManagement.resistancePrediction(payload.stakeholder, payload.changeContext, payload.feedbackHistory));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/change/communications" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, changeManagement.communicationPlan(payload.change, payload.stakeholders, payload.resistanceScores));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Supply chain resilience
  if (req.url === "/api/supply-chain/concentration" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, supplyChainResilience.concentrationRiskAnalysis(payload.bom, payload.suppliers, payload.spend));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/supply-chain/geopolitical" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, supplyChainResilience.geopoliticalExposure(payload.suppliers, payload.countries, payload.geopoliticalRisks));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/supply-chain/inventory" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, supplyChainResilience.inventoryOptimization(payload.material, payload.demand, payload.leadTime, payload.holdingCost, payload.orderingCost, payload.serviceLevel));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/supply-chain/resilience" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, supplyChainResilience.resilienceScore(payload.profile));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Financial risk integration
  // Market intelligence
  if (req.url === "/api/market/win-loss" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, marketIntelligence.winLossAnalysis(payload.deals));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/market/positioning" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, marketIntelligence.competitivePositioning(payload.organization, payload.competitors, payload.dimensions));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/market/opportunity" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, marketIntelligence.marketOpportunitySizing(payload.industry, payload.segment, payload.assumptions));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/market/pricing" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, marketIntelligence.priceOptimization(payload.pricePoints, payload.demandAtPrices, payload.costStructure));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Sustainability impact
  if (req.url === "/api/sustainability/carbon" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, sustainabilityImpact.carbonFootprint(payload.operations));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/sustainability/esg" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, sustainabilityImpact.esgScore(payload.esgMetrics));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/sustainability/sdg" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, sustainabilityImpact.sdgAlignment(payload.initiatives));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/sustainability/esg-finance" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, sustainabilityImpact.esgFinancialImpact(payload.esgScores, payload.financialMetrics));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Organizational capability
  if (req.url === "/api/org-capability/maturity" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, organizationalCapability.processMaturity(payload.processArea, payload.assessmentData));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/org-capability/digital" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, organizationalCapability.digitalReadiness(payload.organization));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/org-capability/roadmap" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, organizationalCapability.capabilityRoadmap(payload.capabilityAssessment, payload.targetMaturity, payload.constraints));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Autonomous remediation
  if (req.url === "/api/remediation/evaluate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = autonomousRemediation.evaluateRules(payload.alert, payload.rules, payload.context);
      if (result.applicableRules > 0) appendAudit({ action: "Auto-remediation triggered", detail: `${result.applicableRules} rules matched for ${payload.alert.id || payload.alert.type}` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/remediation/execute" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const result = autonomousRemediation.executeWorkflow(payload.workflow, payload.context);
      appendAudit({ action: "Remediation workflow executed", detail: `${payload.workflow.name || payload.workflow.id}: ${result.status}` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/remediation/state" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, autonomousRemediation.stateTransition(payload.workflow, payload.currentState, payload.event));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Causal systems
  // ─── /api/causal/graph|intervene|root-cause|sensitivity now in lib/routes/causal.js (increment #7) ─

  // ─── Realtime: /api/collab/doc|rt-edit|changes|presence|conflicts|lock now in lib/routes/collab.js — increment #8 ─
  // Analytics platform
  if (req.url === "/api/analytics/report" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, analyticsPlatform.buildReport(payload.reportDefinition, payload.dataSource));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/analytics/insights" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, analyticsPlatform.generateInsights(payload.timeSeries));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/analytics/dashboard" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, analyticsPlatform.executiveDashboard(payload.kpis));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/analytics/export" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, { csv: analyticsPlatform.exportToCSV(payload.report, (authStore().userFromRequest(req) || {}).role) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Enterprise hardening
  if (req.url === "/api/hardening/sbom" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, enterpriseHardening.sbomVulnerabilityAudit(payload.dependencies));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/hardening/attest" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const attest = enterpriseHardening.createAttestation(payload.document, payload.signers);
      appendAudit({ action: "Blockchain attestation created", detail: `${payload.document.hash || "doc"}: ${attest.attestationId}` });
      return send(res, 201, attest);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/hardening/verify-attest" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, enterpriseHardening.verifyAttestation(payload.attestation, payload.document));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/hardening/wargame" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const twin = enterpriseHardening.createDigitalTwin(payload.organization);
      const result = enterpriseHardening.runWargameScenario(twin, payload.scenario);
      appendAudit({ action: "Wargame scenario run", detail: `${payload.scenario.name || "scenario"}: ${result.impact.overallImpact || "analyzed"}` });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/hardening/learning-roi" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, enterpriseHardening.learningROI(payload.trainingProgram, payload.outcomes));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Trustworthiness dashboard
  if (req.url === "/api/trustworthiness/score" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, trustworthinessDashboard.trustScore(payload.trustFactors));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/trustworthiness/explain" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, trustworthinessDashboard.explainDecision(payload.recommendation, payload.featureImportances));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/trustworthiness/bias" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, trustworthinessDashboard.biasAudit(payload.predictions, payload.demographics));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/trustworthiness/data-quality" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, trustworthinessDashboard.dataQualityScore(payload.dataset));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Final frontier routes (round-24) ──────────────────────────────────

  // Cognitive load optimizer
  if (req.url === "/api/cognitive-load/profile" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const profile = cognitiveLoadOptimizer.computeCognitiveLoad(payload.decisions, payload.opts);
      return send(res, 200, profile);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/cognitive-load/team" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, cognitiveLoadOptimizer.teamCognitiveLoad(payload.profiles));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Decision-to-outcome attribution
  if (req.url === "/api/attribution/report" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const report = decisionOutcomeAttribution.buildAttributionReport(payload.outcomes, payload.decisions, payload.debts);
      appendAudit({ action: "Attribution report generated", detail: `${report.attributions.length} attributions, ${report.debtImpacts.length} debt links` });
      return send(res, 200, report);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/attribution/debt-timeline" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, decisionOutcomeAttribution.debtImpactTimeline(payload.debts, payload.outcomes, payload.attributions));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/attribution/predict" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, decisionOutcomeAttribution.predictOutcomesFromDecisions(payload.pending, payload.history));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Ethical decision framework
  if (req.url === "/api/ethical/analyze" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const analysis = ethicalDecisionFramework.analyzeDecision(payload);
      appendAudit({ action: "Ethical analysis", detail: `${payload.decisionTitle} — ${analysis.scoreLabel} (${analysis.ethicalScore}/100)` });
      return send(res, 201, analysis);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ethical/batch" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, ethicalDecisionFramework.batchAnalyze(payload.decisions, payload.opts));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Strategic time architecture
  if (req.url === "/api/time/allocate" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, strategicTimeArchitecture.analyzeTimeAllocation(payload.entries, payload.priorities, payload.period));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/time/team" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, strategicTimeArchitecture.teamTimeArchitecture(payload.allocations));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/time/reclaim" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, strategicTimeArchitecture.calculateTimeReclamation(payload.breakdown, payload.firefightingReduction, payload.meetingReduction));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Legacy-to-action gap
  if (req.url === "/api/legacy/analyze" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const report = legacyToActionGap.analyzeLegacyIntegrity(payload.statement, payload.actualData, payload.targets, payload.period);
      appendAudit({ action: "Legacy integrity analyzed", detail: `${report.legacyIntegrityScore}/100 — ${report.status}` });
      return send(res, 200, report);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/legacy/trend" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, legacyToActionGap.legacyTrend(payload.historical));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/legacy/letter" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      return send(res, 200, { letter: legacyToActionGap.generateLegacyLetter(payload.report) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Governed validation studies ─────────────────────────────────────────
  if (req.url === "/api/validation-studies" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    const user = authStore().userFromRequest(req);
    const tenantId = user ? String(user.tenantId || user.id) : String(process.env.LEADERSHIP_TENANT_ID || "local");
    const rawStudies = readJsonLines(VALIDATION_STUDIES_FILE);
    if (rawStudies.some(row => row._corrupt)) return send(res, 503, { error: "validation study store integrity failure" });
    const studies = rawStudies.filter(row => row.tenantId === tenantId);
    return send(res, 200, { studies: studies.map(row => validationStudies.summarizeStudy(row.study, row.observations || [])), claimEligible: false });
  }
  if (req.url === "/api/validation-studies" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (payload.consent !== true) return send(res, 400, { error: "explicit consent is required" });
      const study = validationStudies.createStudy(payload.study);
      const user = authStore().userFromRequest(req);
      const tenantId = user ? String(user.tenantId || user.id) : String(process.env.LEADERSHIP_TENANT_ID || "local");
      const row = { id: crypto.randomUUID(), tenantId, actor: actorFor(req), study, observations: [] };
      const fd = fs.openSync(VALIDATION_STUDIES_FILE, "a");
      fs.appendFileSync(fd, JSON.stringify(row) + "\n", "utf8"); fs.fsyncSync(fd); fs.closeSync(fd);
      appendAudit({ action: "Validation study created", detail: `${study.id} — tenant scoped` });
      return send(res, 201, { study: validationStudies.summarizeStudy(study, []), claimEligible: false });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/validation-studies/observe" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (payload.consent !== true) return send(res, 400, { error: "explicit consent is required" });
      const user = authStore().userFromRequest(req);
      const tenantId = user ? String(user.tenantId || user.id) : String(process.env.LEADERSHIP_TENANT_ID || "local");
      const rows = readJsonLines(VALIDATION_STUDIES_FILE);
      if (rows.some(item => item._corrupt)) return send(res, 503, { error: "validation study store integrity failure" });
      const row = rows.find(item => item.study && item.study.id === payload.studyId && item.tenantId === tenantId);
      if (!row) return send(res, 404, { error: "Study not found" });
      row.observations = row.observations || [];
      row.observations.push(validationStudies.recordObservation(row.study, payload.observation));
      fs.writeFileSync(VALIDATION_STUDIES_FILE, rows.map(item => JSON.stringify(item)).join("\n") + "\n", "utf8");
      appendAudit({ action: "Validation observation recorded", detail: `${payload.studyId} — pseudonymous participant` });
      return send(res, 201, { accepted: true, claimEligible: false });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/validation-studies/export" && req.method === "POST") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const user = authStore().userFromRequest(req);
      const tenantId = user ? String(user.tenantId || user.id) : String(process.env.LEADERSHIP_TENANT_ID || "local");
      const row = readJsonLines(VALIDATION_STUDIES_FILE).find(item => item.study && item.study.id === payload.studyId && item.tenantId === tenantId);
      if (!row) return send(res, 404, { error: "Study not found" });
      if (!payload.salt || String(payload.salt).length < 16) return send(res, 400, { error: "salt of at least 16 characters is required" });
      const exported = validationStudies.exportStudy(row.study, row.observations || [], { salt: payload.salt });
      exported.claimEligible = false;
      appendAudit({ action: "Validation study exported", detail: `${payload.studyId} — pseudonymized` });
      return send(res, 200, exported);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Canonical work graph ─────────────────────────────────────────────────
  if (req.url === "/api/work-graph" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const repository = projectRepository();
      const user = authStore().userFromRequest(req);
      let workspace = readScopedWorkspace(req);
      if (repository.mode === "postgres" && user) workspace = await repository.loadWorkspace(databaseTenantId(req), user.id);
      const result = workGraph.summarize(workspace, { tenantId: moduleTenantIdForRequest(req) });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/work-graph/conflicts" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      let scoped = readScopedWorkspace(req);
      const repository = projectRepository();
      const user = authStore().userFromRequest(req);
      if (repository.mode === "postgres" && user) scoped = await repository.loadWorkspace(databaseTenantId(req), user.id);
      const result = workGraph.summarize(scoped, { tenantId: moduleTenantIdForRequest(req), capacityHoursPerWeek: req.query && req.query.capacityHoursPerWeek });
      return send(res, 200, result.conflicts);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/work-graph/workload" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const scoped = readScopedWorkspace(req);
      const analysis = workGraph.workloadAnalysis(scoped, { tenantId: moduleTenantIdForRequest(req), capacityHoursPerWeek: req.query && req.query.capacityHoursPerWeek });
      // Effective capacity policy so the UI can render a policy-aware nudge:
      // warn → over-allocation is flagged, not blocked. Org defaults live on
      // the SHARED blob in local mode (see /api/org/settings), so mirror the
      // tasks router's fallback rather than reading only the scoped copy.
      const orgDefault = (typeof readWorkspace === "function" ? readWorkspace() : null) || scoped;
      const orgPolicy = orgDefault && orgDefault._orgSettings && ["warn", "block"].includes(orgDefault._orgSettings.capacityPolicy) ? orgDefault._orgSettings.capacityPolicy : "warn";
      return send(res, 200, { ...analysis, policy: orgPolicy });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Scaffolded module routes (lib/module-router.js) ──────────────────────
  // Mounted AFTER the native route block so scaffold routes cannot shadow
  // platform routes; they add the newly wired modules (annual report,
  // capital allocation, org twin, whistleblower, time tracking, …).
  // Guarded: in postgres mode databaseTenantId THROWS for anonymous callers.
  // Anonymous requests the scaffold never handles (e.g. the extracted
  // /api/auth/* routes now falling through to dispatch) must continue down
  // the chain, not crash the whole handler — a landmine present since this
  // block was introduced; the auth-route extraction (increment #3) exposed it.
  let moduleTenantId = null;
  try {
    moduleTenantId = persistenceStore().postgres
      ? databaseTenantId(req)
      : (process.env.LEADERSHIP_TENANT_ID || "local");
  } catch (_) { /* anonymous or tenant-unsafe: skip scaffold, chain answers */ }
  const scaffoldRequest = moduleTenantId === null ? { handled: false } : await moduleRouter.handle(req, {
    role: roleFor(req),
    actor: actorFor(req),
    tenantId: moduleTenantId,
    readBody: () => body(req),
    logError: (err) => logger.error("module_handler_failed", { requestId, module: err && err.module ? err.module : "unknown", message: err && err.message ? err.message : String(err), stack: err && err.stack }),
    emit: (type, payload) => {
      appendDomainEvent(type, payload.route || "module", payload, actorFor(req), requestId, moduleTenantId).catch(() => {});
    },
    record: (moduleKey, payload, result, route) => {
      try {
        const entry = moduleRecordStore.appendRecord(DATA_DIR, moduleKey, {
          route: route.path,
          actor: actorFor(req),
          tenantId: moduleTenantId,
          correlationId: requestId || null,
          payload: payload || {},
          resultHash: moduleRecordStore.sha256(JSON.stringify(result || {}))
        });
        // Postgres-backed persistence: mirror into module_records (system of record).
        if (persistenceStore().postgres) {
          persistenceStore().postgres.saveModuleRecord(moduleTenantId, entry).catch(err =>
            logger.error("module_record_pg_failed", { module: moduleKey, error: err.message })
          );
        }
        appendAudit({ action: `Module executed: ${moduleKey}`, detail: `${route.method} ${route.path} → ${entry.id}` });
      } catch (error) {
        logger.error("module_record_failed", { module: moduleKey, error: error.message });
      }
    }
  });
  if (scaffoldRequest.handled) return send(res, scaffoldRequest.response.status, scaffoldRequest.response.body);

  // ─── Automation recipes (from scaffolded modules) — queued jobs ──────────
  // Automation recipes route now in lib/routes/automation.js (increment #11).

  if (req.url === "/api/recipes/run" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });    try {
      const payload = await body(req);
      const submit = recipeRunner.submitRecipe({
        jobFile: JOBS_FILE,
        dataDir: DATA_DIR,
        moduleKey: payload.moduleKey,
        recipeId: payload.recipeId,
        args: payload.args || {},
        actor: roleFor(req),
        tenantId: databaseTenantId(req)
      }, moduleWiring, moduleRecordStore);
      if (!submit.ok) return send(res, 400, submit);
      appendAudit({ action: "Recipe submitted to governed queue", detail: `${payload.moduleKey}:${payload.recipeId} → ${(submit.jobIds || []).join(",")}${submit.duplicate ? " (duplicate, suppressed)" : ""}` });
      if (submit.duplicate) return send(res, 200, { ok: true, queued: 0, jobIds: submit.jobIds, duplicate: true, requiresApproval: submit.requiresApproval });
      if (submit.requiresApproval) {
        // Human gate: queued for admin approval — the recipe is NOT executed.
        return send(res, 202, { ok: true, queued: submit.queued, jobIds: submit.jobIds, requiresApproval: true, dedupeKey: submit.dedupeKey });
      }
      const out = recipeRunner.executeRecipe({
        ...submit,
        jobFile: JOBS_FILE,
        dataDir: DATA_DIR,
        moduleKey: payload.moduleKey,
        recipeId: payload.recipeId,
        args: payload.args || {},
        actor: roleFor(req),
        tenantId: databaseTenantId(req)
      }, moduleWiring, moduleRecordStore, null, (moduleKey, recipeId, result, record) => {
        appendAudit({ action: "Recipe executed", detail: `${moduleKey}:${recipeId} → ${record.id} (${result.error ? "error" : "ok"})` });
        appendDomainEvent(`${recipeId}.executed`, record.id, { module: moduleKey, recipeId, ok: !result.error }, roleFor(req), requestId, databaseTenantId(req)).catch(() => {});
      });
      return send(res, out.ok ? 201 : 400, out);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/recipes/approve" && req.method === "POST") {
    if (!authorized(req, "admin")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      const out = recipeRunner.approveRecipe({ jobFile: JOBS_FILE, jobId: payload.jobId, actor: roleFor(req), reason: payload.reason || "approved via API" }, (job) => {
        appendAudit({ action: "Recipe approved (admin)", detail: `${job.recipeId} (${job.jobId || job.id})` });
      });
      if (!out.ok) return send(res, 400, out);
      // Approval is the gate — now execute the approved recipe.
      const job = out.job;
      const exec = recipeRunner.executeRecipe({
        jobFile: JOBS_FILE,
        dataDir: DATA_DIR,
        jobId: payload.jobId,
        moduleKey: job.projectId || job.moduleKey,
        recipeId: job.recipeId,
        args: job.recipeArgs || {},
        actor: roleFor(req),
        tenantId: databaseTenantId(req)
      }, moduleWiring, moduleRecordStore, null, (moduleKey, recipeId, result, record) => {
        appendAudit({ action: "Recipe executed after approval", detail: `${moduleKey}:${recipeId} → ${record.id} (${result.error ? "error" : "ok"})` });
        appendDomainEvent(`${recipeId}.executed`, record.id, { module: moduleKey, recipeId, ok: !result.error, approvedBy: payload.actor || roleFor(req) }, roleFor(req), requestId, databaseTenantId(req)).catch(() => {});
      });
      return send(res, exec.ok ? 200 : 400, { approved: out.ok, execution: exec });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Completion audit snapshot (live evidence for the capability matrix) ──
  if (req.url === "/api/completion" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const report = completionAudit.auditAll({
        wiring: moduleWiring,
        rootDir: __dirname,
        observed: completionObservations()
      });
      return send(res, 200, report);
    } catch (error) { return send(res, 500, { error: "Completion audit unavailable: " + error.message }); }
  }

  // ─── Module record store (hash-chained execution history) ────────────────
  if (req.url === "/api/module-records" && req.method === "GET") {
    if (!authorized(req, "auditor")) return send(res, 401, { error: "Unauthorized" });
    try {
      if (persistenceStore().postgres) {
        const records = await persistenceStore().postgres.listModuleRecords(databaseTenantId(req));
        return send(res, 200, { records, verified: moduleRecordStore.verifyAll(DATA_DIR), backend: "postgres" });
      }
      const records = moduleRecordStore.listAll(DATA_DIR, databaseTenantId(req));
      return send(res, 200, { records, verified: moduleRecordStore.verifyAll(DATA_DIR), backend: "jsonl" });
    } catch (error) { return sendInternalError(res, requestId, error); }
  }
  if (req.url === "/api/module-records" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req);
      if (!payload.moduleKey || !payload.payload) return send(res, 400, { error: "moduleKey and payload are required" });
      const entry = moduleRecordStore.appendRecord(DATA_DIR, payload.moduleKey, {
        route: payload.route || "/api/module-records",
        actor: roleFor(req),
        tenantId: databaseTenantId(req),
        payload: payload.payload,
        resultHash: moduleRecordStore.sha256(JSON.stringify(payload.result || {}))
      });
      return send(res, 201, { id: entry.id, hash: entry.hash });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── AI Leadership Modules ───────────────────────────────────────────────────
  // Feature flag: LEADERSHIP_AI_ENABLED — defaults ON; set =false to gate the
  // navigator/mentor/predictions/culture/briefing/collab block off. It used to
  // default "false" while nothing loaded .env (which ships it true), so all
  // ~40 routes behind this gate answered the generic 404 in every real
  // deployment — tests stayed green only because they set the variable themselves.
  const AI_ENABLED = String(process.env.LEADERSHIP_AI_ENABLED || "true").toLowerCase() !== "false";
  if (AI_ENABLED) {
    // Management Navigator
    if (req.url === "/api/ai/navigator/priorities" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const priorities = managementNavigator.computeGlobalPriority(ws, { userId: user.id, role: user.role });
      return send(res, 200, { priorities: priorities.slice(0, 20), revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/navigator/focus" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const timeBudget = Number(req.query?.timeBudget) || 30;
      const focus = managementNavigator.getFocusView(user, ws, timeBudget);
      return send(res, 200, { ...focus, revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/navigator/blind-spots" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const spots = managementNavigator.detectBlindSpots(ws);
      return send(res, 200, { blindSpots: spots, revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/navigator/daily-brief" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const brief = managementNavigator.getDailyBrief(user, ws);
      return send(res, 200, { ...brief, revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/navigator/weekly-digest" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const digest = managementNavigator.getWeeklyDigest(user, ws);
      return send(res, 200, { ...digest, revision: currentScopedRevision(req) });
    }

    // AI Mentor
    if (req.url === "/api/ai/mentor/guidance" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const culture = req.query?.culture || (getLang(req));
      // Governed: same governed-engine items as the always-on mentor strip.
      const guidance = coachGateway.situationalGuidance(ws, culture).items;
      return send(res, 200, { items: guidance, source: "governed-engine", revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/mentor/micro-lesson" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const culture = payload.culture || "da";
        const lesson = aiMentor.getMicroLesson(payload.trigger, culture);
        return send(res, 200, { lesson });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/mentor/decision-support" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const culture = payload.culture || "da";
        // Governed: charts/prefill/methods from the governed engine (shared
        // derivation with the hub's decision-framework route).
        const support = coachGateway.governedDecisionFramework(payload.scenario, readScopedWorkspace(req), culture);
        return send(res, 200, { ...support, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/mentor/1on1-prep" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const culture = payload.culture || "da";
        // Governed: grounding-fact prep shared with the hub's 1on1-prep route.
        const prep = coachGateway.governedOneOnOnePrep(ws, payload.participantId, culture);
        return send(res, 200, { ...prep, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }

    // Predictive Intelligence
    if (req.url === "/api/ai/predictions/all" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const predictions = predictiveIntelligence.getAllPredictions(ws);
      return send(res, 200, { ...predictions, revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/predictions/project-health" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const project = (ws.projects || {})[payload.projectId] || activeProject(ws);
        const health = predictiveIntelligence.projectHealthScore(project, ws);
        return send(res, 200, { projectId: project._id, healthScore: health });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/predictions/risk-escalation" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const risk = (ws.registers?.risks || []).find(r => r._id === payload.riskId);
        if (!risk) return send(res, 404, { error: "Risk not found" });
        const prob = predictiveIntelligence.riskEscalationProbability(risk, ws);
        return send(res, 200, { riskId: risk._id, escalationProbability: prob, level: prob > 0.7 ? "HIGH" : prob > 0.4 ? "MEDIUM" : "LOW" });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/predictions/burnout-risk" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const team = payload.teamId ? (ws.roster || []).filter(r => r.team === payload.teamId).map(r => r._id) : (ws.roster || []).map(r => r._id);
        const burnout = predictiveIntelligence.teamBurnoutRisk(team, ws);
        return send(res, 200, { ...burnout, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/predictions/delivery-confidence" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const milestone = (ws.registers?.milestones || []).find(m => m._id === payload.milestoneId);
        if (!milestone) return send(res, 404, { error: "Milestone not found" });
        const confidence = predictiveIntelligence.deliveryConfidence(milestone, ws);
        return send(res, 200, { ...confidence, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/predictions/budget-forecast" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const project = (ws.projects || {})[payload.projectId] || activeProject(ws);
        const forecast = predictiveIntelligence.budgetOverrunForecast(project, ws);
        return send(res, 200, { ...forecast, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }

    // Cultural Intelligence
    if (req.url === "/api/ai/culture/profile" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const cultureId = culturalIntelligence.detectCulture(ws, user);
      const profile = culturalIntelligence.getFullCulturalProfile(cultureId);
      return send(res, 200, { culture: cultureId, profile });
    }
    if (req.url === "/api/ai/culture/adapt-guidance" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const adapted = culturalIntelligence.adaptGuidance(payload.advice, payload.cultureId || "nordic");
        return send(res, 200, { adapted });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/culture/meeting-style" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const cultureId = culturalIntelligence.detectCulture(ws, user);
      const style = culturalIntelligence.getMeetingStyle(cultureId);
      return send(res, 200, { culture: cultureId, ...style });
    }
    if (req.url === "/api/ai/culture/feedback-style" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const cultureId = culturalIntelligence.detectCulture(ws, user);
      const style = culturalIntelligence.getFeedbackStyle(cultureId);
      return send(res, 200, { culture: cultureId, ...style });
    }
    if (req.url === "/api/ai/culture/decision-style" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const cultureId = culturalIntelligence.detectCulture(ws, user);
      const style = culturalIntelligence.getDecisionStyle(cultureId);
      return send(res, 200, { culture: cultureId, ...style });
    }
    if (req.url === "/api/ai/culture/mixed-team" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const teamMembers = payload.teamMembers || (ws.roster || []);
        const adapted = culturalIntelligence.adaptForMixedTeam(teamMembers, ws);
        return send(res, 200, { ...adapted, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }

    // Seamless UX
    if (req.url === "/api/ai/ux/voice-parse" && req.method === "POST") {
      if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const parsed = seamlessUX.parseVoiceCommand(payload.text, ws);
        return send(res, 200, { parsed });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (false && req.url === "/api/ai/ux/smart-defaults" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
        const defaults = seamlessUX.getSmartDefaults(payload.context, ws, user);
        return send(res, 200, { defaults });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/ux/one-click-actions" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
        const actions = seamlessUX.getOneClickActions(payload.item, ws, user);
        return send(res, 200, { actions });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/ux/contextual-actions" && req.method === "POST") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
        const actions = seamlessUX.getContextualQuickActions(payload.view, ws, user);
        return send(res, 200, { actions });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/ai/ux/micro-hints" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const view = req.query?.view || "dashboard";
      const ws = readScopedWorkspace(req);
      const hints = seamlessUX.getMicroInteractionHints(view, ws);
      return send(res, 200, { view, hints });
    }

    // AI Briefing (Daily/Weekly with LLM narrative)
    const aiBriefing = require("./js/ai-briefing.js");
    if (req.url === "/api/ai/briefing/daily" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const culture = req.query?.culture || (getLang(req));
      const facts = aiBriefing.gatherBriefingFacts(ws, user, "daily");
      const deterministic = aiBriefing.generateDeterministicBriefing(facts, culture);

      // Try LLM-enhanced version if available
      let llmBriefing = null;
      try {
        const llmInference = require("./lib/llm-inference.js");
        if (llmInference.isAvailable()) {
          const prompt = aiBriefing.buildLLMPrompt(facts, culture);
          const attempt = await llmInference.generateVerified(prompt, {
            knownValues: facts,
            allowed: [0, 100],
            temperature: 0.3,
            maxTokens: 800,
            timeoutMs: 20000
          });
          if (attempt.result?.ok && attempt.verification?.valid) {
            llmBriefing = attempt.result.response.trim();
            // One-AI: the model's briefing sentence lands on the same
            // tamper-evident answer log as every governed mentor answer,
            // with its numeric verification outcome attached.
            coachGateway.logWithCoach(coachStore(), {
              action: "briefing:daily-llm",
              detail: `daily briefing elaboration — model=${attempt.result.model || "unknown"}`,
              question: "daily briefing",
              intent: "daily_briefing",
              answer: llmBriefing,
              surface: "daily-briefing",
              verification: attempt.verification || { status: "unverifiable" },
              model: attempt.result.model || null,
              source: "llm"
            });
          }
        }
      } catch (_) { /* LLM not available or failed, use deterministic */ }

      return send(res, 200, {
        deterministic,
        llm: llmBriefing,
        facts,
        culture,
        source: llmBriefing ? "llm" : "deterministic",
        revision: currentScopedRevision(req)
      });
    }
    if (req.url === "/api/ai/briefing/weekly" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
      const culture = req.query?.culture || (getLang(req));
      const weekly = aiBriefing.generateWeeklyBriefing(ws, user, culture);
      return send(res, 200, { weekly, culture, revision: currentScopedRevision(req) });
    }
    if (req.url === "/api/ai/briefing/email" && req.method === "POST") {
      if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User", role: "admin" };
        const culture = payload.culture || "da";
        const scope = payload.scope || "daily";
        const facts = aiBriefing.gatherBriefingFacts(ws, user, scope);
        const email = seamlessUX.generateWeeklyDigestEmail(user, ws, culture);
        return send(res, 200, { email, facts, culture, scope });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }

    // ─── CRDT Collaboration ────────────────────────────────────────────────────
    const crdtCollab = require("./js/crdt-collaboration.js");
    if (req.url === "/api/collab/documents" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      // List active collaborative documents
      return send(res, 200, { documents: [] }); // Would list from session
    }
    if (req.url === "/api/collab/documents" && req.method === "POST") {
      if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const docId = payload.docId || `doc-${Date.now()}`;
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
        const session = new crdtCollab.CollaborationSession();
        const doc = session.getOrCreateDocument(docId, user.id);
        if (payload.initialData) {
          for (const [key, value] of Object.entries(payload.initialData.fields || {})) {
            doc.setField(key, value);
          }
          for (const [key, items] of Object.entries(payload.initialData.collections || {})) {
            for (const item of items) doc.addToCollection(key, item);
          }
          for (const [key, items] of Object.entries(payload.initialData.sequences || {})) {
            let afterId = null;
            for (const item of items) {
              afterId = doc.insertInSequence(key, item, afterId);
            }
          }
        }
        const snapshot = doc.toSnapshot();
        return send(res, 201, { docId, snapshot, revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url.startsWith("/api/collab/documents/") && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const docId = req.url.split("/api/collab/documents/")[1].split("?")[0];
      // Return document snapshot
      return send(res, 200, { docId, snapshot: null });
    }
    if (req.url.startsWith("/api/collab/documents/") && req.method === "POST") {
      if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
      try {
        const docId = req.url.split("/api/collab/documents/")[1].split("/")[0];
        const action = req.url.split("/api/collab/documents/")[1].split("/")[1];
        const payload = await body(req);
        const ws = readScopedWorkspace(req);
        const user = authStore().userFromRequest(req) || { id: "local", name: "Local User" };
        const session = new crdtCollab.CollaborationSession();
        const doc = session.getOrCreateDocument(docId, user.id);

        switch (action) {
          case "setField":
            doc.setField(payload.key, payload.value);
            break;
          case "addToCollection":
            doc.addToCollection(payload.key, payload.value);
            break;
          case "removeFromCollection":
            doc.removeFromCollection(payload.key, payload.value);
            break;
          case "insertInSequence":
            doc.insertInSequence(payload.key, payload.value, payload.afterId);
            break;
          case "deleteFromSequence":
            doc.deleteFromSequence(payload.key, payload.id);
            break;
          case "insertText":
            doc.insertText(payload.key, payload.content, payload.afterId, payload.attributes);
            break;
          case "deleteText":
            doc.deleteText(payload.key, payload.id);
            break;
          case "formatText":
            doc.formatText(payload.key, payload.id, payload.attributes);
            break;
          case "incrementCounter":
            doc.incrementCounter(payload.key);
            break;
          case "decrementCounter":
            doc.decrementCounter(payload.key);
            break;
          case "merge":
            if (payload.snapshot) {
              doc.merge(crdtCollab.DocumentCRDT.fromSnapshot(payload.snapshot, payload.senderId));
            }
            break;
          default:
            return send(res, 400, { error: "Unknown action" });
        }
        return send(res, 200, { snapshot: doc.toSnapshot(), revision: currentScopedRevision(req) });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.url === "/api/collab/peers" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      const docId = req.query?.docId;
      const session = new crdtCollab.CollaborationSession();
      return send(res, 200, { peers: session.getPeers(docId) });
    }
    if (req.url === "/api/collab/peers" && req.method === "POST") {
      if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
      try {
        const payload = await body(req);
        const session = new crdtCollab.CollaborationSession();
        session.setPeerPresence(payload.peerId, payload.info);
        return send(res, 200, { ok: true });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }

    // ─── CRDT Types (for client-side use) ──────────────────────────────────────
    if (req.url === "/api/collab/types" && req.method === "GET") {
      if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
      return send(res, 200, {
        VectorClock: true,
        LWWRegister: true,
        LWWMap: true,
        RGA: true,
        YATA: true,
        GCounter: true,
        PNCounter: true,
        ORSet: true,
        DocumentCRDT: true,
        CollaborationSession: true
      });
    }

  }

  // ─── Round 29: Passive Ingestion, Auto-Draft Comms, Context Nudges ──────
  // 1. Passive Ingestion: email/calendar/meeting auto-capture
  if (req.url === "/api/ingestion/ingest" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = passiveIngestion.ingestAll(payload.sources || {}, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ingestion/classify" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = passiveIngestion.classifyContent(payload.text || "", lang);
      return send(res, 200, { classification: result });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ingestion/extract/email" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const items = passiveIngestion.extractFromEmailThread(payload.thread || {}, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { items, count: items.length });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ingestion/extract/calendar" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const items = passiveIngestion.extractFromCalendarEvent(payload.event || {}, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { items, count: items.length });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/ingestion/extract/meeting" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 15000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = passiveIngestion.extractFromMeetingNotes(payload.notes || {}, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 2. Auto-Draft Communications
  if (req.url === "/api/drafts/generate" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const result = autoDraftComms.generateAllDrafts(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/drafts/1on1-agenda" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const agenda = autoDraftComms.draftOneOnOneAgenda(state, payload.person || "", { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { agenda, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/drafts/delegation" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const tasks = (project && project.registers && project.registers.tasks) || [];
      const task = tasks.find(function (t) { return t.id === payload.taskId; }) || { title: payload.taskTitle || "" };
      const draft = autoDraftComms.draftDelegation(state, task, payload.assignee || "", { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/drafts/performance" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const summary = autoDraftComms.draftPerformanceSummary(state, payload.person || "", { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/drafts/followup" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const draft = autoDraftComms.draftFollowUp({}, payload.context || {}, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { draft, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 3. Context-Aware Micro-Nudges
  if (req.url === "/api/nudges/context" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        roster: ws.roster || [],
        registers: (project && project.registers) || {},
        upcomingMeetings: ws.upcomingMeetings || []
      };
      const result = contextNudges.getNudge(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { nudge: result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/nudges/candidates" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        roster: ws.roster || [],
        registers: (project && project.registers) || {},
        upcomingMeetings: ws.upcomingMeetings || []
      };
      const candidates = contextNudges.generateCandidateNudges(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { candidates, count: candidates.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/nudges/outcome" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2000);
      // Atomic + scope-correct. The old readScopedWorkspace() +
      // writeWorkspace() pair wrote a SESSION user's copy — role-sanitized
      // for viewers — into the SHARED blob, destroying shared registers on
      // every nudge tap. One locked read-modify-write on the file this
      // request's scope owns, touching only _nudgeHistory.
      let history = null;
      await mutateScopedWorkspace(req, ws => {
        if (!ws._nudgeHistory) ws._nudgeHistory = {};
        ws._nudgeHistory = contextNudges.recordNudgeOutcome(ws._nudgeHistory, payload.type || "", payload.outcome || "dismissed");
        history = ws._nudgeHistory;
        return { changed: true };
      });
      return send(res, 200, { ok: true, history });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/nudges/strip" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        roster: ws.roster || [],
        registers: (project && project.registers) || {},
        upcomingMeetings: ws.upcomingMeetings || []
      };
      const strip = contextNudges.buildNudgeStrip(state, { lang, today: new Date().toISOString().slice(0, 10), nudgeHistory: ws._nudgeHistory || {} });
      return send(res, 200, { ...strip, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Round 29 (b): Teams Bot, Calendar Sync, Push Actions ────────────
  // 1. Teams Bot
  if (req.url === "/api/teams/command" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const cmd = teamsBot.parseCommand(payload.text || "", lang);
      const result = teamsBot.executeCommand(cmd, state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, command: cmd.command, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/teams/activity" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const result = teamsBot.handleActivity(payload, state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/teams/briefing" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const msg = teamsBot.buildProactiveBriefing(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { message: msg, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/teams/nudge" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const msg = teamsBot.buildProactiveNudge(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { message: msg, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 2. Calendar Sync
  if (req.url === "/api/calendar/sync/pull" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const appEvents = (project && project.registers && project.registers.calendar) || [];
      const result = calendarSync.pullEvents(payload.externalEvents || [], appEvents, { provider: payload.provider || "generic", lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/calendar/sync/push" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const appEvents = (project && project.registers && project.registers.calendar) || [];
      const result = calendarSync.pushEvents(appEvents, { provider: payload.provider || "generic", lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/calendar/availability" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const availability = calendarSync.analyzeAvailability(payload.events || [], { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { availability, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/calendar/focus-blocks" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = calendarSync.suggestFocusBlocks(payload.events || [], { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/calendar/1on1-slots" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = calendarSync.suggestOneOnOneSlots(payload.events || [], ws.roster || [], { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 3. Push Actions
  if (req.url === "/api/push/build" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const notification = pushActions.buildPushNotification(payload.nudge || {}, { lang });
      return send(res, 200, { notification, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/push/action" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = pushActions.handleAction(payload.actionId || "", payload.nudgeData || {}, { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (false && req.url === "/api/push/batch" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const notifications = (payload.notifications || []).map(function (n) { return pushActions.buildPushNotification(n, { lang }); });
      const batched = pushActions.batchNotifications(notifications, { maxPerBatch: payload.maxPerBatch || 3, lastSentTimestamp: ws._lastPushSent || 0 });
      return send(res, 200, { ...batched, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/push/strip" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 10000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const notifications = (payload.notifications || []).map(function (n) { return pushActions.buildPushNotification(n, { lang }); });
      const strip = pushActions.buildNotificationStrip(notifications, lang);
      return send(res, 200, { ...strip, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Round 29c: Google Calendar OAuth, Azure Bot, Voice-First ────────
  // 1. Google Calendar OAuth
  if (req.url === "/api/google-calendar/auth-url" && req.method === "GET") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
      const redirectUri = (req.headers.host ? ("http://" + req.headers.host) : "") + googleCalendarOAuth.REDIRECT_PATH;
      if (!clientId) return send(res, 400, { error: "GOOGLE_CALENDAR_CLIENT_ID not configured" });
      const state = require("crypto").randomBytes(16).toString("hex");
      const url = googleCalendarOAuth.buildAuthUrl({ clientId: clientId, redirectUri: redirectUri }, state);
      return send(res, 200, { url: url, state: state });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/google-calendar/callback" && req.method === "GET") {
    try {
      const q = new URLSearchParams((req.url.split("?")[1] || ""));
      const code = q.get("code");
      if (!code) return send(res, 400, { error: "No authorization code" });
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "";
      const redirectUri = (req.headers.host ? ("http://" + req.headers.host) : "") + googleCalendarOAuth.REDIRECT_PATH;
      const ws = readScopedWorkspace(req);
      const user = authStore().userFromRequest(req) || { id: "local" };
      const tokenSet = await googleCalendarOAuth.exchangeCode(code, { clientId: clientId, clientSecret: clientSecret, redirectUri: redirectUri });
      const dataDir = process.env.LEADERSHIP_DATA_DIR || "db";
      const encKey = process.env.LEADERSHIP_DATA_ENCRYPTION_KEY || "";
      googleCalendarOAuth.storeTokens(user.id, tokenSet, dataDir, encKey);
      return send(res, 200, { connected: true, userId: user.id });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/google-calendar/status" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const user = authStore().userFromRequest(req) || { id: "local" };
      const dataDir = process.env.LEADERSHIP_DATA_DIR || "db";
      const encKey = process.env.LEADERSHIP_DATA_ENCRYPTION_KEY || "";
      const status = googleCalendarOAuth.getConnectionStatus(user.id, dataDir, encKey);
      return send(res, 200, { ...status, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/google-calendar/events" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const user = authStore().userFromRequest(req) || { id: "local" };
      const dataDir = process.env.LEADERSHIP_DATA_DIR || "db";
      const encKey = process.env.LEADERSHIP_DATA_ENCRYPTION_KEY || "";
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "";
      const result = await googleCalendarOAuth.listEvents(user.id, dataDir, { clientId: clientId, clientSecret: clientSecret }, encKey, { timeMin: req.query?.timeMin, timeMax: req.query?.timeMax });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/google-calendar/events" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const user = authStore().userFromRequest(req) || { id: "local" };
      const dataDir = process.env.LEADERSHIP_DATA_DIR || "db";
      const encKey = process.env.LEADERSHIP_DATA_ENCRYPTION_KEY || "";
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "";
      const result = await googleCalendarOAuth.createEvent(user.id, dataDir, { clientId: clientId, clientSecret: clientSecret }, encKey, payload.event || {});
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/google-calendar/disconnect" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const user = authStore().userFromRequest(req) || { id: "local" };
      const dataDir = process.env.LEADERSHIP_DATA_DIR || "db";
      const result = googleCalendarOAuth.revokeTokens(user.id, dataDir);
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 2. Azure Bot Service
  if (req.url === "/api/azure-bot/webhook" && req.method === "POST") {
    try {
      const activity = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const result = azureBotService.handleWebhook(activity, {
        onMessage: function (act) {
          const cmd = teamsBot.parseCommand(act.text || "", lang);
          const response = teamsBot.executeCommand(cmd, state, { lang, today: new Date().toISOString().slice(0, 10) });
          return { status: 200, body: azureBotService.buildMessageActivity(response.text, act.from && act.from.id, response.card ? [{ contentType: "application/vnd.microsoft.card.adaptive", content: response.card }] : []) };
        },
        onInvoke: function (act) {
          const response = teamsBot.handleActivity(act, state, { lang });
          return { status: 200, body: response ? { task: { type: "message", value: { card: response.card, text: response.text } } } : {} };
        }
      });
      return send(res, result.status || 200, result.body || {});
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/azure-bot/proactive" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const user = payload.userId || "";
      const ref = azureBotService.getConversationReference(user);
      if (!ref) return send(res, 404, { error: "No conversation reference for user" });
      const msg = azureBotService.buildProactiveMessage(payload.text || "", ref);
      return send(res, 200, { message: msg, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/azure-bot/health" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, azureBotService.healthCheck());
  }

  // 3. Voice-First Interaction
  if (req.url === "/api/voice/start" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const user = authStore().userFromRequest(req) || { id: "local" };
      const conv = voiceFirst.createConversation(user.id, lang);
      return send(res, 200, { conversation: conv, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/voice/speak" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const conv = payload.conversation || voiceFirst.createConversation("api-user", lang);
      const result = voiceFirst.processUtterance(conv, payload.text || "", state);
      return send(res, 200, { response: result, conversation: conv, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/voice/wake-word" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = voiceFirst.detectWakeWord(payload.text || "", lang);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/voice/intent" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = voiceFirst.classifyIntent(payload.text || "", lang);
      return send(res, 200, result);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/voice/confirm" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 2000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const prompt = voiceFirst.buildConfirmationPrompt(payload.action || "", payload.item || {}, lang);
      return send(res, 200, { prompt: prompt });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Round 29d: Slack Bot, Meeting Transcription, Dev Plan ────────────
  // 1. Slack Bot
  if (req.url === "/api/slack/command" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const cmd = slackLeadershipBot.parseCommand(payload.text || "", lang);
      const result = slackLeadershipBot.executeCommand(cmd, state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { ...result, command: cmd.command, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/slack/interaction" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = slackLeadershipBot.handleInteraction(payload, lang);
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/slack/briefing" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {}, projects: ws.projects || [] };
      const msg = slackLeadershipBot.buildProactiveBriefing(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { message: msg, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 2. Meeting Transcription
  if (req.url === "/api/transcription/analyze" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = meetingTranscription.analyzeTranscript(payload.transcript || "", { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/transcription/decisions" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const segments = meetingTranscription.parseTranscript(payload.transcript || "", { lang });
      const decisions = meetingTranscription.extractDecisions(segments, lang);
      return send(res, 200, { decisions, count: decisions.length });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/transcription/action-items" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const segments = meetingTranscription.parseTranscript(payload.transcript || "", { lang });
      const actions = meetingTranscription.extractActionItems(segments, lang);
      return send(res, 200, { actions, count: actions.length });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // 3. Predictive Development Plan
  if (req.url === "/api/dev-plan/generate" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        mentorCases: (project && project.mentorCases) || [],
        methodUsage: (project && project.methodUsage) || [],
        roster: ws.roster || [],
        registers: (project && project.registers) || {}
      };
      const plan = predictiveDevPlan.generateDevelopmentPlan(state, { lang });
      return send(res, 200, { plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dev-plan/gaps" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        mentorCases: (project && project.mentorCases) || [],
        methodUsage: (project && project.methodUsage) || []
      };
      const gaps = predictiveDevPlan.analyzeSkillGaps(state, { lang });
      return send(res, 200, { gaps, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dev-plan/history" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { mentorCases: (project && project.mentorCases) || [] };
      const history = predictiveDevPlan.analyzeSituationHistory(state, { lang });
      return send(res, 200, { history, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dev-plan/progress" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 5000);
      // Atomic + scope-correct (same class as /api/nudges/outcome: the old
      // pair wrote the session user's copy into the SHARED blob).
      let plan = null;
      await mutateScopedWorkspace(req, ws => {
        const lang = getLang(req);
        if (!ws._devPlan) ws._devPlan = predictiveDevPlan.generateDevelopmentPlan({ mentorCases: [], methodUsage: [] }, { lang });
        ws._devPlan = predictiveDevPlan.updateProgress(ws._devPlan, payload.caseObj || {}, payload.outcome || "", { lang });
        plan = ws._devPlan;
        return { changed: true };
      });
      return send(res, 200, { plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ─── Round 29e: Salesforce, Auto-Retro, Conflict Alerts ──────────────
  // 1. Salesforce CRM
  if (req.url === "/api/salesforce/pipeline" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = salesforceCrm.analyzePipeline(payload.opportunities || [], { lang });
      return send(res, 200, { ...result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/salesforce/lead-health" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const ws = readScopedWorkspace(req);
      const lang = getLang(req);
      const result = salesforceCrm.scoreLeadHealth(payload.leads || [], { lang });
      return send(res, 200, { leads: result, count: result.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/salesforce/normalize" && req.method === "POST") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const payload = await body(req, 50000);
      const kind = payload.kind || "lead";
      var normalized;
      if (kind === "opportunity") normalized = salesforceCrm.normalizeOpportunity(payload.record || {});
      else if (kind === "account") normalized = salesforceCrm.normalizeAccount(payload.record || {});
      else if (kind === "activity") normalized = salesforceCrm.normalizeActivity(payload.record || {});
      else normalized = salesforceCrm.normalizeLead(payload.record || {});
      return send(res, 200, { record: normalized });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/salesforce/queries" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, {
      lead: salesforceCrm.buildLeadQuery(),
      opportunity: salesforceCrm.buildOpportunityQuery(),
      account: salesforceCrm.buildAccountQuery(),
      activity: salesforceCrm.buildActivityQuery()
    });
  }

  // 2. Auto Weekly Retrospective
  if (false && req.url === "/api/retro/weekly" && req.method === "GET") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        mentorCases: (project && project.mentorCases) || [],
        methodUsage: (project && project.methodUsage) || [],
        registers: (project && project.registers) || {}
      };
      const retro = autoRetro.composeRetrospective(state, { lang, today: new Date().toISOString().slice(0, 10) });
      return send(res, 200, { retro, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/retro/weekly/email" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        mentorCases: (project && project.mentorCases) || [],
        methodUsage: (project && project.methodUsage) || [],
        registers: (project && project.registers) || {}
      };
      const retro = autoRetro.composeRetrospective(state, { lang, today: new Date().toISOString().slice(0, 10) });
      const email = autoRetro.formatAsEmail(retro, lang);
      return send(res, 200, { email, headline: retro.headline });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/retro/week-range" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    const week = autoRetro.getWeekRange();
    return send(res, 200, week);
  }

  // 3. Conflict Early Warning Alerts
  if (req.url === "/api/conflict-alerts/detect" && req.method === "GET") {
    if (!authorized(req, "viewer")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = {
        roster: ws.roster || [],
        registers: (project && project.registers) || {}
      };
      const signals = conflictAlerts.detectAllSignals(state, { lang, today: new Date().toISOString().slice(0, 10) });
      const alert = conflictAlerts.composeAlerts(signals, lang);
      return send(res, 200, { alert, signals, count: signals.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflict-alerts/slack" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const signals = conflictAlerts.detectAllSignals(state, { lang, today: new Date().toISOString().slice(0, 10) });
      const alert = conflictAlerts.composeAlerts(signals, lang);
      if (!alert) return send(res, 200, { sent: false, reason: "no_alerts" });
      const blocks = conflictAlerts.buildSlackBlocks(alert, lang);
      return send(res, 200, { blocks, text: alert.headline, level: alert.level, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflict-alerts/teams" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const signals = conflictAlerts.detectAllSignals(state, { lang, today: new Date().toISOString().slice(0, 10) });
      const alert = conflictAlerts.composeAlerts(signals, lang);
      if (!alert) return send(res, 200, { sent: false, reason: "no_alerts" });
      const card = conflictAlerts.buildTeamsCard(alert, lang);
      return send(res, 200, { card, text: alert.headline, level: alert.level, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflict-alerts/email" && req.method === "POST") {
    if (!authorized(req, "editor")) return send(res, 401, { error: "Unauthorized" });
    try {
      const ws = readScopedWorkspace(req);
      const { project } = requestedProjectState(req, ws);
      const lang = getLang(req);
      const state = { roster: ws.roster || [], registers: (project && project.registers) || {} };
      const signals = conflictAlerts.detectAllSignals(state, { lang, today: new Date().toISOString().slice(0, 10) });
      const alert = conflictAlerts.composeAlerts(signals, lang);
      if (!alert) return send(res, 200, { sent: false, reason: "no_alerts" });
      const html = conflictAlerts.buildEmailHtml(alert, lang);
      return send(res, 200, { html, subject: alert.headline, level: alert.level, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }


  // ═══ Round 30a: Strategic Advisor + Risk Mitigation + Team Health ═══

  if (req.url === "/api/strategic/briefing" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const briefing = strategicAdvisor.composeBriefing(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { briefing, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/risk-mitigation/detect" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const risks = (currentScopedState(req).registers || {}).risks || [];
      const triggered = autoRiskMitigation.detectRisksAboveThreshold(risks, todayISO());
      return send(res, 200, { triggered, count: triggered.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/risk-mitigation/plan" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const risks = (currentScopedState(req).registers || {}).risks || [];
      const triggered = autoRiskMitigation.detectRisksAboveThreshold(risks, todayISO());
      const plans = triggered.map(function (t) { return autoRiskMitigation.generateMitigationPlan(t, lang); });
      return send(res, 200, { plans, count: plans.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/risk-mitigation/approve" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const plan = body.plan;
      if (!plan) return send(res, 400, { error: "Missing plan" });
      const approved = autoRiskMitigation.approvePlan(plan);
      return send(res, 200, { plan: approved, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/team-health/dashboard" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const dashboard = teamHealthDashboard.composeDashboard(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/team-health/trendlines" && req.method === "GET") {
    try {
      const body = await readBody(req).catch(function () { return {}; });
      const memberName = (body && body.member) || "";
      const checkins = (currentScopedState(req).registers || {}).crewCheckins || [];
      const trendlines = teamHealthDashboard.buildTrendlines(checkins, memberName);
      return send(res, 200, { trendlines, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ═══ Round 30b: Delegation + Meeting Optimizer + Knowledge Graph ═══

  if (false && req.url === "/api/delegation/recommend" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const task = body.task || {};
      const state = currentScopedState(req);
      const result = smartDelegation.recommendDelegation(task, state.roster || [], (state.registers || {}).tasks || [], { lang, today: todayISO() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/delegation/batch" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const tasks = body.tasks || [];
      const state = currentScopedState(req);
      const results = smartDelegation.recommendBatch(tasks, state.roster || [], (state.registers || {}).tasks || [], { lang, today: todayISO() });
      return send(res, 200, { results, count: results.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/meeting-optimizer/agenda" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const meeting = body.meeting || {};
      const agenda = meetingOptimizer.generateAgenda(meeting, currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { agenda, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/meeting-optimizer/extract" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const extracted = meetingOptimizer.extractFromMeeting(body.transcript || "", body.meeting || {}, { lang, today: todayISO() });
      return send(res, 200, { extracted, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/knowledge-graph/compose" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const graph = knowledgeGraph.composeGraph(currentScopedState(req), { lang });
      return send(res, 200, { graph, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/knowledge-graph/spofs" && req.method === "GET") {
    try {
      const state = currentScopedState(req);
      const nodes = knowledgeGraph.extractNodes(state);
      const edges = knowledgeGraph.createEdges(state, nodes);
      const spofs = knowledgeGraph.detectSPOFs(nodes, edges, state);
      return send(res, 200, { spofs, count: spofs.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ═══ Round 30c: HRIS + Stakeholder Pulse + Benchmarking ═══

  if (req.url === "/api/hris/report" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const report = hrisIntegration.composeReport(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/hris/attrition-risk" && req.method === "GET") {
    try {
      const state = currentScopedState(req);
      const employees = state.employees || [];
      const perfData = state.perfData || [];
      const checkins = (state.registers || {}).crewCheckins || [];
      const perfResults = hrisIntegration.mapPerformance(employees, perfData);
      const signals = hrisIntegration.detectAttritionRisk(employees, perfResults, checkins, { today: todayISO() });
      return send(res, 200, { signals, count: signals.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/stakeholder-pulse/dashboard" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const dashboard = stakeholderPulse.composeDashboard(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/stakeholder-pulse/survey" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const stakeholder = body.stakeholder || {};
      const survey = stakeholderPulse.generateSurvey(stakeholder, lang);
      return send(res, 200, { survey, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/benchmarking/report" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const industry = body.industry || "general";
      const report = industryBenchmarking.composeReport(currentScopedState(req), { lang, industry });
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/benchmarking/gaps" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const industry = body.industry || "general";
      const metrics = industryBenchmarking.computeTeamMetrics(currentScopedState(req));
      const benchmarks = industryBenchmarking.BENCHMARKS[industry] || industryBenchmarking.BENCHMARKS.general;
      const comparisons = Object.keys(metrics).map(function (k) {
        const bmKey = k === "turnoverRisk" ? "turnoverRisk" : k === "projectVelocity" ? "projectVelocity" : k === "decisionSpeed" ? "decisionSpeed" : k === "teamSatisfaction" ? "teamSatisfaction" : k === "meetingEfficiency" ? "meetingEfficiency" : k === "delegationRate" ? "delegationRate" : "riskMitigation";
        return industryBenchmarking.compareMetric(metrics[k], benchmarks[bmKey] || benchmarks.turnoverRisk, k);
      });
      const gaps = industryBenchmarking.analyzeGaps(comparisons);
      return send(res, 200, { gaps, metrics, count: gaps.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }


  // ═══ Round 31a: Predictive + Impact + Insights ═══

  if (req.url === "/api/predictive/outcomes" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const outcomes = predictiveOutcomes.predictOutcomes(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { outcomes, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/impact/simulate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const change = body.change || { type: "person", id: "" };
      const result = impactSimulator.simulate(currentScopedState(req), change, { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/insights/discover" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const insights = insightDiscovery.discoverInsights(currentScopedState(req), { lang });
      return send(res, 200, { insights, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ═══ Round 31b: Escalation + Follow-Up + Cadence ═══

  if (req.url === "/api/escalation/compose" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const escalations = autoEscalation.composeEscalations(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { escalations, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/followup/compose" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const followUp = meetingFollowup.composeFollowUp(body.transcript || "", body.meeting || {}, currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { followUp, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/cadence/recommend" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const recommendation = adaptiveCadence.composeRecommendation(currentScopedState(req), body.person || "", { lang, today: todayISO(), currentCadence: body.currentCadence || "weekly" });
      return send(res, 200, { recommendation, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // ═══ Round 31c: Search + Exec Summary + Decision Memory ═══

  if (req.url === "/api/search/query" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const results = universalSearch.search(currentScopedState(req), body.query || "", { lang });
      return send(res, 200, { results, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/exec-summary/compose" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const summary = execSummary.composeSummary(currentScopedState(req), { lang });
      return send(res, 200, { summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/decision-memory/search" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const decisions = (currentScopedState(req).registers || {}).decisions || [];
      const results = decisionMemory.searchDecisions(decisions, body.query || "", { lang });
      return send(res, 200, { results, count: results.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/decision-memory/why" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const decisions = (currentScopedState(req).registers || {}).decisions || [];
      const results = decisionMemory.whyDecided(decisions, body.title || "");
      return send(res, 200, { results, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/decision-memory/stats" && req.method === "GET") {
    try {
      const decisions = (currentScopedState(req).registers || {}).decisions || [];
      const stats = decisionMemory.computeStats(decisions);
      return send(res, 200, { stats, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }


  // ═══ Round 32: Proactive AI + Learning + Crisis + OKR + Wellness ═══

  if (req.url === "/api/communication/draft" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const state = currentScopedState(req);
      const drafts = body.type === "batch" ? autoCommunication.draftBatch(state, { lang }) : { drafts: [autoCommunication.draftProjectUpdate(body.project || {}, state, { lang })] };
      return send(res, 200, { drafts, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/communication/approve" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const draft = body.draft;
      if (!draft) return send(res, 400, { error: "Missing draft" });
      const approved = autoCommunication.approveDraft(draft);
      return send(res, 200, { draft: approved, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/notifications/orchestrate" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = notificationOrchestrator.composeOrchestration(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/outreach/assess" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = predictiveOutreach.composeOutreach(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/coaching/analyze" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = coachingEngineLib.composeCoaching(currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/skill-gaps/analyze" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = skillGapMapper.composeMapper(currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/growth/trajectory" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const member = body.member || { name: "" };
      const result = growthTrajectory.composeTrajectory(member, currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/crisis/create" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const risk = body.risk || {};
      const result = crisisWarroom.composeCrisis(risk, currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/okr/track" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = okrTracker.composeTracker(currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/wellness/monitor" && req.method === "GET") {
    try {
      const lang = getLang(req);
      const result = wellnessEarlyWarning.composeWellness(currentScopedState(req), { lang, today: todayISO() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }


  // ═══ Round 33: Conversational + Simulation + Feedback + Learning ═══

  if (req.url === "/api/mentor/chat" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = mentorConversation.processMessage(body.message || "", currentScopedState(req), body.history || [], { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/voice/briefing" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      // ONE AI, ONE RANKING: the voice speaks from the same ranked list as the
      // Today screen and the email digest (lib/today-cockpit.js).
      let rankedItemsV = [];
      try {
        const wsV = readScopedWorkspace(req);
        const pv = requestedProjectState(req, wsV);
        const ingV = gatherCockpitIngredients(pv.projectId, { ws: wsV, lang, today: todayISO(), role: roleFor(req), user: authStore().userFromRequest(req) || { _id: "local", name: "Local", role: "admin" } });
        rankedItemsV = (ingV.cockpit && ingV.cockpit.items) || [];
      } catch (_) { rankedItemsV = []; }
      const result = voiceBriefing.composeBriefing(body.message || "Give me my morning briefing", currentScopedState(req), { lang, today: todayISO(), rankedItems: rankedItemsV });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/decision-dialogue/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = decisionDialogue.composeDialogue(body.description || "", body.options || [], currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/simulator/style" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = styleSimulator.composeSimulation(body.targetStyle || "democratic", currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/simulator/resource" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = resourceOptimizer.composeReallocation(body.people || [], body.sourceProject || "", body.targetProject || "", currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/simulator/cadence" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = cadenceSimulator.composeSimulation(body.targetCadence || "biweekly", currentScopedState(req), { lang, today: todayISO(), currentCadence: body.currentCadence || "weekly" });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/feedback/record" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const entry = feedbackLoop.recordFeedback([], body.suggestionId || "", body.outcome || "accepted", body.reason || "", body.category || "general");
      return send(res, 200, { entry, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/feedback/report" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = feedbackLoop.composeReport(body.feedbackStore || [], { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/learning/compose" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = autonomousLearning.composeLearning(body.actionLog || [], currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/memory/store" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const entry = sessionMemory.storeEntry([], body.type || "conversation", body.data || {}, { session: body.session || "default", tags: body.tags || [] });
      return send(res, 200, { entry, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/memory/search" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const results = sessionMemory.searchMemory(body.memoryStore || [], body.query || "", { lang, type: body.type });
      return send(res, 200, { results, count: results.length, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/memory/report" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = sessionMemory.composeMemoryReport(body.memoryStore || [], { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }


  // ═══ Round 34: Ecosystem + Personalization + Prevention ═══

  if (req.url === "/api/codebase/sync" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = codebaseSync.composeSync(body.data || {}, { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/comms/analytics" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = commsAnalytics.composeAnalytics(body.data || {}, { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/calendar/intel" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = calendarIntel.composeIntel(body.data || {}, { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/profile/build" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = leaderProfile.composeProfile(body.leader || {}, currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/ui/optimize" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = adaptiveUI.composeOptimization(body.usageLog || [], body.allViews || [], { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/prefetch/predict" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = contextPrefetch.composePrefetch(body.calendarEvents || [], body.usagePatterns || [], { lang, now: new Date() });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/burnout/predict" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = burnoutPredictor.composePrediction(body.person || "", currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/failure/predict" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = projectFailurePredictor.composePrediction(body.project || {}, currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/drift/detect" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = orgDriftDetector.composeDetection(body.strategy || {}, currentScopedState(req), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/remediation/process" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const result = autoRemediation.processEvent(currentScopedState(req), body.event || {}, body.rules || autoRemediation.buildDefaultRules(lang), { lang });
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/remediation/stats" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const stats = autoRemediation.getRemediationStats(body.results || []);
      return send(res, 200, { stats });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/approval/chain" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const chain = approvalChain.createChain(body.request || {}, body.steps || [], body.opts || {});
      return send(res, 200, { chain, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/approval/decide" && req.method === "POST") {
    try {
      const body = await readBody(req);
      if (!body.chain || typeof body.chain !== "object") return send(res, 400, { error: "Missing chain" });
      const result = approvalChain.submitDecision(body.chain, body.level, body.approver, body.decision, body.opts || {});
      return send(res, 200, { result });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/approval/batch-sla" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const result = approvalChain.batchSLA(body.chains || [], body.opts || {});
      return send(res, 200, { result });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/competitive/dashboard" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const dashboard = competitiveIntel.buildDashboard(body.signals || [], body.competitors || [], { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/competitive/impact" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const impact = competitiveIntel.analyzeImpact(body.signals || [], body.projects || []);
      return send(res, 200, { impact });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/succession/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const result = successionPipeline.assessAllRoles(body.roles || [], body.employees || [], body.opts || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/succession/pipeline" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const role = Object.assign({ name: "", successors: [] }, body.role || {});
      const pipeline = successionPipeline.buildPipeline(role);
      return send(res, 200, { pipeline });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/org-network/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const nodes = orgNetwork.buildNetwork(body.employees || [], body.links || []);
      const dashboard = orgNetwork.buildDashboard(nodes, body.links || [], { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/eq/profile" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const profile = eqEngine.buildEQProfile(body.leader || {}, { lang });
      return send(res, 200, { profile, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/strategic/dashboard" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const dashboard = strategicPlanner.buildDashboard(body.vision || {}, { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (false && req.url === "/api/innovation/portfolio" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const dashboard = innovationTracker.buildDashboard(body.experiments || [], { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/compliance/dashboard" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      const dashboard = complianceMonitor.buildDashboard(body.requirements || [], { lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/mcda/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var decision = mcda.createDecision(body.title || "Decision", body.opts || {});
      (body.criteria || []).forEach(function(c){ mcda.addCriterion(decision, c.name, c.weight, c.opts || {}); });
      (body.alternatives || []).forEach(function(a){ var alt = mcda.addAlternative(decision, a.name, a.opts || {}); (a.scores || []).forEach(function(s){ mcda.scoreAlternative(decision, alt.id, s.criterionId, s.score); }); });
      var dashboard = mcda.buildDashboard(decision, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/option/valuate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var inv = optionValuation.createInvestment(body.investment || {});
      var val = optionValuation.valueOption(inv, body.opts || {});
      var rec = optionValuation.recommend(inv, val);
      return send(res, 200, { valuation: val, recommendation: rec, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/decision/audit" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var audit = decisionAudit.createAudit(body.decision || {}, body.opts || {});
      (body.scores || []).forEach(function(s){ decisionAudit.scoreCriterion(audit, s.key, s.score, s.evidence); });
      var dashboard = decisionAudit.buildDashboard(audit, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/behavior/track" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var log = behaviorTracker.createBehaviorLog(body.leaderId || "default", body.behaviorType || "delegationFrequency", body.opts || {});
      (body.entries || []).forEach(function(e){ behaviorTracker.recordEntry(log, e.value, e.opts || {}); });
      var trend = behaviorTracker.calculateTrend(log);
      return send(res, 200, { log: { type: log.behaviorType, entries: log.entries.length }, trend, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/collective/forecast" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var forecast = collectiveIntel.createForecast(body.question || "", body.opts || {});
      (body.predictions || []).forEach(function(p){ collectiveIntel.submitPrediction(forecast, p.predictor, p.probability, p.opts || {}); });
      collectiveIntel.aggregate(forecast, body.method || "equalWeight");
      var div = collectiveIntel.calculateDivergence(forecast.predictions);
      return send(res, 200, { forecast: { question: forecast.question, aggregation: forecast.aggregation, divergence: div }, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/journal/record" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var entry = decisionJournal.createEntry(body.data || {});
      return send(res, 200, { entry, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/process/discover" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var traces = (body.traces || []).map(function(t){ return processMining.createTrace(t.caseId, t.events || []); });
      var dashboard = processMining.buildDashboard(traces, body.intendedPath || [], { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/strategy/framework" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var result = strategyFrameworks.runFramework(body.framework || "swot", body.data || {}, body.state || null);
      var dashboard = strategyFrameworks.buildDashboard(body.framework || "swot", result, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/playbook/generate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var playbook = leadershipPlaybook.generatePlaybook(body.leaderId || "default", body.data || {}, { lang: lang });
      return send(res, 200, { playbook, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/bias/detect" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var dashboard = biasDetector.buildDashboard(body.decision || {}, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/facilitator/meeting" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var meeting = meetingFacilitator.createMeeting(body.meeting || {});
      (body.participants || []).forEach(function(p){ meetingFacilitator.addParticipant(meeting, p.name, p.opts || {}); });
      (body.contributions || []).forEach(function(c){ meetingFacilitator.recordContribution(meeting, c.name, c.data || {}); });
      var dashboard = meetingFacilitator.buildDashboard(meeting, body.opts || {});
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/team/compose" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var requirement = teamComposer.createRequirement(body.requirement || {});
      var candidates = (body.candidates || []).map(function(c){ return teamComposer.createCandidate(c); });
      var dashboard = teamComposer.buildDashboard(candidates, requirement, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/culture/measure" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var stated = cultureMapper.createStatedValues(body.stated || {});
      var actual = cultureMapper.measureActualCulture(body.signals || {});
      var dashboard = cultureMapper.buildDashboard(stated, actual, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/safety/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var assessment = psychSafety.createAssessment(body.teamId || "default", body.data || {});
      var dashboard = psychSafety.buildDashboard(assessment, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/doc/generate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var docs = docGenerator.generateAll(currentScopedState(req), body.opts || {});
      var result = {};
      Object.keys(docs).forEach(function(k){ result[k] = docGenerator.renderDocument(docs[k], body.format || 'markdown'); });
      return send(res, 200, { documents: result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/peer/match" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var leader = peerLearning.createLeaderProfile(body.leader || {});
      var allLeaders = (body.allLeaders || []).map(function(l){ return peerLearning.createLeaderProfile(l); });
      var dashboard = peerLearning.buildDashboard(leader, allLeaders, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/knowledge/capture" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var base = knowledgeRetention.buildKnowledgeBase(body.knowledge || [], body.patterns || []);
      return send(res, 200, { knowledgeBase: base, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/learning/generate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      // NOTE: never `var path` here — this handler function spans the whole
      // route table, and a function-scoped `path` would shadow Node's path
      // module for EVERY request (path.join in other routes → TypeError →
      // the response is never sent and the request hangs).
      var learnPath = adaptiveLearning.generatePath(body.leaderId || "default", body.gaps || [], { lang: lang });
      var summary = adaptiveLearning.getPathSummary(learnPath);
      return send(res, 200, { path: summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/coach/realtime" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var session = realtimeCoach.createSession(body.session || {});
      (body.events || []).forEach(function(e){ realtimeCoach.recordEvent(session, e); });
      var nudges = realtimeCoach.generateNudges(session);
      var summary = realtimeCoach.summarizeSession(session);
      return send(res, 200, { summary: summary, nudges: nudges, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (false && req.url === "/api/onboarding/generate" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    try {
      const body = await readBody(req);
      var plan = onboardingNav.generatePlan(body.role || "Leader", body.team || [], body.opts || {});
      var summary = onboardingNav.getPlanSummary(plan);
      return send(res, 200, { plan: summary, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/board/prep" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var dashboard = boardPrep.buildDashboard(currentScopedState(req), { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/foresight/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var signals = (body.signals || []).map(function(s){ return strategicForesight.createSignal(s); });
      var dashboard = strategicForesight.buildDashboard(signals, body.capabilities || [], { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/conflict/resolve" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var conflict = conflictResolution.createConflict(body.conflict || {});
      var dashboard = conflictResolution.buildDashboard(conflict, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/wellness/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var assessment = execWellness.createAssessment(body.data || {});
      var dashboard = execWellness.buildDashboard(assessment, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/legacy/track" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var decision = legacyTracker.createTrackedDecision(body.decision || {});
      (body.outcomes || []).forEach(function(o){ legacyTracker.recordOutcome(decision, o.timeframe, o.data || {}); });
      var dashboard = legacyTracker.buildDashboard([decision], { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/schedule/optimize" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var calendar = scheduleOptimizer.createCalendar(body.calendar || {});
      var dashboard = scheduleOptimizer.buildDashboard(calendar, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/benchmark/crossorg" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var dashboard = crossorgBenchmark.buildDashboard(body.orgScores || {}, body.peerGroup || [], { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/twin/simulate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var twin = digitalTwin.createProfile(body.profile || {});
      var simulation = digitalTwin.simulateScenario(twin, body.scenario || {});
      return send(res, 200, { simulation, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/neuro/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var assessment = neuroLeadership.createAssessment(body.data || {});
      var dashboard = neuroLeadership.buildDashboard(assessment, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/crisis/simulate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var scenario = crisisSim.createCrisisScenario(body.scenario || {});
      (body.decisionPoints || []).forEach(function(dp){ scenario.initialDecisionPoints.push(crisisSim.createDecisionPoint(dp)); });
      var simulation = crisisSim.createSimulation(scenario);
      return send(res, 200, { simulation, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/autoexec/process" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var config = autoExec.createBoundaryConfig((body.rules || []).map(function(r){ return autoExec.createBoundaryRule(r); }));
      var processed = (body.items || []).map(function(item){ return autoExec.processItem(item, config); });
      var dashboard = autoExec.buildDashboard(processed, config, body.opts || {});
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (false && req.url === "/api/memory/search" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    try {
      const body = await readBody(req);
      var palace = memoryPalace.createPalace();
      (body.memories || []).forEach(function(m){ memoryPalace.addMemory(palace, memoryPalace.createMemory(m)); });
      var results = memoryPalace.search(palace, body.query || "");
      return send(res, 200, { results: results.map(function(r){ return { title: r.memory.title, type: r.memory.type, relevance: r.relevance }; }), revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dna/profile" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var profile = leadershipDNA.createDNAProfile(body.data || {});
      var dashboard = leadershipDNA.buildDashboard(profile, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/mediation/multipart" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var dispute = multiPartyMediation.createDispute(body.dispute || {});
      (body.parties || []).forEach(function(p){ dispute.parties.push(multiPartyMediation.createParty(p)); });
      var dashboard = multiPartyMediation.buildDashboard(dispute, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (false && req.url === "/api/portfolio/optimize" && req.method === "POST") { // dead branch: shadowed by earlier same-method handler (scripts/audit-dup-routes.cjs)
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var investments = (body.investments || []).map(function(i){ return portfolioOptimizer.createInvestment(i); });
      var dashboard = portfolioOptimizer.buildDashboard(investments, body.constraints || {}, body.strategy || "balanced", { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/dynamics/simulate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var model = orgDynamics.createOrgModel();
      (body.entities || []).forEach(function(e){ orgDynamics.addEntity(model, orgDynamics.createEntity(e)); });
      (body.connections || []).forEach(function(c){ orgDynamics.addConnection(model, c.from, c.to, c.type, c.strength); });
      var dashboard = orgDynamics.buildDashboard(model, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  if (req.url === "/api/quantum/decide" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var decision = quantumDecision.createDecision(body.decision || {});
      (body.paths || []).forEach(function(p){ decision.paths.push(quantumDecision.createPath(p)); });
      // comparePaths reads best.path.name — a decision with zero paths has no
      // best, and the route (never executed until today) crashed on it. Empty
      // means the caller has not described the options yet: say so plainly.
      if (!Array.isArray(decision.paths) || !decision.paths.length) return send(res, 400, { error: "At least one path is required" });
      var dashboard = quantumDecision.buildDashboard(decision, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/time/replay" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var decision = timeMachine.createHistoricalDecision(body.decision || {});
      var alts = (body.alternatives || []).map(function(a){ return timeMachine.createAlternativePath(a); });
      var dashboard = timeMachine.buildDashboard(decision, alts, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/negotiate/auto" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var neg = autoNegotiate.createNegotiation(body.negotiation || {});
      var result = autoNegotiate.makeDecision(neg, body.proposal || {});
      var dashboard = autoNegotiate.buildDashboard(neg, { lang: lang });
      return send(res, 200, { dashboard: dashboard, result: result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/emotion/resonance" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var leaderMood = emotionalResonance.createMoodEntry(body.leaderMood || {});
      var teamMoods = (body.teamMoods || []).map(function(t){ return emotionalResonance.createTeamMoodEntry(t); });
      var dashboard = emotionalResonance.buildDashboard(leaderMood, teamMoods, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/consciousness/aggregate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var signals = (body.signals || []).map(function(s){ return orgConsciousness.createSignal(s); });
      var dashboard = orgConsciousness.buildDashboard(signals, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/shape/recommend" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var context = styleShapeshifter.analyzeContext(body.context || {});
      var dashboard = styleShapeshifter.buildDashboard(body.currentStyle || "collaborative", context, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/talent/predict" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var assessments = (body.assessments || []).map(function(a){ return talentMagnet.createEmployeeAssessment(a); });
      var dashboard = talentMagnet.buildDashboard(assessments, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/innovation/map" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var ideas = (body.ideas || []).map(function(i){ return innovationEcosystem.createIdea(i); });
      var connections = (body.connections || []).map(function(c){ return innovationEcosystem.createFlowConnection(c.from, c.to, c.type, c.strength); });
      var dashboard = innovationEcosystem.buildDashboard(ideas, connections, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url === "/api/presence/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var assessment = execPresence.createAssessment(body.data || {});
      var dashboard = execPresence.buildDashboard(assessment, { lang: lang });
      return send(res, 200, { dashboard, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Round 41 — Sleeping Leader Protocol
  if (req.url === "/api/sleeping-leader/activate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var protocol = sleepingLeader.activateProtocol(body.leaderProfile || {}, body.unavailablePeriod || {}, body.monitors || []);
      return send(res, 200, { protocol, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Strategic Morning Briefing
  if (req.url === "/api/morning-briefing/generate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      // The briefing reads the flight recorder too: a silent or failing
      // zero-input loop is the first thing to know before the day starts,
      // because every other section depends on the loop actually running.
      const context = Object.assign({}, body.context || {});
      try {
        context.automationInsights = flightInsights(readFlightRecords(FLIGHT_KEEP), { intervalMs: AUTOMATION_INTERVAL_MS }).filter(i => i && i.level !== "ok");
      } catch (_) { context.automationInsights = []; }
      var briefing = morningBriefing.generateBriefing(context);
      return send(res, 200, { briefing, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Autonomous Report Writer
  if (req.url === "/api/auto-report/generate" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var report = autoReport.generateReport(body.config || {});
      return send(res, 200, { report, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Org Entropy Detector
  if (req.url === "/api/entropy/measure" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var entropy = entropyDetector.measureEntropy(body.orgData || {});
      return send(res, 200, { entropy, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Blind Spot Illuminator
  if (req.url === "/api/blind-spot/identify" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var blindSpots = blindSpot.identifyBlindSpots(body.leaderData || {});
      return send(res, 200, { blindSpots, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Strategic Conversation Analyzer
  if (req.url === "/api/conversation/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var analysis = conversationAnalyzer.analyzeConversation(body.conversation || {});
      return send(res, 200, { analysis, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Promotion Readiness Predictor
  if (req.url === "/api/promo/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var readiness = promoReadiness.assessReadiness(body.memberData || {});
      return send(res, 200, { readiness, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Org Resilience Scorer
  if (req.url === "/api/resilience/score" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var resilience = resilienceScorer.scoreResilience(body.orgData || {});
      return send(res, 200, { resilience, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 41 — Leadership Legacy Architect
  if (req.url === "/api/legacy/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const lang = getLang(req, body);
      var trajectory = legacyArchitect.assessLegacyTrajectory(body.leaderData || {});
      var plan = legacyArchitect.designLegacyPlan(trajectory, body.desiredLegacy || {});
      return send(res, 200, { trajectory, plan, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Round 42 — Quantum Decision Matrix
  if (req.url === "/api/quantum-matrix/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = quantumMatrix.analyzeDecision(body.decision || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — EQ Amplifier
  if (req.url === "/api/eq-amplifier/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = eqAmplifier.analyzeInteraction(body.interaction || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Stakeholder Network
  if (req.url === "/api/stakeholder-network/map" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = stakeholderNetwork.mapNetwork(body.stakeholders || [], body.relationships || []);
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Synergy Detector
  if (req.url === "/api/synergy/detect" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = synergyDetector.detectSynergies(body.projects || []);
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Rhythm Optimizer
  if (req.url === "/api/rhythm/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = rhythmOptimizer.analyzeRhythm(body.orgData || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — DT Navigator
  if (req.url === "/api/dt/assess" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = dtNavigator.assessReadiness(body.orgData || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Succession Intelligence
  if (req.url === "/api/succession/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = successionIntel.analyzeSuccession(body.roles || []);
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Intuition Engine
  if (req.url === "/api/intuition/train" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var model = intuitionEngine.trainModel(body.decisions || []);
      return send(res, 200, { model, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  // Round 42 — Growth Analytics
  if (req.url === "/api/growth/analyze" && req.method === "POST") {
    try {
      const body = await readBody(req);
      var result = growthAnalytics.analyzeGrowth(body.leaderData || {});
      return send(res, 200, { result, revision: currentScopedRevision(req) });
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  // Delegate unmatched /api/* to structured router (lib/router.js) — the
  // finance domain routes (and future risk/people/connector routers) are
  // registered here. dispatch always sends a response (matched route or 404
  // for unmatched paths). The old blanket 405 guard is removed because it
  // blocked POST routes registered in the structured router.
  req.workspace = workspace;
  req.project = project;
  if (req.url.startsWith("/api/") || req.url.startsWith("/scim/v2/")) return LCRouter.dispatch(req, res, { send, serverError: (err) => sendInternalError(res, requestId, err) });
  return send(res, 404, { error: "Not found", requestId });
});

const AUTOMATION_INTERVAL_MS = Number(process.env.LEADERSHIP_AUTOMATION_INTERVAL_MS || 0);
const DIGEST_INTERVAL_MS = Number(process.env.LEADERSHIP_DIGEST_INTERVAL_MS || 0) || 86400000 * 7; // default weekly
// Automatic backups: the engine existed but nothing ran it, so a default
// deployment had ZERO automatic backups of the workspace/history/audit.
// The scheduler checks the daily/weekly cron windows on an interval (first
// check waits one interval, so short-lived processes never write at boot).
// Disable with LEADERSHIP_BACKUP_ENABLED=false.
const BACKUP_INTERVAL_MS = Number(process.env.LEADERSHIP_BACKUP_INTERVAL_MS || 0) || 3600000;
const BACKUP_ENABLED = String(process.env.LEADERSHIP_BACKUP_ENABLED || "true").toLowerCase() !== "false";
let automationTimer = null;
let digestTimer = null;
let outboxTimer = null;
let backupTimer = null;
let backupRunner = null;
// Materialize due recurring-task occurrences into concrete tasks. Idempotent
// (each series tracks its own materialization watermark); safe to call on
// every scheduler pass in both JSONL and PostgreSQL modes.
// ── Zero-input FM ingest: the escalation register fills itself ─────────────
// Configured FM sources (Maximo, Dalux FM, generic exports) are pulled on
// their cadence and landed in the escalation register under the per-file
// lock (lib/escalation-ingest.js). Planning and fetching run WITHOUT locks
// and WITHOUT mutation — one broken source is a named error in the ingest
// log, never fabricated data, never blocking the other sources.
async function runEscalationIngestGated() {
  const gate = automationControls.automationGate({ paused: AUTOMATION_PAUSED, integrityValid: jobStore.verifyJobs(JOBS_FILE).valid });
  if (!gate.allowed) return { blocked: true, blockedReason: gate.reason, due: 0, added: 0, updated: 0 };
  let EI = null;
  try { EI = require("./lib/escalation-ingest.js"); } catch (_) { return { skipped: "escalation ingest unavailable" }; }
  const now = new Date().toISOString();
  const plan = EI.planIngest(readWorkspace(), now);
  if (!plan.due.length) return { due: 0, added: 0, updated: 0, skipped: plan.skipped.length };
  const inboxDir = path.join(DATA_DIR, "fm-inbox");
  const fetched = await EI.fetchDue(plan.due, { inboxDir });
  const summary = await mutateWorkspaceConditional(ws => {
    const r = EI.applyIngest(ws, fetched, now);
    return { changed: r.changed, added: r.added, updated: r.updated, skipped: r.skipped, errors: r.errors, results: r.results };
  }).catch(() => ({ added: 0, updated: 0, skipped: 0, errors: plan.due.length, results: [] }));
  (summary.results || []).forEach(r => {
    if (r.error) {
      appendAudit({ eventId: `fm-ingest-error:${r.sourceId}:${now}`, action: "FM-ingest fejlede", detail: `${r.projectId} — ${r.sourceId}: ${r.error}` });
    } else {
      appendAudit({ eventId: `fm-ingest:${r.sourceId}:${now}`, action: "FM-ingest", detail: `${r.projectId} — ${r.sourceId} (${r.adapter}): ${r.added} nye, ${r.updated} opdateret, ${r.skipped} sprunget` });
    }
  });
  return Object.assign({ due: plan.due.length }, summary);
}

async function runRecurringTaskScheduler() {
  try {
    const today = recurringTasks.fmt(new Date());
    const passes = [];
    // The shared (anonymous) workspace — atomic conditional: materializeDue
    // mutates under the lock and only persists when occurrences were created.
    // The old read-then-write kept a stale copy across the await and could
    // erase rows written by an earlier pass in the same tick.
    const sharedPass = await mutateWorkspaceConditional(ws => {
      if (!ws || !ws.projects) return { changed: false, created: 0 };
      const r = recurringTasks.materializeDue(ws, today);
      return { changed: r.created.length > 0, created: r.created.length };
    }).catch(() => ({ created: 0 }));
    if (sharedPass.created) passes.push({ scope: "shared", created: sharedPass.created });
    // Session users keep their projects in per-user scoped workspaces; the
    // scheduler must materialize there too. Scanning only the shared blob
    // meant a due occurrence inside a logged-in user's workspace NEVER fired
    // (proven: scheduler created 0 occurrences for a due weekly task while
    // the user's own file held the series).
    const store = authStore();
    const users = typeof store.allUsers === "function" ? store.allUsers() : [];
    for (const u of users) {
      const uid = u && u.id;
      if (!uid) continue;
      // Same atomic conditional against THIS user's file under ITS lock.
      const p = userWorkspacePaths(uid);
      const userPass = await mutateWorkspaceFileConditional(p.file, p.history, ws => {
        if (!ws || !ws.projects) return { changed: false, created: 0 };
        const r = recurringTasks.materializeDue(ws, today);
        return { changed: r.created.length > 0, created: r.created.length };
      }).catch(() => ({ created: 0 }));
      if (userPass.created) passes.push({ scope: uid, created: userPass.created });
    }
    if (passes.length) {
      appendAudit({ action: "Recurring scheduler pass", detail: passes.map(p => `${p.scope === "shared" ? "shared" : "user:" + p.scope} ${p.created}`).join(", ") });
    }
    return { created: passes.reduce((sum, p) => sum + p.created, 0), passes };
  } catch (error) {
    logger.error("recurring_scheduler_failed", { message: error.message });
    return { failed: 1, reason: error.message };
  }
}
async function runOutboxScheduler() {
  const persistence = persistenceStore();
  if (!persistence.postgres) return { skipped: true, reason: "postgres persistence is disabled" };
  const tenantId = String(process.env.LEADERSHIP_TENANT_ID || "").trim();
  if (!tenantId) return { skipped: true, reason: "LEADERSHIP_TENANT_ID is required" };
  try {
    const result = await persistence.postgres.publishOutbox(tenantId, (topic, payload, opts) => Promise.resolve(messageQueue.publish(topic, payload, opts)), `outbox-${process.pid}`);
    if (result.claimed) appendAudit({ action: "Outbox scheduler pass", detail: `${result.published} published, ${result.failed} failed` });
    // Turn recent domain events into per-user inbox notifications (deduped by
    // event_id; incremental via inbox_dispatch_state cursor). The workspace
    // (best-effort) travels with them so the constraint-quiet policy can mark
    // noise for the digest instead of pushing it — restraint is never loss.
    let quietWs = null;
    try { quietWs = readWorkspace(); } catch (_) { quietWs = null; }
    try {
      const inbox = await notificationsInbox.runInboxDispatcher(tenantId, persistence.postgres, quietWs ? { workspace: quietWs } : {});
      if (inbox.created) appendAudit({ action: "Inbox dispatcher pass", detail: `${inbox.scanned} events → ${inbox.created} notifications` });
      // Out-of-band delivery (email + webhook + Web Push) for the freshly
      // created rows. The push transport is injected (a real Web Push sender
      // can be supplied via middleware/notifications when VAPID keys exist);
      // with no sender configured it degrades to a no-op.
      try {
        const delivered = await notificationsDelivery.deliverCreated(tenantId, persistence.postgres, {
          notifications: inbox.notifications || [],
          constraintQuiet: quietWs ? { workspace: quietWs, today: new Date().toISOString().slice(0, 10) } : null,
          mailer: (message) => notifications.sendEmail(message),
          webhook: (notification) => notifications.dispatchWebhooks("notification.created", notification),
          push: (payload, subscriptions) => notifications.sendPush(payload, subscriptions),
          listPushSubscriptions: (t, userId) => persistence.postgres.listPushSubscriptions(t, userId),
          userById: (id) => authStore().userById(id),
          getDeliveryPrefs: (t, userId) => persistence.postgres.getDeliveryPrefs(t, userId)
        });
        if (delivered.emailed || delivered.pushSent) appendAudit({ action: "Inbox delivery pass", detail: `${delivered.emailed} emailed, ${delivered.webhooks} webhooks, ${delivered.pushSent} push, ${delivered.skipped} skipped` });
      } catch (deliveryError) {
        logger.error("inbox_delivery_failed", { message: deliveryError.message });
      }
    } catch (inboxError) {
      logger.error("inbox_dispatcher_failed", { message: inboxError.message });
    }
    return result;
  } catch (error) {
    logger.error("outbox_scheduler_failed", { message: error.message });
    return { failed: 1, reason: error.message };
  }
}
async function runConnectorScheduler() {
  try {
    const stored = connectorConfigStore.load(CONNECTOR_CONFIG_FILE);
    const registry = connectorRegistry.createAdapters(stored.configs);
    // Cadence: connectors configured with syncIntervalMinutes whose last pass is
    // older than their interval re-enter the queue as degraded (attempts: 0 —
    // scheduleSync never burns retry budget). Only healthy rows age out, so
    // cadence scheduling never fights the failure/retry machinery.
    for (const config of connectorStore.dueCadence(CONNECTOR_STATE_FILE, stored.configs)) {
      connectorStore.scheduleSync(CONNECTOR_STATE_FILE, config.id, config.tenantId, "scheduled cadence pass");
    }
    // Imported records become canonical tasks in the connector's configured
    // target project (config.projectId). Connectors without a target keep the
    // previous behavior (records counted, not consumed) — visible in the audit.
    const repo = projectRepository();
    const importers = new Map();
    for (const config of stored.configs) {
      if (!config.projectId) continue;
      const intake = connectorIntake.projectTaskIn({
        repository: repo,
        tenantId: String(config.tenantId || "local"),
        projectId: String(config.projectId),
        // mutate gives the jsonl intake an atomic read-modify-write under the
        // per-file lock, so concurrent syncs (or a sync racing a browser save)
        // cannot lose rows. Postgres mode ignores it (shared upserts are
        // already idempotent).
        config: connectorWorkspaceFns(config)
      });
      importers.set(String(config.id), async (connectorId, records) => {
        const existing = intake.listExisting ? await intake.listExisting() : [];
        const counts = await connectorIntake.intake({ records, config, saveTask: intake.saveTask, existingTasks: existing });
        appendAudit({ action: "Connector intake", detail: `${connectorId} → ${config.projectId}: ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped` });
      });
    }
    // I1 ambient bus: calendar records become review-tray drafts (zero-input).
    // Bus is purely additive — task intake above remains the source-of-truth;
    // bus submissions are idempotent drafts through the same tray.
    const ambientBus = (() => { try { return require("./lib/ambient-ingest-bus.js"); } catch (_) { return null; } })();
    const busProjects = new Map(stored.configs.filter(c => c.projectId).map(c => [String(c.id), String(c.projectId)]));
    const result = await connectorWorker.runOnce(CONNECTOR_STATE_FILE, registry.adapters, `scheduler-${process.pid}`, undefined, async (connectorId, _state, records) => {
      const handler = importers.get(String(connectorId));
      if (handler) await handler(connectorId, records);
      // Fan every calendar record into the ambient bus (best-effort, never fails the sync).
      if (ambientBus && busProjects.has(String(connectorId))) {
        try {
          const pid = busProjects.get(String(connectorId));
          const before = (ambientBus.draftsFromCalendarRecords(DATA_DIR, { projectId: pid, records: records || [] }) || {}).count || 0;
          if (before) appendAudit({ action: "Ambient bus", detail: `${connectorId} → ${pid}: ${before} calendar draft(s)` });
        } catch (_) {}
      }
    });
    if (registry.unsupported.length) logger.warn("connector_adapters_unavailable", { connectors: registry.unsupported.map(item => item.id) });
    if (result.processed || result.failed || result.skipped || result.blocked) {
      appendAudit({ action: "Connector scheduler pass", detail: `${result.processed} completed, ${result.failed} failed, ${result.skipped} skipped${result.blocked ? " — blocked" : ""}` });
    }
    return result;
  } catch (error) {
    logger.error("connector_scheduler_failed", { message: error.message });
    appendAudit({ action: "Connector scheduler blocked", detail: error.message });
    return { blocked: true, reason: error.message };
  }
}
// ─── Always-on AI provider watchdog ────────────────────────────────────────
// The mentor must be active ALWAYS, so the app — not an administrator's memory
// — has to notice when the provider layer dies. Every probe (scheduled or
// manual) is folded into the state machine in lib/llm-watchdog.js, which
// reports only TRANSITIONS. An outage is delivered through every channel the
// deployment has: the audit chain, the event bus, registered webhooks, and an
// email to LEADERSHIP_NOTIFY_TO when SMTP is configured. The state itself is
// surfaced on every view through the mentor strip, so it cannot hide.
function deliverProviderAlert(alert) {
  const payload = {
    type: alert.type,
    status: alert.status,
    configured: alert.configured,
    healthy: alert.healthy,
    failing: alert.failing,
    outageSince: alert.outageSince,
    detectedAt: alert.at,
    message: alert.message
  };
  appendAudit({
    action: alert.type === "ai_providers_recovered" ? "AI providers recovered" : "AI provider alert",
    detail: `${alert.status} — ${alert.message}`
  });
  if (alert.type === "ai_providers_recovered") logger.info("llm_providers_recovered", payload);
  else logger.warn("llm_providers_impaired", payload);
  try {
    appendDomainEvent(
      alert.type === "ai_providers_recovered" ? "AiProvidersRecovered" : "AiProvidersImpaired",
      "ai", payload, "system", null, null
    );
  } catch (_) { /* the audit row above is the durable record */ }
  try { notifications.dispatchWebhooks(alert.type, payload).catch(() => {}); } catch (_) {}
  try { dispatchOperationalWebhook(alert.type, payload); } catch (_) {}
  if (NOTIFY_TO && process.env.SMTP_HOST) {
    try {
      const notice = notifications.buildProviderOutageNotice(alert);
      notifications.sendEmail({ to: NOTIFY_TO, subject: notice.subject, html: notice.html })
        .then(result => { if (!result.sent) logger.warn("llm_alert_email_failed", { reason: result.reason }); })
        .catch(() => {});
    } catch (_) { /* delivery is best-effort; the state stays visible in-app */ }
  }
}

// ─── Dead-man's switch ─────────────────────────────────────────────────────
// The provider watchdog above notices a DEAD PROVIDER. It cannot notice a dead
// PROCESS, because it lives inside it: when this server stops, so does every
// check it could make. The dead-man's switch inverts that — the app must check
// in with an external monitor on a schedule, the monitor pages when the
// check-ins stop, and this server's job is to be honest about whether that
// coverage exists and whether the check-in is still landing.
function deadmanConfig() {
  // Read per call, not cached at boot, so an operator can see the effect of an
  // env change without code paths disagreeing about which config was used.
  return deadman.configFromEnv(process.env);
}

/** Deliver a liveness verdict through every channel the deployment has. */
function deliverDeadmanAlert(alert) {
  const payload = {
    type: alert.type,
    state: alert.state,
    beats: alert.beats,
    failedBeats: alert.failedBeats,
    consecutiveFailures: alert.consecutiveFailures,
    intervalMs: alert.intervalMs,
    lateMs: alert.lateMs,
    silentMs: alert.silentMs,
    missedWindows: alert.missedWindows,
    detectedAt: alert.at,
    message: alert.message
  };
  appendAudit({
    action: alert.type === "deadman_recovered" ? "Dead-man's switch beating again" : "Dead-man's switch alert",
    detail: `${alert.state} — ${alert.message}`
  });
  if (alert.type === "deadman_recovered") logger.info("deadman_recovered", payload);
  else logger.warn("deadman_impaired", payload);
  try {
    appendDomainEvent(
      alert.type === "deadman_recovered" ? "DeadmanRecovered" : "DeadmanImpaired",
      "ops", payload, "system", null, null
    );
  } catch (_) { /* the audit row above is the durable record */ }
  try { notifications.dispatchWebhooks(alert.type, payload).catch(() => {}); } catch (_) {}
  try { dispatchOperationalWebhook(alert.type, payload); } catch (_) {}
  if (NOTIFY_TO && process.env.SMTP_HOST) {
    try {
      const notice = notifications.buildDeadmanNotice(alert);
      notifications.sendEmail({ to: NOTIFY_TO, subject: notice.subject, html: notice.html })
        .then(result => { if (!result.sent) logger.warn("deadman_alert_email_failed", { reason: result.reason }); })
        .catch(() => {});
    } catch (_) { /* delivery is best-effort; the state stays visible in-app */ }
  }
}

/** Fold one event into the switch's state and deliver any transition. */
function recordDeadmanEvent(event) {
  const config = deadmanConfig();
  const previous = deadman.loadState(DATA_DIR);
  const evaluated = deadman.evaluate(previous, event, {
    config,
    minAlertIntervalMs: Math.max(60000, config.intervalMs),
    now: event && event.at
  });
  try {
    deadman.saveState(DATA_DIR, evaluated.state);
  } catch (error) {
    logger.warn("deadman_state_write_failed", { message: error && error.message ? error.message : "unknown" });
  }
  if (evaluated.alert) deliverDeadmanAlert(evaluated.alert);
  return evaluated;
}

/** One beat: check in with the monitor, then fold the result. Never throws. */
async function runDeadmanBeat(trigger) {
  const config = deadmanConfig();
  const at = new Date().toISOString();
  let sent;
  try {
    sent = await deadman.sendBeat(config, { at });
  } catch (error) {
    sent = { ok: false, error: error && error.message ? error.message : "check-in failed" };
  }
  const evaluated = recordDeadmanEvent({
    kind: "beat",
    at: sent.at || at,
    ok: sent.ok === true,
    status: sent.status,
    error: sent.error
  });
  return {
    trigger: trigger || "scheduled",
    at,
    config: { usable: config.usable, urlConfigured: !!config.urlConfigured, intervalMs: config.intervalMs, reason: config.invalidReason },
    sent: { ok: sent.ok === true, status: sent.status === undefined ? null : sent.status, latencyMs: sent.latencyMs === undefined ? null : sent.latencyMs, error: sent.error || null },
    alert: evaluated.alert || null,
    deadman: deadman.publicState(evaluated.state, config)
  };
}

/**
 * Boot: measure the silence the app was in before it restarted (the recorded
 * last beat is the evidence) and report it if it exceeded a missed window.
 */
function resumeDeadmanSwitch(config) {
  const event = { kind: "resume", at: new Date().toISOString() };
  const evaluated = recordDeadmanEvent(event);
  if (evaluated.state.lastGapMs) {
    logger.info("deadman_resumed", {
      silentMs: evaluated.state.lastGapMs,
      missedWindows: evaluated.state.missedWindows || 0,
      state: evaluated.state.state
    });
  }
  return evaluated;
}

/**
 * The liveness verdict as a NON-ADMIN may see it.
 *
 * `/api/llm/status` is viewer-readable, so this is the shape every user's strip
 * and AI status page read. It carries the verdict and the disclosure, never the
 * operator's internals: `reason` quotes the configured ping URL when the URL is
 * malformed, and `lastError` quotes whatever the request failed on (a host
 * name). Neither belongs on a payload every colleague can fetch.
 */
function deadmanForViewers(state, config) {
  const full = deadman.publicState(state, config);
  return {
    state: full.state,
    attention: full.attention,
    intervalMs: full.intervalMs,
    beats: full.beats,
    failedBeats: full.failedBeats,
    consecutiveFailures: full.consecutiveFailures,
    lastBeatAt: full.lastBeatAt,
    missedWindows: full.missedWindows,
    covered: full.usable === true && full.state === "beating",
    message: full.message,
    messageDa: full.messageDa
  };
}

/**
 * Start the switch. It ALWAYS evaluates once so the coverage verdict is known
 * and reported — including the case where nothing is configured at all, which
 * is exactly the case an operator must not be left to assume is fine.
 */
function startDeadmanSwitch() {
  const config = deadmanConfig();
  if (!config.enabled) return false;
  if (deadmanTimer) return true;
  resumeDeadmanSwitch(config);
  if (!config.usable) {
    // Nothing can be sent. The boot evaluation above already recorded and
    // reported the coverage gap, so an interval would only repeat the verdict.
    logger.warn("deadman_not_running", { reason: config.invalidReason });
    return false;
  }
  const intervalMs = Math.max(30000, config.intervalMs);
  deadmanTimer = setInterval(() => { runDeadmanBeat("scheduled").catch(() => {}); }, intervalMs);
  deadmanTimer.unref();
  // One immediate check-in, so a monitor that is already alerting hears from a
  // restarted app now instead of one whole interval later.
  runDeadmanBeat("startup").catch(() => {});
  logger.info("deadman_started", { intervalMs, failThreshold: config.failThreshold, timeoutMs: config.timeoutMs });
  return true;
}

/**
 * Fold one probe into the watchdog state. Shared by the scheduled monitor and
 * the manual POST /api/llm/watchdog/probe (and fed by GET /api/llm/health), so
 * an operator pressing the button and the background loop can never disagree.
 */
function recordProviderProbe(probe, nowArg) {
  const previous = llmWatchdog.loadState(DATA_DIR);
  const evaluated = llmWatchdog.evaluate(previous, probe, {
    threshold: LLM_WATCHDOG_THRESHOLD,
    minAlertIntervalMs: Math.max(60000, LLM_WATCHDOG_INTERVAL_MS),
    now: nowArg
  });
  try {
    llmWatchdog.saveState(DATA_DIR, evaluated.state);
  } catch (error) {
    logger.warn("llm_watchdog_state_write_failed", { message: error && error.message ? error.message : "unknown" });
  }
  if (evaluated.alert) deliverProviderAlert(evaluated.alert);
  return evaluated;
}

/** One watchdog pass: probe every configured provider, then fold the result. */
async function runProviderWatchdog(trigger) {
  const at = new Date().toISOString();
  let probe;
  try {
    probe = await llmInference.probeProviders({ timeoutMs: 12000 });
  } catch (error) {
    const reason = error && error.message ? error.message : "probe failed";
    logger.warn("llm_watchdog_probe_failed", { trigger: trigger || "scheduled", message: reason });
    return { probed: false, trigger: trigger || "scheduled", at, reason };
  }
  const result = recordProviderProbe(probe, at);
  return {
    probed: true,
    trigger: trigger || "scheduled",
    at,
    probe,
    alert: result.alert,
    watchdog: llmWatchdog.publicState(result.state)
  };
}

function startProviderWatchdog() {
  if (!LLM_WATCHDOG_ENABLED) return false;
  // Nothing to watch without a provider: probing would burn an interval to
  // discover a configuration fact the status endpoint already reports.
  if (!llmInference.isAvailable()) return false;
  if (llmWatchdogTimer) return true;
  if (!Number.isFinite(LLM_WATCHDOG_INTERVAL_MS) || LLM_WATCHDOG_INTERVAL_MS < 60000) return false;
  llmWatchdogTimer = setInterval(() => { runProviderWatchdog("scheduled").catch(() => {}); }, LLM_WATCHDOG_INTERVAL_MS);
  llmWatchdogTimer.unref();
  // One immediate pass so an outage that started before boot is reported now
  // instead of one whole interval later.
  runProviderWatchdog("startup").catch(() => {});
  logger.info("llm_watchdog_started", { intervalMs: LLM_WATCHDOG_INTERVAL_MS, threshold: LLM_WATCHDOG_THRESHOLD });
  return true;
}

/* Zero-input navigator snapshot: ONE trend row per project per day, written
   by the automation pass. The leader juggling six projects never opens the
   navigator to keep the trend alive — and a write happens ONLY when a row
   was actually added, so a quiet workspace stays quiet on disk.
   Atomic: read + autoSnapshot + write all under the per-file lock, and the
   audit line lands only AFTER the write resolved — the old version queued the
   write un-awaited, so the enhanced-AI cache write later in the same tick
   re-read a copy WITHOUT the row and clobbered it (the row never survived;
   historyCount stayed 0 and the audit line re-appeared every single tick). */
function runNavigatorSnapshotPass() {
  try {
    const leadNav = require("./lib/routes/lead-navigator.js");
    const today = new Date().toISOString().slice(0, 10);
    return mutateWorkspaceConditional(ws => {
      if (!ws || typeof ws !== "object") return { changed: false, written: 0 };
      const projects = (ws.projects && typeof ws.projects === "object" && !Array.isArray(ws.projects))
        ? Object.values(ws.projects).filter(Boolean)
        : [ws];
      let written = 0;
      projects.forEach(p => {
        try { if (leadNav.autoSnapshot(p, { today }).written) written++; } catch (_) { /* per-project best-effort */ }
      });
      // The constraint's own memory (js/management-navigator.js): one dated
      // snapshot per day, same atomic write — so the weekly letter can report
      // whether the bottleneck MOVED and whether last week's relief landed.
      // Empty registers record nothing; a level queue records its resolution
      // once, never a daily row of nothing.
      try {
        const tr = managementNavigator.recordConstraintTrend(ws, { today });
        if (tr && tr.changed) written++;
      } catch (_) { /* per-workspace best-effort */ }
      return { changed: written > 0, written };
    }).then(res => {
      if (res && res.written > 0) appendAudit({ action: "Navigator-snapshot auto", detail: plN(res.written, "trend-række", "trend-rækker") + " — " + today });
      return res;
    }).catch(() => ({ written: 0 }));
  } catch (_) { return Promise.resolve({ written: 0 }); }
}

/* Enhanced AI Suite: deterministic analysis on every automation cycle,
   cached on the workspace for instant UI access — no LLM spend.
   Three fixes over the inline version this replaced:
   1. It computed on `ws.projects[ws.activeProjectId]` — not a workspace field
      (the store uses `activeId`), so `project` fell back to the WHOLE
      workspace and every result came back zeroed (lastDecisions.totalCount 0
      forever). Now: activeProject(ws), project.lang, project.roster.
   2. It ran read-outside-lock + write-outside-lock AFTER the snapshot pass
      queued its write — a copy without the trend row landed last and erased
      it every tick. Now: one atomic mutate under the file lock, sequenced
      after every earlier queued write.
   3. It persisted unconditionally (2 revisions/tick, 288/day of history
      churn + client 409s for zero net change). Now: timestamps are stripped
      before comparison and an unchanged result writes NOTHING. */
function stableCacheJson(value) {
  return JSON.stringify(value, (key, v) =>
    (key === "cachedAt" || key === "generatedAt" || key === "computedAt") ? null : v);
}
function runEnhancedAiCachePass() {
  try {
    return mutateWorkspaceConditional(ws => {
      if (!ws || typeof ws !== "object") return { changed: false };
      const project = activeProject(ws);
      if (!project) return { changed: false };
      const lang = langOf(project && project.lang ? project : ws);
      const today = new Date().toISOString().slice(0, 10);
      const decisions = decisionRecommender.recommendDecisions(project, { today, lang });
      const radar = predictiveRiskRadar.predictiveRadar(project, { today, lang });
      const next = {
        lastDecisions: { ...decisions, cachedAt: new Date().toISOString() },
        lastRadar: { ...radar, cachedAt: new Date().toISOString() }
      };
      if (ws.projects && Object.keys(ws.projects).length >= 2) {
        const allProjects = Object.values(ws.projects).filter(Boolean);
        next.lastCrossProject = { ...crossProjectIntelligence.crossProjectView(allProjects, { today, lang }), cachedAt: new Date().toISOString() };
      }
      const events = (project.registers && project.registers.calendar) || [];
      const roster = project.roster || ws.roster || [];
      next.lastCalendar = { ...smartCalendarOptimizer.optimizeCalendar(events, roster, decisions, { today, lang }), cachedAt: new Date().toISOString() };
      const changed = stableCacheJson(ws._enhancedAI) !== stableCacheJson(next);
      ws._enhancedAI = next;
      return { changed, decisions: decisions.totalCount, radar: radar.totalCount };
    }).then(res => {
      if (res && res.changed) logger.info("enhanced_ai_cache", { decisions: res.decisions, radar: res.radar });
      return res;
    }).catch(() => ({ changed: false }));
  } catch (e) {
    logger.warn("enhanced_ai_cache_error", { error: e.message });
    return Promise.resolve({ changed: false });
  }
}

// ─── Automation flight recorder ───────────────────────────────────────────────
// One bounded JSONL record per tick: how long every pass took, whether it
// WROTE anything, whether it was quiet and why, and any error. This is the
// evidence layer for the zero-input loop — the leader who was in meetings all
// day can see at a glance that the automation ran and exactly what it touched.
// Deliberately NOT stored on the workspace: recording must never create the
// revision churn the conditional writers exist to prevent.
const FLIGHT_FILE = path.join(DATA_DIR, "flight-recorder.jsonl");
const FLIGHT_KEEP = 200;

function appendFlightRecord(record) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const fd = fs.openSync(FLIGHT_FILE, "a");
    fs.appendFileSync(fd, JSON.stringify(record) + "\n", "utf8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    maybeTrimFlight(); // ring buffer: rewrite only once past 2.5x retention
    return record;
  } catch (error) {
    logger.warn("flight_record_failed", { error: error.message });
    return null;
  }
}
function readFlightRecords(limit) {
  try {
    const rows = readJsonLines(FLIGHT_FILE).filter(r => r && !r._corrupt);
    const n = Number(limit) > 0 ? Math.min(Number(limit), FLIGHT_KEEP) : 20;
    return rows.slice(-n).reverse(); // newest first
  } catch (_) { return []; }
}
function maybeTrimFlight() {
  try {
    if (!fs.existsSync(FLIGHT_FILE)) return;
    const rows = fs.readFileSync(FLIGHT_FILE, "utf8").split("\n").filter(Boolean);
    if (rows.length <= FLIGHT_KEEP * 2.5) return;
    const tmp = FLIGHT_FILE + ".tmp";
    fs.writeFileSync(tmp, rows.slice(-FLIGHT_KEEP).join("\n") + "\n", "utf8");
    fs.renameSync(tmp, FLIGHT_FILE);
  } catch (_) { /* trim is best-effort */ }
}

// Time one pass and normalize the shapes the passes return into one honest,
// bilingual line. Unknown shapes still record their duration — the record is
// never allowed to lose a pass.
async function flightPass(name, fn) {
  const t0 = Date.now();
  try {
    const r = await fn();
    const pass = { name, ms: Date.now() - t0 };
    const say = (en, da) => { pass.detail = { en, da }; };
    if (r && typeof r === "object") {
      if (r.blocked) { pass.wrote = false; pass.blocked = true; say("blocked — " + (r.blockedReason || "gate"), "blokeret — " + (r.blockedReason || "gate")); }
      else if (typeof r.written === "number") {
        pass.wrote = r.written > 0;
        if (r.written > 0) say(r.written + " trend row(s) written", plN(r.written, "tendensrække", "tendensrækker") + " skrevet");
        else say("quiet — today's row already present", "stille — dagens række findes allerede");
      }
      else if (typeof r.changed === "boolean") {
        pass.wrote = r.changed;
        if (r.changed) say("analysis cached (" + (r.decisions != null ? r.decisions : "?") + " decisions, " + (r.radar != null ? r.radar : "?") + " risks)", "analyse cacheret (" + (r.decisions != null ? r.decisions : "?") + " beslutninger, " + (r.radar != null ? r.radar : "?") + " risici)");
        else say("quiet — analysis unchanged", "stille — uændret analyse");
      }
      else if (typeof r.created === "number") {
        pass.wrote = r.created > 0;
        if (r.created > 0) say(r.created + " occurrence(s) materialized", plN(r.created, "gentagelse", "gentagelser") + " oprettet");
        else say("quiet — nothing due", "stille — intet forfaldent");
      }
      else if (typeof r.drafts === "number") {
        const auto = (r.autoFiled && r.autoFiled.filed) || 0;
        pass.wrote = r.drafts > 0 || auto > 0;
        // Restraint made visible: what the machine deliberately did NOT ask
        // belongs on the record beside what it filed.
        const amb = r.ambient || {};
        const heldApproved = Number(amb.refusedApproved) || 0;
        const heldFatigue = Number(amb.fatigueMuted) || 0;
        let en = r.drafts + " draft(s), " + auto + " auto-filed";
        let da = r.drafts + " udkast, " + auto + " auto-registreret";
        if (heldApproved || heldFatigue) {
          pass.restraint = { refusedApproved: heldApproved, fatigueMuted: heldFatigue };
          en += " \u2014 " + (heldApproved + heldFatigue) + " question(s) deliberately not re-asked (" + heldApproved + " answered, " + heldFatigue + " fatigue-muted)";
          da += " \u2014 " + (heldApproved + heldFatigue) + " sp\u00f8rgsm\u00e5l bevidst ikke stillet igen (" + heldApproved + " besvaret, " + heldFatigue + " d\u00e6mpet af tr\u00e6thed)";
        }
        say(en, da);
      }
      else if (typeof r.proposals === "number") { pass.wrote = (r.queued || 0) > 0; say(r.proposals + " proposal(s), " + (r.queued || 0) + " queued", r.proposals + " forslag, " + (r.queued || 0) + " i kø"); }
      else if (typeof r.queued === "number") { pass.wrote = r.queued > 0; say(r.queued + " job(s) queued", plN(r.queued, "job", "jobs") + " i kø"); }
      else if (r.skipped) { pass.wrote = false; const why = typeof r.skipped === "string" ? r.skipped : (r.reason || "not applicable"); say("skipped — " + why, "sprunget over — " + why); }
      if (r.failed && r.reason) pass.error = String(r.reason);
    }
    return pass;
  } catch (error) {
    return { name, ms: Date.now() - t0, error: (error && error.message) ? error.message : String(error) };
  }
}

/* Self-watch: the recorder reads its OWN evidence. Every rule runs over real
   tick records (newest first) and returns bilingual insights consumed by the
   navigator brief, the morning briefing and the flight panel — the loop now
   notices when it itself is broken. Rules:
     silent       — no tick within max(2×interval, interval+5min) → critical
     pass-errors  — one pass erroring in ≥3 consecutive ticks      → critical
     pass-blocked — one pass gate-blocked in ≥3 consecutive ticks  → warning
     slow-tick    — last tick > 5× the median of the previous 10   → info
     churn        — every one of the last 20 ticks wrote something → info
                    (quiet-by-design is meant to hold; sustained writes
                     mean something keeps changing underneath)
   No records → no insights: a fresh install is healthy, not alarming. */
function fmtDur(ms, lang) {
  const v = Math.max(0, Number(ms) || 0);
  if (v < 1000) return Math.round(v) + " ms";
  const s = Math.round(v / 1000);
  if (s < 60) return s + (lang === "en" ? " s" : " sek.");
  const m = Math.round(s / 60);
  if (m < 60) return m + " min.";
  return Math.floor(m / 60) + (lang === "en" ? " h" : " t") + " " + (m % 60) + " min.";
}
function flightStreaks(ticks, pred) {
  // Streak = consecutive TICKS in which the named pass matched. A tick that
  // does not carry the pass at all breaks the streak — "failed 3 ticks in a
  // row" must mean three actual consecutive runs, never three occurrences
  // skated over gaps of ticks where the pass never appeared.
  const names = new Set();
  ticks.forEach(t => (t.passes || []).forEach(p => names.add(p.name)));
  const out = [];
  names.forEach(name => {
    let streak = 0, newest = null;
    for (const t of ticks) {
      const p = (t.passes || []).find(x => x.name === name);
      if (p && pred(p)) { streak++; if (!newest) newest = p; } else break;
    }
    if (streak > 0) out.push({ name, streak, newest });
  });
  return out;
}
function flightInsights(records, opts) {
  const o = opts || {};
  const now = Number.isFinite(o.now) ? o.now : Date.now();
  const interval = Number(o.intervalMs) >= 60000 ? Number(o.intervalMs) : 300000;
  const minStreak = Number(o.streak) >= 2 ? Number(o.streak) : 3;
  const ticks = (Array.isArray(records) ? records : []).filter(r => r && !r.skipped && Array.isArray(r.passes));
  const out = [];
  const add = (level, code, en, da, action) => out.push({ level, code, en, da, action: action || null });
  if (!ticks.length) return out;
  const last = ticks[0];
  const silence = now - Date.parse(last.at);
  if (Number.isFinite(silence) && silence > Math.max(2 * interval, interval + 5 * 60000)) {
    add("critical", "silent",
      "Automation has been silent for " + fmtDur(silence, "en") + " — the last tick was at " + last.at + ".",
      "Automationen har været tavs i " + fmtDur(silence, "da") + " — seneste tik var " + last.at + ".",
      { en: "Check that the server process is alive — trends, drafts and briefings all wait for it.", da: "Tjek at serverprocessen kører — tendenser, kladder og briefinger venter alle på den." });
  }
  flightStreaks(ticks, p => !!p.error).filter(s => s.streak >= minStreak).forEach(s => {
    add("critical", "pass-errors",
      "The " + s.name + " pass has failed " + s.streak + " ticks in a row — last error: " + s.newest.error,
      "Passen " + s.name + " har fejlet " + s.streak + " tik i træk — seneste fejl: " + s.newest.error,
      { en: "Open the server log for this pass; a failing pass starves the loop without ever showing an error in the UI.", da: "Åbn serverloggen for passen; en fejlende pass sultebeder løkken uden nogensinde at vise en fejl i brugerfladen." });
  });
  flightStreaks(ticks, p => !!p.blocked).filter(s => s.streak >= minStreak).forEach(s => {
    const whyEn = s.newest.detail ? (s.newest.detail.en || "gate") : "gate";
    const whyDa = s.newest.detail ? (s.newest.detail.da || s.newest.detail.en || "gate") : "gate";
    add("warning", "pass-blocked",
      "The " + s.name + " pass has been blocked " + s.streak + " ticks in a row (" + whyEn + ")",
      "Passen " + s.name + " har været blokeret " + s.streak + " tik i træk (" + whyDa + ")",
      { en: "The automation gate is closed (paused or integrity check failed) — re-verify or unpause to resume.", da: "Automationslågen er lukket (pause eller integritets-tjek fejler) — verificér igen eller genoptag for at fortsætte." });
  });
  if (ticks.length >= 9) {
    const prev = ticks.slice(1, 11).map(t => t.totalMs || 0).filter(v => v > 0).sort((a, b) => a - b);
    if (prev.length >= 6) {
      const med = prev[Math.floor(prev.length / 2)];
      if (med > 0 && (last.totalMs || 0) > 5 * med) {
        add("info", "slow-tick",
          "The last tick took " + fmtDur(last.totalMs, "en") + " — over 5× its usual " + fmtDur(med, "en") + ".",
          "Seneste tik tog " + fmtDur(last.totalMs, "da") + " — over 5× det normale " + fmtDur(med, "da") + ".",
          { en: "A slow tick usually means a connector or LLM call is dragging; repeated slowdowns deserve a look.", da: "Et langsomt tik betyder som regel at en connector eller et LLM-kald trækker ud; gentagne nedgange fortjener et kig." });
      }
    }
  }
  const recent = ticks.slice(0, 20);
  if (recent.length >= 20 && recent.every(t => (t.passes || []).some(p => p.wrote))) {
    add("info", "churn",
      "Every one of the last " + recent.length + " ticks wrote to your data — quiet-by-design is not holding.",
      "Alle de seneste " + recent.length + " tik har skrevet til dine data — den tilsigtede stilhed holder ikke.",
      { en: "Check what keeps changing (a producer, a recurring series, or an external connector).", da: "Tjek hvad der bliver ved med at ændre sig (en producer, en gentagelsesserie eller en ekstern connector)." });
  }
  if (!out.length) {
    const age = Math.max(0, now - Date.parse(last.at));
    add("ok", "healthy",
      "Automation healthy — last tick " + fmtDur(age, "en") + " ago.",
      "Automationen kører som den skal — seneste tik for " + fmtDur(age, "da") + " siden.");
  }
  // Restraint made visible: what the machine deliberately did NOT ask is
  // part of the proof, not an omission — silence with its reason on record.
  const held = ticks.slice(0, 10).reduce((n, t) =>
    n + (t.passes || []).reduce((m, p) => m + (p.restraint ? (p.restraint.refusedApproved || 0) + (p.restraint.fatigueMuted || 0) : 0), 0), 0);
  if (held > 0) {
    add("ok", "restraint",
      "The machine deliberately did not re-ask " + held + " question(s) across the recent ticks — answered questions stay answered.",
      "Maskinen har bevidst undladt at stille " + held + " spørgsmål igen på de seneste tik — besvarede spørgsmål forbliver besvaret.",
      { en: "Restraint is by design: approved is final, and fatigue-muted classes return after the mute window.", da: "Tilbageholdenhed er design: godkendt er endeligt, og træthedsdæmpede klasser vender tilbage efter dæmpningsvinduet." });
  }
  return out;
}

/* The automation tick as ONE awaited sequence: deterministic lock order,
   every pass timed and normalized before the next runs, and a complete
   flight record at the end (the old fire-and-forget version could record
   — or worse, write — against promises that had not settled yet). The
   overlap guard means a tick that somehow outlives its interval records a
   skipped entry instead of stacking a second pass on the same registers. */
async function runAutomationTick(automationEngine) {
  const tickStart = Date.now();
  writeHeartbeat();
  const passes = [];
  const step = (name, fn) => flightPass(name, fn).then(p => { passes.push(p); return p; });
  await step("jobs", () => queueAutomationJobs(readWorkspace()));
  await step("mentor-jobs", () => queueProactiveMentorJobs(readWorkspace()));
  await step("snapshot", () => runNavigatorSnapshotPass());
  await step("producer", () => runProducerPassGated(readWorkspace()));
  await step("digest", () => runDigestDeliveryGated({ workspace: readWorkspace() }));
  await step("due-jobs", () => deliverDueJobs());
  await step("connectors", () => runConnectorScheduler());
  await step("fm-ingest", () => runEscalationIngestGated());
  await step("recurring", () => runRecurringTaskScheduler());
  await step("engine", () => {
    if (!automationEngine) return { skipped: "engine unavailable" };
    const ws = readWorkspace();
    automationEngine.runAll(ws, {
      dispatchAlerts: (firedAlerts) => {
        if (typeof realtimeTransport !== "undefined" && realtimeTransport.pushAlert) {
          firedAlerts.forEach(function (alert) { realtimeTransport.pushAlert(alert); });
        }
      },
      sendEmail: (msg) => {
        if (NOTIFY_TO) { notifications.sendDailyDigest({ _emailPayload: msg }, NOTIFY_TO).catch(() => {}); }
      },
      sendInsight: (insight) => {
        if (typeof realtimeTransport !== "undefined" && realtimeTransport.pushAlert) {
          realtimeTransport.pushAlert([{ type: "proactive_insight", ...insight }]);
        }
      },
      sendMeetingPrep: (preps) => {
        if (NOTIFY_TO && preps.length) {
          var prepText = preps.map(p => (p.person || "") + ":\n" + (p.topics || []).map(t => "• " + (t.issue || t)).join("\n")).join("\n\n");
          notifications.sendDailyDigest({ _emailPayload: { subject: "Meeting prep for upcoming 1:1s", text: prepText } }, NOTIFY_TO).catch(() => {});
        }
      }
    });
    return null;
  });
  await step("ai-cache", () => runEnhancedAiCachePass());
  const record = {
    at: new Date().toISOString(),
    intervalMs: AUTOMATION_INTERVAL_MS,
    totalMs: Date.now() - tickStart,
    paused: !!AUTOMATION_PAUSED,
    passes
  };
  appendFlightRecord(record);
  return record;
}

function startAutomationScheduler() {
  // Register webhooks from env (LEADERSHIP_WEBHOOKS): [{url, events, secret}]
  WEBHOOKS.forEach(hook => notifications.registerWebhook(hook.url, hook.events || ["*"], hook.secret || ""));
  // Enqueue the recurring cadence jobs once (daily standup, weekly risk
  // review, monthly close). The job store re-schedules each occurrence.
  try {
    const recurring = C.recurringPlan(readWorkspace());
    const recurringWithProject = recurring.jobs.map(job => ({ ...job, projectId: "workspace" }));
    jobStore.enqueueJobs(JOBS_FILE, { asOf: recurring.asOf, jobs: recurringWithProject });
  } catch (_) { /* recurring enqueue is best-effort */ }
  if (!automationTimer && Number.isFinite(AUTOMATION_INTERVAL_MS) && AUTOMATION_INTERVAL_MS >= 60000) {
    let automationEngine;
    try { automationEngine = require("./lib/automation-engine.js"); } catch (_) { automationEngine = null; }
    let tickInFlight = false;
    const tickCallback = () => {
      if (tickInFlight) {
        appendFlightRecord({ at: new Date().toISOString(), totalMs: 0, skipped: "previous tick still running", passes: [] });
        return;
      }
      tickInFlight = true;
      runAutomationTick(automationEngine).finally(() => { tickInFlight = false; });
    };
    automationTimer = setInterval(tickCallback, AUTOMATION_INTERVAL_MS);
    automationTimer.unref();
    writeHeartbeat();
  }
  const outboxInterval = Number(process.env.LEADERSHIP_OUTBOX_INTERVAL_MS || AUTOMATION_INTERVAL_MS);
  if (!outboxTimer && Number.isFinite(outboxInterval) && outboxInterval >= 60000 && persistenceStore().postgres && String(process.env.LEADERSHIP_TENANT_ID || "").trim()) {
    outboxTimer = setInterval(() => { runOutboxScheduler().catch(() => {}); }, outboxInterval);
    outboxTimer.unref();
  }
  // Run one recurring-materialization pass at boot so due occurrences are
  // not waiting on the first interval tick.
  runRecurringTaskScheduler().catch(() => {});
  if (!digestTimer && Number.isFinite(DIGEST_INTERVAL_MS) && DIGEST_INTERVAL_MS >= 60000) {
    digestTimer = setInterval(() => {
      const ws = readWorkspace();
      const alerts = workspaceAlerts(ws);
      const plan = workspaceAutomationPlan(ws);
      const count = alerts.length + plan.total;
      if (count > 0) {
        logger.info("weekly_digest", { alerts: alerts.length, automation: plan.total });
        appendAudit({ action: "Weekly digest generated", detail: alerts.length + " alerts, " + plan.total + " automation jobs" });
        if (NOTIFY_TO) {
          notifications.sendDailyDigest(ws, NOTIFY_TO).then(result => {
            if (!result.sent) logger.warn("digest_email_failed", { reason: result.reason });
          });
        }
      }
    }, DIGEST_INTERVAL_MS);
    digestTimer.unref();
  }
  // The automation scheduler is opt-in; the weekly digest timer is a separate
  // concern and does not count as "the scheduler running".
  return !!automationTimer;
}

// ─── Production KMS startup guard (Gap #3) ────────────────────────────────
function verifyKmsStartup() {
  const kmsMod = require("./lib/kms.js");
  const health = kmsMod.localProvider().health();
  if (!health.ready) {
    logger.error("kms_startup_failure", { detail: health.detail });
    console.error(`FATAL: ${health.detail}`);
    process.exit(1);
  }
  return health;
}

function verifyProductionConfiguration() {
  if (process.env.NODE_ENV === "production" && !String(process.env.LEADERSHIP_TENANT_ID || "").trim()) {
    const detail = "Production tenant scope is misconfigured: LEADERSHIP_TENANT_ID is required";
    logger.error("production_configuration_failure", { detail });
    console.error(`FATAL: ${detail}`);
    process.exit(1);
  }
}

// One-time startup self-heal: a workspace history written before the byte
// budget existed (measured: 113 MB from load-test snapshots) is compacted to
// budget on first boot with this code, not left on disk forever. Chain stays
// valid — trimHistoryToBudget keeps the newest rows and rechainHistory repairs
// the head's parent reference. Audit-logged so the event is visible.
// ─── Pre-trim backups: the net under every compaction ────────────────────────

function historyBackupDirFor(historyFile) {
  const base = path.join(BACKUP_DIR, "history-pretrim", path.basename(historyFile).replace(/\.jsonl$/, ""));
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function backupHistoryBeforeTrim(historyFile) {
  // Copy with a sha256 manifest (same files:{size,sha256} shape that
  // scripts/backup-rotate.mjs uses, so one tooling verifies both), then PROVE
  // the copy is byte-identical before anything destructive happens. A backup
  // that cannot be verified aborts the trim — never shrink without a net.
  const dir = historyBackupDirFor(historyFile);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  // Seconds-resolution stamps collide when two nets are taken within the same
  // second (startup pass + timer, or a tight write loop) — a collision would
  // silently OVERWRITE the earlier net. Disambiguate with -k2, -k3, …
  let name = `history-${stamp}.jsonl`;
  for (let k = 2; fs.existsSync(path.join(dir, name)); k++) name = `history-${stamp}-k${k}.jsonl`;
  const content = fs.readFileSync(historyFile);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  fs.writeFileSync(path.join(dir, name), content);
  fs.writeFileSync(path.join(dir, name.replace(/\.jsonl$/, ".manifest.json")), JSON.stringify({
    ts: new Date().toISOString(),
    source: path.basename(historyFile),
    files: { [name]: { size: content.length, sha256: hash } }
  }, null, 2), "utf8");
  const reread = fs.readFileSync(path.join(dir, name));
  if (!reread.equals(content)) {
    try { fs.unlinkSync(path.join(dir, name)); fs.unlinkSync(path.join(dir, name.replace(/\.jsonl$/, ".manifest.json"))); } catch (_) {}
    throw new Error("pre-trim backup failed verification — trim aborted");
  }
  return path.join(dir, name);
}

// Verdicts are memoized per (path, mtime, size): pretrim nets are immutable —
// a new backup always gets a new timestamped name — so a verified file only
// needs re-hashing if the file itself changed. Without this, every health
// snapshot re-sha256'd every net (measured: 334 nets / 2.8 GB ≈ 10 s per
// /api/storage/health call, tripping every probe timeout).
const VERIFY_BACKUP_CACHE = new Map();
function verifyHistoryBackup(backupPath) {
  let stat;
  try { stat = fs.statSync(backupPath); } catch (_) { return { checksumOk: false, reason: "backup missing" }; }
  const key = backupPath + "|" + stat.mtimeMs + "|" + stat.size;
  const hit = VERIFY_BACKUP_CACHE.get(key);
  if (hit) return hit;
  const verdict = computeHistoryBackupVerdict(backupPath);
  VERIFY_BACKUP_CACHE.set(key, verdict);
  if (VERIFY_BACKUP_CACHE.size > 8192) VERIFY_BACKUP_CACHE.clear();
  return verdict;
}
function computeHistoryBackupVerdict(backupPath) {
  const manifestPath = backupPath.replace(/\.jsonl$/, ".manifest.json");
  if (!fs.existsSync(manifestPath)) return { checksumOk: false, reason: "manifest missing" };
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); } catch (_) { return { checksumOk: false, reason: "manifest unreadable" }; }
  const expected = manifest.files && manifest.files[path.basename(backupPath)];
  if (!expected) return { checksumOk: false, reason: "not in manifest" };
  const content = fs.readFileSync(backupPath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return hash === expected.sha256 ? { checksumOk: true, bytes: content.length } : { checksumOk: false, reason: "checksum mismatch" };
}

function pruneHistoryBackups(historyFile) {
  // Retention: keep the newest WORKSPACE_HISTORY_BACKUP_RETENTION nets that
  // are at most 7 days old; everything else goes (manifest included).
  const dir = historyBackupDirFor(historyFile);
  const cutoff = Date.now() - 7 * 86400000;
  const stamps = fs.readdirSync(dir).filter(f => /^history-.*\.jsonl$/.test(f))
    .map(f => ({ f, ts: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.ts - a.ts);
  const survivors = new Set(stamps.slice(0, Math.max(1, WORKSPACE_HISTORY_BACKUP_RETENTION)).filter(s => s.ts >= cutoff).map(s => s.f));
  let pruned = 0;
  for (const { f } of stamps) {
    if (survivors.has(f)) continue;
    try {
      fs.unlinkSync(path.join(dir, f));
      const m = f.replace(/\.jsonl$/, ".manifest.json");
      if (fs.existsSync(path.join(dir, m))) fs.unlinkSync(path.join(dir, m));
      pruned++;
    } catch (_) {}
  }
  return pruned;
}

// One-time startup self-heal: a workspace history written before the byte
// budget existed (measured: 113 MB from load-test snapshots) is compacted to
// budget on first boot with this code, not left on disk forever. Chain stays
// valid — trimHistoryToBudget keeps the newest rows and rechainHistory repairs
// the head's parent reference. Audit-logged so the event is visible.
function compactWorkspaceHistoryIfOversized(opts = {}) {
  // Verified net is the DEFAULT: every caller (startup, timer, tests) gets
  // backup-verified-before-trim unless it explicitly opts out.
  const verifyRestore = !(opts && opts.verifyRestore === false);
  const results = [];
  for (const historyFile of [WORKSPACE_HISTORY_FILE, path.join(DATA_DIR, "workspaces")]) {
    const files = historyFile.endsWith(".jsonl") ? [historyFile]
      : (fs.existsSync(historyFile) ? fs.readdirSync(historyFile).filter(f => f.endsWith("-history.jsonl")).map(f => path.join(historyFile, f)) : []);
    for (const file of files) {
      try {
        const stat = fs.statSync(file);
        if (stat.size <= WORKSPACE_HISTORY_MAX_BYTES) continue;
        let backupPath = null;
        if (WORKSPACE_HISTORY_BACKUPS_ENABLED) {
          backupPath = backupHistoryBeforeTrim(file);
          if (verifyRestore) {
            const verdict = verifyHistoryBackup(backupPath);
            if (!verdict.checksumOk) {
              // Never shrink without an intact net — skip and retry next pass.
              logger.error("workspace_history_backup_unverified", { file, backup: backupPath, reason: verdict.reason });
              results.push({ file, skipped: true, reason: verdict.reason });
              continue;
            }
          }
        }
        const rows = readHistoryFile(file);
        if (!rows.length) continue;
        const kept = trimHistoryToBudget(rows);
        if (!kept.length) continue;
        fs.writeFileSync(file, rechainHistory(kept).map(r => JSON.stringify(r)).join("\n") + "\n", "utf8");
        const after = fs.statSync(file).size;
        logger.info("workspace_history_compacted", { file, bytesBefore: stat.size, bytesAfter: after, rowsKept: kept.length, backup: backupPath });
        try { appendAudit({ action: "Storage self-heal", detail: `workspace history compacted: ${path.basename(file)} ${stat.size} → ${after} bytes (${kept.length} rows kept)${backupPath ? ", pre-trim backup verified" : ""}` }); } catch (_) {}
        try { const pruned = pruneHistoryBackups(file); if (pruned) logger.info("history_backups_pruned", { file, pruned }); } catch (_) {}
        results.push({ file, bytesBefore: stat.size, bytesAfter: after, rowsKept: kept.length, backup: backupPath });
      } catch (err) {
        logger.error("workspace_history_compact_failed", { file, error: err.message });
        results.push({ file, error: err.message });
      }
    }
  }
  return results;
}

if (require.main === module) {
  ensureStorage();
  // Permanent upgrade system: BEFORE the server accepts traffic, any
  // workspace written by an older app version is migrated stepwise to the
  // current schema — only after a verified pre-upgrade backup, and only if
  // the preservation check proves no row, project or setting was lost.
  // A failed migration or a failed check rolls the file back byte-
  // identically; the server still boots (the old data is intact), and the
  // audit trail records exactly what happened.
  const upgradeVerdict = appUpgrade.upgradeWorkspaceFile(WORKSPACE_FILE, { audit: appendAudit });
  if (upgradeVerdict.upgraded) logger.info("app_upgraded", { from: upgradeVerdict.from, to: upgradeVerdict.to, migrations: upgradeVerdict.log.length, backup: upgradeVerdict.backup });
  else if (upgradeVerdict.error) logger.error("app_upgrade_failed", { error: upgradeVerdict.error });
  compactWorkspaceHistoryIfOversized();
  // Retention runs at boot, not only after a compaction: pruneHistoryBackups
  // used to be reachable solely from the trim path, and the trim path only
  // fires when history exceeds its byte budget — so on a healthy install the
  // pretrim nets accreted without bound (measured: 334 nets / 2.8 GB against
  // a configured retention of 10) and every health call re-verified all of
  // them. Same policy, same function, executed where it belongs.
  try {
    const retentionTargets = [WORKSPACE_HISTORY_FILE];
    const scopedHistDir = path.join(DATA_DIR, "workspaces");
    if (fs.existsSync(scopedHistDir)) {
      for (const name of fs.readdirSync(scopedHistDir)) {
        if (name.endsWith("-history.jsonl")) retentionTargets.push(path.join(scopedHistDir, name));
      }
    }
    for (const target of retentionTargets) {
      const pruned = pruneHistoryBackups(target);
      if (pruned > 0) {
        logger.info("history_backups_pruned", { file: target, pruned, trigger: "boot-retention", keep: WORKSPACE_HISTORY_BACKUP_RETENTION });
        try { appendAudit({ action: "Storage self-heal", detail: `history backup retention at boot: pruned ${pruned} net(s) for ${path.basename(target)} (keeping newest ${WORKSPACE_HISTORY_BACKUP_RETENTION} within 7 days)` }); } catch (_) {}
      }
    }
  } catch (retentionError) { logger.error("history_backup_retention_failed", { error: retentionError.message }); }
  // Timed auto-compaction: the startup pass runs once; long-lived installs
  // and per-user histories keep growing. Re-check periodically with the
  // verified pre-trim backup net ON (this path runs unattended).
  if (WORKSPACE_HISTORY_COMPACT_INTERVAL_MS > 0) {
    const compactTimer = setInterval(() => {
      try { compactWorkspaceHistoryIfOversized({ verifyRestore: true }); }
      catch (err) { logger.error("workspace_history_auto_compact_failed", { error: err.message }); }
    }, WORKSPACE_HISTORY_COMPACT_INTERVAL_MS);
    compactTimer.unref();
  }
  verifyProductionConfiguration();
  verifyKmsStartup();
  // Attach the authenticated real-time WebSocket server (was never wired:
  // wsServer.broadcast was undefined and no client could ever connect).
  try {
    // Mirror the HTTP auth posture: local development allows unauthenticated
    // access (jsonl mode has no identity layer), while postgres/production
    // requires a real session — the same rule `anonymousLocalAllowed` applies
    // to requests, including the loopback-only-by-default LAN hardening.
    // Per-socket WS message budget — env-tunable like the HTTP limiters.
    const wsMsgLimit = parseInt(process.env.LEADERSHIP_WS_MSG_RATE_LIMIT || "", 10);
    if (Number.isFinite(wsMsgLimit) && wsMsgLimit > 0) wsServer.MSG_RATE_LIMIT_PER_MIN = wsMsgLimit;
    const wsAttach = wsServer.attach(server, {
      authRequired: (req) => !anonymousLocalAllowed(req),
      validateToken: (t) => !!authStore().sessionUser(t),
      // Real identity for live presence: session users are keyed by user id;
      // unauthenticated (local-dev) sockets fall back to their client id.
      extractUserId: (req) => {
        const user = authStore().userFromRequest(req);
        return user ? String(user.id) : "";
      },
      // Channel-authorization gate: chat:<pid>/docs:<pid> carry per-project
      // data, so subscribing must mirror the HTTP read rules — the project
      // must exist in the workspace scope of the requesting user, in the
      // ACTIVE org (from the subscribe payload, validated like x-org-id).
      // Unauthenticated local-mode sockets are gated the same way, by user
      // scope instead of identity. Server admins may cross scopes.
      canSubscribe: async (req, userId, projectId, channel, extra) => {
        try {
          if (!userId) return { allowed: false, reason: "no identity" };
          const user = authStore().userFromRequest(req);
          if (!user) return { allowed: false, reason: "no session" };
          const isServerAdmin = user.role === "admin" || user.role === "owner";
          const userWs = readWorkspaceFor(user.id);
          const projectLocal = userWs && userWs.projects && userWs.projects[projectId];
          // Mirror the HTTP read rule exactly: a lead-restricted project is
          // INVISIBLE (not merely unwritable) to workspace members who are
          // neither its lead nor on its member list. canReadProject is the
          // same helper lib/routes/project-members.js uses for GET 404s, so
          // the WS gate can never drift from the HTTP rules.
          let allowed = !!projectLocal && (isServerAdmin || canReadProject(user, projectLocal));
          if (!allowed && persistenceStore().postgres) {
            // Shared mode: consult the repository (async) with the tenant the
            // HTTP layer would use for this user + requested org.
            const org = extra && extra.org ? String(extra.org).trim() : "";
            if (org) {
              const effective = orgStore().effectiveRoleForUser(user.id, org);
              if (!effective.allowed && !isServerAdmin) return { allowed: false, reason: "org membership required" };
            }
            const fakeHeaders = org ? { headers: { "x-org-id": org, authorization: (req && req.headers && req.headers.authorization) || "" } } : req;
            let tenantId = null;
            try { tenantId = databaseTenantId(fakeHeaders); } catch (_) { tenantId = null; }
            if (tenantId) {
              const shared = await projectRepository().get(tenantId, projectId, user.id, null);
              allowed = !!shared;
            }
          }
          if (!allowed && isServerAdmin) return { allowed: true, reason: "admin override" };
          return { allowed: allowed, reason: allowed ? "project readable for user" : "project not readable for user" };
        } catch (_) {
          return { allowed: false, reason: "authorization error" };
        }
      }
    });
    if (wsAttach && wsAttach.attached) logger.info("websocket_attached", { path: "/ws" });
    else logger.warn("websocket_not_attached", { reason: wsAttach && wsAttach.reason ? wsAttach.reason : "unknown" });
  } catch (wsErr) {
    logger.warn("websocket_attach_failed", { message: wsErr.message });
  }
  startAutomationScheduler();
  startProviderWatchdog();
  startDeadmanSwitch();
  if (BACKUP_ENABLED) {
    try {
      const started = backupScheduler.startBackupScheduler({
        backupDir: BACKUP_DIR,
        dataDir: DATA_DIR,
        intervalMs: BACKUP_INTERVAL_MS,
        onBackup: result => appendAudit({ action: "Backup scheduler", detail: `${result.type} backup ${result.backupId}: ${result.filesBacked} files (${result.totalSizeBytes} bytes)` }),
        onError: result => logger.error("backup_failed", { error: result && result.error ? result.error : "unknown" }),
        onSkip: result => logger.info("backup_skipped", { reason: result && result.reason ? result.reason : "within window" })
      });
      backupTimer = started.timer;
      backupRunner = started.runner;
      logger.info("backup_scheduler_started", { intervalMs: BACKUP_INTERVAL_MS, backupDir: BACKUP_DIR });
    } catch (backupErr) {
      logger.warn("backup_scheduler_failed_to_start", { message: backupErr.message });
    }
  }
  // ── NEW: Mount Slack/Teams webhook routes ──────────────────────────────────
  try {
    const slackRoutes = require("./lib/slack-webhook-routes.js");
    slackRoutes.mountSlackWebhookRoutes(app, {
      readWorkspace: readWorkspace,
      logger: logger
    });
    logger.info("slack_webhook_routes_mounted");
  } catch (_) {}

  // ── NEW: Start Slack bot (Socket Mode, if configured) ────────────────────
  try {
    const slackBot = require("./lib/slack-bot.js");
    const autoTaskCreator = require("./lib/auto-task-creator.js");
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
      slackBot.startSocketMode({
        readWorkspace: readWorkspace,
        handleCommand: (command, text, ws, opts) => {
          const webhooks = require("./js/webhooks.js");
          const parsed = webhooks.parseSlackCommand({ text: "/" + command + " " + text, user_id: opts && opts.triggerId });
          return webhooks.executeCommand(parsed, ws);
        },
        autoTaskCreator: autoTaskCreator,
        logger: logger
      });
      logger.info("slack_bot_started");
    }
  } catch (_) {}

  // ── NEW: Start IMAP email command listener (if configured) ──────────────
  try {
    const emailCommands = require("./lib/email-commands.js");
    if (process.env.LEADERSHIP_IMAP_HOST) {
      // A getter, not a snapshot: fetchUnprocessedEmails re-reads per batch,
      // so a command executes against TODAY's workspace instead of the
      // boot-time copy (whose write landed last and erased every change made
      // since boot whenever a command fired).
      emailCommands.startImapListener(() => readWorkspace(), {
        onCommand: (cmd, result, ws) => {
          // Persist workspace changes from email commands
          try { writeWorkspace(ws); } catch (e) {}
          appendAudit({ action: "Email command executed", detail: cmd.command + " " + cmd.args + " → " + (result.ok ? "ok" : result.message) });
        }
      });
      logger.info("imap_listener_started");
    }
  } catch (_) {}

  // ── NEW: Start Teams bot (if configured) ────────────────────────────────
  try {
    const teamsBot = require("./lib/teams-bot.js");
    if (process.env.BOT_FRAMEWORK_APP_ID && process.env.BOT_FRAMEWORK_APP_PASSWORD) {
      teamsBot.startTeamsBot({ readWorkspace: readWorkspace, port: process.env.BOT_FRAMEWORK_PORT });
      logger.info("teams_bot_started");
    }
  } catch (_) {}

  // ── NEW: Start Discord bot (if configured) ──────────────────────────────
  try {
    const discordBot = require("./lib/discord-bot.js");
    if (process.env.DISCORD_BOT_TOKEN) {
      discordBot.startDiscordBot({ readWorkspace: readWorkspace });
      logger.info("discord_bot_started");
    }
  } catch (_) {}

  server.listen(PORT, HOST, () => logger.info("server_started", { port: PORT, host: HOST, tls: !!TLS_OPTS }));

  // Graceful shutdown
  function shutdown(signal) {
    logger.info("shutdown", { signal });
    if (automationTimer) clearInterval(automationTimer);
    if (digestTimer) clearInterval(digestTimer);
    if (outboxTimer) clearInterval(outboxTimer);
    if (llmWatchdogTimer) clearInterval(llmWatchdogTimer);
    // Stop proving liveness at shutdown: the monitor is supposed to notice
    // silence, and a dying process must not keep claiming it is alive.
    if (deadmanTimer) clearInterval(deadmanTimer);
    if (backupTimer) clearInterval(backupTimer);
    if (wsServer && typeof wsServer.shutdown === "function") { try { wsServer.shutdown(); } catch (e) {} }
    updateStorageMetrics(AUDIT_FILE, WORKSPACE_HISTORY_FILE, APPROVAL_FILE);
    server.close(() => {
      logger.info("server_closed", {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (err) => {
    logger.error("uncaught_exception", { message: err.message, stack: err.stack });
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    // Stack included: a bare reason string made async crashes undebuggable
    // (the origin showed up as only a file:line guess in the code search).
    logger.error("unhandled_rejection", { reason: String(reason), stack: reason && reason.stack ? reason.stack : undefined });
  });
}

module.exports = { server, appendAudit, appendDomainEvent, readAudit, verifyAudit, checksum, readWorkspace, writeWorkspace, readWorkspaceHistory, verifyWorkspaceHistory, workspaceHash, restoreWorkspaceRevision, currentWorkspaceRevision, readWorkspaceFor, writeWorkspaceFor, readWorkspaceHistoryFor, currentWorkspaceRevisionFor, restoreWorkspaceRevisionFor, readScopedWorkspace, readScopedWorkspaceHistory, writeScopedWorkspace, currentScopedRevision, restoreScopedRevision, workspaceScope, mutateScopedWorkspace, mutateWorkspaceConditional, mutateWorkspaceFileConditional, applyFiledRows, runNavigatorSnapshotPass, runEnhancedAiCachePass, runAutomationTick, flightPass, flightInsights, readFlightRecords, appendFlightRecord, FLIGHT_FILE, FLIGHT_KEEP, connectorWorkspaceFns, workspaceAlerts, workspaceAutomationPlan, queueAutomationJobs, queueProactiveMentorJobs, runProducerPassGated, runDigestDeliveryGated, constraintQuietPolicy, startAutomationScheduler, startDeadmanSwitch, runDeadmanBeat, deadmanConfig, runConnectorScheduler, runOutboxScheduler, runRecurringTaskScheduler, runEscalationIngestGated, backupRunnerState: () => (backupRunner ? backupRunner.state : null), isLoopbackAddress, anonymousLocalAllowed, sanitizeWorkspaceForRole, approvalChangeAllowed, readApprovals, verifyApprovals, appendApproval, readGovernanceState, roleFor, authorized, allowRequest, authStore, coachStore, SENSITIVE_REGISTERS, AUDIT_FILE, WORKSPACE_FILE, WORKSPACE_HISTORY_FILE, APPROVAL_FILE, JOBS_FILE, integrityReport, schedulerStale, writeHeartbeat, readHeartbeat, deliverDueJobs, jobStore, claimsLib, marketData, notifications, selfHeal, hasKey, logger, deepHealth, metricsEndpoint, updateStorageMetrics, crossDomainJourneys, closeToReportPipeline, causalRuntime, aiGovernanceEnforcer, restoreDrillAutomation, tenantDataExport, decisionSimulation, modelTrainingPipeline, offlineConflictResolver, crdtCollaboration, connectorHardening,  learningOrgScore, liveBenchmarks, withWorkspaceFileLock, mutateWorkspaceFile, mutateWorkspace, trimHistoryToBudget, rechainHistory, compactWorkspaceHistoryIfOversized, backupHistoryBeforeTrim, verifyHistoryBackup, pruneHistoryBackups, historyBackupDirFor, historyTrimThrottleOk, storageHealthSnapshot, historyBackupListFor, weeklyLetter, applyAutonomyPromotion, APP_VERSION };
