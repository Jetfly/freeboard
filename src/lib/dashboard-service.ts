import { supabase } from './supabase'

export interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    revenueGrowth: number
    expenseGrowth: number
    totalVatCollected: number
    totalVatToPay: number
    cashFlowDays: number
    averageMonthlyRevenue: number
  }
  vatMetrics: {
    currentYearRevenue: number
    vatThreshold: number
    vatProgress: number
    nextDeclarationDate: string
    declarationType: string
    vatToPay: number
  }
  alerts: Array<{
    id: string
    type: 'warning' | 'info' | 'success' | 'error'
    title: string
    message: string
    actionRequired: boolean
  }>
  recentTransactions: Array<{
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category: string
    client_name?: string
  }>
  monthlyData: Array<{
    month: string
    revenus: number
    depenses: number
    vatCollected: number
    netCashFlow: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
    type: 'income' | 'expense'
  }>
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  try {
    // Récupérer les transactions de l'utilisateur
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (transactionsError) {
      console.error('Erreur lors de la récupération des transactions:', transactionsError)
      throw transactionsError
    }

    // Calculer les KPIs
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Transactions du mois actuel
    const currentMonthTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === currentYear && 
             transactionDate.getMonth() === currentMonth
    }) || []

    // Transactions du mois précédent
    const lastMonthTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === lastMonthYear && 
             transactionDate.getMonth() === lastMonth
    }) || []

    // Calculer les totaux
    const totalRevenue = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    const lastMonthRevenue = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    // Calculer les croissances
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    const expenseGrowth = lastMonthExpenses > 0 
      ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0

    // Calculer les métriques TVA et cash flow
    const currentYearTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === currentYear
    }) || []

    const currentYearRevenue = currentYearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalVatCollected = currentYearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.vat_amount) || 0), 0)

    const totalVatToPay = totalVatCollected * 0.8 // Estimation 80% à reverser

    // Calculer la moyenne mensuelle des revenus
    const monthsWithRevenue = Math.max(1, currentMonth + 1)
    const averageMonthlyRevenue = currentYearRevenue / monthsWithRevenue

    // Calculer les jours de trésorerie (estimation)
    const monthlyExpenses = totalExpenses || 1
    const currentCash = totalRevenue - totalExpenses
    const cashFlowDays = Math.max(0, Math.floor((currentCash / monthlyExpenses) * 30))

    // Métriques TVA
    const vatThreshold = 36800 // Seuil micro-entreprise
    const vatProgress = Math.min(100, (currentYearRevenue / vatThreshold) * 100)
    
    // Prochaine déclaration TVA
    const nextQuarter = Math.ceil((currentMonth + 1) / 3)
    const nextDeclarationMonth = nextQuarter * 3
    const nextDeclarationDate = new Date(currentYear, nextDeclarationMonth, 30)
    if (nextDeclarationDate < new Date()) {
      nextDeclarationDate.setFullYear(currentYear + 1)
      nextDeclarationDate.setMonth(2) // Mars de l'année suivante
    }

    // Générer des alertes business
    const alerts = []
    
    if (currentYearRevenue > vatThreshold * 0.9) {
      alerts.push({
        id: 'vat-threshold',
        type: 'warning' as const,
        title: 'Seuil TVA approché',
        message: `Vous approchez du seuil de ${vatThreshold}€. Préparez-vous au régime TVA.`,
        actionRequired: true
      })
    }
    
    if (cashFlowDays < 30) {
      alerts.push({
        id: 'cash-flow',
        type: 'error' as const,
        title: 'Trésorerie faible',
        message: `Seulement ${cashFlowDays} jours de trésorerie restants.`,
        actionRequired: true
      })
    }
    
    if (totalRevenue > lastMonthRevenue * 1.2) {
      alerts.push({
        id: 'growth',
        type: 'success' as const,
        title: 'Croissance excellente',
        message: `Revenus en hausse de ${revenueGrowth.toFixed(1)}% ce mois !`,
        actionRequired: false
      })
    }

    // Préparer les données mensuelles pour les graphiques
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthTransactions = transactions?.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getFullYear() === date.getFullYear() && 
               transactionDate.getMonth() === date.getMonth()
      }) || []

      const monthRevenue = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

      const vatCollected = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.vat_amount) || 0), 0)

      monthlyData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenus: monthRevenue,
        depenses: monthExpenses,
        vatCollected,
        netCashFlow: monthRevenue - monthExpenses
      })
    }

    // Calculer la répartition par catégorie
    const categoryTotals = new Map<string, { amount: number, type: 'income' | 'expense' }>()
    
    currentMonthTransactions.forEach(t => {
      const existing = categoryTotals.get(t.category) || { amount: 0, type: t.type }
      existing.amount += Math.abs(Number(t.amount))
      categoryTotals.set(t.category, existing)
    })

    const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
    
    const categoryBreakdown = Array.from(categoryTotals.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      type: data.type
    })).sort((a, b) => b.amount - a.amount)

    // Récupérer les 5 dernières transactions
    const recentTransactions = (transactions?.slice(0, 5) || []).map(t => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      type: t.type as 'income' | 'expense',
      date: t.date,
      category: t.category,
      client_name: t.client_name
    }))

    return {
      kpis: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        revenueGrowth,
        expenseGrowth,
        totalVatCollected,
        totalVatToPay,
        cashFlowDays,
        averageMonthlyRevenue
      },
      vatMetrics: {
        currentYearRevenue,
        vatThreshold,
        vatProgress,
        nextDeclarationDate: nextDeclarationDate.toISOString(),
        declarationType: currentYearRevenue > vatThreshold ? 'TVA trimestrielle' : 'Micro-entreprise',
        vatToPay: totalVatToPay
      },
      alerts,
      recentTransactions,
      monthlyData,
      categoryBreakdown
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error)
    throw error
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      throw error
    }

    return profile
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error)
    throw error
  }
}

export async function getFinancialGoals(userId: string) {
  try {
    const { data: goals, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des objectifs:', error)
      throw error
    }

    return goals || []
  } catch (error) {
    console.error('Erreur lors de la récupération des objectifs financiers:', error)
    throw error
  }
}

export async function addTransaction(userId: string, transactionData: {
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
  client_name?: string
  vat_rate?: number
  amount_ht?: number
  vat_amount?: number
}) {
  try {
    // Utiliser les valeurs TVA calculées côté client si fournies
    const amount_ht = transactionData.amount_ht || transactionData.amount
    const vat_amount = transactionData.vat_amount || 0

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: transactionData.amount,
        amount_ht,
        vat_amount,
        vat_rate: transactionData.vat_rate || 20,
        type: transactionData.type,
        category: transactionData.category,
        description: transactionData.description,
        date: transactionData.date,
        client_name: transactionData.client_name,
        status: 'paid'
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la transaction:', error)
    throw error
  }
}

export async function updateUserProfile(userId: string, profileData: {
  first_name?: string
  last_name?: string
  business_name?: string
  legal_status?: string
  vat_number?: string
  siret?: string
}) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil utilisateur:', error)
    throw error
  }
}