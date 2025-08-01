/**
 * Interface for track information in M3U playlists
 */
export interface M3UTrackInfo {
  url: string;
  title: string;
}

/**
 * Processes a standard M3U playlist (non-HLS).
 * Downloads and parses an M3U playlist.
 * @param player - The RPlayer instance to use for playback
 * @param url - The URL of the M3U playlist
 * @returns Promise that resolves with the first track URL when ready, or rejects on error
 */
export async function playM3u(player: HTMLAudioElement, url: string): Promise<string> {
  try {
    console.log(`Fetching M3U playlist from: ${url}`);

    // Special handling for local files (the URL may already be a local or relative path)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // It's a local URL, build an absolute URL
      const origin = window.location.origin;
      // Handle absolute and relative paths
      if (url.startsWith('/')) {
        url = origin + url;
      } else {
        // For relative paths like './playlist.m3u' or 'playlist.m3u'
        url = origin + '/' + url.replace(/^\.\//, '');
      }
      console.log(`Local file detected, using absolute URL: ${url}`);
    }

    // Fetch the playlist content with a 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Add options to avoid CORS issues
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        credentials: 'same-origin'
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch M3U playlist: ${response.status}`);
      }

      const content = await response.text();
      console.log(`M3U content fetched, size: ${content.length} bytes`);

      // Parse the playlist content
      const lines = content.split('\n');
      const mediaUrls: {url: string; title: string}[] = [];
      let currentTitle = '';

      // Extract media URLs with their titles
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Ignore empty lines
        if (!line) continue;

        // Handle EXTINF metadata (titles)
        if (line.startsWith('#EXTINF:')) {
          // Standard format: #EXTINF:duration,title
          // The first comma after #EXTINF:duration separates duration from title
          // Everything after this first comma is part of the title, even if the title contains other commas
          const parts = line.split(',');
          if (parts.length >= 2) {
            // Get the title (everything after the first comma)
            // Join all parts after the first comma (in case the title contains commas)
            currentTitle = parts.slice(1).join(',').trim();
          }
          continue;
        }

        // Ignore other comments and directives
        if (line.startsWith('#')) continue;

        // If it's a URL, add it with its title
        // Check if it's an absolute or relative URL
        let mediaUrl = line;

        // If it's a relative URL, make it absolute relative to the playlist URL
        if (!line.match(/^(https?:\/\/|rtmp:\/\/|rtsp:\/\/)/i)) {
          try {
            const baseUrl = new URL(url);
            const resolvedUrl = new URL(line, baseUrl.href);
            mediaUrl = resolvedUrl.href;
          } catch (e) {
            console.warn(`Could not resolve relative URL: ${line}`, e);
          }
        }

        // Check if the URL is likely an audio stream
        // For radio streams, we should accept m3u8 files as they're commonly used for audio streaming
        const isLikelyAudio =
          mediaUrl.match(/\.(mp3|aac|ogg|opus|wav|m4a)$/i) ||
          mediaUrl.includes('audio') ||
          mediaUrl.includes('livestream') ||
          mediaUrl.includes('stream') ||
          mediaUrl.includes('radio') ||
          (!mediaUrl.includes('video') &&
           !mediaUrl.match(/\.(mp4|mkv|avi|mov|flv|wmv)$/i));

        if (isLikelyAudio) {
          mediaUrls.push({
            url: mediaUrl,
            title: currentTitle || `Track ${mediaUrls.length + 1}`
          });
        }

        // Reset the title for the next entry
        currentTitle = '';
      }

      console.log(`Found ${mediaUrls.length} audio URLs in playlist`);

      // Check if any URLs were found
      if (mediaUrls.length === 0) {
        throw new Error('No audio URLs found in M3U playlist');
      }

      // Use the first URL
      const firstTrack = mediaUrls[0];
      console.log(`Found first entry in M3U playlist: ${firstTrack.title} (${firstTrack.url})`);

      // Store all tracks in a global variable to allow navigation between them later
      if (typeof window !== 'undefined') {
        window.__currentM3UPlaylist = mediaUrls;
        window.__currentM3UIndex = 0;
      }

      // Store track title as a custom property on the audio element
      if (player instanceof HTMLAudioElement) {
        // Use a more specific type assertion
        (player as HTMLAudioElement & { __trackTitle?: string; __trackSource?: string }).__trackTitle = firstTrack.title || '';
        (player as HTMLAudioElement & { __trackTitle?: string; __trackSource?: string }).__trackSource = 'M3U Playlist';
      }

      // Instead of playing directly, we return the first entry's URL
      // so RPlayer can handle it according to its type (HLS, MP3, etc.)
      return firstTrack.url;
    } catch (error) {
      console.error('Error fetching M3U playlist:', error);
      throw new Error(`Timeout or network error fetching playlist: ${error instanceof Error ? error.message : String(error)}`);
    }

  } catch (error) {
    console.error('Error playing M3U playlist:', error);
    throw new Error(`Failed to play M3U playlist: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Plays the previous track in the current M3U playlist
 * @returns Promise that resolves with the URL of the previous track when ready
 */
export async function playPreviousTrack(): Promise<string> {
  // Access the global playlist
  const playlist = window.__currentM3UPlaylist || [];
  if (!playlist.length) {
    throw new Error('No playlist available');
  }

  // Calculate previous index with wraparound
  const currentIndex = window.__currentM3UIndex || 0;
  const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;

  // Update the global index
  window.__currentM3UIndex = prevIndex;

  // Get the previous station
  const prevStation = playlist[prevIndex];
  console.log(`[RPlayer M3U] Moving to previous track: ${prevStation.title}`);

  // Return the URL to play
  return prevStation.url;
}

/**
 * Plays the next track in the current M3U playlist
 * @returns Promise that resolves with the URL of the next track when ready
 */
export async function playNextTrack(): Promise<string> {
  // Access the global playlist
  const playlist = window.__currentM3UPlaylist || [];
  if (!playlist.length) {
    throw new Error('No playlist available');
  }

  // Calculate next index with wraparound
  const currentIndex = window.__currentM3UIndex || 0;
  const nextIndex = (currentIndex + 1) % playlist.length;

  // Update the global index
  window.__currentM3UIndex = nextIndex;

  // Get the next station
  const nextStation = playlist[nextIndex];
  console.log(`[RPlayer M3U] Moving to next track: ${nextStation.title}`);

  // Return the URL to play
  return nextStation.url;
}

/**
 * Gets the current playlist information
 * @returns The current playlist and index or null if no playlist is loaded
 */
export function getCurrentPlaylist(): { playlist: Array<{ title: string; url: string }>, index: number } | null {
  if (!window.__currentM3UPlaylist || window.__currentM3UPlaylist.length === 0) {
    return null;
  }

  return {
    playlist: window.__currentM3UPlaylist,
    index: window.__currentM3UIndex || 0
  };
}
