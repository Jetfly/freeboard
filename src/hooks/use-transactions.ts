import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getTransactions,
  getTransactionStats,
  getCategories,
  deleteTransaction,
  bulkDeleteTransactions,
  updateTransaction,
  Transaction,
  TransactionFilters
} from '@/lib/transaction-service';

export function useTransactions(initialFilters: TransactionFilters = {}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getTransactions(user.id, filters);
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      setError('Erreur lors du chargement des transactions');
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const transactionStats = await getTransactionStats(user.id);
      setStats(transactionStats);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      const userCategories = await getCategories(user.id);
      setCategories(userCategories);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [fetchStats, fetchCategories]);

  const refreshData = useCallback(() => {
    fetchTransactions();
    fetchStats();
    fetchCategories();
  }, [fetchTransactions, fetchStats, fetchCategories]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const removeTransaction = useCallback(async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      fetchStats(); // Rafraîchir les stats
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  }, [fetchStats]);

  const removeBulkTransactions = useCallback(async (transactionIds: string[]) => {
    try {
      await bulkDeleteTransactions(transactionIds);
      setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
      fetchStats(); // Rafraîchir les stats
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression en masse:', err);
      throw err;
    }
  }, [fetchStats]);

  const editTransaction = useCallback(async (
    transactionId: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const updatedTransaction = await updateTransaction(transactionId, updates);
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? updatedTransaction : t)
      );
      fetchStats(); // Rafraîchir les stats
      return updatedTransaction;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  }, [fetchStats]);

  return {
    transactions,
    loading,
    error,
    total,
    stats,
    categories,
    filters,
    updateFilters,
    refreshData,
    removeTransaction,
    removeBulkTransactions,
    editTransaction
  };
}