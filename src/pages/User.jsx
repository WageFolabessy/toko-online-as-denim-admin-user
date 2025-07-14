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

  const fetchUsers = useCallback(async () => {
    setLoadingUser(true);
    setFetchError(null);
    try {
      const responseData = await getSiteUsers(authFetch);
      setUsers(responseData.data || []);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data pengguna.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingUser(false);
    }
  }, [authFetch]);

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
      const action = currentStatus ? "menonaktifkan" : "mengaktifkan";
      if (!window.confirm(`Apakah Anda yakin ingin ${action} pengguna ini?`))
        return;

      try {
        const result = await updateSiteUserStatus(
          authFetch,
          userId,
          !currentStatus
        );
        toast.success(result.message || "Status akun berhasil diperbarui.");
        fetchUsers();
      } catch (error) {
        toast.error(error.message || "Gagal mengupdate status pengguna.");
      }
    },
    [authFetch, fetchUsers]
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
        name: "Tgl Daftar",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        sortable: true,
        minWidth: "140px",
      },
      {
        name: "Status",
        selector: (row) => row.is_active,
        cell: (row) => <StatusBadge isActive={row.is_active} />,
        sortable: true,
        center: true,
        minWidth: "120px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100"
              title="Lihat Detail"
            >
              <FaEye className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleUserStatus(row.id, row.is_active)}
              className={`rounded-md p-2 transition-colors ${
                row.is_active
                  ? "text-red-600 hover:bg-red-100"
                  : "text-green-600 hover:bg-green-100"
              }`}
              title={
                row.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"
              }
            >
              {row.is_active ? (
                <FaBan className="h-5 w-5" />
              ) : (
                <FaCheck className="h-5 w-5" />
              )}
            </button>
          </div>
        ),
        center: true,
        minWidth: "100px",
      },
    ],
    [toggleUserStatus]
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
      <h1 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingUser ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data pengguna...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
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
