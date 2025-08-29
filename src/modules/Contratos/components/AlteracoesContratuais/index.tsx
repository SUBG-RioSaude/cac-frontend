import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Save,
  MessageSquare,
  Eye,
  AlertCircle,
} from 'lucide-react'

import { TipoAlteracaoSelector } from './components/TipoAlteracaoSelector'
import { BlocosDinamicos } from './components/BlocosDinamicos'
import { ModalAlertaLimiteLegal } from './components/ModalAlertaLimiteLegal'
import { useAlteracoesContratuais } from './hooks/useAlteracoesContratuais'
import { 
  useContractContext,
  useContractFinancials,
  useContractTerms,
  useContractSuppliers,
  useContractUnits
} from '../../hooks/use-contract-context'
import type { AlteracaoContratualForm, AlertaLimiteLegal } from '../../types/alteracoes-contratuais'

interface AlteracoesContratuaisProps {
  contratoId: string
  numeroContrato?: string
  valorOriginal?: number
  vigenciaOriginal?: {
    dataInicio: string
    dataFim: string
  }
  alteracaoId?: string // Para edição
  initialData?: Partial<AlteracaoContratualForm>
  onSaved?: (alteracao: any) => void
  onSubmitted?: (alteracao: any) => void
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
    icone: FileText
  },
  {
    id: 'basicos',
    titulo: 'Dados Básicos',
    descricao: 'Justificativa e data de efeito',
    icone: MessageSquare
  },
  {
    id: 'blocos',
    titulo: 'Blocos Específicos',
    descricao: 'Configure os blocos dinâmicos',
    icone: ChevronRight
  },
  {
    id: 'revisao',
    titulo: 'Revisão',
    descricao: 'Revise antes de submeter',
    icone: Eye
  }
]

