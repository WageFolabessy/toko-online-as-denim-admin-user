import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { getDashboardOrdersData } from "../../services/dashboardApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const OrdersChart = ({ startDate, endDate }) => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { start_date: startDate, end_date: endDate };
      const chartData = await getDashboardOrdersData(authFetch, params);
      setData(chartData);
    } catch (err) {
      console.error("Error fetching orders chart data:", err);
      setError(err.message || "Gagal memuat data chart pesanan.");
      toast.error("Gagal memuat data chart pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, startDate, endDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  let content;

  if (isLoading) {
    content = (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        <FaSpinner className="animate-spin mr-2" /> Memuat chart...
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex h-[300px] items-center justify-center text-red-700">
        <FaExclamationTriangle className="mr-2 text-red-500" /> Error: {error}
      </div>
    );
  } else if (data.length === 0) {
    content = (
      <div className="flex h-[300px] items-center justify-center text-red-800 opacity-75">
        Tidak ada data pesanan untuk periode ini.
      </div>
    );
  } else {
    content = (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, bottom: 5, left: -10 }}
        >
          <CartesianGrid
            stroke="#fecaca"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`${value} Pesanan`, "Jumlah"]}
            labelFormatter={(label) => `Periode: ${label}`}
            contentStyle={{
              fontSize: 12,
              borderRadius: "0.375rem",
              boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
              background: "rgba(255, 255, 255, 0.9)",
              borderColor: "#fecaca",
            }}
            itemStyle={{ padding: "2px 0" }}
            cursor={{ fill: "rgba(239, 68, 68, 0.1)" }}
          />
          <Bar
            dataKey="value"
            name="Jumlah Pesanan"
            fill="#ef4444"
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-red-900 mb-4">
        Jumlah Pesanan per Bulan
      </h2>
      {content}
    </div>
  );
};

OrdersChart.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default OrdersChart;
