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
  Edit2,
  Trash2,
  Search,
  Building2,
  Package,
  Phone,
  Mail,
  CalendarDays,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { usegetAllLeads } from "../../../../hook/leads";

const Leads = () => {
  const { data, isLoading, refetch } = usegetAllLeads();
  const showNotification = useUIStore((state) => state.showNotification);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const itemsPerPage = 5;

  const rawLeads = data?.leads || [];

  const formattedLeads = useMemo(() => {
    return rawLeads.map((lead) => ({
      id: lead._id,
      name: lead.name || "Unknown",
      businessName: lead.business_name || "—",
      phone: lead.phone || "—",
      email: lead.email || "—",
      productInterest: lead.product_category || "—",
      quantity: lead.quantity || "—",
      source: lead.source || "—",
      status: (lead.status || "New").toUpperCase(),
      statusLabel: lead.status || "New",
      date: new Date(lead.createdAt).toLocaleDateString(),
      fullDate: lead.createdAt,
      avatar: (lead.name || "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }));
  }, [rawLeads]);

  const filteredLeads = useMemo(() => {
    return formattedLeads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        lead.status === statusFilter ||
        lead.statusLabel === statusFilter;

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
    IN_PROGRESS: "primary",
    CONVERTED: "secondary",
    LOST: "danger",
  };

  const newLeadsCount = formattedLeads.filter((lead) => lead.status === "NEW").length;
  const contactedLeadsCount = formattedLeads.filter(
    (lead) => lead.status === "CONTACTED"
  ).length;
  const convertedLeadsCount = formattedLeads.filter(
    (lead) => lead.status === "CONVERTED"
  ).length;

  const handleAddLead = async (formData) => {
    try {
      const response = await leadsAPI.createLead(formData);
      if (response.success) {
        setShowModal(false);
        showNotification("Lead added successfully", "success");
        refetch();
      }
    } catch (error) {
      showNotification("Failed to add lead", "error");
    }
  };

  const handleUpdateLead = async (formData) => {
    try {
      const response = await leadsAPI.updateLead(editingLead.id, formData);
      if (response.success) {
        setShowModal(false);
        setEditingLead(null);
        showNotification("Lead updated successfully", "success");
        refetch();
      }
    } catch (error) {
      showNotification("Failed to update lead", "error");
    }
  };
  const totalLeads = formattedLeads.length;

  const conversionRate = totalLeads
    ? ((convertedLeadsCount / totalLeads) * 100).toFixed(1)
    : "0.0";
  const handleDeleteLead = async (id) => {
    try {
      const response = await leadsAPI.deleteLead(id);
      if (response.success) {
        showNotification("Lead deleted successfully", "success");
        refetch();
      }
    } catch (error) {
      showNotification("Failed to delete lead", "error");
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
              <p className="mt-2 text-sm text-emerald-50/90 max-w-2xl">
                Manage and track high-intent B2B enquiries for eco-friendly packaging
                with a cleaner and more organized lead pipeline.
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
                <p className="text-xs font-semibold text-gray-500 uppercase">
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
{/* 
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  New Leads
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {newLeadsCount}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card> */}
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
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
                <p className="text-xs font-semibold text-gray-500 uppercase">
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
                <p className="text-xs font-semibold text-gray-500 uppercase">
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
            placeholder="Search by lead name, business, or email..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {["All", "NEW", "CONTACTED", "CONVERTED"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${statusFilter === status
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Lead
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Business
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Source
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
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
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {lead.email}
                              </p>
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
                          <Badge variant={statusColors[lead.status] || "primary"}>
                            {lead.statusLabel}
                          </Badge>
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
                                setSelectedLead(lead);
                                setShowDetailPanel(true);
                              }}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              View
                            </button>

                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setShowModal(true);
                              }}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!paginatedLeads.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
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

                <div className="mb-6 flex items-center gap-4 rounded-2xl bg-emerald-50 p-4">
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
                      Phone
                    </p>
                    <p className="mt-1 text-gray-900">{selectedLead.phone}</p>
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