import React, { useMemo, useState, useEffect } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Pagination } from "../../components/ui";
import { getProductTaxInfo, exportToExcel } from "../../utils";
import { getEffectiveTaxRate, getSystemGstConfigFromStorage } from "../../../utils/gstConfig.js";
import {
  FileText,
  Search,
  Download,
  FileSpreadsheet,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  User2,
  Building2,
  Wallet,
  Eye,
  X,
  History,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useGetAllProducts } from "../../../../hook/Product";
import { useGetAllOrders } from "../../../../hook/order";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Nirmalyam Krafts";

const getLineSubtotalShare = (line, subtotal, lines, productItems, pricing = null) => {
  if (!lines || lines.length === 0) return 0;

  // 1. If line items have explicit unitPrice / sellingPrice / lineTotal / amount, use exact values!
  const getExplicitPrice = (l) => Number(l.unitPrice || l.sellingPrice || l.price || l.lineUnitPrice || 0);
  const getExplicitTotal = (l) => {
    const up = getExplicitPrice(l);
    if (up > 0) return (Number(l.quantity || 0) * up);
    if (l.lineTotal != null && Number(l.lineTotal) > 0) return Number(l.lineTotal);
    if (l.amount != null && Number(l.amount) > 0) return Number(l.amount);
    if (l.totalPrice != null && Number(l.totalPrice) > 0) return Number(l.totalPrice);
    if (l.subtotal != null && Number(l.subtotal) > 0) return Number(l.subtotal);
    return 0;
  };

  const hasExplicitTotals = lines.some(l => getExplicitTotal(l) > 0);
  if (hasExplicitTotals) {
    const rawLineVal = getExplicitTotal(line);
    const totalExplicitAll = lines.reduce((sum, l) => sum + getExplicitTotal(l), 0);

    if (totalExplicitAll > 0 && (subtotal <= 0 || Math.abs(totalExplicitAll - subtotal) < 1)) {
      return rawLineVal; // EXACT MATCH to quotation line total!
    }
    if (totalExplicitAll > 0) {
      return subtotal * (rawLineVal / totalExplicitAll);
    }
  }

  // 2. Fallback: Proportional share calculation
  let totalSuggestedOfAll = 0;
  const lineSuggestedVals = lines.map(l => {
    const pr = pricing?.perProductResults?.find(p => String(p.productId) === String(l.productId));
    let suggested = 0;
    if (pr) {
      const itemStockQty = Number(pr.canFulfillFromStock || 0);
      const itemRequiredProd = Number(pr.requiredFromProduction || 0);
      const itemNormalizedQty = itemStockQty + itemRequiredProd;
      const itemProdCost = itemNormalizedQty > 0
        ? (Number(pr.totalOrderMaterialCost || 0) / itemNormalizedQty) * itemRequiredProd
        : 0;
      const pObj = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(pr.productId || "").trim());
      const itemStockUnitPrice = pr.stockItem?.sellingPricePerUnit || pr.stockItem?.basePrice || pObj?.basePrice || 8;
      suggested = (itemStockQty * itemStockUnitPrice) + itemProdCost;
    } else {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(l?.productId || "").trim());
      const price = prod?.basePrice || prod?.unitPrice || prod?.sellingPrice || 8;
      const isRoll = prod?.category?.toLowerCase().includes("roll");
      let lineQty = Number(l.quantity || 0);
      if (!isRoll && l.unit === "kg") {
        const weight = Number(prod?.weight || 0);
        if (weight > 0) {
          lineQty = Math.ceil(lineQty / weight);
        }
      }
      suggested = lineQty * price;
    }
    totalSuggestedOfAll += suggested;
    return { lineId: l.productId || l._id, suggested };
  });

  const match = lineSuggestedVals.find(v => String(v.lineId) === String(line.productId || line._id));
  const lineSuggested = match ? match.suggested : 0;
  const lineShareFraction = totalSuggestedOfAll > 0 ? (lineSuggested / totalSuggestedOfAll) : (1 / lines.length);
  return subtotal > 0 ? (subtotal * lineShareFraction) : lineSuggested;
};

