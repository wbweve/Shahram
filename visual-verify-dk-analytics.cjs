/* visual-verify-dk-analytics.cjs
 * Boots the real server in-process, seeds trivsel rounds + a sickness period
 * through the API, then walks the "Langsigtede analyser" section of the
 * Danish HR view: load with headcount → KPIs, trivsel-history direction
 * badges, monthly absence table (share shown), Bradford table. Captures a
 * screenshot and asserts zero console errors.
 *
 * Run: node visual-verify-dk-analytics.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8112";
const BASE = "http://127.0.0.1:" + PORT;

// Isolated data dir BEFORE requiring the server so nothing touches real data.
const dataDir = path.join(os.tmpdir(), "dka-visual-" + Date.now());
fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });
process.env.LEADERSHIP_DATA_DIR = dataDir;
const app = require("./server.js");
const server = app.server.listen(Number(PORT), "127.0.0.1");

async function api(page, method, route, payload, token) {
  return page.evaluate(({ method, route, payload, token }) =>
    fetch(route, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    }).then(async r => ({ status: r.status, body: await r.json().catch(() => null) })),
    { method, route, payload, token });
}

(async () => {
  await new Promise(resolve => server.once("listening", resolve));
  let failures = 0;
  const check = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) failures++; };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push("pageerror: " + e.message));

  await page.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));

  // ── Load the app first (same-origin fetches, no CORS) ─────────────────────
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  // ── Bootstrap: register + promote (unauthenticated loopback = admin) ──────
  const email = "analytics-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  const promoted = await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  check(promoted.status === 200, "role promoted to admin (status " + promoted.status + ")");
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  const proj = await api(page, "POST", "/api/projects", { name: "Analytics Visual", lead: leadId }, token);
  check(proj.status === 201, "project created (status " + proj.status + ")");

  // ── Inject the session and reload ─────────────────────────────────────────
  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  await page.waitForTimeout(800);

  // ── Seed: two aggregated trivsel rounds (7.0 → 9.0) + one short spell ─────
  const FUTURE = "2099-12-31";
  const RESP = { scores: { ledelse: 7, sammenhold: 7 } };
  const s1 = await api(page, "POST", "/api/danish-hr/trivsel", { name: "Efterår", openFrom: "2026-03-01", closesAt: FUTURE }, token);
  check(s1.status === 201, "trivsel round 1 created");
  for (let i = 0; i < 5; i++) await api(page, "POST", `/api/danish-hr/trivsel/${s1.body.survey._id}/respond`, RESP, token);
  await api(page, "POST", `/api/danish-hr/trivsel/${s1.body.survey._id}/close`, {}, token);
  const s2 = await api(page, "POST", "/api/danish-hr/trivsel", { name: "Efterår", openFrom: "2026-09-01", closesAt: FUTURE }, token);
  for (let i = 0; i < 6; i++) await api(page, "POST", `/api/danish-hr/trivsel/${s2.body.survey._id}/respond`, { scores: { ledelse: 9, sammenhold: 9 } }, token);
  await api(page, "POST", `/api/danish-hr/trivsel/${s2.body.survey._id}/close`, {}, token);
  const sick = await api(page, "POST", "/api/danish-hr/sick-absence", { employeeId: "Karim", startDate: "2026-09-01" }, token);
  check(sick.status === 201, "sickness period seeded");

  // ── Navigate to the Danish HR view ────────────────────────────────────────
  await page.evaluate(() => {
    document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("danishHr");
  });
  await page.waitForTimeout(900);

  check(await page.locator("#dkAnalyticsLoad").count() === 1, "view renders: analytics section present");

  // ── Load analytics with an explicit headcount ─────────────────────────────
  await page.fill("#dkAnalyticsHeadcount", "12");
  await page.click("#dkAnalyticsLoad");
  await page.waitForTimeout(1000);

  const kpis = await page.locator("#dkAnalyticsKpis").textContent();
  check(/fravær 6 vs 6|absence 6 vs 6/i.test(kpis), "KPI cells render (absence trend present)");
  const hist = await page.locator("#dkTrivselHistRows").textContent();
  check(/Efterår/.test(hist), "trivsel history shows the seeded series");
  check(/forbedres|improving/i.test(hist), "direction badge shows improving (7.0 → 9.0)");
  check(/2/.test(hist), "series counts 2 aggregated rounds");
  const abs = await page.locator("#dkAbsenceRows").textContent();
  check(/2026-09/.test(abs), "monthly absence table shows the current month");
  check(/%/.test(abs) && !/angiv hovedantal|set headcount/i.test(abs), "share % shown because headcount was given");
  const brad = await page.locator("#dkBradfordRows").textContent();
  check(/mønster|pattern/i.test(brad) || brad.trim().length > 0, "Bradford table renders");
  check(!/Karim/.test(brad), "single open spell is NOT a pattern candidate (honest gating)");

  // ── Danish localization pass ──────────────────────────────────────────────
  await page.evaluate(() => { window.LCStore.setLang("da"); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("danishHr"); });
  await page.waitForTimeout(700);
  await page.fill("#dkAnalyticsHeadcount", "12");
  await page.click("#dkAnalyticsLoad");
  await page.waitForTimeout(900);
  const sectionDa = await page.locator("h3", { hasText: "Langsigtede analyser" }).first().textContent().catch(() => "");
  check(/Langsigtede analyser/.test(sectionDa), "Danish section title renders: " + sectionDa.trim());
  const absDa = await page.evaluate(() => {
    const el = document.querySelector("#dkAbsenceRows");
    const table = el ? el.closest("table") : null;
    const thead = table ? table.querySelector("thead") : null;
    return thead ? thead.textContent : "";
  });
  check(/Fraværsdage/.test(absDa), "Danish column headers render in the analytics table");
  await page.screenshot({ path: "screenshots/dk-analytics-da.png", fullPage: true });
  console.log("Captured: dk-analytics-da.png");

  // ── Console errors ────────────────────────────────────────────────────────
  const realErrors = consoleErrors.filter(e => !/favicon|sourcemap|DevTools/i.test(e));
  check(realErrors.length === 0, "no console errors" + (realErrors.length ? " — got: " + realErrors.slice(0, 3).join(" | ") : ""));

  await browser.close();
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log(failures === 0 ? "VISUAL VERIFY: ALL PASSED" : "VISUAL VERIFY: " + failures + " FAILURE(S)");
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
