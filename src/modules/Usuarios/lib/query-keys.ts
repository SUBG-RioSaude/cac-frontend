/**
 * Query keys para React Query - Usuários
 */

import type { FiltrosUsuariosApi } from '../types/usuario-api'

export const usuarioKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuarioKeys.all, 'list'] as const,
  list: (filtros?: FiltrosUsuariosApi) =>
    [...usuarioKeys.lists(), filtros] as const,
  details: () => [...usuarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuarioKeys.details(), id] as const,
}

