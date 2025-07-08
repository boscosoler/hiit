// Default settings
const DEFAULTS = {
  high: 20,
  low: 10,
  rounds: 5
};

let settings = { ...DEFAULTS };
let state = {
  mode: 'high', // 'high' or 'low'
  timeLeft: settings.high,
  roundsLeft: settings.rounds,
  running: false,
  timerId: null
};

const timerEl = document.getElementById('timer');
const modeLabelEl = document.getElementById('mode-label');
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const roundsLeftEl = document.getElementById('rounds-left');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const highInput = document.getElementById('high-input');
const lowInput = document.getElementById('low-input');
const roundsInput = document.getElementById('rounds-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const beepSound = document.getElementById('beep-sound');

function loadSettings() {
  const saved = localStorage.getItem('hiit-settings');
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }
}

function saveSettings() {
  localStorage.setItem('hiit-settings', JSON.stringify(settings));
}

function updateUI() {
  timerEl.textContent = formatTime(state.timeLeft);
  modeLabelEl.textContent = state.mode === 'high' ? 'Alta Intensidad' : 'Baja Intensidad';
  roundsLeftEl.textContent = `Rondas restantes: ${state.roundsLeft}`;
  playPauseBtn.textContent = state.running ? '⏸️' : '▶️';
  document.body.classList.toggle('high', state.mode === 'high');
  document.body.classList.toggle('low', state.mode === 'low');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', state.mode === 'high' ? '#ff4d4d' : '#4dff88');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function switchMode() {
  state.mode = state.mode === 'high' ? 'low' : 'high';
  state.timeLeft = settings[state.mode];
  if (state.mode === 'high') {
    state.roundsLeft--;
    if (state.roundsLeft <= 0) {
      stopTimer();
      state.roundsLeft = 0;
      updateUI();
      return;
    }
  }
  beepSound.currentTime = 0;
  beepSound.play();
  updateUI();
}

function tick() {
  if (!state.running) return;
  if (state.timeLeft > 0) {
    state.timeLeft--;
    updateUI();
  } else {
    switchMode();
  }
}

function startTimer() {
  if (state.running) return;
  state.running = true;
  playPauseBtn.textContent = '⏸️';
  state.timerId = setInterval(tick, 1000);
}

function stopTimer() {
  state.running = false;
  playPauseBtn.textContent = '▶️';
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

function resetTimer() {
  stopTimer();
  state.mode = 'high';
  state.timeLeft = settings.high;
  state.roundsLeft = settings.rounds;
  updateUI();
}

playPauseBtn.addEventListener('click', () => {
  if (state.running) {
    stopTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', resetTimer);

settingsBtn.addEventListener('click', () => {
  highInput.value = settings.high;
  lowInput.value = settings.low;
  roundsInput.value = settings.rounds;
  settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
  settings.high = Math.max(1, parseInt(highInput.value, 10));
  settings.low = Math.max(1, parseInt(lowInput.value, 10));
  settings.rounds = Math.max(1, parseInt(roundsInput.value, 10));
  saveSettings();
  resetTimer();
  settingsModal.classList.add('hidden');
});

// Modal close on outside click
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add('hidden');
  }
});

// PWA: Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// On load
loadSettings();
resetTimer();
updateUI(); 