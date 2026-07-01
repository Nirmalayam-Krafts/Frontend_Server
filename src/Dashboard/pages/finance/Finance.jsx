import React, { useMemo, useState, useEffect } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge, Button, Input, Select, Modal, Pagination } from "../../components/ui";
import { RevenueChart } from "../../components/charts";
import { 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  CreditCard, 
  Download, 
  ShoppingBag, 
  RefreshCw, 
  Plus, 
  FileSpreadsheet,
  Wallet,
  Activity,
  Layers3
} from "lucide-react";
import { motion } from "framer-motion";
import { useGetFinance } from "../../../../hook/finance";
import { useGetAllOrders } from "../../../../hook/order";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuthContext } from "../../../context/Adminauth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Finance = () => {
  const { axiosInstance } = useAuthContext();
  const { data, isLoading, isError, refetch } = useGetFinance();
  const { data: ordersData } = useGetAllOrders({ limit: 10 });

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Expense States
  const [expenseRange, setExpenseRange] = useState("7days");
  const [expensePage, setExpensePage] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "Electricity Bill", amount: "", note: "" });
  const [isRecording, setIsRecording] = useState(false);

  // Fetch expenses list
  const fetchExpensesList = async () => {
    setExpensesLoading(true);
    try {
      const res = await axiosInstance.get(`/finance/transactions?excludeRevenue=true&page=${expensePage}&limit=10`);
      setExpenses(res.data?.data || []);
      setExpensesTotal(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch expenses list", err);
    } finally {
      setExpensesLoading(false);
    }
  };

  // Fetch expense report
  const fetchExpenseReport = async () => {
    setReportLoading(true);
    try {
      const res = await axiosInstance.get(`/finance/expenses/report?range=${expenseRange}`);
      setReportData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch expense report", err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "expenses") {
      fetchExpensesList();
    }
  }, [activeTab, expensePage]);

  useEffect(() => {
    if (activeTab === "expenses") {
      fetchExpenseReport();
    }
  }, [activeTab, expenseRange]);

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || Number(newExpense.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsRecording(true);
    try {
      await axiosInstance.post("/finance/transaction", {
        transactionType: "EXPENSE",
        amount: Number(newExpense.amount),
        category: newExpense.category,
        note: newExpense.note || "Recorded manually",
      });
      setShowExpenseModal(false);
      setNewExpense({ category: "Electricity Bill", amount: "", note: "" });
      fetchExpensesList();
      fetchExpenseReport();
      refetch();
    } catch (err) {
      console.error("Failed to record expense", err);
      alert(err.response?.data?.message || "Failed to record expense");
    } finally {
      setIsRecording(false);
    }
  };

  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert("No expense records available to export");
      return;
    }
    const headers = ["Date", "Category", "Amount (INR)", "Added By", "Note"];
    const rows = expenses.map((e) => [
      new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      e.category || (e.transactionType === "MATERIAL_COST" ? "Raw Materials" : e.transactionType),
      e.amount,
      e.adminId?.name || "System",
      e.note || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows]
          .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
          .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nirmalyam_Expenses_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Transform revenueTrend from { month, total } to { month, revenue } for chart compatibility
  const chartData = useMemo(() => {
    if (!Array.isArray(data?.revenueTrend)) return [];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return data.revenueTrend.map((item) => {
      let label = item.month || "";
      if (label.includes("-")) {
        const parts = label.split("-");
        const monthIdx = parseInt(parts[1], 10) - 1;
        label = monthNames[monthIdx] || label;
      }
      return {
        month: label,
        revenue: Math.round(Number(item.total ?? item.revenue ?? 0)),
      };
    });
  }, [data?.revenueTrend]);

  // Recent orders for finance context
  const recentOrders = useMemo(() => {
    const orders = ordersData?.orders || [];
    return orders.slice(0, 5).map((o) => ({
      id: o._id,
      reference: o.orderReference || `ORD-${String(o._id).slice(-6).toUpperCase()}`,
      customer: o.customerName || o.leadSnapshot?.name || "—",
      totalAmount: Number(o.totalAmount || 0),
      paidAmount: Number(o.paidAmount || 0),
      paymentStatus: o.paymentStatus || "Unpaid",
      orderStatus: o.orderStatus || "Pending",
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    }));
  }, [ordersData]);

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  const PIE_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"];

  const pieChartData = useMemo(() => {
    if (!reportData?.byCategory) return [];
    return reportData.byCategory.map((item) => ({
      name: item.category,
      value: item.total,
    }));
  }, [reportData?.byCategory]);

  const trendChartData = useMemo(() => {
    if (!reportData?.trend) return [];
    return reportData.trend.map((item) => {
      let label = item.period;
      if (label.includes("-") && label.split("-").length === 3) {
        const d = new Date(label);
        label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      }
      return {
        period: label,
        amount: item.total,
      };
    });
  }, [reportData?.trend]);

  const topCategorySummary = useMemo(() => {
    if (!reportData?.byCategory || reportData.byCategory.length === 0) return "None";
    const sorted = [...reportData.byCategory].sort((a, b) => b.total - a.total);
    return `${sorted[0].category} (${formatCurrency(sorted[0].total)})`;
  }, [reportData?.byCategory]);

  // Generate finance summary PDF
  const generateFinancePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Nirmalayam Krafts", 15, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Finance Summary — ${dateStr}`, 15, 28);

    doc.setTextColor(0, 0, 0);
    let y = 45;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Overview", 15, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Monthly Revenue", formatCurrency(data?.monthlyRevenue)],
        ["Pending Dues", formatCurrency(data?.pendingDues)],
        ["Total Dispatched", String(data?.totalDispatched ?? 0)],
        ["Payment Rate", `${data?.paymentRate ?? 0}%`],
        ["Total Income", formatCurrency(data?.income)],
        ["Total Expense", formatCurrency(data?.expense)],
        ["Net Profit", formatCurrency(data?.netProfit)],
      ],
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105] },
      styles: { fontSize: 10 },
    });

    y = doc.lastAutoTable.finalY + 15;

    if (chartData.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Revenue Trend (Last 5 Months)", 15, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Month", "Revenue"]],
        body: chartData.map((item) => [item.month, formatCurrency(item.revenue)]),
        theme: "grid",
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 10 },
      });
      y = doc.lastAutoTable.finalY + 15;
    }

    if (recentOrders.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recent Orders", 15, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Reference", "Customer", "Amount", "Paid", "Status"]],
        body: recentOrders.map((o) => [
          o.reference,
          o.customer,
          formatCurrency(o.totalAmount),
          formatCurrency(o.paidAmount),
          o.paymentStatus,
        ]),
        theme: "grid",
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 9 },
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated by Nirmalayam Krafts Admin — Page ${i} of ${pageCount}`, 15, 285);
    }

    doc.save(`Nirmalayam_Finance_Report_${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Finance & Revenue
              </h1>
              <p className="text-gray-600">
                Real-time tracking of orders, expenses, and financial overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  refetch();
                  if (activeTab === "expenses") {
                    fetchExpensesList();
                    fetchExpenseReport();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {activeTab === "overview" ? (
                <button
                  onClick={generateFinancePDF}
                  disabled={isLoading || isError || !data}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              ) : (
                <button
                  onClick={exportToCSV}
                  disabled={expensesLoading || expenses.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-emerald-50 text-emerald-700 shadow-inner"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition-all ${
              activeTab === "expenses"
                ? "bg-emerald-50 text-emerald-700 shadow-inner"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Expenses Manager
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* KPI Cards */}
            {!isLoading && !isError && data && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Monthly Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(data?.monthlyRevenue)}
                        </p>
                      </div>
                      <div className="bg-green-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="hover:shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(data?.income)}
                        </p>
                      </div>
                      <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="hover:shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Pending Dues
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(data?.pendingDues)}
                        </p>
                      </div>
                      <div className="bg-red-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="hover:shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Total Dispatched
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.totalDispatched?.toLocaleString?.() ?? 0}
                        </p>
                      </div>
                      <div className="bg-blue-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="hover:shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Payment Rate
                        </p>
                        <p className="text-2xl font-bold text-primary-600">
                          {data?.paymentRate ?? 0}%
                        </p>
                      </div>
                      <div className="bg-primary-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            {isLoading && (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            )}
            {isError && (
              <div className="text-center py-10 text-red-500">Failed to load finance data.</div>
            )}

            {/* Charts */}
            {!isLoading && !isError && data && (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <RevenueChart data={chartData} />
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Income vs Expense Ratio
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Income</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(data?.income)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${data?.income && data?.expense ? Math.round((data.income / (data.income + data.expense)) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Expense</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(data?.expense)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full"
                          style={{ width: `${data?.income && data?.expense ? Math.round((data.expense / (data.income + data.expense)) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Net Profit
                        </span>
                        <span className={`text-2xl font-bold ${(data?.netProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(data?.netProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-600" />
                      Recent Orders
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Reference</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Customer</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Amount</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Paid</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Payment</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Order</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900">{order.reference}</td>
                            <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                            <td className="py-3 px-4 text-right font-semibold text-blue-600">{formatCurrency(order.paidAmount)}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Partial Paid" ? "warning" : "danger"}
                                className="text-xs"
                              >
                                {order.paymentStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={order.orderStatus === "Completed" ? "success" : order.orderStatus === "Processing" ? "primary" : "secondary"}
                                className="text-xs"
                              >
                                {order.orderStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        ) : (
          /* Expenses tab contents */
          <div className="space-y-6">
            {/* KPI summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Total Expenses ({expenseRange.toUpperCase()})
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportLoading ? "..." : formatCurrency(reportData?.totalExpenses)}
                    </p>
                  </div>
                  <div className="bg-red-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Top Expense Category
                    </p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {reportLoading ? "..." : topCategorySummary}
                    </p>
                  </div>
                  <div className="bg-amber-400 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <Layers3 className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col justify-center">
                <Button
                  onClick={() => setShowExpenseModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Record Manual Expense
                </Button>
              </Card>
            </div>

            {/* Time range selection for Visualizations */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 bg-white p-4 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Expense Report Range:</span>
              <div className="flex gap-2">
                {[
                  { value: "daily", label: "Daily" },
                  { value: "7days", label: "7 Days" },
                  { value: "month", label: "Last Month" },
                  { value: "quarter", label: "Last Quarter" },
                  { value: "year", label: "Last Year" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setExpenseRange(item.value);
                      setExpensePage(1);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                      expenseRange === item.value
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <Card className="h-80">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Expense Trend
                </h3>
                <div className="h-[240px] w-full">
                  {reportLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading trend...</div>
                  ) : trendChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">No expense trend data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendChartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: "11px" }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            color: "#111827",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="Amount (₹)"
                          stroke="#ef4444"
                          dot={trendChartData.length < 30}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Category Pie Chart */}
              <Card className="h-80">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Expense Categories Breakdown
                </h3>
                <div className="h-[240px] w-full flex items-center justify-center">
                  {reportLoading ? (
                    <div className="text-gray-400">Loading breakdown...</div>
                  ) : pieChartData.length === 0 ? (
                    <div className="text-gray-400">No expense breakdown data</div>
                  ) : (
                    <>
                      <div className="w-[50%] h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-[50%] overflow-y-auto max-h-[220px] text-xs space-y-2 pl-4">
                        {pieChartData.map((item, idx) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                              />
                              <span className="font-medium text-gray-700 truncate max-w-[120px]">{item.name}</span>
                            </div>
                            <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Expense ledger list */}
            <Card>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  Expenses Ledger
                </h2>
                <span className="text-xs text-gray-500">Showing {expenses.length} records of {expensesTotal} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Added By</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Notes & Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesLoading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-400">Loading ledger...</td>
                      </tr>
                    ) : expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-400">No expense records found</td>
                      </tr>
                    ) : (
                      expenses.map((expense) => (
                        <tr key={expense._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4 text-gray-500">
                            {new Date(expense.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-gray-900">
                            {expense.category || (expense.transactionType === "MATERIAL_COST" ? "Raw Materials" : expense.transactionType)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-red-600">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-gray-700">
                            {expense.adminId?.name || "System"}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 italic">
                            {expense.note || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {expensesTotal > 10 && (
                <div className="mt-4 flex justify-end">
                  <Pagination
                    current={expensePage}
                    total={Math.ceil(expensesTotal / 10)}
                    onPageChange={(page) => setExpensePage(page)}
                  />
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Record Expense Modal */}
        <Modal
          isOpen={showExpenseModal}
          title="Record Manual Expense"
          onClose={() => {
            setShowExpenseModal(false);
            setNewExpense({ category: "Electricity Bill", amount: "", note: "" });
          }}
          size="md"
        >
          <form onSubmit={handleRecordExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                required
              >
                <option value="Electricity Bill">Electricity Bill</option>
                <option value="Logistics">Logistics</option>
                <option value="WhatsApp API Bill">WhatsApp API Bill</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Input
                label="Amount (₹)"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes & Specifications</label>
              <textarea
                rows={3}
                placeholder="Electricity bill for July 2026..."
                value={newExpense.note}
                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowExpenseModal(false);
                  setNewExpense({ category: "Electricity Bill", amount: "", note: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isRecording} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Record Expense
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Finance;
