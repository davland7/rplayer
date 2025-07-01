import type { GenreCountryItem } from "../api/radio-browser.js";

interface ItemLinksProps {
  items: GenreCountryItem[];
  basePath: string;
  activeSlug?: string;
}

const ItemLinks = ({ items, basePath, activeSlug }: ItemLinksProps) => (
  <ul className="flex flex-wrap gap-2" aria-label={`List of ${basePath} links`}>
    {items.map(item => {
      const isActive = activeSlug && item.slug.toLowerCase() === activeSlug.toLowerCase();
      const selectedClass = isActive
        ? "bg-black text-primary-500 border-primary-500 font-bold shadow cursor-default"
        : "hover:bg-primary-600 hover:text-black focus:bg-primary-600 focus:text-black";
      return (
        <li key={item.slug}>
          <a
            href={`/${basePath}/${item.slug}`}
            className={`flex items-center gap-1 bg-gray-900 text-gray-100 border border-gray-700 px-3 py-1 text-sm transition-colors rounded-md cursor-pointer group ${selectedClass}`}
            aria-label={`${item.name} ${basePath}`}
            tabIndex={isActive ? -1 : 0}
            aria-current={isActive ? "page" : undefined}
          >
            {item.name}
          </a>
        </li>
      );
    })}
  </ul>
);

export default ItemLinks;
