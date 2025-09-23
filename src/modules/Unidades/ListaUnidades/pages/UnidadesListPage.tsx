import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FileDown } from 'lucide-react'
import { SearchAndFiltersUnidades } from '@/modules/Unidades/ListaUnidades/components/search-and-filters-unidades'
import { TabelaUnidades } from '@/modules/Unidades/ListaUnidades/components/tabela-unidades'
import { UnidadesPageSkeleton } from '@/modules/Unidades/ListaUnidades/components/skeletons/unidades-page-skeleton'
import { useUnidades } from '@/modules/Unidades/hooks/use-unidades'
import {
  useUpdateUnidade,
  useDeleteUnidade,
} from '@/modules/Unidades/hooks/use-unidades-mutations'
import { mapearUnidadeApi } from '@/modules/Unidades/types/unidade-api'
import type {
  Unidade,
  OrdenacaoParams,
  ColunaOrdenacao,
} from '@/modules/Unidades/ListaUnidades/types/unidade'
import type { FiltrosUnidadesApi } from '@/modules/Unidades/types/unidade-api'

const UnidadesListPage = () => {
  const navigate = useNavigate()
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<
    (string | number)[]
  >([])
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParams>({
    coluna: 'nome',
    direcao: 'asc',
  })
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    itensPorPagina: 10,
    total: 0,
  })

  // Estado único para todos os filtros (incluindo pesquisa)
  const [filtrosApi, setFiltrosApi] = useState<FiltrosUnidadesApi>({
    pagina: 1,
    tamanhoPagina: 10,
    ordenarPor: 'nome',
    direcaoOrdenacao: 'asc',
    ativo: true, // Por padrão busca apenas ativas
  })

  // Fetch data with React Query
  const {
    data: responseData,
    isLoading,
    error,
  } = useUnidades(filtrosApi, {
    keepPreviousData: true,
    refetchOnMount: false,
  })

  // Mutation hooks
  const updateUnidadeMutation = useUpdateUnidade()
  const deleteUnidadeMutation = useDeleteUnidade()

  // Map API data to local format - agora usa server-side filtering
  const unidadesFiltradas = useMemo(() => {
    if (!responseData?.dados) return []
    return responseData.dados.map(mapearUnidadeApi)
  }, [responseData?.dados])

  // Sync pagination and ordering with filtrosApi
  useEffect(() => {
    setFiltrosApi((prev) => ({
      ...prev,
      pagina: paginacao.pagina,
      tamanhoPagina: paginacao.itensPorPagina,
      ordenarPor: ordenacao.coluna,
      direcaoOrdenacao: ordenacao.direcao,
    }))
  }, [paginacao.pagina, paginacao.itensPorPagina, ordenacao])

  // Update pagination when data changes
  useEffect(() => {
    if (responseData) {
      setPaginacao((prev) => ({
        ...prev,
        total: responseData.totalRegistros,
      }))
    }
  }, [responseData])

  const handleVisualizarUnidade = (unidade: Unidade) => {
    navigate(`/unidades/${unidade.id}`)
  }

  const handleEditarUnidade = (unidade: Unidade) => {
    // For now, navigate to edit page (to be implemented)
    navigate(`/unidades/${unidade.id}/editar`)
  }

  const handleExcluirUnidade = async (unidade: Unidade) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a unidade "${unidade.nome}"?`,
      )
    ) {
      try {
        await deleteUnidadeMutation.mutateAsync(unidade.id.toString())
      } catch (error) {
        // Error handling is done in the mutation hook
        console.error('Erro ao excluir unidade:', error)
      }
    }
  }

  const handleOrdenacao = (coluna: ColunaOrdenacao) => {
    setOrdenacao((prev) => ({
      coluna,
      direcao:
        prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleExportarSelecionadas = () => {
    const unidadesParaExportar =
      unidadesSelecionadas.length > 0
        ? unidadesFiltradas.filter((u) => unidadesSelecionadas.includes(u.id))
        : unidadesFiltradas

    const csvContent = [
      ['Nome', 'Sigla', 'UO', 'UG', 'Endereço', 'Status'],
      ...unidadesParaExportar.map((u) => [
        u.nome,
        u.sigla,
        u.UO,
        u.UG,
        u.endereco,
        u.status || 'ativo',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `unidades_${unidadesSelecionadas.length > 0 ? 'selecionadas' : 'todas'}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const textoExportar =
    unidadesSelecionadas.length > 0
      ? `Exportar (${unidadesSelecionadas.length})`
      : 'Exportar Todas'

  // Show loading skeleton while data is loading
  if (isLoading && !responseData) {
    return <UnidadesPageSkeleton />
  }

  // Show error state if needed
  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-center">
          <h2 className="text-destructive text-xl font-bold">
            Erro ao carregar unidades
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="to-muted/20 min-h-screen p-6">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Cabeçalho Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start"
        >
          <div className="text-center sm:text-left">
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Unidades
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base lg:text-lg">
              Gerencie todas as unidades do sistema de forma eficiente
            </p>
          </div>
          <motion.div
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={handleExportarSelecionadas}
              className="h-10 cursor-pointer shadow-sm sm:h-auto"
            >
              <FileDown className="mr-2 h-4 w-4" />
              <span className="sm:hidden">
                {unidadesSelecionadas.length > 0
                  ? `Exportar (${unidadesSelecionadas.length})`
                  : 'Exportar'}
              </span>
              <span className="hidden sm:inline">{textoExportar}</span>
            </Button>
            <Button className="h-10 cursor-pointer shadow-sm sm:h-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:hidden">Nova</span>
              <span className="hidden sm:inline">Nova Unidade</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Search e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchAndFiltersUnidades
            filtrosAtivos={filtrosApi}
            onFiltrosChange={(novosFiltros) => {
              // Resetar para página 1 quando houver mudança de filtros (exceto paginação)
              const jaPossuiPaginacao =
                'pagina' in novosFiltros || 'tamanhoPagina' in novosFiltros

              if (!jaPossuiPaginacao) {
                setPaginacao((prev) => ({ ...prev, pagina: 1 }))
              }

              // Aplicar filtros diretamente preservando paginação e ordenação
              setFiltrosApi((prev) => ({
                ...prev,
                ...novosFiltros,
                pagina: jaPossuiPaginacao
                  ? novosFiltros.pagina || prev.pagina
                  : 1,
                tamanhoPagina: novosFiltros.tamanhoPagina || prev.tamanhoPagina,
                ordenarPor: prev.ordenarPor,
                direcaoOrdenacao: prev.direcaoOrdenacao,
              }))
            }}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Tabela */}
        <TabelaUnidades
          unidades={unidadesFiltradas}
          unidadesSelecionadas={unidadesSelecionadas}
          onUnidadesSelecionadasChange={setUnidadesSelecionadas}
          paginacao={paginacao}
          onPaginacaoChange={setPaginacao}
          onVisualizarUnidade={handleVisualizarUnidade}
          onEditarUnidade={handleEditarUnidade}
          onExcluirUnidade={handleExcluirUnidade}
          ordenacao={ordenacao}
          onOrdenacao={handleOrdenacao}
          isLoading={
            isLoading ||
            updateUnidadeMutation.isPending ||
            deleteUnidadeMutation.isPending
          }
        />
      </div>
    </div>
  )
}

export default UnidadesListPage
