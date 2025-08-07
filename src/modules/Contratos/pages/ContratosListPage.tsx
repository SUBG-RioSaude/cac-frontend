import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FileDown } from 'lucide-react'
import { SearchAndFilters } from '../components/pesquisa-e-filtros'
import { TabelaContratos } from '../components/tabela-contratos'
import { ModalConfirmacaoExportacao } from '../components/modal-confirmacao-exportacao'
import { useContratosStore } from '../store/contratos-store'

export function ContratosPage() {
  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false)
  const { contratosFiltrados, contratosSelecionados, contratos } = useContratosStore()

  const handleExportarTodos = () => {
    const csvContent = [
      ['Número do Contrato', 'Razão Social', 'CNPJ', 'Valor', 'Data Inicial', 'Data Final', 'Status', 'Unidade'],
      ...contratos.map(c => [
        c.numeroContrato,
        c.contratada.razaoSocial,
        c.contratada.cnpj,
        c.valor.toString(),
        c.dataInicial,
        c.dataFinal,
        c.status,
        c.unidade
      ])
    ].map(row => row.join(',')).join('\n')

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
    const contratosSelecionadosData = contratosFiltrados.filter(c => 
      contratosSelecionados.includes(c.id)
    )
    
    const csvContent = [
      ['Número do Contrato', 'Razão Social', 'CNPJ', 'Valor', 'Data Inicial', 'Data Final', 'Status', 'Unidade'],
      ...contratosSelecionadosData.map(c => [
        c.numeroContrato,
        c.contratada.razaoSocial,
        c.contratada.cnpj,
        c.valor.toString(),
        c.dataInicial,
        c.dataFinal,
        c.status,
        c.unidade
      ])
    ].map(row => row.join(',')).join('\n')

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
      // Se há contratos selecionados, exporta diretamente
      handleExportarSelecionados()
    } else {
      // Se não há seleção, abre modal de confirmação para exportar todos
      setModalExportacaoAberto(true)
    }
  }

  const handleNovoContrato = () => {
    console.log('Novo contrato')
  }

  const textoExportar = contratosSelecionados.length > 0 
    ? `Exportar (${contratosSelecionados.length})`
    : 'Exportar Todos'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-8 p-8">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Contratos
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Gerencie todos os contratos do sistema de forma eficiente
            </p>
          </div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              onClick={handleClickExportar} 
              className="shadow-sm"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {textoExportar}
            </Button>
            <Button onClick={handleNovoContrato} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
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
