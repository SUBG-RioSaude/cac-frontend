import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Unidade, PaginacaoParamsUnidade, OrdenacaoParams, ColunaOrdenacao } from "@/modules/Unidades/ListaUnidades/types/unidade"
import { useNavigate } from "react-router-dom"

interface TabelaUnidadesProps {
  unidades: Unidade[]
  unidadesSelecionadas: number[]
  onUnidadesSelecionadasChange: (selecionadas: number[]) => void
  paginacao: PaginacaoParamsUnidade
  onPaginacaoChange: (paginacao: PaginacaoParamsUnidade) => void
  onVisualizarUnidade: (unidade: Unidade) => void
  onEditarUnidade: (unidade: Unidade) => void
  ordenacao: OrdenacaoParams
  onOrdenacao: (coluna: ColunaOrdenacao) => void
}

export function TabelaUnidades({
  unidades,
  unidadesSelecionadas,
  onUnidadesSelecionadasChange,
  paginacao,
  onPaginacaoChange,
  onVisualizarUnidade,
  onEditarUnidade,
  ordenacao,
  onOrdenacao,
}: TabelaUnidadesProps) {
  const navigate = useNavigate()

  const handleVisualizarUnidade = (unidade: Unidade) => {
    navigate(`/unidades/${unidade.id}`)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const getIconeOrdenacao = (coluna: ColunaOrdenacao) => {
    if (ordenacao.coluna !== coluna) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return ordenacao.direcao === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />
  }
  
  const getStatusBadge = (status: string = 'ativo') => {
    const statusConfig = {
      ativo: {
        variant: "default" as const,
        label: "Ativo",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      inativo: {
        variant: "secondary" as const,
        label: "Inativo",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleSelecionarUnidade = (id: number, selecionado: boolean) => {
    if (selecionado) {
      onUnidadesSelecionadasChange([...unidadesSelecionadas, id])
    } else {
      onUnidadesSelecionadasChange(unidadesSelecionadas.filter(unidadeId => unidadeId !== id))
    }
  }

  const handleSelecionarTodas = (selecionadas: boolean) => {
    if (selecionadas) {
      const unidadesPaginadas = unidades.slice(
        (paginacao.pagina - 1) * paginacao.itensPorPagina,
        paginacao.pagina * paginacao.itensPorPagina
      )
      onUnidadesSelecionadasChange(unidadesPaginadas.map(u => u.id))
    } else {
      onUnidadesSelecionadasChange([])
    }
  }

  // Paginação
  const unidadesPaginadas = unidades.slice(
    (paginacao.pagina - 1) * paginacao.itensPorPagina,
    paginacao.pagina * paginacao.itensPorPagina
  )

  const totalPaginas = Math.ceil(unidades.length / paginacao.itensPorPagina)
  
  const todasUnidadesSelecionadas = unidadesPaginadas.length > 0 && 
    unidadesPaginadas.every(u => unidadesSelecionadas.includes(u.id))

  const proximaPagina = () => {
    if (paginacao.pagina < totalPaginas) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina + 1
      })
    }
  }

  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina - 1
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">Lista de Unidades</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {unidades.length} unidades encontradas
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-3 sm:mx-6 mb-3 sm:mb-6">
            {/* Versão mobile - Cards */}
            <div className="block lg:hidden space-y-3">
              <AnimatePresence>
                {unidadesPaginadas.map((unidade, index) => (
                  <motion.div
                    key={unidade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={unidadesSelecionadas.includes(unidade.id)}
                            onCheckedChange={(checked) => handleSelecionarUnidade(unidade.id, checked as boolean)}
                          />
                          <div>
                            <div className="font-medium text-sm">{unidade.nome}</div>
                            <div className="text-xs text-muted-foreground">{unidade.sigla}</div>
                          </div>
                        </div>
                        {getStatusBadge(unidade.status)}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">UO</p>
                          <p className="text-sm">{unidade.UO}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">UG</p>
                          <p className="text-sm">{unidade.UG}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contratos Ativos</p>
                          <p className="text-sm font-medium">{unidade.contratosAtivos || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Total Contratado</p>
                          <p className="text-sm font-medium">{formatarMoeda(unidade.valorTotalContratado || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Endereço</p>
                          <p className="text-sm line-clamp-2">{unidade.endereco}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVisualizarUnidade(unidade)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => null}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVisualizarUnidade(unidade)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditarUnidade(unidade)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Versão desktop - Tabela */}
            <div className="hidden lg:block rounded-lg border bg-background/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={todasUnidadesSelecionadas}
                        onCheckedChange={handleSelecionarTodas}
                      />
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('nome')}
                    >
                      <div className="flex items-center gap-2">
                        Nome
                        {getIconeOrdenacao('nome')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('sigla')}
                    >
                      <div className="flex items-center gap-2">
                        Sigla
                        {getIconeOrdenacao('sigla')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('UO')}
                    >
                      <div className="flex items-center gap-2">
                        UO
                        {getIconeOrdenacao('UO')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('UG')}
                    >
                      <div className="flex items-center gap-2">
                        UG
                        {getIconeOrdenacao('UG')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getIconeOrdenacao('status')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('contratosAtivos')}
                    >
                      <div className="flex items-center gap-2">
                        Contratos
                        {getIconeOrdenacao('contratosAtivos')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onOrdenacao('valorTotalContratado')}
                    >
                      <div className="flex items-center gap-2">
                        Valor Total
                        {getIconeOrdenacao('valorTotalContratado')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Endereço</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {unidadesPaginadas.map((unidade, index) => (
                      <motion.tr
                        key={unidade.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={unidadesSelecionadas.includes(unidade.id)}
                            onCheckedChange={(checked) => handleSelecionarUnidade(unidade.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm line-clamp-2 max-w-[200px]">
                            {unidade.nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{unidade.sigla}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{unidade.UO}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{unidade.UG}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(unidade.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-center">
                            {unidade.contratosAtivos || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-right">
                            {formatarMoeda(unidade.valorTotalContratado || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm line-clamp-2 max-w-[300px]">{unidade.endereco}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisualizarUnidade(unidade)}
                              className="h-8 w-8 p-0 opacity-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditarUnidade(unidade)}
                              className="h-8 w-8 p-0 opacity-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleVisualizarUnidade(unidade)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditarUnidade(unidade)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Mostrando {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1} a{" "}
              {Math.min(paginacao.pagina * paginacao.itensPorPagina, unidades.length)} de {unidades.length} unidades
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={paginaAnterior}
                disabled={paginacao.pagina === 1}
                className="flex items-center gap-2 bg-transparent text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={paginacao.pagina === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPaginacaoChange({ ...paginacao, pagina: pageNum })}
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={proximaPagina}
                disabled={paginacao.pagina === totalPaginas}
                className="flex items-center gap-2 bg-transparent text-xs sm:text-sm"
              >
                <span className="hidden xs:inline">Próxima</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>    
    </motion.div> 
  )
}