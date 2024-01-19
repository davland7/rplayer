import Hls from 'hls.js';

export default class rPlayer extends Audio {
  private hls: Hls | null;

  constructor() {
    super();

    const key = 'rplayer-volume';
    this.hls = null;

    if (localStorage.hasOwnProperty(key)) {
      this.volume = parseFloat(localStorage.getItem(key)!);
    } else {
      this.volume = 0.2;
    }

    this.onvolumechange = () => {
      localStorage.setItem(key, this.volume.toString());
    };
  }

  /**
   * @param src
   */
  async playSrc(src: string) {
    const isHls = src.indexOf('.m3u8') > 0;

    if (this.isPaused(src)) {
      this.play();
    } else {
      this.stop();

      if (Hls.isSupported() && isHls) {
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
      } else if (!this.hls && (this.canPlayType('application/vnd.apple.mpegurl') || (!isHls && Hls.isSupported()))) {
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

  upVolume(): void {
    this.setVolume(this.volume + 0.1);
  }

  downVolume(): void {
    this.setVolume(this.volume - 0.1);
  }

  /**
   * @param {number} value
   */
  private setVolume(value: number): void {
    if (value >= 0.0 && value <= 1.0) {
      this.volume = parseFloat(value.toFixed(1));
    }
  }

  /**
   * @param {string} src
   * @returns
   */
  private isPaused(src: string): boolean {
    return this.currentTime > 0 && !this.playing && this.url === src;
  }

  /**
   * @returns {boolean}
   */
  get isHls(): boolean {
    return this.hls instanceof Hls;
  }

  /**
   * @returns {string | undefined}
   */
  get url(): string | undefined {
    return this.isHls ? this.hls?.url : this.src;
  }

  /**
   * @returns {boolean}
   */
  get playing(): boolean {
    return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
  }
}
