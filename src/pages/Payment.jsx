import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import PropTypes from "prop-types";
import PaymentDetailModal from "../components/Payment/PaymentDetailModal";
import FilterComponent from "../components/Payment/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getPayments } from "../services/paymentApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};
FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const StatusBadge = ({ status, type = "payment" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-gray-100 text-gray-800";

  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800", // Alias
    completed: "bg-green-100 text-green-800", // Alias
    failed: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  colorClass = colors[status] || colorClass;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string, type: PropTypes.string };

const Payment = () => {
  const { authFetch } = useContext(AppContext);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchPayments = useCallback(
    async (/* page = 1, limit = 10, search = '' */) => {
      setLoadingPayments(true);
      setFetchError(null);
      try {
        const responseData = await getPayments(authFetch /*, params */);
        setPayments(responseData.data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
        const errorMessage = error.message || "Gagal memuat data pembayaran.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    document.title = "Manajemen Pembayaran";
    fetchPayments();
  }, [fetchPayments]);

  const openDetailModal = (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedPayment(null);
    setIsDetailModalOpen(false);
  };

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          (payment.order?.order_number &&
            payment.order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (payment.order?.user?.name &&
            payment.order.user.name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (payment.transaction_id &&
            payment.transaction_id
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (payment.status &&
            payment.status.toLowerCase().includes(filterText.toLowerCase())) ||
          (payment.payment_type &&
            payment.payment_type
              .toLowerCase()
              .includes(filterText.toLowerCase())) // Filter by payment type
      ),
    [payments, filterText]
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
        selector: (row) => row.order?.order_number ?? "N/A",
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Pelanggan",
        selector: (row) => row.order?.user?.name ?? "N/A",
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Tgl Pembayaran",
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
        name: "Jumlah",
        selector: (row) => row.amount,
        cell: (row) => <FormattedPrice value={row.amount} />,
        sortable: true,
        right: true,
        minWidth: "140px",
      },
      {
        name: "Metode",
        selector: (row) => row.payment_type,
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} type="payment" />,
        sortable: true,
        center: true,
        minWidth: "120px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded p-1.5 text-indigo-600 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Lihat Detail Pembayaran"
              aria-label={`Detail Pembayaran ${
                row.transaction_id || row.order?.order_number
              }`}
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
      // ... (customStyles tetap sama seperti sebelumnya) ...
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
        Manajemen Pembayaran
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingPayments ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data pembayaran...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            // Progress & Pagination server-side (opsional)
            // progressPending={loadingPayments}
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
                Tidak ada data pembayaran ditemukan.
              </div>
            }
          />
        )}
      </div>

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        paymentId={selectedPayment?.id}
      />
    </div>
  );
};

export default Payment;
