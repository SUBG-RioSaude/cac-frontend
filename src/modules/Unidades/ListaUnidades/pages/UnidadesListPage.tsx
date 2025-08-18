import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, FileDown } from "lucide-react"
import { SearchAndFiltersUnidades } from "@/modules/Unidades/ListaUnidades/components/search-and-filters-unidades"
import { TabelaUnidades } from "@/modules/Unidades/ListaUnidades/components/tabela-unidades"
import { UnidadesPageSkeleton } from "@/modules/Unidades/ListaUnidades/components/skeletons/unidades-page-skeleton"
import type { Unidade, OrdenacaoParams, ColunaOrdenacao } from "@/modules/Unidades/ListaUnidades/types/unidade"
import unidadesData from "../data/unidades.json"

// Usar dados diretamente do JSON (já contém todos os campos necessários)
const unidades: Unidade[] = unidadesData

const UnidadesListPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [termoPesquisaDebounced, setTermoPesquisaDebounced] = useState('')
  const [filtrosAvancados, setFiltrosAvancados] = useState<{
    status?: string
    sigla?: string
    tipo?: string
  }>({})
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<number[]>([])
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParams>({
    coluna: 'nome',
    direcao: 'asc'
  })
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    itensPorPagina: 10,
    total: unidades.length
  })

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // 1.5 segundos para simular API

    return () => clearTimeout(timer)
  }, [])

  // Debounce para pesquisa - aguarda 300ms após usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setTermoPesquisaDebounced(termoPesquisa)
    }, 300)

    return () => clearTimeout(timer)
  }, [termoPesquisa])

  // Função para ordenar unidades
  const ordenarUnidades = (unidades: Unidade[], ordenacao: OrdenacaoParams): Unidade[] => {
    return [...unidades].sort((a, b) => {
      let valorA: any = a[ordenacao.coluna]
      let valorB: any = b[ordenacao.coluna]

      // Tratar valores undefined/null
      if (valorA == null) valorA = ''
      if (valorB == null) valorB = ''

      // Converter para string para comparação textual
      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase()
        valorB = valorB.toLowerCase()
      }

      let resultado = 0
      if (valorA < valorB) resultado = -1
      else if (valorA > valorB) resultado = 1

      return ordenacao.direcao === 'desc' ? resultado * -1 : resultado
    })
  }

  // Filtrar e ordenar unidades
  const unidadesFiltradas = useMemo(() => {
    let resultado = unidades

    // Aplicar filtro de pesquisa
    if (termoPesquisaDebounced) {
      const termo = termoPesquisaDebounced.toLowerCase()
      resultado = resultado.filter(unidade =>
        unidade.nome.toLowerCase().includes(termo) ||
        unidade.sigla.toLowerCase().includes(termo) ||
        unidade.UO.toLowerCase().includes(termo) ||
        unidade.UG.toLowerCase().includes(termo) ||
        unidade.endereco.toLowerCase().includes(termo)
      )
    }

    // Aplicar filtros avançados
    if (filtrosAvancados.status) {
      resultado = resultado.filter(unidade => 
        (unidade.status || 'ativo') === filtrosAvancados.status
      )
    }

    if (filtrosAvancados.sigla) {
      resultado = resultado.filter(unidade =>
        unidade.sigla.toLowerCase().includes(filtrosAvancados.sigla!.toLowerCase())
      )
    }

    if (filtrosAvancados.tipo) {
      // Filtro por tipo baseado na sigla (simplificado)
      const tipoMap = {
        ubs: ['UBS'],
        hospital: ['HOSPITAL', 'HMS'],
        caps: ['CAPS'],
        upa: ['UPA'],
        centro: ['CENTRO', 'CE']
      }
      
      const siglasTipo = tipoMap[filtrosAvancados.tipo as keyof typeof tipoMap] || []
      resultado = resultado.filter(unidade =>
        siglasTipo.some(tipo => unidade.sigla.toUpperCase().includes(tipo))
      )
    }

    // Aplicar ordenação
    resultado = ordenarUnidades(resultado, ordenacao)

    return resultado
  }, [termoPesquisaDebounced, filtrosAvancados, ordenacao])

  const handleVisualizarUnidade = (unidade: Unidade) => {
    navigate(`/unidades/${unidade.id}`)
  }

  const handleOrdenacao = (coluna: ColunaOrdenacao) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExportarSelecionadas = () => {
    const unidadesParaExportar = unidadesSelecionadas.length > 0
      ? unidadesFiltradas.filter(u => unidadesSelecionadas.includes(u.id))
      : unidadesFiltradas

    const csvContent = [
      ["Nome", "Sigla", "UO", "UG", "Endereço", "Status"],
      ...unidadesParaExportar.map((u) => [
        u.nome,
        u.sigla,
        u.UO,
        u.UG,
        u.endereco,
        u.status || 'ativo',
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `unidades_${unidadesSelecionadas.length > 0 ? 'selecionadas' : 'todas'}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const textoExportar = unidadesSelecionadas.length > 0 
    ? `Exportar (${unidadesSelecionadas.length})`
    : 'Exportar Todas'

  if (loading) {
    return <UnidadesPageSkeleton />
  }

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
              Unidades
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
              Gerencie todas as unidades do sistema de forma eficiente
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
              onClick={handleExportarSelecionadas}
              className="cursor-pointer shadow-sm h-10 sm:h-auto"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="sm:hidden">
                {unidadesSelecionadas.length > 0 ? `Exportar (${unidadesSelecionadas.length})` : 'Exportar'}
              </span>
              <span className="hidden sm:inline">
                {textoExportar}
              </span>
            </Button>
            <Button className="cursor-pointer shadow-sm h-10 sm:h-auto">
              <Plus className="h-4 w-4 mr-2" />
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
            termoPesquisa={termoPesquisa}
            onTermoPesquisaChange={setTermoPesquisa}
            filtros={filtrosAvancados}
            onFiltrosChange={setFiltrosAvancados}
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
          ordenacao={ordenacao}
          onOrdenacao={handleOrdenacao}
        />
      </div>
    </div>
  )
}

export default UnidadesListPage