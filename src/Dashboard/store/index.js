import { create } from "zustand";

// Auth Store
export const useAuthStore = create((set) => ({
  user: {
    id: "user-1",
    name: "Rajesh Kumar",
    email: "rajesh@nirmalyam.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh",
    department: "Operations Manager",
  },
  isAuthenticated: true,
  login: (email) => {
    // Mock login
    set({
      user: {
        id: "user-1",
        name: "Rajesh Kumar",
        email,
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh",
        department: "Operations Manager",
      },
      isAuthenticated: true,
    });
  },
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));

// UI Store
export const useUIStore = create((set) => {
  return {
    sidebarOpen: true,
    showModal: false,
    modalType: null,
    modalData: null,
    notification: null,

    toggleSidebar: () =>
      set((state) => ({
        sidebarOpen: !state.sidebarOpen,
      })),

    openModal: (type, data = null) =>
      set({
        showModal: true,
        modalType: type,
        modalData: data,
      }),

    closeModal: () =>
      set({
        showModal: false,
        modalType: null,
        modalData: null,
      }),

    showNotification: (message, type = "success", duration = 3000) => {
      set({
        notification: { message, type },
      });
      setTimeout(
        () =>
          set({
            notification: null,
          }),
        duration,
      );
    },
  };
});

// Leads Store
export const useLeadsStore = create((set) => ({
  leads: [],
  selectedLead: null,
  loadingLeads: false,

  setLeads: (leads) => set({ leads }),
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  setLoadingLeads: (loading) => set({ loadingLeads: loading }),

  addLead: (lead) => {
    const newLead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      leads: [newLead, ...state.leads],
    }));
  },

  updateLead: (id, updates) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead,
      ),
    }));
  },

  deleteLead: (id) => {
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    }));
  },
}));

// Inventory Store
export const useInventoryStore = create((set) => ({
  items: [],
  loadingInventory: false,

  setItems: (items) => set({ items }),
  setLoadingInventory: (loading) => set({ loadingInventory: loading }),

  addItem: (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      items: [newItem, ...state.items],
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));

// Orders Store
export const useOrdersStore = create((set) => ({
  orders: [],
  loadingOrders: false,

  setOrders: (orders) => set({ orders }),
  setLoadingOrders: (loading) => set({ loadingOrders: loading }),

  addOrder: (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order,
      ),
    }));
  },
}));

// Finance Store
export const useFinanceStore = create((set) => ({
  transactions: [],
  loading: false,

  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),

  addTransaction: (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
    };
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));
  },
}));

// Analytics Store
export const useAnalyticsStore = create((set) => ({
  analyticsData: null,
  loading: false,

  setAnalyticsData: (data) => set({ analyticsData: data }),
  setLoading: (loading) => set({ loading }),
}));
