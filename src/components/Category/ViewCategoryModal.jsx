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
      setCategoryDetails(null);

      try {
        const data = await getCategoryDetail(authFetch, category.id);
        setCategoryDetails(data);
      } catch (err) {
        console.error("Error fetching category detail:", err);
        const errorMessage = err.message || "Gagal memuat detail kategori.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && category) {
      fetchDetails();
    }

    if (!isOpen) {
      setCategoryDetails(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, category, authFetch]);

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

  const DetailItem = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 py-2 sm:py-2.5">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );

  let content;
  if (loading) {
    content = (
      <p className="py-6 text-center text-gray-500">Memuat detail...</p>
    );
  } else if (error) {
    content = <p className="py-6 text-center text-red-600">Error: {error}</p>;
  } else if (categoryDetails) {
    content = (
      <dl className="divide-y divide-gray-200">
        <DetailItem label="ID" value={categoryDetails.id} />
        <DetailItem
          label="Nama Kategori"
          value={categoryDetails.category_name}
        />
        {categoryDetails.slug && (
          <DetailItem label="Slug" value={categoryDetails.slug} />
        )}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 py-2 sm:py-2.5">
          <dt className="text-sm font-medium text-gray-500">Gambar</dt>
          <dd className="col-span-2 text-sm text-gray-900">
            {categoryDetails.image_url ? (
              <img
                src={categoryDetails.image_url} // Gunakan image_url dari resource
                alt={categoryDetails.category_name || "Gambar Kategori"}
                className="h-32 w-32 rounded-md border object-cover shadow-sm sm:h-40 sm:w-40"
                loading="lazy"
              />
            ) : (
              <span className="text-gray-500">-</span>
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
  } else {
    content = null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Kategori">
      <div className="min-h-[200px]">{content}</div>
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

ViewCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
};

export default ViewCategoryModal;
