import { executeWithFallback } from '@/lib/axios'
import type {
  Contrato,
  ContratoDetalhado,
  CriarContratoPayload,
  CriarContratoPayloadLegado,
} from '@/modules/Contratos/types/contrato'
import { transformLegacyPayloadToNew } from '@/modules/Contratos/types/contrato'
import { createServiceLogger } from '@/lib/logger'

const logger = createServiceLogger('contratos-service')

export type ContratoParametros = {
  pagina?: number
  tamanhoPagina?: number
  filtroStatus?: string // ex: "ativo,vencendo"
  dataInicialDe?: string // iso date yyyy-mm-dd
  dataInicialAte?: string
  dataFinalDe?: string
  dataFinalAte?: string
  valorMinimo?: number
  valorMaximo?: number
  empresaId?: string // uuid
  unidadeSaudeId?: string // uuid
  termoPesquisa?: string // pesquisa em múltiplos campos
}

export interface PaginacaoResponse<T> {
  dados: T[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

export async function getContratos(
  filtros: ContratoParametros,
): Promise<PaginacaoResponse<Contrato>> {
  const response = await executeWithFallback<
    PaginacaoResponse<Contrato> | { dados: Contrato[] }
  >({
    method: 'get',
    url: '/contratos',
    params: filtros,
  })

  // Normalizar resposta da API
  // Se a API retorna { "dados": [...] } sem metadados de paginação
  if (
    response.data &&
    'dados' in response.data &&
    Array.isArray(response.data.dados)
  ) {
    const dados = response.data.dados

    // Usar metadados de paginação se existirem, senão criar defaults
    const paginatedResponse: PaginacaoResponse<Contrato> = {
      dados,
      paginaAtual:
        ('paginaAtual' in response.data
          ? response.data.paginaAtual
          : filtros.pagina) || 1,
      tamanhoPagina:
        ('tamanhoPagina' in response.data
          ? response.data.tamanhoPagina
          : filtros.tamanhoPagina) || dados.length,
      totalRegistros:
        ('totalRegistros' in response.data
          ? response.data.totalRegistros
          : dados.length) || dados.length,
      totalPaginas:
        ('totalPaginas' in response.data ? response.data.totalPaginas : 1) || 1,
      temProximaPagina:
        ('temProximaPagina' in response.data
          ? response.data.temProximaPagina
          : false) || false,
      temPaginaAnterior:
        ('temPaginaAnterior' in response.data
          ? response.data.temPaginaAnterior
          : false) || false,
    }

    return paginatedResponse
  }

  // Se já está no formato esperado, retornar como está
  if (
    response.data &&
    'dados' in response.data &&
    'totalRegistros' in response.data
  ) {
    return response.data
  }

  // Fallback para array direto (caso a API mude no futuro)
  if (Array.isArray(response.data)) {
    return {
      dados: response.data as Contrato[],
      paginaAtual: 1,
      tamanhoPagina: response.data.length,
      totalRegistros: response.data.length,
      totalPaginas: 1,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  }

  throw new Error('Formato de resposta da API não reconhecido')
}

/**
 * Verifica se um número de contrato já existe na base de dados
 * @param numeroContrato - Número do contrato a ser verificado
 * @returns Contrato existente ou null se não encontrado
 */
export async function getContratoByNumero(
  numeroContrato: string,
): Promise<Contrato | null> {
  try {
    const response = await executeWithFallback<Contrato>({
      method: 'get',
      url: `/contratos/numero/${numeroContrato}`,
      baseURL: import.meta.env.VITE_API_URL_CONTRATOS,
    })

    return response.data
  } catch (error: unknown) {
    // 404 significa que o número está disponível (não é erro)
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response &&
      'status' in error.response &&
      error.response.status === 404
    ) {
      return null
    }

    // Re-throw outros erros para tratamento no hook
    throw error
  }
}

// Função para buscar contrato detalhado por ID
export async function getContratoDetalhado(
  id: string,
): Promise<ContratoDetalhado> {
  const response = await executeWithFallback<Contrato>({
    method: 'get',
    url: `/contratos/${id}`,
  })

  // TEMPORÁRIO: bypass do mapeamento complexo para debug
  if (!response.data) {
    logger.error(
      {
        responseStatus: response.status,
        responseHeaders: response.headers,
        operation: 'buscar_contratos',
      },
      'Response.data é null/undefined na busca de contratos',
    )
    throw new Error('Dados não recebidos da API')
  }

  // Mapeamento simplificado temporário
  const contratoSimples: Record<string, unknown> = {
    ...response.data,
    numeroContrato:
      response.data.numeroContrato || response.data.id || 'Sem número',
    objeto:
      response.data.descricaoObjeto || response.data.objeto || 'Sem descrição',
    dataInicio: response.data.vigenciaInicial,
    dataTermino: response.data.vigenciaFinal,
    valorTotal: response.data.valorGlobal,
    empresaId:
      (response.data as { empresaId?: string; contratada?: { id: string } })
        .empresaId ||
      (response.data as { empresaId?: string; contratada?: { id: string } })
        ?.contratada?.id ||
      '',
    // Mapeamento dos novos campos da API
    processoSei: response.data.processoSei,
    processoRio: response.data.processoRio,
    processoLegado: response.data.processoLegado,
    numeroProcesso: response.data.numeroProcesso,
    valorGlobalOriginal: response.data.valorGlobalOriginal || 0,
    vigenciaOriginalInicial: response.data.vigenciaOriginalInicial,
    vigenciaOriginalFinal: response.data.vigenciaOriginalFinal,
    prazoOriginalMeses: response.data.prazoOriginalMeses,

    // Campos obrigatórios com defaults seguros
    responsaveis: {
      fiscaisAdministrativos: [],
      gestores: [],
    },
    fornecedor: {
      razaoSocial: response.data.contratada?.razaoSocial || 'Não informado',
      cnpj: response.data.contratada?.cnpj || '',
      contatos: [],
      endereco: {
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
      },
    },
    // Preservar IDs das unidades para busca posterior de nomes
    unidadeDemandanteId:
      (response.data as { unidadeDemandanteId?: string }).unidadeDemandanteId ||
      response.data.unidadeDemandante,
    unidadeGestoraId:
      (response.data as { unidadeGestoraId?: string }).unidadeGestoraId ||
      response.data.unidadeGestora,
    unidades: {
      demandante: response.data.unidadeDemandante || null, // Será resolvido pelo hook
      gestora: response.data.unidadeGestora || null, // Será resolvido pelo hook
      vinculadas: [],
    },
    // Preservar unidadesResponsaveis da API (nova estrutura)
    unidadesResponsaveis: response.data.unidadesResponsaveis || [],
    alteracoes: [],
    documentos: [],
    documentosChecklist: {
      termoReferencia: { entregue: false },
      homologacao: { entregue: false },
      ataRegistroPrecos: { entregue: false },
      garantiaContratual: { entregue: false },
      contrato: { entregue: false },
      publicacaoPncp: { entregue: false },
      publicacaoExtrato: { entregue: false },
    },
    indicadores: {
      saldoAtual: response.data.valorGlobal,
      percentualExecutado: 0,
      cronogramaVigencia: [],
    },
    // Preservar unidadesVinculadas da API
    unidadesVinculadas: response.data.unidadesVinculadas || [],
  }

  return contratoSimples as unknown as ContratoDetalhado
}

/**
 * Criar novo contrato (versão atualizada com unidadesResponsaveis)
 */
export async function criarContrato(
  payload: CriarContratoPayload,
): Promise<Contrato> {
  try {
    const response = await executeWithFallback<Contrato>({
      method: 'post',
      url: '/Contratos', // Endpoint da API para criação
      data: payload,
    })

    return response.data
  } catch (error: unknown) {
    logger.error(
      {
        operation: 'criar_contrato',
        payloadType: typeof payload,
        status: (error as { response?: { status?: number } })?.response?.status,
        statusText: (error as { response?: { statusText?: string } })?.response
          ?.statusText,
        responseData: (error as { response?: { data?: unknown } })?.response
          ?.data,
        errorMessage: (error as { message?: string })?.message,
        stack: (error as Error)?.stack,
      },
      'Erro ao criar contrato',
    )

    // Extrair mensagem específica do backend se disponível
    let errorMessage = 'Erro ao criar contrato'

    const errorResponse = error as {
      response?: {
        data?: {
          message?: string
          erros?: string[]
          errors?: string[]
          title?: string
        }
        status?: number
      }
    }

    if (errorResponse?.response?.data?.message) {
      errorMessage = errorResponse.response.data.message
    } else if (
      errorResponse?.response?.data?.erros &&
      Array.isArray(errorResponse.response.data.erros)
    ) {
      errorMessage = errorResponse.response.data.erros.join(', ')
    } else if (
      errorResponse?.response?.data?.errors &&
      Array.isArray(errorResponse.response.data.errors)
    ) {
      errorMessage = errorResponse.response.data.errors.join(', ')
    } else if (errorResponse?.response?.data?.title) {
      errorMessage = errorResponse.response.data.title
    } else if (errorResponse?.response?.status === 409) {
      errorMessage = 'Já existe um contrato com este número ou dados duplicados'
    } else if (errorResponse?.response?.status === 400) {
      errorMessage =
        'Dados inválidos fornecidos. Verifique se todos os campos obrigatórios estão preenchidos corretamente.'
    } else if (errorResponse?.response?.status === 422) {
      errorMessage = 'Dados não processáveis. Verifique a validação dos campos.'
    }

    // Criar erro customizado com mensagem específica
    const customError = new Error(errorMessage)
    customError.name = 'ContratoCreationError'
    ;(customError as unknown as Record<string, unknown>).status =
      errorResponse?.response?.status
    ;(customError as unknown as Record<string, unknown>).originalError = error

    throw customError
  }
}

/**
 * Criar novo contrato (versão legado para compatibilidade)
 * Converte automaticamente dados legados para novo formato com unidadesResponsaveis
 */
export async function criarContratoLegado(
  payloadLegado: CriarContratoPayloadLegado,
): Promise<Contrato> {
  // Converter payload legado para novo formato
  const novoPayload = transformLegacyPayloadToNew(payloadLegado)

  // Usar a função principal com o novo formato
  return criarContrato(novoPayload)
}

/**
 * Função helper para calcular prazo em meses entre duas datas
 */
export function calcularPrazoMeses(
  vigenciaInicial: string,
  vigenciaFinal: string,
): number {
  const dataInicial = new Date(vigenciaInicial)
  const dataFinal = new Date(vigenciaFinal)

  if (isNaN(dataInicial.getTime()) || isNaN(dataFinal.getTime())) {
    throw new Error('Datas inválidas fornecidas para cálculo de prazo')
  }

  const diferencaMs = dataFinal.getTime() - dataInicial.getTime()
  const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24))

