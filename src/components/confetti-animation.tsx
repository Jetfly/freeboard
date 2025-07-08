"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
}

interface ConfettiAnimationProps {
  trigger: boolean;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
  onComplete?: () => void;
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const intensitySettings = {
  low: { count: 30, spread: 60 },
  medium: { count: 60, spread: 80 },
  high: { count: 100, spread: 100 }
};

export function ConfettiAnimation({
  trigger,
  duration = 3000,
  intensity = 'medium',
  colors = defaultColors,
  onComplete
}: ConfettiAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const createConfettiPiece = (id: number): ConfettiPiece => {
    const settings = intensitySettings[intensity];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    return {
      id,
      x: centerX + (Math.random() - 0.5) * settings.spread,
      y: centerY,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: -(Math.random() * 15 + 10),
        rotation: (Math.random() - 0.5) * 10
      }
    };
  };

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      const settings = intensitySettings[intensity];
      const newConfetti = Array.from({ length: settings.count }, (_, i) => 
        createConfettiPiece(i)
      );
      setConfetti(newConfetti);

      const timer = setTimeout(() => {
        setIsActive(false);
        setConfetti([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, intensity, duration, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              initial={{
                x: piece.x,
                y: piece.y,
                rotate: piece.rotation,
                opacity: 1,
                scale: 1
              }}
              animate={{
                x: piece.x + piece.velocity.x * 50,
                y: window.innerHeight + 100,
                rotate: piece.rotation + piece.velocity.rotation * 50,
                opacity: 0,
                scale: 0.5
              }}
              transition={{
                duration: duration / 1000,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Composant de célébration avec confetti et message
export function CelebrationModal({
  isOpen,
  onClose,
  title = "Félicitations !",
  message = "Vous avez atteint votre objectif !",
  confettiIntensity = 'high'
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confettiIntensity?: 'low' | 'medium' | 'high';
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
              {/* Icône de succès animée */}
              <motion.div
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
              >
                <motion.svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
              
              {/* Titre */}
              <motion.h2
                className="text-2xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h2>
              
              {/* Message */}
              <motion.p
                className="text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {message}
              </motion.p>
              
              {/* Bouton de fermeture */}
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continuer
              </motion.button>
            </div>
          </motion.div>
          
          {/* Confetti */}
          <ConfettiAnimation
            trigger={isOpen}
            intensity={confettiIntensity}
            duration={4000}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// Hook pour déclencher automatiquement les confetti
export function useGoalCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    title: string;
    message: string;
  }>({ title: "", message: "" });

  const triggerCelebration = (title: string, message: string) => {
    setCelebrationData({ title, message });
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  return {
    showCelebration,
    celebrationData,
    triggerCelebration,
    closeCelebration
  };
}

// Composant de confetti simple pour les micro-interactions
export function MiniConfetti({ 
  trigger, 
  x = 0, 
  y = 0 
}: { 
  trigger: boolean; 
  x?: number; 
  y?: number; 
}) {
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: x,
        y: y,
        color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
        size: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: -(Math.random() * 8 + 4),
          rotation: (Math.random() - 0.5) * 8
        }
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1500);
    }
  }, [trigger, x, y]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: particle.x,
            y: particle.y,
            rotate: particle.rotation,
            opacity: 1,
            scale: 1
          }}
          animate={{
            x: particle.x + particle.velocity.x * 20,
            y: particle.y + particle.velocity.y * 20,
            rotate: particle.rotation + particle.velocity.rotation * 20,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
}