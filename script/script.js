// ─── Breathing Techniques ─────────────────────────────────────────────────────
// phases: [inhale, hold, exhale, hold2]  (seconds, 0 = skip)

const TECHNIQUES = [
  {
    name: 'Box Breathing',
    phases: [4, 4, 4, 4],
    labels: ['Inhale', 'Hold', 'Exhale', 'Hold'],
    description:
      'Navy SEAL technique. Equal counts of inhale, hold, exhale and hold. Reduces stress and sharpens focus.'
  },
  {
    name: '4-7-8',
    phases: [4, 7, 8, 0],
    labels: ['Inhale', 'Hold', 'Exhale', ''],
    description:
      "Dr. Weil's relaxation method. Extended hold and long exhale activates the parasympathetic nervous system."
  },
  {
    name: 'Coherent',
    phases: [5, 0, 5, 0],
    labels: ['Inhale', '', 'Exhale', ''],
    description:
      '5-5 breathing maximises heart rate variability. Ideal for daily stress management and emotional balance.'
  },
  {
    name: 'Triangle',
    phases: [4, 4, 4, 0],
    labels: ['Inhale', 'Hold', 'Exhale', ''],
    description:
      'Three-phase breath. Gentle and rhythmic — great for beginners or winding down before sleep.'
  },
  {
    name: 'Relaxing 2-1-4',
    phases: [2, 1, 4, 0],
    labels: ['Inhale', 'Hold', 'Exhale', ''],
    description:
      'Short inhale with an extended exhale signals safety to the nervous system. Fast-acting stress relief.'
  }
]

// ─── State ──────────────────────────────────────────────────────────────────
let currentTechIdx = 0
let sessionMinutes = 5
let sessionRemaining = 0 // seconds
let phaseIdx = 0 // 0=inhale 1=hold 2=exhale 3=hold2
let phaseRemaining = 0 // seconds
let running = false
let ticker = null

// ─── DOM refs ────────────────────────────────────────────────────────────────
const orb = document.getElementById('orb')
const phaseLabel = document.getElementById('phase-label')
const phaseCount = document.getElementById('phase-count')
const sessionTimer = document.getElementById('session-timer')
const btnMain = document.getElementById('btn-main')
const btnReset = document.getElementById('btn-reset')
const techStrip = document.getElementById('technique-strip')
const techDesc = document.getElementById('technique-desc')

// ─── Build technique buttons ──────────────────────────────────────────────────
TECHNIQUES.forEach((t, i) => {
  const btn = document.createElement('button')
  btn.className = 'technique-btn' + (i === 0 ? ' active' : '')
  btn.textContent = t.name
  btn.addEventListener('click', () => {
    if (running) return
    currentTechIdx = i
    document
      .querySelectorAll('.technique-btn')
      .forEach((b, j) => b.classList.toggle('active', j === i))
    updateDesc()
    resetState()
  })
  techStrip.appendChild(btn)
})

// ─── Duration buttons ─────────────────────────────────────────────────────────
document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (running) return
    sessionMinutes = parseInt(btn.dataset.minutes)
    document
      .querySelectorAll('.dur-btn')
      .forEach(b => b.classList.toggle('active', b === btn))
    resetState()
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime (sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function currentTechnique () {
  return TECHNIQUES[currentTechIdx]
}

function getActivePhases () {
  // returns array of phase indices that have duration > 0
  return currentTechnique()
    .phases.map((d, i) => ({ dur: d, idx: i }))
    .filter(p => p.dur > 0)
}

function nextPhase () {
  const active = getActivePhases()
  const pos = active.findIndex(p => p.idx === phaseIdx)
  const next = active[(pos + 1) % active.length]
  phaseIdx = next.idx
  phaseRemaining = next.dur
  applyPhaseToOrb()
  updatePhaseUI()
}

function applyPhaseToOrb () {
  const dur = currentTechnique().phases[phaseIdx] + 's'

  if (phaseIdx === 0) {
    // Inhale → grow
    setOrbEase(dur, 'cubic-bezier(0.45, 0.05, 0.55, 0.95)')
    setOrbScale(1.7)
  } else if (phaseIdx === 2) {
    // Exhale → shrink
    setOrbEase(dur, 'cubic-bezier(0.45, 0.05, 0.55, 0.95)')
    setOrbScale(1.0)
  } else {
    // Hold → no change, just keep current scale (instant transition)
    setOrbEase('0.05s', 'linear')
    // scale stays as-is
  }
}

function setOrbScale (scale) {
  document.documentElement.style.setProperty('--orb-scale', scale)
}

function setOrbEase (duration, ease) {
  document.documentElement.style.setProperty('--phase-duration', duration)
  document.documentElement.style.setProperty('--phase-ease', ease)
}

function updatePhaseUI () {
  const t = currentTechnique()
  phaseLabel.textContent = t.labels[phaseIdx] || ''
  phaseCount.textContent = phaseRemaining + 's'
}

function updateDesc () {
  techDesc.textContent = currentTechnique().description
}

function resetState () {
  sessionRemaining = sessionMinutes * 60
  phaseIdx = 0
  phaseRemaining = currentTechnique().phases[0]
  sessionTimer.textContent = fmtTime(sessionRemaining)
  phaseLabel.textContent = 'Ready'
  phaseCount.textContent = ''
  // reset orb
  setOrbEase('1s', 'ease-in-out')
  setOrbScale(1.0)
  orb.classList.add('idle')
}

// ─── Ticker (every second) ────────────────────────────────────────────────────
function tick () {
  // Session countdown
  sessionRemaining--
  if (sessionRemaining <= 0) {
    finish()
    return
  }
  sessionTimer.textContent = fmtTime(sessionRemaining)

  // Phase countdown
  phaseRemaining--
  if (phaseRemaining <= 0) {
    nextPhase()
  } else {
    phaseCount.textContent = phaseRemaining + 's'
  }
}

function start () {
  running = true
  orb.classList.remove('idle')
  btnMain.textContent = 'Pause'
  btnMain.classList.add('running')
  btnReset.style.display = 'flex'

  // Kick off first phase visuals immediately
  applyPhaseToOrb()
  updatePhaseUI()

  ticker = setInterval(tick, 1000)
}

function pause () {
  running = false
  clearInterval(ticker)
  btnMain.textContent = 'Resume'
  btnMain.classList.remove('running')
  // freeze orb: capture current computed scale and lock it
  setOrbEase('0.05s', 'linear')
  phaseLabel.textContent = 'Paused'
  phaseCount.textContent = ''
}

function finish () {
  clearInterval(ticker)
  running = false
  sessionTimer.textContent = '0:00'
  phaseLabel.textContent = 'Done'
  phaseCount.textContent = '✦'
  btnMain.textContent = 'Begin'
  btnMain.classList.remove('running')
  setOrbEase('2s', 'ease-in-out')
  setOrbScale(1.0)
  orb.classList.add('idle')
  btnReset.style.display = 'flex'
}

function reset () {
  clearInterval(ticker)
  running = false
  btnMain.textContent = 'Begin'
  btnMain.classList.remove('running')
  btnReset.style.display = 'none'
  resetState()
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
btnMain.addEventListener('click', () => {
  if (!running) {
    // If session is finished (0), reset first
    if (sessionRemaining <= 0) resetState()
    start()
  } else {
    pause()
  }
})

btnReset.addEventListener('click', reset)

// ─── Init ─────────────────────────────────────────────────────────────────────
updateDesc()
resetState()
