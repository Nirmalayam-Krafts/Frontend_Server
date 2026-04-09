import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  FileText,
  Hash,
  Layers,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { Button } from "../ui";

const StockActionModal = ({ 
  isOpen, 
  onClose, 
  material, 
  stockToAdd, 
  setStockToAdd, 
  stockNote, 
  setStockNote, 
  onSubmit,
  loading = false 
}) => {
  if (!isOpen || !material) return null;

  const currentStock = Number(material.availableStock || 0);
  const addingStock = Number(stockToAdd || 0);
  const newStock = currentStock + addingStock;
  const stockValue = newStock * Number(material.unitPrice || 0);
  const reorderPoint = Number(material.reorderPoint || 0);
  const isAboveReorder = newStock >= reorderPoint;

  const getTypeIcon = (type) => {
    const icons = {
      Paper: <Layers className="w-12 h-12 text-emerald-600" />,
      Handle: <ArrowUpRight className="w-12 h-12 text-blue-600" />,
      Printing: <ClipboardList className="w-12 h-12 text-purple-600" />,
      Adhesive: <ArrowDownRight className="w-12 h-12 text-amber-600" />,
      Accessory: <Package className="w-12 h-12 text-pink-600" />,
      Other: <Package className="w-12 h-12 text-gray-600" />,
    };
    return icons[type] || <Package className="w-12 h-12 text-gray-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      {/* Material Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{getTypeIcon(material.type)}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{material.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded">
                {material.code}
              </span>
              <span>•</span>
              <span>{material.type}</span>
              <span>•</span>
              <span className="font-semibold">{material.unit}</span>
            </div>
          </div>
        </div>

        {/* Current Stock Overview */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-xl p-3 border border-emerald-100">
            <p className="text-xs text-gray-500 mb-1">Current Stock</p>
            <p className="text-2xl font-bold text-emerald-600">
              {currentStock.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Reorder Point</p>
            <p className="text-2xl font-bold text-blue-600">
              {reorderPoint.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-gray-500 mb-1">Unit Price</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{Number(material.unitPrice || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Addition Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          Add Stock Quantity
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Add <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={stockToAdd}
              onChange={(e) => setStockToAdd(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
              autoFocus
            />
          </div>

          {/* Stock Preview */}
          {addingStock > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              {/* New Stock Level */}
              <div className={`rounded-xl p-4 border-2 ${
                isAboveReorder 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">New Stock Level</span>
                  {isAboveReorder ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Above Reorder
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Below Reorder
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {newStock.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">{material.unit}</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {currentStock.toLocaleString()} + {addingStock.toLocaleString()} = {newStock.toLocaleString()} {material.unit}
                </div>
              </div>

              {/* Stock Value */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Total Stock Value</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  ₹{stockValue.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {newStock.toLocaleString()} {material.unit} × ₹{Number(material.unitPrice || 0).toFixed(2)}
                </p>
              </div>

              {/* Progress to Reorder */}
              {reorderPoint > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Progress to Reorder Point</span>
                    <span className="text-xs font-bold text-gray-900">
                      {Math.min((newStock / reorderPoint) * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        newStock >= reorderPoint ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min((newStock / reorderPoint) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Notes (Optional)
        </h4>
        <textarea
          rows={3}
          value={stockNote}
          onChange={(e) => setStockNote(e.target.value)}
          placeholder="e.g., Stock received from supplier, Purchase order #12345, Quality checked..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Add notes to track stock source, supplier info, or quality checks
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!addingStock || loading}
          loading={loading}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add {addingStock.toLocaleString()} {material.unit}
        </Button>
      </div>
    </motion.div>
  );
};

export default StockActionModal;
