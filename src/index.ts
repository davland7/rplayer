import Hls from 'hls.js';

export default class rPlayer extends Audio {
  private hls: Hls | null;
  private key: string = 'rplayer-volume';

  constructor() {
    super();

    this.volume = parseFloat(localStorage.getItem(this.key) || "0.2");
  }

  async playSrc(src: string) {
    const isM3u8 = src.indexOf('.m3u8') > 0;

    if (this.isPaused(src)) {
      this.play();
    } else {
      this.stop();

      if (isM3u8) {
        if (Hls.isSupported()) {
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
        }
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
    this.currentTime = this.currentTime - secondes;
  };

  upVolume(): void {
    if (this.volume < 0.9) {  // Adjusted the check to ensure it doesn't go beyond 0.9
      this.volume += 0.1;
      localStorage.setItem('rplayer-volume', this.volume.toString());
    }
  }

  downVolume(): void {
    if (this.volume > 0.1) {  // Adjusted the check to ensure it doesn't go below 0.1
      this.volume -= 0.1;
      localStorage.setItem('rplayer-volume', this.volume.toString());
    } else {
      this.volume = 0;  // Set volume to 0 if it's below 0.1 to avoid negative values
      localStorage.setItem('rplayer-volume', '0');
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
    return this.hls !== null && this.hls instanceof Hls;
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
