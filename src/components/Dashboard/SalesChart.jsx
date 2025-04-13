import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { getDashboardSalesData } from "../../services/dashboardApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const SalesChart = ({ startDate, endDate }) => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { start_date: startDate, end_date: endDate };
      const chartData = await getDashboardSalesData(authFetch, params);
      setData(chartData);
    } catch (err) {
      console.error("Error fetching sales chart data:", err);
      setError(err.message || "Gagal memuat data chart penjualan.");
      toast.error("Gagal memuat data chart penjualan.");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, startDate, endDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const formatCurrencyAxis = (value) => `Rp${(value / 1000000).toFixed(0)} Jt`;
  const formatCurrencyTooltip = (value) =>
    `Rp ${Number(value).toLocaleString("id-ID")}`;

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
      <div className="flex h-[300px] items-center justify-center text-indigo-800 opacity-75">
        Tidak ada data penjualan untuk periode ini.
      </div>
    );
  } else {
    content = (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: 50 }}
        >
          <CartesianGrid
            stroke="#c7d2fe"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis
            tickFormatter={formatCurrencyAxis}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            width={80}
          />
          <Tooltip
            formatter={(value) => [formatCurrencyTooltip(value), "Penjualan"]}
            labelFormatter={(label) => `Periode: ${label}`}
            contentStyle={{
              fontSize: 12,
              borderRadius: "0.375rem",
              boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
              background: "rgba(255, 255, 255, 0.9)",
              borderColor: "#c7d2fe",
            }}
            itemStyle={{ padding: "2px 0" }}
            cursor={{ stroke: "rgba(99, 102, 241, 0.3)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Penjualan"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: "#4338ca",
              stroke: "#c7d2fe",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-indigo-900 mb-4">
        Total Penjualan per Bulan
      </h2>
      {content}
    </div>
  );
};

SalesChart.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default SalesChart;
