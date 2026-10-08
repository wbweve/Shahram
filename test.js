/* ============================================================================
   test.js — Unit tests for the leadership calculation engine (calc.js).
   Run: node test.js
   ============================================================================ */
const C = require("./js/calc.js");
const I = require("./js/i18n.js");
const W = require("./js/workflows.js");

// THE CORPUS DECLARES ITS LANGUAGE (round 69's rule, made load-bearing by
// round 70's decree): this run asserts the ENGLISH face of every bilingual
// string up to the i18n section — so the corpus says "en" out loud. An
// undeclared corpus answers the app's Danish-first default (the I18n echo
// is gone: the translation layer holds no private English default any more).
// The i18n section below flips both faces on purpose and LEAVES Danish
// declared — the tail asserts Danish from there, and the declaration it
// leaves behind is that section's word, never an accident.
I.setLanguage("en");

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error("  ✗ FAIL: " + msg); }
}
function eq(actual, expected, msg) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) console.error(`  ✗ FAIL: ${msg}\n    expected: ${JSON.stringify(expected)}\n    got:      ${JSON.stringify(actual)}`);
  assert(ok, msg);
}
function approx(actual, expected, msg, tol) {
  tol = tol || 0.01;
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) console.error(`  ✗ FAIL: ${msg}\n    expected ~${expected}\n    got      ${actual}`);
  assert(ok, msg);
}

console.log("\n════════ Leadership Platform — Engine Tests ════════\n");

// ─── RPN ────────────────────────────────────────────────────────────────────
console.log("RPN:");
eq(C.rpn(8, 7, 6), 336, "rpn basic");
eq(C.rpn("", 7, 6), null, "rpn empty sev → null");
eq(C.rpn(1, 1, 1), 1, "rpn minimum");
eq(C.rpnBand(336), "1-CRITICAL", "rpnBand critical");
eq(C.rpnBand(100), "2-HIGH", "rpnBand high");
eq(C.rpnBand(50), "3-MEDIUM", "rpnBand medium");
eq(C.rpnBand(49), "4-LOW", "rpnBand low");
eq(C.rpnBand(null), "", "rpnBand null");
eq(C.rpnBand(200), "1-CRITICAL", "rpnBand boundary 200 → critical");

// ─── Generic helpers (num / daysBetween) ───────────────────────────────────
console.log("\nGeneric helpers:");
eq(C.num("12"), 12, "num parses numeric string");
eq(C.num(0), 0, "num keeps zero");
eq(C.num(true), null, "num boolean → null");
eq(C.num(false), null, "num false → null");
eq(C.num(""), null, "num empty string → null");
eq(C.num("  "), null, "num whitespace → null");
eq(C.num(null), null, "num null → null");
eq(C.num(undefined), null, "num undefined → null");
eq(C.num({}), null, "num object → null");
eq(C.num("abc"), null, "num non-numeric → null");
eq(C.daysBetween("2026-01-01", "2026-01-02"), 1, "daysBetween forward");
eq(C.daysBetween("2026-01-02", "2026-01-01"), -1, "daysBetween backward");
eq(C.daysBetween(null, "2026-01-02"), null, "daysBetween null start → null");
eq(C.daysBetween("not-a-date", "2026-01-02"), null, "daysBetween invalid date → null");

// ─── SMART ───────────────────────────────────────────────────────────────────
console.log("\nSMART:");
eq(C.smartScore(5, 5, 5, 5, 5), 5, "SMART perfect");
approx(C.smartScore(3, 4, 3, 4, 3), 3.4, "SMART average");
eq(C.smartScore("", 4, 3, 4, 3), null, "SMART missing → null");
eq(C.smartVerdict(5), "Excellent", "SMART verdict excellent");
eq(C.smartVerdict(4), "Strong", "SMART verdict strong");
eq(C.smartVerdict(3), "Needs work", "SMART verdict needs work");
eq(C.smartVerdict(1), "Weak", "SMART verdict weak");

// ─── RICE / WSJF ─────────────────────────────────────────────────────────────
console.log("\nRICE/WSJF:");
approx(C.rice(1000, 3, 80, 5), 480, "RICE basic");
eq(C.rice(0, 3, 80, 5), 0, "RICE zero reach → 0");
approx(C.wsjf(8, 3, 5, 2), 8, "WSJF basic");

// ─── Decision matrix ─────────────────────────────────────────────────────────
console.log("\nDecision Matrix:");
const dm = C.decisionMatrix(
  [{ name: "A", scores: { c1: 5, c2: 3 } }, { name: "B", scores: { c1: 2, c2: 4 } }],
  [{ id: "c1", name: "C1", weight: 3 }, { id: "c2", name: "C2", weight: 2 }]
);
eq(dm[0].name, "A", "Decision matrix ranks A first");
eq(dm[0].score, 21, "Decision matrix A score");
eq(dm[1].score, 14, "Decision matrix B score");

// ─── SWOT ────────────────────────────────────────────────────────────────────
console.log("\nSWOT:");
assert(C.swotStrategy(["s1"], [], ["o1"], []).includes("SO"), "SWOT SO strategy");
assert(C.swotStrategy([], ["w1"], ["o1"], []).includes("WO"), "SWOT WO strategy");
assert(C.swotStrategy(["s1"], [], [], ["t1"]).includes("ST"), "SWOT ST strategy");
assert(C.swotStrategy([], ["w1"], [], ["t1"]).includes("WT"), "SWOT WT strategy");
assert(C.swotStrategy(["s1"], ["w1"], ["o1", "o2"], []).includes("WO"), "SWOT strengths < opportunities → WO (not SO)");
assert(C.swotStrategy([], [], [], []).includes("Fill in more quadrants"), "SWOT empty fallback");
assert(C.swotStrategy(["s1"], [], [], []).includes("Fill in more quadrants"), "SWOT strength-only → fallback");
assert(C.swotStrategy([], [], ["o1"], []).includes("Fill in more quadrants"), "SWOT opportunity-only → fallback");
assert(C.swotStrategy([], [], [], ["t1"]).includes("Fill in more quadrants"), "SWOT threat-only → fallback");
assert(C.swotStrategy([], ["w1"], [], []).includes("Fill in more quadrants"), "SWOT weakness-only → fallback");
assert(C.swotStrategy(null, ["w1"], ["o1"], null).includes("WO"), "SWOT null strengths → WO");
assert(C.swotStrategy(["s1"], null, null, null).includes("Fill in more quadrants"), "SWOT null opportunities → fallback");
assert(C.swotStrategy(["s1"], null, ["o1", "o2"], null).includes("Fill in more quadrants"), "SWOT null weaknesses → fallback");

// ─── Eisenhower ──────────────────────────────────────────────────────────────
console.log("\nEisenhower:");
assert(C.eisenhowerQuadrant(5, 5).includes("Q1"), "Eisenhower Q1");
assert(C.eisenhowerQuadrant(1, 5).includes("Q2"), "Eisenhower Q2");
assert(C.eisenhowerQuadrant(5, 1).includes("Q3"), "Eisenhower Q3");
assert(C.eisenhowerQuadrant(1, 1).includes("Q4"), "Eisenhower Q4");
eq(C.eisenhowerQuadrant(null, 5), "", "Eisenhower null urgent → empty");
eq(C.eisenhowerQuadrant(5, undefined), "", "Eisenhower undefined important → empty");
assert(C.eisenhowerQuadrant(3, 3).includes("Q1"), "Eisenhower boundary 3,3 → Q1");
assert(C.eisenhowerQuadrant(2, 2).includes("Q4"), "Eisenhower 2,2 → Q4");

// ─── DISC ───────────────────────────────────────────────────────────────────
console.log("\nDISC:");
assert(C.discStyle({ D: 80, I: 40, S: 30, C: 50 }).includes("Dominance"), "DISC D dominant");
assert(C.discStyle({ D: 30, I: 80, S: 30, C: 50 }).includes("Influence"), "DISC I dominant");
assert(C.discStyle({ D: 30, I: 40, S: 80, C: 50 }).includes("Steadiness"), "DISC S dominant");
assert(C.discStyle({ D: 30, I: 40, S: 30, C: 80 }).includes("Conscientious"), "DISC C dominant");

// ─── Belbin ──────────────────────────────────────────────────────────────────
console.log("\nBelbin:");
const bt = C.belbinTop3({ "Plant": 5, "Shaper": 4, "Coordinator": 3, "Implementer": 2 });
eq(bt, ["Plant", "Shaper", "Coordinator"], "Belbin top 3");
eq(C.belbinTop3(null), [], "Belbin null → empty");
eq(C.belbinTop3({}), [], "Belbin empty scores → empty");
eq(C.belbinTop3({ Plant: 1, Implementer: 2, Coordinator: 4, Shaper: 5 }), ["Shaper", "Coordinator", "Implementer"], "Belbin top 3 sorts by score, not insertion order");

