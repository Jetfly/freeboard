"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// Alert component removed - using Card instead
import { X, Plus, Calendar, Euro, Tag, User, Receipt, Info } from "lucide-react";
import { MobileModal } from "@/components/mobile-modal";
import { TouchButton } from "@/components/one-handed-layout";
import toast from "react-hot-toast";
import { addTransaction } from "@/lib/dashboard-service";
import { useAuth } from "@/hooks/use-auth";
import { 
  getUserVatSettings, 
  calculateVat, 
  isVatApplicable,
  VatSettings,
  VatCalculationResult 
} from "@/lib/vat-service";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (transaction: any) => void;
  onTransactionAdded?: () => void;
  defaultType?: "income" | "expense" | null;
}

const categories = [
  "Développement web",
  "Développement mobile",
  "Conseil",
  "Design",
  "Formation",
  "Support",
  "Infrastructure",
  "Logiciels",
  "Équipement",
  "Marketing digital",
  "Assurance",
  "Autre"
];

export function TransactionModal({ isOpen, onClose, onSubmit, onTransactionAdded, defaultType }: TransactionModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    client: "",
    date: new Date().toISOString().split('T')[0],
    type: (defaultType || "income") as "income" | "expense",
    subject_to_vat: false,
    amount_ht: "",
    vat_amount: "",
    vat_rate: 20
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vatSettings, setVatSettings] = useState<VatSettings | null>(null);
  const [vatCalculation, setVatCalculation] = useState<VatCalculationResult | null>(null);
  const [showVatDetails, setShowVatDetails] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      loadVatSettings();
    }
  }, [user]);

  useEffect(() => {
    if (formData.amount && vatSettings) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0) {
        const calculation = calculateVat(amount, vatSettings.default_vat_rate || 20);
        setVatCalculation(calculation);
        
        // Mettre à jour les champs calculés
        setFormData(prev => ({
          ...prev,
          amount_ht: calculation.amount_ht.toFixed(2),
          vat_amount: calculation.vat_amount.toFixed(2),
          vat_rate: calculation.vat_rate
        }));
      }
    }
  }, [formData.amount, formData.subject_to_vat, vatSettings]);

  const loadVatSettings = async () => {
    if (!user) return;
    
    try {
      const settings = await getUserVatSettings(user.id);
      setVatSettings(settings);
      
      // Déterminer automatiquement si la TVA s'applique
      if (settings) {
        const shouldApplyVat = isVatApplicable(settings);
        setFormData(prev => ({ ...prev, subject_to_vat: shouldApplyVat }));
        setShowVatDetails(shouldApplyVat);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres TVA:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté pour ajouter une transaction");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const amountHt = formData.subject_to_vat ? parseFloat(formData.amount_ht) : amount;
      const vatAmount = formData.subject_to_vat ? parseFloat(formData.vat_amount) : 0;
      
      const transactionData = {
        description: formData.description,
        amount: amount,
        amount_ht: amountHt,
        vat_amount: vatAmount,
        vat_rate: formData.subject_to_vat ? formData.vat_rate : 0,
        category: formData.category,
        client_name: formData.client || undefined,
        date: formData.date,
        type: formData.type
      };
      
      const newTransaction = await addTransaction(transactionData, user.id);
      
      // Appeler onSubmit si fourni (pour compatibilité)
      if (onSubmit) {
        onSubmit({
          ...transactionData,
          id: newTransaction.id
        }, user.id);
      }
      
      // Notifier le parent que les données doivent être rafraîchies
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
      toast.success("Transaction ajoutée avec succès !");
      
      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "",
        client: "",
        date: new Date().toISOString().split('T')[0],
        type: (defaultType || "income") as "income" | "expense",
        subject_to_vat: vatSettings ? isVatApplicable(vatSettings) : false,
        amount_ht: "",
        vat_amount: "",
        vat_rate: 20
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      toast.error("Erreur lors de l'ajout de la transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVatToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, subject_to_vat: checked }));
    setShowVatDetails(checked);
  };

  const getVatRegimeInfo = () => {
    if (!vatSettings) return null;
    
    switch (vatSettings.vat_regime) {
      case 'franchise':
        return {
          regime: 'Franchise en base de TVA',
          description: 'Pas de TVA à facturer (franchise en base)',
          canApplyVat: vatSettings.voluntary_vat_registration
        };
      case 'reel_simplifie':
        return {
          regime: 'Régime réel simplifié',
          description: 'TVA applicable sur toutes les ventes',
          canApplyVat: true
        };
      case 'reel_normal':
        return {
          regime: 'Régime réel normal',
          description: 'TVA applicable sur toutes les ventes',
          canApplyVat: true
        };
      default:
        return null;
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Type de transaction *
        </label>
        <div className="flex gap-2">
          <TouchButton
            type="button"
            variant={formData.type === "income" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleInputChange("type", "income")}
            className="flex-1"
          >
            Revenus
          </TouchButton>
          <TouchButton
            type="button"
            variant={formData.type === "expense" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleInputChange("type", "expense")}
            className="flex-1"
          >
            Dépenses
          </TouchButton>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Description *
        </label>
        <Input
          placeholder="Ex: Développement site web"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="min-h-[48px]"
          required
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Montant {formData.subject_to_vat ? 'TTC' : 'HT'} (€) *
        </label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            className="pl-10 min-h-[48px]"
            required
          />
        </div>
        {vatCalculation && formData.subject_to_vat && (
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Montant HT:</span>
              <span className="font-medium">{vatCalculation.amount_ht.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({vatCalculation.vat_rate}%):</span>
              <span className="font-medium">{vatCalculation.vat_amount.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total TTC:</span>
              <span>{vatCalculation.amount_ht.toFixed(2)}€</span>
            </div>
          </div>
        )}
      </div>

      {/* TVA Section */}
      {vatSettings && formData.type === "income" && (
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-900">
                Soumis à TVA
              </Label>
            </div>
            <Switch
              checked={formData.subject_to_vat}
              onCheckedChange={handleVatToggle}
              disabled={!getVatRegimeInfo()?.canApplyVat}
            />
          </div>
          
          {(() => {
            const regimeInfo = getVatRegimeInfo();
            return regimeInfo ? (
              <div className="text-xs text-blue-700">
                <div className="font-medium">{regimeInfo.regime}</div>
                <div>{regimeInfo.description}</div>
                {!regimeInfo.canApplyVat && (
                  <div className="text-orange-600 mt-1">
                    ⚠️ Franchise en base active - TVA non applicable
                  </div>
                )}
              </div>
            ) : null;
          })()} 
          
          {formData.subject_to_vat && vatCalculation && (
            <div className="p-2 bg-blue-100 rounded border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  Cette transaction sera enregistrée avec TVA à {vatCalculation.vat_rate}%.
                  Montant HT: {vatCalculation.amount_ht.toFixed(2)}€ + TVA: {vatCalculation.vat_amount.toFixed(2)}€
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Catégorie *
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full pl-10 pr-3 py-3 min-h-[48px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Client (only for income) */}
      {formData.type === "income" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Client
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nom du client"
              value={formData.client}
              onChange={(e) => handleInputChange("client", e.target.value)}
              className="pl-10 min-h-[48px]"
            />
          </div>
        </div>
      )}

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="pl-10 min-h-[48px]"
            required
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-2 pt-4">
        <TouchButton
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isSubmitting}
        >
          Annuler
        </TouchButton>
        <TouchButton
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            "Ajouter"
          )}
        </TouchButton>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <MobileModal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouvelle Transaction"
      >
        <div className="p-4">
          {renderForm()}
        </div>
      </MobileModal>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Nouvelle Transaction
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent>
                {renderForm()}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}