import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui";

export const RevenueChart = ({ data }) => {
  const gridColor = "#e5e7eb";
  const textColor = "#6b7280";
  const labelColor = "#111827";

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Revenue Trend
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="month"
              stroke={textColor}
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke={textColor} style={{ fontSize: "12px" }} />
            <Tooltip
              cursor={{ fill: "rgba(34, 197, 94, 0.1)" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: `1px solid ${gridColor}`,
                color: labelColor,
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const LeadConversionChart = ({ data }) => {
  const gridColor = "#e5e7eb";
  const textColor = "#6b7280";
  const labelColor = "#111827";
  const COLORS = ["#22c55e", "#16a34a", "#15803d"];

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Lead Conversion Funnel
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              type="number"
              stroke={textColor}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              stroke={textColor}
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: `1px solid ${gridColor}`,
                color: labelColor,
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#22c55e" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const InventoryChart = ({ data }) => {
  const labelColor = "#111827";
  const COLORS = ["#22c55e", "#8b5cf6", "#3b82f6"];

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Inventory Distribution
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: labelColor,
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const MultiLineChart = ({ data, lines }) => {
  const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6"];

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Trends</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#111827",
                borderRadius: "8px",
              }}
            />
            <Legend
              wrapperStyle={{
                color: "#6b7280",
              }}
            />
            {lines.map((line, idx) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={COLORS[idx % COLORS.length]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const HorizontalBarChart = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Paper Weight Standards
      </h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {item.standard}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {item.percentage}%
              </span>
            </div>
            <div className="w-full rounded-full h-2 bg-gray-200">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
