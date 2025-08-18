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
  Edit,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Building,
  DollarSign,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContratosStore } from '@/modules/Contratos/store/contratos-store'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import { useNavigate } from 'react-router-dom'

export function TabelaContratos() {
  const {
    contratosFiltrados,
    paginacao,
    contratosSelecionados,
    setPaginacao,
    selecionarContrato,
    selecionarTodosContratos,
  } = useContratosStore()

  const navigate = useNavigate()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
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
      vencendo: {
        variant: 'secondary' as const,
        label: 'Vencendo em Breve',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      },
      vencido: {
        variant: 'destructive' as const,
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
      },
      suspenso: {
        variant: 'outline' as const,
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      encerrado: {
        variant: 'outline' as const,
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleVisualizarContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}`)
  }

  const handleEditarContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}/editar`)
  }

  // Paginação
  const inicio = (paginacao.pagina - 1) * paginacao.itensPorPagina
  const fim = inicio + paginacao.itensPorPagina
  const contratosPaginados = contratosFiltrados.slice(inicio, fim)

  const totalPaginas = Math.ceil(paginacao.total / paginacao.itensPorPagina)

  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      setPaginacao({ ...paginacao, pagina: paginacao.pagina - 1 })
    }
  }

  const proximaPagina = () => {
    if (paginacao.pagina < totalPaginas) {
      setPaginacao({ ...paginacao, pagina: paginacao.pagina + 1 })
    }
  }

  const todosContratosSelecionados =
    contratosPaginados.length > 0 &&
    contratosPaginados.every((c) => contratosSelecionados.includes(c.id))
  const algunsContratosSelecionados =
    contratosSelecionados.length > 0 && !todosContratosSelecionados

  // Mobile Card Component
  const MobileContractCard = ({
    contrato,
    index,
  }: {
    contrato: Contrato
    index: number
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="mb-4 transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={contratosSelecionados.includes(contrato.id)}
                onCheckedChange={(checked) =>
                  selecionarContrato(contrato.id, checked as boolean)
                }
              />
              <div>
                <h3 className="text-sm font-semibold">
                  {contrato.numeroContrato}
                </h3>
                {contrato.numeroCCon && (
                  <p className="text-muted-foreground text-xs">
                    CCon: {contrato.numeroCCon}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge(contrato.status)}
          </div>

          <div className="space-y-3">
            <div>
              <p className="line-clamp-1 text-sm font-medium">
                {contrato.contratada.razaoSocial}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatarCNPJ(contrato.contratada.cnpj)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="text-muted-foreground h-3 w-3" />
                <span className="font-semibold">
                  {formatarMoeda(contrato.valor)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="text-muted-foreground h-3 w-3" />
                <span className="truncate">{contrato.unidade}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Calendar className="text-muted-foreground h-3 w-3" />
              <span>
                {formatarData(contrato.dataInicial)} -{' '}
                {formatarData(contrato.dataFinal)}
              </span>
            </div>

            <p className="text-muted-foreground line-clamp-2 text-xs">
              {contrato.objeto}
            </p>

            <div className="flex items-center justify-end gap-1 border-t pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVisualizarContrato(contrato)}
                className="h-8 w-8 p-0"
                title="Visualizar contrato"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditarContrato(contrato)}
                className="h-8 w-8 p-0"
                title="Editar contrato"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Mais opções"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleVisualizarContrato(contrato)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEditarContrato(contrato)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card/50 border-0 shadow-2xl backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-lg font-semibold sm:text-xl">
                Lista de Contratos
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {paginacao.total} contratos encontrados
              </p>
            </div>

            {/* Select All - Mobile */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={todosContratosSelecionados}
                  onCheckedChange={(checked) =>
                    selecionarTodosContratos(checked as boolean)
                  }
                  className={
                    algunsContratosSelecionados
                      ? 'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground'
                      : ''
                  }
                />
                <span className="text-sm">Selecionar todos</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="bg-background/50 mx-4 mb-6 overflow-hidden rounded-lg border sm:mx-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={todosContratosSelecionados}
                        onCheckedChange={(checked) =>
                          selecionarTodosContratos(checked as boolean)
                        }
                        className={
                          algunsContratosSelecionados
                            ? 'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground'
                            : ''
                        }
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Contrato</TableHead>
                    <TableHead className="font-semibold">Contratada</TableHead>
                    <TableHead className="font-semibold">Valor</TableHead>
                    <TableHead className="font-semibold">
                      Data Inicial
                    </TableHead>
                    <TableHead className="font-semibold">Data Final</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {contratosPaginados.map((contrato, index) => (
                      <motion.tr
                        key={contrato.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={contratosSelecionados.includes(
                              contrato.id,
                            )}
                            onCheckedChange={(checked) =>
                              selecionarContrato(
                                contrato.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {contrato.numeroContrato}
                            </div>
                            {contrato.numeroCCon && (
                              <div className="text-muted-foreground text-xs">
                                CCon: {contrato.numeroCCon}
                              </div>
                            )}
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                              {contrato.objeto}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="line-clamp-1 text-sm font-medium">
                              {contrato.contratada.razaoSocial}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {formatarCNPJ(contrato.contratada.cnpj)}
                            </div>
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                              {contrato.unidade}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">
                            {formatarMoeda(contrato.valor)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatarData(contrato.dataInicial)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatarData(contrato.dataFinal)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contrato.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisualizarContrato(contrato)}
                              className="hover:bg-muted h-8 w-8 p-0"
                              title="Visualizar contrato"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarContrato(contrato)}
                              className="hover:bg-muted h-8 w-8 p-0"
                              title="Editar contrato"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-muted h-8 w-8 p-0"
                                  title="Mais opções"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleVisualizarContrato(contrato)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditarContrato(contrato)}
                                >
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

          {/* Mobile Cards */}
          <div className="px-4 sm:px-6 lg:hidden">
            <AnimatePresence>
              {contratosPaginados.map((contrato, index) => (
                <MobileContractCard
                  key={contrato.id}
                  contrato={contrato}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Paginação Responsiva */}
          <div className="flex flex-col items-center justify-between gap-4 px-4 pb-6 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-sm sm:text-left">
              Mostrando {inicio + 1} a {Math.min(fim, paginacao.total)} de{' '}
              {paginacao.total} contratos
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={paginaAnterior}
                disabled={paginacao.pagina === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        paginacao.pagina === pageNum ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setPaginacao({ ...paginacao, pagina: pageNum })
                      }
                      className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPaginas > 3 && (
                  <>
                    <span className="text-muted-foreground px-2">...</span>
                    <Button
                      variant={
                        paginacao.pagina === totalPaginas
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setPaginacao({ ...paginacao, pagina: totalPaginas })
                      }
                      className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                      {totalPaginas}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={proximaPagina}
                disabled={paginacao.pagina === totalPaginas}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
