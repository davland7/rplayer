import { useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { RadioStation } from "../../api/radio-browser.js";

interface UseStationsFilterProps {
  stations: RadioStation[];
  favoritesStations: RadioStation[];
  selectedTag: string;
  filterText: string;
  visibleCount: number;
}

export function useStationsFilter({
  stations,
  favoritesStations,
  selectedTag,
  filterText,
  visibleCount,
}: UseStationsFilterProps) {
  // You could add SpecialTag logic here if needed
  const allStations = useMemo(
    () => (selectedTag === "favorites" ? favoritesStations : stations),
    [selectedTag, favoritesStations, stations]
  );

  const hasFilter = filterText.trim().length >= 3;
  const filteredStations = useMemo(
    () =>
      hasFilter
        ? allStations.filter((station) =>
            station.name.toLowerCase().includes(filterText.trim().toLowerCase())
          )
        : allStations,
    [allStations, filterText, hasFilter]
  );

  const displayedStations = useMemo(
    () => filteredStations.slice(0, visibleCount),
    [filteredStations, visibleCount]
  );

  const showLoadMoreButton = filteredStations.length > visibleCount;

  return {
    allStations,
    hasFilter,
    filteredStations,
    displayedStations,
    showLoadMoreButton,
  };
}
