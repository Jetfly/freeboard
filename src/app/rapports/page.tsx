"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PredictiveInsights } from "@/components/predictive-insights";
import { TaxPlanning } from "@/components/tax-planning";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, FileText, Filter, BarChart3, Calculator, Euro } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { AnimatedCard } from "@/components/animated-card";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";
import toast from "react-hot-toast";

const monthlyData = [
  { month: 'Jan', revenus: 4500, depenses: 2100 },
  { month: 'Fév', revenus: 5200, depenses: 2300 },
  { month: 'Mar', revenus: 4800, depenses: 2000 },
  { month: 'Avr', revenus: 6100, depenses: 2800 },
  { month: 'Mai', revenus: 5800, depenses: 2500 },
  { month: 'Jun', revenus: 6500, depenses: 2900 },
  { month: 'Jul', revenus: 7200, depenses: 3100 },
  { month: 'Aoû', revenus: 6800, depenses: 2700 },
  { month: 'Sep', revenus: 7500, depenses: 3200 },
  { month: 'Oct', revenus: 8100, depenses: 3400 },
  { month: 'Nov', revenus: 7800, depenses: 3000 },
  { month: 'Déc', revenus: 8500, depenses: 3500 },
];

const categoryData = [
  { name: 'Développement web', value: 35, color: '#3B82F6' },
  { name: 'Conseil', value: 25, color: '#10B981' },
  { name: 'Design', value: 20, color: '#F59E0B' },
  { name: 'Formation', value: 12, color: '#EF4444' },
  { name: 'Support', value: 8, color: '#8B5CF6' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function RapportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'tax'>('overview');
  const [hasData, setHasData] = useState(true);

  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenus, 0);
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.depenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);
  const averageMonthlyRevenue = Math.round(totalRevenue / 12);
  const averageMonthlyExpenses = Math.round(totalExpenses / 12);

  const handleExportPDF = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Rapport PDF généré avec succès !');
    }, 2000);
  };

  const handleGenerateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Nouveau rapport généré !');
    }, 1500);
  };

  if (!hasData) {
    return (
      <PageWrapper>
        <EmptyState
          type="reports"
          onAction={handleGenerateReport}
        />
      </PageWrapper>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'insights', label: 'Insights Prédictifs', icon: TrendingUp },
    { id: 'tax', label: 'Planning Fiscal', icon: Calculator }
  ];

  return (
    <PageWrapper>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
              <p className="text-muted-foreground">
                Analysez vos performances financières avec insights prédictifs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPeriod(selectedPeriod === 'year' ? 'month' : 'year')}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {selectedPeriod === 'year' ? 'Annuel' : 'Mensuel'}
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isLoading ? 'Génération...' : 'Exporter PDF'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu conditionnel selon l'onglet */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
          <AnimatedCard delay={0.1}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires annuel</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="card" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {totalRevenue.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% vs année précédente
                  </p>
                </>
              )}
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard delay={0.2}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépenses annuelles</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="card" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    {totalExpenses.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% vs année précédente
                  </p>
                </>
              )}
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard delay={0.3}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="card" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {netProfit.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +18.7% vs année précédente
                  </p>
                </>
              )}
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard delay={0.4}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge bénéficiaire</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="card" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600">
                    {profitMargin}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% vs année précédente
                  </p>
                </>
              )}
            </CardContent>
          </AnimatedCard>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonLoader type="chart" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString('fr-FR')}€`, 
                          name === 'revenus' ? 'Revenus' : 'Dépenses'
                        ]}
                      />
                      <Bar dataKey="revenus" fill="#3B82F6" name="revenus" />
                      <Bar dataKey="depenses" fill="#EF4444" name="depenses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonLoader type="chart" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {categoryData.map((item, index) => (
                        <motion.div 
                          key={item.name} 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <Badge variant="outline">{item.value}%</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
            </div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Métriques de performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <SkeletonLoader type="table" />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm font-medium text-gray-600">Revenus moyens par mois</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(totalRevenue / 12).toLocaleString('fr-FR')}€
                        </p>
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm font-medium text-gray-600">Dépenses moyennes par mois</p>
                        <p className="text-2xl font-bold text-red-600">
                          {Math.round(totalExpenses / 12).toLocaleString('fr-FR')}€
                        </p>
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm font-medium text-gray-600">Croissance mensuelle moyenne</p>
                        <p className="text-2xl font-bold text-green-600">+8.3%</p>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Onglet Insights Prédictifs */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PredictiveInsights monthlyData={monthlyData} currentYear={2024} />
          </motion.div>
        )}

        {/* Onglet Planning Fiscal */}
        {activeTab === 'tax' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaxPlanning monthlyData={monthlyData} currentYear={2024} />
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}