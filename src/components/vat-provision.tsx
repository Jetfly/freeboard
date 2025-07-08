"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Receipt, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface VatProvisionProps {
  currentRevenue: number;
  vatThreshold: number;
}

export function VatProvision({ currentRevenue = 45231, vatThreshold = 36800 }: VatProvisionProps) {
  // Calcul de la TVA à provisionner (20% du CA HT)
  const vatToProvision = Math.round(currentRevenue * 0.2);
  const progressPercentage = Math.min((currentRevenue / vatThreshold) * 100, 100);
  const isNearThreshold = progressPercentage > 80;
  const isOverThreshold = progressPercentage >= 100;
  
  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      isOverThreshold ? 'border-red-200 bg-red-50' : 
      isNearThreshold ? 'border-orange-200 bg-orange-50' : 'hover:border-blue-200'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">TVA à provisionner</CardTitle>
        <div className={`p-2 rounded-lg ${
          isOverThreshold ? 'bg-red-100' :
          isNearThreshold ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          {isOverThreshold || isNearThreshold ? (
            <AlertTriangle className={`h-4 w-4 ${
              isOverThreshold ? 'text-red-600' : 'text-orange-600'
            }`} />
          ) : (
            <Receipt className="h-4 w-4 text-blue-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{vatToProvision.toLocaleString('fr-FR')}€</div>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progression vers seuil TVA</span>
            <span>{currentRevenue.toLocaleString('fr-FR')}€ / {vatThreshold.toLocaleString('fr-FR')}€</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className={`h-3 transition-all duration-500`}
            />
            {isOverThreshold && (
              <div 
                className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            )}
          </div>
          <motion.p 
            className={`text-xs flex items-center ${
              isOverThreshold ? 'text-red-600' :
              isNearThreshold ? 'text-orange-600' : 'text-muted-foreground'
            }`}
            animate={isOverThreshold ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: isOverThreshold ? Infinity : 0, repeatDelay: 2 }}
          >
            {(isOverThreshold || isNearThreshold) && <AlertTriangle className="h-3 w-3 mr-1" />}
            {isOverThreshold 
              ? 'Seuil TVA dépassé - Déclaration obligatoire'
              : progressPercentage >= 100 
              ? 'Seuil TVA atteint'
              : `${Math.round(100 - progressPercentage)}% avant seuil TVA`
            }
          </motion.p>
        </div>
      </CardContent>
    </Card>
  );
}