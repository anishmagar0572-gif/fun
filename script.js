const introPanel = document.getElementById('introPanel');
const successPanel = document.getElementById('successPanel');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const letterEl = document.getElementById('letter');
const romanticImage = document.getElementById('romanticImage');
const confettiLayer = document.getElementById('confettiLayer');
const burstLayer = document.getElementById('burstLayer');
const musicToggle = document.getElementById('musicToggle');
const masterVolume = document.getElementById('masterVolume');
const yesAudio = document.getElementById('yesAudio');

let audioContext;
let musicEnabled = true;
let musicStarted = false;
let noPositions = 0;

const loveLetter = [
  'From the first time I saw you,',
  'you made my days brighter.',
  'Thank you for being the most beautiful part of my life.',
  'I hope this is just the beginning of our story.',
  'I love you forever. ❤️',
].join('\n');

// Create soft placeholder artwork for the romantic image and gallery slides.
function createPlaceholderImage(label, index) {
  const colors = [
    ['#ffb4c9', '#ff5e9a'],
    ['#ffd7a8', '#ff8c82'],
    ['#ffc9d7', '#ff6f91'],
    ['#f8d2ff', '#ff9ac8'],
    ['#ffdbb3', '#ff738d'],
    ['#ffd7e6', '#ff4f82'],
    ['#ffefc6', '#ff8a98'],
    ['#ffe3ec', '#ff6f9c'],
  ];
  const [c1, c2] = colors[index % colors.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)" />
      <circle cx="220" cy="200" r="120" fill="rgba(255,255,255,0.4)" />
      <circle cx="580" cy="180" r="90" fill="rgba(255,255,255,0.25)" />
      <path d="M380 180c30-74 116-84 150-20 22 43-12 97-72 111-72 16-104-33-78-91z" fill="white" opacity="0.55" />
      <text x="50%" y="88%" text-anchor="middle" font-size="34" font-family="Pacifico, cursive" fill="#7e2744">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// (Floating hearts and sparkles removed per request.)

function createConfetti() {
  const colors = ['#ff5e9a', '#ff7ea8', '#ffffff', '#ff3d71', '#ffd1de'];
  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-20px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    confettiLayer.appendChild(piece);
  }
  setTimeout(() => {
    confettiLayer.innerHTML = '';
  }, 4000);
}

function createBurst() {
  for (let i = 0; i < 16; i += 1) {
    const burst = document.createElement('div');
    burst.className = 'heart-burst-piece';
    burst.textContent = '💗';
    const angle = (i / 16) * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    burst.style.setProperty('--x', `${x}px`);
    burst.style.setProperty('--y', `${y}px`);
    burst.style.left = '50%';
    burst.style.top = '50%';
    burst.style.animationDelay = `${Math.random() * 0.05}s`;
    burstLayer.appendChild(burst);
  }
  setTimeout(() => {
    burstLayer.innerHTML = '';
  }, 1100);
}

function moveNoButton(button) {
  const shiftX = (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 60);
  const shiftY = (Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 30);
  button.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(${Math.max(0.92, 1 - noPositions * 0.04)})`;
  noPositions += 1;
  // Show a playful popup GIF near the No button when it moves
  try {
    showNoPopup(button);
  } catch (err) {
    // ignore
  }
}

function showNoPopup(button) {
  const src = 's.gif';
  const img = document.createElement('img');
  img.src = src;
  img.className = 'no-popup';
  img.style.opacity = '0';
  document.body.appendChild(img);

  // Position the popup above the button if possible
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top - 6; // slightly above the button
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;

  // Force a reflow then animate in
  // eslint-disable-next-line no-unused-expressions
  img.offsetWidth;
  img.style.opacity = '1';

  // Remove after animation completes
  setTimeout(() => {
    img.style.opacity = '0';
    setTimeout(() => img.remove(), 400);
  }, 900);
}

function showSuccess() {
  introPanel.classList.add('is-hidden');
  successPanel.classList.remove('hidden');
  requestAnimationFrame(() => successPanel.classList.add('is-visible'));
  createBurst();
  createConfetti();
  setRomanticImage();
  typeLetter();
  startMusic();
}

function setRomanticImage() {
  // Replace placeholder with the provided `v.gif` asset
  romanticImage.src = 'v.gif';
}

function typeLetter() {
  let index = 0;
  letterEl.textContent = '';
  const typingInterval = setInterval(() => {
    if (index < loveLetter.length) {
      letterEl.textContent += loveLetter[index];
      index += 1;
    } else {
      clearInterval(typingInterval);
    }
  }, 45);
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  audioContext = new AudioCtx();
  const masterGain = audioContext.createGain();
  masterGain.gain.value = Number(masterVolume ? masterVolume.value : 0.05) || 0.05;
  masterGain.connect(audioContext.destination);
  // expose for the volume slider
  window.masterGain = masterGain;

  const notes = [261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66];
  let noteIndex = 0;

  function playNote(note, duration, delay = 0) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note, audioContext.currentTime + delay);
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + delay + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
  }

  function playSequence() {
    if (!musicEnabled) return;
    const note = notes[noteIndex % notes.length];
    playNote(note, 0.7, 0);
    noteIndex += 1;
    setTimeout(playSequence, 840);
  }

  audioContext.resume().then(() => playSequence());
  updateMusicButton();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (!audioContext) {
    startMusic();
    return;
  }
  if (musicEnabled) {
    audioContext.resume();
  } else {
    audioContext.suspend();
  }
  updateMusicButton();
}

function updateMusicButton() {
  musicToggle.textContent = musicEnabled ? '🔊' : '🔈';
}

yesBtn.addEventListener('click', () => {
  // Play the provided audio file (kung.mp3) when Yes is clicked.
  if (yesAudio) {
    try {
      yesAudio.currentTime = 0;
      yesAudio.play().catch(() => {});
    } catch (e) {
      // ignore play errors
    }
  }
  showSuccess();
});

noBtn.addEventListener('mouseenter', () => moveNoButton(noBtn));
noBtn.addEventListener('mousemove', () => moveNoButton(noBtn));
noBtn.addEventListener('click', (event) => {
  event.preventDefault();
  moveNoButton(noBtn);
});
noBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  moveNoButton(noBtn);
});

musicToggle.addEventListener('click', toggleMusic);

// Master volume slider controls both generated music and audio element playback volume
if (masterVolume) {
  masterVolume.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    try {
      if (window.masterGain) window.masterGain.gain.value = v;
    } catch (err) {}
    try {
      if (yesAudio) yesAudio.volume = v;
    } catch (err) {}
  });
}

window.addEventListener('load', () => {
  createHearts();
  createSparkles();
  updateMusicButton();
  // No intro overlay: page starts directly.
});
