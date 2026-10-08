/* ============================================================================
   watch-jobs.cjs — background progress watcher for the deep-walk workers and
   the Stryker mutation gate. Polls every 60s, appends checkpoints to the log,
   and when BOTH jobs complete writes a final summary (mutation score vs the
   break threshold + full deep-walk evidence totals) and exits.

   Launch:  node watch-jobs.cjs &   (from the project root)
   Env:     TEMP_BASH_TMP   — directory where worker/stryker logs live
            (defaults to Git-Bash-on-Windows temp; on Linux use /tmp)
            WATCH_LOG       — output log path (default <TEMP_BASH_TMP>/job-watch.log)
            MUT_LOG         — stryker run log path (default <TEMP_BASH_TMP>/stryker2.log)

   NOTE for Windows/Git Bash: bash writes its log files to its own /tmp
   (typically C:/Users/<user>/AppData/Local/Temp) while Node resolves /tmp to
   C:/tmp — so pass the bash temp dir via TEMP_BASH_TMP (or run with the
   default below) so the watcher reads the same files bash writes.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");

// os.tmpdir() is correct on both platforms: Windows returns the per-user
// AppData\Local\Temp (which is where Git Bash's /tmp points), Linux returns /tmp.
const BASH_TMP = process.env.TEMP_BASH_TMP || os.tmpdir();
const LOG = process.env.WATCH_LOG || `${BASH_TMP}/job-watch.log`;
const WORKERS = [0, 1, 2, 3];
const MUT_LOG = process.env.MUT_LOG || `${BASH_TMP}/stryker2.log`;
const MUT_REPORT = path.join(process.cwd(), "eval-reports", "mutation-report.json");
const EVIDENCE_ROOT = path.join(process.cwd(), "evidence");

function stamp() {
  return new Date().toISOString();
}
function log(line) {
  fs.appendFileSync(LOG, `[${stamp()}] ${line}\n`);
}

function countDone() {
  let n = 0;
  for (const w of WORKERS) {
    const f = `${BASH_TMP}/worker-${w}.log`;
    try {
      const t = fs.readFileSync(f, "utf8");
      n += (t.match(/\bDONE\b/g) || []).length;
    } catch (_) {}
  }
  return n;
}
function reportsWritten() {
  try {
    let n = 0;
    for (const w of WORKERS) {
      const dir = path.join(EVIDENCE_ROOT, `evidence-${w}`);
      if (!fs.existsSync(dir)) continue;
      for (const proj of fs.readdirSync(dir)) {
        if (fs.existsSync(path.join(dir, proj, "report.json"))) n++;
      }
    }
    return n;
  } catch (_) { return -1; }
}
function mutationProgress() {
  try {
    const t = fs.readFileSync(MUT_LOG, "utf8");
    const m = t.match(/(\d+)\/(\d+) tested \((\d+) survived, (\d+) timed out\)/g);
    if (!m || !m.length) return "running (no mutants yet)";
    return m[m.length - 1];
  } catch (_) { return "no log"; }
}
function mutationScore() {
  try {
    const r = JSON.parse(fs.readFileSync(MUT_REPORT, "utf8"));
    let killed = 0, tot = 0;
    for (const v of Object.values(r.files || {})) {
      for (const m of v.mutants || []) {
        tot++;
        if (m.status === "Killed" || m.status === "killed") killed++;
      }
    }
    return tot ? { killed, tot, pct: (killed / tot * 100).toFixed(1) } : null;
  } catch (_) { return null; }
}
function aggregateEvidence() {
  let t = { views: 0, buttons: 0, regs: 0, shots: 0, created: 0 };
  for (const w of WORKERS) {
    const dir = path.join(EVIDENCE_ROOT, `evidence-${w}`);
    if (!fs.existsSync(dir)) continue;
    for (const proj of fs.readdirSync(dir)) {
      const f = path.join(dir, proj, "report.json");
      if (!fs.existsSync(f)) continue;
      try {
        const r = JSON.parse(fs.readFileSync(f, "utf8"));
        t.views += r.views.length;
        t.buttons += r.buttonsPressed;
        t.regs += Object.keys(r.registers || {}).length;
        t.shots += Object.keys(r.screenshots || {}).length;
        if (r.created) t.created++;
      } catch (_) {}
    }
  }
  return t;
}

log("watcher started");
log(`initial: deepwalk=${countDone()}/100 reports=${reportsWritten()} mutation=${mutationProgress()}`);

let lastDeepwalk = -1, lastMutation = "";
setInterval(() => {
  const dw = countDone();
  const rep = reportsWritten();
  const mp = mutationProgress();
  const score = mutationScore();
  let line = `deepwalk=${dw}/100 reports=${rep} mutation=${mp}`;
  if (score) line += ` reportScore=${score.pct}%`;
  if (dw !== lastDeepwalk || mp !== lastMutation) {
    log(line);
    lastDeepwalk = dw;
    lastMutation = mp;
  }
  const done = dw >= 100 && score && score.tot > 0;
  if (done) {
    const agg = aggregateEvidence();
    log("BOTH JOBS COMPLETE");
    log(`FINAL deepwalk=${dw}/100 reports=${rep}`);
    log(`FINAL mutationScore=${score.pct}% (${score.killed}/${score.tot} killed, break=50 -> ${score.pct >= 50 ? "PASS" : "FAIL"})`);
    log(`FINAL evidence totals: views=${agg.views} buttons=${agg.buttons} regs=${agg.regs} shots=${agg.shots} created=${agg.created}`);
    log("watcher exiting");
    process.exit(0);
  }
}, 60000);

process.on("SIGTERM", () => { log("watcher terminated"); process.exit(0); });