import { useQuery } from '@tanstack/react-query'

import { permissoesCadastroService } from '../services/permissoes-cadastro-service'

const VITE_SYSTEM_ID = import.meta.env.VITE_SYSTEM_ID as string

if (!VITE_SYSTEM_ID || VITE_SYSTEM_ID === 'undefined') {
  throw new Error(
    'VITE_SYSTEM_ID não configurada. Adicione VITE_SYSTEM_ID=<guid-do-sistema> no arquivo .env',
  )
}

/**
 * Hook para buscar permissões do sistema atual e informações do sistema
 *
 * Busca em paralelo:
 * - Lista de todas as permissões disponíveis (GET /api/permissoes)
 * - Informações do sistema atual (GET /api/sistemas/{VITE_SYSTEM_ID})
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePermissoesSistema()
 *
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 *
 * return (
 *   <div>
 *     <h2>{data.sistema.nome}</h2>
 *     {data.permissoes.map(p => (
 *       <div key={p.id}>{p.nome}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const usePermissoesSistema = () => {
  return useQuery({
    queryKey: ['permissoes-sistema', VITE_SYSTEM_ID],
    queryFn: async () => {
      // Busca permissões e sistema em paralelo
      const [permissoesResponse, sistemaResponse] = await Promise.all([
        permissoesCadastroService.listarPermissoes(),
        permissoesCadastroService.buscarSistema(VITE_SYSTEM_ID),
      ])

      if (!permissoesResponse.sucesso) {
        throw new Error(
          permissoesResponse.mensagem ?? 'Erro ao buscar permissões',
        )
      }

      if (!sistemaResponse.sucesso || !sistemaResponse.dados) {
        throw new Error(
          sistemaResponse.mensagem ?? 'Erro ao buscar sistema',
        )
      }

      return {
        permissoes: permissoesResponse.dados.items || [],
        sistema: sistemaResponse.dados,
        sistemaId: VITE_SYSTEM_ID,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (permissões não mudam com frequência)
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}
