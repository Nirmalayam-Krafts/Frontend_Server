import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  Pagination,
} from "../../components/ui";
import {
  Plus,
  Search,
  Eye,
  ShoppingBag,
  Package,
  Wallet,
  CalendarDays,
  Building2,
  Phone,
  Mail,
  Palette,
  Ruler,
  FileText,
  User2,
  Filter,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";

import { useUIStore } from "../../store";
import { useGetAllOrders } from "../../../../hook/order";

const initialManualOrderForm = {
  customerName: "",
  businessName: "",
  phone: "",
  email: "",
  productCategory: "",
  source: "Manual Order",
  bagSize: "",
  color: "",
  quantity: "",
  length: "",
  width: "",
  height: "",
  dimensionUnit: "inch",
  paymentType: "partial",
  partialPaidAmount: "",
  fullPaidAmount: "",
  notes: "",
};

const Orders = () => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((state) => state.showNotification);

  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [manualOrderForm, setManualOrderForm] = useState(initialManualOrderForm);

  const limit = 10;

  const { data, isLoading, refetch } = useGetAllOrders({
    search,
    page: currentPage,
    limit,
    ...(orderStatusFilter !== "All" ? { orderStatus: orderStatusFilter } : {}),
    ...(paymentStatusFilter !== "All"
      ? { paymentStatus: paymentStatusFilter }
      : {}),
  });

  const rawOrders = data?.orders || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const formattedOrders = useMemo(() => {
    return rawOrders.map((order) => {
      const amount =
        order?.payment?.paymentType === "full"
          ? order?.payment?.fullPaidAmount || 0
          : order?.payment?.partialPaidAmount || 0;

      return {
        id: order?._id,
        leadId: order?.leadId?._id || order?.leadId || null,
        customerName: order?.customerName || "Unknown",
        businessName: order?.businessName || "—",
        phone: order?.phone || "—",
        email: order?.email || "—",
        productCategory: order?.productCategory || "—",
        source: order?.source || "Manual",
        orderStatus: order?.orderStatus || "Pending",
        paymentStatus: order?.paymentStatus || "Unpaid",
        orderStatusKey: (order?.orderStatus || "Pending").toUpperCase(),
        paymentStatusKey: (order?.paymentStatus || "Unpaid").toUpperCase(),
        date: order?.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "—",
        fullDate: order?.createdAt || "",
        notes: order?.notes || "",
        amount,
        payment: order?.payment || {},
        orderDetails: order?.orderDetails || {},
        avatar: (order?.customerName || "U")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      };
    });
  }, [rawOrders]);

  const totalOrders = pagination?.total || formattedOrders.length;
  const pendingCount = rawOrders.filter(
    (o) => o.orderStatus === "Pending"
  ).length;
  const processingCount = rawOrders.filter(
    (o) => o.orderStatus === "Processing"
  ).length;
  const completedCount = rawOrders.filter(
    (o) => o.orderStatus === "Completed"
  ).length;
  const partialPaidCount = rawOrders.filter(
    (o) => o.paymentStatus === "Partial Paid"
  ).length;

  const orderStatusColors = {
    PENDING: "warning",
    PROCESSING: "primary",
    COMPLETED: "success",
    CANCELLED: "danger",
  };

  const paymentColors = {
    UNPAID: "danger",
    "PARTIAL PAID": "warning",
    PAID: "success",
  };

  const handleFormChange = (field, value) => {
    setManualOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetManualOrderForm = () => {
    setManualOrderForm(initialManualOrderForm);
    setShowCreateModal(false);
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();

    if (
      !manualOrderForm.customerName ||
      !manualOrderForm.phone ||
      !manualOrderForm.productCategory ||
      !manualOrderForm.bagSize ||
      !manualOrderForm.color ||
      !manualOrderForm.quantity ||
      !manualOrderForm.length ||
      !manualOrderForm.width ||
      !manualOrderForm.height
    ) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    if (
      manualOrderForm.paymentType === "partial" &&
      !manualOrderForm.partialPaidAmount
    ) {
      showNotification("Please enter partial paid amount", "error");
      return;
    }

    if (
      manualOrderForm.paymentType === "full" &&
      !manualOrderForm.fullPaidAmount
    ) {
      showNotification("Please enter full paid amount", "error");
      return;
    }

    const loadingToast = toast.loading("Creating manual order...");

    try {
      const payload = {
        customerName: manualOrderForm.customerName,
        businessName: manualOrderForm.businessName,
        phone: manualOrderForm.phone,
        email: manualOrderForm.email,
        productCategory: manualOrderForm.productCategory,
        source: manualOrderForm.source,
        orderDetails: {
          bagSize: manualOrderForm.bagSize,
          color: manualOrderForm.color,
          quantity: Number(manualOrderForm.quantity),
          dimensions: {
            length: Number(manualOrderForm.length),
            width: Number(manualOrderForm.width),
            height: Number(manualOrderForm.height),
            unit: manualOrderForm.dimensionUnit,
          },
        },
        payment: {
          paymentType: manualOrderForm.paymentType,
          partialPaidAmount:
            manualOrderForm.paymentType === "partial"
              ? Number(manualOrderForm.partialPaidAmount || 0)
              : 0,
          fullPaidAmount:
            manualOrderForm.paymentType === "full"
              ? Number(manualOrderForm.fullPaidAmount || 0)
              : 0,
        },
        notes: manualOrderForm.notes,
      };

      await axiosInstance.post("/order/create", payload);

      toast.success("Order created successfully 🎉", { id: loadingToast });

      queryClient.invalidateQueries({
        queryKey: ["getAllOrders"],
      });

      await refetch();
      resetManualOrderForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create order",
        { id: loadingToast }
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Orders Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                View all orders, manually create new orders, and track payment,
                bag details, dimensions, and customer information in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
                Create Manual Order
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
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {pendingCount}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Clock3 className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Processing
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {processingCount}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Completed / Partial Paid
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {completedCount} / {partialPaidCount}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto]"
        >
          <Input
            placeholder="Search by customer, business, phone, email, bag size, or color..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={orderStatusFilter}
            onChange={(e) => {
              setOrderStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All Order Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All Payment Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial Paid">Partial Paid</option>
            <option value="Paid">Paid</option>
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
                <p className="text-sm text-gray-500">
                  Showing {formattedOrders.length} of {totalOrders} orders
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
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Customer
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Business
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Bag Details
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Order Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Payment
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {formattedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              {order.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {order.customerName}
                              </p>
                              <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                                <p className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {order.email}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {order.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {order.businessName}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {order.productCategory}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="space-y-1">
                            <p>
                              <span className="font-semibold">Size:</span>{" "}
                              {order.orderDetails?.bagSize || "—"}
                            </p>
                            <p>
                              <span className="font-semibold">Color:</span>{" "}
                              {order.orderDetails?.color || "—"}
                            </p>
                            <p>
                              <span className="font-semibold">Qty:</span>{" "}
                              {order.orderDetails?.quantity || "—"}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              orderStatusColors[order.orderStatusKey] || "primary"
                            }
                          >
                            {order.orderStatus}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              paymentColors[order.paymentStatusKey] || "primary"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          ₹{Number(order.amount || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {order.date}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailPanel(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!formattedOrders.length && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {(pagination?.totalPages || 1) > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </motion.div>

        <Modal
          isOpen={showCreateModal}
          title="Create Manual Order"
          onClose={resetManualOrderForm}
        >
          <form onSubmit={handleCreateManualOrder} className="space-y-5">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Manual Order Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a new order manually and send all details to the same
                    backend route.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="mb-4 flex items-center gap-2">
                <User2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-bold text-gray-800">
                  Customer Information
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.customerName}
                    onChange={(e) =>
                      handleFormChange("customerName", e.target.value)
                    }
                    placeholder="Enter customer name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.businessName}
                    onChange={(e) =>
                      handleFormChange("businessName", e.target.value)
                    }
                    placeholder="Enter business name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualOrderForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="Enter email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.productCategory}
                    onChange={(e) =>
                      handleFormChange("productCategory", e.target.value)
                    }
                    placeholder="Eco Bags / Kraft Bags / Food Bags"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Source
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.source}
                    onChange={(e) => handleFormChange("source", e.target.value)}
                    placeholder="Manual Order"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-bold text-gray-800">Bag Details</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Bag Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.bagSize}
                    onChange={(e) => handleFormChange("bagSize", e.target.value)}
                    placeholder="Small / Medium / Large"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Bag Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOrderForm.color}
                    onChange={(e) => handleFormChange("color", e.target.value)}
                    placeholder="Brown / White / Green"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualOrderForm.quantity}
                    onChange={(e) => handleFormChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Dimension Unit
                  </label>
                  <select
                    value={manualOrderForm.dimensionUnit}
                    onChange={(e) =>
                      handleFormChange("dimensionUnit", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="inch">Inch</option>
                    <option value="cm">CM</option>
                    <option value="mm">MM</option>
                    <option value="ft">Feet</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-bold text-gray-800">Dimensions</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Length <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualOrderForm.length}
                      onChange={(e) => handleFormChange("length", e.target.value)}
                      placeholder="Length"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Width <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualOrderForm.width}
                      onChange={(e) => handleFormChange("width", e.target.value)}
                      placeholder="Width"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Height <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualOrderForm.height}
                      onChange={(e) => handleFormChange("height", e.target.value)}
                      placeholder="Height"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-bold text-gray-800">Payment Details</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Payment Type
                  </label>
                  <select
                    value={manualOrderForm.paymentType}
                    onChange={(e) =>
                      handleFormChange("paymentType", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="partial">Partial Paid</option>
                    <option value="full">Full Paid</option>
                  </select>
                </div>

                {manualOrderForm.paymentType === "partial" ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Partial Paid Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualOrderForm.partialPaidAmount}
                      onChange={(e) =>
                        handleFormChange("partialPaidAmount", e.target.value)
                      }
                      placeholder="Enter partial amount"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Paid Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualOrderForm.fullPaidAmount}
                      onChange={(e) =>
                        handleFormChange("fullPaidAmount", e.target.value)
                      }
                      placeholder="Enter full amount"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="h-4 w-4 text-emerald-600" />
                Notes
              </label>
              <textarea
                rows={4}
                value={manualOrderForm.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder="Write notes, customer special requirement, design detail, etc."
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={resetManualOrderForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Create Order
              </Button>
            </div>
          </form>
        </Modal>

        {showDetailPanel && selectedOrder && (
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
              className="relative h-screen w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Detail</h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {selectedOrder.avatar}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedOrder.customerName}
                      </p>
                      <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Order Status
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant={
                            orderStatusColors[selectedOrder.orderStatusKey] || "primary"
                          }
                        >
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Payment Status
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant={
                            paymentColors[selectedOrder.paymentStatusKey] || "primary"
                          }
                        >
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Business Name
                    </p>
                    <p className="mt-1 text-gray-900">{selectedOrder.businessName}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Phone
                    </p>
                    <p className="mt-1 text-gray-900">{selectedOrder.phone}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Product Category
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedOrder.productCategory}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Source
                    </p>
                    <p className="mt-1 text-gray-900">{selectedOrder.source}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Bag Details
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Bag Size</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.bagSize || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Color</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.color || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Quantity</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.quantity || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Amount</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹{Number(selectedOrder.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Dimensions
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Length</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.dimensions?.length || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Width</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.dimensions?.width || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Height</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.dimensions?.height || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Unit</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.orderDetails?.dimensions?.unit || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Payment Details
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Type</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.payment?.paymentType || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Partial Paid
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹
                          {Number(
                            selectedOrder.payment?.partialPaidAmount || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Full Paid
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹
                          {Number(
                            selectedOrder.payment?.fullPaidAmount || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Notes
                    </p>
                    <p className="mt-2 whitespace-pre-line text-gray-900">
                      {selectedOrder.notes || "No notes added."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Created On
                    </p>
                    <p className="mt-1 text-gray-900">{selectedOrder.date}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailPanel(false)}
                  >
                    Close
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

export default Orders;