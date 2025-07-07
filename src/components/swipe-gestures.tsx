"use client";

import { useState, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Trash2, Edit, Archive, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
  action: () => void;
}

interface SwipeableItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipe?: (direction: 'left' | 'right', actionIndex: number) => void;
  className?: string;
  disabled?: boolean;
}

export function SwipeableItem({
  children,
  leftActions = [],
  rightActions = [],
  onSwipe,
  className,
  disabled = false
}: SwipeableItemProps) {
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  const leftActionsWidth = leftActions.length * 80;
  const rightActionsWidth = rightActions.length * 80;
  
  // Transform for action visibility
  const leftOpacity = useTransform(x, [0, leftActionsWidth], [0, 1]);
  const rightOpacity = useTransform(x, [-rightActionsWidth, 0], [1, 0]);
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 60;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Determine if we should snap to an action
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 && leftActions.length > 0) {
        // Swiped right - show left actions
        setIsOpen('left');
        x.set(leftActionsWidth);
      } else if (offset < 0 && rightActions.length > 0) {
        // Swiped left - show right actions
        setIsOpen('right');
        x.set(-rightActionsWidth);
      } else {
        // Close
        setIsOpen(null);
        x.set(0);
      }
    } else {
      // Snap back to center
      setIsOpen(null);
      x.set(0);
    }
  };
  
  const handleActionClick = (action: SwipeAction, direction: 'left' | 'right', index: number) => {
    action.action();
    onSwipe?.(direction, index);
    // Close after action
    setIsOpen(null);
    x.set(0);
  };
  
  const closeSwipe = () => {
    setIsOpen(null);
    x.set(0);
  };
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && constraintsRef.current && !constraintsRef.current.contains(event.target as Node)) {
        closeSwipe();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  if (disabled) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div ref={constraintsRef} className={cn("relative overflow-hidden", className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{ opacity: leftOpacity }}
        >
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center w-20 h-full min-h-[44px] text-white transition-colors",
                  action.bgColor,
                  "hover:brightness-110"
                )}
                onClick={() => handleActionClick(action, 'left', index)}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -80 }}
                animate={{ x: isOpen === 'left' ? 0 : -80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
      
      {/* Right Actions */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{ opacity: rightOpacity }}
        >
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center w-20 h-full min-h-[44px] text-white transition-colors",
                  action.bgColor,
                  "hover:brightness-110"
                )}
                onClick={() => handleActionClick(action, 'right', index)}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 80 }}
                animate={{ x: isOpen === 'right' ? 0 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
      
      {/* Main Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: rightActions.length > 0 ? -rightActionsWidth : 0,
          right: leftActions.length > 0 ? leftActionsWidth : 0
        }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bg-white transition-shadow",
          isDragging && "shadow-lg"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Predefined common swipe actions
export const commonSwipeActions = {
  delete: {
    icon: Trash2,
    label: "Supprimer",
    color: "text-white",
    bgColor: "bg-red-500",
    action: () => {}
  },
  edit: {
    icon: Edit,
    label: "Modifier",
    color: "text-white",
    bgColor: "bg-blue-500",
    action: () => {}
  },
  archive: {
    icon: Archive,
    label: "Archiver",
    color: "text-white",
    bgColor: "bg-gray-500",
    action: () => {}
  },
  favorite: {
    icon: Star,
    label: "Favoris",
    color: "text-white",
    bgColor: "bg-yellow-500",
    action: () => {}
  },
  complete: {
    icon: Check,
    label: "Terminé",
    color: "text-white",
    bgColor: "bg-green-500",
    action: () => {}
  }
};

// Hook for swipe gesture detection
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;
    
    // Determine primary direction
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe) onSwipeLeft?.();
      if (isRightSwipe) onSwipeRight?.();
    } else {
      // Vertical swipe
      if (isUpSwipe) onSwipeUp?.();
      if (isDownSwipe) onSwipeDown?.();
    }
  };
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}