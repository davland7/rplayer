# rPlayer in Action

rPlayer is a player play streaming radio, this player, offers the possibility to change different audio format. Example: .m3u8, .mp3, .aac.

## Easy to use

```
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.3/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@davland7/rplayer@2.2.1/dist/rplayer.umd.min.js"></script>
```

```
const audio = new rPlayer();
```

rPlayer is extending [Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) HTMLMediaElement

## Play

Play doesn't work with HLS. 🙁

```
const audio = new Audio('URL.m3u8');
audio.play();
```

Or

```
audio.src = 'URL.m3u8';
audio.play();
```

Works with HLS. It's Magic 💪

```
audio.playSrc('URL.m3u8');
```

> [!IMPORTANT]
> **rPlayer** is optimized for HLS content. While HLS is native to Apple devices, for Windows and Android, it's crucial to use the hls.js library for proper .m3u8 stream functionality. Please ensure the use of hls.js on devices other than iPhone and iPad.

In addition to .m3u8, you can also use .mp3, .aac, .ogg and others. 😮

```
audio.playSrc('URL.aac');
```
> [!TIP]
> You can use rPlayer without hls.js if you don't need to support HLS formats like .m3u8. juste not add hls.js to your project.

## Set Volume

The volume must not be outside the range [0, 1].

```
audio.volume = 0.2; // 0.2 Default set in local storage
```

localStorage is very cool. 😎

## Extras

### Stop

```
audio.stop();
```

### Mute

```
audio.mute();
```

### Rewind

```
audio.rewind(10); // seconds
```

### Volume Up

```
audio.upVolume();
```

A way not to make a mistake if the range is not good. 😉

### Volume Down

10 levels up and down and blocks both ends. 😁

```
audio.downVolume();
```

> [!WARNING]
> On iOS devices such as iPad and iPhone, the audio level is always controlled by the user physically. This means that the volume property is not adjustable through JavaScript on iOS devices. When you read the volume property on iOS, it will always return 1, reflecting that the user has direct control over the device's volume. Additionally, the library will always return 1 on iOS.

## timeupdate event

The [timeupdate event](http://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) is fired when the time indicated by the currentTime attribute has been updated.

```
audio.ontimeupdate = function() {
  console.log('Time:', audio.currentTime);
};
```

## Infos

```
console.log('Source:', audio.url);
console.log('Playing:', audio.playing);
console.log('Paused:', audio.paused);
console.log('Muted:', audio.muted);
console.log('Volume:', audio.volume * 100);
console.log('hls.js:', audio.isHls);
console.log('Time:', audio.currentTime);
```

rPlayer 2.2.1

## Used by

[Mini Radio (Chrome extension)](https://chrome.google.com/webstore/detail/mini-radio/klcjochgjlcecbalpokmcldlfhngcnfh)
