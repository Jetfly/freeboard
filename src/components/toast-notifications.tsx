"use client";

import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

// Configuration des toasts personnalisés
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    style: {
      borderRadius: '12px',
      background: '#10B981',
      color: '#fff',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
    duration: 4000,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    style: {
      borderRadius: '12px',
      background: '#EF4444',
      color: '#fff',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
    },
    duration: 4000,
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
    style: {
      borderRadius: '12px',
      background: '#F59E0B',
      color: '#fff',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    },
    duration: 4000,
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    style: {
      borderRadius: '12px',
      background: '#3B82F6',
      color: '#fff',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    },
    duration: 4000,
  });
};

// Composant Toaster personnalisé
export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Configuration par défaut
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
        // Styles pour les différents types
        success: {
          style: {
            background: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
          },
        },
      }}
    />
  );
}

// Hook pour les notifications d'actions
export function useActionNotifications() {
  const notifySuccess = (action: string) => {
    showSuccessToast(`${action} effectué avec succès !`);
  };

  const notifyError = (action: string, error?: string) => {
    showErrorToast(`Erreur lors de ${action}${error ? `: ${error}` : ''}`);
  };

  const notifyWarning = (message: string) => {
    showWarningToast(message);
  };

  const notifyInfo = (message: string) => {
    showInfoToast(message);
  };

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}