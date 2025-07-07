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
    <Card className={`transition-all duration-300 ${
      alert.level === 'critical' ? 'border-red-200 bg-red-50' : 
      alert.level === 'warning' ? 'border-orange-200 bg-orange-50' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Jours de trésorerie</CardTitle>
        <div className={`p-2 rounded-lg ${alert.bgColor}`}>
          <alert.icon className={`h-4 w-4 ${alert.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{daysRemaining} jours</div>
        <div className="mt-2 space-y-1">
          <p className={`text-xs font-medium ${alert.color}`}>
            {getStatusMessage(daysRemaining)}
          </p>
          <p className="text-xs text-muted-foreground">
            Trésorerie: {currentCash.toLocaleString('fr-FR')}€
          </p>
          <p className="text-xs text-muted-foreground">
            Charges mensuelles: {monthlyExpenses.toLocaleString('fr-FR')}€
          </p>
          {alert.level === 'critical' && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-600 font-medium mt-2"
            >
              ⚠️ Action requise rapidement
            </motion.p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}