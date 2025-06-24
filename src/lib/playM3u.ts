import { playHls } from './playHls.js';

/**
 * Interface for track information in M3U playlists
 */
export interface M3UTrackInfo {
  url: string;
  title: string;
}

/**
 * Function to process standard M3U playlists (non-HLS)
 * This function downloads and parses an M3U playlist
 * @param player - The RPlayer instance to use for playback
 * @param url - The URL of the M3U playlist
 * @returns Promise that resolves with the first track URL and title when playback starts or rejects on error
 */
export async function playM3u(player: HTMLAudioElement, url: string): Promise<string> {
  try {
    console.log(`Fetching M3U playlist from: ${url}`);

    // Spécial pour les fichiers locaux (peut-être que l'URL est déjà un chemin local ou relatif)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // C'est une URL locale, construisons une URL absolue
      const origin = window.location.origin;
      // Gestion spéciale pour les chemins absolus et relatifs
      if (url.startsWith('/')) {
        url = origin + url;
      } else {
        // Pour les chemins relatifs comme './playlist.m3u' ou 'playlist.m3u'
        url = origin + '/' + url.replace(/^\.\//, '');
      }
      console.log(`Local file detected, using absolute URL: ${url}`);
    }

    // Récupérer le contenu de la playlist avec un délai d'attente de 10 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Ajout des options pour éviter les problèmes CORS
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

      // Parser le contenu de la playlist
      const lines = content.split('\n');
      const mediaUrls: {url: string; title: string}[] = [];
      let currentTitle = '';

      // Extraire les URL des médias avec leurs titres
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Ignorer les lignes vides
        if (!line) continue;

        // Traiter les métadonnées EXTINF (titres)
        if (line.startsWith('#EXTINF:')) {
          const titleMatch = line.match(/#EXTINF:.*,(.+)/);
          if (titleMatch && titleMatch[1]) {
            currentTitle = titleMatch[1].trim();
          }
          continue;
        }

        // Ignorer les autres commentaires et directives
        if (line.startsWith('#')) continue;

        // Si c'est une URL, l'ajouter avec son titre
        // Vérifier si c'est une URL absolue ou relative
        let mediaUrl = line;

        // Si c'est une URL relative, la rendre absolue par rapport à l'URL de la playlist
        if (!line.match(/^(https?:\/\/|rtmp:\/\/|rtsp:\/\/)/i)) {
          try {
            const baseUrl = new URL(url);
            const resolvedUrl = new URL(line, baseUrl.href);
            mediaUrl = resolvedUrl.href;
          } catch (e) {
            console.warn(`Could not resolve relative URL: ${line}`, e);
          }
        }

        // Vérifier si l'URL semble être un flux audio (filtrer vidéo si possible)
        // Ceci est une heuristique simple et pourrait ne pas être parfaite
        const isLikelyAudio =
          !mediaUrl.match(/\.(m3u8|mp4|mkv|avi|mov|flv|wmv|ts)$/i) ||
          mediaUrl.match(/\.(mp3|aac|ogg|opus|wav|m4a)$/i) ||
          mediaUrl.includes('audio') ||
          !mediaUrl.includes('video');

        if (isLikelyAudio) {
          mediaUrls.push({
            url: mediaUrl,
            title: currentTitle || `Track ${mediaUrls.length + 1}`
          });
        }

        // Réinitialiser le titre pour la prochaine entrée
        currentTitle = '';
      }

      console.log(`Found ${mediaUrls.length} audio URLs in playlist`);

      // Vérifier si des URL ont été trouvées
      if (mediaUrls.length === 0) {
        throw new Error('No audio URLs found in M3U playlist');
      }

      // Utiliser la première URL
      const firstTrack = mediaUrls[0];
      console.log(`Found first entry in M3U playlist: ${firstTrack.title} (${firstTrack.url})`);

      // Store all tracks in a global variable to allow navigation between them later
      if (typeof window !== 'undefined') {
        (window as any).__currentM3UPlaylist = mediaUrls;
        (window as any).__currentM3UIndex = 0;
      }

      // Store track title as a custom property on the audio element for MediaSession
      if (player instanceof HTMLAudioElement) {
        (player as any).__trackTitle = firstTrack.title || '';
        (player as any).__trackSource = 'M3U Playlist';

        // Update MediaSession if available
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: firstTrack.title || 'Unknown Track',
            artist: 'RPlayer M3U',
            album: 'M3U Playlist',
            artwork: [
              { src: '/images/favicon.png', sizes: '96x96', type: 'image/png' },
              { src: '/images/icons-192.png', sizes: '192x192', type: 'image/png' }
            ]
          });
        }
      }

      // Au lieu de jouer directement, nous renvoyons l'URL du premier élément
      // pour que RPlayer puisse la traiter selon son type (HLS, MP3, etc.)
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
