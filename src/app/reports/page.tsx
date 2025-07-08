"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, TrendingUp, PieChart, BarChart3, FileText } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { RevenueChart } from "@/components/revenue-chart";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { CashflowChart } from "@/components/cashflow-chart";
import toast from "react-hot-toast";
import { PDFExportService } from "@/lib/pdf-export-service";

type ReportPeriod = 'month' | 'quarter' | 'year';
type ReportType = 'financial' | 'vat' | 'category' | 'client';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [selectedType, setSelectedType] = useState<ReportType>('financial');
  const [selectedYear] = useState(new Date().getFullYear());
  const { user } = useAuth();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const { transactions: allTransactions, loading: transactionsLoading, stats } = useTransactions();

  const handleExportPDF = async () => {
    try {
      toast.loading('Génération du rapport PDF...');
      
      const reportData = {
        period: getPeriodLabel(selectedPeriod),
        reportType: getTypeLabel(selectedType),
        kpis: {
          totalRevenue: stats?.totalIncome || 0,
          totalExpenses: Math.abs(stats?.totalExpenses || 0),
          netProfit: stats?.netBalance || 0,
          totalVatCollected: dashboardData?.kpis.totalVatCollected || 0
        },
        transactions: allTransactions,
        categoryBreakdown: dashboardData?.categoryBreakdown || []
      };
      
      await PDFExportService.generateReport(reportData);
      toast.dismiss();
      toast.success('Rapport PDF généré avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.dismiss();
      toast.error('Erreur lors de la génération du rapport PDF');
    }
  };

  const getPeriodLabel = (period: ReportPeriod): string => {
    switch (period) {
      case 'month': return `${selectedYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      case 'quarter': return `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${selectedYear}`;
      case 'year': return selectedYear.toString();
      default: return period;
    }
  };

  const getTypeLabel = (type: ReportType): string => {
    switch (type) {
      case 'financial': return 'Financier';
      case 'vat': return 'TVA';
      case 'category': return 'Catégories';
      default: return type;
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Génération du rapport Excel...');
      
      const reportData = {
        period: getPeriodLabel(selectedPeriod),
        reportType: getTypeLabel(selectedType),
        kpis: {
          totalRevenue: stats?.totalIncome || 0,
          totalExpenses: Math.abs(stats?.totalExpenses || 0),
          netProfit: stats?.netBalance || 0,
          totalVatCollected: dashboardData?.kpis.totalVatCollected || 0
        },
        transactions: allTransactions,
        categoryBreakdown: dashboardData?.categoryBreakdown || []
      };
      
      await PDFExportService.generateExcelReport(reportData);
      toast.dismiss();
      toast.success('Rapport Excel généré avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast.dismiss();
      toast.error('Erreur lors de la génération du rapport Excel');
    }
  };

  // Fonctions utilitaires déjà définies plus haut

  if (dashboardLoading || transactionsLoading) {
    return (
      <PageWrapper>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
              <p className="text-muted-foreground">Analyses détaillées de vos données financières</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportExcel} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={handleExportPDF} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Select value={selectedPeriod} onValueChange={(value: string) => setSelectedPeriod(value as ReportPeriod)}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(value: string) => setSelectedType(value as ReportType)}>
            <SelectTrigger className="w-full sm:w-48">
              <BarChart3 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Rapport financier</SelectItem>
              <SelectItem value="vat">Rapport TVA</SelectItem>
              <SelectItem value="category">Analyse par catégorie</SelectItem>
              <SelectItem value="client">Analyse par client</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPIs de la période */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus {getPeriodLabel(selectedPeriod)}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.totalIncome.toLocaleString('fr-FR')}€
              </div>
              <p className="text-xs text-muted-foreground">
                {allTransactions.filter((t: any) => t.type === 'income').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépenses {getPeriodLabel(selectedPeriod)}</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Math.abs(stats?.totalExpenses || 0).toLocaleString('fr-FR')}€
              </div>
              <p className="text-xs text-muted-foreground">
                {allTransactions.filter((t: any) => t.type === 'expense').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.netBalance || 0).toLocaleString('fr-FR')}€
              </div>
              <p className="text-xs text-muted-foreground">
                Marge: {stats?.totalIncome ? ((stats.netBalance / stats.totalIncome) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TVA Collectée</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData?.kpis.totalVatCollected.toLocaleString('fr-FR')}€
              </div>
              <p className="text-xs text-muted-foreground">
                À reverser: {dashboardData?.kpis.totalVatToPay.toLocaleString('fr-FR')}€
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Graphiques dynamiques */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CashflowChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ExpensePieChart />
          </motion.div>
        </div>

        {/* Analyse par catégorie */}
        {selectedType === 'category' && dashboardData?.categoryBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        category.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {category.amount.toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rapport TVA détaillé */}
        {selectedType === 'vat' && dashboardData?.vatMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Rapport TVA Détaillé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Chiffre d'affaires annuel</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.vatMetrics.currentYearRevenue.toLocaleString('fr-FR')}€
                      </p>
                      <p className="text-sm text-blue-700">
                        Progression: {dashboardData.vatMetrics.vatProgress.toFixed(1)}% du seuil
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900">TVA collectée</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboardData.kpis.totalVatCollected.toLocaleString('fr-FR')}€
                      </p>
                      <p className="text-sm text-purple-700">
                        À reverser: {dashboardData.vatMetrics.vatToPay.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Statut actuel</h4>
                      <p className="text-lg font-bold text-green-600">
                        {dashboardData.vatMetrics.declarationType}
                      </p>
                      <p className="text-sm text-green-700">
                        Seuil: {dashboardData.vatMetrics.vatThreshold.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900">Prochaine déclaration</h4>
                      <p className="text-lg font-bold text-orange-600">
                        {new Date(dashboardData.vatMetrics.nextDeclarationDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-orange-700">
                        Type: {dashboardData.vatMetrics.declarationType}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}