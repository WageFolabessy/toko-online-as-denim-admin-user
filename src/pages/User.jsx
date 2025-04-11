import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye, FaBan, FaCheck } from "react-icons/fa";
import PropTypes from "prop-types";
import UserDetailModal from "../components/User/UserDetailModal";
import FilterComponent from "../components/User/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getSiteUsers, updateSiteUserStatus } from "../services/siteUserApi";

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Non-Aktif
    </span>
  );
StatusBadge.propTypes = { isActive: PropTypes.bool };

const User = () => {
  const { authFetch } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  // State untuk pagination (jika diperlukan penanganan manual)
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalRows, setTotalRows] = useState(0);
  // const [perPage, setPerPage] = useState(10);

  const fetchUsers = useCallback(
    async (/* page = 1, limit = 10, search = '' */) => {
      setLoadingUser(true);
      setFetchError(null);
      try {
        const responseData = await getSiteUsers(authFetch);
        setUsers(responseData.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        const errorMessage = error.message || "Gagal memuat data pengguna.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        setUsers([]);
      } finally {
        setLoadingUser(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    document.title = "Manajemen Pengguna";
    fetchUsers();
  }, [fetchUsers]);

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  };

  const toggleUserStatus = useCallback(
    async (userId, currentStatus) => {
      const confirmationText = currentStatus
        ? "Apakah Anda yakin ingin menonaktifkan pengguna ini?"
        : "Apakah Anda yakin ingin mengaktifkan pengguna ini?";

      if (!window.confirm(confirmationText)) return;

      const targetUserIndex = users.findIndex((user) => user.id === userId);
      if (targetUserIndex === -1) return;

      try {
        const newStatus = !currentStatus;
        const result = await updateSiteUserStatus(authFetch, userId, newStatus);
        toast.success(result.message || "Status akun berhasil diperbarui.");
        fetchUsers();
      } catch (error) {
        console.error("Error updating user status:", error);
        toast.error(error.message || "Gagal mengupdate status pengguna.");
      }
    },
    [authFetch, fetchUsers, users /*, currentPage, perPage, filterText */]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(filterText.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [users, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    const handleFilterChange = (e) => {
      const newFilterText = e.target.value;
      setFilterText(newFilterText);
    };

    return (
      <FilterComponent
        onFilter={handleFilterChange}
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
        name: "Tgl Daftar",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        sortable: true,
        minWidth: "130px",
      },
      {
        name: "Status",
        selector: (row) => row.is_active,
        cell: (row) => <StatusBadge isActive={row.is_active} />,
        sortable: true,
        center: true,
        minWidth: "100px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Lihat Detail"
              aria-label={`Lihat detail ${row.name}`}
            >
              <FaEye className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => toggleUserStatus(row.id, row.is_active)}
              className={`rounded p-1.5 transition-colors ${
                row.is_active
                  ? "text-red-500 hover:bg-red-100 focus:ring-red-500"
                  : "text-blue-500 hover:bg-blue-100 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 `}
              title={
                row.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"
              }
              aria-label={
                row.is_active
                  ? `Nonaktifkan ${row.name}`
                  : `Aktifkan ${row.name}`
              }
            >
              {row.is_active ? (
                <FaBan className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <FaCheck className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        center: true,
        minWidth: "100px",
      },
    ],
    [toggleUserStatus]
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Manajemen Pengguna Situs
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingUser ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data pengguna...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers} // Gunakan data yang sudah difilter di client-side
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            // Progress & Pagination server-side (jika diperlukan)
            // progressPending={loadingUser}
            // paginationServer
            // paginationTotalRows={totalRows}
            // onChangeRowsPerPage={handlePerRowsChange}
            // onChangePage={handlePageChange}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-10 text-center text-gray-500">
                Tidak ada data pengguna ditemukan.
              </div>
            }
          />
        )}
      </div>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
      />
    </div>
  );
};

export default User;
