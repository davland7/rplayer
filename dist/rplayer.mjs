import i from "hls.js";
class o extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = parseFloat(localStorage.getItem(this.key) || "0.2");
  }
  async playSrc(t) {
    const e = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), e ? i.isSupported() && (this.hls = new i(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((s) => {
        var h;
        (h = this.hls) == null || h.on(i.Events.MANIFEST_PARSED, () => {
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
  upVolume() {
    const t = this.volume + 0.1;
    this.setVolume(t);
  }
  downVolume() {
    const t = this.volume - 0.1;
    this.setVolume(t);
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
      const e = Math.round(t * 10) / 10;
      this.volume = e;
      const s = new Event("volumechange");
      this.dispatchEvent(s), localStorage.setItem(this.key, e.toString());
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
