import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import PropTypes from "prop-types";
import OrderDetailModal from "../components/Order/OrderDetailModal";
import FilterComponent from "../components/Order/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getOrders } from "../services/orderApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};
FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const StatusBadge = ({ status, type = "order" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-gray-100 text-gray-800";

  if (type === "order") {
    const colors = {
      cancelled: "bg-red-100 text-red-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      processed: "bg-purple-100 text-purple-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-gray-100 text-gray-800",
    };
    colorClass = colors[status] || colorClass;
  } else if (type === "payment") {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      settlement: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    colorClass = colors[status] || colorClass;
  } else if (type === "shipment") {
    const colors = {
      pending: "bg-blue-100 text-blue-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
    };
    colorClass = colors[status] || colorClass;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};
StatusBadge.propTypes = {
  status: PropTypes.string,
  type: PropTypes.oneOf(["order", "payment", "shipment"]),
};

const Order = () => {
  const { authFetch } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchOrders = useCallback(
    async (/* page = 1, limit = 10, search = '' */) => {
      setLoadingOrders(true);
      setFetchError(null);
      try {
        const responseData = await getOrders(authFetch /*, params */);
        setOrders(responseData.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        const errorMessage = error.message || "Gagal memuat data pesanan.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    document.title = "Manajemen Pesanan";
    fetchOrders(); // Fetch halaman pertama
  }, [fetchOrders]);

  const handleUpdateSuccess = useCallback(() => {
    fetchOrders();
  }, [fetchOrders /*, currentPage, perPage, filterText */]);

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.order_number &&
            order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (order.user?.name &&
            order.user.name.toLowerCase().includes(filterText.toLowerCase())) ||
          (order.user?.email &&
            order.user.email
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (order.payment_status &&
            order.payment_status
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (order.shipment_status &&
            order.shipment_status
              .toLowerCase()
              .includes(filterText.toLowerCase()))
      ),
    [orders, filterText]
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
  }, [filterText, resetPaginationToggle /*, perPage */]);

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
        name: "No. Pesanan",
        selector: (row) => row.order_number,
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Pelanggan",
        selector: (row) => row.user?.name ?? "N/A",
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Tgl Pesan",
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
        minWidth: "130px",
      },
      {
        name: "Total",
        selector: (row) => row.total_amount,
        cell: (row) => <FormattedPrice value={row.total_amount} />,
        sortable: true,
        right: true,
        minWidth: "140px",
      },
      {
        name: "Pembayaran",
        selector: (row) => row.payment_status,
        cell: (row) => (
          <StatusBadge status={row.payment_status} type="payment" />
        ),
        sortable: true,
        center: true,
        minWidth: "120px",
      },
      {
        name: "Pengiriman",
        selector: (row) => row.shipment_status,
        cell: (row) => (
          <StatusBadge status={row.shipment_status} type="shipment" />
        ),
        sortable: true,
        center: true,
        minWidth: "120px",
      },
      {
        name: "Status Pesanan",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} type="order" />,
        sortable: true,
        center: true,
        minWidth: "150px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded p-1.5 text-indigo-600 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Lihat Detail & Update Status"
              aria-label={`Detail Pesanan ${row.order_number}`}
            >
              <FaEye className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        center: true,
        minWidth: "80px",
      },
    ],
    []
  ); // Dependensi kosong

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
        Manajemen Pesanan
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingOrders ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data pesanan...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            // Progress & Pagination server-side (opsional)
            // progressPending={loadingOrders}
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
                Tidak ada data pesanan ditemukan.
              </div>
            }
          />
        )}
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        orderId={selectedOrder?.id}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default Order;
