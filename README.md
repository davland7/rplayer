# rplayer

Just for my Chrome Extension https://chrome.google.com/webstore/detail/radio-beta/klcjochgjlcecbalpokmcldlfhngcnfh

```
var player = new rPlayer();
```

##Play

```
player.play('URL');
```

##Stop

```
player.stop();
```

##Mute

```
player.mute();
```

##Set Volume

```
player.setVolume(7); // 7 Default set in local storage
```

##Infos

```
player.playing;
player.volume;
player.muted;
```

include https://github.com/dailymotion/hls.js (.m3u8)

npm run serve http://127.0.0.1:8888/demo/
