import { useState, useEffect, useCallback } from 'react';
import type { RadioStation } from './RadioSearch';

/**
 * Custom hook to manage saved stations in localStorage
 */
export function useSavedStations() {
  const [savedStations, setSavedStations] = useState<RadioStation[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Load saved stations on mount
  useEffect(() => {
    const savedStationsJSON = localStorage.getItem('savedRadioStations');
    if (savedStationsJSON) {
      try {
        const parsedStations = JSON.parse(savedStationsJSON);
        if (Array.isArray(parsedStations)) {
          setSavedStations(parsedStations);
        }
      } catch (e) {
        console.error('Failed to parse saved stations from localStorage:', e);
      }
    }
  }, []);

  // Add a station
  const saveStation = useCallback((station: RadioStation) => {
    const stationExists = savedStations.some(
      (savedStation) => savedStation.stationuuid === station.stationuuid
    );
    if (stationExists) {
      setSaveMessage(`"${station.name}" is already in your saved stations.`);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    const newSavedStations = [...savedStations, station];
    setSavedStations(newSavedStations);
    localStorage.setItem('savedRadioStations', JSON.stringify(newSavedStations));
    setSaveMessage(`"${station.name}" has been added to your saved stations.`);
    setTimeout(() => setSaveMessage(''), 3000);
  }, [savedStations]);

  // Remove a station
  const removeStation = useCallback((stationUuid: string) => {
    const stationToRemove = savedStations.find(station => station.stationuuid === stationUuid);
    if (!stationToRemove) return;
    const newSavedStations = savedStations.filter(
      (station) => station.stationuuid !== stationUuid
    );
    setSavedStations(newSavedStations);
    localStorage.setItem('savedRadioStations', JSON.stringify(newSavedStations));
    setSaveMessage(`"${stationToRemove.name}" has been removed from your saved stations.`);
    setTimeout(() => setSaveMessage(''), 3000);
  }, [savedStations]);

  return { savedStations, saveStation, removeStation, saveMessage, setSaveMessage };
}
