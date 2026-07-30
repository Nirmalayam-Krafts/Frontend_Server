import React, { useState, useEffect } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Badge, Button, Input, Select, Modal, Pagination } from "../../components/ui";
import { toast } from "react-hot-toast";
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  History, 
  Database,
  ArrowUpDown,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../../context/Adminauth";

const Documents = () => {
  const { axiosInstance } = useAuthContext();
  const [activeTab, setActiveTab] = useState("documents");

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docTotal, setDocTotal] = useState(0);
  const [docPage, setDocPage] = useState(1);
  const [docLimit] = useState(10);
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [docsLoading, setDocsLoading] = useState(false);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(15);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/documents?page=${docPage}&limit=${docLimit}&search=${docSearch}&type=${docTypeFilter}`
      );
      if (res.data?.success) {
        setDocuments(res.data.data || []);
        setDocTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch generated documents", err);
      toast.error("Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axiosInstance.get(`/documents/logs?page=${logsPage}&limit=${logsLimit}`);
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setLogsTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch document logs", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    } else {
      fetchLogs();
    }
  }, [activeTab, docPage, docSearch, docTypeFilter, logsPage]);

  // Log client-side actions (view & download)
  const logClientAction = async (doc, actionType) => {
    try {
      await axiosInstance.post("/documents/log-action", {
        documentNumber: doc.documentNumber,
        documentType: doc.documentType,
        customerName: doc.customerName,
        action: actionType,
        details: `${actionType} action triggered from document table`,
      });
    } catch (err) {
      console.error("Failed to log document action", err);
    }
  };

  const handleView = async (doc) => {
    await logClientAction(doc, "VIEW");
    // Append full API host prefix if URL is relative
    const baseUrl = axiosInstance.defaults.baseURL || "";
    const apiHost = baseUrl.replace(/\/api$/, "").replace(/\/$/, "");
    const fileUrl = doc.fileUrl.startsWith("http") ? doc.fileUrl : `${apiHost}${doc.fileUrl}`;
    window.open(fileUrl, "_blank");
    fetchLogs(); // refresh logs silently
  };

  const handleDownload = async (doc) => {
    await logClientAction(doc, "DOWNLOAD");
    
    const baseUrl = axiosInstance.defaults.baseURL || "";
    const apiHost = baseUrl.replace(/\/api$/, "").replace(/\/$/, "");
    const fileUrl = doc.fileUrl.startsWith("http") ? doc.fileUrl : `${apiHost}${doc.fileUrl}`;
    
    // Create hidden download link
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `${doc.documentNumber}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    fetchLogs(); // refresh logs silently
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete ${doc.documentType} ${doc.documentNumber}? This action will delete the file reference and is logged.`)) {
      return;
    }

    const toastId = toast.loading("Deleting document...");
    try {
      const res = await axiosInstance.delete(`/documents/${doc._id}`);
      if (res.data?.success) {
        toast.success("Document deleted successfully!", { id: toastId });
        fetchDocuments();
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to delete document", err);
      toast.error(err.response?.data?.message || "Failed to delete document", { id: toastId });
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Documents & Receipts
            </h1>
            <p className="text-gray-600">
              Manage all system generated quotations and receipts with immutable audit history.
            </p>
          </div>
          <button
            onClick={() => activeTab === "documents" ? fetchDocuments() : fetchLogs()}
            disabled={docsLoading || logsLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(docsLoading || logsLoading) ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition-all ${
              activeTab === "documents"
                ? "bg-emerald-50 text-emerald-700 shadow-inner"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generated Documents
            </span>
          </button>
          <button
            onClick={() => setActiveTab("documents_logs")}
            className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition-all ${
              activeTab === "documents_logs"
                ? "bg-emerald-50 text-emerald-700 shadow-inner"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              Immutable Audit Logs
            </span>
          </button>
        </div>

        {activeTab === "documents" ? (
          <>
            {/* Search and Filters */}
            <Card className="p-4 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-2 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => {
                      setDocSearch(e.target.value);
                      setDocPage(1);
                    }}
                    placeholder="Search by quote/receipt number or customer name..."
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <Select
                    value={docTypeFilter}
                    onChange={(val) => {
                      setDocTypeFilter(val);
                      setDocPage(1);
                    }}
                    options={[
                      { label: "All Document Types", value: "" },
                      { label: "Quotations", value: "quotation" },
                      { label: "Receipts / Invoices", value: "receipt" }
                    ]}
                  />
                </div>
                <div className="text-right text-xs font-semibold text-gray-500">
                  Showing {documents.length} of {docTotal} records
                </div>
              </div>
            </Card>

            {/* Document list table */}
            <Card className="overflow-hidden border border-gray-150 shadow-sm">
              {docsLoading ? (
                <div className="py-20 text-center text-gray-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  Loading generated documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <Database className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  No generated documents found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Doc Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Customer Name</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Total Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date Generated</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Created By</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <Badge
                              variant={doc.documentType === "quotation" ? "primary" : "success"}
                              className="text-xs capitalize font-medium rounded-full px-2.5 py-0.5"
                            >
                              {doc.documentType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 font-mono text-xs">{doc.documentNumber}</td>
                          <td className="py-3 px-4 text-gray-700">{doc.customerName}</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(doc.totalAmount)}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(doc.createdAt)}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs font-medium">{doc.createdBy?.name || "System"}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleView(doc)}
                                className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc)}
                                className="p-1.5 text-gray-400 hover:text-red-650 rounded-lg hover:bg-red-50 transition-all"
                                title="Delete Reference"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {docTotal > docLimit && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
                  <Pagination
                    current={docPage}
                    total={docTotal}
                    pageSize={docLimit}
                    onChange={(p) => setDocPage(p)}
                  />
                </div>
              )}
            </Card>
          </>
        ) : (
          /* Logs Tab */
          <>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-amber-900 text-sm flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Immutable System Logs</p>
                <p className="text-xs text-amber-805 mt-0.5">
                  These audit trails are structurally immutable. The system records all actions (Creation, Access, Downloads, and Deletions) along with the IP Address and logged-in personnel to comply with internal audits.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden border border-gray-150 shadow-sm">
              {logsLoading ? (
                <div className="py-20 text-center text-gray-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  Loading audit logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <History className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  No logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Doc Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Client / customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">IP Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Details</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                log.action === "CREATE" ? "success" : 
                                log.action === "VIEW" ? "primary" : 
                                log.action === "DOWNLOAD" ? "warning" : "danger"
                              }
                              className="text-xs font-semibold px-2 py-0.5 rounded"
                            >
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-gray-700 capitalize">{log.documentType}</td>
                          <td className="py-3 px-4 text-xs font-mono font-bold text-gray-800">{log.documentNumber}</td>
                          <td className="py-3 px-4 text-xs text-gray-700">{log.customerName}</td>
                          <td className="py-3 px-4 text-xs text-gray-900 font-semibold">{log.adminName}</td>
                          <td className="py-3 px-4 text-xs text-gray-650 font-mono">{log.ipAddress}</td>
                          <td className="py-3 px-4 text-xs text-gray-600">{log.details || "—"}</td>
                          <td className="py-3 px-4 text-right text-xs text-gray-500 font-mono">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {logsTotal > logsLimit && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
                  <Pagination
                    current={logsPage}
                    total={logsTotal}
                    pageSize={logsLimit}
                    onChange={(p) => setLogsPage(p)}
                  />
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
