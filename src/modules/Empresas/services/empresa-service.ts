/**
 * Serviços para o módulo de Empresas
 * Integra com a API usando executeWithFallback para resiliência
 */

import { executeWithFallback } from '@/lib/axios'
import { createServiceLogger } from '@/lib/logger'
import type { FiltrosFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'

const logger = createServiceLogger('empresa-service')

import type {
  EmpresaRequest,
  EmpresaResponse,
  AtualizarEmpresaDto,
  PaginacaoEmpresasResponse,
  EmpresaParametros,
  CriarContatoDto,
  AtualizarContatoDto,
  ContatoResponse,
  PaginacaoFornecedoresApi,
} from '../types/empresa'

// ========== FUNÇÕES EXISTENTES (PRESERVADAS) ==========

/**
 * Cadastra uma nova empresa/fornecedor
 */
export async function cadastrarEmpresa(
  dadosEmpresa: EmpresaRequest,
): Promise<EmpresaResponse> {
  logger.info(
    {
      operation: 'cadastrar_empresa',
      empresaData: {
        cnpj: dadosEmpresa.cnpj,
        razaoSocial: dadosEmpresa.razaoSocial,
        hasContacts: dadosEmpresa.contatos.length > 0,
      },
    },
    'Iniciando cadastro de empresa',
  )

  // A API retorna apenas o ID como string, não um objeto
  const response = await executeWithFallback<string>({
    method: 'post',
    url: '/Empresas',
    data: dadosEmpresa,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })

  // Log da resposta da API
  logger.debug(
    {
      operation: 'cadastrar_empresa_response',
      responseStatus: response.status,
      responseDataType: typeof response.data,
      hasValidId: !!response.data,
    },
    'Response da API de cadastro recebida',
  )

  // A API retorna o ID como string simples
  const empresaId = response.data

  if (!empresaId || typeof empresaId !== 'string') {
    logger.error(
      {
        operation: 'cadastrar_empresa_validation',
        receivedValue: empresaId,
        receivedType: typeof empresaId,
        expected: 'string',
      },
      'ID da empresa não é uma string válida',
    )
    throw new Error('API não retornou um ID válido')
  }

  logger.info(
    {
      operation: 'cadastrar_empresa_success',
      empresaId,
    },
    'Empresa cadastrada com sucesso',
  )

  // Construir objeto EmpresaResponse usando dados enviados + ID retornado
  const empresaResponse: EmpresaResponse = {
    id: empresaId,
    cnpj: dadosEmpresa.cnpj,
    razaoSocial: dadosEmpresa.razaoSocial,
    nomeFantasia: null,
    inscricaoEstadual: dadosEmpresa.inscricaoEstadual || null,
    inscricaoMunicipal: dadosEmpresa.inscricaoMunicipal || null,
    endereco: dadosEmpresa.endereco,
    numero: null,
    complemento: null,
    bairro: dadosEmpresa.bairro,
    cidade: dadosEmpresa.cidade,
    estado: dadosEmpresa.estado,
    cep: dadosEmpresa.cep,
    usuarioCadastroId: dadosEmpresa.usuarioCadastroId,
    ativo: true,
    contatos: dadosEmpresa.contatos.map((contato) => ({
      id: `temp-${Date.now()}-${Math.random()}`, // ID temporário para contatos
      nome: contato.nome,
      valor: contato.valor,
      tipo: contato.tipo,
      ativo: true,
    })),
  }

  logger.debug(
    {
      operation: 'cadastrar_empresa_response_built',
      empresaId: empresaResponse.id,
      contatosCount: empresaResponse.contatos.length,
    },
    'Objeto EmpresaResponse construído com sucesso',
  )

  return empresaResponse
}

/**
 * Consulta empresa por CNPJ
 */
export async function consultarEmpresaPorCNPJ(
  cnpj: string,
): Promise<EmpresaResponse | null> {
  try {
    const response = await executeWithFallback<EmpresaResponse>({
      method: 'get',
      url: `/Empresas/cnpj/${cnpj}`,
      baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
    })
    return response.data
  } catch (error) {
    // Se retornar 404, significa que a empresa não foi encontrada
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number } }
      if (axiosError.response.status === 404) {
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
  parametros?: EmpresaParametros,
): Promise<PaginacaoEmpresasResponse> {
  const response = await executeWithFallback<PaginacaoEmpresasResponse>({
    method: 'get',
    url: '/Empresas',
    params: {
      pagina: parametros?.pagina ?? 1,
      tamanhoPagina: parametros?.tamanhoPagina ?? 10,
      ...parametros,
    },
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
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
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })
  return response.data
}

/**
 * Atualiza empresa existente
 * PUT /api/Empresas/{id}
 */
export async function updateEmpresa(
  id: string,
  dados: AtualizarEmpresaDto,
): Promise<EmpresaResponse> {
  const response = await executeWithFallback<EmpresaResponse>({
    method: 'put',
    url: `/Empresas/${id}`,
    data: dados,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
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
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })
}

/**
 * Busca status de empresas
 * GET /api/Empresas/status
 */
export async function getEmpresasStatus(): Promise<Record<string, number>> {
  const response = await executeWithFallback<Record<string, number>>({
    method: 'get',
    url: '/Empresas/status',
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
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
  contato: CriarContatoDto,
): Promise<ContatoResponse> {
  const response = await executeWithFallback<ContatoResponse>({
    method: 'post',
    url: `/empresas/${empresaId}/contatos`,
    data: contato,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
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
  contato: AtualizarContatoDto,
): Promise<ContatoResponse> {
  const response = await executeWithFallback<ContatoResponse>({
    method: 'put',
    url: `/empresas/${empresaId}/contatos/${contatoId}`,
    data: contato,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })
  return response.data
}

/**
 * Exclui contato
 * DELETE /api/empresas/{empresaId}/contatos/{contatoId}
 */
export async function deleteContato(
  empresaId: string,
  contatoId: string,
): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/empresas/${empresaId}/contatos/${contatoId}`,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })
}

// ========== SERVIÇOS PARA FORNECEDORES RESUMO ==========

/**
 * Lista fornecedores com resumo de contratos
 * GET /api/empresas/resumo-contratos
 */
export async function getFornecedoresResumo(
  filtros?: FiltrosFornecedorApi,
): Promise<PaginacaoFornecedoresApi> {
  const params = {
    pagina: filtros?.pagina ?? 1,
    tamanhoPagina: filtros?.tamanhoPagina ?? 10,
    ...(filtros?.cnpj && { cnpj: filtros.cnpj }),
    ...(filtros?.razaoSocial && { razaoSocial: filtros.razaoSocial }),
    ...(filtros?.status && { status: filtros.status }),
    ...(filtros?.cidade && { cidade: filtros.cidade }),
    ...(filtros?.estado && { estado: filtros.estado }),
    ...(filtros?.valorMinimo && { valorMinimo: filtros.valorMinimo }),
    ...(filtros?.valorMaximo && { valorMaximo: filtros.valorMaximo }),
    ...(filtros?.contratosMinimo && {
      contratosMinimo: filtros.contratosMinimo,
    }),
    ...(filtros?.contratosMaximo && {
      contratosMaximo: filtros.contratosMaximo,
    }),
  }

  const response = await executeWithFallback<PaginacaoFornecedoresApi>({
    method: 'get',
    url: '/empresas/resumo-contratos',
    params,
    baseURL: import.meta.env.VITE_API_URL_EMPRESA as string,
  })

  return response.data
}
