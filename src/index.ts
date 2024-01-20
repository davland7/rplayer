import Hls from 'hls.js';

export default class rPlayer extends Audio {
  private hls: Hls | null;
  private key: string = 'rplayer-volume';

  constructor() {
    super();

    this.volume = this.isAppleDevice() ? 1.0 : parseFloat(localStorage.getItem(this.key) || "0.2");
  }

  async playSrc(src: string) {
    const isM3u8 = src.indexOf('.m3u8') > 0;

    if (this.isPaused(src)) {
      this.play();
    } else {
      this.stop();

      if (Hls instanceof Object && Hls.isSupported() && !this.supportsHls() && isM3u8) {
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

  mute(): void {
    this.muted = !this.muted;
  }

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

  upVolume(): void {
    if (!this.isAppleDevice() && this.volume < 1.0) {
      this.volume = parseFloat((this.volume + 0.1).toFixed(1));
      localStorage.setItem(this.key, this.volume.toString());
    }
  }

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
  private supportsHls(): boolean {
    return Boolean(this.canPlayType('application/vnd.apple.mpegURL') || this.canPlayType('audio/mpegurl'))
  }

  /**
   * @returns {boolean}
   */
  private isAppleDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * @param {string} src
   * @returns
   */
  private isPaused(src: string): boolean {
    return this.currentTime > 0 && !this.playing && this.url === src;
  }
}