  // Converter para meses (aproximação)
  return Math.ceil(diferencaDias / 30)
}

/**
 * Função helper para converter data para ISO string
 */
export function converterDataParaISO(data: string | undefined): string {
  // Se data é undefined ou null, retorna string vazia
  if (!data) {
    return ''
  }

  // Se já é ISO string, retorna como está
  if (data.includes('T')) {
    return data
  }

  // Se é apenas data (YYYY-MM-DD), converte para ISO
  const dataObj = new Date(data)
  if (isNaN(dataObj.getTime())) {
    throw new Error(`Data inválida: ${data}`)
  }

  return dataObj.toISOString()
}

/**
 * Função helper para gerar número de contrato único
 */
export function gerarNumeroContratoUnico(): string {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  const timestamp = agora.getTime().toString().slice(-6) // Últimos 6 dígitos do timestamp

  return `CONTRATO-${ano}${mes}${dia}-${timestamp}`
}

/**
 * Buscar contratos vencendo (endpoint específico)
 */
export async function getContratosVencendo(
  diasAntecipados: number = 30,
  filtros?: Omit<
    ContratoParametros,
    'filtroStatus' | 'tamanhoPagina' | 'pagina'
  >,
): Promise<PaginacaoResponse<Contrato>> {
  const parametros = {
    ...filtros,
    diasAntecipados,
  }

  try {
    const response = await executeWithFallback<
      PaginacaoResponse<Contrato> | { dados: Contrato[] }
    >({
      method: 'get',
      url: '/contratos/vencendo',
      params: parametros,
    })

    // Usar mesma lógica de normalização do getContratos
    if (
      response.data &&
      'dados' in response.data &&
      Array.isArray(response.data.dados)
    ) {
      const dados = response.data.dados

      const paginatedResponse: PaginacaoResponse<Contrato> = {
        dados,
        paginaAtual:
          ('paginaAtual' in response.data ? response.data.paginaAtual : 1) || 1,
        tamanhoPagina:
          ('tamanhoPagina' in response.data
            ? response.data.tamanhoPagina
            : dados.length) || dados.length,
        totalRegistros:
          ('totalRegistros' in response.data
            ? response.data.totalRegistros
            : dados.length) || dados.length,
        totalPaginas:
          ('totalPaginas' in response.data ? response.data.totalPaginas : 1) ||
          1,
        temProximaPagina:
          ('temProximaPagina' in response.data
            ? response.data.temProximaPagina
            : false) || false,
        temPaginaAnterior:
          ('temPaginaAnterior' in response.data
            ? response.data.temPaginaAnterior
            : false) || false,
      }

      return paginatedResponse
    }

    // Fallback para resposta já formatada
    if (
      response.data &&
      'dados' in response.data &&
      'totalRegistros' in response.data
    ) {
      return response.data
    }

    // Fallback para array direto
    if (Array.isArray(response.data)) {
      return {
        dados: response.data as Contrato[],
        paginaAtual: 1,
        tamanhoPagina: response.data.length,
        totalRegistros: response.data.length,
        totalPaginas: 1,
        temProximaPagina: false,
        temPaginaAnterior: false,
      }
    }

    // Fallback vazio
    return {
      dados: [],
      paginaAtual: 1,
      tamanhoPagina: 0,
      totalRegistros: 0,
      totalPaginas: 0,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_contratos_vencendo',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar contratos vencendo',
    )
    throw error
  }
}

