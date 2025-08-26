import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import { 
  uploadDocumento, 
  deleteDocumento, 
  updateDocumento, 
  createDocumento,
  type CreateDocumentoPayload
} from '@/modules/Contratos/services/documentos-service'
import type { DocumentoContratoDto } from '@/modules/Contratos/types/contrato'

interface UploadDocumentoData {
  contratoId: string
  formData: FormData
}

interface DeleteDocumentoData {
  documentoId: string
}

interface UpdateDocumentoData {
  documentoId: string
  payload: Partial<Omit<DocumentoContratoDto, 'id' | 'contratoId'>>
}

interface CreateDocumentoData {
  payload: CreateDocumentoPayload
}


/**
 * Hook para fazer upload de um documento para um contrato.
 */
export function useUploadDocumento() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: UploadDocumentoData): Promise<DocumentoContratoDto> => {
      return uploadDocumento(data.contratoId, data.formData)
    },
    onMutate: () => {
      const loadingToast = mutation.loading('Enviando documento...')
      return { loadingToast }
    },
    onSuccess: (data, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento enviado com sucesso!')

      // Invalida a query de documentos para atualizar a lista
      queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(variables.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.error('Falha ao enviar documento', error)
    },
  })
}

/**
 * Hook para excluir um documento de um contrato.
 */
export function useDeleteDocumento() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: DeleteDocumentoData): Promise<void> => {
      return deleteDocumento(data.documentoId)
    },
    onMutate: async (data) => {
      // We need contratoId for invalidation, but it's not in DeleteDocumentoData anymore.
      // This means we need to pass it down from the component or fetch it from cache.
      // For now, we'll assume the component will pass it if needed for optimistic update.
      // Or, we invalidate more broadly.
      const contratoId = queryClient.getQueryData(contratoKeys.documentos(data.documentoId))?.[0]?.contratoId || ''; // Fallback

      const loadingToast = mutation.loading('Excluindo documento...')

      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: contratoKeys.documentos(contratoId) })

      // Snapshot dos dados atuais
      const previousDocumentos = queryClient.getQueryData<DocumentoContratoDto[]>(
        contratoKeys.documentos(contratoId)
      )

      // Optimistic update: remover o documento da lista
      if (previousDocumentos) {
        const newDocumentos = previousDocumentos.filter(doc => doc.id !== data.documentoId)
        queryClient.setQueryData(contratoKeys.documentos(contratoId), newDocumentos)
      }

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento excluído com sucesso!')

      // Invalida a query para garantir consistência, embora já tenhamos feito o optimistic update
      queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context?.contratoId),
      })
    },
    onError: (error, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      // Rollback em caso de erro
      if (context?.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context?.contratoId),
          context.previousDocumentos
        )
      }
      mutation.error('Falha ao excluir documento', error)
    },
  })
}

/**
 * Hook para atualizar um documento de um contrato.
 */
export function useUpdateDocumento() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: UpdateDocumentoData): Promise<DocumentoContratoDto> => {
      return updateDocumento(data.documentoId, data.payload)
    },
    onMutate: async (data) => {
      // We need contratoId for invalidation, but it's not in UpdateDocumentoData anymore.
      // This means we need to pass it down from the component or fetch it from cache.
      const contratoId = queryClient.getQueryData(contratoKeys.documentos(data.documentoId))?.[0]?.contratoId || ''; // Fallback

      const loadingToast = mutation.loading('Atualizando documento...')
      await queryClient.cancelQueries({ queryKey: contratoKeys.documentos(contratoId) })

      const previousDocumentos = queryClient.getQueryData<DocumentoContratoDto[]>(
        contratoKeys.documentos(contratoId)
      )

      // Optimistic update
      if (previousDocumentos) {
        const newDocumentos = previousDocumentos.map(doc =>
          doc.id === data.documentoId ? { ...doc, ...data.payload } : doc
        )
        queryClient.setQueryData(contratoKeys.documentos(contratoId), newDocumentos)
      }

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (data, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: contratoKeys.documentos(context?.contratoId) })
    },
    onError: (error, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      if (context?.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context?.contratoId),
          context.previousDocumentos
        )
      }
      mutation.error('Falha ao atualizar documento', error)
    },
  })
}

/**
 * Hook para criar um registro de documento para um contrato.
 */
export function useCreateDocumento() {
  const queryClient = useQueryClient();
  const { mutation } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDocumentoData): Promise<DocumentoContratoDto> => {
      return createDocumento(data.payload);
    },
    onMutate: async (data) => {
      // We need contratoId for invalidation, but it's not in CreateDocumentoData anymore.
      // It must be in the payload.
      const contratoId = data.payload.contratoId;

      const loadingToast = mutation.loading('Registrando documento...');
      await queryClient.cancelQueries({ queryKey: contratoKeys.documentos(contratoId) });

      // Optimistic update: Add the new document to the list
      const previousDocumentos = queryClient.getQueryData<DocumentoContratoDto[]>(
        contratoKeys.documentos(contratoId)
      );

      if (previousDocumentos) {
        // We don't have the ID yet, so we can't add it optimistically with a real ID.
        // We'll just invalidate and let the query refetch.
        // If we wanted to add optimistically, we'd need a temporary ID.
      }

      return { previousDocumentos, loadingToast, contratoId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast);
      }
      mutation.success('Documento registrado com sucesso!');

      // Invalida a query de documentos para atualizar a lista com o novo documento
      queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context?.contratoId),
      });
    },
    onError: (error, _variables, context) => {
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast);
      }
      // Rollback in case of error (if optimistic update was performed)
      if (context?.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context?.contratoId),
          context.previousDocumentos
        );
      }
      mutation.error('Falha ao registrar documento', error);
    },
  });
}