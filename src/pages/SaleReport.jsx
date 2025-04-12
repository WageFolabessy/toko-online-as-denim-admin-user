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
import { FaFilePdf, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterComponent from "../components/Report/FilterComponent";
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
  let colorClass = "bg-gray-100 text-gray-800";
  const orderColors = {
    cancelled: "bg-red-100 text-red-800",
    awaiting_payment: "bg-yellow-100 text-yellow-800",
    pending: "bg-blue-100 text-blue-800",
    processed: "bg-purple-100 text-purple-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-gray-100 text-gray-800",
  };
  const paymentColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800",
    success: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    failure: "bg-red-100 text-red-800",
    expire: "bg-gray-100 text-gray-800",
    expired: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const shipmentColors = {
    pending: "bg-blue-100 text-blue-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
  };

  if (type === "order") colorClass = orderColors[status] || colorClass;
  else if (type === "payment") colorClass = paymentColors[status] || colorClass;
  else if (type === "shipment")
    colorClass = shipmentColors[status] || colorClass;

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
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const searchTimeoutRef = useRef(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const fetchReportData = useCallback(
    async (paramsToFetch = {}) => {
      setLoading(true);
      setFetchError(null);

      const finalParams = {
        page: paramsToFetch.page || 1,
        per_page: paramsToFetch.per_page || paginationInfo.perPage,
        start_date: paramsToFetch.start_date ?? filterParams.start_date,
        end_date: paramsToFetch.end_date ?? filterParams.end_date,
        search: paramsToFetch.search ?? filterParams.search,
        status: paramsToFetch.status ?? filterParams.status,
      };

      Object.keys(finalParams).forEach(
        (key) =>
          (finalParams[key] === "" ||
            finalParams[key] === null ||
            finalParams[key] === undefined) &&
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
        console.error("Error fetching sales report:", error);
        const errorMessage = error.message || "Gagal memuat laporan penjualan.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        setOrders([]);
        setReportSummary(null);
        setPaginationInfo({ currentPage: 1, perPage: 10, totalRows: 0 });
      } finally {
        setLoading(false);
      }
    },
    [authFetch, paginationInfo.perPage]
  );

  useEffect(() => {
    document.title = "Laporan Penjualan";
    fetchReportData({ page: 1 });
  }, []);

  const handleDateChange = (e) => {
    setFilterParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== filterParams.search) {
        setFilterParams((prev) => ({ ...prev, search: searchInput }));
        setPaginationInfo((prev) => ({ ...prev, currentPage: 1 }));
        setResetPaginationToggle((prev) => !prev);
        fetchReportData({ page: 1, search: searchInput });
      }
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, fetchReportData]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPaginationInfo((prev) => ({ ...prev, currentPage: 1 }));
    setResetPaginationToggle((prev) => !prev);
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
    setPaginationInfo((prev) => ({ ...prev, currentPage: 1 }));
    setResetPaginationToggle((prev) => !prev);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchReportData({ page: 1, ...initialFilters });
  };

  const handlePageChange = (page) => {
    setPaginationInfo((prev) => ({ ...prev, currentPage: page }));
    fetchReportData({ page: page });
  };
  const handlePerRowsChange = async (newPerPage, page) => {
    setPaginationInfo((prev) => ({
      ...prev,
      perPage: newPerPage,
      currentPage: 1,
    }));
    setResetPaginationToggle((prev) => !prev);
    fetchReportData({ page: 1, per_page: newPerPage });
  };

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) =>
          (paginationInfo.currentPage - 1) * paginationInfo.perPage + index + 1,
        width: "60px",
        center: true,
        sortable: false,
      },
      {
        name: "No. Pesanan",
        selector: (row) => row.order_number,
        sortable: false,
        minWidth: "150px",
      },
      {
        name: "Tanggal",
        selector: (row) => row.created_at,
        cell: (row) => formatDateTime(row.created_at),
        sortable: true,
        minWidth: "170px",
      },
      {
        name: "Pelanggan",
        selector: (row) => row.user?.name ?? "N/A",
        sortable: false,
        minWidth: "150px",
      },
      {
        name: "Status Pesanan",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} type="order" />,
        sortable: true,
        center: true,
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
        name: "Total",
        selector: (row) => row.total_amount,
        cell: (row) => <FormattedPrice value={row.total_amount} />,
        sortable: true,
        right: true,
        minWidth: "140px",
      },
    ],
    [paginationInfo.currentPage, paginationInfo.perPage]
  );

  // --- Download PDF ---
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const marginLeft = 40;
    const marginTop = 40;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Laporan Penjualan - AS Denim", marginLeft, marginTop);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let startY = marginTop + 20;
    if (reportSummary) {
      doc.text(
        `Periode: ${reportSummary.start_date} s/d ${reportSummary.end_date}`,
        marginLeft,
        startY
      );
      startY += 15;
      doc.text(
        `Total Pesanan: ${reportSummary.total_orders}`,
        marginLeft,
        startY
      );
      startY += 15;
      doc.text(
        `Total Penjualan: ${reportSummary.formatted_total_sales}`,
        marginLeft,
        startY
      );
      startY += 20;
    } else if (filterParams.start_date || filterParams.end_date) {
      doc.text(
        `Periode Filter: ${filterParams.start_date || "Semua"} s/d ${
          filterParams.end_date || "Semua"
        }`,
        marginLeft,
        startY
      );
      startY += 20;
    }
    doc.setLineWidth(0.5);
    doc.line(
      marginLeft,
      startY,
      doc.internal.pageSize.getWidth() - marginLeft,
      startY
    );
    startY += 15;
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
      order.status?.replace(/_/g, " ").toUpperCase() || "N/A",
      order.payment_status?.replace(/_/g, " ").toUpperCase() || "N/A",
      order.shipment_status?.replace(/_/g, " ").toUpperCase() || "N/A",
      `Rp ${Number(order.total_amount || 0).toLocaleString("id-ID")}`,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: "grid",
      headStyles: {
        fillColor: [30, 144, 255],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 8, cellPadding: 4, halign: "left" },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        7: { halign: "right" },
      },
      margin: { left: marginLeft, right: marginLeft },
    });
    const pdfTitle = `laporan-penjualan-${
      filterParams.start_date || "semua"
    }-sd-${filterParams.end_date || "semua"}.pdf`;
    doc.save(pdfTitle);
  };

  const customStyles = useMemo(
    () => ({
      table: {
        style: {
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        },
      },
      header: { style: { display: "none" } },
      subHeader: { style: { padding: "0", backgroundColor: "transparent" } },
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
          alignItems: "center",
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
        Laporan Penjualan
      </h1>

      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <form onSubmit={handleFilterSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:items-end">
            <div>
              <label
                htmlFor="start_date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={filterParams.start_date}
                onChange={handleDateChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="end_date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Tanggal Selesai
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={filterParams.end_date}
                onChange={handleDateChange}
                min={filterParams.start_date || undefined}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>
            <div className="flex items-end gap-2 pt-5 md:pt-0 lg:col-span-2 xl:col-span-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Filter Tanggal
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                title="Reset Semua Filter"
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {!loading && !fetchError && reportSummary && (
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow sm:p-5">
            <dt className="truncate text-sm font-medium text-gray-500">
              Periode Laporan
            </dt>
            <dd className="mt-1 text-base font-semibold tracking-tight text-gray-900">
              {reportSummary.start_date} s/d {reportSummary.end_date}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow sm:p-5">
            <dt className="truncate text-sm font-medium text-gray-500">
              Total Pesanan
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
              {reportSummary.total_orders}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">
              Total Penjualan
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
              {reportSummary.formatted_total_sales}
            </dd>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center p-10 text-gray-500">
            <FaSpinner className="animate-spin mr-3 text-xl" /> Memuat
            laporan...
          </div>
        ) : fetchError ? (
          <div className="rounded-md bg-red-50 p-4 m-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Gagal Memuat Data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{fetchError}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchReportData({ page: 1 })}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            pagination
            paginationServer
            paginationTotalRows={paginationInfo.totalRows}
            paginationDefaultPage={paginationInfo.currentPage}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationPerPage={paginationInfo.perPage}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            progressPending={loading}
            subHeader
            subHeaderComponent={
              <div className="flex w-full flex-col items-center justify-between gap-2 py-2 px-1 sm:flex-row">
                <FilterComponent
                  filterText={searchInput}
                  onFilter={handleSearchInputChange}
                  onClear={handleClearFilters}
                />
                <button
                  onClick={downloadPDF}
                  disabled={loading || orders.length === 0}
                  className="inline-flex w-full flex-shrink-0 items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 sm:w-auto"
                >
                  <FaFilePdf className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  Download PDF
                </button>
              </div>
            }
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-10 text-center text-gray-500">
                Tidak ada data laporan ditemukan untuk filter ini.
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default SalesReport;
