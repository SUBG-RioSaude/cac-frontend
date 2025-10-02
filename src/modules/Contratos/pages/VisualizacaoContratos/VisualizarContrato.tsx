import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit, Download, MoreHorizontal } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DateDisplay } from '@/components/ui/formatters'
import { Separator } from '@/components/ui/separator'
import { ContratoStatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { currencyUtils } from '@/lib/utils'
import { parseStatusContrato } from '@/types/status'

import { AlteracoesContratuais } from '../../components/AlteracoesContratuais'
import { TabDocumentos } from '../../components/Documentos/tab-documentos'
import { ContractChat } from '../../components/Timeline/contract-chat'
import { DetalhesContrato } from '../../components/VisualizacaoContratos/detalhes-contrato'
import { IndicadoresRelatorios } from '../../components/VisualizacaoContratos/indicadores-relatorios'
import { RegistroAlteracoes } from '../../components/VisualizacaoContratos/registro-alteracoes'
// import type { ContratoDetalhado } from '../../types/contrato' // removido pois não está sendo usado
import { TabEmpenhos } from '../../components/VisualizacaoContratos/tab-empenhos'
import {
  getActiveTabs,
  getDefaultTab,
  isTabEnabled,
  getGridCols,
} from '../../config/tabs-config'
import { useContratoDetalhado } from '../../hooks/use-contratos'
import { extrairEmpenhosDoContrato } from '../../hooks/use-empenhos-with-retry'
import { useHistoricoAlteracoes } from '../../hooks/useHistoricoAlteracoes'
import type { AlteracaoContratualResponse } from '../../types/alteracoes-contratuais'
// import { useTimelineIntegration } from '../../hooks/useTimelineIntegration' // Hook temporariamente removido
import type { TimelineEntry } from '../../types/timeline'
import type { ChatMessage } from '../../types/timeline'

export const VisualizarContrato = () => {
  const { contratoId: id } = useParams<{ contratoId: string }>()
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState(() => getDefaultTab())
  const [modoEdicaoGlobal, setModoEdicaoGlobal] = useState(false)
  const [entradasTimeline, setEntradasTimeline] = useState<TimelineEntry[]>([])

  // Buscar contrato da API usando React Query
  const {
    data: contrato,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useContratoDetalhado(id ?? '', { enabled: !!id })

  // Hook para buscar histórico de alterações contratuais
  const { data: historicoAlteracoes = [] } = useHistoricoAlteracoes(
    id ?? '',
    !!id,
  )

  // Integração com timeline - temporariamente comentado
  // const { criarEntradaAlteracao, criarMarcosAlteracao, atualizarStatusAlteracao } = useTimelineIntegration({
  //   contratoId: contrato?.id || '',
  //   onAdicionarEntrada: (entrada) => {
  //     // Atualizar estado local das entradas
  //     setEntradasTimeline(prev => [entrada, ...prev])
  //   }
  // })

  const handleEditarGlobal = () => {
    setModoEdicaoGlobal(!modoEdicaoGlobal)
  }

  const handleExportar = () => {
    // TODO: Implementar funcionalidade de exportação
  }

  // Handlers para integração com alterações contratuais

  const handleSalvarAlteracao = useCallback(
    (_alteracao: AlteracaoContratualResponse) => {
      try {
        // Simular usuário atual
        // const autor = {
        //   id: '1',
        //   nome: 'João Silva',
        //   tipo: 'usuario' as const
        // }
        // TODO: Criar entrada na timeline
        // criarEntradaAlteracao(alteracao, autor)
        // TODO: Criar marcos relacionados se necessário
        // criarMarcosAlteracao(alteracao)
      } catch {
        // TODO: Implementar notificação de erro adequada
      }
    },
    [],
  )

  const _handleSubmeterAlteracao = useCallback(
    (alteracao: AlteracaoContratualResponse) => {
      try {
        handleSalvarAlteracao(alteracao)

        // TODO: Atualizar status para submetida
        if (alteracao.id) {
          // atualizarStatusAlteracao(alteracao.id, 'submetida')
        }
      } catch {
        // TODO: Implementar notificação de erro adequada
      }
    },
    [handleSalvarAlteracao],
  )

  const handleMarcarChatComoAlteracao = useCallback(
    (mensagem: ChatMessage) => {
      // Converter mensagem do chat em entrada do registro de alterações
      const autor = {
        id: mensagem.remetente.id,
        nome: mensagem.remetente.nome,
        tipo: mensagem.remetente.tipo,
      }

      const entradaChat = {
        id: `chat_${mensagem.id}`,
        contratoId: contrato?.id ?? '',
        tipo: 'manual' as const,
        categoria: 'observacao' as const,
        titulo: `Observação do Chat - ${mensagem.remetente.nome}`,
        descricao: mensagem.conteudo,
        dataEvento: mensagem.dataEnvio,
        autor,
        status: 'ativo' as const,
        prioridade: 'media' as const,
        tags: ['chat', 'observacao'],
        criadoEm: new Date().toISOString(),
      }

      // Adicionar à timeline
      setEntradasTimeline((prev) => [entradaChat, ...prev])
    },
    [contrato],
  )

  // Função para validar mudança de aba
  const handleTabChange = useCallback((novaAba: string) => {
    if (isTabEnabled(novaAba)) {
      setAbaAtiva(novaAba)
    } else {
      // Se aba está desabilitada, redireciona para aba padrão
      // Aba desabilitada - redirecionar para aba padrão
      setAbaAtiva(getDefaultTab())
    }
  }, [])

  // Validar aba ativa quando componente carrega
  useEffect(() => {
    if (!isTabEnabled(abaAtiva)) {
      setAbaAtiva(getDefaultTab())
    }
  }, [abaAtiva])

  if (loading) {
    return (
      <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted h-8 w-1/3 rounded" />
            <div className="bg-muted h-32 rounded" />
            <div className="bg-muted h-96 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold">
              Erro ao carregar contrato
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : 'Não foi possível carregar os dados do contrato. Tente novamente.'}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => {
                  void refetch()
                }}
                variant="outline"
              >
                Tentar novamente
              </Button>
              <Button onClick={() => navigate('/contratos')}>
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold">
              Contrato não encontrado
            </h2>
            <p className="text-muted-foreground mb-4">
              O contrato solicitado não foi encontrado.
            </p>
            <Button onClick={() => navigate('/contratos')}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6 xl:p-8">
        {/* Header Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            {/* Linha superior - Navegação e ações */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/contratos')}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="xs:inline hidden">Voltar</span>
                </Button>
                <Separator orientation="vertical" className="h-4 sm:h-6" />
              </div>

              {/* Ações do header - Responsivo */}
              <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
                {/* Contador de dias restantes - Sempre visível mas adaptativo */}
                <div className="text-center sm:text-right">
                  <p
                    className={`text-lg font-bold sm:text-2xl ${(() => {
                      const hoje = new Date()
                      const dataTermino = new Date(contrato.dataTermino)
                      const diffTime = dataTermino.getTime() - hoje.getTime()
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      )

                      if (diffDays <= 0) return 'text-red-600' // Vencido
                      if (diffDays <= 60) return 'text-red-600' // 60 dias ou menos
                      if (diffDays <= 100) return 'text-orange-500' // 100 a 91 dias
                      return 'text-green-600' // Acima de 100 dias
                    })()}`}
                  >
                    {(() => {
                      const hoje = new Date()
                      const dataTermino = new Date(contrato.dataTermino)
                      const diffTime = dataTermino.getTime() - hoje.getTime()
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      )
                      return diffDays > 0 ? diffDays : 0
                    })()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    dias restantes
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportar}
                    className="bg-transparent text-xs sm:text-sm"
                  >
                    <Download className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button
                    onClick={handleEditarGlobal}
                    variant={modoEdicaoGlobal ? 'destructive' : 'default'}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline">
                      {modoEdicaoGlobal ? 'Cancelar' : 'Editar Tudo'}
                    </span>
                    <span className="md:hidden">
                      {modoEdicaoGlobal ? 'Cancelar' : 'Editar'}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportar}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Título e status */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-xl font-bold break-all sm:text-2xl lg:text-3xl">
                  {contrato.numeroContrato}
                </h1>
                <div className="flex items-center gap-2">
                  <ContratoStatusBadge
                    status={parseStatusContrato(contrato.status)}
                    size="lg"
                    className="px-3 py-1 text-sm font-semibold"
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-sm break-words sm:text-base">
                {contrato.fornecedor.razaoSocial}
              </p>
            </div>
          </div>

          {/* Resumo Rápido - Responsivo */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                <div className="text-center sm:text-left">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Valor Total
                  </p>
                  <p className="text-base font-semibold break-all sm:text-lg">
                    {currencyUtils.formatar(contrato.valorTotal)}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Vigência
                  </p>
                  <p className="text-xs font-medium break-words sm:text-sm">
                    <DateDisplay value={contrato.dataInicio} /> -{' '}
                    <DateDisplay value={contrato.dataTermino} />
                  </p>
                </div>
                <div className="text-center sm:col-span-2 sm:text-left lg:col-span-1">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Execução
                  </p>
                  <p className="text-base font-semibold text-blue-600 sm:text-lg">
                    {contrato.indicadores.percentualExecutado}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border bg-white shadow-sm">
            <Tabs
              value={abaAtiva}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList
                className={`grid h-auto w-full ${
                  getGridCols() === 1
                    ? 'grid-cols-1'
                    : getGridCols() === 2
                      ? 'grid-cols-2'
                      : getGridCols() === 3
                        ? 'grid-cols-3'
                        : getGridCols() === 4
                          ? 'grid-cols-4'
                          : getGridCols() === 5
                            ? 'grid-cols-5'
                            : 'grid-cols-6'
                } rounded-lg bg-gray-50 p-1`}
              >
                {getActiveTabs().map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border ${tab.icon.activeBorder} ${tab.icon.activeBg} ${tab.icon.activeText} data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${tab.icon.color} ${tab.icon.bgColor} sm:h-3 sm:w-3`}
                    />
                    <span className="text-center">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* Conteúdo das Abas - Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <Tabs
            value={abaAtiva}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={abaAtiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* Renderizar apenas abas ativas */}
                {isTabEnabled('detalhes') && (
                  <TabsContent value="detalhes" className="mt-0 w-full">
                    <DetalhesContrato contrato={contrato} />
                  </TabsContent>
                )}

                {isTabEnabled('alteracoes') && (
                  <TabsContent value="alteracoes" className="mt-0 w-full">
                    <RegistroAlteracoes
                      contratoId={id!}
                      alteracoes={historicoAlteracoes}
                      entradasTimeline={entradasTimeline}
                    />
                  </TabsContent>
                )}

                {isTabEnabled('indicadores') && (
                  <TabsContent value="indicadores" className="mt-0 w-full">
                    <IndicadoresRelatorios
                      indicadores={contrato.indicadores}
                      unidades={contrato.unidades}
                      valorTotal={contrato.valorTotal}
                      vtmTotalContrato={contrato.vtmTotalContrato}
                      contrato={contrato}
                    />
                  </TabsContent>
                )}

                {isTabEnabled('alteracoes-contratuais') && (
                  <TabsContent
                    value="alteracoes-contratuais"
                    className="mt-0 w-full"
                  >
                    <AlteracoesContratuais
                      contratoId={contrato.id}
                      numeroContrato={contrato.numeroContrato}
                      valorOriginal={contrato.valorTotal}
                      vigenciaFinal={contrato.dataTermino}
                      onSaved={(alteracao) => {
                        void handleSalvarAlteracao(alteracao)
                      }}
                      onSubmitted={(alteracao) => {
                        void _handleSubmeterAlteracao(alteracao)
                      }}
                      key={contrato.id}
                    />
                  </TabsContent>
                )}

                {isTabEnabled('documentos') && (
                  <TabsContent value="documentos" className="mt-0 w-full">
                    <TabDocumentos contratoId={contrato.id} />
                  </TabsContent>
                )}

                {isTabEnabled('empenhos') && (
                  <TabsContent value="empenhos" className="mt-0 w-full">
                    <TabEmpenhos
                      contratoId={contrato.id}
                      valorTotalContrato={contrato.valorTotal}
                      unidadesVinculadas={contrato.unidadesVinculadas ?? []}
                      empenhosIniciais={extrairEmpenhosDoContrato(
                        contrato as never,
                      )}
                    />
                  </TabsContent>
                )}

                {isTabEnabled('timeline') && (
                  <TabsContent value="timeline" className="mt-0 w-full">
                    <ContractChat
                      contratoId={contrato.id}
                      numeroContrato={contrato.numeroContrato}
                      onMarcarComoAlteracao={handleMarcarChatComoAlteracao}
                      key={`chat-${contrato.id}`}
                    />
                  </TabsContent>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
