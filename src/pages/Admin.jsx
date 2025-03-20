import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import AddAdminModal from "../components/Admin/AddAdminModal";
import EditAdminModal from "../components/Admin/EditAdminModal";
import ViewAdminModal from "../components/Admin/ViewAdminModal";
import DeleteAdminModal from "../components/Admin/DeleteAdminModal";
import { AppContext } from "../context/AppContext";

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
    <input
      type="text"
      placeholder="Cari Admin..."
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

const Admin = () => {
  // Data admin, awalnya kosong (akan diisi dari API)
  const [admins, setAdmins] = useState([]);
  const { authFetch } = useContext(AppContext);

  // State modal dan data terpilih
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // State untuk filter pencarian
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    document.title = "AS Denim | Dashboard - Admin";

    // Panggil API untuk mengambil data admin
    authFetch("/api/admin/admin")
      .then((response) => response.json())
      .then((admins) => {
        setAdmins(admins);
        setLoadingAdmins(false);
      })
      .catch((error) => {
        console.error("Error fetching admin:", error);
        setLoadingAdmins(false);
      });
  });

  // Handler untuk membuka/menutup modal
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedAdmin(null);
    setIsEditModalOpen(false);
  };

  const openViewModal = (admin) => {
    setSelectedAdmin(admin);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedAdmin(null);
    setIsViewModalOpen(false);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedAdmin(null);
    setIsDeleteModalOpen(false);
  };

  // Filter data admin berdasarkan nama atau email
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(filterText.toLowerCase()) ||
      admin.email.toLowerCase().includes(filterText.toLowerCase())
  );

  // Sub header untuk DataTable (filter pencarian)
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

  // Kolom untuk DataTable
  const columns = [
    {
      name: "No",
      cell: (row, index) => <div>{index + 1}</div>,
      width: "60px",
      center: true,
    },
    {
      name: "Nama",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Tanggal Dibuat",
      selector: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      },
      sortable: true,
      wrap: true,
      minWidth: "150px",
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

  // Custom styles untuk DataTable
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
      {/* Header: judul dan tombol tambah admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Kelola Admin
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <FaPlus className="mr-2 text-lg" />
          Tambah Admin
        </button>
      </div>
      {/* Tabel DataTable */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        {loadingAdmins ? (
          <p className="text-center text-gray-500">Memuat Admin...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAdmins}
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
                Tidak ada data admin
              </div>
            }
          />
        )}
      </div>

      {/* Modals */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        setAdmins={setAdmins}
      />
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        admin={selectedAdmin}
        setAdmins={setAdmins}
      />
      <ViewAdminModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        admin={selectedAdmin}
      />
      <DeleteAdminModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        admin={selectedAdmin}
        setAdmins={setAdmins}
      />
    </div>
  );
};

export default Admin;
