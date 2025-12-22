class o {
  constructor() {
    this.audio = null, this.volumeStep = 0.1;
  }
  attachMedia(t) {
    this.audio = t;
  }
  supportsHls() {
    if (!this.audio) throw new Error("No audio element attached.");
    return this.audio.canPlayType("application/vnd.apple.mpegurl") !== "";
  }
  rewind(t = 10) {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.duration && this.audio.currentTime >= t ? this.audio.currentTime -= t : this.audio.currentTime = 0;
  }
  volumeUp() {
    if (!this.audio) throw new Error("No audio element attached.");
    let t = Math.min(this.audio.volume + this.volumeStep, 1);
    this.audio.volume = parseFloat(t.toFixed(2));
  }
  volumeDown() {
    if (!this.audio) throw new Error("No audio element attached.");
    let t = Math.max(this.audio.volume - this.volumeStep, 0);
    this.audio.volume = parseFloat(t.toFixed(2));
  }
  mute() {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.muted = !this.audio.muted;
  }
  stop(t = !1) {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.pause(), this.audio.currentTime = 0, t && (this.audio.src = "");
  }
  static isHls(t) {
    if (!t || typeof t != "string") return !1;
    const e = t.toLowerCase().split("?")[0];
    return e.endsWith(".m3u8") || e.endsWith(".m3u");
  }
  static isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  togglePlay() {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.paused ? this.audio.play() : this.audio.pause();
  }
  toggleMute() {
    if (!this.audio) throw new Error("No audio element attached.");
    this.audio.muted = !this.audio.muted;
  }
  get isPlaying() {
    return this.audio ? !this.audio.paused : !1;
  }
  get isMuted() {
    return this.audio ? this.audio.muted : !1;
  }
}
export {
  o as default
};
