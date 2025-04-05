import e from "hls.js";
class a extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = this.isIOS() ? 1 : parseFloat(localStorage.getItem(this.key) || "0.2");
  }
  async playSrc(t) {
    const o = t.indexOf(".m3u8") > 0;
    if (this.isPaused(t))
      this.play();
    else {
      this.stop(), this.src = t, typeof e < "u" && e.isSupported() && o && !this.isIOS() ? (this.hls = new e(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(t), await new Promise((s) => {
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
  /**
   * Mutes or unmutes the player.
   */
  mute() {
    this.muted = !this.muted;
  }
  /**
   * Stops the player and resets the current time.
   * If the player is using HLS, it also destroys the HLS instance.
   */
  stop() {
    this.pause(), this.currentTime = 0, this.hls && (this.hls.destroy(), this.hls = null);
  }
  /**
   * @param {number} secondes
   */
  rewind(t) {
    this.currentTime -= t;
  }
  /**
   * Increases the volume of the player.
   * The volume is increased by 0.1 and stored in the local storage.
   */
  upVolume() {
    this.volume < 1 && (this.volume = parseFloat((this.volume + 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString()));
  }
  /**
   * Decreases the volume of the player.
   * If the device is not an Apple device and the current volume is greater than 0.1,
   * it decreases the volume by 0.1 and updates the volume in the local storage.
   * If the device is not an Apple device and the current volume is 0,
   * it sets the volume to 0 and updates the volume in the local storage.
   */
  downVolume() {
    !this.isIOS() && this.volume > 0.1 ? (this.volume = parseFloat((this.volume - 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString())) : this.isIOS() || (this.volume = 0, localStorage.setItem(this.key, "0"));
  }
  /**
   * @returns {boolean}
   */
  get isHlsjs() {
    return e instanceof Object && this.hls !== null && this.hls instanceof e;
  }
  /**
   * @returns {string | undefined}
   */
  get url() {
    return this.isHlsjs ? this.hls.url : this.src;
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
  isIOS() {
    return typeof navigator < "u" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
  a as default
};
