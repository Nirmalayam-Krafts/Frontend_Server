import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Select } from "../../components/ui";
import {
  RevenueChart,
  LeadConversionChart,
  InventoryChart,
  HorizontalBarChart,
} from "../../components/charts";
import { useUIStore } from "../../store";
import { analyticsAPI, financeAPI } from "../../services/api";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const DEFAULT_SUMMARY = {
  totalRevenue:    { value: "—", change: "" },
  conversionRate:  { value: "—", change: "" },
  avgOrderValue:   { value: "—", change: "" },
  customerGrowth:  { value: "—", change: "" },
};

const Analytics = () => {
  const showNotification = useUIStore((state) => state.showNotification);
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    leadConversion: [],
    inventory: [],
    paperWeights: [],
  });
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [financeData, setFinanceData] = useState({ income: 0, expense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [revenueRes, leadRes, inventoryRes, paperRes, summaryRes, financeRes] = await Promise.all([
          analyticsAPI.getRevenueData(),
          analyticsAPI.getLeadConversionData(),
          analyticsAPI.getInventoryUtilization(),
          analyticsAPI.getPaperWeightData(),
          analyticsAPI.getAnalyticsSummary(),
          financeAPI.getFinanceSummary(),
        ]);

        if (revenueRes.success && leadRes.success && inventoryRes.success && paperRes.success) {
          setAnalyticsData({
            revenue: revenueRes.data,
            leadConversion: leadRes.data,
            inventory: inventoryRes.data,
            paperWeights: paperRes.data,
          });
        }
        if (summaryRes.success) setSummary(summaryRes.data);
        if (financeRes.success) {
          setFinanceData({
            income:    financeRes.data.income    ?? 0,
            expense:   financeRes.data.expense   ?? 0,
            netProfit: financeRes.data.netProfit ?? 0,
          });
        }
      } catch (error) {
        showNotification("Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                Analytics & Insights
              </h1>
              <p className="text-gray-600">
                Comprehensive business metrics and performance insights.
              </p>
            </div>
            <Select
              options={[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
                { value: "1y", label: "Last year" },
              ]}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            { label: "Total Revenue",    value: summary.totalRevenue.value,   change: summary.totalRevenue.change },
            { label: "Lead Conversion",  value: summary.conversionRate.value,  change: summary.conversionRate.change },
            { label: "Avg Order Value",  value: summary.avgOrderValue.value,   change: summary.avgOrderValue.change },
            { label: "Customer Growth",  value: summary.customerGrowth.value,  change: summary.customerGrowth.change },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600 mt-2">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={analyticsData.revenue} />
          <LeadConversionChart data={analyticsData.leadConversion} />
        </motion.div>

        {/* Secondary Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InventoryChart data={analyticsData.inventory} />
          <HorizontalBarChart data={analyticsData.paperWeights} />
        </motion.div>

        {/* Additional Metrics */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory by Category
            </h3>
            <div className="space-y-3">
              {analyticsData.inventory.length > 0 ? (
                analyticsData.inventory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-600">Stock distribution</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {cat.value}%
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No inventory data</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Pipeline
            </h3>
            <div className="space-y-3">
              {analyticsData.leadConversion.length > 0 ? (
                analyticsData.leadConversion.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {stage.name}
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {stage.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No lead data</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Finance Overview
            </h3>
            <div className="space-y-3">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Income</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{financeData.income.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Expense</p>
                <p className="text-lg font-bold text-red-500">
                  ₹{financeData.expense.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className={`text-lg font-bold ${financeData.netProfit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                  ₹{financeData.netProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analytics;
