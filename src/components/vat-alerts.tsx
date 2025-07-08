"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Alert component removed - using Card instead
import { 
  AlertTriangle, 
  Receipt, 
  TrendingUp, 
  Calendar, 
  X,
  ExternalLink,
  Info
} from "lucide-react";
import {
  getUserVatSettings,
  generateVatAlerts,
  calculateCurrentYearRevenue,
  simulateVatImpact,
  VatSettings,
  VatAlert
} from "@/lib/vat-service";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

interface VatAlertsProps {
  className?: string;
}

export function VatAlerts({ className }: VatAlertsProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<VatAlert[]>([]);
  const [vatSettings, setVatSettings] = useState<VatSettings | null>(null);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    if (user) {
      loadVatData();
    }
  }, [user]);

  const loadVatData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [settings, revenue] = await Promise.all([
        getUserVatSettings(user.id),
        calculateCurrentYearRevenue(user.id)
      ]);
      
      setVatSettings(settings);
      setCurrentRevenue(revenue);
      
      if (settings) {
        const generatedAlerts = generateVatAlerts(settings, revenue);
        setAlerts(generatedAlerts.filter(alert => !dismissedAlerts.includes(alert.id)));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données TVA:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getProgressPercentage = () => {
    if (!vatSettings) return 0;
    return Math.min((currentRevenue / vatSettings.annual_revenue_threshold) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Alertes TVA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vatSettings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Configuration TVA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Configurez vos paramètres TVA dans votre profil pour recevoir des alertes personnalisées.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={() => window.location.href = '/profile?tab=vat'}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Configurer la TVA
          </Button>
        </CardContent>
      </Card>
    );
  }

  const simulation = simulateVatImpact(currentRevenue / 12);
  const progressPercentage = getProgressPercentage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Suivi TVA {new Date().getFullYear()}
          </div>
          <Badge variant={vatSettings.vat_regime === 'franchise' ? 'secondary' : 'default'}>
            {vatSettings.vat_regime === 'franchise' ? 'Franchise' : 'Régime réel'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progression vers le seuil */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">CA vers seuil TVA</span>
            <span className="font-medium">
              {currentRevenue.toLocaleString()}€ / {vatSettings.annual_revenue_threshold.toLocaleString()}€
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {progressPercentage.toFixed(1)}% du seuil atteint
          </div>
        </div>

        {/* Alertes */}
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={`${alert.type}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        alert.type === 'critical' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-orange-800' :
                        'text-blue-800'
                      }`}>
                        {alert.message}
                        {alert.action_required && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Action requise
                          </Badge>
                        )}
                      </p>
                      {alert.recommendation && (
                        <div className="mt-1 text-xs text-gray-600">
                          💡 {alert.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(`${alert.type}-${index}`)}
                    className="h-6 w-6 p-0 hover:bg-white/50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Simulation d'impact */}
        {vatSettings.vat_regime === 'franchise' && progressPercentage > 70 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulation(!showSimulation)}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {showSimulation ? 'Masquer' : 'Voir'} l'impact du passage en TVA
            </Button>
            
            <AnimatePresence>
              {showSimulation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="text-xs font-medium text-gray-700">Impact mensuel estimé :</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">TVA à collecter :</span>
                      <div className="font-semibold text-red-600">
                        +{simulation.monthly_vat_to_collect.toLocaleString()}€
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact trésorerie :</span>
                      <div className="font-semibold text-red-600">
                        {simulation.net_impact_monthly.toLocaleString()}€
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pt-1 border-t">
                    * Basé sur votre CA moyen mensuel actuel
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.location.href = '/profile?tab=vat'}
          >
            <Receipt className="h-4 w-4 mr-1" />
            Paramètres
          </Button>
          {alerts.some(alert => alert.action_required) && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => {
                toast.success('Redirection vers les actions recommandées');
                window.location.href = '/profile?tab=vat';
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Agir
            </Button>
          )}
        </div>

        {/* Prochaine échéance */}
        {vatSettings.vat_regime !== 'franchise' && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>
                Prochaine déclaration : 
                {vatSettings.vat_regime === 'reel_normal' ? 'Mensuelle' : 'Trimestrielle'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}