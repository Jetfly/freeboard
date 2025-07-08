"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function Confetti({ 
  trigger, 
  onComplete, 
  duration = 3000, 
  particleCount = 50 
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Créer les particules
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 10,
        velocityY: Math.random() * 5 + 5,
        gravity: Math.random() * 0.3 + 0.2
      }));
      
      setParticles(newParticles);
      
      // Nettoyer après la durée
      setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      }, duration);
    }
  }, [trigger, isActive, duration, particleCount, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
              opacity: 1
            }}
            animate={{
              x: particle.x + particle.velocityX * 100,
              y: window.innerHeight + 100,
              rotate: particle.rotation + 720,
              opacity: 0
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook pour déclencher les confetti
export function useConfetti() {
  const [shouldTrigger, setShouldTrigger] = useState(false);
  
  const triggerConfetti = () => {
    setShouldTrigger(true);
  };
  
  const resetConfetti = () => {
    setShouldTrigger(false);
  };
  
  return {
    shouldTrigger,
    triggerConfetti,
    resetConfetti
  };
}