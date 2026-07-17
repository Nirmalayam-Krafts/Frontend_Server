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
  AreaChart,
  Area,
} from "recharts";
import { Card } from "../ui";

export const RevenueChart = ({ data }) => {
  const gridColor = "#f3f4f6";
  const textColor = "#9ca3af";
  const labelColor = "#1f2937";

  return (
    <Card className="h-80 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Revenue Performance
        </h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
          Live Trend
        </span>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <YAxis 
              stroke={textColor} 
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const LeadConversionChart = ({ data }) => {
  const gridColor = "#f3f4f6";
  const textColor = "#9ca3af";
  const labelColor = "#1f2937";

  return (
    <Card className="h-80 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Conversion Funnel Analysis
        </h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
          Sales Pipeline
        </span>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis
              type="number"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" fill="#059669" radius={[0, 8, 8, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const InventoryChart = ({ data }) => {
  const labelColor = "#1f2937";
  const COLORS = ["#10b981", "#059669", "#34d399"];
  const normalizedData = Array.isArray(data)
    ? data.map((item, index) => ({
        ...item,
        value: Number(item?.value) || 0,
        _color: COLORS[index % COLORS.length],
      }))
    : [];

  const hasPositiveValues = normalizedData.some((item) => item.value > 0);
  const pieData = hasPositiveValues
    ? normalizedData.filter((item) => item.value > 0)
    : [{ name: "No Data", value: 100, _color: "#d1d5db" }];

  return (
    <Card className="h-80 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Inventory Distribution
        </h3>
        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-bold">
          Category Mix
        </span>
      </div>
      <div className="h-[220px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              labelLine={false}
              stroke="none"
              label={({ name, percentage, value }) =>
                hasPositiveValues ? `${name}: ${value}%` : "No inventory data"
              }
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry._color || COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontSize: "12px",
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
  const BAR_COLORS = ["#15803d", "#0284c7", "#f59e0b", "#7c3aed"];
  const toPercent = (value) => {
    const raw = String(value ?? "").replace("%", "").trim();
    const n = Number(raw);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  };

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
                {toPercent(item.percentage)}%
              </span>
            </div>
            <div className="w-full rounded-full h-2 bg-gray-200">
              {(() => {
                const percent = toPercent(item.percentage);
                const width = percent > 0 ? Math.max(percent, 2) : 0;
                const fillColor = item.color || BAR_COLORS[idx % BAR_COLORS.length];
                return (
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${width}%`,
                  backgroundColor: fillColor,
                }}
              />
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const CategorySalesChart = ({ data }) => {
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];
  const gridColor = "#f3f4f6";
  const textColor = "#9ca3af";
  const labelColor = "#1f2937";

  return (
    <Card className="h-80 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Category Wise Sales
        </h3>
        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold">
          By Category
        </span>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="category"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <YAxis
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
              formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]}
            />
            <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const ProductSalesChart = ({ data }) => {
  const gridColor = "#f3f4f6";
  const textColor = "#9ca3af";
  const labelColor = "#1f2937";

  return (
    <Card className="h-96 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Product Wise Sales
        </h3>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
          Top Products
        </span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis
              type="number"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <YAxis
              dataKey="productName"
              type="category"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              width={140}
              style={{ fontSize: "10px", fontWeight: "600" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value} units`, "Quantity Sold"]}
            />
            <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const ProductReturnsChart = ({ data }) => {
  const gridColor = "#f3f4f6";
  const textColor = "#9ca3af";
  const labelColor = "#1f2937";

  return (
    <Card className="h-96 shadow-sm border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Per Product Returns
        </h3>
        <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-bold">
          Return Analysis
        </span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis
              type="number"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "11px", fontWeight: "600" }}
            />
            <YAxis
              dataKey="productName"
              type="category"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              width={140}
              style={{ fontSize: "10px", fontWeight: "600" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: labelColor,
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value} units`, "Returned Quantity"]}
            />
            <Bar dataKey="returnedQuantity" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