// ─── EI ──────────────────────────────────────────────────────────────────────
console.log("\nEmotional Intelligence:");
approx(C.eiScore({ selfAwareness: 5, selfManagement: 4, socialAwareness: 4, relationshipManagement: 5 }), 4.5, "EI score");
eq(C.eiVerdict(4.5), "High EQ — emotionally effective", "EI verdict high");
eq(C.eiVerdict(3.5), "Developing EQ — aware with room to grow", "EI verdict developing");
eq(C.eiVerdict(2), "Foundational EQ — focused development needed", "EI verdict foundational");
eq(C.eiScore(null), null, "EI null → null");
eq(C.eiScore({ selfAwareness: 5, selfManagement: "", socialAwareness: 4, relationshipManagement: 5 }), null, "EI missing pillar → null");

// ─── Psychological safety ───────────────────────────────────────────────────
console.log("\nPsychological Safety:");
approx(C.psychSafetyScore([4, 4, 3, 4, 3, 4, 4]), 3.71, "Psych safety score");
assert(C.psychSafetyVerdict(4).includes("Strong"), "Psych safety strong");
assert(C.psychSafetyVerdict(2).includes("At risk"), "Psych safety at risk");
assert(C.psychSafetyVerdict(3).includes("Moderate"), "Psych safety moderate");
eq(C.psychSafetyScore(null), null, "Psych safety non-array → null");
eq(C.psychSafetyScore([]), null, "Psych safety empty → null");
eq(C.psychSafetyScore(["x", null, ""]), null, "Psych safety all-invalid → null");
approx(C.psychSafetyScore([4, null, 5, "x"]), 4.5, "Psych safety averages only valid entries");

// ─── EVM ──────────────────────────────────────────────────────────────────────
console.log("\nEVM:");
const ev = C.evm(100000, 50000, 60000, 40000);
approx(ev.cpi, 1.5, "EVM CPI > 1 (under budget)");
approx(ev.spi, 1.2, "EVM SPI > 1 (ahead)");
approx(ev.cv, 20000, "EVM CV");
approx(ev.sv, 10000, "EVM SV");
eq(ev.eac, 66667, "EVM EAC");
eq(ev.vac, 33333, "EVM VAC");
eq(ev.tcpi, 1, "EVM TCPI");
const evZero = C.evm(100000, 50000, 40000, 0);
eq(evZero.cpi, 0, "EVM cpi 0 when no actuals");
eq(evZero.eac, 100000, "EVM eac = bac when cpi is 0");
const evDone = C.evm(100000, 100000, 100000, 50000);
eq(evDone.tcpi, 0, "EVM tcpi 0 when remaining work is 0");
eq(C.evm(100000, 100000, 90000, 100000).tcpi, 10000, "EVM tcpi uses the 1 divisor when the variance sum is not positive");

console.log("\nCash Flow:");
const forecast = C.cashFlowForecast([
  { month: "M1", inflow: 120000, outflow: 150000 },
  { month: "M2", inflow: 130000, outflow: 140000 },
  { month: "M3", inflow: 145000, outflow: 130000 },
  { month: "M4", inflow: 160000, outflow: 135000 }
], 200000);
eq(forecast.totalInflow, 555000, "Cash flow forecast totals inflow");
eq(forecast.totalOutflow, 555000, "Cash flow forecast totals outflow");
eq(forecast.netCash, 200000, "Cash flow keeps the opening balance when monthly flows net to zero");
assert(forecast.runwayMonths >= 0, "Cash-flow forecast returns a runway estimate");
assert(forecast.summary.includes("cash") || forecast.summary.includes("Cash"), "Cash flow summary is actionable");
const financialForecast = C.financialForecast([
  { estCost: 100, actCost: 110, committedCost: 120, forecastCost: 130 },
  { estCost: 50, actCost: 40, committedCost: 45, forecastCost: 55 }
], 1.2);
eq(financialForecast.planned, 150, "Financial forecast totals planned cost");
eq(financialForecast.committed, 165, "Financial forecast totals committed cost");
eq(financialForecast.forecastVariance, 35, "Financial forecast calculates forecast variance");
eq(financialForecast.stressedForecast, 222, "Financial forecast applies stress multiplier");
assert(financialForecast.forecastAccuracy >= 0 && financialForecast.forecastAccuracy <= 100, "Financial forecast reports bounded forecast accuracy");
eq(financialForecast.status, "Escalate", "Financial forecast escalates material stress exposure");

// ─── Pareto ───────────────────────────────────────────────────────────────────
console.log("\nPareto:");
const par = C.pareto([{ label: "A", value: 50 }, { label: "B", value: 30 }, { label: "C", value: 20 }]);
eq(par[0].label, "A", "Pareto sorted desc");
approx(par[0].cum, 50, "Pareto cumulative A");
approx(par[2].cum, 100, "Pareto cumulative total 100%");
eq(C.pareto([{ label: "A", value: 50 }, { label: "B", value: 0 }, { label: "C", value: -5 }]).length, 1, "Pareto filters zero/negative values");
eq(C.pareto("nope"), [], "Pareto non-array → empty");
const par2 = C.pareto([{ label: "A", value: 30 }, { label: "B", value: 50 }]);
eq(par2[0].label, "B", "Pareto sorts by value desc, not insertion order");

// ─── Stakeholder strategy ───────────────────────────────────────────────────
console.log("\nStakeholder:");
eq(C.stakeholderStrategy("High", "High"), "Manage closely", "Stakeholder HH");
eq(C.stakeholderStrategy("High", "Low"), "Keep satisfied", "Stakeholder HL");
eq(C.stakeholderStrategy("Low", "High"), "Keep informed", "Stakeholder LH");
eq(C.stakeholderStrategy("Low", "Low"), "Monitor", "Stakeholder LL");
eq(C.stakeholderStrategy("", "High"), "", "Stakeholder empty influence → empty");
eq(C.stakeholderStrategy("High", null), "", "Stakeholder null interest → empty");

// ─── GROW ─────────────────────────────────────────────────────────────────────
console.log("\nGROW:");
assert(C.growQuestions("goal").length === 5, "GROW goal questions");
assert(C.growQuestions("reality").length === 5, "GROW reality questions");
assert(C.growQuestions("options").length === 5, "GROW options questions");
assert(C.growQuestions("will").length === 5, "GROW will questions");
eq(C.growQuestions("goal"), ["What do you want to achieve?", "How will you know you've reached it?", "What does success look like?", "When do you want this by?", "Is this goal within your control?"], "GROW goal question content");
eq(C.growQuestions("reality"), ["What is happening right now?", "What have you tried so far?", "What's working and what isn't?", "What's getting in the way?", "Who else is involved?"], "GROW reality question content");
eq(C.growQuestions("options"), ["What could you do?", "What else could you try?", "What would you do if there were no barriers?", "Who could help you?", "What are the pros and cons of each option?"], "GROW options question content");
eq(C.growQuestions("will"), ["What will you actually do?", "When will you start?", "What might stop you, and how will you handle it?", "On a scale of 1–10, how committed are you?", "How can I support you?"], "GROW will question content");
eq(C.growQuestions("unknown"), [], "GROW unknown stage → empty");

// ─── 5 Whys & Fishbone ───────────────────────────────────────────────────────
console.log("\n5 Whys & Fishbone:");
eq(C.fiveWhys("p", ["a", "b", ""]), "b", "5 Whys returns last truthy answer");
eq(C.fiveWhys("p", []), "", "5 Whys empty answers → empty");
eq(C.fiveWhys("p", null), "", "5 Whys null answers → empty");
const fb = C.fishboneAnalysis({ people: ["Ann"], machines: ["Lathe"] });
assert(fb.rootCauses.length === 2, "Fishbone keeps only populated categories");
assert(fb.summary.includes("people: Ann"), "Fishbone summary lists categories");
const fbEmpty = C.fishboneAnalysis(null);
eq(fbEmpty.rootCauses, [], "Fishbone null input → no root causes");
eq(fbEmpty.summary, "No root causes recorded yet.", "Fishbone empty summary fallback");

// ─── Thomas-Kilmann ──────────────────────────────────────────────────────────
console.log("\nThomas-Kilmann:");
assert(C.thomasKilmann(5, 5).includes("Collaborating"), "TK collaborating");
assert(C.thomasKilmann(5, 1).includes("Competing"), "TK competing");
assert(C.thomasKilmann(1, 5).includes("Accommodating"), "TK accommodating");
assert(C.thomasKilmann(3, 3).includes("Compromising"), "TK compromising");

