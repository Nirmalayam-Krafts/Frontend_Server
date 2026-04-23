import axios from "axios";
import { mockLeads, mockInventory, mockOrders } from "../data/mockData";

// Delay helper
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const failureResponse = (error, fallback) => ({
  success: false,
  error: getErrorMessage(error, fallback),
});

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

const getArrayPayload = (response, nestedKey) => {
  const payload = getPayload(response);
  if (Array.isArray(payload)) return payload;
  if (nestedKey && Array.isArray(payload?.[nestedKey])) return payload[nestedKey];
  return [];
};

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatCompactINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount || 0);

const formatPercentChange = (current, previous) => {
  if (!previous && !current) return "0% vs last month";
  if (!previous && current) return "+100% vs last month";
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}% vs last month`;
};

const normalizePercentagesTo100 = (values) => {
  const total = values.reduce((sum, item) => sum + item.raw, 0);
  if (!total) return values.map((item) => ({ ...item, percentage: 0 }));

  const withBase = values.map((item) => {
    const exact = (item.raw / total) * 100;
    const percentage = Math.floor(exact);
    return { ...item, exact, percentage };
  });

  let remainder = 100 - withBase.reduce((sum, item) => sum + item.percentage, 0);
  withBase.sort((a, b) => (b.exact - b.percentage) - (a.exact - a.percentage));

  let index = 0;
  while (remainder > 0 && withBase.length) {
    withBase[index % withBase.length].percentage += 1;
    remainder -= 1;
    index += 1;
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
    const quantity = Math.max(0, toNumber(item?.stockLevel));

    if (category === "PREMIUM") byCategory.PREMIUM += quantity;
    else if (category === "FOOD_GRADE") byCategory.FOOD_GRADE += quantity;
    else byCategory.STANDARD += quantity;
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
      const quantity = Math.max(0, toNumber(item?.stockLevel));

      if (bucket === "LUXURY") luxury += quantity;
      else if (bucket === "INDUSTRIAL") industrial += quantity;
      else standard += quantity;
    }
  }

  return normalizePercentagesTo100([
    { standard: "STANDARD KRAFT (75-150 GSM)", raw: standard, color: "#15803d" },
    { standard: "LUXURY BOARD (180-250 GSM)", raw: luxury, color: "#0284c7" },
    { standard: "INDUSTRIAL GRADE (200+ GSM)", raw: industrial, color: "#f59e0b" },
  ]).map((item) => ({
    standard: item.standard,
    percentage: item.percentage,
    color: item.color,
  }));
};

const formatMonthLabel = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    const monthIndex = Number(value.split("-")[1]) - 1;
    return MONTH_LABELS[monthIndex] || value;
  }
  return String(value || "");
};

const buildRevenueSeries = (financeStats) =>
  Array.isArray(financeStats?.revenueTrend)
    ? financeStats.revenueTrend.map((item) => ({
        month: formatMonthLabel(item?.month),
        revenue: Math.round(toNumber(item?.total ?? item?.revenue)),
      }))
    : [];

const mapRecentEnquiries = (leads) =>
  [...leads]
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

const buildLeadSource = (leads) => {
  const counts = leads.reduce((acc, lead) => {
    const source = String(lead?.source || "Unknown");
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const total = leads.length || 0;
  const converted = leads.filter((lead) => String(lead?.status || "") === "Converted").length;

  return {
    conversionRate: `${total ? Math.round((converted / total) * 100) : 0}%`,
    distribution: Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value })),
  };
};

const buildInventoryHealth = (inventory, lowStock) => {
  const totalUnits = inventory.reduce((sum, item) => sum + Math.max(0, toNumber(item?.stockLevel)), 0);
  const lowStockUnits = lowStock.reduce((sum, item) => sum + Math.max(0, toNumber(item?.stockLevel)), 0);
  const lowStockRatio = totalUnits ? Math.round((lowStockUnits / totalUnits) * 100) : 0;

  return {
    totalRolls: `${new Intl.NumberFormat("en-IN").format(totalUnits)} Units`,
    lowStockAlerts: `${lowStock.length} Items`,
    changePercentage: `${lowStockRatio}%`,
  };
};

const buildTodaysGoal = (orders) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const todaysOrders = orders.filter((order) => {
    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
    return createdAt && createdAt >= todayStart && createdAt < tomorrowStart;
  });

  const progressedOrders = todaysOrders.filter((order) =>
    ["Confirmed", "Processing", "Completed", "Delivered"].includes(String(order?.orderStatus || ""))
  );

  const percentage = todaysOrders.length
    ? Math.round((progressedOrders.length / todaysOrders.length) * 100)
    : 0;

  return {
    percentage: `${percentage}%`,
    description: todaysOrders.length
      ? `${progressedOrders.length} out of ${todaysOrders.length} orders progressed today`
      : "No new orders created today",
  };
};

const formatRelativeTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return "Just now";
};

const buildActivities = (leads, orders) => {
  const leadActivities = leads.slice(0, 3).map((lead) => ({
    id: `lead-${lead?._id || lead?.id}`,
    type: "lead_added",
    title: "New Lead Added",
    description: `${lead?.name || "Unknown"} - ${lead?.product_category || "Enquiry"}`,
    time: formatRelativeTime(lead?.createdAt),
    user: lead?.source || "System",
    createdAt: lead?.createdAt,
  }));

  const orderActivities = orders.slice(0, 3).map((order) => ({
    id: `order-${order?._id || order?.id}`,
    type: "order_status",
    title: "Order Updated",
    description: `${order?.customerName || "Customer"} - ${order?.orderStatus || "Pending"}`,
    time: formatRelativeTime(order?.createdAt),
    user: order?.source || "System",
    createdAt: order?.createdAt,
  }));

  return [...leadActivities, ...orderActivities]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6)
    .map(({ createdAt, ...item }) => item);
};

const buildKpis = (leads, orders, lowStock, financeStats) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthLeadCount = leads.filter((lead) => {
    const createdAt = lead?.createdAt ? new Date(lead.createdAt) : null;
    return createdAt && createdAt >= thisMonthStart;
  }).length;

  const prevMonthLeadCount = leads.filter((lead) => {
    const createdAt = lead?.createdAt ? new Date(lead.createdAt) : null;
    return createdAt && createdAt >= prevMonthStart && createdAt < thisMonthStart;
  }).length;

  const activeOrders = orders.filter((order) =>
    ["Pending", "Confirmed", "Processing"].includes(String(order?.orderStatus || ""))
  );
  const pendingOrders = orders.filter((order) => String(order?.orderStatus || "") === "Pending").length;

  const revenueTrend = Array.isArray(financeStats?.revenueTrend) ? financeStats.revenueTrend : [];
  const thisMonthRevenue = toNumber(financeStats?.monthlyRevenue);
  const prevMonthRevenue = toNumber(revenueTrend[revenueTrend.length - 2]?.total);

  return [
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
};

const fetchDashboardSnapshot = async () => {
  const [leadsRes, ordersRes, inventoryRes, lowStockRes, productsRes, financeRes] = await Promise.all([
    apiClient.get("/leads", { params: { page: 1, limit: 1000 } }),
    apiClient.get("/orders", { params: { page: 1, limit: 1000 } }),
    apiClient.get("/inventory/all"),
    apiClient.get("/inventory/alerts/low-stock"),
    apiClient.get("/products"),
    apiClient.get("/finance/stats"),
  ]);

  return {
    leads: getArrayPayload(leadsRes, "leads"),
    orders: getArrayPayload(ordersRes, "orders"),
    inventory: getArrayPayload(inventoryRes),
    lowStock: getArrayPayload(lowStockRes),
    products: getArrayPayload(productsRes),
    financeStats: getPayload(financeRes) || {},
  };
};

// Dashboard APIs
export const dashboardAPI = {
  async getKPIs() {
    try {
      const snapshot = await fetchDashboardSnapshot();
      return {
        success: true,
        data: buildKpis(
          snapshot.leads,
          snapshot.orders,
          snapshot.lowStock,
          snapshot.financeStats
        ),
      };
    } catch (error) {
      return failureResponse(error, "Failed to load dashboard KPIs");
    }
  },

  async getRecentEnquiries() {
    try {
      const leadsRes = await apiClient.get("/leads", { params: { page: 1, limit: 1000 } });
      return { success: true, data: mapRecentEnquiries(getArrayPayload(leadsRes, "leads")) };
    } catch (error) {
      return failureResponse(error, "Failed to load recent enquiries");
    }
  },

  async getLeadSource() {
    try {
      const leadsRes = await apiClient.get("/leads", { params: { page: 1, limit: 1000 } });
      return { success: true, data: buildLeadSource(getArrayPayload(leadsRes, "leads")) };
    } catch (error) {
      return failureResponse(error, "Failed to load lead source data");
    }
  },

  async getInventoryHealth() {
    try {
      const [inventoryRes, lowStockRes] = await Promise.all([
        apiClient.get("/inventory/all"),
        apiClient.get("/inventory/alerts/low-stock"),
      ]);
      return {
        success: true,
        data: buildInventoryHealth(
          getArrayPayload(inventoryRes),
          getArrayPayload(lowStockRes)
        ),
      };
    } catch (error) {
      return failureResponse(error, "Failed to load inventory health");
    }
  },

  async getTodaysGoal() {
    try {
      const ordersRes = await apiClient.get("/orders", { params: { page: 1, limit: 1000 } });
      return { success: true, data: buildTodaysGoal(getArrayPayload(ordersRes, "orders")) };
    } catch (error) {
      return failureResponse(error, "Failed to load today's goal");
    }
  },

  async getDashboardData() {
    try {
      const snapshot = await fetchDashboardSnapshot();
      return {
        success: true,
        data: {
          kpis: buildKpis(
            snapshot.leads,
            snapshot.orders,
            snapshot.lowStock,
            snapshot.financeStats
          ),
          recentEnquiries: mapRecentEnquiries(snapshot.leads),
          leadSource: buildLeadSource(snapshot.leads),
          inventoryHealth: buildInventoryHealth(snapshot.inventory, snapshot.lowStock),
          todaysGoal: buildTodaysGoal(snapshot.orders),
          activities: buildActivities(snapshot.leads, snapshot.orders),
        },
      };
    } catch (error) {
      return failureResponse(error, "Failed to load dashboard data");
    }
  },
};

// Leads APIs
export const leadsAPI = {
  async getLeads(filters = {}) {
    await delay();
    let leads = [...mockLeads];

    if (filters.status) {
      leads = leads.filter((l) => l.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.businessName.toLowerCase().includes(search),
      );
    }

    return { success: true, data: leads, total: leads.length };
  },

  async getLead(id) {
    await delay();
    const lead = mockLeads.find((l) => l.id === parseInt(id));
    if (!lead) {
      return { success: false, error: "Lead not found" };
    }
    return { success: true, data: lead };
  },

  async createLead(data) {
    await delay();
    const newLead = {
      id: mockLeads.length + 1,
      ...data,
      createdAt: new Date(),
    };
    mockLeads.unshift(newLead);
    return { success: true, data: newLead };
  },

  async updateLead(id, data) {
    await delay();
    const index = mockLeads.findIndex((l) => l.id === parseInt(id));
    if (index === -1) {
      return { success: false, error: "Lead not found" };
    }
    mockLeads[index] = { ...mockLeads[index], ...data };
    return { success: true, data: mockLeads[index] };
  },

  async deleteLead(id) {
    await delay();
    const index = mockLeads.findIndex((l) => l.id === parseInt(id));
    if (index === -1) {
      return { success: false, error: "Lead not found" };
    }
    const deleted = mockLeads.splice(index, 1)[0];
    return { success: true, data: deleted };
  },

  async exportLeadsCSV() {
    await delay();
    const csv =
      "name,business,product,status,date\n" +
      mockLeads
        .map(
          (l) =>
            `${l.name},${l.businessName},${l.productInterest},${l.status},${l.date}`,
        )
        .join("\n");
    return { success: true, data: csv };
  },
};

// Inventory APIs
export const inventoryAPI = {
  async getInventory(filters = {}) {
    await delay();
    let items = [...mockInventory];

    if (filters.category) {
      items = items.filter((i) => i.category === filters.category);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(search) ||
          i.sku.toLowerCase().includes(search),
      );
    }

    return { success: true, data: items, total: items.length };
  },

  async getItem(id) {
    await delay();
    const item = mockInventory.find((i) => i.id === parseInt(id));
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, data: item };
  },

  async createItem(data) {
    await delay();
    const newItem = {
      id: mockInventory.length + 1,
      ...data,
      createdAt: new Date(),
    };
    mockInventory.unshift(newItem);
    return { success: true, data: newItem };
  },

  async updateItem(id, data) {
    await delay();
    const index = mockInventory.findIndex((i) => i.id === parseInt(id));
    if (index === -1) {
      return { success: false, error: "Item not found" };
    }
    mockInventory[index] = { ...mockInventory[index], ...data };
    return { success: true, data: mockInventory[index] };
  },

  async deleteItem(id) {
    await delay();
    const index = mockInventory.findIndex((i) => i.id === parseInt(id));
    if (index === -1) {
      return { success: false, error: "Item not found" };
    }
    const deleted = mockInventory.splice(index, 1)[0];
    return { success: true, data: deleted };
  },

  async getLowStockAlerts() {
    await delay();
    const alerts = mockInventory
      .filter((i) => i.stockLevel < i.reorderPt)
      .map((i) => ({
        ...i,
        threshold: i.reorderPt,
      }));
    return { success: true, data: alerts };
  },
};

// Orders APIs
export const ordersAPI = {
  async getOrders(filters = {}) {
    await delay();
    let orders = [...mockOrders];

    if (filters.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(search) ||
          o.clientName.toLowerCase().includes(search),
      );
    }

    return { success: true, data: orders, total: orders.length };
  },

  async getOrder(id) {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) {
      return { success: false, error: "Order not found" };
    }
    return { success: true, data: order };
  },

  async createOrder(data) {
    await delay();
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    mockOrders.unshift(newOrder);
    return { success: true, data: newOrder };
  },

  async updateOrder(id, data) {
    await delay();
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) {
      return { success: false, error: "Order not found" };
    }
    mockOrders[index] = { ...mockOrders[index], ...data };
    return { success: true, data: mockOrders[index] };
  },

  async getRecentOrders(limit = 4) {
    await delay();
    return { success: true, data: mockOrders.slice(0, limit) };
  },
};

// Finance APIs
export const financeAPI = {
  async getFinanceSummary() {
    try {
      const response = await apiClient.get("/finance/stats");
      const payload = getPayload(response) || {};
      const revenueTrend = buildRevenueSeries(payload);

      return {
        success: true,
        data: {
          monthlyRevenue: toNumber(payload?.monthlyRevenue),
          pendingDues: toNumber(payload?.pendingDues),
          totalDispatched: toNumber(payload?.totalDispatched),
          paymentRate: toNumber(payload?.paymentRate),
          income: toNumber(payload?.income),
          expense: toNumber(payload?.expense),
          netProfit: toNumber(payload?.netProfit),
          revenueTrend,
          revenueChange: formatPercentChange(
            toNumber(payload?.monthlyRevenue),
            toNumber(payload?.revenueTrend?.[payload?.revenueTrend?.length - 2]?.total)
          ),
          duesCount: `${toNumber(payload?.pendingDues) > 0 ? "Outstanding dues" : "No pending dues"}`,
          dispatchedChange: `${toNumber(payload?.totalDispatched)} dispatched orders`,
        },
      };
    } catch (error) {
      return failureResponse(error, "Failed to load finance summary");
    }
  },

  async getRevenueTrend() {
    try {
      const response = await apiClient.get("/finance/stats");
      return { success: true, data: buildRevenueSeries(getPayload(response) || {}) };
    } catch (error) {
      return failureResponse(error, "Failed to load revenue trend");
    }
  },

  // eslint-disable-next-line no-unused-vars
  async getTransactions(_filters = {}) {
    await delay();
    let transactions = [];
    return { success: true, data: transactions };
  },
};

// Analytics APIs
export const analyticsAPI = {
  async getLeadConversionData() {
    try {
      const response = await apiClient.get("/leads", { params: { page: 1, limit: 1000 } });
      return { success: true, data: buildLeadFunnel(getArrayPayload(response, "leads")) };
    } catch (error) {
      return failureResponse(error, "Failed to load lead conversion data");
    }
  },

  async getInventoryUtilization() {
    try {
      const response = await apiClient.get("/inventory/all");
      return { success: true, data: buildInventoryDistribution(getArrayPayload(response)) };
    } catch (error) {
      return failureResponse(error, "Failed to load inventory utilization");
    }
  },

  async getPaperWeightData() {
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        apiClient.get("/products"),
        apiClient.get("/inventory/all"),
      ]);
      return {
        success: true,
        data: buildPaperWeightSeries(
          getArrayPayload(productsRes),
          getArrayPayload(inventoryRes)
        ),
      };
    } catch (error) {
      return failureResponse(error, "Failed to load paper weight data");
    }
  },

  async getRevenueData() {
    try {
      const response = await apiClient.get("/finance/stats");
      return { success: true, data: buildRevenueSeries(getPayload(response) || {}) };
    } catch (error) {
      return failureResponse(error, "Failed to load revenue data");
    }
  },
};

// Auth APIs
export const authAPI = {
  async login(email, password) {
    await delay(300);
    if (email && password) {
      return {
        success: true,
        data: {
          token: "mock-jwt-token",
          user: {
            id: 1,
            name: "Rajesh Kumar",
            email,
          },
        },
      };
    }
    return { success: false, error: "Invalid credentials" };
  },

  async getMe() {
    await delay();
    return {
      success: true,
      data: {
        id: 1,
        name: "Rajesh Kumar",
        email: "rajesh@nirmalyam.com",
        role: "admin",
      },
    };
  },

  async logout() {
    await delay();
    return { success: true };
  },
};
