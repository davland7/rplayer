import React from 'react';
import type { RadioStation } from './RadioSearch';
import Badge from './Badge';
import { HiPlay, HiBookmark, HiTrash } from 'react-icons/hi2';
import { TbHammer } from 'react-icons/tb';

interface StationsTableProps {
  stations: RadioStation[];
  savedStations: RadioStation[];
  onPlay: (url: string, name: string) => void;
  onSave: (station: RadioStation) => void;
  onRemove: (stationUuid: string) => void;
  showCodec?: boolean;
}

const StationsTable: React.FC<StationsTableProps> = ({
  stations,
  savedStations,
  onPlay,
  onSave,
  onRemove,
  showCodec = false,
}) => {
  const isSaved = (station: RadioStation) =>
    savedStations.some((s) => s.stationuuid === station.stationuuid);

  console.log(stations);

  return (
    <div className="overflow-x-auto bg-black rounded-lg border-gray-800 sm:border">
      <table className="w-full text-left border-collapse min-w-full bg-black text-white">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium">Station</th>
            <th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium text-right whitespace-nowrap">Format</th>
            <th className="px-2 sm:px-4 py-2 text-gray-400 text-sm font-medium text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {stations.map((station) => (
            <tr key={station.stationuuid} className="hover:bg-gray-800 transition-colors">
              <td className="px-0 sm:px-4 py-3 sm:py-4">
                <div className="flex items-center">
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt={station.name}
                      title={station.name}
                      className="w-8 h-8 mr-2 rounded-full bg-gray-100 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/favicon.png';
                      }}
                    />
                  ) : (
                    <img
                      src="/images/favicon.png"
                      alt={station.name}
                      title={station.name}
                      className="w-8 h-8 mr-2 rounded-full bg-gray-100 object-contain"
                    />
                  )}
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span className="truncate max-w-[160px] sm:max-w-[260px] block text-white">{station.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[160px] sm:max-w-[260px]">
                      {station.tags ? station.tags.replace(/,/g, ', ') : null}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-0 sm:px-4 py-3 sm:py-4 text-right align-middle w-1 sm:w-24 whitespace-nowrap">
                <div className="flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2">
                  {station.url.endsWith('.m3u8') ? (
                    <Badge className="border border-purple-700 text-purple-300 font-semibold bg-transparent" title="HLS">
                      HLS
                    </Badge>
                  ) : (
                    <Badge className="border border-gray-700 text-gray-300 bg-transparent" title="Audio">
                      Audio
                    </Badge>
                  )}
                  {station.codec && (
                    <Badge className="border border-blue-700 text-blue-300 font-semibold bg-transparent" title={station.codec.toUpperCase()}>
                      {station.codec.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-0 sm:px-4 py-3 sm:py-4 text-right align-middle w-1 sm:w-32 whitespace-nowrap">
                <div className="flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2">
                  <button
                    onClick={() => onPlay(station.url, station.name)}
                    className="bg-gray-900 text-white px-3 py-2 rounded text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 flex items-center gap-1"
                    title="Play"
                  >
                    <HiPlay className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">Play</span>
                  </button>
                  {isSaved(station) ? (
                    <button
                      onClick={() => onRemove(station.stationuuid)}
                      className="bg-gray-900 text-red-400 px-3 py-2 rounded text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center gap-1"
                      title="Remove"
                    >
                      <HiTrash className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Remove</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSave(station)}
                      className="bg-gray-900 text-blue-300 px-3 py-2 rounded text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 flex items-center gap-1"
                      title="Save"
                    >
                      <HiBookmark className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Save</span>
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
