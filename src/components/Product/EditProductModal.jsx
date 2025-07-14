import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimes, FaUpload } from "react-icons/fa";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { updateProduct } from "../../services/productApi";
import { getCategories } from "../../services/categoryApi";

const EditProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { authFetch } = useContext(AppContext);
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingCategories(true);
      getCategories(authFetch)
        .then(setCategories)
        .catch((err) => toast.error(err.message || "Gagal memuat kategori."))
        .finally(() => setLoadingCategories(false));
    }
  }, [isOpen, authFetch]);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        product_name: product.product_name || "",
        color: product.color || "",
        brand: product.brand || "",
        category_id: product.category_id || "",
        original_price: product.original_price || "",
        sale_price: product.sale_price || "",
        size: product.size || "",
        stock: product.stock ?? "",
        weight: product.weight || "",
        description: product.description || "",
      });
      setExistingImages(Array.isArray(product.images) ? product.images : []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setImagesToDelete([]);
      setErrors({});
    }
  }, [product, isOpen]);

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

  const handleDescriptionChange = useCallback(
    (value) => {
      setFormData((prev) => ({
        ...prev,
        description: value === "<p><br></p>" ? "" : value,
      }));
      if (errors.description) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.description;
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    newImagePreviews.forEach(URL.revokeObjectURL);
    setNewImageFiles(files);
    setNewImagePreviews(files.map((file) => URL.createObjectURL(file)));
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product?.id) return;
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, formData[key] ?? "")
    );
    newImageFiles.forEach((file) => data.append("images[]", file));
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach((id) => data.append("imagesToDelete[]", id));
    }

    try {
      const result = await updateProduct(authFetch, product.id, data);
      toast.success(result.message || "Produk berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        toast.error(error.message || "Gagal memperbarui produk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Produk`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-product-name-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nama Produk
            </label>
            <input
              type="text"
              id={`edit-product-name-${product.id}`}
              name="product_name"
              value={formData.product_name || ""}
              onChange={handleChange}
              required
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.product_name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.product_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.product_name[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-category-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Kategori
            </label>
            <select
              id={`edit-product-category-${product.id}`}
              name="category_id"
              value={formData.category_id || ""}
              onChange={handleChange}
              required
              disabled={loadingCategories}
              className={`block w-full px-3 py-2 rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.category_id ? "border-red-500" : ""
              }`}
            >
              <option value="" disabled>
                {loadingCategories ? "Memuat..." : "-- Pilih --"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category_id[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-brand-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Brand
            </label>
            <input
              type="text"
              id={`edit-product-brand-${product.id}`}
              name="brand"
              value={formData.brand || ""}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.brand
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.brand && (
              <p className="mt-1 text-xs text-red-600">{errors.brand[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-original-price-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Harga Asli (Rp)
            </label>
            <input
              type="number"
              id={`edit-product-original-price-${product.id}`}
              name="original_price"
              value={formData.original_price || ""}
              onChange={handleChange}
              required
              min="0"
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.original_price
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.original_price && (
              <p className="mt-1 text-xs text-red-600">
                {errors.original_price[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-sale-price-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Harga Diskon (Rp)
            </label>
            <input
              type="number"
              id={`edit-product-sale-price-${product.id}`}
              name="sale_price"
              value={formData.sale_price || ""}
              onChange={handleChange}
              min="0"
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.sale_price
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.sale_price && (
              <p className="mt-1 text-xs text-red-600">
                {errors.sale_price[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-size-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Ukuran
            </label>
            <input
              type="text"
              id={`edit-product-size-${product.id}`}
              name="size"
              value={formData.size || ""}
              onChange={handleChange}
              required
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.size
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.size && (
              <p className="mt-1 text-xs text-red-600">{errors.size[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-product-stock-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Stok
            </label>
            <input
              type="number"
              id={`edit-product-stock-${product.id}`}
              name="stock"
              value={formData.stock || ""}
              onChange={handleChange}
              required
              min="0"
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.stock
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-600">{errors.stock[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-product-weight-${product.id}`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Berat (gram)
            </label>
            <input
              type="number"
              id={`edit-product-weight-${product.id}`}
              name="weight"
              value={formData.weight || ""}
              onChange={handleChange}
              required
              min="0"
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.weight
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.weight && (
              <p className="mt-1 text-xs text-red-600">{errors.weight[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Deskripsi
            </label>
            <ReactQuill
              theme="snow"
              value={formData.description || ""}
              onChange={handleDescriptionChange}
              className="bg-white [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description[0]}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Gambar Saat Ini
              </label>
              {existingImages.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-2 mt-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.image_url}
                        alt={`Gambar ${img.id}`}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        title="Hapus Gambar Ini"
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white hover:bg-red-700"
                      >
                        <FaTimes className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-2">Tidak ada gambar.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Tambah Gambar Baru
              </label>
              <label
                htmlFor={`edit-product-images-${product.id}`}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 ${
                  errors.images ? "border-red-500" : "border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <FaUpload className="w-8 h-8" />
                  <p className="mt-2 text-sm">Klik untuk unggah</p>
                </div>
                <input
                  id={`edit-product-images-${product.id}`}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleNewImageChange}
                  accept="image/jpeg,image/png,image/webp"
                />
              </label>
              {newImagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {newImagePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i}`}
                      className="h-20 w-20 rounded-md border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              )}
              {errors.images && (
                <p className="text-xs text-red-600">{errors.images[0]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
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
            disabled={loading || loadingCategories}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
              loading || loadingCategories
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memperbarui..." : "Perbarui Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};
export default EditProductModal;
