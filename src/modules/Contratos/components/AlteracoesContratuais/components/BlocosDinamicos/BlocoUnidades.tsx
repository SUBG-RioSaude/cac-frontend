import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Building2,
  Search,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react'

import { useUnidades, useBuscarUnidades } from '@/modules/Unidades/hooks/use-unidades'
import type { BlocoUnidades as IBlocoUnidades, UnidadeVinculada } from '../../../../types/alteracoes-contratuais'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'
import { LinkedUnitsManager } from './LinkedUnitsManager'
import { UnlinkedUnitsManager } from './UnlinkedUnitsManager'
import { UnitValueEditor } from './UnitValueEditor'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
  valorAtual?: number
  __editMode?: boolean
}

interface ContractUnits {
  demandingUnit: string | null
  managingUnit: string | null
  linkedUnits: TransformedUnidade[]
}

interface BlocoUnidadesProps {
  dados: Partial<IBlocoUnidades>
  onChange: (dados: IBlocoUnidades) => void
  contractUnits?: ContractUnits
  contractValue?: number
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
}

// Transformar dados da API para formato do componente
function transformUnidadeApiData(unidade: UnidadeSaudeApi): TransformedUnidade {
  return {
    id: unidade.id,
    codigo: unidade.sigla || `UN${unidade.id.slice(-3)}`,
    nome: unidade.nome,
    tipo: unidade.cap?.nome || 'Unidade',
    endereco: unidade.endereco ? `${unidade.endereco}, ${unidade.bairro || ''}`.trim().replace(/,$/, '') : 'Endereço não informado',
    ativo: unidade.ativo
  }
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700',
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  'Unidade': 'bg-gray-100 text-gray-700',
}

