import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import PropTypes from "prop-types";
import ShipmentDetailModal from "../components/Shipment/ShipmentDetailModal";
import FilterComponent from "../components/Shipment/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getShipments } from "../services/shipmentApi";

const StatusBadge = ({ status = "shipment" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-gray-100 text-gray-800";
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
StatusBadge.propTypes = { status: PropTypes.string, type: PropTypes.string };

const Shipment = () => {
  const { authFetch } = useContext(AppContext);
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchShipments = useCallback(
    async (/* page = 1, limit = 10, search = '' */) => {
      setLoadingShipments(true);
      setFetchError(null);
      try {
        const responseData = await getShipments(authFetch /*, params */);
        setShipments(responseData.data || []);
      } catch (error) {
        console.error("Error fetching shipments:", error);
        const errorMessage = error.message || "Gagal memuat data pengiriman.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        setShipments([]);
      } finally {
        setLoadingShipments(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    document.title = "Manajemen Pengiriman";
    fetchShipments();
  }, [fetchShipments]);

  const handleUpdateSuccess = useCallback(() => {
    fetchShipments(/* currentPage, perPage, filterText */);
  }, [fetchShipments /*, currentPage, perPage, filterText */]);

  const openDetailModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  };

  // Filter client-side
  const filteredShipments = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          (shipment.order?.order_number &&
            shipment.order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.order?.user?.name &&
            shipment.order.user.name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.tracking_number &&
            shipment.tracking_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.courier &&
            shipment.courier
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.status &&
            shipment.status.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [shipments, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    const handleFilterChange = (e) => {
      setFilterText(e.target.value);
    };

    return (
      <FilterComponent
        onFilter={handleFilterChange}
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
        selector: (row) => row.order?.user_name ?? "N/A",
        sortable: true,
        minWidth: "150px",
        wrap: true,
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
        minWidth: "100px",
      },
      {
        name: "Layanan",
        selector: (row) => row.service ?? "-",
        sortable: true,
        minWidth: "100px",
      },
      {
        name: "No. Resi",
        selector: (row) => row.tracking_number,
        cell: (row) => row.tracking_number || "-",
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} type="shipment" />,
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
              title="Lihat Detail & Update Resi/Status"
              aria-label={`Detail Pengiriman ${row.order?.order_number}`}
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
  );

  const customStyles = useMemo(
    () => ({
      /* ... styles ... */
    }),
    []
  );
  const paginationOptions = useMemo(
    () => ({
      /* ... options ... */
    }),
    []
  );

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Manajemen Pengiriman
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingShipments ? (
          <div className="p-6 text-center text-gray-500">
            Memuat data pengiriman...
          </div>
        ) : fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredShipments}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            // Progress & Pagination server-side (opsional)
            // progressPending={loadingShipments}
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
                Tidak ada data pengiriman ditemukan.
              </div>
            }
          />
        )}
      </div>

      {/* Modal Detail & Update Pengiriman */}
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
