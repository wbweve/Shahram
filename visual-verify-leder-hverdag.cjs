/* visual-verify-leder-hverdag.cjs
 * Walks the three new everyday-leadership views against a real server:
 * 1. Konflikt-mæglingsguiden (conflict view) — seeded conflict renders a
 *    guided case card with triage route + NVC draft; "Markér løst" works.
 * 2. Teamudviklingshjulet (tuckman view) — assessed phase card from data.
 * 3. Lederens ugebriefing — aggregated sections incl. the conflict section.
 * Screenshot (EN + DA) + zero console errors.
 *
 * Run: node visual-verify-leder-hverdag.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8116";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "leder-visual-" + Date.now());
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

  const email = "leder-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Leder Visual", lead: leadId }, token);

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  await page.waitForTimeout(800);

  // Seed one escalated conflict into the project's conflicts register.
  const ws = await api(page, "GET", "/api/workspace", undefined, token);
  const workspace = ws.body && ws.body.workspace;
  const activeId = workspace.activeId || Object.keys(workspace.projects || {})[0];
  const project = workspace.projects[activeId];
  project.registers = project.registers || {};
  project.registers.conflicts = [{
    _id: "cnf-visual-1", issue: "Roller og ansvar i teamet", partyA: "Anne", partyB: "Bo",
    parties: ["Anne", "Bo"], intensity: 4, glaslStage: 4, status: "Open", opened: "2026-09-01"
  }];
  project.registers.tasks = project.registers.tasks || [];
  project.registers.tasks.push({ _id: "tsk-visual-1", title: "Uge rapport", status: "Done", completedAt: new Date().toISOString() });
  const put = await api(page, "PUT", "/api/workspace", workspace, token);
  check(put.status === 200 || put.status === 204, "workspace PUT persisted the seeded conflict + win");
  // The browser store hydrated at page load — pull the freshly seeded rows in.
  await page.evaluate(() => window.LCStore.loadRemoteWorkspace());
  await page.waitForTimeout(400);

  const nav = async (view) => {
    await page.evaluate(v => {
      document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
      if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate(v);
    }, view);
    await page.waitForTimeout(700);
  };

  // ── 1. Konflikt-mæglingsguiden ─────────────────────────────────────────────
  await nav("conflict");
  const guideCard = await page.locator("#content .info-card", { hasText: "Roller og ansvar" }).first().textContent().catch(() => "");
  check(/Roller og ansvar/.test(guideCard), "guide renders the seeded case");
  check(/Udenforstående mægler|External mediator/.test(guideCard), "Glasl 4 routes to the external-mediator gate");
  check(/NVC/i.test(guideCard) && /Gør nu|Do now/.test(guideCard), "case card carries NVC draft + a do-now action");
  check(await page.locator("[data-conflict-resolve]").count() === 1, "resolve button present on the open case");
  await page.click("[data-conflict-resolve]");
  await page.waitForTimeout(600);
  check(await page.locator("[data-conflict-resolve]").count() === 0, "marking resolved removes the case from the action list");

  // ── 2. Teamudviklingshjulet ────────────────────────────────────────────────
  await api(page, "PUT", "/api/workspace", (() => {
    // restore the conflict to Open so the phase classifies honestly
    const p2 = JSON.parse(JSON.stringify(workspace));
    p2.projects[activeId].registers.conflicts[0].status = "Open";
    return p2;
  })(), token);
  await page.evaluate(() => window.LCStore.loadRemoteWorkspace());
  await nav("tuckman");
  const wheelCard = await page.locator("#content .info-card", { hasText: /Teamudviklingshjulet|Team development wheel/ }).first().textContent().catch(() => "");
  check(/storming/i.test(wheelCard), "wheel assesses the phase from live data (storming)");
  check(/Hvad lederen gør nu|What the leader does now/i.test(wheelCard), "phase-appropriate leader actions render");

  // ── 3. Lederens ugebriefing ────────────────────────────────────────────────
  await nav("ugebriefing");
  const brief = await page.locator("#ugebriefingBody").textContent().catch(() => "");
  check(/W\d+/.test(brief) || /2026-W/.test(await page.locator("#content").textContent()), "briefing names the ISO week");
  check(/Konflikter der venter|Conflicts waiting/.test(brief), "briefing includes the conflict section from the register");
  check(/Anerkend denne uge|Recognise this week/.test(brief), "briefing includes the recognition section from completed tasks");
  check(/HANDLING NU|ACT NOW/.test(brief), "priority labels render");
  await page.screenshot({ path: "screenshots/leder-hverdag-en.png", fullPage: true });

  // ── Danish pass ────────────────────────────────────────────────────────────
  await page.evaluate(() => { if (window.I18n) window.I18n.setLanguage("da"); });
  await nav("ugebriefing");
  await page.waitForTimeout(600);
  const briefDa = await page.locator("#ugebriefingBody").textContent().catch(() => "");
  check(/uge|Uge|W\d+/.test(briefDa), "Danish briefing renders");
  await page.screenshot({ path: "screenshots/leder-hverdag-da.png", fullPage: true });
  console.log("Captured: leder-hverdag-en.png + leder-hverdag-da.png");

  const realErrors = consoleErrors.filter(e => !/favicon|sourcemap|DevTools/i.test(e));
  check(realErrors.length === 0, "no console errors" + (realErrors.length ? " — got: " + realErrors.slice(0, 3).join(" | ") : ""));

  await browser.close();
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });

  console.log(failures === 0 ? "\nALL VISUAL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
