import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui";
import { useGetAllRawMaterials } from "../../../../hook/RawMaterial";
import { useAuthContext } from "../../../context/Adminauth";
import toast from "react-hot-toast";

const PRODUCT_CATEGORY_OPTIONS = [
  "Ecokraft bags",
  "F&B Gourmet Bags",
  "Luxury bags",
  "Kraft paper roll",
];

const BAG_TYPE_OPTIONS = ["flat", "gusset", "handle", "box", "v_bottom", "square_bottom", "custom", "none"];
const BAG_TYPE_LABELS = {
  flat: "Flat",
  gusset: "Gusset",
  handle: "Handle",
  box: "Box",
  custom: "Custom",
  v_bottom: "V Bottom",
  square_bottom: "Square Bottom",
  none: "None"
};
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
      category: "Ecokraft bags",
      sku: "",
      description: "",
      bagType: "custom",
      bagSize: "",
      bagColor: "",
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
      customPrinting: false,
      gsm: "",
      weight: "",
      lengthInMeters: "",
      hsnCode: "",
      gstRate: 5,
      hsn_source: "master",
      hsn_master_id: "",
      custom_hsn_code: "",
      custom_gst_rate: "",
    };
  }

  return {
    name: initialData?.name || "",
    category: initialData?.category || "Ecokraft bags",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    bagType: initialData?.bagType || "custom",
    bagSize: initialData?.bagSize || "",
    bagColor: initialData?.bagColor || initialData?.color || "",
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
    customPrinting: initialData?.customPrinting || false,
    gsm: initialData?.gsm || "",
    weight: initialData?.weight || "",
    lengthInMeters: initialData?.lengthInMeters || "",
    bf: initialData?.bf || "",
    hsnCode: initialData?.hsnCode || initialData?.custom_hsn_code || "",
    gstRate: initialData?.gstRate ?? initialData?.custom_gst_rate ?? 18,
    hsn_source: initialData?.hsn_source || (initialData?.custom_hsn_code ? "custom" : "master"),
    hsn_master_id: initialData?.hsn_master_id?._id || initialData?.hsn_master_id || "",
    custom_hsn_code: initialData?.custom_hsn_code || initialData?.hsnCode || "",
    custom_gst_rate: initialData?.custom_gst_rate ?? initialData?.gstRate ?? 18,
  };
};

