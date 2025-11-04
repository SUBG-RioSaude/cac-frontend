/**
 * ==========================================
 * COMPONENTE DE CONTRATOS DO FORNECEDOR
 * ==========================================
 * Lista completa de contratos de um fornecedor com filtros e busca
 */

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TabelaContratos } from '@/modules/Contratos/components/ListaContratos/tabela-contratos'
import type { Contrato } from '@/modules/Contratos/types/contrato'

interface FornecedorContratosProps {
  contratos: Contrato[]
  isLoading?: boolean
  empresa: {
    id: string
    razaoSocial: string
  }
}

type FiltroStatus = 'todos' | 'vigente' | 'vencendo' | 'vencido' | 'suspenso'
type Ordenacao =
  | 'data_desc'
  | 'data_asc'
  | 'valor_desc'
  | 'valor_asc'
  | 'numero_asc'

export const FornecedorContratos = ({
  contratos,
  isLoading,
  empresa,
}: FornecedorContratosProps) => {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('data_desc')

  const contratosFiltrados = useMemo(() => {
    if (contratos.length === 0) return []

    let resultado = [...contratos]

    // Aplicar busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase().trim()
      resultado = resultado.filter((contrato) => {
        const numeroContrato = contrato.numeroContrato?.toLowerCase() ?? ''
        const descricaoObjeto = contrato.descricaoObjeto?.toLowerCase() ?? ''
        const processoSei = contrato.processoSei?.toLowerCase() ?? ''
        const processoRio = contrato.processoRio?.toLowerCase() ?? ''

        return (
          numeroContrato.includes(termoBusca) ||
          descricaoObjeto.includes(termoBusca) ||
          processoSei.includes(termoBusca) ||
          processoRio.includes(termoBusca)
        )
      })
    }

    // Aplicar filtro de status
    if (filtroStatus !== 'todos') {
      const agora = new Date()
      const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      resultado = resultado.filter((contrato) => {
        if (filtroStatus === 'suspenso') {
          return contrato.status === 'suspenso'
        }

        if (!contrato.vigenciaFinal) {
          return filtroStatus === 'vigente'
        }

        const dataFim = new Date(contrato.vigenciaFinal)

        switch (filtroStatus) {
          case 'vigente':
            return dataFim > em30Dias && contrato.status !== 'suspenso'
          case 'vencendo':
            return (
              dataFim > agora &&
              dataFim <= em30Dias &&
              contrato.status !== 'suspenso'
            )
          case 'vencido':
            return dataFim < agora && contrato.status !== 'suspenso'
          default:
            return true
        }
      })
    }

    // Aplicar ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'data_desc':
          return (
            new Date(b.vigenciaInicial).getTime() -
            new Date(a.vigenciaInicial).getTime()
          )
        case 'data_asc':
          return (
            new Date(a.vigenciaInicial).getTime() -
            new Date(b.vigenciaInicial).getTime()
          )
        case 'valor_desc':
          return b.valorGlobal - a.valorGlobal
        case 'valor_asc':
          return a.valorGlobal - b.valorGlobal
        case 'numero_asc':
          return (a.numeroContrato ?? '').localeCompare(b.numeroContrato ?? '')
        default:
          return 0
      }
    })

    return resultado
  }, [contratos, busca, filtroStatus, ordenacao])

  const contarPorStatus = useMemo(() => {
    if (contratos.length === 0)
      return { todos: 0, vigente: 0, vencendo: 0, vencido: 0, suspenso: 0 }

    const agora = new Date()
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const contadores = {
      todos: contratos.length,
      vigente: 0,
      vencendo: 0,
      vencido: 0,
      suspenso: 0,
    }

    contratos.forEach((contrato) => {
      if (contrato.status === 'suspenso') {
        contadores.suspenso++
        return
      }

      if (!contrato.vigenciaFinal) {
        contadores.vigente++
        return
      }

      const dataFim = new Date(contrato.vigenciaFinal)

      if (dataFim < agora) {
        contadores.vencido++
      } else if (dataFim <= em30Dias) {
        contadores.vencendo++
      } else {
        contadores.vigente++
      }
    })

    return contadores
  }, [contratos])

  const temFiltrosAtivos = busca.trim() !== '' || filtroStatus !== 'todos'

  return (
    <div className="space-y-6">
      {/* Header com contador */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h3 className="text-lg font-semibold">
            Contratos de {empresa.razaoSocial}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? 'Carregando...'
              : `${contratosFiltrados.length} ${contratosFiltrados.length === 1 ? 'contrato encontrado' : 'contratos encontrados'}`}
          </p>
        </div>

        {/* Badges de status */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={`cursor-pointer transition-all ${
              filtroStatus === 'todos'
                ? 'border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200'
                : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100'
            }`}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos {contarPorStatus.todos}
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-all ${
              filtroStatus === 'vigente'
                ? 'border-blue-600 bg-blue-100 text-blue-900 hover:bg-blue-200'
                : 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100'
            }`}
            onClick={() => setFiltroStatus('vigente')}
          >
            Vigentes {contarPorStatus.vigente}
          </Badge>
          {contarPorStatus.vencendo > 0 && (
            <Badge
              variant="outline"
              className={`cursor-pointer transition-all ${
                filtroStatus === 'vencendo'
                  ? 'border-orange-600 bg-orange-100 text-orange-900 hover:bg-orange-200'
                  : 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 hover:bg-orange-100'
              }`}
              onClick={() => setFiltroStatus('vencendo')}
            >
              Vencendo {contarPorStatus.vencendo}
            </Badge>
          )}
          {contarPorStatus.vencido > 0 && (
            <Badge
              variant="outline"
              className={`cursor-pointer transition-all ${
                filtroStatus === 'vencido'
                  ? 'border-red-600 bg-red-100 text-red-900 hover:bg-red-200'
                  : 'border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100'
              }`}
              onClick={() => setFiltroStatus('vencido')}
            >
              Vencidos {contarPorStatus.vencido}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Filtros e busca */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Busca */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por número, objeto, processo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="focus:border-primary h-10 border-2 pr-10 pl-10 shadow-sm transition-all duration-200 sm:h-11"
          />
          {busca && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBusca('')}
              className="hover:bg-muted absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Ordenação */}
        <Select
          value={ordenacao}
          onValueChange={(value: Ordenacao) => setOrdenacao(value)}
        >
          <SelectTrigger className="h-10 w-full border-2 shadow-sm sm:h-11 sm:w-52">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data_desc">Mais recente</SelectItem>
            <SelectItem value="data_asc">Mais antigo</SelectItem>
            <SelectItem value="valor_desc">Maior valor</SelectItem>
            <SelectItem value="valor_asc">Menor valor</SelectItem>
            <SelectItem value="numero_asc">Número (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão limpar filtros */}
        {temFiltrosAtivos && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusca('')
              setFiltroStatus('todos')
            }}
            className="h-10 whitespace-nowrap sm:h-11"
          >
            Limpar filtros
          </Button>
        )}
      </motion.div>

      {/* Tabela de contratos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <TabelaContratos
          contratos={contratosFiltrados}
          isLoading={isLoading ?? false}
          contratosSelecionados={[]}
          onSelecionarContrato={() => {}}
          onSelecionarTodos={() => {}}
          paginacao={{
            pagina: 1,
            itensPorPagina: contratosFiltrados.length,
            total: contratosFiltrados.length,
          }}
          onPaginacaoChange={() => {}}
          totalContratos={contratosFiltrados.length}
          hideContratadaColumn
        />
      </motion.div>
    </div>
  )
}
