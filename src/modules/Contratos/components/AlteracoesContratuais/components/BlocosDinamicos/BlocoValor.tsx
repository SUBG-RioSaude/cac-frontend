import { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Calculator,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

import type { 
  BlocoValor as IBlocoValor
} from '../../../../types/alteracoes-contratuais'
import { OperacaoValor } from '../../../../types/alteracoes-contratuais'

interface ContractFinancials {
  totalValue: number
  currentBalance: number
  executedPercentage: number
}

interface BlocoValorProps {
  dados: Partial<IBlocoValor>
  onChange: (dados: IBlocoValor) => void
  contractFinancials?: ContractFinancials
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
  valorOriginal?: number
  limiteLegal?: number // 25 ou 50 (percentual)
  onAlertaLimiteLegal?: (alerta: { percentual: number, limite: number, mensagem: string } | null) => void
}

const OPERACOES_CONFIG = {
  [OperacaoValor.Acrescentar]: {
    label: 'Acrescentar valor',
    icone: Plus,
    cor: 'green',
    descricao: 'Aumentar o valor do contrato'
  },
  [OperacaoValor.Diminuir]: {
    label: 'Diminuir valor',
    icone: Minus,
    cor: 'red',
    descricao: 'Reduzir o valor do contrato'
  },
  [OperacaoValor.Substituir]: {
    label: 'Novo valor global',
    icone: RefreshCw,
    cor: 'blue',
    descricao: 'Substituir por um novo valor total'
  }
}

export function BlocoValor({
  dados = {},
  onChange,
  contractFinancials,
  errors = {},
  disabled = false,
  required = false,
  valorOriginal = 0,
  limiteLegal = 0,
  onAlertaLimiteLegal
}: BlocoValorProps) {
  const [calculoAutomatico, setCalculoAutomatico] = useState(dados.valorCalculadoAutomaticamente ?? false)
  const [modoPercentual, setModoPercentual] = useState(!!dados.percentualAjuste)
  
  // Estados para formatação de valores monetários
  const [valorAjusteFormatado, setValorAjusteFormatado] = useState('')
  const [novoValorGlobalFormatado, setNovoValorGlobalFormatado] = useState('')

  // Calcular valores automaticamente
  const valoresCalculados = useMemo(() => {
    if (!dados.operacao || valorOriginal === 0) {
      return {
        valorAjuste: 0,
        percentualAjuste: 0,
        novoValorGlobal: valorOriginal,
        percentualImpacto: 0,
        excedeLimite: false
      }
    }

    let valorAjuste = 0
    let percentualAjuste = 0
    let novoValorGlobal = valorOriginal

    if (modoPercentual && dados.percentualAjuste) {
      // Calcular a partir do percentual
      percentualAjuste = dados.percentualAjuste
      valorAjuste = (valorOriginal * percentualAjuste) / 100
    } else if (dados.valorAjuste) {
      // Calcular a partir do valor
      valorAjuste = dados.valorAjuste
      percentualAjuste = (valorAjuste / valorOriginal) * 100
    }

    // Calcular novo valor global baseado na operação
    switch (dados.operacao as number) {
      case OperacaoValor.Acrescentar as number:
        novoValorGlobal = valorOriginal + valorAjuste
        break
      case OperacaoValor.Diminuir as number:
        novoValorGlobal = valorOriginal - valorAjuste
        break
      case OperacaoValor.Substituir as number:
        novoValorGlobal = dados.novoValorGlobal || valorOriginal
        valorAjuste = novoValorGlobal - valorOriginal
        percentualAjuste = (valorAjuste / valorOriginal) * 100
        break
    }

    const percentualImpacto = Math.abs((valorAjuste / valorOriginal) * 100)
    const excedeLimite = limiteLegal > 0 && percentualImpacto > limiteLegal

    return {
      valorAjuste,
      percentualAjuste,
      novoValorGlobal,
      percentualImpacto,
      excedeLimite
    }
  }, [dados, valorOriginal, modoPercentual, limiteLegal])

  // Emitir alerta de limite legal
  useEffect(() => {
    if (onAlertaLimiteLegal && limiteLegal > 0) {
      if (valoresCalculados.excedeLimite) {
        onAlertaLimiteLegal({
          percentual: valoresCalculados.percentualImpacto,
          limite: limiteLegal,
          mensagem: `⚠️ ATENÇÃO: Esta alteração resultará em ${valoresCalculados.percentualImpacto.toFixed(2)}% de alteração, excedendo o limite legal de ${limiteLegal}%. Alterações quantitativas estão sujeitas a limites legais. Revise a conformidade antes de confirmar.`
        })
      } else {
        onAlertaLimiteLegal(null)
      }
    }
  }, [valoresCalculados.excedeLimite, valoresCalculados.percentualImpacto, limiteLegal, onAlertaLimiteLegal])

  // Atualizar valores automaticamente
  useEffect(() => {
    if (calculoAutomatico && dados.operacao !== undefined) {
      const novos = { ...dados }
      
      if (dados.operacao !== (OperacaoValor.Substituir as number)) {
        novos.valorAjuste = valoresCalculados.valorAjuste
        novos.percentualAjuste = valoresCalculados.percentualAjuste
        novos.novoValorGlobal = valoresCalculados.novoValorGlobal
      }
      
      novos.valorCalculadoAutomaticamente = true
      
      if (JSON.stringify(novos) !== JSON.stringify(dados)) {
        onChange(novos as IBlocoValor)
      }
    }
  }, [valoresCalculados, calculoAutomatico, dados, onChange])

  const handleFieldChange = useCallback((field: keyof IBlocoValor, value: unknown) => {
    const novosDados = {
      ...dados,
      [field]: value,
      valorCalculadoAutomaticamente: calculoAutomatico
    }

    // Limpar campos desnecessários baseado na operação
    if (field === 'operacao') {
      if (value === (OperacaoValor.Substituir as number)) {
        novosDados.valorAjuste = undefined
        novosDados.percentualAjuste = undefined
      } else {
        novosDados.novoValorGlobal = undefined
      }
    }

    onChange(novosDados as IBlocoValor)
  }, [dados, onChange, calculoAutomatico])

  const handleModoChange = useCallback((percentual: boolean) => {
    setModoPercentual(percentual)
    // Limpar valores quando mudar o modo
    if (percentual) {
      handleFieldChange('valorAjuste', undefined)
    } else {
      handleFieldChange('percentualAjuste', undefined)
    }
  }, [handleFieldChange])

  const handleCalculoToggle = useCallback((ativo: boolean) => {
    setCalculoAutomatico(ativo)
    handleFieldChange('valorCalculadoAutomaticamente', ativo)
    
    // Se ativou o modo manual, limpar os valores calculados automaticamente
    if (!ativo) {
      // Permitir que o usuário digite valores manualmente
      setValorAjusteFormatado('')
      setNovoValorGlobalFormatado('')
      handleFieldChange('valorAjuste', undefined)
      handleFieldChange('percentualAjuste', undefined)
      handleFieldChange('novoValorGlobal', undefined)
    }
  }, [handleFieldChange])

  // Formatação de valores monetários
  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }, [])

  // Formatação de input monetário (sem símbolo de moeda)
  const formatarInputMonetario = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }, [])

  // Converter string formatada para número
  const parseValorMonetario = useCallback((valorFormatado: string) => {
    // Remove espaços e caracteres especiais, mantém apenas dígitos, pontos e vírgulas
    let valorLimpo = valorFormatado.replace(/[^\d.,]/g, '')
    
    // Se há vírgula, assume formato brasileiro (ex: 1.500,50)
    if (valorLimpo.includes(',')) {
      // Remove pontos (separadores de milhares) e troca vírgula por ponto decimal
      valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.')
    }
    // Se só há pontos, verifica se é separador de milhares ou decimal
    else if (valorLimpo.includes('.')) {
      const pontos = valorLimpo.split('.')
      // Se há mais de um ponto OU o último segmento tem mais de 2 dígitos, trata como separadores de milhares
      if (pontos.length > 2 || (pontos.length === 2 && pontos[1].length > 2)) {
        valorLimpo = valorLimpo.replace(/\./g, '')
      }
      // Senão, trata como decimal (ex: 123.45)
    }
    
    const numero = parseFloat(valorLimpo)
    return isNaN(numero) ? 0 : numero
  }, [])

  // Handler simplificado para valores monetários 
  const handleValorAjusteChange = useCallback((valorInput: string) => {
    console.log('🔧 handleValorAjusteChange:', valorInput)
    
    // Atualizar sempre o estado visual
    setValorAjusteFormatado(valorInput)
    
    // Parse simples: remover tudo exceto números, vírgulas e pontos
    const valorLimpo = valorInput.replace(/[^\d.,]/g, '')
    
    if (valorLimpo.trim() === '') {
      console.log('   - campo vazio, definindo como undefined')
      handleFieldChange('valorAjuste', undefined)
      return
    }
    
    // Conversão brasileira: última vírgula/ponto = decimal
    let valorFinal = valorLimpo
    if (valorLimpo.includes(',')) {
      // Formato brasileiro: 1.500,50 -> 1500.50
      valorFinal = valorLimpo.replace(/\./g, '').replace(',', '.')
    }
    
    const numero = parseFloat(valorFinal)
    console.log('   - valor parseado:', numero)
    
    if (!isNaN(numero) && numero > 0) {
      handleFieldChange('valorAjuste', numero)
    } else {
      handleFieldChange('valorAjuste', undefined)
    }
  }, [handleFieldChange])

  const handleNovoValorGlobalChange = useCallback((valorFormatado: string) => {
    setNovoValorGlobalFormatado(valorFormatado)
    const valorNumerico = parseValorMonetario(valorFormatado)
    handleFieldChange('novoValorGlobal', valorNumerico > 0 ? valorNumerico : undefined)
  }, [parseValorMonetario, handleFieldChange])

  // Sincronização simplificada - só limpar quando necessário
  useEffect(() => {
    // Se o valor nos dados foi limpo externamente, limpar o campo visual
    if (dados.valorAjuste === undefined && valorAjusteFormatado !== '') {
      console.log('🧹 Limpando valorAjusteFormatado porque dados.valorAjuste foi limpo')
      setValorAjusteFormatado('')
    }
    
    if (dados.novoValorGlobal === undefined && novoValorGlobalFormatado !== '') {
      console.log('🧹 Limpando novoValorGlobalFormatado porque dados.novoValorGlobal foi limpo')
      setNovoValorGlobalFormatado('')
    }
  }, [dados.valorAjuste, dados.novoValorGlobal, valorAjusteFormatado, novoValorGlobalFormatado])

  // Verificar se os campos obrigatórios estão preenchidos
  const camposObrigatoriosPreenchidos = useMemo(() => {
    if (dados.operacao === undefined) return false
    
    if (dados.operacao === (OperacaoValor.Substituir as number)) {
      return !!dados.novoValorGlobal && dados.novoValorGlobal > 0
    }
    
    return !!(modoPercentual ? dados.percentualAjuste : dados.valorAjuste) && 
           (modoPercentual ? dados.percentualAjuste! > 0 : dados.valorAjuste! > 0)
  }, [dados, modoPercentual])

  const operacaoSelecionada = dados.operacao !== undefined ? OPERACOES_CONFIG[dados.operacao] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={camposObrigatoriosPreenchidos ? 'default' : 'secondary'}>
            {camposObrigatoriosPreenchidos ? 'Configurado' : 'Incompleto'}
          </Badge>
          {required && !camposObrigatoriosPreenchidos && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Obrigatório
            </Badge>
          )}
          {valoresCalculados.excedeLimite && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Excede limite legal
            </Badge>
          )}
        </div>
      </div>

      {/* Contexto Financeiro Atual do Contrato */}
      {contractFinancials && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Situação Financeira Atual do Contrato
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-blue-600">Valor Total do Contrato</Label>
                <p className="font-medium text-lg text-blue-900">{formatarMoeda(contractFinancials.totalValue)}</p>
              </div>
              <div>
                <Label className="text-xs text-blue-600">Saldo Atual Disponível</Label>
                <p className="font-medium text-lg text-blue-900">{formatarMoeda(contractFinancials.currentBalance)}</p>
              </div>
              <div>
                <Label className="text-xs text-blue-600">Percentual Executado</Label>
                <p className="font-medium text-lg text-blue-900">{contractFinancials.executedPercentage.toFixed(1)}%</p>
              </div>
            </div>
            {limiteLegal > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <Label className="text-xs text-amber-600">Limite Legal Aplicável</Label>
                <p className="font-medium text-amber-700">{limiteLegal}% (conforme legislação vigente)</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparação: Valor Atual vs. Novo Valor */}
      {contractFinancials && dados.operacao !== undefined && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900">Comparação de Valores</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Valor Atual</Label>
                <p className="font-medium text-lg text-gray-900">{formatarMoeda(contractFinancials.totalValue)}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">
                  {dados.operacao === (OperacaoValor.Acrescentar as number) ? 'Acréscimo' :
                   dados.operacao === (OperacaoValor.Diminuir as number) ? 'Redução' : 'Alteração'}
                </Label>
                <p className={cn(
                  'font-medium text-lg',
                  dados.operacao === (OperacaoValor.Acrescentar as number) ? 'text-green-600' :
                  dados.operacao === (OperacaoValor.Diminuir as number) ? 'text-red-600' : 'text-blue-600'
                )}>
                  {dados.operacao !== (OperacaoValor.Substituir as number) && valoresCalculados.valorAjuste > 0 && (
                    dados.operacao === (OperacaoValor.Acrescentar as number) ? '+' : '-'
                  )}
                  {formatarMoeda(Math.abs(valoresCalculados.valorAjuste))}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Novo Valor Total</Label>
                <p className={cn(
                  'font-medium text-lg',
                  dados.operacao === (OperacaoValor.Acrescentar as number) ? 'text-green-600' :
                  dados.operacao === (OperacaoValor.Diminuir as number) ? 'text-red-600' : 'text-blue-600'
                )}>
                  {formatarMoeda(valoresCalculados.novoValorGlobal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seleção da operação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tipo de Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Operação de valor *</Label>
            <Select 
              value={dados.operacao?.toString() || ''} 
              onValueChange={(value) => handleFieldChange('operacao', parseInt(value) as OperacaoValor)}
              disabled={disabled}
            >
              <SelectTrigger className={cn(errors.operacao && 'border-red-500')}>
                <SelectValue placeholder="Selecione o tipo de operação" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OPERACOES_CONFIG).map(([key, config]) => {
                  const Icon = config.icone
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {operacaoSelecionada && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{operacaoSelecionada.label}:</span>{' '}
                  {operacaoSelecionada.descricao}
                </p>
              </div>
            )}

            {errors.operacao && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.operacao}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações específicas por operação */}
      {dados.operacao !== undefined && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Substituição */}
            {dados.operacao === (OperacaoValor.Substituir as number) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novo-valor-global">Novo valor global do contrato *</Label>
                  <div className="relative">
                    <Input
                      id="novo-valor-global"
                      type="text"
                      value={novoValorGlobalFormatado}
                      onChange={(e) => handleNovoValorGlobalChange(e.target.value)}
                      disabled={disabled}
                      className={cn(errors.novoValorGlobal && 'border-red-500', 'pl-8')}
                      placeholder="Ex: 500.000,00"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </div>
                  </div>
                  {errors.novoValorGlobal && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.novoValorGlobal}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acrescentar/Diminuir */}
            {[OperacaoValor.Acrescentar as number, OperacaoValor.Diminuir as number].includes(dados.operacao as number) && (
              <div className="space-y-6">
                {/* Controles de cálculo */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Modo de entrada</Label>
                    <p className="text-xs text-gray-600">
                      {modoPercentual ? 'Informar percentual' : 'Informar valor em reais'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Toggle valor/percentual */}
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">R$</Label>
                      <Switch
                        checked={modoPercentual}
                        onCheckedChange={handleModoChange}
                        disabled={disabled}
                      />
                      <Label className="text-sm">%</Label>
                    </div>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    {/* Toggle cálculo automático */}
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-gray-500" />
                      <Switch
                        checked={calculoAutomatico}
                        onCheckedChange={handleCalculoToggle}
                        disabled={disabled}
                      />
                      <Label className="text-sm">Auto</Label>
                    </div>
                  </div>
                </div>

                {/* Entrada principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modoPercentual ? (
                    <div className="space-y-2">
                      <Label htmlFor="percentual-ajuste">Percentual de ajuste *</Label>
                      <div className="relative">
                        <Input
                          id="percentual-ajuste"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={dados.percentualAjuste || ''}
                          onChange={(e) => handleFieldChange('percentualAjuste', parseFloat(e.target.value) || undefined)}
                          disabled={disabled || calculoAutomatico}
                          className={cn(errors.percentualAjuste && 'border-red-500', 'pr-8')}
                          placeholder="Ex: 15.5"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </div>
                      </div>
                      {errors.percentualAjuste && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.percentualAjuste}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="valor-ajuste">Valor de ajuste *</Label>
                      <div className="relative">
                        <Input
                          id="valor-ajuste"
                          type="text"
                          value={valorAjusteFormatado}
                          onChange={(e) => handleValorAjusteChange(e.target.value)}
                          disabled={disabled || calculoAutomatico}
                          className={cn(errors.valorAjuste && 'border-red-500', 'pl-8')}
                          placeholder="Ex: 50.000,00"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </div>
                      </div>
                      {errors.valorAjuste && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.valorAjuste}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campo calculado */}
                  <div className="space-y-2">
                    <Label className="text-gray-600">
                      {modoPercentual ? 'Valor calculado' : 'Percentual calculado'}
                    </Label>
                    <div className={cn(
                      'px-3 py-2 bg-gray-50 rounded-md border text-sm font-medium',
                      calculoAutomatico ? 'text-blue-700' : 'text-gray-600'
                    )}>
                      {modoPercentual 
                        ? formatarMoeda(valoresCalculados.valorAjuste)
                        : `${valoresCalculados.percentualAjuste.toFixed(2)}%`
                      }
                    </div>
                  </div>
                </div>

                {/* Resumo visual */}
                {valorOriginal > 0 && dados.valorAjuste && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-blue-900">Resumo do Impacto</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Valor original</div>
                        <div className="font-medium">{formatarMoeda(valorOriginal)}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-600 flex items-center gap-1">
                          {dados.operacao === (OperacaoValor.Acrescentar as number) ? (
                            <><Plus className="h-3 w-3" /> Acréscimo</>
                          ) : (
                            <><Minus className="h-3 w-3" /> Redução</>
                          )}
                        </div>
                        <div className={cn(
                          'font-medium',
                          dados.operacao === (OperacaoValor.Acrescentar as number) ? 'text-green-600' : 'text-red-600'
                        )}>
                          {formatarMoeda(valoresCalculados.valorAjuste)} ({valoresCalculados.percentualAjuste.toFixed(2)}%)
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-600">Novo valor total</div>
                        <div className="font-medium text-lg">{formatarMoeda(valoresCalculados.novoValorGlobal)}</div>
                      </div>
                    </div>

                    {/* Indicador de limite legal */}
                    {limiteLegal > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Percentual de alteração vs. limite legal</span>
                          <span className={cn(
                            'font-medium',
                            valoresCalculados.excedeLimite ? 'text-red-600' : 'text-green-600'
                          )}>
                            {valoresCalculados.percentualImpacto.toFixed(2)}% / {limiteLegal}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <Progress 
                            value={Math.min((valoresCalculados.percentualImpacto / limiteLegal) * 100, 100)} 
                            className={cn(
                              'h-2',
                              valoresCalculados.excedeLimite && 'bg-red-100'
                            )}
                          />
                          <div className="flex items-center gap-2 text-xs">
                            {valoresCalculados.excedeLimite ? (
                              <>
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">Excede o limite legal de {limiteLegal}%</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Dentro do limite legal</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={dados.observacoes || ''}
                onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                disabled={disabled}
                rows={3}
                className={cn(errors.observacoes && 'border-red-500')}
                placeholder="Justificativa técnica para a alteração de valor, índices aplicados, etc..."
              />
              {errors.observacoes && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.observacoes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de limite legal */}
      {valoresCalculados.excedeLimite && limiteLegal > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">
                  Atenção: Limite Legal Excedido
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  Esta alteração resultará em {valoresCalculados.percentualImpacto.toFixed(2)}% de 
                  alteração no valor do contrato, excedendo o limite legal de {limiteLegal}%. 
                  Alterações quantitativas estão sujeitas a limites legais conforme a legislação vigente.
                </p>
                <div className="bg-red-100 p-3 rounded-md">
                  <p className="text-xs text-red-800">
                    <strong>Ação necessária:</strong> Esta alteração requer confirmação adicional 
                    com justificativa específica e aceite dos riscos legais antes de ser submetida 
                    para aprovação.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}