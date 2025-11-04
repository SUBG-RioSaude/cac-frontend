/**
 * ==========================================
 * HOOK PARA CONFIGURAÇÃO DE STATUS BADGES
 * ==========================================
 * Centraliza todas as configurações visuais e lógica de status
 */

import { CheckCircle, AlertTriangle, Clock, XCircle, Pause } from 'lucide-react'
import { useMemo, useCallback } from 'react'

import {
  parseStatusContrato,
  parseStatusFornecedor,
  parseStatusUnidade,
} from '@/types/status'
import type {
  StatusConfigMap,
  StatusDomain,
  Status,
  StatusConfig,
  StatusContrato,
  StatusFornecedor,
  StatusUnidade,
} from '@/types/status'

export function useStatusConfig() {
  const statusConfigMap: StatusConfigMap = useMemo(
    () => ({
      contrato: {
        vigente: {
          variant: 'default',
          label: 'Vigente',
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: CheckCircle,
        },
        ativo: {
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        },
        vencendo: {
          variant: 'secondary',
          label: 'Vencendo',
          className:
            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
          icon: Clock,
        },
        vencido: {
          variant: 'destructive',
          label: 'Vencido',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: AlertTriangle,
        },
        suspenso: {
          variant: 'outline',
          label: 'Suspenso',
          className:
            'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Pause,
        },
        encerrado: {
          variant: 'outline',
          label: 'Encerrado',
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: XCircle,
        },
        indefinido: {
          variant: 'outline',
          label: 'Indefinido',
          className:
            'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
          icon: undefined,
        },
      },
      fornecedor: {
        ativo: {
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        },
        inativo: {
          variant: 'secondary',
          label: 'Inativo',
          className:
            'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: XCircle,
        },
        suspenso: {
          variant: 'destructive',
          label: 'Suspenso',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: Pause,
        },
      },
      unidade: {
        ativo: {
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        },
        inativo: {
          variant: 'secondary',
          label: 'Inativo',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: XCircle,
        },
      },
    }),
    [],
  )

  // Função para obter configuração de status
  const getStatusConfig = useCallback(
    (status: Status, domain: StatusDomain): StatusConfig => {
      const domainConfig = statusConfigMap[domain]

      // Normalizar status para lowercase para maior flexibilidade
      // Obter configuração específica ou fallback
      switch (domain) {
        case 'contrato': {
          const contratoConfig = domainConfig as Record<
            StatusContrato,
            StatusConfig
          >
          const contratoStatus = parseStatusContrato(status)
          return contratoConfig[contratoStatus]
        }
        case 'fornecedor': {
          const fornecedorConfig = domainConfig as Record<
            StatusFornecedor,
            StatusConfig
          >
          const fornecedorStatus = parseStatusFornecedor(status)
          return fornecedorConfig[fornecedorStatus]
        }
        case 'unidade': {
          const unidadeConfig = domainConfig as Record<
            StatusUnidade,
            StatusConfig
          >
          const unidadeStatus = parseStatusUnidade(status)
          return unidadeConfig[unidadeStatus]
        }
        default:
          return statusConfigMap.contrato.indefinido
      }
    },
    [statusConfigMap],
  )

  // Função especial para status de contratos com lógica de vigência
  const getContratoStatusFromVigencia = useCallback(
    (
      _vigenciaInicial?: string | null,
      vigenciaFinal?: string | null,
      statusAtual?: string | null,
    ): StatusContrato => {
      // vigenciaInicial não é usado na lógica atual, mas mantido para futuras funcionalidades
      // Se tem status específico como 'suspenso', usar ele
      if (statusAtual?.toLowerCase() === 'suspenso') {
        return 'suspenso'
      }

      if (statusAtual?.toLowerCase() === 'encerrado') {
        return 'encerrado'
      }

      // Se não tem vigência final, considerar vigente
      if (!vigenciaFinal) {
        return 'vigente'
      }

      const agora = new Date()
      const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const dataFim = new Date(vigenciaFinal)

      if (dataFim < agora) {
        return 'vencido'
      } else if (dataFim <= em30Dias) {
        return 'vencendo'
      } else {
        return 'vigente'
      }
    },
    [],
  )

  return {
    getStatusConfig,
    getContratoStatusFromVigencia,
    statusConfigMap,
  }
}

// Função utilitária para usar status de contrato baseado em vigência (hook)
export const useContratoStatus = (
  vigenciaInicial?: string,
  vigenciaFinal?: string,
  statusAtual?: string,
): StatusContrato => {
  const { getContratoStatusFromVigencia } = useStatusConfig()
  return useMemo(
    () =>
      getContratoStatusFromVigencia(
        vigenciaInicial,
        vigenciaFinal,
        statusAtual,
      ),
    [
      vigenciaInicial,
      vigenciaFinal,
      statusAtual,
      getContratoStatusFromVigencia,
    ],
  )
}
