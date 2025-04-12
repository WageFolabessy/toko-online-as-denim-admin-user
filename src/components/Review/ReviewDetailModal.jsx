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
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return starValue <= filledStars ? (
          <FaStar key={starValue} className="h-4 w-4 text-yellow-400" />
        ) : (
          <FaRegStar key={starValue} className="h-4 w-4 text-gray-300" />
        );
      })}
      <span className="ml-1.5 text-xs text-gray-500">
        ({rating?.toFixed(1) ?? "N/A"})
      </span>
    </div>
  );
};
RatingStars.propTypes = { rating: PropTypes.number };

const DetailItem = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    <dd
      className={`mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0 ${
        label === "Ulasan" ? "whitespace-pre-wrap" : ""
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
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Format Tanggal Salah";
    }
  };

  const fetchDetailsCallback = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setFetchError(null);
    setReviewDetail(null);
    try {
      const data = await getReviewDetail(authFetch, reviewId);
      setReviewDetail(data);
    } catch (err) {
      console.error("Error fetching review detail:", err);
      const errorMessage = err.message || "Gagal memuat detail ulasan.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [reviewId, authFetch]);

  useEffect(() => {
    if (isOpen && reviewId) {
      fetchDetailsCallback();
    }
    if (!isOpen) {
      setReviewDetail(null);
      setLoading(false);
      setFetchError(null);
    }
  }, [isOpen, reviewId, fetchDetailsCallback]);

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
        <span className="ml-3 text-gray-500">Memuat detail ulasan...</span>
      </div>
    );
  } else if (fetchError && !reviewDetail) {
    // Error saat fetch awal
    content = (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle
              className="h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Gagal Memuat Data
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{fetchError}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchDetailsCallback}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (reviewDetail) {
    content = (
      <div className="space-y-4">
        <dl className="text-sm divide-y divide-gray-100">
          <DetailItem label="ID Ulasan" value={reviewDetail.id} />
          <DetailItem label="Pengguna" value={reviewDetail.user?.name} />
          <DetailItem label="Email Pengguna" value={reviewDetail.user?.email} />
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
  } else if (!loading && isOpen) {
    content = (
      <div className="py-10 text-center text-gray-500">
        Gagal memuat data atau ulasan tidak ditemukan.
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Ulasan Produk"
      size="2xl"
    >
      <div className="min-h-[200px]">{content}</div>
      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:mt-6 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onClose}
          className="w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
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
  onSuccess: PropTypes.func, // Callback setelah delete (opsional)
};

export default ReviewDetailModal;
