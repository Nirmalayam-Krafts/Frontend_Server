import React from "react";
import { Layout } from "../../components/common/Layout";
import { Card } from "../../components/ui";

const ActivityLogs = () => {
  return (
    <Layout title="Activity Logs" subtitle="Review activity records across the dashboard.">
      <Card className="p-6">
        <p className="text-sm text-gray-600">No activity logs available yet.</p>
      </Card>
    </Layout>
  );
};

export default ActivityLogs;
