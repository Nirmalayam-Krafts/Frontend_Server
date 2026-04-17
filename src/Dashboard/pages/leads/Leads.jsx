import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  Pagination,
} from "../../components/ui";
import { LeadForm } from "../../components/forms";
import { useUIStore } from "../../store";
import { leadsAPI } from "../../services/api";
import {
  Plus,
  Download,
  X,
  Search,
  Building2,
  Package,
  Phone,
  Mail,
  CalendarDays,
  TrendingUp,
  Users,
  Filter,
  StickyNote,
  MessageCircle,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  Ruler,
  Palette,
  Wallet,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { usegetAllLeads } from "../../../../hook/leads";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useGetInventory } from "../../../../hook/inventory";
import { useGetAllProducts } from "../../../../hook/Product";

const FOLLOWUP_FLOW = [
  { key: "first_followup", label: "First Follow-up", order: 1 },
  { key: "second_followup", label: "Second Follow-up", order: 2 },
  { key: "third_followup", label: "Third Follow-up", order: 3 },
];

const initialOrderForm = {
  selectedProductId: "",
  bagSize: "",
  color: "",
  quantity: "",
  length: "",
  width: "",
  height: "",
  dimensionUnit: "inch",
  notes: "",
};

const BAG_SIZE_OPTIONS = ["Small", "Medium", "Large", "Extra Large"];

const COLOR_OPTIONS_BY_SIZE = {
  Small: ["Brown", "White", "Black"],
  Medium: ["Brown", "White", "Black", "Green", "Blue"],
  Large: ["Brown", "White", "Black", "Green", "Blue", "Red"],
  "Extra Large": ["Brown", "White", "Black", "Green", "Blue", "Red", "Gray"],
};

const COLOR_PREVIEW_CLASSES = {
  Brown: "bg-amber-700",
  White: "bg-white border border-gray-300",
  Black: "bg-black",
  Green: "bg-emerald-600",
  Blue: "bg-blue-600",
  Red: "bg-red-600",
  Gray: "bg-gray-500",
};

