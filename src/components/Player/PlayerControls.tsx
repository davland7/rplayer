/**
 *
 * Juste vérifier c'est url et urlInput
 * CSS: OK
 *
 */

interface PlayerControlsProps {
	isPlaying: boolean;
	isPaused: boolean;
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
	isPaused,
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
		<div className="mt-6 grid grid-cols-3 gap-2 lg:grid-cols-6">
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-green-500 text-green-400 hover:bg-green-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
				onClick={onPlay}
				disabled={!inputUrl && !url}
				aria-label="Play"
			>
				Play
			</button>
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-yellow-500 text-yellow-400 hover:bg-yellow-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
				onClick={onPause}
				disabled={!isPlaying}
				aria-label="Pause"
			>
				Pause
			</button>
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-red-500 text-red-400 hover:bg-red-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
				onClick={onStop}
				disabled={!isPlaying}
				aria-label="Stop"
			>
				Stop
			</button>
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
				onClick={onRewind}
				disabled={!url}
				aria-label="Rewind"
			>
				Rewind
			</button>
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors border-purple-700 text-purple-600 hover:bg-purple-800 hover:text-black focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
				onClick={onUpVolume}
				aria-label="Increase volume"
			>
				Vol+
			</button>
			<button
				type="button"
				className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-purple-400 text-purple-300 hover:bg-purple-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
				onClick={onDownVolume}
				aria-label="Decrease volume"
			>
				Vol-
			</button>
		</div>
	);
}

export default PlayerControls;
