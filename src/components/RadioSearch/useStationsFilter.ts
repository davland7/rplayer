import { useMemo } from "react";
import type { RadioStation } from "../../utils/api.js";

interface UseStationsFilterProps {
  stations: RadioStation[];
  filterText: string;
  visibleCount: number;
}

export function useStationsFilter({
  stations,
  filterText,
  visibleCount,
}: UseStationsFilterProps) {
  const hasFilter = filterText.trim().length >= 3;
  const filteredStations = useMemo(
    () =>
      hasFilter
        ? stations.filter((station) =>
            station.name.toLowerCase().includes(filterText.trim().toLowerCase())
          )
        : stations,
    [stations, filterText, hasFilter]
  );

  const displayedStations = useMemo(
    () => filteredStations.slice(0, visibleCount),
    [filteredStations, visibleCount]
  );

  const showLoadMoreButton = filteredStations.length > visibleCount;

  return {
    filteredStations,
    displayedStations,
    showLoadMoreButton,
  };
}
