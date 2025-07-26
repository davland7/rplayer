interface PlayerStatusPanelProps {
	status: string;
	volume: number;
	currentTime: number;
	isHls: boolean;
}

function PlayerStatusPanel({ status, volume, currentTime, isHls }: PlayerStatusPanelProps) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4 p-4 rounded-md font-mono text-sm bg-secondary">
			<div>
				<span className="font-bold text-amber-300">Status:</span> {status}
			</div>
			<div>
				<span className="font-bold text-amber-300">HLS:</span> {isHls ? "Yes" : "No"}
			</div>
			<div>
				<span className="font-bold text-amber-300">Volume:</span> {Math.round(volume * 100)}%
			</div>
			<div>
				<span className="font-bold text-amber-300">Time:</span> {currentTime.toFixed(2)}
			</div>
		</div>
	);
}

export default PlayerStatusPanel;
