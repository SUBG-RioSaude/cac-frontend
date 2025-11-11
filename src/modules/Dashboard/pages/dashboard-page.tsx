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
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useState } from 'react'

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

import type { CarouselApi } from '@/components/ui/carousel'
// Cards de Métricas
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export const DashboardPage = () => {
  const { filters, resetFilters } = useFilters()
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
  <div className="flex h-full w-full max-w-[1920px] flex-col overflow-hidden px-6 pt-2 mx-auto">


      {/* ========================================
            HEADER COMPACTO COM TÍTULO E FILTROS
            ======================================== */}
      <div className="bg-card mb-2 flex-shrink-0 rounded-lg border shadow-sm">
        <div className="px-6 py-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Logo Dashboard Contratos"
                className="h-7 w-auto object-contain"
              />
              <div>
                <h1
                  className="text-base font-bold"
                  style={{ color: '#2a688f' }}
                >
                  Dashboard de Contratos
                </h1>
                <p className="text-muted-foreground text-[10px]">
                  Visão executiva e operacional do portfólio de contratos
                </p>
              </div>
            </div>
          </div>

          <FiltersBar onReset={resetFilters} />
        </div>
      </div>

      {/* ========================================
            ÁREA DE CONTEÚDO PRINCIPAL
            ======================================== */}
      <main className="flex flex-1 flex-col space-y-2 overflow-hidden min-h-0 w-full">
        {/* SEÇÃO 1: MÉTRICAS EXECUTIVAS */}
        <section className="flex-shrink-0 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <TotalContractsCard filters={filters} />
          <ActiveContractsCard filters={filters} />
          <TotalValueCard filters={filters} />
          <ExpiredContractsCard filters={filters} />
        </section>

        {/* SEÇÃO 2: CAROUSEL PRINCIPAL */}
        <section className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Wrapper com overflow-visible horizontal para permitir setas fora do container */}
          <div className="h-full overflow-x-visible overflow-y-hidden px-16">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: 'start',
                loop: true,
                duration: 30,
              }}
              className="flex h-full w-full flex-col overflow-visible"
            >
            <CarouselContent className="ml-0 flex-1 min-h-0">
              {/* SLIDE 1 */}
              <CarouselItem className="h-full min-h-0 flex flex-col pl-0">
                <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                  <TrendSection
                    data={data?.statusTrend}
                    isLoading={isLoading}
                  />
                  <RiskAnalysis
                    data={data?.riskAnalysis}
                    isLoading={isLoading}
                    detailed={false}
                  />
                </div>
              </CarouselItem>

              {/* SLIDE 2 */}
              <CarouselItem className="h-full min-h-0 flex flex-col pl-0">
                <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                  <StatusDistributionChart filters={filters} />
                  <TypeDistributionChart filters={filters} />
                </div>
              </CarouselItem>

              {/* SLIDE 3 */}
              <CarouselItem className="h-full min-h-0 flex flex-col pl-0">
                <div className="grid h-full w-full gap-2 lg:grid-cols-2">
                  <RecentContracts
                    contracts={data?.recentContracts}
                    isLoading={isLoading}
                  />
                  <RecentActivities />
                </div>
              </CarouselItem>
            </CarouselContent>

            {/* Indicadores dots elegantes - no fluxo normal com espaçamento controlado */}
            <div className="flex-shrink-0 flex items-center justify-center gap-2 rounded-full bg-white/60 px-3 py-1 backdrop-blur-sm shadow-sm mx-auto mt-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  aria-label={`Ir para slide ${index + 1}`}
                  className={`rounded-full transition-all duration-300 hover:scale-125 ${
                    currentSlide === index
                      ? 'h-2 w-8 bg-brand-primary shadow-md'
                      : 'h-2 w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <CarouselPrevious className="bg-brand-primary hover:bg-brand-primary/90 -left-6 size-9 rounded-full border text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg" />
            <CarouselNext className="bg-brand-primary hover:bg-brand-primary/90 -right-6 size-9 rounded-full border text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg" />
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  )
}
