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

const StatusBadge = ({ status }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-slate-100 text-slate-800";
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-800",
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
StatusBadge.propTypes = { status: PropTypes.string };

const Payment = () => {
  const { authFetch } = useContext(AppContext);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    setFetchError(null);
    try {
      const responseData = await getPayments(authFetch);
      setPayments(responseData.data || []);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data pembayaran.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingPayments(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Pembayaran";
    fetchPayments();
  }, [fetchPayments]);

  const openDetailModal = (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  // --- INI BAGIAN YANG DIPERBAIKI ---
  const closeDetailModal = () => {
    setSelectedPayment(null);
    setIsDetailModalOpen(false); // Pastikan state diubah menjadi false
  };

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const filter = filterText.toLowerCase();
        return (
          payment.order?.order_number?.toLowerCase().includes(filter) ||
          payment.order?.user?.name?.toLowerCase().includes(filter) ||
          payment.transaction_id?.toLowerCase().includes(filter) ||
          payment.status?.replace(/_/g, " ").includes(filter) ||
          payment.payment_type?.replace(/_/g, " ").includes(filter)
        );
      }),
    [payments, filterText]
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
        selector: (row) => row.order?.order_number ?? "N/A",
        sortable: true,
        wrap: true,
        minWidth: "160px",
      },
      {
        name: "Pelanggan",
        selector: (row) => row.order?.user?.name ?? "N/A",
        sortable: true,
        wrap: true,
        minWidth: "180px",
      },
      {
        name: "Tgl Bayar",
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
        name: "Jumlah",
        selector: (row) => row.amount,
        cell: (row) => <FormattedPrice value={row.amount} />,
        sortable: true,
        right: true,
        minWidth: "140px",
      },
      {
        name: "Metode",
        selector: (row) => row.payment_type?.replace(/_/g, " ") || "N/A",
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} />,
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
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Lihat Detail Pembayaran"
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
      <h1 className="text-3xl font-bold text-slate-800">
        Manajemen Pembayaran
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingPayments ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data pembayaran...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
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
