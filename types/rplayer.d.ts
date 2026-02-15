export default class RPlayer {
  /** The attached HTMLAudioElement, or null before attachMedia() is called. */
  audio: HTMLAudioElement | null;
  /** Volume increment/decrement step (default 0.1). */
  volumeStep: number;

  constructor();
  /** Attach an HTMLAudioElement to control. */
  attachMedia(audioElement: HTMLAudioElement): void;
  /** Seek backward by the given number of seconds (default 10). */
  rewind(seconds?: number): void;
  /** Increase volume by volumeStep (clamped to 1.0). */
  volumeUp(): void;
  /** Decrease volume by volumeStep (clamped to 0.0). */
  volumeDown(): void;
  /** Alias for toggleMute(). */
  mute(): void;
  /** Pause and reset to 0. If forceClear is true, also clears src. */
  stop(forceClear?: boolean): void;
  /** Returns true if the browser supports native HLS playback. */
  static supportsHls(): boolean;
  /** Returns true if the URL looks like an HLS stream (.m3u8, .m3u, /hls/). */
  static isHls(url: string): boolean;
  /** Returns true on iOS devices (including iPadOS 13+). */
  static isIos(): boolean;
  /** Toggle play/pause. Returns the play() promise when resuming. */
  togglePlay(): Promise<void> | void;
  /** Toggle muted state. */
  toggleMute(): void;
  /** True if audio is currently playing (not paused). */
  readonly isPlaying: boolean;
  /** True if audio is muted. */
  readonly isMuted: boolean;
}
