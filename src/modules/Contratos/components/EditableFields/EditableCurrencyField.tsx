import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'

interface EditableCurrencyFieldProps {
  value: number
  onSave: (value: number) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  min?: number
  max?: number
}

export function EditableCurrencyField({
  value: initialValue,
  onSave,
  onCancel,
  isLoading = false,
  min = 0,
  max
}: EditableCurrencyFieldProps) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(initialValue))
  const [numericValue, setNumericValue] = useState(initialValue)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  function parseCurrencyInput(input: string): number {
    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    const cleaned = input.replace(/[^\d,.-]/g, '')
    
    // Substitui vírgula por ponto para parsing
    const normalized = cleaned.replace(',', '.')
    
    // Converte para número
    const parsed = parseFloat(normalized)
    
    return isNaN(parsed) ? 0 : parsed
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const numeric = parseCurrencyInput(rawValue)
    
    setDisplayValue(rawValue)
    setNumericValue(numeric)
    setError('')

    // Validações
    if (numeric < min) {
      setError(`Valor mínimo: ${formatCurrency(min)}`)
    } else if (max && numeric > max) {
      setError(`Valor máximo: ${formatCurrency(max)}`)
    }
  }

  const handleBlur = () => {
    // Formata o valor quando sai do foco
    setDisplayValue(formatCurrency(numericValue))
  }

  const handleSave = async () => {
    if (numericValue < min) {
      setError(`Valor mínimo: ${formatCurrency(min)}`)
      return
    }

    if (max && numericValue > max) {
      setError(`Valor máximo: ${formatCurrency(max)}`)
      return
    }

    if (numericValue === initialValue) {
      onCancel()
      return
    }

    try {
      await onSave(numericValue)
    } catch (error) {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const handleCancel = () => {
    setDisplayValue(formatCurrency(initialValue))
    setNumericValue(initialValue)
    setError('')
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const hasChanges = numericValue !== initialValue

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="R$ 0,00"
          className={error ? 'border-red-500 focus:border-red-500' : ''}
          disabled={isLoading}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading || !hasChanges || !!error}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
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
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}