import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input, Modal } from "../../components/ui";
import {
  Recycle,
  DollarSign,
  TrendingUp,
  Package,
  Boxes,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";

const Recycling = () => {
  const { axiosInstance } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalWastageGeneratedKg: 0,
    totalScrapSoldKg: 0,
    currentScrapStockKg: 0,
    totalScrapRevenue: 0,
  });
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  // Sell Scrap Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [submittingSell, setSubmittingSell] = useState(false);
  const [sellForm, setSellForm] = useState({
    quantityKg: "",
    ratePerKg: "",
    buyerName: "",
    paymentRef: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, logsRes] = await Promise.all([
        axiosInstance.get("/recycling/summary"),
        axiosInstance.get("/recycling/logs?limit=100"),
      ]);
      if (sumRes.data?.data) setSummary(sumRes.data.data);
      if (logsRes.data?.data?.logs) setLogs(logsRes.data.data.logs);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load recycling data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(sellForm.quantityKg);
    const rate = Number(sellForm.ratePerKg);

    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity in kg");
      return;
    }
    if (rate < 0) {
      toast.error("Rate per kg cannot be negative");
      return;
    }
    if (qty > summary.currentScrapStockKg) {
      toast.error(`Quantity exceeds current available scrap stock (${summary.currentScrapStockKg} kg)`);
      return;
    }

    setSubmittingSell(true);
    const loadingToast = toast.loading("Processing scrap sale...");
    try {
      await axiosInstance.post("/recycling/sell", {
        quantityKg: qty,
        ratePerKg: rate,
        buyerName: sellForm.buyerName.trim(),
        paymentRef: sellForm.paymentRef.trim(),
        notes: sellForm.notes.trim(),
      });

      toast.success("Scrap sold successfully & revenue registered in Finance 🎉", { id: loadingToast });
      setShowSellModal(false);
      setSellForm({ quantityKg: "", ratePerKg: "", buyerName: "", paymentRef: "", notes: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to process scrap sale", { id: loadingToast });
    } finally {
      setSubmittingSell(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matName = log.rawMaterialId?.name || "";
    const buyer = log.buyerName || "";
    const notes = log.notes || "";
    return matName.toLowerCase().includes(term) || buyer.toLowerCase().includes(term) || notes.toLowerCase().includes(term);
  });

  const totalCalculatedRevenue = Number((Number(sellForm.quantityKg || 0) * Number(sellForm.ratePerKg || 0)).toFixed(2));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Recycle className="w-8 h-8 text-emerald-400 animate-spin-slow" />
              Recycling & Scrap Management
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              Track manufacturing scrap generation, monitor available scrap inventory, and record scrap sales into Finance revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button
              onClick={() => setShowSellModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
              disabled={summary.currentScrapStockKg <= 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Sell Scrap
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 border-l-4 border-l-amber-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Wastage Created</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{summary.totalWastageGeneratedKg.toLocaleString()} <span className="text-sm font-medium text-gray-500">kg</span></h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Boxes className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scrap Sold</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{summary.totalScrapSoldKg.toLocaleString()} <span className="text-sm font-medium text-gray-500">kg</span></h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-emerald-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Scrap Stock</p>
                <h3 className="text-2xl font-extrabold text-emerald-700 mt-2">{summary.currentScrapStockKg.toLocaleString()} <span className="text-sm font-medium text-emerald-600">kg</span></h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Recycle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Scrap Revenue</p>
                <h3 className="text-2xl font-extrabold text-purple-900 mt-2">₹{summary.totalScrapRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter and Log Table */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recycling & Scrap Log History</h2>
              <p className="text-xs text-gray-500">View generated manufacturing scrap and completed scrap sale transactions.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Log Type</th>
                  <th className="py-3.5 px-4">Source Material / Buyer</th>
                  <th className="py-3.5 px-4">Quantity (kg)</th>
                  <th className="py-3.5 px-4">Rate (₹/kg)</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">Loading recycling logs...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">No recycling logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            log.type === "GENERATED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {log.type === "GENERATED" ? "⚠️ Wastage Generated" : "💰 Scrap Sold"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {log.type === "GENERATED"
                          ? log.rawMaterialId?.name || "Production Batch"
                          : log.buyerName || "Direct Sale"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {log.quantityKg} kg
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {log.type === "SOLD" ? `₹${log.ratePerKg || 0}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {log.type === "SOLD" ? `₹${(log.totalAmount || 0).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                        {log.notes || log.paymentRef ? `${log.notes || ""} ${log.paymentRef ? `(Ref: ${log.paymentRef})` : ""}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sell Scrap Modal */}
        <Modal
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          title="Sell Scrap / Wastage"
        >
          <form onSubmit={handleSellSubmit} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
              Current Available Scrap Stock: <strong className="text-emerald-900 font-bold">{summary.currentScrapStockKg} kg</strong>.
              Sale revenue will be automatically recorded in Finance Ledger.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity to Sell (kg) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 60"
                max={summary.currentScrapStockKg}
                value={sellForm.quantityKg}
                onChange={(e) => setSellForm({ ...sellForm, quantityKg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rate per kg (₹/kg) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 15"
                value={sellForm.ratePerKg}
                onChange={(e) => setSellForm({ ...sellForm, ratePerKg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Calculated Revenue:</span>
              <span className="text-emerald-700 text-base">₹{totalCalculatedRevenue.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer / Scrap Dealer Name</label>
              <input
                type="text"
                placeholder="e.g. Unique Scrap Traders"
                value={sellForm.buyerName}
                onChange={(e) => setSellForm({ ...sellForm, buyerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Reference / Mode</label>
              <input
                type="text"
                placeholder="e.g. UPI Ref / Cash / Invoice #"
                value={sellForm.paymentRef}
                onChange={(e) => setSellForm({ ...sellForm, paymentRef: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes..."
                value={sellForm.notes}
                onChange={(e) => setSellForm({ ...sellForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowSellModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingSell} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submittingSell ? "Processing..." : "Confirm & Save Revenue"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Recycling;
