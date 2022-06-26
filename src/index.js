import Hls from '../node_modules/hls.js/dist/hls.light.min.js';

export default class rPlayer extends Audio {
    constructor() {
        super();

        const key = 'rplayer-volume';
        this.hls = null;

        if (localStorage.hasOwnProperty(key)) {
            this.volume = localStorage.getItem(key);
        } else {
            this.volume = .2;
        }

        this.onvolumechange = () => {
            localStorage.setItem(key, this.volume);
        };
    }

    /**
     * 
     * @param {number} seconds 
     */
    rewind(seconds) {
        this.currentTime = this.currentTime - seconds;
    };

    /**
     * 
     * @param {string} src 
     */
    playSrc(src) {
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
        this.#setVolume(this.volume + 0.1);
    }

    downVolume() {
        this.#setVolume(this.volume - 0.1);
    }

    /**
     * 
     * @param {decimal} value 
     */
    #setVolume(value) {
        if (value >= 0.0 && value <= 1.0) {
            this.volume = Number(value).toFixed(1);
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
