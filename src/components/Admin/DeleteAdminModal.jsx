import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { deleteAdmin } from "../../services/adminApi";

const DeleteAdminModal = ({ isOpen, onClose, admin, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!admin?.id) return; 

    setLoading(true);
    try {
      const response = await deleteAdmin(authFetch, admin.id);

      toast.success(response?.message || "Admin berhasil dihapus.");
      onSuccess();
      onClose(); 
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error.message || "Gagal menghapus admin.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admin) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Admin">
      <p className="mb-6 text-sm text-gray-600">
        Apakah Anda yakin ingin menghapus admin{" "}
        <strong className="font-medium text-gray-900">{admin.name}</strong>{" "}
        dengan email{" "}
        <strong className="font-medium text-gray-900">{admin.email}</strong>?
        Tindakan ini tidak dapat diurungkan.
      </p>
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading
              ? "cursor-not-allowed bg-red-400"
              : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
          }`}
        >
          {loading ? "Menghapus..." : "Ya, Hapus"}
        </button>
      </div>
    </Modal>
  );
};

DeleteAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default DeleteAdminModal;
