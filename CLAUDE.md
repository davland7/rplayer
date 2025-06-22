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

2. **UI Enhancements**:
   - Added visual playlist content display
   - Implemented debug logging system for development
   - Created responsive controls for station navigation

3. **MediaSession Integration**:
   - Added artwork and metadata support for OS-level media controls
   - Implemented previous/next handlers for external playback control

## Mini Radio Feature

The Mini Radio demonstration shows how RPlayer can be used to create specialized radio player applications:

- Loads and displays .m3u playlist content
- Provides intuitive playback controls
- Shows current station information
- Offers station navigation
- Works with both MediaSession API and on-screen controls

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

## Future Improvements

Potential enhancements that could be made to the Mini Radio player:

1. Station favorites/bookmarking system
2. Station categories and filtering
3. Stream quality selection for stations with multiple streams
4. Visual equalizer display
5. Station metadata display (current song, etc.)
6. Offline mode with cached station URLs

---

*Documentation created by Claude - June 19, 2025*
