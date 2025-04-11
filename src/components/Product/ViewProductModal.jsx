import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getProductDetail } from "../../services/productApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};
FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const DetailItem = ({ label, value, isHtml = false }) => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-1 py-2 sm:py-2.5">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    {isHtml ? (
      <dd
        className="prose prose-sm col-span-2 max-w-none text-gray-900"
        dangerouslySetInnerHTML={{ __html: value || "-" }}
      />
    ) : (
      <dd className="col-span-2 text-sm text-gray-900">{value ?? "-"}</dd>
    )}
  </div>
);
DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.element,
  ]),
  isHtml: PropTypes.bool,
};

const ViewProductModal = ({ isOpen, onClose, product }) => {
  const { authFetch } = useContext(AppContext);
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetailsCallback = useCallback(async () => {
    if (!product?.id) return;

    setLoading(true);
    setError(null);
    setProductDetail(null);

    try {
      // getProductDetail sekarang return object produk langsung
      const data = await getProductDetail(authFetch, product.id);
      setProductDetail(data);
    } catch (err) {
      console.error("Error fetching product detail:", err);
      const errorMessage = err.message || "Gagal memuat detail produk.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [product, authFetch]);

  useEffect(() => {
    if (isOpen && product) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setProductDetail(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, product, fetchDetailsCallback]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Tanggal tidak valid";
    }
  };

  let content;
  if (loading) {
    content = (
      <p className="py-6 text-center text-gray-500">Memuat detail...</p>
    );
  } else if (error) {
    content = <p className="py-6 text-center text-red-600">Error: {error}</p>;
  } else if (productDetail) {
    content = (
      <dl className="divide-y divide-gray-200">
        <DetailItem label="ID" value={productDetail.id} />
        <DetailItem label="Nama Produk" value={productDetail.product_name} />
        <DetailItem label="Slug" value={productDetail.slug} />
        <DetailItem
          label="Kategori"
          value={productDetail.category?.category_name}
        />
        <DetailItem label="Brand" value={productDetail.brand} />
        <DetailItem label="Warna" value={productDetail.color} />
        <DetailItem
          label="Harga Asli"
          value={<FormattedPrice value={productDetail.original_price} />}
        />
        <DetailItem
          label="Harga Diskon"
          value={<FormattedPrice value={productDetail.sale_price} />}
        />
        <DetailItem label="Ukuran" value={productDetail.size} />
        <DetailItem label="Stok" value={productDetail.stock} />
        <DetailItem label="Berat (gram)" value={productDetail.weight} />
        <DetailItem
          label="Deskripsi"
          value={productDetail.description}
          isHtml={true}
        />
        <DetailItem
          label="Tanggal Dibuat"
          value={formatDateTime(productDetail.created_at)}
        />
        <DetailItem
          label="Terakhir Diperbarui"
          value={formatDateTime(productDetail.updated_at)}
        />
        <div className="py-2 sm:py-2.5">
          <dt className="text-sm font-medium text-gray-500 mb-2">
            Gambar Produk
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {Array.isArray(productDetail.images) &&
            productDetail.images.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {productDetail.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image_url}
                      alt={`Gambar produk ${img.id}`}
                      className="h-24 w-24 rounded-md border object-cover shadow-sm sm:h-32 sm:w-32"
                      loading="lazy"
                    />
                    {img.is_primary && (
                      <span className="absolute bottom-1 right-1 rounded-sm bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">-</p>
            )}
          </dd>
        </div>
      </dl>
    );
  } else {
    content = null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Produk">
      <div className="min-h-[250px]">{content}</div>
      <div className="mt-5 flex justify-end border-t border-gray-200 pt-4 sm:mt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

ViewProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
};

export default ViewProductModal;
