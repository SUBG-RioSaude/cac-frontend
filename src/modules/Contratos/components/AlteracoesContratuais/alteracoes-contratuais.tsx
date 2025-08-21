import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  MessageSquare,
  Calculator,
  Eye,
  CheckCircle,
} from 'lucide-react'

import { TipoAditivoSelector } from './tipo-aditivo-selector'
import { DatasTimeline } from './datas-timeline'
import { DetalhamentoForm } from './detalhamento-form'
import { ValoresCalculator } from './valores-calculator'
import { PreviewCard } from './preview-card'

import type { 
  AlteracaoContratualForm, 
  TipoAditivo 
} from '@/modules/Contratos/types/alteracoes-contratuais'

interface AlteracoesContratuaisProps {
  contratoId: string
  numeroContrato?: string
  valorOriginal?: number
  onSalvar?: (dados: AlteracaoContratualForm) => Promise<void>
  onSubmeter?: (dados: AlteracaoContratualForm) => Promise<void>
  className?: string
}

interface Step {
  id: string
  titulo: string
  descricao: string
  icone: React.ElementType
  cor: string
}

const STEPS: Step[] = [
  {
    id: 'tipo',
    titulo: 'Tipo de Aditivo',
    descricao: 'Selecione o tipo de alteração',
    icone: FileText,
    cor: 'blue'
  },
  {
    id: 'datas',
    titulo: 'Cronograma',
    descricao: 'Defina as datas importantes',
    icone: Calendar,
    cor: 'green'
  },
  {
    id: 'detalhamento',
    titulo: 'Detalhamento',
    descricao: 'Justificativa e análise técnica',
    icone: MessageSquare,
    cor: 'orange'
  },
  {
    id: 'valores',
    titulo: 'Valores',
    descricao: 'Configure os valores financeiros',
    icone: Calculator,
    cor: 'purple'
  },
  {
    id: 'preview',
    titulo: 'Revisão',
    descricao: 'Revise antes de submeter',
    icone: Eye,
    cor: 'teal'
  }
]

