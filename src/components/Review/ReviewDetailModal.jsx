import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { getReviewDetail } from "../../services/reviewApi";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

const RatingStars = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating ?? 0);
  return (
    <div className="flex items-center">
      {/* --- INI BAGIAN YANG DIPERBAIKI --- */}
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1; // Deklarasikan variabel di sini
        return starValue <= filledStars ? (
          <FaStar key={index} className="h-4 w-4 text-yellow-400" />
        ) : (
          <FaRegStar key={index} className="h-4 w-4 text-slate-300" />
        );
      })}
      <span className="ml-1.5 text-xs text-slate-500">
        ({rating?.toFixed(1) ?? "N/A"})
      </span>
    </div>
  );
};
RatingStars.propTypes = { rating: PropTypes.number };

const DetailItem = ({ label, value }) => (
  <div className="py-3 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd
      className={`col-span-2 text-sm text-slate-800 ${
        label === "Ulasan" ? "whitespace-pre-wrap" : "break-words"
      }`}
    >
      {value ?? "-"}
    </dd>
  </div>
);
DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.element,
  ]),
};

const ReviewDetailModal = ({ isOpen, onClose, reviewId }) => {
  const { authFetch } = useContext(AppContext);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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

  const fetchDetailsCallback = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getReviewDetail(authFetch, reviewId);
      setReviewDetail(data);
    } catch (err) {
      setFetchError(err.message || "Gagal memuat detail ulasan.");
      toast.error(err.message || "Gagal memuat detail ulasan.");
    } finally {
      setLoading(false);
    }
  }, [reviewId, authFetch]);

  useEffect(() => {
    if (isOpen) fetchDetailsCallback();
  }, [isOpen, fetchDetailsCallback]);

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-slate-500">Memuat detail ulasan...</span>
      </div>
    );
  } else if (fetchError) {
    content = (
      <div className="rounded-md bg-red-50 p-4 text-red-700 text-center">
        <FaExclamationTriangle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2">{fetchError}</p>
        <button
          onClick={fetchDetailsCallback}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (reviewDetail) {
    content = (
      <div>
        <dl className="divide-y divide-slate-100">
          <DetailItem label="ID Ulasan" value={reviewDetail.id} />
          <DetailItem label="Pengguna" value={reviewDetail.user?.name} />
          <DetailItem
            label="Produk"
            value={reviewDetail.product?.product_name}
          />
          <DetailItem
            label="Rating"
            value={<RatingStars rating={reviewDetail.rating} />}
          />
          <DetailItem
            label="Tanggal Ulasan"
            value={formatDateTime(reviewDetail.created_at)}
          />
          <DetailItem label="Ulasan" value={reviewDetail.review} />
        </dl>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Ulasan Produk">
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

ReviewDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reviewId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReviewDetailModal;
