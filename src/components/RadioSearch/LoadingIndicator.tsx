const LoadingIndicator = () => (
	<div className="text-center py-8">
		<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
		<p className="mt-2">Loading stations...</p>
	</div>
);

export default LoadingIndicator;
