/**
 * TopContractsSection - Top 5 Maiores Contratos
 *
 * Exibe os 5 contratos de maior valor
 * Slide 4 do carousel do dashboard
 */

import { motion } from 'framer-motion'
import { ArrowRight, Building2, DollarSign } from 'lucide-react'
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
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { parseStatusContrato } from '@/types/status'

import type { RecentContract } from '../../types/dashboard'
import { formatLargeNumber } from '../../utils/dashboard-utils'

interface TopContractsSectionProps {
  contracts?: RecentContract[]
  isLoading?: boolean
}

export const TopContractsSection = ({
  contracts,
  isLoading,
}: TopContractsSectionProps) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!contracts || contracts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top 5 Contratos</CardTitle>
          <CardDescription>Maiores valores do portfólio</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p className="text-sm">Sem contratos disponíveis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pegar apenas os 5 maiores
  const topContracts = contracts.sort((a, b) => b.valor - a.valor).slice(0, 5)

  const totalValue = topContracts.reduce(
    (sum, contract) => sum + contract.valor,
    0,
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#2a688f]" />
              Top 5 Contratos
            </CardTitle>
            <CardDescription>
              Maiores valores do portfólio - Total: R${' '}
              {formatLargeNumber(totalValue)}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigate('/contratos?sort=valor')
            }}
            className="gap-2"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {topContracts.map((contract, index) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                'border-l-4',
                index === 0 && 'border-l-[#2a688f]',
                index === 1 && 'border-l-[#42b9eb]',
                index === 2 && 'border-l-[#5ac8fa]',
                index > 2 && 'border-l-muted',
              )}
              onClick={() => {
                void navigate(`/contratos/${contract.id}`)
              }}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Posição */}
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold',
                    index === 0 && 'bg-[#2a688f]/10 text-[#2a688f]',
                    index === 1 && 'bg-[#42b9eb]/10 text-[#42b9eb]',
                    index === 2 && 'bg-[#5ac8fa]/10 text-[#5ac8fa]',
                    index > 2 && 'bg-muted text-muted-foreground',
                  )}
                >
                  {index + 1}
                </div>

                {/* Informações */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="line-clamp-1 leading-tight font-medium">
                        {contract.objeto}
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Building2 className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {contract.fornecedor}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={parseStatusContrato(contract.status)}
                      domain="contrato"
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-xs">
                      Nº {contract.numero}
                    </div>
                    <div className="text-sm font-bold text-[#2a688f]">
                      R$ {formatLargeNumber(contract.valor)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </CardContent>

      {/* Estatística adicional */}
      <CardContent className="pt-0">
        <div className="rounded-lg bg-[#42b9eb]/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                Média dos Top 5 Contratos
              </div>
              <div className="text-muted-foreground text-xs">
                Valor médio por contrato
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2a688f]">
              R$ {formatLargeNumber(totalValue / topContracts.length)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
