import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input, Badge, Modal } from "../../components/ui";
import RawMaterialDetail from "../../components/inventory/RawMaterialDetail";
import RawMaterialForm from "../../components/forms/RawMaterialForm";
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
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  FileBox,
  Activity,
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

// --- Types ---

interface IStockHistory {
  action: "ADD" | "REMOVE" | "SET" | "PRODUCTION_CREATE" | "RESERVE" | "COMMIT";
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt: string;
}

interface IRawMaterial {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  type: string;
  availableStock: number;
  reservedStock: number;
  availableForSale: number;
  unit: string;
  unitPrice: number;
  reorderPoint: number;
  minStock?: number;
  description?: string;
  color?: string;
  stockHistory: IStockHistory[];
  status?: string;
  isActive?: boolean;
}

interface IBagProduct {
  _id: string;
  id?: string;
  name: string;
  sku: string;
  bagType?: string;
  dimensions?: {
    length: number | string;
    width: number | string;
    height: number | string;
    unit: string;
  };
  rawMaterials?: Array<{
    rawMaterialId: string;
    rawMaterialName: string;
    rawMaterialType: string;
    usageType: string;
    unit: string;
    requiredQuantityPerBag: number | string;
    wastagePercent: number | string;
  }>;
}

interface IProductionForm {
  productId: string;
  quantity: string | number;
  category: "STANDARD" | "PREMIUM" | "FOOD_GRADE";
  bagColor: string;
  bagSizeLabel: string;
  reorderPt: string | number;
  unitPrice?: string | number;
  note?: string;
  dimensionMode: "default" | "custom";
  customDimensions: {
    length: string | number;
    width: string | number;
    height: string | number;
    unit: string;
  };
}

interface INotification {
  message: string;
  type: "success" | "error";
}

const initialForm: Omit<IRawMaterial, "stockHistory" | "availableForSale"> = {
  name: "",
  code: "",
  color: "",
  type: "Paper",
  unit: "kg",
  unitPrice: 0,
  availableStock: 0,
  reservedStock: 0,
  reorderPoint: 0,
  minStock: 0,
  description: "",
  isActive: true,
};

