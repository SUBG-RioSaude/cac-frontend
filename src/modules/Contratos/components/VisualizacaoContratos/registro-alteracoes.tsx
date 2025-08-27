import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Clock,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  Info,
  Search,
  Plus,
  MessageSquare,
  Settings,
  TrendingUp,
  Package,
  Scale,
  Calculator,
  FileEdit,
  Bookmark,
} from 'lucide-react'
import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato'
import type { TimelineEntry } from '@/modules/Contratos/types/timeline'
import { cn, currencyUtils } from '@/lib/utils'

interface RegistroAlteracoesProps {
  alteracoes: AlteracaoContrato[]
  entradasTimeline?: TimelineEntry[] // Entradas vindas do sistema de timeline/alterações contratuais
  onAdicionarObservacao?: () => void
  onMarcarChatComoAlteracao?: (chatId: string) => void
}

// Dados específicos tipados
interface DadosAlteracaoContratual {
  valorOriginal: number
  valorNovo: number
  diferenca: number
  percentualDiferenca: number
  novaVigencia?: string
  statusAlteracao?: string
}

interface DadosMilestone {
  etapa: string
  dataLimite?: string
  concluido: boolean
  percentualCompleto?: number
}

// Tipo unificado para exibição
interface EntradaUnificada {
  id: string
  tipo: string
  titulo: string
  descricao: string
  dataHora: string
  responsavel: string
  origem: 'contrato' | 'timeline' | 'chat'
  dados?: DadosAlteracaoContratual | DadosMilestone
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  tags?: string[]
}

