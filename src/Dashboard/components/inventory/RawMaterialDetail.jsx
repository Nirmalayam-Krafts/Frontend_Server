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
  Calculator,
  Building2,
  Truck,
  UserCheck,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../ui";

// Helper: parse raw material stock history notes to identify product manufacturing consumption
const parseHistoryNote = (note) => {
  if (!note) return null;

  // Pattern A: "Used for manual stock addition (Add Stock) of 1 bags of KraftRoll"
  const patternA = /Used\s*for\s*manual\s*stock\s*addition\s*\(Add\s*Stock\)\s*of\s*([0-9.]+)\s*(\w+)\s*of\s*(.*?)$/i;

  // Pattern B: general deduction pattern
  const patternB = /Deducted\s*([0-9.]+)\s*(\w+)\s*for\s*(.*?)$/i;

  let match = note.match(patternA);
  if (match) {
    const rawUnit = match[2];
    const productName = match[3];
    // If it is a roll product but unit is bags, normalize to kg
    const unit = productName.toLowerCase().includes("roll") && rawUnit === "bags" ? "kg" : rawUnit;

    return {
      type: "PRODUCTION",
      quantity: match[1],
      unit,
      productName,
      description: `Stock deducted to manufacture ${match[1]} ${unit} of the product ${productName}.`
    };
  }

  match = note.match(patternB);
  if (match) {
    const rawUnit = match[2];
    const productName = match[3];
    const unit = productName.toLowerCase().includes("roll") && rawUnit === "bags" ? "kg" : rawUnit;

    return {
      type: "PRODUCTION_GENERIC",
      quantity: match[1],
      unit,
      productName,
      description: `Consumed ${match[1]} ${unit} for product ${productName}.`
    };
  }

  return null;
};

const RawMaterialDetail = ({ material, onClose }) => {
  const [expandedIndex, setExpandedIndex] = React.useState(null);
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
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
            {availableStock.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Reserved</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
            {reservedStock.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit} on hold</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Available for Sale</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
            {availableForSale.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{material.unit}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Value</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
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

      {/* Itemized Purchase Cost Breakdown */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border border-emerald-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-700" />
          Itemized Purchase Cost Breakdown
        </h3>

        <div className="bg-white rounded-xl p-4 border border-emerald-100 space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Base Material Cost</span>
            <span className="font-semibold text-gray-900">
              {availableStock} {material.unit} × ₹{(material.baseRate || material.unitPrice || 0).toFixed(2)}/{material.unit} = <strong className="text-emerald-700">₹{(material.baseAmount || (availableStock * (material.baseRate || material.unitPrice || 0))).toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Transport / Freight Charges
            </span>
            <span className="font-semibold text-gray-900">+ ₹{(material.transportCharges || 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Labor / Handling Charges
            </span>
            <span className="font-semibold text-gray-900">+ ₹{(material.laborCharges || 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              GST Tax Charges ({material.isGstApplicable ? `${material.gstRate || 18}%` : "Disabled / 0%"})
            </span>
            <span className="font-semibold text-emerald-700">
              + ₹{(material.isGstApplicable ? (material.gstAmount || ((material.baseAmount || (availableStock * (material.baseRate || material.unitPrice || 0))) * ((material.gstRate || 18) / 100))) : 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-200 text-base">
            <span className="font-bold text-gray-900">Total Landed Stock Price</span>
            <span className="font-extrabold text-emerald-700 text-xl">
              ₹{(material.totalPurchaseCost || (availableStock * unitPrice) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
            <span>Effective Landed Unit Rate</span>
            <span className="font-bold text-gray-900 bg-emerald-100 px-3 py-1.5 rounded-lg text-sm border border-emerald-300">
              ₹{unitPrice.toFixed(2)} / {material.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Audit Details */}
      {(material.supplierName || material.supplierGstin || material.supplierAddress) && (
        <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-700" />
            Supplier Audit Records
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                🏢 Supplier Business Name
              </span>
              <span className="font-bold text-gray-900">{material.supplierName || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                📄 Supplier GSTIN
              </span>
              <span className="font-bold text-gray-900">{material.supplierGstin || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                📍 Supplier Address
              </span>
              <span className="font-semibold text-gray-800">{material.supplierAddress || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                📞 Supplier Phone / Contact
              </span>
              <span className="font-semibold text-gray-800">{material.supplierPhone || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Timeline */}
      {material.stockHistory && material.stockHistory.length > 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            Stock History ({material.stockHistory.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {material.stockHistory.slice(0, 10).map((history, index) => {
              const isExpanded = expandedIndex === index;
              const parsed = parseHistoryNote(history.note);

              return (
                <div key={index} className="border border-gray-150 rounded-md overflow-hidden bg-white">
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="flex items-start gap-3 p-2.5 hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        history.action === "added" || history.action === "created"
                          ? "bg-emerald-100 text-emerald-600"
                          : history.action === "deducted"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {history.action === "added" || history.action === "created" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : history.action === "deducted" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-gray-950 text-xs capitalize">
                          {history.action}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {formatDate(history.at || history.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center justify-between">
                        <span>
                          Quantity: <strong className="font-bold text-gray-900">{history.quantity} {material.unit}</strong>
                          <span className="text-gray-400 mx-2">|</span>
                          Stock: {history.previousStock} → {history.newStock} {material.unit}
                        </span>
                        <span className="text-[9px] font-bold text-blue-600 hover:underline">
                          {isExpanded ? "Less ▲" : "Details ▼"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail card */}
                  {isExpanded && (
                    <div className="bg-gray-50/75 border-t border-gray-150 p-3 text-xs text-gray-800 space-y-2">
                      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-1 mb-1 font-bold text-[10px] text-gray-500 uppercase tracking-wider">
                        <span>📝</span> Action Details
                      </div>

                      {parsed ? (
                        <div className="space-y-1.5 leading-relaxed font-medium">
                          {parsed.type === "PRODUCTION" && (
                            <>
                              <p className="text-gray-950">
                                🔧 This stock was **consumed automatically** during production of linked inventory items:
                              </p>
                              <div className="bg-white border border-gray-205 rounded p-2 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Target Product</span>
                                  <strong className="text-gray-900 font-bold">{parsed.productName}</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Units Produced</span>
                                  <strong className="text-gray-950 font-bold">{parsed.quantity} {parsed.unit}</strong>
                                </div>
                                <div className="col-span-2 border-t border-gray-100 pt-1 text-[11px] text-gray-600">
                                  {parsed.description}
                                </div>
                              </div>
                            </>
                          )}
                          {parsed.type === "PRODUCTION_GENERIC" && (
                            <p className="text-gray-950">
                              {parsed.description} (Target: <strong className="font-bold">{parsed.productName}</strong>)
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 text-gray-650 leading-relaxed font-semibold">
                          <p>
                            <span className="font-bold text-gray-500">Action:</span> {history.action.toUpperCase()}
                          </p>
                          <p>
                            <span className="font-bold text-gray-500">Transferred:</span> {history.quantity} {material.unit}
                          </p>
                          {history.note && (
                            <p className="text-gray-700 bg-white border border-gray-200 rounded p-2 italic mt-1 font-medium">
                              Note: {history.note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
