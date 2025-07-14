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
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    {isHtml ? (
      <dd
        className="prose prose-sm prose-slate col-span-2 mt-1 max-w-none sm:mt-0"
        dangerouslySetInnerHTML={{ __html: value || "-" }}
      />
    ) : (
      <dd className="col-span-2 mt-1 text-sm text-slate-800 sm:mt-0">
        {value ?? "-"}
      </dd>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!product?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getProductDetail(authFetch, product.id);
        setProductDetail(data);
      } catch (err) {
        toast.error(err.message || "Gagal memuat detail produk.");
        setError(err.message || "Gagal memuat detail produk.");
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchDetails();
  }, [isOpen, product, authFetch]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  let content;
  if (loading) {
    content = (
      <p className="py-8 text-center text-slate-500">Memuat detail...</p>
    );
  } else if (error) {
    content = <p className="py-8 text-center text-red-600">Error: {error}</p>;
  } else if (productDetail) {
    content = (
      <dl className="divide-y divide-slate-100">
        <DetailItem label="ID" value={productDetail.id} />
        <DetailItem label="Nama Produk" value={productDetail.product_name} />
        <DetailItem
          label="Kategori"
          value={productDetail.category?.category_name}
        />
        <DetailItem label="Brand" value={productDetail.brand} />
        <DetailItem
          label="Harga Asli"
          value={<FormattedPrice value={productDetail.original_price} />}
        />
        <DetailItem
          label="Harga Diskon"
          value={<FormattedPrice value={productDetail.sale_price} />}
        />
        <DetailItem label="Stok" value={productDetail.stock} />
        <DetailItem label="Berat" value={`${productDetail.weight} gram`} />
        <DetailItem label="Ukuran" value={productDetail.size} />
        <DetailItem label="Warna" value={productDetail.color} />
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
        <div className="py-3">
          <dt className="text-sm font-medium text-slate-500 mb-2">
            Gambar Produk
          </dt>
          <dd className="mt-1">
            {Array.isArray(productDetail.images) &&
            productDetail.images.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {productDetail.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image_url}
                      alt={`Gambar ${img.id}`}
                      className="h-28 w-28 rounded-md border border-slate-200 object-cover shadow-sm"
                    />
                    {img.is_primary && (
                      <span className="absolute bottom-1 right-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">-</p>
            )}
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Produk">
      <div className="min-h-[300px]">{content}</div>
      <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
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
