import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import SummaryCard from "../components/Dashboard/SummaryCard";
import SalesChart from "../components/Dashboard/SalesChart";
import OrdersChart from "../components/Dashboard/OrdersChart";
import RecentOrders from "../components/Dashboard/RecentOrders";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaBoxOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getDashboardSummary } from "../services/dashboardApi";

const Dashboard = () => {
  const { authFetch } = useContext(AppContext);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });

  const fetchSummaryData = useCallback(
    async (params = {}) => {
      setLoadingSummary(true);
      setFetchError(null);
      try {
        const summaryData = await getDashboardSummary(authFetch, params);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        setFetchError(error.message || "Gagal memuat data rangkuman.");
        toast.error("Gagal memuat data rangkuman.");
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    document.title = "Dashboard Admin";
    fetchSummaryData();
  }, [fetchSummaryData]);

  const handleDateChange = (e) => {
    setDateFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSummaryData(dateFilter);
  };

  const handleClearFilters = () => {
    const initialDates = { start_date: "", end_date: "" };
    setDateFilter(initialDates);
    fetchSummaryData(initialDates);
  };

  let summaryContent;

  if (loadingSummary) {
    summaryContent = (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SummaryCard key={i} title="Memuat..." value="" loading={true} />
        ))}
      </div>
    );
  } else if (fetchError) {
    summaryContent = (
      <div className="rounded-md bg-red-100 p-4 text-center text-red-800">
        {" "}
        {fetchError}
      </div>
    );
  } else if (summary) {
    summaryContent = (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Penjualan"
          value={summary.formatted_total_sales ?? "-"}
          icon={<FaMoneyBillWave />}
          iconBgColor="bg-indigo-100"
          iconTextColor="text-indigo-600"
        />
        <SummaryCard
          title="Total Pesanan"
          value={summary.total_orders ?? 0}
          icon={<FaShoppingCart />}
          iconBgColor="bg-red-100"
          iconTextColor="text-red-600"
        />
        <SummaryCard
          title="Total Pengguna"
          value={summary.total_users ?? 0}
          icon={<FaUsers />}
          iconBgColor="bg-indigo-100"
          iconTextColor="text-indigo-600"
        />
        <SummaryCard
          title="Total Produk"
          value={summary.total_products ?? 0}
          icon={<FaBoxOpen />}
          iconBgColor="bg-red-100"
          iconTextColor="text-red-600"
        />
      </div>
    );
  } else {
    summaryContent = (
      <div className="text-center text-gray-500">
        Data rangkuman tidak tersedia.
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-indigo-900 md:text-3xl">
        {" "}
        Dashboard
      </h1>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {" "}
        <form onSubmit={handleFilterSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:items-end">
            <div>
              <label
                htmlFor="dash_start_date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Periode Mulai
              </label>
              <input
                type="date"
                id="dash_start_date"
                name="start_date"
                value={dateFilter.start_date}
                onChange={handleDateChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="dash_end_date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Periode Selesai
              </label>
              <input
                type="date"
                id="dash_end_date"
                name="end_date"
                value={dateFilter.end_date}
                onChange={handleDateChange}
                min={dateFilter.start_date || undefined}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>
            <div className="flex items-end gap-2 pt-5 md:pt-0 lg:col-span-2 xl:col-span-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Terapkan Periode
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                title="Reset Periode"
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mb-6">
        {summaryContent}
        {summary?.period && !loadingSummary && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            Data rangkuman untuk periode: {summary.period.start_date} s/d{" "}
            {summary.period.end_date}
          </p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
          {" "}
          {/* Added border */}
          <SalesChart
            startDate={dateFilter.start_date}
            endDate={dateFilter.end_date}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
          {" "}
          <OrdersChart
            startDate={dateFilter.start_date}
            endDate={dateFilter.end_date}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
        {" "}
        <RecentOrders
          startDate={dateFilter.start_date}
          endDate={dateFilter.end_date}
        />
      </div>
    </div>
  );
};

export default Dashboard;
