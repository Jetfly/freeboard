"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { RevenueChart } from "@/components/revenue-chart";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { ProgressGoals } from "@/components/progress-goals";
import { MiniCalendar } from "@/components/mini-calendar";
import { QuickActions } from "@/components/quick-actions";
import { TransactionModal } from "@/components/transaction-modal";

import { AnimatedCounter } from "@/components/animated-counter";
import { PageWrapper } from "@/components/page-wrapper";
import { VatProvision } from "@/components/vat-provision";
import { CashFlowDays } from "@/components/cash-flow-days";
import { NextDeclaration } from "@/components/next-declaration";
import { CashflowChart } from "@/components/cashflow-chart";
import { HoverCard, ShimmerCard } from "@/components/hover-card";
import { ChartSkeleton, useChartLoading } from "@/components/chart-skeleton";
import { Confetti, useConfetti } from "@/components/confetti";
import { CustomToaster, useActionNotifications } from "@/components/toast-notifications";
import toast from "react-hot-toast";

const kpis = [
  {
    title: "Revenus totaux",
    value: 45231,
    displayValue: "45,231€",
    change: "+20.1%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
    suffix: "€"
  },
  {
    title: "Croissance",
    value: 12.5,
    displayValue: "+12.5%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    prefix: "+",
    suffix: "%",
    decimals: 1
  },
  {
    title: "Dépenses",
    value: 12234,
    displayValue: "12,234€",
    change: "-4.3%",
    changeType: "negative" as const,
    icon: CreditCard,
    color: "text-red-600",
    bgColor: "bg-red-100",
    suffix: "€"
  }
];

const recentTransactions = [
  {
    id: 1,
    description: "Développement site web - Client A",
    amount: 2500,
    type: "income" as const,
    date: "2024-01-15",
    category: "Développement"
  },
  {
    id: 2,
    description: "Abonnement Adobe Creative Suite",
    amount: -59.99,
    type: "expense" as const,
    date: "2024-01-14",
    category: "Logiciels"
  },
  {
    id: 3,
    description: "Consultation marketing - Client B",
    amount: 800,
    type: "income" as const,
    date: "2024-01-12",
    category: "Conseil"
  }
];

export default function DashboardPage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { isLoading: isChartLoading } = useChartLoading(2000);
  const { shouldTrigger, triggerConfetti, resetConfetti } = useConfetti();
  const { notifySuccess, notifyInfo, notifyWarning } = useActionNotifications();

  const handleAddTransaction = () => {
    setIsTransactionModalOpen(true);
    notifySuccess("Ouverture du modal de transaction");
  };

  // Déclencher confetti quand un objectif est atteint
  const handleGoalAchieved = () => {
    triggerConfetti();
    notifySuccess("Objectif atteint ! 🎉");
  };

  // Notifications pour les interactions
  const handleKpiClick = (kpiTitle: string) => {
    notifyInfo(`Détails de ${kpiTitle}`);
  };

  const handleChartInteraction = (chartName: string) => {
    notifyInfo(`Analyse de ${chartName}`);
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Aperçu de vos finances</p>
        </motion.div>

        {/* KPIs traditionnels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3 lg:grid-cols-3"
        >
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div 
                 onClick={() => handleKpiClick(kpi.title)}
                 className="cursor-pointer"
               >
                 <Card className="min-h-[280px] flex flex-col transition-all duration-300 hover:shadow-lg border rounded-lg border-gray-200 hover:border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600 leading-relaxed">{kpi.title}</CardTitle>
                  <motion.div 
                    className={`p-2 rounded-lg ${kpi.bgColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </motion.div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center pt-2">
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    <AnimatedCounter 
                      value={kpi.value}
                      prefix={kpi.prefix || ""}
                      suffix={kpi.suffix || ""}
                      decimals={kpi.decimals || 0}
                      duration={2000}
                      className="text-2xl font-bold"
                    />
                  </div>
                  <motion.p 
                    className={`text-sm flex items-center leading-relaxed ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {kpi.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {kpi.change} vs mois dernier
                  </motion.p>
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <VatProvision currentRevenue={45231} vatThreshold={36800} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <CashFlowDays currentCash={25000} monthlyExpenses={8500} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <NextDeclaration 
              nextDeadline={new Date('2024-04-30')} 
              declarationType="TVA trimestrielle" 
            />
          </motion.div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="lg:col-span-4"
          >
            <div onClick={() => handleChartInteraction("Flux de trésorerie")} className="cursor-pointer">
              {isChartLoading ? (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 leading-relaxed">Flux de trésorerie</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ChartSkeleton type="line" />
                  </CardContent>
                </Card>
              ) : (
                <CashflowChart />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="lg:col-span-3"
          >
            <div onClick={() => handleChartInteraction("Répartition des dépenses")} className="cursor-pointer">
              {isChartLoading ? (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 leading-relaxed">Répartition des dépenses</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ChartSkeleton type="pie" />
                  </CardContent>
                </Card>
              ) : (
                <ExpensePieChart />
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <ProgressGoals />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <MiniCalendar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <QuickActions onAddTransaction={handleAddTransaction} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 leading-relaxed">Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors hover:shadow-sm"
                  >
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900 leading-relaxed">{transaction.description}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-medium">{transaction.category}</span> • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString('fr-FR')}€
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSubmit={(data) => {
            console.log('Transaction ajoutée:', data);
            toast.success('Transaction ajoutée avec succès !');
            setIsTransactionModalOpen(false);
          }}
        />

        {/* Confetti pour les célébrations */}
         <Confetti trigger={shouldTrigger} onComplete={resetConfetti} />
         
         {/* Toast notifications */}
         <CustomToaster />
      </div>
    </PageWrapper>
  );
}