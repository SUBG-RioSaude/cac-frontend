import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Clock,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  Info,
  Search,
  MessageSquare,
  Settings,
  TrendingUp,
  Package,
  Calculator,
  FileEdit,
  Bookmark,
  AlertTriangle,
  Building2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato'
import type { AlteracaoContratualResponse } from '@/modules/Contratos/types/alteracoes-contratuais'
import type { TimelineEntry } from '@/modules/Contratos/types/timeline'
import { cn, currencyUtils } from '@/lib/utils'
import { CurrencyDisplay, DateDisplay } from '@/components/ui/formatters'
import { useEmpresasByIds } from '@/modules/Empresas/hooks/use-empresas'
import { useUnidadesByIds } from '@/modules/Unidades/hooks/use-unidades'
import { useHistoricoFuncionarios, type HistoricoFuncionario } from '@/modules/Contratos/hooks/use-historico-funcionarios'

interface RegistroAlteracoesProps {
  contratoId: string // Necessário para buscar histórico de funcionários
  alteracoes: AlteracaoContrato[]
  entradasTimeline?: TimelineEntry[] // Entradas vindas do sistema de timeline/alterações contratuais
  onMarcarChatComoAlteracao?: (chatId: string) => void
  onAdicionarObservacao?: () => void
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

interface DadosFuncionario {
  funcionario: HistoricoFuncionario
  acao: 'adicionado' | 'removido' | 'substituido'
  funcionarioAnterior?: HistoricoFuncionario // Para casos de substituição
}

// Tipo unificado para exibição
interface EntradaUnificada {
  id: string
  tipo: string
  titulo: string
  descricao: string
  dataHora: string
  responsavel: string
  origem: 'contrato' | 'timeline' | 'chat' | 'funcionario'
  dados?: DadosAlteracaoContratual | DadosMilestone | AlteracaoContrato | DadosFuncionario
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  tags?: string[]
  status?: string
}

// Função para criar resumo limpo baseado nos dados estruturados
function criarResumoLimpo(alteracao: AlteracaoContrato): string {
  // Se a API já fornece um resumo pronto, usar ele (dados mais ricos)
  if (alteracao.resumoAlteracao) {
    return alteracao.resumoAlteracao
  }
  
  // Fallback: criar resumo baseado nos dados estruturados
  // Mapear tanto strings antigas quanto IDs numéricos da API para classificação precisa
  const tipoMap: Record<string | number, string> = {
    // Strings antigas (manter compatibilidade)
    'prazo_aditivo': 'Aditivo de Prazo',
    'qualitativo': 'Aditivo Qualitativo', 
    'alteracao_valor': 'Aditivo de Quantidade',
    'repactuacao': 'Repactuação',
    'reajuste': 'Reajuste',
    'quantidade': 'Aditivo de Quantidade',
    'reequilibrio': 'Reequilíbrio',
    'rescisao': 'Rescisão',
    'supressao': 'Supressão',
    'suspensao': 'Suspensão',
    'apostilamento': 'Apostilamento',
    'sub_rogacao': 'Sub-rogação',
    
    // IDs numéricos da API (baseado no curl /api/alteracoes-contratuais/tipos)
    1: 'Aditivo - Prazo',
    3: 'Aditivo - Qualitativo',
    4: 'Aditivo - Quantidade', // Este é o que estava aparecendo como repactuação
    7: 'Reajuste',
    8: 'Repactuação',
    9: 'Reequilíbrio',
    11: 'Rescisão',
    12: 'Supressão',
    13: 'Suspensão',
    0: 'Apostilamento',
    6: 'Sub-rogação'
  }
  
  const tipoTexto = tipoMap[alteracao.tipo] || 'Alteração Contratual'
  
  // Identificar o resumo mais relevante baseado no conteúdo
  const detalhes: string[] = []
  
  // Vigência (prioritária para resumo)
  if (alteracao.vigencia) {
    const operacao = alteracao.vigencia.operacao === 1 ? 'Acrescentar' : 
                    alteracao.vigencia.operacao === 2 ? 'Diminuir' : 'Alterar'
    const unidade = alteracao.vigencia.tipoUnidade === 1 ? 'dia(s)' :
                   alteracao.vigencia.tipoUnidade === 2 ? 'mês(es)' : 'ano(s)'
    detalhes.push(`${operacao} ${alteracao.vigencia.valorTempo} ${unidade}`)
  }
  
  // Valor (segundo mais importante)
  if (alteracao.valor?.valorAjuste) {
    const operacao = alteracao.valor.operacao === 1 ? '+' : 
                    alteracao.valor.operacao === 2 ? '-' : '='
    const valor = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(alteracao.valor.valorAjuste)
    detalhes.push(`${operacao}${valor}`)
  }
  
  // Outros blocos (resumir quantidade)
  const outrosBlocos = []
  if (alteracao.fornecedores) outrosBlocos.push('Fornecedores')
  if (alteracao.unidades) outrosBlocos.push('Unidades')  
  if (alteracao.clausulas && (alteracao.clausulas.clausulasExcluidas || alteracao.clausulas.clausulasIncluidas || alteracao.clausulas.clausulasAlteradas)) {
    outrosBlocos.push('Cláusulas')
  }
  
  if (outrosBlocos.length > 0) {
    detalhes.push(outrosBlocos.join(', '))
  }
  
  // Montar resumo final conciso
  if (detalhes.length > 0) {
    return `${tipoTexto} - ${detalhes.join(' | ')}`
  } else {
    return tipoTexto
  }
}

// Componente helper para badges com estados de loading/error
interface SmartBadgeProps {
  result: { nome: string; status: 'loading' | 'error' | 'not_found' | 'success'; fullId?: string }
  variant?: 'default' | 'destructive' | 'secondary'
  className?: string
  showTooltip?: boolean
}

function SmartBadge({ result, variant = 'default', className = '', showTooltip = true }: SmartBadgeProps) {
  const getVariantForStatus = () => {
    if (result.status === 'error') return 'destructive'
    if (result.status === 'loading') return 'secondary'
    if (result.status === 'not_found') return 'outline'
    return variant
  }

  const badge = (
    <Badge variant={getVariantForStatus()} className={cn("text-xs", className)}>
      {result.status === 'loading' && <div className="animate-pulse mr-1">⟳</div>}
      {result.status === 'error' && <div className="mr-1">⚠</div>}
      {result.nome}
    </Badge>
  )

  if (showTooltip && (result.status === 'error' || result.status === 'not_found') && result.fullId) {
    return (
      <div title={`ID completo: ${result.fullId}${result.status === 'error' ? ' (Erro ao carregar)' : ' (Não encontrado)'}`}>
        {badge}
      </div>
    )
  }

  return badge
}

// Componente helper para blocos collapsible
interface CollapsibleBlockProps {
  icon: React.ElementType
  title: string
  summary: string
  bgColor: string
  borderColor: string
  titleColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleBlock({ 
  icon: Icon, 
  title, 
  summary, 
  bgColor, 
  borderColor, 
  titleColor, 
  children, 
  defaultOpen = false 
}: CollapsibleBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-3">
      <CollapsibleTrigger className={`w-full ${bgColor} border ${borderColor} rounded-lg p-3 hover:opacity-80 transition-opacity`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${titleColor.replace('text-', 'text-')}`} />
            <div className="text-left">
              <h4 className={`font-medium text-sm ${titleColor}`}>{title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{summary}</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className={`${bgColor} border-x border-b ${borderColor} rounded-b-lg px-3 pb-3`}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

// Helper function para renderizar detalhes da alteração
function renderDetalhesAlteracao(
  entrada: EntradaUnificada, 
  getEmpresaNome: (id: string) => { nome: string; status: 'loading' | 'error' | 'not_found' | 'success'; fullId?: string },
  getUnidadeNome: (id: string) => { nome: string; status: 'loading' | 'error' | 'not_found' | 'success'; fullId?: string }
) {
  // Se for uma entrada de funcionário, renderizar detalhes específicos
  if (entrada.origem === 'funcionario') {
    const dadosFuncionario = entrada.dados as DadosFuncionario
    if (!dadosFuncionario) return null

    const funcionario = dadosFuncionario.funcionario
    const acao = dadosFuncionario.acao
    const funcionarioAnterior = dadosFuncionario.funcionarioAnterior

    return (
      <div className="bg-muted/30 rounded-lg p-3 mb-3 text-sm">
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground font-medium">Funcionário:</span>
              <p className="text-sm">{funcionario.funcionarioNome}</p>
              <p className="text-xs text-muted-foreground">
                Matrícula: {funcionario.funcionarioMatricula} | Cargo: {funcionario.funcionarioCargo}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Função:</span>
              <p className="text-sm">{funcionario.tipoGerenciaDescricao}</p>
              <p className="text-xs text-muted-foreground">
                Período: {funcionario.periodoFormatado} ({funcionario.diasNaFuncao} dias)
              </p>
            </div>
          </div>

          {acao === 'substituido' && funcionarioAnterior && (
            <div className="mt-3 pt-2 border-t border-muted-foreground/20">
              <span className="text-muted-foreground font-medium">Funcionário Anterior:</span>
              <p className="text-sm">{funcionarioAnterior.funcionarioNome}</p>
              <p className="text-xs text-muted-foreground">
                Matrícula: {funcionarioAnterior.funcionarioMatricula} | Cargo: {funcionarioAnterior.funcionarioCargo}
              </p>
            </div>
          )}

          {funcionario.motivoAlteracaoDescricao && (
            <div className="mt-2">
              <span className="text-muted-foreground font-medium">Motivo:</span>
              <p className="text-sm">{funcionario.motivoAlteracaoDescricao}</p>
            </div>
          )}

          {funcionario.observacoes && (
            <div className="mt-2">
              <span className="text-muted-foreground font-medium">Observações:</span>
              <p className="text-sm">{funcionario.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Se for uma entrada da timeline antiga ou de outro tipo, usar o formato antigo
  if (entrada.origem === 'timeline' || entrada.origem === 'chat') {
    if (entrada.dados && 'valorOriginal' in entrada.dados && entrada.dados.valorOriginal) {
      return (
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
      )
    }
    return null
  }

  // Para entradas da nova API, usar os dados estruturados
  const alteracao = entrada.dados as unknown as AlteracaoContrato
  if (!alteracao) return null

  const sections = []

  // Alerta de Limite Legal
  if (alteracao.alertaLimiteLegal) {
    sections.push(
      <div key="alerta" className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800 mb-1">Limite Legal Excedido</p>
            <p className="text-red-700">{alteracao.alertaLimiteLegal}</p>
          </div>
        </div>
      </div>
    )
  }

  // Detalhes de Vigência
  if (alteracao.vigencia) {
    const operacaoTexto = alteracao.vigencia.operacao === 1 ? 'Acrescentar' : 
                         alteracao.vigencia.operacao === 2 ? 'Diminuir' : 'Substituir'
    const unidadeTexto = alteracao.vigencia.tipoUnidade === 1 ? 'dia(s)' :
                        alteracao.vigencia.tipoUnidade === 2 ? 'mês(es)' : 'ano(s)'
    
    const summary = `${operacaoTexto} ${alteracao.vigencia.valorTempo} ${unidadeTexto}`
    
    sections.push(
      <CollapsibleBlock
        key="vigencia"
        icon={Calendar}
        title="Alteração de Vigência"
        summary={summary}
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
        titleColor="text-blue-800"
      >
        <ol className="text-sm space-y-1 mt-2 ml-4 list-decimal">
          <li><span className="font-medium">Operação:</span> {operacaoTexto} {alteracao.vigencia.valorTempo} {unidadeTexto}</li>
          {alteracao.vigencia.observacoes && (
            <li><span className="font-medium">Observações:</span> {alteracao.vigencia.observacoes}</li>
          )}
        </ol>
      </CollapsibleBlock>
    )
  }

  // Detalhes de Valor
  if (alteracao.valor) {
    const operacaoTexto = alteracao.valor.operacao === 1 ? 'Acrescentar' : 
                         alteracao.valor.operacao === 2 ? 'Diminuir' : 'Substituir'
    const operacaoIcon = alteracao.valor.operacao === 1 ? ArrowUp : 
                        alteracao.valor.operacao === 2 ? ArrowDown : RotateCcw
    const OperacaoIcon = operacaoIcon
    
    const valorTexto = alteracao.valor.valorAjuste ? currencyUtils.formatar(alteracao.valor.valorAjuste) : ''
    const summary = `${operacaoTexto}${valorTexto ? ' ' + valorTexto : ''}`
    
    sections.push(
      <CollapsibleBlock
        key="valor"
        icon={DollarSign}
        title="Alteração de Valor"
        summary={summary}
        bgColor="bg-green-50"
        borderColor="border-green-200"
        titleColor="text-green-800"
      >
        <ol className="text-sm space-y-1 mt-2 ml-4 list-decimal">
          <li className="flex items-center gap-2">
            <OperacaoIcon className="h-3 w-3" />
            <span><span className="font-medium">Operação:</span> {operacaoTexto}</span>
          </li>
          {alteracao.valor.valorAjuste && (
            <li><span className="font-medium">Valor do Ajuste:</span> {currencyUtils.formatar(alteracao.valor.valorAjuste)}</li>
          )}
          {alteracao.valor.percentualAjuste && (
            <li><span className="font-medium">Percentual:</span> {alteracao.valor.percentualAjuste}%</li>
          )}
          {alteracao.valor.observacoes && (
            <li><span className="font-medium">Observações:</span> {alteracao.valor.observacoes}</li>
          )}
        </ol>
      </CollapsibleBlock>
    )
  }

  // Detalhes de Fornecedores
  if (alteracao.fornecedores) {
    const vinculados = alteracao.fornecedores.fornecedoresVinculados?.length || 0
    const desvinculados = alteracao.fornecedores.fornecedoresDesvinculados?.length || 0
    const summary = `${vinculados > 0 ? `+${vinculados} vinculados` : ''}${vinculados > 0 && desvinculados > 0 ? ', ' : ''}${desvinculados > 0 ? `-${desvinculados} desvinculados` : ''}`.trim() || 'Alterações nos fornecedores'
    
    sections.push(
      <CollapsibleBlock
        key="fornecedores"
        icon={Users}
        title="Alteração de Fornecedores"
        summary={summary}
        bgColor="bg-orange-50"
        borderColor="border-orange-200"
        titleColor="text-orange-800"
      >
        <div className="text-sm space-y-2 mt-2">
          {(alteracao.fornecedores.fornecedoresVinculados?.length || 0) > 0 && (
            <div>
              <span className="font-medium">Vinculados:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {alteracao.fornecedores.fornecedoresVinculados?.map((id: string, idx: number) => (
                  <SmartBadge key={`vinc-${idx}`} result={getEmpresaNome(id)} variant="default" />
                ))}
              </div>
            </div>
          )}
          {(alteracao.fornecedores.fornecedoresDesvinculados?.length || 0) > 0 && (
            <div>
              <span className="font-medium">Desvinculados:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {alteracao.fornecedores.fornecedoresDesvinculados?.map((id: string, idx: number) => (
                  <SmartBadge key={`desv-${idx}`} result={getEmpresaNome(id)} variant="destructive" />
                ))}
              </div>
            </div>
          )}
          {alteracao.fornecedores.novoFornecedorPrincipal && (
            <div>
              <span className="font-medium">Novo Principal:</span>
              <div className="mt-1">
                <SmartBadge result={getEmpresaNome(alteracao.fornecedores.novoFornecedorPrincipal)} variant="secondary" />
              </div>
            </div>
          )}
          {!(alteracao.fornecedores.fornecedoresVinculados?.length || 0) &&
            !(alteracao.fornecedores.fornecedoresDesvinculados?.length || 0) &&
            !alteracao.fornecedores.novoFornecedorPrincipal && (
              <div className="text-xs text-gray-600">Sem alterações detalhadas.</div>
            )}
          {alteracao.fornecedores.observacoes && (
            <div><span className="font-medium">Observações:</span> {alteracao.fornecedores.observacoes}</div>
          )}
        </div>
      </CollapsibleBlock>
    )
  }

  // Detalhes de Unidades
  if (alteracao.unidades) {
    const vinculadas = alteracao.unidades.unidadesVinculadas?.length || 0
    const desvinculadas = alteracao.unidades.unidadesDesvinculadas?.length || 0
    const summary = `${vinculadas > 0 ? `+${vinculadas} vinculadas` : ''}${vinculadas > 0 && desvinculadas > 0 ? ', ' : ''}${desvinculadas > 0 ? `-${desvinculadas} desvinculadas` : ''}`.trim() || 'Alterações nas unidades'
    
    sections.push(
      <CollapsibleBlock
        key="unidades"
        icon={Building2}
        title="Alteração de Unidades"
        summary={summary}
        bgColor="bg-teal-50"
        borderColor="border-teal-200"
        titleColor="text-teal-800"
      >
        <div className="text-sm space-y-2 mt-2">
          {(alteracao.unidades.unidadesVinculadas?.length || 0) > 0 && (
            <div>
              <span className="font-medium">Vinculadas:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {alteracao.unidades.unidadesVinculadas?.map((unidade: string | { unidadeSaudeId: string; id?: string; valorAtribuido?: number }, idx: number) => {
                  // Extrair o ID correto, seja string direta ou objeto com unidadeSaudeId
                  const unidadeId = typeof unidade === 'string' ? unidade : unidade?.unidadeSaudeId || unidade?.id
                  
                  // Se não conseguir extrair o ID, pular esta unidade
                  if (!unidadeId) return null
                  
                  const nomeResult = getUnidadeNome(unidadeId)
                  
                  return (
                    <div key={`uv-${idx}`} className="flex items-center">
                      <SmartBadge result={nomeResult} variant="default" />
                      {typeof unidade === 'object' && unidade.valorAtribuido && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (<CurrencyDisplay value={unidade.valorAtribuido} />)
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {(alteracao.unidades.unidadesDesvinculadas?.length || 0) > 0 && (
            <div>
              <span className="font-medium">Desvinculadas:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {alteracao.unidades.unidadesDesvinculadas?.map((id: string, idx: number) => (
                  <SmartBadge key={`ud-${idx}`} result={getUnidadeNome(id)} variant="destructive" />
                ))}
              </div>
            </div>
          )}
          {!(alteracao.unidades.unidadesVinculadas?.length || 0) &&
            !(alteracao.unidades.unidadesDesvinculadas?.length || 0) && (
              <div className="text-xs text-gray-600">Sem alterações detalhadas.</div>
            )}
          {alteracao.unidades.observacoes && (
            <div><span className="font-medium">Observações:</span> {alteracao.unidades.observacoes}</div>
          )}
        </div>
      </CollapsibleBlock>
    )
  }

  // Detalhes de Cláusulas
  if (alteracao.clausulas && (alteracao.clausulas.clausulasExcluidas || alteracao.clausulas.clausulasIncluidas || alteracao.clausulas.clausulasAlteradas)) {
    const tiposClausulas = []
    if (alteracao.clausulas.clausulasExcluidas) tiposClausulas.push('excluídas')
    if (alteracao.clausulas.clausulasIncluidas) tiposClausulas.push('incluídas')  
    if (alteracao.clausulas.clausulasAlteradas) tiposClausulas.push('alteradas')
    const summary = `Cláusulas ${tiposClausulas.join(', ')}`
    
    sections.push(
      <CollapsibleBlock
        key="clausulas"
        icon={FileText}
        title="Alteração de Cláusulas"
        summary={summary}
        bgColor="bg-purple-50"
        borderColor="border-purple-200"
        titleColor="text-purple-800"
      >
        <ol className="text-sm space-y-1 mt-2 ml-4 list-decimal">
          {alteracao.clausulas.clausulasExcluidas && (
            <li><span className="font-medium">Excluídas:</span> {alteracao.clausulas.clausulasExcluidas}</li>
          )}
          {alteracao.clausulas.clausulasIncluidas && (
            <li><span className="font-medium">Incluídas:</span> {alteracao.clausulas.clausulasIncluidas}</li>
          )}
          {alteracao.clausulas.clausulasAlteradas && (
            <li><span className="font-medium">Alteradas:</span> {alteracao.clausulas.clausulasAlteradas}</li>
          )}
        </ol>
      </CollapsibleBlock>
    )
  }

  return sections.length > 0 ? <div className="space-y-2">{sections}</div> : null
}

export function RegistroAlteracoes({
  contratoId,
  alteracoes,
  entradasTimeline = [],
  onMarcarChatComoAlteracao,
  onAdicionarObservacao,
}: RegistroAlteracoesProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 15,
    totalItens: 0
  })

  // Buscar histórico de funcionários
  const { data: historicoFuncionarios = [] } = useHistoricoFuncionarios(contratoId)

  // Build lookup of empresa IDs -> razão social to enrich fornecedores section
  const fornecedoresIds = useMemo(() => {
    const ids: string[] = []
    for (const alt of alteracoes || []) {
      if (alt.fornecedores) {
        if (Array.isArray(alt.fornecedores.fornecedoresVinculados)) {
          ids.push(...alt.fornecedores.fornecedoresVinculados.filter(Boolean))
        }
        if (Array.isArray(alt.fornecedores.fornecedoresDesvinculados)) {
          ids.push(...alt.fornecedores.fornecedoresDesvinculados.filter(Boolean))
        }
        if (alt.fornecedores.novoFornecedorPrincipal) {
          ids.push(alt.fornecedores.novoFornecedorPrincipal)
        }
      }
    }
    return Array.from(new Set(ids.filter(Boolean)))
  }, [alteracoes])
  const empresasLookup = useEmpresasByIds(fornecedoresIds, { enabled: fornecedoresIds.length > 0 })

  const getEmpresaNome = useCallback((id: string | number) => {
    // Garantir que id seja sempre string
    const idStr = String(id)
    if (empresasLookup.isLoading) {
      return { nome: 'Carregando...', status: 'loading' as const }
    }
    if (empresasLookup.error) {
      return { nome: `ID: ${idStr.slice(-8)}`, status: 'error' as const, fullId: idStr }
    }
    const nome = empresasLookup.data?.[idStr]?.razaoSocial
    if (!nome) {
      return { nome: `ID: ${idStr.slice(-8)}`, status: 'not_found' as const, fullId: idStr }
    }
    return { nome, status: 'success' as const }
  }, [empresasLookup.data, empresasLookup.isLoading, empresasLookup.error])
  
  // Build lookup of unidades IDs -> nome to enrich unidades section
  const unidadesIds = useMemo(() => {
    const ids: string[] = []
    for (const alt of alteracoes || []) {
      if (alt.unidades) {
        // Extrair IDs das unidades vinculadas (podem ser strings ou objetos)
        if (alt.unidades.unidadesVinculadas) {
          alt.unidades.unidadesVinculadas.forEach((unidade: string | { unidadeSaudeId: string; id?: string }) => {
            const id = typeof unidade === 'string' ? unidade : unidade?.unidadeSaudeId || unidade?.id
            if (id) ids.push(String(id))
          })
        }
        // Unidades desvinculadas são sempre strings
        if (alt.unidades.unidadesDesvinculadas) {
          alt.unidades.unidadesDesvinculadas.forEach((id: string | number) => {
            if (id) ids.push(String(id))
          })
        }
      }
    }
    return Array.from(new Set(ids.filter(Boolean)))
  }, [alteracoes])
  const unidadesLookup = useUnidadesByIds(unidadesIds, { enabled: unidadesIds.length > 0 })
  const getUnidadeNome = useCallback((id: string | number) => {
    // Garantir que id seja sempre string
    const idStr = String(id)
    if (unidadesLookup.isLoading) {
      return { nome: 'Carregando...', status: 'loading' as const }
    }
    if (unidadesLookup.error) {
      return { nome: `ID: ${idStr.slice(-8)}`, status: 'error' as const, fullId: idStr }
    }
    const nome = unidadesLookup.data?.[idStr]?.nome
    if (!nome) {
      return { nome: `ID: ${idStr.slice(-8)}`, status: 'not_found' as const, fullId: idStr }
    }
    return { nome, status: 'success' as const }
  }, [unidadesLookup.data, unidadesLookup.isLoading, unidadesLookup.error])
  

  const getStatusAlteracao = (alteracao: AlteracaoContrato) => {
    // Mapear status numéricos da API para texto legível
    const statusMap: Record<number, string> = {
      0: 'rascunho',
      1: 'pendente',  
      2: 'em_aprovacao',
      3: 'aprovado',
      4: 'executado',
      5: 'cancelado'
    }
    
    if (typeof alteracao.status === 'number') {
      return statusMap[alteracao.status] || 'indefinido'
    }
    
    // Fallback para strings antigas
    return String(alteracao.status || 'indefinido').toLowerCase()
  }

  const getTituloStatus = (status: string) => {
    const titulos: Record<string, string> = {
      'rascunho': 'Rascunho',
      'pendente': 'Pendente',
      'em_aprovacao': 'Em Aprovação', 
      'aprovado': 'Aprovado',
      'executado': 'Executado',
      'cancelado': 'Cancelado',
      'indefinido': 'Status Indefinido'
    }
    return titulos[status] || status
  }

  const getTituloAlteracao = (tipo: string | number) => {
    const titulos: Record<string | number, string> = {
      // Tipos originais do contrato
      criacao: 'Criação do Contrato',
      designacao_fiscais: 'Designação de Fiscal/Gestor',
      remocao_fiscais: 'Remoção de Fiscal/Gestor',
      substituicao_fiscais: 'Substituição de Fiscal/Gestor',
      primeiro_pagamento: 'Primeiro Pagamento',
      atualizacao_documentos: 'Atualização de Documentos',
      alteracao_valor: 'Aditivo de Quantidade',
      prorrogacao: 'Prorrogação de Prazo',
      
      // Novos tipos da timeline
      alteracao_contratual: 'Alteração Contratual',
      alteracao: 'Alteração',
      observacao: 'Observação',
      milestone: 'Marco',
      documento: 'Documento',
      prazo: 'Prazo',
      
      // Tipos específicos de aditivos da nova API (strings)
      prazo_aditivo: 'Aditivo de Prazo',
      qualitativo: 'Aditivo Qualitativo',
      repactuacao: 'Repactuação',
      quantidade: 'Aditivo de Quantidade',
      reajuste: 'Reajuste',
      reequilibrio: 'Reequilíbrio',
      rescisao: 'Rescisão',
      supressao: 'Supressão',
      suspensao: 'Suspensão',
      apostilamento: 'Apostilamento',
      sub_rogacao: 'Sub-rogação',
      
      // IDs numéricos da API (baseado no curl /api/alteracoes-contratuais/tipos)
      1: 'Aditivo - Prazo',
      3: 'Aditivo - Qualitativo',
      4: 'Aditivo - Quantidade', // Este é o correto para aditivo de quantidade
      7: 'Reajuste',
      8: 'Repactuação', // Este é o ID 8, não deve aparecer para aditivo de quantidade
      9: 'Reequilíbrio',
      11: 'Rescisão',
      12: 'Supressão',
      13: 'Suspensão',
      0: 'Apostilamento',
      6: 'Sub-rogação'
    }

    return titulos[tipo] || 'Alteração Contratual'
  }

  // Converter alterações do contrato para formato unificado
  const alteracoesUnificadas: EntradaUnificada[] = alteracoes.map(alt => ({
    id: alt.id,
    tipo: alt.tipo,
    titulo: getTituloAlteracao(alt.tipo),
    descricao: criarResumoLimpo(alt),
    dataHora: alt.dataHora,
    responsavel: alt.responsavel,
    origem: 'contrato' as const,
    dados: alt, // Incluir todos os dados da alteração para o renderDetalhesAlteracao
    status: getStatusAlteracao(alt) // Adicionar status para filtragem
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

  // Converter histórico de funcionários para formato unificado
  const funcionariosUnificados: EntradaUnificada[] = useMemo(() => {
    if (!historicoFuncionarios || historicoFuncionarios.length === 0) return []

    // Criar entradas baseadas nas mudanças de funcionários
    const entradas: EntradaUnificada[] = []

    // Agrupar por funcionário e tipo para detectar padrões
    const funcionariosPorTipo = historicoFuncionarios.reduce((acc, hist) => {
      const key = `${hist.funcionarioId}-${hist.tipoGerencia}`
      if (!acc[key]) acc[key] = []
      acc[key].push(hist)
      return acc
    }, {} as Record<string, HistoricoFuncionario[]>)

    // Para cada funcionário/tipo, criar eventos baseados nas transições
    Object.values(funcionariosPorTipo).forEach(periodos => {
      // Ordenar por data de início
      const periodosOrdenados = periodos.sort((a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      )

      periodosOrdenados.forEach((periodo, index) => {
        const tipoLabel = periodo.tipoGerenciaDescricao
        const funcionarioNome = periodo.funcionarioNome
        const matricula = periodo.funcionarioMatricula

        // Entrada para adição/início do período
        if (index === 0 || !periodosOrdenados[index - 1] ||
            new Date(periodosOrdenados[index - 1].dataFim || '').getTime() < new Date(periodo.dataInicio).getTime() - 86400000) {
          // Novo período (não é continuação)
          entradas.push({
            id: `func-add-${periodo.id}`,
            tipo: 'designacao_fiscais',
            titulo: `${tipoLabel} Designado`,
            descricao: `${funcionarioNome} (${matricula}) foi designado como ${tipoLabel.toLowerCase()}`,
            dataHora: periodo.dataInicio,
            responsavel: 'Sistema',
            origem: 'funcionario' as const,
            dados: {
              funcionario: periodo,
              acao: 'adicionado'
            } as DadosFuncionario,
            status: periodo.estaAtivo ? 'ativo' : 'inativo'
          })
        }

        // Entrada para remoção/fim do período
        if (periodo.dataFim) {
          entradas.push({
            id: `func-rem-${periodo.id}`,
            tipo: 'remocao_fiscais',
            titulo: `${tipoLabel} Removido`,
            descricao: `${funcionarioNome} (${matricula}) foi removido da função de ${tipoLabel.toLowerCase()}${periodo.motivoAlteracaoDescricao ? ` - ${periodo.motivoAlteracaoDescricao}` : ''}`,
            dataHora: periodo.dataFim,
            responsavel: 'Sistema',
            origem: 'funcionario' as const,
            dados: {
              funcionario: periodo,
              acao: 'removido'
            } as DadosFuncionario,
            status: 'removido'
          })
        }

        // Detectar substituições (quando há um período seguinte imediatamente)
        const proximoPeriodo = periodosOrdenados[index + 1]
        if (proximoPeriodo && periodo.dataFim &&
            Math.abs(new Date(proximoPeriodo.dataInicio).getTime() - new Date(periodo.dataFim).getTime()) < 86400000) {
          // É uma substituição
          entradas.push({
            id: `func-subst-${periodo.id}-${proximoPeriodo.id}`,
            tipo: 'substituicao_fiscais',
            titulo: `${tipoLabel} Substituído`,
            descricao: `${funcionarioNome} (${matricula}) foi substituído por ${proximoPeriodo.funcionarioNome} (${proximoPeriodo.funcionarioMatricula})`,
            dataHora: proximoPeriodo.dataInicio,
            responsavel: 'Sistema',
            origem: 'funcionario' as const,
            dados: {
              funcionario: proximoPeriodo,
              acao: 'substituido',
              funcionarioAnterior: periodo
            } as DadosFuncionario,
            status: 'substituido'
          })
        }
      })
    })

    return entradas
  }, [historicoFuncionarios])

  // Unificar e filtrar todas as entradas
  const entradasFiltradas = useMemo(() => {
    const entradas = [...alteracoesUnificadas, ...timelineUnificadas, ...funcionariosUnificados]

    // Filtrar por tipo
    let resultado = filtroTipo === 'todos'
      ? entradas
      : entradas.filter(e => e.tipo === filtroTipo)

    // Filtrar por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(e => e.status === filtroStatus)
    }

    // Filtrar por termo de pesquisa
    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase()
      resultado = resultado.filter(e =>
        e.titulo.toLowerCase().includes(termo) ||
        e.descricao.toLowerCase().includes(termo) ||
        e.responsavel.toLowerCase().includes(termo)
      )
    }

    // Ordenar por data (mais recente primeiro)
    return resultado.sort((a, b) =>
      new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
    )
  }, [alteracoesUnificadas, timelineUnificadas, funcionariosUnificados, filtroTipo, filtroStatus, termoPesquisa])

  // Aplicar paginação nas entradas filtradas
  const { entradasPaginadas, totalPaginas } = useMemo(() => {
    const total = entradasFiltradas.length
    const inicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina
    const fim = inicio + paginacao.itensPorPagina

    return {
      entradasPaginadas: entradasFiltradas.slice(inicio, fim),
      totalPaginas: Math.ceil(total / paginacao.itensPorPagina)
    }
  }, [entradasFiltradas, paginacao.paginaAtual, paginacao.itensPorPagina])

  // Reset da paginação quando filtros mudarem
  useEffect(() => {
    setPaginacao(prev => ({
      ...prev,
      paginaAtual: 1,
      totalItens: entradasFiltradas.length
    }))
  }, [filtroTipo, filtroStatus, termoPesquisa, entradasFiltradas.length])

  // Tipos únicos para o filtro
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set(entradasFiltradas.map(e => e.tipo))
    return Array.from(tipos)
  }, [entradasFiltradas])

  // Status únicos para o filtro (apenas de alterações de contrato)
  const statusDisponiveis = useMemo(() => {
    const status = new Set(
      alteracoesUnificadas
        .map(e => e.status)
        .filter(Boolean) // Remover undefined
    )
    return Array.from(status)
  }, [alteracoesUnificadas])

  const getIconeAlteracao = (tipo: string) => {
    const icones = {
      // Tipos originais do contrato
      criacao: FileText,
      designacao_fiscais: Users,
      remocao_fiscais: Users,
      substituicao_fiscais: Users,
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
      
      // Tipos específicos de aditivos da nova API
      prazo_aditivo: Calendar,
      qualitativo: Settings,
      repactuacao: TrendingUp,
      quantidade: Package,
      reajuste: Calculator,
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
      remocao_fiscais: 'bg-red-100 text-red-600',
      substituicao_fiscais: 'bg-orange-100 text-orange-600',
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
      
      // Tipos específicos de aditivos da nova API
      prazo_aditivo: 'bg-orange-100 text-orange-600',
      qualitativo: 'bg-purple-100 text-purple-600',
      repactuacao: 'bg-red-100 text-red-600',
      quantidade: 'bg-blue-100 text-blue-600',
      reajuste: 'bg-green-100 text-green-600',
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
                {entradasFiltradas.length}
              </Badge>
            </CardTitle>
            {onAdicionarObservacao && (
              <Button
                variant="default"
                size="sm"
                onClick={onAdicionarObservacao}
                aria-label="Observação"
              >
                Observação
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3">
            {/* Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar alterações..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Filtro por tipo */}
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
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

              {/* Filtro por status */}
              {statusDisponiveis.length > 0 && (
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {statusDisponiveis.map(status => status ? (
                      <SelectItem key={status} value={status}>
                        {getTituloStatus(status)}
                      </SelectItem>
                    ) : null)}
                  </SelectContent>
                </Select>
              )}
            </div>
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
              {entradasPaginadas.length === 0 ? (
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
                entradasPaginadas.map((entrada, index) => (
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
                                <DateDisplay value={entrada.dataHora} format="datetime" />
                              </Badge>
                              <Badge 
                                variant={entrada.origem === 'timeline' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {entrada.origem === 'contrato' ? 'Sistema' :
                                 entrada.origem === 'timeline' ? 'Alteração' :
                                 entrada.origem === 'funcionario' ? 'Funcionários' : 'Chat'}
                              </Badge>
                              {entrada.status && entrada.origem === 'contrato' && (
                                <Badge 
                                  variant={
                                    entrada.status === 'executado' ? 'default' :
                                    entrada.status === 'aprovado' ? 'secondary' :
                                    entrada.status === 'rascunho' ? 'outline' :
                                    'destructive'
                                  } 
                                  className={cn(
                                    "text-xs",
                                    entrada.status === 'executado' && "bg-green-100 text-green-800 border-green-200",
                                    entrada.status === 'aprovado' && "bg-blue-100 text-blue-800 border-blue-200",
                                    entrada.status === 'rascunho' && "bg-gray-100 text-gray-600 border-gray-200"
                                  )}
                                >
                                  {getTituloStatus(entrada.status)}
                                </Badge>
                              )}
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
                              {(entrada.dados as unknown as AlteracaoContrato)?.requerConfirmacaoLimiteLegal && (
                                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Limite Legal
                                </Badge>
                              )}
                              {entrada.origem === 'contrato' && (entrada.dados as unknown as AlteracaoContratualResponse)?.podeSerEditada && (
                                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                  Editável
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 text-sm leading-relaxed">
                          <div 
                            className="text-muted-foreground break-words whitespace-pre-wrap max-h-24 overflow-y-auto prose prose-sm max-w-none"
                            style={{ 
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto'
                            }}
                          >
                            {entrada.descricao}
                          </div>
                        </div>

                        {/* Dados específicos da alteração contratual */}
                        {renderDetalhesAlteracao(entrada, getEmpresaNome, getUnidadeNome)}

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

            {/* Paginação */}
            {entradasFiltradas.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                {/* Indicador de itens e seletor de itens por página */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando{' '}
                    <span className="font-medium">
                      {Math.min((paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1, entradasFiltradas.length)}
                    </span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, entradasFiltradas.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{entradasFiltradas.length}</span>
                    {' '}entradas
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Itens por página:</span>
                    <Select
                      value={String(paginacao.itensPorPagina)}
                      onValueChange={(value) => setPaginacao(prev => ({
                        ...prev,
                        itensPorPagina: Number(value),
                        paginaAtual: 1
                      }))}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Controles de navegação */}
                {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: prev.paginaAtual - 1 }))}
                    disabled={paginacao.paginaAtual === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      // Calcular as páginas a mostrar (máximo 5)
                      let startPage = Math.max(1, paginacao.paginaAtual - 2)
                      const endPage = Math.min(totalPaginas, startPage + 4)

                      // Ajustar se estivermos próximo do fim
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4)
                      }

                      const pageNum = startPage + i
                      if (pageNum > endPage) return null

                      return (
                        <Button
                          key={pageNum}
                          variant={paginacao.paginaAtual === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: pageNum }))}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: prev.paginaAtual + 1 }))}
                    disabled={paginacao.paginaAtual === totalPaginas}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                )}
              </div>
            )}
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
              const count = entradasFiltradas.filter(e => e.tipo === tipo).length
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
