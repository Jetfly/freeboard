"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Hand, 
  Target, 
  CheckCircle, 
  XCircle,
  Navigation,
  Zap
} from "lucide-react";
import { useMobileAlerts } from "@/components/mobile-alerts";

interface ThumbZone {
  id: string;
  name: string;
  description: string;
  isReachable: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const thumbZones: ThumbZone[] = [
  {
    id: 'bottom-right',
    name: 'Zone naturelle',
    description: 'Facilement accessible avec le pouce',
    isReachable: true,
    difficulty: 'easy'
  },
  {
    id: 'bottom-center',
    name: 'Zone confortable',
    description: 'Accessible sans effort',
    isReachable: true,
    difficulty: 'easy'
  },
  {
    id: 'middle-right',
    name: 'Zone étirée',
    description: 'Nécessite un léger étirement',
    isReachable: true,
    difficulty: 'medium'
  },
  {
    id: 'top-right',
    name: 'Zone difficile',
    description: 'Difficile à atteindre d\'une main',
    isReachable: false,
    difficulty: 'hard'
  },
  {
    id: 'top-left',
    name: 'Zone impossible',
    description: 'Impossible à atteindre d\'une main',
    isReachable: false,
    difficulty: 'hard'
  }
];

export function ThumbFriendlyTest() {
  const [testedZones, setTestedZones] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const { showSuccess, showError, showInfo } = useMobileAlerts();

  const handleZoneTest = (zone: ThumbZone) => {
    setTestedZones(prev => new Set([...prev, zone.id]));
    
    // Simuler un test de facilité d'accès
    const isSuccessful = zone.isReachable;
    setTestResults(prev => ({ ...prev, [zone.id]: isSuccessful }));
    
    if (isSuccessful) {
      showSuccess(
        'Zone accessible !',
        `La ${zone.name} est facilement accessible avec le pouce.`
      );
    } else {
      showError(
        'Zone difficile',
        `La ${zone.name} est difficile à atteindre d'une seule main.`
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getZoneIcon = (zone: ThumbZone) => {
    if (testedZones.has(zone.id)) {
      return testResults[zone.id] ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      );
    }
    return <Target className="h-5 w-5 text-gray-400" />;
  };

  const runFullTest = () => {
    showInfo(
      'Test en cours...',
      'Test de toutes les zones d\'accessibilité en cours.'
    );
    
    thumbZones.forEach((zone, index) => {
      setTimeout(() => {
        handleZoneTest(zone);
      }, index * 500);
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hand className="h-5 w-5 text-blue-600" />
          Test Navigation Thumb-Friendly
        </CardTitle>
        <p className="text-sm text-gray-600">
          Testez l'accessibilité des zones d'interface pour une utilisation à une main.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visualisation du téléphone */}
        <div className="relative mx-auto w-32 h-56 bg-gray-900 rounded-2xl p-2">
          <div className="w-full h-full bg-white rounded-xl relative overflow-hidden">
            {/* Zones de test */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 gap-1 p-2">
              {/* Zone facile - bas droite */}
              <div className="col-start-2 row-start-4 bg-green-200 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              
              {/* Zone facile - bas centre */}
              <div className="col-start-1 row-start-4 bg-green-200 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              
              {/* Zone moyenne - milieu droite */}
              <div className="col-start-2 row-start-3 bg-orange-200 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              </div>
              
              {/* Zone difficile - haut droite */}
              <div className="col-start-2 row-start-1 bg-red-200 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              
              {/* Zone impossible - haut gauche */}
              <div className="col-start-1 row-start-1 bg-red-300 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-red-700 rounded-full"></div>
              </div>
            </div>
            
            {/* Pouce simulé */}
            <motion.div
              className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full opacity-70"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
        
        {/* Liste des zones à tester */}
        <div className="space-y-2">
          {thumbZones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getZoneIcon(zone)}
                <div>
                  <h4 className="font-medium text-sm">{zone.name}</h4>
                  <p className="text-xs text-gray-500">{zone.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getDifficultyColor(zone.difficulty)
                }`}>
                  {zone.difficulty === 'easy' ? 'Facile' : 
                   zone.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                </span>
                
                <Button
                  size="sm"
                  variant={testedZones.has(zone.id) ? "secondary" : "default"}
                  onClick={() => handleZoneTest(zone)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bouton de test complet */}
        <Button
          onClick={runFullTest}
          className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          Lancer le test complet
        </Button>
        
        {/* Résultats */}
        {testedZones.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 rounded-lg"
          >
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              Résultats du test
            </h4>
            <div className="text-sm text-gray-600">
              <p>Zones testées: {testedZones.size}/{thumbZones.length}</p>
              <p>Zones accessibles: {Object.values(testResults).filter(Boolean).length}</p>
              <p>Score d'accessibilité: {Math.round((Object.values(testResults).filter(Boolean).length / testedZones.size) * 100)}%</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}