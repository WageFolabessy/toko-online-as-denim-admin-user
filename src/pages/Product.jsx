import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import PropTypes from "prop-types";
import AddProductModal from "../components/Product/AddProductModal";
import EditProductModal from "../components/Product/EditProductModal";
import ViewProductModal from "../components/Product/ViewProductModal";
import DeleteProductModal from "../components/Product/DeleteProductModal";
import ProductFilterComponent from "../components/Product/ProductFilterComponent";
import { AppContext } from "../context/AppContext";
import { getProducts } from "../services/productApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === 0) return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};

FormattedPrice.propTypes = { value: PropTypes.number };

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const { authFetch } = useContext(AppContext);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setFetchError(null);
    try {
      const productsData = await getProducts(authFetch);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error.message || "Gagal memuat data produk.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Produk";
    fetchProducts();
  }, [fetchProducts]);

  const handleSuccess = () => {
    fetchProducts();
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedProduct(null);
    setIsViewModalOpen(false);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedProduct(null);
    setIsDeleteModalOpen(false);
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.product_name &&
        product.product_name
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (product.category?.category_name &&
        product.category.category_name
          .toLowerCase()
          .includes(filterText.toLowerCase()))
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <ProductFilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        width: "60px",
        center: true,
        sortable: false,
      },
      // {
      //   name: "Gambar",
      //   cell: (row) =>
      //     row.images.image_url ? (
      //       <img
      //         src={row.images.image_url}
      //         alt={row.product_name || "Gambar Produk"}
      //         className="h-12 w-12 rounded object-cover shadow-sm md:h-16 md:w-16"
      //         loading="lazy"
      //       />
      //     ) : (
      //       <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 md:h-16 md:w-16">
      //         No Img
      //       </div>
      //     ),
      //   center: true,
      //   width: "120px",
      // },
      {
        name: "Nama Produk",
        selector: (row) => row.product_name,
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Kategori",
        selector: (row) => row.category?.category_name,
        sortable: true,
        wrap: true,
        minWidth: "150px",
      },
      {
        name: "Harga Ori",
        selector: (row) => row.original_price,
        sortable: true,
        cell: (row) => <FormattedPrice value={row.original_price} />,
        right: true,
        minWidth: "140px",
      },
      {
        name: "Harga Diskon",
        selector: (row) => row.sale_price,
        sortable: true,
        cell: (row) => <FormattedPrice value={row.sale_price} />,
        right: true,
        minWidth: "140px",
      },
      {
        name: "Stok",
        selector: (row) => row.stock,
        sortable: true,
        center: true,
        minWidth: "80px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <button
              onClick={() => openViewModal(row)}
              className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Lihat Detail"
              aria-label={`Lihat detail ${row.product_name}`}
            >
              <FaEye className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Edit"
              aria-label={`Edit ${row.product_name}`}
            >
              <FaEdit className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Hapus"
              aria-label={`Hapus ${row.product_name}`}
            >
              <FaTrash className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        center: true,
        minWidth: "120px",
      },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      table: {
        style: {
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        },
      },
      header: {
        style: {
          fontSize: "1.125rem",
          fontWeight: "600",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        },
      },
      subHeader: {
        style: { padding: "1rem 1rem 0.5rem 1rem", backgroundColor: "#ffffff" },
      },
      headRow: {
        style: {
          backgroundColor: "#f3f4f6",
          borderBottomWidth: "1px",
          minHeight: "40px",
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          padding: "0.5rem 1rem",
          color: "#4b5563",
          textTransform: "uppercase",
          "&:last-of-type": { justifyContent: "center" },
        },
      },
      cells: {
        style: {
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          color: "#1f2937",
          borderBottom: "1px solid #f3f4f6",
          minHeight: "50px",
        },
      },
      pagination: {
        style: {
          borderTop: "1px solid #e5e7eb",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
        },
      },
      noData: {
        style: { padding: "2rem", textAlign: "center", color: "#6b7280" },
      },
    }),
    []
  );

  const paginationOptions = useMemo(
    () => ({
      rowsPerPageText: "Baris per halaman:",
      rangeSeparatorText: "dari",
      selectAllRowsItem: true,
      selectAllRowsItemText: "Semua",
    }),
    []
  );

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Manajemen Produk
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="mr-2 h-4 w-4" /> Tambah Produk
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingProducts ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data produk...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-10 text-center text-gray-500">
                Tidak ada data produk ditemukan.
              </div>
            }
          />
        )}
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleSuccess}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        product={selectedProduct}
      />
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Product;
