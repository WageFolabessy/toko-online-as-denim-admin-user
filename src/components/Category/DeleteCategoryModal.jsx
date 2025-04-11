import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { deleteCategory } from "../../services/categoryApi";

const DeleteCategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!category?.id) return;

    setLoading(true);
    try {
      const response = await deleteCategory(authFetch, category.id);

      toast.success(response?.message || "Kategori berhasil dihapus.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Gagal menghapus kategori.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Kategori">
      <p className="mb-6 text-sm text-gray-600">
        Apakah Anda yakin ingin menghapus kategori{" "}
        <strong className="font-medium text-gray-900">
          {category.category_name}
        </strong>
        ?
        <br />
        <span className="text-xs text-red-600">
          Perhatian: Menghapus kategori mungkin akan mempengaruhi produk yang
          terkait. Tindakan ini tidak dapat diurungkan.
        </span>
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

DeleteCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default DeleteCategoryModal;
