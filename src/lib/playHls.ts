import Hls from 'hls.js';

export { Hls };

/**
 * Play the provided HLS source.
 * @param {HTMLAudioElement} audioElement - The audio element to play the HLS stream.
 * @param {string} src - The source URL of the HLS stream.
 */
export function playHls(audioElement: HTMLAudioElement, src: string) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(audioElement as HTMLVideoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const playPromise = audioElement.play();
      if (playPromise !== null) {
        playPromise.catch(() => {})
      }
    });
    return hls;
  } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
    audioElement.src = src;
    audioElement.addEventListener('loadedmetadata', () => {
      audioElement.play();
    });
  } else {
    console.error('HLS is not supported in this browser.');
  }
}

