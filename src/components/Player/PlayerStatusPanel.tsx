import type React from "react";

interface PlayerStatusPanelProps {
	status: string;
	volume: number;
	currentTime: number;
	format: string;
	source: string;
}

const PlayerStatusPanel: React.FC<PlayerStatusPanelProps> = ({
	status,
	volume,
	currentTime,
	format,
	source,
}) => {
	return (
		<div className="bg-secondary p-4 rounded-md font-mono text-sm text-white">
			<div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
				<div>
					<span className="font-bold text-yellow-400">Status:</span> {status}
				</div>
				<div>
					<span className="font-bold text-yellow-400">Format:</span> {format}
				</div>
				<div>
					<span className="font-bold text-yellow-400">Volume:</span> {volume}%
				</div>
				<div>
					<span className="font-bold text-yellow-400">Time:</span> {currentTime.toFixed(2)}
				</div>
			</div>
			<div className="mt-2 text-xs text-gray-400 break-all">
				<span className="text-yellow-400">Source:</span> {source || "None"}
			</div>
		</div>
	);
};

export default PlayerStatusPanel;
