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
  const [fetchError, setFetchError] = useState(null);
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
    } finally {
      setLoadingCategories(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Kategori";
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
  const closeEditModal = () => setIsEditModalOpen(false);

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

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
      },
      {
        name: "Gambar",
        cell: (row) =>
          row.image_url ? (
            <img
              src={row.image_url}
              alt={row.category_name || "Gambar Kategori"}
              className="h-14 w-14 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
              No Img
            </div>
          ),
        center: true,
        width: "100px",
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
          }),
        sortable: true,
        wrap: true,
        minWidth: "170px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openViewModal(row)}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
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
      rows: {
        style: {
          minHeight: "72px",
          "&:not(:last-of-type)": {
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderBottomColor: "#f1f5f9", // slate-100
          },
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
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          borderBottomColor: "#e2e8f0", // slate-200
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#475569", // slate-600
          textTransform: "uppercase",
          paddingLeft: "1rem",
          paddingRight: "1rem",
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
          borderTopStyle: "solid",
          borderTopWidth: "1px",
          borderTopColor: "#e2e8f0", // slate-200
        },
      },
      subHeader: {
        style: {
          padding: "1rem",
        },
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
        <h1 className="text-3xl font-bold text-slate-800">
          Manajemen Kategori
        </h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaPlus /> Tambah Kategori
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingCategories ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data kategori...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
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
