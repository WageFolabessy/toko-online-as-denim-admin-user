import { useState, useEffect } from 'react';
import Modal from '../Modal';

const OrderDetailModal = ({ isOpen, onClose, order, updateOrderStatus }) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = () => {
    // Panggil fungsi updateOrderStatus (async) untuk mengirim update ke backend
    updateOrderStatus(order.id, status);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pesanan">
      <div className="space-y-6">
        {/* Informasi Pesanan */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Pesanan</h2>
          <p>
            <strong>No. Pesanan:</strong> {order.order_number}
          </p>
          <p>
            <strong>Tanggal Pesan:</strong>{' '}
            {new Date(order.created_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className="capitalize">{order.status}</span>
          </p>
        </div>
        {/* Item Pesanan */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Item Pesanan</h2>
          {order.order_items && order.order_items.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left">Nama Produk</th>
                  <th className="py-2 px-4 text-center">Qty</th>
                  <th className="py-2 px-4 text-right">Harga</th>
                  <th className="py-2 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{item.product.product_name}</td>
                    <td className="py-2 px-4 text-center">{item.qty}</td>
                    <td className="py-2 px-4 text-right">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-4 text-right">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Item pesanan tidak tersedia.</p>
          )}
          {/* Total */}
          <div className="flex justify-end mt-2">
            <p className="text-right">
              <strong>Total Produk:</strong> Rp{' '}
              {(order.total_amount - order.shipping_cost).toLocaleString('id-ID')}
              <br />
              <strong>Biaya Pengiriman:</strong> Rp{' '}
              {order.shipping_cost.toLocaleString('id-ID')}
              <br />
              <strong>Total Pembayaran:</strong> Rp{' '}
              {order.total_amount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        {/* Informasi Pelanggan */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Pelanggan</h2>
          <p>
            <strong>Penerima:</strong> {order.address?.recipient_name || 'N/A'}
          </p>
          <p>
            <strong>Nomor Telepon:</strong> {order.address?.phone_number || 'N/A'}
          </p>
          <p>
            <strong>Alamat:</strong> {order.address?.address_line1 || 'N/A'},{' '}
            {order.address?.city || 'N/A'}, {order.address?.province || 'N/A'},{' '}
            {order.address?.postal_code || 'N/A'}
          </p>
        </div>
        {/* Ubah Status Pesanan */}
        <div>
          <label className="block mb-2 font-semibold">Ubah Status Pesanan</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="cancelled">Cancelled</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
          </select>
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
          <button
            type="button"
            onClick={handleUpdateStatus}
            className="px-5 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Perbarui Status
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
