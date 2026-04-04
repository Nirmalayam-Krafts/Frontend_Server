import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  Pagination,
  EmptyState,
} from "../../components/ui";
import { LeadForm } from "../../components/forms";
import { useLeadsStore, useUIStore } from "../../store";
import { leadsAPI } from "../../services/api";
import { Plus, Download, X, Edit2, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";

const Leads = () => {
  const leads = useLeadsStore((state) => state.leads);
  const setLeads = useLeadsStore((state) => state.setLeads);
  const addLead = useLeadsStore((state) => state.addLead);
  const updateLead = useLeadsStore((state) => state.updateLead);
  const deleteLead = useLeadsStore((state) => state.deleteLead);
  const setSelectedLead = useLeadsStore((state) => state.setSelectedLead);
  const selectedLead = useLeadsStore((state) => state.selectedLead);

  const showNotification = useUIStore((state) => state.showNotification);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadsAPI.getLeads({
          status: statusFilter === "All" ? null : statusFilter,
        });
        if (response.success) {
          setLeads(response.data);
        }
      } catch (error) {
        showNotification("Failed to load leads", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [statusFilter]);

  const handleAddLead = async (data) => {
    try {
      const response = await leadsAPI.createLead(data);
      if (response.success) {
        addLead(response.data);
        setShowModal(false);
        showNotification("Lead added successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to add lead", "error");
    }
  };

  const handleUpdateLead = async (data) => {
    try {
      const response = await leadsAPI.updateLead(editingLead.id, data);
      if (response.success) {
        updateLead(editingLead.id, data);
        setShowModal(false);
        setEditingLead(null);
        showNotification("Lead updated successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to update lead", "error");
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      const response = await leadsAPI.deleteLead(id);
      if (response.success) {
        deleteLead(id);
        showNotification("Lead deleted successfully", "success");
      }
    } catch (error) {
      showNotification("Failed to delete lead", "error");
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.businessName.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const statusColors = {
    NEW: "success",
    CONTACTED: "warning",
    IN_PROGRESS: "primary",
    CONVERTED: "secondary",
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Leads Management
              </h1>
              <p className="text-gray-600">
                Manage and track high-intent B2B inquiries for eco-friendly
                packaging.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={Download}
                onClick={() =>
                  showNotification("CSV exported successfully", "success")
                }
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

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              ACTIVE LEADS
            </p>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-xs text-green-600 mt-2">+15% from last month</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              CONVERSION RATE
            </p>
            <p className="text-3xl font-bold text-gray-900">18.4%</p>
            <p className="text-xs text-green-600 mt-2">↑ 2.1% this month</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 mb-1">
              QUICK FILTERS
            </p>
            <div className="flex gap-2 mt-2">
              {["All", "NEW", "CONTACTED", "CONVERTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`text-xs px-2 py-1 rounded ${
                    statusFilter === status
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Input
            placeholder="Search leads by name or business..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      LEAD NAME
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      BUSINESS ENTITY
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      PRODUCT INTEREST
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-700">
                              {lead.avatar}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {lead.businessName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {lead.productInterest}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusColors[lead.status]}>
                          {lead.statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDetailPanel(true);
                            }}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Add/Edit Modal */}
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

        {/* Detail Panel */}
        {showDetailPanel && selectedLead && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowDetailPanel(false)}
            />
            <motion.div
              className="relative bg-white w-full max-w-md h-screen shadow-lg overflow-y-auto"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Lead Detail
                  </h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedLead.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Business
                    </p>
                    <p className="text-gray-900">{selectedLead.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Product Interest
                    </p>
                    <p className="text-gray-900">
                      {selectedLead.productInterest}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </p>
                    <Badge
                      variant={statusColors[selectedLead.status]}
                      className="mt-2"
                    >
                      {selectedLead.statusLabel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </p>
                    <p className="text-gray-900">{selectedLead.date}</p>
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
