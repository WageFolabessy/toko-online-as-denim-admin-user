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

  const handleSuccess = () => fetchAdmins();

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const openViewModal = (admin) => {
    setSelectedAdmin(admin);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

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
      },
      {
        name: "Nama",
        selector: (row) => row.name,
        sortable: true,
        minWidth: "200px",
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        minWidth: "250px",
      },
      {
        name: "Tanggal Dibuat",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        sortable: true,
        minWidth: "150px",
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
              <FaEye className="h-5 w-5" />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-100"
              title="Edit"
            >
              <FaEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-100"
              title="Hapus"
            >
              <FaTrash className="h-5 w-5" />
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
          minHeight: "60px",
          "&:not(:last-of-type)": { borderBottom: "1px solid #f1f5f9" },
        },
        highlightOnHoverStyle: { backgroundColor: "#f8fafc" },
      },
      headRow: {
        style: {
          backgroundColor: "#f8fafc",
          minHeight: "56px",
          borderBottom: "1px solid #e2e8f0",
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#475569",
          textTransform: "uppercase",
          padding: "1rem",
        },
      },
      cells: {
        style: { fontSize: "0.875rem", color: "#334155", padding: "1rem" },
      },
      pagination: { style: { borderTop: "1px solid #e2e8f0" } },
      subHeader: { style: { padding: "1rem" } },
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Admin</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <FaPlus /> Tambah Admin
        </button>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingAdmins ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data admin...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAdmins}
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
