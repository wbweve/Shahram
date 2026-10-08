/* tmp-verify-round65.cjs — Round 65's real-interface proof.
 * The governed next action reaches the SWEEP'S ECHO: register rows written
 * through the real workspace funnel (PUT /api/workspace — a write where no
 * browser event can fire) become cases, and the zero-input Today card says
 * what to DO about them — named with the case, evidence tier + basis date +
 * review flag along — while the Sagsindeks card carries the SAME line for the
 * same case (one derivation, many lenses). Honest silence is proven too: the
 * unmapped register class is never named as advice. English surface speaks
 * English; zero console errors.
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = "8136";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "round65-visual-" + Date.now());
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
  const check = (cond, msg) => { console.log((cond ? "  \u2713 " : "  \u2717 ") + msg); if (!cond) failures++; };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1360, height: 950 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push("pageerror: " + e.message));
  await page.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  const email = "round65@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(!!token, "login returned a session token");

  // Rows written where no browser event can fire: the real workspace funnel
  // (projects and their registers live in the workspace blob itself).
  const ws = await api(page, "GET", "/api/workspace", undefined, token);
  const doc = (ws.body && ws.body.workspace) || {};
  doc.projects = doc.projects || {};
  const projectId = Object.keys(doc.projects)[0] || "p-round65";
  const project = doc.projects[projectId] || (doc.projects[projectId] = { _id: projectId, name: "Round 65 Sweep", lead: leadId });
  check(!!project, "the workspace holds the project");
  project.registers = project.registers || {};
  project.registers.risks = [
    { _id: "sw1", description: "Lejest\u00f8j p\u00e5 linje 3", severity: "critical", status: "Open", created: "2026-08-01" }
  ];
  project.registers.tasks = [
    { _id: "sw2", description: "Opgave uden dag", severity: "high", status: "Open" }
  ];
  project.registers.bom = [
    { _id: "sw3", description: "Ukortlagt register", severity: "critical", status: "Open", created: "2026-09-01" }
  ];
  const put = await api(page, "PUT", "/api/workspace", doc, token);
  check(put.status === 200, "the rows land through the real write funnel (PUT /api/workspace, " + put.status + ")" + (put.status === 200 ? "" : " — " + JSON.stringify(put.body).slice(0, 200)));

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  // The app's OWN pull after login (js/store.js loadRemoteWorkspace) — the
  // workspace the server now holds is adopted, and door 5 sweeps it.
  const pulled = await page.evaluate(() => window.LCStore.loadRemoteWorkspace());
  check(pulled === true, "the store pulls the server workspace (the app's own funnel)");

  // 1. The TODAY card — the zero-input surface — carries the governed line.
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="today"]'); if (a) a.click(); });
  await page.waitForSelector("#todayCockpitHost .card", { timeout: 20000 });
  await page.waitForTimeout(800);
  const todayText = await page.locator("#todayCockpitHost").innerText();
  check(/De fejede sager/.test(todayText), "Today raises the swept cases unasked");
  const todayLine = (todayText.match(/N\u00e6ste handling p\u00e5 [^\n]*/) || [null])[0];
  check(todayLine !== null, "the card says what to DO: " + String(todayLine).slice(0, 130));
  check(todayLine !== null && /p\u00e5 "Lejest\u00f8j p\u00e5 linje 3"/.test(todayLine), "…NAMED with the case it speaks for");
  check(todayLine !== null && /Evidens: /.test(todayLine) && /pr\. \d{4}-\d{2}-\d{2}/.test(todayLine),
    "…with the evidence tier AND the date its basis was last read");
  check(todayLine !== null && /Menneskelig vurdering p\u00e5kr\u00e6vet/.test(todayLine), "…and the human-review flag");
  check(todayLine !== null && !/Ukortlagt register/.test(todayText), "the unmapped register class is never named as advice");
  await page.screenshot({ path: path.join(__dirname, "tmp-round65-today.png"), fullPage: false });

  // 2. Parity: the Sagsindeks card for the SAME swept case carries the SAME
  //    line (one derivation, many lenses).
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="caseIndex"]'); if (a) a.click(); });
  await page.waitForSelector("#caseIndexRoot .case-index-card", { timeout: 20000 });
  await page.waitForTimeout(600);
  const diag = await page.evaluate(() => ({
    cardKeys: Array.from(document.querySelectorAll(".case-index-card")).map(c => c.getAttribute("data-case-key")),
    allKeys: (window.LCCaseIndexUI.allCases() || []).map(c => c.key),
    wsRows: (window.LCStore.localRegisterRows ? window.LCStore.localRegisterRows() : []).map(r => r.regId + ":" + r.rowId)
  }));
  console.log("  [index diag] " + JSON.stringify(diag).slice(0, 700));
  const parity = await page.evaluate(() => {
    const card = document.querySelector('.case-index-card[data-case-key="register:risks:sw1"]');
    const line = card ? card.querySelector(".case-index-knowledge-line") : null;
    return { found: !!card, line: line ? line.textContent : null };
  });
  check(parity.found, "the swept row is a case in the Sagsindeks (register:risks:sw1)");
  check(!!parity.line && /^N\u00e6ste handling: /.test(parity.line), "…and its card carries the next action: " + String(parity.line).slice(0, 110));
  const cardBody = parity.line ? parity.line.replace(/^N\u00e6ste handling: /, "") : "";
  console.log("  [parity diag] cardBody=" + JSON.stringify(cardBody).slice(0, 400));
  console.log("  [parity diag] todayLine=" + JSON.stringify(todayLine).slice(0, 500));
  check(cardBody.length > 0 && todayLine !== null && todayLine.indexOf(cardBody) >= 0,
    "the Today sentence IS the card's line — one derivation, many lenses");
  await page.screenshot({ path: path.join(__dirname, "tmp-round65-sagsindeks.png"), fullPage: false });

  // 3. The English surface speaks English. The server composes the cockpit
  //    in the WORKSPACE's language (ws.settings.language), so the switch rides
  //    the store's own sync — flush it and let it land before the fetch.
  await page.evaluate(async () => {
    window.LCStore.setLang("en");
    if (window.LCStore.flushRemoteSync) { try { await window.LCStore.flushRemoteSync(); } catch (_) {} }
    if (window.LCStore.syncWorkspace) { try { await window.LCStore.syncWorkspace(); } catch (_) {} }
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="today"]'); if (a) a.click(); });
  await page.waitForSelector("#todayCockpitHost .card", { timeout: 20000 });
  await page.waitForTimeout(800);
  const enText = await page.locator("#todayCockpitHost").innerText();
  const enLine = (enText.match(/Next action on [^\n]*/) || [null])[0];
  check(enLine !== null, "the English card speaks English: " + String(enLine).slice(0, 130));
  check(enLine !== null && /Evidence: /.test(enLine) && /as of \d{4}-\d{2}-\d{2}/.test(enLine), "…evidence tier and basis date in English");
  check(enLine !== null && !/Evidens|Menneskelig|N\u00e6ste/.test(enText), "…and no Danish prose rides the English surface");
  await page.evaluate(() => window.LCStore.setLang("da"));

  const realErrors = consoleErrors.filter(e => !/favicon|net::ERR/.test(e));
  check(realErrors.length === 0, "zero console errors (" + realErrors.slice(0, 3).join(" | ") + ")");

  await browser.close();
  server.close();
  console.log(failures === 0 ? "\nROUND 65 LIVE PROOF PASSED" : "\nFAILED: " + failures);
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
