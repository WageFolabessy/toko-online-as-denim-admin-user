import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { createProduct } from "../../services/productApi";
import { getCategories } from "../../services/categoryApi";
import { FaUpload } from "react-icons/fa";

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
    if (!isOpen) {
      setFormData(initialFormData);
      setImageFiles([]);
      setImagePreviews([]);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    imagePreviews.forEach(URL.revokeObjectURL);
    setImageFiles(files);
    setImagePreviews(files.map(URL.createObjectURL));
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    imageFiles.forEach((file) => data.append("images[]", file));
    try {
      const result = await createProduct(authFetch, data);
      toast.success(result.message || "Produk berhasil ditambahkan.");
      onSuccess();
      onClose();
    } catch (error) {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        toast.error(error.message || "Gagal menambahkan produk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Produk Baru">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {Object.entries({
            product_name: {
              label: "Nama Produk",
              required: true,
              placeholder: "Kemeja Flanel",
              colSpan: "sm:col-span-2",
            },
            category_id: { label: "Kategori", type: "select", required: true },
            original_price: {
              label: "Harga Asli (Rp)",
              type: "number",
              required: true,
              placeholder: "150000",
            },
            sale_price: {
              label: "Harga Diskon (Rp)",
              type: "number",
              placeholder: "125000",
            },
            brand: { label: "Brand", placeholder: "AS Denim" },
            color: { label: "Warna", placeholder: "Biru, Merah" },
            size: { label: "Ukuran", required: true, placeholder: "M, L, XL" },
            stock: {
              label: "Stok",
              type: "number",
              required: true,
              placeholder: "100",
            },
            weight: {
              label: "Berat (gram)",
              required: true,
              type: "number",
              placeholder: "450",
              colSpan: "sm:col-span-2",
            },
          }).map(
            ([
              name,
              { label, type = "text", required, placeholder, colSpan = "" },
            ]) => (
              <div key={name} className={colSpan}>
                <label
                  htmlFor={name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    disabled={loadingCategories}
                    className={`block w-full rounded-md px-3 py-2 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors[name] ? "border-red-500" : ""
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
                ) : (
                  <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    placeholder={placeholder}
                    min={type === "number" ? 0 : undefined}
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                      errors[name]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500 bg-slate-50"
                    }`}
                  />
                )}
                {errors[name] && (
                  <p className="mt-1 text-xs text-red-600">{errors[name][0]}</p>
                )}
              </div>
            )
          )}

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Deskripsi
            </label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="bg-white [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description[0]}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Gambar Produk
            </label>
            <label
              htmlFor="add-product-images"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 ${
                errors.images ? "border-red-500" : "border-slate-300"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-slate-500">
                <FaUpload className="w-8 h-8" />
                <p className="mt-2 text-sm">
                  Klik untuk unggah (bisa lebih dari 1)
                </p>
                <p className="text-xs">JPG, PNG, WEBP (Maks 2MB)</p>
              </div>
              <input
                id="add-product-images"
                type="file"
                multiple
                className="sr-only"
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {imagePreviews.map((src, i) => (
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
