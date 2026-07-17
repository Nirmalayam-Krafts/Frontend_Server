import React, { useEffect, useState, useMemo } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge, Button } from "../../components/ui";
import {
  RevenueChart,
  LeadConversionChart,
  InventoryChart,
  HorizontalBarChart,
} from "../../components/charts";
import { useUIStore } from "../../store";
import { 
  TrendingUp, 
  Users, 
  Box, 
  AlertCircle, 
  Package, 
  Bell, 
  Eye, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles, 
  ShoppingCart, 
  DollarSign 
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatFullINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatPercentChange = (current, previous) => {
  if (!previous && !current) return "0% vs last period";
  if (!previous && current) return "+100% vs last period";
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}% vs last period`;
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
  const showNotification = useUIStore((state) => state.showNotification);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    if (endDate && val > endDate) {
      showNotification("Start date cannot be after end date", "error");
      e.target.value = startDate;
      return;
    }
    setStartDate(val);
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    if (startDate && val < startDate) {
      showNotification("End date cannot be before start date", "error");
      e.target.value = endDate;
      return;
    }
    setEndDate(val);
  };

  const [kpis, setKpis] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Top Customers and Detail Modal
  const [topCustomers, setTopCustomers] = useState([]);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);

  // Stock alerts list & notifications list
  const [lowStockItems, setLowStockItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingConfirmationOrders, setPendingConfirmationOrders] = useState([]);

  const [chartData, setChartData] = useState({
    revenue: [],
    leadConversion: [],
    inventory: [],
    paperWeights: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [leadsRes, ordersRes, inventoryRes, lowStockRes, productsRes, financeRes, notificationsRes] = await Promise.all([
        axiosInstance.get("/leads", { params: { page: 1, limit: 1000 } }),
        axiosInstance.get("/orders", { params: { page: 1, limit: 1000 } }),
        axiosInstance.get("/inventory/all"),
        axiosInstance.get("/inventory/alerts/low-stock"),
        axiosInstance.get("/products"),
        axiosInstance.get("/finance/stats", { params: { from: startDate, to: endDate } }),
        axiosInstance.get("/notifications"),
      ]);

      const rawLeads = normalizeArray(leadsRes?.data?.data, "leads");
      const rawOrders = normalizeArray(ordersRes?.data?.data, "orders");
      const inventory = normalizeArray(inventoryRes?.data?.data);
      const rawLowStock = normalizeArray(lowStockRes?.data?.data);
      const products = normalizeArray(productsRes?.data?.data);
      const financeStats = financeRes?.data?.data ?? financeRes?.data ?? {};
      const rawNotifications = normalizeArray(notificationsRes?.data?.data?.notifications || notificationsRes?.data?.data);

      // Date range filtering
      let leads = rawLeads;
      let orders = rawOrders;
      let notificationsList = rawNotifications;
      let lowStock = rawLowStock;

      if (startDate) {
        const fromDate = new Date(startDate);
        leads = leads.filter(l => l?.createdAt && new Date(l.createdAt) >= fromDate);
        orders = orders.filter(o => o?.createdAt && new Date(o.createdAt) >= fromDate);
        notificationsList = notificationsList.filter(n => n?.createdAt && new Date(n.createdAt) >= fromDate);
      }
      if (endDate) {
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        leads = leads.filter(l => l?.createdAt && new Date(l.createdAt) <= toDate);
        orders = orders.filter(o => o?.createdAt && new Date(o.createdAt) <= toDate);
        notificationsList = notificationsList.filter(n => n?.createdAt && new Date(n.createdAt) <= toDate);
      }

      setNotifications(notificationsList.slice(0, 5));
      setLowStockItems(lowStock.slice(0, 5));

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
      const pendingOrders = orders.filter((order) => String(order?.orderStatus || "") === "Pending");
      setPendingConfirmationOrders(pendingOrders.slice(0, 5));

      // Use backend-aggregated monthly revenue for consistency with Finance page
      const thisMonthRevenue = toNumber(financeStats?.monthlyRevenue);

      // Calculate previous month change from revenue trend
      const revenueTrend = Array.isArray(financeStats?.revenueTrend) ? financeStats.revenueTrend : [];
      const prevMonthRevenue = revenueTrend.length >= 2 ? toNumber(revenueTrend[revenueTrend.length - 2]?.total) : 0;

      const kpiData = [
        {
          id: 1,
          title: "TOTAL LEADS",
          value: new Intl.NumberFormat("en-IN").format(leads.length),
          change: formatPercentChange(thisMonthLeadCount, prevMonthLeadCount),
          icon: "Users",
          color: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-100",
        },
        {
          id: 2,
          title: "ACTIVE ORDERS",
          value: new Intl.NumberFormat("en-IN").format(activeOrders.length),
          change: `${pendingOrders.length} pending confirmation`,
          icon: "Package",
          color: "bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-emerald-150",
        },
        {
          id: 3,
          title: "STOCK ALERTS",
          value: String(lowStock.length).padStart(2, "0"),
          change: lowStock.length > 0 ? "Needs replenishment" : "All healthy",
          icon: "AlertCircle",
          color: "bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-100",
        },
        {
          id: 4,
          title: "PERIOD REVENUE",
          value: formatCompactINR(thisMonthRevenue),
          change: formatPercentChange(thisMonthRevenue, prevMonthRevenue),
          icon: "TrendingUp",
          color: "bg-gradient-to-br from-green-500 to-green-600 shadow-green-100",
        },
      ];

      setKpis(kpiData);
      setRecentEnquiries(mapRecentEnquiries(leads));

      // ── High Paying Customers Logic ──────────────────────────────
      const customerMap = {};
      orders.forEach(o => {
        const key = String(o.phone || o.email || o.customerName || "Anonymous").trim();
        if (!customerMap[key]) {
          customerMap[key] = {
            customerName: o.customerName || "Unknown Client",
            businessName: o.businessName || "No Company",
            phone: o.phone || "—",
            email: o.email || "—",
            totalSpent: 0,
            ordersCount: 0,
            deliveryAddress: "No address recorded",
            ordersList: []
          };
        }
        if (o.delivery && o.delivery.deliveryAddress) {
          const d = o.delivery;
          customerMap[key].deliveryAddress = `${d.deliveryAddress || ""}${d.deliveryCity ? `, ${d.deliveryCity}` : ""}${d.deliveryState ? `, ${d.deliveryState}` : ""}`;
        }
        const amt = toNumber(o.totalAmount || o.totalInvoiceAmount || 0);
        customerMap[key].totalSpent += amt;
        customerMap[key].ordersCount += 1;
        customerMap[key].ordersList.push({
          id: o.id || o._id,
          reference: o.reference || (o.id || o._id || "").toString().slice(-6).toUpperCase(),
          status: o.orderStatus || "Processing",
          amount: amt,
          date: o.createdAt || o.date || new Date()
        });
      });

      const sortedCusts = Object.values(customerMap)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setTopCustomers(sortedCusts);

      const backendRevenue = revenueTrend.length > 0
        ? revenueTrend.map((item) => {
            let label = item.month || "";
            if (label.includes("-")) {
              const parts = label.split("-");
              const monthIdx = parseInt(parts[1], 10) - 1;
              label = MONTH_LABELS[monthIdx] || label;
            }
            return { month: label, revenue: Math.round(toNumber(item.total)) };
          })
        : buildRevenueSeries(orders);

      setChartData({
        revenue: backendRevenue,
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

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  const iconMap = {
    Users: Users,
    Package: Package,
    AlertCircle: AlertCircle,
    TrendingUp: TrendingUp,
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header and Date Filter */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              Eco-Packaging Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back! Here is your business overview at a glance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-150 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase">From</span>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={handleStartDateChange}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">To</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={handleEndDateChange}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>
        </Motion.div>

        {/* KPIs Summary Cards */}
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
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {kpi.title}
                      </p>
                      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {kpi.value}
                      </p>
                      <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                        {kpi.change}
                      </p>
                    </div>
                    <div
                      className={`${kpi.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </Motion.div>
            );
          })}
        </Motion.div>

        {/* ── BIRD'S EYE VIEW & ATTENTION PANEL ────────────────── */}
        <Motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          
          {/* Recent Live Notifications */}
          <Card className="flex flex-col h-[380px] justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Live Feed & Logs</h3>
              </div>
              <div className="space-y-3.5 overflow-y-auto max-h-[250px] pr-1">
                {notifications.map((notif, index) => (
                  <div key={index} className="flex gap-3 text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-base">{notif.type === "order" ? "📦" : notif.type === "lead" ? "👤" : "🔔"}</span>
                    <div>
                      <p className="font-bold text-gray-800">{notif.title}</p>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">{notif.description}</p>
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {!notifications.length && (
                  <p className="text-xs text-gray-400 text-center py-10">No live updates for this period.</p>
                )}
              </div>
            </div>
            <a href="/settings" className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-end gap-1 mt-2">
              View all notifications <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </Card>

          {/* Pending Confirmations & Dues */}
          <Card className="flex flex-col h-[380px] justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Pending Action Orders</h3>
              </div>
              <div className="space-y-3.5 overflow-y-auto max-h-[250px] pr-1">
                {pendingConfirmationOrders.map((ord, index) => (
                  <div key={index} className="flex items-center justify-between bg-amber-50/30 border border-amber-100 p-2.5 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{ord.customerName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Ref: #{ord.reference || ord._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-700">{formatFullINR(ord.totalAmount)}</p>
                      <a href="/orders" className="text-[10px] text-emerald-600 font-bold hover:underline block mt-0.5">
                        Process Order →
                      </a>
                    </div>
                  </div>
                ))}
                {!pendingConfirmationOrders.length && (
                  <p className="text-xs text-gray-400 text-center py-10">All current orders are verified and confirmed!</p>
                )}
              </div>
            </div>
            <a href="/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-end gap-1 mt-2">
              Go to Order manager <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </Card>

          {/* Stock Alerts Widget */}
          <Card className="flex flex-col h-[380px] justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <AlertCircle className="w-5 h-5 text-red-500 animate-bounce" />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Critical Stock Alerts</h3>
              </div>
              <div className="space-y-3.5 overflow-y-auto max-h-[250px] pr-1">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50/30 border border-red-100 p-2.5 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{item.productName || item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{item.stockLevel} {item.unit || "pcs"} left</p>
                      <span className="text-[10px] text-slate-500 block">Min req: {item.reorderLevel}</span>
                    </div>
                  </div>
                ))}
                {!lowStockItems.length && (
                  <p className="text-xs text-green-600 text-center py-10 font-medium">✓ All stock levels are sufficient!</p>
                )}
              </div>
            </div>
            <a href="/inventory" className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-end gap-1 mt-2">
              Open Inventory ledger <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </Card>
        </Motion.div>

        {/* ── HIGH PAYING CUSTOMERS SECTION ────────────────── */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b pb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">High Paying Customers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Customer / Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Contact info</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Orders Count</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total Revenue Contribution</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((cust, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{cust.customerName}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{cust.businessName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">
                        <p>📞 {cust.phone}</p>
                        <p className="mt-0.5">✉️ {cust.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900 font-semibold">{cust.ordersCount} orders</td>
                      <td className="px-4 py-4 text-sm text-right font-extrabold text-emerald-600">{formatFullINR(cust.totalSpent)}</td>
                      <td className="px-4 py-4 text-center">
                        <Button 
                          onClick={() => setSelectedCustomerDetail(cust)}
                          className="py-1 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-bold rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View details
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!topCustomers.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No customer transactions recorded in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Motion.div>

        {/* Charts & Trends */}
        <Motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={chartData.revenue} />
          <LeadConversionChart data={chartData.leadConversion} />
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InventoryChart data={chartData.inventory} />
        </Motion.div>

        {/* Recent Enquiries / Leads table */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Enquiries (Leads)
              </h2>
              <a
                href="/leads"
                className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1"
              >
                View all enquiries <ChevronRight className="w-3.5 h-3.5" />
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
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {enquiry.clientName}
                            </p>
                            <p className="text-xs text-gray-500">
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
                            className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-0.5"
                          >
                            Open in Leads <ExternalLink className="w-3 h-3 ml-0.5" />
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

      {/* ── HIGH PAYING CUSTOMERS INTERACTIVE MODAL ────────────────── */}
      <AnimatePresence>
        {selectedCustomerDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-gray-150 p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomerDetail.customerName}</h3>
                  <p className="text-xs text-emerald-600 font-bold">{selectedCustomerDetail.businessName}</p>
                </div>
                <button 
                  onClick={() => setSelectedCustomerDetail(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone number</p>
                  <p className="font-semibold text-gray-850 mt-0.5">{selectedCustomerDetail.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-gray-850 mt-0.5">{selectedCustomerDetail.email}</p>
                </div>
              </div>

              {/* Address detail box */}
              {selectedCustomerDetail.deliveryAddress && (
                <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl mb-6 text-sm">
                  <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Delivery Address</p>
                  <p className="font-bold text-gray-850 mt-1 leading-relaxed">{selectedCustomerDetail.deliveryAddress}</p>
                </div>
              )}

              {/* Past Transactions list */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  Order Transaction History ({selectedCustomerDetail.ordersList.length})
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedCustomerDetail.ordersList.map((ord, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3.5 rounded-xl hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`/orders?orderRef=${ord.reference}`}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                          >
                            Order #{ord.reference}
                          </a>
                          <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-gray-600">
                            {ord.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(ord.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-gray-900">{formatFullINR(ord.amount)}</p>
                        <a 
                          href={`/orders?orderRef=${ord.reference}`}
                          className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          Details <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close CTA */}
              <div className="flex justify-end border-t pt-4 mt-6">
                <Button 
                  onClick={() => setSelectedCustomerDetail(null)}
                  className="rounded-xl py-2 px-5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Close Details
                </Button>
              </div>

            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Dashboard;
