import { executeWithFallback } from '@/lib/axios'
import type { DocumentoContratoDto } from '@/modules/Contratos/types/contrato'

// Define the payload for creating a document
export interface CreateDocumentoPayload {
  contratoId: string;
  tipoDocumento: number; // Changed from 'tipo: string' to 'tipoDocumento: number'
  urlDocumento: string; // Changed from 'linkExterno: string' to 'urlDocumento: string'
  dataEntrega: string; // ISO Date
  observacoes?: string;
  // Removed 'nome' and 'status' as they are not in the API's POST payload example
}

/**
 * Busca a lista de documentos de um contrato específico.
 * @param contratoId - O ID do contrato.
 * @returns Uma promessa que resolve para um array de DocumentoContratoDto.
 */
export async function getDocumentos(contratoId: string): Promise<DocumentoContratoDto[]> {
  if (!contratoId) {
    return Promise.resolve([])
  }
  const response = await executeWithFallback<DocumentoContratoDto[]>({
    method: 'get',
    url: `/documentos-contrato/contrato/${contratoId}`,
  })
  return response.data
}

/**
 * Realiza o upload de um novo documento para um contrato.
 * NOTE: This function might become obsolete if file uploads are handled via createDocumento with linkExterno.
 * Keeping it for now as it was part of previous implementation.
 * @param contratoId - O ID do contrato.
 * @param data - FormData contendo o arquivo e metadados (como tipoDocumento).
 * @returns Uma promessa que resolve para o DocumentoContratoDto do arquivo criado.
 */
export async function uploadDocumento(contratoId: string, data: FormData): Promise<DocumentoContratoDto> {
  const response = await executeWithFallback<DocumentoContratoDto>({
    method: 'post',
    url: `/documentos-contrato`,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Exclui um documento.
 * @param documentoId - O ID do documento a ser excluído.
 * @returns Uma promessa que resolve quando a operação é concluída.
 */
export async function deleteDocumento(documentoId: string): Promise<void> {
  await executeWithFallback<void>({
    method: 'delete',
    url: `/documentos-contrato/${documentoId}`,
  })
}

/**
 * Atualiza um documento existente.
 * @param documentoId - O ID do documento.
 * @param payload - Os dados a serem atualizados.
 * @returns Uma promessa que resolve para o DocumentoContratoDto atualizado.
 */
export async function updateDocumento(
  documentoId: string,
  payload: Partial<{ urlDocumento: string; dataEntrega: string; observacoes: string; }>
): Promise<DocumentoContratoDto> {
  const response = await executeWithFallback<DocumentoContratoDto>({
    method: 'put', // Changed from PATCH to PUT as per doc
    url: `/documentos-contrato/${documentoId}`,
    data: payload,
  })
  return response.data
}

/**
 * Cria um novo registro de documento.
 * @param payload - Os dados do documento a ser criado, incluindo contratoId.
 * @returns Uma promessa que resolve para o DocumentoContratoDto criado.
 */
export async function createDocumento(
  payload: CreateDocumentoPayload
): Promise<DocumentoContratoDto> {
  const response = await executeWithFallback<DocumentoContratoDto>({
    method: 'post',
    url: `/documentos-contrato`,
    data: payload,
  })
  return response.data
}