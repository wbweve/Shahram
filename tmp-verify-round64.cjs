/* tmp-verify-round64.cjs — Round 64's real-interface proof.
 * The governed next action TRAVELS WITH THE CASE: a cluster seeded through
 * the REAL event bus shows (1) its knowledge line on the Sagsindeks CARD,
 * (2) the named line on the DAILY BRIEF's cluster signal, (3) the same line
 * on the MENTOR STRIP — Danish by default, English on the English surface —
 * with the design's accent rail actually applied, and zero console errors.
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = "8134";
const BASE = "http://127.0.0.1:" + PORT;

const dataDir = path.join(os.tmpdir(), "round64-visual-" + Date.now());
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

  const email = "round64@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  check(!!token, "login returned a session token");
  await api(page, "POST", "/api/projects", { name: "Round 64 Travel", lead: leadId }, token);

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  // Seed a cross-module cluster through the REAL event bus (the funnel is the
  // data path): a severe deviation, a CAPA and a risk on one shared subject.
  const seeded = await page.evaluate(() => {
    const bus = window.LCCrossModuleWiring.EventBus;
    bus.emit("deviation.created", { id: "r64d1", title: "Lejest\u00f8j p\u00e5 linje 3", subject: "Pakkelinje 3", severity: "major" }, "capaManager");
    bus.emit("capa.created", { id: "r64c1", title: "Udskift leje", subject: "pakkelinje 3" }, "capaManager");
    bus.emit("case.registered", { kind: "risk", id: "r64r1", title: "Gentagne lejesvigt", subject: "Pakkelinje 3", links: ["capa:r64c1"] }, "riskModule");
    return typeof bus === "object";
  });
  check(seeded, "the cluster seeds through the REAL event bus");

  // 1. The Sagsindeks CARD carries its own next action.
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="caseIndex"]'); if (a) a.click(); });
  await page.waitForSelector("#caseIndexRoot .case-index-card", { timeout: 15000 });
  await page.waitForTimeout(600);
  const card = page.locator(".case-index-card", { hasText: "Lejest\u00f8j p\u00e5 linje 3" }).first();
  check(await card.count() > 0, "the deviation is a card in the Sagsindeks");
  const cardLine = card.locator(".case-index-knowledge-line");
  check(await cardLine.count() === 0 || await cardLine.count() === 1, "…and it carries AT MOST one knowledge line (never a stack)");
  const cardText = await card.innerText();
  const cardHasLine = /N\u00e6ste handling:/.test(cardText);
  check(cardHasLine, "the card states what to DO about the case: " + (cardText.match(/N\u00e6ste handling:[^\n]*/) || ["<none>"])[0].slice(0, 110));
  if (cardHasLine) {
    check(/Evidens: /.test(cardText), "…with the evidence tier riding along");
    check(/pr\. \d{4}-\d{2}-\d{2}/.test(cardText), "…and the date its basis was last read");
    check(/Menneskelig vurdering p\u00e5kr\u00e6vet/.test(cardText), "…and the human-review flag");
    const rail = await cardLine.first().evaluate(el => {
      const s = getComputedStyle(el);
      return { border: s.borderLeftWidth + " " + s.borderLeftColor, visible: el.offsetParent !== null };
    });
    check(rail.visible && parseFloat(rail.border) > 0 && !/rgba\(0, 0, 0, 0\)/.test(rail.border),
      "the design's accent rail is actually applied and the line is visible (" + rail.border + ")");
  }
  await page.screenshot({ path: path.join(__dirname, "tmp-round64-sagsindeks.png"), fullPage: false });

  // 2. The DAILY BRIEF's cluster signal carries the NAMED line.
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="dailyBrief"]'); if (a) a.click(); });
  await page.waitForSelector("#dailyBriefRoot", { timeout: 15000 });
  await page.waitForTimeout(400);
  const briefText = await page.locator("#dailyBriefRoot").innerText();
  check(/Sagsklynge p\u00e5 tv\u00e6rs: Pakkelinje 3/.test(briefText), "the brief raises the cross-module cluster unasked");
  const briefLine = (briefText.match(/N\u00e6ste handling p\u00e5 [^\n]*/) || [null])[0];
  check(briefLine !== null, "the brief's signal carries the governed next action: " + String(briefLine).slice(0, 130));
  check(briefLine !== null && /"Lejest\u00f8j p\u00e5 linje 3"/.test(briefLine), "…NAMED with the case it was computed for");
  await page.screenshot({ path: path.join(__dirname, "tmp-round64-brief.png"), fullPage: false });

  // 3. The MENTOR STRIP carries the same line (one derivation, two lenses).
  await page.evaluate(() => { const a = document.querySelector('#nav a[data-view="risks"]'); if (a) a.click(); });
  await page.waitForSelector("#mentorStripGuidance", { state: "attached", timeout: 15000 });
  // The strip is an expandable panel by design (calm default): open it the
  // way a leader does — the AI-mentor badge — and verify what is READ there.
  await page.evaluate(() => { const b = document.querySelector("[data-mentor-toggle]"); if (b) b.click(); });
  await page.waitForSelector("#mentorStripGuidance", { state: "visible", timeout: 15000 });
  await page.waitForTimeout(400);
  const stripDiag = await page.evaluate(() => {
    const host = document.querySelector("#mentorStripGuidance");
    const items = (window.LCCaseIndexUI && window.LCCaseIndexUI.getCaseMentorItems)
      ? window.LCCaseIndexUI.getCaseMentorItems("da") : null;
    const r = host ? host.getBoundingClientRect() : null;
    return {
      htmlLen: host ? host.innerHTML.length : -1,
      rect: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
      display: host ? getComputedStyle(host).display : null,
      parentDisplay: host && host.parentElement ? getComputedStyle(host.parentElement).display : null,
      items: items ? items.map(i => i.text) : null,
      text: host ? host.textContent : null
    };
  });
  console.log("  [strip diag] " + JSON.stringify(stripDiag).slice(0, 600));
  const stripText = String(await page.locator("#mentorStripGuidance").innerText());
  check(/N\u00e6ste handling p\u00e5/.test(stripText), "the opened mentor strip cites the same method: " + stripText.replace(/\n/g, " ").slice(0, 130));
  check(/Lejest\u00f8j p\u00e5 linje 3/.test(stripText), "…NAMED with the same case the brief named");
  await page.screenshot({ path: path.join(__dirname, "tmp-round64-mentor.png"), fullPage: false });

  // 4. The English surface speaks English.
  const enLine = await page.evaluate(() => {
    window.LCStore.setLang("en");
    const a = document.querySelector('#nav a[data-view="caseIndex"]');
    if (a) a.click();
    const el = document.querySelector(".case-index-card .case-index-knowledge-line");
    return el ? el.textContent : null;
  });
  await page.waitForTimeout(300);
  check(enLine !== null && /^Next action: /.test(enLine), "the English card speaks English: " + String(enLine).slice(0, 110));
  check(enLine !== null && /Evidence: /.test(enLine), "…with the English evidence label");
  await page.evaluate(() => window.LCStore.setLang("da"));

  // 5. Layout honesty (the design bar): the line wraps instead of clipping,
  // the card does not overflow, and the page has no horizontal scroll —
  // checked at a wide AND a narrow (mobile) viewport, Danish strings run long.
  const layout = await page.evaluate(() => {
    window.LCStore.setLang("da");
    const a = document.querySelector('#nav a[data-view="caseIndex"]');
    if (a) a.click();
    const card = Array.from(document.querySelectorAll(".case-index-card")).filter(c => c.querySelector(".case-index-knowledge-line"))[0] || null;
    const line = card ? card.querySelector(".case-index-knowledge-line") : null;
    if (!line || !card) return null;
    const ls = getComputedStyle(line);
    const offenders = [];
    Array.from(card.querySelectorAll("*")).forEach(el => {
      if (el.scrollWidth > el.clientWidth + 1) {
        offenders.push(el.tagName + "." + String(el.className).slice(0, 40) + " cw=" + el.clientWidth + " sw=" + el.scrollWidth + " :: " + (el.textContent || "").slice(0, 70));
      }
    });
    return {
      cardKey: card.getAttribute("data-case-key"),
      lineClipped: line.scrollHeight > line.clientHeight + 1,
      lineOverflowX: line.scrollWidth > line.clientWidth + 1,
      cardOverflowX: card.scrollWidth > card.clientWidth + 1,
      offenders: offenders,
      pageOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      fontSize: ls.fontSize, wraps: ls.whiteSpace
    };
  });
  check(layout !== null, "the card line is measurable");
  if (layout) {
    check(!layout.lineClipped && !layout.lineOverflowX, "the line wraps instead of clipping (" + layout.fontSize + ", white-space: " + layout.wraps + ")");
    check(!layout.cardOverflowX, "the card never overflows horizontally with the long Danish line" + (layout.cardOverflowX ? " — " + JSON.stringify(layout.offenders).slice(0, 400) + " (card " + layout.cardKey + ")" : ""));
    check(!layout.pageOverflowX, "the page has no horizontal scroll");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const narrow = await page.evaluate(() => ({
    pageOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    lineVisible: !!document.querySelector(".case-index-card .case-index-knowledge-line")
  }));
  check(!narrow.pageOverflowX, "narrow viewport (390px): no horizontal scroll — Danish strings run longer");
  check(narrow.lineVisible, "narrow viewport: the next action still renders on the card");
  await page.screenshot({ path: path.join(__dirname, "tmp-round64-narrow.png"), fullPage: false });
  await page.setViewportSize({ width: 1360, height: 950 });
  await page.waitForTimeout(300);

  const realErrors = consoleErrors.filter(e => !/favicon|net::ERR/.test(e));
  check(realErrors.length === 0, "zero console errors (" + realErrors.slice(0, 3).join(" | ") + ")");

  await browser.close();
  server.close();
  console.log(failures === 0 ? "\nROUND 64 LIVE PROOF PASSED" : "\nFAILED: " + failures);
  process.exit(failures === 0 ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
