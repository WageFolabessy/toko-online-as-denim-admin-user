import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { deleteProduct } from "../../services/productApi";
import { FaExclamationTriangle } from "react-icons/fa";

const DeleteProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const response = await deleteProduct(authFetch, product.id);
      toast.success(response?.message || "Produk berhasil dihapus.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Gagal menghapus produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Konfirmasi Hapus">
      <div className="flex items-start gap-4">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FaExclamationTriangle
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">Hapus Produk</h3>
          <p className="mt-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus produk{" "}
            <strong className="font-medium text-slate-900">
              {product.product_name}
            </strong>
            ?
            <br />
            <span className="mt-1 block text-xs text-red-600">
              Tindakan ini tidak dapat diurungkan.
            </span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
            loading
              ? "cursor-not-allowed bg-red-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Menghapus..." : "Ya, Hapus"}
        </button>
      </div>
    </Modal>
  );
};

DeleteProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default DeleteProductModal;
