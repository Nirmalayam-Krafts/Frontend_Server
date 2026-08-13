import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../ui";
import {
  Package,
  Tag,
  DollarSign,
  AlertTriangle,
  FileText,
  Truck,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Calculator,
  Percent,
} from "lucide-react";

const rawMaterialSchema = z
  .object({
    name: z.string().min(2, "Material name must be at least 2 characters"),
    code: z.string().min(2, "Material code is required").toUpperCase(),
    type: z.enum(["Paper", "Handle", "Printing", "Adhesive", "Accessory", "Other"]),
    unit: z.enum(["kg", "gram", "litres", "pcs", "meter", "sqft", "sqm", "ton"]),
    availableStock: z.coerce.number().min(0, "Stock cannot be negative"),
    baseRate: z.coerce.number().min(0, "Base rate cannot be negative"),
    transportCharges: z.coerce.number().min(0, "Transport charges cannot be negative").default(0),
    laborCharges: z.coerce.number().min(0, "Labor charges cannot be negative").default(0),
    isGstApplicable: z.boolean().default(false),
    gstRate: z.coerce.number().min(0, "GST rate cannot be negative").default(18),
    supplierName: z.string().optional(),
    supplierGstin: z.string().optional(),
    supplierAddress: z.string().optional(),
    supplierPhone: z.string().optional(),
    reorderPoint: z.coerce.number().min(0, "Reorder point cannot be negative"),
    minStock: z.coerce.number().min(0, "Minimum stock cannot be negative").optional(),
    kgPerRoll: z.coerce.number().min(0, "Cannot be negative").optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    gsm: z.coerce.number().min(0, "GSM cannot be negative").optional(),
    bf: z.coerce.number().min(0, "BF cannot be negative").optional(),
    rollWidth: z.coerce.number().min(0, "Roll Width cannot be negative").optional(),
    rollWidthUnit: z.enum(["inch", "cm", "mm", "ft"]).default("inch"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "Paper") {
      if (!data.gsm || data.gsm <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GSM is required for Paper type and must be greater than 0",
          path: ["gsm"],
        });
      }
      if (!data.bf || data.bf <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BF is required for Paper type and must be greater than 0",
          path: ["bf"],
        });
      }
      if (!data.rollWidth || data.rollWidth <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Roll Width is required for Paper type and must be greater than 0",
          path: ["rollWidth"],
        });
      }
    }

    // Mandatory Supplier Audit Validation when GST is Enabled
    if (data.isGstApplicable) {
      if (!data.supplierName || !data.supplierName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supplier Name is required when GST charges are enabled",
          path: ["supplierName"],
        });
      }
      if (!data.supplierGstin || !data.supplierGstin.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supplier GSTIN is required when GST charges are enabled",
          path: ["supplierGstin"],
        });
      }
      if (!data.supplierAddress || !data.supplierAddress.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supplier Address is required for immutable audit logs when GST is enabled",
          path: ["supplierAddress"],
        });
      }
    }
  });

