interface LoadMoreStationsProps {
	showLoadMore: boolean;
	onLoadMore: () => void;
	disabled?: boolean;
	loading?: boolean;
}

const LoadMoreStations: React.FC<LoadMoreStationsProps> = ({
	showLoadMore,
	onLoadMore,
	disabled = false,
	loading = false,
}) => {
	// If button should not be shown, render nothing
	if (!showLoadMore) return null;
	return (
		<div className="mt-6 text-center">
			<button
				type="button"
				onClick={onLoadMore}
				disabled={disabled || loading}
				className="px-6 py-2 bg-gray-900 hover:bg-secondary rounded-md text-white border border-gray-700 transition-colors relative overflow-hidden"
				style={{ minWidth: 180 }}
			>
				<span
					className={`transition-opacity duration-300 ${loading ? "opacity-0 absolute" : "opacity-100 relative"}`}
					aria-hidden={loading}
				>
					Load More Results
				</span>
				<span
					className={`transition-opacity duration-300 ${loading ? "opacity-100 relative" : "opacity-0 absolute"}`}
					aria-live="polite"
				>
					Loading...
				</span>
			</button>
		</div>
	);
};

export default LoadMoreStations;
