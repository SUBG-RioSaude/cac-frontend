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
// Cards de Métricas
import { MetricsGrid } from '../components/Cards'
// Gráficos
import {
  StatusDistributionChart,
  TrendSection,
  TypeDistributionChart,
} from '../components/Charts'
import { FiltersBar } from '../components/Filters'
// Listas e Seções
import {
  AlertsSection,
  RecentActivities,
  TopContractsSection,
} from '../components/Lists'
// Carousel do shadcn (descomente se quiser usar)
/*
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
*/
// ========== HOOKS ==========
import { useDashboardData } from '../hooks/useDashboardData'
import { useFilters } from '../hooks/useFilters'

export const DashboardPage = () => {
  const { filters, resetFilters } = useFilters()
  const { data, isLoading } = useDashboardData(filters)

  // Preparar dados para seções
  const alertsData = data?.riskAnalysis
    ? {
        alto: data.riskAnalysis.alto.count,
        medio: data.riskAnalysis.medio.count,
        baixo: data.riskAnalysis.baixo.count,
      }
    : undefined

  return (
    <div className="min-h-screen px-8 py-6">
      {/* ========================================
          HEADER COM TÍTULO E FILTROS
          ======================================== */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Logo da aplicação */}
              <div className="flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo Dashboard Contratos"
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#2a688f' }}>
                  Dashboard de Contratos
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Visão executiva e operacional do portfólio de contratos
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros */}
          <FiltersBar onReset={resetFilters} />
        </div>
      </div>

      {/* ========================================
          ÁREA DE CONTEÚDO PRINCIPAL
          MONTE O LAYOUT AQUI COMO PREFERIR
          ======================================== */}
      <main className="container mx-auto space-y-8 px-6 py-8">
        {/* ==========================================
            SEÇÃO 1: MÉTRICAS EXECUTIVAS
            4 cards com KPIs principais
            ========================================== */}
        <section>
          <MetricsGrid data={data ?? undefined} isLoading={isLoading} />
        </section>

        {/* ==========================================
            SEÇÃO 2: GRÁFICO DE TENDÊNCIA (6 MESES)
            Evolução temporal dos contratos
            ========================================== */}
        <section>
          <TrendSection data={data?.statusTrend} isLoading={isLoading} />
        </section>

        {/* ==========================================
            SEÇÃO 3: GRÁFICOS DE DISTRIBUIÇÃO
            Use individual OU em carousel (exemplos abaixo)
            ========================================== */}

        {/* OPÇÃO A: Gráficos lado a lado em grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          <StatusDistributionChart filters={filters} />
          <TypeDistributionChart filters={filters} />
        </section>

        {/* OPÇÃO B: Gráficos em carousel shadcn (comentado por padrão)
        <section className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              <CarouselItem>
                <TrendSection data={data?.statusTrend} isLoading={isLoading} />
              </CarouselItem>
              <CarouselItem>
                <StatusDistributionChart filters={filters} />
              </CarouselItem>
              <CarouselItem>
                <TypeDistributionChart filters={filters} />
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </section>
        */}

        {/* ==========================================
            SEÇÃO 4: ALERTAS CRÍTICOS POR RISCO
            Grid com 3 cards: alto, médio, baixo
            ========================================== */}
        <section>
          <AlertsSection alerts={alertsData} isLoading={isLoading} />
        </section>

        {/* ==========================================
            SEÇÃO 5: TOP CONTRATOS + ATIVIDADES
            Grid com 2 colunas em desktop
            ========================================== */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Top 5 Contratos por Valor */}
          <TopContractsSection
            contracts={data?.recentContracts}
            isLoading={isLoading}
          />

          {/* Atividades Recentes */}
          <RecentActivities />
        </section>

        {/* ==========================================
            SEÇÃO 6: ANÁLISE DE RISCOS DETALHADA
            (Comentada por padrão - descomente se quiser)
            ========================================== */}
        {/*
        <section>
          <RiskAnalysis detailed />
        </section>
        */}

        {/* ==========================================
            SEÇÃO 7: CHARTS COMPLETOS (ANALYTICS)
            Todos os gráficos detalhados
            (Comentada por padrão - descomente se quiser)
            ========================================== */}
        {/*
        <section>
          <ContractsCharts data={data} isLoading={isLoading} detailed />
        </section>
        */}
      </main>
    </div>
  )
}
