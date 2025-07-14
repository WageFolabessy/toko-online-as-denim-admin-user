import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import { getDashboardRecentOrders } from "../../services/dashboardApi";

const FormattedPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};

FormattedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const StatusBadge = ({ status, type = "order" }) => {
  const statusText = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";

  let colorClass = "bg-slate-100 text-slate-800";
  const orderColors = {
    cancelled: "bg-red-100 text-red-800",
    awaiting_payment: "bg-yellow-100 text-yellow-800",
    pending: "bg-blue-100 text-blue-800",
    processed: "bg-purple-100 text-purple-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  // ... (Logika warna lainnya tetap sama, sudah cukup baik)
  const paymentColors = {
    /* ... */
  };
  const shipmentColors = {
    /* ... */
  };

  if (type === "order") colorClass = orderColors[status] || colorClass;
  // ... (sisa logika)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
  type: PropTypes.string,
};

const RecentOrders = ({ startDate, endDate }) => {
  const { authFetch } = useContext(AppContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const ordersData = await getDashboardRecentOrders(authFetch, params);
      setRecentOrders(ordersData);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
      const errorMessage = err.message || "Gagal memuat pesanan terbaru.";
      setError(errorMessage);
      toast.error(errorMessage);
      setRecentOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, startDate, endDate]);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "-";
    }
  };

  let content;

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center p-6 text-slate-500">
        <FaSpinner className="animate-spin mr-2" /> Memuat pesanan terbaru...
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-md bg-red-50 p-4 border border-red-200 text-red-700">
        <div className="flex items-start">
          <FaExclamationTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Gagal Memuat Data
            </h3>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchRecentOrders}
              className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  } else if (recentOrders.length === 0) {
    content = (
      <div className="p-6 text-center text-slate-500">
        Tidak ada pesanan terbaru untuk periode ini.
      </div>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="py-2.5 px-3 text-left font-semibold text-slate-600"
              >
                No. Pesanan
              </th>
              <th
                scope="col"
                className="py-2.5 px-3 text-left font-semibold text-slate-600"
              >
                Pelanggan
              </th>
              <th
                scope="col"
                className="py-2.5 px-3 text-left font-semibold text-slate-600"
              >
                Tanggal
              </th>
              <th
                scope="col"
                className="py-2.5 px-3 text-right font-semibold text-slate-600"
              >
                Total
              </th>
              <th
                scope="col"
                className="py-2.5 px-3 text-center font-semibold text-slate-600"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="py-3 px-3 whitespace-nowrap">
                  <Link
                    to={`/orders?search=${order.order_number}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    title={`Lihat detail pesanan ${order.order_number}`}
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                  {order.user?.name ?? "N/A"}
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                  {formatDateTime(order.created_at)}
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-right text-slate-700">
                  <FormattedPrice value={order.total_amount} />
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-center">
                  <StatusBadge status={order.status} type="order" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Pesanan Terbaru
      </h2>
      {content}
    </div>
  );
};

RecentOrders.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default RecentOrders;
