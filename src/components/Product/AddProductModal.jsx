import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { createProduct } from "../../services/productApi";
import { getCategories } from "../../services/categoryApi";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useContext(AppContext);

  const initialFormData = {
    product_name: "",
    color: "",
    brand: "",
    category_id: "",
    original_price: "",
    sale_price: "",
    size: "",
    stock: "",
    weight: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories when modal opens
  const fetchCategoriesCallback = useCallback(async () => {
    if (!isOpen) return; // Hanya fetch jika modal terbuka
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
  }, [isOpen, authFetch]);

  useEffect(() => {
    fetchCategoriesCallback();
  }, [fetchCategoriesCallback]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setImageFiles([]);
      setImagePreviews([]);
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const previews = [...imagePreviews];
    return () => {
      previews.forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );
    const currentPreviews = [...imagePreviews]; // Capture current state

    currentPreviews.forEach((preview) => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    if (validImageFiles.length !== files.length) {
      toast.warn(
        "Beberapa file yang dipilih bukan gambar dan telah diabaikan."
      );
    }
    if (validImageFiles.length === 0) {
      toast.warn("Tidak ada file gambar valid yang dipilih.");
    }

    setImageFiles(validImageFiles);
    setImagePreviews(validImageFiles.map((file) => URL.createObjectURL(file)));

    const imageErrorKeys = Object.keys(errors).filter((key) =>
      key.startsWith("images")
    );
    if (imageErrorKeys.length > 0) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        imageErrorKeys.forEach((key) => delete newErrors[key]);
        return newErrors;
      });
    }
    if (errors.message) {
      setErrors((prevErrors) => ({ ...prevErrors, message: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.product_name.trim())
      newErrors.product_name = ["Nama produk wajib diisi."];
    if (!formData.category_id)
      newErrors.category_id = ["Kategori wajib dipilih."];
    if (!formData.original_price)
      newErrors.original_price = ["Harga asli wajib diisi."];
    if (formData.original_price && Number(formData.original_price) <= 0)
      newErrors.original_price = ["Harga asli harus lebih dari 0."];
    if (formData.sale_price && Number(formData.sale_price) <= 0)
      newErrors.sale_price = ["Harga diskon harus lebih dari 0."];
    if (
      formData.sale_price &&
      Number(formData.sale_price) > Number(formData.original_price)
    )
      newErrors.sale_price = ["Harga diskon tidak boleh > harga asli."];
    if (!formData.size.trim()) newErrors.size = ["Ukuran wajib diisi."];
    if (formData.stock === "" || formData.stock === null)
      newErrors.stock = ["Stok wajib diisi."];
    if (formData.stock !== "" && Number(formData.stock) < 0)
      newErrors.stock = ["Stok tidak boleh negatif."];
    if (!formData.weight) newErrors.weight = ["Berat wajib diisi."];
    if (formData.weight && Number(formData.weight) <= 0)
      newErrors.weight = ["Berat harus lebih dari 0."];
    if (imageFiles.length === 0)
      newErrors.images = ["Minimal satu gambar wajib diunggah."];

    if (Object.keys(newErrors).length > 0) {
      isValid = false;
      setErrors(newErrors);
      toast.error("Harap periksa kembali input Anda.");
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const value =
        key === "sale_price" && formData[key] === "" ? "" : formData[key];
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    imageFiles.forEach((file) => {
      data.append("images[]", file);
    });

    try {
      const result = await createProduct(authFetch, data);
      toast.success(result.message || "Produk berhasil ditambahkan.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            const frontendKey = key.startsWith("images.") ? "images" : key;
            acc[frontendKey] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        const backendMessage = error?.data?.message;
        toast.error(
          `Gagal menambahkan produk: ${backendMessage || errorMessage}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Produk Baru">
      <form onSubmit={handleSubmit} noValidate>
        {errors.message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {errors.message}
          </div>
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="add-product-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nama Produk
            </label>
            <input
              type="text"
              id="add-product-name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              placeholder="Misal: Kemeja Flanel Lengan Panjang"
              aria-invalid={!!errors.product_name}
              aria-describedby={
                errors.product_name ? "product-name-error" : undefined
              }
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.product_name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.product_name && (
              <p id="product-name-error" className="mt-1 text-xs text-red-600">
                {errors.product_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-category"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Kategori
            </label>
            <select
              id="add-product-category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories}
              aria-invalid={!!errors.category_id}
              aria-describedby={
                errors.category_id ? "category-id-error" : undefined
              }
              className={`w-full rounded-md border bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.category_id
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            >
              <option value="" disabled>
                {loadingCategories ? "Memuat..." : "-- Pilih Kategori --"}
              </option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p id="category-id-error" className="mt-1 text-xs text-red-600">
                {errors.category_id}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-brand"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Brand (Opsional)
            </label>
            <input
              type="text"
              id="add-product-brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Misal: AS Denim"
              aria-invalid={!!errors.brand}
              aria-describedby={errors.brand ? "brand-error" : undefined}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.brand
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.brand && (
              <p id="brand-error" className="mt-1 text-xs text-red-600">
                {errors.brand}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-color"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Warna (Opsional)
            </label>
            <input
              type="text"
              id="add-product-color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Misal: Biru Tua, Hitam"
              aria-invalid={!!errors.color}
              aria-describedby={errors.color ? "color-error" : undefined}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.color
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.color && (
              <p id="color-error" className="mt-1 text-xs text-red-600">
                {errors.color}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-original-price"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Harga Asli (Rp)
            </label>
            <input
              type="number"
              id="add-product-original-price"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              min="1"
              placeholder="Misal: 500000"
              aria-invalid={!!errors.original_price}
              aria-describedby={
                errors.original_price ? "original-price-error" : undefined
              }
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.original_price
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.original_price && (
              <p
                id="original-price-error"
                className="mt-1 text-xs text-red-600"
              >
                {errors.original_price}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-sale-price"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Harga Diskon (Rp) (Opsional)
            </label>
            <input
              type="number"
              id="add-product-sale-price"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              min="1"
              placeholder="Kosongkan jika tidak diskon"
              aria-invalid={!!errors.sale_price}
              aria-describedby={
                errors.sale_price ? "sale-price-error" : undefined
              }
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.sale_price
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.sale_price && (
              <p id="sale-price-error" className="mt-1 text-xs text-red-600">
                {errors.sale_price}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-size"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Ukuran
            </label>
            <input
              type="text"
              id="add-product-size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="Misal: M, L, XL / 28, 29, 30"
              aria-invalid={!!errors.size}
              aria-describedby={errors.size ? "size-error" : undefined}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.size
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.size && (
              <p id="size-error" className="mt-1 text-xs text-red-600">
                {errors.size}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-product-stock"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Stok
            </label>
            <input
              type="number"
              id="add-product-stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="Misal: 100"
              aria-invalid={!!errors.stock}
              aria-describedby={errors.stock ? "stock-error" : undefined}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.stock
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.stock && (
              <p id="stock-error" className="mt-1 text-xs text-red-600">
                {errors.stock}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="add-product-weight"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Berat (gram)
            </label>
            <input
              type="number"
              id="add-product-weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="1"
              placeholder="Berat produk dalam satuan gram"
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? "weight-error" : undefined}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.weight
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.weight && (
              <p id="weight-error" className="mt-1 text-xs text-red-600">
                {errors.weight}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="add-product-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Deskripsi (Opsional)
            </label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="h-48 bg-white rounded-md mb-12 md:mb-6"
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

          <div className="md:col-span-2">
            <label
              htmlFor="add-product-images"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Gambar Produk (Minimal 1)
            </label>
            <input
              type="file"
              id="add-product-images"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required
              aria-invalid={!!errors.images}
              aria-describedby={errors.images ? "images-error" : undefined}
              className={`block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 focus:outline-none ${
                errors.images ? "ring-1 ring-red-500 rounded-md" : ""
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: JPG, PNG, WEBP. Maks: 2MB per file.
            </p>
            {errors.images && (
              <p id="images-error" className="mt-1 text-xs text-red-600">
                {errors.images}
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-gray-600">
                  Pratinjau Gambar:
                </p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Pratinjau ${index + 1}`}
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
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddProductModal;
