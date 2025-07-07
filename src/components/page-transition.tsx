"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  }
};

export function PageTransition({
  children,
  className = "",
  variant = 'fade',
  duration = 0.3
}: PageTransitionProps) {
  const selectedVariant = variants[variant];

  return (
    <motion.div
      className={className}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        duration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}

// Composant pour les transitions de contenu avec stagger
export function StaggeredPageTransition({
  children,
  className = "",
  staggerDelay = 0.1,
  variant = 'slideUp'
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
}) {
  const selectedVariant = variants[variant];

  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={selectedVariant.initial}
          animate={selectedVariant.animate}
          exit={selectedVariant.exit}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Composant pour les transitions de route avec AnimatePresence
export function RouteTransition({
  children,
  routeKey,
  variant = 'slide'
}: {
  children: ReactNode;
  routeKey: string;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
}) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={routeKey} variant={variant}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}

// Hook pour les transitions de navigation
export function usePageTransition() {
  const transitionTo = (href: string, variant: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' = 'slide') => {
    // Ajouter une classe de transition à la page actuelle
    document.body.style.overflow = 'hidden';
    
    // Créer un overlay de transition
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-white z-50 transition-opacity duration-300';
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);
    
    // Animer l'overlay
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Naviguer après l'animation
    setTimeout(() => {
      window.location.href = href;
    }, 150);
    
    // Nettoyer après la navigation
    setTimeout(() => {
      document.body.style.overflow = '';
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  };

  return { transitionTo };
}

// Composant de transition pour les modales
export function ModalTransition({
  children,
  isOpen,
  onClose
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Contenu de la modale */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Composant pour les transitions de sections
export function SectionTransition({
  children,
  className = "",
  delay = 0,
  direction = 'up'
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 30, x: 0 };
      case 'down': return { y: -30, x: 0 };
      case 'left': return { x: 30, y: 0 };
      case 'right': return { x: -30, y: 0 };
      default: return { y: 30, x: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...initialPos
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}

// Composant pour les transitions de liste avec stagger
export function ListTransition({
  children,
  className = "",
  staggerDelay = 0.05
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Composant pour les transitions de grille
export function GridTransition({
  children,
  className = "",
  columns = 3,
  staggerDelay = 0.1
}: {
  children: ReactNode[];
  className?: string;
  columns?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children.map((child, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const delay = (row + col) * 0.05;
        
        return (
          <motion.div
            key={index}
            variants={{
              hidden: { 
                opacity: 0, 
                scale: 0.8,
                y: 20
              },
              visible: { 
                opacity: 1, 
                scale: 1,
                y: 0
              }
            }}
            transition={{
              duration: 0.5,
              delay,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}