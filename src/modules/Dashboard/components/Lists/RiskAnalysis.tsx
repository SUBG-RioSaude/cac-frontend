import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// TODO: Substituir por dados reais da API
const riskContracts = {
  high: [
    {
      id: 'CT-2024-0892',
      title: 'Contrato de Manutenção Predial',
      company: 'Predial Services',
      daysToExpire: 15,
      value: 'R$ 45.000,00',
    },
    {
      id: 'CT-2024-0745',
      title: 'Fornecimento de Materiais',
      company: 'Materiais Express',
      daysToExpire: 22,
      value: 'R$ 78.500,00',
    },
  ],
  medium: [
    {
      id: 'CT-2024-0512',
      title: 'Consultoria Jurídica',
      company: 'Advocacia & Cia',
      daysToExpire: 45,
      value: 'R$ 95.000,00',
    },
    {
      id: 'CT-2024-0489',
      title: 'Locação de Equipamentos',
      company: 'Equip Rental',
      daysToExpire: 67,
      value: 'R$ 34.200,00',
    },
  ],
  low: [
    {
      id: 'CT-2024-0234',
      title: 'Fornecimento de Energia',
      company: 'Energia Total',
      daysToExpire: 180,
      value: 'R$ 245.000,00',
    },
  ],
}

const riskConfig = {
  high: {
    label: 'Alto Risco',
    description: 'Menos de 30 dias para vencimento',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    count: riskContracts.high.length,
  },
  medium: {
    label: 'Médio Risco',
    description: 'Entre 30 e 90 dias para vencimento',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    count: riskContracts.medium.length,
  },
  low: {
    label: 'Baixo Risco',
    description: 'Mais de 90 dias (em conformidade)',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    count: riskContracts.low.length,
  },
}

interface RiskAnalysisProps {
  detailed?: boolean
}

export const RiskAnalysis = ({ detailed = false }: RiskAnalysisProps) => {
  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Resumo de Riscos */}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(riskConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <Card key={key} className={`border-2 bg-card ${config.borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {config.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${config.color}`}>
                    {config.count}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detalhamento por Risco */}
        {Object.entries(riskContracts).map(([riskLevel, contracts]) => {
          const config = riskConfig[riskLevel as keyof typeof riskConfig]
          const Icon = config.icon

          return (
            <Card key={riskLevel} className="bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <CardTitle className="text-foreground">{config.label}</CardTitle>
                  <Badge variant="secondary">{contracts.length}</Badge>
                </div>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 ${config.borderColor} ${config.bgColor}`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium leading-none text-foreground">
                              {contract.title}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {contract.company}
                            </p>
                          </div>
                          <Badge variant="outline" className={config.color}>
                            {contract.daysToExpire} dias
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium">{contract.value}</span>
                          <span className="text-muted-foreground/70">
                            {contract.id}
                          </span>
                        </div>
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
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Análise de Riscos</CardTitle>
        <CardDescription>
          Contratos por nível de risco de vencimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(riskConfig).map(([key, config]) => {
            const Icon = config.icon
            const contracts = riskContracts[key as keyof typeof riskContracts]

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {config.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {config.count}
                  </Badge>
                </div>

                {contracts.slice(0, 2).map((contract) => (
                  <div
                    key={contract.id}
                    className={`ml-10 rounded-lg border p-3 ${config.borderColor} ${config.bgColor}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">
                          {contract.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {contract.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-3 w-3 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>
                          {contract.daysToExpire}d
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
