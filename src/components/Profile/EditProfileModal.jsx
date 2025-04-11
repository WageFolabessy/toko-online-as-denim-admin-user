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
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setLoading(false);
    }
  }, [admin, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
    if (name === "password" && errors.password_confirmation) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password_confirmation: undefined,
      }));
    }
    if (errors.message) {
      setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
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
        setErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            const frontendKey =
              key === "password_confirmation" ? "confirmPassword" : key;
            acc[frontendKey] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        const backendMessage = error?.data?.message;
        toast.error(
          `Gagal memperbarui profil: ${backendMessage || errorMessage}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admin) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil Admin">
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor={`profile-name-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? `profile-name-error-${admin.id}` : undefined
            }
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.name && (
            <p
              id={`profile-name-error-${admin.id}`}
              className="mt-1 text-xs text-red-600"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor={`profile-email-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? `profile-email-error-${admin.id}` : undefined
            }
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.email && (
            <p
              id={`profile-email-error-${admin.id}`}
              className="mt-1 text-xs text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor={`profile-password-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? `profile-password-error-${admin.id}` : undefined
            }
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.password && (
            <p
              id={`profile-password-error-${admin.id}`}
              className="mt-1 text-xs text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor={`profile-confirmPassword-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            id={`profile-confirmPassword-${admin.id}`}
            name="password_confirmation" // Gunakan nama field backend
            value={formData.password_confirmation}
            onChange={handleChange}
            // Wajib jika password diisi
            required={!!formData.password}
            disabled={!formData.password} // Disable jika password kosong
            placeholder="Ulangi password baru"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? `profile-confirmPassword-error-${admin.id}`
                : undefined
            }
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.confirmPassword && (
            <p
              id={`profile-confirmPassword-error-${admin.id}`}
              className="mt-1 text-xs text-red-600"
            >
              {errors.confirmPassword}
            </p>
          )}
        </div>

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
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? "cursor-not-allowed bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
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
