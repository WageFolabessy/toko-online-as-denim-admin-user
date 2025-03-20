import { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import { toast } from 'react-toastify';
import { AppContext } from "../../context/AppContext";

const AddCategoryModal = ({ isOpen, onClose, setCategories }) => {
  const [formData, setFormData] = useState({
    category_name: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const { authFetch } = useContext(AppContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Hapus error untuk field yang diubah
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview('');
    }

    // Hapus error untuk field 'image'
    if (errors.image) {
      setErrors({
        ...errors,
        image: null,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Siapkan data formulir
    const data = new FormData();
    data.append('category_name', formData.category_name);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const response = await authFetch('http://127.0.0.1:8000/api/admin/category', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setCategories((prevCategories) => [...prevCategories, result.category]);
        toast.success(result.message || 'Kategori berhasil ditambahkan.');
        onClose();

        // Reset formulir dan error
        setFormData({ category_name: '' });
        setImageFile(null);
        setImagePreview('');
        setErrors({});
      } else if (response.status === 422) {
        // Tangani error validasi
        setErrors(result.errors || {});
      } else {
        toast.error(result.message || 'Terjadi kesalahan.');
      }
    } catch (error) {
      toast.error('Gagal menghubungi server.');
      console.error('Error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kategori">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Kategori
          </label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            placeholder="Misal: Jeans"
            className={`w-full border ${
              errors.category_name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.category_name && (
            <p className="text-red-500 text-sm mt-1">{errors.category_name[0]}</p>
          )}
        </div>
        {/* Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Kategori
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
          )}
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Pratinjau Gambar"
                className="w-32 h-32 object-cover rounded-md shadow-md"
              />
            </div>
          )}
        </div>
        {/* Tombol */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
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

export default AddCategoryModal;
