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

const DetailItem = ({ label, value }) => (
  <div className="py-2.5 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="col-span-2 text-sm text-slate-800 break-words">
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
  const [formData, setFormData] = useState({ status: "", tracking_number: "" });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchDetailsCallback = useCallback(async () => {
    if (!shipmentId) return;
    setLoadingDetail(true);
    setFetchError(null);
    try {
      const data = await getShipmentDetail(authFetch, shipmentId);
      setShipmentDetail(data);
      setFormData({
        status: data?.status || "",
        tracking_number: data?.tracking_number || "",
      });
    } catch (err) {
      setFetchError(err.message || "Gagal memuat detail pengiriman.");
      toast.error(err.message || "Gagal memuat detail pengiriman.");
    } finally {
      setLoadingDetail(false);
    }
  }, [shipmentId, authFetch]);

  useEffect(() => {
    if (isOpen) fetchDetailsCallback();
  }, [isOpen, fetchDetailsCallback]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleUpdateShipment = useCallback(async () => {
    if (!shipmentId) return;
    if (
      formData.status === shipmentDetail?.status &&
      formData.tracking_number === (shipmentDetail?.tracking_number || "")
    ) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      return;
    }
    setIsUpdating(true);
    setFetchError(null);
    setValidationErrors({});
    try {
      const result = await updateShipment(authFetch, shipmentId, formData);
      toast.success(result.message || "Pengiriman berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      if (error.status === 422 && error.errors) {
        setValidationErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setFetchError(error.message || "Gagal memperbarui pengiriman.");
        toast.error(error.message || "Gagal memperbarui pengiriman.");
      }
    } finally {
      setIsUpdating(false);
    }
  }, [shipmentId, formData, authFetch, onSuccess, onClose, shipmentDetail]);

  const handleClose = () => !isUpdating && onClose();

  let content;
  if (loadingDetail) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail...</span>
      </div>
    );
  } else if (fetchError && !shipmentDetail) {
    content = (
      <div className="rounded-md bg-red-50 p-4 text-red-700 text-center">
        <FaExclamationTriangle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2">{fetchError}</p>
        <button
          onClick={fetchDetailsCallback}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (shipmentDetail) {
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Detail Pengiriman
          </h3>
          <dl className="divide-y divide-slate-100">
            <DetailItem label="ID Pengiriman" value={shipmentDetail.id} />
            <DetailItem
              label="No. Pesanan"
              value={shipmentDetail.order?.order_number}
            />
            <DetailItem
              label="Nama Pelanggan"
              value={shipmentDetail.order?.user_name}
            />
            <div className="py-2.5 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-slate-500">
                Alamat Kirim
              </dt>
              <dd className="col-span-2 text-sm text-slate-800">
                {shipmentDetail.address ? (
                  <address className="not-italic">
                    {shipmentDetail.address.recipient_name} (
                    {shipmentDetail.address.phone_number})<br />
                    {shipmentDetail.address.address_line1}
                    <br />
                    {shipmentDetail.address.city},{" "}
                    {shipmentDetail.address.province}{" "}
                    {shipmentDetail.address.postal_code}
                  </address>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <DetailItem label="Kurir" value={shipmentDetail.courier} />
            <DetailItem
              label="Ongkos Kirim"
              value={<FormattedPrice value={shipmentDetail.shipping_cost} />}
            />
          </dl>
        </div>
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <h3 className="font-semibold text-slate-800">Update Pengiriman</h3>
          <div>
            <label
              htmlFor={`shipment-tracking-${shipmentId}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nomor Resi
            </label>
            <input
              type="text"
              id={`shipment-tracking-${shipmentId}`}
              name="tracking_number"
              value={formData.tracking_number || ""}
              onChange={handleChange}
              disabled={isUpdating || loadingDetail}
              placeholder="Masukkan nomor resi"
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-200 ${
                validationErrors.tracking_number
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {validationErrors.tracking_number && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.tracking_number[0]}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`shipment-status-${shipmentId}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Status Pengiriman
            </label>
            <select
              id={`shipment-status-${shipmentId}`}
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isUpdating || loadingDetail}
              className={`block w-full max-w-xs rounded-md border-slate-300 bg-slate-50 py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-200 ${
                validationErrors.status ? "border-red-500" : ""
              }`}
            >
              {VALID_SHIPMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            {validationErrors.status && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.status[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Detail Pengiriman #${shipmentDetail?.id || ""}`}
    >
      <div className="min-h-[300px]">{content}</div>
      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClose}
          disabled={isUpdating}
          className="w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto disabled:opacity-50"
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
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none sm:w-auto ${
              isUpdating ||
              loadingDetail ||
              (formData.status === shipmentDetail.status &&
                formData.tracking_number ===
                  (shipmentDetail.tracking_number || ""))
                ? "cursor-not-allowed bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdating ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
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
