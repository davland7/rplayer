// scripts.js - RPlayer Demo
// Interactive RPlayer demo with localStorage history

// Using CDN version via window.RPlayer (loaded in index.html)
const RPlayer = window.RPlayer;

/* -------------------- Sélecteurs DOM -------------------- */
const audioEl = document.getElementById('audio');
const btnPlay = document.getElementById('togglePlay');
const btnVolumeUp = document.getElementById('volumeUp');
const btnVolumeDown = document.getElementById('volumeDown');
const btnMute = document.getElementById('toggleMute');
const btnRewind = document.getElementById('rewind');
const btnStop = document.getElementById('stop');

const input = document.getElementById('urlInput');
const list = document.getElementById('urlList');

const badgeIos = document.getElementById('badge-ios');
const badgeHls = document.getElementById('badge-hls');
const badgeHlsSupport = document.getElementById('badge-hlsSupport');
const badgePlayback = document.getElementById('badge-playback');
const badgeVolume = document.getElementById('badge-volume');
const badgeTime = document.getElementById('badge-time');

const equalizer = document.getElementById('equalizer');

/* -------------------- Constantes -------------------- */
const HISTORY_KEY = 'rplayer:history';
const VOLUME_KEY = 'rplayer:volume';
const REWIND_SECONDS = 10;
const MAX_HISTORY = 10;

/* -------------------- Instance RPlayer -------------------- */
const player = new RPlayer();
player.attachMedia(audioEl);

/* Cache for supportsHls (called once) */
const supportsHls = (() => {
  try {
    return player.supportsHls();
  } catch {
    return false;
  }
})();

/* -------------------- Helpers UI -------------------- */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
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
  [btnPlay, btnMute, btnStop, btnRewind].forEach(btn => {
    setDisabled(btn, !hasUrl);
  });

  // Volume buttons always disabled on iOS
  setDisabled(btnVolumeUp, !hasUrl || isIos);
  setDisabled(btnVolumeDown, !hasUrl || isIos);
}

function updatePlayButton({ loading = false } = {}) {
  if (!btnPlay) return;

  const playing = player.isPlaying;

  // Loading state overrides play/pause visuals
  btnPlay.classList.toggle('mini-radio__play--loading', loading);
  btnPlay.classList.toggle('mini-radio__play--pause', !loading && playing);
  btnPlay.classList.toggle('mini-radio__play--play', !loading && !playing);

  if (loading) {
    btnPlay.setAttribute('aria-busy', 'true');
    btnPlay.setAttribute('aria-label', 'Loading');
    btnPlay.setAttribute('title', 'Loading');
    btnPlay.setAttribute('aria-pressed', 'false');
    return;
  }

  btnPlay.removeAttribute('aria-busy');
  btnPlay.setAttribute('aria-pressed', String(playing));
  btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  btnPlay.setAttribute('title', playing ? 'Pause' : 'Play');
}

function updateMuteButton() {
  const muted = player.isMuted;
  btnMute.setAttribute('aria-pressed', String(muted));
  btnMute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
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

/* -------------------- URL Management Functions -------------------- */
function updateUrl(url) {
  const newUrl = window.location.pathname + '?url=' + encodeURIComponent(url);
  window.history.pushState({ streamUrl: url }, '', newUrl);
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
function getUrls() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const urls = stored ? JSON.parse(stored) : [];
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
}

function saveUrl(url) {
  if (!isValidUrl(url)) return;
  let urls = getUrls();
  // Remove URL if it already exists (to move it to top)
  urls = urls.filter(u => u !== url);
  // Add to top
  urls.unshift(url);
  if (urls.length > MAX_HISTORY) urls.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(urls));
  renderList();
}

function removeUrl(urlToDelete) {
  const urls = getUrls();
  const isFirstUrl = urls[0] === urlToDelete;

  // If removing the first URL (currently playing), stop everything
  if (isFirstUrl) {
    player.stop(true);
    setPlaybackState('stopped');
    updatePlayButton();
    updateControlsEnabled();
    updateBadges('');
    input.value = '';
  }

  const filtered = urls.filter(u => u !== urlToDelete);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
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
      if (confirm('Delete this URL from history?')) {
        removeUrl(url);
        toast('URL removed from history', 'success');
      }
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
function loadUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);

  if (!isValidUrl(url)) {
    toast('Invalid URL', 'error');
    updateBadges('');
    return;
  }

  updateBadges(url);
  updateMediaSession(url);
  updateUrl(url);
  audioEl.src = url;
  audioEl.load();
  saveUrl(url);
  updateControlsEnabled();
}

