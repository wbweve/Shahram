// tmp-seed-server-cases.mjs — seed one case per SERVER case register through
// the real routes (door 4's registers) for the live browser verification.
const BASE = process.env.BASE || "http://127.0.0.1:8242";
const TOKEN = process.env.TOKEN || "seed-editor-token";
const H = { "Content-Type": "application/json", "Authorization": "Bearer " + TOKEN };

async function post(path, payload) {
  const res = await fetch(BASE + path, { method: "POST", headers: H, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(path + " → " + res.status + " " + JSON.stringify(body));
  return body;
}

const inc = await post("/api/incidents", {
  title: "Røgudvikling i tavlerum 4", source: "Tavlerum 4", asset: "MCC-4",
  severity: 7, level: "major", status: "OPEN", openedAt: "2026-10-06T22:05:00.000Z"
});
const incidentId = (inc.incident || {})._id;
console.log("incident:", incidentId);

const inv = await post("/api/investigations", {
  title: "Brandrisiko i tavlerum 4", type: "safety", severity: "high", stage: "investigation",
  subjects: ["Tavlerum 4"], openedAt: "2026-10-07T09:15:00.000Z",
  openedFrom: { module: "incidents", recordId: incidentId, detail: "promoted" }
});
console.log("investigation:", (inv.case || {})._id);

const obs = await post("/api/safety-observations", {
  title: "Næsten-uheld ved port 2", category: "near_miss", potentialSeverity: 6,
  location: "Tavlerum 4", status: "OPEN", incidentId: incidentId,
  openedAt: "2026-10-05T07:30:00.000Z"
});
console.log("observation:", (obs.observation || {})._id);

const war = await post("/api/after-sales-leadership/case", {
  symptom: "Leje støjer på ventilator AG-7", assetSerial: "SN-8842", productLine: "axial",
  priority: "high", status: "open", reportedDate: "2026-10-06", customer: "Nordhavn Datacenter"
});
console.log("warranty: seeded");

const esc = await post("/api/escalation-analytics/cases", {
  title: "Leveringseskalering — Nordhavn Datacenter", severity: "high", status: "open",
  customer: "Nordhavn Datacenter", subject: "Tavlerum 4"
});
console.log("escalation:", (esc.row || {})._id);
console.log("SEED-OK");
