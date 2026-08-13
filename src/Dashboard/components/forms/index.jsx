import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../ui";

// Validation Schemas
const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Invalid email address",
    }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => !val || /^\+?[\d\s\-()]{7,20}$/.test(val.trim()), {
      message: "Invalid phone number",
    }),
  business_name: z.string().optional().or(z.literal("")),
  product_category: z.string().optional().or(z.literal("")),
  status: z.string().optional().default("New"),
  quantity: z.string().optional().or(z.literal("")),
  quantity_unit: z.enum(["pcs", "kg", "pieces"]).optional().default("pcs"),
  requirement: z.string().optional().or(z.literal("")),
});

const inventorySchema = z
  .object({
    sku: z.string().min(2, "SKU is required"),
    productName: z.string().min(2, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    stockLevel: z.coerce.number().min(0, "Stock level must be positive"),
    reorderPt: z.coerce.number().min(0, "Reorder point must be positive"),
  })
  .strict();

const orderSchema = z
  .object({
    clientName: z.string().min(2, "Client name is required"),
    status: z.enum(["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"]),
    paymentStatus: z.enum(["PAID", "PENDING", "PARTIAL"]),
    amount: z.string().min(1, "Amount is required"),
  })
  .strict();

export const LeadForm = ({ initialData, onSubmit, loading }) => {
  const parseInitialQtyAndUnit = (qtyString) => {
    if (!qtyString) return { quantity: "", quantity_unit: "pcs" };
    const match = String(qtyString).trim().match(/^([\d\s\-()]+)\s*(pcs|pieces|kg)?$/i);
    if (match) {
      const num = match[1].trim();
      let unit = match[2] ? match[2].toLowerCase() : "pcs";
      if (unit === "pieces") unit = "pcs";
      return { quantity: num, quantity_unit: unit };
    }
    return { quantity: qtyString, quantity_unit: "pcs" };
  };

  const parsedQty = parseInitialQtyAndUnit(initialData?.quantity);

  const cleanStatus = React.useMemo(() => {
    if (!initialData) return "New";
    const rawSt = String(initialData.statusLabel || initialData.status || "New").trim();
    if (!rawSt) return "New";
    return rawSt.charAt(0).toUpperCase() + rawSt.slice(1).toLowerCase();
  }, [initialData]);

  const defaultValues = React.useMemo(() => {
    if (!initialData) return { quantity_unit: "pcs", status: "New" };
    const rawPhone = initialData.phone || initialData.wa_phone || "";
    const digitsOnly = String(rawPhone).replace(/\D/g, "");
    const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    return {
      name: initialData.name || "",
      email: initialData.email || "",
      phone: cleanPhone || String(rawPhone),
      business_name: initialData.business_name || initialData.businessName || initialData.companyName || "",
      product_category: initialData.product_category || initialData.productInterest || "",
      status: cleanStatus,
      quantity: parsedQty.quantity || "",
      quantity_unit: parsedQty.quantity_unit || "pcs",
      requirement: initialData.requirement || "",
    };
  }, [initialData, cleanStatus]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues,
  });

  const handleLocalSubmit = (data) => {
    const { quantity, quantity_unit, ...rest } = data;
    const combinedQuantity =
      quantity && String(quantity).trim() ? `${String(quantity).trim()} ${quantity_unit}` : "";
    onSubmit({
      ...rest,
      quantity: combinedQuantity,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-4">
      <Input
        label="Lead Name"
        placeholder="Enter lead name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Phone"
        placeholder="Enter phone number"
        error={errors.phone?.message}
        {...register("phone", {
          onChange: (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
          }
        })}
      />
      <Input
        label="Business Name"
        placeholder="Enter business name"
        error={errors.business_name?.message}
        {...register("business_name")}
      />
      <Select
        label="Product Interest"
        options={[
          { value: "Ecokraft Bags", label: "Ecokraft Bags" },
          { value: "F&B Gourmet Bags", label: "F&B Gourmet Bags" },
          { value: "Luxury Bags", label: "Luxury Bags" },
          { value: "Kraft Paper Rolls", label: "Kraft Paper Rolls" },
        ]}
        error={errors.product_category?.message}
        {...register("product_category")}
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input
            label="Quantity"
            placeholder="e.g. 1000"
            error={errors.quantity?.message}
            {...register("quantity")}
          />
        </div>
        <div>
          <Select
            label="Unit"
            options={[
              { value: "pcs", label: "pcs" },
              { value: "kg", label: "kg" },
            ]}
            error={errors.quantity_unit?.message}
            {...register("quantity_unit")}
          />
        </div>
      </div>
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirement
        </label>
        <textarea
          placeholder="Describe requirement details..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white border-gray-300"
          {...register("requirement")}
        />
        {errors.requirement?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.requirement.message}</p>
        )}
      </div>
      <Select
        label="Status"
        options={
          ["Completed", "Delivered"].includes(cleanStatus)
            ? [
                { value: cleanStatus, label: `${cleanStatus} (Auto)` },
                { value: "New", label: "New" },
                { value: "Contacted", label: "Contacted" },
                { value: "Interested", label: "Interested" },
                { value: "Converted", label: "Converted" },
                { value: "Lost", label: "Lost" },
              ]
            : [
                { value: "New", label: "New" },
                { value: "Contacted", label: "Contacted" },
                { value: "Interested", label: "Interested" },
                { value: "Converted", label: "Converted" },
                { value: "Lost", label: "Lost" },
              ]
        }
        disabled={["Completed", "Delivered"].includes(cleanStatus)}
        error={errors.status?.message}
        {...register("status")}
      />
      <div className="flex gap-3 pt-5 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update Lead" : "Add Lead"}
        </button>
      </div>
    </form>
  );
};

export const InventoryForm = ({ initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="SKU"
        placeholder="e.g., KRAFT-QR-BBN"
        error={errors.sku?.message}
        {...register("sku")}
      />
      <Input
        label="Product Name"
        placeholder="Enter product name"
        error={errors.productName?.message}
        {...register("productName")}
      />
      <Select
        label="Category"
        options={[
          { value: "STANDARD", label: "Standard" },
          { value: "PREMIUM", label: "Premium" },
          { value: "FOOD_GRADE", label: "Food Grade" },
          { value: "RAW_MATERIAL", label: "Raw Material" },
        ]}
        error={errors.category?.message}
        {...register("category")}
      />
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
        placeholder="0"
        error={errors.reorderPt?.message}
        {...register("reorderPt")}
      />
      <button
    type="submit"
    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition"
  >
    {initialData ? "Update Item" : "Add Item"}
  </button>
    </form>
  );
};

export const OrderForm = ({ initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Client Name"
        placeholder="Enter client name"
        error={errors.clientName?.message}
        {...register("clientName")}
      />
      <Select
        label="Order Status"
        options={[
          { value: "PENDING", label: "Pending" },
          { value: "PROCESSING", label: "Processing" },
          { value: "DISPATCHED", label: "Dispatched" },
          { value: "DELIVERED", label: "Delivered" },
        ]}
        error={errors.status?.message}
        {...register("status")}
      />
      <Select
        label="Payment Status"
        options={[
          { value: "PAID", label: "Paid" },
          { value: "PENDING", label: "Pending" },
          { value: "PARTIAL", label: "Partial" },
        ]}
        error={errors.paymentStatus?.message}
        {...register("paymentStatus")}
      />
      <Input
        label="Amount"
        placeholder="₹0"
        error={errors.amount?.message}
        {...register("amount")}
      />
      <div className="flex gap-2 pt-4">
        <Button type="submit" loading={loading}>
          {initialData ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </form>
  );
};
