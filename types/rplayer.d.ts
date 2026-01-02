export default class RPlayer {
  constructor();
  attachMedia(audioElement: HTMLAudioElement): void;
  rewind(seconds?: number): void;
  volumeUp(): void;
  volumeDown(): void;
  mute(): void;
  stop(forceClear?: boolean): void;
  static supportsHls(): boolean;
  static isHls(url: string): boolean;
  static isIos(): boolean;
  togglePlay(): void;
  toggleMute(): void;
  readonly isPlaying: boolean;
  readonly isMuted: boolean;
}
