
# RPlayer

| [![npm version](https://img.shields.io/npm/v/@davland7/rplayer?style=flat-square)](https://www.npmjs.com/package/@davland7/rplayer) | [![](https://data.jsdelivr.com/v1/package/npm/@davland7/rplayer/badge)](https://www.jsdelivr.com/package/npm/@davland7/rplayer) | [![license](https://img.shields.io/npm/l/@davland7/rplayer?style=flat-square)](https://github.com/davland7/rplayer/blob/main/LICENSE) |
|:-:|:-:|:-:|

RPlayer is a JavaScript/TypeScript audio library for playing radio streams, compatible with many formats: HLS (.m3u8), MP3 (.mp3), AAC (.aac), and more.

## What's new in 3.0.0

- Complete rewrite in TypeScript with improved typing
- Advanced error handling and recovery for HLS streams
- Native M3U playlist support with `playM3u()`, `next()`, and `previous()` methods
- Full playlist navigation capabilities
- Detailed loading status events with `onLoadingStatusChange()` method
- Better user feedback during media loading and buffering
- Support for displaying custom loading messages
- Enhanced stability for streaming radio stations
- Better autoplay management according to browser restrictions

## Browser autoplay restrictions

Most modern browsers restrict audio autoplay: user interaction is often required before playback can start. RPlayer handles these restrictions elegantly:

- The `loadSrc()` method allows preloading without starting playback
- The React component accepts the `autoplay` prop to control initial behavior
- Automatic detection of user interaction to enable playback
- Clear status indicators when media is loaded but waiting for interaction

## React & modern frameworks integration

RPlayer works with all modern JavaScript frameworks. For React, Next.js, Astro, etc., make sure the Player component is rendered client-side only (RPlayer depends on browser APIs like Audio and MediaSession).

- **React**: Import and use the Player component normally.
- **Next.js**: Use dynamic import with `ssr: false` to load the Player client-side.
- **Astro**: Use `client:only="react"` to avoid SSR rendering.

## Installation

### NPM

```bash
npm install @davland7/rplayer
```

```javascript
import RPlayer from '@davland7/rplayer';
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.6.1/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@3.0.0/lib/rplayer.umd.min.js"></script>
```

```javascript
const audio = new RPlayer();
```

RPlayer extends [Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) (HTMLMediaElement).

## Playback

The native `play()` method does not work with HLS:

```javascript
const audio = new Audio('URL.m3u8');
audio.play(); // Does not work with HLS
```

Instead, use:

```javascript
audio.playSrc('URL.m3u8'); // Works with HLS
```

> **Important**
> For HLS, use hls.js on Windows/Android. On iPhone/iPad, HLS is native.

RPlayer also supports .mp3, .aac, .ogg, etc.:

```javascript
audio.playSrc('URL.aac');
```

> **Tip**
> You can use RPlayer without hls.js if you don't play .m3u8 files.

## Volume

Volume ranges from 0 (mute) to 1 (max).

```javascript
// Set volume to 50%
audio.volume = 0.5;
// Read current volume
const currentVolume = audio.volume;
```

## Additional functions

### Stop

```javascript
audio.stop();
```

### Mute

```javascript
audio.mute();
```

### Rewind

```javascript
audio.rewind(10); // seconds
```

### Volume +

```javascript
audio.upVolume();
```

### Volume -

```javascript
audio.downVolume();
```

### M3U Playlist Support

Play an M3U playlist file:

```javascript
// Create a new RPlayer instance
const audio = new RPlayer();

// Play an M3U playlist
audio.playM3u('/path/to/playlist.m3u');

// Navigate the playlist
audio.next();     // Play the next track in the playlist
audio.previous(); // Play the previous track in the playlist
```

## Loading Status Events

RPlayer provides detailed loading status events to improve user experience, especially useful for slow connections or streaming content that takes time to load:

```javascript
// Create a new player instance
const player = new RPlayer();

// Register for loading status changes
player.onLoadingStatusChange((status, message) => {
  switch(status) {
    case 'loading':
      showLoadingSpinner();
      setStatusMessage(message || 'Loading media...');
      break;
    case 'buffering':
      showBufferingIndicator();
      setStatusMessage(message || 'Buffering...');
      break;
    case 'ready':
      hideLoadingIndicators();
      setStatusMessage('Ready to play');
      break;
    case 'error':
      showErrorIcon();
      setStatusMessage(message || 'Error loading media');
      break;
  }
});

// Start playback
player.playSrc('https://example.com/stream.mp3');
```

Available status values:
- `loading`: Initial loading has started
- `buffering`: Media is loading more data (e.g., during waiting or stalled states)
- `ready`: Media is ready to play without interruption
- `error`: An error occurred while loading or playing

Each status update includes an optional message with more details about the current state.

Example of usage:

```javascript
// Simple playlist player with navigation
const player = new RPlayer();
await player.playM3u('/radio-stations.m3u');

// Set up buttons for navigation
document.getElementById('nextBtn').addEventListener('click', () => player.next());
document.getElementById('prevBtn').addEventListener('click', () => player.previous());
document.getElementById('stopBtn').addEventListener('click', () => player.stop());

// Get current playlist information
const playlistInfo = player.getCurrentPlaylist();
if (playlistInfo) {
  console.log(`Currently playing track ${playlistInfo.index + 1} of ${playlistInfo.playlist.length}`);
  console.log(`Current track: ${playlistInfo.playlist[playlistInfo.index].title}`);
}
```

> **Note iOS**
> On iPhone/iPad, volume is physically controlled by the user. The volume property always returns 1.

## timeupdate event

```javascript
audio.ontimeupdate = function() {
  console.log('Time:', audio.currentTime);
};
```

## Useful info

```javascript
console.log('Source:', audio.url);
console.log('Playing:', audio.playing);
console.log('Paused:', audio.paused);
console.log('Muted:', audio.muted);
console.log('Volume:', audio.volume * 100);
console.log('hls.js:', audio.isHls);
console.log('Time:', audio.currentTime);

// Monitor loading status
audio.onLoadingStatusChange((status, message) => {
  console.log(`Loading status: ${status}`, message);
});
```
