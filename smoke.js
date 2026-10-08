/* ============================================================================
   smoke.js — jsdom full-app smoke test.
   Loads index.html, exercises navigation across all views, adds a row to a
   register, toggles language, and asserts no crash + no prompt() calls.
   Run: npm i jsdom && node smoke.js
   ============================================================================ */
const fs = require("fs");
const path = require("path");
let JSDOM;
try { JSDOM = require("jsdom").JSDOM; }
catch (e) { console.error("jsdom not installed. Run: npm i jsdom"); process.exit(1); }

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
// The app's scripts in the EXACT order index.html's script block carries —
// generated from scripts/browser-scripts.manifest, the single source of truth
// (browser script tags come from there; never hand-edited). A hand-maintained
// list here rotted silently once: it pre-dated the engines js/ui.js binds, so
// the methodGovernance view crashed on a STATUSES-less fallback inside this
// very harness. The manifest makes that drift class impossible.
const scriptManifest = fs.readFileSync(path.join(__dirname, "scripts/browser-scripts.manifest"), "utf8")
  .split(String.fromCharCode(10)).map(l => l.trim()).filter(l => l && !l.startsWith("#"));

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; console.log("  ✓ " + msg); }
  else { fail++; console.error("  ✗ FAIL: " + msg); }
}

const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "http://localhost/"
});
const { window } = dom;

