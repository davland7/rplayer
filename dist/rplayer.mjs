import i from "hls.js";
class o extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = parseFloat(localStorage.getItem(this.key) ?? "0.2");
  }
  async playSrc(t) {
    const s = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), s ? i.isSupported() && (this.hls = new i(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((e) => {
        var h;
        (h = this.hls) == null || h.on(i.Events.MANIFEST_PARSED, () => {
          e();
        });
      })) : (this.src = t, await new Promise((e) => {
        this.addEventListener("loadedmetadata", () => {
          e();
        });
      }));
      try {
        await this.play();
      } catch (e) {
        console.error("Error on play", e);
      }
    }
  }
  mute() {
    this.muted = !this.muted;
  }
  stop() {
    this.pause(), this.currentTime = 0, this.hls && (this.hls.destroy(), this.hls = null);
  }
  upVolume() {
    this.setVolume(this.volume + 0.1);
  }
  downVolume() {
    this.setVolume(this.volume - 0.1);
  }
  /**
   * @param {number} secondes
   */
  rewind(t) {
    this.currentTime = this.currentTime - t;
  }
  /**
   * @param {number} value
   */
  setVolume(t) {
    if (t >= 0 && t <= 1) {
      const s = Math.round(t * 10) / 10;
      if (s !== this.volume) {
        this.volume = s;
        const e = new Event("volumechange");
        this.dispatchEvent(e), localStorage.setItem(this.key, s.toFixed(1));
      }
    }
  }
  /**
   * @param {string} src
   * @returns
   */
  isPaused(t) {
    return this.currentTime > 0 && !this.playing && this.url === t;
  }
  /**
   * @returns {boolean}
   */
  get isHls() {
    return this.hls !== null && this.hls instanceof i;
  }
  /**
   * @returns {string | undefined}
   */
  get url() {
    var t;
    return this.isHls ? (t = this.hls) == null ? void 0 : t.url : this.src;
  }
  /**
   * @returns {boolean}
   */
  get playing() {
    return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
  }
}
export {
  o as default
};