// ─── Streak ──────────────────────────────────────────────────────────────────
console.log("\nHabit streak:");
const today = C.today();
const yesterday = C.addDays(today, -1);
const twoDaysAgo = C.addDays(today, -2);
eq(C.streak([today, yesterday, twoDaysAgo]), 3, "Streak 3 days");
eq(C.streak([yesterday, twoDaysAgo]), 0, "Streak broken (no today)");
eq(C.streak([]), 0, "Streak empty");

// ─── Vocabularies ────────────────────────────────────────────────────────────
console.log("\nVocabularies:");
assert(C.LISTS.projectMethods.includes("Agile/Scrum"), "Vocab: project methods");
assert(C.LISTS.projectMethods.includes("PRINCE2"), "Vocab: PRINCE2");
assert(C.LISTS.belbinRoles.length === 9, "Vocab: 9 Belbin roles");
assert(C.LISTS.discDimensions.length === 4, "Vocab: 4 DISC dimensions");
assert(C.LISTS.pestleFactors.length === 6, "Vocab: 6 PESTLE factors");
assert(C.LISTS.raci.length === 5, "Vocab: RACI has 5 entries (incl N/A)");
assert(C.SUGGEST.taskTitles.length >= 20, "Vocab: 20+ task titles");
assert(C.SUGGEST.swotItems.strengths.length >= 5, "Vocab: 5+ SWOT strengths");

// ─── Registers ───────────────────────────────────────────────────────────────
console.log("\nRegisters:");
assert(C.REGISTERS.length >= 13, "Registers: 13+ defined");
assert(C.REGISTERS.find(r => r.id === "tasks"), "Register: tasks exists");
assert(C.REGISTERS.find(r => r.id === "risks"), "Register: risks exists");
assert(C.REGISTERS.find(r => r.id === "goals"), "Register: goals exists");
assert(C.REGISTERS.find(r => r.id === "habits"), "Register: habits exists");
assert(C.REGISTERS.find(r => r.id === "decisions"), "Register: decisions exists");
assert(C.REGISTERS.find(r => r.id === "okrs"), "Register: okrs exists");
assert(C.REGISTERS.find(r => r.id === "controls"), "Register: controls exists");
assert(C.riskRpn({ sev: 9, occ: 5, det: 4, residualSev: 3, residualOcc: 2, residualDet: 2 }) === 12, "Residual risk score uses mitigation values");
eq(C.riskRpn({ sev: 2, occ: 3, det: 4 }), 24, "Risk RPN uses base values when no residual values present");
eq(C.riskRpn({ sev: 9, occ: 5, det: 4, residualSev: 3, residualOcc: 2 }), 180, "Risk RPN needs ALL residual values before switching to residual");
eq(C.residualRpn({ sev: 2, occ: 3, det: 4 }), null, "Residual RPN null when no residual values present");
eq(C.residualRpn({ sev: 2, occ: 3, det: 4, residualSev: 1, residualOcc: 2, residualDet: 3 }), 6, "Residual RPN uses residual values when present");
const decisionRegister = C.REGISTERS.find(r => r.id === "decisions");
assert(decisionRegister.columns.some(c => c.key === "risk") && decisionRegister.columns.some(c => c.key === "control"), "Decision register links risk and control evidence");

// ─── Governance / decision quality (new milestone features) ───────────────
console.log("\nGovernance:");
const governanceDecision = {
  title: "Invest in leadership automation",
  rationale: "Improves execution quality and early intervention.",
  assumptions: ["Teams will adopt the workflow", "Risks get caught earlier"],
  ownerId: "person_001",
  projectIds: ["proj_001"],
  riskIds: ["risk_001"],
  status: "approved"
};
approx(C.decisionQualityScore(governanceDecision), 100, "Decision quality score is strong when evidence is clear");
assert(C.approvalRequired("risk", { severity: 9, status: "open" }) === true, "Approval required for high-severity risk");
assert(C.approvalRequired("decision", { status: "priority_shift" }) === true, "Approval required for strategic priority shift");
eq(C.overdueActionCount([{ status: "in_progress", dueDate: "2020-01-01" }, { status: "completed", dueDate: "2026-01-01" }]), 1, "Overdue actions counted correctly");
const governanceSummary = C.governanceSummary(
  [governanceDecision],
  [{ status: "in_progress", dueDate: "2020-01-01" }],
  [{ status: "pending" }]
);
eq(governanceSummary.pendingDecisions, 0, "Governance summary counts pending decisions");
eq(governanceSummary.overdueActions, 1, "Governance summary counts overdue actions");
eq(governanceSummary.pendingApprovals, 1, "Governance summary counts pending approvals");

const linkedGovernanceSummary = C.governanceSummary(
  [governanceDecision],
  [{ status: "in_progress", dueDate: "2020-01-01" }],
  [{ status: "pending" }],
  [{ sev: 9, occ: 8, det: 7 }],
  [{ estCost: 1000, actCost: 1500 }],
  [{ status: "Failed" }, { status: "Operating" }]
);
assert(linkedGovernanceSummary.riskExposure >= 70, "Linked governance summary tracks material risk exposure");
assert(linkedGovernanceSummary.financialExposure >= 30, "Linked governance summary tracks financial drift");
assert(linkedGovernanceSummary.controlExposure >= 25, "Linked governance summary tracks control gaps");
assert(linkedGovernanceSummary.operatingScore <= 100, "Linked governance summary produces a usable operating score");
assert(linkedGovernanceSummary.status === "Needs attention" || linkedGovernanceSummary.status === "Escalate", "Linked governance summary flags material operating drift");

const decisionFlow = C.decisionExecutionFlow({
  title: "Scale the operating model",
  owner: "Mette Nielsen",
  riskRows: [{ sev: 9, occ: 8, det: 7 }, { sev: 6, occ: 5, det: 5 }],
  budgetRows: [{ estCost: 100000, actCost: 150000 }],
  controlRows: [{ status: "Failed", owner: "Lars Jensen" }, { status: "Needs testing", owner: "Anne Nielsen" }],
  appetite: 60,
  authority: "Sponsor"
});
assert(decisionFlow.approvalLevel === "Board", "Execution flow escalates high-impact decisions to the board");
assert(decisionFlow.escalationPath.includes("Board"), "Execution flow includes the board in the escalation path");
assert(decisionFlow.requiredActions.some(a => a.type === "Budget review"), "Execution flow requires a budget review");
assert(decisionFlow.requiredActions.some(a => a.type === "Risk mitigation"), "Execution flow requires risk mitigation");
assert(decisionFlow.requiredActions.some(a => a.type === "Control remediation"), "Execution flow requires control remediation");

const portfolioPriorities = C.portfolioPrioritization([
  { title: "Scale automation", value: 9, effort: 5, governance: 68, risk: 3, strategicFit: 9 },
  { title: "Stabilize delivery", value: 6, effort: 2, governance: 92, risk: 2, strategicFit: 7 },
  { title: "Launch new market test", value: 8, effort: 8, governance: 45, risk: 8, strategicFit: 7 }
], 70);
assert(portfolioPriorities[0].title === "Stabilize delivery", "Portfolio prioritization favors healthy, executable options before risky expansion");
assert(portfolioPriorities[0].score >= portfolioPriorities[1].score, "Portfolio prioritization ranks the strongest option first");
assert(portfolioPriorities.some(item => item.reason.includes("governance")), "Portfolio prioritization explains governance impact in the rationale");

// Relative dates: controlSummary/controlFollowUps compare nextTest against
// today, so hardcoded fixture dates age into failure as the calendar advances.
const dayOffset = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const controlHealth = C.controlSummary([
  { control: "Risk review", risk: "Key team member may leave", status: "Operating", lastTest: dayOffset(-7), nextTest: dayOffset(2) },
  { control: "Budget variance review", risk: "Budget overrun on critical path", status: "Needs testing", nextTest: dayOffset(-3) },
  { control: "Quality gate", risk: "Quality standards not met", status: "Failed", nextTest: dayOffset(-3) }
], [
  { description: "Key team member may leave" },
  { description: "Budget overrun on critical path" }
]);
assert(controlHealth.total === 3 && controlHealth.linked === 2, "Control health links controls to risks");
assert(controlHealth.untested === 2 && controlHealth.overdue === 2, "Control health identifies testing gaps");
assert(controlHealth.status === "Control gap", "Control health identifies failed controls");
const controlFollowUps = C.controlFollowUps([
  { control: "Failed control", risk: "Known risk", status: "Failed", owner: "Mette Nielsen", nextTest: dayOffset(-3) },
  { control: "Unlinked control", status: "Operating" }
], [{ description: "Known risk" }]);
assert(controlFollowUps.some(action => action.type === "Remediate"), "Control follow-ups include remediation");
assert(controlFollowUps.some(action => action.type === "Link risk"), "Control follow-ups identify unlinked controls");
const dataQuality = C.dataQualitySummary({
  tasks: [{ title: "Task", owner: "Mette Nielsen", dueDate: "2026-09-01" }],
  risks: [{ description: "Risk", owner: "Mette Nielsen", sev: 5, occ: 4, det: 3 }],
  controls: [{ control: "Risk review", owner: "Mette Nielsen", risk: "Risk", status: "Operating" }],
  budget: [{ item: "Labour", estCost: 100, actCost: 90 }],
  approvals: [{ title: "Decision", approver: "Mette Nielsen", evidence: "Evidence", status: "Approved" }]
});
assert(dataQuality.score < 100 && dataQuality.gaps.controls === 1, "Data quality identifies incomplete control evidence");

