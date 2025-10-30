/**
 * ==========================================
 * COMPONENTE DE MÉTRICAS DO FORNECEDOR
 * ==========================================
 * Exibe KPIs e métricas principais de um fornecedor
 */

import { FileText, DollarSign } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyDisplay } from '@/components/ui/formatters'
import type { Contrato } from '@/modules/Contratos/types/contrato'

interface FornecedorMetricasProps {
  contratos: Contrato[]
  isLoading?: boolean
}

interface Metricas {
  totalContratos: number
  valorTotal: number
}

export const FornecedorMetricas = ({
  contratos,
  isLoading,
}: FornecedorMetricasProps) => {
  const calcularMetricas = (): Metricas => {
    let valorTotal = 0

    contratos.forEach((contrato) => {
      if (contrato.valorGlobal) {
        valorTotal += contrato.valorGlobal
      }
    })

    return {
      totalContratos: contratos.length,
      valorTotal,
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={`metricas-skeleton-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </CardTitle>
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="mb-1 h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metricas = calcularMetricas()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Total de Contratos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Contratos
          </CardTitle>
          <FileText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.totalContratos}</div>
          <p className="text-muted-foreground text-xs">contratos vinculados</p>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            <CurrencyDisplay value={metricas.valorTotal} />
          </div>
          <p className="text-muted-foreground text-xs">
            soma de todos os contratos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
