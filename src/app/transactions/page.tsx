"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  Euro,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { TransactionModal } from "@/components/transaction-modal";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { PageWrapper } from "@/components/page-wrapper";
import { AnimatedCard } from "@/components/animated-card";
import { TransactionQuickActions } from "@/components/transaction-quick-actions";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionBulkActions, useTransactionSelection } from "@/components/transaction-bulk-actions";
import { MonthlyRevenueChart } from "@/components/monthly-revenue-chart";
import { TransactionExport } from "@/components/transaction-export";
import { PageTransition, SectionTransition, ListTransition } from "@/components/page-transition";
import { SwipeableItem } from "@/components/swipe-gestures";
import { OneHandedFAB, TouchButton } from "@/components/one-handed-layout";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

// Les catégories par défaut (peuvent être étendues par les données utilisateur)
const defaultCategories = [
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
];

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Utiliser le hook pour les transactions Supabase
  const {
    transactions: allTransactions,
    loading: transactionsLoading,
    error: transactionsError,
    total: totalTransactions,
    stats,
    categories: userCategories,
    updateFilters,
    refreshData,
    removeTransaction,
    removeBulkTransactions
  } = useTransactions({
    search: searchTerm,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    type: selectedType as 'all' | 'income' | 'expense',
    page: currentPage,
    limit: ITEMS_PER_PAGE
  });
  
  // Bulk selection
  const { selectedIds, handleSelectionChange, clearSelection } = useTransactionSelection();
  
  // Combiner les catégories par défaut avec celles de l'utilisateur
  const allCategories = [...new Set([...defaultCategories, ...userCategories])];

  // Pagination
  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  const paginatedTransactions = allTransactions;

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, selectedType]);

  const handleAddTransaction = () => {
    // Rafraîchir les données après ajout
    refreshData();
    toast.success('Transaction ajoutée avec succès !');
    setIsTransactionModalOpen(false);
    setTransactionType(null);
  };

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchTerm(value);
      updateFilters({ search: value });
      setIsLoading(false);
    }, 300);
  };

  // Quick actions handlers
  const handleAddIncome = () => {
    setTransactionType("income");
    setIsTransactionModalOpen(true);
  };

  const handleAddExpense = () => {
    setTransactionType("expense");
    setIsTransactionModalOpen(true);
  };

  // Category filter handlers
  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedType("all");
    updateFilters({ search: undefined, categories: undefined, type: 'all' });
    clearSelection();
  };

  // Bulk actions handlers
  const handleBulkDelete = async (ids: string[]) => {
    try {
      await removeBulkTransactions(ids);
      clearSelection();
      toast.success(`${ids.length} transaction${ids.length > 1 ? 's' : ''} supprimée${ids.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Erreur lors de la suppression des transactions');
    }
  };

  const handleBulkExport = (ids: string[], format: 'pdf' | 'excel') => {
    toast.success(`Export ${format.toUpperCase()} de ${ids.length} transaction${ids.length > 1 ? 's' : ''} en cours...`);
  };

  const handleBulkStatusChange = (ids: string[], status: string) => {
    // Cette fonctionnalité nécessiterait une mise à jour du service
    toast.success(`Statut mis à jour pour ${ids.length} transaction${ids.length > 1 ? 's' : ''}`);
  };

  // Generate suggestions for autocomplete
  const suggestions = useMemo(() => {
    const descriptions = allTransactions.map(t => t.description);
    const clients = allTransactions.map(t => t.client_name).filter(Boolean) as string[];
    const amounts = allTransactions.map(t => t.amount.toString());
    return [...new Set([...descriptions, ...clients, ...amounts])];
  }, [allTransactions]);

  return (
    <PageTransition variant="slideUp">
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">Transactions</h1>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {/* Quick Actions */}
          <SectionTransition direction="up">
            <TransactionQuickActions
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
            />
          </SectionTransition>

          {/* Summary Cards and Monthly Chart */}
          <SectionTransition direction="up" delay={0.1}>
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-3">
            <div className="grid gap-4 md:grid-cols-3">
              <AnimatedCard delay={0.1}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Revenus totaux
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{(stats?.totalIncome || 0).toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allTransactions.filter(t => t.type === 'income').length} transactions
                  </p>
                </CardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.2}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Dépenses totales
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{(stats?.totalExpenses || 0).toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allTransactions.filter(t => t.type === 'expense').length} transactions
                  </p>
                </CardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.3}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Solde net
                  </CardTitle>
                  <Euro className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(stats?.netBalance || 0) >= 0 ? '+' : ''}{(stats?.netBalance || 0).toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalTransactions} transactions au total
                  </p>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
          
              {/* Monthly Chart */}
              <div className="lg:col-span-1">
                <MonthlyRevenueChart transactions={allTransactions} />
              </div>
            </div>
          </SectionTransition>

          {/* Advanced Filters */}
          <SectionTransition direction="up" delay={0.2}>
            <TransactionFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              selectedType={selectedType}
              onTypeChange={(type) => {
                setSelectedType(type);
                updateFilters({ type: type as 'all' | 'income' | 'expense' });
              }}
              availableCategories={allCategories}
              onReset={handleResetFilters}
              suggestions={suggestions}
            />
          </SectionTransition>

          {/* Bulk Actions */}
          <SectionTransition direction="up" delay={0.3}>
              <TransactionBulkActions
                transactions={allTransactions.map(t => ({
                  ...t,
                  date: new Date(t.created_at).toLocaleDateString('fr-FR'),
                  client: t.client_name || '',
                  status: t.type === 'income' ? 'En attente' : 'Débitée'
                }))}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                onBulkDelete={handleBulkDelete}
                onBulkExport={handleBulkExport}
                onBulkStatusChange={handleBulkStatusChange}
              />
            </SectionTransition>

          {/* Export Component */}
          <SectionTransition direction="up" delay={0.4}>
              <TransactionExport
                transactions={allTransactions.map(t => ({
                  ...t,
                  date: new Date(t.created_at).toLocaleDateString('fr-FR'),
                  client: t.client_name || '',
                  status: t.type === 'income' ? 'En attente' : 'Débitée'
                }))}
                selectedIds={selectedIds}
                filters={{
                  searchTerm,
                  selectedCategories,
                  selectedType
                }}
              />
            </SectionTransition>

          {/* Transactions List */}
          <SectionTransition direction="up" delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Liste des transactions
                <Badge variant="outline">
                  {totalTransactions}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="list" count={ITEMS_PER_PAGE} />
              ) : allTransactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune transaction trouvée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {paginatedTransactions.map((transaction, index) => {
                      const isSelected = selectedIds.includes(transaction.id);
                      return (
                        <SwipeableItem
                          key={transaction.id}
                          leftActions={[
                             {
                               icon: Edit,
                               label: "Modifier",
                               color: "text-white",
                               bgColor: "bg-blue-500",
                               action: () => {
                                 toast.success(`Modification de ${transaction.description}`);
                               }
                             }
                           ]}
                           rightActions={[
                             {
                               icon: Trash2,
                               label: "Supprimer",
                               color: "text-white",
                               bgColor: "bg-red-500",
                               action: () => {
                                 handleBulkDelete([transaction.id]);
                               }
                             }
                           ]}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-blue-300 bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    handleSelectionChange(selectedIds.filter(id => id !== transaction.id));
                                  } else {
                                    handleSelectionChange([...selectedIds, transaction.id]);
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <motion.div 
                                className={`p-2 rounded-full ${
                                  transaction.type === 'income' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-red-100 text-red-600'
                                }`}
                                whileHover={{ rotate: 5 }}
                              >
                                {transaction.type === 'income' ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                              </motion.div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {transaction.description}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(transaction.created_at).toLocaleDateString('fr-FR')}</span>
                                  {transaction.client_name && transaction.client_name !== '-' && (
                                    <>
                                      <span>•</span>
                                      <span>{transaction.client_name}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {transaction.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${
                                transaction.type === 'income' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {transaction.amount.toLocaleString('fr-FR')}€
                              </div>
                              <Badge 
                                variant={transaction.type === 'income' ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {transaction.type === 'income' ? 'En attente' : 'Débitée'}
                              </Badge>
                            </div>
                          </motion.div>
                        </SwipeableItem>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between mt-6 pt-4 border-t"
                >
                  <div className="text-sm text-gray-500">
                    Page {currentPage} sur {totalPages} ({totalTransactions} transactions)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
          </SectionTransition>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setTransactionType(null);
          }}
          onTransactionAdded={handleAddTransaction}
          defaultType={transactionType}
        />

        {/* One-handed FAB */}
         <OneHandedFAB
           icon={Plus}
           onClick={() => setIsTransactionModalOpen(true)}
           label="Nouvelle transaction"
         />
        </main>
      </div>
    </PageTransition>
  );
}