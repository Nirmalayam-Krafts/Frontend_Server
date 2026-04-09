import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../ui";
import { Package, Tag, DollarSign, Ruler, Layers3 } from "lucide-react";

const inventorySchema = z.object({
  sku: z.string().min(2, "SKU is required").toUpperCase(),
  productName: z.string().min(2, "Product name is required"),
  category: z.enum(["STANDARD", "PREMIUM", "FOOD_GRADE", "RAW_MATERIAL"]),
  bagType: z.string().optional(),
  bagColor: z.string().optional(),
  bagSizeLabel: z.string().optional(),
  stockLevel: z.coerce.number().min(0, "Stock level cannot be negative"),
  reorderPt: z.coerce.number().min(0, "Reorder point cannot be negative"),
  unit: z.string().default("bags"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
  sellingPricePerUnit: z.coerce.number().min(0, "Selling price cannot be negative").optional(),
  productionCostPerUnit: z.coerce.number().min(0, "Production cost cannot be negative").optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const InventoryForm = ({ initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData || {
      sku: "",
      productName: "",
      category: "STANDARD",
      bagType: "",
      bagColor: "",
      bagSizeLabel: "",
      stockLevel: 0,
      reorderPt: 10,
      unit: "bags",
      unitPrice: 0,
      sellingPricePerUnit: 0,
      productionCostPerUnit: 0,
      description: "",
      isActive: true,
    },
  });

  const stockLevel = watch("stockLevel") || 0;
  const unitPrice = watch("unitPrice") || 0;
  const totalValue = stockLevel * unitPrice;

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
            label="SKU"
            placeholder="e.g., KRAFT-QR-BBN"
            error={errors.sku?.message}
            icon={Tag}
            {...register("sku")}
          />
          <Input
            label="Product Name"
            placeholder="e.g., Kraft Paper Bag - Large"
            error={errors.productName?.message}
            {...register("productName")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select
            label="Category"
            options={[
              { value: "STANDARD", label: "📦 Standard" },
              { value: "PREMIUM", label: "⭐ Premium" },
              { value: "FOOD_GRADE", label: "🍽️ Food Grade" },
              { value: "RAW_MATERIAL", label: "🔧 Raw Material" },
            ]}
            error={errors.category?.message}
            {...register("category")}
          />
          <Input
            label="Unit"
            placeholder="bags"
            error={errors.unit?.message}
            {...register("unit")}
          />
        </div>
      </div>

      {/* Product Specifications */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-purple-600" />
          Product Specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Bag Type (Optional)"
            placeholder="e.g., Die-cut, SOS, Flat Handle"
            error={errors.bagType?.message}
            {...register("bagType")}
          />
          <Input
            label="Bag Color (Optional)"
            placeholder="e.g., Brown, White, Custom"
            error={errors.bagColor?.message}
            {...register("bagColor")}
          />
          <Input
            label="Size Label (Optional)"
            placeholder="e.g., Small, Medium, Large"
            error={errors.bagSizeLabel?.message}
            {...register("bagSizeLabel")}
          />
        </div>
      </div>

      {/* Stock & Reorder Settings */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers3 className="w-5 h-5 text-emerald-600" />
          Stock & Reorder Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Stock Level"
            type="number"
            placeholder="0"
            error={errors.stockLevel?.message}
            {...register("stockLevel")}
          />
          <Input
            label="Reorder Point"
            type="number"
            placeholder="10"
            error={errors.reorderPt?.message}
            {...register("reorderPt")}
          />
        </div>
        <p className="text-xs text-gray-600 mt-3 bg-white p-3 rounded-lg border border-emerald-200">
          💡 <strong>Tip:</strong> Reorder point triggers alerts when stock falls below this threshold.
        </p>
      </div>

      {/* Pricing Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          Pricing & Cost
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Cost Price (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.unitPrice?.message}
            {...register("unitPrice")}
          />
          <Input
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.sellingPricePerUnit?.message}
            {...register("sellingPricePerUnit")}
          />
          <Input
            label="Production Cost (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.productionCostPerUnit?.message}
            {...register("productionCostPerUnit")}
          />
        </div>
        <div className="mt-4 bg-white rounded-lg p-4 border border-amber-200">
          <p className="text-xs text-gray-600 mb-1">Total Stock Value</p>
          <p className="text-3xl font-bold text-emerald-600">
            ₹{totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stockLevel} {watch("unit") || "bags"} × ₹{unitPrice}
          </p>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          Description (Optional)
        </h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
          rows="4"
          placeholder="Add product specifications, notes, or special handling instructions..."
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
          {initialData ? "✏️ Update Item" : "➕ Create Item"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
