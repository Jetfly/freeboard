"use client";

import { supabase } from './supabase';

// Types pour la gestion de la TVA française
export type VatRegime = 'franchise' | 'reel_simplifie' | 'reel_normal';
export type LegalStatus = 'micro-entreprise' | 'auto-entrepreneur' | 'eirl' | 'eurl' | 'sarl' | 'sas' | 'sasu' | 'sa';

export interface VatSettings {
  vat_regime: VatRegime;
  vat_regime_start_date: string;
  voluntary_vat_registration: boolean;
  annual_revenue_threshold: number;
  current_year_revenue: number;
  vat_alerts_enabled: boolean;
  legal_status?: LegalStatus;
}

export interface VatCalculationResult {
  amount_ht: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  is_vat_applicable: boolean;
  regime_used: VatRegime;
}

export interface VatAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  threshold_percentage: number;
  action_required: boolean;
  recommendation?: string;
}

// Seuils TVA français 2024
export const VAT_THRESHOLDS = {
  services: 36800, // Services BIC/BNC
  goods: 91900,    // Vente de marchandises
  mixed: 36800     // Activité mixte (seuil le plus bas)
};

export const VAT_RATES = {
  standard: 20,    // Taux normal
  reduced: 10,     // Taux réduit
  super_reduced: 5.5, // Taux super réduit
  special: 2.1     // Taux particulier
};

/**
 * Détermine si la TVA est applicable selon le régime et le CA
 */
export function isVatApplicable(
  vatSettings: VatSettings,
  currentYearRevenue: number
): boolean {
  // Si assujettissement volontaire, TVA toujours applicable
  if (vatSettings.voluntary_vat_registration) {
    return true;
  }

  // Si régime réel, TVA applicable
  if (vatSettings.vat_regime === 'reel_simplifie' || vatSettings.vat_regime === 'reel_normal') {
    return true;
  }

  // Si franchise mais seuil dépassé, TVA applicable
  if (vatSettings.vat_regime === 'franchise') {
    return currentYearRevenue > vatSettings.annual_revenue_threshold;
  }

  return false;
}

/**
 * Calcule la TVA selon la réglementation française
 */
export function calculateVat(
  amount: number,
  vatSettings: VatSettings,
  currentYearRevenue: number,
  vatRate: number = VAT_RATES.standard
): VatCalculationResult {
  const isApplicable = isVatApplicable(vatSettings, currentYearRevenue);
  
  if (!isApplicable) {
    // Franchise de TVA - pas de TVA
    return {
      amount_ht: amount,
      vat_amount: 0,
      vat_rate: 0,
      total_amount: amount,
      is_vat_applicable: false,
      regime_used: vatSettings.vat_regime
    };
  }

  // TVA applicable - calcul standard
  const amount_ht = amount / (1 + vatRate / 100);
  const vat_amount = amount - amount_ht;

  return {
    amount_ht: Math.round(amount_ht * 100) / 100,
    vat_amount: Math.round(vat_amount * 100) / 100,
    vat_rate: vatRate,
    total_amount: amount,
    is_vat_applicable: true,
    regime_used: vatSettings.vat_regime
  };
}

/**
 * Génère des alertes selon le CA et les seuils
 */
