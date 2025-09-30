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
  Equal,
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type {
  UnidadeVinculada,
  OperacaoValorUnidade,
} from '../../../../types/alteracoes-contratuais'

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
  Unidade: 'bg-gray-100 text-gray-700',
}

export const UnitValueEditor = ({
  isOpen,
  onClose,
  unit,
  onSave,
  contractValue,
  valorRestante = 0,
  disabled = false,
  mode = 'create',
  existingValue = 0,
}: UnitValueEditorProps) => {
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [operacao, setOperacao] = useState<OperacaoValorUnidade>('substituir')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && unit) {
      if (mode === 'edit' && existingValue > 0) {
        setValor(
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(existingValue),
        )
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
  const parseBrazilianCurrency = useCallback(
    (currencyString: string): number => {
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

      const finalString = `${integerPart  }.${  decimalPart}`
      return parseFloat(finalString) || 0
    },
    [],
  )

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
          newErrors.valor = `Não é possível subtrair mais que o valor atual (${new Intl.NumberFormat(
            'pt-BR',
            {
              style: 'currency',
              currency: 'BRL',
            },
          ).format(existingValue)})`
        }
      }

      // Validar se o valor resultante não excede o disponível no contrato
      if (availableValue && mode === 'create' && parsedValue > availableValue) {
        newErrors.valor = `Valor excede o disponível (${new Intl.NumberFormat(
          'pt-BR',
          {
            style: 'currency',
            currency: 'BRL',
          },
        ).format(availableValue)})`
      } else if (availableValue && mode === 'edit') {
        const diferencaValor = valorResultante - existingValue
        if (diferencaValor > availableValue) {
          newErrors.valor = `Esta operação excede o valor disponível no contrato em ${new Intl.NumberFormat(
            'pt-BR',
            {
              style: 'currency',
              currency: 'BRL',
            },
          ).format(diferencaValor - availableValue)}`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [
    valor,
    parsedValue,
    availableValue,
    mode,
    operacao,
    existingValue,
    valorResultante,
  ])

  const handleSave = useCallback(() => {
    if (!unit || !validateForm()) return

    const unidadeVinculada: UnidadeVinculada = {
      unidadeSaudeId: unit.id,
      valorAtribuido: valorResultante,
      observacoes: observacoes.trim() || undefined,
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
      currency: 'BRL',
    }).format(isNaN(number) ? 0 : number)
  }, [])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d]/g, '')
      if (rawValue.length <= 12) {
        // Limite máximo
        setValor(formatCurrency(rawValue))
      }
    },
    [formatCurrency],
  )

  const suggestPercentage = useCallback(
    (percentage: number) => {
      if (!availableValue && mode === 'create') return

      let baseValue: number
      if (mode === 'edit' && operacao !== 'substituir') {
        baseValue = existingValue
      } else {
        baseValue = availableValue ?? 0
      }

      const value = baseValue * (percentage / 100)
      const centavos = Math.round(value * 100).toString()
      setValor(formatCurrency(centavos))
    },
    [availableValue, formatCurrency, mode, operacao, existingValue],
  )

  const adjustValue = useCallback(
    (adjustment: number) => {
      const currentValue = parsedValue || 0
      const newValue = Math.max(0, currentValue + adjustment)
      const centavos = Math.round(newValue * 100).toString()
      setValor(formatCurrency(centavos))
    },
    [parsedValue, formatCurrency],
  )

  if (!unit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === 'edit'
              ? 'Editar Valor da Unidade'
              : 'Atribuir Valor à Unidade'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes da unidade */}
          <div className="overflow-hidden rounded-lg bg-gray-50 p-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex flex-shrink-0 items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs whitespace-nowrap',
                    CORES_TIPO[unit.tipo],
                  )}
                >
                  {unit.tipo}
                </Badge>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className="text-sm font-medium break-words"
                  title={unit.nome}
                >
                  {unit.nome}
                </p>
                <div className="flex flex-col gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-2">
                  <span className="rounded border bg-white px-1.5 py-0.5 font-mono text-xs">
                    {unit.codigo}
                  </span>
                  <div className="flex min-w-0 items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
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
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="min-w-0 rounded-lg bg-blue-50 p-3">
                <Label className="text-xs text-blue-600">
                  Valor do Contrato
                </Label>
                <p className="font-medium break-words text-blue-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(contractValue)}
                </p>
              </div>
              <div className="min-w-0 rounded-lg bg-green-50 p-3">
                <Label className="text-xs text-green-600">
                  Valor Restante (para 100%)
                </Label>
                <p className="font-medium break-words text-green-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(availableValue ?? 0)}
                </p>
              </div>
            </div>
          )}

          {/* Valor atual e operações - apenas no modo edit */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <Label className="text-sm font-medium text-orange-800">
                  Valor Atual da Unidade
                </Label>
                <p className="text-lg font-bold text-orange-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(existingValue)}
                </p>
              </div>

              {/* Seletor de Operação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Operação
                </Label>
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
                  {operacao === 'substituir' &&
                    'Substituir completamente o valor atual'}
                  {operacao === 'adicionar' && 'Somar ao valor atual'}
                  {operacao === 'subtrair' && 'Subtrair do valor atual'}
                </p>
              </div>

              {/* Preview do resultado */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Label className="text-xs text-blue-600">
                      Valor Resultante
                    </Label>
                    <p className="font-medium text-blue-800">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(valorResultante)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    {operacao === 'adicionar' &&
                      valorResultante > existingValue && (
                        <>
                          <TrendingUp className="h-3 w-3" />+
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(valorResultante - existingValue)}
                        </>
                      )}
                    {operacao === 'subtrair' &&
                      valorResultante < existingValue && (
                        <>
                          <TrendingDown className="h-3 w-3" />-
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
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
              <Label className="text-sm font-medium text-gray-700">
                Sugestões Rápidas
              </Label>
              <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
                {availableValue && (
                  <Button
                    key="exact"
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setValor(
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(availableValue),
                      )
                    }}
                    disabled={disabled}
                    className="bg-green-600 text-xs whitespace-nowrap hover:bg-green-700"
                  >
                    Valor Exato Restante
                  </Button>
                )}
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50].map((percentage) => (
                    <Button
                      key={percentage}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => suggestPercentage(percentage)}
                      disabled={disabled}
                      className="text-xs whitespace-nowrap"
                    >
                      <Calculator className="mr-1 h-3 w-3" />
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
              {mode === 'edit'
                ? operacao === 'substituir'
                  ? 'Novo Valor *'
                  : operacao === 'adicionar'
                    ? 'Valor a Adicionar *'
                    : 'Valor a Subtrair *'
                : 'Valor a Atribuir *'}
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="valor"
                  value={valor}
                  onChange={handleValueChange}
                  placeholder="R$ 0,00"
                  className={cn(
                    'h-11 pr-24 pl-10 text-base',
                    errors.valor && 'border-red-500',
                  )}
                  disabled={disabled}
                />
                {/* Botões de ajuste rápido */}
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform gap-1">
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
                {((parsedValue / availableValue) * 100).toFixed(1)}% do valor
                disponível
              </p>
            )}
          </div>

          {/* Campo de observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Justificativa para atribuição deste valor..."
              rows={3}
              className="resize-none text-sm"
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              Opcional: justifique a atribuição deste valor para esta unidade
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
              className="h-11 flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={disabled || !valor.trim()}
              className="h-11 flex-1"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {mode === 'edit'
                ? operacao === 'substituir'
                  ? 'Substituir Valor'
                  : operacao === 'adicionar'
                    ? 'Adicionar Valor'
                    : 'Subtrair Valor'
                : 'Atribuir Valor'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
