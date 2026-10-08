/*
  evaluate-100-real.cjs — aggregate + evaluate the 100-real-project deep walk.

  Reads evidence/evidence-<w>/<slug>/report.json for all 100 real projects and
  produces:
    - per-project outcome (created, views, buttons, errors, findings)
    - per-view error frequency across all 100 projects (the real stability map)
    - console-error categories
    - cross-module feature success matrix
    - register seeding success (duplication / overlap of register coverage)
    - lifecycle (tasks finished)
    - a plain-text evaluation summary for the caller

  Usage: node evaluate-100-real.cjs [--json eval-reports/deepwalk-100-real.json]
*/
const path = require("path");
const fs = require("fs");

const ROOT = __dirname;
const EVIDENCE_ROOT = path.join(ROOT, "evidence");
const OUT_JSON = process.argv.includes("--json")
  ? path.join(ROOT, process.argv[process.argv.indexOf("--json") + 1])
  : null;

function loadReports() {
  const reports = [];
  for (let w = 0; w < 8; w++) {
    const dir = path.join(EVIDENCE_ROOT, `evidence-${w}`);
    if (!fs.existsSync(dir)) continue;
    for (const proj of fs.readdirSync(dir)) {
      const f = path.join(dir, proj, "report.json");
      if (!fs.existsSync(f)) continue;
      try {
        const ev = JSON.parse(fs.readFileSync(f, "utf8"));
        reports.push({ worker: w, slug: proj, ev });
      } catch (e) {
        reports.push({ worker: w, slug: proj, error: String(e) });
      }
    }
  }
  return reports;
}

function summarize(reports) {
  const out = {
    generatedAt: new Date().toISOString(),
    totalProjects: reports.length,
    created: 0,
    createdFailed: [],
    viewsSwept: 0,
    buttonsPressed: 0,
    consoleErrors: [],
    consoleErrorCategories: {},
    perViewErrors: {},     // view -> { projects: n, errors: n }
    perViewUnrendered: {}, // view -> projects where rendered=false
    findings: [],
    crossModule: {},       // feature -> { ok, fail, sample }
    registerFailures: [],
    registersSeeded: {},
    lifecycleFinished: 0,
    pageErrorsPerProject: []
  };

  for (const { worker, slug, ev } of reports) {
    if (ev.error) { out.createdFailed.push({ slug, error: ev.error }); continue; }
    if (ev.created) out.created++;
    else out.createdFailed.push({ slug, created: false });

    out.viewsSwept += (ev.views || []).length;
    out.buttonsPressed += ev.buttonsPressed || 0;

    for (const err of ev.consoleErrors || []) {
      out.consoleErrors.push({ project: ev.project || slug, err });
      const cat = String(err).split(":")[0].split(" ").slice(0, 4).join(" ").slice(0, 60);
      out.consoleErrorCategories[cat] = (out.consoleErrorCategories[cat] || 0) + 1;
    }
    out.pageErrorsPerProject.push({ project: ev.project || slug, consoleErrors: (ev.consoleErrors || []).length, findings: (ev.findings || []).length });

    for (const v of ev.views || []) {
      if (!out.perViewErrors[v.view]) out.perViewErrors[v.view] = { projects: 0, errors: 0, unrendered: 0 };
      out.perViewErrors[v.view].projects++;
      out.perViewErrors[v.view].errors += v.errors || 0;
      if (!v.rendered) out.perViewErrors[v.view].unrendered++;
      // findings from views: buttons that errored
      for (const b of v.buttons || []) {
        if (b.error) out.findings.push({ project: ev.project || slug, view: v.view, id: b.id, text: b.text, error: String(b.error).slice(0, 120) });
      }
    }

    for (const f of ev.findings || []) out.findings.push({ project: ev.project || slug, finding: String(f).slice(0, 200) });

    // cross-module matrix
    for (const [k, val] of Object.entries(ev.crossModule || {})) {
      if (!out.crossModule[k]) out.crossModule[k] = { ok: 0, fail: 0, samples: [] };
      const isErr = typeof val === "string" && (val.startsWith("err:") || val.startsWith("no-"));
      if (isErr) { out.crossModule[k].fail++; if (out.crossModule[k].samples.length < 3) out.crossModule[k].samples.push({ project: ev.project || slug, val }); }
      else { out.crossModule[k].ok++; }
    }

    // register seeding
    for (const [reg, r] of Object.entries(ev.registers || {})) {
      if (!out.registersSeeded[reg]) out.registersSeeded[reg] = { projects: 0, added: 0, wanted: 0, failed: 0 };
      out.registersSeeded[reg].projects++;
      out.registersSeeded[reg].added += r.added || 0;
      out.registersSeeded[reg].wanted += r.wanted || 0;
      if ((r.failed || 0) > 0) { out.registersSeeded[reg].failed += r.failed; out.registerFailures.push({ project: ev.project || slug, reg, failed: r.failed }); }
    }

    if (ev.lifecycle && ev.lifecycle.tasksFinished > 0) out.lifecycleFinished++;
  }

  // per-view trouble ranking
  out.viewTrouble = Object.entries(out.perViewErrors)
    .map(([view, s]) => ({ view, ...s, pct: s.projects ? Math.round((100 * s.errors) / s.projects) : 0 }))
    .filter(s => s.errors > 0 || s.unrendered > 0)
    .sort((a, b) => (b.errors + b.unrendered) - (a.errors + a.unrendered));

  return out;
}

