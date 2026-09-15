(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA
     ------------------------------------------------------------------- */
  const opportunities = [
    { id: "northstar", company: "Northstar Dental", contact: "Sarah Mitchell", last: "14 months ago", score: 91, tier: "A", value: 18000, nba: "Personalized Reactivation", status: "Ready", clickable: true },
    { id: "vertex", company: "Vertex Home Services", contact: "Michael Chen", last: "9 months ago", score: 87, tier: "A", value: 12500, nba: "Re-engage on SEO Growth", status: "Ready" },
    { id: "summit", company: "Summit Legal Group", contact: "Rachel Kim", last: "11 months ago", score: 84, tier: "A", value: 15000, nba: "Personalized Reactivation", status: "Ready" },
    { id: "crestline", company: "Crestline Auto Group", contact: "James Walker", last: "16 months ago", score: 88, tier: "A", value: 27000, nba: "Re-engage on Paid Search", status: "In Conversation" },
    { id: "atlas", company: "Atlas Manufacturing", contact: "Daniel Brooks", last: "18 months ago", score: 79, tier: "B", value: 22000, nba: "Research Before Outreach", status: "Needs Enrichment" },
    { id: "bluewave", company: "Bluewave Dental Care", contact: "Olivia Chen", last: "22 months ago", score: 63, tier: "B", value: 9800, nba: "Research Before Outreach", status: "Needs Enrichment" },
    { id: "meridian", company: "Meridian Family Law", contact: "Emily Carter", last: "20 months ago", score: 71, tier: "B", value: 11000, nba: "Research Before Outreach", status: "Needs Enrichment" },
    { id: "harbor", company: "Harbor Fitness Studios", contact: "Ethan Cooper", last: "7 months ago", score: 58, tier: "C", value: 6200, nba: "Nurture Sequence", status: "Needs Review" },
    { id: "golden", company: "Golden State Roofing", contact: "Lucas Martin", last: "13 months ago", score: 54, tier: "C", value: 8500, nba: "Nurture Sequence", status: "Needs Review" }
  ];

  const activity = [
    { icon: "ai", text: "AI generated reactivation for <strong>Northstar Dental</strong>", time: "2 min ago" },
    { icon: "info", text: "<strong>Vertex Home Services</strong> scored 87/100 — moved to A-Tier", time: "14 min ago" },
    { icon: "ok", text: "AI qualified <strong>Crestline Auto Group</strong> — meeting booked", time: "26 min ago" },
    { icon: "info", text: "38 dormant records enriched from Nutshell sync", time: "1 hr ago" },
    { icon: "warn", text: "<strong>Atlas Manufacturing</strong> flagged: needs enrichment", time: "2 hr ago" },
    { icon: "ok", text: "Nutshell CRM sync completed — 30,247 records analyzed", time: "3 hr ago" }
  ];

  const attention = [
    { name: "Atlas Manufacturing", meta: "Needs Enrichment · B-Tier · $22,000" },
    { name: "Bluewave Dental Care", meta: "Needs Enrichment · B-Tier · $9,800" },
    { name: "Harbor Fitness Studios", meta: "Needs Review · C-Tier · $6,200" }
  ];

  const pipelineWeeks = [16000, 18500, 20000, 22500, 25000, 27500, 30000, 25000];
  const pipelineLabels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"];

  const conversations = [
    { name: "Northstar Dental", preview: "Great question — before recommending anything specific, I'd want to run a quick diagnostic on your new location's local visibility…", time: "2 min ago", status: "Qualified", statusClass: "pill-green", goto: "qualified" },
    { name: "Crestline Auto Group", preview: "Can you send over more detail on the paid search package?", time: "8 min ago", status: "In Progress", statusClass: "pill-blue" },
    { name: "Summit Legal Group", preview: "Thanks for reaching out — let me check with my partner and get back to you.", time: "40 min ago", status: "In Progress", statusClass: "pill-blue" },
    { name: "Meridian Family Law", preview: "Not interested at this time.", time: "1 hr ago", status: "Escalated", statusClass: "pill-purple" },
    { name: "Vertex Home Services", preview: "This looks promising — tell me more about timelines.", time: "1 hr ago", status: "In Progress", statusClass: "pill-blue" },
    { name: "Bluewave Dental Care", preview: "Awaiting response", time: "2 hr ago", status: "In Progress", statusClass: "pill-blue" }
  ];

  const kanban = [
    { title: "New", cards: [{ name: "Golden State Roofing", value: "$8,500" }, { name: "Harbor Fitness Studios", value: "$6,200" }] },
    { title: "Contacted", cards: [{ name: "Atlas Manufacturing", value: "$22,000" }, { name: "Bluewave Dental Care", value: "$9,800" }, { name: "Meridian Family Law", value: "$11,000" }] },
    { title: "Qualified", cards: [{ name: "Northstar Dental", value: "$18,000", highlight: true }, { name: "Crestline Auto Group", value: "$27,000" }] },
    { title: "Proposal", cards: [{ name: "Vertex Home Services", value: "$12,500" }] },
    { title: "Won", cards: [{ name: "Summit Legal Group", value: "$15,000" }] }
  ];

  const messageVariants = [
    "Hi Sarah — it's been a while since we worked together on Northstar Dental's SEO. I noticed you've opened a new location recently, which is exciting. I also ran a quick visibility check and noticed organic search traffic has dipped about 18% over the past few months — likely tied to the added competition from the new market.\n\nGiven the investment in the new location, this seems like a good moment to make sure search is pulling its weight. Happy to share a quick breakdown of what's changed and where the fastest wins might be, if that's useful.",
    "Hi Sarah — it's been a while since we worked together on Northstar Dental's search visibility. Congrats on the new location, that's a big step. While looking into it, I noticed organic traffic has slipped around 18% recently, which often happens when a new market shifts local search competition.\n\nMight be worth a quick look together to make sure the new location gets its fair share of visibility. I can put together a short breakdown if that would be helpful."
  ];

  const STATUS_PILL = {
    "Ready": "pill-green",
    "Needs Enrichment": "pill-amber",
    "Needs Review": "pill-slate",
    "In Conversation": "pill-blue"
  };
  const TIER_PILL = { A: "pill-green", B: "pill-blue", C: "pill-slate" };

  /* ---------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------- */
  function fmtMoney(n) {
    return "$" + n.toLocaleString("en-US");
  }
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function ringSVG(score, size, stroke, color) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);
    return `
      <div class="ring" style="width:${size}px;height:${size}px">
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--surface-sunken)" stroke-width="${stroke}"/>
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
        </svg>
        <div class="ring-value"><span class="ring-number mono">${score}</span><span class="ring-percent">/100</span></div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------------
     VIEW SWITCHING
     ------------------------------------------------------------------- */
  const PAGE_META = {
    dashboard: { title: "Revenue Command Center", sub: "Autonomous pipeline generation from your existing Nutshell CRM data" },
    opportunities: { title: "AI Opportunity Queue", sub: "Dormant CRM records ranked and scored by AI" },
    lead: { title: "Lead Intelligence", sub: "Full AI analysis of a single opportunity" },
    reactivation: { title: "AI Reactivation", sub: "Personalized outreach generated from CRM history and enrichment" },
    conversation: { title: "AI Sales Conversation", sub: "Live conversation handled by AI within guardrails" },
    qualified: { title: "Qualified Opportunity", sub: "AI-qualified opportunity, synced back to Nutshell CRM" },
    decisions: { title: "AI Decision Log", sub: "Every important AI decision, with reasoning and confidence" },
    conversations: { title: "Conversations", sub: "All active AI-handled sales conversations" },
    pipeline: { title: "Pipeline", sub: "Opportunities generated by AI reactivation, by stage" },
    integrations: { title: "Integrations", sub: "Connected systems and data sources" }
  };
  const NAV_MAP = { dashboard: "dashboard", opportunities: "opportunities", lead: "opportunities", reactivation: "opportunities", conversation: "conversations", qualified: "pipeline", decisions: "decisions", conversations: "conversations", pipeline: "pipeline", integrations: "integrations" };

  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + name).classList.add("active");
    document.getElementById("page-title").textContent = PAGE_META[name].title;
    document.getElementById("page-subtitle").textContent = PAGE_META[name].sub;
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.nav === NAV_MAP[name]));
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------------------
     RENDER: Dashboard
     ------------------------------------------------------------------- */
  function renderPipelineChart() {
    const max = Math.max(...pipelineWeeks);
    const wrap = document.getElementById("pipeline-chart");
    wrap.innerHTML = pipelineWeeks
      .map((v, i) => {
        const pct = Math.round((v / max) * 100);
        const isPeak = v === max;
        return `<div class="bar-col ${isPeak ? "peak" : ""}"><div class="bar" style="height:${pct}%" title="${fmtMoney(v)}"></div><div class="bar-col-label">${pipelineLabels[i]}</div></div>`;
      })
      .join("");
  }

  function renderActivity() {
    document.getElementById("activity-list").innerHTML = activity
      .map((a) => `<li><div class="activity-icon ${a.icon}">${iconFor(a.icon)}</div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></li>`)
      .join("");
  }

  function iconFor(type) {
    if (type === "ok") return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (type === "warn") return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 18a1.5 1.5 0 0 0 1.3 2.2h16.2a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" stroke="currentColor" stroke-width="1.7"/></svg>';
    if (type === "ai") return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 2l1.8 4.6L18 8l-4.2 1.4L12 14l-1.8-4.6L6 8l4.2-1.4L12 2z" fill="currentColor"/></svg>';
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v.01M12 11v5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  }

  function renderAttention() {
    document.getElementById("attention-list").innerHTML = attention
      .map((a) => `<li><div><div class="attention-name">${a.name}</div><div class="attention-meta">${a.meta}</div></div><svg viewBox="0 0 24 24" width="15" height="15" fill="none" style="color:var(--ink-faint)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></li>`)
      .join("");
  }

  /* ---------------------------------------------------------------------
     RENDER: Opportunity Queue
     ------------------------------------------------------------------- */
  let currentFilter = "all";

  function matchesFilter(o, filter) {
    if (filter === "all") return true;
    if (filter === "a-tier") return o.tier === "A";
    if (filter === "b-tier") return o.tier === "B";
    if (filter === "needs-review") return o.status === "Needs Review";
    if (filter === "in-conversation") return o.status === "In Conversation";
    return true;
  }

  function renderOpportunities() {
    const filtered = opportunities.filter((o) => matchesFilter(o, currentFilter));
    const tbody = document.getElementById("opportunities-tbody");
    tbody.innerHTML = filtered
      .map((o) => {
        const companyCell = o.clickable
          ? `<span class="company-link">${o.company}</span>`
          : `<span>${o.company}</span>`;
        return `
        <tr class="${o.clickable ? "clickable" : ""}" data-id="${o.id}">
          <td class="company-cell">${companyCell}</td>
          <td>${o.contact}</td>
          <td>${o.last}</td>
          <td class="mono">${o.score}/100</td>
          <td><span class="pill ${TIER_PILL[o.tier]}">${o.tier}-Tier</span></td>
          <td class="mono">${fmtMoney(o.value)}</td>
          <td>${o.nba}</td>
          <td><span class="pill ${STATUS_PILL[o.status]}">${o.status}</span></td>
          <td class="chevron-cell">${o.clickable ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ""}</td>
        </tr>
      `;
      })
      .join("");

    tbody.querySelectorAll("tr.clickable").forEach((row) => {
      row.addEventListener("click", () => showView("lead"));
    });

    document.getElementById("queue-count").textContent = `${filtered.length} of 1,284 dormant opportunities shown`;
  }

  function wireFilters() {
    document.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll(".filter-pill").forEach((b) => b.classList.toggle("active", b === btn));
        renderOpportunities();
      });
    });
  }

  /* ---------------------------------------------------------------------
     RENDER: Lead Intelligence
     ------------------------------------------------------------------- */
  function renderLeadRing() {
    document.getElementById("lead-score-ring").innerHTML = ringSVG(91, 128, 11, "var(--green)") +
      `<div><div style="font-size:12px;color:var(--ink-muted);font-weight:600;text-transform:uppercase;letter-spacing:.03em">AI Score</div><span class="pill pill-green" style="margin-top:6px">A-Tier</span></div>`;
  }

  /* ---------------------------------------------------------------------
     RENDER: Reactivation
     ------------------------------------------------------------------- */
  let messageIndex = 0;
  let editing = false;

  function renderMessage() {
    document.getElementById("message-bubble").textContent = messageVariants[messageIndex];
    document.getElementById("message-textarea").value = messageVariants[messageIndex];
  }

  function toggleEdit() {
    editing = !editing;
    document.getElementById("message-bubble").hidden = editing;
    document.getElementById("message-textarea").hidden = !editing;
    document.getElementById("btn-edit").textContent = editing ? "Done Editing" : "Edit";
  }

  function regenerate() {
    messageIndex = (messageIndex + 1) % messageVariants.length;
    renderMessage();
    showToast("New variation generated");
  }

  function approveAndSend() {
    document.getElementById("btn-approve-send").disabled = true;
    document.getElementById("btn-regenerate").disabled = true;
    document.getElementById("btn-edit").disabled = true;
    document.getElementById("sending-state").hidden = false;
    setTimeout(() => {
      renderThread();
      showToast("Message sent to Northstar Dental");
      resetReactivationControls();
      showView("conversation");
    }, 900);
  }

  function resetReactivationControls() {
    document.getElementById("btn-approve-send").disabled = false;
    document.getElementById("btn-regenerate").disabled = false;
    document.getElementById("btn-edit").disabled = false;
    document.getElementById("sending-state").hidden = true;
    editing = false;
    document.getElementById("message-bubble").hidden = false;
    document.getElementById("message-textarea").hidden = true;
    document.getElementById("btn-edit").textContent = "Edit";
  }

  /* ---------------------------------------------------------------------
     RENDER: Conversation
     ------------------------------------------------------------------- */
  function renderThread() {
    const thread = document.getElementById("thread");
    thread.innerHTML = `
      <div class="msg msg-ai"><div class="msg-meta">Ignite AI · Sent</div>${messageVariants[messageIndex].replace(/\n\n/g, "<br><br>")}</div>
      <div class="msg msg-prospect"><div class="msg-meta">Sarah Mitchell</div>"Interesting timing. We have been trying to grow the new location but organic traffic hasn't really moved. What would you recommend?"</div>
      <div class="msg msg-ai"><div class="msg-meta">Ignite AI · Drafted &amp; sent automatically</div>Great question — before recommending anything specific, I'd want to run a quick diagnostic on your new location's local visibility (map pack presence, citations, and on-page signals) so any recommendation is based on what's actually happening rather than guesswork. I can have that back to you in a day or two — would that be helpful?</div>
    `;
  }

  function takeOver() {
    document.getElementById("handoff-banner").hidden = false;
    document.getElementById("btn-continue-auto").disabled = true;
    document.getElementById("btn-take-over").disabled = true;
    showToast("Conversation handed to a human rep");
  }

  function continueAutomatically() {
    document.getElementById("btn-continue-auto").disabled = true;
    document.getElementById("btn-take-over").disabled = true;
    document.getElementById("btn-continue-auto").textContent = "Qualifying opportunity…";
    setTimeout(() => {
      showToast("Northstar Dental qualified — meeting booked");
      resetConversationControls();
      showView("qualified");
    }, 900);
  }

  function resetConversationControls() {
    document.getElementById("btn-continue-auto").disabled = false;
    document.getElementById("btn-take-over").disabled = false;
    document.getElementById("btn-continue-auto").textContent = "Continue Automatically →";
    document.getElementById("handoff-banner").hidden = true;
  }

  /* ---------------------------------------------------------------------
     RENDER: Conversations list
     ------------------------------------------------------------------- */
  function renderConversationsList() {
    document.getElementById("conversations-list").innerHTML = conversations
      .map((c) => {
        const initials = c.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
        return `
        <li class="conv-list-item ${c.goto ? "clickable" : ""}" data-goto="${c.goto || ""}" style="list-style:none">
          <div class="conv-avatar">${initials}</div>
          <div class="conv-main">
            <div class="conv-name">${c.name}</div>
            <div class="conv-preview">${c.preview}</div>
          </div>
          <span class="pill ${c.statusClass}">${c.status}</span>
          <span class="conv-time">${c.time}</span>
        </li>
      `;
      })
      .join("");

    document.querySelectorAll(".conv-list-item.clickable").forEach((item) => {
      item.addEventListener("click", () => showView(item.dataset.goto));
    });
  }

  /* ---------------------------------------------------------------------
     RENDER: Kanban
     ------------------------------------------------------------------- */
  function renderKanban() {
    document.getElementById("kanban").innerHTML = kanban
      .map(
        (col) => `
      <div class="kanban-col">
        <div class="kanban-col-head"><span class="kanban-col-title">${col.title}</span><span class="kanban-count">${col.cards.length}</span></div>
        ${col.cards
          .map(
            (c) => `
          <div class="kanban-card ${c.highlight ? "highlight" : ""}">
            <div class="kanban-card-name">${c.name}</div>
            <div class="kanban-card-value mono">${c.value}</div>
            ${c.highlight ? '<span class="pill pill-accent">Just qualified</span>' : ""}
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");
  }

  /* ---------------------------------------------------------------------
     TOAST
     ------------------------------------------------------------------- */
  function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = el(`<div class="toast">${message}</div>`);
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  /* ---------------------------------------------------------------------
     WIRING
     ------------------------------------------------------------------- */
  function wireNav() {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.nav));
    });
  }

  function wireLead() {
    document.getElementById("btn-human-review").addEventListener("click", () => {
      showToast("Sent for human review");
    });
  }

  function wireReactivation() {
    document.getElementById("btn-regenerate").addEventListener("click", regenerate);
    document.getElementById("btn-edit").addEventListener("click", toggleEdit);
    document.getElementById("btn-approve-send").addEventListener("click", approveAndSend);
  }

  function wireConversation() {
    document.getElementById("btn-take-over").addEventListener("click", takeOver);
    document.getElementById("btn-continue-auto").addEventListener("click", continueAutomatically);
  }

  /* ---------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------- */
  function init() {
    renderPipelineChart();
    renderActivity();
    renderAttention();
    renderOpportunities();
    renderLeadRing();
    renderMessage();
    renderThread();
    renderConversationsList();
    renderKanban();

    wireNav();
    wireFilters();
    wireLead();
    wireReactivation();
    wireConversation();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
