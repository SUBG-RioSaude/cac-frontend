/**
 * Hooks React Query para Usuários
 */

import { useQuery } from '@tanstack/react-query'

import { usuarioKeys } from '../lib/query-keys'
import { getUsuariosPorSistema } from '../services/usuarios-service'
import type { FiltrosUsuariosApi } from '../types/usuario-api'

interface UseUsuariosOptions {
  enabled?: boolean
  keepPreviousData?: boolean
  refetchOnMount?: boolean
}

export function useUsuarios(
  filtros?: FiltrosUsuariosApi,
  options?: UseUsuariosOptions,
) {
  return useQuery({
    queryKey: usuarioKeys.list(filtros),
    queryFn: async () => {
      return await getUsuariosPorSistema(filtros)
    },
    enabled: options?.enabled ?? true,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  })
}

