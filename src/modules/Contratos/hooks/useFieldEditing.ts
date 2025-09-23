import { useState, useCallback } from 'react'
import { useUpdateContrato } from './use-contratos-mutations'
import {
  requiresConfirmation,
  isCriticalField,
  getFieldLabel,
  getFieldConfig,
  getFieldsInGroup,
} from '../config/editable-fields-config'
import type { ContratoDetalhado } from '../types/contrato'

type FieldValue = string | number | Date | null | undefined

// Mapeamento dos nomes dos campos do frontend para os nomes esperados pela API
const FRONTEND_TO_API_MAPPING: Record<string, string> = {
  // Campos que precisam de mapeamento
  objeto: 'descricaoObjeto',
  valorTotal: 'valorGlobal',
  dataInicio: 'vigenciaInicial',
  dataTermino: 'vigenciaFinal',

  // Campos que já estão corretos (não precisam mapeamento, mas listados para documentação)
  // 'numeroContrato': 'numeroContrato',
  // 'processoSei': 'processoSei',
  // 'processoRio': 'processoRio',
  // 'processoLegado': 'processoLegado',
  // 'categoriaObjeto': 'categoriaObjeto'
}

interface UseFieldEditingProps {
  contrato: ContratoDetalhado
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

interface EditingState {
  fieldKey: string | null
  pendingValue: FieldValue
  showConfirmModal: boolean
  editingGroup: string | null // Para edição em bloco
  editingFields: string[] // Lista de campos sendo editados
}

export function useFieldEditing({
  contrato,
  onSuccess,
  onError,
}: UseFieldEditingProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    fieldKey: null,
    pendingValue: null,
    showConfirmModal: false,
    editingGroup: null,
    editingFields: [],
  })

  const updateMutation = useUpdateContrato()

  const startEditing = useCallback((fieldKey: string) => {
    setEditingState({
      fieldKey,
      pendingValue: null,
      showConfirmModal: false,
      editingGroup: null,
      editingFields: [],
    })
  }, [])

  const startGroupEditing = useCallback((groupKey: string) => {
    const fieldsInGroup = getFieldsInGroup(groupKey)
    setEditingState({
      fieldKey: null,
      pendingValue: null,
      showConfirmModal: false,
      editingGroup: groupKey,
      editingFields: fieldsInGroup,
    })
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingState({
      fieldKey: null,
      pendingValue: null,
      showConfirmModal: false,
      editingGroup: null,
      editingFields: [],
    })
  }, [])

  const saveField = useCallback(
    async (fieldKey: string, newValue: FieldValue) => {
      try {
        // Mapeia o nome do campo do frontend para o nome esperado pela API
        const apiFieldName = FRONTEND_TO_API_MAPPING[fieldKey] || fieldKey

        const updateData = {
          id: contrato.id,
          [apiFieldName]: newValue,
        }

        // Se há justificativa, poderíamos adicioná-la em observações ou em um campo específico
        // Por enquanto, apenas salvamos o campo alterado

        await updateMutation.mutateAsync(updateData)

        // Reseta o estado de edição
        setEditingState({
          fieldKey: null,
          pendingValue: null,
          showConfirmModal: false,
          editingGroup: null,
          editingFields: [],
        })

        onSuccess?.()
      } catch (error) {
        onError?.(error)
        throw error // Re-throw para que o componente possa tratar
      }
    },
    [contrato.id, updateMutation, onSuccess, onError],
  )

  const handleFieldSave = useCallback(
    async (fieldKey: string, newValue: FieldValue) => {
      const needsConfirmation = requiresConfirmation(fieldKey)

      if (needsConfirmation) {
        // Para campos que precisam de confirmação, mostra o modal
        setEditingState({
          fieldKey,
          pendingValue: newValue,
          showConfirmModal: true,
          editingGroup: null,
          editingFields: [],
        })
      } else {
        // Para campos simples, salva diretamente
        await saveField(fieldKey, newValue)
      }
    },
    [saveField],
  )

  const confirmSave = useCallback(async () => {
    if (editingState.fieldKey && editingState.pendingValue !== null) {
      await saveField(editingState.fieldKey, editingState.pendingValue)
    }
  }, [editingState.fieldKey, editingState.pendingValue, saveField])

  const formatFieldValue = useCallback(
    (fieldKey: string, value: FieldValue): string => {
      const config = getFieldConfig(fieldKey)

      if (config?.type === 'currency' && typeof value === 'number') {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value)
      }

      if (config?.type === 'date' && value) {
        try {
          const date = new Date(value)
          return date.toLocaleDateString('pt-BR')
        } catch {
          return String(value)
        }
      }

      return String(value || '')
    },
    [],
  )

  const getOriginalValue = useCallback(
    (fieldKey: string): FieldValue => {
      return (contrato as unknown as Record<string, FieldValue>)[fieldKey]
    },
    [contrato],
  )

  const convertToModalValue = useCallback(
    (value: FieldValue): string | number => {
      if (value instanceof Date) {
        return value.toISOString()
      }
      if (value === null || value === undefined) {
        return ''
      }
      return value
    },
    [],
  )

  return {
    // Estados
    isEditing: (fieldKey: string) =>
      editingState.fieldKey === fieldKey ||
      editingState.editingFields.includes(fieldKey),
    isGroupEditing: (groupKey: string) =>
      editingState.editingGroup === groupKey,
    isAnyEditing:
      editingState.fieldKey !== null || editingState.editingFields.length > 0,
    editingFieldKey: editingState.fieldKey,
    editingGroup: editingState.editingGroup,
    editingFields: editingState.editingFields,
    pendingValue: editingState.pendingValue,
    showConfirmModal: editingState.showConfirmModal,
    isLoading: updateMutation.isPending,

    // Ações
    startEditing,
    startGroupEditing,
    cancelEditing,
    handleFieldSave,
    confirmSave,

    // Utilitários
    formatFieldValue,
    getOriginalValue,
    getFieldLabel: (fieldKey: string) => getFieldLabel(fieldKey),
    isCriticalField: (fieldKey: string) => isCriticalField(fieldKey),
    getFieldConfig: (fieldKey: string) => getFieldConfig(fieldKey),

    // Modal props
    modalProps:
      editingState.showConfirmModal && editingState.fieldKey
        ? {
            isOpen: true,
            fieldName: editingState.fieldKey,
            fieldLabel: getFieldLabel(editingState.fieldKey),
            oldValue: convertToModalValue(
              getOriginalValue(editingState.fieldKey),
            ),
            newValue: convertToModalValue(editingState.pendingValue),
            isCritical: isCriticalField(editingState.fieldKey),
            formatValue: (value: FieldValue) =>
              formatFieldValue(editingState.fieldKey!, value),
            onConfirm: confirmSave,
            onClose: cancelEditing,
            isLoading: updateMutation.isPending,
          }
        : null,
  }
}
