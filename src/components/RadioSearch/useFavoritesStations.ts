import { useCallback, useEffect, useState } from "react";
import { FAVORITES_KEY, getLocalStorageItem, setLocalStorageItem } from "../../utils/storage.js";
import type { RadioStation } from "../../utils/api.js";

/**
 * Custom hook to manage favorite stations in localStorage
 */
export function useFavoritesStations() {
	const [favoritesStations, setFavoritesStations] = useState<RadioStation[]>([]);
	const [saveMessage, setSaveMessage] = useState<string>("");

	// Load favorite stations on mount
	useEffect(() => {
		const savedStationsJSON = getLocalStorageItem<string>(FAVORITES_KEY);
		if (savedStationsJSON) {
			try {
				const parsedStations = JSON.parse(savedStationsJSON);
				if (Array.isArray(parsedStations)) {
					setFavoritesStations(parsedStations);
				}
			} catch (e) {
				console.error("Failed to parse favorite stations from localStorage:", e);
			}
		}
	}, []);

	// Add a station
	const saveStation = useCallback(
		(station: RadioStation) => {
			const stationExists = favoritesStations.some(
				(savedStation) => savedStation.stationuuid === station.stationuuid,
			);
			if (stationExists) {
				setSaveMessage(`"${station.name}" is already in your favorites.`);
				setTimeout(() => setSaveMessage(""), 3000);
				return;
			}
			const newFavoritesStations = [...favoritesStations, station];
			setFavoritesStations(newFavoritesStations);
			setLocalStorageItem(FAVORITES_KEY, JSON.stringify(newFavoritesStations));
			setSaveMessage(`"${station.name}" has been added to your favorites.`);
			setTimeout(() => setSaveMessage(""), 3000);
		},
		[favoritesStations],
	);

	// Remove a station
	const removeStation = useCallback(
		(stationUuid: string) => {
			const stationToRemove = favoritesStations.find(
				(station) => station.stationuuid === stationUuid,
			);
			if (!stationToRemove) return;
			const newFavoritesStations = favoritesStations.filter(
				(station) => station.stationuuid !== stationUuid,
			);
			setFavoritesStations(newFavoritesStations);
			setLocalStorageItem(FAVORITES_KEY, JSON.stringify(newFavoritesStations));
			setSaveMessage(`"${stationToRemove.name}" has been removed from your favorites.`);
			setTimeout(() => setSaveMessage(""), 3000);
		},
		[favoritesStations],
	);

	return { favoritesStations, saveStation, removeStation, saveMessage, setSaveMessage };
}
