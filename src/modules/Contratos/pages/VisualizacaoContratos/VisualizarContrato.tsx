import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Download, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Componentes das abas
import { DetalhesContrato } from '../../components/VisualizacaoContratos/detalhes-contrato'
import { RegistroAlteracoes } from '../../components/VisualizacaoContratos/registro-alteracoes'
import { IndicadoresRelatorios } from '../../components/VisualizacaoContratos/indicadores-relatorios'

// Dados mock
import { contratoDetalhadoMock } from '../../data/contratos-mock'
import type { ContratoDetalhado } from '../../types/contrato-detalhado'
import type { AlteracaoContratualForm } from '../../types/alteracoes-contratuais'
import { currencyUtils } from '@/lib/utils'
import { AlteracoesContratuais } from '../../components/AlteracoesContratuais/alteracoes-contratuais'
import { ContractChat } from '../../components/Timeline/contract-chat'
import { TabDocumentos } from '../../components/Documentos/tab-documentos'
import { useTimelineIntegration } from '../../hooks/useTimelineIntegration'
import type { TimelineEntry } from '../../types/timeline'
import type { ChatMessage } from '../../types/chat'
import { DOCUMENTOS_MOCK } from '../../data/documentos-mock'

export function VisualizarContrato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<ContratoDetalhado | null>(null)
  const [abaAtiva, setAbaAtiva] = useState('alteracoes')
  const [loading, setLoading] = useState(true)
  const [modoEdicaoGlobal, setModoEdicaoGlobal] = useState(false)
  const [entradasTimeline, setEntradasTimeline] = useState<TimelineEntry[]>([])
  
  // Integração com timeline
  const { criarEntradaAlteracao, criarMarcosAlteracao, atualizarStatusAlteracao } = useTimelineIntegration({
    contratoId: contrato?.id || '',
    onAdicionarEntrada: (entrada) => {
      console.log('Nova entrada adicionada à timeline:', entrada)
      // Atualizar estado local das entradas
      setEntradasTimeline(prev => [entrada, ...prev])
    }
  })

  useEffect(() => {
    // Simular carregamento dos dados
    const carregarContrato = async () => {
      setLoading(true)
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setContrato(contratoDetalhadoMock)
      setLoading(false)
    }

    carregarContrato()
  }, [id])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        variant: 'default' as const,
        label: 'Ativo',
        className:
          'bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold',
      },
      vencendo: {
        variant: 'secondary' as const,
        label: 'Vencendo em Breve',
        className:
          'bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-semibold',
      },
      vencido: {
        variant: 'destructive' as const,
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 px-3 py-1 text-sm font-semibold',
      },
      suspenso: {
        variant: 'outline' as const,
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800 px-3 py-1 text-sm font-semibold',
      },
      encerrado: {
        variant: 'outline' as const,
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold',
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  

  const handleEditarGlobal = () => {
    setModoEdicaoGlobal(!modoEdicaoGlobal)
  }

  const handleExportar = () => {
    console.log('Exportar contrato:', contrato)
  }

  // Handlers para integração com alterações contratuais

  const handleSalvarAlteracao = useCallback(async (alteracao: AlteracaoContratualForm) => {
    try {
      // Simular usuário atual
      const autor = {
        id: '1',
        nome: 'João Silva',
        tipo: 'usuario' as const
      }
      
      // Criar entrada na timeline
      criarEntradaAlteracao(alteracao, autor)
      
      // Criar marcos relacionados se necessário
      criarMarcosAlteracao(alteracao)
      
      console.log('Alteração salva e integrada à timeline:', alteracao)
    } catch (error) {
      console.error('Erro ao salvar alteração:', error)
    }
  }, [criarEntradaAlteracao, criarMarcosAlteracao])

  const handleSubmeterAlteracao = useCallback(async (alteracao: AlteracaoContratualForm) => {
    try {
      await handleSalvarAlteracao(alteracao)
      
      // Atualizar status para submetida
      if (alteracao.id) {
        atualizarStatusAlteracao(alteracao.id, 'submetida')
      }
      
      console.log('Alteração submetida:', alteracao)
    } catch (error) {
      console.error('Erro ao submeter alteração:', error)
    }
  }, [handleSalvarAlteracao, atualizarStatusAlteracao])

  const handleMarcarChatComoAlteracao = useCallback((mensagem: ChatMessage) => {
    // Converter mensagem do chat em entrada do registro de alterações
    const autor = {
      id: mensagem.remetente.id,
      nome: mensagem.remetente.nome,
      tipo: mensagem.remetente.tipo
    }
    
    const entradaChat = {
      id: `chat_${mensagem.id}`,
      contratoId: contrato?.id || '',
      tipo: 'manual' as const,
      categoria: 'observacao' as const,
      titulo: `Observação do Chat - ${mensagem.remetente.nome}`,
      descricao: mensagem.conteudo,
      dataEvento: mensagem.dataEnvio,
      autor,
      status: 'ativo' as const,
      prioridade: 'media' as const,
      tags: ['chat', 'observacao'],
      criadoEm: new Date().toISOString()
    }
    
    // Adicionar à timeline
    setEntradasTimeline(prev => [entradaChat, ...prev])
    
    console.log('Mensagem do chat marcada como alteração:', entradaChat)
  }, [contrato])

  if (loading) {
    return (
      <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted h-8 w-1/3 rounded"></div>
            <div className="bg-muted h-32 rounded"></div>
            <div className="bg-muted h-96 rounded"></div>
          </div>
        </div>
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
              O contrato solicitado não foi encontrado ou você não tem permissão
              para visualizá-lo.
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
                {/* Contador de dias - Sempre visível mas adaptativo */}
                <div className="text-center sm:text-right">
                  <p className="text-lg font-bold text-green-600 sm:text-2xl">
                    {(() => {
                      const hoje = new Date()
                      const dataInicio = new Date(contrato.dataInicio)
                      const diffTime = hoje.getTime() - dataInicio.getTime()
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      )
                      return diffDays > 0 ? diffDays : 0
                    })()}
                  </p>
                  <p className="text-muted-foreground text-xs">dias vigente</p>
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
                  {getStatusBadge(contrato.status)}
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
                    {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')}{' '}
                    -{' '}
                    {new Date(contrato.dataTermino).toLocaleDateString('pt-BR')}
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
              onValueChange={setAbaAtiva}
              className="w-full"
            >
              <TabsList className="grid h-auto w-full grid-cols-6 rounded-lg bg-gray-50 p-1">
                <TabsTrigger
                  value="detalhes"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 data-[state=active]:bg-blue-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Detalhes do Contrato</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alteracoes"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-orange-200 data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-orange-500 data-[state=active]:bg-orange-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Registro de Alterações</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alteracoes-contratuais"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-purple-200 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-purple-500 data-[state=active]:bg-purple-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Alterações Contratuais</span>
                </TabsTrigger>
                <TabsTrigger
                  value="indicadores"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 data-[state=active]:bg-green-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Indicadores e Relatórios</span>
                </TabsTrigger>
                <TabsTrigger
                  value="documentos"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-teal-200 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-teal-500 data-[state=active]:bg-teal-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Documentos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 data-[state=active]:bg-blue-700 sm:h-3 sm:w-3"></div>
                  <span className="text-center">Chat</span>
                </TabsTrigger>
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
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={abaAtiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <TabsContent value="detalhes" className="mt-0 w-full">
                  <DetalhesContrato contrato={contrato} />
                </TabsContent>

                <TabsContent value="alteracoes" className="mt-0 w-full">
                  <RegistroAlteracoes 
                    alteracoes={contrato.alteracoes} 
                    entradasTimeline={entradasTimeline}
                    onAdicionarObservacao={() => setAbaAtiva('timeline')}
                  />
                </TabsContent>

                <TabsContent value="indicadores" className="mt-0 w-full">
                  <IndicadoresRelatorios
                    indicadores={contrato.indicadores}
                    unidades={contrato.unidades}
                    valorTotal={contrato.valorTotal}
                  />
                </TabsContent>

                <TabsContent value="alteracoes-contratuais" className="mt-0 w-full">
                  <AlteracoesContratuais 
                    contratoId={contrato.id} 
                    numeroContrato={contrato.numeroContrato}
                    valorOriginal={contrato.valorTotal}
                    onSalvar={handleSalvarAlteracao}
                    onSubmeter={handleSubmeterAlteracao}
                    key={contrato.id}
                  />
                </TabsContent>

                <TabsContent value="documentos" className="mt-0 w-full">
                  <TabDocumentos 
                    documentos={DOCUMENTOS_MOCK}
                    onDocumentosChange={(documentos) => {
                      // Callback para sincronizar mudanças nos documentos
                      console.log('Documentos atualizados:', documentos)
                    }}
                    timelineIntegration={{
                      criarEntradaDocumento: (documento, acao, autor, dadosAdicionais) => {
                        // Integrar com o hook existente de timeline
                        console.log('Integrando documento com timeline:', { documento, acao, autor, dadosAdicionais })
                        
                        // Simular criação da entrada na timeline
                        const entrada = {
                          id: `doc_${acao}_${Date.now()}_${documento.id}`,
                          contratoId: contrato.id,
                          tipo: 'manual' as const,
                          categoria: 'documento' as const,
                          titulo: `${acao === 'adicionado' ? 'Documento Adicionado' : 
                                   acao === 'status_alterado' ? 'Status Alterado' :
                                   acao === 'link_atualizado' ? 'Link Atualizado' :
                                   'Observações Atualizadas'} - ${documento.nome}`,
                          descricao: `Documento ${documento.categoria}: ${documento.descricao}`,
                          dataEvento: new Date().toISOString(),
                          autor,
                          status: 'ativo' as const,
                          prioridade: documento.categoria === 'obrigatorio' ? 'alta' : 'media' as const,
                          tags: ['documento', documento.categoria, documento.status, acao],
                          criadoEm: new Date().toISOString()
                        }
                        
                        // Adicionar à timeline local
                        setEntradasTimeline(prev => [entrada, ...prev])
                      }
                    }}
                    usuarioAtual={{ id: '1', nome: 'Usuário Atual', tipo: 'usuario' }}
                  />
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 w-full">
                  <ContractChat 
                    contratoId={contrato.id} 
                    numeroContrato={contrato.numeroContrato}
                    onMarcarComoAlteracao={handleMarcarChatComoAlteracao}
                    key={`chat-${contrato.id}`}
                  />
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
