"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Download, 
  Edit, 
  Check, 
  X, 
  MoreHorizontal,
  FileText,
  Archive,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState as useDropdownState } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  client?: string;
  status?: string;
}

interface TransactionBulkActionsProps {
  transactions: Transaction[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkExport: (ids: string[], format: 'pdf' | 'excel') => void;
  onBulkStatusChange: (ids: string[], status: string) => void;
}

export function TransactionBulkActions({
  transactions,
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkStatusChange
}: TransactionBulkActionsProps) {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const isAllSelected = transactions.length > 0 && selectedIds.length === transactions.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < transactions.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(transactions.map(t => t.id));
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    if (selectedIds.includes(transactionId)) {
      onSelectionChange(selectedIds.filter(id => id !== transactionId));
    } else {
      onSelectionChange([...selectedIds, transactionId]);
    }
  };

  const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id));
  const totalSelectedAmount = selectedTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Bulk selection header */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el: HTMLInputElement | null) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">
                {selectedIds.length === 0
                  ? "Sélectionner tout"
                  : `${selectedIds.length} transaction${selectedIds.length > 1 ? 's' : ''} sélectionnée${selectedIds.length > 1 ? 's' : ''}`
                }
              </span>
              {selectedIds.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Total: {totalSelectedAmount >= 0 ? '+' : ''}{totalSelectedAmount.toLocaleString('fr-FR')}€
                </Badge>
              )}
            </div>
            
            {selectedIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                Désélectionner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedIds.length} élément{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Export actions */}
                    <SimpleDropdown
                      trigger={
                        <Button variant="outline" size="sm" className="bg-white">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Export PDF",
                          icon: <FileText className="h-4 w-4 mr-2" />,
                          onClick: () => onBulkExport(selectedIds, 'pdf')
                        },
                        {
                          label: "Export Excel",
                          icon: <Download className="h-4 w-4 mr-2" />,
                          onClick: () => onBulkExport(selectedIds, 'excel')
                        }
                      ]}
                    />

                    {/* Status actions */}
                    <SimpleDropdown
                      trigger={
                        <Button variant="outline" size="sm" className="bg-white">
                          <Edit className="h-4 w-4 mr-2" />
                          Statut
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Marquer comme payé",
                          icon: <Check className="h-4 w-4 mr-2 text-green-600" />,
                          onClick: () => onBulkStatusChange(selectedIds, 'Payé')
                        },
                        {
                          label: "Marquer en attente",
                          icon: <Archive className="h-4 w-4 mr-2 text-orange-600" />,
                          onClick: () => onBulkStatusChange(selectedIds, 'En attente')
                        },
                        {
                          label: "Marquer comme débitée",
                          icon: <Check className="h-4 w-4 mr-2 text-blue-600" />,
                          onClick: () => onBulkStatusChange(selectedIds, 'Débitée')
                        }
                      ]}
                    />

                    {/* More actions */}
                    <SimpleDropdown
                      trigger={
                        <Button variant="outline" size="sm" className="bg-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Supprimer la sélection",
                          icon: <Trash2 className="h-4 w-4 mr-2" />,
                          onClick: () => onBulkDelete(selectedIds),
                          className: "text-red-600"
                        }
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple dropdown component
interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

function SimpleDropdown({ trigger, items }: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useDropdownState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
            >
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center border-b border-gray-100 last:border-b-0 ${item.className || ''}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook pour gérer la sélection
export function useTransactionSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    handleSelectionChange,
    clearSelection
  };
}