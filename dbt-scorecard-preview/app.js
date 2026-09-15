(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA (mirrors the SvelteKit prototype's src/lib/data.ts)
     ------------------------------------------------------------------- */
  const sessionList = [
    { id: "1842", patient: "Patient #1842", date: "Sep 14", duration: "52 min", status: "Processed", score: 82, notes: "Ready", clickable: true },
    { id: "2081", patient: "Patient #2081", date: "Sep 14", duration: "47 min", status: "Processed", score: 91, notes: "Ready", clickable: false },
    { id: "1657", patient: "Patient #1657", date: "Sep 13", duration: "55 min", status: "Processing", score: null, notes: "Processing", clickable: false },
    { id: "1390", patient: "Patient #1390", date: "Sep 13", duration: "49 min", status: "Processed", score: 74, notes: "Needs Review", clickable: false },
    { id: "2214", patient: "Patient #2214", date: "Sep 12", duration: "61 min", status: "Processed", score: 88, notes: "Ready", clickable: false },
    { id: "1509", patient: "Patient #1509", date: "Sep 12", duration: "38 min", status: "Processed", score: 79, notes: "Ready", clickable: false },
    { id: "1998", patient: "Patient #1998", date: "Sep 11", duration: "50 min", status: "Processing", score: null, notes: "Processing", clickable: false }
  ];

  const transcript = [
    { t: "02:15", speaker: "Therapist", text: "Before we get into the week, how has your mood been on a day-to-day basis since we last spoke?", tag: "Check-in" },
    { t: "04:03", speaker: "Patient", text: "Okay, mostly. There was one really bad night on Wednesday after an argument with my sister." },
    { t: "06:47", speaker: "Therapist", text: "That sounds really hard. It makes sense that would shake things up, especially given how close you two usually are.", tag: "Validation" },
    { t: "09:12", speaker: "Patient", text: "Yeah. I ended up yelling and then just left the house. I didn't use any of the skills we talked about." },
    { t: "11:30", speaker: "Therapist", text: "Let's slow down and walk through it step by step. What happened right before the argument started?", tag: "Behavioral Chain Analysis" },
    { t: "15:52", speaker: "Patient", text: "I hadn't really eaten all day and I was already on edge from a work email." },
    { t: "18:42", speaker: "Therapist", text: "What would make trying this strategy worthwhile for you this week?", tag: "Commitment Strategies" },
    { t: "19:20", speaker: "Patient", text: "I guess if it meant I didn't have to leave the house every time we disagree. That gets exhausting." },
    { t: "23:05", speaker: "Therapist", text: "That's a great reason to hold onto. Let's look at what TIPP would have offered in that exact moment.", tag: "Skills Coaching" },
    { t: "27:18", speaker: "Therapist", text: "Given everything on your plate this week, do you think the safety plan we built still fits, or does it need adjusting?", tag: "Treatment Targets" },
    { t: "31:08", speaker: "Therapist", text: "Let's come back to what you want to change before the next session.", tag: "Commitment Strategies" },
    { t: "31:40", speaker: "Patient", text: "Okay — I think I want to try pausing before I leave the room, even just for a minute." },
    { t: "38:14", speaker: "Therapist", text: "That pause is exactly the kind of skill we can build on. How confident do you feel about trying that this week?", tag: "Skills Coaching" },
    { t: "44:29", speaker: "Patient", text: "Fairly confident, maybe a 7 out of 10." },
    { t: "48:56", speaker: "Therapist", text: "Let's check in again next week on how the pause went, and we'll troubleshoot from there.", tag: "Wrap-up" }
  ];

  const commitmentAlternatives = [
    "Instead of a broad \"worthwhile\" question, use a scaling probe: ask the patient to rate their commitment from 0–10, then explore what would move the number up by one point before ending the intervention.",
    "Try devil's advocate: gently argue the patient should keep the old coping behavior, prompting them to argue for the new skill themselves — this often produces stronger, self-generated commitment language than direct questioning.",
    "Use foot-in-the-door sequencing: secure agreement to a small, low-effort version of the target behavior first, then expand the commitment once that smaller commitment is confirmed."
  ];

  const scoreItems = [
    {
      id: "validation-strategies", label: "Validation Strategies", score: 92,
      rationale: "The therapist reflected and validated the patient's emotional experience at multiple points before shifting to problem-solving, including explicit acknowledgment of the difficulty of the conflict.",
      evidence: [{ t: "06:47", speaker: "Therapist", text: "That sounds really hard. It makes sense that would shake things up, especially given how close you two usually are." }],
      worked: ["Validation was offered before any redirection toward skills or problem-solving.", "Language matched the emotional intensity the patient described."],
      improve: ["Could validate the difficulty of using skills in the moment, not only the triggering event itself."],
      coaching: [
        { title: "Validate the struggle to use skills, not just the trigger", desc: "When a patient reports not using a skill, validate how hard it is to access skills under high emotional arousal before moving to analysis." },
        { title: "Name the emotion explicitly", desc: "Pairing validation with an explicit emotion label (\"that sounds like it brought up a lot of anger and hurt\") deepens the sense of being understood." }
      ],
      alt: ["Try a two-step validation: first validate the emotion itself, then separately validate the behavioral response as an understandable attempt to cope, before introducing any alternative strategy."]
    },
    {
      id: "behavioral-analysis", label: "Behavioral Analysis", score: 84,
      rationale: "The therapist conducted a structured chain analysis of the triggering event, identifying the prompting event and immediate consequences, though earlier vulnerability factors were only partially explored.",
      evidence: [
        { t: "11:30", speaker: "Therapist", text: "Let's slow down and walk through it step by step. What happened right before the argument started?" },
        { t: "15:52", speaker: "Patient", text: "I hadn't really eaten all day and I was already on edge from a work email." }
      ],
      worked: ["Chain analysis was initiated promptly rather than staying in general discussion.", "Prompting event and immediate response were clearly identified."],
      improve: ["Vulnerability factors (skipped meal, work stress) were named by the patient but not explicitly mapped back into the chain.", "No discussion of consequences that reinforced the behavior."],
      coaching: [
        { title: "Explicitly map vulnerability factors", desc: "When a patient mentions a contributing factor like missed meals or poor sleep, restate it as part of the chain out loud to reinforce the link." },
        { title: "Close the loop on consequences", desc: "Ask what happened immediately after the behavior (relief, further conflict) to complete the chain and identify reinforcement." }
      ],
      alt: ["Use a written chain analysis worksheet in-session so vulnerability factors, links, and consequences are visually mapped together rather than discussed verbally only."]
    },
    {
      id: "skills-coaching", label: "Skills Coaching", score: 76,
      rationale: "TIPP skills were reviewed in relation to the triggering event, and the therapist checked confidence in a new coping strategy, but coaching stayed largely conceptual rather than rehearsed in session.",
      evidence: [
        { t: "23:05", speaker: "Therapist", text: "That's a great reason to hold onto. Let's look at what TIPP would have offered in that exact moment." },
        { t: "38:14", speaker: "Therapist", text: "That pause is exactly the kind of skill we can build on. How confident do you feel about trying that this week?" }
      ],
      worked: ["Confidence rating was collected before ending the discussion of the new strategy.", "Skill was tied back to a concrete moment from the patient's week."],
      improve: ["No in-session rehearsal or role-play of the pause strategy.", "Discussion of TIPP stayed conceptual rather than walking through a specific technique (e.g., paced breathing) step by step."],
      coaching: [
        { title: "Rehearse the skill in session", desc: "Have the patient practice the pause or a TIPP technique out loud or physically in session, not just describe it hypothetically." },
        { title: "Pick one TIPP technique to go deep on", desc: "Rather than reviewing TIPP broadly, select the single most relevant technique for the trigger described and walk through it in detail." }
      ],
      alt: ["Use in-session behavioral rehearsal: ask the patient to physically demonstrate the pause (standing up, stepping back) so the skill is encoded motorically, not just discussed."]
    },
    {
      id: "treatment-targets", label: "Treatment Targets", score: 88,
      rationale: "The session stayed focused on the highest-priority target (conflict-driven escalation) consistent with the treatment hierarchy, and the therapist checked whether the standing safety plan still fit current stressors.",
      evidence: [{ t: "27:18", speaker: "Therapist", text: "Given everything on your plate this week, do you think the safety plan we built still fits, or does it need adjusting?" }],
      worked: ["Session content stayed aligned with the current highest-priority target rather than drifting to lower-priority topics.", "Safety plan relevance was actively checked rather than assumed."],
      improve: ["Could explicitly state the treatment target hierarchy out loud to reinforce shared understanding with the patient."],
      coaching: [{ title: "Name the target hierarchy explicitly", desc: "Briefly stating why this target takes priority this week helps the patient understand the structure behind the session, not just its content." }],
      alt: ["Open the session with a one-minute target review (\"last week's priority was X, this week I want to check if that's still true\") before moving into the chain analysis."]
    },
    {
      id: "commitment-strategies", label: "Commitment Strategies", score: 68,
      rationale: "The therapist explored motivation for change but did not consistently reinforce explicit commitment to the agreed behavioral target.",
      evidence: [
        { t: "18:42", speaker: "Therapist", text: "What would make trying this strategy worthwhile for you this week?" },
        { t: "31:08", speaker: "Therapist", text: "Let's come back to what you want to change before the next session." }
      ],
      worked: ["Opened the door for the patient to generate their own reason for change (\"worthwhile for you\").", "Returned to the topic of commitment later in the session rather than dropping it entirely."],
      improve: ["The specific behavioral target (the pause strategy) was not restated in explicit, observable terms once agreed upon.", "No confirmation or restatement of the commitment at the close of the session.", "Commitment was not tied back to the patient's longer-term treatment goals."],
      coaching: [
        { title: "Strengthen explicit commitment", desc: "Ask the patient to state the specific behavior they are committing to before ending the intervention." },
        { title: "Connect commitment to treatment goals", desc: "Tie the behavioral commitment back to the patient's stated long-term goal." },
        { title: "Confirm next action", desc: "End with a clear, observable action that can be reviewed in the next session." }
      ],
      alt: commitmentAlternatives
    }
  ];

  const OVERALL_SCORE = 82;

  /* ---------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------- */
  function statusOf(score) {
    if (score >= 85) return "strong";
    if (score >= 70) return "meets";
    return "attention";
  }
  const statusLabel = { strong: "Strong", meets: "Meets Criteria", attention: "Needs Attention" };
  const statusPillClass = { strong: "pill-strong", meets: "pill-meets", attention: "pill-attention" };
  const statusColorVar = { strong: "var(--status-strong)", meets: "var(--status-meets)", attention: "var(--status-attention)" };

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
        <div class="ring-value"><span class="ring-number mono">${score}</span><span class="ring-percent">%</span></div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------- */
  let activeTab = "overview";
  let selectedItemId = null;
  let generating = false;
  const altAttempt = {};
  const showAlt = {};

  /* ---------------------------------------------------------------------
     RENDER: Dashboard
     ------------------------------------------------------------------- */
  function renderDashboard() {
    const tbody = document.getElementById("dashboard-tbody");
    tbody.innerHTML = sessionList
      .map((s) => {
        const scoreCell =
          s.score !== null
            ? `<span class="pill ${statusPillClass[statusOf(s.score)]} mono">${s.score}%</span>`
            : `<span class="dash mono">—</span>`;
        const statusPill = s.status === "Processed" ? "pill-strong" : "pill-processing";
        const notesPill = s.notes === "Ready" ? "pill-strong" : s.notes === "Needs Review" ? "pill-attention" : "pill-processing";
        const lockIcon = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none"><rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6"/></svg>`;
        const patientCell = s.clickable
          ? `<span class="patient-link">${s.patient} ${lockIcon}</span>`
          : `<span class="patient-plain">${s.patient} ${lockIcon}</span>`;
        return `
          <tr class="${s.clickable ? "clickable" : ""}" data-id="${s.id}">
            <td class="patient-cell">${patientCell}</td>
            <td>${s.date}</td>
            <td class="mono">${s.duration}</td>
            <td><span class="pill ${statusPill}">${s.status}</span></td>
            <td>${scoreCell}</td>
            <td><span class="pill ${notesPill}">${s.notes}</span></td>
            <td class="chevron-cell">${s.clickable ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ""}</td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll("tr.clickable").forEach((row) => {
      row.addEventListener("click", () => openSession());
    });
  }

  function openSession() {
    document.getElementById("view-dashboard").classList.remove("active");
    document.getElementById("view-session").classList.add("active");
    window.scrollTo(0, 0);
  }

  function backToDashboard() {
    document.getElementById("view-session").classList.remove("active");
    document.getElementById("view-dashboard").classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------------------
     RENDER: Session review
     ------------------------------------------------------------------- */
  function renderTranscript() {
    const list = document.getElementById("transcript-list");
    list.innerHTML = transcript
      .map(
        (line) => `
        <li class="transcript-line ${line.speaker === "Therapist" ? "therapist" : ""}">
          <span class="transcript-time mono">${line.t}</span>
          <div class="transcript-body">
            <div class="transcript-speaker-row">
              <span class="transcript-speaker">${line.speaker}</span>
              ${line.tag ? `<span class="tag-chip">${line.tag}</span>` : ""}
            </div>
            <p>${line.text}</p>
          </div>
        </li>
      `
      )
      .join("");
  }

  function renderScorecardList() {
    const wrap = document.getElementById("scorecard-list");
    wrap.innerHTML = scoreItems
      .map((item) => {
        const status = statusOf(item.score);
        return `
        <button class="score-row" data-item-id="${item.id}">
          <div class="score-row-main">
            <span class="score-row-label">${item.label}</span>
            <div class="score-row-bar"><div class="score-row-bar-fill" style="width:${item.score}%;background:${statusColorVar[status]}"></div></div>
          </div>
          <span class="score-row-value mono">${item.score}%</span>
          <span class="pill ${statusPillClass[status]}">${statusLabel[status]}</span>
          <svg class="score-row-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      `;
      })
      .join("");

    wrap.querySelectorAll(".score-row").forEach((row) => {
      row.addEventListener("click", () => openScoreItem(row.dataset.itemId));
    });
  }

  function renderRings() {
    const overallStatus = statusOf(OVERALL_SCORE);
    document.getElementById("overview-ring").innerHTML = ringSVG(OVERALL_SCORE, 92, 8, statusColorVar[overallStatus]);
    document.getElementById("scorecard-ring").innerHTML = ringSVG(OVERALL_SCORE, 140, 12, statusColorVar[overallStatus]);
  }

  function getItem(id) {
    return scoreItems.find((i) => i.id === id);
  }

  function openScoreItem(id) {
    selectedItemId = id;
    const item = getItem(id);
    const status = statusOf(item.score);

    document.getElementById("item-label").textContent = item.label;
    document.getElementById("item-score").textContent = item.score + "%";
    const pill = document.getElementById("item-status-pill");
    pill.textContent = statusLabel[status];
    pill.className = "pill " + statusPillClass[status];
    document.getElementById("item-rationale").textContent = item.rationale;

    document.getElementById("item-evidence").innerHTML = item.evidence
      .map((ev) => `<div class="evidence-card"><span class="evidence-time mono">${ev.t}</span><p><span class="evidence-speaker">${ev.speaker}:</span> "${ev.text}"</p></div>`)
      .join("");
    document.getElementById("item-worked").innerHTML = item.worked.map((w) => `<li>${w}</li>`).join("");
    document.getElementById("item-improve").innerHTML = item.improve.map((w) => `<li>${w}</li>`).join("");

    document.getElementById("score-grid-view").hidden = true;
    document.getElementById("score-item-view").hidden = false;
    goTab("score");
  }

  function backToScorecard() {
    selectedItemId = null;
    document.getElementById("score-item-view").hidden = true;
    document.getElementById("score-grid-view").hidden = false;
    goTab("score");
  }

  function currentCoachingItem() {
    if (selectedItemId) return getItem(selectedItemId);
    return [...scoreItems].sort((a, b) => a.score - b.score)[0];
  }

  function renderCoaching() {
    const item = currentCoachingItem();
    document.getElementById("coaching-item-label").textContent = item.label;
    document.getElementById("coaching-item-score").textContent = item.score + "%";
    document.getElementById("coaching-list").innerHTML = item.coaching
      .map((s, i) => `<li class="coaching-card"><span class="coaching-number">${i + 1}</span><div><h3>${s.title}</h3><p>${s.desc}</p></div></li>`)
      .join("");

    const altCard = document.getElementById("alternative-card");
    if (showAlt[item.id]) {
      const attempt = (altAttempt[item.id] || 1) - 1;
      document.getElementById("alternative-text").textContent = item.alt[attempt % item.alt.length];
      altCard.hidden = false;
    } else {
      altCard.hidden = true;
    }

    const btn = document.getElementById("btn-generate-alt");
    btn.disabled = generating;
    btn.textContent = generating ? "Generating…" : "Generate Alternative Approach";
  }

  function generateAlternative() {
    if (generating) return;
    const item = currentCoachingItem();
    generating = true;
    renderCoaching();
    setTimeout(() => {
      altAttempt[item.id] = (altAttempt[item.id] || 0) + 1;
      showAlt[item.id] = true;
      generating = false;
      renderCoaching();
    }, 650);
  }

  /* ---------------------------------------------------------------------
     TABS
     ------------------------------------------------------------------- */
  function goTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + tab));
    if (tab === "coaching") renderCoaching();
  }

  /* ---------------------------------------------------------------------
     WIRING
     ------------------------------------------------------------------- */
  function wireEvents() {
    document.querySelectorAll('[data-nav="dashboard"]').forEach((b) => b.addEventListener("click", backToDashboard));
    document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => goTab(t.dataset.tab)));
    document.querySelectorAll("[data-goto-tab]").forEach((b) => b.addEventListener("click", () => goTab(b.dataset.gotoTab)));
    document.querySelectorAll("[data-back-to-scorecard]").forEach((b) => b.addEventListener("click", backToScorecard));
    document.getElementById("btn-generate-alt").addEventListener("click", generateAlternative);
  }

  function init() {
    renderDashboard();
    renderTranscript();
    renderScorecardList();
    renderRings();
    wireEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