export const Receipts = () => {
  const { axiosInstance } = useAuthContext();
  const { data: productsData } = useGetAllProducts();
  const productItems = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [logoBase64, setLogoBase64] = useState("");

  // Log history states
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  // Exporter reason modal & client detail popup states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReason, setExportReason] = useState("");
  const [exportType, setExportType] = useState("csv");
  const [selectedClient, setSelectedClient] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);

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

  // TERMS, CONDITIONS & BANK SETTINGS STATES
  const [showTermsPanel, setShowTermsPanel] = useState(false);
  const [invoiceTerms, setInvoiceTerms] = useState(() => 
    localStorage.getItem("nirmalyam_invoice_terms") || 
    "1. Payment is strict Net due upon receipt of invoice.\n2. Interest of 18% p.a. will be charged on late payments.\n3. Goods once sold cannot be returned without validation."
  );
  const [quotationTerms, setQuotationTerms] = useState(() => 
    localStorage.getItem("nirmalyam_quotation_terms") || 
    "1. Quotation is valid for 30 days from date of quote.\n2. Standard delivery is within 7-10 working days.\n3. Prices are on ex-factory basis."
  );
  const [refundTerms, setRefundTerms] = useState(() => 
    localStorage.getItem("nirmalyam_refund_terms") || 
    "1. Refund is processed to source account within 5-7 days.\n2. A restocking fee of 10% may apply to returns.\n3. Goods must be in original condition."
  );
  const [showPaymentInfo, setShowPaymentInfo] = useState(() => 
    localStorage.getItem("nirmalyam_show_payment_info") === "true"
  );
  const [bankHolder, setBankHolder] = useState(() => 
    localStorage.getItem("nirmalyam_bank_holder") || "Nirmalyam Krafts"
  );
  const [bankName, setBankName] = useState(() => 
    localStorage.getItem("nirmalyam_bank_name") || "State Bank of India"
  );
  const [bankAccount, setBankAccount] = useState(() => 
    localStorage.getItem("nirmalyam_bank_account") || "39824872901"
  );
  const [bankIfsc, setBankIfsc] = useState(() => 
    localStorage.getItem("nirmalyam_bank_ifsc") || "SBIN0001299"
  );
  const [bankUpi, setBankUpi] = useState(() => 
    localStorage.getItem("nirmalyam_bank_upi") || "nirmalyam@sbi"
  );
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["getAllReceipts", search, startDate, endDate],
    queryFn: async () => {
      const resp = await axiosInstance.get("/receipts", {
        params: {
          page: 1,
          limit: 1000,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return resp.data.data;
    },
  });

  const receipts = data?.receipts || [];

  // Fetch orders to support customer address & orders popup lookup
  const { data: ordersData } = useGetAllOrders({ limit: 1000 });
  const allOrdersList = useMemo(() => ordersData?.orders || [], [ordersData]);

  const handleOpenClientPopup = (customerName, phone, email, businessName) => {
    const clientOrders = allOrdersList.filter(o => 
      String(o.phone || "").trim() === String(phone || "").trim() ||
      String(o.customerName || "").toLowerCase().trim() === String(customerName || "").toLowerCase().trim()
    );

    let deliveryAddress = "No address recorded";
    const orderWithAddress = clientOrders.find(o => o.delivery?.deliveryAddress);
    if (orderWithAddress) {
      const d = orderWithAddress.delivery;
      deliveryAddress = `${d.deliveryAddress || ""}${d.deliveryCity ? `, ${d.deliveryCity}` : ""}${d.deliveryState ? `, ${d.deliveryState}` : ""}`;
    }

    setSelectedClient({
      customerName,
      businessName,
      phone: phone || "—",
      email: email || "—",
      address: deliveryAddress,
      orders: clientOrders.map(o => ({
        reference: o.reference || o._id.slice(-6).toUpperCase(),
        date: o.createdAt,
        amount: o.totalAmount,
        status: o.orderStatus
      }))
    });
  };

  const receiptLogs = useMemo(() => {
    let list = [];
    if (selectedReceipt) {
      list.push({
        action: selectedReceipt.paymentMode === "refund" ? "💸 REFUND RECORDED" : "💰 PAYMENT RECORDED",
        by: selectedReceipt.createdBy?.username || selectedReceipt.createdBy?.email || "Admin/System",
        at: selectedReceipt.paidAt || selectedReceipt.createdAt,
        reason: selectedReceipt.note || `Recorded payment of ₹${selectedReceipt.amount} via ${selectedReceipt.paymentMode.toUpperCase()} for Order Ref #${selectedReceipt.orderRef || "—"}.`
      });
    } else {
      // compile global logs for all receipts
      receipts.forEach(rc => {
        list.push({
          action: rc.paymentMode === "refund" ? "💸 REFUND RECORDED" : "💰 PAYMENT RECORDED",
          by: rc.createdBy?.username || rc.createdBy?.email || "Admin/System",
          at: rc.paidAt || rc.createdAt,
          reason: rc.note || `Recorded payment of ₹${rc.amount} via ${rc.paymentMode.toUpperCase()} for Order Ref #${rc.orderRef || "—"}.`
        });
      });
    }
    // merge with session logs (e.g. exports)
    list = [...list, ...sessionLogs];
    // sort by date descending
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [selectedReceipt, receipts, sessionLogs]);

  const filteredReceipts = useMemo(() => {
    let list = receipts;

    // Filter by payment mode
    if (paymentModeFilter !== "All") {
      list = list.filter((rc) => {
        const mode = String(rc.paymentMode || "").toLowerCase();
        if (paymentModeFilter.toLowerCase() === "refund") {
          return mode === "refund" || rc.type === "refund";
        }
        return mode === paymentModeFilter.toLowerCase();
      });
    }

    // Filter by payment status
    if (statusFilter !== "All") {
      list = list.filter((rc) => {
        if (statusFilter === "Fully Paid") {
          return rc.isPaidInFull && rc.paymentMode !== "refund" && rc.type !== "refund";
        }
        if (statusFilter === "Partial Paid") {
          return !rc.isPaidInFull && rc.paymentMode !== "refund" && rc.type !== "refund";
        }
        if (statusFilter === "Refunded") {
          return rc.paymentMode === "refund" || rc.type === "refund";
        }
        return true;
      });
    }

    // Sorting (merges both RCT- receipts and INV- invoices chronologically)
    list = [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.paidAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.paidAt || 0).getTime();
      if (sortBy === "date-desc") {
        return timeB - timeA;
      }
      if (sortBy === "date-asc") {
        return timeA - timeB;
      }
      if (sortBy === "customer-asc") {
        return (a.customerName || "").localeCompare(b.customerName || "");
      }
      if (sortBy === "customer-desc") {
        return (b.customerName || "").localeCompare(a.customerName || "");
      }
      if (sortBy === "amount-desc") {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (sortBy === "amount-asc") {
        return (a.amount || 0) - (b.amount || 0);
      }
      return timeB - timeA;
    });

    return list;
  }, [receipts, paymentModeFilter, statusFilter, sortBy]);

  const totalCollectedAmount = useMemo(() => {
    return filteredReceipts.reduce((sum, rc) => {
      const amt = Number(rc.amount || 0);
      const isRefund = rc.paymentMode === "refund" || rc.type === "refund";
      return sum + (isRefund ? -amt : amt);
    }, 0);
  }, [filteredReceipts]);

  const getRealtimeReceiptGstAmount = (rc, matchingOrder) => {
    if (!rc) return 0;
    
    const bDetails = rc.billDetails || matchingOrder?.billDetails || {};
    const subtotal = Number(
      bDetails.subtotal ||
      matchingOrder?.subtotalAmount ||
      matchingOrder?.quotation?.subtotalAmount ||
      rc.subtotalAmount ||
      rc.totalOrderAmount ||
      rc.amount || 0
    );
    
    const preTaxDiscountVal = Number(bDetails.preTaxDiscount ?? (bDetails.postTaxDiscount == null ? (bDetails.discount || rc.discountAmount || 0) : 0));
    const taxRate = Number(bDetails.taxRate ?? matchingOrder?.taxRate ?? matchingOrder?.quotation?.taxRate ?? (bDetails.items?.[0]?.gstRate || 0));

    if (taxRate > 0) {
      const taxableBase = Math.max(0, subtotal - preTaxDiscountVal);
      return Number((taxableBase * (taxRate / 100)).toFixed(2));
    }

    const rawLines = (bDetails.items && bDetails.items.length > 0)
      ? bDetails.items
      : (matchingOrder?.billDetails?.items?.length > 0 ? matchingOrder.billDetails.items : (matchingOrder?.quotation?.items || matchingOrder?.orderDetailsList || []));
    
    if (rawLines && rawLines.length > 0) {
      const lineGstTotal = rawLines.reduce((acc, line) => {
        const lineSub = Number(line.subtotal || ((line.quantity || 0) * (line.unitPrice || line.rate || 0)) || 0);
        const lineRate = Number(line.gstRate || 0);
        return acc + (lineSub * (lineRate / 100));
      }, 0);
      if (lineGstTotal > 0) return Number(lineGstTotal.toFixed(2));
    }

    return 0;
  };

  const getReceiptGstPortion = (rc, ordersList, receiptsList) => {
    const ord = (ordersList || []).find((o) => String(o._id || o.id || "").trim() === String(rc.orderId || "").trim());

    // 1. For Tax Invoices (Bills)
    if (rc.type === "bill" || rc.paymentMode === "invoice") {
      return getRealtimeReceiptGstAmount(rc, ord);
    }

    // 2. For Refunds
    const isRefund = rc.paymentMode === "refund" || rc.type === "refund";
    if (isRefund) {
      if (ord) {
        const returnItem = ord.returns?.find((r) => r.returnNumber === rc.receiptNumber);
        if (returnItem && returnItem.gstRefundAmount != null) {
          return -Number(returnItem.gstRefundAmount || 0);
        }
      }
      const realGstAmount = getRealtimeReceiptGstAmount(rc, ord);
      return -realGstAmount;
    }

    // 3. For Payment Receipts (RCT-) -> Option 2: Proportional Allocation of Order's Dynamic GST
    const paidAmount = Number(rc.amount || 0);
    if (paidAmount <= 0) return 0;

    // Full order grand total
    const orderGrandTotal = Number(
      rc.totalOrderAmount ||
      ord?.grandTotal ||
      ord?.billDetails?.grandTotal ||
      ord?.quotation?.grandTotal ||
      ord?.amount ||
      0
    );

    // Full order total GST amount (computed dynamically from order/quotation/billDetails line items or rate)
    let orderTotalGst = 0;
    if (ord) {
      const billRc = (receiptsList || []).find(
        (r) => String(r.orderId || "").trim() === String(ord._id || ord.id || "").trim() && (r.type === "bill" || r.paymentMode === "invoice")
      );
      if (billRc) {
        orderTotalGst = getRealtimeReceiptGstAmount(billRc, ord);
      } else {
        orderTotalGst = getRealtimeReceiptGstAmount({ billDetails: ord.billDetails || ord.quotation }, ord);
      }
    } else if (rc.billDetails) {
      orderTotalGst = getRealtimeReceiptGstAmount(rc, null);
    }

    // Fallback calculation if orderTotalGst wasn't derived from line items directly
    if (orderTotalGst <= 0 && orderGrandTotal > 0) {
      const taxRate = Number(
        rc.billDetails?.taxRate ??
        ord?.taxRate ??
        ord?.quotation?.taxRate ??
        (ord?.orderDetailsList?.[0]?.gstRate || rc.orderDetailsList?.[0]?.gstRate || 0)
      );
      if (taxRate > 0) {
        const base = orderGrandTotal / (1 + taxRate / 100);
        orderTotalGst = orderGrandTotal - base;
      }
    }

    if (orderGrandTotal <= 0 || orderTotalGst <= 0) return 0;

    // Get all payment receipts for this order
    const orderIdStr = String(rc.orderId || "").trim();
    const orderPaymentReceipts = (receiptsList || [])
      .filter((r) => {
        const isSameOrder = String(r.orderId || "").trim() === orderIdStr;
        const isPayment = r.type !== "bill" && r.paymentMode !== "invoice" && r.type !== "refund" && r.paymentMode !== "refund";
        return isSameOrder && isPayment;
      })
      .sort((a, b) => new Date(a.createdAt || a.paidAt || 0) - new Date(b.createdAt || b.paidAt || 0));

    const currentRcIndex = orderPaymentReceipts.findIndex(
      (r) => String(r._id || r.id || r.receiptNumber).trim() === String(rc._id || rc.id || rc.receiptNumber).trim()
    );

    // If this is the last payment receipt for the order, assign remaining unallocated GST to balance perfectly
    if (currentRcIndex >= 0 && currentRcIndex === orderPaymentReceipts.length - 1) {
      let previousAllocatedGst = 0;
      for (let i = 0; i < currentRcIndex; i++) {
        const prevRc = orderPaymentReceipts[i];
        const prevPaid = Number(prevRc.amount || 0);
        previousAllocatedGst += Number((orderTotalGst * (prevPaid / orderGrandTotal)).toFixed(2));
      }
      const remainingGst = Math.max(0, orderTotalGst - previousAllocatedGst);
      return Number(remainingGst.toFixed(2));
    }

    // Standard Proportional Allocation: Order Total GST * (Paid Amount / Order Grand Total)
    const allocatedGst = orderTotalGst * (paidAmount / orderGrandTotal);
    return Number(allocatedGst.toFixed(2));
  };

  const totalGstCollected = useMemo(() => {
    return filteredReceipts.reduce((sum, rc) => {
      // Exclude issued bills/invoices; calculate GST collected ONLY from actual payment receipts & refunds
      if (rc.type === "bill" || rc.paymentMode === "invoice") return sum;
      return sum + getReceiptGstPortion(rc, allOrdersList, receipts);
    }, 0);
  }, [filteredReceipts, allOrdersList, receipts]);

  const paginatedReceipts = useMemo(() => {
    const offset = (currentPage - 1) * limit;
    return filteredReceipts.slice(offset, offset + limit);
  }, [filteredReceipts, currentPage, limit]);

  const totalPages = Math.ceil(filteredReceipts.length / limit) || 1;

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

  // Professional PDF Receipt Generator
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
    
    // Lookup target order from allOrdersList if rc is a receipt/bill record
    const targetOrderId = String(rc.orderId?._id || rc.orderId || rc.order || "").trim();
    const matchingOrder = (allOrdersList || []).find(o =>
      String(o._id || o.id || "").trim() === targetOrderId ||
      String(o.orderId || "").trim() === String(rc.orderId || "").trim() ||
      String(o.reference || "").toLowerCase().trim() === String(rc.orderRef || "").toLowerCase().trim()
    ) || rc;

    // Item Table
    const billDetails = rc.billDetails || matchingOrder?.billDetails || {};
    const subtotal = Number(
      billDetails.subtotal ||
      matchingOrder?.subtotalAmount ||
      matchingOrder?.quotation?.subtotalAmount ||
      rc.subtotalAmount ||
      rc.totalOrderAmount ||
      rc.amount || 0
    );
    const preTaxDiscountVal = Number(billDetails.preTaxDiscount ?? (billDetails.postTaxDiscount == null ? (billDetails.discount || rc.discountAmount || 0) : 0));
    const postTaxDiscountVal = Number(billDetails.postTaxDiscount ?? 0);
    const shippingVal = Number(billDetails.shipping || rc.shippingCharges || 0);
    const otherVal = Number(billDetails.other || rc.otherCharges || 0);
    const taxRate = Number(billDetails.taxRate || 0);

    // Invoice Meta Table or Section
    const termsY = 85;
    doc.setFillColor(245, 247, 246);
    doc.rect(15, termsY, pageWidth - 30, 10, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const pdfPaidSoFar = Number(rc.paidSoFar || matchingOrder?.paidSoFar || 0);
    const pdfPaymentStatusText = pdfPaidSoFar <= 0
      ? "UNPAID"
      : (rc.isPaidInFull || pdfPaidSoFar >= ((subtotal - preTaxDiscountVal + shippingVal + otherVal) - postTaxDiscountVal) - 0.01 ? "PAID IN FULL" : "PARTIAL PAID");

    doc.text(`Due Date: ${rc.billDetails?.dueDate ? new Date(rc.billDetails.dueDate).toLocaleDateString() : "—"}`, 20, termsY + 6.5);
    doc.text(`Payment Mode: ${String(rc.paymentMode || "invoice").toUpperCase()}  |  Payment Status: ${pdfPaymentStatusText}`, 95, termsY + 6.5);

    const baseQuotationItems = matchingOrder?.quotation?.items?.length > 0
      ? matchingOrder.quotation.items
      : (matchingOrder?.orderDetailsList?.length > 0 ? matchingOrder.orderDetailsList : (rc.quotation?.items || rc.orderDetailsList || []));

    const rawLines = (rc.billDetails?.items && rc.billDetails.items.length > 0)
      ? rc.billDetails.items
      : (matchingOrder?.billDetails?.items?.length > 0 ? matchingOrder.billDetails.items : baseQuotationItems);

    const lines = rawLines.map(line => {
      const qMatch = baseQuotationItems.find(q =>
        (q.productId && line.productId && String(q.productId).trim() === String(line.productId).trim()) ||
        (q.productName && line.productName && q.productName.toLowerCase().trim() === line.productName.toLowerCase().trim())
      );

      const explicitUnitPrice = Number(line.unitPrice || line.sellingPrice || line.price || line.lineUnitPrice || qMatch?.unitPrice || qMatch?.sellingPrice || qMatch?.price || qMatch?.lineUnitPrice || 0);

      return {
        ...line,
        unitPrice: explicitUnitPrice > 0 ? explicitUnitPrice : line.unitPrice,
      };
    });
    const totalQty = lines.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    // Per-line GST breakdown accumulator by rate
    const gstByRate = {};
    const tableBody = lines.map((line, index) => {
      const lineQty = Number(line.quantity || 0);
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line.productId || "").trim());
      const lineIsRoll = rc.productCategory?.toLowerCase().includes("roll");
      const isRoll = prod?.category?.toLowerCase().includes("roll") || lineIsRoll;

      let displayQty = `${lineQty} ${line.unit || "pcs"}`;
      let calcQty = lineQty;

      if (!isRoll && line.unit === "kg" && Number(prod?.weight || 0) > 0) {
        const pcsQty = Math.ceil(lineQty / Number(prod.weight));
        displayQty = `${pcsQty} pcs`;
        calcQty = pcsQty;
      }

      const lineSubtotal = getLineSubtotalShare(line, subtotal, lines, productItems);
      const lineFraction = subtotal > 0 ? (lineSubtotal / subtotal) : (1 / (lines.length || 1));
      const rate = calcQty > 0 ? (lineSubtotal / calcQty) : lineSubtotal;

      const specDetails = getPDFSpecDetails(line, rc.productCategory, productItems);

      const taxInfo = getProductTaxInfo(prod || line);
      const lineHsn = line.hsnCode || prod?.hsnCode || taxInfo.hsnCode;
      const sysConfig = getSystemGstConfigFromStorage();
      const productGst = prod ? (prod.custom_gst_rate ?? prod.gstRate) : null;
      let lineGstRate = 0;
      if (sysConfig.gstEnabled) {
        if (productGst != null) {
          lineGstRate = Number(productGst);
        } else if (line.gstRate != null && Number(line.gstRate) > 0 && Number(line.gstRate) !== 18) {
          lineGstRate = Number(line.gstRate);
        } else {
          lineGstRate = Number(taxInfo.gstRate || 5);
        }
      }

      // Accumulate GST by rate
      const rateKey = String(lineGstRate);
      const taxableBase = Math.max(0, lineSubtotal - (preTaxDiscountVal * lineFraction));
      const lineTax = taxableBase * (lineGstRate / 100);
      if (!gstByRate[rateKey]) gstByRate[rateKey] = { taxableAmount: 0, taxAmount: 0 };
      gstByRate[rateKey].taxableAmount += taxableBase;
      gstByRate[rateKey].taxAmount += lineTax;

      return [
        specDetails,
        lineHsn,
        `${lineGstRate}%`,
        `Rs. ${lineTax.toFixed(2)}`,
        displayQty,
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
    
    if (preTaxDiscountVal > 0) {
      currentY += 6;
      doc.text("Pre-Tax Discount:", labelX, currentY);
      doc.text(`- Rs. ${preTaxDiscountVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Taxable Value:", labelX, currentY);
      doc.text(`Rs. ${(subtotal - preTaxDiscountVal).toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      doc.setFont("helvetica", "normal");
    }

    // GST Breakdown by rate
    const gstRateKeys = Object.keys(gstByRate).sort((a, b) => Number(a) - Number(b));
    let totalGstCollected = 0;
    
    if (gstRateKeys.length > 0) {
       for (const rk of gstRateKeys) {
         totalGstCollected += gstByRate[rk].taxAmount;
       }
    }

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
      const fallbackTax = (subtotal - preTaxDiscountVal) * (taxRate / 100);
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

    if (postTaxDiscountVal > 0) {
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 80, 0);
      doc.text("Post-Tax Disc. (Commercial):", labelX, currentY);
      doc.text(`- Rs. ${postTaxDiscountVal.toFixed(2)}`, rightAlignX, currentY, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
    }
    
    const grossVal = (subtotal - preTaxDiscountVal) + totalGstCollected + shippingVal + otherVal;
    const grandTotal = Math.max(0, grossVal - postTaxDiscountVal);
    
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
    const discountVal = preTaxDiscountVal + postTaxDiscountVal;
    const approvedTotal = Number(rc.totalOrderAmount || 0);
    const effectiveInvoiced = grandTotal + discountVal;
    const remainingToInvoiceVal = Math.max(0, approvedTotal - effectiveInvoiced);
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
    const rawType = String(returnDetails.returnType || "").toLowerCase();
    const returnTypeLabel = rawType === "complete" ? "Full Return" : (rawType === "partial" ? "Partial Return" : (returnDetails.notes ? "Partial Return" : "Full Return"));

    doc.setFont("helvetica", "bold");
    doc.text("RETURN DETAILS:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Original Order Ref: ${order.reference || (order.id || order._id || "").toString().slice(-6).toUpperCase()}`, 110, 58);
    doc.text(`Return Type: ${returnTypeLabel}`, 110, 63);
    doc.text(`GST Status: Refund Configured`, 110, 68);
    doc.text(`Refund Status: Refund Processed & Stock Restored`, 110, 73);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Totals from returnDetails
    const baseRefund = Number(returnDetails.refundAmount || 0);
    const gstRefund = Number(returnDetails.gstRefundAmount || 0);
    const totalRefunded = Number((baseRefund + gstRefund).toFixed(2));

    // Enrich items with selling-price weight, HSN code, and GST rate
    const items = returnDetails.items || [];
    const enrichedItems = items.map(it => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(it.productId || "").trim());
      const taxInfo = getProductTaxInfo(prod || it);
      const rawHsn = it.hsnCode || taxInfo.hsnCode || "4819 40 00";
      const hsnCode = String(rawHsn).replace(/\s+/g, " ").trim();
      const gstRateVal = it.gstRate != null ? Number(it.gstRate) : taxInfo.gstRate;
      const sellPrice = Number(prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || it.unitPrice || 0) || 1;
      const weight = Number(it.quantity || 0) * sellPrice;
      return { ...it, hsnCode, gstRateVal, weight };
    });

    const totalWeight = enrichedItems.reduce((s, d) => s + d.weight, 0) || 1;

    const tableBody = enrichedItems.map((it, index) => {
      // Distribute the exact gstRefundAmount proportionally across items so table sum matches bottom summary
      const lineWeightFrac = totalWeight > 0 ? (it.weight / totalWeight) : (1 / enrichedItems.length);
      const lineGstRefund = (lineWeightFrac * gstRefund);

      // Format quantity cleanly with pieces hint if applicable
      let qtyStr = `${it.quantity || 0} ${it.unit || "pcs"}`;
      if (it.quantityInPcs && Number(it.quantityInPcs) > 1 && String(it.unit || "").toLowerCase() !== "pcs") {
        qtyStr = `${it.quantity || 0} ${it.unit || "kg"} (${it.quantityInPcs} pcs)`;
      }

      return [
        `Item ${index + 1}: ${it.productName || "Product"}`,
        it.hsnCode,
        `${it.gstRateVal}%`,
        `Rs. ${lineGstRefund.toFixed(2)}`,
        qtyStr,
        `Refunded`
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
        1: { halign: "center", cellWidth: 28 }, // HSN Code fits 4819 40 00 on one line
        2: { halign: "center", cellWidth: 16 },
        3: { halign: "right", cellWidth: 26 },
        4: { halign: "center", cellWidth: 32 },
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

  const generatePaymentReceiptPDF = (rc, mode = "download") => {
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
    doc.text(`Date & Time: ${new Date(rc.paidAt || Date.now()).toLocaleString()}`, pageWidth - 15, 33, { align: "right" });

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

    // Associated Invoice lookup
    const assocBill = (receipts || []).find(
      (r) => String(r.orderId || "").trim() === String(rc.orderId || "").trim() && (r.type === "bill" || String(r.receiptNumber || "").startsWith("INV-"))
    );
    const invoiceNum = assocBill?.receiptNumber || rc.invoiceNumber || "—";

    // Payment details
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT DETAILS:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Reference: ${rc.orderRef || "—"}`, 110, 57);
    doc.text(`Quotation Number: ${rc.quotationNumber || "—"}`, 110, 61.5);
    doc.text(`Associated Invoice: ${invoiceNum}`, 110, 66);
    doc.text(`Payment Mode: ${String(rc.paymentMode || "cash").toUpperCase()}`, 110, 70.5);
    doc.text(`Payment Status: ${rc.isPaidInFull ? "Paid in Full" : "Partial Payment"}`, 110, 75);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Build Table Body (shows Total Amount per item line)
    const lines = rc.orderDetailsList || [];
    const totalOrderVal = Number(rc.totalOrderAmount || 0);
    const totalSellingValue = lines.reduce((sum, line) => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line.productId || "").trim());
      const price = Number(line.pricePerUnit || line.unitPrice || prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0) || 1;
      return sum + (Number(line.quantity || 0) * price);
    }, 0) || 1;

    const tableBody = lines.map((line) => {
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line.productId || "").trim());
      const taxInfo = getProductTaxInfo(prod || line);
      const lineHsn = line.hsnCode || taxInfo.hsnCode || "—";
      const specDetails = getPDFSpecDetails(line, rc.productCategory, productItems);

      const price = Number(line.pricePerUnit || line.unitPrice || prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0) || 1;
      const lineVal = Number(line.quantity || 0) * price;
      const itemTotalVal = totalOrderVal > 0 ? (lineVal / totalSellingValue) * totalOrderVal : lineVal;

      return [
        specDetails,
        lineHsn,
        `${line.quantity || 0} ${line.unit || "pcs"}`,
        `Rs. ${itemTotalVal.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 84,
      head: [["Order Item Details & Specifications", "HSN Code", "Quantity Ordered", "Total Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 9.5, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 32 },
        2: { halign: "center", cellWidth: 35 },
        3: { halign: "right", cellWidth: 42 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Totals Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const rightAlignX = pageWidth - 15;
    const labelX = pageWidth - 95;

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

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    if (rc.isPaidInFull) {
      doc.setTextColor(brand[0], brand[1], brand[2]);
      doc.text("Balance Remaining:", labelX, currentY);
      doc.text("Rs. 0.00 (Fully Paid)", rightAlignX, currentY, { align: "right" });
    } else {
      doc.setTextColor(190, 30, 30);
      doc.text("Balance Remaining:", labelX, currentY);
      doc.text(`Rs. ${Number(rc.remainingAmount || 0).toFixed(2)}`, rightAlignX, currentY, { align: "right" });
    }

    // Receipt note block on bottom left
    const tcY = currentY + 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Notes / Reference:", 15, tcY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(rc.note || "No custom payment remarks.", 15, tcY + 6);

    // Footer
    const footY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "This is an electronically generated official receipt. Thank you for doing business with Nirmalyam Krafts!",
      pageWidth / 2,
      footY,
      { align: "center" }
    );

    if (mode === "view") {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } else {
      doc.save(`Nirmalyam_Receipt_${rc.receiptNumber}.pdf`);
    }
  };

  const downloadReceiptPDF = (rc, mode = "download") => {
    // 1. Lookup parent order from allOrdersList
    const targetOrderId = String(rc.orderId?._id || rc.orderId || rc.order || "").trim();
    const matchingOrder = (allOrdersList || []).find(o =>
      String(o._id || o.id || "").trim() === targetOrderId ||
      String(o.orderId || "").trim() === String(rc.orderId || "").trim() ||
      String(o.reference || "").toLowerCase().trim() === String(rc.orderRef || "").toLowerCase().trim()
    ) || rc;

    const isRefund = rc.paymentMode === "refund" || rc.paymentMode === "Refund" || rc.type === "refund";
    const isBill = rc.type === "bill" || rc.paymentMode === "invoice" || String(rc.receiptNumber || "").startsWith("INV");

    if (isRefund) {
      // Find matching stored return transaction from matchingOrder.returns
      const matchingReturn = (matchingOrder?.returns || []).find(r =>
        String(r.returnNumber || "").trim() === String(rc.receiptNumber || rc.returnNumber || "").trim()
      );

      const returnDetails = matchingReturn || {
        returnNumber: rc.receiptNumber || "RET-001",
        returnedAt: rc.paidAt || rc.createdAt,
        returnType: rc.returnType || "partial",
        refundAmount: Number(rc.refundAmount != null ? rc.refundAmount : (rc.amount || 0)),
        gstRefundAmount: Number(rc.gstRefundAmount || 0),
        items: rc.orderDetailsList || matchingOrder?.orderDetailsList || [],
        notes: rc.note || "Return transaction receipt"
      };

      generateReturnReceiptPDF(matchingOrder, returnDetails, mode);
      return;
    }

    const mergedRc = {
      ...matchingOrder,
      ...rc,
      receiptNumber: rc.receiptNumber || matchingOrder?.receiptNumber,
      billDetails: rc.billDetails || matchingOrder?.billDetails || {},
      orderDetailsList: matchingOrder?.orderDetailsList || rc.orderDetailsList || [],
      quotation: matchingOrder?.quotation || rc.quotation || {},
    };

    if (isBill) {
      generateInvoicePDF(mergedRc, mode);
    } else {
      generatePaymentReceiptPDF(mergedRc, mode);
    }
  };

  const handleExportCSV = () => {
    setShowExportModal(true);
    setExportReason("");
  };

  const executeExport = () => {
    if (!exportReason.trim()) {
      toast.error("Reason for exporting is required.");
      return;
    }

    const headers = [
      "Receipt Number",
      "Order Reference",
      "Customer Name",
      "Business Name",
      "Paid At",
      "Amount",
      "Payment Mode",
      "Status",
      "Remaining Amount"
    ];

    const rows = filteredReceipts.map(rc => [
      rc.receiptNumber,
      rc.orderRef || "—",
      rc.customerName,
      rc.businessName || "—",
      new Date(rc.paidAt).toLocaleString(),
      rc.amount,
      rc.paymentMode,
      rc.paymentMode === "refund" ? "Refunded" : (rc.isPaidInFull ? "Fully Paid" : "Partial"),
      rc.remainingAmount || 0
    ]);

    if (exportType === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Receipts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully!");
    } else {
      exportToExcel(headers, rows, `Receipts_Export_${new Date().toISOString().slice(0, 10)}`);
      toast.success("Excel file downloaded successfully!");
    }

    // Append log to local logs
    setSessionLogs(prev => [
      {
        action: "📥 LEDGER EXPORTED",
        by: "Admin/System",
        at: new Date(),
        reason: `Exported filtered list of ${filteredReceipts.length} receipts. Reason: "${exportReason.trim()}"`
      },
      ...prev
    ]);

    setShowExportModal(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Receipts Ledger</h1>
            <p className="text-sm text-gray-500">
              View all official payment receipts, download records, and track outstanding balance dues.
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button
              onClick={() => {
                setExportType("csv");
                setShowExportModal(true);
                setExportReason("");
              }}
              className="rounded-xl flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Download className="w-4 h-4" /> Export CSV (Filtered)
            </Button>
            <Button
              onClick={() => {
                setExportType("excel");
                setShowExportModal(true);
                setExportReason("");
              }}
              className="rounded-xl flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel (Filtered)
            </Button>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <Motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 flex items-center justify-between hover:shadow-md transition bg-white border border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Receipts Count
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredReceipts.length}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Filtered transactions</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between hover:shadow-md transition bg-white border border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Net Payments
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{totalCollectedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Total cash-in hand</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between hover:shadow-md transition bg-white border border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                GST Collected (Tax)
              </p>
              <p className="text-2xl font-bold text-amber-600">
                ₹{totalGstCollected.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Aggregated GST liabilities</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <CalendarDays className="w-6 h-6" />
            </div>
          </Card>
        </Motion.div>

        {/* Search & Quick Filters */}
        <Card className="p-5">
          <div className="flex flex-col gap-4">
            
            {/* Search, Sort, and Status Filter row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by receipt number, customer, order ref..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-10 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
              >
                <option value="All">All Payment Statuses</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Partial Paid">Partial Paid</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
              >
                <option value="date-desc">Newest Paid</option>
                <option value="date-asc">Oldest Paid</option>
                <option value="customer-asc">Client Name (A-Z)</option>
                <option value="customer-desc">Client Name (Z-A)</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
              </select>
            </div>

            {/* Quick Clickable Payment Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold text-gray-500 mr-2">Payment Mode:</span>
              {["All", "Cash", "Bank", "UPI", "Cheque", "Refund"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setPaymentModeFilter(mode); setCurrentPage(1); }}
                  className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                    paymentModeFilter === mode
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {/* Date range filters */}
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Filter by Date:</span>
              <div className="flex items-center gap-1.5">
                <label className="text-gray-400">Start:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-gray-400">End:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:border-emerald-500"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); setCurrentPage(1); }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold ml-auto sm:ml-2"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Receipts List */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-sm text-gray-500">Loading receipts...</span>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-2">
              <Wallet className="h-10 w-10 text-gray-300" />
              <span className="text-sm font-semibold text-gray-600">No Receipts Found</span>
              <p className="text-xs text-gray-400">Record a payment or modify filters to view receipts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Receipt No</th>
                    <th className="px-6 py-4">Order Ref</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Paid Date</th>
                    <th className="px-6 py-4">Paid Amount</th>
                    <th className="px-6 py-4">GST Portion</th>
                    <th className="px-6 py-4">Payment Via</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {paginatedReceipts.map((rc) => {
                    const isSelected = selectedReceipt && selectedReceipt._id === rc._id;
                    const gstPortion = getReceiptGstPortion(rc, allOrdersList, receipts);

                    return (
                      <tr 
                        key={rc._id} 
                        className={`transition cursor-pointer ${
                          isSelected ? "bg-emerald-50/50 hover:bg-emerald-50/70" : "hover:bg-gray-50/50"
                        }`}
                        onClick={() => setSelectedReceipt(rc)}
                      >
                        <td className="px-6 py-4 font-bold text-gray-900">{rc.receiptNumber}</td>
                        <td className="px-6 py-4 font-semibold text-gray-700">{rc.orderRef || "—"}</td>
                        <td 
                          className="px-6 py-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClientPopup(rc.customerName, rc.phone, rc.email, rc.businessName);
                          }}
                        >
                          <div className="font-semibold text-gray-900 hover:text-emerald-700 hover:underline transition-colors">{rc.customerName}</div>
                          {rc.businessName && (
                            <div className="text-xs text-gray-400 mt-0.5">{rc.businessName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {(() => {
                            const dateObj = new Date(rc.createdAt || rc.paidAt || Date.now());
                            return `${dateObj.toLocaleDateString()} · ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                          })()}
                        </td>
                        <td className={`px-6 py-4 font-bold ${rc.paymentMode === "refund" ? "text-rose-600" : "text-emerald-700"}`}>
                          {rc.paymentMode === "refund" ? "-" : ""}₹{(rc.amount || 0).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 font-bold ${gstPortion < 0 ? "text-rose-600" : "text-amber-600"}`}>
                          {gstPortion < 0 ? "-" : ""}₹{Math.abs(gstPortion).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 uppercase text-xs font-bold text-gray-700">
                          {(() => {
                            const mode = rc.paymentMode || rc.type || "invoice";
                            return mode === "bank_transfer" ? "Bank" : mode === "card" ? "Card/Cheque" : mode;
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const isRefund = rc.paymentMode === "refund" || rc.type === "refund";
                            if (isRefund) {
                              return <Badge variant="danger">Refunded</Badge>;
                            }

                            const ord = allOrdersList.find((o) => String(o._id || o.id || "").trim() === String(rc.orderId || "").trim());
                            const currentPaid = Number(ord?.paidAmount ?? rc.paidSoFar ?? 0);
                            const totalAmt = Number(rc.totalOrderAmount || rc.amount || ord?.totalAmount || 0);
                            const remainingDue = Math.max(0, Number((totalAmt - currentPaid).toFixed(2)));
                            const isFullyPaid = rc.isPaidInFull || ord?.paymentStatus === "Paid" || (currentPaid >= totalAmt - 0.01 && totalAmt > 0);

                            if (isFullyPaid) {
                              return <Badge variant="success">Fully Paid</Badge>;
                            }

                            return <Badge variant="warning">Partial (Due: ₹{remainingDue.toLocaleString()})</Badge>;
                          })()}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadReceiptPDF(rc, "view")}
                              className="rounded-xl flex items-center gap-1 mt-auto hover:bg-gray-150"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadReceiptPDF(rc, "download")}
                              className="rounded-xl flex items-center gap-1 mt-auto hover:bg-gray-150"
                            >
                              <Download className="h-3.5 w-3.5 text-emerald-700" />
                              <span className="text-emerald-700">Download</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredReceipts.length > limit && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, filteredReceipts.length)} of {filteredReceipts.length} receipts
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </Card>

        {/* ── TERMS, CONDITIONS & PAYMENT INFO SETTINGS PANEL ────────────────── */}
        <div className="mt-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
          <button
            onClick={() => setShowTermsPanel(!showTermsPanel)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl hover:from-emerald-100/50 hover:to-teal-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Configure Terms, Conditions &amp; Payment Info</h3>
                <p className="text-xs text-gray-500 mt-0.5">Define default terms for Invoices, Quotations, Refunds, and customize Bank Details shown on PDFs.</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
              {showTermsPanel ? "Collapse ▴" : "Expand ▾"}
            </span>
          </button>

          {showTermsPanel && (
            <div className="mt-6 border-t border-gray-100 pt-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Textareas for terms */}
                <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Document Terms &amp; Conditions</h4>
                  </div>
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Invoice T&amp;C (Invoices/Bills)</label>
                      <textarea
                        rows={4}
                        value={invoiceTerms}
                        onChange={(e) => {
                          setInvoiceTerms(e.target.value);
                          localStorage.setItem("nirmalyam_invoice_terms", e.target.value);
                        }}
                        className="w-full text-xs font-semibold rounded-xl border border-gray-200 bg-white px-3.5 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800 min-h-[90px] leading-relaxed hover:border-gray-300"
                        placeholder="Enter invoice terms & conditions..."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Quotation T&amp;C</label>
                      <textarea
                        rows={4}
                        value={quotationTerms}
                        onChange={(e) => {
                          setQuotationTerms(e.target.value);
                          localStorage.setItem("nirmalyam_quotation_terms", e.target.value);
                        }}
                        className="w-full text-xs font-semibold rounded-xl border border-gray-200 bg-white px-3.5 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800 min-h-[90px] leading-relaxed hover:border-gray-300"
                        placeholder="Enter quotation terms & conditions..."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Refund/Return T&amp;C (Refund Receipts)</label>
                      <textarea
                        rows={4}
                        value={refundTerms}
                        onChange={(e) => {
                          setRefundTerms(e.target.value);
                          localStorage.setItem("nirmalyam_refund_terms", e.target.value);
                        }}
                        className="w-full text-xs font-semibold rounded-xl border border-gray-200 bg-white px-3.5 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800 min-h-[90px] leading-relaxed hover:border-gray-300"
                        placeholder="Enter refund terms & conditions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bank / Payment Info Details */}
                <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Payment &amp; Bank Info</h4>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-700 bg-white border border-emerald-200/80 px-2.5 py-1 rounded-xl shadow-xs hover:bg-emerald-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={showPaymentInfo}
                        onChange={(e) => {
                          setShowPaymentInfo(e.target.checked);
                          localStorage.setItem("nirmalyam_show_payment_info", e.target.checked ? "true" : "false");
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                      Show on Quotations &amp; Bills
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankHolder}
                        onChange={(e) => {
                          setBankHolder(e.target.value);
                          localStorage.setItem("nirmalyam_bank_holder", e.target.value);
                        }}
                        className="w-full text-xs font-bold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => {
                          setBankName(e.target.value);
                          localStorage.setItem("nirmalyam_bank_name", e.target.value);
                        }}
                        className="w-full text-xs font-bold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => {
                          setBankAccount(e.target.value);
                          localStorage.setItem("nirmalyam_bank_account", e.target.value);
                        }}
                        className="w-full text-xs font-mono font-bold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={bankIfsc}
                        onChange={(e) => {
                          setBankIfsc(e.target.value);
                          localStorage.setItem("nirmalyam_bank_ifsc", e.target.value);
                        }}
                        className="w-full text-xs font-mono font-bold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">UPI ID</label>
                      <input
                        type="text"
                        value={bankUpi}
                        onChange={(e) => {
                          setBankUpi(e.target.value);
                          localStorage.setItem("nirmalyam_bank_upi", e.target.value);
                        }}
                        className="w-full text-xs font-mono font-bold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Logs Section */}
        <div className="mt-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-400 animate-pulse" />
                {selectedReceipt 
                  ? `Activity Logs & Verification History — Receipt #${selectedReceipt.receiptNumber}`
                  : `Global Receipts Activity Logs & History`
                }
              </h3>
              <p className="mt-1 text-xs text-slate-300 opacity-90">
                {selectedReceipt
                  ? `Showing payment recording audit logs, creators, and note details for selected Receipt #${selectedReceipt.receiptNumber}`
                  : `Showing all payment logs, returns, system ledger modifications, and session export audits`
                }
              </p>
            </div>
            {selectedReceipt && (
              <Button 
                onClick={() => setSelectedReceipt(null)} 
                variant="secondary" 
                className="bg-slate-700 hover:bg-slate-650 text-white border-none py-1.5 px-3 text-xs self-start sm:self-auto"
              >
                Show All Logs
              </Button>
            )}
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
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {(() => {
                  const getLocalDateString = (dateVal) => {
                    if (!dateVal) return "";
                    const d = new Date(dateVal);
                    if (isNaN(d.getTime())) return "";
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  };

                  let filteredLogs = [...receiptLogs];
                  if (logStartDate) {
                    filteredLogs = filteredLogs.filter(l => l.at && getLocalDateString(l.at) >= logStartDate);
                  }
                  if (logEndDate) {
                    filteredLogs = filteredLogs.filter(l => l.at && getLocalDateString(l.at) <= logEndDate);
                  }
              
              return filteredLogs.map((log, index) => (
                <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-150 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                          {log.action}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-650 italic">
                        <span className="font-semibold text-gray-850 not-italic">Details/Reason:</span> "{log.reason}"
                      </p>
                      <p className="mt-1 text-xs text-gray-400 font-medium">
                        Performed by: {log.by}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500 font-semibold">
                        {new Date(log.at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()}

            {receiptLogs.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-250 p-6 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                No activity logs recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CLIENT DETAILS POPUP MODAL ────────────────── */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-gray-150 p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedClient.customerName}</h3>
                  <p className="text-xs text-emerald-600 font-bold">{selectedClient.businessName}</p>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone number</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedClient.email}</p>
                </div>
              </div>

              {/* Address detail box */}
              <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl mb-6 text-sm">
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Delivery Address</p>
                <p className="font-bold text-gray-800 mt-1 leading-relaxed">{selectedClient.address}</p>
              </div>

              {/* Past Transactions list */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Client Past Orders & Transactions ({selectedClient.orders.length})
                </h4>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {selectedClient.orders.map((ord, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3.5 rounded-xl hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`/orders?orderRef=${ord.reference}`}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                          >
                            Order #{ord.reference}
                          </a>
                          <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-gray-600">
                            {ord.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(ord.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-gray-900">₹{ord.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {selectedClient.orders.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">No previous orders found for this customer.</p>
                  )}
                </div>
              </div>

              {/* Close CTA */}
              <div className="flex justify-end border-t pt-4 mt-6">
                <Button 
                  onClick={() => setSelectedClient(null)}
                  className="rounded-xl py-2 px-5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Close
                </Button>
              </div>

            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EXPORT REASON MODAL ────────────────── */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-gray-150 p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Enter Export Reason</h3>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  For data auditing and security compliance, please provide a brief description of why you are exporting this ledger data.
                </p>
                <div>
                  <label className="text-xs font-semibold text-gray-650 block mb-1">Reason / Note</label>
                  <Input 
                    type="text"
                    placeholder="e.g. Monthly accounting reconciliation"
                    value={exportReason}
                    onChange={(e) => setExportReason(e.target.value)}
                    className="w-full text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <Button 
                  onClick={() => setShowExportModal(false)}
                  variant="secondary"
                  className="rounded-xl border border-gray-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={executeExport}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-4"
                >
                  Confirm & Export
                </Button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};
export default Receipts;
