"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CashFlowDaysProps {
  currentCash: number;
  monthlyExpenses: number;
}

export function CashFlowDays({ currentCash = 25000, monthlyExpenses = 8500 }: CashFlowDaysProps) {
  // Calcul des jours de trésorerie restants
  const dailyExpenses = monthlyExpenses / 30;
  const daysRemaining = Math.floor(currentCash / dailyExpenses);
  
  // Détermination du niveau d'alerte
  const getAlertLevel = (days: number) => {
    if (days < 30) return { level: 'critical', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle };
    if (days < 60) return { level: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: TrendingDown };
    return { level: 'safe', color: 'text-green-600', bgColor: 'bg-green-100', icon: Wallet };
  };
  
  const alert = getAlertLevel(daysRemaining);
  
  const getStatusMessage = (days: number) => {
    if (days < 30) return 'Trésorerie critique';
    if (days < 60) return 'Attention trésorerie';
    return 'Trésorerie saine';
  };
  
  return (
    <Card className={`transition-all duration-300 hover:shadow-lg border rounded-lg ${
      alert.level === 'critical' ? 'border-red-200 bg-red-50' : 
      alert.level === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:border-blue-200'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium text-gray-900 leading-relaxed">Jours de trésorerie</CardTitle>
        <div className={`p-2 rounded-lg ${alert.bgColor}`}>
          <alert.icon className={`h-4 w-4 ${alert.color}`} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-2xl font-bold text-gray-900 mb-4">{daysRemaining} jours</div>
        <div className="mt-4 space-y-3">
          <p className={`text-sm font-semibold leading-relaxed ${alert.color} mb-3`}>
            {getStatusMessage(daysRemaining)}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium">Trésorerie:</span> {currentCash.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium">Charges mensuelles:</span> {monthlyExpenses.toLocaleString('fr-FR')}€
            </p>
          </div>
          {alert.level === 'critical' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600 font-semibold leading-relaxed">
                ⚠️ Action requise rapidement
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}