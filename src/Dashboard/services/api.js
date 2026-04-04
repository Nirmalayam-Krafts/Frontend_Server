import {
  mockDashboardData,
  mockLeads,
  mockInventory,
  mockOrders,
  mockFinance,
  mockChartData,
} from "../data/mockData";

// Delay helper
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard APIs
export const dashboardAPI = {
  async getKPIs() {
    await delay();
    return { success: true, data: mockDashboardData.kpis };
  },

  async getRecentEnquiries() {
    await delay();
    return { success: true, data: mockDashboardData.recentEnquiries };
  },

  async getLeadSource() {
    await delay();
    return { success: true, data: mockDashboardData.leadSource };
  },

  async getInventoryHealth() {
    await delay();
    return { success: true, data: mockDashboardData.inventoryHealth };
  },

  async getTodaysGoal() {
    await delay();
    return { success: true, data: mockDashboardData.todaysGoal };
  },

  async getDashboardData() {
    await delay(300);
    return {
      success: true,
      data: {
        kpis: mockDashboardData.kpis,
        recentEnquiries: mockDashboardData.recentEnquiries,
        leadSource: mockDashboardData.leadSource,
        inventoryHealth: mockDashboardData.inventoryHealth,
        todaysGoal: mockDashboardData.todaysGoal,
        activities: mockDashboardData.activities,
      },
    };
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
    await delay();
    return { success: true, data: mockFinance };
  },

  async getRevenueTrend() {
    await delay();
    return { success: true, data: mockChartData.revenueTrend };
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
    await delay();
    return { success: true, data: mockChartData.leadConversion };
  },

  async getInventoryUtilization() {
    await delay();
    return { success: true, data: mockChartData.inventoryUtilization };
  },

  async getPaperWeightData() {
    await delay();
    return { success: true, data: mockChartData.paperWeightStandards };
  },

  async getRevenueData() {
    await delay();
    return { success: true, data: mockChartData.revenueTrend };
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
