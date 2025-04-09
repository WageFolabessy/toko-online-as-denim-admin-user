import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import AddProductModal from "../components/Product/AddProductModal";
import EditProductModal from "../components/Product/EditProductModal";
import ViewProductModal from "../components/Product/ViewProductModal";
import DeleteProductModal from "../components/Product/DeleteProductModal";
import { AppContext } from "../context/AppContext";

const ProductFilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
    <input
      id="search"
      type="text"
      placeholder="Cari Produk..."
      aria-label="Search Input"
      value={filterText}
      onChange={onFilter}
      className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full sm:w-72"
    />
    <button
      onClick={onClear}
      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 w-full sm:w-auto"
    >
      Reset Pencarian
    </button>
  </div>
);

const Product = () => {
  useEffect(() => {
    document.title = "AS Denim | Dashboard - Produk";
  }, []);

  // State untuk menyimpan data produk yang diambil dari API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  const { authFetch } = useContext(AppContext);

  useEffect(() => {
    authFetch("/api/admin/product")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setErrorProducts(error);
        setLoadingProducts(false);
      });
  }, []);

  // Filter state
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Filter produk berdasarkan nama produk atau nama kategori
  const filteredProducts = products.filter(
    (product) =>
      (product.product_name &&
        product.product_name
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (product.category &&
        product.category.category_name &&
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

  // State untuk modals dan produk yang dipilih
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Event handlers untuk membuka/menutup modal
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

  // Definisi kolom DataTable
  const columns = [
    {
      name: "No",
      cell: (row, index) => <div>{index + 1}</div>,
      width: "60px",
      center: true,
    },
    {
      name: "Nama Produk",
      selector: (row) => row.product_name,
      sortable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: "Kategori",
      selector: (row) => (row.category ? row.category.category_name : ""),
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "Harga Original",
      selector: (row) => row.original_price,
      sortable: true,
      cell: (row) => `Rp ${row.original_price.toLocaleString("id-ID")}`,
      right: true,
      minWidth: "150px",
    },
    {
      name: "Harga Diskon",
      selector: (row) => row.sale_price,
      sortable: true,
      cell: (row) => `${row.sale_price ? "Rp " + row.sale_price.toLocaleString("id-ID") : "-"}`,
      right: true,
      minWidth: "150px",
    },
    {
      name: "Stok",
      selector: (row) => row.stock,
      sortable: true,
      center: true,
      minWidth: "100px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => openViewModal(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="text-lg" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="text-lg" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
      minWidth: "150px",
    },
  ];

  // Custom styles untuk DataTable (opsional)
  const customStyles = {
    table: {
      style: {
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        overflow: "hidden",
      },
    },
    header: {
      style: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        borderBottom: "2px solid #e5e7eb",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f3f4f6",
        borderBottomWidth: "2px",
      },
    },
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        padding: "0.75rem 1rem",
        color: "#374151",
      },
    },
    cells: {
      style: {
        fontSize: "0.875rem",
        padding: "0.75rem 1rem",
        color: "#4b5563",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        padding: "1rem",
      },
    },
    responsiveWrapper: {
      style: {
        borderRadius: "0.5rem",
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Tombol Tambah Produk */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Produk
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <FaPlus className="mr-2 text-lg" />
          Tambah Produk
        </button>
      </div>

      {/* Tabel Produk Menggunakan DataTable */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        {loadingProducts ? (
          <p className="text-center text-gray-500">Memuat produk...</p>
        ) : errorProducts ? (
          <p className="text-center text-red-500">
            Terjadi kesalahan saat mengambil produk.
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50, 100]}
            paginationComponentOptions={{
              rowsPerPageText: "Baris per halaman:",
              rangeSeparatorText: "dari",
            }}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="p-4 text-center text-gray-500">
                Tidak ada produk.
              </div>
            }
          />
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        setProducts={setProducts}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        product={selectedProduct}
        setProducts={setProducts}
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
        setProducts={setProducts}
      />
    </div>
  );
};

export default Product;
