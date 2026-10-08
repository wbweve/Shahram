/* ============================================================================
   js/ninety-day-ui.js — FIRST 90 DAYS PLANNER (deep rewrite)

   localStorage key: "lcNinetyDayPlans" — NinetyDayPlan[]
   {
     id, title, startDate, role, department, hiringManagerName,
     objectives: { phase: "30"|"60"|"90", category, title, description,
                   successCriteria: string[], status, dueDate, linkedModule,
                   linkedId, notes }[],
     stakeholders: { name, role, meetingDate, notes, action }[],
     keyLearnings: { date, topic, insight, source }[],
     wins: { date, description, impact }[],
     blockers: { date, description, resolution, status }[],
     createdAt, updatedAt, archivedAt
   }

   Health export: window.LCNinetyDayUI.getNinetyDayHealth()
   → { activePlan, daysRemaining, currentPhase, overdueCount, completedRate }

   Cross-wiring:
   - stakeholders linked to stakeholder-health-map
   - objectives can link to tasks or 1:1s
   ============================================================================ */

(function (root) {
  "use strict";

  /* ── constants ─────────────────────────────────────────────────── */
  const KEY = "lcNinetyDayPlans";

  const PHASES = ["30","60","90"];
  const PHASE_LABELS = { "30":"First 30 Days", "60":"Days 31–60", "90":"Days 61–90" };
  const PHASE_FOCUS  = {
    "30": "Learn, listen, and build relationships",
    "60": "Diagnose, plan, and begin contributing",
    "90": "Execute, deliver, and establish cadence"
  };
  const CATEGORIES = ["Relationships","Learning","Process","Strategy","Team","Delivery","Culture","Personal"];
  const STATUSES   = ["not_started","in_progress","completed","blocked","deferred"];
  const STATUS_LABELS = { not_started:"Not Started", in_progress:"In Progress", completed:"Completed", blocked:"Blocked", deferred:"Deferred" };
  const STATUS_CLASS  = { not_started:"muted", in_progress:"info", completed:"ok", blocked:"risk", deferred:"warn" };
  const BLOCKER_STATUSES = ["open","in_progress","resolved"];

  /* ── state ──────────────────────────────────────────────────────── */
  let activeView   = "home";       // "home" | "plan" | "edit_plan" | "new_plan"
  let activePlanId = null;
  let activePhase  = "all";        // "all" | "30" | "60" | "90"
  let activeSection= "objectives"; // "objectives" | "stakeholders" | "learnings" | "wins" | "blockers"
  let filterStatus = "all";
  let filterCat    = "all";
  let editingObjectiveIdx = null;
  let container    = null;

  /* ── storage helpers ─────────────────────────────────────────────── */
  const LEGACY_PROFILE_KEY = "ninety_day_profile";        // pre-rewrite { startDate, roleTitle }
  const LEGACY_DONE_KEY    = "lcNinetyDayPlans:migrated";

  function readLegacyProfile() {
    let raw = null;
    try {
      const st = root.LCStorageService;
      if (st && typeof st.get === "function") raw = st.get(LEGACY_PROFILE_KEY);
    } catch { raw = null; }
    if (!raw) { try { raw = JSON.parse(localStorage.getItem(LEGACY_PROFILE_KEY) || "null"); } catch { raw = null; } }
    if (!raw || typeof raw.startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.startDate)) return null;
    return { startDate: raw.startDate, roleTitle: typeof raw.roleTitle === "string" ? raw.roleTitle : "" };
  }

  // One-time: turn the old single profile into a full plan. Runs only when no
  // plans exist yet; the marker stops it re-creating a plan the user deleted.
  function migrateLegacy(plans) {
    if (plans.length) return plans;
    try { if (localStorage.getItem(LEGACY_DONE_KEY)) return plans; } catch { return plans; }
    const p = readLegacyProfile();
    if (!p) return plans;
    const now = new Date().toISOString();
    plans.push({
      id: uid(), title: p.roleTitle ? "First 90 days — " + p.roleTitle : "My first 90 days",
      startDate: p.startDate, role: p.roleTitle, department: "", hiringManagerName: "",
      objectives: starterObjectives(p.startDate),
      stakeholders: [], keyLearnings: [], wins: [], blockers: [],
      createdAt: now, updatedAt: now
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(plans));
      localStorage.setItem(LEGACY_DONE_KEY, "1");
    } catch { /* quota: plan shown this session only */ }
    return plans;
  }

  function load() {
    let arr; try { arr = JSON.parse(localStorage.getItem(KEY)||"[]"); } catch { arr = []; }
    return migrateLegacy(Array.isArray(arr) ? arr : []);
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function uid() { return "nd_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function objId() { return "obj_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  /* ── derived helpers ─────────────────────────────────────────────── */
  function daysElapsed(plan) {
    return Math.floor((Date.now() - new Date(plan.startDate)) / 86400000);
  }
  function currentPhase(plan) {
    const d = daysElapsed(plan);
    if (d <= 30) return "30";
    if (d <= 60) return "60";
    return "90";
  }
  function daysRemaining(plan) {
    return Math.max(0, 90 - daysElapsed(plan));
  }
  function phaseProgress(plan, phase) {
    const objs = (plan.objectives||[]).filter(o => o.phase === phase);
    if (!objs.length) return 0;
    return Math.round(objs.filter(o => o.status === "completed").length / objs.length * 100);
  }
  function activePlan() {
    const plans = load();
    if (activePlanId) return plans.find(p => p.id === activePlanId) || null;
    // Return most recent non-archived plan
    return plans.filter(p => !p.archivedAt).sort((a,b) => new Date(b.startDate)-new Date(a.startDate))[0] || null;
  }

  /* ── health export ───────────────────────────────────────────────── */
  function getNinetyDayHealth() {
    const plan = activePlan();
    if (!plan) return { activePlan: null, daysRemaining: null, currentPhase: null, overdueCount: 0, completedRate: 0 };
    const today = new Date().toISOString().slice(0,10);
    const objs  = plan.objectives || [];
    const overdue = objs.filter(o => o.status !== "completed" && o.dueDate && o.dueDate < today).length;
    const done    = objs.filter(o => o.status === "completed").length;
    const rate    = objs.length ? Math.round(done/objs.length*100) : 0;
    return {
      activePlan: plan.title,
      daysRemaining: daysRemaining(plan),
      currentPhase: currentPhase(plan),
      overdueCount: overdue,
      completedRate: rate
    };
  }

  /* ── render dispatch ─────────────────────────────────────────────── */
  function render() {
    if (!container) return;
    if (activeView === "home")      { renderHome(); return; }
    if (activeView === "new_plan")  { renderPlanForm(null); return; }
    if (activeView === "edit_plan") {
      const plan = activePlan();
      renderPlanForm(plan); return;
    }
    if (activeView === "plan")      { renderPlanView(); return; }
  }

  /* ── HOME VIEW ───────────────────────────────────────────────────── */
  function renderHome() {
    const plans = load().filter(p => !p.archivedAt);
    const archived = load().filter(p => p.archivedAt);
    container.innerHTML = `
      <div class="lc-page-header">
        <div>
          <h2 class="lc-page-title">90-Day Plans</h2>
          <p class="lc-page-sub">Structure your leadership transition and onboarding</p>
        </div>
        <button class="lc-btn lc-btn--primary" data-act="new-plan">+ New Plan</button>
      </div>
      ${plans.length === 0 ? `
        <div class="lc-empty-state">
          <div class="lc-empty-icon">🗓</div>
          <p>No active 90-day plans. Create one to structure your transition.</p>
          <button class="lc-btn lc-btn--primary mt-3" data-act="new-plan">+ Create Plan</button>
        </div>
      ` : `
        <div class="lc-card-grid">
          ${plans.map(p => planCardHtml(p)).join("")}
        </div>
      `}
      ${archived.length ? `
        <h3 class="lc-section-title mt-6">Archived Plans</h3>
        <div class="lc-card-grid">
          ${archived.map(p => planCardHtml(p, true)).join("")}
        </div>
      ` : ""}
    `;
  }

  function planCardHtml(p, archived=false) {
    const d   = daysElapsed(p);
    const pct = Math.min(100, Math.round(d/90*100));
    const phase = currentPhase(p);
    const objs = p.objectives || [];
    const done = objs.filter(o => o.status === "completed").length;
    const overdue = objs.filter(o => o.status !== "completed" && o.dueDate && o.dueDate < new Date().toISOString().slice(0,10)).length;
    return `
    <div class="lc-card lc-plan-card" data-act="open-plan" data-id="${p.id}" style="cursor:pointer">
      <div class="lc-hstack mb-2">
        <span class="lc-badge lc-badge--info">Day ${Math.min(d,90)}</span>
        <span class="lc-badge lc-badge--${phase==="90"?"ok":phase==="60"?"warn":"info"}">${PHASE_LABELS[phase]}</span>
        ${archived ? `<span class="lc-badge ml-auto">Archived</span>` : `<span class="ml-auto text-muted text-sm">${daysRemaining(p)}d left</span>`}
      </div>
      <div class="lc-candidate-name">${esc(p.title)}</div>
      ${p.role ? `<div class="text-muted text-sm">${esc(p.role)}${p.department?" · "+esc(p.department):""}</div>` : ""}
      <div class="lc-readiness-bar-wrap mt-3">
        <div class="lc-readiness-bar-track">
          <div class="lc-readiness-bar-fill lc-readiness-bar-fill--info" style="width:${pct}%"></div>
        </div>
        <span class="lc-readiness-label">${pct}% of timeline</span>
      </div>
      <div class="lc-candidate-meta mt-2">
        <span>${done}/${objs.length} objectives done</span>
        ${overdue ? `<span class="text-risk">${overdue} overdue</span>` : ""}
        <span>${(p.stakeholders||[]).length} stakeholders</span>
        <span>${(p.wins||[]).length} wins</span>
      </div>
      <div class="lc-hstack gap-2 mt-3">
        <div class="lc-phase-strip">
          ${PHASES.map(ph => {
            const prog = phaseProgress(p, ph);
            const isCurrent = ph === phase && !archived;
            return `<div class="lc-phase-pip${isCurrent?" is-current":""}">
              <span class="lc-phase-pip-label">${ph}d</span>
              <div class="lc-phase-pip-track"><div class="lc-phase-pip-fill" style="width:${prog}%"></div></div>
              <span class="lc-phase-pip-pct">${prog}%</span>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>`;
  }

  /* ── PLAN FORM ───────────────────────────────────────────────────── */
  function renderPlanForm(plan) {
    const isNew = !plan;
    const todayStr = new Date().toISOString().slice(0,10);
    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Back</button>
        <h2 class="lc-page-title">${isNew?"New 90-Day Plan":"Edit Plan Settings"}</h2>
      </div>
      <div id="nd-flash"></div>
      <div class="lc-card" style="max-width:640px">
        <div class="lc-form-grid">
          <div class="lc-field" style="grid-column:span 2">
            <label class="lc-label">Plan Title *</label>
            <input class="lc-input" id="nd-title" value="${esc(plan?.title||"")}" placeholder="e.g. Engineering Manager Onboarding">
          </div>
          <div class="lc-field">
            <label class="lc-label">Role / Position</label>
            <input class="lc-input" id="nd-role" value="${esc(plan?.role||"")}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Department</label>
            <input class="lc-input" id="nd-dept" value="${esc(plan?.department||"")}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Start Date *</label>
            <input class="lc-input" type="date" id="nd-start" value="${plan?.startDate?.slice(0,10)||todayStr}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Hiring Manager</label>
            <input class="lc-input" id="nd-mgr" value="${esc(plan?.hiringManagerName||"")}">
          </div>
        </div>
        ${isNew ? `
        <div class="lc-alert lc-alert--info mt-4">
          <strong>Starter objectives</strong> will be generated for all 3 phases based on best-practice leadership frameworks. You can edit or remove them after creation.
        </div>` : ""}
        <div class="lc-hstack gap-2 mt-4">
          <button class="lc-btn lc-btn--ghost" data-act="back">Cancel</button>
          <button class="lc-btn lc-btn--primary" data-act="save-plan" data-id="${plan?.id||"__new__"}">
            ${isNew?"Create Plan":"Save Settings"}
          </button>
        </div>
      </div>
    `;
  }

  /* ── PLAN DETAIL VIEW ────────────────────────────────────────────── */
  function renderPlanView() {
    const plan = activePlan();
    if (!plan) { activeView = "home"; render(); return; }
    const d     = daysElapsed(plan);
    const phase = currentPhase(plan);
    const h     = getNinetyDayHealth();
    const pctTimeline = Math.min(100, Math.round(d/90*100));

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← All Plans</button>
        <div>
          <h2 class="lc-page-title">${esc(plan.title)}</h2>
          <p class="lc-page-sub">${plan.role||""}${plan.department?" · "+plan.department:""}</p>
        </div>
        <div class="lc-hstack gap-2">
          <button class="lc-btn lc-btn--ghost" data-act="edit-plan">Settings</button>
          <button class="lc-btn lc-btn--ghost lc-btn--danger" data-act="archive-plan">Archive</button>
        </div>
      </div>

      <div class="nd-timeline-header">
        <div class="nd-day-badge">Day ${Math.min(d,90)}</div>
        <div class="nd-timeline-track-wrap">
          <div class="nd-timeline-track">
            <div class="nd-timeline-fill" style="width:${pctTimeline}%"></div>
            ${PHASES.map(ph => {
              const pct = ph==="30"?33.33:ph==="60"?66.66:100;
              const done = phaseProgress(plan, ph);
              return `<div class="nd-phase-marker" style="left:${pct}%" title="${PHASE_LABELS[ph]}: ${done}%">
                <span class="nd-phase-label">${ph}d</span>
              </div>`;
            }).join("")}
          </div>
          <div class="nd-phase-cards">
            ${PHASES.map(ph => {
              const prog = phaseProgress(plan, ph);
              const isCur = ph === phase;
              return `<div class="nd-phase-card${isCur?" is-current":""}">
                <div class="nd-phase-card-title">${PHASE_LABELS[ph]}</div>
                <div class="nd-phase-card-focus">${PHASE_FOCUS[ph]}</div>
                <div class="lc-readiness-bar-wrap mt-2">
                  <div class="lc-readiness-bar-track">
                    <div class="lc-readiness-bar-fill lc-readiness-bar-fill--${prog===100?"ok":isCur?"info":"muted"}" style="width:${prog}%"></div>
                  </div>
                  <span class="lc-readiness-label">${prog}%</span>
                </div>
              </div>`;
            }).join("")}
          </div>
        </div>
        <div class="nd-kpi-strip">
          <div class="lc-kpi-card"><span class="lc-kpi-value">${h.daysRemaining}</span><span class="lc-kpi-label">Days Left</span></div>
          <div class="lc-kpi-card"><span class="lc-kpi-value">${h.completedRate}%</span><span class="lc-kpi-label">Complete</span></div>
          <div class="lc-kpi-card"><span class="lc-kpi-value${h.overdueCount>0?" text-risk":""}">${h.overdueCount}</span><span class="lc-kpi-label">Overdue</span></div>
          <div class="lc-kpi-card"><span class="lc-kpi-value">${(plan.wins||[]).length}</span><span class="lc-kpi-label">Wins</span></div>
        </div>
      </div>

      <div class="lc-tabs mb-4">
        ${[["objectives","Objectives"],["stakeholders","Stakeholders"],["learnings","Learnings"],["wins","Wins"],["blockers","Blockers"]].map(([id,lbl])=>`
          <button class="lc-tab${activeSection===id?" is-active":""}" data-act="section" data-section="${id}">${lbl}</button>
        `).join("")}
      </div>
      <div id="nd-section-body">${renderSection(plan)}</div>
    `;
  }

  function renderSection(plan) {
    if (activeSection === "objectives")   return objectivesHtml(plan);
    if (activeSection === "stakeholders") return stakeholdersHtml(plan);
    if (activeSection === "learnings")    return learningsHtml(plan);
    if (activeSection === "wins")         return winsHtml(plan);
    if (activeSection === "blockers")     return blockersHtml(plan);
    return "";
  }

  /* ── OBJECTIVES ──────────────────────────────────────────────────── */
  function objectivesHtml(plan) {
    const today = new Date().toISOString().slice(0,10);
    let objs = (plan.objectives||[]);
    if (activePhase !== "all") objs = objs.filter(o => o.phase === activePhase);
    if (filterStatus !== "all") objs = objs.filter(o => o.status === filterStatus);
    if (filterCat !== "all") objs = objs.filter(o => o.category === filterCat);

    return `
    <div class="lc-hstack mb-3 gap-2 flex-wrap">
      <div class="lc-tabs lc-tabs--sm">
        <button class="lc-tab${activePhase==="all"?" is-active":""}" data-act="phase" data-phase="all">All</button>
        ${PHASES.map(ph=>`<button class="lc-tab${activePhase===ph?" is-active":""}" data-act="phase" data-phase="${ph}">${ph}d</button>`).join("")}
      </div>
      <select class="lc-select lc-select--sm" data-act="filter-status">
        <option value="all">All Status</option>
        ${STATUSES.map(s=>`<option value="${s}"${filterStatus===s?" selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
      </select>
      <select class="lc-select lc-select--sm" data-act="filter-cat">
        <option value="all">All Categories</option>
        ${CATEGORIES.map(c=>`<option value="${c}"${filterCat===c?" selected":""}>${c}</option>`).join("")}
      </select>
      <button class="lc-btn lc-btn--primary lc-btn--sm ml-auto" data-act="add-objective">+ Add Objective</button>
    </div>
    ${objs.length === 0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">🎯</div><p>No objectives for this filter.</p></div>` : `
      <div class="nd-objective-list">
        ${objs.map((o, idx) => objectiveRowHtml(o, idx, today, plan)).join("")}
      </div>
    `}`;
  }

  function objectiveRowHtml(o, idx, today, plan) {
    // find real index in full array
    const realIdx = (plan.objectives||[]).findIndex(x => x.id === o.id);
    const isOverdue = o.status !== "completed" && o.dueDate && o.dueDate < today;
    const sc = STATUS_CLASS[o.status];
    return `
    <div class="nd-obj-row lc-card mb-2">
      <div class="lc-hstack">
        <input type="checkbox" class="lc-checkbox" data-act="toggle-obj" data-idx="${realIdx}" ${o.status==="completed"?"checked":""} title="Mark complete">
        <div class="nd-obj-main">
          <div class="nd-obj-title${o.status==="completed"?" text-muted line-through":""}">${esc(o.title)}</div>
          ${o.description ? `<div class="text-muted text-sm">${esc(o.description)}</div>` : ""}
          <div class="lc-hstack gap-2 mt-1 flex-wrap">
            <span class="lc-badge lc-badge--${sc} lc-badge--sm">${STATUS_LABELS[o.status]}</span>
            <span class="lc-badge lc-badge--sm">${o.phase}d</span>
            ${o.category ? `<span class="lc-tag lc-tag--sm">${o.category}</span>` : ""}
            ${o.dueDate ? `<span class="text-sm${isOverdue?" text-risk":""}">${isOverdue?"⚠ ":""}Due ${o.dueDate}</span>` : ""}
          </div>
          ${(o.successCriteria||[]).length ? `<ul class="nd-criteria-list">${o.successCriteria.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="lc-hstack gap-1 ml-auto">
          <select class="lc-select lc-select--sm" data-act="obj-status" data-idx="${realIdx}" style="width:130px">
            ${STATUSES.map(s=>`<option value="${s}"${o.status===s?" selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
          </select>
          <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-objective" data-idx="${realIdx}">Edit</button>
          <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-objective" data-idx="${realIdx}">×</button>
        </div>
      </div>
    </div>`;
  }

  /* ── STAKEHOLDERS ────────────────────────────────────────────────── */
  function stakeholdersHtml(plan) {
    const stks = plan.stakeholders || [];
    return `
    <div class="lc-hstack mb-3">
      <h3 class="lc-card-title mb-0">Key Stakeholders (${stks.length})</h3>
      <button class="lc-btn lc-btn--primary lc-btn--sm ml-auto" data-act="add-stakeholder">+ Add</button>
    </div>
    ${stks.length===0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">🤝</div><p>Map stakeholders to build relationships faster.</p></div>` : `
      <table class="lc-table">
        <thead><tr><th>Name</th><th>Role</th><th>Meeting Date</th><th>Action</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          ${stks.map((s,i) => `
            <tr>
              <td>${esc(s.name)}</td>
              <td>${esc(s.role||"")}</td>
              <td>${s.meetingDate||"—"}</td>
              <td>${esc(s.action||"")}</td>
              <td>${esc(s.notes||"")}</td>
              <td>
                <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-stakeholder" data-idx="${i}">Edit</button>
                <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-stakeholder" data-idx="${i}">×</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}`;
  }

  /* ── LEARNINGS ───────────────────────────────────────────────────── */
  function learningsHtml(plan) {
    const items = (plan.keyLearnings||[]).sort((a,b) => b.date.localeCompare(a.date));
    return `
    <div class="lc-hstack mb-3">
      <h3 class="lc-card-title mb-0">Key Learnings (${items.length})</h3>
      <button class="lc-btn lc-btn--primary lc-btn--sm ml-auto" data-act="add-learning">+ Capture Learning</button>
    </div>
    ${items.length===0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">💡</div><p>Capture insights, observations, and lessons as you go.</p></div>` : `
      <div class="nd-learning-list">
        ${items.map((l,i) => `
          <div class="lc-card nd-learning-card mb-2">
            <div class="lc-hstack">
              <div>
                <div class="nd-obj-title">${esc(l.insight)}</div>
                <div class="text-muted text-sm mt-1">${l.topic ? `[${esc(l.topic)}] · ` : ""}${l.source ? esc(l.source) + " · " : ""}${l.date}</div>
              </div>
              <div class="lc-hstack gap-1 ml-auto">
                <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-learning" data-idx="${i}">Edit</button>
                <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-learning" data-idx="${i}">×</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}`;
  }

  /* ── WINS ────────────────────────────────────────────────────────── */
  function winsHtml(plan) {
    const items = (plan.wins||[]).sort((a,b) => b.date.localeCompare(a.date));
    return `
    <div class="lc-hstack mb-3">
      <h3 class="lc-card-title mb-0">Wins & Milestones (${items.length})</h3>
      <button class="lc-btn lc-btn--primary lc-btn--sm ml-auto" data-act="add-win">+ Log Win</button>
    </div>
    ${items.length===0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">🏆</div><p>Celebrate progress — log your wins here.</p></div>` : `
      <div class="nd-win-list">
        ${items.map((w,i) => `
          <div class="lc-card nd-win-card mb-2">
            <div class="lc-hstack">
              <div class="nd-win-icon">🏆</div>
              <div>
                <div class="nd-obj-title">${esc(w.description)}</div>
                ${w.impact ? `<div class="text-muted text-sm">${esc(w.impact)}</div>` : ""}
                <div class="text-muted text-sm">${w.date}</div>
              </div>
              <div class="lc-hstack gap-1 ml-auto">
                <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-win" data-idx="${i}">Edit</button>
                <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-win" data-idx="${i}">×</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}`;
  }

  /* ── BLOCKERS ────────────────────────────────────────────────────── */
  function blockersHtml(plan) {
    const items = (plan.blockers||[]);
    return `
    <div class="lc-hstack mb-3">
      <h3 class="lc-card-title mb-0">Blockers & Risks (${items.filter(b=>b.status!=="resolved").length} open)</h3>
      <button class="lc-btn lc-btn--primary lc-btn--sm ml-auto" data-act="add-blocker">+ Add Blocker</button>
    </div>
    ${items.length===0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">🚧</div><p>Track blockers and risks that need resolution.</p></div>` : `
      <div>
        ${items.map((b,i) => `
          <div class="lc-card mb-2">
            <div class="lc-hstack">
              <div>
                <span class="lc-badge lc-badge--${b.status==="resolved"?"ok":b.status==="in_progress"?"warn":"risk"} mr-2">${b.status}</span>
                <strong>${esc(b.description)}</strong>
                ${b.resolution ? `<div class="text-muted text-sm mt-1">Resolution: ${esc(b.resolution)}</div>` : ""}
                <div class="text-muted text-sm">${b.date}</div>
              </div>
              <div class="lc-hstack gap-1 ml-auto">
                ${b.status!=="resolved" ? `<button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="resolve-blocker" data-idx="${i}">Resolve</button>` : ""}
                <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger" data-act="delete-blocker" data-idx="${i}">×</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}`;
  }

  /* ── MODAL HELPERS ───────────────────────────────────────────────── */
  function showModal(html, onSave) {
    const backdrop = document.createElement("div");
    backdrop.className = "lc-modal-backdrop";
    backdrop.innerHTML = `<div class="lc-modal"><div class="lc-modal-body">${html}</div></div>`;
    document.body.appendChild(backdrop);
    backdrop.querySelector("[data-act='modal-close']")?.addEventListener("click", () => backdrop.remove());
    backdrop.querySelector("[data-act='modal-save']")?.addEventListener("click", () => {
      const ok = onSave(backdrop);
      if (ok) backdrop.remove();
    });
    backdrop.addEventListener("click", e => { if (e.target === backdrop) backdrop.remove(); });
  }

  function objectiveModalHtml(o={}) {
    return `
    <h3 class="lc-modal-title">${o.id?"Edit Objective":"Add Objective"}</h3>
    <div class="lc-form-grid">
      <div class="lc-field" style="grid-column:span 2">
        <label class="lc-label">Title *</label>
        <input class="lc-input" id="mo-title" value="${esc(o.title||"")}">
      </div>
      <div class="lc-field" style="grid-column:span 2">
        <label class="lc-label">Description</label>
        <textarea class="lc-textarea" id="mo-desc" rows="2">${esc(o.description||"")}</textarea>
      </div>
      <div class="lc-field">
        <label class="lc-label">Phase</label>
        <select class="lc-select" id="mo-phase">
          ${PHASES.map(ph=>`<option value="${ph}"${o.phase===ph?" selected":""}>${PHASE_LABELS[ph]}</option>`).join("")}
        </select>
      </div>
      <div class="lc-field">
        <label class="lc-label">Category</label>
        <select class="lc-select" id="mo-cat">
          <option value="">— None —</option>
          ${CATEGORIES.map(c=>`<option value="${c}"${o.category===c?" selected":""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="lc-field">
        <label class="lc-label">Due Date</label>
        <input class="lc-input" type="date" id="mo-due" value="${o.dueDate||""}">
      </div>
      <div class="lc-field">
        <label class="lc-label">Status</label>
        <select class="lc-select" id="mo-status">
          ${STATUSES.map(s=>`<option value="${s}"${o.status===s?" selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
        </select>
      </div>
      <div class="lc-field" style="grid-column:span 2">
        <label class="lc-label">Success Criteria (one per line)</label>
        <textarea class="lc-textarea" id="mo-criteria" rows="3">${(o.successCriteria||[]).join("\n")}</textarea>
      </div>
      <div class="lc-field" style="grid-column:span 2">
        <label class="lc-label">Notes</label>
        <textarea class="lc-textarea" id="mo-notes" rows="2">${esc(o.notes||"")}</textarea>
      </div>
    </div>
    <div class="lc-hstack gap-2 mt-4">
      <button class="lc-btn lc-btn--ghost" data-act="modal-close">Cancel</button>
      <button class="lc-btn lc-btn--primary ml-auto" data-act="modal-save">Save</button>
    </div>`;
  }

  function stakeholderModalHtml(s={}) {
    return `
    <h3 class="lc-modal-title">${s.name?"Edit Stakeholder":"Add Stakeholder"}</h3>
    <div class="lc-form-grid">
      <div class="lc-field"><label class="lc-label">Name *</label><input class="lc-input" id="ms-name" value="${esc(s.name||"")}"></div>
      <div class="lc-field"><label class="lc-label">Role / Title</label><input class="lc-input" id="ms-role" value="${esc(s.role||"")}"></div>
      <div class="lc-field"><label class="lc-label">First Meeting Date</label><input class="lc-input" type="date" id="ms-date" value="${s.meetingDate||""}"></div>
      <div class="lc-field"><label class="lc-label">Action / Next Step</label><input class="lc-input" id="ms-action" value="${esc(s.action||"")}"></div>
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Notes</label><textarea class="lc-textarea" id="ms-notes" rows="2">${esc(s.notes||"")}</textarea></div>
    </div>
    <div class="lc-hstack gap-2 mt-4">
      <button class="lc-btn lc-btn--ghost" data-act="modal-close">Cancel</button>
      <button class="lc-btn lc-btn--primary ml-auto" data-act="modal-save">Save</button>
    </div>`;
  }

  function learningModalHtml(l={}) {
    const today = new Date().toISOString().slice(0,10);
    return `
    <h3 class="lc-modal-title">${l.insight?"Edit Learning":"Capture Learning"}</h3>
    <div class="lc-form-grid">
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Insight *</label><textarea class="lc-textarea" id="ml-insight" rows="3">${esc(l.insight||"")}</textarea></div>
      <div class="lc-field"><label class="lc-label">Topic</label><input class="lc-input" id="ml-topic" value="${esc(l.topic||"")}"></div>
      <div class="lc-field"><label class="lc-label">Source</label><input class="lc-input" id="ml-source" value="${esc(l.source||"")}" placeholder="Person, meeting, doc…"></div>
      <div class="lc-field"><label class="lc-label">Date</label><input class="lc-input" type="date" id="ml-date" value="${l.date||today}"></div>
    </div>
    <div class="lc-hstack gap-2 mt-4">
      <button class="lc-btn lc-btn--ghost" data-act="modal-close">Cancel</button>
      <button class="lc-btn lc-btn--primary ml-auto" data-act="modal-save">Save</button>
    </div>`;
  }

  function winModalHtml(w={}) {
    const today = new Date().toISOString().slice(0,10);
    return `
    <h3 class="lc-modal-title">${w.description?"Edit Win":"Log a Win"}</h3>
    <div class="lc-form-grid">
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Description *</label><textarea class="lc-textarea" id="mw-desc" rows="2">${esc(w.description||"")}</textarea></div>
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Impact / Why It Matters</label><input class="lc-input" id="mw-impact" value="${esc(w.impact||"")}"></div>
      <div class="lc-field"><label class="lc-label">Date</label><input class="lc-input" type="date" id="mw-date" value="${w.date||today}"></div>
    </div>
    <div class="lc-hstack gap-2 mt-4">
      <button class="lc-btn lc-btn--ghost" data-act="modal-close">Cancel</button>
      <button class="lc-btn lc-btn--primary ml-auto" data-act="modal-save">Save</button>
    </div>`;
  }

  function blockerModalHtml(b={}) {
    const today = new Date().toISOString().slice(0,10);
    return `
    <h3 class="lc-modal-title">${b.description?"Edit Blocker":"Add Blocker"}</h3>
    <div class="lc-form-grid">
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Description *</label><textarea class="lc-textarea" id="mb-desc" rows="2">${esc(b.description||"")}</textarea></div>
      <div class="lc-field"><label class="lc-label">Status</label>
        <select class="lc-select" id="mb-status">
          ${BLOCKER_STATUSES.map(s=>`<option value="${s}"${b.status===s?" selected":""}>${s.replace("_"," ")}</option>`).join("")}
        </select>
      </div>
      <div class="lc-field"><label class="lc-label">Date</label><input class="lc-input" type="date" id="mb-date" value="${b.date||today}"></div>
      <div class="lc-field" style="grid-column:span 2"><label class="lc-label">Resolution (if any)</label><input class="lc-input" id="mb-resolution" value="${esc(b.resolution||"")}"></div>
    </div>
    <div class="lc-hstack gap-2 mt-4">
      <button class="lc-btn lc-btn--ghost" data-act="modal-close">Cancel</button>
      <button class="lc-btn lc-btn--primary ml-auto" data-act="modal-save">Save</button>
    </div>`;
  }

  /* ── event handling ──────────────────────────────────────────────── */
  function handleEvent(e) {
    const el  = e.target;
    const act = el.closest("[data-act]")?.dataset?.act;
    if (!act) return;
    const idx = parseInt(el.closest("[data-idx]")?.dataset?.idx ?? el.dataset?.idx, 10);

    if (act === "new-plan")    { activeView = "new_plan"; render(); return; }
    if (act === "open-plan")   {
      activePlanId = el.closest("[data-id]")?.dataset?.id || el.dataset?.id;
      activeView = "plan"; activeSection = "objectives"; render(); return;
    }
    if (act === "back")        { activeView = "home"; activePlanId = null; render(); return; }
    if (act === "edit-plan")   { activeView = "edit_plan"; render(); return; }
    if (act === "archive-plan"){ archivePlan(); return; }
    if (act === "save-plan")   {
      const id = el.dataset?.id || el.closest("[data-id]")?.dataset?.id;
      savePlan(id); return;
    }
    if (act === "section")     { activeSection = el.dataset.section; renderPlanView(); return; }
    if (act === "phase")       { activePhase = el.dataset.phase; renderPlanView(); return; }
    if (act === "filter-status"){ filterStatus = el.value; renderPlanView(); return; }
    if (act === "filter-cat")  { filterCat    = el.value; renderPlanView(); return; }

    // Objectives
    if (act === "add-objective") {
      showModal(objectiveModalHtml(), bk => saveObjective(bk, -1)); return;
    }
    if (act === "edit-objective") {
      const plan = activePlan();
      const o = (plan.objectives||[])[idx];
      if (o) showModal(objectiveModalHtml(o), bk => saveObjective(bk, idx)); return;
    }
    if (act === "delete-objective") { deleteListItem("objectives", idx); return; }
    if (act === "toggle-obj") {
      const plan = activePlan();
      const o = (plan.objectives||[])[idx];
      if (o) { o.status = el.checked ? "completed" : "in_progress"; updatePlan(plan); }
      return;
    }
    if (act === "obj-status") {
      const plan = activePlan();
      const o = (plan.objectives||[])[idx];
      if (o) { o.status = el.value; updatePlan(plan); }
      return;
    }

    // Stakeholders
    if (act === "add-stakeholder") {
      showModal(stakeholderModalHtml(), bk => saveStakeholder(bk, -1)); return;
    }
    if (act === "edit-stakeholder") {
      const plan = activePlan();
      const s = (plan.stakeholders||[])[idx];
      if (s) showModal(stakeholderModalHtml(s), bk => saveStakeholder(bk, idx)); return;
    }
    if (act === "delete-stakeholder") { deleteListItem("stakeholders", idx); return; }

    // Learnings
    if (act === "add-learning") {
      showModal(learningModalHtml(), bk => saveLearning(bk, -1)); return;
    }
    if (act === "edit-learning") {
      const plan = activePlan();
      const l = (plan.keyLearnings||[])[idx];
      if (l) showModal(learningModalHtml(l), bk => saveLearning(bk, idx)); return;
    }
    if (act === "delete-learning") { deleteListItem("keyLearnings", idx); return; }

    // Wins
    if (act === "add-win") {
      showModal(winModalHtml(), bk => saveWin(bk, -1)); return;
    }
    if (act === "edit-win") {
      const plan = activePlan();
      const w = (plan.wins||[])[idx];
      if (w) showModal(winModalHtml(w), bk => saveWin(bk, idx)); return;
    }
    if (act === "delete-win") { deleteListItem("wins", idx); return; }

    // Blockers
    if (act === "add-blocker") {
      showModal(blockerModalHtml(), bk => saveBlocker(bk, -1)); return;
    }
    if (act === "resolve-blocker") {
      const plan = activePlan();
      if (plan && plan.blockers && plan.blockers[idx]) {
        plan.blockers[idx].status = "resolved";
        updatePlan(plan);
      }
      return;
    }
    if (act === "delete-blocker") { deleteListItem("blockers", idx); return; }
  }

  /* ── save helpers ────────────────────────────────────────────────── */
  function savePlan(id) {
    const title = container.querySelector("#nd-title")?.value?.trim();
    const start = container.querySelector("#nd-start")?.value;
    if (!title || !start) { flash("nd-flash","Title and start date required","warn"); return; }
    const isNew = id === "__new__";
    const now = new Date().toISOString();
    const plans = load();
    if (isNew) {
      const plan = {
        id: uid(), title, startDate: start,
        role: container.querySelector("#nd-role")?.value?.trim()||"",
        department: container.querySelector("#nd-dept")?.value?.trim()||"",
        hiringManagerName: container.querySelector("#nd-mgr")?.value?.trim()||"",
        objectives: starterObjectives(start),
        stakeholders:[], keyLearnings:[], wins:[], blockers:[],
        createdAt: now, updatedAt: now
      };
      plans.push(plan);
      save(plans);
      activePlanId = plan.id;
    } else {
      const idx = plans.findIndex(p => p.id === id);
      if (idx >= 0) {
        plans[idx].title = title;
        plans[idx].startDate = start;
        plans[idx].role = container.querySelector("#nd-role")?.value?.trim()||"";
        plans[idx].department = container.querySelector("#nd-dept")?.value?.trim()||"";
        plans[idx].hiringManagerName = container.querySelector("#nd-mgr")?.value?.trim()||"";
        plans[idx].updatedAt = now;
        save(plans);
      }
    }
    activeView = "plan"; activeSection = "objectives"; render();
  }

  function starterObjectives(startDate) {
    const s = new Date(startDate);
    const fmt = d => d.toISOString().slice(0,10);
    const add = (d, days) => { const r = new Date(d); r.setDate(r.getDate()+days); return r; };
    return [
      { id:objId(), phase:"30", category:"Relationships", title:"Meet all direct reports 1:1", description:"Schedule and hold initial 1:1 conversations", successCriteria:["Met every direct report","Documented their goals and concerns"], status:"not_started", dueDate:fmt(add(s,14)), notes:"" },
      { id:objId(), phase:"30", category:"Learning", title:"Review team processes and documentation", description:"Read existing SOPs, meeting notes, and project docs", successCriteria:["Reviewed core processes","Identified documentation gaps"], status:"not_started", dueDate:fmt(add(s,21)), notes:"" },
      { id:objId(), phase:"30", category:"Relationships", title:"Meet key stakeholders and partners", description:"Schedule intro conversations with cross-functional partners", successCriteria:["Met 5+ key stakeholders","Understood their priorities"], status:"not_started", dueDate:fmt(add(s,30)), notes:"" },
      { id:objId(), phase:"60", category:"Delivery", title:"Identify top 3 team priorities for the quarter", description:"Based on listening tour and business goals", successCriteria:["Priorities aligned with leadership","Communicated to team"], status:"not_started", dueDate:fmt(add(s,45)), notes:"" },
      { id:objId(), phase:"60", category:"Team", title:"Assess team health and engagement", description:"Individual + aggregate view of engagement and performance", successCriteria:["Completed team health assessment","Identified 2+ improvement areas"], status:"not_started", dueDate:fmt(add(s,60)), notes:"" },
      { id:objId(), phase:"60", category:"Process", title:"Establish team rhythms and cadence", description:"Weekly standups, 1:1s, retrospectives", successCriteria:["Team meetings scheduled","Norms documented"], status:"not_started", dueDate:fmt(add(s,60)), notes:"" },
      { id:objId(), phase:"90", category:"Strategy", title:"Present 90-day retrospective and forward plan", description:"Synthesize learnings, wins, and 6-month roadmap", successCriteria:["Delivered to manager","Team alignment achieved"], status:"not_started", dueDate:fmt(add(s,90)), notes:"" },
      { id:objId(), phase:"90", category:"Delivery", title:"Demonstrate measurable impact in one area", description:"Ship a meaningful improvement or outcome", successCriteria:["Outcome shipped","Impact quantified"], status:"not_started", dueDate:fmt(add(s,90)), notes:"" },
    ];
  }

  function updatePlan(plan) {
    const plans = load();
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) { plan.updatedAt = new Date().toISOString(); plans[idx] = plan; save(plans); }
    // Re-render section body only
    const body = container.querySelector("#nd-section-body");
    if (body) body.innerHTML = renderSection(plan);
  }

  function deleteListItem(key, idx) {
    const plan = activePlan();
    if (!plan || !plan[key]) return;
    plan[key].splice(idx, 1);
    updatePlan(plan);
  }

  function saveObjective(bk, idx) {
    const title = bk.querySelector("#mo-title")?.value?.trim();
    if (!title) return false;
    const o = {
      id: idx >= 0 ? ((activePlan()?.objectives||[])[idx]?.id || objId()) : objId(),
      title, phase: bk.querySelector("#mo-phase")?.value||"30",
      category: bk.querySelector("#mo-cat")?.value||"",
      description: bk.querySelector("#mo-desc")?.value?.trim()||"",
      dueDate: bk.querySelector("#mo-due")?.value||"",
      status: bk.querySelector("#mo-status")?.value||"not_started",
      successCriteria: (bk.querySelector("#mo-criteria")?.value||"").split("\n").map(s=>s.trim()).filter(Boolean),
      notes: bk.querySelector("#mo-notes")?.value?.trim()||""
    };
    const plan = activePlan();
    if (!plan) return false;
    if (!plan.objectives) plan.objectives = [];
    if (idx >= 0 && idx < plan.objectives.length) plan.objectives[idx] = o;
    else plan.objectives.push(o);
    updatePlan(plan);
    return true;
  }

  function saveStakeholder(bk, idx) {
    const name = bk.querySelector("#ms-name")?.value?.trim();
    if (!name) return false;
    const s = { name, role: bk.querySelector("#ms-role")?.value?.trim()||"", meetingDate: bk.querySelector("#ms-date")?.value||"", action: bk.querySelector("#ms-action")?.value?.trim()||"", notes: bk.querySelector("#ms-notes")?.value?.trim()||"" };
    const plan = activePlan();
    if (!plan) return false;
    if (!plan.stakeholders) plan.stakeholders = [];
    if (idx >= 0 && idx < plan.stakeholders.length) plan.stakeholders[idx] = s;
    else plan.stakeholders.push(s);
    updatePlan(plan);
    return true;
  }

  function saveLearning(bk, idx) {
    const insight = bk.querySelector("#ml-insight")?.value?.trim();
    if (!insight) return false;
    const l = { insight, topic: bk.querySelector("#ml-topic")?.value?.trim()||"", source: bk.querySelector("#ml-source")?.value?.trim()||"", date: bk.querySelector("#ml-date")?.value || new Date().toISOString().slice(0,10) };
    const plan = activePlan();
    if (!plan) return false;
    if (!plan.keyLearnings) plan.keyLearnings = [];
    if (idx >= 0 && idx < plan.keyLearnings.length) plan.keyLearnings[idx] = l;
    else plan.keyLearnings.push(l);
    updatePlan(plan);
    return true;
  }

  function saveWin(bk, idx) {
    const description = bk.querySelector("#mw-desc")?.value?.trim();
    if (!description) return false;
    const w = { description, impact: bk.querySelector("#mw-impact")?.value?.trim()||"", date: bk.querySelector("#mw-date")?.value || new Date().toISOString().slice(0,10) };
    const plan = activePlan();
    if (!plan) return false;
    if (!plan.wins) plan.wins = [];
    if (idx >= 0 && idx < plan.wins.length) plan.wins[idx] = w;
    else plan.wins.push(w);
    updatePlan(plan);
    return true;
  }

  function saveBlocker(bk, idx) {
    const description = bk.querySelector("#mb-desc")?.value?.trim();
    if (!description) return false;
    const b = { description, status: bk.querySelector("#mb-status")?.value||"open", date: bk.querySelector("#mb-date")?.value || new Date().toISOString().slice(0,10), resolution: bk.querySelector("#mb-resolution")?.value?.trim()||"" };
    const plan = activePlan();
    if (!plan) return false;
    if (!plan.blockers) plan.blockers = [];
    if (idx >= 0 && idx < plan.blockers.length) plan.blockers[idx] = b;
    else plan.blockers.push(b);
    updatePlan(plan);
    return true;
  }

  function archivePlan() {
    if (!confirm("Archive this plan?")) return;
    const plans = load();
    const idx = plans.findIndex(p => p.id === activePlanId);
    if (idx >= 0) { plans[idx].archivedAt = new Date().toISOString(); save(plans); }
    activeView = "home"; activePlanId = null; render();
  }

  function flash(id, msg, type="ok") {
    const el = container.querySelector("#"+id);
    if (!el) return;
    el.innerHTML = `<div class="lc-alert lc-alert--${type} mb-3">${msg}</div>`;
    setTimeout(() => { if (el) el.innerHTML = ""; }, 2500);
  }

  function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* ── public API ──────────────────────────────────────────────────── */
  /* Home-screen card (ui.js ninetyDayHomeCard). Shown only inside the 90-day window. */
  function homeCardHtml() {
    const plan = activePlan();
    if (!plan || !plan.startDate) return "";
    const elapsed = daysElapsed(plan);
    if (elapsed < 0 || elapsed >= 90) return "";   // day 1 = elapsed 0
    const h = getNinetyDayHealth();
    const phase = currentPhase(plan);
    const overdueLine = h.overdueCount > 0
      ? `<div class="kpi-sub" style="color:var(--danger-text);margin-top:6px">${h.overdueCount} objective${h.overdueCount === 1 ? "" : "s"} overdue</div>` : "";
    return `<div class="card info-card" id="ninetyDayHomeCard" style="border-left:4px solid var(--brand-700);margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;align-items:center">
        <strong>Your First 90 Days</strong><span class="kpi-sub">${esc(PHASE_LABELS[phase])}</span>
      </div>
      <div class="kpi-sub" style="margin:4px 0 8px">Day ${elapsed + 1} of 90 · ${h.completedRate}% of objectives done${plan.role ? " · " + esc(plan.role) : ""}</div>
      <div style="font-size:18px;font-weight:600;line-height:1.4">${esc(PHASE_FOCUS[phase])}</div>
      ${overdueLine}
      <button type="button" class="btn btn-primary btn-sm" data-guide-nav="ninetyDay" style="margin-top:10px">Open the full plan →</button>
    </div>`;
  }

  const UI = {
    homeCardHtml,
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
        container.addEventListener("click",  handleEvent);
        container.addEventListener("change", handleEvent);
        container.dataset.lsxBound = "1";
      }
      render();
    },
    refresh() { render(); },
    getNinetyDayHealth
  };

  root.LCNinetyDayUI = UI;
  if (typeof module !== "undefined" && module.exports) module.exports = UI;

})(typeof window !== "undefined" ? window : globalThis);
