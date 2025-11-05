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
  X,
} from 'lucide-react'
import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CNPJDisplay } from '@/components/ui/formatters'
import { Skeleton } from '@/components/ui/skeleton'
import { ContratoStatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStatusConfig } from '@/hooks/use-status-config'
import { cnpjUtils } from '@/lib/utils'
import type {
  Contrato,
  FiltrosContrato,
  PaginacaoParams,
} from '@/modules/Contratos/types/contrato'

import { ModalUnidadesResponsaveis } from './modal-unidades-responsaveis'
import { VigenciaDisplay } from './vigencia-display'

export type FiltroBadgeType =
  | 'valorMinimo'
  | 'valorMaximo'
  | 'status'
  | 'vigencia'
  | 'unidades'

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
  hideContratadaColumn?: boolean
  filtros?: FiltrosContrato
  unidadesDisponiveis?: { id: string; nome: string }[]
  onLimparFiltro?: (tipoFiltro: FiltroBadgeType) => void
}

export const TabelaContratos = ({
  contratos,
  isLoading,
  paginacao,
  contratosSelecionados,
  onPaginacaoChange,
  onSelecionarContrato,
  onSelecionarTodos,
  totalContratos,
  hideContratadaColumn = false,
  filtros = {},
  unidadesDisponiveis = [],
  onLimparFiltro,
}: TabelaContratosProps) => {
  const navigate = useNavigate()
  const { getContratoStatusFromVigencia } = useStatusConfig()

  // Estado para modal de unidades
  const [modalUnidadesAberto, setModalUnidadesAberto] = useState(false)
  const [contratoSelecionado, setContratoSelecionado] =
    useState<Contrato | null>(null)

  const formatarMoeda = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    return (valor: number) => formatter.format(valor)
  }, [])

  const obterProcessoPriorizado = useCallback((contrato: Contrato) => {
    if (contrato.processoRio) return contrato.processoRio
    if (contrato.processoSei) return contrato.processoSei
    if (contrato.processoLegado) return contrato.processoLegado
    return 'N/A'
  }, [])

  // Formatar data para exibição
  const formatarData = useCallback((dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  // Gerar badges de filtros ativos
  const filtrosAtivos = useMemo(() => {
    const badges: {
      label: string
      isValor: boolean
      tipo: FiltroBadgeType
    }[] = []

    // Filtro de valor (verde)
    if (filtros.valorMinimo !== undefined && filtros.valorMinimo > 0) {
      badges.push({
        label: `Valor mín: ${formatarMoeda(filtros.valorMinimo)}`,
        isValor: true,
        tipo: 'valorMinimo',
      })
    }
    if (filtros.valorMaximo !== undefined && filtros.valorMaximo > 0) {
      badges.push({
        label: `Valor máx: ${formatarMoeda(filtros.valorMaximo)}`,
        isValor: true,
        tipo: 'valorMaximo',
      })
    }

    // Filtro de status (azul) - mostrar nomes reais
    if (filtros.status && filtros.status.length > 0) {
      const statusTexto = filtros.status.join(', ')
      badges.push({
        label: `Status: ${statusTexto}`,
        isValor: false,
        tipo: 'status',
      })
    }

    // Filtro de período de vigência (azul) - mostrar datas
    if (filtros.dataInicialDe || filtros.dataFinalAte) {
      let labelVigencia = 'Vigência: '
      if (filtros.dataInicialDe && filtros.dataFinalAte) {
        labelVigencia += `${formatarData(filtros.dataInicialDe)} até ${formatarData(filtros.dataFinalAte)}`
      } else if (filtros.dataInicialDe) {
        labelVigencia += `a partir de ${formatarData(filtros.dataInicialDe)}`
      } else if (filtros.dataFinalAte) {
        labelVigencia += `até ${formatarData(filtros.dataFinalAte)}`
      }
      badges.push({
        label: labelVigencia,
        isValor: false,
        tipo: 'vigencia',
      })
    }

    // Filtro de unidade (azul) - mostrar nomes das unidades
    if (filtros.unidade && filtros.unidade.length > 0) {
      const nomesUnidades = filtros.unidade
        .map((unidadeId) => {
          const unidade = unidadesDisponiveis.find((u) => u.id === unidadeId)
          return unidade?.nome ?? unidadeId
        })
        .join(', ')

      badges.push({
        label: `Unidades: ${nomesUnidades}`,
        isValor: false,
        tipo: 'unidades',
      })
    }

    return badges
  }, [filtros, formatarMoeda, formatarData, unidadesDisponiveis])

  const handleVisualizarContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}`)
  }

  const handleMostrarUnidades = (contrato: Contrato) => {
    setContratoSelecionado(contrato)
    setModalUnidadesAberto(true)
  }

  const handleFecharModalUnidades = () => {
    setModalUnidadesAberto(false)
    setContratoSelecionado(null)
  }

  const obterTotalUnidades = (contrato: Contrato) => {
    if (!contrato.unidadesResponsaveis) return 0
    return contrato.unidadesResponsaveis.filter((u) => u.ativo).length
  }

  const tableSkeletonRowIds = useMemo(
    () =>
      Array.from(
        { length: paginacao.itensPorPagina },
        (_, index) => `table-skeleton-${index}`,
      ),
    [paginacao.itensPorPagina],
  )

  const mobileSkeletonCardIds = useMemo(
    () =>
      Array.from(
        { length: paginacao.itensPorPagina },
        (_, index) => `mobile-skeleton-${index}`,
      ),
    [paginacao.itensPorPagina],
  )

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

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType
    label: string
    value: React.ReactNode
  }) => (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
      <span className="font-semibold">{label}:</span>
      <span className="text-muted-foreground truncate">{value}</span>
    </div>
  )

  const MobileContractCard = ({
    contrato,
  }: {
    contrato: Contrato
  }) => (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="bg-muted/30 flex flex-row items-start justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={contratosSelecionados.includes(contrato.id)}
              onCheckedChange={(checked) =>
                onSelecionarContrato(contrato.id, checked as boolean)
              }
            />
            <div>
              <h3 className="text-primary font-bold">
                {contrato.numeroContrato}
              </h3>
              <p className="text-muted-foreground text-xs">
                {obterProcessoPriorizado(contrato)}
              </p>
            </div>
          </div>
          <ContratoStatusBadge
            status={getContratoStatusFromVigencia(
              contrato.vigenciaInicial,
              contrato.vigenciaFinal,
              contrato.status,
            )}
          />
        </CardHeader>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="space-y-2">
            {!hideContratadaColumn && (
              <>
                <p
                  className="truncate text-base font-semibold sm:text-lg"
                  title={
                    contrato.empresaRazaoSocial ??
                    contrato.contratada?.razaoSocial ??
                    'Empresa não informada'
                  }
                >
                  {contrato.empresaRazaoSocial ??
                    contrato.contratada?.razaoSocial ??
                    'Empresa não informada'}
                </p>
                <p className="text-muted-foreground text-sm">
                  CNPJ:{' '}
                  <CNPJDisplay
                    value={contrato.empresaCnpj ?? contrato.contratada?.cnpj}
                    fallback="N/A"
                  />
                </p>
              </>
            )}
            <p
              className="text-muted-foreground truncate text-sm"
              title={contrato.descricaoObjeto ?? ''}
            >
              {contrato.descricaoObjeto ?? 'Objeto não informado'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            <InfoItem
              icon={DollarSign}
              label="Valor Global"
              value={formatarMoeda(contrato.valorGlobal)}
            />
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
                <Calendar className="h-3 w-3" />
                Vigência
              </p>
              <VigenciaDisplay
                vigenciaInicio={contrato.vigenciaInicial}
                vigenciaFim={contrato.vigenciaFinal}
                compact
              />
            </div>
            <InfoItem
              icon={Briefcase}
              label="Contratação"
              value={contrato.contratacao ?? 'N/A'}
            />
            <div className="flex items-center gap-2 text-sm">
              <Building className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="font-semibold">Unidades:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMostrarUnidades(contrato)}
                className="ml-auto h-auto border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50"
                disabled={obterTotalUnidades(contrato) === 0}
              >
                {obterTotalUnidades(contrato) === 0 ? (
                  <span>Nenhuma</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Ver ({obterTotalUnidades(contrato)})
                  </span>
                )}
              </Button>
            </div>
            <InfoItem
              icon={FileText}
              label="Processo"
              value={obterProcessoPriorizado(contrato)}
            />
            <InfoItem
              icon={Archive}
              label="Vínculo PCA"
              value={contrato.vinculacaoPCA ?? 'N/A'}
            />
          </div>
          <div className="flex items-center justify-end border-t pt-4">
            <Button
              variant="outline-premium"
              size="sm"
              onClick={() => handleVisualizarContrato(contrato)}
              className="h-9 px-4"
              title="Abrir contrato"
            >
              <Eye className="mr-2 h-4 w-4" />
              Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
  )

  return (
    <div className="animate-in fade-in-0 duration-200">
      <Card className="bg-card/50 border-0 shadow-2xl backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg font-semibold sm:text-xl">
                  Lista de Contratos
                </CardTitle>
                {/* Badges de filtros ativos */}
                {filtrosAtivos.map((filtro, index) => (
                  <Badge
                    key={index}
                    variant={filtro.isValor ? 'success' : 'info'}
                    className="flex items-center gap-1.5 pr-1.5 text-xs font-medium shadow-sm"
                  >
                    <span>{filtro.label}</span>
                    {onLimparFiltro && (
                      <button
                        type="button"
                        onClick={() => onLimparFiltro(filtro.tipo)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Remover filtro ${filtro.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {totalContratos} contratos encontrados
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Paginação Superior */}
        {/*<div className="bg-muted/20 flex flex-col items-center justify-between gap-4 border-y px-4 py-3 sm:flex-row sm:px-6">
          <div className="text-muted-foreground text-center text-sm sm:text-left">
            <span className="font-medium">{totalContratos}</span> contratos
            encontrados
            <span className="hidden sm:inline">
              {' '}
              • Página {paginacao.pagina} de {totalPaginas}
            </span>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
              <span className="text-sm font-medium">
                Página {paginacao.pagina} de {totalPaginas}
              </span>
              <span className="text-muted-foreground text-xs">
                ({Math.min(inicio + 1, totalContratos)}-
                {Math.min(fim, totalContratos)} de {totalContratos})
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
        </div>*/}

        <CardContent className="px-4 py-0 sm:px-6">
          {/* Desktop Table (Large screens) */}
          <div className="hidden xl:block">
            <div className="bg-background/50 scrollbar-hide mb-6 overflow-x-auto scroll-smooth rounded-lg border">
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
                    {!hideContratadaColumn && (
                      <TableHead className="font-semibold">
                        Contratada
                      </TableHead>
                    )}
                    <TableHead className="font-semibold">
                      Tipo Contratação
                    </TableHead>
                    <TableHead className="font-semibold">Unidades</TableHead>
                    <TableHead className="font-semibold">
                      Período de Vigência
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Valor Global
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  key={`page-${paginacao.pagina}`}
                  className="animate-in fade-in-0 zoom-in-[0.98] duration-300"
                >
                  {isLoading
                    ? tableSkeletonRowIds.map((skeletonId) => (
                        <TableRow key={skeletonId}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          {!hideContratadaColumn && (
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                          )}
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="ml-auto h-8 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    : contratos.map((contrato) => (
                        <TableRow
                          key={contrato.id}
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
                              <div className="text-primary font-medium">
                                {contrato.numeroContrato ?? 'N/A'}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {obterProcessoPriorizado(contrato)}
                              </div>
                              <div
                                className="text-muted-foreground max-w-48 truncate text-xs"
                                title={contrato.descricaoObjeto ?? ''}
                              >
                                {contrato.descricaoObjeto ?? 'N/A'}
                              </div>
                            </TableCell>
                            {!hideContratadaColumn && (
                              <TableCell>
                                <div className="font-medium">
                                  {contrato.empresaRazaoSocial ??
                                    contrato.contratada?.razaoSocial ??
                                    'N/A'}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {(() => {
                                    const rawCnpj =
                                      contrato.empresaCnpj ??
                                      contrato.contratada?.cnpj
                                    const cnpjTexto = rawCnpj
                                      ? cnpjUtils.formatar(rawCnpj)
                                      : 'N/A'
                                    return `CNPJ: ${cnpjTexto}`
                                  })()}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="font-medium">
                                {contrato.contratacao ?? 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMostrarUnidades(contrato)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-60"
                                disabled={obterTotalUnidades(contrato) === 0}
                              >
                                {obterTotalUnidades(contrato) === 0 ? (
                                  <span className="text-muted-foreground">
                                    Nenhuma unidade
                                  </span>
                                ) : (
                                  <>
                                    <Building className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-800">
                                      Mostrar
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                      {obterTotalUnidades(contrato)}
                                    </span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <VigenciaDisplay
                                vigenciaInicio={contrato.vigenciaInicial}
                                vigenciaFim={contrato.vigenciaFinal}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                              {formatarMoeda(contrato.valorGlobal)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <ContratoStatusBadge
                                status={getContratoStatusFromVigencia(
                                  contrato.vigenciaInicial,
                                  contrato.vigenciaFinal,
                                  contrato.status,
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button
                                variant="outline-premium"
                                onClick={() =>
                                  handleVisualizarContrato(contrato)
                                }
                                className="h-8 px-3"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Abrir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Tablet Table (Medium to Large screens) */}
          <div className="hidden lg:block xl:hidden">
            <div className="bg-background/50 scrollbar-hide mb-6 overflow-x-auto scroll-smooth rounded-lg border">
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
                    {!hideContratadaColumn && (
                      <TableHead className="font-semibold">
                        Contratada
                      </TableHead>
                    )}
                    <TableHead className="font-semibold">Contratação</TableHead>
                    <TableHead className="font-semibold">Unidades</TableHead>
                    <TableHead className="font-semibold">Vigência</TableHead>
                    <TableHead className="text-right font-semibold">
                      Valor
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  key={`page-${paginacao.pagina}`}
                  className="animate-in fade-in-0 zoom-in-[0.98] duration-300"
                >
                  {isLoading
                    ? tableSkeletonRowIds.map((skeletonId) => (
                        <TableRow key={skeletonId}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          {!hideContratadaColumn && (
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                          )}
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="ml-auto h-8 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    : contratos.map((contrato) => (
                        <TableRow
                          key={contrato.id}
                          className="group hover:bg-muted/50 border-b transition-colors"
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
                              <div className="font-medium">
                                {contrato.numeroContrato ?? 'N/A'}
                              </div>
                              <div className="text-muted-foreground max-w-32 truncate text-xs">
                                {contrato.descricaoObjeto ?? 'N/A'}
                              </div>
                            </TableCell>
                            {!hideContratadaColumn && (
                              <TableCell>
                                <div className="max-w-36 truncate font-medium">
                                  {contrato.empresaRazaoSocial ??
                                    contrato.contratada?.razaoSocial ??
                                    'N/A'}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {(() => {
                                    const rawCnpj =
                                      contrato.empresaCnpj ??
                                      contrato.contratada?.cnpj
                                    const cnpjTexto = rawCnpj
                                      ? cnpjUtils.formatar(rawCnpj)
                                      : 'N/A'
                                    return `CNPJ: ${cnpjTexto}`
                                  })()}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="font-medium">
                                {contrato.contratacao ?? 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMostrarUnidades(contrato)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-60"
                                disabled={obterTotalUnidades(contrato) === 0}
                              >
                                {obterTotalUnidades(contrato) === 0 ? (
                                  <span className="text-muted-foreground text-xs">
                                    Nenhuma unidade
                                  </span>
                                ) : (
                                  <>
                                    <Building className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-800">
                                      Mostrar
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                      {obterTotalUnidades(contrato)}
                                    </span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <VigenciaDisplay
                                vigenciaInicio={contrato.vigenciaInicial}
                                vigenciaFim={contrato.vigenciaFinal}
                                compact
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                              {formatarMoeda(contrato.valorGlobal)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <ContratoStatusBadge
                                status={getContratoStatusFromVigencia(
                                  contrato.vigenciaInicial,
                                  contrato.vigenciaFinal,
                                  contrato.status,
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button
                                variant="outline-premium"
                                size="sm"
                                onClick={() =>
                                  handleVisualizarContrato(contrato)
                                }
                                className="h-8 px-3"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div
            key={`page-${paginacao.pagina}`}
            className="grid grid-cols-1 gap-4 animate-in fade-in-0 zoom-in-[0.98] duration-300 lg:hidden xl:grid-cols-2"
          >
            {isLoading
              ? mobileSkeletonCardIds.map((skeletonId) => (
                  <Card key={skeletonId}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="grid grid-cols-2 gap-3">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="ml-auto h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : contratos.map((contrato) => (
                  <MobileContractCard
                    key={contrato.id}
                    contrato={contrato}
                  />
                ))}
          </div>

          {/* Paginação Responsiva */}
          <div className="bg-muted/20 flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
              Mostrando {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1}{' '}
              a{' '}
              {Math.min(
                paginacao.pagina * paginacao.itensPorPagina,
                totalContratos,
              )}{' '}
              de {totalContratos} contratos
            </div>

            <div className="flex items-center gap-3">
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

              <span className="text-sm font-medium">
                Página {paginacao.pagina} de {totalPaginas}
              </span>

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

      {/* Modal de Unidades Responsáveis */}
      <ModalUnidadesResponsaveis
        isOpen={modalUnidadesAberto}
        onClose={handleFecharModalUnidades}
        unidades={contratoSelecionado?.unidadesResponsaveis ?? []}
        numeroContrato={contratoSelecionado?.numeroContrato ?? 'N/A'}
      />
    </div>
  )
}
