"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Table, Calendar, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

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

interface TransactionExportProps {
  transactions: Transaction[];
  selectedIds?: string[];
  filters?: {
    searchTerm: string;
    selectedCategories: string[];
    selectedType: string;
  };
}

export function TransactionExport({ 
  transactions, 
  selectedIds = [], 
  filters 
}: TransactionExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportTransactions = selectedIds.length > 0 
    ? transactions.filter(t => selectedIds.includes(t.id))
    : transactions;

  const totalIncome = exportTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = exportTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const generateCSVContent = () => {
    const headers = [
      'ID',
      'Date',
      'Description',
      'Client',
      'Catégorie',
      'Type',
      'Montant (€)',
      'Statut'
    ];

    const csvContent = [
      headers.join(';'),
      ...exportTransactions.map(transaction => [
        transaction.id,
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        `"${transaction.description}"`,
        transaction.client || '-',
        transaction.category,
        transaction.type === 'income' ? 'Revenu' : 'Dépense',
        transaction.amount.toFixed(2),
        transaction.status || '-'
      ].join(';')),
      '', // Empty line
      'RÉSUMÉ',
      `Total Revenus;${totalIncome.toFixed(2)}€`,
      `Total Dépenses;${totalExpenses.toFixed(2)}€`,
      `Solde Net;${(totalIncome - totalExpenses).toFixed(2)}€`,
      `Nombre de transactions;${exportTransactions.length}`
    ].join('\n');

    return csvContent;
  };

  const generateHTMLContent = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const filterInfo = filters ? [
      filters.searchTerm && `Recherche: "${filters.searchTerm}"`,
      filters.selectedCategories.length > 0 && `Catégories: ${filters.selectedCategories.join(', ')}`,
      filters.selectedType !== 'all' && `Type: ${filters.selectedType === 'income' ? 'Revenus' : 'Dépenses'}`
    ].filter(Boolean).join(' • ') : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Export Transactions - FreeBoard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
        .amount-income { color: #10b981; font-weight: 600; }
        .amount-expense { color: #ef4444; font-weight: 600; }
        .status-paid { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status-pending { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status-debited { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .filters { background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Export Transactions</h1>
        <p>Généré le ${currentDate} • ${exportTransactions.length} transaction${exportTransactions.length > 1 ? 's' : ''}</p>
        ${selectedIds.length > 0 ? `<p><strong>Sélection:</strong> ${selectedIds.length} transaction${selectedIds.length > 1 ? 's' : ''} sélectionnée${selectedIds.length > 1 ? 's' : ''}</p>` : ''}
    </div>
    
    ${filterInfo ? `<div class="filters"><strong>Filtres appliqués:</strong> ${filterInfo}</div>` : ''}
    
    <div class="summary">
        <h2>📈 Résumé Financier</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div>💰 Revenus Totaux</div>
                <div class="summary-value income">+${totalIncome.toLocaleString('fr-FR')}€</div>
            </div>
            <div class="summary-item">
                <div>💸 Dépenses Totales</div>
                <div class="summary-value expense">-${totalExpenses.toLocaleString('fr-FR')}€</div>
            </div>
            <div class="summary-item">
                <div>📊 Solde Net</div>
                <div class="summary-value balance">${(totalIncome - totalExpenses >= 0 ? '+' : '')}${(totalIncome - totalExpenses).toLocaleString('fr-FR')}€</div>
            </div>
        </div>
    </div>
    
    <h2>📋 Détail des Transactions</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Client</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            ${exportTransactions.map(transaction => `
                <tr>
                    <td>${new Date(transaction.date).toLocaleDateString('fr-FR')}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.client || '-'}</td>
                    <td>${transaction.category}</td>
                    <td class="amount-${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString('fr-FR')}€
                    </td>
                    <td>
                        <span class="status-${transaction.status === 'Payé' ? 'paid' : transaction.status === 'En attente' ? 'pending' : 'debited'}">
                            ${transaction.status || '-'}
                        </span>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Généré par FreeBoard • Tableau de bord freelance</p>
    </div>
</body>
</html>
    `;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSVContent();
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      toast.success(`Export Excel réussi ! ${exportTransactions.length} transactions exportées.`);
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const htmlContent = generateHTMLContent();
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.html`;
      downloadFile(htmlContent, filename, 'text/html;charset=utf-8;');
      toast.success(`Export PDF réussi ! ${exportTransactions.length} transactions exportées.`);
      toast('💡 Ouvrez le fichier HTML et utilisez "Imprimer > Enregistrer en PDF" pour obtenir un PDF.', {
        duration: 5000,
        icon: '💡'
      });
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle>Export des données</CardTitle>
            </div>
            <Badge variant="outline">
              {exportTransactions.length} transaction{exportTransactions.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">Revenus</div>
                <div className="text-lg font-bold text-green-600">
                  +{totalIncome.toLocaleString('fr-FR')}€
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Dépenses</div>
                <div className="text-lg font-bold text-red-600">
                  -{totalExpenses.toLocaleString('fr-FR')}€
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Solde</div>
                <div className={`text-lg font-bold ${
                  (totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(totalIncome - totalExpenses) >= 0 ? '+' : ''}
                  {(totalIncome - totalExpenses).toLocaleString('fr-FR')}€
                </div>
              </div>
            </div>

            {/* Export options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="w-full h-16 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <div className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    <span className="font-medium">Export Excel</span>
                  </div>
                  <span className="text-xs opacity-90">
                    Format CSV • Compatible Excel
                  </span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  variant="outline"
                  className="w-full h-16 flex flex-col items-center gap-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Export PDF</span>
                  </div>
                  <span className="text-xs opacity-90">
                    Format HTML • Convertible PDF
                  </span>
                </Button>
              </motion.div>
            </div>

            {/* Additional info */}
            <div className="text-xs text-gray-500 space-y-1">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>Export de la sélection ({selectedIds.length} transactions)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Période: {exportTransactions.length > 0 ? 
                  `${new Date(Math.min(...exportTransactions.map(t => new Date(t.date).getTime()))).toLocaleDateString('fr-FR')} - ${new Date(Math.max(...exportTransactions.map(t => new Date(t.date).getTime()))).toLocaleDateString('fr-FR')}` : 
                  'Aucune transaction'
                }</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}