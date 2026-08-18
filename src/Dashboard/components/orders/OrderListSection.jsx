import React from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Factory,
  FileDown,
  FileText,
  Package,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  Edit,
  ChevronDown,
  ChevronUp,
  MapPin,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui";
import { getProductTaxInfo } from "../../utils";
import { getSystemGstConfigFromStorage } from "../../../utils/gstConfig.js";
import { useGetAllProducts } from "../../../../hook/Product";

const getOrderDisplayFinancials = (order, productItems) => {
  const sysConfig = getSystemGstConfigFromStorage();
  const lines = order?.orderDetailsList?.length > 0
    ? order.orderDetailsList
    : [order?.orderDetails].filter(Boolean);

  let dominantGst = 5;
  if (lines.length > 0) {
    const firstLine = lines[0];
    const pId = String(firstLine?.productId?._id || firstLine?.productId || "").trim();
    const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === pId);
    const pGst = prod ? (prod.custom_gst_rate ?? prod.gstRate) : null;
    if (pGst != null) dominantGst = Number(pGst);
    else if (firstLine?.gstRate != null && Number(firstLine.gstRate) > 0 && Number(firstLine.gstRate) !== 18) dominantGst = Number(firstLine.gstRate);
  }

  const effectiveTaxRate = sysConfig.gstEnabled
    ? ((order?.taxRate && Number(order.taxRate) !== 18) ? Number(order.taxRate) : (order?.quotation?.taxRate && Number(order.quotation.taxRate) !== 18 ? Number(order.quotation.taxRate) : dominantGst))
    : 0;

  const bDetails = order?.billDetails || order?.latestBill?.billDetails || order?.bill?.billDetails || {};
  const appSub = Number(bDetails.subtotal || order?.subtotalAmount || order?.quotation?.subtotalAmount || 0);
  const appShip = Number(bDetails.shipping || order?.shippingCharges || order?.quotation?.shippingCharges || 0);
  const appOth = Number(bDetails.other || order?.otherCharges || order?.quotation?.otherCharges || 0);
  const appPreDisc = Number(bDetails.preTaxDiscount || order?.discountAmount || order?.quotation?.discountAmount || 0);
  const postTaxDisc = Number(
    bDetails?.postTaxDiscount ??
    bDetails?.discount ??
    order?.discountAmount ??
    order?.quotation?.discountAmount ??
    0
  );

  const taxable = Math.max(0, appSub - appPreDisc);
  const gstAmt = sysConfig.gstEnabled ? taxable * (effectiveTaxRate / 100) : 0;
  const gross = taxable + gstAmt + appShip + appOth;
  let calculatedTotal = Number(Math.max(0, gross - postTaxDisc).toFixed(2));

  const rawBillGrandTotal = Number(
    bDetails?.grandTotal ||
    bDetails?.amount ||
    order?.latestBill?.totalAmount ||
    order?.latestBill?.amount ||
    order?.bill?.amount ||
    0
  );

  let total = 0;
  if (rawBillGrandTotal > 0) {
    total = Math.round(rawBillGrandTotal);
  } else if (Number(order?.totalAmount || 0) > 0) {
    total = Math.round(Number(order.totalAmount));
  } else if (Number(order?.quotation?.totalQuoted || 0) > 0) {
    total = Math.round(Number(order.quotation.totalQuoted));
  } else if (calculatedTotal > 0) {
    total = Math.round(calculatedTotal);
  }

  const paid = Math.round(Number(order?.paidAmount || 0));
  const due = Math.max(0, Math.round(total - paid));

  return {
    effectiveGstRate: effectiveTaxRate,
    displayTotal: total,
    displayPaid: paid,
    displayDue: due,
  };
};

const defaultOrderState = { label: "Pending", icon: Clock3, tone: "text-amber-700" };
const defaultPaymentState = {
  label: "Unpaid",
  icon: AlertTriangle,
  tone: "text-red-700",
};

