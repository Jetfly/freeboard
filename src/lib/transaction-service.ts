import { supabase } from './supabase';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  client_name?: string;
  date: string;
  type: 'income' | 'expense';
  user_id: string;
  amount_ht?: number;
  vat_amount?: number;
  vat_rate?: number;
  status?: string;
  invoice_number?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  search?: string;
  categories?: string[];
  type?: 'all' | 'income' | 'expense';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {}
): Promise<{ transactions: Transaction[]; total: number }> {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Appliquer les filtres
    if (filters.search) {
      query = query.or(
        `description.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }

    return {
      transactions: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Erreur dans getTransactions:', error);
    throw error;
  }
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans deleteTransaction:', error);
    throw error;
  }
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Transaction> {
  try {
    // La TVA sera calculée côté client selon les paramètres utilisateur
    // Ne plus forcer le calcul automatique ici

    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur dans updateTransaction:', error);
    throw error;
  }
}

export async function bulkDeleteTransactions(transactionIds: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .in('id', transactionIds);

    if (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans bulkDeleteTransactions:', error);
    throw error;
  }
}

export async function getTransactionStats(userId: string): Promise<{
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }

    const transactions = data || [];
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  } catch (error) {
    console.error('Erreur dans getTransactionStats:', error);
    throw error;
  }
}

export async function getCategories(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }

    const categories = [...new Set(data?.map(t => t.category) || [])];
    return categories.filter(Boolean);
  } catch (error) {
    console.error('Erreur dans getCategories:', error);
    throw error;
  }
}