import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui";
import { useGetAllRawMaterials } from "../../../../hook/RawMaterial";

const PRODUCT_CATEGORY_OPTIONS = [
  "Shopping Bag",
  "Food Bag",
  "Gift Bag",
  "Grocery Bag",
  "Retail Bag",
  "Pharmacy Bag",
  "Bakery Bag",
  "Custom Bag",
];

const BAG_TYPE_OPTIONS = ["flat", "gusset", "handle", "box", "custom"];
const DIMENSION_UNIT_OPTIONS = ["inch", "cm", "mm", "ft"];
const PRICING_MODE_OPTIONS = ["calculated", "fixed"];
const USAGE_TYPE_OPTIONS = ["fixed", "dimension_based"];

const defaultMaterial = {
  rawMaterialId: "",
  rawMaterialName: "",
  rawMaterialType: "",
  usageType: "fixed",
  requiredQuantityPerBag: "",
  unit: "piece",
  wastagePercent: "",
  notes: "",
};

const getInitialState = (initialData = null) => {
  if (!initialData) {
    return {
      name: "",
      category: "Shopping Bag",
      sku: "",
      description: "",
      bagType: "custom",
      dimensions: {
        length: "",
        width: "",
        height: "",
        unit: "inch",
      },
      basePrice: "",
      estimationConfig: {
        pricingMode: "calculated",
        basePrice: "",
        laborCostPerBag: "",
        overheadCostPerBag: "",
        printingCostPerBag: "",
        marginPercent: "",
      },
      rawMaterials: [{ ...defaultMaterial }],
      isActive: true,
    };
  }

  return {
    name: initialData?.name || "",
    category: initialData?.category || "Shopping Bag",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    bagType: initialData?.bagType || "custom",
    dimensions: {
      length: initialData?.dimensions?.length ?? "",
      width: initialData?.dimensions?.width ?? "",
      height: initialData?.dimensions?.height ?? "",
      unit: initialData?.dimensions?.unit || "inch",
    },
    basePrice: initialData?.basePrice ?? "",
    estimationConfig: {
      pricingMode: initialData?.estimationConfig?.pricingMode || "calculated",
      basePrice: initialData?.estimationConfig?.basePrice ?? "",
      laborCostPerBag: initialData?.estimationConfig?.laborCostPerBag ?? "",
      overheadCostPerBag: initialData?.estimationConfig?.overheadCostPerBag ?? "",
      printingCostPerBag: initialData?.estimationConfig?.printingCostPerBag ?? "",
      marginPercent: initialData?.estimationConfig?.marginPercent ?? "",
    },
    rawMaterials:
      initialData?.rawMaterials?.length > 0
        ? initialData.rawMaterials.map((item) => ({
            rawMaterialId: item.rawMaterialId || "",
            rawMaterialName: item.rawMaterialName || "",
            rawMaterialType: item.rawMaterialType || "",
            usageType: item.usageType || "fixed",
            requiredQuantityPerBag: item.requiredQuantityPerBag ?? "",
            unit: item.unit || "piece",
            wastagePercent: item.wastagePercent ?? "",
            notes: item.notes || "",
          }))
        : [{ ...defaultMaterial }],
    isActive: initialData?.isActive ?? true,
  };
};

