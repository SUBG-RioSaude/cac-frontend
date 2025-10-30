import { Building2, Calendar, DollarSign, FileText } from 'lucide-react'

import type { FilterSection } from '@/components/advanced-filters/types'
import type { FiltrosContrato } from '@/modules/Contratos/types/contrato'
import { useUnidades } from '@/modules/Unidades/hooks/use-unidades'

/**
 * Configuração das seções de filtro para Contratos
 */
export const useFiltrosContratosConfig = (): FilterSection<FiltrosContrato>[] => {
  // Hook para carregar unidades da API
  const {
    data: unidadesData,
    isLoading: unidadesLoading,
    error: unidadesError,
  } = useUnidades({
    pagina: 1,
    tamanhoPagina: 100,
  })

  return [
    // Seção 1: Status do Contrato
    {
      id: 'status',
      title: 'Status do Contrato',
      icon: FileText,
      type: 'checkbox-list',
      defaultExpanded: false,
      config: {
        type: 'checkbox-list',
        field: 'status',
        multiSelect: true,
        options: [
          {
            value: 'Ativo',
            label: 'Ativo',
            color: 'text-green-600',
          },
          {
            value: 'Vencendo',
            label: 'Vencendo em Breve',
            color: 'text-yellow-600',
          },
          {
            value: 'Vencido',
            label: 'Vencido',
            color: 'text-red-600',
          },
          {
            value: 'Suspenso',
            label: 'Suspenso',
            color: 'text-gray-600',
          },
          {
            value: 'Encerrado',
            label: 'Encerrado',
            color: 'text-blue-600',
          },
        ],
      },
    },

    // Seção 2: Período de Vigência
    {
      id: 'vigencia',
      title: 'Período de Vigência',
      icon: Calendar,
      type: 'date-range',
      defaultExpanded: false,
      config: {
        type: 'date-range',
        startDateField: 'dataInicialDe',
        endDateField: 'dataInicialAte',
        startLabel: 'Data Inicial - De',
        endLabel: 'Data Inicial - Até',
      },
    },

    // Seção 3: Data Final
    {
      id: 'vigencia-final',
      title: 'Data Final',
      icon: Calendar,
      type: 'date-range',
      defaultExpanded: false,
      config: {
        type: 'date-range',
        startDateField: 'dataFinalDe',
        endDateField: 'dataFinalAte',
        startLabel: 'Data Final - De',
        endLabel: 'Data Final - Até',
      },
    },

    // Seção 4: Valor do Contrato (CAMPO COM FIX DE FOCO)
    {
      id: 'valor',
      title: 'Valor do Contrato',
      icon: DollarSign,
      type: 'range',
      defaultExpanded: false,
      config: {
        type: 'range',
        minField: 'valorMinimo',
        maxField: 'valorMaximo',
        inputType: 'currency',
        minLabel: 'Valor Mínimo (R$)',
        maxLabel: 'Valor Máximo (R$)',
        minPlaceholder: '0,00',
        maxPlaceholder: '0,00',
        step: 0.01,
      },
    },

    // Seção 5: Unidades (Async Checkbox)
    {
      id: 'unidades',
      title: 'Unidades',
      icon: Building2,
      type: 'async-checkbox',
      defaultExpanded: false,
      config: {
        type: 'async-checkbox',
        field: 'unidade',
        loadOptions: async () => {
          // Retornar opções baseadas nos dados carregados
          if (unidadesError) {
            return []
          }

          if (unidadesLoading) {
            return []
          }

          return (
            unidadesData?.dados?.map((unidade) => ({
              value: unidade.id,
              label: unidade.nome,
            })) ?? []
          )
        },
        searchable: true,
        searchPlaceholder: 'Buscar unidade...',
      },
    },
  ]
}