async function loadAndPlayUrl(rawUrl) {
  loadUrl(rawUrl);

  try {
    await audioEl.play();
  } catch (err) {
    toast('Playback blocked by browser (user action required)', 'error');
    setIndicator(badgePlayback, 'bad');
  }
}

/* -------------------- Media controls -------------------- */
// Skip media session handlers on iOS (uses native controls)
if (!RPlayer.isIos() && 'mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    audioEl.play();
    updatePlayButton();
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    audioEl.pause();
    updatePlayButton();
  });
}

/* -------------------- Playback state -------------------- */
function setPlaybackState(state) {
  const isLoading = state === 'loading';
  updatePlayButton({ loading: isLoading });

   // Stop equalizer animation while loading or not playing
  if (equalizer) {
    if (isLoading || state !== 'playing') {
      equalizer.classList.remove('playing');
    }
  }

  // Update playback badge
  const playbackBadgeState = state === 'playing' ? 'ok' : isLoading ? 'loading' : state === 'paused' ? 'loading' : 'bad';
  setIndicator(badgePlayback, playbackBadgeState);
}

/* -------------------- Audio element events -------------------- */
audioEl.addEventListener('loadstart', () => {
  // Only show loading if we're trying to play (not paused)
  if (!audioEl.paused) setPlaybackState('loading');
});
audioEl.addEventListener('canplay', () => {
  // If we loaded but didn't start playing, show ready state with play button
  if (audioEl.paused && audioEl.src) {
    setPlaybackState('stopped');
  }
  updateControlsEnabled();
});
audioEl.addEventListener('waiting', () => {
  // Don't switch to loading if already playing (common on iOS with HLS)
  if (!player.isPlaying) setPlaybackState('loading');
});
audioEl.addEventListener('stalled', () => {
  // Don't switch to loading if already playing (common on iOS with HLS)
  if (!player.isPlaying) setPlaybackState('loading');
});
audioEl.addEventListener('playing', () => {
  setPlaybackState('playing');
  if (equalizer) equalizer.classList.add('playing');
});
audioEl.addEventListener('pause', () => {
  // If audio was stopped (currentTime reset to 0), show stopped (red), else paused (orange)
  setPlaybackState(audioEl.currentTime === 0 ? 'stopped' : 'paused');
  if (equalizer) equalizer.classList.remove('playing');
});
audioEl.addEventListener('ended', () => {
  setPlaybackState('stopped');
  if (equalizer) equalizer.classList.remove('playing');
});
audioEl.addEventListener('volumechange', () => {
  updateMuteButton();
  updateVolumeBadge();
  try {
    localStorage.setItem(VOLUME_KEY, String(audioEl.volume));
  } catch {}
});
audioEl.addEventListener('timeupdate', updateTimeBadge);
audioEl.addEventListener('loadedmetadata', () => {
  updateTimeBadge();
  updateControlsEnabled();
});
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

/* -------------------- Input and list events -------------------- */
// list is always visible; no focus-based rendering

input.addEventListener('input', () => {
  validateInput();
  updateBadges(input.value);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = input.value.trim();
    if (val && isValidUrl(val)) {
      const normalized = normalizeUrl(val);
      input.value = normalized;
      // Only load if URL is different from current
      if (normalized !== audioEl.src) {
        loadAndPlayUrl(val);
      }
    }
  }
});

/* -------------------- Browser Back Button Handler -------------------- */
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.streamUrl) {
    input.value = e.state.streamUrl;
    loadAndPlayUrl(e.state.streamUrl);
  }
});

/* -------------------- Initialization -------------------- */
(function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Restore persisted volume if any
  const storedVol = parseFloat(localStorage.getItem(VOLUME_KEY));
  const isIos = RPlayer.isIos();

  if (Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1) {
    audioEl.volume = storedVol;
  } else {
    // On iOS, set volume to 1.0 by default to show 100% in badge
    audioEl.volume = isIos ? 1.0 : 0.8;
  }
  updateMuteButton();
  updateBadges(audioEl.src);
  updateVolumeBadge();
  updateTimeBadge();
  setPlaybackState(audioEl.paused ? 'stopped' : 'playing');
  updatePlayButton(); // Call after setPlaybackState to ensure correct classes
  updateControlsEnabled();
  renderList();

  // Check for URL parameter in query string
  const params = new URLSearchParams(window.location.search);
  const rawUrl = params.get('url');
  if (rawUrl) {
    const decodedUrl = decodeURIComponent(rawUrl);
    if (isValidUrl(decodedUrl)) {
      input.value = normalizeUrl(decodedUrl);
      setPlaybackState('loading');
      loadUrl(decodedUrl);
    }
  }
})();
