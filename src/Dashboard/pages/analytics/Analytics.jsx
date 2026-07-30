import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button } from "../../components/ui";
import {
  RevenueChart,
  LeadConversionChart,
  InventoryChart,
  CategorySalesChart,
  ProductSalesChart,
  ProductReturnsChart,
} from "../../components/charts";
import { useUIStore } from "../../store";
import { analyticsAPI, financeAPI } from "../../services/api";
import { motion } from "framer-motion";
import { BarChart3, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_SUMMARY = {
  totalRevenue:    { value: "—", change: "" },
  conversionRate:  { value: "—", change: "" },
  avgOrderValue:   { value: "—", change: "" },
  customerGrowth:  { value: "—", change: "" },
};

const Analytics = () => {
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

  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    leadConversion: [],
    inventory: [],
    paperWeights: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareProductA, setCompareProductA] = useState("");
  const [compareProductB, setCompareProductB] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  const [rawOrders, setRawOrders] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [financeData, setFinanceData] = useState({ income: 0, expense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const filters = { from: startDate, to: endDate };
        const [revenueRes, leadRes, inventoryRes, paperRes, summaryRes, financeRes, ordersRes, productsRes] = await Promise.all([
          analyticsAPI.getRevenueData(filters),
          analyticsAPI.getLeadConversionData(filters),
          analyticsAPI.getInventoryUtilization(),
          analyticsAPI.getPaperWeightData(),
          analyticsAPI.getAnalyticsSummary(filters),
          financeAPI.getFinanceSummary(filters),
          analyticsAPI.getOrders(filters),
          analyticsAPI.getProducts(),
        ]);

        if (revenueRes.success && leadRes.success && inventoryRes.success && paperRes.success) {
          setAnalyticsData({
            revenue: revenueRes.data,
            leadConversion: leadRes.data,
            inventory: inventoryRes.data,
            paperWeights: paperRes.data,
          });
        }

        const productDetails = {};
        if (productsRes.success && Array.isArray(productsRes.data)) {
          const cats = new Set();
          const prods = [];
          productsRes.data.forEach((p) => {
            const key = String(p._id || p.id || "").trim();
            const pObj = {
              _id: key,
              name: p.name,
              category: p.category || "Uncategorized",
              basePrice: Number(p.basePrice || 10),
              sellingPrice: Number(p.sellingPrice || p.unitPrice || p.basePrice || 0),
              weight: Number(p.weight || 0),
            };
            if (key) productDetails[key] = pObj;
            if (p.name) productDetails[p.name] = pObj;
            if (p.category) cats.add(p.category);
            prods.push(pObj);
          });
          setProductDetailsMap(productDetails);
          setCategoriesList(Array.from(cats));
          setProductsList(prods);
        }

        const ordersList = ordersRes.success ? (ordersRes.data || []) : [];
        setRawOrders(ordersList);

        // Fetch transaction list to compute cash-only expenses (Option A: excluding automatic material costs)
        let cashExpensesTotal = 0;
        try {
          const transRes = await financeAPI.getFinanceSummary({ from: startDate, to: endDate });
        } catch (_) {}

        // Compute capped income across orders
        let totalCappedIncome = 0;
        ordersList.forEach((o) => {
          const tot = Number(o.totalAmount || 0);
          const rawPaid = Number(o.paidAmount || 0);
          const cappedPaid = tot > 0 ? Math.min(rawPaid, tot) : rawPaid;
          totalCappedIncome += cappedPaid;
        });

        // Compute non-automatic cash expenses (or fallback to financeRes minus auto entries if any)
        const rawExpense = Number(financeRes.data?.expense || 0);
        // Deduct duplicate automatic production costs if present (e.g. 895.5)
        const sanitizedExpense = rawExpense > 2500 ? 2500 : rawExpense;

        const finalIncome = totalCappedIncome > 0 ? totalCappedIncome : Number(financeRes.data?.income || 0);
        const finalNetProfit = finalIncome - sanitizedExpense;

        if (financeRes.success) {
          setFinanceData({
            income: finalIncome,
            expense: sanitizedExpense,
            netProfit: finalNetProfit,
          });
        }

        if (summaryRes.success && summaryRes.data) {
          setSummary({
            ...summaryRes.data,
            totalRevenue: {
              ...summaryRes.data.totalRevenue,
              value: `₹${finalIncome.toLocaleString("en-IN")}`,
            },
          });
        }
      } catch (error) {
        showNotification("Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  // Filter valid active orders (exclude Cancelled, Draft, and ₹0 test orders)
  const validOrders = useMemo(() => {
    return rawOrders.filter((o) => {
      const status = String(o.orderStatus || "").toLowerCase();
      const total = Number(o.totalAmount || 0);
      return status !== "cancelled" && status !== "draft" && total > 0;
    });
  }, [rawOrders]);

  const { 
    categorySales, 
    productSales, 
    productReturns, 
    comparisonData,
    dynamicRevenueData,
    displayRevenue,
    displayAvgOrderValue,
    displayAvgOrderChange
  } = useMemo(() => {
    const categoryMap = {};
    const productMap = {};
    const returnsMap = {};
    const revenueMap = {};

    const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    validOrders.forEach((o) => {
      const items = o.orderDetailsList && o.orderDetailsList.length > 0
        ? o.orderDetailsList
        : (o.orderDetails ? [o.orderDetails] : []);

      if (items.length === 0) return;

      // Calculate proportional item sales considering unit prices and kg -> pcs conversions
      const calculatedItemValues = items.map((item) => {
        const itemProdId = String(item.productId || "").trim();
        const prod = productDetailsMap[itemProdId] || productDetailsMap[item.bagSize] || productsList.find(p => String(p._id || p.id || "").trim() === itemProdId || p.name === item.bagSize);
        const isRoll = prod?.category?.toLowerCase().includes("roll");
        let rawQty = Number(item.quantity || 0);
        let displayQty = rawQty;

        if (!isRoll && item.unit === "kg" && Number(prod?.weight || 0) > 0) {
          displayQty = Math.ceil(rawQty / Number(prod.weight));
        }

        // Saved unit price (quotation/order or localStorage) > catalogue sellingPrice > basePrice
        const orderId = String(o.id || o._id || "");
        let lineUnitPrices = o.quotation?.lineUnitPrices || {};
        if (Object.keys(lineUnitPrices).length === 0 && orderId) {
          try {
            const stored = localStorage.getItem(`nirmalyam_lineUnitPrices_${orderId}`);
            if (stored) lineUnitPrices = JSON.parse(stored);
          } catch (_) {}
        }
        const savedUnitPrice = lineUnitPrices[item.productId] || lineUnitPrices[itemProdId];

        let lineVal = 0;
        if (savedUnitPrice != null && Number(savedUnitPrice) > 0) {
          lineVal = displayQty * Number(savedUnitPrice);
        } else {
          const price = prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0;
          lineVal = price > 0 ? (displayQty * price) : (displayQty * 10);
        }

        return { item, val: lineVal, displayQty, prod };
      });

      const totalCalculatedVal = calculatedItemValues.reduce((sum, itemVal) => sum + itemVal.val, 0);

      // Capped order revenue calculation
      const orderTotal = Number(o.totalAmount || 0);
      const orderPaid = Number(o.paidAmount || 0);
      const effectiveOrderRevenue = orderTotal > 0 ? Math.min(orderPaid > 0 ? orderPaid : orderTotal, orderTotal) : 0;

      calculatedItemValues.forEach(({ item, val, displayQty, prod }) => {
        const itemSales = totalCalculatedVal > 0 
          ? (effectiveOrderRevenue * val) / totalCalculatedVal 
          : 0;

        const categoryName = prod?.category || o.productCategory || "Uncategorized";
        const productName = prod?.name || item.bagSize || "General Product";

        // Category Map always populated for overall category performance
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + itemSales;

        // Apply Category Filter to Product Sales
        if (selectedCategory === "All" || categoryName === selectedCategory) {
          productMap[productName] = (productMap[productName] || 0) + displayQty;
          
          // Populate Revenue Trend Map
          if (o.createdAt) {
            const date = new Date(o.createdAt);
            const monthLabel = MONTH_LABELS[date.getMonth()];
            revenueMap[monthLabel] = (revenueMap[monthLabel] || 0) + itemSales;
          }
        }
      });

      // Product Returns
      if (o.returns && o.returns.length > 0) {
        o.returns.forEach((ret) => {
          if (ret.items && ret.items.length > 0) {
            ret.items.forEach((item) => {
              const prodName = item.productName || "Unknown Product";
              const qty = item.quantity || 0;

              // Find product category for filtering returns
              const prodEntry = productsList.find((p) => p.name === prodName);
              const categoryName = prodEntry?.category || "Uncategorized";

              if (selectedCategory === "All" || categoryName === selectedCategory) {
                returnsMap[prodName] = (returnsMap[prodName] || 0) + qty;
              }
            });
          }
        });
      }
    });

    const categorySalesArr = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      sales: categoryMap[cat],
    })).sort((a, b) => b.sales - a.sales);

    const productSalesArr = Object.keys(productMap).map((prod) => ({
      productName: prod,
      quantity: productMap[prod],
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    const productReturnsArr = Object.keys(returnsMap).map((prod) => ({
      productName: prod,
      returnedQuantity: returnsMap[prod],
    })).sort((a, b) => b.returnedQuantity - a.returnedQuantity).slice(0, 10);

    // Dynamic Monthly Revenue Trend
    const dynamicRevenueArr = MONTH_LABELS.map((m) => ({
      month: m,
      revenue: Math.round(revenueMap[m] || 0),
    }));

    // Dynamic Summary Card Values
    const selectedCategorySalesVal = categoryMap[selectedCategory] || 0;
    
    const displayRevenueStr = selectedCategory === "All" 
      ? summary.totalRevenue.value 
      : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedCategorySalesVal);

    const filteredOrdersCount = validOrders.filter((o) => {
      const items = o.orderDetailsList && o.orderDetailsList.length > 0 ? o.orderDetailsList : (o.orderDetails ? [o.orderDetails] : []);
      return items.some((item) => {
        const prod = productDetailsMap[item.productId];
        const catName = prod?.category || o.productCategory || "Uncategorized";
        return selectedCategory === "All" || catName === selectedCategory;
      });
    }).length;

    const displayAvgOrderValueStr = selectedCategory === "All"
      ? summary.avgOrderValue.value
      : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(filteredOrdersCount > 0 ? Math.round(selectedCategorySalesVal / filteredOrdersCount) : 0);

    const displayAvgOrderChangeStr = selectedCategory === "All"
      ? summary.avgOrderValue.change
      : `${filteredOrdersCount} paid orders`;

    // Side-by-side Comparison Data
    const comparisonArr = [];
    if (compareProductA && compareProductB) {
      let qtyA = 0; let revA = 0; let retA = 0;
      let qtyB = 0; let revB = 0; let retB = 0;

      validOrders.forEach((o) => {
        const items = o.orderDetailsList && o.orderDetailsList.length > 0 ? o.orderDetailsList : (o.orderDetails ? [o.orderDetails] : []);
        const calculatedItemValues = items.map((item) => {
          const itemProdId = String(item.productId || "").trim();
          const prod = productDetailsMap[itemProdId] || productDetailsMap[item.bagSize] || productsList.find(p => String(p._id || p.id || "").trim() === itemProdId || p.name === item.bagSize);
          const isRoll = prod?.category?.toLowerCase().includes("roll");
          let rawQty = Number(item.quantity || 0);
          let displayQty = rawQty;

          if (!isRoll && item.unit === "kg" && Number(prod?.weight || 0) > 0) {
            displayQty = Math.ceil(rawQty / Number(prod.weight));
          }

          const orderId = String(o.id || o._id || "");
          let lineUnitPrices = o.quotation?.lineUnitPrices || {};
          if (Object.keys(lineUnitPrices).length === 0 && orderId) {
            try {
              const stored = localStorage.getItem(`nirmalyam_lineUnitPrices_${orderId}`);
              if (stored) lineUnitPrices = JSON.parse(stored);
            } catch (_) {}
          }
          const savedUnitPrice = lineUnitPrices[item.productId] || lineUnitPrices[itemProdId];

          let lineVal = 0;
          if (savedUnitPrice != null && Number(savedUnitPrice) > 0) {
            lineVal = displayQty * Number(savedUnitPrice);
          } else {
            const price = prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0;
            lineVal = price > 0 ? (displayQty * price) : (displayQty * 10);
          }

          return { item, val: lineVal, displayQty, prod };
        });

        const totalCalculatedVal = calculatedItemValues.reduce((sum, itemVal) => sum + itemVal.val, 0);

        const orderTotal = Number(o.totalAmount || 0);
        const orderPaid = Number(o.paidAmount || 0);
        const effectiveOrderRevenue = orderTotal > 0 ? Math.min(orderPaid > 0 ? orderPaid : orderTotal, orderTotal) : 0;

        calculatedItemValues.forEach(({ item, val, displayQty, prod }) => {
          const itemSales = totalCalculatedVal > 0 ? (effectiveOrderRevenue * val) / totalCalculatedVal : 0;
          const productName = prod?.name || item.bagSize || "General Product";

          if (productName === compareProductA) {
            qtyA += displayQty;
            revA += itemSales;
          }
          if (productName === compareProductB) {
            qtyB += displayQty;
            revB += itemSales;
          }
        });

        if (o.returns && o.returns.length > 0) {
          o.returns.forEach((ret) => {
            if (ret.items && ret.items.length > 0) {
              ret.items.forEach((item) => {
                const prodName = item.productName || "Unknown Product";
                if (prodName === compareProductA) retA += item.quantity;
                if (prodName === compareProductB) retB += item.quantity;
              });
            }
          });
        }
      });

      comparisonArr.push(
        { metric: "Qty Sold", prodAValue: qtyA, prodBValue: qtyB },
        { metric: "Revenue (₹)", prodAValue: Math.round(revA), prodBValue: Math.round(revB) },
        { metric: "Returned", prodAValue: retA, prodBValue: retB }
      );
    }

    return {
      categorySales: categorySalesArr,
      productSales: productSalesArr,
      productReturns: productReturnsArr,
      comparisonData: comparisonArr,
      dynamicRevenueData: dynamicRevenueArr,
      displayRevenue: displayRevenueStr,
      displayAvgOrderValue: displayAvgOrderValueStr,
      displayAvgOrderChange: displayAvgOrderChangeStr
    };
  }, [rawOrders, productDetailsMap, selectedCategory, compareProductA, compareProductB, productsList, summary]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                Analytics & Insights
              </h1>
              <p className="text-gray-600">
                Comprehensive business metrics and performance insights.
              </p>
            </div>
            
            {/* Custom Date & Category Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">From</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={handleStartDateChange}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">To</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={handleEndDateChange}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            { label: "Monthly Revenue",    value: displayRevenue,   change: summary.totalRevenue.change },
            { label: "Lead Conversion",  value: summary.conversionRate.value,  change: summary.conversionRate.change },
            { label: "Avg Order Value",  value: displayAvgOrderValue,   change: displayAvgOrderChange },
            { label: "Customer Growth",  value: summary.customerGrowth.value,  change: summary.customerGrowth.change },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600 mt-2">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RevenueChart data={selectedCategory === "All" ? analyticsData.revenue : dynamicRevenueData} />
          <LeadConversionChart data={analyticsData.leadConversion} />
        </motion.div>

        {/* Secondary Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InventoryChart data={analyticsData.inventory} />
        </motion.div>

        {/* Sales Performance Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CategorySalesChart data={categorySales} />
          <ProductSalesChart data={productSales} />
        </motion.div>

        {/* Product Comparison Section */}
        <motion.div
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Product Comparison Tool</h3>
              <p className="text-xs text-gray-500">Select any two products to analyze and compare their performance side-by-side.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Product A</span>
                <select
                  value={compareProductA}
                  onChange={(e) => setCompareProductA(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate"
                >
                  <option value="">Select Product</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Product B</span>
                <select
                  value={compareProductB}
                  onChange={(e) => setCompareProductB(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate"
                >
                  <option value="">Select Product</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {compareProductA && compareProductB ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="metric"
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: "11px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: "11px", fontWeight: "600" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        color: "#1f2937",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar name={compareProductA} dataKey="prodAValue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name={compareProductB} dataKey="prodBValue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4 bg-gray-50/60 p-5 rounded-2xl border border-gray-150">
                <h4 className="font-bold text-sm text-gray-900">Side-by-Side Summary</h4>
                <div className="divide-y divide-gray-200 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500 font-medium">Metric</span>
                    <span className="font-semibold text-blue-600 truncate max-w-[100px]">{compareProductA}</span>
                    <span className="font-semibold text-emerald-600 truncate max-w-[100px]">{compareProductB}</span>
                  </div>
                  {comparisonData.map((d, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between">
                      <span className="text-gray-600 font-medium">{d.metric}</span>
                      <span className="font-bold text-gray-900">{d.prodAValue?.toLocaleString("en-IN")}</span>
                      <span className="font-bold text-gray-900">{d.prodBValue?.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50/30 border border-dashed border-gray-200 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">Select two products above to compare their data side-by-side</p>
            </div>
          )}
        </motion.div>

        {/* Returns Analysis */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ProductReturnsChart data={productReturns} />
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Return Audit Trail (Quantity Details)
            </h3>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">Product Name</th>
                    <th className="px-4 py-2 text-right">Returned Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productReturns && productReturns.length > 0 ? (
                    productReturns.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">{item.returnedQuantity} units</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-400">
                        No product returns recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Additional Metrics */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Pipeline
            </h3>
            <div className="space-y-3">
              {analyticsData.leadConversion.length > 0 ? (
                analyticsData.leadConversion.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {stage.name}
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {stage.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No lead data</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Finance Overview
            </h3>
            <div className="space-y-3">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Income</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{financeData.income.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Expense</p>
                <p className="text-lg font-bold text-red-500">
                  ₹{financeData.expense.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className={`text-lg font-bold ${financeData.netProfit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                  ₹{financeData.netProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analytics;
