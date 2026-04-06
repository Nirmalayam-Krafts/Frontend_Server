import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input, Badge } from "../../components/ui";
import {
  Package,
  Boxes,
  Factory,
  AlertTriangle,
  Search,
  Calculator,
  Palette,
  Ruler,
  Layers3,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  Plus,
  ShoppingBag,
  ClipboardList,
  BrushCleaning,
  Scale,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const initialRawMaterials = [
  {
    id: "rm1",
    name: "Kraft Paper Roll",
    code: "RM-KRAFT-001",
    unit: "kg",
    available: 1200,
    reorderPoint: 300,
    color: "Brown",
    category: "Paper",
  },
  {
    id: "rm2",
    name: "White Paper Sheet",
    code: "RM-WHITE-002",
    unit: "kg",
    available: 650,
    reorderPoint: 180,
    color: "White",
    category: "Paper",
  },
  {
    id: "rm3",
    name: "Cotton Rope Handle",
    code: "RM-HANDLE-003",
    unit: "pairs",
    available: 4200,
    reorderPoint: 900,
    color: "Natural",
    category: "Handle",
  },
  {
    id: "rm4",
    name: "Twisted Paper Handle",
    code: "RM-HANDLE-004",
    unit: "pairs",
    available: 2800,
    reorderPoint: 700,
    color: "Brown",
    category: "Handle",
  },
  {
    id: "rm5",
    name: "Water Based Ink",
    code: "RM-INK-005",
    unit: "litres",
    available: 95,
    reorderPoint: 20,
    color: "Multi",
    category: "Printing",
  },
  {
    id: "rm6",
    name: "Adhesive Glue",
    code: "RM-GLUE-006",
    unit: "litres",
    available: 160,
    reorderPoint: 40,
    color: "Transparent",
    category: "Adhesive",
  },
];

const bagProducts = [
  {
    id: "bag1",
    name: "Ecocraft Bags",
    variant: "Small Retail Bag",
    category: "Ecocraft Bags",
    availableBags: 850,
    color: "Brown",
    printType: "Single Color Print",
    handleType: "Cotton Rope",
    gsm: 120,
    dimensions: { width: 10, height: 14, gusset: 4, unit: "inch" },
    recipe: [
      { materialId: "rm1", materialName: "Kraft Paper Roll", qtyPerBag: 0.18, unit: "kg" },
      { materialId: "rm3", materialName: "Cotton Rope Handle", qtyPerBag: 1, unit: "pairs" },
      { materialId: "rm5", materialName: "Water Based Ink", qtyPerBag: 0.01, unit: "litres" },
      { materialId: "rm6", materialName: "Adhesive Glue", qtyPerBag: 0.015, unit: "litres" },
    ],
  },
  {
    id: "bag2",
    name: "F&B Gourmet Bags",
    variant: "Medium Food Bag",
    category: "F&B Gourmet Bags",
    availableBags: 430,
    color: "White",
    printType: "Two Color Print",
    handleType: "Twisted Paper",
    gsm: 140,
    dimensions: { width: 12, height: 16, gusset: 5, unit: "inch" },
    recipe: [
      { materialId: "rm2", materialName: "White Paper Sheet", qtyPerBag: 0.22, unit: "kg" },
      { materialId: "rm4", materialName: "Twisted Paper Handle", qtyPerBag: 1, unit: "pairs" },
      { materialId: "rm5", materialName: "Water Based Ink", qtyPerBag: 0.015, unit: "litres" },
      { materialId: "rm6", materialName: "Adhesive Glue", qtyPerBag: 0.018, unit: "litres" },
    ],
  },
  {
    id: "bag3",
    name: "Luxury Kraft Bags",
    variant: "Premium Gift Bag",
    category: "Luxury Kraft Bags",
    availableBags: 210,
    color: "Brown Matte",
    printType: "Premium Print",
    handleType: "Cotton Rope",
    gsm: 180,
    dimensions: { width: 14, height: 18, gusset: 5, unit: "inch" },
    recipe: [
      { materialId: "rm1", materialName: "Kraft Paper Roll", qtyPerBag: 0.3, unit: "kg" },
      { materialId: "rm3", materialName: "Cotton Rope Handle", qtyPerBag: 1, unit: "pairs" },
      { materialId: "rm5", materialName: "Water Based Ink", qtyPerBag: 0.02, unit: "litres" },
      { materialId: "rm6", materialName: "Adhesive Glue", qtyPerBag: 0.02, unit: "litres" },
    ],
  },
];

const ordersData = [
  {
    id: "ord1",
    orderNo: "ORD-1001",
    customer: "Retail Store Pune",
    bagId: "bag1",
    qty: 300,
    status: "Pending",
  },
  {
    id: "ord2",
    orderNo: "ORD-1002",
    customer: "Cafe Express",
    bagId: "bag2",
    qty: 180,
    status: "Confirmed",
  },
  {
    id: "ord3",
    orderNo: "ORD-1003",
    customer: "Gift House",
    bagId: "bag3",
    qty: 120,
    status: "Pending",
  },
];

const getMaterialStatus = (available, reorderPoint) => {
  if (available <= reorderPoint * 0.5) return "critical";
  if (available <= reorderPoint) return "low";
  if (available <= reorderPoint * 1.5) return "medium";
  return "healthy";
};

const statusClasses = {
  healthy: "success",
  medium: "warning",
  low: "danger",
  critical: "danger",
};

const BagPreview = ({ bag }) => {
  const bg =
    bag.color.toLowerCase().includes("white")
      ? "from-stone-100 to-white"
      : bag.color.toLowerCase().includes("matte")
      ? "from-stone-700 to-stone-500"
      : "from-amber-700 to-yellow-700";

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Bag Preview
          </p>
          <h3 className="text-lg font-bold text-gray-900">{bag.name}</h3>
          <p className="text-sm text-gray-500">{bag.variant}</p>
        </div>
        <Badge variant="secondary">{bag.availableBags} pcs ready</Badge>
      </div>

      <div className="flex justify-center py-4">
        <div className="relative">
          <div className={`h-44 w-36 rounded-t-[14px] rounded-b-[18px] bg-gradient-to-b ${bg} shadow-xl`} />
          <div className="absolute left-5 top-[-12px] h-12 w-10 rounded-full border-[4px] border-stone-400 border-b-0" />
          <div className="absolute right-5 top-[-12px] h-12 w-10 rounded-full border-[4px] border-stone-400 border-b-0" />
          <div className="absolute inset-x-4 top-10 rounded-xl bg-white/20 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur-sm">
            {bag.category}
          </div>
          <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
            Nirmalyam Krafts
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-gray-500">Print</p>
          <p className="font-semibold text-gray-900">{bag.printType}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-gray-500">Handle</p>
          <p className="font-semibold text-gray-900">{bag.handleType}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-gray-500">GSM</p>
          <p className="font-semibold text-gray-900">{bag.gsm}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-gray-500">Size</p>
          <p className="font-semibold text-gray-900">
            {bag.dimensions.width} × {bag.dimensions.height} × {bag.dimensions.gusset} {bag.dimensions.unit}
          </p>
        </div>
      </div>
    </div>
  );
};

