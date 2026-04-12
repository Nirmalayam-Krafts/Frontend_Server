import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  Tag,
  Layers3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Activity,
} from "lucide-react";
import { Badge } from "../ui";

const RawMaterialDetail = ({ material, onClose }) => {
  if (!material) return null;

  const availableStock = material.availableStock || 0;
  const reservedStock = material.reservedStock || 0;
  const availableForSale = Math.max(0, availableStock - reservedStock);
  const reorderPoint = material.reorderPoint || 0;
  const unitPrice = material.unitPrice || 0;
  const totalValue = availableStock * unitPrice;

  const getStockStatus = () => {
    if (availableStock <= reorderPoint * 0.5)
      return { label: "Critical", variant: "danger", color: "text-red-600" };
    if (availableStock <= reorderPoint)
      return { label: "Low Stock", variant: "warning", color: "text-amber-600" };
    if (availableStock <= reorderPoint * 1.5)
      return { label: "Medium", variant: "primary", color: "text-blue-600" };
    return { label: "Healthy", variant: "success", color: "text-emerald-600" };
  };

  const stockStatus = getStockStatus();

  const getTypeIcon = (type) => {
    const icons = {
      Paper: "📄",
      Handle: "🔗",
      Printing: "🎨",
      Adhesive: "🧴",
      Accessory: "🔧",
      Other: "📦",
    };
    return icons[type] || "📦";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{getTypeIcon(material.type)}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {material.name}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Code: {material.code}
                </span>
                <span className="flex items-center gap-1">
                  <Layers3 className="w-4 h-4" />
                  {material.type}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </div>

      {/* Stock Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Available Stock</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {availableStock.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Reserved</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reservedStock.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit} on hold</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Available for Sale</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {availableForSale.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">₹{unitPrice}/{material.unit}</p>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Material Code</span>
              <span className="font-semibold text-gray-900">{material.code}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Type</span>
              <span className="font-semibold text-gray-900">{material.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Unit</span>
              <span className="font-semibold text-gray-900">{material.unit}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Color</span>
              <span className="font-semibold text-gray-900">
                {material.color || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Status</span>
              <span>
                {material.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Pricing & Stock Levels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Pricing & Stock Levels
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Unit Price</span>
              <span className="font-semibold text-gray-900">
                ₹{unitPrice.toFixed(2)}/{material.unit}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reorder Point</span>
              <span className="font-semibold text-gray-900">
                {reorderPoint} {material.unit}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Minimum Stock</span>
              <span className="font-semibold text-gray-900">
                {material.minStock || 0} {material.unit}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Stock Value</span>
              <span className="font-bold text-emerald-600">
                ₹{totalValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Stock Health</span>
              <span className={`font-bold ${stockStatus.color}`}>
                {((availableStock / reorderPoint) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {material.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{material.description}</p>
        </div>
      )}

      {/* Stock History Timeline */}
      {material.stockHistory && material.stockHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Stock History ({material.stockHistory.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {material.stockHistory.slice(0, 10).map((history, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    history.action === "added" || history.action === "created"
                      ? "bg-emerald-100 text-emerald-600"
                      : history.action === "deducted"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {history.action === "added" || history.action === "created" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : history.action === "deducted" ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <Activity className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 capitalize">
                      {history.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(history.at || history.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Quantity:{" "}
                      <span className="font-medium">
                        {history.quantity} {material.unit}
                      </span>
                    </p>
                    <p>
                      Stock: {history.previousStock} → {history.newStock}{" "}
                      {material.unit}
                    </p>
                    {history.note && (
                      <p className="text-gray-500 italic">Note: {history.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>
          Created: {formatDate(material.createdAt)}
        </p>
        <p>
          Last Updated: {formatDate(material.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
};

export default RawMaterialDetail;
