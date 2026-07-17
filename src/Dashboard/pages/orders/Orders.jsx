import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getProductTaxInfo, exportToExcel } from "../../utils";
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
import OrderListSection from "../../components/orders/OrderListSection";
import {
  Plus,
  ArrowRight,
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
  XCircle,
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
  Edit,
  Trash2,
  Truck,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useUIStore } from "../../store";
import { useGetAllOrders, useGetOrderStats } from "../../../../hook/order";
import { useGetInventory } from "../../../../hook/inventory";
import { useGetAllProducts } from "../../../../hook/Product";
import { useGetAllRawMaterials } from "../../../../hook/RawMaterial";

const initialManualOrderForm = {
  customerName: "",
  businessName: "",
  phone: "",
  email: "",
  productId: "",
  productCategory: "",
  source: "Manual Order",
  bagSize: "",
  color: "",
  quantity: "",
  length: "",
  width: "",
  height: "",
  gsm: "",
  bf: "",
  dimensionUnit: "inch",
  notes: "",
  unit: "",
  calculationMode: "auto",
  convertedQuantity: "",
  editReason: "",
};

const initialConfirmOrderForm = {
  totalAmount: "",
  subtotalAmount: "",
  taxRate: "0",
  shippingCharges: "0",
  otherCharges: "0",
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

const getLineSubtotalShare = (line, subtotal, lines, productItems, pricing = null) => {
  let totalSuggestedOfAll = 0;
  const lineSuggestedVals = lines.map(l => {
    const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(l?.productId || "").trim());
    const price = prod?.basePrice || prod?.unitPrice || prod?.sellingPrice || 8;
    const suggested = Number(l.quantity || 0) * price;
    totalSuggestedOfAll += suggested;
    return { lineId: l.productId || l._id, suggested };
  });

  const match = lineSuggestedVals.find(v => String(v.lineId) === String(line.productId || line._id));
  const lineSuggested = match ? match.suggested : 0;
  const lineShareFraction = totalSuggestedOfAll > 0 ? (lineSuggested / totalSuggestedOfAll) : (1 / lines.length);
  return subtotal * lineShareFraction;
};

