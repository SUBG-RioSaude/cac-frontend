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
  AlertsSection,
  RecentActivities,
  RecentContracts,
  RiskAnalysis,
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

  return (
    <div className="min-h-screen px-6 py-4">
      {/* ========================================
          HEADER COMPACTO COM TÍTULO E FILTROS
          ======================================== */}
      <div className="bg-card mb-6 rounded-lg border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo da aplicação */}
              <div className="flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo Dashboard Contratos"
                  className="h-10 w-auto object-contain"
                />
              </div>

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

          {/* Barra de Filtros */}
          <FiltersBar onReset={resetFilters} />
        </div>
      </div>

      {/* ========================================
          ÁREA DE CONTEÚDO PRINCIPAL
          MONTE O LAYOUT AQUI COMO PREFERIR
          ======================================== */}
      <main className="container mx-auto space-y-6 px-4">
        {/* ==========================================
            SEÇÃO 1: MÉTRICAS EXECUTIVAS
            4 KPIs principais do dashboard
            ========================================== */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TotalContractsCard filters={filters} />
          <ActiveContractsCard filters={filters} />
          <TotalValueCard filters={filters} />
          <ExpiredContractsCard filters={filters} />
        </section>

        {/* ==========================================
            SEÇÃO 2: EVOLUÇÃO + ANÁLISE DE RISCOS (GRID LADO A LADO)
            Gráfico de tendência e análise de riscos comprimidos
            ========================================== */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de Evolução (Comprimido) */}
          <TrendSection data={data?.statusTrend} isLoading={isLoading} />

          {/* Análise de Riscos com Abas */}
          <RiskAnalysis
            data={data?.riskAnalysis}
            isLoading={isLoading}
            detailed={false}
          />
        </section>

        {/* ==========================================
            SEÇÃO 3: GRÁFICOS DE DISTRIBUIÇÃO
            Status e Tipo lado a lado
            ========================================== */}
        <section className="grid gap-6 lg:grid-cols-2">
          <StatusDistributionChart filters={filters} />
          <TypeDistributionChart filters={filters} />
        </section>

        {/* ==========================================
            SEÇÃO 5: CONTRATOS RECENTES + ATIVIDADES
            Grid com 2 colunas em desktop
            ========================================== */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Últimos 5 Contratos Formalizados */}
          <RecentContracts
            contracts={data?.recentContracts}
            isLoading={isLoading}
          />

          {/* Atividades Recentes do Sistema */}
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
