import React from "react";
import PropTypes from "prop-types";

const SummaryCard = ({
  title,
  value,
  icon,
  loading,
  bgColor = "bg-indigo-100",
  iconBgColor = "bg-indigo-100",
  iconTextColor = "text-indigo-600",
  isWhiteBg = false,
}) => {
  const cardBgClass = isWhiteBg ? "bg-white" : "bg-gray-50";

  return (
    <div
      className={`flex items-center rounded-lg border border-gray-200 p-4 shadow-sm ${cardBgClass} ${bgColor}`}
    >
      <div
        className={`mr-4 flex-shrink-0 rounded-full p-3 ${iconBgColor} ${iconTextColor}`}
      >
        {icon ? React.cloneElement(icon, { className: "h-6 w-6" }) : null}
      </div>
      <div className="flex-1">
        <p className="truncate text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="mt-1 h-6 w-3/4 animate-pulse rounded bg-gray-300"></div>
        ) : (
          <p className="text-xl font-bold text-gray-900">{value ?? "-"}</p>
        )}
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.element,
  loading: PropTypes.bool,
  bgColor: PropTypes.string,
  iconBgColor: PropTypes.string,
  iconTextColor: PropTypes.string,
  isWhiteBg: PropTypes.bool,
};

export default SummaryCard;
