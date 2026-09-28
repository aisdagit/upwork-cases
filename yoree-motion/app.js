/* ============================================================
   YOREE — Motion & Micro-interaction Prototype (app logic)

   This file implements the REUSABLE MOTION SYSTEM described in the
   brief as small, named helpers, then wires product screens to them.
   Every screen re-uses the same handful of primitives instead of
   getting its own bespoke animation:

     T()              -> shared timing tokens (durations shrink under Reduced Motion)
     flyGhost()        -> pattern 2: shared/FLIP content transition
     openSheet/closeSheet + makeDraggable() -> pattern 3: bottom sheets
     momentRowHTML() + insertion pass       -> pattern 4: content insertion
     removeMomentRow() -> pattern 5: content removal
     .is-loading/.is-success/icon crossfades -> pattern 6: state transitions
     playCompletion()  -> pattern 7: completion motion
   ============================================================ */

(function () {
  "use strict";

  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  // ---------------------------------------------------------------
  // Data (fictional demo content — no contact info, no real people)
  // ---------------------------------------------------------------
  const MEMORIES = {
    "summer-sea": {
      id: "summer-sea", title: "Summer by the Sea", dateLabel: "August 2026", art: "art-sea",
      moments: [
        { id: "m1", title: "Morning Walk", type: "photo", art: "art-morning", date: "August 3", excerpt: "The tide was low and the sand still cool." },
        { id: "m2", title: "Rain on the Window", type: "audio", art: "art-rain", date: "August 6", excerpt: "Audio memory", duration: 48 },
        { id: "m3", title: "Beach Afternoon", type: "photo", art: "art-beach", date: "August 10", excerpt: "Kids built a fortress that lasted an hour." },
        { id: "m4", title: "Evening Walk", type: "video", art: "art-evening", date: "August 14", excerpt: "We took the long way back, on purpose.", duration: 72 },
        { id: "m5", title: "Dinner Together", type: "photo", art: "art-dinner", date: "August 17", excerpt: "Someone finally admitted whose idea the trip was." },
        { id: "m6", title: "Sunset", type: "photo", art: "art-sunset", date: "August 18", excerpt: "Stayed until the sky went completely quiet.", meaningful: true },
      ],
    },
    "sunday-morning": {
      id: "sunday-morning", title: "Sunday Morning", dateLabel: "June 2026", art: "art-sunday",
      moments: [
        { id: "sm1", title: "Pancakes & Quiet", type: "photo", art: "art-morning", date: "June 7", excerpt: "Nobody rushed to leave the table." },
        { id: "sm2", title: "A Small Note", type: "story", art: "art-newmem", date: "June 7", excerpt: "Wrote three lines before the coffee got cold." },
      ],
    },
    "first-day": {
      id: "first-day", title: "First Day", dateLabel: "September 2026", art: "art-firstday",
      moments: [
        { id: "fd1", title: "New Backpack", type: "photo", art: "art-firstday", date: "September 2", excerpt: "Ready twenty minutes before we needed to leave." },
        { id: "fd2", title: "At the Gate", type: "photo", art: "art-morning", date: "September 2", excerpt: "One last wave before the doors closed." },
      ],
    },
    "weekend-away": {
      id: "weekend-away", title: "Weekend Away", dateLabel: "July 2026", art: "art-weekend",
      moments: [
        { id: "wa1", title: "Mountain Air", type: "photo", art: "art-weekend", date: "July 12", excerpt: "Cooler than we packed for, better than we expected." },
        { id: "wa2", title: "Campfire Story", type: "audio", art: "art-evening", date: "July 12", excerpt: "Audio memory", duration: 35 },
      ],
    },
    "new-memory": {
      id: "new-memory", title: "New Memory", dateLabel: "Just started", art: "art-newmem",
      moments: [],
    },
  };
  const RECENT_ORDER = ["sunday-morning", "first-day", "weekend-away"];

  // ---------------------------------------------------------------
  // App state
  // ---------------------------------------------------------------
  const state = {
    motionReduced: false,
    simulateError: false,
    currentMemory: "summer-sea",
    currentMomentId: null,
    pendingTargetMemory: null,
    openSheetId: null,
    audio: { playing: false, duration: 0, raf: null, startTs: 0 },
    video: { playing: false, duration: 0, elapsed: 0, interval: null },
  };

  // ---------------------------------------------------------------
  // Shared timing tokens — mirrors the CSS custom properties so JS
  // waits line up with what the user actually sees.
  // ---------------------------------------------------------------
  function T(name) {
    const map = { fast: [140, 90], med: [260, 120], slow: [420, 160], hero: [520, 180] };
    return state.motionReduced ? map[name][1] : map[name][0];
  }

  function pluralCount(n) { return `${n} moment${n === 1 ? "" : "s"}`; }
  function formatTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  let toastTimer;
  function showToast(msg) {
    const t = qs("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // =================================================================
  // PATTERN 1 — Press feedback (delegated, works for every .pressable*)
  // =================================================================
  (function initPressFeedback() {
    const SEL = ".pressable, .pressable-sm, .pressable-icon";
    document.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(SEL);
      if (!el) return;
      el.classList.add("is-pressed");
      const release = () => {
        el.classList.remove("is-pressed");
        document.removeEventListener("pointerup", release);
        document.removeEventListener("pointercancel", release);
      };
      document.addEventListener("pointerup", release);
      document.addEventListener("pointercancel", release);
    });
  })();

  // =================================================================
  // PATTERN 2 — Shared content transition (FLIP-style ghost element)
  // =================================================================
  function phoneRect() { return qs("#phone").getBoundingClientRect(); }
  function rectIn(el) {
    const r = el.getBoundingClientRect(), p = phoneRect();
    return { top: r.top - p.top, left: r.left - p.left, width: r.width, height: r.height };
  }
  function applyRect(el, rect, radius) {
    el.style.top = rect.top + "px";
    el.style.left = rect.left + "px";
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    el.style.borderRadius = radius + "px";
  }
  function flyGhost({ artClass, fromRect, toRect, fromRadius, toRadius, showTitle, titleText, onDone }) {
    const ghost = qs("#ghost-el"), art = qs("#ghost-art"), title = qs("#ghost-title");
    const dur = T("hero");
    art.className = "art " + artClass;
    title.style.display = showTitle ? "block" : "none";
    if (showTitle) title.textContent = titleText || "";
    ghost.style.transitionDuration = dur + "ms";
    title.style.transitionDuration = dur + "ms";
    ghost.hidden = false;
    applyRect(ghost, fromRect, fromRadius);
    if (showTitle) { title.style.left = "18px"; title.style.right = "18px"; title.style.bottom = "16px"; title.style.fontSize = fromRect.height > 150 ? "22px" : "14px"; }
    void ghost.offsetHeight; // force reflow before animating to target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyRect(ghost, toRect, toRadius);
        if (showTitle) title.style.fontSize = toRect.height > 150 ? "26px" : "14px";
      });
    });
    setTimeout(() => { ghost.hidden = true; onDone && onDone(); }, dur);
  }
  function activateScreen(name) {
    qsa(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
  }

  // ---- Home -> Story (featured card or a recent-memory card) ----
  function openMemoryFlow(memoryId, sourceImgEl, showTitle) {
    const memory = MEMORIES[memoryId];
    state.currentMemory = memoryId;
    state.currentMomentId = null;
    const storyScreen = qs("#screen-story");

    if (state.motionReduced || !sourceImgEl) {
      renderStory(memory);
      activateScreen("story");
      qs("#story-scroll").scrollTop = 0;
      return;
    }

    const fromRect = rectIn(sourceImgEl);
    renderStory(memory);
    storyScreen.classList.add("hero-armed");
    activateScreen("story");
    qs("#story-scroll").scrollTop = 0;

    requestAnimationFrame(() => {
      const toRect = rectIn(qs("#hero-wrap"));
      flyGhost({
        artClass: memory.art, fromRect, toRect, fromRadius: 26, toRadius: 0,
        showTitle, titleText: memory.title,
        onDone: () => storyScreen.classList.remove("hero-armed"),
      });
    });
  }

  // ---- Story timeline thumbnail -> Moment detail ----
  function openMomentFlow(momentId, thumbEl) {
    const memory = MEMORIES[state.currentMemory];
    const moment = memory.moments.find((m) => m.id === momentId);
    if (!moment) return;
    state.currentMomentId = momentId;
    renderMomentDetail(memory, moment);

    const md = qs("#moment-detail"), backdrop = qs("#backdrop"), heroTarget = qs("#md-hero-target");

    if (state.motionReduced || !thumbEl) {
      backdrop.classList.add("show");
      md.classList.add("show", "reveal-body");
      heroTarget.style.opacity = "1";
      return;
    }

    const fromRect = rectIn(thumbEl);
    heroTarget.style.opacity = "0";
    backdrop.classList.add("show");
    md.classList.add("show");

    requestAnimationFrame(() => {
      const toRect = rectIn(qs("#md-media"));
      flyGhost({
        artClass: moment.art, fromRect, toRect, fromRadius: 12, toRadius: 0, showTitle: false,
        onDone: () => {
          heroTarget.style.opacity = "1";
          setTimeout(() => md.classList.add("reveal-body"), 30);
        },
      });
    });
  }

  // ---- Close moment detail (reverses the same interaction) ----
  function closeMomentFlow(afterClose) {
    const memory = MEMORIES[state.currentMemory];
    const moment = memory.moments.find((m) => m.id === state.currentMomentId);
    const md = qs("#moment-detail"), backdrop = qs("#backdrop");
    const row = moment ? qs(`.moment-row[data-id="${moment.id}"] .moment-thumb`) : null;

    resetMediaPlayback();

    if (state.motionReduced || !row || !moment) {
      md.classList.remove("show", "reveal-body");
      backdrop.classList.remove("show");
      setTimeout(() => afterClose && afterClose(moment), T("fast"));
      return;
    }

    const fromRect = rectIn(qs("#md-media"));
    md.classList.remove("show", "reveal-body");
    backdrop.classList.remove("show");
    qs("#md-hero-target").style.opacity = "0";

    requestAnimationFrame(() => {
      const toRect = rectIn(row);
      flyGhost({
        artClass: moment.art, fromRect, toRect, fromRadius: 0, toRadius: 12, showTitle: false,
        onDone: () => { qs("#md-hero-target").style.opacity = "1"; afterClose && afterClose(moment); },
      });
    });
  }

  // =================================================================
  // Rendering
  // =================================================================
  function renderHome() {
    const featured = MEMORIES["summer-sea"];
    qs("#featured-hero-text .meta").innerHTML =
      `<span>${pluralCount(featured.moments.length)}</span><span class="dot"></span><span>${featured.dateLabel}</span>`;

    qs("#recent-grid").innerHTML = RECENT_ORDER.map((id) => {
      const m = MEMORIES[id];
      return `<div class="mem-card pressable" data-open-memory="${id}">
                 <div class="thumb"><div class="art ${m.art}"></div></div>
                 <div class="body"><div class="title">${m.title}</div><div class="count">${pluralCount(m.moments.length)}</div></div>
               </div>`;
    }).join("");
  }

  function playHomeEntrance() {
    const items = qsa("#screen-home .enter-item");
    items.forEach((el) => el.classList.remove("run"));
    void (items[0] && items[0].offsetWidth);
    items.forEach((el) => el.classList.add("run"));
  }

  function typeBadgeSVG(type) {
    if (type === "audio") return '<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0012 0M12 17v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    if (type === "video") return '<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l12 7-12 7V5z"/></svg>';
    if (type === "story") return '<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M9 10h6M9 14h6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    return "";
  }

  function momentRowHTML(moment, entering) {
    const badge = moment.type !== "photo" ? `<div class="moment-type-badge">${typeBadgeSVG(moment.type)}</div>` : "";
    const dot = moment.meaningful ? '<span class="meaningful-dot">♥</span>' : "";
    return `<div class="moment-row${entering ? " is-entering" : ""}" data-id="${moment.id}">
               <div class="moment-thumb"><div class="art ${moment.art}"></div>${badge}</div>
               <div class="moment-body">
                 <div class="title-row"><div class="m-title">${dot}${moment.title}</div><div class="m-date">${moment.date}</div></div>
                 <div class="m-excerpt">${moment.excerpt}</div>
               </div>
             </div>`;
  }

  function renderStory(memory, opts) {
    opts = opts || {};
    qs("#story-title").textContent = memory.title;
    qs("#story-compact-title").textContent = memory.title;
    qs("#story-meta").innerHTML = `<span>${memory.dateLabel}</span><span class="dot"></span><span>${pluralCount(memory.moments.length)}</span>`;
    qs("#story-hero-target").innerHTML = `<div class="art ${memory.art}"></div>`;
    qs("#story-header").classList.remove("compact");

    const listEl = qs("#story-list"), emptyEl = qs("#story-empty");
    if (memory.moments.length === 0) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      listEl.innerHTML = memory.moments.map((m) => momentRowHTML(m, m.id === opts.enteringId)).join("");
    }
  }

  function renderStoryWithInsertion(memory, newId) {
    renderStory(memory, { enteringId: state.motionReduced ? null : newId });
    if (state.motionReduced) return; // fully rendered already, no separate reveal pass needed
    setTimeout(() => {
      const row = qs(`.moment-row[data-id="${newId}"]`);
      if (!row) return;
      row.classList.add("show", "is-highlighted");
      setTimeout(() => row.classList.remove("is-highlighted"), 1500);
    }, T("med"));
  }

  function removeMomentRow(memory, momentId) {
    const row = qs(`.moment-row[data-id="${momentId}"]`);
    memory.moments = memory.moments.filter((m) => m.id !== momentId);
    qs("#story-meta").innerHTML = `<span>${memory.dateLabel}</span><span class="dot"></span><span>${pluralCount(memory.moments.length)}</span>`;
    if (!row) return;
    row.classList.add("is-removing");
    setTimeout(() => {
      row.remove();
      if (memory.moments.length === 0) renderStory(memory);
    }, T("slow"));
  }

  // ---- Moment detail content ----
  function renderMomentDetail(memory, moment) {
    qs("#md-art").className = "art " + moment.art;
    qs("#md-title").textContent = moment.title;
    qs("#md-date").textContent = moment.date;

    const quoteEl = qs("#md-quote");
    if (moment.type === "audio") { quoteEl.textContent = "Audio memory"; quoteEl.style.fontStyle = "normal"; }
    else { quoteEl.textContent = `"${moment.excerpt}"`; quoteEl.style.fontStyle = "italic"; }

    qs("#panel-story").textContent = moment.type === "audio" ? "A quiet recording, kept just as it was." : moment.excerpt;

    qs("#md-audio-player").hidden = moment.type !== "audio";
    qs("#md-video-frame").hidden = moment.type !== "video";
    if (moment.type === "audio") { qs("#audio-duration").textContent = formatTime(moment.duration); qs("#audio-elapsed").textContent = "0:00"; qs("#audio-fill").style.width = "0%"; }
    if (moment.type === "video") { qs("#video-time-chip").textContent = `0:00 / ${formatTime(moment.duration)}`; }

    const mb = qs("#btn-meaningful");
    mb.classList.toggle("is-on", !!moment.meaningful);

    qsa(".md-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === "story"));
    qsa(".md-tab-panel").forEach((p) => { p.style.display = p.dataset.panel === "story" ? "block" : "none"; });
  }

  function resetMediaPlayback() {
    pauseAudio();
    stopVideo();
  }

  // =================================================================
  // Audio / video micro-interactions (pattern 6: state transition)
  // =================================================================
  function buildWaveform() {
    const heights = [7, 12, 16, 10, 13];
    qs("#audio-wave").innerHTML = heights.map((h, i) =>
      `<span class="waveform-bar" style="height:${h}px;animation-delay:${i * 90}ms"></span>`).join("");
  }
  function startAudio(duration) {
    state.audio.playing = true; state.audio.duration = duration; state.audio.startTs = performance.now();
    qs("#btn-audio-play").classList.add("playing");
    requestAnimationFrame(audioTick);
  }
  function audioTick(now) {
    if (!state.audio.playing) return;
    const frac = Math.min(1, (now - state.audio.startTs) / 6000);
    qs("#audio-fill").style.width = frac * 100 + "%";
    qs("#audio-elapsed").textContent = formatTime(frac * state.audio.duration);
    if (frac >= 1) { pauseAudio(); qs("#audio-fill").style.width = "0%"; qs("#audio-elapsed").textContent = "0:00"; }
    else state.audio.raf = requestAnimationFrame(audioTick);
  }
  function pauseAudio() {
    state.audio.playing = false;
    cancelAnimationFrame(state.audio.raf);
    qs("#btn-audio-play") && qs("#btn-audio-play").classList.remove("playing");
  }
  function stopVideo() {
    clearInterval(state.video.interval);
    state.video.playing = false; state.video.elapsed = 0;
    qs("#md-video-frame") && qs("#md-video-frame").classList.remove("playing");
  }
  function startVideo(duration) {
    state.video.playing = true; state.video.duration = duration; state.video.elapsed = 0;
    qs("#md-video-frame").classList.add("playing");
    const step = Math.max(1, Math.round(duration / 8));
    state.video.interval = setInterval(() => {
      state.video.elapsed = Math.min(duration, state.video.elapsed + step);
      qs("#video-time-chip").textContent = `${formatTime(state.video.elapsed)} / ${formatTime(duration)}`;
      if (state.video.elapsed >= duration) stopVideo();
    }, 700);
  }

  // =================================================================
  // Bottom sheets (pattern 3) + drag-to-dismiss
  // =================================================================
  function openSheet(sel) {
    const el = qs(sel);
    el.style.transform = "";
    el.classList.add("open");
    qs("#backdrop").classList.add("show");
    state.openSheetId = sel;
  }
  function closeSheet(sel) {
    const el = qs(sel);
    el.classList.remove("open");
    el.style.transform = "";
    if (state.openSheetId === sel) { qs("#backdrop").classList.remove("show"); state.openSheetId = null; }
  }
  function makeDraggable(sel) {
    const el = qs(sel), handle = qs(".sheet-handle", el);
    let dragging = false, startY = 0, delta = 0;
    handle.addEventListener("pointerdown", (e) => {
      dragging = true; startY = e.clientY; el.classList.add("dragging");
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      delta = Math.max(0, e.clientY - startY);
      el.style.transform = `translateY(${delta}px)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; el.classList.remove("dragging");
      if (delta > 90) closeSheet(sel); else el.style.transform = "";
      delta = 0;
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  // =================================================================
  // Create Photo Memory screen (states 6/7 — save, completion, error)
  // =================================================================
  function openCreate(targetMemoryId) {
    state.pendingTargetMemory = targetMemoryId;
    const memory = MEMORIES[targetMemoryId];
    qs("#target-name").textContent = memory.title;
    qs("#target-thumb").className = "art " + memory.art;
    qs("#in-title").value = "Last Light";
    qs("#in-story").value = "One more walk before heading home.";
    qs("#in-date").value = "August 18";
    resetSaveButton();
    qs("#error-panel").classList.remove("show");
    qs("#completion-banner").classList.remove("show");
    activateScreen("create");
  }
  function resetSaveButton() {
    const btn = qs("#btn-save-moment");
    btn.disabled = false;
    btn.classList.remove("is-loading", "is-success");
  }
  function attemptSave() {
    const btn = qs("#btn-save-moment");
    if (btn.classList.contains("is-loading")) return;
    qs("#error-panel").classList.remove("show");
    btn.disabled = true;
    btn.classList.remove("is-success");
    btn.classList.add("is-loading");

    setTimeout(() => {
      if (state.simulateError) {
        btn.classList.remove("is-loading");
        btn.disabled = false;
        qs("#error-panel").classList.add("show");
        return;
      }
      btn.classList.remove("is-loading");
      btn.classList.add("is-success");
      setTimeout(playCompletion, 260);
    }, 900);
  }

  // ---- PATTERN 7 — completion motion ----
  function playCompletion() {
    const memory = MEMORIES[state.pendingTargetMemory];
    const banner = qs("#completion-banner");
    banner.querySelector(".t2").textContent = "Added to " + memory.title;
    banner.classList.add("show");
    const spark = banner.querySelector(".spark");
    spark.classList.remove("play");
    void spark.getBoundingClientRect();
    if (!state.motionReduced) spark.classList.add("play");
    setTimeout(finalizeSave, state.motionReduced ? 500 : 1000);
  }
  function finalizeSave() {
    const memory = MEMORIES[state.pendingTargetMemory];
    const title = qs("#in-title").value.trim() || "Untitled Moment";
    const story = qs("#in-story").value.trim();
    const date = qs("#in-date").value.trim() || memory.dateLabel;
    const newMoment = { id: "m-" + Date.now(), title, type: "photo", art: "art-lastlight", date, excerpt: story };

    // insert chronologically next to any moment sharing the same date label, else append
    const sameDateIdx = memory.moments.map((m) => m.date).lastIndexOf(date);
    if (sameDateIdx >= 0) memory.moments.splice(sameDateIdx + 1, 0, newMoment);
    else memory.moments.push(newMoment);

    qs("#completion-banner").classList.remove("show");
    activateScreen("story");
    qs("#story-scroll").scrollTop = qs("#story-scroll").scrollTop; // preserve current position
    renderStoryWithInsertion(memory, newMoment.id);
    renderHome();
  }

  // =================================================================
  // Story scroll motion (subtle hero compaction, no parallax)
  // =================================================================
  (function initStoryScroll() {
    const scroller = qs("#story-scroll");
    const heroWrap = qs("#hero-wrap");
    const header = qs("#story-header");
    let ticking = false;
    scroller.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scroller.scrollTop;
        const p = Math.min(1, y / 90);
        heroWrap.style.transform = `scale(${1 - p * 0.04})`;
        heroWrap.style.opacity = String(1 - p * 0.15);
        header.classList.toggle("compact", y > 130);
        ticking = false;
      });
    }, { passive: true });
  })();

  // =================================================================
  // Event wiring
  // =================================================================
  function init() {
    buildWaveform();
    makeDraggable("#sheet-add");
    makeDraggable("#sheet-remove");
    renderHome();
    renderStory(MEMORIES["summer-sea"]);

    // boot sequence: loading skeleton -> home, with a real one-shot entrance
    activateScreen("loading");
    setTimeout(() => { activateScreen("home"); playHomeEntrance(); }, 1100);

    document.addEventListener("click", (e) => {
      // open a memory (featured card or a recent card)
      const memCard = e.target.closest("[data-open-memory]");
      if (memCard) {
        const id = memCard.getAttribute("data-open-memory");
        const showTitle = memCard.classList.contains("featured-card");
        const img = memCard.querySelector(".cover, .thumb");
        openMemoryFlow(id, img, showTitle);
        return;
      }

      // open a moment from the timeline
      const row = e.target.closest(".moment-row");
      if (row) { openMomentFlow(row.dataset.id, row.querySelector(".moment-thumb")); return; }

      // back from story to home
      if (e.target.closest("#btn-story-back")) { renderHome(); activateScreen("home"); return; }

      // FAB / empty-state CTA -> add-a-moment sheet
      if (e.target.closest("#btn-fab-add") || e.target.closest("#btn-add-first-moment")) {
        state.pendingTargetMemory = state.currentMemory;
        qsa("#sheet-add .sheet-option").forEach((o) => o.classList.remove("is-selected"));
        openSheet("#sheet-add");
        return;
      }

      // sheet option selection
      const opt = e.target.closest(".sheet-option");
      if (opt) {
        const kind = opt.dataset.kind;
        qsa("#sheet-add .sheet-option").forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        setTimeout(() => {
          closeSheet("#sheet-add");
          if (kind === "photo") {
            setTimeout(() => openCreate(state.pendingTargetMemory), T("slow"));
          } else {
            const label = kind.charAt(0).toUpperCase() + kind.slice(1);
            setTimeout(() => showToast(label + " capture — this prototype focuses on the Photo flow"), T("slow"));
          }
        }, 220);
        return;
      }

      // create screen
      if (e.target.closest("#btn-create-back")) {
        activateScreen("story");
        return;
      }
      if (e.target.closest("#btn-save-moment")) { attemptSave(); return; }
      if (e.target.closest("#btn-try-again")) { qs("#error-panel").classList.remove("show"); attemptSave(); return; }
      if (e.target.closest("#btn-keep-editing")) { qs("#error-panel").classList.remove("show"); return; }

      // moment detail
      if (e.target.closest("#btn-md-close")) { closeMomentFlow(); return; }
      if (e.target.closest("#btn-meaningful")) {
        const memory = MEMORIES[state.currentMemory];
        const moment = memory.moments.find((m) => m.id === state.currentMomentId);
        if (!moment) return;
        moment.meaningful = !moment.meaningful;
        const btn = qs("#btn-meaningful");
        btn.classList.toggle("is-on", moment.meaningful);
        btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
        const row = qs(`.moment-row[data-id="${moment.id}"] .m-title`);
        if (row) row.innerHTML = (moment.meaningful ? '<span class="meaningful-dot">♥</span>' : "") + moment.title;
        return;
      }
      const tab = e.target.closest(".md-tab");
      if (tab) {
        qsa(".md-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        qsa(".md-tab-panel").forEach((p) => { p.style.display = p.dataset.panel === tab.dataset.tab ? "block" : "none"; });
        return;
      }
      if (e.target.closest("#btn-audio-play")) {
        const memory = MEMORIES[state.currentMemory];
        const moment = memory.moments.find((m) => m.id === state.currentMomentId);
        if (!moment) return;
        if (state.audio.playing) pauseAudio(); else startAudio(moment.duration);
        return;
      }
      if (e.target.closest("#btn-video-play")) {
        const memory = MEMORIES[state.currentMemory];
        const moment = memory.moments.find((m) => m.id === state.currentMomentId);
        if (!moment) return;
        if (state.video.playing) stopVideo(); else startVideo(moment.duration);
        return;
      }

      // remove flow
      if (e.target.closest("#btn-remove-moment")) {
        const memory = MEMORIES[state.currentMemory];
        const moment = memory.moments.find((m) => m.id === state.currentMomentId);
        if (!moment) return;
        qs("#remove-target-name").textContent = moment.title;
        openSheet("#sheet-remove");
        return;
      }
      if (e.target.closest("#btn-remove-cancel")) { closeSheet("#sheet-remove"); return; }
      if (e.target.closest("#btn-remove-confirm")) {
        closeSheet("#sheet-remove");
        setTimeout(() => {
          closeMomentFlow((moment) => {
            if (moment) removeMomentRow(MEMORIES[state.currentMemory], moment.id);
          });
        }, T("slow"));
        return;
      }

      // backdrop tap dismisses whatever is open
      if (e.target.id === "backdrop") {
        if (state.openSheetId) closeSheet(state.openSheetId);
        else closeMomentFlow();
        return;
      }

      // demo controls
      if (e.target.closest("#ctrl-restart")) { location.reload(); return; }
      if (e.target.closest("#ctrl-loading")) {
        activateScreen("loading");
        setTimeout(() => { renderHome(); activateScreen("home"); playHomeEntrance(); }, 1100);
        return;
      }
      if (e.target.closest("#ctrl-empty")) {
        state.currentMemory = "new-memory";
        renderStory(MEMORIES["new-memory"]);
        activateScreen("story");
        qs("#story-scroll").scrollTop = 0;
        return;
      }
      const toggleError = e.target.closest("#toggle-error");
      if (toggleError) { state.simulateError = !state.simulateError; toggleError.classList.toggle("on", state.simulateError); return; }
      const toggleReduced = e.target.closest("#toggle-reduced");
      if (toggleReduced) {
        state.motionReduced = !state.motionReduced;
        toggleReduced.classList.toggle("on", state.motionReduced);
        qs("#phone").dataset.motion = state.motionReduced ? "reduced" : "normal";
        return;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
