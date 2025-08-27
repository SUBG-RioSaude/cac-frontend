/**
 * Exportações centralizadas dos hooks de contratos
 * Facilita importação e manutenção
 */

// Hooks de Contratos
export { useContratos, useContrato, useContratosVencendo, useContratosVencidos } from './use-contratos'
export { useCreateContrato, useUpdateContrato, useDeleteContrato } from './use-contratos-mutations'

// Hooks de Empresas/Fornecedores
export { 
  useConsultarEmpresaPorCNPJ, 
  useCadastrarEmpresa, 
  useEmpresa, 
  useEmpresas 
} from './use-empresas'
export { useDocumentos } from './use-documentos'

// Hooks de Timeline
export { useTimelineIntegration } from './useTimelineIntegration'
export { useUploadDocumento, useDeleteDocumento, useUpdateDocumento, useCreateDocumento, useUpdateDocumentosMultiplos, useUpdateDocumentoStatus } from './use-documentos-mutations'

// Hooks de Toast
export { useToast } from './useToast'

// Query keys para invalidação manual quando necessário
export { contratoKeys } from '../lib/query-keys'
