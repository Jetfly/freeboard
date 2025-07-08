"use client";

import { useState, useEffect, useId } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { CheckCircle, Target } from "lucide-react";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showGoal?: boolean;
  goalValue?: number;
  className?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600'
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

export function AnimatedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  showGoal = false,
  goalValue,
  className = ''
}: AnimatedProgressProps) {
  const [isVisible, setIsVisible] = useState(false);
  const progressId = useId();
  const percentage = Math.min((value / max) * 100, 100);
  const isGoalReached = goalValue ? value >= goalValue : false;
  const goalPercentage = goalValue ? Math.min((goalValue / max) * 100, 100) : 0;

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001
  });

  const width = useTransform(spring, (latest) => `${latest}%`);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          spring.set(percentage);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`progress-${progressId}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [percentage, spring, isVisible]);

  useEffect(() => {
    if (isVisible) {
      spring.set(percentage);
    }
  }, [percentage, spring, isVisible]);

  return (
    <div className={`space-y-2 ${className}`} id={`progress-${progressId}`}>
      {/* Label et pourcentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <motion.span 
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {showGoal && <Target className="h-4 w-4" />}
              {label}
              {isGoalReached && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 15,
                    delay: 1 
                  }}
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </motion.div>
              )}
            </motion.span>
          )}
          {showPercentage && (
            <motion.span 
              className="text-sm font-bold text-gray-900"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {percentage.toFixed(0)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Barre de progression */}
      <div className="relative">
        {/* Background */}
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          {/* Progress bar */}
          <motion.div
            className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full relative overflow-hidden`}
            style={{ width }}
            initial={{ width: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </motion.div>
        </div>

        {/* Goal marker */}
        {showGoal && goalValue && (
          <motion.div
            className="absolute top-0 h-full w-0.5 bg-gray-600"
            style={{ left: `${goalPercentage}%` }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="absolute -top-6 -left-4 text-xs font-medium text-gray-600 whitespace-nowrap">
              Objectif
            </div>
          </motion.div>
        )}
      </div>

      {/* Valeurs numériques */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {value.toLocaleString('fr-FR')}
        </motion.span>
        {showGoal && goalValue && (
          <motion.span
            className={`font-medium ${isGoalReached ? 'text-green-600' : 'text-gray-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Objectif: {goalValue.toLocaleString('fr-FR')}
          </motion.span>
        )}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {max.toLocaleString('fr-FR')}
        </motion.span>
      </div>
    </div>
  );
}