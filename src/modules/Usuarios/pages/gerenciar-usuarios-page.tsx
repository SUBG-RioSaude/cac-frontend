import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

import { createServiceLogger } from '@/lib/logger'

import { SearchAndFiltersUsuarios } from '../components/search-and-filters-usuarios'
import { TabelaUsuarios } from '../components/tabela-usuarios'
import { useUsuarios } from '../hooks/use-usuarios'
import type { FiltrosUsuariosApi } from '../types/usuario-api'
import { mapearUsuarioApi } from '../utils/usuario-utils'

const logger = createServiceLogger('gerenciar-usuarios-page')

type OrdenacaoColuna = 'nome' | 'email' | 'ultimoLogin' | 'ativo'

interface OrdenacaoParams {
  coluna: OrdenacaoColuna
  direcao: 'asc' | 'desc'
}

const GerenciarUsuariosPage = () => {
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParams>({
    coluna: 'nome',
    direcao: 'asc',
  })
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    itensPorPagina: 20,
    total: 0,
  })

  // Estado único para todos os filtros (incluindo pesquisa)
  const [filtrosApi, setFiltrosApi] = useState<FiltrosUsuariosApi>({
    pagina: 1,
    tamanhoPagina: 20,
    ordenarPor: 'nome',
    direcaoOrdenacao: 'asc',
  })

  // Fetch data with React Query
  const {
    data: responseData,
    isLoading,
    error,
  } = useUsuarios(filtrosApi, {
    keepPreviousData: true,
    refetchOnMount: false,
  })

  // Map API data to local format
  const usuariosFiltrados = useMemo(() => {
    if (!responseData?.dados) return []
    // Verificar se dados é um array antes de chamar map
    if (!Array.isArray(responseData.dados)) {
      logger.warn(
        { dados: responseData.dados },
        'Resposta da API não contém array de dados',
      )
      return []
    }
    return responseData.dados.map(mapearUsuarioApi)
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

  const handleOrdenacao = (coluna: OrdenacaoColuna) => {
    setOrdenacao((prev) => ({
      coluna,
      direcao:
        prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Erro</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Erro ao carregar usuários'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os usuários do sistema, visualize permissões e histórico de login
        </p>
      </motion.div>

      {/* Search e Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SearchAndFiltersUsuarios
          filtrosAtivos={filtrosApi}
          onFiltrosChange={(novosFiltros) => {
            // Resetar para página 1 quando houver mudança de filtros (exceto paginação)
            const jaPossuiPaginacao =
              'pagina' in novosFiltros || 'tamanhoPagina' in novosFiltros

            // Aplicar filtros diretamente preservando paginação e ordenação
            setFiltrosApi((prev) => {
              const filtrosFinais = {
                ...prev,
                ...novosFiltros,
                pagina: jaPossuiPaginacao
                  ? (novosFiltros.pagina ?? prev.pagina)
                  : 1,
                tamanhoPagina: novosFiltros.tamanhoPagina ?? prev.tamanhoPagina,
                // Preservar ordenação se não foi alterada
                ordenarPor: novosFiltros.ordenarPor ?? prev.ordenarPor,
                direcaoOrdenacao:
                  novosFiltros.direcaoOrdenacao ?? prev.direcaoOrdenacao,
              }

              // Resetar paginação se não é mudança de paginação
              if (!jaPossuiPaginacao) {
                setPaginacao((prevPaginacao) => ({
                  ...prevPaginacao,
                  pagina: 1,
                }))
              }

              return filtrosFinais
            })
          }}
          isLoading={isLoading}
          totalResultados={responseData?.totalRegistros}
        />
      </motion.div>

      {/* Tabela */}
      <TabelaUsuarios
        usuarios={usuariosFiltrados}
        paginacao={paginacao}
        onPaginacaoChange={setPaginacao}
        ordenacao={ordenacao}
        onOrdenacao={handleOrdenacao}
        isLoading={isLoading}
      />
    </div>
  )
}

export default GerenciarUsuariosPage

