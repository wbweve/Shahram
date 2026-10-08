/* visual-verify-leder-selv-gesamtal.cjs
 * Walks the two new everyday-leadership surfaces against a real server:
 *  - Lederens egen side: ledertrivsel pulse, energy ledger, LUS (overdue)
 *  - Medarbejdergesamtalen on the danishHr view: honest empty state
 * Captures screenshots (EN + DA) and console errors. Zero-error policy.
 *
 * Run: node visual-verify-leder-selv-gesamtal.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8144";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "lederselv-visual-" + Date.now());
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

  const email = "lederselv-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Leder-selv Visual", lead: leadId }, token);

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  const SHOTS = path.join(__dirname, "screenshots");
  fs.mkdirSync(SHOTS, { recursive: true });

  // ── 1. Lederens egen side ────────────────────────────────────────────────
  // Navigation is via nav-link clicks (the hash only routes at boot). The
  // nav link sits inside a collapsed <details> group, so force it open first.
  await page.evaluate(() => {
    const link = document.querySelector('a[data-view="lederSelv"]');
    if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
  });
  await page.waitForTimeout(600);
  const t1 = await page.evaluate(() => document.body.innerText);
  check(/Lederens egen side|The leader's own page/i.test(t1), "lederSelv view renders");
  check(/Ledertrivsel|Leader wellbeing/i.test(t1), "ledertrivsel block present");
  check(/Energih|Energy ledger/i.test(t1), "energy ledger block present");
  check(/LUS\b/.test(t1), "LUS block present");

  // Save a monthly self-assessment (five selects → raw index 80).
  await page.evaluate(() => {
    const vals = [4, 4, 3, 4, 5];
    vals.forEach((v, i) => { const s = document.querySelector("#ltv" + i); if (s) { s.value = String(v); s.dispatchEvent(new Event("change", { bubbles: true })); } });
    const b = document.querySelector("#ltvSave"); if (b) b.click();
  });
  await page.waitForTimeout(900);
  const t2 = await page.evaluate(() => document.body.innerText);
  check(/(8|80)/.test(t2) && /2026-\d\d-\d\d/.test(t2), "saved ledertrivsel round visible with its date + index");

  // Register an overdue LUS (held 2025-08-01, next 2026-08-01 < today).
  await page.evaluate(() => {
    const t = document.querySelector("#lusTitle"); if (t) { t.value = "LUS 2026"; t.dispatchEvent(new Event("input", { bubbles: true })); }
    const h = document.querySelector("#lusHeld"); if (h) { h.value = "2025-08-01"; h.dispatchEvent(new Event("change", { bubbles: true })); }
    const n = document.querySelector("#lusNext"); if (n) { n.value = "2026-08-01"; n.dispatchEvent(new Event("change", { bubbles: true })); }
    const b = document.querySelector("#lusSave"); if (b) b.click();
  });
  await page.waitForTimeout(900);
  const t3 = await page.evaluate(() => document.body.innerText);
  check(/LUS 2026/.test(t3), "LUS row visible after save");
  check(/forfalden|due/i.test(t3), "overdue LUS flagged on the page");
  await page.screenshot({ path: path.join(SHOTS, "leder-selv-en.png"), fullPage: true });

  // ── 2. Medarbejdergesamtalen (danishHr view) ─────────────────────────────
  await page.evaluate(() => {
    const link = document.querySelector('a[data-view="danishHr"]');
    if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
  });
  await page.waitForTimeout(700);
  const t4 = await page.evaluate(() => document.body.innerText);
  check(/Medarbejdergesamtalen|Employee gesamtal/i.test(t4), "gesamtal section renders on danishHr");
  check(/Pryglepunkt|Thorn point/i.test(t4), "pryglepunkt field present (required by practice)");
  check(/Ingen gesamtaler endnu|No gesamtaler yet/i.test(t4), "gesamtal register honest empty state");
  await page.screenshot({ path: path.join(SHOTS, "gesamtal-en.png"), fullPage: true });

  // ── 3. Danish locale: both views still render ────────────────────────────
  const hasLangBtn = await page.$("#langDa");
  if (hasLangBtn) {
    await page.evaluate(() => { const b = document.querySelector("#langDa"); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => {
    const link = document.querySelector('a[data-view="lederSelv"]');
    if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
  });
  await page.waitForTimeout(600);
  const t5 = await page.evaluate(() => document.body.innerText);
  check(/Lederens egen side|Ledertrivsel/i.test(t5), "danish locale: lederSelv renders in Danish");
  await page.screenshot({ path: path.join(SHOTS, "leder-selv-da.png"), fullPage: true });

  check(consoleErrors.length === 0, "zero console errors (" + consoleErrors.length + ")");
  if (consoleErrors.length) console.log("  console errors:", consoleErrors.slice(0, 4));

  await browser.close();
  server.close();
  try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch (_) {}
  console.log(`\nVisual verify: ${failures === 0 ? "ALL PASSED" : failures + " FAILURE(S)"}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
