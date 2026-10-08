/* visual-verify-personale-grundlag.cjs
 * Boots the real server in-process, then walks the new "Personaleledelse
 * Grundlag (DK)" view: ledelsesgrundlag create → varedeklaration,
 * forventningsdialog, uddannelsesplan, aktivitet → gennemfør. Captures
 * screenshots (EN + DA) and console errors.
 *
 * Run: node visual-verify-personale-grundlag.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8111";
const BASE = "http://127.0.0.1:" + PORT;

// Isolated data dir BEFORE requiring the server so nothing touches real data.
const dataDir = path.join(os.tmpdir(), "lgd-visual-" + Date.now());
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
  const email = "grundlag-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  const promoted = await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  check(promoted.status === 200, "role promoted to admin (status " + promoted.status + ")");
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  const proj = await api(page, "POST", "/api/projects", { name: "Grundlag Visual", lead: leadId }, token);
  check(proj.status === 201, "project created (status " + proj.status + ")");

  // ── Inject the session and reload ─────────────────────────────────────────
  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  await page.waitForTimeout(800);

  // ── Navigate to the new view ──────────────────────────────────────────────
  await page.evaluate(() => {
    document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("personaleGrundlag");
  });
  await page.waitForTimeout(800);

  check(await page.locator("#grundlagKpis").count() === 1, "view renders: KPI grid present");
  check(await page.locator("#lgdCreate").count() === 1, "view renders: grundlag form present");
  check(await page.locator("#kmpPlanCreate").count() === 1, "view renders: uddannelsesplan form present");
  const serverCell = await page.locator("#grundlagKpis").textContent();
  check(!/Server ikke tilgængelig|Server unavailable/.test(serverCell), "reports load from the server (no unavailable banner)");

  // ── Create a ledelsesgrundlag → varedeklaration ───────────────────────────
  await page.fill("#lgdLeder", "Shahram");
  await page.fill("#lgdOmraade", "Forsyning Drift");
  await page.fill("#lgdForventninger", "Melder sig hvis der er fejl på anlægget");
  await page.click("#lgdCreate");
  await page.waitForTimeout(700);
  const lgdRow = await page.locator("#lgdRows tr", { hasText: "Shahram" }).first().textContent().catch(() => "");
  check(/udkast/.test(lgdRow), "grundlag row appears with udkast status");
  check(/0\/4/.test(lgdRow), "grundlag row shows 0/4 checks (nothing varedeklareret yet)");

  await page.screenshot({ path: "screenshots/personale-grundlag-en.png", fullPage: true });
  console.log("Captured: personale-grundlag-en.png");

  await page.locator("#lgdRows [data-lgd-declare]").first().click();
  await page.waitForTimeout(700);
  const lgdRow2 = await page.locator("#lgdRows tr", { hasText: "Shahram" }).first().textContent().catch(() => "");
  check(/varedeklareret/.test(lgdRow2), "Varedeklarer action flips status to varedeklareret");

  // ── Forventningsdialog ────────────────────────────────────────────────────
  await page.fill("#lgdDlgMed", "Karim");
  await page.selectOption("#lgdDlgOutcome", "opfoelgning");
  await page.fill("#lgdDlgPunkter", "Ved ikke hvad retningen er");
  await page.click("#lgdDlgCreate");
  await page.waitForTimeout(700);
  check(await page.locator("#lgdDlgRows tr", { hasText: "Karim" }).count() === 1, "forventningsdialog row registered");

  // ── Uddannelsesplan + aktivitet → gennemfør ───────────────────────────────
  await page.fill("#kmpMed", "Karim");
  await page.fill("#kmpMaal", "Skære oplæringstid for nye teknikere");
  await page.click("#kmpPlanCreate");
  await page.waitForTimeout(700);
  const planRow = await page.locator("#kmpPlanRows tr", { hasText: "Karim" }).first().textContent().catch(() => "");
  check(/✓/.test(planRow), "uddannelsesplan row shows klar (overenskomst + MUS checks seeded)");

  await page.fill("#kmpAktMed", "Karim");
  await page.selectOption("#kmpAktType", "mentorordning");
  await page.fill("#kmpAktTitel", "Mentor den nye driftstekniker");
  await page.click("#kmpAktCreate");
  await page.waitForTimeout(700);
  check(await page.locator("#kmpAktRows tr", { hasText: "Mentor den nye" }).count() === 1, "mentorordning activity row registered");

  await page.locator("#kmpAktRows [data-kmp-done]").first().click();
  await page.waitForTimeout(700);
  const aktRow = await page.locator("#kmpAktRows tr", { hasText: "Mentor den nye" }).first().textContent().catch(() => "");
  check(/gennemfoert/.test(aktRow), "Gennemfør action flips activity to gennemfoert");

  // ── KPIs updated ──────────────────────────────────────────────────────────
  const kpis = await page.locator("#grundlagKpis").textContent();
  check(/1/.test(kpis), "KPIs show the declared foundation count");

  // ── Danish localization pass ──────────────────────────────────────────────
  await page.evaluate(() => { window.LCStore.setLang("da"); });
  await page.waitForTimeout(600);
  const titleDa = await page.locator(".section-title").first().textContent();
  check(/Personaleledelse Grundlag/.test(titleDa), "Danish title renders: " + titleDa.trim());
  await page.evaluate(() => { if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("personaleGrundlag"); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "screenshots/personale-grundlag-da.png", fullPage: true });
  console.log("Captured: personale-grundlag-da.png");

  // ── Console errors ────────────────────────────────────────────────────────
  const realErrors = consoleErrors.filter(e => !/favicon|sourcemap|DevTools/i.test(e));
  check(realErrors.length === 0, "no console errors" + (realErrors.length ? " — got: " + realErrors.slice(0, 3).join(" | ") : ""));

  await browser.close();
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log(failures === 0 ? "VISUAL VERIFY: ALL PASSED" : "VISUAL VERIFY: " + failures + " FAILURE(S)");
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
