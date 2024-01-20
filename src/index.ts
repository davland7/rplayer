import Hls from 'hls.js';

export default class rPlayer extends Audio {
  private hls: Hls | null;
  private key: string = 'rplayer-volume';

  constructor() {
    super();

    this.volume = this.isAppleDevice() ? 1.0 : parseFloat(localStorage.getItem(this.key) || "0.2");
  }

  async playSrc(src: string): Promise<void>{
    const isM3u8 = src.indexOf('.m3u8') > 0;

    if (this.isPaused(src)) {
      this.play();
    } else {
      this.stop();

      console.error('isM3u8', isM3u8);
      console.error('Hls.isSupported()', Hls.isSupported());
      console.error('this.canPlayType("application/vnd.apple.mpegURL")', this.canPlayType('application/vnd.apple.mpegURL'));

      if ((typeof Hls !== 'undefined' && Hls.isSupported() && isM3u8) && (!this.canPlayType('application/vnd.apple.mpegURL') && !this.isAppleDevice())) {
        this.hls = new Hls();

        if (this instanceof HTMLAudioElement) {
          this.hls.attachMedia(this as HTMLAudioElement as HTMLVideoElement);
        }

        this.hls.loadSource(src);

        await new Promise<void>((resolve) => {
          this.hls?.on(Hls.Events.MANIFEST_PARSED, () => {
            resolve();
          });
        });
      } else {
        this.src = src;

        await new Promise<void>((resolve) => {
          this.addEventListener('loadedmetadata', () => {
            resolve();
          });
        });
      }

      try {
        await this.play();
      } catch (error) {
        console.error('Error on play', error);
      }
    }
  }

  /**
   * Mutes or unmutes the player.
   */
  mute(): void {
    this.muted = !this.muted;
  }

  /**
   * Stops the player and resets the current time.
   * If the player is using HLS, it also destroys the HLS instance.
   */
  stop(): void {
    this.pause();
    this.currentTime = 0;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  /**
   * @param {number} secondes
   */
  rewind(secondes: number): void {
    this.currentTime -= secondes;
  };

  /**
   * Increases the volume of the player.
   * This method only works if the device is not an Apple device and the current volume is less than 1.0.
   * The volume is increased by 0.1 and stored in the local storage.
   */
  upVolume(): void {
    if (!this.isAppleDevice() && this.volume < 1.0) {
      this.volume = parseFloat((this.volume + 0.1).toFixed(1));
      localStorage.setItem(this.key, this.volume.toString());
    }
  }

  /**
   * Decreases the volume of the player.
   * If the device is not an Apple device and the current volume is greater than 0.1,
   * it decreases the volume by 0.1 and updates the volume in the local storage.
   * If the device is not an Apple device and the current volume is 0,
   * it sets the volume to 0 and updates the volume in the local storage.
   */
  downVolume(): void {
    if (!this.isAppleDevice() && this.volume > 0.1) {
      this.volume = parseFloat((this.volume - 0.1).toFixed(1));
      localStorage.setItem(this.key, this.volume.toString());
    } else if (!this.isAppleDevice()) {
      this.volume = 0;
      localStorage.setItem(this.key, '0');
    }
  }

  /**
   * @returns {boolean}
   */
  get isHls(): boolean {
    return Hls instanceof Object && this.hls !== null && this.hls instanceof Hls;
  }

  /**
   * @returns {string | undefined}
   */
  get url(): string | undefined {
    return this.isHls ? this.hls.url : this.src;
  }

  /**
   * @returns {boolean}
   */
  get playing(): boolean {
    return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
  }

  /**
   * @returns {boolean}
   */
  private isAppleDevice(): boolean {
    return /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
  }

  /**
   * @param {string} src
   * @returns
   */
  private isPaused(src: string): boolean {
    return this.currentTime > 0 && !this.playing && this.url === src;
  }
}
