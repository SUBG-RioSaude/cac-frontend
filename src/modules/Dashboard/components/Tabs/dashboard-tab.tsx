/**
 * Aba Dashboard - Visão Executiva
 *
 * Carousel com 4 seções:
 * 1. Métricas Executivas (grid 2x2)
 * 2. Gráfico de Tendência
 * 3. Alertas Críticos
 * 4. Top 5 Contratos
 */

import { DashboardCarousel } from '../dashboard-carousel'
import { MetricsGrid } from '../Cards'

import type { DashboardData } from '../../types/dashboard'

interface DashboardTabProps {
  data?: DashboardData
  isLoading: boolean
}

export const DashboardTab = ({ data, isLoading }: DashboardTabProps) => {
  // Placeholder para as seções do carousel
  // Serão implementadas nas próximas etapas
  const carouselSlides = [
    // SLIDE 1: Métricas
    <div key="metrics" className="w-full px-4 py-2">
      <MetricsGrid data={data} isLoading={isLoading} />
    </div>,

    // SLIDE 2: Tendência (placeholder)
    <div key="trend" className="flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-dashed p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Gráfico de Tendência</h3>
        <p className="text-muted-foreground text-sm">Em implementação...</p>
      </div>
    </div>,

    // SLIDE 3: Alertas (placeholder)
    <div key="alerts" className="flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-dashed p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Alertas Críticos</h3>
        <p className="text-muted-foreground text-sm">Em implementação...</p>
      </div>
    </div>,

    // SLIDE 4: Top Contratos (placeholder)
    <div key="top" className="flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-dashed p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Top 5 Contratos</h3>
        <p className="text-muted-foreground text-sm">Em implementação...</p>
      </div>
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
