import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Users,
  Search,
  Plus,
  X,
  Building2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

import { useFornecedoresResumo } from '@/modules/Empresas/hooks/use-empresas'
import type { 
  BlocoFornecedores as IBlocoFornecedores,
  FornecedorAlteracao
} from '../../../../types/alteracoes-contratuais'
import type { FornecedorResumoApi } from '@/modules/Empresas/types/empresa'

interface ContractSuppliers {
  suppliers: any[]
  mainSupplier: any
}

interface BlocoFornecedoresProps {
  dados: Partial<IBlocoFornecedores>
  onChange: (dados: IBlocoFornecedores) => void
  contractSuppliers?: ContractSuppliers
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
}

// Transformar dados da API para formato do componente
function transformSupplierApiData(supplier: FornecedorResumoApi) {
  return {
    id: supplier.id,
    cnpj: supplier.cnpj,
    razaoSocial: supplier.razaoSocial,
    ativo: supplier.status === 'Ativo'
  }
}

export function BlocoFornecedores({
  dados = {},
  onChange,
  contractSuppliers,
  errors = {},
  disabled = false,
  required = false
}: BlocoFornecedoresProps) {
  const [busca, setBusca] = useState('')

  // Carregar fornecedores disponíveis via API
  const { 
    data: fornecedoresResponse, 
    isLoading: loadingFornecedores,
    error: errorFornecedores
  } = useFornecedoresResumo({
    pesquisa: busca.length >= 2 ? busca : undefined,
    tamanhoPagina: 50
  }, {
    enabled: !disabled
  })


  // Fornecedores transformados da API
  const fornecedoresApi = useMemo(() => {
    return fornecedoresResponse?.itens?.map(transformSupplierApiData) || []
  }, [fornecedoresResponse])

  // Filtrar fornecedores disponíveis (excluir já vinculados/desvinculados)
  const fornecedoresDisponiveis = useMemo(() => {
    return fornecedoresApi.filter(f => {
      return !dados.fornecedoresVinculados?.some((v: FornecedorAlteracao) => v.empresaId === f.id) &&
        !dados.fornecedoresDesvinculados?.includes(f.id)
    })
  }, [fornecedoresApi, dados])

  // Fornecedores vinculados com dados completos
  const fornecedoresVinculadosCompletos = useMemo(() => {
    return dados.fornecedoresVinculados?.map((fv: FornecedorAlteracao) => ({
      ...fv,
      empresa: fornecedoresApi.find((f: any) => f.id === fv.empresaId)
    })) || []
  }, [dados.fornecedoresVinculados, fornecedoresApi])

  // Fornecedores desvinculados com dados completos
  const fornecedoresDesvinculadosCompletos = useMemo(() => {
    return dados.fornecedoresDesvinculados?.map((id: string) => 
      fornecedoresApi.find(f => f.id === id)
    ).filter(Boolean) || []
  }, [dados.fornecedoresDesvinculados, fornecedoresApi])

  const handleFieldChange = useCallback((field: keyof IBlocoFornecedores, value: unknown) => {
    onChange({
      ...dados,
      [field]: value
    } as IBlocoFornecedores)
  }, [dados, onChange])

  const handleVincularFornecedor = useCallback((fornecedorId: string) => {
    const novoVinculado: FornecedorAlteracao = {
      empresaId: fornecedorId,
      percentualParticipacao: 100,
      valorAtribuido: 0
    }

    const vinculados = [...(dados.fornecedoresVinculados || []), novoVinculado]
    handleFieldChange('fornecedoresVinculados', vinculados)
  }, [dados.fornecedoresVinculados, handleFieldChange])

  const handleDesvincularFornecedor = useCallback((fornecedorId: string) => {
    const desvinculados = [...(dados.fornecedoresDesvinculados || []), fornecedorId]
    handleFieldChange('fornecedoresDesvinculados', desvinculados)
  }, [dados.fornecedoresDesvinculados, handleFieldChange])

  const handleRemoverVinculado = useCallback((fornecedorId: string) => {
    const vinculados = dados.fornecedoresVinculados?.filter((f: FornecedorAlteracao) => f.empresaId !== fornecedorId) || []
    handleFieldChange('fornecedoresVinculados', vinculados)
  }, [dados.fornecedoresVinculados, handleFieldChange])

  const handleRemoverDesvinculado = useCallback((fornecedorId: string) => {
    const desvinculados = dados.fornecedoresDesvinculados?.filter((id: string) => id !== fornecedorId) || []
    handleFieldChange('fornecedoresDesvinculados', desvinculados)
  }, [dados.fornecedoresDesvinculados, handleFieldChange])

  const handleAtualizarFornecedorVinculado = useCallback((
    fornecedorId: string, 
    campo: keyof FornecedorAlteracao, 
    valor: unknown
  ) => {
    const vinculados = dados.fornecedoresVinculados?.map((f: FornecedorAlteracao) => 
      f.empresaId === fornecedorId ? { ...f, [campo]: valor } : f
    ) || []
    handleFieldChange('fornecedoresVinculados', vinculados)
  }, [dados.fornecedoresVinculados, handleFieldChange])

  const handleDefinirPrincipal = useCallback((fornecedorId: string) => {
    handleFieldChange('novoFornecedorPrincipal', fornecedorId)
  }, [handleFieldChange])

  // Verificar se tem alterações
  const temAlteracoes = useMemo(() => {
    return (dados.fornecedoresVinculados?.length || 0) > 0 || 
           (dados.fornecedoresDesvinculados?.length || 0) > 0
  }, [dados])

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
          
          {/* Contexto resumido do contrato atual */}
          {contractSuppliers?.mainSupplier && (
            <Badge variant="outline" className="text-xs">
              Principal atual: {contractSuppliers.mainSupplier.razaoSocial}
            </Badge>
          )}
        </div>
      </div>

      {/* Contexto de Fornecedores Atual do Contrato */}
      {contractSuppliers?.mainSupplier && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-orange-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Fornecedor Atual do Contrato
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-orange-600">Razão Social</Label>
                <p className="font-medium text-orange-900">{contractSuppliers.mainSupplier.razaoSocial}</p>
              </div>
              <div>
                <Label className="text-xs text-orange-600">CNPJ</Label>
                <p className="font-medium text-orange-900 font-mono">{contractSuppliers.mainSupplier.cnpj || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-xs text-orange-600">Status</Label>
                <p className="font-medium text-orange-900 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Ativo
                </p>
              </div>
            </div>
            {contractSuppliers.suppliers && contractSuppliers.suppliers.length > 1 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <Label className="text-xs text-orange-600">Fornecedores Adicionais</Label>
                <p className="text-sm text-orange-800">
                  {contractSuppliers.suppliers.length - 1} fornecedor(es) adicional(is) vinculado(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca de fornecedores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Fornecedores Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por CNPJ ou razão social..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Loading/Error States */}
          {loadingFornecedores && (() => (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Carregando fornecedores...</span>
            </div>
          ))()}
          
          {errorFornecedores && (
            <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Erro ao carregar fornecedores</span>
            </div>
          )}

          <div className="max-h-40 overflow-y-auto space-y-2">
            {!loadingFornecedores && !errorFornecedores && fornecedoresDisponiveis.map(fornecedor => (
              <div
                key={fornecedor.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{fornecedor.razaoSocial}</p>
                      <p className="text-xs text-gray-600">{fornecedor.cnpj}</p>
                    </div>
                    {!fornecedor.ativo && (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVincularFornecedor(fornecedor.id)}
                    disabled={disabled}
                    className="text-green-600 hover:text-green-700 hover:border-green-300"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Vincular
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDesvincularFornecedor(fornecedor.id)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Desvincular
                  </Button>
                </div>
              </div>
            ))}
            
            {!loadingFornecedores && !errorFornecedores && fornecedoresDisponiveis.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {busca.length >= 2 
                    ? 'Nenhum fornecedor encontrado para sua busca' 
                    : 'Digite pelo menos 2 caracteres para buscar fornecedores'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fornecedores vinculados */}
      {fornecedoresVinculadosCompletos.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <Plus className="h-4 w-4" />
              Fornecedores Vinculados ({fornecedoresVinculadosCompletos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fornecedoresVinculadosCompletos.map((fv: any, _index: number) => (
              <div key={fv.empresaId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{fv.empresa?.razaoSocial}</p>
                      <p className="text-xs text-gray-600">{fv.empresa?.cnpj}</p>
                    </div>
                    {dados.novoFornecedorPrincipal === fv.empresaId && (
                      <Badge variant="default" className="text-xs">Principal</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDefinirPrincipal(fv.empresaId)}
                      disabled={disabled}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Principal
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoverVinculado(fv.empresaId)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Participação (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={fv.percentualParticipacao || ''}
                      onChange={(e) => handleAtualizarFornecedorVinculado(
                        fv.empresaId, 
                        'percentualParticipacao', 
                        parseFloat(e.target.value) || 0
                      )}
                      disabled={disabled}
                      className="text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Valor Atribuído (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fv.valorAtribuido || ''}
                      onChange={(e) => handleAtualizarFornecedorVinculado(
                        fv.empresaId, 
                        'valorAtribuido', 
                        parseFloat(e.target.value) || 0
                      )}
                      disabled={disabled}
                      className="text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Observações</Label>
                    <Input
                      value={fv.observacoes || ''}
                      onChange={(e) => handleAtualizarFornecedorVinculado(
                        fv.empresaId, 
                        'observacoes', 
                        e.target.value
                      )}
                      disabled={disabled}
                      className="text-xs"
                      placeholder="Ex: Empresa substituta"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fornecedores desvinculados */}
      {fornecedoresDesvinculadosCompletos.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              Fornecedores Desvinculados ({fornecedoresDesvinculadosCompletos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fornecedoresDesvinculadosCompletos.map((fornecedor: any) => (
              <div
                key={fornecedor!.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{fornecedor!.razaoSocial}</p>
                    <p className="text-xs text-gray-600">{fornecedor!.cnpj}</p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoverDesvinculado(fornecedor!.id)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Observações gerais */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="observacoes-fornecedores">Observações sobre fornecedores</Label>
            <Textarea
              id="observacoes-fornecedores"
              value={dados.observacoes || ''}
              onChange={(e) => handleFieldChange('observacoes', e.target.value)}
              disabled={disabled}
              rows={3}
              className={cn(errors.observacoes && 'border-red-500')}
              placeholder="Justificativa para as alterações de fornecedores (ex: substituição por falência, incorporação empresarial, etc.)"
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
    </div>
  )
}