import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, EmptyState } from "../../components/ui";
import {
  RevenueChart,
  LeadConversionChart,
  InventoryChart,
  HorizontalBarChart,
} from "../../components/charts";
import { useUIStore } from "../../store";
import { dashboardAPI, analyticsAPI } from "../../services/api";
import { TrendingUp, Users, Box, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [kpis, setKpis] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    revenue: [],
    leadConversion: [],
    inventory: [],
    paperWeights: [],
  });
  const showNotification = useUIStore((state) => state.showNotification);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, revenueRes, leadConvRes, inventoryRes, paperRes] =
          await Promise.all([
            dashboardAPI.getDashboardData(),
            analyticsAPI.getRevenueData(),
            analyticsAPI.getLeadConversionData(),
            analyticsAPI.getInventoryUtilization(),
            analyticsAPI.getPaperWeightData(),
          ]);

        if (dashboardRes.success) {
          setKpis(dashboardRes.data.kpis);
          setRecentEnquiries(dashboardRes.data.recentEnquiries);
        }

        if (
          revenueRes.success &&
          leadConvRes.success &&
          inventoryRes.success &&
          paperRes.success
        ) {
          setChartData({
            revenue: revenueRes.data,
            leadConversion: leadConvRes.data,
            inventory: inventoryRes.data,
            paperWeights: paperRes.data,
          });
        }
      } catch (error) {
        showNotification("Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const iconMap = {
    Users: Users,
    Package: TrendingUp,
    AlertCircle: AlertCircle,
    TrendingUp: TrendingUp,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your business overview.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {kpis.map((kpi, idx) => {
            const Icon = iconMap[kpi.icon] || Box;
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-md hover:scale-105 transition-transform">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        {kpi.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">{kpi.change}</p>
                    </div>
                    <div
                      className={`${kpi.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={chartData.revenue} />
          <LeadConversionChart data={chartData.leadConversion} />
        </motion.div>

        {/* Secondary Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InventoryChart data={chartData.inventory} />
          <HorizontalBarChart data={chartData.paperWeights} />
        </motion.div>

        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Enquiries
              </h2>
              <a
                href="/leads"
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                View all enquiries
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      CLIENT NAME
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      PRODUCT TYPE
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {enquiry.clientName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {enquiry.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {enquiry.productType}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            enquiry.status === "NEW"
                              ? "success"
                              : enquiry.status === "CONTACTED"
                                ? "warning"
                                : "primary"
                          }
                        >
                          {enquiry.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-primary-600 text-sm font-medium hover:underline">
                          Contact →
                        </button>
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

export default Dashboard;
