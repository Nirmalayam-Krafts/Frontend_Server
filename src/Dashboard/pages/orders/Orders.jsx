import React, { useEffect, useMemo, useState } from "react";
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
import OrderDetail from "../../components/orders/OrderDetail";
import OrderActionsDashboard from "../../components/orders/OrderActionsDashboard";
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
  FileDown,
  Link2,
  Layers,
  ListOrdered,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useUIStore } from "../../store";
import { useGetAllOrders } from "../../../../hook/order";
import { useGetInventory } from "../../../../hook/inventory";
import { useGetAllProducts } from "../../../../hook/product";

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
  deliveryMode: "courier",
  deliveryAddress: "",
  deliveryDate: "",
  dispatchDate: "",
  receiverName: "",
  receiverPhone: "",
  deliveryNotes: "",
};

const COMPANY_NAME = "Nirmalyam Krafts";

const DEDUCTION_MODE_HELP = {
  AUTO: "Uses finished bags first, then scales the product BOM for any remaining bags.",
  RAW_ONLY:
    "Treats the full order quantity as production: finished stock is informational only; raw BOM drives availability.",
  STOCK_ONLY:
    "Finished bags only. Raw material BOM is not evaluated — use this when you only sell from shelf stock.",
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
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" or "table"

  const [showReportPreview, setShowReportPreview] = useState(false);

  const [manualOrderForm, setManualOrderForm] = useState(initialManualOrderForm);

  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityOrder, setAvailabilityOrder] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [deductionMode, setDeductionMode] = useState("AUTO");
  const [confirmOrderForm, setConfirmOrderForm] = useState(initialConfirmOrderForm);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationOrder, setQuotationOrder] = useState(null);
  const [quotationPricing, setQuotationPricing] = useState(null);
  const [quotationMode, setQuotationMode] = useState("AUTO");
  const [quotationValidUntil, setQuotationValidUntil] = useState("");
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationTotalInput, setQuotationTotalInput] = useState("");
  const [processingActionId, setProcessingActionId] = useState(null);
  const [completeActionId, setCompleteActionId] = useState(null);

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
  const { data: productsData } = useGetAllProducts();

  const inventoryItems = useMemo(() => {
    if (Array.isArray(inventoryData)) return inventoryData;
    if (Array.isArray(inventoryData?.items)) return inventoryData.items;
    if (Array.isArray(inventoryData?.inventory)) return inventoryData.inventory;
    if (Array.isArray(inventoryData?.products)) return inventoryData.products;
    if (Array.isArray(inventoryData?.data)) return inventoryData.data;
    return [];
  }, [inventoryData]);
  const productItems = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);

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
        quotation: order?.quotation || {},
        lastProcessingCheck: order?.lastProcessingCheck || {},
        workflowLogs: order?.workflowLogs || [],
        isConfirmed: order?.isConfirmed || false,
        confirmedAt: order?.confirmedAt || null,
        confirmedBy: order?.confirmedBy || null,
        amount: order?.totalAmount || 0,
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

  const firstPendingQuotationOrder = useMemo(() => {
    return formattedOrders.find((o) => {
      const hasQuotation =
        !!o?.quotation?.quotationNumber ||
        ["sent", "approved"].includes(
          String(o?.quotation?.status || "").toLowerCase()
        );
      return o?.orderStatusKey === "PENDING" && !hasQuotation;
    });
  }, [formattedOrders]);

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

  const convertToInch = (value, unit) => {
    const v = Number(value || 0);
    if (!v) return 0;
    switch (String(unit || "inch").toLowerCase()) {
      case "cm":
        return v / 2.54;
      case "mm":
        return v / 25.4;
      case "ft":
      case "feet":
        return v * 12;
      default:
        return v;
    }
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

  const analyzeInventoryMatches = (order) => {
    const orderColor = normalizeText(order?.orderDetails?.color);
    const orderSize = normalizeText(order?.orderDetails?.bagSize);

    const sameDimensionItems = inventoryItems.filter((item) =>
      isSameDimension(item, order)
    );

    const exactMatches = sameDimensionItems.filter((item) => {
      const itemColor = normalizeText(item?.bagColor);
      const itemSize = normalizeText(item?.bagSizeLabel);
      return itemColor === orderColor && itemSize === orderSize;
    });

    const sizeMatchedColorDifferent = sameDimensionItems.filter((item) => {
      const itemColor = normalizeText(item?.bagColor);
      const itemSize = normalizeText(item?.bagSizeLabel);
      return itemSize === orderSize && itemColor !== orderColor;
    });

    const colorMatchedSizeDifferent = sameDimensionItems.filter((item) => {
      const itemColor = normalizeText(item?.bagColor);
      const itemSize = normalizeText(item?.bagSizeLabel);
      return itemColor === orderColor && itemSize !== orderSize;
    });

    const nearDimensionMatches = inventoryItems.filter((item) => {
      const inv = getInventoryDimensions(item);
      const dim = order?.orderDetails?.dimensions || {};
      const sameUnit =
        normalizeText(inv.unit || "inch") === normalizeText(dim.unit || "inch");
      if (!sameUnit) return false;

      const nearLength = Math.abs(toNumber(inv.length) - toNumber(dim.length)) <= 1;
      const nearWidth = Math.abs(toNumber(inv.width) - toNumber(dim.width)) <= 1;
      const nearHeight = Math.abs(toNumber(inv.height) - toNumber(dim.height)) <= 1;

      return nearLength && nearWidth && nearHeight;
    });

    return {
      exactMatches,
      sizeMatchedColorDifferent,
      colorMatchedSizeDifferent,
      nearDimensionMatches,
      hasAnySuggestedMatch:
        exactMatches.length > 0 ||
        sizeMatchedColorDifferent.length > 0 ||
        colorMatchedSizeDifferent.length > 0 ||
        nearDimensionMatches.length > 0,
    };
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
        const resData = applyAvailabilityCostCorrection(resp.data.data, order);
        const matchInsight = analyzeInventoryMatches(order);
        const productResolved = resData.productResolved !== false;
        setAvailabilityResult({
          enoughStock: productResolved && resData.isAvailable,
          productResolved,
          adminHint: resData.adminHint,
          referenceInventory: resData.referenceInventory || [],
          catalogSuggestions: resData.catalogSuggestions || [],
          unresolvedSearchTerm: resData.unresolvedSearchTerm,
          finishedGoodsInsight: resData.finishedGoodsInsight || null,
          canFulfillFromStock: resData.canFulfillFromStock,
          requiredFromProduction: resData.requiredFromProduction,
          totalOrderMaterialCost: resData.totalOrderMaterialCost,
          onDemandCount: resData.onDemandCount,
          materialRequirements: resData.materialRequirements,
          missingMaterials: resData.missingMaterials,
          productionScalingMeta: resData.productionScalingMeta || null,
          requiredQty: Number(order?.orderDetails?.quantity || 0),
          message: !productResolved
            ? resData.adminHint ||
              "No catalog product matched this order label. Use suggestions below or set product ID on the order."
            : resData.isAvailable
              ? "Order can be fulfilled using current logic mode."
              : "Insufficient raw materials or stock for this mode.",
          matchInsight,
        });
      } else {
        const msg =
          resp.data?.message ||
          "Availability check did not complete. Verify product name/ID and try again.";
        setAvailabilityResult({
          checkFailed: true,
          errorMessage: msg,
        });
        showNotification(msg, "error");
      }
    } catch (err) {
      console.error("Availability Check Failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to check smart availability";
      setAvailabilityResult({
        checkFailed: true,
        errorMessage: msg,
      });
      showNotification(msg, "error");
    } finally {
      setCheckingOrderId(null);
    }
  };

  const handleConfirmExistingOrder = async () => {
    if (!availabilityOrder) return;

    if (availabilityResult?.productResolved === false) {
      showNotification(
        "Link this order to a catalog product (product ID) before confirming — reservations need a BOM.",
        "error"
      );
      return;
    }

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
        deliveryMode: confirmOrderForm.deliveryMode,
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
      deliveryMode: order?.delivery?.deliveryMode || "Not added",
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
        ["Delivery Mode", report.deliveryMode],
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
*Delivery Mode:* ${report.deliveryMode}
*Delivery Date:* ${report.deliveryDate}
*Dispatch Date:* ${report.dispatchDate}
*Notes:* ${report.notes}
    `.trim();

    const phone = String(order?.phone || "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleUpdateStatus = async (orderId, newStatus, opts = {}) => {
    const loadingToast = toast.loading(`Updating order to ${newStatus}...`);
    try {
      const orderToUpdate = formattedOrders.find((o) => o.id === orderId);
      const mode = opts.deductionMode || deductionMode || "AUTO";

      const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
        newStatus,
        productId: orderToUpdate?.orderDetails?.productId || null,
        deductionMode: mode,
      });

      if (response.data.success) {
        toast.success(`Order moved to ${newStatus} 🏭`, { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getInventoryData"] });
        refetch();
      } else {
        toast.error(response.data?.message || "Update failed", { id: loadingToast });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update status";
      toast.error(
        newStatus === "Processing" && String(msg).toLowerCase().includes("blocked")
          ? `${msg} Use Processing Check to see on-demand lines.`
          : msg,
        { id: loadingToast }
      );
    }
  };

  const handleProcessingCheckOnly = async (order) => {
    const loadingToast = toast.loading("Running processing check (Step 7)...");
    try {
      const res = await axiosInstance.get(`/orders/${order.id}/processing-check`, {
        params: { mode: deductionMode || "AUTO" },
      });
      if (!res.data?.success) {
        toast.error(res.data?.message || "Check failed", { id: loadingToast });
        return;
      }
      const { allowed, onDemandCount, missingMaterials } = res.data.data || {};
      if (allowed) {
        toast.success(
          `Processing allowed. On-demand lines: ${onDemandCount ?? 0}.`,
          { id: loadingToast }
        );
      } else {
        toast.error(
          `Blocked: ${onDemandCount ?? 0} on-demand line(s). ${(missingMaterials || []).slice(0, 3).join("; ")}`,
          { id: loadingToast, duration: 6000 }
        );
      }
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Processing check failed", {
        id: loadingToast,
      });
    }
  };

  const handleMoveToProcessing = async (order) => {
    setProcessingActionId(order.id);
    try {
      await handleUpdateStatus(order.id, "Processing", { deductionMode });
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleCompleteOrder = async (order) => {
    setCompleteActionId(order.id);
    const loadingToast = toast.loading("Completing order...");
    try {
      const response = await axiosInstance.patch(`/orders/${order.id}/status`, {
        newStatus: "Completed",
        productId: order?.orderDetails?.productId || null,
        deductionMode: deductionMode || "AUTO",
      });
      if (response.data.success) {
        toast.success("Order completed; inventory updated ✓", { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getInventoryData"] });
        await refetch();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to complete order", {
        id: loadingToast,
      });
    } finally {
      setCompleteActionId(null);
    }
  };

  const getDerivedMaterialCost = (pricing, order) => {
    const apiCost = Number(pricing?.totalOrderMaterialCost || 0);
    if (apiCost > 0) return apiCost;

    const lines = Array.isArray(pricing?.materialRequirements)
      ? pricing.materialRequirements
      : [];

    const exactInventoryLine = findExactInventoryLineForOrder(order);
    const baseDims = getInventoryDimensions(exactInventoryLine);
    const orderDims = order?.orderDetails?.dimensions || {};
    const baseLinearSum =
      convertToInch(baseDims.length, baseDims.unit) +
      convertToInch(baseDims.width, baseDims.unit) +
      convertToInch(baseDims.height, baseDims.unit);
    const orderLinearSum =
      convertToInch(orderDims.length, orderDims.unit || "inch") +
      convertToInch(orderDims.width, orderDims.unit || "inch") +
      convertToInch(orderDims.height, orderDims.unit || "inch");
    const clientScaleFactor =
      baseLinearSum > 0 && orderLinearSum > 0 ? orderLinearSum / baseLinearSum : 1;
    const productionQty = Number(pricing?.requiredFromProduction || 0);

    const lineTotal = lines.reduce((sum, line) => {
      const direct = Number(line?.totalPrice || 0);
      if (direct > 0) return sum + direct;

      const unit = Number(line?.unitPrice || 0);
      const usageType = String(line?.usageType || "");
      const lineScaleFactor = Number(line?.lineScaleFactor || 1);
      const perBagFromApi = Number(line?.quantityPerBag || 0);
      const totalQtyFromApi = Number(line?.totalQuantity || 0);

      // Align quotation math with RawMaterial page:
      // for dimension_based lines use linear-sum factor from exact matched dimensions.
      if (
        usageType === "dimension_based" &&
        productionQty > 0 &&
        perBagFromApi > 0 &&
        lineScaleFactor > 0
      ) {
        const basePerBag = perBagFromApi / lineScaleFactor;
        const correctedPerBag = basePerBag * (clientScaleFactor || 1);
        const correctedTotalQty = correctedPerBag * productionQty;
        return sum + correctedTotalQty * unit;
      }

      return sum + totalQtyFromApi * unit;
    }, 0);

    if (lineTotal > 0) return lineTotal;
    return 0;
  };

  const getInventorySellPrice = (item) => {
    const candidates = [
      item?.sellingPricePerUnit,
      item?.sellPrice,
      item?.sellingPrice,
      item?.unitSellPrice,
      item?.price,
      item?.unitPrice,
      item?.costPrice,
    ];
    for (const value of candidates) {
      const num = Number(value || 0);
      if (num > 0) return num;
    }
    return 0;
  };

  const getInventoryAvailableBags = (item) => {
    const candidates = [
      item?.availableForSale,
      item?.availableBags,
      item?.stockLevel,
      item?.availableStock,
      item?.quantity,
    ];
    for (const value of candidates) {
      const num = Number(value || 0);
      if (num > 0) return num;
    }
    return 0;
  };

  const findExactInventoryLineForOrder = (order) => {
    const orderProductId = String(order?.orderDetails?.productId || "").trim();
    const orderColor = normalizeText(order?.orderDetails?.color);
    const orderSize = normalizeText(order?.orderDetails?.bagSize);

    const candidates = inventoryItems.filter((item) => {
      if (!isSameDimension(item, order)) return false;
      const itemColor = normalizeText(item?.bagColor || item?.color);
      const itemSize = normalizeText(item?.bagSizeLabel || item?.bagSize);
      return itemColor === orderColor && itemSize === orderSize;
    });

    if (!candidates.length) return null;

    if (orderProductId) {
      const byProduct = candidates.find(
        (item) => String(item?.productId || item?.product?._id || item?.product?.id || "").trim() === orderProductId
      );
      if (byProduct) return byProduct;
    }

    return candidates[0];
  };

  const applyAvailabilityCostCorrection = (pricing, order) => {
    if (!pricing || !Array.isArray(pricing?.materialRequirements)) return pricing;

    const productionQty = Number(pricing?.requiredFromProduction || 0);
    const orderProductId = String(order?.orderDetails?.productId || "").trim();
    const linkedProduct =
      productItems.find(
        (p) => String(p?._id || p?.id || "").trim() === orderProductId
      ) || null;
    const productBaseDims = linkedProduct?.dimensions || {};
    const orderDims = order?.orderDetails?.dimensions || {};
    // Must match RawMaterial + backend service logic:
    // factor = (order L+W+H) / (product base L+W+H)
    const baseLinearSum =
      convertToInch(productBaseDims.length, productBaseDims.unit || "inch") +
      convertToInch(productBaseDims.width, productBaseDims.unit || "inch") +
      convertToInch(productBaseDims.height, productBaseDims.unit || "inch");
    const orderLinearSum =
      convertToInch(orderDims.length, orderDims.unit || "inch") +
      convertToInch(orderDims.width, orderDims.unit || "inch") +
      convertToInch(orderDims.height, orderDims.unit || "inch");
    const factor = baseLinearSum > 0 && orderLinearSum > 0 ? orderLinearSum / baseLinearSum : 1;

    const correctedMaterials = pricing.materialRequirements.map((mat) => {
      const usageType = String(mat?.usageType || "").trim().toLowerCase();
      const lineScaleFactor = Number(mat?.lineScaleFactor || 1);
      const quantityPerBag = Number(mat?.quantityPerBag || 0);
      const unitPrice = Number(mat?.unitPrice || 0);
      const fallbackTotalQty = Number(mat?.totalQuantity || 0);
      const wastagePercent = Number(mat?.wastagePercent || 0);
      const wastageMultiplier = 1 + wastagePercent / 100;

      if (
        usageType === "dimension_based" &&
        productionQty > 0 &&
        quantityPerBag > 0 &&
        lineScaleFactor > 0
      ) {
        const bomLine =
          linkedProduct?.rawMaterials?.find((rm) => {
            const rmId = String(rm?.rawMaterialId || "").trim();
            const matId = String(mat?.materialId || "").trim();
            const rmName = normalizeText(rm?.rawMaterialName);
            const matName = normalizeText(mat?.name);
            return (rmId && matId && rmId === matId) || (rmName && matName && rmName === matName);
          }) || null;
        const bomBasePerBag = Number(bomLine?.requiredQuantityPerBag || 0);

        // Prefer Product BOM base qty to enforce parity with RawMaterial page.
        const perBagWithoutWastage =
          wastageMultiplier > 0 ? quantityPerBag / wastageMultiplier : quantityPerBag;
        const basePerBag =
          bomBasePerBag > 0
            ? bomBasePerBag
            : perBagWithoutWastage / lineScaleFactor;
        const correctedPerBag = basePerBag * factor;
        const correctedTotalQty = correctedPerBag * productionQty;
        const correctedTotalPrice = correctedTotalQty * unitPrice;
        return {
          ...mat,
          quantityPerBag: Number(correctedPerBag.toFixed(4)),
          totalQuantity: Number(correctedTotalQty.toFixed(4)),
          totalPrice: Number(correctedTotalPrice.toFixed(2)),
          lineScaleFactor: Number(factor.toFixed(4)),
          wastagePercent: 0,
        };
      }

      // Keep non-dimension lines wastage-free as well.
      const totalQtyWithoutWastage =
        wastageMultiplier > 0 ? fallbackTotalQty / wastageMultiplier : fallbackTotalQty;
      return {
        ...mat,
        totalQuantity: Number(totalQtyWithoutWastage.toFixed(4)),
        totalPrice: Number((totalQtyWithoutWastage * unitPrice).toFixed(2)),
        wastagePercent: 0,
      };
    });

    const correctedTotal = correctedMaterials.reduce(
      (sum, mat) => sum + Number(mat?.totalPrice || 0),
      0
    );

    return {
      ...pricing,
      materialRequirements: correctedMaterials,
      totalOrderMaterialCost: Number(correctedTotal.toFixed(2)),
    };
  };

  const getStockUnitQuotePrice = (pricing, order) => {
    const exactInventoryLine = findExactInventoryLineForOrder(order);
    const exactInventoryPrice = getInventorySellPrice(exactInventoryLine);
    if (exactInventoryPrice > 0) return exactInventoryPrice;

    const candidates = [
      pricing?.finishedGoodsInsight?.matchedSellPrice,
      pricing?.finishedGoodsInsight?.matchedUnitSellPrice,
      pricing?.finishedGoodsInsight?.sellPrice,
      pricing?.finishedGoodsInsight?.unitSellPrice,
      pricing?.finishedGoodsInsight?.matchedPrice,
      pricing?.finishedGoodsInsight?.unitPrice,
      pricing?.referenceInventory?.[0]?.sellPrice,
      pricing?.referenceInventory?.[0]?.unitSellPrice,
      pricing?.referenceInventory?.[0]?.price,
      pricing?.referenceInventory?.[0]?.unitPrice,
      order?.orderDetails?.unitPrice,
      order?.unitPrice,
    ];

    for (const value of candidates) {
      const num = Number(value || 0);
      if (num > 0) return num;
    }
    return 0;
  };

  const getSuggestedQuotationTotal = (pricing, order) => {
    const orderQty = Number(order?.orderDetails?.quantity || 0);
    const exactInventoryLine = findExactInventoryLineForOrder(order);
    const exactInventoryQty = getInventoryAvailableBags(exactInventoryLine);
    const stockQty = Math.max(Number(pricing?.canFulfillFromStock || 0), exactInventoryQty);
    const productionCost = getDerivedMaterialCost(pricing, order);
    const stockUnitPrice = getStockUnitQuotePrice(pricing, order);

    if (orderQty > 0 && stockQty > 0 && stockUnitPrice > 0) {
      const stockCovered = Math.min(orderQty, stockQty);
      const stockQuoteValue = stockCovered * stockUnitPrice;
      // If some quantity still needs production, add production estimate.
      if (stockCovered < orderQty) {
        const total = stockQuoteValue + Math.max(productionCost, 0);
        return total > 0 ? total : Number(order?.totalAmount || 0);
      }
      return stockQuoteValue;
    }

    if (productionCost > 0) return productionCost;
    return Number(order?.totalAmount || 0);
  };

  const openQuotationModal = (order) => {
    setQuotationOrder(order);
    setQuotationPricing(null);
    setQuotationTotalInput("");
    // Default to AUTO so available finished stock is considered first.
    setQuotationMode("AUTO");
    const defaultUntil = new Date();
    defaultUntil.setDate(defaultUntil.getDate() + 7);
    setQuotationValidUntil(defaultUntil.toISOString().slice(0, 10));
    setShowQuotationModal(true);
  };

  useEffect(() => {
    if (!showQuotationModal || !quotationOrder?.id) return undefined;
    let cancelled = false;
    (async () => {
      setQuotationLoading(true);
      try {
        const resp = await axiosInstance.get(`/orders/${quotationOrder.id}/availability`, {
          params: { mode: quotationMode },
        });
        if (cancelled || !resp.data.success) return;
        const d = applyAvailabilityCostCorrection(resp.data.data, quotationOrder);
        setQuotationPricing(d);
        const suggested = getSuggestedQuotationTotal(d, quotationOrder);
        setQuotationTotalInput(String(suggested > 0 ? suggested : ""));
        if (!cancelled && d.productResolved === false) {
          showNotification(
            "Quotation: reference-only stock/BOM — link a catalog product on the order for exact fulfillment numbers.",
            "success"
          );
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          showNotification("Could not load pricing for quotation", "error");
          setQuotationTotalInput(String(quotationOrder.totalAmount || ""));
        }
      } finally {
        if (!cancelled) setQuotationLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showQuotationModal, quotationOrder?.id, quotationMode, axiosInstance]);

  const generateQuotationPDF = (order, pricing, meta) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qn = meta.quotationNumber || order?.quotation?.quotationNumber || `QT-${order.id}`;
    const total = Number(meta.totalQuoted || 0);
    const validUntil = meta.validUntil || "—";
    const brand = [10, 92, 67];
    const accent = [212, 175, 55];

    const drawHeaderBand = () => {
      doc.setFillColor(brand[0], brand[1], brand[2]);
      doc.rect(0, 0, pageWidth, 38, "F");
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.rect(0, 38, pageWidth, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(COMPANY_NAME, 14, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Manufacturing quotation", 14, 24);
      doc.setFontSize(8);
      doc.setTextColor(230, 245, 238);
      doc.text(`Document ${qn}  ·  Valid through ${validUntil}`, 14, 31);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.2);
      doc.line(pageWidth - 72, 10, pageWidth - 14, 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("CONFIDENTIAL", pageWidth - 14, 14, { align: "right" });
    };

    drawHeaderBand();

    doc.setTextColor(35, 35, 35);
    autoTable(doc, {
      startY: 48,
      head: [["Client", ""]],
      body: [
        ["Customer", order.customerName || "—"],
        ["Business", order.businessName || "—"],
        ["Phone", order.phone || "—"],
        ["Email", order.email || "—"],
      ],
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: brand,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      columnStyles: { 0: { cellWidth: 42, fontStyle: "bold", textColor: [80, 80, 80] } },
      alternateRowStyles: { fillColor: [252, 252, 252] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Specification", ""]],
      body: [
        ["Product", order.productCategory || "—"],
        ["Bag size / Color", `${order.orderDetails?.bagSize || "—"} / ${order.orderDetails?.color || "—"}`],
        ["Quantity", String(order.orderDetails?.quantity ?? "—")],
        [
          "Dimensions (L × W × H)",
          `${order.orderDetails?.dimensions?.length || 0} × ${order.orderDetails?.dimensions?.width || 0} × ${order.orderDetails?.dimensions?.height || 0} ${order.orderDetails?.dimensions?.unit || "inch"}`,
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: [230, 230, 230],
      },
      headStyles: {
        fillColor: brand,
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: { 0: { cellWidth: 52, fontStyle: "bold", textColor: [80, 80, 80] } },
      alternateRowStyles: { fillColor: [252, 252, 252] },
    });

    const mats = pricing?.materialRequirements || [];
    if (mats.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Material (BOM reference)", "Qty", "UOM", "Unit ₹", "Line ₹"]],
        body: mats.map((m) => [
          m.name || "—",
          String(m.totalQuantity ?? "—"),
          m.unit || "—",
          String(m.unitPrice ?? 0),
          String(m.totalPrice ?? 0),
        ]),
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2.5, halign: "left" },
        headStyles: { fillColor: brand, fontStyle: "bold", fontSize: 9 },
        columnStyles: {
          1: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right", fontStyle: "bold" },
        },
      });
    } else {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Note"]],
        body: [
          [
            "No BOM detail on this quotation (e.g. finished-stock mode). Totals below reflect your quoted figure.",
          ],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 4, textColor: [90, 90, 90] },
        headStyles: { fillColor: brand, fontStyle: "bold" },
      });
    }

    const summaryY = doc.lastAutoTable.finalY + 12;
    doc.setFillColor(248, 250, 249);
    doc.roundedRect(14, summaryY, pageWidth - 28, 28, 2, 2, "F");
    doc.setDrawColor(brand[0], brand[1], brand[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, summaryY, pageWidth - 28, 28, 2, 2, "S");
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Estimated material (reference only)", 20, summaryY + 8);
    doc.text(
      `₹${Number(pricing?.totalOrderMaterialCost || 0).toLocaleString("en-IN")}`,
      pageWidth - 20,
      summaryY + 8,
      { align: "right" }
    );
    doc.text("On-demand BOM lines (must be 0 before production)", 20, summaryY + 16);
    doc.text(String(pricing?.onDemandCount ?? "—"), pageWidth - 20, summaryY + 16, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text("Total quoted", 20, summaryY + 24);
    doc.text(`₹${total.toLocaleString("en-IN")}`, pageWidth - 20, summaryY + 24, { align: "right" });

    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${COMPANY_NAME} · Quotation is valid until date shown · Prices exclude taxes unless stated · E. & O. E.`,
      pageWidth / 2,
      footY,
      { align: "center" }
    );

    doc.save(`${COMPANY_NAME.replace(/\s+/g, "_")}_Quotation_${qn}.pdf`);
  };

  const patchQuotation = async (status) => {
    if (!quotationOrder) return;
    const loadingToast = toast.loading("Saving quotation...");
    try {
      const totalQuoted = Number(quotationTotalInput || 0);
      if (totalQuoted <= 0) {
        toast.error("Enter a valid quotation amount greater than 0", {
          id: loadingToast,
        });
        return;
      }
      await axiosInstance.patch(`/orders/${quotationOrder.id}/quotation`, {
        status,
        totalQuoted,
        validUntil: quotationValidUntil,
      });
      toast.success("Quotation updated", { id: loadingToast });
      setShowQuotationModal(false);
      queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
      await refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update quotation", {
        id: loadingToast,
      });
    }
  };

  const getQuotationShareText = (order, pricing) => {
    const total = Number(quotationTotalInput || pricing?.totalOrderMaterialCost || order.totalAmount || 0);
    const lines = (pricing?.materialRequirements || [])
      .slice(0, 8)
      .map((m) => `• ${m.name}: ${m.totalQuantity}${m.unit || ""} (~₹${m.totalPrice})`)
      .join("\n");
    return `
*${COMPANY_NAME} — Quotation*

Customer: ${order.customerName}
Product: ${order.productCategory}
Qty: ${order.orderDetails?.quantity}
Total quoted: ₹${total.toLocaleString()}
Valid until: ${quotationValidUntil || "—"}
On-demand lines: ${pricing?.onDemandCount ?? "—"}

${lines || "(See PDF for full BOM)"}
    `.trim();
  };

  const handleQuotationWhatsApp = () => {
    if (!quotationOrder) return;
    const text = getQuotationShareText(quotationOrder, quotationPricing);
    const phone = String(quotationOrder.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleQuotationMailto = () => {
    if (!quotationOrder) return;
    const subject = encodeURIComponent(`${COMPANY_NAME} — Quotation for ${quotationOrder.productCategory}`);
    const body = encodeURIComponent(getQuotationShareText(quotationOrder, quotationPricing));
    window.location.href = `mailto:${quotationOrder.email || ""}?subject=${subject}&body=${body}`;
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

    if (order?.quotation?.quotationNumber || order?.quotation?.status) {
      logs.push({
        type: "quotation",
        title: "Quotation",
        description: `Status: ${order.quotation?.status || "—"}. Total: ₹${Number(order.quotation?.totalQuoted || 0).toLocaleString()}`,
        time: order.quotation?.sentAt || order.quotation?.approvedAt || order?.fullDate,
        status: "done",
        meta: {
          quotationNumber: order.quotation?.quotationNumber || "—",
          validUntil: order.quotation?.validUntil
            ? new Date(order.quotation.validUntil).toLocaleDateString()
            : "—",
        },
      });
    }

    if (Array.isArray(order?.workflowLogs) && order.workflowLogs.length) {
      order.workflowLogs.forEach((w) => {
        logs.push({
          type: "server",
          title: w.action || "Workflow",
          description: w.note || "—",
          time: w.at,
          status: "done",
          meta: {},
        });
      });
    }

    logs.sort(
      (a, b) =>
        new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime()
    );

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

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-2"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                viewMode === "dashboard"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📊 Dashboard View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📋 Table View
            </button>
          </div>
          <div className="text-sm text-gray-500 pr-4">
            {totalOrders} total orders
          </div>
        </motion.div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <OrderActionsDashboard
            orders={rawOrders}
            onViewOrder={(filter) => {
              setViewMode("table");
              if (filter === "PENDING") {
                setOrderStatusFilter("Pending");
              } else if (filter === "CONFIRMED") {
                setOrderStatusFilter("Confirmed");
              } else if (filter === "PROCESSING") {
                setOrderStatusFilter("Processing");
              } else if (filter === "PENDING_QUOTE") {
                setOrderStatusFilter("Pending");
              }
            }}
            onCreateQuotation={() => {
              if (firstPendingQuotationOrder) {
                openQuotationModal(firstPendingQuotationOrder);
                return;
              }
              showNotification("No pending orders need quotation right now", "success");
            }}
          />
        )}

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
          <Card className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  All Orders
                </h2>
                <p className="text-sm text-gray-500 mt-1">
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
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Customer & Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Order Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {formattedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="bg-white hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-200 group"
                      >
                        {/* Customer & Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-bold text-emerald-700 flex-shrink-0">
                              {order.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
                                {order.customerName}
                              </p>
                              {order.businessName && (
                                <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {order.businessName}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1 font-semibold">
                                {order.productCategory}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {order.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Order Details */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Quantity:</span>
                              <span className="font-bold text-blue-600">
                                {order.orderDetails?.quantity || 0} pcs
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-semibold text-gray-900">
                                {order.orderDetails?.bagSize || "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Color:</span>
                              <span className="font-semibold text-gray-900">
                                {order.orderDetails?.color || "—"}
                              </span>
                            </div>
                            {order.orderDetails?.length && order.orderDetails?.width && (
                              <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                                <span className="font-medium">Dimensions:</span>{" "}
                                {order.orderDetails.length}×{order.orderDetails.width}×{order.orderDetails.height || 0}{" "}
                                {order.orderDetails.dimensionUnit || "inch"}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
                              <p className="text-[10px] text-emerald-600 font-medium">Total Amount</p>
                              <p className="text-lg font-bold text-emerald-700">
                                ₹{Number(order.amount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Paid:</span>
                              <span className="font-semibold text-blue-600">
                                ₹{Number(order.paidAmount || 0).toLocaleString()}
                              </span>
                            </div>
                            {order.paymentMode && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Mode:</span>{" "}
                                <span className="capitalize">{order.paymentMode}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <Badge 
                              variant={orderStatusColors[order.orderStatusKey] || "primary"}
                              className="text-xs font-semibold w-full justify-center"
                            >
                              {order.orderStatusKey === 'PENDING' ? '⏳' :
                               order.orderStatusKey === 'CONFIRMED' ? '✅' :
                               order.orderStatusKey === 'PROCESSING' ? '🔄' :
                               order.orderStatusKey === 'COMPLETED' ? '🎉' : '❌'}{" "}
                              {order.orderStatus}
                            </Badge>
                            <Badge 
                              variant={paymentColors[order.paymentStatusKey] || "primary"}
                              className="text-xs font-semibold w-full justify-center"
                            >
                              {order.paymentStatusKey === 'PAID' ? '💰' :
                               order.paymentStatusKey === 'PARTIAL' ? '💵' : '❌'}{" "}
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{order.date}</p>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailPanel(true);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCheckOrderAvailability(order)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
                              title="Check Availability"
                            >
                              {checkingOrderId === order.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ClipboardCheck className="h-3.5 w-3.5" />
                              )}
                              <span>{checkingOrderId === order.id ? 'Checking...' : 'Check'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openQuotationModal(order)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-50 transition-all duration-200"
                              title="Create Quotation"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Quote</span>
                            </button>

                            {order.orderStatusKey === "CONFIRMED" && (
                              <button
                                type="button"
                                onClick={() => handleMoveToProcessing(order)}
                                disabled={processingActionId === order.id}
                                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-all duration-200 disabled:opacity-50"
                                title="Start Processing"
                              >
                                {processingActionId === order.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Factory className="h-3.5 w-3.5" />
                                )}
                                <span>Process</span>
                              </button>
                            )}

                            {order.orderStatusKey === "PROCESSING" && (
                              <button
                                type="button"
                                onClick={() => handleCompleteOrder(order)}
                                disabled={completeActionId === order.id}
                                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
                                title="Complete Order"
                              >
                                {completeActionId === order.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                <span>Complete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!formattedOrders.length && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">No orders found</p>
                            <p className="text-sm text-gray-500 mt-1">Create your first order to get started</p>
                          </div>
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
          isOpen={showQuotationModal}
          title={`Quotation — ${COMPANY_NAME}`}
          onClose={() => {
            setShowQuotationModal(false);
            setQuotationOrder(null);
          }}
        >
          {quotationOrder && (
            <div className="space-y-4">
              {quotationLoading ? (
                <div className="flex items-center gap-3 py-10 text-gray-600">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading pricing and BOM…
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-sm font-bold text-gray-900">{quotationOrder.customerName}</p>
                    <p className="text-xs text-gray-600">
                      {quotationOrder.productCategory} · Qty {quotationOrder.orderDetails?.quantity}
                    </p>
                    {quotationOrder.quotation?.status && (
                      <p className="mt-2 text-xs font-semibold text-violet-800">
                        Last saved: {quotationOrder.quotation.status}
                        {quotationOrder.quotation.quotationNumber
                          ? ` · ${quotationOrder.quotation.quotationNumber}`
                          : ""}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Pricing mode (matches availability / processing)
                    </label>
                    <select
                      value={quotationMode}
                      onChange={(e) => setQuotationMode(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="AUTO">AUTO</option>
                      <option value="RAW_ONLY">RAW_ONLY</option>
                      <option value="STOCK_ONLY">STOCK_ONLY</option>
                    </select>
                  </div>

                  {quotationPricing && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
                      <p>
                        Est. material cost (reference): ₹
                        {Number(quotationPricing.totalOrderMaterialCost || 0).toLocaleString()}
                      </p>
                      <p
                        className={
                          (quotationPricing.onDemandCount || 0) > 0
                            ? "mt-1 font-semibold text-amber-800"
                            : "mt-1 font-semibold text-emerald-800"
                        }
                      >
                        On-demand BOM lines: {quotationPricing.onDemandCount ?? 0} (Step 7 blocks processing if &gt; 0)
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Total quoted (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={quotationTotalInput}
                        onChange={(e) => setQuotationTotalInput(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Valid until</label>
                      <input
                        type="date"
                        value={quotationValidUntil}
                        onChange={(e) => setQuotationValidUntil(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="rounded-2xl bg-emerald-700 hover:bg-emerald-800"
                      onClick={() =>
                        generateQuotationPDF(quotationOrder, quotationPricing, {
                          totalQuoted: quotationTotalInput,
                          validUntil: quotationValidUntil,
                          quotationNumber: quotationOrder.quotation?.quotationNumber,
                        })
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button type="button" variant="secondary" className="rounded-2xl" onClick={handleQuotationWhatsApp}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button type="button" variant="secondary" className="rounded-2xl" onClick={handleQuotationMailto}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => patchQuotation("draft")}>
                      Save draft
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-violet-700 hover:bg-violet-800"
                      onClick={() => patchQuotation("sent")}
                    >
                      Mark sent
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-teal-700 hover:bg-teal-800"
                      onClick={() => patchQuotation("approved")}
                    >
                      Approve
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
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

                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                  <div className="flex items-start gap-2">
                    <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                    <div>
                      <p className="text-xs font-bold text-sky-900">Where this step sits in your process</p>
                      <ol className="mt-2 list-inside list-decimal space-y-1 text-[11px] leading-relaxed text-sky-900/90">
                        <li>Quotation — price and terms with the customer</li>
                        <li>Order confirmation — agree SKU, qty, delivery (record on the order)</li>
                        <li>
                          <span className="font-semibold">Availability check (this screen)</span> — finished
                          stock + raw material math before you process
                        </li>
                        <li>Process — reserve inventory / start production</li>
                        <li>Complete — dispatch and close</li>
                      </ol>
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-sky-800/95">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Your existing actions (quotation, confirm, process, complete) are unchanged; this only adds
                        clearer numbers for the availability step.
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

                  <button
                    type="button"
                    onClick={() => {
                      if (!availabilityOrder) return;
                      setAvailabilityModalOpen(false);
                      openQuotationModal(availabilityOrder);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800"
                  >
                    <FileDown className="h-4 w-4" />
                    Open Quotation
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
                ) : availabilityResult?.checkFailed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-red-900">
                          Availability check could not run
                        </h3>
                        <p className="mt-1 text-sm text-red-800">
                          {availabilityResult.errorMessage}
                        </p>
                        <p className="mt-3 text-xs text-red-700/90">
                          Confirm the order line above (product name, bag size, color, dimensions) and that it matches a
                          catalog product. Then use &quot;Apply Mode &amp; Re-Check&quot;.
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
                        availabilityResult.productResolved === false
                          ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50"
                          : availabilityResult.enoughStock
                            ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50"
                            : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                availabilityResult.productResolved === false
                                  ? "bg-indigo-100 text-indigo-700"
                                  : availabilityResult.enoughStock
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {availabilityResult.productResolved === false ? (
                                <Link2 className="h-6 w-6" />
                              ) : availabilityResult.enoughStock ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <AlertTriangle className="h-6 w-6" />
                              )}
                            </div>

                            <div>
                              <h3
                                className={`text-base font-bold ${
                                  availabilityResult.productResolved === false
                                    ? "text-indigo-900"
                                    : availabilityResult.enoughStock
                                      ? "text-emerald-900"
                                      : "text-amber-900"
                                }`}
                              >
                                {availabilityResult.productResolved === false
                                  ? "Catalog product not matched"
                                  : availabilityResult.enoughStock
                                    ? "Smart Availability Passed"
                                    : "Insufficient Stock/Materials"}
                              </h3>
                              <p
                                className={`mt-1 text-sm ${
                                  availabilityResult.productResolved === false
                                    ? "text-indigo-800"
                                    : availabilityResult.enoughStock
                                      ? "text-emerald-800"
                                      : "text-amber-800"
                                }`}
                              >
                                {availabilityResult.message}
                              </p>
                              {availabilityResult.productResolved === false &&
                                availabilityResult.unresolvedSearchTerm && (
                                  <p className="mt-2 text-xs font-mono text-indigo-600">
                                    Search label: {availabilityResult.unresolvedSearchTerm}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm ${
                              availabilityResult.productResolved === false
                                ? "bg-indigo-600"
                                : availabilityResult.enoughStock
                                  ? "bg-emerald-600"
                                  : "bg-amber-600"
                            }`}
                          >
                            {availabilityResult.productResolved === false
                              ? "Link product first"
                              : availabilityResult.enoughStock
                                ? "Ready to Confirm"
                                : "Action Required"}
                          </div>
                        </div>

                        {availabilityResult.productResolved !== false && (
                          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900">How this check splits the order</h4>
                            <p className="mt-1 text-xs text-slate-600">
                              Same order quantity is divided between shelf stock and production; raw rows below apply
                              only to the &quot;production&quot; portion (except in RAW_ONLY, where the full qty uses
                              BOM).
                            </p>
                            <ul className="mt-3 space-y-1.5 text-xs text-slate-800">
                              <li>
                                <span className="font-semibold">Order quantity:</span>{" "}
                                {availabilityResult.requiredQty}
                              </li>
                              <li>
                                <span className="font-semibold">Ship from finished stock (matched line):</span>{" "}
                                {availabilityResult.canFulfillFromStock}
                              </li>
                              <li>
                                <span className="font-semibold">Remaining for production / raw BOM:</span>{" "}
                                {availabilityResult.requiredFromProduction}
                              </li>
                            </ul>
                            <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-snug text-slate-600">
                              <span className="font-semibold text-slate-800">Deduction mode: {deductionMode}</span>
                              {" — "}
                              {DEDUCTION_MODE_HELP[deductionMode] ?? ""}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Bags from finished stock
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                              {availabilityResult.canFulfillFromStock}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Bags from production (BOM)
                            </p>
                            <p className="mt-2 text-2xl font-bold text-amber-900">
                              {availabilityResult.requiredFromProduction}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Est. raw material cost
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">
                              ₹{availabilityResult.totalOrderMaterialCost?.toLocaleString() || 0}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">For production portion only</p>
                          </div>

                          <div
                            className={`rounded-2xl border px-4 py-4 shadow-sm ${
                              Number(availabilityResult.onDemandCount || 0) > 0
                                ? "border-rose-200 bg-rose-50/50"
                                : "border-slate-100 bg-white"
                            }`}
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              BOM lines short on stock
                            </p>
                            <p
                              className={`mt-2 text-2xl font-bold ${
                                Number(availabilityResult.onDemandCount || 0) > 0
                                  ? "text-rose-800"
                                  : "text-slate-900"
                              }`}
                            >
                              {availabilityResult.onDemandCount ?? 0}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">0 = all raw lines sufficient</p>
                          </div>
                        </div>

                        {deductionMode === "STOCK_ONLY" && availabilityResult.productResolved !== false && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950">
                            <span className="font-semibold">STOCK_ONLY:</span> raw material BOM is not evaluated for
                            availability — only finished-bag lines matter for pass/fail. Switch to AUTO to see raw
                            requirements for the uncovered quantity.
                          </div>
                        )}

                        {availabilityResult.productionScalingMeta && (
                          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-violet-900">
                              Dimension scaling (product BOM vs order size)
                            </h4>
                            <p className="mt-2 text-xs leading-relaxed text-violet-900/90">
                              Catalog product base L+W+H ={" "}
                              <strong>{availabilityResult.productionScalingMeta.productLinearSum}</strong>
                              {" · "}
                              This order L+W+H ={" "}
                              <strong>{availabilityResult.productionScalingMeta.orderLinearSum}</strong>
                              {" · "}
                              Scale factor ={" "}
                              <strong>{availabilityResult.productionScalingMeta.factor}</strong>
                            </p>
                            <p className="mt-2 text-[11px] text-violet-800/95">
                              <em>Dimension-based</em> BOM lines multiply required qty by this factor (plus wastage).
                              <em> Fixed</em> lines stay per bag regardless of dimensions.
                            </p>
                          </div>
                        )}

                        {availabilityResult.finishedGoodsInsight && (
                          <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  Finished bags (by product · color · size)
                                </h4>
                                <p className="mt-1 text-xs text-slate-600">
                                  Matched using order{" "}
                                  <span className="font-semibold">
                                    {availabilityResult.finishedGoodsInsight.catalogProductName}
                                  </span>{" "}
                                  · color{" "}
                                  <span className="font-semibold">
                                    {availabilityResult.finishedGoodsInsight.orderColor}
                                  </span>{" "}
                                  · size{" "}
                                  <span className="font-semibold">
                                    {availabilityResult.finishedGoodsInsight.orderBagSize}
                                  </span>{" "}
                                  · dims{" "}
                                  {availabilityResult.finishedGoodsInsight.dimensionsLabel}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl border-slate-300 text-xs"
                                  onClick={() => {
                                    resetAvailabilityModal();
                                    navigate("/rawmaterial");
                                  }}
                                >
                                  Raw materials
                                </Button>
                                <Button
                                  type="button"
                                  className="rounded-xl bg-slate-800 text-xs hover:bg-slate-900"
                                  onClick={() => {
                                    resetAvailabilityModal();
                                    navigate("/inventory");
                                  }}
                                >
                                  Create / add stock
                                </Button>
                              </div>
                            </div>
                            {availabilityResult.finishedGoodsInsight.matchedDescription && (
                              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                                <span className="text-xs font-semibold uppercase text-slate-500">
                                  Matched line
                                </span>
                                <p className="mt-0.5 font-medium">
                                  {availabilityResult.finishedGoodsInsight.matchedDescription}
                                  {availabilityResult.finishedGoodsInsight.matchedSku
                                    ? ` · SKU ${availabilityResult.finishedGoodsInsight.matchedSku}`
                                    : ""}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                  Sellable on this line:{" "}
                                  <span className="font-bold text-slate-900">
                                    {availabilityResult.finishedGoodsInsight.availableOnMatchedLine}
                                  </span>{" "}
                                  · Counted toward this order:{" "}
                                  <span className="font-bold text-slate-900">
                                    {availabilityResult.finishedGoodsInsight.canFulfillFromFinishedLine}
                                  </span>
                                </p>
                              </div>
                            )}
                            {availabilityResult.finishedGoodsInsight.explanations?.length > 0 && (
                              <ul className="list-inside list-disc space-y-1 text-xs text-slate-700">
                                {availabilityResult.finishedGoodsInsight.explanations.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                            {availabilityResult.finishedGoodsInsight.alternatives?.length > 0 && (
                              <div className="overflow-x-auto rounded-xl border border-amber-100 bg-amber-50/40">
                                <p className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                                  Other finished lines (same product & dimensions — different color/size)
                                </p>
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-white/80 text-[10px] font-semibold uppercase text-slate-500">
                                    <tr>
                                      <th className="px-3 py-2">Product</th>
                                      <th className="px-3 py-2">Color</th>
                                      <th className="px-3 py-2">Size</th>
                                      <th className="px-3 py-2 text-right">Avail.</th>
                                      <th className="px-3 py-2">Note</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-amber-100/80">
                                    {availabilityResult.finishedGoodsInsight.alternatives.map((alt, idx) => (
                                      <tr key={idx} className="bg-white/60">
                                        <td className="px-3 py-2 font-medium text-slate-900">
                                          {alt.productName}
                                        </td>
                                        <td className="px-3 py-2">{alt.bagColor}</td>
                                        <td className="px-3 py-2">{alt.bagSizeLabel}</td>
                                        <td className="px-3 py-2 text-right font-bold text-amber-900">
                                          {alt.availableBags}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600">{alt.note}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        {availabilityResult.productResolved === false &&
                          (availabilityResult.referenceInventory?.length > 0 ||
                            availabilityResult.catalogSuggestions?.length > 0) && (
                            <div className="mt-5 space-y-4">
                              {availabilityResult.referenceInventory?.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
                                  <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50/80 px-4 py-3">
                                    <Layers className="h-4 w-4 text-indigo-700" />
                                    <h4 className="text-sm font-bold text-indigo-900">
                                      Finished bags (reference — same keywords)
                                    </h4>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-gray-50 text-[10px] font-semibold uppercase text-gray-500">
                                        <tr>
                                          <th className="px-3 py-2">SKU</th>
                                          <th className="px-3 py-2">Product</th>
                                          <th className="px-3 py-2">Color</th>
                                          <th className="px-3 py-2">Size label</th>
                                          <th className="px-3 py-2 text-right">Avail. bags</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {availabilityResult.referenceInventory.map((row, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-2 font-mono text-gray-700">{row.sku}</td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                              {row.productName}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">{row.bagColor || "—"}</td>
                                            <td className="px-3 py-2 text-gray-600">{row.bagSizeLabel || "—"}</td>
                                            <td className="px-3 py-2 text-right font-bold text-indigo-800">
                                              {row.availableBags}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              {availabilityResult.catalogSuggestions?.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
                                  <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50/80 px-4 py-3">
                                    <Package className="h-4 w-4 text-violet-700" />
                                    <h4 className="text-sm font-bold text-violet-900">
                                      Suggested catalog products to link
                                    </h4>
                                  </div>
                                  <ul className="divide-y divide-gray-100 px-4 py-2 text-sm">
                                    {availabilityResult.catalogSuggestions.map((s) => (
                                      <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                                        <span className="font-semibold text-gray-900">{s.name}</span>
                                        <span className="text-xs text-gray-500">
                                          {s.category} · SKU {s.sku || "—"} ·{" "}
                                          <span className="font-mono text-violet-700">{s.id}</span>
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-500">
                                    Update the order with{" "}
                                    <code className="rounded bg-gray-100 px-1">orderDetails.productId</code> in
                                    your admin / API to lock fulfillment to one of these products.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                          <h4 className="text-sm font-bold text-gray-900">
                            Inventory Match Suggestions (Size / Color)
                          </h4>
                          <p className="mt-1 text-xs text-gray-500">
                            Exact match = same dimensions + same size + same color.
                          </p>

                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                              <p className="text-xs font-semibold uppercase text-emerald-700">
                                Exact Matches
                              </p>
                              <p className="mt-1 text-lg font-bold text-emerald-900">
                                {availabilityResult?.matchInsight?.exactMatches?.length || 0}
                              </p>
                            </div>
                            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                              <p className="text-xs font-semibold uppercase text-amber-700">
                                Near Matches
                              </p>
                              <p className="mt-1 text-lg font-bold text-amber-900">
                                {(
                                  (availabilityResult?.matchInsight?.sizeMatchedColorDifferent?.length || 0) +
                                  (availabilityResult?.matchInsight?.colorMatchedSizeDifferent?.length || 0) +
                                  (availabilityResult?.matchInsight?.nearDimensionMatches?.length || 0)
                                )}
                              </p>
                            </div>
                          </div>

                          {(availabilityResult?.matchInsight?.sizeMatchedColorDifferent?.length > 0 ||
                            availabilityResult?.matchInsight?.colorMatchedSizeDifferent?.length > 0) && (
                            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                              <p className="font-semibold">Suggested alternatives found:</p>
                              <p className="mt-1">
                                {availabilityResult?.matchInsight?.sizeMatchedColorDifferent?.length > 0
                                  ? `Same size but different color: ${availabilityResult.matchInsight.sizeMatchedColorDifferent.length}. `
                                  : ""}
                                {availabilityResult?.matchInsight?.colorMatchedSizeDifferent?.length > 0
                                  ? `Same color but different size: ${availabilityResult.matchInsight.colorMatchedSizeDifferent.length}.`
                                  : ""}
                              </p>
                            </div>
                          )}

                          {!availabilityResult?.matchInsight?.hasAnySuggestedMatch && (
                            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                              <p className="text-sm font-semibold text-red-700">
                                No size/color inventory suggestion found.
                              </p>
                              <p className="mt-1 text-xs text-red-600">
                                Create or update raw material first, then create required stock.
                              </p>
                              <div className="mt-3">
                                <Button
                                  type="button"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    resetAvailabilityModal();
                                    navigate("/rawmaterial");
                                  }}
                                >
                                  Create Raw Material
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {availabilityResult.materialRequirements?.length > 0 && (
                          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                              <h4 className="text-sm font-bold text-gray-900">Raw material BOM (for production portion)</h4>
                              <p className="mt-1 text-xs text-gray-600">
                                Quantities are for{" "}
                                <strong>{availabilityResult.requiredFromProduction}</strong> bag(s) to manufacture
                                (after finished stock). Per-bag qty excludes wastage; dimension-based lines use the
                                scale factor above.
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="bg-gray-50/30 text-[10px] font-semibold uppercase text-gray-500">
                                  <tr>
                                    <th className="px-3 py-3">Material</th>
                                    <th className="px-3 py-3">Rule</th>
                                    <th className="px-3 py-3">Per bag</th>
                                    <th className="px-3 py-3">Total need</th>
                                    <th className="px-3 py-3">Usable stock</th>
                                    <th className="px-3 py-3">Shortfall</th>
                                    <th className="px-3 py-3">Unit price</th>
                                    <th className="px-3 py-3 text-right">Line cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {availabilityResult.materialRequirements.map((mat, idx) => {
                                    const usable =
                                      mat.availableStockAtCheck != null
                                        ? Number(mat.availableStockAtCheck)
                                        : null;
                                    const shortfall =
                                      usable != null
                                        ? Math.max(0, Number(mat.totalQuantity) - usable)
                                        : null;
                                    return (
                                      <tr key={idx} className={mat.isAvailable ? "" : "bg-red-50/30 text-red-800"}>
                                        <td className="px-3 py-3 font-medium">
                                          <div className="flex items-center gap-2">
                                            {!mat.isAvailable && <AlertTriangle className="h-3 w-3 shrink-0" />}
                                            {mat.name}
                                          </div>
                                        </td>
                                        <td className="px-3 py-3 text-xs text-gray-800">
                                          {mat.usageType === "dimension_based" ? (
                                            <span>
                                              Dim. scaled
                                              {mat.lineScaleFactor != null && (
                                                <span className="block font-mono text-[10px] text-gray-600">
                                                  ×{Number(mat.lineScaleFactor).toFixed(4)}
                                                </span>
                                              )}
                                            </span>
                                          ) : mat.usageType === "fixed" ? (
                                            "Fixed / bag"
                                          ) : (
                                            "—"
                                          )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                          {mat.quantityPerBag} {mat.unit}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap font-medium">
                                          {mat.totalQuantity} {mat.unit}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                          {usable != null ? usable.toLocaleString() : "—"}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                          {shortfall != null ? shortfall.toLocaleString() : "—"}
                                        </td>
                                        <td className="px-3 py-3">₹{mat.unitPrice}</td>
                                        <td className="px-3 py-3 text-right font-bold">
                                          ₹{mat.totalPrice?.toLocaleString()}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr className="border-t-2 border-emerald-100 bg-emerald-50/30">
                                    <td colSpan="7" className="px-3 py-3 text-right font-bold text-gray-900">
                                      Total estimated raw cost:
                                    </td>
                                    <td className="px-3 py-3 text-right font-extrabold text-emerald-800 text-lg">
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
                              Delivery Mode
                            </label>
                            <select
                              value={confirmOrderForm.deliveryMode}
                              onChange={(e) =>
                                handleConfirmOrderChange("deliveryMode", e.target.value)
                              }
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                              <option value="courier">Courier</option>
                              <option value="transport">Transport</option>
                              <option value="pickup">Pickup</option>
                              <option value="self">Self Delivery</option>
                            </select>
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
                    <p><span className="font-semibold">Delivery Mode:</span> {selectedOrder.delivery?.deliveryMode || "Not added"}</p>
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
                    className="rounded-2xl bg-violet-700 px-4 py-2 hover:bg-violet-800"
                    onClick={() => openQuotationModal(selectedOrder)}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Quotation
                  </Button>

                  {selectedOrder.orderStatusKey === "CONFIRMED" && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-2xl px-4 py-2"
                        onClick={() => handleProcessingCheckOnly(selectedOrder)}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Processing check
                      </Button>
                      <Button
                        type="button"
                        className="rounded-2xl bg-blue-700 px-4 py-2 hover:bg-blue-800"
                        onClick={() => handleMoveToProcessing(selectedOrder)}
                        disabled={processingActionId === selectedOrder.id}
                      >
                        {processingActionId === selectedOrder.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Factory className="mr-2 h-4 w-4" />
                        )}
                        Start processing
                      </Button>
                    </>
                  )}

                  {selectedOrder.orderStatusKey === "PROCESSING" && (
                    <Button
                      type="button"
                      className="rounded-2xl bg-emerald-700 px-4 py-2 hover:bg-emerald-800"
                      onClick={() => handleCompleteOrder(selectedOrder)}
                      disabled={completeActionId === selectedOrder.id}
                    >
                      {completeActionId === selectedOrder.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Complete order
                    </Button>
                  )}

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