import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User2,
  Printer,
} from "lucide-react";
import { Badge } from "../ui";
import { getProductTaxInfo } from "../../utils";
import { useGetAllProducts } from "../../../../hook/Product";

const orderStatusConfig = {
  PENDING: { label: "Pending", icon: Clock, variant: "warning" },
  CONFIRMED: { label: "Confirmed", icon: ShieldCheck, variant: "success" },
  PROCESSING: { label: "Processing", icon: RefreshCw, variant: "primary" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, variant: "success" },
  CANCELLED: { label: "Cancelled", icon: AlertTriangle, variant: "danger" },
};

const paymentStatusConfig = {
  UNPAID: { label: "Unpaid", icon: AlertTriangle, variant: "danger" },
  PARTIAL: { label: "Partial Paid", icon: CreditCard, variant: "warning" },
  PAID: { label: "Paid", icon: CheckCircle2, variant: "success" },
};

const workflowSteps = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: ShieldCheck },
  { key: "PROCESSING", label: "Processing", icon: RefreshCw },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2 },
];

const infoCardClass = "rounded-2xl border border-gray-200 bg-white p-5";
const miniStatClass = "rounded-xl bg-gray-50 p-3";

function formatDate(dateString) {
  if (!dateString) return "Not added";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString()}`;
}

function DetailBlock({ icon: Icon, label, value, tone = "text-gray-900" }) {
  return (
    <div className={miniStatClass}>
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold break-all ${tone}`}>{value}</p>
    </div>
  );
}

