async function playHls(audioElement, src, onStatsUpdate, autoplay = true) {
  if (audioElement.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("Using native HLS support");
    audioElement.src = src;
    return new Promise((resolve) => {
      audioElement.addEventListener("loadedmetadata", () => {
        if (autoplay) {
          const playPromise = audioElement.play();
          if (playPromise !== void 0) {
            playPromise.catch((error) => {
              console.warn("Auto-play was prevented, user interaction may be needed", error);
            });
          }
        }
        resolve(null);
      }, { once: true });
    });
  }
  try {
    const { default: Hls } = await import("hls.js");
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Add some configuration for better performance and reliability
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        enableWorker: true,
        lowLatencyMode: true,
        // Error recovery settings
        fragLoadingMaxRetry: 5,
        manifestLoadingMaxRetry: 5,
        levelLoadingMaxRetry: 5
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Network error encountered, trying to recover", data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Media error encountered, trying to recover", data);
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error encountered, cannot recover", data);
              break;
          }
        }
      });
      if (onStatsUpdate) ;
      hls.loadSource(src);
      hls.attachMedia(audioElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          const playPromise = audioElement.play();
          if (playPromise !== void 0) {
            playPromise.catch((error) => {
              console.warn("Auto-play was prevented, user interaction may be needed", error);
            });
          }
        }
      });
      return hls;
    } else {
      throw new Error("HLS.js is not supported in this browser");
    }
  } catch (error) {
    console.error("Failed to load or initialize hls.js:", error);
    throw new Error("Failed to load or initialize HLS support: " + (error instanceof Error ? error.message : String(error)));
  }
}
async function playM3u(player, url) {
  try {
    console.log(`Fetching M3U playlist from: ${url}`);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const origin = window.location.origin;
      if (url.startsWith("/")) {
        url = origin + url;
      } else {
        url = origin + "/" + url.replace(/^\.\//, "");
      }
      console.log(`Local file detected, using absolute URL: ${url}`);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: "cors",
        credentials: "same-origin"
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Failed to fetch M3U playlist: ${response.status}`);
      }
      const content = await response.text();
      console.log(`M3U content fetched, size: ${content.length} bytes`);
      const lines = content.split("\n");
      const mediaUrls = [];
      let currentTitle = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith("#EXTINF:")) {
          const titleMatch = line.match(/#EXTINF:.*,(.+)/);
          if (titleMatch && titleMatch[1]) {
            currentTitle = titleMatch[1].trim();
          }
          continue;
        }
        if (line.startsWith("#")) continue;
        let mediaUrl = line;
        if (!line.match(/^(https?:\/\/|rtmp:\/\/|rtsp:\/\/)/i)) {
          try {
            const baseUrl = new URL(url);
            const resolvedUrl = new URL(line, baseUrl.href);
            mediaUrl = resolvedUrl.href;
          } catch (e) {
            console.warn(`Could not resolve relative URL: ${line}`, e);
          }
        }
        const isLikelyAudio = !mediaUrl.match(/\.(m3u8|mp4|mkv|avi|mov|flv|wmv|ts)$/i) || mediaUrl.match(/\.(mp3|aac|ogg|opus|wav|m4a)$/i) || mediaUrl.includes("audio") || !mediaUrl.includes("video");
        if (isLikelyAudio) {
          mediaUrls.push({
            url: mediaUrl,
            title: currentTitle || `Track ${mediaUrls.length + 1}`
          });
        }
        currentTitle = "";
      }
      console.log(`Found ${mediaUrls.length} audio URLs in playlist`);
      if (mediaUrls.length === 0) {
        throw new Error("No audio URLs found in M3U playlist");
      }
      const firstTrack = mediaUrls[0];
      console.log(`Found first entry in M3U playlist: ${firstTrack.title} (${firstTrack.url})`);
      if (typeof window !== "undefined") {
        window.__currentM3UPlaylist = mediaUrls;
        window.__currentM3UIndex = 0;
      }
      if (player instanceof HTMLAudioElement) {
        player.__trackTitle = firstTrack.title || "";
        player.__trackSource = "M3U Playlist";
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: firstTrack.title || "Unknown Track",
            artist: "RPlayer M3U",
            album: "M3U Playlist",
            artwork: [
              { src: "/images/favicon.png", sizes: "96x96", type: "image/png" },
              { src: "/images/icons-192.png", sizes: "192x192", type: "image/png" }
            ]
          });
        }
      }
      return firstTrack.url;
    } catch (error) {
      console.error("Error fetching M3U playlist:", error);
      throw new Error(`Timeout or network error fetching playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error("Error playing M3U playlist:", error);
    throw new Error(`Failed to play M3U playlist: ${error instanceof Error ? error.message : String(error)}`);
  }
}
class RPlayer extends Audio {
  /**
   * Creates a new RPlayer instance
   * @param {string} [initialSource] - Optional initial audio source to play
   */
  constructor(initialSource) {
    super();
    this.hls = null;
    this.isHls = false;
    this.lastSrc = "";
    this.errorHandlers = [];
    this.playbackHandlers = [];
    this.initializeVolume();
    this.setupEventListeners();
    if (initialSource) {
      setTimeout(() => {
        this.playSrc(initialSource).catch((error) => {
          console.error("Failed to play initial source:", error);
        });
      }, 0);
    }
  }
  /**
   * Initialize volume settings from localStorage
   * @private
   */
  initializeVolume() {
    try {
      const savedVolume = localStorage.getItem("RPlayer-volume");
      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume) && volume >= 0 && volume <= 1) {
          this.volume = volume;
        }
      }
    } catch (error) {
      console.warn("Could not retrieve volume settings from localStorage", error);
    }
  }
  /**
   * Set up event listeners for the audio element
   * @private
   */
  setupEventListeners() {
    this.addEventListener("volumechange", () => {
      try {
        localStorage.setItem("RPlayer-volume", this.volume.toString());
      } catch (error) {
        console.warn("Could not save volume settings to localStorage", error);
      }
    });
    this.addEventListener("error", (event) => {
      var _a;
      const error = new Error(`Media error: ${((_a = this.error) == null ? void 0 : _a.code) ?? "unknown"}`);
      this.errorHandlers.forEach((handler) => handler(error));
    });
    this.addEventListener("play", () => {
      this.playbackHandlers.forEach((handler) => handler("playing"));
    });
    this.addEventListener("pause", () => {
      this.playbackHandlers.forEach((handler) => handler("paused"));
    });
  }
  /**
   * Validate if the provided URL is an HLS stream.
   * @param {string | URL} url - The URL to validate.
   * @returns {boolean} True if the URL is an HLS stream, false otherwise.
   * @private
   */
  isHlsUrl(url) {
    const urlStr = url.toString();
    if (urlStr.endsWith(".m3u8")) {
      return true;
    }
    try {
      if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.pathname.endsWith(".m3u8");
      }
      return false;
    } catch (error) {
      console.warn("URL parsing failed in isHlsUrl, using fallback check:", urlStr);
      return false;
    }
  }
  /**
   * Validate if the provided URL is a standard M3U playlist.
   * @param {string | URL} url - The URL to validate.
   * @returns {boolean} True if the URL is a standard M3U playlist, false otherwise.
   * @private
   */
  isM3uUrl(url) {
    const urlStr = url.toString();
    if (urlStr.endsWith(".m3u") && !urlStr.endsWith(".m3u8")) {
      return true;
    }
    try {
      if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.pathname.endsWith(".m3u") && !parsedUrl.pathname.endsWith(".m3u8");
      }
      return false;
    } catch (error) {
      console.warn("URL parsing failed in isM3uUrl, using fallback check:", urlStr);
      return false;
    }
  }
  /**
   * Check if the current device is an iOS device.
   * @returns {boolean} True if the current device is an iOS device, false otherwise.
   * @readonly
   */
  get isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
  }
  /**
   * Validate if the current source is an HLS stream.
   * @returns {boolean} True if the current source is an HLS stream, false otherwise.
   * @readonly
   */
  get isHlsjs() {
    return this.isHls;
  }
  /**
   * Check if the audio element is currently playing.
   * @returns {boolean} True if the audio element is playing, false otherwise.
   * @readonly
   */
  get isPlaying() {
    return !this.paused;
  }
  /**
   * Get the current source URL of the audio element.
   * @returns {string} The current source URL of the audio element.
   * @readonly
   */
  get url() {
    return this.lastSrc;
  }
  /**
   * Register a handler for playback status changes
   * @param {function} handler - The function to call when playback status changes
   */
  onPlaybackStatusChange(handler) {
    this.playbackHandlers.push(handler);
  }
  /**
   * Register a handler for errors
   * @param {function} handler - The function to call when an error occurs
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }
  /**
   * Remove a previously registered playback status handler
   * @param {function} handler - The handler to remove
   */
  removePlaybackStatusHandler(handler) {
    const index = this.playbackHandlers.indexOf(handler);
    if (index !== -1) {
      this.playbackHandlers.splice(index, 1);
    }
  }
  /**
   * Remove a previously registered error handler
   * @param {function} handler - The handler to remove
   */
  removeErrorHandler(handler) {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
    }
  }
  /**
   * Play the provided audio source
   * @param {string} src - The source URL of the audio stream
   * @returns {Promise<void>} - A promise that resolves when playback has started or rejects on error
   */
  async playSrc(src) {
    console.log(`[RPlayer] playSrc appelé avec: ${src}`);
    if (src.startsWith("/") && !src.startsWith("//") && typeof window !== "undefined") {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] URL relative convertie en absolue: ${src}`);
    }
    if (this.lastSrc === src && this.paused && this.currentTime > 0) {
      try {
        console.log(`[RPlayer] Même source détectée, reprise de la lecture: ${src}`);
        await this.play();
        return;
      } catch (error) {
        console.warn("[RPlayer] Erreur lors de la reprise de la lecture, tentative de rechargement", error);
      }
    }
    try {
      this.stop();
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);
      console.log(`[RPlayer] Type de source: ${isHls ? "HLS" : isM3u ? "M3U standard" : "Direct"}`);
      let sourceType = "Direct";
      if (isHls) sourceType = "HLS";
      else if (isM3u) sourceType = "M3U standard";
      console.log(`[RPlayer] Type de source: ${sourceType}`);
      if (isHls) {
        try {
          const hlsInstance = await playHls(this, src);
          this.hls = hlsInstance;
          this.lastSrc = src;
          this.isHls = true;
          return new Promise((resolve, reject) => {
            const onPlay = () => {
              this.removeEventListener("playing", onPlay);
              this.removeEventListener("error", onError);
              resolve();
            };
            const onError = () => {
              this.removeEventListener("playing", onPlay);
              this.removeEventListener("error", onError);
              reject(new Error(`Failed to load HLS source: ${src}`));
            };
            if (!this.paused) {
              resolve();
            } else {
              this.addEventListener("playing", onPlay);
              this.addEventListener("error", onError);
            }
          });
        } catch (error) {
          console.error("Error initializing HLS playback:", error);
          throw error;
        }
      } else if (this.isM3uUrl(src)) {
        try {
          console.log(`[RPlayer] Attempting to play M3U standard playlist: ${src}`);
          const mediaUrl = await playM3u(this, src);
          console.log(`[RPlayer] URL extracted from M3U playlist: ${mediaUrl}`);
          if (mediaUrl === src) {
            throw new Error("The URL extracted from the playlist is identical to the playlist URL");
          }
          this.lastSrc = src;
          if ("mediaSession" in navigator && navigator.mediaSession) {
            let title = "Radio Station";
            try {
              const urlObj = new URL(mediaUrl);
              const pathParts = urlObj.pathname.split("/");
              const fileName = pathParts[pathParts.length - 1];
              if (fileName) {
                title = fileName.replace(/\.(mp3|aac|ogg|m4a|wav)$/i, "").replace(/[_-]/g, " ");
              }
            } catch (e) {
              console.warn("Failed to extract title from URL:", e);
            }
            navigator.mediaSession.metadata = new MediaMetadata({
              title,
              artist: "RPlayer M3U",
              album: "M3U Playlist",
              artwork: [
                { src: "/images/favicon.png", sizes: "96x96", type: "image/png" },
                { src: "/images/icons-192.png", sizes: "192x192", type: "image/png" }
              ]
            });
          }
          console.log(`[RPlayer] Redirecting to: ${mediaUrl}`);
          return this.playSrc(mediaUrl);
        } catch (error) {
          console.error("[RPlayer] Erreur lors de la lecture de la playlist M3U:", error);
          const m3uError = error instanceof Error ? error : new Error(`Échec de l'analyse de la playlist M3U: ${String(error)}`);
          this.errorHandlers.forEach((handler) => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Tentative de lecture directe: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;
        try {
          await this.play();
          console.log(`[RPlayer] Lecture directe réussie`);
          return;
        } catch (playError) {
          console.error("[RPlayer] Erreur lors de la lecture directe:", playError);
          const directError = new Error(`Échec de la lecture de la source: ${src}`);
          this.errorHandlers.forEach((handler) => handler(directError));
          throw directError;
        }
      }
    } catch (error) {
      console.error("Error playing source", error);
      this.errorHandlers.forEach((handler) => handler(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  }
  /**
   * Load a source without automatically playing it
   * This is useful for preloading sources or working with autoplay restrictions
   * @param {string} src - The source URL to load
   * @returns {Promise<void>} - A promise that resolves when the source is loaded
   */
  async loadSrc(src) {
    console.log(`[RPlayer] loadSrc appelé avec: ${src}`);
    if (src.startsWith("/") && !src.startsWith("//") && typeof window !== "undefined") {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] URL relative convertie en absolue: ${src}`);
    }
    try {
      this.stop();
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);
      let sourceType = "Direct";
      if (isHls) sourceType = "HLS";
      else if (isM3u) sourceType = "M3U standard";
      console.log(`[RPlayer] Type de source: ${sourceType}`);
      if (isHls) {
        try {
          const hlsInstance = await playHls(this, src, void 0, false);
          this.hls = hlsInstance;
          this.lastSrc = src;
          this.isHls = true;
          return Promise.resolve();
        } catch (error) {
          console.error("Error initializing HLS source:", error);
          throw error;
        }
      } else if (this.isM3uUrl(src)) {
        try {
          console.log(`[RPlayer] Attempting to load M3U standard playlist: ${src}`);
          const mediaUrl = await playM3u(this, src);
          console.log(`[RPlayer] URL extracted from M3U playlist: ${mediaUrl}`);
          if (mediaUrl === src) {
            throw new Error("The URL extracted from the playlist is identical to the playlist URL");
          }
          this.lastSrc = src;
          return this.loadSrc(mediaUrl);
        } catch (error) {
          console.error("[RPlayer] Erreur lors du chargement de la playlist M3U:", error);
          const m3uError = error instanceof Error ? error : new Error(`Échec de l'analyse de la playlist M3U: ${String(error)}`);
          this.errorHandlers.forEach((handler) => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Chargement direct sans lecture: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;
        return new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            this.removeEventListener("loadedmetadata", onLoadedMetadata);
            this.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            this.removeEventListener("loadedmetadata", onLoadedMetadata);
            this.removeEventListener("error", onError);
            const error = new Error(`Échec du chargement de la source: ${src}`);
            this.errorHandlers.forEach((handler) => handler(error));
            reject(error);
          };
          this.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
          this.addEventListener("error", onError, { once: true });
          this.load();
        });
      }
    } catch (error) {
      console.error("Error loading source", error);
      this.errorHandlers.forEach((handler) => handler(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  }
  /**
   * Stop the audio element
   * This will pause the audio, reset the current time to 0, clean up HLS resources
   * and reset internal state
   */
  stop() {
    this.pause();
    this.currentTime = 0;
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.isHls = false;
    this.playbackHandlers.forEach((handler) => handler("stopped"));
  }
  /**
   * Rewind the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to rewind
   */
  rewind(seconds) {
    this.currentTime = Math.max(this.currentTime - seconds, 0);
  }
  /**
   * Fast forward the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to fast forward
   */
  forward(seconds) {
    if (this.duration && isFinite(this.duration)) {
      this.currentTime = Math.min(this.currentTime + seconds, this.duration);
    } else {
      this.currentTime += seconds;
    }
  }
  /**
   * Increase the volume by 10%
   * The volume will not exceed 100%
   */
  upVolume() {
    this.volume = Math.min(this.volume + 0.1, 1);
    this.volume = parseFloat(this.volume.toFixed(2));
  }
  /**
   * Decrease the volume by 10%
   * The volume will not go below 0%
   */
  downVolume() {
    this.volume = Math.max(this.volume - 0.1, 0);
    this.volume = parseFloat(this.volume.toFixed(2));
  }
  /**
   * Set the volume to a specific level
   * @param {number} level - A value between 0 and 1
   */
  setVolume(level) {
    if (level < 0 || level > 1) {
      throw new Error("Volume level must be between 0 and 1");
    }
    this.volume = parseFloat(level.toFixed(2));
  }
  /**
   * Toggle the mute state of the audio element
   */
  mute() {
    this.muted = !this.muted;
  }
  /**
   * Update MediaSession metadata with current track information
   * @param title - The title of the current track
   * @param artist - The artist name
   * @param album - The album name
   */
  updateMediaSessionMetadata(title = "", artist = "RPlayer", album = "Audio Stream") {
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title || this.lastSrc || "Unknown Track",
          artist,
          album,
          artwork: [
            { src: "/images/favicon.png", sizes: "96x96", type: "image/png" },
            { src: "/images/icons-192.png", sizes: "192x192", type: "image/png" }
          ]
        });
        console.log(`[RPlayer] MediaSession metadata updated: ${title}`);
      } catch (error) {
        console.error("[RPlayer] Error updating MediaSession metadata:", error);
      }
    }
  }
  /**
   * Clean up resources when the player is no longer needed
   * This will stop any playback and release all resources
   */
  destroy() {
    this.stop();
    this.playbackHandlers.length = 0;
    this.errorHandlers.length = 0;
    if ("mediaSession" in navigator) {
      try {
        ["play", "pause", "stop", "seekforward", "seekbackward", "previoustrack", "nexttrack"].forEach((action) => {
          try {
            navigator.mediaSession.setActionHandler(action, null);
          } catch (e) {
          }
        });
      } catch (error) {
        console.warn("[RPlayer] Error clearing MediaSession handlers:", error);
      }
    }
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }
}
export {
  RPlayer as default
};
//# sourceMappingURL=rplayer.es.js.map
