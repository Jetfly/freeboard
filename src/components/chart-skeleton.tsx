"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  className?: string;
  type?: 'line' | 'bar' | 'pie' | 'area';
  showLegend?: boolean;
}

export function ChartSkeleton({ 
  className, 
  type = 'line', 
  showLegend = true 
}: ChartSkeletonProps) {
  const pulseAnimation = {
    animate: {
      opacity: [0.4, 0.8, 0.4],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const renderLineChart = () => (
    <div className="space-y-4">
      {/* Chart area */}
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-8 bg-gray-200 rounded"
              {...pulseAnimation}
              transition={{ ...pulseAnimation.transition, delay: i * 0.1 }}
            />
          ))}
        </div>
        
        {/* Chart lines */}
        <div className="absolute inset-0 pl-12 pr-4 pt-4 pb-8">
          <svg className="w-full h-full">
            {/* Grid lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.line
                key={`grid-${i}`}
                x1="0"
                y1={`${(i + 1) * 20}%`}
                x2="100%"
                y2={`${(i + 1) * 20}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
                {...pulseAnimation}
                transition={{ ...pulseAnimation.transition, delay: i * 0.05 }}
              />
            ))}
            
            {/* Chart line */}
            <motion.path
              d="M 0 80 Q 25 60 50 70 T 100 40"
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              vectorEffect="non-scaling-stroke"
              {...pulseAnimation}
            />
            
            {/* Data points */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.circle
                key={`point-${i}`}
                cx={`${i * 20}%`}
                cy={`${60 + Math.sin(i) * 20}%`}
                r="4"
                fill="#3b82f6"
                {...pulseAnimation}
                transition={{ ...pulseAnimation.transition, delay: i * 0.1 }}
              />
            ))}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-2 left-12 right-4 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-8 bg-gray-200 rounded"
              {...pulseAnimation}
              transition={{ ...pulseAnimation.transition, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="space-y-4">
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-gray-300 rounded-t flex-1"
              style={{ height: `${30 + (i % 4) * 20}%` }}
              {...pulseAnimation}
              transition={{ ...pulseAnimation.transition, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="space-y-4">
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <motion.div
          className="w-40 h-40 rounded-full border-8 border-gray-300 border-t-blue-300 border-r-green-300 border-b-yellow-300 border-l-red-300"
          {...pulseAnimation}
          animate={{
            ...pulseAnimation.animate,
            rotate: [0, 360]
          }}
          transition={{
            opacity: pulseAnimation.transition,
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear" as const
            }
          }}
        />
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="space-y-4">
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          <motion.path
            d="M 0 100 Q 25 60 50 70 T 100 40 L 100 100 Z"
            fill="url(#areaGradient)"
            {...pulseAnimation}
          />
          
          <motion.path
            d="M 0 80 Q 25 60 50 70 T 100 40"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            {...pulseAnimation}
          />
        </svg>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <div className={cn("p-4 bg-white rounded-lg border", className)}>
      {/* Title skeleton */}
      <div className="mb-4 space-y-2">
        <motion.div
          className="h-4 w-32 bg-gray-200 rounded"
          {...pulseAnimation}
        />
        <motion.div
          className="h-3 w-48 bg-gray-100 rounded"
          {...pulseAnimation}
          transition={{ ...pulseAnimation.transition, delay: 0.1 }}
        />
      </div>
      
      {/* Chart */}
      {renderChart()}
      
      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              {...pulseAnimation}
              transition={{ ...pulseAnimation.transition, delay: i * 0.1 }}
            >
              <div className="w-3 h-3 bg-gray-300 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook pour gérer l'état de chargement des graphiques
export function useChartLoading(initialDelay = 1000) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialDelay);
    
    return () => clearTimeout(timer);
  }, [initialDelay]);
  
  return { isLoading, setIsLoading };
}