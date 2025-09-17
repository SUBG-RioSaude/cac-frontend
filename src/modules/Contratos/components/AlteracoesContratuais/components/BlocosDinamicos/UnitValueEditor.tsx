import { useState, useCallback, useEffect, useMemo } from 'react'
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
  Calculator,
  Plus,
  Minus,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Equal
} from 'lucide-react'

import type { UnidadeVinculada, OperacaoValorUnidade } from '../../../../types/alteracoes-contratuais'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
  valorAtual?: number
}

interface UnitValueEditorProps {
  isOpen: boolean
  onClose: () => void
  unit: TransformedUnidade | null
  onSave: (unidadeVinculada: UnidadeVinculada) => void
  contractValue?: number
  valorRestante?: number
  disabled?: boolean
  mode?: 'create' | 'edit'
  existingValue?: number
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
  disabled = false,
  mode = 'create',
  existingValue = 0
}: UnitValueEditorProps) {
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [operacao, setOperacao] = useState<OperacaoValorUnidade>('substituir')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && unit) {
      if (mode === 'edit' && existingValue > 0) {
        setValor(new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(existingValue))
        setOperacao('substituir')
      } else {
        setValor('')
        setOperacao('substituir')
      }
      setObservacoes('')
      setErrors({})
    }
  }, [isOpen, unit, mode, existingValue])

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
  
  // Calcular valor resultante baseado na operação
  const valorResultante = useMemo(() => {
    if (mode === 'create') {
      return parsedValue
    }
    
    switch (operacao) {
      case 'substituir':
        return parsedValue
      case 'adicionar':
        return existingValue + parsedValue
      case 'subtrair':
        return Math.max(0, existingValue - parsedValue)
      default:
        return parsedValue
    }
  }, [mode, operacao, parsedValue, existingValue])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!valor.trim()) {
      newErrors.valor = 'Valor é obrigatório'
    } else if (isNaN(parsedValue) || parsedValue <= 0) {
      newErrors.valor = 'Valor deve ser um número positivo'
    } else {
      // Validações específicas por operação
      if (mode === 'edit') {
        if (operacao === 'subtrair' && parsedValue > existingValue) {
          newErrors.valor = `Não é possível subtrair mais que o valor atual (${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(existingValue)})`
        }
      }
      
      // Validar se o valor resultante não excede o disponível no contrato
      if (availableValue && mode === 'create' && parsedValue > availableValue) {
        newErrors.valor = `Valor excede o disponível (${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(availableValue)})`
      } else if (availableValue && mode === 'edit') {
        const diferencaValor = valorResultante - existingValue
        if (diferencaValor > availableValue) {
          newErrors.valor = `Esta operação excede o valor disponível no contrato em ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(diferencaValor - availableValue)}`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [valor, parsedValue, availableValue, mode, operacao, existingValue, valorResultante])

  const handleSave = useCallback(() => {
    if (!unit || !validateForm()) return

    const unidadeVinculada: UnidadeVinculada = {
      unidadeSaudeId: unit.id,
      valorAtribuido: valorResultante,
      observacoes: observacoes.trim() || undefined
    }

    onSave(unidadeVinculada)
    onClose()
  }, [unit, validateForm, valorResultante, observacoes, onSave, onClose])

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
    if (!availableValue && mode === 'create') return
    
    let baseValue: number
    if (mode === 'edit' && operacao !== 'substituir') {
      baseValue = existingValue
    } else {
      baseValue = availableValue || 0
    }
    
    const value = baseValue * (percentage / 100)
    const centavos = Math.round(value * 100).toString()
    setValor(formatCurrency(centavos))
  }, [availableValue, formatCurrency, mode, operacao, existingValue])
  
  const adjustValue = useCallback((adjustment: number) => {
    const currentValue = parsedValue || 0
    const newValue = Math.max(0, currentValue + adjustment)
    const centavos = Math.round(newValue * 100).toString()
    setValor(formatCurrency(centavos))
  }, [parsedValue, formatCurrency])

  if (!unit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === 'edit' ? 'Editar Valor da Unidade' : 'Atribuir Valor à Unidade'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes da unidade */}
          <div className="p-3 bg-gray-50 rounded-lg overflow-hidden">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Building2 className="h-4 w-4 text-gray-400" />
                <Badge 
                  variant="secondary" 
                  className={cn('text-xs whitespace-nowrap', CORES_TIPO[unit.tipo as keyof typeof CORES_TIPO])}
                >
                  {unit.tipo}
                </Badge>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-sm break-words" title={unit.nome}>
                  {unit.nome}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-600">
                  <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">
                    {unit.codigo}
                  </span>
                  <div className="flex items-start gap-1 min-w-0">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="break-words" title={unit.endereco}>
                      {unit.endereco}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do contrato */}
          {contractValue && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg min-w-0">
                <Label className="text-xs text-blue-600">Valor do Contrato</Label>
                <p className="font-medium text-blue-700 break-words">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(contractValue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg min-w-0">
                <Label className="text-xs text-green-600">Valor Restante (para 100%)</Label>
                <p className="font-medium text-green-700 break-words">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(availableValue || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Valor atual e operações - apenas no modo edit */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Label className="text-sm font-medium text-orange-800">Valor Atual da Unidade</Label>
                <p className="text-lg font-bold text-orange-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(existingValue)}
                </p>
              </div>

              {/* Seletor de Operação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Operação</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={operacao === 'substituir' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOperacao('substituir')}
                    disabled={disabled}
                    className="flex items-center gap-2 text-xs"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Substituir
                  </Button>
                  <Button
                    type="button"
                    variant={operacao === 'adicionar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOperacao('adicionar')}
                    disabled={disabled}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant={operacao === 'subtrair' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOperacao('subtrair')}
                    disabled={disabled}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Minus className="h-3 w-3" />
                    Subtrair
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {operacao === 'substituir' && 'Substituir completamente o valor atual'}
                  {operacao === 'adicionar' && 'Somar ao valor atual'}
                  {operacao === 'subtrair' && 'Subtrair do valor atual'}
                </p>
              </div>

              {/* Preview do resultado */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Label className="text-xs text-blue-600">Valor Resultante</Label>
                    <p className="font-medium text-blue-800">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(valorResultante)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    {operacao === 'adicionar' && valorResultante > existingValue && (
                      <>
                        <TrendingUp className="h-3 w-3" />
                        +{new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorResultante - existingValue)}
                      </>
                    )}
                    {operacao === 'subtrair' && valorResultante < existingValue && (
                      <>
                        <TrendingDown className="h-3 w-3" />
                        -{new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(existingValue - valorResultante)}
                      </>
                    )}
                    {operacao === 'substituir' && (
                      <>
                        <Equal className="h-3 w-3" />
                        Novo valor
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sugestões rápidas */}
          {availableValue && availableValue > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Sugestões Rápidas</Label>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
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
                    className="text-xs bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >
                    Valor Exato Restante
                  </Button>
                )}
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50].map(percentage => (
                      <Button
                        key={percentage}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => suggestPercentage(percentage)}
                        disabled={disabled}
                        className="text-xs whitespace-nowrap"
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        {percentage}%
                      </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Campo de valor */}
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm font-medium">
              {mode === 'edit' ? 
                (operacao === 'substituir' ? 'Novo Valor *' : 
                 operacao === 'adicionar' ? 'Valor a Adicionar *' : 'Valor a Subtrair *') : 
                'Valor a Atribuir *'
              }
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="valor"
                  value={valor}
                  onChange={handleValueChange}
                  placeholder="R$ 0,00"
                  className={cn(
                    "pl-10 pr-24 h-11 text-base",
                    errors.valor && 'border-red-500'
                  )}
                  disabled={disabled}
                />
                {/* Botões de ajuste rápido */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => adjustValue(-1000)}
                    disabled={disabled || parsedValue <= 1000}
                    className="h-7 w-7 p-0 text-xs"
                    title="Diminuir R$ 1.000"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => adjustValue(1000)}
                    disabled={disabled}
                    className="h-7 w-7 p-0 text-xs"
                    title="Aumentar R$ 1.000"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Controles de ajuste fino */}
              {mode === 'edit' && (
                <div className="flex justify-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => adjustValue(-10000)}
                    disabled={disabled || parsedValue <= 10000}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    -10k
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => adjustValue(-5000)}
                    disabled={disabled || parsedValue <= 5000}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    -5k
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => adjustValue(5000)}
                    disabled={disabled}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    +5k
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => adjustValue(10000)}
                    disabled={disabled}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    +10k
                  </Button>
                </div>
              )}
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
              {mode === 'edit' ? 
                (operacao === 'substituir' ? 'Substituir Valor' :
                 operacao === 'adicionar' ? 'Adicionar Valor' : 'Subtrair Valor') :
                'Atribuir Valor'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}