import e from "hls.js";
class r extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = this.isAppleDevice() ? 1 : parseFloat(localStorage.getItem(this.key) || "0.2");
  }
  async playSrc(t) {
    const l = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), e instanceof Object && e.isSupported() && !this.supportsHls() && l ? (this.hls = new e(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((s) => {
        var i;
        (i = this.hls) == null || i.on(e.Events.MANIFEST_PARSED, () => {
          s();
        });
      })) : (this.src = t, await new Promise((s) => {
        this.addEventListener("loadedmetadata", () => {
          s();
        });
      }));
      try {
        await this.play();
      } catch (s) {
        console.error("Error on play", s);
      }
    }
  }
  mute() {
    this.muted = !this.muted;
  }
  stop() {
    this.pause(), this.currentTime = 0, this.hls && (this.hls.destroy(), this.hls = null);
  }
  /**
   * @param {number} secondes
   */
  rewind(t) {
    this.currentTime -= t;
  }
  upVolume() {
    !this.isAppleDevice() && this.volume < 1 && (this.volume = parseFloat((this.volume + 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString()));
  }
  downVolume() {
    !this.isAppleDevice() && this.volume > 0.1 ? (this.volume = parseFloat((this.volume - 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString())) : this.isAppleDevice() || (this.volume = 0, localStorage.setItem(this.key, "0"));
  }
  /**
   * @returns {boolean}
   */
  get isHls() {
    return e instanceof Object && this.hls !== null && this.hls instanceof e;
  }
  /**
   * @returns {string | undefined}
   */
  get url() {
    return this.isHls ? this.hls.url : this.src;
  }
  /**
   * @returns {boolean}
   */
  get playing() {
    return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
  }
  /**
   * @returns {boolean}
   */
  supportsHls() {
    return !!(this.canPlayType("application/vnd.apple.mpegURL") || this.canPlayType("audio/mpegurl"));
  }
  /**
   * @returns {boolean}
   */
  isAppleDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  /**
   * @param {string} src
   * @returns
   */
  isPaused(t) {
    return this.currentTime > 0 && !this.playing && this.url === t;
  }
}
export {
  r as default
};
