"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, TrendingUp, Users, Settings } from "lucide-react";

interface EmptyStateProps {
  type: 'transactions' | 'reports' | 'clients' | 'settings' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateConfig = {
  transactions: {
    title: "Aucune transaction",
    description: "Commencez par ajouter votre première transaction pour suivre vos revenus et dépenses.",
    actionLabel: "Ajouter une transaction",
    icon: TrendingUp,
    illustration: (
      <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#grad1)" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M40 70 L50 60 L70 80 L80 50" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="60" r="3" fill="#3B82F6" />
        <circle cx="70" cy="80" r="3" fill="#3B82F6" />
        <circle cx="80" cy="50" r="3" fill="#3B82F6" />
      </svg>
    )
  },
  reports: {
    title: "Aucun rapport",
    description: "Générez votre premier rapport pour analyser vos performances financières.",
    actionLabel: "Créer un rapport",
    icon: FileText,
    illustration: (
      <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="35" y="25" width="50" height="70" rx="4" fill="url(#grad2)" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="42" y="35" width="36" height="3" rx="1" fill="#10B981" />
        <rect x="42" y="45" width="28" height="2" rx="1" fill="#D1D5DB" />
        <rect x="42" y="52" width="32" height="2" rx="1" fill="#D1D5DB" />
        <rect x="42" y="59" width="24" height="2" rx="1" fill="#D1D5DB" />
        <rect x="42" y="70" width="36" height="15" rx="2" fill="#F3F4F6" stroke="#E5E7EB" />
      </svg>
    )
  },
  clients: {
    title: "Aucun client",
    description: "Ajoutez vos premiers clients pour mieux organiser vos projets et factures.",
    actionLabel: "Ajouter un client",
    icon: Users,
    illustration: (
      <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="45" cy="45" r="15" fill="url(#grad3)" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="75" cy="45" r="15" fill="url(#grad3)" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M25 85 Q45 70 65 85" stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M55 85 Q75 70 95 85" stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  settings: {
    title: "Configuration requise",
    description: "Configurez votre profil et vos préférences pour personnaliser votre expérience.",
    actionLabel: "Configurer",
    icon: Settings,
    illustration: (
      <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="20" fill="url(#grad4)" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="60" cy="60" r="8" fill="#F59E0B" />
        <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
          <line x1="60" y1="20" x2="60" y2="30" />
          <line x1="60" y1="90" x2="60" y2="100" />
          <line x1="20" y1="60" x2="30" y2="60" />
          <line x1="90" y1="60" x2="100" y2="60" />
          <line x1="35.86" y1="35.86" x2="42.43" y2="42.43" />
          <line x1="77.57" y1="77.57" x2="84.14" y2="84.14" />
          <line x1="35.86" y1="84.14" x2="42.43" y2="77.57" />
          <line x1="77.57" y1="42.43" x2="84.14" y2="35.86" />
        </g>
      </svg>
    )
  },
  general: {
    title: "Aucune donnée",
    description: "Il n'y a rien à afficher pour le moment.",
    actionLabel: "Commencer",
    icon: Plus,
    illustration: (
      <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B7280" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4B5563" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="40" fill="url(#grad5)" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="5,5" />
        <circle cx="60" cy="60" r="3" fill="#6B7280" />
      </svg>
    )
  }
};

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  className = "" 
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-center min-h-[400px] p-8 ${className}`}
    >
      <Card className="w-full max-w-md border-dashed">
        <CardContent className="pt-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {config.illustration}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title || config.title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {description || config.description}
            </p>
          </motion.div>
          
          {onAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={onAction} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {actionLabel || config.actionLabel}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}