const ProductForm = ({ initialData = null, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(getInitialState(initialData));

  const { data: rawMaterialResponse, isLoading } = useGetAllRawMaterials();

  const rawMaterialOptions = Array.isArray(rawMaterialResponse)
    ? rawMaterialResponse
    : rawMaterialResponse?.rawMaterials || rawMaterialResponse?.items || [];

  const isEmptyRawMaterial = !isLoading && rawMaterialOptions.length === 0;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateDimension = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  const updateEstimationField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      estimationConfig: {
        ...prev.estimationConfig,
        [field]: value,
      },
    }));
  };

  const updateMaterial = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.rawMaterials];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return {
        ...prev,
        rawMaterials: updated,
      };
    });
  };

  const handleRawMaterialSelect = (index, rawMaterialId) => {
    const selected = rawMaterialOptions.find(
      (item) => String(item._id || item.id) === String(rawMaterialId)
    );

    setFormData((prev) => {
      const updated = [...prev.rawMaterials];

      updated[index] = {
        ...updated[index],
        rawMaterialId: rawMaterialId,
        rawMaterialName:
          selected?.name ||
          selected?.rawMaterialName ||
          selected?.productName ||
          "",
        rawMaterialType:
          selected?.type ||
          selected?.rawMaterialType ||
          selected?.category ||
          "other",
        unit: selected?.unit || "piece",
      };

      return {
        ...prev,
        rawMaterials: updated,
      };
    });
  };

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { ...defaultMaterial }],
    }));
  };

  const removeMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      rawMaterials:
        prev.rawMaterials.length === 1
          ? [{ ...defaultMaterial }]
          : prev.rawMaterials.filter((_, i) => i !== index),
    }));
  };

  const materialCount = useMemo(
    () => formData.rawMaterials.length,
    [formData.rawMaterials.length]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim(),
      bagType: formData.bagType,
      dimensions: {
        length: Number(formData.dimensions.length),
        width: Number(formData.dimensions.width),
        height: Number(formData.dimensions.height),
        unit: formData.dimensions.unit,
      },
      basePrice: Number(formData.basePrice || 0),
      estimationConfig: {
        pricingMode: formData.estimationConfig.pricingMode,
        basePrice: Number(formData.estimationConfig.basePrice || 0),
        laborCostPerBag: Number(formData.estimationConfig.laborCostPerBag || 0),
        overheadCostPerBag: Number(formData.estimationConfig.overheadCostPerBag || 0),
        printingCostPerBag: Number(formData.estimationConfig.printingCostPerBag || 0),
        marginPercent: Number(formData.estimationConfig.marginPercent || 0),
      },
      rawMaterials: formData.rawMaterials.map((item) => ({
        rawMaterialId: item.rawMaterialId || null,
        rawMaterialName: item.rawMaterialName.trim(),
        rawMaterialType: item.rawMaterialType.trim(),
        usageType: item.usageType,
        requiredQuantityPerBag: Number(item.requiredQuantityPerBag || 0),
        unit: item.unit,
        wastagePercent: Number(item.wastagePercent || 0),
        notes: item.notes?.trim() || "",
      })),
      isActive: formData.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-100 p-4">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Basic Product Details</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Name
            </label>
            <input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Medium Kraft Shopping Bag"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            >
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              SKU
            </label>
            <input
              value={formData.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              placeholder="KRAFT-MED-001"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Bag Type
            </label>
            <select
              value={formData.bagType}
              onChange={(e) => updateField("bagType", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {BAG_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Strong kraft bag with custom handle and premium finish"
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-4">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Bag Dimensions</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Length</label>
            <input
              type="number"
              min="0"
              value={formData.dimensions.length}
              onChange={(e) => updateDimension("length", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Width</label>
            <input
              type="number"
              min="0"
              value={formData.dimensions.width}
              onChange={(e) => updateDimension("width", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Height</label>
            <input
              type="number"
              min="0"
              value={formData.dimensions.height}
              onChange={(e) => updateDimension("height", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Unit</label>
            <select
              value={formData.dimensions.unit}
              onChange={(e) => updateDimension("unit", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {DIMENSION_UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-4">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Pricing & Estimation</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Base Price</label>
            <input
              type="number"
              min="0"
              value={formData.basePrice}
              onChange={(e) => updateField("basePrice", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Pricing Mode
            </label>
            <select
              value={formData.estimationConfig.pricingMode}
              onChange={(e) => updateEstimationField("pricingMode", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {PRICING_MODE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Estimation Base Price
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimationConfig.basePrice}
              onChange={(e) => updateEstimationField("basePrice", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Labor Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimationConfig.laborCostPerBag}
              onChange={(e) => updateEstimationField("laborCostPerBag", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Overhead Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimationConfig.overheadCostPerBag}
              onChange={(e) =>
                updateEstimationField("overheadCostPerBag", e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Printing Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimationConfig.printingCostPerBag}
              onChange={(e) =>
                updateEstimationField("printingCostPerBag", e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Margin %
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimationConfig.marginPercent}
              onChange={(e) => updateEstimationField("marginPercent", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
              />
              Active Product
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            Raw Material Requirements ({materialCount})
          </h3>

          <Button type="button" className="bg-green-900" onClick={addMaterial}>
            Add Raw Material
          </Button>
        </div>

        <div className="space-y-4">
          {formData.rawMaterials.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Raw Material #{index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Raw Material Name
                  </label>

                  {isEmptyRawMaterial ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-red-500">
                        No raw material available
                      </p>
                      <Button
                        type="button"
                        className="w-fit bg-green-900"
                        onClick={() => navigate("/rawmaterial")}
                      >
                        Create Raw Material
                      </Button>
                    </div>
                  ) : (
                    <select
                      value={item.rawMaterialId || ""}
                      onChange={(e) => handleRawMaterialSelect(index, e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      required
                    >
                      <option value="">
                        {isLoading ? "Loading..." : "Select raw material"}
                      </option>
                      {rawMaterialOptions.map((raw) => {
                        const optionValue = raw._id || raw.id;
                        const optionLabel =
                          raw.name ||
                          raw.rawMaterialName ||
                          raw.productName ||
                          "Raw Material";

                        return (
                          <option key={optionValue} value={optionValue}>
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Raw Material Type
                  </label>
                  <input
                    type="text"
                    value={item.rawMaterialType || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                    placeholder="Auto filled from selected raw material"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Usage Type
                  </label>
                  <select
                    value={item.usageType}
                    onChange={(e) => updateMaterial(index, "usageType", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {USAGE_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option === "dimension_based" ? "Dimension Based" : "Fixed"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Required Quantity / Bag
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.requiredQuantityPerBag}
                    onChange={(e) =>
                      updateMaterial(index, "requiredQuantityPerBag", e.target.value)
                    }
                    placeholder="2.4"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={item.unit || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                    placeholder="Auto filled from selected raw material"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Wastage %
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.wastagePercent}
                    onChange={(e) =>
                      updateMaterial(index, "wastagePercent", e.target.value)
                    }
                    placeholder="5"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={item.notes}
                    onChange={(e) => updateMaterial(index, "notes", e.target.value)}
                    placeholder="Main paper for outside surface"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-green-900">
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;