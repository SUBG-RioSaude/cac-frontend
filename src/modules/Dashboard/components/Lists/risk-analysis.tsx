import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Eye,
  FileWarning,
} from 'lucide-react'
import { useState } from 'react'
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

const riskConfig = {
  alto: {
    label: 'Alto Risco',
    description: 'Contratos vencidos ou com pendências críticas',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  medio: {
    label: 'Médio Risco',
    description: 'Vencendo em 30 dias ou com atenção necessária',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  baixo: {
    label: 'Baixo Risco',
    description: 'Contratos ativos em conformidade',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
}

interface RiskAnalysisProps {
  data?: DashboardRisks | null
  isLoading?: boolean
  detailed?: boolean
}

export const RiskAnalysis = ({
  data,
  isLoading = false,
  detailed = false,
}: RiskAnalysisProps) => {
  const navigate = useNavigate()

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Análise de Riscos</CardTitle>
          <CardDescription>Carregando análise de riscos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-muted h-12 w-12 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-48 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-6 w-12 animate-pulse rounded" />
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
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Análise de Riscos</CardTitle>
          <CardDescription>
            Contratos por nível de risco de vencimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
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
                  <p className="text-muted-foreground mt-1 text-xs">
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
                    <CardDescription>{config.description}</CardDescription>
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
                <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 max-h-[600px] space-y-3 overflow-y-auto pr-2">
                  {riskData.contratos.map((contract) => (
                    <div
                      key={contract.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 ${config.borderColor} ${config.bgColor}`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-foreground text-sm leading-none font-medium">
                              {contract.objeto}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {contract.numero}
                            </p>
                          </div>
                          {contract.diasVencimento !== undefined && (
                            <Badge variant="outline" className={config.color}>
                              {contract.diasVencimento} dias
                            </Badge>
                          )}
                        </div>
                        {contract.motivos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {contract.motivos.map((motivo, idx) => (
                              <p
                                key={idx}
                                className="text-muted-foreground text-xs"
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

  const [activeTab, setActiveTab] = useState<RiskLevel>('alto')

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Análise de Riscos</CardTitle>
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
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as RiskLevel)}
          className="w-full"
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
              <TabsContent key={key} value={key} className="mt-4 space-y-3">
                {/* Descrição do nível de risco */}
                <div
                  className={`rounded-lg border p-3 ${config.borderColor} ${config.bgColor}`}
                >
                  <p className="text-muted-foreground text-xs">
                    {config.description}
                  </p>
                </div>

                {/* Lista de contratos */}
                {riskData.contratos.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 className="mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">
                      Nenhum contrato neste nível de risco
                    </p>
                  </div>
                ) : (
                  <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 max-h-[400px] space-y-2 overflow-y-auto pr-2">
                    {riskData.contratos.map((contract) => (
                      <div
                        key={contract.id}
                        className={`hover:bg-muted/50 rounded-lg border p-3 transition-colors ${config.borderColor}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <p className="text-foreground text-sm leading-none font-medium">
                              {contract.objeto}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {contract.numero}
                            </p>
                            {contract.motivos.length > 0 && (
                              <div className="mt-2 space-y-0.5">
                                {contract.motivos
                                  .slice(0, 2)
                                  .map((motivo, idx) => (
                                    <p
                                      key={idx}
                                      className="text-muted-foreground text-xs"
                                    >
                                      • {motivo}
                                    </p>
                                  ))}
                              </div>
                            )}
                          </div>
                          {contract.diasVencimento !== undefined && (
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant="outline"
                                className={`${config.color} border-current`}
                              >
                                {contract.diasVencimento} dias
                              </Badge>
                            </div>
                          )}
                        </div>
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
