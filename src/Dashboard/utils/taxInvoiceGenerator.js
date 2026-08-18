import { getProductTaxInfo } from "./index.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { getSystemGstConfigFromStorage } from "../../utils/gstConfig";

// Helper function to convert number to Words in Indian Currency format
export function numberToIndianWords(num) {
  if (num === null || num === undefined || isNaN(num)) return "Rupees Zero Only";
  const absNum = Math.abs(Number(num));
  const integerPart = Math.floor(absNum);
  const decimalPart = Math.round((absNum - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "Rupees Zero Only";

  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n) {
    if (n < 10) return single[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return (tens[Math.floor(n / 10)] + " " + single[n % 10]).trim();
  }

  function convertThreeDigits(n) {
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + " Hundred ";
    }
    str += convertTwoDigits(n % 100);
    return str.trim();
  }

  let words = "";
  let remainder = integerPart;

  if (Math.floor(remainder / 10000000) > 0) {
    words += convertTwoDigits(Math.floor(remainder / 10000000)) + " Crore ";
    remainder %= 10000000;
  }
  if (Math.floor(remainder / 100000) > 0) {
    words += convertTwoDigits(Math.floor(remainder / 100000)) + " Lakh ";
    remainder %= 100000;
  }
  if (Math.floor(remainder / 1000) > 0) {
    words += convertTwoDigits(Math.floor(remainder / 1000)) + " Thousand ";
    remainder %= 1000;
  }
  if (remainder > 0) {
    words += convertThreeDigits(remainder) + " ";
  }

  let result = "Rupees " + words.trim();
  if (decimalPart > 0) {
    result += " and " + convertTwoDigits(decimalPart) + " Paise";
  }
  result += " Only";
  return result;
}

// Global cached PNG logo base64 string to ensure zero black background distortion
let globalLogoPngCache = null;

export function preloadLogoBase64() {
  if (globalLogoPngCache) return globalLogoPngCache;
  if (typeof window === "undefined") return null;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      globalLogoPngCache = canvas.toDataURL("image/png");
    };
    img.src = "/Nirmalyam_Logo-removebg-preview.webp";
  } catch (_) {}
  return globalLogoPngCache;
}

// Preload logo on module load
if (typeof window !== "undefined") {
  preloadLogoBase64();
}

