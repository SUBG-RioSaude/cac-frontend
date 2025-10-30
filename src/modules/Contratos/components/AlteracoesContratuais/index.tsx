import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Send,
  Loader2,
  MessageSquare,
  Eye,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Building2,
  Lock,
} from 'lucide-react'
import { useState, useCallback, useMemo, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CurrencyDisplay, DateDisplay } from '@/components/ui/formatters'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useEmpresasByIds } from '@/modules/Empresas/hooks/use-empresas'
import type { FornecedorResumoApi } from '@/modules/Empresas/types/empresa'

import {
  useContractContext,
  useContractFinancials,
  useContractTerms,
  useContractSuppliers,
  useContractUnits,
} from '../../hooks/use-contract-context'
import { useContractContextInvalidation } from '../../hooks/use-contract-context-invalidation'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualResponse,
  AlertaLimiteLegal,
  FornecedorAlteracao,
  TipoAlteracao,
} from '../../types/alteracoes-contratuais'
import { TIPOS_ALTERACAO_CONFIG } from '../../types/alteracoes-contratuais'

import { BlocosDinamicos } from './components/BlocosDinamicos'
import { ModalAlertaLimiteLegal } from './components/ModalAlertaLimiteLegal'
import { TipoAlteracaoSelector } from './components/TipoAlteracaoSelector'
import { useAlteracoesContratuais } from './hooks/use-alteracoes-contratuais'

interface ContractInfo {
  numeroContrato?: string
  objeto?: string
  valorTotal?: number
  dataInicio?: string
  dataTermino?: string
}

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
}

interface AlteracoesContratuaisProps {
  contratoId: string
  numeroContrato?: string
  valorOriginal?: number
  vigenciaOriginal?: {
    dataInicio: string
    dataFim: string
  }
  vigenciaFinal?: string // Data final do contrato para travar campo de publicação
  alteracaoId?: string // Para edição
  initialData?: Partial<AlteracaoContratualForm>
  onSaved?: (alteracao: AlteracaoContratualResponse) => void | Promise<void>
  onSubmitted?: (alteracao: AlteracaoContratualResponse) => void | Promise<void>
  onCancelled?: () => void
  className?: string
}

interface Etapa {
  id: string
  titulo: string
  descricao: string
  icone: React.ElementType
}

const ETAPAS: Etapa[] = [
  {
    id: 'tipos',
    titulo: 'Tipos de Alteração',
    descricao: 'Selecione os tipos de alteração contratual',
    icone: FileText,
  },
  {
    id: 'basicos',
    titulo: 'Dados Básicos',
    descricao: 'Justificativa e data de efeito',
    icone: MessageSquare,
  },
  {
    id: 'blocos',
    titulo: 'Blocos Específicos',
    descricao: 'Configure os blocos dinâmicos',
    icone: ChevronRight,
  },
  {
    id: 'revisao',
    titulo: 'Revisão',
    descricao: 'Revise antes de submeter',
    icone: Eye,
  },
]

