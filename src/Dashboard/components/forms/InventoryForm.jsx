import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui";
import { RefreshCw, AlertTriangle, Lock } from "lucide-react";
import { useGetAllProducts } from "../../../../hook/Product";

const inventorySchema = z.object({
  sku: z.string().min(2, "SKU is required").toUpperCase(),
  productName: z.string().min(2, "Product name is required"),
  category: z.enum(["STANDARD", "PREMIUM", "FOOD_GRADE", "KRAFT_ROLL", "RAW_MATERIAL"]),
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
  gsm: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0).optional()),
  weight: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0).optional()),
  lengthInMeters: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0).optional()),
  bf: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0).optional()),
  productId: z.string().optional(),
  customPrinting: z.boolean().optional(),
});

const computeIdealPrice = (prod) => {
  if (!prod) return null;
  const ec = prod.estimationConfig || {};
  const base = Number(prod.basePrice || 0);
  const labor = Number(ec.laborCostPerBag || 0);
  const overhead = Number(ec.overheadCostPerBag || 0);
  const printing = Number(ec.printingCostPerBag || 0);
  const margin = Number(ec.marginPercent || 10);
  const totalCost = base + labor + overhead + printing;
  const sellingMarkup = parseFloat((totalCost * (1 + margin / 100)).toFixed(2));
  return { base, labor, overhead, printing, margin, totalCost, sellingMarkup };
};

