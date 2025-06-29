import { HiMusicalNote, HiStar } from "react-icons/hi2";
import { SearchType } from "../../api/radio-browser.js";
import { SpecialTag } from "./SpecialTag.js";

interface TagProps {
	name: string;
	type: SearchType | SpecialTag.Favorites;
	code?: string;
	onClick: (tag: string) => void;
	selected?: boolean; // Prop for selected state
}

const Tag = ({ name, type, code, onClick, selected = false }: TagProps) => {
	const handleClick = () => {
		onClick(name);
	};

	const selectedClass = selected
		? "bg-black text-yellow-400 border-yellow-400 font-bold shadow cursor-default"
		: "hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black";

	const iconClass = `inline-block w-5 h-5 mr-2 align-middle ${selected ? "text-yellow-400" : "text-white group-hover:text-black group-focus:text-black"}`;
	const starIconClass = `inline-block w-5 h-5 mr-2 align-middle ${selected ? "text-yellow-400" : "text-yellow-400 group-hover:text-black group-focus:text-black"}`;

	return (
		<button
			type="button"
			className={`flex items-center gap-1 bg-gray-900 text-gray-100 border border-gray-700 px-3 py-1 text-sm transition-colors rounded-md cursor-pointer group ${selectedClass}`}
			onClick={handleClick}
			disabled={selected}
			aria-label={name}
		>
			{type === SearchType.Country && code && <span className={`fi fi-${code}`}></span>}
			{type === SpecialTag.Favorites && <HiStar className={starIconClass} aria-hidden="true" />}
			{type === SearchType.Tag && <HiMusicalNote className={iconClass} aria-hidden="true" />}
			<span className={selected ? "font-bold" : "font-normal"} style={{ letterSpacing: "0.01em" }}>
				{name}
			</span>
		</button>
	);
};

export default Tag;
export type { TagProps };
