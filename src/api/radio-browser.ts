import { buildParams } from "../utils/url.js";
import { capitalizeFirstLetter } from "../utils/string.js";
import { slugify } from "../utils/slugify.js";

const API_BASE = "https://de1.api.radio-browser.info/json";

export enum SearchType {
	Tag = "tag",
	Country = "country",
}

export interface Tag {
	name: string;
	slug: string;
	stationcount?: number;
}

export interface Country {
	name: string;
	iso_3166_1?: string;
	stationcount?: number;
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

export interface GenreCountryItem {
	code?: string;
	name: string;
	type: SearchType.Country | SearchType.Tag;
	slug: string;
	stationcount?: number;
}

export interface StationsByTerm {
	term: string;
	type: SearchType.Country | SearchType.Tag;
	limit?: number;
}

export async function fetchPopularCountries(limit: number = 20): Promise<Country[]> {
	try {
		const response = await fetch(
			`${API_BASE}/countries?order=stationcount&reverse=true&limit=${limit}`,
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

export async function fetchPopularTags(limit: number = 20): Promise<Tag[]> {
	try {
		const response = await fetch(`${API_BASE}/tags?order=stationcount&reverse=true&limit=${limit}`);
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

export async function fetchPopularGenresAndCountriesSorted(
	limit: number = 20,
): Promise<GenreCountryItem[]> {
	try {
		const [tags, countries] = await Promise.all([
			fetchPopularTags(limit),
			fetchPopularCountries(limit),
		]);

		const countryItems: GenreCountryItem[] = (countries || []).map((c) => ({
			code: c.iso_3166_1 ? c.iso_3166_1.toLowerCase() : undefined,
			name: c.name,
			type: SearchType.Country,
			slug: slugify(c.name),
			stationcount: c.stationcount,
		}));

		const tagItems: GenreCountryItem[] = (tags || []).map((t) => ({
			name: capitalizeFirstLetter(t.name),
			type: SearchType.Tag,
			slug: slugify(t.name),
			stationcount: t.stationcount,
		}));

		const combined: GenreCountryItem[] = [...countryItems, ...tagItems].sort((a, b) =>
			a.name.localeCompare(b.name),
		);

		return combined;
	} catch (error) {
		console.error("Failed to load genres/countries:", error);
		return [];
	}
}

export async function fetchStationsByTerm({
	term,
	type,
	limit = 30,
}: StationsByTerm): Promise<RadioStation[]> {
	const searchParams: Record<string, string> = {
		order: "clickcount",
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

export async function fetchPopularCountriesSorted(limit: number = 20) {
	const countries = await fetchPopularCountries(limit);
	return countries
		.map((country) => {
			const slug = slugify(country.name);
			return {
				...country,
				slug,
				type: SearchType.Country as const,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPopularTagsSorted(limit: number = 20) {
	const tags = await fetchPopularTags(limit);
	return tags
		.map((tag) => ({
			...tag,
			type: SearchType.Tag as const,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}
