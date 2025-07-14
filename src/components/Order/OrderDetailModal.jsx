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
  colorClass = colors[type]?.[status] || colorClass;
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

const DetailItem = ({ label, value }) => (
  <div className="py-2 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="col-span-2 text-sm text-slate-800">{value ?? "-"}</dd>
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!orderId) return;
    setLoadingDetail(true);
    setFetchError(null);
    try {
      const data = await getOrderDetail(authFetch, orderId);
      setOrderDetail(data);
      setSelectedStatus(data?.status || "");
    } catch (err) {
      setFetchError(err.message || "Gagal memuat detail pesanan.");
      toast.error(err.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoadingDetail(false);
    }
  }, [orderId, authFetch]);

  useEffect(() => {
    if (isOpen) fetchDetailsCallback();
  }, [isOpen, fetchDetailsCallback]);

  const handleUpdateStatus = useCallback(async () => {
    if (!orderId || selectedStatus === orderDetail?.status) return;
    setIsUpdating(true);
    setFetchError(null);
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
      toast.error(error.message || "Gagal memperbarui status.");
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

  let content;
  if (loadingDetail) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail pesanan...</span>
      </div>
    );
  } else if (fetchError) {
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
  } else if (orderDetail) {
    content = (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
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
                label="Pembayaran"
                value={
                  <StatusBadge
                    status={orderDetail.payment_status}
                    type="payment"
                  />
                }
              />
              <DetailItem
                label="Pengiriman"
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
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
              Informasi Pelanggan
            </h3>
            <dl className="text-sm">
              <DetailItem label="Nama" value={orderDetail.user?.name} />
              <DetailItem label="Email" value={orderDetail.user?.email} />
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Alamat Kirim
                </dt>
                <dd className="col-span-2 text-sm text-slate-800">
                  {orderDetail.address ? (
                    <address className="not-italic">
                      {orderDetail.address.recipient_name} (
                      {orderDetail.address.phone_number})<br />
                      {orderDetail.address.address_line1}
                      <br />
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
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Item Pesanan
          </h3>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="p-2 pl-4 font-semibold text-slate-600">
                    Produk
                  </th>
                  <th className="p-2 text-center font-semibold text-slate-600">
                    Qty
                  </th>
                  <th className="p-2 text-right font-semibold text-slate-600">
                    Harga
                  </th>
                  <th className="p-2 pr-4 text-right font-semibold text-slate-600">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orderDetail.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 pl-4">
                      <div className="flex items-center gap-3">
                        {/* --- INI BAGIAN YANG DIPERBAIKI --- */}
                        <img
                          src={item.product?.primary_image?.image_url}
                          alt={item.product?.product_name}
                          className="h-12 w-12 flex-none rounded bg-slate-100 object-cover"
                        />
                        <span className="font-medium text-slate-800">
                          {item.product?.product_name || "Produk Dihapus"}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="p-2 text-right text-slate-600">
                      <FormattedPrice value={item.price} />
                    </td>
                    <td className="p-2 pr-4 text-right font-medium text-slate-800">
                      <FormattedPrice value={item.total_price} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 font-medium">
                <tr>
                  <th
                    colSpan={3}
                    className="p-2 pr-4 text-right font-normal text-slate-600"
                  >
                    Subtotal
                  </th>
                  <td className="p-2 pr-4 text-right text-slate-800">
                    <FormattedPrice
                      value={
                        orderDetail.total_amount - orderDetail.shipping_cost
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th
                    colSpan={3}
                    className="p-2 pr-4 text-right font-normal text-slate-600"
                  >
                    Ongkos Kirim
                  </th>
                  <td className="p-2 pr-4 text-right text-slate-800">
                    <FormattedPrice value={orderDetail.shipping_cost} />
                  </td>
                </tr>
                <tr>
                  <th
                    colSpan={3}
                    className="p-2 pr-4 text-right text-slate-800"
                  >
                    Total
                  </th>
                  <td className="p-2 pr-4 text-right text-slate-800">
                    <FormattedPrice value={orderDetail.total_amount} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <label
            htmlFor={`order-status-${orderId}`}
            className="block text-sm font-medium text-slate-700"
          >
            Ubah Status Pesanan
          </label>
          <select
            id={`order-status-${orderId}`}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isUpdating || loadingDetail}
            className={`mt-1 block w-full max-w-xs rounded-md border-slate-300 bg-slate-50 py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-200`}
          >
            {VALID_ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pesanan #${orderDetail?.order_number || ""}`}
    >
      <div className="min-h-[300px]">{content}</div>
      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto disabled:opacity-50"
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
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none sm:w-auto ${
              isUpdating || selectedStatus === orderDetail.status
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
