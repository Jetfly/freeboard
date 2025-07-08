"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Upload, Calculator, Send } from "lucide-react";
import toast from "react-hot-toast";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  onAddTransaction?: () => void;
}

export function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "add-transaction",
      title: "Ajouter Transaction",
      description: "Nouvelle facture ou dépense",
      icon: <Plus className="h-4 w-4" />,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        if (onAddTransaction) {
          onAddTransaction();
        } else {
          toast.success("Ouverture du formulaire de transaction");
        }
      }
    },
    {
      id: "export-pdf",
      title: "Exporter PDF",
      description: "Rapport mensuel",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        toast.loading("Génération du PDF en cours...", { duration: 2000 });
        setTimeout(() => {
          toast.success("PDF généré avec succès !");
        }, 2000);
      }
    },
    {
      id: "import-data",
      title: "Importer Données",
      description: "CSV ou Excel",
      icon: <Upload className="h-4 w-4" />,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        toast.success("Fonctionnalité d'import bientôt disponible");
      }
    },
    {
      id: "calculate-tax",
      title: "Calculer TVA",
      description: "Simulation fiscale",
      icon: <Calculator className="h-4 w-4" />,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => {
        toast.success("Calcul TVA : 1,700€ à déclarer ce trimestre");
      }
    },
    {
      id: "send-invoice",
      title: "Envoyer Facture",
      description: "Email automatique",
      icon: <Send className="h-4 w-4" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => {
        toast.loading("Envoi de la facture...", { duration: 1500 });
        setTimeout(() => {
          toast.success("Facture envoyée avec succès !");
        }, 1500);
      }
    },
    {
      id: "download-backup",
      title: "Télécharger Backup",
      description: "Sauvegarde complète",
      icon: <Download className="h-4 w-4" />,
      color: "bg-gray-500 hover:bg-gray-600",
      action: () => {
        toast.loading("Préparation de la sauvegarde...", { duration: 2500 });
        setTimeout(() => {
          toast.success("Sauvegarde téléchargée !");
        }, 2500);
      }
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={action.action}
                variant="outline"
                className={`
                  w-full h-auto p-3 flex flex-col items-center gap-2 
                  border-2 border-gray-200 hover:border-gray-300
                  transition-all duration-200
                  group
                `}
              >
                <motion.div
                  className={`
                    p-2 rounded-lg text-white transition-colors duration-200
                    ${action.color}
                  `}
                  whileHover={{ rotate: 5 }}
                >
                  {action.icon}
                </motion.div>
                <div className="text-center">
                  <div className="font-medium text-xs text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">
                    {action.description}
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-500">Actions ce mois</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-500">PDF générés</div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}