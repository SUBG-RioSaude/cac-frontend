import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFornecedoresStore } from '../store/fornecedores-store'
import type {
  Fornecedor,
  PaginacaoParamsFornecedor,
} from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'

interface TabelaFornecedoresProps {
  fornecedores: Fornecedor[]
  paginacao: PaginacaoParamsFornecedor
  onPaginacaoChange: (paginacao: PaginacaoParamsFornecedor) => void
  onAbrirFornecedor: (fornecedor: Fornecedor) => void
  isLoading?: boolean
}

export function TabelaFornecedores({
  fornecedores,
  paginacao,
  onPaginacaoChange,
  onAbrirFornecedor,
  isLoading = false,
}: TabelaFornecedoresProps) {
  const {
    fornecedoresSelecionados,
    selecionarFornecedor,
    selecionarTodosFornecedores,
  } = useFornecedoresStore()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        variant: 'default' as const,
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
      },
      inativo: {
        variant: 'secondary' as const,
        label: 'Inativo',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      suspenso: {
        variant: 'destructive' as const,
        label: 'Suspenso',
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleSelecionarTodos = (checked: boolean) => {
    selecionarTodosFornecedores(checked)
  }

  const handleSelecionarFornecedor = (
    fornecedorId: string,
    checked: boolean,
  ) => {
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
    fornecedores.length > 0 &&
    fornecedores.every((f) => fornecedoresSelecionados.includes(f.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur">
        <CardHeader className="px-3 pb-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold sm:text-xl">
                Lista de Fornecedores
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {isLoading ? 'Carregando...' : `${paginacao.total} fornecedores encontrados`}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-3 mb-3 sm:mx-6 sm:mb-6">
            {/* Versão mobile - Cards */}
            <div className="block space-y-3 lg:hidden">
              <AnimatePresence>
                {fornecedores.map((fornecedor, index) => (
                  <motion.div
                    key={fornecedor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-4 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={fornecedoresSelecionados.includes(
                              fornecedor.id,
                            )}
                            onCheckedChange={(checked) =>
                              handleSelecionarFornecedor(
                                fornecedor.id,
                                checked as boolean,
                              )
                            }
                          />
                        </div>
                        {getStatusBadge(fornecedor.status)}
                      </div>

                      <div className="mb-3 space-y-2">
                        <div>
                          <p className="text-muted-foreground text-xs">CNPJ</p>
                          <p className="text-sm">
                            {formatarCNPJ(fornecedor.cnpj)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Contratos Ativos
                            </p>
                            <p className="text-sm font-semibold">
                              {fornecedor.contratosAtivos}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Valor Total
                            </p>
                            <p className="text-sm font-semibold">
                              {formatarMoeda(fornecedor.valorTotalContratos)}
                            </p>
                          </div>
                        </div>

                        {fornecedor.endereco && (
                          <div>
                            <p className="text-muted-foreground text-xs">Localização</p>
                            <p className="text-sm">
                              {fornecedor.endereco.cidade} - {fornecedor.endereco.uf}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAbrirFornecedor(fornecedor)}
                          className="h-8 w-8 p-0"
                          aria-label="Abrir fornecedor"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label="Abrir menu de ações"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onAbrirFornecedor(fornecedor)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Abrir
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
            <div className="bg-background/50 hidden overflow-hidden rounded-lg border lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={todosFornecedoresSelecionados}
                        onCheckedChange={handleSelecionarTodos}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">
                      Razão Social
                    </TableHead>
                    <TableHead className="font-semibold">CNPJ</TableHead>
                    <TableHead className="font-semibold">
                      Contratos Ativos
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Valor Total</TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
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
                            checked={fornecedoresSelecionados.includes(
                              fornecedor.id,
                            )}
                            onCheckedChange={(checked) =>
                              handleSelecionarFornecedor(
                                fornecedor.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-2 text-sm font-medium">
                            {fornecedor.razaoSocial}
                          </div>
                          {fornecedor.endereco && (
                            <div className="text-muted-foreground text-xs mt-1">
                              {fornecedor.endereco.cidade} - {fornecedor.endereco.uf}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {formatarCNPJ(fornecedor.cnpj)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center text-sm font-semibold">
                            {fornecedor.contratosAtivos}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(fornecedor.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">
                            {formatarMoeda(fornecedor.valorTotalContratos)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAbrirFornecedor(fornecedor)}
                              className="h-8 w-8 p-0 opacity-100"
                              aria-label="Abrir fornecedor"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-100"
                                  aria-label="Abrir menu de ações"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    onAbrirFornecedor(fornecedor)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Abrir
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

          <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
            <div className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
              Mostrando {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1}{' '}
              a{' '}
              {Math.min(
                paginacao.pagina * paginacao.itensPorPagina,
                paginacao.total,
              )}{' '}
              de {paginacao.total} fornecedores
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
                <span className="xs:inline hidden">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        paginacao.pagina === pageNum ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        onPaginacaoChange({ ...paginacao, pagina: pageNum })
                      }
                      className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
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
                <span className="xs:inline hidden">Próxima</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
