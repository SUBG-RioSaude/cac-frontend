import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FileDown } from 'lucide-react'
import { SearchAndFilters } from '@/modules/Contratos/components/ListaContratos/pesquisa-e-filtros'
import { TabelaContratos } from '@/modules/Contratos/components/ListaContratos/tabela-contratos'
import { ModalConfirmacaoExportacao } from '@/modules/Contratos/components/ListaContratos/modal-confirmacao-exportacao'
import { useContratosStore } from '@/modules/Contratos/store/contratos-store'

export function ContratosPage() {
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)
  const { contratosFiltrados, contratosSelecionados, contratos } =
    useContratosStore()

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
        c.numeroContrato,
        c.contratada.razaoSocial,
        c.contratada.cnpj,
        c.valor.toString(),
        c.dataInicial,
        c.dataFinal,
        c.status,
        c.unidade,
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
    document.body.removeChild(link)

    setModalExportacaoAberto(false)
  }

  const handleExportarSelecionados = () => {
    const contratosSelecionadosData = contratosFiltrados.filter((c) =>
      contratosSelecionados.includes(c.id),
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
        c.numeroContrato,
        c.contratada.razaoSocial,
        c.contratada.cnpj,
        c.valor.toString(),
        c.dataInicial,
        c.dataFinal,
        c.status,
        c.unidade,
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
    document.body.removeChild(link)
  }

  const handleClickExportar = () => {
    if (contratosSelecionados.length > 0) {
      handleExportarSelecionados()
    } else {
      setModalExportacaoAberto(true)
    }
  }

  const handleNovoContrato = () => {
    console.log('Novo contrato')
  }

  const textoExportar =
    contratosSelecionados.length > 0
      ? `Exportar (${contratosSelecionados.length})`
      : 'Exportar Todos'

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
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
                {contratosSelecionados.length > 0
                  ? `Exportar (${contratosSelecionados.length})`
                  : 'Exportar'}
              </span>
              <span className="hidden sm:inline">{textoExportar}</span>
            </Button>
            <Button
              onClick={handleNovoContrato}
              className="h-10 cursor-pointer shadow-sm sm:h-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
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
          <SearchAndFilters />
        </motion.div>

        {/* Tabela */}
        <TabelaContratos />
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