const Leads = () => {
  const { data, isLoading, refetch } = usegetAllLeads();
  const { data: inventoryData } = useGetInventory();
  const { data: productsData } = useGetAllProducts();
  const showNotification = useUIStore((state) => state.showNotification);
  const queryClient = useQueryClient();
  const { axiosInstance } = useAuthContext();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // NEW STATES
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [orderForm, setOrderForm] = useState(initialOrderForm);

  const itemsPerPage = 5;
  const rawLeads = data?.leads || [];
  const inventoryItems = useMemo(() => {
    if (Array.isArray(inventoryData)) return inventoryData;
    if (Array.isArray(inventoryData?.items)) return inventoryData.items;
    if (Array.isArray(inventoryData?.inventory)) return inventoryData.inventory;
    if (Array.isArray(inventoryData?.products)) return inventoryData.products;
    if (Array.isArray(inventoryData?.data)) return inventoryData.data;
    return [];
  }, [inventoryData]);
  const productItems = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);

  const formattedLeads = useMemo(() => {
    return rawLeads.map((lead) => {
      const followupHistory = lead.followupHistory || [];
      const completedFollowups = followupHistory.filter((item) => item.done).length;

      return {
        id: lead._id,
        name: lead.name || "Unknown",
        businessName: lead.business_name || "—",
        phone: lead.phone || "—",
        email: lead.email || "—",
        productInterest: lead.product_category || "—",
        productId:
          lead.productId ||
          lead.product_id ||
          lead?.product?._id ||
          lead?.product?.id ||
          "",
        quantity: lead.quantity || "—",
        source: lead.source || "—",
        status: (lead.status || "New").toUpperCase(),
        statusLabel: lead.status || "New",
        date: new Date(lead.createdAt).toLocaleDateString(),
        fullDate: lead.createdAt,
        notes: lead.notes || [],
        followupHistory,
        completedFollowups,
        avatar: (lead.name || "U")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      };
    });
  }, [rawLeads]);

  const filteredLeads = useMemo(() => {
    return formattedLeads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || lead.statusLabel === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [formattedLeads, search, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    NEW: "success",
    CONTACTED: "warning",
    INTERESTED: "info",
    CONVERTED: "secondary",
    LOST: "error",
  };

  const contactedLeadsCount = formattedLeads.filter(
    (lead) => lead.status === "CONTACTED"
  ).length;
  const convertedLeadsCount = formattedLeads.filter(
    (l) => l.status === "CONVERTED"
  ).length;

  const totalLeads = formattedLeads.length;

  const conversionRate = totalLeads
    ? ((convertedLeadsCount / totalLeads) * 100).toFixed(1)
    : "0.0";

  const handleAddLead = async (formData) => {
    try {
      const response = await axiosInstance.post("/leads", { payload: formData });
      if (response.data.success) {
        setShowModal(false);
        showNotification("Lead added successfully", "success");
        refetch();
      }
    } catch (error) {
      console.error("Add Lead Error:", error);
      showNotification("Failed to add lead", "error");
    }
  };

  const handleUpdateLead = async (formData) => {
    try {
      // Backend LeadService typically expects updates via specific status endpoints or generic updates.
      // Assuming a generic update endpoint exists or status update is sufficient.
      const response = await axiosInstance.patch(`/leads/${editingLead.id}`, { payload: formData });
      if (response.data.success) {
        setShowModal(false);
        setEditingLead(null);
        showNotification("Lead updated successfully", "success");
        refetch();
      }
    } catch (error) {
       console.error("Update Lead Error:", error);
      showNotification("Failed to update lead", "error");
    }
  };

  const resetConvertModal = () => {
    setShowConvertModal(false);
    setLeadToConvert(null);
    setOrderForm(initialOrderForm);
  };

  const openConvertModal = (lead) => {
    const preResolvedProductId = resolveProductIdForLead(lead, initialOrderForm);
    setLeadToConvert(lead);
    setOrderForm({
      ...initialOrderForm,
      selectedProductId: preResolvedProductId || "",
      quantity:
        lead?.quantity && lead.quantity !== "—" ? String(lead.quantity) : "",
    });
    setShowConvertModal(true);
  };

  const handleOrderFormChange = (field, value) => {
    setOrderForm((prev) => {
      if (field === "bagSize") {
        const nextColorOptions = COLOR_OPTIONS_BY_SIZE[value] || [];
        const currentColorIsValid = nextColorOptions.includes(prev.color);
        return {
          ...prev,
          bagSize: value,
          color: currentColorIsValid ? prev.color : "",
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleUpdateLeadStatus = async (id, status, leadData = null) => {
    if (status === "Converted") {
      const currentLead =
        leadData || formattedLeads.find((item) => item.id === id) || null;
      openConvertModal(currentLead);
      return;
    }

    const loadingToast = toast.loading("Updating lead status...");

    try {
      const payload = { status };

      await axiosInstance.patch(`/leads/${id}/status`, payload);

      toast.success("Lead status updated successfully 🎉", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllLeads"],
      });

      refetch();

      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) =>
          prev ? { ...prev, statusLabel: status, status: status.toUpperCase() } : prev
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update lead status",
        {
          id: loadingToast,
        }
      );
    }
  };

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const resolveProductIdForLead = (lead, form) => {
    const directLeadProductId = String(lead?.productId || "").trim();
    if (directLeadProductId) return directLeadProductId;

    const leadCategory = normalizeText(lead?.productInterest);
    if (!leadCategory) return "";

    const getProductId = (item) =>
      String(item?._id || item?.id || item?.productId || "").trim();

    const getItemName = (item) =>
      normalizeText(
        item?.productName ||
          item?.name ||
          item?.bagName ||
          item?.title ||
          item?.productCategory ||
          item?.category
      );

    const bagSize = normalizeText(form?.bagSize);
    const bagColor = normalizeText(form?.color);
    const categoryAliasTokens = Array.from(
      new Set(
        [
          leadCategory,
          leadCategory.replace(/\bbags?\b/g, "").trim(),
          leadCategory.includes("ecocraft") ? "ecocraft" : "",
          leadCategory.includes("f&b") || leadCategory.includes("gourmet")
            ? "f&b gourmet"
            : "",
          leadCategory.includes("luxury") ? "luxury" : "",
          leadCategory.includes("food") ? "food" : "",
        ].filter(Boolean)
      )
    );

    const productMatch = productItems.find((product) => {
      const searchable = normalizeText(
        [
          product?.name,
          product?.category,
          product?.bagType,
          product?.sku,
          product?.title,
        ]
          .filter(Boolean)
          .join(" ")
      );
      return categoryAliasTokens.some(
        (token) => searchable.includes(token) || token.includes(searchable)
      );
    });
    if (productMatch) return getProductId(productMatch);

    const categoryMatches = inventoryItems.filter((item) => {
      const name = getItemName(item);
      return categoryAliasTokens.some(
        (token) => name === token || name.includes(token) || token.includes(name)
      );
    });

    const exactSpecMatch = categoryMatches.find((item) => {
      const itemSize = normalizeText(item?.bagSizeLabel || item?.bagSize);
      const itemColor = normalizeText(item?.bagColor || item?.color);
      return (
        (!bagSize || !itemSize || bagSize === itemSize) &&
        (!bagColor || !itemColor || bagColor === itemColor)
      );
    });

    const fallbackMatch = exactSpecMatch || categoryMatches[0];
    return fallbackMatch ? String(fallbackMatch?.productId || "").trim() : "";
  };

  const handleConvertLeadToOrder = async (e) => {
    e.preventDefault();

    if (!leadToConvert) {
      showNotification("Lead not found", "error");
      return;
    }

    if (
      !orderForm.selectedProductId ||
      !orderForm.bagSize ||
      !orderForm.color ||
      !orderForm.quantity ||
      !orderForm.length ||
      !orderForm.width ||
      !orderForm.height
    ) {
      showNotification("Please fill all required order details", "error");
      return;
    }

    const loadingToast = toast.loading("Converting lead into order...");

    try {
      const resolvedProductId =
        String(orderForm.selectedProductId || "").trim() ||
        resolveProductIdForLead(leadToConvert, orderForm);
      if (!resolvedProductId) {
        toast.error(
          "Unable to match a valid product for this lead. Please update product mapping and try again.",
          { id: loadingToast }
        );
        return;
      }

      const orderPayload = {
        leadId: leadToConvert.id,
        customerName: leadToConvert.name,
        businessName: leadToConvert.businessName,
        phone: leadToConvert.phone,
        email: leadToConvert.email,
        productCategory: leadToConvert.productInterest,
        source: leadToConvert.source,

        orderDetails: {
          productId: resolvedProductId,
          bagSize: orderForm.bagSize,
          color: orderForm.color,
          quantity: Number(orderForm.quantity),
          dimensions: {
            length: Number(orderForm.length),
            width: Number(orderForm.width),
            height: Number(orderForm.height),
            unit: orderForm.dimensionUnit,
          },
        },

        payment: { paymentType: "partial", partialPaidAmount: 0 },

        notes: orderForm.notes,
      };

      const data = await axiosInstance.post(`/order/create`, orderPayload);
     
      await axiosInstance.patch(`/leads/${leadToConvert.id}/status`, {
        status: "Converted",
      });

      toast.success("Lead converted to order successfully 🎉", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllLeads"],
      });

      await refetch();

      if (selectedLead && selectedLead.id === leadToConvert.id) {
        setSelectedLead((prev) =>
          prev
            ? {
              ...prev,
              statusLabel: "Converted",
              status: "CONVERTED",
            }
            : prev
        );
      }

      resetConvertModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to convert lead to order",
        {
          id: loadingToast,
        }
      );
    }
  };

  const handleDeleteLead = async (id) => {
    const loadingToast = toast.loading("Deleting lead...");
    try {
      const response = await axiosInstance.delete(`/leads/${id}`);
      if (response.data.success) {
        toast.success("Lead deleted successfully", { id: loadingToast });
        refetch();

        if (selectedLead?.id === id) {
          setSelectedLead(null);
          setShowDetailPanel(false);
        }
      }
    } catch (error) {
       toast.error(error?.response?.data?.message || "Failed to delete lead", { id: loadingToast });
    }
  };

  const handleExportCSV = () => {
    if (!formattedLeads.length) {
      showNotification("No leads available to export", "error");
      return;
    }

    const headers = [
      "Name",
      "Business Name",
      "Phone",
      "Email",
      "Product Category",
      "Quantity",
      "Source",
      "Status",
      "Follow-ups Done",
      "Created At",
    ];

    const rows = formattedLeads.map((lead) => [
      `"${lead.name || ""}"`,
      `"${lead.businessName || ""}"`,
      `"${lead.phone || ""}"`,
      `"${lead.email || ""}"`,
      `"${lead.productInterest || ""}"`,
      `"${lead.quantity || ""}"`,
      `"${lead.source || ""}"`,
      `"${lead.statusLabel || ""}"`,
      `"${lead.completedFollowups || 0}/3"`,
      `"${lead.date || ""}"`,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    showNotification("CSV exported successfully", "success");
  };

  const handleAddNote = async () => {
    if (!selectedLead || !noteInput.trim()) {
      showNotification("Please write a note first", "error");
      return;
    }

    const loadingToast = toast.loading("Adding note...");

    try {
      const response = await axiosInstance.post(
        `/leads/${selectedLead.id}/notes`,
        {
          text: noteInput.trim(),
        }
      );

      const updatedLead = response?.data?.data;

      toast.success("Note added successfully 🎉", {
        id: loadingToast,
      });

      setNoteInput("");

      queryClient.invalidateQueries({
        queryKey: ["getAllLeads"],
      });

      await refetch();

      if (updatedLead) {
        setSelectedLead((prev) =>
          prev
            ? {
              ...prev,
              notes: updatedLead.notes || [],
            }
            : prev
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add note",
        { id: loadingToast }
      );
    }
  };

  const handleMarkFollowup = async (flowKey) => {
    if (!selectedLead) return;

    const loadingToast = toast.loading("Updating follow-up...");

    try {
      const response = await axiosInstance.patch(
        `/leads/${selectedLead.id}/updateFloww`,
        {
          followupKey: flowKey,
        }
      );

      const updatedLead = response?.data?.data;

      toast.success("Follow-up updated successfully 🎉", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllLeads"],
      });

      await refetch();

      if (updatedLead) {
        const updatedFollowupHistory = updatedLead.followupHistory || [];
        const completedFollowups = updatedFollowupHistory.filter((item) => item.done).length;

        setSelectedLead((prev) =>
          prev
            ? {
              ...prev,
              followupHistory: updatedFollowupHistory,
              completedFollowups,
            }
            : prev
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update follow-up",
        { id: loadingToast }
      );
    }
  };

  const getFlowStatus = (lead, flowKey) => {
    const item = (lead?.followupHistory || []).find((f) => f.key === flowKey);
    return item || null;
  };

  const colorOptionsForSelectedSize =
    COLOR_OPTIONS_BY_SIZE[orderForm.bagSize] || [];
  const productSelectOptions = useMemo(() => {
    return productItems.map((item) => ({
      id: String(item?._id || item?.id || item?.productId || "").trim(),
      label:
        item?.name ||
        item?.title ||
        item?.productName ||
        item?.sku ||
        "Unnamed Product",
      sku: item?.sku || "",
    }));
  }, [productItems]);

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Leads Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                Manage and track high-intent B2B enquiries for eco-friendly packaging
                with cleaner lead pipeline, WhatsApp-ready contact access, and follow-up tracking.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>

              <Button
                icon={Plus}
                onClick={() => {
                  setEditingLead(null);
                  setShowModal(true);
                }}
              >
                Add New Lead
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
                  Total Leads
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formattedLeads.length}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Conversion Rate
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {conversionRate}%
                </p>
                <p className="mt-2 text-xs text-green-600">
                  Based on converted leads
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Contacted
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {contactedLeadsCount}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Phone className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Converted
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {convertedLeadsCount}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Filter className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]"
        >
          <Input
            placeholder="Search by lead name, business, email, or phone..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {["All", "New", "Contacted", "Interested", "Converted", "Lost"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${statusFilter === status
                    ? "bg-emerald-600 text-white shadow"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Lead Pipeline
                </h2>
                <p className="text-sm text-gray-500">
                  Showing {paginatedLeads.length} of {filteredLeads.length} leads
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
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Lead
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Business
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Source
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Follow-up
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              {lead.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {lead.name}
                              </p>

                              <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                                <p className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {lead.email}
                                </p>

                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {lead.phone}
                                  </span>

                                  {lead.phone !== "—" && (
                                    <a
                                      href={`https://wa.me/${String(lead.phone).replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center rounded-full bg-green-100 p-1.5 text-green-700 transition hover:bg-green-200"
                                      title="Chat on WhatsApp"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {lead.businessName}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            {lead.productInterest}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {lead.source}
                        </td>

                        <td className="px-4 py-4">
                          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {lead.completedFollowups}/3 completed
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={lead.statusLabel}
                            onChange={(e) =>
                              handleUpdateLeadStatus(lead.id, e.target.value, lead)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {lead.date}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const fullLead = formattedLeads.find(
                                  (item) => item.id === lead.id
                                );
                                setSelectedLead(fullLead || lead);
                                setShowDetailPanel(true);
                                setNoteInput("");
                              }}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!paginatedLeads.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No leads found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </motion.div>

        <Modal
          isOpen={showModal}
          title={editingLead ? "Edit Lead" : "Add New Lead"}
          onClose={() => {
            setShowModal(false);
            setEditingLead(null);
          }}
        >
          <LeadForm
            initialData={editingLead}
            onSubmit={editingLead ? handleUpdateLead : handleAddLead}
          />
        </Modal>

        {/* NEW ORDER CONVERSION MODAL */}
 <Modal
  isOpen={showConvertModal}
  title="Convert Lead to Order"
  onClose={resetConvertModal}
>
  <div className="w-full max-w-5xl">
    <form onSubmit={handleConvertLeadToOrder} className="space-y-6">
      {/* Header / Lead Summary */}
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 shadow-sm">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order Conversion Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                Fill all bag specification, dimensions, and payment details to
                convert this lead into an order in a clean and structured way.
              </p>
            </div>
          </div>

          {leadToConvert && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Lead Name
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {leadToConvert.name}
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Business
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {leadToConvert.businessName}
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Source
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {leadToConvert.source || "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-start">
        {/* Left Form Area */}
        <div className="space-y-6 xl:col-span-2">
          {/* Bag Details */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <h4 className="text-base font-bold text-gray-900">Bag Details</h4>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={orderForm.selectedProductId}
                  onChange={(e) =>
                    handleOrderFormChange("selectedProductId", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  required
                >
                  <option value="">Select product</option>
                  {productSelectOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.label}
                      {product.sku ? ` (${product.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bag Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShoppingBag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={orderForm.bagSize}
                    onChange={(e) =>
                      handleOrderFormChange("bagSize", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  >
                    <option value="">Select bag size</option>
                    {BAG_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bag Color <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Palette className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={orderForm.color}
                    onChange={(e) =>
                      handleOrderFormChange("color", e.target.value)
                    }
                    disabled={!orderForm.bagSize}
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      {orderForm.bagSize
                        ? "Select bag color"
                        : "Select bag size first"}
                    </option>
                    {colorOptionsForSelectedSize.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                {orderForm.color ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                    <span
                      className={`h-3.5 w-3.5 rounded-full ${COLOR_PREVIEW_CLASSES[orderForm.color] || "bg-gray-300"}`}
                    />
                    Selected: {orderForm.color}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      handleOrderFormChange("quantity", e.target.value)
                    }
                    placeholder="Enter quantity"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Dimension Unit
                </label>
                <select
                  value={orderForm.dimensionUnit}
                  onChange={(e) =>
                    handleOrderFormChange("dimensionUnit", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                >
                  <option value="inch">Inch</option>
                  <option value="cm">CM</option>
                  <option value="mm">MM</option>
                  <option value="ft">Feet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-emerald-600" />
              <h4 className="text-base font-bold text-gray-900">Bag Dimensions</h4>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Length <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={orderForm.length}
                  onChange={(e) =>
                    handleOrderFormChange("length", e.target.value)
                  }
                  placeholder="Length"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Width <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={orderForm.width}
                  onChange={(e) =>
                    handleOrderFormChange("width", e.target.value)
                  }
                  placeholder="Width"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Height <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={orderForm.height}
                  onChange={(e) =>
                    handleOrderFormChange("height", e.target.value)
                  }
                  placeholder="Height"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileText className="h-4 w-4 text-emerald-600" />
              Extra Notes
            </label>
            <textarea
              rows={5}
              value={orderForm.notes}
              onChange={(e) => handleOrderFormChange("notes", e.target.value)}
              placeholder="Write order note, design details, customer requirements, delivery notes, etc."
              className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
        </div>
      </div>

          {/* Order Preview */}
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <h4 className="text-base font-bold text-emerald-800">
              Live Order Preview
            </h4>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-600">Bag Size</span>
                <span className="font-semibold text-gray-900">
                  {orderForm.bagSize || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-600">Color</span>
                <span className="font-semibold text-gray-900">
                  {orderForm.color || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold text-gray-900">
                  {orderForm.quantity || "—"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-600">Dimensions</span>
                <span className="text-right font-semibold text-gray-900">
                  {orderForm.length || "0"} × {orderForm.width || "0"} ×{" "}
                  {orderForm.height || "0"} {orderForm.dimensionUnit}
                </span>
              </div>

            <div className="h-px bg-emerald-100" />

            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600 font-bold">Total Quote Items</span>
              <span className="font-bold text-emerald-700">
                {orderForm.quantity || "—"} Units
              </span>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={resetConvertModal}
          className="sm:min-w-[140px]"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="bg-emerald-600 px-6 hover:bg-emerald-700 sm:min-w-[200px]"
        >
          Convert & Create Order
        </Button>
      </div>
    </form>
  </div>
</Modal>

        {showDetailPanel && selectedLead && (
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
                  <h2 className="text-xl font-bold text-gray-900">Lead Detail</h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {selectedLead.avatar}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedLead.name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedLead.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Phone / WhatsApp
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedLead.phone}
                      </p>
                    </div>

                    {selectedLead.phone !== "—" && (
                      <a
                        href={`https://wa.me/${String(selectedLead.phone).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Business
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.businessName}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Product Interest
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.productInterest}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Quantity
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.quantity}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Source
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.source}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Status
                    </p>
                    <div className="mt-2">
                      <Badge variant={statusColors[selectedLead.status] || "primary"}>
                        {selectedLead.statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Created On
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.date}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-emerald-600" />
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Follow-up Check-ins
                        </p>
                      </div>

                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {selectedLead.completedFollowups || 0}/3 done
                      </div>
                    </div>

                    <div className="space-y-3">
                      {FOLLOWUP_FLOW.map((flow) => {
                        const flowStatus = getFlowStatus(selectedLead, flow.key);
                        const isDone = !!flowStatus?.done;

                        return (
                          <div
                            key={flow.key}
                            className={`rounded-2xl border p-4 transition ${isDone
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-gray-200 bg-white"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  {isDone ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  ) : (
                                    <Clock3 className="h-5 w-5 text-amber-500" />
                                  )}
                                  <p className="font-semibold text-gray-900">
                                    {flow.label}
                                  </p>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                  {isDone
                                    ? `Completed on ${new Date(flowStatus.updatedAt).toLocaleString()}`
                                    : "Pending follow-up"}
                                </p>
                              </div>

                              <Button
                                onClick={() => handleMarkFollowup(flow.key)}
                                disabled={isDone}
                                className={`${isDone
                                    ? "cursor-not-allowed bg-gray-300"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                  }`}
                              >
                                {isDone ? "Completed" : "Mark Done"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Notes
                      </p>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        rows={3}
                        placeholder="Write a note for this lead..."
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
                      />

                      <Button onClick={handleAddNote} className="w-full bg-green-700">
                        Add Note
                      </Button>

                      <div className="space-y-2 pt-1">
                        {(selectedLead?.notes || []).length > 0 ? (
                          selectedLead.notes
                            .slice()
                            .reverse()
                            .map((note) => (
                              <div
                                key={note._id}
                                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm text-gray-800">{note.text}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {new Date(note.at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-500">No notes added yet.</p>
                        )}
                      </div>
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
                      setEditingLead(selectedLead);
                      setShowModal(true);
                      setShowDetailPanel(false);
                    }}
                  >
                    Edit
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

export default Leads;