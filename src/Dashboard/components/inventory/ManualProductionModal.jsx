import React, { useEffect, useState } from "react";
import { Modal, Button } from "../ui";
import { Factory, Plus, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";

const parseGsm = (item) => {
  if (!item) return null;
  if (item.gsm != null && Number(item.gsm) > 0) return Number(item.gsm);
  if (item.productId?.gsm != null && Number(item.productId.gsm) > 0) return Number(item.productId.gsm);
  const strToTest = `${item.productName || ""} ${item.name || ""} ${item.code || ""} ${item.sku || ""}`;
  const match = strToTest.match(/(\d+)\s*gsm/i);
  if (match && match[1]) return Number(match[1]);
  return null;
};

const isPaperMaterial = (rm) => {
  if (!rm) return false;
  const rmType = String(rm.type || "").toLowerCase().trim();
  const rmName = String(rm.name || rm.code || "").toLowerCase().trim();
  if (rmType === "paper") return true;
  if (rmName.includes("paper") || rmName.includes("roll") || rmName.includes("kraft")) return true;
  return false;
};

export const ManualProductionModal = ({ isOpen, onClose, onSuccess, initialInventoryId }) => {
  const { axiosInstance } = useAuthContext();
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rawMaterials, setRawMaterials] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Multi-raw material list: [{ rawMaterialId: "", consumedQuantity: "" }]
  const [rawMaterialsList, setRawMaterialsList] = useState([
    { rawMaterialId: "", consumedQuantity: "" },
  ]);

  const [inventoryId, setInventoryId] = useState("");
  const [producedQuantity, setProducedQuantity] = useState("");
  const [producedUnit, setProducedUnit] = useState("pcs");
  const [wastageQuantityKg, setWastageQuantityKg] = useState("");
  const [isWastageManuallyEdited, setIsWastageManuallyEdited] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setRawMaterialsList([{ rawMaterialId: "", consumedQuantity: "" }]);
    setInventoryId(initialInventoryId ? String(initialInventoryId) : "");
    setProducedQuantity("");
    setProducedUnit("pcs");
    setWastageQuantityKg("");
    setIsWastageManuallyEdited(false);
    setNotes("");
  };

  useEffect(() => {
    if (initialInventoryId && inventoryItems.length > 0) {
      setInventoryId(String(initialInventoryId));
      const inv = inventoryItems.find((item) => String(item._id || item.id) === String(initialInventoryId));
      if (inv) {
        const targetUnit = normalizeUnit(inv.unit || inv.productId?.unit || "pcs");
        setProducedUnit(targetUnit);
      }
    }
  }, [initialInventoryId, inventoryItems]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const [rmRes, invRes, prodRes] = await Promise.all([
        axiosInstance.get("/raw-materials"),
        axiosInstance.get("/inventory/all"),
        axiosInstance.get("/products"),
      ]);
      const rmData = rmRes.data?.data;
      const invData = invRes.data?.data;
      const prodData = prodRes.data?.data;

      const rmList = Array.isArray(rmData)
        ? rmData
        : rmData?.items || rmData?.rawMaterials || [];

      const invList = Array.isArray(invData)
        ? invData
        : invData?.items || invData?.inventories || [];

      const pList = Array.isArray(prodData)
        ? prodData
        : prodData?.items || prodData?.products || [];

      setRawMaterials(rmList);
      setInventoryItems(invList);
      setProductsList(pList);
    } catch (err) {
      console.error("Error fetching production batch options:", err);
      toast.error("Failed to load raw materials and inventory options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const normalizeUnit = (u) => {
    if (!u) return "pcs";
    const s = String(u).toLowerCase().trim();
    if (s === "kg" || s === "kilogram" || s === "kilograms" || s === "kgs") return "kg";
    if (s === "pcs" || s === "piece" || s === "pieces" || s === "bags" || s === "bag") return "pcs";
    return s;
  };

  const getStockCount = (inv) => {
    if (!inv) return 0;
    if (inv.stockLevel !== undefined && inv.stockLevel !== null) return inv.stockLevel;
    if (inv.availableStock !== undefined && inv.availableStock !== null) return inv.availableStock;
    if (inv.availableBags !== undefined && inv.availableBags !== null) return inv.availableBags;
    return 0;
  };

  // Add a raw material row
  const handleAddMaterialRow = () => {
    setRawMaterialsList([...rawMaterialsList, { rawMaterialId: "", consumedQuantity: "" }]);
  };

  // Remove a raw material row
  const handleRemoveMaterialRow = (index) => {
    if (rawMaterialsList.length === 1) return;
    const updated = rawMaterialsList.filter((_, i) => i !== index);
    setRawMaterialsList(updated);
  };

  // Update a raw material row
  const handleMaterialChange = (index, field, value) => {
    const updated = [...rawMaterialsList];
    updated[index][field] = value;
    setRawMaterialsList(updated);
  };

  const selectedInvItem = inventoryItems.find(
    (inv) => String(inv._id || inv.id) === String(inventoryId)
  );

  const selectedProduct = productsList.find((p) => {
    const pId = selectedInvItem?.productId?._id || selectedInvItem?.productId;
    return String(p._id || p.id) === String(pId) || p.name === selectedInvItem?.productName;
  });

  const targetGsm = parseGsm(selectedInvItem) || parseGsm(selectedProduct);



  // Compute total consumed paper roll raw material in kg (EXCLUDING non-paper materials like Glue)
  const totalConsumedPaperKg = rawMaterialsList.reduce((sum, item) => {
    if (!item.rawMaterialId || !item.consumedQuantity) return sum;
    const rm = rawMaterials.find(r => String(r._id || r.id) === String(item.rawMaterialId));
    if (!rm || !isPaperMaterial(rm)) return sum;
    const qty = Number(item.consumedQuantity || 0);
    const unit = String(rm.unit || "kg").toLowerCase();
    if (unit === "kg") return sum + qty;
    if (unit === "ton") return sum + (qty * 1000);
    return sum;
  }, 0);

  // Determine bag weight per unit (in kg)
  let bagWeight = Number(
    selectedInvItem?.weightPerBag ||
    selectedInvItem?.productId?.weightPerBag ||
    selectedInvItem?.weight ||
    selectedProduct?.weightPerBag ||
    selectedProduct?.weight ||
    0
  );

  // If bagWeight is not set, estimate weight from GSM & Dimensions (if available)
  if (!bagWeight && selectedProduct?.gsm && selectedProduct?.dimensions?.width) {
    const w = Number(selectedProduct.dimensions.width || 0);
    const l = Number(selectedProduct.dimensions.length || selectedProduct.dimensions.height || 0);
    if (w > 0 && l > 0) {
      const isInch = selectedProduct.dimensions.unit === "inch" || !selectedProduct.dimensions.unit;
      const factor = isInch ? 0.00064516 : 0.000001; // sq inch/cm to sq meter
      bagWeight = Number(((w * l * 2 * factor * selectedProduct.gsm) / 1000).toFixed(5));
    }
  }

  // Compute net produced weight in kg
  let netProducedKg = 0;
  const prodQtyNum = Number(producedQuantity || 0);
  if (prodQtyNum > 0) {
    if (producedUnit === "kg") {
      netProducedKg = prodQtyNum;
    } else {
      if (bagWeight > 0) {
        netProducedKg = prodQtyNum * bagWeight;
      }
    }
  }

  // Automatic wastage calculation: Total Consumed (kg) - Produced Net Weight (kg)
  const autoCalculatedWastage = totalConsumedPaperKg > 0
    ? Math.max(0, parseFloat((totalConsumedPaperKg - netProducedKg).toFixed(2)))
    : 0;

  // Sync automatic wastage when quantities change (unless user explicitly overrides it)
  useEffect(() => {
    if (!isWastageManuallyEdited && totalConsumedPaperKg > 0) {
      setWastageQuantityKg(String(autoCalculatedWastage));
    }
  }, [totalConsumedPaperKg, netProducedKg, autoCalculatedWastage, isWastageManuallyEdited]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate raw materials list
    const validMaterials = rawMaterialsList.filter(
      (m) => m.rawMaterialId && Number(m.consumedQuantity) > 0
    );

    if (validMaterials.length === 0) {
      toast.error("Please select at least one raw material with a valid consumed quantity");
      return;
    }

    // Validate GSM matching for paper raw materials
    for (const item of validMaterials) {
      const rm = rawMaterials.find(r => String(r._id || r.id) === String(item.rawMaterialId));
      if (rm && isPaperMaterial(rm)) {
        const rmGsm = parseGsm(rm);
        if (targetGsm && rmGsm && targetGsm !== rmGsm) {
          toast.error(`GSM Mismatch: '${rm.name}' is ${rmGsm} GSM, but target product requires ${targetGsm} GSM paper roll.`);
          return;
        }
      }
    }

    // Check stock for each material
    for (const item of validMaterials) {
      const rm = rawMaterials.find(r => String(r._id || r.id) === String(item.rawMaterialId));
      const qty = Number(item.consumedQuantity);
      if (rm && qty > rm.availableStock) {
        toast.error(`Consumed quantity (${qty} ${rm.unit}) exceeds available stock for '${rm.name}' (${rm.availableStock} ${rm.unit})`);
        return;
      }
    }

    if (!inventoryId) {
      toast.error("Please select a target finished product / bag item");
      return;
    }

    if (!prodQtyNum || prodQtyNum <= 0) {
      toast.error("Please enter a valid produced quantity");
      return;
    }

    const wastage = Number(wastageQuantityKg || 0);

    setSubmitting(true);
    const loadingToast = toast.loading("Processing production batch...");

    try {
      // Sort paper roll materials first in validMaterials so paper is always primary for scrap tracking
      const sortedValidMaterials = [...validMaterials].sort((a, b) => {
        const rmA = rawMaterials.find(r => String(r._id || r.id) === String(a.rawMaterialId));
        const rmB = rawMaterials.find(r => String(r._id || r.id) === String(b.rawMaterialId));
        const isPaperA = rmA && (rmA.type === "Paper" || /paper|roll|kraft/i.test(rmA.name));
        const isPaperB = rmB && (rmB.type === "Paper" || /paper|roll|kraft/i.test(rmB.name));
        if (isPaperA && !isPaperB) return -1;
        if (!isPaperA && isPaperB) return 1;
        return 0;
      });

      const primaryMat = sortedValidMaterials[0];

      await axiosInstance.post("/production/batch", {
        rawMaterialId: primaryMat.rawMaterialId,
        rawMaterialConsumed: Number(primaryMat.consumedQuantity),
        materials: sortedValidMaterials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          consumedQuantity: Number(m.consumedQuantity),
        })),
        inventoryId,
        productName: selectedInvItem?.productName || "Finished Bag Item",
        producedQuantity: prodQtyNum,
        producedUnit,
        wastageQuantityKg: wastage,
        notes: notes.trim(),
      });

      toast.success("Production batch logged & stock updated successfully 🎉", { id: loadingToast });
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to log production batch", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Manual Production Batch">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
          <Factory className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span>
            Record real-world manufacturing runs. Select all consumed raw materials (paper rolls, glue, handles, thread). Consumed materials will be deducted, ready-to-go bags credited, and scrap automatically calculated and sent to Recycling.
          </span>
        </div>

        {/* Multi-Raw Material Selection List */}
        <div className="space-y-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Consumed Raw Materials *
            </label>
            <button
              type="button"
              onClick={handleAddMaterialRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Material
            </button>
          </div>

          {rawMaterialsList.map((item, index) => {
            const selectedRM = rawMaterials.find(
              (rm) => String(rm._id || rm.id) === String(item.rawMaterialId)
            );

            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Select Material */}
                <div className="col-span-7 sm:col-span-7">
                  <select
                    required
                    value={item.rawMaterialId}
                    onChange={(e) => handleMaterialChange(index, "rawMaterialId", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">-- Select Material #{index + 1} --</option>
                    {rawMaterials.map((rm) => {
                      const isPaper = isPaperMaterial(rm);
                      const rmGsm = parseGsm(rm);
                      const isGsmMismatch = isPaper && targetGsm && rmGsm && targetGsm !== rmGsm;

                      return (
                        <option
                          key={rm._id || rm.id}
                          value={rm._id || rm.id}
                          disabled={isGsmMismatch}
                          className={isGsmMismatch ? "text-gray-400 bg-gray-50" : ""}
                        >
                          {rm.name} ({rm.code}) — Stock: {rm.availableStock} {rm.unit}
                          {isGsmMismatch ? ` ⚠️ (Mismatched GSM: ${rmGsm} GSM vs ${targetGsm} GSM required)` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="col-span-4 sm:col-span-4 flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={`Qty ${selectedRM ? `(${selectedRM.unit})` : ""}`}
                    value={item.consumedQuantity}
                    onChange={(e) => handleMaterialChange(index, "consumedQuantity", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold"
                  />
                  {selectedRM && (
                    <span className="text-[11px] font-bold text-gray-500 flex-shrink-0">
                      {selectedRM.unit}
                    </span>
                  )}
                </div>

                {/* Delete Row Button */}
                <div className="col-span-1 text-right">
                  {rawMaterialsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterialRow(index)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Target Finished Inventory Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Target Ready-to-Go Finished Stock *</label>
          <select
            required
            value={inventoryId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setInventoryId(selectedId);
              const inv = inventoryItems.find((item) => String(item._id || item.id) === String(selectedId));
              if (inv) {
                const targetUnit = normalizeUnit(inv.unit || inv.productId?.unit || "pcs");
                setProducedUnit(targetUnit);
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 font-medium"
          >
            <option value="">-- Select Target Finished Product / Bag Item --</option>
            {inventoryItems.map((inv) => (
              <option key={inv._id || inv.id} value={inv._id || inv.id}>
                {inv.productName} ({inv.sku}) — Current Stock: {getStockCount(inv)} {normalizeUnit(inv.unit || inv.productId?.unit)}
              </option>
            ))}
          </select>
        </div>

        {/* Produced Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Produced Quantity *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 90"
              value={producedQuantity}
              onChange={(e) => setProducedQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 font-semibold text-emerald-700"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">Production Unit *</label>
              {selectedInvItem && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Product Unit: {normalizeUnit(selectedInvItem.unit || selectedInvItem.productId?.unit)}
                </span>
              )}
            </div>
            <select
              value={producedUnit}
              onChange={(e) => setProducedUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 font-semibold bg-gray-50/50"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
            </select>
          </div>
        </div>

        {/* Wastage Generated (Calculated Automatically as Total Consumed (kg) - Produced Weight (kg)) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">Wastage / Scrap Generated (kg)</label>
            {totalConsumedPaperKg > 0 && (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Auto: {totalConsumedPaperKg} kg roll - {netProducedKg.toFixed(1)} kg net = {autoCalculatedWastage} kg
              </span>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 60"
            value={wastageQuantityKg}
            onChange={(e) => {
              setWastageQuantityKg(e.target.value);
              setIsWastageManuallyEdited(true);
            }}
            className="w-full px-3 py-2 border border-amber-200 bg-amber-50/40 rounded-xl text-sm outline-none focus:border-amber-500 font-semibold text-amber-900"
          />
          <p className="text-[11px] text-amber-800 mt-1">
            Calculated automatically as Paper Roll Consumed ({totalConsumedPaperKg} kg) - Net Produced Weight ({netProducedKg.toFixed(1)} kg). Non-paper materials (like Glue, Thread, Handles) are excluded from paper scrap. You can edit this field to override.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Batch Notes</label>
          <textarea
            rows={2}
            placeholder="e.g. Machine 2 run, shift A..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            {submitting ? "Logging Batch..." : "Execute & Update Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
