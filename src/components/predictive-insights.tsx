"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  ArrowRight
} from "lucide-react";

interface MonthlyData {
  month: string;
  revenus: number;
  depenses: number;
}

interface PredictiveInsightsProps {
  monthlyData: MonthlyData[];
  currentYear?: number;
}

interface Prediction {
  type: 'revenue' | 'expense' | 'growth';
  title: string;
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface Recommendation {
  id: string;
  type: 'pricing' | 'cost' | 'growth' | 'risk';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
  estimatedGain?: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  current: number;
}

const freelanceBenchmarks = {
  averageHourlyRate: 65,
  averageMonthlyRevenue: 5500,
  averageGrowthRate: 15,
  averageMargin: 68,
  averageUtilizationRate: 75
};

export function PredictiveInsights({ monthlyData, currentYear = 2024 }: PredictiveInsightsProps) {
  const [selectedTab, setSelectedTab] = useState<'predictions' | 'benchmarks' | 'recommendations' | 'alerts'>('predictions');

  // Calculs des métriques actuelles
  const currentMetrics = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenus, 0);
    const totalExpenses = monthlyData.reduce((sum, item) => sum + item.depenses, 0);
    const avgMonthlyRevenue = totalRevenue / monthlyData.length;
    const avgMonthlyExpenses = totalExpenses / monthlyData.length;
    const margin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;
    
    // Calcul de la croissance
    const firstHalf = monthlyData.slice(0, 6).reduce((sum, item) => sum + item.revenus, 0);
    const secondHalf = monthlyData.slice(6).reduce((sum, item) => sum + item.revenus, 0);
    const growthRate = ((secondHalf - firstHalf) / firstHalf) * 100;
    
