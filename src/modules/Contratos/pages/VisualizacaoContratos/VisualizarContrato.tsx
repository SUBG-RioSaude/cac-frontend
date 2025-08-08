import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Componentes das abas
import { DetalhesContrato } from '@/modules/Contratos/components/VisualizacaoContratos/detalhes-contrato'
import { RegistroAlteracoes } from '@/modules/Contratos/components/VisualizacaoContratos/registro-alteracoes'
import { IndicadoresRelatorios } from '@/modules/Contratos/components/VisualizacaoContratos/indicadores-relatorios'

// Dados mock
import { contratoDetalhadoMock } from '../../data/contrato-detalhado-mock'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato-detalhado'

export function VisualizarContrato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<ContratoDetalhado | null>(null)
  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento dos dados
    const carregarContrato = async () => {
      setLoading(true)
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContrato(contratoDetalhadoMock)
      setLoading(false)
    }

    carregarContrato()
  }, [id])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { 
        variant: 'default' as const, 
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold'
      },
      vencendo: { 
        variant: 'secondary' as const, 
        label: 'Vencendo em Breve',
        className: 'bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-semibold'
      },
      vencido: { 
        variant: 'destructive' as const, 
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 px-3 py-1 text-sm font-semibold'
      },
      suspenso: { 
        variant: 'outline' as const, 
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800 px-3 py-1 text-sm font-semibold'
      },
      encerrado: { 
        variant: 'outline' as const, 
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const handleEditar = () => {
    navigate(`/contratos/${id}/editar`)
  }

  const handleExportar = () => {
    console.log('Exportar contrato:', contrato)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Contrato não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O contrato solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={() => navigate('/contratos')}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/contratos')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {contrato.numeroContrato}
                  </h1>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contrato.status)}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {contrato.fornecedor.razaoSocial}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg">
              {/* Contador de dias */}
              <div className="text-center p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const hoje = new Date()
                    const dataInicio = new Date(contrato.dataInicio)
                    const diffTime = hoje.getTime() - dataInicio.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays > 0 ? diffDays : 0
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">dias vigente</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportar}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button onClick={handleEditar}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Resumo Rápido */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-semibold">
                    {formatarMoeda(contrato.valorTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vigência</p>
                  <p className="text-sm font-medium">
                    {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} - {' '}
                    {new Date(contrato.dataTermino).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Execução</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {contrato.indicadores.percentualExecutado}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Abas Principais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="detalhes" className="text-sm sm:text-base">
                Detalhes do Contrato
              </TabsTrigger>
              <TabsTrigger value="alteracoes" className="text-sm sm:text-base">
                Registro de Alterações
              </TabsTrigger>
              <TabsTrigger value="indicadores" className="text-sm sm:text-base">
                Indicadores e Relatórios
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={abaAtiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="detalhes" className="mt-0">
                  <DetalhesContrato contrato={contrato} />
                </TabsContent>

                <TabsContent value="alteracoes" className="mt-0">
                  <RegistroAlteracoes alteracoes={contrato.alteracoes} />
                </TabsContent>

                <TabsContent value="indicadores" className="mt-0">
                  <IndicadoresRelatorios 
                    indicadores={contrato.indicadores}
                    unidades={contrato.unidades}
                    valorTotal={contrato.valorTotal}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
