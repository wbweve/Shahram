/* ============================================================================
   js/team-health-radar-ui.js — TEAM HEALTH RADAR (Module 7)

   Hackman's 5 conditions for team effectiveness:
     1. Direction (Compelling direction)
     2. Energy    (Enabling structure)
     3. Trust     (Supportive context — interpersonal)
     4. Workload  (Supportive context — resources)
     5. Safety    (Expert coaching / psychological safety)

   Score = average(ratings) × 20 → 0–100. Per team, per ISO week.

   Daily Brief integration: getTeamHealthStatus() → alerts on drop >10 or score <50.

   localStorage: "teamHealth" (TeamHealthEntry[]), "myTeams" (string[])
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  /* ─── Model ──────────────────────────────────────────────────────────────── */

  var QUESTIONS = [
    {
      key: "direction",
      en: "Direction",       da: "Retning",
      prompt: { en: "The team knows what we're working toward and why it matters.", da: "Teamet ved, hvad vi arbejder hen imod, og hvorfor det betyder noget." },
      low:    { en: "Revisit and co-create a team charter or North Star metric. Direction must be compelling, not just clear.", da: "Gennemgå og skab fælles team-charter eller North Star-metrik. Retning skal være overbevisende, ikke bare klar." },
      hackman: "Compelling direction"
    },
    {
      key: "energy",
      en: "Energy",          da: "Energi",
      prompt: { en: "The team feels energized and engaged in the work.", da: "Teamet føler sig energiske og engagerede i arbejdet." },
      low:    { en: "Find the energy drain: is it the work, the process, or friction between people? Name it explicitly.", da: "Find energidrænet: er det arbejdet, processen eller friktion mellem folk? Navngiv det eksplicit." },
      hackman: "Enabling structure"
    },
    {
      key: "trust",
      en: "Trust",           da: "Tillid",
      prompt: { en: "Team members trust each other and can rely on follow-through.", da: "Teammedlemmerne stoler på hinanden og kan regne med, at ting sker." },
      low:    { en: "Trust is built through small kept commitments. Ask for and honour micro-commitments before the big ones.", da: "Tillid opbygges gennem opfyldte mikroforpligtelser. Bed om og oprethold mikroforpligtelser inden de store." },
      hackman: "Supportive context"
    },
    {
      key: "workload",
      en: "Workload",        da: "Arbejdsbyrde",
      prompt: { en: "The workload is manageable — not unsustainably high or frustratingly low.", da: "Arbejdsbyrden er håndterbar — ikke uholdbart høj eller frustrerende lav." },
      low:    { en: "Map what the team carries vs. capacity. Drop, delegate, or defer — but be explicit about what you're removing.", da: "Kortlæg hvad teamet bærer kontra kapaciteten. Drop, deleger eller udsæt — men vær eksplicit om, hvad du fjerner." },
      hackman: "Supportive context"
    },
    {
      key: "safety",
      en: "Safety",          da: "Tryghed",
      prompt: { en: "People raise concerns, mistakes, and ideas without fear of punishment.", da: "Folk rejser bekymringer, fejl og ideer uden frygt for straf." },
      low:    { en: "Model vulnerability: share a recent mistake and what you learned. Ask for dissenting opinions explicitly in meetings.", da: "Modeller sårbarhed: del en nylig fejl og hvad du lærte. Bed eksplicit om afvigende meninger i møder." },
      hackman: "Expert coaching"
    }
  ];

  /* ─── Scoring ─────────────────────────────────────────────────────────────── */

  function scoreOf(ratings) {
    var vals = QUESTIONS.map(function (q) { return Number(ratings && ratings[q.key]) || 0; });
    if (vals.some(function (v) { return v === 0; })) return null;
    return Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / QUESTIONS.length * 20);
  }

  function scoreColor(s) {
    if (s === null || s === undefined) return "var(--muted)";
    if (s >= 80) return "var(--success-text, #15803d)";
    if (s >= 60) return "var(--warning-text, #d97706)";
    return "var(--danger-text, #dc2626)";
  }
  function scoreLabel(s) {
    if (s === null || s === undefined) return "—";
    if (s >= 80) return L("Stærkt","Strong");
    if (s >= 60) return L("Moderat","Moderate");
    return L("Kritisk","Critical");
  }

  /* ─── Daily Brief export ─────────────────────────────────────────────────── */

  function getTeamHealthStatus() {
    var c = core(); if (!c) return { alerts: [], teams: [] };
    var all    = c.teamHealth ? c.teamHealth() : [];
    var teams  = c.myTeams   ? c.myTeams()    : [];
    var alerts = [];
    var result = [];
    teams.forEach(function (t) {
      var entries = all.filter(function (e) { return e && e.teamName === t; })
        .sort(function (a, b) { return String(b.weekKey || "").localeCompare(String(a.weekKey || "")); });
      var latest  = entries[0];
      var prev    = entries[1];
      var score   = latest ? (latest.score !== undefined ? Number(latest.score) : scoreOf(latest.ratings)) : null;
      var prevScore = prev ? (prev.score !== undefined ? Number(prev.score) : scoreOf(prev.ratings)) : null;
      var weeksSinceAssessed = null;
      if (latest && latest.weekKey && c.weekKey) {
        /* rough weeks difference */
        var lDate = isoWeekToDate(latest.weekKey);
        if (lDate) weeksSinceAssessed = Math.round((Date.now() - lDate) / (7 * 86400000));
      }
      result.push({ team: t, score: score, prevScore: prevScore, weeksSinceAssessed: weeksSinceAssessed });
      if (score !== null && score < 50)                             alerts.push({ team: t, type: "critical", score: score });
      if (score !== null && prevScore !== null && prevScore - score > 10) alerts.push({ team: t, type: "drop", from: prevScore, to: score });
      if (weeksSinceAssessed !== null && weeksSinceAssessed > 2)   alerts.push({ team: t, type: "stale", weeks: weeksSinceAssessed });
      /* question-level alerts */
      if (latest && latest.ratings) {
        QUESTIONS.forEach(function (q) {
          if (Number(latest.ratings[q.key]) === 1) alerts.push({ team: t, type: "question", question: L(q.da, q.en) });
        });
      }
    });
    return { alerts: alerts, teams: result };
  }

  function isoWeekToDate(weekKey) {
    /* weekKey format: "2026-W42" */
    try {
      var parts = weekKey.split("-W");
      var year  = parseInt(parts[0], 10);
      var week  = parseInt(parts[1], 10);
      var jan4  = new Date(year, 0, 4);
      var dayOfWeek = jan4.getDay() || 7;
      var weekStart = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000 + (week - 1) * 7 * 86400000);
      return weekStart;
    } catch (e) { return null; }
  }

  /* ─── Screen state ───────────────────────────────────────────────────────── */

  var activeTeam  = "";
  var activeTab   = "pulse";   /* pulse | history | actions */
  var formError   = null;
  var savedFlash  = false;

  function rerender() {
    var container = document.getElementById("teamHealthRadarRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Visual helpers ─────────────────────────────────────────────────────── */

  function progressBar(pct, color, height) {
    height = height || 6;
    return '<div style="flex:1;height:' + height + 'px;background:var(--border);border-radius:' + Math.ceil(height/2) + 'px;overflow:hidden">'
      + '<div style="height:100%;width:' + Math.min(100, Math.max(0, pct)) + '%;background:' + color + ';border-radius:' + Math.ceil(height/2) + 'px;transition:width .3s"></div></div>';
  }

  function scoreWidget(score) {
    if (score === null) return '<span class="kpi-sub">—</span>';
    var color = scoreColor(score);
    return '<div style="text-align:right">'
      + '<div style="font-size:28px;font-weight:700;color:' + color + ';line-height:1">' + score + "</div>"
      + '<div class="kpi-sub">/ 100 · ' + esc(scoreLabel(score)) + "</div></div>";
  }

  /* Mini sparkline: last N scores as vertical bars */
  function sparkline(scores) {
    var valid = scores.filter(function (s) { return s !== null; });
    if (!valid.length) return "";
    var max = Math.max.apply(null, valid) || 1;
    return '<div style="display:flex;align-items:flex-end;gap:2px;height:24px">'
      + scores.map(function (s) {
          var h = s !== null ? Math.max(3, Math.round((s / max) * 24)) : 3;
          var color = s !== null ? scoreColor(s) : "var(--border)";
          return '<div style="width:5px;height:' + h + 'px;background:' + color + ';border-radius:2px 2px 0 0"></div>';
        }).join("")
      + "</div>";
  }

  /* ─── Team list / KPIs ───────────────────────────────────────────────────── */

  function teamsKpiHtml(c) {
    var teams   = c.myTeams ? c.myTeams() : [];
    var all     = c.teamHealth ? c.teamHealth() : [];
    var thisWeek = c.weekKey ? c.weekKey() : "";
    if (!teams.length) return "";
    var cards = teams.map(function (t) {
      var entries = all.filter(function (e) { return e && e.teamName === t; })
        .sort(function (a, b) { return String(b.weekKey||"").localeCompare(String(a.weekKey||"")); });
      var latest  = entries[0];
      var prev    = entries[1];
      var score   = latest ? (latest.score !== undefined ? Number(latest.score) : scoreOf(latest.ratings)) : null;
      var prevScore = prev ? (prev.score !== undefined ? Number(prev.score) : scoreOf(prev.ratings)) : null;
      var delta   = (score !== null && prevScore !== null) ? score - prevScore : null;
      var hasThisWeek = latest && latest.weekKey === thisWeek;
      var color   = score !== null ? scoreColor(score) : "var(--muted)";
      var scores5 = entries.slice(0, 5).reverse().map(function (e) { return e.score !== undefined ? Number(e.score) : scoreOf(e.ratings); });
      var isActive = t === activeTeam;
      return '<button type="button" data-act="th:team:' + esc(t) + '" style="text-align:left;background:var(--surface);border:1.5px solid ' + (isActive ? "var(--accent)" : "var(--border)") + ';border-radius:10px;padding:12px 14px;cursor:pointer;width:100%">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">'
        + '<div style="font-weight:600;font-size:13px">' + esc(t) + (hasThisWeek ? ' <span style="font-size:10px;color:var(--success-text)">✓ ' + esc(L("Denne uge","This week")) + "</span>" : "") + "</div>"
        + (score !== null ? '<div style="font-size:18px;font-weight:700;color:' + color + '">' + score + "</div>" : '<div class="kpi-sub">—</div>')
        + "</div>"
        + (score !== null ? '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' + progressBar(score, color, 5) + (delta !== null ? '<span style="font-size:11px;color:' + (delta >= 0 ? "var(--success-text)" : "var(--danger-text)") + '">' + (delta > 0 ? "+" : "") + delta + "</span>" : "") + "</div>" : "")
        + '<div style="display:flex;justify-content:space-between;align-items:flex-end">'
        + '<div class="kpi-sub">' + esc(scoreLabel(score)) + "</div>"
        + sparkline(scores5)
        + "</div></button>";
    });
    return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:16px">' + cards.join("") + "</div>";
  }

  /* ─── Manage teams panel ─────────────────────────────────────────────────── */

  function manageTeamsHtml(c) {
    var teams = c.myTeams ? c.myTeams() : [];
    return '<details style="margin-bottom:12px"><summary style="cursor:pointer;font-size:12px;color:var(--muted);padding:4px 0">' + esc(L("Administrér teams","Manage teams")) + "</summary>"
      + '<div style="padding:10px 0">'
      + (teams.length ? teams.map(function (t) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">'
            + '<span style="font-size:13px">' + esc(t) + "</span>"
            + '<button type="button" class="btn btn-sm" data-act="th:delTeam:' + esc(t) + '">' + esc(L("Fjern","Remove")) + "</button></div>";
        }).join("") : '<div class="kpi-sub">' + esc(L("Ingen teams endnu.","No teams yet.")) + "</div>")
      + '<form id="thTeamForm" style="display:flex;gap:8px;align-items:flex-end;margin-top:10px">'
      + '<input type="text" id="thTeamName" maxlength="60" placeholder="' + esc(L("Nyt team…","New team…")) + '" style="flex:1">'
      + '<button class="btn btn-primary" type="submit">' + esc(L("Tilføj","Add")) + "</button></form></div></details>";
  }

  /* ─── Pulse form ─────────────────────────────────────────────────────────── */

  function pulseFormHtml(c, team) {
    var week    = c.weekKey ? c.weekKey() : "";
    var all     = c.teamHealth ? c.teamHealth() : [];
    var entries = all.filter(function (e) { return e && e.teamName === team && e.weekKey === week; });
    var current = entries[entries.length - 1] || null;
    var ratings = (current && current.ratings) || {};
    var score   = current ? (current.score !== undefined ? Number(current.score) : scoreOf(current.ratings)) : null;

    /* Trend: compare per question vs prev week */
    var prevWeek = all.filter(function (e) { return e && e.teamName === team; })
      .filter(function (e) { return e.weekKey !== week; })
      .sort(function (a, b) { return String(b.weekKey||"").localeCompare(String(a.weekKey||"")); })[0] || null;
    var prevRatings = prevWeek ? (prevWeek.ratings || {}) : {};

    var rows = QUESTIONS.map(function (q) {
      var cur = Number(ratings[q.key]) || 0;
      var pre = Number(prevRatings[q.key]) || 0;
      var trendArrow = pre && cur ? (cur > pre ? ' <span style="color:var(--success-text)">↑</span>' : cur < pre ? ' <span style="color:var(--danger-text)">↓</span>' : "") : "";
      var selectOpts = '<option value="">' + esc(L("—","—")) + "</option>";
      var scaleLabels = ["","",L("Meget lav","Very low"),L("Lav","Low"),L("Okay","Okay"),L("God","Good"),L("Fremragende","Excellent")];
      for (var v = 1; v <= 5; v++) {
        selectOpts += '<option value="' + v + '"' + (cur === v ? " selected" : "") + ">" + v + " — " + esc(scaleLabels[v]) + "</option>";
      }
      var isLow = cur > 0 && cur <= 2;
      return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'
        + '<div style="flex:1;min-width:180px">'
        + '<div style="font-size:13px;font-weight:600">' + esc(L(q.da, q.en)) + trendArrow + "</div>"
        + '<div class="kpi-sub" style="margin-top:2px">' + esc(L(q.prompt.da, q.prompt.en)) + "</div>"
        + (cur ? '<div style="display:flex;align-items:center;gap:6px;margin-top:5px">'
            + progressBar((cur / 5) * 100, cur >= 3.5 ? "var(--success-text)" : cur >= 2.5 ? "var(--warning-text)" : "var(--danger-text)", 5)
            + '<span class="kpi-sub">' + cur + "/5</span></div>" : "")
        + "</div>"
        + '<select data-q="' + q.key + '" style="min-width:160px">' + selectOpts + "</select></div>"
        + (isLow ? '<div style="background:var(--danger-subtle,rgba(220,38,38,.08));border-radius:6px;padding:7px 10px;margin-top:6px;font-size:12px;color:var(--danger-text)">'
            + "<strong>" + esc(L("Handling:","Action:")) + "</strong> " + esc(L(q.low.da, q.low.en)) + "</div>" : "")
        + "</div>";
    }).join("");

    return '<div class="card info-card" style="margin-bottom:14px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px">'
      + '<div><div style="font-size:15px;font-weight:700">' + esc(L("Ugepuls","Weekly pulse")) + "</div>"
      + '<div class="kpi-sub">' + esc(team) + " · " + esc(week) + "</div>"
      + '<div class="kpi-sub">' + esc(L("1 = Meget lav  5 = Fremragende","1 = Very low  5 = Excellent")) + "</div></div>"
      + scoreWidget(score) + "</div>"
      + (score !== null ? '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + progressBar(score, scoreColor(score), 8) + "</div>" : "")
      + '<form id="thPulseForm">' + rows
      + '<div style="display:flex;gap:8px;align-items:center;margin-top:14px">'
      + '<button class="btn btn-primary" type="submit">' + esc(L("Gem ugepuls","Save weekly pulse")) + "</button>"
      + (savedFlash ? '<span style="font-size:12px;color:var(--success-text)">✓ ' + esc(L("Gemt","Saved")) + "</span>" : "")
      + (formError ? '<span style="font-size:12px;color:var(--danger-text)">' + esc(formError) + "</span>" : "")
      + "</div></form></div>";
  }

  /* ─── History tab ────────────────────────────────────────────────────────── */

  function historyHtml(c, team) {
    var all = (c.teamHealth ? c.teamHealth() : []).filter(function (e) { return e && e.teamName === team; })
      .sort(function (a, b) { return String(b.weekKey||"").localeCompare(String(a.weekKey||"")); })
      .slice(0, 12);
    if (!all.length) return '<div class="empty">' + esc(L("Ingen pulsdata endnu for dette team.","No pulse data for this team yet.")) + "</div>";

    /* Alerts from latest entry */
    var latest = all[0], prev = all[1];
    var s0 = latest.score !== undefined ? Number(latest.score) : scoreOf(latest.ratings);
    var s1 = prev ? (prev.score !== undefined ? Number(prev.score) : scoreOf(prev.ratings)) : null;
    var alertItems = [];
    if (s0 !== null && s0 < 50)            alertItems.push(L("Score under 50 — teamet er i kritisk tilstand.","Score below 50 — team is in critical condition."));
    if (s0 !== null && s1 !== null && s1 - s0 > 10) alertItems.push(L("Fald på >10 point uge-over-uge — undersøg årsagen straks.","Drop of >10 points week-over-week — investigate immediately."));
    QUESTIONS.forEach(function (q) {
      if (Number((latest.ratings||{})[q.key]) === 1) alertItems.push(esc(L(q.da,q.en)) + ": 1/5 — " + L(q.low.da,q.low.en));
    });

    var rows = all.map(function (e, i) {
      var score    = e.score !== undefined ? Number(e.score) : scoreOf(e.ratings);
      var prevE    = all[i + 1];
      var prevS    = prevE ? (prevE.score !== undefined ? Number(prevE.score) : scoreOf(prevE.ratings)) : null;
      var delta    = score !== null && prevS !== null ? score - prevS : null;
      var deltaStr = delta === null ? "—" : (delta > 0 ? "+" + delta : String(delta));
      var deltaColor = delta === null ? "" : delta < -5 ? "var(--danger-text)" : delta < 0 ? "var(--warning-text)" : "var(--success-text)";
      return "<tr>"
        + "<td>" + esc(e.weekKey || "—") + "</td>"
        + QUESTIONS.map(function (q) {
            var v = Number((e.ratings||{})[q.key]) || 0;
            var color = v >= 4 ? "var(--success-text)" : v >= 3 ? "var(--warning-text)" : v ? "var(--danger-text)" : "var(--muted)";
            return '<td style="text-align:center;font-weight:600;color:' + color + '">' + (v || "—") + "</td>";
          }).join("")
        + '<td style="font-weight:700;color:' + scoreColor(score) + '">' + (score !== null ? score : "—") + "</td>"
        + '<td style="color:' + deltaColor + '">' + esc(deltaStr) + "</td>"
        + "</tr>";
    }).join("");

    return (alertItems.length ? '<div style="background:var(--danger-subtle,rgba(220,38,38,.07));border-radius:8px;padding:10px 14px;margin-bottom:12px">'
        + '<div style="font-size:12px;font-weight:600;color:var(--danger-text);margin-bottom:4px">⚠ ' + esc(L("Alerts","Alerts")) + "</div>"
        + alertItems.map(function (a) { return '<div style="font-size:12px;color:var(--danger-text);margin-bottom:2px">· ' + a + "</div>"; }).join("")
        + "</div>" : "")
      + '<div class="table-wrap"><table class="table" style="font-size:12px"><thead><tr>'
      + "<th>" + esc(L("Uge","Week")) + "</th>"
      + QUESTIONS.map(function (q, i) { return '<th title="' + esc(L(q.da, q.en)) + '" style="text-align:center">' + (i + 1) + "</th>"; }).join("")
      + "<th>" + esc(L("Score","Score")) + "</th><th>Δ</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>"
      + "<div class=\"kpi-sub\" style=\"margin-top:6px\">" + QUESTIONS.map(function (q, i) { return (i+1) + " · " + esc(L(q.da, q.en)); }).join(" &nbsp; ") + "</div>";
  }

  /* ─── Actions tab ────────────────────────────────────────────────────────── */

  function actionsHtml(c, team) {
    var all     = c.teamHealth ? c.teamHealth() : [];
    var entries = all.filter(function (e) { return e && e.teamName === team; })
      .sort(function (a, b) { return String(b.weekKey||"").localeCompare(String(a.weekKey||"")); });
    if (!entries.length) return '<div class="empty">' + esc(L("Log en ugepuls først for at se anbefalede handlinger.","Log a weekly pulse first to see recommended actions.")) + "</div>";

    var latest  = entries[0];
    var ratings = latest.ratings || {};
    var score   = latest.score !== undefined ? Number(latest.score) : scoreOf(latest.ratings);

    /* Sort questions by score ascending — worst first */
    var qs = QUESTIONS.slice().map(function (q) {
      return { q: q, val: Number(ratings[q.key]) || 0 };
    }).sort(function (a, b) { return a.val - b.val; });

    /* 5-condition Hackman matrix */
    var HACKMAN_ACTIONS = {
      direction: [
        L("Faciliter en 30-minutters session: Hvad er vores mål? Hvad er vi IKKE?","Run a 30-min session: What is our goal? What are we NOT?"),
        L("Del 3 konkrete succeskriterier for kvartalet med hele teamet.","Share 3 concrete success criteria for the quarter with the full team."),
        L("Hæng en synlig North Star op — digitalt eller fysisk.","Post a visible North Star — digital or physical.")
      ],
      energy: [
        L("Identificér den ene ting, der drainer mest energi. Fjern den eller adresser den explicit.","Identify the one thing draining the most energy. Remove it or address it explicitly."),
        L("Tilføj en 'wins'-runde i næste teammøde — 2 min per person.","Add a 'wins' round to the next team meeting — 2 min per person."),
        L("Giv teamet en kortere men fokuseret sprint i stedet for langstrakt uklarhed.","Give the team a shorter, focused sprint instead of prolonged ambiguity.")
      ],
      trust: [
        L("Lav et 'working agreements' dokument med teamet — hvad forventer vi af hinanden?","Create a 'working agreements' document with the team — what do we expect of each other?"),
        L("Følg op på én aftale der ikke blev holdt. Gør det respektfuldt og direkte.","Follow up on one agreement that wasn't kept. Do it respectfully and directly."),
        L("Introducer en 'commitment' check i slutningen af hvert møde.","Introduce a 'commitment' check at the end of every meeting.")
      ],
      workload: [
        L("Lav en kapacitetskortlægning: hvad bærer hvert teammedlem i dag?","Run a capacity mapping: what is each team member carrying today?"),
        L("Drop, deleger eller udsæt mindst ét projekt i denne uge. Vær explicit.","Drop, delegate, or defer at least one project this week. Be explicit."),
        L("Beskyt 20% fokustid per teammedlem — blokér kalenderen.","Protect 20% focus time per team member — block the calendar.")
      ],
      safety: [
        L("Åbn næste møde med en fejl du selv lavede og hvad du lærte.","Open the next meeting with a mistake you made and what you learned."),
        L("Bed explicit om 'hvad er vi ikke enige i her?' før I beslutter.","Ask explicitly for 'what do we disagree with here?' before deciding."),
        L("Introducer anonyme ugentlige spørgsmål — f.eks. via Mentimeter.","Introduce anonymous weekly questions — e.g. via Mentimeter.")
      ]
    };

    var html = '<div class="kpi-sub" style="margin-bottom:12px">' + esc(L("Anbefalede handlinger baseret på ugepulsen for ","Recommended actions based on the weekly pulse for ")) + esc(latest.weekKey || "") + "</div>";

    qs.forEach(function (item) {
      if (!item.val) return;
      var color = item.val >= 4 ? "var(--success-text)" : item.val >= 3 ? "var(--warning-text)" : "var(--danger-text)";
      var acts  = HACKMAN_ACTIONS[item.q.key] || [];
      var priority = item.val <= 2 ? "🔴" : item.val <= 3 ? "🟡" : "🟢";
      html += '<div class="card info-card" style="margin-bottom:10px;border-left:3px solid ' + color + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<div style="font-weight:600;font-size:13px">' + priority + " " + esc(L(item.q.da, item.q.en)) + "</div>"
        + '<span style="font-size:12px;font-weight:700;color:' + color + '">' + item.val + "/5</span></div>"
        + (item.val <= 3 ? '<ul style="margin:0;padding-left:18px">'
            + acts.map(function (a) { return '<li style="font-size:12px;margin-bottom:4px">' + esc(a) + "</li>"; }).join("")
            + "</ul>" : '<div class="kpi-sub">' + esc(L("Godt — hold niveauet med regelmæssig opmærksomhed.","Good — maintain the level with regular attention.")) + "</div>")
        + "</div>";
    });
    return html;
  }

  /* ─── Team comparison ────────────────────────────────────────────────────── */

  function comparisonHtml(c) {
    var teams = c.myTeams ? c.myTeams() : [];
    if (teams.length < 2) return "";
    var all   = c.teamHealth ? c.teamHealth() : [];
    var rows  = teams.map(function (t) {
      var entries = all.filter(function (e) { return e && e.teamName === t; })
        .sort(function (a, b) { return String(b.weekKey||"").localeCompare(String(a.weekKey||"")); });
      var latest = entries[0];
      var score  = latest ? (latest.score !== undefined ? Number(latest.score) : scoreOf(latest.ratings)) : null;
      var color  = score !== null ? scoreColor(score) : "var(--muted)";
      var scores = entries.slice(0, 6).reverse().map(function (e) { return e.score !== undefined ? Number(e.score) : scoreOf(e.ratings); });
      return "<tr><td><strong>" + esc(t) + "</strong></td>"
        + "<td>" + (latest ? esc(latest.weekKey || "—") : "—") + "</td>"
        + '<td style="font-weight:700;color:' + color + '">' + (score !== null ? score : "—") + "</td>"
        + '<td><div style="display:flex;align-items:center;gap:6px">' + (score !== null ? progressBar(score, color, 6) : "") + "</div></td>"
        + '<td>' + sparkline(scores) + "</td>"
        + "</tr>";
    });
    return '<div class="card info-card" style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:8px">' + esc(L("Teamsammenligning","Team comparison")) + "</div>"
      + '<div class="table-wrap"><table class="table" style="font-size:12px"><thead><tr>'
      + "<th>" + esc(L("Team","Team")) + "</th><th>" + esc(L("Uge","Week")) + "</th><th>" + esc(L("Score","Score")) + "</th><th style=\"min-width:80px\"></th><th>" + esc(L("Trend","Trend")) + "</th>"
      + "</tr></thead><tbody>" + rows.join("") + "</tbody></table></div></div>";
  }

  /* ─── Main view ──────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">' + esc(L("Datalaget ikke indlæst.","Data layer not loaded.")) + "</div>";
    var teams = c.myTeams ? c.myTeams() : [];
    if (activeTeam && teams.indexOf(activeTeam) < 0) activeTeam = "";
    if (!activeTeam && teams.length) activeTeam = teams[0];

    var out = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">'
      + '<div><h3 style="margin:0">' + esc(L("Team-sundhed","Team Health")) + "</h3>"
      + '<div class="kpi-sub">' + esc(L("Hackmans 5 betingelser · ugentlig puls · score 0–100","Hackman's 5 conditions · weekly pulse · score 0–100")) + "</div></div></div>";

    out += teamsKpiHtml(c);

    if (teams.length >= 2) out += comparisonHtml(c);

    out += manageTeamsHtml(c);

    if (!activeTeam) {
      out += '<div class="empty">' + esc(L("Tilføj et team herover for at komme i gang.","Add a team above to get started.")) + "</div>";
      return out;
    }

    /* Tabs */
    var tabs = [
      ["pulse",   L("Ugepuls","Weekly pulse")],
      ["history", L("Historik","History")],
      ["actions", L("Handlinger","Actions")]
    ];
    out += '<div style="display:flex;gap:6px;margin-bottom:14px">'
      + tabs.map(function (t) {
          return '<button type="button" class="btn btn-sm' + (activeTab === t[0] ? " btn-primary" : "") + '" data-act="th:tab:' + t[0] + '">' + esc(t[1]) + "</button>";
        }).join("")
      + "</div>";

    if (activeTab === "pulse")   out += pulseFormHtml(c, activeTeam);
    if (activeTab === "history") out += historyHtml(c, activeTeam);
    if (activeTab === "actions") out += actionsHtml(c, activeTeam);

    return out;
  }

  /* ─── Wiring ─────────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"), container);
      });
    }

    var teamForm = container.querySelector("#thTeamForm");
    if (teamForm) {
      teamForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var el = container.querySelector("#thTeamName");
        var name = el ? String(el.value || "").trim() : "";
        if (!name) return;
        var teams = c.myTeams ? c.myTeams() : [];
        if (teams.indexOf(name) < 0) teams.push(name);
        if (c.saveMyTeams) c.saveMyTeams(teams);
        activeTeam = name; activeTab = "pulse";
        rerender();
      });
    }

    var pulseForm = container.querySelector("#thPulseForm");
    if (pulseForm) {
      pulseForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var ratings = {};
        Array.prototype.forEach.call(pulseForm.querySelectorAll("[data-q]"), function (el) {
          ratings[el.getAttribute("data-q")] = el.value ? Number(el.value) : null;
        });
        var score = scoreOf(ratings);
        if (score === null) { formError = L("Besvar alle 5 spørgsmål.","Answer all 5 questions."); rerender(); return; }
        var week = c.weekKey ? c.weekKey() : "";
        var allH = (c.teamHealth ? c.teamHealth() : []).filter(function (e) { return !(e && e.teamName === activeTeam && e.weekKey === week); });
        allH.push({ teamName: activeTeam, weekKey: week, ratings: ratings, score: score });
        if (c.saveTeamHealth) c.saveTeamHealth(allH);
        formError = null; savedFlash = true;
        rerender();
        setTimeout(function () { savedFlash = false; var el = document.getElementById("teamHealthRadarRoot"); if (el) { el.innerHTML = viewHtml(); bind(el); } }, 2000);
      });
    }
  }

  function handle(act, container) {
    var c = core(); if (!c) return;
    if (act.indexOf("th:team:") === 0)    { activeTeam = act.slice(8); activeTab = "pulse"; formError = null; rerender(); return; }
    if (act.indexOf("th:tab:") === 0)     { activeTab  = act.slice(7); formError = null; rerender(); return; }
    if (act.indexOf("th:delTeam:") === 0) {
      var name = act.slice(11);
      if (!confirm(L("Fjern team og alle pulsdata?","Remove team and all pulse data?"))) return;
      if (c.saveMyTeams) c.saveMyTeams((c.myTeams ? c.myTeams() : []).filter(function (t) { return t !== name; }));
      if (c.saveTeamHealth) c.saveTeamHealth((c.teamHealth ? c.teamHealth() : []).filter(function (e) { return !e || e.teamName !== name; }));
      if (activeTeam === name) activeTeam = "";
      rerender();
    }
  }

  /* ─── Public API ─────────────────────────────────────────────────────────── */

  function open(opts) {
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("teamHealthRadar");
    if (opts && opts.team) { activeTeam = opts.team; activeTab = "pulse"; }
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, scoreOf: scoreOf, QUESTIONS: QUESTIONS, getTeamHealthStatus: getTeamHealthStatus };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCTeamHealthRadarUI = API;

})(typeof window !== "undefined" ? window : globalThis);
