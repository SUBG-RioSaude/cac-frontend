import { FileText, Eye, FileX } from 'lucide-react'
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
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-lg">Contratos Recentes</CardTitle>
          <CardDescription>Carregando contratos recentes...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between overflow-hidden p-4">
          <div className="flex flex-col justify-between h-full space-y-2.5 min-w-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3 min-w-0">
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
  if (!contracts || contracts.length === 0) {
    return (
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-lg">Contratos Recentes</CardTitle>
          <CardDescription>Últimas ações e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
          <div className="text-muted-foreground flex flex-col items-center justify-center text-center">
            <FileX className="mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhum contrato recente encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-lg">Contratos Recentes</CardTitle>
        <CardDescription>Últimas ações e eventos do sistema</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between overflow-hidden p-4">
        <div className="flex flex-col justify-between h-full space-y-2.5 min-w-0">
          {contracts.slice(0, 6).map((contract) => (
            <div
              key={contract.id}
              className="border-border bg-muted/30 hover:bg-muted/50 group flex items-center gap-3 rounded-lg border p-3 transition-colors min-w-0"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium line-clamp-2 leading-snug">
                      {contract.objeto}
                    </p>
                    <p className="text-muted-foreground text-xs truncate mt-0.5">
                      {contract.fornecedor} • {currencyUtils.formatar(contract.valor)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ContratoStatusBadge status={contract.status} size="sm" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVerContrato(contract.id)}
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Ver contrato"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
