import { type JSX, useCallback, useEffect, useState } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import PopularTags from "./PopularTags.js";
import { useRadioSearchApi } from "./useRadioSearchApi.js";
import { useFavoritesStations } from "./useFavoritesStations.js";
import type { GenreCountryItem, RadioStation } from "../../api/radio-browser.js";
import { SpecialTag } from "./SpecialTag.js";
import NoStationsFound from "./NoStationsFound.js";
import LoadingIndicator from "./LoadingIndicator.js";
import SaveMessage from "./SaveMessage.js";

export interface RadioSearchProps {
	initialTag: string;
	initialVisibleCount: number;
	preloadedGenresCountries?: GenreCountryItem[];
	preloadedStations: RadioStation[];
}

/**
 * RadioSearch - A React component that combines the player and radio search
 * @param {RadioSearchProps} props - Component properties
 * @returns {JSX.Element} The RadioSearch component
 */
const RadioSearch = ({
	initialTag,
	initialVisibleCount,
	preloadedStations,
	preloadedGenresCountries = [],
}: RadioSearchProps): JSX.Element => {
	const { favoritesStations, saveStation, removeStation, saveMessage } = useFavoritesStations();
	const [visibleCount, setVisibleCount] = useState<number>(initialVisibleCount);
	const [selectedTag, setSelectedTag] = useState<string>(initialTag);
	const { stations, loading, error, hasMoreResults, searchStations, setStations } =
		useRadioSearchApi({
			genresCountries: preloadedGenresCountries,
			favoritesStations,
		});
	const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string>("");
	const [currentPlayingName, setCurrentPlayingName] = useState<string>("");

	useEffect(() => {
		if (selectedTag === SpecialTag.Favorites) {
			setStations(favoritesStations);
			setVisibleCount(initialVisibleCount);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTag, favoritesStations, initialVisibleCount, setStations]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: searchStations and setStations are stable from custom hook, dependencies intentionally omitted to avoid unwanted reloads
	useEffect(() => {
		if (selectedTag !== SpecialTag.Favorites) {
			if (!preloadedStations || preloadedStations.length === 0) {
				if (preloadedGenresCountries.length > 0) {
					searchStations(selectedTag);
				} else {
					setStations([]);
				}
			} else {
				setStations(preloadedStations);
				setVisibleCount(initialVisibleCount);
			}
		}
	}, [selectedTag, preloadedStations, preloadedGenresCountries.length, initialVisibleCount]);

	const handleTagSelect = useCallback(
		(tag: string) => {
			setSelectedTag(tag);
			setVisibleCount(initialVisibleCount);
		},
		[initialVisibleCount],
	);

	const handlePlay = useCallback((stationUrl: string, name: string = "") => {
		setCurrentPlayingUrl(stationUrl);
		setCurrentPlayingName(name);
		if (stationUrl) {
			document.querySelector(".player-section")?.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	const handleRemoveStation = (stationUuid: string) => {
		removeStation(stationUuid);
		if (selectedTag === SpecialTag.Favorites) {
			setStations(favoritesStations.filter((station) => station.stationuuid !== stationUuid));
		}
	};

	const displayedStations =
		selectedTag === SpecialTag.Favorites ? favoritesStations : stations.slice(0, visibleCount);

	return (
		<>
			<Player
				initialVolume={0.2}
				defaultSource={currentPlayingUrl ?? preloadedStations[0]?.url ?? ""}
				stationName={currentPlayingName}
				autoplay={false}
			/>
			<div className="mt-6">
				{preloadedGenresCountries && (
					<PopularTags
						preloadedGenresCountries={preloadedGenresCountries}
						selectedTag={selectedTag}
						initialVisibleCount={initialVisibleCount}
						setSelectedTag={handleTagSelect}
						setVisibleCount={setVisibleCount}
						searchStations={searchStations}
					/>
				)}
				{/* Error display */}
				{error && (
					<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
						<p>{error}</p>
					</div>
				)}
				{/* Search Results */}
				{stations.length > 0 ? (
					<>
						<StationsTable
							stations={displayedStations}
							savedStations={favoritesStations}
							onPlay={handlePlay}
							onSave={saveStation}
							onRemove={handleRemoveStation}
							showCodec={true}
						/>
						{/* Load more results button */}
						{hasMoreResults && visibleCount < stations.length && (
							<div className="mt-6 text-center">
								<button
									type="button"
									onClick={() => setVisibleCount((c: number) => c + 10)}
									disabled={loading}
									className="px-6 py-2 bg-gray-900 hover:bg-secondary rounded-md text-white border border-gray-700 transition-colors"
								>
									{loading ? "Loading..." : "Load More Results"}
								</button>
							</div>
						)}
					</>
				) : (
					!loading && !error && <NoStationsFound />
				)}
				{/* Loading indicator */}
				{loading && <LoadingIndicator />}
				{/* Save confirmation message */}
				{saveMessage && <SaveMessage message={saveMessage} />}
			</div>
			<p className="mt-12 text-center text-gray-400 text-sm">
				Stations are provided by the open{" "}
				<a
					href="https://www.radio-browser.info/"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-primary-500"
				>
					Radio Browser API
				</a>
				.
			</p>
		</>
	);
};

export default RadioSearch;
