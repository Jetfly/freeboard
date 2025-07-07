"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  client?: string;
  status?: string;
}

interface MonthlyRevenueChartProps {
  transactions: Transaction[];
}

export function MonthlyRevenueChart({ transactions }: MonthlyRevenueChartProps) {
  // Get current month data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Calculate totals
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = monthlyIncome - monthlyExpenses;
  const profitMargin = monthlyIncome > 0 ? ((netBalance / monthlyIncome) * 100) : 0;

  // Prepare chart data
  const chartData = [
    {
      name: 'Revenus',
      value: monthlyIncome,
      type: 'income',
      color: '#10b981'
    },
    {
      name: 'Dépenses',
      value: monthlyExpenses,
      type: 'expense',
      color: '#ef4444'
    }
  ];

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className={`text-lg font-bold ${
            data.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.value.toLocaleString('fr-FR')}€
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
            </div>
            <Badge 
              variant={netBalance >= 0 ? "default" : "destructive"}
              className={netBalance >= 0 ? "bg-green-100 text-green-800" : ""}
            >
              {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('fr-FR')}€
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">Revenus</span>
                </div>
                <div className="text-sm font-bold text-green-600">
                  {monthlyIncome.toLocaleString('fr-FR')}€
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">Dépenses</span>
                </div>
                <div className="text-sm font-bold text-red-600">
                  {monthlyExpenses.toLocaleString('fr-FR')}€
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Marge</span>
                </div>
                <div className={`text-sm font-bold ${
                  profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Performance indicator */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Performance du mois</span>
                <span>
                  {currentMonthTransactions.filter(t => t.type === 'income').length} revenus • 
                  {currentMonthTransactions.filter(t => t.type === 'expense').length} dépenses
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, profitMargin))}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    profitMargin >= 50 ? 'bg-green-500' :
                    profitMargin >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}