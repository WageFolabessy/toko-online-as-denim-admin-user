import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { updateCategory } from "../../services/categoryApi";

const EditCategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [formData, setFormData] = useState({ category_name: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setFormData({ category_name: category.category_name || "" });
      setImagePreview(category.image_url || "");
      setImageFile(null);
      setErrors({});
    }

    if (!isOpen) {
      setFormData({ category_name: "" });
      setImageFile(null);
      setImagePreview("");
      setErrors({});
      setLoading(false);
    }
  }, [category, isOpen]);

  useEffect(() => {
    let currentPreview = imagePreview;
    if (currentPreview && currentPreview.startsWith("blob:")) {
      return () => {
        URL.revokeObjectURL(currentPreview);
      };
    }
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: undefined }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
      if (errors.message) {
        setErrors((prev) => ({ ...prev, message: undefined }));
      }
    } else {
      setImageFile(null);
      setImagePreview(category?.image_url || "");
      if (file) {
        toast.warn("File yang dipilih bukan gambar.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category?.id) return;

    setErrors({});
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("category_name", formData.category_name);
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const result = await updateCategory(
        authFetch,
        category.id,
        formDataToSend
      );

      toast.success(result.message || "Kategori berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
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
        toast.error(`Gagal memperbarui kategori: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Kategori: ${category.category_name}`}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor={`edit-category-name-${category.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Nama Kategori
          </label>
          <input
            type="text"
            id={`edit-category-name-${category.id}`}
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            className={`w-full rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 ${
              errors.category_name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.category_name && (
            <p className="mt-1 text-xs text-red-600">{errors.category_name}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor={`edit-category-image-${category.id}`}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Ganti Gambar Kategori (Opsional)
          </label>
          <input
            type="file"
            id={`edit-category-image-${category.id}`}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 focus:outline-none ${
              errors.image ? "ring-1 ring-red-500 rounded-md" : ""
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: JPG, PNG, WEBP. Maks: 2MB.
          </p>
          {errors.image && (
            <p className="mt-1 text-xs text-red-600">{errors.image}</p>
          )}

          {imagePreview && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-gray-600">
                Pratinjau:
              </p>
              <img
                src={imagePreview}
                alt="Pratinjau Gambar"
                className="h-32 w-32 rounded-md border object-cover shadow-sm"
              />
            </div>
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
            {loading ? "Memperbarui..." : "Perbarui Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default EditCategoryModal;
