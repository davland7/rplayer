import { isCookiesAccepted } from "../../utils/storage.js";

const NoStationsFound = () => (
	<div className="mt-6 p-4 text-sm rounded-md bg-secondary text-white text-center">
		<p>
			Hey, want to try <span className="font-semibold">R<span className="text-primary">Player</span></span>? Good news: you can search by genre, or browse all available
			{' '}
			<a href="/tag" className="text-primary underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Genres</a>
			{' '}or{' '}
			<a href="/country" className="text-primary underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Countries</a>
			{' '}to discover online radio stations. You can also add stations to your Favorites for quick access.
			{!isCookiesAccepted() && (
				<span className="text-xs text-gray-500 block mt-2">
					Note: To use the Favorites feature, please accept cookies (see the banner at the top).
				</span>
			)}
		</p>
	</div>
);

export default NoStationsFound;
