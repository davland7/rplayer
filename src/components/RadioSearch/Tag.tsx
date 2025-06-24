import { HiMiniMusicalNote, HiStar } from "react-icons/hi2";

interface TagProps {
	name: string;
	search: "country" | "tag" | "saved";
	code?: string;
	onClick: (tag: string) => void;
	className?: string; // Optional prop for custom class
	selected?: boolean; // Prop for selected state
}

const Tag = ({ name, search, code, onClick, className = "", selected = false }: TagProps) => {
	const handleClick = () => {
		onClick(name);
	};

	// Conditional styles: yellow/black if selected, otherwise gray
	const baseClass =
		"flex items-center gap-1 bg-gray-900 text-gray-100 border border-gray-700 rounded px-3 py-1 text-sm transition-colors rounded-md cursor-pointer";
	const selectedClass = selected
		? "bg-black text-yellow-400 border-yellow-400 font-bold shadow cursor-default"
		: "hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black";

	return (
		<button
			type="button"
			className={`group ${baseClass} ${selectedClass} ${className}`}
			onClick={handleClick}
			disabled={selected}
		>
			{code && search === "country" && <span className={`fi fi-${code}`}></span>}
			{search === "saved" && (
				<HiStar
					className={`inline-block w-5 h-5 mr-2 align-middle ${selected ? "text-yellow-400" : "text-yellow-400 group-hover:text-black group-focus:text-black"}`}
					aria-hidden="true"
				/>
			)}
			{search === "tag" && (
				<HiMiniMusicalNote
					className={`inline-block w-5 h-5 mr-2 align-middle ${selected ? "text-yellow-400" : "text-white group-hover:text-black group-focus:text-black"}`}
					aria-hidden="true"
				/>
			)}
			<span className={selected ? "font-bold" : "font-normal"} style={{ letterSpacing: "0.01em" }}>
				{name}
			</span>
		</button>
	);
};

export default Tag;
export type { TagProps };
