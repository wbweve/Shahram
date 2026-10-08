/* ============================================================================
   js/stakeholder-health-map-ui.js — STAKEHOLDER MAP (Module 6).

   localStorage key: "stakeholders" (Stakeholder[]):

     { id, name, roleOrganization, relationshipType:
         "depends-on-me" | "i-depend-on" | "mutual",
       whatTheyNeedFromMe,
       updateFrequencyDays (number, e.g. 7 = weekly),
       lastContactDate,
       influence: 1-5,          ← power/interest grid
       interest: 1-5,
       relationshipStrength: 1-5,
       channel: "email"|"meeting"|"slack"|"report"|"phone",
       strategicPriority: bool,
       notes,
       contactLog: [{ date, note, channel }]   ← full history
     }

   Health auto-calculated from lastContactDate vs updateFrequencyDays:
     · Green: contact within the frequency window
     · Amber: overdue by up to 50% of the frequency
     · Red:   overdue by more than 50% of the frequency

   Power/Interest quadrants (influence × interest, each 1–5):
     · High influence (≥3) + High interest (≥3)  → "Manage Closely"
     · High influence (≥3) + Low interest  (<3)  → "Keep Satisfied"
     · Low influence  (<3) + High interest (≥3)  → "Keep Informed"
     · Low influence  (<3) + Low interest  (<3)  → "Monitor"

   Cross-module wiring:
     · Amber/Red stakeholders → Daily Brief FOLLOW-UP section
     · "Manage Closely" + Red health → priority alert
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  /* ─── Constants ────────────────────────────────────────────────────────── */

  var RELATIONSHIPS = [
    { key: "depends-on-me", label: { en: "Depends on me",  da: "Afhænger af mig" } },
    { key: "i-depend-on",   label: { en: "I depend on",    da: "Jeg afhænger af" } },
    { key: "mutual",        label: { en: "Mutual",         da: "Gensidig"         } }
  ];

  var CHANNELS = [
    { key: "email",   label: { en: "Email",   da: "E-mail"  } },
    { key: "meeting", label: { en: "Meeting", da: "Møde"    } },
    { key: "slack",   label: { en: "Slack",   da: "Slack"   } },
    { key: "report",  label: { en: "Report",  da: "Rapport" } },
    { key: "phone",   label: { en: "Phone",   da: "Telefon" } }
  ];

  var QUADRANTS = [
    { key: "manage-closely",  label: { en: "Manage Closely",  da: "Administrer tæt"   }, color: "#1565c0", bg: "#e3f2fd" },
    { key: "keep-satisfied",  label: { en: "Keep Satisfied",  da: "Hold tilfreds"      }, color: "#4a148c", bg: "#f3e5f5" },
    { key: "keep-informed",   label: { en: "Keep Informed",   da: "Hold informeret"    }, color: "#1b5e20", bg: "#e8f5e9" },
    { key: "monitor",         label: { en: "Monitor",         da: "Overvåg"            }, color: "#757575", bg: "#f5f5f5" }
  ];

  var HEALTH_META = {
    green: { dot: "#2e7d32", label: { en: "Green", da: "Grøn" } },
    amber: { dot: "#f9a825", label: { en: "Amber", da: "Gul"  } },
    red:   { dot: "#c62828", label: { en: "Red",   da: "Rød"  } }
  };

  function relationshipLabel(key) {
    for (var i = 0; i < RELATIONSHIPS.length; i++)
      if (RELATIONSHIPS[i].key === key) return L(RELATIONSHIPS[i].label.da, RELATIONSHIPS[i].label.en);
    return key || "—";
  }

  function channelLabel(key) {
    for (var i = 0; i < CHANNELS.length; i++)
      if (CHANNELS[i].key === key) return L(CHANNELS[i].label.da, CHANNELS[i].label.en);
    return key || "—";
  }

  function quadrantOf(s) {
    var inf = Number(s.influence) || 1;
    var int_ = Number(s.interest) || 1;
    if (inf >= 3 && int_ >= 3) return "manage-closely";
    if (inf >= 3 && int_ < 3)  return "keep-satisfied";
    if (inf < 3  && int_ >= 3) return "keep-informed";
    return "monitor";
  }

  function quadrantMeta(key) {
    for (var i = 0; i < QUADRANTS.length; i++) if (QUADRANTS[i].key === key) return QUADRANTS[i];
    return QUADRANTS[3];
  }

  /* ─── Health ───────────────────────────────────────────────────────────── */

  function healthOf(s, c) {
    c = c || core();
    var freq = Number(s.updateFrequencyDays) > 0 ? Number(s.updateFrequencyDays) : 30;
    if (!s.lastContactDate) return "red";
    var days = c.daysSince(s.lastContactDate);
    if (days === null) return "red";
    if (days <= freq)        return "green";
    if (days <= freq * 1.5)  return "amber";
    return "red";
  }

  function healthDot(h) {
    var meta = HEALTH_META[h] || HEALTH_META.red;
    return '<span title="' + esc(L(meta.label.da, meta.label.en)) + '" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + meta.dot + '"></span>';
  }

  function strengthDots(n) {
    var filled = Number(n) || 0;
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<span style="color:' + (i <= filled ? "#f9a825" : "#ccc") + ';font-size:14px">★</span>';
    }
    return out;
  }

  /* ─── Screen state ─────────────────────────────────────────────────────── */

  var activeTab      = "map";      // "map" | "grid" | "log"
  var editingId      = null;
  var formOpen       = false;
  var formError      = null;
  var logOpenId      = null;       // which stakeholder's contact-log panel is open
  var logFormError   = null;
  var prevHealth     = {};         // { [id]: "green"|"amber"|"red" } for degradation detection

  function rerender() {
    var container = document.getElementById("stakeholderMapRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── KPI bar ──────────────────────────────────────────────────────────── */

  function kpiBar(list, c) {
    var red = 0, amber = 0, green = 0, priority = 0, degraded = 0;
    list.forEach(function (s) {
      var h = healthOf(s, c);
      if (h === "red")   red++;
      if (h === "amber") amber++;
      if (h === "green") green++;
      if (s.strategicPriority) priority++;
      // degradation: was green last render, now amber or red
      if (prevHealth[s.id] === "green" && (h === "amber" || h === "red")) degraded++;
    });
    return '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">'
      + kpiChip(String(list.length),  L("Interessenter", "Stakeholders"),  "#455a64", "#eceff1")
      + kpiChip(String(green),         L("Grøn", "Green"),                  "#2e7d32", "#e8f5e9")
      + kpiChip(String(amber),         L("Gul", "Amber"),                   "#f9a825", "#fffde7")
      + kpiChip(String(red),           L("Rød — handling påkrævet", "Red — action needed"), "#c62828", "#ffebee")
      + kpiChip(String(priority),      L("Strategisk prioritet", "Strategic priority"),     "#6a1b9a", "#f3e5f5")
      + (degraded ? kpiChip(String(degraded), L("Forringet", "Degraded"), "#bf360c", "#fbe9e7") : "")
      + "</div>";
  }

  function kpiChip(value, label, color, bg) {
    return '<div style="background:' + bg + ';border-radius:8px;padding:8px 14px;text-align:center;min-width:80px">'
      + '<div style="font-size:22px;font-weight:700;color:' + color + '">' + esc(value) + "</div>"
      + '<div style="font-size:11px;color:' + color + ';opacity:.85">' + esc(label) + "</div>"
      + "</div>";
  }

  /* ─── Degradation alert ────────────────────────────────────────────────── */

  function degradationAlert(list, c) {
    var degraded = list.filter(function (s) {
      var h = healthOf(s, c);
      return prevHealth[s.id] === "green" && (h === "amber" || h === "red");
    });
    if (!degraded.length) return "";
    return '<div style="background:#fff3e0;border-left:4px solid #f9a825;padding:10px 14px;border-radius:4px;margin-bottom:12px">'
      + '<strong style="color:#e65100">⚠ ' + esc(L("Forringet kontakt", "Contact degraded")) + '</strong> — '
      + degraded.map(function (s) { return '<strong>' + esc(s.name) + '</strong>'; }).join(", ")
      + " " + esc(L("er gået fra Grøn til Gul/Rød siden sidst.", "moved from Green to Amber/Red since last view."))
      + "</div>";
  }

  /* ─── Priority alert ───────────────────────────────────────────────────── */

  function priorityAlert(list, c) {
    var critical = list.filter(function (s) {
      return s.strategicPriority && quadrantOf(s) === "manage-closely" && healthOf(s, c) === "red";
    });
    if (!critical.length) return "";
    return '<div style="background:#ffebee;border-left:4px solid #c62828;padding:10px 14px;border-radius:4px;margin-bottom:12px">'
      + '<strong style="color:#b71c1c">🔴 ' + esc(L("Kritisk: prioriterede interessenter uden kontakt", "Critical: priority stakeholders with no contact")) + '</strong><br>'
      + critical.map(function (s) { return esc(s.name) + " (" + esc(s.roleOrganization || "—") + ")"; }).join(" · ")
      + "</div>";
  }

  /* ─── Add / edit form ──────────────────────────────────────────────────── */

  function formHtml(s) {
    var x = s || {};
    var relOptions = '<option value="">' + esc(L("— vælg —", "— select —")) + "</option>"
      + RELATIONSHIPS.map(function (r) {
          return '<option value="' + r.key + '"' + (x.relationshipType === r.key ? " selected" : "") + ">"
            + esc(L(r.label.da, r.label.en)) + "</option>";
        }).join("");
    var chOptions = '<option value="">' + esc(L("— vælg —", "— select —")) + "</option>"
      + CHANNELS.map(function (ch) {
          return '<option value="' + ch.key + '"' + (x.channel === ch.key ? " selected" : "") + ">"
            + esc(L(ch.label.da, ch.label.en)) + "</option>";
        }).join("");

    function scale(id, val, label) {
      var btns = "";
      for (var n = 1; n <= 5; n++) {
        btns += '<button type="button" class="btn btn-sm" data-scale-id="' + id + '" data-scale-val="' + n + '" style="min-width:32px;'
          + (Number(val) === n ? "background:var(--accent-primary,#2563eb);color:#fff;" : "") + '">' + n + "</button> ";
      }
      return "<label>" + esc(label)
        + '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:4px">'
        + btns
        + '<input type="hidden" id="' + id + '" value="' + esc(String(Number(val) || 3)) + '">'
        + "</div></label>";
    }

    return '<div class="card info-card" style="margin-bottom:12px">'
      + "<h3>" + esc(x.id ? L("Redigér interessent", "Edit stakeholder") : L("Tilføj interessent", "Add stakeholder")) + "</h3>"
      + '<form id="smForm" class="form-grid">'
      + "<label>" + esc(L("Navn *", "Name *")) + '<input type="text" id="smName" maxlength="80" required value="' + esc(x.name || "") + '"></label>'
      + "<label>" + esc(L("Rolle / organisation", "Role / organization")) + '<input type="text" id="smRole" maxlength="120" value="' + esc(x.roleOrganization || "") + '"></label>'
      + "<label>" + esc(L("Relationstype", "Relationship type")) + '<select id="smRel">' + relOptions + "</select></label>"
      + "<label>" + esc(L("Foretrukket kanal", "Preferred channel")) + '<select id="smChannel">' + chOptions + "</select></label>"
      + "<label>" + esc(L("Hvad har de brug for fra mig?", "What they need from me"))
        + '<textarea id="smNeed" maxlength="600" rows="2">' + esc(x.whatTheyNeedFromMe || "") + "</textarea></label>"
      + "<label>" + esc(L("Opdateringsfrekvens (dage)", "Update frequency (days)"))
        + '<input type="number" id="smFreq" min="1" max="365" value="' + esc(x.updateFrequencyDays || 30) + '"></label>'
      + "<label>" + esc(L("Seneste kontakt", "Last contact date")) + '<input type="date" id="smLast" value="' + esc(x.lastContactDate || "") + '"></label>'
      + scale("smInfluence", x.influence || 3, L("Indflydelse (1 = lav, 5 = høj)", "Influence (1 = low, 5 = high)"))
      + scale("smInterest",  x.interest  || 3, L("Interesse (1 = lav, 5 = høj)",   "Interest (1 = low, 5 = high)"))
      + scale("smStrength",  x.relationshipStrength || 3, L("Relationsstyrke (1 = svag, 5 = stærk)", "Relationship strength (1 = weak, 5 = strong)"))
      + '<label style="align-items:center;flex-direction:row;gap:8px">'
        + '<input type="checkbox" id="smPriority"' + (x.strategicPriority ? " checked" : "") + '>'
        + ' ' + esc(L("Strategisk prioritet", "Strategic priority")) + "</label>"
      + "<label>" + esc(L("Noter", "Notes")) + '<textarea id="smNotes" maxlength="800" rows="3">' + esc(x.notes || "") + "</textarea></label>"
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">'
        + '<button class="btn btn-primary" type="submit">' + esc(x.id ? L("Gem ændringer", "Save changes") : L("Tilføj interessent", "Add stakeholder")) + "</button>"
        + (x.id ? '<button class="btn" type="button" data-act="sm:cancel">' + esc(L("Annuller", "Cancel")) + "</button>" : "")
        + "</div>"
      + (formError ? '<div class="kpi-sub" style="color:var(--danger-text,#c62828);margin-top:6px">' + esc(formError) + "</div>" : "")
      + "</form></div>";
  }

  /* ─── Contact log panel ────────────────────────────────────────────────── */

  function contactLogHtml(s) {
    var log = Array.isArray(s.contactLog) ? s.contactLog.slice().reverse() : [];
    var chOptions = CHANNELS.map(function (ch) {
      return '<option value="' + ch.key + '">' + esc(L(ch.label.da, ch.label.en)) + "</option>";
    }).join("");

    var history = log.length === 0
      ? '<div class="kpi-sub">' + esc(L("Ingen kontakthistorik endnu.", "No contact history yet.")) + "</div>"
      : '<div style="max-height:220px;overflow-y:auto;margin-top:8px">'
          + log.map(function (e, i) {
              return '<div style="padding:6px 0;border-bottom:1px solid var(--border-color,#e0e0e0)">'
                + '<span class="kpi-sub">' + esc(e.date) + (e.channel ? " · " + esc(channelLabel(e.channel)) : "") + "</span><br>"
                + '<span>' + esc(e.note || "—") + "</span>"
                + "</div>";
            }).join("")
          + "</div>";

    return '<div class="card info-card" style="margin-bottom:10px">'
      + "<h4>" + esc(L("Kontaktlog — ", "Contact log — ")) + esc(s.name) + "</h4>"
      + "<h5 style='margin:8px 0 4px'>" + esc(L("Log ny kontakt", "Log new contact")) + "</h5>"
      + '<form id="smLogForm" class="form-grid" data-log-id="' + esc(s.id) + '">'
      + "<label>" + esc(L("Dato", "Date")) + '<input type="date" id="smLogDate" value="' + esc(core() ? core().todayISO() : "") + '"></label>'
      + "<label>" + esc(L("Kanal", "Channel")) + '<select id="smLogChannel">' + chOptions + "</select></label>"
      + "<label>" + esc(L("Note", "Note")) + '<textarea id="smLogNote" rows="2" maxlength="400"></textarea></label>'
      + '<button class="btn btn-primary" type="submit">' + esc(L("Gem kontakt", "Save contact")) + "</button>"
      + " " + '<button class="btn" type="button" data-act="sm:closelog">' + esc(L("Luk", "Close")) + "</button>"
      + (logFormError ? '<div class="kpi-sub" style="color:var(--danger-text,#c62828)">' + esc(logFormError) + "</div>" : "")
      + "</form>"
      + "<h5 style='margin:10px 0 4px'>" + esc(L("Historik", "History")) + " (" + log.length + ")</h5>"
      + history
      + "</div>";
  }

  /* ─── Map tab (table) ──────────────────────────────────────────────────── */

  function mapTabHtml(c, list) {
    if (list.length === 0) {
      return '<div class="empty">' + esc(L("Ingen interessenter endnu — tilføj den første med knappen ovenfor.",
        "No stakeholders yet — add the first one above.")) + "</div>";
    }

    var sorted = list.slice().sort(function (a, b) {
      // strategic priority first, then by health severity
      var hOrder = { red: 0, amber: 1, green: 2 };
      if (b.strategicPriority !== a.strategicPriority) return (b.strategicPriority ? 1 : 0) - (a.strategicPriority ? 1 : 0);
      return (hOrder[healthOf(a, c)] || 2) - (hOrder[healthOf(b, c)] || 2);
    });

    var editing = editingId ? (list.filter(function (s) { return s.id === editingId; })[0] || null) : null;
    var out = "";

    if (formOpen || editing) out += formHtml(editing);

    sorted.forEach(function (s) {
      if (logOpenId === s.id) out += contactLogHtml(s);
    });

    var rows = sorted.map(function (s) {
      var h = healthOf(s, c);
      var q = quadrantOf(s);
      var qm = quadrantMeta(q);
      var c_days = s.lastContactDate ? c.daysSince(s.lastContactDate) : null;
      var freqLabel = Number(s.updateFrequencyDays) > 0 ? s.updateFrequencyDays + "d" : "30d";
      var daysLabel = c_days !== null ? c_days + L("d siden", "d ago") : L("aldrig", "never");
      var logCount = Array.isArray(s.contactLog) ? s.contactLog.length : 0;

      return "<tr>"
        + "<td>" + healthDot(h) + "</td>"
        + "<td><strong>" + esc(s.name || "—") + "</strong>"
          + (s.strategicPriority ? ' <span title="' + esc(L("Strategisk prioritet", "Strategic priority")) + '" style="color:#f9a825">★</span>' : "")
          + "</td>"
        + "<td>" + esc(s.roleOrganization || "—") + "</td>"
        + "<td>" + esc(relationshipLabel(s.relationshipType)) + "</td>"
        + "<td><span style='background:' + qm.bg + ';color:' + qm.color + ';padding:2px 6px;border-radius:4px;font-size:11px;white-space:nowrap'>"
          + esc(L(qm.label.da, qm.label.en)) + "</span></td>"
        + "<td style='white-space:nowrap'>" + strengthDots(s.relationshipStrength) + "</td>"
        + "<td>" + esc(freqLabel) + "</td>"
        + "<td style='white-space:nowrap'>" + esc(daysLabel) + "</td>"
        + "<td>" + esc(s.channel ? channelLabel(s.channel) : "—") + "</td>"
        + "<td>" + esc(s.whatTheyNeedFromMe || "—") + "</td>"
        + '<td style="white-space:nowrap">'
          + '<button type="button" class="btn btn-sm" data-act="sm:contact:' + esc(s.id) + '">' + esc(L("Kontakt i dag", "Contact today")) + "</button> "
          + '<button type="button" class="btn btn-sm" data-act="sm:openlog:' + esc(s.id) + '">'
            + esc(L("Log", "Log")) + (logCount ? " (" + logCount + ")" : "") + "</button> "
          + '<button type="button" class="btn btn-sm" data-act="sm:edit:' + esc(s.id) + '">' + esc(L("Redigér", "Edit")) + "</button> "
          + '<button type="button" class="btn btn-sm" data-act="sm:delete:' + esc(s.id) + '">' + esc(L("Slet", "Delete")) + "</button>"
          + "</td></tr>";
    }).join("");

    out += '<div class="table-wrap"><table class="table" style="font-size:13px">'
      + "<thead><tr>"
      + "<th>" + esc(L("Helbred", "Health")) + "</th>"
      + "<th>" + esc(L("Navn", "Name")) + "</th>"
      + "<th>" + esc(L("Rolle / org.", "Role / org.")) + "</th>"
      + "<th>" + esc(L("Relation", "Relation")) + "</th>"
      + "<th>" + esc(L("Kvadrant", "Quadrant")) + "</th>"
      + "<th>" + esc(L("Styrke", "Strength")) + "</th>"
      + "<th>" + esc(L("Freq.", "Freq.")) + "</th>"
      + "<th>" + esc(L("Kontakt", "Contact")) + "</th>"
      + "<th>" + esc(L("Kanal", "Channel")) + "</th>"
      + "<th>" + esc(L("Behov", "Need")) + "</th>"
      + "<th>" + esc(L("Handlinger", "Actions")) + "</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";

    return out;
  }

  /* ─── Grid tab (Power/Interest matrix) ────────────────────────────────── */

  function gridTabHtml(c, list) {
    if (list.length === 0) {
      return '<div class="empty">' + esc(L("Ingen interessenter.", "No stakeholders.")) + "</div>";
    }

    var byQuadrant = { "manage-closely": [], "keep-satisfied": [], "keep-informed": [], "monitor": [] };
    list.forEach(function (s) { byQuadrant[quadrantOf(s)].push(s); });

    function cell(qKey, topLabel, leftLabel) {
      var qm = quadrantMeta(qKey);
      var items = byQuadrant[qKey];
      var dots = items.map(function (s) {
        var h = healthOf(s, c);
        return '<div style="display:flex;align-items:center;gap:5px;padding:3px 0">'
          + healthDot(h) + " "
          + '<span style="font-size:12px">' + esc(s.name) + (s.strategicPriority ? ' <span style="color:#f9a825">★</span>' : "") + "</span>"
          + "</div>";
      }).join("");
      return '<td style="width:50%;vertical-align:top;padding:10px;background:' + qm.bg + ';border:1px solid var(--border-color,#e0e0e0)">'
        + '<div style="font-size:11px;font-weight:700;color:' + qm.color + ';margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">'
          + esc(L(qm.label.da, qm.label.en)) + ' <span class="kpi-sub">(' + items.length + ')</span></div>'
        + (dots || '<span class="kpi-sub">' + esc(L("Ingen", "None")) + "</span>")
        + "</td>";
    }

    return '<div style="margin-bottom:10px">'
      + '<div style="display:grid;grid-template-columns:auto 1fr;gap:4px;align-items:center;margin-bottom:6px">'
        + '<div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:11px;font-weight:700;color:var(--text-secondary,#555);padding-right:4px">'
          + esc(L("INDFLYDELSE →", "INFLUENCE →")) + "</div>"
        + '<div><table style="width:100%;border-collapse:collapse">'
            + "<thead><tr>"
              + '<th style="width:50%;text-align:center;padding:6px;font-size:11px;color:var(--text-secondary,#555)">'
                + esc(L("Lav interesse", "Low interest")) + "</th>"
              + '<th style="width:50%;text-align:center;padding:6px;font-size:11px;color:var(--text-secondary,#555)">'
                + esc(L("Høj interesse", "High interest")) + "</th>"
              + "</tr></thead>"
            + "<tbody>"
              + "<tr>"
                + cell("keep-satisfied", "", "")
                + cell("manage-closely", "", "")
              + "</tr>"
              + "<tr>"
                + cell("monitor", "", "")
                + cell("keep-informed", "", "")
              + "</tr>"
            + "</tbody>"
          + "</table></div>"
      + "</div>"
      + '<div style="text-align:center;font-size:11px;font-weight:700;color:var(--text-secondary,#555)">'
        + esc(L("INTERESSE →", "INTEREST →")) + "</div>"
      + "</div>"
      + '<div class="kpi-sub" style="margin-top:10px">'
        + esc(L("Indflydelse ≥ 3 = høj · Interesse ≥ 3 = høj. Redigér interessent for at justere.",
                "Influence ≥ 3 = high · Interest ≥ 3 = high. Edit stakeholder to adjust."))
        + "</div>";
  }

  /* ─── Log tab (consolidated contact timeline) ─────────────────────────── */

  function logTabHtml(c, list) {
    // Flatten all contactLog entries across all stakeholders + lastContactDate fallback
    var entries = [];
    list.forEach(function (s) {
      if (Array.isArray(s.contactLog)) {
        s.contactLog.forEach(function (e) {
          entries.push({ date: e.date, stakeholder: s.name, channel: e.channel, note: e.note, id: s.id });
        });
      } else if (s.lastContactDate) {
        entries.push({ date: s.lastContactDate, stakeholder: s.name, channel: s.channel, note: L("(automatisk)", "(auto)"), id: s.id });
      }
    });
    entries.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });

    if (entries.length === 0) {
      return '<div class="empty">' + esc(L("Ingen kontaktlog endnu.", "No contact log yet.")) + "</div>";
    }

    var rows = entries.map(function (e) {
      return "<tr>"
        + "<td>" + esc(e.date) + "</td>"
        + "<td><strong>" + esc(e.stakeholder) + "</strong></td>"
        + "<td>" + esc(e.channel ? channelLabel(e.channel) : "—") + "</td>"
        + "<td>" + esc(e.note || "—") + "</td>"
        + "</tr>";
    }).join("");

    return '<div class="table-wrap"><table class="table" style="font-size:13px">'
      + "<thead><tr>"
        + "<th>" + esc(L("Dato", "Date")) + "</th>"
        + "<th>" + esc(L("Interessent", "Stakeholder")) + "</th>"
        + "<th>" + esc(L("Kanal", "Channel")) + "</th>"
        + "<th>" + esc(L("Note", "Note")) + "</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* ─── View shell ───────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">' + esc(L("Datalaget er ikke indlæst.", "The data layer is not loaded.")) + "</div>";
    var list = c.stakeholders();

    // Snapshot health for degradation detection (after rendering, update prevHealth)
    var currentHealth = {};
    list.forEach(function (s) { currentHealth[s.id] = healthOf(s, c); });

    var out = '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">'
      + '<h3 style="margin:0">' + esc(L("Interessentkort", "Stakeholder Map")) + ' <span class="kpi-sub">(' + list.length + ")</span></h3>"
      + '<button type="button" class="btn btn-primary" data-act="sm:add">' + esc(L("Tilføj interessent", "Add stakeholder")) + "</button>"
      + "</div>";

    out += degradationAlert(list, c);
    out += priorityAlert(list, c);
    out += kpiBar(list, c);

    // Tabs
    var tabs = [
      { key: "map",  label: L("Kort", "Map")         },
      { key: "grid", label: L("Prioritetsgitter", "Priority Grid") },
      { key: "log",  label: L("Kontaktlog", "Contact Log") }
    ];
    out += '<div style="display:flex;gap:4px;border-bottom:2px solid var(--border-color,#e0e0e0);margin-bottom:14px">';
    tabs.forEach(function (t) {
      var active = activeTab === t.key;
      out += '<button type="button" data-act="sm:tab:' + t.key + '" style="padding:6px 14px;background:none;border:none;border-bottom:' + (active ? "3px solid var(--accent-primary,#2563eb)" : "3px solid transparent") + ';font-weight:' + (active ? "700" : "400") + ';cursor:pointer">'
        + esc(t.label) + "</button>";
    });
    out += "</div>";

    if (activeTab === "map")  out += mapTabHtml(c, list);
    if (activeTab === "grid") out += gridTabHtml(c, list);
    if (activeTab === "log")  out += logTabHtml(c, list);

    // Update prevHealth after render so next rerender can detect degradation
    setTimeout(function () { prevHealth = currentHealth; }, 0);

    return out;
  }

  /* ─── Wiring ───────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        handle(t.getAttribute("data-act"), container);
      });
      // Scale button clicks (inline 1-5 pickers)
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-scale-id]") : null;
        if (!t) return;
        var fieldId = t.getAttribute("data-scale-id");
        var val = t.getAttribute("data-scale-val");
        var hidden = container.querySelector("#" + fieldId);
        if (hidden) hidden.value = val;
        // Highlight active button
        container.querySelectorAll('[data-scale-id="' + fieldId + '"]').forEach(function (btn) {
          btn.style.background = btn.getAttribute("data-scale-val") === val
            ? "var(--accent-primary,#2563eb)" : "";
          btn.style.color = btn.getAttribute("data-scale-val") === val ? "#fff" : "";
        });
      });
    }

    // Add/edit stakeholder form
    var form = container.querySelector("#smForm");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var c = core();
        if (!c) return;
        var val = function (sel) {
          var el = container.querySelector(sel);
          return el && el.value != null ? String(el.value).trim() : "";
        };
        var name = val("#smName");
        if (!name) { formError = L("Navn er påkrævet.", "Name is required."); rerender(); return; }
        var freq = parseInt(val("#smFreq"), 10);
        if (!freq || freq < 1) freq = 30;
        var prio = container.querySelector("#smPriority");
        var record = {
          name: name,
          roleOrganization: val("#smRole"),
          relationshipType: val("#smRel"),
          channel: val("#smChannel"),
          whatTheyNeedFromMe: val("#smNeed"),
          updateFrequencyDays: freq,
          lastContactDate: val("#smLast"),
          influence: Number(val("#smInfluence")) || 3,
          interest:  Number(val("#smInterest"))  || 3,
          relationshipStrength: Number(val("#smStrength")) || 3,
          strategicPriority: prio ? prio.checked : false,
          notes: val("#smNotes")
        };
        var all = c.stakeholders();
        if (editingId) {
          for (var i = 0; i < all.length; i++) {
            if (all[i].id === editingId) {
              record.id = all[i].id;
              record.contactLog = all[i].contactLog || [];
              all[i] = record;
              break;
            }
          }
        } else {
          record.id = c.uid("sh");
          record.contactLog = [];
          all.push(record);
        }
        c.saveStakeholders(all);
        editingId = null; formOpen = false; formError = null;
        rerender();
      });
    }

    // Contact log form
    var logForm = container.querySelector("#smLogForm");
    if (logForm) {
      logForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var c = core();
        if (!c) return;
        var val = function (sel) {
          var el = container.querySelector(sel);
          return el && el.value != null ? String(el.value).trim() : "";
        };
        var sid = logForm.getAttribute("data-log-id");
        var date = val("#smLogDate") || c.todayISO();
        var note = val("#smLogNote");
        var channel = val("#smLogChannel");
        var all = c.stakeholders();
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === sid) {
            if (!Array.isArray(all[i].contactLog)) all[i].contactLog = [];
            all[i].contactLog.push({ date: date, channel: channel, note: note });
            all[i].lastContactDate = date;
            break;
          }
        }
        c.saveStakeholders(all);
        logFormError = null;
        rerender();
      });
    }
  }

  function handle(act, container) {
    if (act.indexOf("sm:") !== 0) return;
    var c = core();
    if (!c) return;

    if (act.indexOf("sm:tab:") === 0) {
      activeTab = act.slice(7);
      rerender(); return;
    }
    if (act === "sm:add") {
      formOpen = true; editingId = null; formError = null;
      rerender(); return;
    }
    if (act.indexOf("sm:edit:") === 0) {
      editingId = act.slice(8); formOpen = true; formError = null;
      rerender(); return;
    }
    if (act === "sm:cancel") {
      editingId = null; formOpen = false; formError = null;
      rerender(); return;
    }
    if (act.indexOf("sm:openlog:") === 0) {
      logOpenId = act.slice(11) === logOpenId ? null : act.slice(11);
      logFormError = null;
      rerender(); return;
    }
    if (act === "sm:closelog") {
      logOpenId = null; logFormError = null;
      rerender(); return;
    }
    if (act.indexOf("sm:contact:") === 0) {
      var id = act.slice(11);
      var all = c.stakeholders();
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) {
          var today = c.todayISO();
          all[i].lastContactDate = today;
          if (!Array.isArray(all[i].contactLog)) all[i].contactLog = [];
          all[i].contactLog.push({ date: today, channel: all[i].channel || "", note: L("Kontakt i dag (hurtig)", "Quick contact logged") });
          break;
        }
      }
      c.saveStakeholders(all);
      rerender(); return;
    }
    if (act.indexOf("sm:delete:") === 0) {
      var delId = act.slice(10);
      c.saveStakeholders(c.stakeholders().filter(function (s) { return s.id !== delId; }));
      if (editingId === delId) editingId = null;
      if (logOpenId === delId) logOpenId = null;
      rerender();
    }
  }

  /* ─── Public API ───────────────────────────────────────────────────────── */

  function getAtRiskStakeholders() {
    var c = core();
    if (!c) return [];
    return c.stakeholders().filter(function (s) {
      return healthOf(s, c) !== "green";
    });
  }

  function getCriticalStakeholders() {
    var c = core();
    if (!c) return [];
    return c.stakeholders().filter(function (s) {
      return s.strategicPriority && quadrantOf(s) === "manage-closely" && healthOf(s, c) === "red";
    });
  }

  function open() {
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("stakeholderHealthMap");
  }

  var API = {
    viewHtml: viewHtml,
    bind: bind,
    open: open,
    healthOf: healthOf,
    quadrantOf: quadrantOf,
    getAtRiskStakeholders: getAtRiskStakeholders,
    getCriticalStakeholders: getCriticalStakeholders
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCStakeholderHealthMapUI = API;
})(typeof window !== "undefined" ? window : globalThis);
