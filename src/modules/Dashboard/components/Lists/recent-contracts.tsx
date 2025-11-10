import { format } from 'date-fns'
import { FileText, Calendar, DollarSign, Eye, FileX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ContratoStatusBadge } from '@/components/ui/status-badge'
import { currencyUtils } from '@/lib/utils'

import type { RecentContract } from '../../types/dashboard'

interface RecentContractsProps {
  contracts?: RecentContract[] | null
  isLoading?: boolean
}

export const RecentContracts = ({
  contracts,
  isLoading = false,
}: RecentContractsProps) => {
  const navigate = useNavigate()

  const handleVerContrato = (contratoId: string) => {
    navigate(`/contratos/${contratoId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Contratos Recentes</CardTitle>
          <CardDescription>Carregando contratos recentes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-40 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!contracts || contracts.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Contratos Recentes</CardTitle>
          <CardDescription>Últimos 5 contratos formalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <FileX className="mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhum contrato recente encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Contratos Recentes</CardTitle>
        <CardDescription>Últimos 5 contratos formalizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="border-border bg-muted/30 hover:bg-muted/50 group relative flex items-start gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-foreground text-sm leading-none font-medium">
                      {contract.objeto}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {contract.fornecedor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ContratoStatusBadge status={contract.status} size="sm" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerContrato(contract.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Ver contrato"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{currencyUtils.formatar(contract.valor)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(contract.vigencia.inicio), 'dd/MM/yyyy')}{' '}
                      - {format(new Date(contract.vigencia.fim), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <span className="text-muted-foreground/70">
                    {contract.numero}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
