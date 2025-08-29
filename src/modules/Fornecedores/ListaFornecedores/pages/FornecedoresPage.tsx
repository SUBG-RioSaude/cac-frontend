import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FileDown } from 'lucide-react'
import { SearchAndFiltersFornecedores } from '@/modules/Fornecedores/ListaFornecedores/components/search-and-filters'
import { TabelaFornecedores } from '@/modules/Fornecedores/ListaFornecedores/components/tabela-fornecedores'
import { ModalConfirmacaoExportacao } from '@/modules/Fornecedores/ListaFornecedores/components/modal-confirmacao-exportacao'
import { useFornecedoresStore } from '@/modules/Fornecedores/ListaFornecedores/store/fornecedores-store'
import type { Fornecedor, FiltrosFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'
import { mapearFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'
import { ModalNovoFornecedor } from '@/modules/Fornecedores/ListaFornecedores/components/modal-novo-fornecedor'
import { useFornecedoresResumo } from '@/modules/Empresas/hooks/use-empresas'

export default function FornecedoresListPage() {
  const navigate = useNavigate()
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosFornecedorApi>({
    pagina: 1,
    tamanhoPagina: 10
  })

  // React Query para dados da API
  const { data: apiResponse, isLoading } = useFornecedoresResumo(filtros, {
    keepPreviousData: true
  })

  // Zustand apenas para seleção de itens
  const {
    fornecedoresSelecionados,
  } = useFornecedoresStore()

  // Mapear dados da API para interface Fornecedor
  const fornecedores = useMemo(() => {
    if (!apiResponse?.itens) return []
    return apiResponse.itens.map(mapearFornecedorApi)
  }, [apiResponse])

  // Paginação baseada na resposta da API
  const paginacao = useMemo(() => ({
    pagina: apiResponse?.pagina || 1,
    itensPorPagina: apiResponse?.tamanhoPagina || 10,
    total: apiResponse?.totalItens || 0
  }), [apiResponse])

  const handleAbrirFornecedor = (fornecedor: Fornecedor) => {
    navigate(`/fornecedores/${fornecedor.cnpj}`)
  }

  const handleExportarSelecionados = (fornecedoresSelecionadosData: Fornecedor[]) => {
    console.log('Exportar fornecedores:', fornecedoresSelecionadosData)

    const csvContent = [
      [
        'Razão Social',
        'CNPJ',
        'Contratos Ativos',
        'Status',
        'Valor Total',
      ],
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
    document.body.removeChild(link)
  }

  const handleExportarTodos = () => {
    const csvContent = [
      [
        'Razão Social',
        'CNPJ',
        'Contratos Ativos',
        'Status',
        'Valor Total',
      ],
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
    document.body.removeChild(link)

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

  const handleNovoFornecedor = (dados: unknown) => {
    console.log('Novo fornecedor:', dados)
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
          onFiltrosChange={(novosFiltros) => {
            setFiltros(prev => ({
              ...prev,
              ...novosFiltros,
              pagina: 1 // Reset para primeira página ao filtrar
            }))
          }}
          filtrosAtivos={filtros}
        />
        </motion.div>

        {/* Tabela */}
        <TabelaFornecedores
          fornecedores={fornecedores}
          paginacao={paginacao}
          onPaginacaoChange={(novaPaginacao) => {
            setFiltros(prev => ({
              ...prev,
              pagina: novaPaginacao.pagina,
              tamanhoPagina: novaPaginacao.itensPorPagina
            }))
          }}
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
