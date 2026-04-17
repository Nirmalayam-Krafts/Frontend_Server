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
  Palette,
  Phone,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User2,
} from "lucide-react";
import { Badge } from "../ui";

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
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function OrderDetail({ order }) {
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
  const dimensionLabel =
    Number(dimensions.length || 0) || Number(dimensions.width || 0) || Number(dimensions.height || 0)
      ? `${Number(dimensions.length || 0)} x ${Number(dimensions.width || 0)} x ${Number(dimensions.height || 0)} ${dimensions.unit || "inch"}`
      : "Not added";

  const workflowReferenceKey =
    order.orderStatusKey === "CANCELLED"
      ? String(order?.cancellation?.previousStatus || "PENDING").toUpperCase()
      : order.orderStatusKey;
  const currentStepIndex = workflowSteps.findIndex((step) => step.key === workflowReferenceKey);

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
                      <StepIcon
                        className={`h-5 w-5 ${
                          step.key === "PROCESSING" &&
                          active &&
                          order.orderStatusKey !== "CANCELLED"
                            ? "animate-spin"
                            : ""
                        }`}
                      />
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

        {order.orderStatusKey === "CANCELLED" && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-100 p-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Cancellation saved for this order
                </p>
                <p className="mt-1 text-sm leading-6 text-red-800">
                  {order?.cancellation?.stockActionNote ||
                    "This order was cancelled and stock impact depends on the stage it reached."}
                </p>
              </div>
            </div>
          </div>
        )}
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
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Product
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900">{order.productCategory}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailBlock
                icon={ShoppingBag}
                label="Bag Size"
                value={order.orderDetails?.bagSize || "Not added"}
              />
              <DetailBlock
                icon={Palette}
                label="Color"
                value={order.orderDetails?.color || "Not added"}
              />
              <DetailBlock
                icon={Package}
                label="Quantity"
                value={`${order.orderDetails?.quantity || 0} pcs`}
                tone="text-blue-700"
              />
              <DetailBlock icon={Ruler} label="Dimensions" value={dimensionLabel} />
            </div>
          </div>

          <div className={infoCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Total
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Paid</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Due</p>
                <p className="mt-1 text-2xl font-bold text-amber-900">
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

          {(order.orderStatusKey === "CANCELLED" ||
            order?.cancellation?.cancelledAt ||
            order?.cancellation?.reason) && (
            <div className={infoCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cancellation Details
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailBlock
                  icon={AlertTriangle}
                  label="Previous Status"
                  value={order?.cancellation?.previousStatus || "Not added"}
                  tone="text-red-700"
                />
                <DetailBlock
                  icon={Calendar}
                  label="Cancelled At"
                  value={formatDate(order?.cancellation?.cancelledAt)}
                  tone="text-red-700"
                />
                <DetailBlock
                  icon={User2}
                  label="Cancelled By"
                  value={order?.cancellation?.cancelledBy?.name || "Admin/System"}
                />
                <DetailBlock
                  icon={Package}
                  label="Stock Impact"
                  value={order?.cancellation?.stockActionNote || "Not added"}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Reason
                </p>
                <p className="mt-2 text-sm leading-7 text-gray-700">
                  {order?.cancellation?.reason || "No cancellation reason recorded."}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
