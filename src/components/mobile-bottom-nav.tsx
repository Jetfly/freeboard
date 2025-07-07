"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CreditCard,
  Target,
  BarChart3,
  Settings,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive?: boolean;
}

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Navigation items
  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Accueil",
      href: "/dashboard",
      isActive: pathname === "/dashboard"
    },
    {
      icon: CreditCard,
      label: "Transactions",
      href: "/transactions",
      isActive: pathname === "/transactions"
    },
    {
      icon: Target,
      label: "Objectifs",
      href: "/objectifs",
      isActive: pathname === "/objectifs"
    },
    {
      icon: BarChart3,
      label: "Rapports",
      href: "/rapports",
      isActive: pathname === "/rapports"
    },
    {
      icon: Settings,
      label: "Paramètres",
      href: "/parametres",
      isActive: pathname === "/parametres"
    }
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Plus,
      label: "Revenu",
      action: () => {
        // Trigger add income modal
        window.dispatchEvent(new CustomEvent('add-income'));
        setShowQuickActions(false);
      },
      color: "bg-green-500"
    },
    {
      icon: Plus,
      label: "Dépense",
      action: () => {
        // Trigger add expense modal
        window.dispatchEvent(new CustomEvent('add-expense'));
        setShowQuickActions(false);
      },
      color: "bg-red-500"
    }
  ];

  // Hide/show nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Don't show on desktop or certain routes
  const routesWithoutBottomNav = ["/landing", "/login", "/register", "/"];
  if (routesWithoutBottomNav.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowQuickActions(false)}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-24 right-4 space-y-3"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg min-h-[44px]",
                    action.color
                  )}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden",
          "safe-area-inset-bottom",
          className
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.href}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px]",
                  item.isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
                {item.isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
          
          {/* FAB for quick actions */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={cn(
              "flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg transition-colors",
              showQuickActions && "bg-gray-600"
            )}
          >
            <motion.div
              animate={{ rotate: showQuickActions ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showQuickActions ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
}

// Hook for one-handed usage optimization
export function useOneHandedMode() {
  const [isOneHandedMode, setIsOneHandedMode] = useState(false);
  const [reachableHeight, setReachableHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const screenHeight = window.innerHeight;
      // Assume thumb reach is about 75% of screen height from bottom
      setReachableHeight(screenHeight * 0.75);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleOneHandedMode = () => {
    setIsOneHandedMode(!isOneHandedMode);
  };

  return {
    isOneHandedMode,
    reachableHeight,
    toggleOneHandedMode
  };
}