import { executeWithFallback } from '@/lib/axios'
import type { 
  Contrato, 
  ContratoDetalhado,
  CriarContratoPayload
} from '@/modules/Contratos/types/contrato'


export type ContratoParametros = {
  pagina?: number;
  tamanhoPagina?: number;
  filtroStatus?: string; // ex: "ativo,vencendo"
  dataInicialDe?: string; // iso date yyyy-mm-dd
  dataInicialAte?: string;
  dataFinalDe?: string;
  dataFinalAte?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  empresaId?: string; // uuid
  unidadeSaudeId?: string; // uuid
  termoPesquisa?: string; // pesquisa em múltiplos campos
}


export interface PaginacaoResponse<T> {
  dados: T[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}




export async function getContratos (
  filtros: ContratoParametros
): Promise<PaginacaoResponse<Contrato>> {
  const response = await executeWithFallback<PaginacaoResponse<Contrato> | { dados: Contrato[] }>({ 
    method: 'get',
    url: '/contratos',
    params: filtros
  })

  // Normalizar resposta da API
  // Se a API retorna { "dados": [...] } sem metadados de paginação
  if (response.data && 'dados' in response.data && Array.isArray(response.data.dados)) {
    const dados = response.data.dados as Contrato[]
    
    // Usar metadados de paginação se existirem, senão criar defaults
    const paginatedResponse: PaginacaoResponse<Contrato> = {
      dados,
      paginaAtual: ('paginaAtual' in response.data ? response.data.paginaAtual : filtros.pagina) || 1,
      tamanhoPagina: ('tamanhoPagina' in response.data ? response.data.tamanhoPagina : filtros.tamanhoPagina) || dados.length,
      totalRegistros: ('totalRegistros' in response.data ? response.data.totalRegistros : dados.length) || dados.length,
      totalPaginas: ('totalPaginas' in response.data ? response.data.totalPaginas : 1) || 1,
      temProximaPagina: ('temProximaPagina' in response.data ? response.data.temProximaPagina : false) || false,
      temPaginaAnterior: ('temPaginaAnterior' in response.data ? response.data.temPaginaAnterior : false) || false
    }
    
    return paginatedResponse
  }

  // Se já está no formato esperado, retornar como está
  if (response.data && 'dados' in response.data && 'totalRegistros' in response.data) {
    return response.data as PaginacaoResponse<Contrato>
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
      temPaginaAnterior: false
    }
  }

  throw new Error('Formato de resposta da API não reconhecido')
}


// Função para buscar contrato detalhado por ID
export async function getContratoDetalhado(id: string): Promise<ContratoDetalhado> {
  console.log('🔍 getContratoDetalhado chamado para ID:', id)
  
  const response = await executeWithFallback<Contrato>({
    method: 'get',
    url: `/contratos/${id}`
  })

  console.log('✅ API Response recebida:', response.data)

  // TEMPORÁRIO: bypass do mapeamento complexo para debug
  if (!response.data) {
    console.error('❌ Response.data é null/undefined')
    throw new Error('Dados não recebidos da API')
  }

  // Mapeamento simplificado temporário
  const contratoSimples: Record<string, unknown> = {
    ...response.data,
    numeroContrato: response.data.numeroContrato || response.data.id || 'Sem número',
    objeto: response.data.descricaoObjeto || response.data.objeto || 'Sem descrição',
    dataInicio: response.data.vigenciaInicial,
    dataTermino: response.data.vigenciaFinal,
    valorTotal: response.data.valorGlobal,
    
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
        cep: ''
      }
    },
    unidades: {
      demandante: response.data.unidadeDemandante || 'Não informado',
      gestora: response.data.unidadeGestora || 'Não informado',
      vinculadas: [],
    },
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
  
  console.log('📦 Contrato simplificado criado:', contratoSimples)
  
  return contratoSimples as unknown as ContratoDetalhado
}

/**
 * Criar novo contrato
 */
export async function criarContrato(payload: CriarContratoPayload): Promise<Contrato> {
  console.log('🚀 [SERVIÇO] Criando contrato com payload:', payload)
  
  try {
    const response = await executeWithFallback<Contrato>({
      method: 'post',
      url: '/Contratos', // Endpoint da API para criação
      data: payload
    })

    console.log('✅ [SERVIÇO] Contrato criado com sucesso:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('❌ [SERVIÇO] Erro ao criar contrato:', error)
    console.error('❌ [SERVIÇO] Detalhes do erro:', {
      status: (error as { response?: { status?: number } })?.response?.status,
      statusText: (error as { response?: { statusText?: string } })?.response?.statusText,
      data: (error as { response?: { data?: unknown } })?.response?.data,
      message: (error as { message?: string })?.message
    })
    
    // Extrair mensagem específica do backend se disponível
    let errorMessage = 'Erro ao criar contrato'
    
    const errorResponse = error as { response?: { data?: { message?: string; erros?: string[]; errors?: string[]; title?: string }; status?: number } }
    
    if (errorResponse?.response?.data?.message) {
      errorMessage = errorResponse.response.data.message
    } else if (errorResponse?.response?.data?.erros && Array.isArray(errorResponse.response.data.erros)) {
      errorMessage = errorResponse.response.data.erros.join(', ')
    } else if (errorResponse?.response?.data?.errors && Array.isArray(errorResponse.response.data.errors)) {
      errorMessage = errorResponse.response.data.errors.join(', ')
    } else if (errorResponse?.response?.data?.title) {
      errorMessage = errorResponse.response.data.title
    } else if (errorResponse?.response?.status === 409) {
      errorMessage = 'Já existe um contrato com este número ou dados duplicados'
    } else if (errorResponse?.response?.status === 400) {
      errorMessage = 'Dados inválidos fornecidos. Verifique se todos os campos obrigatórios estão preenchidos corretamente.'
    } else if (errorResponse?.response?.status === 422) {
      errorMessage = 'Dados não processáveis. Verifique a validação dos campos.'
    }
    
    // Criar erro customizado com mensagem específica
    const customError = new Error(errorMessage)
    customError.name = 'ContratoCreationError'
    ;(customError as any).status = errorResponse?.response?.status
    ;(customError as any).originalError = error
    
    throw customError
  }
}

/**
 * Função helper para calcular prazo em meses entre duas datas
 */
export function calcularPrazoMeses(vigenciaInicial: string, vigenciaFinal: string): number {
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
