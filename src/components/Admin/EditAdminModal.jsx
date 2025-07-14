import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { updateSelectedAdmin } from "../../services/adminApi";

const EditAdminModal = ({ isOpen, onClose, admin, onSuccess }) => {
  const { authFetch, user, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && admin) {
      setFormData({ name: admin.name || "", email: admin.email || "" });
      setErrors({});
    }
  }, [admin, isOpen]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admin) return;

    setErrors({});
    setLoading(true);

    try {
      const updatedAdminData = await updateSelectedAdmin(
        authFetch,
        admin.id,
        formData
      );
      toast.success("Data admin berhasil diperbarui.");

      if (user && user.id === updatedAdminData.id) {
        setUser(updatedAdminData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(`Gagal memperbarui admin: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Admin: ${admin?.name || ""}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message && (
          <div className="rounded bg-red-50 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}

        <div>
          <label
            htmlFor={`edit-admin-name-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            id={`edit-admin-name-${admin.id}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500 bg-slate-50"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`edit-admin-email-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id={`edit-admin-email-${admin.id}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500 bg-slate-50"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
              loading
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memperbarui..." : "Perbarui Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default EditAdminModal;
