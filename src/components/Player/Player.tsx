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

  // Précharger la dernière URL au montage (sans autoplay)
  useEffect(() => {
	const lastUrl = getLocalStorageItem(LAST_URL);
	if (lastUrl && typeof loadSrc === "function") {
	  loadSrc(lastUrl)?.then(() => {
		  setHasPreloaded(true);
		  console.log("Source préchargée et prête à être jouée !");
		})
		.catch((err) => {
		  setHasPreloaded(true);
		  console.error("Erreur lors du préchargement :", err);
		});
	} else {
	  setHasPreloaded(true);
	}
  }, [loadSrc]);

  useEffect(() => {
	if (!hasPreloaded) return;
	if (source && ((!isPlaying && source === url) || source !== url)) {
	  setUrl(source);
	  setLocalStorageItem(LAST_URL, source);
	  if (typeof playSrc === "function") {
		playSrc(source)?.catch((error: unknown) => {
		  console.error("Failed to play source:", error);
		});
	  }
	}
  }, [source, url, playSrc, hasPreloaded, isPlaying]);

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
    // If the source is already preloaded and not currently playing, use play()
    if (
      playerRef.current.src === url &&
      typeof play === "function" &&
      !isPlaying
    ) {
    play()?.catch((error: unknown) => {
      console.error("Failed to play preloaded source:", error);
    });
	  return;
  }
  handlePlay(url);
}, [url, handlePlay, playerRef, isPlaying, play]);

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
			{error && (
				<Toast
					message={
						typeof error === "string" ? error : "An error occurred while playing the stream."
					}
					type={ToastType.ERROR}
				/>
			)}
		</>
	);
};

export default Player;
export type { PlayerProps };
