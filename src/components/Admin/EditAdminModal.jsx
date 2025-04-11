import { useState, useEffect, useContext } from "react";
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
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
      });
      setErrors({});
    }
    if (!isOpen) {
      setFormData({ name: "", email: "" });
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
    if (errors.message) {
      setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
    }
  };

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
      console.error("Error updating admin:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";

      if (error.status === 422 && error.errors) {
        setErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(`Gagal memperbarui admin: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Admin: ${admin.name}`}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor={`edit-admin-name-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            className={`w-full rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor={`edit-admin-email-${admin.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            className={`w-full rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
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
