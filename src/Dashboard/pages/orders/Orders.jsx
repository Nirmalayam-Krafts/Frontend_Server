import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Ruler,
  FileText,
  User2,
  Clock3,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Factory,
  ShieldCheck,
  Download,
  Share2,
  MessageCircle,
  RefreshCw,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useUIStore } from "../../store";
import { useGetAllOrders } from "../../../../hook/order";
import { useGetInventory } from "../../../../hook/inventory";

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
  notes: "",
};

const initialConfirmOrderForm = {
  totalAmount: "",
  paidAmount: "",
  paymentMode: "cash",
  deliveryAddress: "",
  deliveryDate: "",
  dispatchDate: "",
  receiverName: "",
  receiverPhone: "",
  deliveryNotes: "",
};

const Orders = () => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((state) => state.showNotification);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showReportPreview, setShowReportPreview] = useState(false);

  const [manualOrderForm, setManualOrderForm] = useState(initialManualOrderForm);

  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityOrder, setAvailabilityOrder] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [deductionMode, setDeductionMode] = useState("AUTO");
  const [confirmOrderForm, setConfirmOrderForm] = useState(initialConfirmOrderForm);

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

  const { data: inventoryData } = useGetInventory();

  const inventoryItems = useMemo(() => {
    if (Array.isArray(inventoryData)) return inventoryData;
    if (Array.isArray(inventoryData?.items)) return inventoryData.items;
    if (Array.isArray(inventoryData?.inventory)) return inventoryData.inventory;
    if (Array.isArray(inventoryData?.products)) return inventoryData.products;
    if (Array.isArray(inventoryData?.data)) return inventoryData.data;
    return [];
  }, [inventoryData]);

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
        totalAmount: order?.totalAmount || 0,
        paidAmount: order?.paidAmount || 0,
        orderStatusKey: (order?.orderStatus || "Pending").toUpperCase(),
        paymentStatusKey: (order?.paymentStatus || "Unpaid").toUpperCase(),
        date: order?.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "—",
        fullDate: order?.createdAt || "",
        notes: order?.notes || "",
        payment: order?.payment || {},
        orderDetails: order?.orderDetails || {},
        confirmedPayment: order?.confirmedPayment || {},
        delivery: order?.delivery || {},
        inventoryCheck: order?.inventoryCheck || {},
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
  const pendingCount = rawOrders.filter((o) => o.orderStatus === "Pending").length;
  const processingCount = rawOrders.filter((o) => o.orderStatus === "Processing").length;
  const completedCount = rawOrders.filter((o) => o.orderStatus === "Completed").length;
  const partialPaidCount = rawOrders.filter(
    (o) => o.paymentStatus === "Partial Paid"
  ).length;

  const orderStatusColors = {
    PENDING: "warning",
    PROCESSING: "primary",
    CONFIRMED: "success",
    COMPLETED: "success",
    CANCELLED: "danger",
  };

  const paymentColors = {
    UNPAID: "danger",
    "PARTIAL PAID": "warning",
    PAID: "success",
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

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

  const handleConfirmOrderChange = (field, value) => {
    setConfirmOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetAvailabilityModal = () => {
    setAvailabilityModalOpen(false);
    setAvailabilityOrder(null);
    setAvailabilityResult(null);
    setConfirmOrderForm(initialConfirmOrderForm);
    setCheckingOrderId(null);
  };

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const toNumber = (value) => {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  };

  const getInventoryQuantity = (item) => {
    return (
    
   
      Number(item?.stockLevel) ||
     
      0
    );
  };

  const getInventoryName = (item) => {
    return (
      item?.productName ||
      item?.name ||
      item?.bagName ||
      item?.title ||
      item?.productCategory ||
      item?.category ||
      ""
    );
  };

  const getInventoryDimensions = (item) => {
    const dimensions = item?.dimensions || item?.dimension || {};

    return {
      length:
        Number(dimensions?.length) ||
        Number(item?.length) ||
        Number(item?.l) ||
        0,
      width:
        Number(dimensions?.width) ||
        Number(item?.width) ||
        Number(item?.w) ||
        0,
      height:
        Number(dimensions?.height) ||
        Number(item?.height) ||
        Number(item?.h) ||
        0,
      unit:
        dimensions?.unit || item?.dimensionUnit || item?.unit || "inch",
    };
  };

  const isSameDimension = (inventoryItem, order) => {
    const inv = getInventoryDimensions(inventoryItem);
    const dim = order?.orderDetails?.dimensions || {};

    return (
      toNumber(inv.length) === toNumber(dim.length) &&
      toNumber(inv.width) === toNumber(dim.width) &&
      toNumber(inv.height) === toNumber(dim.height) &&
      normalizeText(inv.unit || "inch") === normalizeText(dim.unit || "inch")
    );
  };

  const handleCheckOrderAvailability = async (order) => {
    setCheckingOrderId(order.id);
    setAvailabilityOrder(order);
    setAvailabilityResult(null);
    setConfirmOrderForm(initialConfirmOrderForm);
    setAvailabilityModalOpen(true);
    setCheckingOrderId(order.id || order._id);

    try {
      //  REAL API CALL to the Smart Inventory Brain
      const resp = await axiosInstance.get(
        `/orders/${order.id || order._id}/availability`,
        { params: { mode: deductionMode } }
      );

      if (resp.data.success) {
        const resData = resp.data.data;
        setAvailabilityResult({
          enoughStock: resData.isAvailable,
          canFulfillFromStock: resData.canFulfillFromStock,
          requiredFromProduction: resData.requiredFromProduction,
          materialRequirements: resData.materialRequirements,
          missingMaterials: resData.missingMaterials,
          requiredQty: Number(order?.orderDetails?.quantity || 0),
          message: resData.isAvailable 
            ? "Order can be fulfilled using current logic mode." 
            : "Insufficient raw materials or stock for this mode."
        });
      }
    } catch (err) {
      console.error("Availability Check Failed:", err);
      showNotification("Failed to check smart availability", "error");
    } finally {
      setCheckingOrderId(null);
    }
  };

  const handleConfirmExistingOrder = async () => {
    if (!availabilityOrder) return;

    if (!availabilityResult?.enoughStock) {
      showNotification("Insufficient stock/materials for this order", "error");
      return;
    }

    if (
      !confirmOrderForm.deliveryAddress ||
      !confirmOrderForm.deliveryDate ||
      !confirmOrderForm.dispatchDate
    ) {
      showNotification("Please fill all confirm order details", "error");
      return;
    }

    const loadingToast = toast.loading("Confirming order...");

    try {
      const payload = {
        totalAmount: Number(confirmOrderForm.totalAmount || 0),
        paidAmount: Number(confirmOrderForm.paidAmount || 0),
        paymentMode: confirmOrderForm.paymentMode,
        receiverName: confirmOrderForm.receiverName,
        receiverPhone: confirmOrderForm.receiverPhone,
        deliveryAddress: confirmOrderForm.deliveryAddress,
        deliveryDate: confirmOrderForm.deliveryDate,
        dispatchDate: confirmOrderForm.dispatchDate,
        deliveryNotes: confirmOrderForm.deliveryNotes,
        productId: availabilityOrder.orderDetails?.productId || null,
        deductionMode: deductionMode,
        inventoryMatchedItemId:
          availabilityResult?.item?._id || availabilityResult?.item?.id || null,
        matchedProductName:
          availabilityResult?.item?.productName ||
          availabilityResult?.item?.name ||
          availabilityOrder?.productCategory ||
          "",
        availableQtyAtCheck: Number(availabilityResult?.canFulfillFromStock || 0),
        requiredQtyAtCheck: Number(availabilityResult?.requiredQty || 0),
        isAvailable: Boolean(availabilityResult?.enoughStock),
      };

      await axiosInstance.patch(`/orders/${availabilityOrder.id}/confirm`, payload);

      toast.success("Order confirmed successfully 🎉", { id: loadingToast });

      resetAvailabilityModal();

      queryClient.invalidateQueries({
        queryKey: ["getAllOrders"],
      });

      await refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to confirm order",
        { id: loadingToast }
      );
    }
  };

  const getOrderReportData = (order) => {
    return {
      companyName: "Nirmalyam Krafts",
      reportTitle: "Order Report",
      customerName: order?.customerName || "—",
      businessName: order?.businessName || "—",
      phone: order?.phone || "—",
      email: order?.email || "—",
      productCategory: order?.productCategory || "—",
      source: order?.source || "—",
      orderStatus: order?.orderStatus || "—",
      paymentStatus: order?.paymentStatus || "—",
      bagSize: order?.orderDetails?.bagSize || "—",
      color: order?.orderDetails?.color || "—",
      quantity: order?.orderDetails?.quantity || 0,
      length: order?.orderDetails?.dimensions?.length || 0,
      width: order?.orderDetails?.dimensions?.width || 0,
      height: order?.orderDetails?.dimensions?.height || 0,
      unit: order?.orderDetails?.dimensions?.unit || "inch",
      paymentType: order?.payment?.paymentType || "—",
      partialPaidAmount: order?.payment?.partialPaidAmount || 0,
      fullPaidAmount: order?.payment?.fullPaidAmount || 0,
      notes: order?.notes || "No notes added",
      createdAt: order?.date || "—",
      deliveryAddress: order?.delivery?.deliveryAddress || "Not added",
      deliveryDate: order?.delivery?.deliveryDate
        ? new Date(order.delivery.deliveryDate).toLocaleDateString()
        : "Not added",
      dispatchDate: order?.delivery?.dispatchDate
        ? new Date(order.delivery.dispatchDate).toLocaleDateString()
        : "Not added",
      receiverName: order?.delivery?.receiverName || "Not added",
      receiverPhone: order?.delivery?.receiverPhone || "Not added",
      deliveryNotes: order?.delivery?.deliveryNotes || "Not added",
      confirmedPaidAmount: order?.confirmedPayment?.paidAmount || 0,
      confirmedPaymentMode: order?.confirmedPayment?.paymentMode || "Not added",
    };
  };

  const generateOrderPDF = (order) => {
    const report = getOrderReportData(order);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(10, 92, 67);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(report.companyName, 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(report.reportTitle, 14, 22);

    doc.setTextColor(30, 30, 30);

    autoTable(doc, {
      startY: 38,
      head: [["Customer Details", "Value"]],
      body: [
        ["Customer Name", report.customerName],
        ["Business Name", report.businessName],
        ["Phone", report.phone],
        ["Email", report.email],
        ["Source", report.source],
        ["Created At", report.createdAt],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 92, 67] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Product Details", "Value"]],
      body: [
        ["Product Category", report.productCategory],
        ["Bag Size", report.bagSize],
        ["Color", report.color],
        ["Quantity", String(report.quantity)],
        ["Dimensions", `${report.length} × ${report.width} × ${report.height} ${report.unit}`],
        ["Order Status", report.orderStatus],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 92, 67] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Payment Details", "Value"]],
      body: [
        ["Payment Status", report.paymentStatus],
        ["Payment Type", report.paymentType],
        ["Partial Paid Amount", formatCurrency(report.partialPaidAmount)],
        ["Full Paid Amount", formatCurrency(report.fullPaidAmount)],
        ["Confirmed Paid Amount", formatCurrency(report.confirmedPaidAmount)],
        ["Payment Mode", report.confirmedPaymentMode],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 92, 67] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Delivery Details", "Value"]],
      body: [
        ["Receiver Name", report.receiverName],
        ["Receiver Phone", report.receiverPhone],
        ["Delivery Address", report.deliveryAddress],
        ["Delivery Date", report.deliveryDate],
        ["Dispatch Date", report.dispatchDate],
        ["Delivery Notes", report.deliveryNotes],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 92, 67] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Notes"]],
      body: [[report.notes]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 92, 67] },
    });

    doc.save(`Nirmalyam_Krafts_Order_${order?.id || "report"}.pdf`);
  };

  const handleShareOrder = async (order) => {
    const report = getOrderReportData(order);

    const shareText = `
Nirmalyam Krafts - Order Report

Customer: ${report.customerName}
Business: ${report.businessName}
Phone: ${report.phone}
Product: ${report.productCategory}
Bag Size: ${report.bagSize}
Color: ${report.color}
Quantity: ${report.quantity}
Dimensions: ${report.length} × ${report.width} × ${report.height} ${report.unit}
Order Status: ${report.orderStatus}
Payment Status: ${report.paymentStatus}
Delivery Address: ${report.deliveryAddress}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nirmalyam Krafts - Order Report",
          text: shareText,
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      showNotification("Order report copied to clipboard", "success");
    }
  };

  const handleWhatsAppShare = (order) => {
    const report = getOrderReportData(order);

    const message = `
*Nirmalyam Krafts - Order Report*

*Customer:* ${report.customerName}
*Business:* ${report.businessName}
*Phone:* ${report.phone}
*Product:* ${report.productCategory}
*Bag Size:* ${report.bagSize}
*Color:* ${report.color}
*Quantity:* ${report.quantity}
*Dimensions:* ${report.length} × ${report.width} × ${report.height} ${report.unit}
*Order Status:* ${report.orderStatus}
*Payment Status:* ${report.paymentStatus}
*Delivery Address:* ${report.deliveryAddress}
*Delivery Date:* ${report.deliveryDate}
*Dispatch Date:* ${report.dispatchDate}
*Notes:* ${report.notes}
    `.trim();

    const phone = String(order?.phone || "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const loadingToast = toast.loading(`Updating order to ${newStatus}...`);
    try {
      const orderToUpdate = formattedOrders.find((o) => o.id === orderId);

      const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
        newStatus,
        productId: orderToUpdate?.orderDetails?.productId || null,
        deductionMode: "AUTO",
      });

      if (response.data.success) {
        toast.success(`Order moved to ${newStatus} 🏭`, { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["getOrdersData"] });
        queryClient.invalidateQueries({ queryKey: ["getInventoryData"] });
        refetch();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status", {
        id: loadingToast,
      });
    }
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
        payment: { paymentType: "partial", partialPaidAmount: 0 },
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
  const buildClientOrderLogs = (order) => {
    if (!order) return [];

    const logs = [];

    if (order?.leadId) {
      logs.push({
        type: "lead",
        title: "Lead Converted to Order",
        description: "This order was created from an existing lead.",
        time: order?.fullDate || order?.date,
        status: "done",
        meta: {
          leadId: order?.leadId,
          customerName: order?.customerName,
          businessName: order?.businessName,
        },
      });
    }

    logs.push({
      type: "order",
      title: "Order Created",
      description: "Order was created in the system.",
      time: order?.fullDate || order?.date,
      status: "done",
      meta: {
        customerName: order?.customerName,
        phone: order?.phone,
        email: order?.email,
        productCategory: order?.productCategory,
        source: order?.source,
      },
    });

    logs.push({
      type: "product",
      title: "Product Details Added",
      description: "Product details and bag specifications were added.",
      time: order?.fullDate || order?.date,
      status: "done",
      meta: {
        bagSize: order?.orderDetails?.bagSize || "—",
        color: order?.orderDetails?.color || "—",
        quantity: order?.orderDetails?.quantity || 0,
        dimensions: `${order?.orderDetails?.dimensions?.length || 0} × ${order?.orderDetails?.dimensions?.width || 0
          } × ${order?.orderDetails?.dimensions?.height || 0} ${order?.orderDetails?.dimensions?.unit || "inch"
          }`,
      },
    });

    logs.push({
      type: "payment",
      title: "Initial Payment Added",
      description: "Payment information was captured during order creation.",
      time: order?.fullDate || order?.date,
      status: "done",
      meta: {
        paymentType: order?.payment?.paymentType || "—",
        partialPaidAmount: order?.payment?.partialPaidAmount || 0,
        fullPaidAmount: order?.payment?.fullPaidAmount || 0,
        paymentStatus: order?.paymentStatus || "—",
      },
    });

    if (order?.inventoryCheck?.checkedAt || order?.inventoryCheck?.matchedProductName) {
      logs.push({
        type: "inventory",
        title: "Inventory Availability Checked",
        description: order?.inventoryCheck?.isAvailable
          ? "Matching product was found in inventory."
          : "Product was checked against inventory.",
        time: order?.inventoryCheck?.checkedAt || order?.fullDate || order?.date,
        status: order?.inventoryCheck?.isAvailable ? "success" : "warning",
        meta: {
          matchedProductName: order?.inventoryCheck?.matchedProductName || "—",
          availableQtyAtCheck: order?.inventoryCheck?.availableQtyAtCheck || 0,
          requiredQtyAtCheck: order?.inventoryCheck?.requiredQtyAtCheck || 0,
          isAvailable: order?.inventoryCheck?.isAvailable ? "Yes" : "No",
        },
      });
    }

    if (order?.isConfirmed || order?.confirmedAt || order?.confirmedPayment?.paidAmount) {
      logs.push({
        type: "confirm",
        title: "Order Confirmed",
        description: "Order was confirmed for delivery/processing.",
        time: order?.confirmedAt || order?.fullDate || order?.date,
        status: "success",
        meta: {
          confirmedPaidAmount: order?.confirmedPayment?.paidAmount || 0,
          paymentMode: order?.confirmedPayment?.paymentMode || "—",
          confirmedBy: order?.confirmedBy?.name || "Admin/System",
        },
      });
    }

    if (
      order?.delivery?.receiverName ||
      order?.delivery?.receiverPhone ||
      order?.delivery?.deliveryAddress
    ) {
      logs.push({
        type: "delivery",
        title: "Delivery Details Added",
        description: "Receiver and delivery information added.",
        time: order?.confirmedAt || order?.fullDate || order?.date,
        status: "done",
        meta: {
          receiverName: order?.delivery?.receiverName || "—",
          receiverPhone: order?.delivery?.receiverPhone || "—",
          deliveryAddress: order?.delivery?.deliveryAddress || "—",
          deliveryDate: order?.delivery?.deliveryDate
            ? new Date(order.delivery.deliveryDate).toLocaleDateString()
            : "—",
          dispatchDate: order?.delivery?.dispatchDate
            ? new Date(order.delivery.dispatchDate).toLocaleDateString()
            : "—",
        },
      });
    }

    if (order?.notes) {
      logs.push({
        type: "note",
        title: "Order Notes Added",
        description: "Additional notes are attached to this order.",
        time: order?.fullDate || order?.date,
        status: "done",
        meta: {
          notes: order?.notes,
        },
      });
    }

    logs.push({
      type: "status",
      title: "Current Order Status",
      description: `Current order status is ${order?.orderStatus || "Pending"}.`,
      time: order?.fullDate || order?.date,
      status:
        order?.orderStatus === "Completed"
          ? "success"
          : order?.orderStatus === "Cancelled"
            ? "danger"
            : "done",
      meta: {
        orderStatus: order?.orderStatus || "Pending",
        paymentStatus: order?.paymentStatus || "Unpaid",
      },
    });

    return logs;
  };
  const getLogBadgeClasses = (status) => {
    if (status === "success") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    if (status === "warning") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (status === "danger") {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getLogDotClasses = (status) => {
    if (status === "success") return "bg-emerald-500";
    if (status === "warning") return "bg-amber-500";
    if (status === "danger") return "bg-red-500";
    return "bg-blue-500";
  };

  const confirmedCount = rawOrders.filter(
    (o) => o.orderStatus === "Confirmed"
  ).length;
  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                Orders Control Panel
              </div>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">Orders Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90 md:text-base">
                View all orders, check inventory availability, confirm delivery,
                and generate professional order reports for Nirmalyam Krafts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-emerald-950 hover:bg-yellow-300"
              >
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
                  Confirmed
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {confirmedCount}
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
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
            <option value="Confirmed">Confirmed</option>
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
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Business</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Bag Details</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Order Status</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Payment</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Availability</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
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
                              <p className="font-semibold text-gray-900">{order.customerName}</p>
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
                          <p className="font-semibold">{order.productCategory}</p>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="space-y-1">
                            <p><span className="font-semibold">Size:</span> {order.orderDetails?.bagSize || "—"}</p>
                            <p><span className="font-semibold">Color:</span> {order.orderDetails?.color || "—"}</p>
                            <p><span className="font-semibold">Qty:</span> {order.orderDetails?.quantity || "—"}</p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={orderStatusColors[order.orderStatusKey] || "primary"}>
                            {order.orderStatus}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={paymentColors[order.paymentStatusKey] || "primary"}>
                            {order.paymentStatus}
                          </Badge>
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {formatCurrency(order.amount)}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {order.date}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <Button
                            type="button"
                            className="rounded-2xl bg-green-900 hover:bg-emerald-700"
                            onClick={() => handleCheckOrderAvailability(order)}
                          >
                            {checkingOrderId === order.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              <>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Check Availability
                              </>
                            )}
                          </Button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailPanel(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {order.orderStatusKey === "CONFIRMED" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "Processing")}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                                title="Start Manufacturing"
                              >
                                <Factory className="h-4 w-4" />
                                <span className="hidden xl:inline">Process</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!formattedOrders.length && (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
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
                  <h3 className="text-sm font-bold text-gray-900">Manual Order Details</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a new order manually.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="mb-4 flex items-center gap-2">
                <User2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-bold text-gray-800">Customer Information</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={manualOrderForm.customerName}
                  onChange={(e) => handleFormChange("customerName", e.target.value)}
                  placeholder="Customer Name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.businessName}
                  onChange={(e) => handleFormChange("businessName", e.target.value)}
                  placeholder="Business Name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="email"
                  value={manualOrderForm.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.productCategory}
                  onChange={(e) => handleFormChange("productCategory", e.target.value)}
                  placeholder="Product Category"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.source}
                  onChange={(e) => handleFormChange("source", e.target.value)}
                  placeholder="Source"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.bagSize}
                  onChange={(e) => handleFormChange("bagSize", e.target.value)}
                  placeholder="Bag Size"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={manualOrderForm.color}
                  onChange={(e) => handleFormChange("color", e.target.value)}
                  placeholder="Color"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min="1"
                  value={manualOrderForm.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  placeholder="Quantity"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <select
                  value={manualOrderForm.dimensionUnit}
                  onChange={(e) => handleFormChange("dimensionUnit", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="inch">Inch</option>
                  <option value="cm">CM</option>
                  <option value="mm">MM</option>
                  <option value="ft">Feet</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={manualOrderForm.length}
                  onChange={(e) => handleFormChange("length", e.target.value)}
                  placeholder="Length"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min="0"
                  value={manualOrderForm.width}
                  onChange={(e) => handleFormChange("width", e.target.value)}
                  placeholder="Width"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
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


            <textarea
              rows={4}
              value={manualOrderForm.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
              placeholder="Notes"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

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

        <Modal
          isOpen={availabilityModalOpen}
          title="Order Availability Check"
          onClose={resetAvailabilityModal}
        >
          <div className="space-y-5">
            {availabilityOrder && (
              <>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {availabilityOrder.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{availabilityOrder.customerName}</p>
                      <p className="text-sm text-gray-500">{availabilityOrder.productCategory}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500">Bag Size</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {availabilityOrder.orderDetails?.bagSize || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500">Color</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {availabilityOrder.orderDetails?.color || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500">Quantity</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {availabilityOrder.orderDetails?.quantity || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500">Dimensions</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {availabilityOrder.orderDetails?.dimensions?.length || 0} ×{" "}
                        {availabilityOrder.orderDetails?.dimensions?.width || 0} ×{" "}
                        {availabilityOrder.orderDetails?.dimensions?.height || 0}{" "}
                        {availabilityOrder.orderDetails?.dimensions?.unit || "inch"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <label className="mb-2 block text-sm font-bold text-emerald-900">
                    Choose Deduction Logic Mode
                  </label>
                  <select
                    value={deductionMode}
                    onChange={(e) => setDeductionMode(e.target.value)}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  >
                    <option value="AUTO">AUTO (Search Finished Bags then Raw Materials)</option>
                    <option value="RAW_ONLY">FORCE PRODUCTION (Raw Materials Only)</option>
                    <option value="STOCK_ONLY">FORCE STOCK (Finished Bags Only)</option>
                  </select>
                  <button
                    onClick={() => handleCheckOrderAvailability(availabilityOrder)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <RefreshCw className={`h-4 w-4 ${checkingOrderId ? "animate-spin" : ""}`} />
                    Apply Mode & Re-Check
                  </button>
                </div>

                {checkingOrderId ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm"
                  >
                    <div className="flex items-center gap-4 px-5 py-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-emerald-900">
                          Analyzing inventory with {deductionMode} mode...
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">
                          Calculating material scaling and checking reservations
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : availabilityResult ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`overflow-hidden rounded-3xl border shadow-sm ${
                        availabilityResult.enoughStock
                          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50"
                          : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                availabilityResult.enoughStock
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {availabilityResult.enoughStock ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <AlertTriangle className="h-6 w-6" />
                              )}
                            </div>

                            <div>
                              <h3
                                className={`text-base font-bold ${
                                  availabilityResult.enoughStock ? "text-emerald-900" : "text-amber-900"
                                }`}
                              >
                                {availabilityResult.enoughStock
                                  ? "Smart Availability Passed"
                                  : "Insufficient Stock/Materials"}
                              </h3>
                              <p
                                className={`mt-1 text-sm ${
                                  availabilityResult.enoughStock ? "text-emerald-800" : "text-amber-800"
                                }`}
                              >
                                {availabilityResult.message}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm ${
                              availabilityResult.enoughStock ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          >
                            {availabilityResult.enoughStock ? "Ready to Confirm" : "Action Required"}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Bags from Finished Stock
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                              {availabilityResult.canFulfillFromStock}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Production Material Cost
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">
                              ₹{availabilityResult.totalOrderMaterialCost?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>

                        {availabilityResult.materialRequirements?.length > 0 && (
                          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                              <h4 className="text-sm font-bold text-gray-900">Required Bills of Materials (BOM)</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/30 text-xs font-semibold uppercase text-gray-500">
                                  <tr>
                                    <th className="px-4 py-3">Material</th>
                                    <th className="px-4 py-3">Per Bag</th>
                                    <th className="px-4 py-3">Total Qty</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3 text-right">Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {availabilityResult.materialRequirements.map((mat, idx) => (
                                    <tr key={idx} className={mat.isAvailable ? "" : "bg-red-50/30 text-red-700"}>
                                      <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                          {!mat.isAvailable && <AlertTriangle className="h-3 w-3" />}
                                          {mat.name}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">{mat.quantityPerBag} {mat.unit}</td>
                                      <td className="px-4 py-3">{mat.totalQuantity} {mat.unit}</td>
                                      <td className="px-4 py-3">₹{mat.unitPrice}</td>
                                      <td className="px-4 py-3 text-right font-bold">₹{mat.totalPrice?.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                  <tr className="bg-emerald-50/30 border-t-2 border-emerald-100">
                                    <td colSpan="4" className="px-4 py-3 text-right font-bold text-gray-900">Total Estimation:</td>
                                    <td className="px-4 py-3 text-right font-extrabold text-emerald-800 text-lg">
                                      ₹{availabilityResult.totalOrderMaterialCost?.toLocaleString()}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {availabilityResult.missingMaterials?.length > 0 && (
                          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              <p className="font-bold uppercase tracking-tight">Warning: Insufficient Materials</p>
                            </div>
                            <ul className="list-inside list-disc opacity-90 space-y-1">
                              {availabilityResult.missingMaterials.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {availabilityResult.enoughStock && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900">
                              Confirm Order Details
                            </h3>
                            <p className="text-sm text-gray-500">
                              Fill payment and delivery details for this order.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Total Invoice Amount (₹)
                              </label>
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Suggested: ₹{availabilityResult.totalOrderMaterialCost?.toLocaleString()}
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={confirmOrderForm.totalAmount}
                              onChange={(e) =>
                                handleConfirmOrderChange("totalAmount", e.target.value)
                              }
                              placeholder="Enter total bill amount"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Advance Paid (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={confirmOrderForm.paidAmount}
                              onChange={(e) =>
                                handleConfirmOrderChange("paidAmount", e.target.value)
                              }
                              placeholder="Optional advance"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Payment Mode
                            </label>
                            <select
                              value={confirmOrderForm.paymentMode}
                              onChange={(e) =>
                                handleConfirmOrderChange("paymentMode", e.target.value)
                              }
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                              <option value="cash">Cash</option>
                              <option value="upi">UPI</option>
                              <option value="bank_transfer">Bank Transfer</option>
                              <option value="card">Card</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 rounded-2xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Remaining Balance:</span>
                            <span className={`text-lg font-bold ${
                              (Number(confirmOrderForm.totalAmount || 0) - Number(confirmOrderForm.paidAmount || 0)) <= 0 
                                ? "text-emerald-600" 
                                : "text-amber-600"
                            }`}>
                              ₹{(Number(confirmOrderForm.totalAmount || 0) - Number(confirmOrderForm.paidAmount || 0)).toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Receiver Name
                            </label>
                            <input
                              type="text"
                              value={confirmOrderForm.receiverName}
                              onChange={(e) =>
                                handleConfirmOrderChange("receiverName", e.target.value)
                              }
                              placeholder="Enter receiver name"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Receiver Phone
                            </label>
                            <input
                              type="text"
                              value={confirmOrderForm.receiverPhone}
                              onChange={(e) =>
                                handleConfirmOrderChange("receiverPhone", e.target.value)
                              }
                              placeholder="Enter receiver phone"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Delivery Date
                            </label>
                            <input
                              type="date"
                              value={confirmOrderForm.deliveryDate}
                              onChange={(e) =>
                                handleConfirmOrderChange("deliveryDate", e.target.value)
                              }
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Dispatch Date
                            </label>
                            <input
                              type="date"
                              value={confirmOrderForm.dispatchDate}
                              onChange={(e) =>
                                handleConfirmOrderChange("dispatchDate", e.target.value)
                              }
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Delivery Address
                            </label>
                            <textarea
                              rows={3}
                              value={confirmOrderForm.deliveryAddress}
                              onChange={(e) =>
                                handleConfirmOrderChange("deliveryAddress", e.target.value)
                              }
                              placeholder="Enter full delivery address"
                              className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Delivery Notes
                            </label>
                            <textarea
                              rows={3}
                              value={confirmOrderForm.deliveryNotes}
                              onChange={(e) =>
                                handleConfirmOrderChange("deliveryNotes", e.target.value)
                              }
                              placeholder="Special delivery instructions"
                              className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <Button
                            type="button"
                            className="rounded-2xl bg-green-900 px-6 hover:bg-emerald-700"
                            onClick={handleConfirmExistingOrder}
                          >
                            Confirm order and RESERVE STOCK
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showReportPreview}
          title="Order Report Preview"
          onClose={() => setShowReportPreview(false)}
        >
          {selectedOrder && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
                <h2 className="text-2xl font-bold">Nirmalyam Krafts</h2>
                <p className="mt-1 text-sm text-emerald-50">Order Report</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">Customer Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Customer:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-semibold">Business:</span> {selectedOrder.businessName}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedOrder.phone}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.email}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">Product Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Product:</span> {selectedOrder.productCategory}</p>
                    <p><span className="font-semibold">Bag Size:</span> {selectedOrder.orderDetails?.bagSize || "—"}</p>
                    <p><span className="font-semibold">Color:</span> {selectedOrder.orderDetails?.color || "—"}</p>
                    <p><span className="font-semibold">Quantity:</span> {selectedOrder.orderDetails?.quantity || "—"}</p>
                    <p>
                      <span className="font-semibold">Dimensions:</span>{" "}
                      {selectedOrder.orderDetails?.dimensions?.length || 0} ×{" "}
                      {selectedOrder.orderDetails?.dimensions?.width || 0} ×{" "}
                      {selectedOrder.orderDetails?.dimensions?.height || 0}{" "}
                      {selectedOrder.orderDetails?.dimensions?.unit || "inch"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">Payment Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Payment Status:</span> {selectedOrder.paymentStatus}</p>
                    <p><span className="font-semibold">Payment Type:</span> {selectedOrder.payment?.paymentType || "—"}</p>
                    <p><span className="font-semibold">Partial Paid:</span> {formatCurrency(selectedOrder.payment?.partialPaidAmount)}</p>
                    <p><span className="font-semibold">Full Paid:</span> {formatCurrency(selectedOrder.payment?.fullPaidAmount)}</p>
                    <p><span className="font-semibold">Confirmed Paid:</span> {formatCurrency(selectedOrder.confirmedPayment?.paidAmount)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">Delivery Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Receiver:</span> {selectedOrder.delivery?.receiverName || "Not added"}</p>
                    <p><span className="font-semibold">Receiver Phone:</span> {selectedOrder.delivery?.receiverPhone || "Not added"}</p>
                    <p><span className="font-semibold">Address:</span> {selectedOrder.delivery?.deliveryAddress || "Not added"}</p>
                    <p>
                      <span className="font-semibold">Delivery Date:</span>{" "}
                      {selectedOrder.delivery?.deliveryDate
                        ? new Date(selectedOrder.delivery.deliveryDate).toLocaleDateString()
                        : "Not added"}
                    </p>
                    <p>
                      <span className="font-semibold">Dispatch Date:</span>{" "}
                      {selectedOrder.delivery?.dispatchDate
                        ? new Date(selectedOrder.delivery.dispatchDate).toLocaleDateString()
                        : "Not added"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-gray-800">Notes</h3>
                <p className="whitespace-pre-line text-sm text-gray-700">
                  {selectedOrder.notes || "No notes added"}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => handleShareOrder(selectedOrder)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>

                <Button
                  type="button"
                  className="rounded-2xl bg-green-900 hover:bg-green-800"
                  onClick={() => handleWhatsAppShare(selectedOrder)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send WhatsApp
                </Button>

                <Button
                  type="button"
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => generateOrderPDF(selectedOrder)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

              </div>
            </div>
          )}
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
              className="relative h-screen w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Detail</h2>
                  <button onClick={() => setShowDetailPanel(false)} className="text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="rounded-2xl bg-emerald-600 px-4 py-2 hover:bg-emerald-700"
                    onClick={() => setShowReportPreview(true)}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Preview Report
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl px-4 py-2"
                    onClick={() => generateOrderPDF(selectedOrder)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl px-4 py-2"
                    onClick={() => handleShareOrder(selectedOrder)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>

                  <Button
                    type="button"
                    className="rounded-2xl bg-green-900 px-4 py-2 hover:bg-green-800"
                    onClick={() => handleWhatsAppShare(selectedOrder)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl px-4 py-2"
                    onClick={() => setShowLogsModal(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Logs
                  </Button>
                </div>
                <Modal
                  isOpen={showLogsModal}
                  title="Order Logs & Timeline"
                  onClose={() => setShowLogsModal(false)}
                >
                  {selectedOrder && (
                    <div className="space-y-5">
                      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
                        <h2 className="text-xl font-bold">Order Timeline</h2>
                        <p className="mt-1 text-sm text-emerald-50">
                          Full frontend-generated order history for {selectedOrder.customerName}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {buildClientOrderLogs(selectedOrder).map((log, index) => (
                          <div key={index} className="relative pl-8">
                            {index !== buildClientOrderLogs(selectedOrder).length - 1 && (
                              <div className="absolute left-[11px] top-8 h-[calc(100%+12px)] w-[2px] bg-gray-200" />
                            )}

                            <div
                              className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow ${getLogDotClasses(
                                log.status
                              )}`}
                            />

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900">{log.title}</p>
                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getLogBadgeClasses(
                                        log.status
                                      )}`}
                                    >
                                      {log.status}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm text-gray-600">{log.description}</p>
                                </div>

                                <div className="text-xs text-gray-500">
                                  {log.time
                                    ? new Date(log.time).toLocaleString()
                                    : "No date available"}
                                </div>
                              </div>

                              {log.meta && Object.keys(log.meta).length > 0 && (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {Object.entries(log.meta).map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
                                    >
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                        {key.replace(/([A-Z])/g, " $1")}
                                      </p>
                                      <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                                        {String(value ?? "—")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Modal>
                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {selectedOrder.avatar}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase text-gray-500">Order Status</p>
                      <div className="mt-2">
                        <Badge variant={orderStatusColors[selectedOrder.orderStatusKey] || "primary"}>
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase text-gray-500">Payment Status</p>
                      <div className="mt-2">
                        <Badge variant={paymentColors[selectedOrder.paymentStatusKey] || "primary"}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Business Name</p>
                    <p className="mt-1 text-gray-900">{selectedOrder.businessName}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Phone</p>
                    <p className="mt-1 text-gray-900">{selectedOrder.phone}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Product Category</p>
                    <p className="mt-1 text-gray-900">{selectedOrder.productCategory}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Source</p>
                    <p className="mt-1 text-gray-900">{selectedOrder.source}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">Bag Details</p>
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
                          {formatCurrency(selectedOrder.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">Dimensions</p>
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
                      <p className="text-xs font-semibold uppercase text-gray-500">Payment Details</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Type</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedOrder.payment?.paymentType || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Partial Paid</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatCurrency(selectedOrder.payment?.partialPaidAmount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Full Paid</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatCurrency(selectedOrder.payment?.fullPaidAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Notes</p>
                    <p className="mt-2 whitespace-pre-line text-gray-900">
                      {selectedOrder.notes || "No notes added."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Created On</p>
                    <p className="mt-1 text-gray-900">{selectedOrder.date}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="secondary" onClick={() => setShowDetailPanel(false)}>
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