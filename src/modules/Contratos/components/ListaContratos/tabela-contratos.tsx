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
  Calendar,
  Building,
  DollarSign,
} from 'lucide-react'
import type { Contrato, PaginacaoParams } from '@/modules/Contratos/types/contrato'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

interface TabelaContratosProps {
  contratos: Contrato[]
  isLoading: boolean
  paginacao: PaginacaoParams
  contratosSelecionados: string[]
  onPaginacaoChange: (paginacao: PaginacaoParams) => void
  onSelecionarContrato: (contratoId: string, selecionado: boolean) => void
  onSelecionarTodos: (contratoIds: string[], selecionado: boolean) => void
  totalContratos: number
  isPlaceholderData?: boolean
}

export function TabelaContratos({
  contratos,
  isLoading,
  paginacao,
  contratosSelecionados,
  onPaginacaoChange,
  onSelecionarContrato,
  onSelecionarTodos,
  totalContratos,
}: TabelaContratosProps) {

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


  // Paginação - contratos já vêm paginados da API
  const inicio = (paginacao.pagina - 1) * paginacao.itensPorPagina
  const fim = inicio + paginacao.itensPorPagina
  
  const totalPaginas = Math.ceil(totalContratos / paginacao.itensPorPagina)

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

  const todosContratosSelecionados =
    contratos.length > 0 &&
    contratos.every((c) => contratosSelecionados.includes(c.id))
  const algunsContratosSelecionados =
    contratosSelecionados.length > 0 && !todosContratosSelecionados
    
  const handleSelecionarTodos = (checked: boolean) => {
    const contratoIds = contratos.map(c => c.id)
    onSelecionarTodos(contratoIds, checked)
  }

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
                  onSelecionarContrato(contrato.id, checked as boolean)
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
            {getStatusBadge(contrato.status || 'indefinido')}
          </div>

          <div className="space-y-3">
            <div>
              <p className="line-clamp-1 text-sm font-medium">
                {contrato.contratada?.razaoSocial || 'N/A'}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatarCNPJ(contrato.contratada?.cnpj || '')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="text-muted-foreground h-3 w-3" />
                <span className="font-semibold">
                  {formatarMoeda(contrato.valor || 0)}
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
                {formatarData(contrato.dataInicial || '')} -{' '}
                {formatarData(contrato.dataFinal || '')}
              </span>
            </div>

            <p className="text-muted-foreground line-clamp-2 text-xs">
              {contrato.objeto}
            </p>

            <div className="flex items-center justify-end border-t pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleVisualizarContrato(contrato)}
                className="h-8 px-3 shadow-sm"
                title="Abrir contrato"
              >
                <Eye className="mr-1 h-4 w-4" />
                Abrir
              </Button>
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
                {totalContratos} contratos encontrados
              </p>
            </div>

            {/* Select All - Mobile */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={todosContratosSelecionados}
                  onCheckedChange={handleSelecionarTodos}
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
                        onCheckedChange={handleSelecionarTodos}
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
                    {isLoading ? (
                      // Skeleton loader
                      Array.from({ length: paginacao.itensPorPagina }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      contratos.map((contrato, index) => (
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
                              onSelecionarContrato(
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
                              {contrato.contratada?.razaoSocial || 'N/A'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {formatarCNPJ(contrato.contratada?.cnpj || '')}
                            </div>
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                              {contrato.unidade}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">
                            {formatarMoeda(contrato.valor || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatarData(contrato.dataInicial || '')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatarData(contrato.dataFinal || '')}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contrato.status || 'indefinido')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVisualizarContrato(contrato)}
                              className="h-8 px-3 shadow-sm"
                              title="Abrir contrato"
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Abrir
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="px-4 sm:px-6 lg:hidden">
            <AnimatePresence>
              {isLoading ? (
                // Mobile skeleton loader
                Array.from({ length: paginacao.itensPorPagina }).map((_, index) => (
                  <Card key={`mobile-skeleton-${index}`} className="mb-4">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="grid grid-cols-2 gap-3">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                contratos.map((contrato, index) => (
                  <MobileContractCard
                    key={contrato.id}
                    contrato={contrato}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Paginação Responsiva */}
          <div className="flex flex-col items-center justify-between gap-4 px-4 pb-6 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-sm sm:text-left">
              Mostrando {inicio + 1} a {Math.min(fim, totalContratos)} de{' '}
              {totalContratos} contratos
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
                        onPaginacaoChange({ ...paginacao, pagina: pageNum })
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
                        onPaginacaoChange({ ...paginacao, pagina: totalPaginas })
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