const readiness = C.decisionReadiness({ risk: 38, financial: 72, strategic: 78, evidence: 84, appetite: 60 });
eq(readiness.status, "Ready", "Decision readiness flags healthy decisions as ready");
assert(readiness.summary.includes("Ready") || readiness.summary.includes("ready"), "Decision readiness summary is actionable");
const boardReport = C.boardReportPack({ decisionTitle: "Platform upgrade", risk: 38, financial: 72, strategic: 78, evidence: 84, appetite: 60 });
eq(boardReport.summary.title, "Platform upgrade", "Board report includes the decision title");
assert(boardReport.actions.length >= 3, "Board report includes multiple actions");

const ops = C.operationalExcellenceSummary({ risk: 38, financial: 72, strategic: 78, evidence: 84, sigma: 4.2, waste: 8, fiveS: 4.5 });
assert(ops.score >= 60, "Operational excellence summary combines quality and leadership signals");
assert(ops.summary.includes("quality") || ops.summary.includes("Quality") || ops.summary.includes("improvement"), "Executive summary explains the operational quality signal");

const fishbone = C.fishboneAnalysis({
  people: ["Training gap"],
  methods: ["Unclear handoff"],
  machines: ["Tool latency"],
  materials: ["Incomplete specifications"],
  environment: ["Interruptions"],
  measurement: ["No defect threshold"]
});
assert(fishbone && fishbone.rootCauses.length >= 4, "Fishbone analysis returns root-cause categories");
assert(fishbone.summary.includes("Training") || fishbone.summary.includes("handoff"), "Fishbone summary is actionable");

const lean = C.leanWasteSummary({ defects: 3, waiting: 5, overproduction: 2, motion: 1, transport: 2, inventory: 1, overprocessing: 2 });
assert(lean.priority === "Waiting" || lean.priority === "Defects", "Lean waste summary prioritizes the largest waste" );

const dmaic = C.sixSigmaDmaic({ defectCount: 12, opportunities: 240, stage: "Improve" });
eq(dmaic.stage, "Improve", "Six Sigma DMAIC stage is preserved");
assert(dmaic.sigma >= 3, "Six Sigma score reflects the defect rate");

const sipoc = C.sipocMap({ suppliers: ["Ops", "IT"], inputs: ["Requirement", "Data"], process: ["Review", "Approve"], outputs: ["Decision"], customers: ["Team"] });
eq(sipoc.outputs[0], "Decision", "SIPOC includes final output");

const s5 = C.fiveSScore({ sort: 4, setInOrder: 5, shine: 4, standardize: 3, sustain: 4 });
assert(s5.score >= 4, "5S score captures workplace discipline");

const kaizen = C.kaizenBoard([{ title: "Reduce handoff delay", impact: 5, effort: 2 }, { title: "Standardize defect log", impact: 4, effort: 1 }]);
assert(kaizen.quickWins.length >= 1, "Kaizen board identifies quick wins");

// ─── Governance & approval trust layer ─────────────────────────────────────
console.log("\nGovernance:");
const approval = C.approvalWorkflow({ riskScore: 8, financialScore: 9, strategicScore: 7, evidenceScore: 9, appetite: "Moderate" });
eq(approval.status, "Approved", "Approval workflow approves strong decisions");
assert(approval.recommendation.includes("approve") || approval.recommendation.includes("Approve"), "Approval workflow gives actionable recommendation");
const weak = C.approvalWorkflow({ riskScore: 2, financialScore: 2, strategicScore: 3, evidenceScore: 2, appetite: "Moderate" });
eq(weak.status, "Needs Review", "Approval workflow flags weak decisions");
const riskGate = C.governanceRiskGate({ residualRisk: 85, appetiteLimit: 60, impact: "High" });
eq(riskGate.status, "Escalate", "Governance risk gate escalates above appetite");
const eventChain = C.governanceEventChain([
  { id: "e-1", ts: "2026-08-22T08:00:00Z", type: "decision.created", entityType: "decision", entityId: "d-1" },
  { id: "e-2", ts: "2026-08-22T09:00:00Z", type: "approval.requested", entityType: "approval", entityId: "a-1" }
]);
assert(eventChain.valid && eventChain.ordered && eventChain.count === 2, "Governance event chain validates complete chronological history");
assert(!C.governanceEventChain([{ id: "duplicate", ts: "2026-08-22", type: "x", entityType: "task", entityId: "t-1" }, { id: "duplicate", ts: "2026-08-21", type: "y", entityType: "task", entityId: "t-2" }]).valid, "Governance event chain rejects duplicates and disorder");
const automationPlan = C.automationPlan({
  registers: {
    tasks: [{ _id: "task-auto", status: "OPEN", dueDate: "2026-08-21" }],
    risks: [{ _id: "risk-auto", sev: 10, occ: 10, det: 10, status: "OPEN" }],
    controls: [{ _id: "control-auto", status: "Needs testing" }],
    budget: [{ estCost: 100, actCost: 125 }]
  },
  approvals: []
}, "2026-08-22");
assert(automationPlan.total === 4, "Automation plan links overdue, risk, control, and budget signals");
assert(automationPlan.humanApprovalJobs === 2, "Automation plan marks consequential jobs for human approval");
const workflowPlan = W.leadershipAutomationPlan({ registers: {}, approvals: [] }, "2026-08-22");
assert(workflowPlan.total === 0 && workflowPlan.summary.includes("No governed"), "Workflow automation facade handles a clean workspace");

