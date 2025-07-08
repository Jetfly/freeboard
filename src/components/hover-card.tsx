"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverRotate?: number;
  glowEffect?: boolean;
  shadowIntensity?: 'light' | 'medium' | 'strong';
}

export function HoverCard({ 
  children, 
  className, 
  hoverScale = 1.02,
  hoverRotate = 0,
  glowEffect = false,
  shadowIntensity = 'medium'
}: HoverCardProps) {
  const getShadowClass = () => {
    switch (shadowIntensity) {
      case 'light':
        return 'hover:shadow-md';
      case 'strong':
        return 'hover:shadow-2xl';
      default:
        return 'hover:shadow-lg';
    }
  };

  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale,
        rotate: hoverRotate,
        y: -2
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      className={cn(
        "transition-all duration-300 cursor-pointer",
        getShadowClass(),
        glowEffect && "hover:ring-2 hover:ring-blue-200 hover:ring-opacity-50",
        className
      )}
    >
      <Card className={cn(
        "h-full transition-all duration-300",
        glowEffect && "hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
      )}>
        {children}
      </Card>
    </motion.div>
  );
}

// Variante avec effet de brillance
export function ShimmerCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        variants={{
          initial: { x: "-100%", opacity: 0 },
          hover: { 
            x: "100%", 
            opacity: [0, 0.3, 0],
            transition: { 
              duration: 0.6, 
              ease: "easeInOut" as const 
            }
          }
        }}
      />
      <Card className="h-full relative z-10">
        {children}
      </Card>
    </motion.div>
  );
}

// Card avec effet de pulsation
export function PulseCard({ 
  children, 
  className,
  pulseColor = "blue" 
}: { 
  children: React.ReactNode; 
  className?: string;
  pulseColor?: "blue" | "green" | "red" | "purple";
}) {
  const getPulseColorClass = () => {
    switch (pulseColor) {
      case 'green':
        return 'hover:ring-green-200';
      case 'red':
        return 'hover:ring-red-200';
      case 'purple':
        return 'hover:ring-purple-200';
      default:
        return 'hover:ring-blue-200';
    }
  };

  return (
    <motion.div
      className={cn(
        "transition-all duration-300 cursor-pointer",
        "hover:ring-4 hover:ring-opacity-30",
        getPulseColorClass(),
        className
      )}
      whileHover={{ 
        scale: 1.01,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }
      }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0)",
          "0 0 0 10px rgba(59, 130, 246, 0.1)",
          "0 0 0 0 rgba(59, 130, 246, 0)"
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}

// Card avec effet de rotation 3D
export function Card3D({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      className={cn("perspective-1000", className)}
      whileHover={{
        rotateY: 5,
        rotateX: 5,
        scale: 1.02
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      <Card className="h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {children}
      </Card>
    </motion.div>
  );
}