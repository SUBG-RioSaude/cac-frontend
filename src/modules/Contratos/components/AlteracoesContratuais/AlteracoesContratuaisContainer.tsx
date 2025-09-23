import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DateDisplay } from '@/components/ui/formatters'
import { FileText, ArrowUp, ArrowDown } from 'lucide-react'

// Importar os componentes originais
import { AlteracoesContratuais } from './index'
import { RegistroAlteracoes } from '../VisualizacaoContratos/registro-alteracoes'

// Types
import type { AlteracaoContrato } from '../../types/contrato'
import type { AlteracaoContratualResponse } from '../../types/alteracoes-contratuais'
import type { TimelineEntry } from '../../types/timeline'

interface AlteracoesContratuaisContainerProps {
  contratoId: string
  numeroContrato?: string
  valorOriginal?: number
  vigenciaOriginal?: {
    dataInicio: string
    dataFim: string
  }
  vigenciaFinal?: string // Mantido para compatibilidade
  alteracoes: AlteracaoContrato[]
  entradasTimeline?: TimelineEntry[]
  onSaved?: (alteracao: AlteracaoContratualResponse) => void
  onSubmitted?: (alteracao: AlteracaoContratualResponse) => void
  className?: string
}

type SubAbaAtiva = 'nova-alteracao' | 'historico'

