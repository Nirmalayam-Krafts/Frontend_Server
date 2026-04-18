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
  Package,
  Loader2,
  Mail,
  Palette,
  Phone,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Badge } from "../ui";

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
  onMoveToProcessing,
  onCompleteOrder,
}) {
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

        return (
          <article
            key={order.id}
            className="group rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-lg"
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

                    <Badge variant="secondary" className="shrink-0 bg-white text-gray-700 shadow-sm">
                      {order.source}
                    </Badge>
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
                </div>

                <div className="rounded-3xl border border-gray-200 bg-gray-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        Product Summary
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {order.productCategory}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Clear bag specs for quick sales and production review.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                      <Package className="h-3.5 w-3.5" />
                      Qty {order.orderDetails?.quantity || 0} pcs
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Size {order.orderDetails?.bagSize || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                      <Palette className="h-3.5 w-3.5" />
                      Color {order.orderDetails?.color || "—"}
                    </span>
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
                        {formatCurrency(order.totalAmount)}
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
                        {formatCurrency(order.paidAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Due
                      </p>
                      <p className="mt-1 text-base font-bold text-amber-900">
                        {formatCurrency(order.pendingAmount)}
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
                      <Badge
                        variant={orderStatusColors[order.orderStatusKey] || "primary"}
                        className="gap-2 bg-white text-gray-800 shadow-sm"
                      >
                        <OrderStatusIcon className={`h-3.5 w-3.5 ${orderState.tone}`} />
                        {orderState.label}
                      </Badge>
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
