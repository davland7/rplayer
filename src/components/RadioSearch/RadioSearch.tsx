import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import { useFavoritesStations } from "./useFavoritesStations.js";
import { useStationsFilter } from "./useStationsFilter.js";
import type { RadioStation } from "../../utils/api.js";
import NoStationsFound from "./NoStationsFound.js";
import LoadMoreStations from "./LoadMoreStations.js";
import StationNameFilter from "./StationNameFilter.js";
import Toast, { type ToastType } from "../Toast.js";

export interface RadioSearchProps {
	initialVisibleCount: number;
	preloadedStations: RadioStation[];
	showFavoritesOnly?: boolean;
}

/**
 * RadioSearch - A React component that combines the player and radio search
 * @param {RadioSearchProps} props - Component properties
 * @returns {JSX.Element} The RadioSearch component
 */

const RadioSearch = ({
	initialVisibleCount,
	preloadedStations = [],
	showFavoritesOnly = false,
}: RadioSearchProps): JSX.Element => {
	const {
		favoritesStations,
		saveStation,
		removeStation,
		saveMessage,
		saveMessageType,
	} = useFavoritesStations();
	const [visibleCount, setVisibleCount] = useState<number>(initialVisibleCount);
	const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string>("");
	const [filterText, setFilterText] = useState<string>("");
	const [showOnlyHls, setShowOnlyHls] = useState(false);

	const stations = showFavoritesOnly ? favoritesStations : preloadedStations;

	useEffect(() => {
		setVisibleCount(initialVisibleCount);
	}, [initialVisibleCount]);

	const handlePlay = useCallback((stationUrl: string) => {
		setCurrentPlayingUrl(stationUrl);
		if (stationUrl) {
			document.querySelector(".player-section")?.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	const handleRemoveStation = (stationUuid: string) => {
		removeStation(stationUuid);
	};

	const { filteredStations: baseFilteredStations } = useStationsFilter({
		stations,
		filterText,
		visibleCount,
	});

	const filteredStations = showOnlyHls
		? baseFilteredStations.filter((station) => station.url.endsWith(".m3u8"))
		: baseFilteredStations;

	const displayedStations = filteredStations.slice(0, visibleCount);
	const showLoadMoreButton = filteredStations.length > visibleCount;

	return (
		<>
			<Player source={currentPlayingUrl} />
			<div className="mt-4">
				{(stations.length > initialVisibleCount || filterText.trim()) && (
					<div className="flex flex-col w-full">
						<StationNameFilter value={filterText} onChange={setFilterText} />
						<label className="flex justify-end mb-4 gap-2 text-sm">
							<input
								type="checkbox"
								checked={showOnlyHls}
								onChange={(e) => setShowOnlyHls(e.target.checked)}
							/>
							HLS only (.m3u8)
						</label>
					</div>
				)}
				{/* Search Results */}
				{filteredStations.length === 0 ? (
					filterText.trim() ? (
						<div className="text-center text-gray-400 my-8">No stations match your search.</div>
					) : (
						<NoStationsFound />
					)
				) : (
					<>
						<StationsTable
							stations={displayedStations}
							savedStations={favoritesStations}
							onPlay={handlePlay}
							onSave={saveStation}
							onRemove={handleRemoveStation}
							showCodec={true}
						/>
						{/* Show the LoadMoreStations button on all pages */}
						{showLoadMoreButton && (
							<LoadMoreStations
								showLoadMore={true}
								onLoadMore={() =>
									setVisibleCount((c: number) =>
										Math.min(c + initialVisibleCount, filteredStations.length),
									)
								}
							/>
						)}
					</>
				)}
				{saveMessage && <Toast message={saveMessage} type={saveMessageType as ToastType} />}
			</div>
		</>
	);
};

export default RadioSearch;
