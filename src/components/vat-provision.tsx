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
  
  return (
    <Card className={`transition-all duration-300 ${isNearThreshold ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">TVA à provisionner</CardTitle>
        <div className={`p-2 rounded-lg ${
          isNearThreshold ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          {isNearThreshold ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
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
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isNearThreshold ? 'bg-orange-200' : ''}`}
          />
          <p className={`text-xs flex items-center ${
            isNearThreshold ? 'text-orange-600' : 'text-muted-foreground'
          }`}>
            {isNearThreshold && <AlertTriangle className="h-3 w-3 mr-1" />}
            {progressPercentage >= 100 
              ? 'Seuil TVA dépassé - Déclaration obligatoire'
              : `${Math.round(100 - progressPercentage)}% avant seuil TVA`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}