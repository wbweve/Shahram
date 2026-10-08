/* ============================================================================
   js/succession-pipeline-ui.js — SUCCESSION PIPELINE (deep rewrite)

   localStorage key: "lcSuccessionCandidates" — SuccessionCandidate[]
   {
     id, name, currentRole, targetRole, targetLevel,
     readinessScore (0-100, computed), manualReadiness (null|0-100),
     developmentAreas: string[],
     developmentPlan: { goal, actions: string[], targetDate, status }[],
     strengths: string[],
     flightRisk: "low"|"medium"|"high",
     flightRiskNotes: string,
     timelineMonths: number,          // months until ready
     positionId: string|null,         // which open/at-risk position they cover
     memberId: string|null,           // link to teamMembers
     sponsorName: string,
     notes: string,
     lastReview: ISO string,
     createdAt: ISO string,
     updatedAt: ISO string
   }

   localStorage key: "lcSuccessionPositions" — SuccessionPosition[]
   {
     id, title, level, department, riskLevel: "low"|"medium"|"high"|"critical",
     incumbentName, incumbentId, retirementRisk, coverageCount (computed),
     notes, createdAt
   }

   Health export: window.LCSuccessionPipelineUI.getSuccessionHealth()
   → { criticalGaps: number, flightRisks: number, positions: [], candidates: [] }

   Cross-wiring:
   - member detail panel links here via lc:pendingSuccessionMemberId
   - daily brief consumes getSuccessionHealth()
   ============================================================================ */

