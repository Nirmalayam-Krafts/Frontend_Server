import React, { useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";
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

import {
  Plus,
  Download,
  FileSpreadsheet,
  Upload,
  X,
  Search,
  Building2,
  Package,
  Phone,
  Mail,
  CalendarDays,
  TrendingUp,
  History,
  Users,
  Filter,
  StickyNote,
  MessageCircle,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  Ruler,
  Wallet,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { usegetAllLeads } from "../../../../hook/leads";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/Adminauth";
import { useGetInventory } from "../../../../hook/inventory";
import { useGetAllProducts } from "../../../../hook/Product";
import { exportToExcel } from "../../utils";
import { INDIAN_STATES, GSTIN_REGEX } from "../../utils/gstStates";

const FOLLOWUP_FLOW = [
  { key: "first_followup", label: "First Follow-up", order: 1, dayLabel: "Day 1" },
  { key: "second_followup", label: "Second Follow-up", order: 2, dayLabel: "Day 3" },
  { key: "third_followup", label: "Third Follow-up", order: 3, dayLabel: "Day 7" },
];

const emptyOrderLine = () => ({
  id: Date.now() + Math.random(),
  selectedProductId: "",
  quantity: "",
  unit: "pcs",
  gsm: "",
  bf: "",
  width: "",
  length: "",
  height: "",
  dimensionUnit: "inch",
  color: "",
  bagSize: "",
  customPrinting: false,
  brandingText: "",
  logo: "",
  logoName: "",
  calculationMode: "auto",
  convertedQuantity: "",
  specsExpanded: true,
});

const initialOrderForm = {
  orderLines: [emptyOrderLine()],
  notes: "",
};


const getStatusSelectClass = (status) => {
  switch (String(status).toLowerCase()) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-400";
    case "contacted":
      return "bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-400 font-semibold";
    case "interested":
      return "bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-400 font-semibold";
    case "converted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-400 font-bold";
    case "completed":
      return "bg-teal-50 text-teal-700 border-teal-200 focus:border-teal-400 font-bold";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-400 font-bold";
    case "lost":
      return "bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-400 font-semibold";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 focus:border-emerald-500";
  }
};

const Leads = () => {
  const [showDeleted, setShowDeleted] = useState(false);
  const { data, isLoading, refetch } = usegetAllLeads({ showDeleted });
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
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // NEW STATES
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [statusChangeReason, setStatusChangeReason] = useState("");

  const itemsPerPage = 10;
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
        duplicateExists: Boolean(lead.duplicateExists),
        date: new Date(lead.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        fullDate: lead.createdAt,
        notes: lead.notes || [],
        statusHistory: lead.statusHistory || [],
        followupHistory,
        completedFollowups,
        subcategory: lead.subcategory || "—",
        comments: lead.comments || "—",
        requirement: lead.requirement || "—",
        avatar: (lead.name || "U")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      };
    });
  }, [rawLeads]);

  const getFollowupSourceLabel = (flowStatus) => {
    if (!flowStatus?.done) return "";
    if (flowStatus?.source === "worker") return "Auto Worker";
    if (flowStatus?.source === "manual") return "Manual";
    return "Completed";
  };

  const getFollowupChannelLabel = (flowStatus) => {
    if (flowStatus?.channel === "whatsapp") return "WhatsApp";
    if (flowStatus?.channel === "dashboard") return "Dashboard";
    return "";
  };

  const filteredLeads = useMemo(() => {
    return formattedLeads.filter((lead) => {
      const matchesSearch =
        String(lead.name).toLowerCase().includes(search.toLowerCase()) ||
        String(lead.businessName).toLowerCase().includes(search.toLowerCase()) ||
        String(lead.email).toLowerCase().includes(search.toLowerCase()) ||
        String(lead.phone).toLowerCase().includes(search.toLowerCase());

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
    COMPLETED: "success",
    DELIVERED: "success",
    LOST: "error",
  };

  // Get color based on lead age
  const getLeadAgeColor = (fullDate) => {
    const now = new Date();
    const leadDate = new Date(fullDate);
    const daysOld = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));

    if (daysOld <= 2) {
      return "bg-green-50 border-l-4 border-green-500"; // Fresh - Green
    } else if (daysOld <= 7) {
      return "bg-yellow-50 border-l-4 border-yellow-500"; // Recent - Yellow
    } else if (daysOld <= 30) {
      return "bg-orange-50 border-l-4 border-orange-500"; // Moderate - Orange
    } else {
      return "bg-red-50 border-l-4 border-red-500"; // Old - Red
    }
  };

  const contactedLeadsCount = formattedLeads.filter(
    (lead) => lead.status === "CONTACTED"
  ).length;
  const convertedLeadsCount = formattedLeads.filter(
    (l) => ["CONVERTED", "COMPLETED", "DELIVERED"].includes(l.status)
  ).length;

  const totalLeads = formattedLeads.length;

  const conversionRate = totalLeads
    ? ((convertedLeadsCount / totalLeads) * 100).toFixed(1)
    : "0.0";

  const handleAddLead = async (formData) => {
    try {
      const payload = { ...formData, source: "Manual" };
      const response = await axiosInstance.post("/leads", { payload });
      if (response.data.success) {
        setShowModal(false);
        showNotification("Lead added successfully", "success");
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
      }
    } catch (error) {
      console.error("Add Lead Error:", error);
      showNotification("Failed to add lead", "error");
    }
  };

  const handleUpdateLead = async (formData) => {
    try {
      const leadId = editingLead?.id || editingLead?._id;
      if (!leadId) {
        showNotification("Error: Could not determine lead ID for update", "error");
        return;
      }
      const response = await axiosInstance.patch(`/leads/${leadId}`, { payload: formData });
      if (response.data.success) {
        setShowModal(false);
        setEditingLead(null);
        showNotification("Lead updated successfully", "success");
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
      }
    } catch (error) {
      console.error("Update Lead Error:", error);
      showNotification(error?.response?.data?.message || "Failed to update lead", "error");
    }
  };

  const resetConvertModal = () => {
    setShowConvertModal(false);
    setLeadToConvert(null);
    setOrderForm(initialOrderForm);
    setStatusChangeReason("");
  };

  const openConvertModal = (lead) => {
    const preResolvedProductId = resolveProductIdForLead(lead, {});
    const prod = productItems.find(
      (p) => String(p?._id || p?.id || p?.productId || "").trim() === preResolvedProductId
    );
    const isRollCat = prod?.category?.toLowerCase().includes("roll") || lead?.productInterest?.toLowerCase().includes("roll");
    const firstLine = {
      ...emptyOrderLine(),
      id: Date.now(),
      selectedProductId: preResolvedProductId || "",
      quantity: lead?.quantity && lead.quantity !== "—" ? String(lead.quantity) : "",
      length: prod?.dimensions?.length || "",
      width: prod?.dimensions?.width || "",
      height: prod?.dimensions?.height || "",
      dimensionUnit: prod?.dimensions?.unit || "inch",
      gsm: prod?.gsm || "",
      bf: prod?.bf ? String(prod.bf) : "",
      color: prod?.color || "",
      bagSize: prod?.bagSize || "",
      customPrinting: prod?.customPrinting || false,
      unit: isRollCat ? "kg" : "pcs",
      specsExpanded: true,
    };
    setLeadToConvert(lead);
    setOrderForm({
      orderLines: [firstLine],
      notes: "",
      gstNumber: lead?.gstNumber || "",
      stateName: lead?.stateName || "",
      stateCode: lead?.stateCode || "",
      address: lead?.address || "",
    });
    setShowConvertModal(true);
  };


  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload PNG, JPEG, JPG, WEBP, or PDF.");
      return;
    }

    const loadingToast = toast.loading("Uploading logo...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          fileName: file.name,
          fileData: reader.result,
        };
        const response = await axiosInstance.post("/upload-logo", payload);
        if (response.data?.success) {
          toast.success("Logo uploaded successfully 🎉", { id: loadingToast });
          handleOrderFormChange("logo", response.data.url);
          handleOrderFormChange("logoName", file.name);
        } else {
          toast.error("Failed to upload logo", { id: loadingToast });
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to upload logo", { id: loadingToast });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOrderFormChange = (field, value) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (lineId, field, value) => {
    setOrderForm((prev) => ({
      ...prev,
      orderLines: prev.orderLines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    }));
  };

  const addOrderLine = () => {
    setOrderForm((prev) => ({
      ...prev,
      orderLines: [...prev.orderLines, emptyOrderLine()],
    }));
  };

  const removeOrderLine = (lineId) => {
    setOrderForm((prev) => ({
      ...prev,
      orderLines: prev.orderLines.filter((l) => l.id !== lineId),
    }));
  };

  const toggleLineSpecs = (lineId) => {
    setOrderForm((prev) => ({
      ...prev,
      orderLines: prev.orderLines.map((line) =>
        line.id === lineId ? { ...line, specsExpanded: !line.specsExpanded } : line
      ),
    }));
  };

  const applyProductToLine = (lineId, prodId) => {
    const prod = productItems.find(
      (p) => String(p?._id || p?.id || p?.productId || "").trim() === prodId
    );
    const isRollCat = prod?.category?.toLowerCase().includes("roll");
    setOrderForm((prev) => ({
      ...prev,
      orderLines: prev.orderLines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              selectedProductId: prodId,
              length: prod?.dimensions?.length || "",
              width: prod?.dimensions?.width || "",
              height: prod?.dimensions?.height || "",
              dimensionUnit: prod?.dimensions?.unit || "inch",
              gsm: prod?.gsm || "",
              bf: prod?.bf ? String(prod.bf) : "",
              color: prod?.bagColor || prod?.color || "",
              bagSize: prod?.bagSize || "",
              customPrinting: prod?.customPrinting || false,
              unit: isRollCat ? "kg" : "pcs",
              calculationMode: "auto",
              convertedQuantity: "",
              specsExpanded: true,
            }
          : line
      ),
    }));
  };



  const handleUpdateLeadStatus = async (id, status, leadData = null) => {
    if (status === "Completed" || status === "Delivered") {
      toast.error("Completed and Delivered statuses are updated automatically by the order workflow.");
      return;
    }

    const currentLead =
      leadData || formattedLeads.find((item) => item.id === id) || null;

    const oldStatus = currentLead?.statusLabel || "New";
    const statusOrder = {
      "New": 1,
      "Contacted": 2,
      "Interested": 3,
      "Converted": 4,
      "Completed": 5,
      "Delivered": 6,
      "Lost": 7
    };

    const isLockedStatus = ["Converted", "Completed", "Delivered"].includes(oldStatus);
    const isMovingBackwards = (statusOrder[status] || 0) < (statusOrder[oldStatus] || 0);

    let reason = "";
    if (isLockedStatus || isMovingBackwards) {
      const confirmChange = window.confirm(`Warning: You are modifying a finalized lead or changing status backward from "${oldStatus}" to "${status}". Are you sure you want to proceed?`);
      if (!confirmChange) {
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
        return;
      }
      const userReason = window.prompt(`Please enter the reason for changing status from "${oldStatus}" to "${status}":`);
      if (userReason === null) {
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
        return;
      }
      if (!userReason.trim()) {
        toast.error("Reason is required to change lead status backward or modify a finalized lead.");
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
        return;
      }
      reason = userReason.trim();
    }

    if (status === "Converted") {
      setStatusChangeReason(reason);
      openConvertModal(currentLead);
      return;
    }

    const loadingToast = toast.loading("Updating lead status...");

    try {
      const payload = { status, reason };

      const response = await axiosInstance.patch(`/leads/${id}/status`, payload);
      const updatedLead = response?.data?.data;

      toast.success("Lead status updated successfully 🎉", {
        id: loadingToast,
      });

      await queryClient.invalidateQueries({
        queryKey: ["getAllLeadsData"],
      });

      await refetch();

      if (updatedLead) {
        const formattedUpdated = {
          id: updatedLead._id,
          name: updatedLead.name || "Unknown",
          businessName: updatedLead.business_name || "—",
          phone: updatedLead.phone || "—",
          email: updatedLead.email || "—",
          productInterest: updatedLead.product_category || "—",
          productId: updatedLead.productId || "",
          quantity: updatedLead.quantity || "—",
          source: updatedLead.source || "—",
          status: (updatedLead.status || "New").toUpperCase(),
          statusLabel: updatedLead.status || "New",
          duplicateExists: Boolean(updatedLead.duplicateExists),
          date: new Date(updatedLead.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }),
          fullDate: updatedLead.createdAt,
          notes: updatedLead.notes || [],
          statusHistory: updatedLead.statusHistory || [],
          followupHistory: updatedLead.followupHistory || [],
          completedFollowups: (updatedLead.followupHistory || []).filter((item) => item.done).length,
          subcategory: updatedLead.subcategory || "—",
          comments: updatedLead.comments || "—",
          requirement: updatedLead.requirement || "—",
          avatar: (updatedLead.name || "U").charAt(0).toUpperCase(),
        };

        setSelectedLead(formattedUpdated);
        setShowDetailPanel(true);
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
    const categoryAliasTokens = Array.from(
      new Set(
        [
          leadCategory,
          leadCategory.replace(/\bbags?\b/g, "").trim(),
          leadCategory.includes("ecocraft") || leadCategory.includes("ecokraft") ? "ecokraft" : "",
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
      return !bagSize || !itemSize || bagSize === itemSize;
    });

    const fallbackMatch = exactSpecMatch || categoryMatches[0];
    return fallbackMatch ? String(fallbackMatch?.productId || "").trim() : "";
  };

  const handleConvertLeadToOrder = async (e) => {
    e.preventDefault();
    if (!leadToConvert) { showNotification("Lead not found", "error"); return; }

    const lines = orderForm.orderLines || [];
    if (lines.length === 0) { showNotification("Add at least one product", "error"); return; }

    for (const line of lines) {
      const prod = productItems.find(
        (p) => String(p?._id || p?.id || p?.productId || "").trim() === line.selectedProductId
      );
      const lineIsRoll = prod?.category?.toLowerCase().includes("roll");
      if (!line.selectedProductId || !line.quantity || !line.width || !line.gsm ||
        (!lineIsRoll && (!line.bagSize || !line.length || !line.height))) {
        showNotification("Please fill all required fields for every product line", "error");
        return;
      }
      if (line.customPrinting && !line.brandingText?.trim() && !line.logo?.trim()) {
        toast.error("Either Branding Text or Logo is required for custom printing.");
        return;
      }
    }

    const loadingToast = toast.loading("Converting lead into order...");
    try {
      const orderDetailsList = lines.map((line) => {
        const prod = productItems.find(
          (p) => String(p?._id || p?.id || p?.productId || "").trim() === line.selectedProductId
        );
        const lineIsRoll = prod?.category?.toLowerCase().includes("roll");
        return {
          productId: line.selectedProductId || resolveProductIdForLead(leadToConvert, line),
          bagSize: lineIsRoll ? undefined : line.bagSize,
          color: lineIsRoll ? undefined : line.color,
          quantity: Number(line.quantity),
          hsnCode: prod?.hsnCode || "",
          gstRate: prod?.gstRate ?? 18,
          gsm: line.gsm ? Number(line.gsm) : undefined,
          customPrinting: line.customPrinting || false,
          brandingText: line.customPrinting ? line.brandingText : undefined,
          logo: line.customPrinting ? line.logo : undefined,
          unit: line.unit || (lineIsRoll ? "kg" : "pcs"),
          calculationMode: line.calculationMode || "auto",
          convertedQuantity: line.convertedQuantity ? Number(line.convertedQuantity) : undefined,
          bf: lineIsRoll ? (line.bf ? Number(line.bf) : (prod?.bf ? Number(prod.bf) : undefined)) : undefined,
          dimensions: {
            length: lineIsRoll ? 0 : Number(line.length),
            width: Number(line.width),
            height: lineIsRoll ? 0 : Number(line.height),
            unit: line.dimensionUnit,
          },
        };
      });

    // Calculate total estimated order value including GST
    const estimatedOrderTotal = lines.reduce((sum, line) => {
      const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === String(line.selectedProductId).trim());
      const price = Number(line.pricePerUnit || line.unitPrice || prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0);
      const sub = Number(line.quantity || 0) * price;
      const taxRate = Number(prod?.gstRate ?? 18);
      return sum + (sub + sub * (taxRate / 100));
    }, 0);

    const isGstEntered = Boolean(orderForm.gstNumber && orderForm.gstNumber.trim().length > 0);
    const isHighValue = estimatedOrderTotal > 50000;
    const isAddressRequired = isGstEntered || isHighValue;

    if (isGstEntered) {
      const cleanGst = orderForm.gstNumber.trim().toUpperCase();
      if (!GSTIN_REGEX.test(cleanGst)) {
        toast.error("Invalid GSTIN format. Expected: 2-digit State + 10-char PAN + 1 Entity + 'Z' + 1 Checksum");
        return;
      }
    }

    if (isAddressRequired) {
      if (!orderForm.stateCode) {
        toast.error("State selection is required when GSTIN is provided or order exceeds ₹50,000");
        return;
      }
      if (!orderForm.address || !orderForm.address.trim()) {
        toast.error("Address is required when GSTIN is provided or order exceeds ₹50,000");
        return;
      }
    }

    const firstProd = productItems.find(
      (p) => String(p?._id || p?.id || p?.productId || "").trim() === lines[0].selectedProductId
    );

    const orderPayload = {
      leadId: leadToConvert.id,
      customerName: leadToConvert.name,
      businessName: leadToConvert.businessName,
      phone: leadToConvert.phone,
      email: leadToConvert.email,
      gstNumber: orderForm.gstNumber ? orderForm.gstNumber.trim().toUpperCase() : "",
      stateName: orderForm.stateName || "",
      stateCode: orderForm.stateCode || "",
      address: orderForm.address ? orderForm.address.trim() : "",
      productCategory: firstProd?.category || leadToConvert.productInterest,
      source: leadToConvert.source,
      orderDetails: orderDetailsList[0],
      orderDetailsList,
      payment: { paymentType: "partial", partialPaidAmount: 0 },
      notes: orderForm.notes,
    };

      await axiosInstance.post(`/order/create`, orderPayload);
      const response = await axiosInstance.patch(`/leads/${leadToConvert.id}/status`, {
        status: "Converted",
        reason: statusChangeReason
      });
      const updatedLead = response?.data?.data;

      toast.success("Lead converted to order successfully 🎉", { id: loadingToast });
      await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
      await refetch();

      if (updatedLead) {
        const formattedUpdated = {
          id: updatedLead._id,
          name: updatedLead.name || "Unknown",
          businessName: updatedLead.businessName || "—",
          phone: updatedLead.phone || "—",
          email: updatedLead.email || "—",
          productInterest: updatedLead.product_category || "—",
          productId: updatedLead.productId || "",
          quantity: updatedLead.quantity || "—",
          source: updatedLead.source || "—",
          status: (updatedLead.status || "New").toUpperCase(),
          statusLabel: updatedLead.status || "New",
          duplicateExists: Boolean(updatedLead.duplicateExists),
          date: new Date(updatedLead.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }),
          fullDate: updatedLead.createdAt,
          notes: updatedLead.notes || [],
          statusHistory: updatedLead.statusHistory || [],
          followupHistory: updatedLead.followupHistory || [],
          completedFollowups: (updatedLead.followupHistory || []).filter((item) => item.done).length,
          subcategory: updatedLead.subcategory || "—",
          comments: updatedLead.comments || "—",
          requirement: updatedLead.requirement || "—",
          avatar: (updatedLead.name || "U").charAt(0).toUpperCase(),
        };

        setSelectedLead(formattedUpdated);
        setShowDetailPanel(true);
      }
      resetConvertModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to convert lead to order", { id: loadingToast });
    }
  };


  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    if (!window.confirm("Are you absolutely sure? This will remove the lead and hide it from the active pipeline.")) return;
    const loadingToast = toast.loading("Deleting lead...");
    try {
      const response = await axiosInstance.delete(`/leads/${id}`);
      if (response.data.success) {
        toast.success("Lead deleted successfully", { id: loadingToast });
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();

        if (selectedLead?.id === id) {
          setSelectedLead(null);
          setShowDetailPanel(false);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete lead", { id: loadingToast });
    }
  };

  const handleRecoverLead = async (id) => {
    if (!window.confirm("Are you sure you want to recover this lead?")) return;
    if (!window.confirm("Are you absolutely sure you want to restore it back to the active pipeline?")) return;
    const loadingToast = toast.loading("Restoring lead...");
    try {
      const response = await axiosInstance.patch(`/leads/${id}/recover`);
      if (response.data.success) {
        toast.success("Lead restored successfully 🎉", { id: loadingToast });
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to restore lead", { id: loadingToast });
    }
  };

  const handlePermanentDeleteLead = async (id) => {
    if (!window.confirm("⚠️ PERMANENT DELETE WARNING: Are you sure you want to permanently delete this lead from the database?")) return;
    if (!window.confirm("🔴 THIS CANNOT BE UNDONE. Are you 100% sure you want to permanently delete this record?")) return;
    const loadingToast = toast.loading("Permanently deleting lead...");
    try {
      let response;
      try {
        response = await axiosInstance.delete(`/leads/${id}/permanent`);
      } catch (err1) {
        try {
          response = await axiosInstance.delete(`/leads/${id}?permanent=true`);
        } catch (err2) {
          response = await axiosInstance.delete(`/leads/${id}`);
        }
      }

      if (response.data?.success) {
        toast.success("Lead permanently deleted 🗑️", { id: loadingToast });
        await queryClient.invalidateQueries({ queryKey: ["getAllLeadsData"] });
        await refetch();

        if (selectedLead?.id === id) {
          setSelectedLead(null);
          setShowDetailPanel(false);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to permanently delete lead", { id: loadingToast });
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

  const handleExportExcel = () => {
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
      lead.name || "",
      lead.businessName || "",
      lead.phone || "",
      lead.email || "",
      lead.productInterest || "",
      lead.quantity || "",
      lead.source || "",
      lead.statusLabel || "",
      `${lead.completedFollowups || 0}/3`,
      lead.date || "",
    ]);

    exportToExcel(headers, rows, "leads");
    showNotification("Excel exported successfully", "success");
  };

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      toast.error("Invalid file format. Please upload a CSV or Excel (.xlsx / .xls) file.");
      e.target.value = "";
      return;
    }

    setIsImporting(true);
    const loadingToast = toast.loading(`Parsing and importing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length <= 1) {
          toast.error("File appears to be empty or has no data rows.", { id: loadingToast });
          setIsImporting(false);
          e.target.value = "";
          return;
        }

        const rawHeaders = jsonRows[0] || [];
        const cleanHeaders = rawHeaders.map((h) => String(h || "").trim().toLowerCase());

        const findIdx = (keywords) =>
          cleanHeaders.findIndex((h) => keywords.some((k) => h.includes(k)));

        const nameIdx = findIdx(["name", "customer", "contact"]);
        const businessIdx = findIdx(["business", "company", "org"]);
        const phoneIdx = findIdx(["phone", "mobile", "contact", "number"]);
        const emailIdx = findIdx(["email", "mail"]);
        const categoryIdx = findIdx(["category", "product", "interest"]);
        const qtyIdx = findIdx(["quantity", "qty"]);
        const reqIdx = findIdx(["requirement", "comment", "description", "note"]);
        const sourceIdx = findIdx(["source", "channel"]);
        const statusIdx = findIdx(["status", "stage"]);
        const cityIdx = findIdx(["city"]);
        const stateIdx = findIdx(["state"]);
        const daysIdx = findIdx(["days", "age", "old"]);

        const leadsToImport = [];
        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;

          const name = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
          const phone = phoneIdx !== -1 ? String(row[phoneIdx] || "").trim() : "";
          const businessName = businessIdx !== -1 ? String(row[businessIdx] || "").trim() : "";
          const email = emailIdx !== -1 ? String(row[emailIdx] || "").trim() : "";
          const daysOld = daysIdx !== -1 ? String(row[daysIdx] || "").trim() : "0";

          if (!name && !phone && !businessName && !email) continue;

          leadsToImport.push({
            name: name || "Unnamed Lead",
            business_name: businessName,
            phone: phone,
            email: email,
            product_category: categoryIdx !== -1 ? String(row[categoryIdx] || "").trim() : "Kraft Paper Bags",
            quantity: qtyIdx !== -1 ? String(row[qtyIdx] || "").trim() : "1000",
            requirement: reqIdx !== -1 ? String(row[reqIdx] || "").trim() : "",
            source: sourceIdx !== -1 ? String(row[sourceIdx] || "").trim() : "Manual",
            status: statusIdx !== -1 ? String(row[statusIdx] || "").trim() : "New",
            delivery_city: cityIdx !== -1 ? String(row[cityIdx] || "").trim() : "",
            delivery_state: stateIdx !== -1 ? String(row[stateIdx] || "").trim() : "",
            days_old: daysOld,
          });
        }

        if (leadsToImport.length === 0) {
          toast.error("No valid lead records found in file.", { id: loadingToast });
          setIsImporting(false);
          e.target.value = "";
          return;
        }

        const resp = await axiosInstance.post("/leads/import", { leads: leadsToImport });

        if (resp.data?.success) {
          toast.success(`Successfully imported ${resp.data?.data?.importedCount || leadsToImport.length} leads! 🎉`, { id: loadingToast });
          queryClient.invalidateQueries({ queryKey: ["getAllLeads"] });
          refetch();
        } else {
          toast.error(resp.data?.message || "Failed to import leads", { id: loadingToast });
        }
      } catch (err) {
        console.error("Import error:", err);
        toast.error(err?.response?.data?.message || "Failed to parse and import file.", { id: loadingToast });
      } finally {
        setIsImporting(false);
        if (e.target) e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
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

      await queryClient.invalidateQueries({
        queryKey: ["getAllLeadsData"],
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

      await queryClient.invalidateQueries({
        queryKey: ["getAllLeadsData"],
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

  const productSelectOptions = useMemo(() => {
    return productItems.map((item) => ({
      id: String(item?._id || item?.id || item?.productId || "").trim(),
      label: item?.name || item?.title || item?.productName || item?.sku || "Unnamed Product",
      sku: item?.sku || "",
    }));
  }, [productItems]);

  const getProductForLine = (line) =>
    productItems.find(
      (p) => String(p?._id || p?.id || p?.productId || "").trim() === line.selectedProductId
    ) || null;

  const isLineRoll = (line) => {
    const prod = getProductForLine(line);
    if (prod) return !!prod.category?.toLowerCase().includes("roll");
    return String(leadToConvert?.productInterest || "").toLowerCase().includes("roll");
  };

  // Legacy – used by Live Preview (first line)
  const isRoll = useMemo(() => {
    const first = (orderForm.orderLines || [])[0];
    if (!first) return false;
    return isLineRoll(first);
  }, [orderForm.orderLines, leadToConvert, productItems]);


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
                variant="custom"
                icon={Download}
                onClick={handleExportCSV}
                className="rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-4 py-2"
              >
                Export CSV
              </Button>

              <Button
                variant="custom"
                icon={FileSpreadsheet}
                onClick={handleExportExcel}
                className="rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-4 py-2"
              >
                Export Excel
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleImportFileSelected}
              />

              <Button
                variant="custom"
                icon={Upload}
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-white/20 bg-emerald-950/40 text-white hover:bg-emerald-900/50 px-4 py-2 flex items-center gap-2"
              >
                {isImporting ? "Importing..." : "Import Data"}
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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1">
            <Input
              placeholder="Search by lead name, business, email, or phone..."
              icon={Search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {["All", "New", "Contacted", "Interested", "Converted", "Completed", "Delivered", "Lost"].map((status) => (
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

            <Button
              variant={showDeleted ? "danger" : "secondary"}
              onClick={() => {
                setShowDeleted(!showDeleted);
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-xl h-[38px] px-4 text-sm font-semibold shadow-sm transition-all duration-200 border"
            >
              {showDeleted ? "📦 Active" : "🗑️ Trash"}
            </Button>
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
                        className={`border-b border-gray-100 transition hover:opacity-80 ${getLeadAgeColor(lead.fullDate)}`}
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
                                    {lead.duplicateExists && (
                                      <span className="ml-1 inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse" title="Another record with this phone number exists.">
                                        ⚠️ Duplicate
                                      </span>
                                    )}
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
                          {["Completed", "Delivered"].includes(lead.statusLabel) ? (
                            <span
                              className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm cursor-not-allowed ${getStatusSelectClass(lead.statusLabel)}`}
                              title="Automated status updated via Order workflow"
                            >
                              {lead.statusLabel} (Auto)
                            </span>
                          ) : (
                            <select
                              value={lead.statusLabel}
                              onChange={(e) =>
                                handleUpdateLeadStatus(lead.id, e.target.value, lead)
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition duration-150 shadow-sm ${getStatusSelectClass(lead.statusLabel)}`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Interested">Interested</option>
                              <option value="Converted">Converted</option>
                              <option value="Lost">Lost</option>
                            </select>
                          )}
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

                            {showDeleted ? (
                              <>
                                <button
                                  onClick={() => handleRecoverLead(lead.id)}
                                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-50"
                                >
                                  Recover
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteLead(lead.id)}
                                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                  title="Delete permanently from database"
                                >
                                  Delete Permanently
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700"
                                title="Move to trash"
                              >
                                Delete
                              </button>
                            )}
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

          {selectedLead && (
            <div className="mt-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm animate-fade-in">
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-emerald-450" />
                    Activity Logs & Status History — {selectedLead.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 opacity-90">
                    Showing status transitions, reasons, and update audit log history for Lead {selectedLead.name} {selectedLead.businessName !== "—" ? `(${selectedLead.businessName})` : ""}
                  </p>
                </div>
                <Button 
                  onClick={() => setSelectedLead(null)} 
                  variant="secondary" 
                  className="bg-slate-700 hover:bg-slate-650 text-white border-none py-1.5 px-3 text-xs self-start sm:self-auto"
                >
                  Clear Selection
                </Button>
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

                  let sortedHistory = [...(selectedLead.statusHistory || [])].reverse();
                  if (logStartDate) {
                    sortedHistory = sortedHistory.filter(l => l.at && getLocalDateString(l.at) >= logStartDate);
                  }
                  if (logEndDate) {
                    sortedHistory = sortedHistory.filter(l => l.at && getLocalDateString(l.at) <= logEndDate);
                  }
                  
                  return sortedHistory.map((log, index) => (
                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-emerald-150 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                              📝 Status Changed: {log.from} &rarr; {log.to}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 font-medium">
                            <span className="font-semibold text-gray-800">Updated by:</span> {log.by}
                          </p>
                          <p className="mt-1 text-sm text-gray-650 italic">
                            <span className="font-semibold text-gray-850 not-italic">Reason/Note:</span> "{log.reason}"
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500 font-semibold">
                            {new Date(log.at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}

                {(!selectedLead.statusHistory || selectedLead.statusHistory.length === 0) && (
                  <div className="rounded-xl border border-dashed border-gray-250 p-6 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                    No status transition logs recorded for this lead yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <Modal
          isOpen={showModal}
          title={editingLead ? "Edit Lead" : "Add New Lead"}
          onClose={() => {
            setShowModal(false);
            setEditingLead(null);
          }}
          size="md"
        >
          <LeadForm
            initialData={editingLead}
            onSubmit={editingLead ? handleUpdateLead : handleAddLead}
          />
        </Modal>

        {/* CONVERT LEAD TO ORDER — RIGHT SIDE PANEL */}
        {showConvertModal && leadToConvert && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={resetConvertModal}
            />

            {/* Panel */}
            <motion.div
              className="relative flex h-screen w-full max-w-3xl flex-col bg-white shadow-2xl"
              initial={{ x: 900 }}
              animate={{ x: 0 }}
              exit={{ x: 900 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              {/* ── STICKY HEADER ── */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Convert Lead to Order</h2>
                    <p className="text-xs text-gray-400">Fill specs & dimensions to create a structured order</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetConvertModal}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ── SCROLLABLE BODY ── */}
              <form onSubmit={handleConvertLeadToOrder} className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                  {/* Lead Summary chips */}
                  {leadToConvert && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <span className="text-gray-400 font-normal">Lead:</span> {leadToConvert.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="text-gray-400 font-normal">Business:</span> {leadToConvert.businessName}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="text-gray-400 font-normal">Source:</span> {leadToConvert.source || "—"}
                      </span>
                    </div>
                  )}

                  {/* Details / Requirements */}
                  {leadToConvert && (
                    <div className="space-y-3">
                      {leadToConvert.requirement && leadToConvert.requirement !== "—" && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Details / Requirements</p>
                          <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                            {leadToConvert.requirement}
                          </p>
                        </div>
                      )}
                      {leadToConvert.comments && leadToConvert.comments !== "—" && (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Chatbot Comments / Notes</p>
                          <p className="mt-1 text-sm text-gray-700 italic font-medium">
                            "{leadToConvert.comments}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}


                  {/* ── MULTI-PRODUCT ORDER LINES ── */}
                  <div className="space-y-4">
                    {(orderForm.orderLines || []).map((line, lineIdx) => {
                      const lineProd = getProductForLine(line);
                      const lineRoll = isLineRoll(line);

                      return (
                        <div
                          key={line.id}
                          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                        >
                          {/* Line Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                                {lineIdx + 1}
                              </div>
                              <span className="text-sm font-semibold text-gray-800">
                                {lineProd
                                  ? lineProd.name || lineProd.title || lineProd.sku || "Product"
                                  : `Product Line ${lineIdx + 1}`}
                              </span>
                              {lineProd && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lineRoll ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                  {lineRoll ? "Roll" : "Bag"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {lineProd && (
                                <button
                                  type="button"
                                  onClick={() => toggleLineSpecs(line.id)}
                                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                  {line.specsExpanded ? "Hide Specs ▲" : "Show Specs ▼"}
                                </button>
                              )}
                              {(orderForm.orderLines || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeOrderLine(line.id)}
                                  className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Product Selector */}
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                Product <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={line.selectedProductId}
                                onChange={(e) => applyProductToLine(line.id, e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                                required
                              >
                                <option value="">Select product</option>
                                {productSelectOptions.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.label}{product.sku ? ` (${product.sku})` : ""}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Product Spec Card — expands after selection */}
                            {lineProd && line.specsExpanded && (
                              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-3">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Product Specifications</p>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                                  {lineProd.sku && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">SKU</span>
                                      <span className="font-semibold text-gray-800">{lineProd.sku}</span>
                                    </div>
                                  )}
                                  {lineProd.category && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Category</span>
                                      <span className="font-semibold text-gray-800">{lineProd.category}</span>
                                    </div>
                                  )}
                                  {Boolean(lineProd.gsm) && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">GSM</span>
                                      <span className="font-semibold text-gray-800">{lineProd.gsm}</span>
                                    </div>
                                  )}
                                  {Boolean(lineProd.bf) && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Burst Factor</span>
                                      <span className="font-semibold text-emerald-700">{lineProd.bf}</span>
                                    </div>
                                  )}
                                  {(lineProd.bagColor || lineProd.color) && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Color</span>
                                      <span className="font-semibold text-gray-800">{lineProd.bagColor || lineProd.color}</span>
                                    </div>
                                  )}
                                  {Boolean(lineProd.weight) && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Weight</span>
                                      <span className="font-semibold text-gray-800">{lineProd.weight} g</span>
                                    </div>
                                  )}
                                  {lineProd.dimensions?.width && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Width</span>
                                      <span className="font-semibold text-gray-800">{lineProd.dimensions.width} {lineProd.dimensions.unit || ""}</span>
                                    </div>
                                  )}
                                  {!lineRoll && lineProd.dimensions?.length && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Length</span>
                                      <span className="font-semibold text-gray-800">{lineProd.dimensions.length} {lineProd.dimensions.unit || ""}</span>
                                    </div>
                                  )}
                                  {!lineRoll && lineProd.dimensions?.height && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Height</span>
                                      <span className="font-semibold text-gray-800">{lineProd.dimensions.height} {lineProd.dimensions.unit || ""}</span>
                                    </div>
                                  )}
                                  {(lineProd.bagSize || (lineProd.name && (lineProd.name.toLowerCase().includes("medium") ? "Medium" : lineProd.name.toLowerCase().includes("small") ? "Small" : lineProd.name.toLowerCase().includes("large") ? "Large" : ""))) && (
                                    <div>
                                      <span className="block text-gray-400 font-medium">Bag Size</span>
                                      <span className="font-semibold text-gray-800">
                                        {lineProd.bagSize || (lineProd.name.toLowerCase().includes("medium") ? "Medium" : lineProd.name.toLowerCase().includes("small") ? "Small" : lineProd.name.toLowerCase().includes("large") ? "Large" : "")}
                                      </span>
                                    </div>
                                  )}
                                  {lineProd.customPrinting && (
                                    <div className="col-span-3">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                                        ✓ Custom Printing Available
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Fields Grid — only shown after product selected */}
                            {line.selectedProductId && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    GSM <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <Package className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                    <input
                                      type="number" min="0"
                                      value={line.gsm}
                                      onChange={(e) => handleLineChange(line.id, "gsm", e.target.value)}
                                      placeholder="e.g. 120"
                                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                                      required
                                    />
                                  </div>
                                </div>

                                {lineRoll ? (
                                  <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                      Burst Factor (BF) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="number" min="0" step="0.1"
                                        value={line.bf}
                                        onChange={(e) => handleLineChange(line.id, "bf", e.target.value)}
                                        placeholder="e.g. 20"
                                        className="w-full rounded-xl border border-amber-300 bg-amber-50/40 py-2.5 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-50"
                                        required
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  (() => {
                                    const currentSize = line.bagSize || "";
                                    const presetSizes = ["Small", "Medium", "Large", "8x10", "10x12", "12x16"];
                                    if (lineProd?.bagSize && !presetSizes.includes(lineProd.bagSize)) {
                                      presetSizes.push(lineProd.bagSize);
                                    }
                                    const isCustom = currentSize !== "" && !presetSizes.includes(currentSize);
                                    const selectValue = isCustom ? "Custom" : currentSize;

                                    return (
                                      <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-gray-600">
                                          Bag Size <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                          value={selectValue}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "Custom") {
                                              handleLineChange(line.id, "bagSize", isCustom ? currentSize : "");
                                            } else {
                                              handleLineChange(line.id, "bagSize", val);
                                            }
                                          }}
                                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 font-medium text-gray-900"
                                        >
                                          <option value="">Select Bag Size...</option>
                                          <option value="Small">Small</option>
                                          <option value="Medium">Medium</option>
                                          <option value="Large">Large</option>
                                          <option value="8x10">8×10</option>
                                          <option value="10x12">10×12</option>
                                          <option value="12x16">12×16</option>
                                          {lineProd?.bagSize && !["Small", "Medium", "Large", "8x10", "10x12", "12x16"].includes(lineProd.bagSize) && (
                                            <option value={lineProd.bagSize}>{lineProd.bagSize}</option>
                                          )}
                                          <option value="Custom">⚙️ Custom (Type Custom Size)</option>
                                        </select>
                                        {(selectValue === "Custom" || isCustom) && (
                                          <input
                                            type="text"
                                            value={line.bagSize || ""}
                                            onChange={(e) => handleLineChange(line.id, "bagSize", e.target.value)}
                                            placeholder="Enter custom bag size..."
                                            className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium mt-1"
                                            required
                                          />
                                        )}
                                      </div>
                                    );
                                  })()
                                )}

                                 {!lineRoll && (
                                   (() => {
                                     const currentColor = line.color || "";
                                     const standardColors = ["Brown", "Natural brown", "White", "Pink"];
                                     const prodColor = lineProd?.bagColor || lineProd?.color;
                                     if (prodColor && !standardColors.includes(prodColor)) {
                                       standardColors.push(prodColor);
                                     }
                                     const isCustomColor = currentColor !== "" && !standardColors.includes(currentColor);
                                     const selectColorValue = isCustomColor ? "Custom" : currentColor;

                                     return (
                                       <div className="space-y-1">
                                         <label className="block text-xs font-semibold text-gray-600">Bag Color</label>
                                         <select
                                           value={selectColorValue}
                                           onChange={(e) => {
                                             const val = e.target.value;
                                             if (val === "Custom") {
                                               handleLineChange(line.id, "color", isCustomColor ? currentColor : "");
                                             } else {
                                               handleLineChange(line.id, "color", val);
                                             }
                                           }}
                                           className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 font-medium text-gray-900"
                                         >
                                           <option value="">Select Color...</option>
                                           <option value="Brown">Brown</option>
                                           <option value="Natural brown">Natural brown</option>
                                           <option value="White">White</option>
                                           <option value="Pink">Pink</option>
                                           {prodColor && !["Brown", "Natural brown", "White", "Pink"].includes(prodColor) && (
                                             <option value={prodColor}>{prodColor}</option>
                                           )}
                                           <option value="Custom">⚙️ Custom (Type Custom Color)</option>
                                         </select>
                                         {(selectColorValue === "Custom" || isCustomColor) && (
                                           <input
                                             type="text"
                                             value={line.color || ""}
                                             onChange={(e) => handleLineChange(line.id, "color", e.target.value)}
                                             placeholder="Enter custom color..."
                                             className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-900 font-medium mt-1"
                                           />
                                         )}
                                       </div>
                                     );
                                   })()
                                 )}

                                {lineRoll && (
                                  <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                      Width Unit
                                    </label>
                                    <select
                                      value={line.dimensionUnit}
                                      onChange={(e) => handleLineChange(line.id, "dimensionUnit", e.target.value)}
                                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                                    >
                                      <option value="inch">Inch</option>
                                      <option value="cm">CM</option>
                                      <option value="mm">MM</option>
                                      <option value="ft">Feet</option>
                                    </select>
                                  </div>
                                )}

                                {/* Order Quantity */}
                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    Quantity <span className="text-red-500">*</span>
                                  </label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="number" min="0.001" step="any"
                                      value={line.quantity}
                                      onChange={(e) => handleLineChange(line.id, "quantity", e.target.value)}
                                      placeholder="Qty"
                                      className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-emerald-500"
                                      required
                                    />
                                    <div className="w-[64px] shrink-0 flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-1 py-2.5 text-xs font-extrabold text-emerald-800 shadow-2xs select-none" title="Product Counting Unit locked to Master DB configuration">
                                      {(() => {
                                        const pObj = productItems.find(p => String(p?._id || p?.id || "").trim() === String(line.selectedProductId).trim());
                                        return pObj?.unit || (lineRoll ? "kg" : "pcs");
                                      })()}
                                    </div>
                                  </div>
                                </div>

                                {/* Dimension Unit (non-roll) */}
                                {!lineRoll && (
                                  <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Dimension Unit</label>
                                    <select
                                      value={line.dimensionUnit}
                                      onChange={(e) => handleLineChange(line.id, "dimensionUnit", e.target.value)}
                                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                                    >
                                      <option value="inch">Inch</option>
                                      <option value="cm">CM</option>
                                      <option value="mm">MM</option>
                                      <option value="ft">Feet</option>
                                    </select>
                                  </div>
                                )}

                                {/* Width (always shown) */}
                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    Width <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number" min="0"
                                    value={line.width}
                                    onChange={(e) => handleLineChange(line.id, "width", e.target.value)}
                                    placeholder="Width"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                                  />
                                </div>

                                {/* Length & Height (bag only) */}
                                {!lineRoll && (
                                  <>
                                    <div>
                                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                        Length <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number" min="0"
                                        value={line.length}
                                        onChange={(e) => handleLineChange(line.id, "length", e.target.value)}
                                        placeholder="Length"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                        Height <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number" min="0"
                                        value={line.height}
                                        onChange={(e) => handleLineChange(line.id, "height", e.target.value)}
                                        placeholder="Height"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                  </>
                                )}

                                {/* Custom Printing */}
                                <div className="col-span-2">
                                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm font-medium text-gray-700 w-full hover:bg-gray-100 transition">
                                    <input
                                      type="checkbox"
                                      checked={line.customPrinting || false}
                                      onChange={(e) => handleLineChange(line.id, "customPrinting", e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Require Custom Printing
                                  </label>
                                </div>

                                {/* Branding fields */}
                                {line.customPrinting && (
                                  <div className="col-span-2 space-y-2 border-l-4 border-emerald-500 bg-emerald-50/50 p-3 rounded-xl">
                                    <input
                                      type="text"
                                      value={line.brandingText || ""}
                                      onChange={(e) => handleLineChange(line.id, "brandingText", e.target.value)}
                                      placeholder="Branding text to print on bags..."
                                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Another Product Button */}
                    <button
                      type="button"
                      onClick={addOrderLine}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Product
                    </button>
                  </div>

                  {/* ── SECTION: Live Preview ── */}
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-emerald-800">Order Summary</h4>
                      <span className="ml-auto text-xs font-semibold text-emerald-600">
                        {(orderForm.orderLines || []).length} Product{(orderForm.orderLines || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(orderForm.orderLines || []).map((line, idx) => {
                        const lprod = getProductForLine(line);
                        const lroll = isLineRoll(line);
                        return (
                          <div key={line.id} className="rounded-lg bg-white/70 px-3 py-2 border border-emerald-100">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                                {lprod?.name || `Product ${idx + 1}`}
                              </span>
                              <span className="font-bold text-emerald-700 shrink-0">
                                {line.quantity || "—"} {line.unit || "pcs"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[11px] text-gray-500">
                              {lroll && line.gsm && <span>GSM: <b className="text-gray-700">{line.gsm}</b></span>}
                              {!lroll && line.bagSize && <span>Size: <b className="text-gray-700">{line.bagSize}</b></span>}
                              {!lroll && line.color && <span>Color: <b className="text-gray-700">{line.color}</b></span>}
                              {line.width && (
                                <span>Dim: <b className="text-gray-700">
                                  {lroll
                                    ? `W: ${line.width} ${line.dimensionUnit}`
                                    : `${line.length || "0"}×${line.width}×${line.height || "0"} ${line.dimensionUnit}`}
                                </b></span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div className="border-t border-emerald-200 pt-2 flex justify-between text-sm">
                        <span className="font-bold text-gray-700">Total Products</span>
                        <span className="font-bold text-emerald-700">{(orderForm.orderLines || []).length} Line{(orderForm.orderLines || []).length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>


                  {/* ── SECTION: GST & Billing Address Details ── */}
                  {(() => {
                    const estimatedOrderTotal = (orderForm.orderLines || []).reduce((sum, line) => {
                      const prod = productItems.find(p => String(p?._id || p?.id || "").trim() === String(line.selectedProductId).trim());
                      const price = Number(line.pricePerUnit || line.unitPrice || prod?.sellingPricePerUnit || prod?.sellingPrice || prod?.unitPrice || prod?.basePrice || 0);
                      const sub = Number(line.quantity || 0) * price;
                      const taxRate = Number(prod?.gstRate ?? 18);
                      return sum + (sub + sub * (taxRate / 100));
                    }, 0);

                    const isGstEntered = Boolean(orderForm.gstNumber && orderForm.gstNumber.trim().length > 0);
                    const isHighValue = estimatedOrderTotal > 50000;
                    const isAddressRequired = isGstEntered || isHighValue;

                    return (
                      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          <h4 className="text-sm font-bold text-gray-900">GST &amp; Billing / Delivery Details</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* GST Number */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                              GST Number (GSTIN) <span className="text-gray-400 font-normal">(Optional, 15 chars)</span>
                            </label>
                            <input
                              type="text"
                              maxLength={15}
                              value={orderForm.gstNumber || ""}
                              onChange={(e) => {
                                const upper = e.target.value.toUpperCase();
                                handleOrderFormChange("gstNumber", upper);
                              }}
                              placeholder="e.g. 27ABCDE1234F1Z5"
                              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition font-mono ${
                                orderForm.gstNumber && !GSTIN_REGEX.test(orderForm.gstNumber.trim())
                                  ? "border-red-300 bg-red-50/30 text-red-900 focus:border-red-500"
                                  : "border-gray-200 bg-white focus:border-emerald-500"
                              }`}
                            />
                            {orderForm.gstNumber && !GSTIN_REGEX.test(orderForm.gstNumber.trim()) && (
                              <p className="mt-1 text-[11px] font-semibold text-red-500">
                                Format: 2-digit State + 10-char PAN + 1 Entity + 'Z' + 1 Checksum
                              </p>
                            )}
                          </div>

                          {/* State Dropdown */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                              State {isAddressRequired && <span className="text-red-500">*</span>}
                            </label>
                            <select
                              value={orderForm.stateCode || ""}
                              onChange={(e) => {
                                const selectedCode = e.target.value;
                                const found = INDIAN_STATES.find(s => s.code === selectedCode);
                                setOrderForm(prev => ({
                                  ...prev,
                                  stateCode: selectedCode,
                                  stateName: found ? found.name : ""
                                }));
                              }}
                              required={isAddressRequired}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                            >
                              <option value="">Select State / UT...</option>
                              {INDIAN_STATES.map((s) => (
                                <option key={s.code} value={s.code}>
                                  {s.code} - {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* State Mismatch Cross-Check Warning */}
                        {orderForm.gstNumber && orderForm.stateCode && (
                          (() => {
                            const gstPrefix = orderForm.gstNumber.trim().substring(0, 2);
                            if (gstPrefix.length === 2 && gstPrefix !== orderForm.stateCode) {
                              return (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                                  <span>
                                    <b>Cross-Check Note:</b> GSTIN state prefix (<b>{gstPrefix}</b>) does not match selected State (<b>{orderForm.stateCode} - {orderForm.stateName}</b>).
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}

                        {/* Address Field */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                            Billing / Delivery Address {isAddressRequired && <span className="text-red-500">*</span>}
                            {isGstEntered ? (
                              <span className="ml-1 text-[11px] font-medium text-emerald-600">(Required for GST registered buyers)</span>
                            ) : isHighValue ? (
                              <span className="ml-1 text-[11px] font-medium text-amber-600">(Required for orders exceeding ₹50,000)</span>
                            ) : (
                              <span className="ml-1 text-[11px] font-medium text-gray-400">(Optional below ₹50,000)</span>
                            )}
                          </label>
                          <textarea
                            rows={2}
                            value={orderForm.address || ""}
                            onChange={(e) => handleOrderFormChange("address", e.target.value)}
                            required={isAddressRequired}
                            placeholder="Enter complete building, street, city, pin code..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── SECTION: Notes ── */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Extra Notes
                    </label>
                    <textarea
                      rows={3}
                      value={orderForm.notes}
                      onChange={(e) => handleOrderFormChange("notes", e.target.value)}
                      placeholder="Order notes, design details, customer requirements, delivery notes..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                    />
                  </div>

                </div>{/* end scrollable body */}

                {/* ── STICKY FOOTER ── */}
                <div className="sticky bottom-0 shrink-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetConvertModal}
                    className="min-w-[110px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 min-w-[200px] font-semibold"
                  >
                    Convert &amp; Create Order
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}



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
              className="relative h-screen w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {selectedLead.avatar}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{selectedLead.name}</h2>
                    {selectedLead.email && selectedLead.email !== "—" && (
                      <p className="text-xs text-gray-400">{selectedLead.email}</p>
                    )}
                  </div>
                  <Badge variant={statusColors[selectedLead.status] || "primary"} className="ml-1">
                    {selectedLead.statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.phone !== "—" && (
                    <a
                      href={`https://wa.me/${String(selectedLead.phone).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-green-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">

                {/* Duplicate alert */}
                {selectedLead.duplicateExists && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Duplicate Lead Exists</p>
                      <p className="text-xs text-amber-700 mt-0.5">Another record with this phone number exists. Verify before conversion.</p>
                    </div>
                  </div>
                )}

                {/* Top info grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Phone</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 flex items-center gap-1">
                      {selectedLead.phone}
                      {selectedLead.duplicateExists && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">⚠️ DUP</span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Source</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{selectedLead.source}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Business</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{selectedLead.businessName}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Created On</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{selectedLead.date}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Product Interest</p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-700">{selectedLead.productInterest}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Quantity</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{selectedLead.quantity}</p>
                  </div>
                </div>

                {/* Details / Requirements */}
                {selectedLead.requirement && selectedLead.requirement !== "—" && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Details / Requirements</p>
                    <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedLead.requirement}</p>
                  </div>
                )}

                {/* Subcategory */}
                {selectedLead.subcategory && selectedLead.subcategory !== "—" && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Sub Category</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{selectedLead.subcategory}</p>
                  </div>
                )}

                {/* Chatbot Comments */}
                {selectedLead.comments && selectedLead.comments !== "—" && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Chatbot Comments / Notes</p>
                    <p className="mt-1 text-sm text-gray-700 italic">"{selectedLead.comments}"</p>
                  </div>
                )}

                {/* Follow-up Check-ins */}
                <div className="rounded-xl border border-gray-100 px-3 py-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Follow-up Check-ins</p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {selectedLead.completedFollowups || 0}/3 done
                    </div>
                  </div>

                  <div className="space-y-2">
                    {FOLLOWUP_FLOW.map((flow) => {
                      const flowStatus = getFlowStatus(selectedLead, flow.key);
                      const isDone = !!flowStatus?.done;

                      return (
                        <div
                          key={flow.key}
                          className={`rounded-xl border px-3 py-2.5 transition ${
                            isDone
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Clock3 className="h-4 w-4 text-amber-500 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900">{flow.label}</p>
                                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                                    {flowStatus?.stageDay ? `Day ${flowStatus.stageDay}` : flow.dayLabel}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {isDone
                                    ? `Done · ${new Date(flowStatus.updatedAt).toLocaleDateString()}`
                                    : "Pending"}
                                </p>
                                {isDone && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                      {getFollowupSourceLabel(flowStatus)}
                                    </span>
                                    {getFollowupChannelLabel(flowStatus) && (
                                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-200">
                                        {getFollowupChannelLabel(flowStatus)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleMarkFollowup(flow.key)}
                              disabled={isDone}
                              className={`shrink-0 text-xs px-3 py-1.5 ${
                                isDone
                                  ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {isDone ? "✓ Done" : "Mark Done"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-xl border border-gray-100 px-3 py-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Notes</p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={2}
                      placeholder="Write a note for this lead..."
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500"
                    />

                    <Button onClick={handleAddNote} className="w-full bg-green-700 text-sm py-1.5">
                      Add Note
                    </Button>

                    <div className="space-y-1.5 pt-1">
                      {(selectedLead?.notes || []).length > 0 ? (
                        selectedLead.notes
                          .slice()
                          .reverse()
                          .map((note) => (
                            <div
                              key={note._id}
                              className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="text-sm text-gray-800">{note.text}</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {new Date(note.at).toLocaleString()}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-gray-400">No notes added yet.</p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Action buttons */}
                <div className="flex gap-2 pb-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailPanel(false)}
                    className="text-sm"
                  >
                    Close
                  </Button>

                  {showDeleted ? (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
                      onClick={() => {
                        handleRecoverLead(selectedLead.id);
                        setShowDetailPanel(false);
                      }}
                    >
                      Recover Lead
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="text-sm"
                        onClick={() => {
                          setEditingLead(selectedLead);
                          setShowModal(true);
                          setShowDetailPanel(false);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        className="text-sm"
                        onClick={() => {
                          handleDeleteLead(selectedLead.id);
                          setShowDetailPanel(false);
                        }}
                      >
                        Delete Lead
                      </Button>
                    </>
                  )}
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
