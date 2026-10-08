/* ============================================================================
   js/delegation-tracker-ui.js — DELEGATION TRACKER (Module 4)  v2

   localStorage key: "delegations" (DelegationRecord[]):

     { id, taskName, delegatedTo, delegatedToName, delegatedDate, deadline,
       status: "active"|"completed"|"escalated",
       complexity: 1-5, developmentIntent: "skill"|"capacity"|"stretch",
       lastUpdateDate, completionQuality: 1-5|null,
       notes, checkIns: [{id, date, note, raisedFlag}] }

   Cross-module:
     - Reads  lc:pendingMemberId  to pre-fill assignee from Team Members
     - Reads  member.developmentStage  (D1-D4) for SLII coaching guidance
     - Exports getDelegationHealth() consumed by Daily Brief
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  /* ─── SLII delegation guidance by development stage ─────────────────────── */

  var SLII_DELEG = {
    "D1": {
      label: "Directing (D1)", color: "#EF4444",
      guidance: "Step-by-step checkpoints. Define exact deliverable, timeline, and check-in cadence upfront. Over-communicate at first.",
      checkIn: "Check in every 2-3 days. Ask: 'What have you done so far? What's next?' Review output before sign-off.",
      avoid: "Avoid vague briefs or long gaps. D1 needs frequent course-correction."
    },
    "D2": {
      label: "Coaching (D2)", color: "#F59E0B",
      guidance: "Explain the why. Provide guidance when asked but encourage problem-solving. Recognize effort even when execution is rough.",
      checkIn: "Weekly check-ins. Ask: 'What obstacles are you hitting? What options have you considered?'",
      avoid: "Don't rescue too quickly — let them struggle productively first."
    },
    "D3": {
      label: "Supporting (D3)", color: "#3B82F6",
      guidance: "Agree on outcome and let them choose method. Be available for support but don't volunteer it unsolicited.",
      checkIn: "Biweekly check-ins. Ask: 'What support would help? Are you on track for the deadline?'",
      avoid: "Don't over-supervise — it signals distrust and erodes confidence."
    },
    "D4": {
      label: "Delegating (D4)", color: "#10B981",
      guidance: "Outcome only. Set the goal, agree the deadline, then stay out of the way. Review results, not activities.",
      checkIn: "Check-in at milestone or on-request only. Ask: 'Anything I should know about?'",
      avoid: "Micro-managing a D4 is the fastest way to lose them."
    }
  };

  /* ─── Screen state ──────────────────────────────────────────────────────── */

  var activeTab        = "list";   // "list" | "load"
  var editingId        = null;
  var formOpen         = false;
  var checkInOpenId    = null;
  var checkInError     = null;
  var completingId     = null;
  var formError        = null;
  var filterPerson     = "";
  var filterStatus     = "";
  var filterOverdueOnly = false;
  var prefillAssignee  = "";

  function rerender() {
    var container = document.getElementById("delegationRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Record helpers ────────────────────────────────────────────────────── */

  function delegations(c) { return c.delegations ? c.delegations() : []; }
  function saveDelegations(c, list) {
    if (c.saveDelegations) c.saveDelegations(list);
    else { try { localStorage.setItem("delegations", JSON.stringify(list)); } catch(_) {} }
  }

  function isSilent(d, c) {
    if (String(d.status||"active") !== "active") return false;
    var today = c.todayISO();
    var checkIns = (d.checkIns || []);
    var lastActivity = checkIns.length
      ? checkIns[checkIns.length - 1].date
      : (d.lastUpdateDate || d.delegatedDate || "");
    if (!lastActivity) return true;
    var gap = c.daysSince ? c.daysSince(lastActivity) : Math.floor((new Date(today) - new Date(lastActivity)) / 86400000);
    return gap >= 3;
  }

  function isOverdue(d, c) {
    if (!d.deadline || String(d.status||"active") === "completed") return false;
    return d.deadline < c.todayISO();
  }

  function daysSilent(d, c) {
    var checkIns = (d.checkIns || []);
    var lastActivity = checkIns.length ? checkIns[checkIns.length-1].date : (d.lastUpdateDate || d.delegatedDate || "");
    if (!lastActivity) return null;
    return c.daysSince ? c.daysSince(lastActivity) : Math.floor((new Date(c.todayISO()) - new Date(lastActivity)) / 86400000);
  }

  function memberStage(c, memberId) {
    var stage = null;
    (c.members ? c.members() : []).forEach(function(m) {
      if (m.id === memberId && m.developmentStage) {
        stage = String(m.developmentStage).toUpperCase().slice(0,2);
      }
    });
    return stage;
  }

  /* ─── Cross-module health export for Daily Brief ────────────────────────── */

  function getDelegationHealth() {
    var c = core(); if (!c) return null;
    var list = delegations(c);
    var active    = list.filter(function(d){ return String(d.status||"active")==="active"; });
    var silent    = active.filter(function(d){ return isSilent(d,c); });
    var overdue   = list.filter(function(d){ return isOverdue(d,c); });
    var escalated = list.filter(function(d){ return String(d.status||"")==="escalated"; });
    var completed = list.filter(function(d){ return String(d.status||"")==="completed"; });
    var avgQ = null;
    var rated = completed.filter(function(d){ return d.completionQuality > 0; });
    if (rated.length) {
      var sum = 0; rated.forEach(function(d){ sum += Number(d.completionQuality)||0; });
      avgQ = Math.round((sum / rated.length) * 10) / 10;
    }
    return { active: active.length, silent: silent.length, overdue: overdue.length,
             escalated: escalated.length, completed: completed.length, avgQuality: avgQ };
  }

  /* ─── KPI bar ───────────────────────────────────────────────────────────── */

  function kpisHtml(c) {
    var list = delegations(c);
    var active    = list.filter(function(d){ return String(d.status||"active")==="active"; });
    var silent    = active.filter(function(d){ return isSilent(d,c); });
    var overdue   = list.filter(function(d){ return isOverdue(d,c); });
    var escalated = list.filter(function(d){ return String(d.status||"")==="escalated"; });
    var stretch   = list.filter(function(d){ return d.developmentIntent==="stretch"; });
    return '<div class="kpi-grid" style="margin-bottom:16px">'
      + kpiCard("Active", active.length, "")
      + kpiCard("Silent >3d", silent.length, silent.length > 0 ? "rag-amber" : "")
      + kpiCard("Overdue", overdue.length, overdue.length > 0 ? "rag-red" : "")
      + kpiCard("Escalated", escalated.length, escalated.length > 0 ? "rag-red" : "")
      + kpiCard("Stretch tasks", stretch.length, "")
      + '</div>';
  }

  function kpiCard(label, value, rag) {
    return '<div class="kpi-card' + (rag ? " " + rag : "") + '">'
      + '<div class="kpi-label">' + esc(label) + '</div>'
      + '<div class="kpi-value">' + esc(String(value)) + '</div>'
      + '</div>';
  }

  /* ─── SLII guidance card ────────────────────────────────────────────────── */

  function sliiCardHtml(stage) {
    if (!stage) return "";
    var s = SLII_DELEG[stage];
    if (!s) return "";
    return '<div style="border-left:3px solid ' + s.color + ';padding:10px 14px;background:var(--surface);border-radius:0 var(--r) var(--r) 0;margin-bottom:12px">'
      + '<div style="font-size:11px;font-weight:600;color:' + s.color + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">SLII Delegation · ' + esc(s.label) + '</div>'
      + '<div style="font-size:13px;color:var(--text-1);margin-bottom:4px"><strong>Approach:</strong> ' + esc(s.guidance) + '</div>'
      + '<div style="font-size:13px;color:var(--text-2);margin-bottom:4px"><strong>Check-in:</strong> ' + esc(s.checkIn) + '</div>'
      + '<div style="font-size:12px;color:var(--danger-text)"><strong>Avoid:</strong> ' + esc(s.avoid) + '</div>'
      + '</div>';
  }

  /* ─── Add / edit form ───────────────────────────────────────────────────── */

  function formHtml(c, editing) {
    var x = editing || {};
    var members = c.members ? c.members() : [];
    var memberOptions = '<option value="">— Assign to —</option>'
      + members.map(function(m) {
          var sel = (x.delegatedTo === m.id) || (!x.delegatedTo && prefillAssignee === m.id);
          return '<option value="' + esc(m.id) + '"' + (sel?" selected":"") + ">" + esc(m.name) + "</option>";
        }).join("");

    var today = c.todayISO ? c.todayISO() : new Date().toISOString().slice(0,10);
    var defaultDate = c.addDays ? c.addDays(today, 14) : today;
    var initialAssignee = x.delegatedTo || prefillAssignee;
    var stage = initialAssignee ? memberStage(c, initialAssignee) : null;

    return '<div class="card info-card" style="margin-bottom:12px">'
      + '<h4>' + (x.id ? "Edit delegation" : "New delegation") + "</h4>"
      + '<form id="dtForm" class="form-grid">'
      + '<label>Task name<input type="text" id="dtTask" maxlength="140" required value="' + esc(x.taskName||"") + '" placeholder="What are you delegating?"></label>'
      + '<label>Assign to<select id="dtAssignee">' + memberOptions + '</select></label>'
      + '<div id="dtSlii">' + sliiCardHtml(stage) + "</div>"
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      + '<label>Delegated date<input type="date" id="dtDelegDate" value="' + esc(x.delegatedDate||today) + '"></label>'
      + '<label>Deadline<input type="date" id="dtDeadline" value="' + esc(x.deadline||defaultDate) + '"></label>'
      + '</div>'
      + '<label>Complexity (1–5)'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + '<input type="range" id="dtComplexity" min="1" max="5" value="' + esc(x.complexity||3) + '" style="flex:1">'
      + '<output id="dtComplexityOut" style="font-weight:600;color:var(--accent)">' + esc(x.complexity||3) + '</output>'
      + '</div></label>'
      + '<label>Development intent<select id="dtIntent">'
      + '<option value="capacity"'+((!x.developmentIntent||x.developmentIntent==="capacity")?" selected":"")+">Capacity (get work done)</option>"
      + '<option value="skill"'+(x.developmentIntent==="skill"?" selected":"")+">Skill building (grow the person)</option>"
      + '<option value="stretch"'+(x.developmentIntent==="stretch"?" selected":"")+">Stretch (high growth challenge)</option>"
      + "</select></label>"
      + '<label>Notes<textarea id="dtNotes" rows="2" maxlength="600" placeholder="Context, expected outcome, constraints…">' + esc(x.notes||"") + "</textarea></label>"
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="btn btn-primary" type="submit">' + (x.id ? "Save changes" : "Add delegation") + "</button>"
      + '<button class="btn" type="button" data-act="dt:cancelForm">Cancel</button>'
      + "</div></form>"
      + (formError ? '<div style="color:var(--danger-text);margin-top:6px;font-size:13px">⚠ ' + esc(formError) + "</div>" : "")
      + "</div>";
  }

  /* ─── Completion dialog ─────────────────────────────────────────────────── */

  function completionDialogHtml(d) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      stars += '<button type="button" class="btn btn-sm" data-act="dt:quality:' + esc(d.id) + ':' + i + '" style="font-size:18px;padding:4px 10px;'
        + (Number(d.completionQuality)===i ? "background:var(--accent);color:#fff;" : "")
        + '">' + ("★".repeat(i) + "☆".repeat(5-i)) + "</button>";
    }
    return '<div class="card info-card" style="margin-bottom:12px;border-left:4px solid var(--ok)">'
      + '<h4 style="margin-bottom:8px">Mark as complete — rate completion quality</h4>'
      + '<div style="font-size:13px;color:var(--text-3);margin-bottom:12px">Quality rating builds a long-term picture of delegation effectiveness per person.</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">' + stars + "</div>"
      + '<div style="margin-top:14px;display:flex;gap:8px">'
      + '<button type="button" class="btn btn-primary" data-act="dt:confirmComplete:' + esc(d.id) + '">Confirm complete</button>'
      + '<button type="button" class="btn" data-act="dt:cancelComplete">Cancel</button>'
      + "</div></div>";
  }

  /* ─── Check-in panel ────────────────────────────────────────────────────── */

  function checkInPanelHtml(c, d) {
    var checkIns = (d.checkIns || []).slice().reverse();
    var today = c.todayISO ? c.todayISO() : new Date().toISOString().slice(0,10);
    var stage = memberStage(c, d.delegatedTo);
    return '<div class="card info-card" style="margin-bottom:12px;border-left:4px solid var(--accent)">'
      + '<h4 style="margin-bottom:8px">Check-in: ' + esc(d.taskName) + " <small style='color:var(--text-3)'>(assigned to " + esc(d.delegatedToName) + ")</small></h4>"
      + (stage ? sliiCardHtml(stage) : "")
      + '<form id="dtCheckInForm" class="form-grid">'
      + '<label>Date<input type="date" id="dtCiDate" value="' + esc(today) + '"></label>'
      + '<label>Note<textarea id="dtCiNote" rows="3" placeholder="Progress update, blocker, observation, key commitment made…"></textarea></label>'
      + '<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="dtCiFlag"> <span style="color:var(--danger-text);font-weight:600">⚑ Flag — this needs attention</span></label>'
      + '<div style="display:flex;gap:8px">'
      + '<button class="btn btn-primary" type="submit">Save check-in</button>'
      + '<button class="btn" type="button" data-act="dt:cancelCheckIn">Cancel</button>'
      + "</div></form>"
      + (checkInError ? '<div style="color:var(--danger-text);font-size:13px;margin-top:6px">' + esc(checkInError) + "</div>" : "")
      + (checkIns.length
          ? '<div style="margin-top:14px"><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Check-in history</div>'
            + checkIns.map(function(ci) {
                return '<div style="padding:8px 0;border-top:1px solid var(--line)">'
                  + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">'
                  + '<strong style="font-size:13px">' + esc(ci.date) + '</strong>'
                  + (ci.raisedFlag ? '<span style="color:var(--danger-text);font-size:11px;font-weight:600">⚑ Flagged</span>' : "")
                  + "</div>"
                  + '<div style="font-size:13px;color:var(--text-2)">' + esc(ci.note||"—") + "</div></div>";
              }).join("") + "</div>"
          : "")
      + "</div>";
  }

  /* ─── Filters ───────────────────────────────────────────────────────────── */

  function filtersHtml(c) {
    var members = c.members ? c.members() : [];
    var memberOpts = '<option value="">All members</option>'
      + members.map(function(m){ return '<option value="'+esc(m.id)+'"'+(filterPerson===m.id?" selected":"")+">"+esc(m.name)+"</option>"; }).join("");
    return '<div class="form-grid" style="margin-bottom:12px">'
      + '<label>Member<select id="dtFPerson">' + memberOpts + "</select></label>"
      + '<label>Status<select id="dtFStatus">'
      + '<option value="">All</option>'
      + '<option value="active"'+(filterStatus==="active"?" selected":"")+">Active</option>"
      + '<option value="completed"'+(filterStatus==="completed"?" selected":"")+">Completed</option>"
      + '<option value="escalated"'+(filterStatus==="escalated"?" selected":"")+">Escalated</option>"
      + "</select></label>"
      + '<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="dtFOverdue"'+(filterOverdueOnly?" checked":"")+"> Overdue only</label>"
      + "</div>";
  }

  /* ─── Helpers ───────────────────────────────────────────────────────────── */

  function intentBadge(intent) {
    if (intent === "stretch") return '<span class="badge" style="background:#7C3AED20;color:#7C3AED">Stretch</span>';
    if (intent === "skill")   return '<span class="badge" style="background:#0369A120;color:#0369A1">Skill</span>';
    return '<span class="badge b-neutral">Capacity</span>';
  }

  function complexityBar(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:2px;background:' + (i<=n?"var(--accent)":"var(--line)") + '"></span>';
    return out;
  }

  /* ─── Delegation list ───────────────────────────────────────────────────── */

  function listTabHtml(c) {
    var all = delegations(c);
    var filtered = all.filter(function(d) {
      if (filterPerson && d.delegatedTo !== filterPerson) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      if (filterOverdueOnly && !isOverdue(d, c)) return false;
      return true;
    });

    if (!filtered.length) {
      return '<div class="empty">No delegations' + (filterPerson||filterStatus||filterOverdueOnly ? " match the current filters" : " yet — add one above") + '.</div>';
    }

    var rows = filtered.map(function(d) {
      var silent  = isSilent(d, c);
      var overdue = isOverdue(d, c);
      var dSilent = daysSilent(d, c);
      var signal = "";
      if (String(d.status||"active")==="escalated") signal = '<span style="color:var(--danger-text);font-weight:600">⚑ Escalated</span>';
      else if (overdue) signal = '<span style="color:var(--danger-text)">⏰ Overdue</span>';
      else if (silent)  signal = '<span style="color:var(--warn)">🔇 Silent' + (dSilent !== null ? " "+dSilent+"d" : "") + "</span>";
      else signal = '<span style="color:var(--ok)">✓ Active</span>';
      var flaggedCi = (d.checkIns||[]).some(function(ci){ return ci.raisedFlag; });
      if (flaggedCi && signal.indexOf("Escalated") < 0) signal += ' <span style="color:var(--danger-text)" title="Check-in flagged">⚑</span>';
      var completionQ = d.completionQuality ? " " + "★".repeat(d.completionQuality) + "☆".repeat(5-d.completionQuality) : "";
      var isActive = String(d.status||"active")==="active";
      return "<tr>"
        + '<td><strong>' + esc(d.taskName||"—") + '</strong>'
        + (d.notes ? '<div style="font-size:11px;color:var(--text-3);margin-top:2px">' + esc(d.notes.slice(0,70)) + (d.notes.length>70?"…":"") + "</div>" : "")
        + "</td>"
        + "<td>" + esc(d.delegatedToName||"—") + "</td>"
        + "<td>" + esc(d.deadline||"—") + "</td>"
        + '<td><span class="badge' + (d.status==="completed"?" b-open":d.status==="escalated"?" b-critical":" b-warn") + '">' + esc(d.status||"active") + completionQ + "</span></td>"
        + "<td>" + intentBadge(d.developmentIntent) + "</td>"
        + "<td>" + complexityBar(d.complexity||1) + "</td>"
        + "<td>" + signal + "</td>"
        + '<td style="white-space:nowrap;display:flex;gap:4px;flex-wrap:wrap">'
        + (isActive ? '<button class="btn btn-sm" data-act="dt:checkin:'+esc(d.id)+'">Check-in</button>'
                    + '<button class="btn btn-sm btn-primary" data-act="dt:complete:'+esc(d.id)+'">Complete</button>' : "")
        + '<button class="btn btn-sm" data-act="dt:edit:'+esc(d.id)+'">Edit</button>'
        + '<button class="btn btn-sm" data-act="dt:delete:'+esc(d.id)+'" style="color:var(--danger-text)">Del</button>'
        + "</td></tr>";
    }).join("");

    return '<div class="table-wrap"><table class="table"><thead><tr>'
      + "<th>Task</th><th>Assignee</th><th>Deadline</th><th>Status</th><th>Intent</th><th>Complexity</th><th>Signal</th><th>Actions</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* ─── Load view (per-person delegation health) ──────────────────────────── */

  function loadViewHtml(c) {
    var members = c.members ? c.members() : [];
    if (!members.length) return '<div class="empty">Add team members first.</div>';
    var all = delegations(c);
    var hasAny = false;

    var html = members.map(function(m) {
      var mine = all.filter(function(d){ return d.delegatedTo === m.id; });
      if (!mine.length) return "";
      hasAny = true;
      var active    = mine.filter(function(d){ return String(d.status||"active")==="active"; });
      var overdue   = mine.filter(function(d){ return isOverdue(d,c); });
      var silent    = active.filter(function(d){ return isSilent(d,c); });
      var completed = mine.filter(function(d){ return String(d.status||"")==="completed"; });
      var rated     = completed.filter(function(d){ return d.completionQuality>0; });
      var avgQ      = rated.length ? (rated.reduce(function(s,d){ return s+d.completionQuality; },0)/rated.length).toFixed(1) : null;
      var stage     = m.developmentStage ? String(m.developmentStage).toUpperCase().slice(0,2) : null;
      var sliiInfo  = stage ? SLII_DELEG[stage] : null;
      var barW      = Math.min(active.length / 6 * 100, 100);
      var barCol    = active.length >= 5 ? "var(--danger)" : active.length >= 3 ? "var(--warn)" : "var(--ok)";

      return '<div class="card info-card" style="margin-bottom:12px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">'
        + '<strong style="font-size:15px">' + esc(m.name) + '</strong>'
        + (sliiInfo ? '<span style="font-size:11px;font-weight:600;color:' + sliiInfo.color + '">' + esc(sliiInfo.label) + '</span>' : "")
        + "</div>"
        + '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;margin-bottom:10px">'
        + '<span>Active: <strong>' + active.length + "</strong></span>"
        + (overdue.length ? '<span style="color:var(--danger-text)">Overdue: <strong>' + overdue.length + "</strong></span>" : "")
        + (silent.length  ? '<span style="color:var(--warn)">Silent: <strong>' + silent.length + "</strong></span>" : "")
        + (avgQ !== null  ? '<span>Completion quality avg: <strong>' + avgQ + "/5</strong></span>" : "")
        + "</div>"
        + '<div style="margin-bottom:12px">'
        + '<div style="font-size:11px;color:var(--text-3);margin-bottom:3px">Delegation load (' + active.length + ' active)</div>'
        + '<div style="height:6px;background:var(--line);border-radius:3px"><div style="height:6px;width:'+barW+'%;background:'+barCol+';border-radius:3px;transition:width .3s"></div></div>'
        + '</div>'
        + (active.length
            ? '<table class="table" style="font-size:12px"><thead><tr><th>Task</th><th>Deadline</th><th>Intent</th><th>Signal</th></tr></thead><tbody>'
              + active.map(function(d) {
                  var sig = isOverdue(d,c) ? '<span style="color:var(--danger-text)">Overdue</span>'
                          : isSilent(d,c)  ? '<span style="color:var(--warn)">Silent</span>'
                          : '<span style="color:var(--ok)">OK</span>';
                  return "<tr><td>" + esc(d.taskName) + "</td><td>" + esc(d.deadline||"—") + "</td><td>" + intentBadge(d.developmentIntent) + "</td><td>" + sig + "</td></tr>";
                }).join("") + "</tbody></table>"
            : '<div style="color:var(--text-3);font-size:13px">No active delegations.</div>')
        + "</div>";
    }).filter(Boolean).join("");

    return hasAny ? html : '<div class="empty">No delegations logged yet.</div>';
  }

  /* ─── Main view ─────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">Data layer not loaded.</div>';

    var pending = "";
    try { pending = localStorage.getItem("lc:pendingMemberId") || ""; } catch(_) {}
    if (pending && !formOpen && !editingId) {
      prefillAssignee = pending;
      formOpen = true;
      try { localStorage.removeItem("lc:pendingMemberId"); } catch(_) {}
    }

    var editing    = editingId    ? (delegations(c).filter(function(d){ return d.id===editingId;    })[0]||null) : null;
    var completing = completingId ? (delegations(c).filter(function(d){ return d.id===completingId; })[0]||null) : null;
    var checkingIn = checkInOpenId? (delegations(c).filter(function(d){ return d.id===checkInOpenId;})[0]||null) : null;

    var tabBar = '<div style="display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:16px">'
      + '<button class="tab-btn'+(activeTab==="list"?" active":"")+'" data-act="dt:tab:list">Task list</button>'
      + '<button class="tab-btn'+(activeTab==="load"?" active":"")+'" data-act="dt:tab:load">Team load</button>'
      + "</div>";

    var out = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">'
      + '<h2 style="margin:0">Delegation Tracker</h2>'
      + '<button class="btn btn-primary" data-act="dt:add">+ New delegation</button>'
      + "</div>"
      + kpisHtml(c);

    if (formOpen || editing)  out += formHtml(c, editing);
    if (completing)           out += completionDialogHtml(completing);
    if (checkingIn)           out += checkInPanelHtml(c, checkingIn);

    out += tabBar;
    out += activeTab === "list" ? filtersHtml(c) + listTabHtml(c) : loadViewHtml(c);
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
        if (t.id === "dtFPerson")   { filterPerson = t.value; rerender(); }
        else if (t.id === "dtFStatus")   { filterStatus = t.value; rerender(); }
        else if (t.id === "dtFOverdue")  { filterOverdueOnly = t.checked; rerender(); }
        else if (t.id === "dtAssignee") {
          var c = core(); if (!c) return;
          var stage = t.value ? memberStage(c, t.value) : null;
          var div = container.querySelector("#dtSlii");
          if (div) div.innerHTML = sliiCardHtml(stage);
        } else if (t.id === "dtComplexity") {
          var out2 = container.querySelector("#dtComplexityOut");
          if (out2) out2.value = t.value;
        }
      });
    }

    var form = container.querySelector("#dtForm");
    if (form) {
      form.addEventListener("submit", function(ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var val = function(sel) { var el = container.querySelector(sel); return el ? String(el.value||"").trim() : ""; };
        var taskName = val("#dtTask");
        if (!taskName) { formError = "Task name is required."; rerender(); return; }
        var assigneeId = val("#dtAssignee");
        if (!assigneeId) { formError = "Select a team member."; rerender(); return; }
        var deadline = val("#dtDeadline");
        if (!deadline) { formError = "Deadline is required."; rerender(); return; }
        var assigneeName = ""; (c.members?c.members():[]).forEach(function(m){ if(m.id===assigneeId) assigneeName=m.name; });
        var record = {
          taskName: taskName, delegatedTo: assigneeId, delegatedToName: assigneeName,
          delegatedDate: val("#dtDelegDate") || c.todayISO(), deadline: deadline,
          complexity: parseInt(val("#dtComplexity")||"3",10) || 3,
          developmentIntent: val("#dtIntent") || "capacity",
          notes: val("#dtNotes"), lastUpdateDate: c.todayISO()
        };
        var all = delegations(c);
        if (editingId) {
          for (var i=0;i<all.length;i++) {
            if (all[i].id===editingId) {
              record.id=all[i].id; record.status=all[i].status;
              record.checkIns=all[i].checkIns; record.completionQuality=all[i].completionQuality;
              all[i]=record; break;
            }
          }
        } else {
          record.id=c.uid("del"); record.status="active"; record.checkIns=[]; record.completionQuality=null;
          all.push(record);
        }
        saveDelegations(c, all);
        editingId=null; formOpen=false; formError=null; prefillAssignee="";
        rerender();
      });
    }

    var ciForm = container.querySelector("#dtCheckInForm");
    if (ciForm) {
      ciForm.addEventListener("submit", function(ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var val = function(sel) { var el = container.querySelector(sel); return el ? String(el.value||"").trim() : ""; };
        var note = val("#dtCiNote");
        if (!note) { checkInError = "Add a note."; rerender(); return; }
        var flagEl = container.querySelector("#dtCiFlag");
        var all = delegations(c);
        for (var i=0;i<all.length;i++) {
          if (all[i].id===checkInOpenId) {
            all[i].checkIns = all[i].checkIns || [];
            all[i].checkIns.push({ id: c.uid("ci"), date: val("#dtCiDate")||c.todayISO(), note: note, raisedFlag: flagEl?flagEl.checked:false });
            all[i].lastUpdateDate = c.todayISO(); break;
          }
        }
        saveDelegations(c, all);
        checkInOpenId=null; checkInError=null; rerender();
      });
    }
  }

  function handle(act) {
    var c = core(); if (!c) return;
    if (act === "dt:add") { formOpen=true; editingId=null; formError=null; prefillAssignee=""; rerender(); return; }
    if (act === "dt:cancelForm") { formOpen=false; editingId=null; formError=null; prefillAssignee=""; rerender(); return; }
    if (act.indexOf("dt:tab:") === 0) { activeTab=act.slice(7); rerender(); return; }
    if (act.indexOf("dt:edit:") === 0) { editingId=act.slice(8); formOpen=true; formError=null; completingId=null; checkInOpenId=null; rerender(); return; }
    if (act.indexOf("dt:delete:") === 0) {
      var id=act.slice(10);
      saveDelegations(c, delegations(c).filter(function(d){ return d.id!==id; }));
      if(editingId===id){editingId=null;formOpen=false;}
      if(checkInOpenId===id)checkInOpenId=null;
      if(completingId===id)completingId=null;
      rerender(); return;
    }
    if (act.indexOf("dt:checkin:") === 0) { checkInOpenId=act.slice(11); checkInError=null; completingId=null; rerender(); return; }
    if (act === "dt:cancelCheckIn") { checkInOpenId=null; checkInError=null; rerender(); return; }
    if (act.indexOf("dt:complete:") === 0) { completingId=act.slice(12); checkInOpenId=null; rerender(); return; }
    if (act === "dt:cancelComplete") { completingId=null; rerender(); return; }
    if (act.indexOf("dt:quality:") === 0) {
      var parts=act.split(":"); var did=parts[2]; var stars=parseInt(parts[3]||"0",10);
      var all=delegations(c);
      for(var i=0;i<all.length;i++){if(all[i].id===did){all[i].completionQuality=stars;break;}}
      saveDelegations(c,all); rerender(); return;
    }
    if (act.indexOf("dt:confirmComplete:") === 0) {
      var cid=act.slice(19); var all2=delegations(c);
      for(var j=0;j<all2.length;j++){if(all2[j].id===cid){all2[j].status="completed";all2[j].lastUpdateDate=c.todayISO();break;}}
      saveDelegations(c,all2); completingId=null; rerender(); return;
    }
  }

  /* ─── Public API ─────────────────────────────────────────────────────────── */

  function open(opts) {
    if (opts && opts.memberId) { prefillAssignee=opts.memberId; formOpen=true; }
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("delegationTracker");
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, isSilent: isSilent, isOverdue: isOverdue, getDelegationHealth: getDelegationHealth };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCDelegationTrackerUI = API;

})(typeof window !== "undefined" ? window : globalThis);
