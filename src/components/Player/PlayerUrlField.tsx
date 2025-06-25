import { useId } from "react";

interface PlayerUrlFieldProps {
	inputUrl: string;
	onInputUrlChange: (value: string) => void;
	onInputPlay: () => void;
}

function PlayerUrlField({
	inputUrl,
	onInputUrlChange,
	onInputPlay,
}: PlayerUrlFieldProps) {
	const inputId = useId();
	return (
		<div className="mb-4">
			<label htmlFor={inputId} className="sr-only">
				Stream URL
			</label>
			<div className="flex">
				<input
					id={inputId}
					className="w-full px-4 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
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
