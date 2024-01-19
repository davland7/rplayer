import s from "hls.js";
class o extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = parseFloat(localStorage.getItem(this.key) || "0.2");
  }
  async playSrc(t) {
    const l = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), l ? s.isSupported() && (this.hls = new s(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((e) => {
        var i;
        (i = this.hls) == null || i.on(s.Events.MANIFEST_PARSED, () => {
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
  /**
   * @param {number} secondes
   */
  rewind(t) {
    this.currentTime = this.currentTime - t;
  }
  upVolume() {
    this.volume < 0.9 && (this.volume += 0.1, localStorage.setItem("rplayer-volume", this.volume.toString()));
  }
  downVolume() {
    this.volume > 0.1 ? (this.volume -= 0.1, localStorage.setItem("rplayer-volume", this.volume.toString())) : (this.volume = 0, localStorage.setItem("rplayer-volume", "0"));
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
    return this.hls !== null && this.hls instanceof s;
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
