/**
 * ==========================================
 * PÁGINA PRINCIPAL DO DASHBOARD - REDESIGN
 * ==========================================
 * Dashboard executivo com 2 abas otimizadas
 *
 * Features:
 * - Aba Dashboard: visão executiva completa com scroll vertical
 * - Aba Análises: breakdowns detalhados por diferentes dimensões
 * - Carousel apenas para gráficos, não para métricas
 * - Cores temáticas (#2a688f, #42b9eb)
 * - Layout responsivo e acessível
 */

import { BarChart3, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Filtros
import { FiltersBar } from '../components/Filters'
// Tabs
import { DashboardTab, AnalyticsTab } from '../components/Tabs'
// Hooks
import { useDashboardData } from '../hooks/useDashboardData'
import { useFilters } from '../hooks/useFilters'

export const DashboardPage = () => {
  const { filters, resetFilters } = useFilters()
  const { data, isLoading } = useDashboardData(filters)
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen px-8 py-6">
      {/* Header Section */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#42b9eb]/10 p-3">
                <BarChart3 className="h-6 w-6 text-[#2a688f]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard de Contratos
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Visão executiva e operacional do portfólio de contratos
                </p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <FiltersBar onReset={resetFilters} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-muted grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Análises Detalhadas</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Dashboard - Visão Executiva Completa */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab
              data={data ?? undefined}
              filters={filters}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Aba Análises - Breakdowns Detalhados */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab data={data ?? undefined} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
