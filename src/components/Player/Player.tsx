import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react";
import PlayerControls from "./PlayerControls.js";
import PlayerErrorPanel from "./PlayerErrorPanel.js";
import PlayerStatusPanel from "./PlayerStatusPanel.js";
import PlayerUrlField from "./PlayerUrlField.js";
import { useRPlayer } from "./useRPlayer.js";
import { setLocalStorageItem, getLocalStorageItem, LAST_URL } from "../../utils/storage.js";

interface PlayerProps {
	initialVolume?: number;
	source?: string;
}

/**
 * Player - Un composant React pour le lecteur audio RPlayer
 * @param {PlayerProps} props - Propriétés du composant
 * @returns {JSX.Element} Le composant Player
 */
const Player = ({ initialVolume = 0.5, source = "" }: PlayerProps): JSX.Element => {
	const {
		playerRef,
		isPlaying,
		isPaused,
		volume,
		currentTime,
		error, // on retire setError de la déstructuration
		pause,
		stop,
		upVolume,
		downVolume,
		rewind,
		playSrc,
	} = useRPlayer({ initialVolume });
	const [url, setUrl] = useState<string>(() => getLocalStorageItem(LAST_URL) || source || "");

	// Synchronise l'input avec la prop source ET joue automatiquement si la source change
	useEffect(() => {
		if (source && source !== url) {
			setUrl(source);
			setLocalStorageItem(LAST_URL, source);
			if (typeof playSrc === "function") {
				playSrc?.(source)?.catch((error: unknown) => {
					console.error("Failed to play source:", error);
				});
			}
		}
	}, [source, url, playSrc]);

	const handlePlay = useCallback(
		(stationUrl: string) => {
			const playSrcFn = playSrc;
			if (!playerRef.current || typeof playSrcFn !== "function") return;
			if (!playSrcFn) return;

			setUrl(stationUrl);
			setLocalStorageItem(LAST_URL, stationUrl);
			(playSrcFn as (src: string) => Promise<void>)(stationUrl).catch((error: unknown) => {
				console.error("Failed to play source:", error);
			});
		},
		[playSrc, playerRef],
	);

	const handleInputPlay = useCallback(() => {
		if (!playerRef.current || !url) return;
		handlePlay(url);
	}, [url, handlePlay, playerRef]);

	const handleStop = useCallback(() => {
		if (playerRef.current) {
			stop();
		}
	}, [stop, playerRef]);

	const getPlaybackStatus = useCallback(() => {
		if (isPlaying) return "Playing";
		if (isPaused) return "Paused";
		return url ? "Ready" : "Stopped";
	}, [isPlaying, isPaused, url]);

	return (
		<>
			<PlayerUrlField
				inputUrl={url}
				onInputUrlChange={(newUrl) => setUrl(newUrl)}
				onInputPlay={handleInputPlay}
			/>
			<PlayerControls
				isPlaying={isPlaying}
				url={url}
				inputUrl={url}
				onPlay={async () => {
					handleInputPlay();
				}}
				onPause={pause}
				onStop={handleStop}
				onUpVolume={upVolume}
				onDownVolume={downVolume}
				onRewind={() => rewind(10)}
			/>
			<PlayerStatusPanel
				status={getPlaybackStatus()}
				volume={volume}
				currentTime={currentTime}
				isHls={playerRef.current?.isHlsjs || false}
			/>
			<PlayerErrorPanel error={error} />
		</>
	);
};

export default Player;
export type { PlayerProps };