export function AlteracoesContratuaisContainer({
  contratoId,
  numeroContrato,
  valorOriginal = 0,
  vigenciaOriginal,
  vigenciaFinal,
  alteracoes,
  entradasTimeline = [],
  onSaved,
  onSubmitted,
  className,
}: AlteracoesContratuaisContainerProps) {
  const [subabaAtiva, setSubabaAtiva] = useState<SubAbaAtiva>('nova-alteracao')

  // Handler para quando uma alteração é salva/submetida - move para histórico
  const handleAlteracaoSalva = useCallback(
    async (alteracao: AlteracaoContratualResponse) => {
      await onSaved?.(alteracao)

      // Após salvar, navegar para o histórico para ver a alteração criada
      setSubabaAtiva('historico')
    },
    [onSaved],
  )

  const handleAlteracaoSubmetida = useCallback(
    async (alteracao: AlteracaoContratualResponse) => {
      await onSubmitted?.(alteracao)

      // Após submeter, navegar para o histórico
      setSubabaAtiva('historico')
    },
    [onSubmitted],
  )

  // Calcular valor atual com base nas alterações aprovadas
  const calcularValorAtual = () => {
    const alteracoesAprovadas = alteracoes.filter(
      (alt) =>
        String(alt.status) === 'aprovado' || String(alt.status) === 'executado',
    )

    return alteracoesAprovadas.reduce((valorAtual, alt) => {
      if (alt.valor) {
        switch (alt.valor.operacao) {
          case 1: // Acrescentar
            return valorAtual + (alt.valor.valorAjuste || 0)
          case 2: // Diminuir
            return valorAtual - (alt.valor.valorAjuste || 0)
          case 3: // Substituir
            return alt.valor.novoValorGlobal || valorAtual
          default:
            return valorAtual
        }
      }
      return valorAtual
    }, valorOriginal)
  }

  // Calcular vigência atual com base nos aditivos de prazo aprovados
  const calcularVigenciaAtual = () => {
    if (!vigenciaOriginal) return null

    const alteracoesPrazoAprovadas = alteracoes.filter(
      (alt) =>
        (String(alt.status) === 'aprovado' ||
          String(alt.status) === 'executado') &&
        alt.vigencia,
    )

    return alteracoesPrazoAprovadas.reduce((dataFimAtual, alt) => {
      if (alt.vigencia && alt.vigencia.operacao === 1) {
        // Acrescentar
        const data = new Date(dataFimAtual)
        const valor = alt.vigencia.valorTempo || 0

        switch (alt.vigencia.tipoUnidade) {
          case 1: // Dias
            data.setDate(data.getDate() + valor)
            break
          case 2: // Meses
            data.setMonth(data.getMonth() + valor)
            break
          case 3: // Anos
            data.setFullYear(data.getFullYear() + valor)
            break
        }

        return data.toISOString().split('T')[0]
      }
      return dataFimAtual
    }, vigenciaOriginal.dataFim)
  }

  // Calcular diferença de valores
  const calcularDiferencaValor = () => {
    const valorAtual = calcularValorAtual()
    const diferenca = valorAtual - valorOriginal
    const percentual = valorOriginal > 0 ? (diferenca / valorOriginal) * 100 : 0

    return {
      valor: diferenca,
      percentual: Math.round(percentual * 100) / 100,
      tipo: diferenca > 0 ? 'aumento' : diferenca < 0 ? 'diminuicao' : 'neutro',
    }
  }

  // Calcular extensão de prazo
  const calcularExtensaoPrazo = () => {
    if (!vigenciaOriginal) return null

    const dataOriginal = new Date(vigenciaOriginal.dataFim)
    const dataAtual = new Date(
      calcularVigenciaAtual() || vigenciaOriginal.dataFim,
    )

    const diferencaMs = dataAtual.getTime() - dataOriginal.getTime()
    const diferencaDias = Math.round(diferencaMs / (1000 * 60 * 60 * 24))

    return {
      dias: diferencaDias,
      meses: Math.round(diferencaDias / 30),
      tipo:
        diferencaDias > 0
          ? 'extensao'
          : diferencaDias < 0
            ? 'reducao'
            : 'neutro',
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header simplificado */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-3">
            {/* Título */}
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-purple-600" />
                Alterações Contratuais
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {numeroContrato && `Contrato: ${numeroContrato}`}
              </p>
            </div>

            {/* Informações compactas */}
            <div className="space-y-2 text-sm">
              {/* Linha de Valor */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    Valor Original:
                  </span>
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(valorOriginal)}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    Valor Atual:
                  </span>
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(calcularValorAtual())}
                  </span>
                  {(() => {
                    const diferenca = calcularDiferencaValor()
                    if (diferenca.tipo !== 'neutro') {
                      return (
                        <span
                          className={cn(
                            'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
                            diferenca.tipo === 'aumento'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700',
                          )}
                        >
                          {diferenca.tipo === 'aumento' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {diferenca.tipo === 'aumento' ? '+' : ''}
                          {diferenca.percentual.toFixed(1)}%
                        </span>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Linha de Vigência */}
              {vigenciaOriginal && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Vigência Original:
                    </span>
                    <span className="text-sm font-semibold">
                      <DateDisplay value={vigenciaOriginal.dataInicio} /> -{' '}
                      <DateDisplay value={vigenciaOriginal.dataFim} />
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Vigência Atual:
                    </span>
                    <span className="text-sm font-semibold">
                      <DateDisplay value={vigenciaOriginal.dataInicio} /> -{' '}
                      <DateDisplay
                        value={
                          calcularVigenciaAtual() || vigenciaOriginal.dataFim
                        }
                      />
                    </span>
                    {(() => {
                      const extensao = calcularExtensaoPrazo()
                      if (extensao && extensao.tipo !== 'neutro') {
                        return (
                          <span
                            className={cn(
                              'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
                              extensao.tipo === 'extensao'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700',
                            )}
                          >
                            {extensao.tipo === 'extensao' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {extensao.tipo === 'extensao' ? '+' : ''}
                            {Math.abs(extensao.meses)}m
                          </span>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Container das Sub-abas */}
      <Tabs
        value={subabaAtiva}
        onValueChange={(value) => setSubabaAtiva(value as SubAbaAtiva)}
        className="w-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg bg-gray-50 p-1">
          <TabsTrigger
            value="nova-alteracao"
            className="flex flex-col items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:flex-row"
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full sm:h-3 sm:w-3',
                subabaAtiva === 'nova-alteracao'
                  ? 'bg-blue-500'
                  : 'bg-gray-400',
              )}
            ></div>
            <span className="text-center">Nova Alteração</span>
          </TabsTrigger>

          <TabsTrigger
            value="historico"
            className="flex flex-col items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:border-green-200 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm sm:flex-row"
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full sm:h-3 sm:w-3',
                subabaAtiva === 'historico' ? 'bg-green-500' : 'bg-gray-400',
              )}
            ></div>
            <span className="text-center">Histórico</span>
            {alteracoes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {alteracoes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Sub-abas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={subabaAtiva}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {/* Sub-aba: Nova Alteração */}
            <TabsContent value="nova-alteracao" className="mt-0 space-y-0">
              <AlteracoesContratuais
                contratoId={contratoId}
                numeroContrato={numeroContrato}
                valorOriginal={valorOriginal}
                vigenciaFinal={vigenciaFinal}
                onSaved={handleAlteracaoSalva}
                onSubmitted={handleAlteracaoSubmetida}
                onCancelled={() => setSubabaAtiva('historico')}
              />
            </TabsContent>

            {/* Sub-aba: Histórico */}
            <TabsContent value="historico" className="mt-0 space-y-0">
              <RegistroAlteracoes
                contratoId={contratoId}
                alteracoes={alteracoes}
                entradasTimeline={entradasTimeline}
              />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
