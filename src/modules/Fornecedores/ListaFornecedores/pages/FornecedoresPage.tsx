import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, FileDown } from "lucide-react"
import { SearchAndFiltersFornecedores } from "@/modules/Fornecedores/ListaFornecedores/components/search-and-filters"
import { TabelaFornecedores } from "@/modules/Fornecedores/ListaFornecedores/components/tabela-fornecedores"
import { ModalConfirmacaoExportacao } from "@/modules/Fornecedores/ListaFornecedores/components/modal-confirmacao-exportacao"
import { useFornecedoresStore } from "@/modules/Fornecedores/ListaFornecedores/store/fornecedores-store"
import type { Fornecedor } from "@/modules/Fornecedores/ListaFornecedores/types/fornecedor"
import { ModalNovoFornecedor } from "@/modules/Fornecedores/ListaFornecedores/components/modal-novo-fornecedor"

export default function FornecedoresListPage() {
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)
  
  const { 
    fornecedoresFiltrados,
    fornecedoresSelecionados,
    paginacao,
    setPaginacao
  } = useFornecedoresStore()

  const handleVisualizarFornecedor = (fornecedor: Fornecedor) => {
    console.log("Visualizar fornecedor:", fornecedor)
  }

  const handleEditarFornecedor = (fornecedor: Fornecedor) => {
    console.log("Editar fornecedor:", fornecedor)
  }

  const handleExportarSelecionados = (fornecedores: Fornecedor[]) => {
    console.log("Exportar fornecedores:", fornecedores)

    const csvContent = [
      ["Razão Social", "Nome Fantasia", "CNPJ", "Contratos Ativos", "Status", "Valor Total"],
      ...fornecedores.map((f) => [
        f.razaoSocial,
        f.nomeFantasia,
        f.cnpj,
        f.contratosAtivos.toString(),
        f.status,
        f.valorTotalContratos.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "fornecedores_selecionados.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportarTodos = () => {
    const csvContent = [
      ["Razão Social", "Nome Fantasia", "CNPJ", "Contratos Ativos", "Status", "Valor Total"],
      ...fornecedoresFiltrados.map((f) => [
        f.razaoSocial,
        f.nomeFantasia,
        f.cnpj,
        f.contratosAtivos.toString(),
        f.status,
        f.valorTotalContratos.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "todos_fornecedores.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setModalExportacaoAberto(false)
  }

  const handleClickExportar = () => {
    if (fornecedoresSelecionados.length > 0) {
      const fornecedoresSelecionadosData = fornecedoresFiltrados.filter(f => 
        fornecedoresSelecionados.includes(f.id)
      )
      handleExportarSelecionados(fornecedoresSelecionadosData)
    } else {
      setModalExportacaoAberto(true)
    }
  }

  const handleNovoFornecedor = (dados: unknown) => {
    console.log("Novo fornecedor:", dados)
  }

  const textoExportar = fornecedoresSelecionados.length > 0 
    ? `Exportar (${fornecedoresSelecionados.length})`
    : 'Exportar Todos'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Cabeçalho Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-6"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Fornecedores
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
            Gerencie todos os fornecedores do sistema de forma eficiente
            </p>
          </div>
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={handleClickExportar}
              className="cursor-pointer shadow-sm h-10 sm:h-auto"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="sm:hidden">
                {fornecedoresSelecionados.length > 0 ? `Exportar (${fornecedoresSelecionados.length})` : 'Exportar'}
              </span>
              <span className="hidden sm:inline">
                {textoExportar}
              </span>
            </Button>
            <ModalNovoFornecedor onSalvar={handleNovoFornecedor}>
              <Button className="cursor-pointer shadow-sm h-10 sm:h-auto">
                <Plus className="h-4 w-4 mr-2" />
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
          <SearchAndFiltersFornecedores />
        </motion.div>

        {/* Tabela */}
        <TabelaFornecedores
          fornecedores={fornecedoresFiltrados}
          paginacao={paginacao}
          onPaginacaoChange={setPaginacao}
          onVisualizarFornecedor={handleVisualizarFornecedor}
          onEditarFornecedor={handleEditarFornecedor}
        />
      </div>

      {/* Modal de Confirmação */}
      <ModalConfirmacaoExportacao
        isOpen={modalExportacaoAberto}
        onClose={() => setModalExportacaoAberto(false)}
        onConfirm={handleExportarTodos}
        totalFornecedores={fornecedoresFiltrados.length}
      />
    </div>
  )
}
