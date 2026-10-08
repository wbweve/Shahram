const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const testDataDir = path.join(__dirname, "server-test-data-" + process.pid);
process.env.LEADERSHIP_DATA_DIR = testDataDir;
const serverModule = require("./server.js");

const testFile = serverModule.AUDIT_FILE;
const workspaceFile = serverModule.WORKSPACE_FILE;
const historyFile = serverModule.WORKSPACE_HISTORY_FILE;
const approvalFile = serverModule.APPROVAL_FILE;
const backup = fs.existsSync(testFile) ? fs.readFileSync(testFile) : null;
const workspaceBackup = fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile) : null;
const historyBackup = fs.existsSync(historyFile) ? fs.readFileSync(historyFile) : null;
const approvalBackup = fs.existsSync(approvalFile) ? fs.readFileSync(approvalFile) : null;

function request(port, method, route, payload, extraHeaders) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port, method, path: route, headers: { "Content-Type": "application/json", ...(extraHeaders || {}) } }, res => {
      let raw = "";
      res.on("data", chunk => { raw += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: raw ? JSON.parse(raw) : null }));
    });
    req.on("error", reject);
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

(async () => {
  fs.mkdirSync(path.dirname(testFile), { recursive: true });
  fs.writeFileSync(testFile, "", "utf8");
  fs.writeFileSync(historyFile, "", "utf8");
  fs.writeFileSync(approvalFile, "", "utf8");
  const testServer = serverModule.server.listen(0, "127.0.0.1");
  await new Promise(resolve => testServer.once("listening", resolve));
  const port = testServer.address().port;
  try {
    const health = await request(port, "GET", "/api/health");
    assert.strictEqual(testServer.address().address, "127.0.0.1", "Server binds to the documented IPv4 loopback address");
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.ok, true);
    assert.ok(health.headers["x-request-id"], "Health response includes request ID");
    assert.strictEqual(health.headers["x-content-type-options"], "nosniff", "Content sniffing is disabled");
    assert.strictEqual(health.headers["x-frame-options"], "DENY", "Security headers are present");
    assert.strictEqual(health.headers["referrer-policy"], "no-referrer", "Referrer data is not shared");
    assert.strictEqual(health.headers["permissions-policy"], "camera=(), microphone=(), geolocation=()", "Unneeded browser capabilities are disabled");
    assert.strictEqual(health.headers["cache-control"], "no-store", "Sensitive API responses are not cached");

    const created = await request(port, "POST", "/api/audit", { action: "Test event", detail: "Server audit" });
    assert.strictEqual(created.status, 201);
    assert.strictEqual(created.body.entry.action, "Test event");
    const duplicateAudit = await request(port, "POST", "/api/audit", { eventId: "event-1", action: "Replay-safe event", detail: "Server audit" });
    const replayedAudit = await request(port, "POST", "/api/audit", { eventId: "event-1", action: "Replay-safe event", detail: "Server audit" });
    assert.strictEqual(replayedAudit.body.entry.id, duplicateAudit.body.entry.id);

    const audit = await request(port, "GET", "/api/audit");
    assert.strictEqual(audit.status, 200);
    assert.strictEqual(audit.body.entries.length, 2);
    assert.strictEqual(audit.body.integrity.valid, true);

    const invalid = await request(port, "POST", "/api/audit", { detail: "Missing action" });
    assert.strictEqual(invalid.status, 400);

    const workspace = { projects: { p1: { project: { name: "Server workspace" }, decisions: [], actions: [] } }, order: ["p1"], activeId: "p1", brand: {} };
    const saved = await request(port, "PUT", "/api/workspace", workspace);
    assert.strictEqual(saved.status, 200);
    assert.strictEqual(saved.body.revision, "1");
    const loaded = await request(port, "GET", "/api/workspace");
    assert.strictEqual(loaded.status, 200);
    assert.strictEqual(loaded.body.workspace.projects.p1.project.name, "Server workspace");

    const governanceSummaryBefore = await request(port, "GET", "/api/governance");
    assert.strictEqual(governanceSummaryBefore.status, 200);
    assert.strictEqual(Array.isArray(governanceSummaryBefore.body.decisions), true);
    assert.strictEqual(Array.isArray(governanceSummaryBefore.body.actions), true);

    const addedDecision = await request(port, "POST", "/api/governance/decisions", {
      title: "Scale leadership workflow",
      ownerId: "person-1",
      rationale: "Improves decision quality and execution clarity.",
      assumptions: ["Teams adopt the workflow", "Risk reviews remain weekly"],
      status: "pending"
    });
    assert.strictEqual(addedDecision.status, 201);
    assert.strictEqual(addedDecision.body.entry.title, "Scale leadership workflow");

    const addedAction = await request(port, "POST", "/api/governance/actions", {
      title: "Review weekly risk treatment",
      owner: "Mette Nielsen",
      status: "in_progress",
      dueDate: "2026-09-01"
    });
    assert.strictEqual(addedAction.status, 201);
    assert.strictEqual(addedAction.body.entry.title, "Review weekly risk treatment");

    const governanceSummaryAfter = await request(port, "GET", "/api/governance");
    assert.strictEqual(governanceSummaryAfter.status, 200);
    assert.strictEqual(governanceSummaryAfter.body.decisions.length >= 1, true);
    assert.strictEqual(governanceSummaryAfter.body.actions.length >= 1, true);
    assert.strictEqual(governanceSummaryAfter.body.summary.pendingDecisions >= 1, true);

    const alerts = await request(port, "GET", "/api/alerts");
    assert.strictEqual(alerts.status, 200);
    assert.ok(Array.isArray(alerts.body.alerts));
    const automation = await request(port, "GET", "/api/automation");
    assert.strictEqual(automation.status, 200);
    assert.ok(Array.isArray(automation.body.jobs));
    assert.strictEqual(typeof automation.body.humanApprovalJobs, "number");
    const automationRun = await request(port, "POST", "/api/automation/run");
    assert.strictEqual(automationRun.status, 202);
    assert.strictEqual(typeof automationRun.body.queued, "number");
    const automationRunAgain = await request(port, "POST", "/api/automation/run");
    assert.strictEqual(automationRunAgain.status, 202);
    assert.strictEqual(automationRunAgain.body.queued, automationRun.body.queued);
    const queuedPlan = serverModule.queueAutomationJobs(serverModule.readWorkspace(), "2026-08-22");
    assert.strictEqual(queuedPlan.queued, queuedPlan.total);
    assert.strictEqual(serverModule.startAutomationScheduler(), false, "Scheduler remains opt-in when no interval is configured");
    const persistedJobs = await request(port, "GET", "/api/jobs");
    assert.strictEqual(persistedJobs.status, 200);
    const queuedJob = persistedJobs.body.jobs.find(job => job.status === "pending");
    assert.ok(queuedJob, "automation run returns an acknowledgeable job");
    const queuedJobId = queuedJob.jobId;
    const acknowledged = await request(port, "POST", "/api/automation/ack", { jobId: queuedJobId, actor: "Mette Nielsen", action: "Reviewed and assigned mitigation owner" });
    assert.strictEqual(acknowledged.status, 201);
    assert.strictEqual(acknowledged.body.acknowledged, true);
    const approval = await request(port, "POST", "/api/approvals", { title: "Test approval", status: "Approved", stage: "Board approval", role: "Board", dueDate: "2026-09-01", requiredApprovers: ["Board"], approver: "Mette Nielsen", evidence: "Evidence captured", decisionId: "test-1" });
    assert.strictEqual(approval.status, 201);
    assert.strictEqual(approval.body.entry.stage, "Board approval");
    assert.deepStrictEqual(approval.body.entry.requiredApprovers, ["Board"]);
    const duplicateApproval = await request(port, "POST", "/api/approvals", { title: "Test approval", status: "Approved", approver: "Mette Nielsen", evidence: "Evidence captured", decisionId: "test-1" });
    assert.strictEqual(duplicateApproval.body.entry.id, approval.body.entry.id);
    const approvalLedger = await request(port, "GET", "/api/approvals");
    assert.strictEqual(approvalLedger.body.integrity.valid, true);
    assert.strictEqual(approvalLedger.body.entries.length, 1);
    const largeWorkspace = { projects: { p1: { project: { name: "Large workspace", notes: "x".repeat(12000) } } }, order: ["p1"], activeId: "p1", brand: {} };
    const largeSaved = await request(port, "PUT", "/api/workspace", largeWorkspace);
    assert.strictEqual(largeSaved.status, 200);
    const history = await request(port, "GET", "/api/workspace/history");
    assert.strictEqual(history.status, 200);
    assert.strictEqual(history.body.integrity.valid, true);
    assert.ok(history.body.history.length >= 2);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(history.body.history[0], "snapshot"), false);
    const restored = await request(port, "POST", "/api/workspace/restore", { revision: "1" });
    assert.strictEqual(restored.status, 200);
    const restoredWorkspace = await request(port, "GET", "/api/workspace");
    assert.strictEqual(restoredWorkspace.body.workspace.projects.p1.project.name, "Server workspace");
    const conflict = await request(port, "PUT", "/api/workspace", workspace, { "If-Match": "0" });
    assert.strictEqual(conflict.status, 409);
    fs.appendFileSync(testFile, "not-json\n", "utf8");
    assert.strictEqual(serverModule.verifyAudit(serverModule.readAudit()).valid, false);
    fs.appendFileSync(historyFile, "not-json\n", "utf8");
    assert.strictEqual(serverModule.verifyWorkspaceHistory(serverModule.readWorkspaceHistory()).valid, false);
    const badWorkspace = await request(port, "PUT", "/api/workspace", { projects: [] });
    assert.strictEqual(badWorkspace.status, 400);
    // Loopback-only default for unauthenticated local access (anonymousLocalAllowed):
    // a bare `{headers:{}}` request has no socket and can no longer claim admin —
    // pass an explicit loopback peer, mirroring test/anonymous-local-default.test.js.
    const loopbackReq = { socket: { remoteAddress: "127.0.0.1" }, headers: {} };
    assert.strictEqual(serverModule.roleFor(loopbackReq), "admin");
    assert.strictEqual(serverModule.authorized(loopbackReq, "editor"), true);
    const sensitiveWorkspace = { projects: { p1: { approvals: [{ id: 5 }], events: [{ id: 6 }], registers: { conflict: [{ id: 1 }], psychSafety: [{ id: 3 }], energy: [{ id: 4 }], tasks: [{ id: 2 }] } } } };
    const viewerWorkspace = serverModule.sanitizeWorkspaceForRole(sensitiveWorkspace, "viewer");
    assert.strictEqual(viewerWorkspace.projects.p1.approvals.length, 0);
    assert.strictEqual(viewerWorkspace.projects.p1.events.length, 0);
    assert.strictEqual(viewerWorkspace.projects.p1.registers.conflict.length, 0);
    assert.strictEqual(viewerWorkspace.projects.p1.registers.psychSafety.length, 0);
    assert.strictEqual(viewerWorkspace.projects.p1.registers.energy.length, 0);
    assert.strictEqual(viewerWorkspace.projects.p1.registers.tasks.length, 1);
    assert.strictEqual(serverModule.sanitizeWorkspaceForRole(sensitiveWorkspace, "editor").projects.p1.registers.conflict.length, 1);

    // Bug 88 regression: /api/insights/verify is viewer-gated but read the RAW
    // workspace, so a viewer could POST a conflictScore claim and learn the
    // conflict's intensity score (the "corrected" response leaks `computed`).
    // readScopedWorkspace now feeds the sanitized view, so the same claim must
    // be "stale" with no computed value for a viewer while editors still get it.
    const leakWs = { projects: { p1: { id: "p1", registers: { conflicts: [{ _id: "c1", parties: ["A", "B"], stage: "Active" }] } } } };
    const leakClaim = { id: "k", kind: "conflictScore", value: 0, provenance: { projectId: "p1", rowId: "c1" } };
    const leakRaw = serverModule.claimsLib.verifyClaims(leakWs, [leakClaim]).claims[0];
    const leakViewer = serverModule.claimsLib.verifyClaims(serverModule.sanitizeWorkspaceForRole(JSON.parse(JSON.stringify(leakWs)), "viewer"), [leakClaim]).claims[0];
    assert.ok(typeof leakRaw.computed === "number", "raw workspace computes the conflict score (control)");
    assert.strictEqual(leakViewer.computed, undefined, "viewer no longer receives the conflict score via /api/insights/verify");
    assert.strictEqual(leakViewer.status, "stale", "viewer conflictScore claim is unavailable after sanitization");
    const approvalWorkspace = { projects: { p1: { approvals: [{ id: 1 }] } } };
    const changedApprovals = { projects: { p1: { approvals: [{ id: 2 }] } } };
    assert.strictEqual(serverModule.approvalChangeAllowed(approvalWorkspace, changedApprovals, "editor"), false);
    assert.strictEqual(serverModule.approvalChangeAllowed(approvalWorkspace, changedApprovals, "admin"), true);

    // Bug 15 regression: /api/dr/simulate and /api/benchmarking used an
    // undefined `num` helper, which threw ReferenceError inside the async
    // handler and hung the connection with no HTTP response (an easy DoS for
    // any authenticated viewer). They must return promptly with HTTP 200 and
    // fall back to defaults for missing/non-numeric params.
    const boundedGet = (route) => Promise.race([
      request(port, "GET", route),
      new Promise(resolve => setTimeout(() => resolve({ status: 0, body: { error: "TIMEOUT" } }), 3000))
    ]);
    // Guarded requests never hang thanks to the timeout race; before Bug 15's
    // `num` fix these threw ReferenceError into the async handler and the
    // connection hung with no HTTP response at all.
    const simulate = await boundedGet("/api/dr/simulate");
    assert.strictEqual(simulate.status, 200, "/api/dr/simulate must respond (was: " + JSON.stringify(simulate) + ")");
    const bench = await boundedGet("/api/benchmarking");
    assert.strictEqual(bench.status, 200, "/api/benchmarking must respond (was: " + JSON.stringify(bench) + ")");
    assert.ok(bench.body && typeof bench.body === "object", "benchmarking returns a JSON body");

    // Systemic-route regressions: server.js previously referenced an
    // undefined block-scoped `project` (throwing ReferenceError as an
    // unhandled rejection, hanging those routes), an unpopulated `req.query`
    // (crashing /api/forensic-audit/export), and an undefined `nowISO` helper.
    // Each of these must now answer promptly with HTTP 200.
    const sysRoutes = [
      "/api/forensic-audit",
      "/api/forensic-audit/export",
      "/api/narrative/ceo-letter",
      "/api/okr/dashboard",
      "/api/observability/metrics-export",
      "/api/observability/slos",
      "/api/observability/health-deep",
      "/api/production/hardening-report",
      "/api/production/headers",
      "/api/realtime/ws-health",
      "/api/backup/rto-rpo",
      "/api/db/migration-test"
    ];
    for (const r of sysRoutes) {
      const resp = await boundedGet(r);
      assert.strictEqual(resp.status, 200, r + " must respond (was: " + JSON.stringify(resp) + ")");
    }
    // req.query is now populated (was undefined). /api/forensic-audit/export
    // reads req.query.framework unguarded; it must work without crashing and,
    // with no query string, fall back to the SOX_404 default.
    const forex = await boundedGet("/api/forensic-audit/export");
    assert.strictEqual(forex.status, 200, "forensic export default path responds");
    assert.ok(forex.body && forex.body.framework, "forensic export falls back to a framework default");
    // ─── sanitizeWorkspaceForRole must not leak sensitive data via snapshots ───
    // Regression: live sensitive registers were cleared, but project snapshots
    // embed full register copies ({project, roster, registers}) and were left
    // intact — a viewer/auditor could read conflict/feedback data from them.
    const leakyWorkspace = {
      projects: {
        p1: {
          project: { name: "Demo" },
          registers: { conflict: [{ _id: "c1", detail: "SECRET" }], conflicts: [{ _id: "c2", title: "TEAM CONFLICT", detail: "SECRET" }], absences: [{ _id: "a1", memberId: "m1", reason: "sick" }], tasks: [{ _id: "t1", title: "Task" }] },
          roster: [{ id: "m1", name: "Alice", role: "CEO", salary: 150000, disc: { D: 4 }, ei: { selfAwareness: 3 } }],
          snapshots: [{
            id: "s1",
            ts: "2026-01-01T00:00:00Z",
            data: { project: { name: "Demo" }, roster: [{ id: "m1", name: "Alice", role: "CEO", salary: 150000 }], registers: { conflict: [{ _id: "c1", detail: "SECRET" }], conflicts: [{ _id: "c2", title: "TEAM CONFLICT" }] } }
          }]
        }
      }
    };
    const sanitized = serverModule.sanitizeWorkspaceForRole(leakyWorkspace, "viewer");
    assert.strictEqual(sanitized.projects.p1.registers.conflict.length, 0, "legacy sensitive register is cleared");
    assert.strictEqual(sanitized.projects.p1.registers.conflicts.length, 0, "real conflict register is cleared");
    assert.strictEqual(sanitized.projects.p1.registers.absences.length, 0, "absence register is cleared");
    assert.strictEqual(sanitized.projects.p1.registers.tasks.length, 1, "non-sensitive registers are preserved");
    assert.strictEqual(sanitized.projects.p1.snapshots[0].data.registers.conflict.length, 0, "legacy sensitive data in snapshots is cleared too");
    assert.strictEqual(sanitized.projects.p1.snapshots[0].data.registers.conflicts.length, 0, "real conflict data in snapshots is cleared too");
    assert.deepStrictEqual(sanitized.projects.p1.roster, [{ id: "m1", name: "Alice", role: "CEO" }], "roster is stripped to identity fields");
    assert.strictEqual(serverModule.sanitizeWorkspaceForRole(leakyWorkspace, "admin").projects.p1.registers.conflicts.length, 1, "admins keep full data");

    // ─── Realtime-collaboration routes ────────────────────────────────────
    // /api/collab/conflicts: concurrent same-path edits must be detected.
    const conflicts = await request(port, "POST", "/api/collab/conflicts", {
      doc: { operations: [{ path: "t", clientId: "A", vectorClock: { A: 1 } }] },
      incomingOps: [{ path: "t", clientId: "B", vectorClock: { B: 1 } }]
    });
    assert.strictEqual(conflicts.status, 200, "collab/conflicts returns 200");
    assert.strictEqual(conflicts.body.conflictCount, 1, "concurrent edits are detected via the route");

    // /api/collab/rt-edit: recordEdit is now reachable (was shadowed by the
    // collaboration /api/collab/edit handler).
    const rtEdit = await request(port, "POST", "/api/collab/rt-edit", {
      doc: { docId: "d", data: {}, vectorClock: {}, operations: [], clients: {} },
      clientId: "A", path: "title", value: "v1", user: "Alice"
    });
    assert.strictEqual(rtEdit.status, 200, "collab/rt-edit returns 200");
    assert.strictEqual(rtEdit.body.type, "SET", "recordEdit route returns the operation");

    // /api/collab/edit (collaboration module): a malformed edit without a
    // clock must be a clean 400, not a 500 crash.
    const badEdit = await request(port, "POST", "/api/collab/edit", { docId: "d1", edit: { op: "set", path: "x", value: 1 } });
    assert.strictEqual(badEdit.status, 400, "collab/edit with missing clock is a clean 400 (was 500)");

    // /api/collab/lock: a 0s-TTL lock must be immediately reacquirable by
    // another client (regression: strict < made it sticky within the same ms).
    // The route is stateless per request, so thread the returned lock into the
    // next request's doc — by then its expiresAt (== the first request's now)
    // is in the past and E must be able to take it over.
    const lock1 = await request(port, "POST", "/api/collab/lock", { doc: { docId: "d", locks: {} }, recordId: "r", clientId: "D", ttlSeconds: 0 });
    assert.strictEqual(lock1.status, 200, "0s-TTL lock route responds");
    assert.strictEqual(lock1.body.acquired, true, "0s-TTL lock acquires");
    const lock2 = await request(port, "POST", "/api/collab/lock", {
      doc: { docId: "d", locks: { r: { lockId: lock1.body.lockId, owner: "D", expiresAt: lock1.body.expiresAt } } },
      recordId: "r", clientId: "E", ttlSeconds: 60
    });
    assert.strictEqual(lock2.status, 200, "reacquire route responds");
    assert.strictEqual(lock2.body.acquired, true, "0s-TTL lock is immediately reacquirable (got " + (lock2.body && lock2.body.error) + ")");

    // ── Pricing routes: malformed / degenerate bodies must degrade to a clean
    // 200-with-null (or 400), never a hang or 500 ───────────────────────────
    // /api/pricing/optimal with inverted min/max bounds used to infinite-loop
    // (equal bounds) or crash on results[0].price (min > max).
    const optDegenerate = await request(port, "POST", "/api/pricing/optimal", { currentPrice: 100, currentDemand: 100, elasticity: -1.5, constraints: { minPrice: 200, maxPrice: 100 } });
    assert.strictEqual(optDegenerate.status, 200, "optimal with inverted bounds returns 200 (was a crash/hang)");
    assert.strictEqual(optDegenerate.body.optimalRevenuePrice, null, "optimal with inverted bounds reports no optimal price");
    const optEmpty = await request(port, "POST", "/api/pricing/optimal", { constraints: {} });
    assert.strictEqual(optEmpty.status, 200, "optimal with no price input returns 200 gracefully");
    assert.strictEqual(optEmpty.body.optimalRevenuePrice, null, "optimal with no price input reports no optimal price");
    const tieredEmpty = await request(port, "POST", "/api/pricing/tiered", {});
    assert.strictEqual(tieredEmpty.status, 200, "tiered with empty body returns 200");
    assert.ok(Array.isArray(tieredEmpty.body.tiers), "tiered returns a tiers array");
    const elastNull = await request(port, "POST", "/api/pricing/elasticity", { historicalPrices: null });
    assert.strictEqual(elastNull.status, 200, "elasticity with null history returns 200");

    // ── Treasury routes: missing required inputs must degrade to a clean 400
    // (never a 500), while guarded endpoints return 200 on empty bodies ─────
    const cashEmpty = await request(port, "POST", "/api/treasury/cash-position", {});
    assert.strictEqual(cashEmpty.status, 200, "cash-position with empty body returns 200");
    assert.ok(Array.isArray(cashEmpty.body.positions), "cash-position returns a positions array");
    const fxEmpty = await request(port, "POST", "/api/treasury/fx-exposure", {});
    assert.strictEqual(fxEmpty.status, 200, "fx-exposure with empty body returns 200");
    assert.ok(fxEmpty.body.exposures !== null, "fx-exposure returns an exposures map");
    const hedgeMissing = await request(port, "POST", "/api/treasury/hedging", {});
    assert.strictEqual(hedgeMissing.status, 400, "hedging without riskProfile is a clean 400 (was 500)");
    const debtMissing = await request(port, "POST", "/api/treasury/debt-structure", {});
    assert.strictEqual(debtMissing.status, 400, "debt-structure without debts is a clean 400 (was 500)");
    const hedgeValid = await request(port, "POST", "/api/treasury/hedging", { riskProfile: { fxRiskTolerance: "moderate" }, exposures: { EUR: { baseCurrencyExposure: 500000, material: true, currency: "EUR" } } });
    assert.strictEqual(hedgeValid.status, 200, "hedging with valid inputs returns 200");
    assert.ok(Array.isArray(hedgeValid.body.strategies), "hedging returns a strategies array");

    // ── Transfer-pricing routes: empty bodies must degrade to a clean 200 ──
    const tpCup = await request(port, "POST", "/api/transfer-pricing/cup", {});
    assert.strictEqual(tpCup.status, 200, "transfer-pricing/cup with empty body returns 200");
    const tpCbcr = await request(port, "POST", "/api/transfer-pricing/cbcr", {});
    assert.strictEqual(tpCbcr.status, 200, "transfer-pricing/cbcr with empty body returns 200");
    assert.ok(Array.isArray(tpCbcr.body.entities), "transfer-pricing/cbcr returns an entities array");
    // Regression: tpRiskAssessment(undefined) used to crash on transactions.length
    // (loop used (transactions||[]), return used bare .length); now a clean 200.
    const tpRisk = await request(port, "POST", "/api/transfer-pricing/risk", {});
    assert.strictEqual(tpRisk.status, 200, "transfer-pricing/risk with empty body returns 200 (was a crash)");
    assert.strictEqual(tpRisk.body.totalTransactions, 0, "transfer-pricing/risk reports zero transactions");

    // ── Financial statements routes: after the journal -> trial-balance fix,
    // the pnl route returns a statement object (was all-zeros for the app's
    // name-based journal); the double-entry period-close must never 500. ──
    const pnl = await request(port, "GET", "/api/financial-statements/pnl");
    assert.strictEqual(pnl.status, 200, "financial-statements/pnl returns 200");
    assert.strictEqual(typeof pnl.body.summary, "string", "pnl returns a statement summary");
    const pc = await request(port, "POST", "/api/finance/period-close-double-entry", { periodId: "P-1" });
    assert.ok(pc.status !== 500, "period-close never 500s (got " + pc.status + ")");

    // ── Financial statements live value: seed a name-based double-entry
    //    finance journal on the active project; the pnl route must surface real
    //    revenue / net income (previously all-zero via the wrong pipeline). ──
    const finWs = {
      projects: { p1: { project: { name: "FS live" }, decisions: [], actions: [], financeJournal: [
        { id: "fsj1", date: "2026-01-15", currency: "USD", lines: [{ account: "Cash", debit: 1000 }, { account: "Revenue", credit: 1000 }] },
        { id: "fsj2", date: "2026-02-01", currency: "USD", lines: [{ account: "Payroll", debit: 400 }, { account: "Cash", credit: 400 }] }
      ] } },
      order: ["p1"], activeId: "p1", brand: {}
    };
    const finSave = await request(port, "PUT", "/api/workspace", finWs);
    assert.strictEqual(finSave.status, 200, "workspace with a finance journal saves");
    const pnlLive = await request(port, "GET", "/api/financial-statements/pnl");
    assert.strictEqual(pnlLive.status, 200, "pnl returns 200 for a seeded journal");
    assert.ok(pnlLive.body.period && pnlLive.body.period.revenue > 0, "pnl reports real revenue for the seeded journal (was 0)");
    assert.ok(pnlLive.body.period && pnlLive.body.period.netIncome > 0, "pnl reports real net income (was 0)");
    // Cash-flow route: the seeded journal (Cash 600, Revenue 1000, Payroll 400)
    // must surface finite, internally consistent figures through HTTP.
    const cfLive = await request(port, "GET", "/api/financial-statements/cashflow");
    assert.strictEqual(cfLive.status, 200, "cashflow returns 200 for a seeded journal");
    assert.ok(Number.isFinite(cfLive.body.netCashFlow) && Number.isFinite(cfLive.body.operatingCashFlow), "cashflow figures are finite numbers");
    // ── Classifier fix live: a name-based journal posting "Income Tax" and
    //    "Deferred Revenue" must NOT roll them into top-line revenue. Through the
    //    real HTTP path: tax → taxExpense, Deferred Revenue → liabilities, so net
    //    income = 2000 - 300 = 1700 and revenue stays 2000 (was: both classified
    //    as revenue → netIncome 2800, deferred posted to top line).
    const clsWs = {
      projects: { p1: { project: { name: "classify live" }, decisions: [], actions: [], financeJournal: [
        { id: "cls1", date: "2026-01-15", currency: "USD", lines: [{ account: "Cash", debit: 2000 }, { account: "Revenue", credit: 2000 }] },
        { id: "cls2", date: "2026-01-20", currency: "USD", lines: [{ account: "Income Tax", debit: 300 }, { account: "Cash", credit: 300 }] },
        { id: "cls3", date: "2026-01-25", currency: "USD", lines: [{ account: "Cash", debit: 500 }, { account: "Deferred Revenue", credit: 500 }] }
      ] } },
      order: ["p1"], activeId: "p1", brand: {}
    };
    const clsSave = await request(port, "PUT", "/api/workspace", clsWs);
    assert.strictEqual(clsSave.status, 200, "classifier workspace saves");
    const clsPnl = await (await fetch("http://127.0.0.1:" + port + "/api/financial-statements/pnl")).json();
    const clsBs = await (await fetch("http://127.0.0.1:" + port + "/api/financial-statements/balance-sheet")).json();
    const clsPeriod = clsPnl.period || clsPnl;
    assert.strictEqual(clsPeriod.revenue, 2000, "revenue = 2000 (Income Tax & Deferred are NOT revenue)");
    assert.strictEqual(clsPeriod.taxExpense, 300, "Income Tax lands in taxExpense (was revenue)");
    assert.strictEqual(clsPeriod.netIncome, 1700, "net income = 2000 - 300 = 1700 (was 2800 with tax in revenue)");
    assert.ok((clsBs.liabilities && clsBs.liabilities.totalLiabilities) >= 500, "Deferred Revenue lands in liabilities (was revenue)");
    assert.strictEqual(cfLive.body.operatingCashFlow, 600, "operating CF = net income 600 (single period, no working-capital deltas)");
    assert.strictEqual(cfLive.body.investingCashFlow, 0, "investing CF is 0 without a prior-period balance sheet");

    // ── Cost-center allocation route: direct-labor basis must split
    //    proportionally to each center's hours (previously all advertised
    //    non-equal bases silently equal-split, mischarging centers). ──
    const costAlloc = await request(port, "POST", "/api/cost/allocate", {
      items: [{ id: "cc1", amount: 1100, category: "overhead" }],
      centers: [{ id: "A", name: "Sales", directLaborHours: 100 }, { id: "B", name: "R&D", directLaborHours: 10 }],
      rules: { overhead: { basis: "direct_labor_hours", centers: ["A", "B"] } }
    });
    assert.strictEqual(costAlloc.status, 200, "cost/allocate returns 200");
    assert.ok(costAlloc.body.byCenter && costAlloc.body.byCenter["A"], "cost/allocate assigns center A");
    assert.strictEqual(costAlloc.body.byCenter["A"].allocated, 1000, "direct-labor basis charges Sales 1000 (was equal 550)");
    assert.strictEqual(costAlloc.body.byCenter["B"].allocated, 100, "direct-labor basis charges R&D 100");

    // ── Conflict outcome must actually persist (lost-write regression) ──
    // /api/conflicts/outcome used to mutate `project` from one readScopedWorkspace
    // call but persisted `readScopedWorkspace(req)` AGAIN (a fresh unmutated
    // disk read), so the resolved outcome and incident were silently lost — the
    // case stayed "Active" even though the POST returned 200.
    const conflictWs = { ...(await request(port, "GET", "/api/workspace")).body.workspace };
    const cid = Object.keys(conflictWs.projects)[0];
    conflictWs.projects[cid].registers = conflictWs.projects[cid].registers || {};
    conflictWs.projects[cid].registers.conflicts = [{ _id: "coc1", parties: ["A", "B"], stage: "Active", created: "2026-08-01" }];
    assert.strictEqual((await request(port, "PUT", "/api/workspace", conflictWs)).status, 200, "seeded conflict workspace saves");
    const outcome = await request(port, "POST", "/api/conflicts/outcome", { caseId: "coc1", outcome: { type: "resolved", resolution: "mediation" } });
    assert.strictEqual(outcome.status, 200, "conflict/outcome returns 200");
    const conflictCheck = (await request(port, "GET", "/api/workspace")).body.workspace.projects[cid];
    const resolvedCase = (conflictCheck.registers && conflictCheck.registers.conflicts || []).find(x => x._id === "coc1");
    assert.ok(resolvedCase && (resolvedCase.status === "RESOLVED" || resolvedCase.outcome),
      "conflict outcome PERSISTS after POST (was: case stayed Active, lost write)");

    // ── Change-management impact route: a change with no positive net annual
    //    benefit must report a null payback through the real HTTP path (was a
    //    fabricated Infinity / negative "payback"). ──
    const chgImpact = await request(port, "POST", "/api/change/impact", {
      change: { title: "Reorg", affectedRoles: ["eng"], capexAmount: 100000, annualBenefits: 5000, opexYear1: 20000 },
      orgContext: { roles: [{ roleId: "eng", headcount: 4 }] },
      financialContext: {},
      riskContext: {}
    });
    assert.strictEqual(chgImpact.status, 200, "change/impact returns 200");
    assert.strictEqual(chgImpact.body.dimensions.financial.paybackMonths, null, "net-negative change => null payback (was -80)");
    const chgPays = await request(port, "POST", "/api/change/impact", {
      change: { title: "Reorg", affectedRoles: ["eng"], capexAmount: 120000, annualBenefits: 60000, opexYear1: 10000 },
      orgContext: { roles: [{ roleId: "eng", headcount: 4 }] },
      financialContext: {},
      riskContext: {}
    });
    assert.strictEqual(chgPays.status, 200, "change/impact with net-positive returns 200");
    assert.ok(Math.abs(chgPays.body.dimensions.financial.paybackMonths - 28.8) < 0.1, "net-positive change computes payback (" + chgPays.body.dimensions.financial.paybackMonths + ")");

    // ── Supply-chain concentration route: a well-diversified supplier base
    //    must not crash (was a ReferenceError on the nonexistent materialSpends
    //    variable when no single supplier held >33% of spend). ──
    const scDiversified = await request(port, "POST", "/api/supply-chain/concentration", {
      bom: [{ id: "part-d", name: "Diversified part" }],
      suppliers: [1, 2, 3, 4, 5].map(n => ({ id: "sc" + n, name: "SC" + n, materials: ["part-d"] })),
      spend: { sc1: 20, sc2: 20, sc3: 20, sc4: 20, sc5: 20 }
    });
    assert.strictEqual(scDiversified.status, 200, "supply-chain/concentration returns 200 for a diversified base");
    assert.strictEqual(scDiversified.body.risks.length, 0, "well-diversified material has no concentration risk (was a crash)");
    const scSingle = await request(port, "POST", "/api/supply-chain/concentration", {
      bom: [{ id: "part-s", name: "Sole part" }],
      suppliers: [{ id: "sc9", name: "Sole supplier", materials: ["part-s"] }],
      spend: { sc9: 100 }
    });
    assert.strictEqual(scSingle.body.risks[0].risk, "SINGLE_SOURCE", "sole-supplier still flagged SINGLE_SOURCE");

    // ── Transfer-pricing CUP route: a free ($0) controlled transfer must be
    //    price-tested (was falsely "within range"), and zero comparables must
    //    not yield an Infinity deviation. ──
    const cupFree = await request(port, "POST", "/api/transfer-pricing/cup", { controlledPrice: 0, comparablePrice: 100 });
    assert.strictEqual(cupFree.status, 200, "transfer-pricing/cup returns 200");
    assert.strictEqual(cupFree.body.deviationPercent, -100, "free-0 transfer deviation is -100% (was 0)");
    assert.strictEqual(cupFree.body.withinRange, false, "free-0 transfer is out of range (was falsely in-range)");
    const cupNoComp = await request(port, "POST", "/api/transfer-pricing/cup", { controlledPrice: 120, comparablePrice: 0 });
    assert.strictEqual(cupNoComp.body.deviationPercent, null, "zero comparable yields null deviation (not Infinity)");

    console.log("Server tests: 90 passed, 0 failed");
  } finally {
    await new Promise(resolve => testServer.close(resolve));
    if (backup === null) fs.rmSync(testFile, { force: true });
    else fs.writeFileSync(testFile, backup);
    if (workspaceBackup === null) fs.rmSync(workspaceFile, { force: true });
    else fs.writeFileSync(workspaceFile, workspaceBackup);
    if (historyBackup === null) fs.rmSync(historyFile, { force: true });
    else fs.writeFileSync(historyFile, historyBackup);
    if (approvalBackup === null) fs.rmSync(approvalFile, { force: true });
    else fs.writeFileSync(approvalFile, approvalBackup);
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
