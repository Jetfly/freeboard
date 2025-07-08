'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardData, DashboardData } from '@/lib/dashboard-service'

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData(user.id);
      setData(dashboardData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
      // Données de secours en cas d'erreur
       setData({
          kpis: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            revenueGrowth: 0,
            expenseGrowth: 0,
            totalVatCollected: 0,
            totalVatToPay: 0,
            cashFlowDays: 0,
            averageMonthlyRevenue: 0,
          },
          vatMetrics: {
            currentYearRevenue: 0,
            vatThreshold: 36800,
            vatProgress: 0,
            nextDeclarationDate: '',
            declarationType: 'mensuelle',
            vatToPay: 0,
          },
          alerts: [],
          recentTransactions: [],
          monthlyData: [],
          categoryBreakdown: [],
        });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    fetchData();
  };

  return { data, loading, error, refreshData };
}