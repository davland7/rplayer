// Définition d'une classe utilitaire btn pour harmoniser les boutons
const btnBase =
	"font-bold px-4 py-2 rounded transition-colors border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50";

interface PlayerControlsProps {
	isPlaying: boolean;
	url: string;
	inputUrl: string;
	onPlay: () => void;
	onPause: () => void;
	onStop: () => void;
	onUpVolume: () => void;
	onDownVolume: () => void;
	onRewind: () => void;
}

function PlayerControls({
	isPlaying,
	url,
	inputUrl,
	onPlay,
	onPause,
	onStop,
	onUpVolume,
	onDownVolume,
	onRewind,
}: PlayerControlsProps) {
	return (
		<div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-6 mb-4">
			<button
				type="button"
				className={`${btnBase} border-green-500 hover:bg-green-600 hover:text-white text-green-400 focus:ring-green-400`}
				onClick={onPlay}
				disabled={!inputUrl && !url}
				aria-label="Play"
			>
				Play
			</button>
			<button
				type="button"
				className={`${btnBase} border-yellow-500 hover:bg-yellow-600 hover:text-white text-yellow-400 focus:ring-yellow-400`}
				onClick={onPause}
				disabled={!isPlaying}
				aria-label="Pause"
			>
				Pause
			</button>
			<button
				type="button"
				className={`${btnBase} border-red-500 hover:bg-red-600 hover:text-white text-red-400 focus:ring-red-400`}
				onClick={onStop}
				disabled={!url}
				aria-label="Stop"
			>
				Stop
			</button>
			<button
				type="button"
				className={`${btnBase} border-blue-500 hover:bg-blue-600 hover:text-white text-blue-400 focus:ring-blue-400`}
				onClick={onRewind}
				disabled={!url}
				aria-label="Rewind"
			>
				Rewind
			</button>
			<button
				type="button"
				className={`${btnBase} border-purple-700 hover:bg-purple-800 hover:text-white text-purple-400 focus:ring-purple-700`}
				onClick={onUpVolume}
				aria-label="Increase volume"
			>
				Vol+
			</button>
			<button
				type="button"
				className={`${btnBase} border-purple-400 hover:bg-purple-500 hover:text-white text-purple-300 focus:ring-purple-400`}
				onClick={onDownVolume}
				aria-label="Decrease volume"
			>
				Vol-
			</button>
		</div>
	);
}

export default PlayerControls;
