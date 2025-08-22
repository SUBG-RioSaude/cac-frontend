import { executeWithFallback } from '@/lib/axios'
import type { Contrato } from '@/modules/Contratos/types/contrato'


export type ContratoParametros = {
  pagina?: number;
  tamanhoPagina?: number;
  filtroStatus?: string;
  dataInicialDe?: string; // iso date yyyy-mm-dd
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
  const response = await executeWithFallback<PaginacaoResponse<Contrato>>({
    method: 'get',
    url: '/Contratos',
    params: filtros
  })

  return response.data
}