const InventoryForm = ({ initialData, onSubmit, loading }) => {
  const [manualSell, setManualSell] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData
      ? { ...initialData, bagColor: initialData.bagColor || "Brown", bf: initialData.bf || "" }
      : {
          sku: "", productName: "", category: "STANDARD",
          bagType: "", bagColor: "Brown", bagSizeLabel: "",
          stockLevel: 0, reorderPt: 10, unit: "bags",
          unitPrice: 0, sellingPricePerUnit: 0, productionCostPerUnit: 0,
          description: "", isActive: true,
          gsm: "", weight: "", lengthInMeters: "", bf: "",
          productId: "", customPrinting: false,
        },
  });

  const { data: products = [] } = useGetAllProducts();

  const category = watch("category");
  const isRoll = category === "KRAFT_ROLL";
  const stockLevel = Number(watch("stockLevel") || 0);
  const unitPrice = Number(watch("unitPrice") || 0);
  const sellingPrice = Number(watch("sellingPricePerUnit") || 0);
  const prodCost = Number(watch("productionCostPerUnit") || 0);
  const unitLabel = watch("unit") || "bags";
  const selectedProdId = watch("productId");

  const linkedProduct = useMemo(
    () => selectedProdId ? products.find(p => String(p._id || p.id) === String(selectedProdId)) : null,
    [products, selectedProdId]
  );

  const idealInfo = useMemo(() => computeIdealPrice(linkedProduct), [linkedProduct]);
  const idealSell = idealInfo?.sellingMarkup ?? null;

  const realProfit = idealInfo ? sellingPrice - idealInfo.totalCost : sellingPrice - unitPrice;
  const realMarginPct = sellingPrice > 0 && idealInfo
    ? (realProfit / sellingPrice) * 100
    : sellingPrice > 0 ? ((sellingPrice - unitPrice) / sellingPrice) * 100 : 0;

  const isPriceMismatch = idealSell !== null && Math.abs(sellingPrice - idealSell) > 1;

  const stockAtCost = stockLevel * unitPrice;
  const stockAtSell = stockLevel * sellingPrice;

  const populateFromProduct = (prod) => {
    if (!prod) return;
    const ideal = computeIdealPrice(prod);
    let invCat = "STANDARD";
    if (prod.category === "Kraft paper roll") invCat = "KRAFT_ROLL";
    else if (prod.category === "F&B Gourmet Bags") invCat = "FOOD_GRADE";
    else if (prod.category === "Luxury bags") invCat = "PREMIUM";

    setValue("productId", String(prod._id || prod.id));
    setValue("sku", prod.sku || "");
    setValue("productName", prod.name || "");
    setValue("category", invCat);
    setValue("unit", prod.category === "Kraft paper roll" ? "kg" : "bags");
    setValue("bagType", prod.bagType || "");
    setValue("bagColor", prod.color || "Brown");
    setValue("bagSizeLabel", prod.bagSize || "");
    setValue("unitPrice", prod.basePrice || 0);
    setValue("productionCostPerUnit", ideal?.totalCost || prod.basePrice || 0);
    setValue("gsm", prod.gsm || "");
    setValue("weight", prod.weight || "");
    setValue("lengthInMeters", prod.lengthInMeters || "");
    setValue("bf", prod.bf || "");
    setValue("description", prod.description || "");
    setValue("customPrinting", prod.customPrinting || false);
    setValue("sellingPricePerUnit", ideal ? ideal.sellingMarkup : prod.basePrice || 0);
    setManualSell(false);
  };

  const syncPrice = () => {
    if (linkedProduct) {
      populateFromProduct(linkedProduct);
    }
  };

  const FormLabel = ({ children, extra = null }) => (
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{children}</span>
      {extra}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-900 pb-10">
      
      {/* Product Template Link */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
            Link Product Template
          </label>
          {linkedProduct && (
            <button type="button" onClick={syncPrice} className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1 transition">
              <RefreshCw className="w-3 h-3" /> Sync Price
            </button>
          )}
        </div>

        <select
          value={selectedProdId || ""}
          onChange={(e) => {
            const prod = products.find(p => String(p._id || p.id) === e.target.value);
            if (prod) populateFromProduct(prod);
            else setValue("productId", "");
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 font-bold text-gray-900"
        >
          <option value="">— Manual Entry (No Linked Template) —</option>
          {products.map(p => (
            <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>

        {idealInfo && (
          <div className="mt-2 text-xs flex items-center justify-between text-gray-650 bg-white rounded border border-gray-200 p-2 font-medium">
            <span>Ideal selling price: <strong className="text-gray-900 font-bold">₹{idealInfo.sellingMarkup.toFixed(2)}</strong></span>
            <span className="text-[10px] text-gray-500">({idealInfo.margin}% margin config)</span>
          </div>
        )}

        {isPriceMismatch && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-250 rounded p-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Price differs from ideal ₹{idealSell?.toFixed(2)}. Sync price to match product config.</span>
          </div>
        )}
      </div>

      {/* Basic & Specifications Form Fields (Compact 2-Column Drawer Layout) */}
      <div className="space-y-3.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1">
          Item Details
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <FormLabel>SKU</FormLabel>
            <input className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent font-bold text-gray-900" {...register("sku")} />
            {errors.sku && <span className="text-[10px] text-red-600 mt-0.5">{errors.sku.message}</span>}
          </div>

          <div className="flex flex-col">
            <FormLabel>Product Name</FormLabel>
            <input className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent font-bold text-gray-900" {...register("productName")} />
            {errors.productName && <span className="text-[10px] text-red-600 mt-0.5">{errors.productName.message}</span>}
          </div>

          <div className="flex flex-col">
            <FormLabel>Category</FormLabel>
            <select className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent bg-white font-bold text-gray-900" {...register("category")}>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
              <option value="FOOD_GRADE">Food Grade</option>
              <option value="KRAFT_ROLL">Kraft Roll</option>
              <option value="RAW_MATERIAL">Raw Material</option>
            </select>
          </div>

          <div className="flex flex-col">
            <FormLabel>Unit</FormLabel>
            <input className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent font-bold text-gray-900" {...register("unit")} />
          </div>

          {/* Conditional specs */}
          {isRoll ? (
            <>
              <div className="flex flex-col">
                <FormLabel>GSM</FormLabel>
                <input type="number" min="0" step="any" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("gsm")} />
              </div>
              <div className="flex flex-col">
                <FormLabel>Weight (kg)</FormLabel>
                <input type="number" min="0" step="any" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("weight")} />
              </div>
              <div className="flex flex-col">
                <FormLabel>Length (m)</FormLabel>
                <input type="number" min="0" step="any" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("lengthInMeters")} />
              </div>
              <div className="flex flex-col">
                <FormLabel>BF (Burst Factor)</FormLabel>
                <input type="number" min="0" step="any" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("bf")} />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <FormLabel>Bag Type</FormLabel>
                <input className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" placeholder="SOS / Flat" {...register("bagType")} />
              </div>
              <div className="flex flex-col">
                <FormLabel>Color</FormLabel>
                <select className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 bg-white font-bold text-gray-900" {...register("bagColor")}>
                  <option value="Brown">Brown</option>
                  <option value="White">White</option>
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <FormLabel>Size Label</FormLabel>
                <input className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" placeholder="Large / Medium" {...register("bagSizeLabel")} />
              </div>
            </>
          )}

          {/* Stock Configuration */}
          <div className="flex flex-col">
            <FormLabel>Stock Level</FormLabel>
            <input type="number" min="0" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("stockLevel")} />
          </div>

          <div className="flex flex-col">
            <FormLabel>Reorder Point</FormLabel>
            <input type="number" min="0" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("reorderPt")} />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-3 border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between border-b border-gray-150 pb-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
            Pricing &amp; Costs
          </p>
          <div className="flex items-center gap-0.5 bg-gray-100 rounded border border-gray-300 p-0.5">
            <button
              type="button"
              onClick={() => { setManualSell(false); if(idealSell) setValue("sellingPricePerUnit", idealSell); }}
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition ${!manualSell ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setManualSell(true)}
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition ${manualSell ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Manual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <FormLabel>Cost Price (₹)</FormLabel>
            <input type="number" step="0.01" min="0" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("unitPrice")} />
          </div>

          <div className="flex flex-col">
            <FormLabel>Production Cost (₹)</FormLabel>
            <input type="number" step="0.01" min="0" className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900" {...register("productionCostPerUnit")} />
          </div>

          <div className="flex flex-col col-span-2">
            <FormLabel>
              Selling Price (₹)
            </FormLabel>
            <div className="relative">
              <input
                type="number" step="0.01" min="0"
                readOnly={!manualSell && !!idealSell}
                className={`w-full rounded-md border px-2.5 py-1.5 text-xs outline-none transition font-bold ${
                  !manualSell && idealSell
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-not-allowed"
                    : "border-gray-300 focus:ring-1 focus:ring-emerald-500 text-gray-900"
                }`}
                {...register("sellingPricePerUnit")}
              />
              {!manualSell && idealSell && (
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[9px] font-bold text-emerald-700 flex items-center gap-0.5 bg-white border border-emerald-250 px-2 py-0.2 rounded">
                  <Lock className="w-2.5 h-2.5" /> Auto-Synced Price
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live financial breakdown inside Drawer */}
        {(unitPrice > 0 || sellingPrice > 0) && (
          <div className="rounded-md border border-gray-200 bg-white overflow-hidden text-xs shadow-sm">
            <div className="grid grid-cols-2 divide-y divide-x divide-gray-150 bg-gray-50 border-b border-gray-200">
              <div className="p-2 text-center">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block mb-0.5">Base Cost Price</span>
                <span className="font-bold text-gray-800">₹{unitPrice.toFixed(2)}</span>
              </div>
              <div className="p-2 text-center">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block mb-0.5">Total Prod Cost</span>
                <span className="font-bold text-gray-750">₹{prodCost ? prodCost.toFixed(2) : "—"}</span>
              </div>
              <div className="p-2 text-center col-span-2 bg-emerald-50/20">
                <span className="text-[8px] uppercase tracking-wider text-emerald-600 block mb-0.5">Final Selling Price</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹{sellingPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-2 grid grid-cols-2 gap-2 text-center bg-white font-bold">
              <div className="border border-gray-150 rounded py-1 px-1.5 bg-gray-50/50">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block">Unit Profit</span>
                <span className={`text-xs ${realProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  ₹{realProfit.toFixed(2)}
                </span>
              </div>
              <div className="border border-gray-150 rounded py-1 px-1.5 bg-gray-50/50">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block">Margin %</span>
                <span className="text-xs text-emerald-800">{realMarginPct.toFixed(1)}%</span>
              </div>
              <div className="border border-gray-150 rounded py-1 px-1.5 bg-gray-50/50">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block">Stock Cost</span>
                <span className="text-xs text-gray-800">₹{stockAtCost.toLocaleString()}</span>
              </div>
              <div className="border border-gray-150 rounded py-1 px-1.5 bg-gray-50/50">
                <span className="text-[8px] uppercase tracking-wider text-gray-400 block">Stock Sell Value</span>
                <span className="text-xs text-emerald-700">₹{stockAtSell.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <FormLabel>Description (Optional)</FormLabel>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none bg-white font-bold text-gray-900"
          rows="2"
          placeholder="Notes or details..."
          {...register("description")}
        />
      </div>

      {/* Drawer Action Button */}
      <div className="pt-2">
        <Button type="submit" loading={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-extrabold text-white rounded-md shadow-md uppercase tracking-wider">
          {initialData ? "✏️ Update Item" : "➕ Create Item"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
