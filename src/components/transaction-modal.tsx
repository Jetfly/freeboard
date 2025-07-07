"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Calendar, Euro, Tag, User } from "lucide-react";
import { MobileModal } from "@/components/mobile-modal";
import { TouchButton } from "@/components/one-handed-layout";
import toast from "react-hot-toast";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
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

export function TransactionModal({ isOpen, onClose, onSubmit, defaultType }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    client: "",
    date: new Date().toISOString().split('T')[0],
    type: (defaultType || "income") as "income" | "expense"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: Date.now().toString()
      };
      
      onSubmit(transaction);
      toast.success("Transaction ajoutée avec succès !");
      
      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "",
        client: "",
        date: new Date().toISOString().split('T')[0],
        type: (defaultType || "income") as "income" | "expense"
      });
      
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          Montant (€) *
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
      </div>

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