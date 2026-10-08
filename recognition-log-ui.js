/* ============================================================================
   js/recognition-log-ui.js — RECOGNITION LOG (Module 8)  v2

   localStorage key: "recognitions" (Tracker[]):
     { memberId, memberName, lastRecognitionDate,
       entries: [{ id, memberId, memberName, date, whatFor,
                   recognitionType: "public"|"private"|"written"|"peer",
                   impactLevel: "individual"|"team"|"external",
                   nominatedBy: string|"" }] }

   Rules:
     - >14 days without recognition → amber
     - >30 days → red + CRITICAL in Daily Brief
     - Recognition streak: consecutive weeks with ≥1 recognition logged
     - Team streak: all members recognized every week

   Cross-module:
     - Reads  lc:pendingMemberId  to pre-open quick-log for a specific member
     - Exports getRecognitionHealth() for Daily Brief
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  var TYPES = [
    { key: "public",  label: "Public praise (team visible)",        color: "#059669" },
    { key: "private", label: "Private acknowledgment (1:1)",         color: "#0369A1" },
    { key: "written", label: "Written commendation (formal record)", color: "#7C3AED" },
    { key: "peer",    label: "Peer recognition (nominated by team)", color: "#D97706" }
  ];
  var IMPACTS = [
    { key: "individual", label: "Individual" },
    { key: "team",       label: "Team-wide visibility" },
    { key: "external",   label: "External (leadership notified)" }
  ];

  function typeLabel(key)   { for (var i=0;i<TYPES.length;i++)   if (TYPES[i].key===key) return TYPES[i].label; return key||"—"; }
  function typeColor(key)   { for (var i=0;i<TYPES.length;i++)   if (TYPES[i].key===key) return TYPES[i].color; return "var(--text-3)"; }
  function impactLabel(key) { for (var i=0;i<IMPACTS.length;i++) if (IMPACTS[i].key===key) return IMPACTS[i].label; return key||"—"; }

  /* ─── Screen state ──────────────────────────────────────────────────────── */

  var formError      = null;
  var filterMember   = "";
  var activeTab      = "overview";   // "overview" | "log" | "analysis"
  var quicklogMemberId = null;

  function rerender() {
    var container = document.getElementById("recognitionLogRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Data helpers ──────────────────────────────────────────────────────── */

  function recognitions(c) { return c.recognitions ? c.recognitions() : []; }
  function saveRecognitions(c, list) {
    if (c.saveRecognitions) c.saveRecognitions(list);
    else { try { localStorage.setItem("recognitions", JSON.stringify(list)); } catch(_) {} }
  }

  function daysSince(dateStr) {
    var c = core(); if (!c || !dateStr) return null;
    return c.daysSince ? c.daysSince(dateStr) : Math.floor((new Date(c.todayISO()) - new Date(dateStr)) / 86400000);
  }

  function urgencyColor(days) {
    if (days === null || days > 30) return "#DC2626";
    if (days > 14) return "#D97706";
    return "#059669";
  }
  function urgencyLabel(days) {
    if (days === null) return "Never — Critical";
    if (days > 30) return days + "d — Critical";
    if (days > 14) return days + "d — Due";
    return days + "d — OK";
  }

  function weekKeyOf(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr); d.setHours(12);
    var jan4 = new Date(d.getFullYear(), 0, 4);
    var sow = new Date(jan4); sow.setDate(jan4.getDate() - jan4.getDay() + 1);
    var wn = Math.floor((d - sow) / (7 * 86400000)) + 1;
    var yr = d.getFullYear();
    if (wn < 1) { yr--; wn = 52; }
    return yr + "-W" + (wn < 10 ? "0" : "") + wn;
  }

  function memberStreak(entries) {
    /* consecutive calendar weeks with at least one entry, counting back from this week */
    if (!entries || !entries.length) return 0;
    var d = new Date(); d.setHours(12);
    var streak = 0;
    var weekSet = {};
    entries.forEach(function(e){ weekSet[weekKeyOf(e.date)] = true; });
    for (var i = 0; i < 52; i++) {
      var jan4 = new Date(d.getFullYear(), 0, 4);
      var sow = new Date(jan4); sow.setDate(jan4.getDate() - jan4.getDay() + 1);
      var wn = Math.floor((d - sow) / (7 * 86400000)) + 1;
      var yr = d.getFullYear(); if (wn < 1) { yr--; wn = 52; }
      var wk = yr + "-W" + (wn < 10 ? "0" : "") + wn;
      if (weekSet[wk]) { streak++; } else { break; }
      d.setDate(d.getDate() - 7);
    }
    return streak;
  }

  function teamStreak(c, trackers) {
    var members = c.members ? c.members() : [];
    if (!members.length) return 0;
    var weeksByMember = {};
    members.forEach(function(m){ weeksByMember[m.id] = {}; });
    trackers.forEach(function(t) {
      (t.entries||[]).forEach(function(e) {
        var wk = weekKeyOf(e.date);
        if (weeksByMember[e.memberId]) weeksByMember[e.memberId][wk] = true;
      });
    });
    var streak = 0;
    var d = new Date(); d.setHours(12);
    for (var i = 0; i < 26; i++) {
      var jan4 = new Date(d.getFullYear(), 0, 4);
      var sow = new Date(jan4); sow.setDate(jan4.getDate() - jan4.getDay() + 1);
      var wn = Math.floor((d - sow) / (7 * 86400000)) + 1;
      var yr = d.getFullYear(); if (wn < 1) { yr--; wn = 52; }
      var wk = yr + "-W" + (wn < 10 ? "0" : "") + wn;
      var allHave = members.every(function(m){ return !!weeksByMember[m.id][wk]; });
      if (allHave) { streak++; } else { break; }
      d.setDate(d.getDate() - 7);
    }
    return streak;
  }

  /* ─── Cross-module health export for Daily Brief ────────────────────────── */

  function getRecognitionHealth() {
    var c = core(); if (!c) return null;
    var members = c.members ? c.members() : [];
    var trackers = recognitions(c);
    var critical = 0; var due = 0; var ok = 0;
    members.forEach(function(m) {
      var t = trackers.filter(function(tr){ return tr.memberId===m.id; })[0];
      var last = t ? t.lastRecognitionDate : null;
      var days = daysSince(last);
      if (days === null || days > 30) critical++;
      else if (days > 14) due++;
      else ok++;
    });
    return { total: members.length, critical: critical, due: due, ok: ok, teamStreak: teamStreak(c, trackers) };
  }

  /* ─── KPI bar ───────────────────────────────────────────────────────────── */

  function kpisHtml(c) {
    var members = c.members ? c.members() : [];
    var trackers = recognitions(c);
    var health = getRecognitionHealth() || { critical: 0, due: 0, ok: members.length };
    var all = [];
    trackers.forEach(function(t){ (t.entries||[]).forEach(function(e){ all.push(e); }); });
    var peerCount = all.filter(function(e){ return e.recognitionType==="peer"; }).length;
    var peerPct = all.length ? Math.round(peerCount/all.length*100) : 0;
    var streak = teamStreak(c, trackers);
    return '<div class="kpi-grid" style="margin-bottom:16px">'
      + kpiCard("Never / Critical", health.critical, health.critical > 0 ? "rag-red" : "")
      + kpiCard("Due (>14d)", health.due, health.due > 0 ? "rag-amber" : "")
      + kpiCard("On track", health.ok, "")
      + kpiCard("Peer %", peerPct + "%", peerPct < 20 ? "rag-amber" : "")
      + kpiCard("Team streak", streak + "wk", streak >= 3 ? "rag-ok" : "")
      + '</div>';
  }

  function kpiCard(label, value, rag) {
    return '<div class="kpi-card' + (rag ? " " + rag : "") + '">'
      + '<div class="kpi-label">' + esc(label) + '</div>'
      + '<div class="kpi-value">' + esc(String(value)) + '</div>'
      + '</div>';
  }

  /* ─── Overview tab ──────────────────────────────────────────────────────── */

  function overviewHtml(c) {
    var members = c.members ? c.members() : [];
    if (!members.length) return '<div class="empty">Add team members in Team Members first.</div>';
    var trackers = recognitions(c);
    var streak = teamStreak(c, trackers);

    var streakBanner = streak > 0
      ? '<div style="background:var(--ok-soft,#ECFDF5);border-left:3px solid var(--ok);border-radius:var(--r);padding:10px 14px;margin-bottom:14px">'
        + '🔥 <strong>' + streak + '-week streak</strong> — every team member recognized every week for ' + streak + ' week' + (streak!==1?"s":"") + ' in a row.'
        + '</div>'
      : "";

    var rows = members.map(function(m) {
      var t = trackers.filter(function(tr){ return tr.memberId===m.id; })[0];
      var last = t ? t.lastRecognitionDate : null;
      var days = daysSince(last);
      var color = urgencyColor(days);
      var entries = t ? (t.entries||[]) : [];
      var typeCounts = {}; TYPES.forEach(function(tp){ typeCounts[tp.key]=0; });
      entries.forEach(function(e){ if(typeCounts[e.recognitionType]!==undefined) typeCounts[e.recognitionType]++; });
      var mStreak = memberStreak(entries);
      var typeBar = TYPES.map(function(tp) {
        var n = typeCounts[tp.key];
        if (!n) return "";
        return '<span title="' + esc(typeLabel(tp.key)) + ': ' + n + '" style="display:inline-block;width:' + Math.min(n*10,44) + 'px;height:6px;border-radius:2px;background:'+tp.color+';margin-right:2px"></span>';
      }).join("");
      return "<tr>"
        + "<td><strong>" + esc(m.name) + "</strong></td>"
        + "<td>" + esc(last || "Never") + "</td>"
        + '<td><strong style="color:' + color + '">' + esc(urgencyLabel(days)) + "</strong></td>"
        + '<td>' + (typeBar || '<span style="color:var(--text-3)">none</span>') + ' <span style="color:var(--text-3);font-size:12px">' + entries.length + " total</span></td>"
        + "<td>" + (mStreak > 1 ? "🔥 " + mStreak + "wk" : '<span style="color:var(--text-3)">—</span>') + "</td>"
        + '<td><button class="btn btn-sm btn-primary" data-act="rl:quicklog:'+esc(m.id)+'">+ Recognize</button></td>'
        + "</tr>";
    }).join("");

    var legend = TYPES.map(function(t){
      return '<span style="display:inline-block;width:10px;height:6px;border-radius:2px;background:'+t.color+';margin-right:4px;vertical-align:middle"></span>' + esc(t.label.split(" ")[0]);
    }).join(" · ");

    return streakBanner
      + '<div class="table-wrap"><table class="table"><thead><tr>'
      + "<th>Member</th><th>Last recognized</th><th>Status</th><th>Type balance</th><th>Streak</th><th></th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>"
      + '<div style="font-size:11px;color:var(--text-3);margin-top:8px">' + legend + '</div>';
  }

  /* ─── Log form ──────────────────────────────────────────────────────────── */

  function formHtml(c, prefillMemberId) {
    var members = c.members ? c.members() : [];
    var today = c.todayISO ? c.todayISO() : new Date().toISOString().slice(0,10);
    var memberOptions = '<option value="">— Select member —</option>'
      + members.map(function(m) {
          return '<option value="'+esc(m.id)+'"'+(prefillMemberId===m.id?" selected":"")+">"+esc(m.name)+"</option>";
        }).join("");
    var typeOptions  = TYPES.map(function(t){ return '<option value="'+t.key+'">'+esc(t.label)+"</option>"; }).join("");
    var impactOptions = IMPACTS.map(function(i){ return '<option value="'+i.key+'">'+esc(i.label)+"</option>"; }).join("");

    return '<div class="card info-card" style="margin-bottom:12px">'
      + '<h4>Log recognition</h4>'
      + '<form id="rlForm" class="form-grid">'
      + '<label>Member<select id="rlMember">' + memberOptions + "</select></label>"
      + '<label>Date<input type="date" id="rlDate" value="' + esc(today) + '"></label>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      + '<label>Recognition type<select id="rlType">' + typeOptions + "</select></label>"
      + '<label>Impact level<select id="rlImpact">' + impactOptions + "</select></label>"
      + "</div>"
      + '<label>What specifically are you recognizing?<textarea id="rlWhat" rows="3" maxlength="600" required placeholder="e.g. Took full ownership of the compliance audit, ran it independently, delivered on time despite unexpected scope changes."></textarea></label>'
      + '<label>Nominated by / witnessed by <small style="font-weight:400;color:var(--text-3)">(for peer recognition — leave blank if manager-initiated)</small><input type="text" id="rlNominatedBy" maxlength="100" placeholder="e.g. Alex Chen, or leave blank"></label>'
      + '<button class="btn btn-primary" type="submit">Save recognition</button>'
      + "</form>"
      + (formError ? '<div style="color:var(--danger-text);font-size:13px;margin-top:6px">⚠ ' + esc(formError) + "</div>" : "")
      + "</div>";
  }

  /* ─── History tab ───────────────────────────────────────────────────────── */

  function historyHtml(c) {
    var trackers = recognitions(c);
    var all = [];
    trackers.forEach(function(t){ (t.entries||[]).forEach(function(e){ if(e) all.push(e); }); });
    if (filterMember) all = all.filter(function(e){ return e.memberId===filterMember; });
    all.sort(function(a,b){ return String(b.date||"").localeCompare(String(a.date||"")); });

    var members = c.members ? c.members() : [];
    var memberOpts = '<option value="">All members</option>'
      + members.map(function(m){ return '<option value="'+esc(m.id)+'"'+(filterMember===m.id?" selected":"")+">"+esc(m.name)+"</option>"; }).join("");

    var filterBar = '<div style="margin-bottom:12px">'
      + '<label style="font-size:12px">Filter by member: <select id="rlFilterMember" style="margin-left:6px">' + memberOpts + "</select></label>"
      + "</div>";

    if (!all.length) return filterBar + '<div class="empty">No recognitions logged yet.</div>';

    var cards = all.map(function(e) {
      var tColor = typeColor(e.recognitionType);
      return '<div style="border:1px solid var(--line);border-left:4px solid '+tColor+';border-radius:var(--r);padding:12px 14px;margin-bottom:8px">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;margin-bottom:6px">'
        + '<strong>' + esc(e.memberName||"—") + '</strong>'
        + '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
        + '<span class="badge" style="background:'+tColor+'20;color:'+tColor+'">' + esc(typeLabel(e.recognitionType)) + '</span>'
        + (e.impactLevel && e.impactLevel!=="individual" ? '<span class="badge b-open">' + esc(impactLabel(e.impactLevel)) + "</span>" : "")
        + '<span style="font-size:12px;color:var(--text-3)">' + esc(e.date||"—") + "</span>"
        + "</div></div>"
        + '<div style="color:var(--text-2);font-size:13px">' + esc(e.whatFor||"") + "</div>"
        + (e.nominatedBy ? '<div style="font-size:12px;color:var(--text-3);margin-top:4px">Nominated by: ' + esc(e.nominatedBy) + "</div>" : "")
        + "</div>";
    }).join("");

    return filterBar + cards;
  }

  /* ─── Analysis tab ──────────────────────────────────────────────────────── */

  function analysisHtml(c) {
    var members = c.members ? c.members() : [];
    var trackers = recognitions(c);
    var all = [];
    trackers.forEach(function(t){ (t.entries||[]).forEach(function(e){ all.push(e); }); });
    if (all.length < 2) return '<div class="empty">Log at least 2 recognitions to see analysis.</div>';

    /* Type distribution */
    var typeCounts = {}; TYPES.forEach(function(t){ typeCounts[t.key]=0; });
    all.forEach(function(e){ if(typeCounts[e.recognitionType]!==undefined) typeCounts[e.recognitionType]++; });
    var typeBreakdown = '<h4 style="margin-bottom:10px">Recognition type distribution</h4>'
      + TYPES.map(function(t) {
          var pct = Math.round((typeCounts[t.key]/all.length)*100);
          return '<div style="display:flex;align-items:center;gap:10px;margin:6px 0">'
            + '<div style="width:100px;font-size:12px;color:var(--text-2)">' + esc(t.label.split(" ")[0]) + '</div>'
            + '<div style="flex:1;background:var(--line);border-radius:2px;height:8px">'
            + '<div style="width:'+pct+'%;height:8px;background:'+t.color+';border-radius:2px"></div></div>'
            + '<div style="font-size:12px;color:var(--text-3);width:60px">' + typeCounts[t.key] + ' (' + pct + '%)</div>'
            + '</div>';
        }).join("");

    /* Member gaps */
    var memberGaps = members.map(function(m) {
      var t = trackers.filter(function(tr){ return tr.memberId===m.id; })[0];
      var last = t ? t.lastRecognitionDate : null;
      return { name: m.name, days: daysSince(last) };
    }).sort(function(a,b){ return (b.days===null?9999:b.days) - (a.days===null?9999:a.days); });

    var gapChart = '<h4 style="margin:16px 0 10px">Time since last recognition (longest gaps first)</h4>'
      + memberGaps.map(function(g) {
          var color = urgencyColor(g.days);
          var w = g.days === null ? 100 : Math.min(g.days/60*100, 100);
          return '<div style="display:flex;align-items:center;gap:10px;margin:5px 0">'
            + '<div style="width:120px;font-size:13px">' + esc(g.name) + '</div>'
            + '<div style="flex:1;background:var(--line);border-radius:2px;height:7px">'
            + '<div style="width:'+w+'%;height:7px;background:'+color+';border-radius:2px"></div></div>'
            + '<div style="font-size:12px;width:80px;color:'+color+'">' + (g.days===null?"never":g.days+"d ago") + '</div>'
            + '</div>';
        }).join("");

    /* Rate & peer pct */
    var earliest = all.reduce(function(a,e){ return !a||e.date<a?e.date:a; }, "");
    var latest   = all.reduce(function(a,e){ return e.date>a?e.date:a; }, "");
    var totalWeeks = earliest && latest ? Math.max(1, Math.ceil((new Date(latest)-new Date(earliest))/(7*86400000))) : 1;
    var ratePerWeek = (all.length/totalWeeks).toFixed(1);
    var peerCount = all.filter(function(e){ return e.recognitionType==="peer"; }).length;
    var peerPct = Math.round(peerCount/all.length*100);
    var streak = teamStreak(c, trackers);

    var kpis = '<div class="kpi-grid" style="margin-top:16px">'
      + kpiCard("Total logged", all.length, "")
      + kpiCard("Per week avg", ratePerWeek, "")
      + kpiCard("Peer-driven", peerPct+"%", peerPct<20?"rag-amber":"")
      + kpiCard("Team streak", streak+"wk", streak>=3?"rag-ok":"")
      + '</div>';

    var insight = '<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 14px;margin-top:14px;font-size:13px;color:var(--text-2)">'
      + '💡 '
      + (peerPct < 20
          ? "Peer recognition below 20% — most praise flows only manager-to-report. Try nudging peer-to-peer visibility (a recognition channel, a shoutout ritual)."
          : "Peer recognition looks healthy. Keep nurturing a culture where team members recognize each other.")
      + (streak === 0 ? " Team streak is 0 — at least one person went unrecognized last week." : "")
      + "</div>";

    return typeBreakdown + gapChart + kpis + insight;
  }

  /* ─── Main view ─────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">Data layer not loaded.</div>';

    /* Cross-module: pre-open quick-log for a pending member */
    var pending = "";
    try { pending = localStorage.getItem("lc:pendingMemberId") || ""; } catch(_) {}
    if (pending && !quicklogMemberId) {
      quicklogMemberId = pending;
      activeTab = "overview";
      try { localStorage.removeItem("lc:pendingMemberId"); } catch(_) {}
    }

    var members  = c.members ? c.members() : [];
    var trackers = recognitions(c);
    var criticalMembers = members.filter(function(m) {
      var t = trackers.filter(function(tr){ return tr.memberId===m.id; })[0];
      var days = daysSince(t ? t.lastRecognitionDate : null);
      return days === null || days > 30;
    });

    var alert = criticalMembers.length > 0
      ? '<div style="background:#FEF2F2;border-left:4px solid #DC2626;border-radius:var(--r);padding:10px 14px;margin-bottom:14px">'
        + '<strong style="color:#DC2626">⚑ ' + criticalMembers.length + ' member' + (criticalMembers.length!==1?"s":"") + ' not recognized in 30+ days: '
        + criticalMembers.map(function(m){ return esc(m.name); }).join(", ")
        + "</strong></div>"
      : "";

    var tabBar = '<div style="display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:16px">'
      + '<button class="tab-btn'+(activeTab==="overview"?" active":"")+'" data-act="rl:tab:overview">Overview</button>'
      + '<button class="tab-btn'+(activeTab==="log"?" active":"")+'" data-act="rl:tab:log">Log + History</button>'
      + '<button class="tab-btn'+(activeTab==="analysis"?" active":"")+'" data-act="rl:tab:analysis">Analysis</button>'
      + "</div>";

    var out = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">'
      + '<h2 style="margin:0">Recognition Log</h2></div>'
      + alert + kpisHtml(c) + tabBar;

    if (activeTab === "overview") {
      out += overviewHtml(c);
      if (quicklogMemberId) {
        out += '<div style="margin-top:16px"><h4>Quick-log for selected member</h4></div>';
        out += formHtml(c, quicklogMemberId);
      }
    } else if (activeTab === "log") {
      out += formHtml(c, null) + "<h4 style='margin-top:20px;margin-bottom:12px'>History</h4>" + historyHtml(c);
    } else {
      out += analysisHtml(c);
    }
    return out;
  }

  /* ─── Event wiring ──────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function(ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"));
      });
      container.addEventListener("change", function(ev) {
        var t = ev.target; if (!t || !t.id) return;
        if (t.id === "rlFilterMember") { filterMember = t.value; rerender(); }
      });
    }

    var form = container.querySelector("#rlForm");
    if (form) {
      form.addEventListener("submit", function(ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var val = function(sel) { var el = container.querySelector(sel); return el ? String(el.value||"").trim() : ""; };
        var memberId = val("#rlMember");
        if (!memberId) { formError = "Select a team member."; rerender(); return; }
        var what = val("#rlWhat");
        if (!what) { formError = "Describe what the recognition is for — specificity makes it land."; rerender(); return; }
        var date = val("#rlDate") || c.todayISO();
        var memberName = ""; (c.members?c.members():[]).forEach(function(m){ if(m.id===memberId) memberName=m.name; });
        var trackers = recognitions(c);
        var tracker = null;
        for (var i=0;i<trackers.length;i++) { if(trackers[i].memberId===memberId){ tracker=trackers[i]; break; } }
        if (!tracker) { tracker={memberId:memberId,memberName:memberName,lastRecognitionDate:null,entries:[]}; trackers.push(tracker); }
        tracker.entries = tracker.entries || [];
        tracker.entries.push({
          id: c.uid ? c.uid("rec") : "rec_"+Date.now(),
          memberId: memberId, memberName: memberName, date: date,
          whatFor: what, recognitionType: val("#rlType")||"private",
          impactLevel: val("#rlImpact")||"individual", nominatedBy: val("#rlNominatedBy")
        });
        if (!tracker.lastRecognitionDate || String(date) > String(tracker.lastRecognitionDate)) {
          tracker.lastRecognitionDate = date;
        }
        saveRecognitions(c, trackers);
        formError = null; quicklogMemberId = null;
        rerender();
      });
    }
  }

  function handle(act) {
    if (!act || act.indexOf("rl:") !== 0) return;
    if (act.indexOf("rl:tab:") === 0) { activeTab=act.slice(7); quicklogMemberId=null; rerender(); return; }
    if (act.indexOf("rl:quicklog:") === 0) { activeTab="overview"; quicklogMemberId=act.slice(12); rerender(); }
  }

  /* ─── Public API ─────────────────────────────────────────────────────────── */

  function open(opts) {
    if (opts && opts.memberId) { quicklogMemberId=opts.memberId; activeTab="overview"; }
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("recognitionLog");
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, typeLabel: typeLabel, getRecognitionHealth: getRecognitionHealth };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCRecognitionLogUI = API;

})(typeof window !== "undefined" ? window : globalThis);
