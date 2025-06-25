interface PlayerErrorPanelProps {
	error: string;
}

function PlayerErrorPanel({ error }: PlayerErrorPanelProps) {
	if (!error) return null;
	return (
		<div
			className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
			role="alert"
			aria-live="assertive"
		>
			<p>{error}</p>
		</div>
	);
}

export default PlayerErrorPanel;
