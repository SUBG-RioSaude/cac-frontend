import { motion } from 'framer-motion'
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
import { UnidadeStatusBadge } from '@/components/ui/status-badge'
import { parseStatusUnidade } from '@/types/status'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react'
import type {
  Unidade,
  PaginacaoParamsUnidade,
  OrdenacaoParams,
  ColunaOrdenacao,
} from '@/modules/Unidades/ListaUnidades/types/unidade'
import { currencyUtils } from '@/lib/utils'

interface TabelaUnidadesProps {
  unidades: Unidade[]
  unidadesSelecionadas: (string | number)[]
  onUnidadesSelecionadasChange: (selecionadas: (string | number)[]) => void
  paginacao: PaginacaoParamsUnidade
  onPaginacaoChange: (paginacao: PaginacaoParamsUnidade) => void
  onVisualizarUnidade: (unidade: Unidade) => void
  ordenacao: OrdenacaoParams
  onOrdenacao: (coluna: ColunaOrdenacao) => void
  // Optional mutation handlers
  onEditarUnidade?: (unidade: Unidade) => void
  onExcluirUnidade?: (unidade: Unidade) => void
  isLoading?: boolean
}

export function TabelaUnidades({
  unidades,
  unidadesSelecionadas,
  onUnidadesSelecionadasChange,
  paginacao,
  onPaginacaoChange,
  onVisualizarUnidade,
  ordenacao,
  onOrdenacao,
  onEditarUnidade,
  onExcluirUnidade,
  isLoading = false,
}: TabelaUnidadesProps) {
  // Supress unused variables warnings for future implementation
  void onEditarUnidade
  void onExcluirUnidade
  void isLoading
  const getIconeOrdenacao = (coluna: ColunaOrdenacao) => {
    if (ordenacao.coluna !== coluna) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return ordenacao.direcao === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }


  const handleSelecionarUnidade = (id: string | number, selecionado: boolean) => {
    if (selecionado) {
      onUnidadesSelecionadasChange([...unidadesSelecionadas, id])
    } else {
      onUnidadesSelecionadasChange(
        unidadesSelecionadas.filter((unidadeId) => unidadeId !== id),
      )
    }
  }

  const handleSelecionarTodas = (selecionadas: boolean) => {
    if (selecionadas) {
      const unidadesPaginadas = unidades.slice(
        (paginacao.pagina - 1) * paginacao.itensPorPagina,
        paginacao.pagina * paginacao.itensPorPagina,
      )
      onUnidadesSelecionadasChange(unidadesPaginadas.map((u) => u.id))
    } else {
      onUnidadesSelecionadasChange([])
    }
  }

  const handleVisualizarUnidade = (unidade: Unidade) => {
    console.log('[DEBUG] Navegando para unidade:', unidade)
    console.log('[DEBUG] ID da unidade:', unidade.id, 'tipo:', typeof unidade.id)
    onVisualizarUnidade(unidade)
  }

  // Com server-side pagination, os dados já vêm paginados da API
  const unidadesPaginadas = unidades
  const totalPaginas = Math.ceil(paginacao.total / paginacao.itensPorPagina)

  const todasUnidadesSelecionadas =
    unidadesPaginadas.length > 0 &&
    unidadesPaginadas.every((u) => unidadesSelecionadas.includes(u.id))

  const proximaPagina = () => {
    if (paginacao.pagina < totalPaginas) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina + 1,
      })
    }
  }

  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina - 1,
      })
    }
  }

  return (
    <motion.div
      animate={{
        opacity: 1,
        filter: isLoading ? 'blur(1px)' : 'blur(0px)'
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur">
        <CardHeader className="px-3 pb-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold sm:text-xl">
                Lista de Unidades
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {isLoading ? 'Carregando...' : `${paginacao.total} unidades encontradas`}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-3 mb-3 sm:mx-6 sm:mb-6">
            {/* Versão mobile - Cards */}
            <motion.div
              className="block space-y-3 lg:hidden"
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                staggerChildren: 0.05
              }}
            >
              {unidadesPaginadas.map((unidade, index) => (
                <motion.div
                  key={unidade.id}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: index * 0.02
                  }}
                >
                    <Card
                      className="hover:bg-muted/30 cursor-pointer p-4 transition-all hover:shadow-md"
                      onClick={() => handleVisualizarUnidade(unidade)}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={unidadesSelecionadas.includes(unidade.id)}
                            onCheckedChange={(checked) =>
                              handleSelecionarUnidade(
                                unidade.id,
                                checked as boolean,
                              )
                            }
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {unidade.nome}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {unidade.sigla}
                            </div>
                          </div>
                        </div>
                        <UnidadeStatusBadge status={parseStatusUnidade(unidade.status)} />
                      </div>

                      <div className="mb-3 space-y-2">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Contratos Ativos
                          </p>
                          <p className="text-sm font-medium">
                            {unidade.contratosAtivos || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Valor Total Contratado
                          </p>
                          <p className="text-sm font-medium">
                            {currencyUtils.formatar(
                              unidade.valorTotalContratado || 0,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleVisualizarUnidade(unidade)}
                          className="h-9 px-4 shadow-sm"
                          title="Abrir unidade"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>

            {/* Versão desktop - Tabela */}
            <div className="bg-background/50 hidden overflow-hidden rounded-lg border lg:block">
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
                      className="hover:bg-muted/50 cursor-pointer font-semibold transition-colors w-[350px] min-w-[300px]"
                      onClick={() => onOrdenacao('nome')}
                    >
                      <div className="flex items-center gap-2">
                        Nome
                        {getIconeOrdenacao('nome')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hover:bg-muted/50 cursor-pointer font-semibold transition-colors w-[180px]"
                      onClick={() => onOrdenacao('sigla')}
                    >
                      <div className="flex items-center gap-2">
                        Sigla
                        {getIconeOrdenacao('sigla')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hover:bg-muted/50 cursor-pointer font-semibold transition-colors w-[120px]"
                      onClick={() => onOrdenacao('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getIconeOrdenacao('status')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hover:bg-muted/50 cursor-pointer font-semibold transition-colors w-[120px]"
                      onClick={() => onOrdenacao('contratosAtivos')}
                    >
                      <div className="flex items-center gap-2">
                        Contratos
                        {getIconeOrdenacao('contratosAtivos')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hover:bg-muted/50 cursor-pointer font-semibold transition-colors w-[150px]"
                      onClick={() => onOrdenacao('valorTotalContratado')}
                    >
                      <div className="flex items-center gap-2">
                        Valor Total
                        {getIconeOrdenacao('valorTotalContratado')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unidadesPaginadas.map((unidade, index) => (
                    <motion.tr
                      key={unidade.id}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: index * 0.03
                      }}
                      className="group hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleVisualizarUnidade(unidade)}
                    >
                        <TableCell>
                          <Checkbox
                            checked={unidadesSelecionadas.includes(unidade.id)}
                            onCheckedChange={(checked) =>
                              handleSelecionarUnidade(
                                unidade.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-[350px] min-w-[300px]">
                          <div className="text-sm font-medium leading-relaxed" data-testid={`unidade-nome-${unidade.id}`}>
                            {unidade.nome}
                          </div>
                        </TableCell>
                        <TableCell className="w-[180px]">
                          <div className="font-mono text-sm">
                            {unidade.sigla}
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]"><UnidadeStatusBadge status={parseStatusUnidade(unidade.status)} /></TableCell>
                        <TableCell className="w-[120px]">
                          <div className="text-center text-sm font-medium">
                            {unidade.contratosAtivos || 0}
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <div className="text-right text-sm font-medium">
                            {currencyUtils.formatar(
                              unidade.valorTotalContratado || 0,
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleVisualizarUnidade(unidade)}
                            className="h-8 px-3 shadow-sm"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Abrir
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
            <div className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
              Mostrando {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1}{' '}
              a{' '}
              {Math.min(
                paginacao.pagina * paginacao.itensPorPagina,
                paginacao.total,
              )}{' '}
              de {paginacao.total} unidades
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={paginaAnterior}
                disabled={paginacao.pagina <= 1 || isLoading}
                className="flex items-center gap-2 bg-transparent text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="xs:inline hidden">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {/* Renderizar páginas de forma inteligente */}
                {(() => {
                  const maxVisiblePages = 5
                  const currentPage = paginacao.pagina
                  const totalPages = totalPaginas

                  if (totalPages <= maxVisiblePages) {
                    // Se há poucas páginas, mostra todas
                    return Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          disabled={isLoading}
                          onClick={() => {
                            const novaPaginacao = { ...paginacao, pagina: pageNum }
                            onPaginacaoChange(novaPaginacao)
                          }}
                          className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                        >
                          {pageNum}
                        </Button>
                      )
                    })
                  } else {
                    // Lógica mais avançada para muitas páginas
                    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                      const pageNum = startPage + i
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          disabled={isLoading}
                          onClick={() => {
                            const novaPaginacao = { ...paginacao, pagina: pageNum }
                            onPaginacaoChange(novaPaginacao)
                          }}
                          className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                        >
                          {pageNum}
                        </Button>
                      )
                    })
                  }
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={proximaPagina}
                disabled={paginacao.pagina >= totalPaginas || totalPaginas === 0 || isLoading}
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
