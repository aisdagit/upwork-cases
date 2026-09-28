(function () {
  "use strict";

  const input = document.getElementById("notes-input");
  const charCount = document.getElementById("char-count");
  const btnGenerate = document.getElementById("btn-generate");
  const btnLabel = btnGenerate.querySelector(".btn__label");

  const errorInline = document.getElementById("error-inline");
  const btnTryAgain = document.getElementById("btn-try-again");
  const btnEditText = document.getElementById("btn-edit-text");

  const resultSection = document.getElementById("result-section");
  const resultSkeleton = document.getElementById("result-skeleton");
  const resultContent = document.getElementById("result-content");

  const outTitle = document.getElementById("out-title");
  const outSummary = document.getElementById("out-summary");
  const outKeyPoints = document.getElementById("out-keypoints");
  const outNextSteps = document.getElementById("out-nextsteps");

  const btnCopy = document.getElementById("btn-copy");
  const copyLabel = document.getElementById("copy-label");

  let status = "empty"; // empty | ready | generating | success | error | edited
  let hasSucceededOnce = false;
  let copyResetTimer = null;

  function updateCharCount() {
    const n = input.value.length;
    charCount.textContent = n === 1 ? "1 character" : n + " characters";
  }

  function refreshButtonState() {
    const hasText = input.value.trim().length > 0;

    if (status === "generating") {
      btnGenerate.disabled = true;
      btnGenerate.classList.add("is-loading");
      btnLabel.textContent = "Generating...";
      return;
    }

    btnGenerate.classList.remove("is-loading");
    btnGenerate.disabled = !hasText;

    if (!hasText) {
      status = "empty";
      btnLabel.textContent = "Generate";
    } else if (status === "edited") {
      btnLabel.textContent = "Generate Again";
    } else {
      btnLabel.textContent = "Generate";
    }
  }

  input.addEventListener("input", () => {
    updateCharCount();

    if (hasSucceededOnce && status !== "generating") {
      status = "edited";
    } else if (status !== "generating" && status !== "error") {
      status = input.value.trim().length > 0 ? "ready" : "empty";
    }

    if (status === "error" && input.value.trim().length > 0) {
      // user started editing after an error; drop the error banner
      hideError();
      status = hasSucceededOnce ? "edited" : "ready";
    }

    refreshButtonState();
  });

  function hideError() {
    errorInline.hidden = true;
  }

  function showError() {
    status = "error";
    errorInline.hidden = false;
    btnGenerate.disabled = true;
    btnGenerate.classList.remove("is-loading");
  }

  function showSkeleton() {
    resultSection.hidden = false;
    resultSkeleton.hidden = false;
    resultContent.hidden = true;
  }

  function showResult(data) {
    resultSkeleton.hidden = true;
    resultContent.hidden = false;

    outTitle.textContent = data.title;
    outSummary.textContent = data.summary;

    renderList(outKeyPoints, data.keyPoints, "No clear key points could be found in the notes.");
    renderList(outNextSteps, data.nextSteps, "No clear next steps could be found in the notes.");
  }

  function renderList(el, items, emptyText) {
    el.innerHTML = "";
    if (!items || items.length === 0) {
      el.classList.add("result__list--empty");
      const li = document.createElement("li");
      li.textContent = emptyText;
      el.appendChild(li);
      return;
    }
    el.classList.remove("result__list--empty");
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      el.appendChild(li);
    });
  }

  function runGenerate() {
    const text = input.value.trim();
    if (!text) return;

    hideError();
    status = "generating";
    refreshButtonState();
    showSkeleton();

    const delay = 900 + Math.random() * 600;

    setTimeout(() => {
      try {
        const shouldFail = /force error/i.test(text) || Math.random() < 0.08;
        if (shouldFail) {
          throw new Error("simulated failure");
        }

        const data = structureNotes(text);
        showResult(data);
        hasSucceededOnce = true;
        status = "success";
        refreshButtonState();
      } catch (err) {
        resultSection.hidden = true;
        showError();
      }
    }, delay);
  }

  btnGenerate.addEventListener("click", runGenerate);
  btnTryAgain.addEventListener("click", runGenerate);

  btnEditText.addEventListener("click", () => {
    hideError();
    status = hasSucceededOnce ? "edited" : "ready";
    refreshButtonState();
    input.focus();
  });

  btnCopy.addEventListener("click", async () => {
    const text = buildPlainTextOutput();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // fallback for environments without clipboard permission
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    copyLabel.textContent = "Copied";
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      copyLabel.textContent = "Copy";
    }, 1800);
  });

  function buildPlainTextOutput() {
    const lines = [];
    lines.push(outTitle.textContent);
    lines.push("");
    lines.push("Summary");
    lines.push(outSummary.textContent);
    lines.push("");
    lines.push("Key Points");
    Array.from(outKeyPoints.children).forEach((li) => lines.push("- " + li.textContent));
    lines.push("");
    lines.push("Next Steps");
    Array.from(outNextSteps.children).forEach((li) => lines.push("- " + li.textContent));
    return lines.join("\n");
  }

  // ---- Simulated AI: heuristic note structuring (no invented content) ----

  const NEXT_STEP_PATTERNS = [
    /\bneed(s)?\s+to\b/i,
    /\bneeds?\s+work\b/i,
    /\bshould\b/i,
    /\bmust\b/i,
    /\bhave\s+to\b/i,
    /\bplan(s|ning)?\s+to\b/i,
    /\bgoing\s+to\b/i,
    /\bwill\s+\w+/i,
    /\btodo\b/i,
    /\bto-do\b/i,
    /\bnext\s+step/i,
    /\baction\s+item/i,
    /\bconfirm\b/i,
    /\bfinish\b/i,
    /\bfollow\s*up\b/i,
    /\breview\b/i,
    /\bbegin\b/i,
    /\bstart\b/i,
    /\blet'?s\b/i,
  ];

  function splitLines(text) {
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  function isBulletLine(line) {
    return /^([-*•]|\d+[.)])\s+/.test(line);
  }

  function stripBullet(line) {
    return line.replace(/^([-*•]|\d+[.)])\s+/, "").trim();
  }

  function splitSentences(text) {
    return text
      .replace(/\s+/g, " ")
      .trim()
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function cleanSentence(s) {
    return s.replace(/\s+/g, " ").trim().replace(/\s+([,.;:!?])/g, "$1");
  }

  function toTitleCandidate(sentence) {
    let s = cleanSentence(sentence).replace(/[.!?]+$/, "");
    const words = s.split(" ");
    if (words.length > 9) {
      s = words.slice(0, 9).join(" ");
    }
    if (s.length === 0) return "Notes Summary";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function structureNotes(rawText) {
    const lines = splitLines(rawText);
    const bulletLines = lines.filter(isBulletLine).map(stripBullet);
    let nonBulletLines = lines.filter((l) => !isBulletLine(l));

    // --- Title ---
    let title;
    const firstLine = lines[0] || "";
    const looksLikeHeading =
      firstLine.length > 0 &&
      firstLine.length <= 60 &&
      !isBulletLine(firstLine) &&
      !/[.!?]$/.test(firstLine) &&
      lines.length > 1;

    if (looksLikeHeading) {
      title = toTitleCandidate(firstLine);
      // Exclude the heading line from the prose used for the summary/points below,
      // otherwise it silently fuses with the next sentence (no terminal punctuation to split on).
      nonBulletLines = nonBulletLines.slice(1);
    }

    const proseText = nonBulletLines.join(" ");
    let sentences = splitSentences(proseText);

    // If there's no prose at all, fall back to treating every line as a sentence source.
    if (sentences.length === 0 && lines.length > 0) {
      sentences = (looksLikeHeading ? lines.slice(1) : lines).map(cleanSentence).filter(Boolean);
    }

    if (!looksLikeHeading) {
      title = sentences.length > 0 ? toTitleCandidate(sentences[0]) : "Notes Summary";
    }

    // --- Summary ---
    const summarySource = sentences.length > 0 ? sentences : bulletLines;
    const summarySentences = summarySource.slice(0, 3).map(cleanSentence);
    let summary = summarySentences.join(" ");
    if (summary.length > 420) {
      summary = summary.slice(0, 417).trim() + "...";
    }
    if (!summary) {
      summary = "Not enough detail in the notes to generate a summary.";
    }

    // --- Key Points ---
    let keyPointSource = bulletLines.length > 0 ? bulletLines : sentences;
    let keyPoints = keyPointSource
      .map(cleanSentence)
      .filter((s) => s.length >= 8)
      .slice(0, 5);

    // Avoid duplicating the exact title/summary sentence as the only key point.
    if (keyPoints.length === 1 && keyPoints[0] === cleanSentence(sentences[0] || "")) {
      keyPoints = [];
    }

    // --- Next Steps ---
    const candidatePool = [...bulletLines, ...sentences].map(cleanSentence);
    const seen = new Set();
    const nextSteps = [];
    candidatePool.forEach((s) => {
      const isAction = NEXT_STEP_PATTERNS.some((re) => re.test(s));
      if (isAction && !seen.has(s.toLowerCase()) && s.length >= 6) {
        seen.add(s.toLowerCase());
        nextSteps.push(s.replace(/[.!?]+$/, "."));
      }
    });

    return {
      title,
      summary,
      keyPoints,
      nextSteps: nextSteps.slice(0, 6),
    };
  }

  updateCharCount();
  refreshButtonState();
})();
