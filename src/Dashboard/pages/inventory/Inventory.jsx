import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import InventoryDetail from "../../components/inventory/InventoryDetail";
import InventoryForm from "../../components/forms/InventoryForm";
import { useInventoryStore } from "../../store";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Boxes,
  TrendingUp,
  CirclePlus,
  X,
  Eye,
  Calculator,
  TrendingDown,
  Minus,
  Activity,
  FileBox,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetInventory, useGetLowStockAlerts } from "../../../../hook/inventory";

const Inventory = () => {
  const audioRef = useRef(null);
  const [hasPlayedAlert, setHasPlayedAlert] = useState(false);
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const deleteItem = useInventoryStore((state) => state.deleteItem);

  const { data: items = [], isLoading } = useGetInventory();
  const { data: lowStockAlerts = [] } = useGetLowStockAlerts();
  console.log(items)
  const queryClient = useQueryClient();
  const { axiosInstance, notificationOn, setNotificationOn } = useAuthContext();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [showAlerts, setShowAlerts] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");

  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (lowStockAlerts.length > 0) {
      setShowAlerts(true);
    }
  }, [lowStockAlerts.length]);

  const handleAddItem = async (data) => {
    const loadingToast = toast.loading("Creating item...");

    try {
      const response = await axiosInstance.post("/inventory/create", data);
      const item = response?.data?.data;

      toast.success("Item created successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);

      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getLowStockAlertsData"],
      });

      if (item) addItem(item);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create item",
        { id: loadingToast }
      );
    }
  };

  const handleUpdateItem = async (data) => {
    const loadingToast = toast.loading("Updating item...");

    try {
      const response = await axiosInstance.patch(
        `/inventory/${editingItem.id || editingItem._id}/update`,
        data
      );

      const updatedItem = response?.data?.data;

      toast.success("Item updated successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);
      setEditingItem(null);

      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getLowStockAlertsData"],
      });

      if (updatedItem) {
        updateItem(editingItem.id || editingItem._id, updatedItem);
        if (selectedItem?.id === (editingItem.id || editingItem._id)) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update item",
        { id: loadingToast }
      );
    }
  };

  const handleDeleteItem = async (id) => {
    const loadingToast = toast.loading("Deleting item...");

    try {
      await axiosInstance.delete(`/inventory/${id}/delete`);

      toast.success("Item deleted successfully", {
        id: loadingToast,
      });

      deleteItem(id);

      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getLowStockAlertsData"],
      });

      if (selectedItem?.id === id || selectedItem?._id === id) {
        setShowDetailPanel(false);
        setSelectedItem(null);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete item",
        { id: loadingToast }
      );
    }
  };

  const openAddStockModal = (item) => {
    setSelectedStockItem(item);
    setStockToAdd("");
    setShowStockModal(true);
  };

  const handleAddStock = async () => {
    if (!selectedStockItem) return;

    const qty = Number(stockToAdd);

    if (!qty || qty <= 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const loadingToast = toast.loading("Adding stock...");

    try {
      const response = await axiosInstance.patch(
        `/inventory/${selectedStockItem.id || selectedStockItem._id}/add-stock`,
        { quantity: qty }
      );

      const updatedItem = response?.data?.data;

      toast.success("Stock added successfully 🎉", {
        id: loadingToast,
      });

      setShowStockModal(false);
      setSelectedStockItem(null);
      setStockToAdd("");

      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getLowStockAlertsData"],
      });

      if (updatedItem) {
        updateItem(selectedStockItem.id || selectedStockItem._id, updatedItem);

        if (
          selectedItem?.id === (selectedStockItem.id || selectedStockItem._id) ||
          selectedItem?._id === (selectedStockItem.id || selectedStockItem._id)
        ) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add stock",
        { id: loadingToast }
      );
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productName?.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const stockPercentage = (stockLevel, reorderPt) => {
    if (!reorderPt || reorderPt <= 0) return 100;
    const percentage = (stockLevel / (reorderPt * 2)) * 100;
    return Math.min(percentage, 100);
  };

  const getStockStatus = (stockLevel, reorderPt) => {
    if (stockLevel <= reorderPt * 0.5) return "critical";
    if (stockLevel <= reorderPt) return "low";
    if (stockLevel <= reorderPt * 1.5) return "medium";
    return "healthy";
  };

  const statusColors = {
    healthy: "bg-emerald-500",
    medium: "bg-amber-400",
    low: "bg-red-400",
    critical: "bg-red-600",
  };

  const totalStockUnits = items.reduce(
    (sum, item) => sum + Number(item.stockLevel || 0),
    0
  );
  const totalInventoryValue = items.reduce(
    (sum, item) =>
      sum + Number(item.totalStockValue || Number(item.stockLevel || 0) * Number(item.unitPrice || 0)),
    0
  );

  const reorderCount = items.filter(
    (item) => Number(item.stockLevel) <= Number(item.reorderPt)
  ).length;

  const hasLowStock = lowStockAlerts.length > 0;

  const getAlertSeverity = (stockLevel, threshold) => {
    if (stockLevel <= Math.max(1, Math.floor(threshold * 0.5))) return "critical";
    return "warning";
  };

  const lowStockSummaryText = hasLowStock
    ? `${lowStockAlerts.length} item${lowStockAlerts.length > 1 ? "s are" : " is"} below reorder point`
    : "All stock levels look healthy";
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => { });
    }
  }, []);
  useEffect(() => {
    if (lowStockAlerts.length > 0) {
      setShowAlerts(true);

      if (!notificationOn) return;

      if (!hasPlayedAlert) {
        toast.error("Low stock alert! Please review inventory items.", {
          duration: 4000,
        });

        if (audioRef.current) {
          audioRef.current.play().catch(() => { });
        }

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Inventory Alert", {
            body: `${lowStockAlerts.length} item(s) are below reorder point.`,
          });
        }

        setHasPlayedAlert(true);
      }
    } else {
      setHasPlayedAlert(false);
    }
  }, [lowStockAlerts, hasPlayedAlert, notificationOn]);
  return (
    <Layout>
      <audio ref={audioRef} preload="auto">
        <source src="/mixkit-software-interface-remove-2576.wav" type="audio/mpeg" />
      </audio>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-xl ring-1 ring-white/10"
        >
          <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
                Inventory Control Panel
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Inventory Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                Monitor real inventory data, manage reorder points, and track stock
                activity with a clear admin dashboard.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end xl:w-auto">
              <Button
                variant={notificationOn ? "secondary" : "danger"}
                onClick={() => setNotificationOn(!notificationOn)}
                className={`rounded-2xl px-5 py-3 font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 ${notificationOn
                    ? "border border-white/20 bg-white text-emerald-800 hover:bg-emerald-50"
                    : "bg-red-500 text-white hover:bg-red-600"
                  }`}
              >
                {notificationOn ? "Notifications On" : "Notifications Off"}
              </Button>


            </div>
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total SKUs
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {items.length}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Units
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalStockUnits.toLocaleString()}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {items.reduce((sum, i) => sum + (i.reservedQuantity || 0), 0).toLocaleString()} Reserved for Orders
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {items.reduce((sum, i) => sum + (i.availableForSale || 0), 0).toLocaleString()} Ready to Sell
                  </span>
                </div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card
            className={`rounded-2xl border shadow-sm transition-all ${hasLowStock
              ? "border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-red-100"
              : "border-gray-100 bg-white"
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Low Stock Alerts
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <p
                    className={`text-3xl font-bold ${hasLowStock ? "text-red-600" : "text-gray-900"
                      }`}
                  >
                    {lowStockAlerts.length}
                  </p>

                  {hasLowStock && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Attention Needed
                    </span>
                  )}
                </div>

                <p
                  className={`mt-2 text-xs ${hasLowStock ? "text-red-600" : "text-emerald-600"
                    }`}
                >
                  {lowStockSummaryText}
                </p>

                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className={`mt-3 text-xs font-semibold transition ${hasLowStock
                    ? "text-red-700 hover:text-red-800"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {showAlerts ? "Hide details ↑" : "View details →"}
                </button>
              </div>

              <div
                className={`relative rounded-2xl p-3 ${hasLowStock ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                  }`}
              >
                {hasLowStock && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                  </span>
                )}
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Inventory Value
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {Number(totalInventoryValue).toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-emerald-600">
                  All bag stock price total
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Calculator className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Reorder Points
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {reorderCount}
                </p>
                <p className="mt-2 text-xs text-emerald-600">
                  Based on actual stock data
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        {showAlerts && lowStockAlerts.length > 0 && (
          <motion.div
            className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 p-4 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                </span>
              </div>

              <div className="flex-1">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-900">Low Stock Alerts</h3>
                    <p className="text-sm text-red-700">
                      These items are at or below their reorder point.
                    </p>
                  </div>

                  <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Immediate attention
                  </div>
                </div>

                <div className="space-y-2">
                  {lowStockAlerts.slice(0, 6).map((alert, index) => {
                    const severity = getAlertSeverity(alert.stockLevel, alert.threshold);

                    return (
                      <div
                        key={alert.id || index}
                        className="flex items-center justify-between rounded-xl border border-red-100 bg-white p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {alert.productName}
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severity === "critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {severity}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-gray-600">
                            Current stock:{" "}
                            <span className="font-semibold text-red-600">
                              {alert.stockLevel}
                            </span>{" "}
                            · Reorder point:{" "}
                            <span className="font-semibold text-gray-800">
                              {alert.threshold}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const matchedItem = items.find(
                              (item) => item.id === alert.id || item._id === alert.id
                            );
                            if (matchedItem) {
                              setSelectedItem(matchedItem);
                              setShowDetailPanel(true);
                            }
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]"
        >
          <Input
            placeholder="Search by SKU or product name..."
            value={search}
            icon={Search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="FOOD_GRADE">Food Grade</option>
            <option value="RAW_MATERIAL">Raw Material</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Inventory Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredItems.length} inventory items
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Product Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Stock Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Specifications
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Pricing & Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                      const status = getStockStatus(
                        Number(item.stockLevel),
                        Number(item.reorderPt)
                      );
                      const percentage = stockPercentage(
                        Number(item.stockLevel),
                        Number(item.reorderPt)
                      );
                      const totalValue = Number(item.totalStockValue || 0);
                      const unitPrice = Number(item.unitPrice || 0);
                      const sellingPrice = Number(item.sellingPricePerUnit || 0);

                      return (
                        <tr
                          key={item.id || item._id}
                          className="bg-white hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-200 group"
                        >
                          {/* Product Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                                {item.category === 'STANDARD' ? <Package className="w-6 h-6 text-blue-600" /> : 
                                 item.category === 'PREMIUM' ? <ShoppingBag className="w-6 h-6 text-amber-600" /> : 
                                 item.category === 'FOOD_GRADE' ? <FileBox className="w-6 h-6 text-emerald-600" /> : 
                                 <Boxes className="w-6 h-6 text-gray-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
                                  {item.productName}
                                </p>
                                <p className="text-xs font-mono font-semibold text-gray-600 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                  {item.sku}
                                </p>
                                {item.bagType && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    {item.bagType}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <Badge className={`text-xs font-semibold ${
                                item.category === 'STANDARD' ? 'bg-blue-100 text-blue-700' :
                                item.category === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                                item.category === 'FOOD_GRADE' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {item.categoryLabel}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {item.unit || 'bags'}
                              </div>
                            </div>
                          </td>

                          {/* Stock Information */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Available:</span>
                                <span className="font-bold text-emerald-600">
                                  {Number(item.availableForSale || 0).toLocaleString()} {item.unit || 'bags'}
                                </span>
                              </div>
                              {item.reservedQuantity > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Reserved:</span>
                                  <span className="font-semibold text-blue-600">
                                    {Number(item.reservedQuantity || 0).toLocaleString()} {item.unit || 'bags'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-gray-900">
                                  {Number(item.stockLevel || 0).toLocaleString()} {item.unit || 'bags'}
                                </span>
                              </div>
                              {/* Stock Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      percentage > 100 ? 'bg-emerald-500' :
                                      percentage > 50 ? 'bg-blue-500' :
                                      percentage > 25 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                  Reorder at: {Number(item.reorderPt || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Specifications */}
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-xs">
                              {item.bagColor && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Color:</span>
                                  <span className="font-medium text-gray-900">{item.bagColor}</span>
                                </div>
                              )}
                              {item.bagSizeLabel && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Size:</span>
                                  <span className="font-medium text-gray-900">{item.bagSizeLabel}</span>
                                </div>
                              )}
                              {item.dimensions && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Dims:</span>
                                  <span className="font-medium text-gray-900">
                                    {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}{item.dimensions.unit}
                                  </span>
                                </div>
                              )}
                              {!item.bagColor && !item.bagSizeLabel && !item.dimensions && (
                                <span className="text-gray-400">No specs</span>
                              )}
                            </div>
                          </td>

                          {/* Pricing & Value */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-500">Cost:</span>
                                  <span className="font-semibold text-gray-900">
                                    ₹{unitPrice.toFixed(2)}
                                  </span>
                                </div>
                                {sellingPrice > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Sell:</span>
                                    <span className="font-semibold text-emerald-600">
                                      ₹{sellingPrice.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 font-medium">Stock Value</p>
                                <p className="text-base font-bold text-emerald-700">
                                  ₹{totalValue.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <Badge
                                variant={
                                  status === "critical" ? "danger" :
                                  status === "low" ? "danger" :
                                  status === "medium" ? "warning" : "success"
                                }
                                className="text-xs font-semibold flex items-center gap-1"
                              >
                                {status === 'critical' ? <><TrendingDown className="w-3 h-3" /> Critical</> :
                                 status === 'low' ? <><Minus className="w-3 h-3" /> Low</> :
                                 status === 'medium' ? <><Activity className="w-3 h-3" /> Medium</> : 
                                 <><TrendingUp className="w-3 h-3" /> Healthy</>}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {item.isActive !== false ? (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailPanel(true);
                                }}
                                className="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openAddStockModal(item)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
                                title="Add Stock"
                              >
                                <CirclePlus className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowModal(true);
                                }}
                                className="p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item.id || item._id)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!filteredItems.length && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">No inventory items found</p>
                            <p className="text-sm text-gray-500 mt-1">Add your first inventory item to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        <Modal
          isOpen={showModal}
          title={editingItem ? "Edit Item" : "Add New Item"}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          size="xl"
        >
          <InventoryForm
            initialData={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            loading={false}
          />
        </Modal>

        <Modal
          isOpen={showStockModal}
          title="Add Stock"
          onClose={() => {
            setShowStockModal(false);
            setSelectedStockItem(null);
            setStockToAdd("");
          }}
        >
          {selectedStockItem && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold text-gray-900">
                  {selectedStockItem.productName}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs uppercase text-gray-500">
                      Current Stock
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {Number(selectedStockItem.stockLevel).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs uppercase text-gray-500">SKU</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {selectedStockItem.sku}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Add Stock Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(e.target.value)}
                  placeholder="Enter quantity to add"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  New stock level:
                  <span className="ml-2 font-semibold text-gray-900">
                    {(
                      Number(selectedStockItem.stockLevel || 0) +
                      Number(stockToAdd || 0)
                    ).toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedStockItem(null);
                    setStockToAdd("");
                  }}
                >
                  Cancel
                </Button>

                <Button onClick={handleAddStock}>Add Stock</Button>
              </div>
            </div>
          )}
        </Modal>

        {showDetailPanel && selectedItem && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowDetailPanel(false)}
            />

            <motion.div
              className="relative h-screen w-full max-w-5xl overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 800 }}
              animate={{ x: 0 }}
              exit={{ x: 800 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Inventory Details
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingItem(selectedItem);
                      setShowModal(true);
                      setShowDetailPanel(false);
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <InventoryDetail
                  item={selectedItem}
                  onClose={() => setShowDetailPanel(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;