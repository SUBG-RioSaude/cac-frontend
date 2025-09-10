import { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DateDisplay } from '@/components/ui/formatters'
import {
  Clock,
  Calendar,
  Plus,
  Minus,
  Pause,
  StopCircle,
  AlertCircle,
  Calculator,
  Info
} from 'lucide-react'

import type { 
  BlocoVigencia as IBlocoVigencia
} from '../../../../types/alteracoes-contratuais'
import { 
  OperacaoVigencia,
  TipoUnidadeTempo
} from '../../../../types/alteracoes-contratuais'

interface ContractTerms {
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

interface OperacaoConfig {
  label: string
  icone: React.ComponentType<{ className?: string }>
  cor: string
  descricao: string
  disabled?: boolean
}

interface BlocoVigenciaProps {
  dados: Partial<IBlocoVigencia>
  onChange: (dados: IBlocoVigencia) => void
  contractTerms?: ContractTerms
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
  vigenciaOriginal?: {
    dataInicio: string
    dataFim: string
  }
}

const OPERACOES_CONFIG: Record<number, OperacaoConfig> = {
  [OperacaoVigencia.Acrescentar]: {
    label: 'Acrescentar tempo',
    icone: Plus,
    cor: 'green',
    descricao: 'Estender a vigência do contrato'
  },
  [OperacaoVigencia.Diminuir]: {
    label: 'Diminuir tempo',
    icone: Minus,
    cor: 'red',
    descricao: 'Reduzir o período de vigência'
  },
  [OperacaoVigencia.Substituir]: {
    label: 'Nova data final (em breve)',
    icone: Calendar,
    cor: 'blue',
    descricao: 'Definir nova data de término',
    disabled: true
  },
  [OperacaoVigencia.SuspenderDeterminado]: {
    label: 'Suspender por período (em breve)',
    icone: Pause,
    cor: 'yellow',
    descricao: 'Pausar execução por tempo determinado',
    disabled: true
  },
  [OperacaoVigencia.SuspenderIndeterminado]: {
    label: 'Suspender indeterminadamente (em breve)',
    icone: StopCircle,
    cor: 'orange',
    descricao: 'Pausar sem prazo definido para retomada',
    disabled: true
  }
}

const UNIDADES_TEMPO_CONFIG = {
  [TipoUnidadeTempo.Dias]: { label: 'Dias', singular: 'dia' },
  [TipoUnidadeTempo.Meses]: { label: 'Meses', singular: 'mês' },
  [TipoUnidadeTempo.Anos]: { label: 'Anos', singular: 'ano' }
}

export function BlocoVigencia({
  dados = {},
  onChange,
  contractTerms,
  errors = {},
  disabled = false,
  required = false,
  vigenciaOriginal
}: BlocoVigenciaProps) {
  const [calculoAutomatico, setCalculoAutomatico] = useState(true)
  const [novaDataCalculada, setNovaDataCalculada] = useState<string>('')

  // Calcular nova data baseada nos parâmetros
  const calcularNovaData = useCallback(() => {
    if (!vigenciaOriginal?.dataFim || !dados.valorTempo || !dados.tipoUnidade) {
      return ''
    }

    const dataBase = new Date(vigenciaOriginal.dataFim)
    const valor = dados.valorTempo
    const unidade = dados.tipoUnidade

    const novaData = new Date(dataBase)

    if (dados.operacao === (OperacaoVigencia.Acrescentar as number)) {
      switch (unidade) {
        case TipoUnidadeTempo.Dias as number:
          novaData.setDate(novaData.getDate() + valor)
          break
        case TipoUnidadeTempo.Meses as number:
          novaData.setMonth(novaData.getMonth() + valor)
          break
        case TipoUnidadeTempo.Anos as number:
          novaData.setFullYear(novaData.getFullYear() + valor)
          break
      }
    } else if (dados.operacao === (OperacaoVigencia.Diminuir as number)) {
      switch (unidade) {
        case TipoUnidadeTempo.Dias as number:
          novaData.setDate(novaData.getDate() - valor)
          break
        case TipoUnidadeTempo.Meses as number:
          novaData.setMonth(novaData.getMonth() - valor)
          break
        case TipoUnidadeTempo.Anos as number:
          novaData.setFullYear(novaData.getFullYear() - valor)
          break
      }
    }

    return novaData.toISOString().split('T')[0]
  }, [vigenciaOriginal, dados.valorTempo, dados.tipoUnidade, dados.operacao])

  // Atualizar data calculada quando parâmetros mudarem
  useEffect(() => {
    if (calculoAutomatico) {
      const dataCalculada = calcularNovaData()
      setNovaDataCalculada(dataCalculada)
      
      if (dataCalculada && dataCalculada !== dados.novaDataFinal) {
        onChange({ ...dados, novaDataFinal: dataCalculada } as IBlocoVigencia)
      }
    }
  }, [dados, onChange, calculoAutomatico, calcularNovaData])

  const handleFieldChange = useCallback((field: keyof IBlocoVigencia, value: unknown) => {
    const novosDados = {
      ...dados,
      [field]: value
    }

    // Limpar campos desnecessários baseado na operação
    if (field === 'operacao') {
      if (value === (OperacaoVigencia.SuspenderIndeterminado as number)) {
        novosDados.isIndeterminado = true
        novosDados.valorTempo = undefined
        novosDados.tipoUnidade = undefined
        novosDados.novaDataFinal = undefined
      } else {
        novosDados.isIndeterminado = false
        if (value === (OperacaoVigencia.Substituir as number)) {
          novosDados.valorTempo = undefined
          novosDados.tipoUnidade = undefined
        }
      }
    }

    onChange(novosDados as IBlocoVigencia)
  }, [dados, onChange])

  const handleCalculoToggle = useCallback((ativo: boolean) => {
    setCalculoAutomatico(ativo)
    if (!ativo && novaDataCalculada) {
      handleFieldChange('novaDataFinal', novaDataCalculada)
    }
  }, [novaDataCalculada, handleFieldChange])

  // Verificar se os campos obrigatórios estão preenchidos
  const camposObrigatoriosPreenchidos = useMemo(() => {
    if (dados.operacao === undefined) return false
    
    if (dados.operacao === (OperacaoVigencia.SuspenderIndeterminado as number)) {
      return dados.isIndeterminado === true
    }
    
    if (dados.operacao === (OperacaoVigencia.Substituir as number)) {
      return !!dados.novaDataFinal
    }
    
    return !!(dados.valorTempo && dados.tipoUnidade !== undefined)
  }, [dados])

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
        </div>
      </div>

      {/* Contexto de Vigência Atual do Contrato */}
      {contractTerms && (contractTerms.startDate || contractTerms.endDate) && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-green-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Vigência Atual do Contrato
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-green-600">Data de Início</Label>
                <p className="font-medium text-green-900">
                  {contractTerms.startDate 
                    ? <DateDisplay value={contractTerms.startDate} />
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-green-600">Data de Término</Label>
                <p className="font-medium text-green-900">
                  {contractTerms.endDate 
                    ? <DateDisplay value={contractTerms.endDate} />
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-green-600">Duração Total</Label>
                <p className="font-medium text-green-900">
                  {contractTerms.startDate && contractTerms.endDate ? (() => {
                    const inicio = new Date(contractTerms.startDate)
                    const fim = new Date(contractTerms.endDate)
                    const diffTime = fim.getTime() - inicio.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    const diffMonths = Math.floor(diffDays / 30)
                    return `${diffMonths} meses (${diffDays} dias)`
                  })() : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-green-600">Status</Label>
                <p className={cn(
                  'font-medium flex items-center gap-1',
                  contractTerms.isActive ? 'text-green-700' : 'text-red-700'
                )}>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    contractTerms.isActive ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  {contractTerms.isActive ? 'Ativo' : 'Vencido'}
                </p>
              </div>
            </div>
            {contractTerms.endDate && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <Label className="text-xs text-green-600">Tempo Restante</Label>
                <p className="font-medium text-green-900">
                  {(() => {
                    const hoje = new Date()
                    const fim = new Date(contractTerms.endDate)
                    const diffTime = fim.getTime() - hoje.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    if (diffDays < 0) {
                      return `Vencido há ${Math.abs(diffDays)} dias`
                    } else if (diffDays <= 30) {
                      return `${diffDays} dias (vencimento próximo)`
                    } else {
                      const diffMonths = Math.floor(diffDays / 30)
                      return `${diffMonths} meses (${diffDays} dias)`
                    }
                  })()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparação: Vigência Atual vs. Nova Vigência */}
      {contractTerms && dados.operacao !== undefined && dados.operacao !== OperacaoVigencia.SuspenderIndeterminado && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900">Comparação de Vigências</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Data de Término Atual</Label>
                <p className="font-medium text-lg text-gray-900">
                  {contractTerms.endDate 
                    ? <DateDisplay value={contractTerms.endDate} />
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">
                  {dados.operacao === OperacaoVigencia.Acrescentar ? 'Extensão' :
                   dados.operacao === OperacaoVigencia.Diminuir ? 'Redução' : 
                   dados.operacao === OperacaoVigencia.Substituir ? 'Nova Data' : 'Alteração'}
                </Label>
                <p className={cn(
                  'font-medium text-lg',
                  dados.operacao === OperacaoVigencia.Acrescentar ? 'text-green-600' :
                  dados.operacao === OperacaoVigencia.Diminuir ? 'text-red-600' : 'text-blue-600'
                )}>
                  {dados.operacao === OperacaoVigencia.Substituir && dados.novaDataFinal ? 
                    <DateDisplay value={dados.novaDataFinal} /> :
                   (dados.valorTempo && dados.tipoUnidade !== undefined) ?
                    `${dados.valorTempo} ${UNIDADES_TEMPO_CONFIG[dados.tipoUnidade]?.label?.toLowerCase()}` : 
                    'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Nova Data de Término</Label>
                <p className={cn(
                  'font-medium text-lg',
                  dados.operacao === OperacaoVigencia.Acrescentar ? 'text-green-600' :
                  dados.operacao === OperacaoVigencia.Diminuir ? 'text-red-600' : 'text-blue-600'
                )}>
                  {novaDataCalculada ? <DateDisplay value={novaDataCalculada} /> : 'N/A'}
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
            <Clock className="h-4 w-4" />
            Tipo de Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Operação de vigência *</Label>
            <Select 
              value={dados.operacao?.toString() || ''} 
              onValueChange={(value) => handleFieldChange('operacao', parseInt(value) as OperacaoVigencia)}
              disabled={disabled}
            >
              <SelectTrigger className={cn(errors.operacao && 'border-red-500')}>
                <SelectValue placeholder="Selecione o tipo de operação" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OPERACOES_CONFIG).map(([key, config]) => {
                  const Icon = config.icone
                  return (
                    <SelectItem 
                      key={key} 
                      value={key}
                      disabled={config.disabled}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          "h-4 w-4",
                          config.disabled && "text-gray-400"
                        )} />
                        <span className={cn(
                          config.disabled && "text-gray-400"
                        )}>
                          {config.label}
                        </span>
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
            {/* Suspensão indeterminada */}
            {dados.operacao === (OperacaoVigencia.SuspenderIndeterminado as number) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="indeterminado"
                    checked={dados.isIndeterminado || false}
                    onCheckedChange={(checked) => handleFieldChange('isIndeterminado', checked)}
                    disabled={disabled}
                  />
                  <Label htmlFor="indeterminado" className="font-medium">
                    Suspensão por tempo indeterminado
                  </Label>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-md">
                  <p className="text-sm text-amber-800">
                    <Info className="h-4 w-4 inline mr-1" />
                    Para suspensão indeterminada, não é necessário especificar tempo ou nova data.
                  </p>
                </div>
              </div>
            )}

            {/* Substituição de data */}
            {dados.operacao === (OperacaoVigencia.Substituir as number) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nova-data-final">Nova data final *</Label>
                  <Input
                    id="nova-data-final"
                    type="date"
                    value={dados.novaDataFinal || ''}
                    onChange={(e) => handleFieldChange('novaDataFinal', e.target.value)}
                    disabled={disabled}
                    className={cn(errors.novaDataFinal && 'border-red-500')}
                  />
                  {errors.novaDataFinal && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.novaDataFinal}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operações com tempo (Acrescentar/Diminuir/Suspender Determinado) */}
            {[OperacaoVigencia.Acrescentar as number, OperacaoVigencia.Diminuir as number, OperacaoVigencia.SuspenderDeterminado as number].includes(dados.operacao as number) && (
              <div className="space-y-6">
                {/* Configuração do tempo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor-tempo">
                      {dados.operacao === (OperacaoVigencia.SuspenderDeterminado as number) ? 'Período de suspensão' : 'Quantidade de tempo'} *
                    </Label>
                    <Input
                      id="valor-tempo"
                      type="number"
                      min="1"
                      value={dados.valorTempo || ''}
                      onChange={(e) => handleFieldChange('valorTempo', parseInt(e.target.value) || undefined)}
                      disabled={disabled}
                      className={cn(errors.valorTempo && 'border-red-500')}
                      placeholder="Ex: 6"
                    />
                    {errors.valorTempo && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.valorTempo}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Unidade de tempo *</Label>
                    <Select 
                      value={dados.tipoUnidade?.toString() || ''} 
                      onValueChange={(value) => handleFieldChange('tipoUnidade', parseInt(value) as TipoUnidadeTempo)}
                      disabled={disabled}
                    >
                      <SelectTrigger className={cn(errors.tipoUnidade && 'border-red-500')}>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIDADES_TEMPO_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipoUnidade && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.tipoUnidade}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cálculo automático da nova data */}
                {dados.operacao !== (OperacaoVigencia.SuspenderDeterminado as number) && vigenciaOriginal && (
                  <div className="space-y-4">
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Nova data de término</Label>
                        <p className="text-xs text-gray-600">
                          {calculoAutomatico ? 'Calculada automaticamente' : 'Definida manualmente'}
                        </p>
                      </div>
                      
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

                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={calculoAutomatico ? novaDataCalculada : (dados.novaDataFinal || '')}
                        onChange={(e) => handleFieldChange('novaDataFinal', e.target.value)}
                        disabled={disabled || calculoAutomatico}
                        className={cn(
                          calculoAutomatico && 'bg-gray-50',
                          errors.novaDataFinal && 'border-red-500'
                        )}
                      />
                      
                      {vigenciaOriginal && dados.valorTempo && dados.tipoUnidade !== undefined && (
                        <div className="bg-blue-50 p-3 rounded-md text-sm">
                          <div className="space-y-1 text-blue-800">
                            <div><strong>Data atual de término:</strong> <DateDisplay value={vigenciaOriginal.dataFim} /></div>
                            <div>
                              <strong>Operação:</strong> {OPERACOES_CONFIG[dados.operacao].label} {dados.valorTempo} {UNIDADES_TEMPO_CONFIG[dados.tipoUnidade].singular}{dados.valorTempo > 1 ? 's' : ''}
                            </div>
                            <div><strong>Nova data de término:</strong> {novaDataCalculada ? <DateDisplay value={novaDataCalculada} /> : 'Calculando...'}</div>
                          </div>
                        </div>
                      )}

                      {errors.novaDataFinal && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.novaDataFinal}
                        </div>
                      )}
                    </div>
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
                placeholder="Informações adicionais sobre a alteração de vigência..."
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
    </div>
  )
}