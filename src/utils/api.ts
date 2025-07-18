import { buildParams } from "./url.js";
import { slugify } from "./slugify.js";

import customStationsJson from './customStations.json' with { type: 'json' };
const customStations: RadioStation[] = customStationsJson as RadioStation[];

const API_BASE = "https://de1.api.radio-browser.info/json";
const SORT_BY_STATION_COUNT_DESC = `order=stationcount&reverse=true`;
// Formats of stream to exclude
const EXCLUDED_EXTENSIONS = ['.pls', '.m3u'];
// List of banned stations by their UUIDs stationuuid
const BANNED_STATIONS_UUIDS = new Set<string>([
  // Example : "custom-1", "stationuuid-api-123"
]);

export enum SearchType {
  Tag = "tag",
  Country = "country"
}

export interface Country {
  name: string;
  iso_3166_1?: string;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Term {
  code?: string;
  name: string;
  type: SearchType.Country | SearchType.Tag;
  slug: string;
}

export interface StationsByTerm {
  term: string;
  type: SearchType.Country | SearchType.Tag;
  limit: number;
}

export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode?: string;
  language: string;
  bitrate: number;
  codec: string;
}

export async function fetchPopularCountries(limit: number): Promise<Country[]> {
  try {
    const response = await fetch(
      `${API_BASE}/countries?${SORT_BY_STATION_COUNT_DESC}&limit=${limit}`,
    );
    const countries = await response.json();
    return countries.map((c: Country) => ({
      ...c,
      slug: slugify(c.name),
    }));
  } catch (error) {
    console.error("Failed to load countries:", error);
    return [];
  }
}

export async function fetchPopularTags(limit: number): Promise<Tag[]> {
  try {
    const response = await fetch(
      `${API_BASE}/tags?${SORT_BY_STATION_COUNT_DESC}&limit=${limit}`
    );
    const tags = await response.json();
    return tags.map((t: Tag) => ({
      ...t,
      slug: slugify(t.name),
    }));
  } catch (error) {
    console.error("Failed to load tags:", error);
    return [];
  }
}

export async function fetchTerms(
  limit: number = 16,
): Promise<Term[]> {
  try {
    const [tags, countries] = await Promise.all([
      fetchPopularTags(limit),
      fetchPopularCountries(limit),
    ]);

    const countryItems: Term[] = (countries || [])
      .filter(c => c.name && slugify(c.name))
      .map((c) => ({
        code: c.iso_3166_1 ? c.iso_3166_1.toLowerCase() : undefined,
        name: c.name,
        type: SearchType.Country,
        slug: slugify(c.name)
      }));

    const tagItems: Term[] = (tags || [])
      .filter(t => t.name && slugify(t.name))
      .map((t) => ({
        name: t.name,
        type: SearchType.Tag,
        slug: slugify(t.name)
      }));

    const combined: Term[] = [...countryItems, ...tagItems].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return combined;
  } catch (error) {
    console.error("Failed to load terms:", error);
    return [];
  }
}

function filterCustomStations(term: string, type: SearchType): RadioStation[] {
  if (type === SearchType.Country) {
    return customStations.filter((s: RadioStation) =>
      s.country.toLowerCase() === term.toLowerCase()
    );
  } else if (type === SearchType.Tag) {
    return customStations.filter((s: RadioStation) =>
      s.tags.toLowerCase().split(/[, ]+/).includes(term.toLowerCase())
    );
  }
  return [];
}

export async function fetchStationsByTerm({
  term,
  type,
  limit = 128,
}: StationsByTerm): Promise<RadioStation[]> {
  const filteredCustom = filterCustomStations(term, type);
  const searchParams: Record<string, string> = {
    order: "lastchecktime",
    limit: String(limit),
    reverse: "true",
    hidebroken: "true",
    offset: "0",
  };

  try {
    const response = await fetch(
      `${API_BASE}/stations/search?${`${type}=${term}`}&${buildParams(searchParams)}`,
    );
    if (!response.ok) throw new Error(`Failed to load stations for ${term}`);
    let apiRadioBrowser: RadioStation[] = await response.json();
    // Nettoie la liste des stations pour RPlayer
    apiRadioBrowser = apiRadioBrowser
      .filter(s => !BANNED_STATIONS_UUIDS.has(s.stationuuid))
      .filter(s => s.url.startsWith("https://"))
      .filter(s => {
        const url = s.url.toLowerCase().split('?')[0];
        return !EXCLUDED_EXTENSIONS.some(ext => url.endsWith(ext));
      })

    return [...filteredCustom, ...apiRadioBrowser];
  } catch (error) {
    console.error(`Failed to load stations for ${term}:`, error);
    return [...filteredCustom];
  }
}
