import { Check, X, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditableDateFieldProps {
  value: string // ISO date string
  onSave: (value: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  minDate?: string
  maxDate?: string
}

export const EditableDateField = ({
  value: initialValue,
  onSave,
  onCancel,
  isLoading = false,
  minDate,
  maxDate,
}: EditableDateFieldProps) => {
  const [value, setValue] = useState(formatDateForInput(initialValue))
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function formatDateForInput(isoDate: string): string {
    if (!isoDate) return ''
    try {
      const date = new Date(isoDate)
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    } catch {
      return ''
    }
  }

  function formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return ''
    try {
      const date = new Date(isoDate)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return ''
    }
  }

  function validateDate(dateString: string): string | null {
    if (!dateString) return 'Data é obrigatória'

    const date = new Date(`${dateString}T00:00:00`)
    if (isNaN(date.getTime())) return 'Data inválida'

    if (minDate) {
      const min = new Date(`${minDate}T00:00:00`)
      if (date < min) {
        return `Data deve ser maior ou igual a ${formatDateForDisplay(minDate)}`
      }
    }

    if (maxDate) {
      const max = new Date(`${maxDate}T00:00:00`)
      if (date > max) {
        return `Data deve ser menor ou igual a ${formatDateForDisplay(maxDate)}`
      }
    }

    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    const errorMsg = validateDate(newValue)
    setError(errorMsg ?? '')
  }

  const handleSave = async () => {
    const errorMsg = validateDate(value)
    if (errorMsg) {
      setError(errorMsg)
      return
    }

    const currentInputValue = formatDateForInput(initialValue)
    if (value === currentInputValue) {
      onCancel()
      return
    }

    try {
      // Converte a data para ISO string
      const isoDate = new Date(`${value}T00:00:00`).toISOString()
      await onSave(isoDate)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const handleCancel = () => {
    setValue(formatDateForInput(initialValue))
    setError('')
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const hasChanges = value !== formatDateForInput(initialValue)

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          ref={inputRef}
          type="date"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          min={minDate}
          max={maxDate}
          className={error ? 'border-red-500 focus:border-red-500' : ''}
          disabled={isLoading}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void handleSave()
          }}
          disabled={isLoading || !hasChanges || !!error}
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
