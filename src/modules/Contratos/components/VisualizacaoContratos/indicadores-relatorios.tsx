import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, PieChart, DollarSign, Target, Building } from "lucide-react"
import type { PeriodoVigencia, UnidadeVinculada } from "../../types/contrato-detalhado"

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
}

export function IndicadoresRelatorios({ indicadores, unidades, valorTotal }: IndicadoresRelatoriosProps) {
  const [mesHover, setMesHover] = useState<number | null>(null)
  const [unidadeHover, setUnidadeHover] = useState<number | null>(null)

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const getStatusPeriodo = (status: string) => {
    const statusConfig = {
      concluido: {
        label: "Concluído",
        className: "bg-green-100 text-green-800",
        color: "#22c55e",
      },
      em_andamento: {
        label: "Em Andamento",
        className: "bg-blue-100 text-blue-800",
        color: "#3b82f6",
      },
      pendente: {
        label: "Pendente",
        className: "bg-gray-100 text-gray-800",
        color: "#6b7280",
      },
    }

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
  }

  const valorExecutado = valorTotal - indicadores.saldoAtual

  const dadosEvolucao = [
    { mes: "Mai", percentual: 15, valor: valorTotal * 0.15 },
    { mes: "Jun", percentual: 25, valor: valorTotal * 0.25 },
    { mes: "Jul", percentual: 35, valor: valorTotal * 0.35 },
    { mes: "Ago", percentual: 45, valor: valorTotal * 0.45 },
    { mes: "Set", percentual: 45, valor: valorTotal * 0.45 },
    { mes: "Out", percentual: 45, valor: valorTotal * 0.45 },
    { mes: "Nov", percentual: 45, valor: valorTotal * 0.45 },
    { mes: "Dez", percentual: 45, valor: valorTotal * 0.45 },
  ]

  // Cores para o gráfico de pizza com gradientes
  const coresPizza = [
    { cor: "#3b82f6", gradiente: "from-blue-400 to-blue-600" }, // blue
    { cor: "#10b981", gradiente: "from-emerald-400 to-emerald-600" }, // emerald
    { cor: "#f59e0b", gradiente: "from-amber-400 to-amber-600" }, // amber
    { cor: "#ef4444", gradiente: "from-red-400 to-red-600" }, // red
    { cor: "#8b5cf6", gradiente: "from-violet-400 to-violet-600" }, // violet
    { cor: "#06b6d4", gradiente: "from-cyan-400 to-cyan-600" }, // cyan
  ]

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Saldo e Execução - Responsivo */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Saldo e Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Valores - Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
                <p className="text-base sm:text-xl font-bold text-blue-600 break-all">{formatarMoeda(valorTotal)}</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Valor Executado</p>
                <p className="text-base sm:text-xl font-bold text-green-600 break-all">
                  {formatarMoeda(valorExecutado)}
                </p>
              </div>
            </div>

            {/* Saldo Atual */}
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600 break-all">
                {formatarMoeda(indicadores.saldoAtual)}
              </p>
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium">Percentual Executado</span>
                <span className="text-xs sm:text-sm font-bold text-blue-600">{indicadores.percentualExecutado}%</span>
              </div>
              <Progress value={indicadores.percentualExecutado} className="h-2 sm:h-3" />
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
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-2 rounded-lg text-xs sm:text-sm z-20 shadow-lg max-w-xs"
                >
                  <div className="text-center">
                    <p className="font-semibold">{dadosEvolucao[mesHover].mes}</p>
                    <p>{dadosEvolucao[mesHover].percentual}% executado</p>
                    <p className="break-all">{formatarMoeda(dadosEvolucao[mesHover].valor)}</p>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                  </div>
                </motion.div>
              )}

              <div className="h-48 sm:h-64 flex items-end justify-center gap-1 sm:gap-3 p-2 sm:p-4 pt-8 sm:pt-12 overflow-x-auto">
                {dadosEvolucao.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer min-w-0 flex-shrink-0"
                    onMouseEnter={() => setMesHover(index)}
                    onMouseLeave={() => setMesHover(null)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className={`rounded-t w-6 sm:w-10 transition-all duration-300 ${
                        mesHover === index
                          ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg"
                          : "bg-gradient-to-t from-blue-500 to-blue-300"
                      }`}
                      style={{ height: `${Math.max(item.percentual * 2.5, 10)}px` }}
                      animate={{
                        height: `${Math.max(item.percentual * 2.5, 10)}px`,
                        scale: mesHover === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span
                      className={`text-xs transition-colors duration-200 ${
                        mesHover === index ? "text-blue-600 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {item.mes}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Passe o mouse sobre as barras para ver detalhes
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
          <div className="space-y-3 sm:space-y-4">
            {indicadores.cronogramaVigencia.map((periodo, index) => {
              const statusConfig = getStatusPeriodo(periodo.status)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
                >
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 sm:mt-0"
                    style={{ backgroundColor: statusConfig.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm sm:text-base break-words">{periodo.descricao}</h4>
                      <Badge className={`${statusConfig.className} text-xs flex-shrink-0`}>{statusConfig.label}</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {formatarData(periodo.inicio)} - {formatarData(periodo.fim)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Timeline Visual - Responsivo */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 h-3 sm:h-4 overflow-hidden">
              {indicadores.cronogramaVigencia.map((periodo, index) => {
                const statusConfig = getStatusPeriodo(periodo.status)
                return (
                  <div
                    key={index}
                    className="flex-1 h-full rounded"
                    style={{ backgroundColor: statusConfig.color }}
                    title={`${periodo.descricao} - ${statusConfig.label}`}
                  ></div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span className="break-all">{formatarData(indicadores.cronogramaVigencia[0]?.inicio || "")}</span>
              <span className="break-all">
                {formatarData(indicadores.cronogramaVigencia[indicadores.cronogramaVigencia.length - 1]?.fim || "")}
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Gráfico de Pizza Interativo - Responsivo */}
            <div className="flex items-center justify-center relative order-2 xl:order-1">
              {unidadeHover !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm z-30 shadow-xl max-w-xs"
                >
                  <div className="text-center">
                    <p className="font-semibold break-words">{unidades.vinculadas[unidadeHover].nome}</p>
                    <p>{unidades.vinculadas[unidadeHover].percentualValor}% do total</p>
                    <p className="break-all">{formatarMoeda(unidades.vinculadas[unidadeHover].valorTotalMensal)}/mês</p>
                  </div>
                </motion.div>
              )}

              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {unidades.vinculadas.map((unidade, index) => {
                    const startAngle = unidades.vinculadas
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
                          opacity: unidadeHover !== null && unidadeHover !== index ? 0.7 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                          filter: unidadeHover === index ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
                          transformOrigin: "50px 50px",
                        }}
                      />
                    )
                  })}
                </svg>

                {/* Centro do gráfico */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{unidades.vinculadas.length}</p>
                      <p className="text-xs text-muted-foreground">Unidades</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legenda e Detalhes - Responsivo */}
            <div className="space-y-3 order-1 xl:order-2">
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Detalhamento por Unidade</h4>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-2 sm:space-y-3">
                {unidades.vinculadas.map((unidade, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                      unidadeHover === index
                        ? "border-blue-300 bg-blue-50 shadow-md transform scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={{
                      filter: unidadeHover === index ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
                      transformOrigin: "50px 50px",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full shadow-sm flex-shrink-0 ${
                          unidadeHover === index ? "ring-2 ring-blue-300" : ""
                        }`}
                        style={{ backgroundColor: coresPizza[index % coresPizza.length].cor }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm break-words">{unidade.nome}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground mt-1">
                          <span className="font-medium">{unidade.percentualValor}% do total</span>
                          <span className="break-all">{formatarMoeda(unidade.valorTotalMensal)}/mês</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-16 sm:w-20 flex-shrink-0">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${coresPizza[index % coresPizza.length].gradiente}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${unidade.percentualValor}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo Financeiro - Responsivo */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-center">Resumo Financeiro</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Mensal</p>
                <p className="text-base sm:text-xl font-bold text-blue-600 break-all">
                  {formatarMoeda(unidades.vinculadas.reduce((acc, u) => acc + u.valorTotalMensal, 0))}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Maior Participação</p>
                <p className="text-base sm:text-xl font-bold text-green-600">
                  {Math.max(...unidades.vinculadas.map((u) => u.percentualValor))}%
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm sm:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Unidades Ativas</p>
                <p className="text-base sm:text-xl font-bold text-purple-600">{unidades.vinculadas.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Passe o mouse sobre o gráfico para ver detalhes
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
