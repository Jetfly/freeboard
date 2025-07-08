"use client";

import { useState, useEffect, useId } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  className = ""
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterId = useId();

  const spring = useSpring(0, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001
  });

  const display = useTransform(spring, (latest) => {
    return (prefix + latest.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix);
  });

  // Effet de roll-up avec des chiffres qui défilent
  const rollUpDisplay = useTransform(spring, (latest) => {
    const currentValue = Math.floor(latest);
    const progress = latest - currentValue;
    
    if (progress < 0.1) {
      return prefix + currentValue.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }
    
    return prefix + latest.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          spring.set(value);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${counterId}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [value, spring, isVisible]);

  useEffect(() => {
    if (isVisible) {
      spring.set(value);
    }
  }, [value, spring, isVisible]);

  return (
    <motion.span
      id={`counter-${counterId}`}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        style={{
          display: 'inline-block',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {rollUpDisplay}
      </motion.span>
    </motion.span>
  );
}