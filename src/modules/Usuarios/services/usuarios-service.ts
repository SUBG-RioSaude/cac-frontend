import axios from 'axios'

import { getToken } from '@/lib/auth/auth'
import { createServiceLogger } from '@/lib/logger'

import type {
  UsuariosPaginacaoResponse,
  FiltrosUsuariosApi,
} from '../types/usuario-api'

const logger = createServiceLogger('usuarios-service')

const API_URL = import.meta.env.VITE_API_URL_AUTH as string
const SISTEMA_ID = import.meta.env.VITE_SYSTEM_ID as string

// Cliente axios para API de autenticação
const usuariosApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
usuariosApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Buscar usuários por sistema com filtros e paginação
 */
export async function getUsuariosPorSistema(
  filtros: FiltrosUsuariosApi = {},
): Promise<UsuariosPaginacaoResponse> {
  try {
    const params: Record<string, unknown> = {
      pagina: filtros.pagina ?? 1,
      tamanhoPagina: filtros.tamanhoPagina ?? 20,
    }

    // Adicionar filtros opcionais
    if (filtros.busca) {
      params.busca = filtros.busca
    }

    if (filtros.permissaoId) {
      params.permissaoId = filtros.permissaoId
    }

    if (filtros.ativo !== undefined && filtros.ativo !== null) {
      params.ativo = filtros.ativo
    }

    if (filtros.loginRecente !== undefined && filtros.loginRecente !== null) {
      params.loginRecente = filtros.loginRecente
    }

    if (filtros.ordenarPor) {
      params.ordenarPor = filtros.ordenarPor
    }

    if (filtros.direcaoOrdenacao) {
      params.direcaoOrdenacao = filtros.direcaoOrdenacao
    }

    logger.info(
      { sistemaId: SISTEMA_ID, params },
      'Buscando usuários por sistema',
    )

    const response = await usuariosApi.get<unknown>(
      `/api/usuarios/por-sistema/${SISTEMA_ID}`,
      { params },
    )

    const responseData = response.data

    logger.debug({ responseData }, 'Resposta da API de usuários')

    // Estrutura esperada: { dados: { sistemaId, quantidadeUsuarios, usuarios: [...] }, ... }
    let usuarios: unknown[] = []
    let totalRegistros = 0

    // Prioridade 1: Verificar se tem estrutura com 'dados' contendo 'usuarios'
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'dados' in responseData
    ) {
      const dadosWrapper = (responseData as { dados: unknown }).dados
      if (
        typeof dadosWrapper === 'object' &&
        dadosWrapper !== null &&
        'usuarios' in dadosWrapper &&
        Array.isArray((dadosWrapper as { usuarios: unknown }).usuarios)
      ) {
        const { usuarios: usuariosWrapper } = dadosWrapper as {
          usuarios: unknown[]
        }
        usuarios = usuariosWrapper
        const { quantidadeUsuarios } = dadosWrapper as {
          quantidadeUsuarios?: number
        }
        totalRegistros = quantidadeUsuarios ?? usuarios.length
      }
    }

    // Prioridade 2: Verificar se 'usuarios' está no nível raiz
    if (
      usuarios.length === 0 &&
      typeof responseData === 'object' &&
      responseData !== null &&
      'usuarios' in responseData &&
      Array.isArray((responseData as { usuarios: unknown }).usuarios)
    ) {
      const { usuarios: usuariosRoot } = responseData as {
        usuarios: unknown[]
      }
      usuarios = usuariosRoot
      const { quantidadeUsuarios: quantidadeRoot } = responseData as {
        quantidadeUsuarios?: number
      }
      totalRegistros = quantidadeRoot ?? usuarios.length
    }

    // Se encontrou usuários, aplicar filtros no frontend e monta a estrutura de paginação
    if (usuarios.length > 0) {
      let usuariosFiltrados = usuarios as UsuariosPaginacaoResponse['dados']

      // Aplicar filtros no frontend (já que a API retorna todos)
      if (filtros.busca) {
        const buscaLower = filtros.busca.toLowerCase()
        usuariosFiltrados = usuariosFiltrados.filter(
          (usuario) =>
            (usuario.nomeCompleto?.toLowerCase().includes(buscaLower) ?? false) ||
            (usuario.email?.toLowerCase().includes(buscaLower) ?? false),
        )
      }

      if (filtros.ativo !== undefined && filtros.ativo !== null) {
        usuariosFiltrados = usuariosFiltrados.filter(
          (usuario) => usuario.ativo === filtros.ativo,
        )
      }

      // Ordenação
      if (filtros.ordenarPor) {
        usuariosFiltrados = [...usuariosFiltrados].sort((a, b) => {
          let valorA: unknown
          let valorB: unknown

          switch (filtros.ordenarPor) {
            case 'nome':
              valorA = a.nomeCompleto ?? ''
              valorB = b.nomeCompleto ?? ''
              break
            case 'email':
              valorA = a.email ?? ''
              valorB = b.email ?? ''
              break
            case 'ultimoLogin':
              valorA = a.ultimoLogin
                ? new Date(a.ultimoLogin).getTime()
                : 0
              valorB = b.ultimoLogin
                ? new Date(b.ultimoLogin).getTime()
                : 0
              break
            case 'ativo':
              valorA = a.ativo ? 1 : 0
              valorB = b.ativo ? 1 : 0
              break
            default:
              return 0
          }

          if (typeof valorA === 'string' && typeof valorB === 'string') {
            return filtros.direcaoOrdenacao === 'desc'
              ? valorB.localeCompare(valorA)
              : valorA.localeCompare(valorB)
          }

          if (typeof valorA === 'number' && typeof valorB === 'number') {
            return filtros.direcaoOrdenacao === 'desc'
              ? valorB - valorA
              : valorA - valorB
          }

          return 0
        })
      }

      // Filtro de login recente
      if (filtros.loginRecente !== undefined && filtros.loginRecente !== null) {
        usuariosFiltrados = [...usuariosFiltrados].sort((a, b) => {
          const dataA = a.ultimoLogin
            ? new Date(a.ultimoLogin).getTime()
            : 0
          const dataB = b.ultimoLogin
            ? new Date(b.ultimoLogin).getTime()
            : 0

          return filtros.loginRecente
            ? dataB - dataA // Mais recentes primeiro
            : dataA - dataB // Menos recentes primeiro
        })
      }

      // Atualizar total após filtros
      totalRegistros = usuariosFiltrados.length

      // Aplicar paginação
      const pagina = filtros.pagina ?? 1
      const tamanhoPagina = filtros.tamanhoPagina ?? 20
      const totalPaginas = Math.ceil(totalRegistros / tamanhoPagina)

      const inicio = (pagina - 1) * tamanhoPagina
      const fim = inicio + tamanhoPagina
      const usuariosPaginados = usuariosFiltrados.slice(inicio, fim)

      const resultado: UsuariosPaginacaoResponse = {
        dados: usuariosPaginados,
        pagina,
        tamanhoPagina,
        totalRegistros,
        totalPaginas,
      }

      logger.info(
        {
          totalRegistros: resultado.totalRegistros,
          pagina: resultado.pagina,
          usuariosRetornados: usuariosPaginados.length,
          filtrosAplicados: {
            busca: filtros.busca,
            ativo: filtros.ativo,
            ordenarPor: filtros.ordenarPor,
          },
        },
        'Usuários recuperados com sucesso',
      )

      return resultado
    }

    throw new Error('Formato de resposta da API de usuários não reconhecido')
  } catch (erro: unknown) {
    logger.error({ erro }, 'Erro ao buscar usuários por sistema')

    if (axios.isAxiosError(erro) && erro.response) {
      const mensagem =
        (erro.response.data as { message?: string })?.message ??
        'Erro ao buscar usuários'
      throw new Error(mensagem)
    }

    throw new Error('Erro de conexão com o servidor')
  }
}

