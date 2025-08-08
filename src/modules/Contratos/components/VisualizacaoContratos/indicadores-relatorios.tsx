import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, PieChart, DollarSign } from 'lucide-react'
import type { PeriodoVigencia, UnidadeVinculada } from '@/modules/Contratos/types/contrato-detalhado'

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
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
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
        color: '#22c55e'
      },
      em_andamento: { 
        label: 'Em Andamento', 
        className: 'bg-blue-100 text-blue-800',
        color: '#3b82f6'
      },
      pendente: { 
        label: 'Pendente', 
        className: 'bg-gray-100 text-gray-800',
        color: '#6b7280'
      }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
  }

  const valorExecutado = valorTotal - indicadores.saldoAtual

  // Cores para o gráfico de pizza
  const coresPizza = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
  ]

  return (
    <div className="space-y-6">
      {/* Saldo e Execução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Saldo e Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatarMoeda(valorTotal)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Executado</p>
                <p className="text-xl font-bold text-green-600">
                  {formatarMoeda(valorExecutado)}
                </p>
              </div>
            </div>

            {/* Saldo Atual */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatarMoeda(indicadores.saldoAtual)}
              </p>
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Percentual Executado</span>
                <span className="text-sm font-bold text-blue-600">
                  {indicadores.percentualExecutado}%
                </span>
              </div>
              <Progress value={indicadores.percentualExecutado} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Execução (Simulado) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução da Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-center gap-2 p-4">
              {/* Simulação de gráfico de barras */}
              {[
                { mes: 'Mai', valor: 15 },
                { mes: 'Jun', valor: 25 },
                { mes: 'Jul', valor: 35 },
                { mes: 'Ago', valor: 45 },
                { mes: 'Set', valor: 45 },
                { mes: 'Out', valor: 45 },
                { mes: 'Nov', valor: 45 },
                { mes: 'Dez', valor: 45 }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="bg-blue-500 rounded-t w-8 transition-all duration-500"
                    style={{ height: `${item.valor * 4}px` }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item.mes}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Percentual executado por mês
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cronograma de Vigência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Vigência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indicadores.cronogramaVigencia.map((periodo, index) => {
              const statusConfig = getStatusPeriodo(periodo.status)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-semibold">{periodo.descricao}</h4>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatarData(periodo.inicio)} - {formatarData(periodo.fim)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Timeline Visual */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 h-4">
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
              <span>{formatarData(indicadores.cronogramaVigencia[0]?.inicio || '')}</span>
              <span>{formatarData(indicadores.cronogramaVigencia[indicadores.cronogramaVigencia.length - 1]?.fim || '')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Unidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição por Unidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza Simulado */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {unidades.vinculadas.map((unidade, index) => {
                    const startAngle = unidades.vinculadas
                      .slice(0, index)
                      .reduce((acc, u) => acc + (u.percentualValor * 3.6), 0)
                    const endAngle = startAngle + (unidade.percentualValor * 3.6)
                    
                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
                    
                    const largeArcFlag = unidade.percentualValor > 50 ? 1 : 0
                    
                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={coresPizza[index % coresPizza.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{unidades.vinculadas.length}</p>
                    <p className="text-xs text-muted-foreground">Unidades</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legenda e Detalhes */}
            <div className="space-y-3">
              {unidades.vinculadas.map((unidade, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: coresPizza[index % coresPizza.length] }}
                  ></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{unidade.nome}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{unidade.percentualValor}% do total</span>
                      <span>{formatarMoeda(unidade.valorTotalMensal)}/mês</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Mensal</p>
                <p className="text-lg font-bold">
                  {formatarMoeda(
                    unidades.vinculadas.reduce((acc, u) => acc + u.valorTotalMensal, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Participação</p>
                <p className="text-lg font-bold">
                  {Math.max(...unidades.vinculadas.map(u => u.percentualValor))}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidades Ativas</p>
                <p className="text-lg font-bold">
                  {unidades.vinculadas.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
