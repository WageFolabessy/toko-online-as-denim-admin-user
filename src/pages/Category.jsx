import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import AddCategoryModal from "../components/Category/AddCategoryModal";
import EditCategoryModal from "../components/Category/EditCategoryModal";
import ViewCategoryModal from "../components/Category/ViewCategoryModal";
import DeleteCategoryModal from "../components/Category/DeleteCategoryModal";
import { AppContext } from "../context/AppContext";

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
    <input
      id="search"
      type="text"
      placeholder="Cari Kategori..."
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

const Category = () => {
  useEffect(() => {
    document.title = "AS Denim | Dashboard - Kategori";
    fetchCategories();
  }, []);

  // State untuk kategori, awalnya kosong
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  const { authFetch } = useContext(AppContext);

  // Mengambil data kategori menggunakan fetch
  const fetchCategories = async () => {
    try {
      const response = await authFetch("http://127.0.0.1:8000/api/admin/category");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCategories(data);
      setLoadingCategories(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoadingCategories(false);
      setErrorCategories(error);
    }
  };

  // State untuk mendeteksi tampilan mobile secara dinamis
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State untuk filter
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const filteredCategories = categories.filter((item) =>
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

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // Tambahkan kolom "No" di awal
  const columns = [
    {
      name: "No",
      cell: (row, index) => <div>{index + 1}</div>,
      width: "60px",
      center: true,
    },
    {
      name: "Nama Kategori",
      selector: (row) => row.category_name,
      sortable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: "Slug",
      selector: (row) => row.slug,
      sortable: true,
      omit: isMobile, // Sembunyikan kolom ini pada layar kecil
    },
    {
      name: "Gambar",
      selector: (row) => row.image,
      cell: (row) => (
        <div className="p-2 bg-gray-100 rounded-lg">
          <img
            src={`http://127.0.0.1:8000/storage/${row.image}`}
            alt={row.category_name}
            className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform"
          />
        </div>
      ),
      center: true,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Kategori Produk
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <FaPlus className="mr-2 text-lg" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        {loadingCategories ? (
          <p className="text-center text-gray-500">Memuat kategori...</p>
        ) : errorCategories ? (
          <p className="text-center text-red-500">
            Terjadi kesalahan saat mengambil kategori.
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
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
                Tidak ada data kategori
              </div>
            }
          />
        )}
      </div>

      {/* Modal CRUD */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        setCategories={setCategories}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        category={selectedCategory}
        setCategories={setCategories}
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
        setCategories={setCategories}
      />
    </div>
  );
};

export default Category;
