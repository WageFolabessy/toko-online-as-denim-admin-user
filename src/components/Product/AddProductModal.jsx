import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AddProductModal = ({ isOpen, onClose, setProducts }) => {
  const [formData, setFormData] = useState({
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
  });

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const { authFetch } = useContext(AppContext);

  // Fetch categories from the API when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await authFetch("/api/admin/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Gagal memuat kategori.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear specific field error if any
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      description: value,
    }));

    // Clear error untuk deskripsi jika ada
    if (errors.description) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: null,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Generate image previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Clear image errors
    if (errors.images || errors["images.0"]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        images: null,
        "images.0": null,
      }));
    }
  };

  useEffect(() => {
    return () => {
      // Revoke object URLs on component unmount
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    imageFiles.forEach((file) => {
      data.append("images[]", file);
    });

    try {
      const response = await authFetch(
        "http://127.0.0.1:8000/api/admin/product",
        {
          method: "POST",
          body: data,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Cari data kategori yang sesuai berdasarkan category_id
        const categoryObj = categories.find(
          (category) => category.id === parseInt(result.product.category_id)
        );

        // Gabungkan data kategori ke dalam produk baru
        const newProduct = {
          ...result.product,
          category: categoryObj,
        };

        // Update state produk dengan menambahkan produk baru yang sudah lengkap
        setProducts((prevProducts) => [...prevProducts, newProduct]);
        toast.success(result.message || "Produk berhasil ditambahkan.");
        onClose();

        // Reset form dan error
        setFormData({
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
        });
        setImageFiles([]);
        setImagePreviews([]);
        setErrors({});
      } else if (response.status === 422) {
        // Handle validation errors dengan menampilkan semua error di setiap field
        setErrors(result.errors || {});
      } else {
        toast.error(result.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      toast.error("Gagal menghubungi server.");
      console.error("Error:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Produk">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Produk
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            placeholder="Misal: Blue Jeans"
            className={`w-full border ${
              errors.product_name ? "border-red-500" : "border-gray-300"
            } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.product_name &&
            errors.product_name.map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
        </div>
        {/* Warna Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warna Produk
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Misal: Hitam, Putih, dll"
            className={`w-full border ${
              errors.color ? "border-red-500" : "border-gray-300"
            } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.color &&
            errors.color.map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
        </div>
        {/* Brand Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Produk
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Misal: Wingman, Levi's"
            className={`w-full border ${
              errors.brand ? "border-red-500" : "border-gray-300"
            } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.brand &&
            errors.brand.map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
        </div>
        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className={`w-full border ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
          {errors.category_id &&
            errors.category_id.map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
        </div>
        {/* Harga */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Asli
            </label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              placeholder="Misal: 500000"
              className={`w-full border ${
                errors.original_price ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.original_price &&
              errors.original_price.map((msg, idx) => (
                <p key={idx} className="text-red-500 text-sm mt-1">
                  {msg}
                </p>
              ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Diskon
            </label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              placeholder="Misal: 450000"
              className={`w-full border ${
                errors.sale_price ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.sale_price &&
              errors.sale_price.map((msg, idx) => (
                <p key={idx} className="text-red-500 text-sm mt-1">
                  {msg}
                </p>
              ))}
          </div>
        </div>
        {/* Ukuran, Stok, Berat */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ukuran
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="Misal: M"
              className={`w-full border ${
                errors.size ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.size &&
              errors.size.map((msg, idx) => (
                <p key={idx} className="text-red-500 text-sm mt-1">
                  {msg}
                </p>
              ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Misal: 100"
              className={`w-full border ${
                errors.stock ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.stock &&
              errors.stock.map((msg, idx) => (
                <p key={idx} className="text-red-500 text-sm mt-1">
                  {msg}
                </p>
              ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Berat (gram)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              placeholder="Misal: 500"
              className={`w-full border ${
                errors.weight ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.weight &&
              errors.weight.map((msg, idx) => (
                <p key={idx} className="text-red-500 text-sm mt-1">
                  {msg}
                </p>
              ))}
          </div>
        </div>
        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={handleDescriptionChange}
            className="bg-white rounded-md"
          />
          {errors.description &&
            errors.description.map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
        </div>
        {/* Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Produk
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {errors["images.0"] &&
            errors["images.0"].map((msg, idx) => (
              <p key={idx} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
          {/* Preview selected images */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="w-24 h-24">
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover rounded-md shadow-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Tombol */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              setErrors({});
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
