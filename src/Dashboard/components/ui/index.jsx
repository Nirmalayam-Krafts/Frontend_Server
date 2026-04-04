import React from "react";
import clsx from "clsx";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading,
  disabled,
  className,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:scale-95",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin mr-2">⏳</span>}
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export const Card = ({ children, className, ...props }) => (
  <div
    className={clsx(
      "bg-white rounded-lg border border-gray-200 shadow-card p-5 transition-all duration-200",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ children, variant = "primary", className }) => {
  const variants = {
    primary: "bg-primary-100 text-primary-700",
    secondary: "bg-secondary-100 text-secondary-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={clsx(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white",
          Icon && "pl-10",
          error ? "border-red-300" : "border-gray-300",
        )}
        {...props}
      />
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      className={clsx(
        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white",
        error ? "border-red-300" : "border-gray-300",
      )}
      {...props}
    >
      <option value="">Select an option</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export const Skeleton = ({ className }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded", className)} />
);

export const EmptyState = ({ title, description, icon: Icon, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </div>
);

export const LoadingSpinner = ({ size = "md" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={clsx("animate-spin text-primary-600", sizes[size])}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const Table = ({ columns, data, loading, onRowClick }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-8 text-center">
              <LoadingSpinner />
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-8 text-center text-gray-600"
            >
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const Modal = ({ isOpen, title, children, onClose, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Toast = ({ message, type = "success", onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slideIn",
        bgColors[type],
      )}
    >
      {message}
    </div>
  );
};

export const Pagination = ({ current, total, onPageChange }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        Previous
      </Button>
      {pages.map((page) => (
        <button
          key={page}
          className={clsx(
            "px-3 py-1 rounded text-sm font-medium transition-colors",
            page === current
              ? "bg-primary-600 text-white"
              : "border border-gray-300 text-gray-900 hover:bg-gray-50",
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
      >
        Next
      </Button>
    </div>
  );
};
