import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import { getProductTaxInfo, exportToExcel } from "../../utils";
import ProductForm from "../../components/forms/ProductForm";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Package,
  Boxes,
  Ruler,
  Wallet,
  Layers3,
  RotateCcw,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAllProducts } from "../../../../hook/Product";

const Product = () => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDeleted, setShowDeleted] = useState(false);
  const [activeLogProduct, setActiveLogProduct] = useState(null);
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  const { data: products = [], isLoading } = useGetAllProducts({ search, showDeleted });

  const currentActiveProduct = useMemo(() => {
    if (!activeLogProduct) return null;
    return products.find(p => String(p._id || p.id) === String(activeLogProduct._id || activeLogProduct.id)) || activeLogProduct;
  }, [products, activeLogProduct]);

  React.useEffect(() => {
    if (!activeLogProduct && products.length > 0) {
      setActiveLogProduct(products[0]);
    }
  }, [products, activeLogProduct]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const query = search.toLowerCase();
      return (
        String(item?.name || "").toLowerCase().includes(query) ||
        String(item?.category || "").toLowerCase().includes(query) ||
        String(item?.sku || "").toLowerCase().includes(query) ||
        String(item?.bagType || "").toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const activeCount = products.filter((item) => item.isActive).length;
  const customCount = products.filter((item) => item.bagType === "custom").length;
  const totalRawMappings = products.reduce(
    (sum, item) => sum + (item?.rawMaterials?.length || 0),
    0
  );

  const handleAddProduct = async (data) => {
    const loadingToast = toast.loading("Creating product...");

    try {
      const response = await axiosInstance.post("/products", data);
      const createdProduct = response?.data?.data;
      console.log(response)
      toast.success("Product created successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (createdProduct) {
        setSelectedProduct(createdProduct);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create product",
        { id: loadingToast }
      );
    }
  };

  const handleUpdateProduct = async (data) => {
    const reason = window.prompt("Enter reason/note for updating this product:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Reason is required to update product specs");
      return;
    }

    const loadingToast = toast.loading("Updating product...");

    try {
      const response = await axiosInstance.patch(
        `/products/${editingProduct._id || editingProduct.id}`,
        { ...data, reason }
      );

      const updatedProduct = response?.data?.data;

      toast.success("Product updated successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);
      setEditingProduct(null);

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (
        selectedProduct &&
        (selectedProduct._id === (editingProduct._id || editingProduct.id) ||
          selectedProduct.id === (editingProduct._id || editingProduct.id))
      ) {
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update product",
        { id: loadingToast }
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    const reason = window.prompt("Enter reason/note for deleting this product:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Reason is required to delete product");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) return;
    if (!window.confirm("Are you absolutely sure? This will hide the product and soft-delete its inventory stock levels.")) return;
    const loadingToast = toast.loading("Deleting product...");

    try {
      await axiosInstance.delete(`/products/${id}`, { params: { reason } });

      toast.success("Product deleted successfully", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (selectedProduct?._id === id || selectedProduct?.id === id) {
        setShowDetailPanel(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete product",
        { id: loadingToast }
      );
    }
  };

  const handleRecoverProduct = async (id) => {
    const reason = window.prompt("Enter reason/note for recovering this product:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Reason is required to recover product");
      return;
    }

    if (!window.confirm("Are you sure you want to recover this product?")) return;
    if (!window.confirm("Are you absolutely sure you want to restore it back to the active catalog?")) return;
    const loadingToast = toast.loading("Restoring product...");

    try {
      await axiosInstance.patch(`/products/${id}/recover`, { reason });

      toast.success("Product restored successfully 🎉", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getInventoryData"],
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to restore product",
        { id: loadingToast }
      );
    }
  };

  const handleRestoreState = async (productId, snapshotId, reason) => {
    const loadingToast = toast.loading("Restoring product specifications...");
    try {
      await axiosInstance.patch(`/products/${productId}/restore`, { snapshotId, reason });
      toast.success("Product state restored successfully ✓", { id: loadingToast });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore product state", { id: loadingToast });
    }
  };

  const getProductSnapshotDiff = (snapshot, nextSnapshot, currentProd) => {
    const diffs = [];
    const target = nextSnapshot ? nextSnapshot.specs : currentProd;
    if (!target || !snapshot || !snapshot.specs) return diffs;

    const currentSpecs = snapshot.specs;

    const compareFields = [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "sku", label: "SKU" },
      { key: "bagType", label: "Bag Type" },
      { key: "gsm", label: "GSM" },
      { key: "weight", label: "Weight" },
      { key: "lengthInMeters", label: "Length (m)" },
      { key: "bf", label: "BF" },
      { key: "unit", label: "Unit" },
      { key: "basePrice", label: "Base Price" },
      { key: "customPrinting", label: "Custom Printing" },
      { key: "isDeleted", label: "Soft Delete" },
    ];

    compareFields.forEach(({ key, label }) => {
      const oldVal = currentSpecs[key];
      const newVal = target[key];
      if (oldVal !== newVal && oldVal !== undefined && newVal !== undefined) {
        diffs.push(`${label}: "${oldVal ?? "—"}" ➔ "${newVal ?? "—"}"`);
      }
    });

    return diffs;
  };

  const handleExportProducts = (format) => {
    if (!filteredProducts.length) {
      toast.error("No products available to export");
      return;
    }

    const headers = [
      "Product Name",
      "Bag Type / Specs",
      "Category",
      "SKU",
      "Dimensions",
      "Base Price (₹)",
      "Raw Materials Mapped",
      "Status",
    ];

    const rows = filteredProducts.map((p) => {
      const dimStr = p?.category?.toLowerCase().includes("roll")
        ? `Width ${p?.dimensions?.width || 0} ${p?.dimensions?.unit || "inch"}`
        : `${p?.dimensions?.length || 0} × ${p?.dimensions?.width || 0} × ${p?.dimensions?.height || 0} ${p?.dimensions?.unit || "inch"}`;
      return [
        p.name || "",
        p.bagType || "",
        p.category || "",
        p.sku || "",
        dimStr,
        p.basePrice || 0,
        p.rawMaterials?.length || 0,
        p.isActive ? "Active" : "Inactive",
      ];
    });

    if (format === "csv") {
      const csvContent = [headers, ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`))].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } else {
      exportToExcel(headers, rows, "products");
      toast.success("Excel exported successfully");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-xl ring-1 ring-white/10"
        >
          {/* subtle overlay glow */}
          <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

            {/* LEFT CONTENT */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
                Product Control Panel
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Product Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                Create products with full specifications, dimensions, pricing setup,
                and raw material mapping for accurate bag estimation.
              </p>
            </div>

            {/* RIGHT CTA */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end xl:w-auto">

              <Button
                variant="custom"
                icon={Download}
                onClick={() => handleExportProducts("csv")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-6 py-3 text-sm font-semibold shadow-lg"
              >
                Export CSV
              </Button>

              <Button
                variant="custom"
                icon={FileSpreadsheet}
                onClick={() => handleExportProducts("excel")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-6 py-3 text-sm font-semibold shadow-lg"
              >
                Export Excel
              </Button>

              <Button
                icon={Plus}
                onClick={() => {
                  setEditingProduct(null);
                  setShowModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-bold text-emerald-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl"
              >
                Add New Product
              </Button>

            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Active Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeCount}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Custom Bags
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {customCount}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Ruler className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Raw Material Mappings
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalRawMappings}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Layers3 className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1">
            <Input
              placeholder="Search by product name, category, SKU, or bag type..."
              value={search}
              icon={Search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showDeleted ? "danger" : "secondary"}
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center justify-center gap-2 rounded-2xl h-[48px] px-6 text-sm font-semibold shadow-sm transition-all duration-200 border"
          >
            {showDeleted ? "📦 View Active" : "🗑️ View Trash"}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Products Overview</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredProducts.length} products
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Dimensions
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Base Price
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Materials
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50 cursor-pointer"
                        onClick={() => setActiveLogProduct(item)}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.bagType}</p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item.category}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {item.sku}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item?.category?.toLowerCase().includes("roll")
                            ? `Width ${item?.dimensions?.width || 0} ${item?.dimensions?.unit || "inch"}`
                            : `${item?.dimensions?.length || 0} × ${item?.dimensions?.width || 0} × ${item?.dimensions?.height || 0} ${item?.dimensions?.unit || "inch"}`}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          ₹{Number(item.basePrice || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item?.rawMaterials?.length || 0}
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={item.isActive ? "success" : "danger"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(item);
                                setShowDetailPanel(true);
                              }}
                              className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                              title="View Product"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {showDeleted ? (
                              <button
                                onClick={() => handleRecoverProduct(item._id || item.id)}
                                className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                                title="Recover Product"
                              >
                                <RotateCcw className="h-4 w-4 text-emerald-600" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingProduct(item);
                                    setShowModal(true);
                                  }}
                                  className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                  title="Edit Product"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(item._id || item.id)}
                                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filteredProducts.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {currentActiveProduct && (
            <div className="mt-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg mb-6">
                <h3 className="text-lg font-bold">Activity Logs & Modification History — {currentActiveProduct.name}</h3>
                <p className="mt-1 text-xs text-slate-300 opacity-90">
                  Showing specifications modifications, delete actions, and recovery snapshots for Product {currentActiveProduct.name} ({currentActiveProduct.sku})
                </p>
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-gray-200 p-3 rounded-2xl mb-6 text-sm">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter Logs by Date:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">From</span>
                  <input
                    type="date"
                    value={logStartDate}
                    max={logEndDate || undefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (logEndDate && val > logEndDate) {
                        toast.error("'From' date cannot be after 'To' date");
                        return;
                      }
                      setLogStartDate(val);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">To</span>
                  <input
                    type="date"
                    value={logEndDate}
                    min={logStartDate || undefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (logStartDate && val < logStartDate) {
                        toast.error("'To' date cannot be before 'From' date");
                        return;
                      }
                      setLogEndDate(val);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                {(logStartDate || logEndDate) && (
                  <button
                    onClick={() => { setLogStartDate(""); setLogEndDate(""); }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(() => {
                  const getLocalDateString = (dateVal) => {
                    if (!dateVal) return "";
                    const d = new Date(dateVal);
                    if (isNaN(d.getTime())) return "";
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  };

                  const rawHistory = currentActiveProduct.editHistory || [];
                  let sortedHistory = [...rawHistory].reverse();
                  if (logStartDate) {
                    sortedHistory = sortedHistory.filter(l => l.at && getLocalDateString(l.at) >= logStartDate);
                  }
                  if (logEndDate) {
                    sortedHistory = sortedHistory.filter(l => l.at && getLocalDateString(l.at) <= logEndDate);
                  }
                  
                  return sortedHistory.map((log, index) => {
                    const nextLog = index > 0 ? sortedHistory[index - 1] : null;
                    const changes = getProductSnapshotDiff(log, nextLog, currentActiveProduct);
                    const logReason = String(log?.reason || log?.note || "").toLowerCase();
                    const canRestore = !currentActiveProduct.isDeleted && !logReason.includes("deleted") && !logReason.includes("recovered");
                    const title = logReason.includes("deleted") ? "Product Soft-Deleted" : logReason.includes("recovered") ? "Product Recovered" : "Product Specifications Updated";

                    return (
                      <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                title.includes("Deleted") 
                                  ? "bg-red-50 border-red-150 text-red-700" 
                                  : title.includes("Recovered") 
                                    ? "bg-green-50 border-green-150 text-green-700"
                                    : "bg-indigo-50 border-indigo-150 text-indigo-700"
                              }`}>
                                {title.includes("Deleted") ? "❌" : title.includes("Recovered") ? "🔄" : "📝"} {title}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 font-medium">
                              <span className="font-semibold text-gray-800">Updated by:</span> {log?.by || "Admin"}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 font-medium">
                              <span className="font-semibold text-gray-800">Reason/Note:</span> {log?.reason || log?.note || "No reason specified"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-500 font-semibold">
                              {log?.at ? new Date(log.at).toLocaleString() : "—"}
                            </span>
                            {canRestore && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = window.prompt("Enter reason/note for restoring this snapshot:");
                                  if (reason === null) return;
                                  if (!reason.trim()) {
                                    toast.error("Reason is required to revert state");
                                    return;
                                  }
                                  handleRestoreState(currentActiveProduct._id || currentActiveProduct.id, log._id, reason);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition shadow-sm border border-teal-200"
                              >
                                Restore State
                              </button>
                            )}
                          </div>
                        </div>

                        {changes && changes.length > 0 ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Changed fields:</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-semibold">
                              {changes.map((changeStr, cIdx) => (
                                <li key={cIdx}>{changeStr}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          !title.includes("Deleted") && !title.includes("Recovered") && (
                            <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">
                              No specification details changed (metadata or note edit).
                            </div>
                          )
                        )}
                      </div>
                    );
                  });
                })()}

                {(!currentActiveProduct.editHistory || currentActiveProduct.editHistory.length === 0) && (
                  <div className="rounded-xl border border-dashed border-gray-250 p-6 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                    No modifications or delete actions recorded for this product yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <Modal
          isOpen={showModal}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        >
          <ProductForm
            initialData={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          />
        </Modal>

        {showDetailPanel && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowDetailPanel(false)}
            />

            <motion.div
              className="relative h-screen w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Product Detail</h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProduct.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{selectedProduct.sku}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Category
                    </p>
                    <p className="mt-1 text-gray-900">{selectedProduct.category}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Bag Type
                    </p>
                    <p className="mt-1 text-gray-900">{selectedProduct.bagType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        HSN Code
                      </p>
                      <p className="mt-1 text-gray-900 font-bold">
                        {(() => {
                          const taxInfo = getProductTaxInfo(selectedProduct);
                          return taxInfo.hsnCode;
                        })()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        GST Rate
                      </p>
                      <p className="mt-1 text-gray-900 font-bold">
                        {(() => {
                          const taxInfo = getProductTaxInfo(selectedProduct);
                          return `${taxInfo.gstRate}%`;
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Description
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedProduct.description || "No description added"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Dimensions
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct?.category?.toLowerCase().includes("roll") ? (
                        <>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Width</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.width}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Unit</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.unit}
                            </p>
                          </div>
                          {selectedProduct?.gsm && (
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs font-semibold text-gray-500">GSM</p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {selectedProduct?.gsm}
                              </p>
                            </div>
                          )}
                          {selectedProduct?.weight && (
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs font-semibold text-gray-500">Weight (kg)</p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {selectedProduct?.weight}
                              </p>
                            </div>
                          )}
                          {selectedProduct?.lengthInMeters && (
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs font-semibold text-gray-500">Length (m)</p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {selectedProduct?.lengthInMeters}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Length</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.length}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Width</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.width}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Height</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.height}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">Unit</p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {selectedProduct?.dimensions?.unit}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Pricing
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Base Price</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹{Number(selectedProduct?.basePrice || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Pricing Mode</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.estimationConfig?.pricingMode || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Labor Cost</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹
                          {Number(
                            selectedProduct?.estimationConfig?.laborCostPerBag || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Margin %</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {Number(
                            selectedProduct?.estimationConfig?.marginPercent || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase text-gray-500">
                      Raw Materials
                    </p>

                    <div className="space-y-3">
                      {(selectedProduct?.rawMaterials || []).length > 0 ? (
                        selectedProduct.rawMaterials.map((item, index) => (
                          <div key={index} className="rounded-xl bg-gray-50 p-3">
                            <p className="font-semibold text-gray-900">
                              {item.rawMaterialName}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              Type: {item.rawMaterialType}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty / Bag: {item.requiredQuantityPerBag} {item.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              Wastage: {item.wastagePercent || 0}%
                            </p>
                            <p className="text-sm text-gray-600">
                              Usage Type: {item.usageType}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.notes || "No notes"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No raw materials mapped.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailPanel(false)}
                  >
                    Close
                  </Button>

                  <Button
                    onClick={() => {
                      setEditingProduct(selectedProduct);
                      setShowModal(true);
                      setShowDetailPanel(false);
                    }}
                  >
                    Edit Product
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Product;