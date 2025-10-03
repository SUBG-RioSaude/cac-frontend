/**
 * ==========================================
 * COMPONENTE DE CONTRATOS DO FORNECEDOR
 * ==========================================
 * Lista completa de contratos de um fornecedor com filtros e busca
 */

import { Search, Filter, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type FiltroStatus = 'todos' | 'ativo' | 'vencendo' | 'vencido' | 'suspenso'
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
          return filtroStatus === 'ativo'
        }

        const dataFim = new Date(contrato.vigenciaFinal)

        switch (filtroStatus) {
          case 'ativo':
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
      return { todos: 0, ativo: 0, vencendo: 0, vencido: 0, suspenso: 0 }

    const agora = new Date()
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const contadores = {
      todos: contratos.length,
      ativo: 0,
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
        contadores.ativo++
        return
      }

      const dataFim = new Date(contrato.vigenciaFinal)

      if (dataFim < agora) {
        contadores.vencido++
      } else if (dataFim <= em30Dias) {
        contadores.vencendo++
      } else {
        contadores.ativo++
      }
    })

    return contadores
  }, [contratos])

  // const handleVisualizarContrato = (contrato: Contrato) => {
  //   navigate(`/contratos/${contrato.id}`)
  // }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`contratos-skeleton-${index}`}
                className="rounded-lg border p-4"
              >
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contratos de {empresa.razaoSocial}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros e busca */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
            {/* Busca */}
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Buscar por número, objeto, processo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Status */}
            <Select
              value={filtroStatus}
              onValueChange={(value: FiltroStatus) => setFiltroStatus(value)}
            >
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todos ({contarPorStatus.todos})
                </SelectItem>
                <SelectItem value="ativo">
                  Ativos ({contarPorStatus.ativo})
                </SelectItem>
                <SelectItem value="vencendo">
                  Vencendo ({contarPorStatus.vencendo})
                </SelectItem>
                <SelectItem value="vencido">
                  Vencidos ({contarPorStatus.vencido})
                </SelectItem>
                <SelectItem value="suspenso">
                  Suspensos ({contarPorStatus.suspenso})
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select
              value={ordenacao}
              onValueChange={(value: Ordenacao) => setOrdenacao(value)}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_desc">Data ↓ (Mais recente)</SelectItem>
                <SelectItem value="data_asc">Data ↑ (Mais antigo)</SelectItem>
                <SelectItem value="valor_desc">Valor ↓ (Maior)</SelectItem>
                <SelectItem value="valor_asc">Valor ↑ (Menor)</SelectItem>
                <SelectItem value="numero_asc">Número ↑ (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Badges de status */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filtroStatus === 'todos' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setFiltroStatus('todos')}
          >
            Todos {contarPorStatus.todos}
          </Badge>
          <Badge
            variant={filtroStatus === 'ativo' ? 'default' : 'secondary'}
            className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
            onClick={() => setFiltroStatus('ativo')}
          >
            Ativos {contarPorStatus.ativo}
          </Badge>
          {contarPorStatus.vencendo > 0 && (
            <Badge
              variant={filtroStatus === 'vencendo' ? 'default' : 'secondary'}
              className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
              onClick={() => setFiltroStatus('vencendo')}
            >
              Vencendo {contarPorStatus.vencendo}
            </Badge>
          )}
          {contarPorStatus.vencido > 0 && (
            <Badge
              variant={filtroStatus === 'vencido' ? 'default' : 'secondary'}
              className="cursor-pointer bg-red-100 text-red-800 hover:bg-red-200"
              onClick={() => setFiltroStatus('vencido')}
            >
              Vencidos {contarPorStatus.vencido}
            </Badge>
          )}
        </div>

        {/* Lista de contratos */}
        {contratosFiltrados.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              {busca || filtroStatus !== 'todos'
                ? 'Nenhum contrato encontrado'
                : 'Nenhum contrato vinculado'}
            </h3>
            <p className="text-muted-foreground">
              {busca || filtroStatus !== 'todos'
                ? 'Tente ajustar os filtros ou termo de busca.'
                : 'Este fornecedor ainda não possui contratos cadastrados no sistema.'}
            </p>
            {(busca || filtroStatus !== 'todos') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setBusca('')
                  setFiltroStatus('todos')
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <TabelaContratos
            contratos={contratosFiltrados}
            isLoading={false}
            contratosSelecionados={[]}
            onSelecionarContrato={() => {
              // Funcionalidade de seleção será implementada futuramente
            }}
            onSelecionarTodos={() => {
              // Funcionalidade de seleção será implementada futuramente
            }}
            paginacao={{
              pagina: 1,
              itensPorPagina: contratosFiltrados.length,
              total: contratosFiltrados.length,
            }}
            onPaginacaoChange={() => {
              // Funcionalidade de paginação será implementada futuramente
            }}
            totalContratos={contratosFiltrados.length}
            hideContratadaColumn
          />
        )}
      </CardContent>
    </Card>
  )
}
