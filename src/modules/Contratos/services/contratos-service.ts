import { api } from '@/lib/axios'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { EmpresaRequest, EmpresaResponse } from '@/modules/Contratos/types/empresa'


export type ContratoParametros = {
  pagina?: number;
  tamanhoPagina?: number;
  filtroStatus?: string;
  dataInicialDe?: string;
  dataInicialAte?: string;
  dataFinalDe?: string;
  dataFinalAte?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  empresaId?: string; //uuid
  unidadeSaudeId?: string; //uuid
  termoPesquisa?: string;
  
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
  const {data} = await api.get<PaginacaoResponse<Contrato>>("/Contratos", {
    params: filtros
  })

  return data
}

/**
 * Cadastra uma nova empresa/fornecedor
 */
export async function cadastrarEmpresa(
  dadosEmpresa: EmpresaRequest
): Promise<EmpresaResponse> {
  const { data } = await api.post<EmpresaResponse>("/api/Empresas", dadosEmpresa, {
    baseURL: import.meta.env.VITE_API_URL_EMPRESA
  })
  return data
}

/**
 * Consulta empresa por CNPJ
 */
export async function consultarEmpresaPorCNPJ(
  cnpj: string
): Promise<EmpresaResponse | null> {
  try {
    const { data } = await api.get<EmpresaResponse>(`/api/Empresas/cnpj/${cnpj}`, {
      baseURL: import.meta.env.VITE_API_URL_EMPRESA
    })
    return data
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
