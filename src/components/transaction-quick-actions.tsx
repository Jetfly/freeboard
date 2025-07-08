"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface TransactionQuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function TransactionQuickActions({ onAddIncome, onAddExpense }: TransactionQuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={onAddIncome}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 h-12"
                size="lg"
              >
                <div className="p-1 bg-green-500 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="font-medium">Ajouter une recette</span>
                <Plus className="h-4 w-4 ml-auto" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={onAddExpense}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 flex items-center gap-2 h-12"
                size="lg"
              >
                <div className="p-1 bg-red-100 rounded-full">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <span className="font-medium">Ajouter une dépense</span>
                <Plus className="h-4 w-4 ml-auto" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}