import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Format dates
 */
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(d, formatStr);
  } catch {
    return date;
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

export const formatTimeAgo = (date) => {
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return date;
  }
};

/**
 * Format numbers
 */
export const formatNumber = (num) => {
  if (typeof num !== "number") return num;
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatCurrency = (num, currency = "INR") => {
  if (typeof num !== "number") return num;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(num);
};

export const formatPercent = (num, decimals = 1) => {
  if (typeof num !== "number") return num;
  return `${num.toFixed(decimals)}%`;
};

/**
 * String utilities
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const slugify = (str) => {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

/**
 * Validation utilities
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Array utilities
 */
export const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

export const unique = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
};

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};

export const sortBy = (arr, key, order = "asc") => {
  const sorted = [...arr].sort((a, b) => {
    if (a[key] < b[key]) return order === "asc" ? -1 : 1;
    if (a[key] > b[key]) return order === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
};

export const filterBy = (arr, key, value) => {
  return arr.filter((item) => item[key] === value);
};

/**
 * Object utilities
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
};

export const omit = (obj, keys) => {
  const keysSet = new Set(keys);
  return Object.keys(obj)
    .filter((key) => !keysSet.has(key))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
};

export const flatten = (obj, prefix = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flatten(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Deep clone
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
