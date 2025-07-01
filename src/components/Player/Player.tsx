import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import PlayerControls from "./PlayerControls.js";
import PlayerErrorPanel from "./PlayerErrorPanel.js";
import PlayerStatusPanel from "./PlayerStatusPanel.js";
import PlayerUrlField from "./PlayerUrlField.js";
import { useRPlayer } from "./useRPlayer.js";
import { setLocalStorageItem, getLocalStorageItem, LAST_URL } from "../../utils/storage.js";

interface PlayerProps {
	initialVolume?: number;
	defaultSource?: string;
	stationName?: string;
	autoplay?: boolean; // Control initial autoplay
	shouldPlay?: boolean; // If true, play immediately when defaultSource changes
	onStatusChange?: (isPlaying: boolean, isPaused: boolean) => void;
	onExternalSourceChange?: boolean; // Nouvelle prop pour mettre à jour le champ d'entrée quand defaultSource change
}

/**
 * Player - Un composant React pour le lecteur audio RPlayer
 * @param {PlayerProps} props - Propriétés du composant
 * @returns {JSX.Element} Le composant Player
 */
const Player = ({
	initialVolume = 0.5,
	defaultSource = "",
	stationName = "",
	autoplay = false, // Par défaut, pas de lecture automatique
	shouldPlay = false,
	onExternalSourceChange = true, // Par défaut, mettre à jour le champ d'entrée quand defaultSource change
	onStatusChange,
}: PlayerProps): JSX.Element => {
	// Utilisation du hook personnalisé pour la logique RPlayer
	const {
		playerRef,
		isPlaying,
		isPaused,
		volume,
		currentTime,
		error, // on retire setError de la déstructuration
		play,
		pause,
		stop,
		upVolume,
		downVolume,
		rewind,
		playSrc,
		loadSrc,
	} = useRPlayer({ initialVolume, onStatusChange });

	// État du lecteur
	const [url, setUrl] = useState<string>(
		() => getLocalStorageItem(LAST_URL) || defaultSource || "",
	);
	const [inputUrl, setInputUrl] = useState<string>(
		() => getLocalStorageItem(LAST_URL) || defaultSource || "",
	);
	const [internalStationName, setInternalStationName] = useState<string>(stationName || "");
	const [isSourceLoaded, setIsSourceLoaded] = useState<boolean>(false); // Nouvel état pour suivre si la source est chargée

	const hasInteracted = useRef<boolean>(false); // Pour suivre si l'utilisateur a interagi avec la page
	// Référence au conteneur du lecteur HTML (pour le style/layout, pas le player JS)
	const playerContainerRef = useRef<HTMLDivElement>(null);

	// Charger la source par défaut si fournie, mais sans autoplay
	useEffect(() => {
		if (defaultSource && !isSourceLoaded) {
			const load = loadSrc;
			if (playerRef.current && typeof load === "function") {
				// Charger la source mais ne pas démarrer la lecture automatiquement
				if (!load) return;
				(load as (src: string) => Promise<void>)(defaultSource)
					.then(() => {
						setUrl(defaultSource);
						setInputUrl(defaultSource);
						setIsSourceLoaded(true);
						setInternalStationName(stationName);
						// Effacer les messages d'erreur une fois chargé

						// Si autoplay est activé et que l'utilisateur a déjà interagi, tenter la lecture
						const playFn = play;
						if (autoplay && hasInteracted.current) {
							if (!playFn) return;
							(playFn as () => Promise<void>)().catch((err: unknown) => {
								console.warn("Autoplay failed even after user interaction:", err);
							});
						}
					})
					.catch((err: unknown) => {
						console.error("Failed to load source:", err);
					});
			}
		}
	}, [defaultSource, stationName, autoplay, isSourceLoaded, loadSrc, play, playerRef]);

	// Lire une URL de station
	const handlePlay = useCallback(
		(stationUrl: string, name: string = "") => {
			const playSrcFn = playSrc;
			if (!playerRef.current || typeof playSrcFn !== "function") return;
			if (!playSrcFn) return;
			// Marquer qu'une interaction utilisateur a eu lieu (clic sur Play)
			hasInteracted.current = true;

			setInputUrl(stationUrl);
			setInternalStationName(name);

			// Extraire le format de fichier pour l'affichage dans l'interface
			let format = "Audio";
			if (stationUrl.endsWith(".m3u8")) {
				format = "HLS";
			} else if (stationUrl.endsWith(".m3u")) {
				format = "M3U Playlist";
			} else if (/\.(mp3|aac|ogg|opus|wav)$/i.exec(stationUrl)) {
				format = stationUrl.split(".").pop()?.toUpperCase() ?? "Audio";
			}

			console.log(`Playing ${format} stream: ${stationUrl}`);

			// Afficher l'état de chargement
			(playSrcFn as (src: string) => Promise<void>)(stationUrl)
				.then(() => {
					setUrl(stationUrl);
					// Mettre à jour l'API MediaSession avec les métadonnées de la station
					if ("mediaSession" in navigator) {
						const artworkUrl = "/images/favicon.png";

						navigator.mediaSession.metadata = new MediaMetadata({
							title: name || "Radio Station",
							artist: "RPlayer Radio",
							album: format,
							artwork: [
								{ src: "/images/favicon.png", sizes: "96x96", type: "image/png" },
								{ src: "/images/icons-192.png", sizes: "192x192", type: "image/png" },
								{ src: artworkUrl, sizes: "128x128", type: "image/png" },
							],
						});

						// Mettre à jour l'état de lecture
						navigator.mediaSession.playbackState = "playing";
					}
				})
				.catch((error: unknown) => {
					console.error("Failed to play source:", error);
				});
		},
		[playSrc, playerRef],
	);

	// Réagir aux changements de props defaultSource et stationName
	useEffect(() => {
		if (stationName !== internalStationName && url) {
			setInternalStationName(stationName);
		}
	}, [stationName, internalStationName, url]);

	// Mettre à jour le champ d'entrée URL lorsque defaultSource change (pour les sources externes)
	useEffect(() => {
		if (onExternalSourceChange && defaultSource && defaultSource !== inputUrl) {
			setInputUrl(defaultSource);
		}
	}, [defaultSource, onExternalSourceChange, inputUrl]);

	// Play on source change if shouldPlay is true
	useEffect(() => {
		if (shouldPlay && defaultSource) {
			hasInteracted.current = true;
			const playSrcFn = playSrc;
			if (playerRef.current && typeof playSrcFn === "function") {
				(playSrcFn as (src: string) => Promise<void>)(defaultSource).catch((err: unknown) => {
					console.warn("Auto play on source change failed:", err);
				});
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shouldPlay, defaultSource]);

	const handleInputPlay = useCallback(() => {
		if (!playerRef.current || !inputUrl) return;
		handlePlay(inputUrl);
	}, [inputUrl, handlePlay, playerRef]);

	// Gérer les actions du lecteur, y compris la gestion correcte de l'arrêt
	const handleStop = useCallback(() => {
		if (playerRef.current) {
			stop();
			// Ne pas réinitialiser isSourceLoaded ici : on veut garder la source chargée pour pouvoir relancer Play
		}
	}, [stop, playerRef]);

	// Fonction d'aide pour l'affichage du statut de lecture
	const getPlaybackStatus = useCallback(() => {
		if (isPlaying) return "Playing";
		if (isPaused) return "Paused";
		return isSourceLoaded ? "Ready" : "Stopped";
	}, [isPlaying, isPaused, isSourceLoaded]);

	// Fonction d'aide pour l'affichage du format audio
	const getAudioFormat = useCallback(() => {
		if (playerRef.current?.isHlsjs) return "HLS";
		if (url) return "Standard Audio";
		return "Not loaded";
	}, [url, playerRef]);

	return (
		<div ref={playerContainerRef}>
			<PlayerUrlField
				inputUrl={inputUrl}
				onInputUrlChange={(url) => {
					setInputUrl(url);
					setLocalStorageItem(LAST_URL, url);
				}}
				onInputPlay={() => {
					handleInputPlay();
					setLocalStorageItem(LAST_URL, inputUrl);
				}}
			/>

			<PlayerControls
				isPlaying={isPlaying}
				url={url}
				inputUrl={inputUrl}
				onPlay={async () => {
					hasInteracted.current = true;
					if (inputUrl && inputUrl !== url) {
						handleInputPlay();
					} else if (playerRef.current) {
						// Ne rien faire si déjà en lecture
						if (isPlaying) return;
						try {
							// Si le player est stoppé, recharger la source avant de jouer
							if (!isPaused && !isPlaying && url) {
								await loadSrc(url);
							}
							await play();
						} catch (err) {
							console.error("Erreur de lecture même avec le bouton Play :", err);
						}
					}
				}}
				onPause={pause}
				onStop={handleStop}
				onUpVolume={upVolume}
				onDownVolume={downVolume}
				onRewind={() => rewind(10)}
			/>

			{/* Message Now playing supprimé, car l'URL est déjà affichée dans la barre d'info */}

			<PlayerStatusPanel
				status={getPlaybackStatus()}
				volume={volume}
				currentTime={currentTime}
				format={getAudioFormat()}
				source={url}
			/>

			<PlayerErrorPanel error={error} />
		</div>
	);
};

export default Player;

// Types publics pour les utilisateurs du composant
export type { PlayerProps };
