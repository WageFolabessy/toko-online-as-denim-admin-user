import {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppContext } from "../context/AppContext";
import { getSalesReport } from "../services/reportApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};
FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const StatusBadge = ({ status, type }) => {
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
  if (type) colorClass = colors[type]?.[status] || colorClass;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string, type: PropTypes.string };

const SalesReport = () => {
  const { authFetch } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [reportSummary, setReportSummary] = useState(null);
  const [filterParams, setFilterParams] = useState({
    start_date: "",
    end_date: "",
    search: "",
    status: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    perPage: 10,
    totalRows: 0,
  });
  const searchTimeoutRef = useRef(null);

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const fetchReportData = useCallback(
    async (paramsToFetch = {}) => {
      setLoading(true);
      setFetchError(null);
      const finalParams = {
        page: paramsToFetch.page || 1,
        per_page: paramsToFetch.per_page || 10,
        start_date: paramsToFetch.start_date ?? filterParams.start_date,
        end_date: paramsToFetch.end_date ?? filterParams.end_date,
        search: paramsToFetch.search ?? filterParams.search,
        status: paramsToFetch.status ?? filterParams.status,
      };
      Object.keys(finalParams).forEach(
        (key) =>
          (finalParams[key] === "" || finalParams[key] === null) &&
          delete finalParams[key]
      );

      try {
        const responseData = await getSalesReport(authFetch, finalParams);
        setOrders(responseData.data || []);
        setPaginationInfo({
          currentPage: responseData.meta?.current_page || 1,
          totalRows: responseData.meta?.total || 0,
          perPage: responseData.meta?.per_page || 10,
        });
        setReportSummary(responseData.meta?.report_summary || null);
      } catch (error) {
        const errorMessage = error.message || "Gagal memuat laporan penjualan.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authFetch, filterParams]
  );

  useEffect(() => {
    document.title = "Laporan Penjualan";
    fetchReportData({ page: 1 });
  }, [fetchReportData]);

  const handleFilterChange = (e) =>
    setFilterParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearchInputChange = (e) => setSearchInput(e.target.value);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== filterParams.search) {
        setFilterParams((prev) => ({ ...prev, search: searchInput }));
        fetchReportData({ page: 1, search: searchInput });
      }
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchInput, filterParams.search, fetchReportData]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData({ page: 1, ...filterParams });
  };

  const handleClearFilters = () => {
    const initialFilters = {
      start_date: "",
      end_date: "",
      search: "",
      status: "",
    };
    setFilterParams(initialFilters);
    setSearchInput("");
    fetchReportData({ page: 1, ...initialFilters });
  };

  const handlePageChange = (page) => fetchReportData({ page, ...filterParams });
  const handlePerRowsChange = (newPerPage, page) =>
    fetchReportData({ page: 1, per_page: newPerPage, ...filterParams });

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Laporan Penjualan", 40, 40);
    if (reportSummary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Periode: ${reportSummary.start_date} s/d ${reportSummary.end_date}`,
        40,
        60
      );
      doc.text(`Total Pesanan: ${reportSummary.total_orders}`, 40, 75);
      doc.text(
        `Total Penjualan: ${reportSummary.formatted_total_sales}`,
        40,
        90
      );
    }
    const tableColumn = [
      "No",
      "No. Order",
      "Tanggal",
      "Pelanggan",
      "Status",
      "Pembayaran",
      "Pengiriman",
      "Total",
    ];
    const tableRows = orders.map((order, index) => [
      (paginationInfo.currentPage - 1) * paginationInfo.perPage + index + 1,
      order.order_number,
      formatDateTime(order.created_at),
      order.user?.name ?? "N/A",
      order.status?.replace(/_/g, " ").toUpperCase(),
      order.payment_status?.replace(/_/g, " ").toUpperCase(),
      order.shipment_status?.replace(/_/g, " ").toUpperCase(),
      `Rp ${Number(order.total_amount || 0).toLocaleString("id-ID")}`,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        7: { halign: "right" },
      },
    });
    doc.save(
      `laporan-penjualan-${reportSummary?.start_date || "semua"}-sd-${
        reportSummary?.end_date || "semua"
      }.pdf`
    );
  };

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) =>
          (paginationInfo.currentPage - 1) * paginationInfo.perPage + index + 1,
        width: "60px",
        center: true,
      },
      {
        name: "No. Pesanan",
        selector: (row) => row.order_number,
        minWidth: "150px",
      },
      {
        name: "Tanggal",
        cell: (row) => formatDateTime(row.created_at),
        sortable: true,
        minWidth: "170px",
      },
      {
        name: "Pelanggan",
        selector: (row) => row.user?.name ?? "N/A",
        minWidth: "150px",
      },
      {
        name: "Status",
        cell: (row) => <StatusBadge status={row.status} type="order" />,
        center: true,
        minWidth: "140px",
      },
      {
        name: "Pembayaran",
        cell: (row) => (
          <StatusBadge status={row.payment_status} type="payment" />
        ),
        center: true,
        minWidth: "120px",
      },
      {
        name: "Pengiriman",
        cell: (row) => (
          <StatusBadge status={row.shipment_status} type="shipment" />
        ),
        center: true,
        minWidth: "120px",
      },
      {
        name: "Total",
        cell: (row) => <FormattedPrice value={row.total_amount} />,
        sortable: true,
        right: true,
        minWidth: "140px",
      },
    ],
    [paginationInfo.currentPage, paginationInfo.perPage]
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
    }),
    []
  );

  return (
    <div className="space-y-6 mt-4">
      <h1 className="text-3xl font-bold text-slate-800">Laporan Penjualan</h1>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={filterParams.start_date}
              onChange={handleFilterChange}
              className="w-full rounded-md px-3 py-2 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Tanggal Selesai
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={filterParams.end_date}
              onChange={handleFilterChange}
              min={filterParams.start_date || undefined}
              className="w-full rounded-md px-3 py-2 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Status Pesanan
            </label>
            <select
              id="status"
              name="status"
              value={filterParams.status}
              onChange={handleFilterChange}
              className="w-full rounded-md px-3 py-2 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="delivered">Terkirim</option>
              <option value="shipped">Dikirim</option>
              <option value="processed">Diproses</option>
              <option value="pending">Tertunda</option>
              <option value="awaiting_payment">Menunggu Pembayaran</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {!loading && !fetchError && reportSummary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500">
              Periode
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {reportSummary.start_date} s/d {reportSummary.end_date}
            </dd>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500">
              Total Pesanan
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">
              {reportSummary.total_orders}
            </dd>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500">
              Total Penjualan
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">
              {reportSummary.formatted_total_sales}
            </dd>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Cari no. pesanan, pelanggan..."
            className="w-full md:w-1/3 rounded-md px-3 py-2 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={downloadPDF}
            disabled={loading || orders.length === 0}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
          >
            <FaFilePdf />
            Download PDF
          </button>
        </div>
        <DataTable
          columns={columns}
          data={orders}
          progressPending={loading}
          progressComponent={
            <div className="py-16">
              <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={paginationInfo.totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          paginationComponentOptions={{
            rowsPerPageText: "Baris per halaman:",
            rangeSeparatorText: "dari",
          }}
          customStyles={customStyles}
          noDataComponent={
            <div className="py-16 text-center text-slate-500">
              Tidak ada data ditemukan untuk filter ini.
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SalesReport;
