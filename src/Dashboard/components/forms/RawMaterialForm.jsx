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
  color: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const RawMaterialForm = ({ initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      type: "Other",
      unit: "kg",
      availableStock: 0,
      unitPrice: 0,
      reorderPoint: 0,
      minStock: 0,
      color: "",
      description: "",
      isActive: true,
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
            placeholder="0"
            error={errors.availableStock?.message}
            {...register("availableStock")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Unit Price (₹)"
            type="number"
            step="0.01"
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
            placeholder="0"
            error={errors.reorderPoint?.message}
            {...register("reorderPoint")}
          />
          <Input
            label="Minimum Stock (Optional)"
            type="number"
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
