import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useToast } from '@/modules/Contratos/hooks/useToast'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import {
  uploadDocumento,
  deleteDocumento,
  updateDocumento,
  createDocumento,
  saveDocumentosMultiplos,
  saveDocumentoStatus,
} from '@/modules/Contratos/services/documentos-service'
import type {
  DocumentoContratoDto,
  CreateDocumentoApiPayload,
  UpdateDocumentoApiPayload,
  SaveDocumentosMultiplosPayload,
  DocumentoMultiplo,
} from '@/modules/Contratos/types/contrato'

interface UploadDocumentoData {
  contratoId: string
  formData: FormData
}

interface DeleteDocumentoData {
  contratoId: string
  documentoId: string
}

interface UpdateDocumentoData {
  contratoId: string
  documentoId: string
  payload: UpdateDocumentoApiPayload
}

interface CreateDocumentoData {
  contratoId: string
  payload: CreateDocumentoApiPayload
}

interface SaveDocumentosMultiplosData {
  contratoId: string
  payload: SaveDocumentosMultiplosPayload
}

interface SaveDocumentoStatusData {
  contratoId: string
  documento: DocumentoMultiplo
}

/**
 * Hook para fazer upload de um documento para um contrato.
 */
export function useUploadDocumento() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (
      data: UploadDocumentoData,
    ): Promise<DocumentoContratoDto> => {
      return uploadDocumento(data.contratoId, data.formData)
    },
    onMutate: () => {
      const loadingToast = mutation.loading('Enviando documento...')
      return { loadingToast }
    },
    onSuccess: (_data, variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento enviado com sucesso!')

      // Invalida a query de documentos para atualizar a lista
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(variables.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.loadingToast) {
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
      const { contratoId } = data

      const loadingToast = mutation.loading('Excluindo documento...')

      // Cancelar queries em andamento
      await queryClient.cancelQueries({
        queryKey: contratoKeys.documentos(contratoId),
      })

      // Snapshot dos dados atuais
      const previousDocumentos = queryClient.getQueryData<
        DocumentoContratoDto[]
      >(contratoKeys.documentos(contratoId))

      // Optimistic update: remover o documento da lista
      if (previousDocumentos) {
        const newDocumentos = previousDocumentos.filter(
          (doc) => doc.id !== data.documentoId,
        )
        queryClient.setQueryData(
          contratoKeys.documentos(contratoId),
          newDocumentos,
        )
      }

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (_data, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento excluído com sucesso!')

      // Invalida a query para garantir consistência, embora já tenhamos feito o optimistic update
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      // Rollback em caso de erro
      if (context.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context.contratoId),
          context.previousDocumentos,
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
    mutationFn: async (
      data: UpdateDocumentoData,
    ): Promise<DocumentoContratoDto> => {
      return updateDocumento(data.documentoId, data.payload)
    },
    onMutate: async (data) => {
      const { contratoId } = data

      const loadingToast = mutation.loading('Atualizando documento...')
      await queryClient.cancelQueries({
        queryKey: contratoKeys.documentos(contratoId),
      })

      const previousDocumentos = queryClient.getQueryData<
        DocumentoContratoDto[]
      >(contratoKeys.documentos(contratoId))

      // Optimistic update
      if (previousDocumentos) {
        const newDocumentos = previousDocumentos.map((doc) =>
          doc.id === data.documentoId ? { ...doc, ...data.payload } : doc,
        )
        queryClient.setQueryData(
          contratoKeys.documentos(contratoId),
          newDocumentos,
        )
      }

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (_data, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento atualizado com sucesso!')
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      if (context.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context.contratoId),
          context.previousDocumentos,
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
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (
      data: CreateDocumentoData,
    ): Promise<DocumentoContratoDto> => {
      return createDocumento(data.payload)
    },
    onMutate: async (data) => {
      const { contratoId } = data

      const loadingToast = mutation.loading('Registrando documento...')
      await queryClient.cancelQueries({
        queryKey: contratoKeys.documentos(contratoId),
      })

      // Optimistic update: Add the new document to the list
      const previousDocumentos = queryClient.getQueryData<
        DocumentoContratoDto[]
      >(contratoKeys.documentos(contratoId))

      if (previousDocumentos) {
        // We don't have the ID yet, so we can't add it optimistically with a real ID.
        // We'll just invalidate and let the query refetch.
        // If we wanted to add optimistically, we'd need a temporary ID.
      }

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (_data, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documento registrado com sucesso!')

      // Invalida a query de documentos para atualizar a lista com o novo documento
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      // Rollback in case of error (if optimistic update was performed)
      if (context.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context.contratoId),
          context.previousDocumentos,
        )
      }
      mutation.error('Falha ao registrar documento', error)
    },
  })
}

/**
 * Hook para salvar múltiplos documentos em lote.
 */
export function useUpdateDocumentosMultiplos() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (
      data: SaveDocumentosMultiplosData,
    ): Promise<DocumentoContratoDto[]> => {
      return saveDocumentosMultiplos(data.contratoId, data.payload)
    },
    onMutate: async (data) => {
      const { contratoId } = data
      const loadingToast = mutation.loading('Salvando documentos...')

      await queryClient.cancelQueries({
        queryKey: contratoKeys.documentos(contratoId),
      })

      const previousDocumentos = queryClient.getQueryData<
        DocumentoContratoDto[]
      >(contratoKeys.documentos(contratoId))

      return { previousDocumentos, loadingToast, contratoId }
    },
    onSuccess: (_data, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      mutation.success('Documentos salvos com sucesso!')

      // Invalidar cache para buscar dados atualizados
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }
      if (context.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context.contratoId),
          context.previousDocumentos,
        )
      }
      mutation.error('Falha ao salvar documentos', error)
    },
  })
}

/**
 * Hook para salvar status de entrega de um documento específico.
 */
export function useUpdateDocumentoStatus() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (
      data: SaveDocumentoStatusData,
    ): Promise<DocumentoContratoDto[]> => {
      return saveDocumentoStatus(data.contratoId, data.documento)
    },
    onMutate: async (data) => {
      const { contratoId } = data

      await queryClient.cancelQueries({
        queryKey: contratoKeys.documentos(contratoId),
      })

      const previousDocumentos = queryClient.getQueryData<
        DocumentoContratoDto[]
      >(contratoKeys.documentos(contratoId))

      return { previousDocumentos, contratoId }
    },
    onSuccess: (_data, _variables, context) => {
      mutation.success('Status atualizado com sucesso!')

      // Invalidar cache para buscar dados atualizados
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.documentos(context.contratoId),
      })
    },
    onError: (error, _variables, context) => {
      if (context.previousDocumentos) {
        queryClient.setQueryData(
          contratoKeys.documentos(context.contratoId),
          context.previousDocumentos,
        )
      }
      mutation.error('Falha ao atualizar status', error)
    },
  })
}
