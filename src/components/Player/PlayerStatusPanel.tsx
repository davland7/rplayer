/**
 *
 * CSS: OK
 */

interface PlayerStatusPanelProps {
	status: string;
	volume: number;
	currentTime: number;
	format: string;
	source: string;
}

function PlayerStatusPanel({
	status,
	volume,
	currentTime,
	format,
	source,
}: PlayerStatusPanelProps) {
	return (
		<div className="mt-6 p-4 rounded-md font-mono text-sm bg-secondary text-white">
			<div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
				<div>
					<span className="font-bold text-amber-300">Status:</span> {status}
				</div>
				<div>
					<span className="font-bold text-amber-300">Format:</span> {format}
				</div>
				<div>
					<span className="font-bold text-amber-300">Volume:</span> {volume}%
				</div>
				<div>
					<span className="font-bold text-amber-300">Time:</span> {currentTime.toFixed(2)}
				</div>
			</div>
			<div className="mt-4 text-xs text-gray-500 break-all">
				<span className="text-amber-300">Source:</span> {source || "None"}
			</div>
		</div>
	);
}

export default PlayerStatusPanel;
