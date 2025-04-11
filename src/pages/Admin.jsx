import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import AddAdminModal from "../components/Admin/AddAdminModal";
import EditAdminModal from "../components/Admin/EditAdminModal";
import ViewAdminModal from "../components/Admin/ViewAdminModal";
import DeleteAdminModal from "../components/Admin/DeleteAdminModal";
import FilterComponent from "../components/Admin/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getAdmins } from "../services/adminApi";

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const { authFetch } = useContext(AppContext);

  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const adminsData = await getAdmins(authFetch);
      setAdmins(adminsData);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error(error.message || "Gagal memuat data admin.");
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Admin";
    fetchAdmins();
  }, [fetchAdmins]);

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

  const handleSuccess = () => {
    fetchAdmins();
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name &&
        admin.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (admin.email &&
        admin.email.toLowerCase().includes(filterText.toLowerCase()))
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
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <button
              onClick={() => openViewModal(row)}
              className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100"
              title="Lihat Detail"
              aria-label={`Lihat detail ${row.name}`}
            >
              <FaEye className="text-base md:text-lg" />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
              title="Edit"
              aria-label={`Edit ${row.name}`}
            >
              <FaEdit className="text-base md:text-lg" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100"
              title="Hapus"
              aria-label={`Hapus ${row.name}`}
            >
              <FaTrash className="text-base md:text-lg" />
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
        style: { backgroundColor: "#f3f4f6", borderBottomWidth: "1px" },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          padding: "0.75rem 1rem",
          color: "#374151",
          textTransform: "uppercase",
        },
      },
      cells: {
        style: {
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          color: "#1f2937",
          borderBottom: "1px solid #f3f4f6",
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
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8 ">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Manajemen Admin
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="mr-2 h-4 w-4" /> Tambah Admin
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingAdmins ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data admin...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAdmins}
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
                Tidak ada data admin ditemukan.
              </div>
            }
          />
        )}
      </div>

      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleSuccess}
      />
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        admin={selectedAdmin}
        onSuccess={handleSuccess}
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
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Admin;
