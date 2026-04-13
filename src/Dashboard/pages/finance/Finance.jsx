
import React from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge } from "../../components/ui";
import { RevenueChart } from "../../components/charts";
import { TrendingUp, AlertCircle, DollarSign, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useGetFinance } from "../../../../hook/finance";


const Finance = () => {
  const { data, isLoading, isError } = useGetFinance();
  // console.log("this is data", data);

  // If you want to display recent orders, you can fetch them with a separate hook or API call
  // For now, we focus on the finance stats from /finance/stats


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
        {!isLoading && !isError && data && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{data?.monthlyRevenue?.toLocaleString?.() ?? 0}
                    </p>
                  </div>
                  <div className="bg-green-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Pending Dues
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{data?.pendingDues?.toLocaleString?.() ?? 0}
                    </p>
                  </div>
                  <div className="bg-red-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Total Dispatched
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data?.totalDispatched?.toLocaleString?.() ?? 0}
                    </p>
                  </div>
                  <div className="bg-blue-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Payment Rate
                    </p>
                    <p className="text-2xl font-bold text-primary-600">
                      {data?.paymentRate ?? 0}%
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
        {isLoading && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}
        {isError && (
          <div className="text-center py-10 text-red-500">Failed to load finance data.</div>
        )}

        {/* Charts */}
        {!isLoading && !isError && data && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <RevenueChart data={data.revenueTrend || []} />
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Income vs Expense Ratio
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Income</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{data?.income?.toLocaleString?.() ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${data?.income && data?.expense ? Math.round((data.income / (data.income + data.expense)) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Expense</span>
                    <span className="text-sm font-bold text-gray-900">₹{data?.expense?.toLocaleString?.() ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${data?.income && data?.expense ? Math.round((data.expense / (data.income + data.expense)) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Net Profit
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{data?.netProfit?.toLocaleString?.() ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Orders section removed for now. Add a new hook/API call if needed. */}
      </div>
    </Layout>
  );
};

export default Finance;
