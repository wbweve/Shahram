/*
  run-100-real.cjs — fresh deep-walk of all 100 REAL projects (projects-real.cjs)
  through the CURRENT app, using 4 isolated servers + 4 workers in parallel.

  Each worker gets its own server (port 19001..19004) with its own throwaway
  data dir under os.tmpdir(), so the real server (8001) and server-data are
  never touched. Evidence is written to evidence/evidence-<worker>/.

  Usage:
    node run-100-real.cjs            # full 100-project run (4 workers × 25)
    DEEPWALK_SPEED=0.2 node run-100-real.cjs   # fast smoke (scales harness sleeps)
    PROJECTS_FILE=./.smoke-projects.cjs RUN_TOTAL=1 node run-100-real.cjs

  Env:
    RUN_TOTAL        — stop after N projects total across workers (default 100)
    WORKERS          — number of parallel workers (default 4)
    DEEPWALK_SPEED   — passed through to lib/deepwalk.cjs (0.05..1, default 1)
    PROJECTS_FILE    — override the project source (default projects-real.cjs)
*/
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const WORKERS = Number(process.env.WORKERS || 4);
const RUN_TOTAL = Number(process.env.RUN_TOTAL || 100);
const PROJECTS_FILE = process.env.PROJECTS_FILE
  ? path.resolve(process.env.PROJECTS_FILE)
  : path.join(__dirname, "projects-real.cjs");
const BASE_PORT = 19001;
const ROOT = __dirname;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "deepwalk-fresh-"));
const EVIDENCE_DIRS = process.env.EVIDENCE_DIRS ? process.env.EVIDENCE_DIRS.split(",") : null;

const allProjects = require(PROJECTS_FILE);
// RUN_TOTAL limits the whole run (across workers), for quick smokes.
const projects = RUN_TOTAL < allProjects.length ? allProjects.slice(0, RUN_TOTAL) : allProjects;
const perWorker = Math.ceil(projects.length / WORKERS);

function out(s) {
  console.log(`[${new Date().toISOString()}] ${s}`);
}

function waitHealth(port, tries = 40) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      const req = require("http").get(`http://127.0.0.1:${port}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) return resolve(Date.now() - t0);
        retry();
      });
      req.on("error", retry);
      req.setTimeout(1500, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (Date.now() - t0 > tries * 1500) return reject(new Error(`server :${port} not healthy`));
      setTimeout(tick, 400);
    };
    tick();
  });
}

async function bootServers() {
  const servers = [];
  for (let w = 0; w < WORKERS; w++) {
    const dataDir = path.join(TMP, `data-${w}`);
    fs.mkdirSync(dataDir, { recursive: true });
    const port = BASE_PORT + w;
    const child = spawn(process.execPath, ["server.js"], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(port), LEADERSHIP_DATA_DIR: dataDir, LEADERSHIP_ALLOW_UNAUTHENTICATED_LOCAL: "true" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    child.stdout.on("data", (d) => process.env.VERBOSE && out(`[srv${w}] ${String(d).trim()}`));
    child.stderr.on("data", (d) => process.env.VERBOSE && out(`[srv${w}] ${String(d).trim()}`));
    const ms = await waitHealth(port);
    out(`server :${port} healthy in ${ms}ms (data ${dataDir})`);
    servers.push(child);
  }
  return servers;
}

function runWorker(w) {
  const port = BASE_PORT + w;
  return new Promise((resolve) => {
    const args = ["worker-real.cjs"];
    const env = {
      ...process.env,
      WORKER_ID: String(w),
      WORKER_TOTAL: String(WORKERS),
      PORT: String(port),
      PROJECTS_FILE,
      DEEPWALK_SPEED: process.env.DEEPWALK_SPEED || "1",
      DEEPWALK_LIGHT: process.env.DEEPWALK_LIGHT || "",
      DEEPWALK_BROWSER_PROJECT: process.env.DEEPWALK_BROWSER_PROJECT || "1"
    };
    const child = spawn(process.execPath, args, { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"] });
    const logPath = path.join(TMP, `worker-${w}.log`);
    const stream = fs.createWriteStream(logPath);
    child.stdout.pipe(stream);
    child.stderr.pipe(stream);
    child.stdout.on("data", (d) => out(`[w${w}] ${String(d).trim()}`));
    child.on("exit", (code) => resolve({ w, code, log: logPath }));
  });
}

async function main() {
  out(`DEEPWALK FRESH RUN — ${projects.length} real projects, ${WORKERS} workers (${perWorker} each), tmp=${TMP}`);
  const servers = await bootServers();
  try {
    const started = Date.now();
    const results = await Promise.all(Array.from({ length: WORKERS }, (_, w) => runWorker(w)));
    const elapsedMin = Math.round((Date.now() - started) / 60000);
    out(`all ${WORKERS} workers finished in ${elapsedMin} min`);
    for (const r of results) out(`worker ${r.w} exit=${r.code} log=${r.log}`);
    // quick aggregate. Reports are counted only when a complete report exists.
    let reports = 0, created = 0, views = 0, errors = 0, buttons = 0;
    const expected = projects.length;
    const completedProjects = new Set();
    for (let w = 0; w < WORKERS; w++) {
      const dir = EVIDENCE_DIRS && EVIDENCE_DIRS[w] ? path.resolve(EVIDENCE_DIRS[w]) : path.join(ROOT, "evidence", `evidence-${w}`);
      if (!fs.existsSync(dir)) continue;
      for (const proj of fs.readdirSync(dir)) {
        const f = path.join(dir, proj, "report.json");
        if (!fs.existsSync(f)) continue;
        reports++;
        const ev = JSON.parse(fs.readFileSync(f, "utf8"));
        completedProjects.add(ev.project || proj);
        if (ev.created) created++;
        views += (ev.views || []).length;
        buttons += ev.buttonsPressed || 0;
        errors += (ev.consoleErrors || []).length + (ev.views || []).reduce((a, v) => a + (v.errors || 0), 0);
      }
    }
    const incomplete = projects.filter(p => !completedProjects.has(p.name)).map(p => p.name);
    out(`AGGREGATE: expected=${expected} reports=${reports} created=${created} views=${views} buttons=${buttons} errors=${errors} incomplete=${incomplete.length}`);
    if (incomplete.length) out(`INCOMPLETE PROJECTS: ${incomplete.join(" | ")}`);
  } finally {
    for (const s of servers) s.kill();
    out("servers stopped");
  }
  process.exit(0);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
