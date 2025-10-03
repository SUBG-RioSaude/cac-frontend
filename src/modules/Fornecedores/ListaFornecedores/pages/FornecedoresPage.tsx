import { motion } from 'framer-motion'
import { Plus, FileDown } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useFornecedoresResumo } from '@/modules/Empresas/hooks/use-empresas'
import { ModalConfirmacaoExportacao } from '@/modules/Fornecedores/ListaFornecedores/components/modal-confirmacao-exportacao'
import { ModalNovoFornecedor } from '@/modules/Fornecedores/ListaFornecedores/components/modal-novo-fornecedor'
import { SearchAndFiltersFornecedores } from '@/modules/Fornecedores/ListaFornecedores/components/search-and-filters'
import { TabelaFornecedores } from '@/modules/Fornecedores/ListaFornecedores/components/tabela-fornecedores'
import { useFornecedoresStore } from '@/modules/Fornecedores/ListaFornecedores/store/fornecedores-store'
import type {
  Fornecedor,
  FiltrosFornecedorApi,
  PaginacaoParamsFornecedor,
} from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'
import { mapearFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'

const CAMPOS_FILTRO: (keyof FiltrosFornecedorApi)[] = [
  'pagina',
  'tamanhoPagina',
  'cnpj',
  'razaoSocial',
  'status',
  'cidade',
  'estado',
  'valorMinimo',
  'valorMaximo',
  'contratosMinimo',
  'contratosMaximo',
]

function filtrosSaoIguais(
  anterior: FiltrosFornecedorApi,
  atual: FiltrosFornecedorApi,
): boolean {
  return CAMPOS_FILTRO.every((campo) => {
    const valorAnterior = anterior[campo]
    const valorAtual = atual[campo]

    // Considera undefined, null e '' como equivalentes para campos de texto
    if (campo === 'cnpj' || campo === 'razaoSocial') {
      const anteriorVazio = !valorAnterior || valorAnterior === ''
      const atualVazio = !valorAtual || valorAtual === ''
      return (
        anteriorVazio === atualVazio &&
        (anteriorVazio || valorAnterior === valorAtual)
      )
    }

    return valorAnterior === valorAtual
  })
}

const FornecedoresListPage = () => {
  const navigate = useNavigate()
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosFornecedorApi>({
    pagina: 1,
    tamanhoPagina: 10,
  })

  // React Query para dados da API
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useFornecedoresResumo(filtros, {
    keepPreviousData: true, // Mantém dados anteriores durante transições
  })

  // Zustand apenas para seleção de itens
  const { fornecedoresSelecionados } = useFornecedoresStore()

  // Mapear dados da API para interface Fornecedor
  const fornecedores = useMemo(() => {
    if (!apiResponse?.itens) return []
    const mapped = apiResponse.itens.map(mapearFornecedorApi)
    return mapped
  }, [apiResponse])

  // Paginação baseada na resposta da API com otimização
  const paginacao = useMemo(() => {
    const result = {
      pagina: apiResponse?.pagina ?? filtros.pagina ?? 1,
      itensPorPagina: apiResponse?.tamanhoPagina ?? filtros.tamanhoPagina ?? 10,
      total: apiResponse?.totalItens ?? 0,
    }
    return result
  }, [
    apiResponse?.pagina,
    apiResponse?.tamanhoPagina,
    apiResponse?.totalItens,
    filtros.pagina,
    filtros.tamanhoPagina,
  ])

  const handleAbrirFornecedor = useCallback(
    (fornecedor: Fornecedor) => {
      navigate(`/fornecedores/${fornecedor.cnpj}`)
    },
    [navigate],
  )

  const handleExportarSelecionados = (
    fornecedoresSelecionadosData: Fornecedor[],
  ) => {
    const csvContent = [
      ['Razão Social', 'CNPJ', 'Contratos Ativos', 'Status', 'Valor Total'],
      ...fornecedoresSelecionadosData.map((f) => [
        f.razaoSocial,
        f.cnpj,
        f.contratosAtivos.toString(),
        f.status,
        f.valorTotalContratos.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'fornecedores_selecionados.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleExportarTodos = () => {
    const csvContent = [
      ['Razão Social', 'CNPJ', 'Contratos Ativos', 'Status', 'Valor Total'],
      ...fornecedores.map((f) => [
        f.razaoSocial,
        f.cnpj,
        f.contratosAtivos.toString(),
        f.status,
        f.valorTotalContratos.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'todos_fornecedores.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()

    setModalExportacaoAberto(false)
  }

  const handleClickExportar = () => {
    if (fornecedoresSelecionados.length > 0) {
      const fornecedoresSelecionadosData = fornecedores.filter((f) =>
        fornecedoresSelecionados.includes(f.id),
      )
      handleExportarSelecionados(fornecedoresSelecionadosData)
    } else {
      setModalExportacaoAberto(true)
    }
  }

  const handleNovoFornecedor = (_dados: unknown) => {
    // TODO: Implementar lógica para criar novo fornecedor
  }

  const textoExportar =
    fornecedoresSelecionados.length > 0
      ? `Exportar (${fornecedoresSelecionados.length})`
      : 'Exportar Todos'

  return (
    <div className="to-muted/20 min-h-screen bg-gradient-to-br p-6">
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
              Fornecedores
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base lg:text-lg">
              Gerencie todos os fornecedores do sistema de forma eficiente
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
              onClick={handleClickExportar}
              className="h-10 cursor-pointer shadow-sm sm:h-auto"
            >
              <FileDown className="mr-2 h-4 w-4" />
              <span className="sm:hidden">
                {fornecedoresSelecionados.length > 0
                  ? `Exportar (${fornecedoresSelecionados.length})`
                  : 'Exportar'}
              </span>
              <span className="hidden sm:inline">{textoExportar}</span>
            </Button>
            <ModalNovoFornecedor onSalvar={handleNovoFornecedor}>
              <Button className="h-10 cursor-pointer shadow-sm sm:h-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Novo</span>
                <span className="hidden sm:inline">Novo Fornecedor</span>
              </Button>
            </ModalNovoFornecedor>
          </motion.div>
        </motion.div>

        {/* Search e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchAndFiltersFornecedores
            onFiltrosChange={useCallback(
              (novosFiltros: FiltrosFornecedorApi) => {
                setFiltros((prev) => {
                  // Verifica se já possui paginação nos novos filtros
                  const jaPossuiPaginacao =
                    'pagina' in novosFiltros || 'tamanhoPagina' in novosFiltros

                  const filtrosFinais = {
                    ...prev,
                    ...novosFiltros,
                    // Só reseta para página 1 se não for mudança de paginação
                    ...(jaPossuiPaginacao ? {} : { pagina: 1 }),
                  }

                  // Evita re-renders desnecessários
                  return filtrosSaoIguais(prev, filtrosFinais)
                    ? prev
                    : filtrosFinais
                })
              },
              [],
            )}
            filtrosAtivos={filtros}
            isLoading={isFetching}
            totalResultados={apiResponse?.totalItens}
          />
        </motion.div>

        {/* Tabela */}
        <TabelaFornecedores
          fornecedores={fornecedores}
          paginacao={paginacao}
          onPaginacaoChange={useCallback(
            (novaPaginacao: PaginacaoParamsFornecedor) => {
              setFiltros((prev) => {
                const novosFiltros = {
                  ...prev,
                  pagina: novaPaginacao.pagina,
                  tamanhoPagina: novaPaginacao.itensPorPagina,
                }

                // Evita re-renders desnecessários
                return filtrosSaoIguais(prev, novosFiltros)
                  ? prev
                  : novosFiltros
              })
            },
            [],
          )}
          onAbrirFornecedor={handleAbrirFornecedor}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de Confirmação */}
      <ModalConfirmacaoExportacao
        isOpen={modalExportacaoAberto}
        onClose={() => setModalExportacaoAberto(false)}
        onConfirm={handleExportarTodos}
        totalFornecedores={fornecedores.length}
      />
    </div>
  )
}

export default FornecedoresListPage
