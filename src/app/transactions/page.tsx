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
} from "lucide-react";
import { TransactionModal } from "@/components/transaction-modal";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { PageWrapper } from "@/components/page-wrapper";
import { AnimatedCard } from "@/components/animated-card";
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
  "Tous",
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
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState(transactions);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "Tous" || transaction.category === selectedCategory;
      const matchesType = selectedType === "all" || transaction.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allTransactions, searchTerm, selectedCategory, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType]);

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
  };

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchTerm(value);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-lg font-semibold">Transactions</h1>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground">
                Gérez vos revenus et dépenses
              </p>
            </div>
            <Button
              onClick={() => setIsTransactionModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Transaction
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
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

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par description ou client..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="w-full md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Type Filter */}
                <div className="w-full md:w-32">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous</option>
                    <option value="income">Revenus</option>
                    <option value="expense">Dépenses</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
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
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("Tous");
                      setSelectedType("all");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {paginatedTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
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
                    ))}
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
        </motion.div>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSubmit={handleAddTransaction}
        />
      </main>
    </div>
  );
}