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
  Plus,
  X,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react'

import { useUnidades, useBuscarUnidades } from '@/modules/Unidades/hooks/use-unidades'
import type { BlocoUnidades as IBlocoUnidades } from '../../../../types/alteracoes-contratuais'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
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
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
}

// Transformar dados da API para formato do componente
function transformUnidadeApiData(unidade: UnidadeSaudeApi): TransformedUnidade {
  return {
    id: unidade.id,
    codigo: unidade.sigla || `UN${unidade.id.slice(-3)}`, // Usar sigla ou gerar código
    nome: unidade.nome,
    tipo: unidade.cap?.nome || 'Unidade', // Usar CAP como tipo
    endereco: unidade.endereco ? `${unidade.endereco}, ${unidade.bairro || ''}`.trim().replace(/,$/, '') : 'Endereço não informado',
    ativo: unidade.ativo
  }
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700',
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  'Unidade': 'bg-gray-100 text-gray-700', // Fallback
  // Adicionar mais tipos conforme necessário
}

export function BlocoUnidades({
  dados = {},
  onChange,
  contractUnits,
  errors = {},
  disabled = false,
  required = false
}: BlocoUnidadesProps) {
  const [busca, setBusca] = useState('')

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

  // Filtrar unidades disponíveis (excluir já vinculadas/desvinculadas)
  const unidadesDisponiveis = useMemo(() => {
    return unidadesApi.filter(u => {
      return !dados.unidadesVinculadas?.includes(u.id) &&
        !dados.unidadesDesvinculadas?.includes(u.id)
    })
  }, [unidadesApi, dados])

  // Unidades vinculadas com dados completos
  const unidadesVinculadasCompletas = useMemo(() => {
    return dados.unidadesVinculadas?.map((id: string) => 
      unidadesApi.find((u: TransformedUnidade) => u.id === id)
    ).filter((u): u is TransformedUnidade => Boolean(u)) || []
  }, [dados.unidadesVinculadas, unidadesApi])

  // Unidades desvinculadas com dados completos
  const unidadesDesvinculadasCompletas = useMemo(() => {
    return dados.unidadesDesvinculadas?.map((id: string) => 
      unidadesApi.find((u: TransformedUnidade) => u.id === id)
    ).filter((u): u is TransformedUnidade => Boolean(u)) || []
  }, [dados.unidadesDesvinculadas, unidadesApi])

  const handleFieldChange = useCallback((field: keyof IBlocoUnidades, value: unknown) => {
    onChange({
      ...dados,
      [field]: value
    } as IBlocoUnidades)
  }, [dados, onChange])

  const handleVincularUnidade = useCallback((unidadeId: string) => {
    const vinculadas = [...(dados.unidadesVinculadas || []), unidadeId]
    handleFieldChange('unidadesVinculadas', vinculadas)
  }, [dados.unidadesVinculadas, handleFieldChange])

  const handleDesvincularUnidade = useCallback((unidadeId: string) => {
    const desvinculadas = [...(dados.unidadesDesvinculadas || []), unidadeId]
    handleFieldChange('unidadesDesvinculadas', desvinculadas)
  }, [dados.unidadesDesvinculadas, handleFieldChange])

  const handleRemoverVinculada = useCallback((unidadeId: string) => {
    const vinculadas = dados.unidadesVinculadas?.filter((id: string) => id !== unidadeId) || []
    handleFieldChange('unidadesVinculadas', vinculadas)
  }, [dados.unidadesVinculadas, handleFieldChange])

  const handleRemoverDesvinculada = useCallback((unidadeId: string) => {
    const desvinculadas = dados.unidadesDesvinculadas?.filter((id: string) => id !== unidadeId) || []
    handleFieldChange('unidadesDesvinculadas', desvinculadas)
  }, [dados.unidadesDesvinculadas, handleFieldChange])

  // Verificar se tem alterações
  const temAlteracoes = useMemo(() => {
    return (dados.unidadesVinculadas?.length || 0) > 0 || 
           (dados.unidadesDesvinculadas?.length || 0) > 0
  }, [dados])

  // Contar por tipo
  const contagemPorTipo = useMemo(() => {
    const contagem: Record<string, { vinculadas: number, desvinculadas: number }> = {}
    
    unidadesVinculadasCompletas.forEach((unidade: TransformedUnidade) => {
      const tipo = unidade.tipo
      if (!contagem[tipo]) contagem[tipo] = { vinculadas: 0, desvinculadas: 0 }
      contagem[tipo].vinculadas++
    })
    
    unidadesDesvinculadasCompletas.forEach((unidade: TransformedUnidade) => {
      const tipo = unidade.tipo
      if (!contagem[tipo]) contagem[tipo] = { vinculadas: 0, desvinculadas: 0 }
      contagem[tipo].desvinculadas++
    })
    
    return contagem
  }, [unidadesVinculadasCompletas, unidadesDesvinculadasCompletas])

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
          
          {/* Resumo por tipo */}
          {Object.keys(contagemPorTipo).length > 0 && (
            <div className="flex items-center gap-1">
              {Object.entries(contagemPorTipo).map(([tipo, contagem]) => (
                <Badge key={tipo} variant="outline" className="text-xs">
                  {tipo}: +{contagem.vinculadas} -{contagem.desvinculadas}
                </Badge>
              ))}
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

      {/* Busca de unidades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Unidades de Saúde Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou tipo..."
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
                    onClick={() => handleVincularUnidade(unidade.id)}
                    disabled={disabled}
                    className="text-green-600 hover:text-green-700 hover:border-green-300"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Vincular</span>
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

      {/* Unidades vinculadas */}
      {unidadesVinculadasCompletas.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <Plus className="h-4 w-4" />
              Unidades Vinculadas ({unidadesVinculadasCompletas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unidadesVinculadasCompletas.map((unidade: TransformedUnidade) => (
                <div
                  key={unidade.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', CORES_TIPO[unidade.tipo as keyof typeof CORES_TIPO])}
                    >
                      {unidade.tipo}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{unidade.nome}</p>
                      <p className="text-xs text-gray-600 font-mono">{unidade.codigo}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoverVinculada(unidade.id)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unidades desvinculadas */}
      {unidadesDesvinculadasCompletas.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              Unidades Desvinculadas ({unidadesDesvinculadasCompletas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unidadesDesvinculadasCompletas.map((unidade: TransformedUnidade) => (
                <div
                  key={unidade.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', CORES_TIPO[unidade.tipo as keyof typeof CORES_TIPO])}
                    >
                      {unidade.tipo}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{unidade.nome}</p>
                      <p className="text-xs text-gray-600 font-mono">{unidade.codigo}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoverDesvinculada(unidade.id)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="mt-2 text-xs text-blue-600">
                Total de alterações: {(dados.unidadesVinculadas?.length || 0) + (dados.unidadesDesvinculadas?.length || 0)} unidades
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}