"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "./swipe-gestures";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'full' | 'large' | 'medium' | 'small';
  showHandle?: boolean;
  allowSwipeDown?: boolean;
  className?: string;
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'large',
  showHandle = true,
  allowSwipeDown = true,
  className
}: MobileModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Close modal if dragged down significantly
    if (allowSwipeDown && info.offset.y > 150) {
      onClose();
    }
  };
  
  const swipeGesture = useSwipeGesture({
    onSwipeDown: allowSwipeDown ? onClose : undefined,
    threshold: 100
  });
  
  const getSizeClasses = () => {
    switch (size) {
      case 'full':
        return 'h-full';
      case 'large':
        return 'h-[90vh] md:h-[80vh]';
      case 'medium':
        return 'h-[70vh] md:h-[60vh]';
      case 'small':
        return 'h-[50vh] md:h-[40vh]';
      default:
        return 'h-[90vh] md:h-[80vh]';
    }
  };
  
  const getInitialY = () => {
    switch (size) {
      case 'full':
        return 0;
      case 'large':
        return '10vh';
      case 'medium':
        return '30vh';
      case 'small':
        return '50vh';
      default:
        return '10vh';
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            initial={{ 
              y: '100%',
              opacity: 0
            }}
            animate={{ 
              y: getInitialY(),
              opacity: 1
            }}
            exit={{ 
              y: '100%',
              opacity: 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            drag={allowSwipeDown ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative w-full bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden",
              "md:max-w-2xl md:mx-4",
              getSizeClasses(),
              isDragging && "cursor-grabbing",
              className
            )}
            {...swipeGesture}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2 md:hidden">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h2>
                )}
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>
            
            {/* Content */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sheet variant for bottom sheet style
export function MobileSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = ['25%', '50%', '90%'],
  defaultSnap = 1,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  defaultSnap?: number;
  className?: string;
}) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const windowHeight = window.innerHeight;
    const draggedY = info.point.y;
    const draggedPercentage = (draggedY / windowHeight) * 100;
    
    // Find closest snap point
    let closestSnap = 0;
    let minDistance = Infinity;
    
    snapPoints.forEach((point, index) => {
      const percentage = 100 - parseInt(point);
      const distance = Math.abs(draggedPercentage - percentage);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = index;
      }
    });
    
    // Close if dragged to bottom
    if (draggedPercentage > 85) {
      onClose();
    } else {
      setCurrentSnap(closestSnap);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: `calc(100% - ${snapPoints[currentSnap]})` }}
            exit={{ y: '100%' }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl",
              "h-full overflow-hidden",
              isDragging && "cursor-grabbing",
              className
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Header */}
            {title && (
              <div className="px-4 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for modal state management
export function useMobileModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return {
    isOpen,
    open,
    close,
    toggle
  };
}