// Interface pour les statistiques de lecture HLS
export interface HlsStats {
  bandwidth: number;        // Estimation du débit en bits par seconde
  droppedFrames: number;    // Nombre d'images perdues
  bufferLength: number;     // Longueur du tampon en secondes
  currentLevel: number;     // Niveau de qualité actuel
  totalLevels: number;      // Nombre total de niveaux de qualité disponibles
  loadLatency: number;      // Latence de chargement en millisecondes
}

// Type pour les callbacks de statistiques
export type StatsCallback = (stats: HlsStats) => void;

/**
 * Play or load the provided HLS source with dynamic loading of hls.js if needed.
 * @param {HTMLAudioElement} audioElement - The audio element to play the HLS stream.
 * @param {string} src - The source URL of the HLS stream.
 * @param {StatsCallback} [onStatsUpdate] - Optional callback function for streaming statistics updates
 * @param {boolean} [autoplay=true] - Whether to start playback automatically
 * @returns {Promise<any|null>} - The Hls instance if created, or null if native HLS is used
 */
export async function playHls(
  audioElement: HTMLAudioElement,
  src: string,
  onStatsUpdate?: StatsCallback,
  autoplay: boolean = true
): Promise<any | null> {
  // First check if we can use native HLS support (Safari/iOS)
  if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
    console.log('Using native HLS support');
    audioElement.src = src;

    return new Promise((resolve) => {
      audioElement.addEventListener('loadedmetadata', () => {
        if (autoplay) {
          const playPromise = audioElement.play();

          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Auto-play was prevented, user interaction may be needed', error);
            });
          }
        }

        resolve(null); // Return null as we're using native HLS support
      }, { once: true });
    });
  }

  // Otherwise, try to dynamically import hls.js
  try {
    const { default: Hls } = await import('hls.js');

    // If HLS.js is supported, use it
    if (Hls.isSupported()) {
      // Create a new HLS instance with improved error recovery
      const hls = new Hls({
        // Add some configuration for better performance and reliability
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        enableWorker: true,
        lowLatencyMode: true,
        // Error recovery settings
        fragLoadingMaxRetry: 5,
        manifestLoadingMaxRetry: 5,
        levelLoadingMaxRetry: 5
      });

      // Setup error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.warn('Network error encountered, trying to recover', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Try to recover media error
              console.warn('Media error encountered, trying to recover', data);
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover from other fatal errors
              console.error('Fatal error encountered, cannot recover', data);
              break;
          }
        }
      });

      // Set up stats monitoring if callback is provided
      if (onStatsUpdate) {
        const statsInterval = 3000; // Update stats every 3 seconds
        const statsTimer = setInterval(() => {
          if (hls) {
            // Calculate buffer length
            let bufferLength = 0;
            if (hls.media && hls.media.buffered.length > 0) {
              bufferLength = hls.media.buffered.end(hls.media.buffered.length - 1) - hls.media.currentTime;
            }

            const hlsStats: HlsStats = {
              bandwidth: hls.bandwidthEstimate,
              droppedFrames: 0, // Need to calculate from media element if needed
              bufferLength: bufferLength,
              currentLevel: hls.currentLevel,
              totalLevels: hls.levels ? hls.levels.length : 0,
              loadLatency: 0  // Hls.js v1.6.1 doesn't expose this directly through typed properties
            };

            onStatsUpdate(hlsStats);
          }
        }, statsInterval);

        // Clean up the timer when media is detached
        hls.on(Hls.Events.MEDIA_DETACHING, () => {
          clearInterval(statsTimer);
        });
      }

      // Load the source and attach to audio element
      hls.loadSource(src);
      hls.attachMedia(audioElement as HTMLVideoElement);

      // Start playback when manifest is parsed (if autoplay is enabled)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          const playPromise = audioElement.play();

          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Auto-play was prevented, user interaction may be needed', error);
            });
          }
        }
      });

      return hls;
    } else {
      throw new Error('HLS.js is not supported in this browser');
    }
  } catch (error) {
    console.error('Failed to load or initialize hls.js:', error);
    throw new Error('Failed to load or initialize HLS support: ' + (error instanceof Error ? error.message : String(error)));
  }
}

