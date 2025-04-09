import { useState, useEffect, useMemo } from "react";
import Modal from "../Modal";

const PaymentDetailModal = ({
  isOpen,
  onClose,
  payment,
}) => {
  // Fungsi untuk menyesuaikan status payment jika diperlukan
  const getInitialStatus = (status) =>
    status === "expire" ? "expired" : status;

  const [status, setStatus] = useState(
    payment ? getInitialStatus(payment.status) : ""
  );

  // Update state status jika data payment berubah
  useEffect(() => {
    if (payment) {
      setStatus(getInitialStatus(payment.status));
    }
  }, [payment]);

  // Karena payment.metadata sudah di-cast ke array/object, kita langsung gunakan nilainya
  const parsedMetadata = useMemo(() => {
    if (!payment || !payment.metadata) {
      return null;
    }
    return payment.metadata;
  }, [payment]);

  if (!payment) return null;

  // Fungsi merender detail transaksi berdasarkan metadata
  const renderTransactionDetails = () => {
    if (!parsedMetadata) {
      return <p>Tidak ada informasi transaksi.</p>;
    }
    if (typeof parsedMetadata === "object" && parsedMetadata !== null) {
      return (
        <div>
          {Object.entries(parsedMetadata).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}
            </p>
          ))}
        </div>
      );
    }
    return <p>{parsedMetadata}</p>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pembayaran">
      <div className="space-y-6">
        {/* Informasi Pembayaran */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Pembayaran</h2>
          <p>
            <strong>ID Pembayaran:</strong> {payment.id}
          </p>
          <p>
            <strong>No. Pesanan:</strong> {payment.order?.order_number}
          </p>
          <p>
            <strong>Tanggal:</strong>{" "}
            {new Date(payment.created_at).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">
              {getInitialStatus(payment.status)}
            </span>
          </p>
          <p>
            <strong>Jumlah:</strong> Rp{" "}
            {(payment.order?.total_amount || payment.amount).toLocaleString(
              "id-ID"
            )}
          </p>
        </div>
        {/* Informasi Transaksi */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Transaksi</h2>
          <p>
            <strong>Tipe Pembayaran:</strong> {payment.payment_type}
          </p>
          <p>
            <strong>ID Transaksi:</strong> {payment.transaction_id}
          </p>
          {renderTransactionDetails()}
        </div>
        {/* Tombol */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDetailModal;
