/**
 * Exportações centralizadas dos hooks de contratos
 * Facilita importação e manutenção
 */

// Hooks de queries (busca de dados)
export { 
  useContratos, 
  useContrato, 
  useContratosVencendo, 
  useContratosVencidos 
} from './use-contratos'
export { useDocumentos } from './use-documentos'

// Hooks de mutations (modificação de dados)
export { 
  useCreateContrato,
  useUpdateContrato, 
  useDeleteContrato,
  useSuspendContrato,
  useReactivateContrato,
  useEncerrarContrato
} from './use-contratos-mutations'
export { useUploadDocumento, useDeleteDocumento, useUpdateDocumento, useCreateDocumento } from './use-documentos-mutations'

// Hook de toast melhorado
export { useToast } from './useToast'

// Query keys para invalidação manual quando necessário
export { contratoKeys } from '../lib/query-keys'
