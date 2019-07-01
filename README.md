# rPlayer

rPlayer is a player play streaming radio, this player, offers the possibility to change different audio format. Example: .m3u8, .mp3, .aac.

## rPlayer in action

https://rplayer.js.org/

## Easy to use

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

## Use Audio & hls.js

```
rplayer.audio
rplayer.hls
```
* [Audio](https://developer.mozilla.org/fr/docs/Web/HTML/Element/audio)
* [hls.js](https://github.com/video-dev/hls.js)

## Demo

```
npm install
npm run build
npm run dev
```

https://127.0.0.1:9999

## npm dependencies

```
npm install hls.js --save
npm install terser-webpack-plugin webpack webpack-cli webpack-dev-server --save-dev
```

## Used by

[Mini Radio (Chrome extention)](https://chrome.google.com/webstore/detail/mini-radio/klcjochgjlcecbalpokmcldlfhngcnfh)
