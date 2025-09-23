import { getFieldConfig } from '../../config/editable-fields-config'
import { EditableTextField } from './EditableTextField'
import { EditableCurrencyField } from './EditableCurrencyField'
import { EditableDateField } from './EditableDateField'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

type FieldValue = string | number | Date | null | undefined

interface EditableFieldWrapperProps {
  fieldKey: string
  value: FieldValue
  isLoading?: boolean
  onSave: (value: FieldValue) => Promise<void>
  onCancel: () => void
}

export function EditableFieldWrapper({
  fieldKey,
  value,
  isLoading = false,
  onSave,
  onCancel,
}: EditableFieldWrapperProps) {
  const config = getFieldConfig(fieldKey)

  if (!config) {
    return null
  }

  // Para campos de texto simples
  if (config.type === 'text') {
    return (
      <EditableTextField
        value={String(value || '')}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
        maxLength={config.validation?.maxLength}
        required={config.validation?.required}
      />
    )
  }

  // Para campos de moeda
  if (config.type === 'currency') {
    return (
      <EditableCurrencyField
        value={Number(value || 0)}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
        min={config.validation?.min}
        max={config.validation?.max}
      />
    )
  }

  // Para campos de data
  if (config.type === 'date') {
    return (
      <EditableDateField
        value={String(value || '')}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    )
  }

  // Para campos de textarea
  if (config.type === 'textarea') {
    return (
      <EditableTextareaField
        value={String(value || '')}
        fieldName={fieldKey}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
        maxLength={config.validation?.maxLength}
        required={config.validation?.required}
      />
    )
  }

  // Para campos de select
  if (config.type === 'select' && config.options) {
    return (
      <EditableSelectField
        value={String(value || '')}
        options={config.options}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
        required={config.validation?.required}
      />
    )
  }

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

function EditableTextareaField({
  value: initialValue,
  fieldName,
  onSave,
  onCancel,
  isLoading = false,
  maxLength,
  required = false,
}: EditableTextareaFieldProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  useEffect(() => {
    // Focus no textarea quando monta
    const textarea = document.querySelector(
      `textarea[name="${fieldName}"]`,
    ) as HTMLTextAreaElement
    textarea?.focus()
  }, [fieldName])

  const handleSave = async () => {
    if (required && !value.trim()) {
      setError('Este campo é obrigatório')
      return
    }

    if (value === initialValue) {
      onCancel()
      return
    }

    try {
      await onSave(value)
    } catch (error) {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setError('')
    onCancel()
  }

  const hasChanges = value !== initialValue

  return (
    <div className="space-y-2">
      <Textarea
        name={fieldName}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError('')
        }}
        maxLength={maxLength}
        rows={3}
        disabled={isLoading}
        className={error ? 'border-red-500 focus:border-red-500' : ''}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          className="text-green-600 hover:text-green-700"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
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
  options: Array<{ value: string; label: string }>
  onSave: (value: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  required?: boolean
}

function EditableSelectField({
  value: initialValue,
  options,
  onSave,
  onCancel,
  isLoading = false,
  required = false,
}: EditableSelectFieldProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (required && !value) {
      setError('Este campo é obrigatório')
      return
    }

    if (value === initialValue) {
      onCancel()
      return
    }

    try {
      await onSave(value)
    } catch (error) {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setError('')
    onCancel()
  }

  const hasChanges = value !== initialValue

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={setValue} disabled={isLoading}>
          <SelectTrigger className={error ? 'border-red-500' : ''}>
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
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
