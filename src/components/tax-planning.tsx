"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Calculator,
  PiggyBank,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  TrendingUp,
  Download,
  Bell
} from "lucide-react";

interface MonthlyData {
  month: string;
  revenus: number;
  depenses: number;
}

interface TaxPlanningProps {
  monthlyData: MonthlyData[];
  currentYear?: number;
}

interface TaxEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'payment' | 'declaration' | 'provision';
  status: 'upcoming' | 'due' | 'completed';
  amount?: number;
  description: string;
  daysUntil: number;
}

interface TaxScenario {
  id: string;
  name: string;
  description: string;
  estimatedTax: number;
  provisions: number;
  savings: number;
  recommendations: string[];
}

const TAX_RATES = {
  microEntreprise: {
    bic: 0.12, // 12% pour BIC
    bnc: 0.22  // 22% pour BNC
  },
  reel: {
    is: 0.15,     // Impôt sur les sociétés (taux réduit)
    ir: 0.30,     // Impôt sur le revenu (estimation moyenne)
    cotisations: 0.45 // Cotisations sociales
  }
};

export function TaxPlanning({ monthlyData, currentYear = 2024 }: TaxPlanningProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('micro-bnc');
  const [showCalendar, setShowCalendar] = useState(true);

  // Calculs des métriques fiscales
  const taxMetrics = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenus, 0);
    const totalExpenses = monthlyData.reduce((sum, item) => sum + item.depenses, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    // Estimations selon différents régimes
    const microBNC = totalRevenue * TAX_RATES.microEntreprise.bnc;
    const microBIC = totalRevenue * TAX_RATES.microEntreprise.bic;
    const reelIS = netIncome * TAX_RATES.reel.is;
    const reelIR = netIncome * TAX_RATES.reel.ir;
    const cotisationsSociales = totalRevenue * TAX_RATES.reel.cotisations;
    
    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      microBNC,
      microBIC,
      reelIS,
      reelIR,
      cotisationsSociales
    };
  }, [monthlyData]);

  // Calendrier fiscal
  const taxEvents = useMemo((): TaxEvent[] => {
    const events: TaxEvent[] = [];
    const now = new Date();
    
    // Échéances trimestrielles
    const quarters = [
      { date: `${currentYear}-04-30`, title: "Déclaration TVA Q1" },
      { date: `${currentYear}-07-31`, title: "Déclaration TVA Q2" },
      { date: `${currentYear}-10-31`, title: "Déclaration TVA Q3" },
      { date: `${currentYear + 1}-01-31`, title: "Déclaration TVA Q4" }
    ];
    
    quarters.forEach((quarter, index) => {
      const eventDate = new Date(quarter.date);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      events.push({
        id: `tva-q${index + 1}`,
        title: quarter.title,
        date: quarter.date,
        type: 'declaration',
        status: daysUntil < 0 ? 'completed' : daysUntil <= 7 ? 'due' : 'upcoming',
        description: 'Déclaration de TVA trimestrielle',
        daysUntil
      });
    });
    
    // Échéances annuelles
    const annualEvents = [
      {
        date: `${currentYear + 1}-05-31`,
        title: "Déclaration revenus ${currentYear}",
        type: 'declaration' as const,
        description: 'Déclaration d\'impôt sur le revenu'
      },
      {
        date: `${currentYear}-12-31`,
        title: "Provisions fiscales ${currentYear}",
        type: 'provision' as const,
        amount: taxMetrics.microBNC * 0.25,
        description: 'Constitution des provisions pour impôts'
      },
      {
        date: `${currentYear + 1}-02-15`,
        title: "Acompte provisionnel",
        type: 'payment' as const,
        amount: taxMetrics.microBNC * 0.33,
        description: 'Premier acompte provisionnel'
      },
      {
        date: `${currentYear + 1}-05-15`,
        title: "Solde impôt ${currentYear}",
        type: 'payment' as const,
        amount: taxMetrics.microBNC * 0.67,
        description: 'Solde de l\'impôt sur le revenu'
      }
    ];
    
    annualEvents.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      events.push({
        id: `annual-${index}`,
        title: event.title,
        date: event.date,
        type: event.type,
        status: daysUntil < 0 ? 'completed' : daysUntil <= 30 ? 'due' : 'upcoming',
        amount: event.amount,
        description: event.description,
        daysUntil
      });
    });
    
    return events.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [currentYear, taxMetrics]);

  // Scénarios fiscaux
  const taxScenarios = useMemo((): TaxScenario[] => {
    return [
      {
        id: 'micro-bnc',
        name: 'Micro-entreprise BNC',
        description: 'Régime micro-social simplifié (prestations de services)',
        estimatedTax: taxMetrics.microBNC,
        provisions: taxMetrics.microBNC * 0.25,
        savings: Math.max(0, taxMetrics.reelIR - taxMetrics.microBNC),
        recommendations: [
          'Idéal pour un CA < 77 700€',
          'Comptabilité simplifiée',
          'Abattement forfaitaire de 34%',
          'Pas de récupération de TVA'
        ]
      },
      {
        id: 'micro-bic',
        name: 'Micro-entreprise BIC',
        description: 'Régime micro-social simplifié (vente/négoce)',
        estimatedTax: taxMetrics.microBIC,
        provisions: taxMetrics.microBIC * 0.25,
        savings: Math.max(0, taxMetrics.reelIR - taxMetrics.microBIC),
        recommendations: [
          'Pour activités commerciales',
          'Abattement forfaitaire de 71%',
          'Seuil de CA plus élevé',
          'Simplicité administrative'
        ]
      },
      {
        id: 'reel-ir',
        name: 'Régime réel - IR',
        description: 'Entreprise individuelle au régime réel',
        estimatedTax: taxMetrics.reelIR + taxMetrics.cotisationsSociales,
        provisions: (taxMetrics.reelIR + taxMetrics.cotisationsSociales) * 0.25,
        savings: Math.max(0, taxMetrics.microBNC - (taxMetrics.reelIR + taxMetrics.cotisationsSociales)),
        recommendations: [
          'Déduction des charges réelles',
          'Récupération de TVA possible',
          'Comptabilité complète requise',
          'Optimisation fiscale avancée'
        ]
      },
      {
        id: 'eurl-is',
        name: 'EURL à l\'IS',
        description: 'Société unipersonnelle à l\'impôt sur les sociétés',
        estimatedTax: taxMetrics.reelIS,
        provisions: taxMetrics.reelIS * 0.25,
        savings: Math.max(0, taxMetrics.microBNC - taxMetrics.reelIS),
        recommendations: [
          'Taux d\'IS avantageux (15% puis 25%)',
          'Optimisation rémunération/dividendes',
          'Protection du patrimoine personnel',
          'Formalités plus complexes'
        ]
      }
    ];
  }, [taxMetrics]);

  const currentScenario = taxScenarios.find(s => s.id === selectedScenario) || taxScenarios[0];
  const upcomingEvents = taxEvents.filter(e => e.status !== 'completed').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Résumé fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Planning Fiscal Interactif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">CA Total</span>
              </div>
              <p className="text-2xl font-bold">{taxMetrics.totalRevenue.toLocaleString('fr-FR')}€</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Bénéfice Net</span>
              </div>
              <p className="text-2xl font-bold">{taxMetrics.netIncome.toLocaleString('fr-FR')}€</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Impôts Estimés</span>
              </div>
              <p className="text-2xl font-bold">{currentScenario.estimatedTax.toLocaleString('fr-FR')}€</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Provisions</span>
              </div>
              <p className="text-2xl font-bold">{currentScenario.provisions.toLocaleString('fr-FR')}€</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scénarios fiscaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Comparaison des Régimes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxScenarios.map((scenario, index) => {
                const isSelected = scenario.id === selectedScenario;
                const savingsPercentage = scenario.savings > 0 ? 
                  ((scenario.savings / scenario.estimatedTax) * 100) : 0;
                
                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium mb-1">{scenario.name}</h4>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                      {scenario.savings > 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          -{savingsPercentage.toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Impôts estimés</span>
                        <p className="font-bold">{scenario.estimatedTax.toLocaleString('fr-FR')}€</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Provisions mensuelles</span>
                        <p className="font-bold">{(scenario.provisions / 12).toLocaleString('fr-FR')}€</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t pt-3 mt-3"
                      >
                        <h5 className="font-medium mb-2">Recommandations :</h5>
                        <ul className="space-y-1">
                          {scenario.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Calendrier fiscal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Échéances Fiscales
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {showCalendar ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </CardHeader>
          {showCalendar && (
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => {
                  const statusColors = {
                    upcoming: 'border-blue-200 bg-blue-50',
                    due: 'border-orange-200 bg-orange-50',
                    completed: 'border-green-200 bg-green-50'
                  };
                  
                  const statusIcons = {
                    upcoming: Clock,
                    due: AlertCircle,
                    completed: CheckCircle
                  };
                  
                  const statusIconColors = {
                    upcoming: 'text-blue-600',
                    due: 'text-orange-600',
                    completed: 'text-green-600'
                  };
                  
                  const Icon = statusIcons[event.status];
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 border rounded-lg ${statusColors[event.status]}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-4 w-4 mt-0.5 ${statusIconColors[event.status]}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <span className="text-xs text-gray-600">
                              {event.daysUntil > 0 ? `Dans ${event.daysUntil}j` : 
                               event.daysUntil === 0 ? 'Aujourd\'hui' : 'Passé'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                          {event.amount && (
                            <p className="text-sm font-medium">
                              Montant estimé: {event.amount.toLocaleString('fr-FR')}€
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(event.date).toLocaleDateString('fr-FR')}
                            </Badge>
                            {event.status === 'due' && (
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Rappel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le calendrier fiscal
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Simulateur d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Simulateur d'Optimisation Fiscale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Stratégies d'optimisation</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm mb-1">Étalement des revenus</h5>
                  <p className="text-xs text-gray-600 mb-2">
                    Reporter une partie des revenus sur l'année suivante
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Économie: ~2 500€</span>
                    <Button size="sm" variant="outline">Simuler</Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm mb-1">Investissements déductibles</h5>
                  <p className="text-xs text-gray-600 mb-2">
                    Matériel informatique, formation, véhicule
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Économie: ~1 800€</span>
                    <Button size="sm" variant="outline">Simuler</Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm mb-1">Changement de régime</h5>
                  <p className="text-xs text-gray-600 mb-2">
                    Passage au régime réel ou création EURL
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Économie: ~{currentScenario.savings.toLocaleString('fr-FR')}€</span>
                    <Button size="sm" variant="outline">Simuler</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Provisions recommandées</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Impôt sur le revenu</span>
                  <span className="font-medium">{(currentScenario.estimatedTax * 0.6).toLocaleString('fr-FR')}€</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Cotisations sociales</span>
                  <span className="font-medium">{(currentScenario.estimatedTax * 0.4).toLocaleString('fr-FR')}€</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium">Total mensuel</span>
                  <span className="font-bold">{(currentScenario.provisions / 12).toLocaleString('fr-FR')}€</span>
                </div>
              </div>
              
              <Progress 
                value={(currentScenario.provisions / currentScenario.estimatedTax) * 100} 
                className="h-3" 
              />
              <p className="text-xs text-gray-600 text-center">
                {((currentScenario.provisions / currentScenario.estimatedTax) * 100).toFixed(0)}% de provisions constituées
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Actions recommandées</h4>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h5 className="font-medium text-sm text-blue-800">Immédiat</h5>
                  <p className="text-xs text-blue-700">
                    Mettre en place un virement automatique de {(currentScenario.provisions / 12).toLocaleString('fr-FR')}€/mois
                  </p>
                </div>
                
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <h5 className="font-medium text-sm text-orange-800">Ce trimestre</h5>
                  <p className="text-xs text-orange-700">
                    Analyser les investissements déductibles possibles
                  </p>
                </div>
                
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <h5 className="font-medium text-sm text-green-800">Fin d'année</h5>
                  <p className="text-xs text-green-700">
                    Optimiser la répartition des revenus et charges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}