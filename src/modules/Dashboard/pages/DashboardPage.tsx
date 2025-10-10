/**
 * ==========================================
 * PÁGINA PRINCIPAL DO DASHBOARD
 * ==========================================
 * Dashboard executivo com visão consolidada dos contratos
 */

import { motion } from 'framer-motion'
import {
  RefreshCw,
  BarChart3,
  PieChart,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Hooks

// Components
import {
  TotalContractsCard,
  ActiveContractsCard,
  ExpiringContractsCard,
  TotalValueCard,
} from '../components/Cards'
import {
  StatusDistributionChart,
  StatusTrendChart,
  TypeDistributionChart,
} from '../components/Charts'
import { GlobalFilters } from '../components/Filters/GlobalFilters'
import { useDashboardData } from '../hooks/useDashboardData'
import { useFilters } from '../hooks/useFilters'

// Configuração das tabs
const dashboardTabs = [
  {
    id: 'metrics',
    label: 'Métricas',
    icon: BarChart3,
    description: 'Indicadores principais',
  },
  {
    id: 'charts',
    label: 'Gráficos',
    icon: PieChart,
    description: 'Análises visuais',
  },
  {
    id: 'recent',
    label: 'Recentes',
    icon: Clock,
    description: 'Últimos contratos',
  },
  {
    id: 'risks',
    label: 'Riscos',
    icon: AlertTriangle,
    description: 'Análise de riscos',
  },
  {
    id: 'activities',
    label: 'Atividades',
    icon: Activity,
    description: 'Atividades do sistema',
  },
]

export const DashboardPage = () => {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters()
  const { data, isLoading, refetch } = useDashboardData(filters)
  const [activeTab, setActiveTab] = useState('metrics')

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br py-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Cabeçalho Melhorado */}
        <div className="from-primary/10 via-primary/5 border-primary/10 relative overflow-hidden rounded-2xl border bg-gradient-to-r to-transparent">
          <div className="bg-grid-pattern absolute inset-0 opacity-5" />
          <div className="relative p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
                    <BarChart3 className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight">
                      Dashboard de Contratos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                      Visão executiva e operacional do portfólio de contratos
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={isLoading}
                  className="bg-background/80 hover:bg-background border-primary/20 gap-2 backdrop-blur-sm"
                >
                  <RefreshCw
                    className={cn('h-4 w-4', isLoading && 'animate-spin')}
                  />
                  Atualizar
                </Button>
                {data && (
                  <div className="flex flex-col text-right">
                    <div className="text-muted-foreground text-xs">
                      Última atualização
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(data.lastUpdated).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Globais */}
        <GlobalFilters
          filters={filters}
          onFiltersChange={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Dashboard Tabs Melhoradas */}
        <div className="border-border/50 bg-card/50 rounded-2xl border p-2 backdrop-blur-sm">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-5 gap-1 bg-transparent p-1">
              {dashboardTabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-background data-[state=active]:ring-primary/20 hover:bg-background/80 group flex h-auto flex-col items-center gap-2 rounded-xl border-0 p-4 transition-all duration-200 data-[state=active]:shadow-lg data-[state=active]:ring-2"
                  >
                    <div className="bg-primary/10 group-data-[state=active]:bg-primary/15 group-hover:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                      <IconComponent className="text-primary h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium">
                        {tab.label}
                      </span>
                      <span className="text-muted-foreground mt-1 hidden text-xs sm:block">
                        {tab.description}
                      </span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Tab Content - Métricas */}
            <TabsContent value="metrics" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Métricas Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <TotalContractsCard filters={filters} />
                      <ActiveContractsCard filters={filters} />
                      <ExpiringContractsCard filters={filters} />
                      <TotalValueCard filters={filters} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content - Gráficos */}
            <TabsContent value="charts" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Análise Gráfica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Primeira linha - Status */}
                      <div className="grid gap-6 lg:grid-cols-2">
                        <StatusDistributionChart filters={filters} />
                        <StatusTrendChart filters={filters} />
                      </div>

                      {/* Segunda linha - Tipos */}
                      <TypeDistributionChart filters={filters} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content - Recentes */}
            <TabsContent value="recent" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Contratos Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-muted-foreground py-12 text-center">
                        <div className="text-lg font-medium">
                          Em desenvolvimento
                        </div>
                        <div className="text-sm">
                          Tabela dos últimos 5 contratos formalizados
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content - Riscos */}
            <TabsContent value="risks" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Análise de Riscos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Placeholders para cards de risco */}
                      <Card className="border-red-200 bg-red-50/50 transition-colors hover:bg-red-50/70">
                        <CardContent className="p-4">
                          <div className="font-medium text-red-800">
                            Alto Risco
                          </div>
                          <div className="text-2xl font-bold text-red-900">
                            12
                          </div>
                          <div className="text-xs text-red-600">
                            Docs vencidos, atrasos críticos
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-200 bg-yellow-50/50 transition-colors hover:bg-yellow-50/70">
                        <CardContent className="p-4">
                          <div className="font-medium text-yellow-800">
                            Médio Risco
                          </div>
                          <div className="text-2xl font-bold text-yellow-900">
                            34
                          </div>
                          <div className="text-xs text-yellow-600">
                            Vencendo em 60 dias
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 bg-green-50/50 transition-colors hover:bg-green-50/70">
                        <CardContent className="p-4">
                          <div className="font-medium text-green-800">
                            Baixo Risco
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            199
                          </div>
                          <div className="text-xs text-green-600">
                            Em conformidade
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content - Atividades */}
            <TabsContent value="activities" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividades Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground py-12 text-center">
                      <div className="text-lg font-medium">
                        Em desenvolvimento
                      </div>
                      <div className="text-sm">
                        Timeline das últimas 5 atividades do sistema
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Rodapé Melhorado */}
        <div className="relative">
          <Separator className="mb-6" />
          <div className="flex items-center justify-center py-6">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <BarChart3 className="text-primary h-4 w-4" />
              </div>
              <span>Dashboard de Contratos • CAC Sistema de Gestão</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
