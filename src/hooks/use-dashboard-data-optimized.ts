'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardData, DashboardData } from '@/lib/dashboard-service'

// Cache simple en mémoire
const cache = new Map<string, { data: DashboardData; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useDashboardDataOptimized() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clé de cache basée sur l'utilisateur et l'heure
  const cacheKey = useMemo(() => {
    if (!user) return null
    const now = new Date()
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
    return `dashboard-${user.id}-${hourKey}`
  }, [user])

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user || !cacheKey) {
      setLoading(false)
      return
    }

    // Vérifier le cache si pas de refresh forcé
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)
      
      const dashboardData = await getDashboardData(user.id)
      
      // Mettre en cache
      cache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      })
      
      setData(dashboardData)
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Erreur lors du chargement des données')
      
      // Données de secours en cas d'erreur
      const fallbackData: DashboardData = {
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
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }, [user, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refreshData = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key)
        }
      }
    }

    const interval = setInterval(cleanup, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error, refreshData }
}

// Hook pour précharger les données
export function useDashboardPreload() {
  const { user } = useAuth()
  
  const preloadData = useCallback(async () => {
    if (!user) return
    
    try {
      // Précharger en arrière-plan sans affecter l'UI
      await getDashboardData(user.id)
    } catch (error) {
      // Ignorer les erreurs de préchargement
      console.warn('Erreur de préchargement:', error)
    }
  }, [user])

  return { preloadData }
}