export function AlteracoesContratuais({
  contratoId,
  numeroContrato,
  valorOriginal = 0,
  onSalvar,
  onSubmeter,
  className
}: AlteracoesContratuaisProps) {
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [dados, setDados] = useState<Partial<AlteracaoContratualForm>>({
    contratoId
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const atualizarDados = useCallback((novosDados: Partial<AlteracaoContratualForm>) => {
    setDados(prev => ({ ...prev, ...novosDados }))
    // Limpar erros relacionados aos campos atualizados
    const novosErrors = { ...errors }
    Object.keys(novosDados).forEach(key => {
      delete novosErrors[key]
    })
    setErrors(novosErrors)
  }, [errors])

  const validarEtapa = useCallback((etapa: number): boolean => {
    const novosErrors: Record<string, string> = {}

    switch (etapa) {
      case 0: // Tipo de Aditivo
        if (!dados.tipoAditivo) {
          novosErrors.tipoAditivo = 'Selecione o tipo de aditivo'
        }
        break

      case 1: // Datas
        if (!dados.dataSolicitacao) {
          novosErrors.dataSolicitacao = 'Data de solicitação é obrigatória'
        }
        if (!dados.dataAutorizacao) {
          novosErrors.dataAutorizacao = 'Data de autorização é obrigatória'
        }
        if (!dados.novaVigencia) {
          novosErrors.novaVigencia = 'Nova vigência é obrigatória'
        }
        // Validar ordem das datas
        if (dados.dataSolicitacao && dados.dataAutorizacao) {
          if (new Date(dados.dataSolicitacao) > new Date(dados.dataAutorizacao)) {
            novosErrors.dataAutorizacao = 'Data de autorização deve ser posterior à solicitação'
          }
        }
        break

      case 2: // Detalhamento
        if (!dados.justificativa || dados.justificativa.trim().length < 50) {
          novosErrors.justificativa = 'Justificativa deve ter pelo menos 50 caracteres'
        }
        if (!dados.manifestacaoTecnica || dados.manifestacaoTecnica.trim().length < 50) {
          novosErrors.manifestacaoTecnica = 'Manifestação técnica deve ter pelo menos 50 caracteres'
        }
        break

      case 3: // Valores
        if (!dados.valorAjustado || dados.valorAjustado <= 0) {
          novosErrors.valorAjustado = 'Valor ajustado é obrigatório e deve ser maior que zero'
        }
        break
    }

    setErrors(novosErrors)
    return Object.keys(novosErrors).length === 0
  }, [dados])

  const proximaEtapa = useCallback(() => {
    if (validarEtapa(etapaAtual)) {
      setEtapaAtual(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }, [etapaAtual, validarEtapa])

  const etapaAnterior = useCallback(() => {
    setEtapaAtual(prev => Math.max(prev - 1, 0))
  }, [])

  const irParaEtapa = useCallback((etapa: number) => {
    if (etapa < etapaAtual) {
      setEtapaAtual(etapa)
    } else {
      // Validar todas as etapas até a desejada
      let todasValidas = true
      for (let i = etapaAtual; i < etapa; i++) {
        if (!validarEtapa(i)) {
          todasValidas = false
          break
        }
      }
      if (todasValidas) {
        setEtapaAtual(etapa)
      }
    }
  }, [etapaAtual, validarEtapa])

  const handleSalvarRascunho = useCallback(async () => {
    if (!onSalvar) return
    
    setIsLoading(true)
    try {
      await onSalvar({
        ...dados,
        status: 'rascunho'
      } as AlteracaoContratualForm)
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onSalvar, dados])

  const handleSubmeter = useCallback(async () => {
    if (!onSubmeter) return

    // Validar todas as etapas
    let todasEtapasValidas = true
    for (let i = 0; i < 4; i++) {
      if (!validarEtapa(i)) {
        todasEtapasValidas = false
        setEtapaAtual(i) // Ir para primeira etapa com erro
        break
      }
    }

    if (!todasEtapasValidas) return

    setIsLoading(true)
    try {
      await onSubmeter({
        ...dados,
        status: 'submetida'
      } as AlteracaoContratualForm)
    } catch (error) {
      console.error('Erro ao submeter alteração:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onSubmeter, dados, validarEtapa])

  const progresso = useMemo(() => ((etapaAtual + 1) / STEPS.length) * 100, [etapaAtual])

  // Memoizar handlers para evitar re-renders desnecessários
  const handleTipoChange = useCallback((tipo: TipoAditivo) => {
    atualizarDados({ tipoAditivo: tipo })
  }, [atualizarDados])

  const handleDataSolicitacaoChange = useCallback((data: string) => {
    atualizarDados({ dataSolicitacao: data })
  }, [atualizarDados])

  const handleDataAutorizacaoChange = useCallback((data: string) => {
    atualizarDados({ dataAutorizacao: data })
  }, [atualizarDados])

  const handleNovaVigenciaChange = useCallback((data: string) => {
    atualizarDados({ novaVigencia: data })
  }, [atualizarDados])

  const handleJustificativaChange = useCallback((valor: string) => {
    atualizarDados({ justificativa: valor })
  }, [atualizarDados])

  const handleManifestacaoTecnicaChange = useCallback((valor: string) => {
    atualizarDados({ manifestacaoTecnica: valor })
  }, [atualizarDados])

  const handleValorAjustadoChange = useCallback((valor: number) => {
    atualizarDados({ valorAjustado: valor })
  }, [atualizarDados])

  // Memoizar erros por etapa
  const datasErrors = useMemo(() => ({
    dataSolicitacao: errors.dataSolicitacao,
    dataAutorizacao: errors.dataAutorizacao,
    novaVigencia: errors.novaVigencia
  }), [errors.dataSolicitacao, errors.dataAutorizacao, errors.novaVigencia])

  const detalhamentoErrors = useMemo(() => ({
    justificativa: errors.justificativa,
    manifestacaoTecnica: errors.manifestacaoTecnica
  }), [errors.justificativa, errors.manifestacaoTecnica])

  const valoresErrors = useMemo(() => ({
    valorAjustado: errors.valorAjustado
  }), [errors.valorAjustado])

  const renderStepContent = useMemo(() => {
    const step = STEPS[etapaAtual]
    
    switch (step.id) {
      case 'tipo':
        return (
          <TipoAditivoSelector
            valor={dados.tipoAditivo}
            onChange={handleTipoChange}
          />
        )

      case 'datas':
        return (
          <DatasTimeline
            dataSolicitacao={dados.dataSolicitacao || ''}
            dataAutorizacao={dados.dataAutorizacao || ''}
            novaVigencia={dados.novaVigencia || ''}
            onDataSolicitacaoChange={handleDataSolicitacaoChange}
            onDataAutorizacaoChange={handleDataAutorizacaoChange}
            onNovaVigenciaChange={handleNovaVigenciaChange}
            errors={datasErrors}
          />
        )

      case 'detalhamento':
        return (
          <DetalhamentoForm
            justificativa={dados.justificativa || ''}
            manifestacaoTecnica={dados.manifestacaoTecnica || ''}
            onJustificativaChange={handleJustificativaChange}
            onManifestacaoTecnicaChange={handleManifestacaoTecnicaChange}
            errors={detalhamentoErrors}
          />
        )

      case 'valores':
        return (
          <ValoresCalculator
            valorOriginal={valorOriginal}
            valorAjustado={dados.valorAjustado || 0}
            onValorAjustadoChange={handleValorAjustadoChange}
            errors={valoresErrors}
          />
        )

      case 'preview':
        return (
          <PreviewCard
            dados={dados}
            valorOriginal={valorOriginal}
            numeroContrato={numeroContrato}
            onSalvarRascunho={onSalvar ? handleSalvarRascunho : undefined}
            onSubmeter={onSubmeter ? handleSubmeter : undefined}
            isLoading={isLoading}
          />
        )

      default:
        return null
    }
  }, [etapaAtual, dados, handleTipoChange, handleDataSolicitacaoChange, handleDataAutorizacaoChange, handleNovaVigenciaChange, handleJustificativaChange, handleManifestacaoTecnicaChange, handleValorAjustadoChange, datasErrors, detalhamentoErrors, valoresErrors, valorOriginal, numeroContrato, onSalvar, handleSalvarRascunho, onSubmeter, handleSubmeter, isLoading])

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
                </p>
              </div>
              <Badge variant="outline" className="px-3">
                Etapa {etapaAtual + 1} de {STEPS.length}
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

            {/* Steps navigation */}
            <div className="flex flex-wrap gap-2">
              {STEPS.map((step, index) => {
                const Icon = step.icone
                const isAtual = index === etapaAtual
                const isConcluido = index < etapaAtual
                const isDisponivel = index <= etapaAtual
                
                return (
                  <button
                    key={step.id}
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
                    <span className="hidden sm:inline">{step.titulo}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo da etapa atual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent}
        </motion.div>
      </AnimatePresence>

      {/* Navegação entre etapas */}
      {etapaAtual < STEPS.length - 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={etapaAnterior}
                disabled={etapaAtual === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                {onSalvar && (
                  <Button
                    variant="ghost"
                    onClick={handleSalvarRascunho}
                    disabled={isLoading}
                  >
                    Salvar Rascunho
                  </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                <Button
                  onClick={proximaEtapa}
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
            <div className="rounded-full bg-red-100 p-1">
              <div className="h-2 w-2 rounded-full bg-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Existem campos que precisam de atenção
              </p>
              <ul className="mt-1 space-y-1 text-xs text-red-700">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}