import React from "react";
import PropTypes from "prop-types";

const SummaryCard = ({
  title,
  value,
  icon,
  loading,
  iconBgColor,
  iconTextColor,
}) => {
  return (
    <div className="flex items-center rounded-lg bg-white p-4 shadow-sm">
      <div
        className={`mr-4 flex-shrink-0 rounded-full p-3 ${iconBgColor} ${iconTextColor}`}
      >
        {icon ? React.cloneElement(icon, { className: "h-6 w-6" }) : null}
      </div>
      <div className="flex-1">
        <p className="truncate text-sm font-medium text-slate-500">{title}</p>
        {loading ? (
          <div className="mt-1 h-6 w-3/4 animate-pulse rounded bg-slate-300"></div>
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value ?? "-"}</p>
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
