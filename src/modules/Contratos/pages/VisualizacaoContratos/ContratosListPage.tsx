import { motion } from 'framer-motion'
import { Plus, FileDown, AlertCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalConfirmacaoExportacao } from '@/modules/Contratos/components/ListaContratos/modal-confirmacao-exportacao'
import { SearchAndFilters } from '@/modules/Contratos/components/ListaContratos/pesquisa-e-filtros'
import { TabelaContratos } from '@/modules/Contratos/components/ListaContratos/tabela-contratos'
import { useContratos } from '@/modules/Contratos/hooks'
import { useContratosPageState } from '@/modules/Contratos/hooks/useContratosPageState'
import type { Contrato } from '@/modules/Contratos/types/contrato'

export const ContratosPage = () => {
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)

  // Estado local da página
  const pageState = useContratosPageState()

  // Dados da API via React Query
  const {
    data: contractsResponse,
    isLoading,
    isPlaceholderData,
    error,
    isError,
    refetch,
  } = useContratos(pageState.parametrosAPI, {
    keepPreviousData: true, // Mantém dados anteriores durante paginação
    refetchOnMount: true,
  })

  // Extrair dados da resposta ou usar array vazio
  const contratos: Contrato[] = contractsResponse?.dados ?? []
  const totalContratos = contractsResponse?.totalRegistros ?? 0

  // Atualizar paginação quando receber dados da API
  if (contractsResponse && pageState.paginacao.total !== totalContratos) {
    pageState.setPaginacao({
      ...pageState.paginacao,
      total: totalContratos,
    })
  }

  const handleExportarTodos = () => {
    const csvContent = [
      [
        'Número do Contrato',
        'Razão Social',
        'CNPJ',
        'Valor',
        'Data Inicial',
        'Data Final',
        'Status',
        'Unidade',
      ],
      ...contratos.map((c) => [
        c.numeroContrato ?? 'N/A',
        c.contratada?.razaoSocial ?? 'N/A',
        c.contratada?.cnpj ?? 'N/A',
        (c.valor ?? c.valorGlobal).toString(),
        c.dataInicial ?? c.vigenciaInicial,
        c.dataFinal ?? c.vigenciaFinal,
        c.status ?? 'N/A',
        c.unidade ?? c.unidadeDemandante ?? 'N/A',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'todos_contratos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()

    setModalExportacaoAberto(false)
  }

  const handleExportarSelecionados = () => {
    const contratosSelecionadosData = contratos.filter((c) =>
      pageState.contratosSelecionados.includes(c.id),
    )

    const csvContent = [
      [
        'Número do Contrato',
        'Razão Social',
        'CNPJ',
        'Valor',
        'Data Inicial',
        'Data Final',
        'Status',
        'Unidade',
      ],
      ...contratosSelecionadosData.map((c) => [
        c.numeroContrato ?? 'N/A',
        c.contratada?.razaoSocial ?? 'N/A',
        c.contratada?.cnpj ?? 'N/A',
        (c.valor ?? c.valorGlobal).toString(),
        c.dataInicial ?? c.vigenciaInicial,
        c.dataFinal ?? c.vigenciaFinal,
        c.status ?? 'N/A',
        c.unidade ?? c.unidadeDemandante ?? 'N/A',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'contratos_selecionados.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleClickExportar = () => {
    if (pageState.contratosSelecionados.length > 0) {
      handleExportarSelecionados()
    } else {
      setModalExportacaoAberto(true)
    }
  }


  const navigate = useNavigate()

  const handleNovoContrato = () => {
    navigate('/contratos/cadastrar')
    // TODO: Implementar navegação para novo contrato
  } 

  const textoExportar =
    pageState.contratosSelecionados.length > 0
      ? `Exportar (${pageState.contratosSelecionados.length})`
      : 'Exportar Todos'

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="space-y-6 py-6 sm:space-y-8 sm:py-8">
        {/* Cabeçalho Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div className="text-center sm:text-left">
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Contratos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base lg:text-lg">
              Gerencie todos os contratos do sistema de forma eficiente
            </p>
          </div>
          <motion.div
            className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3"
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
                {pageState.contratosSelecionados.length > 0
                  ? `Exportar (${pageState.contratosSelecionados.length})`
                  : 'Exportar'}
              </span>
              <span className="hidden sm:inline">{textoExportar}</span>
            </Button>
            <Button
              variant="outline-premium"
              onClick={handleNovoContrato}
              className="h-10 cursor-pointer shadow-sm sm:h-auto  "
            >
              <Plus className="mr-2 h-4 w-4 " />
              Novo Contrato
            </Button>
          </motion.div>
        </motion.div>

        {/* Search e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchAndFilters
            termoPesquisa={pageState.termoPesquisa}
            filtros={pageState.filtros}
            onTermoPesquisaChange={pageState.setTermoPesquisa}
            onFiltrosChange={pageState.setFiltros}
            onLimparFiltros={pageState.limparFiltros}
          />
        </motion.div>

        {/* Estado de Erro */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  Erro ao carregar contratos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-700">
                  {(error as Error).message ||
                    'Ocorreu um erro inesperado ao carregar os dados.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    void refetch()
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabela */}
        {!isError && (
          <TabelaContratos
            contratos={contratos}
            isLoading={isLoading}
            paginacao={pageState.paginacao}
            contratosSelecionados={pageState.contratosSelecionados}
            onPaginacaoChange={pageState.setPaginacao}
            onSelecionarContrato={pageState.selecionarContrato}
            onSelecionarTodos={pageState.selecionarTodosContratos}
            totalContratos={totalContratos}
            isPlaceholderData={isPlaceholderData}
          />
        )}
      </div>

      {/* Modal de Confirmação */}
      <ModalConfirmacaoExportacao
        isOpen={modalExportacaoAberto}
        onClose={() => setModalExportacaoAberto(false)}
        onConfirm={handleExportarTodos}
        totalContratos={contratos.length}
      />
    </div>
  )
}
