// docs/scripts.js - RPlayer Demo
const RPlayer = globalThis.RPlayer;

class StreamManager {
  static HISTORY_KEY = "rplayer:history";
  static MAX_HISTORY = 10;

  static isValidUrl(url) {
    if (!url?.trim()) return false;
    const normalized = this.normalizeUrl(url);
    try {
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  }

  static normalizeUrl(url) {
    const trimmed = (url || "").trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
  }

  static getUrls() {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      const urls = stored ? JSON.parse(stored) : [];
      return Array.isArray(urls) ? urls : [];
    } catch {
      return [];
    }
  }

  static saveUrl(url) {
    if (!this.isValidUrl(url)) return this.getUrls();

    const normalized = this.normalizeUrl(url);
    let urls = this.getUrls();
    urls = urls.filter((u) => u !== normalized);
    urls.unshift(normalized);

    if (urls.length > this.MAX_HISTORY) {
      urls.pop();
    }

    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(urls));
    } catch (e) {
      console.warn("Impossible de sauvegarder l'URL dans localStorage:", e);
    }

    return urls;
  }

  static removeUrl(urlToDelete) {
    let urls = this.getUrls();
    urls = urls.filter((u) => u !== urlToDelete);

    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(urls));
    } catch (e) {
      console.warn("Impossible de mettre à jour localStorage:", e);
    }

    return urls;
  }
}

/* -------------------- DOM Selectors -------------------- */
const audioEl = document.getElementById("audio");
const btnPlay = document.getElementById("togglePlay");
const btnVolumeUp = document.getElementById("volumeUp");
const btnVolumeDown = document.getElementById("volumeDown");
const btnMute = document.getElementById("toggleMute");
const btnRewind = document.getElementById("rewind");
const btnStop = document.getElementById("stop");

const input = document.getElementById("urlInput");
const list = document.getElementById("urlList");

const badgeIos = document.getElementById("badge-ios");
const badgeHls = document.getElementById("badge-hls");
const badgeHlsSupport = document.getElementById("badge-hlsSupport");
const badgePlayback = document.getElementById("badge-playback");
const badgeVolume = document.getElementById("badge-volume");
const badgeTime = document.getElementById("badge-time");

const equalizer = document.getElementById("equalizer");

/* -------------------- Constants -------------------- */
const VOLUME_KEY = "rplayer:volume";
const REWIND_SECONDS = 10;

/* -------------------- RPlayer Instance -------------------- */
const player = new RPlayer();
player.attachMedia(audioEl);

const isIos = RPlayer.isIos();
const supportsHls = (() => {
  try {
    return RPlayer.supportsHls();
  } catch {
    return false;
  }
})();

/* -------------------- UI Helpers -------------------- */
function toast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;

  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function setIndicator(el, state) {
  if (!el) return;
  el.classList.remove("ok", "bad", "loading");
  if (state) el.classList.add(state);
}

function setDisabled(el, disabled) {
  if (!el) return;
  el.disabled = disabled;
  el.setAttribute("aria-disabled", String(disabled));
}

function updateControlsEnabled() {
  const hasUrl = !!audioEl.currentSrc && audioEl.readyState !== 0;

  [btnPlay, btnMute, btnStop, btnRewind].forEach((btn) => {
    setDisabled(btn, !hasUrl);
  });

  setDisabled(btnVolumeUp, !hasUrl || isIos);
  setDisabled(btnVolumeDown, !hasUrl || isIos);
}

function updatePlayButton({ loading = false } = {}) {
  if (!btnPlay) return;

  const playing = player.isPlaying;

  btnPlay.classList.toggle("mini-radio__play--loading", loading);
  btnPlay.classList.toggle("mini-radio__play--pause", !loading && playing);
  btnPlay.classList.toggle("mini-radio__play--play", !loading && !playing);

  if (loading) {
    btnPlay.setAttribute("aria-busy", "true");
    btnPlay.setAttribute("aria-label", "Loading");
    btnPlay.setAttribute("title", "Loading");
    btnPlay.setAttribute("aria-pressed", "false");
    return;
  }

  btnPlay.removeAttribute("aria-busy");
  btnPlay.setAttribute("aria-pressed", String(playing));
  btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  btnPlay.setAttribute("title", playing ? "Pause" : "Play");
}

function updateMuteButton() {
  const muted = player.isMuted;
  btnMute.setAttribute("aria-pressed", String(muted));
  btnMute.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  btnMute.textContent = muted ? "Unmute" : "Mute";
}

function updateBadges(url) {
  setIndicator(badgeIos, isIos ? "ok" : "bad");
  setIndicator(badgeHlsSupport, supportsHls ? "ok" : "bad");
  setIndicator(badgeHls, RPlayer.isHls(url) ? "ok" : "bad");
}

