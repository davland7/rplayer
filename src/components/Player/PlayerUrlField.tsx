import { useId } from "react";

interface PlayerUrlFieldProps {
	inputUrl: string;
	onInputUrlChange: (value: string) => void;
	onInputPlay: () => void;
}

function PlayerUrlField({ inputUrl, onInputUrlChange, onInputPlay }: PlayerUrlFieldProps) {
	const inputId = useId();
	return (
		<div className="mt-6">
			<label htmlFor={inputId} className="sr-only">
				Stream URL
			</label>
			<div className="flex">
				<input
					id={inputId}
					className="w-full px-4 py-2 bg-white border-2 border-gray-500 rounded text-black transition-colors hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
					type="text"
					value={inputUrl}
					onChange={(e) => onInputUrlChange(e.target.value)}
					placeholder="https://example.com/stream.m3u8"
					onKeyDown={(e) => e.key === "Enter" && onInputPlay()}
				/>
			</div>
		</div>
	);
}

export default PlayerUrlField;