const RawMaterialForm = ({ initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          baseRate: initialData.baseRate ?? initialData.unitPrice ?? 0,
          transportCharges: initialData.transportCharges ?? 0,
          laborCharges: initialData.laborCharges ?? 0,
          isGstApplicable: initialData.isGstApplicable ?? false,
          gstRate: initialData.gstRate ?? 18,
          supplierName: initialData.supplierName || "",
          supplierGstin: initialData.supplierGstin || "",
          supplierAddress: initialData.supplierAddress || "",
          supplierPhone: initialData.supplierPhone || "",
          gsm: initialData.gsm ?? "",
          bf: initialData.bf ?? "",
          rollWidth: initialData.rollWidth ?? "",
          rollWidthUnit: initialData.rollWidthUnit || "inch",
        }
      : {
          name: "",
          code: "",
          type: "Other",
          unit: "kg",
          availableStock: 0,
          baseRate: 0,
          transportCharges: 0,
          laborCharges: 0,
          isGstApplicable: false,
          gstRate: 18,
          supplierName: "",
          supplierGstin: "",
          supplierAddress: "",
          supplierPhone: "",
          reorderPoint: 0,
          minStock: 0,
          kgPerRoll: 0,
          color: "",
          description: "",
          isActive: true,
          gsm: "",
          bf: "",
          rollWidth: "",
          rollWidthUnit: "inch",
        },
  });

  const stockQty = Number(watch("availableStock") || 0);
  const baseRate = Number(watch("baseRate") || 0);
  const transportCost = Number(watch("transportCharges") || 0);
  const laborCost = Number(watch("laborCharges") || 0);
  const isGst = Boolean(watch("isGstApplicable"));
  const gstRateVal = Number(watch("gstRate") || 18);

  const baseMaterialCost = Number((stockQty * baseRate).toFixed(2));
  const gstTaxAmount = isGst ? Number((baseMaterialCost * (gstRateVal / 100)).toFixed(2)) : 0;
  const totalStockPrice = Number((baseMaterialCost + transportCost + laborCost + gstTaxAmount).toFixed(2));
  const effectiveUnitLandedRate = stockQty > 0 ? Number((totalStockPrice / stockQty).toFixed(2)) : baseRate;

  const handleFormSubmit = (data) => {
    const finalData = {
      ...data,
      baseAmount: baseMaterialCost,
      gstAmount: gstTaxAmount,
      totalPurchaseCost: totalStockPrice,
      unitPrice: effectiveUnitLandedRate,
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Material Name *"
            placeholder="e.g., Kraft Paper 120gsm"
            error={errors.name?.message}
            icon={Tag}
            {...register("name")}
          />
          <Input
            label="Material Code *"
            placeholder="e.g., RAW-PAPER-001"
            error={errors.code?.message}
            icon={Tag}
            {...register("code")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select
            label="Material Type *"
            options={[
              { value: "Paper", label: "📄 Paper" },
              { value: "Handle", label: "🔗 Handle" },
              { value: "Printing", label: "🎨 Printing" },
              { value: "Adhesive", label: "🧴 Adhesive" },
              { value: "Accessory", label: "🔧 Accessory" },
              { value: "Other", label: "📦 Other" },
            ]}
            error={errors.type?.message}
            {...register("type")}
          />
          <Select
            label="Color (Optional)"
            options={[
              { value: "", label: "Select Color (Optional)" },
              { value: "Brown", label: "Brown" },
              { value: "Natural brown", label: "Natural brown" },
              { value: "White", label: "White" },
              { value: "Pink", label: "Pink" },
              ...(watch("color") && !["", "Brown", "Natural brown", "White", "Pink"].includes(watch("color"))
                ? [{ value: watch("color"), label: watch("color") }]
                : []),
            ]}
            error={errors.color?.message}
            {...register("color")}
          />
        </div>
        {watch("type") === "Paper" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-lg border border-blue-200">
            <Input
              label="GSM *"
              type="number"
              placeholder="e.g., 120"
              error={errors.gsm?.message}
              {...register("gsm")}
            />
            <Input
              label="BF (Burst Factor) *"
              type="number"
              placeholder="e.g., 20"
              error={errors.bf?.message}
              {...register("bf")}
            />
            <div className="flex flex-col">
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Roll Width *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g., 30"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white text-sm text-gray-900 font-medium ${
                    errors.rollWidth ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("rollWidth")}
                />
                <select
                  className="w-[100px] px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm text-gray-900 font-medium cursor-pointer"
                  {...register("rollWidthUnit")}
                >
                  <option value="inch">inch</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
              {errors.rollWidth && (
                <p className="text-xs text-red-600 mt-1">{errors.rollWidth.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stock & Itemized Costing Section */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-700" />
          Itemized Purchase Costing & Expense Breakdown
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Enter individual purchase expenses (base rate, freight, labor, GST) to compute total stock price & landed unit rate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Unit of Measurement *"
            options={[
              { value: "kg", label: "Kilograms (kg)" },
              { value: "ton", label: "Tons (ton = 1,000 kg)" },
              { value: "gram", label: "Grams (gram)" },
              { value: "litres", label: "Litres" },
              { value: "pcs", label: "Pieces (pcs)" },
              { value: "meter", label: "Meters" },
              { value: "sqft", label: "Square Feet (sqft)" },
              { value: "sqm", label: "Square Meters (sqm)" },
            ]}
            error={errors.unit?.message}
            {...register("unit")}
          />
          <Input
            label="Quantity Purchased *"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 100"
            error={errors.availableStock?.message}
            {...register("availableStock")}
          />
          <Input
            label={`Base Unit Rate (₹ / ${watch("unit") || "unit"}) *`}
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 50.00"
            error={errors.baseRate?.message}
            {...register("baseRate")}
          />
        </div>

        {/* Expenses: Transport & Labor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Transport / Freight Charges (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 500.00"
            error={errors.transportCharges?.message}
            icon={Truck}
            {...register("transportCharges")}
          />
          <Input
            label="Labor / Handling Charges (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 200.00"
            error={errors.laborCharges?.message}
            icon={UserCheck}
            {...register("laborCharges")}
          />
        </div>

        {/* GST Charges Checkbox & Rate Selection */}
        <div className="mt-5 p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                {...register("isGstApplicable")}
              />
              <div>
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Include GST Charges?
                </span>
                <p className="text-xs text-gray-500">
                  Enabling GST mandatorily requires supplier details & audit logging.
                </p>
              </div>
            </label>

            {isGst && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">GST Rate:</span>
                <select
                  className="px-3 py-1.5 border border-emerald-300 rounded-lg bg-emerald-50 text-emerald-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register("gstRate")}
                >
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST (Standard)</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
            )}
          </div>

          {/* Supplier Audit Details (Mandatory when GST is checked) */}
          {isGst && (
            <div className="mt-4 pt-4 border-t border-emerald-100 bg-amber-50/50 p-4 rounded-lg border-l-4 border-l-amber-500 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-amber-600" />
                Mandatory Supplier Audit Records (Logged Immutably)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Supplier Business Name *"
                  placeholder="e.g. XYZ Paper Mills Ltd"
                  error={errors.supplierName?.message}
                  icon={Building2}
                  {...register("supplierName")}
                />
                <Input
                  label="Supplier GSTIN *"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  error={errors.supplierGstin?.message}
                  icon={Tag}
                  {...register("supplierGstin")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Supplier Address *"
                  placeholder="e.g. Plot 45, MIDC Industrial Zone, Nagpur"
                  error={errors.supplierAddress?.message}
                  icon={MapPin}
                  {...register("supplierAddress")}
                />
                <Input
                  label="Supplier Phone / Contact"
                  placeholder="e.g. +91 9876543210"
                  error={errors.supplierPhone?.message}
                  icon={Phone}
                  {...register("supplierPhone")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Costing Calculation Summary Box */}
        <div className="mt-5 bg-gradient-to-br from-gray-900 to-emerald-950 text-white rounded-xl p-4 shadow-lg border border-emerald-800">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-800/80 pb-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Landed Purchase Cost Summary
            </span>
            <span className="text-xs text-gray-300">
              {stockQty} {watch("unit") || "units"} purchased
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div>
              <p className="text-gray-400">Base Material Cost</p>
              <p className="font-semibold text-gray-200">₹{baseMaterialCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Freight / Transport</p>
              <p className="font-semibold text-gray-200">+ ₹{transportCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Labor / Handling</p>
              <p className="font-semibold text-gray-200">+ ₹{laborCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">GST ({isGst ? `${gstRateVal}%` : "0%"})</p>
              <p className="font-semibold text-emerald-400">+ ₹{gstTaxAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-emerald-800/80 gap-2">
            <div>
              <p className="text-xs text-emerald-300 font-medium">Total Landed Stock Price (Total Cost):</p>
              <p className="text-2xl font-extrabold text-white">
                ₹{totalStockPrice.toFixed(2)}
              </p>
            </div>
            <div className="sm:text-right bg-emerald-900/60 px-3 py-2 rounded-lg border border-emerald-700/50">
              <p className="text-[11px] text-emerald-200 uppercase font-semibold">Effective Landed Rate:</p>
              <p className="text-lg font-bold text-emerald-300">
                ₹{effectiveUnitLandedRate.toFixed(2)} / {watch("unit") || "unit"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Settings Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Reorder Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Reorder Point *"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            error={errors.reorderPoint?.message}
            {...register("reorderPoint")}
          />
          <Input
            label="Minimum Stock (Optional)"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            error={errors.minStock?.message}
            {...register("minStock")}
          />
        </div>
        <p className="text-xs text-gray-600 mt-3 bg-white p-3 rounded-lg border border-amber-200">
          💡 <strong>Tip:</strong> Set reorder point to trigger alerts when stock falls below this level.
          Minimum stock is the absolute minimum threshold for critical alerts.
        </p>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Description & Purchase Notes (Optional)
        </h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white resize-none text-sm text-gray-900"
          rows="4"
          placeholder="Add any additional notes, invoice references, or specifications about this material purchase..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 shadow-md"
        >
          {initialData ? "✏️ Update Material & Costing" : "➕ Create Material & Save Purchase"}
        </Button>
      </div>
    </form>
  );
};

export default RawMaterialForm;
