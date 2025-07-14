import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { updateOwnAdminProfile } from "../../services/adminApi";

const EditProfileModal = ({ isOpen, onClose, admin, onSuccess }) => {
  const { authFetch, setUser: setContextUser } = useContext(AppContext);

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
    if (isOpen && admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
    }
  }, [admin, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.password) {
      payload.password = formData.password;
      payload.password_confirmation = formData.password_confirmation;
    }

    try {
      const result = await updateOwnAdminProfile(authFetch, payload);
      toast.success(result.message || "Profil berhasil diperbarui.");
      if (result.user) {
        setContextUser(result.user);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(`Gagal memperbarui profil: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profil Admin">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message && (
          <div className="rounded bg-red-50 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div>
          <label
            htmlFor={`profile-name-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            id={`profile-name-${admin.id}`}
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
            htmlFor={`profile-email-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id={`profile-email-${admin.id}`}
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

        <div>
          <label
            htmlFor={`profile-password-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Password Baru (Opsional)
          </label>
          <input
            type="password"
            id={`profile-password-${admin.id}`}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Kosongkan jika tidak ingin mengubah"
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
            htmlFor={`profile-confirmPassword-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            id={`profile-confirmPassword-${admin.id}`}
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required={!!formData.password}
            disabled={!formData.password}
            placeholder="Ulangi password baru"
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 disabled:bg-slate-200 disabled:cursor-not-allowed ${
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
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default EditProfileModal;
