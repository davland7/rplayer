import { useCallback, useEffect, useState } from "react";
import Player from "../Player/Player.js";
import StationsTable from "./StationsTable.js";
import Tag from "./Tag.js";
import { useRadioSearchApi } from "./useRadioSearchApi.js";
import { useSavedStations } from "./useSavedStations.js";

export interface RadioStation {
	stationuuid: string;
	name: string;
	url: string;
	favicon: string;
	tags: string;
	country: string;
	countrycode?: string; // Optional country code
	language: string;
	bitrate: number;
	codec: string;
}

export interface GenreCountryItem {
	code: string; // country code or '' for tag
	name: string;
	search: "country" | "tag" | "saved";
}

export interface RadioSearchProps {
	className?: string;
	preloadedStations: RadioStation[];
	preloadedGenresCountries: GenreCountryItem[];
	initialTag?: string;
	apiBase: string;
	searchParams: Record<string, string>;
	initialVisibleCount: number;
}

/**
 * RadioSearch - A React component that combines the player and radio search
 * @param {RadioSearchProps} props - Component properties
 * @returns {JSX.Element} The RadioSearch component
 */
const RadioSearch = ({
	className = "",
	preloadedStations,
	preloadedGenresCountries,
	initialTag = "",
	apiBase,
	searchParams,
	initialVisibleCount,
}: RadioSearchProps) => {
	// Use the hook for saved stations
	const { savedStations, saveStation, removeStation, saveMessage } = useSavedStations();

	// Local state for pagination and selected tag
	const [visibleCount, setVisibleCount] = useState<number>(initialVisibleCount);
	const [selectedTag, setSelectedTag] = useState<string>(
		initialTag || preloadedStations[0]?.tags?.split(",")[0] || "dance",
	);

	// Use the hook for API search
	const { stations, setStations, loading, error, hasMoreResults, searchStations } =
		useRadioSearchApi({
			apiBase,
			searchParams,
			genresCountries: preloadedGenresCountries,
			savedStations,
		});

	// For the currently playing station URL and name
	const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string>("");
	const [currentPlayingName, setCurrentPlayingName] = useState<string>("");

	// Effect to initialize search or state
	useEffect(() => {
		if (!preloadedStations || preloadedStations.length === 0) {
			searchStations(initialTag);
		} else {
			setStations(preloadedStations);
			setSelectedTag(initialTag);
		}
	}, [initialTag, preloadedStations, preloadedStations.length, setStations, searchStations]);

	// Play a station URL
	const handlePlay = useCallback((stationUrl: string, name: string = "") => {
		setCurrentPlayingUrl(stationUrl);
		setCurrentPlayingName(name);
		if (stationUrl) {
			document.querySelector(".player-section")?.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	// When removing a station, if on 'Saved', update the displayed list
	const handleRemoveStation = (stationUuid: string) => {
		removeStation(stationUuid);
		if (selectedTag === "Saved") {
			// Force update of the displayed list
			setStations(savedStations.filter((station) => station.stationuuid !== stationUuid));
		}
	};

	return (
		<div className={`integrated-player-search ${className}`}>
			{/* Player Section - Uses the Player component */}
			<Player
				initialVolume={0.2}
				defaultSource={currentPlayingUrl ?? preloadedStations[0]?.url ?? ""}
				stationName={currentPlayingName}
				autoplay={false}
			/>
			<div className="mt-10 max-w-content mx-auto">
				<h2 className="text-2xl font-bold mb-6 text-white">Radio Station Search</h2>
				<p className="mb-4 text-gray-400 text-sm">
					Stations are provided by the open{" "}
					<a
						href="https://www.radio-browser.info/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-yellow-400"
					>
						Radio Browser API
					</a>
					.
				</p>
				{/* Tags only */}
				<div className="mb-8">
					<div className="mb-2 text-gray-300 font-medium">Popular genres & countries</div>
					<div className="flex flex-wrap gap-2">
						{preloadedGenresCountries.map((item: GenreCountryItem) => (
							<Tag
								key={item.code ? `country-${item.code}` : `tag-${item.name}`}
								name={item.name}
								search={item.search}
								code={item.code}
								onClick={() => {
									setSelectedTag(item.name);
									setVisibleCount(initialVisibleCount);
									searchStations(item.name);
								}}
								selected={selectedTag === item.name}
							/>
						))}
					</div>
				</div>
				{/* Error display */}
				{error && (
					<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
						<p>{error}</p>
					</div>
				)}
				{/* Search Results */}
				{stations.length > 0 ? (
					<>
						<h3 className="text-xl font-semibold text-white mb-4">
							Search Results{" "}
							<span className="text-gray-400 text-sm font-normal ml-2">
								({stations.length} stations found)
							</span>
						</h3>
						<StationsTable
							stations={stations.slice(0, visibleCount)}
							savedStations={savedStations}
							onPlay={handlePlay}
							onSave={saveStation}
							onRemove={handleRemoveStation}
							showCodec={true}
						/>
						{/* Load more results button */}
						{hasMoreResults && visibleCount < stations.length && (
							<div className="mt-6 text-center">
								<button
									type="button"
									onClick={() => setVisibleCount((c: number) => c + 10)}
									disabled={loading}
									className="px-6 py-2 bg-gray-900 hover:bg-secondary rounded-md text-white border border-gray-700 transition-colors"
								>
									{loading ? "Loading..." : "Load More Results"}
								</button>
							</div>
						)}
					</>
				) : (
					!loading &&
					!error && (
						<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
							<p>Choose a genre above to find radio stations.</p>
						</div>
					)
				)}
				{/* Loading indicator */}
				{loading && (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
						<p className="mt-2">Loading stations...</p>
					</div>
				)}
				{/* Save confirmation message */}
				{saveMessage && (
					<div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg">
						{saveMessage}
					</div>
				)}
			</div>
		</div>
	);
};

export default RadioSearch;
