interface PlayerStatusPanelProps {
	status: string;
	volume: number;
	currentTime: number;
	format: string;
}

function PlayerStatusPanel({
	status,
	volume,
	currentTime,
	format,
}: PlayerStatusPanelProps) {
	return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 p-4 rounded-md font-mono text-sm bg-secondary">
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
	);
}

export default PlayerStatusPanel;
