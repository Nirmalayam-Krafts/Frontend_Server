import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUIStore, useAuthStore } from "../../store";
import {
  BarChart3,
  Box,
  FileText,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  X,
  Home,
  Bell,
  Search,
  ChevronRight,
  Leaf,
  Package,
  Boxes,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Package2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Recycle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "../../../../hook/admin";
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "../../../../hook/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import toast from "react-hot-toast";

export const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { axiosInstance } = useAuthContext();

  const handleResetDatabase = async () => {
    const doubleConfirm = window.confirm(
      "⚠️ WARNING: This will permanently delete all orders, products, inventory, raw materials, leads, quotations, notifications, and ledger entries of this Nirmalyam portal.\n\nOnly admin username and password credentials will be retained.\n\nAre you absolutely sure you want to proceed with this reset?"
    );
    if (!doubleConfirm) return;

    const typedConfirm = window.prompt(
      'Type "RESET" in all capital letters to confirm database reset:'
    );
    if (typedConfirm !== "RESET") {
      toast.error('Reset aborted. You must type "RESET" to confirm.');
      return;
    }

    const loadingToast = toast.loading("Resetting Nirmalyam database...");
    try {
      await axiosInstance.delete("/reset-database");
      toast.success("Database resetted successfully 🎉", { id: loadingToast });
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to reset database", { id: loadingToast });
    }
  };

  const [inventoryOpen, setInventoryOpen] = useState(
    location.pathname === "/inventory" || location.pathname === "/rawmaterial" || location.pathname === "/Product"
  );
  const [ordersOpen, setOrdersOpen] = useState(
    location.pathname === "/orders" || location.pathname === "/quotations" || location.pathname === "/receipts" || location.pathname === "/order-returns"
  );

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Leads", path: "/leads" },
    {
      icon: Box,
      label: "Inventory",
      path: "/inventory",
      children: [
        { icon: Package, label: "Stock", path: "/inventory" },
        { icon: Box, label: "Raw Materials", path: "/rawmaterial" },
        { icon: Box, label: "Products", path: "/Product" },
        { icon: Recycle, label: "Recycling", path: "/recycling" },
      ],
    },
    { icon: Recycle, label: "Recycling", path: "/recycling" },
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/orders",
      children: [
        { icon: ShoppingCart, label: "All Orders", path: "/orders" },
        { icon: FileText, label: "Quotations", path: "/quotations" },
        { icon: FileText, label: "Receipts", path: "/receipts" },
        { icon: RotateCcw, label: "Returns", path: "/order-returns" },
      ],
    },
    { icon: FileText, label: "Finance", path: "/finance" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: ShieldAlert, label: "Activity Logs", path: "/activity-logs" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const isInventoryActive =
    location.pathname === "/inventory" || location.pathname === "/rawmaterial" || location.pathname === "/Product" || location.pathname === "/recycling";

  const isOrdersActive =
    location.pathname === "/orders" || location.pathname === "/quotations" || location.pathname === "/receipts" || location.pathname === "/order-returns";


  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] md:hidden"
          />

          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.25 }}
            className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-emerald-100 bg-gradient-to-b from-white via-white to-emerald-50 shadow-2xl"
          >
            <div className="border-b border-emerald-100 px-6 pb-5 pt-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="/Nirmalyam_Logo-removebg-preview.webp" 
                    alt="Nirmalyam Logo" 
                    className="h-16 w-auto object-contain" 
                  />
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase leading-none">
                      Admin Portal
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Workspace
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  Eco Packaging Operations
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Manage leads, orders, inventory, and analytics from one place.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Main Menu
              </p>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  if (item.children) {
                    const isInv = item.label === "Inventory";
                    const isOpen = isInv ? inventoryOpen : ordersOpen;
                    const setOpen = isInv ? setInventoryOpen : setOrdersOpen;
                    const isActiveState = isInv ? isInventoryActive : isOrdersActive;

                    return (
                      <div key={item.label} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setOpen(!isOpen)}
                          className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                            isActiveState
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-200"
                              : "text-gray-700 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                isActiveState
                                  ? "bg-white/15 text-white"
                                  : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>
                          </div>

                          <ChevronRight
                            className={`h-4 w-4 transition ${
                              isOpen ? "rotate-90" : ""
                            } ${isActiveState ? "text-white" : "text-gray-400"}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 space-y-2 overflow-hidden border-l border-emerald-100 pl-4"
                            >
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                const childActive = isActive(child.path);

                                return (
                                  <Link
                                    key={child.path}
                                    to={child.path}
                                    className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                                      childActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                          childActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                                        }`}
                                      >
                                        <ChildIcon className="h-4 w-4" />
                                      </div>

                                      <span className="text-sm font-medium">
                                        {child.label}
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-200"
                          : "text-gray-700 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 transition ${
                          active
                            ? "translate-x-0 text-white"
                            : "text-gray-400 group-hover:translate-x-1"
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-emerald-100 bg-white/80 px-5 py-5 space-y-3">
              <button
                type="button"
                onClick={handleResetDatabase}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-xs font-bold text-red-650 hover:bg-red-100 hover:text-red-750 transition-colors shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset Database</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export const Navbar = () => {
  const { data } = useCurrentUser();
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: notifData } = useGetNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: markOneRead } = useMarkNotificationRead();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allNotifications = notifData?.notifications || [];
  const unreadCount = allNotifications.filter((n) => n.unread).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case "order":    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "inventory": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "lead":    return <Users className="h-4 w-4 text-blue-500" />;
      default:        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "order":     return { label: "Order",     bg: "bg-emerald-100", text: "text-emerald-700" };
      case "inventory": return { label: "Inventory",  bg: "bg-amber-100",  text: "text-amber-700" };
      case "lead":      return { label: "Lead",      bg: "bg-blue-100",   text: "text-blue-700" };
      default:          return { label: "System",    bg: "bg-gray-100",   text: "text-gray-600" };
    }
  };

  const getNavPath = (n) => {
    switch (n.type) {
      case "order":     return "/orders";
      case "inventory": return n.description?.toLowerCase().includes("raw material") ? "/rawmaterial" : "/inventory";
      case "lead":      return "/leads";
      default:          return null;
    }
  };

  const getActionLabel = (n) => {
    switch (n.type) {
      case "order":     return "View Order";
      case "inventory": return "View Inventory";
      case "lead":      return "View Lead";
      default:          return "View";
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleMarkAllAsRead = () => markAllRead();

  const handleClickNotification = (n) => {
    if (n.unread) markOneRead(n._id);
    const path = getNavPath(n);
    if (path) {
      setNotificationsOpen(false);
      navigate(path);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const profile = data?.data || data || user || {};
  const initials = useMemo(() => {
    const name = profile?.name || "Ram Rajurkar";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name]);

  const { axiosInstance } = useAuthContext();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/admin/logout");
    } catch (err) {
      console.error("Failed to call logout endpoint", err);
    }
    localStorage.removeItem("adminToken");
    queryClient.clear();
    navigate("/dashboard/login", { replace: true });
  };

  const quickNavItems = useMemo(() => [
    { label: "Dashboard Overview", path: "/dashboard", icon: Home, category: "Navigation" },
    { label: "Leads Workspace", path: "/leads", icon: Users, category: "Navigation" },
    { label: "Orders & Invoices", path: "/orders", icon: ShoppingCart, category: "Navigation" },
    { label: "Stock Inventory", path: "/inventory", icon: Package, category: "Navigation" },
    { label: "Raw Materials", path: "/rawmaterial", icon: Boxes, category: "Navigation" },
    { label: "Products Catalog", path: "/Product", icon: Box, category: "Navigation" },
    { label: "Price Quotations", path: "/quotations", icon: FileText, category: "Navigation" },
    { label: "Receipts & Vouchers", path: "/receipts", icon: FileText, category: "Navigation" },
    { label: "Finance & Revenue", path: "/finance", icon: BarChart3, category: "Navigation" },
    { label: "Analytics & Reports", path: "/analytics", icon: BarChart3, category: "Navigation" },
    { label: "System Settings", path: "/settings", icon: Settings, category: "Navigation" },
  ], []);

  const filteredQuickItems = useMemo(() => {
    if (!searchQuery.trim()) return quickNavItems;
    const q = searchQuery.toLowerCase().trim();
    return quickNavItems.filter((it) => it.label.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
  }, [searchQuery, quickNavItems]);

  return (
    <>
      <nav className={`sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md transition-all duration-300 ${
        sidebarOpen ? "md:ml-72" : ""
      }`}>
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setQuickSearchOpen(true)}
              className="group hidden items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-md md:flex md:w-72 lg:w-80"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">
                  Quick Search or Command...
                </span>
              </div>
              <kbd className="hidden rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 shadow-2xs md:inline-block">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-50"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                      {allNotifications.length > 0 ? (
                        allNotifications.map((n) => {
                          const badge = getTypeBadge(n.type);
                          const path = getNavPath(n);
                          return (
                            <div
                              key={n._id}
                              onClick={() => handleClickNotification(n)}
                              className={`p-4 transition hover:bg-gray-50 cursor-pointer ${
                                n.unread ? "bg-emerald-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(n.type)}
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}
                                  >
                                    {badge.label}
                                  </span>
                                  {n.unread && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                  )}
                                </div>
                                <span className="text-[10px] font-medium text-gray-400">
                                  {formatTime(n.createdAt)}
                                </span>
                              </div>

                              <p className="mt-1.5 text-xs text-gray-700 leading-relaxed font-normal">
                                {n.description || n.title}
                              </p>

                              {path && (
                                <p className="mt-2 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1">
                                  <span>{getActionLabel(n)}</span>
                                  <span>&rarr;</span>
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Bell className="h-6 w-6 text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">All caught up!</p>
                          <p className="text-xs text-gray-400">No notifications yet.</p>
                        </div>
                      )}
                    </div>

                    {allNotifications.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-2 flex justify-between items-center">
                        <p className="text-[10px] text-gray-400">
                          {allNotifications.length} total · {unreadCount} unread
                        </p>
                        <p className="text-[10px] text-gray-400">Click to open</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2.5 py-2 pr-3 transition hover:bg-gray-50 shadow-2xs"
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 font-bold text-white text-xs shadow-md ring-2 ring-emerald-100/60">
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-2xs" />
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {profile?.name || "Ram Rajurkar"}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">
                    {profile?.role || "admin"}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 font-bold text-white text-sm shadow-md ring-2 ring-emerald-100/60">
                          {initials}
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>

    {/* Quick Search Command Palette Modal */}
    <AnimatePresence>
      {quickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickSearchOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl"
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-gray-100 px-5 py-4 bg-gradient-to-r from-emerald-50/50 via-white to-white">
              <Search className="mr-3 h-5 w-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, orders, inventory, or type a command..."
                className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 mr-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="text-xs font-semibold text-gray-400 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Quick Suggestions / Navigation List */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Quick Navigation & Workspaces
              </p>
              {filteredQuickItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setQuickSearchOpen(false);
                      setSearchQuery("");
                      navigate(item.path);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-emerald-50/80 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-950">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400">Go to workspace route</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2.5 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-gray-600">Tip:</span> Press <kbd className="bg-white border px-1 rounded font-mono text-[10px]">Ctrl+K</kbd> anywhere to trigger quick search
              </span>
              <span>Nirmalyam Krafts Admin Portal</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
};

export const Layout = ({ children }) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-emerald-50/40">
      <Sidebar />
      <Navbar />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : ""
        }`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};