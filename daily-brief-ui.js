/* ============================================================================
   js/daily-brief-ui.js — DAILY LEADERSHIP BRIEF (Module 1).

   No manual input — aggregates from ALL modules on every load.

   CRITICAL (red):
     · Escalated delegations
     · Risks Critical/High with no mitigation owner
     · CAPA items past target date
     · Team health drop > 10 pts vs prior week
     · Team health score < 50 this week
     · Team health question rated 1 (any member)           ← new
     · Strategic stakeholders (Manage Closely) with Red health
     · Situational leadership regression (D-level moved back) ← new
     · Decision: critical priority + pending status         ← new

   ATTENTION (amber):
     · Tasks overdue
     · Standup blockers unresolved > 48h
     · Silent delegations (no update > 48h) on active tasks
     · Team members with no 1:1 in > 14 days
     · Decisions due for review
     · Team pulse stale > 2 weeks                          ← new
     · Decisions pending > 14 days with no outcome         ← new
     · D1/D2 members with no directive coaching logged     ← new

   FOLLOW-UP (indigo):
     · Team members with no recognition > 14 days
     · Stakeholders overdue for contact (Amber/Red health)

   LEADERSHIP PULSE (top card):
     · Cadence score = % of "good leadership acts" in last 7 days
     · Module health strip — health summary for every wired module ← new
     · Today's coaching spotlight
     · Intention of the week from journal
     · "Clear for today" = no CRITICAL items

   "Dismiss for today" hides an item until midnight.
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  /* ─── Module health accessors ─────────────────────────────────────────── */

  function getDecisionHealth() {
    try {
      return root.LCLeadershipDecisionsUI && typeof root.LCLeadershipDecisionsUI.getDecisionHealth === "function"
        ? root.LCLeadershipDecisionsUI.getDecisionHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getTeamHealthStatus() {
    try {
      return root.LCTeamHealthRadarUI && typeof root.LCTeamHealthRadarUI.getTeamHealthStatus === "function"
        ? root.LCTeamHealthRadarUI.getTeamHealthStatus()
        : null;
    } catch (_e) { return null; }
  }

  function getSituationalHealth() {
    try {
      return root.LCSituationalGuideUI && typeof root.LCSituationalGuideUI.getSituationalHealth === "function"
        ? root.LCSituationalGuideUI.getSituationalHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getOneOnOneHealth() {
    try {
      return root.LCOneOnOneManagerUI && typeof root.LCOneOnOneManagerUI.getOneOnOneHealth === "function"
        ? root.LCOneOnOneManagerUI.getOneOnOneHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getDelegationHealth() {
    try {
      return root.LCDelegationTrackerUI && typeof root.LCDelegationTrackerUI.getDelegationHealth === "function"
        ? root.LCDelegationTrackerUI.getDelegationHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getRecognitionHealth() {
    try {
      return root.LCRecognitionLogUI && typeof root.LCRecognitionLogUI.getRecognitionHealth === "function"
        ? root.LCRecognitionLogUI.getRecognitionHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getJournalHealth() {
    try {
      return root.LCLeadershipJournalUI && typeof root.LCLeadershipJournalUI.getJournalHealth === "function"
        ? root.LCLeadershipJournalUI.getJournalHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getSuccessionHealth() {
    try {
      return root.LCSuccessionPipelineUI && typeof root.LCSuccessionPipelineUI.getSuccessionHealth === "function"
        ? root.LCSuccessionPipelineUI.getSuccessionHealth()
        : null;
    } catch (_e) { return null; }
  }

  function getNinetyDayHealth() {
    try {
      return root.LCNinetyDayUI && typeof root.LCNinetyDayUI.getNinetyDayHealth === "function"
        ? root.LCNinetyDayUI.getNinetyDayHealth()
        : null;
    } catch (_e) { return null; }
  }

  var SECTIONS = ["critical", "attention", "followup"];
  var SECTION_META = {
    critical:  { label: { en: "CRITICAL",   da: "KRITISK"       }, color: "var(--risk-text,#F87171)"    },
    attention: { label: { en: "ATTENTION",  da: "OPMÆRKSOMHED"  }, color: "var(--warn-text,#FCD34D)"   },
    followup:  { label: { en: "FOLLOW-UP",  da: "OPFØLGNING"    }, color: "var(--accent-text,#818CF8)" }
  };

  var LEFT_BORDER = {
    critical: "3px solid var(--risk,#F87171)",
    attention: "3px solid var(--warn,#F59E0B)",
    followup:  "3px solid var(--accent,#818CF8)"
  };

  /* ─── Leadership cadence score ────────────────────────────────────────── */

  function cadenceScore(c) {
    var acts = 0, possible = 0;
    possible++;
    var oneOnOnes = c.oneOnOnes ? c.oneOnOnes() : [];
    var had1on1 = oneOnOnes.some(function (o) {
      var d = o.lastMeetingDate; return d && c.daysSince(d) !== null && c.daysSince(d) <= 7;
    });
    if (had1on1) acts++;

    possible++;
    var recs = c.recognitions ? c.recognitions() : [];
    var hadRec = recs.some(function (r) {
      return r.date && c.daysSince(r.date) !== null && c.daysSince(r.date) <= 7;
    });
    if (hadRec) acts++;

    possible++;
    var delegations = c.delegations();
    var hadCheckIn = delegations.some(function (d) {
      if (!Array.isArray(d.checkIns) || !d.checkIns.length) return false;
      var last = d.checkIns[d.checkIns.length - 1];
      return last.date && c.daysSince(last.date) !== null && c.daysSince(last.date) <= 7;
    });
    if (hadCheckIn) acts++;

    possible++;
    var wk = c.weekKey ? c.weekKey() : null;
    // Check new journal format (lcLeadershipJournal array) first, fall back to old hash
    var hadJournalEntry = false;
    if (wk) {
      var jh = getJournalHealth();
      if (jh !== null) {
        hadJournalEntry = !!jh.reflectedThisWeek;
      } else {
        var journals = c.journals ? c.journals() : (function () {
          try { return JSON.parse(localStorage.getItem("leadershipJournal") || "{}"); } catch (_e) { return {}; }
        })();
        hadJournalEntry = !!(journals[wk]);
      }
    }
    if (hadJournalEntry) acts++;

    possible++;
    var decisions = c.decisions ? c.decisions() : [];
    var hadDecision = decisions.some(function (d) {
      return d.date && c.daysSince(d.date) !== null && c.daysSince(d.date) <= 14;
    });
    if (hadDecision) acts++;

    // Bonus: pulse submitted this week
    possible++;
    var teamHealth = c.teamHealth ? c.teamHealth() : [];
    var hadPulse = wk && teamHealth.some(function (p) { return (p.weekKey || p.week) === wk; });
    if (hadPulse) acts++;

    return possible > 0 ? Math.round((acts / possible) * 100) : 0;
  }

  function cadenceBar(score) {
    var color = score >= 80 ? "var(--ok,#22C55E)" : score >= 50 ? "var(--warn,#F59E0B)" : "var(--risk,#F87171)";
    return '<div style="display:flex;align-items:center;gap:10px;margin-top:4px">'
      + '<div style="flex:1;height:6px;background:var(--surface-3,#242428);border-radius:99px;overflow:hidden">'
        + '<div style="width:' + score + '%;height:100%;background:' + color + ';border-radius:99px;transition:width .4s"></div>'
      + "</div>"
      + '<span style="font-size:13px;font-weight:700;color:' + color + ';min-width:36px;text-align:right">' + score + '%</span>'
      + "</div>";
  }

  /* ─── Module health strip ─────────────────────────────────────────────── */

  function healthDot(ok) {
    var c = ok ? "var(--ok,#22C55E)" : "var(--risk,#F87171)";
    return '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + c + ';margin-right:4px;vertical-align:middle"></span>';
  }

  function moduleHealthStripHtml() {
    var modules = [];

    // 1:1 health
    var oo = getOneOnOneHealth();
    if (oo !== null) {
      var ooOk = oo.overdueCount === 0 && oo.missedCount === 0;
      modules.push({ label: "1:1", ok: ooOk, detail: oo.overdueCount + " overdue" });
    }

    // Delegation health
    var dh = getDelegationHealth();
    if (dh !== null) {
      var dhOk = dh.escalated === 0 && dh.overdue === 0;
      modules.push({ label: "Delegation", ok: dhOk, detail: dh.escalated + " escalated" });
    }

    // Recognition health
    var rh = getRecognitionHealth();
    if (rh !== null) {
      var rhOk = rh.membersUnrecognised === 0;
      modules.push({ label: "Recognition", ok: rhOk, detail: rh.membersUnrecognised + " unrecognised" });
    }

    // Decision health
    var dec = getDecisionHealth();
    if (dec !== null) {
      var decOk = dec.critical === 0 && dec.pendingOld === 0;
      modules.push({ label: "Decisions", ok: decOk, detail: dec.critical + " critical" });
    }

    // Team health
    var th = getTeamHealthStatus();
    if (th !== null) {
      var thOk = th.alerts.length === 0;
      modules.push({ label: "Team Health", ok: thOk, detail: th.alerts.length + " alerts" });
    }

    // Situational health
    var sh = getSituationalHealth();
    if (sh !== null) {
      var shOk = sh.alerts.length === 0;
      modules.push({ label: "SLII", ok: shOk, detail: sh.alerts.length + " alerts" });
    }

    // Journal health
    var jh = getJournalHealth();
    if (jh !== null) {
      var jhOk = jh.reflectedThisWeek;
      modules.push({ label: "Journal", ok: jhOk, detail: jhOk ? "Reflected this week" : "No reflection this week" });
    }

    // Succession health
    var sucH = getSuccessionHealth();
    if (sucH !== null) {
      var sucOk = sucH.criticalGaps === 0 && sucH.flightRisks === 0;
      modules.push({ label: "Succession", ok: sucOk, detail: sucH.criticalGaps + " gaps, " + sucH.flightRisks + " flight risks" });
    }

    // 90-Day health
    var ndH = getNinetyDayHealth();
    if (ndH !== null && ndH.activePlan) {
      var ndOk = ndH.overdueCount === 0;
      modules.push({ label: "90-Day", ok: ndOk, detail: ndH.overdueCount + " overdue, " + ndH.daysRemaining + "d left" });
    }

    if (!modules.length) return "";

    return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">'
      + '<div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">'
        + esc(L("Modulstatus", "Module health"))
      + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
        + modules.map(function (m) {
            var bg = m.ok ? "var(--ok-soft,rgba(34,197,94,.08))" : "var(--risk-soft,rgba(248,113,113,.08))";
            var border = m.ok ? "1px solid var(--ok-line,rgba(34,197,94,.2))" : "1px solid var(--risk-line,rgba(248,113,113,.25))";
            return '<div title="' + esc(m.detail) + '" style="display:flex;align-items:center;padding:3px 8px;border-radius:99px;background:' + bg + ';border:' + border + ';font-size:11px;color:var(--text-2)">'
              + healthDot(m.ok) + esc(m.label)
            + '</div>';
          }).join("")
      + "</div>"
    + "</div>";
  }

  /* ─── Today's coaching spotlight ─────────────────────────────────────── */

  function coachingSpotlight(c) {
    var members = c.members();
    if (!members.length) return null;

    var scored = members.map(function (m) {
      var score = 0;
      var last1 = c.lastOneOnOneDate(m.id);
      var d1 = last1 ? c.daysSince(last1) : 999;
      if (d1 > 28) score += 3; else if (d1 > 14) score += 1;
      var lastR = c.lastRecognitionDate(m.id);
      var dr = lastR ? c.daysSince(lastR) : 999;
      if (dr > 28) score += 2; else if (dr > 14) score += 1;
      var stage = m.developmentStage || m.developmentLevel || "";
      if (stage === "directing" || stage === "D1") score += 2;
      if (stage === "coaching" || stage === "D2") score += 1;
      var silentDels = c.delegations().filter(function (d) {
        if (d.delegatedTo !== m.id) return false;
        if (String(d.status || "").toLowerCase() !== "active") return false;
        var stamp = d.lastUpdateDate || d.delegatedDate || null;
        var h = stamp ? c.hoursSince(stamp) : 999;
        return h > 48;
      });
      score += silentDels.length * 2;
      return { member: m, score: score, d1days: d1, drdays: dr };
    });

    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored[0];
    if (top.score === 0) return null;

    var stageLabels = {
      directing: "D1 — Directing", coaching: "D2 — Coaching",
      supporting: "D3 — Supporting", delegating: "D4 — Delegating"
    };
    var tips = {
      directing:  L("Giv klare instrukser. Check ind i dag.", "Give clear instructions. Check in today."),
      coaching:   L("Forklar 'hvorfor'. Involvér i beslutningen.", "Explain the 'why'. Involve in the decision."),
      supporting: L("Opmuntre. Stil spørgsmål fremfor at svare.", "Encourage. Ask questions instead of answering."),
      delegating: L("Vær tilgængelig, ikke tæt på. Bekræft selvstændighed.", "Be available, not close. Confirm autonomy.")
    };
    var stage = top.member.developmentStage || top.member.developmentLevel || "";
    var tip = tips[stage] || L("Tjek ind og giv anerkendelse.", "Check in and give recognition.");

    return {
      name: top.member.name,
      stageLabel: stageLabels[stage] || stage || "—",
      tip: tip,
      d1days: top.d1days,
      drdays: top.drdays,
      id: top.member.id
    };
  }

  /* ─── Journal intention ───────────────────────────────────────────────── */

  function weekIntention(c) {
    var wk = c.weekKey ? c.weekKey() : null;
    if (!wk) return null;
    var journals = c.journals ? c.journals() : (function () {
      try { return JSON.parse(localStorage.getItem("leadershipJournal") || "{}"); } catch (_e) { return {}; }
    })();
    var entry = journals[wk];
    if (!entry || !entry.nextIntention) return null;
    return String(entry.nextIntention).trim() || null;
  }

  /* ─── Pulse header card ───────────────────────────────────────────────── */

  function pulseCardHtml(c, items) {
    var score = cadenceScore(c);
    var spotlight = coachingSpotlight(c);
    var intention = weekIntention(c);
    var criticalCount = items.filter(function (i) { return i.section === "critical"; }).length;
    var allCount = items.length;
    var dismissed = allCount - items.filter(function (i) { return !c.isDismissed(i.id); }).length;

    var scoreLabel = score >= 80 ? L("Stærk uge", "Strong week")
      : score >= 50 ? L("Delvist fokuseret", "Partially focused")
      : L("Handling påkrævet", "Action required");

    return '<div class="card" style="margin-bottom:16px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'
        + '<div>'
          + '<div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">'
            + esc(c.todayISO()) + ' · ' + esc(L("Lederbrief", "Leadership Brief"))
          + '</div>'
          + '<div style="font-size:17px;font-weight:700;color:var(--text);letter-spacing:-.3px">'
            + (criticalCount === 0
                ? '✓ ' + esc(L("Klar til i dag", "Clear for today"))
                : '⚡ ' + criticalCount + ' ' + esc(L("kritiske punkt" + (criticalCount === 1 ? "" : "er") + " kræver handling", "critical item" + (criticalCount === 1 ? "" : "s") + " need action")))
          + '</div>'
        + '</div>'
        + '<button type="button" class="btn btn-sm" data-act="db:refresh">' + esc(L("↻ Genberegn", "↻ Recalculate")) + "</button>"
      + "</div>"

      // Cadence score
      + '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
          + '<span style="font-size:12px;font-weight:500;color:var(--text-2)">' + esc(L("Ledelseskadence — seneste 7 dage", "Leadership cadence — last 7 days")) + '</span>'
          + '<span style="font-size:11px;color:var(--text-3)">' + esc(scoreLabel) + '</span>'
        + '</div>'
        + cadenceBar(score)
      + '</div>'

      // Module health strip
      + moduleHealthStripHtml()

      // Coaching spotlight
      + (spotlight
          ? '<div style="margin-top:12px;padding:10px 12px;background:var(--surface-2);border-radius:6px">'
              + '<div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:4px">'
                + '🎯 ' + esc(L("Coaching-fokus i dag", "Today's coaching focus"))
              + '</div>'
              + '<div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(spotlight.name) + '</div>'
              + '<div style="font-size:12px;color:var(--text-3);margin-top:1px">' + esc(spotlight.stageLabel) + '</div>'
              + '<div style="font-size:12px;color:var(--text-2);margin-top:4px">' + esc(spotlight.tip) + '</div>'
              + '<div style="display:flex;gap:12px;margin-top:6px">'
                + '<span style="font-size:11px;color:var(--text-3)">'
                  + (spotlight.d1days < 900 ? esc(spotlight.d1days + L("d siden 1:1", "d since 1:1")) : esc(L("Aldrig haft 1:1", "No 1:1 yet")))
                + '</span>'
                + '<span style="font-size:11px;color:var(--text-3)">'
                  + (spotlight.drdays < 900 ? esc(spotlight.drdays + L("d siden anerkendelse", "d since recognition")) : esc(L("Aldrig anerkendt", "Never recognised")))
                + '</span>'
              + '</div>'
              + '<div style="margin-top:8px">'
                + '<button type="button" class="btn btn-sm btn-primary" data-act="db:go:oneOnOneManager">'
                  + esc(L("Åbn 1:1 →", "Open 1:1 →")) + '</button>'
                + ' <button type="button" class="btn btn-sm" data-act="db:go:situationalGuide">'
                  + esc(L("SLII-vurdering →", "SLII assess →")) + '</button>'
              + '</div>'
            + '</div>'
          : "")

      // Weekly intention from journal
      + (intention
          ? '<div style="margin-top:10px;padding:10px 12px;background:var(--accent-soft);border-radius:6px;border-left:3px solid var(--accent)">'
              + '<div style="font-size:11px;font-weight:600;color:var(--accent-text);margin-bottom:3px">'
                + '📌 ' + esc(L("Ugens intention (fra journal)", "This week's intention (from journal)"))
              + '</div>'
              + '<div style="font-size:13px;color:var(--text)">' + esc(intention) + '</div>'
            + '</div>'
          : "")

      + (dismissed > 0
          ? '<div style="margin-top:10px;font-size:11px;color:var(--text-3)">'
              + esc(dismissed + " " + L("punkt(er) afvist for i dag — vender tilbage i morgen.", "item(s) dismissed for today — returns tomorrow."))
            + "</div>"
          : "")
      + "</div>";
  }

  /* ─── Item collection ─────────────────────────────────────────────────── */

  // Tracks IDs we've already added to avoid duplicates between raw-data and module-export paths
  var _seenIds = {};

  function push(items, item) {
    if (_seenIds[item.id]) return;
    _seenIds[item.id] = true;
    items.push(item);
  }

  function collectItems() {
    var c = core();
    if (!c) return [];
    var items = [];
    _seenIds = {};

    // ── 1. Risks: Critical/High with no mitigation owner → CRITICAL ────────
    c.unownedSevereRisks().forEach(function (r) {
      push(items, {
        id: "risk:" + (r.id || r.title),
        section: "critical", icon: "⚠",
        title: L("Risiko uden ejer: ", "Risk without owner: ") + (r.title || "—"),
        detail: L("Alvor", "Severity") + ": " + (r.severity || "—") + " · " + L("Status", "Status") + ": " + (r.status || "—"),
        module: L("Risikoregistret", "Risk Register"), view: "risks"
      });
    });

    // ── 2. CAPA items past target date → CRITICAL ──────────────────────────
    c.overdueCapaItems().forEach(function (item) {
      var days = c.daysSince(item.targetDate);
      push(items, {
        id: "capa:" + item.id,
        section: "critical", icon: "🧩",
        title: L("CAPA over måldato: ", "CAPA past target: ") + (item.title || "—"),
        detail: L("Måldato: ", "Target: ") + (item.targetDate || "—")
          + (days !== null ? " (" + days + L("d overskredet", "d overdue") + ")" : "")
          + (item.owner ? " · " + item.owner : ""),
        module: L("CAPA Manager", "CAPA Manager"), view: "capaRegister"
      });
    });

    // ── 3. Escalated delegations → CRITICAL ───────────────────────────────
    c.delegations().forEach(function (d) {
      if (String(d.status || "").toLowerCase() !== "escalated") return;
      push(items, {
        id: "delegation-esc:" + (d.id || d.taskName),
        section: "critical", icon: "🔺",
        title: L("Eskalering: ", "Escalated: ") + (d.taskName || "—"),
        detail: (d.delegatedToName || (c.memberName && c.memberName(d.delegatedTo)) || d.delegatedTo || "—")
          + " · " + L("Frist: ", "Deadline: ") + (d.deadline || "—"),
        module: L("Delegeringssporing", "Delegation Tracker"), view: "delegationTracker"
      });
    });

    // ── 4. Team health — use module export first, then raw scan ───────────
    var thStatus = getTeamHealthStatus();
    if (thStatus) {
      thStatus.alerts.forEach(function (alert) {
        var section = (alert.type === "critical_score" || alert.type === "question_critical") ? "critical" : "attention";
        var icon = alert.type === "critical_score" ? "🫀"
          : alert.type === "question_critical" ? "🚨"
          : alert.type === "drop" ? "📉"
          : "⏰";
        push(items, {
          id: "th-" + alert.type + ":" + (alert.team || ""),
          section: section, icon: icon,
          title: alert.label || (L("Team health alert: ", "Team health alert: ") + (alert.team || "")),
          detail: alert.detail || "",
          module: L("Hold-sundhed", "Team Health"), view: "teamHealthRadar"
        });
      });
    } else {
      // Fallback: raw scan when module not loaded
      var healthStore = c.teamHealth ? c.teamHealth() : [];
      var byTeam = {};
      healthStore.forEach(function (p) {
        if (!p || !p.teamName) return;
        (byTeam[p.teamName] = byTeam[p.teamName] || []).push(p);
      });
      Object.keys(byTeam).forEach(function (teamName) {
        var pulses = byTeam[teamName].slice().sort(function (a, b) {
          return String(a.weekKey || a.week || "").localeCompare(String(b.weekKey || b.week || ""));
        });
        var last = pulses[pulses.length - 1];
        var prev = pulses[pulses.length - 2];
        var lastScore = Number(last && (last.score !== undefined ? last.score : last.value));
        var prevScore = Number(prev && (prev.score !== undefined ? prev.score : prev.value));

        if (last && lastScore < 50) {
          push(items, {
            id: "teamhealth-low:" + teamName, section: "critical", icon: "🫀",
            title: L("Team-helbred under 50: ", "Team health below 50: ") + teamName,
            detail: (last.weekKey || last.week) + ": " + lastScore + "/100",
            module: L("Hold-sundhed", "Team Health"), view: "teamHealthRadar"
          });
        }
        if (prev && last && prevScore - lastScore > 10) {
          push(items, {
            id: "teamhealth-drop:" + teamName, section: "critical", icon: "📉",
            title: L("Team-helbred faldt ", "Team health dropped ") + (prevScore - lastScore) + L(" point: ", " points: ") + teamName,
            detail: (prev.weekKey || prev.week) + " (" + prevScore + ") → " + (last.weekKey || last.week) + " (" + lastScore + ")",
            module: L("Hold-sundhed", "Team Health"), view: "teamHealthRadar"
          });
        }
      });
    }

    // ── 5. Strategic stakeholders (Manage Closely) with Red health → CRITICAL
    c.stakeholders().forEach(function (s) {
      if (!s.strategicPriority) return;
      var inf = Number(s.influence) || 1;
      var int_ = Number(s.interest) || 1;
      var isManageClosely = inf >= 3 && int_ >= 3;
      if (!isManageClosely) return;
      var freq = Number(s.updateFrequencyDays) > 0 ? Number(s.updateFrequencyDays) : 30;
      var days = s.lastContactDate ? c.daysSince(s.lastContactDate) : null;
      var isRed = days === null || days > freq * 1.5;
      if (!isRed) return;
      push(items, {
        id: "stakeholder-critical:" + (s.id || s.name),
        section: "critical", icon: "🔴",
        title: L("Strategisk interessent uden kontakt: ", "Strategic stakeholder not contacted: ") + (s.name || "—"),
        detail: (s.roleOrganization || "—") + " · " + L("Ingen kontakt i ", "No contact for ") + (days !== null ? days + L(" dage", " days") : L("aldrig", "never")),
        module: L("Interessentkort", "Stakeholder Map"), view: "stakeholderHealthMap"
      });
    });

    // ── 6. Decision health — critical decisions + old pending ──────────────
    var decHealth = getDecisionHealth();
    if (decHealth) {
      // Critical priority decisions still pending
      var decisions = c.decisions ? c.decisions() : [];
      decisions.forEach(function (d) {
        if (d.priority !== "critical") return;
        if (d.outcome && d.outcome !== "pending") return;
        push(items, {
          id: "decision-critical:" + d.id,
          section: "critical", icon: "⚖",
          title: L("Kritisk beslutning uden resultat: ", "Critical decision unresolved: ") + (d.title || "—"),
          detail: L("Registreret: ", "Logged: ") + (d.date || "—")
            + " · " + L("Reversibel: ", "Reversibility: ") + (d.reversibility || "—"),
          module: L("Beslutningslog", "Decision Log"), view: "leadershipDecisionLog"
        });
      });
      // Old pending decisions
      if (decHealth.pendingOld > 0) {
        decisions.forEach(function (d) {
          if (d.outcome && d.outcome !== "pending") return;
          var age = d.date ? c.daysSince(d.date) : null;
          if (age === null || age < 14) return;
          push(items, {
            id: "decision-stale:" + d.id,
            section: "attention", icon: "🕰",
            title: L("Beslutning afventer > 14 dage: ", "Decision pending > 14 days: ") + (d.title || "—"),
            detail: L("Logget: ", "Logged: ") + (d.date || "—") + " · " + age + L("d siden", "d ago"),
            module: L("Beslutningslog", "Decision Log"), view: "leadershipDecisionLog"
          });
        });
      }
    }

    // ── 7. Situational leadership alerts ──────────────────────────────────
    var slHealth = getSituationalHealth();
    if (slHealth) {
      slHealth.alerts.forEach(function (alert) {
        var section = alert.type === "regression" ? "critical" : "attention";
        var icon = alert.type === "regression" ? "⬇" : "🧭";
        push(items, {
          id: "sl-" + alert.type + ":" + (alert.memberId || "") + ":" + (alert.task || ""),
          section: section, icon: icon,
          title: alert.label || (L("SLII alert: ", "SLII alert: ") + (alert.memberName || "")),
          detail: alert.detail || "",
          module: L("Situationsoversigt", "Situational Guide"), view: "situationalGuide"
        });
      });
    }

    // ── 8. Tasks overdue → ATTENTION ──────────────────────────────────────
    c.overdueTasks().forEach(function (t) {
      var days = c.daysSince(t.dueDate);
      push(items, {
        id: "task:" + (t.id || t.title), section: "attention", icon: "📋",
        title: L("Opgave forsinket: ", "Task overdue: ") + (t.title || "—"),
        detail: L("Frist: ", "Due: ") + (t.dueDate || "—")
          + (days !== null ? " (" + days + L("d", "d") + ")" : "")
          + " · " + (t.owner || "—"),
        module: L("Opgaver", "Tasks"), view: "tasks"
      });
    });

    // ── 9. Standup blockers > 48h → ATTENTION ─────────────────────────────
    c.staleBlockers().forEach(function (b) {
      push(items, {
        id: "blocker:" + (b.id || b.text), section: "attention", icon: "🚧",
        title: L("Blocker uløst > 48t: ", "Blocker unresolved > 48h: ") + (b.text || "—"),
        detail: b.createdAt ? L("Oprettet: ", "Created: ") + b.createdAt : L("Ikke tidsstemplet", "Not timestamped"),
        module: L("Standup", "Standup"), view: "standup"
      });
    });

    // ── 10. Silent delegations > 48h → ATTENTION ──────────────────────────
    c.delegations().forEach(function (d) {
      if (String(d.status || "").toLowerCase() !== "active") return;
      var stamp = null;
      if (Array.isArray(d.checkIns) && d.checkIns.length) stamp = d.checkIns[d.checkIns.length - 1].date;
      if (!stamp) stamp = d.lastUpdateDate || d.delegatedDate || null;
      var hours = stamp ? c.hoursSince(stamp) : null;
      if (hours !== null && hours <= 48) return;
      push(items, {
        id: "delegation:" + (d.id || d.taskName), section: "attention", icon: "🪄",
        title: L("Delegation stille > 48t: ", "Delegation silent > 48h: ") + (d.taskName || "—"),
        detail: (d.delegatedToName || (c.memberName && c.memberName(d.delegatedTo)) || d.delegatedTo || "—")
          + " · " + L("Sidst: ", "Last: ") + (stamp || L("aldrig", "never")),
        module: L("Delegeringssporing", "Delegation Tracker"), view: "delegationTracker"
      });
    });

    // ── 11. No 1:1 in > 14 days → ATTENTION ──────────────────────────────
    c.members().forEach(function (m) {
      var last = c.lastOneOnOneDate(m.id);
      var days = last ? c.daysSince(last) : null;
      if (days !== null && days <= 14) return;
      push(items, {
        id: "oneonone:" + m.id, section: "attention", icon: "🤝",
        title: L("Ingen 1:1 med ", "No 1:1 with ") + m.name + (days === null ? "" : " (" + days + L("d", "d") + ")"),
        detail: days === null ? L("Aldrig logget.", "Never logged.") : L("Sidst for ", "Last was ") + days + L(" dage siden.", " days ago."),
        module: L("1:1-manager", "1:1 Manager"), view: "oneOnOneManager"
      });
    });

    // ── 12. Decisions due for review → ATTENTION ──────────────────────────
    var decisionsForReview = c.decisions ? c.decisions() : [];
    decisionsForReview.forEach(function (d) {
      if (!d.reviewDate || d.status === "reviewed" || d.status === "reversed") return;
      var days = c.daysSince(d.reviewDate);
      if (days === null || days < 0) return;
      push(items, {
        id: "decision-review:" + d.id, section: "attention", icon: "⚖",
        title: L("Beslutning klar til review: ", "Decision ready for review: ") + (d.title || "—"),
        detail: L("Reviewdato: ", "Review date: ") + d.reviewDate + (days > 0 ? " (" + days + L("d forfalden", "d overdue") + ")" : " " + L("(i dag)", "(today)")),
        module: L("Beslutningslog", "Decision Log"), view: "leadershipDecisionLog"
      });
    });

    // ── 13. No recognition > 14 days → FOLLOW-UP ──────────────────────────
    c.members().forEach(function (m) {
      var last = c.lastRecognitionDate(m.id);
      var days = last ? c.daysSince(last) : null;
      if (days !== null && days <= 14) return;
      push(items, {
        id: "recognition:" + m.id, section: "followup", icon: "🌟",
        title: L("Ingen anerkendelse til ", "No recognition for ") + m.name + (days !== null ? " (" + days + L("d", "d") + ")" : ""),
        detail: days === null ? L("Aldrig logget.", "Never logged.") : L("Sidst for ", "Last was ") + days + L(" dage siden.", " days ago."),
        module: L("Anerkendelseslog", "Recognition Log"), view: "recognitionLog"
      });
    });

    // ── 14. Stakeholders overdue for contact → FOLLOW-UP ──────────────────
    c.stakeholders().forEach(function (s) {
      var inf = Number(s.influence) || 1;
      var int_ = Number(s.interest) || 1;
      var freq = Number(s.updateFrequencyDays) > 0 ? Number(s.updateFrequencyDays) : 30;
      var days = s.lastContactDate ? c.daysSince(s.lastContactDate) : null;
      if (days !== null && days <= freq) return;
      // Skip ones already promoted to CRITICAL
      if (s.strategicPriority && inf >= 3 && int_ >= 3 && (days === null || days > freq * 1.5)) return;
      push(items, {
        id: "stakeholder:" + (s.id || s.name), section: "followup", icon: "🧭",
        title: L("Kontakt forfalden: ", "Contact overdue: ") + (s.name || "—"),
        detail: (s.roleOrganization || "")
          + " · " + L("Frekvens: ", "Frequency: ") + freq + L("d", "d")
          + " · " + L("Sidst: ", "Last: ") + (s.lastContactDate || L("aldrig", "never")),
        module: L("Interessentkort", "Stakeholder Map"), view: "stakeholderHealthMap"
      });
    });

    // ── 15. Succession critical gaps → CRITICAL ────────────────────────────
    var sucH = getSuccessionHealth();
    if (sucH && sucH.criticalGaps > 0) {
      push(items, {
        id: "succession-gap:critical",
        section: "critical", icon: "🏆",
        title: L("Succession: ", "Succession: ") + sucH.criticalGaps + L(" kritiske stillinger uden dækning", " critical positions with no coverage"),
        detail: L("Ingen 'klar nu' kandidater til kritiske stillinger", "No 'ready now' candidates for critical positions"),
        module: L("Succession Pipeline", "Succession Pipeline"), view: "successionPipeline"
      });
    }
    if (sucH && sucH.flightRisks > 0) {
      push(items, {
        id: "succession-flight:" + sucH.flightRisks,
        section: "attention", icon: "✈",
        title: sucH.flightRisks + L(" succession-kandidat(er) med høj flight risk", " succession candidate(s) at high flight risk"),
        detail: L("Disse kandidater kan forlade organisationen inden de er klar", "These candidates may leave before they're ready"),
        module: L("Succession Pipeline", "Succession Pipeline"), view: "successionPipeline"
      });
    }

    // ── 16. 90-Day plan overdue objectives → ATTENTION ─────────────────────
    var ndH = getNinetyDayHealth();
    if (ndH && ndH.activePlan && ndH.overdueCount > 0) {
      push(items, {
        id: "ninetyday-overdue:" + ndH.overdueCount,
        section: "attention", icon: "🗓",
        title: L("90-dages plan: ", "90-Day plan: ") + ndH.overdueCount + L(" forfaldne mål", " overdue objectives"),
        detail: L("Plan: ", "Plan: ") + (ndH.activePlan || "") + " · " + ndH.daysRemaining + L("d tilbage", "d remaining") + " · Fase " + ndH.currentPhase + "d",
        module: L("90-dages plan", "90-Day Plan"), view: "ninetyDay"
      });
    }

    // ── 17. Journal: no reflection this week → ATTENTION ──────────────────
    var jH = getJournalHealth();
    if (jH && !jH.reflectedThisWeek) {
      push(items, {
        id: "journal-missing-week",
        section: "attention", icon: "📓",
        title: L("Ingen ugentlig refleksion denne uge", "No weekly reflection this week"),
        detail: L("Refleksioner er vigtige for lederskabsvækst og bidrager til cadence score", "Weekly reflections drive growth and cadence score"),
        module: L("Lederjournal", "Leadership Journal"), view: "leadershipJournal"
      });
    }

    return items.sort(function (a, b) {
      return SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section);
    });
  }

  /* ─── Screen state ────────────────────────────────────────────────────── */

  function rerender() {
    var container = document.getElementById("dailyBriefRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Item card ───────────────────────────────────────────────────────── */

  function itemHtml(item) {
    return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface)">'
      + '<span style="font-size:16px;flex-shrink:0;margin-top:1px" aria-hidden="true">' + item.icon + "</span>"
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(item.title) + "</div>"
        + '<div style="font-size:11.5px;color:var(--text-3);margin-top:2px">' + esc(item.detail) + "</div>"
        + '<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap">'
          + '<button type="button" class="btn btn-sm btn-primary" data-act="db:go:' + esc(item.view) + '">'
            + esc(L("Åbn →", "Open →")) + "</button>"
          + '<button type="button" class="btn btn-sm" data-act="db:dismiss:' + esc(item.id) + '">'
            + esc(L("Afvis i dag", "Dismiss today")) + "</button>"
          + '<span class="kpi-sub">' + esc(item.module) + "</span>"
        + "</div>"
      + "</div>"
      + "</div>";
  }

  function sectionGroupHtml(key, items) {
    var meta = SECTION_META[key];
    var color = meta.color;
    return '<div style="margin-bottom:16px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<div style="width:3px;height:14px;border-radius:99px;background:' + color + '"></div>'
        + '<span style="font-size:11px;font-weight:700;color:' + color + ';letter-spacing:.5px">'
          + esc(L(meta.label.da, meta.label.en)) + "</span>"
        + '<span style="font-size:11px;color:var(--text-3)">(' + items.length + ")</span>"
      + "</div>"
      + '<div style="border:1px solid var(--line);border-radius:8px;overflow:hidden">'
        + items.map(itemHtml).join("")
      + "</div>"
    + "</div>";
  }

  /* ─── All-clear card ─────────────────────────────────────────────────── */

  function allClearHtml(c) {
    var score = cadenceScore(c);
    var intention = weekIntention(c);
    return '<div class="card" style="text-align:center;padding:32px 24px">'
      + '<div style="font-size:32px;margin-bottom:8px">✓</div>'
      + '<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px">'
        + esc(L("Du er klar. God ledelsesdag.", "You're clear. Good leadership day.")) + "</div>"
      + '<div style="font-size:12px;color:var(--text-3)">' + esc(c.todayISO()) + "</div>"
      + '<div style="margin-top:16px">' + cadenceBar(score) + "</div>"
      + '<div style="font-size:11.5px;color:var(--text-3);margin-top:6px">'
        + esc(L("Kadencescore disse 7 dage", "Cadence score this 7 days")) + "</div>"
      + moduleHealthStripHtml()
      + (intention
          ? '<div style="margin-top:14px;padding:10px 14px;background:var(--accent-soft);border-radius:6px;text-align:left">'
              + '<div style="font-size:11px;font-weight:600;color:var(--accent-text);margin-bottom:3px">📌 ' + esc(L("Ugens intention", "This week's intention")) + '</div>'
              + '<div style="font-size:13px;color:var(--text)">' + esc(intention) + "</div>"
            + "</div>"
          : "")
      + "</div>";
  }

  /* ─── View ────────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">' + esc(L("Datalaget er ikke indlæst.", "The data layer is not loaded.")) + "</div>";
    try { c.run(); } catch (_e) {}

    var all = collectItems();
    var visible = all.filter(function (item) { return !c.isDismissed(item.id); });

    if (visible.length === 0) return allClearHtml(c);

    var out = pulseCardHtml(c, visible);
    SECTIONS.forEach(function (key) {
      var group = visible.filter(function (item) { return item.section === key; });
      if (group.length) out += sectionGroupHtml(key, group);
    });

    return out;
  }

  /* ─── Wiring ──────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"));
      });
    }
  }

  function handle(act) {
    if (act.indexOf("db:") !== 0) return;
    var c = core(); if (!c) return;
    if (act.indexOf("db:go:") === 0) {
      if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate(act.slice(6));
      return;
    }
    if (act.indexOf("db:dismiss:") === 0) { c.dismiss(act.slice(11)); rerender(); return; }
    if (act === "db:refresh") rerender();
  }

  function open() {
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("dailyBrief");
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, collectItems: collectItems, SECTIONS: SECTIONS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCDailyBriefUI = API;
})(typeof window !== "undefined" ? window : globalThis);
