import { type JSX, useCallback, useEffect, useState } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import { useFavoritesStations } from "./useFavoritesStations.js";
import { useStationsFilter } from "./useStationsFilter.js";
import type { RadioStation } from "../../api/radio-browser.js";
import NoStationsFound from "./NoStationsFound.js";
import SaveMessage from "./SaveMessage.js";
import LoadMoreStations from "./LoadMoreStations.js";
import StationNameFilter from "./StationNameFilter.js";

export interface RadioSearchProps {
  initialVisibleCount: number;
  preloadedStations: RadioStation[];
  showFavoritesOnly?: boolean;
  activeSection?: "tag" | "country";
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
  activeSection,
}: RadioSearchProps): JSX.Element => {
  const { favoritesStations, saveStation, removeStation, saveMessage } = useFavoritesStations();
  const [visibleCount, setVisibleCount] = useState<number>(initialVisibleCount);
  const stations = showFavoritesOnly ? favoritesStations : preloadedStations;
  // removed unused loading and error state
  const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string>("");
  const [currentPlayingName, setCurrentPlayingName] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [shouldPlay, setShouldPlay] = useState(false);


useEffect(() => {
  setVisibleCount(initialVisibleCount);
}, [initialVisibleCount]);

const handlePlay = useCallback((stationUrl: string, name: string = "") => {
  setCurrentPlayingUrl(stationUrl);
  setCurrentPlayingName(name);
  setShouldPlay(true);
  if (stationUrl) {
    document.querySelector(".player-section")?.scrollIntoView({ behavior: "smooth" });
  }
}, []);

// Reset shouldPlay to false after each play trigger
useEffect(() => {
  if (shouldPlay) {
    setShouldPlay(false);
  }
}, [shouldPlay]);

const handleRemoveStation = (stationUuid: string) => {
  removeStation(stationUuid);
};

const {
  filteredStations,
  displayedStations,
  showLoadMoreButton,
} = useStationsFilter({
  stations,
  filterText,
  visibleCount,
});

const MAX_RESULTS = initialVisibleCount * 2;
const showSeeMoreLink = visibleCount >= MAX_RESULTS && stations.length > MAX_RESULTS;

return (
  <>
    <Player
      defaultSource={currentPlayingUrl ?? preloadedStations[0]?.url ?? ""}
      stationName={currentPlayingName}
      autoplay={false}
      shouldPlay={shouldPlay}
    />
    <div className="mt-6">
      <nav aria-label="Main tag navigation" className="mb-2 text-gray-300 font-medium">
        <span>Popular{' '}</span>
        <a
          href="/tag"
          className={
            `underline hover:no-underline px-1 ${activeSection === "tag" ? "font-bold text-primary-500" : "text-primary-500"}`
          }
          aria-label="Browse by genres"
          aria-current={activeSection === "tag" ? "page" : undefined}
        >
          genres
        </a>{' '}
        &{' '}
        <a
          href="/country"
          className={
            `underline hover:no-underline px-1 ${activeSection === "country" ? "font-bold text-primary-500" : "text-primary-500"}`
          }
          aria-label="Browse by countries"
          aria-current={activeSection === "country" ? "page" : undefined}
        >
          countries
        </a>
      </nav>
      {/* Search Results */}
      {filteredStations.length > 0 ? (
        <>
          {/* Always show the filter */}
          <StationNameFilter
            value={filterText}
            onChange={setFilterText}
          />
          {/* Show a message if the filter returns no results and filter is active */}
          {filteredStations.length === 0 && filterText.trim() ? (
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
          {/* Show the LoadMoreStations button on all pages */}
          {showLoadMoreButton && (
            <LoadMoreStations
              showLoadMore={true}
              showSeeMoreLink={showSeeMoreLink}
              onLoadMore={() => setVisibleCount((c: number) => Math.min(c + initialVisibleCount, filteredStations.length))}
              // removed loading prop, always enabled
            />
          )}
        </>
      ) : (
        <NoStationsFound />
      )}
      {/* Save confirmation message */}
      {saveMessage && <SaveMessage message={saveMessage} />}
    </div>
    {!showFavoritesOnly && (
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
    )}
  </>
);
};

export default RadioSearch;
