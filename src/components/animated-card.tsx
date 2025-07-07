"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  hover?: boolean;
  className?: string;
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  hover = true, 
  className = "" 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      className="h-full"
    >
      <Card 
        className={`h-full transition-shadow duration-200 ${hover ? 'hover:shadow-lg hover:shadow-blue-100' : ''} ${className}`}
      >
        {children}
      </Card>
    </motion.div>
  );
}