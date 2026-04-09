import React from "react";
import { motion } from "framer-motion";
import {
  User2,
  Building2,
  Phone,
  Mail,
  ShoppingBag,
  Package,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Truck,
  CreditCard,
} from "lucide-react";
import { Badge } from "../ui";

const OrderDetail = ({ order, onClose }) => {
  if (!order) return null;

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

  const getOrderStatusConfig = (statusKey) => {
    const configs = {
      PENDING: { label: "Pending", color: "amber", icon: "⏳", variant: "warning" },
      PROCESSING: { label: "Processing", color: "blue", icon: "🔄", variant: "primary" },
      CONFIRMED: { label: "Confirmed", color: "emerald", icon: "✅", variant: "success" },
      COMPLETED: { label: "Completed", color: "purple", icon: "🎉", variant: "success" },
      CANCELLED: { label: "Cancelled", color: "red", icon: "❌", variant: "danger" },
    };
    return configs[statusKey] || configs.PENDING;
  };

  const getPaymentStatusConfig = (statusKey) => {
    const configs = {
      UNPAID: { label: "Unpaid", color: "red", icon: "❌", variant: "danger" },
      PARTIAL: { label: "Partial Paid", color: "amber", icon: "💰", variant: "warning" },
      PAID: { label: "Paid", color: "emerald", icon: "✅", variant: "success" },
    };
    return configs[statusKey] || configs.UNPAID;
  };

  const orderStatus = getOrderStatusConfig(order.orderStatusKey);
  const paymentStatus = getPaymentStatusConfig(order.paymentStatusKey);

  const totalAmount = Number(order.amount || order.totalAmount || 0);
  const paidAmount = Number(order.paidAmount || 0);
  const pendingAmount = totalAmount - paidAmount;
  const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const workflowSteps = [
    { key: "PENDING", label: "Pending", icon: "⏳" },
    { key: "CONFIRMED", label: "Confirmed", icon: "✅" },
    { key: "PROCESSING", label: "Processing", icon: "🔄" },
    { key: "COMPLETED", label: "Completed", icon: "🎉" },
  ];

  const currentStepIndex = workflowSteps.findIndex(step => step.key === order.orderStatusKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      {/* Header with Order Info */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order #{order.id || order._id?.slice(-6)}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.createdAt || order.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Source: {order.source || "Manual"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={orderStatus.variant} className="text-sm">
              {orderStatus.icon} {orderStatus.label}
            </Badge>
            <Badge variant={paymentStatus.variant} className="text-sm">
              {paymentStatus.icon} {paymentStatus.label}
            </Badge>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Order Progress</p>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-emerald-200" : ""}`}
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`text-xs font-semibold mt-2 ${
                        isCompleted ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        index < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer & Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User2 className="w-5 h-5 text-blue-600" />
            Customer Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
            </div>
            {order.businessName && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="font-semibold text-gray-900">{order.businessName}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{order.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{order.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Product Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <Package className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-emerald-600">Product Category</p>
                <p className="font-bold text-emerald-900 text-lg">{order.productCategory}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Bag Size</p>
                <p className="font-semibold text-gray-900">{order.orderDetails?.bagSize || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Color</p>
                <p className="font-semibold text-gray-900">{order.orderDetails?.color || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-bold text-blue-600 text-lg">{order.orderDetails?.quantity || 0} pcs</p>
              </div>
              {(order.orderDetails?.length || order.orderDetails?.width || order.orderDetails?.height) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Dimensions</p>
                  <p className="font-semibold text-gray-900">
                    {order.orderDetails?.length || 0}×{order.orderDetails?.width || 0}×{order.orderDetails?.height || 0} {order.orderDetails?.dimensionUnit || "inch"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Amount Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Payment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Paid Amount</p>
            <p className="text-3xl font-bold text-blue-700">₹{paidAmount.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-4 border-2 ${pendingAmount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <p className={`text-xs font-medium mb-1 ${pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {pendingAmount > 0 ? 'Pending Amount' : 'Fully Paid'}
            </p>
            <p className={`text-3xl font-bold ${pendingAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>
              ₹{Math.max(0, pendingAmount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Progress Bar */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
            <span className="text-sm font-bold text-emerald-600">{paymentProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
        </div>

        {order.paymentMode && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span>Payment Mode:</span>
            <span className="font-semibold">{order.paymentMode}</span>
          </div>
        )}
      </div>

      {/* Delivery Information */}
      {(order.deliveryAddress || order.deliveryDate || order.dispatchDate) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Delivery Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.deliveryAddress && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-xs text-purple-600">Delivery Address</p>
                  <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
                </div>
              </div>
            )}
            {order.deliveryDate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Delivery Date</p>
                <p className="font-semibold text-gray-900">{formatDate(order.deliveryDate)}</p>
              </div>
            )}
            {order.dispatchDate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Dispatch Date</p>
                <p className="font-semibold text-gray-900">{formatDate(order.dispatchDate)}</p>
              </div>
            )}
            {order.deliveryMode && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Delivery Mode</p>
                <p className="font-semibold text-gray-900 capitalize">{order.deliveryMode}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Order Notes
          </h3>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-gray-700 leading-relaxed">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>Created: {formatDate(order.createdAt)}</p>
        {order.updatedAt && <p>Last Updated: {formatDate(order.updatedAt)}</p>}
      </div>
    </motion.div>
  );
};

export default OrderDetail;
