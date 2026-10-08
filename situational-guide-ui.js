/* ============================================================================
   js/situational-guide-ui.js — SITUATIONAL LEADERSHIP GUIDE (Module 9)

   Full Hersey-Blanchard Situational Leadership II model.

   Development Levels (per PERSON per TASK):
     D1 — High commitment, low competence   (Enthusiastic Beginner)
     D2 — Variable commitment, low-moderate competence (Disillusioned Learner)
     D3 — High competence, variable commitment (Capable but Cautious)
     D4 — High competence, high commitment  (Self-Reliant Achiever)

   Leadership Styles: S1 Directing / S2 Coaching / S3 Supporting / S4 Delegating

   Cross-module: reading member.developmentStage from team-members-ui for
   a pre-filled level on the form. Exports getSituationalHealth() for Daily Brief.

   localStorage: "situationalAssessments" (Assessment[])
   ============================================================================ */
(function (root) {
  "use strict";

  function core() { return root.LCLSCore || null; }
  function esc(s) { var c = core(); return c ? c.esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function L(da, en) { var c = core(); return c ? c.L(da, en) : en; }

  var LS_KEY = "situationalAssessments";

  /* ─── Model ──────────────────────────────────────────────────────────────── */

  var DEV_LEVELS = {
    D1: {
      key: "D1", style: "S1",
      color: "var(--danger-text, #dc2626)",
      label: { en: "D1 — Enthusiastic Beginner",  da: "D1 — Entusiastisk nybegynder" },
      desc:  { en: "High commitment, low competence. New to the task — motivated but lacks skills or experience.", da: "Højt engagement, lav kompetence. Ny i opgaven — motiveret, men mangler færdigheder eller erfaring." }
    },
    D2: {
      key: "D2", style: "S2",
      color: "var(--warning-text, #d97706)",
      label: { en: "D2 — Disillusioned Learner",  da: "D2 — Desillusioneret lærende" },
      desc:  { en: "Some competence, variable commitment. Has tried it and hit reality — needs direction AND genuine encouragement.", da: "Nogen kompetence, variabelt engagement. Har prøvet det og ramt virkeligheden — behov for retning OG ægte opmuntring." }
    },
    D3: {
      key: "D3", style: "S3",
      color: "var(--accent, #6366f1)",
      label: { en: "D3 — Capable but Cautious",   da: "D3 — Kompetent men usikker" },
      desc:  { en: "High competence, variable commitment. Has the skills but doubts themselves or the value of the goal.", da: "Høj kompetence, variabelt engagement. Har færdighederne, men tvivler på sig selv eller målets værdi." }
    },
    D4: {
      key: "D4", style: "S4",
      color: "var(--success-text, #15803d)",
      label: { en: "D4 — Self-Reliant Achiever",  da: "D4 — Selvstændig præstant" },
      desc:  { en: "High competence, high commitment. Fully owns the task — delegate, then stay out of the way.", da: "Høj kompetence, højt engagement. Ejer opgaven fuldt ud — deleger, og kom af vejen." }
    }
  };

  var STYLES = {
    S1: {
      key: "S1",
      name:  { en: "DIRECTING",   da: "DIRIGERENDE" },
      focus: { en: "High directive · Low supportive", da: "Høj styring · Lav støtte" },
      color: "var(--danger-text, #dc2626)",
      explanation: {
        en: "Be specific. Define the what, how, and when. Check in frequently. Build early wins — confidence follows competence, not the other way around. Do not overwhelm with 'why' yet.",
        da: "Vær konkret. Definér hvad, hvordan og hvornår. Tjek ind hyppigt. Byg tidlige sejre — selvtillid følger kompetence, ikke omvendt. Overbebyrd ikke med 'hvorfor' endnu."
      },
      principles: [
        { en: "Tell, don't ask — they lack the context to generate good options yet.", da: "Sig, spørg ikke — de mangler endnu konteksten til at generere gode muligheder." },
        { en: "Break the task into steps. Assign one step at a time with a clear deadline.", da: "Opdel opgaven i trin. Tildel ét trin ad gangen med en klar deadline." },
        { en: "Praise effort and early progress specifically — not just 'good job'.", da: "Ros indsats og tidlige fremskridt konkret — ikke bare 'godt gået'." },
        { en: "Demonstrate before delegating — show the standard, don't just describe it.", da: "Demonstrér inden du delegerer — vis standarden, beskriv den ikke bare." }
      ],
      phrases: [
        { en: "Here's exactly what I need you to do, and here's why it matters.", da: "Her er præcis, hvad jeg har brug for, at du gør, og her er grunden." },
        { en: "Let's review this together before you move to the next step.", da: "Lad os gennemgå det her sammen, før du går videre til næste trin." },
        { en: "Come back to me after step one — I want to see the result before we continue.", da: "Kom tilbage til mig efter trin ét — jeg vil se resultatet, inden vi fortsætter." }
      ],
      avoid: { en: "Avoid delegating unsupervised. Avoid open questions that imply they should already know the answer.", da: "Undgå at delegere uden opsyn. Undgå åbne spørgsmål, der antyder, at de allerede burde kende svaret." }
    },
    S2: {
      key: "S2",
      name:  { en: "COACHING",    da: "COACHENDE" },
      focus: { en: "High directive · High supportive", da: "Høj styring · Høj støtte" },
      color: "var(--warning-text, #d97706)",
      explanation: {
        en: "They have some skill but their confidence is shaky. Direct the task AND involve them in the 'how'. Explain your reasoning. Ask their opinion before giving yours. They need to feel heard, not just told.",
        da: "De har nogen færdighed, men selvtilliden er ustabil. Styr opgaven OG involvér dem i 'hvordan'. Forklar din begrundelse. Spørg efter deres mening, inden du giver din. De skal føle sig hørt."
      },
      principles: [
        { en: "Ask before telling: 'What's your take? Here's what I'd add...'", da: "Spørg inden du siger: 'Hvad synes du? Her er, hvad jeg ville tilføje...'" },
        { en: "Celebrate specific progress — name what they did well and why it mattered.", da: "Fejr konkrete fremskridt — navngiv hvad de gjorde godt og hvorfor det betød noget." },
        { en: "Address skill gaps directly — confusion is normal and expected, not a flaw.", da: "Adresser kompetencegab direkte — forvirring er normalt og forventet, ikke en fejl." },
        { en: "Be the sounding board — they need to think out loud with someone safe.", da: "Vær lydsonde — de skal tænke højt med nogen, de stoler på." }
      ],
      phrases: [
        { en: "What's your take on the approach? Here's what I'd consider...", da: "Hvad er din tilgang? Her er, hvad jeg ville overveje..." },
        { en: "I can see you know this area — let's work out the 'how' together.", da: "Jeg kan se, du kender dette område — lad os arbejde ud af 'hvordan' sammen." },
        { en: "That went well. Specifically, you handled [X] effectively — that's the skill.", da: "Det gik godt. Konkret håndterede du [X] effektivt — det er præcis færdigheden." }
      ],
      avoid: { en: "Avoid pure task delegation — they still need direction. Avoid hollow praise that doesn't name what was actually good.", da: "Undgå ren opgavedelegation — de har stadig brug for styring. Undgå hul ros uden konkret indhold." }
    },
    S3: {
      key: "S3",
      name:  { en: "SUPPORTING",  da: "STØTTENDE" },
      focus: { en: "Low directive · High supportive", da: "Lav styring · Høj støtte" },
      color: "var(--accent, #6366f1)",
      explanation: {
        en: "They know how. The barrier is confidence, motivation, or ambiguity about ownership. Step back from directing. Ask questions. Listen deeply. Remove the obstacles THEY name — not the ones you assume they have.",
        da: "De ved, hvordan. Barrieren er selvtillid, motivation eller uklarhed om ejerskab. Træd tilbage fra styring. Stil spørgsmål. Lyt dybt. Fjern de forhindringer DE nævner — ikke dem, du antager."
      },
      principles: [
        { en: "Ask, don't tell. 'What's blocking you?' beats 'Here's what to do'.", da: "Spørg, sig ikke. 'Hvad blokerer dig?' slår 'Her er, hvad du skal gøre'." },
        { en: "Involve them in decisions within the task — they have the expertise.", da: "Involvér dem i beslutninger inden for opgaven — de har ekspertisen." },
        { en: "Be explicit about ownership: 'This is yours — you decide the approach.'", da: "Vær eksplicit om ejerskab: 'Dette er dit — du bestemmer tilgangen.'" },
        { en: "If they ask 'what do you think?', redirect: 'What do YOU think?'", da: "Hvis de spørger 'hvad synes du?', redirect: 'Hvad synes DU?'" }
      ],
      phrases: [
        { en: "What do you need from me to move forward?", da: "Hvad har du brug for fra mig for at komme videre?" },
        { en: "I trust your judgment on the approach. What's the obstacle?", da: "Jeg stoler på din vurdering af tilgangen. Hvad er forhindringen?" },
        { en: "This is yours to own. I'm here if you hit something you can't solve alone.", da: "Dette er dit at eje. Jeg er her, hvis du rammer noget, du ikke kan løse alene." }
      ],
      avoid: { en: "Avoid re-directing a task they already know how to do — it signals distrust and costs engagement.", da: "Undgå at omstyrkere en opgave, de ved, hvordan de skal gøre — det signalerer mistillid og koster engagement." }
    },
    S4: {
      key: "S4",
      name:  { en: "DELEGATING",  da: "DELEGERENDE" },
      focus: { en: "Low directive · Low supportive", da: "Lav styring · Lav støtte" },
      color: "var(--success-text, #15803d)",
      explanation: {
        en: "Hand it off fully. Define the outcome, not the method. Set one milestone check-in and stay away until then. Any unsolicited input at this level shrinks their ownership and eventually their capability.",
        da: "Overlad det fuldt ud. Definér resultatet, ikke metoden. Fastlæg ét milepælstjek og hold dig derefter væk. Enhver uopfordret input på dette niveau mindsker ejerskabet og til sidst kapaciteten."
      },
      principles: [
        { en: "Set the outcome, not the method. 'By [date], I need [result].' Full stop.", da: "Sæt resultatet, ikke metoden. 'Inden [dato] har jeg brug for [resultat].' Færdig." },
        { en: "One planned check-in (milestone). Zero unplanned ones. Trust is the point.", da: "Et planlagt tjek-in (milepæl). Nul uplanlagte. Tillid er pointen." },
        { en: "When something goes wrong: ask what happened — don't assume incompetence.", da: "Når noget går galt: spørg hvad der skete — antag ikke inkompetence." },
        { en: "Say 'I trust your call' and mean it — or you're not really delegating.", da: "Sig 'Jeg stoler på din beslutning' og mén det — ellers delegerer du ikke rigtig." }
      ],
      phrases: [
        { en: "This is fully yours. Outcome by [date] — come to me only if you're blocked.", da: "Dette er fuldt ud dit. Resultat inden [dato] — kom til mig kun, hvis du sidder fast." },
        { en: "I don't need a daily update. Show me the result.", da: "Jeg har ikke brug for en daglig opdatering. Vis mig resultatet." },
        { en: "You know this better than I do — I trust your call.", da: "Du kender dette bedre end jeg gør — jeg stoler på din beslutning." }
      ],
      avoid: { en: "Avoid micro-managing a D4 person — it's the fastest way to move them toward D3: capable but quietly disengaged.", da: "Undgå micro-management af en D4-person — det er den hurtigste vej til D3: kompetent men stille uengageret." }
    }
  };

  /* ─── Storage ────────────────────────────────────────────────────────────── */

  function loadAssessments() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") || []; } catch (e) { return []; }
  }
  function saveAssessments(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  /* ─── Daily Brief export ─────────────────────────────────────────────────── */

  function getSituationalHealth() {
    var c = core(); if (!c) return { alerts: [], members: [] };
    var all     = loadAssessments();
    var members = c.members ? c.members() : [];
    var alerts  = [];
    var result  = [];

    members.forEach(function (m) {
      var assessments = all.filter(function (a) { return a.memberId === m.id; });
      /* Get latest per task */
      var byTask = {};
      assessments.forEach(function (a) {
        if (!byTask[a.task] || a.date > byTask[a.task].date) byTask[a.task] = a;
      });
      var tasks = Object.keys(byTask);
      var d1d2Tasks = tasks.filter(function (t) { return byTask[t].level === "D1" || byTask[t].level === "D2"; });
      /* Regression: task that moved backward */
      var regressions = [];
      tasks.forEach(function (t) {
        var history = assessments.filter(function (a) { return a.task === t; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
        if (history.length >= 2) {
          var first = history[0].level, last = history[history.length - 1].level;
          if (first > last) regressions.push({ member: m.name, task: t, from: first, to: last });
        }
      });
      result.push({ member: m.name, tasks: byTask, d1d2Count: d1d2Tasks.length });
      if (d1d2Tasks.length > 0) alerts.push({ type: "needsCoaching", member: m.name, count: d1d2Tasks.length, tasks: d1d2Tasks });
      regressions.forEach(function (r) { alerts.push({ type: "regression", member: r.member, task: r.task, from: r.from, to: r.to }); });
    });
    return { alerts: alerts, members: result };
  }

  /* ─── Screen state ───────────────────────────────────────────────────────── */

  var selectedMember  = "";
  var selectedTask    = "";
  var selectedLevel   = "";
  var assessNote      = "";
  var activeTab       = "assess"; /* assess | members | reference */
  var historyMember   = "";
  var formError       = null;
  var savedFlash      = false;

  function rerender() {
    var container = document.getElementById("situationalGuideRoot");
    if (!container) return;
    container.innerHTML = viewHtml();
    bind(container);
  }

  /* ─── Style result card ──────────────────────────────────────────────────── */

  function resultCardHtml(level) {
    if (!level || !DEV_LEVELS[level]) return "";
    var d = DEV_LEVELS[level];
    var s = STYLES[d.style];
    return '<div class="card info-card" style="border-left:4px solid ' + d.color + ';margin-bottom:16px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px">'
      + '<div>'
      + '<div style="font-size:11px;font-weight:700;color:' + d.color + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">' + esc(L(d.label.da, d.label.en)) + "</div>"
      + '<div class="kpi-sub">' + esc(L(d.desc.da, d.desc.en)) + "</div>"
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:11px;font-weight:700;color:' + s.color + ';text-transform:uppercase;letter-spacing:.06em">' + esc(L(s.name.da, s.name.en)) + "</div>"
      + '<div class="kpi-sub">' + esc(L(s.focus.da, s.focus.en)) + "</div>"
      + "</div></div>"
      + '<div style="font-size:13px;line-height:1.6;margin-bottom:14px">' + esc(L(s.explanation.da, s.explanation.en)) + "</div>"
      + '<div style="font-weight:600;font-size:12px;margin-bottom:6px">' + esc(L("Ledelsesprincipperne","Leadership principles")) + "</div>"
      + '<ul style="margin:0 0 14px;padding-left:18px">'
      + s.principles.map(function (p) { return '<li style="font-size:13px;margin-bottom:5px;line-height:1.5">' + esc(L(p.da, p.en)) + "</li>"; }).join("")
      + "</ul>"
      + '<div style="font-weight:600;font-size:12px;margin-bottom:6px">' + esc(L("Eksempelsætninger","Example phrases")) + "</div>"
      + '<ul style="margin:0 0 14px;padding-left:18px">'
      + s.phrases.map(function (p) { return '<li style="font-size:13px;font-style:italic;margin-bottom:6px;line-height:1.5;color:var(--accent)">"' + esc(L(p.da, p.en)) + '"</li>'; }).join("")
      + "</ul>"
      + '<div style="background:var(--danger-subtle,rgba(220,38,38,.07));border-radius:6px;padding:8px 12px;font-size:12px">'
      + '<strong style="color:var(--danger-text)">' + esc(L("Undgå:","Avoid:")) + "</strong> " + esc(L(s.avoid.da, s.avoid.en))
      + "</div></div>";
  }

  /* ─── Assess form ────────────────────────────────────────────────────────── */

  function assessFormHtml(c) {
    var memberOpts = '<option value="">' + esc(L("— vælg person —","— select person —")) + "</option>"
      + c.members().map(function (m) {
          return '<option value="' + esc(m.id) + '"' + (selectedMember === m.id ? " selected" : "") + ">" + esc(m.name) + "</option>";
        }).join("");

    var levelOpts = '<option value="">' + esc(L("— vælg niveau —","— select level —")) + "</option>"
      + ["D1","D2","D3","D4"].map(function (key) {
          var d = DEV_LEVELS[key];
          return '<option value="' + key + '"' + (selectedLevel === key ? " selected" : "") + ">" + esc(L(d.label.da, d.label.en)) + "</option>";
        }).join("");

    /* If member selected, show their current tasks for quick re-assess */
    var taskSuggestions = "";
    if (selectedMember) {
      var memberAssessments = loadAssessments().filter(function (a) { return a.memberId === selectedMember; });
      var knownTasks = [];
      var seenTasks  = {};
      memberAssessments.forEach(function (a) { if (!seenTasks[a.task]) { seenTasks[a.task] = true; knownTasks.push(a.task); } });
      if (knownTasks.length) {
        taskSuggestions = '<div class="kpi-sub" style="margin-top:4px">' + esc(L("Kendte opgaver: ","Known tasks: "))
          + knownTasks.map(function (t) {
              return '<button type="button" class="badge" style="cursor:pointer;border:none;background:var(--badge-bg);margin-right:4px" data-act="sg:task:' + esc(t) + '">' + esc(t) + "</button>";
            }).join("")
          + "</div>";
      }
    }

    return '<div class="card info-card" style="margin-bottom:16px">'
      + "<h4 style=\"margin:0 0 12px\">" + esc(L("Vurder udviklingsniveau","Assess development level")) + "</h4>"
      + '<div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px">'
      + "<label>" + esc(L("Teammedlem","Team member"))
      + '<select id="sgMember">' + memberOpts + "</select></label>"
      + "<label>" + esc(L("Opgave / ansvarsområde","Task / area of responsibility"))
      + '<input type="text" id="sgTask" maxlength="100" value="' + esc(selectedTask) + '" placeholder="' + esc(L("fx 'ugerapport', 'audit-forberedelse'","e.g. 'weekly report', 'audit prep'")) + '">'
      + taskSuggestions + "</label>"
      + "<label>" + esc(L("Udviklingsniveau","Development level"))
      + '<select id="sgLevel">' + levelOpts + "</select></label>"
      + "<label>" + esc(L("Note (valgfri)","Note (optional)"))
      + '<input type="text" id="sgNote" maxlength="200" value="' + esc(assessNote) + '" placeholder="' + esc(L("Kontekst, observation…","Context, observation…")) + '"></label>'
      + "</div>"
      + '<div style="display:flex;gap:8px;align-items:center;margin-top:12px">'
      + '<button type="button" class="btn btn-primary" data-act="sg:save">' + esc(L("Gem vurdering","Save assessment")) + "</button>"
      + (savedFlash ? '<span style="font-size:12px;color:var(--success-text)">✓ ' + esc(L("Gemt","Saved")) + "</span>" : "")
      + (formError ? '<span style="font-size:12px;color:var(--danger-text)">' + esc(formError) + "</span>" : "")
      + "</div></div>"
      + (selectedLevel ? resultCardHtml(selectedLevel) : "");
  }

  /* ─── Members overview tab ───────────────────────────────────────────────── */

  function membersOverviewHtml(c) {
    var members     = c.members ? c.members() : [];
    var assessments = loadAssessments();
    if (!members.length) return '<div class="empty">' + esc(L("Ingen teammedlemmer fundet.","No team members found.")) + "</div>";

    var COLORS = { D1: "var(--danger-text)", D2: "var(--warning-text)", D3: "var(--accent)", D4: "var(--success-text)" };

    return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">'
      + members.map(function (m) {
          var memberA = assessments.filter(function (a) { return a.memberId === m.id; });
          /* Latest per task */
          var byTask  = {};
          memberA.forEach(function (a) { if (!byTask[a.task] || a.date > byTask[a.task].date) byTask[a.task] = a; });
          var tasks   = Object.keys(byTask);
          var d1d2    = tasks.filter(function (t) { return byTask[t].level === "D1" || byTask[t].level === "D2"; }).length;
          var stageBadge = m.developmentStage ? '<span class="badge" style="font-size:10px">' + esc(m.developmentStage) + "</span>" : "";
          return '<div class="card info-card" style="padding:12px 14px">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            + '<strong style="font-size:13px">' + esc(m.name || "—") + "</strong>" + stageBadge + "</div>"
            + (tasks.length
                ? tasks.map(function (t) {
                    var a = byTask[t];
                    var history = memberA.filter(function (x) { return x.task === t; }).sort(function (x, y) { return x.date.localeCompare(y.date); });
                    var trend   = history.length >= 2
                      ? (history[history.length-1].level > history[0].level ? ' <span style="color:var(--success-text)">↗</span>' : history[history.length-1].level < history[0].level ? ' <span style="color:var(--danger-text)">↘</span>' : "")
                      : "";
                    var col = COLORS[a.level] || "var(--muted)";
                    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid var(--border);font-size:12px">'
                      + '<button type="button" class="btn btn-sm" data-act="sg:quickassess:' + esc(m.id) + ':' + esc(t) + '" style="padding:0;background:none;border:none;text-align:left;font-size:12px;cursor:pointer;color:var(--text)">' + esc(t) + "</button>"
                      + '<span style="font-weight:700;color:' + col + '">' + esc(a.level) + trend + "</span></div>";
                  }).join("")
                : '<div class="kpi-sub">' + esc(L("Ingen vurderinger endnu.","No assessments yet.")) + "</div>")
            + (d1d2 > 0 ? '<div class="kpi-sub" style="color:var(--warning-text);margin-top:6px">⚠ ' + d1d2 + " " + esc(L("opgave(r) behøver coaching","task(s) need coaching")) + "</div>" : "")
            + '<div style="margin-top:8px"><button type="button" class="btn btn-sm" data-act="sg:hist:' + esc(m.id) + '">' + esc(L("Se historik","View history")) + "</button></div></div>";
        }).join("")
      + "</div>";
  }

  /* ─── History tab ────────────────────────────────────────────────────────── */

  function historyHtml(c) {
    var members = c.members ? c.members() : [];
    var tabs    = members.length
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'
        + members.map(function (m) {
            return '<button type="button" class="btn btn-sm' + (historyMember === m.id ? " btn-primary" : "") + '" data-act="sg:hist:' + esc(m.id) + '">' + esc(m.name) + "</button>";
          }).join("") + "</div>"
      : "";

    if (!historyMember) return tabs + '<div class="empty">' + esc(L("Vælg et teammedlem.","Select a team member.")) + "</div>";

    var memberName  = "";
    members.forEach(function (m) { if (m.id === historyMember) memberName = m.name; });
    var assessments = loadAssessments().filter(function (a) { return a.memberId === historyMember; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (!assessments.length) return tabs + '<div class="empty">' + esc(L("Ingen vurderinger for dette teammedlem endnu.","No assessments for this team member yet.")) + "</div>";

    var byTask = {};
    assessments.forEach(function (a) { if (!byTask[a.task]) byTask[a.task] = []; byTask[a.task].push(a); });
    var COLORS = { D1: "var(--danger-text)", D2: "var(--warning-text)", D3: "var(--accent)", D4: "var(--success-text)" };

    var taskCards = Object.keys(byTask).map(function (task) {
      var history = byTask[task].slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
      var latest  = history[history.length - 1];
      var first   = history[0];
      var growth  = history.length > 1
        ? (latest.level > first.level ? "↗ " + L("vækst","growth") : latest.level < first.level ? "↘ " + L("regression","regression") : L("stabilt","stable"))
        : "";
      var trendColor = growth.indexOf("vækst") >= 0 || growth.indexOf("growth") >= 0 ? "var(--success-text)" : growth.indexOf("regression") >= 0 ? "var(--danger-text)" : "var(--muted)";

      var timeline = history.map(function (e) {
        var col = COLORS[e.level] || "var(--muted)";
        return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
          + '<div style="width:8px;height:8px;border-radius:50%;background:' + col + ';flex-shrink:0"></div>'
          + '<span class="kpi-sub">' + esc(e.date) + "</span>"
          + '<span style="font-weight:700;font-size:12px;color:' + col + '">' + esc(e.level) + "</span>"
          + '<span style="font-size:12px;color:var(--muted)">→ ' + esc(STYLES[DEV_LEVELS[e.level] && DEV_LEVELS[e.level].style] ? L(STYLES[DEV_LEVELS[e.level].style].name.da, STYLES[DEV_LEVELS[e.level].style].name.en) : "") + "</span>"
          + (e.note ? '<em class="kpi-sub">— ' + esc(e.note) + "</em>" : "")
          + "</div>";
      }).join("");

      return '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<strong style="font-size:13px">' + esc(task) + "</strong>"
        + (growth ? '<span style="font-size:11px;font-weight:600;color:' + trendColor + '">' + esc(growth) + "</span>" : "")
        + "</div>"
        + timeline
        + '<div style="margin-top:8px">'
        + '<button type="button" class="btn btn-sm btn-primary" data-act="sg:quickassess:' + esc(historyMember) + ':' + esc(task) + '">' + esc(L("Ny vurdering for denne opgave","New assessment for this task")) + "</button>"
        + "</div></div>";
    });

    return tabs
      + '<div style="font-size:14px;font-weight:600;margin-bottom:10px">' + esc(memberName) + " — " + esc(L("opgavehistorik","task history")) + "</div>"
      + taskCards.join("");
  }

  /* ─── Reference tab ─────────────────────────────────────────────────────── */

  function referenceHtml() {
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">'
      + ["D1","D2","D3","D4"].map(function (key) {
          var d = DEV_LEVELS[key];
          var s = STYLES[d.style];
          return '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;border-left:3px solid ' + d.color + '">'
            + '<div style="font-size:12px;font-weight:700;color:' + d.color + ';margin-bottom:2px">' + esc(L(d.label.da, d.label.en)) + "</div>"
            + '<div style="font-size:11px;font-weight:600;color:' + s.color + ';margin-bottom:4px">→ ' + esc(L(s.name.da, s.name.en)) + " · " + esc(L(s.focus.da, s.focus.en)) + "</div>"
            + '<div class="kpi-sub">' + esc(L(d.desc.da, d.desc.en)) + "</div></div>";
        }).join("")
      + "</div>"
      + ["S1","S2","S3","S4"].map(function (key) { return resultCardHtml(["D1","D2","D3","D4"].find(function (d) { return DEV_LEVELS[d].style === key; })); }).join("");
  }

  /* ─── Main view ──────────────────────────────────────────────────────────── */

  function viewHtml() {
    var c = core();
    if (!c) return '<div class="empty">' + esc(L("Datalaget ikke indlæst.","Data layer not loaded.")) + "</div>";

    var tabs = [
      ["assess",    L("Vurdér","Assess")],
      ["members",   L("Teamoversigt","Team overview")],
      ["history",   L("Historik","History")],
      ["reference", L("Reference","Reference")]
    ];

    var out = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">'
      + '<div><h3 style="margin:0">' + esc(L("Situationsbestemt ledelses-guide","Situational Leadership Guide")) + "</h3>"
      + '<div class="kpi-sub">' + esc(L("Hersey-Blanchard SLII · match ledelsesstil til udviklingsniveau per opgave","Hersey-Blanchard SLII · match leadership style to development level per task")) + "</div></div></div>"
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">'
      + tabs.map(function (t) {
          return '<button type="button" class="btn btn-sm' + (activeTab === t[0] ? " btn-primary" : "") + '" data-act="sg:tab:' + t[0] + '">' + esc(t[1]) + "</button>";
        }).join("")
      + "</div>";

    if (activeTab === "assess")    out += assessFormHtml(c);
    if (activeTab === "members")   out += membersOverviewHtml(c);
    if (activeTab === "history")   out += historyHtml(c);
    if (activeTab === "reference") out += referenceHtml();

    return out;
  }

  /* ─── Wiring ─────────────────────────────────────────────────────────────── */

  function bind(container) {
    if (!container.getAttribute("data-lsx-bound")) {
      container.setAttribute("data-lsx-bound", "1");

      container.addEventListener("change", function (ev) {
        var t = ev.target;
        if (!t) return;
        if (t.id === "sgMember") { selectedMember = t.value; selectedLevel = ""; rerender(); return; }
        if (t.id === "sgLevel")  { selectedLevel  = t.value; rerender(); return; }
      });
      container.addEventListener("input", function (ev) {
        var t = ev.target;
        if (!t) return;
        if (t.id === "sgTask") selectedTask = t.value;
        if (t.id === "sgNote") assessNote   = t.value;
      });
      container.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!t) return;
        ev.preventDefault();
        handle(t.getAttribute("data-act"), container);
      });
    }
  }

  function handle(act, container) {
    var c = core(); if (!c) return;

    if (act.indexOf("sg:tab:") === 0)  { activeTab = act.slice(7); formError = null; rerender(); return; }
    if (act.indexOf("sg:hist:") === 0) { historyMember = act.slice(8); activeTab = "history"; rerender(); return; }
    if (act.indexOf("sg:task:") === 0) {
      selectedTask = act.slice(8);
      var el = container && container.querySelector("#sgTask");
      if (el) el.value = selectedTask;
      return;
    }
    if (act.indexOf("sg:quickassess:") === 0) {
      /* sg:quickassess:<memberId>:<task> */
      var rest = act.slice(15);
      var sep  = rest.indexOf(":");
      if (sep >= 0) {
        selectedMember = rest.slice(0, sep);
        selectedTask   = rest.slice(sep + 1);
        selectedLevel  = "";
        assessNote     = "";
        activeTab      = "assess";
        rerender();
      }
      return;
    }
    if (act === "sg:save") {
      /* Snapshot text fields */
      if (container) {
        var taskEl   = container.querySelector("#sgTask");
        var noteEl   = container.querySelector("#sgNote");
        var levelEl  = container.querySelector("#sgLevel");
        var memberEl = container.querySelector("#sgMember");
        if (taskEl)   selectedTask   = String(taskEl.value || "").trim();
        if (noteEl)   assessNote     = String(noteEl.value || "").trim();
        if (levelEl)  selectedLevel  = levelEl.value;
        if (memberEl) selectedMember = memberEl.value;
      }
      if (!selectedMember)       { formError = L("Vælg et teammedlem.","Select a team member."); rerender(); return; }
      if (!selectedTask.trim())  { formError = L("Angiv en opgave.","Enter a task."); rerender(); return; }
      if (!selectedLevel)        { formError = L("Vælg et udviklingsniveau.","Select a development level."); rerender(); return; }

      var memberName = "";
      (c.members ? c.members() : []).forEach(function (m) { if (m.id === selectedMember) memberName = m.name; });
      var arr = loadAssessments();
      arr.push({ id: (c.uid ? c.uid("sg") : Date.now().toString(36)), memberId: selectedMember, memberName: memberName,
        task: selectedTask.trim(), level: selectedLevel, note: assessNote, date: c.todayISO ? c.todayISO() : new Date().toISOString().slice(0,10) });
      saveAssessments(arr);
      formError = null; savedFlash = true; historyMember = selectedMember;
      selectedTask = ""; assessNote = "";
      rerender();
      setTimeout(function () {
        savedFlash = false;
        var el = document.getElementById("situationalGuideRoot");
        if (el) { el.innerHTML = viewHtml(); bind(el); }
      }, 2000);
    }
  }

  /* ─── Public API ─────────────────────────────────────────────────────────── */

  function open(opts) {
    if (root.LCUI && typeof root.LCUI.navigate === "function") root.LCUI.navigate("situationalGuide");
    if (opts && opts.memberId) { selectedMember = opts.memberId; activeTab = "assess"; }
  }

  var API = { viewHtml: viewHtml, bind: bind, open: open, STYLES: STYLES, DEV_LEVELS: DEV_LEVELS, getSituationalHealth: getSituationalHealth };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.LCSituationalGuideUI = API;

})(typeof window !== "undefined" ? window : globalThis);
