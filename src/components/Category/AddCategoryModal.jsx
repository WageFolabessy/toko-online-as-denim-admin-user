import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { createCategory } from "../../services/categoryApi";

const AddCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [formData, setFormData] = useState({ category_name: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ category_name: "" });
      setImageFile(null);
      setImagePreview("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let currentPreview = imagePreview;
    return () => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [imagePreview]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors((prevErrors) => ({ ...prevErrors, image: undefined }));
      }
      if (errors.message) {
        setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
      }
    } else {
      setImageFile(null);
      setImagePreview("");
      if (file) {
        toast.warn("File yang dipilih bukan gambar.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const data = new FormData();
    data.append("category_name", formData.category_name);
    if (imageFile) {
      data.append("image", imageFile);
    } else {
      setErrors({ image: ["Gambar kategori wajib diunggah."] });
      setLoading(false);
      toast.error("Gambar kategori wajib diunggah.");
      return;
    }

    try {
      const result = await createCategory(authFetch, data);

      toast.success(result.message || "Kategori berhasil ditambahkan.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
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
        toast.error(`Gagal menambahkan kategori: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kategori Baru">
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="add-category-name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Nama Kategori
          </label>
          <input
            type="text"
            id="add-category-name"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            placeholder="Misal: Celana Jeans Pria"
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
            htmlFor="add-category-image"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Gambar Kategori
          </label>
          <input
            type="file"
            id="add-category-image"
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
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddCategoryModal;
