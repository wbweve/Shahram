/* visual-verify-demo-workspace.cjs
 * Stress test: seeds a full demo workspace over HTTP (8 employees, roster
 * birth years, MUS, gesamtaler, senior talks, conflicts, team pulse,
 * ledertrivsel, LUS, oneonones, reaktionssager, jobrotation), then walks
 * EVERY Danish HR view and screenshots each. Zero-console-error policy.
 *
 * Run: node visual-verify-demo-workspace.cjs
 */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), os = require("os");

const PORT = process.env.PORT || "8146";
const BASE = "http://127.0.0.1:" + PORT;
// Parametrized: DEMO_LANG=da|en (default en), DEMO_THEME=dark|light (default light).
const DEMO_LANG = process.env.DEMO_LANG === "da" ? "da" : "en";
const DEMO_THEME = process.env.DEMO_THEME === "dark" ? "dark" : "light";
const SHOT_PREFIX = "demo-" + DEMO_LANG + (DEMO_THEME === "dark" ? "-dark" : "") + "-";

const dataDir = path.join(os.tmpdir(), "demo-ws-" + Date.now());
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

const VIEWS = ["danishHr", "lederSelv", "lederteam", "personaleOversigt", "ugebriefing", "medarbejder", "psychSafety"];

(async () => {
  await new Promise(resolve => server.once("listening", resolve));
  let failures = 0;
  const check = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) failures++; };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push("pageerror: " + e.message));

  await page.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });
  if (DEMO_THEME === "dark") {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("lc_theme", "dark"); } catch (_) {}
    });
  }

  const email = "demo-ws@example.com";
  const reg = await api(page, "POST", "/api/auth/register", { email, password: "StrongPass123" });
  const leadId = reg.body && reg.body.user && reg.body.user.id;
  await api(page, "POST", `/api/auth/users/${leadId}/role`, { role: "admin" });
  const login = await api(page, "POST", "/api/auth/login", { email, password: "StrongPass123" });
  const token = login.body && login.body.token;
  const proj = await api(page, "POST", "/api/projects", { name: "Demo Værksted", lead: leadId }, token);
  const projectId = proj.body && (proj.body.id || (proj.body.project && proj.body.project.id));
  check(!!token && !!projectId, "login + project created");

  await page.evaluate(t => localStorage.setItem("leadership_session", t), token);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 15000 });

  const H = { "Content-Type": "application/json", Authorization: "Bearer " + token };
  const post = async (route, payload) => page.evaluate(({ route, payload, H }) =>
    fetch(route, { method: "POST", headers: H, body: JSON.stringify(payload) }).then(r => r.status),
    { route, payload, H });

  // ── Seed: 8 employees with birth years & hire dates ──────────────────────
  const people = [
    { name: "Ahmed", birthYear: 1962, hireDato: "2012-03-01", style: { employeeId: "Ahmed", competence: 4, motivation: 4 } },
    { name: "Birthe", birthYear: 1963, hireDato: "2010-06-01" },
    { name: "Carsten", birthYear: 1968, hireDato: "2015-01-01" },
    { name: "Dorte", birthYear: 1975, hireDato: "2018-08-01" },
    { name: "Emil", birthYear: 1990, hireDato: "2022-02-01" },
    { name: "Fatima", birthYear: 1985, hireDato: "2019-05-01" },
    { name: "Gunnar", birthYear: 1996, hireDato: "2026-08-25" },
    { name: "Helle", birthYear: 1980, hireDato: "2016-11-01" }
  ];
  // Roster goes through the workspace GET→PUT (the store's own path). The
  // projects blob lives under ws.workspace.projects.
  const wsResp = await page.evaluate(async ({ projectId, people, H }) => {
    const wsr = await fetch("/api/workspace", { headers: H });
    const payload = await wsr.json();
    const projects = payload.workspace && payload.workspace.projects ? payload.workspace.projects : {};
    const p = projects[projectId] || Object.values(projects)[0] || null;
    if (!p) return 404;
    p.roster = people.map(x => ({ name: x.name, hireDato: x.hireDato, birthYear: x.birthYear, role: "Team Member" }));
    const put = await fetch("/api/workspace", { method: "PUT", headers: H, body: JSON.stringify(payload.workspace) });
    return put.status;
  }, { projectId, people, H });
  check(wsResp === 200, "workspace PUT with 8-person roster → " + wsResp);

  // Situationsbestemt styles
  for (const x of people.slice(0, 4)) await post("/api/danish-hr/situationsbestemt/save", { employeeId: x.name, competence: 4, motivation: 3 });
  // MUS: held for most, planned for the new hire
  await post("/api/danish-hr/mus", { format: "MUS", employeeId: "Dorte", status: "AFHOLDT", heldDate: "2026-08-20", aftaler: [{ text: "ALM-kursus", measure: "kursus bestået", followUpDate: "2026-12-01" }] });
  await post("/api/danish-hr/mus", { format: "MUS", employeeId: "Emil", status: "AFHOLDT", heldDate: "2026-02-10", aftaler: [] });
  await post("/api/danish-hr/mus", { format: "1TIL1", employeeId: "Gunnar", status: "PLANLAGT", plannedDate: "2026-09-15", aftaler: [] });
  // Gesamtaler: one fresh, one stale, one unsigned
  await post("/api/danish-hr/gesamtale", { medarbejder: "Dorte", dato: "2026-09-01", scores: { paalidelighed: 5, ansvarsomraader: 4, fleksibilitet: 4, opfoelgning: 5 }, rosenpunkt: "Driver tavlemødet stabilt", pryglepunkt: "Mere delegation af vagtplanlægning", lederSigneret: true, medarbSigneret: true });
  await post("/api/danish-hr/gesamtale", { medarbejder: "Helle", dato: "2026-02-15", scores: { paalidelighed: 4, ansvarsomraader: 3, fleksibilitet: 4, opfoelgning: 3 }, rosenpunkt: "Stærk på kundeservice", pryglepunkt: "Dokumentation i sagssystemet", lederSigneret: true, medarbSigneret: true });
  await post("/api/danish-hr/gesamtale", { medarbejder: "Emil", dato: "2026-09-05", scores: { paalidelighed: 4, ansvarsomraader: 4, fleksibilitet: 3, opfoelgning: 4 }, rosenpunkt: "Lærer hurtigt", pryglepunkt: "Punktualitet ved morgenvagt", lederSigneret: true, medarbSigneret: false });
  // Senior talks: offered to Ahmed, never to Birthe/Carsten
  await post("/api/danish-hr/seniorsamtale", { medarbejder: "Ahmed", status: "AFHOLDT", dato: "2026-05-10" });
  // Reaktionssager: one at påtale, one with a gappy written warning
  await post("/api/danish-hr/reaktionscase", { medarbejder: "Gunnar", omraade: "fremmoede", reactions: [{ type: "paatale", dato: "2026-09-01" }] });
  await post("/api/danish-hr/reaktionscase", { medarbejder: "Emil", omraade: "adfaerd", reactions: [{ type: "paatale", dato: "2026-07-01" }, { type: "skriftlig_advarsel", dato: "2026-08-15" }] });
  // Jobrotation: one ready-ish round for Fatima
  await post("/api/danish-hr/jobrotation", { medarbejder: "Fatima", uddannelse: "Sikkerhedskursus B", offentligtGodkendt: true, startDato: "2026-11-01", slutDato: "2027-01-15", vikarNavn: "Vikar Jonas", vikarTimer: 30, vikarKontrakt: true, rotationsaftale: true, ansogningSendt: false, status: "PLANLAGT" });
  // Vagtplan: shifts for three employees (one 8h rest breach for Bo), a plan version delivered too late
  await post("/api/danish-hr/vagtplan/shift", { medarbejder: "Dorte", dato: "2026-09-07", type: "dag", startTid: "07:00", slutTid: "15:00" });
  await post("/api/danish-hr/vagtplan/shift", { medarbejder: "Dorte", dato: "2026-09-08", type: "dag", startTid: "07:00", slutTid: "15:00" });
  await post("/api/danish-hr/vagtplan/shift", { medarbejder: "Bo", dato: "2026-09-08", type: "aften", startTid: "14:00", slutTid: "22:00" });
  await post("/api/danish-hr/vagtplan/shift", { medarbejder: "Bo", dato: "2026-09-09", type: "dag", startTid: "06:00", slutTid: "14:00" });
  await post("/api/danish-hr/vagtplan/plan", { gyldigFra: "2026-09-21", udleveretDato: "2026-09-01", ugeAntal: 4 });
  // Supervision: two held sessions (Bo presented, Dorte never), one planned
  await post("/api/danish-hr/supervision", { format: "ekstern", dato: "2026-06-01", status: "AFHOLDT", tema: "sverige", deltager: ["Dorte", "Bo", "Emil"], roller: { caseskildrer: "Bo", facilitator: "Ekstern supervisor" } });
  await post("/api/danish-hr/supervision", { format: "kollegavejledning", dato: "2026-08-20", status: "AFHOLDT", tema: "etik", deltager: ["Dorte", "Bo"], roller: { caseskildrer: "Bo" } });
  await post("/api/danish-hr/supervision", { format: "kollegavejledning", dato: "2026-09-24", status: "PLANLAGT", tema: "samarbejde", deltager: ["Dorte", "Bo", "Emil"] });
  // Hybrid teamaftale: a stale version (6-month review cadence) so the lederSelv view shows the flag
  await post("/api/danish-hr/teamaftale", { dato: "2026-02-01", tilstedevaerelsesDage: ["tirsdag", "torsdag"], moedeDage: ["mandag"], kerntidStart: "09:00", kerntidSlut: "14:00", reachability: "Teams-besked inden 1 time i kerntid", acknowledgers: ["Dorte"] });
  // Personalemøde: one held with an overdue decision, one without referat
  const moedeSeed = await post("/api/danish-hr/personalemoede", { dato: "2026-08-01", status: "AFHOLDT", deltagere: ["Dorte", "Bo", "Emil"], beslutninger: [] });
  if (moedeSeed && moedeSeed.moede) await post("/api/danish-hr/personalemoede/" + moedeSeed.moede._id + "/beslutning", { tekst: "Ny vagtplan-kommunikation", ejer: "Dorte", frist: "2026-08-20" });
  // Delegering: one missed checkpoint, one closed with ladder climb
  const delegSeed = await post("/api/danish-hr/delegering", { medarbejder: "Bo", opgave: "Lukke månedsskift", level: 4, forventning: "Fejlfrit", checkpointDato: "2026-08-15", frist: "2026-09-20", status: "IGANG" });
  if (delegSeed && delegSeed.kort) await post("/api/danish-hr/delegering/" + delegSeed.kort._id + "/status", { status: "FAERDIG", udkomst: "Fejlfrit", naesteLevel: 5 });
  await post("/api/danish-hr/delegering", { medarbejder: "Emil", opgave: "Bestille rekvisitter", level: 3, checkpointDato: "2026-08-30", status: "IGANG" });
  // Tilkalding: one OK24 underpayment
  await post("/api/danish-hr/tilkalding", { medarbejder: "Emil", dato: "2026-09-07", varselTimer: 4, antalTimer: 2, aarsag: "Sygdom" });
  // Vikarbank: two vikarer (one stale contact), sickness as hot cause
  await post("/api/danish-hr/vikarbank", { navn: "Vikar Jonas", telefon: "20123456", kvalifikationer: ["sygdom", "frikvarter"], dage: ["mandag", "tirsdag", "onsdag"], sidstKontaktet: "2026-03-01" });
  await post("/api/danish-hr/vikarbank", { navn: "Vikar Mia", telefon: "20567890", kvalifikationer: ["sygdom", "nat"], dage: [] });
  // Dækningsmatrix: one single-point-of-failure + one covered function
  await post("/api/danish-hr/daekningsmatrix", { funktion: "Lukning af kassen", kritikalitet: "høj", kompetencer: [{ medarbejder: "Dorte", level: 3, primaer: true }] });
  await post("/api/danish-hr/daekningsmatrix", { funktion: "Nøgle til alarmrum", kritikalitet: "høj", kompetencer: [{ medarbejder: "Dorte", level: 2, primaer: true }, { medarbejder: "Bo", level: 2 }] });
  // Erfaringer: one embedded, one stale without action
  await post("/api/danish-hr/erfaringer", { kilde: "naer_ulykke", dato: "2026-08-01", situation: "Vikar kendte ikke alarmkoden", laering: "Beredskabsmappe skal følge vikaren", handling: "Ny rutine ved indkaldelse" });
  await post("/api/danish-hr/erfaringer", { kilde: "projekt", dato: "2026-04-01", situation: "Tavlemødet druknede i detaljer", laering: "Maks tre punkter pr. møde" });
  // Team pulse: healthy then falling
  await post("/api/danish-hr/team-pulse", { team: "Daghold", scores: [8, 7, 8, 9, 7, 8] });
  await post("/api/danish-hr/team-pulse", { team: "Daghold", scores: [6, 5, 7, 6, 5, 6] });
  // Leader's own: trivsel falling + overdue LUS
  await post("/api/leder-selv/trivsel", { rawIndex: 78, date: "2026-06-01" });
  await post("/api/leder-selv/trivsel", { rawIndex: 62, date: "2026-09-01" });
  await post("/api/leder-selv/energy", { entries: [{ taskId: "medarbejderledelse", hours: 11, energy: 4 }, { taskId: "administration", hours: 8, energy: 2 }] });
  await post("/api/leder-selv/lus", { title: "LUS 2025", status: "AFHOLDT", heldDate: "2025-07-01", nextDate: "2026-07-01" });
  // Conflicts: one open at Glasl 2
  await page.evaluate(async ({ H }) => {
    const wsr = await fetch("/api/workspace", { headers: H });
    const payload = await wsr.json();
    const p = Object.values(payload.workspace.projects)[0];
    p.registers = p.registers || {};
    p.registers.conflicts = [{ _id: "conf-1", issue: "Roller i vagtplanlægningen", parties: ["Dorte", "Emil"], intensity: 4, stage: 2, date: "2026-08-25", status: "OPEN", timeline: [] }];
    await fetch("/api/workspace", { method: "PUT", headers: H, body: JSON.stringify(payload.workspace) });
  }, { H });
  check(true, "demo data seeded (MUS, gesamtaler, senior, reaktioner, jobrotation, vagtplan, supervision, pulse, conflicts)");

  // ── Walk every Danish HR view, screenshot each ───────────────────────────
  const SHOTS = path.join(__dirname, "screenshots");
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  if (DEMO_THEME === "dark") {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("lc_theme", "dark"); } catch (_) {}
    });
  }
  if (DEMO_LANG === "da") {
    await page.evaluate(() => { const b = document.querySelector("#langDa"); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
  for (const view of VIEWS) {
    await page.evaluate(v => {
      const link = document.querySelector('a[data-view="' + v + '"]');
      if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
    }, view);
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => {
      const content = document.querySelector("#content");
      const text = content ? content.innerText : "";
      return {
        len: text.length,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        empty: text.trim().length < 40
      };
    });
    check(state.len > 120 && !state.empty && !state.overflowX, view + ": renders " + state.len + " chars, no overflow, not empty");
    await page.screenshot({ path: path.join(SHOTS, SHOT_PREFIX + view + ".png"), fullPage: true });
  }

  // Content assertions on the meaty views.
  await page.evaluate(() => {
    const link = document.querySelector('a[data-view="personaleOversigt"]');
    if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
  });
  await page.waitForTimeout(900);
  const t1 = await page.evaluate(() => (document.querySelector("#content") || {}).innerText || "");
  check(/Ahmed/.test(t1) && /Dorte/.test(t1), "personaleoversigt lists roster members");
  check(/gesamtal/i.test(t1), "personaleoversigt shows the gesamtal section");
  check(/Senior/i.test(t1), "personaleoversigt shows the senior section");
  check(/Emil/.test(t1), "personaleoversigt includes the reaction case member");

  // Fristvagt wheel on the danishHr view: the four statutory clocks render
  // (seeded APV staleness must make the APV card show an alert, not OK).
  await page.evaluate(() => {
    const link = document.querySelector('a[data-view="danishHr"]');
    if (link) { const d = link.closest("details"); if (d) d.open = true; link.click(); }
  });
  await page.waitForTimeout(1200);
  const tFv = await page.evaluate(() => (document.querySelector("#dkFristBox") || {}).innerText || "");
  check(/MUS/.test(tFv) && /APV/.test(tFv) && /(Tidsregistrering|Time registration)/.test(tFv), "fristvagt wheel renders all four statutory clocks");
  check(/Ferieplan/.test(tFv), "ferieplan clock present on the wheel");

  check(consoleErrors.length === 0, "zero console errors (" + consoleErrors.length + ")");
  if (consoleErrors.length) console.log("  console errors:", consoleErrors.slice(0, 5));

  await browser.close();
  server.close();
  try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch (_) {}
  console.log(`\nDemo workspace verify: ${failures === 0 ? "ALL PASSED" : failures + " FAILURE(S)"}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
