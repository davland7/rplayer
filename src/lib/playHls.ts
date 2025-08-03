import Hls from 'hls.js';
import { logger } from './index.js';

export { Hls };

/**
 * Play the provided HLS source.
 * @param {HTMLAudioElement} audioElement - The audio element to play the HLS stream.
 * @param {string} src - The source URL of the HLS stream.
 * @param {Object} options - Optional configuration
 * @param {boolean} options.autoplay - Whether to attempt autoplay (default: true)
 * @returns {Hls|null} The HLS.js instance or null if not supported
 */
export function playHls(audioElement: HTMLAudioElement, src: string, options = { autoplay: true }) {
  if (Hls.isSupported()) {
    const config = {
      abrEwmaDefaultEstimate: 50000,
      maxBufferLength: 60,
      maxMaxBufferLength: 120,
      maxBufferSize: 60 * 1000 * 1000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 4,
      fragLoadingRetryDelay: 500,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 500,
    };

    const hls = new Hls(config);
    hls.loadSource(src);
    hls.attachMedia(audioElement as HTMLVideoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      logger.info('HLS manifest parsed successfully');
      if (options.autoplay) {
        logger.info('Attempting autoplay as requested');
        const playPromise = audioElement.play();
        if (playPromise !== null) {
          playPromise.catch((error) => {
            logger.warn(`HLS autoplay failed: ${error.message}`);
          });
        }
      } else {
        logger.info('Autoplay disabled, waiting for user action');
      }
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      logger.error(`HLS Error: Type ${data.type} - Details: ${data.details}`);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            logger.info("Fatal network error, attempting recovery...");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            logger.info("Fatal media error, attempting recovery...");
            hls.recoverMediaError();
            break;
          default:
            logger.info("Unrecoverable fatal error, destroying HLS instance.");
            hls.destroy();
            break;
        }
      }
    });
    return hls;
  } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
    logger.info("HLS.js is not supported, but native HLS playback is possible (e.g., Safari).");
    audioElement.src = src;
    audioElement.addEventListener('loadedmetadata', () => {
      logger.info("HLS stream loaded using native support.");
      if (options.autoplay) {
        logger.info("Attempting to play HLS stream using native support.");
        audioElement.play().catch(error => {
          logger.warn("Autoplay was blocked by the browser.", error);
        });
      } else {
        logger.info("Autoplay disabled for native HLS, waiting for user action");
      }
    });
  } else {
    logger.error('HLS is not supported in this browser.');
  }
}
