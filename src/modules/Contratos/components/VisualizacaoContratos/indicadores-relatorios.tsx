import { motion } from 'framer-motion'
import {
  TrendingUp,
  Calendar,
  PieChart,
  DollarSign,
  Target,
  Building,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyDisplay, DateDisplay } from '@/components/ui/formatters'
import { Progress } from '@/components/ui/progress'
import { cn, currencyUtils } from '@/lib/utils'
import type {
  PeriodoVigencia,
  UnidadeVinculada,
  ContratoDetalhado,
} from '@/modules/Contratos/types/contrato'
import { useUnidadesByIds } from '@/modules/Unidades/hooks/use-unidades'

interface IndicadoresRelatoriosProps {
  indicadores: {
    saldoAtual: number
    percentualExecutado: number
    cronogramaVigencia: PeriodoVigencia[]
  }
  unidades: {
    demandante: string
    gestora: string
    vinculadas: UnidadeVinculada[]
  }
  valorTotal: number
  vtmTotalContrato: number
  contrato: ContratoDetalhado // Para acesso completo aos dados do contrato
}

export const IndicadoresRelatorios = ({
  indicadores,
  valorTotal,
  vtmTotalContrato,
  contrato,
}: IndicadoresRelatoriosProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mesHover, setMesHover] = useState<number | null>(null)
  const [unidadeHover, setUnidadeHover] = useState<number | null>(null)

  // Espera o componente montar para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determina se está em dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  // Buscar nomes das unidades
  const unidadesIds = (contrato.unidadesVinculadas ?? [])
    .map((u) => u.unidadeSaudeId)
    .filter(Boolean)
  const { data: unidadesData, isLoading: unidadesLoading } = useUnidadesByIds(
    unidadesIds,
    { enabled: unidadesIds.length > 0 },
  )

  // Helper para obter nome da unidade
  const getUnidadeNome = (unidadeId: string) => {
    if (unidadesLoading) return 'Carregando...'
    const unidade = unidadesData[unidadeId]
    if (!unidade) {
      return `Unidade ${unidadeId.slice(-8)}`
    }
    return unidade.nome || `Unidade ${unidadeId.slice(-8)}`
  }

  const getStatusPeriodo = (status: string) => {
    const statusConfig = {
      concluido: {
        label: 'Concluído',
        className: isDarkMode
          ? 'bg-green-950/30 text-green-400 dark:bg-green-950/30 dark:text-green-400'
          : 'bg-green-100 text-green-800',
        color: '#22c55e',
      },
      em_andamento: {
        label: 'Em Andamento',
        className: isDarkMode
          ? 'bg-blue-950/30 text-blue-400 dark:bg-blue-950/30 dark:text-blue-400'
          : 'bg-blue-100 text-blue-800',
        color: '#3b82f6',
      },
      pendente: {
        label: 'Pendente',
        className: isDarkMode
          ? 'bg-gray-800/30 text-gray-400 dark:bg-gray-800/30 dark:text-gray-400'
          : 'bg-gray-100 text-gray-800',
        color: '#6b7280',
      },
    }

    if (status in statusConfig) {
      return statusConfig[status as keyof typeof statusConfig]
    }
    return statusConfig.pendente
  }

  // Cálculos baseados em dados reais
  const valorExecutado = valorTotal - indicadores.saldoAtual

  // Calcular progresso temporal (dias vigentes)
  const hoje = new Date()
  const dataInicio = new Date(contrato.dataInicio)
  const dataTermino = new Date(contrato.dataTermino)

  // Verificar se o contrato está vencido
  const contratoVencido = hoje > dataTermino

  // Calcular total de dias do contrato
  const diasTotais = Math.floor(
    (dataTermino.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Calcular dias vigentes (limitado ao período do contrato)
  const diasVigentesBruto = Math.floor(
    (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24),
  )
  // Sempre limitar diasVigentes a diasTotais para evitar valores negativos de dias restantes
  const diasVigentes = Math.min(Math.max(0, diasVigentesBruto), diasTotais)

  // Calcular dias restantes (sempre >= 0)
  // Se vencido, restam 0 dias; caso contrário, calcular normalmente
  const diasRestantes = contratoVencido ? 0 : Math.max(0, diasTotais - diasVigentes)

  // Calcular quantos dias o contrato está vencido (se aplicável)
  const diasVencidos = contratoVencido
    ? Math.floor(
        (hoje.getTime() - dataTermino.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0

  // Calcular progresso temporal (sempre entre 0-100%)
  const progressoTemporal =
    diasTotais > 0 ? Math.min((diasVigentes / diasTotais) * 100, 100) : 0

  // Calcular gasto médio por dia (usar diasVigentesBruto para cálculo correto mesmo após vencimento)
  const diasParaCalculo = Math.max(diasVigentesBruto, 1)
  const gastoMedioPorDia = valorExecutado / diasParaCalculo

  // Gerar dados de evolução baseados na duração real do contrato
  const dadosEvolucao = (() => {
    const dataInicioEvolucao = new Date(contrato.dataInicio)
    const dataFim = new Date(contrato.dataTermino)
    const hojeEvolucao = new Date()

    // Calcular meses decorridos para compatibilidade com o gráfico de evolução
    const mesesDecorridos = Math.max(
      0,
      Math.floor(
        (hojeEvolucao.getTime() - dataInicioEvolucao.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44),
      ),
    )

    const mesesNomes = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]

    const dados = []
    const dataAtual = new Date(dataInicioEvolucao)
    let mesIndex = 0

    while (dataAtual <= dataFim && mesIndex < 12) {
      // Limitar a 12 meses para visualização
      const mesAno = `${mesesNomes[dataAtual.getMonth()]}/${dataAtual.getFullYear().toString().slice(-2)}`
      const mesAtual = mesIndex + 1

      // Valor esperado baseado no VTM para este mês
      const valorEsperadoMes = vtmTotalContrato * mesAtual
      const percentualEsperado = (valorEsperadoMes / valorTotal) * 100

      // Se o mês já passou, usar dados de execução real, senão usar projeção
      const jaPassou = dataAtual < hojeEvolucao
      let valorReal = 0
      let percentualReal = 0

      if (jaPassou && mesAtual <= mesesDecorridos) {
        // Para meses que já passaram, calcular baseado na execução proporcional
        const proporcaoTempo = mesAtual / mesesDecorridos
        valorReal = valorExecutado * proporcaoTempo
        percentualReal = (valorReal / valorTotal) * 100
      } else if (mesAtual <= mesesDecorridos) {
        // Mês atual - usar execução parcial
        valorReal = valorExecutado
        percentualReal = indicadores.percentualExecutado
      }

      dados.push({
        mes: mesAno,
        percentual: Math.min(
          jaPassou && mesAtual <= mesesDecorridos
            ? percentualReal
            : percentualEsperado,
          100,
        ),
        valor:
          jaPassou && mesAtual <= mesesDecorridos
            ? valorReal
            : valorEsperadoMes,
        esperado: percentualEsperado,
        valorEsperado: valorEsperadoMes,
        isReal: jaPassou && mesAtual <= mesesDecorridos,
        isAtual: mesAtual === mesesDecorridos,
      })

      // Avançar para o próximo mês
      dataAtual.setMonth(dataAtual.getMonth() + 1)
      mesIndex++
    }

    return dados
  })()

  // Cores para o gráfico de pizza com gradientes
  const coresPizza = [
    { cor: '#3b82f6', gradiente: 'from-blue-400 to-blue-600' }, // blue
    { cor: '#10b981', gradiente: 'from-emerald-400 to-emerald-600' }, // emerald
    { cor: '#f59e0b', gradiente: 'from-amber-400 to-amber-600' }, // amber
    { cor: '#ef4444', gradiente: 'from-red-400 to-red-600' }, // red
    { cor: '#8b5cf6', gradiente: 'from-violet-400 to-violet-600' }, // violet
    { cor: '#06b6d4', gradiente: 'from-cyan-400 to-cyan-600' }, // cyan
  ]

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Saldo e Execução - Responsivo */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Saldo e Acompanhamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Valores Principais - Grid responsivo */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div
                className={cn(
                  'rounded-lg p-3 text-center sm:p-4',
                  isDarkMode ? 'bg-blue-950/20 dark:bg-blue-950/20' : 'bg-blue-50',
                )}
              >
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Valor Total
                </p>
                <p
                  className={cn(
                    'text-base font-bold break-all sm:text-xl',
                    isDarkMode ? 'text-blue-400 dark:text-blue-400' : 'text-blue-600',
                  )}
                >
                  <CurrencyDisplay value={valorTotal} />
                </p>
              </div>
              <div
                className={cn(
                  'rounded-lg p-3 text-center sm:p-4',
                  isDarkMode
                    ? 'bg-green-950/20 dark:bg-green-950/20'
                    : 'bg-green-50',
                )}
              >
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Valor Executado
                </p>
                <p
                  className={cn(
                    'text-base font-bold break-all sm:text-xl',
                    isDarkMode
                      ? 'text-green-400 dark:text-green-400'
                      : 'text-green-600',
                  )}
                >
                  <CurrencyDisplay value={valorExecutado} />
                </p>
              </div>
            </div>

            {/* VTM e Saldo */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div
                className={cn(
                  'rounded-lg p-3 text-center sm:p-4',
                  isDarkMode
                    ? 'bg-purple-950/20 dark:bg-purple-950/20'
                    : 'bg-purple-50',
                )}
              >
                <p className="text-muted-foreground text-xs sm:text-sm">
                  VTM do Contrato
                </p>
                <p
                  className={cn(
                    'text-base font-bold break-all sm:text-xl',
                    isDarkMode
                      ? 'text-purple-400 dark:text-purple-400'
                      : 'text-purple-600',
                  )}
                >
                  <span className="font-mono">
                    {currencyUtils.formatar(vtmTotalContrato)}/mês
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  'rounded-lg p-3 text-center sm:p-4',
                  isDarkMode
                    ? 'bg-orange-950/20 dark:bg-orange-950/20'
                    : 'bg-orange-50',
                )}
              >
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Saldo Atual
                </p>
                <p
                  className={cn(
                    'text-base font-bold break-all sm:text-xl',
                    isDarkMode
                      ? 'text-orange-400 dark:text-orange-400'
                      : 'text-orange-600',
                  )}
                >
                  <CurrencyDisplay value={indicadores.saldoAtual} />
                </p>
              </div>
            </div>

            {/* Progresso Temporal */}
            <div
              className={cn(
                'rounded-lg p-3 text-center sm:p-4',
                contratoVencido
                  ? isDarkMode
                    ? 'bg-red-950/20 dark:bg-red-950/20'
                    : 'bg-red-50'
                  : isDarkMode
                    ? 'bg-blue-950/20 dark:bg-blue-950/20'
                    : 'bg-blue-50',
              )}
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Progresso Temporal
                </p>
                {contratoVencido && (
                  <Badge
                    variant="destructive"
                    className="text-xs"
                    data-testid="contrato-vencido-badge"
                  >
                    Vencido
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  'text-base font-bold sm:text-xl',
                  contratoVencido
                    ? isDarkMode
                      ? 'text-red-400 dark:text-red-400'
                      : 'text-red-600'
                    : isDarkMode
                      ? 'text-blue-400 dark:text-blue-400'
                      : 'text-blue-600',
                )}
              >
                {diasVigentes} dias vigentes de {diasTotais} dias
              </p>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      contratoVencido
                        ? isDarkMode
                          ? 'text-red-400 dark:text-red-400'
                          : 'text-red-600'
                        : isDarkMode
                          ? 'text-blue-400 dark:text-blue-400'
                          : 'text-blue-600',
                    )}
                  >
                    {progressoTemporal.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {contratoVencido
                      ? `Vencido há ${diasVencidos} dia${diasVencidos !== 1 ? 's' : ''}`
                      : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div
                  className={cn(
                    'h-2.5 w-full rounded-full',
                    contratoVencido
                      ? isDarkMode
                        ? 'bg-red-900/50'
                        : 'bg-red-200'
                      : isDarkMode
                        ? 'bg-blue-900/50'
                        : 'bg-blue-200',
                  )}
                >
                  <div
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      contratoVencido
                        ? isDarkMode
                          ? 'bg-red-500'
                          : 'bg-red-600'
                        : isDarkMode
                          ? 'bg-blue-500'
                          : 'bg-blue-600',
                    )}
                    style={{ width: `${Math.min(progressoTemporal, 100)}%` }}
                  />
                </div>
              </div>
              {gastoMedioPorDia > 0 && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Gasto médio: <CurrencyDisplay value={gastoMedioPorDia} />
                  /dia
                </p>
              )}
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium sm:text-sm">
                  Percentual Executado
                </span>
                <span
                  className={`text-xs font-bold sm:text-sm ${
                    isDarkMode
                      ? 'text-blue-400 dark:text-blue-400'
                      : 'text-blue-600'
                  }`}
                >
                  {indicadores.percentualExecutado}%
                </span>
              </div>
              <Progress
                value={indicadores.percentualExecutado}
                className="h-2 sm:h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Evolução da Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="relative">
              {mesHover !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-0 left-1/2 z-20 max-w-xs -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs text-white shadow-lg sm:text-sm"
                >
                  <div className="text-center">
                    <p className="font-semibold">
                      {dadosEvolucao[mesHover].mes}
                    </p>
                    <p
                      className={`${dadosEvolucao[mesHover].isReal ? 'text-blue-200' : 'text-gray-200'}`}
                    >
                      {dadosEvolucao[mesHover].percentual.toFixed(1)}%
                      {dadosEvolucao[mesHover].isReal
                        ? ' (Real)'
                        : ' (Projetado)'}
                    </p>
                    <p className="break-all">
                      <CurrencyDisplay value={dadosEvolucao[mesHover].valor} />
                    </p>
                    {dadosEvolucao[mesHover].isReal && (
                      <p className="mt-1 text-xs text-gray-300">
                        Esperado:{' '}
                        <CurrencyDisplay
                          value={dadosEvolucao[mesHover].valorEsperado}
                        />
                      </p>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full transform">
                    <div className="h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-black" />
                  </div>
                </motion.div>
              )}

              <div className="flex h-48 items-end justify-center gap-1 overflow-x-auto p-2 pt-8 sm:h-64 sm:gap-3 sm:p-4 sm:pt-12">
                {dadosEvolucao.map((item, index) => (
                  <motion.div
                    key={item.mes}
                    className="flex min-w-0 flex-shrink-0 cursor-pointer flex-col items-center gap-1 sm:gap-2"
                    onMouseEnter={() => setMesHover(index)}
                    onMouseLeave={() => setMesHover(null)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className={`w-6 rounded-t transition-all duration-300 sm:w-10 ${
                        mesHover === index
                          ? item.isReal
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg'
                            : 'bg-gradient-to-t from-gray-600 to-gray-400 shadow-lg'
                          : item.isReal
                            ? 'bg-gradient-to-t from-blue-500 to-blue-300'
                            : item.isAtual
                              ? 'bg-gradient-to-t from-yellow-500 to-yellow-300'
                              : 'bg-gradient-to-t from-gray-400 to-gray-200'
                      }`}
                      style={{
                        height: `${Math.max(item.percentual * 2.5, 10)}px`,
                      }}
                      animate={{
                        height: `${Math.max(item.percentual * 2.5, 10)}px`,
                        scale: mesHover === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span
                      className={`text-xs transition-colors duration-200 ${
                        mesHover === index
                          ? isDarkMode
                            ? 'font-semibold text-blue-400 dark:text-blue-400'
                            : 'font-semibold text-blue-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.mes}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Legenda do gráfico */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-gradient-to-t from-blue-500 to-blue-300" />
                <span className="text-muted-foreground">Executado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-gradient-to-t from-yellow-500 to-yellow-300" />
                <span className="text-muted-foreground">Atual</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-gradient-to-t from-gray-400 to-gray-200" />
                <span className="text-muted-foreground">Projetado</span>
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-center text-xs">
              Passe o mouse sobre as barras para ver detalhes e comparação com
              VTM
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cronograma de Vigência - Responsivo */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Cronograma de Vigência
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Informações gerais do contrato */}
          <div
            className={`mb-6 rounded-lg p-4 ${
              isDarkMode
                ? 'bg-blue-950/20 dark:bg-blue-950/20'
                : 'bg-blue-50'
            }`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  Início do Contrato
                </p>
                <p
                  className={`font-semibold ${
                    isDarkMode
                      ? 'text-blue-400 dark:text-blue-400'
                      : 'text-blue-600'
                  }`}
                >
                  <DateDisplay value={contrato.dataInicio} />
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  Término Previsto
                </p>
                <p
                  className={`font-semibold ${
                    isDarkMode
                      ? 'text-blue-400 dark:text-blue-400'
                      : 'text-blue-600'
                  }`}
                >
                  <DateDisplay value={contrato.dataTermino} />
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Duração Total</p>
                <p
                  className={`font-semibold ${
                    isDarkMode
                      ? 'text-blue-400 dark:text-blue-400'
                      : 'text-blue-600'
                  }`}
                >
                  {contrato.prazoInicialMeses} meses
                </p>
              </div>
            </div>
          </div>

          {/* Timeline baseada em anos civis */}
          <div className="space-y-3 sm:space-y-4">
            {(() => {
              const hojeTimeline = new Date()
              const contratoInicio = new Date(contrato.dataInicio)
              const contratoFim = new Date(contrato.dataTermino)

              // Calcular anos civis entre início e fim do contrato
              const anoInicio = contratoInicio.getFullYear()
              const anoFim = contratoFim.getFullYear()

              const duracaoTotal = contrato.prazoInicialMeses
              const valorTotalContrato = contrato.valorGlobal

              const periodos = []

              for (let ano = anoInicio; ano <= anoFim; ano++) {
                // Definir início do período: início do contrato ou 1º de janeiro
                const inicioPeriodo =
                  ano === anoInicio ? contratoInicio : new Date(`${ano}-01-01`)

                // Definir fim do período: fim do contrato ou 31 de dezembro
                const fimPeriodo =
                  ano === anoFim ? contratoFim : new Date(`${ano}-12-31`)

                // Determinar status baseado na data atual
                let status = 'pendente'
                if (hojeTimeline > fimPeriodo) {
                  status = 'concluido'
                } else if (
                  hojeTimeline >= inicioPeriodo &&
                  hojeTimeline <= fimPeriodo
                ) {
                  status = 'em_andamento'
                }

                // Calcular meses desde início do contrato até fim deste período
                const mesesAteAnoFim =
                  (fimPeriodo.getFullYear() - contratoInicio.getFullYear()) *
                    12 +
                  (fimPeriodo.getMonth() - contratoInicio.getMonth()) +
                  1

                const percentualEsperado = Math.min(
                  (mesesAteAnoFim / duracaoTotal) * 100,
                  100,
                )

                periodos.push({
                  descricao: ano.toString(),
                  inicio: inicioPeriodo.toISOString(),
                  fim: fimPeriodo.toISOString(),
                  status,
                  percentualEsperado: percentualEsperado.toFixed(1),
                  valorEsperado:
                    (valorTotalContrato * percentualEsperado) / 100,
                })
              }

              return periodos.map((periodo, index) => {
                const statusConfig = getStatusPeriodo(periodo.status)
                return (
                  <motion.div
                    key={periodo.descricao}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 rounded-lg border p-3 sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div
                      className="mt-1 h-3 w-3 flex-shrink-0 rounded-full sm:mt-0 sm:h-4 sm:w-4"
                      style={{ backgroundColor: statusConfig.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h4 className="text-sm font-semibold break-words sm:text-base">
                          {periodo.descricao}
                        </h4>
                        <Badge
                          className={`${statusConfig.className} flex-shrink-0 text-xs`}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          <DateDisplay value={periodo.inicio} /> -{' '}
                          <DateDisplay value={periodo.fim} />
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode
                              ? 'text-blue-400 dark:text-blue-400'
                              : 'text-blue-600'
                          }`}
                        >
                          Esperado: {periodo.percentualEsperado}% (
                          <CurrencyDisplay value={periodo.valorEsperado} />)
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            })()}
          </div>

          {/* Timeline Visual - Responsivo */}
          <div className="bg-muted/50 mt-4 rounded-lg p-3 sm:mt-6 sm:p-4">
            <div className="flex h-3 items-center gap-1 overflow-hidden sm:h-4">
              {(() => {
                const hojeTimeline = new Date()
                const contratoInicioTimeline = new Date(contrato.dataInicio)
                const contratoFimTimeline = new Date(contrato.dataTermino)

                // Calculate civil years between contract start and end
                const anoInicio = contratoInicioTimeline.getFullYear()
                const anoFim = contratoFimTimeline.getFullYear()

                const periodos = []
                for (let ano = anoInicio; ano <= anoFim; ano++) {
                  // Period start: contract start or January 1st
                  const inicioPeriodo =
                    ano === anoInicio
                      ? contratoInicioTimeline
                      : new Date(`${ano}-01-01`)

                  // Period end: contract end or December 31st
                  const fimPeriodo =
                    ano === anoFim
                      ? contratoFimTimeline
                      : new Date(`${ano}-12-31`)

                  // Determine status based on current date
                  let status = 'pendente'
                  if (hojeTimeline > fimPeriodo) {
                    status = 'concluido'
                  } else if (
                    hojeTimeline >= inicioPeriodo &&
                    hojeTimeline <= fimPeriodo
                  ) {
                    status = 'em_andamento'
                  }

                  periodos.push({
                    descricao: ano.toString(),
                    status,
                  })
                }

                return periodos.map((periodo) => {
                  const statusConfig = getStatusPeriodo(periodo.status)
                  return (
                    <div
                      key={periodo.descricao}
                      className="h-full flex-1 rounded"
                      style={{ backgroundColor: statusConfig.color }}
                      title={`${periodo.descricao} - ${statusConfig.label}`}
                    />
                  )
                })
              })()}
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span className="break-all">
                <DateDisplay value={contrato.dataInicio} />
              </span>
              <span className="break-all">
                <DateDisplay value={contrato.dataTermino} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
            Distribuição por Unidade
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {(() => {
            // Usar dados reais das unidades vinculadas do contrato
            const unidadesReais = contrato.unidadesVinculadas ?? []

            // Se não há unidades vinculadas, mostrar fallback
            if (unidadesReais.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Nenhuma unidade vinculada
                  </h3>
                  <p className="text-muted-foreground">
                    Este contrato ainda não possui unidades vinculadas.
                  </p>
                </div>
              )
            }

            // Calcular dados baseados nas unidades reais
            const unidadesComputadas = unidadesReais.map((unidade) => {
              const percentualValor =
                contrato.valorTotalAtribuido > 0
                  ? (unidade.valorAtribuido / contrato.valorTotalAtribuido) *
                    100
                  : 0
              const valorTotalMensal =
                vtmTotalContrato * (percentualValor / 100)

              return {
                ...unidade,
                nome: getUnidadeNome(unidade.unidadeSaudeId),
                percentualValor: Math.round(percentualValor * 10) / 10, // Arredondar para 1 decimal
                valorTotalMensal,
              }
            })

            return (
              <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2">
                {/* Gráfico de Pizza Interativo - Responsivo */}
                <div className="relative order-2 flex items-center justify-center xl:order-1">
                  {unidadeHover !== null &&
                    unidadeHover < unidadesComputadas.length && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 left-1/2 z-30 max-w-xs -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs text-white shadow-xl sm:top-4 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <div className="text-center">
                          <p className="font-semibold break-words">
                            {unidadesComputadas[unidadeHover].nome}
                          </p>
                          <p>
                            {unidadesComputadas[unidadeHover].percentualValor}%
                            do total
                          </p>
                          <p className="break-all">
                            <CurrencyDisplay
                              value={
                                unidadesComputadas[unidadeHover]
                                  .valorTotalMensal
                              }
                            />
                            /mês
                          </p>
                          <p className="mt-1 text-xs text-gray-300">
                            Valor atribuído:{' '}
                            <CurrencyDisplay
                              value={
                                unidadesComputadas[unidadeHover].valorAtribuido
                              }
                            />
                          </p>
                        </div>
                      </motion.div>
                    )}

                  <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full -rotate-90 transform"
                    >
                      {unidadesComputadas.map((unidade, index) => {
                        const startAngle = unidadesComputadas
                          .slice(0, index)
                          .reduce((acc, u) => acc + u.percentualValor * 3.6, 0)
                        const endAngle =
                          startAngle + unidade.percentualValor * 3.6

                        const x1 =
                          50 + 35 * Math.cos((startAngle * Math.PI) / 180)
                        const y1 =
                          50 + 35 * Math.sin((startAngle * Math.PI) / 180)
                        const x2 =
                          50 + 35 * Math.cos((endAngle * Math.PI) / 180)
                        const y2 =
                          50 + 35 * Math.sin((endAngle * Math.PI) / 180)

                        const largeArcFlag =
                          unidade.percentualValor > 50 ? 1 : 0

                        return (
                          <motion.path
                            key={unidade.id}
                            d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={coresPizza[index % coresPizza.length].cor}
                            className="cursor-pointer transition-all duration-300"
                            onMouseEnter={() => setUnidadeHover(index)}
                            onMouseLeave={() => setUnidadeHover(null)}
                            onTouchStart={() => setUnidadeHover(index)}
                            onTouchEnd={() => setUnidadeHover(null)}
                            animate={{
                              scale: unidadeHover === index ? 1.05 : 1,
                              opacity:
                                unidadeHover !== null && unidadeHover !== index
                                  ? 0.7
                                  : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                              filter:
                                unidadeHover === index
                                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                                  : 'none',
                              transformOrigin: '50px 50px',
                            }}
                          />
                        )
                      })}
                    </svg>

                    {/* Centro do gráfico */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full text-center shadow-lg sm:h-20 sm:w-20 ${
                          isDarkMode
                            ? 'bg-gray-800 dark:bg-gray-800'
                            : 'bg-white'
                        }`}
                      >
                        <div>
                          <p
                            className={`text-lg font-bold sm:text-2xl ${
                              isDarkMode
                                ? 'text-blue-400 dark:text-blue-400'
                                : 'text-blue-600'
                            }`}
                          >
                            {unidadesComputadas.length}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Unidades
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legenda e Detalhes - Responsivo */}
                <div className="order-1 space-y-3 xl:order-2">
                  <h4 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
                    Detalhamento por Unidade
                  </h4>
                  <div className="max-h-80 space-y-2 overflow-y-auto sm:max-h-96 sm:space-y-3">
                    {unidadesComputadas.map((unidade, index) => (
                      <motion.div
                        key={unidade.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all duration-300 sm:gap-4 sm:p-4 ${
                          unidadeHover === index
                            ? isDarkMode
                              ? 'scale-105 transform border-blue-600 bg-blue-950/30 shadow-md dark:border-blue-600 dark:bg-blue-950/30'
                              : 'scale-105 transform border-blue-300 bg-blue-50 shadow-md'
                            : isDarkMode
                              ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          filter:
                            unidadeHover === index
                              ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                              : 'none',
                          transformOrigin: '50px 50px',
                        }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                          <div
                            className={`h-4 w-4 flex-shrink-0 rounded-full shadow-sm sm:h-6 sm:w-6 ${
                              unidadeHover === index
                                ? isDarkMode
                                  ? 'ring-2 ring-blue-500 dark:ring-blue-500'
                                  : 'ring-2 ring-blue-300'
                                : ''
                            }`}
                            style={{
                              backgroundColor:
                                coresPizza[index % coresPizza.length].cor,
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold break-words sm:text-sm">
                              {unidade.nome}
                            </h4>
                            <div className="text-muted-foreground mt-1 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-4">
                              <span className="font-medium">
                                {unidade.percentualValor}% do total
                              </span>
                              <span className="break-all">
                                <CurrencyDisplay
                                  value={unidade.valorTotalMensal}
                                />
                                /mês
                              </span>
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              Valor atribuído:{' '}
                              <CurrencyDisplay value={unidade.valorAtribuido} />
                            </div>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-16 flex-shrink-0 sm:w-20">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${coresPizza[index % coresPizza.length].gradiente}`}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(unidade.percentualValor, 100)}%`,
                              }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Resumo Financeiro - Responsivo */}
          <div
            className={`mt-6 rounded-xl border p-4 sm:mt-8 sm:p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-950/20 to-purple-950/20 dark:from-blue-950/20 dark:to-purple-950/20'
                : 'bg-gradient-to-r from-blue-50 to-purple-50'
            }`}
          >
            <h4 className="mb-3 text-center text-base font-semibold sm:mb-4 sm:text-lg">
              Resumo Financeiro
            </h4>
            {(() => {
              const unidadesReaisResumo = contrato.unidadesVinculadas ?? []
              const maiorParticipacao =
                unidadesReaisResumo.length > 0
                  ? Math.max(
                      ...unidadesReaisResumo.map(
                        (u) =>
                          (u.valorAtribuido / contrato.valorTotalAtribuido) *
                          100,
                      ),
                    )
                  : 0

              return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-6">
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm sm:p-4 ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        isDarkMode
                          ? 'bg-blue-950/30 dark:bg-blue-950/30'
                          : 'bg-blue-100'
                      }`}
                    >
                      <DollarSign
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isDarkMode
                            ? 'text-blue-400 dark:text-blue-400'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      VTM do Contrato
                    </p>
                    <p
                      className={`text-base font-bold break-all sm:text-xl ${
                        isDarkMode
                          ? 'text-blue-400 dark:text-blue-400'
                          : 'text-blue-600'
                      }`}
                    >
                      <CurrencyDisplay value={vtmTotalContrato} />
                      /mês
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm sm:p-4 ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        isDarkMode
                          ? 'bg-green-950/30 dark:bg-green-950/30'
                          : 'bg-green-100'
                      }`}
                    >
                      <TrendingUp
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isDarkMode
                            ? 'text-green-400 dark:text-green-400'
                            : 'text-green-600'
                        }`}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Gasto Médio por Dia
                    </p>
                    <p
                      className={`text-base font-bold break-all sm:text-xl ${
                        isDarkMode
                          ? 'text-green-400 dark:text-green-400'
                          : 'text-green-600'
                      }`}
                    >
                      <CurrencyDisplay value={gastoMedioPorDia} />
                      /dia
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm sm:p-4 ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        isDarkMode
                          ? 'bg-yellow-950/30 dark:bg-yellow-950/30'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <Target
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isDarkMode
                            ? 'text-yellow-400 dark:text-yellow-400'
                            : 'text-yellow-600'
                        }`}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Maior Participação
                    </p>
                    <p
                      className={`text-base font-bold sm:text-xl ${
                        isDarkMode
                          ? 'text-yellow-400 dark:text-yellow-400'
                          : 'text-yellow-600'
                      }`}
                    >
                      {maiorParticipacao.toFixed(1)}%
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm sm:p-4 ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        isDarkMode
                          ? 'bg-purple-950/30 dark:bg-purple-950/30'
                          : 'bg-purple-100'
                      }`}
                    >
                      <Building
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isDarkMode
                            ? 'text-purple-400 dark:text-purple-400'
                            : 'text-purple-600'
                        }`}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Progresso Temporal
                    </p>
                    <p
                      className={`text-base font-bold sm:text-xl ${
                        isDarkMode
                          ? 'text-purple-400 dark:text-purple-400'
                          : 'text-purple-600'
                      }`}
                    >
                      {progressoTemporal.toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {diasVigentes} de {diasTotais} dias
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="text-muted-foreground mt-4 text-center text-xs sm:text-sm">
            Passe o mouse sobre o gráfico para ver detalhes
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
