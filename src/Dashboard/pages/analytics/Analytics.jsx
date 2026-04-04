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
import { analyticsAPI } from "../../services/api";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const Analytics = () => {
  const showNotification = useUIStore((state) => state.showNotification);
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    leadConversion: [],
    inventory: [],
    paperWeights: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [revenueRes, leadRes, inventoryRes, paperRes] = await Promise.all(
          [
            analyticsAPI.getRevenueData(),
            analyticsAPI.getLeadConversionData(),
            analyticsAPI.getInventoryUtilization(),
            analyticsAPI.getPaperWeightData(),
          ],
        );

        if (
          revenueRes.success &&
          leadRes.success &&
          inventoryRes.success &&
          paperRes.success
        ) {
          setAnalyticsData({
            revenue: revenueRes.data,
            leadConversion: leadRes.data,
            inventory: inventoryRes.data,
            paperWeights: paperRes.data,
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
            {
              label: "Total Revenue",
              value: "₹45.2L",
              change: "+12.5% vs period",
            },
            {
              label: "Lead Conversion",
              value: "28%",
              change: "+3.2% vs period",
            },
            {
              label: "Avg Order Value",
              value: "₹18.5K",
              change: "+2.1% vs period",
            },
            {
              label: "Customer Growth",
              value: "+42",
              change: "+8 new this period",
            },
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
              Top Performing Categories
            </h3>
            <div className="space-y-3">
              {[
                { name: "Premium Leather", orders: 124, revenue: "₹8.2L" },
                { name: "Eco-Friendly Kraft", orders: 98, revenue: "₹5.6L" },
                { name: "Industrial Grade", orders: 76, revenue: "₹4.3L" },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-600">{cat.orders} orders</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {cat.revenue}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Segments
            </h3>
            <div className="space-y-3">
              {[
                { segment: "Enterprise", count: 12, retention: "94%" },
                { segment: "Mid-Market", count: 34, retention: "87%" },
                { segment: "SMB", count: 89, retention: "76%" },
              ].map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {seg.segment}
                    </p>
                    <p className="text-xs text-gray-600">
                      {seg.count} customers
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600">
                    {seg.retention}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Key Metrics
            </h3>
            <div className="space-y-3">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">
                  Avg Order Processing Time
                </p>
                <p className="text-lg font-bold text-gray-900">2.4 days</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Fulfillment Rate</p>
                <p className="text-lg font-bold text-green-600">98.2%</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Repeat Customer Rate</p>
                <p className="text-lg font-bold text-primary-600">67%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analytics;
