import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../ui";

// Validation Schemas
const leadSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    business_name: z.string().optional(),
    product_category: z.enum(["Ecocraft Bags", "F&B Gourmet Bags", "Luxury Bags"]),
    status: z.enum(["New", "Contacted", "Interested", "Converted", "Lost"]),
  })
  .strict();

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {...register("phone")}
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
          { value: "Ecocraft Bags", label: "Ecocraft Bags" },
          { value: "F&B Gourmet Bags", label: "F&B Gourmet Bags" },
          { value: "Luxury Bags", label: "Luxury Bags" },
        ]}
        error={errors.product_category?.message}
        {...register("product_category")}
      />
      <Select
        label="Status"
        options={[
          { value: "New", label: "New" },
          { value: "Contacted", label: "Contacted" },
          { value: "Interested", label: "Interested" },
          { value: "Converted", label: "Converted" },
          { value: "Lost", label: "Lost" },
        ]}
        error={errors.status?.message}
        {...register("status")}
      />
      <div className="flex gap-2 pt-4">
        <Button type="submit" loading={loading}>
          {initialData ? "Update Lead" : "Add Lead"}
        </Button>
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
