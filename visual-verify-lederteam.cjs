/* visual-verify-lederteam.cjs
 * Walks the Lederens team-panel view and the anonymous team-pulse sweep
 * against a real server: seeded conflict + 1:1 + MUS + style → per-member
 * panels with actions; pulse sweep saved → trend renders. Screenshot +
 * zero console errors.
 *
 * Run: node visual-verify-lederteam.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8117";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "lederteam-visual-" + Date.now());
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

  const email = "lederteam-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Team-panel Visual", lead: leadId }, token);

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  await page.waitForTimeout(800);

  // Seed registers: roster, 1:1s (one fresh, one stale), a held-but-old MUS,
  // one open conflict, one completed task, one persisted style assessment.
  const ws = await api(page, "GET", "/api/workspace", undefined, token);
  const workspace = ws.body && ws.body.workspace;
  const activeId = workspace.activeId || Object.keys(workspace.projects || {})[0];
  const project = workspace.projects[activeId];
  project.registers = project.registers || {};
  project.roster = [{ name: "Anne Lauridsen" }, { name: "Bo Holm" }, { name: "Carl Skov" }];
  project.registers.oneonones = [
    { _id: "oo-1", person: "Bo Holm", date: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10) },
    { _id: "oo-2", person: "Carl Skov", date: "2026-05-01" }
  ];
  project.registers.conflicts = [{
    _id: "cnf-vt-1", issue: "Rolleforvirring i vagtplanen", partyA: "Anne Lauridsen", partyB: "Bo Holm",
    parties: ["Anne Lauridsen", "Bo Holm"], intensity: 2, glaslStage: 2, status: "Open", opened: "2026-09-01"
  }];
  const put = await api(page, "PUT", "/api/workspace", workspace, token);
  check(put.status === 200 || put.status === 204, "workspace PUT persisted roster + registers");
  await api(page, "POST", "/api/danish-hr/situationsbestemt/save", { employeeId: "Anne Lauridsen", competence: 3, motivation: 8, note: "Skarp på fag, usikker på nye opgaver" }, token);
  // Anne's MUS: held 2025-02-01 → stale by now.
  await api(page, "POST", "/api/danish-hr/mus", { format: "MUS", employeeId: "Anne Lauridsen", status: "AFHOLDT", heldDate: "2025-02-01", aftaler: [] }, token);

  const nav = async (view) => {
    await page.evaluate(v => {
      document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
      if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate(v);
    }, view);
    await page.waitForTimeout(700);
  };

  // ── 1. Lederens team-panel ─────────────────────────────────────────────────
  await page.evaluate(() => window.LCStore.loadRemoteWorkspace());
  await nav("lederteam");
  const panelText = await page.locator("#content").textContent();
  check(/Lederens team-panel|Leader's team panel/.test(panelText), "view renders with title");
  check(/Anne Lauridsen/.test(panelText) && /Bo Holm/.test(panelText) && /Carl Skov/.test(panelText), "all three members have panels");
  // NOTE: the page defaults to English, so every check must accept both locales.
  check(/KONFLIKT|CONFLICT/.test(panelText), "Anne + Bo flagged with the conflict state");
  check(/Coachende \(S2\)|Coaching \(S2\)/.test(panelText), "Anne's persisted style (coachende S2) renders");
  check(/staldet|stale/i.test(panelText), "Anne's stale MUS (>12 months) is named");
  check(/book en ny|book a new/i.test(panelText), "overdue 1:1 action present (Carl)");
  await page.screenshot({ path: "screenshots/lederteam-da.png", fullPage: true });

  // ── 2. Anonymous team-pulse on the psychSafety view ────────────────────────
  await nav("psychSafety");
  const psText = await page.locator("#content").textContent();
  check(/team-puls|team pulse/i.test(psText), "pulse block renders on the safety view");
  await page.fill("#tpTeam", "Morgenvagt");
  await page.fill("#tpScores", "7, 8, 6, 9, 5, 8");
  await page.click("#tpSave");
  await page.waitForTimeout(1400);
  const psAfter = await page.locator("#content").textContent();
  check(/Historik|History/i.test(psAfter) && /202\d-\d\d-\d\d/.test(psAfter), "sweep saved and history renders");
  await page.fill("#tpScores", "4, 3, 5, 4, 3, 4");
  await page.click("#tpSave");
  await page.waitForTimeout(1400);
  const psAfter2 = await page.locator("#content").textContent();
  check(/Trend|trend/.test(psAfter2), "second sweep renders the trend line");
  await page.screenshot({ path: "screenshots/lederteam-pulse-da.png", fullPage: true });

  // ── 3. The briefing now carries the pulse + cadence sections ───────────────
  await page.evaluate(() => window.LCStore.loadRemoteWorkspace());
  await nav("ugebriefing");
  await page.waitForTimeout(900);
  const briefText = await page.locator("#ugebriefingBody").textContent().catch(() => "");
  check(/Team-puls|Team pulse/.test(briefText), "briefing includes the team-pulse watch section");
  check(/Samtale-rytme|Conversation cadence/.test(briefText), "briefing includes the 1:1 cadence section");

  const realErrors = consoleErrors.filter(e => !/favicon|sourcemap|DevTools/i.test(e));
  check(realErrors.length === 0, "no console errors" + (realErrors.length ? " — got: " + realErrors.slice(0, 3).join(" | ") : ""));

  await browser.close();
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });

  console.log(failures === 0 ? "\nALL VISUAL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
