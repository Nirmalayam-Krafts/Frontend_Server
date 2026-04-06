import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input } from "../../components/ui";
import { useAuthStore, useUIStore } from "../../store";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useCurrentUser } from "../../../../hook/admin";
import { useAuthContext } from "../../../context/Adminauth";

const Settings = () => {
  const { data, isLoading } = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const showNotification = useUIStore((state) => state.showNotification);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    businessName: "Nirmalyam Krafts",
  });

  const { notificationOn, setNotificationOn } = useAuthContext();
  useEffect(() => {
    const profile = data?.data || data || user;

    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile?.name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        role: profile?.role || "Admin",
      }));
    }
  }, [data, user]);

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

  const handleSaveProfile = () => {
    showNotification("Profile updated successfully", "success");
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
        className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-emerald-600" : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"
            }`}
        />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
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
        </motion.div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-8">
            <motion.div
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
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3 ">
                      <Button
                        onClick={handleSaveProfile}
                        className="rounded-xl px-6 bg-green-800"
                      >
                        Save Changes
                      </Button>
                      <Button variant="secondary" className="rounded-xl px-6">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
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
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
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
            </motion.div>

            <motion.div
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
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Last login:</span> Today at
                      10:30 AM from Chrome on Windows
                    </p>
                  </div>

                  <Button variant="secondary" className="w-full rounded-xl">
                    Change Password
                  </Button>

                  <Button variant="secondary" className="w-full rounded-xl">
                    Enable Two-Factor Auth
                  </Button>

                  <div className="border-t border-gray-200 pt-4">
                    <Button variant="danger" className="w-full rounded-xl">
                      Delete Account
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      Warning: This action cannot be undone.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
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
                      {data?.role || "Admin"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "---"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Subscription Status</span>
                    <span className="font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-500">Renewal Date</span>
                    <span className="font-semibold text-gray-900">
                      {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "---"}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;