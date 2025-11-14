/** eslint-disable import/order */
/**
 * ==========================================
 * PÁGINA PRINCIPAL DO DASHBOARD
 * ==========================================
 *
 * TODOS OS COMPONENTES DISPONÍVEIS PARA MONTAGEM DO LAYOUT
 *
 * Organize as seções abaixo como preferir:
 * - Remova seções que não quiser
 * - Reordene como achar melhor
 * - Adicione grids/containers personalizados
 * - Combine componentes em layouts customizados
 *
 * Cores do tema: #2a688f (primary), #42b9eb (secondary)
 */

// ========== COMPONENTES DISPONÍVEIS ==========
import { useEffect, useState } from 'react'

import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import {
  ActiveContractsCard,
  ExpiredContractsCard,
  TotalContractsCard,
  TotalValueCard,
} from '../components/Cards'
// Gráficos
import {
  StatusDistributionChart,
  TrendSection,
  TypeDistributionChart,
} from '../components/Charts'
import { FiltersBar } from '../components/Filters'
// Listas e Seções
import {
  RecentActivities,
  RecentContracts,
  RiskAnalysis,
} from '../components/Lists'
// ========== HOOKS ==========
import { useDashboardData } from '../hooks/useDashboardData'
import { useFilters } from '../hooks/useFilters'

// Cards de Métricas

export const DashboardPage = () => {
  const { filters, updateFilter, resetFilters } = useFilters()
  const { data, isLoading } = useDashboardData(filters)

  // Estado para controlar o carousel
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Sincroniza o estado com o carousel
  useEffect(() => {
    if (!carouselApi) return

    // Define o slide inicial
    setCurrentSlide(carouselApi.selectedScrollSnap())

    // Escuta mudanças de slide
    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  return (
    <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col overflow-visible px-6 pt-2">
      {/* ========================================
            HEADER COMPACTO COM TÍTULO E FILTROS
            ======================================== */}
      <div className="bg-card mb-3 flex-shrink-0 rounded-lg border shadow-sm">
        <div className="px-6 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Logo Dashboard Contratos"
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#2a688f' }}>
                  Dashboard de Contratos
                </h1>
                <p className="text-muted-foreground text-xs">
                  Visão executiva e operacional do portfólio de contratos
                </p>
              </div>
            </div>
          </div>

          <FiltersBar
            filters={filters}
            onUpdateFilter={updateFilter}
            onReset={resetFilters}
          />
        </div>
      </div>

      {/* ========================================
            ÁREA DE CONTEÚDO PRINCIPAL
            ======================================== */}
      <main className="flex min-h-0 w-full flex-1 flex-col space-y-3 overflow-visible">
        {/* SEÇÃO 1: MÉTRICAS EXECUTIVAS */}
        <section className="grid flex-shrink-0 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <TotalContractsCard filters={filters} />
          <ActiveContractsCard filters={filters} />
          <TotalValueCard filters={filters} />
          <ExpiredContractsCard filters={filters} />
        </section>

        {/* SEÇÃO 2: CAROUSEL PRINCIPAL */}
        <section className="relative flex min-h-0 flex-1 flex-col overflow-visible">
          {/* Wrapper com overflow controlado */}
          <div className="h-full overflow-visible">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: 'start',
                loop: true,
                duration: 30,
              }}
              className="flex h-full w-full flex-col"
            >
              <CarouselContent className="-mr-3 ml-0 min-h-0 flex-1">
                {/* SLIDE 1 */}
                <CarouselItem className="flex h-full min-h-0 flex-col pr-3 pl-0">
                  <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                    <TrendSection
                      data={data?.statusTrend}
                      isLoading={isLoading}
                      filters={filters}
                    />
                    <RiskAnalysis
                      data={data?.riskAnalysis}
                      isLoading={isLoading}
                      detailed={false}
                    />
                  </div>
                </CarouselItem>

                {/* SLIDE 2 */}
                <CarouselItem className="flex h-full min-h-0 flex-col pr-3 pl-0">
                  <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                    <StatusDistributionChart filters={filters} />
                    <TypeDistributionChart filters={filters} />
                  </div>
                </CarouselItem>

                {/* SLIDE 3 */}
                <CarouselItem className="flex h-full min-h-0 flex-col pr-3 pl-0">
                  <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                    <RecentContracts
                      contracts={data?.recentContracts}
                      isLoading={isLoading}
                    />
                    <RecentActivities
                      activities={data?.recentActivities}
                      isLoading={isLoading}
                    />
                  </div>
                </CarouselItem>
              </CarouselContent>

              {/* Indicadores dots elegantes - no fluxo normal com espaçamento controlado */}
              <div className="mx-auto mt-3 flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    aria-label={`Ir para slide ${index + 1}`}
                    className={`rounded-full transition-all duration-300 hover:scale-125 ${
                      currentSlide === index
                        ? 'bg-brand-primary h-2 w-8 shadow-md'
                        : 'h-2 w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <CarouselPrevious className="bg-brand-primary hover:bg-brand-primary/90 -left-5 size-9 rounded-full border text-white shadow-md transition-colors duration-300" />
              <CarouselNext className="bg-brand-primary hover:bg-brand-primary/90 -right-5 size-9 rounded-full border text-white shadow-md transition-colors duration-300" />
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  )
}
