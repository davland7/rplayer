import { useId } from "react";

interface StationNameFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const StationNameFilter = ({ value, onChange, placeholder = "Filter by station name..." }: StationNameFilterProps) => {
  const inputId = useId();
  return (
    <div className="mb-4 relative flex items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        Filter stations by name
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 px-4 py-2 bg-white border-2 border-gray-500 rounded text-black transition-colors hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Clear filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>Clear filter</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StationNameFilter;
