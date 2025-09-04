import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
  Calculator
} from 'lucide-react'

import type { UnidadeVinculada } from '../../../../types/alteracoes-contratuais'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
}

interface UnitValueEditorProps {
  isOpen: boolean
  onClose: () => void
  unit: TransformedUnidade | null
  onSave: (unidadeVinculada: UnidadeVinculada) => void
  contractValue?: number
  valorRestante?: number
  disabled?: boolean
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700',
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  'Unidade': 'bg-gray-100 text-gray-700',
}

export function UnitValueEditor({
  isOpen,
  onClose,
  unit,
  onSave,
  contractValue,
  valorRestante = 0,
  disabled = false
}: UnitValueEditorProps) {
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && unit) {
      setValor('')
      setObservacoes('')
      setErrors({})
    }
  }, [isOpen, unit])

  const availableValue = valorRestante > 0 ? valorRestante : undefined
  
  // Função para fazer parse correto da moeda brasileira
  const parseBrazilianCurrency = useCallback((currencyString: string): number => {
    if (!currencyString || currencyString.trim() === '') return 0
    
    // Remove símbolos e espaços, mantém apenas dígitos, pontos e vírgula
    const cleanString = currencyString.replace(/[^\d.,]/g, '')
    
    // Se não tem vírgula, é um valor inteiro (ex: "33333" = 33333)
    if (!cleanString.includes(',')) {
      return parseFloat(cleanString) || 0
    }
    
    // Se tem vírgula, separa milhares e decimais
    // Ex: "33.333,33" -> partes = ["33.333", "33"]
    const parts = cleanString.split(',')
    const decimalPart = parts[parts.length - 1] // última parte é decimal
    const integerPart = parts.slice(0, -1).join('').replace(/\./g, '') // remove pontos dos milhares
    
    const finalString = integerPart + '.' + decimalPart
    return parseFloat(finalString) || 0
  }, [])

  const parsedValue = parseBrazilianCurrency(valor)

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!valor.trim()) {
      newErrors.valor = 'Valor é obrigatório'
    } else if (isNaN(parsedValue) || parsedValue <= 0) {
      newErrors.valor = 'Valor deve ser um número positivo'
    } else if (availableValue && parsedValue > availableValue) {
      newErrors.valor = `Valor excede o disponível (${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(availableValue)})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [valor, parsedValue, availableValue])

  const handleSave = useCallback(() => {
    if (!unit || !validateForm()) return

    const unidadeVinculada: UnidadeVinculada = {
      unidadeSaudeId: unit.id,
      valorAtribuido: parsedValue,
      observacoes: observacoes.trim() || undefined
    }

    onSave(unidadeVinculada)
    onClose()
  }, [unit, validateForm, parsedValue, observacoes, onSave, onClose])

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  const formatCurrency = useCallback((value: string) => {
    const numericValue = value.replace(/[^\d]/g, '')
    const number = parseFloat(numericValue) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(isNaN(number) ? 0 : number)
  }, [])

  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '')
    if (rawValue.length <= 12) { // Limite máximo
      setValor(formatCurrency(rawValue))
    }
  }, [formatCurrency])

  const suggestPercentage = useCallback((percentage: number) => {
    if (!availableValue) return
    const value = availableValue * (percentage / 100)
    // Converter para centavos para usar a mesma lógica do formatCurrency
    const centavos = Math.round(value * 100).toString()
    setValor(formatCurrency(centavos))
  }, [availableValue, formatCurrency])

  if (!unit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Atribuir Valor à Unidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes da unidade */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Badge 
                variant="secondary" 
                className={cn('text-xs', CORES_TIPO[unit.tipo as keyof typeof CORES_TIPO])}
              >
                {unit.tipo}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{unit.nome}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-mono">{unit.codigo}</span>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{unit.endereco}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do contrato */}
          {contractValue && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Label className="text-xs text-blue-600">Valor do Contrato</Label>
                <p className="font-medium text-blue-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(contractValue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Label className="text-xs text-green-600">Valor Restante (para 100%)</Label>
                <p className="font-medium text-green-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(availableValue || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Sugestões rápidas */}
          {availableValue && availableValue > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Sugestões Rápidas</Label>
              <div className="flex flex-wrap gap-2">
                {availableValue && (
                  <Button
                    key="exact"
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setValor(new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(availableValue))
                    }}
                    disabled={disabled}
                    className="text-xs bg-green-600 hover:bg-green-700"
                  >
                    Valor Exato Restante
                  </Button>
                )}
                {[10, 25, 50].map(percentage => (
                    <Button
                      key={percentage}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => suggestPercentage(percentage)}
                      disabled={disabled}
                      className="text-xs"
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      {percentage}%
                    </Button>
                ))}
              </div>
            </div>
          )}

          {/* Campo de valor */}
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm font-medium">Valor a Atribuir *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="valor"
                value={valor}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                className={cn(
                  "pl-10 h-11 text-base",
                  errors.valor && 'border-red-500'
                )}
                disabled={disabled}
              />
            </div>
            {errors.valor && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.valor}
              </div>
            )}
            {!errors.valor && parsedValue > 0 && availableValue && (
              <p className="text-xs text-gray-600">
                {((parsedValue / availableValue) * 100).toFixed(1)}% do valor disponível
              </p>
            )}
          </div>

          {/* Campo de observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Justificativa para atribuição deste valor..."
              rows={3}
              className="text-sm resize-none"
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              Opcional: justifique a atribuição deste valor para esta unidade
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={disabled || !valor.trim()}
              className="flex-1 h-11"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Atribuir Valor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}