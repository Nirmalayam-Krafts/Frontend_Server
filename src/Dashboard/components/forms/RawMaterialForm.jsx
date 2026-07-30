import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../ui";
import { Package, Tag, Layers3, DollarSign, AlertTriangle, FileText } from "lucide-react";

const rawMaterialSchema = z.object({
  name: z.string().min(2, "Material name must be at least 2 characters"),
  code: z.string().min(2, "Material code is required").toUpperCase(),
  type: z.enum(["Paper", "Handle", "Printing", "Adhesive", "Accessory", "Other"]),
  unit: z.enum(["kg", "gram", "pairs", "litres", "pcs", "rolls", "meter", "sqft", "sqm"]),
  availableStock: z.coerce.number().min(0, "Stock cannot be negative"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
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
}).superRefine((data, ctx) => {
  if (data.unit === "rolls" && (!data.kgPerRoll || data.kgPerRoll <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Weight per roll (kg) is required for rolls unit and must be greater than 0",
      path: ["kgPerRoll"]
    });
  }
  if (data.type === "Paper") {
    if (!data.gsm || data.gsm <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GSM is required for Paper type and must be greater than 0",
        path: ["gsm"]
      });
    }
    if (!data.bf || data.bf <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BF is required for Paper type and must be greater than 0",
        path: ["bf"]
      });
    }
    if (!data.rollWidth || data.rollWidth <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Roll Width is required for Paper type and must be greater than 0",
        path: ["rollWidth"]
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
  } = useForm({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: initialData
      ? {
          ...initialData,
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
          unitPrice: 0,
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

  const stockValue = (watch("availableStock") || 0) * (watch("unitPrice") || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Material Name"
            placeholder="e.g., Kraft Paper 120gsm"
            error={errors.name?.message}
            icon={Tag}
            {...register("name")}
          />
          <Input
            label="Material Code"
            placeholder="e.g., RAW-PAPER-001"
            error={errors.code?.message}
            icon={Tag}
            {...register("code")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select
            label="Material Type"
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
          <Input
            label="Color (Optional)"
            placeholder="e.g., Brown, White, Black"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-gray-900 font-medium ${
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
                <p className="text-xs text-red-650 mt-1">{errors.rollWidth.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stock & Pricing Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Stock & Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Unit of Measurement"
            options={[
              { value: "kg", label: "Kilograms (kg)" },
              { value: "gram", label: "Grams (gram)" },
              { value: "pairs", label: "Pairs" },
              { value: "litres", label: "Litres" },
              { value: "pcs", label: "Pieces (pcs)" },
              { value: "rolls", label: "Rolls" },
              { value: "meter", label: "Meters" },
              { value: "sqft", label: "Square Feet (sqft)" },
              { value: "sqm", label: "Square Meters (sqm)" },
            ]}
            error={errors.unit?.message}
            {...register("unit")}
          />
          <Input
            label="Available Stock"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            error={errors.availableStock?.message}
            {...register("availableStock")}
          />
        </div>

        {watch("unit") === "rolls" && (
          <div className="mt-4">
            <Input
              label="Weight per Roll (kg)"
              type="number"
              step="any"
              min="0"
              placeholder="e.g., 25"
              error={errors.kgPerRoll?.message}
              {...register("kgPerRoll")}
            />
            <p className="text-xs text-emerald-700 mt-1">
              * Specify how many kilograms (kg) are in 1 roll of this material. This factor will be used to automatically calculate weight and inventory consumption during production.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Unit Price (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.unitPrice?.message}
            {...register("unitPrice")}
          />
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-gray-600 mb-1">Total Stock Value</p>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{stockValue.toFixed(2)}
            </p>
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
            label="Reorder Point"
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
          Description (Optional)
        </h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
          rows="4"
          placeholder="Add any additional notes or specifications about this material..."
          error={errors.description?.message}
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
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {initialData ? "✏️ Update Material" : "➕ Create Material"}
        </Button>
      </div>
    </form>
  );
};

export default RawMaterialForm;
