# RPlayer III — Minimal Audio Stream Controller

Dependency‑free helper for controlling an `HTMLAudioElement` and working with streaming URLs. Built for modern apps and lightweight extensions. Mobile‑ready.

[![](https://data.jsdelivr.com/v1/package/npm/@davland7/rplayer/badge)](https://www.jsdelivr.com/package/npm/@davland7/rplayer)
[![](https://img.shields.io/npm/v/@davland7/rplayer.svg)](https://www.npmjs.com/package/@davland7/rplayer)

---

## Overview
- Simple API over `HTMLAudioElement`
- Native HLS detection (no HLS.js bundled)
- Works great in extension popups and small UIs
- No dependencies, tiny footprint

See the demo in `index.html` or run `npm run dev` to explore.

## Install

### NPM
```bash
npm install @davland7/rplayer
```

### CDN (jsDelivr)
```html
<script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@latest/dist/rplayer.umd.cjs"></script>
```

## ESM vs UMD

This library ships both ESM and UMD builds.

- ESM (modern bundlers, frameworks):
  - Import: `import RPlayer from '@davland7/rplayer'`
  - Entry: `module` points to `dist/rplayer.js`
  - Recommended for Vite, Webpack, Rollup, etc.

- UMD (script tag / no bundler):
  - File: `dist/rplayer.umd.cjs`
  - Global name: `window.RPlayer` (configured via Vite `build.lib.name`)
  - Usage:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@latest/dist/rplayer.umd.cjs"></script>
    <script>
      const player = new window.RPlayer();
      const audio = document.querySelector('audio');
      player.attachMedia(audio);
      audio.src = 'https://example.com/stream.mp3';
      audio.play();
    </script>
    ```

## Quick Start
```html
<audio id="audio" preload="none"></audio>
<button id="play">Play / Pause</button>
```

```js
import RPlayer from '@davland7/rplayer';

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');

const player = new RPlayer();
player.attachMedia(audio);

// Load any stream URL (HTTP/HTTPS). User gesture required to play in browsers.
audio.src = 'https://example.com/stream.mp3';

playBtn.addEventListener('click', () => player.togglePlay());
```

### Autoplay Policy (Important)
- Browsers often require a user gesture to start audio. Calling `audio.play()` may reject with a `DOMException` if initiated without a direct click/tap.
- Handle the promise from `play()` and provide a friendly message or re‑enable the play button.

```js
try {
  await audio.play();
} catch (err) {
  // Playback blocked by browser (user action required)
  console.warn('Playback blocked:', err);
}
```

## HLS (.m3u8) Support

RPlayer v3 does not bundle HLS.js. It prefers native HLS where available and leaves optional HLS.js integration to you if needed.

- `player.supportsHls()` checks if the current browser can natively play HLS via `canPlayType('application/vnd.apple.mpegurl')`.
- `RPlayer.isHls(url)` detects HLS URLs by extension (`.m3u8`, `.m3u`).
- Safari (macOS/iOS) generally supports HLS natively. Chrome has begun introducing native/partial HLS support; check current status. Firefox typically does not.
- Browser support reference: https://caniuse.com/?search=hls

### Recommended Pattern
If your URL is HLS and the browser does not support HLS natively, you can integrate HLS.js yourself:

```html
<!-- Load HLS.js from CDN only when you need it -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
```

```js
import RPlayer from '@davland7/rplayer';

const audio = document.getElementById('audio');
const player = new RPlayer();
player.attachMedia(audio);

async function playStream(url) {
  const isHls = RPlayer.isHls(url);
  const hasNative = player.supportsHls();

  if (!isHls || hasNative) {
    audio.src = url;
    await audio.play();
    return;
  }

  // Use HLS.js for non‑native browsers
  if (window.Hls?.isSupported()) {
    // Clean previous instance if any
    if (audio._hlsInstance) {
      audio._hlsInstance.destroy();
      audio._hlsInstance = null;
    }
    const hls = new window.Hls();
    audio._hlsInstance = hls;
    hls.loadSource(url);
    hls.attachMedia(audio);
    await audio.play();
  } else {
    // Fallback: assign URL; some environments may still handle it
    audio.src = url;
    await audio.play();
  }
}
```

## Browser Support
- Native HLS: Safari (macOS/iOS) supports HLS; Chrome has begun introducing native/partial HLS support; Firefox typically does not.
- Check current status: https://caniuse.com/?search=hls

Notes:
- RPlayer does not import or manage HLS.js internally in v3.
- If you bundle HLS.js via ESM (e.g., `import Hls from 'hls.js'`), use the same logic as above with the imported `Hls` instead of `window.Hls`.
- Prefer native HLS on Safari/iOS when available.

### Media Session API (Lock Screen Controls)

RPlayer works seamlessly with the [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) to provide lock screen and notification controls on supported platforms.

**iOS Considerations:**
- iOS Safari uses **native physical buttons** (play/pause, volume) that work automatically with `<audio>` elements
- Setting custom `navigator.mediaSession.setActionHandler()` on iOS can interfere with native controls
- **Volume control:** iOS manages volume exclusively through physical buttons; software volume buttons should be disabled
- **Recommendation:** Skip media session handlers on iOS and disable volume buttons:

```js
// Example: Conditionally register media session handlers and controls
const isIos = RPlayer.isIos();

if (!isIos && 'mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Stream Title',
    artist: 'RPlayer III',
    artwork: [{ src: '/icon.png', sizes: '128x128', type: 'image/png' }]
  });

  navigator.mediaSession.setActionHandler('play', () => player.togglePlay());
  navigator.mediaSession.setActionHandler('pause', () => player.togglePlay());
}

// Disable volume buttons on iOS
volumeUpBtn.disabled = isIos;
volumeDownBtn.disabled = isIos;
```

**Desktop/Android:**
- Media session handlers work well and provide lock screen/notification controls
- Software volume controls function as expected
- Metadata (title, artist, artwork) enhances the user experience

## API Reference

### Class: `RPlayer`
- `attachMedia(audioElement)`: Attach an `HTMLAudioElement` to control.
- `togglePlay()`: Toggle play/pause.
- `stop(forceClear = false)`: Pause, reset to 0; if `true`, also clear `src`.
- `rewind(seconds = 10)`: Seek backward by `seconds` (min 0).
- `volumeUp()`: Increase volume by step (default `0.1`).
- `volumeDown()`: Decrease volume by step (default `0.1`).
- `toggleMute()` / `mute()`: Toggle muted state.
- `supportsHls()`: Return native HLS capability for the attached audio.
- `get isPlaying`: `true` if not paused.
- `get isMuted`: `true` if muted.

### Static Helpers
- `RPlayer.isHls(url)`: Detect `.m3u8`/`.m3u` URLs.
- `RPlayer.isIos()`: Best‑effort iOS device detection.

## Types
Type definitions are published at `types/rplayer.d.ts` for TS consumers.

### TypeScript Example
```ts
import RPlayer from '@davland7/rplayer';

const audio = document.getElementById('audio') as HTMLAudioElement;
const player = new RPlayer();
player.attachMedia(audio);

audio.src = 'https://example.com/stream.mp3';
await audio.play().catch(console.warn);

// Helpers
const isHls = RPlayer.isHls(audio.src);
const isIos = RPlayer.isIos();
```

## Demo / Development
Run the demo locally with Vite:

```bash
npm install
npm run dev
```

Build the library:
```bash
npm run build
```

### Extension Popup Pattern
See the minimal demo UI in [index.html](index.html). It demonstrates an extension‑style popup layout with small controls, ellipsis for long URLs, and badge indicators.

### Build & Tooling
- Runtime dependencies: none — the library is dependency‑free.
- Dev/build tooling: Vite is used to develop and build the library outputs (`module` and `umd`).

## Notes for Developers
- RPlayer focuses on controlling the native `HTMLAudioElement` and remains dependency‑free.
- HLS.js is entirely optional in v3; integrate it manually if your app targets non‑native HLS browsers and HLS streams.
- See the copy and messaging in `index.html` for an example UI and recommended UX wording.