import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getShipmentDetail, updateShipment } from "../../services/shipmentApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

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
StatusBadge.propTypes = { status: PropTypes.string };

const DetailItem = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">
      {value ?? "-"}
    </dd>
  </div>
);
DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.element,
  ]),
};

const VALID_SHIPMENT_STATUSES = ["pending", "shipped", "delivered"];

const ShipmentDetailModal = ({ isOpen, onClose, shipmentId, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [shipmentDetail, setShipmentDetail] = useState(null);
  // State untuk field yang bisa diedit
  const [formData, setFormData] = useState({ status: "", tracking_number: "" });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Format Tanggal Salah";
    }
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!shipmentId) return;
    setLoadingDetail(true);
    setFetchError(null);
    setValidationErrors({});
    setShipmentDetail(null);
    try {
      const data = await getShipmentDetail(authFetch, shipmentId);
      setShipmentDetail(data);
      setFormData({
        status: data?.status || "",
        tracking_number: data?.tracking_number || "",
      });
    } catch (err) {
      console.error("Error fetching shipment detail:", err);
      const errorMessage = err.message || "Gagal memuat detail pengiriman.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingDetail(false);
    }
  }, [shipmentId, authFetch]);

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setShipmentDetail(null);
      setFormData({ status: "", tracking_number: "" });
      setLoadingDetail(false);
      setIsUpdating(false);
      setFetchError(null);
      setValidationErrors({});
    }
  }, [isOpen, shipmentId, fetchDetailsCallback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (fetchError) setFetchError(null); // Hapus error fetch umum
  };

  const handleUpdateShipment = useCallback(async () => {
    if (!shipmentId) return;

    if (
      formData.status === shipmentDetail?.status &&
      formData.tracking_number === (shipmentDetail?.tracking_number || "")
    ) {
      toast.info("Tidak ada perubahan data untuk disimpan.");
      return;
    }

    setIsUpdating(true);
    setFetchError(null);
    setValidationErrors({});

    const payload = {
      status: formData.status,
      tracking_number: formData.tracking_number || null,
    };

    try {
      const result = await updateShipment(authFetch, shipmentId, payload);
      toast.success(result.message || "Pengiriman berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating shipment:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setValidationErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setFetchError(errorMessage);
        const backendMessage = error?.data?.message;
        toast.error(
          `Gagal memperbarui pengiriman: ${backendMessage || errorMessage}`
        );
      }
    } finally {
      setIsUpdating(false);
    }
  }, [shipmentId, formData, authFetch, onSuccess, onClose, shipmentDetail]);

  // Render konten utama modal
  let content;
  if (loadingDetail) {
    content = (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
        <span className="ml-3 text-gray-500">Memuat detail pengiriman...</span>
      </div>
    );
  } else if (fetchError && !shipmentDetail) {
    content = (
      <div className="rounded-md bg-red-50 p-4">
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
                onClick={fetchDetailsCallback}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (shipmentDetail) {
    const isChanged =
      formData.status !== shipmentDetail.status ||
      formData.tracking_number !== (shipmentDetail.tracking_number || "");
    content = (
      <div className="space-y-6">
        {fetchError && !loadingDetail && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {fetchError}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pb-1 mb-2">
            Detail Pengiriman
          </h3>
          <dl className="text-sm divide-y divide-gray-100">
            <DetailItem label="ID Pengiriman" value={shipmentDetail.id} />
            <DetailItem
              label="No. Pesanan"
              value={shipmentDetail.order?.order_number}
            />
            <DetailItem
              label="Nama Pelanggan"
              value={shipmentDetail.order?.user_name}
            />
            <DetailItem
              label="Nama Penerima"
              value={shipmentDetail.order?.recipient_name}
            />
            <DetailItem label="Kurir" value={shipmentDetail.courier} />
            <DetailItem label="Layanan" value={shipmentDetail.service} />
            <DetailItem
              label="Ongkos Kirim"
              value={<FormattedPrice value={shipmentDetail.shipping_cost} />}
            />
            <DetailItem
              label="Tgl Dibuat"
              value={formatDateTime(shipmentDetail.created_at)}
            />
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-500">
                Alamat Kirim
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">
                {shipmentDetail.address ? (
                  <address className="not-italic">
                    {shipmentDetail.address.recipient_name} (
                    {shipmentDetail.address.phone_number})<br />
                    {shipmentDetail.address.address_line1}
                    <br />
                    {shipmentDetail.address.address_line2 && (
                      <>
                        {shipmentDetail.address.address_line2}
                        <br />
                      </>
                    )}
                    {shipmentDetail.address.city},{" "}
                    {shipmentDetail.address.province}{" "}
                    {shipmentDetail.address.postal_code}
                  </address>
                ) : (
                  "-"
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Form Update Status & Resi */}
        <div className="border-t pt-4 mt-4 space-y-4">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Update Pengiriman
          </h3>
          <div>
            <label
              htmlFor={`shipment-tracking-${shipmentId}`}
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nomor Resi
            </label>
            <input
              type="text"
              id={`shipment-tracking-${shipmentId}`}
              name="tracking_number"
              value={formData.tracking_number}
              onChange={handleChange}
              disabled={isUpdating || loadingDetail}
              placeholder="Masukkan nomor resi jika ada"
              aria-invalid={!!validationErrors.tracking_number}
              aria-describedby={
                validationErrors.tracking_number
                  ? `shipment-tracking-error-${shipmentId}`
                  : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 ${
                validationErrors.tracking_number
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {validationErrors.tracking_number && (
              <p
                id={`shipment-tracking-error-${shipmentId}`}
                className="mt-1 text-xs text-red-600"
              >
                {validationErrors.tracking_number}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`shipment-status-${shipmentId}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Status Pengiriman
            </label>
            <select
              id={`shipment-status-${shipmentId}`}
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isUpdating || loadingDetail}
              className={`mt-1 block w-full max-w-xs rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 ${
                validationErrors.status
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300"
              }`}
              aria-invalid={!!validationErrors.status}
              aria-describedby={
                validationErrors.status
                  ? `shipment-status-error-${shipmentId}`
                  : undefined
              }
            >
              {VALID_SHIPMENT_STATUSES.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            {validationErrors.status && (
              <p
                id={`shipment-status-error-${shipmentId}`}
                className="mt-1 text-xs text-red-600"
              >
                {validationErrors.status}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  } else if (!loadingDetail && isOpen) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Gagal memuat data atau pengiriman tidak ditemukan.
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pengiriman (ID: ${
        shipmentDetail?.id || shipmentId || ""
      })`}
    >
      <div className="min-h-[300px]">{content}</div>
      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:mt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
        >
          Tutup
        </button>
        {shipmentDetail && (
          <button
            type="button"
            onClick={handleUpdateShipment}
            disabled={
              isUpdating ||
              loadingDetail ||
              (formData.status === shipmentDetail.status &&
                formData.tracking_number ===
                  (shipmentDetail.tracking_number || ""))
            }
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${
              isUpdating ||
              loadingDetail ||
              (formData.status === shipmentDetail.status &&
                formData.tracking_number ===
                  (shipmentDetail.tracking_number || ""))
                ? "cursor-not-allowed bg-indigo-300"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            {isUpdating ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />{" "}
                Menyimpan...
              </>
            ) : (
              "Perbarui Pengiriman"
            )}
          </button>
        )}
      </div>
    </Modal>
  );
};

ShipmentDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  shipmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func.isRequired,
};

export default ShipmentDetailModal;
