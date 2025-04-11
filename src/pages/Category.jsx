import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import AddCategoryModal from "../components/Category/AddCategoryModal";
import EditCategoryModal from "../components/Category/EditCategoryModal";
import ViewCategoryModal from "../components/Category/ViewCategoryModal";
import DeleteCategoryModal from "../components/Category/DeleteCategoryModal";
import FilterComponent from "../components/Category/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getCategories } from "../services/categoryApi";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(null); // State error spesifik
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const { authFetch } = useContext(AppContext);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setFetchError(null);
    try {
      const categoriesData = await getCategories(authFetch);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error.message || "Gagal memuat data kategori.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Kategori Produk";
    fetchCategories();
  }, [fetchCategories]);

  const handleSuccess = () => {
    fetchCategories();
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedCategory(null);
    setIsEditModalOpen(false);
  };

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedCategory(null);
    setIsViewModalOpen(false);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedCategory(null);
    setIsDeleteModalOpen(false);
  };

  const filteredCategories = categories.filter(
    (item) =>
      item.category_name &&
      item.category_name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <FilterComponent
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
      {
        name: "Gambar",
        cell: (row) =>
          row.image_url ? (
            <img
              src={row.image_url}
              alt={row.category_name || "Gambar Kategori"}
              className="h-12 w-12 rounded object-cover shadow-sm md:h-16 md:w-16"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 md:h-16 md:w-16">
              No Img
            </div>
          ),
        center: true,
        width: "120px",
      },
      {
        name: "Nama Kategori",
        selector: (row) => row.category_name,
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Tanggal Dibuat",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        sortable: true,
        wrap: true,
        minWidth: "170px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <button
              onClick={() => openViewModal(row)}
              className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Lihat Detail"
              aria-label={`Lihat detail ${row.category_name}`}
            >
              <FaEye className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Edit"
              aria-label={`Edit ${row.category_name}`}
            >
              <FaEdit className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Hapus"
              aria-label={`Hapus ${row.category_name}`}
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
  ); // Kosongkan dependensi useMemo jika kolom statis

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
      }, // Tinggi header
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          padding: "0.5rem 1rem",
          color: "#4b5563",
          textTransform: "uppercase",
        },
      }, // Padding header
      cells: {
        style: {
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          color: "#1f2937",
          borderBottom: "1px solid #f3f4f6",
          minHeight: "60px",
        },
      }, // Tinggi cell
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
          Manajemen Kategori
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="mr-2 h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingCategories ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data kategori...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
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
                Tidak ada data kategori ditemukan.
              </div>
            }
          />
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleSuccess}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
      <ViewCategoryModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        category={selectedCategory}
      />
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Category;