export const generateTaxInvoicePDF = ({
  order,
  billReceipt,
  mode = "download",
  businessConfig = {},
  allProducts = [],
  logoBase64Input = null,
}) => {
  const ordObj = order || {};
  const rc = billReceipt || {};
  const sysConfig = getSystemGstConfigFromStorage();
  const globalGstSetting = businessConfig.gstEnabled ?? businessConfig.isGstEnabled ?? sysConfig.gstEnabled ?? true;

  // Resolve GST mode: If GST is disabled in system settings, GST is strictly false (0%)
  const isGstEnabled = !globalGstSetting
    ? false
    : (rc.billDetails?.gstEnabled ?? rc.gstEnabled ?? ordObj.billDetails?.gstEnabled ?? ordObj.quotation?.gstEnabled ?? ordObj.gstEnabled ?? true);

  const busGst = businessConfig.businessGstNumber || "27AAACN1234F1Z1";
  const busName = businessConfig.companyName || "Nirmalyam Krafts";
  const busAddress = businessConfig.businessAddress || "Plot No. 12, Industrial Area, Nagpur, Maharashtra - 440001";
  const busStateName = businessConfig.businessStateName || "Maharashtra";
  const busStateCode = businessConfig.businessStateCode || "27";
  const busPhone = businessConfig.businessPhone || "+91 90490 01299";
  const busEmail = businessConfig.businessEmail || "nirmalyamkrafts@gmail.com";

  const savedBankHolder = localStorage.getItem("nirmalyam_bank_holder");
  const savedBankName = localStorage.getItem("nirmalyam_bank_name");
  const savedBankAccount = localStorage.getItem("nirmalyam_bank_account");
  const savedBankIfsc = localStorage.getItem("nirmalyam_bank_ifsc");
  const savedBankUpi = localStorage.getItem("nirmalyam_bank_upi");
  const savedShowPayment = localStorage.getItem("nirmalyam_show_payment") !== "false";
  const savedInvoiceTerms = localStorage.getItem("nirmalyam_invoice_terms");

  const bankInfo = {
    holder: savedBankHolder || businessConfig.bankDetails?.holder || "Nirmalyam Krafts",
    bankName: savedBankName || businessConfig.bankDetails?.bankName || "Bank Of Maharashtra",
    accountNo: savedBankAccount || businessConfig.bankDetails?.accountNo || "39824872901",
    ifscCode: savedBankIfsc || businessConfig.bankDetails?.ifscCode || "BOM0001299",
    upiId: savedBankUpi || businessConfig.bankDetails?.upiId || "nirmalyam@bom",
    show: savedShowPayment
  };

  const termsText = savedInvoiceTerms || businessConfig.termsAndConditions || "1. Payment is strictly net due upon receipt of invoice.\n2. Interest of 18% p.a. will be charged on late payments.\n3. Goods once sold cannot be returned without validation.";

  // Pre-generation validation check #1: Business GSTIN (only required if GST is enabled)
  if (isGstEnabled && (!busGst || !busGst.trim())) {
    toast.error("Business GSTIN is missing in settings. Please configure business GSTIN before issuing tax invoices.");
    return false;
  }

  // Extract recipient details
  const custName = rc.customerName || ordObj.customerName || "Customer";
  const busCustName = rc.businessName || ordObj.businessName || "";
  const custPhone = rc.phone || ordObj.phone || "";
  const custGst = rc.gstNumber || ordObj.gstNumber || ordObj.billDetails?.gstNumber || "";
  const custStateCode = ordObj.stateCode || rc.stateCode || "27";
  const custStateName = ordObj.stateName || rc.stateName || "Maharashtra";
  const billingAddr = ordObj.billingAddress || ordObj.address || rc.billingAddress || rc.address || "";
  const deliveryAddr = ordObj.deliveryAddress || ordObj.delivery?.deliveryAddress || rc.deliveryAddress || "";

  // Financial Breakdown resolution from Quotation -> Bill -> Order
  const qObj = ordObj.quotation || rc.quotation || {};
  const bObj = rc.billDetails || ordObj.billDetails || {};

  const qItems = qObj.items || [];
  const bItems = bObj.items || [];
  const oItems = ordObj.orderDetailsList?.length > 0 ? ordObj.orderDetailsList : (ordObj.orderDetails ? [ordObj.orderDetails] : []);

  // Primary items list: Quotation items have authoritative rates
  let sourceItems = [];
  if (qItems.length > 0) sourceItems = qItems;
  else if (bItems.length > 0) sourceItems = bItems;
  else if (oItems.length > 0) sourceItems = oItems;
  else sourceItems = [{}];

  // Resolve Shipping, Other Charges, Discounts directly from quotation / order / bill
  const shippingVal = Number(
    bObj.shipping ??
    bObj.shippingCharges ??
    qObj.shippingCharges ??
    ordObj.shippingCharges ??
    rc.shippingCharges ??
    0
  );

  const otherVal = Number(
    bObj.other ??
    bObj.otherCharges ??
    qObj.otherCharges ??
    ordObj.otherCharges ??
    rc.otherCharges ??
    0
  );

  const preTaxDiscountVal = Number(bObj.preTaxDiscount ?? rc.preTaxDiscount ?? 0);
  const postTaxDiscountVal = Number(bObj.postTaxDiscount ?? rc.postTaxDiscount ?? 0);

  // Pre-generation validation check #2: Mandatory Billing Address & State Code when required
  const isGstEntered = Boolean(custGst && custGst.trim().length > 0);
  const totalVal = Number(rc.amount || rc.totalOrderAmount || ordObj.totalAmount || qObj.totalQuoted || 0);
  const isHighValue = totalVal > 50000;
  const isBillingRequired = isGstEntered || isHighValue;

  if (isBillingRequired && (!billingAddr || !billingAddr.trim() || !custStateCode)) {
    toast.error("Billing Address and State Code are required for this order before issuing a Tax Invoice.");
    return false;
  }

  // Delivery Address display
  const shipToAddressDisplay = deliveryAddr && deliveryAddr.trim() ? deliveryAddr.trim() : "Pickup / Self Collection";
  const placeOfSupply = `${custStateCode} - ${custStateName}`;

  // Intra-state (CGST+SGST) vs Inter-state (IGST) determination
  const isIntraState = String(custStateCode).trim() === String(busStateCode).trim();

  // Create PDF Document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const brand = [10, 92, 67]; // Emerald Green
  const gold = [212, 175, 55]; // Gold Accent

  // Load Logo PNG without dark box artifacts
  const logoPng = logoBase64Input || globalLogoPngCache || preloadLogoBase64();

  // Top Header Band
  doc.setFillColor(brand[0], brand[1], brand[2]);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.rect(0, 38, pageWidth, 2, "F");

  // Render Logo cleanly with natural vertical oval aspect ratio
  if (logoPng && logoPng.startsWith("data:image/")) {
    try {
      doc.addImage(logoPng, "PNG", 10, 5, 20, 26);
    } catch (_) {}
  }

  // Left Company Details
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(busName, 34, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(230, 245, 238);
  doc.text(`${busAddress}`, 34, 19);
  doc.text(`Phone: ${busPhone} | Email: ${busEmail}`, 34, 25);
  if (isGstEnabled) {
    doc.text(`GSTIN: ${busGst} | State: ${busStateCode} - ${busStateName}`, 34, 31);
  } else {
    doc.text(`State: ${busStateCode} - ${busStateName}`, 34, 31);
  }

  // Right Invoice Title & Meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(isGstEnabled ? "TAX INVOICE" : "INVOICE / BILL OF SUPPLY", pageWidth - 10, 13, { align: "right" });

  const invoiceNo = rc.receiptNumber || ordObj.invoiceNumber || `INV-${String(ordObj._id || ordObj.id || Date.now()).slice(-6).toUpperCase()}`;
  const issueDate = rc.paidAt ? new Date(rc.paidAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(230, 245, 238);
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - 10, 20, { align: "right" });
  doc.text(`Date of Issue: ${issueDate}`, pageWidth - 10, 25, { align: "right" });
  doc.text(`Reverse Charge: No`, pageWidth - 10, 30, { align: "right" });

  // SECTION 2: RECIPIENT (BILL TO) & DELIVERY (SHIP TO) CARDS
  let startY = 44;
  doc.setFontSize(8.5);

  const cardWidth = 92;
  const cardHeight = 36;

  // Bill To Box (Left Side)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, startY, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, startY, cardWidth, cardHeight, 2, 2, "D");

  doc.setTextColor(10, 92, 67);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO (RECIPIENT):", 14, startY + 5.5);

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  const recipientNameText = `${custName}${busCustName ? ` (${busCustName})` : ""}`;
  doc.text(doc.splitTextToSize(recipientNameText, 84).slice(0, 1), 14, startY + 11);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const cleanAddr = billingAddr.replace(/,\s*,/g, ",").trim();
  const billAddrLines = doc.splitTextToSize(`Address: ${cleanAddr || "—"}`, 84);
  doc.text(billAddrLines.slice(0, 2), 14, startY + 16);
  doc.text(`State: ${custStateCode} - ${custStateName}`, 14, startY + 26);
  if (isGstEnabled) {
    doc.text(`GSTIN: ${custGst ? custGst : "Unregistered"} | Mob: ${custPhone || "—"}`, 14, startY + 31);
  } else {
    doc.text(`Mob: ${custPhone || "—"}`, 14, startY + 31);
  }

  // Ship To Box (Right Side)
  const rightCardX = 108;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightCardX, startY, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, startY, cardWidth, cardHeight, 2, 2, "D");

  doc.setTextColor(10, 92, 67);
  doc.setFont("helvetica", "bold");
  doc.text("SHIP TO / DELIVERY DETAILS:", rightCardX + 4, startY + 5.5);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  const shipAddrLines = doc.splitTextToSize(`Delivery: ${shipToAddressDisplay}`, 84);
  doc.text(shipAddrLines.slice(0, 2), rightCardX + 4, startY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Place of Supply: ${placeOfSupply}`, rightCardX + 4, startY + 22);
  const payRefNum = rc.paymentRefNumber || ordObj.confirmedPayment?.paymentRefNumber || "";
  const payRefType = rc.paymentRefType || ordObj.confirmedPayment?.paymentRefType || "Ref";
  let payModeDisplay = `Payment Mode: ${String(rc.paymentMode || ordObj.paymentMode || "INVOICE").toUpperCase()}`;
  if (payRefNum) {
    payModeDisplay += ` (${payRefType}: ${payRefNum})`;
  }
  doc.text(payModeDisplay, rightCardX + 4, startY + 28);

  // Determine dominant GST Rate for column header
  let dominantGstRate = 0;
  if (isGstEnabled) {
    if (sourceItems.length > 0) {
      const firstItem = sourceItems[0];
      const qMatch = qItems.find(q =>
        (q.productId && firstItem.productId && String(q.productId).trim() === String(firstItem.productId).trim()) ||
        (q.productName && firstItem.productName && q.productName.toLowerCase().trim() === firstItem.productName.toLowerCase().trim())
      );
      const firstProd = allProducts?.find(p => String(p?._id || p?.id || "").trim() === String(firstItem?.productId || "").trim());
      const firstTaxInfo = getProductTaxInfo(firstProd || firstItem || qMatch);
      const bTaxRate = Number(bObj.taxRate ?? rc.taxRate ?? ordObj.taxRate ?? 0);
      dominantGstRate = Number(
        (bTaxRate > 0 ? bTaxRate : null) ??
        (firstProd?.gstRate != null && Number(firstProd.gstRate) > 0 ? Number(firstProd.gstRate) : null) ??
        (firstTaxInfo?.gstRate != null ? Number(firstTaxInfo.gstRate) : null) ??
        firstItem?.gstRate ??
        qMatch?.gstRate ??
        5
      );
    }
  }

  const halfDominantRate = dominantGstRate / 2;

  // Clean 9-Column (Intra-State), 8-Column (Inter-State), or 6-Column (GST Disabled) Header
  const headRow = !isGstEnabled
    ? [["#", "Item Details & Specifications", "HSN", "Qty", "Rate (Rs)", "Amount (Rs)"]]
    : (isIntraState
        ? [["#", "Item Details & Specifications", "HSN", "Qty", "Rate (Rs)", "Taxable (Rs)", `CGST (${halfDominantRate}%)`, `SGST (${halfDominantRate}%)`, "Total (Rs)"]]
        : [["#", "Item Details & Specifications", "HSN", "Qty", "Rate (Rs)", "Taxable (Rs)", `IGST (${dominantGstRate}%)`, "Total (Rs)"]]);

  const qSubtotal = Number(bObj.subtotal || qObj.subtotalAmount || ordObj.quotation?.subtotalAmount || ordObj.subtotalAmount || 0);

  // Load lineUnitPrices from localStorage or order object
  const orderIdKey = String(ordObj._id || ordObj.id || rc.orderId || "");
  let lineUnitPrices = {};
  try {
    if (typeof window !== "undefined" && orderIdKey) {
      const stored = localStorage.getItem(`nirmalyam_lineUnitPrices_${orderIdKey}`);
      if (stored) lineUnitPrices = JSON.parse(stored);
    }
  } catch (_) {}
  if (Object.keys(lineUnitPrices).length === 0) {
    lineUnitPrices = ordObj.lineUnitPrices || ordObj.quotation?.lineUnitPrices || qObj.lineUnitPrices || {};
  }

  // First Pass: Calculate gross subtotal across source items
  let grossSubtotalSum = 0;
  const rawItemSpecs = sourceItems.map((item, idx) => {
    const qMatch = qItems.find(q =>
      (q.productId && item.productId && String(q.productId).trim() === String(item.productId).trim()) ||
      (q.productName && item.productName && q.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
    );
    const bMatch = bItems.find(b =>
      (b.productId && item.productId && String(b.productId).trim() === String(item.productId).trim()) ||
      (b.productName && item.productName && b.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
    );
    const prod = allProducts?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
    const productName = item.productName || qMatch?.productName || prod?.name || prod?.title || item.productCategory || ordObj.productCategory || "Kraft Paper Bag";
    const hsn = item.hsnCode || qMatch?.hsnCode || prod?.hsnCode || "4805";
    const qty = Number(item.quantity || item.qty || qMatch?.quantity || 1);
    const unit = item.unit || qMatch?.unit || "pcs";

    let unitRate = 0;
    const itemKey = item.productId || idx;
    if (lineUnitPrices[itemKey] && Number(lineUnitPrices[itemKey]) > 0) {
      unitRate = Number(lineUnitPrices[itemKey]);
    } else if (lineUnitPrices[idx] && Number(lineUnitPrices[idx]) > 0) {
      unitRate = Number(lineUnitPrices[idx]);
    } else if (qMatch?.unitPrice && Number(qMatch.unitPrice) > 0) {
      unitRate = Number(qMatch.unitPrice);
    } else if (item.unitPrice && Number(item.unitPrice) > 0) {
      unitRate = Number(item.unitPrice);
    } else if (item.pricePerUnit && Number(item.pricePerUnit) > 0) {
      unitRate = Number(item.pricePerUnit);
    } else if (item.rate && Number(item.rate) > 0) {
      unitRate = Number(item.rate);
    } else if (item.price && Number(item.price) > 0) {
      unitRate = Number(item.price);
    } else if (qMatch?.pricePerUnit || qMatch?.rate || qMatch?.price) {
      unitRate = Number(qMatch.pricePerUnit || qMatch.rate || qMatch.price);
    } else if (bMatch?.unitPrice && Number(bMatch.unitPrice) > 0) {
      unitRate = Number(bMatch.unitPrice);
    } else if (prod?.sellingPrice || prod?.basePrice || prod?.unitPrice) {
      unitRate = Number(prod.sellingPrice || prod.basePrice || prod.unitPrice);
    }

    if (unitRate === 0 || isNaN(unitRate)) {
      unitRate = qSubtotal > 0 && qty > 0 ? qSubtotal / qty : 100.00;
    }

    const grossTaxable = Number((qty * unitRate).toFixed(2));
    grossSubtotalSum += grossTaxable;

    const taxInfo = getProductTaxInfo(prod || item || qMatch);
    let lineGstRate = 0;
    if (isGstEnabled) {
      const bTaxRate = Number(bObj.taxRate ?? rc.taxRate ?? ordObj.taxRate ?? 0);
      if (bTaxRate > 0) {
        lineGstRate = bTaxRate;
      } else if (prod?.gstRate != null && !isNaN(Number(prod.gstRate)) && Number(prod.gstRate) > 0) {
        lineGstRate = Number(prod.gstRate);
      } else if (taxInfo?.gstRate != null && !isNaN(Number(taxInfo.gstRate))) {
        lineGstRate = Number(taxInfo.gstRate);
      } else if (item?.gstRate != null && !isNaN(Number(item.gstRate))) {
        lineGstRate = Number(item.gstRate);
      } else if (qMatch?.gstRate != null && !isNaN(Number(qMatch.gstRate))) {
        lineGstRate = Number(qMatch.gstRate);
      } else {
        lineGstRate = 5;
      }
    }

    return { item, qMatch, prod, productName, hsn, qty, unit, unitRate, grossTaxable, lineGstRate };
  });

  // Scale item subtotals if target subtotal is known and differs from grossSubtotalSum
  const targetSubtotal = qSubtotal > 0 ? qSubtotal : grossSubtotalSum;
  if (targetSubtotal > 0 && grossSubtotalSum > 0 && Math.abs(grossSubtotalSum - targetSubtotal) > 0.01) {
    const scaleFactor = targetSubtotal / grossSubtotalSum;
    grossSubtotalSum = 0;
    rawItemSpecs.forEach((spec) => {
      spec.grossTaxable = Number((spec.grossTaxable * scaleFactor).toFixed(2));
      spec.unitRate = spec.qty > 0 ? Number((spec.grossTaxable / spec.qty).toFixed(2)) : spec.grossTaxable;
      grossSubtotalSum += spec.grossTaxable;
    });
  }

  // Pre-tax discount calculation
  const discountRatio = (preTaxDiscountVal > 0 && grossSubtotalSum > 0)
    ? Math.max(0, (grossSubtotalSum - preTaxDiscountVal) / grossSubtotalSum)
    : 1;

  let cumulativeGrossSubtotal = grossSubtotalSum;
  let cumulativeTaxableBase = 0;
  let cumulativeCgst = 0;
  let cumulativeSgst = 0;
  let cumulativeIgst = 0;

  const tableBody = rawItemSpecs.map((spec, idx) => {
    // Net Taxable Base per line item after pre-tax discount
    const netTaxableVal = Number((spec.grossTaxable * discountRatio).toFixed(2));
    cumulativeTaxableBase += netTaxableVal;

    // Build specification details label
    const bagSize = spec.item.bagSize || spec.qMatch?.bagSize || ordObj.orderDetails?.bagSize || "";
    const gsm = spec.item.gsm || spec.qMatch?.gsm || ordObj.orderDetails?.gsm || "";
    const dims = spec.item.dimensions || spec.qMatch?.dimensions || ordObj.orderDetails?.dimensions || {};
    let specText = spec.productName;
    const extraSpecs = [];
    if (bagSize) extraSpecs.push(`Size: ${bagSize}`);
    if (gsm) extraSpecs.push(`GSM: ${gsm}`);
    if (dims.width) {
      extraSpecs.push(`Dims: ${dims.length ? `${dims.length} × ` : ""}${dims.width}${dims.height ? ` × ${dims.height}` : ""} ${dims.unit || "inch"}`);
    }
    if (extraSpecs.length > 0) {
      specText += `\n(${extraSpecs.join(" | ")})`;
    }

    if (!isGstEnabled) {
      return [
        idx + 1,
        specText,
        spec.hsn,
        `${spec.qty} ${spec.unit}`,
        `Rs. ${spec.unitRate.toFixed(2)}`,
        `Rs. ${spec.grossTaxable.toFixed(2)}`,
      ];
    } else if (isIntraState) {
      const halfRate = spec.lineGstRate / 2;
      const cgst = Number((netTaxableVal * (halfRate / 100)).toFixed(2));
      const sgst = Number((netTaxableVal * (halfRate / 100)).toFixed(2));
      cumulativeCgst += cgst;
      cumulativeSgst += sgst;
      const lineTotal = Number((spec.grossTaxable + cgst + sgst).toFixed(2));

      return [
        idx + 1,
        specText,
        spec.hsn,
        `${spec.qty} ${spec.unit}`,
        `Rs. ${spec.unitRate.toFixed(2)}`,
        `Rs. ${spec.grossTaxable.toFixed(2)}`,
        `Rs. ${cgst.toFixed(2)}`,
        `Rs. ${sgst.toFixed(2)}`,
        `Rs. ${lineTotal.toFixed(2)}`,
      ];
    } else {
      const igst = Number((netTaxableVal * (spec.lineGstRate / 100)).toFixed(2));
      cumulativeIgst += igst;
      const lineTotal = Number((spec.grossTaxable + igst).toFixed(2));

      return [
        idx + 1,
        specText,
        spec.hsn,
        `${spec.qty} ${spec.unit}`,
        `Rs. ${spec.unitRate.toFixed(2)}`,
        `Rs. ${spec.grossTaxable.toFixed(2)}`,
        `Rs. ${igst.toFixed(2)}`,
        `Rs. ${lineTotal.toFixed(2)}`,
      ];
    }
  });

  // Calculate Grand Total: Taxable Base + GST + Shipping + Other - Post-Tax Discount
  const rawGrandTotal = isGstEnabled
    ? (isIntraState
        ? cumulativeTaxableBase + cumulativeCgst + cumulativeSgst + shippingVal + otherVal - postTaxDiscountVal
        : cumulativeTaxableBase + cumulativeIgst + shippingVal + otherVal - postTaxDiscountVal)
    : (cumulativeTaxableBase + shippingVal + otherVal - postTaxDiscountVal);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOffAmount = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

  const paidSoFar = Number(rc.paidSoFar || ordObj.paidAmount || 0);
  const balanceDue = Math.max(0, roundedGrandTotal - paidSoFar);

  // Render Table with autoTable
  autoTable(doc, {
    startY: 84,
    margin: { left: 10, right: 10 },
    head: headRow,
    body: tableBody,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: { top: 2.5, bottom: 2.5, left: 1.5, right: 1.5 }, valign: "middle", halign: "center" },
    headStyles: { fillColor: brand, fontStyle: "bold", textColor: [255, 255, 255] },
    columnStyles: !isGstEnabled
      ? {
          0: { cellWidth: 12 },
          1: { cellWidth: 80, halign: "left" },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 28, halign: "right" },
          5: { cellWidth: 30, halign: "right" },
        }
      : (isIntraState
          ? {
              0: { cellWidth: 9 },
              1: { cellWidth: 47, halign: "left" },
              2: { cellWidth: 15 },
              3: { cellWidth: 15 },
              4: { cellWidth: 20, halign: "right" },
              5: { cellWidth: 21, halign: "right" },
              6: { cellWidth: 21, halign: "right" },
              7: { cellWidth: 21, halign: "right" },
              8: { cellWidth: 21, halign: "right" },
            }
          : {
              0: { cellWidth: 10 },
              1: { cellWidth: 58, halign: "left" },
              2: { cellWidth: 16 },
              3: { cellWidth: 16 },
              4: { cellWidth: 22, halign: "right" },
              5: { cellWidth: 22, halign: "right" },
              6: { cellWidth: 22, halign: "right" },
              7: { cellWidth: 24, halign: "right" },
            }),
  });

  const finalY = doc.lastAutoTable.finalY + 6;

  // SECTION 4: TOTALS & BANK DETAILS GRID
  doc.setFontSize(8.5);

  // Bank & Payment Details Box (Left Side)
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(10, finalY, 96, 36, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, finalY, 96, 36, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 92, 67);
  doc.text("BANK & PAYMENT DETAILS:", 14, finalY + 5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Account Holder: ${bankInfo.holder}`, 14, finalY + 10);
  doc.text(`Bank: ${bankInfo.bankName} | A/C: ${bankInfo.accountNo}`, 14, finalY + 15);
  doc.text(`IFSC: ${bankInfo.ifscCode}${bankInfo.upiId ? ` | UPI: ${bankInfo.upiId}` : ""}`, 14, finalY + 20);
  doc.setFont("helvetica", "bold");
  doc.text(`Amount in Words:`, 14, finalY + 26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 92, 67);
  const wordsText = numberToIndianWords(roundedGrandTotal);
  doc.text(doc.splitTextToSize(wordsText, 88), 14, finalY + 31);

  // Totals Summary Box (Right Side)
  const rightLabelX = pageWidth - 80;
  const rightValX = pageWidth - 10;

  let currentY = finalY + 2;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  if (preTaxDiscountVal > 0) {
    doc.text("Subtotal (Gross Value):", rightLabelX, currentY);
    doc.text(`Rs. ${cumulativeGrossSubtotal.toFixed(2)}`, rightValX, currentY, { align: "right" });

    currentY += 5;
    doc.text("Discount:", rightLabelX, currentY);
    doc.text(`- Rs. ${preTaxDiscountVal.toFixed(2)}`, rightValX, currentY, { align: "right" });

    currentY += 5;
    doc.setFont("helvetica", "bold");
    doc.text(isGstEnabled ? "Taxable Base:" : "Subtotal:", rightLabelX, currentY);
    doc.text(`Rs. ${cumulativeTaxableBase.toFixed(2)}`, rightValX, currentY, { align: "right" });
    doc.setFont("helvetica", "normal");
  } else {
    doc.text(isGstEnabled ? "Subtotal (Taxable Value):" : "Subtotal:", rightLabelX, currentY);
    doc.text(`Rs. ${cumulativeTaxableBase.toFixed(2)}`, rightValX, currentY, { align: "right" });
  }

  if (isGstEnabled) {
    if (isIntraState) {
      currentY += 5;
      doc.text(`Central Tax (CGST ${halfDominantRate}%):`, rightLabelX, currentY);
      doc.text(`Rs. ${cumulativeCgst.toFixed(2)}`, rightValX, currentY, { align: "right" });

      currentY += 5;
      doc.text(`State Tax (SGST ${halfDominantRate}%):`, rightLabelX, currentY);
      doc.text(`Rs. ${cumulativeSgst.toFixed(2)}`, rightValX, currentY, { align: "right" });
    } else {
      currentY += 5;
      doc.text(`Integrated Tax (IGST ${dominantGstRate}%):`, rightLabelX, currentY);
      doc.text(`Rs. ${cumulativeIgst.toFixed(2)}`, rightValX, currentY, { align: "right" });
    }
  }

  if (shippingVal > 0) {
    currentY += 5;
    doc.text("Shipping & Transport:", rightLabelX, currentY);
    doc.text(`Rs. ${shippingVal.toFixed(2)}`, rightValX, currentY, { align: "right" });
  }

  if (otherVal > 0) {
    currentY += 5;
    doc.text("Other Handling Charges:", rightLabelX, currentY);
    doc.text(`Rs. ${otherVal.toFixed(2)}`, rightValX, currentY, { align: "right" });
  }

  if (postTaxDiscountVal > 0) {
    currentY += 5;
    doc.text("Discount:", rightLabelX, currentY);
    doc.text(`- Rs. ${postTaxDiscountVal.toFixed(2)}`, rightValX, currentY, { align: "right" });
  }

  currentY += 5;
  doc.text("Round Off (Sec 170):", rightLabelX, currentY);
  doc.text(`${roundOffAmount >= 0 ? "+" : ""}${roundOffAmount.toFixed(2)}`, rightValX, currentY, { align: "right" });

  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(10, 92, 67);
  doc.text("Grand Total:", rightLabelX, currentY);
  doc.text(`Rs. ${roundedGrandTotal.toFixed(2)}`, rightValX, currentY, { align: "right" });

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Amount Paid So Far:", rightLabelX, currentY);
  doc.text(`Rs. ${paidSoFar.toFixed(2)}`, rightValX, currentY, { align: "right" });

  currentY += 5;
  doc.setFont("helvetica", "bold");
  if (balanceDue === 0) {
    doc.setTextColor(10, 92, 67);
    doc.text("Balance Due:", rightLabelX, currentY);
    doc.text("Rs. 0.00 (Paid in Full)", rightValX, currentY, { align: "right" });
  } else {
    doc.setTextColor(190, 30, 30);
    doc.text("Balance Due:", rightLabelX, currentY);
    doc.text(`Rs. ${balanceDue.toFixed(2)}`, rightValX, currentY, { align: "right" });
  }

  // SECTION 5: FOOTER (TERMS & SIGNATORY)
  const footerY = Math.max(finalY + 44, currentY + 10);
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  // Terms Box
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 10, footerY);
  doc.setFont("helvetica", "normal");
  const splitTerms = doc.splitTextToSize(termsText, 110);
  doc.text(splitTerms, 10, footerY + 4);

  // Signatory Block
  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 92, 67);
  doc.text(`For ${busName}`, pageWidth - 55, footerY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Authorized Signatory", pageWidth - 55, footerY + 16);

  // Static Legal Disclaimer at Bottom Page
  const disclaimerY = pageHeight - 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This is a computer-generated tax invoice issued under Section 31 of the CGST Act, 2017.",
    pageWidth / 2,
    disclaimerY,
    { align: "center" }
  );

  // Output or Save
  if (mode === "view") {
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`Tax_Invoice_${invoiceNo}.pdf`);
  }
  return true;
};
