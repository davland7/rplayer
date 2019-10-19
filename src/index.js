import Hls from 'hls.js/dist/hls.light.js';

class rPlayer {
    constructor() {
        this._audio = new Audio();
        this._hls = null;
        this._pause = false;

        if (localStorage.hasOwnProperty('r-player-volume')) {
            this._audio.volume = localStorage.getItem('r-player-volume') / 10;
        } else {
            this._audio.volume = .7;
        }
    }

    play(src) {
        if (!this._pause)  {
            if (this.playing) this.stop();

            if (Hls.isSupported() && (src.indexOf('.m3u8') > 0)) {
                this._hls = new Hls();
                this._hls.loadSource(src);
                this._hls.attachMedia(this._audio);
                this._hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this._audio.play();
                });
            } else if (this._audio.canPlayType('application/vnd.apple.mpegurl')) {
                this._audio.src = src;
                this._audio.addEventListener('loadedmetadata', () => {
                    this._audio.play();
                });
            } else {
                this._audio.src = src;
                this._audio.load();
                this._audio.play();
            }
        } else {
            this._audio.play();
            this._pause = false;
        }
    }

    pause() {
        if (!this._audio.paused) {
            this._audio.pause();
            this._pause = true;
        }
    }

    stop() {
        this._audio.pause();
        this._audio.currentTime = 0;
        this._audio.src = '';

        if (this._hls) {
            this._hls.destroy();
            this._hls = null;
        }
    }

    mute() {
        this._audio.muted = !this._audio.muted;
    }

    get playing() {
        return this._audio.currentTime > 0 && !this._audio.paused && !this._audio.ended && this._audio.readyState > 2;
    }

    get src() {
        if (!this._audio.currentTime) {
            return null;
        } else if (this._hls) {
            return this._hls.url;
        } else {
            return this._audio.src;
        }
    }

    get muted() {
        return this._audio.muted;
    }

    get paused() {
        return this._audio.paused;
    }

    get volume() {
        return this._audio.volume * 10;
    }

    set volume(value) {
        if (value >= 0 && value <= 10) {
            this._audio.volume = value / 10;
            localStorage.setItem('r-player-volume', value);
        }
    }

    get currentTime() {
        return this._audio.currentTime;
    }

    set currentTime(value) {
        return this._audio.currentTime = value;
    }

    set onTimeUpdate(callback) {
        return this._audio.ontimeupdate = callback;
    }
}

export default rPlayer;
