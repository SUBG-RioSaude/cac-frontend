export interface Contrato {
    id: string
    numeroContrato: string
    numeroCCon?: string
    contratada: {
      razaoSocial: string
      cnpj: string
    }
    valor: number
    dataInicial: string
    dataFinal: string
    status: 'ativo' | 'vencendo' | 'vencido' | 'suspenso' | 'encerrado'
    unidade: string
    objeto: string
  }
  
  export interface FiltrosContrato {
    status?: string[]
    dataInicialDe?: string
    dataInicialAte?: string
    dataFinalDe?: string
    dataFinalAte?: string
    valorMinimo?: number
    valorMaximo?: number
    unidade?: string[]
  }
  
  export interface PaginacaoParams {
    pagina: number
    itensPorPagina: number
    total: number
  }
  