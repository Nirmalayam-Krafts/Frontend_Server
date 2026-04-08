import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import { InventoryForm } from "../../components/forms";
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
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
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
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Inventory Overview
                </h2>
                <p className="text-sm text-gray-500">
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
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Product Name
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Stock Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Reorder Pt
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredItems.map((item) => {
                      const status = getStockStatus(
                        Number(item.stockLevel),
                        Number(item.reorderPt)
                      );
                      const percentage = stockPercentage(
                        Number(item.stockLevel),
                        Number(item.reorderPt)
                      );

                      return (
                        <tr
                          key={item.id || item._id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {item.sku}
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.categoryLabel}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <Badge variant="secondary">
                              {item.categoryLabel}
                            </Badge>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-xs font-semibold text-blue-600">
                                  {Number(item.reservedQuantity || 0).toLocaleString()} {item.unit || "Units"} Reserved
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600">
                                  {Number(item.availableForSale || 0).toLocaleString()} {item.unit || "Units"} Ready
                                </span>
                              </div>
                              <div className="mt-1 border-t border-gray-50 pt-1 text-[10px] font-medium text-gray-400">
                                Total: {Number(item.stockLevel || 0).toLocaleString()} Units
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {Number(item.reorderPt || 0).toLocaleString()} units
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-full max-w-[140px] rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full transition-all ${statusColors[status]}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>

                              <Badge
                                variant={
                                  status === "critical"
                                    ? "danger"
                                    : status === "low"
                                      ? "danger"
                                      : status === "medium"
                                        ? "warning"
                                        : "success"
                                }
                              >
                                {status === "healthy"
                                  ? "Healthy"
                                  : status === "medium"
                                    ? "Medium"
                                    : status === "low"
                                      ? "Low"
                                      : "Critical"}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailPanel(true);
                                }}
                                className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                                title="View Item"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openAddStockModal(item)}
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Add Stock"
                              >
                                <CirclePlus className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowModal(true);
                                }}
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                title="Edit Item"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item.id || item._id)}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                title="Delete Item"
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
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          No inventory items found.
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
        >
          <InventoryForm
            initialData={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
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
              className="relative h-screen w-full max-w-md overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Inventory Detail
                  </h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedItem.productName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{selectedItem.sku}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Category
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedItem.categoryLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Stock Level
                    </p>
                    <p className="mt-1 text-gray-900">
                      {Number(selectedItem.stockLevel).toLocaleString()} units
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Reorder Point
                    </p>
                    <p className="mt-1 text-gray-900">
                      {Number(selectedItem.reorderPt).toLocaleString()} units
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Unit
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedItem.unit || "units"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Description
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedItem.description || "No description added"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Stock History
                    </p>
                    <div className="mt-2 space-y-2">
                      {(selectedItem.stockHistory || []).length > 0 ? (
                        selectedItem.stockHistory.slice().reverse().map((log, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-gray-50 p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {log.action} · {log.quantity} units
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.note || "Stock activity"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No stock history available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailPanel(false)}
                  >
                    Close
                  </Button>

                  <Button
                    onClick={() => {
                      setEditingItem(selectedItem);
                      setShowModal(true);
                      setShowDetailPanel(false);
                    }}
                  >
                    Edit Item
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;