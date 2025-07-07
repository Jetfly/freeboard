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

const transactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "2024-12-15",
    description: "Développement site web e-commerce",
    client: "Boutique Mode Paris",
    category: "Développement web",
    amount: 3500,
    type: "income",
    status: "Payé",
  },
  {
    id: "TXN-002",
    date: "2024-12-14",
    description: "Abonnement Adobe Creative Suite",
    client: "-",
    category: "Logiciels",
    amount: 59,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-003",
    date: "2024-12-13",
    description: "Application mobile iOS",
    client: "StartupTech",
    category: "Développement mobile",
    amount: 4200,
    type: "income",
    status: "En attente",
  },
  {
    id: "TXN-004",
    date: "2024-12-12",
    description: "Serveur cloud AWS",
    client: "-",
    category: "Infrastructure",
    amount: 125,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-005",
    date: "2024-12-11",
    description: "Consultation stratégie digitale",
    client: "Entreprise Conseil",
    category: "Conseil",
    amount: 800,
    type: "income",
    status: "Payé",
  },
  {
    id: "TXN-006",
    date: "2024-12-10",
    description: "Formation React Advanced",
    client: "-",
    category: "Formation",
    amount: 299,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-007",
    date: "2024-12-09",
    description: "Maintenance site web",
    client: "Restaurant Le Gourmet",
    category: "Support",
    amount: 450,
    type: "income",
    status: "Payé",
  },
  {
    id: "TXN-008",
    date: "2024-12-08",
    description: "Équipement bureau (écran 4K)",
    client: "-",
    category: "Équipement",
    amount: 399,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-009",
    date: "2024-12-07",
    description: "Design UI/UX application",
    client: "FinTech Solutions",
    category: "Design",
    amount: 2100,
    type: "income",
    status: "En attente",
  },
  {
    id: "TXN-010",
    date: "2024-12-06",
    description: "Assurance responsabilité civile",
    client: "-",
    category: "Assurance",
    amount: 89,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-011",
    date: "2024-12-05",
    description: "API REST développement",
    client: "TechCorp",
    category: "Développement web",
    amount: 1800,
    type: "income",
    status: "Payé",
  },
  {
    id: "TXN-012",
    date: "2024-12-04",
    description: "Marketing digital - Google Ads",
    client: "-",
    category: "Marketing digital",
    amount: 150,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-013",
    date: "2024-12-03",
    description: "Audit sécurité application",
    client: "SecureApp Inc",
    category: "Conseil",
    amount: 1200,
    type: "income",
    status: "Payé",
  },
  {
    id: "TXN-014",
    date: "2024-12-02",
    description: "Licence JetBrains",
    client: "-",
    category: "Logiciels",
    amount: 199,
    type: "expense",
    status: "Débitée",
  },
  {
    id: "TXN-015",
    date: "2024-12-01",
    description: "Refonte site vitrine",
    client: "Artisan Local",
    category: "Développement web",
    amount: 950,
    type: "income",
    status: "En attente",
  },
];

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
];

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState(transactions);
  
  // Bulk selection
  const { selectedIds, handleSelectionChange, clearSelection } = useTransactionSelection();

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch = searchTerm === "" || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.amount.toString().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(transaction.category);
      const matchesType = selectedType === "all" || transaction.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allTransactions, searchTerm, selectedCategories, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, selectedType]);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const handleAddTransaction = (transaction: any) => {
    const newTransaction = {
      ...transaction,
      id: `TXN-${String(allTransactions.length + 1).padStart(3, '0')}`,
      date: transaction.date,
      status: transaction.type === 'income' ? 'En attente' : 'Débitée'
    };
    
    setAllTransactions(prev => [newTransaction, ...prev]);
    toast.success('Transaction ajoutée avec succès !');
    setIsTransactionModalOpen(false);
    setTransactionType(null);
  };

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchTerm(value);
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
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedType("all");
    clearSelection();
  };

  // Bulk actions handlers
  const handleBulkDelete = (ids: string[]) => {
    setAllTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    clearSelection();
    toast.success(`${ids.length} transaction${ids.length > 1 ? 's' : ''} supprimée${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkExport = (ids: string[], format: 'pdf' | 'excel') => {
    toast.success(`Export ${format.toUpperCase()} de ${ids.length} transaction${ids.length > 1 ? 's' : ''} en cours...`);
  };

  const handleBulkStatusChange = (ids: string[], status: string) => {
    setAllTransactions(prev => 
      prev.map(t => 
        ids.includes(t.id) ? { ...t, status } : t
      )
    );
    clearSelection();
    toast.success(`Statut mis à jour pour ${ids.length} transaction${ids.length > 1 ? 's' : ''}`);
  };

  // Generate suggestions for autocomplete
  const suggestions = useMemo(() => {
    const descriptions = allTransactions.map(t => t.description);
    const clients = allTransactions.map(t => t.client).filter(Boolean) as string[];
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
                    +{totalIncome.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === 'income').length} transactions
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
                    -{totalExpenses.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === 'expense').length} transactions
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
                    netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('fr-FR')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.length} transactions au total
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
              onTypeChange={setSelectedType}
              availableCategories={categories}
              onReset={handleResetFilters}
              suggestions={suggestions}
            />
          </SectionTransition>

          {/* Bulk Actions */}
          <SectionTransition direction="up" delay={0.3}>
            <TransactionBulkActions
              transactions={filteredTransactions}
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
              transactions={filteredTransactions}
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
                  {filteredTransactions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonLoader type="list" count={ITEMS_PER_PAGE} />
              ) : paginatedTransactions.length === 0 ? (
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
                                  <span>{new Date(transaction.date).toLocaleDateString('fr-FR')}</span>
                                  {transaction.client && transaction.client !== '-' && (
                                    <>
                                      <span>•</span>
                                      <span>{transaction.client}</span>
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
                              {transaction.status && (
                                <Badge 
                                  variant={transaction.status === 'Payé' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {transaction.status}
                                </Badge>
                              )}
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
                    Page {currentPage} sur {totalPages} ({filteredTransactions.length} transactions)
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
          onSubmit={handleAddTransaction}
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