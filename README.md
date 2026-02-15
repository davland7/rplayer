# RPlayer III — Minimal Audio Stream Controller

Dependency-free controller for `HTMLAudioElement`, designed for streaming URLs. Built for modern apps, browser extensions, and lightweight UIs. Mobile-ready.

[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@davland7/rplayer/badge)](https://www.jsdelivr.com/package/npm/@davland7/rplayer) [![npm version](https://img.shields.io/npm/v/@davland7/rplayer.svg)](https://www.npmjs.com/package/@davland7/rplayer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview
- Simple API wrapping `HTMLAudioElement`
- Native HLS detection helpers (HLS.js not included)
- Works great in browser extensions and small UIs
- Zero dependencies, tiny footprint

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

[React Demo (CodeSandbox)](https://codesandbox.io/p/github/davland7/rplayer-react-demo/main)

### Autoplay Policy (Important)

Browsers require user interaction before playing audio. Calling `audio.play()` without a user gesture (click/tap) will be blocked and may throw a `DOMException`.

**Best practices:**
- Always wrap `audio.play()` in a user-initiated event (click, tap)
- Use `player.togglePlay()` for combined play/pause buttons
- Handle the promise from `play()` to catch autoplay blocks

```js
try {
  await audio.play();
} catch (err) {
  console.warn('Playback blocked by browser:', err);
  // Show a play button or notification to user
}
```

## HLS (.m3u8) Support

RPlayer v3 does not bundle HLS.js. It provides detection helpers and leaves integration up to you.

- `RPlayer.supportsHls()` — detects if the browser supports native HLS playback
- `RPlayer.isHls(url)` — detects HLS URLs by extension (`.m3u8`, `.m3u`) or path patterns (`/hls/`)
- Safari supports HLS natively. Chrome has partial support. Firefox does not.
- Browser compatibility: https://caniuse.com/?search=hls

**Recommendation: Use HLS.js for production**

Even when native support exists, [HLS.js](https://github.com/video-dev/hls.js/) provides more reliable cross-browser playback. Native HLS support can be inconsistent, especially on Chrome.

Integrate HLS.js manually in your app. See the [HLS.js documentation](https://github.com/video-dev/hls.js/#getting-started) for setup instructions.

## iOS Considerations

**iPad and iPhone** enforce volume control through hardware buttons only. Software volume controls have no effect on iOS devices.

**Recommendations:**
- Use `RPlayer.isIos()` to detect iOS devices (iPad, iPhone, iPod)
- Disable software volume buttons on iOS (they will not work)
- Native media session controls work automatically on iOS
- iPadOS 13+ is detected correctly (reports as macOS but with touch support)

```js
const isIos = RPlayer.isIos();

// Disable volume buttons on iOS (hardware buttons only)
volumeUpBtn.disabled = isIos;
volumeDownBtn.disabled = isIos;
```

## API Reference

### Class: `RPlayer`
- `attachMedia(audioElement)`: Attach an `HTMLAudioElement` to control
- `togglePlay()`: Toggle play/pause state. Returns the `play()` promise when resuming, so you can catch autoplay rejections
- `stop(forceClear = false)`: Pause and reset to 0; if `forceClear` is `true`, also clears `src`
- `rewind(seconds = 10)`: Seek backward by `seconds` (minimum 0)
- `volumeUp()`: Increase volume by 0.1 (clamped to 1.0)
- `volumeDown()`: Decrease volume by 0.1 (clamped to 0.0)
- `toggleMute()` / `mute()`: Toggle muted state (`mute()` is an alias for `toggleMute()`)
- `get isPlaying`: Returns `true` if audio is not paused
- `get isMuted`: Returns `true` if audio is muted

### Static Helpers
- `RPlayer.supportsHls()`: Returns `true` if browser supports native HLS (Safari: yes, Chrome: partial, Firefox: no)
- `RPlayer.isHls(url)`: Detects HLS URLs (`.m3u8`, `.m3u`, `/hls/` in path)
- `RPlayer.isIos()`: Detects iOS devices (iPad, iPhone, iPod — including iPadOS 13+ which reports as macOS)

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
- RPlayer focuses on controlling the native `HTMLAudioElement` and remains dependency-free
- HLS.js is optional in v3; integrate it manually if targeting browsers without native HLS support
- Helper methods (`isHls()`, `supportsHls()`, `isIos()`) are provided as static utilities and do not enforce a specific integration strategy
- `togglePlay()` returns the `play()` promise — always handle it to avoid uncaught `DOMException` errors
