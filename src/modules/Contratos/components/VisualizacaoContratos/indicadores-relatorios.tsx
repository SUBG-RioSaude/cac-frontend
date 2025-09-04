import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Calendar,
  PieChart,
  DollarSign,
  Target,
  Building,
} from 'lucide-react'
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

export function IndicadoresRelatorios({
  indicadores,
  valorTotal,
  vtmTotalContrato,
  contrato,
}: IndicadoresRelatoriosProps) {
  const [mesHover, setMesHover] = useState<number | null>(null)
  const [unidadeHover, setUnidadeHover] = useState<number | null>(null)

  // Buscar nomes das unidades
  const unidadesIds = (contrato.unidadesVinculadas || []).map(u => u.unidadeSaudeId).filter(Boolean)
  const { 
    data: unidadesData, 
    isLoading: unidadesLoading 
  } = useUnidadesByIds(unidadesIds, { enabled: unidadesIds.length > 0 })

  // Helper para obter nome da unidade
  const getUnidadeNome = (unidadeId: string) => {
    if (unidadesLoading) return 'Carregando...'
    const unidade = unidadesData?.[unidadeId]
    return unidade?.nome || `Unidade ${unidadeId.slice(-8)}`
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getStatusPeriodo = (status: string) => {
    const statusConfig = {
      concluido: {
        label: 'Concluído',
        className: 'bg-green-100 text-green-800',
        color: '#22c55e',
      },
      em_andamento: {
        label: 'Em Andamento',
        className: 'bg-blue-100 text-blue-800',
        color: '#3b82f6',
      },
      pendente: {
        label: 'Pendente',
        className: 'bg-gray-100 text-gray-800',
        color: '#6b7280',
      },
    }

    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
    )
  }

  // Cálculos baseados em dados reais
  const valorExecutado = valorTotal - indicadores.saldoAtual
  
  // Calcular progresso temporal (dias vigentes)
  const hoje = new Date()
  const dataInicio = new Date(contrato.dataInicio)
  const dataTermino = new Date(contrato.dataTermino)
  
  const diasVigentes = Math.max(0, Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)))
  const diasTotais = Math.floor((dataTermino.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24))
  const progressoTemporal = diasTotais > 0 ? Math.min((diasVigentes / diasTotais) * 100, 100) : 0
  
  // Calcular gasto médio por dia
  const gastoMedioPorDia = diasVigentes > 0 ? valorExecutado / diasVigentes : 0

  // Gerar dados de evolução baseados na duração real do contrato
  const dadosEvolucao = (() => {
    const dataInicio = new Date(contrato.dataInicio)
    const dataFim = new Date(contrato.dataTermino)
    const hoje = new Date()
    
    // Calcular meses decorridos para compatibilidade com o gráfico de evolução
    const mesesDecorridos = Math.max(0, Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    const dados = []
    const dataAtual = new Date(dataInicio)
    let mesIndex = 0
    
    while (dataAtual <= dataFim && mesIndex < 12) { // Limitar a 12 meses para visualização
      const mesAno = `${mesesNomes[dataAtual.getMonth()]}/${dataAtual.getFullYear().toString().slice(-2)}`
      const mesAtual = mesIndex + 1
      
      // Valor esperado baseado no VTM para este mês
      const valorEsperadoMes = vtmTotalContrato * mesAtual
      const percentualEsperado = (valorEsperadoMes / valorTotal) * 100
      
      // Se o mês já passou, usar dados de execução real, senão usar projeção
      const jaPassou = dataAtual < hoje
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
        percentual: Math.min(jaPassou && mesAtual <= mesesDecorridos ? percentualReal : percentualEsperado, 100),
        valor: jaPassou && mesAtual <= mesesDecorridos ? valorReal : valorEsperadoMes,
        esperado: percentualEsperado,
        valorEsperado: valorEsperadoMes,
        isReal: jaPassou && mesAtual <= mesesDecorridos,
        isAtual: mesAtual === mesesDecorridos
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
              <div className="rounded-lg bg-blue-50 p-3 text-center sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Valor Total
                </p>
                <p className="text-base font-bold break-all text-blue-600 sm:text-xl">
                  {formatarMoeda(valorTotal)}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Valor Executado
                </p>
                <p className="text-base font-bold break-all text-green-600 sm:text-xl">
                  {formatarMoeda(valorExecutado)}
                </p>
              </div>
            </div>

            {/* VTM e Saldo */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-lg bg-purple-50 p-3 text-center sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  VTM do Contrato
                </p>
                <p className="text-base font-bold break-all text-purple-600 sm:text-xl">
                  {formatarMoeda(vtmTotalContrato)}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Saldo Atual
                </p>
                <p className="text-base font-bold break-all text-orange-600 sm:text-xl">
                  {formatarMoeda(indicadores.saldoAtual)}
                </p>
              </div>
            </div>

            {/* Progresso Temporal */}
            <div className="rounded-lg bg-blue-50 p-3 text-center sm:p-4">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Progresso Temporal
              </p>
              <p className="text-base font-bold text-blue-600 sm:text-xl">
                {diasVigentes} dias vigentes de {diasTotais} dias
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600">
                    {progressoTemporal.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {diasTotais - diasVigentes} dias restantes
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progressoTemporal, 100)}%` }}
                  ></div>
                </div>
              </div>
              {gastoMedioPorDia > 0 && (
                <p className="text-muted-foreground text-xs mt-2">
                  Gasto médio: {formatarMoeda(gastoMedioPorDia)}/dia
                </p>
              )}
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium sm:text-sm">
                  Percentual Executado
                </span>
                <span className="text-xs font-bold text-blue-600 sm:text-sm">
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
                    <p className={`${dadosEvolucao[mesHover].isReal ? 'text-blue-200' : 'text-gray-200'}`}>
                      {dadosEvolucao[mesHover].percentual.toFixed(1)}% 
                      {dadosEvolucao[mesHover].isReal ? ' (Real)' : ' (Projetado)'}
                    </p>
                    <p className="break-all">
                      {formatarMoeda(dadosEvolucao[mesHover].valor)}
                    </p>
                    {dadosEvolucao[mesHover].isReal && (
                      <p className="text-xs text-gray-300 mt-1">
                        Esperado: {formatarMoeda(dadosEvolucao[mesHover].valorEsperado)}
                      </p>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full transform">
                    <div className="h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-black"></div>
                  </div>
                </motion.div>
              )}

              <div className="flex h-48 items-end justify-center gap-1 overflow-x-auto p-2 pt-8 sm:h-64 sm:gap-3 sm:p-4 sm:pt-12">
                {dadosEvolucao.map((item, index) => (
                  <motion.div
                    key={index}
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
                          ? 'font-semibold text-blue-600'
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
                <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-300 rounded"></div>
                <span className="text-muted-foreground">Executado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded"></div>
                <span className="text-muted-foreground">Atual</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-t from-gray-400 to-gray-200 rounded"></div>
                <span className="text-muted-foreground">Projetado</span>
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-center text-xs">
              Passe o mouse sobre as barras para ver detalhes e comparação com VTM
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
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Início do Contrato</p>
                <p className="font-semibold text-blue-600">{formatarData(contrato.dataInicio)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Término Previsto</p>
                <p className="font-semibold text-blue-600">{formatarData(contrato.dataTermino)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Duração Total</p>
                <p className="font-semibold text-blue-600">{contrato.prazoInicialMeses} meses</p>
              </div>
            </div>
          </div>

          {/* Timeline baseada nos dados reais */}
          <div className="space-y-3 sm:space-y-4">
            {(() => {
              const hoje = new Date()
              const dataInicio = new Date(contrato.dataInicio)
              
              // Calcular períodos baseados na duração do contrato
              const duracaoTotal = contrato.prazoInicialMeses
              const mesesPorPeriodo = Math.ceil(duracaoTotal / 4) // Dividir em 4 períodos
              
              const periodos = []
              for (let i = 0; i < 4 && i * mesesPorPeriodo < duracaoTotal; i++) {
                const inicioMeses = i * mesesPorPeriodo
                const fimMeses = Math.min((i + 1) * mesesPorPeriodo - 1, duracaoTotal - 1)
                
                const periodoInicio = new Date(dataInicio)
                periodoInicio.setMonth(periodoInicio.getMonth() + inicioMeses)
                
                const periodoFim = new Date(dataInicio)
                periodoFim.setMonth(periodoFim.getMonth() + fimMeses + 1)
                periodoFim.setDate(periodoFim.getDate() - 1)
                
                // Determinar status baseado na data atual
                let status = 'pendente'
                if (hoje > periodoFim) {
                  status = 'concluido'
                } else if (hoje >= periodoInicio && hoje <= periodoFim) {
                  status = 'em_andamento'
                }
                
                const percentualEsperado = ((fimMeses + 1) / duracaoTotal) * 100
                
                periodos.push({
                  descricao: `Período ${i + 1} (${inicioMeses + 1}º ao ${fimMeses + 1}º mês)`,
                  inicio: periodoInicio.toISOString(),
                  fim: periodoFim.toISOString(),
                  status,
                  percentualEsperado: percentualEsperado.toFixed(1),
                  valorEsperado: (valorTotal * percentualEsperado) / 100
                })
              }
              
              return periodos.map((periodo, index) => {
                const statusConfig = getStatusPeriodo(periodo.status)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 rounded-lg border p-3 sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div
                      className="mt-1 h-3 w-3 flex-shrink-0 rounded-full sm:mt-0 sm:h-4 sm:w-4"
                      style={{ backgroundColor: statusConfig.color }}
                    ></div>
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
                          {formatarData(periodo.inicio)} - {formatarData(periodo.fim)}
                        </p>
                        <p className="text-xs text-blue-600">
                          Esperado: {periodo.percentualEsperado}% ({formatarMoeda(periodo.valorEsperado)})
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
                const hoje = new Date()
                const dataInicio = new Date(contrato.dataInicio)
                const duracaoTotal = contrato.prazoInicialMeses
                const mesesPorPeriodo = Math.ceil(duracaoTotal / 4)
                
                const periodos = []
                for (let i = 0; i < 4 && i * mesesPorPeriodo < duracaoTotal; i++) {
                  const inicioMeses = i * mesesPorPeriodo
                  const fimMeses = Math.min((i + 1) * mesesPorPeriodo - 1, duracaoTotal - 1)
                  
                  const periodoInicio = new Date(dataInicio)
                  periodoInicio.setMonth(periodoInicio.getMonth() + inicioMeses)
                  
                  const periodoFim = new Date(dataInicio)
                  periodoFim.setMonth(periodoFim.getMonth() + fimMeses + 1)
                  periodoFim.setDate(periodoFim.getDate() - 1)
                  
                  let status = 'pendente'
                  if (hoje > periodoFim) {
                    status = 'concluido'
                  } else if (hoje >= periodoInicio && hoje <= periodoFim) {
                    status = 'em_andamento'
                  }
                  
                  periodos.push({
                    descricao: `Período ${i + 1}`,
                    status
                  })
                }
                
                return periodos.map((periodo, index) => {
                  const statusConfig = getStatusPeriodo(periodo.status)
                  return (
                    <div
                      key={index}
                      className="h-full flex-1 rounded"
                      style={{ backgroundColor: statusConfig.color }}
                      title={`${periodo.descricao} - ${statusConfig.label}`}
                    ></div>
                  )
                })
              })()}
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span className="break-all">
                {formatarData(contrato.dataInicio)}
              </span>
              <span className="break-all">
                {formatarData(contrato.dataTermino)}
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
            const unidadesReais = contrato.unidadesVinculadas || []
            
            // Se não há unidades vinculadas, mostrar fallback
            if (!unidadesReais || unidadesReais.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma unidade vinculada</h3>
                  <p className="text-muted-foreground">Este contrato ainda não possui unidades vinculadas.</p>
                </div>
              )
            }

            // Calcular dados baseados nas unidades reais
            const unidadesComputadas = unidadesReais.map((unidade) => {
              const percentualValor = contrato.valorTotalAtribuido > 0 
                ? (unidade.valorAtribuido / contrato.valorTotalAtribuido) * 100 
                : 0
              const valorTotalMensal = vtmTotalContrato * (percentualValor / 100)
              
              return {
                ...unidade,
                nome: getUnidadeNome(unidade.unidadeSaudeId),
                percentualValor: Math.round(percentualValor * 10) / 10, // Arredondar para 1 decimal
                valorTotalMensal
              }
            })

            return (
              <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2">
                {/* Gráfico de Pizza Interativo - Responsivo */}
                <div className="relative order-2 flex items-center justify-center xl:order-1">
                  {unidadeHover !== null && unidadeHover < unidadesComputadas.length && (
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
                          {unidadesComputadas[unidadeHover].percentualValor}% do total
                        </p>
                        <p className="break-all">
                          {formatarMoeda(unidadesComputadas[unidadeHover].valorTotalMensal)}/mês
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          Valor atribuído: {formatarMoeda(unidadesComputadas[unidadeHover].valorAtribuido)}
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
                        const endAngle = startAngle + unidade.percentualValor * 3.6

                        const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180)
                        const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180)
                        const x2 = 50 + 35 * Math.cos((endAngle * Math.PI) / 180)
                        const y2 = 50 + 35 * Math.sin((endAngle * Math.PI) / 180)

                        const largeArcFlag = unidade.percentualValor > 50 ? 1 : 0

                        return (
                          <motion.path
                            key={index}
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
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-center shadow-lg sm:h-20 sm:w-20">
                        <div>
                          <p className="text-lg font-bold text-blue-600 sm:text-2xl">
                            {unidadesComputadas.length}
                          </p>
                          <p className="text-muted-foreground text-xs">Unidades</p>
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
                            ? 'scale-105 transform border-blue-300 bg-blue-50 shadow-md'
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
                              unidadeHover === index ? 'ring-2 ring-blue-300' : ''
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
                                {formatarMoeda(unidade.valorTotalMensal)}/mês
                              </span>
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              Valor atribuído: {formatarMoeda(unidade.valorAtribuido)}
                            </div>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-16 flex-shrink-0 sm:w-20">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${coresPizza[index % coresPizza.length].gradiente}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(unidade.percentualValor, 100)}%` }}
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
          <div className="mt-6 rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:mt-8 sm:p-6">
            <h4 className="mb-3 text-center text-base font-semibold sm:mb-4 sm:text-lg">
              Resumo Financeiro
            </h4>
            {(() => {
              const unidadesReais = contrato.unidadesVinculadas || []
              const maiorParticipacao = unidadesReais.length > 0 
                ? Math.max(...unidadesReais.map(u => (u.valorAtribuido / contrato.valorTotalAtribuido) * 100))
                : 0

              return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-6">
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm sm:p-4">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                      <DollarSign className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      VTM do Contrato
                    </p>
                    <p className="text-base font-bold break-all text-blue-600 sm:text-xl">
                      {formatarMoeda(vtmTotalContrato)}/mês
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm sm:p-4">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 sm:h-12 sm:w-12">
                      <TrendingUp className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Gasto Médio por Dia
                    </p>
                    <p className="text-base font-bold break-all text-green-600 sm:text-xl">
                      {formatarMoeda(gastoMedioPorDia)}/dia
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm sm:p-4">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 sm:h-12 sm:w-12">
                      <Target className="h-5 w-5 text-yellow-600 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Maior Participação
                    </p>
                    <p className="text-base font-bold text-yellow-600 sm:text-xl">
                      {maiorParticipacao.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm sm:p-4">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 sm:h-12 sm:w-12">
                      <Building className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Progresso Temporal
                    </p>
                    <p className="text-base font-bold text-purple-600 sm:text-xl">
                      {progressoTemporal.toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
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
