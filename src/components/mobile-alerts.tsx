"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function MobileAlert({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}: MobileAlertProps) {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-4 right-4 z-50 md:top-6 md:left-6 md:right-auto md:max-w-md"
        >
          <div className={cn(
            "rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm",
            "min-h-[80px] flex items-start gap-3",
            getColorClasses()
          )}>
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                {title}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {message}
              </p>
            </div>
            
            <motion.button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Fermer l'alerte"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook pour gérer les alertes mobiles
export function useMobileAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
  }>>([]);

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, {
      id,
      type,
      title,
      message,
      isVisible: true
    }]);
  };

  const hideAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isVisible: false } : alert
    ));
    
    // Supprimer l'alerte après l'animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  };

  const showSuccess = (title: string, message: string) => {
    showAlert('success', title, message);
  };

  const showError = (title: string, message: string) => {
    showAlert('error', title, message);
  };

  const showWarning = (title: string, message: string) => {
    showAlert('warning', title, message);
  };

  const showInfo = (title: string, message: string) => {
    showAlert('info', title, message);
  };

  return {
    alerts,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}

// Composant pour afficher toutes les alertes
export function MobileAlertsContainer() {
  const { alerts, hideAlert } = useMobileAlerts();

  return (
    <>
      {alerts.map(alert => (
        <MobileAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => hideAlert(alert.id)}
        />
      ))}
    </>
  );
}