import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import { AppContext } from "../context/AppContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Komponen filter untuk pencarian
const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
    <input
      id="search"
      type="text"
      placeholder="Cari Laporan..."
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

const SalesReport = () => {
  const { authFetch } = useContext(AppContext);
  const [salesReports, setSalesReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Fungsi untuk memformat tanggal ke format "01 Mar 2025, 11.07"
  const formatDateIndo = (dateStr) => {
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  // Fungsi untuk memformat angka ke dalam format mata uang Indonesia
  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Fungsi untuk mengambil data laporan penjualan dari backend menggunakan authFetch
  const fetchSalesReports = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/reports";
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await authFetch(url);
      const data = await response.json();
      if (data.success) {
        setSalesReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching sales reports:", error);
    }
    setLoading(false);
  };

  // Ambil data laporan penjualan saat komponen pertama kali dimuat
  useEffect(() => {
    fetchSalesReports();
  }, []);

  // Handler untuk pencarian
  const handleFilter = (e) => {
    setFilterText(e.target.value);
  };

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText("");
    }
  };

  // Filter data berdasarkan pencarian (misalnya berdasarkan nomor order atau nama produk)
  const filteredReports = salesReports.filter(
    (report) =>
      (report.order_number &&
        report.order_number.toLowerCase().includes(filterText.toLowerCase())) ||
      (report.product_name &&
        report.product_name.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "No",
      cell: (row, index) => <div>{index + 1}</div>,
      width: "60px",
      center: true,
    },
    {
      name: "No. Order",
      selector: (row) => row.order_number,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Tanggal",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => formatDateIndo(row.created_at),
      minWidth: "180px",
    },
    {
      name: "Total",
      selector: (row) => row.total_amount,
      sortable: true,
      cell: (row) => formatCurrency(row.total_amount),
      minWidth: "150px",
    },
    {
      name: "Produk",
      selector: (row) => row.product_name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Qty",
      selector: (row) => row.qty,
      sortable: true,
      center: true,
      width: "80px",
    },
    {
      name: "Harga",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => formatCurrency(row.price),
      minWidth: "150px",
    },
    {
      name: "Payment Status",
      selector: (row) => row.payment_status,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Tracking Number",
      selector: (row) => row.tracking_number,
      cell: (row) => row.tracking_number || "-",
      minWidth: "150px",
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f3f4f6",
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
  };

  // Fungsi untuk generate PDF menggunakan jsPDF dan AutoTable (tanpa capture tampilan)
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const marginLeft = 40;
    const marginTop = 40;

    // Tampilkan nama toko "AS Denim"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AS Denim", marginLeft, marginTop);

    // Judul laporan
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Laporan Penjualan", marginLeft, marginTop + 25);

    let startY = marginTop + 50;

    // Jika periode filter tersedia, tampilkan di bawah judul
    if (startDate && endDate) {
      const formattedStart = new Date(startDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedEnd = new Date(endDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      doc.setFontSize(12);
      doc.text(
        `Periode: ${formattedStart} s/d ${formattedEnd}`,
        marginLeft,
        startY
      );
      startY += 20;
    }

    // Gambar garis pemisah
    doc.setLineWidth(0.5);
    doc.line(
      marginLeft,
      startY,
      doc.internal.pageSize.getWidth() - marginLeft,
      startY
    );
    startY += 10;

    // Header tabel untuk PDF
    const tableColumn = [
      "No. Order",
      "Tanggal",
      "Total",
      "Produk",
      "Qty",
      "Harga",
      "Payment Status",
      "Tracking Number",
    ];

    // Data baris untuk tabel
    const tableRows = filteredReports.map((report) => [
      report.order_number,
      formatDateIndo(report.created_at),
      formatCurrency(report.total_amount),
      report.product_name,
      report.qty,
      formatCurrency(report.price),
      report.payment_status,
      report.tracking_number || "-",
    ]);

    // Buat tabel menggunakan autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: "grid",
      headStyles: { fillColor: [70, 130, 180] },
      styles: { fontSize: 8, cellPadding: 4 },
      margin: { left: marginLeft, right: marginLeft },
    });

    // Simpan file PDF
    doc.save("sales-report.pdf");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Laporan Penjualan</h1>

      {/* Form Filter Tanggal */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchSalesReports();
        }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div>
          <label className="block text-gray-700 mb-1">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Tanggal Selesai</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded self-end"
        >
          Filter
        </button>
      </form>

      <FilterComponent
        filterText={filterText}
        onFilter={handleFilter}
        onClear={handleClear}
      />

      {/* Tombol Download PDF */}
      <div className="mb-4">
        <button
          onClick={downloadPDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
        >
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <DataTable
          columns={columns}
          data={filteredReports}
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
          paginationResetDefaultPage={resetPaginationToggle}
          noDataComponent={
            <div className="p-4 text-center text-gray-500">
              Tidak ada laporan penjualan.
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SalesReport;
