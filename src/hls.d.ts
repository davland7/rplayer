declare module 'hls.js' {
  class Hls {
    static isSupported(): boolean;
    on(event: string, callback: () => void): void;
    loadSource(source: string): void;
    attachMedia(video: HTMLVideoElement): void;
    destroy(): void;
    url: string | undefined;
  }

  namespace Hls {
    enum Events {
      MANIFEST_PARSED = 'MANIFEST_PARSED',
    }
  }

  export = Hls;
}
