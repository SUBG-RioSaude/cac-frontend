/**
 * ==========================================
 * HOOK PARA CONFIGURAÇÃO DE STATUS BADGES
 * ==========================================
 * Centraliza todas as configurações visuais e lógica de status
 */

import { useMemo } from 'react'
import { CheckCircle, AlertTriangle, Clock, XCircle, Pause } from 'lucide-react'
import type { 
  StatusConfigMap, 
  StatusDomain, 
  Status, 
  StatusConfig,
  StatusContrato,
  StatusFornecedor,
  StatusUnidade 
} from '@/types/status'

export function useStatusConfig() {
  const statusConfigMap: StatusConfigMap = useMemo(() => ({
    contrato: {
      ativo: {
        variant: 'default',
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        icon: CheckCircle,
      },
      vencendo: {
        variant: 'secondary',
        label: 'Vencendo',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
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
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
        icon: Pause,
      },
      encerrado: {
        variant: 'outline',
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
        icon: XCircle,
      },
      indefinido: {
        variant: 'outline',
        label: 'Indefinido',
        className: 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
        icon: undefined,
      },
    },
    fornecedor: {
      ativo: {
        variant: 'default',
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        icon: CheckCircle,
      },
      inativo: {
        variant: 'secondary',
        label: 'Inativo',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
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
        className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        icon: CheckCircle,
      },
      inativo: {
        variant: 'secondary',
        label: 'Inativo',
        className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
        icon: XCircle,
      },
    },
  }), [])

  // Função para obter configuração de status
  const getStatusConfig = (status: Status, domain: StatusDomain): StatusConfig => {
    const domainConfig = statusConfigMap[domain]
    
    // Normalizar status para lowercase para maior flexibilidade
    const normalizedStatus = status?.toLowerCase() as Status
    
    // Obter configuração específica ou fallback
    let config: StatusConfig | undefined
    
    switch (domain) {
      case 'contrato':
        config = (domainConfig as Record<StatusContrato, StatusConfig>)[normalizedStatus as StatusContrato]
        break
      case 'fornecedor':
        config = (domainConfig as Record<StatusFornecedor, StatusConfig>)[normalizedStatus as StatusFornecedor]
        break
      case 'unidade':
        config = (domainConfig as Record<StatusUnidade, StatusConfig>)[normalizedStatus as StatusUnidade]
        break
    }
    
    // Fallback para status padrão se não encontrar configuração
    if (!config) {
      switch (domain) {
        case 'contrato':
          return statusConfigMap.contrato.indefinido
        case 'fornecedor':
          return statusConfigMap.fornecedor.ativo
        case 'unidade':
          return statusConfigMap.unidade.ativo
        default:
          return statusConfigMap.contrato.indefinido
      }
    }
    
    return config
  }

  // Função especial para status de contratos com lógica de vigência
  const getContratoStatusFromVigencia = (
    _vigenciaInicial?: string | null,
    vigenciaFinal?: string | null,
    statusAtual?: string | null
  ): StatusContrato => {
    // vigenciaInicial não é usado na lógica atual, mas mantido para futuras funcionalidades
    // Se tem status específico como 'suspenso', usar ele
    if (statusAtual?.toLowerCase() === 'suspenso') {
      return 'suspenso'
    }
    
    if (statusAtual?.toLowerCase() === 'encerrado') {
      return 'encerrado'
    }
    
    // Se não tem vigência final, considerar ativo
    if (!vigenciaFinal) {
      return 'ativo'
    }
    
    const agora = new Date()
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const dataFim = new Date(vigenciaFinal)
    
    if (dataFim < agora) {
      return 'vencido'
    } else if (dataFim <= em30Dias) {
      return 'vencendo'
    } else {
      return 'ativo'
    }
  }

  return {
    getStatusConfig,
    getContratoStatusFromVigencia,
    statusConfigMap,
  }
}