export const AlteracoesContratuais = ({
  contratoId,
  numeroContrato,
  valorOriginal = 0,
  vigenciaFinal,
  alteracaoId,
  initialData,
  onSaved,
  onSubmitted,
  onCancelled,
  className,
}: AlteracoesContratuaisProps) => {
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [modalLimiteLegal, setModalLimiteLegal] = useState<{
    open: boolean
    alerta?: AlertaLimiteLegal
    alteracaoId?: string
  }>({ open: false })
  const [modalSucesso, setModalSucesso] = useState(false)
  const [modalErro, setModalErro] = useState<{
    open: boolean
    mensagem: string
  }>({ open: false, mensagem: '' })

  // Handler para alertas de limite legal
  const handleLimiteLegalAlert = useCallback(
    (alerta: AlertaLimiteLegal, alteracaoIdAlert: string) => {
      setModalLimiteLegal({
        open: true,
        alerta,
        alteracaoId: alteracaoIdAlert,
      })
    },
    [],
  )

  // Hooks para carregar contexto do contrato atual
  const contractContext = useContractContext(contratoId)
  const contractFinancials = useContractFinancials(contratoId)
  const contractTerms = useContractTerms(contratoId)
  const contractSuppliers = useContractSuppliers(contratoId)
  const contractUnits = useContractUnits(contratoId)

  // Hook para invalidação inteligente do contexto
  const { invalidateContext } = useContractContextInvalidation(contratoId)

  // Hook personalizado para gerenciar estado e lógica
  const {
    dados,
    isLoading,
    errors,
    alertaLimiteLegal,
    confirmacaoLimiteLegal,
    blocosObrigatorios,
    podeSubmeter,
    // resumo, - REMOVIDO: endpoint não implementado
    atualizarDados,
    validarCamposObrigatorios,
    submeterParaAprovacao,
    confirmarLimiteLegal,
  } = useAlteracoesContratuais({
    contratoId,
    valorOriginal,
    alteracaoId,
    initialData,
    onSaved,
    onSubmitted,
    onLimiteLegalAlert: handleLimiteLegalAlert,
  })

  // Inicializar dataEfeito automaticamente com vigenciaFinal quando disponível
  useEffect(() => {
    if (vigenciaFinal && !dados.dataEfeito) {
      // Converter vigenciaFinal para formato yyyy-mm-dd
      const [dataFormatada] = vigenciaFinal.split('T') // Remove parte de tempo se presente
      atualizarDados({ dataEfeito: dataFormatada })
    }
  }, [vigenciaFinal, dados.dataEfeito, atualizarDados])

  // Navegação entre etapas
  const proximaEtapa = useCallback(() => {
    // Validar etapa atual antes de avançar
    let podeAvancar = true

    switch (etapaAtual) {
      case 0: // Tipos
        if (!dados.tiposAlteracao || dados.tiposAlteracao.length === 0) {
          podeAvancar = false
        }
        break
      case 1: // Dados básicos
        if (
          !dados.dadosBasicos?.justificativa ||
          dados.dadosBasicos.justificativa.length < 10
        ) {
          podeAvancar = false
        }
        if (!dados.dataEfeito) {
          podeAvancar = false
        }
        break
      case 2: // Blocos
        podeAvancar = validarCamposObrigatorios()
        break
    }

    if (podeAvancar) {
      setEtapaAtual((prev) => Math.min(prev + 1, ETAPAS.length - 1))
    }
  }, [etapaAtual, dados, validarCamposObrigatorios])

  const etapaAnterior = useCallback(() => {
    setEtapaAtual((prev) => Math.max(prev - 1, 0))
  }, [])

  const irParaEtapa = useCallback((etapa: number) => {
    setEtapaAtual(etapa)
  }, [])

  // Progresso baseado no preenchimento
  const progresso = useMemo(() => {
    let pontos = 0
    const maxPontos = 4

    // Tipos selecionados
    if (dados.tiposAlteracao && dados.tiposAlteracao.length > 0) pontos++

    // Dados básicos
    if (
      dados.dadosBasicos?.justificativa &&
      dados.dadosBasicos.justificativa.length >= 10
    )
      pontos++

    // Blocos obrigatórios
    if (blocosObrigatorios.size === 0 || validarCamposObrigatorios()) pontos++

    // Pronto para submeter
    if (podeSubmeter) pontos++

    return (pontos / maxPontos) * 100
  }, [dados, blocosObrigatorios.size, validarCamposObrigatorios, podeSubmeter])

  // Obter nomes dos tipos de alteração selecionados
  const tiposAlteracaoNomes = useMemo(() => {
    if (!dados.tiposAlteracao || dados.tiposAlteracao.length === 0) {
      return null
    }

    return dados.tiposAlteracao
      .map((tipo: number) => {
        const config =
          TIPOS_ALTERACAO_CONFIG[tipo as keyof typeof TIPOS_ALTERACAO_CONFIG]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return config ? config.label : `Tipo ${tipo}`
      })
      .join(', ')
  }, [dados.tiposAlteracao])

  // Handlers
  const handleTiposChange = useCallback(
    (tipos: number[]) => {
      atualizarDados({ tiposAlteracao: tipos as TipoAlteracao[] })
    },
    [atualizarDados],
  )

  const handleDadosBasicosChange = useCallback(
    (campo: string, value: string) => {
      atualizarDados({
        dadosBasicos: {
          justificativa: '',
          fundamentoLegal: '',
          observacoes: '',
          ...dados.dadosBasicos,
          [campo]: value,
        },
      })
    },
    [atualizarDados, dados.dadosBasicos],
  )

  const handleSubmeter = useCallback(async () => {
    try {
      await submeterParaAprovacao()

      // Mostrar modal de sucesso
      setModalSucesso(true)

      // Callback de sucesso ao submeter (se disponível)
      // Note: onSubmitted será chamado pelo hook quando a operação for bem-sucedida
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('❌ Erro ao submeter alteração:', error)
      }
      setModalErro({
        open: true,
        mensagem:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao submeter alteração contratual.',
      })
    }
  }, [submeterParaAprovacao])

  // Handler para confirmar sucesso e redirecionar
  const handleConfirmarSucesso = useCallback(() => {
    setModalSucesso(false)
    // Redirecionar para visualização do contrato
    window.location.href = `/contratos/${contratoId}`
  }, [contratoId])

  // Handler para fechar modal de erro
  const handleFecharModalErro = useCallback(() => {
    setModalErro({ open: false, mensagem: '' })
  }, [])

  // IDs de empresas usados nos blocos de fornecedores (para revisão)
  const fornecedoresIds = useMemo(() => {
    const idsVinculados = (
      dados.blocos?.fornecedores?.fornecedoresVinculados ?? []
    ).map((f) => f.empresaId)
    const idsDesvinculados =
      dados.blocos?.fornecedores?.fornecedoresDesvinculados ?? []
    const idNovoPrincipal = dados.blocos?.fornecedores?.novoFornecedorPrincipal
    const ids = [
      ...idsVinculados,
      ...idsDesvinculados,
      ...(idNovoPrincipal ? [idNovoPrincipal] : []),
      ...(contractSuppliers.mainSupplier?.id
        ? [contractSuppliers.mainSupplier.id]
        : []),
    ].filter(Boolean)
    return Array.from(new Set(ids))
  }, [
    dados.blocos?.fornecedores?.fornecedoresVinculados,
    dados.blocos?.fornecedores?.fornecedoresDesvinculados,
    dados.blocos?.fornecedores?.novoFornecedorPrincipal,
    contractSuppliers.mainSupplier?.id,
  ])

  const empresasLookup = useEmpresasByIds(fornecedoresIds, {
    enabled: fornecedoresIds.length > 0,
  })

  const getCompanyName = useCallback(
    (empresaId: string) => {
      if (!empresaId) return '-'
      if (
        contractSuppliers.mainSupplier &&
        contractSuppliers.mainSupplier.id === empresaId
      ) {
        return contractSuppliers.mainSupplier.razaoSocial || empresaId
      }
      const fromList = contractSuppliers.suppliers.find(
        (s) => s.id === empresaId,
      )
      if (fromList?.razaoSocial) return fromList.razaoSocial
      const fetched = empresasLookup.data[empresaId]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (fetched?.razaoSocial) return fetched.razaoSocial
      return empresaId
    },
    [
      contractSuppliers.mainSupplier,
      contractSuppliers.suppliers,
      empresasLookup.data,
    ],
  )

  // Renderizar conteúdo da etapa
  const renderizarEtapa = useMemo(() => {
    switch (etapaAtual) {
      case 0: // Tipos
        return (
          <TipoAlteracaoSelector
            tiposSelecionados={dados.tiposAlteracao ?? []}
            onChange={handleTiposChange}
            disabled={isLoading}
            error={errors.tiposAlteracao}
          />
        )

      case 1: // Dados básicos
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Dados Básicos da Alteração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Justificativa */}
              <div className="space-y-2">
                <Label htmlFor="justificativa">
                  Justificativa *
                  <span className="ml-2 text-sm text-gray-500">
                    (mínimo 10 caracteres)
                  </span>
                </Label>
                <Textarea
                  id="justificativa"
                  value={dados.dadosBasicos?.justificativa ?? ''}
                  onChange={(e) =>
                    handleDadosBasicosChange('justificativa', e.target.value)
                  }
                  disabled={isLoading}
                  rows={4}
                  className={cn(
                    errors['dadosBasicos.justificativa'] && 'border-red-500',
                  )}
                  placeholder="Descreva detalhadamente a justificativa para esta alteração contratual, incluindo os motivos técnicos, legais ou operacionais que fundamentam a necessidade da modificação..."
                />
                {errors['dadosBasicos.justificativa'] && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors['dadosBasicos.justificativa']}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {(dados.dadosBasicos?.justificativa ?? '').length} caracteres
                </div>
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="fundamento-legal">Documento</Label>
                <Textarea
                  id="fundamento-legal"
                  value={dados.dadosBasicos?.fundamentoLegal ?? ''}
                  onChange={(e) =>
                    handleDadosBasicosChange('fundamentoLegal', e.target.value)
                  }
                  disabled={isLoading}
                  rows={3}
                  placeholder="Lei, decreto, regulamento ou norma que fundamenta esta alteração..."
                />
              </div>

              {/* Data da Publicação */}
              <div className="space-y-2">
                <Label htmlFor="dataEfeito" className="flex items-center gap-2">
                  Data da Publicação *
                  {vigenciaFinal && (
                    <div className="flex items-center gap-1 text-xs font-normal text-blue-600">
                      <Lock className="h-3 w-3" />
                      Travada
                    </div>
                  )}
                </Label>
                <Input
                  id="dataEfeito"
                  type="date"
                  value={dados.dataEfeito ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    atualizarDados({ dataEfeito: e.target.value })
                  }
                  disabled={isLoading || !!vigenciaFinal} // Desabilita se vigenciaFinal estiver presente
                  className={cn(
                    errors.dataEfeito && 'border-red-500',
                    vigenciaFinal &&
                      'cursor-not-allowed bg-gray-50 text-gray-700',
                  )}
                  title={
                    vigenciaFinal
                      ? 'Data definida automaticamente com base na vigência final do contrato'
                      : undefined
                  }
                />
                {vigenciaFinal && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <AlertCircle className="h-4 w-4" />
                    Data definida automaticamente pela vigência final do
                    contrato
                  </div>
                )}
                {errors.dataEfeito && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.dataEfeito}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">
                  Observações
                  <span className="ml-2 text-sm text-gray-500">(opcional)</span>
                </Label>
                <Textarea
                  id="observacoes"
                  value={dados.dadosBasicos?.observacoes ?? ''}
                  onChange={(e) =>
                    handleDadosBasicosChange('observacoes', e.target.value)
                  }
                  disabled={isLoading}
                  rows={2}
                  placeholder="Informações adicionais relevantes..."
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2: // Blocos dinâmicos
        return (
          <BlocosDinamicos
            tiposSelecionados={dados.tiposAlteracao ?? []}
            dados={dados}
            onChange={atualizarDados}
            contractContext={{
              contract: contractContext.data as ContractInfo,
              financials: {
                totalValue: contractFinancials.totalValue,
                currentBalance: contractFinancials.currentBalance,
                executedPercentage: contractFinancials.executedPercentage,
              },
              terms: {
                startDate: contractTerms.startDate,
                endDate: contractTerms.endDate,
                isActive: contractTerms.isActive,
              },
              suppliers: {
                suppliers:
                  contractSuppliers.suppliers as unknown as FornecedorResumoApi[],
                mainSupplier:
                  contractSuppliers.mainSupplier as unknown as FornecedorResumoApi,
              },
              units: {
                demandingUnit: contractUnits.demandingUnit,
                managingUnit: contractUnits.managingUnit,
                linkedUnits:
                  contractUnits.linkedUnits as unknown as TransformedUnidade[],
              },
              isLoading:
                contractContext.isLoading ||
                contractFinancials.isLoading ||
                contractTerms.isLoading ||
                contractSuppliers.isLoading ||
                contractUnits.isLoading,
            }}
            onContextChange={invalidateContext}
            errors={errors}
            disabled={isLoading}
          />
        )

      case 3: {
        // Revisão

        // Função para mapear tipo de alteração para nome descritivo
        const getTipoNome = (tipo: number): string => {
          const config =
            TIPOS_ALTERACAO_CONFIG[tipo as keyof typeof TIPOS_ALTERACAO_CONFIG]
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          return config ? config.label : `Tipo ${tipo}`
        }

        const getUnitName = (unitId: string): string => {
          // Check in linked units (array of objects with id property)
          const unit = contractUnits.linkedUnits.find((u) => u.id === unitId)
          if (unit?.nome) {
            return unit.nome
          }
          // Check if it's the demanding unit (compare IDs, return name)
          if (contractUnits.demandingUnitId === unitId) {
            return contractUnits.demandingUnit ?? unitId
          }
          // Check if it's the managing unit (compare IDs, return name)
          if (contractUnits.managingUnitId === unitId) {
            return contractUnits.managingUnit ?? unitId
          }
          return unitId
        }
        return (
          <div className="space-y-6">
            {/* Resumo geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Resumo da Alteração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Contrato
                    </Label>
                    <p className="text-sm">{numeroContrato ?? contratoId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <p className="text-sm">
                      {alteracaoId ? 'Editando' : 'Nova Alteração'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Tipos selecionados
                  </Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {dados.tiposAlteracao?.map((tipo: number) => (
                      <Badge key={tipo} variant="secondary">
                        {getTipoNome(tipo)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Justificativa
                  </Label>
                  <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                    {dados.dadosBasicos?.justificativa ?? '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Data da Publicação
                  </Label>
                  <p className="text-sm text-gray-600">
                    {dados.dataEfeito ? (
                      <DateDisplay value={dados.dataEfeito} />
                    ) : (
                      '-'
                    )}
                  </p>
                </div>

                {dados.dadosBasicos?.fundamentoLegal && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Documento
                    </Label>
                    <p className="rounded-md bg-blue-50 p-3 text-sm text-gray-600">
                      {dados.dadosBasicos.fundamentoLegal}
                    </p>
                  </div>
                )}

                {dados.dadosBasicos?.observacoes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Observações
                    </Label>
                    <p className="text-sm text-gray-600">
                      {dados.dadosBasicos.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes dos Blocos Alterados */}
            {Object.keys(dados.blocos ?? {}).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Alterações Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bloco Vigência */}
                  {dados.blocos?.vigencia && (
                    <div className="rounded-lg border bg-green-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800">
                          Alteração de Vigência
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <span className="font-medium text-gray-700">
                            Operação:
                          </span>
                          <p className="text-gray-600">
                            {dados.blocos.vigencia.operacao === 1 &&
                              'Substituir vigência'}
                            {dados.blocos.vigencia.operacao === 2 &&
                              'Suspender por período determinado'}
                            {dados.blocos.vigencia.operacao === 3 &&
                              'Suspender por período indeterminado'}
                          </p>
                        </div>
                        {dados.blocos.vigencia.novaDataFinal && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Nova Data Final:
                            </span>
                            <p className="text-gray-600">
                              <DateDisplay
                                value={dados.blocos.vigencia.novaDataFinal}
                              />
                            </p>
                          </div>
                        )}
                        {dados.blocos.vigencia.valorTempo &&
                          dados.blocos.vigencia.tipoUnidade && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Período:
                              </span>
                              <p className="text-gray-600">
                                {dados.blocos.vigencia.valorTempo}{' '}
                                {dados.blocos.vigencia.tipoUnidade === 1
                                  ? 'dia(s)'
                                  : dados.blocos.vigencia.tipoUnidade === 2
                                    ? 'mês(es)'
                                    : 'ano(s)'}
                              </p>
                            </div>
                          )}
                        {dados.blocos.vigencia.observacoes && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">
                              Observações:
                            </span>
                            <p className="rounded border bg-white p-2 text-gray-600">
                              {dados.blocos.vigencia.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bloco Valor */}
                  {dados.blocos?.valor && (
                    <div className="rounded-lg border bg-purple-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium text-purple-800">
                          Alteração de Valor
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <span className="font-medium text-gray-700">
                            Operação:
                          </span>
                          <p className="text-gray-600">
                            {dados.blocos.valor.operacao === 1 &&
                              'Acrescentar valor'}
                            {dados.blocos.valor.operacao === 2 &&
                              'Diminuir valor'}
                            {dados.blocos.valor.operacao === 3 &&
                              'Substituir valor'}
                          </p>
                        </div>
                        {dados.blocos.valor.valorAjuste && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Valor de Ajuste:
                            </span>
                            <p className="font-mono text-gray-600">
                              <CurrencyDisplay
                                value={dados.blocos.valor.valorAjuste}
                              />
                            </p>
                          </div>
                        )}
                        {dados.blocos.valor.percentualAjuste && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Percentual de Ajuste:
                            </span>
                            <p className="font-mono text-gray-600">
                              {dados.blocos.valor.percentualAjuste}%
                            </p>
                          </div>
                        )}
                        {dados.blocos.valor.novoValorGlobal && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Novo Valor Global:
                            </span>
                            <p className="font-mono text-gray-600">
                              <CurrencyDisplay
                                value={dados.blocos.valor.novoValorGlobal}
                              />
                            </p>
                          </div>
                        )}
                        {dados.blocos.valor.observacoes && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">
                              Observações:
                            </span>
                            <p className="rounded border bg-white p-2 text-gray-600">
                              {dados.blocos.valor.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bloco Fornecedores */}
                  {dados.blocos?.fornecedores && (
                    <div className="rounded-lg border bg-orange-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        <h4 className="font-medium text-orange-800">
                          Alteração de Fornecedores
                        </h4>
                      </div>
                      <div className="space-y-4 text-sm">
                        {dados.blocos.fornecedores.fornecedoresVinculados &&
                          dados.blocos.fornecedores.fornecedoresVinculados
                            .length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Fornecedores Vinculados:
                              </span>
                              <div className="mt-1 space-y-1">
                                {dados.blocos.fornecedores.fornecedoresVinculados.map(
                                  (fornecedor: FornecedorAlteracao) => (
                                    <div
                                      key={fornecedor.empresaId}
                                      className="rounded border bg-white p-2 text-xs"
                                    >
                                      <span className="font-medium">
                                        Empresa:
                                      </span>{' '}
                                      {getCompanyName(fornecedor.empresaId)}
                                      {fornecedor.percentualParticipacao && (
                                        <span className="ml-2">
                                          <span className="font-medium">
                                            Participação:
                                          </span>{' '}
                                          {fornecedor.percentualParticipacao}%
                                        </span>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        {dados.blocos.fornecedores.fornecedoresDesvinculados &&
                          dados.blocos.fornecedores.fornecedoresDesvinculados
                            .length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Fornecedores Desvinculados:
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {dados.blocos.fornecedores.fornecedoresDesvinculados.map(
                                  (id: string) => (
                                    <Badge
                                      key={id}
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      {getCompanyName(id)}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        {dados.blocos.fornecedores.novoFornecedorPrincipal && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Novo Fornecedor Principal:
                            </span>
                            <Badge variant="default" className="ml-2">
                              {getCompanyName(
                                dados.blocos.fornecedores
                                  .novoFornecedorPrincipal,
                              )}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bloco Unidades */}
                  {dados.blocos?.unidades && (
                    <div className="rounded-lg border bg-teal-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal-600" />
                        <h4 className="font-medium text-teal-800">
                          Alteração de Unidades
                        </h4>
                      </div>
                      <div className="space-y-4 text-sm">
                        {dados.blocos.unidades.unidadesVinculadas &&
                          dados.blocos.unidades.unidadesVinculadas.length >
                            0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Unidades Vinculadas:
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {dados.blocos.unidades.unidadesVinculadas.map(
                                  (unidade) => (
                                    <Badge
                                      key={unidade.unidadeSaudeId}
                                      variant="default"
                                      className="text-xs"
                                    >
                                      {getUnitName(unidade.unidadeSaudeId)}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        {dados.blocos.unidades.unidadesDesvinculadas &&
                          dados.blocos.unidades.unidadesDesvinculadas.length >
                            0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Unidades Desvinculadas:
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {dados.blocos.unidades.unidadesDesvinculadas.map(
                                  (id: string) => (
                                    <Badge
                                      key={id}
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      {getUnitName(id)}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Bloco Cláusulas */}
                  {dados.blocos?.clausulas && (
                    <div className="rounded-lg border bg-blue-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-800">
                          Alteração de Cláusulas
                        </h4>
                      </div>
                      <div className="space-y-4 text-sm">
                        {dados.blocos.clausulas.clausulasExcluidas && (
                          <div>
                            <span className="font-medium text-red-700">
                              Cláusulas Excluídas:
                            </span>
                            <p className="mt-1 rounded border bg-white p-2 text-gray-600">
                              {dados.blocos.clausulas.clausulasExcluidas}
                            </p>
                          </div>
                        )}
                        {dados.blocos.clausulas.clausulasIncluidas && (
                          <div>
                            <span className="font-medium text-green-700">
                              Cláusulas Incluídas:
                            </span>
                            <p className="mt-1 rounded border bg-white p-2 text-gray-600">
                              {dados.blocos.clausulas.clausulasIncluidas}
                            </p>
                          </div>
                        )}
                        {dados.blocos.clausulas.clausulasAlteradas && (
                          <div>
                            <span className="font-medium text-yellow-700">
                              Cláusulas Alteradas:
                            </span>
                            <p className="mt-1 rounded border bg-white p-2 text-gray-600">
                              {dados.blocos.clausulas.clausulasAlteradas}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Alerta de limite legal */}
            {alertaLimiteLegal && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <h4 className="mb-2 font-medium text-red-800">
                        Confirmação de Limite Legal Necessária
                      </h4>
                      <div className="mb-4 text-sm text-red-700">
                        <p>
                          Esta alteração excede os limites legais estabelecidos.
                        </p>
                        <p>Revise os dados antes de prosseguir.</p>
                      </div>

                      {!confirmacaoLimiteLegal && (
                        <div className="rounded-md bg-red-100 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="aceito-riscos"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  confirmarLimiteLegal()
                                }
                              }}
                              className="rounded border-red-300 text-red-600 focus:ring-red-500"
                            />
                            <label
                              htmlFor="aceito-riscos"
                              className="text-sm font-medium text-red-800"
                            >
                              Eu aceito os riscos legais e confirmo que esta
                              alteração é necessária
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ação de envio */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => void handleSubmeter()}
                    disabled={!podeSubmeter || isLoading}
                    className="flex items-center gap-2"
                    variant="default"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Alteração
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      default:
        return null
    }
  }, [
    etapaAtual,
    dados,
    errors,
    isLoading,
    handleTiposChange,
    handleDadosBasicosChange,
    atualizarDados,
    numeroContrato,
    contratoId,
    alteracaoId,
    alertaLimiteLegal,
    confirmacaoLimiteLegal,
    confirmarLimiteLegal,
    handleSubmeter,
    podeSubmeter,
    vigenciaFinal,
    contractContext.data,
    contractContext.isLoading,
    contractFinancials.currentBalance,
    contractFinancials.executedPercentage,
    contractFinancials.isLoading,
    contractFinancials.totalValue,
    contractSuppliers.isLoading,
    contractSuppliers.mainSupplier,
    contractSuppliers.suppliers,
    contractTerms.endDate,
    contractTerms.isActive,
    contractTerms.isLoading,
    contractTerms.startDate,
    contractUnits.demandingUnit,
    contractUnits.isLoading,
    contractUnits.linkedUnits,
    contractUnits.managingUnit,
    getCompanyName,
    invalidateContext,
  ])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  Nova Alteração Contratual
                </CardTitle>
                <div className="mt-1 space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {numeroContrato && `Contrato: ${numeroContrato}`}
                    {valorOriginal > 0 && (
                      <span className="ml-4">
                        Valor original:{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(valorOriginal)}
                      </span>
                    )}
                  </p>
                  {tiposAlteracaoNomes && (
                    <p className="text-sm font-medium text-blue-700">
                      Tipo: {tiposAlteracaoNomes}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="px-3">
                Etapa {etapaAtual + 1} de {ETAPAS.length}
              </Badge>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso geral</span>
                <span className="font-medium">{Math.round(progresso)}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>

            {/* Navegação das etapas */}
            <div className="flex flex-wrap gap-2">
              {ETAPAS.map((etapa, index) => {
                const Icon = etapa.icone
                const isAtual = index === etapaAtual
                const isConcluido = index < etapaAtual
                const isDisponivel = index <= etapaAtual

                return (
                  <button
                    key={etapa.id}
                    onClick={() => irParaEtapa(index)}
                    disabled={!isDisponivel}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                      isAtual && 'bg-blue-100 font-medium text-blue-700',
                      isConcluido && 'bg-green-100 text-green-700',
                      !isAtual &&
                        !isConcluido &&
                        isDisponivel &&
                        'hover:bg-muted',
                      !isDisponivel && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {isConcluido ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{etapa.titulo}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo da etapa */}
      <AnimatePresence mode="wait">
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderizarEtapa}
        </motion.div>
      </AnimatePresence>

      {/* Navegação */}
      {etapaAtual < ETAPAS.length - 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={etapaAnterior}
                disabled={etapaAtual === 0 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={proximaEtapa}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicador de erros */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Existem campos que precisam de atenção
              </p>
              <ul className="mt-1 space-y-1 text-xs text-red-700">
                {Object.values(errors)
                  .slice(0, 5)
                  .map((error) => (
                    <li key={`error-${error}`}>• {error}</li>
                  ))}
                {Object.keys(errors).length > 5 && (
                  <li>• E mais {Object.keys(errors).length - 5} erro(s)...</li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal de Alerta de Limite Legal */}
      {modalLimiteLegal.open &&
        modalLimiteLegal.alerta &&
        modalLimiteLegal.alteracaoId && (
          <ModalAlertaLimiteLegal
            open={modalLimiteLegal.open}
            onOpenChange={(open) => setModalLimiteLegal({ open })}
            alteracaoId={modalLimiteLegal.alteracaoId}
            alerta={modalLimiteLegal.alerta}
            onConfirmed={() => {
              setModalLimiteLegal({ open: false })
              // Alteração já foi confirmada pelo modal, não precisamos chamar onSubmitted novamente
            }}
            onCancelled={() => {
              setModalLimiteLegal({ open: false })
              onCancelled?.()
            }}
          />
        )}

      {/* Modal de Sucesso */}
      <Dialog open={modalSucesso} onOpenChange={setModalSucesso}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Alteração Submetida com Sucesso!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Sua alteração contratual foi submetida para aprovação com sucesso.
              <br />
              <br />
              Você será redirecionado para a visualização do contrato.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleConfirmarSucesso} className="w-full">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Erro */}
      <Dialog
        open={modalErro.open}
        onOpenChange={(open) => !open && handleFecharModalErro()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Erro ao Submeter Alteração
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              {modalErro.mensagem}
              <br />
              <br />
              Por favor, tente novamente ou entre em contato com o suporte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleFecharModalErro}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
