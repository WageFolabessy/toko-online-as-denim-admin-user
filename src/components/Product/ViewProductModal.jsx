import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authFetch } = useContext(AppContext);

  // Fetch product detail dari endpoint saat modal dibuka
  useEffect(() => {
    if (isOpen && product?.id) {
      setLoading(true);
      authFetch(`/api/admin/product/${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setProductDetail(data.product);
          } else {
            toast.error(data.message || "Gagal mengambil detail produk.");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Terjadi kesalahan saat mengambil detail produk.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Produk">
      {loading ? (
        <p className="text-center text-lg text-gray-700">
          Memuat detail produk...
        </p>
      ) : productDetail ? (
        <div className="space-y-6">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk:
            </label>
            <p className="text-lg text-gray-900">
              {productDetail.product_name}
            </p>
          </div>
          {/* Warna Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Produk:
            </label>
            <p className="text-lg text-gray-900">
              {productDetail.color ? productDetail.color : '-'}
            </p>
          </div>
          {/* Brand Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Produk:
            </label>
            <p className="text-lg text-gray-900">
              {productDetail.brand ? productDetail.brand : '-'}
            </p>
          </div>
          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori:
            </label>
            <p className="text-lg text-gray-900">
              {productDetail.category
                ? productDetail.category.category_name
                : "-"}
            </p>
          </div>
          {/* Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Asli:
              </label>
              <p className="text-lg text-gray-900">
                Rp {productDetail.original_price.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Diskon:
              </label>
              <p className="text-lg text-gray-900">
                {productDetail.sale_price
                  ? `Rp ${productDetail.sale_price.toLocaleString("id-ID")}`
                  : "-"}
              </p>
            </div>
          </div>
          {/* Ukuran, Stok, Berat */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ukuran:
              </label>
              <p className="text-lg text-gray-900">{productDetail.size}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok:
              </label>
              <p className="text-lg text-gray-900">{productDetail.stock}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berat (gram):
              </label>
              <p className="text-lg text-gray-900">{productDetail.weight}</p>
            </div>
          </div>
          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi:
            </label>
            <div
              className="prose max-w-none text-lg text-gray-900"
              dangerouslySetInnerHTML={{
                __html: productDetail.description || "",
              }}
            />
          </div>
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug:
            </label>
            <p className="text-lg text-gray-900">{productDetail.slug}</p>
          </div>
          {/* Gambar Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Produk:
            </label>
            {productDetail.images && productDetail.images.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {productDetail.images.map((img) => (
                  <img
                    key={img.id}
                    src={`/storage/${img.image}`}
                    alt={`Gambar Produk ${img.id}`}
                    className="w-48 h-48 object-cover rounded-md shadow-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-lg text-gray-900">Tidak ada gambar.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-700">
          Detail produk tidak tersedia.
        </p>
      )}
      {/* Tombol Tutup */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

export default ViewProductModal;
