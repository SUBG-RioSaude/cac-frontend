/**
 * Aba Dashboard - Visão Executiva
 *
 * Carousel com 4 seções:
 * 1. Métricas Executivas (grid 2x2)
 * 2. Gráfico de Tendência
 * 3. Alertas Críticos
 * 4. Top 5 Contratos
 */

import type { DashboardData } from '../../types/dashboard'
import { MetricsGrid } from '../Cards'
import { TrendSection } from '../Charts'
import { DashboardCarousel } from '../dashboard-carousel'
import { AlertsSection, TopContractsSection } from '../Lists'

interface DashboardTabProps {
  data?: DashboardData
  isLoading: boolean
}

export const DashboardTab = ({ data, isLoading }: DashboardTabProps) => {
  // Preparar dados para os slides
  const alertsData = data?.riskAnalysis
    ? {
        alto: data.riskAnalysis.alto.count,
        medio: data.riskAnalysis.medio.count,
        baixo: data.riskAnalysis.baixo.count,
      }
    : undefined

  const topContracts = data?.recentContracts ?? []

  const carouselSlides = [
    // SLIDE 1: Métricas Executivas
    <div key="metrics" className="w-full px-4 py-2">
      <MetricsGrid data={data} isLoading={isLoading} />
    </div>,

    // SLIDE 2: Gráfico de Tendência
    <div key="trend" className="w-full px-4 py-2">
      <TrendSection data={data?.statusTrend} isLoading={isLoading} />
    </div>,

    // SLIDE 3: Alertas Críticos
    <div key="alerts" className="w-full px-4 py-2">
      <AlertsSection alerts={alertsData} isLoading={isLoading} />
    </div>,

    // SLIDE 4: Top 5 Contratos
    <div key="top" className="w-full px-4 py-2">
      <TopContractsSection contracts={topContracts} isLoading={isLoading} />
    </div>,
  ]

  return (
    <div className="space-y-6">
      <DashboardCarousel
        slides={carouselSlides}
        autoPlay={false}
        className="rounded-lg"
      />
    </div>
  )
}
