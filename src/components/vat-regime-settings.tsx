"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
// Alert component removed - using Card instead
import { Badge } from "@/components/ui/badge";
import { Receipt, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  VatSettings,
  VatRegime,
  LegalStatus,
  getUserVatSettings,
  updateUserVatSettings,
  generateVatAlerts,
  simulateVatImpact,
  getRecommendedVatRegime,
  VAT_THRESHOLDS,
  calculateCurrentYearRevenue,
  updateCurrentYearRevenue
} from "@/lib/vat-service";
import toast from "react-hot-toast";

interface VatRegimeSettingsProps {
  userId: string;
  legalStatus?: LegalStatus;
  onSettingsChange?: (settings: VatSettings) => void;
}

export function VatRegimeSettings({ userId, legalStatus, onSettingsChange }: VatRegimeSettingsProps) {
  const [settings, setSettings] = useState<VatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const vatSettings = await getUserVatSettings(userId);
      const revenue = await calculateCurrentYearRevenue(userId);
      
      if (vatSettings) {
        setSettings(vatSettings);
      } else {
        // Créer des paramètres par défaut
        const defaultSettings: VatSettings = {
          vat_regime: 'franchise',
          vat_regime_start_date: new Date().toISOString().split('T')[0],
          voluntary_vat_registration: false,
          annual_revenue_threshold: VAT_THRESHOLDS.services,
          current_year_revenue: revenue,
          vat_alerts_enabled: true,
          legal_status: legalStatus
        };
        setSettings(defaultSettings);
      }
      
      setCurrentRevenue(revenue);
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres TVA:', err);
      toast.error('Erreur lors du chargement des paramètres TVA');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await updateUserVatSettings(userId, settings);
      await updateCurrentYearRevenue(userId);
      
      toast.success('Paramètres TVA sauvegardés!');
      onSettingsChange?.(settings);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof VatSettings>(key: K, value: VatSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const getRegimeLabel = (regime: VatRegime) => {
    switch (regime) {
      case 'franchise': return 'Franchise en base de TVA';
      case 'reel_simplifie': return 'Régime réel simplifié';
      case 'reel_normal': return 'Régime réel normal';
    }
  };

  const getRegimeDescription = (regime: VatRegime) => {
    switch (regime) {
      case 'franchise': return 'Pas de TVA à facturer ni à déclarer (jusqu\'au seuil)';
      case 'reel_simplifie': return 'Déclaration TVA trimestrielle, comptabilité simplifiée';
      case 'reel_normal': return 'Déclaration TVA mensuelle, comptabilité complète';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Régime TVA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  const alerts = generateVatAlerts(settings, currentRevenue);
  const recommendedRegime = legalStatus ? getRecommendedVatRegime(legalStatus, currentRevenue) : settings.vat_regime;
  const simulation = simulateVatImpact(currentRevenue / 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Régime TVA français
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alertes */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <Alert key={index} className={alert.type === 'critical' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}>
                  <AlertTriangle className={`h-4 w-4 ${alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                  <AlertDescription className={alert.type === 'critical' ? 'text-red-800' : 'text-orange-800'}>
                    {alert.message}
                    {alert.action_required && (
                      <Badge variant="destructive" className="ml-2">Action requise</Badge>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* CA actuel */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Chiffre d'affaires {new Date().getFullYear()}</h4>
                <p className="text-2xl font-bold text-blue-700">{currentRevenue.toLocaleString()}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Seuil TVA</p>
                <p className="text-lg font-semibold text-blue-800">{settings.annual_revenue_threshold.toLocaleString()}€</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((currentRevenue / settings.annual_revenue_threshold) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {Math.round((currentRevenue / settings.annual_revenue_threshold) * 100)}% du seuil atteint
              </p>
            </div>
          </div>

          {/* Régime TVA */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Régime TVA actuel</Label>
              <Select
                value={settings.vat_regime}
                onValueChange={(value) => updateSetting('vat_regime', value as VatRegime)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchise">
                    <div>
                      <div className="font-medium">Franchise en base</div>
                      <div className="text-xs text-gray-500">Pas de TVA jusqu'au seuil</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="reel_simplifie">
                    <div>
                      <div className="font-medium">Régime réel simplifié</div>
                      <div className="text-xs text-gray-500">Déclaration trimestrielle</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="reel_normal">
                    <div>
                      <div className="font-medium">Régime réel normal</div>
                      <div className="text-xs text-gray-500">Déclaration mensuelle</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {getRegimeDescription(settings.vat_regime)}
              </p>
            </div>

            {/* Recommandation */}
            {recommendedRegime !== settings.vat_regime && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Recommandé pour votre situation : <strong>{getRegimeLabel(recommendedRegime)}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Date de début du régime */}
            <div className="space-y-2">
              <Label>Date de début du régime</Label>
              <Input
                type="date"
                value={settings.vat_regime_start_date}
                onChange={(e) => updateSetting('vat_regime_start_date', e.target.value)}
              />
            </div>

            {/* Assujettissement volontaire */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Assujettissement volontaire à la TVA</Label>
                <p className="text-sm text-gray-600">
                  Opter pour la TVA même en dessous du seuil
                </p>
              </div>
              <Switch
                checked={settings.voluntary_vat_registration}
                onCheckedChange={(checked) => updateSetting('voluntary_vat_registration', checked)}
              />
            </div>

            {/* Seuil personnalisé */}
            <div className="space-y-2">
              <Label>Seuil de CA pour passage en régime réel</Label>
              <Input
                type="number"
                value={settings.annual_revenue_threshold}
                onChange={(e) => updateSetting('annual_revenue_threshold', Number(e.target.value))}
                placeholder="36800"
              />
              <p className="text-xs text-gray-500">
                Seuil standard : {VAT_THRESHOLDS.services.toLocaleString()}€ (services)
              </p>
            </div>

            {/* Alertes */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertes automatiques</Label>
                <p className="text-sm text-gray-600">
                  Recevoir des alertes quand les seuils approchent
                </p>
              </div>
              <Switch
                checked={settings.vat_alerts_enabled}
                onCheckedChange={(checked) => updateSetting('vat_alerts_enabled', checked)}
              />
            </div>
          </div>

          {/* Simulation d'impact */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowSimulation(!showSimulation)}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {showSimulation ? 'Masquer' : 'Voir'} la simulation d'impact TVA
            </Button>

            {showSimulation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-gray-50 rounded-lg space-y-3"
              >
                <h4 className="font-medium">Impact du passage en régime TVA</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">TVA mensuelle à collecter</p>
                    <p className="font-semibold">{simulation.monthly_vat_to_collect.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-gray-600">TVA annuelle à collecter</p>
                    <p className="font-semibold">{simulation.annual_vat_to_collect.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Impact trésorerie mensuel</p>
                    <p className="font-semibold text-red-600">{simulation.net_impact_monthly.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Impact trésorerie annuel</p>
                    <p className="font-semibold text-red-600">{simulation.net_impact_annual.toLocaleString()}€</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Simulation basée sur votre CA moyen mensuel actuel
                </p>
              </motion.div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres TVA'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}