import React, { useMemo, useState } from "react";
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
  PanelLeftClose,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "../../../../hook/admin";
import { useQueryClient } from "@tanstack/react-query";

export const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: Box, label: "Inventory", path: "/inventory" },
    { icon: ShoppingCart, label: "Orders", path: "/orders" },
    { icon: FileText, label: "Finance", path: "/finance" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
                    <Leaf className="h-6 w-6" />
                  </div>

                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">
                      Nirmalyam
                    </h1>
                    <p className="text-xs font-medium text-emerald-700">
                      Admin Portal
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleSidebar}
                  className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
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

            <div className="border-t border-emerald-100 bg-white/80 px-5 py-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Nirmalyam Krafts
                    </p>
                    <p className="text-xs text-gray-500">
                      Sustainable Packaging
                    </p>
                  </div>

                  <button
                    onClick={toggleSidebar}
                    className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);

  const profile = data?.data || data || user || {};
  const initials = useMemo(() => {
    const name = profile?.name || "A";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    queryClient.clear();
    navigate("/dashboard/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 md:flex md:w-72 lg:w-80">
            <Search className="mr-2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search leads, orders, inventory..."
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button className="relative rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-50">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2 py-2 pr-3 transition hover:bg-gray-50"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={profile?.name || "User"}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {initials}
                </div>
              )}

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {profile?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.role || "Administrator"}
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
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={profile?.name || "User"}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {profile?.name || "Admin User"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {profile?.email || "No email"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {profile?.phone || "No phone"}
                        </p>
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