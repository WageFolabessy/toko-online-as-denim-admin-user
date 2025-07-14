import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getSiteUserDetail } from "../../services/siteUserApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Non-Aktif
    </span>
  );
StatusBadge.propTypes = {
  isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};

const DetailItem = ({ label, value }) => (
  <div className="py-3 grid grid-cols-3 gap-4">
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

const UserDetailModal = ({ isOpen, onClose, user }) => {
  const { authFetch } = useContext(AppContext);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteUserDetail(authFetch, user.id);
      setDetailedUser(data);
    } catch (err) {
      setError(err.message || "Gagal memuat detail pengguna.");
      toast.error(err.message || "Gagal memuat detail pengguna.");
    } finally {
      setLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    if (isOpen) fetchDetailsCallback();
  }, [isOpen, fetchDetailsCallback]);

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail pengguna...</span>
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-md bg-red-50 p-4 text-red-700 text-center">
        <FaExclamationTriangle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2">{error}</p>
        <button
          onClick={fetchDetailsCallback}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (detailedUser) {
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Informasi Pengguna
          </h3>
          <dl className="divide-y divide-slate-100">
            <DetailItem label="ID" value={detailedUser.id} />
            <DetailItem label="Nama" value={detailedUser.name} />
            <DetailItem label="Email" value={detailedUser.email} />
            <DetailItem label="No. Telepon" value={detailedUser.phone_number} />
            <DetailItem
              label="Status Akun"
              value={<StatusBadge isActive={detailedUser.is_active} />}
            />
            <DetailItem
              label="Tanggal Daftar"
              value={formatDateTime(detailedUser.created_at)}
            />
          </dl>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Alamat Tersimpan
          </h3>
          {Array.isArray(detailedUser.addresses) &&
          detailedUser.addresses.length > 0 ? (
            <div className="space-y-3">
              {detailedUser.addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-medium text-slate-800 flex justify-between items-center">
                    <span>{address.recipient_name}</span>
                    {address.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </p>
                  <address className="mt-1 text-xs not-italic text-slate-600">
                    {address.phone_number}
                    <br />
                    {address.address_line1}
                    <br />
                    {address.city}, {address.province} {address.postal_code}
                  </address>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Tidak ada alamat tersimpan.
            </p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-2">
            Riwayat Pesanan
          </h3>
          {Array.isArray(detailedUser.orders) &&
          detailedUser.orders.length > 0 ? (
            <ul className="space-y-2">
              {detailedUser.orders.slice(0, 5).map((order) => (
                <li
                  key={order.id}
                  className="text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-b-0"
                >
                  <span className="font-medium">#{order.order_number}</span> -{" "}
                  <span className="text-slate-500">
                    {formatDateTime(order.created_at)}
                  </span>{" "}
                  - Rp {Number(order.total_amount || 0).toLocaleString("id-ID")}
                </li>
              ))}
              {detailedUser.orders.length > 5 && (
                <li className="text-xs text-slate-500 italic">
                  Menampilkan 5 pesanan terakhir...
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Tidak ada riwayat pesanan.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pengguna: ${user?.name || ""}`}
    >
      <div className="min-h-[300px]">{content}</div>
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

UserDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default UserDetailModal;
