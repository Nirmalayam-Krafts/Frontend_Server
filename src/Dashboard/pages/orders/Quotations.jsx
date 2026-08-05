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
  XCircle,
  Eye,
  X,
  History,
  Wallet,
} from "lucide-react";
import { useGetAllOrders } from "../../../../hook/order";
import { useGetAllProducts } from "../../../../hook/Product";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Nirmalyam Krafts";

const getLineSubtotalShare = (line, subtotal, lines, productItems, pricing = null) => {
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
  return subtotal * lineShareFraction;
};

export const Quotations = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [logoBase64, setLogoBase64] = useState("");

  // Log history states
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  // Exporter reason modal & client details popup states
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
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useGetAllOrders({
    page: 1,
    limit: 1000, // Fetch a larger batch to filter quotations client-side
  });

  const { data: productsData } = useGetAllProducts();

  const productItems = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.products)) return productsData.products;
    return [];
  }, [productsData]);

  const allOrders = useMemo(() => {
    return data?.orders || [];
  }, [data]);

  const handleOpenClientPopup = (customerName, phone, email, businessName) => {
    const clientOrders = allOrders.filter(o => 
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

  const quotationLogs = useMemo(() => {
    let list = [];
    if (selectedQuotation) {
      const orderLogs = selectedQuotation.rawOrder?.workflowLogs || [];
      list = orderLogs.map(l => ({
        action: l.action,
        reason: l.note,
        at: l.at,
        by: "System/Admin"
      }));
    } else {
      // compile global logs for all quotations
      allOrders.forEach(o => {
        if (o.quotation && o.quotation.quotationNumber && o.quotation.status !== "none" && o.workflowLogs) {
          o.workflowLogs.forEach(log => {
            if (log.action.includes("QUOTE") || log.action.includes("QUOTATION") || log.action.includes("ORDER")) {
              list.push({
                action: log.action,
                reason: `${log.note} (Quotation: ${o.quotation.quotationNumber})`,
                at: log.at,
                by: "System/Admin"
              });
            }
          });
        }
      });
    }
    // merge with session logs
    list = [...list, ...sessionLogs];
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [selectedQuotation, allOrders, sessionLogs]);

  // Filter orders that have quotations
  const quotations = useMemo(() => {
    const list = allOrders
      .filter((o) => o.quotation && o.quotation.quotationNumber && o.quotation.status !== "none")
      .map((o) => ({
        id: o.id || o._id,
        quotationNumber: o.quotation.quotationNumber,
        customerName: o.customerName,
        businessName: o.businessName,
        phone: o.phone,
        email: o.email,
        date: o.quotation.sentAt || o.quotation.approvedAt || o.createdAt,
        validUntil: o.quotation.validUntil,
        status: o.quotation.status || "draft",
        subtotalAmount: o.quotation.subtotalAmount || o.quotation.totalQuoted || 0,
        taxRate: o.quotation.taxRate || 0,
        shippingCharges: o.quotation.shippingCharges || 0,
        otherCharges: o.quotation.otherCharges || 0,
        totalQuoted: o.quotation.totalQuoted || 0,
        orderDetails: o.orderDetails,
        orderDetailsList: o.orderDetailsList || (o.orderDetails ? [o.orderDetails] : []),
        productCategory: o.productCategory,
        source: o.source,
        rawOrder: o,
      }));

    // Filter by search, status & date range
    let filtered = list.filter((q) => {
      const matchSearch =
        q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (q.businessName || "").toLowerCase().includes(search.toLowerCase());
      
      const matchStatus =
        statusFilter === "All" || q.status.toLowerCase() === statusFilter.toLowerCase();

      const getLocalDateString = (dateVal) => {
        if (!dateVal) return "";
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && getLocalDateString(q.date) >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && getLocalDateString(q.date) <= endDate;
      }

      return matchSearch && matchStatus && matchDate;
    });

    // Sort the list
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "customer-asc") {
        return (a.customerName || "").localeCompare(b.customerName || "");
      }
      if (sortBy === "customer-desc") {
        return (b.customerName || "").localeCompare(a.customerName || "");
      }
      if (sortBy === "amount-desc") {
        return (b.totalQuoted || 0) - (a.totalQuoted || 0);
      }
      if (sortBy === "amount-asc") {
        return (a.totalQuoted || 0) - (b.totalQuoted || 0);
      }
      return 0;
    });

    return filtered;
  }, [allOrders, search, statusFilter, startDate, endDate, sortBy]);

  // Paginated quotations
  const totalPages = Math.ceil(quotations.length / limit) || 1;
  const paginatedQuotations = useMemo(() => {
    const offset = (currentPage - 1) * limit;
    return quotations.slice(offset, offset + limit);
  }, [quotations, currentPage]);

  // PDF Generator logic (aligned with Orders.jsx generateQuotationPDF)
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

  const downloadQuotationPDF = (q, mode = "download") => {
    const sysConfig = getSystemGstConfigFromStorage();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const subtotal = Number(q.subtotalAmount || 0);
    const taxRate = Number(q.taxRate || 0);
    const shippingVal = Number(q.shippingCharges || 0);
    const otherVal = Number(q.otherCharges || 0);

    // Load per-line unit prices from localStorage (backend may not persist this field)
    const orderId = String(q.orderId || q.id || q._id || "");
    let lineUnitPrices = {};
    try {
      const stored = localStorage.getItem(`nirmalyam_lineUnitPrices_${orderId}`);
      if (stored) lineUnitPrices = JSON.parse(stored);
    } catch (_) {}
    // Fallback to backend field if localStorage is empty
    if (Object.keys(lineUnitPrices).length === 0 && q.lineUnitPrices) {
      lineUnitPrices = q.lineUnitPrices;
    }
    // Attach to q so it's accessible in the tableBody map
    q = { ...q, quotation: { ...(q.quotation || {}), lineUnitPrices } };

    const validUntil = q.validUntil ? new Date(q.validUntil).toISOString().slice(0, 10) : "—";
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
    doc.text("QUOTATION", pageWidth - 15, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 245, 238);
    doc.text(`Quote No: ${q.quotationNumber}`, pageWidth - 15, 28, { align: "right" });
    doc.text(`Date: ${new Date(q.date).toISOString().slice(0, 10)}`, pageWidth - 15, 33, { align: "right" });

    // Quoted details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTED TO:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${q.customerName || "—"}`, 15, 58);
    doc.text(`Business: ${q.businessName || "—"}`, 15, 63);
    doc.text(`Phone: ${q.phone || "—"}`, 15, 68);
    doc.text(`Email: ${q.email || "—"}`, 15, 73);

    // Quote Summary
    doc.setFont("helvetica", "bold");
    doc.text("QUOTE SUMMARY:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Validity: Valid until ${validUntil}`, 110, 58);
    doc.text(`Status: ${q.status.charAt(0).toUpperCase() + q.status.slice(1)}`, 110, 63);
    doc.text(`Source: ${q.source || "Dashboard"}`, 110, 68);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 78, pageWidth - 15, 78);

    // Build Table Body (multi-product compatible)
    const lines = q.orderDetailsList && q.orderDetailsList.length > 0
      ? q.orderDetailsList
      : [q.orderDetails].filter(Boolean);

    const totalQty = lines.reduce((acc, l) => acc + Number(l?.quantity || 0), 0) || 1;

    // Per-line GST breakdown accumulator by rate
    const gstByRate = {};

    const tableBody = lines.map((line, index) => {
      const lineQty = Number(line?.quantity || 0);
      const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(line?.productId || "").trim());
      const isRoll = prod?.category?.toLowerCase().includes("roll");

      let displayQty = `${lineQty} ${line.unit || "pcs"}`;
      let calcQty = lineQty;

      if (!isRoll && line.unit === "kg" && Number(prod?.weight || 0) > 0) {
        const pcsQty = Math.ceil(lineQty / Number(prod.weight));
        displayQty = `${pcsQty} pcs`;
        calcQty = pcsQty;
      }

      // Use saved per-line unit price if available, otherwise derive from subtotal share
      const savedUnitPrice = q.quotation?.lineUnitPrices?.[line.productId];
      let lineUnitPrice;
      let lineSubtotal;
      if (savedUnitPrice != null && Number(savedUnitPrice) > 0) {
        lineUnitPrice = Number(savedUnitPrice);
        lineSubtotal = lineUnitPrice * calcQty;
      } else {
        lineSubtotal = getLineSubtotalShare(line, subtotal, lines, productItems);
        lineUnitPrice = calcQty > 0 ? (lineSubtotal / calcQty) : lineSubtotal;
      }

      // Resolve HSN and GST
      const taxInfo = getProductTaxInfo(prod || line);
      const lineHsn = line.hsnCode || prod?.hsnCode || taxInfo.hsnCode;
      const productGst = prod ? (prod.custom_gst_rate ?? prod.gstRate) : null;
      const rawGst = (line.gstRate != null && line.gstRate > 0 && line.gstRate !== 18)
        ? Number(line.gstRate)
        : (productGst ?? taxInfo.gstRate ?? 5);
      const lineGstRate = sysConfig.gstEnabled ? Number(rawGst) : 0;

      // Accumulate GST by rate
      const rateKey = String(lineGstRate);
      const lineTax = lineSubtotal * (lineGstRate / 100);
      if (!gstByRate[rateKey]) gstByRate[rateKey] = { taxableAmount: 0, taxAmount: 0 };
      gstByRate[rateKey].taxableAmount += lineSubtotal;
      gstByRate[rateKey].taxAmount += lineTax;

      const specDetails = getPDFSpecDetails(line, q.productCategory, productItems);

      // Column order: Specs | HSN | Unit Rate | Quantity | GST % | GST Amt | Amount
      return [
        specDetails,
        lineHsn,
        `Rs. ${lineUnitPrice.toFixed(2)}`,
        displayQty,
        `${lineGstRate}%`,
        `Rs. ${lineTax.toFixed(2)}`,
        `Rs. ${lineSubtotal.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 84,
      head: [["Item Details & Specifications", "HSN Code", "Unit Rate", "Quantity", "GST %", "GST Amt", "Amount"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3.5, valign: "middle" },
      headStyles: { fillColor: brand, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "right", cellWidth: 22 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "center", cellWidth: 14 },
        5: { halign: "right", cellWidth: 20 },
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

    if (mode === "view") {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } else {
      doc.save(`Nirmalyam_Quotation_${q.quotationNumber}.pdf`);
    }
  };

  const getStatusBadge = (status) => {
    switch (String(status).toLowerCase()) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "sent":
        return <Badge variant="primary">Sent</Badge>;
      case "draft":
        return <Badge variant="warning">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      "Quotation Number",
      "Customer Name",
      "Business Name",
      "Phone",
      "Email",
      "Quotation Date",
      "Valid Until",
      "Subtotal Amount",
      "Total Quoted",
      "Status"
    ];

    const rows = quotations.map(q => [
      q.quotationNumber,
      q.customerName,
      q.businessName || "—",
      q.phone || "—",
      q.email || "—",
      new Date(q.date).toLocaleDateString(),
      q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—",
      q.subtotalAmount,
      q.totalQuoted,
      q.status
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
      link.setAttribute("download", `Quotations_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully!");
    } else {
      exportToExcel(headers, rows, `Quotations_Export_${new Date().toISOString().slice(0, 10)}`);
      toast.success("Excel file downloaded successfully!");
    }

    // Append log to local logs
    setSessionLogs(prev => [
      {
        action: "📥 LEDGER EXPORTED",
        by: "Admin/System",
        at: new Date(),
        reason: `Exported filtered list of ${quotations.length} quotations. Reason: "${exportReason.trim()}"`
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quotation Ledger</h1>
            <p className="text-sm text-gray-500">
              Manage and track all generated price quotations.
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

        {/* Filter Section */}
        <Card className="p-5">
          <div className="flex flex-col gap-4">
            
            {/* Search and Sort row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by quotation number, customer name, business..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-10 text-sm"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
              >
                <option value="date-desc">Newest Quote</option>
                <option value="date-asc">Oldest Quote</option>
                <option value="customer-asc">Client Name (A-Z)</option>
                <option value="customer-desc">Client Name (Z-A)</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
              </select>
            </div>

            {/* Quick Status Clickable Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold text-gray-500 mr-2">Quote Status:</span>
              {["All", "Draft", "Sent", "Approved"].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                    statusFilter === st
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st}
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
                  max={endDate || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (endDate && val > endDate) {
                      toast.error("'Start' date cannot be after 'End' date");
                      return;
                    }
                    setStartDate(val);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-gray-400">End:</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (startDate && val < startDate) {
                      toast.error("'End' date cannot be before 'Start' date");
                      return;
                    }
                    setEndDate(val);
                    setCurrentPage(1);
                  }}
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

        {/* Quotations List */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-sm text-gray-500">Loading quotations...</span>
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-2">
              <FileText className="h-10 w-10 text-gray-300" />
              <span className="text-sm font-semibold text-gray-600">No Quotations Found</span>
              <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Quote No</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {paginatedQuotations.map((q) => {
                    const isSelected = selectedQuotation && selectedQuotation.quotationNumber === q.quotationNumber;
                    return (
                      <tr 
                        key={q.quotationNumber} 
                        className={`transition cursor-pointer ${
                          isSelected ? "bg-emerald-50/50 hover:bg-emerald-50/70" : "hover:bg-gray-50/50"
                        }`}
                        onClick={() => setSelectedQuotation(q)}
                      >
                        <td className="px-6 py-4 font-bold text-gray-900">{q.quotationNumber}</td>
                        <td 
                          className="px-6 py-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClientPopup(q.customerName, q.phone, q.email, q.businessName);
                          }}
                        >
                          <div className="font-semibold text-gray-900 hover:text-emerald-700 hover:underline transition-colors">{q.customerName}</div>
                          {q.businessName && (
                            <div className="text-xs text-gray-400 mt-0.5">{q.businessName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(q.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          ₹{(q.totalQuoted || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadQuotationPDF(q, "view")}
                              className="rounded-xl flex items-center gap-1 mt-auto hover:bg-gray-150"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadQuotationPDF(q, "download")}
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
          {quotations.length > limit && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, quotations.length)} of {quotations.length} quotes
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
                {selectedQuotation 
                  ? `Activity Logs & Order History — Quotation #${selectedQuotation.quotationNumber}`
                  : `Global Quotations Activity Logs & History`
                }
              </h3>
              <p className="mt-1 text-xs text-slate-300 opacity-90">
                {selectedQuotation
                  ? `Showing order workflow logs, update audits, state transitions, and notes for selected Quote #${selectedQuotation.quotationNumber}`
                  : `Showing all quotations creation logs, status history updates, and session export audits`
                }
              </p>
            </div>
            {selectedQuotation && (
              <Button 
                onClick={() => setSelectedQuotation(null)} 
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

              let filteredLogs = [...quotationLogs];
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
                        <span className="font-semibold text-gray-850 not-italic">Notes/Details/Reason:</span> "{log.reason}"
                      </p>
                      <p className="mt-1 text-xs text-gray-400 font-medium">
                        Performed by: {log.by || "System/Admin"}
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

            {quotationLogs.length === 0 && (
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
export default Quotations;
