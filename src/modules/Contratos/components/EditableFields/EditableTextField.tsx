import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'

interface EditableTextFieldProps {
  value: string
  placeholder?: string
  onSave: (value: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  maxLength?: number
  required?: boolean
  type?: 'text' | 'email' | 'tel'
}

export function EditableTextField({
  value: initialValue,
  placeholder,
  onSave,
  onCancel,
  isLoading = false,
  maxLength,
  required = false,
  type = 'text',
}: EditableTextFieldProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const hasChanges = value !== initialValue

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={error ? 'border-red-500 focus:border-red-500' : ''}
          disabled={isLoading}
        />
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