export function AlteracoesContratuais({
  contratoId,
  numeroContrato,
  valorOriginal = 0,
  alteracaoId,
  initialData,
  onSaved,
  onSubmitted,
  onCancelled,
  className
}: AlteracoesContratuaisProps) {
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [modalLimiteLegal, setModalLimiteLegal] = useState<{
    open: boolean
    alerta?: AlertaLimiteLegal
    alteracaoId?: string
  }>({ open: false })

  // Handler para alertas de limite legal
  const handleLimiteLegalAlert = useCallback((alerta: AlertaLimiteLegal, alteracaoIdAlert: string) => {
    setModalLimiteLegal({
      open: true,
      alerta,
      alteracaoId: alteracaoIdAlert
    })
  }, [])

  // Hooks para carregar contexto do contrato atual
  const contractContext = useContractContext(contratoId)
  const contractFinancials = useContractFinancials(contratoId)
  const contractTerms = useContractTerms(contratoId)
  const contractSuppliers = useContractSuppliers(contratoId)
  const contractUnits = useContractUnits(contratoId)

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
    salvarRascunho,
    // submeterParaAprovacao, - REMOVIDO: workflow não implementado
    confirmarLimiteLegal,
  } = useAlteracoesContratuais({
    contratoId,
    valorOriginal,
    alteracaoId,
    initialData,
    onSaved,
    onSubmitted,
    onLimiteLegalAlert: handleLimiteLegalAlert
  })

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
        if (!dados.dadosBasicos?.justificativa || dados.dadosBasicos.justificativa.length < 10) {
          podeAvancar = false
        }
        if (!dados.dataEfeito || dados.dataEfeito === '') {
          podeAvancar = false
        }
        break
      case 2: // Blocos
        podeAvancar = validarCamposObrigatorios()
        break
    }

    if (podeAvancar) {
      setEtapaAtual(prev => Math.min(prev + 1, ETAPAS.length - 1))
    }
  }, [etapaAtual, dados, validarCamposObrigatorios])

  const etapaAnterior = useCallback(() => {
    setEtapaAtual(prev => Math.max(prev - 1, 0))
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
    if (dados.dadosBasicos?.justificativa && dados.dadosBasicos.justificativa.length >= 10) pontos++

    // Blocos obrigatórios
    if (blocosObrigatorios.size === 0 || validarCamposObrigatorios()) pontos++

    // Pronto para submeter
    if (podeSubmeter) pontos++

    return (pontos / maxPontos) * 100
  }, [dados, blocosObrigatorios.size, validarCamposObrigatorios, podeSubmeter])

  // Handlers
  const handleTiposChange = useCallback((tipos: number[]) => {
    atualizarDados({ tiposAlteracao: tipos as any })
  }, [atualizarDados])

  const handleDadosBasicosChange = useCallback((campo: string, value: string) => {
    atualizarDados({
      dadosBasicos: {
        justificativa: '',
        fundamentoLegal: '',
        observacoes: '',
        ...dados.dadosBasicos,
        [campo]: value
      }
    })
  }, [atualizarDados, dados.dadosBasicos])

  const handleSalvarRascunho = useCallback(async () => {
    try {
      await salvarRascunho()
      // Pode mostrar toast de sucesso aqui
    } catch (error) {
      // Pode mostrar toast de erro aqui
      console.error('Erro ao salvar:', error)
    }
  }, [salvarRascunho])

  // WORKFLOW DESABILITADO: handleSubmeter removido
  // const handleSubmeter = useCallback(async () => {
  //   try {
  //     await submeterParaAprovacao()
  //     // Pode mostrar toast de sucesso e redirecionar
  //   } catch (error) {
  //     // Pode mostrar toast de erro aqui
  //     console.error('Erro ao submeter:', error)
  //   }
  // }, [submeterParaAprovacao])

  // Renderizar conteúdo da etapa
  const renderizarEtapa = useMemo(() => {
    switch (etapaAtual) {
      case 0: // Tipos
        return (
          <TipoAlteracaoSelector
            tiposSelecionados={dados.tiposAlteracao || []}
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
                  <span className="text-sm text-gray-500 ml-2">
                    (mínimo 10 caracteres)
                  </span>
                </Label>
                <Textarea
                  id="justificativa"
                  value={dados.dadosBasicos?.justificativa || ''}
                  onChange={(e) => handleDadosBasicosChange('justificativa', e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className={cn(errors['dadosBasicos.justificativa'] && 'border-red-500')}
                  placeholder="Descreva detalhadamente a justificativa para esta alteração contratual, incluindo os motivos técnicos, legais ou operacionais que fundamentam a necessidade da modificação..."
                />
                {errors['dadosBasicos.justificativa'] && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors['dadosBasicos.justificativa']}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {(dados.dadosBasicos?.justificativa || '').length} caracteres
                </div>
              </div>

              {/* Fundamento Legal */}
              <div className="space-y-2">
                <Label htmlFor="fundamento-legal">
                  Fundamento Legal
                  <span className="text-sm text-gray-500 ml-2">(opcional)</span>
                </Label>
                <Textarea
                  id="fundamento-legal"
                  value={dados.dadosBasicos?.fundamentoLegal || ''}
                  onChange={(e) => handleDadosBasicosChange('fundamentoLegal', e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  placeholder="Lei, decreto, regulamento ou norma que fundamenta esta alteração..."
                />
              </div>

              {/* Data de Efeito */}
              <div className="space-y-2">
                <Label htmlFor="dataEfeito">
                  Data de Efeito *
                  <span className="text-sm text-gray-500 ml-2">
                    (quando a alteração deve entrar em vigor)
                  </span>
                </Label>
                <Input
                  id="dataEfeito"
                  type="date"
                  value={dados.dataEfeito || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => atualizarDados({ dataEfeito: e.target.value })}
                  disabled={isLoading}
                  className={cn(errors['dataEfeito'] && 'border-red-500')}
                />
                {errors['dataEfeito'] && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors['dataEfeito']}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">
                  Observações
                  <span className="text-sm text-gray-500 ml-2">(opcional)</span>
                </Label>
                <Textarea
                  id="observacoes"
                  value={dados.dadosBasicos?.observacoes || ''}
                  onChange={(e) => handleDadosBasicosChange('observacoes', e.target.value)}
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
            tiposSelecionados={dados.tiposAlteracao || []}
            dados={dados}
            onChange={atualizarDados}
            contractContext={{
              contract: contractContext.data,
              financials: {
                totalValue: contractFinancials.totalValue,
                currentBalance: contractFinancials.currentBalance,
                executedPercentage: contractFinancials.executedPercentage
              },
              terms: {
                startDate: contractTerms.startDate,
                endDate: contractTerms.endDate,
                isActive: contractTerms.isActive
              },
              suppliers: {
                suppliers: contractSuppliers.suppliers,
                mainSupplier: contractSuppliers.mainSupplier
              },
              units: {
                demandingUnit: contractUnits.demandingUnit,
                managingUnit: contractUnits.managingUnit,
                linkedUnits: contractUnits.linkedUnits
              },
              isLoading: contractContext.isLoading || contractFinancials.isLoading || contractTerms.isLoading || contractSuppliers.isLoading || contractUnits.isLoading
            }}
            errors={errors}
            disabled={isLoading}
          />
        )

      case 3: // Revisão
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Contrato</Label>
                    <p className="text-sm">{numeroContrato || contratoId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <p className="text-sm">
                      {alteracaoId ? 'Editando' : 'Nova Alteração'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Tipos selecionados</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dados.tiposAlteracao?.map((tipo: number) => (
                      <Badge key={tipo} variant="secondary">
                        {/* Aqui você mapearia o tipo para o nome */}
                        Tipo {tipo}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Justificativa</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {dados.dadosBasicos?.justificativa || '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Data de Efeito</Label>
                  <p className="text-sm text-gray-600">
                    {dados.dataEfeito ? new Date(dados.dataEfeito).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>

                {dados.dadosBasicos?.fundamentoLegal && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fundamento Legal</Label>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                      {dados.dadosBasicos.fundamentoLegal}
                    </p>
                  </div>
                )}

                {dados.dadosBasicos?.observacoes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Observações</Label>
                    <p className="text-sm text-gray-600">
                      {dados.dadosBasicos.observacoes}
                    </p>
                  </div>
                )}

                {/* RESUMO DA API DESABILITADO: endpoint não implementado
                {resumo && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-700">Impacto Previsto</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {resumo.impactoValor && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <p className="text-xs text-green-600 font-medium">Impacto no Valor</p>
                          <p className="text-sm text-green-800">
                            {resumo.impactoValor.percentual > 0 ? '+' : ''}{resumo.impactoValor.percentual.toFixed(2)}%
                          </p>
                        </div>
                      )}
                      
                      {resumo.impactoPrazo && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs text-blue-600 font-medium">Impacto no Prazo</p>
                          <p className="text-sm text-blue-800">
                            {resumo.impactoPrazo.diasAlterados > 0 ? '+' : ''}{resumo.impactoPrazo.diasAlterados} dias
                          </p>
                        </div>
                      )}
                      
                      {resumo.status && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-gray-600 font-medium">Status</p>
                          <p className="text-sm text-gray-800">{resumo.status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                */}
              </CardContent>
            </Card>

            {/* Alerta de limite legal */}
            {alertaLimiteLegal && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 mb-2">
                        Confirmação de Limite Legal Necessária
                      </h4>
                      <div className="text-sm text-red-700 mb-4">
                        <p>Esta alteração excede os limites legais estabelecidos.</p>
                        <p>Revise os dados antes de prosseguir.</p>
                      </div>
                      
                      {!confirmacaoLimiteLegal && (
                        <div className="bg-red-100 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
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
                            <label htmlFor="aceito-riscos" className="text-sm font-medium text-red-800">
                              Eu aceito os riscos legais e confirmo que esta alteração é necessária
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações finais */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleSalvarRascunho}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {alteracaoId ? 'Salvar Alterações' : 'Salvar Alteração'}
                  </Button>
                  {/* WORKFLOW DESABILITADO: não implementado no processo atual
                  <Button
                    onClick={handleSubmeter}
                    disabled={!podeSubmeter || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submeter para Aprovação
                  </Button>
                  */}
                </div>
              </CardContent>
            </Card>
          </div>
        )

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
    handleSalvarRascunho
    // handleSubmeter, podeSubmeter, resumo - REMOVIDOS: workflow não implementado
  ])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">Nova Alteração Contratual</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  {numeroContrato && `Contrato: ${numeroContrato}`}
                  {valorOriginal > 0 && (
                    <span className="ml-4">
                      Valor original: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(valorOriginal)}
                    </span>
                  )}
                </p>
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
                      isAtual && 'bg-blue-100 text-blue-700 font-medium',
                      isConcluido && 'bg-green-100 text-green-700',
                      !isAtual && !isConcluido && isDisponivel && 'hover:bg-muted',
                      !isDisponivel && 'opacity-50 cursor-not-allowed'
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
                {etapaAtual > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleSalvarRascunho}
                    disabled={isLoading}
                  >
                    Salvar Rascunho
                  </Button>
                )}

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
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Existem campos que precisam de atenção
              </p>
              <ul className="mt-1 space-y-1 text-xs text-red-700">
                {Object.values(errors).slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
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
      {modalLimiteLegal.open && modalLimiteLegal.alerta && modalLimiteLegal.alteracaoId && (
        <ModalAlertaLimiteLegal
          open={modalLimiteLegal.open}
          onOpenChange={(open) => setModalLimiteLegal({ open })}
          alteracaoId={modalLimiteLegal.alteracaoId}
          alerta={modalLimiteLegal.alerta}
          onConfirmed={() => {
            setModalLimiteLegal({ open: false })
            onSubmitted?.(modalLimiteLegal.alteracaoId)
          }}
          onCancelled={() => {
            setModalLimiteLegal({ open: false })
            onCancelled?.()
          }}
        />
      )}
    </div>
  )
}