import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckSquare,
  ClipboardCheck,
  MessageCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  ArrowRight,
  FileDown,
  Send,
  Eye,
} from "lucide-react";

const OrderActionsDashboard = ({
  orders = [],
  onViewOrder,
  onProcessOrder,
  onCompleteOrder,
  onCreateQuotation,
}) => {
  // Calculate order metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatusKey === "PENDING").length;
  const confirmedOrders = orders.filter((o) => o.orderStatusKey === "CONFIRMED").length;
  const processingOrders = orders.filter((o) => o.orderStatusKey === "PROCESSING").length;
  const completedOrders = orders.filter((o) => o.orderStatusKey === "COMPLETED").length;

  const pendingQuotations = orders.filter((o) => {
    const hasQuotation =
      !!o?.quotation?.quotationNumber ||
      ["sent", "approved"].includes(String(o?.quotation?.status || "").toLowerCase());
    return o?.orderStatusKey === "PENDING" && !hasQuotation;
  }).length;
  const totalRevenue = orders
    .filter((o) => o.orderStatusKey === "COMPLETED")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const actionCards = [
    {
      title: "Pending Orders",
      count: pendingOrders,
      description: "Require confirmation",
      icon: Clock,
      color: "amber",
      gradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
      action: "Review & Confirm",
    },
    {
      title: "Quotations Needed",
      count: pendingQuotations,
      description: "Generate price quotes",
      icon: FileText,
      color: "blue",
      gradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      action: "Create Quotes",
    },
    {
      title: "Processing Orders",
      count: processingOrders,
      description: "In production",
      icon: Package,
      color: "purple",
      gradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      action: "Track Progress",
    },
    {
      title: "Ready to Complete",
      count: confirmedOrders,
      description: "Confirmed & ready",
      icon: CheckSquare,
      color: "emerald",
      gradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700",
      action: "Mark Complete",
    },
  ];

  const quickStats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ClipboardCheck,
      color: "gray",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: CheckSquare,
      color: "emerald",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Completion Rate",
      value: totalOrders > 0 ? `${((completedOrders / totalOrders) * 100).toFixed(1)}%` : "0%",
      icon: TrendingUp,
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === "emerald"
                  ? "bg-emerald-100 text-emerald-600"
                  : stat.color === "green"
                  ? "bg-green-100 text-green-600"
                  : stat.color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {actionCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${card.gradient} rounded-2xl border ${card.borderColor} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
            onClick={() => {
              // Filter and show relevant orders
              if (card.title === "Pending Orders") {
                onViewOrder?.("PENDING");
              } else if (card.title === "Quotations Needed") {
                onViewOrder?.("PENDING_QUOTE");
              } else if (card.title === "Processing Orders") {
                onViewOrder?.("PROCESSING");
              } else if (card.title === "Ready to Complete") {
                onViewOrder?.("CONFIRMED");
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${card.textColor}`}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.count}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${card.iconColor}`} />
                <span className={`text-sm font-medium ${card.textColor}`}>
                  {card.count === 0 ? "All caught up!" : `${card.count} orders need attention`}
                </span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${card.iconColor} group-hover:gap-2 transition-all`}>
                {card.action}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onCreateQuotation?.()}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-700">Generate Quotes</p>
              <p className="text-xs text-blue-600">For pending orders</p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onViewOrder?.("PENDING")}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors group"
          >
            <CheckSquare className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-700">Confirm Orders</p>
              <p className="text-xs text-amber-600">Review & approve</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onViewOrder?.("PROCESSING")}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
          >
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-purple-700">Track Production</p>
              <p className="text-xs text-purple-600">Monitor progress</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderActionsDashboard;
