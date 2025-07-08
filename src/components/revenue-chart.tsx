"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData } from "@/hooks/use-dashboard-data";

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { data: dashboardData, loading } = useDashboardData();
  
  // Utiliser les données passées en props ou les données du dashboard
  const chartData: RevenueData[] = data || (dashboardData?.monthlyData.map(monthData => ({
    month: monthData.month,
    revenue: monthData.revenue
  })) || []);
  
  if (loading || !chartData.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis 
            dataKey="month" 
            className="text-gray-600"
            fontSize={12}
          />
          <YAxis 
            className="text-gray-600"
            fontSize={12}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            formatter={(value) => [`${value}€`, "Chiffre d'affaires"]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}