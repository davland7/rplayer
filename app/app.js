var rplayer = new rPlayer(),
    mp3Url = 'https://cogecomedia.leanstream.co/CKBEFM-MP3',
    hlsUrl = 'https://cogecomedia.leanstream.co/cogecomedia/CKBEFM.stream/playlist.m3u8';

info();

rplayer.onTimeUpdate = function() {
  info();
};

$('#url').val(hlsUrl);
$('#mp3').on('click', mp3);
$('#hls').on('click', hls);
$('#play').on('click', play);
$('#stop').on('click', stop);
$('#mute').on('click', mute);
$('#time10').on('click', time10);
$('#volumeUp').on('click', volumeUp);
$('#volumeDown').on('click', volumeDown);

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
  var playing = false;
  var volume = rplayer.volume * 10;
  var muted = rplayer.muted;
  var src = null;
  var time = 0;

  if (rplayer.playing) {
      playing = true;
      src = rplayer.src;
      time = rplayer.currentTime;
  }

  $('#playing').html(String(playing));
  $('#volume').html(volume);
  $('#muted').html(String(muted));
  $('#src').html(String(src));
  $('#time').html(time);
}