import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { currencyUtils } from '@/lib/utils'
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
} from 'lucide-react'

interface ValoresCalculatorProps {
  valorOriginal?: number
  valorAjustado: number
  onValorAjustadoChange: (valor: number) => void
  errors?: {
    valorAjustado?: string
  }
  className?: string
}

export function ValoresCalculator({
  valorOriginal = 0,
  valorAjustado,
  onValorAjustadoChange,
  errors = {},
  className
}: ValoresCalculatorProps) {
  const [valorFormatado, setValorFormatado] = useState('')

  useEffect(() => {
    if (valorAjustado > 0) {
      setValorFormatado(currencyUtils.formatar(valorAjustado))
    } else {
      setValorFormatado('')
    }
  }, [valorAjustado])

  const handleValorChange = useCallback((value: string) => {
    const isValid = currencyUtils.validar(value)
    if (isValid) {
      const valorNumerico = currencyUtils.paraNumero(value)
      onValorAjustadoChange(valorNumerico)
    }
    setValorFormatado(currencyUtils.aplicarMascara(value))
  }, [onValorAjustadoChange])

  // Memoizar cálculos para evitar re-execução desnecessária
  const diferenca = useMemo(() => {
    const diferencaValor = valorAjustado - valorOriginal
    const percentual = valorOriginal > 0 ? (diferencaValor / valorOriginal) * 100 : 0
    const isPositiva = diferencaValor > 0
    const isNegativa = diferencaValor < 0

    return {
      diferenca: diferencaValor,
      percentual,
      isPositiva,
      isNegativa,
      isNeutra: diferencaValor === 0
    }
  }, [valorAjustado, valorOriginal])

  const tipoAlteracao = useMemo(() => {
    if (diferenca.isPositiva) {
      return {
        label: 'Acréscimo',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      }
    }
    if (diferenca.isNegativa) {
      return {
        label: 'Redução',
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200'
      }
    }
    return {
      label: 'Sem alteração',
      icon: DollarSign,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    }
  }, [diferenca.isPositiva, diferenca.isNegativa])
  const Icon = tipoAlteracao.icon

  const formatarPercentual = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor / 100)
  }, [])

  const validacao = useMemo(() => {
    if (valorAjustado <= 0) {
      return {
        isValid: false,
        message: 'Valor deve ser maior que zero'
      }
    }
    
    const limiteMinimoLegal = valorOriginal * 0.75 // 75% do valor original
    const limiteMaximoLegal = valorOriginal * 1.25 // 125% do valor original
    
    if (valorAjustado < limiteMinimoLegal) {
      return {
        isValid: false,
        message: `Valor abaixo do limite mínimo legal (${currencyUtils.formatar(limiteMinimoLegal)})`
      }
    }
    
    if (valorAjustado > limiteMaximoLegal) {
      return {
        isValid: false,
        message: `Valor acima do limite máximo legal (${currencyUtils.formatar(limiteMaximoLegal)})`
      }
    }
    
    return {
      isValid: true,
      message: 'Valor dentro dos limites legais'
    }
  }, [valorAjustado, valorOriginal])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Cálculo de Valores</h3>
        <p className="text-muted-foreground text-sm">
          Configure o novo valor do contrato e visualize os impactos financeiros
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Valor Original */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5" />
                Valor Original
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {currencyUtils.formatar(valorOriginal)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Valor atual do contrato
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 w-full justify-center">
                  Referência base
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Novo Valor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={cn(
            'transition-all duration-200',
            errors.valorAjustado && 'border-red-300',
            !validacao.isValid && valorAjustado > 0 && 'border-orange-300'
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-5 w-5" />
                Novo Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valorAjustado" className="text-sm font-medium">
                    Valor Ajustado *
                  </Label>
                  <Input
                    id="valorAjustado"
                    type="text"
                    placeholder="R$ 0,00"
                    value={valorFormatado}
                    onChange={(e) => handleValorChange(e.target.value)}
                    className={cn(
                      'text-lg font-semibold',
                      errors.valorAjustado && 'border-red-300 focus:border-red-500'
                    )}
                  />
                  {errors.valorAjustado && (
                    <p className="text-xs text-red-600">{errors.valorAjustado}</p>
                  )}
                </div>

                {valorAjustado > 0 && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-xl font-bold">
                        {currencyUtils.formatar(valorAjustado)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Novo valor do contrato
                      </p>
                    </div>

                    <Badge className={cn(
                      'w-full justify-center',
                      validacao.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    )}>
                      {validacao.message}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Análise de Impacto */}
      {valorAjustado > 0 && valorOriginal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className={cn(
            'transition-all duration-200',
            tipoAlteracao.borderColor
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className={cn('h-5 w-5', tipoAlteracao.color)} />
                Análise de Impacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo da alteração */}
                <div className={cn(
                  'rounded-lg p-4 transition-all duration-200',
                  tipoAlteracao.bgColor
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tipoAlteracao.label}</p>
                      <p className={cn('text-lg font-bold', tipoAlteracao.color)}>
                        {diferenca.diferenca > 0 ? '+' : ''}
                        {currencyUtils.formatar(Math.abs(diferenca.diferenca))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Percentual</p>
                      <p className={cn('text-lg font-bold', tipoAlteracao.color)}>
                        {diferenca.percentual > 0 ? '+' : ''}
                        {formatarPercentual(Math.abs(diferenca.percentual))}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Detalhamento dos valores */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Valor Original</p>
                    <p className="text-lg font-semibold">
                      {currencyUtils.formatar(valorOriginal)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Diferença</p>
                    <p className={cn('text-lg font-semibold', tipoAlteracao.color)}>
                      {diferenca.diferenca > 0 ? '+' : ''}
                      {currencyUtils.formatar(Math.abs(diferenca.diferenca))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Novo Valor</p>
                    <p className="text-lg font-semibold">
                      {currencyUtils.formatar(valorAjustado)}
                    </p>
                  </div>
                </div>

                {/* Alerta de conformidade */}
                {!validacao.isValid && (
                  <div className="flex items-start gap-3 rounded-lg border-orange-200 bg-orange-50 p-4">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Atenção aos Limites Legais
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        {validacao.message}. Verifique se há justificativa legal para este valor.
                      </p>
                    </div>
                  </div>
                )}

                {validacao.isValid && (
                  <div className="flex items-start gap-3 rounded-lg border-green-200 bg-green-50 p-4">
                    <Info className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Conformidade Legal
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        O valor ajustado está dentro dos limites legais estabelecidos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}