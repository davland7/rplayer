import { useCallback, useEffect, useRef, useState } from "react";
import RPlayer from "../../lib/index.js";

export function useRPlayer({
	initialVolume = 0.5,
	onStatusChange,
}: {
	initialVolume?: number;
	onStatusChange?: (isPlaying: boolean, isPaused: boolean) => void;
}) {
	const playerRef = useRef<RPlayer | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(initialVolume * 100);
	const [currentTime, setCurrentTime] = useState(0);
	const [error, setError] = useState("");

	// Initialisation et destruction du lecteur
	useEffect(() => {
		if (!playerRef.current) {
			playerRef.current = new RPlayer();
			const player = playerRef.current;
			player.volume = initialVolume;
			player.ontimeupdate = () => setCurrentTime(player.currentTime);
			player.onPlaybackStatusChange((status) => {
				const newIsPlaying = status === "playing";
				const newIsPaused = status === "paused";
				setIsPlaying(newIsPlaying);
				setIsPaused(newIsPaused);
				if (onStatusChange) onStatusChange(newIsPlaying, newIsPaused);
			});
			player.onvolumechange = () => {
				setVolume(Math.round(player.volume * 100));
				setIsMuted(player.muted);
			};
			player.onError((err) => {
				setIsPlaying(false);
				setError(`Error playing audio: ${err.message || "Unknown error"}`);
			});
		}
		return () => {
			playerRef.current?.destroy();
		};
	}, [initialVolume, onStatusChange]);

	// Méthodes utilitaires
	const play = useCallback(() => playerRef.current?.play(), []);
	const pause = useCallback(() => playerRef.current?.pause(), []);
	const stop = useCallback(() => playerRef.current?.stop(), []);
	const mute = useCallback(() => playerRef.current?.mute(), []);
	const upVolume = useCallback(() => playerRef.current?.upVolume(), []);
	const downVolume = useCallback(() => playerRef.current?.downVolume(), []);
	const rewind = useCallback((s: number) => playerRef.current?.rewind(s), []);
	const forward = useCallback((s: number) => playerRef.current?.forward(s), []);
	const playSrc = useCallback((src: string) => playerRef.current?.playSrc(src), []);
	const loadSrc = useCallback((src: string) => playerRef.current?.loadSrc(src), []);

	return {
		playerRef,
		isPlaying,
		isPaused,
		isMuted,
		volume,
		currentTime,
		error,
		setError,
		play,
		pause,
		stop,
		mute,
		upVolume,
		downVolume,
		rewind,
		forward,
		playSrc,
		loadSrc,
	};
}
