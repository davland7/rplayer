import type { TagUI } from "./RadioSearch.js";
import { HiMusicalNote, HiStar } from "react-icons/hi2";
import { SearchType } from "../../api/radio-browser.js";

export enum SpecialTag {
	Favorites = "favorites",
}

interface TagProps extends TagUI {
	isActive: boolean;
	onClick: (slug: string) => void;
}

const Tag = ({ name, slug, type, code, isActive, onClick }: TagProps) => {
	const handleClick = () => {
		onClick(slug);
	};

  console.log(name, slug, type, code, isActive);

	const selectedClass = isActive
		? "bg-black text-primary-500 border-primary-500 font-bold shadow cursor-default"
		: "hover:bg-primary-600 hover:text-black focus:bg-primary-600 focus:text-black";

	const iconClass = `inline-block w-5 h-5 mr-2 align-middle ${
		isActive ? "text-primary-500" : "text-white group-hover:text-black group-focus:text-black"
	}`;
	const starIconClass = `inline-block w-5 h-5 mr-2 align-middle ${
		isActive ? "text-primary-500" : "text-primary-500 group-hover:text-black group-focus:text-black"
	}`;

	const getIcon = () => {
		if (type === SpecialTag.Favorites) {
			return <HiStar className={starIconClass} aria-hidden="true" />;
		}
		if (type === SearchType.Country && code) {
			return <span className={`fi fi-${code.toLowerCase()}`}></span>;
		}
		if (type === SearchType.Tag) {
			return <HiMusicalNote className={iconClass} aria-hidden="true" />;
		}
		return null;
	};

	return (
		<button
			type="button"
			className={`flex items-center gap-1 bg-gray-900 text-gray-100 border border-gray-700 px-3 py-1 text-sm transition-colors rounded-md cursor-pointer group ${selectedClass}`}
			onClick={handleClick}
			disabled={isActive}
			aria-label={name}
		>
			{getIcon()}
			<span className={isActive ? "font-bold" : "font-normal"} style={{ letterSpacing: "0.01em" }}>
				{name}
			</span>
		</button>
	);
};

export default Tag;
export type { TagProps };