function renderText(s) {
  const L = [];
  L.push("=".repeat(72));
  L.push(`DEEP-WALK EVALUATION — ${s.totalProjects} real projects, generated ${s.generatedAt}`);
  L.push("=".repeat(72));
  L.push(`Projects created via UI : ${s.created} / ${s.totalProjects}`);
  L.push(`Views swept (per project): ${s.viewsSwept} total (${s.totalProjects ? Math.round(s.viewsSwept / s.totalProjects) : 0}/project)`);
  L.push(`Buttons pressed          : ${s.buttonsPressed}`);
  L.push(`Console errors           : ${s.consoleErrors.length} across ${s.totalProjects} projects`);
  L.push(`Projects with findings   : ${s.findings.length} findings`);
  L.push(`Lifecycle tasks finished : ${s.lifecycleFinished} projects`);

  L.push("");
  L.push("-- CONSOLE ERROR CATEGORIES --");
  const cats = Object.entries(s.consoleErrorCategories).sort((a, b) => b[1] - a[1]);
  if (!cats.length) L.push("  (none)");
  for (const [cat, n] of cats.slice(0, 10)) L.push(`  ${n}x  ${cat}`);

  L.push("");
  L.push("-- VIEWS WITH ERRORS OR RENDER FAILURES (across 100 projects) --");
  if (!s.viewTrouble.length) L.push("  (none — every view rendered cleanly in every project)");
  for (const v of s.viewTrouble.slice(0, 20)) {
    L.push(`  ${v.view.padEnd(28)} errs=${v.errors} unrendered=${v.unrendered}/${v.projects} (${v.pct}%)`);
  }

  L.push("");
  L.push("-- CROSS-MODULE FEATURE MATRIX (ok / fail across projects) --");
  for (const [k, v] of Object.entries(s.crossModule).sort((a, b) => b[1].fail - a[1].fail)) {
    L.push(`  ${k.padEnd(20)} ok=${v.ok} fail=${v.fail}`);
    for (const sm of v.samples) L.push(`      e.g. ${sm.project}: ${sm.val}`);
  }

  L.push("");
  L.push("-- REGISTER SEEDING (wanted vs added across projects) --");
  for (const [reg, r] of Object.entries(s.registersSeeded).sort((a, b) => b[1].failed - a[1].failed)) {
    const flag = r.failed > 0 ? "  <-- FAILURES" : "";
    L.push(`  ${reg.padEnd(18)} ${r.added}/${r.wanted} rows across ${r.projects} projects${flag}`);
  }

  if (s.registerFailures.length) {
    L.push("");
    L.push("-- REGISTER FAILURES --");
    for (const rf of s.registerFailures.slice(0, 20)) L.push(`  ${rf.project}: ${rf.reg} lost ${rf.failed} rows`);
  }

  L.push("");
  L.push("-- NOTABLE FINDINGS (first 15) --");
  if (!s.findings.length) L.push("  (none)");
  for (const f of s.findings.slice(0, 15)) {
    L.push(`  [${f.project}] ${f.finding}`);
  }

  if (s.createdFailed.length) {
    L.push("");
    L.push("-- PROJECTS NOT CREATED --");
    for (const cf of s.createdFailed.slice(0, 10)) L.push(`  ${cf.slug}: ${cf.error || "created=false"}`);
  }
  L.push("=".repeat(72));
  return L.join("\n");
}

const reports = loadReports();
const s = summarize(reports);
const text = renderText(s);
console.log(text);
if (OUT_JSON) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(s, null, 2));
  console.log(`\nJSON written to ${OUT_JSON}`);
}
