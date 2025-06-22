/**
 * Simple script to test the size impact of dynamic import of hls.js
 */

// Simulate normal import (will be bundled with the full size)
import RPlayerWithHls from './index';
console.log('Size with bundled hls.js:', 'Includes full hls.js library (~500KB minified)');

// Simulate dynamic import (won't be in the initial bundle)
const RPlayerWithDynamicHls = async () => {
  // Only imports hls.js when needed
  const { default: RPlayer } = await import('./index');
  return new RPlayer();
};
console.log('Size with dynamic hls.js:', 'Initial bundle is much smaller, hls.js loaded only if needed');

// Usage example
async function demoStreamWithDynamicImport() {
  const player = await RPlayerWithDynamicHls();

  // Play a normal audio file (no hls.js loaded)
  await player.playSrc('https://example.com/audio.mp3');
  console.log('Playing MP3, no hls.js loaded');

  // Play an HLS stream (hls.js loaded dynamically only for this)
  await player.playSrc('https://example.com/stream.m3u8');
  console.log('Playing HLS, hls.js loaded on demand');
}
