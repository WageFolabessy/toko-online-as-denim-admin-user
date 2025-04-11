import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Modal from "../Modal";
import { getSelectedAdmin } from "../../services/adminApi";

const ViewAdminModal = ({ isOpen, onClose, admin }) => {
  const { authFetch } = useContext(AppContext);
  const [adminDetail, setAdminDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDetail = async () => {
      if (!admin?.id) return;

      setLoading(true);
      setError(null);
      setAdminDetail(null);

      try {
        const data = await getSelectedAdmin(authFetch, admin.id);
        setAdminDetail(data);
      } catch (err) {
        console.error("Error fetching admin detail:", err);
        const errorMessage = err.message || "Gagal memuat detail admin.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && admin) {
      fetchAdminDetail();
    }

    if (!isOpen) {
      setAdminDetail(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, admin, authFetch]);

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

  const DetailItem = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );

  let content;
  if (loading) {
    content = (
      <p className="py-4 text-center text-gray-500">Memuat detail...</p>
    );
  } else if (error) {
    content = <p className="py-4 text-center text-red-600">Error: {error}</p>;
  } else if (adminDetail) {
    content = (
      <dl className="divide-y divide-gray-200">
        <DetailItem label="ID" value={adminDetail.id} />
        <DetailItem label="Nama" value={adminDetail.name} />
        <DetailItem label="Email" value={adminDetail.email} />
        <DetailItem
          label="Tanggal Dibuat"
          value={formatDateTime(adminDetail.created_at)}
        />
        <DetailItem
          label="Terakhir Diperbarui"
          value={formatDateTime(adminDetail.updated_at)}
        />
      </dl>
    );
  } else if (isOpen && !admin) {
    content = (
      <p className="py-4 text-center text-gray-500">
        Silakan pilih admin terlebih dahulu.
      </p>
    );
  } else {
    content = (
      <p className="py-4 text-center text-gray-500">
        Data detail admin tidak tersedia.
      </p>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Admin">
      <div className="min-h-[150px]">{content}</div>
      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
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

ViewAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.object,
};

export default ViewAdminModal;
