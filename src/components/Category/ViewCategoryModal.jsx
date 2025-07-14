import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getCategoryDetail } from "../../services/categoryApi";

const ViewCategoryModal = ({ isOpen, onClose, category }) => {
  const { authFetch } = useContext(AppContext);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!category?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCategoryDetail(authFetch, category.id);
        setCategoryDetails(data);
      } catch (err) {
        const errorMessage = err.message || "Gagal memuat detail kategori.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, category, authFetch]);

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

  const DetailItem = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800 sm:col-span-2 sm:mt-0">
        {value || "-"}
      </dd>
    </div>
  );

  let content;
  if (loading) {
    content = (
      <p className="py-8 text-center text-slate-500">Memuat detail...</p>
    );
  } else if (error) {
    content = <p className="py-8 text-center text-red-600">Error: {error}</p>;
  } else if (categoryDetails) {
    content = (
      <dl className="divide-y divide-slate-100">
        <DetailItem label="ID" value={categoryDetails.id} />
        <DetailItem
          label="Nama Kategori"
          value={categoryDetails.category_name}
        />
        {categoryDetails.slug && (
          <DetailItem label="Slug" value={categoryDetails.slug} />
        )}
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-medium text-slate-500">Gambar</dt>
          <dd className="mt-1 sm:col-span-2 sm:mt-0">
            {categoryDetails.image_url ? (
              <img
                src={categoryDetails.image_url}
                alt={categoryDetails.category_name || "Gambar"}
                className="h-32 w-32 rounded-md border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </dd>
        </div>
        <DetailItem
          label="Tanggal Dibuat"
          value={formatDateTime(categoryDetails.created_at)}
        />
        <DetailItem
          label="Terakhir Diperbarui"
          value={formatDateTime(categoryDetails.updated_at)}
        />
      </dl>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Kategori">
      <div className="min-h-[250px]">{content}</div>
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

ViewCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
};

export default ViewCategoryModal;
