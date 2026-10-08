/*
  worker-real.cjs — one worker.
  Usage:
    WORKER_ID=0 WORKER_TOTAL=4 PORT=19001 node worker-real.cjs
  Each worker takes an even slice of the 100 real projects and deep-walks each
  through the real browser UI against its own isolated server (own port + data
  dir), writing evidence/evidence-<id>/<slug>/ per project.
*/
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");
const projects = process.env.PROJECTS_FILE
  ? require(path.resolve(process.env.PROJECTS_FILE))
  : require("./projects-real.cjs");
const { walkProject, slugify } = require("./lib/deepwalk.cjs");

const WORKER_ID = Number(process.env.WORKER_ID || 0);
const WORKER_TOTAL = Number(process.env.WORKER_TOTAL || 1);
const PORT = Number(process.env.PORT || 18998);
const BASE = `http://127.0.0.1:${PORT}`;
const EV_ROOT = path.join(process.cwd(), "evidence", `evidence-${WORKER_ID}`);

function sliceProjects(all, id, total) {
  const per = Math.ceil(all.length / total);
  return all.slice(id * per, (id + 1) * per);
}

async function getViewIds(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("nav a[data-view]")).map((a) => a.dataset.view);
  });
}

(async () => {
  fs.mkdirSync(EV_ROOT, { recursive: true });
  const mine = sliceProjects(projects, WORKER_ID, WORKER_TOTAL);
  console.log(`[worker ${WORKER_ID}] will deep-walk ${mine.length} projects -> ${mine.map((p) => p.name).join(" | ")}`);

  const browser = await chromium.launch({ headless: true, args: ["--disable-dev-shm-usage", "--js-flags=--max-old-space-size=2048"] });
  let page = await browser.newPage();
  page.setDefaultTimeout(30000);
  page.on("pageerror", () => {});
  await page.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 30000 });
  await page.waitForTimeout(500);

  const viewIds = await getViewIds(page);
  console.log(`[worker ${WORKER_ID}] discovered ${viewIds.length} navigation views`);

  const summary = [];
  for (let i = 0; i < mine.length; i++) {
    const project = mine[i];
    const slug = slugify(project.name);
    const evidenceDir = path.join(EV_ROOT, `${String(i).padStart(2, "0")}-${slug}`);
    fs.mkdirSync(evidenceDir, { recursive: true });
    const checkpoint = path.join(evidenceDir, "report.json");
    if (fs.existsSync(checkpoint)) {
      try {
        const prior = JSON.parse(fs.readFileSync(checkpoint, "utf8"));
        if (prior.project === project.name && prior.views && prior.views.length > 0 && prior.finishedAt) {
          console.log(`[worker ${WORKER_ID}] SKIP ${project.name} (complete checkpoint)`);
          summary.push({ name: project.name, skipped: true, views: prior.views.length, errs: (prior.consoleErrors || []).length });
          continue;
        }
      } catch (_) {}
    }
    const t0 = Date.now();
    try {
      const ev = await walkProject({ page, project, evidenceDir, viewIds });
      fs.writeFileSync(path.join(evidenceDir, "report.json"), JSON.stringify(ev, null, 2));
      const secs = Math.round((Date.now() - t0) / 1000);
      const errs = ev.views.reduce((a, v) => a + v.errors, 0) + ev.consoleErrors.length;
      const pressed = ev.buttonsPressed;
      console.log(`[worker ${WORKER_ID}] DONE ${project.name} in ${secs}s | views=${ev.views.length} buttons=${pressed} errs=${errs} created=${!!ev.created}`);
      summary.push({ name: project.name, secs, errs, pressed, created: !!ev.created, views: ev.views.length });
    } catch (e) {
      const error = e && e.message ? e.message.split("\n")[0] : String(e);
      console.log(`[worker ${WORKER_ID}] FAIL ${project.name}: ${error}`);
      fs.writeFileSync(path.join(evidenceDir, "failure.json"), JSON.stringify({ project: project.name, error, stack: e && e.stack, phase: "walkProject" }, null, 2));
      summary.push({ name: project.name, error });
    }
    // fresh page per project to avoid cross-project DOM/memory bleed
    try { await page.close(); } catch (_) {}
    const fresh = await browser.newPage();
    fresh.setDefaultTimeout(30000);
    await fresh.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));
    await fresh.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await fresh.waitForSelector("#content", { timeout: 30000 });
    await fresh.waitForTimeout(300);
    // rebind page for next iteration (walkProject adds its own listeners)
    page = fresh;
  }
  fs.writeFileSync(path.join(EV_ROOT, "summary.json"), JSON.stringify(summary, null, 2));
  await browser.close();
  console.log(`[worker ${WORKER_ID}] complete. evidence in ${EV_ROOT}`);
  process.exit(0);
})().catch((e) => { console.error("[worker]", WORKER_ID, "FATAL", e); process.exit(1); });