function updateVolumeBadge() {
  if (!badgeVolume) return;
  const pct = Math.round(audioEl.volume * 100);
  badgeVolume.textContent = audioEl.muted ? "Muted" : `Volume ${pct}%`;
}

function updateUrl(url) {
  try {
    const currentUrl = new URL(globalThis.location);

    if (url) {
      currentUrl.searchParams.set("url", url);
      globalThis.history.pushState(
        { streamUrl: url },
        "",
        currentUrl.toString(),
      );
    } else {
      currentUrl.searchParams.delete("url");
      globalThis.history.replaceState({}, "", currentUrl.toString());
    }
  } catch (error) {
    console.warn("Failed to update URL:", error);
  }
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "--:--";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function updateTimeBadge() {
  if (!badgeTime) return;
  const current = audioEl.currentTime || 0;
  const hasDuration = Number.isFinite(audioEl.duration) && audioEl.duration > 0;
  const currStr = formatTime(current);
  badgeTime.textContent = hasDuration
    ? `${currStr} / ${formatTime(audioEl.duration)}`
    : currStr;
}

/* -------------------- History & Input Management -------------------- */
function removeUrl(urlToDelete) {
  const urls = StreamManager.getUrls();
  const isFirstUrl = urls[0] === urlToDelete;

  if (isFirstUrl) {
    player.stop(true);
    setPlaybackState("stopped");
    updatePlayButton();
    updateControlsEnabled();
    updateBadges("");
    input.value = "";
    updateUrl("");
  }

  StreamManager.removeUrl(urlToDelete);
  renderList();
  input.focus();
}

function validateInput() {
  const val = input.value.trim();
  input.classList.toggle("invalid", val && !StreamManager.isValidUrl(val));
}

function renderList() {
  const urls = StreamManager.getUrls();
  list.innerHTML = "";
  list.classList.remove("hidden");

  urls.forEach((url) => {
    const li = document.createElement("li");

    const btnUrl = document.createElement("button");
    btnUrl.className = "btn btn-url";
    btnUrl.textContent = url;
    btnUrl.type = "button";
    btnUrl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      input.value = url;
      validateInput();
      loadAndPlayUrl(url);
    });

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn-delete";
    btnDelete.innerHTML = "&times;";
    btnDelete.type = "button";
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete this URL from history?")) {
        removeUrl(url);
        toast("URL removed from history", "success");
      }
    });

    li.appendChild(btnUrl);
    li.appendChild(btnDelete);
    list.appendChild(li);
  });
}

/* -------------------- Media Session -------------------- */
function updateMediaSession(url) {
  if (!("mediaSession" in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: url,
    artist: "RPlayer III",
    album: "Mini Radio",
    artwork: [
      { src: "/images/icon64.png", sizes: "64x64", type: "image/png" },
      { src: "/images/icon128.png", sizes: "128x128", type: "image/png" },
      { src: "/images/icon256.png", sizes: "256x256", type: "image/png" },
    ],
  });
}

/* -------------------- Audio load and play -------------------- */
function loadUrl(rawUrl) {
  const url = StreamManager.normalizeUrl(rawUrl);

  if (!StreamManager.isValidUrl(url)) {
    toast("Invalid URL", "error");
    updateBadges("");
    return;
  }

  updateBadges(url);
  updateMediaSession(url);
  updateUrl(url);
  audioEl.src = url;
  audioEl.load();
  StreamManager.saveUrl(url);
  renderList();
  updateControlsEnabled();
}

async function loadAndPlayUrl(rawUrl) {
  loadUrl(rawUrl);

  try {
    await player.togglePlay();
  } catch {
    toast("Playback blocked by browser (user action required)", "error");
    setIndicator(badgePlayback, "bad");
  }
}

/* -------------------- Playback state -------------------- */
function setPlaybackState(state) {
  const isLoading = state === "loading";
  updatePlayButton({ loading: isLoading });

  if (equalizer) {
    equalizer.classList.toggle("playing", state === "playing");
  }

  const badgeState =
    state === "playing" ? "ok" : state === "loading" ? "loading" : "bad";
  setIndicator(badgePlayback, badgeState);
}

