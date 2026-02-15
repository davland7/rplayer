export default class RPlayer {
  audio = null;
  volumeStep = 0.1;

  attachMedia(audioElement) {
    this.audio = audioElement;
  }

  #requireAudio() {
    if (!this.audio) throw new Error("No audio element attached.");
    return this.audio;
  }

  rewind(seconds = 10) {
    const audio = this.#requireAudio();
    if (audio.duration && audio.currentTime >= seconds) {
      audio.currentTime -= seconds;
    } else {
      audio.currentTime = 0;
    }
  }

  volumeUp() {
    const audio = this.#requireAudio();
    const newVolume = Math.min(audio.volume + this.volumeStep, 1);
    audio.volume = Number.parseFloat(newVolume.toFixed(2));
  }

  volumeDown() {
    const audio = this.#requireAudio();
    const newVolume = Math.max(audio.volume - this.volumeStep, 0);
    audio.volume = Number.parseFloat(newVolume.toFixed(2));
  }

  mute() {
    return this.toggleMute();
  }

  stop(forceClear = false) {
    const audio = this.#requireAudio();
    audio.pause();
    audio.currentTime = 0;
    if (forceClear) {
      audio.src = "";
    }
  }

  togglePlay() {
    const audio = this.#requireAudio();
    if (audio.paused) {
      return audio.play();
    }
    audio.pause();
  }

  toggleMute() {
    const audio = this.#requireAudio();
    audio.muted = !audio.muted;
  }

  get isPlaying() {
    if (!this.audio) return false;
    return !this.audio.paused;
  }

  get isMuted() {
    if (!this.audio) return false;
    return this.audio.muted;
  }

  static supportsHls() {
    try {
      const audio = document.createElement('audio');
      return audio.canPlayType("application/vnd.apple.mpegurl") !== "";
    } catch {
      return false;
    }
  }

  static isHls(url) {
    if (!url || typeof url !== "string") return false;
    const lowerUrl = url.toLowerCase();

    const pathWithoutQuery = lowerUrl.split("?")[0].split("#")[0];
    if (pathWithoutQuery.endsWith(".m3u8") || pathWithoutQuery.endsWith(".m3u")) {
      return true;
    }

    return lowerUrl.includes("/hls/") || lowerUrl.includes("m3u8");
  }

  static isIos() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    // iPadOS 13+ reports as macOS — detect via touch support
    return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  }
}