export function RegistroAlteracoes({ 
  alteracoes, 
  entradasTimeline = [],
  onAdicionarObservacao,
  onMarcarChatComoAlteracao 
}: RegistroAlteracoesProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [termoPesquisa, setTermoPesquisa] = useState('')
  
  const formatarDataHora = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const getTituloAlteracao = (tipo: string) => {
    const titulos = {
      // Tipos originais do contrato
      criacao: 'Criação do Contrato',
      designacao_fiscais: 'Designação de Fiscais', 
      primeiro_pagamento: 'Primeiro Pagamento',
      atualizacao_documentos: 'Atualização de Documentos',
      alteracao_valor: 'Alteração de Valor',
      prorrogacao: 'Prorrogação de Prazo',
      
      // Novos tipos da timeline
      alteracao_contratual: 'Alteração Contratual',
      alteracao: 'Alteração',
      observacao: 'Observação',
      milestone: 'Marco',
      documento: 'Documento',
      prazo: 'Prazo',
      
      // Tipos específicos de aditivos
      prazo_aditivo: 'Aditivo de Prazo',
      qualitativo: 'Aditivo Qualitativo',
      repactuacao: 'Repactuação',
      quantidade: 'Aditivo de Quantidade',
      reajuste: 'Reajuste',
      repactuacao_reequilibrio: 'Repactuação e Reequilíbrio',
    }

    return titulos[tipo as keyof typeof titulos] || 'Alteração'
  }

  // Converter alterações do contrato para formato unificado
  const alteracoesUnificadas: EntradaUnificada[] = alteracoes.map(alt => ({
    id: alt.id,
    tipo: alt.tipo,
    titulo: getTituloAlteracao(alt.tipo),
    descricao: alt.descricao,
    dataHora: alt.dataHora,
    responsavel: alt.responsavel,
    origem: 'contrato' as const
  }))

  // Converter entradas da timeline para formato unificado  
  const timelineUnificadas: EntradaUnificada[] = entradasTimeline.map(entry => ({
    id: entry.id,
    tipo: entry.categoria === 'alteracao' ? 'alteracao_contratual' : entry.categoria,
    titulo: entry.titulo,
    descricao: entry.descricao,
    dataHora: entry.dataEvento,
    responsavel: entry.autor.nome,
    origem: 'timeline' as const,
    dados: entry.alteracaoContratual || entry.milestone,
    prioridade: entry.prioridade,
    tags: entry.tags
  }))

  // Unificar todas as entradas
  const todasEntradas = useMemo(() => {
    const entradas = [...alteracoesUnificadas, ...timelineUnificadas]
    
    // Filtrar por tipo
    let entradasFiltradas = filtroTipo === 'todos' 
      ? entradas 
      : entradas.filter(e => e.tipo === filtroTipo)
    
    // Filtrar por termo de pesquisa
    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase()
      entradasFiltradas = entradasFiltradas.filter(e => 
        e.titulo.toLowerCase().includes(termo) ||
        e.descricao.toLowerCase().includes(termo) ||
        e.responsavel.toLowerCase().includes(termo)
      )
    }
    
    // Ordenar por data (mais recente primeiro)
    return entradasFiltradas.sort((a, b) => 
      new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
    )
  }, [alteracoesUnificadas, timelineUnificadas, filtroTipo, termoPesquisa])

  // Tipos únicos para o filtro
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set(todasEntradas.map(e => e.tipo))
    return Array.from(tipos)
  }, [todasEntradas])

  const getIconeAlteracao = (tipo: string) => {
    const icones = {
      // Tipos originais do contrato
      criacao: FileText,
      designacao_fiscais: Users,
      primeiro_pagamento: DollarSign,
      atualizacao_documentos: FileText,
      alteracao_valor: DollarSign,
      prorrogacao: Calendar,
      
      // Novos tipos da timeline/alterações contratuais
      alteracao_contratual: FileEdit,
      alteracao: FileEdit,
      observacao: MessageSquare,
      milestone: CheckCircle,
      documento: FileText,
      prazo: Calendar,
      
      // Tipos específicos de aditivos
      prazo_aditivo: Calendar,
      qualitativo: Settings,
      repactuacao: TrendingUp,
      quantidade: Package,
      reajuste: Calculator,
      repactuacao_reequilibrio: Scale,
    }

    const Icone = icones[tipo as keyof typeof icones] || Info
    return <Icone className="h-5 w-5" />
  }

  const getCorAlteracao = (tipo: string, prioridade?: string) => {
    // Cores baseadas na prioridade para entradas da timeline
    if (prioridade) {
      const coresPrioridade = {
        baixa: 'bg-gray-100 text-gray-600',
        media: 'bg-blue-100 text-blue-600', 
        alta: 'bg-orange-100 text-orange-600',
        critica: 'bg-red-100 text-red-600',
      }
      return coresPrioridade[prioridade as keyof typeof coresPrioridade] || 'bg-gray-100 text-gray-600'
    }
    
    // Cores tradicionais por tipo
    const cores = {
      // Tipos originais do contrato
      criacao: 'bg-blue-100 text-blue-600',
      designacao_fiscais: 'bg-green-100 text-green-600',
      primeiro_pagamento: 'bg-yellow-100 text-yellow-600',
      atualizacao_documentos: 'bg-purple-100 text-purple-600',
      alteracao_valor: 'bg-orange-100 text-orange-600',
      prorrogacao: 'bg-red-100 text-red-600',
      
      // Novos tipos da timeline
      alteracao_contratual: 'bg-purple-100 text-purple-600',
      alteracao: 'bg-purple-100 text-purple-600',
      observacao: 'bg-gray-100 text-gray-600',
      milestone: 'bg-green-100 text-green-600',
      documento: 'bg-blue-100 text-blue-600',
      prazo: 'bg-orange-100 text-orange-600',
      
      // Tipos específicos de aditivos  
      prazo_aditivo: 'bg-orange-100 text-orange-600',
      qualitativo: 'bg-purple-100 text-purple-600',
      repactuacao: 'bg-red-100 text-red-600',
      quantidade: 'bg-blue-100 text-blue-600',
      reajuste: 'bg-green-100 text-green-600',
      repactuacao_reequilibrio: 'bg-red-100 text-red-600',
    }

    return cores[tipo as keyof typeof cores] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros e ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Registro de Alterações
              <Badge variant="secondary" className="ml-2">
                {todasEntradas.length}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {onAdicionarObservacao && (
                <Button variant="outline" size="sm" onClick={onAdicionarObservacao}>
                  <Plus className="h-4 w-4 mr-2" />
                  Observação
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Pesquisa */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar alterações..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por tipo */}
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposDisponiveis.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {getTituloAlteracao(tipo)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline unificada */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Linha vertical */}
            <div className="bg-border absolute top-0 bottom-0 left-6 w-0.5"></div>

            <div className="space-y-6">
              {todasEntradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-32 items-center justify-center text-center"
                >
                  <div>
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">
                      {termoPesquisa || filtroTipo !== 'todos' 
                        ? 'Nenhuma alteração encontrada' 
                        : 'Nenhuma alteração registrada'}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {termoPesquisa || filtroTipo !== 'todos'
                        ? 'Tente ajustar os filtros para encontrar o que procura.'
                        : 'As alterações contratuais aparecerão aqui conforme forem criadas.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                todasEntradas.map((entrada, index) => (
                  <motion.div
                    key={entrada.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Ícone na linha do tempo */}
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${getCorAlteracao(entrada.tipo, entrada.prioridade)} `}
                    >
                      {getIconeAlteracao(entrada.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="min-w-0 flex-1">
                      <div className="bg-card rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold mb-1">
                              {entrada.titulo}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {formatarDataHora(entrada.dataHora)}
                              </Badge>
                              <Badge 
                                variant={entrada.origem === 'timeline' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {entrada.origem === 'contrato' ? 'Sistema' : 
                                 entrada.origem === 'timeline' ? 'Alteração' : 'Chat'}
                              </Badge>
                              {entrada.prioridade && entrada.prioridade !== 'media' && (
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  entrada.prioridade === 'alta' && "border-orange-200 text-orange-700",
                                  entrada.prioridade === 'critica' && "border-red-200 text-red-700",
                                  entrada.prioridade === 'baixa' && "border-gray-200 text-gray-600"
                                )}>
                                  {entrada.prioridade}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                          {entrada.descricao}
                        </p>

                        {/* Dados específicos da alteração contratual */}
                        {entrada.dados && 'valorOriginal' in entrada.dados && entrada.dados.valorOriginal && (
                          <div className="bg-muted/30 rounded-lg p-3 mb-3 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <span className="text-muted-foreground">Valor Original:</span>
                                <p className="font-medium">{currencyUtils.formatar(entrada.dados.valorOriginal)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Novo Valor:</span>
                                <p className="font-medium">{currencyUtils.formatar(entrada.dados.valorNovo)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Diferença:</span>
                                <p className={cn(
                                  "font-medium",
                                  entrada.dados.diferenca > 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {entrada.dados.diferenca > 0 ? "+" : ""}{currencyUtils.formatar(entrada.dados.diferenca)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {entrada.tags && entrada.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {entrada.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>Por: {entrada.responsavel}</span>
                          </div>
                          
                          {entrada.origem === 'chat' && onMarcarChatComoAlteracao && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => onMarcarChatComoAlteracao(entrada.id)}
                            >
                              <Bookmark className="h-3 w-3 mr-1" />
                              Marcar como Alteração
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de tipos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiposDisponiveis.map((tipo, index) => {
              const count = todasEntradas.filter(e => e.tipo === tipo).length
              return (
                <motion.div
                  key={tipo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-lg border p-3 text-center hover:shadow-md transition-shadow cursor-pointer ${getCorAlteracao(tipo).replace('text-', 'border-').replace('-600', '-200')} `}
                  onClick={() => setFiltroTipo(tipo)}
                >
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${getCorAlteracao(tipo)} `}>
                    {getIconeAlteracao(tipo)}
                  </div>
                  <h4 className="mb-1 text-sm font-medium">{getTituloAlteracao(tipo)}</h4>
                  <p className="text-muted-foreground text-xs">
                    {count} {count === 1 ? 'registro' : 'registros'}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
