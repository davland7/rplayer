import { useCallback, useState } from "react";
import { fetchStationsByTerm, type GenreCountryItem, type RadioStation, SearchType } from "../../api/radio-browser.js";

interface UseRadioSearchApiOptions {
	genresCountries: GenreCountryItem[];
	favoritesStations: RadioStation[];
}

export function useRadioSearchApi({
	genresCountries,
	favoritesStations,
}: UseRadioSearchApiOptions) {
	const [stations, setStations] = useState<RadioStation[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);

	// Search by tag, country or 'Favorites'
	const searchStations = useCallback(
		async (itemName: string) => {
			if (itemName === "Favorites") {
				setStations(favoritesStations);
				setHasMoreResults(false);
				setError("");
				setLoading(false);
				return;
			}
			setLoading(true);
			setError("");
			setStations([]);
			setHasMoreResults(true);
			try {
				const item = genresCountries.find((c) => c.name.toLowerCase() === itemName.toLowerCase());
				let data: RadioStation[] = [];
				if (item) {
					// Use fetchStationsByTerm utility
					data = await fetchStationsByTerm({ term: item.name, type: item.type });
				} else {
					// Fallback: treat as tag
					data = await fetchStationsByTerm({ term: itemName, type: SearchType.Tag });
				}
				if (Array.isArray(data)) {
					setStations(data);
					setHasMoreResults(data.length > 10);
				} else {
					setError("Unexpected response format from the API.");
					setHasMoreResults(false);
				}
			} catch (error) {
				console.error(error);
				setError("Error while searching for stations.");
				setHasMoreResults(false);
			} finally {
				setLoading(false);
			}
		},
		[genresCountries, favoritesStations],
	);

	return {
		stations,
		setStations,
		loading,
		error,
		hasMoreResults,
		setHasMoreResults,
		searchStations,
	};
}
