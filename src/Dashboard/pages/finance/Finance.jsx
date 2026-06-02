
import React, { useMemo } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge } from "../../components/ui";
import { RevenueChart } from "../../components/charts";
import { TrendingUp, AlertCircle, DollarSign, CreditCard, Download, ShoppingBag, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useGetFinance } from "../../../../hook/finance";
import { useGetAllOrders } from "../../../../hook/order";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Finance = () => {
  const { data, isLoading, isError, refetch } = useGetFinance();
  const { data: ordersData } = useGetAllOrders({ limit: 10 });

  // Transform revenueTrend from { month, total } to { month, revenue } for chart compatibility
  const chartData = useMemo(() => {
    if (!Array.isArray(data?.revenueTrend)) return [];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return data.revenueTrend.map((item) => {
      let label = item.month || "";
      // Convert "2026-06" → "JUN" format
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

  // Generate finance summary PDF
  const generateFinancePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    // Header
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

    // KPI Summary
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

    // Revenue Trend
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

    // Recent Orders
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

    // Footer
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
                Real-time tracking of orders and financial overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={generateFinancePDF}
                disabled={isLoading || isError || !data}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>

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
                      ₹{data?.monthlyRevenue?.toLocaleString?.() ?? 0}
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
                      ₹{data?.income?.toLocaleString?.() ?? 0}
                    </p>
                  </div>
                  <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="hover:shadow-md hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Pending Dues
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{data?.pendingDues?.toLocaleString?.() ?? 0}
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
                      ₹{data?.income?.toLocaleString?.() ?? 0}
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
                    <span className="text-sm font-bold text-gray-900">₹{data?.expense?.toLocaleString?.() ?? 0}</span>
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
                      ₹{data?.netProfit?.toLocaleString?.() ?? 0}
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
      </div>
    </Layout>
  );
};

export default Finance;