/**
 * Buscar contratos vencidos (endpoint específico)
 */
export async function getContratosVencidos(
  filtros?: Omit<ContratoParametros, 'tamanhoPagina' | 'pagina'>,
): Promise<PaginacaoResponse<Contrato>> {
  const parametros = {
    ...filtros,
  }

  try {
    const response = await executeWithFallback<
      PaginacaoResponse<Contrato> | { dados: Contrato[] }
    >({
      method: 'get',
      url: '/contratos/vencidos',
      params: parametros,
    })

    // Usar mesma lógica de normalização do getContratos
    if (
      response.data &&
      'dados' in response.data &&
      Array.isArray(response.data.dados)
    ) {
      const dados = response.data.dados

      const paginatedResponse: PaginacaoResponse<Contrato> = {
        dados,
        paginaAtual:
          ('paginaAtual' in response.data ? response.data.paginaAtual : 1) || 1,
        tamanhoPagina:
          ('tamanhoPagina' in response.data
            ? response.data.tamanhoPagina
            : dados.length) || dados.length,
        totalRegistros:
          ('totalRegistros' in response.data
            ? response.data.totalRegistros
            : dados.length) || dados.length,
        totalPaginas:
          ('totalPaginas' in response.data ? response.data.totalPaginas : 1) ||
          1,
        temProximaPagina:
          ('temProximaPagina' in response.data
            ? response.data.temProximaPagina
            : false) || false,
        temPaginaAnterior:
          ('temPaginaAnterior' in response.data
            ? response.data.temPaginaAnterior
            : false) || false,
      }

      return paginatedResponse
    }

    // Fallback para resposta já formatada
    if (
      response.data &&
      'dados' in response.data &&
      'totalRegistros' in response.data
    ) {
      return response.data
    }

    // Fallback para array direto
    if (Array.isArray(response.data)) {
      return {
        dados: response.data as Contrato[],
        paginaAtual: 1,
        tamanhoPagina: response.data.length,
        totalRegistros: response.data.length,
        totalPaginas: 1,
        temProximaPagina: false,
        temPaginaAnterior: false,
      }
    }

    // Fallback vazio
    return {
      dados: [],
      paginaAtual: 1,
      tamanhoPagina: 0,
      totalRegistros: 0,
      totalPaginas: 0,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_contratos_vencidos',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar contratos vencidos',
    )
    throw error
  }
}

