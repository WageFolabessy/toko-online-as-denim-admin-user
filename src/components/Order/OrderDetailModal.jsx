import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getOrderDetail, updateOrderStatus } from "../../services/orderApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};
FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const StatusBadge = ({ status, type = "order" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-gray-100 text-gray-800";

  if (type === "order") {
    const colors = {
      cancelled: "bg-red-100 text-red-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      processed: "bg-purple-100 text-purple-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-gray-100 text-gray-800",
    };
    colorClass = colors[status] || colorClass;
  } else if (type === "payment") {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      settlement: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    colorClass = colors[status] || colorClass;
  } else if (type === "shipment") {
    const colors = {
      pending: "bg-blue-100 text-blue-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
    };
    colorClass = colors[status] || colorClass;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};
StatusBadge.propTypes = {
  status: PropTypes.string,
  type: PropTypes.oneOf(["order", "payment", "shipment"]),
};

const DetailItem = ({ label, value, isHtml = false }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    {isHtml ? (
      <dd
        className="prose prose-sm col-span-2 max-w-none text-gray-900"
        dangerouslySetInnerHTML={{ __html: value || "-" }}
      />
    ) : (
      <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">
        {value ?? "-"}
      </dd>
    )}
  </div>
);
DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.element,
  ]),
  isHtml: PropTypes.bool,
};

const VALID_ORDER_STATUSES = [
  "cancelled",
  "awaiting_payment",
  "pending",
  "processed",
];

const OrderDetailModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [orderDetail, setOrderDetail] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
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
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Format Tanggal Salah" + e;
    }
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!orderId) return;
    setLoadingDetail(true);
    setFetchError(null);
    setValidationErrors({});
    setOrderDetail(null);
    try {
      const data = await getOrderDetail(authFetch, orderId);
      setOrderDetail(data);
      setSelectedStatus(data?.status || "");
    } catch (err) {
      console.error("Error fetching order detail:", err);
      const errorMessage = err.message || "Gagal memuat detail pesanan.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingDetail(false);
    }
  }, [orderId, authFetch]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setOrderDetail(null);
      setSelectedStatus("");
      setLoadingDetail(false);
      setIsUpdating(false);
      setFetchError(null);
      setValidationErrors({});
    }
  }, [isOpen, orderId, fetchDetailsCallback]);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    if (validationErrors.status) {
      setValidationErrors((prev) => ({ ...prev, status: undefined }));
    }
    if (fetchError) setFetchError(null);
  };

  const handleUpdateStatus = useCallback(async () => {
    if (!orderId || !selectedStatus || selectedStatus === orderDetail?.status) {
      toast.info("Tidak ada perubahan status untuk disimpan.");
      return;
    }
    setIsUpdating(true);
    setFetchError(null);
    setValidationErrors({});
    try {
      const result = await updateOrderStatus(
        authFetch,
        orderId,
        selectedStatus
      );
      toast.success(result.message || "Status pesanan berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setValidationErrors(error.errors);
        toast.error("Input tidak valid.");
      } else {
        setFetchError(errorMessage);
        toast.error(`Gagal memperbarui status: ${errorMessage}`);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [
    orderId,
    selectedStatus,
    authFetch,
    onSuccess,
    onClose,
    orderDetail?.status,
  ]);

  // Logika Konten Modal
  let content;
  if (loadingDetail) {
    content = (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
        <span className="ml-3 text-gray-500">Memuat detail pesanan...</span>
      </div>
    );
  } else if (fetchError && !orderDetail) {
    // Tampilkan error fetch HANYA jika detail belum ada
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
  } else if (orderDetail) {
    const canUpdateStatus = selectedStatus !== orderDetail.status;
    content = (
      <div className="space-y-6">
        {/* Tampilkan error umum dari proses update jika ada */}
        {fetchError && !loadingDetail && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {fetchError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Kolom Informasi Pesanan & Pelanggan */}
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-2 border-b pb-1">
              Informasi Pesanan
            </h3>
            <dl className="text-sm">
              <DetailItem
                label="No. Pesanan"
                value={orderDetail.order_number}
              />
              <DetailItem
                label="Tgl Pesan"
                value={formatDateTime(orderDetail.created_at)}
              />
              <DetailItem
                label="Status Pesanan"
                value={<StatusBadge status={orderDetail.status} type="order" />}
              />
              <DetailItem
                label="Status Pembayaran"
                value={
                  <StatusBadge
                    status={orderDetail.payment_status}
                    type="payment"
                  />
                }
              />
              <DetailItem
                label="Status Pengiriman"
                value={
                  <StatusBadge
                    status={orderDetail.shipment_status}
                    type="shipment"
                  />
                }
              />
            </dl>
          </div>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-2 border-b pb-1">
              Informasi Pelanggan
            </h3>
            <dl className="text-sm">
              <DetailItem label="Nama" value={orderDetail.user?.name} />
              <DetailItem label="Email" value={orderDetail.user?.email} />
              <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-500">
                  Alamat Kirim
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">
                  {orderDetail.address ? (
                    <address className="not-italic">
                      {orderDetail.address.recipient_name} (
                      {orderDetail.address.phone_number})<br />
                      {orderDetail.address.address_line1}
                      <br />
                      {orderDetail.address.address_line2 && (
                        <>
                          {orderDetail.address.address_line2}
                          <br />
                        </>
                      )}
                      {orderDetail.address.city}, {orderDetail.address.province}{" "}
                      {orderDetail.address.postal_code}
                    </address>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pt-4 pb-1 mb-2">
            Item Pesanan
          </h3>
          {Array.isArray(orderDetail.order_items) &&
          orderDetail.order_items.length > 0 ? (
            <div className="-mx-4 mt-2 ring-1 ring-gray-200 sm:mx-0 sm:rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6"
                    >
                      Produk
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 text-center font-semibold text-gray-900 sm:table-cell"
                    >
                      Qty
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 text-right font-semibold text-gray-900 sm:table-cell"
                    >
                      Harga Satuan
                    </th>
                    <th
                      scope="col"
                      className="py-2 pl-3 pr-4 text-right font-semibold text-gray-900 sm:pr-6"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orderDetail.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center gap-x-3">
                          {item.product?.primary_image?.image_url ||
                          item.product?.images?.[0]?.image_url ? (
                            <img
                              src={
                                item.product?.primary_image?.image_url ||
                                item.product?.images?.[0]?.image_url
                              }
                              alt={item.product?.product_name || ""}
                              className="h-10 w-10 flex-none rounded bg-gray-50 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex-none rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                              NoImg
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {item.product?.product_name || "Produk Dihapus"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-center text-gray-500 sm:table-cell">
                        {item.quantity}
                      </td>
                      <td className="hidden px-3 py-3 text-right text-gray-500 sm:table-cell">
                        <FormattedPrice value={item.price} />
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right text-gray-500 sm:pr-6">
                        <FormattedPrice value={item.total_price} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="pl-6 pr-3 pt-2 pb-2 text-right text-sm font-normal text-gray-500 sm:table-cell"
                    >
                      Subtotal Produk
                    </th>
                    <td className="pl-3 pr-4 pt-2 pb-2 text-right text-sm text-gray-900 sm:pr-6">
                      <FormattedPrice
                        value={
                          orderDetail.total_amount - orderDetail.shipping_cost
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="pl-6 pr-3 pt-1 pb-2 text-right text-sm font-normal text-gray-500 sm:table-cell"
                    >
                      Ongkos Kirim
                    </th>
                    <td className="pl-3 pr-4 pt-1 pb-2 text-right text-sm text-gray-900 sm:pr-6">
                      <FormattedPrice value={orderDetail.shipping_cost} />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="pl-6 pr-3 pt-1 pb-2 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Total Pembayaran
                    </th>
                    <td className="pl-3 pr-4 pt-1 pb-2 text-right text-sm font-semibold text-gray-900 sm:pr-6">
                      <FormattedPrice value={orderDetail.total_amount} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Item pesanan tidak tersedia.
            </p>
          )}
        </div>

        {/* Ubah Status Pesanan */}
        <div className="border-t pt-4 mt-4">
          <label
            htmlFor={`order-status-${orderId}`}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Ubah Status Pesanan
          </label>
          <select
            id={`order-status-${orderId}`}
            value={selectedStatus}
            onChange={handleStatusChange}
            disabled={isUpdating || loadingDetail}
            className={`mt-1 block w-full max-w-xs rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 ${
              validationErrors.status
                ? "ring-red-500 focus:ring-red-500"
                : "ring-gray-300"
            }`}
            aria-invalid={!!validationErrors.status}
            aria-describedby={
              validationErrors.status
                ? `order-status-error-${orderId}`
                : undefined
            }
          >
            {VALID_ORDER_STATUSES.map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {statusValue
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
          {validationErrors.status && (
            <p
              id={`order-status-error-${orderId}`}
              className="mt-1 text-xs text-red-600"
            >
              {validationErrors.status}
            </p>
          )}
        </div>
      </div>
    );
  } else if (!loadingDetail && isOpen) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Gagal memuat data atau pesanan tidak ditemukan.
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pesanan #${orderDetail?.order_number || orderId || ""}`}
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
        {orderDetail && (
          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={
              isUpdating ||
              selectedStatus === orderDetail.status ||
              loadingDetail
            }
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${
              isUpdating ||
              selectedStatus === orderDetail.status ||
              loadingDetail
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
              "Perbarui Status"
            )}
          </button>
        )}
      </div>
    </Modal>
  );
};

OrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func.isRequired,
};

export default OrderDetailModal;
