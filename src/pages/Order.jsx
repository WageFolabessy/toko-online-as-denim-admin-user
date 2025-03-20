import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import OrderDetailModal from "../components/Order/OrderDetailModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

// Komponen Filter (pencarian dan reset)
const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
    <input
      id="search"
      type="text"
      placeholder="Cari Pesanan..."
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

const Order = () => {
  useEffect(() => {
    document.title = "AS Denim | Dashboard - Pesanan";
  }, []);

  // State untuk data pesanan
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  const { authFetch } = useContext(AppContext);

  // Ambil data pesanan dari API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authFetch(
          "http://127.0.0.1:8000/api/admin/orders",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setErrorOrders(error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [authFetch]);

  // Modal detail pesanan
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  // Fungsi untuk mengupdate status pesanan menggunakan fetch
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      // Parsing respons JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui status pesanan.");
      }

      // Perbarui state orders hanya untuk properti status saja agar properti lain tidak hilang
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Tampilkan toast dengan pesan dari API
      toast.success(data.message);
    } catch (error) {
      console.error("Gagal memperbarui status pesanan:", error);
      alert("Terjadi kesalahan saat memperbarui status pesanan.");
    }
  };

  // State untuk pencarian
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Filter data pesanan berdasarkan nomor pesanan atau nama pelanggan
  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(filterText.toLowerCase()) ||
      order.user_name.toLowerCase().includes(filterText.toLowerCase())
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
      name: "No. Pesanan",
      selector: (row) => row.order_number,
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "Nama Pelanggan",
      selector: (row) => row.user.name,
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "Tanggal Pesan",
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
      name: "Total",
      cell: (row) => <div>Rp {row.total_amount.toLocaleString("id-ID")}</div>,
      sortable: true,
      wrap: true,
      minWidth: "120px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <span className="capitalize">{row.status}</span>,
      wrap: true,
      minWidth: "100px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => openDetailModal(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="text-lg" />
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesanan</h1>
      {loadingOrders ? (
        <p className="text-center text-gray-500">Memuat pesanan...</p>
      ) : errorOrders ? (
        <p className="text-center text-red-500">
          Terjadi kesalahan saat mengambil pesanan.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredOrders}
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
            noDataComponent={
              <div className="p-4 text-center text-gray-500">
                Tidak ada pesanan.
              </div>
            }
          />
        </div>
      )}

      {/* Modal Detail Pesanan */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        order={selectedOrder}
        updateOrderStatus={updateOrderStatus}
      />
    </div>
  );
};

export default Order;
