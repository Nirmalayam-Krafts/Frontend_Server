import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge } from "../../components/ui";
import { RevenueChart, HorizontalBarChart } from "../../components/charts";
import { useUIStore } from "../../store";
import { financeAPI, ordersAPI } from "../../services/api";
import { TrendingUp, AlertCircle, DollarSign, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const Finance = () => {
  const showNotification = useUIStore((state) => state.showNotification);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [summaryRes, ordersRes, revenueRes] = await Promise.all([
          financeAPI.getFinanceSummary(),
          ordersAPI.getRecentOrders(5),
          financeAPI.getRevenueTrend(),
        ]);

        if (summaryRes.success) {
          setFinanceSummary(summaryRes.data);
        }
        if (ordersRes.success) {
          setRecentOrders(ordersRes.data);
        }
        if (revenueRes.success) {
          setChartData(revenueRes.data);
        }
      } catch (error) {
        showNotification("Failed to load finance data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const statusColors = {
    DELIVERED: "success",
    PROCESSING: "primary",
    DISPATCHED: "secondary",
    PENDING: "warning",
  };

  const paymentColors = {
    PAID: "success",
    PENDING: "danger",
    PARTIAL: "warning",
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finance & Revenue
          </h1>
          <p className="text-gray-600">
            Real-time tracking of orders and financial overview.
          </p>
        </motion.div>

        {/* KPI Cards */}
        {financeSummary && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {financeSummary.monthlyRevenue}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      {financeSummary.revenueChange}
                    </p>
                  </div>
                  <div className="bg-green-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Pending Dues
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {financeSummary.pendingDues}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      {financeSummary.duesCount}
                    </p>
                  </div>
                  <div className="bg-red-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Total Dispatched
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {financeSummary.totalDispatched}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {financeSummary.dispatchedChange}
                    </p>
                  </div>
                  <div className="bg-blue-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Payment Rate
                    </p>
                    <p className="text-2xl font-bold text-primary-600">92%</p>
                    <p className="text-xs text-green-600 mt-2">
                      ↑ 5% vs last month
                    </p>
                  </div>
                  <div className="bg-primary-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={chartData} />
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Income vs Expense Ratio
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Income</span>
                  <span className="text-sm font-bold text-gray-900">
                    ₹12.4L
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Expense</span>
                  <span className="text-sm font-bold text-gray-900">₹3.8L</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Net Profit
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹8.6L
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <a
                href="/orders"
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                View all →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ORDER ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      CLIENT
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      PAYMENT
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {order.clientName}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusColors[order.status]}>
                          {order.statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={paymentColors[order.paymentStatus]}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {order.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Finance;
