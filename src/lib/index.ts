import { playHls, Hls } from './playHls';

class rPlayer extends Audio {
  private hls: Hls | null = null;
  private isHls: boolean = false;
  private lastSrc: string = '';

  constructor() {
    super();
  }

  /**
   * Validate if the provided URL is an HLS stream.
   * @param {string} url - The URL to validate.
   * @returns {boolean} True if the URL is an HLS stream, false otherwise.
   */
  private isHlsUrl(url: string | URL): boolean {
    return new URL(url).pathname.endsWith('.m3u8');
  }

  /**
   * Check if the current device is an iOS device.
   * @returns {boolean} True if the current device is an iOS device, false otherwise.
   * @readonly
   * @type {boolean}
   */
  get isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
  }

  /**
   * Validate if the current source is an HLS stream.
   * @returns {boolean} True if the current source is an HLS stream, false otherwise.
   * @readonly
   * @type {boolean}
   */
  get isHlsjs(): boolean {
    return this.isHls;
  }

  /**
   * Check if the audio element is currently playing.
   * @returns {boolean} True if the audio element is playing, false otherwise.
   * @readonly
   * @type {boolean}
   */
  get isPlaying(): boolean {
    console.log('Hls', this.hls);
    console.log('Hls', Hls);

    return !this.paused;
  }

  /**
   * Get the current source URL of the audio element.
   * @returns {string} The current source URL of the audio element.
   * @readonly
   * @type {string}
   */
  get url(): string {
    return this.lastSrc;
  }

  /**
   * Play the provided HLS source.
   * @param {string} src - The source URL of the HLS stream.
   */
  playSrc(src: string) {
    if (this.lastSrc !== src) {
      if (this.isHlsUrl(src)) {
        const hlsInstance = playHls(this, src);
        this.hls = hlsInstance || null;
        this.lastSrc = src;
        this.isHls = true;
      } else {
        this.stop();
        this.src = src;
        const playPromise = this.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {})
        }

        this.lastSrc = src;
        this.isHls = false;
      }
    } else {
      this.play();
    }
  }

  /**
   * Stop the audio element.
   * This will pause the audio and reset the current time to 0.
   * @returns {void}
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
   * Fast forward the audio element by the provided seconds.
   * @param {number} seconds - The number of seconds to fast forward.
   * @returns {void}
   */
  rewind(seconds: number): void {
    this.currentTime = Math.max(this.currentTime - seconds, 0);
  }

  /**
   * volumeUp the audio element by 10%. The volume will not exceed 100%.
   * @returns {void}
   * @example
   * // Increase the volume by 10%
   * myAudio.volumeUp();
   */
  volumeUp(): void {
    this.volume = Math.min(this.volume + 0.1, 1);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Decrease the volume of the audio element by 10%. The volume will not go below 0%.
   * @returns {void}
   * @example
   * // Decrease the volume by 10%
   * myAudio.volumeDown();
   */
  volumeDown(): void {
    this.volume = Math.max(this.volume - 0.1, 0);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Toggle the mute state of the audio element.
   * @returns {void}
   * @example
   * // Mute the audio element
   * myAudio.toogleMute();
   */
  toogleMute(): void {
    this.muted = !this.muted;
  }

  /**
   * Toggle the play/pause state of the audio element.
   * @returns {void}
   * @example
   * // Toggle the play/pause state of the audio element
   * myAudio.togglePlayPause();
   */
  togglePlayPause(): void {
    if (this.paused) {
      this.play();
    } else {
      this.pause();
    }
  }
}

export default rPlayer
