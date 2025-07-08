"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Smartphone, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface OneHandedContextType {
  isOneHandedMode: boolean;
  reachableHeight: number;
  toggleOneHandedMode: () => void;
  isReachable: (elementTop: number) => boolean;
}

const OneHandedContext = createContext<OneHandedContextType | undefined>(undefined);

export function useOneHanded() {
  const context = useContext(OneHandedContext);
  if (!context) {
    throw new Error('useOneHanded must be used within OneHandedProvider');
  }
  return context;
}

interface OneHandedProviderProps {
  children: React.ReactNode;
}

export function OneHandedProvider({ children }: OneHandedProviderProps) {
  const [isOneHandedMode, setIsOneHandedMode] = useState(false);
  const [reachableHeight, setReachableHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const height = window.innerHeight;
      setScreenHeight(height);
      // Thumb reach is approximately 75% of screen height from bottom
      // This is based on ergonomic studies for average hand size
      setReachableHeight(height * 0.75);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  const toggleOneHandedMode = () => {
    setIsOneHandedMode(!isOneHandedMode);
  };

  const isReachable = (elementTop: number) => {
    if (!isOneHandedMode) return true;
    return elementTop >= (screenHeight - reachableHeight);
  };

  return (
    <OneHandedContext.Provider value={{
      isOneHandedMode,
      reachableHeight,
      toggleOneHandedMode,
      isReachable
    }}>
      {children}
    </OneHandedContext.Provider>
  );
}

// Component for one-handed mode toggle
interface OneHandedToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function OneHandedToggle({ className, showLabel = true }: OneHandedToggleProps) {
  const { isOneHandedMode, toggleOneHandedMode } = useOneHanded();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleOneHandedMode}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-h-[44px]",
        isOneHandedMode 
          ? "bg-blue-100 text-blue-700" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className
      )}
    >
      <Hand className="h-5 w-5" />
      {showLabel && (
        <span className="text-sm font-medium">
          {isOneHandedMode ? "Mode une main activé" : "Mode une main"}
        </span>
      )}
    </motion.button>
  );
}

// Wrapper component that adjusts content for one-handed use
interface OneHandedWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function OneHandedWrapper({ children, className }: OneHandedWrapperProps) {
  const { isOneHandedMode, reachableHeight } = useOneHanded();

  return (
    <motion.div
      animate={{
        transform: isOneHandedMode 
          ? `translateY(${window.innerHeight - reachableHeight}px)` 
          : 'translateY(0px)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "w-full transition-transform",
        isOneHandedMode && "origin-bottom",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Floating Action Button optimized for one-handed use
interface OneHandedFABProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export function OneHandedFAB({ 
  icon: Icon, 
  onClick, 
  label, 
  position = 'bottom-right',
  className 
}: OneHandedFABProps) {
  const { isOneHandedMode } = useOneHanded();
  
  const getPositionClasses = () => {
    const base = "fixed z-40";
    const oneHandedOffset = isOneHandedMode ? "bottom-20" : "bottom-6";
    
    switch (position) {
      case 'bottom-left':
        return `${base} left-6 ${oneHandedOffset}`;
      case 'bottom-center':
        return `${base} left-1/2 transform -translate-x-1/2 ${oneHandedOffset}`;
      case 'bottom-right':
      default:
        return `${base} right-6 ${oneHandedOffset}`;
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={cn(
        getPositionClasses(),
        "flex items-center gap-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors",
        "min-h-[56px] min-w-[56px]", // Larger touch target
        label ? "px-4 py-3" : "p-4",
        className
      )}
      animate={{
        y: isOneHandedMode ? -60 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Icon className="h-6 w-6" />
      {label && (
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      )}
    </motion.button>
  );
}

// Reachability indicator for elements
interface ReachabilityIndicatorProps {
  children: React.ReactNode;
  elementRef?: React.RefObject<HTMLElement>;
  showIndicator?: boolean;
}

export function ReachabilityIndicator({ 
  children, 
  elementRef,
  showIndicator = true 
}: ReachabilityIndicatorProps) {
  const { isOneHandedMode, isReachable } = useOneHanded();
  const [elementTop, setElementTop] = useState(0);
  const [isElementReachable, setIsElementReachable] = useState(true);

  useEffect(() => {
    if (!elementRef?.current || !isOneHandedMode) return;

    const updatePosition = () => {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        setElementTop(rect.top);
        setIsElementReachable(isReachable(rect.top));
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [elementRef, isOneHandedMode, isReachable]);

  return (
    <div className="relative">
      {children}
      
      {/* Reachability indicator */}
      <AnimatePresence>
        {isOneHandedMode && showIndicator && !isElementReachable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-lg"
          >
            <ArrowDown className="h-3 w-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for detecting if device is likely used one-handed
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isLikelyOneHanded, setIsLikelyOneHanded] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
      
      // Heuristic: portrait mode on mobile-sized screens suggests one-handed use
      const isMobileSize = window.innerWidth <= 768;
      setIsLikelyOneHanded(isPortrait && isMobileSize);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return {
    orientation,
    isLikelyOneHanded
  };
}

// Touch-friendly button component
interface TouchButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function TouchButton({ 
  size = 'md', 
  variant = 'primary', 
  className, 
  children, 
  ...props 
}: TouchButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'min-h-[44px] px-4 py-2 text-sm';
      case 'lg':
        return 'min-h-[56px] px-8 py-4 text-lg';
      case 'md':
      default:
        return 'min-h-[48px] px-6 py-3 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300';
      case 'outline':
        return 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'primary':
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "active:scale-98 select-none", // Prevent text selection on touch
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}