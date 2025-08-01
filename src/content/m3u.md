# M3U Playlist Demo

This page demonstrates how RPlayer handles standard .m3u playlist files.

M3U playlists are text files that contain a list of media files or streams that can be played sequentially.

RPlayer supports automatic parsing and playback of M3U playlist files, allowing you to easily integrate playlist support in your applications.

## Playing an M3U Playlist

To play an M3U playlist, you can use the `playM3u()` method provided by the RPlayer class. This method fetches the playlist file, parses it, and starts playback of the first track.

```javascript
// Create a new RPlayer instance
const audio = new RPlayer();

// Play an M3U playlist
audio.playM3u('https://rplayer.js.org/mini-radio.m3u');

// Navigate the playlist
audio.next(); // Play the next track in the playlist
audio.previous(); // Play the previous track in the playlist
```

## mini-radio Playlist Demo

This player uses RPlayer to play a .m3u playlist of Canadian radio stations.
