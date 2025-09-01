import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FileText,
  Clock,
  DollarSign,
  Users,
  Building2,
  AlertTriangle
} from 'lucide-react'

import { BlocoClausulas } from './BlocoClausulas'
import { BlocoVigencia } from './BlocoVigencia'
import { BlocoValor } from './BlocoValor'
import { BlocoFornecedores } from './BlocoFornecedores'
import { BlocoUnidades } from './BlocoUnidades'

import type {
  AlteracaoContratualForm,
  TipoAlteracao
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
}

interface BlocoInfo {
  id: string
  label: string
  icone: React.ElementType
  cor: string
  descricao: string
  obrigatorio: boolean
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
  disabled = false
}: BlocosDinamicosProps) {
  // Calcular quais blocos devem ser exibidos
  const blocosInfo = useMemo(() => {
    if (tiposSelecionados.length === 0) return []

    const blocosObrigatorios = getBlocosObrigatorios(tiposSelecionados)
    const blocosOpcionais = getBlocosOpcionais(tiposSelecionados)
    const todosBlocos = new Set([...blocosObrigatorios, ...blocosOpcionais])

    return Array.from(todosBlocos).map(blocoId => ({
      ...BLOCOS_CONFIG[blocoId],
      obrigatorio: blocosObrigatorios.has(blocoId)
    }))
  }, [tiposSelecionados])

  // Handlers para cada bloco
  const handleClausulasChange = (clausulas: unknown) => {
    console.log('🔧 handleClausulasChange:', clausulas)
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        clausulas 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleVigenciaChange = (vigencia: unknown) => {
    console.log('🔧 handleVigenciaChange:', vigencia)
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        vigencia 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleValorChange = (valor: unknown) => {
    console.log('🔧 handleValorChange:', valor)
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        valor 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleFornecedoresChange = (fornecedores: unknown) => {
    console.log('🔧 handleFornecedoresChange:', fornecedores)
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        fornecedores 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  const handleUnidadesChange = (unidades: unknown) => {
    console.log('🔧 handleUnidadesChange:', unidades)
    onChange({ 
      ...dados, 
      blocos: { 
        ...dados.blocos, 
        unidades 
      } 
    } as Partial<AlteracaoContratualForm>)
  }

  // Função para renderizar cada bloco
  const renderBloco = (bloco: BlocoInfo) => {
    console.log(`🔧 Renderizando bloco ${bloco.id}:`)
    console.log('   - dados.blocos:', dados.blocos)
    console.log(`   - dados.blocos.${bloco.id}:`, dados.blocos?.[bloco.id as keyof typeof dados.blocos])
    
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
    
    console.log(`   - blocoProps.dados:`, blocoProps.dados)

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
              {blocosInfo.length} bloco{blocosInfo.length !== 1 ? 's' : ''} disponível
              {blocosInfo.length !== 1 ? 'is' : ''}
            </Badge>
          </CardTitle>
          
          {/* Resumo dos blocos */}
          <div className="flex flex-wrap gap-2">
            {blocosInfo.map(bloco => {
              const Icon = bloco.icone
              const temDados = dados.blocos?.[bloco.id as keyof typeof dados.blocos]
              
              return (
                <div
                  key={bloco.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 rounded-full text-sm border',
                    bloco.obrigatorio
                      ? temDados 
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                      : temDados
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span className="font-medium">{bloco.label}</span>
                  {bloco.obrigatorio && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Blocos dinâmicos */}
      <AnimatePresence>
        {blocosInfo.map((bloco, index) => (
          <motion.div
            key={bloco.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              'border-l-4',
              bloco.obrigatorio ? 'border-l-red-500' : 'border-l-blue-500'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-md',
                      bloco.obrigatorio 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      <bloco.icone className="h-5 w-5" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{bloco.label}</span>
                        {bloco.obrigatorio && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-normal">
                        {bloco.descricao}
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {renderBloco(bloco)}
              </CardContent>
            </Card>
          </motion.div>
        ))}
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