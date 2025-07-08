"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, DollarSign, Users, Briefcase, BarChart, PieChart } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { AnimatedProgress } from "@/components/animated-progress";
import { MiniConfetti, useGoalCelebration, CelebrationModal } from "@/components/confetti-animation";
import { getFinancialGoals } from "@/lib/dashboard-service";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Fonction pour obtenir l'icône appropriée en fonction du type d'objectif
const getIconForGoalType = (type: string) => {
  switch (type) {
    case 'revenue':
      return <DollarSign className="h-4 w-4" />;
    case 'clients':
      return <Users className="h-4 w-4" />;
    case 'projects':
      return <Target className="h-4 w-4" />;
    case 'growth':
      return <TrendingUp className="h-4 w-4" />;
    case 'profit':
      return <BarChart className="h-4 w-4" />;
    case 'contracts':
      return <Briefcase className="h-4 w-4" />;
    default:
      return <PieChart className="h-4 w-4" />;
  }
};

// Fonction pour obtenir la couleur appropriée en fonction du type d'objectif
const getColorForGoalType = (type: string) => {
  switch (type) {
    case 'revenue':
      return "bg-blue-500";
    case 'clients':
      return "bg-green-500";
    case 'projects':
      return "bg-purple-500";
    case 'growth':
      return "bg-orange-500";
    case 'profit':
      return "bg-indigo-500";
    case 'contracts':
      return "bg-pink-500";
    default:
      return "bg-gray-500";
  }
};

export function ProgressGoals() {
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [triggerConfetti, setTriggerConfetti] = useState<{ [key: string]: boolean }>({});
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showCelebration, celebrationData, triggerCelebration, closeCelebration } = useGoalCelebration();
  const { user } = useAuth();
  const { data: dashboardData } = useDashboardData();

  // Récupérer les objectifs financiers depuis Supabase
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const goals = await getFinancialGoals(user.id);
        setFinancialGoals(goals);
      } catch (error) {
        console.error('Erreur lors de la récupération des objectifs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user?.id]);

  // Calculer les valeurs actuelles basées sur les données du dashboard
  const getCurrentValue = (goalType: string) => {
    if (!dashboardData) return 0;
    
    switch (goalType) {
      case 'revenue':
        return dashboardData.kpis.totalRevenue;
      case 'profit':
        return dashboardData.kpis.netProfit;
      case 'growth':
        return Math.max(0, dashboardData.kpis.revenueGrowth);
      case 'clients':
        // Estimation basée sur les transactions récentes avec des clients différents
        const uniqueClients = new Set(
          dashboardData.recentTransactions
            .filter(t => t.client_name)
            .map(t => t.client_name)
        );
        return uniqueClients.size;
      case 'projects':
        // Estimation basée sur le nombre de transactions de revenus
        return dashboardData.recentTransactions.filter(t => t.type === 'income').length;
      default:
        return 0;
    }
  };

  // Transformer les objectifs Supabase en format Goal
  const goals: Goal[] = useMemo(() => {
    if (!financialGoals.length || !dashboardData) {
      // Objectifs par défaut si aucun objectif n'est défini
      return [
        {
          id: "revenue",
          title: "Chiffre d'affaires",
          current: dashboardData?.kpis.totalRevenue || 0,
          target: 12000,
          unit: "€",
          icon: getIconForGoalType('revenue'),
          color: getColorForGoalType('revenue'),
          description: "Objectif mensuel"
        },
        {
          id: "profit",
          title: "Bénéfice net",
          current: dashboardData?.kpis.netProfit || 0,
          target: 5000,
          unit: "€",
          icon: getIconForGoalType('profit'),
          color: getColorForGoalType('profit'),
          description: "Objectif mensuel"
        }
      ];
    }

    return financialGoals.map(goal => ({
      id: goal.id,
      title: goal.title,
      current: getCurrentValue(goal.goal_type),
      target: goal.target_amount,
      unit: goal.unit || "€",
      icon: getIconForGoalType(goal.goal_type),
      color: getColorForGoalType(goal.goal_type),
      description: goal.description || "Objectif personnalisé"
    }));
  }, [financialGoals, dashboardData]);

  // Vérifier les objectifs atteints
  useEffect(() => {
    goals.forEach(goal => {
      const isCompleted = goal.current >= goal.target;
      if (isCompleted && !completedGoals.has(goal.id)) {
        setCompletedGoals(prev => new Set([...prev, goal.id]));
        setTriggerConfetti(prev => ({ ...prev, [goal.id]: true }));
        
        // Déclencher la célébration pour le premier objectif atteint
        if (completedGoals.size === 0) {
          setTimeout(() => {
            triggerCelebration(
              "🎉 Objectif atteint !",
              `Félicitations ! Vous avez atteint votre objectif "${goal.title}".`
            );
          }, 1000);
        }
      }
    });
  }, [goals, completedGoals, triggerCelebration]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Objectifs du Mois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                    <div className="space-y-1">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Objectifs du Mois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals.map((goal, index) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${goal.color} text-white`}>
                    {goal.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{goal.title}</h4>
                    <p className="text-xs text-gray-500">{goal.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    <AnimatedCounter 
                      value={goal.current}
                      suffix={goal.unit}
                      duration={1500}
                      className="inline"
                    /> / {goal.target.toLocaleString('fr-FR')}{goal.unit}
                  </div>
                  <div className={`text-xs font-medium ${
                    isCompleted ? 'text-green-600' : percentage >= 75 ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    <AnimatedCounter 
                      value={percentage}
                      suffix="%"
                      decimals={0}
                      duration={1500}
                      className="inline"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <AnimatedProgress 
                  value={percentage}
                  showPercentage={false}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0{goal.unit}</span>
                  <span>{goal.target.toLocaleString('fr-FR')}{goal.unit}</span>
                </div>
              </div>
              
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-xs text-green-600 font-medium relative"
                >
                  <Target className="h-3 w-3" />
                  Objectif atteint !
                  {triggerConfetti[goal.id] && (
                    <MiniConfetti 
                      trigger={true}
                      x={200}
                      y={100}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
        
        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression globale</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(goals.reduce((acc, goal) => acc + Math.min((goal.current / goal.target) * 100, 100), 0) / goals.length)}%
            </span>
          </div>
          <AnimatedProgress 
            value={goals.reduce((acc, goal) => acc + Math.min((goal.current / goal.target) * 100, 100), 0) / goals.length}
            showPercentage={false}
            className="h-3"
          />
        </motion.div>
      </CardContent>
    </Card>
    
    <CelebrationModal
      isOpen={showCelebration}
      onClose={closeCelebration}
      title={celebrationData.title}
      message={celebrationData.message}
      confettiIntensity="medium"
    />
    </>
  );
}