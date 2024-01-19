// hls.d.ts
/*declare module 'hls.js' {
  class Hls {
    // ... autres membres ...

    // Déclaration d'extension pour rendre 'url' accessible publiquement
    url: string | undefined;
  }

  namespace Hls {
    enum Events {
      MANIFEST_PARSED = 'MANIFEST_PARSED',
      // Ajoutez d'autres événements selon vos besoins
    }
  }

  export = Hls;
}*/


// hls.d.ts
declare module 'hls.js' {
  class Hls {
    static isSupported(): boolean;
    on(event: string, callback: () => void): void;
    loadSource(source: string): void;
    attachMedia(video: HTMLVideoElement): void;
    destroy(): void; // Déclaration de destroy
    url: string | undefined;
  }

  namespace Hls {
    enum Events {
      MANIFEST_PARSED = 'MANIFEST_PARSED',
      // Ajoutez d'autres événements selon vos besoins
    }
  }

  export = Hls;
}