const RawMaterial = () => {
  const [rawMaterials, setRawMaterials] = useState(initialRawMaterials);
  const [search, setSearch] = useState("");
  const [selectedBagId, setSelectedBagId] = useState(bagProducts[0].id);
  const [productionQty, setProductionQty] = useState(100);

  const [bagDimensions, setBagDimensions] = useState({
    width: bagProducts[0].dimensions.width,
    height: bagProducts[0].dimensions.height,
    gusset: bagProducts[0].dimensions.gusset,
    unit: bagProducts[0].dimensions.unit,
  });

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    code: "",
    category: "Paper",
    unit: "kg",
    available: "",
    reorderPoint: "",
    color: "",
  });

  const [mixPlan, setMixPlan] = useState(
    bagProducts.map((bag) => ({
      bagId: bag.id,
      qty: 0,
    }))
  );

  const selectedBag = useMemo(
    () => bagProducts.find((bag) => bag.id === selectedBagId) || bagProducts[0],
    [selectedBagId]
  );

  const filteredMaterials = useMemo(() => {
    const q = search.toLowerCase();
    return rawMaterials.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [search, rawMaterials]);

  const totalRawMaterials = rawMaterials.length;

  const totalMaterialUnits = useMemo(() => {
    return rawMaterials.reduce((sum, item) => sum + Number(item.available || 0), 0);
  }, [rawMaterials]);

  const lowStockCount = useMemo(() => {
    return rawMaterials.filter((item) => item.available <= item.reorderPoint).length;
  }, [rawMaterials]);

  const selectedBagPreview = useMemo(() => {
    return {
      ...selectedBag,
      dimensions: bagDimensions,
    };
  }, [selectedBag, bagDimensions]);

  const productionPreview = useMemo(() => {
    if (!selectedBag || !productionQty || productionQty <= 0) return [];

    return selectedBag.recipe.map((recipeItem) => {
      const material = rawMaterials.find((m) => m.id === recipeItem.materialId);
      const required = Number(recipeItem.qtyPerBag) * Number(productionQty);
      const remaining = Number(material?.available || 0) - required;

      return {
        ...recipeItem,
        available: Number(material?.available || 0),
        required,
        remaining,
        canProduce: remaining >= 0,
      };
    });
  }, [selectedBag, productionQty, rawMaterials]);

  const canProduceAll = productionPreview.every((item) => item.canProduce);

  const maxPossibleProduction = useMemo(() => {
    if (!selectedBag) return 0;

    const possibleCounts = selectedBag.recipe.map((recipeItem) => {
      const material = rawMaterials.find((m) => m.id === recipeItem.materialId);
      const available = Number(material?.available || 0);
      const qtyPerBag = Number(recipeItem.qtyPerBag || 0);
      if (qtyPerBag <= 0) return Infinity;
      return Math.floor(available / qtyPerBag);
    });

    return Math.min(...possibleCounts);
  }, [selectedBag, rawMaterials]);

  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter((o) => o.status === "Pending").length;
  const confirmedOrders = ordersData.filter((o) => o.status === "Confirmed").length;
  const totalOrderedBags = ordersData.reduce((sum, item) => sum + item.qty, 0);

  const orderMaterialSummary = useMemo(() => {
    const summaryMap = {};

    ordersData.forEach((order) => {
      const bag = bagProducts.find((b) => b.id === order.bagId);
      if (!bag) return;

      bag.recipe.forEach((recipe) => {
        if (!summaryMap[recipe.materialId]) {
          summaryMap[recipe.materialId] = {
            materialId: recipe.materialId,
            materialName: recipe.materialName,
            unit: recipe.unit,
            required: 0,
          };
        }
        summaryMap[recipe.materialId].required += recipe.qtyPerBag * order.qty;
      });
    });

    return Object.values(summaryMap).map((item) => {
      const stock = rawMaterials.find((m) => m.id === item.materialId);
      const available = Number(stock?.available || 0);
      return {
        ...item,
        available,
        remainingAfterOrders: available - item.required,
        sufficient: available >= item.required,
      };
    });
  }, [rawMaterials]);

  const mixMaterialUsage = useMemo(() => {
    const usageMap = {};

    mixPlan.forEach((planItem) => {
      if (!planItem.qty || planItem.qty <= 0) return;
      const bag = bagProducts.find((b) => b.id === planItem.bagId);
      if (!bag) return;

      bag.recipe.forEach((recipe) => {
        if (!usageMap[recipe.materialId]) {
          usageMap[recipe.materialId] = {
            materialId: recipe.materialId,
            materialName: recipe.materialName,
            unit: recipe.unit,
            required: 0,
          };
        }
        usageMap[recipe.materialId].required += recipe.qtyPerBag * planItem.qty;
      });
    });

    return Object.values(usageMap).map((item) => {
      const stock = rawMaterials.find((m) => m.id === item.materialId);
      const available = Number(stock?.available || 0);
      return {
        ...item,
        available,
        remaining: available - item.required,
        canProduce: available >= item.required,
      };
    });
  }, [mixPlan, rawMaterials]);

  const totalMixBags = mixPlan.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const canProduceMix = mixMaterialUsage.every((item) => item.canProduce);

  const handleMixQtyChange = (bagId, value) => {
    setMixPlan((prev) =>
      prev.map((item) =>
        item.bagId === bagId ? { ...item, qty: Number(value) || 0 } : item
      )
    );
  };

  const handleAddRawMaterial = () => {
    if (!newMaterial.name || !newMaterial.code) return;

    const payload = {
      id: `rm-${Date.now()}`,
      name: newMaterial.name,
      code: newMaterial.code,
      category: newMaterial.category,
      unit: newMaterial.unit,
      available: Number(newMaterial.available || 0),
      reorderPoint: Number(newMaterial.reorderPoint || 0),
      color: newMaterial.color || "Default",
    };

    setRawMaterials((prev) => [payload, ...prev]);

    setNewMaterial({
      name: "",
      code: "",
      category: "Paper",
      unit: "kg",
      available: "",
      reorderPoint: "",
      color: "",
    });
  };

  const handleCreateProduction = () => {
    if (!canProduceAll) return;

    setRawMaterials((prev) =>
      prev.map((material) => {
        const usage = productionPreview.find((item) => item.materialId === material.id);
        if (!usage) return material;
        return {
          ...material,
          available: Number((material.available - usage.required).toFixed(2)),
        };
      })
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Raw Material & Production Dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm text-emerald-50/90">
                Add raw materials, manage bag dimensions, preview bag designs, check order pressure,
                calculate production, and see exactly how much raw material will remain after creating bags.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase text-white/75">Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase text-white/75">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase text-white/75">Confirmed</p>
                <p className="text-2xl font-bold">{confirmedOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase text-white/75">Ordered Bags</p>
                <p className="text-2xl font-bold">{totalOrderedBags}</p>
              </div>
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
                <p className="text-xs font-semibold uppercase text-gray-500">Raw Materials</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalRawMaterials}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Material Units</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalMaterialUnits.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Factory className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-red-100 bg-red-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-red-500">Low Alerts</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{lowStockCount}</p>
                <p className="mt-2 text-xs text-red-600">Need quick attention</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Max Production</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{maxPossibleProduction}</p>
                <p className="mt-2 text-xs text-emerald-600">{selectedBag.variant}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Mixed Plan</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalMixBags}</p>
                <p className="mt-2 text-xs text-gray-500">bags across variants</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Raw Material Stock</h2>
                <p className="text-sm text-gray-500">
                  Search, add, and monitor your production materials
                </p>
              </div>
              <Button icon={Plus}>Add New Material</Button>
            </div>

            <div className="mb-5">
              <Input
                placeholder="Search raw materials by name, code, or category..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input
                placeholder="Material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="Code"
                value={newMaterial.code}
                onChange={(e) => setNewMaterial((p) => ({ ...p, code: e.target.value }))}
              />
              <Input
                placeholder="Color"
                value={newMaterial.color}
                onChange={(e) => setNewMaterial((p) => ({ ...p, color: e.target.value }))}
              />
              <select
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-500"
                value={newMaterial.category}
                onChange={(e) => setNewMaterial((p) => ({ ...p, category: e.target.value }))}
              >
                <option>Paper</option>
                <option>Handle</option>
                <option>Printing</option>
                <option>Adhesive</option>
                <option>Accessory</option>
              </select>

              <select
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-500"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial((p) => ({ ...p, unit: e.target.value }))}
              >
                <option value="kg">kg</option>
                <option value="pairs">pairs</option>
                <option value="litres">litres</option>
                <option value="pcs">pcs</option>
                <option value="rolls">rolls</option>
              </select>

              <Input
                type="number"
                placeholder="Available stock"
                value={newMaterial.available}
                onChange={(e) => setNewMaterial((p) => ({ ...p, available: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Reorder point"
                value={newMaterial.reorderPoint}
                onChange={(e) => setNewMaterial((p) => ({ ...p, reorderPoint: e.target.value }))}
              />

              <Button className="h-11 w-full bg-green-500" icon={Plus} onClick={handleAddRawMaterial}>
                Save Material
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Material</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Code</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Available</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Reorder</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((item) => {
                    const status = getMaterialStatus(item.available, item.reorderPoint);

                    return (
                      <tr key={item.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.color}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{item.code}</td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {item.available} {item.unit}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.reorderPoint} {item.unit}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusClasses[status]}>
                            {status === "critical"
                              ? "Critical"
                              : status === "low"
                              ? "Low"
                              : status === "medium"
                              ? "Medium"
                              : "Healthy"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[28px] border border-gray-100 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Bag Catalog</h2>
              </div>

              <div className="space-y-3">
                {bagProducts.map((bag) => (
                  <button
                    key={bag.id}
                    onClick={() => {
                      setSelectedBagId(bag.id);
                      setBagDimensions({ ...bag.dimensions });
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedBagId === bag.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{bag.name}</p>
                        <p className="text-sm text-gray-500">{bag.variant}</p>
                      </div>
                      <Badge variant="secondary">{bag.availableBags} pcs</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

        

            <Card className="rounded-[28px] border border-gray-100 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Bag Dimensions & Design</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Width"
                  value={bagDimensions.width}
                  onChange={(e) =>
                    setBagDimensions((p) => ({ ...p, width: Number(e.target.value || 0) }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={bagDimensions.height}
                  onChange={(e) =>
                    setBagDimensions((p) => ({ ...p, height: Number(e.target.value || 0) }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Gusset"
                  value={bagDimensions.gusset}
                  onChange={(e) =>
                    setBagDimensions((p) => ({ ...p, gusset: Number(e.target.value || 0) }))
                  }
                />
                <select
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-500"
                  value={bagDimensions.unit}
                  onChange={(e) => setBagDimensions((p) => ({ ...p, unit: e.target.value }))}
                >
                  <option value="inch">inch</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-7 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Single Bag Production Calculator</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="font-semibold text-gray-900">{selectedBag.name}</p>
                <p className="text-sm text-gray-600">{selectedBag.variant}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white p-3">
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <Palette className="h-4 w-4" />
                      Color
                    </div>
                    <p className="font-medium text-gray-900">{selectedBag.color}</p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <Layers3 className="h-4 w-4" />
                      GSM
                    </div>
                    <p className="font-medium text-gray-900">{selectedBag.gsm}</p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <Ruler className="h-4 w-4" />
                      Dimensions
                    </div>
                    <p className="font-medium text-gray-900">
                      {bagDimensions.width} × {bagDimensions.height} × {bagDimensions.gusset} {bagDimensions.unit}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <PackageCheck className="h-4 w-4" />
                      Handle
                    </div>
                    <p className="font-medium text-gray-900">{selectedBag.handleType}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Number of bags to create
                </label>
                <Input
                  type="number"
                  min="1"
                  value={productionQty}
                  onChange={(e) => setProductionQty(Number(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  canProduceAll ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                }`}
              >
                <p className="font-semibold text-gray-900">
                  {canProduceAll
                    ? `You can create ${productionQty} bags`
                    : `Insufficient raw materials for ${productionQty} bags`}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Maximum possible production:
                  <span className="ml-1 font-semibold text-gray-900">{maxPossibleProduction}</span>
                </p>
              </div>

              <Button icon={ArrowRight} className="w-full" onClick={handleCreateProduction}>
                Create Production & Deduct Material
              </Button>
            </div>
          </Card>
   <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Single Production Material Usage Preview</h2>
              <p className="text-sm text-gray-500">
                Shows required raw material and remaining stock after creating the selected bags
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Raw Material</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Per Bag</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Available</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Required</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Remaining</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {productionPreview.map((item, index) => (
                    <tr key={`${item.materialId}-${index}`} className="border-b border-gray-100 transition hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.qtyPerBag} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.available} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {item.required.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.remaining.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={item.canProduce ? "success" : "danger"}>
                          {item.canProduce ? "Available" : "Insufficient"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BrushCleaning className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Mixed Bag Production Planner</h2>
            </div>

            <div className="space-y-4">
              {bagProducts.map((bag) => {
                const plan = mixPlan.find((p) => p.bagId === bag.id);

                return (
                  <div key={bag.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{bag.name}</p>
                        <p className="text-sm text-gray-500">{bag.variant}</p>
                      </div>
                      <Badge variant="secondary">{bag.handleType}</Badge>
                    </div>

                    <Input
                      type="number"
                      min="0"
                      value={plan?.qty || 0}
                      onChange={(e) => handleMixQtyChange(bag.id, e.target.value)}
                      placeholder="Enter number of bags"
                    />
                  </div>
                );
              })}

              <div
                className={`rounded-2xl border p-4 ${
                  canProduceMix ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                }`}
              >
                <p className="font-semibold text-gray-900">
                  {canProduceMix
                    ? `Mixed production plan is possible for ${totalMixBags} bags`
                    : `Mixed plan exceeds available raw materials`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Mixed Plan Material Preview</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Material</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Available</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Required</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Remaining</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {mixMaterialUsage.length ? (
                    mixMaterialUsage.map((item) => (
                      <tr key={item.materialId} className="border-b border-gray-100">
                        <td className="px-4 py-4 font-medium text-gray-900">{item.materialName}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item.available} {item.unit}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {item.required.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item.remaining.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={item.canProduce ? "success" : "danger"}>
                            {item.canProduce ? "Available" : "Insufficient"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        Enter quantities for different bags to preview mixed production.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
       

            <Card className="rounded-[28px] border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Order Summary vs Material Load</h2>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Total Orders</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs uppercase text-amber-600">Pending</p>
                <p className="mt-2 text-2xl font-bold text-amber-700">{pendingOrders}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs uppercase text-blue-600">Confirmed</p>
                <p className="mt-2 text-2xl font-bold text-blue-700">{confirmedOrders}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs uppercase text-emerald-600">Bags Needed</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">{totalOrderedBags}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Material</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Required for Orders</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Available</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Remaining</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {orderMaterialSummary.map((item) => (
                    <tr key={item.materialId} className="border-b border-gray-100">
                      <td className="px-4 py-4 font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.required.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.available} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.remainingAfterOrders.toFixed(item.unit === "pairs" ? 0 : 2)} {item.unit}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={item.sufficient ? "success" : "danger"}>
                          {item.sufficient ? "Enough" : "Short"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RawMaterial;