import React, { useState, useMemo } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Pagination } from "../../components/ui";
import {
  Activity,
  CheckCheck,
  Search,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Filter,
  ShoppingBag,
  Boxes,
  Users,
  Wallet,
  RotateCcw,
  Trash2,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  Info,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../../../hook/notifications";
import { exportToExcel, exportToCSV, formatDateTime, formatTimeAgo } from "../../utils";

const CATEGORIES = [
  { id: "all", label: "All Activity", icon: Activity, color: "emerald" },
  { id: "order", label: "Orders & Sales", icon: ShoppingBag, color: "blue" },
  { id: "inventory", label: "Production & Stock", icon: Boxes, color: "amber" },
  { id: "lead", label: "Leads & CRM", icon: Users, color: "purple" },
  { id: "system", label: "Finance & System", icon: Wallet, color: "emerald" },
  { id: "order_return", label: "Returns & Refunds", icon: RotateCcw, color: "rose" },
  { id: "order_deletion", label: "Deletions", icon: Trash2, color: "red" },
];

const getLogVisualMeta = (log) => {
  const type = String(log.type || "").toLowerCase();
  const title = String(log.title || "").toLowerCase();

  if (title.includes("delete") || title.includes("removed")) {
    return {
      category: "Deletion",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      iconBg: "bg-red-50 text-red-600 border-red-200",
      Icon: Trash2,
    };
  }

  if (title.includes("return") || title.includes("refund")) {
    return {
      category: "Return",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      Icon: RotateCcw,
    };
  }

  if (type === "order" || title.includes("order")) {
    return {
      category: "Order",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      Icon: ShoppingBag,
    };
  }

  if (type === "inventory" || title.includes("batch") || title.includes("scrap") || title.includes("stock")) {
    return {
      category: "Inventory",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      Icon: Boxes,
    };
  }

  if (type === "lead" || title.includes("lead") || title.includes("inquiry")) {
    return {
      category: "Lead",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      iconBg: "bg-purple-50 text-purple-600 border-purple-200",
      Icon: Users,
    };
  }

  return {
    category: "System",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Icon: Activity,
  };
};

const ActivityLogs = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useGetNotifications(selectedCategory, 300);

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const rawLogs = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.notifications)) return data.notifications;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const unreadCount = useMemo(() => {
    if (typeof data?.unreadCount === "number") return data.unreadCount;
    return rawLogs.filter((l) => l.unread).length;
  }, [data, rawLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (log.title || "").toLowerCase().includes(query);
        const descMatch = (log.description || "").toLowerCase().includes(query);
        const refMatch = (log.refId || "").toLowerCase().includes(query);
        const typeMatch = (log.type || "").toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !refMatch && !typeMatch) {
          return false;
        }
      }

      // Date range filter
      if (startDate) {
        const logDate = new Date(log.createdAt);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }

      if (endDate) {
        const logDate = new Date(log.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [rawLogs, searchQuery, startDate, endDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Quick stats
  const stats = useMemo(() => {
    const total = rawLogs.length;
    const orders = rawLogs.filter((l) => l.type === "order" || (l.title || "").toLowerCase().includes("order")).length;
    const inventory = rawLogs.filter((l) => l.type === "inventory" || (l.title || "").toLowerCase().includes("batch") || (l.title || "").toLowerCase().includes("stock")).length;
    const leads = rawLogs.filter((l) => l.type === "lead" || (l.title || "").toLowerCase().includes("lead")).length;
    const financial = rawLogs.filter((l) => l.type === "system" || (l.title || "").toLowerCase().includes("expense") || (l.title || "").toLowerCase().includes("scrap")).length;

    return { total, unread: unreadCount, orders, inventory, leads, financial };
  }, [rawLogs, unreadCount]);

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All activity logs marked as read");
      },
      onError: () => {
        toast.error("Failed to mark all logs as read");
      },
    });
  };

  const handleMarkSingleRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleExportCSV = () => {
    if (!filteredLogs.length) {
      toast.error("No activity logs to export");
      return;
    }
    const headers = ["Timestamp", "Category", "Event Title", "Description", "Reference ID", "Read Status"];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toLocaleString("en-IN"),
      getLogVisualMeta(l).category,
      l.title || "—",
      l.description || "—",
      l.refId || "—",
      l.unread ? "Unread" : "Read",
    ]);
    const dateStr = new Date().toISOString().split("T")[0];
    exportToCSV(headers, rows, `Activity_Audit_Logs_${selectedCategory}_${dateStr}`);
    toast.success(`Exported ${filteredLogs.length} activity records to CSV`);
  };

  const handleExportExcel = () => {
    if (!filteredLogs.length) {
      toast.error("No activity logs to export");
      return;
    }
    const headers = ["Timestamp", "Category", "Event Title", "Description", "Reference ID", "Read Status"];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toLocaleString("en-IN"),
      getLogVisualMeta(l).category,
      l.title || "—",
      l.description || "—",
      l.refId || "—",
      l.unread ? "Unread" : "Read",
    ]);
    const dateStr = new Date().toISOString().split("T")[0];
    exportToExcel(headers, rows, `Activity_Audit_Logs_${selectedCategory}_${dateStr}`);
    toast.success(`Exported ${filteredLogs.length} activity records to Excel`);
  };

  return (
    <Layout
      title="Activity Logs & System Audit"
      subtitle="Complete, time-stamped history of all sales, production batches, inventory updates, and CRM operations."
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Card className="p-4 border-l-4 border-l-emerald-500 bg-emerald-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Recorded events</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-rose-500 bg-rose-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unread Alerts</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.unread}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Requires attention</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders & Sales</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.orders}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Fulfillment actions</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Production</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.inventory}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Batches & materials</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500 bg-purple-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Leads & CRM</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{stats.leads}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Inquiries & followups</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-teal-500 bg-teal-50/20">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Finance</p>
            <p className="text-2xl font-bold text-teal-700 mt-1">{stats.financial}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Expenses & scrap</p>
          </Card>
        </div>

        {/* Filter Toolbar & Actions */}
        <Card className="p-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search, Date Filters & Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events, order numbers, descriptions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  title="From Date"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  title="To Date"
                />
              </div>

              {(searchQuery || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 underline px-1.5"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="text-xs text-gray-700 bg-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isLoading}
                  className="text-xs text-emerald-700 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Mark All Read
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs text-gray-700 bg-white"
                title="Export filtered logs to CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="text-xs text-emerald-800 bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100"
                title="Export filtered logs to Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Excel
              </Button>
            </div>
          </div>
        </Card>

        {/* Activity Logs Feed */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Loading activity records...</p>
              <p className="text-xs text-gray-400 mt-1">Fetching live system events and audit trail</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">No activity logs found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {searchQuery || startDate || endDate || selectedCategory !== "all"
                  ? "No activity logs match the selected filter criteria. Try clearing your filters."
                  : "Activity records will appear here as orders, factory production batches, and payments occur."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {paginatedLogs.map((log) => {
                  const meta = getLogVisualMeta(log);
                  const Icon = meta.Icon;
                  const logDate = log.createdAt ? new Date(log.createdAt) : null;

                  return (
                    <motion.div
                      key={log._id || log.id || Math.random()}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => log.unread && log._id && handleMarkSingleRead(log._id)}
                      className={`p-4 hover:bg-gray-50/80 transition-colors duration-150 flex items-start gap-3.5 cursor-pointer ${
                        log.unread ? "bg-emerald-50/30" : "bg-white"
                      }`}
                    >
                      {/* Event Icon */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${meta.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                          >
                            {meta.category}
                          </span>

                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {log.title || "System Event"}
                          </h4>

                          {log.unread && (
                            <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold rounded bg-rose-500 text-white animate-pulse">
                              NEW
                            </span>
                          )}

                          {log.refId && (
                            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              Ref: {log.refId}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed break-words">
                          {log.description || "No additional description provided."}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                          <span className="flex items-center gap-1 font-medium text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {logDate ? formatTimeAgo(logDate) : "Recent"}
                          </span>
                          <span>•</span>
                          <span>{logDate ? formatDateTime(logDate) : "—"}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredLogs.length > itemsPerPage && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-800">{filteredLogs.length}</span> activity logs
              </p>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ActivityLogs;
