/* ==========================================================================
   OpsPilot — AI Operations Platform (clickable prototype)
   Static front-end demo. No backend — all data is mocked in this file.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------- */
  const state = {
    view: "dashboard",
    resolved: false, // has the Billing Sync fix been applied?
    metrics: {
      health: 98.7,
      integrations: 24,
      events: "1.8M",
      issues: 3,
    },
  };

  const integrations = [
    {
      id: "billing-sync",
      name: "Billing Sync",
      sub: "Invoicing & payment reconciliation",
      status: "warning", // healthy | warning | critical | recovering
      uptime: "97.2%",
      latency: "1,840 ms",
      errorRate: "12.4%",
      lastSync: "2 hours ago",
      volume: "842K / day",
      flagged: true,
      description: "Handles invoice generation and payment reconciliation with the billing provider.",
    },
    {
      id: "customer-api",
      name: "Customer API",
      sub: "Core customer data service",
      status: "healthy",
      uptime: "99.98%",
      latency: "112 ms",
      errorRate: "0.02%",
      lastSync: "12 sec ago",
      volume: "4.1M / day",
      description: "Primary API for customer profile reads and writes across all client apps.",
    },
    {
      id: "crm-connector",
      name: "CRM Connector",
      sub: "Salesforce bi-directional sync",
      status: "healthy",
      uptime: "99.91%",
      latency: "340 ms",
      errorRate: "0.11%",
      lastSync: "48 sec ago",
      volume: "610K / day",
      description: "Keeps customer and deal records in sync between the CRM and internal systems.",
    },
    {
      id: "data-pipeline",
      name: "Data Pipeline",
      sub: "Nightly ETL & analytics warehouse",
      status: "healthy",
      uptime: "99.85%",
      latency: "—",
      errorRate: "0.04%",
      lastSync: "18 min ago",
      volume: "2.3M rows / run",
      description: "Batch ETL jobs that feed the analytics warehouse and reporting layer.",
    },
    {
      id: "payment-gateway",
      name: "Payment Gateway",
      sub: "Card & ACH processing",
      status: "healthy",
      uptime: "99.99%",
      latency: "205 ms",
      errorRate: "0.01%",
      lastSync: "3 sec ago",
      volume: "1.2M / day",
      description: "Processes card and ACH transactions for checkout and billing.",
    },
    {
      id: "inventory-sync",
      name: "Inventory Sync",
      sub: "Warehouse stock levels",
      status: "healthy",
      uptime: "99.76%",
      latency: "268 ms",
      errorRate: "0.08%",
      lastSync: "2 min ago",
      volume: "380K / day",
      description: "Synchronizes warehouse stock levels with the storefront in near real time.",
    },
    {
      id: "notification-service",
      name: "Notification Service",
      sub: "Email, SMS & push delivery",
      status: "healthy",
      uptime: "99.95%",
      latency: "88 ms",
      errorRate: "0.05%",
      lastSync: "9 sec ago",
      volume: "920K / day",
      description: "Delivers transactional email, SMS, and push notifications.",
    },
    {
      id: "warehouse-etl",
      name: "Warehouse ETL",
      sub: "Fulfillment data replication",
      status: "healthy",
      uptime: "99.88%",
      latency: "—",
      errorRate: "0.03%",
      lastSync: "31 min ago",
      volume: "1.1M rows / run",
      description: "Replicates fulfillment and shipping data into the reporting warehouse.",
    },
  ];

  function getIntegration(id) {
    return integrations.find((i) => i.id === id);
  }

  const activity = [
    {
      id: "a-warn",
      type: "warn",
      text: '<strong>Billing Sync</strong> error rate crossed warning threshold (12.4%)',
      time: "40 min ago",
    },
    {
      id: "a1",
      type: "ok",
      text: '<strong>Payment Gateway</strong> completed scheduled certificate rotation',
      time: "1 hr ago",
    },
    {
      id: "a2",
      type: "info",
      text: '<strong>CRM Connector</strong> processed 610K records with 0 errors',
      time: "2 hrs ago",
    },
    {
      id: "a3",
      type: "ok",
      text: '<strong>Data Pipeline</strong> nightly ETL run completed successfully',
      time: "3 hrs ago",
    },
    {
      id: "a4",
      type: "info",
      text: 'New integration <strong>Warehouse ETL</strong> connected by Priya Nair',
      time: "6 hrs ago",
    },
    {
      id: "a5",
      type: "warn",
      text: '<strong>Inventory Sync</strong> brief latency spike auto-resolved',
      time: "9 hrs ago",
    },
    {
      id: "a6",
      type: "ok",
      text: 'Weekly system health report generated: <strong>98.5% avg</strong>',
      time: "1 day ago",
    },
  ];

  const insights = [
    {
      id: "i-billing",
      title: "Billing Sync — Elevated error rate from upstream latency",
      summary:
        "Billing Sync failures increased after a spike in API response latency from the downstream payment provider, causing request timeouts and failed retries.",
      time: "Just now",
      status: "new", // new | applied
      integrationId: "billing-sync",
    },
    {
      id: "i-crm",
      title: "CRM Connector — Queue depth auto-remediated",
      summary:
        "Detected a temporary sync queue backlog after a bulk import. Auto-scaled worker concurrency and cleared the backlog without manual intervention.",
      time: "Yesterday",
      status: "auto",
    },
    {
      id: "i-pipeline",
      title: "Data Pipeline — Schema drift detected in nightly job",
      summary:
        "A new nullable column was detected in the upstream orders table. Flagged for review before the next scheduled run to prevent downstream reporting errors.",
      time: "2 days ago",
      status: "auto",
    },
  ];

  /* ---------------------------------------------------------------------
     ICONS
     ------------------------------------------------------------------- */
  const ICONS = {
    ok: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 18a1.5 1.5 0 0 0 1.3 2.2h16.2a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v.01M12 11v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    ai: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M12 2l1.8 4.6L18 8l-4.2 1.4L12 14l-1.8-4.6L6 8l4.2-1.4L12 2z" fill="currentColor"/></svg>',
    recover: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M21 12a9 9 0 1 1-3-6.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    caret: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const STATUS_LABEL = { healthy: "Healthy", warning: "Warning", critical: "Critical", recovering: "Recovering" };

  /* ---------------------------------------------------------------------
     UTIL
     ------------------------------------------------------------------- */
  function statusPill(status) {
    return `<span class="status-pill status-${status}"><span class="dot dot-${
      status === "healthy" ? "green" : status === "warning" ? "amber" : status === "critical" ? "red" : "blue"
    }"></span>${STATUS_LABEL[status]}</span>`;
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ---------------------------------------------------------------------
     RENDER: Integration tables (dashboard + integrations page)
     ------------------------------------------------------------------- */
  function renderIntTable(tbody, list) {
    tbody.innerHTML = "";
    list.forEach((i) => {
      const rowClass =
        i.status === "warning" ? "clickable row-flagged" : i.status === "recovering" ? "clickable row-flagged-recovering" : "clickable";
      const row = el(`
        <tr class="${rowClass}" data-id="${i.id}">
          <td class="name-cell">${i.name}<span class="svc-sub">${i.sub}</span></td>
          <td>${statusPill(i.status)}</td>
          <td>${i.uptime}</td>
          <td>${i.latency}</td>
          <td>${i.errorRate}</td>
          <td>${i.lastSync}</td>
          <td class="row-caret">${ICONS.caret}</td>
        </tr>
      `);
      row.addEventListener("click", () => openDetail(i.id));
      tbody.appendChild(row);
    });
  }

  function renderDashboardTable() {
    // Show flagged integration first, then a representative sample of 7.
    const ordered = [...integrations].sort((a, b) => (a.status === "healthy") - (b.status === "healthy"));
    renderIntTable(document.getElementById("dashboard-int-tbody"), ordered);
  }

  function renderIntegrationsTable() {
    const ordered = [...integrations].sort((a, b) => (a.status === "healthy") - (b.status === "healthy"));
    renderIntTable(document.getElementById("integrations-tbody"), ordered);
  }

  /* ---------------------------------------------------------------------
     RENDER: Metrics
     ------------------------------------------------------------------- */
  function renderMetrics() {
    document.getElementById("m-health").textContent = state.metrics.health.toFixed(1) + "%";
    document.getElementById("m-integrations").textContent = state.metrics.integrations;
    document.getElementById("m-events").textContent = state.metrics.events;
    document.getElementById("m-issues").textContent = state.metrics.issues;

    const issuesCard = document.getElementById("m-issues-card");
    const issuesTrend = document.getElementById("m-issues-trend");
    if (state.resolved) {
      issuesCard.classList.add("resolved");
      issuesTrend.textContent = "Down from 3 — Billing Sync recovering";
      issuesTrend.className = "metric-trend up";
    } else {
      issuesCard.classList.remove("resolved");
      issuesTrend.textContent = "1 needs attention";
      issuesTrend.className = "metric-trend warn";
    }
  }

  /* ---------------------------------------------------------------------
     RENDER: Activity feed
     ------------------------------------------------------------------- */
  function activityItemHTML(item) {
    return `
      <li class="${item.new ? "new" : ""}">
        <div class="activity-icon ${item.type}">${ICONS[item.type] || ICONS.info}</div>
        <div>
          <div class="activity-text">${item.text}</div>
          <div class="activity-time">${item.time}</div>
        </div>
      </li>
    `;
  }

  function renderActivity() {
    const dashHtml = activity.slice(0, 6).map(activityItemHTML).join("");
    const fullHtml = activity.map(activityItemHTML).join("");
    document.getElementById("activity-list-dashboard").innerHTML = dashHtml;
    document.getElementById("activity-list-full").innerHTML = fullHtml;
  }

  function pushActivity(item) {
    activity.unshift({ ...item, new: true });
    renderActivity();
  }

  /* ---------------------------------------------------------------------
     RENDER: Volume bar chart (dashboard)
     ------------------------------------------------------------------- */
  const HOURS = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
  const VOLUME = [38, 30, 26, 34, 58, 72, 88, 118, 96, 84, 70, 52]; // thousands/hr

  function renderVolumeChart() {
    const max = Math.max(...VOLUME);
    const wrap = document.getElementById("volume-chart");
    wrap.innerHTML = VOLUME.map((v, idx) => {
      const pct = Math.round((v / max) * 100);
      const isPeak = v === max;
      return `
        <div class="bar-col ${isPeak ? "peak" : ""}">
          <div class="bar" style="height:${pct}%" title="${v}K events"></div>
          <div class="bar-col-label">${HOURS[idx]}</div>
        </div>
      `;
    }).join("");
  }

  /* ---------------------------------------------------------------------
     RENDER: Detail line chart (error rate over time)
     ------------------------------------------------------------------- */
  const ERROR_SERIES_BEFORE = [0.4, 0.5, 0.6, 0.8, 3.2, 8.1, 11.6, 12.4, 12.1, 11.8, 12.4, 12.0];
  const ERROR_SERIES_AFTER = [0.4, 0.5, 0.6, 0.8, 3.2, 8.1, 11.6, 12.4, 12.1, 11.8, 12.4, 6.5, 3.1, 1.4];

  function buildLineChart(series, opts) {
    const w = 640,
      h = 160,
      pad = 10;
    const max = Math.max(...series) * 1.15;
    const stepX = (w - pad * 2) / (series.length - 1);
    const points = series.map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y];
    });
    const linePath = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
    const color = opts && opts.recovering ? "#38bdf8" : "#f5a524";
    const lastPoint = points[points.length - 1];

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#areaFill)" />
        <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${lastPoint[0]}" cy="${lastPoint[1]}" r="4" fill="${color}" stroke="#12151d" stroke-width="2"/>
      </svg>
    `;
  }

  function renderDetailChart() {
    const wrap = document.getElementById("detail-chart");
    const sub = document.getElementById("chart-detail-sub");
    if (state.resolved) {
      wrap.innerHTML = buildLineChart(ERROR_SERIES_AFTER, { recovering: true });
      sub.textContent = "Recovering — error rate trending down since fix applied";
    } else {
      wrap.innerHTML = buildLineChart(ERROR_SERIES_BEFORE, { recovering: false });
      sub.textContent = "Spike began at 6:00 AM";
    }
  }

  /* ---------------------------------------------------------------------
     RENDER: Error list (detail view)
     ------------------------------------------------------------------- */
  function renderErrorList() {
    const list = document.getElementById("error-list");
    const errors = [
      { code: "504", msg: "Gateway timeout contacting payment provider", time: "6 min ago" },
      { code: "ETIMEDOUT", msg: "Connection reset — retry limit exceeded", time: "11 min ago" },
      { code: "429", msg: "Rate limited by payment provider during retry burst", time: "24 min ago" },
      { code: "504", msg: "Gateway timeout contacting payment provider", time: "38 min ago" },
      { code: "LATENCY", msg: "API latency threshold exceeded (2,400ms)", time: "52 min ago" },
    ];
    list.innerHTML = errors
      .map(
        (e) => `
      <li>
        <div class="error-msg">${e.msg}</div>
        <div class="error-meta"><span class="error-code">${e.code}</span> · ${e.time}</div>
      </li>
    `
      )
      .join("");
  }

  /* ---------------------------------------------------------------------
     RENDER: Detail view (Billing Sync)
     ------------------------------------------------------------------- */
  let currentIntegrationId = "billing-sync";

  function renderDetail(id) {
    currentIntegrationId = id;
    const i = getIntegration(id);
    document.getElementById("detail-name").textContent = i.name;
    document.getElementById("detail-desc").textContent = i.description;

    const badge = document.getElementById("detail-status-badge");
    const statCard = document.getElementById("stat-status");
    if (state.resolved && id === "billing-sync") {
      badge.textContent = "Recovering";
      badge.className = "badge badge-recovering";
      statCard.textContent = "Recovering";
      document.getElementById("stat-error-rate").textContent = "3.1%";
      document.getElementById("stat-last-sync").textContent = "Just now";
    } else if (i.status === "healthy") {
      badge.textContent = "Healthy";
      badge.className = "badge";
      badge.style.background = "var(--green-dim)";
      badge.style.color = "var(--green)";
      statCard.textContent = "Healthy";
      document.getElementById("stat-error-rate").textContent = i.errorRate;
      document.getElementById("stat-last-sync").textContent = i.lastSync;
    } else {
      badge.textContent = "Degraded";
      badge.className = "badge";
      statCard.textContent = "Degraded";
      document.getElementById("stat-error-rate").textContent = i.errorRate;
      document.getElementById("stat-last-sync").textContent = i.lastSync;
    }
    document.getElementById("stat-volume").textContent = i.volume;

    // AI button + error list only really meaningful for billing-sync degraded case,
    // but we keep it visible for consistency in this focused prototype.
    const analyzeBtn = document.getElementById("btn-analyze-ai");
    analyzeBtn.style.display = id === "billing-sync" ? "inline-flex" : "none";

    renderDetailChart();
    renderErrorList();
  }

  function openDetail(id) {
    renderDetail(id);
    showView("detail");
  }

  /* ---------------------------------------------------------------------
     RENDER: Insights list
     ------------------------------------------------------------------- */
  function renderInsights() {
    const wrap = document.getElementById("insights-list");
    wrap.innerHTML = insights
      .map((ins) => {
        const status = ins.id === "i-billing" && state.resolved ? "applied" : ins.status;
        const tagClass = status === "new" ? "tag-new" : status === "applied" ? "tag-applied" : "tag-auto";
        const tagLabel = status === "new" ? "Needs Review" : status === "applied" ? "Fix Applied" : "Auto-Resolved";
        return `
        <div class="insight-card" data-id="${ins.id}">
          <div class="insight-icon">${ICONS.ai}</div>
          <div class="insight-body">
            <div class="insight-top">
              <div class="insight-title">${ins.title}</div>
              <span class="insight-tag ${tagClass}">${tagLabel}</span>
            </div>
            <div class="insight-summary">${ins.summary}</div>
            <div class="insight-meta">${ins.time}</div>
          </div>
        </div>
      `;
      })
      .join("");

    wrap.querySelectorAll(".insight-card").forEach((card) => {
      card.addEventListener("click", () => {
        const ins = insights.find((x) => x.id === card.dataset.id);
        if (ins && ins.integrationId) {
          openDetail(ins.integrationId);
        }
      });
    });

    document.getElementById("insights-badge").style.display = state.resolved ? "none" : "inline-flex";
  }

  /* ---------------------------------------------------------------------
     VIEW SWITCHING
     ------------------------------------------------------------------- */
  const PAGE_META = {
    dashboard: { title: "Operations Dashboard", sub: "Real-time visibility across all system integrations" },
    integrations: { title: "Integrations", sub: "Monitor health and performance across every connected system" },
    detail: { title: "Integration Detail", sub: "Deep dive into status, performance, and recent errors" },
    ai: { title: "AI Analysis", sub: "AI-generated root cause analysis and suggested remediation" },
    insights: { title: "AI Insights", sub: "A history of AI-detected issues and automated resolutions" },
    activity: { title: "Activity", sub: "Full audit trail of system and AI-assisted events" },
  };

  function showView(name) {
    state.view = name;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + name).classList.add("active");

    document.getElementById("page-title").textContent = PAGE_META[name].title;
    document.getElementById("page-subtitle").textContent = PAGE_META[name].sub;

    const navMap = { dashboard: "dashboard", integrations: "integrations", detail: "integrations", ai: "integrations", insights: "insights", activity: "activity" };
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.nav === navMap[name]));

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ---------------------------------------------------------------------
     AI ANALYSIS / RESOLUTION FLOW
     ------------------------------------------------------------------- */
  function resetAiPanel() {
    document.getElementById("tech-details").hidden = true;
    document.getElementById("resolution-progress").hidden = true;
    document.getElementById("resolution-success").hidden = true;
    document.getElementById("btn-apply-action").hidden = false;
    document.getElementById("btn-apply-action").disabled = false;
    document.getElementById("btn-apply-action").textContent = "Apply Suggested Action";
    document.getElementById("btn-view-technical").hidden = false;
    ["step-1", "step-2", "step-3"].forEach((id) => {
      const stepEl = document.getElementById(id);
      stepEl.className = "progress-step";
    });
  }

  function openAiAnalysis() {
    resetAiPanel();
    showView("ai");
  }

  function toggleTechDetails() {
    const el = document.getElementById("tech-details");
    el.hidden = !el.hidden;
    document.getElementById("btn-view-technical").textContent = el.hidden ? "View Technical Details" : "Hide Technical Details";
  }

  function applySuggestedAction() {
    document.getElementById("btn-apply-action").hidden = true;
    document.getElementById("btn-view-technical").hidden = true;
    document.getElementById("resolution-progress").hidden = false;

    const steps = ["step-1", "step-2", "step-3"];
    let idx = 0;

    function tickStep() {
      if (idx > 0) document.getElementById(steps[idx - 1]).classList.replace("active", "done");
      if (idx < steps.length) {
        document.getElementById(steps[idx]).classList.add("active");
        idx++;
        setTimeout(tickStep, 700);
      } else {
        finishResolution();
      }
    }
    tickStep();
  }

  function finishResolution() {
    document.getElementById("resolution-progress").hidden = true;
    document.getElementById("resolution-success").hidden = false;

    // Update global state
    state.resolved = true;
    state.metrics.issues = Math.max(0, state.metrics.issues - 1);
    state.metrics.health = 99.1;

    const billing = getIntegration("billing-sync");
    billing.status = "recovering";
    billing.errorRate = "3.1%";
    billing.uptime = "98.6%";
    billing.lastSync = "Just now";

    renderMetrics();
    renderDashboardTable();
    renderIntegrationsTable();
    renderInsights();

    pushActivity({
      id: "a-fix-" + Date.now(),
      type: "recover",
      text: '<strong>AI Assistant</strong> applied fix to <strong>Billing Sync</strong>: retrying failed requests with controlled backoff',
      time: "Just now",
    });

    showToast("Billing Sync recovery in progress — AI-assisted fix applied successfully.");
  }

  /* ---------------------------------------------------------------------
     TOAST
     ------------------------------------------------------------------- */
  function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = el(`
      <div class="toast">
        <span class="toast-icon">${ICONS.ok}</span>
        <span>${message}</span>
      </div>
    `);
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 260);
    }, 4200);
  }

  /* ---------------------------------------------------------------------
     CLOCK
     ------------------------------------------------------------------- */
  function tickClock() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  /* ---------------------------------------------------------------------
     EVENT WIRING
     ------------------------------------------------------------------- */
  function wireEvents() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.nav));
    });

    document.querySelectorAll(".back-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.nav;
        if (target === "detail") {
          renderDetail(currentIntegrationId);
          showView("detail");
        } else {
          showView(target);
        }
      });
    });

    document.getElementById("btn-analyze-ai").addEventListener("click", openAiAnalysis);
    document.getElementById("btn-view-technical").addEventListener("click", toggleTechDetails);
    document.getElementById("btn-apply-action").addEventListener("click", applySuggestedAction);
    document.getElementById("btn-back-dashboard").addEventListener("click", () => showView("dashboard"));
  }

  /* ---------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------- */
  function init() {
    renderMetrics();
    renderDashboardTable();
    renderIntegrationsTable();
    renderActivity();
    renderVolumeChart();
    renderDetail("billing-sync");
    renderInsights();
    wireEvents();
    tickClock();
    setInterval(tickClock, 1000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
