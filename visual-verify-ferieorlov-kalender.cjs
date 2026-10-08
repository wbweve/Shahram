/* visual-verify-ferieorlov-kalender.cjs
 * Boots the real server in-process, then walks the new Ferie & Orlov +
 * Ledelseskalender sections of the "Personaleledelse Grundlag (DK)" view:
 * plan a holiday → notice-deadline state, register orlov → compliance badge,
 * load the year-wheel → honest states. Screenshot + zero console errors.
 *
 * Run: node visual-verify-ferieorlov-kalender.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8113";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "fao-visual-" + Date.now());
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

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  const email = "ferie-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Ferie Visual", lead: leadId }, token);

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("personaleGrundlag");
  });
  await page.waitForTimeout(900);

  check(await page.locator("#faoFerieCreate").count() === 1, "view renders: ferieplan form present");
  check(await page.locator("#orlCreate").count() === 1, "view renders: orlov form present");
  check(await page.locator("#kalLoad").count() === 1, "view renders: ledelseskalender button present");

  // ── Plan a holiday period with timely notice ──────────────────────────────
  await page.fill("#faoMed", "Karim");
  await page.selectOption("#faoType", "hovedferie");
  // Hovedferie starting next summer; notice today = timely (3 months ahead).
  const nextSummer = new Date(Date.now() + 200 * 86400000).toISOString().slice(0, 10);
  const nextSummerEnd = new Date(new Date(nextSummer).getTime() + 18 * 86400000).toISOString().slice(0, 10);
  await page.fill("#faoStart", nextSummer);
  await page.fill("#faoSlut", nextSummerEnd);
  await page.click("#faoFerieCreate");
  await page.waitForTimeout(800);
  let ferieRow = await page.locator("#faoFerieRows tr", { hasText: "Karim" }).first().textContent().catch(() => "");
  check(/✓/.test(ferieRow), "timely notice shows ✓ (varsel ok)");

  // ── Register an orlov (barsel) and update its refund deadline ─────────────
  // The UI form registers leaves as ansøgt (the leader marks godkendt/i_orlov
  // in the update flow), so drive the update flow to i_orlov via prompts and
  // assert the honest refund column through the full lifecycle.
  await page.fill("#orlMed", "Bente");
  await page.selectOption("#orlType", "barsel");
  await page.fill("#orlStart", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  await page.locator("#orlLoennet").check();
  await page.click("#orlCreate");
  await page.waitForTimeout(800);
  let orlRow = await page.locator("#orlRows tr", { hasText: "Bente" }).first().textContent().catch(() => "");
  check(/barsel/.test(orlRow) && /ansoegt/.test(orlRow), "orlov row registered (barsel, ansøgt)");
  check(/ikke ansøgt|not applied/i.test(orlRow), "refund not yet applied shows honestly");

  // ── Update the orlov: move to i_orlov + register the refund deadline ──────
  // The handler fires up to three prompts (status / return date / refund);
  // answer them in order: set status, skip return, apply refund date.
  const dialogs = [];
  page.on("dialog", d => { dialogs.push(d.message()); if (dialogs.length === 1) d.accept("i_orlov"); else if (dialogs.length === 2) d.accept(""); else d.accept(new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10)); });
  await page.click("#orlRows [data-orl]");
  await page.waitForTimeout(1200);
  orlRow = await page.locator("#orlRows tr", { hasText: "Bente" }).first().textContent().catch(() => "");
  check(/i_orlov/.test(orlRow), "status advanced to i_orlov via update flow");
  check(/\(\d{4}-\d{2}-\d{2}\)/.test(orlRow), "refund deadline registered (" + orlRow.replace(/\s+/g, " ").slice(0, 60) + "…)");

  // ── Ledelseskalender: what is due this quarter ────────────────────────────
  // Seed a lapsed holiday notice via the API so the calendar shows overdue.
  await api(page, "POST", "/api/ferieorlov/ferie", { medarbejder: "Caspar", type: "hovedferie", startDato: "2026-08-03", slutDato: "2026-08-21" }, token);
  await page.click("#kalLoad");
  await page.waitForTimeout(900);
  const kal = await page.locator("#kalRows").textContent();
  check(/Ferieplan|Holiday plan/.test(kal) && /forfalden|overdue/.test(kal), "calendar shows the ferieplan obligation as overdue (lapsed notice)");
  check(/APV|MUS|Trivsel|Wellbeing|Tavlemøde|Ledelsesgrundlag|Uddannelsesplan|redegørelse|JE-attest/i.test(kal), "calendar lists the register obligations");
  check(/ikke påbegyndt|not started|✓/.test(kal), "calendar states render honestly (no fabricated ok)");

  await page.screenshot({ path: "screenshots/ferieorlov-kalender-da.png", fullPage: true });
  console.log("Captured: ferieorlov-kalender-da.png");

  const realErrors = consoleErrors.filter(e => !/favicon|sourcemap|DevTools/i.test(e));
  check(realErrors.length === 0, "no console errors" + (realErrors.length ? " — got: " + realErrors.slice(0, 3).join(" | ") : ""));

  await browser.close();
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log(failures === 0 ? "VISUAL VERIFY: ALL PASSED" : "VISUAL VERIFY: " + failures + " FAILURE(S)");
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
