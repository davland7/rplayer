import type { TagUI } from "./RadioSearch.js";
import Tag from "./Tag.js";

interface PopularTagsProps {
	tags: TagUI[];
	selectedTag: string;
	initialVisibleCount: number;
	setSelectedTag: (tag: string) => void;
	setVisibleCount: (count: number) => void;
	searchStations: (tag: string) => void;
}

const PopularTags = ({
	tags,
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
			{tags.map((item) => (
				<Tag
					key={item.code ? `country-${item.code}` : `tag-${item.slug}`}
					name={item.name}
					type={item.type}
					code={item.code}
					slug={item.slug}
					isActive={selectedTag.toLowerCase() === item.slug.toLowerCase()}
					onClick={() => {
						setSelectedTag(item.slug);
						setVisibleCount(initialVisibleCount);
						searchStations(item.name);
					}}
				/>
			))}
		</div>
	</div>
);

export default PopularTags;
