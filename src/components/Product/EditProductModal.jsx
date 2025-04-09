import { useState, useEffect, useContext } from "react";
import Modal from "../Modal"; // Adjust the import path as needed
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const EditProductModal = ({ isOpen, onClose, product, setProducts }) => {
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
  const [imageFiles, setImageFiles] = useState([]); // New images to upload
  const [imagePreviews, setImagePreviews] = useState([]); // Previews of new images
  const [existingImages, setExistingImages] = useState([]); // Existing images from the product
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs of images to delete
  const [errors, setErrors] = useState({});
  const { authFetch } = useContext(AppContext);

  // Fetch categories and initialize form data
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        product_name: product.product_name || "",
        color: product.color || "",
        brand: product.brand || "",
        category_id: product.category_id || "",
        original_price: product.original_price || "",
        sale_price: product.sale_price || "",
        size: product.size || "",
        stock: product.stock || "",
        weight: product.weight || "",
        description: product.description || "",
      });

      // Set existing images
      setExistingImages(product.images || []);

      // Clear new images and errors
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToDelete([]);
      setErrors({});
    }
  }, [product, isOpen]);

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
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Generate previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Clear image errors
    if (errors.images) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        images: null,
      }));
    }
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  // Handle deleting existing images
  const handleDeleteExistingImage = (imageId) => {
    // Add image ID to imagesToDelete array
    setImagesToDelete((prev) => [...prev, imageId]);

    // Remove image from existingImages state
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // Append new images if any
    imageFiles.forEach((file) => {
      data.append("images[]", file);
    });

    // Append IDs of images to delete
    imagesToDelete.forEach((imageId) => {
      data.append("imagesToDelete[]", imageId);
    });

    // Include _method to simulate PUT request
    data.append("_method", "PUT");

    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/api/admin/product/${product.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: data,
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Cari data kategori yang sesuai berdasarkan category_id dari produk hasil update.
        const updatedCategory = categories.find(
          (cat) => cat.id === parseInt(result.product.category_id)
        );

        // Gabungkan kategori ke dalam data produk yang diperbarui.
        const updatedProduct = {
          ...result.product,
          category: updatedCategory || product.category,
        };

        // Update state produk dengan produk yang sudah diperbarui.
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === product.id ? updatedProduct : item
          )
        );

        toast.success(result.message || "Produk berhasil diperbarui.");
        onClose();
        // Reset form
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
        setExistingImages([]);
        setImagesToDelete([]);
        setErrors({});
      } else if (response.status === 422) {
        // Handle validation errors
        setErrors(result.errors || {});
      } else {
        toast.error(result.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menghubungi server.");
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Produk">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            placeholder="Misal: Blue Jeans"
            className={`w-full px-4 py-2 border ${
              errors.product_name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
          />
          {errors.product_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.product_name[0]}
            </p>
          )}
        </div>
        {/* Product Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warna Produk
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Misal: Hitam, Putih, dll"
            className={`w-full px-4 py-2 border ${
              errors.color ? "border-red-500" : "border-gray-300"
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
          />
          {errors.color && (
            <p className="text-red-500 text-sm mt-1">
              {errors.color[0]}
            </p>
          )}
        </div>
        {/* Product Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Produk
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Misal: Wingman, Levi's"
            className={`w-full px-4 py-2 border ${
              errors.brand ? "border-red-500" : "border-gray-300"
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
          />
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">
              {errors.brand[0]}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-red-500 text-sm mt-1">{errors.category_id[0]}</p>
          )}
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          {/* Original Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Asli
            </label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              placeholder="Misal: 500000"
              className={`w-full px-4 py-2 border ${
                errors.original_price ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
            />
            {errors.original_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.original_price[0]}
              </p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Diskon
            </label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              placeholder="Misal: 450000"
              className={`w-full px-4 py-2 border ${
                errors.sale_price ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
            />
            {errors.sale_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sale_price[0]}
              </p>
            )}
          </div>
        </div>

        {/* Size, Stock, Weight */}
        <div className="grid grid-cols-3 gap-4">
          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ukuran
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="Misal: M"
              className={`w-full px-4 py-2 border ${
                errors.size ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
            />
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size[0]}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Misal: 100"
              className={`w-full px-4 py-2 border ${
                errors.stock ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock[0]}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berat (gram)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              placeholder="Misal: 500"
              className={`w-full px-4 py-2 border ${
                errors.weight ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight[0]}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={handleDescriptionChange}
            className="bg-white"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>
          )}
        </div>

        {/* Existing Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar Produk Saat Ini
          </label>
          {existingImages.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={`/storage/${img.image}`}
                    alt={`Gambar ${img.id}`}
                    className="w-20 h-20 object-cover rounded-md shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada gambar yang tersedia.</p>
          )}
        </div>

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tambah Gambar Baru
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {errors["images.0"] && (
            <p className="text-red-500 text-sm mt-1">{errors["images.0"][0]}</p>
          )}
          {imagePreviews.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Pratinjau ${index}`}
                    className="w-20 h-20 object-cover rounded-md shadow-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              setErrors({});
            }}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
          >
            Perbarui
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
