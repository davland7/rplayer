# RPlayer

| [![npm version](https://img.shields.io/npm/v/@davland7/rplayer?style=flat-square)](https://www.npmjs.com/package/@davland7/rplayer) | [![](https://data.jsdelivr.com/v1/package/npm/@davland7/rplayer/badge)](https://www.jsdelivr.com/package/npm/@davland7/rplayer) | [![license](https://img.shields.io/npm/l/@davland7/rplayer?style=flat-square)](./LICENSE) |
|:-:|:-:|:-:|

RPlayer est une librairie audio JavaScript/TypeScript pour la lecture de flux radio, compatible avec de nombreux formats : HLS (.m3u8), MP3 (.mp3), AAC (.aac), et plus encore.

## Nouveautés 3.0.0

- Réécriture complète en TypeScript avec typage amélioré
- Gestion avancée des erreurs et de la reprise pour les flux HLS
- Lecture de fichiers .m3u (playlist)
- Meilleure gestion de l'autoplay selon les restrictions navigateur

## Restrictions d'autoplay navigateur

La plupart des navigateurs modernes restreignent l'autoplay audio : une interaction utilisateur est souvent requise avant de lancer la lecture. RPlayer gère ces restrictions de façon élégante :

- La méthode `loadSrc()` permet de précharger sans lancer la lecture
- Le composant React accepte la prop `autoplay` pour contrôler le comportement initial
- Détection automatique de l'interaction utilisateur pour activer la lecture
- Indicateurs de statut clairs lorsque le média est chargé mais en attente d'interaction

## Intégration React & frameworks modernes

RPlayer fonctionne avec tous les frameworks JavaScript modernes. Pour React, Next.js, Astro, etc., assurez-vous que le composant Player est rendu côté client uniquement (RPlayer dépend des API navigateur comme Audio et MediaSession).

- **React** : Importez et utilisez le composant Player normalement.
- **Next.js** : Utilisez l'import dynamique avec `ssr: false` pour charger le Player côté client.
- **Astro** : Utilisez `client:only="react"` pour éviter le rendu SSR.

## Installation

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

RPlayer étend [Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) (HTMLMediaElement).

## Lecture

La méthode native `play()` ne fonctionne pas avec HLS :

```javascript
const audio = new Audio('URL.m3u8');
audio.play(); // Ne fonctionne pas avec HLS
```

Utilisez plutôt :

```javascript
audio.playSrc('URL.m3u8'); // Fonctionne avec HLS
```

> **Important**
> Pour HLS, utilisez hls.js sur Windows/Android. Sur iPhone/iPad, HLS est natif.

RPlayer gère aussi .mp3, .aac, .ogg, etc. :

```javascript
audio.playSrc('URL.aac');
```

> **Astuce**
> Vous pouvez utiliser RPlayer sans hls.js si vous ne lisez pas de .m3u8.

## Volume

Le volume est compris entre 0 (muet) et 1 (max).

```javascript
// Volume à 50 %
audio.volume = 0.5;
// Lire le volume courant
const currentVolume = audio.volume;
```

## Fonctions supplémentaires

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
audio.rewind(10); // secondes
```

### Volume +

```javascript
audio.upVolume();
```

### Volume -

```javascript
audio.downVolume();
```

> **Note iOS**
> Sur iPhone/iPad, le volume est contrôlé physiquement par l'utilisateur. La propriété volume retourne toujours 1.

## Événement timeupdate

```javascript
audio.ontimeupdate = function() {
  console.log('Time:', audio.currentTime);
};
```

## Infos utiles

```javascript
console.log('Source:', audio.url);
console.log('Playing:', audio.playing);
console.log('Paused:', audio.paused);
console.log('Muted:', audio.muted);
console.log('Volume:', audio.volume * 100);
console.log('hls.js:', audio.isHls);
console.log('Time:', audio.currentTime);
```
