import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { updateCategory } from "../../services/categoryApi";
import { FaUpload } from "react-icons/fa";

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
  }, [category, isOpen]);

  useEffect(() => {
    const currentPreview = imagePreview;
    if (currentPreview && currentPreview.startsWith("blob:")) {
      return () => URL.revokeObjectURL(currentPreview);
    }
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(`Gagal memperbarui kategori: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Kategori: ${category.category_name}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message && (
          <div className="rounded bg-red-50 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div>
          <label
            htmlFor={`edit-category-name-${category.id}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
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
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.category_name
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500 bg-slate-50"
            }`}
          />
          {errors.category_name && (
            <p className="mt-1 text-xs text-red-600">
              {errors.category_name[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Ganti Gambar (Opsional)
          </label>
          <label
            htmlFor={`edit-category-image-${category.id}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 transition-colors ${
              errors.image ? "border-red-500" : "border-slate-300"
            }`}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Pratinjau"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <FaUpload className="w-8 h-8" />
                <p className="mt-2 text-sm">Klik untuk mengunggah</p>
                <p className="text-xs">JPG, PNG, WEBP (Maks 2MB)</p>
              </div>
            )}
            <input
              id={`edit-category-image-${category.id}`}
              type="file"
              className="sr-only"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
          {errors.image && (
            <p className="text-xs text-red-600">{errors.image[0]}</p>
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
