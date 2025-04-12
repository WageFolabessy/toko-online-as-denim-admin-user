import PropTypes from "prop-types";

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row">
    <label htmlFor="search-report" className="sr-only">
      Cari Laporan
    </label>
    <input
      id="search-report"
      type="text"
      placeholder="Cari No.Order/Pelanggan/Resi..."
      aria-label="Search Input Report"
      value={filterText}
      onChange={onFilter}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto sm:flex-grow" // Flex grow
    />
    <button
      type="button"
      onClick={onClear}
      className="w-full flex-shrink-0 rounded-lg bg-gray-600 px-4 py-2 text-white shadow transition-colors duration-200 hover:bg-gray-700 sm:w-auto"
    >
      Reset Filter
    </button>
  </div>
);

FilterComponent.propTypes = {
  filterText: PropTypes.string.isRequired,
  onFilter: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default FilterComponent;
