import { useCallback, useEffect, useRef, useState } from "react";
import RPlayer from "../../lib/index.js";
import { getVolume, setVolume as setStoredVolume } from "../../utils/storage.js";

export interface UseRPlayerOptions {
	initialVolume?: number;
}

export function useRPlayer({ initialVolume = 0.5 }: UseRPlayerOptions) {
	const playerRef = useRef<RPlayer | null>(null);
	const storedVol = getVolume();
	const initialVol =
		typeof storedVol === "number" && !Number.isNaN(storedVol)
			? Math.max(0, Math.min(1, storedVol))
			: Math.max(0, Math.min(1, initialVolume));
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [volume, setVolume] = useState(initialVol); // volume est une fraction 0-1
	const [currentTime, setCurrentTime] = useState(0);
	const [error, setError] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialVol ne doit pas être une dépendance ici
	useEffect(() => {
		if (!playerRef.current) {
			playerRef.current = new RPlayer();
			const player = playerRef.current;
			player.volume = initialVol;
			player.ontimeupdate = () => setCurrentTime(player.currentTime);
			player.onPlaybackStatusChange((status) => {
				const newIsPlaying = status === "playing";
				const newIsPaused = status === "paused";
				setIsPlaying(newIsPlaying);
				setIsPaused(newIsPaused);
			});
			player.onvolumechange = () => {
				setVolume(player.volume); // stocke la fraction 0-1
				setStoredVolume(player.volume);
			};
			player.onError((err) => {
				setIsPlaying(false);
				setError(`Error playing audio: ${err.message || "Unknown error"}`);
			});
		}
		return () => {
			playerRef.current?.destroy();
		};
	}, []);

	const play = useCallback((): Promise<void> => {
		return playerRef.current?.play() as Promise<void>;
	}, []);
	const pause = useCallback(() => {
		playerRef.current?.pause();
	}, []);
	const stop = useCallback(() => {
		playerRef.current?.stop();
	}, []);
	const upVolume = useCallback(() => {
		playerRef.current?.upVolume();
	}, []);
	const downVolume = useCallback(() => {
		playerRef.current?.downVolume();
	}, []);
	const rewind = useCallback((s: number) => {
		playerRef.current?.rewind(s);
	}, []);
	const playSrc = useCallback((src: string): Promise<void> => {
		return playerRef.current?.playSrc(src) as Promise<void>;
	}, []);
	const loadSrc = useCallback((src: string): Promise<void> => {
		return playerRef.current?.loadSrc(src) as Promise<void>;
	}, []);

	return {
		playerRef,
		isPlaying,
		isPaused,
		volume,
		currentTime,
		error,
		setError,
		play,
		pause,
		stop,
		upVolume,
		downVolume,
		rewind,
		playSrc,
		loadSrc,
	};
}