export function generateVatAlerts(
  vatSettings: VatSettings,
  currentYearRevenue: number
): VatAlert[] {
  const alerts: VatAlert[] = [];
  const threshold = vatSettings.annual_revenue_threshold;
  const percentage = (currentYearRevenue / threshold) * 100;

  // Alerte à 80% du seuil
  if (percentage >= 80 && percentage < 100 && vatSettings.vat_regime === 'franchise') {
    alerts.push({
      id: `threshold-warning-${Date.now()}`,
      type: 'warning',
      message: `Attention : Seuil TVA bientôt atteint (${Math.round(currentYearRevenue).toLocaleString()}€/${threshold.toLocaleString()}€)`,
      threshold_percentage: percentage,
      action_required: false,
      recommendation: 'Préparez-vous au passage en régime réel de TVA'
    });
  }

  // Alerte critique au dépassement
  if (percentage >= 100 && vatSettings.vat_regime === 'franchise') {
    alerts.push({
      id: `threshold-critical-${Date.now()}`,
      type: 'critical',
      message: 'Vous devez passer en régime réel de TVA - Seuil dépassé',
      threshold_percentage: percentage,
      action_required: true,
      recommendation: 'Contactez votre comptable pour effectuer le changement de régime'
    });
  }

  // Alerte à 90% pour préparation
  if (percentage >= 90 && percentage < 100 && vatSettings.vat_regime === 'franchise') {
    alerts.push({
      id: `threshold-preparation-${Date.now()}`,
      type: 'warning',
      message: 'Préparez le passage en régime TVA - Seuil presque atteint',
      threshold_percentage: percentage,
      action_required: false,
      recommendation: 'Anticipez les démarches administratives nécessaires'
    });
  }

  return alerts;
}

/**
 * Simule l'impact du passage en régime TVA
 */
export function simulateVatImpact(
  monthlyRevenue: number,
  vatRate: number = VAT_RATES.standard
): {
  monthly_vat_to_collect: number;
  annual_vat_to_collect: number;
  net_impact_monthly: number;
  net_impact_annual: number;
} {
  const monthly_ht = monthlyRevenue / (1 + vatRate / 100);
  const monthly_vat = monthlyRevenue - monthly_ht;
  
  return {
    monthly_vat_to_collect: Math.round(monthly_vat * 100) / 100,
    annual_vat_to_collect: Math.round(monthly_vat * 12 * 100) / 100,
    net_impact_monthly: Math.round(-monthly_vat * 100) / 100, // Impact négatif sur la trésorerie
    net_impact_annual: Math.round(-monthly_vat * 12 * 100) / 100
  };
}

/**
 * Récupère les paramètres TVA de l'utilisateur
 */
export async function getUserVatSettings(userId: string): Promise<VatSettings | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('vat_regime, vat_regime_start_date, voluntary_vat_registration, annual_revenue_threshold, current_year_revenue, vat_alerts_enabled, legal_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération des paramètres TVA:', error);
      return null;
    }

    return data as VatSettings;
  } catch (err) {
    console.error('Erreur getUserVatSettings:', err);
    return null;
  }
}

/**
 * Met à jour les paramètres TVA de l'utilisateur
 */
export async function updateUserVatSettings(
  userId: string,
  settings: Partial<VatSettings>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Erreur lors de la mise à jour des paramètres TVA:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erreur updateUserVatSettings:', err);
    return false;
  }
}

/**
 * Calcule le CA cumulé de l'année en cours
 */
export async function calculateCurrentYearRevenue(userId: string): Promise<number> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', startOfYear)
      .lte('date', endOfYear);

    if (error) {
      console.error('Erreur lors du calcul du CA annuel:', error);
      return 0;
    }

    return data.reduce((total, transaction) => total + Number(transaction.amount), 0);
  } catch (err) {
    console.error('Erreur calculateCurrentYearRevenue:', err);
    return 0;
  }
}

/**
 * Met à jour automatiquement le CA de l'année en cours
 */
export async function updateCurrentYearRevenue(userId: string): Promise<void> {
  try {
    const currentRevenue = await calculateCurrentYearRevenue(userId);
    await updateUserVatSettings(userId, { current_year_revenue: currentRevenue });
  } catch (err) {
    console.error('Erreur updateCurrentYearRevenue:', err);
  }
}

/**
 * Détermine le régime TVA recommandé selon le statut juridique
 */
export function getRecommendedVatRegime(legalStatus: LegalStatus, annualRevenue: number): VatRegime {
  // Micro-entreprise et auto-entrepreneur : franchise par défaut
  if (legalStatus === 'micro-entreprise' || legalStatus === 'auto-entrepreneur') {
    return annualRevenue > VAT_THRESHOLDS.services ? 'reel_simplifie' : 'franchise';
  }

  // Autres statuts : réel simplifié par défaut
  return 'reel_simplifie';
}