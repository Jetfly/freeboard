"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#8B5CF6", "#6B7280", "#EC4899", "#14B8A6", 
  "#F97316", "#84CC16"
];

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface ExpensePieChartProps {
  data?: ExpenseData[];
}

const CustomTooltip = ({ active, payload, expenseData }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = expenseData.reduce((sum: number, item: ExpenseData) => sum + item.value, 0);
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.value.toLocaleString('fr-FR')} € ({((data.value / total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { data: dashboardData, loading } = useDashboardData();
  
  // Utiliser les données passées en props ou les données du dashboard
  const expenseData: ExpenseData[] = data || (dashboardData?.categoryBreakdown.map((category, index) => ({
    name: category.category,
    value: category.amount,
    color: COLORS[index % COLORS.length]
  })) || []);
  
  const total = expenseData.reduce((sum, item) => sum + item.value, 0);
  
  if (loading || !expenseData.length) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-orange-600" />
            Répartition des Dépenses
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">0 €</div>
            <p className="text-xs text-gray-500">Total ce mois</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-32 bg-gray-200 rounded-full mx-auto w-32"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-orange-600" />
          Répartition des Dépenses
        </CardTitle>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {total.toLocaleString('fr-FR')} €
          </div>
          <p className="text-xs text-gray-500">Total ce mois</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} expenseData={expenseData} />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Detailed breakdown */}
        <div className="mt-4 space-y-2">
          {expenseData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.value.toLocaleString('fr-FR')} €</span>
                  <span className="text-gray-400 text-xs">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}