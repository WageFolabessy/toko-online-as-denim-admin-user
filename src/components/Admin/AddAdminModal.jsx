import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { createAdmin } from "../../services/adminApi";

const AddAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const initialFormData = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

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
    setErrors({});
    setLoading(true);
    try {
      const response = await createAdmin(authFetch, formData);
      toast.success(response.message || "Admin baru berhasil ditambahkan.");
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(`Gagal menambahkan admin: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Admin Baru">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message && (
          <div className="rounded bg-red-50 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}

        <div>
          <label
            htmlFor="add-admin-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            id="add-admin-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Masukkan nama lengkap"
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
            htmlFor="add-admin-email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id="add-admin-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@example.com"
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

        <div>
          <label
            htmlFor="add-admin-password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            type="password"
            id="add-admin-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Minimal 8 karakter"
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500 bg-slate-50"
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="add-admin-confirmPassword"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Konfirmasi Password
          </label>
          <input
            type="password"
            id="add-admin-confirmPassword"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            placeholder="Ulangi password"
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.password_confirmation
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500 bg-slate-50"
            }`}
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password_confirmation[0]}
            </p>
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
            {loading ? "Menyimpan..." : "Simpan Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddAdminModal;
