interface LoadMoreStationsProps {
  showLoadMore: boolean;
  showSeeMoreLink: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
  loading?: boolean;
  seeMoreHref?: string;
  seeMoreLabel?: string;
}

const LoadMoreStations: React.FC<LoadMoreStationsProps> = ({
  showLoadMore,
  showSeeMoreLink,
  onLoadMore,
  disabled = false,
  loading = false,
  seeMoreHref = "#",
  seeMoreLabel = "See more",
}) => {
  if (!showLoadMore && !showSeeMoreLink) return null;
  return (
    <div className="mt-6 text-center">
      {showLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={disabled || loading}
          className="px-6 py-2 bg-gray-900 hover:bg-secondary rounded-md text-white border border-gray-700 transition-colors relative overflow-hidden"
          style={{ minWidth: 180 }}
        >
          <span
            className={`transition-opacity duration-300 ${loading ? 'opacity-0 absolute' : 'opacity-100 relative'}`}
            aria-hidden={loading}
          >
            Load More Results
          </span>
          <span
            className={`transition-opacity duration-300 ${loading ? 'opacity-100 relative' : 'opacity-0 absolute'}`}
            aria-live="polite"
          >
            Loading...
          </span>
        </button>
      )}
      {showSeeMoreLink && (
        <p className="text-gray-400 text-sm mt-4">
          For more stations, see the dedicated page&nbsp;
          <a
            href={seeMoreHref}
            className="underline hover:text-primary-500"
          >
            {seeMoreLabel}
          </a>
          .
        </p>
      )}
    </div>
  );
};

export default LoadMoreStations;
