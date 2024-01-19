import e from "hls.js";
class n extends Audio {
  // private key: string = 'rplayer-volume';
  constructor() {
    super(), this.volume = 0.2;
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
    const t = this.volume;
    this.setVolume(t + 0.1);
  }
  downVolume() {
    const t = this.volume;
    this.setVolume(t - 0.1);
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
    t >= 0 && t <= 0.5 && (this.volume = t, this.dispatchEvent(new Event("volumechange")));
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
  n as default
};
