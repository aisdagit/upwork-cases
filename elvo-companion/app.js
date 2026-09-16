(function () {
  'use strict';

  var childRoot = document.getElementById('mode-child');
  var parentRoot = document.getElementById('mode-parent');
  var modeBtnChild = document.getElementById('mode-btn-child');
  var modeBtnParent = document.getElementById('mode-btn-parent');

  var state = {
    mode: 'child',
    interest: null,
    style: null
  };

  // ---------- Mode switching ----------
  function setMode(mode) {
    state.mode = mode;
    if (mode === 'child') {
      childRoot.classList.remove('hidden');
      parentRoot.classList.add('hidden');
      modeBtnChild.classList.add('active');
      modeBtnParent.classList.remove('active');
      modeBtnChild.setAttribute('aria-selected', 'true');
      modeBtnParent.setAttribute('aria-selected', 'false');
    } else {
      childRoot.classList.add('hidden');
      parentRoot.classList.remove('hidden');
      modeBtnParent.classList.add('active');
      modeBtnChild.classList.remove('active');
      modeBtnParent.setAttribute('aria-selected', 'true');
      modeBtnChild.setAttribute('aria-selected', 'false');
    }
  }

  modeBtnChild.addEventListener('click', function () {
    setMode('child');
    showScreen(childRoot, 'onboard-welcome');
  });
  modeBtnParent.addEventListener('click', function () {
    setMode('parent');
    showScreen(parentRoot, 'parent-dashboard');
  });

  // ---------- Screen navigation ----------
  function showScreen(root, name) {
    var screens = root.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.toggle('active', screens[i].getAttribute('data-screen') === name);
    }
    var active = root.querySelector('.screen.active');
    if (active) active.scrollTop = 0;
    onScreenShown(name);
  }

  function findRootFor(name) {
    if (childRoot.querySelector('[data-screen="' + name + '"]')) return childRoot;
    if (parentRoot.querySelector('[data-screen="' + name + '"]')) return parentRoot;
    return childRoot;
  }

  document.addEventListener('click', function (e) {
    var next = e.target.closest('[data-next]');
    if (next) {
      showScreen(childRoot, next.getAttribute('data-next'));
      return;
    }
    var back = e.target.closest('[data-back]');
    if (back) {
      showScreen(childRoot, back.getAttribute('data-back'));
      return;
    }
    var nextParent = e.target.closest('[data-next-parent]');
    if (nextParent) {
      showScreen(parentRoot, nextParent.getAttribute('data-next-parent'));
      return;
    }
    var backParent = e.target.closest('[data-back-parent]');
    if (backParent) {
      showScreen(parentRoot, backParent.getAttribute('data-back-parent'));
      return;
    }
    var gotoParent = e.target.closest('[data-goto-parent]');
    if (gotoParent) {
      setMode('parent');
      showScreen(parentRoot, gotoParent.getAttribute('data-goto-parent'));
      return;
    }
  });

  document.getElementById('restart-all').addEventListener('click', function () {
    state.interest = null;
    state.style = null;
    resetOnboardingUI();
    resetVoiceSession();
    resetReturningSession();
    resetLearningMoment();
    setMode('child');
    showScreen(childRoot, 'onboard-welcome');
  });

  function onScreenShown(name) {
    if (name === 'voice-session') startVoiceSession();
    if (name === 'returning-session') startReturningSession();
    if (name === 'report-processing') startProcessing();
  }

  // ---------- Onboarding: pick chips ----------
  function wirePickGroup(gridId, groupName, onPick) {
    var grid = document.getElementById(gridId);
    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.pick-chip');
      if (!chip) return;
      var siblings = grid.querySelectorAll('.pick-chip');
      for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('selected');
      chip.classList.add('selected');
      onPick(chip.getAttribute('data-value'));
    });
  }

  wirePickGroup('interest-grid', 'interest', function (value) {
    state.interest = value;
    document.getElementById('btn-interest-continue').disabled = false;
  });

  wirePickGroup('style-grid', 'style', function (value) {
    state.style = value;
    document.getElementById('reveal-start-cta').classList.add('open');
  });

  function resetOnboardingUI() {
    document.getElementById('btn-interest-continue').disabled = true;
    document.getElementById('reveal-start-cta').classList.remove('open');
    var chips = document.querySelectorAll('.pick-chip.selected');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('selected');
  }

  // ---------- First voice session (scripted) ----------
  var voiceScript = [
    { who: 'elvo', text: "Hey Maya! What should we explore today?" },
    { who: 'maya', text: "Space! We learned about planets at school but I still don't understand why Saturn has rings." },
    { who: 'elvo', text: "That's a great question. Imagine Saturn surrounded by millions of tiny pieces of ice and rock, almost like a huge cosmic racetrack." },
    { who: 'elvo', text: "Some pieces are as small as a grain of sand, others as big as a house!" },
    { who: 'maya', text: "I have a science quiz on Friday and Saturn is the planet I keep forgetting." },
    { who: 'elvo', text: "Got it — we'll make sure Saturn sticks this time." }
  ];
  var voiceIndex = 0;
  var voiceDone = false;

  function startVoiceSession() {
    if (voiceIndex > 0 || voiceDone) return;
    document.getElementById('voice-transcript').innerHTML = '';
    updateVoiceProgress();
    setVoiceAvatarState('idle');
  }

  function resetVoiceSession() {
    voiceIndex = 0;
    voiceDone = false;
    document.getElementById('voice-transcript').innerHTML = '';
    document.getElementById('mic-btn').classList.remove('done');
    document.getElementById('waveform').classList.remove('active');
    updateVoiceProgress();
    setVoiceAvatarState('idle');
    document.getElementById('voice-state').textContent = 'Ready when you are';
  }

  function updateVoiceProgress() {
    var n = Math.min(voiceIndex, voiceScript.length);
    document.getElementById('voice-progress').textContent = 'Turn ' + n + ' of ' + voiceScript.length;
  }

  function setVoiceAvatarState(kind) {
    var ring = document.getElementById('voice-ring');
    var wave = document.getElementById('waveform');
    var stateLabel = document.getElementById('voice-state');
    ring.classList.remove('state-speaking', 'state-listening');
    wave.classList.remove('active');
    if (kind === 'speaking') {
      ring.classList.add('state-speaking');
      wave.classList.add('active');
      stateLabel.textContent = 'ELVO is speaking…';
    } else if (kind === 'listening') {
      ring.classList.add('state-listening');
      stateLabel.textContent = "Maya's turn…";
    } else if (kind === 'done') {
      stateLabel.textContent = 'Conversation complete';
    } else {
      stateLabel.textContent = 'Ready when you are';
    }
  }

  function appendBubble(container, who, text) {
    var b = document.createElement('div');
    b.className = 'bubble ' + (who === 'elvo' ? 'bubble-elvo' : 'bubble-maya');
    var tag = document.createElement('span');
    tag.className = 'bubble-tag';
    tag.textContent = who === 'elvo' ? 'ELVO' : 'Maya';
    b.appendChild(tag);
    var span = document.createElement('span');
    span.textContent = text;
    b.appendChild(span);
    container.appendChild(b);
    container.scrollTop = container.scrollHeight;
    var screen = container.closest('.screen');
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  document.getElementById('mic-btn').addEventListener('click', function () {
    if (voiceIndex >= voiceScript.length) return;
    var turn = voiceScript[voiceIndex];
    var container = document.getElementById('voice-transcript');
    setVoiceAvatarState(turn.who === 'elvo' ? 'speaking' : 'listening');
    appendBubble(container, turn.who, turn.text);
    voiceIndex++;
    updateVoiceProgress();

    if (voiceIndex >= voiceScript.length) {
      voiceDone = true;
      setTimeout(function () {
        setVoiceAvatarState('done');
        document.getElementById('mic-btn').classList.add('done');
      }, 500);
    }
  });

  // ---------- Returning session (scripted) ----------
  var returningScript = [
    { who: 'elvo', text: "Hey Maya! Your science quiz is coming up. Last time Saturn was the tricky one. Want to see if you remember why it has rings?" },
    { who: 'maya', text: "I think they're made of rocks?" },
    { who: 'elvo', text: "Exactly, rocks and lots of ice too. You remembered the important part!" },
    { who: 'elvo', text: "Since you like stories, want me to turn the planets into a quick space adventure before your quiz?" }
  ];
  var returningIndex = 0;

  function startReturningSession() {
    if (returningIndex > 0) return;
    var container = document.getElementById('returning-transcript');
    container.innerHTML = '';
    revealReturningTurn();
  }

  function resetReturningSession() {
    returningIndex = 0;
    document.getElementById('returning-transcript').innerHTML = '';
    document.getElementById('story-or-quiz').classList.add('hidden');
    document.getElementById('returning-controls').classList.remove('hidden');
    var ring = document.getElementById('ret-voice-ring');
    ring.classList.remove('state-speaking', 'state-listening');
    delete document.getElementById('btn-quiz-instead').dataset.clicked;
  }

  function revealReturningTurn() {
    var container = document.getElementById('returning-transcript');
    var ring = document.getElementById('ret-voice-ring');
    var turn = returningScript[returningIndex];
    ring.classList.remove('state-speaking', 'state-listening');
    ring.classList.add(turn.who === 'elvo' ? 'state-speaking' : 'state-listening');
    appendBubble(container, turn.who, turn.text);
    returningIndex++;

    if (returningIndex >= returningScript.length) {
      document.getElementById('returning-controls').classList.add('hidden');
      document.getElementById('story-or-quiz').classList.remove('hidden');
      ring.classList.remove('state-speaking', 'state-listening');
    }
  }

  document.getElementById('ret-mic-btn').addEventListener('click', function () {
    if (returningIndex >= returningScript.length) return;
    revealReturningTurn();
  });

  document.getElementById('btn-quiz-instead').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    if (btn.dataset.clicked) return;
    btn.dataset.clicked = '1';
    var container = document.getElementById('returning-transcript');
    appendBubble(container, 'elvo', "Sure! (Quiz mode is coming soon in the full app — let's try the story for this demo.)");
  });

  // ---------- Learning moment quiz ----------
  var quizAnswered = false;

  document.getElementById('quiz-options').addEventListener('click', function (e) {
    var opt = e.target.closest('.quiz-opt');
    if (!opt || quizAnswered) return;
    var value = opt.getAttribute('data-value');
    var feedback = document.getElementById('quiz-feedback');
    var allOpts = document.querySelectorAll('.quiz-opt');

    if (value === 'Ice and rock') {
      quizAnswered = true;
      opt.classList.add('correct');
      for (var i = 0; i < allOpts.length; i++) allOpts[i].disabled = true;
      feedback.textContent = "Correct! Looks like Saturn isn't the tricky one anymore.";
      feedback.className = 'quiz-feedback correct';
      document.getElementById('progress-pop').classList.remove('hidden');
      document.getElementById('btn-finish-session').disabled = false;
    } else {
      opt.classList.add('wrong');
      feedback.textContent = 'Not quite — think icy cosmic racetrack. Try again!';
      feedback.className = 'quiz-feedback wrong';
      setTimeout(function () { opt.classList.remove('wrong'); }, 600);
    }
  });

  function resetLearningMoment() {
    quizAnswered = false;
    var allOpts = document.querySelectorAll('.quiz-opt');
    for (var i = 0; i < allOpts.length; i++) {
      allOpts[i].disabled = false;
      allOpts[i].classList.remove('correct', 'wrong');
    }
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-feedback').className = 'quiz-feedback';
    document.getElementById('progress-pop').classList.add('hidden');
    document.getElementById('btn-finish-session').disabled = true;
  }

  // ---------- Report processing (auto-advance) ----------
  var processingTimer = null;
  function startProcessing() {
    if (processingTimer) clearTimeout(processingTimer);
    processingTimer = setTimeout(function () {
      showScreen(parentRoot, 'report-results');
    }, 1600);
  }

  document.querySelectorAll('[data-upload]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showScreen(parentRoot, 'report-processing');
    });
  });

  // ---------- init ----------
  setMode('child');
  showScreen(childRoot, 'onboard-welcome');
  showScreen(parentRoot, 'parent-dashboard');
})();
