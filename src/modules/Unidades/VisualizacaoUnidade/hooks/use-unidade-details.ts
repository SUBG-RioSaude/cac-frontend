import { useQuery } from '@tanstack/react-query'
import { getUnidadeById } from '@/modules/Unidades/services/unidades-service'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

export function useUnidadeDetails(unidadeId: string) {
  return useQuery<UnidadeSaudeApi>({
    queryKey: ['unidade', unidadeId],
    queryFn: () => getUnidadeById(unidadeId),
    enabled: !!unidadeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}