const initialProductionForm: IProductionForm = {
  productId: "",
  quantity: "",
  category: "STANDARD",
  bagColor: "",
  bagSizeLabel: "",
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

const INVENTORY_CATEGORY_OPTIONS = ["STANDARD", "PREMIUM", "FOOD_GRADE"] as const;

const DIMENSION_UNITS = ["inch", "cm", "mm", "ft"];
const DEFAULT_BAG_COLORS = ["Brown", "White", "Black", "Natural", "Printed"];
const DEFAULT_BAG_SIZES = ["Small", "Medium", "Large"];

const getStockStatus = (availableStock: number | string, reorderPoint: number | string) => {
  const stock = Number(availableStock || 0);
  const reorder = Number(reorderPoint || 0);

  if (stock <= reorder * 0.5) return "critical";
  if (stock <= reorder) return "low";
  if (stock <= reorder * 1.5) return "medium";
  return "healthy";
};

const statusVariantMap: Record<string, string> = {
  healthy: "success",
  medium: "warning",
  low: "danger",
  critical: "danger",
};

const getFormFromItem = (item: IRawMaterial): Omit<IRawMaterial, "stockHistory" | "availableForSale"> => ({
  name: item?.name || "",
  code: item?.code || "",
  color: item?.color || "",
  type: item?.type || "Paper",
  unit: item?.unit || "kg",
  unitPrice: item?.unitPrice ?? 0,
  availableStock: item?.availableStock ?? 0,
  reservedStock: item?.reservedStock ?? 0,
  reorderPoint: item?.reorderPoint ?? 0,
  minStock: item?.minStock ?? 0,
  description: item?.description || "",
  isActive: item?.isActive ?? true,
});

const toNumber = (value: string | number) => {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const roundTo = (value: number | string, digits = 4) => Number(Number(value || 0).toFixed(digits));

const convertToInch = (value: number | string, unit: string) => {
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

const getVolumeLikeFactor = (dimensions?: { length: number | string; width: number | string; height: number | string; unit: string }) => {
  if (!dimensions) return 0;
  const length = convertToInch(dimensions.length, dimensions.unit);
  const width = convertToInch(dimensions.width, dimensions.unit);
  const height = convertToInch(dimensions.height, dimensions.unit);

  if (!length || !width || !height) return 0;
  return length * width * height;
};

const getAverageLinearFactor = (
  baseDimensions?: { length: number | string; width: number | string; height: number | string; unit: string },
  customDimensions?: { length: number | string; width: number | string; height: number | string; unit: string }
) => {
  if (!baseDimensions || !customDimensions) return 1;

  const baseLength = convertToInch(baseDimensions.length, baseDimensions.unit);
  const baseWidth = convertToInch(baseDimensions.width, baseDimensions.unit);
  const baseHeight = convertToInch(baseDimensions.height, baseDimensions.unit);

  const customLength = convertToInch(customDimensions.length, customDimensions.unit);
  const customWidth = convertToInch(customDimensions.width, customDimensions.unit);
  const customHeight = convertToInch(customDimensions.height, customDimensions.unit);

  if (!baseLength || !baseWidth || !baseHeight) return 1;
  if (!customLength || !customWidth || !customHeight) return 1;

  const lRatio = customLength / baseLength;
  const wRatio = customWidth / baseWidth;
  const hRatio = customHeight / baseHeight;

  return (lRatio + wRatio + hRatio) / 3;
};

const getLinearSumFactor = (
  baseDimensions?: { length: number | string; width: number | string; height: number | string; unit: string },
  customDimensions?: { length: number | string; width: number | string; height: number | string; unit: string }
) => {
  if (!baseDimensions || !customDimensions) return 1;

  const baseLength = convertToInch(baseDimensions.length, baseDimensions.unit);
  const baseWidth = convertToInch(baseDimensions.width, baseDimensions.unit);
  const baseHeight = convertToInch(baseDimensions.height, baseDimensions.unit);

  const customLength = convertToInch(customDimensions.length, customDimensions.unit);
  const customWidth = convertToInch(customDimensions.width, customDimensions.unit);
  const customHeight = convertToInch(customDimensions.height, customDimensions.unit);

  const baseLinearSum = baseLength + baseWidth + baseHeight;
  const customLinearSum = customLength + customWidth + customHeight;

  if (!baseLinearSum || !customLinearSum) return 1;
  return customLinearSum / baseLinearSum;
};

const RawMaterial = () => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IRawMaterial | null>(null);
  const [formData, setFormData] = useState<Omit<IRawMaterial, "stockHistory" | "availableForSale">>(initialForm);
  const [rawMaterialSubmitting, setRawMaterialSubmitting] = useState(false);

  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IRawMaterial | null>(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<IRawMaterial | null>(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const [stockNote, setStockNote] = useState("");

  const [showProductionModal, setShowProductionModal] = useState(false);
  const [productionForm, setProductionForm] = useState<IProductionForm>(initialProductionForm);
  const [bagColorOptions, setBagColorOptions] = useState<string[]>(DEFAULT_BAG_COLORS);
  const [bagSizeOptions, setBagSizeOptions] = useState<string[]>(DEFAULT_BAG_SIZES);
  const [customBagColor, setCustomBagColor] = useState("");
  const [customBagSize, setCustomBagSize] = useState("");

  const { data: rawMaterials = [], isLoading } = useGetAllRawMaterials({ search });
  const { data: lowStockAlerts = [] } = useGetLowStockRawMaterials();
  const { data: products = [] } = useGetAllProducts();

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();

    return rawMaterials.filter((item: IRawMaterial) => {
      return (
        item?.name?.toLowerCase().includes(q) ||
        item?.code?.toLowerCase().includes(q) ||
        item?.type?.toLowerCase().includes(q) ||
        item?.color?.toLowerCase().includes(q)
      );
    });
  }, [rawMaterials, search]);

  const totalMaterials = rawMaterials.length;
  const activeMaterials = rawMaterials.filter((item: IRawMaterial) => item.isActive).length;
  const totalStockUnits = rawMaterials.reduce(
    (sum: number, item: IRawMaterial) => sum + Number(item.availableStock || 0),
    0
  );
  const totalRawMaterialValue = rawMaterials.reduce(
    (sum: number, item: IRawMaterial) =>
      sum + Number(item.availableStock || 0) * Number(item.unitPrice || 0),
    0
  );
  const lowStockCount = lowStockAlerts.length;
  const differentBagTypes = products.length;
  const manufacturingHoldUnits = rawMaterials.reduce(
    (sum: number, item: IRawMaterial) => sum + Number(item.reservedStock || 0),
    0
  );
  const availableToUseUnits = rawMaterials.reduce(
    (sum: number, item: IRawMaterial) => sum + Number(item.availableForSale || 0),
    0
  );
  const activeMaterialRate = totalMaterials ? Math.round((activeMaterials / totalMaterials) * 100) : 0;
  const lowStockSummary =
    lowStockCount === 0
      ? "All materials are above reorder point"
      : `${lowStockCount} material${lowStockCount > 1 ? "s" : ""} need close monitoring`;
  const formattedRawMaterialValue = `₹${Number(totalRawMaterialValue).toLocaleString("en-IN")}`;
  const stockToAddValue = Number(stockToAdd || 0);
  const projectedStockLevel = Number(selectedStockItem?.availableStock || 0) + stockToAddValue;
  const projectedStockValue =
    projectedStockLevel * Number(selectedStockItem?.unitPrice || 0);

  const selectedProductionProduct = useMemo(() => {
    return (
      products.find(
        (item: IBagProduct) => String(item._id || item.id) === String(productionForm.productId)
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
  const selectedProductDimensionSummary = `${toNumber(effectiveDimensions.length)} × ${toNumber(
    effectiveDimensions.width
  )} × ${toNumber(effectiveDimensions.height)} ${effectiveDimensions.unit || "inch"}`;
  const selectedProductMaterialCount = selectedProductionProduct?.rawMaterials?.length || 0;

  const dimensionScaleFactor = useMemo(() => {
    if (!selectedProductionProduct) return 1;
    if (productionForm.dimensionMode !== "custom") return 1;

    // Keep scale logic consistent with order availability engine:
    // factor = (L+W+H custom) / (L+W+H base)
    const linearSumFactor = getLinearSumFactor(
      baseProductDimensions,
      effectiveDimensions
    );

    if (linearSumFactor > 0) {
      return linearSumFactor;
    }

    return getAverageLinearFactor(baseProductDimensions, effectiveDimensions);
  }, [selectedProductionProduct, productionForm.dimensionMode, baseProductDimensions, effectiveDimensions]);

  const rawMaterialCalculationPreview = useMemo(() => {
    if (!selectedProductionProduct) return [];

    const quantity = toNumber(productionForm.quantity);
    const mappedMaterials = selectedProductionProduct?.rawMaterials || [];
    const rawMaterialPriceById: Map<string, number> = new Map(
      rawMaterials.map((item: IRawMaterial) => [
        String(item._id || item.id || ""),
        Number(item.unitPrice || 0),
      ])
    );
    const rawMaterialPriceByName: Map<string, number> = new Map(
      rawMaterials.map((item: IRawMaterial) => [
        String(item.name || "").trim().toLowerCase(),
        Number(item.unitPrice || 0),
      ])
    );

    return mappedMaterials.map((material: NonNullable<IBagProduct["rawMaterials"]>[number], index: number) => {
      const usageType = material?.usageType || "fixed";
      const perBagQty = toNumber(material?.requiredQuantityPerBag || 0);

      let perBagRequired = perBagQty;

      if (usageType === "dimension_based") {
        perBagRequired = perBagQty * (dimensionScaleFactor || 1);
      }

      const baseTotal = perBagRequired * quantity;
      // Exclude wastage from quotation/stock costing.
      const totalRequired = baseTotal;
      const materialIdKey = String(material?.rawMaterialId || "");
      const materialNameKey = String(material?.rawMaterialName || "").trim().toLowerCase();
      const unitPrice = Number(
        rawMaterialPriceById.get(materialIdKey) ??
          rawMaterialPriceByName.get(materialNameKey) ??
          0
      );
      const estimatedMaterialCost = totalRequired * unitPrice;

      return {
        id: material?.rawMaterialId || `${index}`,
        rawMaterialName: material?.rawMaterialName || "Raw Material",
        rawMaterialType: material?.rawMaterialType || "other",
        usageType,
        unit: material?.unit || "pcs",
        perBagQty: roundTo(perBagQty),
        adjustedPerBagQty: roundTo(perBagRequired),
        wastagePercent: 0,
        totalRequired: roundTo(totalRequired),
        unitPrice: roundTo(unitPrice, 2),
        estimatedMaterialCost: roundTo(estimatedMaterialCost, 2),
      };
    });
  }, [selectedProductionProduct, productionForm.quantity, dimensionScaleFactor, rawMaterials]);

  const manualBaseUnitPricePreview = useMemo(
    () => toNumber(productionForm.unitPrice || 0),
    [productionForm.unitPrice]
  );

  const dimensionModeledManualUnitPricePreview = useMemo(() => {
    if (!manualBaseUnitPricePreview) return 0;
    const scale = productionForm.dimensionMode === "custom" ? dimensionScaleFactor || 1 : 1;
    return roundTo(manualBaseUnitPricePreview * scale, 2);
  }, [manualBaseUnitPricePreview, productionForm.dimensionMode, dimensionScaleFactor]);

  const autoComputedUnitPricePreview = useMemo(() => {
    const quantity = toNumber(productionForm.quantity);
    if (!quantity) return 0;

    const totalRawMaterialCost = rawMaterialCalculationPreview.reduce(
      (sum: number, item: any) => sum + Number(item.estimatedMaterialCost || 0),
      0
    );

    return roundTo(totalRawMaterialCost / quantity, 2);
  }, [productionForm.quantity, rawMaterialCalculationPreview]);

  const effectiveUnitPricePreview =
    dimensionModeledManualUnitPricePreview > 0
      ? dimensionModeledManualUnitPricePreview
      : autoComputedUnitPricePreview;

  const manualTotalStockValuePreview = useMemo(
    () => roundTo(toNumber(productionForm.quantity) * effectiveUnitPricePreview, 2),
    [productionForm.quantity, effectiveUnitPricePreview]
  );

  useEffect(() => {
    const materialColorOptions = rawMaterials
      .map((item: IRawMaterial) => String(item.color || "").trim())
      .filter((color: string) => color.length > 0);

    setBagColorOptions((prev: string[]) => {
      const merged = [...DEFAULT_BAG_COLORS, ...materialColorOptions, ...prev];
      return Array.from(new Set(merged.map((i) => i.trim()).filter(Boolean)));
    });

    const productSizeOptions = products
      .map((product: IBagProduct) => {
        const d = product.dimensions;
        if (!d) return "";
        return `${toNumber(d.length)} x ${toNumber(d.width)} x ${toNumber(d.height)} ${d.unit || "inch"}`;
      })
      .filter((size: string) => size.length > 0);

    setBagSizeOptions((prev: string[]) => {
      const merged = [...DEFAULT_BAG_SIZES, ...productSizeOptions, ...prev];
      return Array.from(new Set(merged.map((i) => i.trim()).filter(Boolean)));
    });
  }, [rawMaterials, products]);

  useEffect(() => {
    if (!selectedProductionProduct || productionForm.bagSizeLabel) return;
    const d = selectedProductionProduct.dimensions;
    if (!d) return;
    const derivedSize = `${toNumber(d.length)} x ${toNumber(d.width)} x ${toNumber(d.height)} ${d.unit || "inch"}`;
    handleProductionField("bagSizeLabel", derivedSize);
    setBagSizeOptions((prev: string[]) => {
      if (prev.includes(derivedSize)) return prev;
      return [...prev, derivedSize];
    });
  }, [selectedProductionProduct, productionForm.bagSizeLabel]);

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

  const openEditModal = (item: IRawMaterial) => {
    setEditingItem(item);
    setFormData(getFormFromItem(item));
    setShowFormModal(true);
  };

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setFormData((prev: Omit<IRawMaterial, "stockHistory" | "availableForSale">) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    values: Omit<IRawMaterial, "stockHistory" | "availableForSale">
  ) => {
    const payload = {
      name: String(values?.name || "").trim(),
      code: String(values?.code || "").trim(),
      color: String(values?.color || "").trim(),
      type: values?.type || "Paper",
      unit: values?.unit || "kg",
      unitPrice: Number(values?.unitPrice || 0),
      availableStock: Number(values?.availableStock || 0),
      reorderPoint: Number(values?.reorderPoint || 0),
      minStock: Number(values?.minStock || 0),
      description: String(values?.description || "").trim(),
      isActive: values?.isActive ?? true,
    };

    const loadingToast = toast.loading(
      editingItem ? "Updating raw material..." : "Creating raw material..."
    );
    setRawMaterialSubmitting(true);

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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save raw material",
        { id: loadingToast }
      );
    } finally {
      setRawMaterialSubmitting(false);
    }
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id) return;
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete raw material",
        { id: loadingToast }
      );
    }
  };

  const openAddStockModal = (item: IRawMaterial) => {
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to add stock",
        { id: loadingToast }
      );
    }
  };

  const handleProductionField = <K extends keyof IProductionForm>(field: K, value: IProductionForm[K]) => {
    setProductionForm((prev: IProductionForm) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomDimensionField = <K extends keyof IProductionForm["customDimensions"]>(
    field: K,
    value: IProductionForm["customDimensions"][K]
  ) => {
    setProductionForm((prev: IProductionForm) => ({
      ...prev,
      customDimensions: {
        ...prev.customDimensions,
        [field]: value,
      },
    }));
  };

  const handleCreateProductionStock = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      productId: productionForm.productId,
      quantity: Number(productionForm.quantity || 0),
      category: productionForm.category,
      bagColor: (productionForm.bagColor || "").trim(),
      bagSizeLabel: (productionForm.bagSizeLabel || "").trim(),
      reorderPt: Number(productionForm.reorderPt || 10),
      note: productionForm.note,
      unitPrice: Number(effectiveUnitPricePreview || 0),
      customDimensions:
        productionForm.dimensionMode === "custom"
          ? {
              length: Number(productionForm.customDimensions.length || 0),
              width: Number(productionForm.customDimensions.width || 0),
              height: Number(productionForm.customDimensions.height || 0),
              unit: productionForm.customDimensions.unit || "inch",
            }
          : undefined,

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
    } catch (error: any) {
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
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 p-6 text-white shadow-xl ring-1 ring-emerald-900/10 md:p-7"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_58%)]" />
          <div className="absolute -left-16 top-10 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="absolute bottom-0 right-8 h-40 w-40 rounded-full bg-cyan-200/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-stretch xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-emerald-50 backdrop-blur-sm">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Inventory Control Panel</span>
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
                Raw Material Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                Manage raw materials, monitor alerts, create products, and generate
                dimension-wise inventory stock directly from mapped product raw materials.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Active materials",
                    value: `${activeMaterials}/${totalMaterials || 0}`,
                    helper: `${activeMaterialRate}% operational`,
                    Icon: CheckCircle2,
                  },
                  {
                    label: "Low stock alerts",
                    value: String(lowStockCount),
                    helper: lowStockCount === 0 ? "Everything looks stable" : "Needs replenishment",
                    Icon: AlertTriangle,
                  },
                  {
                    label: "Mapped products",
                    value: String(differentBagTypes),
                    helper: "Ready for stock creation",
                    Icon: ShoppingBag,
                  },
                  {
                    label: "Material value",
                    value: formattedRawMaterialValue,
                    helper: "Live stock worth",
                    Icon: Calculator,
                  },
                ].map(({ label, value, helper, Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                      </div>
                      <div className="rounded-2xl bg-white/12 p-3 text-white shadow-inner shadow-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-emerald-50/80">{helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:w-[430px]">
              <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Quick Actions
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Keep stock and product flow moving
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                      Jump directly into product setup, production stock, or new raw
                      material entry from one place.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-3 text-white shadow-inner shadow-white/10">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate("/Product")}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-lg"
                  >
                    <ShoppingBag size={18} />
                    <span>Create Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProductionModal(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-emerald-950/35 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-950/50 hover:shadow-lg"
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

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Available to Use
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {availableToUseUnits.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-emerald-50/75">
                      Immediately usable for mapped production.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      <Layers3 className="h-3.5 w-3.5" />
                      Manufacturing Hold
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {manufacturingHoldUnits.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-emerald-50/75">
                      Reserved stock already committed to operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Total Materials
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{totalMaterials}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Boxes className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Complete count of raw material records managed in inventory.
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Active Materials
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{activeMaterials}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Operational coverage</span>
                  <span>{activeMaterialRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-blue-50">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${activeMaterialRate}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Total Stock Units
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {Number(totalStockUnits).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <Layers3 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between rounded-2xl bg-violet-50/70 px-3 py-2">
                  <span className="font-medium text-gray-500">Manufacturing hold</span>
                  <span className="font-semibold text-gray-900">
                    {manufacturingHoldUnits.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 px-3 py-2">
                  <span className="font-medium text-gray-500">Available to use</span>
                  <span className="font-semibold text-gray-900">
                    {availableToUseUnits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-red-100 bg-gradient-to-br from-red-50 via-white to-red-50/80 shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
                    Low Stock Alerts
                  </p>
                  <p className="mt-3 text-3xl font-bold text-red-600">{lowStockCount}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-red-600 shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-red-600">{lowStockSummary}</p>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-lime-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Total Raw Material Value
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {formattedRawMaterialValue}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Calculator className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Total live stock value based on available units and unit price.
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Bag Types / Products
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{differentBagTypes}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Product entries already mapped for production stock generation.
              </p>
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
              {products.map((product: IBagProduct) => (
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
                  {lowStockAlerts.slice(0, 4).map((item: IRawMaterial) => (
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
            label="Search Materials"
            placeholder="Search by material name, code, type, or color..."
            icon={Search}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-600" />
                  Raw Materials Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1">
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
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Material Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Type & Unit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Stock Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Pricing
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item: IRawMaterial) => {
                      const status = getStockStatus(
                        item.availableStock,
                        item.reorderPoint
                      );
                      const totalValue = Number(item.availableStock || 0) * Number(item.unitPrice || 0);
                      const stockPercentage = item.reorderPoint > 0 
                        ? Math.min((item.availableStock / item.reorderPoint) * 100, 100) 
                        : 100;

                      return (
                        <tr
                          key={item._id || item.id}
                          className="bg-white hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-200 group"
                        >
                          {/* Material Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                {item.type === 'Paper' ? <Layers3 className="w-6 h-6 text-emerald-600" /> : 
                                 item.type === 'Handle' ? <ArrowUpRight className="w-6 h-6 text-blue-600" /> : 
                                 item.type === 'Printing' ? <ClipboardList className="w-6 h-6 text-purple-600" /> : 
                                 item.type === 'Adhesive' ? <ArrowDownRight className="w-6 h-6 text-amber-600" /> : 
                                 item.type === 'Accessory' ? <Package className="w-6 h-6 text-pink-600" /> : 
                                 <FileBox className="w-6 h-6 text-gray-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
                                  {item.name}
                                </p>
                                <p className="text-xs font-mono font-semibold text-gray-600 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                  {item.code}
                                </p>
                                {item.color && (
                                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                    <Palette className="h-3 w-3" />
                                    {item.color}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Type & Unit */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.type}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="font-medium">{item.unit}</span>
                              </div>
                            </div>
                          </td>

                          {/* Stock Information */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Available:</span>
                                <span className="font-bold text-emerald-600">
                                  {Number(item.availableForSale || 0).toLocaleString()} {item.unit}
                                </span>
                              </div>
                              {item.reservedStock > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Reserved:</span>
                                  <span className="font-semibold text-blue-600">
                                    {Number(item.reservedStock || 0).toLocaleString()} {item.unit}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-gray-900">
                                  {Number(item.availableStock || 0).toLocaleString()} {item.unit}
                                </span>
                              </div>
                              {/* Stock Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      stockPercentage > 100 ? 'bg-emerald-500' :
                                      stockPercentage > 50 ? 'bg-blue-500' :
                                      stockPercentage > 25 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                  Reorder at: {Number(item.reorderPoint || 0).toLocaleString()} {item.unit}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Pricing */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">Unit:</span>
                                <span className="font-semibold ml-1">
                                  ₹{Number(item.unitPrice || 0).toFixed(2)}/{item.unit}
                                </span>
                              </div>
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 font-medium">Total Value</p>
                                <p className="text-base font-bold text-emerald-700">
                                  ₹{totalValue.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <Badge
                                variant={statusVariantMap[status] || "primary"}
                                className="text-xs font-semibold flex items-center gap-1"
                              >
                                {status === 'critical' ? <><TrendingDown className="w-3 h-3" /> Critical</> :
                                 status === 'low' ? <><Minus className="w-3 h-3" /> Low</> :
                                 status === 'medium' ? <><Activity className="w-3 h-3" /> Medium</> : 
                                 <><TrendingUp className="w-3 h-3" /> Healthy</>}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {item.isActive ? (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailPanel(true);
                                }}
                                className="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200" 
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openAddStockModal(item)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
                                title="Add Stock"
                              >
                                <CirclePlus className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item._id || item.id)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
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
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Boxes className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">No raw materials found</p>
                            <p className="text-sm text-gray-500 mt-1">Create your first raw material to get started</p>
                          </div>
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
          size="xl"
        >
          <form onSubmit={handleCreateProductionStock} className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white shadow-lg">
              <div className="grid gap-5 p-5 md:grid-cols-[1.5fr_1fr] md:p-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50">
                    <Factory className="h-3.5 w-3.5" />
                    Production Stock Workspace
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">Create stock with better clarity</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/85">
                    Choose a product, define quantity and bag details, then review dimensions,
                    price, and material usage before creating stock.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Bags
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {toNumber(productionForm.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Mapped materials
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {selectedProductMaterialCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Dimensions
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {selectedProductionProduct ? selectedProductDimensionSummary : "Select product first"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product
              </label>
              <select
                value={productionForm.productId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProductionField("productId", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select product</option>
                {products.map((product: IBagProduct) => (
                  <option key={product._id || product.id} value={product._id || product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductionProduct && (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShoppingBag className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Selected Product
                    </p>
                  </div>
                  <p className="mt-2 text-base font-bold text-gray-900">
                    {selectedProductionProduct.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    SKU: {selectedProductionProduct.sku}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FileBox className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Bag Type
                    </p>
                  </div>
                  <p className="mt-2 text-base font-bold text-gray-900">
                    {selectedProductionProduct.bagType || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {selectedProductMaterialCount} mapped raw materials
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <div className="flex items-center gap-2 text-violet-700">
                    <Ruler className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Default Dimensions
                    </p>
                  </div>
                  <p className="mt-2 text-base font-bold text-gray-900">
                    {toNumber(baseProductDimensions.length)} × {toNumber(baseProductDimensions.width)} ×{" "}
                    {toNumber(baseProductDimensions.height)} {baseProductDimensions.unit || "inch"}
                  </p>
                </div>
              </div>
            )}

            {selectedProductionProduct && (
              <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
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

            <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
              <div>
                <Input
                  label="Number of Bags"
                  icon={Package}
                  type="number"
                  min="1"
                  value={productionForm.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProductionField("quantity", e.target.value)}
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Inventory Category
                </label>
                <select
                  value={productionForm.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value as IProductionForm["category"];
                    handleProductionField("category", val);
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {INVENTORY_CATEGORY_OPTIONS.map((item: string) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Bag Color</label>
                <div className="flex gap-2">
                  <select
                    value={productionForm.bagColor}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleProductionField("bagColor", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="">Select color</option>
                    {bagColorOptions.map((color: string) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    label=""
                    className=""
                    error={undefined}
                    icon={undefined}
                    value={customBagColor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomBagColor(e.target.value)}
                    placeholder="Add new color"
                  />
                  <Button
                    type="button"
                    className="whitespace-nowrap bg-emerald-700"
                    onClick={() => {
                      const value = customBagColor.trim();
                      if (!value) return;
                      setBagColorOptions((prev: string[]) =>
                        prev.includes(value) ? prev : [...prev, value]
                      );
                      handleProductionField("bagColor", value);
                      setCustomBagColor("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Bag Size Label</label>
                <select
                  value={productionForm.bagSizeLabel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleProductionField("bagSizeLabel", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Select size</option>
                  {bagSizeOptions.map((size: string) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <Input
                    label=""
                    className=""
                    error={undefined}
                    icon={undefined}
                    value={customBagSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomBagSize(e.target.value)}
                    placeholder='Add new size (e.g. 10x14 inch)'
                  />
                  <Button
                    type="button"
                    className="whitespace-nowrap bg-emerald-700"
                    onClick={() => {
                      const value = customBagSize.trim();
                      if (!value) return;
                      setBagSizeOptions((prev: string[]) =>
                        prev.includes(value) ? prev : [...prev, value]
                      );
                      handleProductionField("bagSizeLabel", value);
                      setCustomBagSize("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Input
                  label="Reorder Point"
                  icon={AlertTriangle}
                  type="number"
                  min="0"
                  value={productionForm.reorderPt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProductionField("reorderPt", e.target.value)}
                  placeholder="10"
                />
              </div>

              <div>
                <Input
                  label="Unit Price (Per Bag)"
                  icon={Calculator}
                  type="number"
                  min="0"
                  value={productionForm.unitPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProductionField("unitPrice", e.target.value)}
                  placeholder="Enter selling/production unit price"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Bag Price Summary
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Quantity
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {toNumber(productionForm.quantity).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Effective Unit Price
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rs. {effectiveUnitPricePreview.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-100/70 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Total Stock Value
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">
                    Rs. {manualTotalStockValuePreview.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {manualBaseUnitPricePreview > 0 && productionForm.dimensionMode === "custom" && (
                <p className="mt-2 text-xs text-gray-600">
                  Base manual price {manualBaseUnitPricePreview.toLocaleString()} × scale factor{" "}
                  {roundTo(dimensionScaleFactor, 4)} = {effectiveUnitPricePreview.toLocaleString()}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                For custom dimensions, manual unit price is auto-scaled by dimension factor. If manual price is empty, raw material consumption cost per bag is used.
              </p>
            </div>

            {selectedProductionProduct && (
              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const val = e.target.value as IProductionForm["dimensionMode"];
                        handleProductionField("dimensionMode", val);
                      }}
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
                        <Input
                          label="Length"
                          className=""
                          error={undefined}
                          icon={undefined}
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.length}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomDimensionField("length", e.target.value)}
                          placeholder="14"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Width
                        </label>
                        <Input
                          label="Width"
                          className=""
                          error={undefined}
                          icon={undefined}
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.width}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomDimensionField("width", e.target.value)}
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Height
                        </label>
                        <Input
                          label="Height"
                          className=""
                          error={undefined}
                          icon={undefined}
                          type="number"
                          min="0"
                          value={productionForm.customDimensions.height}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomDimensionField("height", e.target.value)}
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Unit
                        </label>
                        <select
                          value={productionForm.customDimensions.unit}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCustomDimensionField("unit", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        >
                          {DIMENSION_UNITS.map((unit: string) => (
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
              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Raw Material Requirement Preview
                  </h3>
                </div>

                {rawMaterialCalculationPreview.length > 0 ? (
                  <div className="space-y-3">
                    {rawMaterialCalculationPreview.map((item: {
                      id: string;
                      rawMaterialName: string;
                      rawMaterialType: string;
                      usageType: string;
                      unit: string;
                      perBagQty: number;
                      adjustedPerBagQty: number;
                      wastagePercent: number;
                      totalRequired: number;
                      unitPrice: number;
                      estimatedMaterialCost: number;
                    }) => (
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
                            <p className="mt-1 text-xs text-emerald-700">
                              Unit Price: {item.unitPrice.toLocaleString()} · Cost: {item.estimatedMaterialCost.toLocaleString()}
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

            <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
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

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => {
                  setShowProductionModal(false);
                  setProductionForm(initialProductionForm);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-green-700" size="md" variant="primary">
                Create Stock
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showFormModal}
          title={editingItem ? "Edit Raw Material" : "Create Raw Material"}
          onClose={resetForm}
          size="xl"
        >
          <RawMaterialForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            loading={rawMaterialSubmitting}
          />
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
          size="lg"
        >
          {selectedStockItem && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white shadow-lg">
                <div className="grid gap-5 p-5 md:grid-cols-[1.35fr_1fr] md:p-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50">
                      <CirclePlus className="h-3.5 w-3.5" />
                      Stock Update
                    </div>
                    <h3 className="mt-4 text-2xl font-bold">{selectedStockItem.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/85">
                      Add fresh stock for this raw material and review the new balance before
                      saving the update.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                        Current Stock
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {Number(selectedStockItem.availableStock || 0).toLocaleString()} {selectedStockItem.unit}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                        Material Code
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {selectedStockItem.code}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                        Unit Price
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">
                        Rs. {Number(selectedStockItem.unitPrice || 0).toLocaleString("en-IN")} / {selectedStockItem.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
                <Input
                  label="Add Stock Quantity"
                  icon={Package}
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStockToAdd(e.target.value)}
                  placeholder={`Enter quantity in ${selectedStockItem.unit}`}
                />
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Current Stock
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {Number(selectedStockItem.availableStock || 0).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{selectedStockItem.unit}</p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Adding Now
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stockToAddValue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{selectedStockItem.unit}</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    New Stock Level
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">
                    {projectedStockLevel.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedStockItem.unit} | Value Rs. {projectedStockValue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedStockItem(null);
                    setStockToAdd("");
                    setStockNote("");
                  }}
                >
                  Cancel
                </Button>

                <Button className="rounded-xl bg-green-900" onClick={handleAddStock}>
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
              className="relative h-screen w-full max-w-4xl overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 800 }}
              animate={{ x: 0 }}
              exit={{ x: 800 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Raw Material Details
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      openEditModal(selectedItem);
                      setShowDetailPanel(false);
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <RawMaterialDetail
                  material={selectedItem}
                  onClose={() => setShowDetailPanel(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
export default RawMaterial;
