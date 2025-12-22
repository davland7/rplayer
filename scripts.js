// scripts.js - Mini Radio Demo
// Démo interactive de RPlayer avec gestion d'historique localStorage

// Using CDN version via window.RPlayer (loaded in index.html)
const RPlayer = window.RPlayer;

/* -------------------- Sélecteurs DOM -------------------- */
const audioEl = document.getElementById('audio');
const btnPlay = document.getElementById('tooglePlay');
const btnVolumeUp = document.getElementById('volumeUp');
const btnVolumeDown = document.getElementById('volumeDown');
const btnMute = document.getElementById('toogleMute');
const btnRewind = document.getElementById('rewind');
const btnStop = document.getElementById('stop');
const btnStopForce = document.getElementById('stopForce');

const input = document.getElementById('urlInput');
const list = document.getElementById('urlList');
const messageBox = document.getElementById('validationMessage');

const badgeIos = document.getElementById('badge-ios');
const badgeHls = document.getElementById('badge-hls');
const badgeHlsSupport = document.getElementById('badge-hlsSupport');
const badgePlayback = document.getElementById('badge-playback');
const badgeVolume = document.getElementById('badge-volume');
const badgeTime = document.getElementById('badge-time');

/* -------------------- Constantes -------------------- */
const HISTORY_KEY = 'rplayer:history';
const VOLUME_KEY = 'rplayer:volume';
const FAVORITES_KEY = 'rplayer:favorites';
const REWIND_SECONDS = 10;
const MAX_HISTORY = 10;

/* -------------------- Instance RPlayer -------------------- */
const player = new RPlayer();
player.attachMedia(audioEl);

/* Cache pour supportsHls (appelé une seule fois) */
const supportsHls = (() => {
  try {
    return player.supportsHls();
  } catch {
    return false;
  }
})();

/* -------------------- Helpers UI -------------------- */
function showMessage(text = '', type = 'info') {
  if (!messageBox) return;
  messageBox.textContent = text || '';
  messageBox.className = type ? `msg msg-${type}` : 'msg';
}

function setIndicator(el, state) {
  if (!el) return;
  el.classList.remove('ok', 'bad', 'loading');
  if (state) el.classList.add(state);
}

function setDisabled(el, disabled) {
  if (!el) return;
  el.disabled = disabled;
  el.setAttribute('aria-disabled', String(disabled));
}

function updateControlsEnabled() {
  const hasUrl = !!audioEl.src;
  const isIos = RPlayer.isIos();

  // Disable volume buttons on iOS (uses physical buttons)
  [btnPlay, btnMute, btnRewind, btnStop, btnStopForce].forEach(btn => {
    setDisabled(btn, !hasUrl);
  });

  // Volume buttons always disabled on iOS
  setDisabled(btnVolumeUp, !hasUrl || isIos);
  setDisabled(btnVolumeDown, !hasUrl || isIos);
}

