import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaEye, FaBan, FaCheck } from "react-icons/fa";
import UserDetailModal from "../components/User/UserDetailModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

// Komponen Filter untuk pencarian dan reset
const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
    <input
      type="text"
      placeholder="Cari Pengguna..."
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

const User = () => {
  const { authFetch } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    document.title = "AS Denim | Dashboard - Pengguna";
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authFetch("/api/admin/site_user", {
        method: "PUT", // Sesuaikan dengan metode dan endpoint Anda
      });
      if (!response.ok) {
        throw new Error("Gagal memuat data pengguna");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Terjadi kesalahan saat memuat data pengguna.");
    } finally {
      setLoadingUser(false);
    }
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  };

  const toggleUserStatus = async (userId) => {
    // Cari pengguna di state
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) return;

    // Tentukan status baru (toggle)
    const newStatus = !targetUser.is_active;

    try {
      const response = await authFetch(
        `/api/admin/update_siteuser_status/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({ is_active: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Gagal mengupdate status pengguna.");
        return;
      }

      const data = await response.json();

      // Perbarui state dengan status baru
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_active: newStatus } : user
        )
      );

      toast.success(data.message || "Status akun berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  // Filter data pengguna berdasarkan nama atau email
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filterText.toLowerCase()) ||
      user.email.toLowerCase().includes(filterText.toLowerCase())
  );

  // Sub Header untuk DataTable (filter pencarian)
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
      name: "Tanggal Daftar",
      selector: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // Menggunakan format 24 jam
        });
      },
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "Status",
      cell: (row) =>
        row.is_active ? (
          <span className="text-green-500 font-semibold">Aktif</span>
        ) : (
          <span className="text-red-500 font-semibold">Non-Aktif</span>
        ),
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => openDetailModal(row)}
            className="text-lg p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
          <button
            onClick={() => toggleUserStatus(row.id)}
            className={`mx-1 ${
              row.is_active
                ? "text-lg text-red-500 hover:text-red-600"
                : "text-lg text-blue-500 hover:text-blue-600"
            }`}
            title={row.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
          >
            {row.is_active ? <FaBan /> : <FaCheck />}
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
      minWidth: "100px",
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pengguna</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        {loadingUser ? (
          <div className="p-4 text-center text-gray-500">
            Memuat Pengguna...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50, 100]}
            paginationComponentOptions={{
              rowsPerPageText: "Baris per halaman:",
              rangeSeparatorText: "dari",
            }}
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            subHeader
            subHeaderComponent={subHeaderComponent}
            paginationResetDefaultPage={resetPaginationToggle}
            noDataComponent={
              <div className="p-4 text-center text-gray-500">
                Tidak ada data pengguna.
              </div>
            }
          />
        )}
      </div>

      {/* Modal Detail Pengguna */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
      />
    </div>
  );
};

export default User;
