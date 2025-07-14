import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import PropTypes from "prop-types";
import ShipmentDetailModal from "../components/Shipment/ShipmentDetailModal";
import FilterComponent from "../components/Shipment/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getShipments } from "../services/shipmentApi";

const StatusBadge = ({ status }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-slate-100 text-slate-800";
  const colors = {
    pending: "bg-blue-100 text-blue-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
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

const Shipment = () => {
  const { authFetch } = useContext(AppContext);
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoadingShipments(true);
    setFetchError(null);
    try {
      const responseData = await getShipments(authFetch);
      setShipments(responseData.data || []);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data pengiriman.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingShipments(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Pengiriman";
    fetchShipments();
  }, [fetchShipments]);

  const handleUpdateSuccess = useCallback(() => {
    fetchShipments();
  }, [fetchShipments]);

  const openDetailModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  };

  const filteredShipments = useMemo(
    () =>
      shipments.filter((shipment) => {
        const filter = filterText.toLowerCase();
        return (
          shipment.order?.order_number?.toLowerCase().includes(filter) ||
          shipment.order?.user_name?.toLowerCase().includes(filter) ||
          shipment.tracking_number?.toLowerCase().includes(filter) ||
          shipment.courier?.toLowerCase().includes(filter) ||
          shipment.status?.toLowerCase().includes(filter)
        );
      }),
    [shipments, filterText]
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
        selector: (row) => row.order?.user_name ?? "N/A",
        sortable: true,
        wrap: true,
        minWidth: "180px",
      },
      {
        name: "Tgl Input",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        sortable: true,
        minWidth: "130px",
      },
      {
        name: "Kurir",
        selector: (row) => row.courier ?? "-",
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "Layanan",
        selector: (row) => row.service ?? "-",
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "No. Resi",
        selector: (row) => row.tracking_number,
        cell: (row) => row.tracking_number || "-",
        sortable: true,
        minWidth: "180px",
        wrap: true,
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
              title="Lihat Detail & Update Resi/Status"
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
        Manajemen Pengiriman
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingShipments ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data pengiriman...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredShipments}
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
                Tidak ada data pengiriman ditemukan.
              </div>
            }
          />
        )}
      </div>

      <ShipmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        shipmentId={selectedShipment?.id}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default Shipment;
