import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import { InventoryForm } from "../../components/forms";
import { useInventoryStore, useUIStore } from "../../store";
import { inventoryAPI } from "../../services/api";
import { Plus, Search, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const Inventory = () => {
  const items = useInventoryStore((state) => state.items);
  const setItems = useInventoryStore((state) => state.setItems);
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const deleteItem = useInventoryStore((state) => state.deleteItem);

  const showNotification = useUIStore((state) => state.showNotification);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const [inventoryRes, alertsRes] = await Promise.all([
          inventoryAPI.getInventory(),
          inventoryAPI.getLowStockAlerts(),
        ]);

        if (inventoryRes.success) {
          setItems(inventoryRes.data);
        }
        if (alertsRes.success) {
          setLowStockAlerts(alertsRes.data);
        }
      } catch (error) {
        showNotification("Failed to load inventory", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleAddItem = async (data) => {
    try {
      const response = await inventoryAPI.createItem(data);
      if (response.success) {
        addItem(response.data);
        setShowModal(false);
        showNotification("Item added successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to add item", "error");
    }
  };

  const handleUpdateItem = async (data) => {
    try {
      const response = await inventoryAPI.updateItem(editingItem.id, data);
      if (response.success) {
        updateItem(editingItem.id, data);
        setShowModal(false);
        setEditingItem(null);
        showNotification("Item updated successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to update item", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await inventoryAPI.deleteItem(id);
      if (response.success) {
        deleteItem(id);
        showNotification("Item deleted successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to delete item", "error");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const stockPercentage = (stockLevel, reorderPt) => {
    const percentage = (stockLevel / (reorderPt * 2)) * 100;
    return Math.min(percentage, 100);
  };

  const getStockStatus = (stockLevel, reorderPt) => {
    if (stockLevel < reorderPt) return "low";
    if (stockLevel < reorderPt * 1.5) return "medium";
    return "healthy";
  };

  const statusColors = {
    healthy: "bg-green-400",
    medium: "bg-yellow-400",
    low: "bg-red-400",
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="text-gray-600">
                Real-time stock monitoring and distribution controls.
              </p>
            </div>
            <Button
              icon={Plus}
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
              }}
            >
              Add New Item
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">TOTAL SKUS</p>
            <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              LOW STOCK ALERTS
            </p>
            <p className="text-3xl font-bold text-red-600">
              {lowStockAlerts.length}
            </p>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-xs text-red-600 font-medium mt-2 hover:underline"
            >
              View details →
            </button>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              PRODUCTION VOLUME
            </p>
            <p className="text-2xl font-bold text-green-600">+14%</p>
            <p className="text-xs text-green-600 mt-1">this month</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              REORDER POINTS
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {items.filter((i) => i.stockLevel < i.reorderPt).length}
            </p>
          </Card>
        </motion.div>

        {/* Alerts */}
        {showAlerts && lowStockAlerts.length > 0 && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Low Stock Alerts
                </h3>
                <div className="space-y-1">
                  {lowStockAlerts.slice(0, 5).map((alert) => (
                    <p key={alert.id} className="text-sm text-red-800">
                      {alert.productName} - Only {alert.stockLevel} units left
                      (Threshold: {alert.threshold})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex-1">
            <Input
              placeholder="Search by SKU or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
          >
            <option value="All">All Categories</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="FOOD_GRADE">Food Grade</option>
            <option value="RAW_MATERIAL">Raw Material</option>
          </select>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      SKU
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      PRODUCT NAME
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      CATEGORY
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      STOCK LEVEL
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      REORDER PT
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(
                      item.stockLevel,
                      item.reorderPt,
                    );
                    const percentage = stockPercentage(
                      item.stockLevel,
                      item.reorderPt,
                    );

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {item.sku}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">
                            {item.categoryLabel}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.stockLevel.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.reorderPt.toLocaleString()} units
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                              <div
                                className={`h-2 rounded-full transition-all ${statusColors[status]}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <Badge
                              variant={
                                status === "low"
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
                                  : "Low"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Modal */}
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
      </div>
    </Layout>
  );
};

export default Inventory;
