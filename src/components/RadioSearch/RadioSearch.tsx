import { type JSX, useCallback, useEffect, useState } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import PopularTags from "./PopularTags.js";
import { useRadioSearchApi } from "./useRadioSearchApi.js";
import { useFavoritesStations } from "./useFavoritesStations.js";
import { type GenreCountryItem, type RadioStation, SearchType } from "../../api/radio-browser.js";
import { SpecialTag } from "./SpecialTag.js";
import NoStationsFound from "./NoStationsFound.js";
import LoadingIndicator from "./LoadingIndicator.js";
import SaveMessage from "./SaveMessage.js";
import LoadMoreStations from "./LoadMoreStations.js";
import StationNameFilter from "./StationNameFilter.js";

export interface RadioSearchProps {
	initialTag: string;
	initialVisibleCount: number;
	preloadedGenresCountries?: GenreCountryItem[];
	preloadedStations: RadioStation[];
}

export type TagType = SearchType | SpecialTag.Favorites;
export interface TagUI {
  name: string;
  slug: string;
  type: TagType;
  code?: string;
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
	const [filterText, setFilterText] = useState<string>("");

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

	const filteredStations = filterText.trim()
		? displayedStations.filter(station =>
			station.name.toLowerCase().includes(filterText.trim().toLowerCase())
		)
		: displayedStations;

	// --- PAGE TYPE DETECTION ---
	// Detects if we are on the homepage, a detail page, or a category page
	const isHomePage = initialTag === SpecialTag.Favorites;
	const isDetailPage = Array.isArray(preloadedGenresCountries) && preloadedGenresCountries.length === 0;
	const isCategoryPage = !isHomePage && Array.isArray(preloadedGenresCountries) && preloadedGenresCountries.length > 0;

	// Add the "Favorites" tag at the start of the list for PopularTags (homepage only)
	const tagsWithFavorites: TagUI[] = isHomePage
  ? [
      {
        name: "Favorites",
        slug: "favorites",
        type: SpecialTag.Favorites,
      },
      ...preloadedGenresCountries,
    ]
  : preloadedGenresCountries;

	// --- LOAD MORE LOGIC ---
	// Controls the "Load More" button and result limits for each page type
	const isLimited = (isCategoryPage || isHomePage) && initialVisibleCount > 0;
	const MAX_RESULTS = isDetailPage ? Infinity : initialVisibleCount * 2;
	const showLoadMore = (isCategoryPage || isHomePage)
  ? hasMoreResults && visibleCount < Math.min(stations.length, MAX_RESULTS)
  : isDetailPage && hasMoreResults && visibleCount < stations.length;
	const showSeeMoreLink = isLimited && visibleCount >= MAX_RESULTS && stations.length > MAX_RESULTS;

	// --- UTILS ---
	// Utility functions for "See More" navigation
	function getSeeMoreItem() {
		return preloadedGenresCountries.find(t => t.slug === selectedTag || t.name === selectedTag);
	}
	function getSeeMoreHref() {
		const item = getSeeMoreItem();
		if (!item) return "#";
		return `/${item.type === SearchType.Country ? "country" : "tag"}/${item.slug}`;
	}
	function getSeeMoreLabel() {
		const item = getSeeMoreItem();
		return item?.name || selectedTag;
	}

	return (
		<>
			<Player
				initialVolume={0.2}
				defaultSource={currentPlayingUrl ?? preloadedStations[0]?.url ?? ""}
				stationName={currentPlayingName}
				autoplay={false}
			/>
			<div className="mt-6">
				{(isCategoryPage || isHomePage) && (
					<PopularTags
						tags={tagsWithFavorites}
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
						{/* Only show the filter on detail pages (e.g. /tag/dance) */}
						{isDetailPage && (
							<StationNameFilter
              value={filterText}
              onChange={setFilterText}
            />
						)}

						{/* Show a message if the filter returns no results on a detail page */}
						{isDetailPage && filteredStations.length === 0 && filterText.trim() ? (
							<div className="text-center text-gray-400 my-8">No stations match your search.</div>
						) : (
							<StationsTable
								stations={filteredStations}
								savedStations={favoritesStations}
								onPlay={handlePlay}
								onSave={saveStation}
								onRemove={handleRemoveStation}
								showCodec={true}
							/>
						)}

            {/* Show the LoadMoreStations button on all pages, but on detail pages only if there are more results */}
            <LoadMoreStations
              showLoadMore={showLoadMore}
              showSeeMoreLink={showSeeMoreLink}
              onLoadMore={() => setVisibleCount((c: number) => Math.min(c + initialVisibleCount, MAX_RESULTS))}
              disabled={loading}
              loading={loading}
              seeMoreHref={getSeeMoreHref()}
              seeMoreLabel={getSeeMoreLabel()}
            />
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
