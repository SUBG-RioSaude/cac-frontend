import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useCallback } from 'react'
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
  FileText,
  Briefcase,
  Archive,
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

  const formatarMoeda = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    return (valor: number) => formatter.format(valor)
  }, [])

  const formatarData = useCallback((data: string) => {
    if (!data) return 'N/A'
    try {
      const date = new Date(data)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('pt-BR')
    } catch (error) {
      return 'N/A'
    }
  }, [])

  const obterProcessoPriorizado = useCallback((contrato: Contrato) => {
    if (contrato.processoRio) return contrato.processoRio
    if (contrato.processoSei) return contrato.processoSei
    if (contrato.processoLegado) return contrato.processoLegado
    return 'N/A'
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      'ativo': {
        variant: 'default' as const,
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
      },
      'vencendo': {
        variant: 'secondary' as const,
        label: 'Vencendo',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
      },
      'vencido': {
        variant: 'destructive' as const,
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
      },
      'suspenso': {
        variant: 'outline' as const,
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
      },
      'encerrado': {
        variant: 'outline' as const,
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
      },
    }

    const normalizedStatus = status?.toLowerCase() || 'ativo'
    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const handleVisualizarContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}`)
  }

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
    const contratoIds = contratos.map((c) => c.id)
    onSelecionarTodos(contratoIds, checked)
  }

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )

  const MobileContractCard = ({ contrato, index }: { contrato: Contrato, index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={contratosSelecionados.includes(contrato.id)}
              onCheckedChange={(checked) =>
                onSelecionarContrato(contrato.id, checked as boolean)
              }
            />
            <div>
              <h3 className="font-bold text-primary">{contrato.numeroContrato}</h3>
              <p className="text-xs text-muted-foreground">{obterProcessoPriorizado(contrato)}</p>
            </div>
          </div>
          {getStatusBadge(contrato.status || 'indefinido')}
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="font-semibold text-lg">{contrato.empresaRazaoSocial || contrato.contratada?.razaoSocial || 'Empresa não informada'}</p>
            <p className="text-sm text-muted-foreground">CNPJ: {contrato.empresaCnpj || contrato.contratada?.cnpj || 'N/A'}</p>
            <p className="text-sm text-muted-foreground truncate" title={contrato.descricaoObjeto || ''}>
              {contrato.descricaoObjeto || 'Objeto não informado'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem icon={DollarSign} label="Valor Global" value={formatarMoeda(contrato.valorGlobal)} />
            <InfoItem icon={Calendar} label="Vigência" value={`${formatarData(contrato.vigenciaInicial)} - ${formatarData(contrato.vigenciaFinal)}`} />
            <InfoItem icon={Briefcase} label="Contratação" value={contrato.contratacao || 'N/A'} />
            <InfoItem icon={Building} label="Unidade Gestora" value={contrato.unidadeGestoraNomeCompleto || contrato.unidadeGestora || 'N/A'} />
            <InfoItem icon={FileText} label="Processo" value={obterProcessoPriorizado(contrato)} />
            <InfoItem icon={Archive} label="Vínculo PCA" value={contrato.vinculacaoPCA || 'N/A'} />
          </div>
          <div className="flex items-center justify-end border-t pt-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleVisualizarContrato(contrato)}
              className="h-9 px-4 shadow-sm"
              title="Abrir contrato"
            >
              <Eye className="mr-2 h-4 w-4" />
              Detalhes
            </Button>
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
      <Card className="border-0 bg-card/50 shadow-2xl backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-lg font-semibold sm:text-xl">
                Lista de Contratos
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalContratos} contratos encontrados
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table (Large screens) */}
          <div className="hidden xl:block">
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
                    <TableHead className="font-semibold">Tipo Contratação</TableHead>
                    <TableHead className="font-semibold">Unidade Gestora</TableHead>
                    <TableHead className="font-semibold">Período de Vigência</TableHead>
                    <TableHead className="font-semibold text-right">Valor Global</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      Array.from({ length: paginacao.itensPorPagina }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-12" /></TableCell>
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
                              checked={contratosSelecionados.includes(contrato.id)}
                              onCheckedChange={(checked) =>
                                onSelecionarContrato(contrato.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-primary">{contrato.numeroContrato || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{obterProcessoPriorizado(contrato)}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-48" title={contrato.descricaoObjeto || ''}>
                              {contrato.descricaoObjeto || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{contrato.empresaRazaoSocial || contrato.contratada?.razaoSocial || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              CNPJ: {contrato.empresaCnpj || contrato.contratada?.cnpj || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{contrato.contratacao || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{contrato.unidadeGestoraNomeCompleto || contrato.unidadeGestora || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div>{formatarData(contrato.vigenciaInicial)}</div>
                            <div>{formatarData(contrato.vigenciaFinal)}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatarMoeda(contrato.valorGlobal)}</TableCell>
                          <TableCell>{getStatusBadge(contrato.status || 'indefinido')}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVisualizarContrato(contrato)}
                              className="h-8 px-3 shadow-sm"
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Abrir
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Tablet Table (Medium to Large screens) */}
          <div className="hidden lg:block xl:hidden">
            <div className="mx-4 mb-6 overflow-x-auto rounded-lg border bg-background/50 sm:mx-6">
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
                    <TableHead className="font-semibold">Contratação</TableHead>
                    <TableHead className="font-semibold">Vigência</TableHead>
                    <TableHead className="font-semibold text-right">Valor</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      Array.from({ length: paginacao.itensPorPagina }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      contratos.map((contrato, index) => (
                        <motion.tr
                          key={contrato.id}
                          className="group border-b transition-colors hover:bg-muted/50"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          layout
                        >
                          <TableCell>
                            <Checkbox
                              checked={contratosSelecionados.includes(contrato.id)}
                              onCheckedChange={(checked) =>
                                onSelecionarContrato(contrato.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{contrato.numeroContrato || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-32">{contrato.descricaoObjeto || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium truncate max-w-36">{contrato.empresaRazaoSocial || contrato.contratada?.razaoSocial || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">CNPJ: {contrato.empresaCnpj || contrato.contratada?.cnpj || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{contrato.contratacao || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatarData(contrato.vigenciaInicial)}</div>
                            <div className="text-sm">{formatarData(contrato.vigenciaFinal)}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatarMoeda(contrato.valorGlobal)}</TableCell>
                          <TableCell>{getStatusBadge(contrato.status || 'ativo')}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVisualizarContrato(contrato)}
                              className="h-8 px-3 shadow-sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
          <div className="flex flex-col items-center justify-between gap-4 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:px-6">
            <div className="text-center text-sm text-muted-foreground sm:text-left">
              <span className="font-medium">{totalContratos}</span> contratos encontrados
              <span className="hidden sm:inline">
                {' '}• Página {paginacao.pagina} de {totalPaginas}
              </span>
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

              <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <span className="text-sm font-medium">
                  Página {paginacao.pagina} de {totalPaginas}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.min(inicio + 1, totalContratos)}-{Math.min(fim, totalContratos)} de {totalContratos})
                </span>
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
