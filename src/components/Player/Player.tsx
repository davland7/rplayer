import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react";
import PlayerControls from "./PlayerControls.js";
import Toast, { ToastType } from "../Toast.js";
import PlayerStatusPanel from "./PlayerStatusPanel.js";
import PlayerUrlField from "./PlayerUrlField.js";
import { useRPlayer } from "./useRPlayer.js";
import { setLocalStorageItem, getLocalStorageItem, LAST_URL } from "../../utils/storage.js";

interface PlayerProps {
	initialVolume?: number;
	source?: string;
}

/**
 * Player - A React component for the RPlayer audio player
 * @param {PlayerProps} props - Component properties
 * @returns {JSX.Element} The Player component
 */
const Player = ({ initialVolume = 0.5, source = "" }: PlayerProps): JSX.Element => {
	const {
		playerRef,
		isPlaying,
		isPaused,
		volume,
		currentTime,
		error,
		play,
		pause,
		stop,
		upVolume,
		downVolume,
		rewind,
		playSrc,
		loadSrc,
	} = useRPlayer({ initialVolume });
	const [hasPreloaded, setHasPreloaded] = useState(false);
	const [url, setUrl] = useState<string>(() => getLocalStorageItem(LAST_URL) || source || "");
	const [hlsReconnectWarning, setHlsReconnectWarning] = useState<string | null>(null);
	useEffect(() => {
		const onOnline = () => {
			if (playerRef.current?.isHlsjs && !isPlaying) {
				setHlsReconnectWarning(
					"The HLS stream did not resume automatically after network change. Please click Play to restart.",
				);
			}
		};
		window.addEventListener("online", onOnline);
		return () => {
			window.removeEventListener("online", onOnline);
		};
	}, [playerRef, isPlaying]);

	// Preload the last URL on mount (without autoplay)
	useEffect(() => {
		const lastUrl = getLocalStorageItem(LAST_URL);
		if (lastUrl && typeof loadSrc === "function") {
			loadSrc(lastUrl)
				?.then(() => {
					setHasPreloaded(true);
					console.log("Source preloaded and ready to play!");
				})
				.catch((err) => {
					setHasPreloaded(true);
					console.error("Error while preloading:", err);
				});
		} else {
			setHasPreloaded(true);
		}
	}, [loadSrc]);

	useEffect(() => {
		if (!hasPreloaded) return;
		// Only call playSrc if the URL has changed AND the user has not manually stopped playback
		if (source && source !== url) {
			setUrl(source);
			setLocalStorageItem(LAST_URL, source);
			if (typeof playSrc === "function") {
				playSrc(source)?.catch((error: unknown) => {
					console.error("Failed to play source:", error);
				});
			}
		}
	}, [source, url, playSrc, hasPreloaded]);

	const handlePlay = useCallback(
		(stationUrl: string) => {
			setUrl(stationUrl);
			setLocalStorageItem(LAST_URL, stationUrl);
			if (!playerRef.current || typeof playSrc !== "function") return;
			playSrc(stationUrl)?.catch((error: unknown) => {
				console.error("Failed to play source:", error);
			});
		},
		[playSrc, playerRef],
	);

	const handleInputPlay = useCallback(() => {
		if (!playerRef.current || !url) return;
		// If the source is already preloaded and playback is stopped, use play() to resume
		if (playerRef.current.src === url && typeof play === "function" && !isPlaying) {
			play()?.catch((error: unknown) => {
				console.error("Failed to play preloaded source:", error);
			});
			setHlsReconnectWarning(null); // Hide HLS warning on play
			return;
		}
		handlePlay(url);
		setHlsReconnectWarning(null); // Hide HLS warning on play
	}, [url, handlePlay, playerRef, isPlaying, play]);

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
				isPaused={isPaused}
				url={url}
				inputUrl={url}
				onPlay={async () => handleInputPlay()}
				onPause={pause}
				onStop={stop}
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
			{error && (
				<Toast
					message={
						typeof error === "string" ? error : "An error occurred while playing the stream."
					}
					type={ToastType.ERROR}
				/>
			)}
			{hlsReconnectWarning && (
				<Toast message={hlsReconnectWarning} type={ToastType.WARNING} autoClose={false} />
			)}
		</>
	);
};

export default Player;
export type { PlayerProps };
