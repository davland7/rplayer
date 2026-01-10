# RPlayer III — Minimal Audio Stream Controller

Dependency‑free helper for controlling an `HTMLAudioElement` and working with streaming URLs. Built for modern apps and lightweight extensions. Mobile‑ready.

[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@davland7/rplayer/badge)](https://www.jsdelivr.com/package/npm/@davland7/rplayer) [![npm version](https://img.shields.io/npm/v/@davland7/rplayer.svg)](https://www.npmjs.com/package/@davland7/rplayer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview
- Simple API over `HTMLAudioElement`
- Native HLS detection (no HLS.js bundled)
- Works great in extension popups and small UIs
- No dependencies, tiny footprint

**🎵 [Live Demo](https://rplayer.js.org/)** | Run locally: `npm run dev`

## Install

### NPM
```bash
npm install @davland7/rplayer
```

### CDN (jsDelivr)
```html
<script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@latest/dist/rplayer.umd.js"></script>
```

## ESM vs UMD

This library ships both ESM and UMD builds.

- ESM (modern bundlers, frameworks):
  - Import: `import RPlayer from '@davland7/rplayer'`
  - Entry: `module` points to `dist/rplayer.js`
  - Recommended for Vite, Webpack, Rollup, etc.

- UMD (script tag / no bundler):
  - File: `dist/rplayer.umd.js`
  - Global name: `window.RPlayer` (configured via Vite `build.lib.name`)
  - Usage:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@latest/dist/rplayer.umd.js"></script>
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
<button id="playPause">Play / Pause</button>
```

```js
import RPlayer from '@davland7/rplayer';

const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPause');

const player = new RPlayer();
player.attachMedia(audio);

// Load any stream URL (HTTP/HTTPS). User gesture required to play in browsers.
audio.src = 'https://example.com/stream.mp3';

playPauseBtn.addEventListener('click', () => player.togglePlay());
```

### Autoplay Policy (Important)
- Browsers often require a user gesture to start audio. Calling `audio.play()` may reject with a `DOMException` if initiated without a direct click/tap.
- Use `player.togglePlay()` for a combined play/pause button
- Use `audio.play()` / `audio.pause()` directly if you need separate controls
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

RPlayer v3 does not bundle HLS.js. It provides detection helpers and leaves HLS.js integration to you if needed.

- `RPlayer.supportsHls()` — checks if the browser claims native HLS support
- `RPlayer.isHls(url)` — detects HLS URLs by extension (`.m3u8`, `.m3u`) or path patterns (`/hls/`)
- Safari supports HLS natively. Chrome has partial/unstable support. Firefox does not.
- Browser compatibility: https://caniuse.com/?search=hls

**Recommendation: Use HLS.js for production**

Even when native support is available, [HLS.js](https://github.com/video-dev/hls.js/) provides more stable and consistent playback across browsers. Native HLS support can be unreliable, especially on Chrome.

Integrate HLS.js manually in your app. See their [documentation](https://github.com/video-dev/hls.js/#getting-started) for setup and usage.

## iOS Considerations

**iPad and iPhone** enforce volume control through physical hardware buttons only. Software volume controls don't work on iOS devices.

**Recommendation:**
- Use `RPlayer.isIos()` to detect iOS devices (iPad/iPhone/iPod)
- Disable software volume buttons on iOS (they won't work)
- Skip custom media session handlers on iOS (native controls work automatically)

```js
const isIos = RPlayer.isIos();

// Disable volume buttons on iOS (uses physical buttons only)
volumeUpBtn.disabled = isIos;
volumeDownBtn.disabled = isIos;
```

## API Reference

### Class: `RPlayer`
- `attachMedia(audioElement)`: Attach an `HTMLAudioElement` to control.
- `togglePlay()`: Toggle play/pause.
- `stop(forceClear = false)`: Pause, reset to 0; if `true`, also clear `src`.
- `rewind(seconds = 10)`: Seek backward by `seconds` (min 0).
- `volumeUp()`: Increase volume by step (default `0.1`).
- `volumeDown()`: Decrease volume by step (default `0.1`).
- `toggleMute()` / `mute()`: Toggle muted state.
- `get isPlaying`: `true` if not paused.
- `get isMuted`: `true` if muted.

### Static Helpers
- `RPlayer.supportsHls()`: Check if browser claims native HLS support (Safari: `true`, Chrome: may be `true` but unreliable, Firefox: `false`).
- `RPlayer.isHls(url)`: Detect HLS URLs (`.m3u8`, `.m3u`, `/hls/` path, `m3u8` in URL).
- `RPlayer.isIos()`: iOS device detection (iPad/iPhone/iPod — disable volume buttons on these devices).

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
**🎵 [Live Demo](https://rplayer.js.org/)**

Run the demo locally with Vite:

```bash
npm install
npm run dev
```

Build the library:
```bash
npm run build
```

## Notes for Developers
- RPlayer focuses on controlling the native `HTMLAudioElement` and remains dependency‑free.
- HLS.js is entirely optional in v3; integrate it manually if your app targets non‑native HLS browsers.
- The library provides helpers (`isHls()`, `supportsHls()`, `isIos()`) but doesn't dictate your integration strategy.
