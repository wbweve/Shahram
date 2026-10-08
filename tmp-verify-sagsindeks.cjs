/* tmp-verify-sagsindeks.cjs — Round 61's real-interface proof.
 * A qualification deviation seeded through the REAL PATCH routes lands in the
 * Sagsindeks automatically (door 4 on app open / case-index open), named by
 * its own description, ABOUT the system its protocol qualifies (resolved from
 * its own recorded link), with the bilingual vocabulary the leader reads.
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = "8127"; // fixed: the ambient PORT env may be "0"
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "sagsindeks-visual-" + Date.now());
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

  const email = "sagsindeks-visual@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(!!token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Sagsindeks Visual", lead: leadId }, token);

  // Seed the qualification register through its OWN write routes — a protocol
  // (NO case) and a deviation (a case) whose subject resolves from its link.
  const prot = await api(page, "PATCH", "/api/kvalificering/protocols", { items: [{ _id: "qp-vis-1", type: "PQ", system: "Station Gamma", criticality: "process-critical" }] }, token);
  check(prot.status === 200, "the protocol seeds through the real PATCH route (status " + prot.status + ")");
  const dev = await api(page, "PATCH", "/api/kvalificering/deviations", { items: [{ _id: "qd-vis-1", protocolId: "qp-vis-1", severity: "critical", status: "open", description: "Lækage på ventil", action: "Udskift ventil" }] }, token);
  check(dev.status === 200, "the deviation seeds through the real PATCH route (status " + dev.status + ")");

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  // Door 4 runs at app open AND at every case-index open — open the Sagsindeks.
  await page.evaluate(v => { const a = document.querySelector(`#nav a[data-view="${v}"]`); if (a) a.click(); }, "caseIndex");
  await page.waitForSelector("#caseIndexRoot .case-index-card, #caseIndexRoot .empty", { timeout: 15000 });
  await page.waitForTimeout(1200); // let syncServerCases settle into the render

  const card = page.locator(".case-index-card", { hasText: "Lækage på ventil" }).first();
  check(await card.count() > 0, "the qualification deviation is a card in the Sagsindeks — registered automatically");
  const cardText = (await card.count() > 0) ? await card.innerText() : "";
  check(/Lækage på ventil/.test(cardText), "…named by its own description");
  check(/Station Gamma/.test(cardText), "…ABOUT the system its protocol qualifies (resolved from its own recorded link)");
  check(/Åben/.test(cardText), "…with the leader's own language for its status (Åben)");
  check(/Kritisk/.test(cardText), "…and its severity (Kritisk)");

  await page.screenshot({ path: path.join(__dirname, "tmp-sagsindeks.png"), fullPage: false });
  const realErrors = consoleErrors.filter(e => !/favicon|net::ERR/.test(e));
  check(realErrors.length === 0, "zero console errors (" + realErrors.slice(0, 3).join(" | ") + ")");

  await browser.close();
  server.close();
  console.log(failures === 0 ? "\nSAGSINDEKS LIVE PROOF PASSED" : "\nFAILED: " + failures);
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