function updatePlayButton() {
  const playing = player.isPlaying;
  btnPlay.setAttribute('aria-pressed', String(playing));
  // Remove only modifiers, keep base class
  btnPlay.classList.remove('mini-radio__play--play', 'mini-radio__play--pause');
  btnPlay.classList.add(playing ? 'mini-radio__play--pause' : 'mini-radio__play--play');
  btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function updateMuteButton() {
  const muted = player.isMuted;
  btnMute.setAttribute('aria-pressed', String(muted));
  btnMute.textContent = muted ? 'Unmute' : 'Mute';
}

function updateBadges(url) {
  setIndicator(badgeIos, RPlayer.isIos() ? 'ok' : 'bad');
  setIndicator(badgeHlsSupport, supportsHls ? 'ok' : 'bad');
  setIndicator(badgeHls, RPlayer.isHls(url) ? 'ok' : 'bad');
}

function updateVolumeBadge() {
  if (!badgeVolume) return;
  const pct = Math.round(audioEl.volume * 100);
  badgeVolume.textContent = audioEl.muted ? 'Muted' : `Volume ${pct}%`;
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '--:--';
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function updateTimeBadge() {
  if (!badgeTime) return;
  const current = audioEl.currentTime || 0;
  const hasDuration = Number.isFinite(audioEl.duration) && audioEl.duration > 0;
  const currStr = formatTime(current);
  badgeTime.textContent = hasDuration ? `${currStr} / ${formatTime(audioEl.duration)}` : currStr;
}

/* -------------------- URL history (localStorage) -------------------- */
function getFavoritesUrls() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Prefer url_resolved, fall back to url
    const urls = arr
      .map(item => (item?.url_resolved || item?.url || '').toString())
      .map(u => normalizeUrl(u))
      .filter(u => isValidUrl(u));
    // Deduplicate while keeping order
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

function getUrls() {
  const stored = localStorage.getItem(HISTORY_KEY);
  let urls = stored ? JSON.parse(stored) : [];
  if (!urls.length) {
    const favs = getFavoritesUrls();
    if (favs.length) {
      urls = favs.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(urls));
    }
  }
  return urls;
}

function saveUrl(url) {
  if (!isValidUrl(url)) return;
  const urls = getUrls();
  if (!urls.includes(url)) {
    urls.unshift(url);
    if (urls.length > MAX_HISTORY) urls.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(urls));
    renderList();
  }
}

function removeUrl(urlToDelete) {
  const urls = getUrls().filter(u => u !== urlToDelete);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(urls));
  renderList();
  input.focus();
}

/* -------------------- URL validation -------------------- */
function isValidUrl(url) {
  if (!url?.trim()) return false;
  const normalized = normalizeUrl(url);
  try {
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  const trimmed = (url || '').trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
}

function validateInput() {
  const val = input.value.trim();
  input.classList.toggle('invalid', val && !isValidUrl(val));
}

function renderList() {
  const urls = getUrls();
  list.innerHTML = '';
  list.classList.remove('hidden');

  urls.forEach(url => {
    const li = document.createElement('li');

    const btnUrl = document.createElement('button');
    btnUrl.className = 'btn btn-url';
    btnUrl.textContent = url;
    btnUrl.type = 'button';
    btnUrl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = url;
      validateInput();
      loadAndPlayUrl(url);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-delete';
    btnDelete.innerHTML = '&times;';
    btnDelete.type = 'button';
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      removeUrl(url);
    });

    li.appendChild(btnUrl);
    li.appendChild(btnDelete);
    list.appendChild(li);
  });
}

/* -------------------- Media Session -------------------- */
function updateMediaSession(url) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: url,
    artist: 'RPlayer III',
    album: 'Mini Radio',
    artwork: [
      { src: '/images/icon64.png', sizes: '64x64', type: 'image/png' },
      { src: '/images/icon128.png', sizes: '128x128', type: 'image/png' },
      { src: '/images/icon256.png', sizes: '256x256', type: 'image/png' }
    ]
  });
}

/* -------------------- Audio load and play -------------------- */
async function loadAndPlayUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);

  if (!isValidUrl(url)) {
    showMessage('Invalid URL', 'error');
    updateBadges('');
    return;
  }

  updateBadges(url);
  showMessage('');
  updateMediaSession(url);
  audioEl.src = url;
  saveUrl(url);
  updateControlsEnabled();

  try {
    await audioEl.play();
  } catch (err) {
    showMessage('Playback blocked by browser (user action required)', 'error');
    setIndicator(badgePlayback, 'bad');
  }
}

/* -------------------- Media controls -------------------- */
// Skip media session handlers on iOS (uses native controls)
if (!RPlayer.isIos() && 'mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    player.togglePlay();
    updatePlayButton();
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    player.togglePlay();
    updatePlayButton();
  });

  navigator.mediaSession.setActionHandler('stop', () => {
    player.stop(false);
    updatePlayButton();
    setPlaybackState('stopped');
  });

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    player.rewind(REWIND_SECONDS);
  });
}

