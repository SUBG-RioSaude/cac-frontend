/**
 * Aba Dashboard - Visão Executiva Completa
 *
 * Layout vertical natural com scroll:
 * 1. Métricas Executivas (sempre visível)
 * 2. Carousel de Gráficos (tendência, status, tipo)
 * 3. Alertas Críticos por Nível de Risco
 * 4. Grid: Top 5 Contratos + Atividades Recentes
 */

import type { DashboardData, DashboardFilters } from '../../types/dashboard'
import { MetricsGrid } from '../Cards'
import {
  StatusDistributionChart,
  TrendSection,
  TypeDistributionChart,
} from '../Charts'
import { DashboardCarousel } from '../dashboard-carousel'
import {
  AlertsSection,
  RecentActivities,
  TopContractsSection,
} from '../Lists'

interface DashboardTabProps {
  data?: DashboardData
  filters: DashboardFilters
  isLoading: boolean
}

export const DashboardTab = ({
  data,
  filters,
  isLoading,
}: DashboardTabProps) => {
  // Preparar dados para alertas
  const alertsData = data?.riskAnalysis
    ? {
        alto: data.riskAnalysis.alto.count,
        medio: data.riskAnalysis.medio.count,
        baixo: data.riskAnalysis.baixo.count,
      }
    : undefined

  // Carousel APENAS para gráficos
  const graphSlides = [
    // Gráfico de Tendência (6 meses)
    <div key="trend" className="w-full px-4 py-2">
      <TrendSection data={data?.statusTrend} isLoading={isLoading} />
    </div>,

    // Distribuição por Status
    <div key="status" className="w-full px-4 py-2">
      <StatusDistributionChart filters={filters} />
    </div>,

    // Distribuição por Tipo
    <div key="type" className="w-full px-4 py-2">
      <TypeDistributionChart filters={filters} />
    </div>,
  ]

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: Métricas Executivas - Sempre Visível */}
      <section>
        <MetricsGrid data={data} isLoading={isLoading} />
      </section>

      {/* SEÇÃO 2: Carousel de Gráficos */}
      <section>
        <DashboardCarousel
          slides={graphSlides}
          autoPlay={false}
          className="rounded-lg"
        />
      </section>

      {/* SEÇÃO 3: Alertas Críticos */}
      <section>
        <AlertsSection alerts={alertsData} isLoading={isLoading} />
      </section>

      {/* SEÇÃO 4: Grid com Top Contratos + Atividades */}
      <section className="grid gap-6 lg:grid-cols-2">
        <TopContractsSection
          contracts={data?.recentContracts}
          isLoading={isLoading}
        />
        <RecentActivities />
      </section>
    </div>
  )
}
