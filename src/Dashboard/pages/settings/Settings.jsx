import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input, Modal } from "../../components/ui";
import { useAuthStore, useUIStore } from "../../store";
import { motion as Motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Sparkles,
  Trash2,
  UserPlus,
  KeyRound,
  Plus,
} from "lucide-react";
import { useCurrentUser } from "../../../../hook/admin";
import { useAuthContext } from "../../../context/Adminauth";

const formatLastLogin = (profile) => {
  const rawDate = profile?.lastLoginAt;
  if (!rawDate) return "No login activity recorded yet";

  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return "No login activity recorded yet";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const datePrefix = isToday
    ? `Today at ${time}`
    : `${d.toLocaleDateString()} at ${time}`;

  const browser = profile?.lastLoginMeta?.browser || "Unknown browser";
  const os = profile?.lastLoginMeta?.os || "Unknown OS";

  return `${datePrefix} from ${browser} on ${os}`;
};

const Settings = () => {
  const { data, isLoading, refetch } = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const showNotification = useUIStore((state) => state.showNotification);
  const { axiosInstance, notificationOn, setNotificationOn } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const profile = useMemo(() => data || user || null, [data, user]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    businessName: "Nirmalyam Kraft",
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password Change & Staff Management States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [staffFields, setStaffFields] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "sales",
  });
  const [creatingStaff, setCreatingStaff] = useState(false);

  // GST & Tax System Config State
  const [gstConfig, setGstConfig] = useState({
    gstEnabled: true,
    defaultGstRate: 18,
    defaultHsnCode: "4819 40 00",
    businessGstNumber: "27AAACN1234F1Z1",
    businessStateName: "Maharashtra",
    businessStateCode: "27",
    businessAddress: "Plot No. 12, Industrial Area, Nagpur, Maharashtra - 440001",
    businessPhone: "+91 90490 01299",
    businessEmail: "nirmalyamkrafts@gmail.com",
    bankDetails: {
      bankName: "State Bank of India",
      accountNo: "38920192019",
      ifscCode: "SBIN0001234",
      branch: "Nagpur Main",
    },
    termsAndConditions: "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within due date.\n3. Subject to Nagpur Jurisdiction.",
  });
  const [savingGstConfig, setSavingGstConfig] = useState(false);

  // HSN Master States
  const [showAddHsnModal, setShowAddHsnModal] = useState(false);
  const [showEditHsnModal, setShowEditHsnModal] = useState(false);
  const [hsnForm, setHsnForm] = useState({ hsn_code: "", description: "", gst_rate: 5 });
  const [editHsnForm, setEditHsnForm] = useState({ id: "", hsn_code: "", description: "", gst_rate: 5 });
  const [savingHsn, setSavingHsn] = useState(false);

  const { data: hsnMasterList, refetch: refetchHsnMaster } = useQuery({
    queryKey: ["getAllHsnMaster"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/hsn-master?all=true");
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const handleAddHsnEntry = async (e) => {
    e.preventDefault();
    if (!hsnForm.hsn_code || !hsnForm.description) {
      showNotification("Please fill HSN code and description", "error");
      return;
    }
    try {
      setSavingHsn(true);
      const res = await axiosInstance.post("/hsn-master", hsnForm);
      if (res.data?.success) {
        showNotification("HSN Master entry created successfully", "success");
        setShowAddHsnModal(false);
        setHsnForm({ hsn_code: "", description: "", gst_rate: 5 });
        refetchHsnMaster();
      } else {
        showNotification(res.data?.message || "Failed to add HSN entry", "error");
      }
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to create HSN entry", "error");
    } finally {
      setSavingHsn(false);
    }
  };

  const handleUpdateHsnRate = async (e) => {
    e.preventDefault();
    if (!editHsnForm.id) return;
    try {
      setSavingHsn(true);
      const res = await axiosInstance.put(`/hsn-master/${editHsnForm.id}`, {
        gst_rate: Number(editHsnForm.gst_rate),
        description: editHsnForm.description,
      });
      if (res.data?.success) {
        showNotification("HSN Rate updated with version history! Old rate preserved for past invoices.", "success");
        setShowEditHsnModal(false);
        refetchHsnMaster();
      } else {
        showNotification(res.data?.message || "Failed to update HSN rate", "error");
      }
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update HSN rate", "error");
    } finally {
      setSavingHsn(false);
    }
  };

  const { data: serverGstConfig, refetch: refetchGstConfig } = useQuery({
    queryKey: ["getGstConfig"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/admin/settings/gst");
        return res.data?.data || { gstEnabled: true, defaultGstRate: 18, defaultHsnCode: "4819 40 00" };
      } catch (err) {
        return { gstEnabled: true, defaultGstRate: 18, defaultHsnCode: "4819 40 00" };
      }
    },
  });

  useEffect(() => {
    if (serverGstConfig) {
      setGstConfig(serverGstConfig);
      try {
        localStorage.setItem("nirmalyam_gstConfig", JSON.stringify(serverGstConfig));
      } catch (_) {}
    }
  }, [serverGstConfig]);

  const handleSaveGstConfig = async () => {
    try {
      setSavingGstConfig(true);
      const res = await axiosInstance.patch("/admin/settings/gst", gstConfig);
      if (res.data?.success) {
        showNotification(res.data.message || "GST configuration updated successfully", "success");
        try {
          localStorage.setItem("nirmalyam_gstConfig", JSON.stringify(res.data.data));
        } catch (_) {}
        queryClient.invalidateQueries({ queryKey: ["getGstConfig"] });
        refetchGstConfig();
      } else {
        showNotification(res.data?.message || "Failed to update GST config", "error");
      }
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update GST config", "error");
    } finally {
      setSavingGstConfig(false);
    }
  };

  useEffect(() => {
    if (!profile) return;

    const nextForm = {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      role: profile?.role || "Admin",
      businessName: "Nirmalyam Kraft",
    };

    setFormData(nextForm);
    setInitialFormData(nextForm);
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePreferences = () => {
    showNotification(
      `Notifications ${notificationOn ? "enabled" : "disabled"} successfully`,
      "success"
    );
  };

  const handleSaveProfile = async () => {
    // 1. Full Name Validation
    const nameTrimmed = (formData.name || "").trim();
    if (!nameTrimmed) {
      showNotification("Full Name is required", "error");
      return;
    }
    if (nameTrimmed.length < 2) {
      showNotification("Full Name must be at least 2 characters long", "error");
      return;
    }
    if (nameTrimmed.length > 50) {
      showNotification("Full Name must not exceed 50 characters", "error");
      return;
    }
    if (!/^[a-zA-Z\s.-]+$/.test(nameTrimmed)) {
      showNotification("Full Name can only contain letters, spaces, dots, or hyphens", "error");
      return;
    }

    // 2. Email Address Validation
    const emailTrimmed = (formData.email || "").trim();
    if (!emailTrimmed) {
      showNotification("Email Address is required", "error");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailTrimmed)) {
      showNotification("Please enter a valid Email Address", "error");
      return;
    }

    // 3. Phone Number Validation
    const phoneTrimmed = (formData.phone || "").trim();
    if (!phoneTrimmed) {
      showNotification("Phone Number is required", "error");
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      showNotification("Please enter a valid 10-digit Phone Number (e.g. 8625067058)", "error");
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        name: nameTrimmed,
        email: emailTrimmed,
        phone: phoneTrimmed,
      };

      const res = await axiosInstance.patch("/admin/me/profile", payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to update profile");
      }

      await refetch();
      queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
      showNotification("Profile updated successfully", "success");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to update profile";
      showNotification(message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  };

  const onSubmitChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordFields.currentPassword || !passwordFields.newPassword) {
      showNotification("All password fields are required", "error");
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }
    if (passwordFields.newPassword.length < 6) {
      showNotification("New password must be at least 6 characters", "error");
      return;
    }

    try {
      setSecurityLoading(true);
      const res = await axiosInstance.patch("/admin/me/password", {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to change password");
      }

      showNotification("Password changed successfully", "success");
      setShowChangePasswordModal(false);
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to change password";
      showNotification(message, "error");
    } finally {
      setSecurityLoading(false);
    }
  };

  const { data: staffUsers, refetch: refetchStaff } = useQuery({
    queryKey: ["getStaffUsers"],
    queryFn: async () => {
      if (profile?.role !== "admin") return [];
      const res = await axiosInstance.get("/admin/users");
      return res.data?.data || [];
    },
    enabled: profile?.role === "admin",
  });

  const { data: loginLogs } = useQuery({
    queryKey: ["getMyLoginLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/login-logs");
      return res.data?.data || [];
    },
    enabled: !!profile,
  });

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffFields.name || !staffFields.phone || !staffFields.email || !staffFields.password) {
      showNotification("All staff fields are required", "error");
      return;
    }
    if (!/^\d{10}$/.test(staffFields.phone)) {
      showNotification("Phone number must be exactly 10 digits", "error");
      return;
    }

    try {
      setCreatingStaff(true);
      const res = await axiosInstance.post("/admin/users", staffFields);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to create staff user");
      }
      showNotification("Staff user created successfully", "success");
      setShowCreateStaffModal(false);
      setStaffFields({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "sales",
      });
      refetchStaff();
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to create staff user";
      showNotification(message, "error");
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (staffId === profile?._id) {
      showNotification("You cannot delete your own account here", "error");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this staff user?");
    if (!confirmDelete) return;

    try {
      const res = await axiosInstance.delete(`/admin/users/${staffId}`);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to delete staff user");
      }
      showNotification("Staff user deleted successfully", "success");
      refetchStaff();
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to delete staff user";
      showNotification(message, "error");
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!firstConfirm) return;

    const confirmText = window.prompt("Type DELETE to confirm account deletion:");
    if (confirmText !== "DELETE") {
      showNotification("Account deletion cancelled", "error");
      return;
    }

    try {
      setDeletingAccount(true);
      const res = await axiosInstance.delete("/admin/me");

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to delete account");
      }

      localStorage.removeItem("adminToken");
      queryClient.removeQueries({ queryKey: ["getCurrentUser"] });
      showNotification("Account deleted successfully", "success");
      navigate("/dashboard/login", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to delete account";
      showNotification(message, "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  const ToggleRow = ({ title, description, checked, onChange }) => (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition hover:border-emerald-200 hover:shadow-sm">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <Motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 md:p-8 shadow-sm"
        >
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-100 blur-3xl opacity-70" />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm border border-emerald-100">
                <Sparkles className="h-3.5 w-3.5" />
                Account Center
              </div>

              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 md:text-4xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                Settings
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
                Manage your profile, notifications, business information, and
                account security from one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-[300px]">
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
                <p className="text-xs text-gray-500">Account Type</p>
                <p className="mt-1 font-semibold text-gray-900">Premium Admin</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
                <p className="text-xs text-gray-500">Status</p>
                <p className="mt-1 font-semibold text-emerald-600">Active</p>
              </div>
            </div>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-8">
            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Settings
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Update your personal and business details
                    </p>
                  </div>

                  <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <User className="h-5 w-5" />
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-20 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <User className="h-4 w-4" />
                          Full Name
                        </div>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </div>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </div>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <ShieldCheck className="h-4 w-4" />
                          Role
                        </div>
                        <Input
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          placeholder="Role"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <Building2 className="h-4 w-4" />
                        Business Name
                      </div>
                      <Input
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Business name"
                        disabled
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3 ">
                      <Button
                        onClick={handleSaveProfile}
                        className="rounded-xl px-6 bg-green-800"
                        loading={savingProfile}
                        disabled={savingProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Bell className="h-5 w-5 text-emerald-600" />
                      Notification Preferences
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Choose how you want to receive updates
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ToggleRow
                    title="Alert Notification"
                    description="Get real-time low stock alerts, sound alerts, and browser notifications."
                    checked={notificationOn}
                    onChange={() => setNotificationOn(!notificationOn)}
                  />

                  <div className="flex flex-wrap gap-3 pt-3">
                    <Button
                      onClick={handleSavePreferences}
                      className="rounded-xl px-6"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.10 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                      GST & Tax Configuration
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 font-medium">
                      Enable or disable GST tax calculations system-wide and configure your default tax rate and HSN code.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-150">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-gray-900">Enable GST / Tax System</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {gstConfig.gstEnabled
                          ? "GST is ACTIVE. Taxes will be calculated across Quotations, Orders, Invoices & Receipts."
                          : "GST is DISABLED. System will default all tax calculations to 0%."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGstConfig(prev => ({ ...prev, gstEnabled: !prev.gstEnabled }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        gstConfig.gstEnabled ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          gstConfig.gstEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {gstConfig.gstEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="rounded-2xl border border-gray-200 p-3 bg-white">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Default System GST Rate (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={gstConfig.defaultGstRate}
                            onChange={(e) => setGstConfig(prev => ({ ...prev, defaultGstRate: Number(e.target.value || 0) }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                            placeholder="18"
                          />
                          <div className="flex gap-1">
                            {[18, 12, 5, 0].map(r => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setGstConfig(prev => ({ ...prev, defaultGstRate: r }))}
                                className={`px-2 py-1 text-xs font-bold rounded-lg border ${
                                  gstConfig.defaultGstRate === r ? "bg-emerald-700 text-white border-emerald-700" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {r}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-3 bg-white">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Default HSN Code
                        </label>
                        <input
                          type="text"
                          value={gstConfig.defaultHsnCode}
                          onChange={(e) => setGstConfig(prev => ({ ...prev, defaultHsnCode: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                          placeholder="4819 40 00"
                        />
                      </div>
                    </div>
                  )}

                  {/* Business & Tax Profile Settings */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business GST & Tax Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-200 p-3 bg-white">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Business GSTIN
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          value={gstConfig.businessGstNumber || ""}
                          onChange={(e) => setGstConfig(prev => ({ ...prev, businessGstNumber: e.target.value.toUpperCase() }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none uppercase"
                          placeholder="27AAACN1234F1Z1"
                        />
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-3 bg-white">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Business State Code
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={gstConfig.businessStateCode || ""}
                          onChange={(e) => setGstConfig(prev => ({ ...prev, businessStateCode: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                          placeholder="27"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-3 bg-white">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Registered Business Address
                      </label>
                      <textarea
                        rows={2}
                        value={gstConfig.businessAddress || ""}
                        onChange={(e) => setGstConfig(prev => ({ ...prev, businessAddress: e.target.value }))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                        placeholder="Plot No. 12, Industrial Area, Nagpur, Maharashtra - 440001"
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-3 bg-white space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                        Invoice Terms & Conditions
                      </label>
                      <textarea
                        rows={3}
                        value={gstConfig.termsAndConditions || ""}
                        onChange={(e) => setGstConfig(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 outline-none"
                        placeholder="1. Goods once sold will not be taken back."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveGstConfig}
                      loading={savingGstConfig}
                      disabled={savingGstConfig}
                      className="rounded-xl px-6 bg-emerald-700 hover:bg-emerald-800"
                    >
                      Save GST Settings
                    </Button>
                  </div>

                  {/* HSN MASTER CODES & GST RATES SECTION */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          HSN Master Table & Rate Management
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          View and manage HSN codes and GST rates. Editing a rate closes the active version and inserts a new row to preserve past invoice history.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowAddHsnModal(true)}
                        className="rounded-xl px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 font-bold inline-flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add HSN Entry
                      </Button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                            <th className="px-4 py-2.5">HSN Code</th>
                            <th className="px-4 py-2.5">Description</th>
                            <th className="px-4 py-2.5 text-center">GST Rate (%)</th>
                            <th className="px-4 py-2.5 text-center">Effective From</th>
                            <th className="px-4 py-2.5 text-center">Effective To</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                            <th className="px-4 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {hsnMasterList && hsnMasterList.length > 0 ? (
                            hsnMasterList.map((entry) => {
                              const isActive = !entry.effective_to || new Date(entry.effective_to) > new Date();
                              return (
                                <tr key={entry._id || entry.id} className={isActive ? "bg-white hover:bg-emerald-50/30" : "bg-gray-50/60 opacity-60"}>
                                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{entry.hsn_code}</td>
                                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{entry.description}</td>
                                  <td className="px-4 py-3 text-center font-black text-emerald-700">{entry.gst_rate}%</td>
                                  <td className="px-4 py-3 text-center font-mono text-[11px] text-gray-500">
                                    {entry.effective_from ? new Date(entry.effective_from).toLocaleDateString() : "Today"}
                                  </td>
                                  <td className="px-4 py-3 text-center font-mono text-[11px] text-gray-500">
                                    {entry.effective_to ? new Date(entry.effective_to).toLocaleDateString() : "— (Current)"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {isActive ? (
                                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                        🟢 Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                                        📜 Closed
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {isActive && (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="py-1 px-2.5 text-[11px] font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                        onClick={() => {
                                          setEditHsnForm({
                                            id: entry._id || entry.id,
                                            hsn_code: entry.hsn_code,
                                            description: entry.description,
                                            gst_rate: entry.gst_rate,
                                          });
                                          setShowEditHsnModal(true);
                                        }}
                                      >
                                        Edit Rate
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                No HSN Master entries found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </Motion.div>
          </div>

          <div className="space-y-8">
            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Appearance
                </h2>
                <p className="text-sm text-gray-600">
                  Your dashboard currently uses a clean light theme for better
                  readability and consistency.
                </p>

                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-900">
                    Clean, minimal, and focused UI
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Optimized for admin workflow and daily operations.
                  </p>
                </div>
              </Card>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  Security & Privacy
                </h2>
                <p className="text-sm text-gray-600">
                  Keep your account secure and updated
                </p>

                <div className="mt-5 space-y-4">
                  <Button
                    variant="secondary"
                    className="w-full rounded-xl"
                    onClick={() => setShowChangePasswordModal(true)}
                    loading={securityLoading}
                    disabled={securityLoading || deletingAccount}
                  >
                    Change Password
                  </Button>

                  <div className="border-t border-gray-200 pt-4">
                    <Button
                      variant="danger"
                      className="w-full rounded-xl"
                      onClick={handleDeleteAccount}
                      loading={deletingAccount}
                      disabled={deletingAccount || securityLoading}
                    >
                      Delete Account
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      Warning: This action cannot be undone.
                    </p>
                  </div>
                </div>
              </Card>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <Card className="rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Account Information
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-semibold text-gray-900">
                      {profile?.role || "Admin"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "---"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Subscription Status</span>
                    <span className="font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>
                </div>
              </Card>
            </Motion.div>
          </div>
        </div>

        {/* STAFF MANAGEMENT GRID SECTION */}
        {profile?.role === "admin" && (
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <Card className="rounded-3xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <UserPlus className="h-5 w-5 text-emerald-600" />
                    Staff Management
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Create and manage login profiles for your team members (Sales, Operations, etc.)
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateStaffModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 self-start sm:self-center"
                >
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {staffUsers && staffUsers.length > 0 ? (
                      staffUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-4 font-medium text-gray-900">{u.name}</td>
                          <td className="px-5 py-4 text-gray-600">{u.email}</td>
                          <td className="px-5 py-4 text-gray-600">{u.phone}</td>
                          <td className="px-5 py-4 text-right">
                            {u._id !== profile?._id ? (
                              <button
                                onClick={() => handleDeleteStaff(u._id)}
                                className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded-lg inline-flex items-center cursor-pointer"
                                title="Delete staff user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 font-normal italic">Current User</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                          No staff users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </Motion.div>
        )}

        {/* LOGIN ACTIVITY & SESSION LOGS */}
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Lock className="h-5 w-5 text-emerald-600" />
                Login History & Session Audit
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                View recent access logs, device details, and session status for security verification.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Logged In User</th>
                    <th className="px-5 py-3">Login Time</th>
                    <th className="px-5 py-3">Logout Time / Status</th>
                    <th className="px-5 py-3">Device / Browser</th>
                    <th className="px-5 py-3">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loginLogs && loginLogs.length > 0 ? (
                    loginLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4 font-medium text-gray-900">
                          <div>
                            <p>{profile?.name || "Admin User"}</p>
                            <p className="text-xs text-gray-500">{log.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                          {new Date(log.loginAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </td>
                        <td className="px-5 py-4">
                          {log.status === "Active" ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                              Active Session
                            </span>
                          ) : log.status === "Logged Out" ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center self-start rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                                Logged Out
                              </span>
                              {log.logoutAt && (
                                <span className="text-[10px] text-gray-400 mt-1 font-mono">
                                  {new Date(log.logoutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center self-start rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">
                                Expired / PW Reset
                              </span>
                              {log.logoutAt && (
                                <span className="text-[10px] text-gray-400 mt-1 font-mono">
                                  {new Date(log.logoutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {log.browser || "Unknown"} on {log.os || "Unknown"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-100 uppercase">
                            {profile?.role || "admin"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                        No login history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Motion.div>

        {/* CHANGE PASSWORD DIALOG MODAL */}
        <Modal
          isOpen={showChangePasswordModal}
          title="Change Password"
          onClose={() => {
            setShowChangePasswordModal(false);
            setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
          }}
        >
          <form onSubmit={onSubmitChangePassword} className="space-y-4">
            <p className="text-xs text-gray-500">
              Ensure your new password contains at least 6 characters.
            </p>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Current Password</label>
              <input
                type="password"
                required
                value={passwordFields.currentPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">New Password</label>
              <input
                type="password"
                required
                value={passwordFields.newPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordFields.confirmPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="Re-enter new password"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-5"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-5 bg-emerald-700 hover:bg-emerald-800"
                loading={securityLoading}
                disabled={securityLoading}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Modal>

        {/* CREATE STAFF MODAL */}
        <Modal
          isOpen={showCreateStaffModal}
          title="Add Staff Member"
          onClose={() => {
            setShowCreateStaffModal(false);
            setStaffFields({ name: "", phone: "", email: "", password: "", role: "sales" });
          }}
        >
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Full Name</label>
              <input
                type="text"
                required
                value={staffFields.name}
                onChange={(e) => setStaffFields(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="E.g., Amit Kumar"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Email Address</label>
              <input
                type="email"
                required
                value={staffFields.email}
                onChange={(e) => setStaffFields(prev => ({ ...prev, email: e.target.value.toLowerCase() }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="staff@nirmalyamkrafts.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Phone Number (10 digits)</label>
              <input
                type="text"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                value={staffFields.phone}
                onChange={(e) => setStaffFields(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, "") }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="E.g., 9876543210"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Password</label>
              <input
                type="password"
                required
                value={staffFields.password}
                onChange={(e) => setStaffFields(prev => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-5"
                onClick={() => {
                  setShowCreateStaffModal(false);
                  setStaffFields({ name: "", phone: "", email: "", password: "", role: "sales" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-5 bg-emerald-700 hover:bg-emerald-800"
                loading={creatingStaff}
                disabled={creatingStaff}
              >
                Create Profile
              </Button>
            </div>
          </form>
        </Modal>

        {/* ADD HSN MASTER MODAL */}
        <Modal
          isOpen={showAddHsnModal}
          title="Add New HSN Code Entry"
          onClose={() => {
            setShowAddHsnModal(false);
            setHsnForm({ hsn_code: "", description: "", gst_rate: 5 });
          }}
        >
          <form onSubmit={handleAddHsnEntry} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">HSN Code (4 to 8 Digits)</label>
              <input
                type="text"
                required
                value={hsnForm.hsn_code}
                onChange={(e) => setHsnForm(prev => ({ ...prev, hsn_code: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                placeholder="e.g. 4804"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">Description</label>
              <input
                type="text"
                required
                value={hsnForm.description}
                onChange={(e) => setHsnForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-900 focus:border-emerald-600 outline-none"
                placeholder="Uncoated kraft paper & paperboard, rolls/sheets"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">GST Rate (%)</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                step="any"
                value={hsnForm.gst_rate}
                onChange={(e) => setHsnForm(prev => ({ ...prev, gst_rate: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
                placeholder="5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-5"
                onClick={() => setShowAddHsnModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-5 bg-emerald-600 hover:bg-emerald-700 font-bold"
                loading={savingHsn}
                disabled={savingHsn}
              >
                Save HSN Code
              </Button>
            </div>
          </form>
        </Modal>

        {/* EDIT HSN RATE (VERSIONED) MODAL */}
        <Modal
          isOpen={showEditHsnModal}
          title={`Update GST Rate — HSN ${editHsnForm.hsn_code}`}
          onClose={() => setShowEditHsnModal(false)}
        >
          <form onSubmit={handleUpdateHsnRate} className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 font-medium">
              💡 <strong>Versioned Rate Update</strong>: Changing this rate will set <code className="font-bold">effective_to = Today</code> on the current entry and insert a new entry with the updated rate starting today. All historical invoices will preserve their original rate!
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">HSN Code</label>
              <input
                type="text"
                disabled
                value={editHsnForm.hsn_code}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">Description</label>
              <input
                type="text"
                required
                value={editHsnForm.description}
                onChange={(e) => setEditHsnForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-900 focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">New GST Rate (%)</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                step="any"
                value={editHsnForm.gst_rate}
                onChange={(e) => setEditHsnForm(prev => ({ ...prev, gst_rate: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-5"
                onClick={() => setShowEditHsnModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-5 bg-emerald-700 hover:bg-emerald-800 font-bold"
                loading={savingHsn}
                disabled={savingHsn}
              >
                Save Versioned Rate
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Settings;
