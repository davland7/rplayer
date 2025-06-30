import { type JSX, useCallback, useEffect, useState } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import Tag, { SpecialTag } from "./Tag.js";
import { useRadioSearchApi } from "./useRadioSearchApi.js";
import { useFavoritesStations } from "./useFavoritesStations.js";
import { useStationsFilter } from "./useStationsFilter.js";
import type { GenreCountryItem, RadioStation, SearchType } from "../../api/radio-browser.js";
import NoStationsFound from "./NoStationsFound.js";
import LoadingIndicator from "./LoadingIndicator.js";
import SaveMessage from "./SaveMessage.js";
import LoadMoreStations from "./LoadMoreStations.js";
import StationNameFilter from "./StationNameFilter.js";

export interface RadioSearchProps {
	initialTag: string;
	initialVisibleCount: number;
	preloadedTags?: GenreCountryItem[];
	preloadedStations: RadioStation[];
	limit: number;
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
	preloadedTags = [],
	limit,
}: RadioSearchProps): JSX.Element => {
	const { favoritesStations, saveStation, removeStation, saveMessage } = useFavoritesStations();
	const [visibleCount, setVisibleCount] = useState<number>(initialVisibleCount);
	const [selectedTag, setSelectedTag] = useState<string>(initialTag);
	const { stations, loading, error, searchStations, setStations } =
		useRadioSearchApi({
			preloadedTags,
			favoritesStations,
			limit,
		});
	const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string>("");
	const [currentPlayingName, setCurrentPlayingName] = useState<string>("");
	const [filterText, setFilterText] = useState<string>("");

	// --- PAGE TYPE DETECTION ---
	// Detects if we are on the homepage, a detail page, or a category page
	const isHomePage = initialTag === SpecialTag.Favorites;
	const isCategoryPage = !isHomePage && Array.isArray(preloadedTags) && preloadedTags.length > 0;
	const isDetailPage = Array.isArray(preloadedTags) && preloadedTags.length === 0;

	useEffect(() => {
		if (selectedTag === SpecialTag.Favorites) {
			setStations(favoritesStations);
			setVisibleCount(initialVisibleCount);
		}
	}, [selectedTag, favoritesStations, initialVisibleCount, setStations]);

	useEffect(() => {
		if (selectedTag !== SpecialTag.Favorites) {
			// Guard: never fetch client-side on a detail page if preloadedStations is provided
			if (
				isDetailPage &&
				Array.isArray(preloadedStations) &&
				preloadedStations.length > 0
			) {
				setStations(preloadedStations);
				setVisibleCount(initialVisibleCount);
			} else if (!preloadedStations || preloadedStations.length === 0) {
				if (preloadedTags.length > 0) {
					if (isDetailPage) {
						// Guard: should never happen
						console.warn(
							"[RadioSearch] SSR expected preloadedStations for detail page, but got none. Preventing client fetch."
						);
						setStations([]);
					} else {
						searchStations(selectedTag);
					}
				} else {
					setStations([]);
				}
			} else {
				setStations(preloadedStations);
				setVisibleCount(initialVisibleCount);
			}
		}
	}, [selectedTag, preloadedStations, preloadedTags.length, initialVisibleCount, isDetailPage, searchStations, setStations]);

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

	const {
		filteredStations,
		displayedStations,
		showLoadMoreButton,
	} = useStationsFilter({
		stations,
		favoritesStations,
		selectedTag,
		filterText,
		visibleCount,
	});

	// Add the "Favorites" tag at the start of the list for PopularTags (homepage only)
	const tagsWithFavorites: TagUI[] = isHomePage
  ? [
      {
        name: "Favorites",
        slug: "favorites",
        type: SpecialTag.Favorites,
      },
      ...preloadedTags,
    ]
  : preloadedTags;

	// --- LOAD MORE LOGIC ---
	// Controls the "Load More" button and result limits for each page type
	const isLimited = (isCategoryPage || isHomePage) && initialVisibleCount > 0;
	const MAX_RESULTS = isDetailPage ? Infinity : initialVisibleCount * 2;
	const showSeeMoreLink = isLimited && visibleCount >= MAX_RESULTS && stations.length > MAX_RESULTS;

	// --- UTILS ---
	// Utility functions for "See More" navigation
	function getSeeMoreItem() {
		return preloadedTags.find(t => t.slug === selectedTag || t.name === selectedTag);
	}
	function getSeeMoreHref() {
		const item = getSeeMoreItem();
		if (!item) return "#";
		return `/${item.type === "country" ? "country" : "tag"}/${item.slug}`;
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
          <>
            <div className="mb-2 text-gray-300 font-medium">
              Popular{" "}
              <a href="/tag" className="text-primary-500 underline hover:no-underline">
                genres
              </a>{" "}
              &{" "}
              <a href="/country" className="text-primary-500 underline hover:no-underline">
                countries
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {tagsWithFavorites.map((item) => (
                <Tag
                  key={`${item.type}-${item.slug}`}
                  name={item.name}
                  type={item.type}
                  code={item.code}
                  slug={item.slug}
                  isActive={selectedTag.toLowerCase() === item.slug.toLowerCase()}
                  onClick={() => {
                    setSelectedTag(item.slug);
                    setVisibleCount(initialVisibleCount);
                    searchStations(item.name);
                  }}
                />
              ))}
            </div>
          </>
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
								stations={displayedStations}
								savedStations={favoritesStations}
								onPlay={handlePlay}
								onSave={saveStation}
								onRemove={handleRemoveStation}
								showCodec={true}
							/>
						)}

            {/* Show the LoadMoreStations button on all pages, but on detail pages only if there are more results */}
            {showLoadMoreButton && (
              <LoadMoreStations
                showLoadMore={true}
                showSeeMoreLink={showSeeMoreLink}
                onLoadMore={() => setVisibleCount((c: number) => Math.min(c + initialVisibleCount, filteredStations.length))}
                disabled={loading}
                loading={loading}
                seeMoreHref={showSeeMoreLink ? getSeeMoreHref() : undefined}
                seeMoreLabel={showSeeMoreLink ? getSeeMoreLabel() : undefined}
              />
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