export default function OrderListSection({
  orders,
  isLoading,
  checkingOrderId,
  processingActionId,
  completeActionId,
  orderStatusColors,
  paymentColors,
  orderStatusMeta,
  paymentStatusMeta,
  formatCurrency,
  onViewOrder,
  onCheckAvailability,
  onOpenQuotation,
  onOpenBill,
  onMoveToProcessing,
  onCompleteOrder,
  onMarkAsDelivered,
  onEditOrder,
  onEditDelivery,
  onDeleteOrder,
}) {
  const { data: productsData } = useGetAllProducts();
  const productItems = React.useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);

  const [expandedOrders, setExpandedOrders] = React.useState({});
  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
        <div className="flex flex-col items-center justify-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No orders found</p>
          <p className="mt-1 text-sm text-gray-500">Create your first order to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const orderState = orderStatusMeta[order.orderStatusKey] || defaultOrderState;
        const paymentState =
          paymentStatusMeta[order.paymentStatusKey] || defaultPaymentState;
        const OrderStatusIcon = orderState.icon;
        const PaymentStatusIcon = paymentState.icon;

        const isExpanded = !!expandedOrders[order.id];

        if (!isExpanded) {
          return (
            <article
              key={order.id}
              className="group rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-lg animate-fadeIn"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Customer Avatar & Basic details */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700 shadow-sm">
                    {order.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{order.reference}</span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold text-slate-700">
                        {order.source}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-gray-900 truncate mt-0.5">{order.customerName}</h4>
                    {(!order.delivery?.deliveryAddress || order.delivery.deliveryAddress === "Not added") && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        ⚠️ Address Missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Product and specifications summary */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div className="rounded-xl bg-gray-50 border border-gray-150 p-2 text-emerald-700 shadow-sm shrink-0">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Product</p>
                    {order.orderDetailsList && order.orderDetailsList.length > 1 ? (
                      <div className="space-y-0.5 mt-0.5">
                        {order.orderDetailsList.slice(0, 2).map((det, idx) => (
                          <h4 key={idx} className="text-xs font-extrabold text-gray-800 truncate leading-tight">
                            • {det.quantity} {det.unit || "pcs"}{det.bagSize ? ` (${det.bagSize})` : ""}
                          </h4>
                        ))}
                        {order.orderDetailsList.length > 2 && (
                          <p className="text-[9px] font-bold text-emerald-700">+{order.orderDetailsList.length - 2} more products</p>
                        )}
                      </div>
                    ) : (
                      <h4 className="text-xs font-bold text-gray-800 truncate mt-0.5">
                        {order.productCategory} ({order.orderDetails?.quantity} {order.orderDetails?.unit || (order.productCategory?.toLowerCase().includes("roll") ? "kg" : "pcs")})
                      </h4>
                    )}
                  </div>
                </div>

                {/* Payment Snapshot */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 shadow-sm shrink-0">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Value</p>
                    <p className="text-xs font-extrabold text-gray-900 mt-0.5">{formatCurrency(getOrderDisplayFinancials(order, productItems).displayTotal)}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {order.orderStatus === "Completed" ? (
                    <Badge
                      variant="success"
                      className="gap-1 bg-emerald-50 text-emerald-850 shadow-sm border border-emerald-300 py-0.5 px-2 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition animate-pulse"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsDelivered && onMarkAsDelivered(order);
                      }}
                      title="Click to mark as Delivered"
                    >
                      <OrderStatusIcon className="h-3 w-3 text-emerald-700" />
                      <span>{orderState.label} (Deliver)</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant={orderStatusColors[order.orderStatusKey] || "primary"}
                      className="gap-1 bg-white text-gray-850 shadow-sm border border-gray-150 py-0.5 px-2 text-xs font-semibold"
                    >
                      <OrderStatusIcon className={`h-3 w-3 ${orderState.tone}`} />
                      {orderState.label}
                    </Badge>
                  )}
                  <Badge
                    variant={paymentColors[order.paymentStatusKey] || "primary"}
                    className="gap-1 bg-white text-gray-850 shadow-sm border border-gray-150 py-0.5 px-2 text-xs font-semibold"
                  >
                    <PaymentStatusIcon className={`h-3 w-3 ${paymentState.tone}`} />
                    {paymentState.label}
                  </Badge>
                </div>

                {/* Toggle expand chevron down arrow */}
                <button
                  type="button"
                  onClick={() => toggleExpand(order.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-emerald-300 transition-colors shadow-sm self-end md:self-center"
                  title="Expand Details"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </article>
          );
        }

        return (
          <article
            key={order.id}
            className="group rounded-[28px] border border-emerald-300 bg-white p-5 shadow-md transition-all duration-200 hover:shadow-lg animate-fadeIn"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700">
                        {order.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                          {order.reference}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-gray-900">
                          {order.customerName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">Created on {order.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="shrink-0 bg-white text-gray-700 shadow-sm">
                        {order.source}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-emerald-300 transition-colors shadow-sm"
                        title="Collapse Details"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-emerald-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Business
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {order.businessName || "Not added"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-emerald-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </p>
                      <div className="mt-1 space-y-1 text-sm text-gray-900">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {order.phone}
                        </p>
                        <p className="flex items-center gap-2 break-all text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {order.email || "Not added"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(!order.delivery?.deliveryAddress || order.delivery.deliveryAddress === "Not added") ? (
                    <div className="mt-3 rounded-2xl bg-amber-50 p-2.5 border border-amber-250 flex items-center justify-between gap-2 shadow-3xs">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                        <span>Delivery Address Missing</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDelivery && onEditDelivery(order);
                        }}
                        className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.2 rounded-lg transition shadow-2xs shrink-0 cursor-pointer"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 border border-slate-200 flex items-center justify-between gap-2 shadow-3xs">
                      <div className="flex items-center gap-2 text-gray-700 text-xs font-medium min-w-0">
                        <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="truncate text-gray-600 font-semibold" title={order.delivery.deliveryAddress}>
                          Address: {order.delivery.deliveryAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDelivery && onEditDelivery(order);
                        }}
                        className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 hover:text-violet-950 shrink-0 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-gray-200 bg-gray-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-2 text-emerald-700 shadow-sm shrink-0">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        Product Summary
                      </p>
                      {order.orderDetailsList && order.orderDetailsList.length > 1 ? (
                        <div className="mt-3 space-y-3">
                          {order.orderDetailsList.map((item, idx) => {
                            const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
                            const taxInfo = getProductTaxInfo(prod || item);
                            const pName = prod?.name || item.productCategory || order.productCategory || "Product";
                            const isItemRoll = pName.toLowerCase().includes("roll") || String(item.unit).toLowerCase() === "kg" || String(item.unit).toLowerCase() === "m";

                            return (
                              <div key={idx} className="rounded-2xl bg-white p-3 border border-gray-200/80 shadow-2xs">
                                <h4 className="text-xs font-extrabold text-emerald-950 leading-tight mb-2">Item {idx + 1}: {pName}</h4>
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                    <Package className="h-3 w-3" />
                                    Qty {item.quantity || 0} {item.unit || "pcs"}
                                  </span>
                                  {!isItemRoll ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
                                      <ShoppingBag className="h-3 w-3" />
                                      Size {item.bagSize || "—"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
                                      <Package className="h-3 w-3" />
                                      GSM {item.gsm || "—"}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                                    <Ruler className="h-3 w-3" />
                                    {isItemRoll
                                      ? `${item.dimensions?.width || 0} ${item.dimensions?.unit || "inch"}`
                                      : `${item.dimensions?.length || 0}×${item.dimensions?.width || 0}×${item.dimensions?.height || 0} ${item.dimensions?.unit || "inch"}`}
                                  </span>
                                  {taxInfo.hsnCode && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-100">
                                      HSN {taxInfo.hsnCode}
                                    </span>
                                  )}
                                  {taxInfo.gstRate != null && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-100">
                                      GST {taxInfo.gstRate}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const singleItem = order.orderDetails;
                            const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(singleItem?.productId || "").trim());
                            const taxInfo = getProductTaxInfo(prod || singleItem || order);
                            const cardFinancials = getOrderDisplayFinancials(order, productItems);
                            const effectiveGstRate = cardFinancials.effectiveGstRate;
                            const pName = prod?.name || order.productCategory || "Product";
                            const isRoll = pName.toLowerCase().includes("roll") || order.productCategory?.toLowerCase().includes("roll");
                            return (
                              <>
                                <h3 className="mt-1 text-lg font-bold text-gray-900">
                                  {pName}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                  {isRoll
                                    ? "Clear roll specs for quick sales and production review."
                                    : "Clear bag specs for quick sales and production review."}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                    <Package className="h-3.5 w-3.5" />
                                    Qty {singleItem?.quantity || 0} {singleItem?.unit || "pcs"}
                                  </span>
                                  {!isRoll ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                      <ShoppingBag className="h-3.5 w-3.5" />
                                      Size {singleItem?.bagSize || "—"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                      <Package className="h-3.5 w-3.5" />
                                      GSM {singleItem?.gsm || "—"}
                                    </span>
                                  )}
                                  {taxInfo.hsnCode && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/80">
                                      HSN {taxInfo.hsnCode}
                                    </span>
                                  )}
                                  {effectiveGstRate != null && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/80">
                                      GST {effectiveGstRate}%
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white p-3">
                                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                    <Ruler className="h-3.5 w-3.5" />
                                    Dimensions
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {order.dimensionSummary}
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        Payment Snapshot
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(getOrderDisplayFinancials(order, productItems).displayTotal)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">Total order value</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                        Paid
                      </p>
                      <p className="mt-1 text-base font-bold text-blue-900">
                        {formatCurrency(getOrderDisplayFinancials(order, productItems).displayPaid)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Due
                      </p>
                      <p className="mt-1 text-base font-bold text-amber-900">
                        {formatCurrency(getOrderDisplayFinancials(order, productItems).displayDue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Payment mode
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                      {String(order.paymentMode || "Not set").replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="xl:w-64">
                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {order.orderStatus === "Completed" ? (
                        <Badge
                          variant="success"
                          className="gap-2 bg-emerald-50 text-emerald-850 shadow-sm border border-emerald-300 py-1 px-2.5 font-bold cursor-pointer hover:bg-emerald-100 transition animate-pulse"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsDelivered && onMarkAsDelivered(order);
                          }}
                          title="Click to mark as Delivered"
                        >
                          <OrderStatusIcon className="h-3.5 w-3.5 text-emerald-700" />
                          <span>{orderState.label} (Click to Deliver)</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant={orderStatusColors[order.orderStatusKey] || "primary"}
                          className="gap-2 bg-white text-gray-800 shadow-sm"
                        >
                          <OrderStatusIcon className={`h-3.5 w-3.5 ${orderState.tone}`} />
                          {orderState.label}
                        </Badge>
                      )}
                      <Badge
                        variant={paymentColors[order.paymentStatusKey] || "primary"}
                        className="gap-2 bg-white text-gray-800 shadow-sm"
                      >
                        <PaymentStatusIcon className={`h-3.5 w-3.5 ${paymentState.tone}`} />
                        {paymentState.label}
                      </Badge>
                    </div>

                    <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Quick status
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {order.orderStatus === "Completed"
                          ? "This order is finished and ready for review."
                          : order.orderStatus === "Processing"
                            ? "Work is in progress. Keep the team updated here."
                            : order.orderStatus === "Confirmed"
                              ? "Ready for availability check and production move."
                              : "Needs action before production starts."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                      <button
                        type="button"
                        onClick={() => onViewOrder(order)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View details</span>
                      </button>

                      {order.orderStatusKey !== "COMPLETED" && order.orderStatusKey !== "DELIVERED" && order.orderStatusKey !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                          title="Edit Order Details"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                          <span>Edit order</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onCheckAvailability(order)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        title="Check Availability"
                      >
                        {checkingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ClipboardCheck className="h-4 w-4" />
                        )}
                        <span>{checkingOrderId === order.id ? "Checking..." : "Check stock"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenQuotation(order)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                        title="Create Quotation"
                      >
                        <FileDown className="h-4 w-4" />
                        <span>Create quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenBill(order)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        title="Create Bill / Invoice"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Create bill</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder && onDeleteOrder(order)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        title="Delete Order Permanently"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span>Delete order</span>
                      </button>

                      {order.orderStatusKey === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => onMoveToProcessing(order)}
                          disabled={processingActionId === order.id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Start Processing"
                        >
                          {processingActionId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Factory className="h-4 w-4" />
                          )}
                          <span>Start process</span>
                        </button>
                      )}

                      {order.orderStatusKey === "PROCESSING" && (
                        <button
                          type="button"
                          onClick={() => onCompleteOrder(order)}
                          disabled={completeActionId === order.id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Complete Order"
                        >
                          {completeActionId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span>Complete order</span>
                        </button>
                      )}

                      {order.orderStatusKey === "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => onMarkAsDelivered && onMarkAsDelivered(order)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          title="Mark as Delivered"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
