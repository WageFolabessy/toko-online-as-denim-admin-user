import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getPaymentDetail } from "../../services/paymentApi";
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
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-800",
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

const PaymentDetailModal = ({ isOpen, onClose, paymentId }) => {
  const { authFetch } = useContext(AppContext);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
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
    if (!paymentId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getPaymentDetail(authFetch, paymentId);
      setPaymentDetail(data);
    } catch (err) {
      setFetchError(err.message || "Gagal memuat detail pembayaran.");
      toast.error(err.message || "Gagal memuat detail pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [paymentId, authFetch]);

  useEffect(() => {
    if (isOpen) fetchDetailsCallback();
  }, [isOpen, fetchDetailsCallback]);

  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    return Object.entries(metadata).map(([key, value]) => (
      <DetailItem
        key={key}
        label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        value={
          typeof value === "object" ? (
            <pre className="text-xs bg-slate-100 p-2 rounded-md overflow-x-auto">
              <code>{JSON.stringify(value, null, 2)}</code>
            </pre>
          ) : (
            value?.toString()
          )
        }
      />
    ));
  };

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail pembayaran...</span>
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
  } else if (paymentDetail) {
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Informasi Pembayaran
          </h3>
          <dl className="divide-y divide-slate-100">
            <DetailItem label="ID Pembayaran" value={paymentDetail.id} />
            <DetailItem
              label="No. Pesanan"
              value={paymentDetail.order?.order_number}
            />
            <DetailItem
              label="Nama Pelanggan"
              value={paymentDetail.order?.user?.name}
            />
            <DetailItem
              label="Tgl Pembayaran"
              value={formatDateTime(paymentDetail.created_at)}
            />
            <DetailItem
              label="Jumlah Dibayar"
              value={<FormattedPrice value={paymentDetail.amount} />}
            />
            <DetailItem
              label="Metode Pembayaran"
              value={paymentDetail.payment_type
                ?.replace(/_/g, " ")
                .toUpperCase()}
            />
            <DetailItem
              label="Status"
              value={<StatusBadge status={paymentDetail.status} />}
            />
            <DetailItem
              label="ID Transaksi"
              value={paymentDetail.transaction_id}
            />
          </dl>
        </div>
        {paymentDetail.metadata &&
          Object.keys(paymentDetail.metadata).length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
                Metadata Transaksi
              </h3>
              <dl className="divide-y divide-slate-100">
                {renderMetadata(paymentDetail.metadata)}
              </dl>
            </div>
          )}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pembayaran #${paymentDetail?.transaction_id || ""}`}
    >
      <div className="min-h-[250px]">{content}</div>
      <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

PaymentDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paymentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PaymentDetailModal;
