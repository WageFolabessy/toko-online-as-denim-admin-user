import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimes } from "react-icons/fa";
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

  const fetchCategoriesCallback = useCallback(async () => {
    if (!isOpen || categories.length > 0) return;
    setLoadingCategories(true);
    try {
      const categoriesData = await getCategories(authFetch);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error.message || "Gagal memuat daftar kategori.");
    } finally {
      setLoadingCategories(false);
    }
  }, [isOpen, authFetch, categories.length]);

  useEffect(() => {
    fetchCategoriesCallback();
  }, [fetchCategoriesCallback]);

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
        stock: product.stock !== null ? product.stock : "",
        weight: product.weight || "",
        description: product.description || "",
      });
      setExistingImages(Array.isArray(product.images) ? product.images : []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setImagesToDelete([]);
      setErrors({});
      setLoading(false);
    }
    if (!isOpen) {
      setFormData({});
      setExistingImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setImagesToDelete([]);
      setErrors({});
      setLoading(false);
    }
  }, [product, isOpen]);

  useEffect(() => {
    const previews = [...newImagePreviews];
    return () => {
      previews.forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [newImagePreviews]);

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

  const handleDescriptionChange = (value) => {
    const descriptionValue = value === "<p><br></p>" ? "" : value;
    setFormData((prevData) => ({ ...prevData, description: descriptionValue }));
    if (errors.description) {
      setErrors((prevErrors) => ({ ...prevErrors, description: undefined }));
    }
    if (errors.message) {
      setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
    }
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );
    const currentPreviews = [...newImagePreviews];

    currentPreviews.forEach((preview) => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    if (validImageFiles.length !== files.length) {
      toast.warn("Beberapa file yang dipilih bukan gambar dan diabaikan.");
    }

    setNewImageFiles(validImageFiles);
    setNewImagePreviews(
      validImageFiles.map((file) => URL.createObjectURL(file))
    );

    const imageErrorKeys = Object.keys(errors).filter((key) =>
      key.startsWith("images")
    );
    if (imageErrorKeys.length > 0 || errors.message) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        imageErrorKeys.forEach((key) => delete newErrors[key]);
        delete newErrors.message; // Hapus juga error umum
        return newErrors;
      });
    }
  };

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    if (errors.message) {
      setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product?.id) return;

    setErrors({});
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const value =
        key === "sale_price" && formData[key] === "" ? "" : formData[key];
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    newImageFiles.forEach((file) => {
      data.append("images[]", file);
    });

    imagesToDelete.forEach((imageId) => {
      data.append("imagesToDelete[]", imageId);
    });

    try {
      const result = await updateProduct(authFetch, product.id, data);

      toast.success(result.message || "Produk berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";

      if (error.status === 422 && error.errors) {
        setErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            const frontendKey = key.startsWith("images.")
              ? "images"
              : key.startsWith("imagesToDelete.")
              ? "imagesToDelete"
              : key;
            acc[frontendKey] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        const backendMessage = error?.data?.message;
        toast.error(
          `Gagal memperbarui produk: ${backendMessage || errorMessage}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Produk: ${product.product_name}`}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-name-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Nama Produk
            </label>
            <input
              type="text"
              id={`edit-product-name-${product.id}`}
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              aria-invalid={!!errors.product_name}
              aria-describedby={
                errors.product_name
                  ? `product-name-error-${product.id}`
                  : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.product_name
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.product_name && (
              <p
                id={`product-name-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.product_name}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-category-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Kategori
            </label>
            <select
              id={`edit-product-category-${product.id}`}
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories}
              aria-invalid={!!errors.category_id}
              aria-describedby={
                errors.category_id
                  ? `category-id-error-${product.id}`
                  : undefined
              }
              className={`block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.category_id
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            >
              <option value="" disabled>
                {loadingCategories ? "Memuat..." : "-- Pilih Kategori --"}
              </option>
              {categories.map((cat) => (
                <option value={cat.id} key={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p
                id={`category-id-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.category_id}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-brand-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Brand (Opsional)
            </label>
            <input
              type="text"
              id={`edit-product-brand-${product.id}`}
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Misal: AS Denim"
              aria-invalid={!!errors.brand}
              aria-describedby={
                errors.brand ? `brand-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.brand
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.brand && (
              <p
                id={`brand-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.brand}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-color-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Warna (Opsional)
            </label>
            <input
              type="text"
              id={`edit-product-color-${product.id}`}
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Misal: Biru Tua, Hitam"
              aria-invalid={!!errors.color}
              aria-describedby={
                errors.color ? `color-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.color
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.color && (
              <p
                id={`color-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.color}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-original-price-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Harga Asli (Rp)
            </label>
            <input
              type="number"
              id={`edit-product-original-price-${product.id}`}
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              min="1"
              aria-invalid={!!errors.original_price}
              aria-describedby={
                errors.original_price
                  ? `original-price-error-${product.id}`
                  : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.original_price
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.original_price && (
              <p
                id={`original-price-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.original_price}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor={`edit-product-sale-price-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Harga Diskon (Rp) (Opsional)
            </label>
            <input
              type="number"
              id={`edit-product-sale-price-${product.id}`}
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              min="1"
              placeholder="Kosongkan jika tidak diskon"
              aria-invalid={!!errors.sale_price}
              aria-describedby={
                errors.sale_price ? `sale-price-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.sale_price
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.sale_price && (
              <p
                id={`sale-price-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.sale_price}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-product-size-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Ukuran
            </label>
            <input
              type="text"
              id={`edit-product-size-${product.id}`}
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="Misal: M, L / 28, 29"
              aria-invalid={!!errors.size}
              aria-describedby={
                errors.size ? `size-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.size
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.size && (
              <p
                id={`size-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.size}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-product-stock-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Stok
            </label>
            <input
              type="number"
              id={`edit-product-stock-${product.id}`}
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="Misal: 100"
              aria-invalid={!!errors.stock}
              aria-describedby={
                errors.stock ? `stock-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.stock
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.stock && (
              <p
                id={`stock-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.stock}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-product-weight-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Berat (gram)
            </label>
            <input
              type="number"
              id={`edit-product-weight-${product.id}`}
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="1"
              placeholder="Misal: 500"
              aria-invalid={!!errors.weight}
              aria-describedby={
                errors.weight ? `weight-error-${product.id}` : undefined
              }
              className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                errors.weight
                  ? "ring-red-500 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600"
              }`}
            />
            {errors.weight && (
              <p
                id={`weight-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.weight}
              </p>
            )}
          </div>

          <div className="sm:col-span-full">
            <label className="mb-1.5 block text-sm font-medium leading-6 text-gray-900">
              Deskripsi (Opsional)
            </label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="h-48 rounded-md bg-white mb-12 md:mb-6 [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:border-gray-300 [&_.ql-container]:border-gray-300"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="sm:col-span-full">
            <label className="mb-1.5 block text-sm font-medium leading-6 text-gray-900">
              Gambar Produk Saat Ini
            </label>
            {existingImages.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-3 rounded-lg border border-dashed border-gray-900/25 p-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative flex-shrink-0">
                    <img
                      src={img.image_url}
                      alt={`Gambar ${img.id}`}
                      loading="lazy"
                      className="h-24 w-24 rounded-md border object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-red-600 bg-red-500 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Hapus Gambar Ini"
                      aria-label="Hapus Gambar Ini"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                    {img.is_primary && (
                      <span className="absolute bottom-1 right-1 rounded-sm bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Tidak ada gambar saat ini.
              </p>
            )}
            {errors.imagesToDelete && (
              <p className="mt-1 text-xs text-red-600">
                {errors.imagesToDelete}
              </p>
            )}
          </div>

          <div className="sm:col-span-full">
            <label
              htmlFor={`edit-product-images-${product.id}`}
              className="mb-1.5 block text-sm font-medium leading-6 text-gray-900"
            >
              Tambah Gambar Baru (Opsional)
            </label>
            <input
              type="file"
              id={`edit-product-images-${product.id}`}
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleNewImageChange}
              aria-invalid={!!errors.images}
              aria-describedby={
                errors.images ? `images-error-${product.id}` : undefined
              }
              className={`block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 focus:outline-none ${
                errors.images ? "ring-1 ring-red-500 rounded-md" : ""
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: JPG, PNG, WEBP. Maks: 2MB per file.
            </p>
            {errors.images && (
              <p
                id={`images-error-${product.id}`}
                className="mt-1 text-xs text-red-600"
              >
                {errors.images}
              </p>
            )}

            {newImagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-gray-600">
                  Pratinjau Gambar Baru:
                </p>
                <div className="flex flex-wrap gap-3">
                  {newImagePreviews.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Pratinjau Baru ${index + 1}`}
                      className="h-24 w-24 rounded-md border object-cover shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-5">
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
            disabled={loading || loadingCategories}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading || loadingCategories
                ? "cursor-not-allowed bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
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
