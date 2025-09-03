import { useState, useCallback } from 'react'
import { useUpdateContrato } from './use-contratos-mutations'
import { 
  requiresConfirmation, 
  isCriticalField, 
  getFieldLabel,
  getFieldConfig
} from '../config/editable-fields-config'
import type { ContratoDetalhado } from '../types/contrato'

interface UseFieldEditingProps {
  contrato: ContratoDetalhado
  onSuccess?: () => void
  onError?: (error: any) => void
}

interface EditingState {
  fieldKey: string | null
  pendingValue: any
  showConfirmModal: boolean
}

export function useFieldEditing({ 
  contrato, 
  onSuccess, 
  onError 
}: UseFieldEditingProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    fieldKey: null,
    pendingValue: null,
    showConfirmModal: false
  })

  const updateMutation = useUpdateContrato()

  const startEditing = useCallback((fieldKey: string) => {
    setEditingState({
      fieldKey,
      pendingValue: null,
      showConfirmModal: false
    })
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingState({
      fieldKey: null,
      pendingValue: null,
      showConfirmModal: false
    })
  }, [])

  const saveField = useCallback(async (fieldKey: string, newValue: any) => {
    try {
      const updateData = {
        id: contrato.id,
        [fieldKey]: newValue
      }

      // Se há justificativa, poderíamos adicioná-la em observações ou em um campo específico
      // Por enquanto, apenas salvamos o campo alterado
      
      await updateMutation.mutateAsync(updateData)
      
      // Reseta o estado de edição
      setEditingState({
        fieldKey: null,
        pendingValue: null,
        showConfirmModal: false
      })

      onSuccess?.()
    } catch (error) {
      onError?.(error)
      throw error // Re-throw para que o componente possa tratar
    }
  }, [contrato.id, updateMutation, onSuccess, onError])

  const handleFieldSave = useCallback(async (fieldKey: string, newValue: any) => {
    const needsConfirmation = requiresConfirmation(fieldKey)

    if (needsConfirmation) {
      // Para campos que precisam de confirmação, mostra o modal
      setEditingState({
        fieldKey,
        pendingValue: newValue,
        showConfirmModal: true
      })
    } else {
      // Para campos simples, salva diretamente
      await saveField(fieldKey, newValue)
    }
  }, [saveField])

  const confirmSave = useCallback(async () => {
    if (editingState.fieldKey && editingState.pendingValue !== null) {
      await saveField(editingState.fieldKey, editingState.pendingValue)
    }
  }, [editingState.fieldKey, editingState.pendingValue, saveField])

  const formatFieldValue = useCallback((fieldKey: string, value: any): string => {
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
  }, [])

  const getOriginalValue = useCallback((fieldKey: string): any => {
    return (contrato as any)[fieldKey]
  }, [contrato])

  return {
    // Estados
    isEditing: (fieldKey: string) => editingState.fieldKey === fieldKey,
    isAnyEditing: editingState.fieldKey !== null,
    editingFieldKey: editingState.fieldKey,
    pendingValue: editingState.pendingValue,
    showConfirmModal: editingState.showConfirmModal,
    isLoading: updateMutation.isPending,

    // Ações
    startEditing,
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
    modalProps: editingState.showConfirmModal && editingState.fieldKey ? {
      isOpen: true,
      fieldName: editingState.fieldKey,
      fieldLabel: getFieldLabel(editingState.fieldKey),
      oldValue: getOriginalValue(editingState.fieldKey),
      newValue: editingState.pendingValue,
      isCritical: isCriticalField(editingState.fieldKey),
      formatValue: (value: any) => formatFieldValue(editingState.fieldKey!, value),
      onConfirm: confirmSave,
      onClose: cancelEditing,
      isLoading: updateMutation.isPending
    } : null
  }
}