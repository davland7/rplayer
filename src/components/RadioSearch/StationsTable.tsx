import { HiOutlineStar, HiPlay, HiStar } from "react-icons/hi2";
import Badge from "./Badge.js";
import { isCookiesAccepted } from "../../utils/storage.js";
import type { RadioStation } from "../../utils/api.js";

interface StationsTableProps {
	stations: RadioStation[];
	savedStations: RadioStation[];
	onPlay: (url: string, name: string) => void;
	onSave: (station: RadioStation) => void;
	onRemove: (stationUuid: string) => void;
	showCodec?: boolean;
}

const StationsTable = ({
	stations,
	savedStations,
	onPlay,
	onSave,
	onRemove,
}: StationsTableProps) => {
	const isSaved = (station: RadioStation) =>
		savedStations.some((s) => s.stationuuid === station.stationuuid);

	return (
		<div className="overflow-x-auto bg-black rounded-lg border-secondary sm:border">
			<table
				className="w-full text-left border-collapse min-w-full bg-black text-white"
				itemScope
				itemType="https://schema.org/ItemList"
			>
				<thead className="bg-secondary-600">
					<tr>
						<th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium">Station</th>
						<th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium text-right whitespace-nowrap">
							Format
						</th>
						<th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium text-right whitespace-nowrap">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-secondary">
					{stations.map((station, index) => (
						<tr
							key={station.stationuuid}
							className="hover:bg-secondary transition-colors"
							itemScope
							itemType="https://schema.org/MusicGroup"
							itemProp="itemListElement"
						>
							<td className="px-0 sm:px-4 py-3 sm:py-4">
								<span
									itemProp="position"
									content={(index + 1).toString()}
									style={{ display: "none" }}
								></span>
								<div className="flex items-center">
									{station.favicon ? (
										<img
											src={station.favicon}
											alt={station.name}
											title={station.name}
											className="w-8 h-8 mr-2 rounded-full object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).src = "/images/play-button.png";
											}}
										/>
									) : (
										<img
											src="/images/play-button.png"
											alt={station.name}
											title={station.name}
											className="w-8 h-8 mr-2 rounded-full bg-gray-100 object-contain"
										/>
									)}
									<div>
										<div className="font-medium flex items-center gap-2">
											<span
												className="truncate max-w-[160px] sm:max-w-[260px] block text-white"
												itemProp="name"
											>
												{station.name}
											</span>
										</div>
										<div
											className="text-xs text-gray-400 truncate max-w-[160px] sm:max-w-[260px]"
											itemProp="genre"
										>
											{station.tags ? station.tags.replace(/,/g, ", ") : null}
										</div>
										<meta itemProp="url" content={station.url} />
										{station.country && <meta itemProp="nationality" content={station.country} />}
									</div>
								</div>
							</td>
							<td className="px-0 sm:px-4 py-3 sm:py-4 text-right align-middle w-1 sm:w-24 whitespace-nowrap">
								<div className="flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2">
									{station.url.endsWith(".m3u8") ? (
										<Badge
											className="border border-purple-700 text-purple-300 font-semibold bg-transparent"
											title="HLS"
										>
											HLS
										</Badge>
									) : (
										<Badge
											className="border border-gray-700 text-gray-300 bg-transparent"
											title="Audio"
										>
											Audio
										</Badge>
									)}
									{station.codec && (
										<Badge
											className="border border-blue-700 text-blue-300 font-semibold bg-transparent"
											title={station.codec.toUpperCase()}
										>
											{station.codec.toUpperCase()}
										</Badge>
									)}
								</div>
							</td>
							<td className="px-0 sm:px-4 py-3 sm:py-4 text-right align-middle w-1 sm:w-32 whitespace-nowrap">
								<div className="flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2">
									<button
										type="button"
										onClick={() => onPlay(station.url, station.name)}
										className="bg-gray-900 text-white px-3 py-2 rounded text-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 flex items-center gap-1"
										title="Play"
									>
										<HiPlay className="w-4 h-4" aria-hidden="true" />
										<span className="sr-only">Play</span>
									</button>
									{isSaved(station) ? (
										<button
											type="button"
											onClick={() => onRemove(station.stationuuid)}
											className="bg-gray-900 text-yellow-400 px-3 py-2 rounded text-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 flex items-center gap-1"
											title="Remove from Favorites"
										>
											<HiStar className="w-4 h-4 fill-yellow-400" aria-hidden="true" />
											<span className="sr-only">Remove from Favorites</span>
										</button>
									) : (
										<button
											type="button"
											onClick={() => onSave(station)}
											className="bg-gray-900 text-yellow-400 px-3 py-2 rounded text-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
											title={
												isCookiesAccepted() ? "Add to Favorites" : "Accept cookies to save stations"
											}
											disabled={!isCookiesAccepted()}
										>
											<HiOutlineStar className="w-4 h-4" aria-hidden="true" />
											<span className="sr-only">Add to Favorites</span>
										</button>
									)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default StationsTable;
