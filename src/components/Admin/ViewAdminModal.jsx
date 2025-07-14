import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getSelectedAdmin } from "../../services/adminApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const DetailItem = ({ label, value }) => (
  <div className="py-3 grid grid-cols-3 gap-4">
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

const ViewAdminModal = ({ isOpen, onClose, admin }) => {
  const { authFetch } = useContext(AppContext);
  const [adminDetail, setAdminDetail] = useState(null);
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

  const fetchAdminDetail = useCallback(async () => {
    if (!admin?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSelectedAdmin(authFetch, admin.id);
      setAdminDetail(data);
    } catch (err) {
      setError(err.message || "Gagal memuat detail admin.");
      toast.error(err.message || "Gagal memuat detail admin.");
    } finally {
      setLoading(false);
    }
  }, [admin, authFetch]);

  useEffect(() => {
    if (isOpen) {
      fetchAdminDetail();
    }
  }, [isOpen, fetchAdminDetail]);

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail...</span>
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-md bg-red-50 p-4 text-red-700 text-center">
        <FaExclamationTriangle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2">{error}</p>
        <button
          onClick={fetchAdminDetail}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (adminDetail) {
    content = (
      <dl className="divide-y divide-slate-100">
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Admin">
      <div className="min-h-[200px]">{content}</div>
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

ViewAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.object,
};

export default ViewAdminModal;
