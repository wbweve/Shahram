/* ============================================================================
   js/leadership-decision-log-ui.js — DECISION LOG (Module 5).

   localStorage key: "decisions" (DecisionRecord[]):

     { id, title, date, decisionMade, involvedPeople, rationale,
       outcome: "pending"|"positive"|"negative"|"mixed",
       reversibility: "reversible"|"irreversible"|"consequential",
       outcomeResult, tags (comma-sep),
       linkedModule: "Risk"|"Task"|"CAPA"|"Project"|"None",
       linkedId, priority: "low"|"medium"|"high"|"critical" }

   Exports getDecisionHealth() for Daily Brief:
     { total, pendingOld, critical, positiveRate }
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  var OUTCOMES     = ["pending", "positive", "negative", "mixed"];
  var REVERSIBILITY = ["reversible", "irreversible", "consequential"];
  var PRIORITIES   = ["low", "medium", "high", "critical"];
  var LINKED       = ["None", "Risk", "Task", "CAPA", "Project", "Decision"];

  /* ─── Labels ───────────────────────────────────────────────────────────── */

  function outcomeLabel(o) {
    switch (String(o || "pending").toLowerCase()) {
      case "positive":    return L("Positiv", "Positive");
      case "negative":    return L("Negativ", "Negative");
      case "mixed":       return L("Blandet", "Mixed");
      default:            return L("Afventer", "Pending");
    }
  }
  function reversibilityLabel(r) {
    switch (String(r || "reversible").toLowerCase()) {
      case "irreversible":  return L("Irreversibel", "Irreversible");
      case "consequential": return L("Høj konsekvens", "High-consequence");
      default:              return L("Reversibel", "Reversible");
    }
  }
  function priorityLabel(p) {
    switch (String(p || "medium").toLowerCase()) {
      case "low":      return L("Lav", "Low");
      case "high":     return L("Høj", "High");
      case "critical": return L("Kritisk", "Critical");
      default:         return L("Medium", "Medium");
    }
  }

  var OUTCOME_COLORS = {
    positive: "var(--success-text, #15803d)",
    negative: "var(--danger-text, #dc2626)",
    mixed:    "var(--warning-text, #d97706)",
    pending:  "var(--muted)"
  };
  var PRIORITY_COLORS = {
    critical: "var(--danger-text, #dc2626)",
    high:     "var(--warning-text, #d97706)",
    medium:   "var(--accent)",
    low:      "var(--muted)"
  };
  var REV_COLORS = {
    irreversible:  "var(--danger-text, #dc2626)",
    consequential: "var(--warning-text, #d97706)",
    reversible:    "var(--success-text, #15803d)"
  };

  /* ─── Health export ─────────────────────────────────────────────────────── */

  function getDecisionHealth() {
    var c = core(); if (!c) return { total: 0, pendingOld: 0, critical: 0, positiveRate: 0 };
    var all = c.decisions();
    var today = c.todayISO();
    var threshold = daysAgo(30);
    var pendingOld = 0, critical = 0, positive = 0, resolved = 0;
    all.forEach(function (d) {
      if ((d.outcome || "pending") === "pending" && d.date && d.date < threshold) pendingOld++;
      if ((d.priority || "medium") === "critical" && (d.outcome || "pending") === "pending") critical++;
      if (d.outcome === "positive") { positive++; resolved++; }
      else if (d.outcome === "negative" || d.outcome === "mixed") resolved++;
    });
    return {
      total: all.length,
      pendingOld: pendingOld,
      critical: critical,
      positiveRate: resolved ? Math.round((positive / resolved) * 100) : null
    };
  }

  function daysAgo(n) {
    var d = new Date(); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function daysSince(dateStr) {
    if (!dateStr) return null;
    var diff = new Date(new Date().toISOString().slice(0,10)) - new Date(dateStr);
    return Math.round(diff / 86400000);
  }

  /* ─── Screen state ──────────────────────────────────────────────────────── */

  var search        = "";
  var filterOutcome = "";
  var filterLinked  = "";
  var filterPriority= "";
  var filterRev     = "";
  var editingId     = null;
  var detailId      = null;
  var formOpen      = false;
  var formError     = null;
  var activeView    = "list"; /* list | analysis */

  function rerender() {
    var container = document.getElementById("leadershipDecisionRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Form ──────────────────────────────────────────────────────────────── */

  function formHtml(d) {
    var c = core();
    var x = d || {};
    var opts = function (arr, cur, labFn) {
      return arr.map(function (v) {
        return '<option value="' + v + '"' + (cur === v ? " selected" : "") + ">" + esc(labFn ? labFn(v) : v) + "</option>";
      }).join("");
    };
    var outOpts  = opts(OUTCOMES,     String(x.outcome      || "pending"),       outcomeLabel);
    var revOpts  = opts(REVERSIBILITY,String(x.reversibility|| "reversible"),     reversibilityLabel);
    var priOpts  = opts(PRIORITIES,   String(x.priority     || "medium"),         priorityLabel);
    var lnkOpts  = opts(LINKED,       x.linkedModule || "None");

    /* Reversibility guidance */
    var rev = x.reversibility || "reversible";
    var revGuide = {
      reversible:    L("Beslutning kan fortrydes eller justeres. Bevæg dig hurtigt.", "This decision can be undone or adjusted — bias toward action."),
      irreversible:  L("Kan IKKE fortrydes. Involvér nøglepersoner og dokumentér grundigt.", "Cannot be undone. Involve key people and document thoroughly."),
      consequential: L("Høj konsekvens — overvej scenarier og risici inden du beslutter.", "High-consequence — consider scenarios and risks before committing.")
    }[rev];

    return '<div class="card info-card" style="margin-bottom:14px">'
      + "<h3 style=\"margin:0 0 12px\">" + esc(x.id ? L("Redigér beslutning","Edit decision") : L("Log beslutning","Log decision")) + "</h3>"
      + '<form id="ldForm" class="form-grid">'

      + "<label>" + esc(L("Titel","Title")) + " *"
      + '<input type="text" id="ldTitle" maxlength="120" required value="' + esc(x.title || "") + '" placeholder="' + esc(L("Kort, præcis titel","Short, precise title")) + '"></label>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      + "<label>" + esc(L("Dato","Date")) + '<input type="date" id="ldDate" value="' + esc(x.date || c.todayISO()) + '"></label>'
      + "<label>" + esc(L("Prioritet","Priority")) + '<select id="ldPriority">' + priOpts + "</select></label>"
      + "</div>"

      + "<label>" + esc(L("Reversibilitet","Reversibility")) + '<select id="ldRev">' + revOpts + "</select>"
      + '<div id="ldRevGuide" class="kpi-sub" style="margin-top:4px;color:var(--muted)">' + esc(revGuide) + "</div></label>"

      + "<label>" + esc(L("Beslutningen (hvad blev besluttet)","Decision made (what was decided)"))
      + '<textarea id="ldMade" maxlength="2000" rows="4" placeholder="' + esc(L("Beskriv præcis, hvad der blev besluttet…","Describe precisely what was decided…")) + '">' + esc(x.decisionMade || "") + "</textarea></label>"

      + "<label>" + esc(L("Begrundelse","Rationale"))
      + '<textarea id="ldRationale" maxlength="2000" rows="3" placeholder="' + esc(L("Hvorfor denne beslutning? Alternativer overvejet?","Why this decision? Alternatives considered?")) + '">' + esc(x.rationale || "") + "</textarea></label>"

      + "<label>" + esc(L("Involverede (kommasepareret)","Involved people (comma-separated)"))
      + '<input type="text" id="ldPeople" maxlength="300" value="' + esc(x.involvedPeople || "") + '" placeholder="' + esc(L("Alice, Bob, …","Alice, Bob, …")) + '"></label>'

      + "<label>" + esc(L("Tags (kommasepareret)","Tags (comma-separated)"))
      + '<input type="text" id="ldTags" maxlength="200" value="' + esc(x.tags || "") + '" placeholder="' + esc(L("budget, produkt, risiko…","budget, product, risk…")) + '"></label>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      + "<label>" + esc(L("Udfald","Outcome")) + '<select id="ldOutcome">' + outOpts + "</select></label>"
      + "<label>" + esc(L("Linket modul","Linked module")) + '<select id="ldLinked">' + lnkOpts + "</select></label>"
      + "</div>"

      + "<label>" + esc(L("Linket id (valgfrit)","Linked id (optional)"))
      + '<input type="text" id="ldLinkedId" maxlength="80" value="' + esc(x.linkedId || "") + '"></label>'

      + "<label>" + esc(L("Resultatbeskrivelse (udfyld når udfald kendes)","Outcome description (fill when outcome known)"))
      + '<textarea id="ldResult" maxlength="1000" rows="2" placeholder="' + esc(L("Hvad skete der i praksis?","What happened in practice?")) + '">' + esc(x.outcomeResult || "") + "</textarea></label>"

      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">'
      + '<button class="btn btn-primary" type="submit">' + esc(x.id ? L("Gem ændringer","Save changes") : L("Log beslutning","Log decision")) + "</button>"
      + (x.id ? '<button class="btn" type="button" data-act="ld:cancel">' + esc(L("Annuller","Cancel")) + "</button>" : "")
      + "</div>"

      + "</form>"
      + (formError ? '<div class="kpi-sub" style="color:var(--danger-text);margin-top:6px">' + esc(formError) + "</div>" : "")
      + "</div>";
  }

  /* ─── Detail panel ──────────────────────────────────────────────────────── */

  function detailHtml(d) {
    var age    = daysSince(d.date);
    var ageStr = age !== null ? (age === 0 ? L("i dag","today") : age + " " + L("dage siden","days ago")) : "";
    var outColor = OUTCOME_COLORS[d.outcome || "pending"] || "var(--muted)";
    var priColor = PRIORITY_COLORS[d.priority || "medium"] || "var(--muted)";
    var revColor = REV_COLORS[d.reversibility || "reversible"] || "var(--muted)";

    function row(label, val) {
      if (!val) return "";
      return '<div style="margin-bottom:6px"><span class="kpi-sub" style="text-transform:uppercase;letter-spacing:.05em;font-size:10px">' + esc(label) + "</span><br>"
        + '<span style="font-size:13px">' + esc(val) + "</span></div>";
    }
    function colorRow(label, val, color) {
      if (!val) return "";
      return '<div style="margin-bottom:6px"><span class="kpi-sub" style="text-transform:uppercase;letter-spacing:.05em;font-size:10px">' + esc(label) + "</span><br>"
        + '<span style="font-size:13px;color:' + color + ';font-weight:600">' + esc(val) + "</span></div>";
    }

    var tagsHtml = "";
    if (d.tags) {
      tagsHtml = d.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean).map(function (t) {
        return '<span class="badge" style="margin-right:4px;margin-bottom:4px">' + esc(t) + "</span>";
      }).join("");
    }

    var pendingWarn = "";
    if ((d.outcome || "pending") === "pending" && age !== null && age > 30) {
      pendingWarn = '<div class="kpi-sub" style="color:var(--warning-text);margin-bottom:8px">⚠ ' + esc(L("Afventer i " + age + " dage — overvej at opdatere udfald.","Pending for " + age + " days — consider updating the outcome.")) + "</div>";
    }

    return '<div class="card info-card" style="margin:10px 0;border-left:4px solid var(--accent)">'
      + '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:flex-start;margin-bottom:10px">'
      + '<div><div style="font-size:15px;font-weight:700;margin-bottom:2px">' + esc(d.title || "—") + "</div>"
      + '<div class="kpi-sub">' + esc(d.date || "") + (ageStr ? " · " + esc(ageStr) : "") + "</div></div>"
      + '<button type="button" class="btn btn-sm" data-act="ld:closeDetail">' + esc(L("Luk","Close")) + "</button></div>"
      + pendingWarn
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px 16px;margin-bottom:10px">'
      + colorRow(L("Udfald","Outcome"), outcomeLabel(d.outcome), outColor)
      + colorRow(L("Prioritet","Priority"), priorityLabel(d.priority), priColor)
      + colorRow(L("Reversibilitet","Reversibility"), reversibilityLabel(d.reversibility), revColor)
      + row(L("Dato","Date"), d.date)
      + row(L("Involverede","Involved"), d.involvedPeople)
      + row(L("Linket","Linked"), (d.linkedModule && d.linkedModule !== "None") ? (d.linkedModule + (d.linkedId ? " · " + d.linkedId : "")) : null)
      + "</div>"
      + (tagsHtml ? '<div style="margin-bottom:10px">' + tagsHtml + "</div>" : "")
      + '<div style="margin-bottom:8px"><div class="kpi-sub" style="text-transform:uppercase;font-size:10px;letter-spacing:.05em">' + esc(L("Beslutningen","Decision made")) + "</div>"
      + '<div style="font-size:13px;line-height:1.5;white-space:pre-wrap">' + esc(d.decisionMade || "—") + "</div></div>"
      + '<div style="margin-bottom:8px"><div class="kpi-sub" style="text-transform:uppercase;font-size:10px;letter-spacing:.05em">' + esc(L("Begrundelse","Rationale")) + "</div>"
      + '<div style="font-size:13px;line-height:1.5;white-space:pre-wrap">' + esc(d.rationale || "—") + "</div></div>"
      + (d.outcomeResult ? '<div style="margin-bottom:8px"><div class="kpi-sub" style="text-transform:uppercase;font-size:10px;letter-spacing:.05em">' + esc(L("Resultat","Outcome result")) + "</div>"
        + '<div style="font-size:13px;line-height:1.5;white-space:pre-wrap">' + esc(d.outcomeResult) + "</div></div>" : "")
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">'
      + '<button type="button" class="btn btn-sm" data-act="ld:edit:' + esc(d.id) + '">' + esc(L("Redigér","Edit")) + "</button>"
      + '<button type="button" class="btn btn-sm" data-act="ld:delete:' + esc(d.id) + '">' + esc(L("Slet","Delete")) + "</button>"
      + "</div></div>";
  }

  /* ─── Analysis view ─────────────────────────────────────────────────────── */

  function analysisHtml(all) {
    if (!all.length) return '<div class="empty">' + esc(L("Ingen beslutninger at analysere.","No decisions to analyse.")) + "</div>";

    /* Outcome distribution */
    var outCount = { pending: 0, positive: 0, negative: 0, mixed: 0 };
    var priCount = { critical: 0, high: 0, medium: 0, low: 0 };
    var revCount = { reversible: 0, irreversible: 0, consequential: 0 };
    var totalPending = 0, oldPending = 0;
    var threshold = daysAgo(30);

    all.forEach(function (d) {
      var o = String(d.outcome || "pending").toLowerCase();
      if (outCount[o] !== undefined) outCount[o]++; else outCount.pending++;
      var p = String(d.priority || "medium").toLowerCase();
      if (priCount[p] !== undefined) priCount[p]++;
      var r = String(d.reversibility || "reversible").toLowerCase();
      if (revCount[r] !== undefined) revCount[r]++;
      if (o === "pending") { totalPending++; if (d.date && d.date < threshold) oldPending++; }
    });

    var resolved = outCount.positive + outCount.negative + outCount.mixed;
    var posRate  = resolved ? Math.round((outCount.positive / resolved) * 100) : null;

    function miniBar(val, total, color) {
      var pct = total ? Math.round((val / total) * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
        + '<div style="width:80px;background:var(--border);border-radius:4px;overflow:hidden;height:10px">'
        + '<div style="width:' + pct + '%;background:' + color + ';height:10px"></div></div>'
        + '<span class="kpi-sub">' + val + '</span></div>';
    }

    /* Tag cloud */
    var tagCount = {};
    all.forEach(function (d) {
      if (d.tags) d.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean).forEach(function (t) {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    var topTags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 12);

    /* Oldest pending */
    var oldestPending = all.filter(function (d) { return (d.outcome || "pending") === "pending" && d.date; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 3);

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:16px">';

    /* Outcome */
    html += '<div class="card info-card"><div style="font-weight:600;margin-bottom:8px">' + esc(L("Udfald","Outcomes")) + "</div>"
      + OUTCOMES.map(function (o) { return miniBar(outCount[o], all.length, OUTCOME_COLORS[o] || "var(--muted)") + '<div class="kpi-sub" style="margin-bottom:6px">' + esc(outcomeLabel(o)) + "</div>"; }).join("")
      + (posRate !== null ? '<div class="kpi-sub" style="margin-top:6px">✓ ' + posRate + "% " + esc(L("positive af afsluttede","positive of resolved")) + "</div>" : "")
      + "</div>";

    /* Priority */
    html += '<div class="card info-card"><div style="font-weight:600;margin-bottom:8px">' + esc(L("Prioritet","Priority")) + "</div>"
      + PRIORITIES.slice().reverse().map(function (p) { return miniBar(priCount[p], all.length, PRIORITY_COLORS[p] || "var(--muted)") + '<div class="kpi-sub" style="margin-bottom:6px">' + esc(priorityLabel(p)) + "</div>"; }).join("")
      + "</div>";

    /* Reversibility */
    html += '<div class="card info-card"><div style="font-weight:600;margin-bottom:8px">' + esc(L("Reversibilitet","Reversibility")) + "</div>"
      + REVERSIBILITY.map(function (r) { return miniBar(revCount[r], all.length, REV_COLORS[r] || "var(--muted)") + '<div class="kpi-sub" style="margin-bottom:6px">' + esc(reversibilityLabel(r)) + "</div>"; }).join("")
      + "</div>";

    html += "</div>";

    /* Stale pending */
    if (oldestPending.length) {
      html += '<div class="card info-card" style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:6px;color:var(--warning-text)">⚠ ' + esc(L("Beslutninger der afventer længe","Long-pending decisions")) + "</div>"
        + oldestPending.map(function (d) {
            var age = daysSince(d.date);
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">'
              + '<button type="button" class="btn btn-sm" data-act="ld:detail:' + esc(d.id) + '">' + esc(d.title || "—") + "</button>"
              + '<span class="kpi-sub">' + esc(age + " " + L("dage","days")) + "</span></div>";
          }).join("")
        + "</div>";
    }

    /* Tags */
    if (topTags.length) {
      html += '<div class="card info-card" style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:8px">' + esc(L("Tags","Tags")) + "</div>"
        + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
        + topTags.map(function (t) {
            return '<span class="badge" style="cursor:pointer" data-act="ld:tag:' + esc(t) + '">' + esc(t) + ' <span class="kpi-sub">(' + tagCount[t] + ")</span></span>";
          }).join("")
        + "</div></div>";
    }

    return html;
  }

  /* ─── KPI strip ─────────────────────────────────────────────────────────── */

  function kpiHtml(all) {
    var total = all.length;
    if (!total) return "";
    var pending = 0, critical = 0, positive = 0, resolved = 0, irreversible = 0;
    var threshold = daysAgo(30);
    var oldPending = 0;
    all.forEach(function (d) {
      var o = String(d.outcome || "pending").toLowerCase();
      if (o === "pending") { pending++; if (d.date && d.date < threshold) oldPending++; }
      if (o === "positive") { positive++; resolved++; }
      else if (o === "negative" || o === "mixed") resolved++;
      if ((d.priority || "medium") === "critical" && o === "pending") critical++;
      if ((d.reversibility || "reversible") === "irreversible") irreversible++;
    });
    var posRate = resolved ? Math.round((positive / resolved) * 100) : null;
    function kpi(val, label, color) {
      return '<div class="card info-card" style="text-align:center;padding:10px 14px">'
        + '<div style="font-size:22px;font-weight:700;color:' + color + '">' + esc(String(val)) + "</div>"
        + '<div class="kpi-sub">' + esc(label) + "</div></div>";
    }
    return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-bottom:14px">'
      + kpi(total, L("Total","Total"), "var(--accent)")
      + kpi(pending, L("Afventer","Pending"), pending > 0 ? "var(--warning-text)" : "var(--muted)")
      + kpi(oldPending, L("> 30 dage","> 30 days"), oldPending > 0 ? "var(--danger-text)" : "var(--muted)")
      + kpi(critical, L("Kritisk","Critical"), critical > 0 ? "var(--danger-text)" : "var(--muted)")
      + (posRate !== null ? kpi(posRate + "%", L("Positiv rate","Positive rate"), posRate >= 60 ? "var(--success-text)" : "var(--warning-text)") : "")
      + kpi(irreversible, L("Irreversible","Irreversible"), irreversible > 0 ? "var(--warning-text)" : "var(--muted)")
      + "</div>";
  }

  /* ─── Filters ───────────────────────────────────────────────────────────── */

  function filtersHtml() {
    function sel(id, cur, arr, labFn, placeholder) {
      return '<select id="' + id + '"><option value="">' + esc(placeholder) + "</option>"
        + arr.map(function (v) {
            return '<option value="' + v + '"' + (cur === v ? " selected" : "") + ">" + esc(labFn ? labFn(v) : v) + "</option>";
          }).join("") + "</select>";
    }
    return '<div class="form-grid" style="margin-bottom:12px">'
      + "<label>" + esc(L("Søg","Search")) + '<input type="search" id="ldSearch" value="' + esc(search) + '" placeholder="' + esc(L("Titel, beslutning, begrundelse, tags…","Title, decision, rationale, tags…")) + '"></label>'
      + "<label>" + esc(L("Udfald","Outcome")) + sel("ldFilterOutcome", filterOutcome, OUTCOMES, outcomeLabel, L("Alle udfald","All outcomes")) + "</label>"
      + "<label>" + esc(L("Prioritet","Priority")) + sel("ldFilterPriority", filterPriority, PRIORITIES, priorityLabel, L("Alle prioriteter","All priorities")) + "</label>"
      + "<label>" + esc(L("Reversibilitet","Reversibility")) + sel("ldFilterRev", filterRev, REVERSIBILITY, reversibilityLabel, L("Alle typer","All types")) + "</label>"
      + "<label>" + esc(L("Linket modul","Linked module")) + sel("ldFilterLinked", filterLinked, LINKED, null, L("Alle moduler","All modules")) + "</label>"
      + "</div>";
  }

  function matches(d) {
    if (filterOutcome  && String(d.outcome || "pending").toLowerCase() !== filterOutcome) return false;
    if (filterLinked   && (d.linkedModule || "None") !== filterLinked) return false;
    if (filterPriority && String(d.priority || "medium").toLowerCase() !== filterPriority) return false;
    if (filterRev      && String(d.reversibility || "reversible").toLowerCase() !== filterRev) return false;
    if (search) {
      var hay = [d.title, d.decisionMade, d.rationale, d.involvedPeople, d.tags, d.outcomeResult].join(" ").toLowerCase();
      if (hay.indexOf(search.toLowerCase()) < 0) return false;
    }
    return true;
  }

  /* ─── Table ─────────────────────────────────────────────────────────────── */

  function tableHtml(list) {
    if (!list.length) return '<div class="empty">' + esc(L("Ingen beslutninger matcher søgningen.","No decisions match the search.")) + "</div>";
    var rows = list.map(function (d) {
      var outColor = OUTCOME_COLORS[d.outcome || "pending"] || "var(--muted)";
      var priColor = PRIORITY_COLORS[d.priority || "medium"] || "var(--muted)";
      var revColor = REV_COLORS[d.reversibility || "reversible"] || "var(--muted)";
      var age      = daysSince(d.date);
      var ageWarn  = (d.outcome || "pending") === "pending" && age !== null && age > 30
        ? ' title="' + esc(L("Afventer i " + age + " dage","Pending " + age + " days")) + '"' : "";
      return "<tr>"
        + '<td><button type="button" class="btn btn-sm" data-act="ld:detail:' + esc(d.id) + '" style="font-weight:600;text-align:left"' + ageWarn + ">" + esc(d.title || "—") + "</button></td>"
        + "<td>" + esc(d.date || "—") + "</td>"
        + '<td><span style="color:' + priColor + ';font-weight:600">' + esc(priorityLabel(d.priority)) + "</span></td>"
        + '<td><span style="color:revColor">' + esc(reversibilityLabel(d.reversibility)) + "</span></td>"
        + '<td><span style="color:' + outColor + ';font-weight:600">' + esc(outcomeLabel(d.outcome)) + "</span></td>"
        + "<td>" + esc((d.linkedModule && d.linkedModule !== "None") ? d.linkedModule + (d.linkedId ? " · " + d.linkedId : "") : "—") + "</td>"
        + '<td style="white-space:nowrap">'
        + '<button type="button" class="btn btn-sm" data-act="ld:edit:' + esc(d.id) + '">' + esc(L("Redigér","Edit")) + "</button> "
        + '<button type="button" class="btn btn-sm" data-act="ld:delete:' + esc(d.id) + '">' + esc(L("Slet","Delete")) + "</button>"
        + "</td></tr>";
    }).join("");
    return '<div class="table-wrap"><table class="table">'
      + "<thead><tr>"
      + "<th>" + esc(L("Titel","Title")) + "</th>"
      + "<th>" + esc(L("Dato","Date")) + "</th>"
      + "<th>" + esc(L("Prioritet","Priority")) + "</th>"
      + "<th>" + esc(L("Reversibilitet","Reversibility")) + "</th>"
      + "<th>" + esc(L("Udfald","Outcome")) + "</th>"
      + "<th>" + esc(L("Linket","Linked")) + "</th>"
      + "<th>" + esc(L("Handlinger","Actions")) + "</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* ─── Main view ─────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">' + esc(L("Datalaget er ikke indlæst.","The data layer is not loaded.")) + "</div>";
    var all = c.decisions().slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
    var list    = all.filter(matches);
    var editing = editingId ? (all.find(function (d) { return d.id === editingId; }) || null) : null;
    var detail  = detailId  ? (all.find(function (d) { return d.id === detailId;  }) || null) : null;

    var tabBtn = function (view, label) {
      var active = activeView === view;
      return '<button type="button" class="btn' + (active ? " btn-primary" : "") + '" data-act="ld:view:' + view + '">' + esc(label) + "</button>";
    };

    var out = '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">'
      + '<h3 style="margin:0">' + esc(L("Beslutningslog","Decision Log")) + ' <span class="kpi-sub">(' + list.length + "/" + all.length + ")</span></h3>"
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + tabBtn("list",     L("Liste","List"))
      + tabBtn("analysis", L("Analyse","Analysis"))
      + '<button type="button" class="btn btn-primary" data-act="ld:add">' + esc(L("Log beslutning","Log decision")) + "</button>"
      + "</div></div>";

    if (formOpen || editing) out += formHtml(editing);
    if (detail) out += detailHtml(detail);

    if (activeView === "analysis") {
      out += analysisHtml(all);
    } else {
      out += kpiHtml(all);
      out += filtersHtml();
      out += tableHtml(list);
    }
    return out;
  }

  /* ─── Wiring ────────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");

      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"));
      });

      container.addEventListener("change", function (ev) {
        var t = ev.target;
        if (!t || !t.id) return;
        if      (t.id === "ldFilterOutcome")  { filterOutcome  = t.value; rerender(); }
        else if (t.id === "ldFilterLinked")   { filterLinked   = t.value; rerender(); }
        else if (t.id === "ldFilterPriority") { filterPriority = t.value; rerender(); }
        else if (t.id === "ldFilterRev")      { filterRev      = t.value; rerender(); }
        else if (t.id === "ldRev") {
          /* live-update reversibility guidance without full rerender */
          var guide = container.querySelector("#ldRevGuide");
          if (guide) {
            var revGuides = {
              reversible:    L("Beslutning kan fortrydes eller justeres. Bevæg dig hurtigt.","This decision can be undone or adjusted — bias toward action."),
              irreversible:  L("Kan IKKE fortrydes. Involvér nøglepersoner og dokumentér grundigt.","Cannot be undone. Involve key people and document thoroughly."),
              consequential: L("Høj konsekvens — overvej scenarier og risici inden du beslutter.","High-consequence — consider scenarios and risks before committing.")
            };
            guide.textContent = revGuides[t.value] || "";
          }
        }
      });

      container.addEventListener("input", function (ev) {
        var t = ev.target;
        if (t && t.id === "ldSearch") {
          search = t.value;
          rerender();
          var el = document.getElementById("ldSearch");
          if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
        }
      });
    }

    /* Form submit */
    var form = container.querySelector("#ldForm");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var c = core(); if (!c) return;
        var val = function (sel) {
          var el = container.querySelector(sel);
          return el && el.value != null ? String(el.value).trim() : "";
        };
        var title = val("#ldTitle");
        if (!title) { formError = L("Titel er påkrævet.","Title is required."); rerender(); return; }
        var record = {
          title:         title,
          date:          val("#ldDate") || c.todayISO(),
          priority:      val("#ldPriority") || "medium",
          reversibility: val("#ldRev") || "reversible",
          decisionMade:  val("#ldMade"),
          involvedPeople:val("#ldPeople"),
          rationale:     val("#ldRationale"),
          tags:          val("#ldTags"),
          outcome:       val("#ldOutcome") || "pending",
          linkedModule:  val("#ldLinked") || "None",
          linkedId:      val("#ldLinkedId"),
          outcomeResult: val("#ldResult")
        };
        var all = c.decisions();
        if (editingId) {
          for (var i = 0; i < all.length; i++) {
            if (all[i].id === editingId) { record.id = all[i].id; all[i] = record; break; }
          }
        } else {
          record.id = c.uid("dec");
          all.push(record);
        }
        c.saveDecisions(all);
        editingId = null; formOpen = false; formError = null;
        rerender();
      });
    }
  }

  function handle(act) {
    if (act.indexOf("ld:") !== 0) return;
    var c = core(); if (!c) return;

    if (act === "ld:add") {
      formOpen = true; editingId = null; formError = null; rerender(); return;
    }
    if (act.indexOf("ld:view:") === 0) {
      activeView = act.slice(8); rerender(); return;
    }
    if (act.indexOf("ld:detail:") === 0) {
      detailId = act.slice(10); rerender(); return;
    }
    if (act === "ld:closeDetail") {
      detailId = null; rerender(); return;
    }
    if (act.indexOf("ld:edit:") === 0) {
      editingId = act.slice(8); formOpen = true; formError = null; detailId = null; rerender(); return;
    }
    if (act === "ld:cancel") {
      editingId = null; formOpen = false; formError = null; rerender(); return;
    }
    if (act.indexOf("ld:delete:") === 0) {
      var id = act.slice(10);
      if (!confirm(L("Slet denne beslutning?","Delete this decision?"))) return;
      c.saveDecisions(c.decisions().filter(function (d) { return d.id !== id; }));
      if (editingId === id) editingId = null;
      if (detailId  === id) detailId  = null;
      rerender(); return;
    }
    if (act.indexOf("ld:tag:") === 0) {
      search = act.slice(7); activeView = "list"; rerender(); return;
    }
  }

  /* ─── Navigation entry point ─────────────────────────────────────────────── */

  function open(opts) {
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("leadershipDecisions");
    if (opts && opts.view) activeView = opts.view;
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, getDecisionHealth: getDecisionHealth };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCLeadershipDecisionsUI = API;
})(typeof window !== "undefined" ? window : globalThis);
