import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input, Badge, Modal } from "../../components/ui";
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CirclePlus,
  X,
  Palette,
  Package,
  Layers3,
  ShoppingBag,
  Factory,
  ArrowRightLeft,
  Ruler,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  useGetAllRawMaterials,
  useGetLowStockRawMaterials,
} from "../../../../hook/rawMaterial";
import { useGetAllProducts } from "../../../../hook/product";

const initialForm = {
  name: "",
  code: "",
  color: "",
  type: "Paper",
  unit: "kg",
  availableStock: "",
  reorderPoint: "",
  minStock: "",
  description: "",
  isActive: true,
};

const initialProductionForm = {
  productId: "",
  quantity: "",
  category: "STANDARD",
  reorderPt: "10",
  unitPrice: "",
  note: "",
  dimensionMode: "default",
  customDimensions: {
    length: "",
    width: "",
    height: "",
    unit: "inch",
  },
};

const RAW_MATERIAL_TYPES = [
  "Paper",
  "Handle",
  "Printing",
  "Adhesive",
  "Accessory",
  "Other",
];

const RAW_MATERIAL_UNITS = [
  "kg",
  "gram",
  "pairs",
  "litres",
  "pcs",
  "rolls",
  "meter",
  "sqft",
  "sqm",
];

const INVENTORY_CATEGORY_OPTIONS = ["STANDARD", "PREMIUM", "FOOD_GRADE"];

const DIMENSION_UNITS = ["inch", "cm", "mm", "ft"];

const getStockStatus = (availableStock, reorderPoint) => {
  const stock = Number(availableStock || 0);
  const reorder = Number(reorderPoint || 0);

  if (stock <= reorder * 0.5) return "critical";
  if (stock <= reorder) return "low";
  if (stock <= reorder * 1.5) return "medium";
  return "healthy";
};

const statusVariantMap = {
  healthy: "success",
  medium: "warning",
  low: "danger",
  critical: "danger",
};

const getFormFromItem = (item) => ({
  name: item?.name || "",
  code: item?.code || "",
  color: item?.color || "",
  type: item?.type || "Paper",
  unit: item?.unit || "kg",
  availableStock: item?.availableStock ?? "",
  reorderPoint: item?.reorderPoint ?? "",
  minStock: item?.minStock ?? "",
  description: item?.description || "",
  isActive: item?.isActive ?? true,
});

const toNumber = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const roundTo = (value, digits = 4) => Number(Number(value || 0).toFixed(digits));

const convertToInch = (value, unit) => {
  const v = Number(value || 0);
  if (!v) return 0;

  switch (unit) {
    case "cm":
      return v / 2.54;
    case "mm":
      return v / 25.4;
    case "ft":
      return v * 12;
    default:
      return v;
  }
};

const getVolumeLikeFactor = (dimensions) => {
  const length = convertToInch(dimensions?.length, dimensions?.unit);
  const width = convertToInch(dimensions?.width, dimensions?.unit);
  const height = convertToInch(dimensions?.height, dimensions?.unit);

  if (!length || !width || !height) return 0;
  return length * width * height;
};

const getAverageLinearFactor = (baseDimensions, customDimensions) => {
  const baseLength = convertToInch(baseDimensions?.length, baseDimensions?.unit);
  const baseWidth = convertToInch(baseDimensions?.width, baseDimensions?.unit);
  const baseHeight = convertToInch(baseDimensions?.height, baseDimensions?.unit);

  const customLength = convertToInch(customDimensions?.length, customDimensions?.unit);
  const customWidth = convertToInch(customDimensions?.width, customDimensions?.unit);
  const customHeight = convertToInch(customDimensions?.height, customDimensions?.unit);

  if (!baseLength || !baseWidth || !baseHeight) return 1;
  if (!customLength || !customWidth || !customHeight) return 1;

  const lRatio = customLength / baseLength;
  const wRatio = customWidth / baseWidth;
  const hRatio = customHeight / baseHeight;

  return (lRatio + wRatio + hRatio) / 3;
};

