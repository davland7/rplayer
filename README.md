# rPlayer

rPlayer is a player play streaming radio, this player, offers the possibility to change different audio format. Example: .m3u8, .mp3, .aac.

```
var player = new rPlayer();
```

## Play

```
player.play('URL');
```

## Stop

```
player.stop();
```

## Mute

```
player.mute();
```

## Set Volume

You can only set volume between 0 and 10

```
player.volume = 7; // 7 Default set in local storage
```

## Infos

```
console.log('Playing:', player.playing);
console.log('Volume:', player.volume);
console.log('Muted:', player.muted);
console.log('Source:', player.src);
console.log('Time:', player.currentTime);
```

## Demo

```
npm install
```

```
npm run build
```

```
npm run serve
```

http://127.0.0.1:9999

include https://github.com/video-dev/hls.js (.m3u8)

## Used by

https://chrome.google.com/webstore/detail/mini-radio/klcjochgjlcecbalpokmcldlfhngcnfh
