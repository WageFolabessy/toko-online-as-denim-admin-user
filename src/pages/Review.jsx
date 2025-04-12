import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import {
  FaEye,
  FaStar,
  FaRegStar,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
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
      console.error("Error fetching reviews:", error);
      const errorMessage = error.message || "Gagal memuat data ulasan.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
      setReviews([]);
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
  const closeDetailModal = () => {
    setSelectedReview(null);
    setIsDetailModalOpen(false);
  };

  const filteredReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          (review.user?.name &&
            review.user.name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (review.product?.product_name &&
            review.product.product_name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (review.review &&
            review.review.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [reviews, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    const handleFilterChange = (e) => {
      setFilterText(e.target.value);
    };

    return (
      <FilterComponent
        onFilter={handleFilterChange}
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
        sortable: false,
      },
      {
        name: "Pengguna",
        selector: (row) => row.user?.name ?? "N/A",
        sortable: true,
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Produk",
        selector: (row) => row.product?.product_name ?? "Produk Dihapus",
        sortable: true,
        minWidth: "180px",
        wrap: true,
      },
      {
        name: "Rating",
        selector: (row) => row.rating,
        cell: (row) => <RatingStars rating={row.rating} />,
        sortable: true,
        center: true,
        minWidth: "120px",
      },
      {
        name: "Ulasan",
        selector: (row) => row.review,
        cell: (row) => (
          <div className="text-xs w-full whitespace-normal" title={row.review}>
            {row.review || "-"}
          </div>
        ),
        minWidth: "250px",
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
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        sortable: true,
        minWidth: "130px",
      },
      {
        name: "Aksi",
        cell: (row) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => openDetailModal(row)}
              className="rounded p-1.5 text-indigo-600 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Lihat Detail Ulasan"
              aria-label={`Detail Ulasan untuk ${
                row.product?.product_name || ""
              }`}
            >
              <FaEye className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        center: true,
        minWidth: "80px",
      },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      table: {
        style: {
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        },
      },
      header: {
        style: {
          fontSize: "1.125rem",
          fontWeight: "600",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        },
      },
      subHeader: {
        style: {
          padding: "1rem 1rem 0.5rem 1rem",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        },
      }, // Style subHeader
      headRow: {
        style: {
          backgroundColor: "#f3f4f6",
          borderBottomWidth: "1px",
          minHeight: "40px",
        },
      },
      headCells: {
        style: {
          fontSize: "0.75rem",
          fontWeight: "600",
          padding: "0.5rem 1rem",
          color: "#4b5563",
          textTransform: "uppercase",
          "&:last-of-type": { justifyContent: "center" },
        },
      },
      cells: {
        style: {
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          color: "#1f2937",
          borderBottom: "1px solid #f3f4f6",
          minHeight: "50px",
          alignItems: "center",
        },
      }, // Align items center
      pagination: {
        style: {
          borderTop: "1px solid #e5e7eb",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
        },
      },
      noData: {
        style: { padding: "2rem", textAlign: "center", color: "#6b7280" },
      },
    }),
    []
  );

  const paginationOptions = useMemo(
    () => ({
      rowsPerPageText: "Baris per halaman:",
      rangeSeparatorText: "dari",
      selectAllRowsItem: true,
      selectAllRowsItemText: "Semua",
    }),
    []
  );

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Manajemen Ulasan Produk
        </h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md p-4">
        {loadingReviews ? (
          <div className="flex items-center justify-center p-10 text-gray-500">
            <FaSpinner className="animate-spin mr-3 text-xl" /> Memuat data
            ulasan...
          </div>
        ) : fetchError ? (
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
                    onClick={fetchReviews}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredReviews}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={paginationOptions}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-10 text-center text-gray-500">
                Tidak ada data ulasan ditemukan.
              </div>
            }
          />
        )}
      </div>

      {/* Modal Detail Ulasan */}
      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        reviewId={selectedReview?.id}
      />
    </div>
  );
};

export default Review;