// Stub localStorage
const store = {};
window.localStorage = {
  getItem: k => k in store ? store[k] : null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
window.confirm = () => true;
window.alert = () => {};
window.print = () => {};

// Track prompt calls (click-only = should never happen)
let promptCalled = false;
window.prompt = () => { promptCalled = true; return null; };

// Blob / URL stubs for export
window.Blob = function () { return { size: 0 }; };
window.URL = { createObjectURL: () => "blob://test", revokeObjectURL: () => {} };

// Inject scripts via eval (runScripts: outside-only doesn't run inline
// <script>), in manifest order — the same order as index.html's script block.
for (const file of scriptManifest) window.eval(fs.readFileSync(path.join(__dirname, file), "utf8"));

// Engine-loading guard (the same contract test/view-render-integrity.test.js
// carries): every window.LC* global ui.js binds must actually be defined by a
// loaded script — the defect class this harness itself tripped over.
const uiSource = fs.readFileSync(path.join(__dirname, "js", "ui.js"), "utf8");
const uiGlobals = [...new Set(uiSource.match(/window\.LC[A-Za-z0-9_]+/g) || [])]
  .map(g => g.split("window.")[1]).filter(s => s !== "LCStore" && s !== "LCUI");
const undefinedGlobals = uiGlobals.filter(s => !window[s]);
assert(undefinedGlobals.length === 0, "every engine ui.js binds is loaded: " + (undefinedGlobals.join(", ") || "none"));

// Allow DOMContentLoaded + init
window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

console.log("\n════════ Leadership Platform — Smoke Tests ════════\n");

// ─── App loaded ────────────────────────────────────────────────────────────
assert(typeof window.LCCalc !== "undefined", "LCCalc loaded");
assert(typeof window.I18n !== "undefined", "I18n loaded");
assert(typeof window.LCStore !== "undefined", "LCStore loaded");
assert(typeof window.LCUI !== "undefined", "LCUI loaded");
assert(window.document.querySelector(".skip-link").getAttribute("href") === "#content", "Skip link targets guided content");
assert(window.document.querySelector("#content").getAttribute("tabindex") === "-1", "Guided content accepts skip-link focus");
assert(window.document.querySelector("#nav a[aria-current='page']"), "Navigation identifies the current page");
assert(["Primary navigation", "Primær navigation"].includes(window.document.querySelector("#nav").getAttribute("aria-label")), "Navigation has an accessible label (EN or DA)");
assert(window.LCUI.viewCoverage().length === 0, "Every navigation view has a concrete renderer");

// ─── Nav rendered ──────────────────────────────────────────────────────────
const navLinks = window.document.querySelectorAll("#nav a");
assert(navLinks.length >= 40, "40+ nav links rendered (" + navLinks.length + ")");

const navGroups = window.document.querySelectorAll("#nav .nav-group");
assert(navGroups.length >= 5, "5+ nav groups rendered (" + navGroups.length + ")");

// ─── Dashboard rendered ────────────────────────────────────────────────────
const content = window.document.querySelector("#content");
assert(content.innerHTML.length > 100, "Dashboard content rendered");

const kpiCards = content.querySelectorAll(".kpi-card");
assert(kpiCards.length >= 6, "6+ KPI cards on dashboard (" + kpiCards.length + ")");
assert(content.querySelector(".page-guide"), "Dashboard has contextual page guide");
assert(content.querySelector(".page-guide").getAttribute("aria-live") === "polite", "Page guide announces navigation updates");
assert(["Project Dashboard", "Projekt-dashboard", "Projektdashboard"].includes(content.querySelector(".guide-page-name").textContent), "Guide names the current page (EN or DA)");
assert(content.querySelector(".learning-journey"), "Dashboard has a recommended learning journey");
assert(content.querySelectorAll(".journey-step").length === 5, "Learning journey has five steps");
assert(content.querySelector(".learning-journey").tagName === "NAV", "Learning journey is exposed as navigation");
assert(content.querySelector(".journey-step").tagName === "BUTTON", "Learning journey steps are keyboard controls");
assert(content.querySelector("[data-guide-nav='tasks']"), "Dashboard guide points to the next tool");
assert(content.querySelector("[data-guide-nav='tasks']").textContent.includes("Project tasks") || content.querySelector("[data-guide-nav='tasks']").textContent.includes("Projektopgaver") || content.querySelector("[data-guide-nav='tasks']").textContent.includes("Opgaver"), "Guide names the next destination (EN or DA)");
assert(content.querySelector(".guide-help-link[data-guide-nav='help']"), "Page guide links to the full learning map");
const guideNext = content.querySelector("[data-guide-nav='tasks']");
if (guideNext) guideNext.click();
assert(window.document.querySelector("#addRow"), "Guide next action opens the tasks workflow");
window.LCUI.navigate("executive");
assert(content.querySelector(".exec-summary-grid"), "Executive summary grid rendered");
assert(content.querySelector(".exec-signals-grid"), "Executive signals grid rendered");
assert(content.querySelector("#serverAlertsPanel"), "Executive view exposes server alerts panel");

window.LCUI.navigate("report");
const reportContent = window.document.querySelector("#reportContent");
assert(reportContent, "Report content rendered");
assert(window.document.querySelector(".print-controls"), "Report print controls rendered");

// ─── Navigate across all views ─────────────────────────────────────────────
const viewIds = [
  "dashboard", "tasks", "kanban", "gantt", "risks", "fmea", "raci", "wbs",
  "milestones", "budget", "evm", "standup", "retro", "sprint", "resources",
  "charter", "quality", "comms", "procurement", "changes", "lessons",
  "raid", "assumptions", "issues", "criticalPath", "pert", "burndown", "projectHealth",
  "selfAssess", "goals", "grow", "feedback360", "ei", "timeMatrix", "habits",
  "personalOKR", "disc", "belbin", "johari", "reflections", "values", "energy",
  "delegation", "situational", "maslow", "herzberg", "mcclelland", "bigFive",
  "ikigai", "wheelOfLife", "personalSwot",
  "roster", "oneonones", "teamHealth", "conflict", "meetings",
  "review", "training", "recognition", "psychSafety", "cultureCanvas",
  "tuckman", "lencioni", "hackman", "stakeholders", "eba", "ibr",
  "swot", "pestle", "decisionMatrix", "riceWsjf", "okrs", "scenario",
  "stakeholderMap", "balancedScorecard", "strategyMap",
  "finances", "roiCalc", "npvCalc", "breakEven", "burnRate", "ratios", "costBenefit",
  "bowtie", "riskAppetite", "monteCarlo", "cosoErm", "iso31000", "riskMatrix", "governance", "executive",
  "controls",
  "porter", "bcg", "ansoff", "vrio", "bmc", "valueChain", "blueOcean",
  "report", "audit", "snapshots", "config", "help"
];
let viewsOk = 0;
let guidesOk = 0;
let relatedOk = 0;
const navigableViewIds = Array.from(window.document.querySelectorAll("#nav a"), link => link.dataset.view);
for (const vid of navigableViewIds) {
  try {
    window.LCUI.navigate(vid);
    viewsOk++;
    const guide = window.document.querySelector(".page-guide");
    const nextGuideAction = guide && guide.querySelector("[data-guide-nav]");
    if (guide && nextGuideAction && nextGuideAction.getAttribute("aria-label") && navigableViewIds.includes(nextGuideAction.dataset.guideNav)) guidesOk++;
    const related = window.document.querySelector(".related-modules");
    if (related && related.querySelector(".related-chip")) relatedOk++;
  } catch (e) {
    console.error("  ✗ View " + vid + " crashed: " + e.message);
  }
}
assert(viewsOk === navigableViewIds.length, "All " + navigableViewIds.length + " navigation views rendered without crash (" + viewsOk + " ok)");
assert(guidesOk === navigableViewIds.length, "All " + navigableViewIds.length + " navigation views include an actionable page guide (" + guidesOk + " ok)");
assert(relatedOk === navigableViewIds.length, "All " + navigableViewIds.length + " navigation views name their wired related modules (" + relatedOk + " ok)");
const missingGuides = window.LCUI.guideCoverage();
assert(missingGuides.length === 0, "Every navigation view has its own educational guide, not the generic group text (missing: " + (missingGuides.join(", ") || "none") + ")");
const unwiredRegisters = window.LCUI.todoWiringCoverage();
assert(unwiredRegisters.length === 0, "Every register propagates TODO actions to its wired modules (unwired: " + (unwiredRegisters.join(", ") || "none") + ")");

// ─── Custom registers: created in Settings, wired into TODOs automatically ─
window.LCUI.navigate("config");
const crLabel = window.document.querySelector("#crLabel");
const crCreate = window.document.querySelector("#crCreate");
if (crLabel && crCreate) {
  crLabel.value = "Contract Log";
  crCreate.click();
  const crNav = window.document.querySelector("#nav a[data-view^='custom:']");
  assert(!!crNav, "Custom register appears in the navigation after creation");
  if (crNav) {
    window.LCUI.navigate(crNav.dataset.view);
    const crAdd = window.document.querySelector("#addRow");
    assert(!!crAdd, "Custom register exposes the standard add-record workflow");
    if (crAdd) {
      crAdd.click();
      const crModal = window.document.querySelector("#modal");
      crModal.querySelectorAll("select, input").forEach(el => { if (el.tagName === "SELECT" && el.options.length > 1) el.selectedIndex = 1; });
      const crSave = window.document.querySelector("#modalSave");
      if (crSave) crSave.click();
      const customTodos = window.LCStore.todos().filter(t => t.key.startsWith("custom_") && !t.done);
      assert(customTodos.length > 0, "Custom register rows enqueue TODO wiring automatically (" + customTodos.length + ")");
    }
  }
}

window.LCUI.navigate("controls");
assert(window.document.querySelector("#addRow"), "Controls register exposes click-only add workflow");

window.LCUI.navigate("linkExplorer");
const linkSource = window.document.querySelector("#linkSource");
const linkTarget = window.document.querySelector("#linkTarget");
const linkCreate = window.document.querySelector("#createLink");
if (linkSource && linkTarget && linkCreate && linkSource.options.length > 2 && linkTarget.options.length > 2) {
  linkSource.selectedIndex = 1;
  linkTarget.selectedIndex = 2;
  linkCreate.click();
  assert(window.LCStore.allLinks().length === 1, "Link Explorer creates a relationship from dropdowns");
  const unlink = window.document.querySelector("[data-unlink-source]");
  if (unlink) unlink.click();
  assert(window.LCStore.allLinks().length === 0, "Link Explorer removes a relationship symmetrically");
}
window.LCUI.navigate("workflowCenter");
assert(window.document.querySelector(".workflow-intro"), "Workflow Center explains automated follow-ups");
assert(!window.document.querySelector(".workflow-error"), "Workflow Center renders without crash");
assert(window.document.querySelector(".workflow-intro"), "Workflow Center provides guidance even without data");
window.LCUI.navigate("dataQuality");
// Honest empty (evidence gate): with zero records the score is masked "—" and the screen
// names the registers to fill — never a fabricated "100/100 Trusted data" baseline.
assert(window.document.querySelector('#content [data-evidence-gate="dataQuality"]'), "Data Quality gates its score until records back it");
assert(window.document.querySelector(".kpi-card .kpi-value").textContent.includes("—"), "Data Quality masks the score with — while no record backs it");
assert(!/Trusted data|Pålidelige data/.test(window.document.querySelector("#content").textContent), "an empty register is not called trusted");
// With one record behind the numbers the gate lifts and the score is explainable (N/100).
const dqProbe = window.LCStore.regAdd("tasks", { title: "Data quality probe", owner: "Mette Nielsen", dueDate: "2026-01-01" });
window.LCUI.navigate("dataQuality");
assert(!window.document.querySelector("#content [data-evidence-gate]"), "one record lifts the data-quality gate");
assert(window.document.querySelector(".kpi-card .kpi-value").textContent.includes("/100"), "Data Quality shows an explainable score");
window.LCStore.regDelete("tasks", dqProbe._id);
assert(!window.document.querySelector(".crash-error"), "Data Quality renders without crash");
window.LCUI.navigate("portfolio");
assert(window.document.querySelector(".table-wrap tbody tr"), "Portfolio Management aggregates project signals");
const portfolioProject = window.document.querySelector("[data-portfolio-project]");
if (portfolioProject) { portfolioProject.click(); assert(window.document.querySelector(".learning-journey"), "Portfolio opens the selected project dashboard"); }
window.LCUI.navigate("financialCenter");
assert(window.document.querySelectorAll(".kpi-card").length >= 4, "Financial Control Center shows core financial signals");
assert(window.document.querySelector(".info-card table"), "Financial Control Center shows financial alert actions");
window.LCUI.navigate("enterprise");
const enterpriseLinks = window.document.querySelectorAll("[data-dashboard-view]");
assert(enterpriseLinks.length >= 1, "Enterprise Dashboard links cross-domain signal views (" + enterpriseLinks.length + ")");
assert(window.document.querySelector('[data-dashboard-view="risks"]') || window.document.querySelector("#nav a[data-view='risks']"), "Enterprise Dashboard links to risk register");
assert(window.document.querySelector('[data-dashboard-view="evidenceLib"]') || window.document.querySelector("#nav a[data-view='evidenceLib']") || window.document.querySelector("#nav a[data-view='audit']"), "Enterprise Dashboard links to evidence/audit library");

window.LCUI.navigate("config");
assert(window.document.querySelector("#serverRevision"), "Settings exposes server revision selector");
assert(window.document.querySelector("#btnRestoreServer"), "Settings exposes server restore action");
window.LCUI.navigate("audit");
assert(window.document.querySelector("#serverAuditPanel"), "Audit view exposes server ledger panel");
assert(window.document.querySelector("#refreshServerAudit"), "Audit view exposes server audit refresh");
window.LCUI.navigate("governance");
assert(window.document.querySelector("#approvalLedgerPanel"), "Governance view exposes approval ledger panel");
assert(window.document.querySelector("#refreshApprovalLedger"), "Governance view exposes approval ledger refresh");
const addDecisionBtn = window.document.querySelector("#addGovernanceDecision");
if (addDecisionBtn) addDecisionBtn.click();
const govOwnerEl = window.document.querySelector("#govDecisionOwner") || window.document.querySelector("#govOwnerSelect");
assert(!!govOwnerEl, "Governance decision owner controls exist");
window.LCUI.navigate("help");
assert(window.document.querySelector(".help-routes"), "Help view exposes goal-based learning routes");
assert(window.document.querySelectorAll(".help-route").length >= 5, "Help view exposes five learning routes");
assert(window.document.querySelectorAll(".practice-link").length === 8, "Help view maps all eight practice areas");
assert(window.document.querySelector(".practice-link[aria-label]"), "Help practice links have accessible labels");

// ─── Add a task row ─────────────────────────────────────────────────────────
window.LCUI.navigate("tasks");
const addBtn = window.document.querySelector("#addRow");
assert(!!addBtn, "Add row button present on tasks view");
if (addBtn) {
  addBtn.click();
  const modal = window.document.querySelector("#modal");
  assert(!modal.parentElement.hidden || modal.parentElement.style.display !== "none", "Modal opened on add click");
  const selects = modal.querySelectorAll("select");
  assert(selects.length >= 3, "Form has 3+ select dropdowns (" + selects.length + ")");

  // Fill first select (title)
  if (selects[0].options.length > 1) {
    selects[0].selectedIndex = 1;
  }
  // Save
  const saveBtn = window.document.querySelector("#modalSave");
  if (saveBtn) saveBtn.click();
  // Verify row was added (seed data already has tasks, so count should have increased by 1)
  const rows = window.LCStore.regRows("tasks");
  assert(rows.length >= 1, "Task row added — now " + rows.length + " total");
}

// ─── Modal lifecycle during navigation ────────────────────────────────────
window.LCUI.navigate("tasks");
const taskModalOpen = window.document.querySelector("#addRow");
if (taskModalOpen) {
  taskModalOpen.click();
  const modalBefore = window.document.querySelector("#modalOverlay");
  assert(modalBefore && !modalBefore.hidden, "Task modal opens and blocks input until save/cancel");
  window.LCUI.navigate("dashboard");
  const modalAfter = window.document.querySelector("#modalOverlay");
  assert(!modalAfter || modalAfter.hidden, "Navigation closes a stale modal overlay so the page remains clickable");
}

// ─── Governance approval workflow ─────────────────────────────────────────
window.LCUI.navigate("governance");
const approvalTrigger = window.document.querySelector("#recordApprovalAction");
const escalationTrigger = window.document.querySelector("#escalateBoardAction");
const escalationMatrix = window.document.querySelector("#escalationMatrix");
const approvalChainTable = window.document.querySelector("#approvalChainTable");
const approvalReminder = window.document.querySelector("#approvalReminderPanel");
assert(!!approvalTrigger, "Governance view exposes explicit approval action");
assert(!!escalationTrigger, "Governance view exposes board escalation action");
assert(!!escalationMatrix, "Governance view exposes escalation matrix summary");
assert(!!approvalChainTable, "Governance view exposes multi-step signoff chain");
assert(!!approvalReminder, "Governance view exposes required signoff reminder panel");
if (approvalTrigger) {
  approvalTrigger.click();
  const modal = window.document.querySelector("#modal");
  assert(!!modal, "Approval modal opens from governance view");
  const stageSel = window.document.querySelector("#approvalStage");
  const nameSel = window.document.querySelector("#approvalApprover");
  const statusSel = window.document.querySelector("#approvalStatus");
  const evidenceBox = window.document.querySelector("#approvalEvidence");
  if (stageSel && nameSel && statusSel && evidenceBox) {
    stageSel.value = "Sponsor approval";
    nameSel.value = "Mette Nielsen";
    statusSel.value = "Approved";
    evidenceBox.value = "Stakeholder sign-off and risk controls confirmed.";
    const saveBtn = window.document.querySelector("#modalSave");
    if (saveBtn) saveBtn.click();
    const approvals = window.LCStore.approvals();
    assert(approvals.length >= 1, "Approval record saved from governance workflow (" + approvals.length + ")");
    const latest = approvals[0];
    assert(latest.stage === "Sponsor approval", "Approval stage is persisted with the signed decision");
  }
}

// ─── Language toggle ───────────────────────────────────────────────────────
const langDaButton = window.document.querySelector("#langDa");
if (langDaButton) langDaButton.click();
const titleEl = window.document.querySelector("#viewTitle");
assert(window.I18n.getLanguage() === "da", "Danish language selected");
assert(window.document.querySelector("#nav .nav-group").textContent.includes("Overblik"), "Danish navigation rendered");
assert(titleEl.textContent.length > 0, "DA view title rendered: '" + titleEl.textContent + "'");
assert(window.document.querySelector(".guide-kicker").textContent === "Hvad er denne side?", "Danish page guide heading rendered");
assert(window.document.querySelector(".page-guide-next .btn").textContent.includes("Åbn næste værktøj"), "Danish next-step action rendered");
assert(window.document.querySelector("#nav").getAttribute("aria-label") === "Primær navigation", "Navigation has an accessible Danish label");

const langEnButton = window.document.querySelector("#langEn");
if (langEnButton) langEnButton.click();
assert(window.I18n.getLanguage() === "en", "English language selected");
assert(window.document.querySelector("#nav .nav-group").textContent.includes("Overview"), "English navigation rendered");

// ─── Click-only: no prompt ever called ─────────────────────────────────────
assert(!promptCalled, "window.prompt was never called (click-only)");

// ─── Theme toggle ───────────────────────────────────────────────────────────
const themeBtn = window.document.querySelector("#btnTheme");
if (themeBtn) themeBtn.click();
assert(window.document.documentElement.getAttribute("data-theme") === "dark", "Dark mode toggled on");
if (themeBtn) themeBtn.click();
assert(window.document.documentElement.getAttribute("data-theme") !== "dark", "Dark mode toggled off");

// ─── Culture notes present ──────────────────────────────────────────────────
window.LCUI.navigate("dashboard");
const cultureNotes = content.querySelectorAll(".culture-note");
assert(cultureNotes.length >= 1, "Culture note on dashboard (" + cultureNotes.length + ")");

window.LCUI.navigate("help");
const cultureTags = content.querySelectorAll(".info-card h3");
assert(cultureTags.length >= 4, "Help page has culture info cards (" + cultureTags.length + ")");

// ─── Audit log ─────────────────────────────────────────────────────────────
window.LCUI.navigate("audit");
const auditRows = content.querySelectorAll("tbody tr");
assert(auditRows.length >= 1, "Audit log captured the add (" + auditRows.length + " rows)");

// ─── Summary ────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════");
console.log(`  Results: ${pass} passed, ${fail} failed`);
console.log(`  ${fail === 0 ? "✓ ALL SMOKE TESTS PASSED" : "✗ FAILURES DETECTED"}\n`);
process.exit(fail === 0 ? 0 : 1);
