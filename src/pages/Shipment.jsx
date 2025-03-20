import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import ShipmentDetailModal from "../components/Shipment/ShipmentDetailModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

// Komponen Filter untuk pencarian dan reset
const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
    <input
      id="search"
      type="text"
      placeholder="Cari Pengiriman..."
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

const Shipment = () => {
  const { authFetch } = useContext(AppContext);
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [errorShipments, setErrorShipments] = useState(null);

  // Set judul halaman
  useEffect(() => {
    document.title = "AS Denim | Dashboard - Pengiriman";
  }, []);

  // Ambil data pengiriman dari backend
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await authFetch("http://127.0.0.1:8000/api/admin/shipments", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        // Ambil data dari key shipments
        setShipments(Array.isArray(data.shipments) ? data.shipments : []);
      } catch (error) {
        console.error("Error fetching shipments:", error);
        setErrorShipments(error);
      } finally {
        setLoadingShipments(false);
      }
    };

    fetchShipments();
  }, [authFetch]);

  // Modal detail pengiriman
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const openDetailModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  };

  // Fungsi untuk memperbarui data pengiriman melalui API
  const updateShipment = async (shipmentId, updatedData) => {
    try {
      const response = await authFetch(`http://127.0.0.1:8000/api/admin/shipments/${shipmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui pengiriman.");
      }
      // Perbarui state secara optimistik
      setShipments((prevShipments) =>
        prevShipments.map((shipment) =>
          shipment.id === shipmentId ? { ...shipment, ...updatedData } : shipment
        )
      );
      toast.success(data.message);
    } catch (error) {
      console.error("Gagal memperbarui pengiriman:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengiriman.");
    }
  };

  // State untuk filter pencarian
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Filter data pengiriman berdasarkan nomor pesanan atau nama pelanggan
  const filteredShipments = shipments.filter((shipment) =>
    ((shipment.order?.order_number || "").toLowerCase().includes(filterText.toLowerCase())) ||
    ((shipment.order?.user?.name || "").toLowerCase().includes(filterText.toLowerCase())) ||
    ((shipment.tracking_number || "").toLowerCase().includes(filterText.toLowerCase()))
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
      name: "No. Pesanan",
      selector: (row) => row.order?.order_number,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Nama Pelanggan",
      selector: (row) => row.order?.user?.name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Kurir",
      selector: (row) => row.courier,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Layanan",
      selector: (row) => row.service,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <span className="capitalize">{row.status}</span>,
      minWidth: "100px",
    },
    {
      name: "No. Resi",
      cell: (row) => <div>{row.tracking_number || "-"}</div>,
      minWidth: "120px",
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pengiriman</h1>
      {loadingShipments ? (
        <p className="text-center text-gray-500">Memuat pengiriman...</p>
      ) : errorShipments ? (
        <p className="text-center text-red-500">
          Terjadi kesalahan saat mengambil pengiriman.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredShipments}
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
                Tidak ada pengiriman.
              </div>
            }
          />
        </div>
      )}

      {/* Modal Detail Pengiriman */}
      <ShipmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        shipment={selectedShipment}
        updateShipment={updateShipment}
      />
    </div>
  );
};

export default Shipment;