const ProductForm = ({ initialData = null, onSubmit }) => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();
  const [formData, setFormData] = useState(getInitialState(initialData));
  const [sizePreset, setSizePreset] = useState("custom");
  const [hsnMasterList, setHsnMasterList] = useState([]);
  const [hsnSearchTerm, setHsnSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    axiosInstance.get("/hsn-master")
      .then((res) => {
        if (isMounted && res.data?.data && Array.isArray(res.data.data)) {
          setHsnMasterList(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load HSN Master options:", err));
    return () => { isMounted = false; };
  }, [axiosInstance]);

  // Auto-assign default HSN Master selection for new product or if unassigned
  useEffect(() => {
    if (!initialData && hsnMasterList.length > 0 && formData.hsn_source !== "custom" && !formData.hsn_master_id) {
      const isRoll = String(formData.category || "").toLowerCase().includes("roll");
      const defaultCode = isRoll ? "4804" : "4819";
      const match = hsnMasterList.find(h => String(h.hsn_code) === defaultCode) || hsnMasterList[0];
      if (match) {
        setFormData(prev => ({
          ...prev,
          hsn_source: "master",
          hsn_master_id: match._id || match.id,
          hsnCode: match.hsn_code,
          gstRate: match.gst_rate,
        }));
      }
    }
  }, [initialData, hsnMasterList, formData.category, formData.hsn_source, formData.hsn_master_id]);

  const getWidthInCm = (width, unit) => {
    const w = Number(width) || 0;
    if (unit === "cm") return w;
    if (unit === "inch") return w * 2.54;
    if (unit === "mm") return w / 10;
    if (unit === "ft") return w * 30.48;
    return w;
  };



  const isRoll = useMemo(() => {
    return String(formData.category || "").toLowerCase().includes("roll");
  }, [formData.category]);

  React.useEffect(() => {
    if (initialData && !isRoll) {
      const len = Number(initialData.dimensions?.length);
      const wid = Number(initialData.dimensions?.width);
      const hei = Number(initialData.dimensions?.height);
      const unit = initialData.dimensions?.unit || "inch";
      if (unit === "inch") {
        if (len === 8 && wid === 10 && hei === 4) {
          setSizePreset("small");
        } else if (len === 10 && wid === 12 && hei === 5) {
          setSizePreset("medium");
        } else if (len === 12 && wid === 16 && hei === 6) {
          setSizePreset("large");
        } else {
          setSizePreset("custom");
        }
      } else {
        setSizePreset("custom");
      }
    }
  }, [initialData, isRoll]);

  const handlePresetChange = (preset) => {
    setSizePreset(preset);
    if (preset === "small") {
      setFormData(prev => ({
        ...prev,
        bagSize: "Small",
        dimensions: { length: 8, width: 10, height: 4, unit: "inch" }
      }));
    } else if (preset === "medium") {
      setFormData(prev => ({
        ...prev,
        bagSize: "Medium",
        dimensions: { length: 10, width: 12, height: 5, unit: "inch" }
      }));
    } else if (preset === "large") {
      setFormData(prev => ({
        ...prev,
        bagSize: "Large",
        dimensions: { length: 12, width: 16, height: 6, unit: "inch" }
      }));
    }
  };

  const { data: rawMaterialResponse, isLoading } = useGetAllRawMaterials();

  const rawMaterialOptions = Array.isArray(rawMaterialResponse)
    ? rawMaterialResponse
    : rawMaterialResponse?.rawMaterials || rawMaterialResponse?.items || [];

  const isEmptyRawMaterial = !isLoading && rawMaterialOptions.length === 0;

  const updateField = (field, value) => {
    const numericFields = ["basePrice", "gsm", "weight", "lengthInMeters", "bf"];
    if (numericFields.includes(field)) {
      if (value !== "" && Number(value) < 0) {
        value = "0";
      }
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateDimension = (field, value) => {
    const numericFields = ["length", "width", "height"];
    if (numericFields.includes(field)) {
      if (value !== "" && Number(value) < 0) {
        value = "0";
      }
    }
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  const updateEstimationField = (field, value) => {
    const numericFields = ["basePrice", "laborCostPerBag", "overheadCostPerBag", "printingCostPerBag", "marginPercent"];
    if (numericFields.includes(field)) {
      if (value !== "" && Number(value) < 0) {
        value = "0";
      }
    }
    setFormData((prev) => ({
      ...prev,
      estimationConfig: {
        ...prev.estimationConfig,
        [field]: value,
      },
    }));
  };

  const updateMaterial = (index, field, value) => {
    const numericFields = ["requiredQuantityPerBag", "wastagePercent"];
    if (numericFields.includes(field)) {
      if (value !== "" && Number(value) < 0) {
        value = "0";
      }
    }
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
          ? (isRoll ? [] : [{ ...defaultMaterial }])
          : prev.rawMaterials.filter((_, i) => i !== index),
    }));
  };

  const materialCount = useMemo(
    () => formData.rawMaterials.length,
    [formData.rawMaterials.length]
  );

  // Live Selling Price Breakdown
  const sellingPriceBreakdown = useMemo(() => {
    const basePrice = Number(formData.basePrice || 0);
    const estBasePrice = Number(formData.estimationConfig.basePrice || 0);
    const labor = Number(formData.estimationConfig.laborCostPerBag || 0);
    const overhead = Number(formData.estimationConfig.overheadCostPerBag || 0);
    const printing = Number(formData.estimationConfig.printingCostPerBag || 0);
    const margin = Number(formData.estimationConfig.marginPercent || 10);

    // Scenario A: Based on Base Price
    const totalCostA = basePrice + labor + overhead + printing;
    const sellingMarkupA = totalCostA * (1 + margin / 100);
    const sellingMarginA = totalCostA / (1 - margin / 100);

    // Scenario B: Based on Estimation Base Price
    const totalCostB = estBasePrice + labor + overhead + printing;
    const sellingMarkupB = totalCostB * (1 + margin / 100);
    const sellingMarginB = totalCostB / (1 - margin / 100);

    const hasData = basePrice > 0 || estBasePrice > 0 || labor > 0 || overhead > 0 || printing > 0;

    return {
      hasData,
      basePrice, estBasePrice, labor, overhead, printing, margin,
      totalCostA, sellingMarkupA, sellingMarginA,
      totalCostB, sellingMarkupB, sellingMarginB,
    };
  }, [
    formData.basePrice,
    formData.estimationConfig.basePrice,
    formData.estimationConfig.laborCostPerBag,
    formData.estimationConfig.overheadCostPerBag,
    formData.estimationConfig.printingCostPerBag,
    formData.estimationConfig.marginPercent,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.gsm || Number(formData.gsm) <= 0) {
      toast.error("GSM is required and must be greater than 0");
      return;
    }

    // Validate specification alignment between Product specs and selected BOM Raw Materials
    for (const item of formData.rawMaterials) {
      if (!item.rawMaterialId) continue;
      const selectedRaw = rawMaterialOptions.find(
        (raw) => String(raw._id || raw.id) === String(item.rawMaterialId)
      );

      const isPaperType = selectedRaw && (
        selectedRaw.type === "Paper" ||
        String(selectedRaw.type || "").toLowerCase().includes("paper") ||
        String(selectedRaw.category || "").toLowerCase().includes("paper") ||
        String(selectedRaw.category || "").toLowerCase().includes("roll")
      );

      if (isPaperType) {
        const rawName = selectedRaw.name || selectedRaw.rawMaterialName || "selected raw material";
        const productGsm = Number(formData.gsm || 0);
        const rawGsm = Number(selectedRaw.gsm || 0);

        // 1. GSM Validation
        if (rawGsm > 0 && productGsm > 0 && productGsm !== rawGsm) {
          toast.error(`GSM Mismatch: Product GSM is ${productGsm} GSM, but raw material "${rawName}" is ${rawGsm} GSM.`);
          return;
        }

        // 2. BF (Burst Factor) Validation
        const productBf = Number(formData.bf || 0);
        const rawBf = Number(selectedRaw.bf || 0);
        if (rawBf > 0 && productBf > 0 && productBf !== rawBf) {
          toast.error(`BF Mismatch: Product BF is ${productBf} BF, but raw material "${rawName}" is ${rawBf} BF.`);
          return;
        }

        // 3. Roll Width Validation for Kraft Rolls
        if (isRoll) {
          const productWidth = Number(formData.dimensions?.width || 0);
          const productUnit = formData.dimensions?.unit || "inch";
          const rawWidth = Number(selectedRaw.rollWidth || selectedRaw.width || selectedRaw.dimensions?.width || 0);
          const rawUnit = selectedRaw.rollWidthUnit || selectedRaw.dimensions?.unit || "inch";

          if (rawWidth > 0 && productWidth > 0) {
            const prodWidthCm = getWidthInCm(productWidth, productUnit);
            const rawWidthCm = getWidthInCm(rawWidth, rawUnit);

            if (Math.abs(prodWidthCm - rawWidthCm) > 0.1) {
              toast.error(`Width Mismatch: Product Width is ${productWidth} ${productUnit}, but raw material "${rawName}" is ${rawWidth} ${rawUnit}.`);
              return;
            }
          }
        }
      }
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim(),
      bagType: isRoll ? "none" : formData.bagType,
      bagColor: formData.bagColor?.trim() || "",
      dimensions: {
        length: isRoll ? 0 : Number(formData.dimensions.length),
        width: Number(formData.dimensions.width),
        height: isRoll ? 0 : Number(formData.dimensions.height),
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
      rawMaterials: formData.rawMaterials
        .filter((item) => !isRoll || item.rawMaterialId || item.rawMaterialName.trim())
        .map((item) => ({
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
      customPrinting: isRoll ? false : (formData.customPrinting || false),
      gsm: formData.gsm ? Number(formData.gsm) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      lengthInMeters: isRoll && formData.lengthInMeters ? Number(formData.lengthInMeters) : undefined,
      bf: isRoll && formData.bf ? Number(formData.bf) : undefined,
      unit: isRoll ? "kg" : undefined,
      hsn_source: formData.hsn_source || "master",
      hsn_master_id: formData.hsn_source === "master" ? (formData.hsn_master_id || null) : null,
      custom_hsn_code: formData.hsn_source === "custom" ? String(formData.custom_hsn_code || formData.hsnCode || "").trim() : null,
      custom_gst_rate: formData.hsn_source === "custom" ? Number(formData.custom_gst_rate ?? formData.gstRate ?? 18) : null,
      hsnCode: String(formData.custom_hsn_code || formData.hsnCode || "").trim(),
      gstRate: Number(formData.custom_gst_rate ?? formData.gstRate ?? 18),
    };

    if (formData.hsn_source === "custom") {
      const code = String(formData.custom_hsn_code || "").trim();
      const digits = code.replace(/\s+/g, "");
      const rate = Number(formData.custom_gst_rate);
      if (!digits || !/^\d{4,8}$/.test(digits)) {
        toast.error("Custom HSN Code must be numeric and between 4 to 8 digits");
        return;
      }
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast.error("Custom GST Rate must be between 0% and 100%");
        return;
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">Basic Product Details</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Product Name
            </label>
            <input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Medium Kraft Shopping Bag"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  category: val,
                  bagType: val.toLowerCase().includes("roll") ? "none" : (prev.bagType === "none" ? "custom" : prev.bagType),
                }));
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium"
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
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              SKU
            </label>
            <input
              value={formData.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              placeholder="KRAFT-MED-001"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Bag Type
            </label>
            <select
              value={formData.bagType}
              onChange={(e) => updateField("bagType", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium"
              disabled={isRoll}
            >
              {BAG_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {BAG_TYPE_LABELS[option] || option}
                </option>
              ))}
            </select>
          </div>

          {!isRoll && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Bag Color <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <select
                value={formData.bagColor || ""}
                onChange={(e) => updateField("bagColor", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="">Select Color...</option>
                <option value="Brown">Brown</option>
                <option value="Natural brown">Natural brown</option>
                <option value="White">White</option>
                <option value="Pink">Pink</option>
                {formData.bagColor && !["Brown", "Natural brown", "White", "Pink"].includes(formData.bagColor) && (
                  <option value={formData.bagColor}>{formData.bagColor}</option>
                )}
              </select>
            </div>
          )}

          {!isRoll && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Custom Printing
              </label>
              <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 w-full bg-white cursor-pointer h-[42px] transition hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.customPrinting || false}
                  onChange={(e) => updateField("customPrinting", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Enable Custom Printing
              </label>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder={isRoll ? "High quality kraft roll for wrapping and packaging" : "Strong kraft bag with custom handle and premium finish"}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                HSN Code Selection <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hsn_source === "custom" ? "custom" : (formData.hsn_master_id || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setFormData((prev) => ({
                      ...prev,
                      hsn_source: "custom",
                      hsn_master_id: "",
                      custom_hsn_code: prev.custom_hsn_code || prev.hsnCode || "",
                      custom_gst_rate: prev.custom_gst_rate ?? prev.gstRate ?? 5,
                    }));
                  } else {
                    const selected = hsnMasterList.find((h) => String(h._id || h.id) === String(val));
                    setFormData((prev) => ({
                      ...prev,
                      hsn_source: "master",
                      hsn_master_id: val,
                      hsnCode: selected ? selected.hsn_code : prev.hsnCode,
                      gstRate: selected ? selected.gst_rate : prev.gstRate,
                    }));
                  }
                }}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-bold shadow-2xs"
              >
                <option value="" disabled>Select HSN Code...</option>
                {hsnMasterList.map((opt) => (
                  <option key={opt._id || opt.id} value={opt._id || opt.id}>
                    HSN {opt.hsn_code} — {opt.description} ({opt.gst_rate}%)
                  </option>
                ))}
                <option value="custom">⚙️ Custom / Other (Manual Code & Rate)</option>
              </select>
            </div>

            {formData.hsn_source === "custom" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-800">
                    Custom HSN Code (4–8 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.custom_hsn_code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setFormData((prev) => ({ ...prev, custom_hsn_code: val, hsnCode: val }));
                    }}
                    placeholder="e.g. 4819"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-800">
                    Custom GST Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={formData.custom_gst_rate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, custom_gst_rate: val, gstRate: Number(val) }));
                    }}
                    placeholder="5"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-bold"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Applicable GST Rate (Auto-Filled)
                </label>
                <div className="w-full rounded-xl border border-emerald-300 px-3 py-2.5 text-sm bg-emerald-100/80 text-emerald-950 font-black flex items-center h-[42px] shadow-2xs">
                  {formData.gstRate != null ? `${formData.gstRate}% GST` : "Select HSN..."}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              GSM <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.gsm}
              onChange={(e) => updateField("gsm", e.target.value)}
              placeholder="120"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
              required
            />
          </div>

          {isRoll ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">
                  Length in Meters
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.lengthInMeters}
                  onChange={(e) => updateField("lengthInMeters", e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">
                  BF (Burst Factor)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.bf}
                  onChange={(e) => updateField("bf", e.target.value)}
                  placeholder="20"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Weight per Bag (kg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="e.g. 0.02"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">{isRoll ? "Roll Dimensions" : "Bag Dimensions"}</h3>

        {!isRoll && (
          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Size Configuration</label>
              <select
                value={sizePreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium"
              >
                <option value="small">Small (8 × 10 × 4 inch)</option>
                <option value="medium">Medium (10 × 12 × 5 inch)</option>
                <option value="large">Large (12 × 16 × 6 inch)</option>
                <option value="custom">Custom (Manual Entry)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Bag Size Label (Matches Order/Inventory)</label>
              <select
                value={formData.bagSize || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, bagSize: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium"
              >
                <option value="">None (—)</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {!isRoll && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Length</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.dimensions.length}
                onChange={(e) => updateDimension("length", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 font-medium"
                required={!isRoll}
                disabled={sizePreset !== "custom"}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">Width</label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.dimensions.width}
              onChange={(e) => updateDimension("width", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 font-medium"
              required
              disabled={!isRoll && sizePreset !== "custom"}
            />
          </div>

          {!isRoll && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Height</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.dimensions.height}
                onChange={(e) => updateDimension("height", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 font-medium"
                required={!isRoll}
                disabled={sizePreset !== "custom"}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">Unit</label>
            <select
              value={formData.dimensions.unit}
              onChange={(e) => updateDimension("unit", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 bg-white text-gray-900 font-medium"
              disabled={!isRoll && sizePreset !== "custom"}
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

      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">Pricing & Estimation</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">Base Price</label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.basePrice}
              onChange={(e) => updateField("basePrice", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Pricing Mode
            </label>
            <select
              value={formData.estimationConfig.pricingMode}
              onChange={(e) => updateEstimationField("pricingMode", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white text-gray-900 font-medium"
            >
              {PRICING_MODE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Estimation Base Price
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.estimationConfig.basePrice}
              onChange={(e) => updateEstimationField("basePrice", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Labor Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.estimationConfig.laborCostPerBag}
              onChange={(e) => updateEstimationField("laborCostPerBag", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Overhead Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.estimationConfig.overheadCostPerBag}
              onChange={(e) =>
                updateEstimationField("overheadCostPerBag", e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Printing Cost / Bag
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.estimationConfig.printingCostPerBag}
              onChange={(e) =>
                updateEstimationField("printingCostPerBag", e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Margin %
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.estimationConfig.marginPercent}
              onChange={(e) => updateEstimationField("marginPercent", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div className="flex items-end h-[42px]">
            <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 w-full transition">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Active Product
            </label>
          </div>
        </div>
      </div>

      {/* ── Selling Price Breakdown Preview ── */}
      {sellingPriceBreakdown.hasData && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <span>💰</span> Live Selling Price Preview
          </h3>
          <div className={`grid gap-3 ${isRoll ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
            {/* Scenario A — Base Price */}
            {sellingPriceBreakdown.basePrice > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
                  {isRoll ? "Based on Base Price (per roll/kg)" : "Based on Base Price (per bag)"}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Price</span>
                    <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.basePrice.toLocaleString()}</span>
                  </div>
                  {sellingPriceBreakdown.labor > 0 && (
                    <div className="flex justify-between">
                      <span>+ Labor</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.labor}</span>
                    </div>
                  )}
                  {sellingPriceBreakdown.overhead > 0 && (
                    <div className="flex justify-between">
                      <span>+ Overhead</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.overhead}</span>
                    </div>
                  )}
                  {sellingPriceBreakdown.printing > 0 && (
                    <div className="flex justify-between">
                      <span>+ Printing</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.printing}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-1 mt-1">
                    <span className="font-bold text-gray-700">Total Cost</span>
                    <span className="font-bold text-gray-800">₹{sellingPriceBreakdown.totalCostA.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1.5 pt-1.5 border-t border-emerald-100">
                    <span className="text-emerald-700 font-bold">Selling ({sellingPriceBreakdown.margin}% markup)</span>
                    <span className="font-extrabold text-emerald-700">₹{sellingPriceBreakdown.sellingMarkupA.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario B — Estimation Base Price */}
            {sellingPriceBreakdown.estBasePrice > 0 && (
              <div className="rounded-xl border border-teal-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-2">
                  {isRoll ? "Based on Estimation Price (per roll/kg)" : "Based on Estimation Price (per bag)"}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Est. Base Price</span>
                    <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.estBasePrice.toLocaleString()}</span>
                  </div>
                  {sellingPriceBreakdown.labor > 0 && (
                    <div className="flex justify-between">
                      <span>+ Labor</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.labor}</span>
                    </div>
                  )}
                  {sellingPriceBreakdown.overhead > 0 && (
                    <div className="flex justify-between">
                      <span>+ Overhead</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.overhead}</span>
                    </div>
                  )}
                  {sellingPriceBreakdown.printing > 0 && (
                    <div className="flex justify-between">
                      <span>+ Printing</span>
                      <span className="font-semibold text-gray-800">₹{sellingPriceBreakdown.printing}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-1 mt-1">
                    <span className="font-bold text-gray-700">Total Cost</span>
                    <span className="font-bold text-gray-800">₹{sellingPriceBreakdown.totalCostB.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1.5 pt-1.5 border-t border-teal-100">
                    <span className="text-teal-700 font-bold">Selling ({sellingPriceBreakdown.margin}% markup)</span>
                    <span className="font-extrabold text-teal-700">₹{sellingPriceBreakdown.sellingMarkupB.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-gray-500 font-medium">
            {isRoll ? "Prices shown per roll/kg unit. Markup = Total Cost × (1 + Margin%)" : "Single bag selling price. Markup = Total Cost × (1 + Margin%)"}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Raw Material Requirements ({materialCount})
          </h3>

          <Button type="button" className="bg-emerald-700 hover:bg-emerald-850 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-sm" onClick={addMaterial}>
            Add Raw Material
          </Button>
        </div>

        <div className="space-y-3">
          {formData.rawMaterials.map((item, index) => {
            const selectedRaw = rawMaterialOptions.find(
              (raw) => String(raw._id || raw.id) === String(item.rawMaterialId)
            );

            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
                    Raw Material #{index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-650 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-bold text-gray-800">
                        Raw Material Name
                      </label>
                      {selectedRaw && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          Stock: {selectedRaw.availableStock || 0} {selectedRaw.unit || "pcs"} (Net: {(selectedRaw.availableStock || 0) - (selectedRaw.reservedStock || 0)})
                        </span>
                      )}
                    </div>

                    {isEmptyRawMaterial ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-red-500">
                          No raw material available
                        </p>
                        <Button
                          type="button"
                          className="w-fit bg-emerald-700 text-xs py-1.5"
                          onClick={() => navigate("/rawmaterial")}
                        >
                          Create Raw Material
                        </Button>
                      </div>
                    ) : (
                      <select
                        value={item.rawMaterialId || ""}
                        onChange={(e) => handleRawMaterialSelect(index, e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
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
                          const stockText = `Stock: ${raw.availableStock || 0} ${raw.unit || "pcs"}`;

                          return (
                            <option key={optionValue} value={optionValue}>
                              {optionLabel} ({stockText})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      Raw Material Type
                    </label>
                    <input
                      type="text"
                      value={item.rawMaterialType || ""}
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm outline-none text-gray-600 font-medium"
                      placeholder="Auto filled from selected raw material"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      Usage Type
                    </label>
                    <select
                      value={item.usageType}
                      onChange={(e) => updateMaterial(index, "usageType", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                    >
                      {USAGE_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option === "dimension_based" ? "Dimension Based" : "Fixed"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      {isRoll ? "Required Quantity / kg" : "Required Quantity / Bag"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.requiredQuantityPerBag}
                      onChange={(e) =>
                        updateMaterial(index, "requiredQuantityPerBag", e.target.value)
                      }
                      placeholder={isRoll ? "1.0" : "2.4"}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit || ""}
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm outline-none text-gray-600 font-medium"
                      placeholder="Auto filled from selected raw material"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      Wastage %
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.wastagePercent}
                      onChange={(e) =>
                        updateMaterial(index, "wastagePercent", e.target.value)
                      }
                      placeholder="5"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-bold text-gray-800">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={item.notes}
                      onChange={(e) => updateMaterial(index, "notes", e.target.value)}
                      placeholder="Main paper for outside surface"
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" className="px-6 py-2.5 bg-emerald-700 text-white text-sm rounded-xl font-bold shadow hover:bg-emerald-800 transition">
          {initialData ? "Update and Add to Stock" : "Create and Add to Stock"}
        </Button>
      </div>
    </form>
  );
};
export default ProductForm;