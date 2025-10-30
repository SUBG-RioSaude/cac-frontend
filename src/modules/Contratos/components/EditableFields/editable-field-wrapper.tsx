import { Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { getFieldConfig } from '../../config/editable-fields-config'

import { EditableCurrencyField } from './editable-currency-field'
import { EditableDateField } from './editable-date-field'
import { EditableTextField } from './editable-text-field'

type FieldValue = string | number | Date | null | undefined

interface EditableFieldWrapperProps {
  fieldKey: string
  value: FieldValue
  isLoading?: boolean
  onSave: (value: FieldValue) => Promise<void>
  onCancel: () => void
}

export const EditableFieldWrapper = ({
  fieldKey,
  value,
  isLoading = false,
  onSave,
  onCancel,
}: EditableFieldWrapperProps) => {
  const config = getFieldConfig(fieldKey)

  if (!config) {
    return null
  }

  // Componente para textarea editável
  interface EditableTextareaFieldProps {
    value: string
    fieldName: string
    onSave: (value: string) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
    maxLength?: number
    required?: boolean
  }

  const EditableTextareaField = ({
    value: initialValue,
    fieldName,
    onSave: handleSave,
    onCancel: handleCancel,
    isLoading: loadingState = false,
    maxLength,
    required = false,
  }: EditableTextareaFieldProps) => {
    const [currentValue, setCurrentValue] = useState(initialValue)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
      // Focus no textarea quando monta
      const textarea = document.querySelector(`textarea[name="${fieldName}"]`)
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus()
      }
    }, [fieldName])

    const handleSaveField = async () => {
      if (required && !currentValue.trim()) {
        setSaveError('Este campo é obrigatório')
        return
      }

      if (currentValue === initialValue) {
        handleCancel()
        return
      }

      try {
        await handleSave(currentValue)
      } catch {
        setSaveError('Erro ao salvar. Tente novamente.')
      }
    }

    const handleCancelField = () => {
      setCurrentValue(initialValue)
      setSaveError('')
      handleCancel()
    }

    const hasChanges = currentValue !== initialValue

    return (
      <div className="space-y-2">
        <Textarea
          name={fieldName}
          value={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.value)
            setSaveError('')
          }}
          maxLength={maxLength}
          rows={3}
          disabled={loadingState}
          className={saveError ? 'border-red-500 focus:border-red-500' : ''}
        />

        {saveError && <p className="text-xs text-red-500">{saveError}</p>}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              void handleSaveField()
            }}
            disabled={loadingState || !hasChanges}
            className="text-green-600 hover:text-green-700"
          >
            {loadingState ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelField}
            disabled={loadingState}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  // Componente para select editável
  interface EditableSelectFieldProps {
    value: string
    options: { value: string; label: string }[]
    onSave: (value: string) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
    required?: boolean
  }

  const EditableSelectField = ({
    value: initialValue,
    options,
    onSave: handleSave,
    onCancel: handleCancel,
    isLoading: loadingState = false,
    required = false,
  }: EditableSelectFieldProps) => {
    const [currentValue, setCurrentValue] = useState(initialValue)
    const [saveError, setSaveError] = useState('')

    const handleSaveField = async () => {
      if (required && !currentValue) {
        setSaveError('Este campo é obrigatório')
        return
      }

      if (currentValue === initialValue) {
        handleCancel()
        return
      }

      try {
        await handleSave(currentValue)
      } catch {
        setSaveError('Erro ao salvar. Tente novamente.')
      }
    }

    const handleCancelField = () => {
      setCurrentValue(initialValue)
      setSaveError('')
      handleCancel()
    }

    const hasChanges = currentValue !== initialValue

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            value={currentValue}
            onValueChange={setCurrentValue}
            disabled={isLoading}
          >
            <SelectTrigger className={saveError ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {saveError && (
            <p className="mt-1 text-xs text-red-500">{saveError}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              void handleSaveField()
            }}
            disabled={loadingState || !hasChanges}
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            {loadingState ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelField}
            disabled={loadingState}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  switch (config.type) {
    case 'text':
      return (
        <EditableTextField
          value={String(value ?? '')}
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
          maxLength={config.validation?.maxLength}
          required={config.validation?.required}
        />
      )
    case 'currency':
      return (
        <EditableCurrencyField
          value={Number(value ?? 0)}
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
          min={config.validation?.min}
          max={config.validation?.max}
        />
      )
    case 'date':
      return (
        <EditableDateField
          value={String(value ?? '')}
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      )
    case 'textarea':
      return (
        <EditableTextareaField
          value={String(value ?? '')}
          fieldName={fieldKey}
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
          maxLength={config.validation?.maxLength}
          required={config.validation?.required}
        />
      )
    case 'select':
      return (
        <EditableSelectField
          value={String(value ?? '')}
          options={config.options ?? []}
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
          required={config.validation?.required}
        />
      )
    default:
      return null
  }
}
