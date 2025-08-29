/**
 * Serviços para o módulo de Empresas
 * Integra com a API usando executeWithFallback para resiliência
 */

import { executeWithFallback } from '@/lib/axios'
import type { 
  EmpresaRequest, 
  EmpresaResponse, 
  AtualizarEmpresaDto,
  PaginacaoEmpresasResponse,
  EmpresaParametros,
  CriarContatoDto,
  AtualizarContatoDto,
  ContatoResponse,
  PaginacaoFornecedoresApi
} from '../types/empresa'
import type { FiltrosFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'

// ========== FUNÇÕES EXISTENTES (PRESERVADAS) ==========

/**
 * Cadastra uma nova empresa/fornecedor
 */
export async function cadastrarEmpresa(
  dadosEmpresa: EmpresaRequest,
): Promise<EmpresaResponse> {
  const response = await executeWithFallback<EmpresaResponse>({
    method: 'post',
    url: '/Empresas',
    data: dadosEmpresa,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Consulta empresa por CNPJ
 */
export async function consultarEmpresaPorCNPJ(
  cnpj: string
): Promise<EmpresaResponse | null> {
  try {
    const response = await executeWithFallback<EmpresaResponse>({
      method: 'get',
      url: `/Empresas/cnpj/${cnpj}`,
      baseURL: import.meta.env.VITE_API_URL_EMPRESA
    })
    return response.data
  } catch (error) {
    // Se retornar 404, significa que a empresa não foi encontrada
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number } }
      if (axiosError.response?.status === 404) {
        return null
      }
    }
    throw error
  }
}

// ========== NOVAS FUNÇÕES BASEADAS NA API ==========

/**
 * Lista empresas com paginação e filtros
 * GET /api/Empresas
 */
export async function getEmpresas(
  parametros?: EmpresaParametros
): Promise<PaginacaoEmpresasResponse> {
  const response = await executeWithFallback<PaginacaoEmpresasResponse>({
    method: 'get',
    url: '/Empresas',
    params: {
      pagina: parametros?.pagina || 1,
      tamanhoPagina: parametros?.tamanhoPagina || 10,
      ...parametros
    },
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Busca empresa por ID
 * GET /api/Empresas/{id}
 */
export async function getEmpresaById(id: string): Promise<EmpresaResponse> {
  const response = await executeWithFallback<EmpresaResponse>({
    method: 'get',
    url: `/Empresas/${id}`,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Atualiza empresa existente
 * PUT /api/Empresas/{id}
 */
export async function updateEmpresa(
  id: string, 
  dados: AtualizarEmpresaDto
): Promise<EmpresaResponse> {
  const response = await executeWithFallback<EmpresaResponse>({
    method: 'put',
    url: `/Empresas/${id}`,
    data: dados,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Exclui empresa
 * DELETE /api/Empresas/{id}
 */
export async function deleteEmpresa(id: string): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/Empresas/${id}`,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
}

/**
 * Busca status de empresas
 * GET /api/Empresas/status
 */
export async function getEmpresasStatus(): Promise<{ [key: string]: number }> {
  const response = await executeWithFallback<{ [key: string]: number }>({
    method: 'get',
    url: '/Empresas/status',
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

// ========== SERVIÇOS DE CONTATOS ==========

/**
 * Cria novo contato para empresa
 * POST /api/empresas/{empresaId}/contatos
 */
export async function createContato(
  empresaId: string, 
  contato: CriarContatoDto
): Promise<ContatoResponse> {
  const response = await executeWithFallback<ContatoResponse>({
    method: 'post',
    url: `/empresas/${empresaId}/contatos`,
    data: contato,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Atualiza contato existente
 * PUT /api/empresas/{empresaId}/contatos/{contatoId}
 */
export async function updateContato(
  empresaId: string,
  contatoId: string,
  contato: AtualizarContatoDto
): Promise<ContatoResponse> {
  const response = await executeWithFallback<ContatoResponse>({
    method: 'put',
    url: `/empresas/${empresaId}/contatos/${contatoId}`,
    data: contato,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}

/**
 * Exclui contato
 * DELETE /api/empresas/{empresaId}/contatos/{contatoId}
 */
export async function deleteContato(
  empresaId: string, 
  contatoId: string
): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/empresas/${empresaId}/contatos/${contatoId}`,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
}

// ========== SERVIÇOS PARA FORNECEDORES RESUMO ==========

/**
 * Lista fornecedores com resumo de contratos
 * GET /api/empresas/resumo-contratos
 */
export async function getFornecedoresResumo(
  filtros?: FiltrosFornecedorApi
): Promise<PaginacaoFornecedoresApi> {
  const response = await executeWithFallback<PaginacaoFornecedoresApi>({
    method: 'get',
    url: '/empresas/resumo-contratos',
    params: {
      pagina: filtros?.pagina || 1,
      tamanhoPagina: filtros?.tamanhoPagina || 10,
      ...(filtros?.pesquisa && { pesquisa: filtros.pesquisa }),
      ...(filtros?.status && { status: filtros.status }),
      ...(filtros?.cidade && { cidade: filtros.cidade }),
      ...(filtros?.estado && { estado: filtros.estado }),
      ...(filtros?.valorMinimo && { valorMinimo: filtros.valorMinimo }),
      ...(filtros?.valorMaximo && { valorMaximo: filtros.valorMaximo }),
      ...(filtros?.contratosMinimo && { contratosMinimo: filtros.contratosMinimo }),
      ...(filtros?.contratosMaximo && { contratosMaximo: filtros.contratosMaximo }),
    },
    baseURL: import.meta.env.VITE_API_URL_EMPRESA,
  })
  return response.data
}