/**
 * AlertsSection - Grid de Alertas Críticos
 *
 * Exibe resumo de alertas por nível de risco
 * Slide 3 do carousel do dashboard
 */

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { RISK_COLORS } from '../../utils/chart-colors'

interface Alert {
  level: 'alto' | 'medio' | 'baixo'
  count: number
  description: string
  action?: string
}

interface AlertsSectionProps {
  alerts?: {
    alto: number
    medio: number
    baixo: number
  }
  isLoading?: boolean
}

export const AlertsSection = ({ alerts, isLoading }: AlertsSectionProps) => {
  const navigate = useNavigate()

  const alertsData: Alert[] = [
    {
      level: 'alto',
      count: alerts?.alto ?? 0,
      description: 'Contratos vencidos ou com documentação crítica pendente',
      action: 'Requer ação imediata',
    },
    {
      level: 'medio',
      count: alerts?.medio ?? 0,
      description: 'Contratos vencendo em até 30 dias ou com pendências',
      action: 'Atenção necessária',
    },
    {
      level: 'baixo',
      count: alerts?.baixo ?? 0,
      description: 'Contratos em situação regular com acompanhamento normal',
      action: 'Monitoramento de rotina',
    },
  ]

  const getAlertConfig = (level: 'alto' | 'medio' | 'baixo') => {
    const configs = {
      alto: {
        icon: AlertTriangle,
        color: RISK_COLORS.alto,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        label: 'Alto Risco',
      },
      medio: {
        icon: AlertCircle,
        color: RISK_COLORS.medio,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        label: 'Médio Risco',
      },
      baixo: {
        icon: CheckCircle2,
        color: RISK_COLORS.baixo,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        label: 'Baixo Risco',
      },
    }

    return configs[level]
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-16" />
              <Skeleton className="mt-4 h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alertas Críticos</h3>
          <p className="text-muted-foreground text-sm">
            Resumo de contratos por nível de risco
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard?tab=risks')}
          className="gap-2"
        >
          Ver Detalhes
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid de Alertas */}
      <div className="grid gap-4 md:grid-cols-3">
        {alertsData.map((alert, index) => {
          const config = getAlertConfig(alert.level)
          const Icon = config.icon

          return (
            <motion.div
              key={alert.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  config.bgColor,
                  config.borderColor,
                )}
                onClick={() => navigate(`/dashboard?tab=risks&filter=${alert.level}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-5 w-5"
                        style={{ color: config.color }}
                      />
                      <CardTitle className="text-base">{config.label}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {alert.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Contagem grande */}
                    <div>
                      <div
                        className="text-4xl font-bold"
                        style={{ color: config.color }}
                      >
                        {alert.count}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        contratos identificados
                      </div>
                    </div>

                    {/* Ação recomendada */}
                    <div
                      className={cn(
                        'rounded-md px-3 py-2 text-xs font-medium',
                        config.textColor,
                        'bg-white/50',
                      )}
                    >
                      {alert.action}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Resumo total */}
      <Card className="bg-[#42b9eb]/5">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <div className="text-sm font-medium">Total de Contratos</div>
            <div className="text-muted-foreground text-xs">
              Em todos os níveis de risco
            </div>
          </div>
          <div className="text-3xl font-bold text-[#2a688f]">
            {(alerts?.alto ?? 0) + (alerts?.medio ?? 0) + (alerts?.baixo ?? 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
