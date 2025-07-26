import { playHls } from './playHls.js';
import { playM3u } from './playM3u.js';

// Type definitions
export type PlaybackStatus = 'playing' | 'paused' | 'stopped';

/**
 * RPlayer - An enhanced audio player with HLS support
 * @extends Audio
 */
class RPlayer extends Audio {
  /**
   * Internal flag to track if we should try to auto-reconnect
   */
  private shouldAutoReconnect: boolean = false;

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
    // Auto-reconnect on network change
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleReconnect);
      window.addEventListener('offline', this.handleOffline);
    }

    // Initialize with default settings
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
   * Initialize volume settings
   * @private
   */
  private initializeVolume(): void {
    // Default volume initialization
    this.volume = 1.0; // Default to full volume
  }

  /**
   * Set up event listeners for the audio element
   * @private
   */
  private setupEventListeners(): void {
    // Volume management is now handled externally by the application

    // Handle errors
    this.addEventListener('error', () => {
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
   * Checks if the provided URL is an HLS stream.
   * @param {string | URL} url - The URL to check.
   * @returns {boolean} True if the URL is an HLS stream, false otherwise.
   * @private
   */
  private isHlsUrl(url: string | URL): boolean {
    const urlStr = url.toString();

    try {
      // Check if the URL has a valid structure
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        // Use URL object to parse properly
        const parsedUrl = new URL(urlStr);
        // Check if pathname (without query parameters) ends with .m3u8
        return parsedUrl.pathname.endsWith('.m3u8');
      }

      // For relative paths or non-standard URLs
      // Extract the path part before any query parameters
      const pathWithoutQuery = urlStr.split('?')[0];
      return pathWithoutQuery.endsWith('.m3u8');
    } catch (error) {
      // If we can't parse the URL, use a regex to check for .m3u8 before any query params
      console.warn('URL parsing failed in isHlsUrl, using fallback check:', urlStr);
      return /\.m3u8($|\?)/.test(urlStr);
    }
  }

  /**
   * Checks if the provided URL is a standard M3U playlist.
   * @param {string | URL} url - The URL to check.
   * @returns {boolean} True if the URL is a standard M3U playlist, false otherwise.
   * @private
   */
  private isM3uUrl(url: string | URL): boolean {
    const urlStr = url.toString();

    try {
      // Check if the URL has a valid structure
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        // Use URL object to parse properly
        const parsedUrl = new URL(urlStr);
        // Check if pathname (without query parameters) ends with .m3u but not .m3u8
        const pathname = parsedUrl.pathname;
        return pathname.endsWith('.m3u') && !pathname.endsWith('.m3u8');
      }

      // For relative paths or non-standard URLs
      // Extract the path part before any query parameters
      const pathWithoutQuery = urlStr.split('?')[0];
      return pathWithoutQuery.endsWith('.m3u') && !pathWithoutQuery.endsWith('.m3u8');
    } catch (error) {
      // If we can't parse the URL, use a regex to check for .m3u (not .m3u8) before any query params
      console.warn('URL parsing failed in isM3uUrl, using fallback check:', urlStr);
      return /\.m3u($|\?)/.test(urlStr) && !/\.m3u8($|\?)/.test(urlStr);
    }
  }

  /**
   * Checks if the current device is an iOS device.
   * @returns {boolean} True if the current device is an iOS device, false otherwise.
   * @readonly
   */
  get isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
  }

  /**
   * Checks if the current source is an HLS stream.
   * @returns {boolean} True if the current source is an HLS stream, false otherwise.
   * @readonly
   */
  get isHlsjs(): boolean {
    return this.isHls;
  }

  /**
   * Checks if the audio element is currently playing.
   * @returns {boolean} True if the audio element is playing, false otherwise.
   * @readonly
   */
  get isPlaying(): boolean {
    return !this.paused;
  }

  /**
   * Gets the current source URL of the audio element.
   * @returns {string} The current source URL of the audio element.
   * @readonly
   */
  get url(): string {
    return this.lastSrc;
  }

  /**
   * Registers a handler for playback status changes
   * @param {function} handler - The function to call when playback status changes
   */
  onPlaybackStatusChange(handler: (status: 'playing' | 'paused' | 'stopped') => void): void {
    this.playbackHandlers.push(handler);
  }

  /**
   * Registers a handler for errors
   * @param {function} handler - The function to call when an error occurs
   */
  onError(handler: (error: Error) => void): void {
    // Si une erreur est détectée, activer la reconnexion automatique
    const wrappedHandler = (error: Error) => {
      this.shouldAutoReconnect = true;
      handler(error);
    };
    this.errorHandlers.push(wrappedHandler);
  }

  /**
   * Removes a previously registered playback status handler
   * @param {function} handler - The handler to remove
   */
  removePlaybackStatusHandler(handler: (status: 'playing' | 'paused' | 'stopped') => void): void {
    const index = this.playbackHandlers.indexOf(handler);
    if (index !== -1) {
      this.playbackHandlers.splice(index, 1);
    }
  }

  /**
   * Removes a previously registered error handler
   * @param {function} handler - The handler to remove
   */
  removeErrorHandler(handler: (error: Error) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  /**
   * Plays the provided audio source
   * @param {string} src - The source URL of the audio stream
   * @returns {Promise<void>} - A promise that resolves when playback has started or rejects on error
   */
  async playSrc(src: string): Promise<void> {
    console.log(`[RPlayer] playSrc called with: ${src}`);

    // Convert relative paths to absolute URLs
    if (src.startsWith('/') && !src.startsWith('//') && typeof window !== 'undefined') {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] Relative URL converted to absolute: ${src}`);
    }

    // Don't reload if it's the same source and just paused
    if (this.lastSrc === src && this.paused && this.currentTime > 0) {
      try {
        console.log(`[RPlayer] Same source detected, resuming playback: ${src}`);
        await this.play();
        return;
      } catch (error) {
        // If there's an error playing, try to reload the source
        console.warn('[RPlayer] Error resuming playback, attempting to reload', error);
      }
    }

    try {
      // Stop any current playback
      this.stop();

      // Determine the type of source
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);
      console.log(`[RPlayer] Source type: ${isHls ? 'HLS' : isM3u ? 'Standard M3U' : 'Direct'}`);

      // Determination of the source type for logging
      let sourceType = 'Direct';
      if (isHls) sourceType = 'HLS';
      else if (isM3u) sourceType = 'M3U standard';
      console.log(`[RPlayer] Source type: ${sourceType}`);

      if (isHls) {
        try {
          // playHls is now asynchronous and returns a promise
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

            // If playHls has already started playback (native support), resolve immediately
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

          // Redirect to the media URL
          console.log(`[RPlayer] Redirecting to: ${mediaUrl}`);
          return this.playSrc(mediaUrl);
        } catch (error) {
          console.error('[RPlayer] Error while playing M3U playlist:', error);
          const m3uError = error instanceof Error ? error : new Error(`Failed to parse M3U playlist: ${String(error)}`);
          this.errorHandlers.forEach(handler => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Attempting direct playback: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;

        // Attendre canplay avant d'appeler play()
        return new Promise((resolve, reject) => {
          const onCanPlay = async () => {
            this.removeEventListener('canplay', onCanPlay);
            this.removeEventListener('error', onError);
            try {
              await Promise.resolve(); // microtask pour éviter race
              await this.play();
              console.log(`[RPlayer] Direct playback successful`);
              resolve();
            } catch (playError) {
              console.error('[RPlayer] Error during direct playback:', playError);
              const directError = new Error(`Failed to play source: ${src}`);
              this.errorHandlers.forEach(handler => handler(directError));
              reject(directError);
            }
          };
          const onError = () => {
            this.removeEventListener('canplay', onCanPlay);
            this.removeEventListener('error', onError);
            const error = new Error(`Failed to load source: ${src}`);
            this.errorHandlers.forEach(handler => handler(error));
            reject(error);
          };
          this.addEventListener('canplay', onCanPlay, { once: true });
          this.addEventListener('error', onError, { once: true });
          this.load();
        });
      }
    } catch (error) {
      console.error('Error playing source', error);
      this.errorHandlers.forEach(handler => handler(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  }

  /**
   * Loads a source without automatically playing it
   * Useful for preloading sources or working with autoplay restrictions
   * @param {string} src - The source URL to load
   * @returns {Promise<void>} - A promise that resolves when the source is loaded
   */
  async loadSrc(src: string): Promise<void> {
    console.log(`[RPlayer] loadSrc called with: ${src}`);

    // Convert relative paths to absolute URLs
    if (src.startsWith('/') && !src.startsWith('//') && typeof window !== 'undefined') {
      const origin = window.location.origin;
      src = `${origin}${src}`;
      console.log(`[RPlayer] Relative URL converted to absolute: ${src}`);
    }

    try {
      // Stop any current playback
      this.stop();

      // Determine the type of source
      const isHls = this.isHlsUrl(src);
      const isM3u = this.isM3uUrl(src);

      // Determination of the source type for logging
      let sourceType = 'Direct';
      if (isHls) sourceType = 'HLS';
      else if (isM3u) sourceType = 'M3U standard';
      console.log(`[RPlayer] Source type: ${sourceType}`);

      if (isHls) {
        try {
          // playHls is now used only to load the source, without automatic playback
          // We will modify the playHls function to accept an autoplay parameter
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
          // For M3U playlists, we extract the first URL but do not start playback
          const mediaUrl = await playM3u(this, src);
          console.log(`[RPlayer] URL extracted from M3U playlist: ${mediaUrl}`);

          // Avoid infinite loops
          if (mediaUrl === src) {
            throw new Error("The URL extracted from the playlist is identical to the playlist URL");
          }

          // Update for traceability
          this.lastSrc = src;

          // Load media source without automatic playback
          return this.loadSrc(mediaUrl);
        } catch (error) {
          console.error('[RPlayer] Error while loading M3U playlist:', error);
          const m3uError = error instanceof Error ? error : new Error(`Failed to parse M3U playlist: ${String(error)}`);
          this.errorHandlers.forEach(handler => handler(m3uError));
          throw m3uError;
        }
      } else {
        console.log(`[RPlayer] Loading direct without playback: ${src}`);
        this.src = src;
        this.lastSrc = src;
        this.isHls = false;

        // Don't start playback automatically
        // Trigger loading without playback
        return new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            this.removeEventListener('loadedmetadata', onLoadedMetadata);
            this.removeEventListener('error', onError);
            resolve();
          };

          const onError = () => {
            this.removeEventListener('loadedmetadata', onLoadedMetadata);
            this.removeEventListener('error', onError);
            const error = new Error(`Failed to load source: ${src}`);
            this.errorHandlers.forEach(handler => handler(error));
            reject(error);
          };

          this.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          this.addEventListener('error', onError, { once: true });

          // Trigger loading without playback
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
   * Stops the audio element
   * Pauses the audio, resets the current time to 0, cleans up HLS resources,
   * and resets internal state
   */
  stop(): void {
    this.pause();
    this.currentTime = 0;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    // Reset the state completely
    this.isHls = false;

    // Important: do not clear lastSrc to allow displaying the last stream while indicating that playback is stopped

    // On stop, enable auto-reconnect if there was a source
    if (this.lastSrc) {
      this.shouldAutoReconnect = true;
    }

    this.playbackHandlers.forEach(handler => handler('stopped'));
    // On demande explicitement la lecture, on désactive l'auto-reconnect (l'utilisateur a le contrôle)
    this.shouldAutoReconnect = false;
  }

  /**
   * Handler for browser 'online' event to auto-reconnect the stream
   */
  private handleReconnect = () => {
    if (this.shouldAutoReconnect && this.lastSrc) {
      // Relance le stream automatiquement
      this.playSrc(this.lastSrc).catch((err) => {
        console.warn('[RPlayer] Auto-reconnect failed:', err);
      });
      // On ne relance qu'une fois
      this.shouldAutoReconnect = false;
    }
  };

  /**
   * Handler for browser 'offline' event (optionnel, pour debug)
   */
  private handleOffline = () => {
    // Peut-être afficher un message ou loguer
    console.warn('[RPlayer] Offline detected');
  };

  /**
   * Rewinds the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to rewind
   */
  rewind(seconds: number): void {
    this.currentTime = Math.max(this.currentTime - seconds, 0);
  }

  /**
   * Fast forwards the audio element by the specified number of seconds
   * @param {number} seconds - The number of seconds to fast forward
   */
  forward(seconds: number): void {
    if (this.duration && Number.isFinite(this.duration)) {
      this.currentTime = Math.min(this.currentTime + seconds, this.duration);
    } else {
      this.currentTime += seconds;
    }
  }

  /**
   * Increases the volume by 10%
   * The volume will not exceed 100%
   */
  upVolume(): void {
    this.volume = Math.min(this.volume + 0.1, 1);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Decreases the volume by 10%
   * The volume will not go below 0%
   */
  downVolume(): void {
    this.volume = Math.max(this.volume - 0.1, 0);
    this.volume = parseFloat(this.volume.toFixed(2));
  }

  /**
   * Sets the volume to a specific level
   * @param {number} level - A value between 0 and 1
   */
  setVolume(level: number): void {
    if (level < 0 || level > 1) {
      throw new Error('Volume level must be between 0 and 1');
    }

    this.volume = parseFloat(level.toFixed(2));
  }

  /**
   * Toggles the mute state of the audio element
   */
  mute(): void {
    this.muted = !this.muted;
  }

  // updateMediaSessionMetadata method removed - RPlayer no longer handles media session updates

  /**
   * Cleans up resources when the player is no longer needed
   * Stops any playback and releases all resources
   */
  destroy(): void {
    this.stop();

    // Remove all event listeners
    this.playbackHandlers.length = 0;
    this.errorHandlers.length = 0;

    // MediaSession cleanup removed - RPlayer no longer handles media session

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
