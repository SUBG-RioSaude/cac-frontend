import { executeWithFallback } from '@/lib/axios'
import { createServiceLogger } from '@/lib/logger'
import type {
  FuncionarioApi,
  LotacaoApi,
  FuncionarioParametros,
  LotacaoParametros,
  FuncionariosPaginacaoResponse,
  LotacoesPaginacaoResponse,
  BuscaFuncionarioResponse,
  BuscaLotacaoResponse,
  FuncionarioCreateApi,
} from '@/modules/Funcionarios/types/funcionario-api'

const logger = createServiceLogger('funcionarios-service')

/**
 * ==========================================
 * SERVIÇOS DA API DE FUNCIONÁRIOS
 * ==========================================
 * Integração com a API de funcionários usando executeWithFallback
 * para resilência e fallback automático
 */

// ========== FUNCIONÁRIOS ==========

/**
 * Buscar funcionários com filtros opcionais
 */
export async function getFuncionarios(
  filtros: FuncionarioParametros = {},
): Promise<FuncionariosPaginacaoResponse> {
  const response = await executeWithFallback<FuncionariosPaginacaoResponse>({
    method: 'get',
    url: '/Funcionarios', // Seguir padrão Pascal case da API
    params: filtros,
  })

  const responseData = response.data

  // Debug: Log da resposta para verificar estrutura
  logger.debug({ responseData }, 'Resposta da API de funcionários')

  // Prioridade 1: Checar a estrutura { sucesso: true, dados: { ... } }
  if (
    typeof responseData === 'object' &&
    'sucesso' in responseData &&
    responseData.sucesso &&
    'dados' in responseData
  ) {
    // Se 'dados' dentro do wrapper tiver a estrutura de paginação, retorna direto
    if (
      typeof responseData.dados === 'object' &&
      'dados' in responseData.dados &&
      Array.isArray((responseData.dados as Record<string, unknown>).dados)
    ) {
      return responseData.dados as unknown as FuncionariosPaginacaoResponse
    }
  }

  // Prioridade 2: Checar se a resposta já é a estrutura de paginação (sem wrapper)
  if (
    typeof responseData === 'object' &&
    'dados' in responseData &&
    Array.isArray(responseData.dados)
  ) {
    if ('totalRegistros' in responseData) {
      return responseData
    }
    // Se for um array de dados sem paginação, monta a estrutura
    const dados = (responseData as Record<string, unknown>)
      .dados as FuncionarioApi[]
    return {
      dados,
      paginaAtual: filtros.pagina ?? 1,
      tamanhoPagina: filtros.tamanhoPagina ?? dados.length,
      totalRegistros: dados.length,
      totalPaginas: 1,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  }

  // Prioridade 3: Checar se a resposta é um array simples de funcionários
  if (Array.isArray(responseData)) {
    const dados = responseData as FuncionarioApi[]
    return {
      dados,
      paginaAtual: 1,
      tamanhoPagina: dados.length,
      totalRegistros: dados.length,
      totalPaginas: 1,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  }

  throw new Error('Formato de resposta da API de funcionários não reconhecido')
}

/**
 * Buscar funcionário por matrícula
 */
export async function getFuncionarioByMatricula(
  matricula: string,
): Promise<BuscaFuncionarioResponse> {
  try {
    const response = await executeWithFallback<FuncionarioApi>({
      method: 'get',
      url: `/Funcionarios/matricula/${matricula}`,
    })

    return {
      encontrado: true,
      funcionario: response.data,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_funcionario_matricula',
        matricula,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      `Erro ao buscar funcionário por matrícula ${matricula}`,
    )
    return {
      encontrado: false,
      erro: 'Funcionário não encontrado ou erro na consulta',
    }
  }
}

/**
 * Buscar funcionário por CPF
 */
export async function getFuncionarioByCpf(
  cpf: string,
): Promise<BuscaFuncionarioResponse> {
  try {
    const response = await executeWithFallback<FuncionarioApi>({
      method: 'get',
      url: `/Funcionarios/cpf/${cpf}`,
    })

    return {
      encontrado: true,
      funcionario: response.data,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_funcionario_cpf',
        cpf: `${cpf.substring(0, 3)  }***`, // Mascarar CPF por segurança
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      `Erro ao buscar funcionário por CPF`,
    )
    return {
      encontrado: false,
      erro: 'Funcionário não encontrado ou erro na consulta',
    }
  }
}

/**
 * Buscar funcionário por ID
 */
export async function getFuncionarioById(id: string): Promise<FuncionarioApi> {
  const response = await executeWithFallback<FuncionarioApi>({
    method: 'get',
    url: `/Funcionarios/${id}`,
  })

  // A função executeWithFallback garante que response.data nunca é undefined

  return response.data
}

// ========== LOTAÇÕES ==========

/**
 * Buscar lotações com filtros opcionais
 */
export async function getLotacoes(
  filtros: LotacaoParametros = {},
): Promise<LotacoesPaginacaoResponse> {
  const response = await executeWithFallback<
    LotacoesPaginacaoResponse | { dados: LotacaoApi[] }
  >({
    method: 'get',
    url: '/Lotacoes',
    params: filtros,
  })

  // Normalizar resposta da API
  if (
    typeof response.data === 'object' &&
    'dados' in response.data &&
    Array.isArray(response.data.dados)
  ) {
    const {dados} = response.data

    // Se tem metadados de paginação, usar eles
    if ('totalRegistros' in response.data) {
      return response.data
    }

    // Senão, criar estrutura padrão
    const paginatedResponse: LotacoesPaginacaoResponse = {
      dados,
      paginaAtual: filtros.pagina ?? 1,
      tamanhoPagina: filtros.tamanhoPagina ?? dados.length,
      totalRegistros: dados.length,
      totalPaginas: 1,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }

    return paginatedResponse
  }

  // Fallback para array direto
  if (Array.isArray(response.data)) {
    return {
      dados: response.data as LotacaoApi[],
      paginaAtual: 1,
      tamanhoPagina: response.data.length,
      totalRegistros: response.data.length,
      totalPaginas: 1,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  }

  throw new Error('Formato de resposta da API de lotações não reconhecido')
}

/**
 * Buscar lotação por código
 */
export async function getLotacaoByCodigo(
  codigo: string,
): Promise<BuscaLotacaoResponse> {
  try {
    const response = await executeWithFallback<LotacaoApi>({
      method: 'get',
      url: `/Lotacoes/codigo/${codigo}`,
    })

    return {
      encontrada: true,
      lotacao: response.data,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_lotacao_codigo',
        codigo,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      `Erro ao buscar lotação por código ${codigo}`,
    )
    return {
      encontrada: false,
      erro: 'Lotação não encontrada ou erro na consulta',
    }
  }
}

/**
 * Buscar lotação por ID
 */
export async function getLotacaoById(id: string): Promise<LotacaoApi> {
  const response = await executeWithFallback<LotacaoApi>({
    method: 'get',
    url: `/Lotacoes/${id}`,
  })

  // A função executeWithFallback garante que response.data nunca é undefined

  return response.data
}

// ========== FUNÇÕES DE BUSCA INTELIGENTE ==========

/**
 * Buscar funcionários por nome (busca parcial)
 */
export async function buscarFuncionariosPorNome(
  nome: string,
  limit = 10,
): Promise<FuncionarioApi[]> {
  const response = await getFuncionarios({
    nome,
    tamanhoPagina: limit,
    ativo: true,
  })

  return response.dados
}

/**
 * Buscar funcionários por lotação
 */
export async function buscarFuncionariosPorLotacao(
  lotacao: string,
  limit = 50,
): Promise<FuncionarioApi[]> {
  const response = await getFuncionarios({
    lotacao,
    tamanhoPagina: limit,
    ativo: true,
  })

  return response.dados
}

/**
 * Buscar lotações por nome (busca parcial)
 */
export async function buscarLotacoesPorNome(
  nome: string,
  limit = 20,
): Promise<LotacaoApi[]> {
  const response = await getLotacoes({
    nome,
    tamanhoPagina: limit,
    ativo: true,
  })

  return response.dados
}

/**
 * Criar novo funcionário
 */
export async function criarFuncionario(
  payload: FuncionarioCreateApi,
): Promise<FuncionarioApi> {
  const response = await executeWithFallback<
    FuncionarioApi | { dados: FuncionarioApi }
  >({
    method: 'post',
    url: '/Funcionarios',
    data: payload,
  })

  // Normalizar possíveis wrappers
  const responseData = response.data as
    | { dados?: FuncionarioApi }
    | FuncionarioApi
  const data =
    typeof responseData === 'object' &&
    'dados' in responseData &&
    responseData.dados
      ? responseData.dados
      : (responseData as FuncionarioApi)

  if (!data.id) {
    // Algumas APIs de cadastro podem não retornar o objeto; nesse caso retornamos o payload mapeado
    return {
      id: '',
      matricula: payload.matricula,
      cpf: payload.cpf,
      nomeCompleto: payload.nomeCompleto,
      emailInstitucional: payload.emailInstitucional,
      telefone: payload.telefone,
      cargo: payload.cargo,
      funcao: payload.funcao,
      situacao: payload.situacao,
      vinculo: payload.vinculo,
      dataAdmissao: payload.dataAdmissao,
      dataExoneracao: payload.dataExoneracao ?? null,
      ativo: payload.situacao === 1,
      lotacaoId: payload.lotacaoId,
      lotacaoNome: '',
      dataCadastro: new Date().toISOString(),
    }
  }

  return data
}
