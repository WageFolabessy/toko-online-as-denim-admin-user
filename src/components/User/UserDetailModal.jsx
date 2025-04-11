import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getSiteUserDetail } from "../../services/siteUserApi";

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
  <div className="grid grid-cols-3 gap-x-4 gap-y-1 py-2 sm:py-2.5">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="col-span-2 text-sm text-gray-900">{value ?? "-"}</dd>
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
      return "Tanggal tidak valid";
    }
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setDetailedUser(null);

    try {
      const data = await getSiteUserDetail(authFetch, user.id);
      setDetailedUser(data);
    } catch (err) {
      console.error("Error fetching user detail:", err);
      const errorMessage = err.message || "Gagal memuat detail pengguna.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    if (isOpen && user) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setDetailedUser(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, user, fetchDetailsCallback]);

  let content;
  if (loading) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Memuat detail pengguna...
      </div>
    );
  } else if (error) {
    content = (
      <div className="py-10 text-center text-red-600">Error: {error}</div>
    );
  } else if (detailedUser) {
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">
            Informasi Pengguna
          </h3>
          <dl className="divide-y divide-gray-100">
            <DetailItem label="ID" value={detailedUser.id} />
            <DetailItem label="Nama" value={detailedUser.name} />
            <DetailItem label="Email" value={detailedUser.email} />
            {detailedUser.phone_number && (
              <DetailItem
                label="No. Telepon"
                value={detailedUser.phone_number}
              />
            )}
            <DetailItem
              label="Status Akun"
              value={<StatusBadge isActive={detailedUser.is_active} />}
            />
            <DetailItem
              label="Email Terverifikasi"
              value={
                detailedUser.email_verified_at
                  ? formatDateTime(detailedUser.email_verified_at)
                  : "Belum"
              }
            />
            <DetailItem
              label="Tanggal Daftar"
              value={formatDateTime(detailedUser.created_at)}
            />
            <DetailItem
              label="Update Terakhir"
              value={formatDateTime(detailedUser.updated_at)}
            />
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">
            Alamat Tersimpan
          </h3>
          {Array.isArray(detailedUser.addresses) &&
          detailedUser.addresses.length > 0 ? (
            detailedUser.addresses.map((address, index) => (
              <div
                key={address.id || index}
                className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm font-medium text-gray-800">
                  Alamat {index + 1}
                  {address.is_default ? " (Default)" : ""}
                </p>
                <address className="mt-1 text-xs not-italic text-gray-600">
                  {address.recipient_name} ({address.phone_number})<br />
                  {address.address_line1}
                  <br />
                  {address.address_line2 && (
                    <>
                      {address.address_line2}
                      <br />
                    </>
                  )}
                  {address.city}, {address.province} {address.postal_code}
                </address>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Tidak ada alamat tersimpan.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">
            Riwayat Pesanan
          </h3>
          {Array.isArray(detailedUser.orders) &&
          detailedUser.orders.length > 0 ? (
            <ul className="space-y-3">
              {detailedUser.orders.slice(0, 5).map((order, index) => (
                <li
                  key={order.id || index}
                  className="text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-b-0"
                >
                  <span className="font-medium">
                    #{order.order_number || "N/A"}
                  </span>{" "}
                  - {formatDateTime(order.created_at)} - Rp{" "}
                  {Number(order.total_amount || 0).toLocaleString("id-ID")} -{" "}
                  <span className="font-medium capitalize">
                    {order.status || "N/A"}
                  </span>
                </li>
              ))}
              {detailedUser.orders.length > 5 && (
                <li className="text-xs text-gray-500 italic">
                  Menampilkan 5 pesanan terakhir...
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Tidak ada riwayat pesanan.</p>
          )}
        </div>
      </div>
    );
  } else if (!loading && isOpen) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Gagal memuat data atau pengguna tidak ditemukan.
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengguna">
      <div className="min-h-[250px]">{content}</div>
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

UserDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default UserDetailModal;