const RawMaterial = () => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const [stockNote, setStockNote] = useState("");

  const [showProductionModal, setShowProductionModal] = useState(false);
  const [productionForm, setProductionForm] = useState(initialProductionForm);

  const { data: rawMaterials = [], isLoading } = useGetAllRawMaterials({ search });
  const { data: lowStockAlerts = [] } = useGetLowStockRawMaterials();
  const { data: products = [] } = useGetAllProducts();

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();

    return rawMaterials.filter((item) => {
      return (
        item?.name?.toLowerCase().includes(q) ||
        item?.code?.toLowerCase().includes(q) ||
        item?.type?.toLowerCase().includes(q) ||
        item?.color?.toLowerCase().includes(q)
      );
    });
  }, [rawMaterials, search]);

  const totalMaterials = rawMaterials.length;
  const activeMaterials = rawMaterials.filter((item) => item.isActive).length;
  const totalStockUnits = rawMaterials.reduce(
    (sum, item) => sum + Number(item.availableStock || 0),
    0
  );
  const lowStockCount = lowStockAlerts.length;
  const differentBagTypes = products.length;

  const selectedProductionProduct = useMemo(() => {
    return (
      products.find(
        (item) => String(item._id || item.id) === String(productionForm.productId)
      ) || null
    );
  }, [products, productionForm.productId]);

  const baseProductDimensions = useMemo(() => {
    return selectedProductionProduct?.dimensions || {
      length: 0,
      width: 0,
      height: 0,
      unit: "inch",
    };
  }, [selectedProductionProduct]);

  const effectiveDimensions = useMemo(() => {
    if (productionForm.dimensionMode === "custom") {
      return {
        length: toNumber(productionForm.customDimensions.length),
        width: toNumber(productionForm.customDimensions.width),
        height: toNumber(productionForm.customDimensions.height),
        unit: productionForm.customDimensions.unit || "inch",
      };
    }

    return {
      length: toNumber(baseProductDimensions.length),
      width: toNumber(baseProductDimensions.width),
      height: toNumber(baseProductDimensions.height),
      unit: baseProductDimensions.unit || "inch",
    };
  }, [productionForm.dimensionMode, productionForm.customDimensions, baseProductDimensions]);

  const dimensionScaleFactor = useMemo(() => {
    if (!selectedProductionProduct) return 1;
    if (productionForm.dimensionMode !== "custom") return 1;

    const baseVolume = getVolumeLikeFactor(baseProductDimensions);
    const customVolume = getVolumeLikeFactor(effectiveDimensions);

    if (baseVolume > 0 && customVolume > 0) {
      return customVolume / baseVolume;
    }

    return getAverageLinearFactor(baseProductDimensions, effectiveDimensions);
  }, [selectedProductionProduct, productionForm.dimensionMode, baseProductDimensions, effectiveDimensions]);

  const rawMaterialCalculationPreview = useMemo(() => {
    if (!selectedProductionProduct) return [];

    const quantity = toNumber(productionForm.quantity);
    const mappedMaterials = selectedProductionProduct?.rawMaterials || [];

    return mappedMaterials.map((material, index) => {
      const usageType = material?.usageType || "fixed";
      const perBagQty = toNumber(material?.requiredQuantityPerBag || 0);

      let perBagRequired = perBagQty;

      if (usageType === "dimension_based") {
        perBagRequired = perBagQty * (dimensionScaleFactor || 1);
      }

      const wastagePercent = toNumber(material?.wastagePercent || 0);
      const baseTotal = perBagRequired * quantity;
      const wastageAmount = baseTotal * (wastagePercent / 100);
      const totalRequired = baseTotal + wastageAmount;

      return {
        id: material?.rawMaterialId || `${index}`,
        rawMaterialName: material?.rawMaterialName || "Raw Material",
        rawMaterialType: material?.rawMaterialType || "other",
        usageType,
        unit: material?.unit || "pcs",
        perBagQty: roundTo(perBagQty),
        adjustedPerBagQty: roundTo(perBagRequired),
        wastagePercent,
        totalRequired: roundTo(totalRequired),
      };
    });
  }, [selectedProductionProduct, productionForm.quantity, dimensionScaleFactor]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingItem(null);
    setShowFormModal(false);
  };

  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["getAllRawMaterials"] });
    queryClient.invalidateQueries({ queryKey: ["getLowStockRawMaterials"] });
    queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
    queryClient.invalidateQueries({ queryKey: ["getInventoryData"] });
    queryClient.invalidateQueries({ queryKey: ["getLowStockAlertsData"] });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData(getFormFromItem(item));
    setShowFormModal(true);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      color: formData.color.trim(),
      type: formData.type,
      unit: formData.unit,
      availableStock: Number(formData.availableStock || 0),
      reorderPoint: Number(formData.reorderPoint || 0),
      minStock: Number(formData.minStock || 0),
      description: formData.description.trim(),
      isActive: formData.isActive,
    };

    const loadingToast = toast.loading(
      editingItem ? "Updating raw material..." : "Creating raw material..."
    );

    try {
      const response = editingItem
        ? await axiosInstance.patch(
            `/raw-materials/${editingItem._id || editingItem.id}`,
            payload
          )
        : await axiosInstance.post("/raw-materials", payload);

      const savedItem = response?.data?.data;

      toast.success(
        editingItem
          ? "Raw material updated successfully 🎉"
          : "Raw material created successfully 🎉",
        { id: loadingToast }
      );

      invalidateAllQueries();

      if (
        selectedItem &&
        (selectedItem._id === (editingItem?._id || editingItem?.id) ||
          selectedItem.id === (editingItem?._id || editingItem?.id))
      ) {
        setSelectedItem(savedItem);
      }

      resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save raw material",
        { id: loadingToast }
      );
    }
  };

  const handleDeleteItem = async (id) => {
    const loadingToast = toast.loading("Deleting raw material...");

    try {
      await axiosInstance.delete(`/raw-materials/${id}`);

      toast.success("Raw material deleted successfully", {
        id: loadingToast,
      });

      invalidateAllQueries();

      if (selectedItem?._id === id || selectedItem?.id === id) {
        setSelectedItem(null);
        setShowDetailPanel(false);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete raw material",
        { id: loadingToast }
      );
    }
  };

  const openAddStockModal = (item) => {
    setSelectedStockItem(item);
    setStockToAdd("");
    setStockNote("");
    setShowStockModal(true);
  };

  const handleAddStock = async () => {
    if (!selectedStockItem) return;

    const quantity = Number(stockToAdd || 0);

    if (!quantity || quantity <= 0) {
      toast.error("Please enter valid stock quantity");
      return;
    }

    const loadingToast = toast.loading("Adding stock...");

    try {
      const response = await axiosInstance.patch(
        `/raw-materials/${selectedStockItem._id || selectedStockItem.id}/add-stock`,
        {
          quantity,
          note: stockNote || "Stock added manually",
        }
      );

      const updatedItem = response?.data?.data;

      toast.success("Stock added successfully 🎉", {
        id: loadingToast,
      });

      invalidateAllQueries();

      if (
        selectedItem &&
        (selectedItem._id === (selectedStockItem._id || selectedStockItem.id) ||
          selectedItem.id === (selectedStockItem._id || selectedStockItem.id))
      ) {
        setSelectedItem(updatedItem);
      }

      setShowStockModal(false);
      setSelectedStockItem(null);
      setStockToAdd("");
      setStockNote("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add stock",
        { id: loadingToast }
      );
    }
  };

  const handleProductionField = (field, value) => {
    setProductionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomDimensionField = (field, value) => {
    setProductionForm((prev) => ({
      ...prev,
      customDimensions: {
        ...prev.customDimensions,
        [field]: value,
      },
    }));
  };

  const handleCreateProductionStock = async (e) => {
    e.preventDefault();

    const payload = {
      productId: productionForm.productId,
      quantity: Number(productionForm.quantity || 0),
      category: productionForm.category,
      reorderPt: Number(productionForm.reorderPt || 10),
      note: productionForm.note,
      unitPrice: Number(productionForm.unitPrice || 0),

      dimensionMode: productionForm.dimensionMode,
      productionDimensions: effectiveDimensions,
      dimensionScaleFactor: roundTo(dimensionScaleFactor),
      calculatedRawMaterials: rawMaterialCalculationPreview,
    };

    if (!payload.productId || !payload.quantity || payload.quantity <= 0) {
      toast.error("Please select product and enter valid quantity");
      return;
    }

    if (
      productionForm.dimensionMode === "custom" &&
      (!effectiveDimensions.length ||
        !effectiveDimensions.width ||
        !effectiveDimensions.height)
    ) {
      toast.error("Please enter valid custom dimensions");
      return;
    }

    const loadingToast = toast.loading("Creating production stock...");

    try {
      const response = await axiosInstance.post("/inventory/create-production", payload);
      const item = response?.data?.data;

      toast.success("Inventory stock created successfully 🎉", {
        id: loadingToast,
      });

      invalidateAllQueries();
      setShowProductionModal(false);
      setProductionForm(initialProductionForm);

      if (item) {
        // optional success handling
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create production stock",
        { id: loadingToast }
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-xl ring-1 ring-white/10"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50 backdrop-blur-sm">
                Inventory Control Panel
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Raw Material Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                Manage raw materials, monitor alerts, create products, and generate
                dimension-wise inventory stock directly from mapped product raw materials.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:max-w-[460px]">
              <button
                type="button"
                onClick={() => navigate("/Product")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-lg"
              >
                <ShoppingBag size={18} />
                <span>Create Product</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProductionModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-emerald-900/40 px-5 py-3 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-900/55 hover:shadow-lg"
              >
                <Factory size={18} />
                <span>Create Production Stock</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl"
              >
                <Plus size={18} />
                <span>Create Raw Material</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Materials
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalMaterials}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Active Materials
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeMaterials}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Stock Units
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {Number(totalStockUnits).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Layers3 className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-red-100 bg-red-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-red-500">
                  Low Stock Alerts
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {lowStockCount}
                </p>
                <p className="mt-2 text-xs text-red-600">Need attention</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Bag Types / Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {differentBagTypes}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        {products.length > 0 && (
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Products for Stock Creation
                </h2>
                <p className="text-sm text-gray-500">
                  These products can create inventory by deducting mapped raw materials
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {products.map((product) => (
                <div
                  key={product._id || product.id}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  {product.name}
                </div>
              ))}
            </div>
          </Card>
        )}

        {lowStockAlerts.length > 0 && (
          <motion.div
            className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 p-4 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Low Stock Materials</h3>
                <p className="mb-3 text-sm text-red-700">
                  These raw materials are at or below reorder point.
                </p>

                <div className="space-y-2">
                  {lowStockAlerts.slice(0, 4).map((item) => (
                    <div
                      key={item._id || item.id}
                      className="flex items-center justify-between rounded-xl border border-red-100 bg-white p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Stock: {item.availableStock} {item.unit} · Reorder:{" "}
                          {item.reorderPoint} {item.unit}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailPanel(true);
                        }}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4"
        >
          <Input
            placeholder="Search by material name, code, type, or color..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Raw Materials Overview
                </h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredItems.length} raw materials
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
                <table className="w-full min-w-[1150px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Material
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Code
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Type
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Unit
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Available Stock
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Reorder Point
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
                    {filteredItems.map((item) => {
                      const status = getStockStatus(
                        item.availableStock,
                        item.reorderPoint
                      );

                      return (
                        <tr
                          key={item._id || item.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Palette className="h-3.5 w-3.5" />
                                {item.color || "No color"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            {item.code}
                          </td>

                          <td className="px-4 py-4">
                            <Badge variant="secondary">{item.type}</Badge>
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {item.unit}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            {Number(item.availableStock || 0).toLocaleString()} {item.unit}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {Number(item.reorderPoint || 0).toLocaleString()} {item.unit}
                          </td>

                          <td className="px-4 py-4">
                            <Badge variant={statusVariantMap[status]}>
                              {status === "critical"
                                ? "Critical"
                                : status === "low"
                                ? "Low"
                                : status === "medium"
                                ? "Medium"
                                : "Healthy"}
                            </Badge>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailPanel(true);
                                }}
                                className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openAddStockModal(item)}
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Add Stock"
                              >
                                <CirclePlus className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openEditModal(item)}
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item._id || item.id)}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!filteredItems.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No raw materials found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        <Modal
          isOpen={showProductionModal}
          title="Create Production Stock"
          onClose={() => {
            setShowProductionModal(false);
            setProductionForm(initialProductionForm);
          }}
        >
          <form onSubmit={handleCreateProductionStock} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product
              </label>
              <select
                value={productionForm.productId}
                onChange={(e) => handleProductionField("productId", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id || product.id} value={product._id || product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductionProduct && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Selected Product: {selectedProductionProduct.name}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  SKU: {selectedProductionProduct.sku} · Bag Type:{" "}
                  {selectedProductionProduct.bagType}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Raw Materials Mapped: {selectedProductionProduct?.rawMaterials?.length || 0}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Number of Bags
                </label>
                <input
                  type="number"
                  min="1"
                  value={productionForm.quantity}
                  onChange={(e) => handleProductionField("quantity", e.target.value)}
                  placeholder="100"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Inventory Category
                </label>
                <select
                  value={productionForm.category}
                  onChange={(e) => handleProductionField("category", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {INVENTORY_CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="0"
                  value={productionForm.reorderPt}
                  onChange={(e) => handleProductionField("reorderPt", e.target.value)}
                  placeholder="10"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Unit Price Override
                </label>
                <input
                  type="number"
                  min="0"
                  value={productionForm.unitPrice}
                  onChange={(e) => handleProductionField("unitPrice", e.target.value)}
                  placeholder="Optional price override"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {selectedProductionProduct && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Dimension Wise Production
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Dimension Mode
                    </label>
                    <select
                      value={productionForm.dimensionMode}
                      onChange={(e) => handleProductionField("dimensionMode", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="default">Use Product Default Dimensions</option>
                      <option value="custom">Use Custom Dimensions</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Base Product Dimensions
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {toNumber(baseProductDimensions.length)} × {toNumber(baseProductDimensions.width)} ×{" "}
                        {toNumber(baseProductDimensions.height)} {baseProductDimensions.unit || "inch"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Effective Production Dimensions
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {toNumber(effectiveDimensions.length)} × {toNumber(effectiveDimensions.width)} ×{" "}
                        {toNumber(effectiveDimensions.height)} {effectiveDimensions.unit || "inch"}
                      </p>
                    </div>
                  </div>

                  {productionForm.dimensionMode === "custom" && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Length
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.length}
                          onChange={(e) => handleCustomDimensionField("length", e.target.value)}
                          placeholder="14"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Width
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.width}
                          onChange={(e) => handleCustomDimensionField("width", e.target.value)}
                          placeholder="10"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Height
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.height}
                          onChange={(e) => handleCustomDimensionField("height", e.target.value)}
                          placeholder="12"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Unit
                        </label>
                        <select
                          value={productionForm.customDimensions.unit}
                          onChange={(e) => handleCustomDimensionField("unit", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        >
                          {DIMENSION_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-amber-700" />
                      <p className="text-sm font-bold text-gray-900">Calculated Scale Factor</p>
                    </div>
                    <p className="mt-2 text-lg font-bold text-amber-800">
                      {roundTo(dimensionScaleFactor, 4)}x
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      For custom dimensions, dimension-based raw materials scale automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedProductionProduct && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Raw Material Requirement Preview
                  </h3>
                </div>

                {rawMaterialCalculationPreview.length > 0 ? (
                  <div className="space-y-3">
                    {rawMaterialCalculationPreview.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.rawMaterialName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Type: {item.rawMaterialType} · Usage: {item.usageType}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] uppercase text-gray-500">Base / Bag</p>
                              <p className="mt-1 text-sm font-bold text-gray-900">
                                {item.perBagQty} {item.unit}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] uppercase text-gray-500">Adj. / Bag</p>
                              <p className="mt-1 text-sm font-bold text-gray-900">
                                {item.adjustedPerBagQty} {item.unit}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] uppercase text-gray-500">Wastage</p>
                              <p className="mt-1 text-sm font-bold text-gray-900">
                                {item.wastagePercent}%
                              </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 px-3 py-2">
                              <p className="text-[11px] uppercase text-emerald-700">Total Need</p>
                              <p className="mt-1 text-sm font-bold text-emerald-800">
                                {item.totalRequired} {item.unit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No raw material mapping found for selected product.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Note
              </label>
              <textarea
                rows={3}
                value={productionForm.note}
                onChange={(e) => handleProductionField("note", e.target.value)}
                placeholder="Create stock from selected product and deduct raw materials automatically"
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowProductionModal(false);
                  setProductionForm(initialProductionForm);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-700">
                Create Stock
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showFormModal}
          title={editingItem ? "Edit Raw Material" : "Create Raw Material"}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Material Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Kraft Paper Roll"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Code
                </label>
                <input
                  value={formData.code}
                  onChange={(e) => handleFieldChange("code", e.target.value)}
                  placeholder="RM-KRAFT-001"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Color
                </label>
                <input
                  value={formData.color}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  placeholder="Brown"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFieldChange("type", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {RAW_MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleFieldChange("unit", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {RAW_MATERIAL_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Available Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableStock}
                  onChange={(e) =>
                    handleFieldChange("availableStock", e.target.value)
                  }
                  placeholder="1200"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) =>
                    handleFieldChange("reorderPoint", e.target.value)
                  }
                  placeholder="300"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleFieldChange("minStock", e.target.value)}
                  placeholder="200"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Primary kraft paper roll for shopping bags"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleFieldChange("isActive", e.target.checked)
                    }
                  />
                  Active Raw Material
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-700">
                {editingItem ? "Update Material" : "Create Material"}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showStockModal}
          title="Add Stock"
          onClose={() => {
            setShowStockModal(false);
            setSelectedStockItem(null);
            setStockToAdd("");
            setStockNote("");
          }}
        >
          {selectedStockItem && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">Material</p>
                <p className="font-semibold text-gray-900">{selectedStockItem.name}</p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs uppercase text-gray-500">Current Stock</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {Number(selectedStockItem.availableStock || 0).toLocaleString()}{" "}
                      {selectedStockItem.unit}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs uppercase text-gray-500">Code</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {selectedStockItem.code}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Add Stock Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Note
                </label>
                <textarea
                  rows={3}
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="Stock received from supplier"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  New stock level:
                  <span className="ml-2 font-semibold text-gray-900">
                    {(
                      Number(selectedStockItem.availableStock || 0) +
                      Number(stockToAdd || 0)
                    ).toLocaleString()}{" "}
                    {selectedStockItem.unit}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedStockItem(null);
                    setStockToAdd("");
                    setStockNote("");
                  }}
                >
                  Cancel
                </Button>

                <Button className="bg-green-900" onClick={handleAddStock}>
                  Add Stock
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {showDetailPanel && selectedItem && (
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
              className="relative h-screen w-full max-w-md overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Raw Material Detail
                  </h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedItem.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{selectedItem.code}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Type
                    </p>
                    <p className="mt-1 text-gray-900">{selectedItem.type}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Color
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedItem.color || "No color"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Available Stock
                    </p>
                    <p className="mt-1 text-gray-900">
                      {Number(selectedItem.availableStock || 0).toLocaleString()}{" "}
                      {selectedItem.unit}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Reorder Point
                    </p>
                    <p className="mt-1 text-gray-900">
                      {Number(selectedItem.reorderPoint || 0).toLocaleString()}{" "}
                      {selectedItem.unit}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Minimum Stock
                    </p>
                    <p className="mt-1 text-gray-900">
                      {Number(selectedItem.minStock || 0).toLocaleString()}{" "}
                      {selectedItem.unit}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Description
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedItem.description || "No description added"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase text-gray-500">
                      Stock History
                    </p>

                    <div className="space-y-2">
                      {(selectedItem.stockHistory || []).length > 0 ? (
                        selectedItem.stockHistory
                          .slice()
                          .reverse()
                          .map((log, idx) => (
                            <div key={idx} className="rounded-xl bg-gray-50 p-3 text-sm">
                              <p className="font-medium text-gray-900">
                                {log.action} · {log.quantity} {selectedItem.unit}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.note || "Stock activity"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Previous: {log.previousStock} → New: {log.newStock}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No stock history available
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
                      openEditModal(selectedItem);
                      setShowDetailPanel(false);
                    }}
                  >
                    Edit Material
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

export default RawMaterial;