/* -------------------- Audio element events -------------------- */
audioEl.addEventListener("loadstart", () => {
  if (!audioEl.paused && audioEl.readyState < 3) {
    setPlaybackState("loading");
  }
});
audioEl.addEventListener("canplay", () => {
  if (audioEl.paused && audioEl.src) {
    setPlaybackState("stopped");
  }
  updateControlsEnabled();
});
audioEl.addEventListener("waiting", () => {
  if (player.isPlaying) setPlaybackState("loading");
});
audioEl.addEventListener("stalled", () => {
  if (player.isPlaying) setPlaybackState("loading");
});
audioEl.addEventListener("playing", () => {
  setPlaybackState("playing");
});
audioEl.addEventListener("pause", () => {
  setPlaybackState(audioEl.currentTime === 0 ? "stopped" : "paused");
});
audioEl.addEventListener("ended", () => {
  setPlaybackState("stopped");
  updateTimeBadge();
});
audioEl.addEventListener("volumechange", () => {
  updateMuteButton();
  updateVolumeBadge();
  try {
    localStorage.setItem(VOLUME_KEY, String(audioEl.volume));
  } catch {}
});
audioEl.addEventListener("timeupdate", updateTimeBadge);
audioEl.addEventListener("loadedmetadata", () => {
  updateTimeBadge();
  updateControlsEnabled();
});
audioEl.addEventListener("durationchange", updateTimeBadge);
audioEl.addEventListener("emptied", () => {
  updateControlsEnabled();
});

/* -------------------- Controls & Handlers -------------------- */
if (!isIos && "mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => player.togglePlay());
  navigator.mediaSession.setActionHandler("pause", () => player.togglePlay());
}

btnPlay.addEventListener("click", async () => {
  try {
    await player.togglePlay();
  } catch {
    toast("Playback blocked by browser (user action required)", "error");
  }
});

btnVolumeUp.addEventListener("click", () => {
  if (player.isMuted) player.toggleMute();
  player.volumeUp();
});

btnVolumeDown.addEventListener("click", () => player.volumeDown());
btnMute.addEventListener("click", () => player.toggleMute());
btnRewind.addEventListener("click", () => player.rewind(REWIND_SECONDS));
btnStop.addEventListener("click", () => player.stop(false));

input.addEventListener("input", () => {
  validateInput();
  updateBadges(input.value);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = input.value.trim();
    if (val && StreamManager.isValidUrl(val)) {
      const normalized = StreamManager.normalizeUrl(val);
      input.value = normalized;
      if (normalized !== audioEl.src) {
        loadAndPlayUrl(val);
      }
    }
  }
});

globalThis.addEventListener("popstate", (e) => {
  if (e.state && e.state.streamUrl) {
    input.value = e.state.streamUrl;
    loadAndPlayUrl(e.state.streamUrl);
  }
});

/* -------------------- Network Auto-Reconnect (WiFi -> LTE) -------------------- */
let wasPlayingBeforeNetworkDrop = false;

globalThis.addEventListener("offline", () => {
  wasPlayingBeforeNetworkDrop = player.isPlaying;
  if (wasPlayingBeforeNetworkDrop) {
    setPlaybackState("loading");
    toast("Connexion perdue. En attente du réseau...", "error");
  }
});

globalThis.addEventListener("online", () => {
  if (wasPlayingBeforeNetworkDrop && input.value) {
    toast("Réseau rétabli. Reprise de la lecture...", "info");
    setTimeout(() => {
      loadAndPlayUrl(input.value);
    }, 1000);
    wasPlayingBeforeNetworkDrop = false;
  }
});

audioEl.addEventListener("error", () => {
  const err = audioEl.error;
  if (err && err.code === 2) {
    console.warn("Erreur réseau détectée sur le flux audio.");
    if (navigator.onLine) {
      toast("Coupure du flux. Reconnexion en cours...", "info");
      setPlaybackState("loading");
      setTimeout(() => {
        if (input.value) loadAndPlayUrl(input.value);
      }, 2000);
    } else {
      wasPlayingBeforeNetworkDrop = true;
      setPlaybackState("loading");
    }
  }
});

/* -------------------- Initialization -------------------- */
(function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const storedVol = Number.parseFloat(localStorage.getItem(VOLUME_KEY));
  if (Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1) {
    audioEl.volume = storedVol;
  } else {
    audioEl.volume = isIos ? 1 : 0.8;
  }

  updateMuteButton();
  updateBadges(audioEl.src);
  updateVolumeBadge();
  updateTimeBadge();
  setPlaybackState(audioEl.paused ? "stopped" : "playing");
  updateControlsEnabled();
  renderList();

  const params = new URLSearchParams(globalThis.location.search);
  const rawUrl = params.get("url");
  if (rawUrl) {
    const decodedUrl = decodeURIComponent(rawUrl);
    if (StreamManager.isValidUrl(decodedUrl)) {
      input.value = StreamManager.normalizeUrl(decodedUrl);
      setPlaybackState("loading");
      loadUrl(decodedUrl);
    }
  }
})();
