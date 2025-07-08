"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, DollarSign, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { AnimatedProgress } from "@/components/animated-progress";
import { MiniConfetti, useGoalCelebration, CelebrationModal } from "@/components/confetti-animation";

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

const goals: Goal[] = [
  {
    id: "revenue",
    title: "Chiffre d'affaires",
    current: 8500,
    target: 12000,
    unit: "€",
    icon: <DollarSign className="h-4 w-4" />,
    color: "bg-blue-500",
    description: "Objectif mensuel"
  },
  {
    id: "clients",
    title: "Nouveaux clients",
    current: 3,
    target: 5,
    unit: "",
    icon: <Users className="h-4 w-4" />,
    color: "bg-green-500",
    description: "Ce mois-ci"
  },
  {
    id: "projects",
    title: "Projets terminés",
    current: 7,
    target: 10,
    unit: "",
    icon: <Target className="h-4 w-4" />,
    color: "bg-purple-500",
    description: "Objectif mensuel"
  },
  {
    id: "growth",
    title: "Croissance",
    current: 15,
    target: 20,
    unit: "%",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-orange-500",
    description: "vs mois dernier"
  }
];

export function ProgressGoals() {
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [triggerConfetti, setTriggerConfetti] = useState<{ [key: string]: boolean }>({});
  const { showCelebration, celebrationData, triggerCelebration, closeCelebration } = useGoalCelebration();

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
  }, [completedGoals, triggerCelebration]);

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