import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, cnpjUtils } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
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
} from 'lucide-react'

import { useFornecedoresResumo } from '@/modules/Empresas/hooks/use-empresas'
import type {
  BlocoFornecedores as IBlocoFornecedores,
  FornecedorAlteracao,
} from '../../../../types/alteracoes-contratuais'
import type { FornecedorResumoApi } from '@/modules/Empresas/types/empresa'

interface TransformedFornecedor {
  id: string
  cnpj: string
  razaoSocial: string
  ativo: boolean
}

interface FornecedorVinculado extends FornecedorAlteracao {
  empresa?: TransformedFornecedor
}

interface ContractSuppliers {
  suppliers: FornecedorResumoApi[]
  mainSupplier: FornecedorResumoApi
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
function transformSupplierApiData(
  supplier: FornecedorResumoApi,
): TransformedFornecedor {
  return {
    id: supplier.id,
    cnpj: supplier.cnpj,
    razaoSocial: supplier.razaoSocial,
    ativo: supplier.status === 'Ativo',
  }
}

export function BlocoFornecedores({
  dados = {},
  onChange,
  contractSuppliers,
  errors = {},
  disabled = false,
  required = false,
}: BlocoFornecedoresProps) {
  const [busca, setBusca] = useState('')
  const simplifiedMode = Boolean(contractSuppliers?.mainSupplier)
  const debouncedBusca = useDebounce(busca, 800)
  const fornecedoresQueryFiltros = useMemo(
    () => ({
      pesquisa: debouncedBusca.length >= 3 ? debouncedBusca : undefined,
      tamanhoPagina: 50,
    }),
    [debouncedBusca],
  )

  // Carregar fornecedores disponíveis via API
  const {
    data: fornecedoresResponse,
    isLoading: loadingFornecedores,
    error: errorFornecedores,
  } = useFornecedoresResumo(fornecedoresQueryFiltros, {
    enabled: !disabled && debouncedBusca.length >= 3,
    keepPreviousData: true,
    refetchOnMount: false,
  })

  const fornecedoresLoading = Boolean(loadingFornecedores)

  // Fornecedores transformados da API
  const fornecedoresApi = useMemo(() => {
    return fornecedoresResponse?.itens?.map(transformSupplierApiData) || []
  }, [fornecedoresResponse])

  // Filtrar fornecedores disponíveis (excluir já vinculados/desvinculados)
  const fornecedoresDisponiveis = useMemo(() => {
    const currentId = simplifiedMode
      ? contractSuppliers?.mainSupplier?.id
      : undefined
    return fornecedoresApi.filter((f) => {
      const notVinculado = !dados.fornecedoresVinculados?.some(
        (v: FornecedorAlteracao) => v.empresaId === f.id,
      )
      const notDesvinculado = !dados.fornecedoresDesvinculados?.includes(f.id)
      const notCurrent = currentId ? f.id !== currentId : true
      return notVinculado && notDesvinculado && notCurrent
    })
  }, [
    fornecedoresApi,
    dados,
    simplifiedMode,
    contractSuppliers?.mainSupplier?.id,
  ])

  // Fornecedores vinculados com dados completos
  const fornecedoresVinculadosCompletos = useMemo(() => {
    return (
      dados.fornecedoresVinculados?.map((fv: FornecedorAlteracao) => ({
        ...fv,
        empresa: fornecedoresApi.find(
          (f: TransformedFornecedor) => f.id === fv.empresaId,
        ),
      })) || []
    )
  }, [dados.fornecedoresVinculados, fornecedoresApi])

  // Fornecedores desvinculados com dados completos
  const fornecedoresDesvinculadosCompletos = useMemo(() => {
    return (
      dados.fornecedoresDesvinculados
        ?.map((id: string) =>
          fornecedoresApi.find((f: TransformedFornecedor) => f.id === id),
        )
        .filter((f): f is TransformedFornecedor => Boolean(f)) || []
    )
  }, [dados.fornecedoresDesvinculados, fornecedoresApi])

  const handleFieldChange = useCallback(
    (field: keyof IBlocoFornecedores, value: unknown) => {
      onChange({
        ...dados,
        [field]: value,
      } as IBlocoFornecedores)
    },
    [dados, onChange],
  )

  const handleVincularFornecedor = useCallback(
    (fornecedorId: string) => {
      const novoVinculado: FornecedorAlteracao = {
        empresaId: fornecedorId,
        percentualParticipacao: 100,
        valorAtribuido: 0,
      }

      if (simplifiedMode) {
        const currentId = contractSuppliers?.mainSupplier?.id
        if (currentId && fornecedorId === currentId) return

        onChange({
          ...(dados as IBlocoFornecedores),
          fornecedoresVinculados: [novoVinculado],
          fornecedoresDesvinculados: currentId ? [currentId] : [],
          novoFornecedorPrincipal: fornecedorId,
        } as IBlocoFornecedores)
      } else {
        const vinculados = [
          ...(dados.fornecedoresVinculados || []),
          novoVinculado,
        ]
        handleFieldChange('fornecedoresVinculados', vinculados)
      }
    },
    [
      dados,
      onChange,
      handleFieldChange,
      simplifiedMode,
      contractSuppliers?.mainSupplier?.id,
    ],
  )

  const handleDesvincularFornecedor = useCallback(
    (fornecedorId: string) => {
      if (simplifiedMode) {
        // Em modo simplificado, mantemos exatamente 1 desvinculado (o atual)
        const currentId = contractSuppliers?.mainSupplier?.id
        handleFieldChange(
          'fornecedoresDesvinculados',
          currentId ? [currentId] : [],
        )
      } else {
        const desvinculados = [
          ...(dados.fornecedoresDesvinculados || []),
          fornecedorId,
        ]
        handleFieldChange('fornecedoresDesvinculados', desvinculados)
      }
    },
    [
      dados.fornecedoresDesvinculados,
      handleFieldChange,
      simplifiedMode,
      contractSuppliers?.mainSupplier?.id,
    ],
  )

  const handleRemoverVinculado = useCallback(
    (fornecedorId: string) => {
      const vinculados =
        dados.fornecedoresVinculados?.filter(
          (f: FornecedorAlteracao) => f.empresaId !== fornecedorId,
        ) || []
      handleFieldChange('fornecedoresVinculados', vinculados)
    },
    [dados.fornecedoresVinculados, handleFieldChange],
  )

  const handleRemoverDesvinculado = useCallback(
    (fornecedorId: string) => {
      const desvinculados =
        dados.fornecedoresDesvinculados?.filter(
          (id: string) => id !== fornecedorId,
        ) || []
      handleFieldChange('fornecedoresDesvinculados', desvinculados)
    },
    [dados.fornecedoresDesvinculados, handleFieldChange],
  )

  const handleAtualizarFornecedorVinculado = useCallback(
    (
      fornecedorId: string,
      campo: keyof FornecedorAlteracao,
      valor: unknown,
    ) => {
      const vinculados =
        dados.fornecedoresVinculados?.map((f: FornecedorAlteracao) =>
          f.empresaId === fornecedorId ? { ...f, [campo]: valor } : f,
        ) || []
      handleFieldChange('fornecedoresVinculados', vinculados)
    },
    [dados.fornecedoresVinculados, handleFieldChange],
  )

  const handleDefinirPrincipal = useCallback(
    (fornecedorId: string) => {
      // Em modo simplificado, sempre define automaticamente o selecionado como principal
      handleFieldChange('novoFornecedorPrincipal', fornecedorId)
    },
    [handleFieldChange],
  )

  // Verificar se tem alterações
  const temAlteracoes = useMemo(() => {
    return (
      (dados.fornecedoresVinculados?.length || 0) > 0 ||
      (dados.fornecedoresDesvinculados?.length || 0) > 0
    )
  }, [dados])
  const invalidSimplified = useMemo(() => {
    if (!simplifiedMode || !temAlteracoes) return false
    const cV = dados.fornecedoresVinculados?.length || 0
    const cD = dados.fornecedoresDesvinculados?.length || 0
    return cV !== 1 || cD !== 1
  }, [
    simplifiedMode,
    temAlteracoes,
    dados.fornecedoresVinculados,
    dados.fornecedoresDesvinculados,
  ])

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
              <AlertCircle className="mr-1 h-3 w-3" />
              Obrigatório
            </Badge>
          )}

          {invalidSimplified && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Configuração inválida
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
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="flex items-center gap-2 font-medium text-orange-900">
                <Users className="h-4 w-4" />
                Fornecedor Atual do Contrato
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <Label className="text-xs text-orange-600">Razão Social</Label>
                <p className="font-medium text-orange-900">
                  {contractSuppliers.mainSupplier.razaoSocial}
                </p>
              </div>
              <div>
                <Label className="text-xs text-orange-600">CNPJ</Label>
                <p className="font-mono font-medium text-orange-900">
                  {contractSuppliers.mainSupplier.cnpj
                    ? cnpjUtils.formatar(contractSuppliers.mainSupplier.cnpj)
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-orange-600">Status</Label>
                <p className="flex items-center gap-1 font-medium text-orange-900">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Ativo
                </p>
              </div>
            </div>
            {contractSuppliers.suppliers &&
              contractSuppliers.suppliers.length > 1 && (
                <div className="mt-3 border-t border-orange-200 pt-3">
                  <Label className="text-xs text-orange-600">
                    Fornecedores Adicionais
                  </Label>
                  <p className="text-sm text-orange-800">
                    {contractSuppliers.suppliers.length - 1} fornecedor(es)
                    adicional(is) vinculado(s)
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Busca de fornecedores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            {simplifiedMode ? 'Substituir por' : 'Fornecedores Disponíveis'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar por CNPJ ou razão social..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {fornecedoresLoading && (
            <div className="py-4 text-center text-gray-500">
              <span className="text-sm">Carregando fornecedores...</span>
            </div>
          )}

          {Boolean(errorFornecedores) && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Erro ao carregar fornecedores</span>
            </div>
          )}

          <div className="max-h-40 space-y-2 overflow-y-auto">
            {!fornecedoresLoading &&
              !errorFornecedores &&
              fornecedoresDisponiveis.length > 0 &&
              fornecedoresDisponiveis.map((fornecedor) => (
                <div
                  key={fornecedor.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {fornecedor.razaoSocial}
                        </p>
                        <p className="font-mono text-xs text-gray-600">
                          {cnpjUtils.formatar(fornecedor.cnpj)}
                        </p>
                      </div>
                      {fornecedor.ativo ? (
                        <Badge
                          variant="secondary"
                          className="border-green-200 text-xs text-green-700"
                        >
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {simplifiedMode ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVincularFornecedor(fornecedor.id)}
                        disabled={disabled}
                        className="text-blue-600 hover:border-blue-300 hover:text-blue-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Substituir
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleVincularFornecedor(fornecedor.id)
                          }
                          disabled={disabled}
                          className="text-green-600 hover:border-green-300 hover:text-green-700"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Vincular
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDesvincularFornecedor(fornecedor.id)
                          }
                          disabled={disabled}
                          className="text-red-600 hover:border-red-300 hover:text-red-700"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Desvincular
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

            {!fornecedoresLoading &&
              !errorFornecedores &&
              fornecedoresDisponiveis.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">
                    {busca.length >= 3
                      ? 'Nenhum fornecedor encontrado para sua busca'
                      : 'Digite pelo menos 3 caracteres para buscar fornecedores'}
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {simplifiedMode &&
        contractSuppliers?.mainSupplier &&
        fornecedoresVinculadosCompletos.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
            <span className="font-medium">De:</span>
            <span
              className="max-w-[240px] truncate"
              title={contractSuppliers.mainSupplier.razaoSocial}
            >
              {contractSuppliers.mainSupplier.razaoSocial}
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">Para:</span>
            <span
              className="max-w-[240px] truncate"
              title={fornecedoresVinculadosCompletos[0]?.empresa?.razaoSocial}
            >
              {fornecedoresVinculadosCompletos[0]?.empresa?.razaoSocial}
            </span>
          </div>
        )}

      {/* Fornecedor vinculado (novo principal) */}
      {fornecedoresVinculadosCompletos.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-green-700">
              <Plus className="h-4 w-4" />
              {simplifiedMode
                ? 'Novo Fornecedor (Principal)'
                : `Fornecedores Vinculados (${fornecedoresVinculadosCompletos.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fornecedoresVinculadosCompletos.map((fv: FornecedorVinculado) => (
              <div
                key={fv.empresaId}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {fv.empresa?.razaoSocial}
                      </p>
                      <p className="font-mono text-xs text-gray-600">
                        {fv.empresa?.cnpj
                          ? cnpjUtils.formatar(fv.empresa.cnpj)
                          : ''}
                      </p>
                    </div>
                    {(dados.novoFornecedorPrincipal === fv.empresaId ||
                      simplifiedMode) && (
                      <Badge variant="default" className="text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                  {!simplifiedMode && (
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
                  )}
                </div>
                {!simplifiedMode && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Participação (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={fv.percentualParticipacao || ''}
                        onChange={(e) =>
                          handleAtualizarFornecedorVinculado(
                            fv.empresaId,
                            'percentualParticipacao',
                            parseFloat(e.target.value) || 0,
                          )
                        }
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
                        onChange={(e) =>
                          handleAtualizarFornecedorVinculado(
                            fv.empresaId,
                            'valorAtribuido',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        disabled={disabled}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Observações</Label>
                      <Input
                        value={fv.observacoes || ''}
                        onChange={(e) =>
                          handleAtualizarFornecedorVinculado(
                            fv.empresaId,
                            'observacoes',
                            e.target.value,
                          )
                        }
                        disabled={disabled}
                        className="text-xs"
                        placeholder="Ex: Empresa substituta"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fornecedor desvinculado (anterior) */}
      {fornecedoresDesvinculadosCompletos.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <X className="h-4 w-4" />
              {simplifiedMode
                ? 'Fornecedor Anterior (Desvinculado)'
                : `Fornecedores Desvinculados (${fornecedoresDesvinculadosCompletos.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fornecedoresDesvinculadosCompletos.map(
              (fornecedor: TransformedFornecedor) => (
                <div
                  key={fornecedor.id}
                  className="flex items-center justify-between rounded-lg border bg-red-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {fornecedor.razaoSocial}
                      </p>
                      <p className="font-mono text-xs text-gray-600">
                        {cnpjUtils.formatar(fornecedor.cnpj)}
                      </p>
                    </div>
                  </div>
                  {!simplifiedMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoverDesvinculado(fornecedor.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações gerais */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="observacoes-fornecedores">
              Observações sobre fornecedores
            </Label>
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
