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
  const response = await executeWithFallback<any>({
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
      paginaAtual: response.data.paginaAtual || filtros.pagina || 1,
      tamanhoPagina: response.data.tamanhoPagina || filtros.tamanhoPagina || dados.length,
      totalRegistros: response.data.totalRegistros || dados.length,
      totalPaginas: response.data.totalPaginas || 1,
      temProximaPagina: response.data.temProximaPagina || false,
      temPaginaAnterior: response.data.temPaginaAnterior || false
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

// Função para mapear Contrato da API para ContratoDetalhado
function mapearContratoParaDetalhado(contrato: Contrato): ContratoDetalhado {
  // Calcular dias vigente
  const hoje = new Date()
  const dataInicio = new Date(contrato.vigenciaInicial)
  const diffTime = hoje.getTime() - dataInicio.getTime()
  const diasVigente = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  // Calcular percentual executado baseado nos dados disponíveis
  const percentualExecutado = contrato.valorExecutado 
    ? Math.round((contrato.valorExecutado / contrato.valorGlobal) * 100)
    : 0

  const contratoDetalhado: ContratoDetalhado = {
    // Campos base do Contrato
    ...contrato,
    
    // Campos mapeados/renomeados para compatibilidade
    numeroContrato: contrato.numeroContrato || '',
    objeto: contrato.descricaoObjeto || '',
    dataInicio: contrato.vigenciaInicial,
    dataTermino: contrato.vigenciaFinal,
    valorTotal: contrato.valorGlobal,
    
    // CCon (se disponível)
    ccon: contrato.ccon ? {
      numero: contrato.ccon.numero,
      dataInicio: contrato.ccon.vigenciaInicial,
      dataTermino: contrato.ccon.vigenciaFinal,
    } : undefined,

    // Responsáveis (estrutura padrão)
    responsaveis: {
      fiscaisAdministrativos: contrato.responsaveis?.fiscaisAdministrativos || [],
      gestores: contrato.responsaveis?.gestores || [],
    },

    // Fornecedor (estrutura padrão)
    fornecedor: contrato.fornecedor || {
      razaoSocial: 'Não informado',
      cnpj: '',
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

    // Unidades (estrutura padrão)
    unidades: {
      demandante: contrato.unidades?.demandante || 'Não informado',
      gestora: contrato.unidades?.gestora || 'Não informado',
      vinculadas: contrato.unidades?.vinculadas || [],
    },

    // Alterações (array vazio se não houver)
    alteracoes: contrato.alteracoes || [],

    // Documentos (mapeamento de tipos)
    documentos: contrato.documentos?.map(doc => ({
      ...doc,
      // Garantir compatibilidade com interface legado
    })) || [],

    // Checklist de documentos (estrutura padrão)
    documentosChecklist: contrato.documentosChecklist || {
      termoReferencia: { entregue: false },
      homologacao: { entregue: false },
      ataRegistroPrecos: { entregue: false },
      garantiaContratual: { entregue: false },
      contrato: { entregue: false },
      publicacaoPncp: { entregue: false },
      publicacaoExtrato: { entregue: false },
    },

    // Indicadores calculados
    indicadores: {
      saldoAtual: contrato.valorGlobal - (contrato.valorExecutado || 0),
      percentualExecutado,
      cronogramaVigencia: contrato.indicadores?.cronogramaVigencia || [],
    },
  }

  return contratoDetalhado
}

// Função para buscar contrato detalhado por ID
export async function getContratoDetalhado(id: string): Promise<ContratoDetalhado> {
  const response = await executeWithFallback<Contrato>({
    method: 'get',
    url: `/contratos/${id}`
  })

  // Mapear resposta da API para ContratoDetalhado
  const contratoDetalhado = mapearContratoParaDetalhado(response.data)
  
  return contratoDetalhado
}
