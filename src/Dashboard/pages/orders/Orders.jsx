import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import { OrderForm } from "../../components/forms";
import { useOrdersStore, useUIStore } from "../../store";
import { ordersAPI } from "../../services/api";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const Orders = () => {
  const orders = useOrdersStore((state) => state.orders);
  const setOrders = useOrdersStore((state) => state.setOrders);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const updateOrder = useOrdersStore((state) => state.updateOrder);

  const showNotification = useUIStore((state) => state.showNotification);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        showNotification("Failed to load orders", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCreateOrder = async (data) => {
    try {
      const response = await ordersAPI.createOrder(data);
      if (response.success) {
        addOrder(response.data);
        setShowModal(false);
        showNotification("Order created successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to create order", "error");
    }
  };

  const handleUpdateOrder = async (data) => {
    try {
      const response = await ordersAPI.updateOrder(selectedOrder.id, data);
      if (response.success) {
        updateOrder(selectedOrder.id, data);
        setShowDetailModal(false);
        showNotification("Order updated successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to update order", "error");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    PENDING: "warning",
    PROCESSING: "primary",
    DISPATCHED: "secondary",
    DELIVERED: "success",
  };

  const paymentColors = {
    PAID: "success",
    PENDING: "danger",
    PARTIAL: "warning",
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
                Orders Management
              </h1>
              <p className="text-gray-600">
                Track and manage all orders and shipments.
              </p>
            </div>
            <Button icon={Plus} onClick={() => setShowModal(true)}>
              Create Order
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
            <p className="text-sm font-medium text-gray-600 mb-1">
              TOTAL ORDERS
            </p>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">PENDING</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">DISPATCHED</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "DISPATCHED").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">DELIVERED</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter((o) => o.status === "DELIVERED").length}
            </p>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex-1">
            <Input
              placeholder="Search by order ID or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
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
                      ORDER ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      CLIENT NAME
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ORDER STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      PAYMENT STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      AMOUNT
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      DATE
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {order.clientName}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusColors[order.status]}>
                          {order.statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={paymentColors[order.paymentStatus]}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {order.amount}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {order.date}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Create Order Modal */}
        <Modal
          isOpen={showModal}
          title="Create New Order"
          onClose={() => setShowModal(false)}
        >
          <OrderForm onSubmit={handleCreateOrder} />
        </Modal>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Modal
            isOpen={showDetailModal}
            title="Order Details"
            onClose={() => setShowDetailModal(false)}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  ORDER ID
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedOrder.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  CLIENT
                </p>
                <p className="text-gray-900">{selectedOrder.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  STATUS
                </p>
                <Badge
                  variant={statusColors[selectedOrder.status]}
                  className="mt-2"
                >
                  {selectedOrder.statusLabel}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  PAYMENT
                </p>
                <Badge
                  variant={paymentColors[selectedOrder.paymentStatus]}
                  className="mt-2"
                >
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  AMOUNT
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedOrder.amount}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