/**
 * Buscar contratos por empresa/fornecedor
 */
export async function getContratosPorEmpresa(
  empresaId: string,
  filtros?: Omit<ContratoParametros, 'empresaId'>,
): Promise<PaginacaoResponse<Contrato>> {
  const parametros: ContratoParametros = {
    ...filtros,
    empresaId,
    tamanhoPagina: filtros?.tamanhoPagina || 20,
    pagina: filtros?.pagina || 1,
  }

  try {
    const response = await executeWithFallback<
      PaginacaoResponse<Contrato> | { dados: Contrato[] }
    >({
      method: 'get',
      url: `/contratos/empresa/${empresaId}`,
      params: parametros,
    })

    // Usar mesma lógica de normalização do getContratos
    if (
      response.data &&
      'dados' in response.data &&
      Array.isArray(response.data.dados)
    ) {
      const dados = response.data.dados

      const paginatedResponse: PaginacaoResponse<Contrato> = {
        dados,
        paginaAtual:
          ('paginaAtual' in response.data
            ? response.data.paginaAtual
            : parametros.pagina) || 1,
        tamanhoPagina:
          ('tamanhoPagina' in response.data
            ? response.data.tamanhoPagina
            : parametros.tamanhoPagina) || dados.length,
        totalRegistros:
          ('totalRegistros' in response.data
            ? response.data.totalRegistros
            : dados.length) || dados.length,
        totalPaginas:
          ('totalPaginas' in response.data ? response.data.totalPaginas : 1) ||
          1,
        temProximaPagina:
          ('temProximaPagina' in response.data
            ? response.data.temProximaPagina
            : false) || false,
        temPaginaAnterior:
          ('temPaginaAnterior' in response.data
            ? response.data.temPaginaAnterior
            : false) || false,
      }

      return paginatedResponse
    }

    // Fallback para resposta já formatada
    if (
      response.data &&
      'dados' in response.data &&
      'totalRegistros' in response.data
    ) {
      return response.data
    }

    // Fallback para array direto
    if (Array.isArray(response.data)) {
      return {
        dados: response.data as Contrato[],
        paginaAtual: 1,
        tamanhoPagina: response.data.length,
        totalRegistros: response.data.length,
        totalPaginas: 1,
        temProximaPagina: false,
        temPaginaAnterior: false,
      }
    }

    // Fallback vazio
    return {
      dados: [],
      paginaAtual: 1,
      tamanhoPagina: parametros.tamanhoPagina || 20,
      totalRegistros: 0,
      totalPaginas: 0,
      temProximaPagina: false,
      temPaginaAnterior: false,
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_contratos_empresa',
        empresaId,
        filtros,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar contratos da empresa',
    )
    throw error
  }
}
