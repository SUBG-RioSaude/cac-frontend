export type TipoAditivo = 
  | 'prazo'
  | 'qualitativo' 
  | 'repactuacao'
  | 'quantidade'
  | 'reajuste'
  | 'repactuacao_reequilibrio'

export interface AlteracaoContratualForm {
  // Campos obrigatórios
  tipoAditivo: TipoAditivo
  dataSolicitacao: string
  justificativa: string
  dataAutorizacao: string
  manifestacaoTecnica: string
  novaVigencia: string
  valorAjustado: number
  
  // Campos auxiliares para UI
  id?: string
  contratoId?: string
  status?: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada'
  criadoEm?: string
  atualizadoEm?: string
  criadoPor?: string
}

export interface TipoAditivoConfig {
  tipo: TipoAditivo
  label: string
  descricao: string
  icone: string
  cor: string
  exemplos: string[]
}

export interface AlteracaoContratualState {
  alteracoes: AlteracaoContratualForm[]
  alteracaoAtual: Partial<AlteracaoContratualForm> | null
  etapaAtual: number
  isLoading: boolean
  errors: Record<string, string>
}

export const TIPOS_ADITIVO_CONFIG: Record<TipoAditivo, TipoAditivoConfig> = {
  prazo: {
    tipo: 'prazo',
    label: 'Aditivo - Prazo',
    descricao: 'Extensão ou redução do período de vigência do contrato',
    icone: 'Calendar',
    cor: 'blue',
    exemplos: ['Prorrogação por 12 meses', 'Extensão de prazo de execução']
  },
  qualitativo: {
    tipo: 'qualitativo',
    label: 'Aditivo - Qualitativo',
    descricao: 'Alterações nas especificações técnicas ou escopo',
    icone: 'FileText',
    cor: 'green',
    exemplos: ['Mudança de especificação', 'Alteração no escopo do projeto']
  },
  repactuacao: {
    tipo: 'repactuacao',
    label: 'Repactuação',
    descricao: 'Revisão de preços por desequilíbrio econômico-financeiro',
    icone: 'TrendingUp',
    cor: 'orange',
    exemplos: ['Revisão por alteração de custos', 'Reequilíbrio econômico']
  },
  quantidade: {
    tipo: 'quantidade',
    label: 'Aditivo - Quantidade',
    descricao: 'Alteração nas quantidades contratadas',
    icone: 'Package',
    cor: 'purple',
    exemplos: ['Acréscimo de 25% no quantitativo', 'Redução de itens']
  },
  reajuste: {
    tipo: 'reajuste',
    label: 'Reajuste',
    descricao: 'Aplicação de índices de reajuste de preços',
    icone: 'Calculator',
    cor: 'yellow',
    exemplos: ['Aplicação do IPCA', 'Reajuste anual por índice']
  },
  repactuacao_reequilibrio: {
    tipo: 'repactuacao_reequilibrio',
    label: 'Repactuação e Reequilíbrio',
    descricao: 'Combinação de repactuação com reequilíbrio econômico',
    icone: 'Scale',
    cor: 'red',
    exemplos: ['Revisão completa de preços', 'Ajuste por múltiplos fatores']
  }
}