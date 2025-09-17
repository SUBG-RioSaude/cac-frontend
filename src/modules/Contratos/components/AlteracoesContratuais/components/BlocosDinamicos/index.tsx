import { useMemo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  FileText,
  Clock,
  DollarSign,
  Users,
  Building2,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Info,
  Circle
} from 'lucide-react'

import { BlocoClausulas } from './BlocoClausulas'
import { BlocoVigencia } from './BlocoVigencia'
import { BlocoValor } from './BlocoValor'
import { BlocoFornecedores } from './BlocoFornecedores'
import { BlocoUnidades } from './BlocoUnidades'

import type {
  AlteracaoContratualForm,
  TipoAlteracao,
  BlocoClausulas as IBlocoClausulas,
  BlocoVigencia as IBlocoVigencia,
  BlocoValor as IBlocoValor,
  BlocoFornecedores as IBlocoFornecedores,
  BlocoUnidades as IBlocoUnidades
} from '../../../../types/alteracoes-contratuais'
import {
  getBlocosObrigatorios,
  getBlocosOpcionais
} from '../../../../types/alteracoes-contratuais'
import type { FornecedorResumoApi } from '@/modules/Empresas/types/empresa'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
  valorAtual?: number
}

interface ContractInfo {
  numeroContrato?: string
  objeto?: string
  valorTotal?: number
  dataInicio?: string
  dataTermino?: string
}

interface ContractContextData {
  contract: ContractInfo | undefined
  financials: {
    totalValue: number
    currentBalance: number
    executedPercentage: number
  }
  terms: {
    startDate: string | null
    endDate: string | null
    isActive: boolean
  }
  suppliers: {
    suppliers: FornecedorResumoApi[]
    mainSupplier: FornecedorResumoApi
  }
  units: {
    demandingUnit: string | null
    managingUnit: string | null
    linkedUnits: TransformedUnidade[]
  }
  isLoading: boolean
}

interface BlocosDinamicosProps {
  tiposSelecionados: TipoAlteracao[]
  dados: Partial<AlteracaoContratualForm>
  onChange: (dados: Partial<AlteracaoContratualForm>) => void
  contractContext?: ContractContextData
  errors?: Record<string, string>
  disabled?: boolean
  onContextChange?: () => void // Para invalidar contexto quando necessário
}

interface BlocoInfo {
  id: string
  label: string
  icone: React.ElementType
  cor: string
  descricao: string
  obrigatorio: boolean
  progresso?: {
    atual: number
    total: number
  }
  resumo?: string
  completo?: boolean
}

const BLOCOS_CONFIG: Record<string, Omit<BlocoInfo, 'obrigatorio'>> = {
  clausulas: {
    id: 'clausulas',
    label: 'Cláusulas',
    icone: FileText,
    cor: 'blue',
    descricao: 'Especificar cláusulas excluídas, incluídas ou alteradas'
  },
  vigencia: {
    id: 'vigencia',
    label: 'Vigência',
    icone: Clock,
    cor: 'green',
    descricao: 'Alterar prazos e datas de vigência do contrato'
  },
  valor: {
    id: 'valor',
    label: 'Valor',
    icone: DollarSign,
    cor: 'purple',
    descricao: 'Modificar valores financeiros do contrato'
  },
  fornecedores: {
    id: 'fornecedores',
    label: 'Fornecedores',
    icone: Users,
    cor: 'orange',
    descricao: 'Vincular ou desvincular fornecedores'
  },
  unidades: {
    id: 'unidades',
    label: 'Unidades',
    icone: Building2,
    cor: 'teal',
    descricao: 'Vincular ou desvincular unidades de saúde'
  }
}

