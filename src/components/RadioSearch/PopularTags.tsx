import type { GenreCountryItem } from "../../api/radio-browser.js";
import Tag from "./Tag.js";

interface PopularTagsProps {
	preloadedGenresCountries: GenreCountryItem[];
	selectedTag: string;
	initialVisibleCount: number;
	setSelectedTag: (tag: string) => void;
	setVisibleCount: (count: number) => void;
	searchStations: (tag: string) => void;
}

const PopularTags = ({
	preloadedGenresCountries,
	selectedTag,
	initialVisibleCount,
	setSelectedTag,
	setVisibleCount,
	searchStations,
}: PopularTagsProps) => (
	<div className="mb-8">
		<div className="mb-2 text-gray-300 font-medium">
			Popular{" "}
			<a href="/tag" className="text-primary-500 underline hover:no-underline">
				genres
			</a>{" "}
			&{" "}
			<a href="/country" className="text-primary-500 underline hover:no-underline">
				countries
			</a>
		</div>
		<div className="flex flex-wrap gap-2">
			{preloadedGenresCountries.map((item) => (
				<Tag
					key={item.code ? `country-${item.code}` : `tag-${item.slug}`}
					name={item.name}
					type={item.type}
					code={item.code}
					onClick={() => {
						setSelectedTag(item.slug);
						setVisibleCount(initialVisibleCount);
						searchStations(item.name);
					}}
					selected={selectedTag.toLowerCase() === item.slug.toLowerCase()}
				/>
			))}
		</div>
	</div>
);

export default PopularTags;
