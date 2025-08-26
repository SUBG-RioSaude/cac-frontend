import { useQuery } from '@tanstack/react-query';
import { getDocumentos } from '@/modules/Contratos/services/documentos-service';
import { contratoKeys } from '@/modules/Contratos/lib/query-keys';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { isAxiosError } from 'axios';

/**
 * Hook para buscar a lista de documentos de um contrato.
 * @param contratoId - O ID do contrato.
 * @param options - Opções para a query (ex: enabled).
 */
export function useDocumentos(contratoId: string, options?: { enabled?: boolean }) {
  const { handleApiError } = useErrorHandler();

  return useQuery({
    queryKey: contratoKeys.documentos(contratoId),
    queryFn: async () => {
      try {
        const documentos = await getDocumentos(contratoId);
        return documentos;
      } catch (error) {
        // Se for um erro 404, consideramos como um estado válido (sem documentos)
        // e retornamos um array vazio.
        if (isAxiosError(error) && error.response?.status === 404) {
          return []; // Retorna um array vazio em caso de 404
        }
        // Para todos os outros erros, nós os lançamos para o `throwOnError` tratar.
        throw error;
      }
    },
    enabled: options?.enabled ?? !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    throwOnError: (error: unknown) => {
      // O 404 já foi tratado, então este handler só será chamado para outros erros.
      handleApiError(error);
      return true; // Indica que o erro foi tratado
    },
  });
}