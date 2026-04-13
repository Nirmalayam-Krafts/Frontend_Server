import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge } from "../../components/ui";
import {
  RevenueChart,
  LeadConversionChart,
  InventoryChart,
  HorizontalBarChart,
} from "../../components/charts";
import { useUIStore } from "../../store";
import { TrendingUp, Users, Box, AlertCircle } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useAuthContext } from "../../../context/Adminauth";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const normalizeArray = (value, nestedKey) => {
  if (Array.isArray(value)) return value;
  if (nestedKey && Array.isArray(value?.[nestedKey])) return value[nestedKey];
  return [];
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatCompactINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount || 0);
};

const formatPercentChange = (current, previous) => {
  if (!previous && !current) return "0% vs last month";
  if (!previous && current) return "+100% vs last month";
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}% vs last month`;
};

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildRevenueSeries = (orders) => {
  const now = new Date();
  const buckets = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      label: MONTH_LABELS[d.getMonth()],
      revenue: 0,
    });
  }

  for (const item of orders) {
    const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

    const amount = toNumber(item?.totalAmount ?? item?.paidAmount ?? 0);
    const hit = buckets.find(
      (bucket) =>
        bucket.monthIndex === createdAt.getMonth() &&
        bucket.year === createdAt.getFullYear()
    );

    if (hit) hit.revenue += amount;
  }

  return buckets.map((bucket) => ({
    month: bucket.label,
    revenue: Math.round(bucket.revenue),
  }));
};

const buildLeadFunnel = (leads) => {
  const total = leads.length;
  const contacted = leads.filter((lead) =>
    ["Contacted", "Interested", "Converted"].includes(String(lead?.status || ""))
  ).length;
  const converted = leads.filter((lead) => String(lead?.status || "") === "Converted").length;

  return [
    { name: "Total Leads", value: total },
    { name: "Contacted", value: contacted },
    { name: "Converted", value: converted },
  ];
};

const buildInventoryDistribution = (inventory) => {
  const byCategory = {
    STANDARD: 0,
    PREMIUM: 0,
    FOOD_GRADE: 0,
  };

  for (const item of inventory) {
    const category = String(item?.category || "").toUpperCase();
    const qty = Math.max(0, toNumber(item?.stockLevel));
    if (category === "PREMIUM") byCategory.PREMIUM += qty;
    else if (category === "FOOD_GRADE") byCategory.FOOD_GRADE += qty;
    else byCategory.STANDARD += qty;
  }

  const total = byCategory.STANDARD + byCategory.PREMIUM + byCategory.FOOD_GRADE;
  if (!total) {
    return [
      { name: "Standard", value: 0 },
      { name: "Premium", value: 0 },
      { name: "Food Grade", value: 0 },
    ];
  }

  return [
    { name: "Standard", value: Math.round((byCategory.STANDARD / total) * 100) },
    { name: "Premium", value: Math.round((byCategory.PREMIUM / total) * 100) },
    { name: "Food Grade", value: Math.round((byCategory.FOOD_GRADE / total) * 100) },
  ];
};

const normalizePercentagesTo100 = (values) => {
  const total = values.reduce((sum, item) => sum + item.raw, 0);
  if (!total) return values.map((item) => ({ ...item, percentage: 0 }));

  const withBase = values.map((item) => {
    const exact = (item.raw / total) * 100;
    const base = Math.floor(exact);
    return { ...item, exact, percentage: base };
  });

  let remainder = 100 - withBase.reduce((sum, item) => sum + item.percentage, 0);
  withBase.sort((a, b) => (b.exact - b.percentage) - (a.exact - a.percentage));
  let idx = 0;
  while (remainder > 0 && withBase.length > 0) {
    withBase[idx % withBase.length].percentage += 1;
    remainder -= 1;
    idx += 1;
  }

  return withBase;
};

const classifyPaperBucket = (text) => {
  const source = String(text || "").toLowerCase();
  if (source.includes("luxury") || source.includes("premium")) return "LUXURY";
  if (
    source.includes("industrial") ||
    source.includes("food") ||
    source.includes("f&b") ||
    source.includes("raw")
  ) {
    return "INDUSTRIAL";
  }
  return "STANDARD";
};

const buildPaperWeightSeries = (products, inventory) => {
  let standard = 0;
  let luxury = 0;
  let industrial = 0;

  for (const product of products) {
    const bucket = classifyPaperBucket(
      `${product?.name || ""} ${product?.category || ""} ${product?.sku || ""}`
    );
    if (bucket === "LUXURY") luxury += 1;
    else if (bucket === "INDUSTRIAL") industrial += 1;
    else standard += 1;
  }

  if (standard + luxury + industrial === 0) {
    for (const item of inventory) {
      const bucket = classifyPaperBucket(
        `${item?.category || ""} ${item?.productName || ""} ${item?.sku || ""}`
      );
      const qty = Math.max(0, toNumber(item?.stockLevel));
      if (bucket === "LUXURY") luxury += qty;
      else if (bucket === "INDUSTRIAL") industrial += qty;
      else standard += qty;
    }
  }

  const withPercents = normalizePercentagesTo100([
    {
      standard: "STANDARD KRAFT (75-150 GSM)",
      raw: standard,
      color: "#15803d",
    },
    {
      standard: "LUXURY BOARD (180-250 GSM)",
      raw: luxury,
      color: "#0284c7",
    },
    {
      standard: "INDUSTRIAL GRADE (200+ GSM)",
      raw: industrial,
      color: "#f59e0b",
    },
  ]);

  return withPercents.map((item) => ({
    standard: item.standard,
    percentage: item.percentage,
    color: item.color,
  }));
};

const mapRecentEnquiries = (leads) => {
  return [...leads]
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
    .slice(0, 5)
    .map((lead) => ({
      id: lead?._id,
      clientName: lead?.name || "Unknown",
      location:
        [lead?.delivery_city, lead?.delivery_state].filter(Boolean).join(", ") || "N/A",
      productType: lead?.product_category || "N/A",
      status: String(lead?.status || "New").toUpperCase(),
    }));
};

const Dashboard = () => {
  const { axiosInstance } = useAuthContext();
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

        const [leadsRes, ordersRes, inventoryRes, lowStockRes, productsRes] = await Promise.all([
          axiosInstance.get("/leads", { params: { page: 1, limit: 1000 } }),
          axiosInstance.get("/orders", { params: { page: 1, limit: 1000 } }),
          axiosInstance.get("/inventory/all"),
          axiosInstance.get("/inventory/alerts/low-stock"),
          axiosInstance.get("/products"),
        ]);

        const leads = normalizeArray(leadsRes?.data?.data, "leads");
        const orders = normalizeArray(ordersRes?.data?.data, "orders");
        const inventory = normalizeArray(inventoryRes?.data?.data);
        const lowStock = normalizeArray(lowStockRes?.data?.data);
        const products = normalizeArray(productsRes?.data?.data);

        const now = new Date();
        const thisMonth = monthStart(now);
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const thisMonthLeadCount = leads.filter((lead) => {
          const d = lead?.createdAt ? new Date(lead.createdAt) : null;
          return d && d >= thisMonth && d < nextMonth;
        }).length;

        const prevMonthLeadCount = leads.filter((lead) => {
          const d = lead?.createdAt ? new Date(lead.createdAt) : null;
          return d && d >= prevMonth && d < thisMonth;
        }).length;

        const activeOrders = orders.filter((order) =>
          ["Pending", "Confirmed", "Processing"].includes(String(order?.orderStatus || ""))
        );
        const pendingOrders = orders.filter((order) => String(order?.orderStatus || "") === "Pending").length;

        const thisMonthRevenue = orders
          .filter((order) => {
            const d = order?.createdAt ? new Date(order.createdAt) : null;
            return d && d >= thisMonth && d < nextMonth;
          })
          .reduce((sum, order) => sum + toNumber(order?.totalAmount), 0);

        const prevMonthRevenue = orders
          .filter((order) => {
            const d = order?.createdAt ? new Date(order.createdAt) : null;
            return d && d >= prevMonth && d < thisMonth;
          })
          .reduce((sum, order) => sum + toNumber(order?.totalAmount), 0);

        const kpiData = [
          {
            id: 1,
            title: "TOTAL LEADS",
            value: new Intl.NumberFormat("en-IN").format(leads.length),
            change: formatPercentChange(thisMonthLeadCount, prevMonthLeadCount),
            icon: "Users",
            color: "bg-primary-400",
          },
          {
            id: 2,
            title: "ACTIVE ORDERS",
            value: new Intl.NumberFormat("en-IN").format(activeOrders.length),
            change: `${pendingOrders} pending`,
            icon: "Package",
            color: "bg-blue-500",
          },
          {
            id: 3,
            title: "STOCK ALERTS",
            value: String(lowStock.length).padStart(2, "0"),
            change: lowStock.length > 0 ? "Needs replenishment" : "All healthy",
            icon: "AlertCircle",
            color: "bg-red-500",
          },
          {
            id: 4,
            title: "MONTHLY REVENUE",
            value: formatCompactINR(thisMonthRevenue),
            change: formatPercentChange(thisMonthRevenue, prevMonthRevenue),
            icon: "TrendingUp",
            color: "bg-green-600",
          },
        ];

        setKpis(kpiData);
        setRecentEnquiries(mapRecentEnquiries(leads));
        setChartData({
          revenue: buildRevenueSeries(orders),
          leadConversion: buildLeadFunnel(leads),
          inventory: buildInventoryDistribution(inventory),
          paperWeights: buildPaperWeightSeries(products, inventory),
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        showNotification("Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosInstance, showNotification]);

  const iconMap = {
    Users: Users,
    Package: TrendingUp,
    AlertCircle: AlertCircle,
    TrendingUp: TrendingUp,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your business overview.
          </p>
        </Motion.div>

        <Motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {kpis.map((kpi, idx) => {
            const Icon = iconMap[kpi.icon] || Box;
            return (
              <Motion.div
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
              </Motion.div>
            );
          })}
        </Motion.div>

        <Motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={chartData.revenue} />
          <LeadConversionChart data={chartData.leadConversion} />
        </Motion.div>

        <Motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InventoryChart data={chartData.inventory} />
          <HorizontalBarChart data={chartData.paperWeights} />
        </Motion.div>

        <Motion.div
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

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
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
                                : enquiry.status === "CONTACTED" || enquiry.status === "INTERESTED"
                                  ? "warning"
                                  : enquiry.status === "CONVERTED"
                                    ? "primary"
                                    : "secondary"
                            }
                          >
                            {enquiry.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href="/leads"
                            className="text-primary-600 text-sm font-medium hover:underline"
                          >
                            Open in Leads →
                          </a>
                        </td>
                      </tr>
                    ))}
                    {!recentEnquiries.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          No enquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