const getQuotationItemsBreakdown = (order, pricing, subtotal, productItems) => {
  const lines = order?.orderDetailsList?.length > 0
    ? order.orderDetailsList
    : [order?.orderDetails].filter(Boolean);

  const sub = Number(subtotal || 0);

  let totalSuggestedOfAll = 0;
  const lineSuggestedVals = lines.map(line => {
    const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
    const price = prod?.basePrice || prod?.unitPrice || prod?.sellingPrice || 8;
    const suggested = Number(line.quantity || 0) * price;
    totalSuggestedOfAll += suggested;
    return { line, suggested };
  });

  return lineSuggestedVals.map(({ line, suggested }) => {
    const lineShareFraction = totalSuggestedOfAll > 0 ? (suggested / totalSuggestedOfAll) : (1 / lines.length);
    const lineSubtotal = sub * lineShareFraction;
    const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
    const taxInfo = getProductTaxInfo(prod || line);
    const lineGstRate = line.gstRate != null ? Number(line.gstRate) : taxInfo.gstRate;
    const lineHsn = line.hsnCode || taxInfo.hsnCode;

    return {
      productName: prod?.name || order.productCategory || "Product",
      productId: line.productId,
      hsnCode: lineHsn,
      gstRate: lineGstRate,
      subtotal: lineSubtotal,
      gstAmount: lineSubtotal * (lineGstRate / 100),
    };
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((state) => state.showNotification);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      setLogoBase64(canvas.toDataURL("image/png"));
    };
    img.src = "/Nirmalyam_Logo-removebg-preview.webp";
  }, []);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => {
    const ref = searchParams.get("orderRef") || searchParams.get("search") || "";
    return ref.replace("#", "");
  });
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically reset status filters when redirecting to look up a specific orderRef
  useEffect(() => {
    const targetRef = searchParams.get("orderRef");
    if (targetRef) {
      setOrderStatusFilter("All");
      setPaymentStatusFilter("All");
    }
  }, [searchParams]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" or "table"
  const [actionDrawerType, setActionDrawerType] = useState(null);
  const [activeTrackerOrderId, setActiveTrackerOrderId] = useState(null);

  const [showReportPreview, setShowReportPreview] = useState(false);

  const [manualOrderForm, setManualOrderForm] = useState(initialManualOrderForm);
  const [manualSelectedProducts, setManualSelectedProducts] = useState([]);
  const [expandedProductIndex, setExpandedProductIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState(initialManualOrderForm);
  const [showAdvancedAvailability, setShowAdvancedAvailability] = useState(false);

  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityOrder, setAvailabilityOrder] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [deductionMode, setDeductionMode] = useState("AUTO");
  const [confirmOrderForm, setConfirmOrderForm] = useState(initialConfirmOrderForm);
  const [confirmPath, setConfirmPath] = useState("reserve"); // "reserve" or "dispatch"
  const [useAvailableStock, setUseAvailableStock] = useState(false);
  const [activeLogOrder, setActiveLogOrder] = useState(null);
  
  // BILL GENERATOR STATES
  const [showBillModal, setShowBillModal] = useState(false);
  const [billOrder, setBillOrder] = useState(null);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billTaxRate, setBillTaxRate] = useState("0");
  const [billShipping, setBillShipping] = useState("0");
  const [billDiscount, setBillDiscount] = useState("0");
  const [billNotes, setBillNotes] = useState("Thank you for your business!");
  const [billSubtotal, setBillSubtotal] = useState("0");
  const [billOther, setBillOther] = useState("0");
  const [isBillSaved, setIsBillSaved] = useState(false);
  const [billPaymentMode, setBillPaymentMode] = useState("cash");
  const [showPaymentInfo, setShowPaymentInfo] = useState(() => 
    localStorage.getItem("nirmalyam_show_payment_info") === "true"
  );
  const [lastReceipt, setLastReceipt] = useState(null);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationOrder, setQuotationOrder] = useState(null);
  const [quotationPricing, setQuotationPricing] = useState(null);
  const [quotationMode, setQuotationMode] = useState("AUTO");
  const [quotationValidUntil, setQuotationValidUntil] = useState("");
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationTotalInput, setQuotationTotalInput] = useState("");
  const [quotationNumberInput, setQuotationNumberInput] = useState("");
  const [quotationTaxRateInput, setQuotationTaxRateInput] = useState("0");
  const [quotationShippingInput, setQuotationShippingInput] = useState("0");
  const [quotationOtherInput, setQuotationOtherInput] = useState("0");
  const [quotationSubtotalInput, setQuotationSubtotalInput] = useState("");
  const [processingActionId, setProcessingActionId] = useState(null);
  const [completeActionId, setCompleteActionId] = useState(null);
  const [deliveredActionId, setDeliveredActionId] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentMode: "cash", note: "" });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState("");
  const [manualLossInput, setManualLossInput] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryTargetOrder, setDeliveryTargetOrder] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    receiverName: "",
    receiverPhone: "",
    deliveryMode: "courier",
    deliveryAddress: "",
    deliveryDate: "",
    dispatchDate: "",
    deliveryNotes: "",
  });

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

  useEffect(() => {
    const targetRef = searchParams.get("orderRef");
    if (targetRef && data?.orders && data.orders.length > 0) {
      const cleanTarget = targetRef.replace("#", "").toLowerCase().trim();
      const matched = data.orders.find(o => 
        (o.reference && o.reference.toLowerCase().includes(cleanTarget)) ||
        (o._id && o._id.toLowerCase().includes(cleanTarget))
      );
      if (matched) {
        setSelectedOrder(matched);
        setShowDetailPanel(true);
      }
    }
  }, [data, searchParams]);

  const { data: inventoryData, refetch: refetchInventory } = useGetInventory();
  const { data: productsData } = useGetAllProducts();
  const { data: orderStats, refetch: refetchOrderStats } = useGetOrderStats();
  const { data: rawMaterialsData } = useGetAllRawMaterials();

  const rawMaterials = useMemo(() => {
    if (Array.isArray(rawMaterialsData)) return rawMaterialsData;
    return [];
  }, [rawMaterialsData]);

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

  const currentActiveOrder = useMemo(() => {
    if (!activeLogOrder) return null;
    const allOrders = data?.orders || [];
    const found = allOrders.find(o => String(o.id || o._id) === String(activeLogOrder.id || activeLogOrder._id));
    return found || activeLogOrder;
  }, [data, activeLogOrder]);

  useEffect(() => {
    if (!activeLogOrder && data?.orders?.length > 0) {
      setActiveLogOrder(data.orders[0]);
    }
  }, [data, activeLogOrder]);

  useEffect(() => {
    const selProd = productItems.find(
      (p) => String(p?._id || p?.id || "").trim() === manualOrderForm.productId
    );
    const isRoll = !!(selProd?.category?.toLowerCase().includes("roll") || manualOrderForm.productCategory?.toLowerCase().includes("roll"));
    
    if (manualOrderForm.calculationMode === "auto") {
      const qty = Number(manualOrderForm.quantity || 0);
      if (qty <= 0) {
        setManualOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
        return;
      }

      if (!isRoll) {
        if (manualOrderForm.unit === "kg") {
          const weight = Number(selProd?.weight || 0);
          if (weight > 0) {
            setManualOrderForm(prev => ({ ...prev, convertedQuantity: Math.ceil(qty / weight) }));
          } else {
            setManualOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
          }
        } else {
          setManualOrderForm(prev => ({ ...prev, convertedQuantity: qty }));
        }
      } else {
        if (manualOrderForm.unit === "m") {
          const width = Number(manualOrderForm.width || selProd?.dimensions?.width || 0);
          const gsm = Number(manualOrderForm.gsm || selProd?.gsm || 0);
          if (width > 0 && gsm > 0) {
            const calculated = Number(((width * 2.54 * qty * gsm) / 100000).toFixed(2));
            setManualOrderForm(prev => ({ ...prev, convertedQuantity: calculated }));
          } else {
            setManualOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
          }
        } else {
          setManualOrderForm(prev => ({ ...prev, convertedQuantity: qty }));
        }
      }
    }
  }, [
    manualOrderForm.productId,
    manualOrderForm.quantity,
    manualOrderForm.unit,
    manualOrderForm.calculationMode,
    manualOrderForm.gsm,
    manualOrderForm.width,
    productItems
  ]);

  useEffect(() => {
    const selProd = productItems.find(
      (p) => String(p?._id || p?.id || "").trim() === editOrderForm.productId
    );
    const isRoll = !!(selProd?.category?.toLowerCase().includes("roll") || editOrderForm.productCategory?.toLowerCase().includes("roll"));
    
    if (editOrderForm.calculationMode === "auto") {
      const qty = Number(editOrderForm.quantity || 0);
      if (qty <= 0) {
        setEditOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
        return;
      }

      if (!isRoll) {
        if (editOrderForm.unit === "kg") {
          const weight = Number(selProd?.weight || 0);
          if (weight > 0) {
            setEditOrderForm(prev => ({ ...prev, convertedQuantity: Math.ceil(qty / weight) }));
          } else {
            setEditOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
          }
        } else {
          setEditOrderForm(prev => ({ ...prev, convertedQuantity: qty }));
        }
      } else {
        if (editOrderForm.unit === "m") {
          const width = Number(editOrderForm.width || selProd?.dimensions?.width || 0);
          const gsm = Number(editOrderForm.gsm || selProd?.gsm || 0);
          if (width > 0 && gsm > 0) {
            const calculated = Number(((width * 2.54 * qty * gsm) / 100000).toFixed(2));
            setEditOrderForm(prev => ({ ...prev, convertedQuantity: calculated }));
          } else {
            setEditOrderForm(prev => ({ ...prev, convertedQuantity: "" }));
          }
        } else {
          setEditOrderForm(prev => ({ ...prev, convertedQuantity: qty }));
        }
      }
    }
  }, [
    editOrderForm.productId,
    editOrderForm.quantity,
    editOrderForm.unit,
    editOrderForm.calculationMode,
    editOrderForm.gsm,
    editOrderForm.width,
    productItems
  ]);

  const rawOrders = data?.orders || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const normalizePaymentStatusKey = (status) => {
    const key = String(status || "Unpaid")
      .trim()
      .toUpperCase();
    if (key.startsWith("PARTIAL")) return "PARTIAL";
    return key;
  };

  const getOrderReference = (id) => {
    const value = String(id || "").trim();
    return value ? `#${value.slice(-6).toUpperCase()}` : "#ORDER";
  };

  const formatDimensionsLabel = (dimensions, category) => {
    if (!dimensions) return "Not added";
    const length = Number(dimensions.length || 0);
    const width = Number(dimensions.width || 0);
    const height = Number(dimensions.height || 0);
    const unit = dimensions.unit || "inch";

    if (!length && !width && !height) return "Not added";
    if (String(category || "").toLowerCase().includes("roll")) {
      return `Width: ${width} ${unit}`;
    }
    return `${length} x ${width} x ${height} ${unit}`;
  };

  const formattedOrders = useMemo(() => {
    return rawOrders.map((order) => {
      const dimensions = order?.orderDetails?.dimensions || {};
      const paymentMode =
        order?.confirmedPayment?.paymentMode || order?.payment?.paymentType || "";
      const totalAmount = Number(order?.totalAmount || 0);
      const paidAmount = Number(order?.paidAmount || 0);

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
        totalAmount,
        paidAmount,
        orderStatusKey: (order?.orderStatus || "Pending").toUpperCase(),
        paymentStatusKey: normalizePaymentStatusKey(order?.paymentStatus),
        date: order?.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "—",
        fullDate: order?.createdAt || "",
        createdAt: order?.createdAt || null,
        updatedAt: order?.updatedAt || null,
        notes: order?.notes || "",
        quotation: order?.quotation || null,
        payment: order?.payment || {},
        paymentMode,
        orderDetails: {
          ...(order?.orderDetails || {}),
          length:
            order?.orderDetails?.dimensions?.length ?? order?.orderDetails?.length ?? 0,
          width:
            order?.orderDetails?.dimensions?.width ?? order?.orderDetails?.width ?? 0,
          height:
            order?.orderDetails?.dimensions?.height ?? order?.orderDetails?.height ?? 0,
          dimensionUnit:
            order?.orderDetails?.dimensions?.unit ||
            order?.orderDetails?.dimensionUnit ||
            "inch",
          dimensions,
        },
        orderDimensions: dimensions,
        dimensionSummary: formatDimensionsLabel(dimensions, order?.productCategory),
        confirmedPayment: order?.confirmedPayment || {},
        delivery: order?.delivery || {},
        deliveryAddress: order?.delivery?.deliveryAddress || "",
        deliveryDate: order?.delivery?.deliveryDate || null,
        dispatchDate: order?.delivery?.dispatchDate || null,
        deliveryMode: order?.delivery?.deliveryMode || "",
        inventoryCheck: order?.inventoryCheck || {},
        quotation: order?.quotation || {},
        lastProcessingCheck: order?.lastProcessingCheck || {},
        workflowLogs: order?.workflowLogs || [],
        isConfirmed: order?.isConfirmed || false,
        confirmedAt: order?.confirmedAt || null,
        confirmedBy: order?.confirmedBy || null,
        amount: totalAmount,
        pendingAmount: Math.max(0, totalAmount - paidAmount),
        reference: getOrderReference(order?._id),
        avatar: (order?.customerName || "U")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        orderDetailsList: order?.orderDetailsList || [],
        modificationHistory: order?.modificationHistory || [],
        returns: order?.returns || [],
      };
    });
  }, [rawOrders]);

  const totalOrders = orderStats?.totalOrders ?? pagination?.total ?? formattedOrders.length;
  const pendingCount = orderStats?.statusCounts?.Pending ?? rawOrders.filter((o) => o.orderStatus === "Pending").length;
  const processingCount = orderStats?.statusCounts?.Processing ?? rawOrders.filter((o) => o.orderStatus === "Processing").length;
  const completedCount = orderStats?.statusCounts?.Completed ?? rawOrders.filter((o) => o.orderStatus === "Completed").length;
  const confirmedCount = orderStats?.statusCounts?.Confirmed ?? rawOrders.filter((o) => o.orderStatus === "Confirmed").length;
  const partialPaidCount = orderStats?.paymentCounts?.["Partial Paid"] ?? rawOrders.filter(
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
    DELIVERED: "success",
    CANCELLED: "danger",
  };

  const paymentColors = {
    UNPAID: "danger",
    PARTIAL: "warning",
    PAID: "success",
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

  const orderStatusMeta = {
    PENDING: { label: "Pending", icon: Clock3, tone: "text-amber-700" },
    CONFIRMED: { label: "Confirmed", icon: ShieldCheck, tone: "text-emerald-700" },
    PROCESSING: { label: "Processing", icon: RefreshCw, tone: "text-blue-700" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, tone: "text-emerald-700" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, tone: "text-emerald-700" },
    CANCELLED: { label: "Cancelled", icon: AlertTriangle, tone: "text-red-700" },
  };

  const paymentStatusMeta = {
    UNPAID: { label: "Unpaid", icon: AlertTriangle, tone: "text-red-700" },
    PARTIAL: { label: "Partial Paid", icon: Wallet, tone: "text-amber-700" },
    PAID: { label: "Paid", icon: CheckCircle2, tone: "text-emerald-700" },
  };

  const handleFormChange = (field, value) => {
    let cleanVal = value;
    if (field === "phone") {
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setManualOrderForm((prev) => ({
      ...prev,
      [field]: cleanVal,
    }));
  };

  const resetManualOrderForm = () => {
    setManualOrderForm(initialManualOrderForm);
    setManualSelectedProducts([]);
    setExpandedProductIndex(null);
    setShowCreateModal(false);
  };

  const handleAddProductToManualList = () => {
    if (!manualOrderForm.customerName) {
      toast.error("Customer Name is required");
      return;
    }
    if (!manualOrderForm.phone) {
      toast.error("Phone number is required");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(manualOrderForm.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (manualOrderForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualOrderForm.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    const selProd = productItems.find(p => String(p?._id || p?.id || "").trim() === manualOrderForm.productId);
    if (!selProd) {
      toast.error("Please select a product first");
      return;
    }
    const isRoll = !!(selProd?.category?.toLowerCase().includes("roll") || manualOrderForm.productCategory?.toLowerCase().includes("roll"));
    
    if (!manualOrderForm.quantity || Number(manualOrderForm.quantity) <= 0) {
      toast.error("Please enter a valid order quantity");
      return;
    }
    if (!manualOrderForm.width || Number(manualOrderForm.width) <= 0) {
      toast.error("Please enter a valid width");
      return;
    }
    if (isRoll) {
      if (!manualOrderForm.gsm || Number(manualOrderForm.gsm) <= 0) {
        toast.error("Please enter a valid GSM");
        return;
      }
      if (!manualOrderForm.bf || Number(manualOrderForm.bf) <= 0) {
        toast.error("Please enter a valid BF");
        return;
      }
    } else {
      if (!manualOrderForm.bagSize) {
        toast.error("Please enter bag size");
        return;
      }
      if (!manualOrderForm.length || Number(manualOrderForm.length) <= 0) {
        toast.error("Please enter a valid length");
        return;
      }
      if (!manualOrderForm.height || Number(manualOrderForm.height) <= 0) {
        toast.error("Please enter a valid height");
        return;
      }
    }

    const newProductEntry = {
      productId: manualOrderForm.productId,
      productName: selProd.name,
      productSku: selProd.sku,
      productCategory: selProd.category || manualOrderForm.productCategory || "Kraft Rolls",
      bagSize: isRoll ? undefined : manualOrderForm.bagSize,
      color: isRoll ? undefined : manualOrderForm.color,
      quantity: Number(manualOrderForm.quantity),
      unit: manualOrderForm.unit || (isRoll ? "kg" : "pcs"),
      gsm: manualOrderForm.gsm ? Number(manualOrderForm.gsm) : undefined,
      bf: isRoll && manualOrderForm.bf ? Number(manualOrderForm.bf) : undefined,
      calculationMode: manualOrderForm.calculationMode || "auto",
      convertedQuantity: manualOrderForm.convertedQuantity ? Number(manualOrderForm.convertedQuantity) : undefined,
      dimensions: {
        length: isRoll ? 0 : Number(manualOrderForm.length),
        width: Number(manualOrderForm.width),
        height: isRoll ? 0 : Number(manualOrderForm.height),
        unit: manualOrderForm.dimensionUnit,
      },
      basePrice: selProd.basePrice || 0,
      estimationConfig: selProd.estimationConfig || {},
      hsnCode: selProd.hsnCode || "",
      gstRate: selProd.gstRate ?? 18,
    };

    setManualSelectedProducts(prev => [...prev, newProductEntry]);

    // Reset ONLY the product-specific fields in manualOrderForm, keep customer details!
    setManualOrderForm(prev => ({
      ...prev,
      productId: "",
      productCategory: "",
      bagSize: "",
      color: "",
      quantity: "",
      length: "",
      width: "",
      height: "",
      gsm: "",
      bf: "",
      dimensionUnit: "inch",
      unit: "",
      calculationMode: "auto",
      convertedQuantity: "",
    }));
  };

  const handleRemoveProductFromManualList = (index) => {
    setManualSelectedProducts(prev => prev.filter((_, i) => i !== index));
    if (expandedProductIndex === index) {
      setExpandedProductIndex(null);
    } else if (expandedProductIndex > index) {
      setExpandedProductIndex(expandedProductIndex - 1);
    }
  };

  const handleEditFormChange = (field, value) => {
    let cleanVal = value;
    if (field === "phone") {
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setEditOrderForm((prev) => ({
      ...prev,
      [field]: cleanVal,
    }));
  };

  const resetEditOrderForm = () => {
    setEditOrderForm(initialManualOrderForm);
    setShowEditModal(false);
    setEditingOrder(null);
  };

  const handleConfirmOrderChange = (field, value) => {
    let cleanVal = value;
    if (field === "receiverPhone") {
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setConfirmOrderForm((prev) => ({
      ...prev,
      [field]: cleanVal,
    }));
  };

  const handleConfirmOrderPriceChange = (field, val) => {
    setConfirmOrderForm((prev) => {
      const next = { ...prev, [field]: val };
      const sub = Number(next.subtotalAmount || 0);
      const tax = Number(next.taxRate || 0);
      const ship = Number(next.shippingCharges || 0);
      const other = Number(next.otherCharges || 0);
      const total = sub * (1 + tax / 100) + ship + other;
      next.totalAmount = total > 0 ? String(Number(total.toFixed(2))) : "0";
      return next;
    });
  };

  const resetAvailabilityModal = () => {
    setAvailabilityModalOpen(false);
    setAvailabilityOrder(null);
    setAvailabilityResult(null);
    setConfirmOrderForm(initialConfirmOrderForm);
    setCheckingOrderId(null);
    setUseAvailableStock(false);
    setShowAdvancedAvailability(false);
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
    const orderSize = normalizeText(order?.orderDetails?.bagSize);

    const sameDimensionItems = inventoryItems.filter((item) =>
      isSameDimension(item, order)
    );

    const exactMatches = sameDimensionItems.filter((item) => {
      const itemSize = normalizeText(item?.bagSizeLabel);
      return itemSize === orderSize;
    });

    const sizeMatchedColorDifferent = [];

    const colorMatchedSizeDifferent = [];

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

  const handleCheckOrderAvailability = async (order, overrideStock = false) => {
    setCheckingOrderId(order.id || order._id);
    setAvailabilityOrder(order);
    setAvailabilityResult(null);
    setConfirmOrderForm(initialConfirmOrderForm);
    setAvailabilityModalOpen(true);
    setUseAvailableStock(overrideStock);

    try {
      //  REAL API CALL to the Smart Inventory Brain
      const resp = await axiosInstance.get(
        `/orders/${order.id || order._id}/availability`,
        { params: { mode: deductionMode, useAvailableStock: overrideStock } }
      );

      if (resp.data.success) {
        const resData = applyAvailabilityCostCorrection(resp.data.data, order);
        const matchInsight = analyzeInventoryMatches(order);
        const productResolved = resData.productResolved !== false;

        const existingQuotation = order.quotation || {};
        const qSubtotal = existingQuotation.subtotalAmount || existingQuotation.totalQuoted || resData.totalOrderMaterialCost || 0;
        const qTaxRate = existingQuotation.taxRate || 0;
        const qShipping = existingQuotation.shippingCharges || 0;
        const qOther = existingQuotation.otherCharges || 0;
        const qTotal = existingQuotation.totalQuoted || (qSubtotal * (1 + qTaxRate / 100) + qShipping + qOther);

        const remainingToPay = Math.max(0, qTotal - (order.paidAmount || 0));

        setConfirmOrderForm({
          totalAmount: String(qTotal > 0 ? qTotal : ""),
          subtotalAmount: String(qSubtotal > 0 ? qSubtotal : ""),
          taxRate: String(qTaxRate),
          shippingCharges: String(qShipping),
          otherCharges: String(qOther),
          paidAmount: String(remainingToPay),
          paymentMode: "cash",
          deliveryMode: order.delivery?.deliveryMode || "courier",
          deliveryAddress: order.delivery?.deliveryAddress || "",
          deliveryDate: order.delivery?.deliveryDate ? new Date(order.delivery.deliveryDate).toISOString().slice(0, 10) : "",
          dispatchDate: order.delivery?.dispatchDate ? new Date(order.delivery.dispatchDate).toISOString().slice(0, 10) : "",
          receiverName: order.delivery?.receiverName || "",
          receiverPhone: order.delivery?.receiverPhone || "",
          deliveryNotes: order.delivery?.deliveryNotes || "",
        });

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
          perProductResults: resData.perProductResults || null,
          productCount: resData.productCount || 1,
          requiredQty: resData.perProductResults
            ? resData.perProductResults.reduce((sum, pr) => sum + Number(pr.quantity || 0), 0)
            : Number(order?.orderDetails?.quantity || 0),
          message: !productResolved
            ? resData.adminHint ||
            "No catalog product matched this order label. Use suggestions below or set product ID on the order."
            : resData.isAvailable
              ? `Order can be fulfilled using current logic mode.${resData.productCount > 1 ? ` (${resData.productCount} products checked)` : ""}`
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

  const handleQuickMatchStock = async (alt) => {
    if (!availabilityOrder || !alt.inventoryId) return;

    const targetColor = availabilityOrder.orderDetails?.color || "";
    const targetSize = availabilityOrder.orderDetails?.bagSize || "";

    if (
      !window.confirm(
        `Are you sure you want to change this stock item's color and size to match the current order?\n\n` +
          `Product: ${alt.productName}\n` +
          `Current Details: Color: "${alt.bagColor}", Size: "${alt.bagSizeLabel}"\n` +
          `Target Details: Color: "${targetColor || "—"}", Size: "${targetSize || "—"}"\n\n` +
          `This will align the stock parameters so it matches and ships for this order.`
      )
    ) {
      return;
    }

    const loadingToast = toast.loading("Aligning stock specifications...");
    try {
      await axiosInstance.patch(`/inventory/${alt.inventoryId}/update`, {
        bagColor: targetColor,
        bagSizeLabel: targetSize,
      });

      toast.success("Stock details aligned! Re-checking availability...", {
        id: loadingToast,
      });

      await handleCheckOrderAvailability(availabilityOrder, useAvailableStock);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to align stock", {
        id: loadingToast,
      });
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

    if (!availabilityResult?.enoughStock && !useAvailableStock) {
      showNotification("Insufficient stock/materials for this order", "error");
      return;
    }

    const isDispatch = confirmPath === "dispatch";

    if (isDispatch) {
      if (!confirmOrderForm.receiverName || !confirmOrderForm.receiverPhone) {
        showNotification("Please fill On-site Contact Person Name and Phone", "error");
        return;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(confirmOrderForm.receiverPhone)) {
        showNotification("Please enter a valid 10-digit receiver phone number", "error");
        return;
      }
      if (!confirmOrderForm.deliveryDate || !confirmOrderForm.dispatchDate) {
        showNotification("Please fill Delivery and Dispatch dates", "error");
        return;
      }
    }

    const loadingToast = toast.loading(isDispatch ? "Dispatching order..." : "Confirming order...");

    try {
      const payload = {
        dispatchDirectly: isDispatch,
        totalAmount: Number(confirmOrderForm.totalAmount || 0),
        subtotalAmount: Number(confirmOrderForm.subtotalAmount || 0),
        taxRate: Number(confirmOrderForm.taxRate || 0),
        shippingCharges: Number(confirmOrderForm.shippingCharges || 0),
        otherCharges: Number(confirmOrderForm.otherCharges || 0),
        paidAmount: Number(confirmOrderForm.paidAmount || 0),
        paymentMode: confirmOrderForm.paymentMode,
        receiverName: confirmOrderForm.receiverName,
        receiverPhone: confirmOrderForm.receiverPhone,
        deliveryAddress: confirmOrderForm.deliveryAddress,
        deliveryDate: confirmOrderForm.deliveryDate || null,
        dispatchDate: confirmOrderForm.dispatchDate || null,
        deliveryMode: confirmOrderForm.deliveryMode,
        deliveryNotes: confirmOrderForm.deliveryNotes,
        productId: availabilityOrder.orderDetails?.productId || null,
        deductionMode: deductionMode,
        useAvailableStock: useAvailableStock,
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

      toast.success(isDispatch ? "Order dispatched successfully! ✓" : "Order confirmed and stock reserved! 🎉", { id: loadingToast });

      resetAvailabilityModal();

      queryClient.invalidateQueries({
        queryKey: ["getAllOrders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getOrderStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });

      await refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to confirm order",
        { id: loadingToast }
      );
    }
  };

  const handleUnconfirmExistingOrder = async () => {
    if (!availabilityOrder) return;

    const reason = prompt("Please enter the reason for unconfirming this order:");
    if (reason === null) return; // User cancelled the prompt

    const loadingToast = toast.loading("Reverting order confirmation...");
    try {
      await axiosInstance.patch(`/orders/${availabilityOrder.id}/unconfirm`, {
        reason: reason || "Unconfirmed by administrator",
      });

      toast.success("Order unconfirmed successfully! Stock has been returned to available.", { id: loadingToast });

      resetAvailabilityModal();

      queryClient.invalidateQueries({
        queryKey: ["getAllOrders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getOrderStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });

      await refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to unconfirm order", { id: loadingToast });
    }
  };

  const openBillModal = (order) => {
    setIsBillSaved(false);
    setLastReceipt(null);
    setBillOrder(order);

    const fetchLastReceipt = async () => {
      try {
        const ref = getOrderReference(order.id || order._id);
        const resp = await axiosInstance.get(`/receipts`, {
          params: { search: ref.replace("#", "") }
        });
        const list = resp?.data?.data?.receipts || [];
        if (list.length > 0) {
          setLastReceipt(list[0]);
        }
      } catch (err) {
        console.error("Failed to fetch last receipt", err);
      }
    };
    fetchLastReceipt();

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const billNum = `INV-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
    setBillNumber(billNum);
    setBillDate(now.toISOString().slice(0, 10));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    setBillDueDate(dueDate.toISOString().slice(0, 10));

    // Auto-populate GST rate: first from quotation, then from order items' product gstRate
    const items = order.orderDetailsList?.length > 0
      ? order.orderDetailsList
      : [order.orderDetails].filter(Boolean);
    // Look up product gstRate from productItems catalogue
    const getProductGstRate = (line) => {
      if (line?.gstRate != null) return Number(line.gstRate);
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
      return prod?.gstRate ?? 18;
    };
    const productGstRates = items.map(getProductGstRate);
    const dominantGstRate = productGstRates.length > 0 ? productGstRates[0] : 18;
    const savedTaxRate = order.quotation?.taxRate || order.taxRate || dominantGstRate;

    let orderTotalVal = order.totalAmount || order.quotation?.totalQuoted || 0;
    if (orderTotalVal === 0) {
      let computedTotal = 0;
      for (const line of items) {
        const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
        const price = prod?.unitPrice || prod?.sellingPrice || 5;
        computedTotal += Number(line?.quantity || 0) * price;
      }
      orderTotalVal = computedTotal;
    }
    const remainingTotal = Math.max(0, orderTotalVal - (order.paidAmount || 0));
    const approvedSubtotal = order.subtotalAmount || order.quotation?.subtotalAmount || orderTotalVal;
    const defaultSubtotal = orderTotalVal > 0 
      ? Number(((remainingTotal / orderTotalVal) * approvedSubtotal).toFixed(2))
      : 0;
    const defaultShipping = 0;
    const defaultOther = 0;

    setBillSubtotal(String(defaultSubtotal));
    setBillTaxRate(String(savedTaxRate));
    setBillShipping(String(defaultShipping));
    setBillOther(String(defaultOther));
    setBillDiscount("0");
    setBillNotes("Thank you for doing business with Nirmalyam Krafts!");
    setShowBillModal(true);
  };

  const getBillShareText = (order, meta, productItems) => {
    const subtotal = Number(meta.billSubtotal || order.subtotalAmount || order.totalAmount || 0);
    const discountVal = Number(meta.billDiscount || 0);
    const shippingVal = Number(meta.billShipping || 0);
    const otherVal = Number(meta.billOther || 0);
    const taxRate = Number(meta.billTaxRate || 0);
    const taxVal = (subtotal - discountVal) * (taxRate / 100);
    const grandTotal = subtotal - discountVal + taxVal + shippingVal + otherVal;
    const balance = Math.max(0, grandTotal - Number(order.paidAmount || 0));

    const productSummary = getWhatsAppProductSummary(order, productItems);

    return `*${COMPANY_NAME} — Invoice/Bill*

Invoice Number: ${meta.billNumber}
Invoice Date: ${meta.billDate}
Due Date: ${meta.billDueDate}

*Client Details:*
Customer: ${order.customerName}
Business: ${order.businessName || "—"}

*Products Details:*
${productSummary}

Grand Total: ₹${grandTotal.toFixed(2)}
Amount Paid: ₹${Number(order.paidAmount || 0).toFixed(2)}
*Balance Due: ₹${balance.toFixed(2)}*

Note: ${meta.billNotes || "—"}`;
  };

  const handleBillWhatsApp = () => {
    if (!billOrder) return;
    const meta = {
      billNumber,
      billDate,
      billDueDate,
      billDiscount,
      billShipping,
      billTaxRate,
      billNotes,
      billSubtotal,
      billOther
    };
    const text = getBillShareText(billOrder, meta, productItems);
    const encodedText = encodeURIComponent(text);
    const cleanPhone = String(billOrder.phone || "").replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  const handleBillEmail = () => {
    if (!billOrder) return;
    const meta = {
      billNumber,
      billDate,
      billDueDate,
      billDiscount,
      billShipping,
      billTaxRate,
      billNotes,
      billSubtotal,
      billOther
    };
    const text = getBillShareText(billOrder, meta, productItems);
    const subject = encodeURIComponent(`${COMPANY_NAME} — Invoice ${billNumber}`);
    const body = encodeURIComponent(text);
    window.open(`mailto:${billOrder.email || ""}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleSaveBill = async () => {
    if (!billOrder) return;
    const toastId = toast.loading("Saving bill/invoice...");
    try {
      const itemBreakdown = getQuotationItemsBreakdown(billOrder, null, Number(billSubtotal || 0), productItems);
      const perProductGst = itemBreakdown.reduce((s, r) => s + r.gstAmount, 0);
      const computedGrandTotal = Number((Number(billSubtotal || 0) - Number(billDiscount || 0) + perProductGst + Number(billShipping || 0) + Number(billOther || 0)).toFixed(2));

      await axiosInstance.post("/receipts/bill", {
        orderId: billOrder.id || billOrder._id,
        billNumber,
        billDate,
        billDueDate,
        billTaxRate: Number(billTaxRate || 0),
        billShipping: Number(billShipping || 0),
        billDiscount: Number(billDiscount || 0),
        billNotes,
        billSubtotal: Number(billSubtotal || 0),
        billOther: Number(billOther || 0),
        billGrandTotal: computedGrandTotal,
        billItemGst: perProductGst,
        paymentMode: billPaymentMode,
      });
      setIsBillSaved(true);
      toast.success("Bill/Invoice saved successfully! You can now share or download.", { id: toastId });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save bill/invoice", { id: toastId });
    }
  };

  const generateInvoicePDF = (rc, mode = "download") => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const brand = [10, 92, 67]; // Emerald Green
    const gold = [212, 175, 55]; // Gold accent

    // Draw top layout headers
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 40, pageWidth, 2, "F");
    
    // Header company logo & details
    try {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 6, 28, 28);
      } else {
        doc.addImage("/Nirmalyam_Logo-removebg-preview.webp", "WEBP", 15, 6, 28, 28);
      }
    } catch (e) {
      console.warn("Failed to load logo in PDF:", e);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(COMPANY_NAME, 46, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text("Email: nirmalyamkrafts@gmail.com | Mob: +91 90490 01299", 46, 27);
    
    // Title "INVOICE" on the right side of header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - 15, 20, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text(`Invoice No: ${rc.receiptNumber}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date: ${rc.paidAt ? new Date(rc.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}`, pageWidth - 15, 33, { align: "right" });
    
    // Client & Invoice details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${rc.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${rc.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${rc.phone || "—"}`, 15, 68);
    doc.text(`Email: ${rc.email || "—"}`, 15, 73);
    
    doc.setFont("helvetica", "bold");
    doc.text("DELIVERY DETAILS:", 110, 52);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(rc.deliveryAddress || "Pickup / Standard Delivery", 85);
    doc.text(addressLines, 110, 58);
    
    // Invoice Meta Table or Section
    const termsY = 85;
    doc.setFillColor(245, 247, 246);
    doc.rect(15, termsY, pageWidth - 30, 10, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Due Date: ${rc.billDetails?.dueDate ? new Date(rc.billDetails.dueDate).toLocaleDateString() : "—"}`, 20, termsY + 6.5);
    doc.text(`Payment Mode: ${String(rc.paymentMode || "invoice").toUpperCase()}  |  Payment Status: ${rc.isPaidInFull ? "PAID IN FULL" : "PARTIAL PAID"}`, 95, termsY + 6.5);
    
    // Item Table
    const billDetails = rc.billDetails || {};
    const subtotal = Number(billDetails.subtotal || rc.amount || 0);
    const discountVal = Number(billDetails.discount || 0);
    const shippingVal = Number(billDetails.shipping || 0);
    const otherVal = Number(billDetails.other || 0);
    const taxRate = Number(billDetails.taxRate || 0);
    
    const lines = rc.orderDetailsList || [];
    const totalQty = lines.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    // Per-line GST breakdown accumulator by rate
    const gstByRate = {}; // { "18": { taxableAmount, taxAmount }, "12": { ... } }

    const tableBody = lines.map((line, index) => {
      const specDetails = getPDFSpecDetails(line, rc.productCategory, productItems);
      const lineQty = Number(line.quantity || 0);
      const lineSubtotal = getLineSubtotalShare(line, subtotal, lines, productItems);
      const lineFraction = subtotal > 0 ? (lineSubtotal / subtotal) : (1 / (lines.length || 1));
      const rate = lineQty > 0 ? (lineSubtotal / lineQty) : lineSubtotal;

      // Resolve HSN and GST: check line data first, then look up product catalogue
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line.productId || "").trim());
      const taxInfo = getProductTaxInfo(prod || line);
      const lineHsn = line.hsnCode || taxInfo.hsnCode;
      const lineGstRate = line.gstRate != null ? Number(line.gstRate) : taxInfo.gstRate;

      // Accumulate GST by rate
      const rateKey = String(lineGstRate);
      const taxableBase = lineSubtotal - (discountVal * lineFraction);
      const lineTax = taxableBase * (lineGstRate / 100);
      if (!gstByRate[rateKey]) gstByRate[rateKey] = { taxableAmount: 0, taxAmount: 0 };
      gstByRate[rateKey].taxableAmount += taxableBase;
      gstByRate[rateKey].taxAmount += lineTax;

      return [
        specDetails,
        lineHsn,
        `${lineGstRate}%`,
        `Rs. ${lineTax.toFixed(2)}`,
        `${line.quantity || 0} ${line.unit || "pcs"}`,
        `Rs. ${rate.toFixed(2)}`,
        `Rs. ${lineSubtotal.toFixed(2)}`
      ];
    });
    
    autoTable(doc, {
      startY: termsY + 16,
      head: [["Item Description & Specifications", "HSN Code", "GST %", "GST Amt", "Quantity", "Rate", "Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3.5, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 14 },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "center", cellWidth: 18 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 24 }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    
    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 90;
    
    let currentY = finalY;
    doc.text("Subtotal:", labelX, currentY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    if (discountVal > 0) {
      currentY += 6;
      doc.text("Discount:", labelX, currentY);
      doc.text(`- Rs. ${discountVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    // GST Breakdown by rate
    const gstRateKeys = Object.keys(gstByRate).sort((a, b) => Number(a) - Number(b));
    let totalGstCollected = 0;
    
    if (gstRateKeys.length > 0) {
      for (const rk of gstRateKeys) {
        totalGstCollected += gstByRate[rk].taxAmount;
      }
    }
    
    const grandTotal = subtotal - discountVal + totalGstCollected + shippingVal + otherVal;

    if (gstRateKeys.length > 1) {
      // Multiple GST rates — show per-rate breakdown
      for (const rk of gstRateKeys) {
        const { taxAmount: ta } = gstByRate[rk];
        currentY += 6;
        doc.setFontSize(9);
        doc.text(`GST @ ${rk}%:`, labelX, currentY);
        doc.text(`Rs. ${ta.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      }
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`Total GST Collected:`, labelX, currentY);
      doc.text(`Rs. ${totalGstCollected.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
    } else if (gstRateKeys.length === 1) {
      const rk = gstRateKeys[0];
      const { taxAmount: ta } = gstByRate[rk];
      if (ta > 0) {
        currentY += 6;
        doc.text(`Tax/GST (${rk}%):`, labelX, currentY);
        doc.text(`Rs. ${ta.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      }
    } else if (taxRate > 0) {
      // Fallback
      const fallbackTax = (subtotal - discountVal) * (taxRate / 100);
      currentY += 6;
      doc.text(`Tax/GST (${taxRate}%):`, labelX, currentY);
      doc.text(`Rs. ${fallbackTax.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    if (shippingVal > 0) {
      currentY += 6;
      doc.text("Shipping Charges:", labelX, currentY);
      doc.text(`Rs. ${shippingVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    if (otherVal > 0) {
      currentY += 6;
      doc.text("Other Charges:", labelX, currentY);
      doc.text(`Rs. ${otherVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text("Grand Total:", labelX, currentY);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Amount Paid So Far:", labelX, currentY);
    doc.text(`Rs. ${Number(rc.paidSoFar || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    currentY += 7;
    doc.setFillColor(254, 242, 242);
    doc.rect(labelX - 4, currentY - 5, 83, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28);
    const balanceDue = Math.max(0, grandTotal - Number(rc.paidSoFar || 0));
    doc.text("Balance Due:", labelX, currentY);
    doc.text(`Rs. ${balanceDue.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    // Print remaining approved balance to be invoiced (for partial invoicing/slabs)
    const approvedTotal = Number(rc.totalOrderAmount || 0);
    const remainingToInvoiceVal = Math.max(0, approvedTotal - grandTotal);
    if (remainingToInvoiceVal > 0.01) {
      currentY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 110, 30);
      doc.text("Remaining Order Bal. to Invoice:", labelX, currentY);
      doc.text(`Rs. ${remainingToInvoiceVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    // Notes & Payment instructions on bottom left (below totals to prevent collision)
    const notesY = currentY + 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Notes:", 15, notesY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const noteTextLines = doc.splitTextToSize(billDetails.notes || "Please clear payment within due date.", 90);
    doc.text(noteTextLines, 15, notesY + 5);

    // Terms & Conditions (loaded from localStorage or default)
    const tcString = localStorage.getItem("nirmalyam_invoice_terms") || 
      "1. Payment is strict Net due upon receipt.\n2. Interest of 18% p.a. will be charged on late payments.\n3. Subject to local jurisdiction.";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Terms & Conditions:", 15, notesY + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const tcLines = doc.splitTextToSize(tcString, 90);
    doc.text(tcLines, 15, notesY + 23);

    // Bank Account / Payment details (drawn if showPaymentInfo toggle is true)
    const isPaymentInfoEnabled = localStorage.getItem("nirmalyam_show_payment_info") === "true";
    if (isPaymentInfoEnabled) {
      const bHolder = localStorage.getItem("nirmalyam_bank_holder") || "Nirmalyam Krafts";
      const bName   = localStorage.getItem("nirmalyam_bank_name")   || "State Bank of India";
      const bAcc    = localStorage.getItem("nirmalyam_bank_account")|| "39824872901";
      const bIfsc   = localStorage.getItem("nirmalyam_bank_ifsc")   || "SBIN0001299";
      const bUpi    = localStorage.getItem("nirmalyam_bank_upi")    || "nirmalyam@sbi";

      const bankY = notesY;
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Bank Details for Payment:", 115, bankY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Account Name: ${bHolder}`, 115, bankY + 5);
      doc.text(`Bank Name: ${bName}`, 115, bankY + 10);
      doc.text(`A/C Number: ${bAcc}`, 115, bankY + 15);
      doc.text(`IFSC Code: ${bIfsc}`, 115, bankY + 20);
      doc.text(`UPI ID: ${bUpi}`, 115, bankY + 25);
    }
    
    // Footer
    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Thank you for doing business with Nirmalyam Krafts! This is a system-generated invoice.",
      pageWidth / 2,
      footY,
      { align: "center" }
    );
    
    if (mode === "view") {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } else {
      doc.save(`Nirmalyam_Invoice_${rc.receiptNumber}.pdf`);
    }
  };

  const downloadReceiptPDF = (rc, mode = "download") => {
    if (rc.type === "bill") {
      generateInvoicePDF(rc, mode);
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const brand = [10, 92, 67]; // Emerald Green
    const gold = [212, 175, 55]; // Gold accent

    // Draw header band
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 40, pageWidth, 2, "F");

    // Logo
    try {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 6, 28, 28);
      } else {
        doc.addImage("/Nirmalyam_Logo-removebg-preview.webp", "WEBP", 15, 6, 28, 28);
      }
    } catch (e) {
      console.warn("Logo load failed:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(COMPANY_NAME, 46, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text("Email: nirmalyamkrafts@gmail.com | Mob: +91 90490 01299", 46, 27);

    // Title on right side
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYMENT RECEIPT", pageWidth - 15, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text(`Receipt No: ${rc.receiptNumber}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date & Time: ${new Date(rc.paidAt).toLocaleString()}`, pageWidth - 15, 33, { align: "right" });

    // Client details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIVED FROM:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${rc.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${rc.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${rc.phone || "—"}`, 15, 68);
    doc.text(`Email: ${rc.email || "—"}`, 15, 73);

    // Payment details
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT DETAILS:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Reference: ${rc.orderRef || "—"}`, 110, 58);
    doc.text(`Quotation Number: ${rc.quotationNumber || "—"}`, 110, 63);
    doc.text(`Payment Mode: ${String(rc.paymentMode || "cash").toUpperCase()}`, 110, 68);
    doc.text(`Payment Status: ${rc.isPaidInFull ? "Paid in Full" : "Partial Payment"}`, 110, 73);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Build Table Body (multi-product compatible)
    const lines = rc.orderDetailsList || [];
    const tableBody = lines.map((line, index) => {
      const specDetails = getPDFSpecDetails(line, rc.productCategory, productItems);

      return [
        specDetails,
        `${line.quantity || 0} ${line.unit || "pcs"}`,
        `Rs. ${Number(rc.amount || 0).toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 84,
      head: [["Order Item Details & Specifications", "Quantity Ordered", "Transaction Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 9.5, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 40 },
        2: { halign: "right", cellWidth: 45 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 70;

    let currentY = finalY;
    doc.text("Total Order Value:", labelX, currentY);
    doc.text(`Rs. ${Number(rc.totalOrderAmount || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text("This Payment Amount:", labelX, currentY);
    doc.text(`Rs. ${Number(rc.amount || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Cumulative Paid So Far:", labelX, currentY);
    doc.text(`Rs. ${Number(rc.paidSoFar || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (rc.isPaidInFull) {
      doc.setTextColor(brand[0], brand[1], brand[2]);
      doc.text("Balance Remaining:", labelX, currentY);
      doc.text("Rs. 0.00 (Fully Paid)", rightAlignX, currentY, { align: "right" });
    } else {
      doc.setTextColor(190, 30, 30); // Red
      doc.text("Balance Remaining:", labelX, currentY);
      doc.text(`Rs. ${Number(rc.remainingAmount || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    // Receipt note block on bottom left (below totals to prevent collision)
    const tcY = currentY + 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Notes / Reference:", 15, tcY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(rc.note || "No custom payment remarks.", 15, tcY + 6);

    if (mode === "view") {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } else {
      doc.save(`Nirmalyam_Receipt_${rc.receiptNumber}.pdf`);
    }
  };

  const generateBillPDF = (order, meta) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const brand = [10, 92, 67]; // Emerald Green
    const gold = [212, 175, 55]; // Gold accent

    // Draw top layout headers
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 40, pageWidth, 2, "F");
    
    // Header company logo & details
    try {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 6, 28, 28);
      } else {
        doc.addImage("/Nirmalyam_Logo-removebg-preview.webp", "WEBP", 15, 6, 28, 28);
      }
    } catch (e) {
      console.warn("Failed to load logo in PDF:", e);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(COMPANY_NAME, 46, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text("Email: nirmalyamkrafts@gmail.com | Mob: +91 90490 01299", 46, 27);
    
    // Title "INVOICE" on the right side of header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - 15, 20, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text(`Invoice No: ${meta.billNumber}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date: ${meta.billDate}`, pageWidth - 15, 33, { align: "right" });
    
    // Client & Invoice details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${order.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${order.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${order.phone || "—"}`, 15, 68);
    doc.text(`Email: ${order.email || "—"}`, 15, 73);
    
    doc.setFont("helvetica", "bold");
    doc.text("DELIVERY ADDRESS:", 110, 52);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(order.delivery?.deliveryAddress || "Pickup / Standard Delivery", 85);
    doc.text(addressLines, 110, 58);
    
    // Invoice Meta Table or Section
    const termsY = 85;
    doc.setFillColor(245, 247, 246);
    doc.rect(15, termsY, pageWidth - 30, 10, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Due Date: ${meta.billDueDate}`, 20, termsY + 6.5);
    doc.text(`Payment Mode: ${String(billPaymentMode || "invoice").toUpperCase()}  |  Payment Status: ${(order.paymentStatus || "Unpaid").toUpperCase()}`, 95, termsY + 6.5);
    
    // Item Table
    const qty = Number(order.orderDetails?.quantity || 1);
    const subtotal = Number(meta.billSubtotal || order.subtotalAmount || order.totalAmount || 0);
    const discountVal = Number(meta.billDiscount || 0);
    const shippingVal = Number(meta.billShipping || 0);
    const otherVal = Number(meta.billOther || 0);
    const taxRate = Number(meta.billTaxRate || 0);
    
    const taxVal = (subtotal - discountVal) * (taxRate / 100);
    const grandTotal = subtotal - discountVal + taxVal + shippingVal + otherVal;
    const rate = qty > 0 ? (subtotal / qty) : subtotal;
    
    const specDetails = getPDFSpecDetails(order.orderDetails || {}, order.productCategory, productItems);

    const tableBody = [
      [
        specDetails,
        `${qty} ${order.orderDetails?.unit || "pcs"}`,
        `Rs. ${rate.toFixed(2)}`,
        `Rs. ${subtotal.toFixed(2)}`
      ]
    ];
    
    autoTable(doc, {
      startY: termsY + 16,
      head: [["Item Description & Specifications", "Quantity", "Rate", "Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 9.5, cellPadding: 4, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        1: { halign: "center", cellWidth: 30 },
        2: { halign: "right", cellWidth: 30 },
        3: { halign: "right", cellWidth: 35 }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    
    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 90;
    
    let currentY = finalY;
    doc.text("Subtotal:", labelX, currentY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    if (discountVal > 0) {
      currentY += 6;
      doc.text("Discount:", labelX, currentY);
      doc.text(`- Rs. ${discountVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    if (taxVal > 0) {
      currentY += 6;
      doc.text(`Tax/GST (${taxRate}%):`, labelX, currentY);
      doc.text(`Rs. ${taxVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    if (shippingVal > 0) {
      currentY += 6;
      doc.text("Shipping Charges:", labelX, currentY);
      doc.text(`Rs. ${shippingVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    if (otherVal > 0) {
      currentY += 6;
      doc.text("Other Charges:", labelX, currentY);
      doc.text(`Rs. ${otherVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text("Grand Total:", labelX, currentY);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Amount Paid:", labelX, currentY);
    doc.text(`Rs. ${Number(order.paidAmount || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    
    currentY += 7;
    doc.setFillColor(254, 242, 242);
    doc.rect(labelX - 4, currentY - 5, 83, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28);
    const balanceDue = Math.max(0, grandTotal - Number(order.paidAmount || 0));
    doc.text("Balance Due:", labelX, currentY);
    doc.text(`Rs. ${balanceDue.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    // Print remaining approved balance to be invoiced (for partial invoicing/slabs)
    const approvedTotal = Number(order.totalAmount || order.quotation?.totalQuoted || 0);
    const remainingToInvoiceVal = Math.max(0, approvedTotal - grandTotal);
    if (remainingToInvoiceVal > 0.01) {
      currentY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 110, 30);
      doc.text("Remaining Order Bal. to Invoice:", labelX, currentY);
      doc.text(`Rs. ${remainingToInvoiceVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }
    
    // Notes & Payment instructions on bottom left (below totals to prevent collision)
    const notesY = currentY + 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Notes & Payment Instructions:", 15, notesY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const noteTextLines = doc.splitTextToSize(meta.billNotes || "Please clear payment within due date.", 100);
    doc.text(noteTextLines, 15, notesY + 5);
    
    // Bank Transfer Details block removed
    
    // Footer
    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Thank you for doing business with Nirmalyam Krafts! This is a system-generated invoice.",
      pageWidth / 2,
      footY,
      { align: "center" }
    );
    
    doc.save(`${COMPANY_NAME.replace(/\s+/g, "_")}_Invoice_${meta.billNumber}.pdf`);
  };

  const getWhatsAppProductSummary = (order, productItems) => {
    const list = order.orderDetailsList && order.orderDetailsList.length > 0
      ? order.orderDetailsList
      : order.orderDetails ? [order.orderDetails] : [];

    if (list.length === 0) return "*No products listed*";

    return list.map((item, idx) => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
      const realProductName = item.productName || prod?.name || order.productCategory || "Product";
      const isRoll = String(realProductName).toLowerCase().includes("roll");
      
      let specStr = "";
      if (isRoll) {
        const wVal = item.dimensions?.width ?? item.width ?? prod?.dimensions?.width ?? "—";
        const uVal = item.dimensions?.unit ?? item.dimensionUnit ?? prod?.dimensions?.unit ?? "inch";
        const gVal = item.gsm ?? prod?.gsm ?? "—";
        specStr = `GSM: ${gVal} · Width: ${wVal} ${uVal}`;
      } else {
        const sizeStr = item.bagSize || prod?.bagSize || "—";
        const len = item.dimensions?.length ?? item.length ?? prod?.dimensions?.length ?? 0;
        const wid = item.dimensions?.width ?? item.width ?? prod?.dimensions?.width ?? 0;
        const hei = item.dimensions?.height ?? item.height ?? prod?.dimensions?.height ?? 0;
        const unit = item.dimensions?.unit ?? item.dimensionUnit ?? prod?.dimensions?.unit ?? "inch";
        const dimStr = (len || wid) ? `${len} × ${wid} × ${hei} ${unit}` : "—";
        specStr = `Size: ${sizeStr} · Dim: ${dimStr}`;
      }

      const colorVal = item.color || prod?.color || "";
      const colorStr = colorVal ? ` · Color: ${colorVal}` : "";
      return `  *Product #${idx + 1}:* ${realProductName}${colorStr} · ${item.quantity || 0} ${item.unit || "pcs"} [${specStr}]`;
    }).join("\n");
  };

  const getReportProductsRows = (order, productItems) => {
    const list = order.orderDetailsList && order.orderDetailsList.length > 0
      ? order.orderDetailsList
      : order.orderDetails ? [order.orderDetails] : [];

    if (list.length === 0) {
      return [["Products", "No products listed"]];
    }

    const rows = [];
    list.forEach((item, idx) => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
      const realProductName = item.productName || prod?.name || order.productCategory || "Product";
      const isRoll = String(realProductName).toLowerCase().includes("roll");
      
      let specStr = "";
      if (isRoll) {
        const wVal = item.dimensions?.width ?? item.width ?? prod?.dimensions?.width ?? "—";
        const uVal = item.dimensions?.unit ?? item.dimensionUnit ?? prod?.dimensions?.unit ?? "inch";
        const gVal = item.gsm ?? prod?.gsm ?? "—";
        specStr = `GSM: ${gVal} · Width: ${wVal} ${uVal}`;
      } else {
        const sizeStr = item.bagSize || prod?.bagSize || "—";
        const len = item.dimensions?.length ?? item.length ?? prod?.dimensions?.length ?? 0;
        const wid = item.dimensions?.width ?? item.width ?? prod?.dimensions?.width ?? 0;
        const hei = item.dimensions?.height ?? item.height ?? prod?.dimensions?.height ?? 0;
        const unit = item.dimensions?.unit ?? item.dimensionUnit ?? prod?.dimensions?.unit ?? "inch";
        const dimStr = (len || wid) ? `${len} × ${wid} × ${hei} ${unit}` : "—";
        specStr = `Size: ${sizeStr} · Dim: ${dimStr}`;
      }

      const colorVal = item.color || prod?.color || "";
      const colorStr = colorVal ? ` (${colorVal})` : "";
      rows.push([
        `Product #${idx + 1}`,
        `${realProductName}${colorStr} · ${item.quantity || 0} ${item.unit || "pcs"} [${specStr}]`
      ]);
    });
    return rows;
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

  const generateReturnReceiptPDF = (order, returnDetails, mode = "download") => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const redTheme = [185, 28, 28]; // Rose red
    const gold = [212, 175, 55]; // Gold accent

    // Draw header band
    doc.setFillColor(redTheme[0], redTheme[1], redTheme[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 40, pageWidth, 2, "F");

    // Logo
    try {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 6, 28, 28);
      } else {
        doc.addImage("/Nirmalyam_Logo-removebg-preview.webp", "WEBP", 15, 6, 28, 28);
      }
    } catch (e) {
      console.warn("Logo load failed:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(COMPANY_NAME, 46, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(250, 230, 230);
    doc.text("Email: nirmalyamkrafts@gmail.com | Mob: +91 90490 01299", 46, 27);

    // Title on right side
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("RETURN RECEIPT", pageWidth - 15, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(250, 230, 230);
    doc.text(`Return Ref: ${returnDetails.returnNumber}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date & Time: ${new Date(returnDetails.returnedAt || Date.now()).toLocaleString("en-IN")}`, pageWidth - 15, 33, { align: "right" });

    // Client details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RETURNED BY:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${order.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${order.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${order.phone || "—"}`, 15, 68);
    doc.text(`Email: ${order.email || "—"}`, 15, 73);

    // Return details
    doc.setFont("helvetica", "bold");
    doc.text("RETURN DETAILS:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Original Order Ref: ${order.reference || (order.id || order._id || "").toString().slice(-6).toUpperCase()}`, 110, 58);
    doc.text(`Return Type: ${String(returnDetails.notes ? "Partial / Special" : "Standard").toUpperCase()}`, 110, 63);
    doc.text(`GST Status: Refund Configured`, 110, 68);
    doc.text(`Refund Status: Stock Restored`, 110, 73);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Solve exact per-line GST-inclusive allocation using the same linear system as the UI
    const orderSubtotal = Number(order.subtotalAmount || 0);
    const orderTotalPaid = Number(order.totalPaidAmount || order.totalInvoiceAmount || order.totalAmount || 0);

    // Enrich items with selling-price weight and GST rate
    const enrichedItems = returnDetails.items.map(it => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(it.productId || "").trim());
      const taxInfo = getProductTaxInfo(prod || it);
      const hsnCode = it.hsnCode || taxInfo.hsnCode;
      const gstRateVal = it.gstRate != null ? Number(it.gstRate) : taxInfo.gstRate;
      const sellPrice = Number(prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || it.unitPrice || 0) || 1;
      const weight = Number(it.quantity || 0) * sellPrice;
      return { ...it, hsnCode, gstRateVal, weight };
    });

    // Group items by GST rate to solve the linear system
    const rateGroups = {};
    enrichedItems.forEach(d => {
      if (!rateGroups[d.gstRateVal]) rateGroups[d.gstRateVal] = { totalWeight: 0, members: [] };
      rateGroups[d.gstRateVal].totalWeight += d.weight;
      rateGroups[d.gstRateVal].members.push(d);
    });
    const rates = Object.keys(rateGroups).map(Number);

    let groupSubtotals = {};
    if (rates.length === 1) {
      groupSubtotals[rates[0]] = orderSubtotal;
    } else if (rates.length === 2) {
      const [r1, r2] = rates;
      const denom = (r1 - r2) / 100;
      if (Math.abs(denom) < 1e-9) {
        groupSubtotals[r1] = orderSubtotal; groupSubtotals[r2] = 0;
      } else {
        const S1 = (orderTotalPaid - orderSubtotal * (1 + r2 / 100)) / denom;
        groupSubtotals[r1] = Math.max(0, S1);
        groupSubtotals[r2] = Math.max(0, orderSubtotal - S1);
      }
    } else {
      const totalW = enrichedItems.reduce((s, d) => s + d.weight, 0) || 1;
      rates.forEach(r => { groupSubtotals[r] = orderSubtotal * (rateGroups[r].totalWeight / totalW); });
    }

    // Per-item allocation
    const itemAllocations = {};
    enrichedItems.forEach(d => {
      const grp = rateGroups[d.gstRateVal];
      const groupSubtotal = groupSubtotals[d.gstRateVal] || 0;
      // Find the corresponding order line to get its original quantity
      const orderLines = (order.orderDetailsList?.length ? order.orderDetailsList : order.orderDetails ? [order.orderDetails] : []);
      const orderLine = orderLines.find(l => String(l.productId?._id || l.productId || "").trim() === String(d.productId || "").trim());
      const orderQty = Number(orderLine?.quantity || 0) || Number(d.quantity || 0);
      const withinFrac = grp.totalWeight > 0 ? (d.weight / grp.totalWeight) : (1 / grp.members.length);
      const lineSubtotal = groupSubtotal * withinFrac;           // pre-tax share for this product
      const lineGstInclPerUnit = orderQty > 0 ? (lineSubtotal * (1 + d.gstRateVal / 100)) / orderQty : 0;
      const retQty = Number(d.quantity || 0);
      const lineGstIncl = retQty * lineGstInclPerUnit;           // GST-inclusive amount for returned qty
      const lineGstPortion = lineGstIncl * (d.gstRateVal / (100 + d.gstRateVal)); // GST extracted
      itemAllocations[String(d.productId)] = { lineGstIncl, lineGstPortion };
    });

    const tableBody = enrichedItems.map((it, index) => {
      const alloc = itemAllocations[String(it.productId)] || {};
      return [
        `Item ${index + 1}: ${it.productName || "Product"}`,
        it.hsnCode,
        `${it.gstRateVal}%`,
        `Rs. ${(alloc.lineGstPortion || 0).toFixed(2)}`,
        `${it.quantity || 0} ${it.unit || "pcs"}`,
        `Returned`
      ];
    });

    autoTable(doc, {
      startY: 84,
      head: [["Returned Item Details", "HSN Code", "GST %", "GST Refund", "Qty Returned", "Status"]],
      body: tableBody.length > 0 ? tableBody : [["No items listed", "—", "—", "—", "0", "—"]],
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3.5, valign: "middle" },
      headStyles: { fillColor: redTheme, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 14 },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "center", cellWidth: 22 },
        5: { halign: "center", cellWidth: 24 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 90;

    let currentY = finalY;
    const baseRefund = Number(returnDetails.refundAmount || 0);
    const gstRefund  = Number(returnDetails.gstRefundAmount || 0);
    const totalRefunded = Number((baseRefund + gstRefund).toFixed(2));

    doc.text("Base Refund Amount:", labelX, currentY);
    doc.text(`Rs. ${baseRefund.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    currentY += 6;
    doc.text(`GST Refund:`, labelX, currentY);
    doc.text(`Rs. ${gstRefund.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(redTheme[0], redTheme[1], redTheme[2]);
    doc.text("Total Amount Refunded:", labelX, currentY);
    doc.text(`Rs. ${totalRefunded.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    // Note block
    const tcY = Math.max(currentY + 12, doc.lastAutoTable.finalY + 15);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Return Notes / Remarks:", 15, tcY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(returnDetails.notes || "No custom return remarks added.", 15, tcY + 6);

    // Footer
    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("This return receipt is automatically generated and certified in the financial inventory ledger. Nirmalyam Krafts.", 15, footY);

    if (mode === "view") {
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`Return_Receipt_${returnDetails.returnNumber}.pdf`);
    }
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
      head: [["Product Item", "Specifications / Details"]],
      body: getReportProductsRows(order, productItems),
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
        ["Partial Paid Amount", Number(report.partialPaidAmount || 0).toFixed(2)],
        ["Full Paid Amount", Number(report.fullPaidAmount || 0).toFixed(2)],
        ["Confirmed Paid Amount", Number(report.confirmedPaidAmount || 0).toFixed(2)],
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
    const productSummary = getWhatsAppProductSummary(order, productItems);

    const shareText = `
Nirmalyam Krafts - Order Report

Customer: ${report.customerName}
Business: ${report.businessName}
Phone: ${report.phone}

Products Details:
${productSummary}

Order Status: ${report.orderStatus}
Payment Status: ${report.paymentStatus}
Delivery Address: ${report.deliveryAddress}
Delivery Mode: ${report.deliveryMode}
Delivery Date: ${report.deliveryDate}
Dispatch Date: ${report.dispatchDate}
Notes: ${report.notes}
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
    const productSummary = getWhatsAppProductSummary(order, productItems);

    const message = `
*Nirmalyam Krafts - Order Report*

*Customer:* ${report.customerName}
*Business:* ${report.businessName}
*Phone:* ${report.phone}

*Products Details:*
${productSummary}

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

  const handleExportOrders = (format) => {
    if (!formattedOrders.length) {
      showNotification("No orders available to export", "error");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Business Name",
      "Phone",
      "Product Category",
      "Order Status",
      "Payment Status",
      "Grand Total (₹)",
      "Paid Amount (₹)",
      "Due Amount (₹)",
      "Created At",
    ];

    const rows = formattedOrders.map((o) => [
      o.reference || "",
      o.customerName || "",
      o.businessName || "",
      o.phone || "",
      o.productCategory || "",
      o.orderStatus || "",
      o.paymentStatus || "",
      o.amount || 0,
      o.paidAmount || 0,
      o.pendingAmount || 0,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "",
    ]);

    if (format === "csv") {
      const csvContent = [headers, ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`))].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("CSV exported successfully", "success");
    } else {
      exportToExcel(headers, rows, "orders");
      showNotification("Excel exported successfully", "success");
    }
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
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
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
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
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

  const handleMarkAsDelivered = async (order) => {
    setDeliveredActionId(order.id);
    const loadingToast = toast.loading("Marking as delivered...");
    try {
      const response = await axiosInstance.patch(`/orders/${order.id}/status`, {
        newStatus: "Delivered",
      });
      if (response.data.success) {
        toast.success("Order marked as delivered ✓", { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
        await refetch();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark as delivered", {
        id: loadingToast,
      });
    } finally {
      setDeliveredActionId(null);
    }
  };

  const handleRestoreState = async (orderId, snapshotId, restoreReason) => {
    const loadingToast = toast.loading("Restoring order state...");
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/restore`, {
        snapshotId,
        restoreReason,
      });
      if (response.data.success) {
        toast.success("Order state restored successfully ✓", { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        await refetch();
        setShowLogsModal(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to restore state", {
        id: loadingToast,
      });
    }
  };

  const handleCancelOrderSubmit = async () => {
    if (!cancelOrderTarget) return;
    if (!cancellationReasonInput.trim()) {
      toast.error("Please enter a reason for cancellation");
      return;
    }

    setCancelLoading(true);
    const loadingToast = toast.loading("Cancelling order...");
    try {
      const response = await axiosInstance.patch(`/orders/${cancelOrderTarget.id || cancelOrderTarget._id}/status`, {
        newStatus: "Cancelled",
        productId: cancelOrderTarget.orderDetails?.productId || null,
        deductionMode: deductionMode || "AUTO",
        cancellationReason: cancellationReasonInput,
        manualLoss: manualLossInput.trim() !== "" ? Number(manualLossInput) : undefined,
      });

      if (response.data.success) {
        toast.success("Order cancelled safely", { id: loadingToast });
        setShowCancelModal(false);
        setCancelOrderTarget(null);
        setCancellationReasonInput("");
        setManualLossInput("");
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
        queryClient.invalidateQueries({ queryKey: ["getInventoryData"] });
        setShowDetailPanel(false);
        await refetch();
      } else {
        toast.error(response.data?.message || "Cancellation failed", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to cancel order", { id: loadingToast });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    setPaymentLoading(true);
    const loadingToast = toast.loading("Recording payment...");
    try {
      const response = await axiosInstance.post(`/orders/${selectedOrder.id}/payment`, {
        amount,
        paymentMode: paymentForm.paymentMode,
        note: paymentForm.note.trim() || undefined,
      });
      if (response.data.success) {
        const rcNum = response.data.data.receipt?.receiptNumber || "";
        toast.success(`₹${amount} recorded successfully! Receipt: ${rcNum}`, { id: loadingToast });
        setShowPaymentModal(false);
        setPaymentForm({ amount: "", paymentMode: "cash", note: "" });
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
        refetch();
      } else {
        toast.error(response.data?.message || "Payment failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to record payment", { id: loadingToast });
    } finally {
      setPaymentLoading(false);
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
    const orderSize = normalizeText(order?.orderDetails?.bagSize);

    const candidates = inventoryItems.filter((item) => {
      if (!isSameDimension(item, order)) return false;
      const itemSize = normalizeText(item?.bagSizeLabel || item?.bagSize);
      return itemSize === orderSize;
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
    let suggestedTotal = 0;
    if (pricing?.perProductResults && pricing.perProductResults.length > 0) {
      for (const pr of pricing.perProductResults) {
        const itemStockQty = Number(pr.canFulfillFromStock || 0);
        const itemQty = Number(pr.quantity || 1) || 1;
        const itemRequiredProd = Number(pr.requiredFromProduction || 0);
        const itemProdCost = (Number(pr.totalOrderMaterialCost || 0) / itemQty) * itemRequiredProd;

        const pObj = productItems.find(p => String(p?._id || p?.id || "").trim() === String(pr.productId || "").trim());
        const itemStockUnitPrice = pr.stockItem?.sellingPricePerUnit || pr.stockItem?.basePrice || pObj?.basePrice || 8;
        suggestedTotal += (itemStockQty * itemStockUnitPrice) + itemProdCost;
      }
      return suggestedTotal;
    }

    // Fallback single product calculation
    const stockCovered = Number(pricing?.canFulfillFromStock || 0);
    const stockUnitPrice = Number(getStockUnitQuotePrice(pricing, order) || 0);
    const itemQty = Number(order?.orderDetails?.quantity || order?.quantity || 1) || 1;
    const itemRequiredProd = Number(pricing?.requiredFromProduction || 0);
    const prodCost = (Number(pricing?.totalOrderMaterialCost || 0) / itemQty) * itemRequiredProd;

    suggestedTotal = (stockCovered * stockUnitPrice) + prodCost;
    if (suggestedTotal > 0) return suggestedTotal;

    const lines = order?.orderDetailsList?.length > 0 ? order.orderDetailsList : [order?.orderDetails].filter(Boolean);
    if (lines.length > 0) {
      let computedTotal = 0;
      for (const line of lines) {
        const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === String(line.productId || "").trim());
        const price = prod?.basePrice || prod?.unitPrice || prod?.sellingPrice || 5;
        computedTotal += Number(line.quantity || 0) * price;
      }
      if (computedTotal > 0) return computedTotal;
    }

    return Number(order?.totalAmount || 0);
  };

  const recalculateQuotationTotal = (subtotal, tax, shipping, other) => {
    const s = Number(subtotal || 0);
    const sh = Number(shipping || 0);
    const o = Number(other || 0);

    if (!quotationOrder) return;
    const breakdown = getQuotationItemsBreakdown(quotationOrder, quotationPricing, s, productItems);
    const totalGst = breakdown.reduce((sum, item) => sum + item.gstAmount, 0);
    const total = s + totalGst + sh + o;
    setQuotationTotalInput(total > 0 ? String(Number(total.toFixed(2))) : "0");
  };

  const handleSubtotalChange = (val) => {
    setQuotationSubtotalInput(val);
    recalculateQuotationTotal(val, quotationTaxRateInput, quotationShippingInput, quotationOtherInput);
  };
  const handleTaxChange = (val) => {
    setQuotationTaxRateInput(val);
    recalculateQuotationTotal(quotationSubtotalInput, val, quotationShippingInput, quotationOtherInput);
  };
  const handleShippingChange = (val) => {
    setQuotationShippingInput(val);
    recalculateQuotationTotal(quotationSubtotalInput, quotationTaxRateInput, val, quotationOtherInput);
  };
  const handleOtherChange = (val) => {
    setQuotationOtherInput(val);
    recalculateQuotationTotal(quotationSubtotalInput, quotationTaxRateInput, quotationShippingInput, val);
  };

  const openDeliveryModal = (order) => {
    setDeliveryTargetOrder(order);
    setDeliveryForm({
      receiverName: order.delivery?.receiverName || "",
      receiverPhone: order.delivery?.receiverPhone || "",
      deliveryMode: order.delivery?.deliveryMode || "courier",
      deliveryAddress: order.delivery?.deliveryAddress || "",
      deliveryDate: order.delivery?.deliveryDate ? new Date(order.delivery.deliveryDate).toISOString().slice(0, 10) : "",
      dispatchDate: order.delivery?.dispatchDate ? new Date(order.delivery.dispatchDate).toISOString().slice(0, 10) : "",
      deliveryNotes: order.delivery?.deliveryNotes || "",
    });
    setShowDeliveryModal(true);
  };

  const handleSaveDeliveryDetails = async (e) => {
    e.preventDefault();
    if (!deliveryTargetOrder) return;

    if (deliveryForm.receiverPhone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(deliveryForm.receiverPhone)) {
        showNotification("Please enter a valid 10-digit receiver phone number", "error");
        return;
      }
    }

    const loadingToast = toast.loading("Updating delivery details...");
    try {
      const resp = await axiosInstance.patch(
        `/orders/${deliveryTargetOrder.id || deliveryTargetOrder._id}/delivery`,
        deliveryForm
      );
      if (resp.data.success) {
        toast.success("Delivery details updated successfully! ✓", { id: loadingToast });
        setShowDeliveryModal(false);
        queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
        await refetch();
        if (selectedOrder && (selectedOrder.id === deliveryTargetOrder.id || selectedOrder._id === deliveryTargetOrder._id)) {
          setSelectedOrder(resp.data.data);
        }
      } else {
        toast.error(resp.data.message || "Failed to update delivery details", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error saving delivery details:", error);
      toast.error(error?.response?.data?.message || "Failed to update delivery details", { id: loadingToast });
    }
  };

  const openQuotationModal = (order) => {
    setQuotationOrder(order);
    setQuotationPricing(null);
    setQuotationTotalInput("");
    setQuotationTaxRateInput(String(order.quotation?.taxRate ?? "0"));
    setQuotationShippingInput(String(order.quotation?.shippingCharges ?? "0"));
    setQuotationOtherInput(String(order.quotation?.otherCharges ?? "0"));
    setQuotationSubtotalInput(String(order.quotation?.subtotalAmount ?? ""));
    // Default to AUTO so available finished stock is considered first.
    setQuotationMode("AUTO");
    const defaultUntil = new Date();
    defaultUntil.setDate(defaultUntil.getDate() + 7);
    setQuotationValidUntil(defaultUntil.toISOString().slice(0, 10));
    
    const shortId = String(order.id || order._id || "").slice(-6).toUpperCase();
    const defaultQn = `QT-${shortId}`;
    const existingQn = order.quotation?.quotationNumber || defaultQn;
    setQuotationNumberInput(existingQn);
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
        const existingSubtotal = quotationOrder.quotation?.subtotalAmount;
        const initialSubtotal = existingSubtotal > 0 ? existingSubtotal : (quotationOrder.quotation?.totalQuoted || suggested);
        setQuotationSubtotalInput(String(initialSubtotal > 0 ? initialSubtotal : ""));
        // Auto-populate GST from product if no existing rate on quotation
        const existingTaxRate = quotationOrder.quotation?.taxRate;
        const items = quotationOrder.orderDetailsList?.length > 0
          ? quotationOrder.orderDetailsList
          : (quotationOrder.orderDetails ? [quotationOrder.orderDetails] : []);
        const productGstRate = items.length > 0 ? Number(items[0].gstRate ?? 18) : 18;
        const taxRate = (existingTaxRate != null && existingTaxRate > 0)
          ? Number(existingTaxRate)
          : productGstRate;
        if (!existingTaxRate || existingTaxRate === 0) {
          setQuotationTaxRateInput(String(taxRate));
        }
        const shipping = Number(quotationOrder.quotation?.shippingCharges ?? 0);
        const other = Number(quotationOrder.quotation?.otherCharges ?? 0);
        const breakdown = getQuotationItemsBreakdown(quotationOrder, d, Number(initialSubtotal || 0), productItems);
        const totalGst = breakdown.reduce((sum, item) => sum + item.gstAmount, 0);
        const calcTotal = Number(initialSubtotal || 0) + totalGst + shipping + other;
        setQuotationTotalInput(String(calcTotal > 0 ? Number(calcTotal.toFixed(2)) : ""));
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

  const getPDFSpecDetails = (line, productCategory, productItems) => {
    const pObj = productItems?.find(p => String(p?._id || p?.id || p?.productId || "").trim() === String(line.productId || "").trim());
    const lineCategory = pObj?.name || pObj?.category || productCategory || "Product";
    const lineIsRoll = lineCategory.toLowerCase().includes("roll") || String(line.unit).toLowerCase() === "kg" || String(line.unit).toLowerCase() === "m";

    const dimsLabel = lineIsRoll
      ? `Width: ${line.dimensions?.width || 0} ${line.dimensions?.unit || "inch"}`
      : `${line.dimensions?.length || 0} × ${line.dimensions?.width || 0} × ${line.dimensions?.height || 0} ${line.dimensions?.unit || "inch"}`;

    const specParts = [];
    specParts.push(`Product: ${lineCategory}`);

    const sizeColorParts = [];
    if (line.bagSize && line.bagSize !== "—" && line.bagSize !== "None") {
      sizeColorParts.push(`Size: ${line.bagSize}`);
    }
    if (line.color && line.color !== "—" && line.color !== "None") {
      sizeColorParts.push(`Color: ${line.color}`);
    }
    if (sizeColorParts.length > 0) {
      specParts.push(sizeColorParts.join(" · "));
    }

    const rollParts = [];
    if (Number(line.gsm) > 0) {
      rollParts.push(`GSM: ${line.gsm}`);
    }
    if (Number(line.bf) > 0) {
      rollParts.push(`BF: ${line.bf}`);
    }
    if (rollParts.length > 0) {
      specParts.push(rollParts.join(" · "));
    }

    const printParts = [];
    if (line.customPrinting) {
      printParts.push(`Custom Printing: Yes`);
    }
    if (line.brandingText && line.brandingText !== "—" && line.brandingText !== "None") {
      printParts.push(`Branding: ${line.brandingText}`);
    }
    if (printParts.length > 0) {
      specParts.push(printParts.join(" · "));
    }

    specParts.push(`Dimensions: ${dimsLabel}`);
    return specParts.join("\n");
  };

  const generateQuotationPDF = (order, pricing, meta) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let qn = meta.quotationNumber || order?.quotation?.quotationNumber || "";
    const isTemp = !qn || /^QT-\d{10,}$/.test(qn) || /^[0-9a-fA-F]{24}$/.test(qn.replace("QT-", ""));
    if (isTemp) {
      qn = `QT-${(order.id || order._id || "").toString().slice(-6).toUpperCase()}`;
    }
    const subtotal = Number(meta.subtotalAmount || meta.totalQuoted || 0);
    const taxRate = Number(meta.taxRate || 0);
    const shippingVal = Number(meta.shippingCharges || 0);
    const otherVal = Number(meta.otherCharges || 0);

    const validUntil = meta.validUntil || "—";
    const brand = [10, 92, 67]; // Emerald Green
    const gold = [212, 175, 55]; // Gold accent

    // Draw header band
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 40, pageWidth, 2, "F");

    // Header company logo & details
    try {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 6, 28, 28);
      } else {
        doc.addImage("/Nirmalyam_Logo-removebg-preview.webp", "WEBP", 15, 6, 28, 28);
      }
    } catch (e) {
      console.warn("Failed to load logo in PDF:", e);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(COMPANY_NAME, 46, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text("Email: nirmalyamkrafts@gmail.com | Mob: +91 90490 01299", 46, 27);

    // Title "QUOTATION" on the right side of header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("QUOTATION", pageWidth - 15, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text(`Quote No: ${qn}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date: ${new Date().toISOString().slice(0, 10)}`, pageWidth - 15, 33, { align: "right" });

    // Client and Quotation details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTED TO:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${order.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${order.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${order.phone || "—"}`, 15, 68);
    doc.text(`Email: ${order.email || "—"}`, 15, 73);

    const statusLabel = order.quotation?.status 
      ? (order.quotation.status.charAt(0).toUpperCase() + order.quotation.status.slice(1)) 
      : "Pending Approval";

    // Quotation Summary Details
    doc.setFont("helvetica", "bold");
    doc.text("QUOTE SUMMARY:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Validity: Valid until ${validUntil}`, 110, 58);
    doc.text(`Status: ${statusLabel}`, 110, 63);
    doc.text(`Source: ${order.source || "Dashboard"}`, 110, 68);

    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Items table header
    const tableY = 84;

    // Multi-product compatibility: loop through orderDetailsList (fall back to orderDetails)
    const lines = order.orderDetailsList && order.orderDetailsList.length > 0
      ? order.orderDetailsList
      : [order.orderDetails].filter(Boolean);

    const totalQty = lines.reduce((acc, l) => acc + Number(l?.quantity || 0), 0) || 1;

    // Per-line GST breakdown accumulator by rate
    const gstByRate = {};

    const tableBody = lines.map((line, index) => {
      const lineQty = Number(line?.quantity || 0);
      const lineSubtotal = getLineSubtotalShare(line, subtotal, lines, productItems, pricing);
      const lineFraction = subtotal > 0 ? (lineSubtotal / subtotal) : (1 / lines.length);
      const lineUnitPrice = lineQty > 0 ? (lineSubtotal / lineQty) : lineSubtotal;

      // Resolve HSN and GST: check line data first, then look up product catalogue
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
      const lineHsn = line.hsnCode || prod?.hsnCode || "—";
      const lineGstRate = line.gstRate != null ? Number(line.gstRate) : (prod?.gstRate ?? taxRate ?? 18);

      // Accumulate GST by rate
      const rateKey = String(lineGstRate);
      const lineTax = lineSubtotal * (lineGstRate / 100);
      if (!gstByRate[rateKey]) gstByRate[rateKey] = { taxableAmount: 0, taxAmount: 0 };
      gstByRate[rateKey].taxableAmount += lineSubtotal;
      gstByRate[rateKey].taxAmount += lineTax;

      const specDetails = getPDFSpecDetails(line, order.productCategory, productItems);

      return [
        specDetails,
        lineHsn,
        `${lineGstRate}%`,
        `Rs. ${lineTax.toFixed(2)}`,
        `${lineQty} ${line.unit || "pcs"}`,
        `Rs. ${lineUnitPrice.toFixed(2)}`,
        `Rs. ${lineSubtotal.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: tableY,
      head: [["Item Details & Specifications", "HSN Code", "GST %", "GST Amt", "Quantity", "Unit Rate", "Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3.5, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 14 },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "center", cellWidth: 18 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 24 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // GST Breakdown by rate
    const gstRateKeys = Object.keys(gstByRate).sort((a, b) => Number(a) - Number(b));
    let totalGstCollected = 0;
    
    if (gstRateKeys.length > 0) {
      for (const rk of gstRateKeys) {
        totalGstCollected += gstByRate[rk].taxAmount;
      }
    }
    
    const grandTotal = subtotal + totalGstCollected + shippingVal + otherVal;

    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);

    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 90;

    let currentY = finalY;
    doc.text("Subtotal:", labelX, currentY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    if (gstRateKeys.length > 1) {
      for (const rk of gstRateKeys) {
        const { taxAmount: ta } = gstByRate[rk];
        currentY += 6;
        doc.setFontSize(9);
        doc.text(`GST @ ${rk}%:`, labelX, currentY);
        doc.text(`Rs. ${ta.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      }
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`Total GST Collected:`, labelX, currentY);
      doc.text(`Rs. ${totalGstCollected.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
    } else if (gstRateKeys.length === 1) {
      const rk = gstRateKeys[0];
      const { taxAmount: ta } = gstByRate[rk];
      if (ta > 0) {
        currentY += 6;
        doc.text(`Tax/GST (${rk}%):`, labelX, currentY);
        doc.text(`Rs. ${ta.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      }
    } else if (taxRate > 0) {
      // Fallback
      const fallbackTax = subtotal * (taxRate / 100);
      currentY += 6;
      doc.text(`Tax/GST (${taxRate}%):`, labelX, currentY);
      doc.text(`Rs. ${fallbackTax.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    if (shippingVal > 0) {
      currentY += 6;
      doc.text("Shipping Charges:", labelX, currentY);
      doc.text(`Rs. ${shippingVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    if (otherVal > 0) {
      currentY += 6;
      doc.text("Other Charges:", labelX, currentY);
      doc.text(`Rs. ${otherVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text("Grand Total:", labelX, currentY);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });

    // Terms & Conditions block on bottom left (below totals to prevent collision)
    const tcY = currentY + 12;
    const tcString = localStorage.getItem("nirmalyam_quotation_terms") || 
      `1. Validity: This quotation is strictly valid until ${validUntil}.\n2. Payment Terms: 50% advance payment required to initiate production. Remaining 50% before dispatch.\n3. Delivery: Standard production lead time of 7-10 working days.\n4. Taxes & Shipping: Prices are ex-factory. GST and transport extra.`;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Terms & Conditions:", 15, tcY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const tcLines = doc.splitTextToSize(tcString, 90);
    doc.text(tcLines, 15, tcY + 5);

    // Bank Account / Payment details (drawn if showPaymentInfo toggle is true)
    const isPaymentInfoEnabled = localStorage.getItem("nirmalyam_show_payment_info") === "true";
    if (isPaymentInfoEnabled) {
      const bHolder = localStorage.getItem("nirmalyam_bank_holder") || "Nirmalyam Krafts";
      const bName   = localStorage.getItem("nirmalyam_bank_name")   || "State Bank of India";
      const bAcc    = localStorage.getItem("nirmalyam_bank_account")|| "39824872901";
      const bIfsc   = localStorage.getItem("nirmalyam_bank_ifsc")   || "SBIN0001299";
      const bUpi    = localStorage.getItem("nirmalyam_bank_upi")    || "nirmalyam@sbi";

      const bankY = tcY;
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Bank Details for Payment:", 115, bankY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Account Name: ${bHolder}`, 115, bankY + 5);
      doc.text(`Bank Name: ${bName}`, 115, bankY + 10);
      doc.text(`A/C Number: ${bAcc}`, 115, bankY + 15);
      doc.text(`IFSC Code: ${bIfsc}`, 115, bankY + 20);
      doc.text(`UPI ID: ${bUpi}`, 115, bankY + 25);
    }

    // Footer
    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Thank you for your interest! We look forward to working with you.",
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
      if (status !== "draft" && totalQuoted <= 0) {
        toast.error("Enter a valid quotation amount greater than 0", {
          id: loadingToast,
        });
        return;
      }
      await axiosInstance.patch(`/orders/${quotationOrder.id}/quotation`, {
        status,
        totalQuoted,
        validUntil: quotationValidUntil,
        quotationNumber: quotationNumberInput,
        taxRate: Number(quotationTaxRateInput || 0),
        shippingCharges: Number(quotationShippingInput || 0),
        otherCharges: Number(quotationOtherInput || 0),
        subtotalAmount: Number(quotationSubtotalInput || 0),
      });
      toast.success("Quotation updated", { id: loadingToast });
      setShowQuotationModal(false);
      queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
      await refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update quotation", {
        id: loadingToast,
      });
    }
  };

  const handleRecreateQuotation = async () => {
    if (!quotationOrder) return;
    const reason = window.prompt("Please enter the reason for recreating this quotation:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("A reason is required to recreate the quotation.");
      return;
    }

    const loadingToast = toast.loading("Recreating quotation...");
    try {
      await axiosInstance.patch(`/orders/${quotationOrder.id}/quotation`, {
        status: "draft",
        note: `Recreated quotation. Reason: ${reason.trim()}`,
        totalQuoted: Number(quotationTotalInput || 0),
        validUntil: quotationValidUntil,
        quotationNumber: quotationNumberInput,
        taxRate: Number(quotationTaxRateInput || 0),
        shippingCharges: Number(quotationShippingInput || 0),
        otherCharges: Number(quotationOtherInput || 0),
        subtotalAmount: Number(quotationSubtotalInput || 0),
      });

      toast.success("Quotation status reset to draft. Fields unlocked.", { id: loadingToast });
      setShowQuotationModal(false);
      queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });
      await refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to recreate quotation", {
        id: loadingToast,
      });
    }
  };

  const getQuotationShareText = (order, pricing, productItems) => {
    const total = Number(quotationTotalInput || pricing?.totalOrderMaterialCost || order.totalAmount || 0);
    const productSummary = getWhatsAppProductSummary(order, productItems);
    return `
*${COMPANY_NAME} — Quotation*

Customer: ${order.customerName}
Business: ${order.businessName || "—"}

Products Details:
${productSummary}

Total Quoted: ₹${total.toLocaleString()}
Valid Until: ${quotationValidUntil || "—"}
    `.trim();
  };

  const handleQuotationWhatsApp = () => {
    if (!quotationOrder) return;
    const text = getQuotationShareText(quotationOrder, quotationPricing, productItems);
    const phone = String(quotationOrder.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleQuotationMailto = () => {
    if (!quotationOrder) return;
    const subject = encodeURIComponent(`${COMPANY_NAME} — Quotation`);
    const body = encodeURIComponent(getQuotationShareText(quotationOrder, quotationPricing, productItems));
    window.location.href = `mailto:${quotationOrder.email || ""}?subject=${subject}&body=${body}`;
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    const dList = order.orderDetailsList && order.orderDetailsList.length > 0
      ? order.orderDetailsList.map(item => ({
          productId: item.productId || "",
          productCategory: item.productCategory || order.productCategory || "",
          bagSize: item.bagSize || "",
          color: item.color || "",
          quantity: item.quantity || "",
          length: item.dimensions?.length || 0,
          width: item.dimensions?.width || 0,
          height: item.dimensions?.height || 0,
          gsm: item.gsm || "",
          dimensionUnit: item.dimensions?.unit || "inch",
          unit: item.unit || "pcs",
          calculationMode: item.calculationMode || "auto",
          convertedQuantity: item.convertedQuantity || "",
          bf: item.bf || "",
        }))
      : [];

    setEditOrderForm({
      customerName: order.customerName || "",
      businessName: order.businessName || "",
      phone: order.phone || "",
      email: order.email || "",
      productId: order.orderDetails?.productId || "",
      productCategory: order.productCategory || "",
      source: order.source || "Manual Order",
      bagSize: order.orderDetails?.bagSize || "",
      color: order.orderDetails?.color || "",
      quantity: order.orderDetails?.quantity || "",
      length: order.orderDetails?.dimensions?.length || "",
      width: order.orderDetails?.dimensions?.width || "",
      height: order.orderDetails?.dimensions?.height || "",
      gsm: order.orderDetails?.gsm || "",
      dimensionUnit: order.orderDetails?.dimensions?.unit || "inch",
      notes: order.notes || "",
      unit: order.orderDetails?.unit || "",
      calculationMode: order.orderDetails?.calculationMode || "auto",
      convertedQuantity: order.orderDetails?.convertedQuantity || "",
      orderDetailsList: dList,
      editReason: "",
    });
    setShowEditModal(true);
  };

  const handleUpdateOrderSubmit = async (e) => {
    e.preventDefault();

    if (!editOrderForm.customerName || !editOrderForm.phone) {
      showNotification("Please fill all customer required fields", "error");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(editOrderForm.phone)) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      return;
    }

    if (!editOrderForm.editReason || !editOrderForm.editReason.trim()) {
      showNotification("Please enter a reason for this edit", "error");
      return;
    }

    const isMultiProduct = editOrderForm.orderDetailsList && editOrderForm.orderDetailsList.length > 1;

    if (isMultiProduct) {
      for (let i = 0; i < editOrderForm.orderDetailsList.length; i++) {
        const item = editOrderForm.orderDetailsList[i];
        const selProdItem = productItems.find(p => String(p?._id || p?.id || "").trim() === item.productId);
        const isItemRoll = selProdItem?.category?.toLowerCase().includes("roll") || item.productCategory?.toLowerCase().includes("roll");

        if (!item.productId || !item.quantity || !item.width) {
          showNotification(`Please fill all required fields for Item #${i + 1}`, "error");
          return;
        }
        if (isItemRoll ? !item.gsm : (!item.bagSize || !item.length || !item.height)) {
          showNotification(`Please fill specifications for Item #${i + 1}`, "error");
          return;
        }
      }
    } else {
      const selectedProd = productItems.find(
        (p) => String(p?._id || p?.id || "").trim() === editOrderForm.productId
      );
      const isRoll = selectedProd?.category?.toLowerCase().includes("roll") || editOrderForm.productCategory?.toLowerCase().includes("roll");

      if (
        !editOrderForm.productId ||
        !editOrderForm.quantity ||
        !editOrderForm.width ||
        (isRoll ? !editOrderForm.gsm : (!editOrderForm.bagSize || !editOrderForm.length || !editOrderForm.height))
      ) {
        showNotification("Please fill all required product fields", "error");
        return;
      }
    }

    const loadingToast = toast.loading("Updating order...");

    try {
      const payload = {
        customerName: editOrderForm.customerName,
        businessName: editOrderForm.businessName,
        phone: editOrderForm.phone,
        email: editOrderForm.email,
        source: editOrderForm.source,
        notes: editOrderForm.notes,
        editReason: editOrderForm.editReason.trim(),
      };

      if (isMultiProduct) {
        payload.orderDetailsList = editOrderForm.orderDetailsList.map(p => {
          const sel = productItems.find(x => String(x?._id || x?.id || "").trim() === p.productId);
          const isRoll = sel?.category?.toLowerCase().includes("roll") || p.productCategory?.toLowerCase().includes("roll");
          return {
            productId: p.productId,
            bagSize: isRoll ? undefined : p.bagSize,
            color: isRoll ? undefined : p.color,
            quantity: Number(p.quantity),
            gsm: p.gsm ? Number(p.gsm) : undefined,
            unit: p.unit || (isRoll ? "kg" : "pcs"),
            calculationMode: p.calculationMode || "auto",
            convertedQuantity: p.convertedQuantity ? Number(p.convertedQuantity) : undefined,
            bf: isRoll && sel?.bf ? Number(sel.bf) : undefined,
            dimensions: {
              length: isRoll ? 0 : Number(p.length || 0),
              width: Number(p.width || 0),
              height: isRoll ? 0 : Number(p.height || 0),
              unit: p.dimensionUnit,
            },
          };
        });
        payload.orderDetails = payload.orderDetailsList[0];
        payload.productCategory = editOrderForm.orderDetailsList.map(p => {
          const sel = productItems.find(x => String(x?._id || x?.id || "").trim() === p.productId);
          return sel?.category || p.productCategory || "Product";
        }).join(", ");
      } else {
        const selectedProd = productItems.find(
          (p) => String(p?._id || p?.id || "").trim() === editOrderForm.productId
        );
        const isRoll = selectedProd?.category?.toLowerCase().includes("roll") || editOrderForm.productCategory?.toLowerCase().includes("roll");
        payload.orderDetails = {
          productId: editOrderForm.productId,
          bagSize: isRoll ? undefined : editOrderForm.bagSize,
          color: isRoll ? undefined : editOrderForm.color,
          quantity: Number(editOrderForm.quantity),
          gsm: editOrderForm.gsm ? Number(editOrderForm.gsm) : undefined,
          unit: editOrderForm.unit || (isRoll ? "kg" : "pcs"),
          calculationMode: editOrderForm.calculationMode || "auto",
          convertedQuantity: editOrderForm.convertedQuantity ? Number(editOrderForm.convertedQuantity) : undefined,
          bf: isRoll && selectedProd?.bf ? Number(selectedProd.bf) : undefined,
          dimensions: {
            length: isRoll ? 0 : Number(editOrderForm.length),
            width: Number(editOrderForm.width),
            height: isRoll ? 0 : Number(editOrderForm.height),
            unit: editOrderForm.dimensionUnit,
          },
        };
        payload.productCategory = editOrderForm.productCategory || selectedProd?.category || "Kraft Rolls";
        payload.orderDetailsList = [payload.orderDetails];
      }

      await axiosInstance.patch(`/orders/${editingOrder.id}/update`, payload);

      toast.success("Order updated successfully 🎉", { id: loadingToast });

      queryClient.invalidateQueries({ queryKey: ["getAllOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getOrderStats"] });

      await refetch();
      setShowEditModal(false);
      setEditingOrder(null);
      if (selectedOrder && selectedOrder.id === editingOrder.id) {
        setShowDetailPanel(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update order",
        { id: loadingToast }
      );
    }
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();

    if (!manualOrderForm.customerName) {
      showNotification("Customer Name is required", "error");
      return;
    }
    if (!manualOrderForm.phone) {
      showNotification("Phone number is required", "error");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(manualOrderForm.phone)) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      return;
    }
    if (manualOrderForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualOrderForm.email)) {
        showNotification("Please enter a valid email address", "error");
        return;
      }
    }

    let productsToSubmit = [...manualSelectedProducts];

    // Auto-add current form inputs as a product if list is empty but product is configured
    if (productsToSubmit.length === 0 && manualOrderForm.productId) {
      const selectedProd = productItems.find(
        (p) => String(p?._id || p?.id || "").trim() === manualOrderForm.productId
      );
      if (selectedProd) {
        const isRoll = selectedProd?.category?.toLowerCase().includes("roll") || manualOrderForm.productCategory?.toLowerCase().includes("roll");
        
        if (
          !manualOrderForm.quantity ||
          !manualOrderForm.width ||
          (isRoll ? (!manualOrderForm.gsm || !manualOrderForm.bf) : (!manualOrderForm.bagSize || !manualOrderForm.length || !manualOrderForm.height))
        ) {
          showNotification("Please configure the product fully before adding or creating order", "error");
          return;
        }

        productsToSubmit.push({
          productId: manualOrderForm.productId,
          productName: selectedProd.name,
          productSku: selectedProd.sku,
          productCategory: selectedProd?.category || manualOrderForm.productCategory || "Kraft Rolls",
          bagSize: isRoll ? undefined : manualOrderForm.bagSize,
          color: isRoll ? undefined : manualOrderForm.color,
          quantity: Number(manualOrderForm.quantity),
          gsm: manualOrderForm.gsm ? Number(manualOrderForm.gsm) : undefined,
          unit: manualOrderForm.unit || (isRoll ? "kg" : "pcs"),
          calculationMode: manualOrderForm.calculationMode || "auto",
          convertedQuantity: manualOrderForm.convertedQuantity ? Number(manualOrderForm.convertedQuantity) : undefined,
          bf: isRoll && manualOrderForm.bf ? Number(manualOrderForm.bf) : undefined,
          dimensions: {
            length: isRoll ? 0 : Number(manualOrderForm.length),
            width: Number(manualOrderForm.width),
            height: isRoll ? 0 : Number(manualOrderForm.height),
            unit: manualOrderForm.dimensionUnit,
          },
          hsnCode: selectedProd.hsnCode || "",
          gstRate: selectedProd.gstRate ?? 18,
        });
      }
    }

    if (productsToSubmit.length === 0) {
      showNotification("Please select/add at least one product to the order", "error");
      return;
    }

    const loadingToast = toast.loading(`Creating order with ${productsToSubmit.length} products...`);


    try {
      // Build ONE order with all products in orderDetailsList
      // orderDetails = primary (first) product; orderDetailsList = all products
      const primaryProduct = productsToSubmit[0];
      const payload = {
        customerName: manualOrderForm.customerName,
        businessName: manualOrderForm.businessName,
        phone: manualOrderForm.phone,
        email: manualOrderForm.email,
        productCategory: productsToSubmit.map(p => p.productCategory).join(", "),
        source: manualOrderForm.source,
        orderDetails: {
          productId: primaryProduct.productId,
          bagSize: primaryProduct.bagSize,
          color: primaryProduct.color,
          quantity: primaryProduct.quantity,
          gsm: primaryProduct.gsm,
          unit: primaryProduct.unit,
          calculationMode: primaryProduct.calculationMode,
          convertedQuantity: primaryProduct.convertedQuantity,
          bf: primaryProduct.bf,
          dimensions: primaryProduct.dimensions,
          hsnCode: primaryProduct.hsnCode,
          gstRate: primaryProduct.gstRate,
        },
        orderDetailsList: productsToSubmit.map(p => ({
          productId: p.productId,
          bagSize: p.bagSize,
          color: p.color,
          quantity: p.quantity,
          gsm: p.gsm,
          unit: p.unit,
          calculationMode: p.calculationMode,
          convertedQuantity: p.convertedQuantity,
          bf: p.bf,
          dimensions: p.dimensions,
          hsnCode: p.hsnCode,
          gstRate: p.gstRate,
        })),
        payment: { paymentType: "partial", partialPaidAmount: 0 },
        notes: manualOrderForm.notes,
      };

      await axiosInstance.post("/order/create", payload);

      toast.success(`Order created with ${productsToSubmit.length} product${productsToSubmit.length > 1 ? "s" : ""} 🎉`, { id: loadingToast });

      queryClient.invalidateQueries({
        queryKey: ["getAllOrders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getOrderStats"],
      });

      await refetch();
      resetManualOrderForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create order(s)",
        { id: loadingToast }
      );
    }
  };
  const getSnapshotDiff = (snapshot, nextState) => {
    const changes = [];
    if (!snapshot || !nextState) return changes;

    if (snapshot.customerName !== nextState.customerName) {
      changes.push(`Customer: "${snapshot.customerName || ''}" ➔ "${nextState.customerName || ''}"`);
    }
    if (snapshot.businessName !== nextState.businessName) {
      changes.push(`Business: "${snapshot.businessName || ''}" ➔ "${nextState.businessName || ''}"`);
    }
    if (snapshot.phone !== nextState.phone) {
      changes.push(`Phone: "${snapshot.phone || ''}" ➔ "${nextState.phone || ''}"`);
    }
    if (snapshot.email !== nextState.email) {
      changes.push(`Email: "${snapshot.email || ''}" ➔ "${nextState.email || ''}"`);
    }
    if (snapshot.notes !== nextState.notes) {
      changes.push(`Notes updated`);
    }

    const snapDetails = snapshot.orderDetails || {};
    const nextDetails = nextState.orderDetails || {};

    if (snapDetails.productId !== nextDetails.productId) {
      changes.push(`Product category/ID changed`);
    }
    if (snapDetails.gsm !== nextDetails.gsm) {
      changes.push(`GSM: ${snapDetails.gsm || '—'} ➔ ${nextDetails.gsm || '—'}`);
    }
    if (snapDetails.quantity !== nextDetails.quantity || snapDetails.unit !== nextDetails.unit) {
      changes.push(`Quantity: ${snapDetails.quantity || 0} ${snapDetails.unit || ''} ➔ ${nextDetails.quantity || 0} ${nextDetails.unit || ''}`);
    }
    if (snapDetails.bf !== nextDetails.bf) {
      changes.push(`BF: ${snapDetails.bf || '—'} ➔ ${nextDetails.bf || '—'}`);
    }
    if (snapDetails.bagSize !== nextDetails.bagSize) {
      changes.push(`Bag Size: "${snapDetails.bagSize || ''}" ➔ "${nextDetails.bagSize || ''}"`);
    }
    if (snapDetails.color !== nextDetails.color) {
      changes.push(`Color: "${snapDetails.color || ''}" ➔ "${nextDetails.color || ''}"`);
    }

    const snapDim = snapDetails.dimensions || {};
    const nextDim = nextDetails.dimensions || {};
    if (
      snapDim.length !== nextDim.length ||
      snapDim.width !== nextDim.width ||
      snapDim.height !== nextDim.height ||
      snapDim.unit !== nextDim.unit
    ) {
      const snapL = snapDim.length || 0;
      const snapW = snapDim.width || 0;
      const snapH = snapDim.height || 0;
      const snapU = snapDim.unit || '';
      const nextL = nextDim.length || 0;
      const nextW = nextDim.width || 0;
      const nextH = nextDim.height || 0;
      const nextU = nextDim.unit || '';
      changes.push(`Dimensions: ${snapL}x${snapW}x${snapH} ${snapU} ➔ ${nextL}x${nextW}x${nextH} ${nextU}`);
    }

    return changes;
  };

  const buildFilteredActivityLogs = (order) => {
    if (!order) return [];
    const logs = [];

    if (Array.isArray(order.editHistory)) {
      order.editHistory.forEach((historyItem, idx) => {
        let nextState;
        if (idx < order.editHistory.length - 1) {
          nextState = order.editHistory[idx + 1].snapshot;
        } else {
          nextState = {
            customerName: order.customerName,
            businessName: order.businessName,
            phone: order.phone,
            email: order.email,
            notes: order.notes,
            orderDetails: order.orderDetails,
          };
        }

        const diffList = getSnapshotDiff(historyItem.snapshot, nextState);

        logs.push({
          type: "update",
          title: `ORDER_UPDATED`,
          by: historyItem.by,
          reason: historyItem.reason,
          time: historyItem.at,
          changes: diffList,
          snapshotId: historyItem._id,
        });
      });
    }

    if (Array.isArray(order.workflowLogs)) {
      order.workflowLogs.forEach((w) => {
        const actionUpper = String(w.action || "").toUpperCase();
        if (
          actionUpper.includes("PAYMENT") ||
          actionUpper.includes("STATUS") ||
          actionUpper.includes("CONFIRMED") ||
          actionUpper.includes("COMPLETED") ||
          actionUpper.includes("CANCELLED") ||
          actionUpper.includes("DELIVERED") ||
          actionUpper.includes("RESTORED")
        ) {
          let title = w.action;
          if (actionUpper === "PAYMENT_RECORDED") title = "💰 PAYMENT_RECORDED";
          else if (actionUpper === "STATUS_CHANGED") title = "🔄 STATUS_CHANGED";
          else if (actionUpper === "ORDER_CONFIRMED") title = "✅ ORDER_CONFIRMED";
          else if (actionUpper === "ORDER_UNCONFIRMED") title = "⏪ ORDER_UNCONFIRMED";
          else if (actionUpper === "ORDER_COMPLETED") title = "📦 ORDER_COMPLETED";
          else if (actionUpper === "ORDER_CANCELLED") title = "❌ ORDER_CANCELLED";
          else if (actionUpper === "ORDER_RESTORED") title = "⏪ ORDER_RESTORED";

          logs.push({
            type: "workflow",
            title: title,
            description: w.note || "",
            time: w.at,
          });
        }
      });
    }

    const getLocalDateString = (dateVal) => {
      if (!dateVal) return "";
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    let filteredLogs = logs;
    if (logStartDate) {
      filteredLogs = filteredLogs.filter(l => l.time && getLocalDateString(l.time) >= logStartDate);
    }
    if (logEndDate) {
      filteredLogs = filteredLogs.filter(l => l.time && getLocalDateString(l.time) <= logEndDate);
    }

    return filteredLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
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

  // confirmedCount is already computed globally at the top of the component
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
                variant="custom"
                icon={Download}
                onClick={() => handleExportOrders("csv")}
                className="rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-5 py-3"
              >
                Export CSV
              </Button>

              <Button
                variant="custom"
                icon={FileSpreadsheet}
                onClick={() => handleExportOrders("excel")}
                className="rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-5 py-3"
              >
                Export Excel
              </Button>

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
        {viewMode !== "returns" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-2"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === "dashboard"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                📊 Dashboard View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === "table"
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
        )}

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <OrderActionsDashboard
            orders={formattedOrders}
            globalStats={orderStats}
            onViewOrder={(filter) => {
              if (filter === "PENDING") {
                setActionDrawerType("CONFIRM_ORDERS");
              } else if (filter === "PENDING_QUOTE") {
                setActionDrawerType("QUOTATIONS_NEEDED");
              } else if (filter === "PROCESSING") {
                setActionDrawerType("TRACK_PRODUCTION");
              } else if (filter === "RETURNED_ORDERS") {
                setActionDrawerType("RETURNED_ORDERS");
              } else {
                setViewMode("table");
                if (filter === "CONFIRMED") {
                  setOrderStatusFilter("Confirmed");
                } else if (filter === "CANCELLED") {
                  setOrderStatusFilter("Cancelled");
                }
              }
            }}
            onCreateQuotation={() => {
              setActionDrawerType("QUOTATIONS_NEEDED");
            }}
            onInitiateReturn={() => {
              setViewMode("returns");
            }}
          />
        )}

        {viewMode !== "returns" && (
          <>
            <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto]"
        >
          <Input
            placeholder="Search by customer, business, phone, email, or bag size..."
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
            <option value="Delivered">Delivered</option>
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
            ) : viewMode === "__legacy_table__" ? (
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
                              {/* Show all products from orderDetailsList */}
                              {order.orderDetailsList?.length > 1 ? (
                                <div className="mt-1 space-y-0.5">
                                  {order.orderDetailsList.slice(0, 3).map((det, i) => (
                                    <p key={i} className="text-xs text-gray-500 font-semibold truncate">
                                      • {det.quantity} {det.unit || "pcs"}{det.bagSize ? ` (${det.bagSize})` : ""}
                                    </p>
                                  ))}
                                  {order.orderDetailsList.length > 3 && (
                                    <p className="text-[10px] text-emerald-600 font-bold">+{order.orderDetailsList.length - 3} more products</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 mt-1 font-semibold">
                                  {order.productCategory}
                                </p>
                              )}
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
                            {order.orderDetailsList?.length > 1 ? (
                              /* Multi-product: show each product's qty + size */
                              <div className="space-y-1.5">
                                {order.orderDetailsList.map((det, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                                    <span className="text-gray-500 font-medium truncate max-w-[80px]">
                                      {det.bagSize || `Item ${i + 1}`}
                                    </span>
                                    <span className="font-bold text-blue-600 ml-1">
                                      {det.quantity || 0} {det.unit || "pcs"}
                                    </span>
                                  </div>
                                ))}
                                <div className="text-[10px] text-emerald-600 font-bold text-center">
                                  Total: {order.orderDetailsList.reduce((s, d) => s + Number(d.quantity || 0), 0)} pcs
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Quantity:</span>
                                  <span className="font-bold text-blue-600">
                                    {order.orderDetails?.quantity || 0} {order.orderDetails?.unit || "pcs"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">
                                    {order.productCategory?.toLowerCase().includes("roll") ? "GSM:" : "Size:"}
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {order.productCategory?.toLowerCase().includes("roll")
                                      ? (order.orderDetails?.gsm || "—")
                                      : (order.orderDetails?.bagSize || "—")}
                                  </span>
                                </div>
                              </>
                            )}
                            {order.productCategory?.toLowerCase().includes("roll") ? (
                              <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                                <span className="font-medium">Width:</span>{" "}
                                {order.orderDetails?.width || 0}{" "}
                                {order.orderDetails?.dimensionUnit || "inch"}
                              </div>
                            ) : (
                              (order.orderDetails?.length || order.orderDetails?.width) && (
                                <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                                  <span className="font-medium">Dimensions:</span>{" "}
                                  {order.orderDetails.length || 0}×{order.orderDetails.width || 0}×{order.orderDetails.height || 0}{" "}
                                  {order.orderDetails.dimensionUnit || "inch"}
                                </div>
                              )
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
                                setActiveLogOrder(order);
                                setShowDetailPanel(true);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </button>

                            {order.orderStatusKey !== "COMPLETED" && order.orderStatusKey !== "DELIVERED" && order.orderStatusKey !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => handleEditOrder(order)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-indigo-750 hover:bg-indigo-50 transition-all duration-200"
                                title="Edit Order Details"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

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

                            <button
                              type="button"
                              onClick={() => openBillModal(order)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 transition-all duration-200"
                              title="Create Bill / Invoice"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Bill</span>
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
            ) : (
              <OrderListSection
                orders={formattedOrders}
                isLoading={isLoading}
                checkingOrderId={checkingOrderId}
                processingActionId={processingActionId}
                completeActionId={completeActionId}
                orderStatusColors={orderStatusColors}
                paymentColors={paymentColors}
                orderStatusMeta={orderStatusMeta}
                paymentStatusMeta={paymentStatusMeta}
                formatCurrency={formatCurrency}
                onViewOrder={(order) => {
                  setSelectedOrder(order);
                  setActiveLogOrder(order);
                  setShowDetailPanel(true);
                }}
                onCheckAvailability={handleCheckOrderAvailability}
                onOpenQuotation={openQuotationModal}
                onOpenBill={openBillModal}
                onMoveToProcessing={handleMoveToProcessing}
                onCompleteOrder={handleCompleteOrder}
                onMarkAsDelivered={handleMarkAsDelivered}
                onEditOrder={handleEditOrder}
                onEditDelivery={openDeliveryModal}
              />
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

          {currentActiveOrder && (
            <div className="mt-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg mb-6">
                <h3 className="text-lg font-bold">Activity Logs & Modification History — {currentActiveOrder.customerName}</h3>
                <p className="mt-1 text-xs text-slate-300 opacity-90">
                  Showing payment recordings, state transitions, and specifications modifications for Order #{currentActiveOrder.id?.slice(-6).toUpperCase() || currentActiveOrder._id?.slice(-6).toUpperCase()}
                </p>
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-gray-200 p-3 rounded-2xl mb-6 text-sm">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter Logs by Date:</span>
                 <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">From</span>
                  <input
                    type="date"
                    value={logStartDate}
                    max={logEndDate || undefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (logEndDate && val > logEndDate) {
                        toast.error("'From' date cannot be after 'To' date");
                        return;
                      }
                      setLogStartDate(val);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">To</span>
                  <input
                    type="date"
                    value={logEndDate}
                    min={logStartDate || undefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (logStartDate && val < logStartDate) {
                        toast.error("'To' date cannot be before 'From' date");
                        return;
                      }
                      setLogEndDate(val);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                {(logStartDate || logEndDate) && (
                  <button
                    onClick={() => { setLogStartDate(""); setLogEndDate(""); }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {buildFilteredActivityLogs(currentActiveOrder).map((log, index) => {
                  const canRestore = currentActiveOrder.orderStatusKey !== "COMPLETED" && currentActiveOrder.orderStatusKey !== "DELIVERED" && currentActiveOrder.orderStatusKey !== "CANCELLED";

                  if (log.type === "update") {
                    return (
                      <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                                🔄 {log.title}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 font-medium">
                              <span className="font-semibold text-gray-800">Updated by:</span> {log.by}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 font-medium">
                              <span className="font-semibold text-gray-800">Reason:</span> {log.reason}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-500 font-semibold">
                              {new Date(log.time).toLocaleString()}
                            </span>
                            {canRestore && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = window.prompt("Enter reason/note for restoring this snapshot:");
                                  if (reason === null) return;
                                  if (!reason.trim()) {
                                    toast.error("Reason is required to revert state");
                                    return;
                                  }
                                  handleRestoreState(currentActiveOrder.id || currentActiveOrder._id, log.snapshotId, reason);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition shadow-sm border border-teal-200"
                              >
                                Restore State
                              </button>
                            )}
                          </div>
                        </div>

                        {log.changes && log.changes.length > 0 ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Changed fields:</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-semibold">
                              {log.changes.map((changeStr, cIdx) => (
                                <li key={cIdx}>{changeStr}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">
                            No specification details changed (metadata or note edit).
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // workflow type
                    return (
                      <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <span className="rounded-full bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                              {log.title}
                            </span>
                            <p className="mt-2 text-sm text-gray-750 font-semibold">{log.description}</p>
                          </div>
                          <span className="text-xs text-gray-500 font-semibold">
                            {new Date(log.time).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </motion.div>
          </>
        )}

        {viewMode === "returns" && (
          <OrderReturnsWorkspace
            axiosInstance={axiosInstance}
            onBack={() => setViewMode("dashboard")}
            refetchStats={() => {
              refetch();
              refetchOrderStats();
              refetchInventory();
            }}
            generateReturnReceiptPDF={generateReturnReceiptPDF}
            downloadReceiptPDF={downloadReceiptPDF}
            productItems={productItems}
          />
        )}

        <Modal
          isOpen={showCreateModal}
          title="Create Manual Order"
          onClose={resetManualOrderForm}
          size="xl"
        >
          {(() => {
            const selProd = productItems.find(p => String(p?._id || p?.id || "").trim() === manualOrderForm.productId);
            const isManualRoll = !!(selProd?.category?.toLowerCase().includes("roll") || manualOrderForm.productCategory?.toLowerCase().includes("roll"));
            const matchedInventory = selProd
              ? inventoryItems.find((inv) =>
                  String(inv.productId || inv.product?._id || inv.product?.id || "").trim() === String(selProd?._id || selProd?.id || "").trim()
                )
              : null;
            const availableStock = matchedInventory
              ? (matchedInventory.availableForSale ?? matchedInventory.availableBags ?? matchedInventory.stockLevel ?? matchedInventory.availableStock ?? matchedInventory.quantity ?? 0)
              : 0;

            return (
              <form onSubmit={handleCreateManualOrder} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Column: Form Configuration (3 cols) */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Customer Info Card */}
                    <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <User2 className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-bold text-gray-800">Customer Details</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Customer Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={manualOrderForm.customerName}
                            onChange={(e) => handleFormChange("customerName", e.target.value)}
                            placeholder="Customer Name"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={manualOrderForm.businessName}
                            onChange={(e) => handleFormChange("businessName", e.target.value)}
                            placeholder="Business Name"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={manualOrderForm.phone}
                            onChange={(e) => handleFormChange("phone", e.target.value)}
                            placeholder="Phone"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            value={manualOrderForm.email}
                            onChange={(e) => handleFormChange("email", e.target.value)}
                            placeholder="Email"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Source
                          </label>
                          <input
                            type="text"
                            value={manualOrderForm.source}
                            onChange={(e) => handleFormChange("source", e.target.value)}
                            placeholder="Source"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product Configuration Card */}
                    <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-bold text-gray-800">Add Product Parameters</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Product <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={manualOrderForm.productId}
                            onChange={(e) => {
                              const prodId = e.target.value;
                              const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === prodId);
                              const isRollCategory = prod?.category?.toLowerCase().includes("roll");
                              setManualOrderForm(prev => ({
                                ...prev,
                                productId: prodId,
                                productCategory: prod?.category || "",
                                length: prod?.dimensions?.length || "",
                                width: prod?.dimensions?.width || "",
                                height: prod?.dimensions?.height || "",
                                dimensionUnit: prod?.dimensions?.unit || "inch",
                                gsm: prod?.gsm || "",
                                color: prod?.color || prev.color || "",
                                bagSize: prod?.bagSize || prev.bagSize || "",
                                unit: isRollCategory ? "kg" : "pcs",
                                calculationMode: "auto",
                                convertedQuantity: "",
                              }));
                            }}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                          >
                            <option value="">Select Product</option>
                            {productItems.map((product) => (
                              <option key={product._id || product.id} value={product._id || product.id}>
                                {product.name} {product.sku ? `(${product.sku})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            Order Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="1"
                              value={manualOrderForm.quantity}
                              onChange={(e) => handleFormChange("quantity", e.target.value)}
                              placeholder="Quantity"
                              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                            />
                            <select
                              value={manualOrderForm.unit || (isManualRoll ? "kg" : "pcs")}
                              onChange={(e) => handleFormChange("unit", e.target.value)}
                              className="w-[90px] rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                            >
                              {isManualRoll ? (
                                <>
                                  <option value="kg">kg</option>
                                  <option value="m">meter</option>
                                </>
                              ) : (
                                <>
                                  <option value="pcs">pcs</option>
                                  <option value="kg">kg</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        {((!isManualRoll && manualOrderForm.unit === "kg") || (isManualRoll && manualOrderForm.unit === "m")) && (
                          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-l-4 border-amber-500 bg-amber-50/50 p-3 rounded-xl">
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Unit Conversion Mode
                              </label>
                              <select
                                value={manualOrderForm.calculationMode || "auto"}
                                onChange={(e) =>
                                  handleFormChange("calculationMode", e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              >
                                <option value="auto">Auto via Formula</option>
                                <option value="manual">Enter Manually</option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                {isManualRoll ? "Equivalent Weight (kg)" : "Equivalent Quantity (pcs)"}
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={manualOrderForm.convertedQuantity || ""}
                                onChange={(e) =>
                                  handleFormChange("convertedQuantity", e.target.value)
                                }
                                placeholder={isManualRoll ? "Equivalent kg" : "Equivalent bags"}
                                disabled={manualOrderForm.calculationMode !== "manual"}
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                                  manualOrderForm.calculationMode === "manual"
                                    ? "border-emerald-300 bg-white focus:border-emerald-500 text-gray-900 font-medium"
                                    : "border-gray-200 bg-gray-100/80 text-gray-500 cursor-not-allowed"
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700">
                            {isManualRoll ? "Width Unit" : "Dimension Unit"}
                          </label>
                          <select
                            value={manualOrderForm.dimensionUnit}
                            onChange={(e) => handleFormChange("dimensionUnit", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                          >
                            <option value="inch">Inch</option>
                            <option value="cm">CM</option>
                            <option value="mm">MM</option>
                            <option value="ft">Feet</option>
                          </select>
                        </div>

                        {/* Roll vs Bag Conditional Fields */}
                        {isManualRoll ? (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                GSM <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.gsm}
                                onChange={(e) => handleFormChange("gsm", e.target.value)}
                                placeholder="GSM"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Width <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.width}
                                onChange={(e) => handleFormChange("width", e.target.value)}
                                placeholder="Width"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                BF (Burst Factor) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.bf}
                                onChange={(e) => handleFormChange("bf", e.target.value)}
                                placeholder="BF"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Bag Size <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={manualOrderForm.bagSize}
                                onChange={(e) => handleFormChange("bagSize", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              >
                                <option value="">Select Size</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Color
                              </label>
                              <select
                                value={manualOrderForm.color}
                                onChange={(e) => handleFormChange("color", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              >
                                <option value="">Select color</option>
                                <option value="Brown">Brown</option>
                                <option value="White">White</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Length <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.length}
                                onChange={(e) => handleFormChange("length", e.target.value)}
                                placeholder="Length"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Width <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.width}
                                onChange={(e) => handleFormChange("width", e.target.value)}
                                placeholder="Width"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">
                                Height <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={manualOrderForm.height}
                                onChange={(e) => handleFormChange("height", e.target.value)}
                                placeholder="Height"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={handleAddProductToManualList}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Product to Order</span>
                        </Button>
                      </div>
                    </div>

                    {/* Specs & Stock Comparison Card */}
                    {selProd && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Info className="h-4 w-4 text-emerald-700" />
                            <p className="text-sm font-bold text-emerald-800">Product Specs & Stock Status</p>
                          </div>
                          {availableStock >= (Number(manualOrderForm.quantity) || 0) ? (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                              In Stock
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                              Insufficient Stock
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Panel: Actual Product Details */}
                          <div className="bg-white rounded-xl p-3 border border-emerald-50">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                              Actual Product Details (DB)
                            </p>
                            <div className="space-y-1.5 text-xs text-gray-700">
                              <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Category:</span>
                                <span className="font-bold text-gray-900">{selProd.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">SKU:</span>
                                <span className="font-bold text-gray-900">{selProd.sku || "—"}</span>
                              </div>
                              {isManualRoll ? (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Actual GSM:</span>
                                    <span className="font-bold text-gray-900">{selProd.gsm || "—"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Actual Width:</span>
                                    <span className="font-bold text-gray-900">
                                      {selProd.dimensions?.width} {selProd.dimensions?.unit}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Actual BF:</span>
                                    <span className="font-bold text-gray-900">{selProd.bf || "—"}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Actual Size:</span>
                                    <span className="font-bold text-gray-900">{selProd.bagSize || "—"}</span>
                                  </div>
                                  {selProd.color && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">Actual Color:</span>
                                      <span className="font-bold text-gray-900">{selProd.color}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Actual Dims:</span>
                                    <span className="font-bold text-gray-900">
                                      {selProd.dimensions?.length} × {selProd.dimensions?.width} × {selProd.dimensions?.height} {selProd.dimensions?.unit}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between pt-1.5 border-t border-dashed border-gray-150">
                                <span className="text-emerald-800 font-bold">Available Stock:</span>
                                <span className="font-extrabold text-emerald-700">
                                  {availableStock} {isManualRoll ? "kg" : "pcs"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Panel: Requested vs Actual Comparison */}
                          {(() => {
                            const comparisonParams = [];
                            if (selProd) {
                              if (isManualRoll) {
                                comparisonParams.push({
                                  name: "GSM",
                                  requested: manualOrderForm.gsm ? `${manualOrderForm.gsm} GSM` : "—",
                                  actual: selProd.gsm ? `${selProd.gsm} GSM` : "—",
                                  isMatch: manualOrderForm.gsm && Number(manualOrderForm.gsm) === Number(selProd.gsm),
                                });
                                comparisonParams.push({
                                  name: "Width",
                                  requested: manualOrderForm.width ? `${manualOrderForm.width} ${manualOrderForm.dimensionUnit}` : "—",
                                  actual: selProd.dimensions?.width ? `${selProd.dimensions.width} ${selProd.dimensions.unit}` : "—",
                                  isMatch: manualOrderForm.width && Number(manualOrderForm.width) === Number(selProd.dimensions?.width),
                                });
                                comparisonParams.push({
                                  name: "BF",
                                  requested: manualOrderForm.bf ? `${manualOrderForm.bf}` : "—",
                                  actual: selProd.bf ? `${selProd.bf}` : "—",
                                  isMatch: manualOrderForm.bf && Number(manualOrderForm.bf) === Number(selProd.bf),
                                });
                              } else {
                                comparisonParams.push({
                                  name: "Bag Size",
                                  requested: manualOrderForm.bagSize || "—",
                                  actual: selProd.bagSize || "—",
                                  isMatch: (manualOrderForm.bagSize || "").toLowerCase().trim() === String(selProd.bagSize || "").toLowerCase().trim(),
                                });
                                comparisonParams.push({
                                  name: "Color",
                                  requested: manualOrderForm.color || "—",
                                  actual: selProd.color || "—",
                                  isMatch: !manualOrderForm.color || !selProd.color || manualOrderForm.color.toLowerCase().trim() === String(selProd.color || "").toLowerCase().trim(),
                                });
                                comparisonParams.push({
                                  name: "Length",
                                  requested: manualOrderForm.length ? `${manualOrderForm.length} ${manualOrderForm.dimensionUnit}` : "—",
                                  actual: selProd.dimensions?.length ? `${selProd.dimensions.length} ${selProd.dimensions.unit}` : "—",
                                  isMatch: manualOrderForm.length && Number(manualOrderForm.length) === Number(selProd.dimensions?.length),
                                });
                                comparisonParams.push({
                                  name: "Width",
                                  requested: manualOrderForm.width ? `${manualOrderForm.width} ${manualOrderForm.dimensionUnit}` : "—",
                                  actual: selProd.dimensions?.width ? `${selProd.dimensions.width} ${selProd.dimensions.unit}` : "—",
                                  isMatch: manualOrderForm.width && Number(manualOrderForm.width) === Number(selProd.dimensions?.width),
                                });
                                comparisonParams.push({
                                  name: "Height",
                                  requested: manualOrderForm.height ? `${manualOrderForm.height} ${manualOrderForm.dimensionUnit}` : "—",
                                  actual: selProd.dimensions?.height ? `${selProd.dimensions.height} ${selProd.dimensions.unit}` : "—",
                                  isMatch: manualOrderForm.height && Number(manualOrderForm.height) === Number(selProd.dimensions?.height),
                                });
                              }

                              const reqQty = Number(manualOrderForm.quantity || 0);
                              comparisonParams.push({
                                name: "Quantity",
                                requested: reqQty ? `${reqQty} ${manualOrderForm.unit || (isManualRoll ? "kg" : "pcs")}` : "—",
                                actual: `${availableStock} ${isManualRoll ? "kg" : "pcs"}`,
                                isMatch: reqQty <= availableStock,
                              });
                            }

                            return (
                              <div className="bg-white rounded-xl p-3 border border-emerald-50">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                                  Requested vs Available Specs
                                </p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                                        <th className="pb-1.5 text-gray-400">Parameter</th>
                                        <th className="pb-1.5 text-gray-400">Requested</th>
                                        <th className="pb-1.5 text-gray-400">Actual / Stock</th>
                                        <th className="pb-1.5 text-right text-gray-400">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                      {comparisonParams.map((param, pIdx) => (
                                        <tr key={pIdx}>
                                          <td className="py-2 text-gray-900 font-bold">{param.name}</td>
                                          <td className="py-2 text-gray-600">{param.requested}</td>
                                          <td className="py-2 text-gray-950 font-bold">{param.actual}</td>
                                          <td className="py-2 text-right">
                                            {param.name === "BF" ? (
                                              <span className="text-blue-750 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-150 text-[10px] font-bold">
                                                Info
                                              </span>
                                            ) : param.isMatch ? (
                                              <span className="text-green-750 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-150 text-[10px] font-bold">
                                                Match
                                              </span>
                                            ) : (
                                              <span className="text-amber-750 bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-150 text-[10px] font-bold">
                                                Diff
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Notes Card */}
                    <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                      <label className="mb-1 block text-xs font-bold text-gray-700">
                        Notes
                      </label>
                      <textarea
                        rows={2}
                        value={manualOrderForm.notes}
                        onChange={(e) => handleFormChange("notes", e.target.value)}
                        placeholder="Notes"
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Right Column: Selected Products Sidebar (2 cols) */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-150 p-4 bg-gray-50/50 sticky top-0 max-h-[75vh] overflow-y-auto">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                        <span>Selected Products</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">
                          {manualSelectedProducts.length}
                        </span>
                      </h3>

                      {manualSelectedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed border-gray-200 p-4">
                          <ShoppingBag className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-xs font-bold text-gray-500">No products added yet</p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                            Configure parameters on the left and click "Add Product to Order" to display items here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {manualSelectedProducts.map((prod, idx) => {
                            const isExpanded = expandedProductIndex === idx;
                            const isRoll = prod.productCategory?.toLowerCase().includes("roll");
                            const matchedInv = inventoryItems.find((inv) =>
                              String(inv.productId || inv.product?._id || inv.product?.id || "").trim() === String(prod.productId).trim()
                            );
                            const availStock = matchedInv
                              ? (matchedInv.availableForSale ?? matchedInv.availableBags ?? matchedInv.stockLevel ?? matchedInv.availableStock ?? matchedInv.quantity ?? 0)
                              : 0;

                            return (
                              <div
                                key={idx}
                                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md cursor-pointer"
                                onClick={() => setExpandedProductIndex(isExpanded ? null : idx)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-gray-950 text-sm truncate">
                                      {prod.productName}
                                    </p>
                                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                                      Qty: {prod.quantity} {prod.unit}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveProductFromManualList(idx);
                                    }}
                                    className="text-gray-400 hover:text-red-650 p-1 rounded transition"
                                    title="Remove Product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-2 animate-fadeIn">
                                    <div className="flex justify-between">
                                      <span className="font-bold text-gray-500">Category:</span>
                                      <span className="font-bold text-gray-900">{prod.productCategory}</span>
                                    </div>
                                    {isRoll ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span className="font-bold text-gray-500">GSM:</span>
                                          <span className="font-bold text-gray-900">{prod.gsm}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="font-bold text-gray-500">Width:</span>
                                          <span className="font-bold text-gray-900">
                                            {prod.dimensions?.width} {prod.dimensions?.unit}
                                          </span>
                                        </div>
                                        {prod.bf && (
                                          <div className="flex justify-between">
                                            <span className="font-bold text-gray-500">BF:</span>
                                            <span className="font-bold text-gray-900">{prod.bf}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between">
                                          <span className="font-bold text-gray-500">Bag Size:</span>
                                          <span className="font-bold text-gray-900">{prod.bagSize}</span>
                                        </div>
                                        {prod.color && (
                                          <div className="flex justify-between">
                                            <span className="font-bold text-gray-500">Color:</span>
                                            <span className="font-bold text-gray-900">{prod.color}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span className="font-bold text-gray-500">Dimensions:</span>
                                          <span className="font-bold text-gray-900">
                                            {prod.dimensions?.length} × {prod.dimensions?.width} × {prod.dimensions?.height} {prod.dimensions?.unit}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    {prod.convertedQuantity && (
                                      <div className="flex justify-between bg-amber-50 p-1.5 rounded border border-amber-100">
                                        <span className="font-bold text-amber-800">
                                          {isRoll ? "Weight (kg):" : "Bags (pcs):"}
                                        </span>
                                        <span className="font-bold text-amber-950">{prod.convertedQuantity}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-dashed border-gray-150 text-[11px]">
                                      <span className="font-bold text-emerald-800">Available Stock:</span>
                                      <span className="font-bold text-emerald-700">{availStock} {prod.unit}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] pb-1">
                                      <span className="font-bold text-gray-500">Stock Status:</span>
                                      {availStock >= prod.quantity ? (
                                        <span className="text-green-650 bg-green-50 px-1 rounded border border-green-150">In Stock</span>
                                      ) : (
                                        <span className="text-amber-700 bg-amber-50 px-1 rounded border border-amber-100">Shortage ({prod.quantity - availStock} {prod.unit})</span>
                                      )}
                                    </div>
                                    <div className="flex justify-between pt-1.5 border-t border-dashed border-gray-150">
                                      <span className="font-bold text-gray-800">Base Price:</span>
                                      <span className="font-bold text-gray-900">₹{Number(prod.basePrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-emerald-800">
                                      <span>Total Cost:</span>
                                      <span>
                                        ₹{(Number(prod.quantity) * Number(prod.basePrice || 0)).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-gray-150 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={resetManualOrderForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl">
                    Create Order
                  </Button>
                </div>
              </form>
            );
          })()}
        </Modal>

        <Modal
          isOpen={showEditModal}
          title="Edit Order Details"
          onClose={resetEditOrderForm}
        >
          {(() => {
            const selProd = productItems.find(p => String(p?._id || p?.id || "").trim() === editOrderForm.productId);
            const isManualRoll = !!(selProd?.category?.toLowerCase().includes("roll") || editOrderForm.productCategory?.toLowerCase().includes("roll"));

            const isOrderPaid = editingOrder?.paymentStatusKey === "PAID" || editingOrder?.paymentStatus === "Paid";

            return (
              <form onSubmit={handleUpdateOrderSubmit} className="space-y-5">
                {isOrderPaid && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800 flex items-start gap-2.5 shadow-sm">
                    <span>⚠️</span>
                    <div>
                      <p>Order is fully Paid</p>
                      <p className="mt-0.5 text-xs text-amber-700 font-medium">
                        Product specifications, quantities, units, and dimension properties cannot be changed on fully paid orders.
                      </p>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Update Order Details</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Modify any order fields below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <User2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-bold text-gray-800">Customer details</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editOrderForm.customerName}
                        onChange={(e) => handleEditFormChange("customerName", e.target.value)}
                        placeholder="Customer Name"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={editOrderForm.businessName}
                        onChange={(e) => handleEditFormChange("businessName", e.target.value)}
                        placeholder="Business Name"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editOrderForm.phone}
                        onChange={(e) => handleEditFormChange("phone", e.target.value)}
                        placeholder="Phone"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editOrderForm.email}
                        onChange={(e) => handleEditFormChange("email", e.target.value)}
                        placeholder="Email"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Source
                      </label>
                      <input
                        type="text"
                        value={editOrderForm.source}
                        onChange={(e) => handleEditFormChange("source", e.target.value)}
                        placeholder="Source"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {editOrderForm.orderDetailsList && editOrderForm.orderDetailsList.length > 1 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Product Specifications ({editOrderForm.orderDetailsList.length} Items)</p>
                    {editOrderForm.orderDetailsList.map((item, index) => {
                      const selProdItem = productItems.find(p => String(p?._id || p?.id || "").trim() === item.productId);
                      const isItemRoll = !!(selProdItem?.category?.toLowerCase().includes("roll") || item.productCategory?.toLowerCase().includes("roll"));
                      
                      return (
                        <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-4 shadow-3xs">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <span className="text-xs font-extrabold text-emerald-800 uppercase">Item #{index + 1}: {selProdItem?.name || "Product"}</span>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-semibold text-gray-600">
                                Product <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={item.productId}
                                disabled={isOrderPaid}
                                onChange={(e) => {
                                  const prodId = e.target.value;
                                  const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === prodId);
                                  const isRollCategory = prod?.category?.toLowerCase().includes("roll");
                                  const newList = [...editOrderForm.orderDetailsList];
                                  newList[index] = {
                                    ...newList[index],
                                    productId: prodId,
                                    productCategory: prod?.category || "",
                                    length: prod?.dimensions?.length || "",
                                    width: prod?.dimensions?.width || "",
                                    height: prod?.dimensions?.height || "",
                                    dimensionUnit: prod?.dimensions?.unit || "inch",
                                    gsm: prod?.gsm || "",
                                    color: prod?.color || "",
                                    bagSize: prod?.bagSize || "",
                                    unit: isRollCategory ? "kg" : "pcs",
                                  };
                                  setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                                required
                              >
                                <option value="">Select Product</option>
                                {productItems.map((product) => (
                                  <option key={product._id || product.id} value={product._id || product.id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-gray-600">
                                Order Quantity <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  disabled={isOrderPaid}
                                  onChange={(e) => {
                                    const newList = [...editOrderForm.orderDetailsList];
                                    newList[index].quantity = e.target.value;
                                    setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                  }}
                                  placeholder="Quantity"
                                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                  required
                                />
                                <select
                                  value={item.unit}
                                  disabled={isOrderPaid}
                                  onChange={(e) => {
                                    const newList = [...editOrderForm.orderDetailsList];
                                    newList[index].unit = e.target.value;
                                    setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                  }}
                                  className="w-[70px] rounded-xl border border-gray-200 bg-white px-1 py-2 text-xs outline-none focus:border-emerald-500"
                                >
                                  {isItemRoll ? (
                                    <>
                                      <option value="kg">kg</option>
                                      <option value="m">m</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="pcs">pcs</option>
                                      <option value="kg">kg</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-gray-600">
                                Dimension Unit
                              </label>
                              <select
                                value={item.dimensionUnit || "inch"}
                                disabled={isOrderPaid}
                                onChange={(e) => {
                                  const newList = [...editOrderForm.orderDetailsList];
                                  newList[index].dimensionUnit = e.target.value;
                                  setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                              >
                                <option value="inch">Inch</option>
                                <option value="cm">CM</option>
                                <option value="mm">MM</option>
                              </select>
                            </div>

                            {!isItemRoll ? (
                              <>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">
                                    Bag Size <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={item.bagSize}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].bagSize = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 text-gray-900 font-medium"
                                    required
                                  >
                                    <option value="">Select Size</option>
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">
                                    Color
                                  </label>
                                  <select
                                    value={item.color}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].color = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                  >
                                    <option value="">Select color</option>
                                    <option value="Brown">Brown</option>
                                    <option value="White">White</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Length <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={item.length}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].length = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Width <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={item.width}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].width = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Height <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={item.height}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].height = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">GSM <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={item.gsm}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].gsm = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Width <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={item.width}
                                    disabled={isOrderPaid}
                                    onChange={(e) => {
                                      const newList = [...editOrderForm.orderDetailsList];
                                      newList[index].width = e.target.value;
                                      setEditOrderForm(prev => ({ ...prev, orderDetailsList: newList }));
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-bold text-gray-800">Product Specifications</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editOrderForm.productId}
                          disabled={isOrderPaid}
                          onChange={(e) => {
                            const prodId = e.target.value;
                            const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === prodId);
                            const isRollCategory = prod?.category?.toLowerCase().includes("roll");
                            setEditOrderForm(prev => ({
                              ...prev,
                              productId: prodId,
                              productCategory: prod?.category || "",
                              length: prod?.dimensions?.length || "",
                              width: prod?.dimensions?.width || "",
                              height: prod?.dimensions?.height || "",
                              dimensionUnit: prod?.dimensions?.unit || "inch",
                              gsm: prod?.gsm || "",
                              color: prod?.color || prev.color || "",
                              bagSize: prod?.bagSize || prev.bagSize || "",
                              unit: isRollCategory ? "kg" : "pcs",
                              calculationMode: "auto",
                              convertedQuantity: "",
                            }));
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="">Select Product</option>
                          {productItems.map((product) => (
                            <option key={product._id || product.id} value={product._id || product.id}>
                              {product.name} {product.sku ? `(${product.sku})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          Order Quantity <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={editOrderForm.quantity}
                            disabled={isOrderPaid}
                            onChange={(e) => handleEditFormChange("quantity", e.target.value)}
                            placeholder="Quantity"
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            required
                          />
                          <select
                            value={editOrderForm.unit || (isManualRoll ? "kg" : "pcs")}
                            disabled={isOrderPaid}
                            onChange={(e) => handleEditFormChange("unit", e.target.value)}
                            className="w-[90px] rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          >
                            {isManualRoll ? (
                              <>
                                <option value="kg">kg</option>
                                <option value="m">meter</option>
                              </>
                            ) : (
                              <>
                                <option value="pcs">pcs</option>
                                <option value="kg">kg</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      {((!isManualRoll && editOrderForm.unit === "kg") || (isManualRoll && editOrderForm.unit === "m")) && (
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-l-4 border-amber-500 bg-amber-50/50 p-4 rounded-xl">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Unit Conversion Mode
                            </label>
                            <select
                              value={editOrderForm.calculationMode || "auto"}
                              disabled={isOrderPaid}
                              onChange={(e) =>
                                handleEditFormChange("calculationMode", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              <option value="auto">Auto via Formula</option>
                              <option value="manual">Enter Manually</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              {isManualRoll ? "Equivalent Weight (kg)" : "Equivalent Quantity (pcs)"}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editOrderForm.convertedQuantity || ""}
                              onChange={(e) =>
                                handleEditFormChange("convertedQuantity", e.target.value)
                              }
                              placeholder={isManualRoll ? "Equivalent kg" : "Equivalent bags"}
                              disabled={editOrderForm.calculationMode !== "manual" || isOrderPaid}
                              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
                                (editOrderForm.calculationMode === "manual" && !isOrderPaid)
                                  ? "border-emerald-300 bg-white focus:border-emerald-500"
                                  : "border-gray-200 bg-gray-100/80 text-gray-500 cursor-not-allowed"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          {isManualRoll ? "Width Unit" : "Dimension Unit"}
                        </label>
                        <select
                          value={editOrderForm.dimensionUnit}
                          disabled={isOrderPaid}
                          onChange={(e) => handleEditFormChange("dimensionUnit", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          <option value="inch">Inch</option>
                          <option value="cm">CM</option>
                          <option value="mm">MM</option>
                          <option value="ft">Feet</option>
                        </select>
                      </div>

                      {isManualRoll ? (
                        <>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              GSM <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editOrderForm.gsm}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("gsm", e.target.value)}
                              placeholder="GSM"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Width <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editOrderForm.width}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("width", e.target.value)}
                              placeholder="Width"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Bag Size <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={editOrderForm.bagSize}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("bagSize", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 font-medium"
                              required
                            >
                              <option value="">Select Size</option>
                              <option value="Small">Small</option>
                              <option value="Medium">Medium</option>
                              <option value="Large">Large</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Color
                            </label>
                            <select
                              value={editOrderForm.color}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("color", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              <option value="">Select color</option>
                              <option value="Brown">Brown</option>
                              <option value="White">White</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Length <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editOrderForm.length}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("length", e.target.value)}
                              placeholder="Length"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Width <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editOrderForm.width}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("width", e.target.value)}
                              placeholder="Width"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Height <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editOrderForm.height}
                              disabled={isOrderPaid}
                              onChange={(e) => handleEditFormChange("height", e.target.value)}
                              placeholder="Height"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-gray-100 p-4">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editOrderForm.notes}
                    onChange={(e) => handleEditFormChange("notes", e.target.value)}
                    placeholder="Notes"
                    className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50/20 p-4">
                  <label className="mb-2 block text-xs font-bold text-gray-700">
                    Reason for Edit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editOrderForm.editReason || ""}
                    onChange={(e) => handleEditFormChange("editReason", e.target.value)}
                    placeholder="Provide a clear explanation for this modification (e.g. customer requested dimension adjustment)..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={resetEditOrderForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl">
                    Save Changes
                  </Button>
                </div>
              </form>
            );
          })()}
        </Modal>

        <Modal
          isOpen={showDeliveryModal}
          title="Update Delivery & Dispatch Details"
          onClose={() => {
            setShowDeliveryModal(false);
            setDeliveryTargetOrder(null);
          }}
        >
          {deliveryTargetOrder && (
            <form onSubmit={handleSaveDeliveryDetails} className="space-y-4">
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-sm font-bold text-gray-900">{deliveryTargetOrder.customerName}</p>
                <p className="text-xs text-gray-600">
                  {deliveryTargetOrder.productCategory} · Qty {deliveryTargetOrder.orderDetails?.quantity || deliveryTargetOrder.quantity}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.receiverName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverName: e.target.value })}
                    placeholder="Enter receiver's name"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Receiver Phone
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.receiverPhone}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="Enter phone number"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Delivery Mode
                  </label>
                  <select
                    value={deliveryForm.deliveryMode}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryMode: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 text-gray-900 font-medium"
                  >
                    <option value="courier">Courier</option>
                    <option value="transport">Transport</option>
                    <option value="pickup">Pickup</option>
                    <option value="self">Self Delivery</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={deliveryForm.deliveryDate}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      Dispatch Date
                    </label>
                    <input
                      type="date"
                      value={deliveryForm.dispatchDate}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, dispatchDate: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryForm.deliveryAddress}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })}
                    placeholder="Enter full shipping/delivery address"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 text-gray-900 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Delivery Notes
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryForm.deliveryNotes}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                    placeholder="Any specific delivery instructions..."
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setDeliveryTargetOrder(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl"
                >
                  Update Details
                </Button>
              </div>
            </form>
          )}
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

                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-750">Fulfillment Mode:</span>
                    <div className="flex gap-1 bg-gray-200/60 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setQuotationMode("AUTO")}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          quotationMode === "AUTO"
                            ? "bg-white text-emerald-700 shadow-xs"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Smart Stock Match
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuotationMode("RAW_ONLY")}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          quotationMode === "RAW_ONLY"
                            ? "bg-white text-emerald-700 shadow-xs"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Production BOM (Manufacture)
                      </button>
                    </div>
                  </div>

                  {(() => {
                    let suggestedTotal = 0;
                    const itemsBreakdown = [];

                    if (quotationPricing?.perProductResults && quotationPricing.perProductResults.length > 0) {
                      for (const pr of quotationPricing.perProductResults) {
                        const itemQty = Number(pr.quantity || 0);
                        const itemStockQty = Number(pr.canFulfillFromStock || 0);
                        const itemRequiredProd = Number(pr.requiredFromProduction || 0);
                        const itemProdCost = (Number(pr.totalOrderMaterialCost || 0) / (itemQty || 1)) * itemRequiredProd;
                        const pObj = productItems.find(p => String(p?._id || p?.id || "").trim() === String(pr.productId || "").trim());
                        const itemStockUnitPrice = pr.stockItem?.sellingPricePerUnit || pr.stockItem?.basePrice || pObj?.basePrice || 8;
                        const itemStockVal = itemStockQty * itemStockUnitPrice;
                        suggestedTotal += itemStockVal + itemProdCost;

                        itemsBreakdown.push({
                          productName: pr.productName || pObj?.name || "Product",
                          hsnCode: pObj?.hsnCode || "—",
                          stockQty: itemStockQty,
                          unitPrice: itemStockUnitPrice,
                          prodCost: Number(pr.totalOrderMaterialCost || 0),
                          requiredFromProduction: itemRequiredProd,
                          fullQty: itemQty,
                        });
                      }
                    } else {
                      const stockCovered = Number(quotationPricing?.canFulfillFromStock || 0);
                      const stockUnitPrice = Number(getStockUnitQuotePrice(quotationPricing, quotationOrder) || 0);
                      const fullQty = Number(quotationOrder.orderDetails?.quantity || quotationOrder.quantity || 1) || 1;
                      const requiredFromProduction = Number(quotationPricing?.requiredFromProduction || 0);
                      const prodCost = (Number(quotationPricing?.totalOrderMaterialCost || 0) / (fullQty || 1)) * requiredFromProduction;
                      suggestedTotal = (stockCovered * stockUnitPrice) + prodCost;
                      const pObj = productItems.find(p => 
                        String(p?._id || p?.id || "").trim() === String(quotationOrder.productId || quotationOrder.orderDetails?.productId || "").trim()
                      );

                      itemsBreakdown.push({
                        productName: quotationOrder.productCategory || pObj?.name || "Product",
                        hsnCode: pObj?.hsnCode || "—",
                        stockQty: stockCovered,
                        unitPrice: stockUnitPrice,
                        prodCost: Number(quotationPricing?.totalOrderMaterialCost || 0),
                        requiredFromProduction: requiredFromProduction,
                        fullQty: fullQty,
                      });
                    }

                    return quotationPricing && (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                            Calculated Suggested Price
                          </p>
                          <p className="mt-1.5 text-2.5xl font-bold text-violet-900">
                            ₹{suggestedTotal.toLocaleString("en-IN")}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500 font-medium">
                            Note: This is a suggested total based on materials and stock. You can type any price in the "Total quoted" box below to print in the quotation PDF.
                          </p>
                        </div>

                        <div className="border-t border-violet-100 pt-3">
                          <p className="text-xs font-bold text-gray-900">Pricing Breakdown & Formula:</p>
                          <div className="mt-2 text-xs text-gray-700 space-y-3 bg-white rounded-xl p-3 border border-violet-50">
                            <p className="font-mono text-[10px] text-violet-800 font-bold bg-violet-50 px-2 py-1 rounded inline-block">
                              Formula: (Stock Qty × Stock Sell Price) + Raw Material Cost
                            </p>
                            {itemsBreakdown.map((item, idx) => {
                              const itemRequiredProd = Number(item.requiredFromProduction || 0);
                              const fullQty = Number(item.fullQty || 1) || 1;
                              const prodCostForRequired = (item.prodCost / fullQty) * itemRequiredProd;

                              return (
                                <div key={idx} className="border-t border-violet-100/50 first:border-0 pt-2 first:pt-0">
                                  <p className="font-bold text-[11px] text-violet-950">
                                    {item.productName} {item.hsnCode && item.hsnCode !== "—" ? `(HSN: ${item.hsnCode})` : ""}
                                  </p>
                                  <ul className="list-inside list-disc pl-1 space-y-0.5 text-gray-600 mt-1">
                                    <li>
                                      Stock covered: <span className="font-semibold text-gray-800">{item.stockQty} units</span> (at ₹{item.unitPrice}/unit = ₹{(item.stockQty * item.unitPrice).toLocaleString()})
                                    </li>
                                    <li>
                                      Raw material cost: <span className="font-semibold text-gray-800">₹{item.prodCost.toLocaleString()}</span> (BOM cost for {fullQty} units)
                                    </li>
                                    <li>
                                      Production material cost: <span className="font-semibold text-gray-800">₹{prodCostForRequired.toLocaleString()}</span> (for {itemRequiredProd} units required from production)
                                    </li>
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const isApproved = String(quotationOrder?.quotation?.status || "").toLowerCase() === "approved";
                    const itemBreakdown = getQuotationItemsBreakdown(quotationOrder, quotationPricing, Number(quotationSubtotalInput || 0), productItems);
                    const totalGst = itemBreakdown.reduce((s, r) => s + r.gstAmount, 0);
                    const totalSub = itemBreakdown.reduce((s, r) => s + r.subtotal, 0);

                    return (
                      <>
                        {itemBreakdown.length > 0 && (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2 mb-4 animate-fade-in">
                            <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                              <span>📋</span> Product-wise HSN &amp; GST Breakdown
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-blue-800 text-white font-semibold">
                                    <th className="px-3 py-2 text-left rounded-tl-lg">Product</th>
                                    <th className="px-3 py-2 text-center">HSN Code</th>
                                    <th className="px-3 py-2 text-center">GST %</th>
                                    <th className="px-3 py-2 text-right">Taxable Amt</th>
                                    <th className="px-3 py-2 text-right rounded-tr-lg">GST Amt (₹)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {itemBreakdown.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/60"}>
                                      <td className="px-3 py-2 font-medium text-gray-800">{row.productName}</td>
                                      <td className="px-3 py-2 text-center font-mono text-gray-600">{row.hsnCode}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className="inline-block rounded-full bg-blue-100 text-blue-800 font-bold px-2 py-0.5">{row.gstRate}%</span>
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700">₹{row.subtotal.toFixed(2)}</td>
                                      <td className="px-3 py-2 text-right font-semibold text-blue-900">₹{row.gstAmount.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-blue-200 bg-blue-100/60 font-bold">
                                    <td colSpan={3} className="px-3 py-2 text-right text-gray-700">Total GST Collected:</td>
                                    <td className="px-3 py-2 text-right text-gray-700">₹{totalSub.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right text-blue-900">₹{totalGst.toFixed(2)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Quote Number</label>
                            <input
                              type="text"
                              value={quotationNumberInput}
                              onChange={(e) => setQuotationNumberInput(e.target.value)}
                              placeholder="e.g. QT-1002"
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Subtotal Amount (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={quotationSubtotalInput}
                              onChange={(e) => handleSubtotalChange(e.target.value)}
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">GST/Tax Rate</label>
                            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
                              Product-wise (Auto-applied)
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Total GST (₹) [Calculated]</label>
                            <input
                              type="text"
                              value={`₹${totalGst.toFixed(2)}`}
                              readOnly
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Shipping Charges (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={quotationShippingInput}
                              onChange={(e) => handleShippingChange(e.target.value)}
                              placeholder="0"
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Other Charges (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={quotationOtherInput}
                              onChange={(e) => handleOtherChange(e.target.value)}
                              placeholder="0"
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Total Bill / Quoted (₹) [Calculated]</label>
                            <input
                              type="number"
                              min="0"
                              value={quotationTotalInput}
                              readOnly
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-emerald-800 outline-none disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Valid until</label>
                            <input
                              type="date"
                              value={quotationValidUntil}
                              onChange={(e) => setQuotationValidUntil(e.target.value)}
                              disabled={isApproved}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="showPaymentInfoQuoteModal"
                              checked={showPaymentInfo}
                              onChange={(e) => {
                                setShowPaymentInfo(e.target.checked);
                                localStorage.setItem("nirmalyam_show_payment_info", e.target.checked ? "true" : "false");
                              }}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <label htmlFor="showPaymentInfoQuoteModal" className="text-xs font-bold text-gray-750 cursor-pointer">
                              Show Bank details &amp; Payment info on this quotation
                            </label>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono font-semibold">Configured in Ledgers</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isApproved ? (
                            <>
                              <Button
                                type="button"
                                className="rounded-2xl bg-emerald-700 hover:bg-emerald-800"
                                onClick={() =>
                                  generateQuotationPDF(quotationOrder, quotationPricing, {
                                    totalQuoted: quotationTotalInput,
                                    validUntil: quotationValidUntil,
                                    quotationNumber: quotationNumberInput,
                                    taxRate: quotationTaxRateInput,
                                    shippingCharges: quotationShippingInput,
                                    otherCharges: quotationOtherInput,
                                    subtotalAmount: quotationSubtotalInput,
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
                              <Button
                                type="button"
                                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white ml-auto"
                                onClick={handleRecreateQuotation}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recreate New Quotation
                              </Button>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showBillModal}
          title={`Order Bill / Invoice — ${COMPANY_NAME}`}
          onClose={() => {
            setShowBillModal(false);
            setBillOrder(null);
          }}
        >
          {billOrder && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 animate-fade-in space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{billOrder.customerName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {billOrder.orderDetailsList && billOrder.orderDetailsList.length > 1 ? (
                        <>
                          {billOrder.orderDetailsList.length} Products · Total Qty {billOrder.orderDetailsList.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} pcs
                        </>
                      ) : (
                        <>
                          {billOrder.productCategory} · Qty {billOrder.orderDetails?.quantity} {billOrder.orderDetails?.unit || "pcs"}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">Remaining to Invoice</p>
                    <p className="text-sm font-black text-emerald-950">
                      ₹{Number(Math.max(0, (billOrder.totalAmount || billOrder.quotation?.totalQuoted || 0) - (billOrder.paidAmount || 0))).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-100/65 text-[11px] text-emerald-800 grid grid-cols-2 gap-y-1 gap-x-4">
                  <span>Approved Total: ₹{Number(billOrder.totalAmount || billOrder.quotation?.totalQuoted || 0).toLocaleString()}</span>
                  <span>Approved Subtotal: ₹{Number(billOrder.subtotalAmount || billOrder.quotation?.subtotalAmount || billOrder.totalAmount || 0).toLocaleString()}</span>
                  <span>Approved Tax: {billOrder.taxRate || billOrder.quotation?.taxRate || 0}%</span>
                  <span>Approved Shipping: ₹{Number(billOrder.shippingCharges || billOrder.quotation?.shippingCharges || 0).toLocaleString()}</span>
                  <span>Paid So Far: ₹{Number(billOrder.paidAmount || 0).toLocaleString()}</span>
                  {(billOrder.otherCharges || billOrder.quotation?.otherCharges) > 0 && <span>Approved Other: ₹{Number(billOrder.otherCharges || billOrder.quotation?.otherCharges || 0).toLocaleString()}</span>}
                </div>
              </div>

              {lastReceipt && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-blue-950 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Last Invoiced Installment: {lastReceipt.receiptNumber}</span>
                    </p>
                    <p className="text-blue-700">
                      Amount: <span className="font-bold text-blue-900">₹{Number(lastReceipt.amount).toLocaleString()}</span> · Date: {new Date(lastReceipt.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadReceiptPDF(lastReceipt, "view")}
                      className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 font-semibold transition shadow-sm text-[11px] flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadReceiptPDF(lastReceipt, "download")}
                      className="rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-800 px-3 py-1.5 font-semibold transition shadow-sm text-[11px] flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Invoice Number</label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 font-bold">Payment Mode</label>
                  <select
                    value={billPaymentMode}
                    onChange={(e) => setBillPaymentMode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card / Cheque</option>
                    <option value="invoice">Invoice (Unpaid/Default)</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Invoice Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Payment Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Subtotal Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={billSubtotal}
                    onChange={(e) => setBillSubtotal(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Shipping/Transport Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={billShipping}
                    onChange={(e) => setBillShipping(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={billDiscount}
                    onChange={(e) => setBillDiscount(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Other Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={billOther}
                    onChange={(e) => setBillOther(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPaymentInfoBillModal"
                      checked={showPaymentInfo}
                      onChange={(e) => {
                        setShowPaymentInfo(e.target.checked);
                        localStorage.setItem("nirmalyam_show_payment_info", e.target.checked ? "true" : "false");
                      }}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <label htmlFor="showPaymentInfoBillModal" className="text-xs font-bold text-gray-750 cursor-pointer">
                      Show Bank details &amp; Payment info on this invoice
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono font-semibold">Configured in Ledgers</span>
                </div>
                {(() => {
                    const itemBreakdown = getQuotationItemsBreakdown(billOrder, null, Number(billSubtotal || 0), productItems);
                    const totalGst = itemBreakdown.reduce((s, r) => s + r.gstAmount, 0);
                    const discountVal = Number(billDiscount || 0);
                    const computedGrandTotal = Number((Number(billSubtotal || 0) - discountVal + totalGst + Number(billShipping || 0) + Number(billOther || 0)).toFixed(2));
                    const approvedTotal = Number(billOrder.totalAmount || billOrder.quotation?.totalQuoted || 0);
                    const remainingToInvoiceVal = Number((approvedTotal - Number(billOrder.paidAmount || 0) - computedGrandTotal).toFixed(2));
                    return (
                      <div className="sm:col-span-2 space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Grand Total (₹) [Calculated]</label>
                          <input
                            type="text"
                            value={`₹${computedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            readOnly
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-emerald-800 outline-none"
                          />
                        </div>
                        {remainingToInvoiceVal > 0.01 && (
                          <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800 animate-fade-in">
                            <p className="font-bold flex items-center gap-1 text-amber-900"><span>⚠️ Partial Invoice Detected</span></p>
                            <p className="mt-0.5">Remaining approved order balance to be invoiced later: <span className="font-bold text-amber-950">₹{remainingToInvoiceVal.toLocaleString()}</span></p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>

              {(() => {
                const itemBreakdown = getQuotationItemsBreakdown(billOrder, null, Number(billSubtotal || 0), productItems);
                if (itemBreakdown.length === 0) return null;
                const totalGst = itemBreakdown.reduce((s, r) => s + r.gstAmount, 0);
                const totalSub = itemBreakdown.reduce((s, r) => s + r.subtotal, 0);
                return (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <span>📋</span> Product-wise HSN &amp; GST Breakdown
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-blue-800 text-white">
                            <th className="px-3 py-2 text-left font-semibold rounded-tl-lg">Product</th>
                            <th className="px-3 py-2 text-center font-semibold">HSN Code</th>
                            <th className="px-3 py-2 text-center font-semibold">GST %</th>
                            <th className="px-3 py-2 text-right font-semibold">Taxable Amt</th>
                            <th className="px-3 py-2 text-right font-semibold rounded-tr-lg">GST Amt (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemBreakdown.map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/60"}>
                              <td className="px-3 py-2 font-medium text-gray-800">{row.productName}</td>
                              <td className="px-3 py-2 text-center font-mono text-gray-600">{row.hsnCode}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-block rounded-full bg-blue-100 text-blue-800 font-bold px-2 py-0.5">{row.gstRate}%</span>
                              </td>
                              <td className="px-3 py-2 text-right text-gray-700">₹{row.subtotal.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-blue-900">₹{row.gstAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-blue-200 bg-blue-100/60 font-bold">
                            <td colSpan={3} className="px-3 py-2 text-right text-gray-700">Total GST Collected:</td>
                            <td className="px-3 py-2 text-right text-gray-700">₹{totalSub.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right text-blue-900">₹{totalGst.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Bill/Invoice Notes</label>
                <textarea
                  rows={2}
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {!isBillSaved ? (
                  <Button
                    type="button"
                    className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold w-full"
                    onClick={handleSaveBill}
                  >
                    Save Bill / Invoice
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button
                      type="button"
                      className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
                      onClick={() =>
                        generateBillPDF(billOrder, {
                          billNumber,
                          billDate,
                          billDueDate,
                          billTaxRate,
                          billShipping,
                          billDiscount,
                          billNotes,
                          billSubtotal,
                          billOther
                        })
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Bill
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-green-700 text-white hover:bg-green-800"
                      onClick={handleBillWhatsApp}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Share WhatsApp
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-blue-700 text-white hover:bg-blue-800"
                      onClick={handleBillEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Bill
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={availabilityModalOpen}
          title="Order Availability Check"
          onClose={resetAvailabilityModal}
        >
          <div className="space-y-3.5">
            {availabilityOrder && (
              <>
                {/* Compact Details Header Row */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 shrink-0">
                        {availabilityOrder.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 leading-tight">{availabilityOrder.customerName}</p>
                        <p className="text-[10px] text-gray-500 font-medium leading-tight">{availabilityOrder.productCategory}</p>
                      </div>
                    </div>

                    {/* Multi-product pills or single-product chip */}
                    {(availabilityOrder.orderDetailsList?.length > 1) ? (
                      <div className="flex flex-col gap-1 sm:items-end">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{availabilityOrder.orderDetailsList.length} Products</span>
                        <div className="flex flex-wrap gap-1">
                          {availabilityOrder.orderDetailsList.map((det, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {det.quantity} {det.unit || "pcs"}
                              {det.bagSize ? ` · ${det.bagSize}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-150/60 shadow-xs sm:self-center">
                        <div>
                          <span className="font-semibold text-gray-400">
                            {availabilityOrder.productCategory?.toLowerCase().includes("roll") ? "GSM" : "Size"}:
                          </span>{" "}
                          <span className="font-bold text-gray-800">
                            {availabilityOrder.productCategory?.toLowerCase().includes("roll")
                              ? (availabilityOrder.orderDetails?.gsm || "—")
                              : (availabilityOrder.orderDetails?.bagSize || "—")}
                          </span>
                        </div>
                        <div className="hidden sm:block border-l border-gray-250 h-3" />
                        <div>
                          <span className="font-semibold text-gray-400">
                            {availabilityOrder.productCategory?.toLowerCase().includes("roll") ? "Weight" : "Qty"}:
                          </span>{" "}
                          <span className="font-bold text-gray-800">
                            {availabilityOrder.orderDetails?.quantity || "—"} {availabilityOrder.productCategory?.toLowerCase().includes("roll") ? "kg" : "pcs"}
                          </span>
                        </div>
                        <div className="hidden sm:block border-l border-gray-250 h-3" />
                        <div>
                          <span className="font-semibold text-gray-400">Dims:</span>{" "}
                          <span className="font-bold text-gray-800">
                            {availabilityOrder.productCategory?.toLowerCase().includes("roll")
                              ? `${availabilityOrder.orderDetails?.dimensions?.width || 0} ${availabilityOrder.orderDetails?.dimensions?.unit || "inch"}`
                              : `${availabilityOrder.orderDetails?.dimensions?.length || 0}×${availabilityOrder.orderDetails?.dimensions?.width || 0}×${availabilityOrder.orderDetails?.dimensions?.height || 0} ${availabilityOrder.orderDetails?.dimensions?.unit || "inch"}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Workflow Guide to save vertical space */}
                <details className="group rounded-xl border border-sky-100 bg-sky-50/30">
                  <summary className="flex items-center justify-between cursor-pointer p-2.5 text-xs text-sky-850 select-none font-bold">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="h-3.5 w-3.5 text-sky-700" />
                      <span>Where this step sits in your process (Click to view guide)</span>
                    </div>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-[10px]">▼</span>
                  </summary>
                  <div className="px-3 pb-2.5 pt-1 border-t border-sky-100/60 text-xs text-sky-900">
                    <ol className="list-inside list-decimal space-y-0.5 text-[11px] leading-relaxed">
                      <li>Quotation — price and terms with the customer</li>
                      <li>Order confirmation — agree SKU, qty, delivery (record on the order)</li>
                      <li>
                        <span className="font-semibold text-sky-950">Availability check (this screen)</span> — finished
                        stock + raw material math before you process
                      </li>
                      <li>Process — reserve inventory / start production</li>
                      <li>Complete — dispatch and close</li>
                    </ol>
                    <p className="mt-1.5 flex items-start gap-1 text-[10px] text-sky-800">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Your existing actions (quotation, confirm, process, complete) are unchanged; this only adds clearer numbers for the availability step.</span>
                    </p>
                  </div>
                </details>

                {availabilityResult && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Deduction Mode: {deductionMode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedAvailability(!showAdvancedAvailability)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition cursor-pointer"
                    >
                      {showAdvancedAvailability ? "💡 Hide advanced settings" : "🔧 Advanced settings"}
                    </button>
                  </div>
                )}

                {showAdvancedAvailability && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Choose Deduction Logic Mode
                      </label>
                      <select
                        value={deductionMode}
                        onChange={(e) => setDeductionMode(e.target.value)}
                        className="w-full rounded-xl border border-emerald-250 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500"
                      >
                        <option value="AUTO">AUTO (Search Finished Bags then Raw Materials)</option>
                        <option value="RAW_ONLY">FORCE PRODUCTION (Raw Materials Only)</option>
                        <option value="STOCK_ONLY">FORCE STOCK (Finished Bags Only)</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckOrderAvailability(availabilityOrder)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${checkingOrderId ? "animate-spin" : ""}`} />
                        <span>Apply & Re-Check</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!availabilityOrder) return;
                          setAvailabilityModalOpen(false);
                          openQuotationModal(availabilityOrder);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-750 py-2 text-xs font-bold text-white transition hover:bg-violet-850 cursor-pointer"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        <span>Open Quotation</span>
                      </button>
                    </div>
                  </div>
                )}

                {checkingOrderId ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-xs"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">
                          Analyzing inventory with {deductionMode} mode...
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          Calculating material scaling and checking reservations
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : availabilityResult ? (
                  <>
                    {!showAdvancedAvailability ? (
                      <div className="space-y-3">
                        {availabilityResult.productResolved === false ? (
                          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-center shadow-xs animate-fade-in space-y-1">
                            <span className="text-3xl">🔗</span>
                            <h3 className="text-sm font-bold text-indigo-900">Product Not Matched</h3>
                            <p className="text-xs text-indigo-700 font-semibold">
                              {availabilityResult.message || "Please edit the order or link it in catalog."}
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Premium Compact Status Alerts */}
                            {availabilityResult.enoughStock ? (
                              <div className="rounded-xl border border-emerald-250 bg-emerald-50/70 p-3.5 flex items-center gap-3 animate-fade-in shadow-xs">
                                <span className="text-3xl leading-none">
                                  {Number(availabilityResult.canFulfillFromStock || 0) >= Number(availabilityResult.requiredQty || 0) ? "📦" : "🏭"}
                                </span>
                                <div>
                                  <h3 className="text-sm font-black text-emerald-950 leading-tight">
                                    {Number(availabilityResult.canFulfillFromStock || 0) >= Number(availabilityResult.requiredQty || 0)
                                      ? "Ready from Stock!"
                                      : "Production Ready!"}
                                  </h3>
                                  <p className="text-[11px] text-emerald-700 font-bold leading-snug">
                                    {Number(availabilityResult.canFulfillFromStock || 0) >= Number(availabilityResult.requiredQty || 0)
                                      ? "We have all finished units in stock. Fulfill order immediately!"
                                      : "We have all raw materials. You can start production immediately!"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 flex items-center gap-3 animate-fade-in shadow-xs">
                                <span className="text-3xl leading-none">⚠️</span>
                                <div>
                                  <h3 className="text-sm font-black text-red-950 leading-tight">Materials Missing!</h3>
                                  <p className="text-[11px] text-red-755 font-bold leading-snug">
                                    We need to buy some raw materials first. Check the shopping list below.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Compact Side-by-side Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-emerald-50/40 p-3 text-center border border-emerald-100 shadow-2xs">
                                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">📦 Ready on Shelf</p>
                                <p className="mt-1 text-2xl font-black text-emerald-950 leading-tight">
                                  {availabilityResult.canFulfillFromStock} <span className="text-[11px] font-semibold text-emerald-700">units</span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">Bags/rolls in inventory</p>
                              </div>
                              <div className="rounded-xl bg-blue-50/40 p-3 text-center border border-blue-100 shadow-2xs">
                                <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">🏭 Make in Factory</p>
                                <p className="mt-1 text-2xl font-black text-blue-950 leading-tight">
                                  {availabilityResult.requiredFromProduction} <span className="text-[11px] font-semibold text-blue-700">units</span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-blue-600 font-medium">Need to manufacture</p>
                              </div>
                            </div>

                            {(() => {
                              const missingMats = availabilityResult.materialRequirements?.filter(m => !m.isAvailable) || [];
                              if (missingMats.length > 0) {
                                return (
                                  <div className="rounded-2xl border border-dashed border-red-200 bg-white p-3 space-y-2">
                                    <h4 className="text-xs font-black text-red-955 flex items-center gap-1.5">
                                      🛒 Shopping List (Need to Buy)
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-medium">Please buy the following amounts of missing raw materials:</p>
                                    <ul className="space-y-1.5">
                                      {missingMats.map((mat, i) => {
                                        const usable = mat.availableStockAtCheck != null ? Number(mat.availableStockAtCheck) : 0;
                                        const shortfall = Math.max(0, Number(mat.totalQuantity) - usable);
                                        return (
                                          <li key={i} className="flex items-center justify-between rounded-xl bg-red-50/30 px-3 py-2 text-xs font-bold text-red-950 border border-red-100/50">
                                            <span>❌ {mat.name}</span>
                                            <span className="bg-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-red-800">
                                              Need {shortfall.toFixed(2)} {mat.unit || 'kg'} more
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              } else if (!availabilityResult.enoughStock) {
                                return (
                                  <div className="rounded-2xl border border-dashed border-red-200 bg-white p-3 space-y-2">
                                    <h4 className="text-xs font-black text-red-955 flex items-center gap-1.5">
                                      📦 Need Finished Stock
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-medium">We don't have enough finished units in stock:</p>
                                    <ul className="space-y-1.5">
                                      <li className="flex items-center justify-between rounded-xl bg-red-50/30 px-3 py-2 text-xs font-bold text-red-950 border border-red-100/50">
                                        <span>❌ Finished Goods</span>
                                        <span className="bg-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-red-850">
                                          Need {Number(availabilityResult.requiredQty || 0) - Number(availabilityResult.canFulfillFromStock || 0)} more units
                                        </span>
                                      </li>
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {((!availabilityResult.enoughStock && availabilityResult.canFulfillFromStock > 0) || useAvailableStock) && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs animate-fade-in">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={useAvailableStock}
                                    onChange={(e) => {
                                      handleCheckOrderAvailability(availabilityOrder, e.target.checked);
                                    }}
                                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <div>
                                    <p className="text-xs font-extrabold text-amber-950 leading-none">
                                      "Use This Stock" Override Option
                                    </p>
                                    <p className="mt-1 text-[11px] text-amber-800 leading-normal font-medium">
                                      Reserve available <strong>{availabilityResult.canFulfillFromStock}</strong> finished units. Remaining shortage triggers manual alert.
                                    </p>
                                  </div>
                                </label>
                              </div>
                            )}

                            {/* Per-product breakdown for multi-product orders */}
                            {availabilityResult.perProductResults?.length > 1 && (
                              <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 space-y-2 animate-fade-in">
                                <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                                  📋 Per-Product Stock Breakdown
                                </h4>
                                <div className="space-y-2">
                                  {availabilityResult.perProductResults.map((pr, idx) => (
                                    <div key={idx} className={`rounded-lg border p-2.5 flex items-center justify-between ${pr.isAvailable ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                                      <div>
                                        <p className="text-xs font-bold text-gray-900">{pr.productName || `Product ${idx + 1}`}</p>
                                        <p className="text-[10px] text-gray-500">{pr.quantity} {pr.unit || "pcs"}{pr.bagSize ? ` · ${pr.bagSize}` : ""}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${pr.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                          {pr.isAvailable ? "✅ Ready" : "⚠️ Shortage"}
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                          Stock: {pr.canFulfillFromStock} | Factory: {pr.requiredFromProduction}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-blue-700 font-medium flex items-center gap-1">
                                  💡 Total combined cost: ₹{Number(availabilityResult.totalOrderMaterialCost || 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`overflow-hidden rounded-3xl border shadow-sm ${availabilityResult.productResolved === false
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
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${availabilityResult.productResolved === false
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
                                  className={`text-base font-bold ${availabilityResult.productResolved === false
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
                                  className={`mt-1 text-sm ${availabilityResult.productResolved === false
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
                              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm ${availabilityResult.productResolved === false
                                ? "bg-indigo-600"
                                : availabilityResult.enoughStock
                                  ? "bg-emerald-600"
                                  : "bg-amber-600"
                                }`}
                            >
                              <span>
                                {availabilityResult.productResolved === false
                                  ? "UNRESOLVED"
                                  : availabilityResult.enoughStock
                                    ? "PASSED"
                                    : "INSUFFICIENT"}
                              </span>
                            </div>
                          </div>

                          {availabilityResult.productResolved !== false && (
                            <div className="mt-4 border-t border-slate-100/60 pt-4 text-xs font-semibold text-gray-800">
                              <p className="mb-2 text-slate-500 uppercase tracking-wider text-[10px]">Order Details checked:</p>
                              <ul className="list-inside list-disc space-y-1 text-slate-800">
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

                          {((!availabilityResult.enoughStock && availabilityResult.canFulfillFromStock > 0) || useAvailableStock) && (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm animate-fade-in">
                              <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={useAvailableStock}
                                  onChange={(e) => {
                                    handleCheckOrderAvailability(availabilityOrder, e.target.checked);
                                  }}
                                  className="mt-1 h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                  <p className="text-sm font-bold text-amber-900">
                                    "Use This Stock" Override Option
                                  </p>
                                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                                    Check this to reserve the available <strong>{availabilityResult.canFulfillFromStock}</strong> finished units. 
                                    The remaining shortage (<strong>{Number(availabilityResult.requiredQty || 0) - Number(availabilityResult.canFulfillFromStock || 0)}</strong> units) 
                                    will trigger an urgent alert notification on the stocks page for manual stock addition.
                                  </p>
                                </div>
                              </label>
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
                              {availabilityResult.canFulfillFromStock > 0 && (() => {
                                const stockUnitPrice = getStockUnitQuotePrice(availabilityResult, availabilityOrder);
                                return (
                                  <p className="mt-1.5 text-xs font-semibold text-emerald-600">
                                    Est. Price: ₹{(availabilityResult.canFulfillFromStock * stockUnitPrice).toLocaleString()}
                                    <span className="text-[10px] text-gray-400 font-normal block mt-0.5">(₹{stockUnitPrice}/unit)</span>
                                  </p>
                                );
                              })()}
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
                              className={`rounded-2xl border px-4 py-4 shadow-sm ${Number(availabilityResult.onDemandCount || 0) > 0
                                ? "border-rose-200 bg-rose-50/50"
                                : "border-slate-100 bg-white"
                                }`}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                BOM lines short on stock
                              </p>
                              <p
                                className={`mt-2 text-2xl font-bold ${Number(availabilityResult.onDemandCount || 0) > 0
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
                                          <table className="w-full text-left text-xs">
                                    <thead className="bg-white/80 text-[10px] font-semibold uppercase text-slate-500">
                                      <tr>
                                        <th className="px-3 py-2">Product</th>
                                        <th className="px-3 py-2">Color</th>
                                        <th className="px-3 py-2">Size</th>
                                        <th className="px-3 py-2 text-right">Avail.</th>
                                        <th className="px-3 py-2">Note</th>
                                        <th className="px-3 py-2 text-center">Action</th>
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
                                          <td className="px-3 py-2 text-center">
                                            <button
                                              type="button"
                                              onClick={() => handleQuickMatchStock(alt)}
                                              className="inline-flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-amber-600 transition shadow-sm cursor-pointer"
                                            >
                                              ⚡ Align & Use
                                            </button>
                                          </td>
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
                    )}

                    {availabilityOrder?.isConfirmed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-rose-200 bg-rose-50/20 p-6 shadow-sm space-y-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900">
                              Order is Already Confirmed
                            </h3>
                            <p className="text-xs text-gray-500">
                              Stock has been reserved and allocated for this order. To release the stock and return the order to pending status, click below.
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-150 bg-slate-50/70 p-4 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Fulfillment Details
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-gray-700">
                            <p><strong>Fulfillment Mode:</strong> {availabilityOrder.orderStatus === "Completed" || availabilityOrder.orderStatus === "Delivered" ? "Dispatched" : "Reserved Stock"}</p>
                            <p><strong>Approved Total:</strong> ₹{Number(availabilityOrder.totalAmount || 0).toLocaleString()}</p>
                            <p><strong>Paid So Far:</strong> ₹{Number(availabilityOrder.paidAmount || 0).toLocaleString()}</p>
                            {availabilityOrder.confirmedAt && <p><strong>Confirmed At:</strong> {new Date(availabilityOrder.confirmedAt).toLocaleString()}</p>}
                          </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-100 pt-5">
                          <Button
                            type="button"
                            className="rounded-2xl bg-red-700 hover:bg-red-800 px-6 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                            onClick={handleUnconfirmExistingOrder}
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Unconfirm & Release Stock</span>
                          </Button>
                        </div>
                      </motion.div>
                    ) : availabilityResult.enoughStock && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">
                                Confirm Order Details
                              </h3>
                              <p className="text-xs text-gray-500">
                                Select fulfillment path and confirm payment/delivery details.
                              </p>
                            </div>
                          </div>

                          {/* Fulfillment Path Selection Selector */}
                          <div className="flex rounded-xl bg-gray-100 p-1 shrink-0 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => setConfirmPath("reserve")}
                              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                confirmPath === "reserve"
                                  ? "bg-white text-emerald-800 shadow-sm"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Reserve Stock</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmPath("dispatch")}
                              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                confirmPath === "dispatch"
                                  ? "bg-white text-emerald-800 shadow-sm"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              <Truck className="h-3.5 w-3.5" />
                              <span>Dispatch Directly</span>
                            </button>
                          </div>
                        </div>

                        {/* Payment & Invoice Summary */}
                        <div className="rounded-2xl border border-gray-150 bg-slate-50/70 p-4 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Invoice & Payment Summary
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold">
                            <div className="rounded-xl bg-white p-3 border border-gray-100">
                              <p className="text-[10px] uppercase font-bold text-gray-400">Total Invoice Amount</p>
                              <p className="mt-1 text-lg font-black text-slate-800">
                                ₹{Number(confirmOrderForm.totalAmount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 border border-gray-100">
                              <p className="text-[10px] uppercase font-bold text-gray-400">Paid So Far</p>
                              <p className="mt-1 text-lg font-black text-emerald-700">
                                ₹{Number(availabilityOrder.paidAmount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 border border-gray-100">
                              <p className="text-[10px] uppercase font-bold text-gray-400">Remaining Balance</p>
                              <p className={`mt-1 text-lg font-black ${
                                (Number(confirmOrderForm.totalAmount || 0) - Number(availabilityOrder.paidAmount || 0) - Number(confirmOrderForm.paidAmount || 0)) <= 0
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }`}>
                                ₹{Math.max(0, Number(confirmOrderForm.totalAmount || 0) - Number(availabilityOrder.paidAmount || 0) - Number(confirmOrderForm.paidAmount || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Record Payment Advance Inputs */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                              {confirmPath === "dispatch" ? "Payment Recorded Now (₹)" : "Advance Paid Now (₹)"}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={confirmOrderForm.paidAmount}
                              onChange={(e) =>
                                handleConfirmOrderChange("paidAmount", e.target.value)
                              }
                              placeholder="0"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
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
                        </div>

                        {/* Delivery details path ONLY for Dispatch path */}
                        {confirmPath === "dispatch" && (
                          <div className="border-t border-gray-100 pt-5 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              <Truck className="h-4.5 w-4.5 text-emerald-600" />
                              <span>Dispatch & Delivery Information</span>
                            </h4>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  On-site Contact Person Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={confirmOrderForm.receiverName}
                                  onChange={(e) =>
                                    handleConfirmOrderChange("receiverName", e.target.value)
                                  }
                                  placeholder="Enter name"
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  On-site Contact Person Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={confirmOrderForm.receiverPhone}
                                  onChange={(e) =>
                                    handleConfirmOrderChange("receiverPhone", e.target.value)
                                  }
                                  placeholder="Enter phone number"
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
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

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="mb-2 block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                    Delivery Date <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={confirmOrderForm.deliveryDate}
                                    onChange={(e) =>
                                      handleConfirmOrderChange("deliveryDate", e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-emerald-500"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                    Dispatch Date <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={confirmOrderForm.dispatchDate}
                                    onChange={(e) =>
                                      handleConfirmOrderChange("dispatchDate", e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-emerald-500"
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  Delivery Address <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                  rows={3}
                                  value={confirmOrderForm.deliveryAddress}
                                  onChange={(e) =>
                                    handleConfirmOrderChange("deliveryAddress", e.target.value)
                                  }
                                  placeholder="Enter delivery address"
                                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  Delivery Notes <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={confirmOrderForm.deliveryNotes}
                                  onChange={(e) =>
                                    handleConfirmOrderChange("deliveryNotes", e.target.value)
                                  }
                                  placeholder="Special delivery instructions"
                                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-gray-100 pt-5">
                          {confirmPath === "reserve" ? (
                            <Button
                              type="button"
                              className="rounded-2xl bg-green-900 px-6 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                              onClick={handleConfirmExistingOrder}
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Confirm & Reserve Stock</span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="rounded-2xl bg-emerald-700 px-6 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
                              onClick={handleConfirmExistingOrder}
                            >
                              <Truck className="h-4 w-4" />
                              <span>Save & Dispatch Order</span>
                            </Button>
                          )}
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
                  {selectedOrder.orderDetailsList && selectedOrder.orderDetailsList.length > 1 ? (
                    <div className="space-y-3.5">
                      {selectedOrder.orderDetailsList.map((item, idx) => {
                        const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
                        const pName = prod?.name || item.productName || item.productCategory || selectedOrder.productCategory || "Product";
                        const isItemRoll = pName.toLowerCase().includes("roll") || String(item.unit).toLowerCase() === "kg" || String(item.unit).toLowerCase() === "m";
                        const hsnCode = item.hsnCode || prod?.hsnCode;
                        const gstRate = item.gstRate != null ? item.gstRate : prod?.gstRate;
                        return (
                          <div key={idx} className="rounded-xl border border-gray-200/60 bg-white p-3 shadow-3xs">
                            <h4 className="font-extrabold text-xs text-emerald-800 mb-1.5">Item {idx + 1}: {pName}</h4>
                            <div className="space-y-1.5 text-xs text-gray-700">
                              <p><span className="font-semibold text-gray-500">Bag Size:</span> {item.bagSize || "—"}</p>
                              <p><span className="font-semibold text-gray-500">Color:</span> {item.color || "—"}</p>
                              <p><span className="font-semibold text-gray-500">Quantity:</span> {item.quantity} {item.unit || "pcs"}</p>
                              <p>
                                <span className="font-semibold text-gray-500">Dimensions:</span>{" "}
                                {item.dimensions?.length || 0} ×{" "}
                                {item.dimensions?.width || 0} ×{" "}
                                {item.dimensions?.height || 0}{" "}
                                {item.dimensions?.unit || "inch"}
                              </p>
                              {hsnCode && (
                                <p><span className="font-semibold text-emerald-700">HSN Code:</span> <span className="font-mono font-bold text-emerald-800">{hsnCode}</span></p>
                              )}
                              {gstRate != null && (
                                <p><span className="font-semibold text-emerald-700">GST Rate:</span> <span className="font-bold text-emerald-800">{gstRate}%</span></p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-700">
                      {(() => {
                        const singleItem = selectedOrder.orderDetails || {};
                        const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(singleItem?.productId || "").trim());
                        const pName = prod?.name || singleItem?.productName || selectedOrder.productCategory || "Product";
                        const hsnCode = singleItem?.hsnCode || prod?.hsnCode;
                        const gstRate = singleItem?.gstRate != null ? singleItem.gstRate : prod?.gstRate;
                        return (<>
                          <p><span className="font-semibold">Product:</span> {pName}</p>
                          <p><span className="font-semibold">Bag Size:</span> {singleItem?.bagSize || "—"}</p>
                          <p><span className="font-semibold">Color:</span> {singleItem?.color || "—"}</p>
                          <p><span className="font-semibold">Quantity:</span> {singleItem?.quantity || "—"}</p>
                          <p>
                            <span className="font-semibold">Dimensions:</span>{" "}
                            {singleItem?.dimensions?.length || 0} ×{" "}
                            {singleItem?.dimensions?.width || 0} ×{" "}
                            {singleItem?.dimensions?.height || 0}{" "}
                            {singleItem?.dimensions?.unit || "inch"}
                          </p>
                          {hsnCode && (
                            <p><span className="font-semibold text-emerald-700">HSN Code:</span> <span className="font-mono font-bold text-emerald-800">{hsnCode}</span></p>
                          )}
                          {gstRate != null && (
                            <p><span className="font-semibold text-emerald-700">GST Rate:</span> <span className="font-bold text-emerald-800">{gstRate}%</span></p>
                          )}
                        </>);
                      })()}
                    </div>
                  )}
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
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-gray-800">Delivery Details</h3>
                      {(!selectedOrder.delivery?.deliveryAddress || selectedOrder.delivery.deliveryAddress === "Not added") && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          ⚠️ Missing Address
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openDeliveryModal(selectedOrder)}
                      className="text-xs font-bold text-violet-750 hover:text-violet-950 transition hover:underline cursor-pointer"
                    >
                      {(!selectedOrder.delivery?.deliveryAddress || selectedOrder.delivery.deliveryAddress === "Not added") ? "Add Address" : "Edit"}
                    </button>
                  </div>
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
              className="relative h-screen w-full max-w-4xl overflow-y-auto bg-slate-50 shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Workspace</h2>
                  <button onClick={() => setShowDetailPanel(false)} className="text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                  {selectedOrder.orderStatusKey !== "COMPLETED" && selectedOrder.orderStatusKey !== "DELIVERED" && selectedOrder.orderStatusKey !== "CANCELLED" && (
                    <Button
                      type="button"
                      className="rounded-2xl bg-indigo-600 px-4 py-2 hover:bg-indigo-700 text-white"
                      onClick={() => handleEditOrder(selectedOrder)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Order
                    </Button>
                  )}

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

                  {selectedOrder.orderStatusKey === "COMPLETED" && (
                    <Button
                      type="button"
                      className="rounded-2xl bg-teal-600 px-4 py-2 hover:bg-teal-700 text-white font-bold"
                      onClick={() => handleMarkAsDelivered(selectedOrder)}
                      disabled={deliveredActionId === selectedOrder.id}
                    >
                      {deliveredActionId === selectedOrder.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Package className="mr-2 h-4 w-4" />
                      )}
                      Mark as Delivered
                    </Button>
                  )}

                  {selectedOrder.orderStatusKey !== "CANCELLED" && selectedOrder.paymentStatusKey !== "PAID" && (
                    <Button
                      type="button"
                      className="rounded-2xl bg-amber-600 px-4 py-2 hover:bg-amber-700"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  )}

                  {selectedOrder.orderStatusKey !== "COMPLETED" && selectedOrder.orderStatusKey !== "DELIVERED" && selectedOrder.orderStatusKey !== "CANCELLED" && (
                    <Button
                      type="button"
                      className="rounded-2xl bg-red-650 px-4 py-2 hover:bg-red-750 text-white"
                      onClick={() => {
                        setCancelOrderTarget(selectedOrder);
                        setCancellationReasonInput("");
                        setShowCancelModal(true);
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}                </div>

                <OrderDetail order={selectedOrder} onEditDelivery={openDeliveryModal} />

                <div className="mt-8 border-t border-gray-200 pt-8 space-y-6">
                  <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                    <h3 className="text-lg font-bold">Activity Logs (Updations & Payments)</h3>
                    <p className="mt-1 text-xs text-slate-300 opacity-90">
                      Audit history of payment recordings, state reversions, and order specifications modifications
                    </p>
                  </div>

                  {/* Date Filters */}
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-gray-200 p-3 rounded-2xl mb-4 text-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter Logs by Date:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">From</span>
                      <input
                        type="date"
                        value={logStartDate}
                        max={logEndDate || undefined}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (logEndDate && val > logEndDate) {
                            toast.error("'From' date cannot be after 'To' date");
                            return;
                          }
                          setLogStartDate(val);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">To</span>
                      <input
                        type="date"
                        value={logEndDate}
                        min={logStartDate || undefined}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (logStartDate && val < logStartDate) {
                            toast.error("'To' date cannot be before 'From' date");
                            return;
                          }
                          setLogEndDate(val);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    {(logStartDate || logEndDate) && (
                      <button
                        onClick={() => { setLogStartDate(""); setLogEndDate(""); }}
                        className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {buildFilteredActivityLogs(selectedOrder).map((log, index) => {
                      const canRestore = selectedOrder.orderStatusKey !== "COMPLETED" && selectedOrder.orderStatusKey !== "DELIVERED" && selectedOrder.orderStatusKey !== "CANCELLED";

                      if (log.type === "update") {
                        return (
                          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                                    🔄 {log.title}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 font-medium">
                                  <span className="font-semibold text-gray-800">Updated by:</span> {log.by}
                                </p>
                                <p className="mt-1 text-sm text-gray-600 font-medium">
                                  <span className="font-semibold text-gray-800">Reason:</span> {log.reason}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs text-gray-500 font-semibold">
                                  {new Date(log.time).toLocaleString()}
                                </span>
                                {canRestore && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const reason = window.prompt("Enter reason/note for restoring this snapshot:");
                                      if (reason === null) return;
                                      if (!reason.trim()) {
                                        toast.error("Reason is required to revert state");
                                        return;
                                      }
                                      handleRestoreState(selectedOrder.id, log.snapshotId, reason);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition shadow-sm border border-teal-200"
                                  >
                                    Restore State
                                  </button>
                                )}
                              </div>
                            </div>

                            {log.changes && log.changes.length > 0 ? (
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Changed fields:</p>
                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-semibold">
                                  {log.changes.map((changeStr, cIdx) => (
                                    <li key={cIdx}>{changeStr}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">
                                No specification details changed (metadata or note edit).
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // workflow type
                        return (
                          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <span className="rounded-full bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                  {log.title}
                                </span>
                                <p className="mt-2 text-sm text-gray-750 font-semibold">{log.description}</p>
                              </div>
                              <span className="text-xs text-gray-500 font-semibold">
                                {new Date(log.time).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onClick={() => setShowDetailPanel(false)}>
                    Close
                  </Button>
                </div>
                {selectedOrder?.id === "__legacy_drawer__" && (
                  <>
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

                      {selectedOrder.orderDetailsList && selectedOrder.orderDetailsList.length > 1 ? (
                        <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-emerald-600" />
                            <p className="text-xs font-semibold uppercase text-gray-500">Order Items Details ({selectedOrder.orderDetailsList.length})</p>
                          </div>
                          
                          <div className="space-y-3">
                            {selectedOrder.orderDetailsList.map((item, idx) => {
                              const pObj = productItems.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
                              const pName = pObj?.name || item.productCategory || selectedOrder.productCategory || "Product";
                              const isItemRoll = pName.toLowerCase().includes("roll") || String(item.unit).toLowerCase() === "kg" || String(item.unit).toLowerCase() === "m";

                              return (
                                <div key={idx} className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                                    <p className="text-xs font-bold text-emerald-800">Item #{idx + 1}: {pName}</p>
                                    <span className="rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                      {item.quantity} {item.unit || "pcs"}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                                    {!isItemRoll && (
                                      <>
                                        <p><span className="text-gray-500 font-semibold">Size:</span> {item.bagSize || "—"}</p>
                                        <p><span className="text-gray-500 font-semibold">Color:</span> {item.color || "—"}</p>
                                      </>
                                    )}
                                    {isItemRoll && (
                                      <>
                                        {Number(item.gsm) > 0 && <p><span className="text-gray-500 font-semibold">GSM:</span> {item.gsm}</p>}
                                        {Number(item.bf) > 0 && <p><span className="text-gray-500 font-semibold">BF:</span> {item.bf}</p>}
                                      </>
                                    )}
                                    <p className="col-span-2">
                                      <span className="text-gray-500 font-semibold">Dimensions:</span>{" "}
                                      {isItemRoll
                                        ? `Width: ${item.dimensions?.width || 0} ${item.dimensions?.unit || "inch"}`
                                        : `${item.dimensions?.length || 0} × ${item.dimensions?.width || 0} × ${item.dimensions?.height || 0} ${item.dimensions?.unit || "inch"}`}
                                    </p>
                                    <p className="col-span-2">
                                      <span className="text-gray-500 font-semibold">Custom Printing:</span> {item.customPrinting ? "Yes" : "No"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <>
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

                          {/* HSN Code & GST Rate panel for single-item order */}
                          {(() => {
                            const singleItem = selectedOrder.orderDetails;
                            const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(singleItem?.productId || "").trim());
                            const hsnCode = singleItem?.hsnCode || prod?.hsnCode;
                            const gstRate = singleItem?.gstRate != null ? singleItem.gstRate : prod?.gstRate;
                            if (!hsnCode && gstRate == null) return null;
                            return (
                              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                  <span className="text-emerald-700 font-bold text-xs">🏷️</span>
                                  <p className="text-xs font-semibold uppercase text-emerald-700">Tax Classification</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {hsnCode && (
                                    <div className="rounded-xl bg-white border border-emerald-100 p-3">
                                      <p className="text-xs font-semibold text-gray-500">HSN Code</p>
                                      <p className="mt-1 font-mono font-bold text-emerald-800">{hsnCode}</p>
                                    </div>
                                  )}
                                  {gstRate != null && (
                                    <div className="rounded-xl bg-white border border-emerald-100 p-3">
                                      <p className="text-xs font-semibold text-gray-500">GST Rate</p>
                                      <p className="mt-1 font-bold text-emerald-800">{gstRate}%</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}

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
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {actionDrawerType && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => {
                setActionDrawerType(null);
                setActiveTrackerOrderId(null);
              }}
            />

            <motion.div
              className="relative h-screen w-full max-w-2xl bg-slate-50 shadow-2xl flex flex-col z-50"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
            >
              {/* Drawer Header */}
              <div className="p-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {actionDrawerType === "QUOTATIONS_NEEDED" && "Quotations Needed"}
                    {actionDrawerType === "CONFIRM_ORDERS" && "Review & Confirm Orders"}
                    {actionDrawerType === "TRACK_PRODUCTION" && "Production Stock Tracker"}
                    {actionDrawerType === "RETURNED_ORDERS" && "Returned Orders History"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {actionDrawerType === "QUOTATIONS_NEEDED" && "Select a pending order to configure & send price quote"}
                    {actionDrawerType === "CONFIRM_ORDERS" && "Review payment slabs, receiver specs and confirm order"}
                    {actionDrawerType === "TRACK_PRODUCTION" && "Monitor raw material stock levels and print production notes"}
                    {actionDrawerType === "RETURNED_ORDERS" && "View return details and download returned amount receipts"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActionDrawerType(null);
                    setActiveTrackerOrderId(null);
                  }}
                  className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(() => {
                  let filteredList = [];
                  if (actionDrawerType === "QUOTATIONS_NEEDED") {
                    filteredList = formattedOrders.filter((o) => {
                      const hasQuotation =
                        !!o?.quotation?.quotationNumber ||
                        ["sent", "approved"].includes(String(o?.quotation?.status || "").toLowerCase());
                      return o?.orderStatusKey === "PENDING" && !hasQuotation;
                    });
                  } else if (actionDrawerType === "CONFIRM_ORDERS") {
                    filteredList = formattedOrders.filter(
                      (o) => o?.orderStatusKey === "PENDING" &&
                        o?.quotation &&
                        ["sent", "approved"].includes(String(o?.quotation?.status || "").toLowerCase())
                    );
                  } else if (actionDrawerType === "TRACK_PRODUCTION") {
                    filteredList = formattedOrders.filter((o) => o?.orderStatusKey === "PROCESSING");
                  } else if (actionDrawerType === "RETURNED_ORDERS") {
                    filteredList = formattedOrders.filter((o) => o?.orderStatus === "Returned" || (o?.returns && o?.returns?.length > 0));
                  }

                  if (filteredList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-150 p-6">
                        <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 mb-3">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800">All caught up!</h4>
                        <p className="text-xs text-gray-500 mt-1">No orders require this action right now.</p>
                      </div>
                    );
                  }

                  return filteredList.map((order) => {
                    const isExpanded = activeTrackerOrderId === order.id;
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition-all duration-200 overflow-hidden"
                      >
                        <div
                          onClick={() => {
                            if (actionDrawerType === "QUOTATIONS_NEEDED") {
                              setActionDrawerType(null);
                              openQuotationModal(order);
                            } else if (actionDrawerType === "CONFIRM_ORDERS") {
                              setActionDrawerType(null);
                              handleCheckOrderAvailability(order);
                            } else if (actionDrawerType === "TRACK_PRODUCTION" || actionDrawerType === "RETURNED_ORDERS") {
                              setActiveTrackerOrderId(isExpanded ? null : order.id);
                            }
                          }}
                          className="p-4 cursor-pointer hover:bg-gray-50/50 flex items-center justify-between select-none"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-extrabold text-emerald-950">
                                {order.customerName}
                              </span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                {order.productCategory}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-500">
                              <span>Order ID: <b>{order.shortId || order.id?.substring(0, 8)}</b></span>
                              <span>•</span>
                              <span>Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {actionDrawerType === "TRACK_PRODUCTION" || actionDrawerType === "RETURNED_ORDERS" ? (
                              <button
                                type="button"
                                className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline"
                              >
                                {actionDrawerType === "RETURNED_ORDERS" 
                                  ? (isExpanded ? "Hide Return Logs ▲" : "View Return Logs ▼")
                                  : (isExpanded ? "Hide Details ▲" : "Track Production Details ▼")
                                }
                              </button>
                            ) : (
                              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-105 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>

                        {actionDrawerType === "TRACK_PRODUCTION" && isExpanded && (
                          <div className="p-4 bg-slate-50/50 border-t border-gray-150 space-y-4">
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                                Production Material Requirements
                              </h4>
                              
                              {(() => {
                                const orderItems = order.orderDetailsList && order.orderDetailsList.length > 0
                                  ? order.orderDetailsList
                                  : [order.orderDetails].filter(Boolean);

                                if (orderItems.length === 0) {
                                  return <p className="text-xs text-gray-500">No item details added for this order.</p>;
                                }

                                return orderItems.map((item, detIdx) => {
                                  const catalogProd = productItems.find(
                                    (p) => String(p._id || p.id).trim() === String(item.productId || "").trim()
                                  );

                                  const matchedMaterials = catalogProd?.rawMaterials || [];

                                  return (
                                    <div key={detIdx} className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-900">
                                          {item.productCategory || order.productCategory} ({item.quantity} {item.unit || "pcs"})
                                        </p>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                                          {item.bagSize || (item.gsm ? `${item.gsm} GSM` : "No size")}
                                        </span>
                                      </div>

                                      {matchedMaterials.length === 0 ? (
                                        <p className="text-[11px] text-gray-500 italic">
                                          No raw materials mapped in product catalog.
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {matchedMaterials.map((rm, rmIdx) => {
                                            const dbRm = rawMaterials.find(
                                              (m) =>
                                                String(m._id || m.id).trim() === String(rm.rawMaterialId || "").trim() ||
                                                m.name?.toLowerCase().trim() === rm.rawMaterialName?.toLowerCase().trim()
                                            );

                                            const requiredQtyPerBag = Number(rm.requiredQuantityPerBag || 0);
                                            const totalRequired = requiredQtyPerBag * Number(item.quantity || 0);
                                            const availableStock = dbRm ? Number(dbRm.availableStock || 0) : 0;
                                            const isAvailable = availableStock >= totalRequired;
                                            const progressPercent = Math.min(100, (availableStock / (totalRequired || 1)) * 100);

                                            return (
                                              <div key={rmIdx} className="space-y-1.5 text-xs">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <p className="font-semibold text-gray-900">
                                                      {rm.rawMaterialName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                      BOM: {requiredQtyPerBag} {rm.unit}/bag
                                                    </p>
                                                  </div>
                                                  <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                      {totalRequired.toFixed(2)} {rm.unit} req.
                                                    </p>
                                                    <p className={`text-[10px] font-bold ${isAvailable ? "text-emerald-600" : "text-amber-600"}`}>
                                                      Stock: {availableStock.toFixed(2)} {rm.unit} ({isAvailable ? "OK" : "Shortage"})
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                  <div
                                                    className={`h-full rounded-full ${isAvailable ? "bg-emerald-500" : "bg-amber-400"}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="rounded-xl text-xs py-1.5"
                                onClick={() => {
                                  setActionDrawerType(null);
                                  setSelectedOrder(order);
                                  setShowDetailPanel(true);
                                }}
                              >
                                View Full Order Workspace
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-xl text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                  setActionDrawerType(null);
                                  handleCompleteOrder(order);
                                }}
                              >
                                Complete Production
                              </Button>
                            </div>
                          </div>
                        )}

                        {actionDrawerType === "RETURNED_ORDERS" && isExpanded && (
                          <div className="p-4 bg-slate-50/50 border-t border-gray-150 space-y-4">
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                                Return Transactions & Receipts
                              </h4>
                              {order.returns && order.returns.length > 0 ? (
                                <div className="space-y-3">
                                  {order.returns.map((ret, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div>
                                        <p className="font-bold text-gray-950 text-sm">{ret.returnNumber}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Date: {new Date(ret.returnedAt).toLocaleDateString("en-IN")}</p>
                                        <p className="text-xs text-gray-600 mt-1.5"><span className="font-semibold text-gray-500">Reason:</span> {ret.notes || "No remarks"}</p>
                                      </div>
                                      <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs">
                                          -₹{(Number(ret.refundAmount || 0) + Number(ret.gstRefundAmount || 0)).toLocaleString("en-IN")}
                                        </span>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => generateReturnReceiptPDF(order, ret, "view")}
                                            className="rounded-lg flex items-center gap-1 hover:bg-gray-150 text-xs px-2.5 py-1"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View</span>
                                          </Button>
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => generateReturnReceiptPDF(order, ret, "download")}
                                            className="rounded-lg flex items-center gap-1 hover:bg-gray-150 text-xs px-2.5 py-1"
                                          >
                                            <Download className="w-3.5 h-3.5 text-red-600" />
                                            <span className="text-red-650">Download</span>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic">No detailed return transaction lines registered on order database record.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ── Record Payment Modal ───────────────────────────────────── */}
      <Modal
        isOpen={showPaymentModal}
        title="Record Payment"
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentForm({ amount: "", paymentMode: "cash", note: "" });
        }}
      >
        {selectedOrder && (
          <form onSubmit={handleRecordPayment} className="space-y-5">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Payment for {selectedOrder.customerName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Invoice: <span className="font-semibold">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    {" · "}Paid so far: <span className="font-semibold text-emerald-700">₹{(selectedOrder.paidAmount || 0).toLocaleString()}</span>
                    {" · "}Balance: <span className="font-semibold text-red-600">₹{Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0)).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Slabs Helper */}
            <div className="space-y-1.5 rounded-2xl border border-gray-150 bg-gray-50 p-4">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quick Slabs / Advance Helper</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const balance = Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0));
                    setPaymentForm((p) => ({ ...p, amount: String(Number((balance * 0.5).toFixed(2))) }));
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-100/50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-150 transition"
                >
                  50% Slab (₹{Math.ceil(Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0)) * 0.5).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const balance = Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0));
                    setPaymentForm((p) => ({ ...p, amount: String(Number((balance * 0.3).toFixed(2))) }));
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-100/50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-150 transition"
                >
                  30% Slab (₹{Math.ceil(Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0)) * 0.3).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const balance = Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0));
                    setPaymentForm((p) => ({ ...p, amount: String(Number(balance.toFixed(2))) }));
                  }}
                  className="rounded-xl border border-emerald-250 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-150 transition"
                >
                  Clear Balance (₹{Math.ceil(Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.paidAmount || 0))).toLocaleString()})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Payment Mode
                </label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMode: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="e.g. Advance payment via GPay"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-2xl"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentForm({ amount: "", paymentMode: "cash", note: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-2xl bg-amber-600 hover:bg-amber-700"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Record Payment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Cancel Order Modal ────────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        title="Cancel Order"
        onClose={() => {
          setShowCancelModal(false);
          setCancelOrderTarget(null);
          setCancellationReasonInput("");
          setManualLossInput("");
        }}
      >
        {cancelOrderTarget && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Cancel Order for {cancelOrderTarget.customerName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    This order has status <strong>{cancelOrderTarget.orderStatus}</strong>. Any stock reserved for this order will be safely released back to available inventory.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReasonInput}
                  onChange={(e) => setCancellationReasonInput(e.target.value)}
                  placeholder="Please describe why this order is being cancelled..."
                  rows="4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500 bg-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Manual Cancellation Loss (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={manualLossInput}
                  onChange={(e) => setManualLossInput(e.target.value)}
                  placeholder="Defaults to calculated materials cost if empty..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500 bg-white"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-2xl"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelOrderTarget(null);
                  setCancellationReasonInput("");
                  setManualLossInput("");
                }}
              >
                Go Back
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancelOrderSubmit}
                loading={cancelLoading}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

const OrderReturnsWorkspace = ({ axiosInstance, onBack, refetchStats, generateReturnReceiptPDF, downloadReceiptPDF, productItems }) => {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receipts, setReceipts] = useState([]);
  
  // Return form states
  const [returnType, setReturnType] = useState("complete"); // complete, partial
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: boolean }
  const [returnQuantities, setReturnQuantities] = useState({}); // { [productId]: number }
  const [refundType, setRefundType] = useState("full"); // full, partial
  const [customRefundAmount, setCustomRefundAmount] = useState("");
  const [gstType, setGstType] = useState("complete"); // complete, custom
  const [customGstRate, setCustomGstRate] = useState("18");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const handleReceiptAction = (rec, mode = "download") => {
    if (rec.paymentMode === "refund") {
      // Map standard receipt to returnDetails format expected by generateReturnReceiptPDF
      const returnDetails = {
        returnNumber: rec.receiptNumber,
        returnedAt: rec.paidAt || rec.createdAt,
        items: rec.orderDetailsList || [],
        refundAmount: rec.amount,
        gstRefundAmount: rec.amount - (rec.amount / 1.18),
        gstRate: rec.gstRate || 18,
        notes: rec.note || "Return transaction receipt"
      };
      
      if (Array.isArray(rec.orderDetailsList) && rec.orderDetailsList.length > 0) {
        let totalBase = 0;
        let totalGst = 0;
        rec.orderDetailsList.forEach(it => {
          const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(it.productId || "").trim());
          const taxInfo = getProductTaxInfo(prod || it);
          const gstRate = it.gstRate != null ? Number(it.gstRate) : taxInfo.gstRate;
          const lineQty = Number(it.quantity || 0);
          const lineUnitPrice = Number(it.unitPrice || 0) || (rec.amount / (rec.orderDetailsList.length || 1));
          const lineTotal = lineQty * lineUnitPrice;
          const lineBase = lineTotal / (1 + gstRate / 100);
          totalBase += lineBase;
          totalGst += (lineTotal - lineBase);
        });
        returnDetails.refundAmount = Number(totalBase.toFixed(2));
        returnDetails.gstRefundAmount = Number(totalGst.toFixed(2));
      }
      
      generateReturnReceiptPDF(selectedOrder, returnDetails, mode);
    } else {
      if (typeof downloadReceiptPDF === "function") {
        downloadReceiptPDF(rec, mode);
      } else {
        toast.error("Receipt PDF download helper not found.");
      }
    }
  };

  const handleShareWhatsAppForReceipt = (rec) => {
    const isRefund = rec.paymentMode === "refund";
    const text = isRefund 
      ? `*Nirmalyam Krafts - Return Receipt*\n\n*Return Ref:* ${rec.receiptNumber || rec.returnNumber || "—"}\n*Amount:* ₹${(rec.amount || 0).toLocaleString()}\n*Customer:* ${rec.customerName || selectedOrder?.customerName}`
      : `*Nirmalyam Krafts - Payment Receipt*\n\n*Receipt Ref:* ${rec.receiptNumber}\n*Amount:* ₹${(rec.amount || 0).toLocaleString()}\n*Customer:* ${rec.customerName || selectedOrder?.customerName}`;
    const targetPhone = rec.phone || selectedOrder?.phone || "";
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetchEligibleOrders();
  }, []);

  const fetchEligibleOrders = async () => {
    setLoadingOrders(true);
    try {
      const resp = await axiosInstance.get("/orders?limit=100");
      if (resp.data.success) {
        const filtered = (resp.data.data.orders || resp.data.data || []).filter(
          o => o.orderStatus === "Completed" || o.orderStatus === "Delivered" || o.orderStatus === "Returned"
        );
        setCompletedOrders(filtered);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load completed/delivered orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      setReceipts([]);
      return;
    }
    const orderObj = completedOrders.find(o => o.id === selectedOrderId || o._id === selectedOrderId);
    setSelectedOrder(orderObj);
    fetchOrderReceipts(selectedOrderId);
    
    // Initialize item selection / quantities
    if (orderObj) {
      const lines = orderObj.orderDetailsList?.length > 0 
        ? orderObj.orderDetailsList 
        : [orderObj.orderDetails].filter(Boolean);
        
      // Aggregate already returned quantities from order.returns array
      const returnedQtyMap = {};
      if (Array.isArray(orderObj.returns)) {
        orderObj.returns.forEach(ret => {
          if (Array.isArray(ret.items)) {
            ret.items.forEach(it => {
              const pIdStr = String(it.productId?._id || it.productId || "").trim();
              returnedQtyMap[pIdStr] = (returnedQtyMap[pIdStr] || 0) + Number(it.quantity || 0);
            });
          }
        });
      }

      const selMap = {};
      const qtyMap = {};
      lines.forEach(line => {
        const pId = String(line.productId?._id || line.productId || "").trim();
        const maxQty = Number(line.quantity || 0);
        const alreadyReturned = Number(returnedQtyMap[pId] || 0);
        const remainingQty = Math.max(0, maxQty - alreadyReturned);

        qtyMap[pId] = remainingQty;
        selMap[pId] = remainingQty > 0;
      });
      setSelectedItems(selMap);
      setReturnQuantities(qtyMap);
    }
  }, [selectedOrderId, completedOrders]);

  const fetchOrderReceipts = async (ordId) => {
    try {
      const resp = await axiosInstance.get("/receipts");
      if (resp.data.success) {
        const filtered = (resp.data.data.receipts || resp.data.data || []).filter(
          r => r.orderId === ordId || r.orderId?._id === ordId
        );
        setReceipts(filtered);
      }
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const getOrderLines = () => {
    if (!selectedOrder) return [];
    return selectedOrder.orderDetailsList?.length > 0 
      ? selectedOrder.orderDetailsList 
      : [selectedOrder.orderDetails].filter(Boolean);
  };

  const getRemainingQty = (line) => {
    if (!selectedOrder || !line) return 0;
    const pId = String(line.productId?._id || line.productId || "").trim();
    const maxQty = Number(line.quantity || 0);
    
    let alreadyReturned = 0;
    if (Array.isArray(selectedOrder.returns)) {
      selectedOrder.returns.forEach(ret => {
        if (Array.isArray(ret.items)) {
          ret.items.forEach(it => {
            const pIdStr = String(it.productId?._id || it.productId || "").trim();
            if (pIdStr === pId) {
              alreadyReturned += Number(it.quantity || 0);
            }
          });
        }
      });
    }
    return Math.max(0, maxQty - alreadyReturned);
  };

  // Compute exact per-line GST-inclusive allocations using the GST-rate linear system.
  // For 2 unique GST-rate groups: solves exactly using:
  //   S1 + S2 = subtotal  AND  S1*(1+r1) + S2*(1+r2) = totalPaid
  // Within each group, selling-price weighting distributes the group subtotal.
  const getLineAllocations = (lines) => {
    if (!selectedOrder || !lines?.length) return {};
    const orderSubtotal = Number(selectedOrder.subtotalAmount || 0);
    const totalPaid = Number(selectedOrder.totalPaidAmount || selectedOrder.totalInvoiceAmount || selectedOrder.totalAmount || 0);

    // Enrich each line with gstRate and selling-price weight
    const enriched = lines.map(line => {
      const pId = String(line.productId?._id || line.productId || "").trim();
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === pId);
      const taxInfo = getProductTaxInfo(prod || line);
      const gstRate = line.gstRate != null ? Number(line.gstRate) : taxInfo.gstRate;
      // Prefer selling price over cost/base price for weighting
      const sellPrice = Number(
        prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice ||
        prod?.basePrice || line.unitPrice || line.sellingPrice || 0
      ) || 1;
      const weight = Number(line.quantity || 0) * sellPrice;
      return { pId, gstRate, weight, quantity: Number(line.quantity || 0) };
    });

    // Group by GST rate
    const groups = {};
    enriched.forEach(d => {
      if (!groups[d.gstRate]) groups[d.gstRate] = { totalWeight: 0, members: [] };
      groups[d.gstRate].totalWeight += d.weight;
      groups[d.gstRate].members.push(d);
    });
    const rates = Object.keys(groups).map(Number);

    // Solve for per-group subtotals
    let groupSubtotals = {};
    if (rates.length === 1) {
      groupSubtotals[rates[0]] = orderSubtotal;
    } else if (rates.length === 2) {
      // Exact solution: S1*(1+r1/100) + S2*(1+r2/100) = totalPaid, S1+S2 = orderSubtotal
      const [r1, r2] = rates;
      const denom = (r1 - r2) / 100;
      if (Math.abs(denom) < 1e-9) {
        groupSubtotals[r1] = orderSubtotal; groupSubtotals[r2] = 0;
      } else {
        const S1 = (totalPaid - orderSubtotal * (1 + r2 / 100)) / denom;
        const S2 = orderSubtotal - S1;
        groupSubtotals[r1] = Math.max(0, S1);
        groupSubtotals[r2] = Math.max(0, S2);
      }
    } else {
      // 3+ groups: use selling-price weighted share of subtotal per group
      const totalW = enriched.reduce((s, d) => s + d.weight, 0) || 1;
      rates.forEach(r => {
        groupSubtotals[r] = orderSubtotal * (groups[r].totalWeight / totalW);
      });
    }

    // Allocate each line's subtotal within its group
    const result = {};
    enriched.forEach(d => {
      const grp = groups[d.gstRate];
      const groupSubtotal = groupSubtotals[d.gstRate] || 0;
      const withinFrac = grp.totalWeight > 0 ? (d.weight / grp.totalWeight) : (1 / grp.members.length);
      const lineSubtotal = groupSubtotal * withinFrac;
      const lineGstIncl = lineSubtotal * (1 + d.gstRate / 100);
      const unitPaidPrice = d.quantity > 0 ? (lineGstIncl / d.quantity) : 0;
      result[d.pId] = { subtotal: lineSubtotal, gstIncl: lineGstIncl, unitPaidPrice, gstRate: d.gstRate };
    });
    return result;
  };

  // Proportional base price calculator — works from exact GST-rate-based line allocations
  const calculateSuggestedProportionalRefund = () => {
    if (!selectedOrder) return 0;
    const lines = getOrderLines();
    const allocs = getLineAllocations(lines);
    let total = 0;
    lines.forEach(line => {
      const pId = String(line.productId?._id || line.productId || "").trim();
      if (returnType === "complete" || selectedItems[pId]) {
        const retQty = returnType === "complete" ? getRemainingQty(line) : Number(returnQuantities[pId] || 0);
        if (retQty <= 0) return;
        const alloc = allocs[pId];
        total += retQty * (alloc?.unitPaidPrice || 0);
      }
    });
    return Number(total.toFixed(2));
  };

  const getRefundSubtotal = () => {
    if (refundType === "full") return calculateSuggestedProportionalRefund();
    return Number(customRefundAmount || 0);
  };

  // GST is EXTRACTED from within the GST-inclusive refund (not added on top)
  const getRefundGstAmount = () => {
    if (!selectedOrder) return 0;
    const lines = getOrderLines();
    const allocs = getLineAllocations(lines);

    if (gstType === "complete") {
      let totalGst = 0;
      lines.forEach(line => {
        const pId = String(line.productId?._id || line.productId || "").trim();
        if (returnType === "complete" || selectedItems[pId]) {
          const retQty = returnType === "complete" ? getRemainingQty(line) : Number(returnQuantities[pId] || 0);
          if (retQty <= 0) return;
          const alloc = allocs[pId];
          if (!alloc) return;
          const lineGrossRefund = retQty * alloc.unitPaidPrice;
          // Extract GST portion from within the GST-inclusive total
          const gstPortion = lineGrossRefund * (alloc.gstRate / (100 + alloc.gstRate));
          totalGst += gstPortion;
        }
      });
      return Number(totalGst.toFixed(2));
    }

    // Custom GST: extract from the entered amount
    const subtotal = getRefundSubtotal();
    const rate = Number(customGstRate || 0);
    return Number((subtotal * (rate / (100 + rate))).toFixed(2));
  };

  const getRefundGstBreakdown = () => {
    if (!selectedOrder) return {};
    const lines = getOrderLines();
    const allocs = getLineAllocations(lines);
    const breakdown = {};

    lines.forEach(line => {
      const pId = String(line.productId?._id || line.productId || "").trim();
      if (returnType === "complete" || selectedItems[pId]) {
        const retQty = returnType === "complete" ? getRemainingQty(line) : Number(returnQuantities[pId] || 0);
        if (retQty <= 0) return;
        const alloc = allocs[pId];
        if (!alloc) return;
        const lineGrossRefund = retQty * alloc.unitPaidPrice;
        const gstPortion = lineGrossRefund * (alloc.gstRate / (100 + alloc.gstRate));

        const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === pId);
        const taxInfo = getProductTaxInfo(prod || line);
        const lineHsn = line.hsnCode || taxInfo.hsnCode || "—";
        const key = `${lineHsn}_${alloc.gstRate}`;
        if (!breakdown[key]) breakdown[key] = { hsnCode: lineHsn, gstRate: alloc.gstRate, gstAmount: 0 };
        breakdown[key].gstAmount += gstPortion;
      }
    });

    Object.values(breakdown).forEach(b => { b.gstAmount = Number(b.gstAmount.toFixed(2)); });
    return breakdown;
  };

  const handleCheckboxChange = (pId) => {
    setSelectedItems(prev => ({
      ...prev,
      [pId]: !prev[pId]
    }));
  };

  const handleQuantityChange = (pId, val, max) => {
    const num = Math.min(max, Math.max(1, Number(val || 0)));
    setReturnQuantities(prev => ({
      ...prev,
      [pId]: num
    }));
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setSubmitting(true);
    const loadingToast = toast.loading("Processing return...");
    try {
      // Aggregate already returned quantities from order.returns array
      const returnedQtyMap = {};
      if (Array.isArray(selectedOrder.returns)) {
        selectedOrder.returns.forEach(ret => {
          if (Array.isArray(ret.items)) {
            ret.items.forEach(it => {
              const pIdStr = String(it.productId?._id || it.productId || "").trim();
              returnedQtyMap[pIdStr] = (returnedQtyMap[pIdStr] || 0) + Number(it.quantity || 0);
            });
          }
        });
      }

      const lines = getOrderLines();
      const returnItems = [];
      lines.forEach(line => {
        const pId = String(line.productId?._id || line.productId || "").trim();
        const maxQty = Number(line.quantity || 0);
        const alreadyReturned = Number(returnedQtyMap[pId] || 0);
        const remainingQty = Math.max(0, maxQty - alreadyReturned);

        if (returnType === "complete" || selectedItems[pId]) {
          const qtyToReturn = returnType === "complete" ? remainingQty : Number(returnQuantities[pId] || 0);
          if (qtyToReturn > 0) {
            const pObj = productItems?.find(p => String(p?._id || p?.id || "").trim() === pId);
            returnItems.push({
              productId: pId,
              productName: pObj?.name || selectedOrder.productCategory || "Product",
              quantity: qtyToReturn,
              unit: line.unit || "pcs",
              dimensions: line.dimensions,
              color: line.color,
              bagSize: line.bagSize,
              gsm: line.gsm,
            });
          }
        }
      });

      if (returnItems.length === 0) {
        toast.error("Please select at least one item to return.", { id: loadingToast });
        setSubmitting(false);
        return;
      }

      const totalWithGst = getRefundSubtotal();     // GST-inclusive total (e.g. ₹108.02)
      const gstRefundAmount = getRefundGstAmount();  // GST extracted from within (e.g. ₹13.90)
      const refundAmount = Number((totalWithGst - gstRefundAmount).toFixed(2)); // pre-tax base (e.g. ₹94.12)
      const gstRate = gstType === "complete" ? (selectedOrder.taxRate || 18) : Number(customGstRate || 0);

      const payload = {
        items: returnItems,
        refundAmount,
        gstRefundAmount,
        gstRate,
        notes,
        returnType,
      };

      const resp = await axiosInstance.post(`/orders/${selectedOrder._id || selectedOrder.id}/returns`, payload);
      if (resp.data.success) {
        toast.success("Return processed and stock updated! 🎉", { id: loadingToast });
        
        const returnNumber = `RET-${selectedOrder.reference || selectedOrder._id.toString().slice(-6).toUpperCase()}-${(selectedOrder.returns?.length || 0) + 1}`;
        const returnDetails = {
          returnNumber,
          returnedAt: new Date(),
          items: returnItems,
          refundAmount,
          gstRefundAmount,
          gstRate,
          notes,
          customerName: selectedOrder.customerName,
          businessName: selectedOrder.businessName || "",
          phone: selectedOrder.phone,
        };

        setSuccessDetails(returnDetails);

        // Refetch queries
        refetchStats();
      } else {
        toast.error(resp.data.message || "Failed to initiate return.", { id: loadingToast });
      }
    } catch (err) {
      console.error("Error submitting return:", err);
      toast.error(err?.response?.data?.message || "Failed to initiate return.", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!successDetails) return;
    const message = `
*Nirmalyam Krafts - Return Receipt*

*Return Ref:* ${successDetails.returnNumber}
*Date:* ${new Date(successDetails.returnedAt).toLocaleDateString("en-IN")}
*Customer:* ${successDetails.customerName}
*Refund Amount:* ₹${successDetails.refundAmount.toLocaleString()}
*GST Refund Amount:* ₹${successDetails.gstRefundAmount.toLocaleString()}
*Total Refunded:* ₹${(successDetails.refundAmount + successDetails.gstRefundAmount).toLocaleString()}
*Items:* ${successDetails.items.map(it => `${it.productName} (x${it.quantity})`).join(", ")}
*Notes:* ${successDetails.notes || "No notes"}
    `.trim();
    const cleanPhone = String(successDetails.phone || "").replace(/\D/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Return Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-gray-250 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-red-600" />
              Initiate Order Return
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Filter, review, select, and process returns back to stock</p>
          </div>
        </div>
        
        {/* Order Selector */}
        {!successDetails && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Select Eligible Order:</span>
            {loadingOrders ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                <span>Loading completed orders...</span>
              </div>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-red-500 outline-none min-w-[240px] shadow-sm font-medium"
              >
                <option value="">-- Choose Order --</option>
                {completedOrders.map((o) => {
                  const hasReturns = o.orderStatus === "Returned" || (o.returns && o.returns.length > 0);
                  return (
                    <option key={o._id || o.id} value={o._id || o.id} disabled={o.orderStatus === "Returned"}>
                      {o.customerName} ({o.businessName || "No business"}) - #{String(o._id || o.id).slice(-6).toUpperCase()}{hasReturns ? " (Already Returned)" : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        )}
      </div>

      {successDetails ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-150 p-8 shadow-lg text-center space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-emerald-50 p-4 border border-emerald-200 text-emerald-600 animate-bounce">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Return Successfully Initiated!</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Stock levels have been re-assigned to inventory and transaction records have been updated in the financial ledger.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-500">Return Reference:</span>
              <span className="font-bold text-gray-800">{successDetails.returnNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-500">Refunded To:</span>
              <span className="font-bold text-gray-800">{successDetails.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-500">Base Refund:</span>
              <span className="font-semibold text-gray-850">₹{successDetails.refundAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-500">GST Refund:</span>
              <span className="font-semibold text-gray-850">₹{successDetails.gstRefundAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
              <span>Total Refunded:</span>
              <span className="text-red-600">₹{(successDetails.refundAmount + successDetails.gstRefundAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <Button
              onClick={() => generateReturnReceiptPDF(selectedOrder, successDetails, "download")}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <Button
              onClick={() => generateReturnReceiptPDF(selectedOrder, successDetails, "view")}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>View PDF</span>
            </Button>
            <Button
              onClick={handleShareWhatsApp}
              className="py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 sm:col-span-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Receipt via WhatsApp</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100 max-w-md mx-auto">
            <button
              onClick={() => {
                setSuccessDetails(null);
                setSelectedOrderId("");
                onBack();
              }}
              className="text-sm font-bold text-gray-500 hover:text-gray-700 underline"
            >
              Done & Return to Dashboard
            </button>
          </div>
        </div>
      ) : selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order, Quotes, & Receipts snapshot */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                👤 Customer Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400">Name</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Business</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedOrder.businessName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Email</p>
                  <p className="font-semibold text-gray-800 mt-0.5 break-all">{selectedOrder.email || "—"}</p>
                </div>
              </div>
            </div>

            {/* Quotation snapshot */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                📄 Quotation Summary
              </h3>
              {selectedOrder.quotation?.quotationNumber ? (
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Quote No</span>
                    <span className="font-bold text-gray-800">{selectedOrder.quotation.quotationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase">
                      {selectedOrder.quotation.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{(selectedOrder.quotation.subtotalAmount || selectedOrder.subtotalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">GST Rate</span>
                    <span className="font-semibold text-gray-850">{selectedOrder.quotation.taxRate || selectedOrder.taxRate || 0}%</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                    <span>Total Quoted</span>
                    <span>₹{(selectedOrder.quotation.totalQuoted || selectedOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No official quotation found for this order.</p>
              )}
            </div>

            {/* Receipts Snapshot */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                💳 Receipts & Payments
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium font-semibold">Total Paid Amount</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                    ₹{(selectedOrder.paidAmount || selectedOrder.confirmedPayment?.paidAmount || 0).toLocaleString()}
                  </span>
                </div>

                {receipts.length > 0 ? (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detailed Receipts</p>
                    {receipts.map((rec) => {
                      const displayDate = new Date(rec.paidAt || rec.createdAt || Date.now());
                      const isRefund = rec.paymentMode === "refund";
                      return (
                        <div key={rec._id || rec.id} className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-800">{rec.receiptNumber}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {isNaN(displayDate.getTime()) ? "Date N/A" : displayDate.toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isRefund ? "text-red-600" : "text-emerald-600"}`}>
                                {isRefund ? "-" : ""}₹{(rec.amount || 0).toLocaleString()}
                              </p>
                              <p className={`text-[9px] uppercase tracking-widest font-extrabold mt-0.5 px-1.5 py-0.5 rounded-md inline-block ${
                                isRefund 
                                  ? "bg-red-50 text-red-700 border border-red-200" 
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-250"
                              }`}>
                                {rec.paymentMode}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 pt-1.5 border-t border-gray-150">
                            <button
                              type="button"
                              onClick={() => handleReceiptAction(rec, "view")}
                              className="flex-1 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition text-[10px] font-bold text-gray-650 flex items-center justify-center gap-1"
                              title="View PDF Receipt"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReceiptAction(rec, "download")}
                              className="flex-1 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition text-[10px] font-bold text-gray-650 flex items-center justify-center gap-1"
                              title="Download PDF"
                            >
                              <Download className="w-3 h-3 text-emerald-600" />
                              <span>Download</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareWhatsAppForReceipt(rec)}
                              className="flex-1 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition text-[10px] font-bold text-gray-650 flex items-center justify-center gap-1"
                              title="Share via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-green-600" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic pt-2">No receipt logs parsed in system database.</p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Products & specifications */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  📦 Product Specifications
                </h3>
                {returnType === "partial" && (
                  <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Select items to return
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {getOrderLines().map((line, index) => {
                  const pId = String(line.productId?._id || line.productId || "").trim();
                  const pObj = productItems?.find(p => String(p?._id || p?.id || "").trim() === pId);
                  const productName = pObj?.name || selectedOrder.productCategory || "Product";
                  const maxQty = line.quantity || 1;
                  
                  // Compute already returned qty for this line item
                  const returnedQtyMap = {};
                  if (Array.isArray(selectedOrder.returns)) {
                    selectedOrder.returns.forEach(ret => {
                      if (Array.isArray(ret.items)) {
                        ret.items.forEach(it => {
                          const pIdStr = String(it.productId?._id || it.productId || "").trim();
                          returnedQtyMap[pIdStr] = (returnedQtyMap[pIdStr] || 0) + Number(it.quantity || 0);
                        });
                      }
                    });
                  }
                  const alreadyReturned = Number(returnedQtyMap[pId] || 0);
                  const remainingQty = Math.max(0, maxQty - alreadyReturned);
                  const isChecked = selectedItems[pId] || false;

                  return (
                    <div key={index} className={`p-4 rounded-xl border transition-all ${isChecked ? "border-red-200 bg-red-50/10" : "border-gray-200 bg-white"}`}>
                      <div className="flex items-start gap-3">
                        {returnType === "partial" && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={remainingQty <= 0}
                            onChange={() => handleCheckboxChange(pId)}
                            className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-40"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-800 text-sm">{productName}</span>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-gray-500 block">Qty Ordered: {line.quantity} {line.unit || "pcs"}</span>
                              {alreadyReturned > 0 && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                  Already Returned: {alreadyReturned} {line.unit || "pcs"}
                                </span>
                              )}
                              {remainingQty === 0 && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-0.5 inline-block ml-1">
                                  Fully Returned
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-150">
                            <div>
                              <span className="font-semibold text-gray-400">Size:</span> {line.bagSize || "—"}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400">Color:</span> {line.color || "—"}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400">GSM:</span> {line.gsm || "—"}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400">Print:</span> {line.customPrinting ? "Yes" : "No"}
                            </div>
                            {line.dimensions && (
                              <div className="col-span-2">
                                <span className="font-semibold text-gray-400">Dimensions:</span>{" "}
                                {line.dimensions.length || 0} ×{" "}
                                {line.dimensions.width || 0} ×{" "}
                                {line.dimensions.height || 0}{" "}
                                {line.dimensions.dimensionsUnit || line.dimensions.unit || "inch"}
                              </div>
                            )}
                          </div>

                          {returnType === "partial" && isChecked && remainingQty > 0 && (
                            <div className="flex items-center gap-2 pt-2">
                              <span className="text-xs font-bold text-red-700">Qty to Return:</span>
                              <input
                                type="number"
                                min={1}
                                max={remainingQty}
                                value={returnQuantities[pId] || ""}
                                onChange={(e) => handleQuantityChange(pId, e.target.value, remainingQty)}
                                className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-800 focus:border-red-500 outline-none font-bold"
                              />
                              <span className="text-[10px] font-semibold text-gray-500">(Max: {remainingQty} {line.unit || "pcs"})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Refund amount, GST selectors, & submit return */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleSubmitReturn} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                ⚙️ Return Settings
              </h3>

              {/* Return Type Segmented Controls */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Return Type:</span>
                <div className="grid grid-cols-2 gap-2 bg-gray-55 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setReturnType("complete")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${returnType === "complete" ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Complete Return
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType("partial")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${returnType === "partial" ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Partial Return
                  </button>
                </div>
              </div>

              {/* Refund Type */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Refund Amount:</span>
                <div className="grid grid-cols-2 gap-2 bg-gray-55 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRefundType("full")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${refundType === "full" ? "bg-slate-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Suggest Base (₹{calculateSuggestedProportionalRefund().toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundType("partial")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${refundType === "partial" ? "bg-slate-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Custom Refund
                  </button>
                </div>

                {refundType === "partial" && (
                  <div className="pt-2">
                    <input
                      type="number"
                      placeholder="Enter base refund amount"
                      required
                      min={0}
                      value={customRefundAmount}
                      onChange={(e) => setCustomRefundAmount(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-800 focus:border-red-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* GST Type */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">GST Refund Option:</span>
                <div className="grid grid-cols-2 gap-2 bg-gray-55 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setGstType("complete")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${gstType === "complete" ? "bg-slate-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Proportional GST (₹{getRefundGstAmount().toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGstType("custom")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${gstType === "custom" ? "bg-slate-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Custom GST Rate
                  </button>
                </div>

                {gstType === "custom" && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="GST Rate % (e.g. 18)"
                      required
                      min={0}
                      max={100}
                      value={customGstRate}
                      onChange={(e) => setCustomGstRate(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-800 focus:border-red-500 outline-none"
                    />
                    <span className="text-xs font-bold text-gray-500">% = ₹{getRefundGstAmount().toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Refund Summary Calculation */}
              <div className="bg-red-50/30 border border-red-150 p-4 rounded-xl space-y-2 text-sm">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Estimated Refund Total</p>

                {/* Base (pre-tax) */}
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Base Refund (excl. GST):</span>
                  <span className="font-semibold">₹{(getRefundSubtotal() - getRefundGstAmount()).toFixed(2)}</span>
                </div>

                {/* GST Breakdown */}
                {gstType === "complete" ? (
                  <>
                    <div className="flex justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider mt-1 border-t border-dashed border-red-100 pt-1">
                      <span>GST Refund Breakdown:</span>
                    </div>
                    {Object.values(getRefundGstBreakdown()).map((b, i) => (
                      <div key={i} className="flex justify-between text-gray-600 pl-2 text-xs">
                        <span>HSN {b.hsnCode} ({b.gstRate}%):</span>
                        <span className="font-medium">₹{b.gstAmount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-gray-700 font-semibold border-t border-dashed border-red-100 pt-1">
                      <span>Total GST Refund:</span>
                      <span>₹{getRefundGstAmount().toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>GST Refund ({customGstRate}%):</span>
                    <span className="font-semibold">₹{getRefundGstAmount().toLocaleString()}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between border-t-2 border-red-300 pt-2 mt-1 text-gray-900 font-bold text-base">
                  <span>Total Refund (incl. GST):</span>
                  <span className="text-red-700">₹{getRefundSubtotal().toLocaleString()}</span>
                </div>

              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason for Return / Remarks:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Printing mistake, incorrect dimensions delivered"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-red-500 outline-none min-h-[80px]"
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
                    <span>Process Return & Download Receipt</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
            <RotateCcw className="w-16 h-16 text-gray-300 mb-4 animate-pulse" />
            <p className="text-lg font-bold text-gray-800">Select an Order to Return</p>
            <p className="text-sm text-gray-500 mt-2">
              Only Completed or Delivered orders are eligible for refund/returns. Select an order from the selector at the top-right to start.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
