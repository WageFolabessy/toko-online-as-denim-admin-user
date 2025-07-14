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
  if (value === null || value === undefined) return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};

FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

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
      const errorMessage = error.message || "Gagal memuat data produk.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingProducts(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Produk";
    fetchProducts();
  }, [fetchProducts]);

  const handleSuccess = () => fetchProducts();
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

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
      },
      {
        name: "Gambar",
        cell: (row) => {
          const imageUrl =
            row.images && row.images.length > 0
              ? row.images[0].image_url
              : null;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={row.product_name}
              className="h-14 w-14 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
              No Img
            </div>
          );
        },
        center: true,
        width: "100px",
      },
      {
        name: "Nama Produk",
        selector: (row) => row.product_name,
        sortable: true,
        wrap: true,
        minWidth: "250px",
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
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openViewModal(row)}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100"
              title="Lihat Detail"
            >
              <FaEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-100"
              title="Edit"
            >
              <FaEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-100"
              title="Hapus"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        ),
        center: true,
        minWidth: "120px",
      },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      rows: {
        style: {
          minHeight: "72px",
          "&:not(:last-of-type)": { borderBottom: "1px solid #f1f5f9" }, // slate-100
        },
        highlightOnHoverStyle: {
          backgroundColor: "#f8fafc", // slate-50
          borderBottomColor: "#f1f5f9",
        },
      },
      headRow: {
        style: {
          backgroundColor: "#f8fafc", // slate-50
          minHeight: "56px",
          borderBottom: "1px solid #e2e8f0", // slate-200
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#475569", // slate-600
          textTransform: "uppercase",
          padding: "1rem",
        },
      },
      cells: {
        style: {
          fontSize: "0.875rem",
          color: "#334155", // slate-700
          padding: "1rem",
          lineHeight: "1.5",
        },
      },
      pagination: {
        style: {
          borderTop: "1px solid #e2e8f0", // slate-200
        },
      },
      subHeader: {
        style: { padding: "1rem" },
      },
    }),
    []
  );

  const paginationOptions = useMemo(
    () => ({
      rowsPerPageText: "Baris per halaman:",
      rangeSeparatorText: "dari",
    }),
    []
  );

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Produk</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaPlus /> Tambah Produk
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingProducts ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data produk...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="py-16 text-center text-slate-500">
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
