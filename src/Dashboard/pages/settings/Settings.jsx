import React, { useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Input } from "../../components/ui";
import { useAuthStore, useUIStore } from "../../store";

import { Settings as SettingsIcon, Bell, Lock } from "lucide-react";

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const showNotification = useUIStore((state) => state.showNotification);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+91-987654321",
    businessName: "Nirmalyam Krafts",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    orderUpdates: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = () => {
    showNotification("Profile updated successfully", "success");
  };

  const handleSavePreferences = () => {
    showNotification("Preferences saved successfully", "success");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, preferences, and account settings.
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update your personal and business information
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <Input
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-4 flex gap-2">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Control how you receive updates and notifications
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "emailNotifications",
                  label: "Email Notifications",
                  description: "Receive updates via email",
                },
                {
                  key: "pushNotifications",
                  label: "Push Notifications",
                  description: "Get push alerts on your device",
                },
                {
                  key: "weeklyReports",
                  label: "Weekly Reports",
                  description: "Receive weekly business summary",
                },
                {
                  key: "orderUpdates",
                  label: "Order Updates",
                  description: "Real-time order status updates",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pref.label}
                    </p>
                    <p className="text-xs text-gray-600">{pref.description}</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[pref.key]}
                      onChange={() => handlePreferenceChange(pref.key)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </label>
                </div>
              ))}

              <div className="pt-4 flex gap-2">
                <Button onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Our dashboard uses a light, clean design for optimal readability
                and consistency.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security & Privacy
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage password and security settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Last login:</strong> Today at 10:30 AM from Chrome on
                  Windows
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="secondary">Change Password</Button>
                <Button variant="secondary">Enable Two-Factor Auth</Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button variant="danger" className="w-full md:w-auto">
                  Delete Account
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Warning: This action cannot be undone.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Account Type</p>
                <p className="font-medium text-gray-900">Premium Admin</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Member Since</p>
                <p className="font-medium text-gray-900">January 2024</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Subscription Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Renewal Date</p>
                <p className="font-medium text-gray-900">June 30, 2024</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;