/* -------------------- Playback state -------------------- */
function setPlaybackState(state) {
  // Remove only modifiers, keep base class mini-radio__play
  btnPlay.classList.remove('mini-radio__play--play', 'mini-radio__play--pause', 'mini-radio__play--loading');

  // Set the appropriate state class
  if (state === 'loading') {
    btnPlay.classList.add('mini-radio__play--loading');
    btnPlay.setAttribute('aria-busy', 'true');
  } else {
    btnPlay.removeAttribute('aria-busy');
    // Let updatePlayButton handle play/pause classes
  }

  const indicatorState = state === 'playing' ? 'ok' : state === 'loading' ? 'loading' : state === 'paused' ? 'loading' : 'bad';
  setIndicator(badgePlayback, indicatorState);
}

/* -------------------- Audio element events -------------------- */
audioEl.addEventListener('loadstart', () => {
  if (input.value !== '') setPlaybackState('loading');
});
audioEl.addEventListener('waiting', () => {
  if (input.value !== '') setPlaybackState('loading');
});
audioEl.addEventListener('stalled', () => {
  if (input.value !== '') setPlaybackState('loading');
});
audioEl.addEventListener('playing', () => {
  setPlaybackState('playing');
  updatePlayButton();
});
audioEl.addEventListener('pause', () => {
  // If audio was stopped (currentTime reset to 0), show stopped (red), else paused (orange)
  setPlaybackState(audioEl.currentTime === 0 ? 'stopped' : 'paused');
  updatePlayButton();
});
audioEl.addEventListener('ended', () => setPlaybackState('stopped'));
audioEl.addEventListener('volumechange', () => {
  updateMuteButton();
  updateVolumeBadge();
  try {
    localStorage.setItem(VOLUME_KEY, String(audioEl.volume));
  } catch {}
});
audioEl.addEventListener('timeupdate', updateTimeBadge);
audioEl.addEventListener('loadedmetadata', updateTimeBadge);
audioEl.addEventListener('durationchange', updateTimeBadge);
audioEl.addEventListener('ended', updateTimeBadge);

/* -------------------- Button controls -------------------- */
btnPlay.addEventListener('click', () => {
  player.togglePlay();
  updatePlayButton();
});

btnVolumeUp.addEventListener('click', () => {
  player.volumeUp();
  if (audioEl.muted && audioEl.volume > 0) {
    audioEl.muted = false;
  }
});

btnVolumeDown.addEventListener('click', () => {
  player.volumeDown();
});

btnMute.addEventListener('click', () => {
  player.toggleMute();
});

btnRewind.addEventListener('click', () => {
  player.rewind(REWIND_SECONDS);
});

btnStop.addEventListener('click', () => {
  player.stop(false);
  updatePlayButton();
  setPlaybackState('stopped');
});

btnStopForce.addEventListener('click', () => {
  player.stop(true);
  setPlaybackState('stopped');
  updatePlayButton();
  updateControlsEnabled();
  updateBadges('');
  input.value = '';
  input.focus();
});

/* -------------------- Input and list events -------------------- */
// list is always visible; no focus-based rendering

input.addEventListener('input', () => {
  validateInput();
  updateBadges(input.value);
});

input.addEventListener('blur', () => {
  const val = input.value.trim();
  if (val && isValidUrl(val)) {
    const normalized = normalizeUrl(val);
    input.value = normalized;
    // Only load if URL is different from current
    if (normalized !== audioEl.src) {
      loadAndPlayUrl(val);
    }
  }
});

/* -------------------- Initialization -------------------- */
(function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Restore persisted volume if any
  const storedVol = parseFloat(localStorage.getItem(VOLUME_KEY));
  if (Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1) {
    audioEl.volume = storedVol;
  } else {
    audioEl.volume = 0.8;
  }
  updateMuteButton();
  updateBadges(audioEl.src);
  updateVolumeBadge();
  updateTimeBadge();
  setPlaybackState(audioEl.paused ? 'stopped' : 'playing');
  updatePlayButton(); // Call after setPlaybackState to ensure correct classes
  updateControlsEnabled();
  renderList();
})();
