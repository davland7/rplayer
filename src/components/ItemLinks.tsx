import type { GenreCountryItem } from "../api/radio-browser.js";

interface ItemLinksProps {
  items: GenreCountryItem[];
  basePath: string;
}

const ItemLinks = ({ items, basePath }: ItemLinksProps) => (
  <ul className="flex flex-wrap gap-2"
    aria-label={`List of ${basePath} links`}
  >
    {items.map(item => (
      <li key={item.slug}>
        <a
          href={`/${basePath}/${item.slug}`}
          className="text-sm inline-block px-3 py-1 rounded bg-secondary-500 text-white hover:bg-secondary-600 transition"
          aria-label={`${item.name} ${basePath}`}
        >
          {item.name}
        </a>
      </li>
    ))}
  </ul>
);

export default ItemLinks;