const S = require("./js/store.js");
S.load();
// Seed minimal data for store-based tests (linking, approvals, audit, etc.)
S.get().registers.tasks.push({ _id: "test-task-1", title: "Define scope", status: "OPEN" }, { _id: "test-task-2", title: "Build backlog", status: "IN PROGRESS" });
S.get().registers.risks.push({ _id: "test-risk-1", description: "Key person risk", sev: 7, occ: 5, det: 4, status: "OPEN" });
S.get().roster.push({ id: "test-member-1", name: "Mette Nielsen", role: "Project Manager" });
assert(S.get().schemaVersion === S.schemaVersion && Array.isArray(S.get().events), "Workspace schema version and event storage are initialized");
const workflowActions = W.suggestions({ registers: {
  tasks: [{ _id: "task-1", status: "BLOCKED" }],
  risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
  controls: [{ _id: "control-1", status: "Failed" }],
  milestones: [{ _id: "milestone-1", status: "At risk" }],
  budget: []
}, approvals: [{ _id: "approval-1", status: "Needs Review" }] });
assert(workflowActions.length === 5, "Workflow engine detects actionable follow-ups");
assert(workflowActions.every(item => item.id && item.target && item.reason), "Workflow actions are explainable and addressable");
assert(W.byTarget({ registers: {}, approvals: [] }).tasks === undefined, "Workflow target grouping omits empty targets");
const opsSummary = W.leadershipOpsSummary({
  registers: {
    tasks: [{ _id: "task-1", status: "BLOCKED" }, { _id: "task-2", status: "IN PROGRESS" }],
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    milestones: [{ _id: "milestone-1", status: "At risk" }],
    budget: [{ estCost: 1200, actCost: 1500 }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review" }]
});
assert(opsSummary.totalActions >= 4, "Leadership ops summary groups multiple automation actions");
assert(opsSummary.priorityArea === "risks" || opsSummary.priorityArea === "controls", "Leadership ops summary identifies the highest-priority operating area");
assert(Array.isArray(opsSummary.actionGroups) && opsSummary.actionGroups.length >= 2, "Leadership ops summary exposes grouped action areas");
const cockpit = W.executiveCockpit({
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review" }],
  project: { name: "Leadership upgrade" }
});
assert(Array.isArray(cockpit.overview) && cockpit.overview.length >= 4, "Executive cockpit returns linked domain overview");
assert(cockpit.priority === "risks" || cockpit.priority === "controls", "Executive cockpit prioritizes the highest-impact domain");
assert(cockpit.summary && cockpit.summary.length > 30, "Executive cockpit provides a human-readable operating summary");
const commandCenter = W.leadershipCommandCenter({
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review" }],
  project: { name: "Leadership upgrade" }
});
assert(typeof commandCenter.score === "number", "Leadership command center returns a numeric executive score");
assert(commandCenter.status === "Action required" || commandCenter.status === "Watch closely", "Leadership command center sets a clear operating status");
assert(Array.isArray(commandCenter.domains) && commandCenter.domains.length >= 4, "Leadership command center includes linked domains");
const controlRoom = W.leadershipControlRoom({
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }],
  project: { name: "Leadership upgrade" }
});
assert(Array.isArray(controlRoom.queues) && controlRoom.queues.length >= 3, "Leadership control room exposes linked decision queues");
assert(controlRoom.readinessScore >= 0 && controlRoom.readinessScore <= 100, "Leadership control room returns a numeric readiness score");
assert(controlRoom.summary && controlRoom.summary.length > 30, "Leadership control room provides a readable board summary");
const board = W.leadershipBoard({
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }],
  project: { name: "Leadership upgrade" }
});
assert(typeof board.boardScore === "number", "Leadership board returns a numeric board score");
assert(Array.isArray(board.focusAreas) && board.focusAreas.length >= 3, "Leadership board exposes linked focus areas");
assert(Array.isArray(board.decisionQueue) && board.decisionQueue.length >= 1, "Leadership board surfaces a decision queue");
assert(Array.isArray(board.recommendedActions) && board.recommendedActions.length >= 2, "Leadership board recommends concrete follow-up actions");
assert(board.escalationSummary && board.escalationSummary.length > 20, "Leadership board summarizes escalation logic for leadership");
assert(board.summary && board.summary.length > 30, "Leadership board provides a readable board narrative");
const brief = W.leadershipDecisionBrief({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(brief && brief.decision && brief.decision.length > 20, "Leadership decision brief exposes a clear decision statement");
assert(Array.isArray(brief.nextSteps) && brief.nextSteps.length >= 2, "Leadership decision brief provides actionable next steps");
assert(brief.trustLevel >= 0 && brief.trustLevel <= 100, "Leadership decision brief returns a trust score");
const reviewPack = W.leadershipReviewPack({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(reviewPack && reviewPack.topic && reviewPack.topic.length > 20, "Leadership review pack includes a formal review topic");
assert(Array.isArray(reviewPack.evidence) && reviewPack.evidence.length >= 3, "Leadership review pack includes evidence items");
assert(Array.isArray(reviewPack.accountability) && reviewPack.accountability.length >= 2, "Leadership review pack assigns accountability");
assert(Array.isArray(reviewPack.actions) && reviewPack.actions.length >= 2, "Leadership review pack lists board actions");
const dailyReview = W.leadershipDailyReview({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(dailyReview && dailyReview.headline && dailyReview.headline.length > 20, "Leadership daily review exposes a clear headline");
assert(Array.isArray(dailyReview.agenda) && dailyReview.agenda.length >= 3, "Leadership daily review sets an agenda");
assert(Array.isArray(dailyReview.actionTracker) && dailyReview.actionTracker.length >= 2, "Leadership daily review tracks the action list");
assert(dailyReview.reviewCadence && dailyReview.reviewCadence.length > 10, "Leadership daily review describes the next review cadence");
const operatingPacket = W.leadershipOperatingPacket({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(operatingPacket && operatingPacket.title && operatingPacket.title.length > 20, "Leadership operating packet includes a formal title");
assert(Array.isArray(operatingPacket.decisionLog) && operatingPacket.decisionLog.length >= 2, "Leadership operating packet holds decision log entries");
assert(Array.isArray(operatingPacket.ownerMap) && operatingPacket.ownerMap.length >= 2, "Leadership operating packet assigns owners to actions");
assert(Array.isArray(operatingPacket.evidencePack) && operatingPacket.evidencePack.length >= 2, "Leadership operating packet includes evidence items");
const scenarioPlaybook = W.leadershipScenarioPlaybook({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(scenarioPlaybook.scenarios) && scenarioPlaybook.scenarios.length >= 3, "Leadership scenario playbook outlines multiple operating futures");
assert(scenarioPlaybook.recommended && scenarioPlaybook.recommended.length > 20, "Leadership scenario playbook suggests a preferred course of action");
assert(scenarioPlaybook.readiness >= 0 && scenarioPlaybook.readiness <= 100, "Leadership scenario playbook returns a readiness score");
const strategyScorecard = W.leadershipStrategyScorecard({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }],
    goals: [{ _id: "goal-1", progress: 0.3, goal: "Improve team communication" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(strategyScorecard.perspectives) && strategyScorecard.perspectives.length >= 4, "Leadership strategy scorecard includes four scorecard perspectives");
assert(strategyScorecard.priority && strategyScorecard.priority.length > 3, "Leadership strategy scorecard identifies a strategic priority");
assert(strategyScorecard.score >= 0 && strategyScorecard.score <= 100, "Leadership strategy scorecard returns a numeric total score");
const riskReview = W.leadershipRiskReview({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, response: "Mitigate", status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(riskReview.threats) && riskReview.threats.length >= 2, "Leadership risk review identifies material threat scenarios");
assert(Array.isArray(riskReview.controls) && riskReview.controls.length >= 2, "Leadership risk review lists prevention and recovery controls");
assert(riskReview.appetite && riskReview.appetite.length > 10, "Leadership risk review reports a risk-appetite decision");
const capitalAllocation = W.leadershipCapitalAllocation({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }],
    goals: [{ _id: "goal-1", progress: 0.3, goal: "Improve communication" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(capitalAllocation.portfolio) && capitalAllocation.portfolio.length >= 3, "Leadership capital allocation prioritizes multiple investment lanes");
assert(capitalAllocation.totalBudget >= 0, "Leadership capital allocation reports a total budget value");
assert(capitalAllocation.summary && capitalAllocation.summary.length > 20, "Leadership capital allocation provides an actionable narrative");
const resourceAllocation = W.leadershipResourceAllocation({
  project: { name: "Leadership upgrade" },
  roster: [
    { name: "Mette Nielsen", role: "Project Manager" },
    { name: "Søren Petersen", role: "Tech Lead" },
    { name: "Anna Hansen", role: "Developer" },
    { name: "Lars Jensen", role: "QA Engineer" }
  ],
  registers: {
    tasks: [
      { _id: "t-1", title: "Scope & charter", owner: "Mette Nielsen", priority: "1-CRITICAL", status: "IN PROGRESS", progress: 6 },
      { _id: "t-2", title: "Architecture review", owner: "Søren Petersen", priority: "2-HIGH", status: "IN PROGRESS", progress: 5 },
      { _id: "t-3", title: "Build platform", owner: "Anna Hansen", priority: "2-HIGH", status: "IN PROGRESS", progress: 4 },
      { _id: "t-4", title: "Quality sign-off", owner: "Lars Jensen", priority: "2-HIGH", status: "OPEN", progress: 0 },
      { _id: "t-5", title: "Reporting", owner: "Mette Nielsen", priority: "3-MEDIUM", status: "OPEN", progress: 0 }
    ],
    risks: [{ _id: "r-1", description: "Resource bottleneck", sev: 7, occ: 5, det: 4, status: "OPEN" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Budget gate", approver: "Mette" }]
});
assert(Array.isArray(resourceAllocation.allocations) && resourceAllocation.allocations.length >= 2, "Leadership resource allocation distributes work across owners");
assert(resourceAllocation.summary && resourceAllocation.summary.length > 20, "Leadership resource allocation gives clear workload and staffing direction");
assert(resourceAllocation.priority && resourceAllocation.priority.length > 4, "Leadership resource allocation identifies the key staffing priority");
const talentPlan = W.leadershipTalentPlan({
  project: { name: "Leadership upgrade" },
  roster: [
    { name: "Mette Nielsen", role: "Project Manager" },
    { name: "Søren Petersen", role: "Tech Lead" },
    { name: "Anna Hansen", role: "Developer" },
    { name: "Lars Jensen", role: "QA Engineer" }
  ],
  registers: {
    tasks: [
      { _id: "t-1", title: "Scope & charter", owner: "Mette Nielsen", priority: "1-CRITICAL", status: "IN PROGRESS" },
      { _id: "t-2", title: "Architecture review", owner: "Søren Petersen", priority: "2-HIGH", status: "IN PROGRESS" },
      { _id: "t-3", title: "Build platform", owner: "Anna Hansen", priority: "2-HIGH", status: "IN PROGRESS" },
      { _id: "t-4", title: "Quality sign-off", owner: "Lars Jensen", priority: "2-HIGH", status: "OPEN" }
    ]
  }
});
assert(Array.isArray(talentPlan.talent) && talentPlan.talent.length >= 2, "Leadership talent plan tracks multiple team members and competencies");
assert(Array.isArray(talentPlan.gaps) && talentPlan.gaps.length >= 2, "Leadership talent plan identifies critical talent gaps");
assert(talentPlan.summary && talentPlan.summary.length > 20, "Leadership talent plan provides a leadership-readiness narrative");
const businessHealth = W.leadershipBusinessHealth({
  project: { name: "Leadership upgrade" },
  registers: {
    budget: [{ estCost: 1000, actCost: 1200 }],
    risks: [{ _id: "r-1", sev: 7, occ: 5, det: 4, status: "OPEN" }],
    tasks: [{ _id: "t-1", status: "IN PROGRESS", progress: 7 }, { _id: "t-2", status: "BLOCKED", progress: 2 }],
    goals: [{ _id: "g-1", progress: 0.6, goal: "Improve alignment" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review" }]
});
assert(Array.isArray(businessHealth.metrics) && businessHealth.metrics.length >= 4, "Leadership business health includes multiple value dimensions");
assert(typeof businessHealth.score === "number" && businessHealth.score >= 0 && businessHealth.score <= 100, "Leadership business health returns a valid health score");
assert(businessHealth.summary && businessHealth.summary.length > 20, "Leadership business health provides a narrative for decision-makers");
const trustIndex = W.leadershipTrustIndex({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1200 }],
    tasks: [{ _id: "t-1", status: "BLOCKED", title: "Dependency recovery" }],
    goals: [{ _id: "g-1", progress: 0.5, goal: "Improve alignment" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Board approval", approver: "Mette" }],
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }]
});
assert(Array.isArray(trustIndex.dimensions) && trustIndex.dimensions.length >= 4, "Leadership trust index includes multiple trust dimensions");
assert(typeof trustIndex.score === "number" && trustIndex.score >= 0 && trustIndex.score <= 100, "Leadership trust index returns a valid trust score");
assert(trustIndex.summary && trustIndex.summary.length > 20, "Leadership trust index provides a narrative for leadership confidence");
const learningLoop = W.leadershipLearningLoop({
  project: { name: "Leadership upgrade" },
  registers: {
    lessons: [
      { _id: "l-1", lesson: "Communication breakdown caused rework", category: "Leadership", action: "Avoid", owner: "Mette Nielsen" },
      { _id: "l-2", lesson: "Delegation improved throughput", category: "Leadership", action: "Exploit", owner: "Søren Petersen" }
    ],
    risks: [{ _id: "r-1", description: "Learning gap", sev: 5, occ: 3, det: 4, status: "OPEN" }],
    changes: [{ _id: "c-1", change: "Added quality review gate", type: "Quality", status: "Approved" }],
    goals: [{ _id: "g-1", goal: "Improve leadership learning", progress: 0.6 }]
  }
});
assert(Array.isArray(learningLoop.signals) && learningLoop.signals.length >= 3, "Leadership learning loop tracks evidence and learning signals");
assert(typeof learningLoop.score === "number" && learningLoop.score >= 0 && learningLoop.score <= 100, "Leadership learning loop returns a valid score");
assert(learningLoop.summary && learningLoop.summary.length > 20, "Leadership learning loop provides an action-oriented learning narrative");
const resilienceIndex = W.leadershipResilienceIndex({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", sev: 8, occ: 5, det: 4, response: "Mitigate", status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    tasks: [{ _id: "t-1", status: "BLOCKED", title: "Dependency recovery" }, { _id: "t-2", status: "IN PROGRESS", title: "Decision review" }],
    budget: [{ estCost: 1000, actCost: 1200 }],
    goals: [{ _id: "g-1", progress: 0.6, goal: "Improve alignment" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Board approval", approver: "Mette" }],
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }]
});
assert(Array.isArray(resilienceIndex.dimensions) && resilienceIndex.dimensions.length >= 4, "Leadership resilience index describes multiple resilience dimensions");
assert(typeof resilienceIndex.score === "number" && resilienceIndex.score >= 0 && resilienceIndex.score <= 100, "Leadership resilience index returns a valid resilience score");
assert(resilienceIndex.summary && resilienceIndex.summary.length > 20, "Leadership resilience index provides a narrative for crisis readiness");
const conflictIndex = W.leadershipConflictIndex({
  project: { name: "Leadership upgrade" },
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }],
  registers: {
    tasks: [{ _id: "t-1", title: "Approve design", owner: "Mette Nielsen", status: "BLOCKED" }, { _id: "t-2", title: "Resolve vendor API", owner: "Søren Petersen", status: "IN PROGRESS" }],
    risks: [{ _id: "r-1", description: "Stakeholder conflict on scope", sev: 6, occ: 5, det: 4, status: "OPEN" }],
    goals: [{ _id: "g-1", goal: "Improve alignment", progress: 0.5 }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Scope sign-off", approver: "Mette" }]
});
assert(Array.isArray(conflictIndex.dimensions) && conflictIndex.dimensions.length >= 4, "Leadership conflict index describes multiple conflict dimensions");
assert(typeof conflictIndex.score === "number" && conflictIndex.score >= 0 && conflictIndex.score <= 100, "Leadership conflict index returns a valid conflict score");
assert(conflictIndex.summary && conflictIndex.summary.length > 20, "Leadership conflict index provides a narrative for stakeholder tension management");
const portfolioOptimizer = W.leadershipPortfolioOptimizer({
  project: { name: "Leadership upgrade" },
  registers: {
    goals: [{ _id: "g-1", goal: "Expand growth", progress: 0.75 }, { _id: "g-2", goal: "Reduce risk exposure", progress: 0.6 }],
    tasks: [{ _id: "t-1", title: "Growth initiative", status: "IN PROGRESS", priority: "2-HIGH", progress: 60 }, { _id: "t-2", title: "Risk repair", status: "BLOCKED", priority: "1-CRITICAL", progress: 20 }],
    risks: [{ _id: "r-1", description: "Portfolio concentration risk", sev: 7, occ: 5, det: 4, status: "OPEN" }],
    budget: [{ estCost: 1200, actCost: 1000 }, { estCost: 800, actCost: 950 }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Investment gate", approver: "Mette" }],
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }]
});
assert(Array.isArray(portfolioOptimizer.portfolio) && portfolioOptimizer.portfolio.length >= 3, "Portfolio optimizer defines a multi-option investment portfolio");
assert(typeof portfolioOptimizer.score === "number" && portfolioOptimizer.score >= 0 && portfolioOptimizer.score <= 100, "Portfolio optimizer returns a valid strategic score");
assert(portfolioOptimizer.summary && portfolioOptimizer.summary.length > 20, "Portfolio optimizer provides a board-ready portfolio narrative");
const policyGuardrails = W.leadershipPolicyGuardrails({
  project: { name: "Leadership upgrade" },
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }],
  registers: {
    risks: [{ _id: "r-1", description: "Policy risk around approval flow", sev: 7, occ: 4, det: 5, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }, { _id: "c-2", status: "Operating", owner: "Søren" }],
    tasks: [{ _id: "t-1", title: "Update retained evidence", owner: "Mette Nielsen", status: "BLOCKED" }, { _id: "t-2", title: "Review policy exceptions", owner: "Søren Petersen", status: "IN PROGRESS" }],
    goals: [{ _id: "g-1", goal: "Improve governance quality", progress: 0.7 }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Exception approval", approver: "Mette" }]
});
assert(Array.isArray(policyGuardrails.dimensions) && policyGuardrails.dimensions.length >= 4, "Leadership policy guardrails describe multiple governance dimensions");
assert(typeof policyGuardrails.score === "number" && policyGuardrails.score >= 0 && policyGuardrails.score <= 100, "Leadership policy guardrails returns a valid score");
assert(policyGuardrails.summary && policyGuardrails.summary.length > 20, "Leadership policy guardrails provides an auditable governance narrative");
const policyExceptions = W.leadershipPolicyExceptions({
  project: { name: "Leadership upgrade" },
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }],
  registers: {
    risks: [{ _id: "r-1", description: "Approval flow risk", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    tasks: [{ _id: "t-1", title: "Policy exception approval", owner: "Mette Nielsen", status: "BLOCKED" }],
    goals: [{ _id: "g-1", goal: "Improve governance quality", progress: 0.7 }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Exception approval", approver: "Mette" }]
});
assert(Array.isArray(policyExceptions.exceptions) && policyExceptions.exceptions.length >= 2, "Leadership policy exception workflow defines active exception decisions");
assert(typeof policyExceptions.score === "number" && policyExceptions.score >= 0 && policyExceptions.score <= 100, "Leadership policy exception workflow returns a valid score");
assert(policyExceptions.summary && policyExceptions.summary.length > 20, "Leadership policy exception workflow provides an accountable exception narrative");
const assuranceReview = W.leadershipAssuranceReview({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Assurance risk", sev: 7, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Operating", owner: "Mette" }, { _id: "c-2", status: "Needs testing", owner: "Søren" }],
    tasks: [{ _id: "t-1", title: "Close assurance gap", owner: "Mette Nielsen", status: "BLOCKED" }, { _id: "t-2", title: "Reset review cadence", owner: "Søren Petersen", status: "IN PROGRESS" }],
    goals: [{ _id: "g-1", goal: "Improve assurance quality", progress: 0.72 }]
  },
  approvals: [{ _id: "a-1", status: "Approved", title: "Board assurance", approver: "Mette" }, { _id: "a-2", status: "Needs Review", title: "Exception review", approver: "Søren" }]
});
assert(Array.isArray(assuranceReview.dimensions) && assuranceReview.dimensions.length >= 4, "Leadership assurance review describes multiple assurance dimensions");
assert(typeof assuranceReview.score === "number" && assuranceReview.score >= 0 && assuranceReview.score <= 100, "Leadership assurance review returns a valid score");
assert(assuranceReview.summary && assuranceReview.summary.length > 20, "Leadership assurance review provides an executive confidence narrative");
const provenance = C.decisionProvenance({
  title: "Platform reset",
  rationale: "Reduce delivery risk and improve governance quality.",
  evidence: ["Risk review", "Budget signoff", "Stakeholder note"],
  required: ["Risk review", "Budget signoff", "Stakeholder note"],
  owner: "Mette Nielsen",
  authority: "Sponsor",
  options: ["Proceed", "Delay", "Re-scope"],
  confidence: 82,
  status: "Approved"
});
assert(provenance && provenance.title === "Platform reset", "Decision provenance records the decision title");
assert(Array.isArray(provenance.evidence) && provenance.evidence.length >= 3, "Decision provenance records the evidence base");
assert(provenance.owner === "Mette Nielsen", "Decision provenance assigns an accountable owner");
assert(Array.isArray(provenance.missingEvidence) && provenance.missingEvidence.length === 0, "Decision provenance tracks missing evidence correctly");
assert(provenance.evidenceCoverage === 100, "Decision provenance calculates complete evidence coverage");
const escalationPack = W.leadershipBoardEscalationPack({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Scope drift", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1200, actCost: 1800 }],
    tasks: [{ _id: "t-1", title: "Unblock vendor approval", owner: "Søren Petersen", status: "BLOCKED" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(escalationPack.escalationItems) && escalationPack.escalationItems.length >= 3, "Board escalation pack defines material trigger items");
assert(typeof escalationPack.score === "number" && escalationPack.score >= 0 && escalationPack.score <= 100, "Board escalation pack returns a numeric escalation score");
assert(escalationPack.summary && escalationPack.summary.length > 20, "Board escalation pack provides a concise board narrative");
const boardApprovalFlow = W.leadershipBoardApprovalFlow({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Scope drift", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1200, actCost: 1800 }],
    tasks: [{ _id: "t-1", title: "Unblock vendor approval", owner: "Søren Petersen", status: "BLOCKED" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(boardApprovalFlow.gates) && boardApprovalFlow.gates.length >= 3, "Board approval flow defines the essential governance gate sequence");
assert(typeof boardApprovalFlow.score === "number" && boardApprovalFlow.score >= 0 && boardApprovalFlow.score <= 100, "Board approval flow returns a numeric governance score");
assert(boardApprovalFlow.summary && boardApprovalFlow.summary.length > 20, "Board approval flow provides a concise decision narrative");
const executiveBrief = W.leadershipExecutiveBrief({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Scope drift", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1200, actCost: 1800 }],
    tasks: [{ _id: "t-1", title: "Unblock vendor approval", owner: "Søren Petersen", status: "BLOCKED" }]
  },
  approvals: [{ _id: "a-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(executiveBrief && executiveBrief.headline && executiveBrief.headline.length > 20, "Executive brief provides a readable headline");
assert(Array.isArray(executiveBrief.actions) && executiveBrief.actions.length >= 2, "Executive brief lists concrete actions");
const financialControlTower = W.leadershipFinancialControlTower({
  project: { name: "Leadership upgrade" },
  registers: {
    budget: [
      { estCost: 1200, actCost: 1500, committedCost: 1400, forecastCost: 1700 },
      { estCost: 900, actCost: 1000, committedCost: 980, forecastCost: 1150 }
    ],
    cashflow: [
      { month: "M1", inflow: 1300, outflow: 1200 },
      { month: "M2", inflow: 1100, outflow: 1400 },
      { month: "M3", inflow: 1200, outflow: 1100 }
    ]
  }
});
assert(Array.isArray(financialControlTower.dimensions) && financialControlTower.dimensions.length >= 4, "Financial control tower defines multiple liquidity and variance dimensions");
assert(typeof financialControlTower.score === "number" && financialControlTower.score >= 0 && financialControlTower.score <= 100, "Financial control tower returns a numeric control score");
assert(financialControlTower.summary && financialControlTower.summary.length > 20, "Financial control tower provides an executive financial narrative");
const authorityMatrix = C.policyAuthorityMatrix({
  role: "Project Lead",
  decisionType: "Scope change",
  riskLevel: "Medium",
  authority: "Sponsor"
});
assert(Array.isArray(authorityMatrix.authorityLevels) && authorityMatrix.authorityLevels.length >= 3, "Authority matrix defines governance roles and thresholds");
assert(authorityMatrix.authority === "Sponsor" || authorityMatrix.authority === "Board", "Authority matrix resolves the correct decision authority");
const evidenceChecklist = C.evidenceChecklist({
  required: ["Risk review", "Budget signoff", "Stakeholder note"],
  provided: ["Risk review", "Budget signoff", "Stakeholder note"]
});
assert(evidenceChecklist.ready === true, "Evidence checklist marks complete evidence as ready");
assert(evidenceChecklist.missing.length === 0, "Evidence checklist marks missing items correctly");
const evidenceLedger = W.leadershipEvidenceLedger({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Risk review risk", sev: 7, occ: 4, det: 5, status: "OPEN" }],
    controls: [{ _id: "c-1", control: "Risk review", status: "Operating", owner: "Mette" }],
    budget: [{ estCost: 1200, actCost: 900 }],
    tasks: [{ _id: "t-1", title: "Recovery plan", owner: "Mette", status: "IN PROGRESS" }],
    goals: [{ _id: "g-1", goal: "Improve evidence quality", progress: 0.8 }]
  },
  approvals: [
    { _id: "a-1", title: "Board signoff", status: "Approved", approver: "Mette", evidence: ["Risk review", "Budget signoff", "Stakeholder note"], decision: "Proceed with controlled rollout" }
  ]
});
assert(Array.isArray(evidenceLedger.entries) && evidenceLedger.entries.length >= 1, "Evidence ledger returns linked decision entries");
assert(typeof evidenceLedger.score === "number" && evidenceLedger.score >= 0 && evidenceLedger.score <= 100, "Evidence ledger returns a valid score");
assert(evidenceLedger.summary && evidenceLedger.summary.length > 20, "Evidence ledger provides a leadership narrative");
const decisionOrchestration = W.leadershipDecisionOrchestration({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Scope risk", sev: 8, occ: 4, det: 5, status: "OPEN" }],
    controls: [{ _id: "c-1", control: "Scope review", status: "Operating", owner: "Mette" }],
    tasks: [{ _id: "t-1", title: "Approve scope change", owner: "Mette", status: "IN PROGRESS" }],
    goals: [{ _id: "g-1", goal: "Improve decision quality", progress: 0.78 }]
  },
  approvals: [
    { _id: "a-1", title: "Scope approval", status: "Needs Review", approver: "Mette", evidence: ["Risk review", "Budget signoff"], decision: "Awaiting sponsor review" }
  ]
});
assert(Array.isArray(decisionOrchestration.stages) && decisionOrchestration.stages.length >= 4, "Decision orchestration defines a full decision lifecycle");
assert(typeof decisionOrchestration.score === "number" && decisionOrchestration.score >= 0 && decisionOrchestration.score <= 100, "Decision orchestration returns a valid score");
assert(decisionOrchestration.summary && decisionOrchestration.summary.length > 20, "Decision orchestration provides actionable guidance");
const personalLeadership = W.leadershipPersonalLeadership({
  project: { name: "Leadership upgrade" },
  roster: [{ name: "Mette Nielsen", role: "Project Manager" }, { name: "Søren Petersen", role: "Tech Lead" }],
  registers: {
    goals: [{ _id: "g-1", goal: "Improve coaching skills", progress: 0.7 }, { _id: "g-2", goal: "Increase delegation", progress: 0.6 }],
    habits: [{ _id: "h-1", habit: "Daily planning", status: "Active" }, { _id: "h-2", habit: "Weekly reflection", status: "Active" }],
    reflections: [{ _id: "r-1", entry: "Strong coaching conversation", mood: "High positive (energy)" }, { _id: "r-2", entry: "Decision fatigue this week", mood: "Low negative (drained)" }]
  }
});
assert(Array.isArray(personalLeadership.dimensions) && personalLeadership.dimensions.length >= 4, "Personal leadership defines multiple self-leadership dimensions");
assert(typeof personalLeadership.score === "number" && personalLeadership.score >= 0 && personalLeadership.score <= 100, "Personal leadership returns a valid score");
assert(personalLeadership.summary && personalLeadership.summary.length > 20, "Personal leadership provides a realistic self-leadership narrative");
const decisionIntelligence = W.leadershipDecisionIntelligence({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "r-1", description: "Decision quality risk", sev: 7, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "c-1", control: "Risk review", status: "Operating", owner: "Mette" }],
    budget: [{ estCost: 1200, actCost: 900 }],
    tasks: [{ _id: "t-1", title: "Recovery plan", owner: "Mette", status: "IN PROGRESS" }],
    goals: [{ _id: "g-1", goal: "Improved decision quality", progress: 0.8 }]
  },
  approvals: [{ _id: "a-1", title: "Board signoff", status: "Approved", approver: "Mette" }]
});
assert(Array.isArray(decisionIntelligence.evidence) && decisionIntelligence.evidence.length >= 3, "Decision intelligence links evidence to the decision trail");
assert(typeof decisionIntelligence.score === "number" && decisionIntelligence.score >= 0 && decisionIntelligence.score <= 100, "Decision intelligence returns a valid decision confidence score");
assert(decisionIntelligence.summary && decisionIntelligence.summary.length > 20, "Decision intelligence provides a leadership narrative");
const outcomeReview = C.outcomeReview({
  expected: "Reduce delivery risk and improve governance confidence.",
  actual: "Delivery risk fell and governance confidence improved.",
  expectedScore: 75,
  actualScore: 87,
  owner: "Mette Nielsen"
});
assert(outcomeReview.status === "Exceeded" || outcomeReview.status === "On track", "Outcome review classifies the result appropriately");
assert(outcomeReview.owner === "Mette Nielsen", "Outcome review assigns an accountable owner");
const automationLoop = W.leadershipAutomationLoop({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(automationLoop && automationLoop.summary && automationLoop.summary.length > 20, "Leadership automation loop provides a readable operating summary");
assert(Array.isArray(automationLoop.stages) && automationLoop.stages.length >= 4, "Leadership automation loop defines a multi-stage control sequence");
assert(automationLoop.coverage >= 0 && automationLoop.coverage <= 100, "Leadership automation loop returns a coverage score");
const linkedDashboard = W.linkedDashboard({
  project: { name: "Leadership upgrade" },
  registers: {
    risks: [{ _id: "risk-1", sev: 8, occ: 5, det: 4, status: "OPEN" }],
    controls: [{ _id: "control-1", status: "Failed", owner: "Mette" }],
    budget: [{ estCost: 1000, actCost: 1500 }],
    tasks: [{ _id: "task-1", status: "BLOCKED" }]
  },
  approvals: [{ _id: "approval-1", status: "Needs Review", title: "Board signoff", approver: "Mette" }]
});
assert(Array.isArray(linkedDashboard.signals) && linkedDashboard.signals.length >= 4, "Linked dashboard exposes linked operating signals");
assert(linkedDashboard.priority === "risks" || linkedDashboard.priority === "controls", "Linked dashboard prioritizes the most urgent operating signal");
const linkTask = S.regRows("tasks")[0];
const linkRisk = S.regRows("risks")[0];
const createdLink = S.linkRecords("tasks", linkTask._id, "risks", linkRisk._id, "Mitigates");
assert(createdLink && createdLink.relation === "Mitigates", "Cross-register link is created");
assert(S.linkedRecords("tasks", linkTask._id).some(item => item.rowId === linkRisk._id), "Linked risk is visible from task");
assert(S.linkedRecords("risks", linkRisk._id).some(item => item.rowId === linkTask._id), "Linked task is visible from risk");
assert(S.allLinks().some(link => link.linkId === createdLink.linkId), "Cross-register link appears in link index");
assert(S.linkRecords("tasks", linkTask._id, "risks", linkRisk._id, "Mitigates").linkId === createdLink.linkId, "Duplicate link reuses existing relationship");
assert(S.unlinkRecords("tasks", linkTask._id, "risks", linkRisk._id), "Cross-register link is removed");
assert(S.linkedRecords("tasks", linkTask._id).every(item => item.rowId !== linkRisk._id), "Removed relationship is absent from source");
const budgetSummary = S.budgetSummary();
assert(typeof budgetSummary.committed === "number" && "forecastVariance" in budgetSummary, "Budget summary includes committed and forecast variance");
const financialAlerts = C.financialAlerts([{ item: "Cloud", estCost: 100, actCost: 120, committedCost: 140, forecastCost: 110 }]);
assert(financialAlerts.length === 3 && financialAlerts.some(alert => alert.priority === "Critical"), "Financial alerts detect forecast and actual exceptions");
const approvalEntry = S.recordApproval({ title: "Budget gate approval", status: "Approved", approver: "Mette Nielsen", evidence: "Budget variance within tolerance", decisionId: "gov-1" });
assert(approvalEntry && approvalEntry.status === "Approved", "Governance approval log records approved decision");
assert(Array.isArray(S.approvals()) && S.approvals().length >= 1, "Approval log is persisted");
assert(S.approvals()[0].approver === "Mette Nielsen", "Approval includes signer and evidence");
assert(S.auditIntegrity().valid, "Audit chain verifies after new entries");
// Regression: truncating the oldest rows at the 300-entry cap must not break the checksum chain
const auditBefore = S.auditList().length;
for (let i = 0; i < 320; i++) S.logAudit("Truncation regression", "entry " + i);
assert(S.auditList().length <= 300, "Audit log truncates at the 300-entry cap");
assert(S.auditIntegrity().valid, "Audit chain stays valid after truncation (regression)");
assert(S.auditList().length >= auditBefore, "Audit log did not shrink below its prior size");
// Regression: rapid audit logging (here a 320-entry tight loop) must never
// produce a duplicate event id — a same-millisecond history used to sporadically
// fail this chain until store.uid() was made collision-proof.
const eventHistory = C.governanceEventChain(S.get().events);
assert(eventHistory.valid && eventHistory.count >= S.auditList().length, "Local audit actions produce a valid governance event history");

// ─── i18n ─────────────────────────────────────────────────────────────────────
console.log("\ni18n:");
I.setLanguage("en");
eq(I.t("appName"), "Leadership Platform", "i18n EN appName");
eq(I.t("nav_primary"), "Primary navigation", "i18n EN primary navigation");
I.setLanguage("da");
eq(I.t("nav_primary"), "Primær navigation", "i18n DA primary navigation");
I.setLanguage("en");
eq(I.t("nav_project"), "Engineering Project Leadership", "i18n EN nav_project");
I.setLanguage("da");
eq(I.t("appName"), "Lederplatform", "i18n DA appName");
eq(I.t("nav_project"), "Teknisk Projektledelse", "i18n DA nav_project");
assert(I.culture("feedback").length >= 3, "i18n: 3+ feedback culture notes");
assert(I.culture("delegation").length >= 3, "i18n: 3+ delegation culture notes");
assert(I.cultureTags().length >= 8, "i18n: 8+ culture tags");

// ─── Summary ────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════");
console.log(`  Results: ${pass} passed, ${fail} failed`);
console.log(`  ${fail === 0 ? "✓ ALL TESTS PASSED" : "✗ FAILURES DETECTED"}\n`);
process.exit(fail === 0 ? 0 : 1);
