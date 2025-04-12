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

const StatusBadge = ({ status, type = "payment" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";
  let colorClass = "bg-gray-100 text-gray-800";

  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
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

const PaymentDetailModal = ({ isOpen, onClose, paymentId }) => {
  const { authFetch } = useContext(AppContext);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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
      return "Format Tanggal Salah";
    }
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!paymentId) return;

    setLoading(true);
    setFetchError(null);
    setPaymentDetail(null);

    try {
      const data = await getPaymentDetail(authFetch, paymentId);
      setPaymentDetail(data);
    } catch (err) {
      console.error("Error fetching payment detail:", err);
      const errorMessage = err.message || "Gagal memuat detail pembayaran.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [paymentId, authFetch]);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setPaymentDetail(null);
      setLoading(false);
      setFetchError(null);
    }
  }, [isOpen, paymentId, fetchDetailsCallback]);

  const renderMetadata = (metadata) => {
    if (!metadata) return <DetailItem label="Metadata" value="-" />;
    if (typeof metadata === "object" && metadata !== null) {
      return Object.entries(metadata).map(([key, value]) => (
        <DetailItem
          key={key}
          label={key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
          value={
            typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : value?.toString()
          } // Tampilkan string atau JSON
        />
      ));
    }
    return <DetailItem label="Metadata" value={metadata.toString()} />;
  };

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
        <span className="ml-3 text-gray-500">Memuat detail pembayaran...</span>
      </div>
    );
  } else if (fetchError) {
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
  } else if (paymentDetail) {
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pb-2 mb-2">
            Informasi Pembayaran
          </h3>
          <dl className="text-sm divide-y divide-gray-100">
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
              label="Status Pembayaran"
              value={
                <StatusBadge status={paymentDetail.status} type="payment" />
              }
            />
            <DetailItem
              label="ID Transaksi"
              value={paymentDetail.transaction_id}
            />
          </dl>
        </div>

        {paymentDetail.metadata && (
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pt-4 pb-1 mb-2">
              Metadata Transaksi
            </h3>
            <dl className="text-sm divide-y divide-gray-100">
              {renderMetadata(paymentDetail.metadata)}
            </dl>
          </div>
        )}
      </div>
    );
  } else if (!loading && isOpen) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Gagal memuat data atau pembayaran tidak ditemukan.
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pembayaran (ID: ${paymentId || ""})`}
    >
      <div className="min-h-[200px]">{content}</div>
      <div className="mt-5 flex justify-end border-t border-gray-200 pt-4 sm:mt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
