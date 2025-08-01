# CLAUDE Documentation

## Project Overview

This document outlines the work completed by Claude on the RPlayer project - a lightweight audio player library with specialized features for streaming radio content.

## Contributions

### Mini Radio Integration

Created a specialized mini-radio.m3u player demonstration that shows RPlayer's capabilities:

- **M3U Playlist Support**: Enhanced RPlayer to handle standard .m3u playlists beyond HLS streams
- **Station Navigation**: Implemented previous/next controls for moving between stations in a playlist
- **MediaSession Integration**: Added MediaSession API support for hardware media key control
- **Bilingual Support**: Translated the UI from French to English for international usage

### Technical Implementations

1. **Playlist Parsing**:
   - Created playM3u.ts module to handle fetching and parsing .m3u files
   - Built support for EXTINF metadata extraction to display station titles
   - Fixed title parsing for entries with commas (e.g., "CHOI 98,1 - Québec")
   - Enhanced audio detection to properly identify HLS audio streams (.m3u8)

2. **UI Enhancements**:
   - Added visual playlist content display
   - Implemented debug logging system for development
   - Created responsive controls for station navigation
   - Added loading state events for better user experience

3. **MediaSession Integration**:
   - Added artwork and metadata support for OS-level media controls
   - Implemented previous/next handlers for external playback control

4. **Build & Deployment Optimizations**:
   - Added dependency caching for faster GitHub Actions workflows
   - Implemented build caching for library and Astro components
   - Added version checking to prevent duplicate NPM publications
   - Created test script to validate M3U parsing logic

## Mini Radio Feature

The Mini Radio demonstration shows how RPlayer can be used to create specialized radio player applications:

- Loads and displays .m3u playlist content
- Provides intuitive playback controls
- Shows current station information
- Offers station navigation
- Works with both MediaSession API and on-screen controls
- Properly detects and plays all radio stations including HLS streams

## Usage Example

```javascript
// Initialize player
const player = new RPlayer();

// Play an M3U playlist - RPlayer will handle parsing
await player.playSrc('/mini-radio.m3u');

// MediaSession integration
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "Current Station Name",
    artist: "Mini Radio Playlist",
    album: "Mini Radio",
    artwork: [{ src: '/image.png', sizes: '192x192', type: 'image/png' }]
  });
  
  // Add navigation controls
  navigator.mediaSession.setActionHandler('previoustrack', previousStationHandler);
  navigator.mediaSession.setActionHandler('nexttrack', nextStationHandler);
}
```

## Any plans to support parsing of timed ID3 metadata to get 'now playing' info?

This is a feature request from users. Timed ID3 metadata would allow the player to display real-time 'now playing' information (such as current song title and artist) as broadcast by some radio streams. Implementation would require parsing timed metadata from the audio stream and updating the UI accordingly. This is not currently supported, but is under consideration for future versions.

## Technical Challenges Solved

### M3U Title Parsing with Commas

The original regex-based title parsing incorrectly handled titles containing commas. For example:
- `#EXTINF:-1,CHOI 98,1 - Québec` was parsed as `1 - Québec` (incorrect)
- Our solution using `split()` and `join()` correctly extracts `CHOI 98,1 - Québec`

### HLS Audio Stream Detection

Fixed the audio stream detection logic to properly identify HLS audio streams (.m3u8 files):
- Added detection for URLs containing keywords like 'livestream', 'stream', or 'radio'
- Fixed issue where only 7 out of 16 radio stations were being detected in sample playlists
- Implemented relative URL resolution for playlist entries

### Loading State Management

Added comprehensive loading state events to improve user experience:
- `onLoadingStatusChange` event for external handling of loading states
- Better buffering detection for smoother playback transitions

---

*Documentation created by Claude - June 19, 2025*  
*Updated by Claude - August 1, 2025*
