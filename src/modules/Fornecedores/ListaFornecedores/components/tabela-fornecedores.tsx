import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useFornecedoresStore } from "../store/fornecedores-store"
import type { Fornecedor, PaginacaoParamsFornecedor } from "@/modules/Fornecedores/ListaFornecedores/types/fornecedor"

interface TabelaFornecedoresProps {
  fornecedores: Fornecedor[]
  paginacao: PaginacaoParamsFornecedor
  onPaginacaoChange: (paginacao: PaginacaoParamsFornecedor) => void
  onVisualizarFornecedor: (fornecedor: Fornecedor) => void
  onEditarFornecedor: (fornecedor: Fornecedor) => void
}

export function TabelaFornecedores({
  fornecedores,
  paginacao,
  onPaginacaoChange,
  onVisualizarFornecedor,
  onEditarFornecedor,
}: TabelaFornecedoresProps) {
  const { 
    fornecedoresSelecionados, 
    selecionarFornecedor, 
    selecionarTodosFornecedores 
  } = useFornecedoresStore()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        variant: "default" as const,
        label: "Ativo",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      inativo: {
        variant: "secondary" as const,
        label: "Inativo",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
      suspenso: {
        variant: "destructive" as const,
        label: "Suspenso",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleSelecionarTodos = (checked: boolean) => {
    selecionarTodosFornecedores(checked)
  }

  const handleSelecionarFornecedor = (fornecedorId: string, checked: boolean) => {
    selecionarFornecedor(fornecedorId, checked)
  }

  const totalPaginas = Math.ceil(paginacao.total / paginacao.itensPorPagina)

  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      onPaginacaoChange({ ...paginacao, pagina: paginacao.pagina - 1 })
    }
  }

  const proximaPagina = () => {
    if (paginacao.pagina < totalPaginas) {
      onPaginacaoChange({ ...paginacao, pagina: paginacao.pagina + 1 })
    }
  }

  const todosFornecedoresSelecionados =
    fornecedores.length > 0 && fornecedores.every((f) => fornecedoresSelecionados.includes(f.id))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">Lista de Fornecedores</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {paginacao.total} fornecedores encontrados
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-3 sm:mx-6 mb-3 sm:mb-6">
            {/* Versão mobile - Cards */}
            <div className="block lg:hidden space-y-3">
              <AnimatePresence>
                {fornecedores.map((fornecedor, index) => (
                  <motion.div
                    key={fornecedor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={fornecedoresSelecionados.includes(fornecedor.id)}
                            onCheckedChange={(checked) => handleSelecionarFornecedor(fornecedor.id, checked as boolean)}
                          />
                          <div>
                            <div className="font-medium text-sm">{fornecedor.razaoSocial}</div>
                            <div className="text-xs text-muted-foreground">{fornecedor.nomeFantasia}</div>
                          </div>
                        </div>
                        {getStatusBadge(fornecedor.status)}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">CNPJ</p>
                          <p className="text-sm">{formatarCNPJ(fornecedor.cnpj)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Contratos Ativos</p>
                            <p className="font-semibold text-sm">{fornecedor.contratosAtivos}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Valor Total</p>
                            <p className="font-semibold text-sm">{formatarMoeda(fornecedor.valorTotalContratos)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVisualizarFornecedor(fornecedor)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditarFornecedor(fornecedor)}
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
                            <DropdownMenuItem onClick={() => onVisualizarFornecedor(fornecedor)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditarFornecedor(fornecedor)}>
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
                        checked={todosFornecedoresSelecionados}
                        onCheckedChange={handleSelecionarTodos}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Razão Social</TableHead>
                    <TableHead className="font-semibold">Nome Fantasia</TableHead>
                    <TableHead className="font-semibold">CNPJ</TableHead>
                    <TableHead className="font-semibold">Contratos Ativos</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Valor Total</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {fornecedores.map((fornecedor, index) => (
                      <motion.tr
                        key={fornecedor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={fornecedoresSelecionados.includes(fornecedor.id)}
                            onCheckedChange={(checked) => handleSelecionarFornecedor(fornecedor.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm line-clamp-2">{fornecedor.razaoSocial}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm line-clamp-1">{fornecedor.nomeFantasia}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{formatarCNPJ(fornecedor.cnpj)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-center">{fornecedor.contratosAtivos}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(fornecedor.status)}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm">{formatarMoeda(fornecedor.valorTotalContratos)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onVisualizarFornecedor(fornecedor)}
                              className="h-8 w-8 p-0 opacity-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditarFornecedor(fornecedor)}
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
                                <DropdownMenuItem onClick={() => onVisualizarFornecedor(fornecedor)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditarFornecedor(fornecedor)}>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Mostrando {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1} a{" "}
              {Math.min(paginacao.pagina * paginacao.itensPorPagina, paginacao.total)} de {paginacao.total} fornecedores
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
