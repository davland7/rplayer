import { buildParams } from "./url.js";
import { slugify } from "./slugify.js";

const API_BASE = "https://de1.api.radio-browser.info/json";
const SORT_BY_STATION_COUNT_DESC = `order=stationcount&reverse=true`;

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

export async function fetchStationsByTerm({
  term,
  type,
  limit = 128,
}: StationsByTerm): Promise<RadioStation[]> {
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
    return await response.json();
  } catch (error) {
    console.error(`Failed to load stations for ${term}:`, error);
    return [];
  }
}