export default function OrderDetail({ order, onEditDelivery }) {
  const { data: productsData } = useGetAllProducts();
  const productItems = React.useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  if (!order) return null;

  const orderStatus = orderStatusConfig[order.orderStatusKey] || orderStatusConfig.PENDING;
  const paymentStatus =
    paymentStatusConfig[order.paymentStatusKey] || paymentStatusConfig.UNPAID;
  const OrderStatusIcon = orderStatus.icon;
  const PaymentStatusIcon = paymentStatus.icon;

  const totalAmount = Number(order.amount || order.totalAmount || 0);
  const paidAmount = Number(order.paidAmount || 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const paymentProgress = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;

  const dimensions = order.orderDetails?.dimensions || {};
  const isRoll = order.productCategory?.toLowerCase().includes("roll");
  const dimensionLabel = isRoll
    ? `Width: ${Number(dimensions.width || 0)} ${dimensions.unit || "inch"}`
    : Number(dimensions.length || 0) || Number(dimensions.width || 0) || Number(dimensions.height || 0)
      ? `${Number(dimensions.length || 0)} x ${Number(dimensions.width || 0)} x ${Number(dimensions.height || 0)} ${dimensions.unit || "inch"}`
      : "Not added";

  const currentStepIndex = workflowSteps.findIndex((step) => step.key === order.orderStatusKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="space-y-6"
    >
      <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              {order.reference || `#${String(order.id || "").slice(-6).toUpperCase()}`}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{order.customerName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(order.createdAt || order.fullDate || order.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                {order.productCategory}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={orderStatus.variant} className="gap-2 bg-white text-gray-900 shadow-sm">
              <OrderStatusIcon className="h-4 w-4" />
              {orderStatus.label}
            </Badge>
            <Badge
              variant={paymentStatus.variant}
              className="gap-2 bg-white text-gray-900 shadow-sm"
            >
              <PaymentStatusIcon className="h-4 w-4" />
              {paymentStatus.label}
            </Badge>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/80 bg-white/80 p-4">
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            {workflowSteps.map((step, index) => {
              const StepIcon = step.icon;
              const active = index <= currentStepIndex;
              const current = index === currentStepIndex;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex min-w-[88px] flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                        active
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-400"
                      } ${current ? "ring-4 ring-emerald-100" : ""}`}
                    >
                      <StepIcon className={`h-5 w-5 ${step.key === "PROCESSING" && active ? "animate-spin" : ""}`} />
                    </div>
                    <p className={`text-xs font-semibold ${active ? "text-emerald-700" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`hidden h-1 flex-1 rounded-full lg:block ${
                        index < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className={infoCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <User2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailBlock icon={User2} label="Customer" value={order.customerName || "Not added"} />
              <DetailBlock
                icon={Building2}
                label="Business"
                value={order.businessName || "Not added"}
              />
              <DetailBlock icon={Phone} label="Phone" value={order.phone || "Not added"} />
              <DetailBlock icon={Mail} label="Email" value={order.email || "Not added"} />
            </div>
          </div>

          <div className={infoCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
            </div>
            {order.orderDetailsList && order.orderDetailsList.length > 1 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Consolidated Products
                  </p>
                  <p className="mt-1 text-base font-bold text-emerald-900">{order.productCategory}</p>
                </div>
                               <div className="grid grid-cols-1 gap-3.5">
                  {order.orderDetailsList.map((item, idx) => {
                    const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(item.productId || "").trim());
                    const pName = prod?.name || item.productName || item.productCategory || order.productCategory || "Product";
                    const isItemRoll = pName.toLowerCase().includes("roll") || String(item.unit).toLowerCase() === "kg" || String(item.unit).toLowerCase() === "m";
                    const itemDimensionLabel = isItemRoll
                      ? `Width: ${Number(item.dimensions?.width || 0)} ${item.dimensions?.unit || "inch"}`
                      : Number(item.dimensions?.length || 0) || Number(item.dimensions?.width || 0) || Number(item.dimensions?.height || 0)
                        ? `${Number(item.dimensions?.length || 0)} × ${Number(item.dimensions?.width || 0)} × ${Number(item.dimensions?.height || 0)} ${item.dimensions?.unit || "inch"}`
                        : "Not added";

                    return (
                      <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2.5 shadow-sm">
                        <div className="flex justify-between items-center border-b border-gray-150 pb-2">
                          <p className="text-xs font-bold text-emerald-850">Item {idx + 1}: {pName}</p>
                          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                            {item.quantity} {item.unit || "pcs"}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          {!isItemRoll && (
                            <div className="flex justify-between py-1 border-b border-gray-100/50">
                              <span className="text-gray-500 font-medium">Bag Size</span>
                              <span className="font-semibold text-gray-900">{item.bagSize || "—"}</span>
                            </div>
                          )}
                          {!isItemRoll && (
                            <div className="flex justify-between py-1 border-b border-gray-100/50">
                              <span className="text-gray-500 font-medium">Color</span>
                              <span className="font-semibold text-gray-900">{item.color || "—"}</span>
                            </div>
                          )}
                          {isItemRoll && (
                            <>
                              {Number(item.gsm) > 0 && (
                                <div className="flex justify-between py-1 border-b border-gray-100/50">
                                  <span className="text-gray-500 font-medium">GSM</span>
                                  <span className="font-semibold text-gray-900">{item.gsm}</span>
                                </div>
                              )}
                              {Number(item.bf) > 0 && (
                                <div className="flex justify-between py-1 border-b border-gray-100/50">
                                  <span className="text-gray-500 font-medium">BF</span>
                                  <span className="font-semibold text-gray-900">{item.bf} BF</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex justify-between py-1 border-b border-gray-100/50">
                            <span className="text-gray-500 font-medium">Dimensions</span>
                            <span className="font-semibold text-gray-900">{itemDimensionLabel}</span>
                          </div>
                          <div className="flex justify-between py-1 last:border-b-0">
                            <span className="text-gray-500 font-medium">Custom Printing</span>
                            <span className={`font-semibold ${item.customPrinting ? "text-emerald-700 font-bold" : "text-gray-900"}`}>
                              {item.customPrinting ? "Yes, Required" : "No"}
                            </span>
                          </div>
                           {item.brandingText && (
                            <div className="flex justify-between py-1 border-b border-gray-100/50">
                              <span className="text-gray-500 font-medium">Branding Text</span>
                              <span className="font-semibold text-gray-900">{item.brandingText}</span>
                            </div>
                          )}
                          {item.logo && (
                            <div className="flex justify-between py-1 border-b border-gray-100/50">
                              <span className="text-gray-500 font-medium">Logo</span>
                              <span>
                                <a
                                  href={item.logo.startsWith("http") ? item.logo : `${window.location.protocol}//${window.location.hostname}:3010${item.logo}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Logo ↗
                                </a>
                              </span>
                            </div>
                          )}
                          {(() => {
                            const taxInfo = getProductTaxInfo(item);
                            return (
                              <>
                                <div className="flex justify-between py-1 border-b border-gray-100/50">
                                  <span className="text-emerald-700 font-semibold">HSN Code</span>
                                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{taxInfo.hsnCode}</span>
                                </div>
                                <div className="flex justify-between py-1 last:border-b-0">
                                  <span className="text-emerald-700 font-semibold">GST Rate</span>
                                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{taxInfo.gstRate}%</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {(() => {
                  const singleItem = order.orderDetails || {};
                  const prod = productItems?.find(p => String(p?._id || p?.id || "").trim() === String(singleItem?.productId || "").trim());
                  const pName = prod?.name || singleItem?.productName || order.productCategory || "Product";
                  return (
                    <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Product
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">{pName}</p>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {!isRoll && (
                    <DetailBlock
                      icon={ShoppingBag}
                      label="Bag Size"
                      value={order.orderDetails?.bagSize || "Not added"}
                    />
                  )}
                  {order.orderDetails?.gsm !== undefined && (
                    <DetailBlock
                      icon={Package}
                      label="GSM"
                      value={order.orderDetails?.gsm || "Not added"}
                    />
                  )}
                  <DetailBlock
                    icon={Package}
                    label="Quantity"
                    value={
                      order.orderDetails?.unit === "kg" && !isRoll
                        ? `${order.orderDetails?.quantity || 0} kg (~${order.orderDetails?.convertedQuantity || 0} pcs)`
                        : order.orderDetails?.unit === "m" && isRoll
                        ? `${order.orderDetails?.quantity || 0} m (~${order.orderDetails?.convertedQuantity || 0} kg)`
                        : `${order.orderDetails?.quantity || 0} ${order.orderDetails?.unit || (isRoll ? "kg" : "pcs")}`
                    }
                    tone="text-blue-700"
                  />
                  <DetailBlock icon={Ruler} label="Dimensions" value={dimensionLabel} />
                  {order.orderDetails?.bf !== undefined && order.orderDetails?.bf > 0 && (
                    <DetailBlock
                      icon={ShieldCheck}
                      label="Burst Factor (BF)"
                      value={`${order.orderDetails.bf} BF`}
                    />
                  )}
                  <DetailBlock
                    icon={Printer}
                    label="Custom Printing"
                    value={order.orderDetails?.customPrinting ? "Yes, Required" : "No"}
                    tone={order.orderDetails?.customPrinting ? "text-emerald-700 font-bold" : "text-gray-500"}
                  />
                  {order.orderDetails?.brandingText && (
                    <DetailBlock
                      icon={FileText}
                      label="Branding Text"
                      value={order.orderDetails.brandingText}
                    />
                  )}
                  {order.orderDetails?.logo && (
                    <DetailBlock
                      icon={Printer}
                      label="Branding Logo"
                      value={
                        <a
                          href={order.orderDetails.logo.startsWith("http") ? order.orderDetails.logo : `${window.location.protocol}//${window.location.hostname}:3010${order.orderDetails.logo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          View Logo ↗
                        </a>
                      }
                    />
                  )}
                  {(() => {
                    const taxInfo = getProductTaxInfo(order.orderDetails || order);
                    return (
                      <>
                        <DetailBlock
                          icon={Tag}
                          label="HSN Code"
                          value={<span className="font-mono font-bold text-emerald-800">{taxInfo.hsnCode}</span>}
                          tone="text-emerald-700 font-semibold"
                        />
                        <DetailBlock
                          icon={Tag}
                          label="GST Rate"
                          value={<span className="font-bold text-emerald-800">{taxInfo.gstRate}%</span>}
                          tone="text-emerald-700 font-semibold"
                        />
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>

          {order.quotation && ((order.quotation.status && order.quotation.status !== "none") || order.quotation.quotationNumber) && (
            <div className={infoCardClass}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Quotation Details</h3>
                </div>
                <Badge
                  variant={
                    order.quotation.status === "approved"
                      ? "success"
                      : order.quotation.status === "sent"
                      ? "info"
                      : "warning"
                  }
                  className="capitalize"
                >
                  {order.quotation.status || "draft"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DetailBlock
                  icon={FileText}
                  label="Quotation No"
                  value={order.quotation.quotationNumber || "—"}
                  tone="text-emerald-700 font-bold"
                />
                <DetailBlock
                  icon={DollarSign}
                  label="Total Quoted"
                  value={formatCurrency(order.quotation.totalQuoted)}
                />
                <DetailBlock
                  icon={Calendar}
                  label="Valid Until"
                  value={order.quotation.validUntil ? new Date(order.quotation.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                />
                {order.quotation.status === "sent" && order.quotation.sentAt && (
                  <DetailBlock
                    icon={Clock}
                    label="Sent At"
                    value={formatDate(order.quotation.sentAt)}
                  />
                )}
                {order.quotation.status === "approved" && order.quotation.approvedAt && (
                  <DetailBlock
                    icon={CheckCircle2}
                    label="Approved At"
                    value={formatDate(order.quotation.approvedAt)}
                  />
                )}
              </div>
            </div>
          )}

          <div className={infoCardClass}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
                {(!order.delivery?.deliveryAddress || order.delivery.deliveryAddress === "Not added") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    ⚠️ Missing Address
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onEditDelivery && onEditDelivery(order)}
                className="text-xs font-bold text-violet-750 hover:text-violet-950 transition hover:underline cursor-pointer"
              >
                {(!order.delivery?.deliveryAddress || order.delivery.deliveryAddress === "Not added") ? "Add Address" : "Edit Address"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailBlock
                icon={User2}
                label="Receiver"
                value={order.delivery?.receiverName || "Not added"}
              />
              <DetailBlock
                icon={Phone}
                label="Receiver Phone"
                value={order.delivery?.receiverPhone || "Not added"}
              />
              <DetailBlock
                icon={Truck}
                label="Delivery Mode"
                value={order.delivery?.deliveryMode || "Not added"}
              />
              <DetailBlock
                icon={Calendar}
                label="Delivery Date"
                value={formatDate(order.delivery?.deliveryDate)}
              />
              <DetailBlock
                icon={Calendar}
                label="Dispatch Date"
                value={formatDate(order.delivery?.dispatchDate)}
              />
              <DetailBlock
                icon={MapPin}
                label="Address"
                value={order.delivery?.deliveryAddress || "Not added"}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className={infoCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Overview</h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Total
                </p>
                <p className="mt-1 text-xs sm:text-base lg:text-lg font-bold text-emerald-900 whitespace-nowrap truncate">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-blue-700">Paid</p>
                <p className="mt-1 text-xs sm:text-base lg:text-lg font-bold text-blue-900 whitespace-nowrap truncate">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-amber-700">Due</p>
                <p className="mt-1 text-xs sm:text-base lg:text-lg font-bold text-amber-900 whitespace-nowrap truncate">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Payment progress</span>
                <span className="text-sm font-semibold text-emerald-700">
                  {paymentProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBlock
                icon={CreditCard}
                label="Payment Type"
                value={order.payment?.paymentType || "Not added"}
              />
              <DetailBlock
                icon={CreditCard}
                label="Payment Mode"
                value={order.paymentMode || order.confirmedPayment?.paymentMode || "Not added"}
              />
              <DetailBlock
                icon={CreditCard}
                label="Partial Paid"
                value={formatCurrency(order.payment?.partialPaidAmount)}
              />
              <DetailBlock
                icon={CreditCard}
                label="Confirmed Paid"
                value={formatCurrency(order.confirmedPayment?.paidAmount || order.paidAmount)}
              />
            </div>
          </div>

          <div className={infoCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notes and Timeline</h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm leading-7 text-gray-700">
                {order.notes || "No notes added for this order."}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBlock
                icon={Calendar}
                label="Created"
                value={formatDate(order.createdAt || order.fullDate || order.date)}
              />
              <DetailBlock
                icon={Calendar}
                label="Updated"
                value={formatDate(order.updatedAt)}
              />
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
