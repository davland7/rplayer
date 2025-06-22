import { useState, useCallback } from 'react';
import type { RadioStation, GenreCountryItem } from './RadioSearch';

interface UseRadioSearchApiOptions {
  apiBase: string;
  searchParams: Record<string, string>;
  genresCountries: GenreCountryItem[];
  savedStations: RadioStation[];
}

export function useRadioSearchApi({ apiBase, searchParams, genresCountries, savedStations }: UseRadioSearchApiOptions) {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);

  // Utility function to build query params
  const buildParams = (params: Record<string, string>) =>
    Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

  // Search by tag, country or 'Saved'
  const searchStations = useCallback(async (itemName: string) => {
    if (itemName === 'Saved') {
      setStations(savedStations);
      setHasMoreResults(false);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setStations([]);
    setHasMoreResults(true);
    try {
      const item = genresCountries.find((c) => c.name.toLowerCase() === itemName.toLowerCase());
      const params = { ...searchParams };
      let url = '';
      if (item && item.search === 'country') {
        url = `${apiBase}/stations/bycountry/${encodeURIComponent(item.name)}?${buildParams(params)}`;
      } else {
        params.tag = itemName;
        url = `${apiBase}/stations/search?${buildParams(params)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStations(data);
        setHasMoreResults(data.length > 10);
      } else {
        setError('Unexpected response format from the API.');
        setHasMoreResults(false);
      }
    } catch (error) {
      console.error(error);
      setError('Error while searching for stations.');
      setHasMoreResults(false);
    } finally {
      setLoading(false);
    }
  }, [apiBase, searchParams, genresCountries, savedStations]);

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
