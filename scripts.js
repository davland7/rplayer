// scripts.js - RPlayer Demo
// Interactive RPlayer demo with localStorage history

// Using CDN version via globalThis.RPlayer (loaded in index.html)
const RPlayer = globalThis.RPlayer;

/* -------------------- DOM Selectors -------------------- */
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

/* -------------------- Constants -------------------- */
const HISTORY_KEY = 'rplayer:history';
const VOLUME_KEY = 'rplayer:volume';
const REWIND_SECONDS = 10;
const MAX_HISTORY = 10;

/* -------------------- RPlayer Instance -------------------- */
const player = new RPlayer();
player.attachMedia(audioEl);

/* Cache static checks (called once) */
const isIos = RPlayer.isIos();
const supportsHls = (() => {
  try {
    return RPlayer.supportsHls();
  } catch {
    return false;
  }
})();

/* -------------------- UI Helpers -------------------- */
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
  const hasUrl = !!audioEl.currentSrc && audioEl.readyState !== 0;

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
  setIndicator(badgeIos, isIos ? 'ok' : 'bad');
  setIndicator(badgeHlsSupport, supportsHls ? 'ok' : 'bad');
  setIndicator(badgeHls, RPlayer.isHls(url) ? 'ok' : 'bad');
}

function updateVolumeBadge() {
  if (!badgeVolume) return;
  const pct = Math.round(audioEl.volume * 100);
  badgeVolume.textContent = audioEl.muted ? 'Muted' : `Volume ${pct}%`;
}

function updateUrl(url) {
  try {
    const currentUrl = new URL(globalThis.location);

    if (url) {
      currentUrl.searchParams.set('url', url);
      globalThis.history.pushState({ streamUrl: url }, '', currentUrl.toString());
    } else {
      currentUrl.searchParams.delete('url');
      globalThis.history.replaceState({}, '', currentUrl.toString());
    }
  } catch (error) {
    console.warn("Failed to update URL:", error);
  }
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
    updateUrl(''); // Clear the URL parameter from address bar
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
    await player.togglePlay();
  } catch {
    toast('Playback blocked by browser (user action required)', 'error');
    setIndicator(badgePlayback, 'bad');
  }
}

/* -------------------- Media controls -------------------- */
// Skip media session handlers on iOS (uses native controls)
if (!isIos && 'mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    player.togglePlay();
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    player.togglePlay();
  });
}

/* -------------------- Playback state -------------------- */
function setPlaybackState(state) {
  const isLoading = state === 'loading';
  updatePlayButton({ loading: isLoading });

  // Equalizer animation only when playing
  if (equalizer) {
    equalizer.classList.toggle('playing', state === 'playing');
  }

  // Update playback badge: playing=ok, loading=loading, paused/stopped=bad
  const badgeState = state === 'playing' ? 'ok' : state === 'loading' ? 'loading' : 'bad';
  setIndicator(badgePlayback, badgeState);
}

/* -------------------- Audio element events -------------------- */
audioEl.addEventListener('loadstart', () => {
  // Only show loading if actively trying to play
  if (!audioEl.paused && audioEl.readyState < 3) {
    setPlaybackState('loading');
  }
});
audioEl.addEventListener('canplay', () => {
  // If we loaded but didn't start playing, show ready state
  if (audioEl.paused && audioEl.src) {
    setPlaybackState('stopped');
  }
  updateControlsEnabled();
});
audioEl.addEventListener('waiting', () => {
  // Only show loading if actively playing (not paused)
  if (player.isPlaying) {
    setPlaybackState('loading');
  }
});
audioEl.addEventListener('stalled', () => {
  // Only show loading if actively playing (not paused)
  if (player.isPlaying) {
    setPlaybackState('loading');
  }
});
audioEl.addEventListener('playing', () => {
  setPlaybackState('playing');
});
audioEl.addEventListener('pause', () => {
  // If audio was stopped (currentTime reset to 0), show stopped (red), else paused (orange)
  setPlaybackState(audioEl.currentTime === 0 ? 'stopped' : 'paused');
});
audioEl.addEventListener('ended', () => {
  setPlaybackState('stopped');
  updateTimeBadge();
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
audioEl.addEventListener('emptied', () => {
  // Fired after src is cleared and load() called
  updateControlsEnabled();
});

/* -------------------- Button controls -------------------- */
btnPlay.addEventListener('click', async () => {
  try {
    await player.togglePlay();
  } catch {
    toast('Playback blocked by browser (user action required)', 'error');
  }
});

btnVolumeUp.addEventListener('click', () => {
  if (player.isMuted) player.toggleMute();
  player.volumeUp();
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
  // Audio events will handle UI updates
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
globalThis.addEventListener('popstate', (e) => {
  if (e.state && e.state.streamUrl) {
    input.value = e.state.streamUrl;
    loadAndPlayUrl(e.state.streamUrl);
  }
});

/* -------------------- Initialization -------------------- */
(function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Restore persisted volume if any
  const storedVol = Number.parseFloat(localStorage.getItem(VOLUME_KEY));

  if (Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1) {
    audioEl.volume = storedVol;
  } else {
    // On iOS, set volume to 1 by default to show 100% in badge
    audioEl.volume = isIos ? 1 : 0.8;
  }
  updateMuteButton();
  updateBadges(audioEl.src);
  updateVolumeBadge();
  updateTimeBadge();
  setPlaybackState(audioEl.paused ? 'stopped' : 'playing');
  updateControlsEnabled();
  renderList();

  // Check for URL parameter in query string
  const params = new URLSearchParams(globalThis.location.search);
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
