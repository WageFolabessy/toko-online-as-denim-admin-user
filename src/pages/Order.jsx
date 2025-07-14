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
  let colorClass = "bg-slate-100 text-slate-800";
  const colors = {
    order: {
      cancelled: "bg-red-100 text-red-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      processed: "bg-purple-100 text-purple-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-slate-100 text-slate-800",
    },
    payment: {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      settlement: "bg-green-100 text-green-800",
      expired: "bg-slate-100 text-slate-800",
      failed: "bg-red-100 text-red-800",
    },
    shipment: {
      pending: "bg-blue-100 text-blue-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
    },
  };
  colorClass = colors[type]?.[status] || colorClass;
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

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setFetchError(null);
    try {
      const responseData = await getOrders(authFetch);
      setOrders(responseData.data || []);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data pesanan.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingOrders(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Pesanan";
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateSuccess = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => setIsDetailModalOpen(false);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const filter = filterText.toLowerCase();
        return (
          order.order_number?.toLowerCase().includes(filter) ||
          order.user?.name?.toLowerCase().includes(filter) ||
          order.user?.email?.toLowerCase().includes(filter) ||
          order.payment_status?.replace(/_/g, " ").includes(filter) ||
          order.shipment_status?.replace(/_/g, " ").includes(filter) ||
          order.status?.replace(/_/g, " ").includes(filter)
        );
      }),
    [orders, filterText]
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
        name: "No. Pesanan",
        selector: (row) => row.order_number,
        sortable: true,
        wrap: true,
        minWidth: "160px",
      },
      {
        name: "Pelanggan",
        selector: (row) => row.user?.name ?? "N/A",
        sortable: true,
        wrap: true,
        minWidth: "180px",
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
          }),
        sortable: true,
        minWidth: "150px",
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
        minWidth: "130px",
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
        name: "Status",
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
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Lihat Detail & Update Status"
            >
              <FaEye className="h-5 w-5" />
            </button>
          </div>
        ),
        center: true,
        minWidth: "80px",
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
        highlightOnHoverStyle: {
          backgroundColor: "#f8fafc",
          borderBottomColor: "#f1f5f9",
        },
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
        style: {
          fontSize: "0.875rem",
          color: "#334155",
          padding: "1rem",
          lineHeight: "1.5",
        },
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
      <h1 className="text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingOrders ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data pesanan...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
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
