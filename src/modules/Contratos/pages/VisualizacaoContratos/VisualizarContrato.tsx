import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Download, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Componentes das abas
import { DetalhesContrato } from "../../components/VisualizacaoContratos/detalhes-contrato"
import { RegistroAlteracoes } from "../../components/VisualizacaoContratos/registro-alteracoes"
import { IndicadoresRelatorios } from "../../components/VisualizacaoContratos/indicadores-relatorios"

// Dados mock
import { contratoDetalhadoMock } from "../../data/contratos-mock"
import type { ContratoDetalhado } from "../../types/contrato-detalhado"

export function VisualizarContrato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<ContratoDetalhado | null>(null)
  const [abaAtiva, setAbaAtiva] = useState("detalhes")
  const [loading, setLoading] = useState(true)
  const [modoEdicaoGlobal, setModoEdicaoGlobal] = useState(false)

  useEffect(() => {
    // Simular carregamento dos dados
    const carregarContrato = async () => {
      setLoading(true)
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setContrato(contratoDetalhadoMock)
      setLoading(false)
    }

    carregarContrato()
  }, [id])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        variant: "default" as const,
        label: "Ativo",
        className: "bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold",
      },
      vencendo: {
        variant: "secondary" as const,
        label: "Vencendo em Breve",
        className: "bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-semibold",
      },
      vencido: {
        variant: "destructive" as const,
        label: "Vencido",
        className: "bg-red-100 text-red-800 px-3 py-1 text-sm font-semibold",
      },
      suspenso: {
        variant: "outline" as const,
        label: "Suspenso",
        className: "bg-gray-100 text-gray-800 px-3 py-1 text-sm font-semibold",
      },
      encerrado: {
        variant: "outline" as const,
        label: "Encerrado",
        className: "bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const handleEditarGlobal = () => {
    setModoEdicaoGlobal(!modoEdicaoGlobal)
  }

  const handleExportar = () => {
    console.log("Exportar contrato:", contrato)
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
            <Button onClick={() => navigate("/contratos")}>Voltar para Lista</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Header Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl border shadow-sm p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            {/* Linha superior - Navegação e ações */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/contratos")}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Voltar</span>
                </Button>
                <Separator orientation="vertical" className="h-4 sm:h-6" />
              </div>

              {/* Ações do header - Responsivo */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                {/* Contador de dias - Sempre visível mas adaptativo */}
                <div className="text-center sm:text-right">
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
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

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportar}
                    className="text-xs sm:text-sm bg-transparent"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button
                    onClick={handleEditarGlobal}
                    variant={modoEdicaoGlobal ? "destructive" : "default"}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden md:inline">{modoEdicaoGlobal ? "Cancelar" : "Editar Tudo"}</span>
                    <span className="md:hidden">{modoEdicaoGlobal ? "Cancelar" : "Editar"}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportar}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Título e status */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-all">{contrato.numeroContrato}</h1>
                <div className="flex items-center gap-2">{getStatusBadge(contrato.status)}</div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground break-words">
                {contrato.fornecedor.razaoSocial}
              </p>
            </div>
          </div>

          {/* Resumo Rápido - Responsivo */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-base sm:text-lg font-semibold break-all">{formatarMoeda(contrato.valorTotal)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Vigência</p>
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {new Date(contrato.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(contrato.dataTermino).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Execução</p>
                  <p className="text-base sm:text-lg font-semibold text-blue-600">
                    {contrato.indicadores.percentualExecutado}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg border shadow-sm">
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto bg-gray-50 rounded-lg p-1">
                <TabsTrigger
                  value="detalhes"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 transition-all duration-200 rounded-md"
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 data-[state=active]:bg-blue-700"></div>
                  <span className="text-center">Detalhes do Contrato</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alteracoes"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-200 transition-all duration-200 rounded-md"
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 data-[state=active]:bg-orange-700"></div>
                  <span className="text-center">Registro de Alterações</span>
                </TabsTrigger>
                <TabsTrigger
                  value="indicadores"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-green-200 transition-all duration-200 rounded-md"
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 data-[state=active]:bg-green-700"></div>
                  <span className="text-center">Indicadores e Relatórios</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* Conteúdo das Abas - Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={abaAtiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <TabsContent value="detalhes" className="mt-0 w-full">
                  <DetalhesContrato contrato={contrato} />
                </TabsContent>

                <TabsContent value="alteracoes" className="mt-0 w-full">
                  <RegistroAlteracoes alteracoes={contrato.alteracoes} />
                </TabsContent>

                <TabsContent value="indicadores" className="mt-0 w-full">
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