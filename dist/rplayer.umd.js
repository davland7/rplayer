(function(e,i){typeof exports=="object"&&typeof module<"u"?module.exports=i(require("hls.js")):typeof define=="function"&&define.amd?define(["hls.js"],i):(e=typeof globalThis<"u"?globalThis:e||self,e.rPlayer=i(e.Hls))})(this,function(e){"use strict";class i extends Audio{constructor(){super(),this.key="rplayer-volume",this.volume=this.isAppleDevice()?1:parseFloat(localStorage.getItem(this.key)||"0.2")}async playSrc(t){const l=t.indexOf(".m3u8")>0;if(this.isPaused(t))this.play();else{this.stop(),typeof e<"u"&&e.isSupported()&&l&&!this.canPlayType("application/vnd.apple.mpegURL")&&!this.isAppleDevice()?(this.hls=new e,this instanceof HTMLAudioElement&&this.hls.attachMedia(this),this.hls.loadSource(t),await new Promise(s=>{var h;(h=this.hls)==null||h.on(e.Events.MANIFEST_PARSED,()=>{s()})})):(this.src=t,await new Promise(s=>{this.addEventListener("loadedmetadata",()=>{s()})}));try{await this.play()}catch(s){console.error("Error on play",s)}}}mute(){this.muted=!this.muted}stop(){this.pause(),this.currentTime=0,this.hls&&(this.hls.destroy(),this.hls=null)}rewind(t){this.currentTime-=t}upVolume(){!this.isAppleDevice()&&this.volume<1&&(this.volume=parseFloat((this.volume+.1).toFixed(1)),localStorage.setItem(this.key,this.volume.toString()))}downVolume(){!this.isAppleDevice()&&this.volume>.1?(this.volume=parseFloat((this.volume-.1).toFixed(1)),localStorage.setItem(this.key,this.volume.toString())):this.isAppleDevice()||(this.volume=0,localStorage.setItem(this.key,"0"))}get isHls(){return e instanceof Object&&this.hls!==null&&this.hls instanceof e}get url(){return this.isHls?this.hls.url:this.src}get playing(){return this.currentTime>0&&!this.paused&&!this.ended&&this.readyState>2}isAppleDevice(){return/(iPhone|iPod|iPad)/i.test(navigator.userAgent)}isPaused(t){return this.currentTime>0&&!this.playing&&this.url===t}}return i});
