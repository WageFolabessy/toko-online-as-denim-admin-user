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
  let colorClass = "bg-gray-100 text-gray-800";
  const orderColors = {
    cancelled: "bg-red-100 text-red-800",
    awaiting_payment: "bg-yellow-100 text-yellow-800",
    pending: "bg-blue-100 text-blue-800",
    processed: "bg-purple-100 text-purple-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-gray-100 text-gray-800",
  };
  const paymentColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    settlement: "bg-green-100 text-green-800",
    success: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    failure: "bg-red-100 text-red-800",
    expire: "bg-gray-100 text-gray-800",
    expired: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const shipmentColors = {
    pending: "bg-blue-100 text-blue-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
  };
  if (type === "order") colorClass = orderColors[status] || colorClass;
  else if (type === "payment") colorClass = paymentColors[status] || colorClass;
  else if (type === "shipment")
    colorClass = shipmentColors[status] || colorClass;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {statusText}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string, type: PropTypes.string };

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
      <div className="flex items-center justify-center p-6 text-gray-500">
        <FaSpinner className="animate-spin mr-2" /> Memuat pesanan terbaru...
      </div>
    );
  } else if (error) {
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
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchRecentOrders}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (recentOrders.length === 0) {
    content = (
      <div className="p-6 text-center text-gray-400">
        Tidak ada pesanan terbaru untuk periode ini.
      </div>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-2 px-3 text-left font-semibold text-gray-600"
              >
                No. Pesanan
              </th>
              <th
                scope="col"
                className="py-2 px-3 text-left font-semibold text-gray-600"
              >
                Pelanggan
              </th>
              <th
                scope="col"
                className="py-2 px-3 text-left font-semibold text-gray-600"
              >
                Tanggal
              </th>
              <th
                scope="col"
                className="py-2 px-3 text-right font-semibold text-gray-600"
              >
                Total
              </th>
              <th
                scope="col"
                className="py-2 px-3 text-center font-semibold text-gray-600"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 whitespace-nowrap">
                  {/* Ganti warna link ke Indigo */}
                  <Link
                    to="/orders" // Arahkan ke list orders
                    className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    title={`Lihat daftar pesanan (termasuk ${order.order_number})`}
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  {order.user?.name ?? "N/A"}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                  {formatDateTime(order.created_at)}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-right">
                  <FormattedPrice value={order.total_amount} />
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-center">
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
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
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
