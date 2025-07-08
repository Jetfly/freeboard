'use client'

import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loading des composants lourds
const RevenueChart = lazy(() => import('@/components/revenue-chart').then(module => ({ default: module.RevenueChart })))
const ExpensePieChart = lazy(() => import('@/components/expense-pie-chart').then(module => ({ default: module.ExpensePieChart })))
const CashflowChart = lazy(() => import('@/components/cashflow-chart').then(module => ({ default: module.CashflowChart })))
const ProgressGoals = lazy(() => import('@/components/progress-goals').then(module => ({ default: module.ProgressGoals })))
const VatAlerts = lazy(() => import('@/components/vat-alerts').then(module => ({ default: module.VatAlerts })))

// Skeleton loaders optimisés
export function ChartSkeleton({ type = 'line', height = 300 }: { type?: 'line' | 'pie' | 'bar', height?: number }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3" style={{ height }}>
          {type === 'pie' ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end space-x-2 h-full">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="w-full" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-8" />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiSkeleton() {
  return (
    <Card className="min-h-[280px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pt-2">
        <Skeleton className="h-8 w-32 mb-3" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  )
}

export function TransactionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Composants lazy avec fallbacks
export function LazyRevenueChart() {
  return (
    <Suspense fallback={<ChartSkeleton type="line" />}>
      <RevenueChart />
    </Suspense>
  )
}

export function LazyExpensePieChart() {
  return (
    <Suspense fallback={<ChartSkeleton type="pie" />}>
      <ExpensePieChart />
    </Suspense>
  )
}

export function LazyCashflowChart() {
  return (
    <Suspense fallback={<ChartSkeleton type="line" height={350} />}>
      <CashflowChart />
    </Suspense>
  )
}

export function LazyProgressGoals() {
  return (
    <Suspense fallback={<KpiSkeleton />}>
      <ProgressGoals />
    </Suspense>
  )
}

export function LazyVatAlerts() {
  return (
    <Suspense fallback={<Skeleton className="h-32 w-full" />}>
      <VatAlerts />
    </Suspense>
  )
}

// Hook pour gérer le lazy loading progressif
export function useLazyLoading() {
  const [loadedComponents, setLoadedComponents] = useState(new Set<string>())
  
  const loadComponent = useCallback((componentName: string) => {
    setLoadedComponents(prev => new Set([...prev, componentName]))
  }, [])
  
  const isLoaded = useCallback((componentName: string) => {
    return loadedComponents.has(componentName)
  }, [loadedComponents])
  
  return { loadComponent, isLoaded }
}

// Intersection Observer pour lazy loading basé sur la visibilité
export function useIntersectionObserver(callback: () => void, options?: IntersectionObserverInit) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  
  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
        observer.disconnect()
      }
    }, { threshold: 0.1, ...options })
    
    observer.observe(ref)
    
    return () => observer.disconnect()
  }, [ref, callback, options])
  
  return setRef
}