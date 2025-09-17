import { executeWithFallback } from '@/lib/axios'
import type { 
  DocumentoContratoDto, 
  DocumentoApiResponse, 
  CreateDocumentoApiPayload,
  UpdateDocumentoApiPayload,
  SaveDocumentosMultiplosPayload,
  DocumentoMultiplo
} from '@/modules/Contratos/types/contrato'

// Mapeamento de nomes de tipos para números
const TIPO_DOCUMENTO_NOME_PARA_NUMERO: Record<string, number> = {
  'TermoReferencia': 1,
  'Homologacao': 2,
  'AtaRegistroPrecos': 3,
  'GarantiaContratual': 4,
  'Contrato': 5,
  'PublicacaoPNCP': 6,
  'PublicacaoExtrato': 7,
  'Proposta': 8,
}

// Função para mapear resposta da API para DTO do frontend
function mapearDocumentoApiParaDto(documento: DocumentoApiResponse): DocumentoContratoDto {
  const tipoNumero = TIPO_DOCUMENTO_NOME_PARA_NUMERO[documento.tipoDocumento] || 0
  
  return {
    id: documento.id,
    contratoId: documento.contratoId,
    nome: documento.nomeTipoDocumento || documento.tipoDocumento,
    tipo: tipoNumero.toString(),
    categoria: 'obrigatorio', // Todos os tipos 1-7 são obrigatórios
    linkExterno: documento.urlDocumento !== 'sem url' ? documento.urlDocumento : null,
    status: documento.ativo ? 'conferido' : 'pendente',
    observacoes: documento.observacoes || '',
    dataCadastro: documento.dataCadastro,
    dataAtualizacao: documento.dataAtualizacao,
  }
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
  
  const response = await executeWithFallback<DocumentoApiResponse[]>({
    method: 'get',
    url: `/documentos-contrato/contrato/${contratoId}`,
  })
  
  // Mapear resposta da API para o DTO do frontend
  return response.data.map(mapearDocumentoApiParaDto)
}

/**
 * Realiza o upload de um novo documento para um contrato.
 * NOTE: This function might become obsolete if file uploads are handled via createDocumento with linkExterno.
 * Keeping it for now as it was part of previous implementation.
 * @param contratoId - O ID do contrato.
 * @param data - FormData contendo o arquivo e metadados (como tipoDocumento).
 * @returns Uma promessa que resolve para o DocumentoContratoDto do arquivo criado.
 */
export async function uploadDocumento(_contratoId: string, data: FormData): Promise<DocumentoContratoDto> {
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
 * Salva múltiplos documentos de um contrato em lote.
 * @param contratoId - O ID do contrato.
 * @param payload - Array com todos os 7 tipos de documento.
 * @returns Uma promessa que resolve para o array atualizado.
 */
export async function saveDocumentosMultiplos(
  contratoId: string,
  payload: SaveDocumentosMultiplosPayload
): Promise<DocumentoContratoDto[]> {
  const response = await executeWithFallback<DocumentoApiResponse[]>({
    method: 'post',
    url: `/documentos-contrato/contrato/${contratoId}/multiplos`,
    data: payload,
  })
  
  // Mapear resposta para DTOs do frontend
  return response.data.map(mapearDocumentoApiParaDto)
}

/**
 * Salva o status de entrega de um documento específico.
 * @param contratoId - O ID do contrato.
 * @param documento - Documento com status atualizado.
 * @returns Uma promessa que resolve para o array atualizado.
 */
export async function saveDocumentoStatus(
  contratoId: string,
  documento: DocumentoMultiplo
): Promise<DocumentoContratoDto[]> {
  const payload: SaveDocumentosMultiplosPayload = {
    documentos: [documento]
  }
  
  const response = await executeWithFallback<DocumentoApiResponse[]>({
    method: 'post',
    url: `/documentos-contrato/contrato/${contratoId}/multiplos`,
    data: payload,
  })
  
  return response.data.map(mapearDocumentoApiParaDto)
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
  payload: UpdateDocumentoApiPayload
): Promise<DocumentoContratoDto> {
  const response = await executeWithFallback<DocumentoApiResponse>({
    method: 'put',
    url: `/documentos-contrato/${documentoId}`,
    data: payload,
  })
  
  return mapearDocumentoApiParaDto(response.data)
}

/**
 * Cria um novo registro de documento.
 * @param payload - Os dados do documento a ser criado, incluindo contratoId.
 * @returns Uma promessa que resolve para o DocumentoContratoDto criado.
 */
export async function createDocumento(
  payload: CreateDocumentoApiPayload
): Promise<DocumentoContratoDto> {
  const response = await executeWithFallback<DocumentoApiResponse>({
    method: 'post',
    url: `/documentos-contrato`,
    data: payload,
  })
  
  return mapearDocumentoApiParaDto(response.data)
}