import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaEye, FaStar, FaRegStar } from "react-icons/fa";
import PropTypes from "prop-types";
import ReviewDetailModal from "../components/Review/ReviewDetailModal";
import FilterComponent from "../components/Review/FilterComponent";
import { AppContext } from "../context/AppContext";
import { getReviews } from "../services/reviewApi";

const RatingStars = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating ?? 0);
  return (
    <div className="flex items-center justify-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return starValue <= filledStars ? (
          <FaStar key={starValue} className="h-4 w-4 text-yellow-400" />
        ) : (
          <FaRegStar key={starValue} className="h-4 w-4 text-slate-300" />
        );
      })}
      <span className="ml-1.5 text-xs text-slate-500">
        ({rating?.toFixed(1) ?? "N/A"})
      </span>
    </div>
  );
};
RatingStars.propTypes = { rating: PropTypes.number };

const Review = () => {
  const { authFetch } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    setFetchError(null);
    try {
      const responseData = await getReviews(authFetch);
      setReviews(responseData.data || []);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data ulasan.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingReviews(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Manajemen Ulasan Produk";
    fetchReviews();
  }, [fetchReviews]);

  const openDetailModal = (review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  // --- INI BAGIAN YANG DIPERBAIKI ---
  const closeDetailModal = () => {
    setSelectedReview(null);
    setIsDetailModalOpen(false);
  };

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const filter = filterText.toLowerCase();
        return (
          review.user?.name?.toLowerCase().includes(filter) ||
          review.product?.product_name?.toLowerCase().includes(filter) ||
          review.review?.toLowerCase().includes(filter)
        );
      }),
    [reviews, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        width: "60px",
        center: true,
      },
      {
        name: "Pengguna",
        selector: (row) => row.user?.name ?? "N/A",
        sortable: true,
        wrap: true,
        minWidth: "160px",
      },
      {
        name: "Produk",
        selector: (row) => row.product?.product_name ?? "Produk Dihapus",
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Rating",
        selector: (row) => row.rating,
        cell: (row) => <RatingStars rating={row.rating} />,
        sortable: true,
        center: true,
        minWidth: "140px",
      },
      {
        name: "Ulasan",
        selector: (row) => row.review,
        cell: (row) => (
          <div className="text-sm w-full whitespace-normal" title={row.review}>
            {row.review || "-"}
          </div>
        ),
        minWidth: "300px",
        wrap: true,
      },
      {
        name: "Tanggal",
        selector: (row) => row.created_at,
        cell: (row) =>
          new Date(row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Lihat Detail Ulasan"
            >
              <FaEye className="h-5 w-5" />
            </button>
          </div>
        ),
        center: true,
        minWidth: "80px",
      },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      rows: {
        style: {
          minHeight: "60px",
          "&:not(:last-of-type)": { borderBottom: "1px solid #f1f5f9" },
        },
        highlightOnHoverStyle: {
          backgroundColor: "#f8fafc",
          borderBottomColor: "#f1f5f9",
        },
      },
      headRow: {
        style: {
          backgroundColor: "#f8fafc",
          minHeight: "56px",
          borderBottom: "1px solid #e2e8f0",
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#475569",
          textTransform: "uppercase",
          padding: "1rem",
        },
      },
      cells: {
        style: {
          fontSize: "0.875rem",
          color: "#334155",
          padding: "1rem",
          lineHeight: "1.5",
          alignItems: "flex-start",
        },
      },
      pagination: { style: { borderTop: "1px solid #e2e8f0" } },
      subHeader: { style: { padding: "1rem" } },
    }),
    []
  );

  const paginationOptions = useMemo(
    () => ({
      rowsPerPageText: "Baris per halaman:",
      rangeSeparatorText: "dari",
    }),
    []
  );

  return (
    <div className="space-y-6 mt-4">
      <h1 className="text-3xl font-bold text-slate-800">
        Manajemen Ulasan Produk
      </h1>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
        {loadingReviews ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data ulasan...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center text-red-600">
            Error: {fetchError}. Coba refresh halaman.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredReviews}
            pagination
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="py-16 text-center text-slate-500">
                Tidak ada data ulasan ditemukan.
              </div>
            }
          />
        )}
      </div>
      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        reviewId={selectedReview?.id}
      />
    </div>
  );
};

export default Review;
