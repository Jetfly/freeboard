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

// Cache des résultats pour éviter les recalculs
const calculationCache = new Map<string, any>()

export async function getDashboardDataOptimized(userId: string): Promise<DashboardData> {
  try {
    // Une seule requête optimisée avec tous les champs nécessaires
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        amount_ht,
        vat_amount,
        type,
        category,
        description,
        date,
        client_name,
        created_at
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1000) // Limiter pour éviter de charger trop de données

    if (transactionsError) {
      console.error('Erreur lors de la récupération des transactions:', transactionsError)
      throw transactionsError
    }

    if (!transactions || transactions.length === 0) {
      return getEmptyDashboardData()
    }

    // Créer une clé de cache basée sur les données
    const cacheKey = `${userId}-${transactions.length}-${transactions[0]?.created_at}`
    
    // Vérifier le cache
    if (calculationCache.has(cacheKey)) {
      return calculationCache.get(cacheKey)
    }

    // Calculs optimisés avec une seule itération
    const result = calculateDashboardMetrics(transactions)
    
    // Mettre en cache
    calculationCache.set(cacheKey, result)
    
    // Nettoyer le cache si trop d'entrées
    if (calculationCache.size > 10) {
      const keys = Array.from(calculationCache.keys())
      keys.slice(0, 5).forEach(key => calculationCache.delete(key))
    }

    return result
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error)
    throw error
  }
}

function calculateDashboardMetrics(transactions: any[]): DashboardData {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Initialiser les accumulateurs
  const metrics = {
    currentMonth: { revenue: 0, expenses: 0, vatCollected: 0 },
    lastMonth: { revenue: 0, expenses: 0 },
    currentYear: { revenue: 0, vatCollected: 0 },
    monthlyData: new Map<string, any>(),
    categoryTotals: new Map<string, { amount: number, type: 'income' | 'expense' }>(),
    recentTransactions: [] as any[]
  }

  // Une seule itération pour tous les calculs
  transactions.forEach((transaction, index) => {
    const transactionDate = new Date(transaction.date)
    const year = transactionDate.getFullYear()
    const month = transactionDate.getMonth()
    const amount = Number(transaction.amount)
    const vatAmount = Number(transaction.vat_amount) || 0

    // Transactions récentes (5 premières)
    if (index < 5) {
      metrics.recentTransactions.push({
        id: transaction.id,
        description: transaction.description,
        amount,
        type: transaction.type,
        date: transaction.date,
        category: transaction.category,
        client_name: transaction.client_name
      })
    }

    // Mois actuel
    if (year === currentYear && month === currentMonth) {
      if (transaction.type === 'income') {
        metrics.currentMonth.revenue += amount
        metrics.currentMonth.vatCollected += vatAmount
      } else {
        metrics.currentMonth.expenses += Math.abs(amount)
      }
    }

    // Mois précédent
    if (year === lastMonthYear && month === lastMonth) {
      if (transaction.type === 'income') {
        metrics.lastMonth.revenue += amount
      } else {
        metrics.lastMonth.expenses += Math.abs(amount)
      }
    }

    // Année actuelle
    if (year === currentYear) {
      if (transaction.type === 'income') {
        metrics.currentYear.revenue += amount
        metrics.currentYear.vatCollected += vatAmount
      }
    }

    // Données mensuelles (12 derniers mois)
    const monthKey = `${year}-${month}`
    if (!metrics.monthlyData.has(monthKey)) {
      metrics.monthlyData.set(monthKey, {
        month: transactionDate.toLocaleDateString('fr-FR', { month: 'short' }),
        revenus: 0,
        depenses: 0,
        vatCollected: 0,
        netCashFlow: 0
      })
    }
    
    const monthData = metrics.monthlyData.get(monthKey)
    if (transaction.type === 'income') {
      monthData.revenus += amount
      monthData.vatCollected += vatAmount
    } else {
      monthData.depenses += Math.abs(amount)
    }
    monthData.netCashFlow = monthData.revenus - monthData.depenses

    // Catégories (mois actuel seulement)
    if (year === currentYear && month === currentMonth) {
      const existing = metrics.categoryTotals.get(transaction.category) || { amount: 0, type: transaction.type }
      existing.amount += Math.abs(amount)
      metrics.categoryTotals.set(transaction.category, existing)
    }
  })

  // Calculer les croissances
  const revenueGrowth = metrics.lastMonth.revenue > 0 
    ? ((metrics.currentMonth.revenue - metrics.lastMonth.revenue) / metrics.lastMonth.revenue) * 100 
    : 0

  const expenseGrowth = metrics.lastMonth.expenses > 0 
    ? ((metrics.currentMonth.expenses - metrics.lastMonth.expenses) / metrics.lastMonth.expenses) * 100 
    : 0

  // Métriques TVA
  const vatThreshold = 36800
  const vatProgress = Math.min(100, (metrics.currentYear.revenue / vatThreshold) * 100)
  const totalVatToPay = metrics.currentYear.vatCollected * 0.8

  // Cash flow
  const monthlyExpenses = metrics.currentMonth.expenses || 1
  const currentCash = metrics.currentMonth.revenue - metrics.currentMonth.expenses
  const cashFlowDays = Math.max(0, Math.floor((currentCash / monthlyExpenses) * 30))

  // Moyenne mensuelle
  const monthsWithRevenue = Math.max(1, currentMonth + 1)
  const averageMonthlyRevenue = metrics.currentYear.revenue / monthsWithRevenue

  // Prochaine déclaration
  const nextQuarter = Math.ceil((currentMonth + 1) / 3)
  const nextDeclarationMonth = nextQuarter * 3
  const nextDeclarationDate = new Date(currentYear, nextDeclarationMonth, 30)
  if (nextDeclarationDate < new Date()) {
    nextDeclarationDate.setFullYear(currentYear + 1)
    nextDeclarationDate.setMonth(2)
  }

  // Alertes
  const alerts = generateAlerts({
    currentYearRevenue: metrics.currentYear.revenue,
    vatThreshold,
    cashFlowDays,
    revenueGrowth,
    currentMonthRevenue: metrics.currentMonth.revenue,
    lastMonthRevenue: metrics.lastMonth.revenue
  })

  // Répartition par catégorie
  const totalAmount = Array.from(metrics.categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  const categoryBreakdown = Array.from(metrics.categoryTotals.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    type: data.type
  })).sort((a, b) => b.amount - a.amount)

  // Données mensuelles triées
  const sortedMonthlyData = Array.from(metrics.monthlyData.values())
    .slice(-12) // 12 derniers mois
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  return {
    kpis: {
      totalRevenue: metrics.currentMonth.revenue,
      totalExpenses: metrics.currentMonth.expenses,
      netProfit: metrics.currentMonth.revenue - metrics.currentMonth.expenses,
      revenueGrowth,
      expenseGrowth,
      totalVatCollected: metrics.currentYear.vatCollected,
      totalVatToPay,
      cashFlowDays,
      averageMonthlyRevenue
    },
    vatMetrics: {
      currentYearRevenue: metrics.currentYear.revenue,
      vatThreshold,
      vatProgress,
      nextDeclarationDate: nextDeclarationDate.toISOString(),
      declarationType: metrics.currentYear.revenue > vatThreshold ? 'TVA trimestrielle' : 'Micro-entreprise',
      vatToPay: totalVatToPay
    },
    alerts,
    recentTransactions: metrics.recentTransactions,
    monthlyData: sortedMonthlyData,
    categoryBreakdown
  }
}

