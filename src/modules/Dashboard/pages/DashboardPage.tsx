/**
 * ==========================================
 * PÁGINA PRINCIPAL DO DASHBOARD
 * ==========================================
 * Dashboard executivo com visão consolidada dos contratos
 */

import { BarChart3 } from 'lucide-react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { MetricsGrid } from '../components/Cards'
import { ContractsCharts } from '../components/Charts'
import { FiltersBar } from '../components/Filters'
import { RecentContracts, RiskAnalysis, RecentActivities } from '../components/Lists'
// Hooks
import { useDashboardData } from '../hooks/useDashboardData'
import { useFilters } from '../hooks/useFilters'

export const DashboardPage = () => {
  const { filters, resetFilters } = useFilters()
  const { data, isLoading } = useDashboardData(filters)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen py-6 px-8">
      {/* Header Section */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-muted p-3">
                <BarChart3 className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard de Contratos
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
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
          <TabsList className="bg-muted w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="risks">Gestão de Riscos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principais */}
            <MetricsGrid data={data ?? undefined} isLoading={isLoading} />

            {/* Gráficos */}
            <ContractsCharts data={data ?? undefined} isLoading={isLoading} />

            {/* Grid de Contratos e Riscos */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RecentContracts />
              <RiskAnalysis />
            </div>

            {/* Atividades Recentes */}
            <RecentActivities />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ContractsCharts data={data ?? undefined} isLoading={isLoading} detailed />
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <RiskAnalysis detailed />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
