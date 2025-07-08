"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";
import { ThumbFriendlyTest } from "@/components/thumb-friendly-test";
import { MobileAlert, useMobileAlerts } from "@/components/mobile-alerts";
import { HoverCard, ShimmerCard, PulseCard, Card3D } from "@/components/hover-card";
import { ChartSkeleton, useChartLoading } from "@/components/chart-skeleton";
import { Confetti, useConfetti } from "@/components/confetti";
import { AnimatedCounter } from "@/components/animated-counter";
import { CustomToaster, useActionNotifications } from "@/components/toast-notifications";
import { 
  Sparkles, 
  Zap, 
  Target, 
  Smartphone, 
  Bell,
  MousePointer,
  BarChart3,
  Trophy
} from "lucide-react";

export default function TestPhase2Page() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const { isLoading: isChartLoading } = useChartLoading(3000);
  const { shouldTrigger, triggerConfetti, resetConfetti } = useConfetti();
  const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useActionNotifications();
  const { showSuccess: showMobileSuccess, showError: showMobileError } = useMobileAlerts();

  const demos = [
    {
      id: 'counters',
      title: 'Compteurs Animés',
      description: 'Effet de défilement amélioré pour les chiffres',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'hover',
      title: 'Effets de Survol',
      description: 'Cartes interactives avec animations',
      icon: <MousePointer className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'loading',
      title: 'Squelettes de Chargement',
      description: 'Animations de chargement pour les graphiques',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'confetti',
      title: 'Confetti de Célébration',
      description: 'Animation pour les objectifs atteints',
      icon: <Trophy className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'toasts',
      title: 'Notifications Toast',
      description: 'Système de notifications amélioré',
      icon: <Bell className="h-5 w-5" />,
      color: 'bg-red-500'
    },
    {
      id: 'mobile',
      title: 'Navigation Mobile',
      description: 'Test d\'accessibilité thumb-friendly',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-indigo-500'
    }
  ];

  const handleDemoClick = (demoId: string) => {
    setActiveDemo(demoId);
    
    switch (demoId) {
      case 'confetti':
        triggerConfetti();
        notifySuccess('Confetti déclenché');
        break;
      case 'toasts':
        notifyInfo('Toast d\'information');
        setTimeout(() => notifySuccess('Toast de succès'), 1000);
        setTimeout(() => notifyWarning('Toast d\'avertissement'), 2000);
        setTimeout(() => notifyError('Toast d\'erreur'), 3000);
        break;
      case 'mobile':
        showMobileSuccess('Test Mobile', 'Alerte adaptée aux petits écrans');
        break;
      default:
        notifyInfo(`Démonstration: ${demos.find(d => d.id === demoId)?.title}`);
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto p-6 space-y-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Phase 2 - Démonstrations
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Testez toutes les nouvelles fonctionnalités implémentées : animations, effets de survol, 
            notifications, et optimisations mobiles.
          </p>
        </motion.div>

        {/* Grille des démonstrations */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {demos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <HoverCard 
                hoverScale={1.05}
                glowEffect={true}
                shadowIntensity="medium"
              >
                <div 
                  onClick={() => handleDemoClick(demo.id)}
                  className="cursor-pointer p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${demo.color} text-white`}>
                      {demo.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{demo.title}</h3>
                      <p className="text-sm text-gray-600">{demo.description}</p>
                    </div>
                  </div>
                  
                  {activeDemo === demo.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t pt-4"
                    >
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Démonstration activée
                      </div>
                    </motion.div>
                  )}
                </div>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Section des compteurs animés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Compteurs Animés Améliorés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    <AnimatedCounter value={12500} suffix="€" duration={2000} />
                  </div>
                  <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    <AnimatedCounter value={87.5} suffix="%" decimals={1} duration={2500} />
                  </div>
                  <p className="text-sm text-gray-600">Taux de satisfaction</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    <AnimatedCounter value={1234} duration={3000} />
                  </div>
                  <p className="text-sm text-gray-600">Clients actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section des effets de survol */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-purple-600" />
                Effets de Survol Interactifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <HoverCard hoverScale={1.1} glowEffect={true}>
                  <div className="p-4 text-center">
                    <h4 className="font-medium">Hover Card</h4>
                    <p className="text-sm text-gray-600">Effet de brillance</p>
                  </div>
                </HoverCard>
                
                <ShimmerCard>
                  <div className="p-4 text-center">
                    <h4 className="font-medium">Shimmer Card</h4>
                    <p className="text-sm text-gray-600">Effet de scintillement</p>
                  </div>
                </ShimmerCard>
                
                <PulseCard pulseColor="green">
                  <div className="p-4 text-center">
                    <h4 className="font-medium">Pulse Card</h4>
                    <p className="text-sm text-gray-600">Effet de pulsation</p>
                  </div>
                </PulseCard>
                
                <Card3D>
                  <div className="p-4 text-center">
                    <h4 className="font-medium">3D Card</h4>
                    <p className="text-sm text-gray-600">Effet de rotation 3D</p>
                  </div>
                </Card3D>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section des squelettes de chargement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Squelettes de Chargement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Graphique Linéaire</h4>
                  {isChartLoading ? (
                    <ChartSkeleton type="line" />
                  ) : (
                    <div className="h-[200px] bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600">Graphique chargé</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Graphique en Barres</h4>
                  {isChartLoading ? (
                    <ChartSkeleton type="bar" />
                  ) : (
                    <div className="h-[200px] bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600">Graphique chargé</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section du test mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="md:hidden"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-600" />
                Test de Navigation Mobile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThumbFriendlyTest />
            </CardContent>
          </Card>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button
            onClick={() => triggerConfetti()}
            className="bg-green-600 hover:bg-green-700 min-h-[48px]"
            size="lg"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Déclencher Confetti
          </Button>
          
          <Button
            onClick={() => {
              notifySuccess('Test de notification');
              showMobileSuccess('Mobile', 'Alerte mobile testée');
            }}
            variant="outline"
            className="min-h-[48px]"
            size="lg"
          >
            <Bell className="h-4 w-4 mr-2" />
            Tester Notifications
          </Button>
        </motion.div>

        {/* Confetti */}
        <Confetti trigger={shouldTrigger} onComplete={resetConfetti} />
        
        {/* Toast notifications */}
        <CustomToaster />
      </div>
    </PageWrapper>
  );
}