    return {
      totalRevenue,
      totalExpenses,
      avgMonthlyRevenue,
      avgMonthlyExpenses,
      margin,
      growthRate
    };
  }, [monthlyData]);

  // Prédictions basées sur les tendances
  const predictions = useMemo((): Prediction[] => {
    const recentMonths = monthlyData.slice(-3);
    const avgRecentRevenue = recentMonths.reduce((sum, item) => sum + item.revenus, 0) / 3;
    const avgRecentExpenses = recentMonths.reduce((sum, item) => sum + item.depenses, 0) / 3;
    
    // Tendance des revenus
    const revenueGrowth = ((recentMonths[2].revenus - recentMonths[0].revenus) / recentMonths[0].revenus) * 100;
    const nextMonthRevenue = avgRecentRevenue * (1 + (revenueGrowth / 100));
    
    // Prédiction pour l'année suivante
    const yearlyProjection = avgRecentRevenue * 12 * (1 + (revenueGrowth / 100));
    
    return [
      {
        type: 'revenue',
        title: 'Revenus mois prochain',
        value: nextMonthRevenue,
        confidence: Math.min(85 + Math.abs(revenueGrowth), 95),
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable',
        description: `Basé sur la tendance des 3 derniers mois (${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%)`
      },
      {
        type: 'revenue',
        title: `Projection ${currentYear + 1}`,
        value: yearlyProjection,
        confidence: Math.max(70 - Math.abs(revenueGrowth), 60),
        trend: yearlyProjection > currentMetrics.totalRevenue ? 'up' : 'down',
        description: `Projection annuelle basée sur les tendances actuelles`
      },
      {
        type: 'growth',
        title: 'Taux de croissance',
        value: revenueGrowth,
        confidence: 80,
        trend: revenueGrowth > 5 ? 'up' : revenueGrowth < -5 ? 'down' : 'stable',
        description: 'Évolution mensuelle moyenne des revenus'
      }
    ];
  }, [monthlyData, currentMetrics, currentYear]);

  // Comparaisons sectorielles
  const benchmarkComparisons = useMemo(() => {
    return [
      {
        metric: 'Revenus mensuels moyens',
        current: currentMetrics.avgMonthlyRevenue,
        benchmark: freelanceBenchmarks.averageMonthlyRevenue,
        unit: '€',
        performance: currentMetrics.avgMonthlyRevenue / freelanceBenchmarks.averageMonthlyRevenue
      },
      {
        metric: 'Marge bénéficiaire',
        current: currentMetrics.margin,
        benchmark: freelanceBenchmarks.averageMargin,
        unit: '%',
        performance: currentMetrics.margin / freelanceBenchmarks.averageMargin
      },
      {
        metric: 'Taux de croissance',
        current: currentMetrics.growthRate,
        benchmark: freelanceBenchmarks.averageGrowthRate,
        unit: '%',
        performance: currentMetrics.growthRate / freelanceBenchmarks.averageGrowthRate
      }
    ];
  }, [currentMetrics]);

  // Recommandations automatiques
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    // Recommandation de prix si en dessous de la moyenne
    if (currentMetrics.avgMonthlyRevenue < freelanceBenchmarks.averageMonthlyRevenue * 0.9) {
      const suggestedIncrease = 15;
      const estimatedGain = (currentMetrics.avgMonthlyRevenue * (suggestedIncrease / 100)) * 12;
      recs.push({
        id: 'pricing-increase',
        type: 'pricing',
        priority: 'high',
        title: `Augmentez vos tarifs de ${suggestedIncrease}%`,
        description: 'Vos revenus sont inférieurs à la moyenne du secteur',
        impact: `+${estimatedGain.toLocaleString('fr-FR')}€/an`,
        action: 'Revoir votre grille tarifaire',
        estimatedGain
      });
    }
    
    // Recommandation de réduction des coûts si marge faible
    if (currentMetrics.margin < 60) {
      recs.push({
        id: 'cost-optimization',
        type: 'cost',
        priority: 'medium',
        title: 'Optimisez vos dépenses',
        description: 'Votre marge bénéficiaire est en dessous de l\'optimum',
        impact: `+${(currentMetrics.totalExpenses * 0.1).toLocaleString('fr-FR')}€/an`,
        action: 'Analyser et réduire les coûts non essentiels'
      });
    }
    
    // Recommandation de diversification si croissance faible
    if (currentMetrics.growthRate < 5) {
      recs.push({
        id: 'diversification',
        type: 'growth',
        priority: 'medium',
        title: 'Diversifiez vos services',
        description: 'Votre croissance est limitée',
        impact: '+20-30% de revenus potentiels',
        action: 'Explorer de nouveaux créneaux ou services'
      });
    }
    
    return recs;
  }, [currentMetrics]);

  // Alertes business
  const alerts = useMemo((): Alert[] => {
    const alertList: Alert[] = [];
    
    // Alerte baisse d'activité
    const lastThreeMonths = monthlyData.slice(-3);
    const previousThreeMonths = monthlyData.slice(-6, -3);
    const recentAvg = lastThreeMonths.reduce((sum, item) => sum + item.revenus, 0) / 3;
    const previousAvg = previousThreeMonths.reduce((sum, item) => sum + item.revenus, 0) / 3;
    const activityChange = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (activityChange < -10) {
      alertList.push({
        id: 'activity-decline',
        type: 'warning',
        title: 'Baisse d\'activité détectée',
        message: `Vos revenus ont diminué de ${Math.abs(activityChange).toFixed(1)}% sur les 3 derniers mois`,
        metric: 'Revenus mensuels',
        threshold: previousAvg,
        current: recentAvg
      });
    }
    
    // Alerte marge faible
    if (currentMetrics.margin < 50) {
      alertList.push({
        id: 'low-margin',
        type: 'danger',
        title: 'Marge bénéficiaire critique',
        message: 'Votre marge est dangereusement basse',
        metric: 'Marge bénéficiaire',
        threshold: 60,
        current: currentMetrics.margin
      });
    }
    
    // Alerte dépenses élevées
    const expenseRatio = (currentMetrics.avgMonthlyExpenses / currentMetrics.avgMonthlyRevenue) * 100;
    if (expenseRatio > 40) {
      alertList.push({
        id: 'high-expenses',
        type: 'warning',
        title: 'Dépenses élevées',
        message: 'Vos dépenses représentent plus de 40% de vos revenus',
        metric: 'Ratio dépenses/revenus',
        threshold: 40,
        current: expenseRatio
      });
    }
    
    return alertList;
  }, [monthlyData, currentMetrics]);

  const tabs = [
    { id: 'predictions', label: 'Prédictions', icon: TrendingUp, count: predictions.length },
    { id: 'benchmarks', label: 'Comparaisons', icon: BarChart3, count: benchmarkComparisons.length },
    { id: 'recommendations', label: 'Recommandations', icon: Lightbulb, count: recommendations.length },
    { id: 'alerts', label: 'Alertes', icon: AlertTriangle, count: alerts.length }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Insights Actionnables
        </CardTitle>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedTab === 'predictions' && (
          <div className="space-y-4">
            {predictions.map((prediction, index) => {
              const Icon = prediction.trend === 'up' ? TrendingUp : prediction.trend === 'down' ? TrendingDown : BarChart3;
              const trendColor = prediction.trend === 'up' ? 'text-green-600' : prediction.trend === 'down' ? 'text-red-600' : 'text-gray-600';
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${trendColor}`} />
                        <h4 className="font-medium">{prediction.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {prediction.confidence}% confiance
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold mb-1">
                        {prediction.type === 'growth' 
                          ? `${prediction.value > 0 ? '+' : ''}${prediction.value.toFixed(1)}%`
                          : `${prediction.value.toLocaleString('fr-FR')}€`
                        }
                      </p>
                      <p className="text-sm text-gray-600">{prediction.description}</p>
                      <div className="mt-2">
                        <Progress value={prediction.confidence} className="h-2" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {selectedTab === 'benchmarks' && (
          <div className="space-y-4">
            {benchmarkComparisons.map((comparison, index) => {
              const performance = comparison.performance;
              const isAbove = performance > 1;
              const percentage = ((performance - 1) * 100);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{comparison.metric}</h4>
                    <Badge variant={isAbove ? 'default' : 'secondary'}>
                      {isAbove ? 'Au-dessus' : 'En-dessous'} de la moyenne
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Votre performance</p>
                      <p className="text-xl font-bold">
                        {comparison.current.toLocaleString('fr-FR')}{comparison.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Moyenne secteur</p>
                      <p className="text-xl font-bold text-gray-600">
                        {comparison.benchmark.toLocaleString('fr-FR')}{comparison.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAbove ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isAbove ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isAbove ? '+' : ''}{percentage.toFixed(1)}% vs moyenne
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(performance * 50, 100)} 
                    className="h-2 mt-2" 
                  />
                </motion.div>
              );
            })}
          </div>
        )}
        
        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune recommandation pour le moment</p>
                <p className="text-sm">Vos performances sont optimales !</p>
              </div>
            ) : (
              recommendations.map((rec, index) => {
                const priorityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-orange-200 bg-orange-50',
                  low: 'border-blue-200 bg-blue-50'
                };
                
                const priorityBadgeColors = {
                  high: 'bg-red-100 text-red-800',
                  medium: 'bg-orange-100 text-orange-800',
                  low: 'bg-blue-100 text-blue-800'
                };
                
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${priorityColors[rec.priority]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge className={priorityBadgeColors[rec.priority]}>
                            {rec.priority === 'high' ? 'Priorité haute' : 
                             rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-green-600">
                            Impact: {rec.impact}
                          </span>
                          {rec.estimatedGain && (
                            <span className="text-gray-600">
                              Gain estimé: {rec.estimatedGain.toLocaleString('fr-FR')}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Action: {rec.action}
                      </span>
                      <Button size="sm" variant="outline" className="ml-4">
                        Appliquer
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
        
        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune alerte active</p>
                <p className="text-sm">Tout va bien !</p>
              </div>
            ) : (
              alerts.map((alert, index) => {
                const alertColors = {
                  warning: 'border-orange-200 bg-orange-50',
                  danger: 'border-red-200 bg-red-50',
                  info: 'border-blue-200 bg-blue-50'
                };
                
                const alertIcons = {
                  warning: AlertTriangle,
                  danger: AlertTriangle,
                  info: AlertTriangle
                };
                
                const alertIconColors = {
                  warning: 'text-orange-600',
                  danger: 'text-red-600',
                  info: 'text-blue-600'
                };
                
                const Icon = alertIcons[alert.type];
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${alertColors[alert.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${alertIconColors[alert.type]}`} />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Seuil recommandé:</span>
                            <span className="ml-2 font-medium">
                              {alert.threshold.toLocaleString('fr-FR')}
                              {alert.metric.includes('%') ? '%' : '€'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Valeur actuelle:</span>
                            <span className="ml-2 font-medium">
                              {alert.current.toLocaleString('fr-FR')}
                              {alert.metric.includes('%') ? '%' : '€'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}