import React from 'react';

// Définition d'une classe utilitaire btn pour harmoniser les boutons
const btnBase =
  "font-bold p-2 rounded transition-colors border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50";

interface PlayerControlsProps {
  isPlaying: boolean;
  url: string;
  inputUrl: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onUpVolume: () => void;
  onDownVolume: () => void;
  onRewind: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  url,
  inputUrl,
  onPlay,
  onPause,
  onStop,
  onUpVolume,
  onDownVolume,
  onRewind
}) => (
  <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-6 mb-4">
    <button
      className={"btn border-green-500 hover:bg-green-600 hover:text-white text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"}
      onClick={onPlay}
      disabled={!inputUrl && !url}
    >
      Play
    </button>
    <button
      className={"btn border-yellow-500 hover:bg-yellow-600 hover:text-white text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"}
      onClick={onPause}
      disabled={!isPlaying}
    >
      Pause
    </button>
    <button
      className={"btn border-red-500 hover:bg-red-600 hover:text-white text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"}
      onClick={onStop}
      disabled={!url}
    >
      Stop
    </button>
    <button
      className={"btn border-blue-500 hover:bg-blue-600 hover:text-white text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"}
      onClick={onRewind}
      disabled={!url}
    >
      Rewind
    </button>
    <button
      className={"btn border-purple-700 hover:bg-purple-800 hover:text-white text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-50"}
      onClick={onUpVolume}
    >
      Vol+
    </button>
    <button
      className={"btn border-purple-400 hover:bg-purple-500 hover:text-white text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"}
      onClick={onDownVolume}
    >
      Vol-
    </button>
  </div>
);

export default PlayerControls;
