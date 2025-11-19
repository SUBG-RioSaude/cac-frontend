/**
 * ==========================================
 * COMPONENTE DE MÉTRICAS DO FORNECEDOR
 * ==========================================
 * Exibe KPIs e métricas principais de um fornecedor com animações
 */

import { motion } from 'framer-motion'
import { FileText, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyDisplay } from '@/components/ui/formatters'
import { useStatusConfig } from '@/hooks/use-status-config'
import type { Contrato } from '@/modules/Contratos/types/contrato'

interface FornecedorMetricasProps {
  contratos: Contrato[]
  isLoading?: boolean
}

interface Metricas {
  totalContratos: number
  valorTotal: number
  contratosAtivos: number
  ticketMedio: number
}

export const FornecedorMetricas = ({
  contratos,
  isLoading,
}: FornecedorMetricasProps) => {
  const { getContratoStatusFromVigencia } = useStatusConfig()

  const metricas = useMemo((): Metricas => {
    let valorTotal = 0
    let contratosAtivos = 0

    contratos.forEach((contrato) => {
      if (contrato.valorGlobal) {
        valorTotal += contrato.valorGlobal
      }

      // Considerar ativo se status for 'vigente' ou 'vencendo'
      const status = getContratoStatusFromVigencia(
        contrato.vigenciaInicial,
        contrato.vigenciaFinal,
        contrato.status,
      )
      if (status === 'vigente' || status === 'vencendo') {
        contratosAtivos++
      }
    })

    const ticketMedio = contratos.length > 0 ? valorTotal / contratos.length : 0

    return {
      totalContratos: contratos.length,
      valorTotal,
      contratosAtivos,
      ticketMedio,
    }
  }, [contratos, getContratoStatusFromVigencia])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.1 }}
    >
      {/* Total de Contratos */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contratos
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metricas.totalContratos}
            </div>
            <p className="text-muted-foreground text-xs">
              contratos vinculados
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Valor Total */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="transition-shadow hover:shadow-md">
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
      </motion.div>

      {/* Contratos Vigentes */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Vigentes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricas.contratosAtivos}
            </div>
            <p className="text-muted-foreground text-xs">
              {metricas.totalContratos > 0
                ? `${Math.round((metricas.contratosAtivos / metricas.totalContratos) * 100)}% do total`
                : 'nenhum contrato'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ticket Médio */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              <CurrencyDisplay value={metricas.ticketMedio} />
            </div>
            <p className="text-muted-foreground text-xs">
              valor médio/contrato
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
