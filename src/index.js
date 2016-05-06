var Hls = require('hls.js');

function rPlayer() {
	var audio = new Audio();
	var hls;

	this.playing = false;
	this.muted = false;

	// Set default volume
	if (localStorage.getItem('r-player-volume')) {
		this.volume = localStorage.getItem('r-player-volume');
	} else {
		this.volume = 7;
		localStorage.setItem('r-player-volume', this.volume);
	}

	setVolume(this.volume);

	function setVolume(volume) {
		
		audio.volume = volume / 10;
		localStorage.setItem('r-player-volume', volume);
	}

	function stop () {
		audio.pause();
		audio.currentTime = 0;

		if (typeof(hls) === 'object') {
			hls.destroy();
		}
	}

	this.play = function (url) {
		stop();

		if (Hls.isSupported() && (url.indexOf('.m3u8') > 0)) {
			hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(audio);
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				audio.play();
			});
		} else {
			audio.src = url;
			audio.play();
		}

		this.playing = true;
	};

	this.stop = function () {
		stop();

		this.playing = false;
	};

	this.setVolume = function (value) {
		setVolume(value);

		this.volume = value;
	};

	this.mute = function () {
		var result = false;
		if (audio.muted == result) {
			result = true;
		}

		this.muted = audio.muted = result;
	};
};

module.exports = rPlayer;