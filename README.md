# Documentation

RPlayer is an audio player for streaming radio that offers the possibility to play different audio formats including HLS streams (.m3u8), MP3 (.mp3), AAC (.aac), and more.

## New in Version 3.0.0

- Complete TypeScript rewrite with improved type definitions
- Enhanced error handling and recovery for HLS streams
- React component for easy integration
- Better volume controls with localStorage persistence
- Advanced streaming statistics monitoring
- Modern Astro documentation site
- Improved autoplay handling with browser restrictions

## Browser Autoplay Restrictions

Most modern browsers have restrictions on autoplay of audio content, requiring user interaction before allowing audio to play. RPlayer now handles these restrictions more elegantly:

- The `loadSrc()` method allows preloading media without attempting autoplay
- The React component supports an `autoplay` prop to control initial behavior
- Automatic detection of user interaction to enable playback when allowed
- Better status indicators showing when media is loaded but waiting for interaction

### Using with Astro and Other Frameworks

When using RPlayer with Astro or other frameworks with hydration, it's recommended to:

1. Use `client:only="react"` for audio components in Astro
2. Set `autoplay={false}` to prevent autoplay blocking issues
3. Let the user click play to start playback after the page has loaded

```jsx
<Player
  client:only="react"
  defaultSource="https://example.com/stream.m3u8"
  stationName="My Radio Station"
  autoplay={false}
/>
```

## React, Astro & Next.js Integration

RPlayer works with all modern JavaScript frameworks, mais pour React, Astro et Next.js, il faut s'assurer que le player est rendu uniquement côté client. RPlayer dépend d'API navigateur (Audio, MediaSession), donc il ne peut pas être rendu côté serveur (SSR).

- **Astro** : Utilisez `client:only="react"` lors de l'import du composant Player. Cela évite les erreurs SSR et garantit que le player n'est chargé que dans le navigateur.
- **Next.js** : Utilisez les imports dynamiques avec `ssr: false` pour charger le Player uniquement côté client.

Si vous essayez d'utiliser le Player sans ces précautions, il ne fonctionnera pas et pourra générer des erreurs d'exécution. Utilisez toujours la directive client ou l'import dynamique pour les composants audio interactifs dépendant de l'environnement navigateur.

## Easy to use

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

RPlayer is extending [Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) HTMLMediaElement

## Play

Play doesn't work with HLS. 🙁

```javascript
const audio = new Audio('URL.m3u8');
audio.play();
```

Or

```javascript
audio.src = 'URL.m3u8';
audio.play();
```

Works with HLS. It's Magic 💪

```javascript
audio.playSrc('URL.m3u8');
```

> [!IMPORTANT]
> **RPlayer** is optimized for HLS content. While HLS is native to Apple devices, for Windows and Android, it's crucial to use the hls.js library for proper .m3u8 stream functionality. Please ensure the use of hls.js on devices other than iPhone and iPad.

In addition to .m3u8, you can also use .mp3, .aac, .ogg and others. 😮

```javascript
audio.playSrc('URL.aac');
```
> [!TIP]
> You can use RPlayer without hls.js if you don't need to support HLS formats like .m3u8. Just don't add hls.js to your project.

## Set Volume

The volume must be set between 0 and 1, where 0 is muted and 1 is maximum volume.

```javascript
// Set volume to 50%
audio.volume = 0.5;

// Get current volume
const currentVolume = audio.volume;
```

RPlayer automatically saves the volume setting to localStorage and restores it when a new player instance is created.

## Extras

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

### Volume Up

```javascript
audio.upVolume();
```

A way not to make a mistake if the range is not good. 😉

### Volume Down

10 levels up and down and blocks both ends. 😁

```javascript
audio.downVolume();
```

> [!WARNING]
> On iOS devices such as iPad and iPhone, the audio level is always controlled by the user physically. This means that the volume property is not adjustable through JavaScript on iOS devices. When you read the volume property on iOS, it will always return 1, reflecting that the user has direct control over the device's volume. Additionally, the library will always return 1 on iOS.

## timeupdate event

The [timeupdate event](http://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) is fired when the time indicated by the currentTime attribute has been updated.

```javascript
audio.ontimeupdate = function() {
  console.log('Time:', audio.currentTime);
};
```

## Infos

```javascript
console.log('Source:', audio.url);
console.log('Playing:', audio.playing);
console.log('Paused:', audio.paused);
console.log('Muted:', audio.muted);
console.log('Volume:', audio.volume * 100);
console.log('hls.js:', audio.isHls);
console.log('Time:', audio.currentTime);
```
