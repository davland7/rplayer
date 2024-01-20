import t from "hls.js";
class r extends Audio {
  constructor() {
    super(), this.key = "rplayer-volume", this.volume = this.isAppleDevice() ? 1 : parseFloat(localStorage.getItem(this.key) || "0.2");
  }
  async playSrc(e) {
    const l = e.indexOf(".m3u8") > 0;
    if (this.isPaused(e))
      this.play();
    else {
      this.stop(), typeof t < "u" && t.isSupported() && l && !this.isAppleDevice() ? (this.hls = new t(), this instanceof HTMLAudioElement && this.hls.attachMedia(this), this.hls.loadSource(e), await new Promise((s) => {
        var i;
        (i = this.hls) == null || i.on(t.Events.MANIFEST_PARSED, () => {
          s();
        });
      })) : (this.src = e, await new Promise((s) => {
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
  rewind(e) {
    this.currentTime -= e;
  }
  /**
   * Increases the volume of the player.
   * This method only works if the device is not an Apple device and the current volume is less than 1.0.
   * The volume is increased by 0.1 and stored in the local storage.
   */
  upVolume() {
    !this.isAppleDevice() && this.volume < 1 && (this.volume = parseFloat((this.volume + 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString()));
  }
  /**
   * Decreases the volume of the player.
   * If the device is not an Apple device and the current volume is greater than 0.1,
   * it decreases the volume by 0.1 and updates the volume in the local storage.
   * If the device is not an Apple device and the current volume is 0,
   * it sets the volume to 0 and updates the volume in the local storage.
   */
  downVolume() {
    !this.isAppleDevice() && this.volume > 0.1 ? (this.volume = parseFloat((this.volume - 0.1).toFixed(1)), localStorage.setItem(this.key, this.volume.toString())) : this.isAppleDevice() || (this.volume = 0, localStorage.setItem(this.key, "0"));
  }
  /**
   * @returns {boolean}
   */
  get isHls() {
    return t instanceof Object && this.hls !== null && this.hls instanceof t;
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
  isAppleDevice() {
    return /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
  }
  /**
   * @param {string} src
   * @returns
   */
  isPaused(e) {
    return this.currentTime > 0 && !this.playing && this.url === e;
  }
}
export {
  r as default
};
