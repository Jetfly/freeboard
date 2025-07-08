"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getFinancialGoals } from "@/lib/dashboard-service";

interface CashflowData {
  month: string;
  cashflow: number;
  objectif: number;
  cumule: number;
}

interface CashflowChartProps {
  data?: CashflowData[];
  yearlyTarget?: number;
}

export function CashflowChart({ data, yearlyTarget }: CashflowChartProps) {
  const { data: dashboardData, loading } = useDashboardData();
  const { user } = useAuth();
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [defaultYearlyTarget, setDefaultYearlyTarget] = useState(300000);

  // Récupérer les objectifs financiers pour déterminer l'objectif annuel
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return;
      
      try {
        const goals = await getFinancialGoals(user.id);
        setFinancialGoals(goals);
        
        // Chercher un objectif annuel de revenus
        const yearlyRevenueGoal = goals.find(goal => 
          goal.goal_type === 'revenue' && goal.period === 'yearly'
        );
        
        if (yearlyRevenueGoal) {
          setDefaultYearlyTarget(yearlyRevenueGoal.target_amount);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des objectifs:', error);
      }
    };

    fetchGoals();
  }, [user?.id]);

  // Utiliser les données du dashboard ou les données passées en props
  const chartData: CashflowData[] = data || (dashboardData?.monthlyData.map((monthData, index) => {
    const monthlyTarget = (yearlyTarget || defaultYearlyTarget) / 12;
    const cumulativeTarget = monthlyTarget * (index + 1);
    
    // Calculer le cumulé réel
    const cumulativeActual = dashboardData.monthlyData
      .slice(0, index + 1)
      .reduce((sum, m) => sum + m.netCashFlow, 0);
    
    return {
      month: monthData.month,
      cashflow: monthData.netCashFlow,
      objectif: monthlyTarget,
      cumule: cumulativeActual
    };
  }) || []);

  const finalYearlyTarget = yearlyTarget || defaultYearlyTarget;

  if (loading || !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash-flow vs Objectifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const currentTotal = chartData[chartData.length - 1]?.cumule || 0;
  const progressPercentage = (currentTotal / finalYearlyTarget) * 100;
  const monthsRemaining = 12 - chartData.length;
  const averageNeeded = monthsRemaining > 0 ? (finalYearlyTarget - currentTotal) / monthsRemaining : 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label} 2024`}</p>
          <p className="text-blue-600">
            {`Cash-flow: ${payload[0]?.value?.toLocaleString('fr-FR')}€`}
          </p>
          <p className="text-green-600">
            {`Objectif: ${payload[1]?.value?.toLocaleString('fr-FR')}€`}
          </p>
          <p className="text-purple-600">
            {`Cumulé: ${payload[2]?.value?.toLocaleString('fr-FR')}€`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cash-flow vs Objectifs</span>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Objectif annuel: {finalYearlyTarget.toLocaleString('fr-FR')}€</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Métriques de performance */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium">Réalisé</span>
              </div>
              <p className="text-lg font-bold text-blue-600">{currentTotal.toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% de l'objectif</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium">Moyenne/mois</span>
              </div>
              <p className="text-lg font-bold text-green-600">{Math.round(currentTotal / chartData.length).toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted-foreground">Sur {chartData.length} mois</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm font-medium">Besoin/mois</span>
              </div>
              <p className="text-lg font-bold text-purple-600">{Math.round(averageNeeded).toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted-foreground">Pour atteindre l'objectif</p>
            </div>
          </div>
          
          {/* Graphique */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Ligne de référence pour l'objectif mensuel moyen */}
                <ReferenceLine 
                  y={finalYearlyTarget / 12} 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  label={{ value: "Objectif mensuel moyen", position: "top" }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="cashflow" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Cash-flow réel"
                />
                <Line 
                  type="monotone" 
                  dataKey="objectif" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  name="Objectif mensuel"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumule" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  name="Cumulé"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Indicateur de performance */}
          <div className={`p-3 rounded-lg border ${
            progressPercentage >= 100 ? 'bg-green-50 border-green-200' :
            progressPercentage >= 75 ? 'bg-blue-50 border-blue-200' :
            progressPercentage >= 50 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {progressPercentage >= 100 ? '🎯 Objectif atteint !' :
                 progressPercentage >= 75 ? '📈 Bonne progression' :
                 progressPercentage >= 50 ? '⚡ Accélération nécessaire' :
                 '🚨 Retard important'}
              </span>
              <span className="text-sm text-muted-foreground">
                {monthsRemaining > 0 ? `${monthsRemaining} mois restants` : 'Année terminée'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}