var rplayer = new rPlayer(),
    mp3Url = 'https://cogecomedia.leanstream.co/CKBEFM-MP3',
    hlsUrl = 'https://cogecomedia.leanstream.co/cogecomedia/CKBEFM.stream/playlist.m3u8';

info();

rplayer.onTimeUpdate = function() {
  info();
};

$('#url').val(hlsUrl);
$('#mp3').on('touchstart click', mp3);
$('#hls').on('touchstart click', hls);
$('#play').on('touchstart click', play);
$('#pause').on('touchstart click', pause);
$('#stop').on('touchstart click', stop);
$('#mute').on('touchstart click', mute);
$('#time10').on('touchstart click', time10);
$('#volumeUp').on('touchstart click', volumeUp);
$('#volumeDown').on('touchstart click', volumeDown);

function mp3() {
  $('#url').val(mp3Url);
  
  play();
}

function hls() {
  $('#url').val(hlsUrl);

  play();
}

function play() {
  rplayer.play($('#url').val());
}

function pause() {
  rplayer.pause();
}

function stop() {
  rplayer.stop();

  info();
}

function mute() {
  rplayer.mute();

  info();
}

function time10() {
  rplayer.currentTime = rplayer.currentTime - 10;
}

function volumeUp() {
  rplayer.volume += 1;

  info();
}

function volumeDown() {
  rplayer.volume -= 1;

  info();
}

function info() {
  $('#playing').html(String(rplayer.playing));
  $('#volume').html(rplayer.volume * 10);
  $('#paused').html(String(rplayer.paused));
  $('#muted').html(String(rplayer.muted));
  $('#src').html(String(rplayer.src));
  $('#time').html(rplayer.currentTime);
}
