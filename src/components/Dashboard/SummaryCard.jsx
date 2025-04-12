import React from "react";
import PropTypes from "prop-types";

const SummaryCard = ({
  title,
  value,
  icon,
  loading,
  iconBgColor = "bg-indigo-100",
  iconTextColor = "text-indigo-600",
}) => {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={`mr-4 flex-shrink-0 rounded-full p-3 ${iconBgColor} ${iconTextColor}`}
      >
        {icon ? React.cloneElement(icon, { className: "h-6 w-6" }) : null}
      </div>
      <div className="flex-1">
        <p className="truncate text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="mt-1 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
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
  iconBgColor: PropTypes.string,
  iconTextColor: PropTypes.string,
};

export default SummaryCard;
