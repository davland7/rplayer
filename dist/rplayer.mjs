import e from "hls.js";
class o extends Audio {
  constructor() {
    super();
    const t = "rplayer-volume";
    this.hls = null, localStorage.hasOwnProperty(t) ? this.volume = +localStorage.getItem(t) : this.volume = 0.2, this.onvolumechange = () => {
      localStorage.setItem(t, this.volume.toString());
    };
  }
  async playSrc(t) {
    const h = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), h ? e.isSupported() && (this.hls = new e(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((s) => {
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
    t >= 0 && t <= 1 && (this.volume = Math.round(t * 10) / 10);
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
    return this.hls !== null && this.hls instanceof e;
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
