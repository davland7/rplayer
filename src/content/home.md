# RPlayer 3 coming soon

[![npm version](https://img.shields.io/npm/v/@davland7/rplayer?style=flat-square)](https://www.npmjs.com/package/@davland7/rplayer)

The Next-Gen Radio Player  
Stream Smarter. Listen Better.

A lightweight, powerful audio player for streaming radio.

> **Note:** HLS (.m3u8) playback relies on [hls.js](https://github.com/video-dev/hls.js), a robust library originally designed for video streaming. While RPlayer itself is lightweight, hls.js adds some overhead to enable advanced HLS support in browsers that do not natively support it.

RPlayer automatically detects and adapts to different streaming formats, including HLS (.m3u8) with adaptive bitrate, standard MP3/AAC streams, and M3U playlists. The player handles all the complexity behind the scenes, giving you a simple, unified API.

**Install via npm**

```bash
npm install @davland7/rplayer
```

**Example: Instantly play a stream**

```js
const player = new RPlayer();
player.playSrc('https://example.com/stream.m3u8');
```

👉 See the [full documentation](/documentation) for more usage examples and API details.

---

**Supported Streaming Formats**

- **HLS (.m3u8)**: Adaptive streaming for radio and live audio.
- **Standard formats**: MP3, AAC, OGG, WAV—natively supported.
- **M3U playlists**: Load and play playlists easily. ([Experimental demo](/m3u) — feedback welcome!)

---

**How does the demo work?**

This demo lets you explore RPlayer with real radio data. Stations and genres are loaded live from an open radio directory. You can search, filter, and play any station instantly. All playback is handled locally in your browser—no account or installation needed.
