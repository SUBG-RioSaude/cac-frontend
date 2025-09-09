/**
 * ==========================================
 * COMPONENTE DE MÉTRICAS DO FORNECEDOR
 * ==========================================
 * Exibe KPIs e métricas principais de um fornecedor
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  DollarSign
} from 'lucide-react'
import type { Contrato } from '@/modules/Contratos/types/contrato'

interface FornecedorMetricasProps {
  contratos: Contrato[]
  isLoading?: boolean
}

interface Metricas {
  totalContratos: number
  valorTotal: number
}

export function FornecedorMetricas({ contratos, isLoading }: FornecedorMetricasProps) {
  const calcularMetricas = (): Metricas => {
    let valorTotal = 0
    
    contratos.forEach(contrato => {
      if (contrato.valorGlobal) {
        valorTotal += contrato.valorGlobal
      }
    })
    
    return {
      totalContratos: contratos.length,
      valorTotal
    }
  }

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
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
          <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.totalContratos}</div>
          <p className="text-xs text-muted-foreground">
            contratos vinculados
          </p>
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
            {formatarMoeda(metricas.valorTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            soma de todos os contratos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}