function generateAlerts(params: {
  currentYearRevenue: number
  vatThreshold: number
  cashFlowDays: number
  revenueGrowth: number
  currentMonthRevenue: number
  lastMonthRevenue: number
}) {
  const alerts = []
  
  if (params.currentYearRevenue > params.vatThreshold * 0.9) {
    alerts.push({
      id: 'vat-threshold',
      type: 'warning' as const,
      title: 'Seuil TVA approché',
      message: `Vous approchez du seuil de ${params.vatThreshold}€. Préparez-vous au régime TVA.`,
      actionRequired: true
    })
  }
  
  if (params.cashFlowDays < 30) {
    alerts.push({
      id: 'cash-flow',
      type: 'error' as const,
      title: 'Trésorerie faible',
      message: `Seulement ${params.cashFlowDays} jours de trésorerie restants.`,
      actionRequired: true
    })
  }
  
  if (params.currentMonthRevenue > params.lastMonthRevenue * 1.2) {
    alerts.push({
      id: 'growth',
      type: 'success' as const,
      title: 'Croissance excellente',
      message: `Revenus en hausse de ${params.revenueGrowth.toFixed(1)}% ce mois !`,
      actionRequired: false
    })
  }

  return alerts
}

function getEmptyDashboardData(): DashboardData {
  return {
    kpis: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      totalVatCollected: 0,
      totalVatToPay: 0,
      cashFlowDays: 0,
      averageMonthlyRevenue: 0
    },
    vatMetrics: {
      currentYearRevenue: 0,
      vatThreshold: 36800,
      vatProgress: 0,
      nextDeclarationDate: new Date().toISOString(),
      declarationType: 'Micro-entreprise',
      vatToPay: 0
    },
    alerts: [],
    recentTransactions: [],
    monthlyData: [],
    categoryBreakdown: []
  }
}