export function BlocosDinamicos({
  tiposSelecionados = [],
  dados = {},
  onChange,
  contractContext,
  errors = {},
  disabled = false,
  onContextChange
}: BlocosDinamicosProps) {
  // Estado para controlar quais blocos estão expandidos
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())

  // Função para calcular resumo e progresso de cada bloco
  const calculateBlockInfo = useCallback((blocoId: string, dadosBloco: IBlocoClausulas | IBlocoVigencia | IBlocoValor | IBlocoFornecedores | IBlocoUnidades | undefined) => {
    if (!dadosBloco) return { progresso: { atual: 0, total: 0 }, resumo: 'Clique para configurar', completo: false }

    switch (blocoId) {
      case 'valor': {
        const dadosValor = dadosBloco as IBlocoValor
        const totalCampos = 2
        const preenchidos = [
          dadosValor.operacao !== undefined && dadosValor.operacao !== null,
          dadosValor.valorAjuste !== undefined && dadosValor.valorAjuste !== null && dadosValor.valorAjuste !== 0
        ].filter(Boolean).length
        const valor = dadosValor.valorAjuste || 0
        const operacao = dadosValor.operacao === 1 ? '+' : dadosValor.operacao === 2 ? '-' : '='
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
        
        // Calcular percentual para o resumo
        const valorOriginalContrato = contractContext?.financials?.totalValue || contractContext?.contract?.valorTotal || 0
        const percentual = valorOriginalContrato > 0 ? (valor / valorOriginalContrato) * 100 : 0
        const percentualTexto = percentual > 0 ? ` (${percentual.toFixed(1)}%)` : ''
        
        return {
          progresso: { atual: preenchidos, total: totalCampos },
          resumo: valor > 0 ? `${operacao}${valorFormatado}${percentualTexto}` : 'Clique para configurar',
          completo: preenchidos === totalCampos
        }
      }
      case 'vigencia': {
        const db = dadosBloco as IBlocoVigencia
        const campos = ['operacao', 'valorTempo']
        const preenchidos = (db.operacao !== undefined ? 1 : 0) + (db.valorTempo !== undefined ? 1 : 0)
        const tempo = db.valorTempo || 0
        const unidade = db.tipoUnidade === 1 ? 'dia(s)' : db.tipoUnidade === 2 ? 'mês(es)' : 'ano(s)'
        const operacao = db.operacao === 1 ? 'Prorrogar' : db.operacao === 2 ? 'Diminuir' : 'Alterar'
        return {
          progresso: { atual: preenchidos, total: campos.length },
          resumo: tempo > 0 ? `${operacao} por ${tempo} ${unidade}` : 'Clique para configurar',
          completo: preenchidos === campos.length
        }
      }
      case 'fornecedores': {
        const db = dadosBloco as IBlocoFornecedores
        const vinculados = db.fornecedoresVinculados?.length || 0
        const desvinculados = db.fornecedoresDesvinculados?.length || 0
        const total = vinculados + desvinculados
        return {
          progresso: { atual: total > 0 ? 1 : 0, total: 1 },
          resumo: total > 0 ? `${vinculados} vinculados, ${desvinculados} desvinculados` : 'Clique para configurar',
          completo: total > 0
        }
      }
      case 'unidades': {
        const db = dadosBloco as IBlocoUnidades
        const vinculadas = db.unidadesVinculadas?.length || 0
        const desvinculadas = db.unidadesDesvinculadas?.length || 0
        const total = vinculadas + desvinculadas
        
        // Verificar se valor está 100% distribuído
        const valorContrato = contractContext?.financials?.totalValue || contractContext?.contract?.valorTotal || 0
        let valorCompleto = true
        let resumoValor = ''
        
        if (valorContrato > 0) {
          // Calcular valor total distribuído (similar ao BlocoUnidades)
          const valorJaVinculado = contractContext?.units?.linkedUnits?.reduce((sum: number, unit: TransformedUnidade) => sum + (unit.valorAtual || 0), 0) || 0
          const valorNovasVinculadas = db.unidadesVinculadas?.reduce((sum, unit) => sum + unit.valorAtribuido, 0) || 0
          const valorDesvinculado = db.unidadesDesvinculadas?.reduce((sum, unitId) => {
            const unidade = contractContext?.units?.linkedUnits?.find((u: TransformedUnidade) => u.id === unitId)
            return sum + (unidade?.valorAtual || 0)
          }, 0) || 0
          
          const valorTotalDistribuido = valorJaVinculado + valorNovasVinculadas - valorDesvinculado
          const percentual = (valorTotalDistribuido / valorContrato) * 100
          valorCompleto = Math.abs(valorContrato - valorTotalDistribuido) < 0.01
          
          resumoValor = valorCompleto ? ' • 100% distribuído' : ` • ${percentual.toFixed(1)}% distribuído`
        }
        
        return {
          progresso: { atual: total > 0 && valorCompleto ? 1 : 0, total: 1 },
          resumo: total > 0 ? `${vinculadas} vinculadas, ${desvinculadas} desvinculadas${resumoValor}` : 'Clique para configurar',
          completo: total > 0 && valorCompleto
        }
      }
      case 'clausulas': {
        const db = dadosBloco as IBlocoClausulas
        const keys: Array<keyof IBlocoClausulas> = ['clausulasExcluidas','clausulasIncluidas','clausulasAlteradas']
        const campos = keys.filter(key => { const v = db[key]; return typeof v === 'string' && v.trim().length > 0 })
        return {
          progresso: { atual: campos.length, total: 3 }, // excluídas, incluídas, alteradas
          resumo: campos.length > 0 ? `${campos.length} tipo(s) de cláusula` : 'Clique para configurar',
          completo: campos.length > 0
        }
      }
      default:
        return { progresso: { atual: 0, total: 1 }, resumo: 'Clique para configurar', completo: false }
    }
  }, [contractContext])

  // Função para toggle de expand/collapse
  const toggleBlock = useCallback((blocoId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blocoId)) {
        newSet.delete(blocoId)
      } else {
        newSet.add(blocoId)
      }
      return newSet
    })
  }, [])
  // Calcular quais blocos devem ser exibidos
  const blocosInfo = useMemo(() => {
    if (tiposSelecionados.length === 0) return []

    const blocosObrigatorios = getBlocosObrigatorios(tiposSelecionados)
    const blocosOpcionais = getBlocosOpcionais(tiposSelecionados)
    const todosBlocos = new Set([...blocosObrigatorios, ...blocosOpcionais])

    return Array.from(todosBlocos).map(blocoId => {
      const dadosBloco = dados.blocos?.[blocoId as keyof typeof dados.blocos]
      const blockInfo = calculateBlockInfo(blocoId, dadosBloco)
      
      return {
        ...BLOCOS_CONFIG[blocoId],
        obrigatorio: blocosObrigatorios.has(blocoId),
        ...blockInfo
      }
    })
  }, [tiposSelecionados, dados, calculateBlockInfo])

  // Inicializar blocos obrigatórios como expandidos
  const initializeExpandedBlocks = useCallback(() => {
    const obrigatorios = blocosInfo
      .filter(bloco => bloco.obrigatorio)
      .map(bloco => bloco.id)
    
    setExpandedBlocks(new Set(obrigatorios))
  }, [blocosInfo])

  // Inicializar quando blocosInfo muda
  useEffect(() => {
    if (expandedBlocks.size === 0 && blocosInfo.length > 0) {
      initializeExpandedBlocks()
    }
  }, [blocosInfo, expandedBlocks.size, initializeExpandedBlocks])

  // Handlers para cada bloco
  const handleClausulasChange = (clausulas: unknown) => {
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        clausulas 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleVigenciaChange = (vigencia: unknown) => {
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        vigencia 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleValorChange = (valor: unknown) => {
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        valor 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleFornecedoresChange = (fornecedores: unknown) => {
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        fornecedores 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleUnidadesChange = (unidades: unknown) => {
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        unidades 
      } 
    } as Partial<AlteracaoContratualForm>)
    
    // Invalidar contexto para atualizar nomes das unidades demandante/gestora
    if (onContextChange) {
      onContextChange()
    }
  }

  // Função para renderizar cada bloco
  const renderBloco = (bloco: BlocoInfo) => {
    
    const blocoProps = {
      dados: (dados.blocos?.[bloco.id as keyof typeof dados.blocos] || {}) as Record<string, unknown>,
      onChange: () => {},
      errors: Object.keys(errors).reduce((acc, key) => {
        if (key.startsWith(`blocos.${bloco.id}.`)) {
          acc[key.replace(`blocos.${bloco.id}.`, '')] = errors[key]
        }
        return acc
      }, {} as Record<string, string>),
      disabled,
      required: bloco.obrigatorio
    }
    

    switch (bloco.id) {
      case 'clausulas':
        return (
          <BlocoClausulas
            {...blocoProps}
            contractInfo={contractContext?.contract}
            onChange={handleClausulasChange}
          />
        )
      case 'vigencia':
        return (
          <BlocoVigencia
            {...blocoProps}
            contractTerms={contractContext?.terms}
            onChange={handleVigenciaChange}
          />
        )
      case 'valor':
        return (
          <BlocoValor
            {...blocoProps}
            contractFinancials={contractContext?.financials}
            valorOriginal={contractContext?.financials?.totalValue || contractContext?.contract?.valorTotal || 0}
            onChange={handleValorChange}
          />
        )
      case 'fornecedores':
        return (
          <BlocoFornecedores
            {...blocoProps}
            contractSuppliers={contractContext?.suppliers}
            onChange={handleFornecedoresChange}
          />
        )
      case 'unidades':
        return (
          <BlocoUnidades
            {...blocoProps}
            contractUnits={contractContext?.units}
            contractValue={contractContext?.financials?.totalValue || contractContext?.contract?.valorTotal}
            onChange={handleUnidadesChange}
          />
        )
      default:
        return null
    }
  }

  if (tiposSelecionados.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-1">Nenhum tipo selecionado</h3>
            <p className="text-sm">
              Selecione um ou mais tipos de alteração para ver os blocos disponíveis
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Blocos de Alteração</span>
            <Badge variant="secondary">
              {(() => {
                const plural = blocosInfo.length !== 1
                const rotulo = plural ? 'disponíveis' : 'disponível'
                return `${blocosInfo.length} bloco${plural ? 's' : ''} ${rotulo}`
              })()}
            </Badge>
          </CardTitle>
          
          {/* Resumo dos blocos */}
          <div className="flex flex-wrap gap-2">
            {blocosInfo.map(bloco => {
              const Icon = bloco.icone
              const StatusIcon = bloco.completo ? CheckCircle2 : bloco.progresso?.atual > 0 ? Info : Circle
              
              return (
                <div
                  key={bloco.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors',
                    bloco.obrigatorio
                      ? bloco.completo 
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                      : bloco.completo
                        ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  )}
                  onClick={() => toggleBlock(bloco.id)}
                >
                  <Icon className="h-3 w-3" />
                  <span className="font-medium">{bloco.label}</span>
                  {bloco.progresso && bloco.progresso.total > 0 && (
                    <span className="text-xs opacity-75">
                      {bloco.progresso.atual}/{bloco.progresso.total}
                    </span>
                  )}
                  <StatusIcon className="h-3 w-3" />
                  {bloco.obrigatorio && !bloco.completo && (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Blocos dinâmicos */}
      <AnimatePresence>
        {blocosInfo.map((bloco, index) => {
          const isExpanded = expandedBlocks.has(bloco.id)
          const StatusIcon = bloco.completo ? CheckCircle2 : bloco.progresso?.atual > 0 ? Info : Circle
          
          return (
            <motion.div
              key={bloco.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleBlock(bloco.id)}>
                <Card className={cn(
                  'border-l-4',
                  bloco.obrigatorio 
                    ? bloco.completo 
                      ? 'border-l-green-500' 
                      : 'border-l-red-500'
                    : bloco.completo
                      ? 'border-l-blue-500'
                      : 'border-l-gray-300'
                )}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className={cn(
                      'pb-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      isExpanded && 'border-b'
                    )}>
                      <CardTitle role="heading" aria-level={3} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-md',
                            bloco.obrigatorio 
                              ? bloco.completo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              : bloco.completo
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                          )}>
                            <bloco.icone className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{bloco.label}</span>
                              <StatusIcon className="h-4 w-4" />
                              {bloco.obrigatorio ? (
                                <Badge 
                                  variant={bloco.completo ? "default" : "destructive"} 
                                  className="text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Obrigatório
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Info className="h-3 w-3 mr-1" />
                                  Opcional
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <p className="text-sm text-gray-600 font-normal">
                                {bloco.resumo}
                              </p>
                              {bloco.progresso && bloco.progresso.total > 0 && (
                                <div className="flex items-center gap-2 min-w-32">
                                  <Progress 
                                    value={(bloco.progresso.atual / bloco.progresso.total) * 100} 
                                    className="h-2 flex-1"
                                  />
                                  <span className="text-xs text-gray-500 font-medium">
                                    {bloco.progresso.atual}/{bloco.progresso.total}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-4">
                      {renderBloco(bloco)}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Avisos importantes */}
      {blocosInfo.some(b => b.obrigatorio) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                Blocos obrigatórios identificados
              </h4>
              <p className="text-sm text-amber-700">
                Os tipos de alteração selecionados tornam alguns blocos obrigatórios. 
                Todos os campos obrigatórios devem ser preenchidos para continuar.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
