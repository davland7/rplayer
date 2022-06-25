import Hls from '../node_modules/hls.js/dist/hls.light.min.js';

export default class rPlayer extends Audio {
    constructor(src = null) {
        super();

        this.hls = null;

        if (src) {
            this.src = src;
        }

        if (localStorage.hasOwnProperty('r-player-volume')) {
            this.volume = localStorage.getItem('r-player-volume');
        } else {
            this.volume = .7;
        }
    }

    /**
     * 
     * @param {int} secondes 
     */
    rewind(secondes) {
        this.currentTime = this.currentTime - secondes;
    };

    /**
     * 
     * @param {string} src 
     */
    playHls(src) {
        const isHls = src.indexOf('.m3u8') > 0;

        this.stop();

        if (Hls.isSupported() && isHls) {
            this.hls = new Hls();
            this.hls.loadSource(src);
            this.hls.attachMedia(this);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.play();
            });
        } else if (this.canPlayType('application/vnd.apple.mpegurl') || (Hls.isSupported() && !isHls)) {
            this.src = src;
            this.addEventListener('loadedmetadata', () => {
                this.play();
            });
        }
    }

    mute() {
        this.muted = !this.muted;
    }

    stop() {
        this.pause();
        this.currentTime = 0;

        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
    }

    upVolume() {
        const value = this.volume;

        this.#setVolume(value + 0.1);
    }

    downVolume() {
        const value = this.volume;

        this.#setVolume(value - 0.1);
    }

    /**
     * 
     * @param {decimal} value 
     */
    #setVolume(value) {
        if (value >= 0.0 && value <= 1.0) {
            this.volume = Number(value).toFixed(1);
            localStorage.setItem('r-player-volume', Number(value).toFixed(1));
        }
    }

    get isHls() {
        if (this.hls instanceof Hls) return true;

        return false;
    }

    get url() {
        if (this.isHls) {
            return this.hls.url;
        } else {
            return this.src;
        }
    }

    get playing() {
        return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
    }
}
