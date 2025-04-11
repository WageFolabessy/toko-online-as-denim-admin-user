import PropTypes from "prop-types";

const ProductFilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
    <input
      id="search-product"
      type="text"
      placeholder="Cari Nama Produk/Kategori..."
      aria-label="Search Input Product"
      value={filterText}
      onChange={onFilter}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-72"
    />
    <button
      type="button"
      onClick={onClear}
      className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white shadow transition-colors duration-200 hover:bg-gray-700 sm:w-auto"
    >
      Reset
    </button>
  </div>
);

ProductFilterComponent.propTypes = {
  filterText: PropTypes.string.isRequired,
  onFilter: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default ProductFilterComponent;
