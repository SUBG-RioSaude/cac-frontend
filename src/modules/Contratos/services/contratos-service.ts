import { executeWithFallback } from '@/lib/axios'
import type { Contrato, ContratoDetalhado } from '@/modules/Contratos/types/contrato'


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
  }
  
  console.log('📦 Contrato simplificado criado:', contratoSimples)
  
  return contratoSimples as unknown as ContratoDetalhado
}
