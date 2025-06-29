import { isCookiesAccepted } from "../../utils/storage.js";

const NoStationsFound = () => (
	<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
		<p>
			Choose a genre above to find radio stations.
			<br />
			{!isCookiesAccepted() && (
				<span className="text-xs text-gray-500 block mt-2">
					To save your favorite stations, please accept cookies (see the banner at the top).
				</span>
			)}
		</p>
	</div>
);

export default NoStationsFound;
