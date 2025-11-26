import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileWarning,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { DashboardRisks, RiskLevel } from '../../types/dashboard'

const getRiskConfig = (isDarkMode: boolean) => ({
  alto: {
    label: 'Alto Risco',
    description: 'Contratos vencidos ou com pendências críticas',
    icon: AlertTriangle,
    color: isDarkMode ? 'text-red-400 dark:text-red-400' : 'text-red-600',
    bgColor: isDarkMode ? 'bg-red-950/30 dark:bg-red-950/30' : 'bg-red-50',
    borderColor: isDarkMode ? 'border-red-800/50 dark:border-red-800/50' : 'border-red-200',
  },
  medio: {
    label: 'Médio Risco',
    description: 'Vencendo em 30 dias ou com atenção necessária',
    icon: AlertCircle,
    color: isDarkMode ? 'text-orange-400 dark:text-orange-400' : 'text-orange-600',
    bgColor: isDarkMode ? 'bg-orange-950/30 dark:bg-orange-950/30' : 'bg-orange-50',
    borderColor: isDarkMode ? 'border-orange-800/50 dark:border-orange-800/50' : 'border-orange-200',
  },
  baixo: {
    label: 'Baixo Risco',
    description: 'Contratos ativos em conformidade',
    icon: CheckCircle2,
    color: isDarkMode ? 'text-green-400 dark:text-green-400' : 'text-green-600',
    bgColor: isDarkMode ? 'bg-green-950/30 dark:bg-green-950/30' : 'bg-green-50',
    borderColor: isDarkMode ? 'border-green-800/50 dark:border-green-800/50' : 'border-green-200',
  },
})

interface RiskAnalysisProps {
  data?: DashboardRisks | null
  isLoading?: boolean
  detailed?: boolean
}

const RiskAnalysisComponent = ({
  data,
  isLoading = false,
  detailed = false,
}: RiskAnalysisProps) => {
  const navigate = useNavigate()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<RiskLevel>('alto')

  // Espera o componente montar para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determina se está em dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark')
  
  // Obtém as configurações de risco baseadas no tema
  const riskConfig = getRiskConfig(isDarkMode)

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-lg">Análise de Riscos</CardTitle>
          <CardDescription>Carregando análise de riscos...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-3 min-w-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4 min-w-0">
                <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!data || data.total === 0) {
    return (
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-lg">Análise de Riscos</CardTitle>
          <CardDescription>
            Contratos por nível de risco de vencimento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center overflow-hidden">
          <div className="text-muted-foreground flex flex-col items-center justify-center text-center">
            <FileWarning className="mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhum registro encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleVerDetalhes = (riskLevel: RiskLevel) => {
    navigate(`/contratos?risco=${riskLevel}`)
  }

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Resumo de Riscos */}
        <div className="grid gap-4 md:grid-cols-3">
          {(['alto', 'medio', 'baixo'] as RiskLevel[]).map((key) => {
            const config = riskConfig[key]
            const riskData = data[key]
            const Icon = config.icon

            return (
              <Card
                key={key}
                className={`bg-card border-2 ${config.borderColor}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-foreground text-sm font-medium">
                    {config.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${config.color}`}>
                    {riskData.count}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs break-words leading-tight">
                    {config.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detalhamento por Risco */}
        {(['alto', 'medio', 'baixo'] as RiskLevel[]).map((riskLevel) => {
          const config = riskConfig[riskLevel]
          const riskData = data[riskLevel]
          const Icon = config.icon

          if (riskData.count === 0) return null

          return (
            <Card key={riskLevel} className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <CardTitle className="text-foreground">
                        {config.label}
                      </CardTitle>
                      <Badge variant="secondary">{riskData.count}</Badge>
                    </div>
                    <CardDescription className="break-words leading-tight">{config.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerDetalhes(riskLevel)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver mais
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {riskData.contratos.slice(0, 5).map((contract) => (
                    <div
                      key={contract.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/contratos/${contract.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/contratos/${contract.id}`)
                        }
                      }}
                      className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${config.borderColor} ${config.bgColor} hover:bg-opacity-80 cursor-pointer`}
                    >
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-xs leading-tight font-medium line-clamp-1">
                              {contract.objeto}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[10px] truncate">
                              {contract.numero}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {contract.diasVencimento !== undefined && (
                              <span className={`${config.color} text-[10px] font-medium whitespace-nowrap`}>
                                {contract.diasVencimento} dias
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/contratos/${contract.id}`)
                              }}
                              className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">Ver detalhes do contrato</span>
                            </Button>
                          </div>
                        </div>
                        {contract.motivos.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {contract.motivos.slice(0, 1).map((motivo, idx) => (
                              <p
                                key={idx}
                                className="text-muted-foreground text-[10px] truncate"
                              >
                                • {motivo}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-lg">Análise de Riscos</CardTitle>
            <CardDescription>
              Contratos por nível de risco de vencimento
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVerDetalhes(activeTab)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as RiskLevel)}
          className="flex w-full flex-col min-w-0 px-6 pb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            {(['alto', 'medio', 'baixo'] as RiskLevel[]).map((key) => {
              const config = riskConfig[key]
              const riskData = data[key]
              const Icon = config.icon

              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-2"
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="hidden sm:inline">{config.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {riskData.count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {(['alto', 'medio', 'baixo'] as RiskLevel[]).map((key) => {
            const config = riskConfig[key]
            const riskData = data[key]

            return (
              <TabsContent key={key} value={key} className="mt-3 min-w-0">
                {/* Descrição do nível de risco */}
                <div
                  className={`rounded-lg border p-2.5 mb-3 ${config.borderColor} ${config.bgColor}`}
                >
                  <p className="text-muted-foreground text-xs break-words leading-tight">
                    {config.description}
                  </p>
                </div>

                {/* Lista de contratos */}
                {riskData.contratos.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="mb-2 h-10 w-10 opacity-50" />
                    <p className="text-sm">
                      Nenhum contrato neste nível de risco
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 min-w-0">
                    {riskData.contratos.slice(0, 5).map((contract) => (
                      <div
                        key={contract.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/contratos/${contract.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/contratos/${contract.id}`)
                          }
                        }}
                        className={`group hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors min-w-0 ${config.borderColor} cursor-pointer`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
                        >
                          {(() => {
                            const Icon = config.icon
                            return <Icon className={`h-4 w-4 ${config.color}`} />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-xs font-medium line-clamp-1 leading-tight">
                                {contract.objeto}
                              </p>
                              <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                                {contract.numero}
                                {contract.motivos.length > 0 && ` • ${contract.motivos[0]}`}
                              </p>
                            </div>
                            {contract.diasVencimento !== undefined && (
                              <span className={`${config.color} text-[10px] whitespace-nowrap shrink-0 font-medium`}>
                                {contract.diasVencimento} dias
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/contratos/${contract.id}`)
                          }}
                          className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">Ver detalhes do contrato</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}

// React.memo com comparação personalizada para evitar re-renders desnecessários
export const RiskAnalysis = memo(
  RiskAnalysisComponent,
  (prev, next) => {
    return (
      JSON.stringify(prev.data) === JSON.stringify(next.data) &&
      prev.isLoading === next.isLoading &&
      prev.detailed === next.detailed
    )
  },
)
