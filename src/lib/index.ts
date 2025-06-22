import { playHls } from './playHls';
import { playM3u } from './playM3u';

// Type definitions
export type PlaybackStatus = 'playing' | 'paused' | 'stopped';

/**
 * RPlayer - An enhanced audio player with HLS support
 * @extends Audio
 */
class RPlayer extends Audio {
  private hls: any | null = null;
  private isHls: boolean = false;
  private lastSrc: string = '';
  private readonly errorHandlers: Array<(error: Error) => void> = [];
  private readonly playbackHandlers: Array<(status: PlaybackStatus) => void> = [];

  /**
   * Creates a new RPlayer instance
   * @param {string} [initialSource] - Optional initial audio source to play
   */
  constructor(initialSource?: string) {
    super();

    // Load volume from localStorage if available
    this.initializeVolume();

    // Set event listeners
    this.setupEventListeners();

    // Play initial source if provided after constructor finishes
    if (initialSource) {
      setTimeout(() => {
        this.playSrc(initialSource).catch(error => {
          console.error('Failed to play initial source:', error);
        });
      }, 0);
    }
  }

  /**
   * Initialize volume settings from localStorage
   * @private
   */
  private initializeVolume(): void {
    try {
      const savedVolume = localStorage.getItem('RPlayer-volume');
      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume) && volume >= 0 && volume <= 1) {
          this.volume = volume;
        }
      }
    } catch (error) {
      console.warn('Could not retrieve volume settings from localStorage', error);
    }
  }

  /**
   * Set up event listeners for the audio element
   * @private
   */
  private setupEventListeners(): void {
    // Save volume to localStorage when changed
    this.addEventListener('volumechange', () => {
      try {
        localStorage.setItem('RPlayer-volume', this.volume.toString());
      } catch (error) {
        console.warn('Could not save volume settings to localStorage', error);
      }
    });

    // Handle errors
    this.addEventListener('error', (event) => {
      const error = new Error(`Media error: ${this.error?.code ?? 'unknown'}`);
      this.errorHandlers.forEach(handler => handler(error));
    });

    // Track play/pause status
    this.addEventListener('play', () => {
      this.playbackHandlers.forEach(handler => handler('playing'));
    });

    this.addEventListener('pause', () => {
      this.playbackHandlers.forEach(handler => handler('paused'));
    });
  }

  /**
   * Validate if the provided URL is an HLS stream.
   * @param {string | URL} url - The URL to validate.
   * @returns {boolean} True if the URL is an HLS stream, false otherwise.
   * @private
   */
  private isHlsUrl(url: string | URL): boolean {
    const urlStr = url.toString();

    // Gestion simple pour les chemins relatifs ou les URL
    if (urlStr.endsWith('.m3u8')) {
      return true;
    }

    try {
      // Pour les URL complètes, nous pouvons toujours utiliser l'objet URL
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.pathname.endsWith('.m3u8');
      }
      return false;
    } catch (error) {
      // Si nous ne pouvons pas construire un objet URL, vérifier simplement l'extension
      console.warn('URL parsing failed in isHlsUrl, using fallback check:', urlStr);
      return false;
    }
  }

  /**
   * Validate if the provided URL is a standard M3U playlist.
   * @param {string | URL} url - The URL to validate.
   * @returns {boolean} True if the URL is a standard M3U playlist, false otherwise.
   * @private
   */
  private isM3uUrl(url: string | URL): boolean {
    const urlStr = url.toString();

    // Gestion simple pour les chemins relatifs ou les URL
    if (urlStr.endsWith('.m3u') && !urlStr.endsWith('.m3u8')) {
      return true;
    }

    try {
      // Pour les URL complètes, nous pouvons toujours utiliser l'objet URL
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.pathname.endsWith('.m3u') && !parsedUrl.pathname.endsWith('.m3u8');
      }
      return false;
    } catch (error) {
      // Si nous ne pouvons pas construire un objet URL, vérifier simplement l'extension
      console.warn('URL parsing failed in isM3uUrl, using fallback check:', urlStr);
      return false;
    }
  }

  /**
   * Check if the current device is an iOS device.
   * @returns {boolean} True if the current device is an iOS device, false otherwise.
   * @readonly
   */
  get isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
  }

  /**
   * Validate if the current source is an HLS stream.
   * @returns {boolean} True if the current source is an HLS stream, false otherwise.
   * @readonly
   */
  get isHlsjs(): boolean {
    return this.isHls;
  }

  /**
   * Check if the audio element is currently playing.
   * @returns {boolean} True if the audio element is playing, false otherwise.
   * @readonly
   */
  get isPlaying(): boolean {
    return !this.paused;
  }

  /**
   * Get the current source URL of the audio element.
   * @returns {string} The current source URL of the audio element.
   * @readonly
   */
  get url(): string {
    return this.lastSrc;
  }

  /**
   * Register a handler for playback status changes
   * @param {function} handler - The function to call when playback status changes
   */
  onPlaybackStatusChange(handler: (status: 'playing' | 'paused' | 'stopped') => void): void {
    this.playbackHandlers.push(handler);
  }

  /**
   * Register a handler for errors
   * @param {function} handler - The function to call when an error occurs
   */
  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove a previously registered playback status handler
   * @param {function} handler - The handler to remove
   */
  removePlaybackStatusHandler(handler: (status: 'playing' | 'paused' | 'stopped') => void): void {
    const index = this.playbackHandlers.indexOf(handler);
    if (index !== -1) {
      this.playbackHandlers.splice(index, 1);
    }
  }

  /**
   * Remove a previously registered error handler
   * @param {function} handler - The handler to remove
   */
  removeErrorHandler(handler: (error: Error) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  /**
   * Play the provided audio source
   * @param {string} src - The source URL of the audio stream
   * @returns {Promise<void>} - A promise that resolves when playback has started or rejects on error
   */
  async playSrc(src: string): Promise<void> {
    console.log(`[RPlayer] playSrc appelé avec: ${src}`);

    // Convertir les chemins relatifs en URL absolues
    if (src.startsWith('/') && !src.startsWith('//') && typeof window !== 'undefined') {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] URL relative convertie en absolue: ${src}`);
    }

    // Don't reload if it's the same source and just paused
    if (this.lastSrc === src && this.paused && this.currentTime > 0) {
      try {
        console.log(`[RPlayer] Même source détectée, reprise de la lecture: ${src}`);
        await this.play();
        return;
      } catch (error) {
        // If there's an error playing, try to reload the source
        console.warn('[RPlayer] Erreur lors de la reprise de la lecture, tentative de rechargement', error);
      }
    }

    try {
      // Stop any current playback
      this.stop();

      // Déterminer le type de source
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);
      console.log(`[RPlayer] Type de source: ${isHls ? 'HLS' : isM3u ? 'M3U standard' : 'Direct'}`);

      // Détermination du type de source pour le log
      let sourceType = 'Direct';
      if (isHls) sourceType = 'HLS';
      else if (isM3u) sourceType = 'M3U standard';
      console.log(`[RPlayer] Type de source: ${sourceType}`);

      if (isHls) {
        try {
          // playHls est désormais asynchrone et retourne une promesse
          const hlsInstance = await playHls(this, src);
          this.hls = hlsInstance;
          this.lastSrc = src;
          this.isHls = true;

          // Return a promise that resolves when playback starts or rejects on error
          return new Promise((resolve, reject) => {
            const onPlay = () => {
              this.removeEventListener('playing', onPlay);
              this.removeEventListener('error', onError);
              resolve();
            };

            const onError = () => {
              this.removeEventListener('playing', onPlay);
              this.removeEventListener('error', onError);
              reject(new Error(`Failed to load HLS source: ${src}`));
            };

            // Si playHls a déjà commencé la lecture (support natif), résoudre immédiatement
            if (!this.paused) {
              resolve();
            } else {
              this.addEventListener('playing', onPlay);
              this.addEventListener('error', onError);
            }
          });
        } catch (error) {
          console.error('Error initializing HLS playback:', error);
          throw error;
        }
      }      else if (this.isM3uUrl(src)) {
        try {
          console.log(`[RPlayer] Attempting to play M3U standard playlist: ${src}`);
          // For standard .m3u files
          // playM3u now returns the URL of the first item in the playlist
          const mediaUrl = await playM3u(this, src);
          console.log(`[RPlayer] URL extracted from M3U playlist: ${mediaUrl}`);

          // Call playSrc recursively with the media URL
          // This allows automatic handling of HLS streams
          if (mediaUrl === src) {
            // Avoid an infinite loop if the URL is the same
            throw new Error("The URL extracted from the playlist is identical to the playlist URL");
          }

          // Update for traceability
          this.lastSrc = src; // Keep the playlist URL as the original source

          // Update MediaSession if available
          if ('mediaSession' in navigator && navigator.mediaSession) {
            // Try to extract station name from the URL path
            let title = "Radio Station";
            try {
              // Extract file name from URL and clean it up
              const urlObj = new URL(mediaUrl);
              const pathParts = urlObj.pathname.split('/');
              const fileName = pathParts[pathParts.length - 1];
              if (fileName) {
                // Remove extension and replace underscores/hyphens with spaces
                title = fileName.replace(/\.(mp3|aac|ogg|m4a|wav)$/i, '')
                               .replace(/[_-]/g, ' ');
              }
            } catch (e) {
              console.warn('Failed to extract title from URL:', e);
            }

            navigator.mediaSession.metadata = new MediaMetadata({
              title: title,
              artist: 'RPlayer M3U',
              album: 'M3U Playlist',
              artwork: [
                { src: '/images/favicon.png', sizes: '96x96', type: 'image/png' },
                { src: '/images/icons-192.png', sizes: '192x192', type: 'image/png' }
              ]
            });
          }

          // Redirect to the media URL
          console.log(`[RPlayer] Redirecting to: ${mediaUrl}`);
          return this.playSrc(mediaUrl);
        } catch (error) {
          console.error('[RPlayer] Erreur lors de la lecture de la playlist M3U:', error);
          const m3uError = error instanceof Error ? error : new Error(`Échec de l'analyse de la playlist M3U: ${String(error)}`);
          this.errorHandlers.forEach(handler => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Tentative de lecture directe: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;

        try {
          await this.play();
          console.log(`[RPlayer] Lecture directe réussie`);
          return;
        } catch (playError) {
          console.error('[RPlayer] Erreur lors de la lecture directe:', playError);
          const directError = new Error(`Échec de la lecture de la source: ${src}`);
          this.errorHandlers.forEach(handler => handler(directError));
          throw directError;
        }
      }
    } catch (error) {
      console.error('Error playing source', error);
      this.errorHandlers.forEach(handler => handler(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  }

  /**
   * Load a source without automatically playing it
   * This is useful for preloading sources or working with autoplay restrictions
   * @param {string} src - The source URL to load
   * @returns {Promise<void>} - A promise that resolves when the source is loaded
   */
  async loadSrc(src: string): Promise<void> {
    console.log(`[RPlayer] loadSrc appelé avec: ${src}`);

    // Convertir les chemins relatifs en URL absolues
    if (src.startsWith('/') && !src.startsWith('//') && typeof window !== 'undefined') {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] URL relative convertie en absolue: ${src}`);
    }

    try {
      // Stop any current playback
      this.stop();

      // Déterminer le type de source
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);

      // Détermination du type de source pour le log
      let sourceType = 'Direct';
      if (isHls) sourceType = 'HLS';
      else if (isM3u) sourceType = 'M3U standard';
      console.log(`[RPlayer] Type de source: ${sourceType}`);

      if (isHls) {
        try {
          // playHls est maintenant utilisé uniquement pour charger la source, sans lecture automatique
          // Nous modifierons la fonction playHls pour accepter un paramètre autoplay
          const hlsInstance = await playHls(this, src, undefined, false);
          this.hls = hlsInstance;
          this.lastSrc = src;
          this.isHls = true;
          return Promise.resolve();
        } catch (error) {
          console.error('Error initializing HLS source:', error);
          throw error;
        }
      } else if (this.isM3uUrl(src)) {
        try {
          console.log(`[RPlayer] Attempting to load M3U standard playlist: ${src}`);
          // Pour les playlists M3U, nous extrayons la première URL mais ne lançons pas la lecture
          const mediaUrl = await playM3u(this, src);
          console.log(`[RPlayer] URL extracted from M3U playlist: ${mediaUrl}`);

          // Éviter les boucles infinies
          if (mediaUrl === src) {
            throw new Error("The URL extracted from the playlist is identical to the playlist URL");
          }

          // Mettre à jour pour la traçabilité
          this.lastSrc = src;

          // Charger la source médias sans lecture automatique
          return this.loadSrc(mediaUrl);
        } catch (error) {
          console.error('[RPlayer] Erreur lors du chargement de la playlist M3U:', error);
          const m3uError = error instanceof Error ? error : new Error(`Échec de l'analyse de la playlist M3U: ${String(error)}`);
          this.errorHandlers.forEach(handler => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Chargement direct sans lecture: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;

        // Ne pas lancer la lecture automatiquement
        // Charger les métadonnées pour s'assurer que la source est bien chargée
        return new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            this.removeEventListener('loadedmetadata', onLoadedMetadata);
            this.removeEventListener('error', onError);
            resolve();
          };

          const onError = () => {
            this.removeEventListener('loadedmetadata', onLoadedMetadata);
            this.removeEventListener('error', onError);
            const error = new Error(`Échec du chargement de la source: ${src}`);
            this.errorHandlers.forEach(handler => handler(error));
            reject(error);
          };

          this.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          this.addEventListener('error', onError, { once: true });

          // Déclencher le chargement sans lecture
          this.load();
        });
      }
    } catch (error) {
      console.error('Error loading source', error);
      this.errorHandlers.forEach(handler => handler(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  }

  /**
   * Stop the audio element
   * This will pause the audio, reset the current time to 0, clean up HLS resources
   * and reset internal state
   */
  stop(): void {
    this.pause();
    this.currentTime = 0;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    // Réinitialiser complètement l'état
    this.isHls = false;

    // Important: ne pas effacer lastSrc pour permettre l'affichage du dernier flux
    // tout en indiquant que la lecture est arrêtée

    this.playbackHandlers.forEach(handler => handler('stopped'));
  }

  /**
   * Rewind the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to rewind
   */
  rewind(seconds: number): void {
    this.currentTime = Math.max(this.currentTime - seconds, 0);
  }

  /**
   * Fast forward the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to fast forward
   */
  forward(seconds: number): void {
    if (this.duration && isFinite(this.duration)) {
      this.currentTime = Math.min(this.currentTime + seconds, this.duration);
    } else {
      this.currentTime += seconds;
    }
  }

  /**
   * Increase the volume by 10%
   * The volume will not exceed 100%
   */
  upVolume(): void {
    this.volume = Math.min(this.volume + 0.1, 1);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Decrease the volume by 10%
   * The volume will not go below 0%
   */
  downVolume(): void {
    this.volume = Math.max(this.volume - 0.1, 0);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Set the volume to a specific level
   * @param {number} level - A value between 0 and 1
   */
  setVolume(level: number): void {
    if (level < 0 || level > 1) {
      throw new Error('Volume level must be between 0 and 1');
    }

    this.volume = parseFloat(level.toFixed(2));
  }

  /**
   * Toggle the mute state of the audio element
   */
  mute(): void {
    this.muted = !this.muted;
  }

  /**
   * Update MediaSession metadata with current track information
   * @param title - The title of the current track
   * @param artist - The artist name
   * @param album - The album name
   */
  updateMediaSessionMetadata(title: string = '', artist: string = 'RPlayer', album: string = 'Audio Stream'): void {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title || this.lastSrc || 'Unknown Track',
          artist,
          album,
          artwork: [
            { src: '/images/favicon.png', sizes: '96x96', type: 'image/png' },
            { src: '/images/icons-192.png', sizes: '192x192', type: 'image/png' }
          ]
        });
        console.log(`[RPlayer] MediaSession metadata updated: ${title}`);
      } catch (error) {
        console.error('[RPlayer] Error updating MediaSession metadata:', error);
      }
    }
  }

  /**
   * Clean up resources when the player is no longer needed
   * This will stop any playback and release all resources
   */
  destroy(): void {
    this.stop();

    // Remove all event listeners
    this.playbackHandlers.length = 0;
    this.errorHandlers.length = 0;

    // Clean up MediaSession handlers
    if ('mediaSession' in navigator) {
      try {
        // Clear all action handlers
        ['play', 'pause', 'stop', 'seekforward', 'seekbackward', 'previoustrack', 'nexttrack'].forEach(action => {
          try {
            navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
          } catch (e) {
            // Some browsers might not support all actions
          }
        });
      } catch (error) {
        console.warn('[RPlayer] Error clearing MediaSession handlers:', error);
      }
    }

    // Clean up any other resources
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }
}

// Export types
export type RPlayerEvents = {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onError: (error: Error) => void;
  onVolumeChange: (volume: number) => void;
  onTimeUpdate: (time: number) => void;
};

// Export the RPlayer class
export default RPlayer;
