/* ============================================================================
   js/team-members-ui.js — TEAM MEMBERS (Module 2).

   Record shape:
     id, name, role, team, developmentStage (directing/coaching/supporting/delegating),
     motivators, communicationStyle, notes, stageHistory:[{date,stage}], createdAt

   Cross-module wiring:
     • Add member → seeds oneOnOnes + recognitions (LCLSCore.registerTeamMember)
     • getTeamComposition() → exported for daily-brief coaching spotlight
     • getMemberEngagement(id) → 1:1 recency, recognition gap, delegation count

   Tabs: Overview | Engagement | Team Composition
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }
  function todayISO() { var c = core(); return c ? c.todayISO() : new Date().toISOString().slice(0, 10); }
  function daysSince(d) { var c = core(); return c ? c.daysSince(d) : null; }
  function uid(p) { var c = core(); return c ? c.uid(p) : (p + Date.now()); }

  /* ─── SLII Development stages with D-level, coaching tips, signals ───────── */

  var STAGES = [
    {
      key: "directing",
      dLevel: "D1",
      label: { en: "Directing", da: "Dirigerende" },
      approach: {
        en: "D1 — New to task. Provide clear direction, close supervision, and defined goals. Ask questions to check understanding, not confidence.",
        da: "D1 — Ny i opgaven. Giv klar retning, tæt supervision og definerede mål."
      },
      coachingTip: {
        en: "Set clear milestones. Check in frequently. Explain the 'why' behind every instruction.",
        da: "Sæt klare milepæle. Følg tæt op. Forklar 'hvorfor' bag alle instrukser."
      },
      signals: {
        en: "Watch for: hesitation to ask questions, missed deadlines, over-reliance on you for decisions.",
        da: "Kig efter: tøven med at stille spørgsmål, overskrene deadlines, over-afhængighed."
      },
      color: "#F59E0B"  // amber — high direction needed
    },
    {
      key: "coaching",
      dLevel: "D2",
      label: { en: "Coaching", da: "Coachende" },
      approach: {
        en: "D2 — Some competence, variable commitment. Explain your reasoning, invite their input, give two-way feedback.",
        da: "D2 — Nogen kompetence, variabel motivation. Forklar din tankegang, invitér til input."
      },
      coachingTip: {
        en: "Ask before telling. Celebrate progress loudly. Address discouragement early — this stage has the highest dropout risk.",
        da: "Spørg før du fortæller. Fejr fremskridt tydeligt. Tag fat i modløshed tidligt."
      },
      signals: {
        en: "Watch for: frustration, withdrawal, over-commitment followed by under-delivery.",
        da: "Kig efter: frustration, tilbagetrækning, overforpligtelse efterfulgt af underlevering."
      },
      color: "#6366F1"  // indigo — coaching intensive
    },
    {
      key: "supporting",
      dLevel: "D3",
      label: { en: "Supporting", da: "Støttende" },
      approach: {
        en: "D3 — High competence, low/variable confidence. Collaborate, listen, encourage autonomy. Resist the urge to direct.",
        da: "D3 — Høj kompetence, lav/variabel selvtillid. Samarbejd, lyt, opmuntre til autonomi."
      },
      coachingTip: {
        en: "Ask 'What do you think?' and mean it. Share context, not solutions. Your job is to remove blockers, not make decisions.",
        da: "Spørg 'Hvad tænker du?' og mén det. Del kontekst, ikke løsninger."
      },
      signals: {
        en: "Watch for: seeking validation more than guidance, second-guessing completed work.",
        da: "Kig efter: søgen efter validering fremfor vejledning, tvivl om afsluttet arbejde."
      },
      color: "#2563EB"  // blue — supportive
    },
    {
      key: "delegating",
      dLevel: "D4",
      label: { en: "Delegating", da: "Delegerende" },
      approach: {
        en: "D4 — Expert and self-directed. Delegate fully. Check in lightly. Give stretch opportunities and strategic visibility.",
        da: "D4 — Ekspert og selvstyrende. Deleger fuldt. Tjek let ind. Giv stretch-muligheder."
      },
      coachingTip: {
        en: "Don't micromanage — it signals distrust and kills motivation at this stage. Focus on exposure to leadership, not task review.",
        da: "Undgå at micromanage — det signalerer mistillid og dræber motivation her. Fokus på eksponering til ledelse."
      },
      signals: {
        en: "Watch for: boredom, talent flight risk, taking on too much without flagging capacity issues.",
        da: "Kig efter: kedsomhed, risiko for at miste talenter, overbelastning uden at flagge det."
      },
      color: "#16A34A"  // green — high autonomy
    }
  ];

  function getStage(key) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].key === key) return STAGES[i];
    return null;
  }
  function stageLabel(key) {
    var s = getStage(key); return s ? L(s.label.da, s.label.en) : (key || "—");
  }
  function stageApproach(key) {
    var s = getStage(key); return s ? L(s.approach.da, s.approach.en) : "";
  }
  function stageDLevel(key) {
    var s = getStage(key); return s ? s.dLevel : "";
  }
  function stageColor(key) {
    var s = getStage(key); return s ? s.color : "var(--text-3)";
  }

  /* ─── Engagement helpers ─────────────────────────────────────────────────── */

  function getMemberEngagement(memberId) {
    var c = core();
    if (!c) return { last1on1: null, lastRec: null, activeDelegations: 0, days1on1: null, daysRec: null };
    var last1on1 = c.lastOneOnOneDate ? c.lastOneOnOneDate(memberId) : null;
    var lastRec = c.lastRecognitionDate ? c.lastRecognitionDate(memberId) : null;

    // Count active delegations for this member
    var delegations = [];
    try { delegations = JSON.parse(localStorage.getItem("delegations") || "[]"); } catch (_) {}
    var active = delegations.filter(function (d) {
      return d.memberId === memberId && d.status !== "completed" && d.status !== "cancelled";
    });

    return {
      last1on1: last1on1,
      lastRec: lastRec,
      activeDelegations: active.length,
      days1on1: last1on1 ? daysSince(last1on1) : null,
      daysRec: lastRec ? daysSince(lastRec) : null
    };
  }

  function engagementRisk(eng, stage) {
    // Higher urgency for D1/D2 if 1:1 is overdue
    var threshold1on1 = (stage === "directing" || stage === "coaching") ? 7 : 14;
    var thresholdRec = 30;
    var risks = [];
    if (eng.days1on1 === null || eng.days1on1 > threshold1on1) risks.push("1:1");
    if (eng.daysRec === null || eng.daysRec > thresholdRec) risks.push("recognition");
    return risks;  // empty = no risk flags
  }

  /* ─── Team Composition analysis ─────────────────────────────────────────── */

  function getTeamComposition() {
    var c = core();
    if (!c) return null;
    var list = c.members();
    var dist = { directing: 0, coaching: 0, supporting: 0, delegating: 0 };
    list.forEach(function (m) { if (dist[m.developmentStage] !== undefined) dist[m.developmentStage]++; });
    var total = list.length;
    var supervisoryLoad = (dist.directing + dist.coaching);  // requires active coaching
    var highAutonomy = (dist.supporting + dist.delegating);
    var allHigh = total > 0 && supervisoryLoad === 0;
    var allLow = total > 0 && highAutonomy === 0;
    return {
      total: total,
      dist: dist,
      supervisoryLoad: supervisoryLoad,
      highAutonomy: highAutonomy,
      allHighConcern: allLow,  // team stuck in D1/D2 — growth stalled?
      allLowConcern: allHigh,  // nobody needs coaching — are you underinvesting?
      percentSupervised: total ? Math.round(supervisoryLoad / total * 100) : 0
    };
  }

  /* ─── Screen state ─────────────────────────────────────────────────────── */

  var editingId = null;
  var detailId = null;
  var activeTab = "overview";   // "overview" | "engagement" | "composition"
  var detailTab = "profile";    // "profile" | "engagement" | "history"
  var formOpen = false;
  var formError = null;
  var stageFilter = "";         // "" = all, else filter by stage key

  function rerender() {
    var container = document.getElementById("teamMembersRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Stage badge ─────────────────────────────────────────────────────── */

  function stageBadge(key) {
    var s = getStage(key);
    if (!s) return '<span class="badge">' + esc(key || "—") + "</span>";
    return '<span class="badge" style="background:' + s.color + '20;color:' + s.color
      + ';border:1px solid ' + s.color + '40" title="' + esc(L(s.approach.da, s.approach.en)) + '">'
      + esc(s.dLevel + " · " + L(s.label.da, s.label.en)) + "</span>";
  }

  /* ─── Engagement status pill ─────────────────────────────────────────── */

  function engagementPill(eng, stage) {
    var risks = engagementRisk(eng, stage);
    if (risks.length === 0) {
      return '<span style="font-size:11px;color:var(--ok)">● Engaged</span>';
    }
    return '<span style="font-size:11px;color:var(--warn)">● ' + esc(risks.join(", ") + " overdue") + "</span>";
  }

  /* ─── The add/edit form ─────────────────────────────────────────────── */

  function formHtml(member) {
    var m = member || {};
    var stageOptions = STAGES.map(function (s) {
      return '<option value="' + esc(s.key) + '"' + (m.developmentStage === s.key ? " selected" : "") + ">"
        + esc(s.dLevel + " — " + L(s.label.da, s.label.en)) + "</option>";
    }).join("");
    var errorHtml = formError
      ? '<div style="color:var(--risk);font-size:13px;margin-top:6px">' + esc(formError) + "</div>"
      : "";
    var stageTip = m.developmentStage ? stageApproach(m.developmentStage) : "";
    return '<div class="card" style="margin-bottom:12px">'
      + '<h3 style="margin:0 0 12px">'
      + esc(m.id ? L("Redigér teammedlem", "Edit team member") : L("Tilføj teammedlem", "Add team member"))
      + "</h3>"
      + '<form id="tmForm" class="form-grid">'
      + "<label>" + esc(L("Navn *", "Name *")) + '<input type="text" id="tmName" maxlength="60" required placeholder="Full name" value="' + esc(m.name || "") + '"></label>'
      + "<label>" + esc(L("Rolle", "Role")) + '<input type="text" id="tmRole" maxlength="60" placeholder="e.g. Senior Engineer" value="' + esc(m.role || "") + '"></label>'
      + "<label>" + esc(L("Team / domæne", "Team / domain")) + '<input type="text" id="tmTeam" maxlength="60" placeholder="e.g. Platform" value="' + esc(m.team || "") + '"></label>'
      + "<label>" + esc(L("Udviklingsstadie (SLII)", "Development stage (SLII)"))
      + '<select id="tmStage"><option value="">— ' + esc(L("vælg stadie", "select stage")) + ' —</option>' + stageOptions + "</select></label>"
      + (stageTip ? '<div class="form-tip" style="grid-column:1/-1;font-size:12px;color:var(--text-2);background:var(--surface-2);border-radius:6px;padding:8px 10px;line-height:1.5">'
        + '📋 ' + esc(stageTip) + "</div>" : "")
      + "<label>" + esc(L("Motivatorer", "Motivators")) + '<textarea id="tmMotivators" maxlength="400" rows="2" placeholder="What drives this person? Recognition, autonomy, impact...">' + esc(m.motivators || "") + "</textarea></label>"
      + "<label>" + esc(L("Kommunikationsstil", "Communication style")) + '<textarea id="tmCommStyle" maxlength="400" rows="2" placeholder="Direct/indirect, prefers async/sync, big-picture first or detail first...">' + esc(m.communicationStyle || "") + "</textarea></label>"
      + "<label style=\"grid-column:1/-1\">" + esc(L("Private ledernotes", "Private leadership notes")) + '<textarea id="tmNotes" maxlength="800" rows="3" placeholder="Observations, growth areas, concerns — visible only to you...">' + esc(m.notes || "") + "</textarea></label>"
      + '<div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="btn btn-primary" type="submit">' + esc(m.id ? L("Gem ændringer", "Save changes") : L("Tilføj til team", "Add to team")) + "</button>"
      + '<button class="btn" type="button" data-act="tm:cancel">' + esc(L("Annuller", "Cancel")) + "</button>"
      + "</div>"
      + "</form>"
      + '<div style="font-size:11px;color:var(--text-3);margin-top:8px;line-height:1.5">'
      + "Adding creates a 1:1 record (biweekly cadence) and recognition record automatically."
      + "</div>"
      + errorHtml + "</div>";
  }

  /* ─── Detail panel: profile tab ────────────────────────────────────── */

  function detailProfileHtml(m, eng) {
    var stage = getStage(m.developmentStage);
    return '<div style="display:flex;flex-direction:column;gap:10px">'
      // SLII coaching card
      + (stage ? '<div style="background:' + stage.color + '10;border:1px solid ' + stage.color + '30;border-radius:8px;padding:12px">'
        + '<div style="font-size:11px;font-weight:600;letter-spacing:.05em;color:' + stage.color + ';margin-bottom:4px">'
        + esc(stage.dLevel + " APPROACH") + "</div>"
        + '<div style="font-size:13px;color:var(--text);line-height:1.5">' + esc(L(stage.approach.da, stage.approach.en)) + "</div>"
        + '<div style="margin-top:8px;font-size:12px;color:var(--text-2);padding-top:8px;border-top:1px solid ' + stage.color + '20">'
        + "💡 " + esc(L(stage.coachingTip.da, stage.coachingTip.en)) + "</div>"
        + '<div style="margin-top:6px;font-size:12px;color:var(--text-3)">'
        + "⚠️ " + esc(L(stage.signals.da, stage.signals.en)) + "</div>"
        + "</div>" : "")
      // Profile fields
      + (m.motivators ? '<div><div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:2px">MOTIVATORS</div>'
        + '<div style="font-size:13px;color:var(--text-2)">' + esc(m.motivators) + "</div></div>" : "")
      + (m.communicationStyle ? '<div><div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:2px">COMMUNICATION STYLE</div>'
        + '<div style="font-size:13px;color:var(--text-2)">' + esc(m.communicationStyle) + "</div></div>" : "")
      + (m.notes ? '<div><div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:2px">LEADERSHIP NOTES</div>'
        + '<div style="font-size:13px;color:var(--text-2);font-style:italic">' + esc(m.notes) + "</div></div>" : "")
      + "</div>";
  }

  /* ─── Detail panel: engagement tab ─────────────────────────────────── */

  function detailEngagementHtml(m, eng) {
    var risks = engagementRisk(eng, m.developmentStage);

    // Fetch recent 1:1 history
    var oneOnOnes = [];
    try { oneOnOnes = JSON.parse(localStorage.getItem("oneOnOnes") || "[]"); } catch (_) {}
    var memberOOO = oneOnOnes.filter(function (o) { return o.memberId === m.id; });
    var recent1on1s = [];
    // Look for logs/meetings
    if (memberOOO.length) {
      var ooo = memberOOO[0];
      if (ooo.meetings && ooo.meetings.length) {
        recent1on1s = ooo.meetings.slice(-3).reverse();
      }
    }

    // Fetch recent recognitions
    var recognitions = [];
    try { recognitions = JSON.parse(localStorage.getItem("recognitions") || "[]"); } catch (_) {}
    var memberRecs = recognitions.filter(function (r) { return r.memberId === m.id; });
    var recentRecs = [];
    if (memberRecs.length) {
      var rec = memberRecs[0];
      if (rec.log && rec.log.length) {
        recentRecs = rec.log.slice(-3).reverse();
      }
    }

    // Active delegations
    var delegations = [];
    try { delegations = JSON.parse(localStorage.getItem("delegations") || "[]"); } catch (_) {}
    var activeDels = delegations.filter(function (d) {
      return d.memberId === m.id && d.status !== "completed" && d.status !== "cancelled";
    });

    function metricCard(label, value, sub, color) {
      return '<div style="flex:1;min-width:100px;background:var(--surface-2);border-radius:8px;padding:10px 12px">'
        + '<div style="font-size:11px;font-weight:600;color:var(--text-3);letter-spacing:.04em">' + esc(label) + "</div>"
        + '<div style="font-size:20px;font-weight:700;color:' + (color || "var(--text)") + ';margin:2px 0">' + esc(value) + "</div>"
        + '<div style="font-size:11px;color:var(--text-3)">' + esc(sub) + "</div>"
        + "</div>";
    }

    var d1on1 = eng.days1on1;
    var dRec = eng.daysRec;
    var threshold1on1 = (m.developmentStage === "directing" || m.developmentStage === "coaching") ? 7 : 14;
    var c1on1 = d1on1 === null ? "var(--risk)" : (d1on1 > threshold1on1 ? "var(--warn)" : "var(--ok)");
    var cRec = dRec === null ? "var(--risk)" : (dRec > 30 ? "var(--warn)" : "var(--ok)");

    return '<div style="display:flex;flex-direction:column;gap:14px">'
      // Risk banner
      + (risks.length ? '<div style="background:var(--warn);background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:8px 12px;font-size:12px;color:var(--warn)">'
        + "⚠️ Action needed: " + esc(risks.join(", ") + " overdue for this development stage") + "</div>" : "")
      // Metrics row
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + metricCard("LAST 1:1", d1on1 === null ? "Never" : d1on1 + "d ago", "Target: <" + threshold1on1 + "d", c1on1)
      + metricCard("LAST RECOGNITION", dRec === null ? "Never" : dRec + "d ago", "Target: <30d", cRec)
      + metricCard("ACTIVE DELEGATIONS", eng.activeDelegations, activeDels.length ? activeDels.map(function (d) { return d.taskTitle || "task"; }).slice(0, 2).join(", ") : "None", "var(--text)")
      + "</div>"
      // Quick actions
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button type="button" class="btn btn-sm" data-act="tm:goto:oneOnOnes:' + esc(m.id) + '" title="Go to 1:1 Manager for this person">Log 1:1 →</button>'
      + '<button type="button" class="btn btn-sm" data-act="tm:goto:recognitions:' + esc(m.id) + '" title="Go to Recognition Log for this person">Recognise →</button>'
      + '<button type="button" class="btn btn-sm" data-act="tm:goto:delegations:' + esc(m.id) + '" title="Go to Delegation Tracker for this person">Delegate →</button>'
      + "</div>"
      // Recent 1:1s
      + (recent1on1s.length ? '<div><div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:6px">RECENT 1:1s</div>'
        + recent1on1s.map(function (mt) {
          return '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--line);color:var(--text-2)">'
            + '<span style="color:var(--text-3);margin-right:8px">' + esc(mt.date || "?") + "</span>"
            + esc(mt.notes || mt.summary || "(no notes)") + "</div>";
        }).join("") + "</div>" : "")
      // Recent recognitions
      + (recentRecs.length ? '<div><div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:6px">RECENT RECOGNITION</div>'
        + recentRecs.map(function (r) {
          return '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--line);color:var(--text-2)">'
            + '<span style="color:var(--text-3);margin-right:8px">' + esc(r.date || "?") + "</span>"
            + esc(r.type || "") + (r.note ? " — " + esc(r.note) : "") + "</div>";
        }).join("") + "</div>" : "")
      + "</div>";
  }

  /* ─── Detail panel: stage history tab ──────────────────────────────── */

  function detailHistoryHtml(m) {
    var history = m.stageHistory || [];
    if (history.length === 0) {
      return '<div style="font-size:13px;color:var(--text-3);padding:12px 0">'
        + "No stage history recorded. Stage changes will be logged here automatically."
        + "</div>";
    }
    // Reverse chronological
    var sorted = history.slice().reverse();
    return '<div style="display:flex;flex-direction:column;gap:0">'
      + sorted.map(function (h, i) {
        var s = getStage(h.stage);
        return '<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)">'
          + '<div style="width:4px;border-radius:2px;background:' + (s ? s.color : "var(--text-3)") + ';flex-shrink:0"></div>'
          + '<div>'
          + '<div style="font-size:12px;color:var(--text-3)">' + esc(h.date || "unknown date") + "</div>"
          + '<div style="font-size:13px;font-weight:600;color:var(--text)">'
          + (s ? esc(s.dLevel + " — " + L(s.label.da, s.label.en)) : esc(h.stage)) + "</div>"
          + (h.note ? '<div style="font-size:12px;color:var(--text-2);margin-top:2px">' + esc(h.note) + "</div>" : "")
          + "</div></div>";
      }).join("")
      + "</div>";
  }

  /* ─── Full detail panel ─────────────────────────────────────────────── */

  function detailHtml(m) {
    var eng = getMemberEngagement(m.id);
    var stage = getStage(m.developmentStage);

    var tabs = [
      { key: "profile", label: "Profile" },
      { key: "engagement", label: "Engagement" },
      { key: "history", label: "Stage History" }
    ];
    var tabHtml = '<div style="display:flex;gap:2px;border-bottom:1px solid var(--line);margin:10px 0">'
      + tabs.map(function (t) {
        var active = detailTab === t.key;
        return '<button type="button" data-act="tm:dtab:' + esc(t.key) + '" style="padding:6px 12px;font-size:12px;font-weight:' + (active ? "600" : "400") + ';color:' + (active ? "var(--accent)" : "var(--text-3)") + ';background:none;border:none;border-bottom:2px solid ' + (active ? "var(--accent)" : "transparent") + ';cursor:pointer;margin-bottom:-1px">'
          + esc(t.label) + "</button>";
      }).join("")
      + "</div>";

    var body = "";
    if (detailTab === "profile") body = detailProfileHtml(m, eng);
    else if (detailTab === "engagement") body = detailEngagementHtml(m, eng);
    else if (detailTab === "history") body = detailHistoryHtml(m);

    return '<div class="card" style="margin-bottom:12px;border-left:3px solid ' + (stage ? stage.color : "var(--accent)") + '">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap">'
      + '<div>'
      + '<div style="font-size:16px;font-weight:700;color:var(--text)">' + esc(m.name) + "</div>"
      + '<div style="font-size:12px;color:var(--text-3);margin-top:2px">'
      + esc([m.role, m.team].filter(Boolean).join(" · ") || "No role set") + "</div>"
      + "</div>"
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
      + stageBadge(m.developmentStage)
      + '<button type="button" class="btn btn-sm" data-act="tm:edit:' + esc(m.id) + '">Edit</button>'
      + '<button type="button" class="btn btn-sm" style="color:var(--risk)" data-act="tm:delete:' + esc(m.id) + '">Delete</button>'
      + '<button type="button" class="btn btn-sm" data-act="tm:closeDetail">✕</button>'
      + "</div></div>"
      + tabHtml
      + body
      + "</div>";
  }

  /* ─── Overview tab: member table ────────────────────────────────────── */

  function tableHtml(list) {
    var filtered = stageFilter ? list.filter(function (m) { return m.developmentStage === stageFilter; }) : list;

    // Stage filter chips
    var filterBar = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center">'
      + '<span style="font-size:11px;color:var(--text-3)">Filter:</span>'
      + '<button type="button" data-act="tm:filter:" style="font-size:11px;padding:3px 9px;border-radius:20px;border:1px solid ' + (!stageFilter ? "var(--accent)" : "var(--line)") + ';background:' + (!stageFilter ? "var(--accent-soft)" : "none") + ';color:' + (!stageFilter ? "var(--accent)" : "var(--text-3)") + ';cursor:pointer">All (' + list.length + ")</button>"
      + STAGES.map(function (s) {
        var cnt = list.filter(function (m) { return m.developmentStage === s.key; }).length;
        var active = stageFilter === s.key;
        return '<button type="button" data-act="tm:filter:' + esc(s.key) + '" style="font-size:11px;padding:3px 9px;border-radius:20px;border:1px solid ' + (active ? s.color : "var(--line)") + ';background:' + (active ? s.color + "20" : "none") + ';color:' + (active ? s.color : "var(--text-3)") + ';cursor:pointer">'
          + esc(s.dLevel) + " (" + cnt + ")</button>";
      }).join("")
      + "</div>";

    if (filtered.length === 0) {
      return filterBar + '<div class="empty">No members match this filter.</div>';
    }

    var rows = filtered.map(function (m) {
      var eng = getMemberEngagement(m.id);
      var isDetail = detailId === m.id;
      return "<tr" + (isDetail ? ' style="background:var(--accent-soft)"' : "") + ">"
        + '<td><button type="button" class="btn btn-sm" data-act="tm:detail:' + esc(m.id) + '" style="font-weight:600;color:var(--text);text-align:left">' + esc(m.name) + "</button></td>"
        + '<td style="font-size:12px;color:var(--text-2)">' + esc(m.role || "—") + "</td>"
        + '<td style="font-size:12px;color:var(--text-2)">' + esc(m.team || "—") + "</td>"
        + "<td>" + stageBadge(m.developmentStage) + "</td>"
        + "<td>" + engagementPill(eng, m.developmentStage) + "</td>"
        + '<td style="font-size:11px;color:var(--text-3)">' + esc(m.createdAt || "—") + "</td>"
        + "</tr>";
    }).join("");

    return filterBar
      + '<div class="table-wrap"><table class="table">'
      + "<thead><tr>"
      + "<th>Name</th><th>Role</th><th>Team</th>"
      + "<th>Stage</th><th>Engagement</th><th>Added</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* ─── Engagement tab: all members overview ──────────────────────────── */

  function engagementTabHtml(list) {
    if (!list.length) return '<div class="empty">No team members yet.</div>';

    var rows = list.map(function (m) {
      var eng = getMemberEngagement(m.id);
      var risks = engagementRisk(eng, m.developmentStage);
      var stage = getStage(m.developmentStage);
      var threshold1on1 = (m.developmentStage === "directing" || m.developmentStage === "coaching") ? 7 : 14;

      function bar(days, threshold) {
        if (days === null) return '<span style="font-size:11px;color:var(--risk)">Never</span>';
        var pct = Math.min(100, Math.round(days / threshold * 100));
        var color = days > threshold ? "var(--risk)" : days > threshold * 0.7 ? "var(--warn)" : "var(--ok)";
        return '<div style="display:flex;align-items:center;gap:6px">'
          + '<div style="width:60px;height:5px;background:var(--surface-2);border-radius:3px;overflow:hidden">'
          + '<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:3px"></div></div>'
          + '<span style="font-size:11px;color:' + color + '">' + days + "d</span></div>";
      }

      return '<tr>'
        + '<td><button type="button" class="btn btn-sm" data-act="tm:detail:' + esc(m.id) + '" style="font-weight:600;color:var(--text)">' + esc(m.name) + "</button></td>"
        + '<td><span style="font-size:11px;font-weight:600;color:' + (stage ? stage.color : "var(--text-3)") + '">' + esc(stage ? stage.dLevel : "—") + "</span></td>"
        + "<td>" + bar(eng.days1on1, threshold1on1) + "</td>"
        + "<td>" + bar(eng.daysRec, 30) + "</td>"
        + '<td style="font-size:12px;text-align:center">' + eng.activeDelegations + "</td>"
        + '<td>'
        + (risks.includes("1:1") ? '<button type="button" class="btn btn-sm" data-act="tm:goto:oneOnOnes:' + esc(m.id) + '" style="font-size:11px">Log 1:1</button> ' : "")
        + (risks.includes("recognition") ? '<button type="button" class="btn btn-sm" data-act="tm:goto:recognitions:' + esc(m.id) + '" style="font-size:11px">Recognise</button>' : "")
        + (risks.length === 0 ? '<span style="font-size:11px;color:var(--ok)">✓</span>' : "")
        + "</td>"
        + "</tr>";
    }).join("");

    return '<div class="table-wrap"><table class="table">'
      + "<thead><tr><th>Member</th><th>Stage</th><th>1:1 Recency</th><th>Recognition</th><th>Active Dels</th><th>Action</th></tr></thead>"
      + "<tbody>" + rows + "</tbody></table></div>";
  }

  /* ─── Team Composition tab ──────────────────────────────────────────── */

  function compositionTabHtml(list) {
    if (!list.length) return '<div class="empty">No team members yet.</div>';
    var comp = getTeamComposition();
    if (!comp) return "";

    var bars = STAGES.map(function (s) {
      var cnt = comp.dist[s.key] || 0;
      var pct = comp.total ? Math.round(cnt / comp.total * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
        + '<div style="width:80px;font-size:12px;font-weight:600;color:' + s.color + '">' + esc(s.dLevel) + "</div>"
        + '<div style="flex:1;height:18px;background:var(--surface-2);border-radius:4px;overflow:hidden">'
        + '<div style="width:' + pct + '%;height:100%;background:' + s.color + ';border-radius:4px;transition:width .3s"></div>'
        + "</div>"
        + '<div style="font-size:12px;color:var(--text-2);width:60px;text-align:right">' + cnt + " (" + pct + "%)</div>"
        + "</div>";
    }).join("");

    var alerts = [];
    if (comp.total > 2 && comp.percentSupervised > 70) {
      alerts.push({ color: "var(--warn)", msg: "High supervision load: " + comp.percentSupervised + "% of your team is D1/D2. This is sustainable short-term but should resolve as members develop." });
    }
    if (comp.allHighConcern && comp.total > 2) {
      alerts.push({ color: "var(--warn)", msg: "All members in D1/D2 — no autonomous contributors. Check if development plans are in place." });
    }
    if (comp.allLowConcern && comp.total > 2) {
      alerts.push({ color: "var(--info)", msg: "All members D3/D4. Excellent autonomy — are you giving enough growth challenge to avoid stagnation?" });
    }

    // Members by stage
    var membersByStage = STAGES.map(function (s) {
      var members = list.filter(function (m) { return m.developmentStage === s.key; });
      if (!members.length) return "";
      return '<div style="margin-bottom:14px">'
        + '<div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:' + s.color + ';margin-bottom:6px">'
        + esc(s.dLevel + " — " + L(s.label.da, s.label.en).toUpperCase()) + "</div>"
        + '<div style="font-size:12px;color:var(--text-3);margin-bottom:6px">' + esc(L(s.coachingTip.da, s.coachingTip.en)) + "</div>"
        + members.map(function (m) {
          return '<span style="display:inline-flex;align-items:center;gap:4px;background:' + s.color + '15;border:1px solid ' + s.color + '30;border-radius:20px;padding:3px 10px;font-size:12px;margin:2px;cursor:pointer" data-act="tm:detail:' + esc(m.id) + '">'
            + esc(m.name) + "</span>";
        }).join("")
        + "</div>";
    }).join("");

    return '<div style="display:flex;flex-direction:column;gap:16px">'
      + (alerts.length ? alerts.map(function (a) {
        return '<div style="background:' + a.color + '15;border:1px solid ' + a.color + '40;border-radius:6px;padding:10px 12px;font-size:13px;color:var(--text-2)">'
          + "⚡ " + esc(a.msg) + "</div>";
      }).join("") : "")
      + '<div class="card" style="padding:16px">'
      + '<div style="font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text-3);margin-bottom:12px">STAGE DISTRIBUTION (' + comp.total + " members)</div>"
      + bars
      + '<div style="display:flex;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">'
      + '<div style="font-size:12px;color:var(--text-2)">Supervision needed: <strong>' + comp.supervisoryLoad + " (" + comp.percentSupervised + "%)</strong></div>"
      + '<div style="font-size:12px;color:var(--text-2)">High autonomy: <strong>' + comp.highAutonomy + "</strong></div>"
      + "</div></div>"
      + membersByStage
      + "</div>";
  }

  /* ─── Main tab bar ──────────────────────────────────────────────────── */

  function tabBarHtml() {
    var tabs = [
      { key: "overview", label: "Overview" },
      { key: "engagement", label: "Engagement Radar" },
      { key: "composition", label: "Team Composition" }
    ];
    return '<div style="display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:16px">'
      + tabs.map(function (t) {
        var active = activeTab === t.key;
        return '<button type="button" data-act="tm:tab:' + esc(t.key) + '" style="padding:8px 14px;font-size:13px;font-weight:' + (active ? "600" : "400") + ';color:' + (active ? "var(--accent)" : "var(--text-3)") + ';background:none;border:none;border-bottom:2px solid ' + (active ? "var(--accent)" : "transparent") + ';cursor:pointer;margin-bottom:-1px">'
          + esc(t.label) + "</button>";
      }).join("")
      + "</div>";
  }

  /* ─── Root view ─────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">Data layer not loaded.</div>';
    var list = c.members();
    var editing = editingId ? c.getMember(editingId) : null;
    var detail = detailId ? c.getMember(detailId) : null;

    var out = '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px">'
      + '<div>'
      + '<h3 style="margin:0;font-size:15px;font-weight:700">Team Members</h3>'
      + '<div style="font-size:12px;color:var(--text-3);margin-top:2px">' + list.length + " member" + (list.length !== 1 ? "s" : "") + " · SLII development tracking</div>"
      + "</div>"
      + '<button type="button" class="btn btn-primary" data-act="tm:add">+ Add member</button>'
      + "</div>";

    if (formOpen || editing) { out += formHtml(editing); }
    if (detail) { out += detailHtml(detail); }

    out += tabBarHtml();

    if (activeTab === "overview") out += tableHtml(list);
    else if (activeTab === "engagement") out += engagementTabHtml(list);
    else if (activeTab === "composition") out += compositionTabHtml(list);

    return out;
  }

  /* ─── Wiring ────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"));
      });
    }
    var form = container.querySelector("#tmForm");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        saveForm(container);
      });
      // Live coaching tip update when stage changes
      var stageSelect = container.querySelector("#tmStage");
      if (stageSelect) {
        stageSelect.addEventListener("change", function () {
          // Re-render form to show/hide tip without losing values
          var nameEl = container.querySelector("#tmName");
          var roleEl = container.querySelector("#tmRole");
          var teamEl = container.querySelector("#tmTeam");
          var motEl = container.querySelector("#tmMotivators");
          var commEl = container.querySelector("#tmCommStyle");
          var notesEl = container.querySelector("#tmNotes");
          // Patch the editingId's in-memory object temporarily for re-render
          // just update the form area by direct DOM replacement
          var tip = container.querySelector(".form-tip");
          var stageKey = stageSelect.value;
          var stage = getStage(stageKey);
          if (tip) {
            tip.textContent = stage ? "📋 " + L(stage.approach.da, stage.approach.en) : "";
          } else if (stage) {
            var insertAfter = stageSelect.closest("label");
            if (insertAfter) {
              var div = document.createElement("div");
              div.className = "form-tip";
              div.style.cssText = "grid-column:1/-1;font-size:12px;color:var(--text-2);background:var(--surface-2);border-radius:6px;padding:8px 10px;line-height:1.5";
              div.textContent = "📋 " + L(stage.approach.da, stage.approach.en);
              insertAfter.after(div);
            }
          }
        });
      }
    }
  }

  function saveForm(container) {
    var c = core();
    if (!c) return;
    function val(sel) {
      var el = container.querySelector(sel);
      return el && el.value != null ? String(el.value).trim() : "";
    }
    var name = val("#tmName");
    if (!name) { formError = "Name is required."; rerender(); return; }
    var newStage = val("#tmStage");

    if (editingId) {
      var all = c.members();
      var updated = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === editingId) {
          var prevStage = all[i].developmentStage;
          var history = all[i].stageHistory || [];
          // Log stage change
          if (newStage && newStage !== prevStage) {
            history.push({ date: todayISO(), stage: newStage });
          }
          updated = {
            id: all[i].id,
            name: name,
            role: val("#tmRole"),
            team: val("#tmTeam"),
            developmentStage: newStage,
            motivators: val("#tmMotivators"),
            communicationStyle: val("#tmCommStyle"),
            notes: val("#tmNotes"),
            stageHistory: history,
            createdAt: all[i].createdAt || todayISO()
          };
          all[i] = updated;
          break;
        }
      }
      c.saveMembers(all);
      if (updated) c.registerTeamMember(updated);
    } else {
      var member = {
        id: uid("tm"),
        name: name,
        role: val("#tmRole"),
        team: val("#tmTeam"),
        developmentStage: newStage,
        motivators: val("#tmMotivators"),
        communicationStyle: val("#tmCommStyle"),
        notes: val("#tmNotes"),
        stageHistory: newStage ? [{ date: todayISO(), stage: newStage }] : [],
        createdAt: todayISO()
      };
      var list = c.members();
      list.push(member);
      c.saveMembers(list);
      c.registerTeamMember(member);
    }
    editingId = null;
    formOpen = false;
    formError = null;
    rerender();
  }

  function handle(act) {
    if (!act || act.indexOf("tm:") !== 0) return;
    var c = core();
    if (!c) return;

    if (act === "tm:add") { formOpen = true; editingId = null; formError = null; rerender(); return; }
    if (act === "tm:cancel") { editingId = null; formOpen = false; formError = null; rerender(); return; }
    if (act === "tm:closeDetail") { detailId = null; rerender(); return; }

    if (act.indexOf("tm:tab:") === 0) { activeTab = act.slice(7); rerender(); return; }
    if (act.indexOf("tm:dtab:") === 0) { detailTab = act.slice(8); rerender(); return; }
    if (act.indexOf("tm:filter:") === 0) { stageFilter = act.slice(10); rerender(); return; }

    if (act.indexOf("tm:detail:") === 0) {
      detailId = act.slice(10);
      detailTab = "profile";
      rerender();
      return;
    }
    if (act.indexOf("tm:edit:") === 0) {
      editingId = act.slice(8);
      formOpen = true;
      formError = null;
      detailId = null;
      rerender();
      return;
    }
    if (act.indexOf("tm:delete:") === 0) {
      var id = act.slice(10);
      var member = c.getMember(id);
      if (!member) return;
      var ok = true;
      try { if (typeof confirm === "function") ok = confirm("Delete " + member.name + "? This does not remove their 1:1 or recognition records."); } catch (_) {}
      if (!ok) return;
      c.saveMembers(c.members().filter(function (m) { return m.id !== id; }));
      if (editingId === id) editingId = null;
      if (detailId === id) detailId = null;
      rerender();
      return;
    }
    // Cross-module navigation: "tm:goto:oneOnOnes:memberId"
    if (act.indexOf("tm:goto:") === 0) {
      var parts = act.split(":");
      var module = parts[2];   // "oneOnOnes" | "recognitions" | "delegations"
      var memberId = parts[3];
      // Store pending context so target module can pre-select this member
      try { localStorage.setItem("lc:pendingMemberId", memberId); } catch (_) {}
      if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate(module);
      return;
    }
  }

  /* ─── Navigation entry point ─────────────────────────────────────────── */

  function open(opts) {
    if (opts && opts.memberId) {
      detailId = opts.memberId;
      detailTab = opts.tab || "engagement";
    }
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("teamMembers");
  }

  /* ─── Public API ─────────────────────────────────────────────────────── */

  var API = {
    viewHtml: viewHtml,
    bind: bind,
    open: open,
    STAGES: STAGES,
    stageLabel: stageLabel,
    stageApproach: stageApproach,
    stageDLevel: stageDLevel,
    stageColor: stageColor,
    getMemberEngagement: getMemberEngagement,
    getTeamComposition: getTeamComposition
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCTeamMembersUI = API;
})(typeof window !== "undefined" ? window : globalThis);