(function (root) {
  "use strict";

  /* ── constants ─────────────────────────────────────────────────── */
  const KEY_CANDIDATES = "lcSuccessionCandidates";
  const KEY_POSITIONS  = "lcSuccessionPositions";

  const READINESS_LABELS = { 0:"Not Ready", 25:"Early Stage", 50:"Developing", 75:"Almost Ready", 100:"Ready Now" };
  const RISK_COLORS = { low:"ok", medium:"warn", high:"risk", critical:"risk" };
  const TARGET_LEVELS = ["Team Lead","Senior Individual Contributor","Manager","Senior Manager","Director","Senior Director","VP","SVP","C-Suite"];
  const FLIGHT_OPTS = [["low","Low"],["medium","Medium"],["high","High"]];
  const PLAN_STATUSES = ["not_started","in_progress","completed","paused"];
  const PLAN_STATUS_LABELS = { not_started:"Not Started", in_progress:"In Progress", completed:"Completed", paused:"Paused" };

  /* ── state ──────────────────────────────────────────────────────── */
  let activeView    = "pipeline";   // "pipeline" | "positions" | "candidate" | "position_detail"
  let activeTab     = "candidates"; // within pipeline: "candidates" | "analytics"
  let selectedId    = null;
  let editingId     = null;
  let editingPosId  = null;
  let filterFlight  = "all";
  let filterReady   = "all";
  let searchQ       = "";
  let container     = null;

  /* ── storage helpers ─────────────────────────────────────────────── */
  function core() { return root.LCLSCore || null; }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  }
  function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  function candidates() { return load(KEY_CANDIDATES); }
  function positions()  { return load(KEY_POSITIONS); }
  // Team members live in LCLSCore ("teamMembers"); there is no "leadershipTeamMembers" store.
  function members() {
    const c = core();
    if (c && typeof c.members === "function") { try { return c.members() || []; } catch (_e) { return []; } }
    return load("teamMembers");
  }

  function uid() { return "sc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function posUid() { return "pos_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ── readiness scoring ───────────────────────────────────────────── */
  function computeReadiness(c) {
    if (c.manualReadiness !== null && c.manualReadiness !== undefined) return c.manualReadiness;
    let score = 0;
    // Development plan progress
    const plans = c.developmentPlan || [];
    if (plans.length > 0) {
      const done = plans.filter(p => p.status === "completed").length;
      score += Math.round((done / plans.length) * 40);
    }
    // Timeline factor (shorter = more ready)
    const months = c.timelineMonths || 24;
    if (months <= 3)       score += 30;
    else if (months <= 6)  score += 22;
    else if (months <= 12) score += 14;
    else if (months <= 18) score += 6;
    // Strengths defined
    score += Math.min((c.strengths || []).length * 5, 15);
    // Development areas addressed
    const devAreas = (c.developmentAreas || []).length;
    if (devAreas === 0) score += 10;
    else score += Math.max(0, 10 - devAreas * 2);
    // Recent review
    if (c.lastReview) {
      const daysSince = (Date.now() - new Date(c.lastReview)) / 86400000;
      if (daysSince < 30)       score += 5;
      else if (daysSince > 180) score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  }

  function readinessLabel(score) {
    if (score >= 85) return "Ready Now";
    if (score >= 65) return "Almost Ready";
    if (score >= 40) return "Developing";
    if (score >= 15) return "Early Stage";
    return "Not Ready";
  }

  function readinessClass(score) {
    if (score >= 85) return "ok";
    if (score >= 65) return "info";
    if (score >= 40) return "warn";
    return "risk";
  }

  /* ── health export ───────────────────────────────────────────────── */
  function getSuccessionHealth() {
    const cands = candidates();
    const pos   = positions();
    const flightRisks = cands.filter(c => c.flightRisk === "high").length;
    const criticalGaps = pos.filter(p => {
      const covers = cands.filter(c => c.positionId === p.id && computeReadiness(c) >= 65).length;
      return covers === 0 && p.riskLevel === "critical";
    }).length;
    const readyNow = cands.filter(c => computeReadiness(c) >= 85).length;
    const avgReadiness = cands.length
      ? Math.round(cands.reduce((s, c) => s + computeReadiness(c), 0) / cands.length)
      : 0;
    return { criticalGaps, flightRisks, readyNow, avgReadiness, candidateCount: cands.length, positionCount: pos.length };
  }

  /* ── render ──────────────────────────────────────────────────────── */
  function render() {
    if (!container) return;

    // Check for cross-module pending member link
    const pendingMemberId = localStorage.getItem("lc:pendingSuccessionMemberId");
    // Only consume the link when rendering into the live DOM, not the detached viewHtml() pass.
    if (pendingMemberId && container.isConnected) {
      localStorage.removeItem("lc:pendingSuccessionMemberId");
      // pre-fill a new candidate form linked to that member
      const mems = members();
      const mem = mems.find(m => m.id === pendingMemberId);
      if (mem) {
        editingId = "__new__";
        activeView = "candidate";
        // store pending so the form can read it
        container._pendingMember = mem;
      }
    }

    if (activeView === "candidate") { renderCandidateForm(); return; }
    if (activeView === "position_detail") { renderPositionForm(); return; }
    renderPipelineView();
  }

  /* ── PIPELINE VIEW ───────────────────────────────────────────────── */
  function renderPipelineView() {
    const cands = candidates();
    const pos   = positions();
    const health = getSuccessionHealth();

    container.innerHTML = `
      <div class="lc-page-header">
        <div>
          <h2 class="lc-page-title">Succession Pipeline</h2>
          <p class="lc-page-sub">Bench strength, readiness scores, and development plans</p>
        </div>
        <div class="lc-hstack gap-2">
          <button class="lc-btn lc-btn--ghost" data-act="manage-positions">Manage Positions</button>
          <button class="lc-btn lc-btn--primary" data-act="add-candidate">+ Add Candidate</button>
        </div>
      </div>

      ${kpiStripHtml(health)}

      <div class="lc-tabs mb-4">
        <button class="lc-tab${activeTab==="candidates"?" is-active":""}" data-act="tab" data-tab="candidates">Candidates</button>
        <button class="lc-tab${activeTab==="analytics"?" is-active":""}" data-act="tab" data-tab="analytics">Analytics</button>
      </div>

      ${activeTab === "analytics" ? analyticsHtml(cands, pos) : candidatesTabHtml(cands, pos)}
    `;
  }

  function kpiStripHtml(h) {
    return `
    <div class="lc-kpi-grid mb-6">
      <div class="lc-kpi-card">
        <span class="lc-kpi-value">${h.candidateCount}</span>
        <span class="lc-kpi-label">Candidates</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value text-ok">${h.readyNow}</span>
        <span class="lc-kpi-label">Ready Now</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value${h.flightRisks > 0 ? " text-risk" : ""}">${h.flightRisks}</span>
        <span class="lc-kpi-label">Flight Risks</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value${h.criticalGaps > 0 ? " text-risk" : ""}">${h.criticalGaps}</span>
        <span class="lc-kpi-label">Critical Gaps</span>
      </div>
      <div class="lc-kpi-card">
        <span class="lc-kpi-value">${h.avgReadiness}%</span>
        <span class="lc-kpi-label">Avg Readiness</span>
      </div>
    </div>`;
  }

  function candidatesTabHtml(cands, pos) {
    return `
      <div class="lc-filter-bar mb-4">
        <input class="lc-input lc-search-input" placeholder="Search candidates…" value="${searchQ}" data-act="search" style="max-width:260px">
        <select class="lc-select" data-act="filter-flight">
          <option value="all"${filterFlight==="all"?" selected":""}>All Flight Risk</option>
          <option value="high"${filterFlight==="high"?" selected":""}>High Risk</option>
          <option value="medium"${filterFlight==="medium"?" selected":""}>Medium Risk</option>
          <option value="low"${filterFlight==="low"?" selected":""}>Low Risk</option>
        </select>
        <select class="lc-select" data-act="filter-ready">
          <option value="all"${filterReady==="all"?" selected":""}>All Readiness</option>
          <option value="ready"${filterReady==="ready"?" selected":""}>Ready Now</option>
          <option value="almost"${filterReady==="almost"?" selected":""}>Almost Ready</option>
          <option value="developing"${filterReady==="developing"?" selected":""}>Developing</option>
          <option value="early"${filterReady==="early"?" selected":""}>Early Stage</option>
        </select>
      </div>
      ${candidateCardsHtml(cands, pos)}
    `;
  }

  function candidateCardsHtml(cands, pos) {
    let filtered = cands.filter(c => {
      const q = searchQ.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !(c.targetRole||"").toLowerCase().includes(q)) return false;
      if (filterFlight !== "all" && c.flightRisk !== filterFlight) return false;
      if (filterReady !== "all") {
        const score = computeReadiness(c);
        if (filterReady === "ready"     && score < 85)  return false;
        if (filterReady === "almost"    && (score < 65 || score >= 85)) return false;
        if (filterReady === "developing"&& (score < 40 || score >= 65)) return false;
        if (filterReady === "early"     && score >= 40) return false;
      }
      return true;
    });

    if (!filtered.length) return `<div class="lc-empty-state"><div class="lc-empty-icon">🏆</div><p>${cands.length ? "No candidates match filters" : "No candidates yet — add your first bench player"}</p></div>`;

    // Sort: readiness desc
    filtered.sort((a,b) => computeReadiness(b) - computeReadiness(a));

    return `<div class="lc-card-grid">
      ${filtered.map(c => candidateCardHtml(c, pos)).join("")}
    </div>`;
  }

  function candidateCardHtml(c, pos) {
    const score = computeReadiness(c);
    const cl    = readinessClass(score);
    const lbl   = readinessLabel(score);
    const covPos= pos.find(p => p.id === c.positionId);
    const plansDone = (c.developmentPlan||[]).filter(p=>p.status==="completed").length;
    const plansTotal= (c.developmentPlan||[]).length;
    const flightBadge = c.flightRisk === "high"
      ? `<span class="lc-badge lc-badge--risk">⚠ High Flight Risk</span>`
      : c.flightRisk === "medium"
      ? `<span class="lc-badge lc-badge--warn">Flight Risk</span>`
      : "";

    return `
    <div class="lc-card lc-candidate-card" data-act="open-candidate" data-id="${c.id}">
      <div class="lc-candidate-header">
        <div class="lc-avatar">${initials(c.name)}</div>
        <div>
          <div class="lc-candidate-name">${esc(c.name)}</div>
          <div class="lc-candidate-role">${esc(c.currentRole||"")}</div>
        </div>
        <div class="lc-hstack gap-1 ml-auto">
          ${flightBadge}
          <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="edit-candidate" data-id="${c.id}" onclick="event.stopPropagation()">Edit</button>
        </div>
      </div>
      <div class="lc-readiness-bar-wrap mt-3">
        <div class="lc-readiness-bar-track">
          <div class="lc-readiness-bar-fill lc-readiness-bar-fill--${cl}" style="width:${score}%"></div>
        </div>
        <span class="lc-readiness-label lc-readiness-label--${cl}">${score}% · ${lbl}</span>
      </div>
      <div class="lc-candidate-meta mt-3">
        <span>→ ${esc(c.targetRole||"Target TBD")}</span>
        ${covPos ? `<span>📌 ${esc(covPos.title)}</span>` : ""}
        ${plansTotal ? `<span>📋 ${plansDone}/${plansTotal} plans</span>` : ""}
        ${c.timelineMonths ? `<span>⏱ ${c.timelineMonths}mo timeline</span>` : ""}
      </div>
      ${(c.strengths||[]).length ? `<div class="lc-tag-row mt-2">${c.strengths.slice(0,3).map(s=>`<span class="lc-tag">${esc(s)}</span>`).join("")}</div>` : ""}
    </div>`;
  }

  /* ── ANALYTICS TAB ───────────────────────────────────────────────── */
  function analyticsHtml(cands, pos) {
    // Readiness distribution
    const dist = { "Ready Now":0, "Almost Ready":0, "Developing":0, "Early Stage":0, "Not Ready":0 };
    cands.forEach(c => { const lbl = readinessLabel(computeReadiness(c)); dist[lbl]++; });

    // Position coverage
    const coverage = pos.map(p => {
      const covers = cands.filter(c => c.positionId === p.id);
      return { pos: p, covers };
    });

    // Flight risk breakdown
    const fDist = { high: 0, medium: 0, low: 0 };
    cands.forEach(c => { fDist[c.flightRisk||"low"]++; });

    // Timeline distribution
    const timeDist = { "<6mo":0, "6-12mo":0, "12-18mo":0, "18-24mo":0, ">24mo":0 };
    cands.forEach(c => {
      const m = c.timelineMonths || 24;
      if (m < 6) timeDist["<6mo"]++;
      else if (m < 12) timeDist["6-12mo"]++;
      else if (m < 18) timeDist["12-18mo"]++;
      else if (m < 24) timeDist["18-24mo"]++;
      else timeDist[">24mo"]++;
    });

    return `
    <div class="lc-analytics-grid">
      <div class="lc-card">
        <h3 class="lc-card-title">Readiness Distribution</h3>
        ${Object.entries(dist).map(([lbl, cnt]) => `
          <div class="lc-dist-row">
            <span class="lc-dist-label">${lbl}</span>
            <div class="lc-dist-track"><div class="lc-dist-fill" style="width:${cands.length?Math.round(cnt/cands.length*100):0}%"></div></div>
            <span class="lc-dist-count">${cnt}</span>
          </div>
        `).join("")}
      </div>
      <div class="lc-card">
        <h3 class="lc-card-title">Timeline to Readiness</h3>
        ${Object.entries(timeDist).map(([lbl, cnt]) => `
          <div class="lc-dist-row">
            <span class="lc-dist-label">${lbl}</span>
            <div class="lc-dist-track"><div class="lc-dist-fill" style="width:${cands.length?Math.round(cnt/cands.length*100):0}%"></div></div>
            <span class="lc-dist-count">${cnt}</span>
          </div>
        `).join("")}
      </div>
      <div class="lc-card">
        <h3 class="lc-card-title">Flight Risk Breakdown</h3>
        <div class="lc-risk-matrix">
          ${["high","medium","low"].map(r => `
            <div class="lc-risk-row">
              <span class="lc-badge lc-badge--${RISK_COLORS[r]}">${r.charAt(0).toUpperCase()+r.slice(1)}</span>
              <span>${fDist[r]} candidate${fDist[r]!==1?"s":""}</span>
            </div>
          `).join("")}
        </div>
        ${fDist.high > 0 ? `
          <div class="lc-alert lc-alert--risk mt-3">
            ⚠ ${fDist.high} high-risk candidate${fDist.high>1?"s":""} may leave before ready.
          </div>` : ""}
      </div>
      <div class="lc-card" style="grid-column:span 2;">
        <h3 class="lc-card-title">Position Coverage Map</h3>
        ${coverage.length ? `
          <table class="lc-table">
            <thead><tr><th>Position</th><th>Risk Level</th><th>Incumbent</th><th>Candidates</th><th>Ready Now</th></tr></thead>
            <tbody>${coverage.map(({pos:p, covers}) => {
              const readyNow = covers.filter(c => computeReadiness(c) >= 85).length;
              return `<tr>
                <td>${esc(p.title)}</td>
                <td><span class="lc-badge lc-badge--${RISK_COLORS[p.riskLevel]}">${p.riskLevel}</span></td>
                <td>${esc(p.incumbentName||"—")}</td>
                <td>${covers.length}</td>
                <td class="${readyNow===0&&p.riskLevel==="critical"?"text-risk":""}">
                  ${readyNow===0?'<span class="lc-badge lc-badge--risk">Gap</span>':readyNow}
                </td>
              </tr>`;
            }).join("")}</tbody>
          </table>
        ` : `<p class="text-muted">No positions defined. <button class="lc-btn lc-btn--ghost lc-btn--sm" data-act="manage-positions">Manage Positions</button></p>`}
      </div>
    </div>`;
  }

  /* ── CANDIDATE DETAIL / FORM ─────────────────────────────────────── */
  function renderCandidateForm() {
    const isNew = editingId === "__new__";
    const cands = candidates();
    const pos   = positions();
    const mems  = members();

    let c = isNew
      ? { id:"__new__", name:"", currentRole:"", targetRole:"", targetLevel:"", developmentAreas:[], developmentPlan:[], strengths:[], flightRisk:"low", flightRiskNotes:"", timelineMonths:12, positionId:"", memberId:"", sponsorName:"", notes:"", manualReadiness:null, lastReview:"" }
      : cands.find(x => x.id === editingId) || {};

    // If coming from cross-module member link
    if (container._pendingMember && isNew) {
      const mem = container._pendingMember;
      c.name = mem.name;
      c.currentRole = mem.role || "";
      c.memberId = mem.id;
      delete container._pendingMember;
    }

    const planRows = (c.developmentPlan||[]).map((p,i) => devPlanRowHtml(p,i)).join("");

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Back</button>
        <h2 class="lc-page-title">${isNew?"New Candidate":esc(c.name)}</h2>
        ${!isNew ? `<button class="lc-btn lc-btn--ghost lc-btn--danger" data-act="delete-candidate" data-id="${c.id}">Delete</button>` : ""}
      </div>
      <div id="sp-flash"></div>
      <div class="lc-form-layout">
        <div class="lc-card">
          <h3 class="lc-card-title">Candidate Profile</h3>
          <div class="lc-form-grid">
            <div class="lc-field">
              <label class="lc-label">Full Name *</label>
              <input class="lc-input" id="sp-name" value="${esc(c.name||"")}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Team Member Link</label>
              <select class="lc-select" id="sp-member">
                <option value="">— None —</option>
                ${mems.map(m=>`<option value="${m.id}"${c.memberId===m.id?" selected":""}>${esc(m.name)}</option>`).join("")}
              </select>
            </div>
            <div class="lc-field">
              <label class="lc-label">Current Role *</label>
              <input class="lc-input" id="sp-current-role" value="${esc(c.currentRole||"")}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Target Role</label>
              <input class="lc-input" id="sp-target-role" value="${esc(c.targetRole||"")}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Target Level</label>
              <select class="lc-select" id="sp-target-level">
                <option value="">— Select —</option>
                ${TARGET_LEVELS.map(l=>`<option${c.targetLevel===l?" selected":""}>${l}</option>`).join("")}
              </select>
            </div>
            <div class="lc-field">
              <label class="lc-label">Succession Position</label>
              <select class="lc-select" id="sp-position">
                <option value="">— None —</option>
                ${pos.map(p=>`<option value="${p.id}"${c.positionId===p.id?" selected":""}>${esc(p.title)}</option>`).join("")}
              </select>
            </div>
            <div class="lc-field">
              <label class="lc-label">Timeline to Ready (months)</label>
              <input class="lc-input" type="number" id="sp-timeline" value="${c.timelineMonths||12}" min="1" max="60">
            </div>
            <div class="lc-field">
              <label class="lc-label">Sponsor / Champion</label>
              <input class="lc-input" id="sp-sponsor" value="${esc(c.sponsorName||"")}">
            </div>
            <div class="lc-field">
              <label class="lc-label">Manual Readiness Override (leave blank for auto)</label>
              <input class="lc-input" type="number" id="sp-manual-readiness" value="${c.manualReadiness??""}" placeholder="0–100" min="0" max="100">
            </div>
            <div class="lc-field">
              <label class="lc-label">Last Review Date</label>
              <input class="lc-input" type="date" id="sp-last-review" value="${c.lastReview?c.lastReview.slice(0,10):""}">
            </div>
          </div>
        </div>

        <div class="lc-card">
          <h3 class="lc-card-title">Flight Risk</h3>
          <div class="lc-form-grid">
            <div class="lc-field">
              <label class="lc-label">Flight Risk Level</label>
              <select class="lc-select" id="sp-flight">
                ${FLIGHT_OPTS.map(([v,l])=>`<option value="${v}"${c.flightRisk===v?" selected":""}>${l}</option>`).join("")}
              </select>
            </div>
            <div class="lc-field" style="grid-column:span 2">
              <label class="lc-label">Flight Risk Notes</label>
              <textarea class="lc-textarea" id="sp-flight-notes" rows="2">${esc(c.flightRiskNotes||"")}</textarea>
            </div>
          </div>
        </div>

        <div class="lc-card">
          <h3 class="lc-card-title">Strengths</h3>
          <div id="sp-strengths-wrap">
            ${tagEditorHtml("sp-strengths", c.strengths||[], "Add strength…")}
          </div>
        </div>

        <div class="lc-card">
          <h3 class="lc-card-title">Development Areas</h3>
          <div id="sp-dev-areas-wrap">
            ${tagEditorHtml("sp-dev-areas", c.developmentAreas||[], "Add area…")}
          </div>
        </div>

        <div class="lc-card" style="grid-column:span 2;">
          <div class="lc-hstack mb-3">
            <h3 class="lc-card-title mb-0">Development Plan</h3>
            <button class="lc-btn lc-btn--ghost lc-btn--sm ml-auto" data-act="add-plan-row">+ Add Goal</button>
          </div>
          <div id="sp-dev-plan">
            ${planRows || '<p class="text-muted" id="sp-plan-empty">No development goals yet.</p>'}
          </div>
        </div>

        <div class="lc-card" style="grid-column:span 2;">
          <h3 class="lc-card-title">Notes</h3>
          <textarea class="lc-textarea" id="sp-notes" rows="4">${esc(c.notes||"")}</textarea>
        </div>

        <div style="grid-column:span 2; display:flex; gap:.75rem; justify-content:flex-end;">
          <button class="lc-btn lc-btn--ghost" data-act="back">Cancel</button>
          <button class="lc-btn lc-btn--primary" data-act="save-candidate" data-id="${c.id}">Save Candidate</button>
        </div>
      </div>
    `;
  }

  function devPlanRowHtml(p, i) {
    const statusOpts = PLAN_STATUSES.map(s =>
      `<option value="${s}"${p.status===s?" selected":""}>${PLAN_STATUS_LABELS[s]}</option>`).join("");
    return `
    <div class="lc-dev-plan-row" data-plan-idx="${i}">
      <div class="lc-form-grid lc-form-grid--3">
        <div class="lc-field">
          <label class="lc-label">Goal</label>
          <input class="lc-input sp-plan-goal" value="${esc(p.goal||"")}">
        </div>
        <div class="lc-field">
          <label class="lc-label">Target Date</label>
          <input class="lc-input" type="date" class="sp-plan-date" value="${p.targetDate||""}">
        </div>
        <div class="lc-field">
          <label class="lc-label">Status</label>
          <select class="lc-select sp-plan-status">${statusOpts}</select>
        </div>
      </div>
      <div class="lc-field mt-2">
        <label class="lc-label">Actions (one per line)</label>
        <textarea class="lc-textarea sp-plan-actions" rows="2">${(p.actions||[]).join("\n")}</textarea>
      </div>
      <button class="lc-btn lc-btn--ghost lc-btn--sm lc-btn--danger mt-2" data-act="remove-plan-row" data-plan-idx="${i}">Remove</button>
    </div>`;
  }

  function tagEditorHtml(id, tags, placeholder) {
    return `
    <div class="lc-tag-editor" data-tag-id="${id}">
      ${tags.map((t,i)=>`<span class="lc-tag lc-tag--editable">${esc(t)}<button data-act="remove-tag" data-tag-id="${id}" data-tag-idx="${i}">×</button></span>`).join("")}
      <input class="lc-input lc-tag-input" placeholder="${placeholder}" data-tag-id="${id}" data-act="tag-input">
    </div>`;
  }

  /* ── POSITIONS VIEW ──────────────────────────────────────────────── */
  function renderPositionForm() {
    const pos = positions();
    const isNew = editingPosId === "__new__";
    const p = isNew
      ? { id:"__new__", title:"", level:"", department:"", riskLevel:"medium", incumbentName:"", incumbentId:"", retirementRisk:false, notes:"" }
      : pos.find(x => x.id === editingPosId) || {};

    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back-to-positions">← Back to Positions</button>
        <h2 class="lc-page-title">${isNew?"New Position":esc(p.title)}</h2>
        ${!isNew ? `<button class="lc-btn lc-btn--ghost lc-btn--danger" data-act="delete-position" data-id="${p.id}">Delete</button>` : ""}
      </div>
      <div id="sp-flash"></div>
      <div class="lc-card" style="max-width:640px">
        <div class="lc-form-grid">
          <div class="lc-field">
            <label class="lc-label">Position Title *</label>
            <input class="lc-input" id="pos-title" value="${esc(p.title||"")}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Level</label>
            <select class="lc-select" id="pos-level">
              <option value="">— Select —</option>
              ${TARGET_LEVELS.map(l=>`<option${p.level===l?" selected":""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="lc-field">
            <label class="lc-label">Department</label>
            <input class="lc-input" id="pos-dept" value="${esc(p.department||"")}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Succession Risk</label>
            <select class="lc-select" id="pos-risk">
              ${["low","medium","high","critical"].map(r=>`<option value="${r}"${p.riskLevel===r?" selected":""}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`).join("")}
            </select>
          </div>
          <div class="lc-field">
            <label class="lc-label">Incumbent Name</label>
            <input class="lc-input" id="pos-incumbent" value="${esc(p.incumbentName||"")}">
          </div>
          <div class="lc-field">
            <label class="lc-label">Retirement / Exit Risk</label>
            <label class="lc-checkbox-label"><input type="checkbox" id="pos-retire"${p.retirementRisk?" checked":""}> High retirement risk in 2 years</label>
          </div>
          <div class="lc-field" style="grid-column:span 2">
            <label class="lc-label">Notes</label>
            <textarea class="lc-textarea" id="pos-notes" rows="3">${esc(p.notes||"")}</textarea>
          </div>
        </div>
        <div class="lc-hstack gap-2 mt-4">
          <button class="lc-btn lc-btn--ghost" data-act="back-to-positions">Cancel</button>
          <button class="lc-btn lc-btn--primary" data-act="save-position" data-id="${p.id}">Save Position</button>
        </div>
      </div>
    `;
  }

  function renderPositionsListView() {
    const pos = positions();
    const cands = candidates();
    container.innerHTML = `
      <div class="lc-page-header">
        <button class="lc-btn lc-btn--ghost" data-act="back">← Back to Pipeline</button>
        <h2 class="lc-page-title">Positions to Fill</h2>
        <button class="lc-btn lc-btn--primary" data-act="add-position">+ Add Position</button>
      </div>
      ${pos.length === 0 ? `<div class="lc-empty-state"><div class="lc-empty-icon">📋</div><p>No positions defined yet.</p></div>` : `
        <div class="lc-card-grid">
          ${pos.map(p => {
            const covers = cands.filter(c => c.positionId === p.id);
            const readyNow = covers.filter(c => computeReadiness(c) >= 85).length;
            return `
            <div class="lc-card" data-act="edit-position" data-id="${p.id}" style="cursor:pointer">
              <div class="lc-hstack mb-2">
                <span class="lc-badge lc-badge--${RISK_COLORS[p.riskLevel]}">${p.riskLevel}</span>
                <span class="ml-auto text-muted text-sm">${p.level||""}</span>
              </div>
              <div class="lc-candidate-name">${esc(p.title)}</div>
              ${p.department ? `<div class="text-muted text-sm">${esc(p.department)}</div>` : ""}
              ${p.incumbentName ? `<div class="text-sm mt-1">Current: ${esc(p.incumbentName)}</div>` : ""}
              <div class="lc-candidate-meta mt-2">
                <span>${covers.length} candidate${covers.length!==1?"s":""}</span>
                <span class="${readyNow===0&&p.riskLevel==="critical"?"text-risk":"text-ok"}">${readyNow} ready now</span>
                ${p.retirementRisk ? `<span class="text-warn">⚠ Exit Risk</span>` : ""}
              </div>
            </div>`;
          }).join("")}
        </div>
      `}
    `;
  }

  /* ── event handling ──────────────────────────────────────────────── */
  function handleEvent(e) {
    const el  = e.target;
    const act = el.closest("[data-act]")?.dataset?.act;
    if (!act) return;
    const id  = el.closest("[data-id]")?.dataset?.id || el.dataset?.id;

    if (act === "tab") { activeTab = el.dataset.tab; render(); return; }
    if (act === "search") { searchQ = el.value; render(); return; }
    if (act === "filter-flight") { filterFlight = el.value; render(); return; }
    if (act === "filter-ready")  { filterReady  = el.value; render(); return; }
    if (act === "add-candidate") { editingId = "__new__"; activeView = "candidate"; render(); return; }
    if (act === "open-candidate" || act === "edit-candidate") {
      editingId = id; activeView = "candidate"; render(); return;
    }
    if (act === "back") { editingId = null; activeView = "pipeline"; render(); return; }
    if (act === "save-candidate") { saveCandidate(id); return; }
    if (act === "delete-candidate") { deleteCandidate(id); return; }
    if (act === "add-plan-row") { addPlanRow(); return; }
    if (act === "remove-plan-row") {
      const idx = parseInt(el.dataset.planIdx, 10);
      removePlanRow(idx); return;
    }
    if (act === "manage-positions") { activeView = "positions_list"; renderPositionsListView(); return; }
    if (act === "back-to-positions") { editingPosId = null; activeView = "positions_list"; renderPositionsListView(); return; }
    if (act === "add-position") { editingPosId = "__new__"; activeView = "position_detail"; render(); return; }
    if (act === "edit-position") { editingPosId = id; activeView = "position_detail"; render(); return; }
    if (act === "save-position") { savePosition(id); return; }
    if (act === "delete-position") { deletePosition(id); return; }
    if (act === "remove-tag") {
      const tagId = el.dataset.tagId;
      const idx   = parseInt(el.dataset.tagIdx, 10);
      removeTag(tagId, idx); return;
    }
    if (act === "tag-input") {
      if (e.type === "keydown" && (e.key === "Enter" || e.key === ",")) {
        e.preventDefault();
        const tagId = el.dataset.tagId;
        const val   = el.value.trim().replace(/,$/, "");
        if (val) addTag(tagId, val, el);
      }
    }
  }

  /* ── save / delete helpers ───────────────────────────────────────── */
  function collectFormPlan() {
    const rows = container.querySelectorAll(".lc-dev-plan-row");
    return Array.from(rows).map(row => ({
      goal:    row.querySelector(".sp-plan-goal")?.value?.trim() || "",
      targetDate: row.querySelector(".sp-plan-date")?.value || "",
      status:  row.querySelector(".sp-plan-status")?.value || "not_started",
      actions: (row.querySelector(".sp-plan-actions")?.value || "").split("\n").map(s=>s.trim()).filter(Boolean)
    })).filter(p => p.goal);
  }

  function collectTags(tagId) {
    const wrap = container.querySelector(`[data-tag-id="${tagId}"]`);
    if (!wrap) return [];
    return Array.from(wrap.querySelectorAll(".lc-tag--editable")).map(el => {
      const txt = el.textContent.trim();
      return txt.replace(/×$/, "").trim();
    }).filter(Boolean);
  }

  function saveCandidate(id) {
    const name = container.querySelector("#sp-name")?.value?.trim();
    if (!name) { flash("sp-flash","Name is required","warn"); return; }
    const manualR = container.querySelector("#sp-manual-readiness")?.value?.trim();
    const now = new Date().toISOString();
    const entry = {
      id: id === "__new__" ? uid() : id,
      name,
      currentRole:    container.querySelector("#sp-current-role")?.value?.trim() || "",
      targetRole:     container.querySelector("#sp-target-role")?.value?.trim() || "",
      targetLevel:    container.querySelector("#sp-target-level")?.value || "",
      positionId:     container.querySelector("#sp-position")?.value || "",
      memberId:       container.querySelector("#sp-member")?.value || "",
      sponsorName:    container.querySelector("#sp-sponsor")?.value?.trim() || "",
      timelineMonths: parseInt(container.querySelector("#sp-timeline")?.value, 10) || 12,
      flightRisk:     container.querySelector("#sp-flight")?.value || "low",
      flightRiskNotes:container.querySelector("#sp-flight-notes")?.value?.trim() || "",
      strengths:      collectTags("sp-strengths"),
      developmentAreas: collectTags("sp-dev-areas"),
      developmentPlan:  collectFormPlan(),
      manualReadiness:  manualR !== "" ? parseInt(manualR, 10) : null,
      lastReview:     container.querySelector("#sp-last-review")?.value ? new Date(container.querySelector("#sp-last-review").value).toISOString() : "",
      notes:          container.querySelector("#sp-notes")?.value?.trim() || "",
      updatedAt: now,
      createdAt: now
    };
    const cands = candidates();
    const existing = cands.findIndex(c => c.id === entry.id);
    if (existing >= 0) {
      entry.createdAt = cands[existing].createdAt;
      cands[existing] = entry;
    } else {
      cands.push(entry);
    }
    save(KEY_CANDIDATES, cands);
    flash("sp-flash","Candidate saved","ok");
    setTimeout(() => { editingId = null; activeView = "pipeline"; render(); }, 800);
  }

  function deleteCandidate(id) {
    if (!confirm("Delete this candidate?")) return;
    save(KEY_CANDIDATES, candidates().filter(c => c.id !== id));
    editingId = null; activeView = "pipeline"; render();
  }

  function savePosition(id) {
    const title = container.querySelector("#pos-title")?.value?.trim();
    if (!title) { flash("sp-flash","Title required","warn"); return; }
    const now = new Date().toISOString();
    const entry = {
      id: id === "__new__" ? posUid() : id,
      title,
      level:         container.querySelector("#pos-level")?.value || "",
      department:    container.querySelector("#pos-dept")?.value?.trim() || "",
      riskLevel:     container.querySelector("#pos-risk")?.value || "medium",
      incumbentName: container.querySelector("#pos-incumbent")?.value?.trim() || "",
      retirementRisk:container.querySelector("#pos-retire")?.checked || false,
      notes:         container.querySelector("#pos-notes")?.value?.trim() || "",
      createdAt: now, updatedAt: now
    };
    const pos = positions();
    const existing = pos.findIndex(p => p.id === entry.id);
    if (existing >= 0) { entry.createdAt = pos[existing].createdAt; pos[existing] = entry; }
    else pos.push(entry);
    save(KEY_POSITIONS, pos);
    flash("sp-flash","Position saved","ok");
    setTimeout(() => { editingPosId = null; renderPositionsListView(); }, 800);
  }

  function deletePosition(id) {
    if (!confirm("Delete this position? Candidates linked to it will be unlinked.")) return;
    save(KEY_POSITIONS, positions().filter(p => p.id !== id));
    const cands = candidates().map(c => c.positionId === id ? {...c, positionId:""} : c);
    save(KEY_CANDIDATES, cands);
    editingPosId = null; renderPositionsListView();
  }

  function addPlanRow() {
    const wrap = container.querySelector("#sp-dev-plan");
    if (!wrap) return;
    const empty = wrap.querySelector("#sp-plan-empty");
    if (empty) empty.remove();
    const idx = wrap.querySelectorAll(".lc-dev-plan-row").length;
    const div = document.createElement("div");
    div.innerHTML = devPlanRowHtml({ goal:"", targetDate:"", status:"not_started", actions:[] }, idx);
    wrap.appendChild(div.firstElementChild);
  }

  function removePlanRow(idx) {
    const rows = container.querySelectorAll(".lc-dev-plan-row");
    if (rows[idx]) rows[idx].remove();
    if (!container.querySelectorAll(".lc-dev-plan-row").length) {
      const wrap = container.querySelector("#sp-dev-plan");
      if (wrap) wrap.innerHTML = `<p class="text-muted" id="sp-plan-empty">No development goals yet.</p>`;
    }
  }

  function addTag(tagId, val, inputEl) {
    const wrap = container.querySelector(`[data-tag-id="${tagId}"]`);
    if (!wrap) return;
    const span = document.createElement("span");
    const idx  = wrap.querySelectorAll(".lc-tag--editable").length;
    span.className = "lc-tag lc-tag--editable";
    span.innerHTML = `${esc(val)}<button data-act="remove-tag" data-tag-id="${tagId}" data-tag-idx="${idx}">×</button>`;
    wrap.insertBefore(span, inputEl);
    inputEl.value = "";
  }

  function removeTag(tagId, idx) {
    const wrap = container.querySelector(`[data-tag-id="${tagId}"]`);
    if (!wrap) return;
    const tags = wrap.querySelectorAll(".lc-tag--editable");
    if (tags[idx]) tags[idx].remove();
    // Re-index remaining tags
    wrap.querySelectorAll(".lc-tag--editable button[data-tag-idx]").forEach((btn, i) => {
      btn.dataset.tagIdx = i;
    });
  }

  /* ── flash helper ────────────────────────────────────────────────── */
  function flash(wrapperId, msg, type="ok") {
    const el = container.querySelector("#"+wrapperId);
    if (!el) return;
    el.innerHTML = `<div class="lc-alert lc-alert--${type} mb-3">${msg}</div>`;
    setTimeout(() => { if (el) el.innerHTML = ""; }, 2500);
  }

  /* ── utils ───────────────────────────────────────────────────────── */
  function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function initials(name) { return (name||"?").split(/\s+/).map(w=>w[0]||"").join("").toUpperCase().slice(0,2); }

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
        container.addEventListener("click",    handleEvent);
        container.addEventListener("change",   handleEvent);
        container.addEventListener("input",    handleEvent);
        container.addEventListener("keydown",  handleEvent);
        container.dataset.lsxBound = "1";
      }
      render();
    },
    refresh() { render(); },
    getSuccessionHealth
  };

  /* ── register ───────────────────────────────────────────────────── */
  root.LCSuccessionPipelineUI = UI;
  if (typeof module !== "undefined" && module.exports) module.exports = UI;

})(typeof window !== "undefined" ? window : globalThis);
