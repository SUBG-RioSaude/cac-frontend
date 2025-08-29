/**
 * Serviços da API de Alterações Contratuais
 * Integração com TanStack Query e executeWithFallback
 * Baseado na documentação task174.md e DOCUMENTACAO_FRONTEND_ALTERACOES_CONTRATUAIS.md
 */

import { executeWithFallback } from '@/lib/axios'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualResponse,
  ResumoAlteracaoResponse,
  TipoAlteracaoConfig,
  FiltrosAlteracoesContratuais,
  WorkflowStatusResponse,
  AlertaLimiteLegal
} from '../types/alteracoes-contratuais'
import { transformToApiPayload } from '../types/alteracoes-contratuais'
import { StatusAlteracaoContratual } from '../types/alteracoes-contratuais'

// ========== TIPOS ESPECÍFICOS DA API ==========

interface PaginacaoResponse<T> {
  dados: T[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

interface CriarAlteracaoRequest {
  contratoId: string
  tiposAlteracao: number[]
  dadosBasicos: {
    justificativa: string
    fundamentoLegal?: string
    observacoes?: string
  }
  blocos: {
    clausulas?: {
      clausulasAlteradas: Array<{
        numeroClausula: string
        textoOriginal: string
        textoAlterado: string
        tipoAlteracao: 'substituir' | 'incluir' | 'excluir'
      }>
    }
    vigencia?: {
      operacao: number // OperacaoVigencia
      dataInicio?: string
      dataFim?: string
      periodoSuspensao?: {
        dataInicio: string
        dataFim: string
      }
    }
    valor?: {
      operacao: number // OperacaoValor
      valor: number
      percentual?: number
    }
    fornecedores?: {
      operacao: number // OperacaoFornecedor
      fornecedoresAfetados: Array<{
        id: string
        nome: string
        cnpj: string
      }>
    }
    unidades?: {
      operacao: number // OperacaoUnidade
      unidadesAfetadas: Array<{
        id: string
        nome: string
        codigo: string
      }>
    }
  }
}

interface AtualizarAlteracaoRequest extends Partial<CriarAlteracaoRequest> {
  id: string
}

// ========== OPERAÇÕES PRINCIPAIS ==========

/**
 * Lista alterações contratuais com filtros e paginação
 * GET /api/contratos/{contratoId}/alteracoes
 */
export async function getAlteracoesContratuais(
  contratoId: string,
  filtros?: FiltrosAlteracoesContratuais
): Promise<PaginacaoResponse<AlteracaoContratualResponse>> {
  const response = await executeWithFallback<PaginacaoResponse<AlteracaoContratualResponse>>({
    method: 'get',
    url: `/contratos/${contratoId}/alteracoes`,
    params: {
      pagina: filtros?.pagina || 1,
      tamanhoPagina: filtros?.tamanhoPagina || 10,
      status: filtros?.status,
      tipoAlteracao: filtros?.tipoAlteracao,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      ordenarPor: filtros?.ordenarPor || 'dataCriacao',
      direcaoOrdenacao: filtros?.direcaoOrdenacao || 'desc'
    },
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Busca alteração contratual por ID
 * GET /api/alteracoes-contratuais/{id}
 */
export async function getAlteracaoContratualById(
  id: string
): Promise<AlteracaoContratualResponse> {
  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'get',
    url: `/alteracoes-contratuais/${id}`,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Cria nova alteração contratual
 * POST /api/alteracoes-contratuais
 * Retorna HTTP 201 (sucesso) ou HTTP 202 (alerta de limite legal)
 */
export async function criarAlteracaoContratual(
  contratoId: string,
  dados: AlteracaoContratualForm
): Promise<{
  alteracao: AlteracaoContratualResponse
  alertaLimiteLegal?: AlertaLimiteLegal
  status: number
}> {
  // Usar transformação para converter dados do frontend para payload da API
  const payload = transformToApiPayload(dados)
  
  console.log('🔧 Criando alteração contratual:')
  console.log('   - contratoId:', contratoId)
  console.log('   - dados originais:', dados)
  console.log('   - payload para API:', payload)

  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'post',
    url: `/alteracoes-contratuais`,
    data: payload,
    baseURL: import.meta.env.VITE_API_URL
  })

  // Status 202 indica alerta de limite legal
  if (response.status === 202) {
    const alertaResponse = await executeWithFallback<AlertaLimiteLegal>({
      method: 'get',
      url: `/alteracoes-contratuais/${response.data.id}/alerta-limite`,
      baseURL: import.meta.env.VITE_API_URL
    })

    return {
      alteracao: response.data,
      alertaLimiteLegal: alertaResponse.data,
      status: 202
    }
  }

  return {
    alteracao: response.data,
    status: 201
  }
}

/**
 * Confirma alteração com limite legal excedido
 * POST /api/alteracoes-contratuais/{id}/confirmar-limite
 */
export async function confirmarLimiteLegal(
  id: string,
  confirmacao: {
    confirmado: boolean
    justificativaAdicional?: string
  }
): Promise<AlteracaoContratualResponse> {
  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'post',
    url: `/alteracoes-contratuais/${id}/confirmar-limite`,
    data: confirmacao,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Atualiza alteração contratual existente
 * PUT /api/alteracoes-contratuais/{id}
 */
export async function atualizarAlteracaoContratual(
  id: string,
  dados: Partial<AlteracaoContratualForm>
): Promise<AlteracaoContratualResponse> {
  const payload: AtualizarAlteracaoRequest = {
    id,
    ...dados
  }

  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'put',
    url: `/alteracoes-contratuais/${id}`,
    data: payload,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Exclui alteração contratual
 * DELETE /api/alteracoes-contratuais/{id}
 */
export async function excluirAlteracaoContratual(id: string): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/alteracoes-contratuais/${id}`,
    baseURL: import.meta.env.VITE_API_URL
  })
}

// ========== OPERAÇÕES DE WORKFLOW ==========

/**
 * Submete alteração para aprovação
 * POST /api/alteracoes-contratuais/{id}/submeter
 */
export async function submeterParaAprovacao(
  id: string,
  dados: {
    comentarios?: string
    documentosAnexos?: string[]
  }
): Promise<AlteracaoContratualResponse> {
  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'post',
    url: `/alteracoes-contratuais/${id}/submeter`,
    data: dados,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Aprova alteração contratual
 * POST /api/alteracoes-contratuais/{id}/aprovar
 */
export async function aprovarAlteracao(
  id: string,
  dados: {
    comentarios?: string
    condicoes?: string[]
  }
): Promise<AlteracaoContratualResponse> {
  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'post',
    url: `/alteracoes-contratuais/${id}/aprovar`,
    data: dados,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Rejeita alteração contratual
 * POST /api/alteracoes-contratuais/{id}/rejeitar
 */
export async function rejeitarAlteracao(
  id: string,
  dados: {
    motivo: string
    comentarios?: string
  }
): Promise<AlteracaoContratualResponse> {
  const response = await executeWithFallback<AlteracaoContratualResponse>({
    method: 'post',
    url: `/alteracoes-contratuais/${id}/rejeitar`,
    data: dados,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Busca histórico do workflow
 * GET /api/alteracoes-contratuais/{id}/workflow
 */
export async function getWorkflowStatus(id: string): Promise<WorkflowStatusResponse[]> {
  const response = await executeWithFallback<WorkflowStatusResponse[]>({
    method: 'get',
    url: `/alteracoes-contratuais/${id}/workflow`,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

// ========== OPERAÇÕES AUXILIARES ==========

/**
 * Gera resumo do impacto da alteração
 * POST /api/alteracoes-contratuais/preview
 */
export async function gerarResumoAlteracao(
  contratoId: string,
  dados: AlteracaoContratualForm
): Promise<ResumoAlteracaoResponse> {
  const response = await executeWithFallback<ResumoAlteracaoResponse>({
    method: 'post',
    url: '/alteracoes-contratuais/preview',
    data: {
      ...dados,
      contratoId
    },
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Busca configuração dos tipos de alteração disponíveis
 * GET /api/alteracoes-contratuais/tipos
 */
export async function getTiposAlteracaoConfig(): Promise<Record<number, TipoAlteracaoConfig>> {
  const response = await executeWithFallback<Record<number, TipoAlteracaoConfig>>({
    method: 'get',
    url: '/alteracoes-contratuais/tipos',
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

/**
 * Busca documentos anexos de uma alteração
 * GET /api/alteracoes-contratuais/{id}/documentos
 */
export async function getDocumentosAlteracao(id: string): Promise<{
  documentos: Array<{
    id: string
    nome: string
    tipo: string
    tamanho: number
    url: string
    dataCriacao: string
  }>
}> {
  const response = await executeWithFallback<{
    documentos: Array<{
      id: string
      nome: string
      tipo: string
      tamanho: number
      url: string
      dataCriacao: string
    }>
  }>({
    method: 'get',
    url: `/alteracoes-contratuais/${id}/documentos`,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

// ========== FUNÇÕES DE BUSCA ==========

/**
 * Busca alterações por status específico
 */
export async function getAlteracoesPorStatus(
  contratoId: string,
  status: StatusAlteracaoContratual,
  limite = 10
): Promise<AlteracaoContratualResponse[]> {
  const response = await getAlteracoesContratuais(contratoId, {
    status,
    tamanhoPagina: limite,
    pagina: 1
  })

  return response.dados
}

/**
 * Busca alterações pendentes de aprovação
 */
export async function getAlteracoesPendentes(
  contratoId: string
): Promise<AlteracaoContratualResponse[]> {
  return getAlteracoesPorStatus(contratoId, StatusAlteracaoContratual.AguardandoAprovacao)
}

/**
 * Busca alterações ativas/vigentes
 */
export async function getAlteracoesAtivas(
  contratoId: string
): Promise<AlteracaoContratualResponse[]> {
  return getAlteracoesPorStatus(contratoId, StatusAlteracaoContratual.Ativa)
}