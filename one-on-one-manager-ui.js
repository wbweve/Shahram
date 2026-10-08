/* ============================================================================
   js/one-on-one-manager-ui.js — 1:1 MANAGER (Module 3)  v2

   One record per team member (localStorage "oneOnOnes"). Auto-seeded when a
   member is added via LCLSCore.registerTeamMember.

   Record shape:
     { memberId, memberName, cadence, lastMeetingDate, nextDueDate,
       developmentGoal, streak, meetings: [{
         id, date, mode, topic, notes,
         growGoal, growReality, growOptions, growWill,
         qualityRating, actionItems: [{id,text,owner,deadline,status}]
       }] }

   Cross-module:
     - Reads  lc:pendingMemberId  to pre-open a member's 1:1 from Team Members
     - Exports getOneOnOneHealth() consumed by Daily Brief
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  /* ─── Constants ─────────────────────────────────────────────────────────── */

  var CADENCES = [
    { key: "weekly",   days: 7,  label: "Weekly"   },
    { key: "biweekly", days: 14, label: "Biweekly" },
    { key: "monthly",  days: 30, label: "Monthly"  }
  ];

  var TOPICS = [
    { key: "performance", label: "Performance" },
    { key: "development", label: "Development" },
    { key: "wellbeing",   label: "Wellbeing"   },
    { key: "workload",    label: "Workload"     },
    { key: "career",      label: "Career"       },
    { key: "feedback",    label: "Feedback"     },
    { key: "other",       label: "Other"        }
  ];

  var GROW_FIELDS = [
    { key: "growGoal",    label: "Goal",    prompt: "What outcome does the person want from this conversation?" },
    { key: "growReality", label: "Reality", prompt: "What is the current situation? What obstacles exist?" },
    { key: "growOptions", label: "Options", prompt: "What options are available? What could they try?" },
    { key: "growWill",    label: "Will",    prompt: "What will they specifically commit to? By when?" }
  ];

  /* SLII coaching tips injected into meeting prep based on member's dev stage */
  var SLII_PREP = {
    "D1": { label: "Directing (D1)", tip: "Be specific about expectations. Provide a clear agenda. Check comprehension — don't assume alignment.", color: "#EF4444" },
    "D2": { label: "Coaching (D2)",  tip: "Acknowledge their effort and frustration. Ask what's getting in the way. Offer guidance but let them suggest solutions first.", color: "#F59E0B" },
    "D3": { label: "Supporting (D3)",tip: "Listen more than you talk. Validate their competence. Ask what support they need, resist giving unsolicited advice.", color: "#3B82F6" },
    "D4": { label: "Delegating (D4)",tip: "Focus on big picture / career growth. Catch up on outcomes, not activities. Keep the relationship warm.", color: "#10B981" }
  };

  function cadenceDays(key) {
    for (var i = 0; i < CADENCES.length; i++) if (CADENCES[i].key === key) return CADENCES[i].days;
    return 14;
  }
  function cadenceLabel(key) {
    for (var i = 0; i < CADENCES.length; i++) if (CADENCES[i].key === key) return CADENCES[i].label;
    return key || "—";
  }
  function topicLabel(key) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].key === key) return TOPICS[i].label;
    return key || "—";
  }

  /* ─── Status & metrics ──────────────────────────────────────────────────── */

  function statusOf(rec, c) {
    var today = c.todayISO();
    var due = rec.nextDueDate || (rec.lastMeetingDate ? c.addDays(rec.lastMeetingDate, cadenceDays(rec.cadence)) : "");
    if (!due) return "overdue";
    if (due < today) return "overdue";
    if (due === today) return "due";
    return "ontrack";
  }

  function lastMeetingOf(rec) {
    var last = null;
    (rec.meetings || []).forEach(function (m) {
      if (m && m.date && (!last || String(m.date) > String(last.date))) last = m;
    });
    return last;
  }

  function openActionsOf(meeting) {
    return ((meeting && meeting.actionItems) || []).filter(function (a) {
      return a && String(a.status || "open").toLowerCase() !== "done";
    });
  }

  function avgQuality(rec) {
    var rated = (rec.meetings || []).filter(function (m) { return m && m.qualityRating > 0; });
    if (!rated.length) return null;
    var sum = 0; rated.forEach(function (m) { sum += Number(m.qualityRating) || 0; });
    return Math.round((sum / rated.length) * 10) / 10;
  }

  /* Quality sparkline — last N meetings as mini bar chart */
  function qualitySparkline(rec, n) {
    n = n || 8;
    var meetings = (rec.meetings || []).slice().sort(function(a,b){ return String(a.date||"").localeCompare(String(b.date||"")); });
    var recent = meetings.slice(-n);
    if (!recent.length) return '<span style="color:var(--text-3);font-size:11px">no data</span>';
    return '<span title="Quality trend (oldest → newest)">'
      + recent.map(function(m) {
          var q = Number(m.qualityRating) || 0;
          var h = q ? Math.round(q / 5 * 16) : 2;
          var col = q >= 4 ? "var(--ok)" : q >= 3 ? "var(--warn)" : q > 0 ? "var(--danger)" : "var(--line)";
          return '<span style="display:inline-block;width:6px;height:' + h + 'px;background:' + col + ';border-radius:1px;margin-right:1px;vertical-align:bottom"></span>';
        }).join("")
      + "</span>";
  }

  /* Meeting streak: consecutive cadence periods with ≥1 meeting */
  function meetingStreak(rec) {
    var meetings = (rec.meetings || []).slice().sort(function(a,b){ return String(b.date||"").localeCompare(String(a.date||"")); });
    if (!meetings.length) return 0;
    var streak = 1;
    var days = cadenceDays(rec.cadence);
    for (var i = 1; i < meetings.length; i++) {
      var prev = new Date(meetings[i-1].date);
      var curr = new Date(meetings[i].date);
      var gap = (prev - curr) / 86400000;
      if (gap <= days * 1.5) { streak++; } else { break; }
    }
    return streak;
  }

  /* ─── Data management ───────────────────────────────────────────────────── */

  function recordFor(c, memberId, memberName) {
    var rec = c.oneOnOneFor(memberId);
    if (rec) return rec;
    rec = { memberId: memberId, memberName: memberName || memberId,
             cadence: "biweekly", lastMeetingDate: null,
             nextDueDate: c.addDays(c.todayISO(), 14),
             developmentGoal: "", meetings: [] };
    var all = c.oneOnOnes(); all.push(rec); c.saveOneOnOnes(all);
    return rec;
  }

  function saveRecord(c, rec) {
    var all = c.oneOnOnes();
    for (var i = 0; i < all.length; i++) {
      if (all[i].memberId === rec.memberId) { all[i] = rec; c.saveOneOnOnes(all); return; }
    }
    all.push(rec); c.saveOneOnOnes(all);
  }

  /* ─── Screen state ──────────────────────────────────────────────────────── */

  var openMemberId  = null;
  var activeTab     = "overview";   // "overview" | "meeting" | "history"
  var meetingMode   = "standard";
  var draftTopic    = "other";
  var draftNotes    = "";
  var draftGoal     = "";
  var draftReality  = "";
  var draftOptions  = "";
  var draftWill     = "";
  var draftRating   = 0;
  var draftItems    = [];
  var formError     = null;
  var savedFlash    = false;

  function resetDraft(defaultOwner) {
    meetingMode  = "standard"; draftTopic  = "other"; draftNotes  = "";
    draftGoal    = ""; draftReality = ""; draftOptions = ""; draftWill = "";
    draftRating  = 0; formError = null;
    draftItems   = [{ text: "", owner: defaultOwner || "", deadline: "", status: "open" }];
  }

  function snapshotDrafts() {
    var container = document.getElementById("oneOnOneRoot");
    if (!container) return;
    var el;
    el = container.querySelector("#ooNotes");    if (el) draftNotes   = el.value;
    el = container.querySelector("#ooGrowGoal"); if (el) draftGoal    = el.value;
    el = container.querySelector("#ooGrowReal"); if (el) draftReality = el.value;
    el = container.querySelector("#ooGrowOpts"); if (el) draftOptions = el.value;
    el = container.querySelector("#ooGrowWill"); if (el) draftWill    = el.value;
    el = container.querySelector("#ooRating");   if (el) draftRating  = Number(el.value) || 0;
    el = container.querySelector("#ooTopic");    if (el) draftTopic   = el.value;
    Array.prototype.forEach.call(container.querySelectorAll("[data-item-field]"), function (el) {
      var idx = parseInt(el.getAttribute("data-item-idx"), 10);
      if (draftItems[idx]) draftItems[idx][el.getAttribute("data-item-field")] = el.value;
    });
  }

  function rerender() {
    var container = document.getElementById("oneOnOneRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Exported health data for Daily Brief ──────────────────────────────── */

  function getOneOnOneHealth() {
    var c = core(); if (!c) return null;
    var members = c.members();
    var result = { total: members.length, overdue: 0, due: 0, ontrack: 0, avgQuality: null, criticalMembers: [] };
    var qualSum = 0; var qualCount = 0;
    members.forEach(function(m) {
      var rec = recordFor(c, m.id, m.name);
      var status = statusOf(rec, c);
      result[status]++;
      if (status === "overdue") result.criticalMembers.push(m.name);
      var q = avgQuality(rec);
      if (q !== null) { qualSum += q; qualCount++; }
    });
    if (qualCount) result.avgQuality = Math.round((qualSum / qualCount) * 10) / 10;
    return result;
  }

  /* ─── Badge helpers ─────────────────────────────────────────────────────── */

  function statusBadge(status) {
    if (status === "overdue") return '<span class="badge b-critical">Overdue</span>';
    if (status === "due")     return '<span class="badge b-warn">Due today</span>';
    return '<span class="badge b-open">On track</span>';
  }

  function qualityStars(n) {
    if (!n) return '<span style="color:var(--text-3)">—</span>';
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= n ? "★" : "☆";
    return '<span style="color:var(--warn)">' + out + "</span>";
  }

  /* ─── List view ─────────────────────────────────────────────────────────── */

  function listHtml(c) {
    var members = c.members();
    if (!members.length) return '<div class="empty">Add team members in Team Members to start 1:1s.</div>';
    members.forEach(function(m) { recordFor(c, m.id, m.name); });

    var health = { overdue: 0, due: 0, ontrack: 0 };
    members.forEach(function(m) {
      var rec = recordFor(c, m.id, m.name);
      health[statusOf(rec, c)]++;
    });

    var summaryHtml = '<div class="kpi-grid" style="margin-bottom:16px">'
      + kpiCard("On track", health.ontrack, health.ontrack === members.length ? "rag-ok" : "")
      + kpiCard("Due today", health.due, health.due > 0 ? "rag-amber" : "")
      + kpiCard("Overdue", health.overdue, health.overdue > 0 ? "rag-red" : "")
      + '</div>';

    var rows = members.map(function(m) {
      var rec = recordFor(c, m.id, m.name);
      var status = statusOf(rec, c);
      var last = lastMeetingOf(rec);
      var q = avgQuality(rec);
      var streak = meetingStreak(rec);
      var openCount = last ? openActionsOf(last).length : 0;
      return "<tr>"
        + '<td><button class="btn-link" data-act="oo:open:' + esc(m.id) + '" style="font-weight:600;color:var(--brand)">' + esc(m.name) + "</button></td>"
        + "<td>" + esc(cadenceLabel(rec.cadence)) + "</td>"
        + "<td>" + esc(last ? last.date : "Never") + "</td>"
        + "<td>" + esc(rec.nextDueDate || "—") + "</td>"
        + "<td>" + statusBadge(status) + "</td>"
        + "<td>" + (q !== null ? qualityStars(Math.round(q)) + " <small style='color:var(--text-3)'>(" + q + ")</small>" : '<span style="color:var(--text-3)">—</span>') + "</td>"
        + "<td>" + qualitySparkline(rec) + "</td>"
        + "<td>" + (streak > 1 ? '<span title="Meeting streak">🔥 ' + streak + "</span>" : '<span style="color:var(--text-3)">—</span>') + "</td>"
        + "<td>" + (openCount ? '<span style="color:var(--warn);font-weight:600">' + openCount + " open</span>" : '<span style="color:var(--text-3)">—</span>') + "</td>"
        + '<td><button class="btn btn-sm btn-primary" data-act="oo:open:' + esc(m.id) + '">Open</button></td>'
        + "</tr>";
    }).join("");

    return summaryHtml
      + '<div class="table-wrap"><table class="table"><thead><tr>'
      + "<th>Member</th><th>Cadence</th><th>Last</th><th>Next</th><th>Status</th>"
      + "<th>Avg quality</th><th>Trend</th><th>Streak</th><th>Open items</th><th></th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function kpiCard(label, value, rag) {
    return '<div class="kpi-card' + (rag ? " " + rag : "") + '">'
      + '<div class="kpi-label">' + esc(label) + '</div>'
      + '<div class="kpi-value">' + esc(String(value)) + '</div>'
      + '</div>';
  }

  /* ─── Meeting prep section ──────────────────────────────────────────────── */

  function prepSectionHtml(c, rec) {
    var prev = lastMeetingOf(rec);
    var openItems = openActionsOf(prev);

    // SLII tip for this member
    var member = null;
    c.members().forEach(function(m) { if (m.id === rec.memberId) member = m; });
    var slii = null;
    if (member && member.developmentStage) {
      var dKey = (member.developmentStage || "").toUpperCase().slice(0,2);
      slii = SLII_PREP[dKey] || null;
    }

    var sliiHtml = slii
      ? '<div style="border-left:3px solid ' + slii.color + ';padding:8px 12px;background:var(--surface);border-radius:0 var(--r) var(--r) 0;margin-bottom:10px">'
        + '<div style="font-size:11px;font-weight:600;color:' + slii.color + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">SLII Coaching · ' + esc(slii.label) + '</div>'
        + '<div style="font-size:13px;color:var(--text-2)">' + esc(slii.tip) + '</div>'
        + '</div>'
      : "";

    // Previous GROW commitments to follow up
    var prevGrow = "";
    if (prev && prev.mode === "grow" && prev.growWill) {
      prevGrow = '<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:8px 12px;margin-bottom:10px">'
        + '<div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Last GROW commitment to follow up</div>'
        + '<div style="font-size:13px;color:var(--text-2)"><strong>Goal:</strong> ' + esc(prev.growGoal || "—") + '</div>'
        + '<div style="font-size:13px;color:var(--text-1);margin-top:2px"><strong>Will:</strong> ' + esc(prev.growWill) + '</div>'
        + '</div>';
    }

    var devGoalHtml = rec.developmentGoal
      ? '<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">🎯 Dev goal: <em>' + esc(rec.developmentGoal) + '</em></div>'
      : "";

    return '<div class="card info-card" style="margin-bottom:12px">'
      + '<h4 style="margin-bottom:10px">Meeting prep</h4>'
      + devGoalHtml + sliiHtml + prevGrow
      + (openItems.length
          ? '<div style="font-size:12px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Open items from last meeting</div>'
            + "<ul style='margin:0 0 0 16px;padding:0'>"
            + openItems.map(function(a) {
                return "<li style='font-size:13px;margin-bottom:4px'>" + esc(a.text)
                  + " <span style='color:var(--text-3)'>· " + esc(a.owner || "—") + (a.deadline ? " · due " + esc(a.deadline) : "") + "</span></li>";
              }).join("") + "</ul>"
          : '<div style="font-size:13px;color:var(--text-3)">No open items from last meeting — clean slate.</div>')
      + (prev ? '<div style="font-size:11px;color:var(--text-3);margin-top:8px">Last meeting: ' + esc(prev.date) + (prev.topic ? " · " + esc(topicLabel(prev.topic)) : "") + '</div>' : '')
      + "</div>";
  }

  /* ─── New meeting form ──────────────────────────────────────────────────── */

  function topicSelectHtml() {
    var opts = TOPICS.map(function(t) {
      return '<option value="' + t.key + '"' + (draftTopic === t.key ? " selected" : "") + ">" + esc(t.label) + "</option>";
    }).join("");
    return '<label style="display:flex;align-items:center;gap:8px"><strong>Topic</strong>'
      + '<select id="ooTopic" style="margin-left:4px">' + opts + "</select></label>";
  }

  function qualityRatingHtml() {
    var opts = '<option value="0">— rate this meeting</option>';
    for (var i = 1; i <= 5; i++) {
      opts += '<option value="' + i + '"' + (draftRating === i ? " selected" : "") + ">"
        + ("★".repeat(i) + "☆".repeat(5-i)) + " (" + i + ")</option>";
    }
    return '<label style="display:flex;align-items:center;gap:8px"><strong>Quality</strong>'
      + '<select id="ooRating" style="margin-left:4px">' + opts + "</select></label>";
  }

  function standardFormHtml() {
    return '<label style="display:block;margin-bottom:10px">'
      + '<strong>Notes</strong>'
      + '<textarea id="ooNotes" rows="5" placeholder="What was discussed? Key moments, decisions, concerns…" style="width:100%;margin-top:6px">' + esc(draftNotes) + "</textarea></label>";
  }

  function growFormHtml() {
    var idMap = { growGoal: "ooGrowGoal", growReality: "ooGrowReal", growOptions: "ooGrowOpts", growWill: "ooGrowWill" };
    var vals  = { growGoal: draftGoal, growReality: draftReality, growOptions: draftOptions, growWill: draftWill };
    return GROW_FIELDS.map(function(f) {
      return '<div style="margin-bottom:14px">'
        + '<label style="display:block"><strong style="color:var(--accent)">' + esc(f.label) + '</strong>'
        + ' <small style="color:var(--text-3);font-weight:400">— ' + esc(f.prompt) + '</small>'
        + '<textarea id="' + idMap[f.key] + '" rows="3" style="width:100%;margin-top:6px">' + esc(vals[f.key]) + "</textarea></label></div>";
    }).join("");
  }

  function itemRowHtml(item, idx) {
    return "<tr>"
      + '<td><input type="text" data-item-field="text" data-item-idx="' + idx + '" value="' + esc(item.text || "") + '" placeholder="Action item…" style="width:100%"></td>'
      + '<td><input type="text" data-item-field="owner" data-item-idx="' + idx + '" value="' + esc(item.owner || "") + '" style="width:100px"></td>'
      + '<td><input type="date" data-item-field="deadline" data-item-idx="' + idx + '" value="' + esc(item.deadline || "") + '"></td>'
      + '<td><select data-item-field="status" data-item-idx="' + idx + '">'
      + '<option value="open"' + (String(item.status||"open").toLowerCase() !== "done" ? " selected" : "") + ">Open</option>"
      + '<option value="done"' + (String(item.status||"").toLowerCase() === "done"  ? " selected" : "") + ">Done</option>"
      + "</select></td>"
      + '<td><button type="button" class="btn btn-sm" data-act="oo:itemDel:' + idx + '" style="color:var(--danger-text)">×</button></td>'
      + "</tr>";
  }

  function newMeetingFormHtml() {
    var activeStyle = "background:var(--accent);color:#fff;border-color:var(--accent)";
    var idleStyle   = "";
    return '<div class="card info-card" style="margin-bottom:12px">'
      + '<h4 style="margin-bottom:12px">New meeting</h4>'
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">'
      + topicSelectHtml()
      + '<div style="display:flex;gap:6px">'
      + '<button type="button" class="btn btn-sm" data-act="oo:mode:standard" style="' + (meetingMode==="standard"?activeStyle:idleStyle) + '">Standard</button>'
      + '<button type="button" class="btn btn-sm" data-act="oo:mode:grow" style="' + (meetingMode==="grow"?activeStyle:idleStyle) + '">GROW coaching</button>'
      + '</div></div>'
      + (meetingMode === "grow" ? growFormHtml() : standardFormHtml())
      + '<h4 style="margin-top:14px;margin-bottom:8px">Action items</h4>'
      + '<div class="table-wrap"><table class="table"><thead><tr>'
      + "<th>Item</th><th>Owner</th><th>Deadline</th><th>Status</th><th></th>"
      + "</tr></thead><tbody>" + draftItems.map(itemRowHtml).join("") + "</tbody></table></div>"
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:10px">'
      + '<button type="button" class="btn btn-sm" data-act="oo:itemAdd">+ Action item</button>'
      + qualityRatingHtml()
      + "</div>"
      + (formError ? '<div style="color:var(--danger-text);margin-top:8px;font-size:13px">⚠ ' + esc(formError) + "</div>" : "")
      + '<div style="margin-top:14px">'
      + '<button type="button" class="btn btn-primary" data-act="oo:save">Save meeting</button>'
      + "</div></div>";
  }

  /* ─── History view ──────────────────────────────────────────────────────── */

  function historyHtml(rec) {
    var meetings = (rec.meetings || []).slice().sort(function(a,b){ return String(b.date||"").localeCompare(String(a.date||"")); });
    if (!meetings.length) return '<div class="empty" style="padding:20px 0">No meetings logged yet.</div>';

    return meetings.map(function(m, i) {
      var items  = (m.actionItems || []);
      var done   = items.filter(function(a){ return String(a.status||"").toLowerCase()==="done"; }).length;
      var open   = items.filter(function(a){ return String(a.status||"open").toLowerCase()!=="done"; }).length;
      var qualStr = m.qualityRating ? "★".repeat(m.qualityRating)+"☆".repeat(5-m.qualityRating) : "";
      return '<details style="margin:6px 0;border:1px solid var(--line);border-radius:var(--r);padding:10px 14px"'
        + (i===0?" open":"") + ">"
        + "<summary style='cursor:pointer;user-select:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap'>"
        + "<strong>" + esc(m.date||"—") + "</strong>"
        + (m.mode==="grow" ? '<span class="badge b-open" style="font-size:10px">GROW</span>' : "")
        + (m.topic ? '<span class="badge b-neutral" style="font-size:10px">' + esc(topicLabel(m.topic)) + "</span>" : "")
        + (qualStr ? '<span style="color:var(--warn);font-size:12px">' + qualStr + "</span>" : "")
        + (items.length ? '<span style="color:var(--text-3);font-size:12px">' + open + " open / " + done + " done</span>" : "")
        + "</summary>"
        + '<div style="margin-top:10px">'
        + (m.mode === "grow"
            ? GROW_FIELDS.map(function(f){
                var val = m[f.key];
                return val ? '<div style="margin-bottom:8px"><strong style="color:var(--accent)">' + esc(f.label) + ':</strong> <span style="color:var(--text-2)">' + esc(val) + "</span></div>" : "";
              }).join("")
            : (m.notes ? '<div style="color:var(--text-2);white-space:pre-wrap">' + esc(m.notes) + "</div>" : ""))
        + (items.length
            ? '<div style="margin-top:10px"><table class="table" style="font-size:12px"><thead><tr><th>Item</th><th>Owner</th><th>Deadline</th><th>Status</th></tr></thead><tbody>'
              + items.map(function(a){
                  var done = String(a.status||"").toLowerCase()==="done";
                  return "<tr" + (done ? " style='opacity:.5'" : "") + "><td>" + esc(a.text||"—") + "</td>"
                    + "<td>" + esc(a.owner||"—") + "</td><td>" + esc(a.deadline||"—") + "</td>"
                    + "<td>" + (done ? "✓ Done" : "Open") + "</td></tr>";
                }).join("") + "</tbody></table></div>"
            : "")
        + "</div></details>";
    }).join("");
  }

  /* ─── Cadence settings card ─────────────────────────────────────────────── */

  function settingsCardHtml(c, rec, member) {
    var streak  = meetingStreak(rec);
    var q       = avgQuality(rec);
    var cdOpts  = CADENCES.map(function(cd){
      return '<option value="' + cd.key + '"' + (rec.cadence===cd.key?" selected":"") + ">" + esc(cd.label) + "</option>";
    }).join("");

    return '<div class="card info-card" style="margin-bottom:12px">'
      + '<div class="form-grid">'
      + '<label>Cadence<select id="ooCadence">' + cdOpts + "</select></label>"
      + '<label>Last meeting<input value="' + esc(rec.lastMeetingDate || "Never") + '" disabled></label>'
      + '<label>Next due<input value="' + esc(rec.nextDueDate || "—") + '" disabled></label>'
      + '<label style="grid-column:1/-1">Development goal<input type="text" id="ooDevelopmentGoal" maxlength="140" value="' + esc(rec.developmentGoal||"") + '" placeholder="What is this person working toward?"></label>'
      + "</div>"
      + '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:13px">'
      + (streak > 1 ? '<span>🔥 <strong>' + streak + '-meeting streak</strong></span>' : "")
      + (q !== null ? '<span>Avg quality: <strong>' + qualityStars(Math.round(q)) + " (" + q + ")</strong></span>" : "")
      + qualitySparkline(rec)
      + "</div></div>";
  }

  /* ─── Meeting view (per-member) ─────────────────────────────────────────── */

  function meetingViewHtml(c, member) {
    var rec = recordFor(c, member.id, member.name);

    var tabBar = '<div style="display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:16px">'
      + ["overview", "meeting", "history"].map(function(tab) {
          var label = tab === "overview" ? "Overview" : tab === "meeting" ? "New meeting" : "History (" + (rec.meetings||[]).length + ")";
          return '<button class="tab-btn' + (activeTab===tab?" active":"") + '" data-act="oo:tab:' + tab + '">' + esc(label) + "</button>";
        }).join("")
      + "</div>";

    var body = "";
    if (activeTab === "overview") {
      body = settingsCardHtml(c, rec, member) + prepSectionHtml(c, rec);
    } else if (activeTab === "meeting") {
      body = prepSectionHtml(c, rec) + newMeetingFormHtml();
    } else {
      body = historyHtml(rec);
    }

    return '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">'
      + '<h3 style="margin:0">1:1 with ' + esc(member.name) + "</h3>"
      + '<div style="display:flex;gap:8px">'
      + '<button type="button" class="btn btn-sm" data-act="oo:newMeeting">+ New meeting</button>'
      + '<button type="button" class="btn btn-sm" data-act="oo:back">← All members</button>'
      + "</div></div>"
      + tabBar + body;
  }

  /* ─── Main view ─────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">Data layer not loaded.</div>';

    // Cross-module pending member
    var pending = "";
    try { pending = localStorage.getItem("lc:pendingMemberId") || ""; } catch(_) {}
    if (pending && !openMemberId) {
      openMemberId = pending;
      activeTab = "meeting";
      try { localStorage.removeItem("lc:pendingMemberId"); } catch(_) {}
      var pm = null; var pn = "";
      c.members().forEach(function(m) { if (m.id === openMemberId) { pm = m; pn = m.name; } });
      if (pm) resetDraft(pn);
    }

    if (openMemberId) {
      var member = null;
      c.members().forEach(function(m) { if (m.id === openMemberId) member = m; });
      if (member) return meetingViewHtml(c, member);
      openMemberId = null;
    }

    return '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">'
      + '<h2 style="margin:0">1:1 Manager</h2></div>'
      + '<div style="color:var(--text-3);font-size:13px;margin-bottom:16px">Structured one-on-one cadence per team member. GROW mode enables coaching conversations.</div>'
      + listHtml(c);
  }

  /* ─── Event wiring ──────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function(ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        ev.preventDefault();
        snapshotDrafts();
        handle(t.getAttribute("data-act"));
      });
      container.addEventListener("change", function(ev) {
        var t = ev.target; if (!t || !t.id) return;
        if (t.id === "ooCadence") {
          var c = core(); if (!c || !openMemberId) return;
          var memberName = ""; c.members().forEach(function(m){ if(m.id===openMemberId) memberName=m.name; });
          var rec = recordFor(c, openMemberId, memberName);
          rec.cadence = t.value;
          if (rec.lastMeetingDate) rec.nextDueDate = c.addDays(rec.lastMeetingDate, cadenceDays(t.value));
          else rec.nextDueDate = c.addDays(c.todayISO(), cadenceDays(t.value));
          saveRecord(c, rec); rerender();
        }
        if (t.id === "ooRating") { draftRating = Number(t.value)||0; }
        if (t.id === "ooTopic")  { draftTopic  = t.value; }
      });
    }
    var goalEl = container.querySelector("#ooDevelopmentGoal");
    if (goalEl) {
      goalEl.addEventListener("input", function() {
        var c = core(); if (!c || !openMemberId) return;
        var memberName = ""; c.members().forEach(function(m){ if(m.id===openMemberId) memberName=m.name; });
        var rec = recordFor(c, openMemberId, memberName);
        rec.developmentGoal = goalEl.value;
        saveRecord(c, rec);
      });
    }
  }

  function handle(act) {
    var c = core(); if (!c) return;

    if (act.indexOf("oo:open:") === 0) {
      openMemberId = act.slice(8); activeTab = "overview";
      var memberName = ""; c.members().forEach(function(m){ if(m.id===openMemberId) memberName=m.name; });
      resetDraft(memberName); rerender(); return;
    }
    if (act === "oo:back") { openMemberId = null; activeTab = "overview"; rerender(); return; }
    if (act.indexOf("oo:tab:") === 0) { activeTab = act.slice(7); rerender(); return; }
    if (act === "oo:newMeeting") { activeTab = "meeting"; rerender(); return; }
    if (act.indexOf("oo:mode:") === 0) { meetingMode = act.slice(8); rerender(); return; }
    if (act === "oo:itemAdd") {
      var defaultOwner = ""; c.members().forEach(function(m){ if(m.id===openMemberId) defaultOwner=m.name; });
      draftItems.push({ text: "", owner: defaultOwner, deadline: "", status: "open" });
      rerender(); return;
    }
    if (act.indexOf("oo:itemDel:") === 0) {
      var idx = parseInt(act.slice(11), 10);
      if (draftItems.length > 1) draftItems.splice(idx, 1);
      rerender(); return;
    }
    if (act === "oo:save") {
      var memberNameSave = ""; c.members().forEach(function(m){ if(m.id===openMemberId) memberNameSave=m.name; });
      var rec = recordFor(c, openMemberId, memberNameSave);

      var hasContent = meetingMode === "grow"
        ? !!(draftGoal||draftReality||draftOptions||draftWill)
        : !!String(draftNotes||"").trim();

      var items = draftItems.filter(function(a){ return a && String(a.text||"").trim(); })
        .map(function(a){ return { id: c.uid("act"), text: String(a.text).trim(),
          owner: String(a.owner||"").trim() || rec.memberName, deadline: a.deadline||"", status: a.status||"open" }; });

      if (!hasContent && !items.length) {
        formError = "Add notes, GROW answers, or at least one action item.";
        rerender(); return;
      }

      var today = c.todayISO();
      var meeting = { id: c.uid("mtg"), date: today, mode: meetingMode, topic: draftTopic, qualityRating: draftRating, actionItems: items };
      if (meetingMode === "grow") {
        meeting.growGoal = draftGoal; meeting.growReality = draftReality;
        meeting.growOptions = draftOptions; meeting.growWill = draftWill;
      } else {
        meeting.notes = draftNotes;
      }

      rec.meetings = rec.meetings || [];
      rec.meetings.push(meeting);
      rec.lastMeetingDate = today;
      rec.nextDueDate = c.addDays(today, cadenceDays(rec.cadence));
      saveRecord(c, rec);

      resetDraft(memberNameSave);
      activeTab = "history";
      savedFlash = true;
      setTimeout(function() { savedFlash = false; }, 2500);
      rerender();
    }
  }

  /* ─── Public API ─────────────────────────────────────────────────────────── */

  function open(opts) {
    if (opts && opts.memberId) {
      openMemberId = opts.memberId;
      activeTab = opts.tab || "overview";
      var c = core();
      if (c) {
        var mn = ""; c.members().forEach(function(m){ if(m.id===opts.memberId) mn=m.name; });
        resetDraft(mn);
      }
    }
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("oneOnOneManager");
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, statusOf: statusOf,
              cadenceDays: cadenceDays, getOneOnOneHealth: getOneOnOneHealth, lastMeetingOf: lastMeetingOf };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCOneOnOneManagerUI = API;

})(typeof window !== "undefined" ? window : globalThis);
