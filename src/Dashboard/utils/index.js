import * as XLSX from "xlsx";

/**
 * Format dates
 */
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  try {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    if (formatStr === "MMM dd, yyyy HH:mm") {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    }

    return `${month} ${day}, ${year}`;
  } catch {
    return date;
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

export const formatTimeAgo = (date) => {
  try {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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

import { getSystemGstConfigFromStorage } from "../../utils/gstConfig.js";

/**
 * Dynamic Tax and HSN Calculator / Fallback
 */
export const getProductTaxInfo = (product) => {
  const sysConfig = getSystemGstConfigFromStorage();
  if (!product) return { hsnCode: sysConfig.defaultHsnCode || "4819 40 00", gstRate: sysConfig.gstEnabled ? sysConfig.defaultGstRate : 0 };
  
  const category = String(product.category || product.productCategory || "").toLowerCase();
  const isKraftRoll = category.includes("roll");
  
  let hsn = product.hsnCode;
  let gst = product.gstRate;
  
  if (!hsn || hsn === "—" || hsn.trim() === "") {
    if (isKraftRoll) {
      const gsmVal = Number(product.gsm) || 0;
      if (gsmVal <= 150) {
        hsn = "4804 39 00";
      } else if (gsmVal < 225) {
        hsn = "4804 49 00";
      } else {
        hsn = "4804 59 00";
      }
    } else {
      // It's a paper bag - get width value from dimensions
      const widthVal = Number(product.dimensions?.width || (product.dimensions && product.dimensions.width)) || 0;
      const unit = String(product.dimensions?.unit || (product.dimensions && product.dimensions.unit) || "inch").toLowerCase();
      // conversion helper to centimeters
      const widthInCm = unit === "cm" ? widthVal : unit === "mm" ? widthVal / 10 : widthVal * 2.54;
      if (widthInCm >= 40) {
        hsn = "4819 30 00";
      } else {
        hsn = "4819 40 00";
      }
    }
  }
  
  if (gst == null || gst === "—" || String(gst).trim() === "") {
    gst = sysConfig.defaultGstRate ?? 5;
  }
  
  const finalGstRate = sysConfig.gstEnabled ? Number(gst) : 0;
  return { hsnCode: hsn, gstRate: finalGstRate };
};

export const exportToExcel = (headers, rows, filename = "export") => {
  try {
    const data = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const colWidths = headers.map((h, i) => {
      let maxLen = String(h || "").length;
      rows.forEach((r) => {
        const valLen = r[i] != null ? String(r[i]).length : 0;
        if (valLen > maxLen) maxLen = valLen;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 60) };
    });
    worksheet["!cols"] = colWidths;

    const cleanFilename = filename.replace(/\.(xlsx|xls|csv)$/i, "");
    XLSX.writeFile(workbook, `${cleanFilename}.xlsx`);
  } catch (err) {
    console.error("Excel export error:", err);
    exportToCSV(headers, rows, filename);
  }
};

export const exportToCSV = (headers, rows, filename = "export") => {
  const csvContent = [
    headers.map(h => `"${String(h || "").replace(/"/g, '""')}"`).join(","),
    ...rows.map(r => r.map(val => `"${val === null || val === undefined ? "" : String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanFilename = filename.replace(/\.(xlsx|xls|csv)$/i, "");
  a.download = `${cleanFilename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
