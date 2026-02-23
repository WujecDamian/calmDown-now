// ─── Breathing Techniques ────────────────────────────────────────────────────
const TECHNIQUES = [
  {
    name: "Box Breathing",
    phases: [4, 4, 4, 4],
    labels: ["Inhale", "Hold", "Exhale", "Hold"],
    description: "Navy SEAL technique. Equal counts of inhale, hold, exhale and hold. Reduces stress and sharpens focus.",
  },
  {
    name: "4-7-8",
    phases: [4, 7, 8, 0],
    labels: ["Inhale", "Hold", "Exhale", ""],
    description: "Dr. Weil's relaxation method. Extended hold and long exhale activates the parasympathetic nervous system.",
  },
  {
    name: "Coherent",
    phases: [5, 0, 5, 0],
    labels: ["Inhale", "", "Exhale", ""],
    description: "5-5 breathing maximises heart rate variability. Ideal for daily stress management and emotional balance.",
  },
  {
    name: "Triangle",
    phases: [4, 4, 4, 0],
    labels: ["Inhale", "Hold", "Exhale", ""],
    description: "Three-phase breath. Gentle and rhythmic — great for beginners or winding down before sleep.",
  },
  {
    name: "Relaxing 2-1-4",
    phases: [2, 1, 4, 0],
    labels: ["Inhale", "Hold", "Exhale", ""],
    description: "Short inhale with an extended exhale signals safety to the nervous system. Fast-acting stress relief.",
  },
  {
    name: "Physiological Sigh",
    phases: [2, 1, 6, 0],
    labels: ["Double Inhale", "Pause", "Long Exhale", ""],
    description: "Andrew Huberman's fast reset. The double-inhale re-inflates alveoli; the extended exhale rapidly reduces heart rate.",
  },
];

// ─── State ───────────────────────────────────────────────────────────────────
let currentTechIdx = 0;
let sessionMinutes  = 5;
let sessionRemaining = 0;
let phaseIdx        = 0;
let phaseRemaining  = 0;
let running         = false;
let ticker          = null;

// ─── DOM ─────────────────────────────────────────────────────────────────────
const orb          = document.getElementById('orb');
const phaseLabel   = document.getElementById('phase-label');
const phaseCount   = document.getElementById('phase-count');
const sessionTimer = document.getElementById('session-timer');
const btnMain      = document.getElementById('btn-main');
const btnReset     = document.getElementById('btn-reset');
const techStrip    = document.getElementById('technique-strip');
const techDesc     = document.getElementById('technique-desc');

// ─── Build technique buttons ─────────────────────────────────────────────────
TECHNIQUES.forEach((t, i) => {
  const btn = document.createElement('button');
  btn.className = 'technique-btn' + (i === 0 ? ' active' : '');
  btn.textContent = t.name;
  btn.addEventListener('click', () => {
    if (running) return;
    currentTechIdx = i;
    document.querySelectorAll('.technique-btn').forEach((b, j) => b.classList.toggle('active', j === i));
    updateDesc();
    resetState();
  });
  techStrip.appendChild(btn);
});

// ─── Duration buttons ─────────────────────────────────────────────────────────
document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (running) return;
    sessionMinutes = parseInt(btn.dataset.minutes);
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.toggle('active', b === btn));
    resetState();
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(sec) {
  return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
}
function tech() { return TECHNIQUES[currentTechIdx]; }

function activePhases() {
  return tech().phases.map((d,i)=>({dur:d,idx:i})).filter(p=>p.dur>0);
}

function applyPhase() {
  const dur = tech().phases[phaseIdx] + 's';
  if (phaseIdx === 0) {
    setCSSVar('--phase-duration', dur);
    setCSSVar('--phase-ease', 'cubic-bezier(0.45,0.05,0.55,0.95)');
    setCSSVar('--orb-scale', '1.7');
  } else if (phaseIdx === 2) {
    setCSSVar('--phase-duration', dur);
    setCSSVar('--phase-ease', 'cubic-bezier(0.45,0.05,0.55,0.95)');
    setCSSVar('--orb-scale', '1.0');
  } else {
    setCSSVar('--phase-duration', '0.05s');
    setCSSVar('--phase-ease', 'linear');
  }
}

function setCSSVar(name, val) {
  document.documentElement.style.setProperty(name, val);
}

function updatePhaseUI() {
  phaseLabel.textContent = tech().labels[phaseIdx] || '';
  phaseCount.textContent = phaseRemaining + 's';
}

function nextPhase() {
  const active = activePhases();
  const pos = active.findIndex(p => p.idx === phaseIdx);
  const next = active[(pos + 1) % active.length];
  phaseIdx = next.idx;
  phaseRemaining = next.dur;
  applyPhase();
  updatePhaseUI();
}

function updateDesc() {
  techDesc.textContent = tech().description;
}

function resetState() {
  sessionRemaining = sessionMinutes * 60;
  phaseIdx         = 0;
  phaseRemaining   = tech().phases[0];
  sessionTimer.textContent = fmt(sessionRemaining);
  phaseLabel.textContent   = 'Ready';
  phaseCount.textContent   = '';
  setCSSVar('--phase-duration', '1s');
  setCSSVar('--phase-ease', 'ease-in-out');
  setCSSVar('--orb-scale', '1.0');
  orb.classList.add('idle');
}

// ─── Main tick ────────────────────────────────────────────────────────────────
function tick() {
  sessionRemaining--;
  if (sessionRemaining <= 0) { finish(); return; }
  sessionTimer.textContent = fmt(sessionRemaining);
  phaseRemaining--;
  if (phaseRemaining <= 0) { nextPhase(); }
  else { phaseCount.textContent = phaseRemaining + 's'; }
}

function start() {
  running = true;
  orb.classList.remove('idle');
  btnMain.textContent = 'Pause';
  btnMain.classList.add('running');
  btnReset.style.display = 'flex';
  applyPhase();
  updatePhaseUI();
  ticker = setInterval(tick, 1000);
}

function pause() {
  running = false;
  clearInterval(ticker);
  btnMain.textContent = 'Resume';
  btnMain.classList.remove('running');
  setCSSVar('--phase-duration', '0.05s');
  phaseLabel.textContent = 'Paused';
  phaseCount.textContent = '';
}

function finish() {
  clearInterval(ticker);
  running = false;
  sessionTimer.textContent = '0:00';
  phaseLabel.textContent   = 'Complete';
  phaseCount.textContent   = '✦';
  btnMain.textContent      = 'Begin';
  btnMain.classList.remove('running');
  setCSSVar('--phase-duration', '2s');
  setCSSVar('--orb-scale', '1.0');
  orb.classList.add('idle');
  btnReset.style.display = 'flex';
}

function reset() {
  clearInterval(ticker);
  running = false;
  btnMain.textContent = 'Begin';
  btnMain.classList.remove('running');
  btnReset.style.display = 'none';
  resetState();
}

// ─── Events ──────────────────────────────────────────────────────────────────
btnMain.addEventListener('click', () => {
  if (!running) {
    if (sessionRemaining <= 0) resetState();
    start();
  } else {
    pause();
  }
});
btnReset.addEventListener('click', reset);

// ─── Init ─────────────────────────────────────────────────────────────────────
updateDesc();
resetState();
