/* ============================================================================
   js/leadership-journal-ui.js — LEADERSHIP JOURNAL (deep rewrite)

   localStorage key: "lcLeadershipJournal" — JournalEntry[]
   {
     id, type: "weekly_reflection"|"daily_note"|"insight"|"intention",
     date: ISO date string,
     weekKey: "2026-W42",
     title: string,

     // Weekly reflection fields
     wins: string,
     challenges: string,
     teamPulse: string,               // how the team is doing
     leadershipBehavior: string,      // what I did as a leader
     weeklyIntention: string,         // what I commit to next week
     growthTheme: string,             // the growth area this week touches
     energyLevel: 1|2|3|4|5,
     tone: "reflective"|"motivated"|"concerned"|"frustrated"|"proud"|"uncertain",

     // Daily / insight / intention fields
     content: string,
     tags: string[],
     isPrivate: boolean,

     createdAt, updatedAt
   }

   Health export: window.LCLeadershipJournalUI.getJournalHealth()
   → { weeklyStreak, currentIntention, currentTone, growthThemes: string[] }

   Cadence score contribution:
   - "Weekly reflection this week" → true when entry of type "weekly_reflection" exists for current week
   ============================================================================ */

(function (root) {
  "use strict";

  /* ── constants ─────────────────────────────────────────────────── */
  const KEY = "lcLeadershipJournal";

  const TYPES = {
    weekly_reflection: "Weekly Reflection",
    daily_note:        "Daily Note",
    insight:           "Insight",
    intention:         "Intention"
  };

  const TONES = [
    { value:"motivated",  label:"Motivated",  icon:"🚀" },
    { value:"proud",      label:"Proud",       icon:"🏆" },
    { value:"reflective", label:"Reflective",  icon:"🤔" },
    { value:"uncertain",  label:"Uncertain",   icon:"❓" },
    { value:"concerned",  label:"Concerned",   icon:"😟" },
    { value:"frustrated", label:"Frustrated",  icon:"😤" }
  ];

  const GROWTH_THEMES = [
    "Communication","Delegation","Coaching","Strategic Thinking","Conflict Resolution",
    "Decision Making","Influence","Accountability","Emotional Intelligence","Vision Setting",
    "Team Building","Change Management","Feedback","Presence","Resilience"
  ];

  const ENERGY_LABELS = { 1:"Depleted",2:"Low",3:"Steady",4:"Energized",5:"Peak" };
  const ENERGY_COLORS = { 1:"risk",2:"warn",3:"info",4:"ok",5:"ok" };

  /* ── state ──────────────────────────────────────────────────────── */
  let activeView    = "list";    // "list" | "write" | "detail" | "analytics"
  let editingId     = null;
  let editingType   = "weekly_reflection";
  let filterType    = "all";
  let filterTheme   = "all";
  let searchQ       = "";
  let container     = null;

  /* ── ISO week helpers ────────────────────────────────────────────── */
  function isoWeek(d = new Date()) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
  }

  function weekLabel(wk) {
    // "2026-W42" → "Week 42, 2026"
    const [yr, w] = wk.split("-W");
    return `Week ${w}, ${yr}`;
  }

  /* ── storage helpers ─────────────────────────────────────────────── */
  const LEGACY_KEY   = "leadershipJournal";            // LCLSCore journal store (pre-rewrite)
  const MIGRATED_KEY = "lcLeadershipJournal:migrated"; // weekKeys already imported once

  function readJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }

  // Monday (UTC) of an ISO week key like "2026-W41".
  function weekKeyToDate(wk) {
    const m = /^(\d{4})-W(\d{2})$/.exec(String(wk || ""));
    if (!m) return new Date().toISOString().slice(0, 10);
    const jan4 = new Date(Date.UTC(+m[1], 0, 4));
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1) + (+m[2] - 1) * 7);
    return monday.toISOString().slice(0, 10);
  }

  // One-time, non-destructive import of legacy weekly entries. The legacy key is
  // never modified; the marker list stops a deleted entry from being re-imported.
  function migrateLegacy(entries) {
    const legacyRaw = readJSON(LEGACY_KEY, null);
    if (!legacyRaw) return entries;
    const legacy = Array.isArray(legacyRaw) ? legacyRaw
      : (typeof legacyRaw === "object" ? Object.keys(legacyRaw).map(k => Object.assign({ weekKey: k }, legacyRaw[k])) : []);
    const done = new Set(readJSON(MIGRATED_KEY, []));
    let added = 0;
    legacy.forEach(old => {
      if (!old || !old.weekKey || done.has(old.weekKey)) return;
      const join = (...parts) => parts.filter(p => p && String(p).trim()).join("\n\n");
      entries.push({
        id: "legacy_" + old.weekKey,
        type: "weekly_reflection",
        date: weekKeyToDate(old.weekKey),
        weekKey: old.weekKey,
        title: "Weekly reflection",
        wins: join(old.wentWell, old.proudOf),
        challenges: old.dodifferently || "",
        teamPulse: "",
        leadershipBehavior: old.learned || "",
        weeklyIntention: "",
        growthTheme: "",
        energyLevel: null,
        tone: "",
        content: old.promptResponse || "",
        tags: ["imported"],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      done.add(old.weekKey);
      added++;
    });
    if (added) {
      try {
        localStorage.setItem(KEY, JSON.stringify(entries));
        localStorage.setItem(MIGRATED_KEY, JSON.stringify([...done]));
      } catch { /* quota: entries still shown this session, retried next load */ }
    }
    return entries;
  }

  function load() {
    const arr = readJSON(KEY, []);
    return migrateLegacy(Array.isArray(arr) ? arr : []);
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function uid() { return "jn_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  /* ── health export ───────────────────────────────────────────────── */
  function getJournalHealth() {
    const entries = load();
    const curWeek = isoWeek();

    // Weekly streak: consecutive weeks with a weekly reflection
    let streak = 0;
    const weeks = new Set(entries.filter(e => e.type === "weekly_reflection").map(e => e.weekKey));
    let wk = curWeek;
    while (weeks.has(wk)) {
      streak++;
      // Go back one week
      const [yr, w] = wk.split("-W");
      let n = parseInt(w, 10) - 1;
      let y = parseInt(yr, 10);
      if (n === 0) { y--; n = 52; }
      wk = `${y}-W${String(n).padStart(2,"0")}`;
    }

    // Current intention (most recent weekly reflection's weeklyIntention)
    const latestReflection = entries
      .filter(e => e.type === "weekly_reflection")
      .sort((a,b) => b.weekKey.localeCompare(a.weekKey))[0];

    // Growth themes frequency (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentThemes = entries
      .filter(e => e.growthTheme && new Date(e.date) >= fourWeeksAgo)
      .map(e => e.growthTheme);
    const themeFreq = {};
    recentThemes.forEach(t => { themeFreq[t] = (themeFreq[t]||0)+1; });
    const topThemes = Object.entries(themeFreq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t);

    const reflectedThisWeek = weeks.has(curWeek);

    return {
      weeklyStreak: streak,
      reflectedThisWeek,
      currentIntention: latestReflection?.weeklyIntention || null,
      currentTone: latestReflection?.tone || null,
      growthThemes: topThemes,
      totalEntries: entries.length
    };
  }

  /* ── render dispatch ─────────────────────────────────────────────── */
  function render() {
    if (!container) return;
    if (activeView === "list")      { renderList(); return; }
    if (activeView === "write")     { renderWriteForm(); return; }
    if (activeView === "detail")    { renderDetail(); return; }
    if (activeView === "analytics") { renderAnalytics(); return; }
  }

  /* ── LIST VIEW ───────────────────────────────────────────────────── */
  function renderList() {
    const entries = load();
    const health  = getJournalHealth();
    const curWeek = isoWeek();
    const hasReflectedThisWeek = entries.some(e => e.type === "weekly_reflection" && e.weekKey === curWeek);

    container.innerHTML = `
      <div class="lc-page-header">
        <div>
          <h2 class="lc-page-title">Leadership Journal</h2>
          <p class="lc-page-sub">Reflect, grow, and track your leadership journey</p>
        </div>
        <div class="lc-hstack gap-2">
          <button class="lc-btn lc-btn--ghost" data-act="analytics">Analytics</button>
          <button class="lc-btn lc-btn--ghost" data-act="quick-write" data-type="daily_note">Quick Note</button>
          <button class="lc-btn lc-btn--primary" data-act="quick-write" data-type="weekly_reflection">Weekly Reflection</button>
        </div>
      </div>

      ${!hasReflectedThisWeek ? `
        <div class="lc-alert lc-alert--warn mb-4">
          📝 You haven't reflected this week yet.
          <button class="lc-btn lc-btn--primary lc-btn--sm ml-3" data-act="quick-write" data-type="weekly_reflection">Reflect Now</button>
        </div>
      ` : ""}

      ${healthStripHtml(health)}

      <div class="lc-filter-bar mb-4">
        <input class="lc-input lc-search-input" placeholder="Search journal…" value="${searchQ}" data-act="search" style="max-width:240px">
        <select class="lc-select" data-act="filter-type">
          <option value="all">All Types</option>
          ${Object.entries(TYPES).map(([v,l])=>`<option value="${v}"${filterType===v?" selected":""}>${l}</option>`).join("")}
        </select>
        <select class="lc-select" data-act="filter-theme">
          <option value="all">All Themes</option>
          ${GROWTH_THEMES.map(t=>`<option value="${t}"${filterTheme===t?" selected":""}>${t}</option>`).join("")}
        </select>
      </div>

      ${entriesListHtml(entries)}
    `;
  }

  function healthStripHtml(h) {
    const toneEntry = TONES.find(t => t.value === h.currentTone);
    return `
    <div class="lc-kpi-grid mb-5">
      <div class="lc-kpi-card">
        <span class="lc-kpi-value">${h.weeklyStreak}</span>
        <span class="lc-kpi-label">Week Streak</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value">${h.totalEntries}</span>
        <span class="lc-kpi-label">Total Entries</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value">${toneEntry?toneEntry.icon+"":"—"}</span>
        <span class="lc-kpi-label">Current Tone</span>
      </div>
      ${h.currentIntention ? `
        <div class="lc-kpi-card" style="grid-column:span 3">
          <span class="lc-kpi-label">This Week's Intention</span>
          <span class="lc-kpi-value" style="font-size:1rem;font-weight:500">${esc(h.currentIntention)}</span>
        </div>
      ` : ""}
    </div>`;
  }

  function entriesListHtml(entries) {
    let filtered = entries.filter(e => {
      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterTheme !== "all" && e.growthTheme !== filterTheme) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        const text = [e.title, e.content, e.wins, e.challenges, e.weeklyIntention, ...(e.tags||[])].join(" ").toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a,b) => b.date.localeCompare(a.date));

    if (!filtered.length) return `<div class="lc-empty-state"><div class="lc-empty-icon">📓</div><p>${entries.length?"No entries match your filters.":"Your journal is empty. Start your first reflection."}</p></div>`;

    // Group by week
    const byWeek = {};
    filtered.forEach(e => {
      const wk = e.weekKey || "Other";
      if (!byWeek[wk]) byWeek[wk] = [];
      byWeek[wk].push(e);
    });

    return Object.entries(byWeek).sort((a,b)=>b[0].localeCompare(a[0])).map(([wk, items]) => `
      <div class="lc-journal-week-group">
        <div class="lc-section-label">${wk === "Other" ? "Older" : weekLabel(wk)}</div>
        ${items.map(e => entryRowHtml(e)).join("")}
      </div>
    `).join("");
  }

  function entryRowHtml(e) {
    const toneEntry = TONES.find(t => t.value === e.tone);
    const typeLabel = TYPES[e.type] || e.type;
    const preview = e.type === "weekly_reflection"
      ? (e.wins||e.weeklyIntention||e.challenges||"").slice(0,120)
      : (e.content||"").slice(0,120);

    return `
    <div class="lc-card lc-journal-entry-card mb-2" data-act="open-entry" data-id="${e.id}" style="cursor:pointer">
      <div class="lc-hstack">
        <div class="lc-journal-type-icon">${e.type==="weekly_reflection"?"🗓":e.type==="insight"?"💡":e.type==="intention"?"🎯":"✏️"}</div>
        <div style="flex:1;min-width:0">
          <div class="lc-hstack gap-2 mb-1 flex-wrap">
            <span class="lc-badge lc-badge--sm">${typeLabel}</span>
            ${e.growthTheme ? `<span class="lc-tag lc-tag--sm">${esc(e.growthTheme)}</span>` : ""}
            ${toneEntry ? `<span class="text-muted text-sm">${toneEntry.icon} ${toneEntry.label}</span>` : ""}
            ${e.energyLevel ? `<span class="text-sm lc-badge lc-badge--${ENERGY_COLORS[e.energyLevel]}">${ENERGY_LABELS[e.energyLevel]}</span>` : ""}
            <span class="ml-auto text-muted text-sm">${e.date}</span>
          </div>
          ${e.title ? `<div class="lc-journal-entry-title">${esc(e.title)}</div>` : ""}
          ${preview ? `<div class="lc-journal-entry-preview text-muted">${esc(preview)}${preview.length===120?"…":""}</div>` : ""}
          ${(e.tags||[]).length ? `<div class="lc-tag-row mt-1">${e.tags.map(t=>`<span class="lc-tag lc-tag--sm">${esc(t)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="lc-hstack gap-1 ml-2">
          <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-entry" data-id="${e.id}" onclick="event.stopPropagation()">Edit</button>
          <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-entry" data-id="${e.id}" onclick="event.stopPropagation()">×</button>
        </div>
      </div>
    </div>`;
  }

  /* ── WRITE / EDIT FORM ───────────────────────────────────────────── */
  function renderWriteForm() {
    const isNew   = !editingId;
    const entries = load();
    const entry   = isNew ? null : entries.find(e => e.id === editingId);
    const type    = entry?.type || editingType;
    const today   = new Date().toISOString().slice(0,10);

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Back</button>
        <h2 class="lc-page-title">${isNew ? "New "+TYPES[type] : "Edit "+TYPES[type]}</h2>
        ${!isNew ? `<button class="lc-btn lc-btn--ghost lc-btn--danger" data-act="delete-entry" data-id="${entry.id}">Delete</button>` : ""}
      </div>
      <div id="jn-flash"></div>

      <div class="lc-journal-form-wrap">
        <div class="lc-card mb-4">
          <div class="lc-form-grid">
            <div class="lc-field">
              <label class="lc-label">Entry Type</label>
              <select class="lc-select" id="jn-type" data-act="change-type">
                ${Object.entries(TYPES).map(([v,l])=>`<option value="${v}"${type===v?" selected":""}>${l}</option>`).join("")}
              </select>
            </div>
            <div class="lc-field">
              <label class="lc-label">Date</label>
              <input class="lc-input" type="date" id="jn-date" value="${entry?.date||today}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Title (optional)</label>
              <input class="lc-input" id="jn-title" value="${esc(entry?.title||"")}" placeholder="Give this entry a title…">
            </div>
            <div class="lc-field">
              <label class="lc-label">Growth Theme</label>
              <select class="lc-select" id="jn-theme">
                <option value="">— None —</option>
                ${GROWTH_THEMES.map(t=>`<option${(entry?.growthTheme||"")==t?" selected":""}>${t}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        ${type === "weekly_reflection" ? weeklyReflectionFields(entry) : generalFields(entry, type)}

        <div class="lc-card mt-4">
          <h3 class="lc-card-title">Tone & Energy</h3>
          <div class="lc-form-grid">
            <div class="lc-field">
              <label class="lc-label">Leadership Tone</label>
              <div class="lc-tone-picker" id="jn-tone-picker">
                ${TONES.map(t=>`
                  <button class="lc-tone-btn${(entry?.tone||"")==t.value?" is-active":""}" data-act="set-tone" data-tone="${t.value}" title="${t.label}">
                    <span class="lc-tone-icon">${t.icon}</span>
                    <span class="lc-tone-label">${t.label}</span>
                  </button>
                `).join("")}
              </div>
              <input type="hidden" id="jn-tone" value="${entry?.tone||""}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Energy Level (1–5)</label>
              <div class="lc-energy-picker" id="jn-energy-picker">
                ${[1,2,3,4,5].map(n=>`
                  <button class="lc-energy-btn${(entry?.energyLevel||0)==n?" is-active":""}" data-act="set-energy" data-energy="${n}" title="${ENERGY_LABELS[n]}">
                    ${n}
                  </button>
                `).join("")}
              </div>
              <span class="text-muted text-sm" id="jn-energy-label">${entry?.energyLevel?ENERGY_LABELS[entry.energyLevel]:""}</span>
              <input type="hidden" id="jn-energy" value="${entry?.energyLevel||""}">
            </div>
          </div>
        </div>

        <div class="lc-card mt-4">
          <h3 class="lc-card-title">Tags</h3>
          <div class="lc-tag-editor" id="jn-tag-editor">
            ${(entry?.tags||[]).map((t,i)=>`<span class="lc-tag lc-tag--editable">${esc(t)}<button data-act="remove-tag" data-idx="${i}">×</button></span>`).join("")}
            <input class="lc-input lc-tag-input" placeholder="Add tag…" data-act="tag-input">
          </div>
        </div>

        <div class="lc-hstack gap-2 mt-5 justify-end">
          <button class="lc-btn lc-btn--ghost" data-act="back">Cancel</button>
          <button class="lc-btn lc-btn--primary" data-act="save-entry" data-id="${entry?.id||"__new__"}">Save Entry</button>
        </div>
      </div>
    `;
  }

  function weeklyReflectionFields(e) {
    return `
    <div class="lc-card">
      <h3 class="lc-card-title">Weekly Reflection</h3>
      <div class="lc-journal-prompts">
        <div class="lc-field">
          <label class="lc-label lc-label--prompt">🏆 Wins this week — What went well?</label>
          <textarea class="lc-textarea" id="jn-wins" rows="4" placeholder="What did I or the team achieve? What am I proud of?">${esc(e?.wins||"")}</textarea>
        </div>
        <div class="lc-field">
          <label class="lc-label lc-label--prompt">🚧 Challenges — What was hard?</label>
          <textarea class="lc-textarea" id="jn-challenges" rows="4" placeholder="What struggled? What didn't go as planned?">${esc(e?.challenges||"")}</textarea>
        </div>
        <div class="lc-field">
          <label class="lc-label lc-label--prompt">👥 Team Pulse — How is the team doing?</label>
          <textarea class="lc-textarea" id="jn-team-pulse" rows="3" placeholder="Team morale, collaboration, workload, concerns…">${esc(e?.teamPulse||"")}</textarea>
        </div>
        <div class="lc-field">
          <label class="lc-label lc-label--prompt">🪞 My Leadership — How did I show up?</label>
          <textarea class="lc-textarea" id="jn-leadership" rows="4" placeholder="How did I lead this week? What did I do well? What would I do differently?">${esc(e?.leadershipBehavior||"")}</textarea>
        </div>
        <div class="lc-field">
          <label class="lc-label lc-label--prompt">🎯 Next Week's Intention — What do I commit to?</label>
          <input class="lc-input" id="jn-intention" value="${esc(e?.weeklyIntention||"")}" placeholder="One clear intention for the week ahead…">
        </div>
      </div>
    </div>`;
  }

  function generalFields(e, type) {
    const placeholder = {
      daily_note: "What's on your mind today? Observations, decisions, interactions…",
      insight:    "What insight or realization do you want to capture?",
      intention:  "What intention or commitment do you want to set?"
    }[type] || "Write here…";
    return `
    <div class="lc-card">
      <h3 class="lc-card-title">${TYPES[type]}</h3>
      <textarea class="lc-textarea" id="jn-content" rows="12" placeholder="${placeholder}">${esc(e?.content||"")}</textarea>
    </div>`;
  }

  /* ── DETAIL VIEW ─────────────────────────────────────────────────── */
  function renderDetail() {
    const entries = load();
    const e = entries.find(x => x.id === editingId);
    if (!e) { activeView = "list"; render(); return; }
    const toneEntry = TONES.find(t => t.value === e.tone);

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Back</button>
        <div>
          <h2 class="lc-page-title">${e.title ? esc(e.title) : TYPES[e.type]}</h2>
          <p class="lc-page-sub">${e.date}${e.weekKey?" · "+weekLabel(e.weekKey):""}</p>
        </div>
        <button class="lc-btn lc-btn--ghost" data-act="edit-entry" data-id="${e.id}">Edit</button>
      </div>

      <div class="lc-journal-detail-wrap">
        <div class="lc-hstack gap-2 mb-4 flex-wrap">
          <span class="lc-badge">${TYPES[e.type]}</span>
          ${e.growthTheme ? `<span class="lc-tag">${esc(e.growthTheme)}</span>` : ""}
          ${toneEntry ? `<span class="lc-badge lc-badge--info">${toneEntry.icon} ${toneEntry.label}</span>` : ""}
          ${e.energyLevel ? `<span class="lc-badge lc-badge--${ENERGY_COLORS[e.energyLevel]}">${ENERGY_LABELS[e.energyLevel]} Energy</span>` : ""}
        </div>

        ${e.type === "weekly_reflection" ? weeklyDetailHtml(e) : `
          <div class="lc-card">
            <div class="lc-journal-content">${nl2p(e.content||"")}</div>
          </div>
        `}

        ${(e.tags||[]).length ? `
          <div class="lc-tag-row mt-3">
            ${e.tags.map(t=>`<span class="lc-tag">${esc(t)}</span>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  function weeklyDetailHtml(e) {
    const sections = [
      { label:"🏆 Wins", val: e.wins },
      { label:"🚧 Challenges", val: e.challenges },
      { label:"👥 Team Pulse", val: e.teamPulse },
      { label:"🪞 Leadership Behavior", val: e.leadershipBehavior },
      { label:"🎯 Next Week's Intention", val: e.weeklyIntention }
    ].filter(s => s.val);

    return sections.map(s => `
      <div class="lc-card mb-3">
        <div class="lc-journal-section-label">${s.label}</div>
        <div class="lc-journal-content">${nl2p(s.val)}</div>
      </div>
    `).join("");
  }

  /* ── ANALYTICS VIEW ──────────────────────────────────────────────── */
  function renderAnalytics() {
    const entries = load();
    const health  = getJournalHealth();

    // Tone frequency over time
    const toneDist = {};
    TONES.forEach(t => { toneDist[t.value] = 0; });
    entries.forEach(e => { if (e.tone) toneDist[e.tone]++; });

    // Growth theme frequency
    const themeDist = {};
    entries.forEach(e => { if (e.growthTheme) themeDist[e.growthTheme] = (themeDist[e.growthTheme]||0)+1; });
    const topThemes = Object.entries(themeDist).sort((a,b)=>b[1]-a[1]).slice(0,8);

    // Energy trend (last 12 reflections)
    const energyTrend = entries
      .filter(e => e.energyLevel)
      .sort((a,b)=>a.date.localeCompare(b.date))
      .slice(-12)
      .map(e => ({ date: e.date, energy: e.energyLevel }));

    // Reflection frequency (last 12 weeks)
    const reflectionByWeek = {};
    entries.filter(e => e.type === "weekly_reflection").forEach(e => {
      reflectionByWeek[e.weekKey] = (reflectionByWeek[e.weekKey]||0)+1;
    });

    // Entry type breakdown
    const typeDist = {};
    Object.keys(TYPES).forEach(t => { typeDist[t] = 0; });
    entries.forEach(e => { typeDist[e.type]++; });

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Journal</button>
        <h2 class="lc-page-title">Journal Analytics</h2>
      </div>

      <div class="lc-kpi-grid mb-6">
        <div class="lc-kpi-card"><span class="lc-kpi-value">${entries.length}</span><span class="lc-kpi-label">Total Entries</span></div>
        <div class="lc-kpi-card"><span class="lc-kpi-value">${health.weeklyStreak}</span><span class="lc-kpi-label">Reflection Streak</span></div>
        <div class="lc-kpi-card"><span class="lc-kpi-value">${entries.filter(e=>e.type==="weekly_reflection").length}</span><span class="lc-kpi-label">Weekly Reflections</span></div>
        <div class="lc-kpi-card"><span class="lc-kpi-value">${topThemes[0]?topThemes[0][0]:"—"}</span><span class="lc-kpi-label">Top Growth Theme</span></div>
      </div>

      <div class="lc-analytics-grid">
        <div class="lc-card">
          <h3 class="lc-card-title">Tone Distribution</h3>
          ${TONES.map(t => {
            const pct = entries.length ? Math.round(toneDist[t.value]/entries.length*100) : 0;
            return `<div class="lc-dist-row">
              <span class="lc-dist-label">${t.icon} ${t.label}</span>
              <div class="lc-dist-track"><div class="lc-dist-fill" style="width:${pct}%"></div></div>
              <span class="lc-dist-count">${toneDist[t.value]}</span>
            </div>`;
          }).join("")}
        </div>
        <div class="lc-card">
          <h3 class="lc-card-title">Growth Themes (All Time)</h3>
          ${topThemes.length ? topThemes.map(([theme, cnt]) => {
            const pct = entries.length ? Math.round(cnt/entries.length*100) : 0;
            return `<div class="lc-dist-row">
              <span class="lc-dist-label">${esc(theme)}</span>
              <div class="lc-dist-track"><div class="lc-dist-fill" style="width:${pct*3}%;max-width:100%"></div></div>
              <span class="lc-dist-count">${cnt}</span>
            </div>`;
          }).join("") : `<p class="text-muted">No growth themes tagged yet.</p>`}
        </div>
        <div class="lc-card">
          <h3 class="lc-card-title">Entry Type Breakdown</h3>
          ${Object.entries(TYPES).map(([type, label]) => {
            const cnt = typeDist[type]||0;
            const pct = entries.length ? Math.round(cnt/entries.length*100) : 0;
            return `<div class="lc-dist-row">
              <span class="lc-dist-label">${label}</span>
              <div class="lc-dist-track"><div class="lc-dist-fill" style="width:${pct}%"></div></div>
              <span class="lc-dist-count">${cnt}</span>
            </div>`;
          }).join("")}
        </div>
        ${energyTrend.length >= 3 ? `
          <div class="lc-card">
            <h3 class="lc-card-title">Energy Trend (Last ${energyTrend.length} Entries)</h3>
            <div class="lc-energy-trend">
              ${energyTrend.map(({date,energy}) => `
                <div class="lc-energy-trend-bar" title="${date}: ${ENERGY_LABELS[energy]}" style="height:${energy*20}%">
                  <div class="lc-energy-bar-fill lc-energy-bar-fill--${ENERGY_COLORS[energy]}"></div>
                </div>
              `).join("")}
            </div>
            <div class="text-muted text-sm mt-1">Avg: ${(energyTrend.reduce((s,x)=>s+x.energy,0)/energyTrend.length).toFixed(1)} / 5</div>
          </div>
        ` : ""}
        ${health.currentIntention ? `
          <div class="lc-card" style="grid-column:span 2">
            <h3 class="lc-card-title">Current Intention</h3>
            <blockquote class="lc-journal-blockquote">${esc(health.currentIntention)}</blockquote>
          </div>
        ` : ""}
      </div>
    `;
  }

  /* ── event handling ──────────────────────────────────────────────── */
  function handleEvent(e) {
    const el  = e.target;
    const act = el.closest("[data-act]")?.dataset?.act;
    if (!act) return;
    const id  = el.closest("[data-id]")?.dataset?.id || el.dataset?.id;

    if (act === "analytics")    { activeView = "analytics"; render(); return; }
    if (act === "back")         { activeView = "list"; editingId = null; render(); return; }
    if (act === "search")       { searchQ = el.value; render(); return; }
    if (act === "filter-type")  { filterType  = el.value; render(); return; }
    if (act === "filter-theme") { filterTheme = el.value; render(); return; }

    if (act === "quick-write") {
      editingId   = null;
      editingType = el.dataset.type || "daily_note";
      activeView  = "write";
      render(); return;
    }
    if (act === "open-entry") {
      editingId  = id;
      activeView = "detail";
      render(); return;
    }
    if (act === "edit-entry") {
      editingId  = id;
      activeView = "write";
      render(); return;
    }
    if (act === "delete-entry") {
      if (!confirm("Delete this entry?")) return;
      save(load().filter(x => x.id !== id));
      editingId = null; activeView = "list"; render(); return;
    }
    if (act === "change-type") {
      editingType = el.value;
      // Re-render form body for correct fields
      const wrapEl = container.querySelector(".lc-journal-form-wrap");
      if (wrapEl) {
        // rebuild only the fields section (between card and tone)
        // easiest: just re-render full form
        render(); return;
      }
    }
    if (act === "set-tone") {
      container.querySelectorAll(".lc-tone-btn").forEach(b => b.classList.remove("is-active"));
      el.closest(".lc-tone-btn").classList.add("is-active");
      const inp = container.querySelector("#jn-tone");
      if (inp) inp.value = el.dataset.tone || el.closest("[data-tone]")?.dataset.tone || "";
      return;
    }
    if (act === "set-energy") {
      container.querySelectorAll(".lc-energy-btn").forEach(b => b.classList.remove("is-active"));
      el.closest(".lc-energy-btn").classList.add("is-active");
      const val = el.dataset.energy || el.closest("[data-energy]")?.dataset.energy || "";
      const inp = container.querySelector("#jn-energy");
      if (inp) inp.value = val;
      const lbl = container.querySelector("#jn-energy-label");
      if (lbl) lbl.textContent = ENERGY_LABELS[val] || "";
      return;
    }
    if (act === "tag-input") {
      if (e.type === "keydown" && (e.key === "Enter" || e.key === ",")) {
        e.preventDefault();
        const val = el.value.trim().replace(/,$/,"");
        if (val) { addTag(val, el); }
      }
      return;
    }
    if (act === "remove-tag") {
      const idx = parseInt(el.dataset.idx, 10);
      removeTag(idx); return;
    }
    if (act === "save-entry") { saveEntry(id); return; }
  }

  /* ── save / delete helpers ───────────────────────────────────────── */
  function saveEntry(id) {
    const isNew = !id || id === "__new__";
    const type  = container.querySelector("#jn-type")?.value || "daily_note";
    const date  = container.querySelector("#jn-date")?.value || new Date().toISOString().slice(0,10);
    const now   = new Date().toISOString();

    const entry = {
      id:        isNew ? uid() : id,
      type,
      date,
      weekKey:   isoWeek(new Date(date)),
      title:     container.querySelector("#jn-title")?.value?.trim() || "",
      growthTheme: container.querySelector("#jn-theme")?.value || "",
      tone:      container.querySelector("#jn-tone")?.value || "",
      energyLevel: parseInt(container.querySelector("#jn-energy")?.value||"0", 10) || null,
      tags:      collectTags(),
      isPrivate: false,
      // weekly reflection
      wins:      container.querySelector("#jn-wins")?.value?.trim() || "",
      challenges: container.querySelector("#jn-challenges")?.value?.trim() || "",
      teamPulse: container.querySelector("#jn-team-pulse")?.value?.trim() || "",
      leadershipBehavior: container.querySelector("#jn-leadership")?.value?.trim() || "",
      weeklyIntention: container.querySelector("#jn-intention")?.value?.trim() || "",
      // general
      content:   container.querySelector("#jn-content")?.value?.trim() || "",
      updatedAt: now,
      createdAt: now
    };

    const entries = load();
    const existing = entries.findIndex(e => e.id === entry.id);
    if (existing >= 0) {
      entry.createdAt = entries[existing].createdAt;
      entries[existing] = entry;
    } else {
      entries.push(entry);
    }
    save(entries);
    flash("jn-flash","Entry saved","ok");
    setTimeout(() => {
      editingId  = entry.id;
      activeView = "detail";
      render();
    }, 600);
  }

  function collectTags() {
    const editor = container.querySelector("#jn-tag-editor");
    if (!editor) return [];
    return Array.from(editor.querySelectorAll(".lc-tag--editable"))
      .map(el => el.textContent.trim().replace(/×$/, "").trim())
      .filter(Boolean);
  }

  function addTag(val, inputEl) {
    const editor = container.querySelector("#jn-tag-editor");
    if (!editor) return;
    const idx = editor.querySelectorAll(".lc-tag--editable").length;
    const span = document.createElement("span");
    span.className = "lc-tag lc-tag--editable";
    span.innerHTML = `${esc(val)}<button data-act="remove-tag" data-idx="${idx}">×</button>`;
    editor.insertBefore(span, inputEl);
    inputEl.value = "";
  }

  function removeTag(idx) {
    const editor = container.querySelector("#jn-tag-editor");
    if (!editor) return;
    const tags = editor.querySelectorAll(".lc-tag--editable");
    if (tags[idx]) tags[idx].remove();
    editor.querySelectorAll(".lc-tag--editable button[data-idx]").forEach((btn,i) => {
      btn.dataset.idx = i;
    });
  }

  function flash(id, msg, type="ok") {
    const el = container.querySelector("#"+id);
    if (!el) return;
    el.innerHTML = `<div class="lc-alert lc-alert--${type} mb-3">${msg}</div>`;
    setTimeout(() => { if (el) el.innerHTML = ""; }, 2500);
  }

  /* ── utils ───────────────────────────────────────────────────────── */
  function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function nl2p(s) {
    return esc(s).replace(/\n\n+/g,"</p><p>").replace(/\n/g,"<br>");
  }

  /* ── public API ──────────────────────────────────────────────────── */
  const UI = {
    /* ui.js contract: viewHtml() returns markup, then bind(rootEl) wires it.
       viewHtml renders into a detached node so first paint has content;
       bind re-renders into the live root so container-bound state is real. */
    viewHtml() {
      if (typeof document === "undefined") return "";
      const prev = container;
      const shell = document.createElement("div");
      container = shell;
      try { render(); }
      catch (e) { container = prev; return '<div class="empty">' + esc(String(e && e.message || e)) + '</div>'; }
      container = prev;
      return shell.innerHTML;
    },
    bind(el) { UI.mount(el); },
    mount(el) {
      container = el;
      if (!container) return;
      if (!container.dataset.lsxBound) {
        container.addEventListener("click",   handleEvent);
        container.addEventListener("change",  handleEvent);
        container.addEventListener("input",   handleEvent);
        container.addEventListener("keydown", handleEvent);
        container.dataset.lsxBound = "1";
      }
      render();
    },
    refresh() { render(); },
    getJournalHealth
  };

  root.LCLeadershipJournalUI = UI;
  if (typeof module !== "undefined" && module.exports) module.exports = UI;

})(typeof window !== "undefined" ? window : globalThis);