export function BlocoUnidades({
  dados = {},
  onChange,
  contractUnits,
  contractValue,
  errors = {},
  disabled = false,
  required = false
}: BlocoUnidadesProps) {
  const [busca, setBusca] = useState('')
  const [valueEditorUnit, setValueEditorUnit] = useState<TransformedUnidade | null>(null)

  // Carregar unidades via API (busca ou lista)
  const shouldSearch = busca.length >= 2
  
  const { 
    data: unidadesBusca, 
    isLoading: loadingBusca,
    error: errorBusca
  } = useBuscarUnidades(busca, {
    enabled: shouldSearch && !disabled
  })
  
  const {
    data: unidadesResponse,
    isLoading: loadingUnidades,
    error: errorUnidades  
  } = useUnidades({
    tamanhoPagina: 50
  }, {
    enabled: !shouldSearch && !disabled
  })

  // Unidades da API transformadas
  const unidadesApi = useMemo(() => {
    const unidades = shouldSearch ? unidadesBusca : unidadesResponse?.dados
    return unidades?.map(transformUnidadeApiData) || []
  }, [shouldSearch, unidadesBusca, unidadesResponse])

  // Unidades já vinculadas ao contrato atual (disponíveis para desvincular)
  const unidadesJaVinculadas = useMemo(() => {
    if (!contractUnits?.linkedUnits) return []
    
    // Filtrar unidades já vinculadas que não estão nas desvinculadas
    return contractUnits.linkedUnits.filter(u => 
      !dados.unidadesDesvinculadas?.includes(u.id)
    )
  }, [contractUnits, dados.unidadesDesvinculadas])

  // Filtrar unidades disponíveis para vincular (excluir já vinculadas no contrato atual e nas alterações)
  const unidadesDisponiveis = useMemo(() => {
    const jaVinculadasIds = contractUnits?.linkedUnits?.map(u => u.id) || []
    const vinculadasAlteracoes = dados.unidadesVinculadas?.map(uv => uv.unidadeSaudeId) || []
    
    return unidadesApi.filter(u => {
      return !jaVinculadasIds.includes(u.id) &&
        !vinculadasAlteracoes.includes(u.id) &&
        !dados.unidadesDesvinculadas?.includes(u.id)
    })
  }, [unidadesApi, contractUnits, dados])

  // Função auxiliar para obter detalhes da unidade
  const getUnitDetails = useCallback((id: string) => {
    return unidadesApi.find(u => u.id === id)
  }, [unidadesApi])

  // Cálculos de valores para validação de 100%
  const valorCalculations = useMemo(() => {
    // Valor das unidades já vinculadas no contrato atual
    const valorJaVinculado = unidadesJaVinculadas.reduce((sum, unit) => sum + (unit.valorAtual || 0), 0)
    
    // Valor das novas unidades sendo vinculadas nas alterações
    const valorNovasVinculadas = dados.unidadesVinculadas?.reduce((sum, unit) => sum + unit.valorAtribuido, 0) || 0
    
    // Valor das unidades sendo desvinculadas (precisa ser subtraído)
    const valorDesvinculado = dados.unidadesDesvinculadas?.reduce((sum, unitId) => {
      const unidade = unidadesJaVinculadas.find(u => u.id === unitId)
      return sum + (unidade?.valorAtual || 0)
    }, 0) || 0
    
    // Total distribuído após as alterações
    const valorTotalDistribuido = valorJaVinculado + valorNovasVinculadas - valorDesvinculado
    
    // Percentual em relação ao valor total do contrato
    const percentualDistribuido = contractValue ? (valorTotalDistribuido / contractValue) * 100 : 0
    
    // Valor restante para atingir 100%
    const valorRestante = contractValue ? contractValue - valorTotalDistribuido : 0
    
    return {
      valorJaVinculado,
      valorNovasVinculadas,
      valorDesvinculado,
      valorTotalDistribuido,
      percentualDistribuido,
      valorRestante,
      isCompleto: Math.abs(valorRestante) < 0.01 // Considera completo se diferença for menor que 1 centavo
    }
  }, [unidadesJaVinculadas, dados.unidadesVinculadas, dados.unidadesDesvinculadas, contractValue])

  // Manter compatibilidade com código existente
  const currentAllocatedValue = valorCalculations.valorNovasVinculadas

  const handleFieldChange = useCallback((field: keyof IBlocoUnidades, value: unknown) => {
    onChange({
      ...dados,
      [field]: value
    } as IBlocoUnidades)
  }, [dados, onChange])

  const handleVincularComValor = useCallback((unidade: TransformedUnidade) => {
    setValueEditorUnit(unidade)
  }, [])

  const handleSaveLinkedUnit = useCallback((unidadeVinculada: UnidadeVinculada) => {
    const vinculadas = [...(dados.unidadesVinculadas || []), unidadeVinculada]
    handleFieldChange('unidadesVinculadas', vinculadas)
    setValueEditorUnit(null)
  }, [dados.unidadesVinculadas, handleFieldChange])

  const handleUpdateLinkedUnits = useCallback((unidades: UnidadeVinculada[]) => {
    handleFieldChange('unidadesVinculadas', unidades)
  }, [handleFieldChange])

  const handleDesvincularUnidade = useCallback((unidadeId: string) => {
    const desvinculadas = [...(dados.unidadesDesvinculadas || []), unidadeId]
    handleFieldChange('unidadesDesvinculadas', desvinculadas)
  }, [dados.unidadesDesvinculadas, handleFieldChange])

  const handleUpdateUnlinkedUnits = useCallback((unidades: string[]) => {
    handleFieldChange('unidadesDesvinculadas', unidades)
  }, [handleFieldChange])

  const handleAlterarValorUnidade = useCallback((unidade: TransformedUnidade) => {
    setValueEditorUnit({
      ...unidade,
      __editMode: true // flag interna para identificar modo de edição
    } as TransformedUnidade & { __editMode?: boolean })
  }, [])

  // Verificar se tem alterações
  const temAlteracoes = useMemo(() => {
    return (dados.unidadesVinculadas?.length || 0) > 0 || 
           (dados.unidadesDesvinculadas?.length || 0) > 0
  }, [dados])

  // Contar por tipo (simplificado)
  const contagemPorTipo = useMemo(() => {
    const vinculadas = dados.unidadesVinculadas?.length || 0
    const desvinculadas = dados.unidadesDesvinculadas?.length || 0
    return { vinculadas, desvinculadas }
  }, [dados])

  // Estado de loading
  const isLoading = shouldSearch ? loadingBusca : loadingUnidades
  const hasError = shouldSearch ? errorBusca : errorUnidades

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={temAlteracoes ? 'default' : 'secondary'}>
            {temAlteracoes ? 'Configurado' : 'Sem alterações'}
          </Badge>
          {required && !temAlteracoes && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Obrigatório
            </Badge>
          )}
          
          {/* Resumo simplificado */}
          {temAlteracoes && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                +{contagemPorTipo.vinculadas} -{contagemPorTipo.desvinculadas}
              </Badge>
              {contractValue && currentAllocatedValue > 0 && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact'
                  }).format(currentAllocatedValue)}
                </Badge>
              )}
            </div>
          )}
          
          {/* Contexto resumido do contrato atual */}
          {(contractUnits?.demandingUnit || contractUnits?.managingUnit) && (
            <div className="flex items-center gap-2">
              {contractUnits.demandingUnit && (
                <Badge variant="outline" className="text-xs">
                  Demandante: {contractUnits.demandingUnit}
                </Badge>
              )}
              {contractUnits.managingUnit && (
                <Badge variant="outline" className="text-xs">
                  Gestora: {contractUnits.managingUnit}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de Distribuição do Valor Total */}
      {contractValue && (
        <Card className={cn(
          "border-2",
          valorCalculations.isCompleto ? "bg-green-50 border-green-300" : 
          valorCalculations.percentualDistribuido > 100 ? "bg-red-50 border-red-300" : 
          "bg-yellow-50 border-yellow-300"
        )}>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Distribuição do Valor do Contrato</h4>
                <Badge className={cn(
                  "text-xs",
                  valorCalculations.isCompleto ? "bg-green-100 text-green-700" :
                  valorCalculations.percentualDistribuido > 100 ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                )}>
                  {valorCalculations.percentualDistribuido.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-gray-600">Valor Total Distribuído</Label>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(valorCalculations.valorTotalDistribuido)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Valor do Contrato</Label>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(contractValue)}
                  </p>
                </div>
                <div>
                  <Label className={cn(
                    "text-xs",
                    valorCalculations.valorRestante > 0 ? "text-red-600" : 
                    valorCalculations.valorRestante < 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {valorCalculations.valorRestante > 0 ? "Falta Distribuir" : 
                     valorCalculations.valorRestante < 0 ? "Excesso" : "✓ Completo"}
                  </Label>
                  <p className={cn(
                    "font-medium",
                    valorCalculations.valorRestante > 0 ? "text-red-700" : 
                    valorCalculations.valorRestante < 0 ? "text-red-700" : "text-green-700"
                  )}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Math.abs(valorCalculations.valorRestante))}
                  </p>
                </div>
              </div>

              {!valorCalculations.isCompleto && (
                <div className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded",
                  valorCalculations.valorRestante > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  {valorCalculations.valorRestante > 0 ? 
                    `É necessário distribuir mais ${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(valorCalculations.valorRestante)} para atingir 100% do contrato.` :
                    `O valor distribuído excede o contrato em ${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Math.abs(valorCalculations.valorRestante))}.`
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contexto de Unidades Atual do Contrato */}
      {contractUnits && (contractUnits.demandingUnit || contractUnits.managingUnit || contractUnits.linkedUnits.length > 0) && (
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-teal-900 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Unidades Vinculadas ao Contrato
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-teal-600">Unidade Demandante</Label>
                <p className="font-medium text-teal-900">
                  {contractUnits.demandingUnit || 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-teal-600">Unidade Gestora</Label>
                <p className="font-medium text-teal-900">
                  {contractUnits.managingUnit || 'Não informado'}
                </p>
              </div>
            </div>
            {contractUnits.linkedUnits && contractUnits.linkedUnits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-teal-200">
                <Label className="text-xs text-teal-600">Unidades Vinculadas Adicionais</Label>
                <p className="text-sm text-teal-800">
                  {contractUnits.linkedUnits.length} unidade(s) adicional(is) vinculada(s) ao contrato
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {contractUnits.linkedUnits.slice(0, 3).map((unit: TransformedUnidade, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs bg-teal-100 text-teal-700">
                      {unit.nome || `Unidade ${index + 1}`}
                    </Badge>
                  ))}
                  {contractUnits.linkedUnits.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-teal-100 text-teal-700">
                      +{contractUnits.linkedUnits.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Unidades Já Vinculadas ao Contrato */}
      {unidadesJaVinculadas.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <Building2 className="h-4 w-4" />
              Unidades Já Vinculadas ({unidadesJaVinculadas.length})
            </CardTitle>
            <p className="text-sm text-orange-600">
              Unidades que já estão vinculadas ao contrato. Você pode desvinculá-las ou alterar seus valores de consumo.
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {unidadesJaVinculadas.map(unidade => (
                <div
                  key={unidade.id}
                  className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <p className="font-medium text-sm truncate">{unidade.nome}</p>
                      {unidade.codigo && (
                        <span className="text-xs text-gray-500 font-mono">({unidade.codigo})</span>
                      )}
                    </div>
                    <div className="text-xs text-green-700 font-medium">
                      Valor atual: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(unidade.valorAtual || 0)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlterarValorUnidade(unidade)}
                      disabled={disabled}
                      className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Alterar Valor</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDesvincularUnidade(unidade.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Desvincular</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca de unidades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Unidades Disponíveis para Vincular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, sigla, código ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Loading/Error States */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Carregando unidades...</span>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Erro ao carregar unidades</span>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-2">
            {!isLoading && !hasError && unidadesDisponiveis.map(unidade => (
              <div
                key={unidade.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', CORES_TIPO[unidade.tipo as keyof typeof CORES_TIPO])}
                    >
                      {unidade.tipo}
                    </Badge>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{unidade.nome}</p>
                      <span className="text-xs text-gray-500 font-mono">{unidade.codigo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{unidade.endereco}</span>
                    </div>
                    {!unidade.ativo && (
                      <Badge variant="secondary" className="text-xs mt-1">Inativo</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVincularComValor(unidade)}
                    disabled={disabled}
                    className="text-green-600 hover:text-green-700 hover:border-green-300"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Vincular com Valor</span>
                  </Button>
                </div>
              </div>
            ))}
            
            {!isLoading && !hasError && unidadesDisponiveis.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {busca.length >= 2 
                    ? 'Nenhuma unidade encontrada para sua busca' 
                    : 'Digite pelo menos 2 caracteres para buscar unidades'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unidades vinculadas com valor */}
      <LinkedUnitsManager
        unidadesVinculadas={dados.unidadesVinculadas || []}
        onChange={handleUpdateLinkedUnits}
        getUnitDetails={getUnitDetails}
        disabled={disabled}
        errors={errors}
        contractValue={contractValue}
      />

      {/* Unidades desvinculadas */}
      <UnlinkedUnitsManager
        unidadesDesvinculadas={dados.unidadesDesvinculadas || []}
        onChange={handleUpdateUnlinkedUnits}
        getUnitDetails={getUnitDetails}
        disabled={disabled}
        errors={errors}
      />

      {/* Observações */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="observacoes-unidades">Observações sobre unidades</Label>
            <Textarea
              id="observacoes-unidades"
              value={dados.observacoes || ''}
              onChange={(e) => handleFieldChange('observacoes', e.target.value)}
              disabled={disabled}
              rows={3}
              className={cn(errors.observacoes && 'border-red-500')}
              placeholder="Justificativa para inclusão/exclusão de unidades (ex: ampliação da cobertura, fechamento de unidade, etc.)"
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

      {/* Resumo final */}
      {temAlteracoes && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Resumo das Alterações</h4>
            <div className="space-y-1 text-blue-800">
              {(dados.unidadesVinculadas?.length || 0) > 0 && (
                <div>• {dados.unidadesVinculadas!.length} unidade(s) serão vinculadas ao contrato</div>
              )}
              {(dados.unidadesDesvinculadas?.length || 0) > 0 && (
                <div>• {dados.unidadesDesvinculadas!.length} unidade(s) serão desvinculadas do contrato</div>
              )}
              {contractValue && currentAllocatedValue > 0 && (
                <div>• Valor total atribuído: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(currentAllocatedValue)}</div>
              )}
              <div className="mt-2 text-xs text-blue-600">
                Total de alterações: {(dados.unidadesVinculadas?.length || 0) + (dados.unidadesDesvinculadas?.length || 0)} unidades
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição de valor */}
      <UnitValueEditor
        isOpen={!!valueEditorUnit}
        onClose={() => setValueEditorUnit(null)}
        unit={valueEditorUnit ? (({ __editMode, ...rest }) => rest)(valueEditorUnit) : null}
        onSave={handleSaveLinkedUnit}
        contractValue={contractValue}
        valorRestante={valorCalculations.valorRestante}
        disabled={disabled}
        mode={valueEditorUnit?.__editMode ? 'edit' : 'create'}
        existingValue={valueEditorUnit?.__editMode ? valueEditorUnit?.valorAtual || 0 : 0}
      />
    </div>
  )
}