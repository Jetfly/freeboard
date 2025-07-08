"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MiniCalendar } from "@/components/mini-calendar";
import { QuickActions } from "@/components/quick-actions";
import { TransactionModal } from "@/components/transaction-modal";
import { AnimatedCounter } from "@/components/animated-counter";
import { PageWrapper } from "@/components/page-wrapper";
import { VatProvision } from "@/components/vat-provision";
import { CashFlowDays } from "@/components/cash-flow-days";
import { NextDeclaration } from "@/components/next-declaration";
import { Confetti, useConfetti } from "@/components/confetti";
import { CustomToaster, useActionNotifications } from "@/components/toast-notifications";

// Composants lazy optimisés
import {
  LazyRevenueChart,
  LazyExpensePieChart,
  LazyCashflowChart,
  LazyProgressGoals,
  LazyVatAlerts,
  KpiSkeleton,
  TransactionSkeleton,
  useIntersectionObserver
} from "@/components/lazy-dashboard-components";

// Hook optimisé
import { useDashboardDataOptimized } from "@/hooks/use-dashboard-data-optimized";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPageOptimized() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { shouldTrigger, triggerConfetti, resetConfetti } = useConfetti();
  const { notifySuccess, notifyInfo } = useActionNotifications();
  const { user } = useAuth();
  const { data: dashboardData, loading: dashboardLoading, refreshData } = useDashboardDataOptimized();

  // Memoization des KPIs pour éviter les recalculs
  const kpis = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      {
        title: "Revenus totaux",
        value: dashboardData.kpis.totalRevenue,
        change: `${dashboardData.kpis.revenueGrowth >= 0 ? '+' : ''}${dashboardData.kpis.revenueGrowth.toFixed(1)}%`,
        changeType: dashboardData.kpis.revenueGrowth >= 0 ? "positive" as const : "negative" as const,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-100",
        suffix: "€"
      },
      {
        title: "Bénéfice net",
        value: dashboardData.kpis.netProfit,
        change: `${dashboardData.kpis.revenueGrowth >= 0 ? '+' : ''}${dashboardData.kpis.revenueGrowth.toFixed(1)}%`,
        changeType: dashboardData.kpis.netProfit >= 0 ? "positive" as const : "negative" as const,
        icon: TrendingUp,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        suffix: "€"
      },
      {
        title: "Dépenses",
        value: dashboardData.kpis.totalExpenses,
        change: `${dashboardData.kpis.expenseGrowth >= 0 ? '+' : ''}${dashboardData.kpis.expenseGrowth.toFixed(1)}%`,
        changeType: dashboardData.kpis.expenseGrowth <= 0 ? "positive" as const : "negative" as const,
        icon: CreditCard,
        color: "text-red-600",
        bgColor: "bg-red-100",
        suffix: "€"
      }
    ];
  }, [dashboardData]);

  const recentTransactions = useMemo(() => 
    dashboardData?.recentTransactions || [], 
    [dashboardData?.recentTransactions]
  );

  // Callbacks optimisés
  const handleAddTransaction = useCallback(() => {
    setIsTransactionModalOpen(true);
    notifySuccess("Ouverture du modal de transaction");
  }, [notifySuccess]);

  const handleKpiClick = useCallback((kpiTitle: string) => {
    notifyInfo(`Détails de ${kpiTitle}`);
  }, [notifyInfo]);

  // Intersection observers pour lazy loading
  const chartsRef = useIntersectionObserver(() => {
    // Les graphiques sont maintenant visibles, ils vont se charger automatiquement
  });

  const transactionsRef = useIntersectionObserver(() => {
    // Les transactions sont maintenant visibles
  });

  if (dashboardLoading) {
    return (
      <PageWrapper>
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Aperçu de vos finances</p>
        </motion.div>

        {/* KPIs optimisés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2, transition: { duration: 0.1 } }}
            >
              <div 
                onClick={() => handleKpiClick(kpi.title)}
                className="cursor-pointer"
              >
                <Card className="min-h-[280px] flex flex-col transition-all duration-200 hover:shadow-lg border rounded-lg border-gray-200 hover:border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                      <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center pt-2">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      <AnimatedCounter 
                        value={kpi.value}
                        suffix={kpi.suffix}
                        duration={1000}
                        className="text-2xl font-bold"
                      />
                    </div>
                    <p className={`text-sm flex items-center ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {kpi.change} vs mois dernier
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Métriques actionables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <VatProvision 
            currentRevenue={dashboardData?.vatMetrics.currentYearRevenue || 0} 
            vatThreshold={dashboardData?.vatMetrics.vatThreshold || 36800} 
          />
          <CashFlowDays 
            currentCash={dashboardData?.kpis.netProfit || 0} 
            monthlyExpenses={dashboardData?.kpis.totalExpenses || 0} 
          />
          <NextDeclaration 
            nextDeadline={dashboardData?.vatMetrics.nextDeclarationDate ? new Date(dashboardData.vatMetrics.nextDeclarationDate) : new Date()} 
            declarationType={dashboardData?.vatMetrics.declarationType || 'Micro-entreprise'} 
          />
        </motion.div>

        {/* Alertes TVA */}
        <LazyVatAlerts />

        {/* Graphiques avec lazy loading */}
        <div ref={chartsRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <LazyCashflowChart />
          </div>
          <div className="lg:col-span-3">
            <LazyExpensePieChart />
          </div>
        </div>

        {/* Autres composants */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <LazyProgressGoals />
          <MiniCalendar />
          <QuickActions onAddTransaction={handleAddTransaction} />
        </div>

        {/* Transactions récentes */}
        <div ref={transactionsRef}>
          {recentTransactions.length > 0 ? (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Transactions récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{transaction.category}</span> • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className={`font-bold text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <TransactionSkeleton />
          )}
        </div>

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onTransactionAdded={refreshData}
        />

        <Confetti trigger={shouldTrigger} onComplete={resetConfetti} />
        <CustomToaster />
      </div>
    </PageWrapper>
  );
}