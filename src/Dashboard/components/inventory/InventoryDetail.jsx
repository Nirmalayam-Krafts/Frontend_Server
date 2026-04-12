import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Ruler,
  Layers3,
  Factory,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "../ui";

const InventoryDetail = ({ item, onClose }) => {
  if (!item) return null;

  const stockLevel = Number(item.stockLevel || 0);
  const reservedQuantity = Number(item.reservedQuantity || 0);
  const availableForSale = Math.max(0, stockLevel - reservedQuantity);
  const reorderPt = Number(item.reorderPt || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const sellingPrice = Number(item.sellingPricePerUnit || 0);
  const productionCost = Number(item.productionCostPerUnit || 0);
  const totalStockValue = Number(item.totalStockValue || stockLevel * unitPrice);
  const totalProducedBags = Number(item.totalProducedBags || 0);
  const totalProductionCost = Number(item.totalProductionCost || 0);

  const profitMargin = sellingPrice > 0 ? ((sellingPrice - productionCost) / sellingPrice) * 100 : 0;

  const getStockStatus = () => {
    if (stockLevel <= reorderPt * 0.5)
      return { label: "Critical", variant: "danger", color: "text-red-600" };
    if (stockLevel <= reorderPt)
      return { label: "Low Stock", variant: "warning", color: "text-amber-600" };
    if (stockLevel <= reorderPt * 1.5)
      return { label: "Medium", variant: "primary", color: "text-blue-600" };
    return { label: "Healthy", variant: "success", color: "text-emerald-600" };
  };

  const stockStatus = getStockStatus();

  const getCategoryColor = (category) => {
    const colors = {
      STANDARD: "bg-blue-100 text-blue-700",
      PREMIUM: "bg-purple-100 text-purple-700",
      FOOD_GRADE: "bg-emerald-100 text-emerald-700",
      RAW_MATERIAL: "bg-amber-100 text-amber-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
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
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {item.productName}
              </h2>
              <Badge className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                SKU: {item.sku}
              </span>
              {item.bagType && (
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {item.bagType}
                </span>
              )}
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
            <span className="text-sm font-medium">In Stock</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stockLevel.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{item.unit || "bags"}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Reserved</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reservedQuantity.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{item.unit || "bags"} on hold</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Available for Sale</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {availableForSale.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{item.unit || "bags"}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Stock Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalStockValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">@ ₹{unitPrice}/{item.unit || "bag"}</p>
        </div>
      </div>

      {/* Product Details & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Specifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Product Specifications
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">SKU</span>
              <span className="font-semibold text-gray-900">{item.sku}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Category</span>
              <Badge className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
            </div>
            {item.bagType && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Bag Type</span>
                <span className="font-semibold text-gray-900">{item.bagType}</span>
              </div>
            )}
            {item.bagColor && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Color</span>
                <span className="font-semibold text-gray-900">{item.bagColor}</span>
              </div>
            )}
            {item.bagSizeLabel && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Size Label</span>
                <span className="font-semibold text-gray-900">{item.bagSizeLabel}</span>
              </div>
            )}
            {item.dimensions && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  Dimensions
                </span>
                <span className="font-semibold text-gray-900">
                  {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} {item.dimensions.unit}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status</span>
              <span>
                {item.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Cost Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Pricing & Cost Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Cost Price</span>
              <span className="font-semibold text-gray-900">
                ₹{unitPrice.toFixed(2)}/{item.unit || "bag"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Selling Price</span>
              <span className="font-bold text-emerald-600">
                ₹{sellingPrice.toFixed(2)}/{item.unit || "bag"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Production Cost</span>
              <span className="font-semibold text-gray-900">
                ₹{productionCost.toFixed(2)}/{item.unit || "bag"}
              </span>
            </div>
            {sellingPrice > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="font-bold text-emerald-600">
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reorder Point</span>
              <span className="font-semibold text-gray-900">
                {reorderPt} {item.unit || "bags"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-emerald-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Stock Value</span>
              <span className="text-xl font-bold text-emerald-600">
                ₹{totalStockValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Details */}
      {totalProducedBags > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            Production Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-gray-600 mb-1">Total Produced</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalProducedBags.toLocaleString()} {item.unit || "bags"}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-600 mb-1">Total Production Cost</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{totalProductionCost.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-gray-600 mb-1">Avg Cost/Bag</p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{totalProducedBags > 0 ? (totalProductionCost / totalProducedBags).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Raw Materials Used */}
      {item.producedFromRawMaterials && item.producedFromRawMaterials.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers3 className="w-5 h-5 text-amber-600" />
            Raw Materials Used ({item.producedFromRawMaterials.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Qty/Bag
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Total Used
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.producedFromRawMaterials.map((material, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {material.rawMaterialName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {material.rawMaterialType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {material.requiredQuantityPerBag} {material.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {material.totalConsumedQuantity} {material.unit}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                      ₹{material.totalCost?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Stock History Timeline */}
      {item.stockHistory && item.stockHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Stock History ({item.stockHistory.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {item.stockHistory.slice(0, 10).map((history, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    history.action === "ADD" || history.action === "SET"
                      ? "bg-emerald-100 text-emerald-600"
                      : history.action === "REMOVE"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {history.action === "ADD" || history.action === "SET" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : history.action === "REMOVE" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Factory className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 capitalize">
                      {history.action.toLowerCase().replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(history.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Quantity:{" "}
                      <span className="font-medium">
                        {history.quantity} {item.unit || "bags"}
                      </span>
                    </p>
                    <p>
                      Stock: {history.previousStock} → {history.newStock}{" "}
                      {item.unit || "bags"}
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
          Created: {formatDate(item.createdAt)}
        </p>
        <p>
          Last Updated: {formatDate(item.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
};

export default InventoryDetail;
