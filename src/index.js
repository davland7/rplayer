export default class RPlayer {
  constructor() {
    this.audio = null;
    this.volumeStep = 0.1;
  }

  attachMedia(audioElement) {
    this.audio = audioElement;
  }

  rewind(seconds = 10) {
    if (!this.audio) throw new Error("No audio element attached.");
    if (this.audio.duration && this.audio.currentTime >= seconds) {
      this.audio.currentTime -= seconds;
    } else {
      this.audio.currentTime = 0;
    }
  }

  volumeUp() {
    if (!this.audio) throw new Error("No audio element attached.");
    let newVolume = Math.min(this.audio.volume + this.volumeStep, 1.0);
    this.audio.volume = parseFloat(newVolume.toFixed(2));
  }

  volumeDown() {
    if (!this.audio) throw new Error("No audio element attached.");
    let newVolume = Math.max(this.audio.volume - this.volumeStep, 0.0);
    this.audio.volume = parseFloat(newVolume.toFixed(2));
  }

  mute() {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.muted = !this.audio.muted;
  }

  stop(forceClear = false) {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.pause();
    this.audio.currentTime = 0;
    if (forceClear) {
      this.audio.src = "";
    }
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
    const cleanUrl = url.toLowerCase().split("?")[0];
    return cleanUrl.endsWith(".m3u8") || cleanUrl.endsWith(".m3u");
  }

  static isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  togglePlay() {
    if (!this.audio) throw new Error("No audio element attached.");
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  toggleMute() {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.muted = !this.audio.muted;
  }

  get isPlaying() {
    if (!this.audio) return false;
    return !this.audio.paused;
  }

  get isMuted() {
    if (!this.audio) return false;
    return this.audio.muted;
  }
}
